"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/**
 * Created by davide on 16/03/2015.
 */

console.log("Binary Firewall Game || Version 0.1 || Davide Aversa 2015 (c)");

/*****************************************************************************
 GENERAL UTILITY
/*****************************************************************************/

/**
 * Convert a number into its binary representation.
 * @param num the input number.
 * @returns {String} The result binary string.
 */
function num2binary(num) {
    return num.toString(2);
}

var GameData = (function () {
    function GameData() {
        _classCallCheck(this, GameData);

        this.phaser_game = new Phaser.Game(300, 600, Phaser.AUTO, "binary-firewall", { preload: preload, create: create, render: render, update: update });
        this.playerLife = 10;
        this.enemies = [];
        this.friendly = [];
        this.lifeBar = new LifeBar(this.playerLife, this);

        // Configurations
        this.margin = 25;
        this.totalLanes = 5;
    }

    _createClass(GameData, {
        getXByLane: {
            value: function getXByLane(lane) {
                return this.margin + lane * ((300 - 2 * this.margin) / (this.totalLanes - 1));
            }
        },
        numIsOverflow: {

            /**
             * check if the binary representation is an overflow respect the maximum number of lane in the current game.
             * @param num The input number.
             * @returns {boolean}
             */

            value: function numIsOverflow(num) {
                return num > Math.pow(2, this.totalLanes) - 1;
            }
        }
    });

    return GameData;
})();

var EnemyPackage = (function () {
    function EnemyPackage(index, game, lane) {
        _classCallCheck(this, EnemyPackage);

        var halfSpriteSize = 12;
        var x = game.getXByLane(lane) - halfSpriteSize;
        var y = 200;

        this.speed = 0.2; // TODO: It should be dependant of match time! :)

        this.game = game;
        this.lane = lane;
        this.name = index.toString();
        this.mainSprite = game.packages.create(x, y, "en_nose", 0);
        this.animation = this.mainSprite.animations.add("walk");
        this.animation.play(2, true);
    }

    _createClass(EnemyPackage, {
        update: {
            value: function update() {
                this.mainSprite.y += this.speed;
                if (this.mainSprite.y >= 400) {
                    // TODO: Make this parametric!
                    this.enemyHit();
                }
            }
        },
        destroy: {
            value: function destroy() {
                this.mainSprite.destroy();
                var index = game.enemies.indexOf(this);
                if (index > -1) {
                    game.enemies.splice(index, 1);
                }
            }
        },
        enemyHit: {
            value: function enemyHit() {
                this.game.lifeBar.decreaseLife();
                console.log("ENEMY HIT: PlayerLife = " + this.game.lifeBar.lifePoints);
                this.destroy();
            }
        }
    });

    return EnemyPackage;
})();

var FriendlyPackage = (function () {
    function FriendlyPackage(index, game, lane) {
        _classCallCheck(this, FriendlyPackage);

        var halfSpriteSize = 12;
        var x = game.getXByLane(lane) - halfSpriteSize;
        var y = 200;

        this.speed = 0.2; // TODO: It should be dependant of match time! :)
        this.game = game;
        this.lane = lane;
        this.name = index.toString();
        this.mainSprite = game.packages.create(x, y, "friendly", 0);
        this.animation = this.mainSprite.animations.add("walk");
        this.animation.play(2, true);
    }

    _createClass(FriendlyPackage, {
        update: {
            value: function update() {
                this.mainSprite.y += this.speed;
            }
        }
    });

    return FriendlyPackage;
})();

var PlayerBullet = (function () {
    function PlayerBullet(index, game, lane) {
        _classCallCheck(this, PlayerBullet);

        this.size = 24;
        var x = game.getXByLane(lane);
        x = x - this.size / 2; // Center the sprite on the lane.
        var y = 400;

        this.speed = 6;
        this.name = "PlayerBullet" + String(index);
        this.game = game;
        this.mainSprite = this.game.gBullets.create(x, y, "bullet");
    }

    _createClass(PlayerBullet, {
        update: {
            value: function update() {
                this.mainSprite.y -= this.speed;
                // Handle bullets out of the screen.
                if (this.mainSprite.y < -10) {
                    this.destroyOnExit();
                }
            }
        },
        destroyOnExit: {
            value: function destroyOnExit() {
                this.mainSprite.destroy();
                var index = game.bullets.indexOf(this);
                if (index > -1) {
                    game.bullets.splice(index, 1);
                } else {
                    console.log("BAD!");
                }
            }
        },
        render: {
            value: function render() {}
        }
    });

    return PlayerBullet;
})();

