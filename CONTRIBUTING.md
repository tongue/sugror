# Contributing Guide

Thank you for your interest in contributing to the Arduino Controller project!

## Project Structure

```
.
├── arduino/              # Arduino firmware
│   ├── ArduinoController/
│   │   └── ArduinoController.ino
│   ├── README.md
│   └── WIRING_DIAGRAM.md
├── backend/              # Node.js backend server
│   ├── src/
│   │   └── server.js
│   ├── package.json
│   └── README.md
├── mobile/               # React Native iOS app
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── types/
│   │   └── App.tsx
│   ├── ios/
│   ├── package.json
│   └── README.md
└── README.md
```

## Development Setup

1. **Clone the repository**
2. **Setup each component** (see README.md)
3. **Test your changes** before submitting

## Adding New Features

### Adding a New Device (e.g., Servo Motor)

#### 1. Update Arduino Firmware

```cpp
// In ArduinoController.ino
#include <Servo.h>

const int SERVO_PIN = 11;
Servo myServo;

void setup() {
  myServo.attach(SERVO_PIN);
  // ... existing setup
}

void processCommand(String command) {
  if (command.startsWith("SERVO:")) {
    int angle = command.substring(6).toInt();
    setServoAngle(angle);
  }
  // ... existing commands
}

void setServoAngle(int angle) {
  angle = constrain(angle, 0, 180);
  myServo.write(angle);
  Serial.print("OK:SERVO:");
  Serial.println(angle);
}
```

#### 2. Update Backend API

```javascript
// In backend/src/server.js

// Add state
let deviceState = {
  motor: 'off',
  led: 'off',
  ledBrightness: 0,
  servoAngle: 90,  // NEW
  connected: false
};

// Add endpoint
app.post('/api/servo', async (req, res) => {
  const { angle } = req.body;
  
  if (angle === undefined || angle < 0 || angle > 180) {
    return res.status(400).json({
      success: false,
      error: 'Invalid angle. Must be 0-180'
    });
  }

  try {
    await sendCommand(`SERVO:${angle}`);
    res.json({ success: true, angle });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

#### 3. Update Mobile App Types

```typescript
// In mobile/src/types/index.ts
export interface DeviceState {
  motor: 'on' | 'off';
  led: 'on' | 'off';
  ledBrightness: number;
  servoAngle: number;  // NEW
  connected: boolean;
}
```

#### 4. Update API Service

```typescript
// In mobile/src/services/api.ts
async controlServo(angle: number): Promise<void> {
  try {
    const response = await fetch(`${this.baseUrl}/api/servo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ angle }),
    });
    // ... error handling
  } catch (error) {
    console.error('Error controlling servo:', error);
    throw error;
  }
}
```

#### 5. Create UI Component

```typescript
// In mobile/src/components/ServoControl.tsx
import React from 'react';
import { View, Text, Slider } from 'react-native';

interface ServoControlProps {
  angle: number;
  onAngleChange: (angle: number) => void;
  disabled?: boolean;
}

const ServoControl: React.FC<ServoControlProps> = ({
  angle,
  onAngleChange,
  disabled = false,
}) => {
  return (
    <View>
      <Text>Servo Angle: {angle}°</Text>
      <Slider
        minimumValue={0}
        maximumValue={180}
        value={angle}
        onSlidingComplete={onAngleChange}
        disabled={disabled}
      />
    </View>
  );
};

export default ServoControl;
```

#### 6. Update App.tsx

```typescript
// Import and use the new component
import ServoControl from './components/ServoControl';

// Add handler
const handleServoChange = async (angle: number) => {
  try {
    await ApiService.controlServo(angle);
  } catch (error) {
    Alert.alert('Error', 'Failed to control servo');
  }
};

// Add to render
<ServoControl
  angle={deviceState.servoAngle}
  onAngleChange={handleServoChange}
  disabled={!deviceState.connected}
/>
```

## Code Style

### JavaScript/TypeScript
- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Use TypeScript types for all new code
- Use async/await over promises

### Arduino
- Use 2 spaces for indentation
- Use camelCase for functions
- Use UPPER_CASE for constants
- Comment all public functions
- Keep functions small and focused

## Testing

### Testing Arduino Firmware
1. Upload firmware to Arduino
2. Open Serial Monitor (9600 baud)
3. Send test commands manually
4. Verify responses match protocol

### Testing Backend
1. Start backend server
2. Use curl or Postman to test endpoints:
   ```bash
   curl -X POST http://localhost:3000/api/motor \
     -H "Content-Type: application/json" \
     -d '{"state": "on"}'
   ```
3. Check serial communication with Arduino

### Testing Mobile App
1. Test on iOS Simulator (`npm run ios`)
2. Test on physical device (via Expo Go app)
3. Test on Android (`npm run android`)
4. Test with backend disconnected
5. Test with Arduino disconnected
6. Verify error handling

## Documentation

When adding features, update:
- [ ] README.md (if changing setup process)
- [ ] Component-specific README (arduino/backend/mobile)
- [ ] Code comments for complex logic
- [ ] API documentation for new endpoints
- [ ] Wiring diagrams for new hardware

## Pull Request Process

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Update documentation
5. Submit PR with clear description
6. Reference any related issues

## Questions?

Feel free to open an issue for:
- Bug reports
- Feature requests
- Documentation improvements
- Questions about the codebase

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

