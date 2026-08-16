const URL = "http://cube.local/";

/**
 * Sends a get request to the ESP32 and returns the response
 * @param {String} path 
 * @returns response
 */
async function getRequest(path) {
	try {
		const response = await fetch(`${URL}${path}`);
		if(!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		return response;
	} catch (error) {
		console.error(error);
		return null;
	}
}

/**
 * Sends a post request to the ESP32 and returns the response
 * @param {String} path 
 * @param {String} bodyStr 
 * @returns response
 */
async function postRequest(path, bodyStr) {
	try {
		const response = await fetch(`${URL}${path}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'text/plain'
			},
			body: bodyStr
		});

		if(!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		return response;
	} catch (error) {
		console.error(error);
	}
}

/**
 * sends a given move list to the ESP32, this method handles converting the move list
 * to a format the ESP32 understands
 * @param {Array} moveList 
 */
export async function sendMoves(moveList) {
	const response = await postRequest("moves", "01 23 45 85");
	if(response) {
		const data = await response.text();
		console.log(data);
	}
}

/**
 * Gets the current status of the robot and returns an array representing the state
 * [<status>, <description>]
 * @returns status array
 */
export async function getRobotStatus() {
	const response = await getRequest("status");
	let status = ["ERROR", "check console"];
	if(response) {
		status[0] = await response.text();
		status[1] = "";
	}
	return status;
}