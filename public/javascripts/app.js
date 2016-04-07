(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

// require('./ui')
require('./game');

},{"./game":7}],2:[function(require,module,exports){
'use strict';

var _EventHandler = require('../lib/EventHandler');

var _EventHandler2 = _interopRequireDefault(_EventHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var HighRuleDesert = require('../maps/HighRuleDesert');
var Weapons = require('../lib/Weapons');


var worldWidth = 8000;
var worldHeight = 3966;

module.exports = function () {
    var _this = this;

    // Define movement constants
    this.MAX_SPEED = 550;
    this.ACCELERATION = 1960;
    this.DRAG = 1500;
    this.GRAVITY = 1900;
    this.JUMP_SPEED = -850;
    this.JUMP_JET_SPEED = -2600;

    this.socket = io.connect();
    this.enemies = [];
    this.volume = .5;

    //  We're going to be using physics, so enable the Arcade Physics system
    this.physics.startSystem(Phaser.Physics.ARCADE);

    this.world.setBounds(0, 0, worldWidth, worldHeight);

    // Scale game on window resize
    this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
    this.game.scale.setShowAll();
    this.game.scale.refresh();

    /**
     * Map
     */
    HighRuleDesert.create.call(this);

    /**
     * Player Settings
     */
    var spawnPoint = HighRuleDesert.getRandomSpawnPoint.call(this);
    this.player = this.add.sprite(spawnPoint.x, spawnPoint.y, 'commando');
    this.player.scale.setTo(.27);
    this.player.anchor.setTo(.5);

    //  We need to enable physics on the player
    this.physics.arcade.enable(this.player);

    // Enable physics on the player
    this.game.physics.enable(this.player, Phaser.Physics.ARCADE);

    // Make player collide with world boundaries so he doesn't leave the stage
    this.player.body.collideWorldBounds = true;

    // Set player minimum and maximum movement speed
    this.player.body.maxVelocity.setTo(this.MAX_SPEED, this.MAX_SPEED * 10); // x, y

    // Add drag to the player that slows them down when they are not accelerating
    this.player.body.drag.setTo(this.DRAG, 0); // x, y
    this.player.body.setSize(230, 290, -10, 0);
    this.player.meta = {
        health: 100
    };

    // Since we're jumping we need gravity
    this.game.physics.arcade.gravity.y = this.GRAVITY;

    // Flag to track if the jump button is pressed
    this.jumping = false;

    //  Our two animations, walking left and right.
    this.player.animations.add('left', [0, 1, 2, 3, 4, 5], 10, true);
    this.player.animations.add('right', [8, 9, 10, 11, 12, 13], 10, true);

    this.player.meta = {
        health: 100
    };

    this.leftArmGroup = this.game.add.group();
    this.rightArmGroup = this.game.add.group();
    this.headGroup = this.game.add.group();
    this.torsoGroup = this.game.add.group();

    // Torso
    this.torsoSprite = this.game.add.sprite(-37, -105, 'torso');
    this.torsoSprite.scale.setTo(1.8);
    this.torsoGroup.add(this.torsoSprite);

    // Head
    this.headSprite = this.game.add.sprite(0, -148, 'head');
    this.headSprite.scale.setTo(1.8);
    this.headGroup.add(this.headSprite);

    // Left arm
    this.leftArmSprite = this.game.add.sprite(0, 0, 'left-arm');
    this.leftArmSprite.anchor.setTo(.2, .2);
    this.leftArmSprite.scale.setTo(1.6);
    this.leftArmSprite.rotation = 80.1;
    this.leftArmGroup.add(this.leftArmSprite);

    // Gun
    this.ak47Sprite = this.game.add.sprite(12, 19, 'ak47');
    this.ak47Sprite.scale.setTo(1.3);
    this.ak47Sprite.rotation = 80.15;

    // Right arm
    this.rightArmGroup.add(this.ak47Sprite);
    this.rightArmSprite = this.game.add.sprite(0, 0, 'right-arm');
    this.rightArmSprite.anchor.setTo(.2, .24);
    this.rightArmSprite.scale.setTo(1.7);
    this.rightArmSprite.rotation = 80.1;
    this.rightArmGroup.add(this.rightArmSprite);

    this.player.addChild(this.leftArmGroup);
    this.leftArmGroup.pivot.x = 0;
    this.leftArmGroup.pivot.y = 0;
    this.leftArmGroup.x = 45;
    this.leftArmGroup.y = -70;

    this.player.addChild(this.torsoGroup);
    this.player.addChild(this.headGroup);

    this.player.addChild(this.rightArmGroup);
    this.rightArmGroup.pivot.x = 0;
    this.rightArmGroup.pivot.y = 0;
    this.rightArmGroup.x = -25;
    this.rightArmGroup.y = -65;

    console.log('this.player', this.player);

    /**
     * Weapons
     */
    this.currentWeapon = 0;
    this.weapons = [new Weapons.AK47({
        game: this.game
    }), new Weapons.M500({
        game: this.game
    }), new Weapons.Skorpion({
        game: this.game
    }), new Weapons.Aug({
        game: this.game
    }), new Weapons.P90({
        game: this.game
    }), new Weapons.DesertEagle({
        game: this.game
    }), new Weapons.G43({
        game: this.game
    }), new Weapons.M4A1({
        game: this.game
    }), new Weapons.Barrett({
        game: this.game
    }), new Weapons.RPG({
        game: this.game
    })];

    /**
     * Text
     */
    var textStyles = { fontSize: '14px', fill: '#000' };

    _EventHandler2.default.emit('score update', '');
    _EventHandler2.default.emit('health update', '');
    _EventHandler2.default.on('volume update', function (data) {
        _this.volume = data.volume;
    });

    this.positionText = this.add.text(25, 25, this.game.input.mousePointer.x + ',' + this.game.input.mousePointer.y, textStyles);
    this.positionText.fixedToCamera = true;

    /**
     * Camera Settings
     */
    this.camera.follow(this.player);

    /**
     * Resizing Events
     */
    window.addEventListener('resize', function () {
        _this.game.scale.refresh();
        _this.game.height = window.innerHeight;
        _this.game.width = window.innerWidth;
    });

    /**
     * Enemy Bullets
     */
    this.enemyBullets = this.game.add.group();

    /**
     * Start listening for events
     */
    this.setEventHandlers();
};

},{"../lib/EventHandler":9,"../lib/Weapons":35,"../maps/HighRuleDesert":36}],3:[function(require,module,exports){
'use strict';

module.exports = {
    create: require('./create'),
    init: require('./init'),
    preload: require('./preload'),
    update: require('./update')
};

},{"./create":2,"./init":4,"./preload":5,"./update":6}],4:[function(require,module,exports){
'use strict';

module.exports = function () {
    this.game.renderer.renderSession.roundPixels = true;
    this.game.stage.disableVisibilityChange = true;
};

},{}],5:[function(require,module,exports){
'use strict';

module.exports = function () {
    this.load.image('map-bg', '/images/high-rule-desert.png');
    this.load.image('ground', '/images/platform.png');
    this.load.image('bullet12', '/images/bullet12.png');

    this.load.spritesheet('dude', '/images/dude.png', 32, 48);
    this.load.spritesheet('commando', '/images/commando.png', 300, 315);
    this.load.spritesheet('enemy', '/images/dude.png', 32, 48);

    this.load.image('ak47', '/images/guns/Spr_AK47.png');
    this.load.image('right-arm', '/images/body/right-arm.png');
    this.load.image('left-arm', '/images/body/left-arm.png');
    this.load.image('head', '/images/body/head.png');
    this.load.image('torso', '/images/body/torso.png');

    this.load.audio('AK47-sound', '/audio/AK47.ogg');
    this.load.audio('BarretM90-sound', '/audio/BarretM90.ogg');
    this.load.audio('M249-sound', '/audio/M249.ogg');
    this.load.audio('MP5-sound', '/audio/MP5.ogg');
    this.load.audio('DesertEagle-sound', '/audio/DesertEagle.ogg');
    this.load.audio('M4A1-sound', '/audio/M4A1.ogg');
};

},{}],6:[function(require,module,exports){
'use strict';

var _EventHandler = require('../lib/EventHandler');

var _EventHandler2 = _interopRequireDefault(_EventHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function () {
    var _this = this;

    // Collide this player with the map
    this.physics.arcade.collide(this.player, this.platforms, null, null, this);

    // Did this player's bullets hit any platforms
    this.physics.arcade.collide(this.platforms, this.weapons, function (platform, weapon) {
        weapon.kill();
    }, null, this);

    // Did enemy bullets hit any platforms
    this.physics.arcade.collide(this.platforms, this.enemyBullets, function (platform, bullet) {
        bullet.kill();
    }, null, this);

    // Did this player get hit by any enemy bullets
    this.physics.arcade.collide(this.player, this.enemyBullets, null, function (player, bullet) {
        bullet.kill();

        console.log('You were hit by', bullet.bulletId);
        _this.socket.emit('bullet removed', {
            roomId: _this.roomId,
            bulletId: bullet.bulletId
        });

        _this.socket.emit('player damaged', {
            roomId: _this.roomId,
            damage: bullet.damage,
            damagedPlayerId: '/#' + _this.socket.id,
            attackingPlayerId: bullet.playerId
        });

        return false;
    }, this);

    if (this.leftInputIsActive()) {
        // If the LEFT key is down, set the player velocity to move left
        this.player.body.acceleration.x = -this.ACCELERATION;
        this.player.animations.play('left');

        // Left facing head needs to be set only once
        if (this.player.meta.facing !== 'left') {
            this.player.meta.facing = 'left';

            this.headSprite.scale.x *= -1;
            this.headSprite.x = 12;

            this.torsoSprite.scale.x *= -1;
            this.torsoSprite.x = 49;

            this.leftArmSprite.scale.y *= -1;
            this.rightArmSprite.scale.y *= -1;
            this.ak47Sprite.scale.y *= -1;
        }
    } else if (this.rightInputIsActive()) {
        // If the RIGHT key is down, set the player velocity to move right
        this.player.body.acceleration.x = this.ACCELERATION;
        this.player.animations.play('right');

        if (this.player.meta.facing !== 'right') {
            this.player.meta.facing = 'right';

            this.headSprite.scale.x *= -1;
            this.headSprite.x = 0;

            this.torsoSprite.scale.x *= -1;
            this.torsoSprite.x = -37;

            this.leftArmSprite.scale.y *= -1;
            this.rightArmSprite.scale.y *= -1;
            this.ak47Sprite.scale.y *= -1;
        }
    } else {
        // Stand still
        this.player.body.acceleration.x = 0;
        this.player.animations.stop();

        if (this.game.input.worldX > this.player.x) {
            this.player.frame = 7;
            if (this.player.meta.facing !== 'right') {
                this.player.meta.facing = 'right';

                this.headSprite.scale.x *= -1;
                this.headSprite.x = 0;

                this.torsoSprite.scale.x *= -1;
                this.torsoSprite.x = -37;

                this.leftArmSprite.scale.y *= -1;
                this.leftArmSprite.y = 0;

                this.rightArmSprite.scale.y *= -1;
                this.rightArmSprite.y = 0;

                this.ak47Sprite.scale.y *= -1;
                this.ak47Sprite.y = 19;
            }
        }

        if (this.game.input.worldX < this.player.x) {
            this.player.frame = 6;
            if (this.player.meta.facing !== 'left') {
                this.player.meta.facing = 'left';

                this.headSprite.scale.x *= -1;
                this.headSprite.x = 12;

                this.torsoSprite.scale.x *= -1;
                this.torsoSprite.x = 49;

                this.leftArmSprite.scale.y *= -1;
                this.leftArmSprite.y = -85;

                this.rightArmSprite.scale.y *= -1;
                this.rightArmSprite.y = 65;

                this.ak47Sprite.scale.y *= -1;
                this.ak47Sprite.y = 65;
            }
        }
    }

    var angleInDegrees = this.game.physics.arcade.angleToPointer(this.player) * 180 / Math.PI + 90;

    this.rightArmGroup.angle = angleInDegrees;
    // console.log('angleInDegrees', angleInDegrees)

    // User is aiming up
    if (angleInDegrees <= 81 && angleInDegrees >= 71) {
        angleInDegrees -= 10;
    } else if (angleInDegrees < 71 && angleInDegrees >= 61) {
        angleInDegrees -= 20;
    } else if (angleInDegrees < 61 && angleInDegrees >= 51) {
        angleInDegrees -= 30;
    } else if (angleInDegrees < 51 && angleInDegrees >= 41) {
        angleInDegrees -= 40;
    } else if (angleInDegrees < 41 && angleInDegrees >= 31) {
        angleInDegrees -= 50;
    } else if (angleInDegrees < 31 && angleInDegrees >= 21) {
        angleInDegrees -= 60;
    } else if (angleInDegrees < 21 && angleInDegrees >= 11) {
        angleInDegrees -= 70;
    } else if (angleInDegrees < 11 && angleInDegrees >= 0) {
        angleInDegrees -= 80;
    }

    // User is aiming down
    if (angleInDegrees >= 99 && angleInDegrees <= 109) {
        angleInDegrees += 10;
    } else if (angleInDegrees > 109 && angleInDegrees <= 119) {
        angleInDegrees += 20;
    } else if (angleInDegrees > 119 && angleInDegrees <= 129) {
        angleInDegrees += 30;
    } else if (angleInDegrees > 129 && angleInDegrees <= 139) {
        angleInDegrees += 40;
    } else if (angleInDegrees > 139 && angleInDegrees <= 149) {
        angleInDegrees += 50;
    } else if (angleInDegrees > 149 && angleInDegrees <= 159) {
        angleInDegrees += 60;
    } else if (angleInDegrees > 159 && angleInDegrees <= 169) {
        angleInDegrees += 70;
    } else if (angleInDegrees > 169 && angleInDegrees <= 180) {
        angleInDegrees += 80;
    }

    this.leftArmGroup.angle = angleInDegrees;

    // Set a variable that is true when the player is touching the ground
    var onTheGround = this.player.body.touching.down;

    // If the player is touching the ground, let him have 2 jumps
    if (onTheGround) {
        this.jumps = 2;
        this.jumping = false;
    }

    // Jump!
    if (this.jumps === 2 && this.upInputIsActive(5) && onTheGround) {
        this.player.body.velocity.y = this.JUMP_SPEED;
        this.jumping = true;
    } else if (this.upInputIsActive(5) && !onTheGround) {
        this.jumps = 1;
    }

    // Jump Jet!
    if (this.jumps === 1 && this.input.keyboard.isDown(Phaser.Keyboard.W)) {
        this.player.body.acceleration.y = this.JUMP_JET_SPEED;
    } else {
        this.player.body.acceleration.y = 0;
    }

    // Reduce the number of available jumps if the jump input is released
    if (this.jumping && this.upInputReleased()) {
        this.player.body.acceleration.x = 0;
        this.player.body.acceleration.y = 0;

        if (this.jumps !== 1) {
            this.jumps--;
        }

        this.jumping = false;
    }

    if (this.game.input.activePointer.isDown) {
        this.weapons[this.currentWeapon].fire(this.player, this.socket, this.roomId, this.volume);
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.ONE)) {
        this.setCurrentWeapon(0);
        _EventHandler2.default.emit('weapon update', 1);
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.TWO)) {
        this.setCurrentWeapon(1);
        _EventHandler2.default.emit('weapon update', 2);
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.THREE)) {
        this.setCurrentWeapon(2);
        _EventHandler2.default.emit('weapon update', 3);
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.FOUR)) {
        this.setCurrentWeapon(3);
        _EventHandler2.default.emit('weapon update', 4);
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.FIVE)) {
        this.setCurrentWeapon(4);
        _EventHandler2.default.emit('weapon update', 5);
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.SIX)) {
        this.setCurrentWeapon(5);
        _EventHandler2.default.emit('weapon update', 6);
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.SEVEN)) {
        this.setCurrentWeapon(6);
        _EventHandler2.default.emit('weapon update', 7);
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.EIGHT)) {
        this.setCurrentWeapon(7);
        _EventHandler2.default.emit('weapon update', 8);
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.NINE)) {
        this.setCurrentWeapon(8);
        _EventHandler2.default.emit('weapon update', 9);
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.ZERO)) {
        this.setCurrentWeapon(9);
        _EventHandler2.default.emit('weapon update', 0);
    }

    this.positionText.text = this.game.input.worldX + ', ' + this.game.input.worldY;

    this.socket.emit('move player', {
        roomId: this.roomId,
        x: this.player.x,
        y: this.player.y
    });
};

},{"../lib/EventHandler":9}],7:[function(require,module,exports){
'use strict';

var InputHandler = require('./lib/InputHandler');
// let EnemyBuffalo = require('./lib/EnemyBuffalo')
var SocketEvents = require('./lib/SocketEvents');
var Core = require('./core');

var gameWidth = window.innerWidth;
var gameHeight = window.innerHeight;
var game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, 'ranger-steve-game');

var RangerSteveGame = function RangerSteveGame() {
    this.currentWeapon = 0;
    this.enemies = [];
    this.game = game;
    this.ground;
    this.platforms;
    this.player;
    this.score = 0;
    this.scoreText;
    this.socket;
    this.weaponName = null;
    this.weapons = [];
};

RangerSteveGame.prototype = {
    init: Core.init,
    preload: Core.preload,
    create: Core.create,
    update: Core.update,
    render: function render() {},

    leftInputIsActive: InputHandler.leftInputIsActive,
    rightInputIsActive: InputHandler.rightInputIsActive,
    upInputIsActive: InputHandler.upInputIsActive,
    upInputReleased: InputHandler.upInputReleased,

    setCurrentWeapon: function setCurrentWeapon(newCurrentWeapon) {
        if (newCurrentWeapon === this.weapons.length) newCurrentWeapon = 0;

        //  Reset current weapon
        this.weapons[this.currentWeapon].visible = false;
        this.weapons[this.currentWeapon].callAll('reset', null, 0, 0);
        this.weapons[this.currentWeapon].setAll('exists', false);

        //  Activate the new one
        this.currentWeapon = newCurrentWeapon;
        this.weapons[this.currentWeapon].visible = true;
    },

    setEventHandlers: SocketEvents.setEventHandlers,
    onUpdatePlayers: SocketEvents.onUpdatePlayers,
    onSocketConnected: SocketEvents.onSocketConnected,
    onSocketDisconnect: SocketEvents.onSocketDisconnect,
    onMovePlayer: SocketEvents.onMovePlayer,
    onRemovePlayer: SocketEvents.onRemovePlayer,
    onBulletFired: SocketEvents.onBulletFired,
    onBulletRemoved: SocketEvents.onBulletRemoved,
    onPlayerDamaged: SocketEvents.onPlayerDamaged,
    onPlayerRespawn: SocketEvents.onPlayerRespawn
};

game.state.add('Game', RangerSteveGame, true);

},{"./core":3,"./lib/InputHandler":11,"./lib/SocketEvents":14}],8:[function(require,module,exports){
'use strict';

var Guid = require('./Guid');

var Bullet = function Bullet(game, key) {
    Phaser.Sprite.call(this, game, 0, 0, key);
    this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
    this.anchor.set(0.5);
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    this.exists = false;
    this.tracking = false;
    this.scaleSpeed = 0;
};

Bullet.prototype = Object.create(Phaser.Sprite.prototype);
Bullet.prototype.constructor = Bullet;

Bullet.prototype.fire = function (x, y, angle, speed, gx, gy, socket, roomId) {
    this.reset(x, y);

    var pointerAngle = this.game.physics.arcade.moveToPointer(this, speed);
    this.body.gravity.y = -1800;

    console.log('Firing bullet locally', this.bulletId);

    socket.emit('bullet fired', {
        roomId: roomId,
        bulletId: this.bulletId,
        playerId: '/#' + socket.id,
        x: x,
        y: y,
        angle: angle,
        speed: speed,
        gx: gx,
        gy: gy,
        pointerAngle: pointerAngle,
        height: this.height,
        width: this.width,
        damage: this.damage
    });
};

Bullet.prototype.update = function () {
    if (this.tracking) {
        this.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x);
    }
};

module.exports = Bullet;

},{"./Guid":10}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _eventEmitter = require('event-emitter');

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EventHandler = (0, _eventEmitter2.default)({});

