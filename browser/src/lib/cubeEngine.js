import * as helpers from "./helpers.js";

import solvedCube from './solvedCube.json';

export const faces = {
	'U': 0,
	'L': 1,
	'F': 2,
	'R': 3,
	'B': 4,
	'D': 5
};

let cube = structuredClone(solvedCube);
let moveList = [];

/**
 * Runner for the solve algorithm using the LBL approach
 * 1. white cross
 * 2. white corners
 * 3. 2nd layer
 * 4. yellow cross
 * 5. align yellow cross
 * 6. position yellow corners
 * 7. solve yellow corners
 */
export function solve() {
	whiteCross();
	whiteCorners();
	secondLayer();
	yellowCross();
	alignYellowCross();
	positionYellowCorners();
	solveYellowCorners();
}

/**
 * Solve the white cross one piece at a time
 */
function whiteCross() {
	console.log("solving white cross...");
	let whiteCrossPieces = ["DF", "DL", "DB", "DR"];
	for(const piece of whiteCrossPieces) {
		if(isPieceSolved(piece)) continue; //already solved

		// Bottom layer incorrect location, move to top
		if(!isPieceSlotted(piece) && pieceCurrentLayer(piece) == 1) {
			//console.log("Bottom layer incorrect location, move to top");
			const currSlot = findPiece(cube[piece].id);
			const currSlotFaces = Object.keys(currSlot.colors);
			move(currSlotFaces[1]);
			move(currSlotFaces[1]);
		}

		// Second layer
		if(pieceCurrentLayer(piece) == 2) {
			//console.log("Second layer, moving up");
			const currSlot = findPiece(cube[piece].id);
			const currSlotFaces = Object.keys(currSlot.colors);
			let sexyFace;
			switch (currSlot.id) {
				case 12:
					sexyFace = "F";
					break;
				case 13:
					sexyFace = "L";
					break;
				case 14:
					sexyFace = "B";
					break;
				case 15:
					sexyFace = "R";
					break;
				default:
					console.error("horrible error solving second layer white cross situation");
					break;
			}
			sexyMove(sexyFace, "R", "U");
		}

		// Third layer, move to correct slot in bottom layer
		if(pieceCurrentLayer(piece) == 3) {
			//console.log("Third layer, move to correct slot");
			let currSlot = findPiece(cube[piece].id);
			while(currSlot.id != cube[piece].id - 8) {
				move('U');
				currSlot = findPiece(cube[piece].id);
			}
			move(piece.charAt(1));
			move(piece.charAt(1));
		}

		// Piece is now in the correct slot but not oriented correctly
		if(!isPieceSolved(piece)) {
			move(piece.charAt(1));
			move("D", false);
			let leftId = faces[piece.charAt(1)]-1;
			if(leftId == 0) leftId = 4;
			move(leftId);
			move("D");
		}

		// Piece is solved
	}
}

function whiteCorners() {

}

function secondLayer() {

}

function yellowCross() {

}

function alignYellowCross() {

}

function positionYellowCorners() {

}

function solveYellowCorners() {

}

/**
 * performs the sexy move on the provided face using the provided hand using top as the top face
 * @param face str or number
 * @param {string} hand R or L
 * @param {string} top U or D
 */
export function sexyMove(face, hand, top) {
	if(typeof face === "string") face = faces[face];
	if(top == "U") {
		if(hand.toUpperCase() == "R") {
			let rightFace = face + 1;
			if(rightFace > 4) rightFace = 1;
			move(rightFace);
			move('U');
			move(rightFace, false);
			move('U', false);
		}else {
			let leftFace = face - 1;
			if(leftFace < 1) leftFace = 4;
			move(leftFace, false);
			move('U', false);
			move(leftFace);
			move('U');
		}
	}else {
		console.error("NOT IMPELEMENTED");
	}
}

/**
 * Applies between min and max random rotations to the cube
 * @param {number} min min amount of rotations
 * @param {number} max max amount of rotations
 */
export function scramble(min = 15, max = 30) {
	const turns = helpers.randIntInclusive(min, max);
	for (let i = 0; i < turns; i++) {
		const r = helpers.randIntInclusive(0, 5);
		const face = Object.keys(faces).find(k => faces[k] == r);
		const dir = Math.random() < 0.5;
		move(face, dir)
	}
}

