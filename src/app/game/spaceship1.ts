import { SpaceshipSprite } from './sprite';
import { GameService } from './game.service';
import { DEVICE_WIDTH } from '../Util/constants';

export interface Spaceship {
  xPosition: number;
  yPosition: number;
  xShots: number[];
  yShots: number[];
  shoot: boolean;
  shouldShootCount: number;
  render(ctx: CanvasRenderingContext2D);
  moveLeftRemote(move: boolean);
  moveRightRemote(move: boolean);
}

export class Spaceship1 implements Spaceship {
  private sprite: SpaceshipSprite;
  public xPosition: number;
  public yPosition: number;
  public xShots: number[] = [];
  public yShots: number[] = [];
  public shoot: boolean;
  public shouldShootCount: number;
  private mvLeft: boolean;
  private mvRight: boolean;

  constructor(xpos: number, ypos: number, playerId: number) {
    this.xPosition = xpos;
    this.yPosition = ypos;
    this.shoot = false;
    this.shouldShootCount = 0;
    this.sprite = new SpaceshipSprite(playerId);
  }

  render(ctx: CanvasRenderingContext2D) {
    if(this.mvRight) {
      this.moveRight();
    } else if(this.mvLeft) {
      this.moveLeft();
    }
    if(this.xPosition > (DEVICE_WIDTH)*2) {
      this.xPosition = 0;
    }
    else if(this.xPosition < (DEVICE_WIDTH)*-1) {
      this.xPosition = DEVICE_WIDTH;
    }

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
    this.shouldShootCount++;
    if(this.shouldShootCount > 4) {
      this.shouldShootCount = 0;
      this.xShots.push(this.xPosition+30);
      this.xShots.push(this.xPosition+85);
      this.yShots.push(this.yPosition+25);
      this.yShots.push(this.yPosition+25);
    }

    this.sprite.render(ctx, this.xPosition, this.yPosition);
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
