easyButton = document.getElementById('easy');
mediumButton = document.getElementById('medium');
hardButton = document.getElementById('hard');
boardElement = document.getElementById('board');
messageElement = document.getElementById('message');

function Game() {
	this.dimension;
	this.totalBoxes;
	this.board = [];
	this.mineLocations = [];
	this.flagLocations = [];
}

Game.prototype = {
	constructor: Game,

	createBoard: function(dimension) {
		this.dimension = dimension;
		this.totalBoxes = dimension * dimension;
		let array = Array.from({ length: this.totalBoxes }, (v, i) => 0);
		array = this.addMines(array);
		array = this.addClues(array);
		this.board = array;
	},

	addMines: function(array) {
		while (this.mineLocations.length < this.dimension) {
			let index = this.randomIndex();
			if (this.mineLocations.indexOf(index) === -1) {
				array[index] = 'm';
				this.mineLocations.push(index);
			}
		}
		return array;
	},

	randomIndex: function() {
		return Math.floor(Math.random() * Math.floor(this.totalBoxes));
	},

	findNeighbors: function(index) {	// returns array of index numbers
		let result = [];
		let i = parseInt(index);
		let d = parseInt(this.dimension);
		let omega = parseInt(this.totalBoxes);
		if (i === 0) {														// first
			result = [1, d, d + 1];
		} else if (i > 0 && i < d - 1) {									// top row
			result = [ (i-1), (i+1), (i+d-1), (i+d), (i+d+1)];
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
				let result = this.findNeighbors(i);
				for (let j = 0; j < result.length; j++) {
					let index = result[j];
					if (array[index] !== 'm') {
						neighbors.push(index);
					}
				}
			}
		}
		for (let k = 0; k < neighbors.length; k++) {
			let index = neighbors[k];
			array[index] += 1;
		}
		return array;
	},
	
	toggleFlag: function(index) {
		if (this.flagLocations.length < this.mineLocations.length) {
			if (this.flagLocations.indexOf(index) === -1) {			// place a flag
				this.flagLocations.push(index);
			} else {												// remove a flag
				let j = this.flagLocations.indexOf(index);
				this.flagLocations.splice(j,1);
			}
		} else { 												// out of flags
			messageElement.textContent = 'out of flags!';
		}
	},
	
	checkClick: function(index) {
		if (this.mineLocations.indexOf(index) !== 1) {				// lose
				
		} else if (this.board[index] > 0) {							// clue > 0
			
		} else {													// clue === 0
			let neighbors = this.findNeighbors(index);
			for (let i = 0; i < neighbors.length; i++) {
				if (neighbors[i] > 0) {
					// reveal only this box
				} else {
					// check neighbors or this box too
				}
			}
		}
	},

	checkWin: function() {				// returns true if flagLocations match mineLocations
		let mine = this.mineLocations,
			flag = this.flagLocations;
		let count = 0;
		for (let i = 0; i < mine.length; i++) {
			for (let j = 0; j < flag.length; j++) {
				if (mine[i] === flag[j]) {
					count += 1;
				}
			}
			if (count === mine.length) return true;
		}
		return false;
	},

};

const boardUI = {
	listen: function() {
		easyButton.onclick = function() {
			game = new Game();
			game.createBoard(9);
			boardUI.render(9);
		}
		mediumButton.onclick = function() {
			game = new Game();
			game.createBoard(16);
			boardUI.render(16);
		}	
		hardButton.onclick = function() {
			game = new Game();
			game.createBoard(24);
			boardUI.render(24);
		}
	},

	render: function(dimension) {
		boardElement.innerHTML = '';
		let width = dimension * 20;
		let length = dimension * dimension;
		boardElement.style.width = `${width}px`;
		for (let i = 0; i < length; i++) {
			let div = document.createElement('div');
			div.id = i;
			div.addEventListener('click', boardUI.leftHandler, false);
			div.addEventListener('contextmenu', boardUI.rightHandlerOn, false);
			boardElement.appendChild(div);
		}
	},

	showBox: function(index) {
		let box = document.getElementById(index);
		box.className = 'show';
		if (game.board[index] > 0) {
			box.textContent = game.board[index].toString();
		// } else if (game.board[index] === 'm') {
		// 	box.className = 'mine';
		} else if (game.board[index] === 0) {
			game.board[index] = -1;
			boardUI.showNeighbors(index);
			
		}
	},

	showNeighbors: function(index) {
		let neighbors = game.findNeighbors(index);
		// console.log(neighbors);

		for (let i = 0; i < neighbors.length; i++) {
			boardUI.showBox(neighbors[i]);			
		}
	},
	
	leftHandler: function(event) {
		event.preventDefault();
		
		let index = event.target.id;
		boardUI.showBox(index);

		event.target.removeEventListener('click', boardUI.leftHandler, false);
		event.target.removeEventListener('contextmenu', boardUI.rightHandlerOn, false);
		event.target.removeEventListener('contextmenu', boardUI.rightHandlerOff, false);
	},
	
	rightHandlerOn: function(event) {			// add flag
		event.preventDefault();
		event.target.className = 'flag';
		event.target.removeEventListener('click', boardUI.leftHandler, false);
		event.target.removeEventListener('contextmenu', boardUI.rightHandlerOn, false);
		event.target.addEventListener('contextmenu', boardUI.rightHandlerOff, false);
		let index = event.target.id;
		game.toggleFlag(index);	
		// check for a win
	},
	
	rightHandlerOff: function(event) {			// remove flag
		event.preventDefault();
		event.target.className = '';
		event.target.addEventListener('click', boardUI.leftHandler, false);
		event.target.addEventListener('contextmenu', boardUI.rightHandlerOn, false);
		event.target.removeEventListener('contextmenu', boardUI.rightHandlerOff, false);
		let index = event.target.getAttribute('index');
		game.toggleFlag(index);
	}
}

document.addEventListener('DOMContentLoaded', () => {
	boardUI.listen();
});