/**
 * Rotate the cube in memory and add the move to the moveList which is used by the UI and ESP32
 * Hard coded all CW moves, to perform a CCW move we just do 3x CW moves
 * @param face string or number
 * @param {boolean} clockwise
 */
export function move(face, clockwise = true) {
	if(typeof face === 'number') {
		face = Object.keys(faces)[face];
	}
	let moveVal = faces[face].toString() + (clockwise ? "1" : "0");
	moveList.push(moveVal);
	applyMove(cube, face, clockwise);
}

/**
 * Rotates the given cube in place. Pure core shared by the memory move() and
 * the 3D display: no logging, no module state, operates on whatever cube it's handed.
 * @param {object} cube the cube to mutate
 * @param {string} face
 * @param {boolean} clockwise
 */
export function applyMove(cube, face, clockwise = true) {
	const ccwLoop = clockwise ? 1 : 3; // For a CCW turn simply make 3 CW turns
	for (let i = 0; i < ccwLoop; i++) { // If turning CW this will only run once
		let cubeCopy = structuredClone(cube);
		switch (face) {
			case 'U':
				//URF -> ULF
				cube.ULF.curr = cubeCopy.URF.curr;
				cube.ULF.colors.U = cubeCopy.URF.colors.U;
				cube.ULF.colors.L = cubeCopy.URF.colors.F;
				cube.ULF.colors.F = cubeCopy.URF.colors.R;
				//ULF -> ULB
				cube.ULB.curr = cubeCopy.ULF.curr;
				cube.ULB.colors.U = cubeCopy.ULF.colors.U;
				cube.ULB.colors.L = cubeCopy.ULF.colors.F;
				cube.ULB.colors.B = cubeCopy.ULF.colors.L;
				//ULB -> URB
				cube.URB.curr = cubeCopy.ULB.curr;
				cube.URB.colors.U = cubeCopy.ULB.colors.U;
				cube.URB.colors.R = cubeCopy.ULB.colors.B;
				cube.URB.colors.B = cubeCopy.ULB.colors.L;
				//URB -> URF
				cube.URF.curr = cubeCopy.URB.curr;
				cube.URF.colors.U = cubeCopy.URB.colors.U;
				cube.URF.colors.R = cubeCopy.URB.colors.B;
				cube.URF.colors.F = cubeCopy.URB.colors.R;
				//UF -> UL
				cube.UL.curr = cubeCopy.UF.curr;
				cube.UL.colors.U = cubeCopy.UF.colors.U;
				cube.UL.colors.L = cubeCopy.UF.colors.F;
				//UL -> UB
				cube.UB.curr = cubeCopy.UL.curr;
				cube.UB.colors.U = cubeCopy.UL.colors.U;
				cube.UB.colors.B = cubeCopy.UL.colors.L;
				//UB -> UR
				cube.UR.curr = cubeCopy.UB.curr;
				cube.UR.colors.U = cubeCopy.UB.colors.U;
				cube.UR.colors.R = cubeCopy.UB.colors.B;
				//UR -> UF
				cube.UF.curr = cubeCopy.UR.curr;
				cube.UF.colors.U = cubeCopy.UR.colors.U;
				cube.UF.colors.F = cubeCopy.UR.colors.R;
				break;
			case 'F':
				//URF -> DRF
				cube.DRF.curr = cubeCopy.URF.curr;
				cube.DRF.colors.D = cubeCopy.URF.colors.R;
				cube.DRF.colors.R = cubeCopy.URF.colors.U;
				cube.DRF.colors.F = cubeCopy.URF.colors.F;
				//DRF -> DLF
				cube.DLF.curr = cubeCopy.DRF.curr;
				cube.DLF.colors.D = cubeCopy.DRF.colors.R;
				cube.DLF.colors.L = cubeCopy.DRF.colors.D;
				cube.DLF.colors.F = cubeCopy.DRF.colors.F;
				//DLF -> ULF
				cube.ULF.curr = cubeCopy.DLF.curr;
				cube.ULF.colors.U = cubeCopy.DLF.colors.L;
				cube.ULF.colors.L = cubeCopy.DLF.colors.D;
				cube.ULF.colors.F = cubeCopy.DLF.colors.F;
				//ULF -> URF
				cube.URF.curr = cubeCopy.ULF.curr;
				cube.URF.colors.U = cubeCopy.ULF.colors.L;
				cube.URF.colors.R = cubeCopy.ULF.colors.U;
				cube.URF.colors.F = cubeCopy.ULF.colors.F;
				//UF -> RF
				cube.RF.curr = cubeCopy.UF.curr;
				cube.RF.colors.R = cubeCopy.UF.colors.U;
				cube.RF.colors.F = cubeCopy.UF.colors.F;
				//RF -> DF
				cube.DF.curr = cubeCopy.RF.curr;
				cube.DF.colors.D = cubeCopy.RF.colors.R;
				cube.DF.colors.F = cubeCopy.RF.colors.F;
				//DF -> LF
				cube.LF.curr = cubeCopy.DF.curr;
				cube.LF.colors.L = cubeCopy.DF.colors.D;
				cube.LF.colors.F = cubeCopy.DF.colors.F;
				//LF -> UF
				cube.UF.curr = cubeCopy.LF.curr;
				cube.UF.colors.U = cubeCopy.LF.colors.L;
				cube.UF.colors.F = cubeCopy.LF.colors.F;
				break;
			case 'L':
				//ULF -> DLF
				cube.DLF.curr = cubeCopy.ULF.curr;
				cube.DLF.colors.D = cubeCopy.ULF.colors.F;
				cube.DLF.colors.L = cubeCopy.ULF.colors.L;
				cube.DLF.colors.F = cubeCopy.ULF.colors.U;
				//DLF -> DLB
				cube.DLB.curr = cubeCopy.DLF.curr;
				cube.DLB.colors.D = cubeCopy.DLF.colors.F;
				cube.DLB.colors.L = cubeCopy.DLF.colors.L;
				cube.DLB.colors.B = cubeCopy.DLF.colors.D;
				//DLB -> ULB
				cube.ULB.curr = cubeCopy.DLB.curr;
				cube.ULB.colors.U = cubeCopy.DLB.colors.B;
				cube.ULB.colors.L = cubeCopy.DLB.colors.L;
				cube.ULB.colors.B = cubeCopy.DLB.colors.D;
				//ULB -> ULF
				cube.ULF.curr = cubeCopy.ULB.curr;
				cube.ULF.colors.U = cubeCopy.ULB.colors.B;
				cube.ULF.colors.L = cubeCopy.ULB.colors.L;
				cube.ULF.colors.F = cubeCopy.ULB.colors.U;
				//UL -> LF
				cube.LF.curr = cubeCopy.UL.curr;
				cube.LF.colors.L = cubeCopy.UL.colors.L;
				cube.LF.colors.F = cubeCopy.UL.colors.U;
				//LF -> DL
				cube.DL.curr = cubeCopy.LF.curr;
				cube.DL.colors.D = cubeCopy.LF.colors.F;
				cube.DL.colors.L = cubeCopy.LF.colors.L;
				//DL -> LB
				cube.LB.curr = cubeCopy.DL.curr;
				cube.LB.colors.L = cubeCopy.DL.colors.L;
				cube.LB.colors.B = cubeCopy.DL.colors.D;
				//LB -> UL
				cube.UL.curr = cubeCopy.LB.curr;
				cube.UL.colors.L = cubeCopy.LB.colors.L;
				cube.UL.colors.U = cubeCopy.LB.colors.B;
				break;
			case 'B':
				//URB -> ULB
				cube.ULB.curr = cubeCopy.URB.curr;
				cube.ULB.colors.U = cubeCopy.URB.colors.R;
				cube.ULB.colors.L = cubeCopy.URB.colors.U;
				cube.ULB.colors.B = cubeCopy.URB.colors.B;
				//ULB -> DLB
				cube.DLB.curr = cubeCopy.ULB.curr;
				cube.DLB.colors.D = cubeCopy.ULB.colors.L;
				cube.DLB.colors.L = cubeCopy.ULB.colors.U;
				cube.DLB.colors.B = cubeCopy.ULB.colors.B;
				//DLB -> DRB
				cube.DRB.curr = cubeCopy.DLB.curr;
				cube.DRB.colors.D = cubeCopy.DLB.colors.L;
				cube.DRB.colors.R = cubeCopy.DLB.colors.D;
				cube.DRB.colors.B = cubeCopy.DLB.colors.B;
				//DRB -> URB
				cube.URB.curr = cubeCopy.DRB.curr;
				cube.URB.colors.U = cubeCopy.DRB.colors.R;
				cube.URB.colors.R = cubeCopy.DRB.colors.D;
				cube.URB.colors.B = cubeCopy.DRB.colors.B;
				//UB -> LB
				cube.LB.curr = cubeCopy.UB.curr;
				cube.LB.colors.L = cubeCopy.UB.colors.U;
				cube.LB.colors.B = cubeCopy.UB.colors.B;
				//LB -> DB
				cube.DB.curr = cubeCopy.LB.curr;
				cube.DB.colors.D = cubeCopy.LB.colors.L;
				cube.DB.colors.B = cubeCopy.LB.colors.B;
				//DB -> RB
				cube.RB.curr = cubeCopy.DB.curr;
				cube.RB.colors.R = cubeCopy.DB.colors.D;
				cube.RB.colors.B = cubeCopy.DB.colors.B;
				//RB -> UB
				cube.UB.curr = cubeCopy.RB.curr;
				cube.UB.colors.U = cubeCopy.RB.colors.R;
				cube.UB.colors.B = cubeCopy.RB.colors.B;
				break;
			case 'R':
				//URF -> URB
				cube.URB.curr = cubeCopy.URF.curr;
				cube.URB.colors.U = cubeCopy.URF.colors.F;
				cube.URB.colors.R = cubeCopy.URF.colors.R;
				cube.URB.colors.B = cubeCopy.URF.colors.U;
				//URB -> DRB
				cube.DRB.curr = cubeCopy.URB.curr;
				cube.DRB.colors.D = cubeCopy.URB.colors.B;
				cube.DRB.colors.R = cubeCopy.URB.colors.R;
				cube.DRB.colors.B = cubeCopy.URB.colors.U;
				//DRB -> DRF
				cube.DRF.curr = cubeCopy.DRB.curr;
				cube.DRF.colors.D = cubeCopy.DRB.colors.B;
				cube.DRF.colors.R = cubeCopy.DRB.colors.R;
				cube.DRF.colors.F = cubeCopy.DRB.colors.D;
				//DRF -> URF
				cube.URF.curr = cubeCopy.DRF.curr;
				cube.URF.colors.U = cubeCopy.DRF.colors.F;
				cube.URF.colors.R = cubeCopy.DRF.colors.R;
				cube.URF.colors.F = cubeCopy.DRF.colors.D;
				//UR -> RB
				cube.RB.curr = cubeCopy.UR.curr;
				cube.RB.colors.R = cubeCopy.UR.colors.R;
				cube.RB.colors.B = cubeCopy.UR.colors.U;
				//RB -> DR
				cube.DR.curr = cubeCopy.RB.curr;
				cube.DR.colors.R = cubeCopy.RB.colors.R;
				cube.DR.colors.D = cubeCopy.RB.colors.B;
				//DR -> RF
				cube.RF.curr = cubeCopy.DR.curr;
				cube.RF.colors.R = cubeCopy.DR.colors.R;
				cube.RF.colors.F = cubeCopy.DR.colors.D;
				//RF -> UR
				cube.UR.curr = cubeCopy.RF.curr;
				cube.UR.colors.R = cubeCopy.RF.colors.R;
				cube.UR.colors.U = cubeCopy.RF.colors.F;
				break;
			case 'D':
				//DRF -> DRB
				cube.DRB.curr = cubeCopy.DRF.curr;
				cube.DRB.colors.D = cubeCopy.DRF.colors.D;
				cube.DRB.colors.R = cubeCopy.DRF.colors.F;
				cube.DRB.colors.B = cubeCopy.DRF.colors.R;
				//DRB -> DLB
				cube.DLB.curr = cubeCopy.DRB.curr;
				cube.DLB.colors.D = cubeCopy.DRB.colors.D;
				cube.DLB.colors.L = cubeCopy.DRB.colors.B;
				cube.DLB.colors.B = cubeCopy.DRB.colors.R;
				//DLB -> DLF
				cube.DLF.curr = cubeCopy.DLB.curr;
				cube.DLF.colors.D = cubeCopy.DLB.colors.D;
				cube.DLF.colors.L = cubeCopy.DLB.colors.B;
				cube.DLF.colors.F = cubeCopy.DLB.colors.L;
				//DLF -> DRF
				cube.DRF.curr = cubeCopy.DLF.curr;
				cube.DRF.colors.D = cubeCopy.DLF.colors.D;
				cube.DRF.colors.R = cubeCopy.DLF.colors.F;
				cube.DRF.colors.F = cubeCopy.DLF.colors.L;
				//DF -> DR
				cube.DR.curr = cubeCopy.DF.curr;
				cube.DR.colors.D = cubeCopy.DF.colors.D;
				cube.DR.colors.R = cubeCopy.DF.colors.F;
				//DR -> DB
				cube.DB.curr = cubeCopy.DR.curr;
				cube.DB.colors.D = cubeCopy.DR.colors.D;
				cube.DB.colors.B = cubeCopy.DR.colors.R;
				//DB -> DL
				cube.DL.curr = cubeCopy.DB.curr;
				cube.DL.colors.D = cubeCopy.DB.colors.D;
				cube.DL.colors.L = cubeCopy.DB.colors.B;
				//DL -> DF
				cube.DF.curr = cubeCopy.DL.curr;
				cube.DF.colors.D = cubeCopy.DL.colors.D;
				cube.DF.colors.F = cubeCopy.DL.colors.L;
				break;
			default:
				console.error(`${face} is an invalid face value`);
				break;
		}
	}
}

