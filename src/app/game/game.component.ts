import { Component, ViewChild, ElementRef } from '@angular/core';
import { Spaceship2, Spaceship1, Spaceship } from './spaceship';
import { log } from '../Util/Log.service';
import { DEVICE_WIDTH, DEVICE_HEIGHT,
  WAITING_FOR_OTHER_PLAYERS, PURPLE_HARVEST_2, 
  PURPLE_HARVEST_1, PURPLE_HARVEST_0, SHIP_HEIGHT,
  SHIP_1_CANNON_1_X, SHIP_1_CANNON_1_Y, SHIP_1_CANNON_2_Y,
  SHIP_1_CANNON_2_X, SHIP_2_CANNON_1_X, SHIP_2_CANNON_1_Y,
  SHIP_2_CANNON_2_Y, SHIP_2_CANNON_2_X, TUTORIAL_1_SOURCE,
  TUTORIAL_2_SOURCE, TUTORIAL_3_SOURCE, TUTORIAL_4_SOURCE,
  TUTORIAL_PAGES, LASER_BUTTON_WIDTH, LASER_BUTTON_HEIGHT } from '../Util/constants';
import { Observable } from 'rxjs/Rx';
import { GameService } from './game.service';
import { ListenerHandler } from '../Util/event-listener-handler';
import { UfoHandler } from './ufo-handler';
import { CollisionService } from './collision.service';
import { CollisionHandler } from './collision-handler';
import { HealthSprite, EarthSprite, MUfoHealthSprite } from './sprite';
import { NavController } from 'ionic-angular';
import { GameboardService } from './gameboard.service';

