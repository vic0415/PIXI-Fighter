function gameplayScene() {
    let Application = PIXI.Application,
        Container = PIXI.Container,
        loader = PIXI.loader,
        resources = PIXI.loader.resources,
        Graphics = PIXI.Graphics,
        TextureCache = PIXI.utils.TextureCache,
        Sprite = PIXI.Sprite,
        Text = PIXI.Text,
        TextStyle = PIXI.TextStyle;

    console.log(window);

    const GameWidth = 900, GameHeight = 1600;
    //512
    let app = new Application({
        width: window.innerWidth,
        height: window.innerHeight,
        antialiasing: true,
        transparent: false,
        resolution: 1
    }
    );

    app.renderer.autoResize = true;
    window.onresize = function () {
        console.log(window.innerWidth);
        console.log(window.innerHeight);

        console.log(window);
        app.renderer.resize(window.innerWidth, window.innerHeight);
        uiCtn.position.set(window.innerWidth / 2, window.innerHeight / 2);
        uiCtn.scale.set(window.innerHeight / GameHeight, window.innerHeight / GameHeight);
        gameCtn.position.set(window.innerWidth / 2, window.innerHeight / 2);

        gameCtn.scale.set(window.innerHeight / GameHeight, window.innerHeight / GameHeight);

    }

    const gameLoopUpdate = new EventObserver();
    let collisions = [];

    loader
        .add("images/tileset.json")
        .load(setup);

    let gameCtn,
        uiCtn,
        player = {},
        id,
        meteorTimer = 0,
        meteorInterval = 60,
        score = 0,
        scoreText,
        gameOverText,
        playButton,
        quitButton,
        helpText1,
        helpText2,
        meteors = [],
        beams = [];
    document.body.appendChild(app.view);

    const isMobile = Boolean(navigator.userAgent.match(/Android|iPhone|iPad|iPod/i));
    console.log("isMobile " + isMobile);

    function setup() {

        gameCtn = new Container();
        gameCtn.position.set(window.innerWidth / 2, window.innerHeight / 2);
        gameCtn.scale.set(window.innerHeight / GameHeight, window.innerHeight / GameHeight);
        app.stage.addChild(gameCtn);

        uiCtn = new Container();
        uiCtn.position.set(window.innerWidth / 2, window.innerHeight / 2);
        uiCtn.scale.set(window.innerHeight / GameHeight, window.innerHeight / GameHeight);
        app.stage.addChild(uiCtn);

        id = resources["images/tileset.json"].textures;

        let spaceBg = new Sprite(id["bg5.jpg"]);
        //spaceBg.scale.set(2, 2);
        spaceBg.width = GameWidth;
        spaceBg.height = GameHeight;
        spaceBg.position.set(-spaceBg.width / 2, -spaceBg.height / 2);

        // enable the bunny to be interactive... this will allow it to respond to mouse and touch events
        spaceBg.interactive = true;

        gameCtn.addChild(spaceBg);

        playButton = new Sprite(id["Play.png"]);
        playButton.scale.set(2, 2);
        playButton.position.set(-playButton.width / 2, -playButton.height / 2);
        playButton.interactive = true;
        playButton.buttonMode = true;
        playButton.on('pointerdown', onPlayButtonClick);
        uiCtn.addChild(playButton);

        quitButton = new Sprite(id["Quit.png"]);
        quitButton.scale.set(2, 2);
        quitButton.position.set(-playButton.width / 2, -playButton.height / 2);
        quitButton.interactive = true;
        quitButton.buttonMode = true;
        quitButton.on('pointerdown', quitGame);
        quitButton.visible = false
        uiCtn.addChild(quitButton);

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

        helpText1 = new Text("發射光束 攻擊隕石 獲取分數", textStyle);
        helpText1.anchor.set(0.5);
        helpText1.position.set(0, 200);
        helpText1.visible = true;
        uiCtn.addChild(helpText1);

        if (isMobile == true) {
            helpText2 = new Text("滑動螢幕：移動戰機 點擊：發射光束", textStyle);
        } else {
            helpText2 = new Text("←:左移 →：右移 空白鍵：發射光束", textStyle);
        }
        helpText2.anchor.set(0.5);
        helpText2.position.set(0, 400);
        helpText2.visible = true;
        uiCtn.addChild(helpText2);

        gameOverText = new Text("", textStyle);
        gameOverText.anchor.set(0.5);
        gameOverText.position.set(50, 300);
        gameOverText.visible = false;
        uiCtn.addChild(gameOverText);

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

        scoreText = new Text("0", scoreStyle);
        scoreText.anchor.set(0.5);
        scoreText.position.set(GameWidth / 2 - scoreText.width / 2, -GameHeight / 2 + scoreText.height / 2);
        scoreText.visible = false;
        uiCtn.addChild(scoreText);

        if (isMobile == true) {
            spaceBg
                .on('pointerdown', onDragStart)
                .on('pointerup', onDragEnd)
                .on('pointerupoutside', onDragEnd)
                .on('pointermove', onDragMove);
        } else {
            setKeyboard();
        }

        state = ready;
        app.ticker.add(delta => gameLoop(delta));
        //createMeteor();

    }

    function gameLoop(delta) {
        state(delta);
    }

    function ready(delta) {
    }

    function play(delta) {

        meteorTimer += delta;

        if (meteorTimer > meteorInterval) {
            createMeteor();
            meteorTimer = 0;
        }

        scoreText.text = score.toString();

        for (let i = 0; i < collisions.length; i++) {
            for (let j = i + 1; j < collisions.length; j++) {

                if (collisions[i] === undefined || collisions[j] === undefined) {

                    console.log("fff");
                }

                if (hitTestRectangle(collisions[i].sprite, collisions[j].sprite)) {
                    if (collisions[i].type === "meteor") {

                        if (collisions[j].type === "player") {
                            player.destroy();
                        } else if (collisions[j].type === "beam") {
                            score++;
                            collisions[i].destroy();
                        }

                    } else if (collisions[j].type === "meteor") {

                        if (collisions[i].type === "player") {

                            player.destroy();
                            endGame();
                        } else if (collisions[i].type === "beam") {
                            score++;
                            collisions[j].destroy();
                        }
                    }
                } else {

                }
            }
        }
        gameLoopUpdate.broadcast(delta);
    }

    function gameOver(delta) {

    }

    function onPlayButtonClick() {
        startGame();
    }

    function startGame() {
        playButton.visible = false;
        helpText1.visible = false;
        helpText1.visible = false;
        helpText1.visible = false;
        helpText2.visible = false;
        scoreText.visible = true;

        player.sprite = new Sprite(id["10B.png"]);
        player.type = "player";
        player.sprite.anchor.set(0.5);
        player.vx = 0;
        player.sprite.position.x = 0;
        player.sprite.position.y = GameHeight / 2 - player.sprite.height / 2;

        collisions.push(player);
        player.update = function (delta) {
            player.sprite.position.x += player.vx;

            containCenterXandY(player.sprite, { x: -GameWidth / 2, y: GameHeight / 2 - player.sprite.height, width: GameWidth / 2, height: GameHeight / 2 });
        }
        gameLoopUpdate.subscribe(player.update, player);

        player.destroy = function () {
            gameCtn.removeChild(player.sprite);
            collisions = collisions.filter((item) => {
                if (item !== player)
                    return true;
                else
                    return false;
            });
            gameLoopUpdate.unsubscribe(player.update, player);
            player.sprite = null;
        }

        gameCtn.addChild(player.sprite);

        state = play;
    }

    function endGame() {
        quitButton.visible = true;
        gameOverText.text = "遊戲結束 你的分數是: " + score;

        gameOverText.visible = true;
        state = gameOver;
    }

    function quitGame() {
        collisions.length = 0;
        gameLoopUpdate.clear();
        playButton.visible = true;
        helpText1.visible = true;
        helpText2.visible = true;
        gameOverText.visible = false;
        score = 0;
        scoreText.visible = false;
        quitButton.visible = false;

        for (let i = beams.length - 1; i >= 0; i--) {
            beams[i].destroy();
        }
        for (let i = meteors.length - 1; i >= 0; i--) {
            meteors[i].destroy();
        }

        state = ready;
    }

    function createMeteor(px, py) {
        new Meteor(px, py);

    }

    function setKeyboard() {
        //Capture the keyboard arrow keys
        let left = keyboard(37),
            right = keyboard(39),
            space = keyboard(32)

        left.press = function () {

            if (state === play) {
                player.vx = -5;
            }
        };

        left.release = function () {

            if (state === play) {
                if (!right.isDown) {
                    player.vx = 0;
                }
            }
        };

        right.press = function () {
            if (state === play) {
                player.vx = 5;
            }
        };

        right.release = function () {
            if (state === play) {
                if (!left.isDown) {
                    player.vx = 0;
                }
            }
        };

        space.press = function () {
            if (state === play) {
                new Beam(player.sprite.position.x, player.sprite.position.y, player.sprite.width, player.sprite.height);
            }

        };
    }

    class Beam {
        constructor(playerX, playerY, playerWidth, playerHeight) {
            this.sprite = new Sprite(id["laserGreen.png"]);
            this.type = "beam"
            this.sprite.anchor.set(0.5);
            this.sprite.width = 18;
            this.sprite.height = 64;
            this.sprite.position.x = playerX;
            this.sprite.position.y = playerY - playerHeight / 2 - this.sprite.height / 2;
            this.vy = -8;
            collisions.push(this);
            gameLoopUpdate.subscribe(this.update, this);
            gameCtn.addChild(this.sprite);
            beams.push(this);
        }

        update(delta) {
            this.sprite.y += this.vy;
            if (this.sprite.position.y < -(this.sprite.height) - GameHeight / 2) {
                this.destroy();
            }
        }

        destroy() {
            gameCtn.removeChild(this.sprite);
            gameLoopUpdate.unsubscribe(this.update, this);
            collisions = collisions.filter((item) => {
                if (item !== this)
                    return true;
                else
                    return false;
            });
            beams = beams.filter((item) => {
                if (item !== this)
                    return true;
                else
                    return false;
            });
            this.sprite = null;
        }

    }

    class Meteor {
        constructor() {
            this.sprite = new Sprite(id["meteorSmall.png"]);
            this.type = "meteor"
            this.vy = 3;
            this.sprite.anchor.set(0.5);
            this.sprite.width = 128;
            this.sprite.height = 128;
            this.sprite.rotation = randomInt(0, 6.28);
            let x = randomInt(-GameWidth / 2 + this.sprite.width / 2, GameWidth / 2 - this.sprite.width / 2);
            this.sprite.position.x = x;
            this.sprite.position.y = -GameHeight / 2 - this.sprite.height;
            collisions.push(this);
            gameLoopUpdate.subscribe(this.update, this);
            gameCtn.addChild(this.sprite);
            meteors.push(this);

        }

        update(delta) {
            this.sprite.position.y += this.vy;
            if (this.sprite.position.y > GameHeight / 2) {
                this.destroy();
            }
        }

        destroy() {
            gameCtn.removeChild(this.sprite);
            gameLoopUpdate.unsubscribe(this.update, this);
            collisions = collisions.filter((item) => {
                if (item !== this)
                    return true;
                else
                    return false;
            });
            meteors = meteors.filter((item) => {
                if (item !== this)
                    return true;
                else
                    return false;
            });
            this.sprite = null;
        }
    }


    function onDragStart(event) {
        if (state !== play) return;

        new Beam(player.sprite.position.x, player.sprite.position.y, player.sprite.width, player.sprite.height);
        // store a reference to the data
        // the reason for this is because of multitouch
        // we want to track the movement of this particular touch
        this.data = event.data;
        this.dragging = true;

        this.lastX = this.data.getLocalPosition(this.parent).x;

    }

    function onDragEnd() {
        if (state !== play) return;
        this.dragging = false;
        // set the interaction data to null
        this.data = null;
        this.lastX = 0;

    }

    function onDragMove() {
        if (state !== play) return;

        if (this.dragging) {


            var newPosition = this.data.getLocalPosition(this.parent);
            player.sprite.x += (newPosition.x - this.lastX);
            console.log("last " + this.lastX + " new" + newPosition.x + " move" + (newPosition.x - this.lastX) + " playerX" + player.sprite.x);

            this.lastX = newPosition.x;
            containCenterXandY(player.sprite, { x: -GameWidth / 2, y: GameHeight / 2 - player.sprite.height, width: GameWidth / 2, height: GameHeight / 2 });
        }
    }

}