/**
 * Rotate each face 4 times both CW and CCW, print the cube after each 4x rotation.
 * For debug and testing purposes
 */
export function fullMoveCycle() {
	const faceKeys = Object.keys(faces);
	faceKeys.forEach(face => {
		for (let i = 0; i < 4; i++) { // Move the face 4x CW
			move(face);
		}
		print();
		for (let i = 0; i < 4; i++) { // Move the face 4x CCW
			move(face, false);
		}
		print();
	})
}

/**
 * locates a given piece's current location
 * @param {number} id
 * @returns {piece} piece 
 */
function findPiece(id) {
	const pieceKeys = Object.keys(cube);
	for(const piece of pieceKeys) {
		if (cube[piece].curr == id) return cube[piece];
	}
	console.error(`Unable to locate ${id}, something has gone horribly wrong`);
	return {};
}

/**
 * Determine if a piece is in the correct slot, doesn't determine if it's oriented correctly
 * @param {string} piece
 * @returns {boolean}
 */
function isPieceSlotted(piece) {
	return cube[piece].id == cube[piece].curr;
}

/**
 * get the current layer of the piece represented by 1,2,3 | bottom, mid, top
 * @param {string} piece 
 * @returns current layer (1,2,3 | bottom,middle,top)
 */
function pieceCurrentLayer(piece) {
	let currLocation = findPiece(cube[piece].id)
	if (currLocation.id <= 7) { // corner
		if (currLocation.id < 4) return 3; // top layer
		return 1; // bottom layer
	}else { // edge piece
		if (currLocation.id < 12) return 3; // top layer
		if (currLocation.id < 16) return 2; // middle layer
		return 1; // bottom layer
	}
}

