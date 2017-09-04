boardElement = document.getElementById('board');
messageElement = document.getElementById('message');

function Game(dimension) {
	this.dimension = dimension;
	this.totalBoxes = dimension * dimension;
	this.mineLocations = [];
	this.flagLocations = [];
	this.board = this.createBoard(dimension);
}

Game.prototype = {
	constructor: Game,

	createBoard: function(dimension) {		// renders UI and places mines/clues
		boardUI.render(dimension);
		let array = Array.from({ length: this.totalBoxes }, (v, i) => 0);
		return this.addClues( this.addMines(array) );
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

	findNeighbors: function(x) {	// returns array of neighboring indexes
		let d = this.dimension,
			base = [x-d-1, x-d, x-d+1, x-1, x+1, x+d-1, x+d, x+d+1],
			result = [];
		for (i = 0; i < base.length; i++) {							// base[i] / num is the neigbor index
			let num = parseInt(base[i]);
			for (j = 0; j < this.totalBoxes; j++) {					// j is the board index
				if (base[i] === j) {								// does neighbor index exists on board?
					if (x % d === 0) {								// left column
						if ((num+1) % d !== 0) result.push(num);
					} else if ((x+1) % d === 0) {					// right column
						if (num % d !== 0) result.push(num);
					} else {										// middle
						result.push(base[i]);
					}
				}
			}
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
		if (this.flagLocations.length === this.mineLocations.length) {	// win or out of flags
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
	game: {},

	listen: function() {
		document.getElementById('easy').onclick = () => this.game = new Game(9);
		document.getElementById('medium').onclick = () => this.game = new Game(16);
		document.getElementById('hard').onclick = () => this.game = new Game(24);
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
		if (this.game.board[index] > 0) {						// box is a clue
			box.textContent = this.game.board[index].toString();
		} else if (this.game.board[index] === 0) {				// box is blank
			this.game.board[index] = -1;
			boardUI.showNeighbors(index);
		} else if (this.game.board[index] === 'm') {			// mine
			this.game.lose();
		}
	},

	showNeighbors: function(index) {
		let neighbors = this.game.findNeighbors(index);
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
		boardUI.game.toggleFlag( parseInt(event.target.id) );	
	},
	
	rightHandlerOff: function(event) {			// remove flag
		event.preventDefault();
		event.target.className = '';
		event.target.addEventListener('click', boardUI.leftHandler, false);
		event.target.addEventListener('contextmenu', boardUI.rightHandlerOn, false);
		event.target.removeEventListener('contextmenu', boardUI.rightHandlerOff, false);
		boardUI.game.toggleFlag( parseInt(event.target.id) );
	},

	removeListeners: function(element) {
		element.removeEventListener('click', boardUI.leftHandler, false);
		element.removeEventListener('contextmenu', boardUI.rightHandlerOn, false);
		element.removeEventListener('contextmenu', boardUI.rightHandlerOff, false);
	},

	revealBoard: function() {
		for (let i = 0; i < this.game.totalBoxes; i++) {
			let box = document.getElementById(i);
			boardUI.game.board[i] === 'm' ? box.className = 'mine' : box.className = 'show';
			boardUI.removeListeners(box);
		}
	}
}

document.addEventListener('DOMContentLoaded', () => boardUI.listen());
