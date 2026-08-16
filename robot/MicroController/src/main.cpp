#include <Arduino.h>
#include <TMCStepper.h>
#include <WiFi.h>
#include <WebServer.h>
#include <ESPmDNS.h>
#include <vector>
#include "secrets.h" // gitignored; defines WIFI_SSID / WIFI_PASSWORD

WebServer server(80);

String currStatus = "IDLE";

// Storing moves as strings because ex. move 02 wouldn't work as an int
std::vector<String> movesVector;

/// @brief Populate movesVector from string provided by Svelte,
/// moves are transmitted with no seperator, ex. 023143...
/// @param movesStr 
void populateMoves(String movesStr)
{
	movesVector.clear();
	int idx = 0;
	while (idx < movesStr.length() - 2)
	{
		// Ensure move is valid
		try
		{
			int motor = movesStr.charAt(idx) - '0';
			int dir = movesStr.charAt(idx + 1) - '0';
			if (motor > 5 || motor < 0 || dir > 3 || dir < 0)
			{
				throw new std::exception;
			}
		}
		catch (const std::exception &e)
		{
			// Do not automatically clear and reset the moves list, we want to make sure Svelte is
			// aware on the next /status call
			currStatus = "ERROR invalid move detected";
			return;
		}

		// push move to movesVector
		movesVector.push_back(movesStr.substring(idx, idx+2));
		idx++;
	}
	currStatus = "POPULATED MOVES " + movesVector.size();
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
		send(202, "accepted");
		currStatus = "PROCESSING MOVES";
		populateMoves(body);
	}
	else
	{
		send(205, "not accepting moves at this time");
	}
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
	server.on("/moves", HTTP_POST, movesResponse);
	server.begin();
	Serial.println("server up");
}

void setup()
{
	Serial.begin(115200);
	delay(200);
	setupWIFI();
}

void loop()
{
	server.handleClient();
	delay(2);
}