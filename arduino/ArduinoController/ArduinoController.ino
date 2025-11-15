/*
 * Arduino Controller Firmware
 * 
 * Controls motor and LED via serial commands from Node.js backend
 * Compatible with Arduino Uno R4 Minima
 * 
 * Pin Configuration:
 * - Pin 7: Motor control (use with relay or motor driver)
 * - Pin 8: LED control (digital ON/OFF)
 * 
 * Serial Commands:
 * - MOTOR_ON: Turn motor on
 * - MOTOR_OFF: Turn motor off
 * - LED_ON: Turn LED on
 * - LED_OFF: Turn LED off
 * - DEBUG: Show current pin states and values
 * 
 * Responses:
 * - OK:MOTOR_ON
 * - OK:MOTOR_OFF
 * - OK:LED_ON
 * - OK:LED_OFF
 * 
 * Debug Mode:
 * - Uncomment #define DEBUG to enable detailed serial output
 * - See DEBUGGING.md for troubleshooting guide
 */

// Uncomment the line below to enable debug output
// #define DEBUG

// Pin definitions
const int MOTOR_PIN = 7;   // Digital pin for motor control
const int LED_PIN = 8;     // Digital pin for LED control (ON/OFF only)

// State variables
bool motorState = false;
bool ledState = false;

// Serial input buffer
String inputString = "";
bool stringComplete = false;

void setup() {
  // Initialize serial communication at 9600 baud
  Serial.begin(9600);
  
  // Wait for serial to be ready
  while (!Serial) {
    ; // Wait for serial port to connect
  }
  
  // Configure pins as outputs
  pinMode(MOTOR_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  
  // Initialize to OFF state
  digitalWrite(MOTOR_PIN, LOW);
  digitalWrite(LED_PIN, LOW);
  
  // Reserve memory for input string
  inputString.reserve(64);
  
  #ifdef DEBUG
  Serial.println("=== Arduino Controller Started ===");
  Serial.print("Motor Pin: ");
  Serial.println(MOTOR_PIN);
  Serial.print("LED Pin: ");
  Serial.println(LED_PIN);
  Serial.println("Initialization complete");
  #endif
  
  // Send ready message
  Serial.println("READY");
}

void loop() {
  // Read serial data directly in loop (more reliable than serialEvent on R4)
  while (Serial.available() > 0) {
    char inChar = (char)Serial.read();
    
    #ifdef DEBUG
    // Echo the character for debugging
    Serial.print("[DEBUG] Received char: '");
    Serial.print(inChar);
    Serial.print("' (ASCII: ");
    Serial.print((int)inChar);
    Serial.println(")");
    #endif
    
    // Add character to input string
    if (inChar == '\n' || inChar == '\r') {
      if (inputString.length() > 0) {
        stringComplete = true;
        break; // Process the command
      }
    } else {
      inputString += inChar;
    }
  }
  
  // Process complete command
  if (stringComplete) {
    processCommand(inputString);
    
    // Clear the string for next input
    inputString = "";
    stringComplete = false;
  }
}

/*
 * Process incoming serial commands
 */
void processCommand(String command) {
  command.trim(); // Remove whitespace
  
  #ifdef DEBUG
  Serial.print("[DEBUG] Received command: '");
  Serial.print(command);
  Serial.println("'");
  #endif
  
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
  else if (command == "DEBUG") {
    // Special debug command to check status
    Serial.println("=== DEBUG INFO ===");
    Serial.print("Motor State: ");
    Serial.println(motorState ? "ON" : "OFF");
    Serial.print("LED State: ");
    Serial.println(ledState ? "ON" : "OFF");
    Serial.print("Motor Pin (");
    Serial.print(MOTOR_PIN);
    Serial.print("): ");
    Serial.println(digitalRead(MOTOR_PIN) ? "HIGH" : "LOW");
    Serial.print("LED Pin (");
    Serial.print(LED_PIN);
    Serial.print("): ");
    Serial.println(digitalRead(LED_PIN) ? "HIGH" : "LOW");
    Serial.println("=================");
  }
  else {
    // Unknown command
    #ifdef DEBUG
    Serial.print("[DEBUG] Unknown command: ");
    Serial.println(command);
    #endif
    Serial.println("ERROR:UNKNOWN_COMMAND");
  }
}

/*
 * Motor control functions
 */
void motorOn() {
  #ifdef DEBUG
  Serial.print("[DEBUG] Turning motor ON - Pin ");
  Serial.print(MOTOR_PIN);
  Serial.println(" -> HIGH");
  #endif
  
  digitalWrite(MOTOR_PIN, HIGH);
  motorState = true;
  
  #ifdef DEBUG
  Serial.print("[DEBUG] Pin ");
  Serial.print(MOTOR_PIN);
  Serial.print(" is now: ");
  Serial.println(digitalRead(MOTOR_PIN) ? "HIGH" : "LOW");
  #endif
  
  Serial.println("OK:MOTOR_ON");
}

void motorOff() {
  #ifdef DEBUG
  Serial.print("[DEBUG] Turning motor OFF - Pin ");
  Serial.print(MOTOR_PIN);
  Serial.println(" -> LOW");
  #endif
  
  digitalWrite(MOTOR_PIN, LOW);
  motorState = false;
  
  #ifdef DEBUG
  Serial.print("[DEBUG] Pin ");
  Serial.print(MOTOR_PIN);
  Serial.print(" is now: ");
  Serial.println(digitalRead(MOTOR_PIN) ? "HIGH" : "LOW");
  #endif
  
  Serial.println("OK:MOTOR_OFF");
}

/*
 * LED control functions
 */
void ledOn() {
  #ifdef DEBUG
  Serial.print("[DEBUG] Turning LED ON - Pin ");
  Serial.print(LED_PIN);
  Serial.println(" -> HIGH");
  #endif
  
  digitalWrite(LED_PIN, HIGH);
  ledState = true;
  
  #ifdef DEBUG
  Serial.print("[DEBUG] Pin ");
  Serial.print(LED_PIN);
  Serial.print(" is now: ");
  Serial.println(digitalRead(LED_PIN) ? "HIGH" : "LOW");
  #endif
  
  Serial.println("OK:LED_ON");
}

void ledOff() {
  #ifdef DEBUG
  Serial.print("[DEBUG] Turning LED OFF - Pin ");
  Serial.print(LED_PIN);
  Serial.println(" -> LOW");
  #endif
  
  digitalWrite(LED_PIN, LOW);
  ledState = false;
  
  #ifdef DEBUG
  Serial.print("[DEBUG] Pin ");
  Serial.print(LED_PIN);
  Serial.print(" is now: ");
  Serial.println(digitalRead(LED_PIN) ? "HIGH" : "LOW");
  #endif
  
  Serial.println("OK:LED_OFF");
}

