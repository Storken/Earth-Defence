import {Component, NgZone, Input, OnInit} from '@angular/core';
import {Platform} from 'ionic-angular';
import {log} from '../Util/Log.service';
import {NavController, NavParams} from 'ionic-angular';
import {Observable}     from 'rxjs/Observable';
import {InitGameService} from './init-game.service'
import {GameComponent} from '../game/game.component';


@Component({
    templateUrl: './room.component.html',
    selector: 'room',
})
export class RoomComponent implements OnInit {

    @Input()
    color: any;

    connected: boolean;

    disabled: boolean;
    connectionSubscription: any;


    constructor(private _ngZone: NgZone, private nav: NavController,
        private initGame: InitGameService) {

    }

    ngOnInit() {
            console.log("init room", this.color);
            if (!this.connectionSubscription) {
                console.log("subscribeingn");
                this.connectionSubscription = this.initGame.connectedObs.subscribe(connectedTo => {
                   // log("connected to: ", connectedTo);
                    //log("this room", this.color);
                    // Not connected to anything
                    if (connectedTo === null) {
                        this._ngZone.run(() => {
                            this.connected = false;
                            this.disabled = false;
                        });
                    }
                    // Connected to this room, it is connected.
                    else if (connectedTo === this.color.uid) {
                        this._ngZone.run(() => {
                            log("going to game!!", connectedTo);
                            this.connected = true;
                            this.goToGame();
                        });
                        // connected to some other room, disable.
                    } else {
                        this._ngZone.run(() => {
                            this.disabled = true;
                        });
                    }

                });
            }

    }

    startOrJoin() {
        if (this.connected) {
            console.log("already connected!")
            return;
        }
        log("#start or join", this.connected);
        this.initGame.setLoading(true);
        if (this.connected) {
            this.goToGame();
        } else {
            this.initGame.startOrJoin(this.color);
        }
    }

    private startGame(roomUid: string) {
        this.initGame.startGame(roomUid);
    }

    private goToGame() {
        log("the sub", this.connectionSubscription);
        setTimeout(() => {
            this.connectionSubscription.unsubscribe();
        }, 100);

        log("the sub2", this.connectionSubscription);


        this.initGame.goToGame();
        this.nav.push(GameComponent);
        this.initGame.setLoading(false);

    }

    ngOnDestroy() {
        this.connectionSubscription.unsubscribe();


        console.log("on destroy!!");
    }

    disconnect(event) {
        event.stopPropagation();
        this.initGame.disconnect();
    }

    continue(event) {
        event.stopPropagation();
    }


}
