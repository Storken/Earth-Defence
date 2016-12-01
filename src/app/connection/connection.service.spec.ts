// import {Observable}     from 'rxjs/Observable';
// import {Subject}  from 'rxjs/Subject';
/*import {BluetoothService} from './bluetoothle.service';
import {addProviders, expect, beforeEach, inject} from '@angular/core/testing';
import {Server} from './server.service'
import {Client} from './client.service'

declare var bluetoothle;

describe('Check if game-server', () => {
  beforeEach(() => {
    addProviders([BluetoothService, Server, Client]);
});

  it('can check for valid games', inject([BluetoothService], (bluetooth: BluetoothService) => {
    let servers = [];
    servers.push({
      "status":"scanResult",
      "advertisement":{"solicitedServiceUuids":[],
      "overflowServiceUuids":[],
      "localName":"Game!!",
      "isConnectable":true,"serviceData":{},
      "serviceUuids":["1234"]},"rssi":-46,"name":"Game!!",
      "address":"B3B737A0-639C-7768-5EA9-D47207B33AC1"
    });
    servers.push({
      "status":"scanResult",
      "advertisement":{"solicitedServiceUuids":[],
      "overflowServiceUuids":[],
      "localName":"Game!!",
      "isConnectable":true,"serviceData":{}},
      "rssi":-46,"name":"Game!!",
      "address":"B3B737A0-639C-7768-5EA9-D47207B33AC1"
    });
    servers.push({
      "status":"scanResult",
      "advertisement":{"solicitedServiceUuids":[],
      "overflowServiceUuids":[],
      "localName":"Game!!",
      "isConnectable":true,"serviceData":{},
      "serviceUuids":["124"]},"rssi":-46,"name":"Game!!",
      "address":"B3B737A0-639C-7768-5EA9-D47207B33AC1"
    });
    servers.push({
      "status":"scanResult",
      "advertisement":{"solicitedServiceUuids":[],
      "overflowServiceUuids":[],
      "localName":"Game!!",
      "isConnectable":true,"serviceData":{},
      "serviceUuids":["qefwrebt","1234", "1234"]},"rssi":-46,"name":"Game!!",
      "address":"B3B737A0-639C-7768-5EA9-D47207B33AC1"
    });
    //expect("dog").toEqual('Super Cat');
    expect(bluetooth.isGameServer(servers[0])).toBeTruthy();
    expect(bluetooth.isGameServer(servers[1])).toBeFalsy();
    expect(bluetooth.isGameServer(servers[2])).toBeTruthy();
    expect(bluetooth.isGameServer(servers[3])).toBeTruthy();
    //console.log(InitGameComponent);
  }));
});
*/
