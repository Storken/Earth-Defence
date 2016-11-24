import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';
import { GameComponent } from './game/game.component';

@NgModule({
  declarations: [
    MyApp,
    GameComponent
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    GameComponent
  ],
  providers: []
})
export class AppModule {}
