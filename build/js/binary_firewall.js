/**
 * Created by davide on 16/03/2015.
 */

console.log("Binary Firewall Game || Version 0.1 || Davide Aversa 2015 (c)");

var GameData = function() {
    this.phaser_game = new Phaser.Game(300, 600, Phaser.AUTO, 'binary-firewall', { preload: preload, create: create, render: render, update: update });
    this.playerLife = 10;
    this.enemies = [];
    this.friendly = [];
};

var EnemyPackage = function(index, game, lane) {
    var halfSpriteSize = 12;
    var x = getXByLane(lane);
    x = x - halfSpriteSize; // Center the sprite on the lane.
    var y = 200;
    var speed = 0.2; // TODO: It should be dependant of match time! :)

    this.game = game;
    this.lane = lane;
    this.name = index.toString();
    this.mainSprite = game.phaser_game.add.game.add.sprite(x,y,'en_nose', 0);
    this.animation = this.mainSprite.animations.add('walk');
    this.animation.play(2, true);
    this.update = function() {
        this.mainSprite.y += speed;
        if (this.mainSprite.y >= 400) { // TODO: Make this parametric!
            this.enemyHit();
        }
    };
    this.destroy = function() {
        this.mainSprite.destroy();
        var index = game.enemies.indexOf(this);
        if (index > -1) {
            game.enemies.splice(index,1);
        }
    };
    this.enemyHit = function() {
        this.game.playerLife--;
        console.log("ENEMY HIT: PlayerLife = " + this.game.playerLife);
        this.destroy();
    };
};

var FriendlyPackage = function(index, game, lane) {
    var halfSpriteSize = 12;
    var x = getXByLane(lane);
    x = x - halfSpriteSize; // Center the sprite on the lane.
    var y = 200;
    var speed = 0.2; // TODO: It should be dependant of match time! :)

    this.game = game;
    this.lane = lane;
    this.name = index.toString();
    this.mainSprite = game.phaser_game.add.game.add.sprite(x,y,'friendly', 0);
    this.animation = this.mainSprite.animations.add('walk');
    this.animation.play(2, true);
    this.update = function() {
        this.mainSprite.y += speed;
    };
};

var PlayerBullet = function(index, game, lane) {
    var radius = 30;
    var x = getXByLane(lane);
    x = x - radius; // Center the sprite on the lane.
    var y = 400;
    var speed = 6;

    this.game = game;
    this.mainSprite = game.phaser_game.add.graphics(x, y);
    this.update = function() {
        this.mainSprite.y -= speed;
        // Handle bullets out of the screen.
        if (this.mainSprite.y < -10) {
            this.destroyOnExit();
        }
    };
    this.destroyOnExit = function() {
        this.mainSprite.destroy();
        var index = game.bullets.indexOf(this);
        if (index > -1) {
            game.bullets.splice(index,1);
        } else {
            console.log("BAD!");
        }
    };
    this.render = function() {
        this.mainSprite.beginFill(0xFF0000, 1);
        this.mainSprite.drawCircle(radius, radius, 10);
    };
};

var game = new GameData();
game.numberBuffer = "00";
game.numberBufferIndex = 0;
game.bufferSize = 2;

function getXByLane(lane) {
    var margin = 25;
    var totalLanes = 4;
    return margin + lane * ( (300 - 2*margin)/(totalLanes-1));
}

/**
 * Convert a number into its binary representation.
 * @param num the input number.
 * @returns {String} The result binary string.
 */
function num2binary(num) {
    return num.toString(2);
}

/**
 * Add the current number to the input buffer.
 * @param num A 1-digit number.
 */
function numKeyPressed(num) {
    if (num <0 || num >= 10) { return; } // Nothing to do. TODO: Explicit error.
    var index = game.numberBufferIndex;
    game.numberBuffer = game.numberBuffer.substr(0, index) + num + game.numberBuffer.substr(index+1);
    game.numberBufferIndex = (game.numberBufferIndex+1>=2) ? 0 :game.numberBufferIndex+1 ;
    console.log("DEBUG: " + game.numberBuffer);
}

/**
 * check if the binary representation is an overflow respect the maximum number of lane in the current game.
 * @param num The input number.
 * @returns {boolean}
 */
