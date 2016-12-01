import { Injectable } from '@angular/core';
import {Observable}     from 'rxjs/Observable';
import {Subject}  from 'rxjs/Subject';
import {BehaviorSubject} from 'rxjs/Rx';
import {log} from '../Util/Log.service';
declare var bluetoothle;




@Injectable()
export class Client {
  private connectedTo: string;

  private serversSubject: Subject<any>;
  serversObservable$: Observable<any>;

  private connectedSubject: Subject<any>;
  connected$: Observable<any>;

  private msgSubject: Subject<any>;
  private msg: Observable<any>;

  private connectKey: number;
  private connectionVerified: boolean;

  private errorSubject: Subject<string>;
  private errorObs: Observable<string>;

  private servers: ServerHandler;
  constructor() {
    this.servers = new ServerHandler();
    this.serversSubject = new Subject<any>();
    this.connectedSubject = new Subject<string>();
    this.msgSubject = new Subject<any>();
    this.serversObservable$ = this.serversSubject.asObservable();
    this.connected$ = this.connectedSubject.asObservable();
    this.msg = this.msgSubject.asObservable();
    this.errorSubject = new Subject<string>();
    this.errorObs = this.errorSubject.asObservable();
    this.connectionVerified = false;
  }

  /**
   * Discover the serivces and characteristics of a device. Only scans the provided 
   * service uuid and the characteristic "ABCD" for better performance.
   * 
   * When the characteristic is found this.subscribe() is called. 
   * 
   * Make sure that this.connectedTo is set before usage. 
   * 
   * @return An observable that updates when new servers are found.
   */
  scanForService(serviceUid: string) {
    let address = this.connectedTo;
    let params = {
      "service": serviceUid,
      "services": [serviceUid],
      "characteristic": "ABCD",
      "characteristics": ["ABCD"],
      "type": "noResponse",
      "allowDuplicates": true,
      "address": address
    };
    log("Scanning: ", params);
    let scanSuccess = (status) => {
      log("result in scan:", status);
      bluetoothle.characteristics((data) => {
        console.log(data);
        this.subscribe(address, serviceUid);
        params.characteristic = data.characteristics[0].uuid;
      }, this.error, params);
    };
    bluetoothle.services(scanSuccess, this.error, params);
  }


  public write(value, serviceUid: string) {
    if (!this.defined()) { return; }
    log("The value is", value);
    let address = this.connectedTo;
    let asString = value;
    asString = JSON.stringify(value);
    let bytes = bluetoothle.stringToBytes(asString);
    let encodedString = bluetoothle.bytesToEncodedString(bytes);
    console.log("The address is", address);
    let params = {
      "value": encodedString, "service": serviceUid, "characteristic": "ABCD",
      "type": "noResponse", "address": address
    };
    log("Sending message: ", params);
    bluetoothle.writeQ((data) => {
      log("wrote", data);
    }, this.error, params);



    //bluetoothle.write(writeSuccess, writeError, params);
    //bluetoothle.characteristics(writeSuccess, writeError, params);
    //bluetoothle.services(writeSuccess, this.error, params);
    return this.msg;


  }
  private error = (status) => {
    log("error", status);
  };




  public connect(address, serviceUid: string) {
    //this.stopScan();
    let params = {
      "address": address
    };
    let connectSuccess = (status) => {
      log("ConnectSucces!!", status);
      if (status.status === "connected") {
        log("connected:", status);
        this.connectedTo = address;
        this.scanForService(serviceUid);
      } else if (status.status === "disconnected") {
        this.connectedSubject.next(null);
        log("disconnected.. reconnecting", status);
        this.reconnect(params, serviceUid);
      }
    };
    let connectError = (status) => {
      console.log("error when connecting");
      console.log(status);
    };
    bluetoothle.connect(connectSuccess, connectError, params);
  }


  private subscribe(address: string, serviceUid: string) {
    let subscribeSuccess = status => {
      if (status.status === "subscribed") {
        log("Subscription has started", status);
        this.connectKey = Math.floor(Math.random() * 10000000);
        this.write(["?", this.connectKey], serviceUid);

        // this.connectedSubject.next(address);
      } else if (status.status === "subscribedResult") {
        log("Subscription result has been received", status);
        this.handleMessage(status);
      }
    };
    let params = {
      "address": address,
      "service": serviceUid,
      "characteristic": "ABCD"
    };
    bluetoothle.subscribe(subscribeSuccess, this.error, params);
  }

  getMessages(): Observable<any> {
    return this.msg;
  }

