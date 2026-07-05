//Collection of random helper methods that aren't necessarily specific to one file

/**
 * returns a random int between min and max inclusive
 * @param {number} min 
 * @param {number} max 
 * @returns {int}
 */
export function randIntInclusive(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}