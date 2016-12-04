const IMG_URL = 'images/sprites/';

export class SpaceshipSprite {
    private sprite : Sprite;

    public render(ctx: CanvasRenderingContext2D, x: number, y: number) {
        this.sprite.render(ctx, x, y);
    }

    constructor(player: number) {
      switch (player) {
        case 0:
          this.sprite = new Sprite(IMG_URL + 'spaceship1.png', 120, 115)
          break;
        case 1:
          this.sprite = new Sprite(IMG_URL + 'spaceship2.png', 120, 115)
          break
      }
    }

}

export class UfoSprite {
    private sprite = new Sprite(IMG_URL + 'ufo1.png', 50, 50);
    public static whichUfo: number = 0;

    constructor() {

    }

    public render(ctx: CanvasRenderingContext2D, x: number, y: number) {
        this.sprite.render(ctx, x, y);
    }
}

class Sprite {

    private image: HTMLImageElement;
    private ticks = 0;
    private ticksPerImage = 0;
    private ticksThisImage = 0;
    public noDraw: boolean;

    constructor(private imgSrc: string, ticksPerImage?: number,
        private width?: number, private height?: number) {
        this.image = new Image();
        this.image.src = imgSrc;
        if (ticksPerImage) {
            this.ticksPerImage = ticksPerImage;
        }
        this.noDraw = false;
    }
    renderWithRotation(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) {
        ctx.translate(x, y);
        ctx.rotate(angle);
        this.render(ctx, 0, 0);
        ctx.rotate(-angle);
        ctx.translate(-x, -y);

    }

    render(ctx: CanvasRenderingContext2D, x: number, y: number) {
      if(!this.noDraw){
        ctx.drawImage(this.image, x, y);
      }
      /*
        let width = this.width ? this.width : IMG_WIDTH;
        let height = this.height ? this.height : IMG_HEIGHT;
        let ticks = this.ticks;
        let sx = ticks * width;
        let sy = ticks * height;
        let sh = height;
        let sw = width;
        ctx.drawImage(this.image, sx, sy, sw, sh, x - width / 2, y - height / 2, width, height);
        if (this.ticksPerImage) {
            this.ticksThisImage++;
            if (this.ticksThisImage === this.ticksPerImage) {
                this.ticks++;
                this.ticksThisImage = 0;
            }
        } else {
            this.ticks++;
        }*/
    }


}
