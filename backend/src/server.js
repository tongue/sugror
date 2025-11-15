const express = require('express');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const multer = require('multer');
const { pipeline } = require('@xenova/transformers');
const fs = require('fs');
const { WaveFile } = require('wavefile');
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
    console.log('Loading Whisper Base model...');
    transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-base.en');
    console.log('Whisper model loaded successfully');
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
      // Audio filters for noise reduction and voice enhancement
      .audioFilters([
        'highpass=f=200',        // Remove low frequency rumble
        'lowpass=f=3000',        // Remove high frequency noise  
        'afftdn=nf=-25',         // Noise reduction
        'loudnorm=I=-16:TP=-1.5:LRA=11',  // Normalize loudness
        'compand=attacks=0.3:decays=0.8:points=-80/-80|-45/-45|-27/-25|0/-7|20/-7' // Compress dynamic range to boost voice
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
    
    // Read the WAV file
    const buffer = fs.readFileSync(wavPath);
    
    // Create a WAV file object
    const wav = new WaveFile();
    wav.fromBuffer(buffer);
    
    // Get the audio samples as Float32Array
    // FFmpeg already made it 16kHz mono, so we just need to extract the samples
    const samples = wav.getSamples();
    
    console.log('Sample type:', typeof samples);
    console.log('Is Array?', Array.isArray(samples));
    console.log('Constructor:', samples?.constructor?.name);
    
    // Convert to Float32Array if needed
    let audioData;
    if (samples instanceof Float32Array) {
      audioData = samples;
    } else if (samples instanceof Float64Array) {
      // Convert Float64 to Float32
      audioData = new Float32Array(samples);
    } else if (samples instanceof Int16Array) {
      // Convert Int16 to Float32 (normalize from -32768/32767 to -1/1)
      audioData = new Float32Array(samples.length);
      for (let i = 0; i < samples.length; i++) {
        audioData[i] = samples[i] / 32768.0;
      }
    } else if (Array.isArray(samples)) {
      // Mono audio - convert array to Float32Array
      audioData = new Float32Array(samples);
    } else if (typeof samples === 'object' && samples !== null) {
      // Might be a typed array we can convert
      audioData = new Float32Array(samples);
    } else {
      console.error('Unexpected sample format:', samples);
      throw new Error('Unexpected audio data format');
    }
    
    console.log('Processed audio data:', audioData.length, 'samples');
    
    // Clean up converted file
    if (wavPath && fs.existsSync(wavPath)) {
      fs.unlinkSync(wavPath);
    }
    
    return audioData;
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

    // Process audio file to get raw audio data
    const audioData = await processAudioFile(filePath);
    
    // Get transcriber and process audio
    const model = await getTranscriber();
    const result = await model(audioData, {
      // Configure to suppress non-speech tokens
      chunk_length_s: 30,
      stride_length_s: 5,
      language: 'english',
      task: 'transcribe',
      // Return raw output to filter non-speech
      return_timestamps: false,
    });
    
    let transcript = result.text.toLowerCase().trim();
    console.log('Raw transcription:', transcript);
    
    // Filter out non-speech markers
    const nonSpeechMarkers = [
      '*', '(', ')', '[', ']', 
      'music', 'applause', 'laughter', 'noise', 
      'silence', 'background', 'mumbling', 'inaudible'
    ];
    
    // Remove non-speech markers
    let cleanTranscript = transcript;
    for (const marker of nonSpeechMarkers) {
      cleanTranscript = cleanTranscript.replace(new RegExp(marker, 'gi'), '');
    }
    cleanTranscript = cleanTranscript.trim();
    
    // If after filtering we have nothing, the recording might be only noise
    if (cleanTranscript.length < 2) {
      console.log('No clear speech detected - only background noise');
      transcript = ''; // Empty transcript indicates no speech
    } else {
      transcript = cleanTranscript;
      console.log('Cleaned transcript:', transcript);
    }

    // Parse command with fuzzy matching for noisy environments
    let command = null;
    
    // Look for "on" related words
    const onKeywords = ['on', 'turn on', 'start', 'go', 'activate', 'enable'];
    const offKeywords = ['off', 'turn off', 'stop', 'deactivate', 'disable'];
    
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

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      transcript: transcript,
      command: command
    });

  } catch (error) {
    console.error('Speech recognition error:', error);
    
    // Clean up file if it exists
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

