import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements AfterViewInit {
  @ViewChild('gameCanvas') canvas: ElementRef | undefined;

  context: CanvasRenderingContext2D | undefined;
  snake = [
    {
      x: 140,
      y: 150,
    },
    {
      x: 130,
      y: 150,
    },
    {
      x: 120,
      y: 150,
    },
    {
      x: 110,
      y: 150,
    },
  ];

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

  ngAfterViewInit(): void {
    this.canvas!.nativeElement.width = this.canvasWidth;
    this.canvas!.nativeElement.height = this.canvasHeight;
    this.createContext();
    this.direction.y = 0;
    this.direction.x = this.segmentSize;
    this.createApple();
    this.animation();
  }

  animation() {
    setTimeout(() => {
      this.createContext();
      this.drawSnake();
      this.drawApple();
      this.moveSnakeHorizontally();
      this.animation();
    }, 100);
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

  moveSnakeHorizontally() {
    const newHead = { x: this.snake[0].x + this.direction.x, y: this.snake[0].y + this.direction.y };
    this.snake.unshift(newHead);
    this.snake.pop();
  }

  @HostListener('window:keydown', ['$event'])
  setOrientation(event: KeyboardEvent) {
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

    console.log('this.apple :', this.apple);
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
}
