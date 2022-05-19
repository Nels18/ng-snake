import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';

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
  canvasWidth = 240;
  canvasHeight = 240;

  direction = {
    x: 0,
    y: 0,
  };

  score!: number;
  allowChangingOrientation = true;
  gameOver = false;
  speed = 300;
  pause = false;
  eventText = '';
  isMobile: boolean | undefined;

  constructor(private deviceService: DeviceDetectorService) {
    this.isMobile = this.deviceService.isMobile();
  }

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
      if (!this.pause) {
        this.createContext();
        this.drawGrid();
        this.drawSnake();
        this.drawApple();
        this.allowChangingOrientation = true;
        this.moveSnake();
        this.stopGame();
        if (this.gameOver) return;
      }
      this.animation();
    }, this.speed);
  }

  createContext() {
    if (!this.canvas) throw new Error('Canvas element no found');
    this.context = this.canvas.nativeElement.getContext('2d');
    this.context!.fillStyle = '#eee';
    this.context!.fillRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
  }

  drawGrid() {
    if (!this.context) throw new Error('Context no found');

    this.context.lineWidth = 1;
    this.context.strokeStyle = '#ddd';
    this.context.shadowBlur = 0;
    for (let i = 1; i < this.canvasWidth; i++) {
      const f = this.canvasWidth * (this.segmentSize / this.canvasWidth) * i;
      this.context.beginPath();
      this.context.moveTo(f, 0);
      this.context.lineTo(f, this.canvasHeight);
      this.context.stroke();
      this.context.beginPath();
      this.context.moveTo(0, f);
      this.context.lineTo(this.canvasWidth, f);
      this.context.stroke();
      this.context.closePath();
    }
  }

  drawSnakeSegment(index: any) {
    if (index === 0) {
      this.context!.fillStyle = '#B3c001';
    } else {
      this.context!.fillStyle = '#bada55';
    }
    this.context!.strokeStyle = '#674';
    this.context!.fillRect(
      this.snake[index].x + 0.5,
      this.snake[index].y + 0.5,
      this.segmentSize - 1,
      this.segmentSize - 1,
    );
    this.context!.strokeRect(
      this.snake[index].x + 0.5,
      this.snake[index].y + 0.5,
      this.segmentSize - 1,
      this.segmentSize - 1,
    );
  }

  drawSnake() {
    for (let index = 0; index < this.snake.length; index++) {
      this.drawSnakeSegment(index);
    }
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

  setOrientation(newDirection: string) {
    if (!this.allowChangingOrientation) return;
    this.allowChangingOrientation = false;

    const isMovingToUp = this.direction?.y === -this.segmentSize;
    const isMovingToDown = this.direction?.y === this.segmentSize;
    const isMovingToRight = this.direction?.x === this.segmentSize;
    const isMovingToLeft = this.direction?.x === -this.segmentSize;

    if (newDirection === 'left' && !isMovingToRight) {
      this.direction.x = -this.segmentSize;
      this.direction.y = 0;
    } else if (newDirection === 'up' && !isMovingToDown) {
      this.direction.x = 0;
      this.direction.y = -this.segmentSize;
    } else if (newDirection === 'right' && !isMovingToLeft) {
      this.direction.x = this.segmentSize;
      this.direction.y = 0;
    } else if (newDirection === 'down' && !isMovingToUp) {
      this.direction.x = 0;
      this.direction.y = this.segmentSize;
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyboardChangeOrientation(event: KeyboardEvent) {
    let newDirection = '';

    if (event.key === 'ArrowDown') {
      newDirection = 'down';
    } else if (event.key === 'ArrowUp') {
      newDirection = 'up';
    } else if (event.key === 'ArrowRight') {
      newDirection = 'right';
    } else if (event.key === 'ArrowLeft') {
      newDirection = 'left';
    }

    this.setOrientation(newDirection);
  }

  onSwipeOrientation(event: any) {
    let newDirection = '';

    if (event.angle > -45 && event.angle < 45) {
      newDirection = 'right';
    } else if (event.angle > 45 && event.angle < 135) {
      newDirection = 'down';
    } else if (event.angle > 135 || event.angle < -135) {
      newDirection = 'left';
    } else if (event.angle > -135 && event.angle < -45) {
      newDirection = 'up';
    }

    this.setOrientation(newDirection);
  }

  randomCoordinate(length: number): number {
    let randomNumber;
    randomNumber = Math.round((Math.random() * length - this.segmentSize) / this.segmentSize) * this.segmentSize;
    if (randomNumber < 0) randomNumber = 0;
    return randomNumber;
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
    this.context.fillStyle = '#f00';
    this.context.strokeStyle = '#700';
    this.context.beginPath();
    this.context.arc(
      this.apple.x + this.segmentSize / 2,
      this.apple.y + this.segmentSize / 2,
      this.segmentSize / 2 - 1,
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
  onPressKeyRestart() {
    this.restart();
  }

  restart() {
    if (!this.gameOver) return;
    this.createGame();
    this.gameOver = false;
  }

  @HostListener('window:keydown.p', ['$event'])
  onPressKeyPause() {
    this.pauseGame();
  }

  pauseGame() {
    if (this.gameOver) return;
    this.pause = !this.pause;
  }
}
