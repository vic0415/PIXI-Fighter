import * as PIXI from "pixi.js";

import { UpdateListener } from "./tools";
import { IUpdateObserver } from "./tools";
import { Contain } from "./help";
import { ContainBounds } from "./help";
import { Collision } from "./help";
import { Keyboard } from "./help";
import { MathHelper } from "./help";

import Application = PIXI.Application;
import Container = PIXI.Container;
import Loader = PIXI.loader;
import Graphics = PIXI.Graphics;
import TextureCache = PIXI.utils.TextureCache;
import Sprite = PIXI.Sprite;
import Text = PIXI.Text;
import TextStyle = PIXI.TextStyle;
const GameWidth = 900;
const GameHeight = 1600;

class GameplayScene {
    private static _instance: GameplayScene;

    public static get Instance()
    {
        return this._instance || (this._instance = new this());
    }


    public gameCtn: Container = new Container();
    private uiCtn: Container = new Container();
    // 遊戲主迴圈 有ready, play, gameover 三種狀態
    private state: (delta: number) => void = this.ready;
    private player: Player = new Player();

    private meteorTimer: number = 0;
    private meteorInterval: number = 60;
    private score: number = 0;

    private scoreText: Text = new PIXI.Text();
    private gameOverText: Text = new PIXI.Text();

    private playButton: Sprite = new PIXI.Sprite();
    private quitButton: Sprite = new PIXI.Sprite();
    private helpText1: Text = new PIXI.Text();
    private helpText2: Text = new PIXI.Text();

    public meteors: Meteor[] = [];
    public beams: Beam[] = [];

    // 在遊戲進行中每個Frame都會呼叫
    public gameLoopUpdate = new UpdateListener();
    public collisions: Act[] = [];

    public beamPool: BeamPool = new BeamPool();

    private isMobile: boolean = Boolean(navigator.userAgent.match(/Android|iPhone|iPad|iPod/i));

    private app: Application = new Application({
        width: window.innerWidth,
        height: window.innerHeight,
        transparent: false,
        resolution: 1
    }
    );

    public init(): void {
        this.app.renderer.autoResize = true;

        // 做螢幕自適應
        window.onresize = () => {
            this.app.renderer.resize(window.innerWidth, window.innerHeight);
            this.uiCtn.position.set(window.innerWidth / 2, window.innerHeight / 2);
            this.uiCtn.scale.set(window.innerHeight / GameHeight, window.innerHeight / GameHeight);
            this.gameCtn.position.set(window.innerWidth / 2, window.innerHeight / 2);
            this.gameCtn.scale.set(window.innerHeight / GameHeight, window.innerHeight / GameHeight);
        }

        Loader
            .add("myImages", "assets/tileset.json")
            .load(this.setup);

        document.body.appendChild(this.app.view);
    }

