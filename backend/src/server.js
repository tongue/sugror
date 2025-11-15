const express = require('express');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const multer = require('multer');
const { pipeline } = require('@xenova/transformers');
const fs = require('fs');
const wavDecoder = require('wav-decoder');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

ffmpeg.setFfmpegPath(ffmpegPath);

// Configuration
const PORT = 3000;
const SERIAL_PORT = '/dev/cu.usbmodem101'; 
const BAUD_RATE = 9600;

// Application state
let deviceState = {
  motor: 'off',
  led: 'off',
  connected: false
};

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for audio file uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    // Preserve original extension or use .m4a as default
    const ext = file.originalname.split('.').pop() || 'm4a';
    cb(null, `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Initialize Whisper model (lazy loading)
let transcriber = null;
async function getTranscriber() {
  if (!transcriber) {
    console.log('Loading Whisper Medium multilingual model (better trained, ~1.5GB)...');
    console.log('First download will take 3-5 minutes...');
    // Use multilingual medium - often more robust than English-only
    transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-medium');
    console.log('Whisper Medium model loaded successfully');
  }
  return transcriber;
}

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
const wss = new WebSocket.Server({ server });

// WebSocket clients
const wsClients = new Set();

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  wsClients.add(ws);
  
  // Send current state to new client
  ws.send(JSON.stringify({
    type: 'status',
    data: deviceState
  }));

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    wsClients.delete(ws);
  });
});

// Broadcast state to all WebSocket clients
function broadcastState() {
  const message = JSON.stringify({
    type: 'status',
    data: deviceState
  });
  
  wsClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Initialize Serial Port
let serialPort;
let parser;

function initializeSerialPort() {
  try {
    serialPort = new SerialPort({
      path: SERIAL_PORT,
      baudRate: BAUD_RATE,
      autoOpen: false
    });

    parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

    serialPort.open((err) => {
      if (err) {
        console.error('Error opening serial port:', err.message);
        deviceState.connected = false;
        return;
      }
      console.log(`Serial port ${SERIAL_PORT} opened successfully`);
      deviceState.connected = true;
      broadcastState();
    });

    // Handle data from Arduino
    parser.on('data', (data) => {
      console.log('Arduino response:', data.trim());
      handleArduinoResponse(data.trim());
    });

    // Handle serial port errors
    serialPort.on('error', (err) => {
      console.error('Serial port error:', err.message);
      deviceState.connected = false;
      broadcastState();
    });

    // Handle serial port close
    serialPort.on('close', () => {
      console.log('Serial port closed');
      deviceState.connected = false;
      broadcastState();
    });

  } catch (error) {
    console.error('Error initializing serial port:', error.message);
    deviceState.connected = false;
  }
}

// Handle responses from Arduino
function handleArduinoResponse(response) {
  if (response.startsWith('OK:')) {
    const command = response.substring(3);
    
    if (command === 'MOTOR_ON') {
      deviceState.motor = 'on';
    } else if (command === 'MOTOR_OFF') {
      deviceState.motor = 'off';
    } else if (command === 'LED_ON') {
      deviceState.led = 'on';
    } else if (command === 'LED_OFF') {
      deviceState.led = 'off';
    }
    
    broadcastState();
  }
}

// Send command to Arduino
function sendCommand(command) {
  return new Promise((resolve, reject) => {
    if (!serialPort || !deviceState.connected) {
      reject(new Error('Serial port not connected'));
      return;
    }

    serialPort.write(command + '\n', (err) => {
      if (err) {
        console.error('Error writing to serial port:', err.message);
        reject(err);
      } else {
        console.log('Sent command:', command);
        // Give Arduino time to respond
        setTimeout(() => resolve(), 100);
      }
    });
  });
}

// REST API Endpoints

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    connected: deviceState.connected,
    serialPort: SERIAL_PORT
  });
});

// Get device status
app.get('/api/status', (req, res) => {
  res.json(deviceState);
});

// Control motor
app.post('/api/motor', async (req, res) => {
  const { state } = req.body;

  if (!state || !['on', 'off'].includes(state)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid state. Must be "on" or "off"'
    });
  }

  try {
    const command = state === 'on' ? 'MOTOR_ON' : 'MOTOR_OFF';
    await sendCommand(command);
    
    res.json({
      success: true,
      state: state
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Control LED
app.post('/api/led', async (req, res) => {
  const { state } = req.body;

  if (!state || !['on', 'off'].includes(state)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid state. Must be "on" or "off"'
    });
  }

  try {
    const command = state === 'on' ? 'LED_ON' : 'LED_OFF';
    await sendCommand(command);
    
    res.json({
      success: true,
      state: state
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper function to convert audio to WAV format using FFmpeg with noise reduction
function convertToWav(inputPath) {
  return new Promise((resolve, reject) => {
    const outputPath = inputPath + '_converted.wav';
    
    console.log('Converting and enhancing audio:', inputPath);
    
    ffmpeg(inputPath)
      .inputFormat('m4a')
      .toFormat('wav')
      .audioFrequency(16000)
      .audioChannels(1)
      .audioCodec('pcm_s16le')
      // Balanced audio processing - enhance voice without destroying data
      .audioFilters([
        'highpass=f=200',        // Remove low rumble
        'lowpass=f=3500',        // Keep more voice harmonics
        'afftdn=nf=-25',         // Moderate noise reduction
        'volume=2.5',            // Boost volume
        'loudnorm=I=-14:TP=-1.5:LRA=9',  // Normalize loudness
        'compand=attacks=0.2:decays=0.5:points=-80/-80|-50/-45|-30/-25|-10/-10|0/-5' // Balanced compression
      ])
      .on('start', (commandLine) => {
        console.log('FFmpeg command:', commandLine);
      })
      .on('end', () => {
        console.log('Audio processing completed:', outputPath);
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        reject(err);
      })
      .save(outputPath);
  });
}

// Helper function to convert audio to the format Whisper expects
async function processAudioFile(filePath) {
  let wavPath = null;
  try {
    // Convert any audio format to 16kHz mono WAV using FFmpeg
    wavPath = await convertToWav(filePath);
    
    console.log('Reading WAV file:', wavPath);
    
    // Read the WAV file as a buffer
    const buffer = fs.readFileSync(wavPath);
    
    // Decode the WAV file using wav-decoder
    const audioData = await wavDecoder.decode(buffer);
    
    console.log('Decoded audio info:');
    console.log('  - Sample rate:', audioData.sampleRate, 'Hz');
    console.log('  - Channels:', audioData.numberOfChannels);
    console.log('  - Length:', audioData.length, 'samples');
    console.log('  - Duration:', (audioData.length / audioData.sampleRate).toFixed(2), 'seconds');
    
    // Extract the first channel (mono - we already converted to mono with FFmpeg)
    const channelData = audioData.channelData[0];
    
    // Ensure it's Float32Array
    let float32Data;
    if (channelData instanceof Float32Array) {
      float32Data = channelData;
    } else {
      float32Data = new Float32Array(channelData);
    }
    
    console.log('Extracted audio data:', float32Data.length, 'samples as Float32Array');
    console.log('Sample values (first 10):', Array.from(float32Data.slice(0, 10)));
    
    // Clean up converted file
    if (wavPath && fs.existsSync(wavPath)) {
      fs.unlinkSync(wavPath);
    }
    
    return float32Data;
  } catch (error) {
    console.error('Error processing audio file:', error);
    
    // Clean up converted file if it exists
    if (wavPath && fs.existsSync(wavPath)) {
      fs.unlinkSync(wavPath);
    }
    
    throw error;
  }
}

// Speech recognition endpoint
app.post('/api/speech', upload.single('audio'), async (req, res) => {
  let filePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No audio file provided'
      });
    }

    filePath = req.file.path;
    console.log('Received audio file:');
    console.log('  - Path:', filePath);
    console.log('  - Original name:', req.file.originalname);
    console.log('  - MIME type:', req.file.mimetype);
    console.log('  - Size:', req.file.size, 'bytes');

    // Process audio file to get raw audio data in correct format
    const audioData = await processAudioFile(filePath);
    
    // Get transcriber and process audio
    const model = await getTranscriber();
    
    console.log('Starting Whisper transcription...');
    console.log('Sending audio data to Whisper...');
    
    // Send the properly formatted audio data to Whisper
    const result = await model(audioData, {
      language: 'en',
      task: 'transcribe',
    });
    
    console.log('Whisper result:', JSON.stringify(result, null, 2));
    
    let transcript = result.text.toLowerCase().trim();
    console.log('Raw transcription:', transcript);
    
    // Filter out non-speech markers and clean the text
    let cleanTranscript = transcript
      .replace(/\*/g, '')           // Remove asterisks
      .replace(/\([^)]*\)/g, '')    // Remove anything in parentheses
      .replace(/\[[^\]]*\]/g, '')   // Remove anything in brackets
      .replace(/music/gi, '')
      .replace(/applause/gi, '')
      .replace(/laughter/gi, '')
      .replace(/noise/gi, '')
      .replace(/silence/gi, '')
      .replace(/background/gi, '')
      .replace(/mumbling/gi, '')
      .replace(/muffled/gi, '')
      .replace(/inaudible/gi, '')
      .replace(/speaking/gi, '')
      .replace(/dramatic/gi, '')
      .trim();
    
    // If after filtering we have nothing, the recording might be only noise
    if (cleanTranscript.length < 2) {
      console.log('No clear speech detected - only background noise/markers');
      transcript = ''; // Empty transcript indicates no speech
    } else {
      transcript = cleanTranscript;
      console.log('Cleaned transcript:', transcript);
    }

    // Parse command with fuzzy matching for noisy environments
    let command = null;
    
    // Look for "on" related words (including common mishearings)
    const onKeywords = ['on', 'oh', 'turn on', 'start', 'go', 'activate', 'enable'];
    const offKeywords = ['off', 'of', 'turn off', 'stop', 'deactivate', 'disable'];
    
    // More lenient matching - just look for key words
    const hasOn = onKeywords.some(word => transcript.includes(word));
    const hasOff = offKeywords.some(word => transcript.includes(word));
    
    if (hasOn && !hasOff) {
      command = 'on';
      console.log('Detected ON command');
    } else if (hasOff && !hasOn) {
      command = 'off';
      console.log('Detected OFF command');
    } else if (transcript.length > 0) {
      console.log('Could not determine command from transcript');
    }

    // Clean up uploaded file (WAV is already cleaned up in processAudioFile)
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      transcript: transcript,
      command: command
    });

  } catch (error) {
    console.error('Speech recognition error:', error);
    
    // Clean up files if they exist
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Initialize serial port connection
initializeSerialPort();

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
  console.log(`Attempting to connect to Arduino on ${SERIAL_PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  
  if (serialPort && serialPort.isOpen) {
    serialPort.close(() => {
      console.log('Serial port closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