exports.default = EventHandler;

},{"event-emitter":51}],10:[function(require,module,exports){
'use strict';

module.exports = function guidGenerator() {
   var S4 = function S4() {
      return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
   };

   return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
};

},{}],11:[function(require,module,exports){
'use strict';

module.exports = {
    // This function should return true when the player activates the "go left" control
    // In this case, either holding the right arrow or tapping or clicking on the left
    // side of the screen.
    leftInputIsActive: function leftInputIsActive() {
        return this.input.keyboard.isDown(Phaser.Keyboard.A);
    },

    // This function should return true when the player activates the "go right" control
    // In this case, either holding the right arrow or tapping or clicking on the right
    // side of the screen.
    rightInputIsActive: function rightInputIsActive() {
        return this.input.keyboard.isDown(Phaser.Keyboard.D);
    },

    // This function should return true when the player activates the "jump" control
    // In this case, either holding the up arrow or tapping or clicking on the center
    // part of the screen.
    upInputIsActive: function upInputIsActive(duration) {
        return this.input.keyboard.downDuration(Phaser.Keyboard.W, duration);
    },

    // This function returns true when the player releases the "jump" control
    upInputReleased: function upInputReleased() {
        return this.input.keyboard.upDuration(Phaser.Keyboard.W);
    }
};

},{}],12:[function(require,module,exports){
'use strict';

module.exports = function (id) {
    for (var i = 0; i < this.enemies.length; i++) {
        if (this.enemies[i].player.id === id) {
            return this.enemies[i];
        }
    }

    return false;
};

},{}],13:[function(require,module,exports){
'use strict';

var RemotePlayer = function RemotePlayer(id, game, player, startX, startY) {
    var newRemotePlayer = {
        x: startX,
        y: startY,
        id: null,
        game: game,
        health: 100,
        player: player,
        alive: true,
        lastPosition: {
            x: startX,
            y: startY
        }
    };

    // Create the player's enemy sprite
    newRemotePlayer.player = game.add.sprite(startX, startY, 'enemy');

    //  We need to enable physics on the player
    // this.physics.arcade.enable(newRemotePlayer.player)

    // // Enable physics on the player
    // this.game.physics.enable(newRemotePlayer.player, Phaser.Physics.ARCADE)

    // Make player collide with world boundaries so he doesn't leave the stage
    // newRemotePlayer.player.body.collideWorldBounds = true

    // Our two animations, walking left and right.
    newRemotePlayer.player.animations.add('left', [0, 1, 2, 3], 10, true);
    newRemotePlayer.player.animations.add('right', [5, 6, 7, 8], 10, true);

    newRemotePlayer.player.id = id;

    return newRemotePlayer;
};

module.exports = RemotePlayer;

},{}],14:[function(require,module,exports){
'use strict';

module.exports = {
    setEventHandlers: require('./setEventHandlers'),

    onSocketConnected: require('./onSocketConnected'),
    onSocketDisconnect: require('./onSocketDisconnect'),

    onMovePlayer: require('./onMovePlayer'),
    onRemovePlayer: require('./onRemovePlayer'),
    onUpdatePlayers: require('./onUpdatePlayers'),

    onPlayerDamaged: require('./onPlayerDamaged'),
    onPlayerRespawn: require('./onPlayerRespawn'),

    onBulletFired: require('./onBulletFired'),
    onBulletRemoved: require('./onBulletRemoved')
};

},{"./onBulletFired":15,"./onBulletRemoved":16,"./onMovePlayer":17,"./onPlayerDamaged":18,"./onPlayerRespawn":19,"./onRemovePlayer":20,"./onSocketConnected":21,"./onSocketDisconnect":22,"./onUpdatePlayers":23,"./setEventHandlers":24}],15:[function(require,module,exports){
'use strict';

var Bullet = require('../Bullet');

module.exports = function (data) {
    if (data.id === '/#' + this.socket.id) return;

    console.log('Firing bullet remotely', data.bulletId);

    var newEnemyBullet = this.enemyBullets.create(data.x, data.y, 'bullet12');
    newEnemyBullet.bulletId = data.bulletId;
    newEnemyBullet.playerId = data.playerId;
    newEnemyBullet.damage = data.damage;
    newEnemyBullet.rotation = data.pointerAngle;
    newEnemyBullet.height = data.height;
    newEnemyBullet.width = data.width;
    this.game.physics.enable(newEnemyBullet, Phaser.Physics.ARCADE);
    newEnemyBullet.body.gravity.y = -1800;

    var newVelocity = this.game.physics.arcade.velocityFromRotation(data.pointerAngle, data.speed);
    newEnemyBullet.body.velocity.x += newVelocity.x;
    newEnemyBullet.body.velocity.y += newVelocity.y;
};

},{"../Bullet":8}],16:[function(require,module,exports){
'use strict';

module.exports = function (data) {
    if (data.id === '/#' + this.socket.id) return;

    console.log('Removing bullet', data.bulletId);

    var removeBullet = _.find(this.weapons[this.currentWeapon].children, {
        bulletId: data.bulletId
    });

    if (!removeBullet) {
        console.log('Bullet not found: ', data.bulletId);
        return;
    }

    removeBullet.kill();
};

},{}],17:[function(require,module,exports){
'use strict';

var PlayerById = require('../PlayerById');

module.exports = function (data) {
    var movePlayer = PlayerById.call(this, data.id);

    // Player not found
    if (!movePlayer) {
        return;
    }

    // Update player position
    movePlayer.player.x = data.x;
    movePlayer.player.y = data.y;

    if (movePlayer.player.x > movePlayer.lastPosition.x) {
        movePlayer.player.animations.play('right');
    } else if (movePlayer.player.x < movePlayer.lastPosition.x) {
        movePlayer.player.animations.play('left');
    } else {
        movePlayer.player.animations.stop();
        movePlayer.player.frame = 4;
    }

    movePlayer.lastPosition.x = movePlayer.player.x;
    movePlayer.lastPosition.y = movePlayer.player.y;
};

},{"../PlayerById":12}],18:[function(require,module,exports){
'use strict';

var _EventHandler = require('../EventHandler');

var _EventHandler2 = _interopRequireDefault(_EventHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (data) {
    if (data.damagedPlayerId !== '/#' + this.socket.id) return;

    this.player.meta.health = data.health;
    _EventHandler2.default.emit('health update', this.player.meta.health);
};

},{"../EventHandler":9}],19:[function(require,module,exports){
'use strict';

var _EventHandler = require('../EventHandler');

var _EventHandler2 = _interopRequireDefault(_EventHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var HighRuleDesert = require('../../maps/HighRuleDesert');

module.exports = function (data) {
    if (data.damagedPlayerId !== '/#' + this.socket.id) return;

    this.player.meta.health = data.health;
    _EventHandler2.default.emit('health update', String(this.player.meta.health));

    var spawnPoint = HighRuleDesert.getRandomSpawnPoint.call(this);
    this.player.x = spawnPoint.x;
    this.player.y = spawnPoint.y;
};

},{"../../maps/HighRuleDesert":36,"../EventHandler":9}],20:[function(require,module,exports){
'use strict';

var PlayerById = require('../PlayerById');

module.exports = function (data) {
    var removePlayer = PlayerById.call(this, data.id);

    // Player not found
    if (!removePlayer) {
        console.log('Player not found: ', data.id);
        return;
    }

    removePlayer.player.kill();

    // Remove player from array
    this.enemies.splice(this.enemies.indexOf(removePlayer), 1);
};

},{"../PlayerById":12}],21:[function(require,module,exports){
'use strict';

var getQueryString = function getQueryString(field, url) {
    var href = url ? url : window.location.href;
    var reg = new RegExp('[?&]' + field + '=([^&#]*)', 'i');
    var string = reg.exec(href);
    return string ? string[1] : null;
};

module.exports = function () {
    console.log('Connected to socket server');

    // Reset enemies on reconnect
    this.enemies.forEach(function (enemy) {
        if (enemy) enemy.kill();
    });

    this.enemies = [];

    // Send local player data to the game server
    this.socket.emit('new player', {
        roomId: getQueryString('roomId'),
        x: this.player.x,
        y: this.player.y
    });
};

},{}],22:[function(require,module,exports){
'use strict';

module.exports = function () {
    console.log('Disconnected from socket server');
};

},{}],23:[function(require,module,exports){
'use strict';

var _EventHandler = require('../EventHandler');

var _EventHandler2 = _interopRequireDefault(_EventHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var RemotePlayer = require('../RemotePlayer');


module.exports = function (data) {
    var _this = this;

    console.log('update players', data);

    this.roomId = data.room.id;

    var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?roomId=' + data.room.id;
    window.history.pushState({ path: newurl }, '', newurl);

    this.enemies.forEach(function (enemy) {
        enemy.player.kill();
    });

    this.enemies = [];

    _EventHandler2.default.emit('players update', data.room.players);

    data.room.players.forEach(function (player) {
        if (player.id === '/#' + _this.socket.id) {
            _EventHandler2.default.emit('score update', String(player.meta.score));
            _EventHandler2.default.emit('health update', String(player.meta.health));
            return;
        }

        var newRemotePlayer = RemotePlayer.call(_this, player.id, _this.game, _this.player, player.x, player.y);
        _this.enemies.push(newRemotePlayer);
        _this.enemies[_this.enemies.length - 1].player.animations.add('left', [0, 1, 2, 3], 10, true);
        _this.enemies[_this.enemies.length - 1].player.animations.add('right', [5, 6, 7, 8], 10, true);
    });
};

},{"../EventHandler":9,"../RemotePlayer":13}],24:[function(require,module,exports){
'use strict';

var _EventHandler = require('../EventHandler');

var _EventHandler2 = _interopRequireDefault(_EventHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function () {
    var _this = this;

    this.socket.on('connect', this.onSocketConnected.bind(this));
    this.socket.on('disconnect', this.onSocketDisconnect.bind(this));

    this.socket.on('update players', this.onUpdatePlayers.bind(this));
    this.socket.on('move player', this.onMovePlayer.bind(this));
    this.socket.on('remove player', this.onRemovePlayer.bind(this));

    this.socket.on('player respawn', this.onPlayerRespawn.bind(this));
    this.socket.on('player damaged', this.onPlayerDamaged.bind(this));

    this.socket.on('bullet fired', this.onBulletFired.bind(this));
    this.socket.on('bullet removed', this.onBulletRemoved.bind(this));

    _EventHandler2.default.on('player update nickname', function (data) {
        _this.socket.emit('player update nickname', {
            roomId: _this.roomId,
            nickname: data.nickname
        });
    });
};

},{"../EventHandler":9}],25:[function(require,module,exports){
'use strict';

var Bullet = require('../Bullet');
var Guid = require('../Guid');

var AK47 = function AK47(config) {
    Phaser.Group.call(this, config.game, config.game.world, 'AK-47', false, true, Phaser.Physics.ARCADE);

    //	Here we set-up our audio sprite
    this.fx = config.game.add.audio('AK47-sound');
    this.allowMultiple = true;

    this.damage = 22;
    this.nextFire = 0;
    this.bulletSpeed = 2300;
    this.fireRate = 160;

    for (var i = 0; i < 64; i++) {
        var bullet = new Bullet(config.game, 'bullet12', config.socket);
        bullet.bulletId = Guid();
        bullet.height = 2;
        bullet.width = 40;
        bullet.damage = 22;
        this.add(bullet, true);
    }

    return this;
};

AK47.prototype = Object.create(Phaser.Group.prototype);
AK47.prototype.constructor = AK47;

AK47.prototype.fire = function (player, socket, roomId, volume) {
    if (this.game.time.time < this.nextFire) return;

    var x = player.x + 10;
    var y = player.y + -10;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0, socket, roomId);
    this.setAll('tracking', true);

    this.nextFire = this.game.time.time + this.fireRate;
    this.fx.volume = .3 * volume;
    this.fx.play();
};

module.exports = AK47;

},{"../Bullet":8,"../Guid":10}],26:[function(require,module,exports){
'use strict';

var Bullet = require('../Bullet');
var Guid = require('../Guid');

var AK47 = function AK47(config) {
    Phaser.Group.call(this, config.game, config.game.world, 'AK-47', false, true, Phaser.Physics.ARCADE);

    //	Here we set-up our audio sprite
    this.fx = config.game.add.audio('AK47-sound');
    this.allowMultiple = true;

    this.damage = 22;
    this.nextFire = 0;
    this.bulletSpeed = 2300;
    this.fireRate = 160;

    for (var i = 0; i < 64; i++) {
        var bullet = new Bullet(config.game, 'bullet12', config.socket);
        bullet.bulletId = Guid();
        bullet.height = 2;
        bullet.width = 40;
        bullet.damage = 22;
        this.add(bullet, true);
    }

    return this;
};

AK47.prototype = Object.create(Phaser.Group.prototype);
AK47.prototype.constructor = AK47;

AK47.prototype.fire = function (player, socket, roomId, volume) {
    if (this.game.time.time < this.nextFire) return;

    var x = player.x + 15;
    var y = player.y + 30;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0, socket, roomId);
    this.setAll('tracking', true);

    this.nextFire = this.game.time.time + this.fireRate;
    console.log(volume);
    console.log(.3 * volume);
    this.fx.volume = .3 * volume;
    this.fx.play();
};

module.exports = AK47;

},{"../Bullet":8,"../Guid":10}],27:[function(require,module,exports){
'use strict';

var Bullet = require('../Bullet');
var Guid = require('../Guid');

var BarretM90 = function BarretM90(config) {
    Phaser.Group.call(this, config.game, config.game.world, 'Barret M90', false, true, Phaser.Physics.ARCADE);

    //	Here we set-up our audio sprite
    this.fx = config.game.add.audio('BarretM90-sound');
    this.allowMultiple = true;

    this.name = 'Barret M90';
    this.damage = 88;
    this.nextFire = 0;
    this.bulletSpeed = 3435;

    // BarretM90 fires about 600 bullets per second
    this.fireRate = 3000;

    for (var i = 0; i < 64; i++) {
        var bullet = new Bullet(config.game, 'bullet12', config.socket);
        bullet.bulletId = Guid();
        bullet.height = 2;
        bullet.width = 40;
        bullet.damage = 88;

        this.add(bullet, true);
    }

    return this;
};

BarretM90.prototype = Object.create(Phaser.Group.prototype);
BarretM90.prototype.constructor = BarretM90;

BarretM90.prototype.fire = function (player, socket, roomId) {
    if (this.game.time.time < this.nextFire) return;

    var x = player.x + 15;
    var y = player.y + 30;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0, socket, roomId);
    this.setAll('tracking', true);

    this.nextFire = this.game.time.time + this.fireRate;
    this.fx.volume = .6;
    this.fx.play();
};

module.exports = BarretM90;

},{"../Bullet":8,"../Guid":10}],28:[function(require,module,exports){
'use strict';

var Bullet = require('../Bullet');
var Guid = require('../Guid');

var AK47 = function AK47(config) {
    Phaser.Group.call(this, config.game, config.game.world, 'Desert Eagle', false, true, Phaser.Physics.ARCADE);

    //	Here we set-up our audio sprite
    this.fx = config.game.add.audio('DesertEagle-sound');
    this.allowMultiple = true;

    this.damage = 33;
    this.nextFire = 0;
    this.bulletSpeed = 2300;
    this.fireRate = 267;

    for (var i = 0; i < 64; i++) {
        var bullet = new Bullet(config.game, 'bullet12', config.socket);
        bullet.bulletId = Guid();
        bullet.height = 2;
        bullet.width = 40;
        bullet.damage = 22;
        this.add(bullet, true);
    }

    return this;
};

AK47.prototype = Object.create(Phaser.Group.prototype);
AK47.prototype.constructor = AK47;

AK47.prototype.fire = function (player, socket, roomId) {
    if (this.game.time.time < this.nextFire) return;

    var x = player.x + 15;
    var y = player.y + 30;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0, socket, roomId);
    this.setAll('tracking', true);

    this.nextFire = this.game.time.time + this.fireRate;
    this.fx.volume = .3;
    this.fx.play();
};

module.exports = AK47;

},{"../Bullet":8,"../Guid":10}],29:[function(require,module,exports){
'use strict';

var Bullet = require('../Bullet');
var Guid = require('../Guid');

var AK47 = function AK47(config) {
    Phaser.Group.call(this, config.game, config.game.world, 'AK-47', false, true, Phaser.Physics.ARCADE);

    //	Here we set-up our audio sprite
    this.fx = config.game.add.audio('AK47-sound');
    this.allowMultiple = true;

    this.damage = 22;
    this.nextFire = 0;
    this.bulletSpeed = 2300;
    this.fireRate = 160;

    for (var i = 0; i < 64; i++) {
        var bullet = new Bullet(config.game, 'bullet12', config.socket);
        bullet.bulletId = Guid();
        bullet.height = 2;
        bullet.width = 40;
        bullet.damage = 22;
        this.add(bullet, true);
    }

    return this;
};

AK47.prototype = Object.create(Phaser.Group.prototype);
AK47.prototype.constructor = AK47;

AK47.prototype.fire = function (player, socket, roomId, volume) {
    if (this.game.time.time < this.nextFire) return;

    var x = player.x + 15;
    var y = player.y + 30;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0, socket, roomId);
    this.setAll('tracking', true);

    this.nextFire = this.game.time.time + this.fireRate;
    console.log(volume);
    console.log(.3 * volume);
    this.fx.volume = .3 * volume;
    this.fx.play();
};

module.exports = AK47;

},{"../Bullet":8,"../Guid":10}],30:[function(require,module,exports){
'use strict';

var Bullet = require('../Bullet');
var Guid = require('../Guid');

var AK47 = function AK47(config) {
    Phaser.Group.call(this, config.game, config.game.world, 'M4A1', false, true, Phaser.Physics.ARCADE);

    //	Here we set-up our audio sprite
    this.fx = config.game.add.audio('M4A1-sound');
    this.allowMultiple = true;

    this.damage = 20;
    this.nextFire = 0;
    this.bulletSpeed = 2400;
    this.fireRate = 150;

    for (var i = 0; i < 64; i++) {
        var bullet = new Bullet(config.game, 'bullet12', config.socket);
        bullet.bulletId = Guid();
        bullet.height = 2;
        bullet.width = 40;
        bullet.damage = 22;
        this.add(bullet, true);
    }

    return this;
};

AK47.prototype = Object.create(Phaser.Group.prototype);
AK47.prototype.constructor = AK47;

AK47.prototype.fire = function (player, socket, roomId) {
    if (this.game.time.time < this.nextFire) return;

    var x = player.x + 15;
    var y = player.y + 30;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0, socket, roomId);
    this.setAll('tracking', true);

    this.nextFire = this.game.time.time + this.fireRate;
    this.fx.volume = .3;
    this.fx.play();
};

module.exports = AK47;

},{"../Bullet":8,"../Guid":10}],31:[function(require,module,exports){
'use strict';

var Bullet = require('../Bullet');
var Guid = require('../Guid');

var Spas12 = function Spas12(config) {
    Phaser.Group.call(this, config.game, config.game.world, 'Spas-12', false, true, Phaser.Physics.ARCADE);

    this.nextFire = 0;
    this.bulletSpeed = 1900;
    this.fireRate = 500;

    for (var i = 0; i < 32; i++) {
        var bullet = new Bullet(config.game, 'bullet12', config.socket);
        bullet.bulletId = Guid();
        bullet.height = 2;
        bullet.width = 40;
        bullet.damage = 22;
        this.add(bullet, true);
    }

    return this;
};

Spas12.prototype = Object.create(Phaser.Group.prototype);
Spas12.prototype.constructor = Spas12;

Spas12.prototype.fire = function (player, socket, roomId) {
    if (this.game.time.time < this.nextFire) return;

    var x = player.x + 15;
    var y = player.y + 30;

    var bulletInstance = this.getFirstExists(false);
    if (!bulletInstance) return;
    bulletInstance.fire(x, y, .3, this.bulletSpeed, 0, 0, socket, roomId);

    bulletInstance = this.getFirstExists(false);
    if (!bulletInstance) return;
    bulletInstance.fire(x, y, -0.3, this.bulletSpeed, 0, 0, socket, roomId);

    bulletInstance = this.getFirstExists(false);
    if (!bulletInstance) return;
    bulletInstance.fire(x, y, 0, this.bulletSpeed, 0, 0, socket, roomId);

    bulletInstance = this.getFirstExists(false);
    if (!bulletInstance) return;
    bulletInstance.fire(x, y, 0, this.bulletSpeed, 0, 0, socket, roomId);

    this.setAll('tracking', true);

    this.nextFire = this.game.time.time + this.fireRate;
};

module.exports = Spas12;

},{"../Bullet":8,"../Guid":10}],32:[function(require,module,exports){
'use strict';

var Bullet = require('../Bullet');
var Guid = require('../Guid');

var AK47 = function AK47(config) {
    Phaser.Group.call(this, config.game, config.game.world, 'AK-47', false, true, Phaser.Physics.ARCADE);

    //	Here we set-up our audio sprite
    this.fx = config.game.add.audio('AK47-sound');
    this.allowMultiple = true;

    this.damage = 22;
    this.nextFire = 0;
    this.bulletSpeed = 2300;
    this.fireRate = 160;

    for (var i = 0; i < 64; i++) {
        var bullet = new Bullet(config.game, 'bullet12', config.socket);
        bullet.bulletId = Guid();
        bullet.height = 2;
        bullet.width = 40;
        bullet.damage = 22;
        this.add(bullet, true);
    }

    return this;
};

AK47.prototype = Object.create(Phaser.Group.prototype);
AK47.prototype.constructor = AK47;

AK47.prototype.fire = function (player, socket, roomId, volume) {
    if (this.game.time.time < this.nextFire) return;

    var x = player.x + 15;
    var y = player.y + 30;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0, socket, roomId);
    this.setAll('tracking', true);

    this.nextFire = this.game.time.time + this.fireRate;
    console.log(volume);
    console.log(.3 * volume);
    this.fx.volume = .3 * volume;
    this.fx.play();
};

module.exports = AK47;

},{"../Bullet":8,"../Guid":10}],33:[function(require,module,exports){
'use strict';

var Bullet = require('../Bullet');
var Guid = require('../Guid');

var AK47 = function AK47(config) {
    Phaser.Group.call(this, config.game, config.game.world, 'AK-47', false, true, Phaser.Physics.ARCADE);

    //	Here we set-up our audio sprite
    this.fx = config.game.add.audio('AK47-sound');
    this.allowMultiple = true;

    this.damage = 22;
    this.nextFire = 0;
    this.bulletSpeed = 2300;
    this.fireRate = 160;

    for (var i = 0; i < 64; i++) {
        var bullet = new Bullet(config.game, 'bullet12', config.socket);
        bullet.bulletId = Guid();
        bullet.height = 2;
        bullet.width = 40;
        bullet.damage = 22;
        this.add(bullet, true);
    }

    return this;
};

AK47.prototype = Object.create(Phaser.Group.prototype);
AK47.prototype.constructor = AK47;

AK47.prototype.fire = function (player, socket, roomId, volume) {
    if (this.game.time.time < this.nextFire) return;

    var x = player.x + 15;
    var y = player.y + 30;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0, socket, roomId);
    this.setAll('tracking', true);

    this.nextFire = this.game.time.time + this.fireRate;
    this.fx.volume = .3 * volume;
    this.fx.play();
};

module.exports = AK47;

//
// ///////////////////////////////////////////////////////////////////
// //  RPG that visually track the direction they're heading in //
// ///////////////////////////////////////////////////////////////////
//
// Weapon.RPG = function (game) {
//
//     Phaser.Group.call(this, game, game.world, 'RPG', false, true, Phaser.Physics.ARCADE);
//
//     this.nextFire = 0;
//     this.bulletSpeed = 400;
//     this.fireRate = 250;
//
//     for (var i = 0; i < 32; i++)
//     {
//         this.add(new Bullet(game, 'bullet10'), true);
//     }
//
//     this.setAll('tracking', true)
//
//     return this;
//
// };
//
// Weapon.RPG.prototype = Object.create(Phaser.Group.prototype);
// Weapon.RPG.prototype.constructor = Weapon.RPG;
//
// Weapon.RPG.prototype.fire = function (source) {
//
//     if (this.game.time.time < this.nextFire) { return; }
//
//     var x = source.x + 10;
//     var y = source.y + 10;
//
//     this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, -700);
//     this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 700);
//
//     this.nextFire = this.game.time.time + this.fireRate;
//
// };

},{"../Bullet":8,"../Guid":10}],34:[function(require,module,exports){
'use strict';

var Bullet = require('../Bullet');
var Guid = require('../Guid');

var AK47 = function AK47(config) {
    Phaser.Group.call(this, config.game, config.game.world, 'AK-47', false, true, Phaser.Physics.ARCADE);

    //	Here we set-up our audio sprite
    this.fx = config.game.add.audio('AK47-sound');
    this.allowMultiple = true;

    this.damage = 22;
    this.nextFire = 0;
    this.bulletSpeed = 2300;
    this.fireRate = 160;

    for (var i = 0; i < 64; i++) {
        var bullet = new Bullet(config.game, 'bullet12', config.socket);
        bullet.bulletId = Guid();
        bullet.height = 2;
        bullet.width = 40;
        bullet.damage = 22;
        this.add(bullet, true);
    }

    return this;
};

AK47.prototype = Object.create(Phaser.Group.prototype);
AK47.prototype.constructor = AK47;

AK47.prototype.fire = function (player, socket, roomId, volume) {
    if (this.game.time.time < this.nextFire) return;

    var x = player.x + 15;
    var y = player.y + 30;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0, socket, roomId);
    this.setAll('tracking', true);

    this.nextFire = this.game.time.time + this.fireRate;
    this.fx.volume = .3 * volume;
    this.fx.play();
};

module.exports = AK47;

},{"../Bullet":8,"../Guid":10}],35:[function(require,module,exports){
'use strict';

module.exports = {
    "AK47": require('./AK47'),
    "Barrett": require('./Barrett'),
    "DesertEagle": require('./DesertEagle'),
    "M4A1": require('./M4A1'),
    "M500": require('./M500'),
    "Skorpion": require('./Skorpion'),
    "Aug": require('./Aug'),
    "RPG": require('./RPG'),
    "P90": require('./P90'),
    "G43": require('./G43')
};

},{"./AK47":25,"./Aug":26,"./Barrett":27,"./DesertEagle":28,"./G43":29,"./M4A1":30,"./M500":31,"./P90":32,"./RPG":33,"./Skorpion":34}],36:[function(require,module,exports){
'use strict';

var HighRuleDesert = {};

HighRuleDesert.create = function () {
    this.spawnPoints = [{
        x: 815,
        y: 1730
    }, {
        x: 3380,
        y: 1030
    }, {
        x: 4437,
        y: 1550
    }, {
        x: 6690,
        y: 1860
    }, {
        x: 3832,
        y: 3350
    }, {
        x: 3775,
        y: 2400
    }, {
        x: 2420,
        y: 2900
    }];

    HighRuleDesert.createSkySprite.call(this);
    HighRuleDesert.createPlatforms.call(this);
    HighRuleDesert.createLedges.call(this);

    this.platforms.setAll('body.immovable', true);
    this.platforms.setAll('body.allowGravity', false);
};

HighRuleDesert.createSkySprite = function () {
    this.skysprite = this.add.tileSprite(0, this.game.world.height - 3930, this.game.world.width, this.game.world.height, 'map-bg');
};

HighRuleDesert.createPlatforms = function () {
    this.platforms = this.add.group();
    this.platforms.enableBody = true;
};

HighRuleDesert.getRandomSpawnPoint = function () {
    return _.sample(this.spawnPoints);
};

HighRuleDesert.createLedges = function () {
    var _this = this;

    var ledges = [{ id: 1, x: 2145, y: 2102, width: 135, height: 40 }, { id: 2, x: 2613, y: 1134, width: 1100, height: 112 }, { id: 3, x: 3657, y: 3483, width: 545, height: 500 }, { id: 4, x: 5217, y: 1975, width: 380, height: 600 }, { id: 5, x: 422, y: this.game.world.height - 2105, width: 1150, height: 300 }, { id: 6, x: 1555, y: this.game.world.height - 2180, width: 270, height: 730 }, { id: 7, x: 1820, y: this.game.world.height - 2180, width: 470, height: 6 }, { id: 8, x: 2275, y: this.game.world.height - 2180, width: 320, height: 500 }, { id: 9, x: 2595, y: this.game.world.height - 2260, width: 1120, height: 260 }, { id: 10, x: 4299, y: 1658, width: 375, height: 1300 }, { id: 11, x: 1825, y: 2335, width: 160, height: 152 }, { id: 12, x: 5644, y: 1612, width: 330, height: 20 }, { id: 13, x: 4673, y: 2054, width: 570, height: 254 }, { id: 14, x: 2948, y: 3174, width: 380, height: 300 }, { id: 15, x: 3965, y: 2070, width: 341, height: 700 }, { id: 16, x: 1909, y: 3008, width: 1040, height: 500 }, { id: 17, x: 6632, y: 1644, width: 385, height: 37 }, { id: 18, x: 6632, y: 1234, width: 385, height: 37 }, { id: 19, x: 5590, y: 2075, width: 1570, height: 600 }, { id: 20, x: 6981, y: 2050, width: 450, height: 167 }, { id: 21, x: 3660, y: 2438, width: 310, height: 500 }, { id: 22, x: 3290, y: 2636, width: 400, height: 300 }];

    ledges.forEach(function (ledge) {
        // var newLedge = this.platforms.create(ledge.x, ledge.y, 'ground')
        var newLedge = _this.platforms.create(ledge.x, ledge.y);
        newLedge.height = ledge.height;
        newLedge.width = ledge.width;

        // Debug stuff
        // newLedge.alpha = 0.2
        // let style = { font: "20px Arial", fill: "#ff0044", align: "center", backgroundColor: "#ffff00" }
        // let text = this.game.add.text(ledge.x, ledge.y, ledge.id, style)
        // text.alpha = 0.2
    });
};

module.exports = HighRuleDesert;

},{}],37:[function(require,module,exports){
'use strict';

var assign = require('es5-ext/object/assign'),
    normalizeOpts = require('es5-ext/object/normalize-options'),
    isCallable = require('es5-ext/object/is-callable'),
    contains = require('es5-ext/string/#/contains'),
    d;

d = module.exports = function (dscr, value /*, options*/) {
	var c, e, w, options, desc;
	if (arguments.length < 2 || typeof dscr !== 'string') {
		options = value;
		value = dscr;
		dscr = null;
	} else {
		options = arguments[2];
	}
	if (dscr == null) {
		c = w = true;
		e = false;
	} else {
		c = contains.call(dscr, 'c');
		e = contains.call(dscr, 'e');
		w = contains.call(dscr, 'w');
	}

	desc = { value: value, configurable: c, enumerable: e, writable: w };
	return !options ? desc : assign(normalizeOpts(options), desc);
};

d.gs = function (dscr, get, set /*, options*/) {
	var c, e, options, desc;
	if (typeof dscr !== 'string') {
		options = set;
		set = get;
		get = dscr;
		dscr = null;
	} else {
		options = arguments[3];
	}
	if (get == null) {
		get = undefined;
	} else if (!isCallable(get)) {
		options = get;
		get = set = undefined;
	} else if (set == null) {
		set = undefined;
	} else if (!isCallable(set)) {
		options = set;
		set = undefined;
	}
	if (dscr == null) {
		c = true;
		e = false;
	} else {
		c = contains.call(dscr, 'c');
		e = contains.call(dscr, 'e');
	}

	desc = { get: get, set: set, configurable: c, enumerable: e };
	return !options ? desc : assign(normalizeOpts(options), desc);
};

},{"es5-ext/object/assign":38,"es5-ext/object/is-callable":41,"es5-ext/object/normalize-options":45,"es5-ext/string/#/contains":48}],38:[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')() ? Object.assign : require('./shim');

},{"./is-implemented":39,"./shim":40}],39:[function(require,module,exports){
'use strict';

module.exports = function () {
	var assign = Object.assign,
	    obj;
	if (typeof assign !== 'function') return false;
	obj = { foo: 'raz' };
	assign(obj, { bar: 'dwa' }, { trzy: 'trzy' });
	return obj.foo + obj.bar + obj.trzy === 'razdwatrzy';
};

},{}],40:[function(require,module,exports){
'use strict';

var keys = require('../keys'),
    value = require('../valid-value'),
    max = Math.max;

module.exports = function (dest, src /*, …srcn*/) {
	var error,
	    i,
	    l = max(arguments.length, 2),
	    assign;
	dest = Object(value(dest));
	assign = function assign(key) {
		try {
			dest[key] = src[key];
		} catch (e) {
			if (!error) error = e;
		}
	};
	for (i = 1; i < l; ++i) {
		src = arguments[i];
		keys(src).forEach(assign);
	}
	if (error !== undefined) throw error;
	return dest;
};

},{"../keys":42,"../valid-value":47}],41:[function(require,module,exports){
// Deprecated

'use strict';

module.exports = function (obj) {
  return typeof obj === 'function';
};

},{}],42:[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')() ? Object.keys : require('./shim');

},{"./is-implemented":43,"./shim":44}],43:[function(require,module,exports){
'use strict';

module.exports = function () {
	try {
		Object.keys('primitive');
		return true;
	} catch (e) {
		return false;
	}
};

},{}],44:[function(require,module,exports){
'use strict';

var keys = Object.keys;

module.exports = function (object) {
	return keys(object == null ? object : Object(object));
};

},{}],45:[function(require,module,exports){
'use strict';

var forEach = Array.prototype.forEach,
    create = Object.create;

var process = function process(src, obj) {
	var key;
	for (key in src) {
		obj[key] = src[key];
	}
};

module.exports = function (options /*, …options*/) {
	var result = create(null);
	forEach.call(arguments, function (options) {
		if (options == null) return;
		process(Object(options), result);
	});
	return result;
};

},{}],46:[function(require,module,exports){
'use strict';

module.exports = function (fn) {
	if (typeof fn !== 'function') throw new TypeError(fn + " is not a function");
	return fn;
};

},{}],47:[function(require,module,exports){
'use strict';

module.exports = function (value) {
	if (value == null) throw new TypeError("Cannot use null or undefined");
	return value;
};

},{}],48:[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')() ? String.prototype.contains : require('./shim');

},{"./is-implemented":49,"./shim":50}],49:[function(require,module,exports){
'use strict';

var str = 'razdwatrzy';

module.exports = function () {
	if (typeof str.contains !== 'function') return false;
	return str.contains('dwa') === true && str.contains('foo') === false;
};

},{}],50:[function(require,module,exports){
'use strict';

var indexOf = String.prototype.indexOf;

module.exports = function (searchString /*, position*/) {
	return indexOf.call(this, searchString, arguments[1]) > -1;
};

},{}],51:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var d = require('d'),
    callable = require('es5-ext/object/valid-callable'),
    apply = Function.prototype.apply,
    call = Function.prototype.call,
    create = Object.create,
    defineProperty = Object.defineProperty,
    defineProperties = Object.defineProperties,
    hasOwnProperty = Object.prototype.hasOwnProperty,
    descriptor = { configurable: true, enumerable: false, writable: true },
    on,
    _once2,
    off,
    emit,
    methods,
    descriptors,
    base;

