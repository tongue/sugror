# Quick Start Guide

Get your Arduino control app up and running in minutes!

## Prerequisites Check

Before starting, ensure you have:

- [ ] Computer (macOS, Windows, or Linux)
- [ ] Arduino Uno R4 Minima board
- [ ] USB cable (data-capable)
- [ ] Node.js installed (v18+)
- [ ] Arduino IDE installed
- [ ] Expo Go app (for physical device testing) or iOS Simulator/Android Emulator
- [ ] LED + 220Ω resistor
- [ ] Relay module (for motor control)

## Step-by-Step Setup

### Step 1: Hardware Assembly (5 minutes)

1. **LED Setup**:
   - Connect LED anode (+, longer leg) to 220Ω resistor
   - Connect resistor to Arduino Pin 10
   - Connect LED cathode (-, shorter leg) to GND

2. **Motor Setup** (optional):
   - Connect relay IN to Arduino Pin 9
   - Connect relay VCC to Arduino 5V
   - Connect relay GND to Arduino GND
   - Connect motor to relay COM and NO terminals

See `arduino/WIRING_DIAGRAM.md` for detailed diagrams.

### Step 2: Upload Arduino Firmware (3 minutes)

1. Open Arduino IDE
2. Install Arduino UNO R4 board support:
   - Tools > Board > Boards Manager
   - Search "Arduino UNO R4" → Install

3. Open `arduino/ArduinoController/ArduinoController.ino`
4. Select: Tools > Board > Arduino UNO R4 Minima
5. Select: Tools > Port > (your Arduino port)
6. Click Upload (→)
7. Wait for "Done uploading"

**Test it**: Open Serial Monitor (9600 baud), type `LED_ON` → LED should light up!

### Step 3: Setup Backend Server (2 minutes)

```bash
cd backend
npm install
```

**Important**: Find your Arduino's serial port:
- Open Arduino IDE
- Go to Tools > Port
- Note the port (e.g., `/dev/cu.usbmodem14101`)

Edit `backend/src/server.js` and update line 14:
```javascript
const SERIAL_PORT = '/dev/cu.usbmodem14101'; // Replace with your port!
```

Start the server:
```bash
npm start
```

You should see:
```
Server running on http://localhost:3000
Serial port /dev/cu.usbmodem14101 opened successfully
```

**Test it**: Open browser to http://localhost:3000/api/status

### Step 4: Setup Mobile App (3 minutes)

```bash
cd mobile
npm install
npm start
```

**For iOS Simulator:**
- Press `i` in the terminal to open iOS simulator

**For Physical iPhone:**
1. Install **Expo Go** from the App Store
2. Edit `mobile/src/services/api.ts` line 8:
   ```typescript
   const API_BASE_URL = 'http://192.168.1.100:3000'; // Use your Mac's IP
   ```
3. Find your Mac's IP: `ipconfig getifaddr en0`
4. Scan the QR code shown in terminal with your iPhone camera
5. App will open in Expo Go

### Step 5: Test Everything! (1 minute)

1. App should show "Connected" status (green dot)
2. Toggle "Motor Control" switch → relay should click
3. Press "LED ON" → LED should light up
4. Adjust brightness slider → LED should dim/brighten

## Troubleshooting Quick Fixes

### Backend won't start - "Cannot find serial port"
- Update `SERIAL_PORT` in `backend/src/server.js`
- Check Arduino is connected
- Close Arduino IDE Serial Monitor

### Mobile app shows "Disconnected"
- Ensure backend is running (`cd backend && npm start`)
- Check IP address in `mobile/src/services/api.ts`
- For simulator: use `localhost:3000`
- For device: use your Mac's IP address

### LED doesn't light up
- Check LED polarity (long leg to resistor)
- Verify resistor is 220Ω
- Test LED with battery
- Check Pin 10 connection

### Motor doesn't work
- Verify relay connections
- Check relay power LED is on
- Test with multimeter on Pin 9 (should be 5V when on)
- Ensure motor has external power supply

## What's Next?

### Customize Your Setup

1. **Change Pin Numbers**: Edit `arduino/ArduinoController/ArduinoController.ino`
2. **Add More Devices**: Follow patterns in firmware and backend
3. **Modify UI**: Edit components in `mobile/src/components/`

### Learn More

- Read `README.md` for comprehensive documentation
- Check `arduino/README.md` for hardware details
- See `backend/README.md` for API documentation
- View `mobile/README.md` for app development info

## Common Use Cases

### Running on Physical iPhone

1. Install Expo Go from App Store
2. Get your Mac's IP: `ipconfig getifaddr en0`
3. Update `mobile/src/services/api.ts` with IP
4. Run `npm start` in mobile folder
5. Scan QR code with iPhone camera
6. App opens in Expo Go

### Multiple Devices

To control multiple devices:
1. Add new pins in Arduino sketch
2. Add new commands in serial protocol
3. Create new API endpoints in backend
4. Add new UI components in mobile app

### Remote Access

For remote access outside your local network:
1. Set up port forwarding on your router
2. Use ngrok or similar tunneling service
3. Update API_BASE_URL in mobile app
4. Consider security (add authentication)

## Need Help?

Check these files:
- **Hardware issues**: `arduino/README.md` and `arduino/WIRING_DIAGRAM.md`
- **Backend issues**: `backend/README.md`
- **Mobile issues**: `mobile/README.md`
- **General overview**: `README.md`

## Development Workflow

### Making Changes

1. **Arduino firmware changes**:
   ```bash
   # Edit ArduinoController.ino
   # Upload via Arduino IDE
   # Restart backend server
   ```

2. **Backend changes**:
   ```bash
   cd backend
   npm run dev  # Auto-restart on changes
   ```

3. **Mobile changes**:
   ```bash
   cd mobile
   npm start    # Expo development server with hot reload
   # Shake device or press 'm' in terminal to open menu
   ```

## Success Checklist

You're all set when:
- [ ] Arduino firmware uploaded successfully
- [ ] Serial Monitor shows "READY"
- [ ] Backend server running without errors
- [ ] Mobile app shows "Connected" status
- [ ] Can toggle motor on/off
- [ ] Can control LED brightness
- [ ] Everything responds in real-time

Congratulations! 🎉 Your Arduino control system is ready!

