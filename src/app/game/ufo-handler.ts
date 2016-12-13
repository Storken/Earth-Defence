import { Ufo, PurpleHarvestUfo, Path } from './ufo';
import { Spaceship } from './spaceship';
import { DEVICE_WIDTH, PURPLE_HARVEST_2, PURPLE_HARVEST_HEIGHT
  , PURPLE_HARVEST_WIDTH, PURPLE_HARVEST_1, PURPLE_HARVEST_0,
  DEVICE_HEIGHT, UFO_PATH0, UFO_PATH1, UFO_PATH2, UFO_PATH3,
  EARTH_HEALTH_LOST} from '../Util/constants';
import {Observable}     from 'rxjs/Observable';
import {Subject}  from 'rxjs/Subject';
import { log } from '../Util/Log.service';
import { PathHandler } from './path-handler';
import { CollisionService } from './collision.service';

export class UfoHandler {
  public ufos : Ufo[];
  private pathHandler : PathHandler;

  constructor(private ctx: CanvasRenderingContext2D) {
    this.ufos = [];
    this.pathHandler = new PathHandler();
  }

  addUfos(ufo : number, amount: number) {
    log("added ufos", ufo);
    switch (ufo) {
      case PURPLE_HARVEST_2:
 /*       Observable.timer(0, 200).takeUntil(Observable.timer(amount*200)).subscribe(t => {
          this.ufos.push(new PurpleHarvestUfo(UFO_PATH0, ufo));
        });*/
        this.ufos.push(new PurpleHarvestUfo(UFO_PATH0, ufo));
        break;
    }
  }

  addUfo(ufo: Ufo) {
    this.ufos.push(ufo);
  }

  removeUfo(x : number) {
    log("removing ufo", x);
    this.ufos.splice(x, 1);
  }

  renderUfos(cs : CollisionService, earthHp : number): number {
    let removeUfon: number[] = [];
    if(this.ufos == null) {
      this.ufos = [];
    }
    for(var i = 0; i < this.ufos.length; i++) {
        this.ufos[i].render(this.ctx);
        if(this.ufos[i].yPosition > DEVICE_HEIGHT - 50 - PURPLE_HARVEST_HEIGHT || this.ufos[i].path.length < 1) {
          removeUfon.push(i);
        }
    }
    for(var i = 0; i < removeUfon.length; i++) {
      this.removeUfo(i);
      log("earth hit", earthHp);
      cs.sendEarthHealth(earthHp-1);
      earthHp -= 1;
    }
    return earthHp;
  }

  removeUfos(rmUfos: number[]) {
    for(let i of rmUfos) {
      if(this.ufos[i].hit()) {
        this.ufos.splice(i, 1);
      }
    }
  }

  removeAll(){
    this.ufos = [];
  }

  amountOfUfos() : number {
    return this.ufos.length;
  }

}