var LifeBar = (function () {
    function LifeBar(maxLife, game, deathCallback) {
        _classCallCheck(this, LifeBar);

        this.maxLife = maxLife;
        this.lifePoints = maxLife;
        this.game = game;
        this.deathCallback = deathCallback;
        this.initialized = false;
    }

    _createClass(LifeBar, {
        init: {
            value: function init() {
                if (!this.initialized) {
                    this.lifeSpriteElements = [];
                    for (var i = 0; i < this.lifePoints; i++) {
                        this.lifeSpriteElements.push(this.game.uiElements.create((24 + 5) * i, 0, "hearth"));
                    }
                }
            }
        },
        decreaseLife: {
            value: function decreaseLife() {
                this.lifePoints = Math.max(0, this.lifePoints - 1);
                this.lifeSpriteElements[this.lifePoints].visible = false;
                if (this.lifePoints <= 0) {
                    this.deathCallback();
                    return;
                }
            }
        },
        increaseLife: {
            value: function increaseLife() {
                this.lifePoints = Math.min(this.maxLife, this.lifePoints + 1);
                this.lifeSpriteElements[this.lifePoints - 1].visible = true;
            }
        },
        drawUI: {
            value: function drawUI() {
                this.mainSprite = this.game.uiElements.create(0, 0, "hearth");
            }
        }
    });

    return LifeBar;
})();

/**
 * Spawn a wave of enemy/friends.
 */
function spawn() {
    /**
     * Generate a random array of size "size" with random elements picked in the value array.
     * @param values
     * @param size
     */
    var randomArray = function randomArray(values, size) {
        var result = [];
        for (var i = 0; i < size; i++) {
            result.push(values[Math.floor(Math.random() * values.length)]);
        }
        return result;
    };
    var pattern = randomArray([0, 1, 2], 5);
    for (var i = 0; i < pattern.length; i++) {
        switch (pattern[i]) {
            case 1:
                game.enemies.push(new EnemyPackage(1, game, i));
                break;
            case 2:
                game.enemies.push(new FriendlyPackage(1, game, i));
                break;
        }
    }
}

var game = new GameData();
game.numberBuffer = "00";
game.numberBufferIndex = 0;
game.bufferSize = 2;

/**
 * Add the current number to the input buffer.
 * @param num A 1-digit number.
 */
function numKeyPressed(num) {
    if (num < 0 || num >= 10) {
        return;
    } // Nothing to do. TODO: Explicit error.
    var index = game.numberBufferIndex;
    game.numberBuffer = game.numberBuffer.substr(0, index) + num + game.numberBuffer.substr(index + 1);
    game.numberBufferIndex = game.numberBufferIndex + 1 >= 2 ? 0 : game.numberBufferIndex + 1;
    console.log("DEBUG: " + game.numberBuffer);
}

/**
 * Preforms the shoot action.
 */
function shoot() {
    var num = parseInt(game.numberBuffer, 10);
    if (game.numIsOverflow(num)) {
        console.log("Overflow!");
    } else {
        var stringCode = num2binary(num);
        for (var i = 0; i < stringCode.length; i++) {
            if (stringCode[i] === "1") {
                game.bullets.push(new PlayerBullet(1, game, i));
            }
        }
    }
    game.numberBuffer = "00";
    game.numberBufferIndex = 0;
}

