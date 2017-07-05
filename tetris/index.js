'use strict';

const BLOCK_SIZE = 30,
	CELL_COLS = 10,
	CELL_ROWS = 20,
	INTERVAL = 500,
	GAME = {
		START: 1,
		PAUSE: 2,
		END: 3
	},
	CELL = {
		NULL: 0,
		DEAD: 1,
		ACTIVE: 2
	},
	BLOCKS = [
		// I
		{
			color: '#00ffff',
			shape: [
				[0, 1, 0, 0],
				[0, 1, 0, 0],
				[0, 1, 0, 0],
				[0, 1, 0, 0]
			]
		},
		// J
		{
			color: '#0000ff',
			shape: [
				[0, 0, 0, 0],
				[1, 0, 0, 0],
				[1, 1, 1, 0],
				[0, 0, 0, 0]
			]
		},
		// L
		{
			color: '#ffa500',
			shape: [
				[0, 0, 0, 0],
				[0, 0, 1, 0],
				[1, 1, 1, 0],
				[0, 0, 0, 0]
			]
		},
		// O
		{
			color: '#ffff00',
			shape: [
				[0, 0, 0, 0],
				[0, 1, 1, 0],
				[0, 1, 1, 0],
				[0, 0, 0, 0]
			]
		},
		// S
		{
			color: '#00ff00',
			shape: [
				[0, 0, 0, 0],
				[0, 1, 1, 0],
				[1, 1, 0, 0],
				[0, 0, 0, 0]
			]
		},
		// T
		{
			color: '#aa00ff',
			shape: [
				[0, 0, 0, 0],
				[0, 1, 0, 0],
				[1, 1, 1, 0],
				[0, 0, 0, 0]
			]
		},
		// Z
		{
			color: '#ff0000',
			shape: [
				[0, 0, 0, 0],
				[1, 1, 0, 0],
				[0, 1, 1, 0],
				[0, 0, 0, 0]
			]
		}
	];

class Block {
	constructor() {
		let blockShape = Math.floor(Math.random() * BLOCKS.length);
		this._block = BLOCKS[blockShape];
		this._x = Math.ceil((CELL_COLS / 2) - (this.cropShape[0].length / 2));
		this._y = 0;
		this._life = true;

		if (!this.downCheck()) {
			tetris.end();
		};
	};

	get panel() {
		return this._panel;
	}

	get shape() {
		return this._block.shape;
	};

	set shape(newShape) {
		this._block.shape = newShape;
	};

	get cropShape() {
		return this.crop(this._block.shape);
	};

	get color() {
		return this._block.color;
	};

	get x() {
		return this._x;
	};

	set x(x) {
		this._x = x;
	};

	get y() {
		return this._y;
	};

	set y(y) {
		this._y = y;
	};

	get life() {
		return this._life;
	};
	set life(life) {
		this._life = life;
	};

	// 블록을 왼쪽으로 이동합니다.
	left() {
		if (this.leftCheck()) {
			this.x = this.x - 1;
		};
	};

	// 블록 좌측 충돌체크를 합니다.
	leftCheck() {
		let cropShape = this.cropShape,
			panel = tetris.basePanel,
			x = this.x,
			y = this.y;

		if (this.x <= 0) {
			return false;
		};

		for (let i = 0; i < cropShape.length; i++) {
			let rowX = cropShape[i].indexOf(1);

			if (panel[y + i][x - 1 + rowX] != CELL.NULL) {
				return false;
			};
		};

		return true;
	};

	// 블록을 오른쪽으로 이동합니다.
	right() {
		if (this.rightCheck()) {
			this.x = this.x + 1;
		};
	};

	// 블록 우측 충돌체크를 합니다.
	rightCheck() {
		let cropShape = this.cropShape,
			panel = tetris.basePanel,
			x = this.x,
			y = this.y;

		if ((this.x + cropShape[0].length) >= CELL_COLS) {
			return false;
		};

		for (let i = 0; i < cropShape.length; i++) {
			let rowX = cropShape[i].lastIndexOf(1);

			if (panel[y + i][x + 1 + rowX] != CELL.NULL) {
				return false;
			};
		};

		return true;
	};

	// 블록을 하단으로 한칸 하강시킵니다.
	down() {
		if (this.downCheck()) {
			this.y = this.y + 1;
		};
	};

	// 블록 하단 충돌체크를 합니다.
	downCheck() {
		let cropShape = this.cropShape,
			shapeCols = cropShape[0].length,
			// lastRow = cropShape[cropShape.length - 1],
			panel = tetris.basePanel,
			x = this.x,
			y = this.y;

		if (this.y + cropShape.length >= CELL_ROWS) {
			this.life = false;
			tetris.lineCheck();
			return false;
		};

		for (let i = 0; i < shapeCols; i++) {
			let _ = [];
			for (let j = 0; j < cropShape.length; j++) {
				_.push(cropShape[j][i]);
			};

			if (panel[y + _.lastIndexOf(1) + 1][x + i] != CELL.NULL) {
				this.life = false;
				tetris.lineCheck();
				return false;
			};
		};

		return true;
	};

	// 블록을 회전합니다.
	rotate() {
		let newShape = [];
		for (let i = 0; i < 4; i++) {
			newShape[i] = [];
			for (let j = 0; j < 4; j++) {
				newShape[i][j] = this.shape[3 - j][i];
			};
		};
		this.shape = newShape;

		if ((this.x + this.cropShape[0].length) >= CELL_COLS) {
			this.x = this.x - (this.x + this.cropShape[0].length - CELL_COLS);
		};
	};

