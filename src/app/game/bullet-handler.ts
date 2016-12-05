import { Injectable } from '@angular/core';
import { Bullet, NormalBullet } from './bullet';
import { Observable } from 'rxjs/Rx';
import { Spaceship } from './spaceship';

export class BulletHandler {
  bullets : Bullet[];
  bulletTimer;

  constructor(private spaceship: Spaceship, private isMe: boolean) {
    this.bullets = [];
    this.bulletTimer = Observable.timer(100, 100);
    this.bulletTimer.subscribe(t => {
      if(isMe) {
        this.bullets.push(new NormalBullet(
          this.spaceship.xPosition+this.spaceship.cannonPosition1X
          , this.spaceship.yPosition+this.spaceship.cannonPosition1Y));
        this.bullets.push(new NormalBullet(
          this.spaceship.xPosition+this.spaceship.cannonPosition2X
          , this.spaceship.yPosition+this.spaceship.cannonPosition2Y));
      } else if(this.spaceship.visible) {
        this.bullets.push(new NormalBullet(
          this.spaceship.visibleX+this.spaceship.cannonPosition1X
          , this.spaceship.yPosition+this.spaceship.cannonPosition1Y));
        this.bullets.push(new NormalBullet(
          this.spaceship.visibleX+this.spaceship.cannonPosition2X
          , this.spaceship.yPosition+this.spaceship.cannonPosition2Y));
      }
    });
  }

  render(ctx: CanvasRenderingContext2D) {
    var removeBullets = [];
    for(var i = 0; i < this.bullets.length; i++) {
      this.bullets[i].render(ctx);
      if(this.bullets[i].yPosition < 0) {
        removeBullets.push(i);
      }
    }

    this.removeBullets(removeBullets);

  }

  removeBullets(s : number[]){
    for(let index of s) {
      this.bullets.splice(index, 1);
    }
  }
}
