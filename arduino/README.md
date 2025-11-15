# Arduino Firmware

Firmware for Arduino Uno R4 Minima to control motor and LED via serial commands.

## Hardware Setup

### Components Needed

- Arduino Uno R4 Minima board
- LED (any color)
- 220Ω resistor (for LED)
- Relay module OR Motor driver (L298N, L293D, etc.) - for motor control
- DC motor (optional for testing)
- Breadboard and jumper wires
- USB cable for programming and communication

### Pin Connections

#### LED Connection
1. Connect the LED anode (longer leg, +) to a 220Ω resistor
2. Connect the resistor to Arduino **Pin 10**
3. Connect the LED cathode (shorter leg, -) to **GND**

```
Arduino Pin 10 --> 220Ω Resistor --> LED Anode (+)
Arduino GND --> LED Cathode (-)
```

#### Motor Connection (with Relay Module)

**Option 1: Using a Relay Module (Recommended for AC motors or high-current DC motors)**

1. Connect Arduino **Pin 7** to relay module **IN** pin (or **S** for Signal)
2. Connect Arduino **GND** to relay module **GND** (or **-**)
3. Connect Arduino **5V** to relay module **VCC** (or **+**)
4. Connect motor to relay **NO** (Normally Open) and **COM** terminals
5. Connect motor power supply (appropriate voltage for your motor)

```
Arduino Pin 7 --> Relay IN (or S)
Arduino GND --> Relay GND (or -)
Arduino 5V --> Relay VCC (or +)
Motor Lead 1 --> Relay COM
Motor Lead 2 --> Relay NO
Power Supply (+) --> Motor connection
Power Supply (-) --> Motor connection
```

**Note:** Some relay modules are **active LOW** (trigger when signal is LOW). Check your relay module datasheet.

**Option 2: Using a Motor Driver (L298N) - For DC motors**

1. Connect Arduino **Pin 7** to motor driver **IN1**
2. Connect Arduino **GND** to motor driver **GND**
3. Connect motor to motor driver **OUT1** and **OUT2**
4. Connect external power supply to motor driver power input
5. You may need to connect **IN2** to GND for single-direction control

```
Arduino Pin 7 --> L298N IN1
Arduino GND --> L298N GND
Motor (+) --> L298N OUT1
Motor (-) --> L298N OUT2
Battery (+) --> L298N 12V
Battery (-) --> L298N GND
```

### Safety Notes

⚠️ **IMPORTANT SAFETY INFORMATION**

- **Never connect a motor directly to Arduino pins** - This can damage your Arduino!
- Use a relay or motor driver to isolate the Arduino from motor current
- Ensure proper power supply for the motor (separate from Arduino if high current)
- Use appropriate voltage ratings for all components
- Add flyback diodes when using motors to protect against voltage spikes
- Double-check all connections before powering on

## Uploading the Firmware

1. Open Arduino IDE
2. Install board support:
   - Go to **Tools > Board > Boards Manager**
   - Search for "Arduino UNO R4"
   - Install "Arduino UNO R4 Boards"

3. Configure Arduino IDE:
   - Select **Tools > Board > Arduino UNO R4 Boards > Arduino UNO R4 Minima**
   - Select **Tools > Port** and choose the port your Arduino is connected to
     - macOS: `/dev/cu.usbmodem*`
     - Linux: `/dev/ttyACM*` or `/dev/ttyUSB*`
     - Windows: `COM*`

4. Open the sketch:
   - Open `ArduinoController.ino` in Arduino IDE

5. Upload:
   - Click the **Upload** button (→) or press **Ctrl+U** / **Cmd+U**
   - Wait for "Done uploading" message

6. Verify:
   - Open Serial Monitor (**Tools > Serial Monitor**)
   - Set baud rate to **9600**
   - You should see "READY" message

## Testing the Firmware

### Manual Testing via Serial Monitor

Open the Serial Monitor in Arduino IDE and send these commands:

- `MOTOR_ON` - Motor should turn on
- `MOTOR_OFF` - Motor should turn off
- `LED_ON` - LED should turn on at full brightness
- `LED_OFF` - LED should turn off
- `LED_BRIGHTNESS:128` - LED should dim to 50% brightness
- `LED_BRIGHTNESS:255` - LED should be at full brightness
- `DEBUG` - Show current pin states and values