on = function on(type, listener) {
	var data;

	callable(listener);

	if (!hasOwnProperty.call(this, '__ee__')) {
		data = descriptor.value = create(null);
		defineProperty(this, '__ee__', descriptor);
		descriptor.value = null;
	} else {
		data = this.__ee__;
	}
	if (!data[type]) data[type] = listener;else if (_typeof(data[type]) === 'object') data[type].push(listener);else data[type] = [data[type], listener];

	return this;
};

_once2 = function once(type, listener) {
	var _once, self;

	callable(listener);
	self = this;
	on.call(this, type, _once = function once() {
		off.call(self, type, _once);
		apply.call(listener, this, arguments);
	});

	_once.__eeOnceListener__ = listener;
	return this;
};

off = function off(type, listener) {
	var data, listeners, candidate, i;

	callable(listener);

	if (!hasOwnProperty.call(this, '__ee__')) return this;
	data = this.__ee__;
	if (!data[type]) return this;
	listeners = data[type];

	if ((typeof listeners === 'undefined' ? 'undefined' : _typeof(listeners)) === 'object') {
		for (i = 0; candidate = listeners[i]; ++i) {
			if (candidate === listener || candidate.__eeOnceListener__ === listener) {
				if (listeners.length === 2) data[type] = listeners[i ? 0 : 1];else listeners.splice(i, 1);
			}
		}
	} else {
		if (listeners === listener || listeners.__eeOnceListener__ === listener) {
			delete data[type];
		}
	}

	return this;
};

emit = function emit(type) {
	var i, l, listener, listeners, args;

	if (!hasOwnProperty.call(this, '__ee__')) return;
	listeners = this.__ee__[type];
	if (!listeners) return;

	if ((typeof listeners === 'undefined' ? 'undefined' : _typeof(listeners)) === 'object') {
		l = arguments.length;
		args = new Array(l - 1);
		for (i = 1; i < l; ++i) {
			args[i - 1] = arguments[i];
		}listeners = listeners.slice();
		for (i = 0; listener = listeners[i]; ++i) {
			apply.call(listener, this, args);
		}
	} else {
		switch (arguments.length) {
			case 1:
				call.call(listeners, this);
				break;
			case 2:
				call.call(listeners, this, arguments[1]);
				break;
			case 3:
				call.call(listeners, this, arguments[1], arguments[2]);
				break;
			default:
				l = arguments.length;
				args = new Array(l - 1);
				for (i = 1; i < l; ++i) {
					args[i - 1] = arguments[i];
				}
				apply.call(listeners, this, args);
		}
	}
};

methods = {
	on: on,
	once: _once2,
	off: off,
	emit: emit
};

descriptors = {
	on: d(on),
	once: d(_once2),
	off: d(off),
	emit: d(emit)
};

base = defineProperties({}, descriptors);

