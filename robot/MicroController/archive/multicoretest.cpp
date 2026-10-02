#include <Arduino.h>

int c1 = 0;
int c2 = 0;

void task1(void *parameters)
{
	for (;;)
	{
		c1++;
		Serial.print("Task 1 counter: ");
		Serial.println(c1);
		vTaskDelay(1000 / portTICK_PERIOD_MS);
	}
}

void task2(void *parameters)
{
	for (;;)
	{
		c2++;
		Serial.print("Task 2 counter: ");
		Serial.println(c2);
		vTaskDelay(500 / portTICK_PERIOD_MS);
	}
}

void setup()
{
	Serial.begin(115200);
	xTaskCreatePinnedToCore(
		task1,	  // function name
		"Task 1", // task name
		1000,	  // stack size
		NULL,	  // task parameters
		1,		  // task priority
		NULL,	  // task handle
		0		  // core
	);
	xTaskCreatePinnedToCore(
		task2,						// function name
		"Task 2",					// task name
		1000,						// stack size
		NULL,						// task parameters
		1,							// task priority
		NULL,						// task handle
		CONFIG_ARDUINO_RUNNING_CORE // core
	);
}

void loop()
{
}