Expected responses:
```
> MOTOR_ON
OK:MOTOR_ON
> LED_BRIGHTNESS:100
OK:LED_BRIGHTNESS:100
> DEBUG
=== DEBUG INFO ===
Motor State: ON
LED Brightness: 100
Motor Pin (7): HIGH
LED Pin (10): 100
=================
```

### Enable Debug Mode

For detailed debugging output, uncomment this line in the sketch:
```cpp
#define DEBUG
```

Then you'll see detailed output:
```
[DEBUG] Received command: 'MOTOR_ON'
[DEBUG] Turning motor ON - Pin 7 -> HIGH
[DEBUG] Pin 7 is now: HIGH
OK:MOTOR_ON
```

See `DEBUGGING.md` for comprehensive debugging guide.

## Serial Protocol

### Baud Rate
9600 bps

### Command Format
Commands are newline-terminated strings (`\n`)

### Commands

| Command | Description | Response |
|---------|-------------|----------|
| `MOTOR_ON` | Turn motor on | `OK:MOTOR_ON` |
| `MOTOR_OFF` | Turn motor off | `OK:MOTOR_OFF` |
| `LED_ON` | Turn LED on (full brightness) | `OK:LED_ON` |
| `LED_OFF` | Turn LED off | `OK:LED_OFF` |
| `LED_BRIGHTNESS:XXX` | Set LED brightness (0-255) | `OK:LED_BRIGHTNESS:XXX` |

### Error Responses
- `ERROR:UNKNOWN_COMMAND` - Command not recognized

## Troubleshooting

### Upload Errors

**Error: Port not found**
- Ensure USB cable is connected
- Check that the correct board and port are selected
- Try a different USB cable or port
- Press the reset button on Arduino and try again

**Error: Permission denied (Linux)**
```bash
sudo usermod -a -G dialout $USER
# Log out and back in
```

### Motor Not Working

1. Check relay/driver connections
2. Verify motor power supply
3. Use a multimeter to check Pin 9 output:
   - Should be ~5V when ON
   - Should be ~0V when OFF
4. Test relay/driver with separate power source
5. Check for proper grounding

### LED Not Working

1. Check LED polarity (+ to resistor, - to GND)
2. Verify resistor value (220Ω recommended)
3. Test LED with separate power source
4. Check Pin 10 with multimeter

### Serial Communication Issues

1. Close Serial Monitor before running backend
2. Verify baud rate is 9600
3. Check USB cable (try data-capable cable, not charge-only)
4. Restart Arduino (press reset button)

## Pin Configuration Reference

```
Pin 7:  Motor Control Output (Digital HIGH/LOW)
Pin 10: LED Control Output (PWM 0-255)
GND:    Common ground for all components
5V:     Power for relay/driver (if needed)
```

## Debugging

If your motor relay isn't working:

1. **Enable debug mode** - Uncomment `#define DEBUG` in the sketch
2. **Check Serial Monitor** - Verify commands are received and pin states
3. **Use multimeter** - Measure voltage on Pin 7 (should be ~5V when ON)
4. **Check relay type** - Some relays are active LOW (need LOW signal to trigger)
5. **Verify wiring** - Ensure Pin 7 → Relay IN, GND → GND, 5V → VCC

See **`DEBUGGING.md`** for detailed troubleshooting steps.

## Modifying the Firmware

### Changing Pin Numbers

Edit these lines in the sketch:
```cpp
const int MOTOR_PIN = 9;   // Change to your desired pin
const int LED_PIN = 10;    // Change to your desired pin
```

### Adding More Devices

1. Define new pins
2. Add initialization in `setup()`
3. Create control functions
4. Add new commands in `processCommand()`

### Example: Adding a Second LED

```cpp
const int LED2_PIN = 11;

void setup() {
  pinMode(LED2_PIN, OUTPUT);
  // ... rest of setup
}

void processCommand(String command) {
  if (command == "LED2_ON") {
    digitalWrite(LED2_PIN, HIGH);
    Serial.println("OK:LED2_ON");
  }
  // ... rest of commands
}
```

