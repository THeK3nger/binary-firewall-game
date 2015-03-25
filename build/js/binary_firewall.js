/**
 * Created by davide on 16/03/2015.
 */

console.log("Binary Firewall Game || Version 0.1 || Davide Aversa 2015 (c)");

var EnemyPackage = function(index, game, lane) {
    var margin = 25;
    var toatlLanes = 4;
    var halfSpriteSize = 12;

    var x = margin + lane * ( (300 - 2*margin)/(toatlLanes-1));
    x = x - halfSpriteSize; // Center the sprite on the lane.
    var y = 200;

    this.game = game;
    this.lane = lane;
    this.name = index.toString();
    this.mainSprite = game.add.game.add.sprite(x,y,'en_nose', 0);
    this.animation = this.mainSprite.animations.add('walk');
    this.animation.play(2, true);
};

var game = new Phaser.Game(300, 600, Phaser.AUTO, 'binary-firewall', { preload: preload, create: create, render: render, update: update });
game.numberBuffer = "00";
game.numberBufferIndex = 0;
game.bufferSize = 2;

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
        console.log(num2binary(num));
    }
    game.numberBuffer = "00";
    game.numberBufferIndex = 0;
}

/**
 * Draws on screen the input numeric sprites. TODO: And attach events to them.
 */
function drawNumericInput() {
    var numericInput = game.add.group();
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
    game.load.spritesheet('numbers','assets/font_number_sprite.png', 45, 45);
    game.load.spritesheet('en_nose','assets/enemy_nose24x30.png',24,30);
}

function create() {
    game.renderer.renderSession.roundPixels = true;
    drawNumericInput();
    var enemies = [];
    enemies.push(new EnemyPackage(1,game,0));
    enemies.push(new EnemyPackage(2,game,1));
    enemies.push(new EnemyPackage(2,game,2));
    enemies.push(new EnemyPackage(2,game,3));

    game.textGUICode = game.add.text(game.world.centerX, 430, game.numberBuffer, { font: "65px Arial", fill: "#ffffff", align: "center" } );
    game.textGUICode.anchor.set(0.5);

    // Setup Numeric Input
    // TODO: What does that "this" mean?
    game.input.keyboard.addKey(Phaser.Keyboard.ONE).onDown.add(function() { numKeyPressed(1); }, this);
    game.input.keyboard.addKey(Phaser.Keyboard.TWO).onDown.add(function() { numKeyPressed(2); }, this);
    game.input.keyboard.addKey(Phaser.Keyboard.THREE).onDown.add(function() { numKeyPressed(3); }, this);
    game.input.keyboard.addKey(Phaser.Keyboard.FOUR).onDown.add(function() { numKeyPressed(4); }, this);
    game.input.keyboard.addKey(Phaser.Keyboard.FIVE).onDown.add(function() { numKeyPressed(5); }, this);
    game.input.keyboard.addKey(Phaser.Keyboard.SIX).onDown.add(function() { numKeyPressed(6); }, this);
    game.input.keyboard.addKey(Phaser.Keyboard.SEVEN).onDown.add(function() { numKeyPressed(7); }, this);
    game.input.keyboard.addKey(Phaser.Keyboard.EIGHT).onDown.add(function() { numKeyPressed(8); }, this);
    game.input.keyboard.addKey(Phaser.Keyboard.NINE).onDown.add(function() { numKeyPressed(9); }, this);
    game.input.keyboard.addKey(Phaser.Keyboard.ZERO).onDown.add(function() { numKeyPressed(0); }, this);

    // Setup Shoot Input
    game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(shoot, this);

}

function render() {
    game.textGUICode.text = game.numberBuffer;
}

function update() {

}
/* jshint latedef: true */