module.exports = exports = function exports(o) {
	return o == null ? create(base) : defineProperties(Object(o), descriptors);
};
exports.methods = methods;

},{"d":37,"es5-ext/object/valid-callable":46}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvYXBwLmpzIiwiYXNzZXRzL2pzL2NvcmUvY3JlYXRlLmpzIiwiYXNzZXRzL2pzL2NvcmUvaW5kZXguanMiLCJhc3NldHMvanMvY29yZS9pbml0LmpzIiwiYXNzZXRzL2pzL2NvcmUvcHJlbG9hZC5qcyIsImFzc2V0cy9qcy9jb3JlL3VwZGF0ZS5qcyIsImFzc2V0cy9qcy9nYW1lLmpzIiwiYXNzZXRzL2pzL2xpYi9CdWxsZXQuanMiLCJhc3NldHMvanMvbGliL0V2ZW50SGFuZGxlci5qcyIsImFzc2V0cy9qcy9saWIvR3VpZC5qcyIsImFzc2V0cy9qcy9saWIvSW5wdXRIYW5kbGVyLmpzIiwiYXNzZXRzL2pzL2xpYi9QbGF5ZXJCeUlkLmpzIiwiYXNzZXRzL2pzL2xpYi9SZW1vdGVQbGF5ZXIuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9pbmRleC5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL29uQnVsbGV0RmlyZWQuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vbkJ1bGxldFJlbW92ZWQuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vbk1vdmVQbGF5ZXIuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vblBsYXllckRhbWFnZWQuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vblBsYXllclJlc3Bhd24uanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vblJlbW92ZVBsYXllci5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL29uU29ja2V0Q29ubmVjdGVkLmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvb25Tb2NrZXREaXNjb25uZWN0LmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvb25VcGRhdGVQbGF5ZXJzLmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvc2V0RXZlbnRIYW5kbGVycy5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9BSzQ3LmpzIiwiYXNzZXRzL2pzL2xpYi9XZWFwb25zL0F1Zy5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9CYXJyZXR0LmpzIiwiYXNzZXRzL2pzL2xpYi9XZWFwb25zL0Rlc2VydEVhZ2xlLmpzIiwiYXNzZXRzL2pzL2xpYi9XZWFwb25zL0c0My5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9NNEExLmpzIiwiYXNzZXRzL2pzL2xpYi9XZWFwb25zL001MDAuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvUDkwLmpzIiwiYXNzZXRzL2pzL2xpYi9XZWFwb25zL1JQRy5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9Ta29ycGlvbi5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9pbmRleC5qcyIsImFzc2V0cy9qcy9tYXBzL0hpZ2hSdWxlRGVzZXJ0LmpzIiwibm9kZV9tb2R1bGVzL2QvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZXM1LWV4dC9vYmplY3QvYXNzaWduL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2VzNS1leHQvb2JqZWN0L2Fzc2lnbi9pcy1pbXBsZW1lbnRlZC5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L29iamVjdC9hc3NpZ24vc2hpbS5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L29iamVjdC9pcy1jYWxsYWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L29iamVjdC9rZXlzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2VzNS1leHQvb2JqZWN0L2tleXMvaXMtaW1wbGVtZW50ZWQuanMiLCJub2RlX21vZHVsZXMvZXM1LWV4dC9vYmplY3Qva2V5cy9zaGltLmpzIiwibm9kZV9tb2R1bGVzL2VzNS1leHQvb2JqZWN0L25vcm1hbGl6ZS1vcHRpb25zLmpzIiwibm9kZV9tb2R1bGVzL2VzNS1leHQvb2JqZWN0L3ZhbGlkLWNhbGxhYmxlLmpzIiwibm9kZV9tb2R1bGVzL2VzNS1leHQvb2JqZWN0L3ZhbGlkLXZhbHVlLmpzIiwibm9kZV9tb2R1bGVzL2VzNS1leHQvc3RyaW5nLyMvY29udGFpbnMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZXM1LWV4dC9zdHJpbmcvIy9jb250YWlucy9pcy1pbXBsZW1lbnRlZC5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L3N0cmluZy8jL2NvbnRhaW5zL3NoaW0uanMiLCJub2RlX21vZHVsZXMvZXZlbnQtZW1pdHRlci9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztBQ0NBLFFBQVEsUUFBUjs7O0FDREE7O0FBSUE7Ozs7OztBQUZBLElBQUksaUJBQWlCLFFBQVEsd0JBQVIsQ0FBakI7QUFDSixJQUFJLFVBQVUsUUFBUSxnQkFBUixDQUFWOzs7QUFHSixJQUFJLGFBQWEsSUFBYjtBQUNKLElBQUksY0FBYyxJQUFkOztBQUVKLE9BQU8sT0FBUCxHQUFpQixZQUFXOzs7O0FBRXhCLFNBQUssU0FBTCxHQUFpQixHQUFqQixDQUZ3QjtBQUd4QixTQUFLLFlBQUwsR0FBb0IsSUFBcEIsQ0FId0I7QUFJeEIsU0FBSyxJQUFMLEdBQVksSUFBWixDQUp3QjtBQUt4QixTQUFLLE9BQUwsR0FBZSxJQUFmLENBTHdCO0FBTXhCLFNBQUssVUFBTCxHQUFrQixDQUFDLEdBQUQsQ0FOTTtBQU94QixTQUFLLGNBQUwsR0FBc0IsQ0FBQyxJQUFELENBUEU7O0FBU3hCLFNBQUssTUFBTCxHQUFjLEdBQUcsT0FBSCxFQUFkLENBVHdCO0FBVXhCLFNBQUssT0FBTCxHQUFlLEVBQWYsQ0FWd0I7QUFXeEIsU0FBSyxNQUFMLEdBQWMsRUFBZDs7O0FBWHdCLFFBY3hCLENBQUssT0FBTCxDQUFhLFdBQWIsQ0FBeUIsT0FBTyxPQUFQLENBQWUsTUFBZixDQUF6QixDQWR3Qjs7QUFnQnhCLFNBQUssS0FBTCxDQUFXLFNBQVgsQ0FBcUIsQ0FBckIsRUFBd0IsQ0FBeEIsRUFBMkIsVUFBM0IsRUFBdUMsV0FBdkM7OztBQWhCd0IsUUFtQnhCLENB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Q0MsU0FBSyxJQUFMLENBQVUsU0FBVixFQUFxQixJQUFyQixFQUEyQixVQUFVLENBQVYsQ0FBM0IsRUFBeUMsVUFBVSxDQUFWLENBQXpDLEVBREQ7QUFFQyxVQUZEO0FBUEE7QUFXQyxRQUFJLFVBQVUsTUFBVixDQURMO0FBRUMsV0FBTyxJQUFJLEtBQUosQ0FBVSxJQUFJLENBQUosQ0FBakIsQ0FGRDtBQUdDLFNBQUssSUFBSSxDQUFKLEVBQU8sSUFBSSxDQUFKLEVBQU8sRUFBRSxDQUFGLEVBQUs7QUFDdkIsVUFBSyxJQUFJLENBQUosQ0FBTCxHQUFjLFVBQVUsQ0FBVixDQUFkLENBRHVCO0tBQXhCO0FBR0EsVUFBTSxJQUFOLENBQVcsU0FBWCxFQUFzQixJQUF0QixFQUE0QixJQUE1QixFQU5EO0FBVkEsR0FETTtFQVRQO0NBUE07O0FBc0NQLFVBQVU7QUFDVCxLQUFJLEVBQUo7QUFDQSxPQUFNLE1BQU47QUFDQSxNQUFLLEdBQUw7QUFDQSxPQUFNLElBQU47Q0FKRDs7QUFPQSxjQUFjO0FBQ2IsS0FBSSxFQUFFLEVBQUYsQ0FBSjtBQUNBLE9BQU0sRUFBRSxNQUFGLENBQU47QUFDQSxNQUFLLEVBQUUsR0FBRixDQUFMO0FBQ0EsT0FBTSxFQUFFLElBQUYsQ0FBTjtDQUpEOztBQU9BLE9BQU8saUJBQWlCLEVBQWpCLEVBQXFCLFdBQXJCLENBQVA7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLFVBQVUsaUJBQVUsQ0FBVixFQUFhO0FBQ3ZDLFFBQU8sQ0FBQyxJQUFLLElBQUwsR0FBYSxPQUFPLElBQVAsQ0FBZCxHQUE2QixpQkFBaUIsT0FBTyxDQUFQLENBQWpCLEVBQTRCLFdBQTVCLENBQTdCLENBRGdDO0NBQWI7QUFHM0IsUUFBUSxPQUFSLEdBQWtCLE9BQWxCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIHJlcXVpcmUoJy4vdWknKVxucmVxdWlyZSgnLi9nYW1lJylcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgSGlnaFJ1bGVEZXNlcnQgPSByZXF1aXJlKCcuLi9tYXBzL0hpZ2hSdWxlRGVzZXJ0JylcbmxldCBXZWFwb25zID0gcmVxdWlyZSgnLi4vbGliL1dlYXBvbnMnKVxuaW1wb3J0IEV2ZW50SGFuZGxlciBmcm9tICcuLi9saWIvRXZlbnRIYW5kbGVyJ1xuXG5sZXQgd29ybGRXaWR0aCA9IDgwMDBcbmxldCB3b3JsZEhlaWdodCA9IDM5NjZcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBEZWZpbmUgbW92ZW1lbnQgY29uc3RhbnRzXG4gICAgdGhpcy5NQVhfU1BFRUQgPSA1NTBcbiAgICB0aGlzLkFDQ0VMRVJBVElPTiA9IDE5NjBcbiAgICB0aGlzLkRSQUcgPSAxNTAwXG4gICAgdGhpcy5HUkFWSVRZID0gMTkwMFxuICAgIHRoaXMuSlVNUF9TUEVFRCA9IC04NTBcbiAgICB0aGlzLkpVTVBfSkVUX1NQRUVEID0gLTI2MDBcblxuICAgIHRoaXMuc29ja2V0ID0gaW8uY29ubmVjdCgpXG4gICAgdGhpcy5lbmVtaWVzID0gW11cbiAgICB0aGlzLnZvbHVtZSA9IC41XG5cbiAgICAvLyAgV2UncmUgZ29pbmcgdG8gYmUgdXNpbmcgcGh5c2ljcywgc28gZW5hYmxlIHRoZSBBcmNhZGUgUGh5c2ljcyBzeXN0ZW1cbiAgICB0aGlzLnBoeXNpY3Muc3RhcnRTeXN0ZW0oUGhhc2VyLlBoeXNpY3MuQVJDQURFKVxuXG4gICAgdGhpcy53b3JsZC5zZXRCb3VuZHMoMCwgMCwgd29ybGRXaWR0aCwgd29ybGRIZWlnaHQpXG5cbiAgICAvLyBTY2FsZSBnYW1lIG9uIHdpbmRvdyByZXNpemVcbiAgICB0aGlzLmdhbWUuc2NhbGUuc2NhbGVNb2RlID0gUGhhc2VyLlNjYWxlTWFuYWdlci5SRVNJWkVcbiAgICB0aGlzLmdhbWUuc2NhbGUuc2V0U2hvd0FsbCgpXG4gICAgdGhpcy5nYW1lLnNjYWxlLnJlZnJlc2goKVxuXG5cbiAgICAvKipcbiAgICAgKiBNYXBcbiAgICAgKi9cbiAgICBIaWdoUnVsZURlc2VydC5jcmVhdGUuY2FsbCh0aGlzKVxuXG5cbiAgICAvKipcbiAgICAgKiBQbGF5ZXIgU2V0dGluZ3NcbiAgICAgKi9cbiAgICBsZXQgc3Bhd25Qb2ludCA9IEhpZ2hSdWxlRGVzZXJ0LmdldFJhbmRvbVNwYXduUG9pbnQuY2FsbCh0aGlzKVxuICAgIHRoaXMucGxheWVyID0gdGhpcy5hZGQuc3ByaXRlKHNwYXduUG9pbnQueCwgc3Bhd25Qb2ludC55LCAnY29tbWFuZG8nKVxuICAgIHRoaXMucGxheWVyLnNjYWxlLnNldFRvKC4yNylcbiAgICB0aGlzLnBsYXllci5hbmNob3Iuc2V0VG8oLjUpXG5cbiAgICAvLyAgV2UgbmVlZCB0byBlbmFibGUgcGh5c2ljcyBvbiB0aGUgcGxheWVyXG4gICAgdGhpcy5waHlzaWNzLmFyY2FkZS5lbmFibGUodGhpcy5wbGF5ZXIpXG5cbiAgICAvLyBFbmFibGUgcGh5c2ljcyBvbiB0aGUgcGxheWVyXG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuZW5hYmxlKHRoaXMucGxheWVyLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpXG5cbiAgICAvLyBNYWtlIHBsYXllciBjb2xsaWRlIHdpdGggd29ybGQgYm91bmRhcmllcyBzbyBoZSBkb2Vzbid0IGxlYXZlIHRoZSBzdGFnZVxuICAgIHRoaXMucGxheWVyLmJvZHkuY29sbGlkZVdvcmxkQm91bmRzID0gdHJ1ZVxuXG4gICAgLy8gU2V0IHBsYXllciBtaW5pbXVtIGFuZCBtYXhpbXVtIG1vdmVtZW50IHNwZWVkXG4gICAgdGhpcy5wbGF5ZXIuYm9keS5tYXhWZWxvY2l0eS5zZXRUbyh0aGlzLk1BWF9TUEVFRCwgdGhpcy5NQVhfU1BFRUQgKiAxMCkgLy8geCwgeVxuXG4gICAgLy8gQWRkIGRyYWcgdG8gdGhlIHBsYXllciB0aGF0IHNsb3dzIHRoZW0gZG93biB3aGVuIHRoZXkgYXJlIG5vdCBhY2NlbGVyYXRpbmdcbiAgICB0aGlzLnBsYXllci5ib2R5LmRyYWcuc2V0VG8odGhpcy5EUkFHLCAwKSAvLyB4LCB5XG4gICAgdGhpcy5wbGF5ZXIuYm9keS5zZXRTaXplKDIzMCwgMjkwLCAtMTAsIDApXG4gICAgdGhpcy5wbGF5ZXIubWV0YSA9IHtcbiAgICAgICAgaGVhbHRoOiAxMDBcbiAgICB9XG5cbiAgICAvLyBTaW5jZSB3ZSdyZSBqdW1waW5nIHdlIG5lZWQgZ3Jhdml0eVxuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5ncmF2aXR5LnkgPSB0aGlzLkdSQVZJVFlcblxuICAgIC8vIEZsYWcgdG8gdHJhY2sgaWYgdGhlIGp1bXAgYnV0dG9uIGlzIHByZXNzZWRcbiAgICB0aGlzLmp1bXBpbmcgPSBmYWxzZVxuXG4gICAgLy8gIE91ciB0d28gYW5pbWF0aW9ucywgd2Fsa2luZyBsZWZ0IGFuZCByaWdodC5cbiAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLmFkZCgnbGVmdCcsIFswLCAxLCAyLCAzLCA0LCA1XSwgMTAsIHRydWUpXG4gICAgdGhpcy5wbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ3JpZ2h0JywgWzgsIDksIDEwLCAxMSwgMTIsIDEzXSwgMTAsIHRydWUpXG5cbiAgICB0aGlzLnBsYXllci5tZXRhID0ge1xuICAgICAgICBoZWFsdGg6IDEwMFxuICAgIH1cblxuICAgIHRoaXMubGVmdEFybUdyb3VwID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpXG4gICAgdGhpcy5yaWdodEFybUdyb3VwID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpXG4gICAgdGhpcy5oZWFkR3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKClcbiAgICB0aGlzLnRvcnNvR3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKClcblxuICAgIC8vIFRvcnNvXG4gICAgdGhpcy50b3Jzb1Nwcml0ZSA9IHRoaXMuZ2FtZS5hZGQuc3ByaXRlKC0zNywgLTEwNSwgJ3RvcnNvJylcbiAgICB0aGlzLnRvcnNvU3ByaXRlLnNjYWxlLnNldFRvKDEuOClcbiAgICB0aGlzLnRvcnNvR3JvdXAuYWRkKHRoaXMudG9yc29TcHJpdGUpXG5cbiAgICAvLyBIZWFkXG4gICAgdGhpcy5oZWFkU3ByaXRlID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUoMCwgLTE0OCwgJ2hlYWQnKVxuICAgIHRoaXMuaGVhZFNwcml0ZS5zY2FsZS5zZXRUbygxLjgpXG4gICAgdGhpcy5oZWFkR3JvdXAuYWRkKHRoaXMuaGVhZFNwcml0ZSlcblxuICAgIC8vIExlZnQgYXJtXG4gICAgdGhpcy5sZWZ0QXJtU3ByaXRlID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUoMCwgMCwgJ2xlZnQtYXJtJylcbiAgICB0aGlzLmxlZnRBcm1TcHJpdGUuYW5jaG9yLnNldFRvKC4yLCAuMilcbiAgICB0aGlzLmxlZnRBcm1TcHJpdGUuc2NhbGUuc2V0VG8oMS42KVxuICAgIHRoaXMubGVmdEFybVNwcml0ZS5yb3RhdGlvbiA9IDgwLjFcbiAgICB0aGlzLmxlZnRBcm1Hcm91cC5hZGQodGhpcy5sZWZ0QXJtU3ByaXRlKVxuXG4gICAgLy8gR3VuXG4gICAgdGhpcy5hazQ3U3ByaXRlID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUoMTIsIDE5LCAnYWs0NycpXG4gICAgdGhpcy5hazQ3U3ByaXRlLnNjYWxlLnNldFRvKDEuMylcbiAgICB0aGlzLmFrNDdTcHJpdGUucm90YXRpb24gPSA4MC4xNVxuXG4gICAgLy8gUmlnaHQgYXJtXG4gICAgdGhpcy5yaWdodEFybUdyb3VwLmFkZCh0aGlzLmFrNDdTcHJpdGUpXG4gICAgdGhpcy5yaWdodEFybVNwcml0ZSA9IHRoaXMuZ2FtZS5hZGQuc3ByaXRlKDAsIDAsICdyaWdodC1hcm0nKVxuICAgIHRoaXMucmlnaHRBcm1TcHJpdGUuYW5jaG9yLnNldFRvKC4yLCAuMjQpXG4gICAgdGhpcy5yaWdodEFybVNwcml0ZS5zY2FsZS5zZXRUbygxLjcpXG4gICAgdGhpcy5yaWdodEFybVNwcml0ZS5yb3RhdGlvbiA9IDgwLjFcbiAgICB0aGlzLnJpZ2h0QXJtR3JvdXAuYWRkKHRoaXMucmlnaHRBcm1TcHJpdGUpXG5cbiAgICB0aGlzLnBsYXllci5hZGRDaGlsZCh0aGlzLmxlZnRBcm1Hcm91cClcbiAgICB0aGlzLmxlZnRBcm1Hcm91cC5waXZvdC54ID0gMFxuICAgIHRoaXMubGVmdEFybUdyb3VwLnBpdm90LnkgPSAwXG4gICAgdGhpcy5sZWZ0QXJtR3JvdXAueCA9IDQ1XG4gICAgdGhpcy5sZWZ0QXJtR3JvdXAueSA9IC03MFxuXG4gICAgdGhpcy5wbGF5ZXIuYWRkQ2hpbGQodGhpcy50b3Jzb0dyb3VwKVxuICAgIHRoaXMucGxheWVyLmFkZENoaWxkKHRoaXMuaGVhZEdyb3VwKVxuXG4gICAgdGhpcy5wbGF5ZXIuYWRkQ2hpbGQodGhpcy5yaWdodEFybUdyb3VwKVxuICAgIHRoaXMucmlnaHRBcm1Hcm91cC5waXZvdC54ID0gMFxuICAgIHRoaXMucmlnaHRBcm1Hcm91cC5waXZvdC55ID0gMFxuICAgIHRoaXMucmlnaHRBcm1Hcm91cC54ID0gLTI1XG4gICAgdGhpcy5yaWdodEFybUdyb3VwLnkgPSAtNjVcblxuXG5cbiAgICBjb25zb2xlLmxvZygndGhpcy5wbGF5ZXInLCB0aGlzLnBsYXllcilcblxuXG4gICAgLyoqXG4gICAgICogV2VhcG9uc1xuICAgICAqL1xuICAgIHRoaXMuY3VycmVudFdlYXBvbiA9IDBcbiAgICB0aGlzLndlYXBvbnMgPSBbXG4gICAgICAgIG5ldyBXZWFwb25zLkFLNDcoe1xuICAgICAgICAgICAgZ2FtZTogdGhpcy5nYW1lXG4gICAgICAgIH0pLFxuICAgICAgICBuZXcgV2VhcG9ucy5NNTAwKHtcbiAgICAgICAgICAgIGdhbWU6IHRoaXMuZ2FtZVxuICAgICAgICB9KSxcbiAgICAgICAgbmV3IFdlYXBvbnMuU2tvcnBpb24oe1xuICAgICAgICAgICAgZ2FtZTogdGhpcy5nYW1lXG4gICAgICAgIH0pLFxuICAgICAgICBuZXcgV2VhcG9ucy5BdWcoe1xuICAgICAgICAgICAgZ2FtZTogdGhpcy5nYW1lXG4gICAgICAgIH0pLFxuICAgICAgICBuZXcgV2VhcG9ucy5QOTAoe1xuICAgICAgICAgICAgZ2FtZTogdGhpcy5nYW1lXG4gICAgICAgIH0pLFxuICAgICAgICBuZXcgV2VhcG9ucy5EZXNlcnRFYWdsZSh7XG4gICAgICAgICAgICBnYW1lOiB0aGlzLmdhbWVcbiAgICAgICAgfSksXG4gICAgICAgIG5ldyBXZWFwb25zLkc0Myh7XG4gICAgICAgICAgICBnYW1lOiB0aGlzLmdhbWVcbiAgICAgICAgfSksXG4gICAgICAgIG5ldyBXZWFwb25zLk00QTEoe1xuICAgICAgICAgICAgZ2FtZTogdGhpcy5nYW1lXG4gICAgICAgIH0pLFxuICAgICAgICBuZXcgV2VhcG9ucy5CYXJyZXR0KHtcbiAgICAgICAgICAgIGdhbWU6IHRoaXMuZ2FtZVxuICAgICAgICB9KSxcbiAgICAgICAgbmV3IFdlYXBvbnMuUlBHKHtcbiAgICAgICAgICAgIGdhbWU6IHRoaXMuZ2FtZVxuICAgICAgICB9KSxcbiAgICBdXG5cblxuICAgIC8qKlxuICAgICAqIFRleHRcbiAgICAgKi9cbiAgICBsZXQgdGV4dFN0eWxlcyA9IHsgZm9udFNpemU6ICcxNHB4JywgZmlsbDogJyMwMDAnIH1cblxuICAgIEV2ZW50SGFuZGxlci5lbWl0KCdzY29yZSB1cGRhdGUnLCAnJylcbiAgICBFdmVudEhhbmRsZXIuZW1pdCgnaGVhbHRoIHVwZGF0ZScsICcnKVxuICAgIEV2ZW50SGFuZGxlci5vbigndm9sdW1lIHVwZGF0ZScsIChkYXRhKSA9PiB7XG4gICAgICAgIHRoaXMudm9sdW1lID0gZGF0YS52b2x1bWVcbiAgICB9KVxuXG4gICAgdGhpcy5wb3NpdGlvblRleHQgPSB0aGlzLmFkZC50ZXh0KDI1LCAyNSwgYCR7dGhpcy5nYW1lLmlucHV0Lm1vdXNlUG9pbnRlci54fSwke3RoaXMuZ2FtZS5pbnB1dC5tb3VzZVBvaW50ZXIueX1gLCB0ZXh0U3R5bGVzKVxuICAgIHRoaXMucG9zaXRpb25UZXh0LmZpeGVkVG9DYW1lcmEgPSB0cnVlXG5cblxuICAgIC8qKlxuICAgICAqIENhbWVyYSBTZXR0aW5nc1xuICAgICAqL1xuICAgIHRoaXMuY2FtZXJhLmZvbGxvdyh0aGlzLnBsYXllcilcblxuXG4gICAgLyoqXG4gICAgICogUmVzaXppbmcgRXZlbnRzXG4gICAgICovXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICgpID0+IHtcbiAgICAgICAgdGhpcy5nYW1lLnNjYWxlLnJlZnJlc2goKVxuICAgICAgICB0aGlzLmdhbWUuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0XG4gICAgICAgIHRoaXMuZ2FtZS53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXG4gICAgfSlcblxuXG4gICAgLyoqXG4gICAgICogRW5lbXkgQnVsbGV0c1xuICAgICAqL1xuICAgIHRoaXMuZW5lbXlCdWxsZXRzID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpXG5cblxuICAgIC8qKlxuICAgICAqIFN0YXJ0IGxpc3RlbmluZyBmb3IgZXZlbnRzXG4gICAgICovXG4gICAgdGhpcy5zZXRFdmVudEhhbmRsZXJzKClcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBjcmVhdGU6IHJlcXVpcmUoJy4vY3JlYXRlJyksXG4gICAgaW5pdDogcmVxdWlyZSgnLi9pbml0JyksXG4gICAgcHJlbG9hZDogcmVxdWlyZSgnLi9wcmVsb2FkJyksXG4gICAgdXBkYXRlOiByZXF1aXJlKCcuL3VwZGF0ZScpXG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmdhbWUucmVuZGVyZXIucmVuZGVyU2Vzc2lvbi5yb3VuZFBpeGVscyA9IHRydWVcbiAgICB0aGlzLmdhbWUuc3RhZ2UuZGlzYWJsZVZpc2liaWxpdHlDaGFuZ2UgPSB0cnVlXG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmxvYWQuaW1hZ2UoJ21hcC1iZycsICcvaW1hZ2VzL2hpZ2gtcnVsZS1kZXNlcnQucG5nJylcbiAgICB0aGlzLmxvYWQuaW1hZ2UoJ2dyb3VuZCcsICcvaW1hZ2VzL3BsYXRmb3JtLnBuZycpXG4gICAgdGhpcy5sb2FkLmltYWdlKCdidWxsZXQxMicsICcvaW1hZ2VzL2J1bGxldDEyLnBuZycpXG5cbiAgICB0aGlzLmxvYWQuc3ByaXRlc2hlZXQoJ2R1ZGUnLCAnL2ltYWdlcy9kdWRlLnBuZycsIDMyLCA0OClcbiAgICB0aGlzLmxvYWQuc3ByaXRlc2hlZXQoJ2NvbW1hbmRvJywgJy9pbWFnZXMvY29tbWFuZG8ucG5nJywgMzAwLCAzMTUpXG4gICAgdGhpcy5sb2FkLnNwcml0ZXNoZWV0KCdlbmVteScsICcvaW1hZ2VzL2R1ZGUucG5nJywgMzIsIDQ4KVxuXG4gICAgdGhpcy5sb2FkLmltYWdlKCdhazQ3JywgJy9pbWFnZXMvZ3Vucy9TcHJfQUs0Ny5wbmcnKVxuICAgIHRoaXMubG9hZC5pbWFnZSgncmlnaHQtYXJtJywgJy9pbWFnZXMvYm9keS9yaWdodC1hcm0ucG5nJylcbiAgICB0aGlzLmxvYWQuaW1hZ2UoJ2xlZnQtYXJtJywgJy9pbWFnZXMvYm9keS9sZWZ0LWFybS5wbmcnKVxuICAgIHRoaXMubG9hZC5pbWFnZSgnaGVhZCcsICcvaW1hZ2VzL2JvZHkvaGVhZC5wbmcnKVxuICAgIHRoaXMubG9hZC5pbWFnZSgndG9yc28nLCAnL2ltYWdlcy9ib2R5L3RvcnNvLnBuZycpXG5cbiAgICB0aGlzLmxvYWQuYXVkaW8oJ0FLNDctc291bmQnLCAnL2F1ZGlvL0FLNDcub2dnJylcbiAgICB0aGlzLmxvYWQuYXVkaW8oJ0JhcnJldE05MC1zb3VuZCcsICcvYXVkaW8vQmFycmV0TTkwLm9nZycpXG4gICAgdGhpcy5sb2FkLmF1ZGlvKCdNMjQ5LXNvdW5kJywgJy9hdWRpby9NMjQ5Lm9nZycpXG4gICAgdGhpcy5sb2FkLmF1ZGlvKCdNUDUtc291bmQnLCAnL2F1ZGlvL01QNS5vZ2cnKVxuICAgIHRoaXMubG9hZC5hdWRpbygnRGVzZXJ0RWFnbGUtc291bmQnLCAnL2F1ZGlvL0Rlc2VydEVhZ2xlLm9nZycpXG4gICAgdGhpcy5sb2FkLmF1ZGlvKCdNNEExLXNvdW5kJywgJy9hdWRpby9NNEExLm9nZycpXG59XG4iLCIndXNlIHN0cmljdCdcblxuaW1wb3J0IEV2ZW50SGFuZGxlciBmcm9tICcuLi9saWIvRXZlbnRIYW5kbGVyJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIENvbGxpZGUgdGhpcyBwbGF5ZXIgd2l0aCB0aGUgbWFwXG4gICAgdGhpcy5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMucGxheWVyLCB0aGlzLnBsYXRmb3JtcywgbnVsbCwgbnVsbCwgdGhpcylcblxuICAgIC8vIERpZCB0aGlzIHBsYXllcidzIGJ1bGxldHMgaGl0IGFueSBwbGF0Zm9ybXNcbiAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5wbGF0Zm9ybXMsIHRoaXMud2VhcG9ucywgKHBsYXRmb3JtLCB3ZWFwb24pID0+IHtcbiAgICAgICAgd2VhcG9uLmtpbGwoKVxuICAgIH0sIG51bGwsIHRoaXMpXG5cbiAgICAvLyBEaWQgZW5lbXkgYnVsbGV0cyBoaXQgYW55IHBsYXRmb3Jtc1xuICAgIHRoaXMucGh5c2ljcy5hcmNhZGUuY29sbGlkZSh0aGlzLnBsYXRmb3JtcywgdGhpcy5lbmVteUJ1bGxldHMsIChwbGF0Zm9ybSwgYnVsbGV0KSA9PiB7XG4gICAgICAgIGJ1bGxldC5raWxsKClcbiAgICB9LCBudWxsLCB0aGlzKVxuXG4gICAgLy8gRGlkIHRoaXMgcGxheWVyIGdldCBoaXQgYnkgYW55IGVuZW15IGJ1bGxldHNcbiAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5wbGF5ZXIsIHRoaXMuZW5lbXlCdWxsZXRzLCBudWxsLCAocGxheWVyLCBidWxsZXQpID0+IHtcbiAgICAgICAgYnVsbGV0LmtpbGwoKVxuXG4gICAgICAgIGNvbnNvbGUubG9nKCdZb3Ugd2VyZSBoaXQgYnknLCBidWxsZXQuYnVsbGV0SWQpXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ2J1bGxldCByZW1vdmVkJywge1xuICAgICAgICAgICAgcm9vbUlkOiB0aGlzLnJvb21JZCxcbiAgICAgICAgICAgIGJ1bGxldElkOiBidWxsZXQuYnVsbGV0SWRcbiAgICAgICAgfSlcblxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdwbGF5ZXIgZGFtYWdlZCcsIHtcbiAgICAgICAgICAgIHJvb21JZDogdGhpcy5yb29tSWQsXG4gICAgICAgICAgICBkYW1hZ2U6IGJ1bGxldC5kYW1hZ2UsXG4gICAgICAgICAgICBkYW1hZ2VkUGxheWVySWQ6ICcvIycgKyB0aGlzLnNvY2tldC5pZCxcbiAgICAgICAgICAgIGF0dGFja2luZ1BsYXllcklkOiBidWxsZXQucGxheWVySWRcbiAgICAgICAgfSlcblxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICB9LCB0aGlzKVxuXG5cblxuXG5cbiAgICBpZiAodGhpcy5sZWZ0SW5wdXRJc0FjdGl2ZSgpKSB7XG4gICAgICAgIC8vIElmIHRoZSBMRUZUIGtleSBpcyBkb3duLCBzZXQgdGhlIHBsYXllciB2ZWxvY2l0eSB0byBtb3ZlIGxlZnRcbiAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5hY2NlbGVyYXRpb24ueCA9IC10aGlzLkFDQ0VMRVJBVElPTlxuICAgICAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLnBsYXkoJ2xlZnQnKVxuXG4gICAgICAgIC8vIExlZnQgZmFjaW5nIGhlYWQgbmVlZHMgdG8gYmUgc2V0IG9ubHkgb25jZVxuICAgICAgICBpZiAodGhpcy5wbGF5ZXIubWV0YS5mYWNpbmcgIT09ICdsZWZ0Jykge1xuICAgICAgICAgICAgdGhpcy5wbGF5ZXIubWV0YS5mYWNpbmcgPSAnbGVmdCdcblxuICAgICAgICAgICAgdGhpcy5oZWFkU3ByaXRlLnNjYWxlLnggKj0gLTFcbiAgICAgICAgICAgIHRoaXMuaGVhZFNwcml0ZS54ID0gMTJcblxuICAgICAgICAgICAgdGhpcy50b3Jzb1Nwcml0ZS5zY2FsZS54ICo9IC0xXG4gICAgICAgICAgICB0aGlzLnRvcnNvU3ByaXRlLnggPSA0OVxuXG4gICAgICAgICAgICB0aGlzLmxlZnRBcm1TcHJpdGUuc2NhbGUueSAqPSAtMVxuICAgICAgICAgICAgdGhpcy5yaWdodEFybVNwcml0ZS5zY2FsZS55ICo9IC0xXG4gICAgICAgICAgICB0aGlzLmFrNDdTcHJpdGUuc2NhbGUueSAqPSAtMVxuICAgICAgICB9XG5cbiAgICB9IGVsc2UgaWYgKHRoaXMucmlnaHRJbnB1dElzQWN0aXZlKCkpIHtcbiAgICAgICAgLy8gSWYgdGhlIFJJR0hUIGtleSBpcyBkb3duLCBzZXQgdGhlIHBsYXllciB2ZWxvY2l0eSB0byBtb3ZlIHJpZ2h0XG4gICAgICAgIHRoaXMucGxheWVyLmJvZHkuYWNjZWxlcmF0aW9uLnggPSB0aGlzLkFDQ0VMRVJBVElPTlxuICAgICAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLnBsYXkoJ3JpZ2h0JylcblxuICAgICAgICBpZiAodGhpcy5wbGF5ZXIubWV0YS5mYWNpbmcgIT09ICdyaWdodCcpIHtcbiAgICAgICAgICAgIHRoaXMucGxheWVyLm1ldGEuZmFjaW5nID0gJ3JpZ2h0J1xuXG4gICAgICAgICAgICB0aGlzLmhlYWRTcHJpdGUuc2NhbGUueCAqPSAtMVxuICAgICAgICAgICAgdGhpcy5oZWFkU3ByaXRlLnggPSAwXG5cbiAgICAgICAgICAgIHRoaXMudG9yc29TcHJpdGUuc2NhbGUueCAqPSAtMVxuICAgICAgICAgICAgdGhpcy50b3Jzb1Nwcml0ZS54ID0gLTM3XG5cbiAgICAgICAgICAgIHRoaXMubGVmdEFybVNwcml0ZS5zY2FsZS55ICo9IC0xXG4gICAgICAgICAgICB0aGlzLnJpZ2h0QXJtU3ByaXRlLnNjYWxlLnkgKj0gLTFcbiAgICAgICAgICAgIHRoaXMuYWs0N1Nwcml0ZS5zY2FsZS55ICo9IC0xXG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBTdGFuZCBzdGlsbFxuICAgICAgICB0aGlzLnBsYXllci5ib2R5LmFjY2VsZXJhdGlvbi54ID0gMFxuICAgICAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLnN0b3AoKVxuXG4gICAgICAgIGlmICh0aGlzLmdhbWUuaW5wdXQud29ybGRYID4gdGhpcy5wbGF5ZXIueCkge1xuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuZnJhbWUgPSA3XG4gICAgICAgICAgICBpZiAodGhpcy5wbGF5ZXIubWV0YS5mYWNpbmcgIT09ICdyaWdodCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllci5tZXRhLmZhY2luZyA9ICdyaWdodCdcblxuICAgICAgICAgICAgICAgIHRoaXMuaGVhZFNwcml0ZS5zY2FsZS54ICo9IC0xXG4gICAgICAgICAgICAgICAgdGhpcy5oZWFkU3ByaXRlLnggPSAwXG5cbiAgICAgICAgICAgICAgICB0aGlzLnRvcnNvU3ByaXRlLnNjYWxlLnggKj0gLTFcbiAgICAgICAgICAgICAgICB0aGlzLnRvcnNvU3ByaXRlLnggPSAtMzdcblxuICAgICAgICAgICAgICAgIHRoaXMubGVmdEFybVNwcml0ZS5zY2FsZS55ICo9IC0xXG4gICAgICAgICAgICAgICAgdGhpcy5sZWZ0QXJtU3ByaXRlLnkgPSAwXG5cbiAgICAgICAgICAgICAgICB0aGlzLnJpZ2h0QXJtU3ByaXRlLnNjYWxlLnkgKj0gLTFcbiAgICAgICAgICAgICAgICB0aGlzLnJpZ2h0QXJtU3ByaXRlLnkgPSAwXG5cbiAgICAgICAgICAgICAgICB0aGlzLmFrNDdTcHJpdGUuc2NhbGUueSAqPSAtMVxuICAgICAgICAgICAgICAgIHRoaXMuYWs0N1Nwcml0ZS55ID0gMTlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmdhbWUuaW5wdXQud29ybGRYIDwgdGhpcy5wbGF5ZXIueCkge1xuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuZnJhbWUgPSA2XG4gICAgICAgICAgICBpZiAodGhpcy5wbGF5ZXIubWV0YS5mYWNpbmcgIT09ICdsZWZ0Jykge1xuICAgICAgICAgICAgICAgIHRoaXMucGxheWVyLm1ldGEuZmFjaW5nID0gJ2xlZnQnXG5cbiAgICAgICAgICAgICAgICB0aGlzLmhlYWRTcHJpdGUuc2NhbGUueCAqPSAtMVxuICAgICAgICAgICAgICAgIHRoaXMuaGVhZFNwcml0ZS54ID0gMTJcblxuICAgICAgICAgICAgICAgIHRoaXMudG9yc29TcHJpdGUuc2NhbGUueCAqPSAtMVxuICAgICAgICAgICAgICAgIHRoaXMudG9yc29TcHJpdGUueCA9IDQ5XG5cbiAgICAgICAgICAgICAgICB0aGlzLmxlZnRBcm1TcHJpdGUuc2NhbGUueSAqPSAtMVxuICAgICAgICAgICAgICAgIHRoaXMubGVmdEFybVNwcml0ZS55ID0gLTg1XG5cbiAgICAgICAgICAgICAgICB0aGlzLnJpZ2h0QXJtU3ByaXRlLnNjYWxlLnkgKj0gLTFcbiAgICAgICAgICAgICAgICB0aGlzLnJpZ2h0QXJtU3ByaXRlLnkgPSA2NVxuXG4gICAgICAgICAgICAgICAgdGhpcy5hazQ3U3ByaXRlLnNjYWxlLnkgKj0gLTFcbiAgICAgICAgICAgICAgICB0aGlzLmFrNDdTcHJpdGUueSA9IDY1XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG5cblxuXG5cblxuICAgIGxldCBhbmdsZUluRGVncmVlcyA9ICh0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuYW5nbGVUb1BvaW50ZXIodGhpcy5wbGF5ZXIpICogMTgwIC8gTWF0aC5QSSkgKyA5MDtcblxuXG4gICAgdGhpcy5yaWdodEFybUdyb3VwLmFuZ2xlID0gYW5nbGVJbkRlZ3JlZXNcbiAgICAvLyBjb25zb2xlLmxvZygnYW5nbGVJbkRlZ3JlZXMnLCBhbmdsZUluRGVncmVlcylcblxuICAgIC8vIFVzZXIgaXMgYWltaW5nIHVwXG4gICAgaWYgKGFuZ2xlSW5EZWdyZWVzIDw9IDgxICYmIGFuZ2xlSW5EZWdyZWVzID49IDcxKSB7XG4gICAgICAgIGFuZ2xlSW5EZWdyZWVzIC09IDEwXG4gICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA8IDcxICYmIGFuZ2xlSW5EZWdyZWVzID49IDYxKSB7XG4gICAgICAgIGFuZ2xlSW5EZWdyZWVzIC09IDIwXG4gICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA8IDYxICYmIGFuZ2xlSW5EZWdyZWVzID49IDUxKSB7XG4gICAgICAgIGFuZ2xlSW5EZWdyZWVzIC09IDMwXG4gICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA8IDUxICYmIGFuZ2xlSW5EZWdyZWVzID49IDQxKSB7XG4gICAgICAgIGFuZ2xlSW5EZWdyZWVzIC09IDQwXG4gICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA8IDQxICYmIGFuZ2xlSW5EZWdyZWVzID49IDMxKSB7XG4gICAgICAgIGFuZ2xlSW5EZWdyZWVzIC09IDUwXG4gICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA8IDMxICYmIGFuZ2xlSW5EZWdyZWVzID49IDIxKSB7XG4gICAgICAgIGFuZ2xlSW5EZWdyZWVzIC09IDYwXG4gICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA8IDIxICYmIGFuZ2xlSW5EZWdyZWVzID49IDExKSB7XG4gICAgICAgIGFuZ2xlSW5EZWdyZWVzIC09IDcwXG4gICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA8IDExICYmIGFuZ2xlSW5EZWdyZWVzID49IDApIHtcbiAgICAgICAgYW5nbGVJbkRlZ3JlZXMgLT0gODBcbiAgICB9XG5cblxuXG4gICAgLy8gVXNlciBpcyBhaW1pbmcgZG93blxuICAgIGlmIChhbmdsZUluRGVncmVlcyA+PSA5OSAmJiBhbmdsZUluRGVncmVlcyA8PSAxMDkpIHtcbiAgICAgICAgYW5nbGVJbkRlZ3JlZXMgKz0gMTBcbiAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzID4gMTA5ICYmIGFuZ2xlSW5EZWdyZWVzIDw9IDExOSkge1xuICAgICAgICBhbmdsZUluRGVncmVlcyArPSAyMFxuICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPiAxMTkgJiYgYW5nbGVJbkRlZ3JlZXMgPD0gMTI5KSB7XG4gICAgICAgIGFuZ2xlSW5EZWdyZWVzICs9IDMwXG4gICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA+IDEyOSAmJiBhbmdsZUluRGVncmVlcyA8PSAxMzkpIHtcbiAgICAgICAgYW5nbGVJbkRlZ3JlZXMgKz0gNDBcbiAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzID4gMTM5ICYmIGFuZ2xlSW5EZWdyZWVzIDw9IDE0OSkge1xuICAgICAgICBhbmdsZUluRGVncmVlcyArPSA1MFxuICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPiAxNDkgJiYgYW5nbGVJbkRlZ3JlZXMgPD0gMTU5KSB7XG4gICAgICAgIGFuZ2xlSW5EZWdyZWVzICs9IDYwXG4gICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA+IDE1OSAmJiBhbmdsZUluRGVncmVlcyA8PSAxNjkpIHtcbiAgICAgICAgYW5nbGVJbkRlZ3JlZXMgKz0gNzBcbiAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzID4gMTY5ICYmIGFuZ2xlSW5EZWdyZWVzIDw9IDE4MCkge1xuICAgICAgICBhbmdsZUluRGVncmVlcyArPSA4MFxuICAgIH1cblxuICAgIHRoaXMubGVmdEFybUdyb3VwLmFuZ2xlID0gYW5nbGVJbkRlZ3JlZXNcblxuXG5cblxuXG5cblxuICAgIC8vIFNldCBhIHZhcmlhYmxlIHRoYXQgaXMgdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgaXMgdG91Y2hpbmcgdGhlIGdyb3VuZFxuICAgIGxldCBvblRoZUdyb3VuZCA9IHRoaXMucGxheWVyLmJvZHkudG91Y2hpbmcuZG93blxuXG4gICAgLy8gSWYgdGhlIHBsYXllciBpcyB0b3VjaGluZyB0aGUgZ3JvdW5kLCBsZXQgaGltIGhhdmUgMiBqdW1wc1xuICAgIGlmIChvblRoZUdyb3VuZCkge1xuICAgICAgICB0aGlzLmp1bXBzID0gMlxuICAgICAgICB0aGlzLmp1bXBpbmcgPSBmYWxzZVxuICAgIH1cblxuICAgIC8vIEp1bXAhXG4gICAgaWYgKHRoaXMuanVtcHMgPT09IDIgJiYgdGhpcy51cElucHV0SXNBY3RpdmUoNSkgJiYgb25UaGVHcm91bmQpIHtcbiAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS52ZWxvY2l0eS55ID0gdGhpcy5KVU1QX1NQRUVEXG4gICAgICAgIHRoaXMuanVtcGluZyA9IHRydWVcbiAgICB9IGVsc2UgaWYgKHRoaXMudXBJbnB1dElzQWN0aXZlKDUpICYmICFvblRoZUdyb3VuZCkge1xuICAgICAgICB0aGlzLmp1bXBzID0gMVxuICAgIH1cblxuICAgIC8vIEp1bXAgSmV0IVxuICAgIGlmICh0aGlzLmp1bXBzID09PSAxICYmIHRoaXMuaW5wdXQua2V5Ym9hcmQuaXNEb3duKFBoYXNlci5LZXlib2FyZC5XKSkge1xuICAgICAgICB0aGlzLnBsYXllci5ib2R5LmFjY2VsZXJhdGlvbi55ID0gdGhpcy5KVU1QX0pFVF9TUEVFRFxuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucGxheWVyLmJvZHkuYWNjZWxlcmF0aW9uLnkgPSAwXG4gICAgfVxuXG4gICAgLy8gUmVkdWNlIHRoZSBudW1iZXIgb2YgYXZhaWxhYmxlIGp1bXBzIGlmIHRoZSBqdW1wIGlucHV0IGlzIHJlbGVhc2VkXG4gICAgaWYgKHRoaXMuanVtcGluZyAmJiB0aGlzLnVwSW5wdXRSZWxlYXNlZCgpKSB7XG4gICAgICAgIHRoaXMucGxheWVyLmJvZHkuYWNjZWxlcmF0aW9uLnggPSAwXG4gICAgICAgIHRoaXMucGxheWVyLmJvZHkuYWNjZWxlcmF0aW9uLnkgPSAwXG5cbiAgICAgICAgaWYgKHRoaXMuanVtcHMgIT09IDEpIHtcbiAgICAgICAgICAgIHRoaXMuanVtcHMtLVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5qdW1waW5nID0gZmFsc2VcbiAgICB9XG5cbiAgICBpZiAodGhpcy5nYW1lLmlucHV0LmFjdGl2ZVBvaW50ZXIuaXNEb3duKVxuICAgIHtcbiAgICAgICAgdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0uZmlyZSh0aGlzLnBsYXllciwgdGhpcy5zb2NrZXQsIHRoaXMucm9vbUlkLCB0aGlzLnZvbHVtZSlcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pbnB1dC5rZXlib2FyZC5pc0Rvd24oUGhhc2VyLktleWJvYXJkLk9ORSkpIHtcbiAgICAgICAgdGhpcy5zZXRDdXJyZW50V2VhcG9uKDApXG4gICAgICAgIEV2ZW50SGFuZGxlci5lbWl0KCd3ZWFwb24gdXBkYXRlJywgMSlcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pbnB1dC5rZXlib2FyZC5pc0Rvd24oUGhhc2VyLktleWJvYXJkLlRXTykpIHtcbiAgICAgICAgdGhpcy5zZXRDdXJyZW50V2VhcG9uKDEpXG4gICAgICAgIEV2ZW50SGFuZGxlci5lbWl0KCd3ZWFwb24gdXBkYXRlJywgMilcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pbnB1dC5rZXlib2FyZC5pc0Rvd24oUGhhc2VyLktleWJvYXJkLlRIUkVFKSkge1xuICAgICAgICB0aGlzLnNldEN1cnJlbnRXZWFwb24oMilcbiAgICAgICAgRXZlbnRIYW5kbGVyLmVtaXQoJ3dlYXBvbiB1cGRhdGUnLCAzKVxuICAgIH1cblxuICAgIGlmICh0aGlzLmlucHV0LmtleWJvYXJkLmlzRG93bihQaGFzZXIuS2V5Ym9hcmQuRk9VUikpIHtcbiAgICAgICAgdGhpcy5zZXRDdXJyZW50V2VhcG9uKDMpXG4gICAgICAgIEV2ZW50SGFuZGxlci5lbWl0KCd3ZWFwb24gdXBkYXRlJywgNClcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pbnB1dC5rZXlib2FyZC5pc0Rvd24oUGhhc2VyLktleWJvYXJkLkZJVkUpKSB7XG4gICAgICAgIHRoaXMuc2V0Q3VycmVudFdlYXBvbig0KVxuICAgICAgICBFdmVudEhhbmRsZXIuZW1pdCgnd2VhcG9uIHVwZGF0ZScsIDUpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaW5wdXQua2V5Ym9hcmQuaXNEb3duKFBoYXNlci5LZXlib2FyZC5TSVgpKSB7XG4gICAgICAgIHRoaXMuc2V0Q3VycmVudFdlYXBvbig1KVxuICAgICAgICBFdmVudEhhbmRsZXIuZW1pdCgnd2VhcG9uIHVwZGF0ZScsIDYpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaW5wdXQua2V5Ym9hcmQuaXNEb3duKFBoYXNlci5LZXlib2FyZC5TRVZFTikpIHtcbiAgICAgICAgdGhpcy5zZXRDdXJyZW50V2VhcG9uKDYpXG4gICAgICAgIEV2ZW50SGFuZGxlci5lbWl0KCd3ZWFwb24gdXBkYXRlJywgNylcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pbnB1dC5rZXlib2FyZC5pc0Rvd24oUGhhc2VyLktleWJvYXJkLkVJR0hUKSkge1xuICAgICAgICB0aGlzLnNldEN1cnJlbnRXZWFwb24oNylcbiAgICAgICAgRXZlbnRIYW5kbGVyLmVtaXQoJ3dlYXBvbiB1cGRhdGUnLCA4KVxuICAgIH1cblxuICAgIGlmICh0aGlzLmlucHV0LmtleWJvYXJkLmlzRG93bihQaGFzZXIuS2V5Ym9hcmQuTklORSkpIHtcbiAgICAgICAgdGhpcy5zZXRDdXJyZW50V2VhcG9uKDgpXG4gICAgICAgIEV2ZW50SGFuZGxlci5lbWl0KCd3ZWFwb24gdXBkYXRlJywgOSlcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pbnB1dC5rZXlib2FyZC5pc0Rvd24oUGhhc2VyLktleWJvYXJkLlpFUk8pKSB7XG4gICAgICAgIHRoaXMuc2V0Q3VycmVudFdlYXBvbig5KVxuICAgICAgICBFdmVudEhhbmRsZXIuZW1pdCgnd2VhcG9uIHVwZGF0ZScsIDApXG4gICAgfVxuXG4gICAgdGhpcy5wb3NpdGlvblRleHQudGV4dCA9IGAke3RoaXMuZ2FtZS5pbnB1dC53b3JsZFh9LCAke3RoaXMuZ2FtZS5pbnB1dC53b3JsZFl9YFxuXG4gICAgdGhpcy5zb2NrZXQuZW1pdCgnbW92ZSBwbGF5ZXInLCB7XG4gICAgICAgIHJvb21JZDogdGhpcy5yb29tSWQsXG4gICAgICAgIHg6IHRoaXMucGxheWVyLngsXG4gICAgICAgIHk6IHRoaXMucGxheWVyLnlcbiAgICB9KVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBJbnB1dEhhbmRsZXIgPSByZXF1aXJlKCcuL2xpYi9JbnB1dEhhbmRsZXInKVxuLy8gbGV0IEVuZW15QnVmZmFsbyA9IHJlcXVpcmUoJy4vbGliL0VuZW15QnVmZmFsbycpXG5sZXQgU29ja2V0RXZlbnRzID0gcmVxdWlyZSgnLi9saWIvU29ja2V0RXZlbnRzJylcbmxldCBDb3JlID0gcmVxdWlyZSgnLi9jb3JlJylcblxubGV0IGdhbWVXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXG5sZXQgZ2FtZUhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodFxubGV0IGdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoZ2FtZVdpZHRoLCBnYW1lSGVpZ2h0LCBQaGFzZXIuQVVUTywgJ3Jhbmdlci1zdGV2ZS1nYW1lJylcblxubGV0IFJhbmdlclN0ZXZlR2FtZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY3VycmVudFdlYXBvbiA9IDBcbiAgICB0aGlzLmVuZW1pZXMgPSBbXVxuICAgIHRoaXMuZ2FtZSA9IGdhbWVcbiAgICB0aGlzLmdyb3VuZFxuICAgIHRoaXMucGxhdGZvcm1zXG4gICAgdGhpcy5wbGF5ZXJcbiAgICB0aGlzLnNjb3JlID0gMFxuICAgIHRoaXMuc2NvcmVUZXh0XG4gICAgdGhpcy5zb2NrZXRcbiAgICB0aGlzLndlYXBvbk5hbWUgPSBudWxsXG4gICAgdGhpcy53ZWFwb25zID0gW11cbn1cblxuUmFuZ2VyU3RldmVHYW1lLnByb3RvdHlwZSA9IHtcbiAgICBpbml0OiBDb3JlLmluaXQsXG4gICAgcHJlbG9hZDogQ29yZS5wcmVsb2FkLFxuICAgIGNyZWF0ZTogQ29yZS5jcmVhdGUsXG4gICAgdXBkYXRlOiBDb3JlLnVwZGF0ZSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIH0sXG5cbiAgICBsZWZ0SW5wdXRJc0FjdGl2ZTogSW5wdXRIYW5kbGVyLmxlZnRJbnB1dElzQWN0aXZlLFxuICAgIHJpZ2h0SW5wdXRJc0FjdGl2ZTogSW5wdXRIYW5kbGVyLnJpZ2h0SW5wdXRJc0FjdGl2ZSxcbiAgICB1cElucHV0SXNBY3RpdmU6IElucHV0SGFuZGxlci51cElucHV0SXNBY3RpdmUsXG4gICAgdXBJbnB1dFJlbGVhc2VkOiBJbnB1dEhhbmRsZXIudXBJbnB1dFJlbGVhc2VkLFxuXG4gICAgc2V0Q3VycmVudFdlYXBvbjogZnVuY3Rpb24obmV3Q3VycmVudFdlYXBvbikge1xuICAgICAgICBpZiAobmV3Q3VycmVudFdlYXBvbiA9PT0gdGhpcy53ZWFwb25zLmxlbmd0aClcbiAgICAgICAgICAgIG5ld0N1cnJlbnRXZWFwb24gPSAwXG5cbiAgICAgICAgLy8gIFJlc2V0IGN1cnJlbnQgd2VhcG9uXG4gICAgICAgIHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLnZpc2libGUgPSBmYWxzZVxuICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS5jYWxsQWxsKCdyZXNldCcsIG51bGwsIDAsIDApXG4gICAgICAgIHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLnNldEFsbCgnZXhpc3RzJywgZmFsc2UpXG5cbiAgICAgICAgLy8gIEFjdGl2YXRlIHRoZSBuZXcgb25lXG4gICAgICAgIHRoaXMuY3VycmVudFdlYXBvbiA9IG5ld0N1cnJlbnRXZWFwb25cbiAgICAgICAgdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0udmlzaWJsZSA9IHRydWVcbiAgICB9LFxuXG4gICAgc2V0RXZlbnRIYW5kbGVyczogU29ja2V0RXZlbnRzLnNldEV2ZW50SGFuZGxlcnMsXG4gICAgb25VcGRhdGVQbGF5ZXJzOiBTb2NrZXRFdmVudHMub25VcGRhdGVQbGF5ZXJzLFxuICAgIG9uU29ja2V0Q29ubmVjdGVkOiBTb2NrZXRFdmVudHMub25Tb2NrZXRDb25uZWN0ZWQsXG4gICAgb25Tb2NrZXREaXNjb25uZWN0OiBTb2NrZXRFdmVudHMub25Tb2NrZXREaXNjb25uZWN0LFxuICAgIG9uTW92ZVBsYXllcjogU29ja2V0RXZlbnRzLm9uTW92ZVBsYXllcixcbiAgICBvblJlbW92ZVBsYXllcjogU29ja2V0RXZlbnRzLm9uUmVtb3ZlUGxheWVyLFxuICAgIG9uQnVsbGV0RmlyZWQ6IFNvY2tldEV2ZW50cy5vbkJ1bGxldEZpcmVkLFxuICAgIG9uQnVsbGV0UmVtb3ZlZDogU29ja2V0RXZlbnRzLm9uQnVsbGV0UmVtb3ZlZCxcbiAgICBvblBsYXllckRhbWFnZWQ6IFNvY2tldEV2ZW50cy5vblBsYXllckRhbWFnZWQsXG4gICAgb25QbGF5ZXJSZXNwYXduOiBTb2NrZXRFdmVudHMub25QbGF5ZXJSZXNwYXduXG59XG5cbmdhbWUuc3RhdGUuYWRkKCdHYW1lJywgUmFuZ2VyU3RldmVHYW1lLCB0cnVlKVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBHdWlkID0gcmVxdWlyZSgnLi9HdWlkJylcblxudmFyIEJ1bGxldCA9IGZ1bmN0aW9uIChnYW1lLCBrZXkpIHtcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgMCwgMCwga2V5KVxuICAgIHRoaXMudGV4dHVyZS5iYXNlVGV4dHVyZS5zY2FsZU1vZGUgPSBQSVhJLnNjYWxlTW9kZXMuTkVBUkVTVFxuICAgIHRoaXMuYW5jaG9yLnNldCgwLjUpXG4gICAgdGhpcy5jaGVja1dvcmxkQm91bmRzID0gdHJ1ZVxuICAgIHRoaXMub3V0T2ZCb3VuZHNLaWxsID0gdHJ1ZVxuICAgIHRoaXMuZXhpc3RzID0gZmFsc2VcbiAgICB0aGlzLnRyYWNraW5nID0gZmFsc2VcbiAgICB0aGlzLnNjYWxlU3BlZWQgPSAwXG59XG5cbkJ1bGxldC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TcHJpdGUucHJvdG90eXBlKVxuQnVsbGV0LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEJ1bGxldFxuXG5CdWxsZXQucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbiAoeCwgeSwgYW5nbGUsIHNwZWVkLCBneCwgZ3ksIHNvY2tldCwgcm9vbUlkKSB7XG4gICAgdGhpcy5yZXNldCh4LCB5KVxuXG4gICAgbGV0IHBvaW50ZXJBbmdsZSA9IHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5tb3ZlVG9Qb2ludGVyKHRoaXMsIHNwZWVkKVxuICAgIHRoaXMuYm9keS5ncmF2aXR5LnkgPSAtMTgwMFxuXG4gICAgY29uc29sZS5sb2coJ0ZpcmluZyBidWxsZXQgbG9jYWxseScsIHRoaXMuYnVsbGV0SWQpXG5cbiAgICBzb2NrZXQuZW1pdCgnYnVsbGV0IGZpcmVkJywge1xuICAgICAgICByb29tSWQ6IHJvb21JZCxcbiAgICAgICAgYnVsbGV0SWQ6IHRoaXMuYnVsbGV0SWQsXG4gICAgICAgIHBsYXllcklkOiAnLyMnICsgc29ja2V0LmlkLFxuICAgICAgICB4LFxuICAgICAgICB5LFxuICAgICAgICBhbmdsZSxcbiAgICAgICAgc3BlZWQsXG4gICAgICAgIGd4LFxuICAgICAgICBneSxcbiAgICAgICAgcG9pbnRlckFuZ2xlLFxuICAgICAgICBoZWlnaHQ6IHRoaXMuaGVpZ2h0LFxuICAgICAgICB3aWR0aDogdGhpcy53aWR0aCxcbiAgICAgICAgZGFtYWdlOiB0aGlzLmRhbWFnZVxuICAgIH0pXG59XG5cbkJ1bGxldC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnRyYWNraW5nKSB7XG4gICAgICAgIHRoaXMucm90YXRpb24gPSBNYXRoLmF0YW4yKHRoaXMuYm9keS52ZWxvY2l0eS55LCB0aGlzLmJvZHkudmVsb2NpdHkueClcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQnVsbGV0XG4iLCJpbXBvcnQgZW1pdHRlciBmcm9tICdldmVudC1lbWl0dGVyJ1xuXG5sZXQgRXZlbnRIYW5kbGVyID0gZW1pdHRlcih7fSlcblxuZXhwb3J0IGRlZmF1bHQgRXZlbnRIYW5kbGVyXG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBndWlkR2VuZXJhdG9yKCkge1xuICAgIHZhciBTNCA9IGZ1bmN0aW9uKCkge1xuICAgICAgIHJldHVybiAoKCgxK01hdGgucmFuZG9tKCkpKjB4MTAwMDApfDApLnRvU3RyaW5nKDE2KS5zdWJzdHJpbmcoMSlcbiAgICB9XG5cbiAgICByZXR1cm4gKFM0KCkrUzQoKStcIi1cIitTNCgpK1wiLVwiK1M0KCkrXCItXCIrUzQoKStcIi1cIitTNCgpK1M0KCkrUzQoKSlcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvLyBUaGlzIGZ1bmN0aW9uIHNob3VsZCByZXR1cm4gdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgYWN0aXZhdGVzIHRoZSBcImdvIGxlZnRcIiBjb250cm9sXG4gICAgLy8gSW4gdGhpcyBjYXNlLCBlaXRoZXIgaG9sZGluZyB0aGUgcmlnaHQgYXJyb3cgb3IgdGFwcGluZyBvciBjbGlja2luZyBvbiB0aGUgbGVmdFxuICAgIC8vIHNpZGUgb2YgdGhlIHNjcmVlbi5cbiAgICBsZWZ0SW5wdXRJc0FjdGl2ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlucHV0LmtleWJvYXJkLmlzRG93bihQaGFzZXIuS2V5Ym9hcmQuQSlcbiAgICB9LFxuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiBzaG91bGQgcmV0dXJuIHRydWUgd2hlbiB0aGUgcGxheWVyIGFjdGl2YXRlcyB0aGUgXCJnbyByaWdodFwiIGNvbnRyb2xcbiAgICAvLyBJbiB0aGlzIGNhc2UsIGVpdGhlciBob2xkaW5nIHRoZSByaWdodCBhcnJvdyBvciB0YXBwaW5nIG9yIGNsaWNraW5nIG9uIHRoZSByaWdodFxuICAgIC8vIHNpZGUgb2YgdGhlIHNjcmVlbi5cbiAgICByaWdodElucHV0SXNBY3RpdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnB1dC5rZXlib2FyZC5pc0Rvd24oUGhhc2VyLktleWJvYXJkLkQpXG4gICAgfSxcblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gc2hvdWxkIHJldHVybiB0cnVlIHdoZW4gdGhlIHBsYXllciBhY3RpdmF0ZXMgdGhlIFwianVtcFwiIGNvbnRyb2xcbiAgICAvLyBJbiB0aGlzIGNhc2UsIGVpdGhlciBob2xkaW5nIHRoZSB1cCBhcnJvdyBvciB0YXBwaW5nIG9yIGNsaWNraW5nIG9uIHRoZSBjZW50ZXJcbiAgICAvLyBwYXJ0IG9mIHRoZSBzY3JlZW4uXG4gICAgdXBJbnB1dElzQWN0aXZlOiBmdW5jdGlvbihkdXJhdGlvbikge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnB1dC5rZXlib2FyZC5kb3duRHVyYXRpb24oUGhhc2VyLktleWJvYXJkLlcsIGR1cmF0aW9uKVxuICAgIH0sXG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIHJldHVybnMgdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgcmVsZWFzZXMgdGhlIFwianVtcFwiIGNvbnRyb2xcbiAgICB1cElucHV0UmVsZWFzZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnB1dC5rZXlib2FyZC51cER1cmF0aW9uKFBoYXNlci5LZXlib2FyZC5XKVxuICAgIH1cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmVuZW1pZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHRoaXMuZW5lbWllc1tpXS5wbGF5ZXIuaWQgPT09IGlkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lbmVtaWVzW2ldXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2Vcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgUmVtb3RlUGxheWVyID0gZnVuY3Rpb24oaWQsIGdhbWUsIHBsYXllciwgc3RhcnRYLCBzdGFydFkpIHtcbiAgICBsZXQgbmV3UmVtb3RlUGxheWVyID0ge1xuICAgICAgICB4OiBzdGFydFgsXG4gICAgICAgIHk6IHN0YXJ0WSxcbiAgICAgICAgaWQ6IG51bGwsXG4gICAgICAgIGdhbWU6IGdhbWUsXG4gICAgICAgIGhlYWx0aDogMTAwLFxuICAgICAgICBwbGF5ZXI6IHBsYXllcixcbiAgICAgICAgYWxpdmU6IHRydWUsXG4gICAgICAgIGxhc3RQb3NpdGlvbjoge1xuICAgICAgICAgICAgeDogc3RhcnRYLFxuICAgICAgICAgICAgeTogc3RhcnRZXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgdGhlIHBsYXllcidzIGVuZW15IHNwcml0ZVxuICAgIG5ld1JlbW90ZVBsYXllci5wbGF5ZXIgPSBnYW1lLmFkZC5zcHJpdGUoc3RhcnRYLCBzdGFydFksICdlbmVteScpXG5cbiAgICAvLyAgV2UgbmVlZCB0byBlbmFibGUgcGh5c2ljcyBvbiB0aGUgcGxheWVyXG4gICAgLy8gdGhpcy5waHlzaWNzLmFyY2FkZS5lbmFibGUobmV3UmVtb3RlUGxheWVyLnBsYXllcilcblxuICAgIC8vIC8vIEVuYWJsZSBwaHlzaWNzIG9uIHRoZSBwbGF5ZXJcbiAgICAvLyB0aGlzLmdhbWUucGh5c2ljcy5lbmFibGUobmV3UmVtb3RlUGxheWVyLnBsYXllciwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKVxuXG4gICAgLy8gTWFrZSBwbGF5ZXIgY29sbGlkZSB3aXRoIHdvcmxkIGJvdW5kYXJpZXMgc28gaGUgZG9lc24ndCBsZWF2ZSB0aGUgc3RhZ2VcbiAgICAvLyBuZXdSZW1vdGVQbGF5ZXIucGxheWVyLmJvZHkuY29sbGlkZVdvcmxkQm91bmRzID0gdHJ1ZVxuXG4gICAgLy8gT3VyIHR3byBhbmltYXRpb25zLCB3YWxraW5nIGxlZnQgYW5kIHJpZ2h0LlxuICAgIG5ld1JlbW90ZVBsYXllci5wbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ2xlZnQnLCBbMCwgMSwgMiwgM10sIDEwLCB0cnVlKVxuICAgIG5ld1JlbW90ZVBsYXllci5wbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ3JpZ2h0JywgWzUsIDYsIDcsIDhdLCAxMCwgdHJ1ZSlcblxuICAgIG5ld1JlbW90ZVBsYXllci5wbGF5ZXIuaWQgPSBpZFxuXG4gICAgcmV0dXJuIG5ld1JlbW90ZVBsYXllclxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlbW90ZVBsYXllclxuIiwiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHNldEV2ZW50SGFuZGxlcnM6IHJlcXVpcmUoJy4vc2V0RXZlbnRIYW5kbGVycycpLFxuXG4gICAgb25Tb2NrZXRDb25uZWN0ZWQ6IHJlcXVpcmUoJy4vb25Tb2NrZXRDb25uZWN0ZWQnKSxcbiAgICBvblNvY2tldERpc2Nvbm5lY3Q6IHJlcXVpcmUoJy4vb25Tb2NrZXREaXNjb25uZWN0JyksXG5cbiAgICBvbk1vdmVQbGF5ZXI6IHJlcXVpcmUoJy4vb25Nb3ZlUGxheWVyJyksXG4gICAgb25SZW1vdmVQbGF5ZXI6IHJlcXVpcmUoJy4vb25SZW1vdmVQbGF5ZXInKSxcbiAgICBvblVwZGF0ZVBsYXllcnM6IHJlcXVpcmUoJy4vb25VcGRhdGVQbGF5ZXJzJyksXG5cbiAgICBvblBsYXllckRhbWFnZWQ6IHJlcXVpcmUoJy4vb25QbGF5ZXJEYW1hZ2VkJyksXG4gICAgb25QbGF5ZXJSZXNwYXduOiByZXF1aXJlKCcuL29uUGxheWVyUmVzcGF3bicpLFxuXG4gICAgb25CdWxsZXRGaXJlZDogcmVxdWlyZSgnLi9vbkJ1bGxldEZpcmVkJyksXG4gICAgb25CdWxsZXRSZW1vdmVkOiByZXF1aXJlKCcuL29uQnVsbGV0UmVtb3ZlZCcpXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IEJ1bGxldCA9IHJlcXVpcmUoJy4uL0J1bGxldCcpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIGlmIChkYXRhLmlkID09PSAoJy8jJyArIHRoaXMuc29ja2V0LmlkKSlcbiAgICAgICAgcmV0dXJuXG5cbiAgICBjb25zb2xlLmxvZygnRmlyaW5nIGJ1bGxldCByZW1vdGVseScsIGRhdGEuYnVsbGV0SWQpXG5cbiAgICBsZXQgbmV3RW5lbXlCdWxsZXQgPSB0aGlzLmVuZW15QnVsbGV0cy5jcmVhdGUoZGF0YS54LCBkYXRhLnksICdidWxsZXQxMicpXG4gICAgbmV3RW5lbXlCdWxsZXQuYnVsbGV0SWQgPSBkYXRhLmJ1bGxldElkXG4gICAgbmV3RW5lbXlCdWxsZXQucGxheWVySWQgPSBkYXRhLnBsYXllcklkXG4gICAgbmV3RW5lbXlCdWxsZXQuZGFtYWdlID0gZGF0YS5kYW1hZ2VcbiAgICBuZXdFbmVteUJ1bGxldC5yb3RhdGlvbiA9IGRhdGEucG9pbnRlckFuZ2xlXG4gICAgbmV3RW5lbXlCdWxsZXQuaGVpZ2h0ID0gZGF0YS5oZWlnaHRcbiAgICBuZXdFbmVteUJ1bGxldC53aWR0aCA9IGRhdGEud2lkdGhcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5lbmFibGUobmV3RW5lbXlCdWxsZXQsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSlcbiAgICBuZXdFbmVteUJ1bGxldC5ib2R5LmdyYXZpdHkueSA9IC0xODAwXG5cbiAgICBsZXQgbmV3VmVsb2NpdHkgPSB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUudmVsb2NpdHlGcm9tUm90YXRpb24oZGF0YS5wb2ludGVyQW5nbGUsIGRhdGEuc3BlZWQpXG4gICAgbmV3RW5lbXlCdWxsZXQuYm9keS52ZWxvY2l0eS54ICs9IG5ld1ZlbG9jaXR5LnhcbiAgICBuZXdFbmVteUJ1bGxldC5ib2R5LnZlbG9jaXR5LnkgKz0gbmV3VmVsb2NpdHkueVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIGlmIChkYXRhLmlkID09PSAoJy8jJyArIHRoaXMuc29ja2V0LmlkKSlcbiAgICAgICAgcmV0dXJuXG5cbiAgICBjb25zb2xlLmxvZygnUmVtb3ZpbmcgYnVsbGV0JywgZGF0YS5idWxsZXRJZClcblxuICAgIGxldCByZW1vdmVCdWxsZXQgPSBfLmZpbmQodGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0uY2hpbGRyZW4sIHtcbiAgICAgICAgYnVsbGV0SWQ6IGRhdGEuYnVsbGV0SWRcbiAgICB9KVxuXG4gICAgaWYgKCFyZW1vdmVCdWxsZXQpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0J1bGxldCBub3QgZm91bmQ6ICcsIGRhdGEuYnVsbGV0SWQpXG4gICAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHJlbW92ZUJ1bGxldC5raWxsKClcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgUGxheWVyQnlJZCA9IHJlcXVpcmUoJy4uL1BsYXllckJ5SWQnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBsZXQgbW92ZVBsYXllciA9IFBsYXllckJ5SWQuY2FsbCh0aGlzLCBkYXRhLmlkKVxuXG4gICAgLy8gUGxheWVyIG5vdCBmb3VuZFxuICAgIGlmICghIG1vdmVQbGF5ZXIpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIHBsYXllciBwb3NpdGlvblxuICAgIG1vdmVQbGF5ZXIucGxheWVyLnggPSBkYXRhLnhcbiAgICBtb3ZlUGxheWVyLnBsYXllci55ID0gZGF0YS55XG5cbiAgICBpZiAobW92ZVBsYXllci5wbGF5ZXIueCA+IG1vdmVQbGF5ZXIubGFzdFBvc2l0aW9uLngpIHtcbiAgICAgICAgbW92ZVBsYXllci5wbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdyaWdodCcpXG4gICAgfVxuICAgIGVsc2UgaWYgKG1vdmVQbGF5ZXIucGxheWVyLnggPCBtb3ZlUGxheWVyLmxhc3RQb3NpdGlvbi54KVxuICAgIHtcbiAgICAgICAgbW92ZVBsYXllci5wbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdsZWZ0JylcbiAgICB9XG4gICAgZWxzZVxuICAgIHtcbiAgICAgICAgbW92ZVBsYXllci5wbGF5ZXIuYW5pbWF0aW9ucy5zdG9wKClcbiAgICAgICAgbW92ZVBsYXllci5wbGF5ZXIuZnJhbWUgPSA0XG4gICAgfVxuXG4gICAgbW92ZVBsYXllci5sYXN0UG9zaXRpb24ueCA9IG1vdmVQbGF5ZXIucGxheWVyLnhcbiAgICBtb3ZlUGxheWVyLmxhc3RQb3NpdGlvbi55ID0gbW92ZVBsYXllci5wbGF5ZXIueVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmltcG9ydCBFdmVudEhhbmRsZXIgZnJvbSAnLi4vRXZlbnRIYW5kbGVyJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBpZiAoZGF0YS5kYW1hZ2VkUGxheWVySWQgIT09ICgnLyMnICsgdGhpcy5zb2NrZXQuaWQpKVxuICAgICAgICByZXR1cm5cblxuICAgIHRoaXMucGxheWVyLm1ldGEuaGVhbHRoID0gZGF0YS5oZWFsdGhcbiAgICBFdmVudEhhbmRsZXIuZW1pdCgnaGVhbHRoIHVwZGF0ZScsIHRoaXMucGxheWVyLm1ldGEuaGVhbHRoKVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmltcG9ydCBFdmVudEhhbmRsZXIgZnJvbSAnLi4vRXZlbnRIYW5kbGVyJ1xubGV0IEhpZ2hSdWxlRGVzZXJ0ID0gcmVxdWlyZSgnLi4vLi4vbWFwcy9IaWdoUnVsZURlc2VydCcpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIGlmIChkYXRhLmRhbWFnZWRQbGF5ZXJJZCAhPT0gKCcvIycgKyB0aGlzLnNvY2tldC5pZCkpXG4gICAgICAgIHJldHVyblxuXG4gICAgdGhpcy5wbGF5ZXIubWV0YS5oZWFsdGggPSBkYXRhLmhlYWx0aFxuICAgIEV2ZW50SGFuZGxlci5lbWl0KCdoZWFsdGggdXBkYXRlJywgU3RyaW5nKHRoaXMucGxheWVyLm1ldGEuaGVhbHRoKSlcblxuICAgIGxldCBzcGF3blBvaW50ID0gSGlnaFJ1bGVEZXNlcnQuZ2V0UmFuZG9tU3Bhd25Qb2ludC5jYWxsKHRoaXMpXG4gICAgdGhpcy5wbGF5ZXIueCA9IHNwYXduUG9pbnQueFxuICAgIHRoaXMucGxheWVyLnkgPSBzcGF3blBvaW50Lnlcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgUGxheWVyQnlJZCA9IHJlcXVpcmUoJy4uL1BsYXllckJ5SWQnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBsZXQgcmVtb3ZlUGxheWVyID0gUGxheWVyQnlJZC5jYWxsKHRoaXMsIGRhdGEuaWQpXG5cbiAgICAvLyBQbGF5ZXIgbm90IGZvdW5kXG4gICAgaWYgKCFyZW1vdmVQbGF5ZXIpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1BsYXllciBub3QgZm91bmQ6ICcsIGRhdGEuaWQpXG4gICAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHJlbW92ZVBsYXllci5wbGF5ZXIua2lsbCgpXG5cbiAgICAvLyBSZW1vdmUgcGxheWVyIGZyb20gYXJyYXlcbiAgICB0aGlzLmVuZW1pZXMuc3BsaWNlKHRoaXMuZW5lbWllcy5pbmRleE9mKHJlbW92ZVBsYXllciksIDEpXG59XG4iLCIndXNlIHN0cmljdCdcblxudmFyIGdldFF1ZXJ5U3RyaW5nID0gZnVuY3Rpb24gKCBmaWVsZCwgdXJsICkge1xuICAgIHZhciBocmVmID0gdXJsID8gdXJsIDogd2luZG93LmxvY2F0aW9uLmhyZWY7XG4gICAgdmFyIHJlZyA9IG5ldyBSZWdFeHAoICdbPyZdJyArIGZpZWxkICsgJz0oW14mI10qKScsICdpJyApO1xuICAgIHZhciBzdHJpbmcgPSByZWcuZXhlYyhocmVmKTtcbiAgICByZXR1cm4gc3RyaW5nID8gc3RyaW5nWzFdIDogbnVsbDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coJ0Nvbm5lY3RlZCB0byBzb2NrZXQgc2VydmVyJylcblxuICAgICAvLyBSZXNldCBlbmVtaWVzIG9uIHJlY29ubmVjdFxuICAgIHRoaXMuZW5lbWllcy5mb3JFYWNoKGZ1bmN0aW9uIChlbmVteSkge1xuICAgICAgICBpZiAoZW5lbXkpIGVuZW15LmtpbGwoKVxuICAgIH0pXG5cbiAgICB0aGlzLmVuZW1pZXMgPSBbXVxuXG4gICAgLy8gU2VuZCBsb2NhbCBwbGF5ZXIgZGF0YSB0byB0aGUgZ2FtZSBzZXJ2ZXJcbiAgICB0aGlzLnNvY2tldC5lbWl0KCduZXcgcGxheWVyJywge1xuICAgICAgICByb29tSWQ6IGdldFF1ZXJ5U3RyaW5nKCdyb29tSWQnKSxcbiAgICAgICAgeDogdGhpcy5wbGF5ZXIueCxcbiAgICAgICAgeTogdGhpcy5wbGF5ZXIueVxuICAgIH0pXG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZygnRGlzY29ubmVjdGVkIGZyb20gc29ja2V0IHNlcnZlcicpXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IFJlbW90ZVBsYXllciA9IHJlcXVpcmUoJy4uL1JlbW90ZVBsYXllcicpXG5pbXBvcnQgRXZlbnRIYW5kbGVyIGZyb20gJy4uL0V2ZW50SGFuZGxlcidcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgY29uc29sZS5sb2coJ3VwZGF0ZSBwbGF5ZXJzJywgZGF0YSlcblxuICAgIHRoaXMucm9vbUlkID0gZGF0YS5yb29tLmlkXG5cbiAgICBsZXQgbmV3dXJsID0gd2luZG93LmxvY2F0aW9uLnByb3RvY29sICsgXCIvL1wiICsgd2luZG93LmxvY2F0aW9uLmhvc3QgKyB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgKyAnP3Jvb21JZD0nICsgZGF0YS5yb29tLmlkO1xuICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSh7IHBhdGg6IG5ld3VybCB9LCAnJywgbmV3dXJsKTtcblxuICAgIHRoaXMuZW5lbWllcy5mb3JFYWNoKGZ1bmN0aW9uIChlbmVteSkge1xuICAgICAgICBlbmVteS5wbGF5ZXIua2lsbCgpXG4gICAgfSlcblxuICAgIHRoaXMuZW5lbWllcyA9IFtdXG5cbiAgICBFdmVudEhhbmRsZXIuZW1pdCgncGxheWVycyB1cGRhdGUnLCBkYXRhLnJvb20ucGxheWVycylcblxuICAgIGRhdGEucm9vbS5wbGF5ZXJzLmZvckVhY2goKHBsYXllcikgPT4ge1xuICAgICAgICBpZiAocGxheWVyLmlkID09PSAoJy8jJyArIHRoaXMuc29ja2V0LmlkKSkge1xuICAgICAgICAgICAgRXZlbnRIYW5kbGVyLmVtaXQoJ3Njb3JlIHVwZGF0ZScsIFN0cmluZyhwbGF5ZXIubWV0YS5zY29yZSkpXG4gICAgICAgICAgICBFdmVudEhhbmRsZXIuZW1pdCgnaGVhbHRoIHVwZGF0ZScsIFN0cmluZyhwbGF5ZXIubWV0YS5oZWFsdGgpKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICBsZXQgbmV3UmVtb3RlUGxheWVyID0gUmVtb3RlUGxheWVyLmNhbGwodGhpcywgcGxheWVyLmlkLCB0aGlzLmdhbWUsIHRoaXMucGxheWVyLCBwbGF5ZXIueCwgcGxheWVyLnkpXG4gICAgICAgIHRoaXMuZW5lbWllcy5wdXNoKG5ld1JlbW90ZVBsYXllcilcbiAgICAgICAgdGhpcy5lbmVtaWVzW3RoaXMuZW5lbWllcy5sZW5ndGggLSAxXS5wbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ2xlZnQnLCBbMCwgMSwgMiwgM10sIDEwLCB0cnVlKVxuICAgICAgICB0aGlzLmVuZW1pZXNbdGhpcy5lbmVtaWVzLmxlbmd0aCAtIDFdLnBsYXllci5hbmltYXRpb25zLmFkZCgncmlnaHQnLCBbNSwgNiwgNywgOF0sIDEwLCB0cnVlKVxuICAgIH0pXG59XG4iLCIndXNlIHN0cmljdCdcblxuaW1wb3J0IEV2ZW50SGFuZGxlciBmcm9tICcuLi9FdmVudEhhbmRsZXInXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuc29ja2V0Lm9uKCdjb25uZWN0JywgdGhpcy5vblNvY2tldENvbm5lY3RlZC5iaW5kKHRoaXMpKVxuICAgIHRoaXMuc29ja2V0Lm9uKCdkaXNjb25uZWN0JywgdGhpcy5vblNvY2tldERpc2Nvbm5lY3QuYmluZCh0aGlzKSlcblxuICAgIHRoaXMuc29ja2V0Lm9uKCd1cGRhdGUgcGxheWVycycsIHRoaXMub25VcGRhdGVQbGF5ZXJzLmJpbmQodGhpcykpXG4gICAgdGhpcy5zb2NrZXQub24oJ21vdmUgcGxheWVyJywgdGhpcy5vbk1vdmVQbGF5ZXIuYmluZCh0aGlzKSlcbiAgICB0aGlzLnNvY2tldC5vbigncmVtb3ZlIHBsYXllcicsIHRoaXMub25SZW1vdmVQbGF5ZXIuYmluZCh0aGlzKSlcblxuICAgIHRoaXMuc29ja2V0Lm9uKCdwbGF5ZXIgcmVzcGF3bicsIHRoaXMub25QbGF5ZXJSZXNwYXduLmJpbmQodGhpcykpXG4gICAgdGhpcy5zb2NrZXQub24oJ3BsYXllciBkYW1hZ2VkJywgdGhpcy5vblBsYXllckRhbWFnZWQuYmluZCh0aGlzKSlcblxuICAgIHRoaXMuc29ja2V0Lm9uKCdidWxsZXQgZmlyZWQnLCB0aGlzLm9uQnVsbGV0RmlyZWQuYmluZCh0aGlzKSlcbiAgICB0aGlzLnNvY2tldC5vbignYnVsbGV0IHJlbW92ZWQnLCB0aGlzLm9uQnVsbGV0UmVtb3ZlZC5iaW5kKHRoaXMpKVxuXG4gICAgRXZlbnRIYW5kbGVyLm9uKCdwbGF5ZXIgdXBkYXRlIG5pY2tuYW1lJywgKGRhdGEpID0+IHtcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgncGxheWVyIHVwZGF0ZSBuaWNrbmFtZScsIHtcbiAgICAgICAgICAgIHJvb21JZDogdGhpcy5yb29tSWQsXG4gICAgICAgICAgICBuaWNrbmFtZTogZGF0YS5uaWNrbmFtZVxuICAgICAgICB9KVxuICAgIH0pXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IEJ1bGxldCA9IHJlcXVpcmUoJy4uL0J1bGxldCcpXG5sZXQgR3VpZCA9IHJlcXVpcmUoJy4uL0d1aWQnKVxuXG5sZXQgQUs0NyA9IGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCBjb25maWcuZ2FtZSwgY29uZmlnLmdhbWUud29ybGQsICdBSy00NycsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuXG4gICAgLy9cdEhlcmUgd2Ugc2V0LXVwIG91ciBhdWRpbyBzcHJpdGVcbiAgICB0aGlzLmZ4ID0gY29uZmlnLmdhbWUuYWRkLmF1ZGlvKCdBSzQ3LXNvdW5kJylcbiAgICB0aGlzLmFsbG93TXVsdGlwbGUgPSB0cnVlXG5cbiAgICB0aGlzLmRhbWFnZSA9IDIyXG4gICAgdGhpcy5uZXh0RmlyZSA9IDBcbiAgICB0aGlzLmJ1bGxldFNwZWVkID0gMjMwMFxuICAgIHRoaXMuZmlyZVJhdGUgPSAxNjA7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDY0OyBpKyspXG4gICAge1xuICAgICAgICBsZXQgYnVsbGV0ID0gbmV3IEJ1bGxldChjb25maWcuZ2FtZSwgJ2J1bGxldDEyJywgY29uZmlnLnNvY2tldClcbiAgICAgICAgYnVsbGV0LmJ1bGxldElkID0gR3VpZCgpXG4gICAgICAgIGJ1bGxldC5oZWlnaHQgPSAyXG4gICAgICAgIGJ1bGxldC53aWR0aCA9IDQwXG4gICAgICAgIGJ1bGxldC5kYW1hZ2UgPSAyMlxuICAgICAgICB0aGlzLmFkZChidWxsZXQsIHRydWUpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG59XG5cbkFLNDcucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcbkFLNDcucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQUs0NztcblxuQUs0Ny5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uKHBsYXllciwgc29ja2V0LCByb29tSWQsIHZvbHVtZSkge1xuICAgIGlmICh0aGlzLmdhbWUudGltZS50aW1lIDwgdGhpcy5uZXh0RmlyZSlcbiAgICAgICAgcmV0dXJuXG5cbiAgICB2YXIgeCA9IHBsYXllci54ICsgMTBcbiAgICB2YXIgeSA9IHBsYXllci55ICsgLTEwXG5cbiAgICB0aGlzLmdldEZpcnN0RXhpc3RzKGZhbHNlKS5maXJlKHgsIHksIDAsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDAsIHNvY2tldCwgcm9vbUlkKVxuICAgIHRoaXMuc2V0QWxsKCd0cmFja2luZycsIHRydWUpXG5cbiAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5nYW1lLnRpbWUudGltZSArIHRoaXMuZmlyZVJhdGVcbiAgICB0aGlzLmZ4LnZvbHVtZSA9IC4zICogdm9sdW1lXG4gICAgdGhpcy5meC5wbGF5KClcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBSzQ3XG4iLCIndXNlIHN0cmljdCdcblxubGV0IEJ1bGxldCA9IHJlcXVpcmUoJy4uL0J1bGxldCcpXG5sZXQgR3VpZCA9IHJlcXVpcmUoJy4uL0d1aWQnKVxuXG5sZXQgQUs0NyA9IGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCBjb25maWcuZ2FtZSwgY29uZmlnLmdhbWUud29ybGQsICdBSy00NycsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuXG4gICAgLy9cdEhlcmUgd2Ugc2V0LXVwIG91ciBhdWRpbyBzcHJpdGVcbiAgICB0aGlzLmZ4ID0gY29uZmlnLmdhbWUuYWRkLmF1ZGlvKCdBSzQ3LXNvdW5kJylcbiAgICB0aGlzLmFsbG93TXVsdGlwbGUgPSB0cnVlXG5cbiAgICB0aGlzLmRhbWFnZSA9IDIyXG4gICAgdGhpcy5uZXh0RmlyZSA9IDBcbiAgICB0aGlzLmJ1bGxldFNwZWVkID0gMjMwMFxuICAgIHRoaXMuZmlyZVJhdGUgPSAxNjA7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDY0OyBpKyspXG4gICAge1xuICAgICAgICBsZXQgYnVsbGV0ID0gbmV3IEJ1bGxldChjb25maWcuZ2FtZSwgJ2J1bGxldDEyJywgY29uZmlnLnNvY2tldClcbiAgICAgICAgYnVsbGV0LmJ1bGxldElkID0gR3VpZCgpXG4gICAgICAgIGJ1bGxldC5oZWlnaHQgPSAyXG4gICAgICAgIGJ1bGxldC53aWR0aCA9IDQwXG4gICAgICAgIGJ1bGxldC5kYW1hZ2UgPSAyMlxuICAgICAgICB0aGlzLmFkZChidWxsZXQsIHRydWUpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG59XG5cbkFLNDcucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcbkFLNDcucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQUs0NztcblxuQUs0Ny5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uKHBsYXllciwgc29ja2V0LCByb29tSWQsIHZvbHVtZSkge1xuICAgIGlmICh0aGlzLmdhbWUudGltZS50aW1lIDwgdGhpcy5uZXh0RmlyZSlcbiAgICAgICAgcmV0dXJuXG5cbiAgICB2YXIgeCA9IHBsYXllci54ICsgMTU7XG4gICAgdmFyIHkgPSBwbGF5ZXIueSArIDMwO1xuXG4gICAgdGhpcy5nZXRGaXJzdEV4aXN0cyhmYWxzZSkuZmlyZSh4LCB5LCAwLCB0aGlzLmJ1bGxldFNwZWVkLCAwLCAwLCBzb2NrZXQsIHJvb21JZClcbiAgICB0aGlzLnNldEFsbCgndHJhY2tpbmcnLCB0cnVlKVxuXG4gICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMuZ2FtZS50aW1lLnRpbWUgKyB0aGlzLmZpcmVSYXRlXG4gICAgY29uc29sZS5sb2codm9sdW1lKVxuICAgIGNvbnNvbGUubG9nKC4zICogdm9sdW1lKVxuICAgIHRoaXMuZngudm9sdW1lID0gLjMgKiB2b2x1bWVcbiAgICB0aGlzLmZ4LnBsYXkoKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFLNDdcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgQnVsbGV0ID0gcmVxdWlyZSgnLi4vQnVsbGV0JylcbmxldCBHdWlkID0gcmVxdWlyZSgnLi4vR3VpZCcpXG5cbmxldCBCYXJyZXRNOTAgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgY29uZmlnLmdhbWUsIGNvbmZpZy5nYW1lLndvcmxkLCAnQmFycmV0IE05MCcsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuXG4gICAgLy9cdEhlcmUgd2Ugc2V0LXVwIG91ciBhdWRpbyBzcHJpdGVcbiAgICB0aGlzLmZ4ID0gY29uZmlnLmdhbWUuYWRkLmF1ZGlvKCdCYXJyZXRNOTAtc291bmQnKVxuICAgIHRoaXMuYWxsb3dNdWx0aXBsZSA9IHRydWVcblxuICAgIHRoaXMubmFtZSA9ICdCYXJyZXQgTTkwJ1xuICAgIHRoaXMuZGFtYWdlID0gODhcbiAgICB0aGlzLm5leHRGaXJlID0gMFxuICAgIHRoaXMuYnVsbGV0U3BlZWQgPSAzNDM1XG5cbiAgICAvLyBCYXJyZXRNOTAgZmlyZXMgYWJvdXQgNjAwIGJ1bGxldHMgcGVyIHNlY29uZFxuICAgIHRoaXMuZmlyZVJhdGUgPSAzMDAwXG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDY0OyBpKyspXG4gICAge1xuICAgICAgICBsZXQgYnVsbGV0ID0gbmV3IEJ1bGxldChjb25maWcuZ2FtZSwgJ2J1bGxldDEyJywgY29uZmlnLnNvY2tldClcbiAgICAgICAgYnVsbGV0LmJ1bGxldElkID0gR3VpZCgpXG4gICAgICAgIGJ1bGxldC5oZWlnaHQgPSAyXG4gICAgICAgIGJ1bGxldC53aWR0aCA9IDQwXG4gICAgICAgIGJ1bGxldC5kYW1hZ2UgPSA4OFxuXG4gICAgICAgIHRoaXMuYWRkKGJ1bGxldCwgdHJ1ZSlcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xufVxuXG5CYXJyZXRNOTAucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcbkJhcnJldE05MC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBCYXJyZXRNOTA7XG5cbkJhcnJldE05MC5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uIChwbGF5ZXIsIHNvY2tldCwgcm9vbUlkKSB7XG4gICAgaWYgKHRoaXMuZ2FtZS50aW1lLnRpbWUgPCB0aGlzLm5leHRGaXJlKVxuICAgICAgICByZXR1cm5cblxuICAgIHZhciB4ID0gcGxheWVyLnggKyAxNTtcbiAgICB2YXIgeSA9IHBsYXllci55ICsgMzA7XG5cbiAgICB0aGlzLmdldEZpcnN0RXhpc3RzKGZhbHNlKS5maXJlKHgsIHksIDAsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDAsIHNvY2tldCwgcm9vbUlkKVxuICAgIHRoaXMuc2V0QWxsKCd0cmFja2luZycsIHRydWUpXG5cbiAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5nYW1lLnRpbWUudGltZSArIHRoaXMuZmlyZVJhdGVcbiAgICB0aGlzLmZ4LnZvbHVtZSA9IC42XG4gICAgdGhpcy5meC5wbGF5KClcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCYXJyZXRNOTBcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgQnVsbGV0ID0gcmVxdWlyZSgnLi4vQnVsbGV0JylcbmxldCBHdWlkID0gcmVxdWlyZSgnLi4vR3VpZCcpXG5cbmxldCBBSzQ3ID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGNvbmZpZy5nYW1lLCBjb25maWcuZ2FtZS53b3JsZCwgJ0Rlc2VydCBFYWdsZScsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuXG4gICAgLy9cdEhlcmUgd2Ugc2V0LXVwIG91ciBhdWRpbyBzcHJpdGVcbiAgICB0aGlzLmZ4ID0gY29uZmlnLmdhbWUuYWRkLmF1ZGlvKCdEZXNlcnRFYWdsZS1zb3VuZCcpXG4gICAgdGhpcy5hbGxvd011bHRpcGxlID0gdHJ1ZVxuXG4gICAgdGhpcy5kYW1hZ2UgPSAzM1xuICAgIHRoaXMubmV4dEZpcmUgPSAwXG4gICAgdGhpcy5idWxsZXRTcGVlZCA9IDIzMDBcbiAgICB0aGlzLmZpcmVSYXRlID0gMjY3O1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA2NDsgaSsrKVxuICAgIHtcbiAgICAgICAgbGV0IGJ1bGxldCA9IG5ldyBCdWxsZXQoY29uZmlnLmdhbWUsICdidWxsZXQxMicsIGNvbmZpZy5zb2NrZXQpXG4gICAgICAgIGJ1bGxldC5idWxsZXRJZCA9IEd1aWQoKVxuICAgICAgICBidWxsZXQuaGVpZ2h0ID0gMlxuICAgICAgICBidWxsZXQud2lkdGggPSA0MFxuICAgICAgICBidWxsZXQuZGFtYWdlID0gMjJcbiAgICAgICAgdGhpcy5hZGQoYnVsbGV0LCB0cnVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xufVxuXG5BSzQ3LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLkdyb3VwLnByb3RvdHlwZSk7XG5BSzQ3LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEFLNDc7XG5cbkFLNDcucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbihwbGF5ZXIsIHNvY2tldCwgcm9vbUlkKSB7XG4gICAgaWYgKHRoaXMuZ2FtZS50aW1lLnRpbWUgPCB0aGlzLm5leHRGaXJlKVxuICAgICAgICByZXR1cm5cblxuICAgIHZhciB4ID0gcGxheWVyLnggKyAxNTtcbiAgICB2YXIgeSA9IHBsYXllci55ICsgMzA7XG5cbiAgICB0aGlzLmdldEZpcnN0RXhpc3RzKGZhbHNlKS5maXJlKHgsIHksIDAsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDAsIHNvY2tldCwgcm9vbUlkKVxuICAgIHRoaXMuc2V0QWxsKCd0cmFja2luZycsIHRydWUpXG5cbiAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5nYW1lLnRpbWUudGltZSArIHRoaXMuZmlyZVJhdGVcbiAgICB0aGlzLmZ4LnZvbHVtZSA9IC4zXG4gICAgdGhpcy5meC5wbGF5KClcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBSzQ3XG4iLCIndXNlIHN0cmljdCdcblxubGV0IEJ1bGxldCA9IHJlcXVpcmUoJy4uL0J1bGxldCcpXG5sZXQgR3VpZCA9IHJlcXVpcmUoJy4uL0d1aWQnKVxuXG5sZXQgQUs0NyA9IGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCBjb25maWcuZ2FtZSwgY29uZmlnLmdhbWUud29ybGQsICdBSy00NycsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuXG4gICAgLy9cdEhlcmUgd2Ugc2V0LXVwIG91ciBhdWRpbyBzcHJpdGVcbiAgICB0aGlzLmZ4ID0gY29uZmlnLmdhbWUuYWRkLmF1ZGlvKCdBSzQ3LXNvdW5kJylcbiAgICB0aGlzLmFsbG93TXVsdGlwbGUgPSB0cnVlXG5cbiAgICB0aGlzLmRhbWFnZSA9IDIyXG4gICAgdGhpcy5uZXh0RmlyZSA9IDBcbiAgICB0aGlzLmJ1bGxldFNwZWVkID0gMjMwMFxuICAgIHRoaXMuZmlyZVJhdGUgPSAxNjA7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDY0OyBpKyspXG4gICAge1xuICAgICAgICBsZXQgYnVsbGV0ID0gbmV3IEJ1bGxldChjb25maWcuZ2FtZSwgJ2J1bGxldDEyJywgY29uZmlnLnNvY2tldClcbiAgICAgICAgYnVsbGV0LmJ1bGxldElkID0gR3VpZCgpXG4gICAgICAgIGJ1bGxldC5oZWlnaHQgPSAyXG4gICAgICAgIGJ1bGxldC53aWR0aCA9IDQwXG4gICAgICAgIGJ1bGxldC5kYW1hZ2UgPSAyMlxuICAgICAgICB0aGlzLmFkZChidWxsZXQsIHRydWUpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG59XG5cbkFLNDcucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcbkFLNDcucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQUs0NztcblxuQUs0Ny5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uKHBsYXllciwgc29ja2V0LCByb29tSWQsIHZvbHVtZSkge1xuICAgIGlmICh0aGlzLmdhbWUudGltZS50aW1lIDwgdGhpcy5uZXh0RmlyZSlcbiAgICAgICAgcmV0dXJuXG5cbiAgICB2YXIgeCA9IHBsYXllci54ICsgMTU7XG4gICAgdmFyIHkgPSBwbGF5ZXIueSArIDMwO1xuXG4gICAgdGhpcy5nZXRGaXJzdEV4aXN0cyhmYWxzZSkuZmlyZSh4LCB5LCAwLCB0aGlzLmJ1bGxldFNwZWVkLCAwLCAwLCBzb2NrZXQsIHJvb21JZClcbiAgICB0aGlzLnNldEFsbCgndHJhY2tpbmcnLCB0cnVlKVxuXG4gICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMuZ2FtZS50aW1lLnRpbWUgKyB0aGlzLmZpcmVSYXRlXG4gICAgY29uc29sZS5sb2codm9sdW1lKVxuICAgIGNvbnNvbGUubG9nKC4zICogdm9sdW1lKVxuICAgIHRoaXMuZngudm9sdW1lID0gLjMgKiB2b2x1bWVcbiAgICB0aGlzLmZ4LnBsYXkoKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFLNDdcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgQnVsbGV0ID0gcmVxdWlyZSgnLi4vQnVsbGV0JylcbmxldCBHdWlkID0gcmVxdWlyZSgnLi4vR3VpZCcpXG5cbmxldCBBSzQ3ID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGNvbmZpZy5nYW1lLCBjb25maWcuZ2FtZS53b3JsZCwgJ000QTEnLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcblxuICAgIC8vXHRIZXJlIHdlIHNldC11cCBvdXIgYXVkaW8gc3ByaXRlXG4gICAgdGhpcy5meCA9IGNvbmZpZy5nYW1lLmFkZC5hdWRpbygnTTRBMS1zb3VuZCcpXG4gICAgdGhpcy5hbGxvd011bHRpcGxlID0gdHJ1ZVxuXG4gICAgdGhpcy5kYW1hZ2UgPSAyMFxuICAgIHRoaXMubmV4dEZpcmUgPSAwXG4gICAgdGhpcy5idWxsZXRTcGVlZCA9IDI0MDBcbiAgICB0aGlzLmZpcmVSYXRlID0gMTUwO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA2NDsgaSsrKVxuICAgIHtcbiAgICAgICAgbGV0IGJ1bGxldCA9IG5ldyBCdWxsZXQoY29uZmlnLmdhbWUsICdidWxsZXQxMicsIGNvbmZpZy5zb2NrZXQpXG4gICAgICAgIGJ1bGxldC5idWxsZXRJZCA9IEd1aWQoKVxuICAgICAgICBidWxsZXQuaGVpZ2h0ID0gMlxuICAgICAgICBidWxsZXQud2lkdGggPSA0MFxuICAgICAgICBidWxsZXQuZGFtYWdlID0gMjJcbiAgICAgICAgdGhpcy5hZGQoYnVsbGV0LCB0cnVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xufVxuXG5BSzQ3LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLkdyb3VwLnByb3RvdHlwZSk7XG5BSzQ3LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEFLNDc7XG5cbkFLNDcucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbihwbGF5ZXIsIHNvY2tldCwgcm9vbUlkKSB7XG4gICAgaWYgKHRoaXMuZ2FtZS50aW1lLnRpbWUgPCB0aGlzLm5leHRGaXJlKVxuICAgICAgICByZXR1cm5cblxuICAgIHZhciB4ID0gcGxheWVyLnggKyAxNTtcbiAgICB2YXIgeSA9IHBsYXllci55ICsgMzA7XG5cbiAgICB0aGlzLmdldEZpcnN0RXhpc3RzKGZhbHNlKS5maXJlKHgsIHksIDAsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDAsIHNvY2tldCwgcm9vbUlkKVxuICAgIHRoaXMuc2V0QWxsKCd0cmFja2luZycsIHRydWUpXG5cbiAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5nYW1lLnRpbWUudGltZSArIHRoaXMuZmlyZVJhdGVcbiAgICB0aGlzLmZ4LnZvbHVtZSA9IC4zXG4gICAgdGhpcy5meC5wbGF5KClcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBSzQ3XG4iLCIndXNlIHN0cmljdCdcblxubGV0IEJ1bGxldCA9IHJlcXVpcmUoJy4uL0J1bGxldCcpXG5sZXQgR3VpZCA9IHJlcXVpcmUoJy4uL0d1aWQnKVxuXG5sZXQgU3BhczEyID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGNvbmZpZy5nYW1lLCBjb25maWcuZ2FtZS53b3JsZCwgJ1NwYXMtMTInLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKVxuXG4gICAgdGhpcy5uZXh0RmlyZSA9IDBcbiAgICB0aGlzLmJ1bGxldFNwZWVkID0gMTkwMFxuICAgIHRoaXMuZmlyZVJhdGUgPSA1MDBcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMzI7IGkrKylcbiAgICB7XG4gICAgICAgIGxldCBidWxsZXQgPSBuZXcgQnVsbGV0KGNvbmZpZy5nYW1lLCAnYnVsbGV0MTInLCBjb25maWcuc29ja2V0KVxuICAgICAgICBidWxsZXQuYnVsbGV0SWQgPSBHdWlkKClcbiAgICAgICAgYnVsbGV0LmhlaWdodCA9IDJcbiAgICAgICAgYnVsbGV0LndpZHRoID0gNDBcbiAgICAgICAgYnVsbGV0LmRhbWFnZSA9IDIyXG4gICAgICAgIHRoaXMuYWRkKGJ1bGxldCwgdHJ1ZSlcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xufVxuXG5TcGFzMTIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKVxuU3BhczEyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFNwYXMxMlxuXG5TcGFzMTIucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbiAocGxheWVyLCBzb2NrZXQsIHJvb21JZCkge1xuICAgIGlmICh0aGlzLmdhbWUudGltZS50aW1lIDwgdGhpcy5uZXh0RmlyZSlcbiAgICAgICAgcmV0dXJuXG5cblxuXG5cblxuICAgIHZhciB4ID0gcGxheWVyLnggKyAxNVxuICAgIHZhciB5ID0gcGxheWVyLnkgKyAzMFxuXG5cblxuICAgIHZhciBidWxsZXRJbnN0YW5jZSA9IHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpXG4gICAgaWYgKCFidWxsZXRJbnN0YW5jZSkgcmV0dXJuXG4gICAgYnVsbGV0SW5zdGFuY2UuZmlyZSh4LCB5LCAuMywgdGhpcy5idWxsZXRTcGVlZCwgMCwgMCwgc29ja2V0LCByb29tSWQpXG5cblxuXG5cbiAgICBidWxsZXRJbnN0YW5jZSA9IHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpXG4gICAgaWYgKCFidWxsZXRJbnN0YW5jZSkgcmV0dXJuXG4gICAgYnVsbGV0SW5zdGFuY2UuZmlyZSh4LCB5LCAtMC4zLCB0aGlzLmJ1bGxldFNwZWVkLCAwLCAwLCBzb2NrZXQsIHJvb21JZClcblxuXG5cbiAgICBidWxsZXRJbnN0YW5jZSA9IHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpXG4gICAgaWYgKCFidWxsZXRJbnN0YW5jZSkgcmV0dXJuXG4gICAgYnVsbGV0SW5zdGFuY2UuZmlyZSh4LCB5LCAwLCB0aGlzLmJ1bGxldFNwZWVkLCAwLCAwLCBzb2NrZXQsIHJvb21JZClcblxuXG5cblxuXG4gICAgYnVsbGV0SW5zdGFuY2UgPSB0aGlzLmdldEZpcnN0RXhpc3RzKGZhbHNlKVxuICAgIGlmICghYnVsbGV0SW5zdGFuY2UpIHJldHVyblxuICAgIGJ1bGxldEluc3RhbmNlLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgMCwgc29ja2V0LCByb29tSWQpXG5cblxuXG5cbiAgICB0aGlzLnNldEFsbCgndHJhY2tpbmcnLCB0cnVlKVxuXG4gICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMuZ2FtZS50aW1lLnRpbWUgKyB0aGlzLmZpcmVSYXRlXG59XG5cbm1vZHVsZS5leHBvcnRzID0gU3BhczEyXG4iLCIndXNlIHN0cmljdCdcblxubGV0IEJ1bGxldCA9IHJlcXVpcmUoJy4uL0J1bGxldCcpXG5sZXQgR3VpZCA9IHJlcXVpcmUoJy4uL0d1aWQnKVxuXG5sZXQgQUs0NyA9IGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCBjb25maWcuZ2FtZSwgY29uZmlnLmdhbWUud29ybGQsICdBSy00NycsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuXG4gICAgLy9cdEhlcmUgd2Ugc2V0LXVwIG91ciBhdWRpbyBzcHJpdGVcbiAgICB0aGlzLmZ4ID0gY29uZmlnLmdhbWUuYWRkLmF1ZGlvKCdBSzQ3LXNvdW5kJylcbiAgICB0aGlzLmFsbG93TXVsdGlwbGUgPSB0cnVlXG5cbiAgICB0aGlzLmRhbWFnZSA9IDIyXG4gICAgdGhpcy5uZXh0RmlyZSA9IDBcbiAgICB0aGlzLmJ1bGxldFNwZWVkID0gMjMwMFxuICAgIHRoaXMuZmlyZVJhdGUgPSAxNjA7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDY0OyBpKyspXG4gICAge1xuICAgICAgICBsZXQgYnVsbGV0ID0gbmV3IEJ1bGxldChjb25maWcuZ2FtZSwgJ2J1bGxldDEyJywgY29uZmlnLnNvY2tldClcbiAgICAgICAgYnVsbGV0LmJ1bGxldElkID0gR3VpZCgpXG4gICAgICAgIGJ1bGxldC5oZWlnaHQgPSAyXG4gICAgICAgIGJ1bGxldC53aWR0aCA9IDQwXG4gICAgICAgIGJ1bGxldC5kYW1hZ2UgPSAyMlxuICAgICAgICB0aGlzLmFkZChidWxsZXQsIHRydWUpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG59XG5cbkFLNDcucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcbkFLNDcucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQUs0NztcblxuQUs0Ny5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uKHBsYXllciwgc29ja2V0LCByb29tSWQsIHZvbHVtZSkge1xuICAgIGlmICh0aGlzLmdhbWUudGltZS50aW1lIDwgdGhpcy5uZXh0RmlyZSlcbiAgICAgICAgcmV0dXJuXG5cbiAgICB2YXIgeCA9IHBsYXllci54ICsgMTU7XG4gICAgdmFyIHkgPSBwbGF5ZXIueSArIDMwO1xuXG4gICAgdGhpcy5nZXRGaXJzdEV4aXN0cyhmYWxzZSkuZmlyZSh4LCB5LCAwLCB0aGlzLmJ1bGxldFNwZWVkLCAwLCAwLCBzb2NrZXQsIHJvb21JZClcbiAgICB0aGlzLnNldEFsbCgndHJhY2tpbmcnLCB0cnVlKVxuXG4gICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMuZ2FtZS50aW1lLnRpbWUgKyB0aGlzLmZpcmVSYXRlXG4gICAgY29uc29sZS5sb2codm9sdW1lKVxuICAgIGNvbnNvbGUubG9nKC4zICogdm9sdW1lKVxuICAgIHRoaXMuZngudm9sdW1lID0gLjMgKiB2b2x1bWVcbiAgICB0aGlzLmZ4LnBsYXkoKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFLNDdcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgQnVsbGV0ID0gcmVxdWlyZSgnLi4vQnVsbGV0JylcbmxldCBHdWlkID0gcmVxdWlyZSgnLi4vR3VpZCcpXG5cbmxldCBBSzQ3ID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGNvbmZpZy5nYW1lLCBjb25maWcuZ2FtZS53b3JsZCwgJ0FLLTQ3JywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG5cbiAgICAvL1x0SGVyZSB3ZSBzZXQtdXAgb3VyIGF1ZGlvIHNwcml0ZVxuICAgIHRoaXMuZnggPSBjb25maWcuZ2FtZS5hZGQuYXVkaW8oJ0FLNDctc291bmQnKVxuICAgIHRoaXMuYWxsb3dNdWx0aXBsZSA9IHRydWVcblxuICAgIHRoaXMuZGFtYWdlID0gMjJcbiAgICB0aGlzLm5leHRGaXJlID0gMFxuICAgIHRoaXMuYnVsbGV0U3BlZWQgPSAyMzAwXG4gICAgdGhpcy5maXJlUmF0ZSA9IDE2MDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNjQ7IGkrKylcbiAgICB7XG4gICAgICAgIGxldCBidWxsZXQgPSBuZXcgQnVsbGV0KGNvbmZpZy5nYW1lLCAnYnVsbGV0MTInLCBjb25maWcuc29ja2V0KVxuICAgICAgICBidWxsZXQuYnVsbGV0SWQgPSBHdWlkKClcbiAgICAgICAgYnVsbGV0LmhlaWdodCA9IDJcbiAgICAgICAgYnVsbGV0LndpZHRoID0gNDBcbiAgICAgICAgYnVsbGV0LmRhbWFnZSA9IDIyXG4gICAgICAgIHRoaXMuYWRkKGJ1bGxldCwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbn1cblxuQUs0Ny5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuQUs0Ny5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBBSzQ3O1xuXG5BSzQ3LnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24ocGxheWVyLCBzb2NrZXQsIHJvb21JZCwgdm9sdW1lKSB7XG4gICAgaWYgKHRoaXMuZ2FtZS50aW1lLnRpbWUgPCB0aGlzLm5leHRGaXJlKVxuICAgICAgICByZXR1cm5cblxuICAgIHZhciB4ID0gcGxheWVyLnggKyAxNTtcbiAgICB2YXIgeSA9IHBsYXllci55ICsgMzA7XG5cbiAgICB0aGlzLmdldEZpcnN0RXhpc3RzKGZhbHNlKS5maXJlKHgsIHksIDAsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDAsIHNvY2tldCwgcm9vbUlkKVxuICAgIHRoaXMuc2V0QWxsKCd0cmFja2luZycsIHRydWUpXG5cbiAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5nYW1lLnRpbWUudGltZSArIHRoaXMuZmlyZVJhdGVcbiAgICB0aGlzLmZ4LnZvbHVtZSA9IC4zICogdm9sdW1lXG4gICAgdGhpcy5meC5wbGF5KClcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBSzQ3XG5cblxuLy9cbi8vIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIC8vICBSUEcgdGhhdCB2aXN1YWxseSB0cmFjayB0aGUgZGlyZWN0aW9uIHRoZXkncmUgaGVhZGluZyBpbiAvL1xuLy8gLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy9cbi8vIFdlYXBvbi5SUEcgPSBmdW5jdGlvbiAoZ2FtZSkge1xuLy9cbi8vICAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCBnYW1lLCBnYW1lLndvcmxkLCAnUlBHJywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG4vL1xuLy8gICAgIHRoaXMubmV4dEZpcmUgPSAwO1xuLy8gICAgIHRoaXMuYnVsbGV0U3BlZWQgPSA0MDA7XG4vLyAgICAgdGhpcy5maXJlUmF0ZSA9IDI1MDtcbi8vXG4vLyAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzMjsgaSsrKVxuLy8gICAgIHtcbi8vICAgICAgICAgdGhpcy5hZGQobmV3IEJ1bGxldChnYW1lLCAnYnVsbGV0MTAnKSwgdHJ1ZSk7XG4vLyAgICAgfVxuLy9cbi8vICAgICB0aGlzLnNldEFsbCgndHJhY2tpbmcnLCB0cnVlKVxuLy9cbi8vICAgICByZXR1cm4gdGhpcztcbi8vXG4vLyB9O1xuLy9cbi8vIFdlYXBvbi5SUEcucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcbi8vIFdlYXBvbi5SUEcucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gV2VhcG9uLlJQRztcbi8vXG4vLyBXZWFwb24uUlBHLnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24gKHNvdXJjZSkge1xuLy9cbi8vICAgICBpZiAodGhpcy5nYW1lLnRpbWUudGltZSA8IHRoaXMubmV4dEZpcmUpIHsgcmV0dXJuOyB9XG4vL1xuLy8gICAgIHZhciB4ID0gc291cmNlLnggKyAxMDtcbi8vICAgICB2YXIgeSA9IHNvdXJjZS55ICsgMTA7XG4vL1xuLy8gICAgIHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgLTcwMCk7XG4vLyAgICAgdGhpcy5nZXRGaXJzdEV4aXN0cyhmYWxzZSkuZmlyZSh4LCB5LCAwLCB0aGlzLmJ1bGxldFNwZWVkLCAwLCA3MDApO1xuLy9cbi8vICAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5nYW1lLnRpbWUudGltZSArIHRoaXMuZmlyZVJhdGU7XG4vL1xuLy8gfTtcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgQnVsbGV0ID0gcmVxdWlyZSgnLi4vQnVsbGV0JylcbmxldCBHdWlkID0gcmVxdWlyZSgnLi4vR3VpZCcpXG5cbmxldCBBSzQ3ID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGNvbmZpZy5nYW1lLCBjb25maWcuZ2FtZS53b3JsZCwgJ0FLLTQ3JywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG5cbiAgICAvL1x0SGVyZSB3ZSBzZXQtdXAgb3VyIGF1ZGlvIHNwcml0ZVxuICAgIHRoaXMuZnggPSBjb25maWcuZ2FtZS5hZGQuYXVkaW8oJ0FLNDctc291bmQnKVxuICAgIHRoaXMuYWxsb3dNdWx0aXBsZSA9IHRydWVcblxuICAgIHRoaXMuZGFtYWdlID0gMjJcbiAgICB0aGlzLm5leHRGaXJlID0gMFxuICAgIHRoaXMuYnVsbGV0U3BlZWQgPSAyMzAwXG4gICAgdGhpcy5maXJlUmF0ZSA9IDE2MDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNjQ7IGkrKylcbiAgICB7XG4gICAgICAgIGxldCBidWxsZXQgPSBuZXcgQnVsbGV0KGNvbmZpZy5nYW1lLCAnYnVsbGV0MTInLCBjb25maWcuc29ja2V0KVxuICAgICAgICBidWxsZXQuYnVsbGV0SWQgPSBHdWlkKClcbiAgICAgICAgYnVsbGV0LmhlaWdodCA9IDJcbiAgICAgICAgYnVsbGV0LndpZHRoID0gNDBcbiAgICAgICAgYnVsbGV0LmRhbWFnZSA9IDIyXG4gICAgICAgIHRoaXMuYWRkKGJ1bGxldCwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbn1cblxuQUs0Ny5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuQUs0Ny5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBBSzQ3O1xuXG5BSzQ3LnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24ocGxheWVyLCBzb2NrZXQsIHJvb21JZCwgdm9sdW1lKSB7XG4gICAgaWYgKHRoaXMuZ2FtZS50aW1lLnRpbWUgPCB0aGlzLm5leHRGaXJlKVxuICAgICAgICByZXR1cm5cblxuICAgIHZhciB4ID0gcGxheWVyLnggKyAxNTtcbiAgICB2YXIgeSA9IHBsYXllci55ICsgMzA7XG5cbiAgICB0aGlzLmdldEZpcnN0RXhpc3RzKGZhbHNlKS5maXJlKHgsIHksIDAsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDAsIHNvY2tldCwgcm9vbUlkKVxuICAgIHRoaXMuc2V0QWxsKCd0cmFja2luZycsIHRydWUpXG5cbiAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5nYW1lLnRpbWUudGltZSArIHRoaXMuZmlyZVJhdGVcbiAgICB0aGlzLmZ4LnZvbHVtZSA9IC4zICogdm9sdW1lXG4gICAgdGhpcy5meC5wbGF5KClcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBSzQ3XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgXCJBSzQ3XCI6IHJlcXVpcmUoJy4vQUs0NycpLFxuICAgIFwiQmFycmV0dFwiOiByZXF1aXJlKCcuL0JhcnJldHQnKSxcbiAgICBcIkRlc2VydEVhZ2xlXCI6IHJlcXVpcmUoJy4vRGVzZXJ0RWFnbGUnKSxcbiAgICBcIk00QTFcIjogcmVxdWlyZSgnLi9NNEExJyksXG4gICAgXCJNNTAwXCI6IHJlcXVpcmUoJy4vTTUwMCcpLFxuICAgIFwiU2tvcnBpb25cIjogcmVxdWlyZSgnLi9Ta29ycGlvbicpLFxuICAgIFwiQXVnXCI6IHJlcXVpcmUoJy4vQXVnJyksXG4gICAgXCJSUEdcIjogcmVxdWlyZSgnLi9SUEcnKSxcbiAgICBcIlA5MFwiOiByZXF1aXJlKCcuL1A5MCcpLFxuICAgIFwiRzQzXCI6IHJlcXVpcmUoJy4vRzQzJylcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgSGlnaFJ1bGVEZXNlcnQgPSB7fVxuXG5IaWdoUnVsZURlc2VydC5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNwYXduUG9pbnRzID0gW1xuICAgICAgICB7XG4gICAgICAgICAgICB4OiA4MTUsXG4gICAgICAgICAgICB5OiAxNzMwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIHg6IDMzODAsXG4gICAgICAgICAgICB5OiAxMDMwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIHg6IDQ0MzcsXG4gICAgICAgICAgICB5OiAxNTUwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIHg6IDY2OTAsXG4gICAgICAgICAgICB5OiAxODYwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIHg6IDM4MzIsXG4gICAgICAgICAgICB5OiAzMzUwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIHg6IDM3NzUsXG4gICAgICAgICAgICB5OiAyNDAwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIHg6IDI0MjAsXG4gICAgICAgICAgICB5OiAyOTAwXG4gICAgICAgIH1cbiAgICBdXG5cbiAgICBIaWdoUnVsZURlc2VydC5jcmVhdGVTa3lTcHJpdGUuY2FsbCh0aGlzKVxuICAgIEhpZ2hSdWxlRGVzZXJ0LmNyZWF0ZVBsYXRmb3Jtcy5jYWxsKHRoaXMpXG4gICAgSGlnaFJ1bGVEZXNlcnQuY3JlYXRlTGVkZ2VzLmNhbGwodGhpcylcblxuICAgIHRoaXMucGxhdGZvcm1zLnNldEFsbCgnYm9keS5pbW1vdmFibGUnLCB0cnVlKVxuICAgIHRoaXMucGxhdGZvcm1zLnNldEFsbCgnYm9keS5hbGxvd0dyYXZpdHknLCBmYWxzZSlcbn1cblxuSGlnaFJ1bGVEZXNlcnQuY3JlYXRlU2t5U3ByaXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5za3lzcHJpdGUgPSB0aGlzLmFkZC50aWxlU3ByaXRlKDAsIHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSAzOTMwLCB0aGlzLmdhbWUud29ybGQud2lkdGgsIHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQsICdtYXAtYmcnKVxufVxuXG5IaWdoUnVsZURlc2VydC5jcmVhdGVQbGF0Zm9ybXMgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnBsYXRmb3JtcyA9IHRoaXMuYWRkLmdyb3VwKClcbiAgICB0aGlzLnBsYXRmb3Jtcy5lbmFibGVCb2R5ID0gdHJ1ZVxufVxuXG5IaWdoUnVsZURlc2VydC5nZXRSYW5kb21TcGF3blBvaW50ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIF8uc2FtcGxlKHRoaXMuc3Bhd25Qb2ludHMpXG59XG5cbkhpZ2hSdWxlRGVzZXJ0LmNyZWF0ZUxlZGdlcyA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBsZWRnZXMgPSBbXG4gICAgICAgIHsgaWQ6IDEsIHg6IDIxNDUsIHk6IDIxMDIsIHdpZHRoOiAxMzUsIGhlaWdodDogNDAgfSxcbiAgICAgICAgeyBpZDogMiwgeDogMjYxMywgeTogMTEzNCwgd2lkdGg6IDExMDAsIGhlaWdodDogMTEyIH0sXG4gICAgICAgIHsgaWQ6IDMsIHg6IDM2NTcsIHk6IDM0ODMsIHdpZHRoOiA1NDUsIGhlaWdodDogNTAwIH0sXG4gICAgICAgIHsgaWQ6IDQsIHg6IDUyMTcsIHk6IDE5NzUsIHdpZHRoOiAzODAsIGhlaWdodDogNjAwIH0sXG4gICAgICAgIHsgaWQ6IDUsIHg6IDQyMiwgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDIxMDUsIHdpZHRoOiAxMTUwLCBoZWlnaHQ6IDMwMCB9LFxuICAgICAgICB7IGlkOiA2LCB4OiAxNTU1LCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gMjE4MCwgd2lkdGg6IDI3MCwgaGVpZ2h0OiA3MzAgfSxcbiAgICAgICAgeyBpZDogNywgeDogMTgyMCwgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDIxODAsIHdpZHRoOiA0NzAsIGhlaWdodDogNiB9LFxuICAgICAgICB7IGlkOiA4LCB4OiAyMjc1LCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gMjE4MCwgd2lkdGg6IDMyMCwgaGVpZ2h0OiA1MDAgfSxcbiAgICAgICAgeyBpZDogOSwgeDogMjU5NSwgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDIyNjAsIHdpZHRoOiAxMTIwLCBoZWlnaHQ6IDI2MCB9LFxuICAgICAgICB7IGlkOiAxMCwgeDogNDI5OSwgeTogMTY1OCwgd2lkdGg6IDM3NSwgaGVpZ2h0OiAxMzAwIH0sXG5cbiAgICAgICAgeyBpZDogMTEsIHg6IDE4MjUsIHk6IDIzMzUsIHdpZHRoOiAxNjAsIGhlaWdodDogMTUyIH0sXG4gICAgICAgIHsgaWQ6IDEyLCB4OiA1NjQ0LCB5OiAxNjEyLCB3aWR0aDogMzMwLCBoZWlnaHQ6IDIwIH0sXG4gICAgICAgIHsgaWQ6IDEzLCB4OiA0NjczLCB5OiAyMDU0LCB3aWR0aDogNTcwLCBoZWlnaHQ6IDI1NCB9LFxuICAgICAgICB7IGlkOiAxNCwgeDogMjk0OCwgeTogMzE3NCwgd2lkdGg6IDM4MCwgaGVpZ2h0OiAzMDAgfSxcbiAgICAgICAgeyBpZDogMTUsIHg6IDM5NjUsIHk6IDIwNzAsIHdpZHRoOiAzNDEsIGhlaWdodDogNzAwIH0sXG4gICAgICAgIHsgaWQ6IDE2LCB4OiAxOTA5LCB5OiAzMDA4LCB3aWR0aDogMTA0MCwgaGVpZ2h0OiA1MDAgfSxcbiAgICAgICAgeyBpZDogMTcsIHg6IDY2MzIsIHk6IDE2NDQsIHdpZHRoOiAzODUsIGhlaWdodDogMzcgfSxcbiAgICAgICAgeyBpZDogMTgsIHg6IDY2MzIsIHk6IDEyMzQsIHdpZHRoOiAzODUsIGhlaWdodDogMzcgfSxcbiAgICAgICAgeyBpZDogMTksIHg6IDU1OTAsIHk6IDIwNzUsIHdpZHRoOiAxNTcwLCBoZWlnaHQ6IDYwMCB9LFxuICAgICAgICB7IGlkOiAyMCwgeDogNjk4MSwgeTogMjA1MCwgd2lkdGg6IDQ1MCwgaGVpZ2h0OiAxNjcgfSxcbiAgICAgICAgeyBpZDogMjEsIHg6IDM2NjAsIHk6IDI0MzgsIHdpZHRoOiAzMTAsIGhlaWdodDogNTAwIH0sXG4gICAgICAgIHsgaWQ6IDIyLCB4OiAzMjkwLCB5OiAyNjM2LCB3aWR0aDogNDAwLCBoZWlnaHQ6IDMwMCB9XG4gICAgXVxuXG4gICAgbGVkZ2VzLmZvckVhY2goKGxlZGdlKSA9PiB7XG4gICAgICAgIC8vIHZhciBuZXdMZWRnZSA9IHRoaXMucGxhdGZvcm1zLmNyZWF0ZShsZWRnZS54LCBsZWRnZS55LCAnZ3JvdW5kJylcbiAgICAgICAgdmFyIG5ld0xlZGdlID0gdGhpcy5wbGF0Zm9ybXMuY3JlYXRlKGxlZGdlLngsIGxlZGdlLnkpXG4gICAgICAgIG5ld0xlZGdlLmhlaWdodCA9IGxlZGdlLmhlaWdodFxuICAgICAgICBuZXdMZWRnZS53aWR0aCA9IGxlZGdlLndpZHRoXG5cbiAgICAgICAgLy8gRGVidWcgc3R1ZmZcbiAgICAgICAgLy8gbmV3TGVkZ2UuYWxwaGEgPSAwLjJcbiAgICAgICAgLy8gbGV0IHN0eWxlID0geyBmb250OiBcIjIwcHggQXJpYWxcIiwgZmlsbDogXCIjZmYwMDQ0XCIsIGFsaWduOiBcImNlbnRlclwiLCBiYWNrZ3JvdW5kQ29sb3I6IFwiI2ZmZmYwMFwiIH1cbiAgICAgICAgLy8gbGV0IHRleHQgPSB0aGlzLmdhbWUuYWRkLnRleHQobGVkZ2UueCwgbGVkZ2UueSwgbGVkZ2UuaWQsIHN0eWxlKVxuICAgICAgICAvLyB0ZXh0LmFscGhhID0gMC4yXG4gICAgfSlcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBIaWdoUnVsZURlc2VydFxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYXNzaWduICAgICAgICA9IHJlcXVpcmUoJ2VzNS1leHQvb2JqZWN0L2Fzc2lnbicpXG4gICwgbm9ybWFsaXplT3B0cyA9IHJlcXVpcmUoJ2VzNS1leHQvb2JqZWN0L25vcm1hbGl6ZS1vcHRpb25zJylcbiAgLCBpc0NhbGxhYmxlICAgID0gcmVxdWlyZSgnZXM1LWV4dC9vYmplY3QvaXMtY2FsbGFibGUnKVxuICAsIGNvbnRhaW5zICAgICAgPSByZXF1aXJlKCdlczUtZXh0L3N0cmluZy8jL2NvbnRhaW5zJylcblxuICAsIGQ7XG5cbmQgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChkc2NyLCB2YWx1ZS8qLCBvcHRpb25zKi8pIHtcblx0dmFyIGMsIGUsIHcsIG9wdGlvbnMsIGRlc2M7XG5cdGlmICgoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHx8ICh0eXBlb2YgZHNjciAhPT0gJ3N0cmluZycpKSB7XG5cdFx0b3B0aW9ucyA9IHZhbHVlO1xuXHRcdHZhbHVlID0gZHNjcjtcblx0XHRkc2NyID0gbnVsbDtcblx0fSBlbHNlIHtcblx0XHRvcHRpb25zID0gYXJndW1lbnRzWzJdO1xuXHR9XG5cdGlmIChkc2NyID09IG51bGwpIHtcblx0XHRjID0gdyA9IHRydWU7XG5cdFx0ZSA9IGZhbHNlO1xuXHR9IGVsc2Uge1xuXHRcdGMgPSBjb250YWlucy5jYWxsKGRzY3IsICdjJyk7XG5cdFx0ZSA9IGNvbnRhaW5zLmNhbGwoZHNjciwgJ2UnKTtcblx0XHR3ID0gY29udGFpbnMuY2FsbChkc2NyLCAndycpO1xuXHR9XG5cblx0ZGVzYyA9IHsgdmFsdWU6IHZhbHVlLCBjb25maWd1cmFibGU6IGMsIGVudW1lcmFibGU6IGUsIHdyaXRhYmxlOiB3IH07XG5cdHJldHVybiAhb3B0aW9ucyA/IGRlc2MgOiBhc3NpZ24obm9ybWFsaXplT3B0cyhvcHRpb25zKSwgZGVzYyk7XG59O1xuXG5kLmdzID0gZnVuY3Rpb24gKGRzY3IsIGdldCwgc2V0LyosIG9wdGlvbnMqLykge1xuXHR2YXIgYywgZSwgb3B0aW9ucywgZGVzYztcblx0aWYgKHR5cGVvZiBkc2NyICE9PSAnc3RyaW5nJykge1xuXHRcdG9wdGlvbnMgPSBzZXQ7XG5cdFx0c2V0ID0gZ2V0O1xuXHRcdGdldCA9IGRzY3I7XG5cdFx0ZHNjciA9IG51bGw7XG5cdH0gZWxzZSB7XG5cdFx0b3B0aW9ucyA9IGFyZ3VtZW50c1szXTtcblx0fVxuXHRpZiAoZ2V0ID09IG51bGwpIHtcblx0XHRnZXQgPSB1bmRlZmluZWQ7XG5cdH0gZWxzZSBpZiAoIWlzQ2FsbGFibGUoZ2V0KSkge1xuXHRcdG9wdGlvbnMgPSBnZXQ7XG5cdFx0Z2V0ID0gc2V0ID0gdW5kZWZpbmVkO1xuXHR9IGVsc2UgaWYgKHNldCA9PSBudWxsKSB7XG5cdFx0c2V0ID0gdW5kZWZpbmVkO1xuXHR9IGVsc2UgaWYgKCFpc0NhbGxhYmxlKHNldCkpIHtcblx0XHRvcHRpb25zID0gc2V0O1xuXHRcdHNldCA9IHVuZGVmaW5lZDtcblx0fVxuXHRpZiAoZHNjciA9PSBudWxsKSB7XG5cdFx0YyA9IHRydWU7XG5cdFx0ZSA9IGZhbHNlO1xuXHR9IGVsc2Uge1xuXHRcdGMgPSBjb250YWlucy5jYWxsKGRzY3IsICdjJyk7XG5cdFx0ZSA9IGNvbnRhaW5zLmNhbGwoZHNjciwgJ2UnKTtcblx0fVxuXG5cdGRlc2MgPSB7IGdldDogZ2V0LCBzZXQ6IHNldCwgY29uZmlndXJhYmxlOiBjLCBlbnVtZXJhYmxlOiBlIH07XG5cdHJldHVybiAhb3B0aW9ucyA/IGRlc2MgOiBhc3NpZ24obm9ybWFsaXplT3B0cyhvcHRpb25zKSwgZGVzYyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vaXMtaW1wbGVtZW50ZWQnKSgpXG5cdD8gT2JqZWN0LmFzc2lnblxuXHQ6IHJlcXVpcmUoJy4vc2hpbScpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcblx0dmFyIGFzc2lnbiA9IE9iamVjdC5hc3NpZ24sIG9iajtcblx0aWYgKHR5cGVvZiBhc3NpZ24gIT09ICdmdW5jdGlvbicpIHJldHVybiBmYWxzZTtcblx0b2JqID0geyBmb286ICdyYXonIH07XG5cdGFzc2lnbihvYmosIHsgYmFyOiAnZHdhJyB9LCB7IHRyenk6ICd0cnp5JyB9KTtcblx0cmV0dXJuIChvYmouZm9vICsgb2JqLmJhciArIG9iai50cnp5KSA9PT0gJ3JhemR3YXRyenknO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGtleXMgID0gcmVxdWlyZSgnLi4va2V5cycpXG4gICwgdmFsdWUgPSByZXF1aXJlKCcuLi92YWxpZC12YWx1ZScpXG5cbiAgLCBtYXggPSBNYXRoLm1heDtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZGVzdCwgc3JjLyosIOKApnNyY24qLykge1xuXHR2YXIgZXJyb3IsIGksIGwgPSBtYXgoYXJndW1lbnRzLmxlbmd0aCwgMiksIGFzc2lnbjtcblx0ZGVzdCA9IE9iamVjdCh2YWx1ZShkZXN0KSk7XG5cdGFzc2lnbiA9IGZ1bmN0aW9uIChrZXkpIHtcblx0XHR0cnkgeyBkZXN0W2tleV0gPSBzcmNba2V5XTsgfSBjYXRjaCAoZSkge1xuXHRcdFx0aWYgKCFlcnJvcikgZXJyb3IgPSBlO1xuXHRcdH1cblx0fTtcblx0Zm9yIChpID0gMTsgaSA8IGw7ICsraSkge1xuXHRcdHNyYyA9IGFyZ3VtZW50c1tpXTtcblx0XHRrZXlzKHNyYykuZm9yRWFjaChhc3NpZ24pO1xuXHR9XG5cdGlmIChlcnJvciAhPT0gdW5kZWZpbmVkKSB0aHJvdyBlcnJvcjtcblx0cmV0dXJuIGRlc3Q7XG59O1xuIiwiLy8gRGVwcmVjYXRlZFxuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iaiA9PT0gJ2Z1bmN0aW9uJzsgfTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2lzLWltcGxlbWVudGVkJykoKVxuXHQ/IE9iamVjdC5rZXlzXG5cdDogcmVxdWlyZSgnLi9zaGltJyk7XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuXHR0cnkge1xuXHRcdE9iamVjdC5rZXlzKCdwcmltaXRpdmUnKTtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSBjYXRjaCAoZSkgeyByZXR1cm4gZmFsc2U7IH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBrZXlzID0gT2JqZWN0LmtleXM7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9iamVjdCkge1xuXHRyZXR1cm4ga2V5cyhvYmplY3QgPT0gbnVsbCA/IG9iamVjdCA6IE9iamVjdChvYmplY3QpKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBmb3JFYWNoID0gQXJyYXkucHJvdG90eXBlLmZvckVhY2gsIGNyZWF0ZSA9IE9iamVjdC5jcmVhdGU7XG5cbnZhciBwcm9jZXNzID0gZnVuY3Rpb24gKHNyYywgb2JqKSB7XG5cdHZhciBrZXk7XG5cdGZvciAoa2V5IGluIHNyYykgb2JqW2tleV0gPSBzcmNba2V5XTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9wdGlvbnMvKiwg4oCmb3B0aW9ucyovKSB7XG5cdHZhciByZXN1bHQgPSBjcmVhdGUobnVsbCk7XG5cdGZvckVhY2guY2FsbChhcmd1bWVudHMsIGZ1bmN0aW9uIChvcHRpb25zKSB7XG5cdFx0aWYgKG9wdGlvbnMgPT0gbnVsbCkgcmV0dXJuO1xuXHRcdHByb2Nlc3MoT2JqZWN0KG9wdGlvbnMpLCByZXN1bHQpO1xuXHR9KTtcblx0cmV0dXJuIHJlc3VsdDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGZuKSB7XG5cdGlmICh0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHRocm93IG5ldyBUeXBlRXJyb3IoZm4gKyBcIiBpcyBub3QgYSBmdW5jdGlvblwiKTtcblx0cmV0dXJuIGZuO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAodmFsdWUpIHtcblx0aWYgKHZhbHVlID09IG51bGwpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgdXNlIG51bGwgb3IgdW5kZWZpbmVkXCIpO1xuXHRyZXR1cm4gdmFsdWU7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vaXMtaW1wbGVtZW50ZWQnKSgpXG5cdD8gU3RyaW5nLnByb3RvdHlwZS5jb250YWluc1xuXHQ6IHJlcXVpcmUoJy4vc2hpbScpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgc3RyID0gJ3JhemR3YXRyenknO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcblx0aWYgKHR5cGVvZiBzdHIuY29udGFpbnMgIT09ICdmdW5jdGlvbicpIHJldHVybiBmYWxzZTtcblx0cmV0dXJuICgoc3RyLmNvbnRhaW5zKCdkd2EnKSA9PT0gdHJ1ZSkgJiYgKHN0ci5jb250YWlucygnZm9vJykgPT09IGZhbHNlKSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaW5kZXhPZiA9IFN0cmluZy5wcm90b3R5cGUuaW5kZXhPZjtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoc2VhcmNoU3RyaW5nLyosIHBvc2l0aW9uKi8pIHtcblx0cmV0dXJuIGluZGV4T2YuY2FsbCh0aGlzLCBzZWFyY2hTdHJpbmcsIGFyZ3VtZW50c1sxXSkgPiAtMTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBkICAgICAgICA9IHJlcXVpcmUoJ2QnKVxuICAsIGNhbGxhYmxlID0gcmVxdWlyZSgnZXM1LWV4dC9vYmplY3QvdmFsaWQtY2FsbGFibGUnKVxuXG4gICwgYXBwbHkgPSBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHksIGNhbGwgPSBGdW5jdGlvbi5wcm90b3R5cGUuY2FsbFxuICAsIGNyZWF0ZSA9IE9iamVjdC5jcmVhdGUsIGRlZmluZVByb3BlcnR5ID0gT2JqZWN0LmRlZmluZVByb3BlcnR5XG4gICwgZGVmaW5lUHJvcGVydGllcyA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzXG4gICwgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5XG4gICwgZGVzY3JpcHRvciA9IHsgY29uZmlndXJhYmxlOiB0cnVlLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUgfVxuXG4gICwgb24sIG9uY2UsIG9mZiwgZW1pdCwgbWV0aG9kcywgZGVzY3JpcHRvcnMsIGJhc2U7XG5cbm9uID0gZnVuY3Rpb24gKHR5cGUsIGxpc3RlbmVyKSB7XG5cdHZhciBkYXRhO1xuXG5cdGNhbGxhYmxlKGxpc3RlbmVyKTtcblxuXHRpZiAoIWhhc093blByb3BlcnR5LmNhbGwodGhpcywgJ19fZWVfXycpKSB7XG5cdFx0ZGF0YSA9IGRlc2NyaXB0b3IudmFsdWUgPSBjcmVhdGUobnVsbCk7XG5cdFx0ZGVmaW5lUHJvcGVydHkodGhpcywgJ19fZWVfXycsIGRlc2NyaXB0b3IpO1xuXHRcdGRlc2NyaXB0b3IudmFsdWUgPSBudWxsO1xuXHR9IGVsc2Uge1xuXHRcdGRhdGEgPSB0aGlzLl9fZWVfXztcblx0fVxuXHRpZiAoIWRhdGFbdHlwZV0pIGRhdGFbdHlwZV0gPSBsaXN0ZW5lcjtcblx0ZWxzZSBpZiAodHlwZW9mIGRhdGFbdHlwZV0gPT09ICdvYmplY3QnKSBkYXRhW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuXHRlbHNlIGRhdGFbdHlwZV0gPSBbZGF0YVt0eXBlXSwgbGlzdGVuZXJdO1xuXG5cdHJldHVybiB0aGlzO1xufTtcblxub25jZSA9IGZ1bmN0aW9uICh0eXBlLCBsaXN0ZW5lcikge1xuXHR2YXIgb25jZSwgc2VsZjtcblxuXHRjYWxsYWJsZShsaXN0ZW5lcik7XG5cdHNlbGYgPSB0aGlzO1xuXHRvbi5jYWxsKHRoaXMsIHR5cGUsIG9uY2UgPSBmdW5jdGlvbiAoKSB7XG5cdFx0b2ZmLmNhbGwoc2VsZiwgdHlwZSwgb25jZSk7XG5cdFx0YXBwbHkuY2FsbChsaXN0ZW5lciwgdGhpcywgYXJndW1lbnRzKTtcblx0fSk7XG5cblx0b25jZS5fX2VlT25jZUxpc3RlbmVyX18gPSBsaXN0ZW5lcjtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG5vZmYgPSBmdW5jdGlvbiAodHlwZSwgbGlzdGVuZXIpIHtcblx0dmFyIGRhdGEsIGxpc3RlbmVycywgY2FuZGlkYXRlLCBpO1xuXG5cdGNhbGxhYmxlKGxpc3RlbmVyKTtcblxuXHRpZiAoIWhhc093blByb3BlcnR5LmNhbGwodGhpcywgJ19fZWVfXycpKSByZXR1cm4gdGhpcztcblx0ZGF0YSA9IHRoaXMuX19lZV9fO1xuXHRpZiAoIWRhdGFbdHlwZV0pIHJldHVybiB0aGlzO1xuXHRsaXN0ZW5lcnMgPSBkYXRhW3R5cGVdO1xuXG5cdGlmICh0eXBlb2YgbGlzdGVuZXJzID09PSAnb2JqZWN0Jykge1xuXHRcdGZvciAoaSA9IDA7IChjYW5kaWRhdGUgPSBsaXN0ZW5lcnNbaV0pOyArK2kpIHtcblx0XHRcdGlmICgoY2FuZGlkYXRlID09PSBsaXN0ZW5lcikgfHxcblx0XHRcdFx0XHQoY2FuZGlkYXRlLl9fZWVPbmNlTGlzdGVuZXJfXyA9PT0gbGlzdGVuZXIpKSB7XG5cdFx0XHRcdGlmIChsaXN0ZW5lcnMubGVuZ3RoID09PSAyKSBkYXRhW3R5cGVdID0gbGlzdGVuZXJzW2kgPyAwIDogMV07XG5cdFx0XHRcdGVsc2UgbGlzdGVuZXJzLnNwbGljZShpLCAxKTtcblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0aWYgKChsaXN0ZW5lcnMgPT09IGxpc3RlbmVyKSB8fFxuXHRcdFx0XHQobGlzdGVuZXJzLl9fZWVPbmNlTGlzdGVuZXJfXyA9PT0gbGlzdGVuZXIpKSB7XG5cdFx0XHRkZWxldGUgZGF0YVt0eXBlXTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gdGhpcztcbn07XG5cbmVtaXQgPSBmdW5jdGlvbiAodHlwZSkge1xuXHR2YXIgaSwgbCwgbGlzdGVuZXIsIGxpc3RlbmVycywgYXJncztcblxuXHRpZiAoIWhhc093blByb3BlcnR5LmNhbGwodGhpcywgJ19fZWVfXycpKSByZXR1cm47XG5cdGxpc3RlbmVycyA9IHRoaXMuX19lZV9fW3R5cGVdO1xuXHRpZiAoIWxpc3RlbmVycykgcmV0dXJuO1xuXG5cdGlmICh0eXBlb2YgbGlzdGVuZXJzID09PSAnb2JqZWN0Jykge1xuXHRcdGwgPSBhcmd1bWVudHMubGVuZ3RoO1xuXHRcdGFyZ3MgPSBuZXcgQXJyYXkobCAtIDEpO1xuXHRcdGZvciAoaSA9IDE7IGkgPCBsOyArK2kpIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuXG5cdFx0bGlzdGVuZXJzID0gbGlzdGVuZXJzLnNsaWNlKCk7XG5cdFx0Zm9yIChpID0gMDsgKGxpc3RlbmVyID0gbGlzdGVuZXJzW2ldKTsgKytpKSB7XG5cdFx0XHRhcHBseS5jYWxsKGxpc3RlbmVyLCB0aGlzLCBhcmdzKTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0c3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG5cdFx0Y2FzZSAxOlxuXHRcdFx0Y2FsbC5jYWxsKGxpc3RlbmVycywgdGhpcyk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIDI6XG5cdFx0XHRjYWxsLmNhbGwobGlzdGVuZXJzLCB0aGlzLCBhcmd1bWVudHNbMV0pO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAzOlxuXHRcdFx0Y2FsbC5jYWxsKGxpc3RlbmVycywgdGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuXHRcdFx0YnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdGwgPSBhcmd1bWVudHMubGVuZ3RoO1xuXHRcdFx0YXJncyA9IG5ldyBBcnJheShsIC0gMSk7XG5cdFx0XHRmb3IgKGkgPSAxOyBpIDwgbDsgKytpKSB7XG5cdFx0XHRcdGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuXHRcdFx0fVxuXHRcdFx0YXBwbHkuY2FsbChsaXN0ZW5lcnMsIHRoaXMsIGFyZ3MpO1xuXHRcdH1cblx0fVxufTtcblxubWV0aG9kcyA9IHtcblx0b246IG9uLFxuXHRvbmNlOiBvbmNlLFxuXHRvZmY6IG9mZixcblx0ZW1pdDogZW1pdFxufTtcblxuZGVzY3JpcHRvcnMgPSB7XG5cdG9uOiBkKG9uKSxcblx0b25jZTogZChvbmNlKSxcblx0b2ZmOiBkKG9mZiksXG5cdGVtaXQ6IGQoZW1pdClcbn07XG5cbmJhc2UgPSBkZWZpbmVQcm9wZXJ0aWVzKHt9LCBkZXNjcmlwdG9ycyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IGZ1bmN0aW9uIChvKSB7XG5cdHJldHVybiAobyA9PSBudWxsKSA/IGNyZWF0ZShiYXNlKSA6IGRlZmluZVByb3BlcnRpZXMoT2JqZWN0KG8pLCBkZXNjcmlwdG9ycyk7XG59O1xuZXhwb3J0cy5tZXRob2RzID0gbWV0aG9kcztcbiJdfQ==
