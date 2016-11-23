import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController } from 'ionic-angular';

/*
  Generated class for the Game page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/

@Component({
  selector: 'page-game',
  templateUrl: 'game.html'
})
export class GamePage {
    // get the element with the #gameCanvas on it
    @ViewChild("gameCanvas") gameCanvas: ElementRef;
    private x: number[] = [];
    private y: number[] = [];
    private s: number[] = []

    private device_width: number;
    private device_height: number;


  constructor(
    public navCtrl: NavController
  ) {}

  ionViewDidLoad() {
    console.log('Hello GamePage Page');
    this.prepGame();
    this.tick();
  }

  prepGame() {

    this.gameCanvas.nativeElement.width = window.innerWidth;
    this.gameCanvas.nativeElement.height = window.innerHeight-5;
    this.device_width = window.innerWidth;
    this.device_height = window.innerHeight;

    let ctx = this.gameCanvas.nativeElement.getContext("2d");
    // happy drawing from here on
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, this.device_width, this.device_height);

    for(var i = 0; i < 20; i++) {
      this.x[i] = this.randomX();
      this.y[i] = this.randomX();
      this.s[i] = Math.floor(Math.random() * 9 + 1);
    }
  }

  tick() {
    requestAnimationFrame(()=> {
      this.tick()
    });

    let ctx = this.gameCanvas.nativeElement.getContext("2d");
    ctx.clearRect(0, 0, this.device_width, this.device_height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, this.device_width, this.device_height);

    for (let index in this.x) {
      ctx.fillStyle = 'white';
      ctx.fillRect(this.x[index], this.y[index], 5, 5);

      this.y[index] += this.s[index];
      if(this.y[index] > this.device_height) {
        this.y[index] = 0;
        this.x[index] = this.randomX();
        this.s[index] = Math.floor(Math.random() * 9 + 1);
      }
    }
  }

  private randomX(): number {
    return Math.floor(Math.random() * this.device_width);
  }
}
