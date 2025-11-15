/*
 * Arduino Controller Firmware
 * 
 * Controls motor and LED via serial commands from Node.js backend
 * Compatible with Arduino Uno R4 Minima
 * 
 * Pin Configuration:
 * - Pin 9: Motor control (use with relay or motor driver)
 * - Pin 10: LED control (PWM-capable)
 * 
 * Serial Commands:
 * - MOTOR_ON: Turn motor on
 * - MOTOR_OFF: Turn motor off
 * - LED_ON: Turn LED on at full brightness
 * - LED_OFF: Turn LED off
 * - LED_BRIGHTNESS:XXX: Set LED brightness (0-255)
 * 
 * Responses:
 * - OK:MOTOR_ON
 * - OK:MOTOR_OFF
 * - OK:LED_ON
 * - OK:LED_OFF
 * - OK:LED_BRIGHTNESS:XXX
 */

// Pin definitions
const int MOTOR_PIN = 9;   // PWM-capable pin for motor control
const int LED_PIN = 10;    // PWM-capable pin for LED control

// State variables
bool motorState = false;
int ledBrightness = 0;

// Serial input buffer
String inputString = "";
bool stringComplete = false;

void setup() {
  // Initialize serial communication at 9600 baud
  Serial.begin(9600);
  
  // Configure pins as outputs
  pinMode(MOTOR_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  
  // Initialize to OFF state
  digitalWrite(MOTOR_PIN, LOW);
  analogWrite(LED_PIN, 0);
  
  // Reserve memory for input string
  inputString.reserve(64);
  
  // Send ready message
  Serial.println("READY");
}

void loop() {
  // Check if we have a complete command
  if (stringComplete) {
    processCommand(inputString);
    
    // Clear the string for next input
    inputString = "";
    stringComplete = false;
  }
}

/*
 * Serial event handler - called when data is available
 */
void serialEvent() {
  while (Serial.available()) {
    char inChar = (char)Serial.read();
    
    // Add character to input string
    if (inChar == '\n') {
      stringComplete = true;
    } else {
      inputString += inChar;
    }
  }
}

/*
 * Process incoming serial commands
 */
void processCommand(String command) {
  command.trim(); // Remove whitespace
  
  if (command == "MOTOR_ON") {
    motorOn();
  } 
  else if (command == "MOTOR_OFF") {
    motorOff();
  }
  else if (command == "LED_ON") {
    ledOn();
  }
  else if (command == "LED_OFF") {
    ledOff();
  }
  else if (command.startsWith("LED_BRIGHTNESS:")) {
    // Extract brightness value
    int colonIndex = command.indexOf(':');
    if (colonIndex > 0) {
      String brightnessStr = command.substring(colonIndex + 1);
      int brightness = brightnessStr.toInt();
      
      // Constrain to valid range
      brightness = constrain(brightness, 0, 255);
      setLedBrightness(brightness);
    }
  }
  else {
    // Unknown command
    Serial.println("ERROR:UNKNOWN_COMMAND");
  }
}

/*
 * Motor control functions
 */
void motorOn() {
  digitalWrite(MOTOR_PIN, HIGH);
  motorState = true;
  Serial.println("OK:MOTOR_ON");
}

void motorOff() {
  digitalWrite(MOTOR_PIN, LOW);
  motorState = false;
  Serial.println("OK:MOTOR_OFF");
}

/*
 * LED control functions
 */
void ledOn() {
  ledBrightness = 255;
  analogWrite(LED_PIN, ledBrightness);
  Serial.println("OK:LED_ON");
}

void ledOff() {
  ledBrightness = 0;
  analogWrite(LED_PIN, ledBrightness);
  Serial.println("OK:LED_OFF");
}

void setLedBrightness(int brightness) {
  ledBrightness = constrain(brightness, 0, 255);
  analogWrite(LED_PIN, ledBrightness);
  Serial.print("OK:LED_BRIGHTNESS:");
  Serial.println(ledBrightness);
}

