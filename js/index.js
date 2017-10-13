/* Snake */

class Snake {
	constructor() {
		this.position = new Point(6, 1);
		this.length = 5;
		this.dead = false;
		this.direction = Directions.right;
		this.tail = [ 
			new Tail(1, 1, this.direction, false),
			new Tail(2, 1, this.direction, false),
			new Tail(3, 1, this.direction, false),
			new Tail(4, 1, this.direction, false),
			new Tail(5, 1, this.direction, false)
		];
		this.newCorner = false;
	}

	move(direction) {
		if(Math.abs(this.direction - direction) != 2 && direction != this.direction) {
			this.newCorner = this.direction;
			this.direction = direction;
		}
	}

	update() {
		// Invert the position when offscreen
		this.position.x = (this.position.x > cols - 1) ? 0 : (this.position.x < 0) ? cols - 1 : this.position.x;
		this.position.y = (this.position.y > rows - 1) ? 0 : (this.position.y < 0) ? rows - 1 : this.position.y;

		// Eat the food if crosses
		if(this.position.x == food.position.x && this.position.y == food.position.y) {
			snd_eat.play();
			this.length++;
			food.update(this);
			score.innerHTML = this.length * 5;
		}

		// If no food has been eaten since the last tick
		if(this.length == this.tail.length) {
			for(let i = 0; i < this.tail.length - 1; i++) {
				// Shift parts of the body
				this.tail[i] = this.tail[i+1];
				if(this.tail[i].pos.x == this.position.x && this.tail[i].pos.y == this.position.y) {
					this.dead = true;
				}
			}
		}

		// Puts the first part of the body at the heads previous position
		if(this.length > 0) {
			this.tail[this.length - 1] = new Tail(this.position.x, this.position.y, this.direction, this.newCorner);
			this.newCorner = false;
		}

		// Moves the snake
		switch(this.direction) {
			case Directions.left: this.position.x--; break;
			case Directions.up: this.position.y--; break;
			case Directions.right: this.position.x++; break;
			case Directions.down: this.position.y++; break;
		}
	}

	draw() {
		context.fillStyle = '#F0F0F0';
		context.fillRect(0, 0, cols, rows);
		let tailLength = this.tail.length;
		for(let i = 0; i < tailLength; i++) {
			if(i == 0) {
				switch(this.tail[i].dir) {
					case Directions.up: context.drawImage(sprites.tail_down, this.tail[i].pos.x, this.tail[i].pos.y, 1, 1); break;
					case Directions.down: context.drawImage(sprites.tail_up, this.tail[i].pos.x, this.tail[i].pos.y, 1, 1); break;
					case Directions.left: context.drawImage(sprites.tail_right, this.tail[i].pos.x, this.tail[i].pos.y, 1, 1); break;
					case Directions.right: context.drawImage(sprites.tail_left, this.tail[i].pos.x, this.tail[i].pos.y, 1, 1); break;
				}
			}
			else {
				context.drawImage(this.defineSprite(this.tail[i]), this.tail[i].pos.x, this.tail[i].pos.y, 1, 1);
			}
		}
		switch(this.direction) {
			case Directions.up: context.drawImage(sprites.snake_up, this.position.x, this.position.y, 1, 1); break;
			case Directions.down: context.drawImage(sprites.snake_down, this.position.x, this.position.y, 1, 1); break;
			case Directions.left: context.drawImage(sprites.snake_left, this.position.x, this.position.y, 1, 1); break;
			case Directions.right: context.drawImage(sprites.snake_right, this.position.x, this.position.y, 1, 1); break;
		}
	}

	defineSprite(tail) {
		let sp;
		if(tail.corner) {
			switch(tail.corner) {
				case Directions.up: sp = (tail.dir == Directions.left) ? sprites.corner_rt : sprites.corner_lt; break;
				case Directions.down: sp = (tail.dir == Directions.left) ? sprites.corner_rb : sprites.corner_lb; break;
				case Directions.left: sp = (tail.dir == Directions.up) ? sprites.corner_lb : sprites.corner_lt; break;
				case Directions.right: sp = (tail.dir == Directions.up) ? sprites.corner_rb : sprites.corner_rt; break;
			}
		} else {
			sp = (tail.dir == Directions.up || tail.dir == Directions.down) ? sprites.body_v : sprites.body_h;
		}
		return sp;
	}
}

/* Food */

class Food {
	constructor() {
		this.position = new Point(Random(0, cols - 1), Random(0, rows - 1));
	}

	update(snake) {
		this.position = this.findEmptyPosition(snake);
	}

	findEmptyPosition(snake) {
		if(snake.length > cols * rows) {
			return false;
		}

		let found = false;
		let position;
		while(!found) {
			position = new Point(Random(0, cols - 1), Random(0, rows - 1));
			let isOnTail = false;
			if(position.x != snake.position.x || position.y != snake.position.y) {
				for(let i = 0; i < snake.tail.length; i++) {
					if(snake.tail[i].pos.x == position.x && snake.tail[i].pos.y == position.y) {
						isOnTail = true;
					}
				}
				found = !isOnTail;
			}
		}
		return position;
	}

