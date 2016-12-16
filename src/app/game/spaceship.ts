import { SpaceshipSprite } from './sprite';
import { GameService } from './game.service';
import { DEVICE_WIDTH, SHIP_WIDTH, SHIP_HEIGHT } from '../Util/constants';
import { BulletHandler } from './bullet-handler';

const SHIELD_NORMAL_SOURCE = 'images/sprites/shipshield.png';
const SHIELD_NORMAL_T_SOURCE = 'images/sprites/shipshield-transparent.png';
const SHIELD_COLOC_SOURCE = 'images/sprites/shipshield-2.png';
const SHIELD_COLOC_T_SOURCE = 'images/sprites/shipshield-2-transparent.png';

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
  playerId: number;
  charges: number;
  coLocated: boolean;
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
  public charges: number;
  private isSamePosition: boolean;

  constructor(xpos: number, ypos: number, private player: number, isMe: boolean,
      cannon1X: number, cannon1Y: number, cannon2X: number, cannon2Y: number) {
    this.xPosition = xpos;
    this.yPosition = ypos;
    this.visibleX = this.xPosition;
    this.height = SHIP_HEIGHT;
    this.width = SHIP_WIDTH;
    this.visible = true;
    this.sprite = new SpaceshipSprite(player);
    this.bulletHandler = new BulletHandler(this, isMe);
    this.cannonPosition1X = cannon1X;
    this.cannonPosition1Y = cannon1Y;
    this.cannonPosition2X = cannon2X;
    this.cannonPosition2Y = cannon2Y;
    this.charges = 0;
    this.isSamePosition = false;
  }

  get playerId(): number { return this.player == 0? 0 : 1; }

  get coLocated(): boolean { return this.isSamePosition; }
  set coLocated(b: boolean) { this.isSamePosition = b; }

  render(ctx: CanvasRenderingContext2D) {
    if(this.mvRight) {
      this.moveRight();
    } else if(this.mvLeft) {
      this.moveLeft();
    }

    if(this.xPosition > (DEVICE_WIDTH)) {
      this.xPosition = 0;
    }
    else if(this.xPosition < 0) {
      this.xPosition = DEVICE_WIDTH;
    }

    this.visibleX = this.xPosition;
    
    if(this.player == 0) {
      this.bulletHandler.bullets = []
      this.renderShield(ctx);
    }

    this.bulletHandler.render(ctx);
    this.sprite.render(ctx, this.xPosition, this.yPosition);

    if(this.player == 0) {
      this.bulletHandler.bullets = [];
      this.renderTransparentShield(ctx);
    }
  }

  private renderShield(ctx: CanvasRenderingContext2D){
    if(this.isSamePosition) {
      let img = new Image();
      img.src = SHIELD_COLOC_SOURCE;
      ctx.drawImage(img, this.visibleX-((180-SHIP_WIDTH)/2), this.yPosition-60);
    } else {
      let img = new Image();
      img.src = SHIELD_NORMAL_SOURCE;
      ctx.drawImage(img, this.visibleX-((160-SHIP_WIDTH)/2), this.yPosition-50);
    }
  }

  private renderTransparentShield(ctx: CanvasRenderingContext2D){
    if(this.isSamePosition) {
      let img = new Image();
      img.src = SHIELD_COLOC_T_SOURCE;
      ctx.drawImage(img, this.visibleX-((160-SHIP_WIDTH)/2), this.yPosition-50);
    } else {
      let img = new Image();
      img.src = SHIELD_NORMAL_T_SOURCE;
      ctx.drawImage(img, this.visibleX-((160-SHIP_WIDTH)/2), this.yPosition-50);
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
  public charges: number;
  private isSamePosition: boolean;

  constructor(xpos: number, ypos: number, private player: number, private isMe: boolean,
              cannon1X: number, cannon1Y: number, cannon2X: number, cannon2Y: number) {
    this.xPosition = xpos;
    this.yPosition = ypos;
    this.sprite = new SpaceshipSprite(player);
    this.bulletHandler = new BulletHandler(this, isMe);
    this.visible = true;
    this.height = SHIP_HEIGHT;
    this.width = SHIP_WIDTH;
    this.cannonPosition1X = cannon1X;
    this.cannonPosition1Y = cannon1Y;
    this.cannonPosition2X = cannon2X;
    this.cannonPosition2Y = cannon2Y;
    this.charges = 0;
    this.isSamePosition = false;
  }

  get playerId(): number { return this.player == 0? 0 : 1; }

  get coLocated(): boolean { return this.isSamePosition; }
  set coLocated(b: boolean) { this.isSamePosition = b; }
  
  render(ctx: CanvasRenderingContext2D) {
    if(this.mvRight) {
      this.moveRight();
    } else if(this.mvLeft) {
      this.moveLeft();
    }
    if(this.xPosition > (DEVICE_WIDTH)) {
      this.xPosition = 0;
    }
    else if(this.xPosition < 0) {
      this.xPosition = DEVICE_WIDTH;
    }

    this.visibleX = this.xPosition;

    this.bulletHandler.render(ctx);
    
    if(this.player == 0) {
      this.bulletHandler.bullets = []
      this.renderShield(ctx);
    }

    this.sprite.render(ctx, this.visibleX, this.yPosition);
    
    if(this.player == 0) {
      this.bulletHandler.bullets = [];
      this.renderTransparentShield(ctx);
    }
  }

  private renderShield(ctx: CanvasRenderingContext2D){
    if(this.isSamePosition) {
      let img = new Image();
      img.src = SHIELD_COLOC_SOURCE;
      ctx.drawImage(img, this.visibleX-((180-SHIP_WIDTH)/2), this.yPosition-60);
    } else {
      let img = new Image();
      img.src = SHIELD_NORMAL_SOURCE;
      ctx.drawImage(img, this.visibleX-((160-SHIP_WIDTH)/2), this.yPosition-50);
    }
  }

  private renderTransparentShield(ctx: CanvasRenderingContext2D){
    if(this.isSamePosition) {
      let img = new Image();
      img.src = SHIELD_COLOC_T_SOURCE;
      ctx.drawImage(img, this.visibleX-((160-SHIP_WIDTH)/2), this.yPosition-50);
    } else {
      let img = new Image();
      img.src = SHIELD_NORMAL_T_SOURCE;
      ctx.drawImage(img, this.visibleX-((160-SHIP_WIDTH)/2), this.yPosition-50);
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