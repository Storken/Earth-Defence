import { Injectable } from '@angular/core';
import { ConnectionService} from './connection.service';
import { Server } from './server.service';
import { Client } from './client.service';
import {log} from '../Util/Log.service';
import {Observable}     from 'rxjs/Observable';
import {Subject}  from 'rxjs/Subject';



@Injectable()
export class BluetoothService {
  private _roomUid: string;
  private actAsServer: boolean;
  private playerIdSubject: Subject<number>;
  private playerIdObs: Observable<number>;
  private players: Array<Player>;
  private requestIdKey: number;
  private _started: Subject<boolean>;
  private startedRecently: boolean;

  private msgSubject: Subject<any> = new Subject<any>();


  constructor(private server: Server, private client: Client) {
    console.log("bluetoothService loaded");
    this.actAsServer = false;
    this.playerIdSubject = new Subject<number>();
    this.playerIdObs = this.playerIdSubject.asObservable();
    this.players = [];
    this._started = new Subject<boolean>();
    this.setUpSubScriptions();

    this.server.getMessages().subscribe(message => {
      this.msgSubject.next(message);
    });
    this.client.getMessages().subscribe(message => {
      this.msgSubject.next(message);
    });
  }


  get started() {
    return this._started.asObservable();
  }

  get playerId() {
    return this.playerIdObs;
  }

  /**
   * PROTCOL to request a unique player id:
   * client sends ["id", <requestedID>, key] to server, where <requestedID> is
   * a interger between 0 and 3. Key is a random number 0-1000000 that will be used as a identifier(since we can't
   * send device specific messages, this is good enough.)
   *
   * The server will return ["id", <playerId>, key], where playerId is 0-3 if accepted by server,
   * -1 if already taken.
   */
  requestPlayerId(playerId) {
    if (this.actAsServer) {
      if (!this.takenId(playerId)) {
        this.playerIdSubject.next(playerId);
        //this.players.push(new Player(playerId));
      }
    } else {
      // Generate a unique(almost certainly unique, unfortunately there is no way to make sure..) key.
      this.requestIdKey = Math.floor(Math.random() * 1000000);
      this.client.write(["id", playerId, this.requestIdKey], this._roomUid);
    }
    return this.playerIdObs;
  }

  requestStartGame(playerId: number) {
    if(playerId == null) {
      playerId = 0;
    }
    if (this.actAsServer) {
      let player = this.getPlayer(playerId);
      log("playerId:", playerId);
      console.log(player);
      player.requestStart();
      log("the players", this.players);
      log("this.hasAllStarted()", this.hasAllStarted());
      if (this.hasAllStarted() && !this.startedRecently) {
        this.server.notifyStart(this._roomUid);
        this._started.next(true);
        this.startedRecently = true;
        setTimeout(() => { this.startedRecently = false; }, 3000);
      }
    } else {
      this.client.write(["start", playerId], this._roomUid);
    }
  }

  hasAllStarted() {
    if(this.players.length <= 1) {
      return false;
    }
    for (let player of this.players) {
      if (!player.hasStarted) {
        return false;
      }
    }
    return true;
  }

  getPlayer(playerId: number) {
    for (let player of this.players) {
      if (player.playerId === playerId) {
        return player;
      }
    }
    return null;
  }

  takenId(playerId): boolean {
    for (let player of this.players) {
      if (player.playerId === playerId) {
        return true;
      }
    }
    return false;
  }


  startServer(name: string, serviceUid: string): Observable<string> {
    console.log("start server.");
    this.actAsServer = true;
    // server is always player 0.
    let player = new Player();
    this.players.push(player);
    this.playerIdSubject.next(player.playerId);
    this.playerIdObs
    this.roomUid = serviceUid;
    console.log("playerId is set");
    console.log(player.playerId);

    return this.server.start(name, serviceUid);
  }


  set roomUid(roomUid: string) {
    this._roomUid = roomUid;
  }

  get roomUid() {
    return this._roomUid;
  }

  isGameServer(server): boolean {
    if (!server.advertisement.serviceUuids) {
      return false;
    }
    return server.advertisement.serviceUuids.some(
      service => { return service === "1234" });
  }
  isThisRoom(server, room: string): boolean {
    if (!server.advertisement.serviceUuids) {
      return false;
    }
    return server.advertisement.serviceUuids.some(
      service => { return service === room });
  }

