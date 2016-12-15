import { UfoSprite, MotherCannonSprite } from './sprite';
import { PURPLE_HARVEST_0, PURPLE_HARVEST_1, 
  PURPLE_HARVEST_2, PURPLE_HARVEST_WIDTH,
  PURPLE_HARVEST_HEIGHT, DEVICE_WIDTH } from '../Util/constants';
import {PathHandler} from './path-handler';
import { log } from '../Util/Log.service';
import { Observable } from 'rxjs/Rx';

export class Path {
  private xPosition: number;
  private yPosition: number;

  constructor(x: number, y: number) {
    this.xPosition = x;
    this.yPosition = y;
  }

  get x(): number { return this.xPosition; }
  get y(): number { return this.yPosition; }
}

export interface Ufo {
  render(ctx: CanvasRenderingContext2D);
  width : number;
  height : number;
  xPosition : number;
  yPosition : number;
  path: Path[];
  getPath() : number;
  health: number;
  hit(): boolean;
  pathPops: number;
  getId() : number;
}

export class PurpleHarvestUfo implements Ufo{
  private sprite: UfoSprite = new UfoSprite(PURPLE_HARVEST_2);
  public width = PURPLE_HARVEST_WIDTH;
  public height = PURPLE_HARVEST_HEIGHT;
  public xPosition : number;
  public yPosition : number;
  public path : Path[];
  public health: number;
  public pathPops: number;
  private pathId : number;
  private id : number;
  private pathHandler : PathHandler;

  constructor(p: number, ufoId: number){
    this.pathHandler = new PathHandler();
    this.pathId = p;
    this.id = ufoId;
    this.health = ufoId-PURPLE_HARVEST_0;
    var tempPath = this.pathHandler.path(p);
    this.path = tempPath.reverse();
    this.xPosition = this.path[0].x;
    this.yPosition = this.path[0].y;
  }

  getId(): number { return PURPLE_HARVEST_0 + this.health; }

  getPath(): number { return this.pathId; }

  render(ctx: CanvasRenderingContext2D) {
    this.nextPosition();
    this.sprite.render(ctx, this.xPosition, this.yPosition);
    if(this.health == 2) {
      ctx.beginPath();
      ctx.arc(this.xPosition+20,this.yPosition+20,40,0,2*Math.PI);
      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 5;
      ctx.stroke();
    }
  }

  nextPosition() {
    let p = this.path.pop();
    this.xPosition = p.x;
    this.yPosition = p.y;
    this.pathPops += 1;
  }

  hit() : boolean {
    if(this.health <= 0) {
      return true;
    }
    this.health -= 1;
    return false;
  }
}

export class MotherUfo {
  private motherCannon : MotherCannon;
  
  constructor() {
    this.motherCannon = new MotherCannon();
  }

  render(ctx: CanvasRenderingContext2D) {
    this.motherCannon.render(ctx);
  }

  get xPosition(): number { return this.motherCannon.x; }

  get yPosition(): number { return this.motherCannon.y; }

  prepareLaser() {
    this.motherCannon.prepareLaser();
  }

  shielded(b:boolean) {
    this.motherCannon.shielded(b);
  }

  get firingMyLazor(): boolean { return this.motherCannon.i == 4;}
}

class MotherCannon {
  x : number;
  y : number;
  location : number;
  private sprite = new MotherCannonSprite();
  i : number;

  constructor() {
    this.x = DEVICE_WIDTH/2;
    this.y = 93;
    this.location = this.nextLocation();
    this.i = 0;
  }

  render(ctx: CanvasRenderingContext2D) {
    if(this.i == 0) {
      if(this.x == this.location) {
        this.location = this.nextLocation();
      } else {
        if(this.x > this.location) {
          this.x -= 1;
        } else {
          this.x += 1;
        }
      }
    }
    this.sprite.render(ctx, this.x, this.y, this.i);
  }

  prepareLaser() {
    Observable.timer(0, 1000).take(5).subscribe(t => {
      this.i++;
      this.i %= 5;
    });
  }

  shielded(b: boolean) {
    this.sprite.shielded(b);
  }

  private nextLocation(): number {
    return Math.floor(Math.random()*(DEVICE_WIDTH-200));
  }
}