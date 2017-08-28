function Game(dimension) {
	this.dimension = dimension;
	this.totalBoxes = dimension * dimension;
	this.board = this.newBoard(this.totalBoxes);
}

Game.prototype = {
	constructor: Game,

	newBoard: function(totalBoxes) {
		let array = Array.from({ length: totalBoxes }, (v, i) => 0);
		array = this.addMines(array);
		array = this.addClues(array);

		console.log(array.toString());
		return array;
	},

	addMines: function(array) {
		let mines = [];
		while (mines.length < this.dimension) {
			let index = this.randomIndex(this.totalBoxes);
			array[index] = 'm';
			mines = array.filter(item => {
				return item === 'm';
			});
		}
		return array;
	},

	randomIndex: function(totalBoxes) {
		return Math.floor(Math.random() * Math.floor(totalBoxes));
	},

	findNeighbors: function(i) {// returns array of index numbers
		let result = [];
		let d = this.dimension,
		 	 omega = this.totalBoxes;
		if (i === 0) {														// first
			result = [1, d, d + 1];
		} else if (i > 0 && i < d - 1) {									// top row
			result = [ i - 1, i + 1, i + d - 1, i + d, i + d + 1];
		} else if (i === d - 1) {											// top right
			result = [i - 1, i + d - 1, i + d];
		} else if (i % d === 0 && i !== 0 && i !== omega - d) { 			// left column
			result = [i - d, i - d + 1, i + 1, i + d, i + d + 1];
		} else if ((i + 1) % d === 0 && i !== d - 1 && i !== omega - 1) {	// right column
			result = [i - d - 1, i - d, i - 1, i + d - 1, i + d];
		} else if (i === omega - d) {										// bottom left corner
			result = [i - d, i - d + 1, i + 1];
		} else if (i > omega - d && i < omega - 1) {						// bottom row
			result = [i - d - 1, i - d, i - d + 1, i - 1, i + 1];
		} else if (i === omega - 1) {										// bottom right corner
			result = [i - d - 1, i - d, i - 1];
		} else {															// middle
			result =[i-d-1, i-d, i-d+1, i-1, i+1, i+d-1, i+d, i+d+1];
		}
		return result;
	},

	addClues: function(array) {
		let neighbors = [];
		for (let i = 0; i < array.length; i++) {
			if (array[i] === 'm') {
				console.log('mine!');

				let result = this.findNeighbors(i);

				for (let j = 0; j < result.length; j++) {
					if (array[result[j]] !== 'm') {
						neighbors.push(result[j]);
					}
				}

				console.log(neighbors);
			}
		}
		for (let k = 0; k < neighbors.length; k++) {
			let index = neighbors[k];
			array[index] += 1;
		}
		console.log(neighbors.toString());
		return array;
	},

};

var game = new Game(5);

