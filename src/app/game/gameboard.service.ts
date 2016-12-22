import { Injectable } from '@angular/core';
import {Observable}     from 'rxjs/Observable';
import {Subject}  from 'rxjs/Subject';
import {BluetoothService} from '../connection/bluetoothle.service';
import { BUTTON_PRESSED } from '../Util/constants';
import { PurpleHarvestUfo, Ufo } from './ufo';

@Injectable()
export class GameboardService {
    // Observable sources
    private buttonPressedSource = new Subject<boolean>();

    // Observable source streams
    public buttonPressed$ = this.buttonPressedSource.asObservable();

    // Model data
    private _playerId: number;
    get playerId() { return this._playerId == null? 0 : this._playerId }

    constructor(private connection: BluetoothService){
    // Subscribe to play id changes.
    this.connection.playerId.subscribe(newId => {
      this._playerId = newId;
    });

    this.connection.subscribe().subscribe(this.msgReceived);
    }

    sendButtonPressed(pressed: boolean) {
        this.connection.send([
            BUTTON_PRESSED,
            pressed,
            "",
            this.playerId
        ]);
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
    switch(msg[0]) {
        case BUTTON_PRESSED:
            this.buttonPressedSource.next(msg[1]);
            break;
    }
  } 
}