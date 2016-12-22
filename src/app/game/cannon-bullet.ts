import { Spaceship } from './spaceship';
import { BULLET_CANNON_WIDTH, BULLET_CANNON_HEIGHT } from '../Util/constants';
import { Bullet } from './bullet';
import { CannonBulletSprite } from './sprite';

export class CannonBullet implements Bullet{
  public xPosition: number;
  public yPosition: number;
  public width = 15;
  public height = 30;
  private sprite = new CannonBulletSprite();
  private pause = false;

  constructor(x: number, y: number) {
    this.xPosition = x;
    this.yPosition = y;
  }

  render(ctx: CanvasRenderingContext2D) {
    this.sprite.render(ctx, this.xPosition, this.yPosition);
    if(!this.pause) {
      this.nextPosition();
    }
  }

  private nextPosition(){
      this.yPosition+=10;
  }

  gamePaused(b: boolean) {
    this.pause = b;
  }
}
