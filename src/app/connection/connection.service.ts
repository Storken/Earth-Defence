import {Observable}     from 'rxjs/Observable';


export interface ConnectionService {

  /**
  Starts a server with a given name.
 * @param name  The name of the server.
 * @returns      Observable that holds the value of wheter the server
 is started or not.
 */
  startServer(name: string, serviceUid: string): Observable<boolean>;

  /**
   * Search for nearby game-servers.
   * @returns      An Observable that holds all future servers that are
   found for the time that the client keeps searching.
   */
  searchServers(): Observable<any>;

  /**
  Checks if a server is a game-server or not.
  @returns true if the server is a game-server, otherwise false.
  */
  isGameServer(server) : boolean;

  /**
   * @param
   * @returns
   */
  getServers();

  /**
   * 
   */
  stopScan();

  /**
   * @param address  The address to connect to.
   * @param serviceUid The uID of the service to connect to.
   * @returns      An Observable that holds the value of wheter the client is
   connected or not.
   */
  connect(id: string, serviceUid: string): Observable<string>;


  /**
   *
   *
   */
  initClient();


  /**
    Sends a message to the connected server.
   * @param msg The message to send.
   */
  send(msg: any);

  /**
    Subscibes to messages from the currently connected server, if the caller is the
    server, it will still recevie the same messages as the clients.
   * @returns    An Observable that holds the value of wheter all future messages for
   as long as the connection is activ.
   */
  subscribe() : Observable<any>

  /**
  Checks if a server is a specified room not not.
  @returns true if the server is this room, otherwise false.
  */
  isThisRoom(server, room: string) : boolean;


  isHost(): boolean;

  /**
   * Disconnects from the given device. 
   * @param address The address of the device to disconnect from.
   */
  disconnect(address: string) : any;


  roomUid: string;

  clean() : any;

  getErrors(): Observable<string>;


  requestPlayerId(playerId): Observable<number>;

}