/**
 * Check if a given piece is in the correct slot and correct orientation
 * @param {string} piece 
 * @returns {boolean}
 */
function isPieceSolved(piece) {
	const colorKeys = Object.keys(cube[piece].colors);
	for (const colorKey of colorKeys) {
		if (cube[piece].colors[colorKey] != solvedCube[piece].colors[colorKey]) {
			return false;
		}
	}
	return true;
}

/**
 * Checks if the cube is in a solved state
 * @returns object containing solved state (boolean) and arr of incorrect pieces (array)
 */
export function isCubeSolved() {
	let unsolved = [];

	// Check corners
	const pieceKeys = Object.keys(cube);
	pieceKeys.forEach(piece => {
		if (!isPieceSolved(piece)) unsolved.push(piece);
	});

	return {
		"solved": unsolved.length < 1,
		"incorrect": unsolved
	}
}

/**
 * print the current state of the cube as well as it's current solved state
 */
export function print() {
	console.log(cube);
	console.log(moveList);
	console.log(isCubeSolved());
}

/**
 * Reset the cube in memory to it's solved state and wipe moveList[]
 */
export function reset() {
	cube = structuredClone(solvedCube);
	moveList = [];
}

export function getMoveList() {
	return [...moveList];
}

export function clearMoveList() {
	moveList = [];
}

export function getCube() { return structuredClone(cube); }