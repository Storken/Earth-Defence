import { Spaceship } from './spaceship';
import { UfoHandler } from './ufo-handler';
import { CollisionService } from './collision.service';
import { Bullet } from './bullet';
import { Ufo } from './ufo';
import { log } from '../Util/Log.service';

export class CollisionHandler {

  constructor(private collisionService: CollisionService) {}

  check(spaceship1: Spaceship, spaceship2: Spaceship, ufoHandler: UfoHandler, health: number) : number {
    let bullets1 = spaceship1.bulletHandler.bullets;
    let bullets2 = spaceship2.bulletHandler.bullets;
    let ufos = ufoHandler.ufos;
    let removeUfos : number[] = [];
    let removeBullets1 : number[] = [];
    let removeBullets2 : number[] = [];

    //Check if an ufo has been shot down
    for(var index = 0; index < ufos.length; index++) {

      //Check if spaceship1 has been hit by an ufo
      if(this.withinShip(spaceship1, ufos[index], true)) {
        log("ship1 hit", health);
        removeUfos.push(index);
        health -= 1;
        this.collisionService.sendHealth(health);
      }

      //Check if spaceship2 has been hit by an ufo
      else if(this.withinShip(spaceship2, ufos[index], false)) {
        log("ship2 hit", health);
        removeUfos.push(index);
        health -= 1;
        this.collisionService.sendHealth(health);
      }

      else {
        //Check if spaceship1 has shot any ufos
        for(var i = 0; i < bullets1.length; i++) {
          if(this.within(bullets1[i], ufos[index])) {
            log("ufo hit", i);
            removeUfos.push(index);
            removeBullets1.push(i);
          }
        }

        //Check if spaceship2 has shot any ufos
        for(var i = 0; i < bullets2.length; i++) {
          if(this.within(bullets2[i], ufos[index])) {
            log("ufo hit", i);
            removeUfos.push(index);
            removeBullets2.push(i);
          }
        }
      }

    }

    spaceship1.bulletHandler.removeBullets(removeBullets1);
    spaceship2.bulletHandler.removeBullets(removeBullets2);
    ufoHandler.removeUfos(removeUfos);
    return health;
  }

  /*
  collObj:
  [0]: x-position
  [1]: y-position
  [2]: width
  [3]: height
  */
  private within(bullet: Bullet, ufo: Ufo) : boolean{
    if(ufo.yPosition + ufo.height >= bullet.yPosition) { //bottom of ufo > top of object
      if(ufo.yPosition <= bullet.yPosition + bullet.height) { //top of ufo < bottom of object
        if(ufo.xPosition < bullet.xPosition - bullet.width) { // object is within x positions of ufo
          if(ufo.xPosition + ufo.width > bullet.xPosition) { // object is within x positions of ufo
            return true;
          }
        }
      }
    }
    return false;
  }

  /*
  collObj:
  [0]: x-position
  [1]: y-position
  [2]: width
  [3]: height
  */
  private withinShip(ship: Spaceship, ufo: Ufo, isMe: boolean) : boolean{
    if(!isMe) {
      if(ship.visible) {
        if(ufo.yPosition + ufo.height >= ship.yPosition) { //bottom of ufo > top of object
          if(ufo.yPosition <= ship.yPosition + ship.height) { //top of ufo < bottom of object
            if(ufo.xPosition < ship.visibleX + ship.width) { // object is within x positions of ufo
              if(ufo.xPosition + ufo.width > ship.visibleX) { // object is within x positions of ufo
                return true;
              }
            }
          }
        }
      }
      return false;
    }
    if(ufo.yPosition + ufo.height >= ship.yPosition) { //bottom of ufo > top of object
      if(ufo.yPosition <= ship.yPosition + ship.height) { //top of ufo < bottom of object
        if(ufo.xPosition < ship.xPosition + ship.width) { // object is within x positions of ufo
          if(ufo.xPosition + ufo.width > ship.xPosition) { // object is within x positions of ufo
            return true;
          }
        }
      }
    }
    return false;
  }
}