	draw() {
		context.drawImage(sprites.food, this.position.x, this.position.y, 1, 1);
	}
}

/* Tail */

function Tail(x, y, dir, corner) {
	return { 
		pos: new Point(x, y),
		dir: dir,
		corner: corner
	};
}

/* Point */

function Point(x, y) {
	return { x: x, y: y };
}

/* Random */

function Random(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* Settings */

var canvas, score, context, scale, cols, rows, sprites, snake, food, timer, allowedToMove, snd_eat, snd_background, music_control, sndeffects_control, game_launched;
var newGame = false;
window.onload = function() {
	canvas = document.querySelector('#canvas');
	score = document.querySelector('.score');
	context = canvas.getContext('2d');
	scale = 32;
	cols = Math.floor(canvas.width / scale);
	rows = Math.floor(canvas.height / scale);
	sprites = {
		food: new Image(scale, scale),
		snake_up: new Image(scale, scale),
		snake_down: new Image(scale, scale),
		snake_left: new Image(scale, scale),
		snake_right: new Image(scale, scale),
		tail_up: new Image(scale, scale),
		tail_down: new Image(scale, scale),
		tail_left: new Image(scale, scale),
		tail_right: new Image(scale, scale),
		body_v: new Image(scale, scale),
		body_h: new Image(scale, scale),
		corner_rb: new Image(scale, scale),
		corner_rt: new Image(scale, scale),
		corner_lb: new Image(scale, scale),
		corner_lt: new Image(scale, scale),
	};
	loadSprites();
	context.scale(scale, scale);
	
	snake = new Snake();
	food = new Food();
	snd_eat = new Audio("assets/eat.wav");
	snd_background = new Audio("assets/background.mp3");
	snd_background.loop = true;
	snd_background.volume = 0.07;
	snd_background.play();

	music_control = document.querySelector('[name=music]');
	music_control.onchange = () => {
		if(music_control.checked) {
			snd_background.play();
		} else {
			snd_background.pause();
		}
	};

	sndeffects_control = document.querySelector('[name=sound_effects]');
	sndeffects_control.onchange = () => {
		snd_eat.volume = (sndeffects_control.checked) ? 1 : 0;
	};
	context.globalAlpha = 0.3;
	game_launched = false;
	snake.draw();
	food.draw();	
}

const Directions = {
	left: 37,
	up: 38,
	right: 39,
	down: 40
};

document.querySelector('body').onkeydown = function(event) {
	event.preventDefault();
	if(allowedToMove && event.keyCode >= Directions.left && event.keyCode <= Directions.down) {
		allowedToMove = false;
		snake.move(event.keyCode);
	}
}

function loadSprites() {
	sprites.food.src = "assets/sprites/food.png";
	sprites.snake_up.src = "assets/sprites/snake_up.png";
	sprites.snake_down.src = "assets/sprites/snake_down.png";
	sprites.snake_left.src = "assets/sprites/snake_left.png";
	sprites.snake_right.src = "assets/sprites/snake_right.png";
	sprites.tail_up.src = "assets/sprites/tail_up.png";
	sprites.tail_down.src = "assets/sprites/tail_down.png";
	sprites.tail_left.src = "assets/sprites/tail_left.png";
	sprites.tail_right.src = "assets/sprites/tail_right.png";
	sprites.body_v.src = "assets/sprites/body_v.png";
	sprites.body_h.src = "assets/sprites/body_h.png";
	sprites.corner_rb.src = "assets/sprites/corner_rb.png";
	sprites.corner_rt.src = "assets/sprites/corner_rt.png";
	sprites.corner_lb.src = "assets/sprites/corner_lb.png";
	sprites.corner_lt.src = "assets/sprites/corner_lt.png";
}

document.querySelector('.btn-play').onclick = function() {
	if(newGame) {
		snake = new Snake();
		timer = setInterval(gameLoop, 60);
		game_launched = true;
		this.innerHTML = '<i class="fa fa-pause"></i> Pause';
		newGame = false;
	}
	else if(game_launched) {
		game_launched = false;
		clearInterval(timer);
		this.innerHTML = '<i class="fa fa-play"></i> Reprendre';
	} else if(!game_launched) {
		context.globalAlpha = 1;
		timer = setInterval(gameLoop, 60);
		this.innerHTML = '<i class="fa fa-pause"></i> Pause';
		game_launched = true;
	}
}

function gameLoop() {
	if(snake.dead) {
		context.font = '3px PaintyPaint';
		context.fillStyle = '#C0392B';
		context.textBaseline = 'middle';
		context.fillText('Game Over', cols / 4, rows / 3);
		context.font = '2px PaintyPaint';
		context.fillStyle = '#2980B9';
		context.fillText('Score ' + snake.length * 5, cols / 3, rows / 2);
		clearInterval(timer);
		document.querySelector('.btn-play').innerHTML = '<i class="fa fa-play"></i> Nouvelle partie';
		newGame = true;
	}
	else {
		snake.update();
		snake.draw();
		food.draw();
		allowedToMove = true;
	}
		
}