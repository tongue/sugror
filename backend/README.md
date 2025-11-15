# Arduino Controller Backend

Node.js Express server that bridges communication between the React Native mobile app and Arduino Uno R4 Minima via USB serial.

## Installation

```bash
npm install
```

## Configuration

Edit `src/server.js` and update the `SERIAL_PORT` constant with your Arduino's serial port:

```javascript
const SERIAL_PORT = '/dev/cu.usbmodem14101'; // Update this!
```

To find your Arduino's port:
- **macOS**: Check `/dev/cu.usbmodem*` or use Arduino IDE > Tools > Port
- **Linux**: Check `/dev/ttyACM*` or `/dev/ttyUSB*`
- **Windows**: Check COM ports in Device Manager

## Running the Server

### Production Mode
```bash
npm start
```

### Development Mode (with auto-restart)
```bash
npm run dev
```

Server runs on `http://localhost:3000`

## API Endpoints

### POST /api/motor
Control the motor on/off.

**Request Body:**
```json
{
  "state": "on"  // or "off"
}
```

**Response:**
```json
{
  "success": true,
  "state": "on"
}
```

### POST /api/led
Control the LED on/off and brightness.

**Request Body:**
```json
{
  "state": "on",     // or "off"
  "brightness": 255  // 0-255, optional
}
```

**Response:**
```json
{
  "success": true,
  "state": "on",
  "brightness": 255
}
```

### GET /api/status
Get current device status.

**Response:**
```json
{
  "motor": "off",
  "led": "off",
  "ledBrightness": 0,
  "connected": true
}
```

## WebSocket

Connect to `ws://localhost:3000` for real-time status updates.

Messages are sent in JSON format:
```json
{
  "type": "status",
  "data": {
    "motor": "on",
    "led": "off",
    "connected": true
  }
}
```

## Troubleshooting

### Error: Cannot find serial port
- Verify the Arduino is connected via USB
- Check the port name in Arduino IDE
- Update `SERIAL_PORT` in `src/server.js`
- Try unplugging and replugging the Arduino

### Error: Port already in use
- Close Arduino IDE Serial Monitor
- Check if another instance of this server is running
- Kill any process using the port: `lsof -ti:3000 | xargs kill`

### Error: Permission denied
- On Linux, add your user to the dialout group:
  ```bash
  sudo usermod -a -G dialout $USER
  ```
- Log out and back in for changes to take effect

