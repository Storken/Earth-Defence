import {Component, ViewChild} from '@angular/core';
import {Platform, NavController} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {log} from './Util/Log.service';
import {ErrorService} from './Util/error.service';
import {InitGameComponent} from './init-game/init-game.component';
import {GameComponent} from './game/game.component';

@Component({
  template: `<ion-nav [root]="rootPage" swipeBackEnabled="false"></ion-nav>`
})
export class MyApp {
  rootPage: any = InitGameComponent;

  constructor(platform: Platform) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
    });
  }
}