/*
  Generated class for the Game page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/

//laser button source constants
const LASER_BUTTON_0_SOURCE = 'images/sprites/ship-laser-btn-0.png';
const LASER_BUTTON_1_SOURCE = 'images/sprites/ship-laser-btn-1.png';
const LASER_BUTTON_2_SOURCE = 'images/sprites/ship-laser-btn-2.png';
const LASER_BUTTON_3_SOURCE = 'images/sprites/ship-laser-btn-3.png';
const LASER_BUTTON_4_SOURCE = 'images/sprites/ship-laser-btn-4.png';
const LASER_BUTTON_5_SOURCE = 'images/sprites/ship-laser-btn-5.png';
const LASER_BUTTON_5_ACTIVE_SOURCE = 'images/sprites/ship-laser-btn-5-active.png';
const LASER_BUTTON_5_ACTIVE_CLICKED_SOURCE = 'images/sprites/ship-laser-btn-5-active-clicked.png';

enum State {
  FLY_TO_START,
  READY_FOR_PLAY,
  PLAYING,
  GAMEOVER,
  PAUSE,
  WIN
}

@Component({
  selector: 'page-game',
  templateUrl: 'game.html'
})
export class GameComponent {
    @ViewChild("gameCanvas") gameCanvas: ElementRef; // get the element with the #gameCanvas on it

    //starflow variables
    private x: number[] = [];
    private y: number[] = [];
    private s: number[] = [];

    //spaceship variables
    spaceship1: Spaceship;
    spaceship2: Spaceship;

    //ufo variables
    ufoHandler: UfoHandler;

    //player variables
    lastTouch: any;
    touchDown: boolean;
    //private tutorialSequence: number;
    private playerId: number;
    private moving: boolean;
    private moveSent: boolean;

    //game variables
    private context: CanvasRenderingContext2D;
    private state: State;
    private onPlatform: boolean;
    private helpText: string;
    private listenerHandler: ListenerHandler;
    private collisionHandler: CollisionHandler;
    private gamewidth: number;
    private gameheight: number;
    private health_sprites: HealthSprite[];
    private mufo_health_sprites: MUfoHealthSprite[];
    private timer: number;
    private p0LaserButton: boolean;
    private p1LaserButton: boolean;
    private laserObs: any;
    private laserObsCreated: boolean;
    private laserActiveSource: string;
    //private tutorialClick: boolean;
    private ufoObs: any;

  constructor(
    private gameService: GameService,
    private gameboardService: GameboardService,
    private collisionService: CollisionService,
    private nav: NavController
  ) {
    this.touchDown = false;
    this.state = State.FLY_TO_START
    //this.state = State.PLAYING; //web-check
    //this.tutorialSequence = TUTORIAL_PAGES;
    this.moving = false;
    this.moveSent = false;
    this.helpText = "";
    this.timer = 0;
    this.health_sprites = [new HealthSprite(), new HealthSprite(),
      new HealthSprite(), new HealthSprite(), new HealthSprite()];
    this.mufo_health_sprites = [new MUfoHealthSprite(), new MUfoHealthSprite(),
      new MUfoHealthSprite(), new MUfoHealthSprite(), new MUfoHealthSprite()];
    //this.tutorialClick = false;
    this.p0LaserButton = false;
    this.p1LaserButton = false;
    this.laserObsCreated = false;
    this.laserActiveSource = LASER_BUTTON_5_ACTIVE_SOURCE;
  }

  ionViewDidLoad() {
    //Remove scroll from page
    let preventMotion = (event) => {
      window.scrollTo(0, 0);
      event.preventDefault();
      event.stopPropagation();
    }
    window.addEventListener("scroll", preventMotion, false);
    window.addEventListener("touchmove", preventMotion, false);


    this.context = this.gameCanvas.nativeElement.getContext("2d");
    this.listenerHandler = new ListenerHandler(this.gameCanvas.nativeElement);
    //this.initShips(); // only for web dev
    this.subscribe();
    this.prepGame(this.context);
    this.playerId = this.gameService.playerId;
    log("playerId - GC:", this.playerId);
    this.tick(this.context);
  }

  private initShips(){
    //initiate Spaceships
    if(this.gameService.playerId == 0){
      this.spaceship1 = new Spaceship1(Math.floor(DEVICE_WIDTH - (DEVICE_WIDTH/4))
        , DEVICE_HEIGHT - SHIP_HEIGHT - 70, 0, true,
        SHIP_1_CANNON_1_X, SHIP_1_CANNON_1_Y, SHIP_1_CANNON_2_X, SHIP_1_CANNON_2_Y);

      this.spaceship2 = new Spaceship2(Math.floor(DEVICE_WIDTH/4)
        , DEVICE_HEIGHT - SHIP_HEIGHT - 70, 1, false,
        SHIP_2_CANNON_1_X, SHIP_2_CANNON_1_Y, SHIP_2_CANNON_2_X, SHIP_2_CANNON_2_Y);
    } else {
      this.spaceship1 = new Spaceship1(Math.floor(DEVICE_WIDTH/4)
        , DEVICE_HEIGHT - SHIP_HEIGHT - 70, 1, false,
        SHIP_2_CANNON_1_X, SHIP_2_CANNON_1_Y, SHIP_2_CANNON_2_X, SHIP_2_CANNON_2_Y);

      this.spaceship2 = new Spaceship2(Math.floor(DEVICE_WIDTH - (DEVICE_WIDTH/4))
        , DEVICE_HEIGHT - SHIP_HEIGHT - 70, 0, true,
        SHIP_1_CANNON_1_X, SHIP_1_CANNON_1_Y, SHIP_1_CANNON_2_X, SHIP_1_CANNON_2_Y);
    }

    this.collisionHandler = new CollisionHandler(this.collisionService);

    this.gameService.playerId == 0 ? this.helpText = "Du är det blåa skeppet"
                         : this.helpText = "Du är det gula skeppet";

    this.ufoHandler = new UfoHandler(this.context, this.gameService.playerId, this.collisionService);


    let startVal = 1000;
    if(this.gameService.playerId == 1) {

      if(this.ufoObs != null) {
        this.ufoObs.unsubscribe();
      }

      this.ufoObs = Observable.timer(startVal, 4000).subscribe(t => {
        log("added ufo", t);
        this.ufoHandler.addUfos(PURPLE_HARVEST_2, 1);
        log("amount of ufos in ufohandler", this.ufoHandler.amountOfUfos());
      });
    }
  }

  private prepGame(ctx: CanvasRenderingContext2D) {
    this.gameCanvas.nativeElement.width = DEVICE_WIDTH;
    this.gameCanvas.nativeElement.height = DEVICE_HEIGHT;
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

  }

  tick(ctx : CanvasRenderingContext2D) {
    requestAnimationFrame(()=> {
      this.tick(ctx)
    });
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
        case(State.READY_FOR_PLAY):
          this.renderReadyForPlay(ctx);
          break;
        case(State.PLAYING):
          this.renderPlaying(ctx);
          break;
        case(State.GAMEOVER):
          this.renderGameover(ctx);
          break;
        case(State.PAUSE):
          this.renderPause(ctx);
          break;
        case(State.WIN):
          this.renderWin(ctx);
          break;
        default:
          this.renderFlyToStart(ctx);
          break;
    }
    //Draw health
    this.drawHealth(ctx);

  }

  private buttonPressed(): boolean{
      if(this.lastTouch.x > (DEVICE_WIDTH/2)-(LASER_BUTTON_WIDTH/2)
                && this.lastTouch.x < (DEVICE_WIDTH/2)+(LASER_BUTTON_WIDTH/2)) {
        if(this.lastTouch.y > DEVICE_HEIGHT-LASER_BUTTON_HEIGHT-15 
                && this.lastTouch.y < DEVICE_HEIGHT) {
                  return true;
          }
      }
      return false;
  }
  private pauseResumeButtonPressed(): boolean{
      if(this.lastTouch.x > (DEVICE_WIDTH/2)-45
                && this.lastTouch.x < (DEVICE_WIDTH/2)+45) {
        if(this.lastTouch.y > 320 && this.lastTouch.y < 420) {
                  return true;
          }
      }
      return false;
  }
  private pauseRestartButtonPressed(): boolean{
      if(this.lastTouch.x > (DEVICE_WIDTH/2)-115
                && this.lastTouch.x < (DEVICE_WIDTH/2)+115) {
        if(this.lastTouch.y > 420 && this.lastTouch.y < 525) {
                  return true;
          }
      }
      return false;
  }
  private pauseLeaveButtonPressed(): boolean{
      if(this.lastTouch.x > (DEVICE_WIDTH/2)-115
                && this.lastTouch.x < (DEVICE_WIDTH/2)+115) {
        if(this.lastTouch.y > 525 && this.lastTouch.y < 630) {
                  return true;
          }
      }
      return false;
  }
  private pauseButtonPressed(): boolean{
      if(this.lastTouch.x > (DEVICE_WIDTH/2)-115
                && this.lastTouch.x < (DEVICE_WIDTH/2)+115) {
        if(this.lastTouch.y > 0 && this.lastTouch.y < 70) {
                  return true;
          }
      }
      return false;
  }
  

  private spaceshipControllers() {
    if(this.touchDown) { //if movement is requested
      if(this.buttonPressed()) {
        if(this.spaceship1.loadLaser >= 4) {
          this.laserActiveSource = LASER_BUTTON_5_ACTIVE_CLICKED_SOURCE;
          if(this.gameService.playerId == 0 && !this.p0LaserButton) {
            this.gameboardService.sendButtonPressed(true);
            this.p0LaserButton = true;
          } else if(this.gameService.playerId == 1 && !this.p1LaserButton) {
            this.gameboardService.sendButtonPressed(true);
            this.p1LaserButton = true;
          }
        }
      }
      else if(this.pauseButtonPressed()) {
        this.gameService.sendPause(true);
        this.state = State.PAUSE;
        this.ufoHandler.mUfo.cannonBulletHandler.gamePaused(true);
        this.spaceship1.bulletHandler.gamePaused(true);
        this.spaceship2.bulletHandler.gamePaused(true);
      }
      else if(this.lastTouch.x > DEVICE_WIDTH/2 && !this.moving){ //if right side of screen is pressed
        log("MOVING RIGHT", this.spaceship1.xPosition);
        this.spaceship1.moveRightRemote(true); // move ship right
        this.moving = true;
          //update the other screen that the ship is moving
        log("MOVING RIGHT IN OTHER SCREEN", this.spaceship1.xPosition);
        this.gameService.sendRightmovement(true);

      } else if (this.lastTouch.x < DEVICE_WIDTH/2 && !this.moving) { //if left side of screen is pressed
        log("MOVING LEFT", this.spaceship1.xPosition);
        this.moving = true;
        this.spaceship1.moveLeftRemote(true); // move ship left
          //update the other screen that the ship is moving
        log("MOVING LEFT IN OTHER SCREEN", this.spaceship1.xPosition);
        this.gameService.sendLeftmovement(true); // move ship in other screen
      }
    
    } else {
      if(this.moving){
        console.log("STOPPING MOVEMENT");
        this.spaceship1.moveLeftRemote(false);
        this.spaceship1.moveRightRemote(false);
        this.gameService.sendLeftmovement(false, this.spaceship1.xPosition);
        console.log(this.spaceship2.xPosition);
        this.moving = false;
      }
      if(this.gameService.playerId == 0 && this.p0LaserButton) {
        this.p0LaserButton = false;
        this.laserActiveSource = LASER_BUTTON_5_ACTIVE_SOURCE;
        this.gameboardService.sendButtonPressed(false);
      } else if(this.gameService.playerId == 1 && this.p1LaserButton){
        this.p1LaserButton = false;
        this.laserActiveSource = LASER_BUTTON_5_ACTIVE_SOURCE;
        this.gameboardService.sendButtonPressed(false);
      }
    }
  }
    

  private renderPause(ctx: CanvasRenderingContext2D){
    let img = new Image();
    img.src = "images/paus-scene.png";
    ctx.drawImage(img, 0, 0);

    if(this.touchDown) {
      if(this.pauseResumeButtonPressed()) {
        this.state = State.PLAYING;
        this.ufoHandler.mUfo.cannonBulletHandler.gamePaused(false);
        this.spaceship1.bulletHandler.gamePaused(false);
        this.spaceship2.bulletHandler.gamePaused(false);
        this.gameService.sendPause(false);
      } else if(this.pauseRestartButtonPressed()) {
        this.gameService.requestStart();
        this.collisionHandler.health = 5;
        this.gameService.sendRestart();
        this.ufoHandler.removeAll();
        this.ufoHandler.mUfo.cannonBulletHandler.gamePaused(false);
        this.spaceship1.bulletHandler.gamePaused(false);
        this.spaceship2.bulletHandler.gamePaused(false);
      } else if(this.pauseLeaveButtonPressed()) {

      }
    }
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

  private renderGameover(ctx: CanvasRenderingContext2D) {
    this.helpText = "GAME OVER";
    if(this.touchDown) {
      this.gameService.requestStart();
      this.collisionHandler.health = 5;
      this.collisionService.sendHealth(this.collisionHandler.health);
      this.ufoHandler.removeAll();
    }
  }

  private renderWin(ctx: CanvasRenderingContext2D) {
    this.helpText = "NI LYCKADES BEKÄMPA UTOMJORDINGARNA!";
    if(this.touchDown) {
      this.gameService.requestStart();
      this.collisionHandler.health = 5;
      this.collisionService.sendHealth(this.collisionHandler.health);
      this.ufoHandler.removeAll();
    }
  }

  private renderPlaying(ctx: CanvasRenderingContext2D) {
    var health = this.collisionHandler.health;
    this.renderEarth(ctx, health);

    //Paint the mothership
    let motherImg = new Image();
    motherImg.src = "images/sprites/motherufo.png";
    ctx.drawImage(motherImg, 0, 0);

    this.helpText = "";

    //Spaceship controllers
    this.spaceshipControllers();

    //Draw ufos
    this.ufoHandler.renderUfos();

    //Draw Spaceships
    this.collisionHandler.shieldUpdate(this.spaceship1, this.spaceship2);
    this.spaceship2.render(ctx);
    this.spaceship1.render(ctx);

    //Check for collisions
    this.collisionHandler.check(this.spaceship1, this.spaceship2,
      this.ufoHandler, health);

    //Laserbutton logic
    if(this.playerId == 0) {
      this.renderLaserButton(ctx, this.spaceship1.charges, this.spaceship1.loadedLaser);
    } else {
      this.renderLaserButton(ctx, this.spaceship2.charges, this.spaceship2.loadedLaser);
    }

    if(this.p0LaserButton && this.p1LaserButton) {
        this.spaceship1.fireLaser(this.ufoHandler.mUfo);
        this.spaceship2.fireLaser(this.ufoHandler.mUfo);
    }

    if(this.collisionHandler.health <= 0) {
      this.state = State.GAMEOVER;
    } else if (this.ufoHandler.mUfo.hp <= 0) {
      this.state = State.WIN;
    }

    //Draw pause button
    let img = new Image();
    img.src = "images/paus-btn.png";
    ctx.drawImage(img, (DEVICE_WIDTH/2)-45, 30);

    this.drawMUfoHealth(ctx);
  }

  private renderLaserButton(ctx: CanvasRenderingContext2D, charges: number, loadedLaser: boolean) {
    let img = new Image();
    switch(charges) {
      case 0:
        img.src = LASER_BUTTON_0_SOURCE;
        break;
      case 1:
        img.src = LASER_BUTTON_1_SOURCE;
        break;
      case 2:
        img.src = LASER_BUTTON_2_SOURCE;
        break;
      case 3:
        img.src = LASER_BUTTON_3_SOURCE;
        break;
      case 4:
        img.src = LASER_BUTTON_4_SOURCE;
        break;
      case 5:
        img.src = LASER_BUTTON_5_SOURCE;
        if(loadedLaser) {
          img.src = this.laserActiveSource;
        }
        break;
    }
    ctx.drawImage(img, (DEVICE_WIDTH/2)-(LASER_BUTTON_WIDTH/2), DEVICE_HEIGHT-LASER_BUTTON_HEIGHT-15);
  }

  private renderFlyToStart(ctx: CanvasRenderingContext2D) {
      this.helpText = WAITING_FOR_OTHER_PLAYERS;
/*
      if(this.touchDown && !this.tutorialClick) {
        this.tutorialSequence -= 1;
        this.tutorialClick = true;
        if(this.gameService.playerId == 1 && this.tutorialSequence <= 0) {
          this.gameService.requestStart();
        }
      } 
      if(!this.touchDown) {
        this.tutorialClick = false;
      }

      let img = new Image();
      switch (this.tutorialSequence) {
        case 4:
          img.src = TUTORIAL_1_SOURCE;
          ctx.drawImage(img, 0, 0);
          break;
        case 3:
          img.src = TUTORIAL_2_SOURCE;
          ctx.drawImage(img, 0, 0);
          break;
        case 2:
          img.src = TUTORIAL_3_SOURCE;
          ctx.drawImage(img, 0, 0);
          break;
        case 1:
          img.src = TUTORIAL_4_SOURCE;
          ctx.drawImage(img, 0, 0);
          break;
      }*/
  }

  private renderReadyForPlay(ctx: CanvasRenderingContext2D) {
    this.renderEarth(ctx, 5);

    //Spaceship controllers
    this.spaceshipControllers();

    //Draw Spaceships
    this.collisionHandler.shieldUpdate(this.spaceship1, this.spaceship2);
    this.spaceship2.render(ctx);
    this.spaceship1.render(ctx);

    if(this.gameService.playerId == 0) {
      ctx.fillStyle = "blue";
      ctx.fillText("Du är blå", DEVICE_WIDTH/2, 350);
    } else {
      ctx.fillStyle = "yellow";
      ctx.fillText("Du är gul", DEVICE_WIDTH/2, 350);
    }
  
  }

  private randomX(): number {
    return Math.floor(Math.random() * DEVICE_WIDTH);
  }

  private drawHelpText(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'gray';
    ctx.font = "35px ChalkboardSE-Regular";
    ctx.textAlign = "center";
    ctx.fillText(this.helpText, DEVICE_WIDTH/2, 300);
    if(this.state == State.GAMEOVER || this.state == State.WIN) {
      ctx.fillText("Klicka på en av skärmarna för att starta igen", DEVICE_WIDTH/2, 350);
    }
  }

  private drawHealth(ctx: CanvasRenderingContext2D) {
    for(var i = 0; i < this.collisionHandler.health; i++) {
      this.health_sprites[i].render(ctx, 20+(55*i), 20);
    }
  }

  private drawMUfoHealth(ctx: CanvasRenderingContext2D) {
    for(var i = 0; i < this.ufoHandler.mUfo.hp; i++) {
      this.mufo_health_sprites[i].render(ctx, DEVICE_WIDTH-55-(50*i), 20);
    }
  }

  private renderEarth(ctx: CanvasRenderingContext2D, health: number){
       //Paint the earth
    let img = new Image();
    img.src = "images/earth.png";
    switch (health) {
      case 5:
        img.src = "images/earth4.png";
        break;
      case 4:
        img.src = "images/earth3.png";
        break;
      case 3:
        img.src = "images/earth2.png";
        break;
      case 2:
        img.src = "images/earth1.png";
        break;
      case 1:
        img.src = "images/earth.png";
        break;
    /*case 0:
        img.src = "images/earth.png";
        break;*/
    }
    ctx.drawImage(img, 0, DEVICE_HEIGHT-80);
  }

  private subscribe() {
/*      // Updated when a levelComplete is receivied.
      this.gameService.levelCompleted$.subscribe(score => {
        if (score === -1) {
          this.initNewLevel(this.context, score, this.renderGameLost);
        } else {
          this.initNewLevel(this.context, score, this.renderLevelCompleted);
        }
      }); */

      // Updated when the level starts.
      this.gameService.levelStart$.subscribe(started => {
        log("start!", started);
        if(!started) {
          this.collisionHandler.health = 5;
          this.ufoHandler.mUfo.resetHp();
        }
        this.initShips();
        this.state = State.READY_FOR_PLAY;
        Observable.timer(0, 1000).take(6).subscribe( t => {
          this.timer = t;
          this.helpText = "Spelet börjar om: " + (5-t);
          if(t > 4) {
            this.state = State.PLAYING;
            if(this.gameService.playerId == 0) {                  
              this.ufoHandler.mUfo.cannonBulletHandler.cannonBullets = [];
            }
            this.ufoHandler.ufos = [];
          }
        });
        this.listenerHandler.removeListeners();
      });

      // Show a toast when error is receivied.
      this.gameService.error$.subscribe(error => {

      });

      // Updated when the playerID is confirmed.
      this.gameService.IDConfirmed$.subscribe(newId => {
        log("new ID", newId);
        this.playerId = newId;
        if (newId !== -1) {
          this.listenerHandler.removeListeners();
          this.gameService.requestStart();
          log("new id !== -1", newId);
        }
      });

      // Updates the other players spaceship
      this.gameService.spaceshipMovingLeft$.subscribe(move => {
        log("spaceship2 move left", move);
        if(!move) {
          this.spaceship2.moveRightRemote(move);
        }
        this.spaceship2.moveLeftRemote(move);
      });

      // Updates the other players spaceship
      this.gameService.spaceshipMovingRight$.subscribe(move => {
        log("spaceship2 move right", move);
        this.spaceship2.moveRightRemote(move);
        if(!move) {
          this.spaceship2.moveRightRemote(move);
        }
      });

      // Updates the other players spaceship
      this.gameService.spaceshipMoving$.subscribe(move => {
        log("new position", move);
        this.spaceship2.xPosition = move;
      });

      // Updates health
      this.collisionService.health$.subscribe(health => {
        log("new health", health);
        this.collisionHandler.health = health;
      });

      // Updates charges to the laser
      this.collisionService.charges$.subscribe(charges => {
        log("charges updated", charges);
        this.spaceship1.charges = charges;
        this.spaceship2.charges = charges;
      })

      this.gameService.players$.subscribe(amount => {
        log("amount of players", amount);
        if(amount > 1 && this.gameService.playerId == 0){
          this.gameService.requestStart();
        }
      });

      this.gameboardService.buttonPressed$.subscribe(pressed => {
        log("button pressed in the other screen", pressed);
        if(this.gameService.playerId == 0) {
          this.p1LaserButton = pressed;
        } else {
          this.p0LaserButton = pressed;
        }
      });

      this.collisionService.mufoHealth$.subscribe(hp => {
        log("new health on mufo", hp);
        this.ufoHandler.mUfo.decreaseHp(true);
      });

      this.gameService.pause$.subscribe(paused => {
        if(paused) {
          this.state = State.PAUSE;
          this.ufoHandler.mUfo.cannonBulletHandler.gamePaused(true);
          this.spaceship1.bulletHandler.gamePaused(true);
          this.spaceship2.bulletHandler.gamePaused(true);
        } else {
          this.state = State.PLAYING;
          this.ufoHandler.mUfo.cannonBulletHandler.gamePaused(false);
          this.spaceship1.bulletHandler.gamePaused(false);
          this.spaceship2.bulletHandler.gamePaused(false);
        }
      });
    }
}
