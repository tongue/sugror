# Arduino Control App

A React Native iOS application for controlling an Arduino Uno R4 Minima board via a Node.js backend server. Control motors and LED lights from your iPhone.

## Architecture

```
React Native (iOS) <-> HTTP/WebSocket <-> Node.js Server <-> USB Serial <-> Arduino Uno R4 Minima
```

## Project Structure

- `mobile/` - React Native iOS application
- `backend/` - Node.js Express server for Arduino communication
- `arduino/` - Arduino firmware (.ino sketch)

## Prerequisites

- **macOS** (for iOS development)
- **Node.js** (v18 or higher recommended)
- **Xcode** (latest version with iOS SDK)
- **Arduino IDE** (for uploading firmware)
- **Arduino Uno R4 Minima** board
- **USB cable** to connect Arduino to your Mac

## Quick Start

### 1. Setup Arduino

1. Open Arduino IDE
2. Load the sketch from `arduino/ArduinoController/ArduinoController.ino`
3. Connect your Arduino Uno R4 Minima via USB
4. Select the correct board and port in Arduino IDE
5. Upload the sketch
6. Note the serial port (e.g., `/dev/cu.usbmodem14101`)

### 2. Setup Backend Server

```bash
cd backend
npm install
npm start
```

The server will start on `http://localhost:3000`

**Configure Serial Port:** Edit `backend/src/server.js` and update the `SERIAL_PORT` constant with your Arduino's port.

### 3. Setup Mobile App

```bash
cd mobile
npm install
cd ios
pod install
cd ..
npm run ios
```

**Configure Backend URL:** If running on a physical device, edit `mobile/src/services/api.ts` and update the `API_BASE_URL` with your Mac's local IP address.

## Hardware Setup

### Pin Connections

- **Motor Control**: Pin 9 (PWM-capable, use with relay or motor driver)
- **LED Control**: Pin 10 (PWM-capable for brightness control)

### Motor Connection

For safety, use a relay module or motor driver (like L298N) between the Arduino and motor:
- Connect Arduino Pin 9 to relay/driver input
- Connect motor to relay/driver output
- Ensure proper power supply for the motor (separate from Arduino if high current)

### LED Connection

- Connect LED anode (+) to Pin 10 through a 220Ω resistor
- Connect LED cathode (-) to GND

## API Documentation

### Backend Endpoints

#### Motor Control
```
POST /api/motor
Body: { "state": "on" | "off" }
```

#### LED Control
```
POST /api/led
Body: { "state": "on" | "off", "brightness": 0-255 }
```

#### Get Status
```
GET /api/status
Response: { "motor": "on"|"off", "led": "on"|"off", "connected": true|false }
```

### WebSocket

Connect to `ws://localhost:3000` for real-time status updates.

## Serial Protocol

Commands sent from backend to Arduino:
- `MOTOR_ON` - Turn motor on
- `MOTOR_OFF` - Turn motor off
- `LED_ON` - Turn LED on at full brightness
- `LED_OFF` - Turn LED off
- `LED_BRIGHTNESS:XXX` - Set LED brightness (0-255)

Arduino responses:
- `OK:MOTOR_ON`
- `OK:MOTOR_OFF`
- `OK:LED_ON`
- `OK:LED_OFF`
- `OK:LED_BRIGHTNESS:XXX`

## Troubleshooting

### Arduino not connecting
- Verify the serial port in backend configuration
- Check USB cable connection
- Ensure no other program is using the serial port
- Try unplugging and replugging the Arduino

### Mobile app can't connect to backend
- Ensure backend server is running
- Check firewall settings
- Verify the IP address in mobile app configuration
- On physical iOS device, use your Mac's local IP (not localhost)

### Motor not responding
- Check wiring connections
- Verify power supply to motor
- Use a multimeter to check Pin 9 output
- Ensure relay/driver is functioning

## Development

### Backend Development
```bash
cd backend
npm run dev  # Runs with nodemon for auto-restart
```

### Mobile Development
```bash
cd mobile
npm run ios  # Launch iOS simulator
```

## License

MIT

