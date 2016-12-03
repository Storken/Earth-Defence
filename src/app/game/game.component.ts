import { Component, ViewChild, ElementRef } from '@angular/core';
import { Spaceship1, Spaceship } from './spaceship1';
import { Spaceship2 } from './spaceship2';
import { Ufo } from './ufo';
import { log } from '../Util/Log.service';
import { DEVICE_WIDTH, DEVICE_HEIGHT, FLY_TO_START_TEXT,
  WAITING_FOR_OTHER_PLAYERS } from '../Util/constants';
import { Observable } from 'rxjs/Rx';
import { GameService } from './game.service';
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
    spaceship1: Spaceship;
    spaceship2: Spaceship;

    //ufo variables
    ufo1: Ufo;

    //player variables
    lastTouch: any;
    touchDown: boolean;
    private isReady: boolean;
    private playerId: number;
    private moving: boolean;
    private moveSent: boolean;

    //game variables
    private state: State;
    private onPlatform: boolean;
    private helpText: string;
    private timer: number;
    private timr = Observable.timer(5000,1000);
    private listenerHandler: ListenerHandler;
    private gamewidth: number;
    private gameheight: number;

  constructor(
    private gameService: GameService
  ) {
    this.touchDown = false;
    this.state = State.FLY_TO_START;
    this.timer = 0;
    this.timr.subscribe(timr=> {
      this.count(); });
    this.isReady = false;
    this.moving = false;
    this.moveSent = false;
  }

  ionViewDidLoad() {
    this.subscribe();
    this.prepGame();
    this.playerId = this.gameService.playerId;
    log("playerId - GC:", this.playerId);
    this.tick();
  }

  private initShips(){
    //initiate Spaceships
    if(this.gameService.playerId == 0){
      this.spaceship1 = new Spaceship1(Math.floor(DEVICE_WIDTH/4)
        , DEVICE_HEIGHT - 150);

      this.spaceship2 = new Spaceship2(Math.floor(DEVICE_WIDTH - (DEVICE_WIDTH/4))
        , DEVICE_HEIGHT - 150);
    } else {
      this.spaceship1 = new Spaceship2(Math.floor(DEVICE_WIDTH - (DEVICE_WIDTH/4))
        , DEVICE_HEIGHT - 150);

      this.spaceship2 = new Spaceship1(Math.floor(DEVICE_WIDTH/4)
        , DEVICE_HEIGHT - 150);
    }
  }

  private prepGame() {
    this.gameCanvas.nativeElement.width = DEVICE_WIDTH;
    this.gameCanvas.nativeElement.height = DEVICE_HEIGHT;
    let ctx = this.gameCanvas.nativeElement.getContext("2d");
    // happy drawing from here on
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, DEVICE_WIDTH, DEVICE_HEIGHT);

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

    //initiate Ufo
    this.ufo1 = new Ufo(DEVICE_WIDTH/2, 0);
    this.gameService.requestStart();
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


    switch(this.state) {
        case(State.FLY_TO_START):
          this.renderFlyToStart(ctx);
          break;
        case(State.PLAYING):
          this.playerId == 0 ? this.helpText = "You are green"
                             : this.helpText = "You are red";
          this.renderPlaying(ctx);

          //Spaceship controllers
          this.spaceshipControllers();

          //Draw spaceships
          this.spaceship1.render(ctx);
          this.spaceship2.render(ctx);
          break;
        case(State.DONE):
          this.renderDone(ctx);
          break;
        default:
          this.renderFlyToStart(ctx);
          break;
    }
  }

  private spaceshipControllers() {
    if(this.touchDown) { //if movement is requested
      if(this.lastTouch.x > DEVICE_WIDTH/2 && !this.moving){ //if right side of screen is pressed
        log("MOVING RIGHT", this.spaceship1.xPosition);
        this.spaceship1.moveRightRemote(true); // move ship right
        this.moving = true;
//        if(this.spaceship1.isInOtherScreen){ //update the other screen on movements
           // set the spaceship in the other screen on correct side of screen
           /*
          if(this.spaceship1.xPosition < DEVICE_WIDTH
              && this.spaceship1.xPosition > DEVICE_WIDTH+10) {
            this.gameService.sendPosition(this.spaceship1.xPosition);
          }*/
          //only send ONCE that the spaceship is moving
        log("MOVING RIGHT IN OTHER SCREEN", this.spaceship1.xPosition);
        this.gameService.sendRightmovement(true);

//      }
      } else if (this.lastTouch.x < DEVICE_WIDTH/2 && !this.moving) { //if left side of screen is pressed
        log("MOVING LEFT", this.spaceship1.xPosition);
        this.moving = true;
        this.spaceship1.moveLeftRemote(true); // move ship left
  //      if(this.spaceship1.isInOtherScreen) { //update the other screen on movements
           // set the spaceship in the other screen on correct side of screen
          /*if(this.spaceship1.xPosition > -10 && this.spaceship1.xPosition < 0) {
            this.gameService.sendPosition(this.spaceship1.xPosition);
          }*/
          //only send ONCE that the spaceship is moving
        log("MOVING LEFT IN OTHER SCREEN", this.spaceship1.xPosition);
        this.gameService.sendLeftmovement(true); // move ship in other screen
  //    }
      }
    } else {
      if(this.moving){
        console.log("STOPPING MOVEMENT");
        this.spaceship1.moveLeftRemote(false);
        this.spaceship1.moveRightRemote(false);
        this.gameService.sendRightmovement(false);
        this.gameService.sendLeftmovement(false);
        this.gameService.sendPosition(this.spaceship1.xPosition);
        console.log(this.spaceship2.xPosition);
        this.moving = false;
      }
    }
/*
    if(this.spaceship1.xPosition > (DEVICE_WIDTH)*2) {
      this.spaceship1.xPosition = 0;
      this.gameService.sendPosition(this.spaceship1.xPosition-200);
    }
    else if(this.spaceship1.xPosition < (DEVICE_WIDTH)*-1) {
      this.spaceship1.xPosition = DEVICE_WIDTH;
      this.gameService.sendPosition(this.spaceship1.xPosition+100);
    } */
  }

    //Clear canvas for updated draw
  private clearCanvas(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, DEVICE_WIDTH, DEVICE_HEIGHT);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, DEVICE_WIDTH, DEVICE_HEIGHT);
  }

  private drawSpaceBackground(ctx: CanvasRenderingContext2D) {
    for (let index in this.x) {
      ctx.fillStyle = 'white';
      ctx.fillRect(this.x[index], this.y[index], 5, 5);

      this.y[index] += this.s[index];
      if(this.y[index] > DEVICE_HEIGHT) {
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
    this.helpText = WAITING_FOR_OTHER_PLAYERS;
  }

  private randomX(): number {
    return Math.floor(Math.random() * DEVICE_WIDTH);
  }

  private drawHelpText(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'gray';
    ctx.font = "35px ChalkboardSE-Regular";
    ctx.textAlign = "center";
    ctx.fillText(this.helpText, DEVICE_WIDTH/2, 300);
  }

  private count() {
    this.timer--;
  }

  private startNewTimer(time: number) {
    this.timer = time;
    this.timr = Observable.timer(time * 1000, 1000);
  }

  private subscribe() {
/*      // Updated when a levelComplete is receivied.
      this.gameService.levelCompleted$.subscribe(score => {
        if (score === -1) {
          this.initNewLevel(this.context, score, this.renderGameLost);
        } else {
          this.initNewLevel(this.context, score, this.renderLevelCompleted);
        }
      });*/

      // Updated when the level starts.
      this.gameService.levelStart$.subscribe(started => {
        log("start!", started);
        this.initShips();
        this.state = State.PLAYING;
        this.listenerHandler.removeListeners();
      });
      // Show a toast when error is receivied.
      this.gameService.error$.subscribe(error => {

      });
      // Updated when the playerID is confirmed.
      this.gameService.IDConfirmed$.subscribe(newId => {
        log("new ID", newId);
        this.playerId = newId;
        this.gameService.requestStart();
        if (newId !== -1) {
          this.listenerHandler.removeListeners();
          log("new id !== -1", newId);
        }
      });

      // Updates the other players spaceship
      this.gameService.spaceshipMovingLeft$.subscribe(move => {
        log("spaceship2 move left", move);
        this.spaceship2.moveLeftRemote(move);
      });

      // Updates the other players spaceship
      this.gameService.spaceshipMovingRight$.subscribe(move => {
        log("spaceship2 move right", move);
        this.spaceship2.moveRightRemote(move);
      });

      // Updates the other players spaceship
      this.gameService.spaceshipMoving$.subscribe(move => {
        log("new position", move);
        this.spaceship2.xPosition = move;
      });
    }
}