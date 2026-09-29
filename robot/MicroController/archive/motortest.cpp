#include <Arduino.h>
#include <TMCStepper.h>
#include <vector>

// Corresponding colors -   Y,  O,  B,  R,  G,  W
const int MOTOR_PINS[6] = {32, 33, 25, 26, 27, 14};

const int DIR_PIN = 21;
const int UART_RX = 16;
const int UART_TX = 17;

bool dir = false;

#define R_SENSE 0.11f	 // BTT TMC2209 sense resistor
#define DRIVER_ADDR 0b00 // every driver: MS1=GND, MS2=GND -> address 0

HardwareSerial SerialTMC(2);
TMC2209Stepper driver(&SerialTMC, R_SENSE, DRIVER_ADDR);

const int STEP_INTERVAL_US = 200;

void setupMotors()
{
	for (int i = 0; i < 6; i++)
	{
		pinMode(MOTOR_PINS[i], OUTPUT);
	}
	pinMode(DIR_PIN, OUTPUT);
}

void setup()
{
	setupMotors();

	SerialTMC.begin(115200, SERIAL_8N1, UART_RX, UART_TX);
	driver.begin();

	driver.toff(5);				  // enable driver
	driver.I_scale_analog(false); // ignore VREF pot, use internal ref so rms_current is honored
	driver.rms_current(900, 0.5); // 900mA run, ~450mA hold (2nd arg = hold fraction)
	driver.microsteps(16);
	driver.en_spreadCycle(false); // stealthChop (quiet)
	driver.pwm_autoscale(true);
	driver.TPOWERDOWN(20); // delay before dropping to hold current after standstill
}

void motorTest(int motorPin, int steps)
{
	digitalWrite(DIR_PIN, dir);
	for (int i = 0; i < steps; i++)
	{
		digitalWrite(motorPin, HIGH);
		delayMicroseconds(5);
		digitalWrite(motorPin, LOW);
		delayMicroseconds(STEP_INTERVAL_US);
	}
}

void loop()
{
	for (int i = 0; i < 6; i++)
	{
		motorTest(MOTOR_PINS[i], 1600);
		delay(100);
	}
	dir = !dir;
}