	// 블록 배열에서 여백제거 후 리턴합니다.
	crop(shape) {
		let cropShape = [];
		for (let i = 0; i < 4; i++) {
			if (shape[i].indexOf(1) > -1) {
				cropShape.push(shape[i]);
			};
		};

		for (let i = 0; i < 4; i++) {
			let _ = [];
			for (let j = 0; j < 4; j++) {
				_.push(shape[j][i]);
			};
			if (_.indexOf(1) == -1) {
				for (let j = 0; j < cropShape.length; j++) {
					cropShape[j].splice(i, 1);
				};
			};
		};

		return cropShape;
	};
};

class Tetris {
	constructor() {
		this._basePanel = [];
		this._game = GAME.END;
		this._block = {};
		this._interval = {};
		this._cropShape = null;

		this.controller();
	};

	get basePanel() {
		return this._basePanel;
	};
	get block() {
		return this._block;
	};
	set block(block) {
		this._block = block;
	};
	get game() {
		return this._game;
	};
	set game(game) {
		this._game = game;
	};
	get interval() {
		return this._interval;
	};
	set interval(interval) {
		this._interval = interval;
	};

	start() {
		this.startGame();

		if (this.game == GAME.END) {
			for (let i = 0; i < CELL_ROWS; i++) {
				this._basePanel[i] = [];
				for (let j = 0; j < CELL_COLS; j++) {
					this._basePanel[i][j] = CELL.NULL;
				};
			};
		};

		this.game = GAME.START;
	};
	pause() {
		clearInterval(this.interval);

		this.game = GAME.PAUSE;
	};
	end() {
		clearInterval(this.interval);

		this.game = GAME.END;
	};

	startGame() {
		this.interval = setInterval(() => {
			if (!this.block.life || this.game == GAME.END) {
				this.block = new Block();
				this._cropShape = null;
				// console.clear();
			} else if (this.game == GAME.START) {
				this.block.down();
			};
			this.draw();
		}, INTERVAL);
	};

	lineCheck() {
		let basePanel = this.basePanel,
			block = this.block;

		this._cropShape = this.block.cropShape;

		for (let i = 0; i < block.cropShape.length; i++) {
			if (basePanel[block.y + i].indexOf(CELL.NULL) < 0) {
				let _ = [];
				for (let j = 0; j < CELL_COLS; j++) {
					_.push(CELL.NULL);
				};
				this.basePanel.splice(block.y + i, 1);
				this.basePanel.unshift(_);

				for (let j = 0; j < this._cropShape[0].length; j++) {
					_.push(CELL.NULL);
				};
				this._cropShape.splice(i, 1);
				this._cropShape.unshift(_);
			};
		};
	};

	drawBlock() {
		let _base = this.basePanel,
			_block = this.block,
			_cropShape = (this._cropShape) ? this._cropShape : _block.cropShape;

		for (let i = 0; i < CELL_ROWS; i++) {
			for (let j = 0; j < CELL_COLS; j++) {
				if (_base[i][j] != CELL.DEAD) {
					_base[i][j] = CELL.NULL;
				};
			};
		};

		for (let i = 0; i < _cropShape.length; i++) {
			for (let j = 0; j < _cropShape[i].length; j++) {
				if (_cropShape[i][j] == 1) {
					_base[_block.y + i][_block.x + j] = (_block.life) ? CELL.ACTIVE : CELL.DEAD;
				};
			};
		};
	};

	draw() {
		let canvas = document.getElementById('baseCanvas'),
			ctx = canvas.getContext('2d'),
			width = canvas.getAttribute('width') || '200',
			cellWidth = parseInt(width, 10) / CELL_COLS,
			height = canvas.getAttribute('height'),
			cellHeight = parseInt(height, 10) / CELL_ROWS;

		ctx.clearRect(0, 0, width, height);

		this.drawBlock();

		ctx.strokeStyle = '#c7c7c7';
		for (let i = 0; i < this._basePanel.length; i++) {
			for (let j = 0; j < this._basePanel[i].length; j++) {
				if (this._basePanel[i][j] == CELL.NULL) {
					ctx.fillStyle = '#ffffff';
				} else if (this._basePanel[i][j] == CELL.DEAD) {
					ctx.fillStyle = '#6b6b6b';
				} else if (this._basePanel[i][j] == CELL.ACTIVE) {
					ctx.fillStyle = this.block.color;
				};
				ctx.fillRect(cellWidth * j, cellHeight * i, cellWidth, cellHeight);
				ctx.strokeRect(cellWidth * j, cellHeight * i, cellWidth, cellHeight);
			};
		};
	};

	controller() {
		$('button.btn-start').on('click', e => {
			if (this.game != GAME.START) {
				this.start();
			} else if (this.game == GAME.START) {
				this.pause();
			};
		});

		$('a.btn').on('click', e => {
			e.preventDefault();

			if (this.game != GAME.START) {
				return false;
			};

			if (!this.block.life) {
				return false;
			};

			this.block[$(e.target).attr('href')]();

			this.draw();
		});

		$(document).on('keydown', e => {
			// e.preventDefault();

			if (this.game != GAME.START) {
				return false;
			};

			if (!this.block.life) {
				return false;
			};

			switch (e.keyCode) {
				case 37:
					this.block.left();
					break;
				case 40:
					this.block.down();
					break;
				case 39:
					this.block.right();
					break;
				case 38:
					this.block.rotate();
					break;
			};

			this.draw();
		});
	};
};

const tetris = new Tetris();