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

	randomIndex: function() {
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
		for (let i = 0; i < array.length; i++) {
			if (array[i] === 'm') {
				let result = this.findNeighbors(i);
				for (let j = 0; j < result.length; j++) {
					let k = result[j];
					if (array[k] !== 'm') neighbors.push(k);
				}
			}
		}
		for (let i = 0; i < neighbors.length; i++) {
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
		easyButton.onclick = function() {
			game = new Game();
			game.createBoard(9);
			// boardUI.render(9);
		}
		mediumButton.onclick = function() {
			game = new Game();
			game.createBoard(16);
			// boardUI.render(16);
		}	
		hardButton.onclick = function() {
			game = new Game();
			game.createBoard(24);
			// boardUI.render(24);
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
		let index = parseInt(event.target.id);
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
		let index = parseInt(event.target.id);
		game.toggleFlag(index);	
	},
	
	rightHandlerOff: function(event) {			// remove flag
		event.preventDefault();
		event.target.className = '';
		event.target.addEventListener('click', boardUI.leftHandler, false);
		event.target.addEventListener('contextmenu', boardUI.rightHandlerOn, false);
		event.target.removeEventListener('contextmenu', boardUI.rightHandlerOff, false);
		let index = parseInt(event.target.id);
		game.toggleFlag(index);
	},

	revealBoard: function() {
		for (let i = 0; i < game.totalBoxes; i++) {
			let box = document.getElementById(i);
			game.board[i] === 'm' ? box.className = 'mine' : box.className = 'show';
			box.removeEventListener('click', boardUI.leftHandler, false);
			box.removeEventListener('contextmenu', boardUI.rightHandlerOn, false);
			box.removeEventListener('contextmenu', boardUI.rightHandlerOff, false);
		}
	}
}

document.addEventListener('DOMContentLoaded', () => {
	boardUI.listen();
});
