#include <Arduino.h>
#include <TMCStepper.h>
#include <WiFi.h>
#include <WebServer.h>
#include <ESPmDNS.h>
#include "secrets.h"   // gitignored; defines WIFI_SSID / WIFI_PASSWORD

WebServer server(80);

String currStatus = "IDLE";

void send(int code, const String& body) {
	server.sendHeader("Access-Control-Allow-Origin", "*");
	server.send(code, "text/plain", body);
}

void statusResponse() {
	send(200, currStatus);
}

void movesResponse() {
	String body = server.arg("plain");
	Serial.print("got moves: ");
	Serial.println(body);
	send(202, "accepted");
	currStatus = "PROCESSING MOVES";
}

void setupWIFI() {
	WiFi.mode(WIFI_STA);
	WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
	Serial.print("Connecting");
	while (WiFi.status() != WL_CONNECTED) {
		delay(300);
		Serial.print(".");
	}
	Serial.println();
	Serial.print("IP: ");
	Serial.println(WiFi.localIP());

	WiFi.setSleep(false);

	if (MDNS.begin("cube")) {
		Serial.println("mDNS: cube.local");
	}
	server.on("/status", HTTP_GET,  statusResponse);
	server.on("/moves",  HTTP_POST, movesResponse);
	server.begin();
	Serial.println("server up");
}

void setup() {
	Serial.begin(115200);
	delay(200);
	setupWIFI();
}

void loop() {
	server.handleClient();
	delay(2);
}