function isOverflow(num) {
    var totalLanes = 4; // TODO: Move in the game object.
    return num > Math.pow(2,totalLanes)-1;
}

/**
 * Preforms the shoot action.
 */
function shoot() {
    var num = parseInt(game.numberBuffer,10);
    if (isOverflow(num)){
        console.log("Overflow!");
    } else {
        var stringCode =num2binary(num);
        for (var i=0;i<stringCode.length;i++) {
            if (stringCode[i] === '1') {
                game.bullets.push(new PlayerBullet(1,game,i));
            }
        }
    }
    game.numberBuffer = "00";
    game.numberBufferIndex = 0;
}

/**
 * Draws on screen the input numeric sprites. TODO: And attach events to them.
 */
function drawNumericInput() {
    var numericInput = game.phaser_game.add.group();
    var item;

    // Put Numbers
    for (var i=0;i<5;i++) {
        item = numericInput.create(25+50*i, 500, 'numbers', i);
    }

    for (i=0;i<5;i++) {
        item = numericInput.create(25+50*i, 550, 'numbers', i+5);
    }
}
/* jshint latedef: false */
function preload() {
    game.phaser_game.load.spritesheet('numbers','assets/font_number_sprite.png', 45, 45);
    game.phaser_game.load.spritesheet('en_nose','assets/enemy_nose24x30.png',24,30);
    game.phaser_game.load.spritesheet('friendly','assets/friendly_thing24x30.png',24,30);
}

function create() {
    var pgame = game.phaser_game;
    pgame.renderer.renderSession.roundPixels = true;
    drawNumericInput();
    game.enemies = [];
    game.enemies.push(new EnemyPackage(1,game,0));
    game.enemies.push(new EnemyPackage(2,game,1));
    game.enemies.push(new FriendlyPackage(2,game,2));
    game.enemies.push(new EnemyPackage(2,game,3));

    game.bullets = [];

    game.textGUICode = pgame.add.text(pgame.world.centerX, 450, game.numberBuffer, { font: "65px Arial", fill: "#ffffff", align: "center" } );
    game.textGUICode.anchor.set(0.5);

    // Draw Line
    var graphics = game.phaser_game.add.graphics(0, 0);

    graphics.lineStyle(8, 0x33FF00);
    graphics.moveTo(0,400);
    graphics.lineTo(300, 400);

    // Setup Numeric Input
    // TODO: What does that "this" mean?
    pgame.input.keyboard.addKey(Phaser.Keyboard.ONE).onDown.add(function() { numKeyPressed(1); }, this);
    pgame.input.keyboard.addKey(Phaser.Keyboard.TWO).onDown.add(function() { numKeyPressed(2); }, this);
    pgame.input.keyboard.addKey(Phaser.Keyboard.THREE).onDown.add(function() { numKeyPressed(3); }, this);
    pgame.input.keyboard.addKey(Phaser.Keyboard.FOUR).onDown.add(function() { numKeyPressed(4); }, this);
    pgame.input.keyboard.addKey(Phaser.Keyboard.FIVE).onDown.add(function() { numKeyPressed(5); }, this);
    pgame.input.keyboard.addKey(Phaser.Keyboard.SIX).onDown.add(function() { numKeyPressed(6); }, this);
    pgame.input.keyboard.addKey(Phaser.Keyboard.SEVEN).onDown.add(function() { numKeyPressed(7); }, this);
    pgame.input.keyboard.addKey(Phaser.Keyboard.EIGHT).onDown.add(function() { numKeyPressed(8); }, this);
    pgame.input.keyboard.addKey(Phaser.Keyboard.NINE).onDown.add(function() { numKeyPressed(9); }, this);
    pgame.input.keyboard.addKey(Phaser.Keyboard.ZERO).onDown.add(function() { numKeyPressed(0); }, this);

    // Setup Shoot Input
    pgame.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(shoot, this);

}

function render() {
    game.textGUICode.text = game.numberBuffer;
    game.bullets.forEach(function(x) { x.render(); });
}

function update() {
    game.bullets.forEach(function(x) { x.update(); });
    game.enemies.forEach(function(x) { x.update(); });
}
/* jshint latedef: true */