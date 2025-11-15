# Wiring Diagrams

Visual guide for connecting components to Arduino Uno R4 Minima.

## LED Connection Diagram

```
                        Arduino Uno R4 Minima
                    ┌─────────────────────────┐
                    │                         │
                    │                         │
                    │                    Pin10├────┐
                    │                         │    │
                    │                         │    │ 220Ω
                    │                     GND ├─┐  │ Resistor
                    │                         │ │  │
                    └─────────────────────────┘ │  │
                                                │  │
                                                │  │
                                                │  └──┐
                                                │     │
                                            ┌───┴───┐ │
                                            │   -   │ │  LED
                                            │  LED  │◄┘
                                            │   +   │
                                            └───────┘

Pin 10 --> 220Ω Resistor --> LED Anode (+, longer leg)
GND --> LED Cathode (-, shorter leg)
```

## Motor Connection with Relay Module

```
                    Arduino Uno R4 Minima
                ┌─────────────────────────┐
                │                         │
                │                    Pin9 ├────────────┐
                │                     5V  ├──────┐     │
                │                     GND ├────┐ │     │
                │                         │    │ │     │
                └─────────────────────────┘    │ │     │
                                               │ │     │
                                               │ │     │
                    Relay Module               │ │     │
                ┌─────────────────────┐        │ │     │
                │                     │        │ │     │
                │  VCC ◄──────────────┼────────┘ │     │
                │  GND ◄──────────────┼──────────┘     │
                │  IN  ◄──────────────┼────────────────┘
                │                     │
                │  COM ├──────────┐   │
                │  NO  ├────┐     │   │
                │  NC  │    │     │   │
                └──────┼────┼─────┼───┘
                       │    │     │
                       │    │     │
                Motor  │    │     │  External
                ┌──────┴┐ ┌─┴─────┴─┐ Power Supply
                │   M   │ │   PWR   │ (appropriate
                │       │ │    +    │  for motor)
                └───────┘ │    -    │
                          └─────────┘

Arduino Pin 9  --> Relay IN
Arduino 5V     --> Relay VCC
Arduino GND    --> Relay GND
Motor Lead 1   --> Relay COM
Motor Lead 2   --> Relay NO
Power (+)      --> Motor circuit
Power (-)      --> Motor circuit (through relay)
```

## Motor Connection with L298N Motor Driver

```
                    Arduino Uno R4 Minima
                ┌─────────────────────────┐
                │                         │
                │                    Pin9 ├────────────┐
                │                     GND ├──────────┐ │
                │                         │          │ │
                └─────────────────────────┘          │ │
                                                     │ │
                    L298N Motor Driver               │ │
                ┌────────────────────────────┐       │ │
                │                            │       │ │
                │  IN1  ◄────────────────────┼───────┼─┘
                │  IN2  (optional - to GND)  │       │
                │  GND  ◄────────────────────┼───────┘
                │                            │
                │  OUT1 ├──────────┐         │
                │  OUT2 ├────┐     │         │
                │       │    │     │         │
                │  12V  ├─┐  │     │         │
                │  GND  ├┐│  │     │         │
                └───────┼┼┼──┼─────┼─────────┘
                        │││  │     │
                  Motor │││  │     │  External Battery
                ┌───────┴┴┴┐ │     │  (7-12V for most
                │    M    │ │     │   DC motors)
                │    +  ◄─┘ │     │
                │    -  ◄───┘     │
                └─────────────────┘
                          │       │
                    ┌─────┴───────┴─────┐
                    │    Battery Pack    │
                    │     + ─────────────┤
                    │     - ─────────────┤
                    └────────────────────┘

Arduino Pin 9  --> L298N IN1
Arduino GND    --> L298N GND
Motor (+)      --> L298N OUT1
Motor (-)      --> L298N OUT2
Battery (+)    --> L298N 12V
Battery (-)    --> L298N GND
```

## Complete Setup (LED + Motor with Relay)

```
                        Arduino Uno R4 Minima
                    ┌─────────────────────────┐
                    │                         │
                    │                    Pin9 ├─────► To Relay IN
                    │                   Pin10 ├─────► To LED (via resistor)
                    │                     5V  ├─────► To Relay VCC
                    │                     GND ├─┬───► To Relay GND
                    │                         │ └───► To LED Cathode
                    └─────────────────────────┘

Connect to computer via USB for:
- Power
- Programming
- Serial communication with backend
```

## Important Notes

### Power Considerations

1. **LED**: Powered directly from Arduino (low current, ~20mA)
2. **Small Relay Module**: Can be powered from Arduino 5V if current draw is low
3. **Motor**: ALWAYS use external power supply
   - Arduino 5V pin can only provide limited current (~500mA max)
   - Motors typically need much more current

### Common Ground

⚠️ **CRITICAL**: Always connect all grounds together:
- Arduino GND
- Relay/Driver GND
- External power supply GND (-)

Without a common ground, the circuit will not work properly!

### Voltage Levels

- Arduino Uno R4 operates at 5V logic
- Relay modules typically work with 5V input
- Motor voltage depends on your specific motor (check motor specs)
- Ensure external power supply matches motor requirements

## Testing Checklist

Before connecting everything:

- [ ] LED polarity correct (longer leg to positive via resistor)
- [ ] Resistor in series with LED (220Ω)
- [ ] Relay/driver power connections correct
- [ ] Common ground established
- [ ] Motor power supply separate from Arduino
- [ ] All connections secure
- [ ] No short circuits
- [ ] Correct pin numbers in firmware

## Breadboard Layout Example

```
                    Breadboard
    ════════════════════════════════════════
    +  Rail (5V from Arduino)
    ════════════════════════════════════════
       │                           │
       ├─── Relay VCC              ├─── (Other +5V needs)
       │
    ════════════════════════════════════════
    -  Rail (GND from Arduino)
    ════════════════════════════════════════
       │                           │
       ├─── Relay GND              ├─── LED Cathode
       │                           │
       └─── Motor Driver GND       └─── (Other GND needs)

    Components in between rails:
    - LED + 220Ω resistor
    - Jumper wires to Arduino pins
```

