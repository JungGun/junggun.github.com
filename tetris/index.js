'use strict';

const BLOCK_SIZE = 30,
	CELL_COLS = 10,
	CELL_ROWS = 20,
	INTERVAL = 1500,
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
	};

	get shape() {
		return this._block.shape;
	};
	get cropShape() {
		return this.crop(this._block.shape);
	};

	set shape(newShape) {
		this._block.shape = newShape;
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

	// 블록을 왼쪽으로 이동합니다.
	left() {
		this.x = this.x - 1;
		if (this.x < 0) {
			this.x = this.x + 1;
		};
	};

	// 블록을 오른쪽으로 이동합니다.
	right() {
		this.x = this.x + 1;
		let cropShape = this.cropShape;
		if ((this.x + cropShape[0].length) > CELL_COLS) {
			this.x = this.x - (this.x + cropShape[0].length - CELL_COLS);
		};
	};

	// 블록을 하단으로 한칸 하강시킵니다.
	down() {
		this.y = this.y + 1;
		let cropShape = this.cropShape;
		if (this.y + cropShape.length > CELL_ROWS) {
			this.y = CELL_ROWS - cropShape.length;
		};
	};

	// 블록을 최하단으로 하강시킵니다.
	// hardDown() {
	// 	this.y = CELL_ROWS - this.cropShape.length;
	// };

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
		this.right();
	};

	// 블록 배열에서 crop 후 리턴합니다.
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
		this._started = false;
		this._block = {};
		this._interval = {};

		for (let i = 0; i < CELL_ROWS; i++) {
			this._basePanel[i] = [];
			for (let j = 0; j < CELL_COLS; j++) {
				this._basePanel[i][j] = CELL.NULL;
			};
		};

		this.controller();
		this.newBlock();
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
	set interval(interval) {
		this._interval = interval;
	};

	controller() {
		$('a.btn').on('click', e => {
			e.preventDefault();

			this.block[$(e.target).attr('href')]();

			this.draw();
		});

		$(document).on('keydown', e => {
			// e.preventDefault();
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

	newBlock() {
		this.block = new Block();
		this.drawBlock();
		this.interval = setInterval(() => {
			this.move(this);
		}, INTERVAL);
	};

	drawBlock() {
		let _base = this.basePanel;
		let _block = this.block;

		// for (let i = 0; i < _block.y; i++) {
		for (let i = 0; i < CELL_ROWS; i++) {
			for (let j = 0; j < CELL_COLS; j++) {
				if (_base[i][j] == CELL.ACTIVE) {
					_base[i][j] = CELL.NULL;
				};
			};
		};

		for (let i = 0; i < _block.cropShape.length; i++) {
			for (let j = 0; j < _block.cropShape[i].length; j++) {
				if (_block.cropShape[i][j] == 1) {
					_base[0 + _block.y + i][_block.x + j] = CELL.ACTIVE;
				} else {
					_base[0 + _block.y + i][_block.x + j] = CELL.NULL;
				};
			};
			console.log(JSON.stringify(_block.cropShape[i]))
		};
	};

	move(tetris) {
		console.log('interval', tetris.block);
		tetris.block.down();
		tetris.draw();
	};

	draw() {
		let canvas = document.getElementById('baseCanvas'),
			ctx = canvas.getContext('2d'),
			width = canvas.getAttribute('width') || '200',
			cellWidth = parseInt(width, 10) / CELL_COLS,
			height = canvas.getAttribute('height'),
			cellHeight = parseInt(height, 10) / CELL_ROWS;

		this.drawBlock();

		ctx.clearRect(0, 0, width, height);

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
};

const tetris = new Tetris();