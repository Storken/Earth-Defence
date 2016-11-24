import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Spaceship1 } from './spaceship1';
import { Ufo } from './ufo';
import { log } from '../Util/Log.service';
import { ListenerHandler } from '../Util/event-listener-handler';

/*
  Generated class for the Game page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/

enum State {
  FLY_TO_START,
  PLAYING,
  DONE
}

@Component({
  selector: 'page-game',
  templateUrl: 'game.html'
})
export class GameComponent {
    // get the element with the #gameCanvas on it
    @ViewChild("gameCanvas") gameCanvas: ElementRef;

    //starflow variables
    private x: number[] = [];
    private y: number[] = [];
    private s: number[] = [];

    //spaceship variables
    spaceship1: Spaceship1;

    //ufo variables
    ufo1: Ufo;

    //player variables
    lastTouch: any;
    touchDown: boolean;

    //some constants
    private DEVICE_WIDTH: number;
    private DEVICE_HEIGHT: number;


  constructor(
    public navCtrl: NavController
  ) {
    //testing in browser: width = height, height = width
    //testing on device: width = width, height = height
    this.DEVICE_WIDTH = window.screen.height;
    this.DEVICE_HEIGHT = window.screen.width - 30;
    this.touchDown = false;
  }

  ionViewDidLoad() {
    console.log('Hello GamePage Page');
    this.prepGame();
    this.tick();
  }

  prepGame() {
    this.gameCanvas.nativeElement.width = this.DEVICE_WIDTH;
    this.gameCanvas.nativeElement.height = this.DEVICE_HEIGHT;
    let ctx = this.gameCanvas.nativeElement.getContext("2d");
    // happy drawing from here on
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, this.DEVICE_WIDTH, this.DEVICE_HEIGHT);

    for(var i = 0; i < 20; i++) {
      this.x[i] = this.randomX();
      this.y[i] = this.randomX();
      this.s[i] = Math.floor(Math.random() * 9 + 1);
    }

    let el = this.gameCanvas.nativeElement;
    el.addEventListener("touchstart", event => {
      log("touchstart", event);
      this.lastTouch = {
        "x" : event.touches[0].pageX,
        "y" : event.touches[0].pageY
      }
      this.touchDown = true;
      log("last touch is now: ", this.lastTouch);
    }, false);

    el.addEventListener("touchend", event => {
      log("touchend", event);
      this.touchDown = false;
    }, false);

    //initiate Spaceships
    this.spaceship1 = new Spaceship1(Math.floor(this.DEVICE_WIDTH/4)
      , this.DEVICE_HEIGHT - 120, this.DEVICE_WIDTH, this.DEVICE_HEIGHT);

    //initiate Ufo
    this.ufo1 = new Ufo(this.DEVICE_WIDTH/2, 0);

  }

  tick() {
    requestAnimationFrame(()=> {
      this.tick()
    });

    //Clear canvas for updated draw
    let ctx = this.gameCanvas.nativeElement.getContext("2d");
    ctx.clearRect(0, 0, this.DEVICE_WIDTH, this.DEVICE_HEIGHT);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, this.DEVICE_WIDTH, this.DEVICE_HEIGHT);


    //Draw spacebackground
    for (let index in this.x) {
      ctx.fillStyle = 'white';
      ctx.fillRect(this.x[index], this.y[index], 5, 5);

      this.y[index] += this.s[index];
      if(this.y[index] > this.DEVICE_HEIGHT) {
        this.y[index] = 0;
        this.x[index] = this.randomX();
        this.s[index] = Math.floor(Math.random() * 9 + 1);
      }
    }

    //Draw spaceships
    if(this.touchDown) {
      if(this.lastTouch.x > Math.floor(this.DEVICE_WIDTH/2)) {
        this.spaceship1.moveRight();
        log("MOVE RIGHT",this.lastTouch.x);
      } else {
        this.spaceship1.moveLeft();
        log("MOVE LEFT",this.lastTouch.x);
      }
    }

    this.spaceship1.render(ctx);


    //Draw ufos
    this.ufo1.render(ctx);
  }

  private randomX(): number {
    return Math.floor(Math.random() * this.DEVICE_WIDTH);
  }
}
