import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';
import { GameComponent } from './game/game.component';
import { InitGameComponent } from './init-game/init-game.component';
import { RoomComponent } from './init-game/room.component';
import { LogService } from './Util/Log.service';
import { ErrorService } from './Util/error.service';
import { BluetoothService } from './connection/bluetoothle.service';
import { Client } from './connection/client.service';
import { Server } from './connection/server.service';
import { InitGameService } from './init-game/init-game.service';
import { GameService } from './game/game.service';
import { CollisionService } from './game/collision.service';
import { NavController } from 'ionic-angular';

@NgModule({
  declarations: [
    MyApp,
    GameComponent,
    InitGameComponent,
    RoomComponent
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    GameComponent,
    InitGameComponent,
    RoomComponent
  ],
  providers: [LogService, BluetoothService, Server,
   Client, InitGameService,
   GameService, ErrorService, CollisionService]
})
export class AppModule {}
