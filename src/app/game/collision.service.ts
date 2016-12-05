import { Injectable } from '@angular/core';
import { UfoHandler } from './ufo-handler';
import { ShotHandler } from './shot-handler';
import { Spaceship } from './spaceship';
import {Observable}     from 'rxjs/Observable';
import {Subject}  from 'rxjs/Subject';
import {BluetoothService} from '../connection/bluetoothle.service';
import {HEALTH_LOST} from '../Util/constants';

@Injectable()
export class CollisionService {
  //Observable sources
  healthSource = new Subject<number>();

  //Observable streams
  health$ = this.healthSource.asObservable();
  
  // Model data
  private _playerId: number;
  get playerId() { return this._playerId == null? 0 : this._playerId }

  constructor(private connection: BluetoothService) {
    // Subscribe to play id changes.
    this.connection.playerId.subscribe(newId => {
      this._playerId = newId;
    });

    this.connection.subscribe().subscribe(this.msgReceived);
  }

  sendHealth(health: number) {
    this.connection.send([
      HEALTH_LOST,
      health,
      health <= 0 ? true : false,
      this.playerId
    ])
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

    if (msg[3] === this.playerId) {
      console.log("From me!");
      return;
    }

    switch (msg[0]) {
      case HEALTH_LOST:
          this.healthSource.next(msg[1]);
        break;
    }
  }
}
