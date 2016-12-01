import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Spaceship1 } from './spaceship1';
import { Ufo } from './ufo';
import { log } from '../Util/Log.service';
import { Observable } from 'rxjs/Rx';

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

    private state: State;

    private onPlatform: boolean;
    private helpText: string;
    private timer: number;
    private timr = Observable.timer(5000,1000);

  constructor(
    public navCtrl: NavController
  ) {
    //testing in browser: width = height, height = width
    //testing on device: width = width, height = height
    this.DEVICE_WIDTH = window.screen.height;
    this.DEVICE_HEIGHT = window.screen.width - 30;
    this.touchDown = false;
    this.state = State.FLY_TO_START;
    this.helpText = 'Starta spelet genom att placera skeppet i den blåa rutan';
    this.timer = 0;
    this.timr.subscribe(timr=> {
      this.count(); });
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
    let ctx = this.gameCanvas.nativeElement.getContext("2d");
    //Clear canvas for updated draw
    this.clearCanvas(ctx);

    //Draw spacebackground
    this.drawSpaceBackground(ctx);

    //Draw help text
    this.drawHelpText(ctx);

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

    switch(this.state) {
        case(State.FLY_TO_START):
          log("RENDER_FLY_TO_START",this.state);
          this.renderFlyToStart(ctx);
          break;
        case(State.PLAYING):
          log("RENDER_PLAYING",this.state);
          this.renderPlaying(ctx);
          break;
        case(State.DONE):
          log("RENDER_DONE",this.state);
          this.renderDone(ctx);
          break;
        default:
          log("RENDER_DEFAULT",this.state);
          this.renderFlyToStart(ctx);
          break;
    }

    this.spaceship1.render(ctx);
  }

    //Clear canvas for updated draw
  private clearCanvas(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, this.DEVICE_WIDTH, this.DEVICE_HEIGHT);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, this.DEVICE_WIDTH, this.DEVICE_HEIGHT);
  }

  private drawSpaceBackground(ctx: CanvasRenderingContext2D) {
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
  }

  private renderDone(ctx: CanvasRenderingContext2D) {

  }

  private renderPlaying(ctx: CanvasRenderingContext2D) {
      //Draw ufos
      this.ufo1.render(ctx);

      this.helpText = "";
  }

  private renderFlyToStart(ctx: CanvasRenderingContext2D) {
      if(this.spaceship1.xPosition+120 > 200) {
        this.onPlatform = false;
        ctx.fillStyle = 'blue';
        ctx.fillRect(0, this.DEVICE_HEIGHT-150, 150, 150);
        this.helpText = 'Starta spelet genom att placera skeppet i den blåa rutan'
      } else if(this.spaceship1.xPosition+120 <= 200) {
        if(!this.onPlatform) {
          this.startNewTimer(5);
        }
        this.onPlatform = true;
        ctx.fillStyle = 'green';
        ctx.fillRect(0, this.DEVICE_HEIGHT-150, 150, 150);
        var countdown = this.timer.toString();
        this.helpText = countdown;
        if(this.timer <= 0) {
          this.state = State.PLAYING;
        }
      }
  }

  private randomX(): number {
    return Math.floor(Math.random() * this.DEVICE_WIDTH);
  }

  private drawHelpText(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'gray';
    ctx.font = "35px ChalkboardSE-Regular";
    ctx.textAlign = "center";
    ctx.fillText(this.helpText, this.DEVICE_WIDTH/2, 300);
  }

  private count() {
    this.timer--;
  }

  private startNewTimer(time: number) {
    this.timer = time;
    this.timr = Observable.timer(time * 1000, 1000);
  }
}