function inizializeInput() {
    var pgame = game.phaser_game;
    // Setup Numeric Input
    // TODO: What does that "this" mean?
    pgame.input.keyboard.addKey(Phaser.Keyboard.ONE).onDown.add(function () {
        return numKeyPressed(1);
    }, this);
    pgame.input.keyboard.addKey(Phaser.Keyboard.TWO).onDown.add(function () {
        return numKeyPressed(2);
    }, this);
    pgame.input.keyboard.addKey(Phaser.Keyboard.THREE).onDown.add(function () {
        return numKeyPressed(3);
    }, this);
    pgame.input.keyboard.addKey(Phaser.Keyboard.FOUR).onDown.add(function () {
        return numKeyPressed(4);
    }, this);
    pgame.input.keyboard.addKey(Phaser.Keyboard.FIVE).onDown.add(function () {
        return numKeyPressed(5);
    }, this);
    pgame.input.keyboard.addKey(Phaser.Keyboard.SIX).onDown.add(function () {
        return numKeyPressed(6);
    }, this);
    pgame.input.keyboard.addKey(Phaser.Keyboard.SEVEN).onDown.add(function () {
        return numKeyPressed(7);
    }, this);
    pgame.input.keyboard.addKey(Phaser.Keyboard.EIGHT).onDown.add(function () {
        return numKeyPressed(8);
    }, this);
    pgame.input.keyboard.addKey(Phaser.Keyboard.NINE).onDown.add(function () {
        return numKeyPressed(9);
    }, this);
    pgame.input.keyboard.addKey(Phaser.Keyboard.ZERO).onDown.add(function () {
        return numKeyPressed(0);
    }, this);

    // Setup Shoot Input
    pgame.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(shoot, this);
}

function preload() {
    game.phaser_game.load.spritesheet("numbers", "assets/font_number_sprite.png", 45, 45);
    game.phaser_game.load.spritesheet("en_nose", "assets/enemy_nose24x30.png", 24, 30);
    game.phaser_game.load.spritesheet("friendly", "assets/friendly_thing24x30.png", 24, 30);
    game.phaser_game.load.image("bullet", "assets/bullet24x24.png");
    game.phaser_game.load.image("hearth", "assets/hearth24x24.png");
}

function create() {
    var pgame = game.phaser_game;
    pgame.renderer.renderSession.roundPixels = true;

    // Setup Group for Enemies/Friendly Packages
    game.packages = game.phaser_game.add.group();
    game.packages.enableBody = true;
    game.packages.physicsBodyType = Phaser.Physics.ARCADE;

    // Setup Group for Bullets
    game.gBullets = game.phaser_game.add.group();
    game.gBullets.enableBody = true;
    game.gBullets.physicsBodyType = Phaser.Physics.ARCADE;

    game.uiElements = game.phaser_game.add.group();

    game.enemies = [];
    game.enemies.push(new EnemyPackage(1, game, 0));
    game.enemies.push(new EnemyPackage(2, game, 1));
    game.enemies.push(new FriendlyPackage(2, game, 2));
    game.enemies.push(new EnemyPackage(2, game, 3));

    game.bullets = [];

    game.textGUICode = pgame.add.text(pgame.world.centerX, 550, game.numberBuffer, { font: "65px Arial", fill: "#ffffff", align: "center" });
    game.textGUICode.anchor.set(0.5);

    // Draw Line
    var graphics = game.phaser_game.add.graphics(0, 0);
    graphics.lineStyle(8, 3407616);
    graphics.moveTo(0, 500);
    graphics.lineTo(300, 500);

    inizializeInput();
    game.lifeBar.init();

    pgame.time.events.loop(Phaser.Timer.SECOND * 3, spawn, this);
}

function render() {
    game.textGUICode.text = game.numberBuffer;
    game.bullets.forEach(function (x) {
        return x.render();
    });
}

function collisionHandler(bullet, pack) {
    bullet.kill();
    pack.kill();
}

function update() {
    game.bullets.forEach(function (x) {
        return x.update();
    });
    game.enemies.forEach(function (x) {
        return x.update();
    });

    // Check Collisions Between Bullets and Packages
    game.phaser_game.physics.arcade.overlap(game.gBullets, game.packages, collisionHandler, null, this);
}
/* jshint latedef: true */
//# sourceMappingURL=binary_firewall.js.map