    private setup = () => {
        this.gameCtn.position.set(window.innerWidth / 2, window.innerHeight / 2);
        this.gameCtn.scale.set(window.innerHeight / GameHeight, window.innerHeight / GameHeight);
        this.app.stage.addChild(this.gameCtn);

        this.uiCtn.position.set(window.innerWidth / 2, window.innerHeight / 2);
        this.uiCtn.scale.set(window.innerHeight / GameHeight, window.innerHeight / GameHeight);
        this.app.stage.addChild(this.uiCtn);

        const bg5 = PIXI.Texture.fromFrame("bg5.jpg");

        let spaceBg = new Sprite(bg5);
        spaceBg.width = GameWidth;
        spaceBg.height = GameHeight;
        spaceBg.position.set(-spaceBg.width / 2, -spaceBg.height / 2);
        spaceBg.interactiveChildren = false;

        this.gameCtn.addChild(spaceBg);

        this.playButton.texture = PIXI.Texture.fromFrame("Play.png");
        this.playButton.scale.set(2, 2);
        this.playButton.position.set(-this.playButton.width / 2, -this.playButton.height / 2);
        this.playButton.interactive = true;
        this.playButton.buttonMode = true;
        this.playButton.on('pointerdown', this.onPlayButtonClick);
        this.uiCtn.addChild(this.playButton);

        this.quitButton.texture = PIXI.Texture.fromFrame("Quit.png");
        this.quitButton.scale.set(2, 2);
        this.quitButton.position.set(-this.playButton.width / 2, -this.playButton.height / 2);
        this.quitButton.interactive = true;
        this.quitButton.buttonMode = true;
        this.quitButton.on('pointerdown', this.quitGame);
        this.quitButton.visible = false
        this.uiCtn.addChild(this.quitButton);

        let textStyle = new TextStyle({
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

        this.helpText1.style = textStyle;
        this.helpText1.text = "發射光束 攻擊隕石 獲取分數";
        this.helpText1.anchor.set(0.5);
        this.helpText1.position.set(0, 200);
        this.helpText1.visible = true;
        this.uiCtn.addChild(this.helpText1);

        if (this.isMobile === true) {
            this.helpText2.text = "滑動螢幕：移動戰機 點擊：發射光束";
        } else {
            this.helpText2.text = "←:左移 →：右移 空白鍵：發射光束";
        }
        this.helpText2.style = textStyle;
        this.helpText2.anchor.set(0.5);
        this.helpText2.position.set(0, 400);
        this.helpText2.visible = true;
        this.uiCtn.addChild(this.helpText2);

        this.gameOverText.style = textStyle;
        this.gameOverText.text = "";
        this.gameOverText.anchor.set(0.5);
        this.gameOverText.position.set(50, 300);
        this.gameOverText.visible = false;
        this.uiCtn.addChild(this.gameOverText);

        let scoreStyle = new TextStyle({
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

        this.scoreText.style = scoreStyle;
        this.scoreText.text = "0";
        this.scoreText.anchor.set(0.5);
        this.scoreText.position.set(GameWidth / 2 - this.scoreText.width / 2, -GameHeight / 2 + this.scoreText.height / 2);
        this.scoreText.visible = false;
        this.uiCtn.addChild(this.scoreText);

        if (this.isMobile === true) {
            /*
            spaceBg
                .on('pointerdown', onDragStart)
                .on('pointerup', onDragEnd)
                .on('pointerupoutside', onDragEnd)
                .on('pointermove', onDragMove);
                */
        } else {
            this.setKeyboard();
        }

        this.beamPool.init();

        this.state = this.ready;
        this.app.ticker.add(delta => this.gameLoop(delta));
    }

    private gameLoop = (delta: number) => {
        this.state(delta);
    }

    private ready(delta: number) {

    }

    private play(delta: number) {
        this.meteorTimer += delta;

        if (this.meteorTimer > this.meteorInterval) {
            this.createMeteor();
            this.meteorTimer = 0;
        }

        this.scoreText.text = this.score.toString();

        for (let i = 0; i < this.collisions.length; i++) {
            for (let j = i + 1; j < this.collisions.length; j++) {

                if (this.collisions[i] === undefined || this.collisions[j] === undefined) {

                    console.log("collisions error");
                }

                if (Collision.hitTestRectangle(this.collisions[i].sprite, this.collisions[j].sprite)) {
                    if (this.collisions[i].type === "meteor") {

                        if (this.collisions[j].type === "player") {
                            this.player.destroy();
                        } else if (this.collisions[j].type === "beam") {
                            this.score++;
                            this.collisions[i].destroy();
                        }

                    } else if (this.collisions[j].type === "meteor") {

                        if (this.collisions[i].type === "player") {

                            this.player.destroy();
                            this.endGame();
                        } else if (this.collisions[i].type === "beam") {
                            this.score++;
                            this.collisions[j].destroy();
                        }
                    }
                } else {

                }
            }
        }

        this.gameLoopUpdate.broadcast(delta / 60);

    }

    private gameOver(delta: number) {

    }

    private onPlayButtonClick = () => {
        this.startGame();
    }

    private startGame() {
        this.playButton.visible = false;
        this.helpText1.visible = false;
        this.helpText1.visible = false;
        this.helpText1.visible = false;
        this.helpText2.visible = false;
        this.scoreText.visible = true;

        this.collisions.push(this.player);
        this.player.init(PIXI.Texture.fromFrame("10B.png"));

        this.gameLoopUpdate.subscribe(this.player);
        this.gameCtn.addChild(this.player.sprite);

        this.state = this.play;
    }

    private endGame() {
        this.quitButton.visible = true;
        this.gameOverText.text = "遊戲結束 你的分數是: " + this.score;

        this.gameOverText.visible = true;
        this.state = this.gameOver;
    }

    private quitGame = () => {
        this.collisions.length = 0;
        this.gameLoopUpdate.clear();
        this.playButton.visible = true;
        this.helpText1.visible = true;
        this.helpText2.visible = true;
        this.gameOverText.visible = false;
        this.score = 0;
        this.scoreText.visible = false;
        this.quitButton.visible = false;

        for (let i = this.beams.length - 1; i >= 0; i--) {
            this.beams[i].destroy();
        }
        for (let i = this.meteors.length - 1; i >= 0; i--) {
            this.meteors[i].destroy();
        }

        this.state = this.ready;
    }

    private createMeteor() {
        let meteor: Meteor = new Meteor();
        this.collisions.push(meteor);
        this.gameLoopUpdate.subscribe(meteor);
        this.gameCtn.addChild(meteor.sprite);
        this.meteors.push(meteor);
    }

    private setKeyboard() {
        //Capture the keyboard arrow keys
        let left = new Keyboard(37);
        let right = new Keyboard(39);
        let space = new Keyboard(32);

        left.press = () => {
            if (this.state === this.play) {
                this.player.vx = -300;
            }
        };

        left.release = () => {
            if (this.state === this.play) {
                if (right.isDown) {
                    this.player.vx = 300;
                } else {
                    this.player.vx = 0;
                }
            }
        };

        right.press = () => {
            if (this.state === this.play) {
                this.player.vx = 300;
            }
        };

        right.release = () => {
            if (this.state === this.play) {
                if (left.isDown) {
                    this.player.vx = -300;
                } else {
                    this.player.vx = -0;
                }
            }
        };

        space.press = () => {
            if (this.state === this.play) {
                let beam: Beam = this.beamPool.spawn();
                beam.onSpawn(this.player.sprite.position.x, this.player.sprite.position.y - this.player.sprite.height / 2);

                this.gameLoopUpdate.subscribe(beam);
                this.gameCtn.addChild(beam.sprite);
                this.beams.push(beam);
                this.collisions.push(beam);
            }
        };
    }
}


class Act {
    sprite: Sprite = new Sprite();
    //之後改enum
    type: String = "";

    public destroy(){

    };
    
}

// 玩家(戰機)
class Player extends Act implements IUpdateObserver {
    type: String = "player";
    vx: number = 0;

    public init(textTure: PIXI.Texture) {
        this.sprite.texture = textTure;
        this.sprite.anchor.set(0.5);
        this.sprite.position.x = 0;
        this.sprite.position.y = GameHeight / 2 - this.sprite.height / 2;
        this.vx = 0;
    }

    public update(delta: number) {
        this.sprite.position.x += this.vx * delta;

        Contain.containWhenAnchorCenter(
            this.sprite,
            new ContainBounds(-GameWidth / 2, -GameHeight / 2, GameWidth, GameHeight));
        //containCenterXandY(player.sprite, { x: -GameWidth / 2, y: GameHeight / 2 - player.sprite.height, width: GameWidth / 2, height: GameHeight / 2 });
    }

    public destroy(): void {
        GameplayScene.Instance.gameCtn.removeChild(this.sprite);
        GameplayScene.Instance.collisions = GameplayScene.Instance.collisions.filter((item) => {
            if (item !== this)
                return true;
            else
                return false;
        });
        GameplayScene.Instance.gameLoopUpdate.unsubscribe(this);
    }
}

// 光束
export class Beam extends Act implements IUpdateObserver {
    type: String = "beam";
    vy: number = 0;

    // Player的中間上方的點
    constructor() {
        super();
        this.sprite.texture = PIXI.Texture.fromFrame("laserGreen.png")
        this.sprite.anchor.set(0.5);
        this.sprite.width = 18;
        this.sprite.height = 64;
    }

    public onSpawn(x: number, y: number){
        this.sprite.position.x = x;
        this.sprite.position.y = y - this.sprite.height / 2;
        this.vy = -600;
    }

    public update(delta: number) {

        this.sprite.y += this.vy * delta;
        if (this.sprite.position.y < -(this.sprite.height) - GameHeight / 2) {
            this.destroy();
        }
    }


    destroy ():void {
       this.onDespawn();
    }

    onDespawn ():void {
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
        //
        GameplayScene.Instance.beamPool.deSpawn(this);

    }
}

// 隕石
class Meteor extends Act implements IUpdateObserver {
    type: String = "meteor";
    vy: number = 0;

    constructor() {
        super();
        this.sprite.texture = PIXI.Texture.fromFrame("meteorSmall.png")
        this.vy = 360;
        this.sprite.anchor.set(0.5);
        this.sprite.width = 128;
        this.sprite.height = 128;
        this.sprite.rotation = MathHelper.randomInt(0, 6.28);
        let x = MathHelper.randomInt(-GameWidth / 2 + this.sprite.width / 2, GameWidth / 2 - this.sprite.width / 2);
        this.sprite.position.x = x;
        this.sprite.position.y = -GameHeight / 2 - this.sprite.height;
    }

    update(delta: number) {
        this.sprite.position.y += this.vy * delta;
        if (this.sprite.position.y > GameHeight / 2) {
            this.destroy();
        }
        
    }

    destroy ():void {
        GameplayScene.Instance.gameCtn.removeChild(this.sprite);
        GameplayScene.Instance.gameLoopUpdate.unsubscribe(this);
        GameplayScene.Instance.collisions = GameplayScene.Instance.collisions.filter((item: Act) => {
            if (item !== this)
                return true;
            else
                return false;
        });
        GameplayScene.Instance.meteors = GameplayScene.Instance.meteors.filter((item: Meteor) => {
            if (item !== this)
                return true;
            else
                return false;
        });
    }
}

export class BeamPool{
    private initLength: number = 5;
    private beamArray: Beam[] = [];
  
    public init(){
        for(let i = 0; i < this.initLength; i++){
            this.beamArray.push(new Beam());
        }
    }

    public spawn(): Beam{
        console.log(this.beamArray.length);
            return this.beamArray.pop() || new Beam();
    }

    public deSpawn(beam: Beam): void{
        this.beamArray.push(beam);
        console.log(this.beamArray.length);

    }
  
  }

GameplayScene.Instance.init();