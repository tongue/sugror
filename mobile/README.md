# Arduino Controller - React Native iOS App

Mobile application for controlling Arduino Uno R4 Minima board. Control motors and LEDs from your iPhone.

## Prerequisites

- macOS with Xcode installed
- Node.js (v18 or higher)
- CocoaPods
- iOS Simulator or physical iOS device

## Installation

1. Install dependencies:
```bash
npm install
```

2. Install iOS dependencies:
```bash
cd ios
pod install
cd ..
```

## Configuration

Edit `src/services/api.ts` and update the `API_BASE_URL`:

- **For iOS Simulator**: Use `http://localhost:3000`
- **For Physical Device**: Use your Mac's local IP address (e.g., `http://192.168.1.100:3000`)

To find your Mac's IP address:
```bash
ipconfig getifaddr en0
```

## Running the App

### iOS Simulator
```bash
npm run ios
```

Or specify a device:
```bash
npm run ios -- --simulator="iPhone 15 Pro"
```

### Physical iOS Device

1. Open `ios/ArduinoController.xcworkspace` in Xcode
2. Select your device from the device dropdown
3. Update the bundle identifier and signing team
4. Click Run (⌘R)

## Project Structure

```
src/
├── App.tsx                 # Main app component
├── components/             # UI components
│   ├── MotorControl.tsx   # Motor control switch
│   ├── LedControl.tsx     # LED control buttons
│   └── StatusIndicator.tsx # Connection status
├── services/
│   └── api.ts             # API service for backend communication
└── types/
    └── index.ts           # TypeScript type definitions
```

## Features

- **Motor Control**: Toggle motor on/off with a switch
- **LED Control**: Turn LED on/off and adjust brightness
- **Real-time Status**: WebSocket connection for live updates
- **Connection Monitoring**: Visual indicator of backend connection status

## Troubleshooting

### Build Errors

If you encounter build errors, try:
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

### Cannot Connect to Backend

- Ensure the backend server is running (`cd backend && npm start`)
- Check firewall settings on your Mac
- Verify the IP address in `src/services/api.ts`
- For physical devices, ensure your phone and Mac are on the same Wi-Fi network

### Metro Bundler Issues

Reset Metro cache:
```bash
npm start -- --reset-cache
```

## Development

To enable hot reloading, shake your device or press Cmd+D in the simulator and select "Enable Hot Reloading".

