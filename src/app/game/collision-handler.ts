import { Spaceship } from './spaceship';
import { UfoHandler } from './ufo-handler';
import { CollisionService } from './collision.service';
import { Bullet } from './bullet';
import { Ufo, MotherUfo } from './ufo';
import { log } from '../Util/Log.service';
import { SHIP_WIDTH, MUFO_CANNON_WIDTH, SHIP_SHIELD_WIDTH,
  DEVICE_WIDTH, DEVICE_HEIGHT } from '../Util/constants';
import { Observable } from 'rxjs/Rx';

/*
  So much logic -.-'
  I should comment more.
*/

export class CollisionHandler {
  private obs : any;
  private obsDone : boolean;
  private obsUnsub : boolean;
  public health : number;
  private mUfoHealth : number;
  private shielded : boolean;
  private shieldObs : any;
  private shieldObsCreated : boolean;
  private shieldObsUnsub : boolean;
  private shieldObsSubscribe : any;

  constructor(private collisionService: CollisionService) {
    this.obsDone = true;
    this.obsUnsub = false;
    this.health = 5;
    this.mUfoHealth = 5;
    this.shielded = false;
    this.shieldObsCreated = false;
    this.shieldObsUnsub = false;
  }

  shieldUpdate(spaceship1: Spaceship, spaceship2: Spaceship) {
    if(this.withinShips(spaceship1, spaceship2)) {
      spaceship1.coLocated = true;
      spaceship2.coLocated = true;
      if(spaceship1.charges == 5 && spaceship1.loadLaser < 1) {
        log("LaserLoad int: ", spaceship1.loadLaser);
        this.shieldObsCreated = true;
        this.shieldObs = Observable.timer(0,250).takeWhile(t => {
          return spaceship1.coLocated;
        }).subscribe(t => {
          if(spaceship1.charges == 5) {
            spaceship1.loadLaser+=1;
            spaceship2.loadLaser+=1;
          } else {
            spaceship1.loadLaser = 0;
            spaceship2.loadLaser = 0;
          }
        });
      }
    } else {
      spaceship1.coLocated = false;
      spaceship2.coLocated = false;
      spaceship1.loadLaser=0;
      spaceship2.loadLaser=0;
    }
  }

  check(spaceship1: Spaceship, spaceship2: Spaceship, ufoHandler: UfoHandler, earthHp: number){
    let bullets1 = spaceship1.bulletHandler.bullets;
    let bullets2 = spaceship2.bulletHandler.bullets;
    let ufos = ufoHandler.ufos;
    let mUfo = ufoHandler.mUfo;
    let cBullets = mUfo.cannonBulletHandler.cannonBullets;
    let removeUfos : number[] = [];
    let removeEarthUfo : number[] = [];
    let removeBullets1 : number[] = [];
    let removeBullets2 : number[] = [];
    this.health = earthHp;
    
    if(spaceship1.playerId == 0) {
      this.checkMufo(spaceship1, mUfo);
    } else {
      this.checkMufo(spaceship2, mUfo);
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

        //Check if the ufo has hit earth
        if(ufos[index].yPosition > DEVICE_HEIGHT - 40) {
          this.health -= 1;
          removeEarthUfo.push(index);
          this.collisionService.sendHealth(this.health);
        }
      }
    }


    spaceship1.bulletHandler.removeBullets(removeBullets1);
    spaceship2.bulletHandler.removeBullets(removeBullets2);
    ufoHandler.removeUfos(removeUfos);

    for(var i = 0; i < removeEarthUfo.length; i++) {
      ufoHandler.removeUfo(removeEarthUfo[i]);
    }
  }

  checkMufo(spaceship: Spaceship, mUfo: MotherUfo) {
    if(mUfo.cannonBulletHandler != null) {
      if(mUfo.hp != this.mUfoHealth) {
        this.mUfoHealth = mUfo.hp;
        this.collisionService.sendMUfoHp(mUfo.hp);
      }

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
              if(!this.obsDone && this.withinMUfo(spaceship, mUfo) == 0) {
                this.health -= 1;
                this.collisionService.sendHealth(this.health);
                log("obsDone false", this.health);
              } 
            log("timer is done", this.health);
            }
          }, e=> {}, () => {this.obsDone = true;});
        }

        switch (this.withinMUfo(spaceship, mUfo)) {
          case 0:
            this.shielded = false;
            mUfo.shielded(this.shielded);
            break;
          case 1:
            log("shielded", 1);
            this.shielded = true;
            mUfo.shielded(this.shielded);
            break;
        }
      }
      let removeCannonBullets = [];
      let cBullets = mUfo.cannonBulletHandler.cannonBullets;
      for(var i = 0; i < cBullets.length; i++) {
        if(this.withinLaserBullet(cBullets[i], spaceship)) {
          spaceship.charges += 1;
          this.collisionService.sendCharges(spaceship.charges);
          removeCannonBullets.push(i);
        } else {
          if(cBullets[i].yPosition > DEVICE_HEIGHT-40){
            this.health -= 1;
            removeCannonBullets.push(cBullets[i]);
            this.collisionService.sendHealth(this.health);
          }
        }
      }
      mUfo.cannonBulletHandler.removeBullets(removeCannonBullets);
    } 
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

  private withinLaserBullet(bullet: Bullet, spaceship : Spaceship) : boolean{
    if(spaceship.yPosition + spaceship.height >= bullet.yPosition) { //bottom of ufo > top of object
      if(spaceship.yPosition -50 <= bullet.yPosition + bullet.height) { //top of ufo < bottom of object
        if(spaceship.visibleX-((SHIP_SHIELD_WIDTH-SHIP_WIDTH)/2)  < bullet.xPosition - bullet.width) { // object is within x positions of ufo
          if(spaceship.visibleX + spaceship.width + ((SHIP_SHIELD_WIDTH-SHIP_WIDTH)/2) > bullet.xPosition) { // object is within x positions of ufo
            return true;
          }
        }
      }
    }
    return false;
  }

  withinShips(spaceship1: Spaceship, spaceship2: Spaceship): boolean {
    if(spaceship1.visibleX-((SHIP_SHIELD_WIDTH-SHIP_WIDTH)/2) < spaceship2.visibleX) {
      if(spaceship1.visibleX+(spaceship1.width)+((SHIP_SHIELD_WIDTH-SHIP_WIDTH)/2) > spaceship2.visibleX+spaceship2.width) {
        return true; 
      }
    }
    return false;
  }

  /*
  returns
  0: earth is hit
  1: spaceship with shield is hit
  */
  withinMUfo(spaceship: Spaceship, mUfo: MotherUfo): number {
    //Check if the shielded ship is blocking the laser
    if(spaceship.playerId == 0) {
      if((spaceship.visibleX-(SHIP_SHIELD_WIDTH-SHIP_WIDTH)/2) < mUfo.xPosition+55) {
        if(((spaceship.visibleX-(SHIP_SHIELD_WIDTH-SHIP_WIDTH)/2)+SHIP_SHIELD_WIDTH) 
                                      > mUfo.xPosition+MUFO_CANNON_WIDTH-55) {
          if(spaceship.coLocated) {
            return 1;
          }
        }
      }
    } 
    return 0;
  }
}
