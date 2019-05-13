import * as PIXI from "pixi.js";

/* Helper functions */

export class Contain {
  public static containWhenAnchorCenter(sprite: PIXI.Sprite, container: ContainBounds) {
    let collision: string | undefined = undefined;
    let halfWidth: number = sprite.width / 2;
    let halfHeight: number = sprite.height / 2;

    // Left
    if (sprite.x < container.minX + halfWidth) {
      sprite.x = container.minX + halfWidth;
      collision = "left";
    }

    // Top
    if (sprite.y < container.minY + halfHeight) {
      sprite.y = container.minY + halfHeight;
      collision = "top";
    }

    // Right
    if (sprite.x > container.minX + container.width - halfWidth) {
      sprite.x = container.minX + container.width - halfWidth;
      collision = "right";
    }

    // Bottom
    if (sprite.y > container.minY + container.height - halfHeight) {
      sprite.y = container.minY + container.height - halfHeight;
      collision = "bottom";
    }

    // Return the `collision` value
    return collision;
  }

}

/* Helper functions */
export class ContainBounds {
  public minX: number = 0;
  public minY: number = 0;
  public width: number = 0;
  public height: number = 0;

  constructor(minX: number, minY: number, width: number, height: number) {
    this.minX = minX;
    this.minY = minY;
    this.width = width;
    this.height = height;
  }
}

export class Collision {

  public static hitTestRectangle(r1: PIXI.Sprite, r2: PIXI.Sprite) {

    //Define the variables we'll need to calculate
    let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;
    let r1CenterX = r1.x;
    let r1CenterY = r1.y;
    let r2CenterX = r2.x;
    let r2CenterY = r2.y;
    let r1HalfWidth = r1.width / 2;
    let r1HalfHeight = r1.height / 2;
    let r2HalfWidth = r2.width / 2;
    let r2HalfHeight = r2.height / 2;
    //hit will determine whether there's a collision
    hit = false;

    //Calculate the distance vector between the sprites
    vx = r1CenterX - r2CenterX;
    vy = r1CenterY - r2CenterY;

    //Figure out the combined half-widths and half-heights
    combinedHalfWidths = r1HalfWidth + r2HalfWidth;
    combinedHalfHeights = r1HalfHeight + r2HalfHeight;

    //Check for a collision on the x axis
    if (Math.abs(vx) < combinedHalfWidths) {

      //A collision might be occuring. Check for a collision on the y axis
      if (Math.abs(vy) < combinedHalfHeights) {

        //There's definitely a collision happening
        hit = true;
      } else {

        //There's no collision on the y axis
        hit = false;
      }
    } else {

      //There's no collision on the x axis
      hit = false;
    }

    //`hit` will be either `true` or `false`
    return hit;

  }
}

//The `keyboard` helper function

export class Keyboard {
  private code: number = 0;
  public isDown: boolean = false;
  public isUp: boolean = true;

  constructor(keyCode: number, pressCallback?: () => void, releaseCallback?: () => void) {
    this.code = keyCode;
    if (pressCallback !== undefined) {
      this.press = pressCallback;
    }
    if (releaseCallback !== undefined) {
      this.release = releaseCallback;
    }

    //Attach event listeners
    window.addEventListener(
      "keydown", this.downHandler.bind(this), false,
    );
    window.addEventListener(
      "keyup", this.upHandler.bind(this), false,
    );
  }

  public press: () => void = () => { };
  public release: () => void = () => { };

  //The `downHandler`
  private downHandler = (event: any) => {
    if (event.keyCode === this.code) {
      if (this.isUp && this.press) {
        this.press();
      }
      this.isDown = true;
      this.isUp = false;
    }
    event.preventDefault();
  };

  //The `upHandler`
  private upHandler = (event: any) => {
    if (event.keyCode === this.code) {
      if (this.isDown && this.release) {
        this.release();
      }
      this.isDown = false;
      this.isUp = true;
    }
    event.preventDefault();
  }

}

export class MathHelper {
  public static randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}