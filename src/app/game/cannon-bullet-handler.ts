import {CannonBullet} from './cannon-bullet';
import { Observable } from 'rxjs/Rx';
import { MotherCannon } from './ufo';
import { DEVICE_HEIGHT } from '../Util/constants';
import { CollisionService } from './collision.service';

export class CannonBulletHandler {
    cannonBullets: CannonBullet[];
    private bulletTimer;
    private count: number;

    constructor(private motherCannon: MotherCannon) {
    this.cannonBullets = [];
    this.count = 0;
    this.bulletTimer = Observable.timer(2000, 2000);
    this.bulletTimer.subscribe(t => {
        if(this.count != 4 && this.motherCannon.i == 0) {
            this.cannonBullets.push(new CannonBullet(this.motherCannon.x+82, this.motherCannon.y+84));
            this.count++;
        } else if (this.count == 4) {
            this.motherCannon.prepareLaser();
            this.count=0;
        }
    });
    }

    render(ctx: CanvasRenderingContext2D) {
        for(var i = 0; i < this.cannonBullets.length; i++) {
            this.cannonBullets[i].render(ctx);
        }
  }

    
  removeBullets(s : number[]){
    for(let index of s) {
      this.cannonBullets.splice(index, 1);
    }
  }
}