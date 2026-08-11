#include <Arduino.h>
#include <TMCStepper.h>

// --- TMC2209 write-only broadcast model ---
// All drivers share ONE UART wire and ALL use address 0, so a single
// config write hits every driver at once. We never READ over UART
// (reads would collide when multiple drivers share an address), which
// is fine: writes need no response. STEP is per-motor; DIR + EN shared.
//
// Broadcast test: two drivers, both address 0, one shared config write.
// STEP is per-motor so we can drive each independently and confirm both
// took the config. DIR + EN shared as in the full build.
const int STEP_PIN  = 19;  // D19  motor 1
const int STEP2_PIN = 18;  // D18  motor 2
const int DIR_PIN   = 21;  // D21  (shared across all motors)

// UART2 on the ESP32 -> shared bus to every driver's PDN pin
const int UART_RX = 16;    // RX2  (only used for the bring-up version check)
const int UART_TX = 17;    // TX2 -> [1k] -> PDN

#define R_SENSE 0.11f          // BTT TMC2209 sense resistor
#define DRIVER_ADDR 0b00       // every driver: MS1=GND, MS2=GND -> address 0

HardwareSerial SerialTMC(2);
TMC2209Stepper driver(&SerialTMC, R_SENSE, DRIVER_ADDR);

const int STEP_INTERVAL_US = 500;

void spinFor(int stepPin, unsigned long ms) {
  unsigned long end = millis() + ms;
  while (millis() < end) {
    digitalWrite(stepPin, HIGH);
    delayMicroseconds(5);
    digitalWrite(stepPin, LOW);
    delayMicroseconds(STEP_INTERVAL_US);
  }
}

void setup() {
  Serial.begin(115200);
  delay(200);

  pinMode(STEP_PIN, OUTPUT);
  pinMode(STEP2_PIN, OUTPUT);
  pinMode(DIR_PIN, OUTPUT);

  SerialTMC.begin(115200, SERIAL_8N1, UART_RX, UART_TX);
  driver.begin();

  // Bring-up only: works while a SINGLE driver is on the bus.
  // Remove/ignore once multiple same-address drivers share the wire
  // (their read replies would collide).
  uint8_t ver = driver.version();
  Serial.print("TMC2209 version: 0x");
  Serial.println(ver, HEX);
  Serial.println(ver == 0x21 ? "UART OK" : "UART FAIL - check PDN / 1k / RX-TX / MS pins");

  // --- config: broadcast-safe, all writes ---
  driver.toff(5);                 // enable driver
  driver.I_scale_analog(false);   // ignore VREF pot, use internal ref so rms_current is honored
  driver.rms_current(900, 0.5);   // 900mA run, ~450mA hold (2nd arg = hold fraction)
  driver.microsteps(16);
  driver.en_spreadCycle(false);   // stealthChop (quiet)
  driver.pwm_autoscale(true);
  driver.TPOWERDOWN(20);          // delay before dropping to hold current after standstill
}

void loop() {
  // One motor at a time so you can watch each in isolation.
  // Broadcast-config PASS = BOTH spin strong, including motor 2 with its
  // VREF pot turned down (its strength then proves I_scale_analog(false)
  // reached it over the shared UART). Motor 2 weak/limp = broadcast missed it.
  digitalWrite(DIR_PIN, HIGH);

  Serial.println("motor 1 (D19)");
  spinFor(STEP_PIN, 2000);

  Serial.println("motor 2 (D18) - pot should be turned DOWN");
  spinFor(STEP2_PIN, 2000);
}
