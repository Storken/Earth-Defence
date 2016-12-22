import { SpaceshipSprite } from './sprite';
import { GameService } from './game.service';
import { DEVICE_WIDTH, SHIP_WIDTH, SHIP_HEIGHT, 
  LASER_BUTTON_WIDTH, LASER_BUTTON_HEIGHT, DEVICE_HEIGHT, 
  SHIP_SHIELD_IMAGE_WIDTH, MUFO_CANNON_WIDTH,
  SHIP_SHIELD_WIDTH} from '../Util/constants';
import { BulletHandler } from './bullet-handler';
import { log } from '../Util/Log.service';
import { Observable } from 'rxjs/Rx';
import { MotherUfo } from './ufo';

//shield source constants
const SHIELD_NORMAL_SOURCE = 'images/sprites/shipshield.png';
const SHIELD_NORMAL_T_SOURCE = 'images/sprites/shipshield-transparent.png';
const SHIELD_COLOC_SOURCE = 'images/sprites/shipshield-2.png';
const SHIELD_COLOC_1_SOURCE = 'images/sprites/shipshield-2-phase-1.png';
const SHIELD_COLOC_2_SOURCE = 'images/sprites/shipshield-2-phase-2.png';
const SHIELD_COLOC_3_SOURCE = 'images/sprites/shipshield-2-phase-3.png';
const SHIELD_COLOC_4_SOURCE = 'images/sprites/shipshield-2-phase-4.png';
const SHIELD_LASER_HIT_SOURCE = 'images/sprites/ship-laser-hit.png';
const SHIELD_LASER_SOURCE = 'images/sprites/ship-laser.png';
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
  loadLaser: number;
  loadedLaser: boolean;
  coLocated: boolean;
  fireLaser(mUfo: MotherUfo);
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
  public charge: number;
  private isSamePosition: boolean;
  private laserLoad: number;
  private laserLoaded: boolean;
  private laserCreated: boolean;
  private laserObserver: any;
  private shieldlasersource: string;

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
    this.charge = 0;
    this.isSamePosition = false;
    this.laserLoad = 0;
    this.laserLoaded = false;
    this.laserCreated = false;
    this.shieldlasersource = SHIELD_COLOC_4_SOURCE;
  }

  get playerId(): number { return this.player == 0? 0 : 1; }

  get coLocated(): boolean { return this.isSamePosition; }
  set coLocated(b: boolean) { this.isSamePosition = b; }

	get charges(): number { return this.charge; }
  set charges(value: number) { 
    this.charge = value;
    if(this.charge > 5){
      this.charge = 5;
    } 
  }

	get loadedLaser(): boolean { return this.laserLoaded; }

	get loadLaser(): number { return this.laserLoad; }
  set loadLaser(b: number) { this.laserLoad = b; }
  

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
      this.renderTransparentShield(ctx);
    }

    if(!this.coLocated) {
      this.laserLoad = 0;
      this.shieldlasersource = SHIELD_COLOC_4_SOURCE;
    }
    
    if(this.laserLoad >= 4) {
      this.laserLoad = 4;
      this.laserLoaded = true;
    } else {
      this.laserLoaded = false;
    }
  }

  private renderShield(ctx: CanvasRenderingContext2D){
    if(this.isSamePosition) {
      let img = new Image();
      img.src = SHIELD_COLOC_SOURCE;
      ctx.drawImage(img, this.visibleX-((SHIP_SHIELD_IMAGE_WIDTH-SHIP_WIDTH)/2), 0);
    } else {
      let img = new Image();
      img.src = SHIELD_NORMAL_SOURCE;
      ctx.drawImage(img, this.visibleX-((SHIP_SHIELD_IMAGE_WIDTH-SHIP_WIDTH)/2), 0);
    }
  }

  private renderTransparentShield(ctx: CanvasRenderingContext2D){
    if(this.isSamePosition) {
      log("Laserload", this.laserLoad);
      log("Charges", this.charge);
      let img = new Image();
      img.src = this.shieldlasersource;
      switch(this.laserLoad) {
        case 0:
          img.src = SHIELD_COLOC_T_SOURCE;
          break;
        case 1:
          img.src = SHIELD_COLOC_1_SOURCE;
          break;
        case 2:
          img.src = SHIELD_COLOC_2_SOURCE;
          break;
        case 3:
          img.src = SHIELD_COLOC_3_SOURCE;
          break;
        case 4:
          img.src = this.shieldlasersource;
          break;
      }
      ctx.drawImage(img, this.visibleX-((SHIP_SHIELD_IMAGE_WIDTH-SHIP_WIDTH)/2), 0);
    } else {
      let img = new Image();
      img.src = SHIELD_NORMAL_T_SOURCE;
      ctx.drawImage(img, this.visibleX-((SHIP_SHIELD_IMAGE_WIDTH-SHIP_WIDTH)/2), 0);
    }
  }

  fireLaser(mUfo: MotherUfo) {
    this.shieldlasersource = SHIELD_LASER_SOURCE;
    if(this.player == 0) {
      if((this.visibleX-(SHIP_SHIELD_WIDTH-SHIP_WIDTH)/2) < mUfo.xPosition+55) {
        if(((this.visibleX-(SHIP_SHIELD_WIDTH-SHIP_WIDTH)/2)+SHIP_SHIELD_WIDTH) 
                                      > mUfo.xPosition+MUFO_CANNON_WIDTH-55) {
          this.shieldlasersource = SHIELD_LASER_HIT_SOURCE;
        }
      }
      Observable.timer(1000).subscribe(t => {
        if((this.visibleX-(SHIP_SHIELD_WIDTH-SHIP_WIDTH)/2) < mUfo.xPosition+55) {
          if(((this.visibleX-(SHIP_SHIELD_WIDTH-SHIP_WIDTH)/2)+SHIP_SHIELD_WIDTH) 
                                      > mUfo.xPosition+MUFO_CANNON_WIDTH-55) {
            mUfo.decreaseHp(false);
          }
        } 
        this.laserLoad = 0;
        this.laserLoaded = false;
        this.charge = 0;
      });
    }
    /*
    if(!this.laserCreated) {
      if(this.laserObserver != null) {
        this.laserObserver.unsubscribe();
      }
      log("IMA FIRIN' MA LAZOR", this.player);
      this.laserCreated = true;
      this.laserObserver = Observable.timer(0,100).take(10);
      this.laserObserver.subscribe(t=>{
        if(this.player == 0) {
          if(t==9) {
            mUfo.decreaseHp(false);
            this.charge = 0;
            this.laserLoad = 0;
          }
        }
        if(t == 9) {
          this.charge = 0;
          this.laserLoad = 0; 
        }
      }, e=>{}, () => { 
        this.laserCreated = false; });
    }*/
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
  private charge: number;
  private isSamePosition: boolean;
  private laserLoad: number;
  private laserLoaded: boolean;
  private laserCreated: boolean;
  private laserObserver: any;
  private shieldlasersource: string;

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
    this.charge = 0;
    this.isSamePosition = false;
    this.laserLoad = 0;
    this.laserLoaded = false;
    this.laserCreated = false;
    this.shieldlasersource = SHIELD_COLOC_4_SOURCE;
  }

  get playerId(): number { return this.player == 0? 0 : 1; }

  get coLocated(): boolean { return this.isSamePosition; }
  set coLocated(b: boolean) { this.isSamePosition = b; }

	get charges(): number { return this.charge; }
  set charges(value: number) { 
    this.charge = value;
    if(this.charge > 5){
      this.charge = 5;
    } 
  }

	get loadLaser(): number { return this.laserLoad; }
  set loadLaser(value: number) { this.laserLoad = value; }

	get loadedLaser(): boolean { return this.laserLoaded; }
  
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
      this.renderTransparentShield(ctx);
    }

    if(!this.coLocated) {
      this.laserLoad = 0;
      this.shieldlasersource = SHIELD_COLOC_4_SOURCE;
    }
    
    if(this.laserLoad >= 4) {
      this.laserLoaded = true;
    } else {
      this.laserLoaded = false;
    }

  }

  private renderShield(ctx: CanvasRenderingContext2D){
    if(this.isSamePosition) {
      let img = new Image();
      img.src = SHIELD_COLOC_SOURCE;
      ctx.drawImage(img, this.visibleX-((SHIP_SHIELD_IMAGE_WIDTH-SHIP_WIDTH)/2), 0);
    } else {
      let img = new Image();
      img.src = SHIELD_NORMAL_SOURCE;
      ctx.drawImage(img, this.visibleX-((SHIP_SHIELD_IMAGE_WIDTH-SHIP_WIDTH)/2), 0);
    }
  }

  private renderTransparentShield(ctx: CanvasRenderingContext2D){
    if(this.isSamePosition) {
      let img = new Image();
      img.src = this.shieldlasersource;
      switch(this.laserLoad) {
        case 0:
          img.src = SHIELD_COLOC_T_SOURCE;
          break;
        case 1:
          img.src = SHIELD_COLOC_1_SOURCE;
          break;
        case 2:
          img.src = SHIELD_COLOC_2_SOURCE;
          break;
        case 3:
          img.src = SHIELD_COLOC_3_SOURCE;
          break;
        case 4:
          img.src = this.shieldlasersource;
          break;
      }
      ctx.drawImage(img, this.visibleX-((SHIP_SHIELD_IMAGE_WIDTH-SHIP_WIDTH)/2), 0);
    } else {
      let img = new Image();
      img.src = SHIELD_NORMAL_T_SOURCE;
      ctx.drawImage(img, this.visibleX-((SHIP_SHIELD_IMAGE_WIDTH-SHIP_WIDTH)/2), 0);
    }
  }

  fireLaser(mUfo: MotherUfo) {
    this.shieldlasersource = SHIELD_LASER_SOURCE;
    if(this.player == 0) {
      if((this.visibleX-(SHIP_SHIELD_WIDTH-SHIP_WIDTH)/2) < mUfo.xPosition+55) {
        if(((this.visibleX-(SHIP_SHIELD_WIDTH-SHIP_WIDTH)/2)+SHIP_SHIELD_WIDTH) 
                                      > mUfo.xPosition+MUFO_CANNON_WIDTH-55) {
          this.shieldlasersource = SHIELD_LASER_HIT_SOURCE;
        }
      }
      Observable.timer(1000).subscribe(t => {
        if((this.visibleX-(SHIP_SHIELD_WIDTH-SHIP_WIDTH)/2) < mUfo.xPosition+55) {
          if(((this.visibleX-(SHIP_SHIELD_WIDTH-SHIP_WIDTH)/2)+SHIP_SHIELD_WIDTH) 
                                      > mUfo.xPosition+MUFO_CANNON_WIDTH-55) {
            mUfo.decreaseHp(false);
          }
        } 
        this.laserLoad = 0;
        this.laserLoaded = false;
        this.charge = 0;
      });
    }
  }
/*
    if(!this.laserCreated) {
      if(this.laserObserver != null) {
        this.laserObserver.unsubscribe();
      }
      this.laserCreated = true;
      log("IMA FIRIN' MA LAZOR", this.player);
      this.laserObserver = Observable.timer(0,100).take(10);
      this.laserObserver.subscribe(t=>{
        this.shieldlasersource = SHIELD_LASER_SOURCE;
        if(this.player == 0) {
          if((this.visibleX-(SHIP_SHIELD_WIDTH-SHIP_WIDTH)/2) < mUfo.xPosition+55) {
            if(((this.visibleX-(SHIP_SHIELD_WIDTH-SHIP_WIDTH)/2)+SHIP_SHIELD_WIDTH) 
                                          > mUfo.xPosition+MUFO_CANNON_WIDTH-55) {
              this.shieldlasersource = SHIELD_LASER_HIT_SOURCE;
              if(t==9) {
                mUfo.decreaseHp(false);
                this.charge = 0;
                this.laserLoad = 0;
              }
            }
          }
        }
        if(t == 9) {
          this.charge = 0;
          this.laserLoad = 0; 
        }
        
      }, e=>{}, () => { 
        this.laserCreated = false;
      });
    }
  }*/

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