  private reconnect(params, serviceUid: string) {
    bluetoothle.reconnect(status => {
      if (status.status === "disconnected") {
        this.reconnect(params, serviceUid);
      } else if (status.status === "connected") {
        log("reconnected!", status);
        this.scanForService(serviceUid);
      }
    }, this.error, params);
  }

  stopScan() {
    if (this.defined()) {
      bluetoothle.stopScan(status => { log("Stopped scanning: ", status) }, this.error);
    }
  }

  defined() {
    if (typeof bluetoothle === 'undefined') {
      return false;
    } else {
      return true;
    }
  }

  startScan(serviceUid: string): void {
    console.log("Starting scan for devices...", "status");
    //this.servers = new ServerHandler();
    bluetoothle.startScan(this.startScanSuccess, this.handleError, { services: [serviceUid] });
  }
  private startScanSuccess = (result) => {
    log("startScanSuccess", result);
    if (result.status === "scanStarted") {
      console.log("Scanning for devices (will continue to scan until you select a device)...", "status");
    }
    else if (result.status === "scanResult") {
      /*          if (!this.servers.getDevices().some(function(device) {
                    return device.uid === result.address;
                })) {*/
      this.servers.addDevice(result.name, result.address);
      this.serversSubject.next(result);
      //addDevice(result.name, result.address);
      /*         }*/
    }
  }

  private initializeSuccess = (result, serviceUid: string) => {
    if (result.status === "enabled") {
      console.log("Bluetooth is enabled.");
      this.startScan(serviceUid);
    }
    else {
      console.log("Bluetooth is not enabled:", "status");
      console.log(result, "status");
    }
  }
  handleError(error) {
    var msg;
    if (error.error && error.message) {
      var errorItems = [];
      if (error.service) {
        //errorItems.push("service: " + (uuids[error.service] || error.service));
      }
      if (error.characteristic) {
        //errorItems.push("characteristic: " + (uuids[error.characteristic] || error.characteristic));
      }
      msg = "Error on " + error.error + ": " + error.message + (errorItems.length && (" (" + errorItems.join(", ") + ")"));
    }
    else {
      msg = error;
    }
    console.log(msg, "error");
  }
  public searchForServers(serviceUid: string) {
    new Promise(function (resolve, reject) {
      bluetoothle.initialize(resolve, reject,
        { request: true, statusReceiver: false });

    }).then(data => {
      this.initializeSuccess(data, serviceUid);
    }, this.handleError);
  }

  private handleMessage(messageObj) {
    let message = messageObj.value;
    message = bluetoothle.encodedStringToBytes(message);
    message = bluetoothle.bytesToString(message);
    log("the message:", message);

    message = JSON.parse(message);
    // check if this is the answer to a connection request.
    if (message[0] === "?") {
      log("this.connectKey", this.connectKey);
      if (this.connectKey === message[1]) {
        log("answer to a connection request", message);
        if (!message[2]) {
          this.disconnect(this.connectedTo);
          this.errorSubject.next("Det här rummet är redan fullt, testa något annat!");
        } else if (message[2]) {
          this.connectedSubject.next(this.connectedTo);
          this.connectionVerified = true;
          this.msgSubject.next(message);
        }
      }
    } else {
      this.msgSubject.next(message);
    }
  }

  getErrors(): Observable<string> {
    return this.errorObs;
  }


  disconnect(address: string) {
    log("disconnect", address);
    bluetoothle.disconnect(status => { log("disconnect", status) },
      this.error, { "address": address });
  }

  clean() {
    if (this.connectedTo) {
      bluetoothle.unsubscribe(status => {
        log("unsubscribe", status);
        bluetoothle.close(status => { log("closed", status) }, this.error, {
          "address": this.connectedTo,
        });
      }, error => {
        log("error", error); bluetoothle.close(status => { log("closed", status) }, this.error, {
          "address": this.connectedTo,
        });
      }, {
          "address": this.connectedTo,
          "characteristic": "ABCD",
          "service": "0001",
        });
      this.connectedSubject.next(null);
      this.connectionVerified = false;


    }
  }



  getFoundServers(): Server[] {
    return this.servers.getDevices();
  }



}


export class Server {
  constructor(public name: string, public uid: number) { }
}

class ServerHandler {
  servers: Server[];
  constructor() {
    console.log("new serverhandler");
    this.servers = [];
  }

  hasDevice(id): boolean {
    let tmp: Server[] = this.servers.filter(server => {
      if (server.uid == id) {
        return true;
      } else {
        return false;
      }
    });
    return tmp.length > 0;
  }

  addDevice(name: string, uid: number): void {
    console.log("add device");
    this.servers.push(new Server(name, uid));
  }

  getDevices(): Server[] {
    return this.servers;
  }
}
