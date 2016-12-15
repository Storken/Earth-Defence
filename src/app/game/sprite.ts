import { PURPLE_HARVEST_2, PURPLE_HARVEST_WIDTH, PURPLE_HARVEST_HEIGHT
        , HEALTHPOINT_WIDTH, HEALTHPOINT_HEIGHT, SHIP_WIDTH, SHIP_HEIGHT} from '../Util/constants';
const IMG_URL = 'images/sprites/';

export class SpaceshipSprite {
    private sprite : Sprite;
    private playerId : number;

    public render(ctx: CanvasRenderingContext2D, x: number, y: number) {
        this.sprite.render(ctx, x, y);
    }

    constructor(player: number) {
      this.playerId = player;
      switch (player) {
        case 0:
          this.sprite = new Sprite(IMG_URL + 'spaceship1.png', SHIP_WIDTH, SHIP_HEIGHT)
          break;
        case 1:
          this.sprite = new Sprite(IMG_URL + 'spaceship2.png', SHIP_WIDTH, SHIP_HEIGHT)
          break
      }
    }

}

export class UfoSprite {
    private sprite : Sprite;

    constructor(whichUfo : number) {
      switch (whichUfo) {
        case PURPLE_HARVEST_2:
          this.sprite = new Sprite(IMG_URL + 'ufo1.png'
                                    , PURPLE_HARVEST_WIDTH, PURPLE_HARVEST_HEIGHT);
          break;
      }
    }

    public render(ctx: CanvasRenderingContext2D, x: number, y: number) {
        this.sprite.render(ctx, x, y);
    }
}

export class HealthSprite {
  private sprite = new Sprite(IMG_URL + 'healthpoint.png'
                              , HEALTHPOINT_WIDTH, HEALTHPOINT_HEIGHT);

  constructor() {
  }

  public render(ctx: CanvasRenderingContext2D, x: number, y: number) {
      this.sprite.render(ctx, x, y);
  }
}


export class EarthSprite {
  private sprite = new Sprite(IMG_URL + 'earthHp.png'
                              , 50, 50);

  constructor() {
  }

  public render(ctx: CanvasRenderingContext2D, x: number, y: number) {
      this.sprite.render(ctx, x, y);
  }
}

export class MotherCannonSprite {
  private sprite = new Sprite(IMG_URL + 'mothercannon.png');
  private sprite1 = new Sprite(IMG_URL + 'mothercannon-glow50.png');
  private sprite2 = new Sprite(IMG_URL + 'mothercannon-glow75.png');
  private sprite3 = new Sprite(IMG_URL + 'mothercannon-glow100.png');
  private sprite4 = new Sprite(IMG_URL + 'mothercannon-beam.png');
  private sprite5 = new Sprite(IMG_URL + 'mothercannon-beam-2.png');
  private si = 0;
  private shield = false;

  constructor() {
  }

  public render(ctx: CanvasRenderingContext2D, x: number, y: number, i: number) {
      this.si = i;
      switch(this.si) {
        case 0:
            this.sprite.render(ctx, x, y);
            break;
        case 1:
            this.sprite1.render(ctx, x, y);
            break;
        case 2:
            this.sprite2.render(ctx, x, y);
            break;
        case 3:
            this.sprite3.render(ctx, x, y);
            break;
        case 4:
            if(!this.shield) {
                this.sprite4.render(ctx, x, y);
            } else {
                this.sprite5.render(ctx, x, y);
            }
            break;
      }
  }

  shielded(b: boolean) {
      this.shield = b;
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

    renderWithBlink(ctx: CanvasRenderingContext2D, x: number, y: number) {

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
