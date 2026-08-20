#include <Arduino.h>
#include <TMCStepper.h>
#include <WiFi.h>
#include <WebServer.h>
#include <ESPmDNS.h>
#include <vector>
#include "secrets.h" // gitignored; defines WIFI_SSID / WIFI_PASSWORD

#pragma region WiFi Stuff

WebServer server(80);

String currStatus = "IDLE";

// Storing moves as strings because ex. move 02 wouldn't work as an int
std::vector<String> movesVector;

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
		currStatus = "ERROR move string is empty";
		return false;
	}
	if (movesStr.length() % 2 != 0)
	{
		currStatus = "ERROR invalid number of characters in move string";
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
			currStatus = "ERROR invalid move detected";
			movesVector.clear();
			return false;
		}
		// push move to movesVector
		movesVector.push_back(movesStr.substring(idx, idx + 2));
		idx += 2;
	}
	String populated = "POPULATED MOVES " + String(movesVector.size());
	currStatus = populated;
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
	send(200, currStatus);
}

void movesResponse()
{
	String body = server.arg("plain");
	Serial.print("got moves: ");
	Serial.println(body);
	if (currStatus.equals("IDLE"))
	{ // only accept a new move list when robot is idle
		currStatus = "PROCESSING MOVES";
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
	currStatus = "IDLE";
	send(200, "reset");
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
	server.begin();
	Serial.println("server up");
}

#pragma endregion

#pragma region Motor Stuff

const int MOTOR_PINS[6] = {32, 33, 25, 26, 27, 14};
const int DIR_PIN = 21;
const int UART_RX = 16;
const int UART_TX = 17; 

bool dir;

void setupMotors()
{
	for (int i = 0; i < 6; i++)
	{
		pinMode(MOTOR_PINS[i], OUTPUT);
	}
	pinMode(DIR_PIN, OUTPUT);
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