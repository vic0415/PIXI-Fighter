"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* Helper functions */
var Contain = /** @class */ (function () {
    function Contain() {
    }
    Contain.containWhenAnchorCenter = function (sprite, container) {
        var collision = undefined;
        var halfWidth = sprite.width / 2;
        var halfHeight = sprite.height / 2;
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
    };
    return Contain;
}());
exports.Contain = Contain;
/* Helper functions */
var ContainBounds = /** @class */ (function () {
    function ContainBounds(minX, minY, width, height) {
        this.minX = 0;
        this.minY = 0;
        this.width = 0;
        this.height = 0;
        this.minX = minX;
        this.minY = minY;
        this.width = width;
        this.height = height;
    }
    return ContainBounds;
}());
exports.ContainBounds = ContainBounds;
var Collision = /** @class */ (function () {
    function Collision() {
    }
    Collision.hitTestRectangle = function (r1, r2) {
        //Define the variables we'll need to calculate
        var hit, combinedHalfWidths, combinedHalfHeights, vx, vy;
        var r1CenterX = r1.x;
        var r1CenterY = r1.y;
        var r2CenterX = r2.x;
        var r2CenterY = r2.y;
        var r1HalfWidth = r1.width / 2;
        var r1HalfHeight = r1.height / 2;
        var r2HalfWidth = r2.width / 2;
        var r2HalfHeight = r2.height / 2;
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
            }
            else {
                //There's no collision on the y axis
                hit = false;
            }
        }
        else {
            //There's no collision on the x axis
            hit = false;
        }
        //`hit` will be either `true` or `false`
        return hit;
    };
    return Collision;
}());
exports.Collision = Collision;
//The `keyboard` helper function
var Keyboard = /** @class */ (function () {
    function Keyboard(keyCode, pressCallback, releaseCallback) {
        var _this = this;
        this.code = 0;
        this.isDown = false;
        this.isUp = true;
        this.press = function () { };
        this.release = function () { };
        //The `downHandler`
        this.downHandler = function (event) {
            if (event.keyCode === _this.code) {
                if (_this.isUp && _this.press) {
                    _this.press();
                }
                _this.isDown = true;
                _this.isUp = false;
            }
            event.preventDefault();
        };
        //The `upHandler`
        this.upHandler = function (event) {
            if (event.keyCode === _this.code) {
                if (_this.isDown && _this.release) {
                    _this.release();
                }
                _this.isDown = false;
                _this.isUp = true;
            }
            event.preventDefault();
        };
        this.code = keyCode;
        if (pressCallback !== undefined) {
            this.press = pressCallback;
        }
        if (releaseCallback !== undefined) {
            this.release = releaseCallback;
        }
        //Attach event listeners
        window.addEventListener("keydown", this.downHandler.bind(this), false);
        window.addEventListener("keyup", this.upHandler.bind(this), false);
    }
    return Keyboard;
}());
exports.Keyboard = Keyboard;
var MathHelper = /** @class */ (function () {
    function MathHelper() {
    }
    MathHelper.randomInt = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    return MathHelper;
}());
exports.MathHelper = MathHelper;
