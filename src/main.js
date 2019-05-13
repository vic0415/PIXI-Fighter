"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var PIXI = __importStar(require("pixi.js"));
var tools_1 = require("./tools");
var help_1 = require("./help");
var help_2 = require("./help");
var help_3 = require("./help");
var help_4 = require("./help");
var help_5 = require("./help");
var Application = PIXI.Application;
var Container = PIXI.Container;
var Loader = PIXI.loader;
var Sprite = PIXI.Sprite;
var TextStyle = PIXI.TextStyle;
var GameWidth = 900;
var GameHeight = 1600;
var GameplayScene = /** @class */ (function () {
    function GameplayScene() {
        var _this = this;
        this.gameCtn = new Container();
        this.uiCtn = new Container();
        // 遊戲主迴圈 有ready, play, gameover 三種狀態
        this.state = this.ready;
        this.player = new Player();
        this.meteorTimer = 0;
        this.meteorInterval = 60;
        this.score = 0;
        this.scoreText = new PIXI.Text();
        this.gameOverText = new PIXI.Text();
        this.playButton = new PIXI.Sprite();
        this.quitButton = new PIXI.Sprite();
        this.helpText1 = new PIXI.Text();
        this.helpText2 = new PIXI.Text();
        this.meteors = [];
        this.beams = [];
        // 在遊戲進行中每個Frame都會呼叫
        this.gameLoopUpdate = new tools_1.UpdateListener();
        this.collisions = [];
        this.beamPool = new BeamPool();
        this.isMobile = Boolean(navigator.userAgent.match(/Android|iPhone|iPad|iPod/i));
        this.app = new Application({
            width: window.innerWidth,
            height: window.innerHeight,
            transparent: false,
            resolution: 1
        });
        this.setup = function () {
            _this.app.stage.interactiveChildren = false;
            _this.gameCtn.position.set(window.innerWidth / 2, window.innerHeight / 2);
            _this.gameCtn.scale.set(window.innerHeight / GameHeight, window.innerHeight / GameHeight);
            _this.app.stage.addChild(_this.gameCtn);
            _this.uiCtn.position.set(window.innerWidth / 2, window.innerHeight / 2);
            _this.uiCtn.scale.set(window.innerHeight / GameHeight, window.innerHeight / GameHeight);
            _this.app.stage.addChild(_this.uiCtn);
            var bg5 = PIXI.Texture.fromFrame("bg5.jpg");
            var spaceBg = new Sprite(bg5);
            //spaceBg.scale.set(2, 2);
            spaceBg.width = GameWidth;
            spaceBg.height = GameHeight;
            spaceBg.position.set(-spaceBg.width / 2, -spaceBg.height / 2);
            spaceBg.interactive = true;
            _this.gameCtn.addChild(spaceBg);
            _this.playButton.texture = PIXI.Texture.fromFrame("Play.png");
            _this.playButton.scale.set(2, 2);
            _this.playButton.position.set(-_this.playButton.width / 2, -_this.playButton.height / 2);
            _this.playButton.interactive = true;
            _this.playButton.buttonMode = true;
            _this.playButton.on('pointerdown', _this.onPlayButtonClick);
            _this.uiCtn.addChild(_this.playButton);
            _this.quitButton.texture = PIXI.Texture.fromFrame("Quit.png");
            _this.quitButton.scale.set(2, 2);
            _this.quitButton.position.set(-_this.playButton.width / 2, -_this.playButton.height / 2);
            _this.quitButton.interactive = true;
            _this.quitButton.buttonMode = true;
            _this.quitButton.on('pointerdown', _this.quitGame);
            _this.quitButton.visible = false;
            _this.uiCtn.addChild(_this.quitButton);
            var textStyle = new TextStyle({
                fontFamily: "Arial",
                fontSize: 54,
                fill: "white",
                stroke: '#ff3300',
                strokeThickness: 4,
                dropShadow: true,
                dropShadowColor: "#000000",
                dropShadowBlur: 4,
                dropShadowAngle: Math.PI / 6,
                dropShadowDistance: 6,
            });
            _this.helpText1.style = textStyle;
            _this.helpText1.text = "發射光束 攻擊隕石 獲取分數zzzzzzzzzzzzzz";
            _this.helpText1.anchor.set(0.5);
            _this.helpText1.position.set(0, 200);
            _this.helpText1.visible = true;
            _this.uiCtn.addChild(_this.helpText1);
            if (_this.isMobile === true) {
                _this.helpText2.text = "滑動螢幕：移動戰機 點擊：發射光束aaaaaaaaaaaaaaa";
            }
            else {
                _this.helpText2.text = "←:左移 →：右移 空白鍵：發射光束zzzzzzzzzzzzz";
            }
            _this.helpText2.style = textStyle;
            _this.helpText2.anchor.set(0.5);
            _this.helpText2.position.set(0, 400);
            _this.helpText2.visible = true;
            _this.uiCtn.addChild(_this.helpText2);
            _this.gameOverText.style = textStyle;
            _this.gameOverText.text = "";
            _this.gameOverText.anchor.set(0.5);
            _this.gameOverText.position.set(50, 300);
            _this.gameOverText.visible = false;
            _this.uiCtn.addChild(_this.gameOverText);
            var scoreStyle = new TextStyle({
                fontFamily: "Arial",
                fontSize: 96,
                fill: "white",
                stroke: '#ff3300',
                strokeThickness: 4,
                dropShadow: true,
                dropShadowColor: "#000000",
                dropShadowBlur: 4,
                dropShadowAngle: Math.PI / 6,
                dropShadowDistance: 6,
            });
            _this.scoreText.style = scoreStyle;
            _this.scoreText.text = "0";
            _this.scoreText.anchor.set(0.5);
            _this.scoreText.position.set(GameWidth / 2 - _this.scoreText.width / 2, -GameHeight / 2 + _this.scoreText.height / 2);
            _this.scoreText.visible = false;
            _this.uiCtn.addChild(_this.scoreText);
            if (_this.isMobile === true) {
                /*
                spaceBg
                    .on('pointerdown', onDragStart)
                    .on('pointerup', onDragEnd)
                    .on('pointerupoutside', onDragEnd)
                    .on('pointermove', onDragMove);
                    */
            }
            else {
                _this.setKeyboard();
            }
            _this.beamPool.init();
            _this.state = _this.ready;
            _this.app.ticker.add(function (delta) { return _this.gameLoop(delta); });
        };
        this.gameLoop = function (delta) {
            _this.state(delta);
        };
        this.onPlayButtonClick = function () {
            _this.startGame();
        };
        this.quitGame = function () {
            _this.collisions.length = 0;
            _this.gameLoopUpdate.clear();
            _this.playButton.visible = true;
            _this.helpText1.visible = true;
            _this.helpText2.visible = true;
            _this.gameOverText.visible = false;
            _this.score = 0;
            _this.scoreText.visible = false;
            _this.quitButton.visible = false;
            for (var i = _this.beams.length - 1; i >= 0; i--) {
                _this.beams[i].destroy();
            }
            for (var i = _this.meteors.length - 1; i >= 0; i--) {
                _this.meteors[i].destroy();
            }
            _this.state = _this.ready;
        };
    }
    Object.defineProperty(GameplayScene, "Instance", {
        get: function () {
            return this._instance || (this._instance = new this());
        },
        enumerable: true,
        configurable: true
    });
    GameplayScene.prototype.init = function () {
        var _this = this;
        this.app.renderer.autoResize = true;
        // 做螢幕自適應
        window.onresize = function () {
            _this.app.renderer.resize(window.innerWidth, window.innerHeight);
            _this.uiCtn.position.set(window.innerWidth / 2, window.innerHeight / 2);
            _this.uiCtn.scale.set(window.innerHeight / GameHeight, window.innerHeight / GameHeight);
            _this.gameCtn.position.set(window.innerWidth / 2, window.innerHeight / 2);
            _this.gameCtn.scale.set(window.innerHeight / GameHeight, window.innerHeight / GameHeight);
        };
        Loader
            .add("myImages", "assets/tileset.json")
            .load(this.setup);
        document.body.appendChild(this.app.view);
    };
    GameplayScene.prototype.ready = function (delta) {
    };
    GameplayScene.prototype.play = function (delta) {
        this.meteorTimer += delta;
        if (this.meteorTimer > this.meteorInterval) {
            this.createMeteor();
            this.meteorTimer = 0;
        }
        this.scoreText.text = this.score.toString();
        for (var i = 0; i < this.collisions.length; i++) {
            for (var j = i + 1; j < this.collisions.length; j++) {
                if (this.collisions[i] === undefined || this.collisions[j] === undefined) {
                    console.log("fff");
                }
                if (help_3.Collision.hitTestRectangle(this.collisions[i].sprite, this.collisions[j].sprite)) {
                    if (this.collisions[i].type === "meteor") {
                        if (this.collisions[j].type === "player") {
                            this.player.destroy();
                        }
                        else if (this.collisions[j].type === "beam") {
                            this.score++;
                            this.collisions[i].destroy();
                        }
                    }
                    else if (this.collisions[j].type === "meteor") {
                        if (this.collisions[i].type === "player") {
                            this.player.destroy();
                            this.endGame();
                        }
                        else if (this.collisions[i].type === "beam") {
                            this.score++;
                            this.collisions[j].destroy();
                        }
                    }
                }
                else {
                }
            }
        }
        this.gameLoopUpdate.broadcast(delta / 60);
    };
    GameplayScene.prototype.gameOver = function (delta) {
    };
    GameplayScene.prototype.startGame = function () {
        this.playButton.visible = false;
        this.helpText1.visible = false;
        this.helpText1.visible = false;
        this.helpText1.visible = false;
        this.helpText2.visible = false;
        this.scoreText.visible = true;
        this.collisions.push(this.player);
        this.player.init(PIXI.Texture.fromFrame("10B.png"));
        /*
        this.player.destroy = () => {
            this.gameCtn.removeChild(this.player.sprite);
            this.collisions = this.collisions.filter((item) => {
                if (item !== this.player)
                    return true;
                else
                    return false;
            });
            this.gameLoopUpdate.unsubscribe(this.player);
        }
        */
        this.gameLoopUpdate.subscribe(this.player);
        this.gameCtn.addChild(this.player.sprite);
        //let test = new Sprite(PIXI.Texture.fromFrame("ppp.png"))
        //this.gameCtn.addChild(test);
        this.state = this.play;
    };
    GameplayScene.prototype.endGame = function () {
        this.quitButton.visible = true;
        this.gameOverText.text = "遊戲結束 你的分數是: " + this.score;
        this.gameOverText.visible = true;
        this.state = this.gameOver;
    };
    GameplayScene.prototype.createMeteor = function () {
        var meteor = new Meteor();
        /*
                meteor.destroy = () => {
                    this.gameCtn.removeChild(meteor.sprite);
                    this.gameLoopUpdate.unsubscribe(meteor);
                    this.collisions = this.collisions.filter((item: Act) => {
                        if (item !== meteor)
                            return true;
                        else
                            return false;
                    });
                    this.meteors = this.meteors.filter((item: Meteor) => {
                        if (item !== meteor)
                            return true;
                        else
                            return false;
                    });
                }
        */
        this.collisions.push(meteor);
        this.gameLoopUpdate.subscribe(meteor);
        this.gameCtn.addChild(meteor.sprite);
        this.meteors.push(meteor);
    };
    GameplayScene.prototype.setKeyboard = function () {
        var _this = this;
        //Capture the keyboard arrow keys
        var left = new help_4.Keyboard(37);
        var right = new help_4.Keyboard(39);
        var space = new help_4.Keyboard(32);
        left.press = function () {
            if (_this.state === _this.play) {
                _this.player.vx = -300;
            }
        };
        left.release = function () {
            if (_this.state === _this.play) {
                if (right.isDown) {
                    _this.player.vx = 300;
                }
                else {
                    _this.player.vx = 0;
                }
            }
        };
        right.press = function () {
            if (_this.state === _this.play) {
                _this.player.vx = 300;
            }
        };
        right.release = function () {
            if (_this.state === _this.play) {
                if (left.isDown) {
                    _this.player.vx = -300;
                }
                else {
                    _this.player.vx = -0;
                }
            }
        };
        space.press = function () {
            if (_this.state === _this.play) {
                //let beam: Beam = new Beam(this.player.sprite.position.x, this.player.sprite.position.y - this.player.sprite.height / 2);
                var beam = _this.beamPool.spawn();
                beam.onSpawn(_this.player.sprite.position.x, _this.player.sprite.position.y - _this.player.sprite.height / 2);
                _this.gameLoopUpdate.subscribe(beam);
                _this.gameCtn.addChild(beam.sprite);
                /*
                beam.destroy = () => {
                    this.gameCtn.removeChild(beam.sprite);
                    this.gameLoopUpdate.unsubscribe(beam);
                    this.collisions = this.collisions.filter((item: Act) => {
                        if (item !== beam)
                            return true;
                        else
                            return false;
                    });
                    this.beams = this.beams.filter((item: Beam) => {
                        if (item !== beam)
                            return true;
                        else
                            return false;
                    });
                }
                */
                _this.beams.push(beam);
                _this.collisions.push(beam);
            }
        };
    };
    return GameplayScene;
}());
var Act = /** @class */ (function () {
    function Act() {
        this.sprite = new Sprite();
        //之後改enum
        this.type = "";
    }
    Act.prototype.destroy = function () {
    };
    ;
    return Act;
}());
// 玩家(戰機)
var Player = /** @class */ (function (_super) {
    __extends(Player, _super);
    function Player() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = "player";
        _this.vx = 0;
        return _this;
    }
    Player.prototype.init = function (textTure) {
        this.sprite.texture = textTure;
        this.sprite.anchor.set(0.5);
        this.sprite.position.x = 0;
        this.sprite.position.y = GameHeight / 2 - this.sprite.height / 2;
        this.vx = 0;
    };
    Player.prototype.update = function (delta) {
        this.sprite.position.x += this.vx * delta;
        help_1.Contain.containWhenAnchorCenter(this.sprite, new help_2.ContainBounds(-GameWidth / 2, -GameHeight / 2, GameWidth, GameHeight));
        //containCenterXandY(player.sprite, { x: -GameWidth / 2, y: GameHeight / 2 - player.sprite.height, width: GameWidth / 2, height: GameHeight / 2 });
    };
    Player.prototype.destroy = function () {
        var _this = this;
        GameplayScene.Instance.gameCtn.removeChild(this.sprite);
        GameplayScene.Instance.collisions = GameplayScene.Instance.collisions.filter(function (item) {
            if (item !== _this)
                return true;
            else
                return false;
        });
        GameplayScene.Instance.gameLoopUpdate.unsubscribe(this);
    };
    return Player;
}(Act));
// 光束
var Beam = /** @class */ (function (_super) {
    __extends(Beam, _super);
    // Player的中間上方的點
    function Beam() {
        var _this = _super.call(this) || this;
        _this.type = "beam";
        _this.vy = 0;
        _this.sprite.texture = PIXI.Texture.fromFrame("laserGreen.png");
        _this.sprite.anchor.set(0.5);
        _this.sprite.width = 18;
        _this.sprite.height = 64;
        return _this;
        /*
        this.sprite.position.x = x;
        this.sprite.position.y = y - this.sprite.height / 2;
        this.vy = -600;
        */
    }
    Beam.prototype.onSpawn = function (x, y) {
        this.sprite.position.x = x;
        this.sprite.position.y = y - this.sprite.height / 2;
        this.vy = -600;
    };
    Beam.prototype.update = function (delta) {
        this.sprite.y += this.vy * delta;
        if (this.sprite.position.y < -(this.sprite.height) - GameHeight / 2) {
            this.destroy();
        }
    };
    Beam.prototype.destroy = function () {
        /*
        GameplayScene.Instance.gameCtn.removeChild(this.sprite);
        GameplayScene.Instance.gameLoopUpdate.unsubscribe(this);
        GameplayScene.Instance.collisions = GameplayScene.Instance.collisions.filter((item: Act) => {
            if (item !== this)
                return true;
            else
                return false;
        });
        GameplayScene.Instance.beams = GameplayScene.Instance.beams.filter((item: Beam) => {
            if (item !== this)
                return true;
            else
                return false;
        });
        */
        this.onDespawn();
    };
    Beam.prototype.onDespawn = function () {
        var _this = this;
        GameplayScene.Instance.gameCtn.removeChild(this.sprite);
        GameplayScene.Instance.gameLoopUpdate.unsubscribe(this);
        GameplayScene.Instance.collisions = GameplayScene.Instance.collisions.filter(function (item) {
            if (item !== _this)
                return true;
            else
                return false;
        });
        GameplayScene.Instance.beams = GameplayScene.Instance.beams.filter(function (item) {
            if (item !== _this)
                return true;
            else
                return false;
        });
        //
        GameplayScene.Instance.beamPool.deSpawn(this);
    };
    return Beam;
}(Act));
exports.Beam = Beam;
// 隕石
var Meteor = /** @class */ (function (_super) {
    __extends(Meteor, _super);
    function Meteor() {
        var _this = _super.call(this) || this;
        _this.type = "meteor";
        _this.vy = 0;
        _this.sprite.texture = PIXI.Texture.fromFrame("meteorSmall.png");
        _this.vy = 360;
        _this.sprite.anchor.set(0.5);
        _this.sprite.width = 128;
        _this.sprite.height = 128;
        _this.sprite.rotation = help_5.MathHelper.randomInt(0, 6.28);
        var x = help_5.MathHelper.randomInt(-GameWidth / 2 + _this.sprite.width / 2, GameWidth / 2 - _this.sprite.width / 2);
        _this.sprite.position.x = x;
        _this.sprite.position.y = -GameHeight / 2 - _this.sprite.height;
        return _this;
    }
    Meteor.prototype.update = function (delta) {
        this.sprite.position.y += this.vy * delta;
        if (this.sprite.position.y > GameHeight / 2) {
            this.destroy();
        }
    };
    Meteor.prototype.destroy = function () {
        var _this = this;
        GameplayScene.Instance.gameCtn.removeChild(this.sprite);
        GameplayScene.Instance.gameLoopUpdate.unsubscribe(this);
        GameplayScene.Instance.collisions = GameplayScene.Instance.collisions.filter(function (item) {
            if (item !== _this)
                return true;
            else
                return false;
        });
        GameplayScene.Instance.meteors = GameplayScene.Instance.meteors.filter(function (item) {
            if (item !== _this)
                return true;
            else
                return false;
        });
    };
    return Meteor;
}(Act));
var BeamPool = /** @class */ (function () {
    function BeamPool() {
        this.initLength = 5;
        this.beamArray = [];
    }
    BeamPool.prototype.init = function () {
        for (var i = 0; i < this.initLength; i++) {
            this.beamArray.push(new Beam());
        }
    };
    BeamPool.prototype.spawn = function () {
        console.log(this.beamArray.length);
        return this.beamArray.pop() || new Beam();
    };
    BeamPool.prototype.deSpawn = function (beam) {
        this.beamArray.push(beam);
        console.log(this.beamArray.length);
    };
    return BeamPool;
}());
exports.BeamPool = BeamPool;
//let gameplayScene: GameplayScene = new GameplayScene();
//gameplayScene.init();
GameplayScene.Instance.init();
