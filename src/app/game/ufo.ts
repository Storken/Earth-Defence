import { UfoSprite } from './sprite';
import { ROUND_RED_WIDTH, ROUND_RED_HEIGHT, ROUND_RED } from '../Util/constants';

export interface Ufo {
  render(ctx: CanvasRenderingContext2D);
  width : number;
  height : number;
  xPosition : number;
  yPosition : number;
}

export class RoundRedUfo implements Ufo{
  private sprite: UfoSprite = new UfoSprite(ROUND_RED);
  public width = ROUND_RED_WIDTH;
  public height = ROUND_RED_HEIGHT;
  public xPosition : number;
  public yPosition : number;

  constructor( x: number, y: number){
      this.xPosition = x;
      this.yPosition = y;
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
