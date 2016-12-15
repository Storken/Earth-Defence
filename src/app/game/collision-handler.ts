import { Spaceship } from './spaceship';
import { UfoHandler } from './ufo-handler';
import { CollisionService } from './collision.service';
import { Bullet } from './bullet';
import { Ufo, MotherUfo } from './ufo';
import { log } from '../Util/Log.service';
import { SHIP_WIDTH, MUFO_CANNON_WIDTH, SHIP_SHIELD_WIDTH } from '../Util/constants';
import { Observable } from 'rxjs/Rx';

export class CollisionHandler {
  private obs : any;
  private obsDone : boolean;
  private obsUnsub : boolean;
  public health : number;
  public earthHealth : number;
  private shielded : boolean;

  constructor(private collisionService: CollisionService) {
    this.obsDone = true;
    this.obsUnsub = false;
    this.health = 5;
    this.earthHealth = 3;
    this.shielded = false;
  }

  check(spaceship1: Spaceship, spaceship2: Spaceship, ufoHandler: UfoHandler, earthHp: number){
    let bullets1 = spaceship1.bulletHandler.bullets;
    let bullets2 = spaceship2.bulletHandler.bullets;
    let ufos = ufoHandler.ufos;
    let mUfo = ufoHandler.mUfo;
    let removeUfos : number[] = [];
    let removeBullets1 : number[] = [];
    let removeBullets2 : number[] = [];
    this.earthHealth = earthHp;
  
    //Check if the lazorbeam has hit anything
    if(mUfo.firingMyLazor) {
      if(this.obsDone) {
        if(this.obs != null) {
          this.obs.unsubscribe();
        }
        this.obsDone = false;
        this.obs = Observable.timer(0, 100).take(11)
        .subscribe(t => {
          log("timer", t);
          if(t == 9) {
            if(!this.obsDone && this.withinMUfo(spaceship1, spaceship2, mUfo) == 0) {
              this.earthHealth -= 1;
              this.collisionService.sendEarthHealth(this.earthHealth);
              log("obsDone false", this.earthHealth);
            } else if (this.withinMUfo(spaceship1, spaceship2, mUfo) == 2) {
              this.health -= 1;
              this.collisionService.sendHealth(this.health);
            }
          log("timer is done", this.earthHealth);
          }
        }, e=> {}, () => {this.obsDone = true;});
      }

      switch (this.withinMUfo(spaceship1, spaceship2, mUfo)) {
        case 0:
          this.shielded = false;
          mUfo.shielded(this.shielded);
          break;
        case 1:
          log("shielded", 1);
          this.shielded = true;
          mUfo.shielded(this.shielded);
          break;
        case 2:
          log("shielded", 0);
          this.shielded = true;
          mUfo.shielded(this.shielded);
          break;
      }
    }

    
    //Check if an ufo has been shot down
    for(var index = 0; index < ufos.length; index++) {

      //Check if spaceship1 has been hit by an ufo
      if(this.withinShip(spaceship1, ufos[index], true)) {
        log("ship1 hit", this.health);
        ufoHandler.removeUfo(index);
        this.health -= 1;
        this.collisionService.sendHealth(this.health);
      }

      //Check if spaceship2 has been hit by an ufo
      else if(this.withinShip(spaceship2, ufos[index], false)) {
        log("ship2 hit", this.health);
        ufoHandler.removeUfo(index);
        this.health -= 1;
        this.collisionService.sendHealth(this.health);
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
  }

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

  /*
  returns
  0: earth is hit
  1: spaceship with shield is hit
  2: spaceship without shield is hit
  */
  withinMUfo(spaceship1: Spaceship, spaceship2: Spaceship, mUfo: MotherUfo): number {
    //Check if the shielded ship is blocking the laser
    if(spaceship1.playerId == 0 && spaceship1.visible) {
      if((spaceship1.visibleX-(SHIP_SHIELD_WIDTH-SHIP_WIDTH)/2) < mUfo.xPosition+55) {
        if(((spaceship1.visibleX-(SHIP_SHIELD_WIDTH-SHIP_WIDTH)/2)+SHIP_SHIELD_WIDTH) 
                                      > mUfo.xPosition+MUFO_CANNON_WIDTH-55) {
          return 1;
        }
      }
    } else if(spaceship2.playerId == 0 && spaceship2.visible) {
      if((spaceship2.visibleX-(SHIP_SHIELD_WIDTH-SHIP_WIDTH)/2) < mUfo.xPosition+55) {
        if(((spaceship2.visibleX-(SHIP_SHIELD_WIDTH-SHIP_WIDTH)/2)+SHIP_SHIELD_WIDTH) 
                                      > mUfo.xPosition+MUFO_CANNON_WIDTH-55) {
          return 1;
        }
      }
    }

    //Check if the unshielded ship blocked the laser and in that case lose a healthpoint
    if(spaceship1.playerId == 1) {
      if(spaceship1.visibleX < mUfo.xPosition+70) {
        if(spaceship1.visibleX > mUfo.xPosition+MUFO_CANNON_WIDTH-70) {
          return 2;
        }
      }
    }  else {
      if(spaceship2.visibleX < mUfo.xPosition+70) {
        if(spaceship2.visibleX > mUfo.xPosition+MUFO_CANNON_WIDTH-70) {
          return 2;
        }
      }
    }
    return 0;
  }
}
