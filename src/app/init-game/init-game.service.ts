import {Component, NgZone, Input, Injectable} from '@angular/core';
import {Platform} from 'ionic-angular';
import {BluetoothService} from '../connection/bluetoothle.service';
import {log} from '../Util/Log.service';
import {Observable} from 'rxjs/Rx';
import {Subject}  from 'rxjs/Subject';


@Injectable()
export class InitGameService {

    foundServer: string;
    currentServerAddress: string;
    private connectedSubject: Subject<string>;
    localName: string;
    private _isLoadingSubject: Subject<boolean>;
    private _isLoadingObs: Observable<boolean>;
    private connectionSubscription: any;
    private searchSubscription: any;
    private joinSubscription: any;
    private currentRoomUid: string = null;
    connectionSub: any;



    constructor(private connection: BluetoothService) {
        console.log("constructor initGameService");

        this.foundServer = null;
        this.connectedSubject = new Subject<any>();
        this._isLoadingSubject = new Subject<boolean>();
        this._isLoadingObs = this._isLoadingSubject.asObservable();
        this.localName = null;


        this.connection.searchResults.subscribe(this.handleSearchResult);
        this.connectionSub = this.connection.connected.subscribe(this.connectionChanged);


    }

    private handleSearchResult = (newServer) => {
        let roomUid = this.currentRoomUid;
        log("#roomComponent new server!", newServer);
        // Only add if this is a game-server
        console.log("#roomComponent Is it this room?", this.connection.isThisRoom(newServer, roomUid));
        if (this.connection.isThisRoom(newServer, roomUid)) {
            this.foundServer = newServer.address;
            // if we are not already connected to this.
            if (!(newServer.address === this.currentServerAddress)) {
                log("#roomComponent New server found", newServer);
                // if this server is "better"(started earlier) than the current, or if there is no
                // current server.
                if ((parseInt(newServer.advertisement.localName) < parseInt(this.localName)) ||
                    this.localName === null) {
                    log("better server!!", newServer);
                    this.connection.disconnect(this.currentServerAddress);
                    this.localName = newServer.advertisement.localName;
                    this.currentServerAddress = newServer.address;
                    this.connection.connect(newServer.address, roomUid);

                }

            }

        }
    }

    private connectionChanged = (connectedTo) => {
        let roomUid = this.currentRoomUid;

        log("#roomComponent2145", connectedTo);
        if (connectedTo === null) {
            this.connectedSubject.next(null);
        } else {
            this.connectedSubject.next(roomUid);
        }
    }

    get connectedObs(): Observable<string> {
        return this.connectedSubject.asObservable();
    }


    searchGames(roomUid: string) {
        log("Search for game", roomUid);
        this.currentRoomUid = roomUid;
        let searchObs = this.connection.searchServers(roomUid);

    }

    startOrJoin(room: any) {
        this.searchGames(room.uid);
        Observable.timer(120).subscribe(
            () => {
                console.log("two sec pass!");
                if (!this.foundServer) {
                    // startServer
                    console.log("start server");
                    this.startGame(room.uid);
                } else {
                    console.log("Join server");

                }
            });
    }

    startGame(roomUid: string) {
        console.log("start new game", roomUid);
        var d = new Date();
        var timeString = d.getSeconds() + "" + d.getMilliseconds();
        log("Timestring: ", timeString);
        this.localName = timeString;

        let startedObs = this.connection.startServer(timeString, roomUid);
        if (!this.connectionSubscription) {
            log("subscribe!!!!!!!!!!!!!!!", null);
            this.connectionSubscription = startedObs.subscribe(connected => {
                log("connected", connected);
                log("the subject", this.connectedSubject);
                this.connectedSubject.next(connected);
            });
        }
    }

    goToGame() {
        this.connection.stopScan();
        //this.connectionSubscription.unsubscribe();
        //this.connectionSub.unsubscribe();
        this.connectedSubject = new Subject<any>();
        this.foundServer = null;
        this.localName = null;
        this.currentServerAddress = null;
        this.currentRoomUid = null;
    }

    setLoading(loading: boolean) {
        this._isLoadingSubject.next(loading);
    }

    getLoading() {
        return this._isLoadingObs;
    }
    getErrors(): Observable<string> {
        return this.connection.getErrors();
    }

    disconnect() {
        this.connection.clean();
        this.foundServer = null;
        this.localName = null;
    }
}
