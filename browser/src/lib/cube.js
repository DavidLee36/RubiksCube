import solvedCube from './solvedCube.json';

let cube = structuredClone(solvedCube);

export function print() {
	console.log(cube);
	console.log(isCubeSolved());
}

//TODO: support ID
function isPieceSolved(piece) {
	const type = "corners" ? piece.length > 2 : "edges"; // infer whether the provided piece is an edge or corner
	console.log(type);
	const colorKeys = Object.keys(cube[type][piece].colors);
	for (const colorKey of colorKeys) {
		if (cube[type][piece][colorKey] != solvedCube[type][piece][colorKey]) {
			return false;
		}
	}
	return true;
}

export function isCubeSolved() {
	let unsolved = [];

	// Check corners
	const cornerKeys = Object.keys(cube.corners);
	cornerKeys.forEach(corner => {
		if(!isPieceSolved(corner)) unsolved.push(corner);
	})

	// Check edges
	const edgeKeys = Object.keys(cube.edges);
	edgeKeys.forEach(edge => {
		if(!isPieceSolved(edge)) unsolved.push(edge);
	})

	return unsolved;
}