  searchServers(serviceUid: string) {
    this.client.searchForServers(serviceUid);
  }

  getServers() {
    console.log("Get Servers");
    console.log(this.client.getFoundServers());
    return this.client.getFoundServers();
  }

  connect(address: string, serviceUid: string) {
    this.actAsServer = false;
    this.roomUid = serviceUid;
    this.client.connect(address, serviceUid);
  }

  subscribe(): Observable<any> {
    return this.msgSubject.asObservable();
  }

  initClient() { }

  send(msg: any, forced?: boolean) {
    if (this.actAsServer) {
      if (forced) {
        this.server.notify(msg, this._roomUid, forced);
      } else {
        this.server.notify(msg, this._roomUid);
      }
    } else {
      this.client.write(msg, this._roomUid);
    }
  }

  stopScan() {
    this.client.stopScan();
  }

  isHost(): boolean {
    return this.actAsServer;
  }

  disconnect(address: string) {
    this.client.disconnect(address);
    this.server.stopAdvertising();
  }

  clean() {
    if (this.actAsServer) {
      this.server.clean();
    } else {
      this.client.clean();
    }

    this.actAsServer = false;
    this.players = [];
  }

  getErrors(): Observable<string> {
    if (this.actAsServer) {
      return this.server.getErrors();
    } else {
      return this.client.getErrors();
    }
  }

  /**
   * Changes to id of the person that is not server(player 0) to 2.
   * (Two player mode is always played with player 0 (the server) and 2).
   */
  changeToTwoPlayers(myId) {
    this.players.forEach(player => {
      if (player.playerId !== myId) {
        player.playerId = 2;
      } else if (player.playerId === myId) {
        player.playerId = 0;
      }
    });
  }

  get nbrOfPlayers() {
    return this.players.length;
  }

  private setUpSubScriptions() {
    this.server.getMessages().subscribe(msg => {
      // respond to a ?-request(custom "am I allowed to connect?")
      if (msg[0] === "?") {
        // send the message back
        if (this.server.nbrSubscribed >= 2) {
          msg[2] = false;
        } else {
          msg[2] = true;
          // assign id:
          let player = new Player();
          this.players.push(player);
          msg[3] = player.playerId;
        }
        this.server.notify(msg, this.roomUid);
      } else if (msg[0] === "id") {
        log("id request!!", msg);
        if (msg[1] < 2 && msg[1] >= 0) {
          if (this.takenId(msg[1])) {
            msg[1] = -1;
          } else {
            //this.players.push(new Player(msg[1]));
          }
          this.server.notify(msg, this.roomUid);
        }
      } else if (msg[0] === "start") {
        this.requestStartGame(msg[1]);
      } else {
        //this.server.notify(msg, this.roomUid);
      }
    });

    this.client.getMessages().subscribe(msg => {
      log('msg', msg);
      if (msg[0] === '?') {
        if (msg[2]) {
          log('notify', null)
          this.playerIdSubject.next(msg[3]);

        }
      }
      if (msg[0] === "id") {
        if (msg[2] === this.requestIdKey) {
          if (msg[1] != -1) {
            this.playerIdSubject.next(msg[1]);
            //this.players.push(new Player(msg[1]);
          }
          else {
            log("playerID TAKEN", msg);
            this.playerIdSubject.next(-1);
          }
        }
      } else if (msg[0] === "start") {
        this._started.next(true);
      }
    });
  }

  get searchResults(): Observable<any> {
    return this.client.serversObservable$;
  }

  get connected(): Observable<any> {
    return this.client.connected$;
  }
}

class Player {
  private _hasStarted: boolean;
  private static playerCount: number = 0;
  private _playerId: number

  constructor() {
    this._hasStarted = false;
    this._playerId = Player.playerCount;
    Player.playerCount++;

  }

  requestStart() {
    this._hasStarted = true;
    setTimeout(() => { this._hasStarted = false; }, 1500);
  }

  get playerId(): number {
    return this._playerId;
  }

  get hasStarted() {
    return this._hasStarted;
  }

  set playerId(playerId: number) {
    this._playerId = playerId;
  }
}
