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

  direction = {
    x: 0,
    y: 0,
  };

  ngAfterViewInit(): void {
    this.createContext();
    this.direction.y = 0;
    this.direction.x = 10;
    this.animation();
  }

  animation() {
    setTimeout(() => {
      this.createContext();
      this.drawSnake();
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
    this.context!.fillRect(segment.x, segment.y, 10, 10);
    this.context!.strokeRect(segment.x, segment.y, 10, 10);
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
    const isMovingToUp = this.direction?.y === -10;
    const isMovingToDown = this.direction?.y === 10;
    const isMovingToRight = this.direction?.x === 10;
    const isMovingToLeft = this.direction?.x === -10;

    if (event.key === 'ArrowLeft' && !isMovingToRight) {
      this.direction.x = -10;
      this.direction.y = 0;
    } else if (event.key === 'ArrowUp' && !isMovingToDown) {
      this.direction.x = 0;
      this.direction.y = -10;
    } else if (event.key === 'ArrowRight' && !isMovingToLeft) {
      this.direction.x = 10;
      this.direction.y = 0;
    } else if (event.key === 'ArrowDown' && !isMovingToUp) {
      this.direction.x = 0;
      this.direction.y = 10;
    }
  }
}