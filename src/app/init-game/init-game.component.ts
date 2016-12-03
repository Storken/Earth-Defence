import {Component, NgZone, OnInit} from '@angular/core';
import {Platform} from 'ionic-angular';
import {BluetoothService} from '../connection/bluetoothle.service';
import {ConnectionService} from '../connection/connection.service'
import {log} from '../Util/Log.service';
import {Toast, NavController} from 'ionic-angular';
import {RoomComponent} from './room.component';
import {InitGameService} from './init-game.service'
import {GameComponent} from '../game/game.component';

@Component({
  templateUrl: './init-game.component.html'
})
export class InitGameComponent implements OnInit {
  //devices: DeviceHandler;
  servers: any;
  contrast: number;
  serverStarted: boolean;
  connectedTo: string;
  playerId: string;
  colors: any;
  loading: boolean;


  constructor(private _ngZone: NgZone,
    private connection: BluetoothService, private nav: NavController,
    private initGame: InitGameService) {


  }
  ngOnInit() {
    //  this.devices = new DeviceHandler();
    this.servers = [];
    // this.servers.push({
    //   "name" : "Game",
    //   "address" : "1234"
    // });
    // this.servers.push({
    //   "name" : "Game",
    //   "address" : "1234"
    // });
    this.serverStarted = false;
    this.connectedTo = null;
    this.colors = [
      {
        "class": "pink",
        "uid": "0001",
        "name": "Rosa"
      }, {
        "class": "yellow",
        "uid": "0002",
        "name": "Gul"
      }, {
        "class": "red",
        "uid": "0003",
        "name": "Röd"
      }, {
        "class": "blue",
        "uid": "0004",
        "name": "Blå"
      }, {
        "class": "green",
        "uid": "0005",
        "name": "Grön"
      }, {
        "class": "purple",
        "uid": "0006",
        "name": "Lila"
      }];

    this.loading = false;

    this.initGame.getLoading().subscribe(isLoading => { this.loading = isLoading; });

    this.connection.getErrors().subscribe(error => {
      this.presentToast(error);
    });
  }


  presentToast(msg: string) {
    let toast = Toast.prototype;
    toast.setMessage(msg);
    toast.present(this.nav.getActive);
  }



/*  onChange(newValue) {
    console.log(newValue);
    newValue = parseInt(newValue);
    this.gameService.playerId = newValue;
  }*/

  playSound() {
    this.connection.clean();
  }


/*  onIdChange(event) {
    log("Id changed", event);
    this.playerId = event;
    log("the id is ", this.playerId);
    this.gameService.playerId = parseInt(event);
  }*/

  startGame() {
    /*      console.log("start new game");
          this.connection.startServer("Game!!", "1234")
          .subscribe(serverStarted => {
            this._ngZone.run(() => {this.serverStarted = serverStarted});
          });
          //this.subscribeToMsg();*/
  }

  searchGames() {
    console.log("Search for game");
    /*      this.connection.searchServers().subscribe(
            newServer => {
              log("new server!", newServer);
              // Only add if this is a game-server
              console.log("Is game service?", this.connection.isGameServer(newServer));
              if(this.connection.isGameServer(newServer)){
                this._ngZone.run(() => {this.servers.push(newServer)});
              }
            });*/
  }

  getGames() {
    //return this.connection.getServers();
    return this.servers;
  }

  connect(server) {
    console.log("Connecting to: ", server);
    this.connection.connect(server.address, "1234")
    /*      .subscribe(connectedTo => {
            console.log("connected to", connectedTo);
            this._ngZone.run(() => {this.connectedTo = connectedTo});
          });*/
    this.subscribeToMsg();

  }

  send(value) {
    console.log("Sending in component ", value);
    // this.connection.send(value + "", "1234");
  }

  private subscribeToMsg() {
    this.connection.subscribe()
      .subscribe(msg => {
        log("message received in component2", msg);
        this._ngZone.run(() => { this.contrast = msg });
      });
  }

  goToGame() {
    log("goToGame() GOING", "yolo");
    this.nav.push(GameComponent);
  }
}
