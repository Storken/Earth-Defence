import { Path } from './ufo';
import { DEVICE_WIDTH, DEVICE_HEIGHT, 
    UFO_PATH1, UFO_PATH2, UFO_PATH3, UFO_PATH0 } from '../Util/constants';


export class PathHandler {
    private path0 : Path[];
    private path1 : Path[];
    private path2 : Path[];
    private path3 : Path[];

  constructor() {
    
  }

  path(pathId: number) : Path[] {
    switch (pathId) {
        case UFO_PATH0:
            return this.p0();
        case UFO_PATH1: 
            return this.p1();
        case UFO_PATH2:
            return this.p2();
        case UFO_PATH3:
            return this.p3();
        default:
            return [];
    }
  }

  private p1(): Path[] {
    if(this.path1 == null){
      this.path1 = [];
      //Create path1
      for(var i = 0; i < DEVICE_HEIGHT+100; i+=2) {
        this.path1.push(new Path(Math.floor(i), i));
      }
    }
    return this.path1.slice();
  }

  private p2(): Path[] {
    if(this.path2 == null) {
      this.path2 = [];

      //Create path2
      for(var i = 0; i < DEVICE_HEIGHT+100; i+= 2){
        this.path2.push(new Path(DEVICE_WIDTH-i, i));
      }
    }
    return this.path2.slice();
  }

  private p3(): Path[] {
    if(this.path3 == null) {
      this.path3 = [];

      //Create path3
      for(var i = 0; i < DEVICE_HEIGHT+100; i+= 1){
        this.path3.push(
          new Path(i , i));
      }
    }
    return this.path3.slice();
  }

  private p0(): Path[] {
    if(this.path0 == null) {
        this.path0 = [];
    }

    //Create path0
    let m = Math.floor(Math.random()*(DEVICE_WIDTH-50));
    for(var i = 0; i < DEVICE_HEIGHT; i+= 2) {
        this.path0.push(
            new Path(m, i)
        );
    }
    return this.path0;
  }
}
