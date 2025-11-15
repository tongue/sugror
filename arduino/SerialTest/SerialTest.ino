/*
 * Simple Serial Test
 * Tests if serial communication is working
 */

void setup() {
  Serial.begin(9600);
  
  // Wait for serial to be ready
  while (!Serial) {
    ; // Wait for serial port to connect
  }
  
  Serial.println("=== SERIAL TEST ===");
  Serial.println("If you see this, serial communication works!");
  Serial.println("Type anything and press Enter");
  Serial.println("==================");
}

void loop() {
  // Echo back anything received
  if (Serial.available() > 0) {
    String input = Serial.readStringUntil('\n');
    Serial.print("You typed: ");
    Serial.println(input);
  }
  
  // Send a message every 2 seconds
  static unsigned long lastTime = 0;
  unsigned long currentTime = millis();
  
  if (currentTime - lastTime >= 2000) {
    lastTime = currentTime;
    Serial.println("Alive! Type something...");
  }
}

