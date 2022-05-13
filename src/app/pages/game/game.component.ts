import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements AfterViewInit, OnInit {
  @ViewChild('gameCanvas') canvas: ElementRef | undefined;

  context: CanvasRenderingContext2D | undefined;
  snake!: any[];

  apple = {
    x: 0,
    y: 0,
  };

  segmentSize = 10;
  canvasWidth = 300;
  canvasHeight = 300;

  direction = {
    x: 0,
    y: 0,
  };

  score!: number;
  allowChangingOrientation = true;
  gameOver = false;
  speed = 300;
  pause = false;

  ngAfterViewInit(): void {
    this.canvas!.nativeElement.width = this.canvasWidth;
    this.canvas!.nativeElement.height = this.canvasHeight;
    this.createContext();
  }

  ngOnInit(): void {
    this.direction.y = 0;
    this.direction.x = this.segmentSize;
    this.createGame();
  }

  createGame() {
    this.snake = [
      {
        x: this.canvasWidth / 2 - this.segmentSize,
        y: this.canvasHeight / 2,
      },
      {
        x: this.canvasWidth / 2 - this.segmentSize * 2,
        y: this.canvasHeight / 2,
      },
      {
        x: this.canvasWidth / 2 - this.segmentSize * 3,
        y: this.canvasHeight / 2,
      },
      {
        x: this.canvasWidth / 2 - this.segmentSize * 4,
        y: this.canvasHeight / 2,
      },
    ];
    this.score = 0;
    this.direction.x = this.segmentSize;
    this.direction.y = 0;
    this.createApple();
    this.animation();
  }

  animation() {
    setTimeout(() => {
      this.createContext();
      this.drawSnake();
      this.drawApple();
      this.allowChangingOrientation = true;
      if (!this.pause) {
        this.moveSnake();
      }
      this.stopGame();
      if (this.gameOver) return;
      this.animation();
    }, this.speed);
  }

  createContext() {
    if (!this.canvas) throw new Error('Canvas element no found');
    this.context = this.canvas.nativeElement.getContext('2d');
    this.context!.fillStyle = '#eee';
    this.context!.strokeStyle = '#000';
    this.context!.fillRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    this.context!.strokeRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
  }

  drawSnakeSegment(segment: any) {
    this.context!.fillStyle = '#bada55';
    this.context!.strokeStyle = '#000';
    this.context!.fillRect(segment.x, segment.y, this.segmentSize, this.segmentSize);
    this.context!.strokeRect(segment.x, segment.y, this.segmentSize, this.segmentSize);
  }

  drawSnake() {
    this.snake.forEach((segment) => {
      this.drawSnakeSegment(segment);
    });
  }

  moveSnake() {
    const snakeHead = this.snake[0];
    const newHead = { x: snakeHead.x + this.direction.x, y: snakeHead.y + this.direction.y };
    const snakeEatPomme = snakeHead.x === this.apple.x && snakeHead.y === this.apple.y;

    this.snake.unshift(newHead);
    if (snakeEatPomme) {
      this.createApple();
      this.score += 10;
      if (this.speed > 0) {
        this.speed -= 10;
      }
    } else {
      this.snake.pop();
    }
  }

  @HostListener('window:keydown', ['$event'])
  setOrientation(event: KeyboardEvent) {
    if (!this.allowChangingOrientation) return;
    this.allowChangingOrientation = false;

    const isMovingToUp = this.direction?.y === -this.segmentSize;
    const isMovingToDown = this.direction?.y === this.segmentSize;
    const isMovingToRight = this.direction?.x === this.segmentSize;
    const isMovingToLeft = this.direction?.x === -this.segmentSize;

    if (event.key === 'ArrowLeft' && !isMovingToRight) {
      this.direction.x = -this.segmentSize;
      this.direction.y = 0;
    } else if (event.key === 'ArrowUp' && !isMovingToDown) {
      this.direction.x = 0;
      this.direction.y = -this.segmentSize;
    } else if (event.key === 'ArrowRight' && !isMovingToLeft) {
      this.direction.x = this.segmentSize;
      this.direction.y = 0;
    } else if (event.key === 'ArrowDown' && !isMovingToUp) {
      this.direction.x = 0;
      this.direction.y = this.segmentSize;
    }
  }

  randomCoordinate(length: number) {
    return Math.round((Math.random() * length - this.segmentSize) / this.segmentSize) * this.segmentSize;
  }

  createApple() {
    this.apple.x = this.randomCoordinate(this.canvasWidth);
    this.apple.y = this.randomCoordinate(this.canvasHeight);

    this.snake.forEach((segment) => {
      const appleIsOnSnake = segment.x === this.apple.x && segment.y === this.apple.y;

      if (appleIsOnSnake) {
        this.createApple();
      }
    });
  }

  drawApple() {
    if (!this.context) throw new Error('Canvas element no found');
    this.context.fillStyle = 'red';
    this.context.strokeStyle = 'darkred';
    this.context.beginPath();
    this.context.arc(
      this.apple.x + this.segmentSize / 2,
      this.apple.y + this.segmentSize / 2,
      this.segmentSize / 2,
      0,
      2 * Math.PI,
    );
    this.context.fill();
    this.context.stroke();
  }

  stopGame() {
    const snakeHead = this.snake[0];
    const snakeTail = this.snake.slice(1, -1);

    const hasTouchLeftWall = snakeHead.x < -1;
    const hasTouchRightWall = snakeHead.x > this.canvasWidth - this.segmentSize;
    const hasTouchUpWall = snakeHead.y < -1;
    const hasTouchBottomWall = snakeHead.y > this.canvasHeight - this.segmentSize;

    let hasBittenHimself = false;

    snakeTail.forEach((segment) => {
      if (segment.x === snakeHead.x && segment.y === snakeHead.y) {
        hasBittenHimself = true;
      }
    });

    if (hasBittenHimself || hasTouchLeftWall || hasTouchRightWall || hasTouchUpWall || hasTouchBottomWall) {
      this.gameOver = true;
    }
  }

  @HostListener('window:keydown.space', ['$event'])
  restart() {
    if (!this.gameOver) return;
    this.createGame();
    this.gameOver = false;
  }

  @HostListener('window:keydown.p', ['$event'])
  pauseGame() {
    if (this.gameOver) return;
    this.pause = !this.pause;
    console.log('this.pause :', this.pause);
  }
}
