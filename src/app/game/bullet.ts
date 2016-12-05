import { Spaceship } from './spaceship';
import { BULLET_NORMAL_WIDTH, BULLET_NORMAL_HEIGHT } from '../Util/constants';

export interface Bullet {
  xPosition: number;
  yPosition: number;
  width: number;
  height: number;
  render(ctx: CanvasRenderingContext2D);
}

export class NormalBullet implements Bullet{
  public xPosition: number;
  public yPosition: number;
  public width: number;
  public height: number;

  constructor(x: number, y: number) {
    this.xPosition = x;
    this.yPosition = y;
    this.width = BULLET_NORMAL_WIDTH;
    this.height = BULLET_NORMAL_HEIGHT;
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'green';
    ctx.fillRect(this.xPosition, this.yPosition, 5, 15);
    this.yPosition-=10;
  }
}
