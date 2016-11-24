import { Spaceship1Sprite } from './sprite';

export class Spaceship1 {
  private sprite: Spaceship1Sprite = new Spaceship1Sprite();
  public xPosition: number;
  public yPosition: number;
  public xShots: number[] = [];
  public yShots: number[] = [];
  public shoot: boolean;
  public shouldShootCount: number;

  constructor(xpos: number, ypos: number, private device_height: number,
        private device_width: number) {
    this.xPosition = xpos;
    this.yPosition = ypos;
    this.shoot = false;
    this.shouldShootCount = 0;
  }

  render(ctx: CanvasRenderingContext2D) {
    var removeShots = [];
    for(var i = 0; i < this.xShots.length; i++) {
      ctx.fillStyle = 'green';
      ctx.fillRect(this.xShots[i], this.yShots[i], 5, 15);
      this.yShots[i]-=10;
      if(this.yShots[i] < 15) {
        removeShots.push(i);
      }
    }
    for(let i of removeShots) {
      this.yShots.shift();
      this.xShots.shift();
    }
    this.sprite.render(ctx, this.xPosition, this.yPosition);
    this.shouldShootCount++;
    if(this.shouldShootCount > 4) {
      this.shouldShootCount = 0;
      this.xShots.push(this.xPosition+30);
      this.xShots.push(this.xPosition+85);
      this.yShots.push(this.yPosition+25);
      this.yShots.push(this.yPosition+25);
    }
  }

  moveLeft() {
    if(this.xPosition-10 > 0) {
      this.xPosition-=10;
    }
  }

  moveRight() {
    if(this.xPosition+10 < this.device_width+160) {
      this.xPosition+=10;
    }
  }
}
