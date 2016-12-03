import { Spaceship2Sprite } from './sprite';
import { DEVICE_WIDTH } from '../Util/constants';
import { Spaceship } from './spaceship1';

export class Spaceship2 implements Spaceship {
  private sprite: Spaceship2Sprite = new Spaceship2Sprite();
  public xPosition: number;
  public yPosition: number;
  public xShots: number[] = [];
  public yShots: number[] = [];
  public shoot: boolean;
  public shouldShootCount: number;
  private mvLeft: boolean;
  private mvRight: boolean;

  constructor(xpos: number, ypos: number) {
    this.xPosition = xpos;
    this.yPosition = ypos;
    this.shoot = false;
    this.shouldShootCount = 0;

  }

  render(ctx: CanvasRenderingContext2D) {
    var removeShots = [];
    for(var i = 0; i < this.xShots.length; i++) {
      ctx.fillStyle = 'green';
      ctx.fillRect(this.xShots[i], this.yShots[i], 5, 15);
      this.yShots[i]-=10;
      if(this.yShots[i] < 15) {
        removeShots.push(i);
      }
    }
    for(let i of removeShots) {
      this.yShots.shift();
      this.xShots.shift();
    }
    this.sprite.render(ctx, this.xPosition, this.yPosition);
    this.shouldShootCount++;
    if(this.shouldShootCount > 4) {
      this.shouldShootCount = 0;
      this.xShots.push(this.xPosition+30);
      this.xShots.push(this.xPosition+85);
      this.yShots.push(this.yPosition+25);
      this.yShots.push(this.yPosition+25);
    }

    if(this.mvRight) {
      this.moveRight();
    } else if(this.mvLeft) {
      this.moveLeft();
    }

  }

  private moveLeft() {
    this.xPosition-=10;
  }

  moveLeftRemote(move: boolean) {
    this.mvLeft = move;
  }

  private moveRight() {
    this.xPosition+=10;
  }

  moveRightRemote(move: boolean) {
    this.mvRight = move;
  }
}
