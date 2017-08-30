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
		this.board = this.addClues( this.addMines(array) );
		boardUI.render(dimension);
	},

	addMines: function(array) {
		while (this.mineLocations.length < (this.dimension * 3)) {
			let index = this.randomIndex();
			if (this.mineLocations.indexOf(index) === -1) {
				array[index] = 'm';
				this.mineLocations.push(index);
			}
		}
		return array;
	},

	randomIndex: function() {		// for randomly placing mines
		return Math.floor(Math.random() * Math.floor(this.totalBoxes));
	},

	findNeighbors: function(i) {	// returns array of neighboring index numbers
		let result = [];
		let d = this.dimension;
		let omega = this.totalBoxes;
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
			result = [i-d-1, i-d, i-d+1, i-1, i+1, i+d-1, i+d, i+d+1];
		}
		return result;
	},

	addClues: function(array) {
		let neighbors = [];
		for (let i = 0; i < array.length; i++) {			// find non-mine neighbors
			if (array[i] === 'm') {
				let result = this.findNeighbors(i);
				for (let j = 0; j < result.length; j++) {
					let k = result[j];
					if (array[k] !== 'm') neighbors.push(k);
				}
			}
		}
		for (let i = 0; i < neighbors.length; i++) {		// add clues to them
			let j = neighbors[i];
			array[j] += 1;
		}
		return array;
	},
	
	toggleFlag: function(index) {
		messageElement.textContent = '';
		if (this.flagLocations.length < this.mineLocations.length) {
			if (this.flagLocations.indexOf(index) === -1) {			// place a flag
				this.flagLocations.push(index);
			} else {												// remove a flag
				let j = this.flagLocations.indexOf(index);
				this.flagLocations.splice(j,1);
			}
		}
		if (this.flagLocations.length === this.mineLocations.length) {										// win or out of flags
			if (this.checkWin()) {
				this.win();
			} else {
				messageElement.textContent = 'out of flags!';
			}
		}
	},

	checkWin: function() {				// returns true if flagLocations match mineLocations
		let count = 0;
		for (let i = 0; i < this.mineLocations.length; i++) {
			for (let j = 0; j < this.flagLocations.length; j++) {
				this.mineLocations[i] === this.flagLocations[j] ? count += 1 : count;
			}
			if (count === this.mineLocations.length) return true;
		}
		return false;
	},

	win: function() {
		messageElement.textContent = 'You win!';
		boardUI.revealBoard();
	},

	lose: function() {
		messageElement.textContent = 'You lose :-(';
		boardUI.revealBoard();
	}
};

const boardUI = {
	listen: function() {
		document.getElementById('easy').onclick = function() {
			game = new Game();
			game.createBoard(9);
		}
		document.getElementById('medium').onclick = function() {
			game = new Game();
			game.createBoard(16);
		}	
		document.getElementById('hard').onclick = function() {
			game = new Game();
			game.createBoard(24);
		}
	},

	render: function(dimension) {
		boardElement.innerHTML = '';
		messageElement.textContent = '';
		let width = dimension * 24;
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
		boardUI.removeListeners(box);
		if (game.board[index] > 0) {
			box.textContent = game.board[index].toString();
		} else if (game.board[index] === 0) {
			game.board[index] = -1;
			boardUI.showNeighbors(index);
		} else if (game.board[index] === 'm') {
			game.lose();
		}
	},

	showNeighbors: function(index) {
		let neighbors = game.findNeighbors(index);
		neighbors.forEach(i => boardUI.showBox(i));
	},
	
	leftHandler: function(event) {
		event.preventDefault();
		boardUI.showBox( parseInt(event.target.id) );
	},
	
	rightHandlerOn: function(event) {			// add flag
		event.preventDefault();
		event.target.className = 'flag';
		event.target.removeEventListener('click', boardUI.leftHandler, false);
		event.target.removeEventListener('contextmenu', boardUI.rightHandlerOn, false);
		event.target.addEventListener('contextmenu', boardUI.rightHandlerOff, false);
		game.toggleFlag( parseInt(event.target.id) );	
	},
	
	rightHandlerOff: function(event) {			// remove flag
		event.preventDefault();
		event.target.className = '';
		event.target.addEventListener('click', boardUI.leftHandler, false);
		event.target.addEventListener('contextmenu', boardUI.rightHandlerOn, false);
		event.target.removeEventListener('contextmenu', boardUI.rightHandlerOff, false);
		game.toggleFlag( parseInt(event.target.id) );
	},

	removeListeners: function(element) {
		element.removeEventListener('click', boardUI.leftHandler, false);
		element.removeEventListener('contextmenu', boardUI.rightHandlerOn, false);
		element.removeEventListener('contextmenu', boardUI.rightHandlerOff, false);
	},

	revealBoard: function() {
		for (let i = 0; i < game.totalBoxes; i++) {
			let box = document.getElementById(i);
			game.board[i] === 'm' ? box.className = 'mine' : box.className = 'show';
			boardUI.removeListeners(box);
		}
	}
}

document.addEventListener('DOMContentLoaded', () => boardUI.listen());
