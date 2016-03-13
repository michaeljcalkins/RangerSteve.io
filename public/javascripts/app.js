(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var ForestCtf = require('./maps/ForestCtf');
var RemotePlayer = require('./lib/RemotePlayer');
var Guid = require('./lib/Guid');
var Weapons = require('./lib/Weapons');
var InputHandler = require('./lib/InputHandler');

var gameWidth = window.innerWidth;
var gameHeight = window.innerHeight;
var worldWidth = 4000;
var worldHeight = 1500;

var game = new Phaser.Game(gameWidth, gameHeight, Phaser.CANVAS, 'ranger-steve-game');

var RangerSteveGame = function RangerSteveGame() {
    this.clientId = Guid();
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
    init: function init() {
        this.game.renderer.renderSession.roundPixels = true;
        this.game.stage.disableVisibilityChange = true;
        this.physics.startSystem(Phaser.Physics.ARCADE);
    },

    preload: function preload() {
        this.load.image('bullet11', '/images/bullet11.png');
        this.load.image('bullet10', '/images/bullet10.png');
        this.load.image('bullet9', '/images/bullet9.png');
        this.load.image('bullet8', '/images/bullet8.png');
        this.load.image('bullet7', '/images/bullet7.png');
        this.load.image('bullet5', '/images/bullet5.png');
        this.load.image('bullet4', '/images/bullet4.png');
        this.load.image('treescape', '/images/map-ctf1.png');
        this.load.image('ground', '/images/platform.png');
        this.load.spritesheet('dude', '/images/dude.png', 32, 48);
        this.load.spritesheet('enemy', '/images/dude.png', 32, 48);
    },

    create: function create() {
        var _this = this;

        this.socket = io.connect();
        this.enemies = [];

        //  We're going to be using physics, so enable the Arcade Physics system
        this.physics.startSystem(Phaser.Physics.ARCADE);

        this.world.setBounds(0, 0, worldWidth, worldHeight);
        this.game.stage.backgroundColor = "#2F91D0";

        // Scale game on window resize
        this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
        this.game.scale.setShowAll();
        this.game.scale.refresh();

        /**
         * Map
         */
        ForestCtf.create(this);

        // Define movement constants
        this.MAX_SPEED = 400; // pixels/second
        this.ACCELERATION = 1960; // pixels/second/second
        this.DRAG = 1500; // pixels/second
        this.GRAVITY = 1900; // pixels/second/second
        this.JUMP_SPEED = -850; // pixels/second (negative y is up)

        /**
         * Player Settings
         */
        this.player = this.add.sprite(200, this.world.height - 400, 'dude');

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

        // Since we're jumping we need gravity
        game.physics.arcade.gravity.y = this.GRAVITY;

        // Flag to track if the jump button is pressed
        this.jumping = false;

        //  Our two animations, walking left and right.
        this.player.animations.add('left', [0, 1, 2, 3], 10, true);
        this.player.animations.add('right', [5, 6, 7, 8], 10, true);

        /**
         * Weapons
         */
        this.currentWeapon = 0;
        this.weapons.push(new Weapons.AK47(this.game));
        this.weapons.push(new Weapons.BarretM82A1(this.game));

        /**
         * Text
         */
        var textStyles = { fontSize: '24px', fill: '#000' };
        this.scoreText = this.add.text(25, 25, 'Score: 0', textStyles);
        this.scoreText.fixedToCamera = true;
        this.weaponName = this.add.text(this.camera.width - 100, this.camera.height - 45, 'AK-47', textStyles);
        this.weaponName.fixedToCamera = true;
        this.currentHealthText = this.add.text(this.camera.x + 25, this.camera.height - 45, '100', textStyles);
        this.currentHealthText.fixedToCamera = true;

        /**
         * Camera Settings
         */
        this.camera.follow(this.player);

        var changeKey = this.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        changeKey.onDown.add(this.nextWeapon, this);

        /**
         * Resizing Events
         */
        window.addEventListener('resize', function () {
            _this.game.scale.refresh();
            _this.game.height = window.innerHeight;
            _this.game.width = window.innerWidth;

            _this.weaponName.cameraOffset.x = _this.camera.width - 100;
            _this.weaponName.cameraOffset.y = _this.camera.height - 45;

            _this.scoreText.cameraOffset.x = 25;
            _this.scoreText.cameraOffset.y = 25;
        });

        /**
         * Start listening for events
         */
        this.setEventHandlers();
    },

    update: function update() {
        //  Collide the player and the stars with the platforms
        this.physics.arcade.collide(this.player, this.platforms);
        this.physics.arcade.collide(this.platforms, this.weapons, function (platform, weapon) {
            weapon.kill();
        }, null, this);

        this.physics.arcade.collide(this.enemy, this.weapons, function (enemy, weapon) {
            enemy.health -= weapon.damage;
            weapon.kill();
            console.log('You hit them!', enemy.health, weapon.damage);
            if (enemy.health <= 0) {
                console.log('They are dead!');
                this.enemy.x = 200;
                this.enemy.y = 200;
                this.enemy.health = 100;
            }
        }, null, this);

        if (this.leftInputIsActive()) {
            // If the LEFT key is down, set the player velocity to move left
            this.player.body.acceleration.x = -this.ACCELERATION;
            this.player.animations.play('left');
        } else if (this.rightInputIsActive()) {
            // If the RIGHT key is down, set the player velocity to move right
            this.player.body.acceleration.x = this.ACCELERATION;
            this.player.animations.play('right');
        } else {
            // Stand still
            this.player.body.acceleration.x = 0;
            this.player.animations.stop();
            this.player.frame = 4;
        }

        // Set a variable that is true when the player is touching the ground
        var onTheGround = this.player.body.touching.down;

        // If the player is touching the ground, let him have 2 jumps
        if (onTheGround) {
            this.jumps = 2;
            this.jumping = false;
        }

        // Jump!
        if (this.jumps > 0 && this.upInputIsActive(5)) {
            this.player.body.velocity.y = this.JUMP_SPEED;
            this.jumping = true;
        }

        // Reduce the number of available jumps if the jump input is released
        if (this.jumping && this.upInputReleased()) {
            this.jumps--;
            this.jumping = false;
        }

        if (this.game.input.activePointer.isDown) {
            this.weapons[this.currentWeapon].fire(this.player);
        }

        this.socket.emit('move player', { x: this.player.x, y: this.player.y });
    },

    leftInputIsActive: InputHandler.leftInputIsActive,
    rightInputIsActive: InputHandler.rightInputIsActive,
    upInputIsActive: InputHandler.upInputIsActive,
    upInputReleased: InputHandler.upInputReleased,

    nextWeapon: function nextWeapon() {
        //  Tidy-up the current weapon
        if (this.currentWeapon > 9) {
            this.weapons[this.currentWeapon].reset();
        } else {
            this.weapons[this.currentWeapon].visible = false;
            this.weapons[this.currentWeapon].callAll('reset', null, 0, 0);
            this.weapons[this.currentWeapon].setAll('exists', false);
        }

        //  Activate the new one
        this.currentWeapon++;

        if (this.currentWeapon === this.weapons.length) {
            this.currentWeapon = 0;
        }

        this.weapons[this.currentWeapon].visible = true;

        this.weaponName.text = this.weapons[this.currentWeapon].name;
    },

    setEventHandlers: function setEventHandlers() {
        // Socket connection successful
        this.socket.on('connect', this.onSocketConnected.bind(this));

        // Socket disconnection
        this.socket.on('disconnect', this.onSocketDisconnect.bind(this));

        // Player move message received
        this.socket.on('move player', this.onMovePlayer.bind(this));

        // Player removed message received
        this.socket.on('remove player', this.onRemovePlayer.bind(this));

        // Updated list of players to sync enemies to
        this.socket.on('update players', this.onUpdatePlayers.bind(this));
    },

    onUpdatePlayers: function onUpdatePlayers(data) {
        var _this2 = this;

        this.enemies.forEach(function (enemy) {
            enemy.player.kill();
        });

        this.enemies = [];

        data.players.forEach(function (player) {
            if (player.id === '/#' + _this2.socket.id) return;

            var newRemotePlayer = RemotePlayer(player.id, _this2.game, _this2.player, player.x, player.y);
            _this2.enemies.push(newRemotePlayer);
            _this2.enemies[_this2.enemies.length - 1].player.animations.add('left', [0, 1, 2, 3], 10, true);
            _this2.enemies[_this2.enemies.length - 1].player.animations.add('right', [5, 6, 7, 8], 10, true);
        });
    },

    // Socket connected
    onSocketConnected: function onSocketConnected() {
        console.log('Connected to socket server');

        // Reset enemies on reconnect
        this.enemies.forEach(function (enemy) {
            enemy.kill();
        });
        this.enemies = [];

        // Send local player data to the game server
        this.socket.emit('new player', {
            clientId: this.clientId,
            x: this.player.x,
            y: this.player.y
        });
    },

    // Socket disconnected
    onSocketDisconnect: function onSocketDisconnect() {
        console.log('Disconnected from socket server');
    },

    // Move player
    onMovePlayer: function onMovePlayer(data) {
        var movePlayer = this.playerById(data.id);

        // console.log(data.id, movePlayer)

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
    },

    // Remove player
    onRemovePlayer: function onRemovePlayer(data) {
        var removePlayer = this.playerById(data.id);

        // Player not found
        if (!removePlayer) {
            console.log('Player not found: ', data.id);
            return;
        }

        removePlayer.player.kill();

        // Remove player from array
        this.enemies.splice(this.enemies.indexOf(removePlayer), 1);
    },

    // Find player by ID
    playerById: function playerById(id) {
        for (var i = 0; i < this.enemies.length; i++) {
            if (this.enemies[i].player.id === id) {
                return this.enemies[i];
            }
        }

        return false;
    }
};

game.state.add('Game', RangerSteveGame, true);

},{"./lib/Guid":3,"./lib/InputHandler":4,"./lib/RemotePlayer":5,"./lib/Weapons":8,"./maps/ForestCtf":9}],2:[function(require,module,exports){
'use strict';

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

Bullet.prototype.fire = function (x, y, angle, speed, gx, gy) {
    gx = gx || 0;
    gy = gy || 0;
    this.reset(x, y);
    // this.scale.set(1);

    this.game.physics.arcade.moveToPointer(this, speed);
    this.body.gravity.y = -1800;
};

Bullet.prototype.update = function () {
    if (this.tracking) {
        this.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x);
    }

    if (this.scaleSpeed > 0) {
        this.scale.x += this.scaleSpeed;
        this.scale.y += this.scaleSpeed;
    }
};

module.exports = Bullet;

},{}],3:[function(require,module,exports){
'use strict';

module.exports = function guidGenerator() {
   var S4 = function S4() {
      return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
   };

   return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
};

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

    // Our two animations, walking left and right.
    newRemotePlayer.player.animations.add('left', [0, 1, 2, 3], 10, true);
    newRemotePlayer.player.animations.add('right', [5, 6, 7, 8], 10, true);

    newRemotePlayer.player.id = id;

    return newRemotePlayer;
};

module.exports = RemotePlayer;

},{}],6:[function(require,module,exports){
'use strict';

var Bullet = require('../Bullet');

var AK47 = function AK47(game) {
    Phaser.Group.call(this, game, game.world, 'AK-47', false, true, Phaser.Physics.ARCADE);

    this.damage = 22;
    this.nextFire = 0;
    this.bulletSpeed = 1000;
    // AK47 fires about 600 bullets per second
    this.fireRate = 166.666667;

    for (var i = 0; i < 64; i++) {
        var bullet = new Bullet(this.game, 'ground');
        bullet.height = 2;
        bullet.width = 10;
        bullet.damage = 22;
        this.add(bullet, true);
    }

    return this;
};

AK47.prototype = Object.create(Phaser.Group.prototype);
AK47.prototype.constructor = AK47;

AK47.prototype.fire = function (source) {

    if (this.game.time.time < this.nextFire) return;

    var x = source.x + 15;
    var y = source.y + 30;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0);
    this.setAll('tracking', true);

    this.nextFire = this.game.time.time + this.fireRate;
};

module.exports = AK47;

},{"../Bullet":2}],7:[function(require,module,exports){
'use strict';

var Bullet = require('../Bullet');

var BarretM82A1 = function BarretM82A1(game) {
    Phaser.Group.call(this, game, game.world, 'AK-47', false, true, Phaser.Physics.ARCADE);

    this.name = 'Barret M82A1';
    this.damage = 88;
    this.nextFire = 0;
    this.bulletSpeed = 3435;

    // BarretM82A1 fires about 600 bullets per second
    this.fireRate = 4000;

    for (var i = 0; i < 64; i++) {
        var bullet = new Bullet(this.game, 'ground');
        bullet.height = 2;
        bullet.width = 10;
        bullet.damage = 88;

        this.add(bullet, true);
    }

    return this;
};

BarretM82A1.prototype = Object.create(Phaser.Group.prototype);
BarretM82A1.prototype.constructor = BarretM82A1;

BarretM82A1.prototype.fire = function (source) {
    if (this.game.time.time < this.nextFire) return;

    var x = source.x + 15;
    var y = source.y + 30;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0);
    this.setAll('tracking', true);

    this.nextFire = this.game.time.time + this.fireRate;
};

module.exports = BarretM82A1;

},{"../Bullet":2}],8:[function(require,module,exports){
'use strict';

/**
 * Primary Weapons
 * 1. Desert Eagles
 * 2. HK MP5
 * 3. AK47
 * 4. M16
 * 5. Spas-12
 * 6. Ruger 77
 * 7. M79
 * 8. Barret M82A1
 * 9. FN Minimi
 * 10. XM214 Minigun
 */

/**
 * Secondary Weapons
 * 1. USSOCOM
 * 2. Combat Knife
 * 3. Chainsaw
 * 4. M72 Law
 */

module.exports = {
  "AK47": require('./AK47'),
  "BarretM82A1": require('./BarretM82A1')
};

},{"./AK47":6,"./BarretM82A1":7}],9:[function(require,module,exports){
'use strict';

var MapCtf1 = {};

MapCtf1.create = function (scope) {
    this.scope = scope;

    this.createSkySprite();
    this.createPlatforms();
    this.createLedges();

    this.scope.platforms.setAll('body.immovable', true);
    this.scope.platforms.setAll('body.allowGravity', false);
};

MapCtf1.createLedges = function () {
    var _this = this;

    var ledges = [
    // {x, y, width, height}

    // Starting Ledges
    { id: 1, x: 0, y: this.scope.game.world.height - 431, width: 128, height: 92 }, // Left bottom ledge
    { id: 2, x: 0, y: this.scope.game.world.height - 838, width: 128, height: 92 }, // Left top ledge

    { id: 3, x: 3872, y: this.scope.game.world.height - 427, width: 128, height: 92 }, // Right bottom ledge
    { id: 4, x: 3872, y: this.scope.game.world.height - 835, width: 128, height: 92 }, // Right top ledge

    // Ground Ledges
    { id: 5, x: 0, y: this.scope.game.world.height - 128, width: 474, height: 128 }, // Main bottom starting left ledge
    { id: 6, x: 474, y: this.scope.game.world.height - 256, width: 641, height: 260 }, // Main bottom left ledge
    { id: 7, x: 1115, y: this.scope.game.world.height - 384, width: 1785, height: 390 }, // Main bottom center ledge
    { id: 8, x: 2900, y: this.scope.game.world.height - 256, width: 641, height: 260 }, // Main bottom right ledge
    { id: 9, x: 3540, y: this.scope.game.world.height - 128, width: 474, height: 128 }, // Main bottom starting right ledge

    // Air Ledges
    { id: 10, x: 300, y: this.scope.game.world.height - 608, width: 641, height: 92 }, { id: 11, x: 1110, y: this.scope.game.world.height - 701, width: 513, height: 92 }, { id: 12, x: 870, y: this.scope.game.world.height - 982, width: 256, height: 92 }, { id: 13, x: 1744, y: this.scope.game.world.height - 874, width: 507, height: 254 }, { id: 14, x: 2390, y: this.scope.game.world.height - 689, width: 513, height: 92 }, { id: 15, x: 3031, y: this.scope.game.world.height - 608, width: 641, height: 92 }, { id: 16, x: 2903, y: this.scope.game.world.height - 957, width: 256, height: 92 },

    // Boxes
    { id: 17, x: 717, y: this.scope.game.world.height - 686, width: 154, height: 77 }, { id: 18, x: 757, y: this.scope.game.world.height - 763, width: 77, height: 77 }, { id: 19, x: 1418, y: this.scope.game.world.height - 778, width: 77, height: 77 }, { id: 20, x: 1931, y: this.scope.game.world.height - 461, width: 154, height: 77 }, { id: 21, x: 3205, y: this.scope.game.world.height - 686, width: 154, height: 77 }, { id: 22, x: 3245, y: this.scope.game.world.height - 763, width: 77, height: 77 }];

    ledges.forEach(function (ledge) {
        // var newLedge = this.scope.platforms.create(ledge.x, ledge.y, 'ground')
        var newLedge = _this.scope.platforms.create(ledge.x, ledge.y);
        newLedge.height = ledge.height;
        newLedge.width = ledge.width;

        // Debug stuff
        // newLedge.alpha = 0.2
        // let style = { font: "20px Arial", fill: "#ff0044", align: "center", backgroundColor: "#ffff00" }
        // let text = this.scope.game.add.text(ledge.x, ledge.y, ledge.id, style)
        // text.alpha = 0.2
    });
};

MapCtf1.createSkySprite = function () {
    this.scope.add.tileSprite(0, this.scope.game.world.height - 1500, this.scope.game.world.width, 1500, 'treescape');
};

MapCtf1.createPlatforms = function () {
    this.scope.platforms = this.scope.add.group();
    this.scope.platforms.enableBody = true;
};

module.exports = MapCtf1;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvYXBwLmpzIiwiYXNzZXRzL2pzL2xpYi9CdWxsZXQuanMiLCJhc3NldHMvanMvbGliL0d1aWQuanMiLCJhc3NldHMvanMvbGliL0lucHV0SGFuZGxlci5qcyIsImFzc2V0cy9qcy9saWIvUmVtb3RlUGxheWVyLmpzIiwiYXNzZXRzL2pzL2xpYi9XZWFwb25zL0FLNDcuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvQmFycmV0TTgyQTEuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvaW5kZXguanMiLCJhc3NldHMvanMvbWFwcy9Gb3Jlc3RDdGYuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7QUFFQSxJQUFJLFlBQVksUUFBUSxrQkFBUixDQUFaO0FBQ0osSUFBSSxlQUFlLFFBQVEsb0JBQVIsQ0FBZjtBQUNKLElBQUksT0FBTyxRQUFRLFlBQVIsQ0FBUDtBQUNKLElBQUksVUFBVSxRQUFRLGVBQVIsQ0FBVjtBQUNKLElBQUksZUFBZSxRQUFRLG9CQUFSLENBQWY7O0FBRUosSUFBSSxZQUFZLE9BQU8sVUFBUDtBQUNoQixJQUFJLGFBQWEsT0FBTyxXQUFQO0FBQ2pCLElBQUksYUFBYSxJQUFiO0FBQ0osSUFBSSxjQUFjLElBQWQ7O0FBRUosSUFBSSxPQUFPLElBQUksT0FBTyxJQUFQLENBQVksU0FBaEIsRUFBMkIsVUFBM0IsRUFBdUMsT0FBTyxNQUFQLEVBQWUsbUJBQXRELENBQVA7O0FBRUosSUFBSSxrQkFBa0IsU0FBbEIsZUFBa0IsR0FBVztBQUM3QixTQUFLLFFBQUwsR0FBZ0IsTUFBaEIsQ0FENkI7QUFFN0IsU0FBSyxhQUFMLEdBQXFCLENBQXJCLENBRjZCO0FBRzdCLFNBQUssT0FBTCxHQUFlLEVBQWYsQ0FINkI7QUFJN0IsU0FBSyxJQUFMLEdBQVksSUFBWixDQUo2QjtBQUs3QixTQUFLLE1BQUwsQ0FMNkI7QUFNN0IsU0FBSyxT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QUFELEVBQVc7O0FBRXRCLFlBQUksV0FBVyxNQUFLLEtBQUwsQ0FBVyxTQUFYLENBQXFCLE1BQXJCLENBQTRCLE1BQU0sQ0FBTixFQUFTLE1BQU0sQ0FBTixDQUFoRCxDQUZrQjtBQUd0QixpQkFBUyxNQUFULEdBQWtCLE1BQU0sTUFBTixDQUhJO0FBSXRCLGlCQUFTLEtBQVQsR0FBaUIsTUFBTSxLQUFOOzs7Ozs7O0FBSkssS0FBWCxDQUFmLENBckM4QjtDQUFYOztBQW1EdkIsUUFBUSxlQUFSLEdBQTBCLFlBQVc7QUFDakMsU0FBSyxLQUFMLENBQVcsR0FBWCxDQUFlLFVBQWYsQ0FBMEIsQ0FBMUIsRUFBNkIsS0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixLQUFoQixDQUFzQixNQUF0QixHQUErQixJQUEvQixFQUFxQyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEtBQWhCLENBQXNCLEtBQXRCLEVBQTZCLElBQS9GLEVBQXFHLFdBQXJHLEVBRGlDO0NBQVg7O0FBSTFCLFFBQVEsZUFBUixHQUEwQixZQUFXO0FBQ2pDLFNBQUssS0FBTCxDQUFXLFNBQVgsR0FBdUIsS0FBSyxLQUFMLENBQVcsR0FBWCxDQUFlLEtBQWYsRUFBdkIsQ0FEaUM7QUFFakMsU0FBSyxLQUFMLENBQVcsU0FBWCxDQUFxQixVQUFyQixHQUFrQyxJQUFsQyxDQUZpQztDQUFYOztBQUsxQixPQUFPLE9BQVAsR0FBaUIsT0FBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBGb3Jlc3RDdGYgPSByZXF1aXJlKCcuL21hcHMvRm9yZXN0Q3RmJylcbmxldCBSZW1vdGVQbGF5ZXIgPSByZXF1aXJlKCcuL2xpYi9SZW1vdGVQbGF5ZXInKVxubGV0IEd1aWQgPSByZXF1aXJlKCcuL2xpYi9HdWlkJylcbmxldCBXZWFwb25zID0gcmVxdWlyZSgnLi9saWIvV2VhcG9ucycpXG5sZXQgSW5wdXRIYW5kbGVyID0gcmVxdWlyZSgnLi9saWIvSW5wdXRIYW5kbGVyJylcblxubGV0IGdhbWVXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXG5sZXQgZ2FtZUhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodFxubGV0IHdvcmxkV2lkdGggPSA0MDAwXG5sZXQgd29ybGRIZWlnaHQgPSAxNTAwXG5cbmxldCBnYW1lID0gbmV3IFBoYXNlci5HYW1lKGdhbWVXaWR0aCwgZ2FtZUhlaWdodCwgUGhhc2VyLkNBTlZBUywgJ3Jhbmdlci1zdGV2ZS1nYW1lJyk7XG5cbmxldCBSYW5nZXJTdGV2ZUdhbWUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmNsaWVudElkID0gR3VpZCgpXG4gICAgdGhpcy5jdXJyZW50V2VhcG9uID0gMDtcbiAgICB0aGlzLmVuZW1pZXMgPSBbXVxuICAgIHRoaXMuZ2FtZSA9IGdhbWVcbiAgICB0aGlzLmdyb3VuZFxuICAgIHRoaXMucGxhdGZvcm1zXG4gICAgdGhpcy5wbGF5ZXJcbiAgICB0aGlzLnNjb3JlID0gMFxuICAgIHRoaXMuc2NvcmVUZXh0XG4gICAgdGhpcy5zb2NrZXRcbiAgICB0aGlzLndlYXBvbk5hbWUgPSBudWxsO1xuICAgIHRoaXMud2VhcG9ucyA9IFtdO1xufVxuXG5SYW5nZXJTdGV2ZUdhbWUucHJvdG90eXBlID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmdhbWUucmVuZGVyZXIucmVuZGVyU2Vzc2lvbi5yb3VuZFBpeGVscyA9IHRydWVcbiAgICAgICAgdGhpcy5nYW1lLnN0YWdlLmRpc2FibGVWaXNpYmlsaXR5Q2hhbmdlID0gdHJ1ZVxuICAgICAgICB0aGlzLnBoeXNpY3Muc3RhcnRTeXN0ZW0oUGhhc2VyLlBoeXNpY3MuQVJDQURFKVxuICAgIH0sXG5cbiAgICBwcmVsb2FkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5sb2FkLmltYWdlKCdidWxsZXQxMScsICcvaW1hZ2VzL2J1bGxldDExLnBuZycpXG4gICAgICAgIHRoaXMubG9hZC5pbWFnZSgnYnVsbGV0MTAnLCAnL2ltYWdlcy9idWxsZXQxMC5wbmcnKVxuICAgICAgICB0aGlzLmxvYWQuaW1hZ2UoJ2J1bGxldDknLCAnL2ltYWdlcy9idWxsZXQ5LnBuZycpXG4gICAgICAgIHRoaXMubG9hZC5pbWFnZSgnYnVsbGV0OCcsICcvaW1hZ2VzL2J1bGxldDgucG5nJylcbiAgICAgICAgdGhpcy5sb2FkLmltYWdlKCdidWxsZXQ3JywgJy9pbWFnZXMvYnVsbGV0Ny5wbmcnKVxuICAgICAgICB0aGlzLmxvYWQuaW1hZ2UoJ2J1bGxldDUnLCAnL2ltYWdlcy9idWxsZXQ1LnBuZycpXG4gICAgICAgIHRoaXMubG9hZC5pbWFnZSgnYnVsbGV0NCcsICcvaW1hZ2VzL2J1bGxldDQucG5nJylcbiAgICAgICAgdGhpcy5sb2FkLmltYWdlKCd0cmVlc2NhcGUnLCAnL2ltYWdlcy9tYXAtY3RmMS5wbmcnKVxuICAgICAgICB0aGlzLmxvYWQuaW1hZ2UoJ2dyb3VuZCcsICcvaW1hZ2VzL3BsYXRmb3JtLnBuZycpXG4gICAgICAgIHRoaXMubG9hZC5zcHJpdGVzaGVldCgnZHVkZScsICcvaW1hZ2VzL2R1ZGUucG5nJywgMzIsIDQ4KVxuICAgICAgICB0aGlzLmxvYWQuc3ByaXRlc2hlZXQoJ2VuZW15JywgJy9pbWFnZXMvZHVkZS5wbmcnLCAzMiwgNDgpXG4gICAgfSxcblxuICAgIGNyZWF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc29ja2V0ID0gaW8uY29ubmVjdCgpXG4gICAgICAgIHRoaXMuZW5lbWllcyA9IFtdXG5cbiAgICAgICAgLy8gIFdlJ3JlIGdvaW5nIHRvIGJlIHVzaW5nIHBoeXNpY3MsIHNvIGVuYWJsZSB0aGUgQXJjYWRlIFBoeXNpY3Mgc3lzdGVtXG4gICAgICAgIHRoaXMucGh5c2ljcy5zdGFydFN5c3RlbShQaGFzZXIuUGh5c2ljcy5BUkNBREUpXG5cbiAgICAgICAgdGhpcy53b3JsZC5zZXRCb3VuZHMoMCwgMCwgd29ybGRXaWR0aCwgd29ybGRIZWlnaHQpXG4gICAgICAgIHRoaXMuZ2FtZS5zdGFnZS5iYWNrZ3JvdW5kQ29sb3IgPSBcIiMyRjkxRDBcIlxuXG4gICAgICAgIC8vIFNjYWxlIGdhbWUgb24gd2luZG93IHJlc2l6ZVxuICAgICAgICB0aGlzLmdhbWUuc2NhbGUuc2NhbGVNb2RlID0gUGhhc2VyLlNjYWxlTWFuYWdlci5SRVNJWkU7XG4gICAgICAgIHRoaXMuZ2FtZS5zY2FsZS5zZXRTaG93QWxsKCk7XG4gICAgICAgIHRoaXMuZ2FtZS5zY2FsZS5yZWZyZXNoKClcblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBNYXBcbiAgICAgICAgICovXG4gICAgICAgIEZvcmVzdEN0Zi5jcmVhdGUodGhpcylcblxuICAgICAgICAvLyBEZWZpbmUgbW92ZW1lbnQgY29uc3RhbnRzXG4gICAgICAgIHRoaXMuTUFYX1NQRUVEID0gNDAwOyAvLyBwaXhlbHMvc2Vjb25kXG4gICAgICAgIHRoaXMuQUNDRUxFUkFUSU9OID0gMTk2MDsgLy8gcGl4ZWxzL3NlY29uZC9zZWNvbmRcbiAgICAgICAgdGhpcy5EUkFHID0gMTUwMDsgLy8gcGl4ZWxzL3NlY29uZFxuICAgICAgICB0aGlzLkdSQVZJVFkgPSAxOTAwOyAvLyBwaXhlbHMvc2Vjb25kL3NlY29uZFxuICAgICAgICB0aGlzLkpVTVBfU1BFRUQgPSAtODUwOyAvLyBwaXhlbHMvc2Vjb25kIChuZWdhdGl2ZSB5IGlzIHVwKVxuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFBsYXllciBTZXR0aW5nc1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5wbGF5ZXIgPSB0aGlzLmFkZC5zcHJpdGUoMjAwLCB0aGlzLndvcmxkLmhlaWdodCAtIDQwMCwgJ2R1ZGUnKTtcblxuICAgICAgICAvLyAgV2UgbmVlZCB0byBlbmFibGUgcGh5c2ljcyBvbiB0aGUgcGxheWVyXG4gICAgICAgIHRoaXMucGh5c2ljcy5hcmNhZGUuZW5hYmxlKHRoaXMucGxheWVyKTtcblxuICAgICAgICAvLyBFbmFibGUgcGh5c2ljcyBvbiB0aGUgcGxheWVyXG4gICAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLmVuYWJsZSh0aGlzLnBsYXllciwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcblxuICAgICAgICAvLyBNYWtlIHBsYXllciBjb2xsaWRlIHdpdGggd29ybGQgYm91bmRhcmllcyBzbyBoZSBkb2Vzbid0IGxlYXZlIHRoZSBzdGFnZVxuICAgICAgICB0aGlzLnBsYXllci5ib2R5LmNvbGxpZGVXb3JsZEJvdW5kcyA9IHRydWU7XG5cbiAgICAgICAgLy8gU2V0IHBsYXllciBtaW5pbXVtIGFuZCBtYXhpbXVtIG1vdmVtZW50IHNwZWVkXG4gICAgICAgIHRoaXMucGxheWVyLmJvZHkubWF4VmVsb2NpdHkuc2V0VG8odGhpcy5NQVhfU1BFRUQsIHRoaXMuTUFYX1NQRUVEICogMTApOyAvLyB4LCB5XG5cbiAgICAgICAgLy8gQWRkIGRyYWcgdG8gdGhlIHBsYXllciB0aGF0IHNsb3dzIHRoZW0gZG93biB3aGVuIHRoZXkgYXJlIG5vdCBhY2NlbGVyYXRpbmdcbiAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5kcmFnLnNldFRvKHRoaXMuRFJBRywgMCk7IC8vIHgsIHlcblxuICAgICAgICAvLyBTaW5jZSB3ZSdyZSBqdW1waW5nIHdlIG5lZWQgZ3Jhdml0eVxuICAgICAgICBnYW1lLnBoeXNpY3MuYXJjYWRlLmdyYXZpdHkueSA9IHRoaXMuR1JBVklUWTtcblxuICAgICAgICAvLyBGbGFnIHRvIHRyYWNrIGlmIHRoZSBqdW1wIGJ1dHRvbiBpcyBwcmVzc2VkXG4gICAgICAgIHRoaXMuanVtcGluZyA9IGZhbHNlO1xuXG4gICAgICAgIC8vICBPdXIgdHdvIGFuaW1hdGlvbnMsIHdhbGtpbmcgbGVmdCBhbmQgcmlnaHQuXG4gICAgICAgIHRoaXMucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdsZWZ0JywgWzAsIDEsIDIsIDNdLCAxMCwgdHJ1ZSlcbiAgICAgICAgdGhpcy5wbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ3JpZ2h0JywgWzUsIDYsIDcsIDhdLCAxMCwgdHJ1ZSlcblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXZWFwb25zXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmN1cnJlbnRXZWFwb24gPSAwO1xuICAgICAgICB0aGlzLndlYXBvbnMucHVzaChuZXcgV2VhcG9ucy5BSzQ3KHRoaXMuZ2FtZSkpO1xuICAgICAgICB0aGlzLndlYXBvbnMucHVzaChuZXcgV2VhcG9ucy5CYXJyZXRNODJBMSh0aGlzLmdhbWUpKTtcblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUZXh0XG4gICAgICAgICAqL1xuICAgICAgICBsZXQgdGV4dFN0eWxlcyA9IHsgZm9udFNpemU6ICcyNHB4JywgZmlsbDogJyMwMDAnIH1cbiAgICAgICAgdGhpcy5zY29yZVRleHQgPSB0aGlzLmFkZC50ZXh0KDI1LCAyNSwgJ1Njb3JlOiAwJywgdGV4dFN0eWxlcylcbiAgICAgICAgdGhpcy5zY29yZVRleHQuZml4ZWRUb0NhbWVyYSA9IHRydWVcbiAgICAgICAgdGhpcy53ZWFwb25OYW1lID0gdGhpcy5hZGQudGV4dCh0aGlzLmNhbWVyYS53aWR0aCAtIDEwMCwgdGhpcy5jYW1lcmEuaGVpZ2h0IC0gNDUsICdBSy00NycsIHRleHRTdHlsZXMpXG4gICAgICAgIHRoaXMud2VhcG9uTmFtZS5maXhlZFRvQ2FtZXJhID0gdHJ1ZVxuICAgICAgICB0aGlzLmN1cnJlbnRIZWFsdGhUZXh0ID0gdGhpcy5hZGQudGV4dCh0aGlzLmNhbWVyYS54ICsgMjUsIHRoaXMuY2FtZXJhLmhlaWdodCAtIDQ1LCAnMTAwJywgdGV4dFN0eWxlcylcbiAgICAgICAgdGhpcy5jdXJyZW50SGVhbHRoVGV4dC5maXhlZFRvQ2FtZXJhID0gdHJ1ZVxuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENhbWVyYSBTZXR0aW5nc1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jYW1lcmEuZm9sbG93KHRoaXMucGxheWVyKTtcblxuICAgICAgICBsZXQgY2hhbmdlS2V5ID0gdGhpcy5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLkVOVEVSKTtcbiAgICAgICAgY2hhbmdlS2V5Lm9uRG93bi5hZGQodGhpcy5uZXh0V2VhcG9uLCB0aGlzKVxuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlc2l6aW5nIEV2ZW50c1xuICAgICAgICAgKi9cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5zY2FsZS5yZWZyZXNoKClcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHRcbiAgICAgICAgICAgIHRoaXMuZ2FtZS53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXG5cbiAgICAgICAgICAgIHRoaXMud2VhcG9uTmFtZS5jYW1lcmFPZmZzZXQueCA9IHRoaXMuY2FtZXJhLndpZHRoIC0gMTAwXG4gICAgICAgICAgICB0aGlzLndlYXBvbk5hbWUuY2FtZXJhT2Zmc2V0LnkgPSB0aGlzLmNhbWVyYS5oZWlnaHQgLSA0NVxuXG4gICAgICAgICAgICB0aGlzLnNjb3JlVGV4dC5jYW1lcmFPZmZzZXQueCA9IDI1XG4gICAgICAgICAgICB0aGlzLnNjb3JlVGV4dC5jYW1lcmFPZmZzZXQueSA9IDI1XG4gICAgICAgIH0pXG5cblxuICAgICAgICAvKipcbiAgICAgICAgICogU3RhcnQgbGlzdGVuaW5nIGZvciBldmVudHNcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuc2V0RXZlbnRIYW5kbGVycygpXG4gICAgfSxcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vICBDb2xsaWRlIHRoZSBwbGF5ZXIgYW5kIHRoZSBzdGFycyB3aXRoIHRoZSBwbGF0Zm9ybXNcbiAgICAgICAgdGhpcy5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMucGxheWVyLCB0aGlzLnBsYXRmb3JtcylcbiAgICAgICAgdGhpcy5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMucGxhdGZvcm1zLCB0aGlzLndlYXBvbnMsIGZ1bmN0aW9uKHBsYXRmb3JtLCB3ZWFwb24pIHtcbiAgICAgICAgICAgIHdlYXBvbi5raWxsKClcbiAgICAgICAgfSwgbnVsbCwgdGhpcyk7XG5cbiAgICAgICAgdGhpcy5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMuZW5lbXksIHRoaXMud2VhcG9ucywgZnVuY3Rpb24oZW5lbXksIHdlYXBvbikge1xuICAgICAgICAgICAgZW5lbXkuaGVhbHRoIC09IHdlYXBvbi5kYW1hZ2VcbiAgICAgICAgICAgIHdlYXBvbi5raWxsKClcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdZb3UgaGl0IHRoZW0hJywgZW5lbXkuaGVhbHRoLCB3ZWFwb24uZGFtYWdlKVxuICAgICAgICAgICAgaWYgKGVuZW15LmhlYWx0aCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1RoZXkgYXJlIGRlYWQhJylcbiAgICAgICAgICAgICAgICB0aGlzLmVuZW15LnggPSAyMDBcbiAgICAgICAgICAgICAgICB0aGlzLmVuZW15LnkgPSAyMDBcbiAgICAgICAgICAgICAgICB0aGlzLmVuZW15LmhlYWx0aCA9IDEwMFxuICAgICAgICAgICAgfVxuICAgICAgICB9LCBudWxsLCB0aGlzKTtcblxuICAgICAgICBpZiAodGhpcy5sZWZ0SW5wdXRJc0FjdGl2ZSgpKSB7XG4gICAgICAgICAgICAvLyBJZiB0aGUgTEVGVCBrZXkgaXMgZG93biwgc2V0IHRoZSBwbGF5ZXIgdmVsb2NpdHkgdG8gbW92ZSBsZWZ0XG4gICAgICAgICAgICB0aGlzLnBsYXllci5ib2R5LmFjY2VsZXJhdGlvbi54ID0gLXRoaXMuQUNDRUxFUkFUSU9OO1xuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdsZWZ0JylcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnJpZ2h0SW5wdXRJc0FjdGl2ZSgpKSB7XG4gICAgICAgICAgICAvLyBJZiB0aGUgUklHSFQga2V5IGlzIGRvd24sIHNldCB0aGUgcGxheWVyIHZlbG9jaXR5IHRvIG1vdmUgcmlnaHRcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmJvZHkuYWNjZWxlcmF0aW9uLnggPSB0aGlzLkFDQ0VMRVJBVElPTjtcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmFuaW1hdGlvbnMucGxheSgncmlnaHQnKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gU3RhbmQgc3RpbGxcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmJvZHkuYWNjZWxlcmF0aW9uLnggPSAwXG4gICAgICAgICAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLnN0b3AoKVxuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuZnJhbWUgPSA0XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZXQgYSB2YXJpYWJsZSB0aGF0IGlzIHRydWUgd2hlbiB0aGUgcGxheWVyIGlzIHRvdWNoaW5nIHRoZSBncm91bmRcbiAgICAgICAgbGV0IG9uVGhlR3JvdW5kID0gdGhpcy5wbGF5ZXIuYm9keS50b3VjaGluZy5kb3duO1xuXG4gICAgICAgIC8vIElmIHRoZSBwbGF5ZXIgaXMgdG91Y2hpbmcgdGhlIGdyb3VuZCwgbGV0IGhpbSBoYXZlIDIganVtcHNcbiAgICAgICAgaWYgKG9uVGhlR3JvdW5kKSB7XG4gICAgICAgICAgICB0aGlzLmp1bXBzID0gMjtcbiAgICAgICAgICAgIHRoaXMuanVtcGluZyA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSnVtcCFcbiAgICAgICAgaWYgKHRoaXMuanVtcHMgPiAwICYmIHRoaXMudXBJbnB1dElzQWN0aXZlKDUpKSB7XG4gICAgICAgICAgICB0aGlzLnBsYXllci5ib2R5LnZlbG9jaXR5LnkgPSB0aGlzLkpVTVBfU1BFRUQ7XG4gICAgICAgICAgICB0aGlzLmp1bXBpbmcgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVkdWNlIHRoZSBudW1iZXIgb2YgYXZhaWxhYmxlIGp1bXBzIGlmIHRoZSBqdW1wIGlucHV0IGlzIHJlbGVhc2VkXG4gICAgICAgIGlmICh0aGlzLmp1bXBpbmcgJiYgdGhpcy51cElucHV0UmVsZWFzZWQoKSkge1xuICAgICAgICAgICAgdGhpcy5qdW1wcy0tO1xuICAgICAgICAgICAgdGhpcy5qdW1waW5nID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5nYW1lLmlucHV0LmFjdGl2ZVBvaW50ZXIuaXNEb3duKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS5maXJlKHRoaXMucGxheWVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ21vdmUgcGxheWVyJywgeyB4OiB0aGlzLnBsYXllci54LCB5OiB0aGlzLnBsYXllci55IH0pXG4gICAgfSxcblxuICAgIGxlZnRJbnB1dElzQWN0aXZlOiBJbnB1dEhhbmRsZXIubGVmdElucHV0SXNBY3RpdmUsXG4gICAgcmlnaHRJbnB1dElzQWN0aXZlOiBJbnB1dEhhbmRsZXIucmlnaHRJbnB1dElzQWN0aXZlLFxuICAgIHVwSW5wdXRJc0FjdGl2ZTogSW5wdXRIYW5kbGVyLnVwSW5wdXRJc0FjdGl2ZSxcbiAgICB1cElucHV0UmVsZWFzZWQ6IElucHV0SGFuZGxlci51cElucHV0UmVsZWFzZWQsXG5cbiAgICBuZXh0V2VhcG9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gIFRpZHktdXAgdGhlIGN1cnJlbnQgd2VhcG9uXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRXZWFwb24gPiA5KVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS5yZXNldCgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0udmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0uY2FsbEFsbCgncmVzZXQnLCBudWxsLCAwLCAwKTtcbiAgICAgICAgICAgIHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLnNldEFsbCgnZXhpc3RzJywgZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gIEFjdGl2YXRlIHRoZSBuZXcgb25lXG4gICAgICAgIHRoaXMuY3VycmVudFdlYXBvbisrO1xuXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRXZWFwb24gPT09IHRoaXMud2VhcG9ucy5sZW5ndGgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFdlYXBvbiA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS52aXNpYmxlID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLndlYXBvbk5hbWUudGV4dCA9IHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLm5hbWU7XG4gICAgfSxcblxuICAgIHNldEV2ZW50SGFuZGxlcnM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gU29ja2V0IGNvbm5lY3Rpb24gc3VjY2Vzc2Z1bFxuICAgICAgICB0aGlzLnNvY2tldC5vbignY29ubmVjdCcsIHRoaXMub25Tb2NrZXRDb25uZWN0ZWQuYmluZCh0aGlzKSlcblxuICAgICAgICAvLyBTb2NrZXQgZGlzY29ubmVjdGlvblxuICAgICAgICB0aGlzLnNvY2tldC5vbignZGlzY29ubmVjdCcsIHRoaXMub25Tb2NrZXREaXNjb25uZWN0LmJpbmQodGhpcykpXG5cbiAgICAgICAgLy8gUGxheWVyIG1vdmUgbWVzc2FnZSByZWNlaXZlZFxuICAgICAgICB0aGlzLnNvY2tldC5vbignbW92ZSBwbGF5ZXInLCB0aGlzLm9uTW92ZVBsYXllci5iaW5kKHRoaXMpKVxuXG4gICAgICAgIC8vIFBsYXllciByZW1vdmVkIG1lc3NhZ2UgcmVjZWl2ZWRcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ3JlbW92ZSBwbGF5ZXInLCB0aGlzLm9uUmVtb3ZlUGxheWVyLmJpbmQodGhpcykpXG5cbiAgICAgICAgLy8gVXBkYXRlZCBsaXN0IG9mIHBsYXllcnMgdG8gc3luYyBlbmVtaWVzIHRvXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCd1cGRhdGUgcGxheWVycycsIHRoaXMub25VcGRhdGVQbGF5ZXJzLmJpbmQodGhpcykpXG4gICAgfSxcblxuICAgIG9uVXBkYXRlUGxheWVyczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB0aGlzLmVuZW1pZXMuZm9yRWFjaChmdW5jdGlvbiAoZW5lbXkpIHtcbiAgICAgICAgICAgIGVuZW15LnBsYXllci5raWxsKClcbiAgICAgICAgfSlcblxuICAgICAgICB0aGlzLmVuZW1pZXMgPSBbXVxuXG4gICAgICAgIGRhdGEucGxheWVycy5mb3JFYWNoKChwbGF5ZXIpID0+IHtcbiAgICAgICAgICAgIGlmIChwbGF5ZXIuaWQgPT09ICgnLyMnICsgdGhpcy5zb2NrZXQuaWQpKVxuICAgICAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgICAgICBsZXQgbmV3UmVtb3RlUGxheWVyID0gUmVtb3RlUGxheWVyKHBsYXllci5pZCwgdGhpcy5nYW1lLCB0aGlzLnBsYXllciwgcGxheWVyLngsIHBsYXllci55KVxuICAgICAgICAgICAgdGhpcy5lbmVtaWVzLnB1c2gobmV3UmVtb3RlUGxheWVyKVxuICAgICAgICAgICAgdGhpcy5lbmVtaWVzW3RoaXMuZW5lbWllcy5sZW5ndGggLSAxXS5wbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ2xlZnQnLCBbMCwgMSwgMiwgM10sIDEwLCB0cnVlKVxuICAgICAgICAgICAgdGhpcy5lbmVtaWVzW3RoaXMuZW5lbWllcy5sZW5ndGggLSAxXS5wbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ3JpZ2h0JywgWzUsIDYsIDcsIDhdLCAxMCwgdHJ1ZSlcbiAgICAgICAgfSlcbiAgICB9LFxuXG4gICAgLy8gU29ja2V0IGNvbm5lY3RlZFxuICAgIG9uU29ja2V0Q29ubmVjdGVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0Nvbm5lY3RlZCB0byBzb2NrZXQgc2VydmVyJylcblxuICAgICAgICAgLy8gUmVzZXQgZW5lbWllcyBvbiByZWNvbm5lY3RcbiAgICAgICAgdGhpcy5lbmVtaWVzLmZvckVhY2goZnVuY3Rpb24gKGVuZW15KSB7XG4gICAgICAgICAgICBlbmVteS5raWxsKClcbiAgICAgICAgfSlcbiAgICAgICAgdGhpcy5lbmVtaWVzID0gW11cblxuICAgICAgICAvLyBTZW5kIGxvY2FsIHBsYXllciBkYXRhIHRvIHRoZSBnYW1lIHNlcnZlclxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCduZXcgcGxheWVyJywge1xuICAgICAgICAgICAgY2xpZW50SWQ6IHRoaXMuY2xpZW50SWQsXG4gICAgICAgICAgICB4OiB0aGlzLnBsYXllci54LFxuICAgICAgICAgICAgeTogdGhpcy5wbGF5ZXIueVxuICAgICAgICB9KVxuICAgIH0sXG5cbiAgICAvLyBTb2NrZXQgZGlzY29ubmVjdGVkXG4gICAgb25Tb2NrZXREaXNjb25uZWN0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0Rpc2Nvbm5lY3RlZCBmcm9tIHNvY2tldCBzZXJ2ZXInKVxuICAgIH0sXG5cbiAgICAvLyBNb3ZlIHBsYXllclxuICAgIG9uTW92ZVBsYXllcjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBsZXQgbW92ZVBsYXllciA9IHRoaXMucGxheWVyQnlJZChkYXRhLmlkKVxuXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGRhdGEuaWQsIG1vdmVQbGF5ZXIpXG5cbiAgICAgICAgLy8gUGxheWVyIG5vdCBmb3VuZFxuICAgICAgICBpZiAoISBtb3ZlUGxheWVyKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFVwZGF0ZSBwbGF5ZXIgcG9zaXRpb25cbiAgICAgICAgbW92ZVBsYXllci5wbGF5ZXIueCA9IGRhdGEueFxuICAgICAgICBtb3ZlUGxheWVyLnBsYXllci55ID0gZGF0YS55XG5cbiAgICAgICAgaWYgKG1vdmVQbGF5ZXIucGxheWVyLnggPiBtb3ZlUGxheWVyLmxhc3RQb3NpdGlvbi54KSB7XG4gICAgICAgICAgICBtb3ZlUGxheWVyLnBsYXllci5hbmltYXRpb25zLnBsYXkoJ3JpZ2h0JylcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChtb3ZlUGxheWVyLnBsYXllci54IDwgbW92ZVBsYXllci5sYXN0UG9zaXRpb24ueClcbiAgICAgICAge1xuICAgICAgICAgICAgbW92ZVBsYXllci5wbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdsZWZ0JylcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgIHtcbiAgICAgICAgICAgIG1vdmVQbGF5ZXIucGxheWVyLmFuaW1hdGlvbnMuc3RvcCgpXG4gICAgICAgICAgICBtb3ZlUGxheWVyLnBsYXllci5mcmFtZSA9IDQ7XG4gICAgICAgIH1cblxuICAgICAgICBtb3ZlUGxheWVyLmxhc3RQb3NpdGlvbi54ID0gbW92ZVBsYXllci5wbGF5ZXIueFxuICAgICAgICBtb3ZlUGxheWVyLmxhc3RQb3NpdGlvbi55ID0gbW92ZVBsYXllci5wbGF5ZXIueVxuICAgIH0sXG5cbiAgICAvLyBSZW1vdmUgcGxheWVyXG4gICAgb25SZW1vdmVQbGF5ZXI6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgbGV0IHJlbW92ZVBsYXllciA9IHRoaXMucGxheWVyQnlJZChkYXRhLmlkKVxuXG4gICAgICAgIC8vIFBsYXllciBub3QgZm91bmRcbiAgICAgICAgaWYgKCFyZW1vdmVQbGF5ZXIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdQbGF5ZXIgbm90IGZvdW5kOiAnLCBkYXRhLmlkKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICByZW1vdmVQbGF5ZXIucGxheWVyLmtpbGwoKVxuXG4gICAgICAgIC8vIFJlbW92ZSBwbGF5ZXIgZnJvbSBhcnJheVxuICAgICAgICB0aGlzLmVuZW1pZXMuc3BsaWNlKHRoaXMuZW5lbWllcy5pbmRleE9mKHJlbW92ZVBsYXllciksIDEpXG4gICAgfSxcblxuICAgIC8vIEZpbmQgcGxheWVyIGJ5IElEXG4gICAgcGxheWVyQnlJZDogZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmVuZW1pZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmVuZW1pZXNbaV0ucGxheWVyLmlkID09PSBpZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmVuZW1pZXNbaV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbn1cblxuZ2FtZS5zdGF0ZS5hZGQoJ0dhbWUnLCBSYW5nZXJTdGV2ZUdhbWUsIHRydWUpO1xuIiwiJ3VzZSBzdHJpY3QnXG5cbnZhciBCdWxsZXQgPSBmdW5jdGlvbiAoZ2FtZSwga2V5KSB7XG4gICAgUGhhc2VyLlNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIDAsIDAsIGtleSk7XG5cbiAgICB0aGlzLnRleHR1cmUuYmFzZVRleHR1cmUuc2NhbGVNb2RlID0gUElYSS5zY2FsZU1vZGVzLk5FQVJFU1Q7XG5cbiAgICB0aGlzLmFuY2hvci5zZXQoMC41KTtcblxuICAgIHRoaXMuY2hlY2tXb3JsZEJvdW5kcyA9IHRydWU7XG4gICAgdGhpcy5vdXRPZkJvdW5kc0tpbGwgPSB0cnVlO1xuICAgIHRoaXMuZXhpc3RzID0gZmFsc2U7XG5cbiAgICB0aGlzLnRyYWNraW5nID0gZmFsc2U7XG4gICAgdGhpcy5zY2FsZVNwZWVkID0gMDtcblxufTtcblxuQnVsbGV0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpO1xuQnVsbGV0LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEJ1bGxldDtcblxuQnVsbGV0LnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24gKHgsIHksIGFuZ2xlLCBzcGVlZCwgZ3gsIGd5KSB7XG4gICAgZ3ggPSBneCB8fCAwXG4gICAgZ3kgPSBneSB8fCAwXG4gICAgdGhpcy5yZXNldCh4LCB5KVxuICAgIC8vIHRoaXMuc2NhbGUuc2V0KDEpO1xuXG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLm1vdmVUb1BvaW50ZXIodGhpcywgc3BlZWQpXG4gICAgdGhpcy5ib2R5LmdyYXZpdHkueSA9IC0xODAwXG59XG5cbkJ1bGxldC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnRyYWNraW5nKVxuICAgIHtcbiAgICAgICAgdGhpcy5yb3RhdGlvbiA9IE1hdGguYXRhbjIodGhpcy5ib2R5LnZlbG9jaXR5LnksIHRoaXMuYm9keS52ZWxvY2l0eS54KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zY2FsZVNwZWVkID4gMClcbiAgICB7XG4gICAgICAgIHRoaXMuc2NhbGUueCArPSB0aGlzLnNjYWxlU3BlZWQ7XG4gICAgICAgIHRoaXMuc2NhbGUueSArPSB0aGlzLnNjYWxlU3BlZWQ7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1bGxldFxuIiwiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ3VpZEdlbmVyYXRvcigpIHtcbiAgICB2YXIgUzQgPSBmdW5jdGlvbigpIHtcbiAgICAgICByZXR1cm4gKCgoMStNYXRoLnJhbmRvbSgpKSoweDEwMDAwKXwwKS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpXG4gICAgfVxuXG4gICAgcmV0dXJuIChTNCgpK1M0KCkrXCItXCIrUzQoKStcIi1cIitTNCgpK1wiLVwiK1M0KCkrXCItXCIrUzQoKStTNCgpK1M0KCkpXG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgLy8gVGhpcyBmdW5jdGlvbiBzaG91bGQgcmV0dXJuIHRydWUgd2hlbiB0aGUgcGxheWVyIGFjdGl2YXRlcyB0aGUgXCJnbyBsZWZ0XCIgY29udHJvbFxuICAgIC8vIEluIHRoaXMgY2FzZSwgZWl0aGVyIGhvbGRpbmcgdGhlIHJpZ2h0IGFycm93IG9yIHRhcHBpbmcgb3IgY2xpY2tpbmcgb24gdGhlIGxlZnRcbiAgICAvLyBzaWRlIG9mIHRoZSBzY3JlZW4uXG4gICAgbGVmdElucHV0SXNBY3RpdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnB1dC5rZXlib2FyZC5pc0Rvd24oUGhhc2VyLktleWJvYXJkLkEpXG4gICAgfSxcblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gc2hvdWxkIHJldHVybiB0cnVlIHdoZW4gdGhlIHBsYXllciBhY3RpdmF0ZXMgdGhlIFwiZ28gcmlnaHRcIiBjb250cm9sXG4gICAgLy8gSW4gdGhpcyBjYXNlLCBlaXRoZXIgaG9sZGluZyB0aGUgcmlnaHQgYXJyb3cgb3IgdGFwcGluZyBvciBjbGlja2luZyBvbiB0aGUgcmlnaHRcbiAgICAvLyBzaWRlIG9mIHRoZSBzY3JlZW4uXG4gICAgcmlnaHRJbnB1dElzQWN0aXZlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5wdXQua2V5Ym9hcmQuaXNEb3duKFBoYXNlci5LZXlib2FyZC5EKVxuICAgIH0sXG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIHNob3VsZCByZXR1cm4gdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgYWN0aXZhdGVzIHRoZSBcImp1bXBcIiBjb250cm9sXG4gICAgLy8gSW4gdGhpcyBjYXNlLCBlaXRoZXIgaG9sZGluZyB0aGUgdXAgYXJyb3cgb3IgdGFwcGluZyBvciBjbGlja2luZyBvbiB0aGUgY2VudGVyXG4gICAgLy8gcGFydCBvZiB0aGUgc2NyZWVuLlxuICAgIHVwSW5wdXRJc0FjdGl2ZTogZnVuY3Rpb24oZHVyYXRpb24pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5wdXQua2V5Ym9hcmQuZG93bkR1cmF0aW9uKFBoYXNlci5LZXlib2FyZC5XLCBkdXJhdGlvbilcbiAgICB9LFxuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiByZXR1cm5zIHRydWUgd2hlbiB0aGUgcGxheWVyIHJlbGVhc2VzIHRoZSBcImp1bXBcIiBjb250cm9sXG4gICAgdXBJbnB1dFJlbGVhc2VkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5wdXQua2V5Ym9hcmQudXBEdXJhdGlvbihQaGFzZXIuS2V5Ym9hcmQuVylcbiAgICB9XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IFJlbW90ZVBsYXllciA9IGZ1bmN0aW9uKGlkLCBnYW1lLCBwbGF5ZXIsIHN0YXJ0WCwgc3RhcnRZKSB7XG4gICAgbGV0IG5ld1JlbW90ZVBsYXllciA9IHtcbiAgICAgICAgeDogc3RhcnRYLFxuICAgICAgICB5OiBzdGFydFksXG4gICAgICAgIGlkOiBudWxsLFxuICAgICAgICBnYW1lOiBnYW1lLFxuICAgICAgICBoZWFsdGg6IDEwMCxcbiAgICAgICAgcGxheWVyOiBwbGF5ZXIsXG4gICAgICAgIGFsaXZlOiB0cnVlLFxuICAgICAgICBsYXN0UG9zaXRpb246IHtcbiAgICAgICAgICAgIHg6IHN0YXJ0WCxcbiAgICAgICAgICAgIHk6IHN0YXJ0WVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIHRoZSBwbGF5ZXIncyBlbmVteSBzcHJpdGVcbiAgICBuZXdSZW1vdGVQbGF5ZXIucGxheWVyID0gZ2FtZS5hZGQuc3ByaXRlKHN0YXJ0WCwgc3RhcnRZLCAnZW5lbXknKVxuXG4gICAgLy8gT3VyIHR3byBhbmltYXRpb25zLCB3YWxraW5nIGxlZnQgYW5kIHJpZ2h0LlxuICAgIG5ld1JlbW90ZVBsYXllci5wbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ2xlZnQnLCBbMCwgMSwgMiwgM10sIDEwLCB0cnVlKVxuICAgIG5ld1JlbW90ZVBsYXllci5wbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ3JpZ2h0JywgWzUsIDYsIDcsIDhdLCAxMCwgdHJ1ZSlcblxuICAgIG5ld1JlbW90ZVBsYXllci5wbGF5ZXIuaWQgPSBpZFxuXG4gICAgcmV0dXJuIG5ld1JlbW90ZVBsYXllclxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlbW90ZVBsYXllclxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBCdWxsZXQgPSByZXF1aXJlKCcuLi9CdWxsZXQnKVxuXG5sZXQgQUs0NyA9IGZ1bmN0aW9uIChnYW1lKSB7XG4gICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgZ2FtZSwgZ2FtZS53b3JsZCwgJ0FLLTQ3JywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG5cbiAgICB0aGlzLmRhbWFnZSA9IDIyXG4gICAgdGhpcy5uZXh0RmlyZSA9IDA7XG4gICAgdGhpcy5idWxsZXRTcGVlZCA9IDEwMDA7XG4gICAgLy8gQUs0NyBmaXJlcyBhYm91dCA2MDAgYnVsbGV0cyBwZXIgc2Vjb25kXG4gICAgdGhpcy5maXJlUmF0ZSA9IDE2Ni42NjY2Njc7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDY0OyBpKyspXG4gICAge1xuICAgICAgICBsZXQgYnVsbGV0ID0gbmV3IEJ1bGxldCh0aGlzLmdhbWUsICdncm91bmQnKVxuICAgICAgICBidWxsZXQuaGVpZ2h0ID0gMlxuICAgICAgICBidWxsZXQud2lkdGggPSAxMFxuICAgICAgICBidWxsZXQuZGFtYWdlID0gMjJcbiAgICAgICAgdGhpcy5hZGQoYnVsbGV0LCB0cnVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xufVxuXG5BSzQ3LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLkdyb3VwLnByb3RvdHlwZSk7XG5BSzQ3LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEFLNDc7XG5cbkFLNDcucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbiAoc291cmNlKSB7XG5cbiAgICBpZiAodGhpcy5nYW1lLnRpbWUudGltZSA8IHRoaXMubmV4dEZpcmUpXG4gICAgICAgIHJldHVyblxuXG4gICAgdmFyIHggPSBzb3VyY2UueCArIDE1O1xuICAgIHZhciB5ID0gc291cmNlLnkgKyAzMDtcblxuICAgIHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgMCk7XG4gICAgdGhpcy5zZXRBbGwoJ3RyYWNraW5nJywgdHJ1ZSlcblxuICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLmdhbWUudGltZS50aW1lICsgdGhpcy5maXJlUmF0ZVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFLNDdcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgQnVsbGV0ID0gcmVxdWlyZSgnLi4vQnVsbGV0JylcblxubGV0IEJhcnJldE04MkExID0gZnVuY3Rpb24gKGdhbWUpIHtcbiAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCBnYW1lLCBnYW1lLndvcmxkLCAnQUstNDcnLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcblxuICAgIHRoaXMubmFtZSA9ICdCYXJyZXQgTTgyQTEnXG4gICAgdGhpcy5kYW1hZ2UgPSA4OFxuICAgIHRoaXMubmV4dEZpcmUgPSAwXG4gICAgdGhpcy5idWxsZXRTcGVlZCA9IDM0MzVcblxuICAgIC8vIEJhcnJldE04MkExIGZpcmVzIGFib3V0IDYwMCBidWxsZXRzIHBlciBzZWNvbmRcbiAgICB0aGlzLmZpcmVSYXRlID0gNDAwMFxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA2NDsgaSsrKVxuICAgIHtcbiAgICAgICAgbGV0IGJ1bGxldCA9IG5ldyBCdWxsZXQodGhpcy5nYW1lLCAnZ3JvdW5kJylcbiAgICAgICAgYnVsbGV0LmhlaWdodCA9IDJcbiAgICAgICAgYnVsbGV0LndpZHRoID0gMTBcbiAgICAgICAgYnVsbGV0LmRhbWFnZSA9IDg4XG5cbiAgICAgICAgdGhpcy5hZGQoYnVsbGV0LCB0cnVlKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG59XG5cbkJhcnJldE04MkExLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLkdyb3VwLnByb3RvdHlwZSk7XG5CYXJyZXRNODJBMS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBCYXJyZXRNODJBMTtcblxuQmFycmV0TTgyQTEucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbiAoc291cmNlKSB7XG4gICAgaWYgKHRoaXMuZ2FtZS50aW1lLnRpbWUgPCB0aGlzLm5leHRGaXJlKVxuICAgICAgICByZXR1cm5cblxuICAgIHZhciB4ID0gc291cmNlLnggKyAxNTtcbiAgICB2YXIgeSA9IHNvdXJjZS55ICsgMzA7XG5cbiAgICB0aGlzLmdldEZpcnN0RXhpc3RzKGZhbHNlKS5maXJlKHgsIHksIDAsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDApXG4gICAgdGhpcy5zZXRBbGwoJ3RyYWNraW5nJywgdHJ1ZSlcblxuICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLmdhbWUudGltZS50aW1lICsgdGhpcy5maXJlUmF0ZVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhcnJldE04MkExXG4iLCIndXNlIHN0cmljdCdcblxuLyoqXG4gKiBQcmltYXJ5IFdlYXBvbnNcbiAqIDEuIERlc2VydCBFYWdsZXNcbiAqIDIuIEhLIE1QNVxuICogMy4gQUs0N1xuICogNC4gTTE2XG4gKiA1LiBTcGFzLTEyXG4gKiA2LiBSdWdlciA3N1xuICogNy4gTTc5XG4gKiA4LiBCYXJyZXQgTTgyQTFcbiAqIDkuIEZOIE1pbmltaVxuICogMTAuIFhNMjE0IE1pbmlndW5cbiAqL1xuXG4vKipcbiAqIFNlY29uZGFyeSBXZWFwb25zXG4gKiAxLiBVU1NPQ09NXG4gKiAyLiBDb21iYXQgS25pZmVcbiAqIDMuIENoYWluc2F3XG4gKiA0LiBNNzIgTGF3XG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgXCJBSzQ3XCI6IHJlcXVpcmUoJy4vQUs0NycpLFxuICAgIFwiQmFycmV0TTgyQTFcIjogcmVxdWlyZSgnLi9CYXJyZXRNODJBMScpXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IE1hcEN0ZjEgPSB7fVxuXG5NYXBDdGYxLmNyZWF0ZSA9IGZ1bmN0aW9uKHNjb3BlKSB7XG4gICAgdGhpcy5zY29wZSA9IHNjb3BlXG5cbiAgICB0aGlzLmNyZWF0ZVNreVNwcml0ZSgpXG4gICAgdGhpcy5jcmVhdGVQbGF0Zm9ybXMoKVxuICAgIHRoaXMuY3JlYXRlTGVkZ2VzKClcblxuICAgIHRoaXMuc2NvcGUucGxhdGZvcm1zLnNldEFsbCgnYm9keS5pbW1vdmFibGUnLCB0cnVlKVxuICAgIHRoaXMuc2NvcGUucGxhdGZvcm1zLnNldEFsbCgnYm9keS5hbGxvd0dyYXZpdHknLCBmYWxzZSlcbn1cblxuTWFwQ3RmMS5jcmVhdGVMZWRnZXMgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgbGVkZ2VzID0gW1xuICAgICAgICAvLyB7eCwgeSwgd2lkdGgsIGhlaWdodH1cblxuICAgICAgICAvLyBTdGFydGluZyBMZWRnZXNcbiAgICAgICAgeyBpZDogMSwgeDogMCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDQzMSwgd2lkdGg6IDEyOCwgaGVpZ2h0OiA5MiB9LCAvLyBMZWZ0IGJvdHRvbSBsZWRnZVxuICAgICAgICB7IGlkOiAyLCB4OiAwLCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gODM4LCB3aWR0aDogMTI4LCBoZWlnaHQ6IDkyIH0sIC8vIExlZnQgdG9wIGxlZGdlXG5cbiAgICAgICAgeyBpZDogMywgeDogMzg3MiwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDQyNywgd2lkdGg6IDEyOCwgaGVpZ2h0OiA5MiB9LCAvLyBSaWdodCBib3R0b20gbGVkZ2VcbiAgICAgICAgeyBpZDogNCwgeDogMzg3MiwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDgzNSwgd2lkdGg6IDEyOCwgaGVpZ2h0OiA5MiB9LCAvLyBSaWdodCB0b3AgbGVkZ2VcblxuICAgICAgICAvLyBHcm91bmQgTGVkZ2VzXG4gICAgICAgIHsgaWQ6IDUsIHg6IDAsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSAxMjgsIHdpZHRoOiA0NzQsIGhlaWdodDogMTI4IH0sIC8vIE1haW4gYm90dG9tIHN0YXJ0aW5nIGxlZnQgbGVkZ2VcbiAgICAgICAgeyBpZDogNiwgeDogNDc0LCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gMjU2LCB3aWR0aDogNjQxLCBoZWlnaHQ6IDI2MCB9LCAvLyBNYWluIGJvdHRvbSBsZWZ0IGxlZGdlXG4gICAgICAgIHsgaWQ6IDcsIHg6IDExMTUsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSAzODQsIHdpZHRoOiAxNzg1LCBoZWlnaHQ6IDM5MCB9LCAvLyBNYWluIGJvdHRvbSBjZW50ZXIgbGVkZ2VcbiAgICAgICAgeyBpZDogOCwgeDogMjkwMCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDI1Niwgd2lkdGg6IDY0MSwgaGVpZ2h0OiAyNjAgfSwgLy8gTWFpbiBib3R0b20gcmlnaHQgbGVkZ2VcbiAgICAgICAgeyBpZDogOSwgeDogMzU0MCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDEyOCwgd2lkdGg6IDQ3NCwgaGVpZ2h0OiAxMjggfSwgLy8gTWFpbiBib3R0b20gc3RhcnRpbmcgcmlnaHQgbGVkZ2VcblxuICAgICAgICAvLyBBaXIgTGVkZ2VzXG4gICAgICAgIHsgaWQ6IDEwLCB4OiAzMDAsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA2MDgsIHdpZHRoOiA2NDEsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogMTEsIHg6IDExMTAsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA3MDEsIHdpZHRoOiA1MTMsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogMTIsIHg6IDg3MCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDk4Miwgd2lkdGg6IDI1NiwgaGVpZ2h0OiA5MiB9LFxuICAgICAgICB7IGlkOiAxMywgeDogMTc0NCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDg3NCwgd2lkdGg6IDUwNywgaGVpZ2h0OiAyNTQgfSxcbiAgICAgICAgeyBpZDogMTQsIHg6IDIzOTAsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA2ODksIHdpZHRoOiA1MTMsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogMTUsIHg6IDMwMzEsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA2MDgsIHdpZHRoOiA2NDEsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogMTYsIHg6IDI5MDMsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA5NTcsIHdpZHRoOiAyNTYsIGhlaWdodDogOTIgfSxcblxuICAgICAgICAvLyBCb3hlc1xuICAgICAgICB7IGlkOiAxNywgeDogNzE3LCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gNjg2LCB3aWR0aDogMTU0LCBoZWlnaHQ6IDc3IH0sXG4gICAgICAgIHsgaWQ6IDE4LCB4OiA3NTcsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA3NjMsIHdpZHRoOiA3NywgaGVpZ2h0OiA3NyB9LFxuICAgICAgICB7IGlkOiAxOSwgeDogMTQxOCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDc3OCwgd2lkdGg6IDc3LCBoZWlnaHQ6IDc3IH0sXG4gICAgICAgIHsgaWQ6IDIwLCB4OiAxOTMxLCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gNDYxLCB3aWR0aDogMTU0LCBoZWlnaHQ6IDc3IH0sXG4gICAgICAgIHsgaWQ6IDIxLCB4OiAzMjA1LCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gNjg2LCB3aWR0aDogMTU0LCBoZWlnaHQ6IDc3IH0sXG4gICAgICAgIHsgaWQ6IDIyLCB4OiAzMjQ1LCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gNzYzLCB3aWR0aDogNzcsIGhlaWdodDogNzcgfVxuICAgIF1cblxuXG4gICAgbGVkZ2VzLmZvckVhY2goKGxlZGdlKSA9PiB7XG4gICAgICAgIC8vIHZhciBuZXdMZWRnZSA9IHRoaXMuc2NvcGUucGxhdGZvcm1zLmNyZWF0ZShsZWRnZS54LCBsZWRnZS55LCAnZ3JvdW5kJylcbiAgICAgICAgdmFyIG5ld0xlZGdlID0gdGhpcy5zY29wZS5wbGF0Zm9ybXMuY3JlYXRlKGxlZGdlLngsIGxlZGdlLnkpXG4gICAgICAgIG5ld0xlZGdlLmhlaWdodCA9IGxlZGdlLmhlaWdodFxuICAgICAgICBuZXdMZWRnZS53aWR0aCA9IGxlZGdlLndpZHRoXG5cbiAgICAgICAgLy8gRGVidWcgc3R1ZmZcbiAgICAgICAgLy8gbmV3TGVkZ2UuYWxwaGEgPSAwLjJcbiAgICAgICAgLy8gbGV0IHN0eWxlID0geyBmb250OiBcIjIwcHggQXJpYWxcIiwgZmlsbDogXCIjZmYwMDQ0XCIsIGFsaWduOiBcImNlbnRlclwiLCBiYWNrZ3JvdW5kQ29sb3I6IFwiI2ZmZmYwMFwiIH1cbiAgICAgICAgLy8gbGV0IHRleHQgPSB0aGlzLnNjb3BlLmdhbWUuYWRkLnRleHQobGVkZ2UueCwgbGVkZ2UueSwgbGVkZ2UuaWQsIHN0eWxlKVxuICAgICAgICAvLyB0ZXh0LmFscGhhID0gMC4yXG4gICAgfSlcbn1cblxuTWFwQ3RmMS5jcmVhdGVTa3lTcHJpdGUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNjb3BlLmFkZC50aWxlU3ByaXRlKDAsIHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSAxNTAwLCB0aGlzLnNjb3BlLmdhbWUud29ybGQud2lkdGgsIDE1MDAsICd0cmVlc2NhcGUnKVxufVxuXG5NYXBDdGYxLmNyZWF0ZVBsYXRmb3JtcyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2NvcGUucGxhdGZvcm1zID0gdGhpcy5zY29wZS5hZGQuZ3JvdXAoKVxuICAgIHRoaXMuc2NvcGUucGxhdGZvcm1zLmVuYWJsZUJvZHkgPSB0cnVlXG59XG5cbm1vZHVsZS5leHBvcnRzID0gTWFwQ3RmMVxuIl19
