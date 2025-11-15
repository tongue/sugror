# Arduino Controller - Expo App

Mobile application for controlling Arduino Uno R4 Minima board. Control motors and LEDs from your iPhone.

Built with **Expo** (React Native framework) for easier development and deployment.

## Prerequisites

- Node.js (v18 or higher)
- Expo Go app on your iOS device (available on App Store)
- Or iOS Simulator (requires macOS and Xcode)

## Installation

1. Install dependencies:
```bash
npm install
```

## Configuration

Edit `src/services/api.ts` and update the `API_BASE_URL`:

- **For iOS Simulator**: Use `http://localhost:3000`
- **For Physical iOS Device**: Use your Mac's local IP address (e.g., `http://192.168.1.100:3000`)

To find your Mac's IP address:
```bash
ipconfig getifaddr en0
```

## Running the App

### Start the Development Server
```bash
npm start
```

This will start the Expo development server and show a QR code.

### Run on iOS Simulator
```bash
npm run ios
```

### Run on Physical Device

1. Install **Expo Go** from the App Store on your iPhone
2. Run `npm start`
3. Scan the QR code with your iPhone camera
4. The app will open in Expo Go

**Important for Physical Device:**
- Your iPhone and Mac must be on the same Wi-Fi network
- Update the `API_BASE_URL` in `src/services/api.ts` with your Mac's IP address

### Run on Android (Optional)
```bash
npm run android
```

## Project Structure

```
mobile/
├── App.tsx                  # Main app component
├── src/
│   ├── components/          # UI components
│   │   ├── StatusIndicator.tsx
│   │   ├── MotorControl.tsx
│   │   └── LedControl.tsx
│   ├── services/
│   │   └── api.ts          # API service for backend communication
│   └── types/
│       └── index.ts        # TypeScript type definitions
├── assets/                  # App icons and images
├── package.json
└── app.json                # Expo configuration
```

## Features

- **Motor Control**: Toggle motor on/off with a switch
- **LED Control**: Turn LED on/off and adjust brightness with slider
- **Real-time Status**: WebSocket connection for live updates
- **Connection Monitoring**: Visual indicator of backend connection status
- **Cross-platform**: Works on iOS and Android

## Advantages of Using Expo

- **Easy Setup**: No need for Xcode project configuration
- **Fast Development**: Hot reloading and instant updates
- **Simple Testing**: Test on physical devices via Expo Go app
- **Over-the-Air Updates**: Update your app without app store submission
- **Built-in Components**: Access to camera, sensors, and more

## Building for Production

### Create a Production Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure the project
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### Submit to App Store

```bash
eas submit --platform ios
```

## Troubleshooting

### Cannot Connect to Backend

- Ensure the backend server is running (`cd backend && npm start`)
- Check that your device and Mac are on the same Wi-Fi network
- Verify the IP address in `src/services/api.ts`
- For iOS Simulator: use `localhost:3000`
- For physical device: use your Mac's local IP

### Expo Go App Not Loading

- Check that you're on the same Wi-Fi network
- Try restarting the Expo development server
- Clear cache: `npm start -- --clear`

### Module Not Found Errors

```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm start -- --clear
```

### WebSocket Connection Issues

- Ensure backend WebSocket server is running
- Check firewall settings on your Mac
- Try disabling VPN if connected

## Development Tips

- **Hot Reloading**: Shake your device or press `Cmd+D` in simulator to access dev menu
- **Debug Mode**: Enable "Debug Remote JS" from dev menu
- **Clear Cache**: Run `npm start -- --clear` if you encounter caching issues
- **Logs**: Use `console.log()` - logs appear in the terminal running `npm start`

## Upgrading Expo

```bash
# Upgrade to latest Expo SDK
npx expo install --fix
```

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Go App](https://expo.dev/client)
