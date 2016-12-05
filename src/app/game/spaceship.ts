import { SpaceshipSprite } from './sprite';
import { GameService } from './game.service';
import { DEVICE_WIDTH, SHIP_WIDTH, SHIP_HEIGHT } from '../Util/constants';
import { BulletHandler } from './bullet-handler';

export interface Spaceship {
  xPosition: number;
  yPosition: number;
  cannonPosition1X: number;
  cannonPosition1Y: number;
  cannonPosition2X: number;
  cannonPosition2Y: number;
  width: number;
  height: number;
  visible: boolean;
  visibleX: number;
  bulletHandler: BulletHandler;
  render(ctx: CanvasRenderingContext2D);
  moveLeftRemote(move: boolean);
  moveRightRemote(move: boolean);
}

export class Spaceship1 implements Spaceship {
  private sprite: SpaceshipSprite;
  public xPosition: number;
  public yPosition: number;
  public height: number;
  public width: number;
  private mvLeft: boolean;
  private mvRight: boolean;
  public bulletHandler: BulletHandler;
  public visible: boolean;
  public visibleX: number;
  public cannonPosition1X: number;
  public cannonPosition1Y: number;
  public cannonPosition2X: number;
  public cannonPosition2Y: number;

  constructor(xpos: number, ypos: number, playerId: number, isMe: boolean,
      cannon1X: number, cannon1Y: number, cannon2X: number, cannon2Y: number) {
    this.xPosition = xpos;
    this.yPosition = ypos;
    this.visibleX = this.xPosition;
    this.height = SHIP_HEIGHT;
    this.width = SHIP_WIDTH;
    this.visible = true;
    this.sprite = new SpaceshipSprite(playerId);
    this.bulletHandler = new BulletHandler(this, isMe);
    this.cannonPosition1X = cannon1X;
    this.cannonPosition1Y = cannon1Y;
    this.cannonPosition2X = cannon2X;
    this.cannonPosition2Y = cannon2Y;
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

    this.visibleX = this.xPosition;

    this.bulletHandler.render(ctx);

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

export class Spaceship2 implements Spaceship {
  private sprite: SpaceshipSprite;
  public bulletHandler: BulletHandler;
  public xPosition: number;
  public yPosition: number;
  public visibleX: number;
  private mvLeft: boolean;
  private mvRight: boolean;
  public visible: boolean;
  public height: number;
  public width: number;
  public cannonPosition1X: number;
  public cannonPosition1Y: number;
  public cannonPosition2X: number;
  public cannonPosition2Y: number;

  constructor(xpos: number, ypos: number, private playerId: number, private isMe: boolean,
              cannon1X: number, cannon1Y: number, cannon2X: number, cannon2Y: number) {
    this.xPosition = xpos;
    this.yPosition = ypos;
    this.sprite = new SpaceshipSprite(playerId);
    this.bulletHandler = new BulletHandler(this, isMe);
    this.visible = false;
    this.height = SHIP_HEIGHT;
    this.width = SHIP_WIDTH;
    this.cannonPosition1X = cannon1X;
    this.cannonPosition1Y = cannon1Y;
    this.cannonPosition2X = cannon2X;
    this.cannonPosition2Y = cannon2Y;
  }

  render(ctx: CanvasRenderingContext2D) {
    if(this.mvRight) {
      this.moveRight();
    } else if(this.mvLeft) {
      this.moveLeft();
    }
    if(this.xPosition > 0 && this.xPosition < DEVICE_WIDTH-SHIP_WIDTH) {
      this.visible = false;
    } else if(this.xPosition > (DEVICE_WIDTH)*2) {
      this.xPosition = 0;
    }
    else if(this.xPosition < (DEVICE_WIDTH)*-1) {
      this.xPosition = DEVICE_WIDTH;
    } else {
      this.visible = true;
    }

    this.visibleX = this.xPosition;

    if(this.visibleX <= 0) {
      this.visibleX = this.xPosition+DEVICE_WIDTH;
    } else {
      this.visibleX = this.xPosition-DEVICE_WIDTH;
    }

    this.bulletHandler.render(ctx);

    if(this.visible){
      this.sprite.render(ctx, this.visibleX, this.yPosition);
    } else {
      this.sprite.render(ctx, DEVICE_WIDTH + 10, this.yPosition);
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
