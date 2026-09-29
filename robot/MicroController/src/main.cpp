#include <Arduino.h>
#include <TMCStepper.h>
#include <WiFi.h>
#include <WebServer.h>
#include <ESPmDNS.h>
#include <vector>
#include "secrets.h" // gitignored; defines WIFI_SSID / WIFI_PASSWORD

#pragma region WiFi Stuff

WebServer server(80);

enum Status
{
	IDLE,
	ERROR,
	PROCESSING_MOVES,
	POPULATED_MOVES,
	STOPPED
};
volatile Status currStatus = IDLE;
String statusInfo = "";
volatile bool abortFlag = false;

// Storing moves as strings because ex. move 02 wouldn't work as an int
std::vector<String> movesVector;

void setStatus(Status status, String info = "")
{
	if (status == STOPPED)
	{
		abortFlag = true;
	}
	currStatus = status;
	statusInfo = info;
}

String statusToString()
{
	String s;
	switch (currStatus)
	{
	case IDLE:
		s = "IDLE";
		break;
	case ERROR:
		s = "ERROR";
		break;
	case PROCESSING_MOVES:
		s = "PROCESSING MOVES";
		break;
	case POPULATED_MOVES:
		s = "POPULATED MOVES";
		break;
	case STOPPED:
		s = "STOPPED";
		break;
	default:
		s = "ERROR UNHANDLED STATUS";
		break;
	}

	return s + "," + statusInfo;
}

void printMoves()
{
	for (const String &move : movesVector)
	{
		Serial.print(move);
		Serial.print(", ");
	}
	Serial.println();
}

/// @brief Populate movesVector from string provided by Svelte,
/// moves are transmitted with no seperator, ex. 023143...
/// @param movesStr
bool populateMoves(const String &movesStr)
{
	movesVector.clear();
	if (movesStr.length() == 0)
	{
		setStatus(ERROR, "move string is empty");
		return false;
	}
	if (movesStr.length() % 2 != 0)
	{
		setStatus(ERROR, "invalid number of characters in move string");
		return false;
	}
	int idx = 0;
	while (idx < movesStr.length() - 1)
	{
		// Ensure move is valid
		int motor = movesStr.charAt(idx) - '0';
		int dir = movesStr.charAt(idx + 1) - '0';
		if (motor > 5 || motor < 0 || dir > 3 || dir < 0)
		{
			setStatus(ERROR, "invalid move detected");
			movesVector.clear();
			return false;
		}
		// push move to movesVector
		movesVector.push_back(movesStr.substring(idx, idx + 2));
		idx += 2;
	}
	setStatus(POPULATED_MOVES, String(movesVector.size()));
	String populated = "POPULATED MOVES " + String(movesVector.size());
	Serial.println(populated);
	printMoves();
	return true;
}

void send(int code, const String &body)
{
	server.sendHeader("Access-Control-Allow-Origin", "*");
	server.send(code, "text/plain", body);
}

void statusResponse()
{
	send(200, statusToString());
}

void movesResponse()
{
	String body = server.arg("plain");
	Serial.print("got moves: ");
	Serial.println(body);
	if (currStatus == IDLE)
	{ // only accept a new move list when robot is idle
		setStatus(PROCESSING_MOVES);
		bool validMoves = populateMoves(body);
		if (validMoves)
			send(200, "move list accepted with length " + String(movesVector.size()));
		else
			send(400, "invalid moves list");
	}
	else
	{
		send(400, "can only send moves when robot is IDLE");
	}
}

void resetResponse()
{
	movesVector.clear();
	abortFlag = false;
	setStatus(IDLE);
	send(200, "reset");
}

void abortResponse()
{
	abortFlag = true;
	setStatus(STOPPED, "operations were stopped, robot must be reset");
	send(200, "operations aborted");
}

void setupWIFI()
{
	WiFi.mode(WIFI_STA);
	WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
	Serial.print("Connecting");
	while (WiFi.status() != WL_CONNECTED)
	{
		delay(300);
		Serial.print(".");
	}
	Serial.println();
	Serial.print("IP: ");
	Serial.println(WiFi.localIP());

	WiFi.setSleep(false);

	if (MDNS.begin("cube"))
	{
		Serial.println("mDNS: cube.local");
	}
	server.on("/status", HTTP_GET, statusResponse);
	server.on("/reset", HTTP_GET, resetResponse);
	server.on("/moves", HTTP_POST, movesResponse);
	server.on("/abort", HTTP_GET, abortResponse);
	server.begin();
	Serial.println("server up");
}

#pragma endregion

#pragma region Motor Stuff

enum Turn
{
	QUARTER,
	HALF,
	FUll
};

// Corresponding colors -   Y,  O,  B,  R,  G,  W
const int MOTOR_PINS[6] = {32, 33, 25, 26, 27, 14};

const int DIR_PIN = 21;
const int UART_RX = 16;
const int UART_TX = 17;

bool dir;

#define R_SENSE 0.11f	 // BTT TMC2209 sense resistor
#define DRIVER_ADDR 0b00 // every driver: MS1=GND, MS2=GND -> address 0

HardwareSerial SerialTMC(2);
TMC2209Stepper driver(&SerialTMC, R_SENSE, DRIVER_ADDR);

const int STEP_INTERVAL_US = 200; // micro second duration between steps (lower = faster)
const int MICRO_STEPS = 16;

void setupMotors()
{
	for (int i = 0; i < 6; i++)
	{
		pinMode(MOTOR_PINS[i], OUTPUT);
	}
	pinMode(DIR_PIN, OUTPUT);

	SerialTMC.begin(115200, SERIAL_8N1, UART_RX, UART_TX);
	driver.begin();

	driver.toff(5);				  // enable driver
	driver.I_scale_analog(false); // ignore VREF pot, use internal ref so rms_current is honored
	driver.rms_current(900, 0.5); // 900mA run, ~450mA hold (2nd arg = hold fraction)
	driver.microsteps(MICRO_STEPS);
	driver.en_spreadCycle(false); // stealthChop (quiet)
	driver.pwm_autoscale(true);
	driver.TPOWERDOWN(20); // delay before dropping to hold current after standstill
}

void rotateMotor(int motorPin, Turn turn, bool direction)
{
	int steps;
	switch (turn)
	{
	case QUARTER:
		steps = 50 * MICRO_STEPS;
		break;
	case HALF:
		steps = 100 * MICRO_STEPS;
		break;
	case FUll:
		steps = 200 * MICRO_STEPS;
		break;
	default:
		abortFlag = true;
		setStatus(STOPPED, "invalid turn");
		break;
	}

	digitalWrite(DIR_PIN, direction);
	for (int i = 0; i < steps; i++)
	{
		digitalWrite(motorPin, HIGH);
		delayMicroseconds(5);
		digitalWrite(motorPin, LOW);
		delayMicroseconds(STEP_INTERVAL_US);
	}
}

#pragma endregion

void setup()
{
	Serial.begin(115200);
	delay(200);
	setupMotors();
	setupWIFI();
}

void loop()
{
	server.handleClient();
	delay(2);
}