import solvedCube from './solvedCube.json';

let cube = structuredClone(solvedCube);
let moveList = [];

export function print() {
	console.log(cube);
	console.log(isCubeSolved());
}

function faceToInt(face) {
	switch (face) {
		case 'U':
			return 0;
		case 'L':
			return 1;
		case 'F':
			return 2;
		case 'R':
			return 3;
		case 'B':
			return 4;
		case 'D':
			return 5;
		default:
			console.error(`${face} is not a valid face`);
			return -1;
	}
}

export function move(face, clockwise = true) {
	let moveVal = faceToInt(face).toString() + (clockwise ? "1" : "0");
	moveList.push(moveVal);

	const ccwLoop = clockwise ? 1 : 3; // For a ccw turn simply make 3 cw turns
	for (let i = 0; i < ccwLoop; i++) {
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
				cube.UF.colors.F = cubeCopy.LF.colors.L;
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

//TODO: support ID
function isPieceSolved(piece) {
	const colorKeys = Object.keys(cube[piece].colors);
	for (const colorKey of colorKeys) {
		if (cube[piece].colors[colorKey] != solvedCube[piece].colors[colorKey]) {
			return false;
		}
	}
	return true;
}

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

export function resetCube() {
	cube = structuredClone(solvedCube);
}

export function getMoveList() {
	return [...moveList];
}