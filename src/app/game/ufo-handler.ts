import { Ufo, PurpleHarvestUfo } from './ufo';
import { Spaceship } from './spaceship';
import { DEVICE_WIDTH, PURPLE_HARVEST, PURPLE_HARVEST_WIDTH,
  DEVICE_HEIGHT} from '../Util/constants';

export class UfoHandler {
  public ufos : Ufo[];

  constructor(private ctx: CanvasRenderingContext2D) {
    this.ufos = [];
  }

  addUfo(ufo : number, x? : number) {
    switch (ufo) {
      case PURPLE_HARVEST:
        this.ufos.push(new PurpleHarvestUfo((
          x ? x : Math.floor(Math.random() * (DEVICE_WIDTH-PURPLE_HARVEST_WIDTH)))
          , 0));
        break;
    }
  }

  removeUfo(x : number) {
    this.ufos.splice(x, 1);
  }

  renderUfos() {
    let removeUfo: number[] = [];
    for(var i = 0; i < this.ufos.length; i++) {
        this.ufos[i].render(this.ctx);
        if(this.ufos[i].yPosition > DEVICE_HEIGHT) {
          removeUfo.push(i);
        }
    }
    for(let i of removeUfo) {
      this.removeUfo(i);
    }
  }

  removeUfos(rmUfos: number[]) {
    for(let i of rmUfos) {
      this.ufos.splice(i, 1);
    }
  }

  amountOfUfos() : number {
    return this.ufos.length;
  }
}
