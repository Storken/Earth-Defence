import { UfoSprite } from './sprite';

export class Ufo {
  private sprite: UfoSprite = new UfoSprite();
  private count: number;

  constructor(
    public xPosition: number,
    public yPosition: number){
      this.count = 0;
    }

  render(ctx: CanvasRenderingContext2D) {
      this.sprite.render(ctx, this.xPosition, this.yPosition);
      this.nextPosition();
  }

  nextPosition() {
    this.yPosition += 5;
    this.yPosition = this.yPosition % window.screen.height;
  }

}
