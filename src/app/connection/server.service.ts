import { Injectable } from '@angular/core';
import {log} from '../Util/Log.service';
import {Observable}     from 'rxjs/Observable';
import {Subject}  from 'rxjs/Subject';
declare var bluetoothle;

@Injectable()
export class Server {

  private valueSubject: Subject<any>;
  private value : Observable<any>;
  private _nbrSubscribed: number;

  private startedSubject: Subject<string>;
  private started : Observable<string>;

  private errorSubject: Subject<string>;
  private errorObs : Observable<string>;

  constructor() {
    this.valueSubject = new Subject<number>();
    this.startedSubject = new Subject<string>();
    console.log("sub", this.valueSubject);
    this.value = this.valueSubject.asObservable();
    this.started = this.startedSubject.asObservable();
    console.log("val", this.value);
    this.nbrSubscribed = 0;
    this.errorSubject = new Subject<string>();
    this.errorObs = this.errorSubject.asObservable();
  }

  getMessages() : Observable<any> {
    return this.value;
  }

  clean(){
    this._nbrSubscribed = 0;
    bluetoothle.stopAdvertising(status => {
        log("stopped advert", status);
        bluetoothle.removeAllServices(status => {
        log("all services removed", status);
        this.startedSubject.next(null);
      }, this.error);
    }, this.error);

  }
  getErrors(): Observable<string>{
    return this.errorObs;
  }

  get nbrSubscribed(){
    return this._nbrSubscribed;
  }

  set nbrSubscribed(nbrSubscribed){
    this._nbrSubscribed = nbrSubscribed;
  }


  start(name: string, serviceName: string) : Observable<string> {
    console.log("makePeripheral", name);
    let success = status => {
      log("Status inc server", status);
      if(status.status === "writeRequested"){
        // new message to server!
        this.handleMessage(status);
      }else if(status.status === "enabled"){
        log("peripheral!", status);
        this.addService(name, serviceName);
      }else if(status.status === "disabled"){
        this.startedSubject.next(null);
      }else if(status.status === "subscribed"){
        this.nbrSubscribed++;
        log("NBR: ", this.nbrSubscribed)
      }else if(status.status === "unsubscribed"){
        this.nbrSubscribed--;
        log("NBR: ", this.nbrSubscribed)


      }
    };
    let error = err => {console.log("err!!", err);};
    let params = {
        "request": true
      };
    bluetoothle.initializePeripheral(success, error, params);
    return this.started;
  }

  private respond(requestId, message){
    let asString = JSON.stringify(message);
    let bytes = bluetoothle.stringToBytes(asString);
    let encodedString = bluetoothle.bytesToEncodedString(bytes);
    bluetoothle.respond(status => {
      log("responded!", status);
    }, this.error, {
      "requestId": requestId,
      "value": encodedString
    });
  }

  private handleMessage (messageObj){
    log("parsing message", messageObj);
    let message = messageObj.value;
    message = bluetoothle.encodedStringToBytes(message);
    message = bluetoothle.bytesToString(message);
    log("the message:", message);
    message = JSON.parse(message);
    this.valueSubject.next(message);
  }

  private error = (status) => {
    console.log("error");
    console.log(status);
  };

  public stopAdvertising(){
    bluetoothle.stopAdvertising(status => {log("advert stopped", status);}, this.error);
  }
  public notify(msg: any, serviceUid: string, safe ?: boolean){
    console.log("The value is", msg);
    let asString = JSON.stringify(msg);
    log("after stringify", asString);

    let bytes = bluetoothle.stringToBytes(asString);
    let encodedString = bluetoothle.bytesToEncodedString(bytes);
    let params = {
      "service":serviceUid,
      "characteristic":"ABCD",
      "value": encodedString //Subscribe Hello World
    }
    let success = result => {
      console.log("notifed!");
      if(safe){
        log("safe package succes", status);
        if(result.sent === false){
          log("safe package succes but not sent!!", status);
          this.notify(msg, serviceUid, safe);
        }
      }
      console.log(result);
    };
    log("param:", params);
    bluetoothle.notify(success, this.error, params);

  }



  public notifyStart(serviceUid: string){
    this.notify(["start"], serviceUid);
  }
  addService(name: string, serviceUid: string) : void {
    let success = data => {
      console.log("added service", data);
      bluetoothle.startAdvertising(data => {console.log("advert");},
      data => {console.log("advert-error"); console.log(data);}, {
        "services":[serviceUid], //iOS
        "service":serviceUid, //Android
        "name":name,
      });
      this.startedSubject.next(serviceUid);
    }
    let error = data => {console.log("error adding service", data);}
    let params = {
      service: serviceUid,
      characteristics: [
        {
          uuid: "ABCD",
          permissions: {
            read: true,
            write: true,
            //readEncryptionRequired: true,
            //writeEncryptionRequired: true,
          },
          properties : {
            read: true,
            writeWithoutResponse: true,
            write: true,
            notify: true,
            indicate: true,
            //authenticatedSignedWrites: true,
            //notifyEncryptionRequired: true,
            //indicateEncryptionRequired: true,
          }
        }
      ]
    };
    bluetoothle.addService(success, error, params);
  }
}
