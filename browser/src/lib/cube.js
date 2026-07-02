export class Cube {
	
}

class Piece {
	constructor(id, colors) {
		this.id = id;
		this.location = id;
		this.colors = colors;
	}
}

class CornerPiece extends Piece {
	constructor()
}

class EdgePiece extends Piece {
	constructor() {

	}
}