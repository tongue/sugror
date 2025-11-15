# Arduino Debugging Guide

Guide for debugging the Arduino Uno R4 Minima firmware.

## Problem: Hardware Debugger Not Working

The Arduino Uno R4 Minima supports hardware debugging via OpenOCD, but it requires specific setup and can be unreliable. The error you're seeing indicates OpenOCD can't find the programmer configuration.

**For practical Arduino development, Serial debugging is much more effective and reliable.**

## Serial Debugging (Recommended)

### Enable Debug Mode

1. Open `ArduinoController.ino`
2. Uncomment this line near the top:
   ```cpp
   #define DEBUG
   ```
3. Upload the sketch to your Arduino
4. Open Serial Monitor (set to 9600 baud)

You'll now see detailed debug output like:
```
=== Arduino Controller Started ===
Motor Pin: 7
LED Pin: 10
Initialization complete
READY
[DEBUG] Received command: 'MOTOR_ON'
[DEBUG] Turning motor ON - Pin 7 -> HIGH
[DEBUG] Pin 7 is now: HIGH
OK:MOTOR_ON
```

### Special Debug Command

You can send `DEBUG` command via Serial Monitor to check current status:
```
DEBUG
```

Response:
```
=== DEBUG INFO ===
Motor State: ON
LED Brightness: 0
Motor Pin (7): HIGH
LED Pin (10): 0
=================
```

### Testing with Serial Monitor

1. Open Arduino IDE
2. Tools > Serial Monitor
3. Set baud rate to **9600**
4. Set line ending to **Newline** or **Both NL & CR**
5. Type commands and press Enter:
   - `MOTOR_ON`
   - `MOTOR_OFF`
   - `LED_ON`
   - `LED_OFF`
   - `LED_BRIGHTNESS:128`
   - `DEBUG`

## Testing from Command Line

### Test Motor with Backend Running

**Stop the backend first** (it uses the serial port), then test directly:

#### macOS/Linux:
```bash
# Find your Arduino port
ls /dev/cu.usbmodem*

# Send command using screen
screen /dev/cu.usbmodem101 9600

# Or using echo
echo "MOTOR_ON" > /dev/cu.usbmodem101
```

#### Using Python:
```python
import serial
import time

# Open serial connection
ser = serial.Serial('/dev/cu.usbmodem101', 9600, timeout=1)
time.sleep(2)  # Wait for Arduino to reset

# Send command
ser.write(b'MOTOR_ON\n')

# Read response
response = ser.readline().decode('utf-8').strip()
print(response)  # Should print: OK:MOTOR_ON

ser.close()
```

## Troubleshooting Motor Issues

### 1. Check Pin Output

With debug mode enabled, verify the pin state when you send `MOTOR_ON`:
```
[DEBUG] Pin 7 is now: HIGH
```

If it says HIGH but relay doesn't click, the issue is hardware.

### 2. Test Pin Directly

Simple test sketch to verify Pin 7 works:

```cpp
void setup() {
  pinMode(7, OUTPUT);
  Serial.begin(9600);
  Serial.println("Pin 7 Test");
}

void loop() {
  Serial.println("HIGH");
  digitalWrite(7, HIGH);
  delay(2000);
  
  Serial.println("LOW");
  digitalWrite(7, LOW);
  delay(2000);
}
```

Upload this and watch if:
- Serial Monitor shows HIGH/LOW alternating
- LED on relay module blinks (if relay has indicator)
- Multimeter shows ~5V when HIGH, ~0V when LOW

### 3. Check Relay Wiring

**Relay Module Connections:**
```
Arduino Pin 7  --> Relay IN (or S, or Signal)
Arduino GND    --> Relay GND (or -)
Arduino 5V     --> Relay VCC (or +)
```

**Important:**
- Some relay modules are **active LOW** (trigger when input is LOW, not HIGH)
- Check if your relay module has a jumper for high/low trigger
- Verify relay power LED is on

### 4. Test with Active LOW

If your relay is active LOW, modify the code:

```cpp
void motorOn() {
  digitalWrite(MOTOR_PIN, LOW);   // Active LOW!
  motorState = true;
  Serial.println("OK:MOTOR_ON");
}

void motorOff() {
  digitalWrite(MOTOR_PIN, HIGH);  // Active LOW!
  motorState = false;
  Serial.println("OK:MOTOR_OFF");
}
```

### 5. Check Current Draw

Some relay modules need more current than Arduino can provide from a pin:
- Measure current draw with multimeter
- Arduino pins can provide max ~40mA
- If relay needs more, use a transistor or MOSFET as a switch

## Measuring Pin Output

Use a multimeter:
1. Set to DC voltage (20V range)
2. Black probe to Arduino GND
3. Red probe to Pin 7
4. Send `MOTOR_ON` command
5. Should read ~5V when ON, ~0V when OFF

## Common Issues

### Issue: Relay doesn't click but pin shows HIGH
**Solution:** 
- Relay might need more current → use transistor/MOSFET
- Relay might be active LOW → swap HIGH/LOW in code
- Check relay power supply

### Issue: Pin voltage is correct but relay still doesn't work
**Solution:**
- Bad relay module → test with different relay
- Wrong pin on relay → verify you're connected to signal pin (IN/S)
- Relay needs separate power supply

### Issue: Serial Monitor shows nothing
**Solution:**
- Check baud rate is 9600
- Verify correct port is selected
- Press reset button on Arduino
- Check USB cable (use data cable, not charge-only)

### Issue: Commands work in Serial Monitor but not from backend
**Solution:**
- Close Serial Monitor before running backend (port can only be used by one program)
- Verify backend is using correct serial port
- Check for newline characters in backend commands

## Pin 7 Configuration

Pin 7 is updated in the firmware:
- **Motor Control**: Pin 7 (changed from Pin 9)
- **LED Control**: Pin 10 (unchanged)

Make sure to update your wiring to match!

## Hardware Debugging (Advanced)

If you really need hardware debugging:

1. Install Arduino Debugger:
   ```bash
   # In Arduino IDE
   Tools > Board > Boards Manager
   Search "Arduino UNO R4" → Install
   ```

2. Required files:
   - Debugger config: Usually in `~/.arduino15/packages/arduino/hardware/renesas_uno/`
   - OpenOCD: Comes with Arduino IDE

3. Configure `launch.json` in Arduino IDE debug panel

4. **Note:** This is complex and often doesn't work reliably. Serial debugging is much more practical.

## Recommended Debugging Workflow

1. **Start with Serial Monitor** - Test commands manually
2. **Enable DEBUG mode** - See detailed output
3. **Use multimeter** - Verify actual voltage on pins
4. **Test hardware separately** - Isolate Arduino vs relay issues
5. **Use backend** - Once hardware works in Serial Monitor

## Getting Help

If still stuck, provide this info:
- [ ] Output from Serial Monitor with DEBUG enabled
- [ ] Photo of your wiring
- [ ] Relay module model/specifications
- [ ] Voltage reading from multimeter on Pin 7
- [ ] Does relay work when tested with separate power?

