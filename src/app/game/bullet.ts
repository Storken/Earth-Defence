import { Spaceship } from './spaceship';
import { BULLET_NORMAL_WIDTH, BULLET_NORMAL_HEIGHT } from '../Util/constants';

export interface Bullet {
  xPosition: number;
  yPosition: number;
  width: number;
  height: number;
  render(ctx: CanvasRenderingContext2D);
  gamePaused(b: boolean);
}

export class NormalBullet implements Bullet{
  public xPosition: number;
  public yPosition: number;
  public width: number;
  public height: number;
  private pause: boolean;

  constructor(x: number, y: number) {
    this.xPosition = x;
    this.yPosition = y;
    this.width = BULLET_NORMAL_WIDTH;
    this.height = BULLET_NORMAL_HEIGHT;
    this.pause = false;
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'red';
    ctx.fillRect(this.xPosition, this.yPosition, 5, 15);
    if(!this.pause) {
      this.yPosition-=10;
    }
  }

  gamePaused(b: boolean) {
    this.pause = b;
  }
}
