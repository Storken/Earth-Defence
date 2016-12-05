import {Observable}     from 'rxjs/Observable';
import {Subject}  from 'rxjs/Subject';
import { Injectable, NgZone } from '@angular/core';
import {log} from '../Util/Log.service';
import { PLAYER_READY, PLAYER_NOT_READY
  , SPACESHIP_POSITION, SPACESHIP_RIGHT, SPACESHIP_LEFT } from '../Util/constants';
import {BluetoothService} from '../connection/bluetoothle.service';

@Injectable()
export class GameService {
  // Observable sources
  private levelStartSource = new Subject<boolean>();
  private IDConfirmedSource = new Subject<number>();
  private errorSource = new Subject<string>();
  private spaceshipMovingSource = new Subject<number>();
  private spaceshipMovingLeftSource = new Subject<boolean>();
  private spaceshipMovingRightSource = new Subject<boolean>();

  // Observable string streams
  levelStart$ = this.levelStartSource.asObservable();
  IDConfirmed$ = this.IDConfirmedSource.asObservable();
  error$ = this.errorSource.asObservable();
  spaceshipMovingLeft$ = this.spaceshipMovingLeftSource.asObservable();
  spaceshipMovingRight$ = this.spaceshipMovingRightSource.asObservable();
  spaceshipMoving$ = this.spaceshipMovingSource.asObservable();

  // Model data
  private _playerId: number;
  get playerId() { return this._playerId == null? 0 : this._playerId }

  constructor(private connection: BluetoothService) {
    // Subscribe to play id changes.
    this.connection.playerId.subscribe(newId => {
      console.log("playerid - newId: ", newId);
      this._playerId = newId;
      this.IDConfirmedSource.next(newId);
    });
    // Subscribe to level start notifications.
    this.connection.started.subscribe(started => {
      console.log("started");
      this.levelStartSource.next(started)
    });
    this.connection.subscribe().subscribe(this.msgReceived);
    // Test:
    //setTimeout(()=> {this.levelCompleteSource.next(-1)}, 3000);
  }

  requestId(playerId: number) {
    this.connection.requestPlayerId(playerId);
  }

  requestStart() {
    this.connection.requestStartGame(this._playerId);
  }

  isMe(playerId: number): boolean {
    return playerId === this.playerId;
  }

  sendReady() {
    this.connection.send([
      PLAYER_READY,
      "",
      "",
      this.playerId
    ]);
  }

  sendNotReady() {
    this.connection.send([
      PLAYER_NOT_READY,
      "",
      "",
      this.playerId
    ]);
  }

  sendLeftmovement(move: boolean, x? : number) {
    this.connection.send([
      SPACESHIP_LEFT,
      move,
      x ? x : "",
      this.playerId
    ]);
  }

  sendRightmovement(move: boolean, x? : number) {
    this.connection.send([
      SPACESHIP_RIGHT,
      move,
      x ? x : "",
      this.playerId
    ]);
  }

  private isHost() {
    return this.connection.isHost();
  }

  /**
 * To save on bluetooth package space, small constants are used to send events.
 * msg[0] decides the type of event.
 * msg[1-2] and [4] can be used to send extra parameters, see 'send'-functions.
 * msg[3] = The player that sent the message.
 *
 * In a nutshell, the client send some data to sever. Server either updates the game-state,
 * or passes the message along to other clients if they need to know.
 */
  private msgReceived = (msg) => {
    log("message received in spaceshipadventure-gameservice", msg);

    if (msg[3] === this.playerId) {
      console.log("From me!");
      return;
    }

    switch (msg[0]) {
      case PLAYER_READY:
        this.levelStartSource.next(true);
        break;
      case PLAYER_NOT_READY:
        this.levelStartSource.next(false);
        break;
      case "start":
        this.levelStartSource.next(true);
        break;
      case SPACESHIP_LEFT:
        this.spaceshipMovingLeftSource.next(msg[1]);
        if(!msg[1]) {
          this.spaceshipMovingSource.next(msg[2]);
        }
        break;
      case SPACESHIP_RIGHT:
        this.spaceshipMovingRightSource.next(msg[1]);
        if(!msg[1]) {
          this.spaceshipMovingSource.next(msg[2]);
        }
        break;
    }


  }
}
    /*
      case PIRATE_TURN:
        log("this.playerId", this.playerId);

        if (this.playerId === msg[1]) {
          this.piratesTurn();
        }
        break;
      case ALL_PIRATES_DONE:
        this.playersTurn();
        break;
      case LEVEL_COMPLETED:
        this.levelCompleted();
        break;
      case PIRATE_DONE:
        // last pirate done:
        this.handlePirateDone(msg[1]);
        break;
      case PLAYER_DONE:
        this.playerDone(msg[3]);
        break;
      case REQUEST_START_PIRATES:
        this.sendPiratesTurn(0);
        break;
      case PEARL_SELECTION:
        if (this.isHost()) {
          this.connection.send(msg, true);
        }
        this.selectionActivatedEvent(msg[3], msg[1]);
        break;
      case PEARL_ACTIVATED:
        if (this.isHost()) {
          this.connection.send(msg, true);
        }
        this.gameBoardEventSource.next(
          { 'type': SELECTION_DEACTIVATED });
        break;
      case BLE_FIRE:
      case BLE_NATURE:
      case BLE_LIGHT:
        let shooter = msg[4];
        if (this.isHost()) {
          this.connection.send(msg, true);
        }
        this.shotEvent(msg[1], msg[2], msg[4], msg[0]);
        break;
      case ALL_TREASURES_COLLECTED:
        this.allTreasuresCollected(msg[1]);
        break;
      case PLAYERS_DONE:
        if (this.isHost()) {
          this.playerDone(msg[3]);
        }
        break;
      case LOST:
        if (this.isHost()) {
          this.sendLost(this.playerId);
        }
        // notify game component of loss.
        this.levelCompleteSource.next(-1);
        this.gameBoardEventSource.next({
          'type': GAME_LOST
        });
        break;
    }*/
