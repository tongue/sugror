const express = require('express');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');

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

