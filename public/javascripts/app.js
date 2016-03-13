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
    { id: 17, x: 717, y: this.scope.game.world.height - 686, width: 155, height: 77 }, { id: 17, x: 757, y: this.scope.game.world.height - 763, width: 77, height: 77 }];

    ledges.forEach(function (ledge) {
        var newLedge = _this.scope.platforms.create(ledge.x, ledge.y, 'ground');
        // var newLedge = this.scope.platforms.create(ledge.x, ledge.y)
        newLedge.height = ledge.height;
        newLedge.width = ledge.width;

        // Debug stuff
        newLedge.alpha = 0.2;
        var style = { font: "20px Arial", fill: "#ff0044", align: "center", backgroundColor: "#ffff00" };
        var text = _this.scope.game.add.text(ledge.x, ledge.y, ledge.id, style);
        text.alpha = 0.2;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvYXBwLmpzIiwiYXNzZXRzL2pzL2xpYi9CdWxsZXQuanMiLCJhc3NldHMvanMvbGliL0d1aWQuanMiLCJhc3NldHMvanMvbGliL0lucHV0SGFuZGxlci5qcyIsImFzc2V0cy9qcy9saWIvUmVtb3RlUGxheWVyLmpzIiwiYXNzZXRzL2pzL2xpYi9XZWFwb25zL0FLNDcuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvQmFycmV0TTgyQTEuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvaW5kZXguanMiLCJhc3NldHMvanMvbWFwcy9Gb3Jlc3RDdGYuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7QUFFQSxJQUFJLFlBQVksUUFBUSxrQkFBUixDQUFaO0FBQ0osSUFBSSxlQUFlLFFBQVEsb0JBQVIsQ0FBZjtBQUNKLElBQUksT0FBTyxRQUFRLFlBQVIsQ0FBUDtBQUNKLElBQUksVUFBVSxRQUFRLGVBQVIsQ0FBVjtBQUNKLElBQUksZUFBZSxRQUFRLG9CQUFSLENBQWY7O0FBRUosSUFBSSxZQUFZLE9BQU8sVUFBUDtBQUNoQixJQUFJLGFBQWEsT0FBTyxXQUFQO0FBQ2pCLElBQUksYUFBYSxJQUFiO0FBQ0osSUFBSSxjQUFjLElBQWQ7O0FBRUosSUFBSSxPQUFPLElBQUksT0FBTyxJQUFQLENBQVksU0FBaEIsRUFBMkIsVUFBM0IsRUFBdUMsT0FBTyxNQUFQLEVBQWUsbUJBQXRELENBQVA7O0FBRUosSUFBSSxrQkFBa0IsU0FBbEIsZUFBa0IsR0FBVztBQUM3QixTQUFLLFFBQUwsR0FBZ0IsTUFBaEIsQ0FENkI7QUFFN0IsU0FBSyxhQUFMLEdBQXFCLENBQXJCLENBRjZCO0FBRzdCLFNBQUssT0FBTCxHQUFlLEVBQWYsQ0FINkI7QUFJN0IsU0FBSyxJQUFMLEdBQVksSUFBWixDQUo2QjtBQUs3QixTQUFLLE1BQUwsQ0FMNkI7QUFNN0IsU0FBSyxTQUFMLENBTjZCO0FBTzdCLFNBQUssTUFBTCxDQVA2QjtBQVE3QixTQUFLLEtBQUwsR0FBYSxDQUFiLENBUjZCO0FBUzdCLFNBQUssU0FBTCxDQVQ2QjtBQVU3QixTQUFLLE1BQUwsQ0FWNkI7QUFXN0IsU0FBSyxVQUFMLEdBQWtCLElBQWxCLENBWDZCO0FBWTdCLFNBQUssT0FBTCxHQUFlLEVBQWYsQ0FaNkI7Q0FBWDs7QUFldEIsZ0JBQWdCLFNBQWhCLEdBQTRCO0FBQ3hCLFVBQU0sZ0JBQVc7QUFDYixhQUFLLElBQUwsQ0FBVSxRQUFWLENBQW1CLGFBQW5CLENBQWlDLFdBQWpDLEdBQStDLElBQS9DLENBRGE7QUFFYixhQUFLLElBQUwsQ0FBVSxLQUFWLENBQWdCLHVCQUFoQixHQUEwQyxJQUExQyxDQUZhO0FBR2IsYUFBSyxPQUFMLENBQWEsV0FBYixDQUF5QixPQUFPLE9BQVAsQ0FBZSxNQUFmLENBQXpCLENBSGE7S0FBWDs7QUFNTixhQUFTLG1CQUFXO0FBQ2hCLGFBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsVUFBaEIsRUFBNEIsc0JBQTVCLEVBRGdCO0FBRWhCLGFBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsVUFBaEIsRUFBNEIsc0JBQTVCLEVBRmdCO0FBR2hCLGFBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsU0FBaEIsRUFBMkIscUJBQTNCLEVBSGdCO0FBSWhCLGFBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsU0FBaEIsRUFBMkIscUJBQTNCLEVBSmdCO0FBS2hCLGFBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsU0FBaEIsRUFBMkIscUJBQTNCLEVBTGdCO0FBTWhCLGFBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsU0FBaEIsRUFBMkIscUJBQTNCLEVBTmdCO0FBT2hCLGFBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsU0FBaEIsRUFBMkIscUJBQTNCLEVBUGdCO0FBUWhCLGFBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsV0FBaEIsRUFBNkIsc0JBQTdCLEVBUmdCO0FBU2hCLGFBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsUUFBaEIsRUFBMEIsc0JBQTFCLEVBVGdCO0FBVWhCLGFBQUssSUFBTCxDQUFVLFdBQVYsQ0FBc0IsTUFBdEIsRUFBOEIsa0JBQTlCLEVBQWtELEVBQWxELEVBQXNELEVBQXRELEVBVmdCO0FBV2hCLGFBQUssSUFBTCxDQUFVLFdBQVYsQ0FBc0IsT0FBdEIsRUFBK0Isa0JBQS9CLEVBQW1ELEVBQW5ELEVBQXVELEVBQXZELEVBWGdCO0tBQVg7O0FBY1QsWUFBUSxrQkFBVzs7O0FBQ2YsYUFBSyxNQUFMLEdBQWMsR0FBRyxPQUFILEVBQWQsQ0FEZTtBQUVmLGFBQUssT0FBTCxHQUFlLEVBQWY7OztBQUZlLFlBS2YsQ0FBSyxPQUFMLENBQWEsV0FBYixDQUF5QixPQUFPLE9BQVAsQ0FBZSxNQUFmLENBQXpCLENBTGU7O0FBT2YsYUFBSyxLQUFMLENBQVcsU0FBWCxDQUFxQixDQUFyQixFQUF3QixDQUF4QixFQUEyQixVQUEzQixFQUF1QyxXQUF2QyxFQVBlO0FBUWYsYUFBSyxJQUFMLENBQVUsS0FBVixDQUFnQixlQUFoQixHQUFrQyxTQUFsQzs7O0FBUmUsWUFXZixDQUFLLElBQUwsQ0FBVSxLQUFWLENBQWdCLFNBQWhCLEdBQTRCLE9BQU8sWUFBUCxDQUFvQixNQUFwQixDQVhiO0FBWWYsYUFBSyxJQUFMLENBQVUsS0FBVixDQUFnQixVQUFoQixHQVplO0FBYWYsYUFBSyxJQUFMLENBQVUsS0FBVixDQUFnQixPQUFoQjs7Ozs7QUFiZSxpQkFtQmYsQ0FBVSxNQUFWLENBQWlCLElBQWpCOzs7QUFuQmUsWUFzQmYsQ0FBSyxTQUFMLEdBQWlCLEdBQWpCO0FBdEJlLFlBdUJmLENBQUssWUFBTCxHQUFvQixJQUFwQjtBQXZCZSxZQXdCZixDQUFLLElBQUwsR0FBWSxJQUFaO0FBeEJlLFlBeUJmLENBQUssT0FBTCxHQUFlLElBQWY7QUF6QmUsWUEwQmYsQ0FBSyxVQUFMLEdBQWtCLENBQUMsR0FBRDs7Ozs7QUExQkgsWUFnQ2YsQ0FBSyxNQUFMLEdBQWMsS0FBSyxHQUFMLENBQVMsTUFBVCxDQUFnQixHQUFoQixFQUFxQixLQUFLLEtBQUwsQ0FBVyxNQUFYLEdBQW9CLEdBQXBCLEVBQXlCLE1BQTlDLENBQWQ7OztBQWhDZSxZQW1DZixDQUFLLE9BQUwsQ0FBYSxNQUFiLENBQW9CLE1BQXBCLENBQTJCLEtBQUssTUFBTCxDQUEzQjs7O0FBbkNlLFlBc0NmLENBQUssSUFBTCxDQUFVLE9BQVYsQ0FBa0IsTUFBbEIsQ0FBeUIsS0FBSyxNQUFMLEVBQWEsT0FBTyxPQUFQLENBQWUsTUFBZixDQUF0Qzs7O0FBdENlLFlBeUNmLENBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsa0JBQWpCLEdBQXNDLElBQXRDOzs7QUF6Q2UsWUE0Q2YsQ0FBSyxNQUFMLENBQVksSUFBWixDQUFpQixXQUFqQixDQUE2QixLQUE3QixDQUFtQyxLQUFLLFNBQUwsRUFBZ0IsS0FBSyxTQUFMLEdBQWlCLEVBQWpCLENBQW5EOzs7QUE1Q2UsWUErQ2YsQ0FBSyxNQUFMLENBQVksSUFBWixDQUFpQixJQUFqQixDQUFzQixLQUF0QixDQUE0QixLQUFLLElBQUwsRUFBVyxDQUF2Qzs7O0FBL0NlLFlBa0RmLENBQUssT0FBTCxDQUFhLE1BQWIsQ0FBb0IsT0FBcEIsQ0FBNEIsQ0FBNUIsR0FBZ0MsS0FBSyxPQUFMOzs7QUFsRGpCLFlBcURmLENBQUssT0FBTCxHQUFlLEtBQWY7OztBQXJEZSxZQXdEZixDQUFLLE1BQUwsQ0FBWSxVQUFaLENBQXVCLEdBQXZCLENBQTJCLE1BQTNCLEVBQW1DLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixDQUFuQyxFQUFpRCxFQUFqRCxFQUFxRCxJQUFyRCxFQXhEZTtBQXlEZixhQUFLLE1BQUwsQ0FBWSxVQUFaLENBQXVCLEdBQXZCLENBQTJCLE9BQTNCLEVBQW9DLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixDQUFwQyxFQUFrRCxFQUFsRCxFQUFzRCxJQUF0RDs7Ozs7QUF6RGUsWUErRGYsQ0FBSyxhQUFMLEdBQXFCLENBQXJCLENBL0RlO0FBZ0VmLGFBQUssT0FBTCxDQUFhLElBQWIsQ0FBa0IsSUFBSSxRQUFRLElBQVIsQ0FBYSxLQUFLLElBQUwsQ0FBbkMsRUFoRWU7QUFpRWYsYUFBSyxPQUFMLENBQWEsSUFBYixDQUFrQixJQUFJLFFBQVEsV0FBUixDQUFvQixLQUFLLElBQUwsQ0FBMUM7Ozs7O0FBakVlLFlBdUVYLGFBQWEsRUFBRSxVQUFVLE1BQVYsRUFBa0IsTUFBTSxNQUFOLEVBQWpDLENBdkVXO0FBd0VmLGFBQUssU0FBTCxHQUFpQixLQUFLLEdBQUwsQ0FBUyxJQUFULENBQWMsRUFBZCxFQUFrQixFQUFsQixFQUFzQixVQUF0QixFQUFrQyxVQUFsQyxDQUFqQixDQXhFZTtBQXlFZixhQUFLLFNBQUwsQ0FBZSxhQUFmLEdBQStCLElBQS9CLENBekVlO0FBMEVmLGFBQUssVUFBTCxHQUFrQixLQUFLLEdBQUwsQ0FBUyxJQUFULENBQWMsS0FBSyxNQUFMLENBQVksS0FBWixHQUFvQixHQUFwQixFQUF5QixLQUFLLE1BQUwsQ0FBWSxNQUFaLEdBQXFCLEVBQXJCLEVBQXlCLE9BQWhFLEVBQXlFLFVBQXpFLENBQWxCLENBMUVlO0FBMkVmLGFBQUssVUFBTCxDQUFnQixhQUFoQixHQUFnQyxJQUFoQyxDQTNFZTtBQTRFZixhQUFLLGlCQUFMLEdBQXlCLEtBQUssR0FBTCxDQUFTLElBQVQsQ0FBYyxLQUFLLE1BQUwsQ0FBWSxDQUFaLEdBQWdCLEVBQWhCLEVBQW9CLEtBQUssTUFBTCxDQUFZLE1BQVosR0FBcUIsRUFBckIsRUFBeUIsS0FBM0QsRUFBa0UsVUFBbEUsQ0FBekIsQ0E1RWU7QUE2RWYsYUFBSyxpQkFBTCxDQUF1QixhQUF2QixHQUF1QyxJQUF2Qzs7Ozs7QUE3RWUsWUFtRmYsQ0FBSyxNQUFMLENBQVksTUFBWixDQUFtQixLQUFLLE1BQUwsQ0FBbkIsQ0FuRmU7O0FBcUZmLFlBQUksWUFBWSxLQUFLLEtBQUwsQ0FBVyxRQUFYLENBQW9CLE1BQXBCLENBQTJCLE9BQU8sUUFBUCxDQUFnQixLQUFoQixDQUF2QyxDQXJGVztBQXNGZixrQkFBVSxNQUFWLENBQWlCLEdBQWpCLENBQXFCLEtBQUssVUFBTCxFQUFpQixJQUF0Qzs7Ozs7QUF0RmUsY0E0RmYsQ0FBTyxnQkFBUCxDQUF3QixRQUF4QixFQUFrQyxZQUFNO0FBQ3BDLGtCQUFLLElBQUwsQ0FBVSxLQUFWLENBQWdCLE9BQWhCLEdBRG9DO0FBRXBDLGtCQUFLLElBQUwsQ0FBVSxNQUFWLEdBQW1CLE9BQU8sV0FBUCxDQUZpQjtBQUdwQyxrQkFBSyxJQUFMLENBQVUsS0FBVixHQUFrQixPQUFPLFVBQVAsQ0FIa0I7O0FBS3BDLGtCQUFLLFVBQUwsQ0FBZ0IsWUFBaEIsQ0FBNkIsQ0FBN0IsR0FBaUMsTUFBSyxNQUFMLENBQVksS0FBWixHQUFvQixHQUFwQixDQUxHO0FBTXBDLGtCQUFLLFVBQUwsQ0FBZ0IsWUFBaEIsQ0FBNkIsQ0FBN0IsR0FBaUMsTUFBSyxNQUFMLENBQVksTUFBWixHQUFxQixFQUFyQixDQU5HOztBQVFwQyxrQkFBSyxTQUFMLENBQWUsWUFBZixDQUE0QixDQUE1QixHQUFnQyxFQUFoQyxDQVJvQztBQVNwQyxrQkFBSyxTQUFMLENBQWUsWUFBZixDQUE0QixDQUE1QixHQUFnQyxFQUFoQyxDQVRvQztTQUFOLENBQWxDOzs7OztBQTVGZSxZQTRHZixDQUFLLGdCQUFMLEdBNUdlO0tBQVg7O0FBK0dSLFlBQVEsa0JBQVc7O0FBRWYsYUFBSyxPQUFMLENBQWEsTUFBYixDQUFvQixPQUFwQixDQUE0QixLQUFLLE1BQUwsRUFBYSxLQUFLLFNBQUwsQ0FBekMsQ0FGZTtBQUdmLGFBQUssT0FBTCxDQUFhLE1BQWIsQ0FBb0IsT0FBcEIsQ0FBNEIsS0FBSyxTQUFMLEVBQWdCLEtBQUssT0FBTCxFQUFjLFVBQVMsUUFBVCxFQUFtQixNQUFuQixFQUEyQjtBQUNqRixtQkFBTyxJQUFQLEdBRGlGO1NBQTNCLEVBRXZELElBRkgsRUFFUyxJQUZULEVBSGU7O0FBT2YsYUFBSyxPQUFMLENBQWEsTUFBYixDQUFvQixPQUFwQixDQUE0QixLQUFLLEtBQUwsRUFBWSxLQUFLLE9BQUwsRUFBYyxVQUFTLEtBQVQsRUFBZ0IsTUFBaEIsRUFBd0I7QUFDMUUsa0JBQU0sTUFBTixJQUFnQixPQUFPLE1BQVAsQ0FEMEQ7QUFFMUUsbUJBQU8sSUFBUCxHQUYwRTtBQUcxRSxvQkFBUSxHQUFSLENBQVksZUFBWixFQUE2QixNQUFNLE1BQU4sRUFBYyxPQUFPLE1BQVAsQ0FBM0MsQ0FIMEU7QUFJMUUsZ0JBQUksTUFBTSxNQUFOLElBQWdCLENBQWhCLEVBQW1CO0FBQ25CLHdCQUFRLEdBQVIsQ0FBWSxnQkFBWixFQURtQjtBQUVuQixxQkFBSyxLQUFMLENBQVcsQ0FBWCxHQUFlLEdBQWYsQ0FGbUI7QUFHbkIscUJBQUssS0FBTCxDQUFXLENBQVgsR0FBZSxHQUFmLENBSG1CO0FBSW5CLHFCQUFLLEtBQUwsQ0FBVyxNQUFYLEdBQW9CLEdBQXBCLENBSm1CO2FBQXZCO1NBSmtELEVBVW5ELElBVkgsRUFVUyxJQVZULEVBUGU7O0FBbUJmLFlBQUksS0FBSyxpQkFBTCxFQUFKLEVBQThCOztBQUUxQixpQkFBSyxNQUFMLENBQVksSUFBWixDQUFpQixZQUFqQixDQUE4QixDQUE5QixHQUFrQyxDQUFDLEtBQUssWUFBTCxDQUZUO0FBRzFCLGlCQUFLLE1BQUwsQ0FBWSxVQUFaLENBQXVCLElBQXZCLENBQTRCLE1BQTVCLEVBSDBCO1NBQTlCLE1BSU8sSUFBSSxLQUFLLGtCQUFMLEVBQUosRUFBK0I7O0FBRWxDLGlCQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLFlBQWpCLENBQThCLENBQTlCLEdBQWtDLEtBQUssWUFBTCxDQUZBO0FBR2xDLGlCQUFLLE1BQUwsQ0FBWSxVQUFaLENBQXVCLElBQXZCLENBQTRCLE9BQTVCLEVBSGtDO1NBQS9CLE1BSUE7O0FBRUgsaUJBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsWUFBakIsQ0FBOEIsQ0FBOUIsR0FBa0MsQ0FBbEMsQ0FGRztBQUdILGlCQUFLLE1BQUwsQ0FBWSxVQUFaLENBQXVCLElBQXZCLEdBSEc7QUFJSCxpQkFBSyxNQUFMLENBQVksS0FBWixHQUFvQixDQUFwQixDQUpHO1NBSkE7OztBQXZCUSxZQW1DWCxjQUFjLEtBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsUUFBakIsQ0FBMEIsSUFBMUI7OztBQW5DSCxZQXNDWCxXQUFKLEVBQWlCO0FBQ2IsaUJBQUssS0FBTCxHQUFhLENBQWIsQ0FEYTtBQUViLGlCQUFLLE9BQUwsR0FBZSxLQUFmLENBRmE7U0FBakI7OztBQXRDZSxZQTRDWCxLQUFLLEtBQUwsR0FBYSxDQUFiLElBQWtCLEtBQUssZUFBTCxDQUFxQixDQUFyQixDQUFsQixFQUEyQztBQUMzQyxpQkFBSyxNQUFMLENBQVksSUFBWixDQUFpQixRQUFqQixDQUEwQixDQUExQixHQUE4QixLQUFLLFVBQUwsQ0FEYTtBQUUzQyxpQkFBSyxPQUFMLEdBQWUsSUFBZixDQUYyQztTQUEvQzs7O0FBNUNlLFlBa0RYLEtBQUssT0FBTCxJQUFnQixLQUFLLGVBQUwsRUFBaEIsRUFBd0M7QUFDeEMsaUJBQUssS0FBTCxHQUR3QztBQUV4QyxpQkFBSyxPQUFMLEdBQWUsS0FBZixDQUZ3QztTQUE1Qzs7QUFLQSxZQUFJLEtBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsYUFBaEIsQ0FBOEIsTUFBOUIsRUFDSjtBQUNJLGlCQUFLLE9BQUwsQ0FBYSxLQUFLLGFBQUwsQ0FBYixDQUFpQyxJQUFqQyxDQUFzQyxLQUFLLE1BQUwsQ0FBdEMsQ0FESjtTQURBOztBQUtBLGFBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsYUFBakIsRUFBZ0MsRUFBRSxHQUFHLEtBQUssTUFBTCxDQUFZLENBQVosRUFBZSxHQUFHLEtBQUssTUFBTCxDQUFZLENBQVosRUFBdkQsRUE1RGU7S0FBWDs7QUErRFIsdUJBQW1CLGFBQWEsaUJBQWI7QUFDbkIsd0JBQW9CLGFBQWEsa0JBQWI7QUFDcEIscUJBQWlCLGFBQWEsZUFBYjtBQUNqQixxQkFBaUIsYUFBYSxlQUFiOztBQUVqQixnQkFBWSxzQkFBVzs7QUFFbkIsWUFBSSxLQUFLLGFBQUwsR0FBcUIsQ0FBckIsRUFDSjtBQUNJLGlCQUFLLE9BQUwsQ0FBYSxLQUFLLGFBQUwsQ0FBYixDQUFpQyxLQUFqQyxHQURKO1NBREEsTUFLQTtBQUNJLGlCQUFLLE9BQUwsQ0FBYSxLQUFLLGFBQUwsQ0FBYixDQUFpQyxPQUFqQyxHQUEyQyxLQUEzQyxDQURKO0FBRUksaUJBQUssT0FBTCxDQUFhLEtBQUssYUFBTCxDQUFiLENBQWlDLE9BQWpDLENBQXlDLE9BQXpDLEVBQWtELElBQWxELEVBQXdELENBQXhELEVBQTJELENBQTNELEVBRko7QUFHSSxpQkFBSyxPQUFMLENBQWEsS0FBSyxhQUFMLENBQWIsQ0FBaUMsTUFBakMsQ0FBd0MsUUFBeEMsRUFBa0QsS0FBbEQsRUFISjtTQUxBOzs7QUFGbUIsWUFjbkIsQ0FBSyxhQUFMLEdBZG1COztBQWdCbkIsWUFBSSxLQUFLLGFBQUwsS0FBdUIsS0FBSyxPQUFMLENBQWEsTUFBYixFQUMzQjtBQUNJLGlCQUFLLGFBQUwsR0FBcUIsQ0FBckIsQ0FESjtTQURBOztBQUtBLGFBQUssT0FBTCxDQUFhLEtBQUssYUFBTCxDQUFiLENBQWlDLE9BQWpDLEdBQTJDLElBQTNDLENBckJtQjs7QUF1Qm5CLGFBQUssVUFBTCxDQUFnQixJQUFoQixHQUF1QixLQUFLLE9BQUwsQ0FBYSxLQUFLLGFBQUwsQ0FBYixDQUFpQyxJQUFqQyxDQXZCSjtLQUFYOztBQTBCWixzQkFBa0IsNEJBQVk7O0FBRTFCLGFBQUssTUFBTCxDQUFZLEVBQVosQ0FBZSxTQUFmLEVBQTBCLEtBQUssaUJBQUwsQ0FBdUIsSUFBdkIsQ0FBNEIsSUFBNUIsQ0FBMUI7OztBQUYwQixZQUsxQixDQUFLLE1BQUwsQ0FBWSxFQUFaLENBQWUsWUFBZixFQUE2QixLQUFLLGtCQUFMLENBQXdCLElBQXhCLENBQTZCLElBQTdCLENBQTdCOzs7QUFMMEIsWUFRMUIsQ0FBSyxNQUFMLENBQVksRUFBWixDQUFlLGFBQWYsRUFBOEIsS0FBSyxZQUFMLENBQWtCLElBQWxCLENBQXVCLElBQXZCLENBQTlCOzs7QUFSMEIsWUFXMUIsQ0FBSyxNQUFMLENBQVksRUFBWixDQUFlLGVBQWYsRUFBZ0MsS0FBSyxjQUFMLENBQW9CLElBQXBCLENBQXlCLElBQXpCLENBQWhDOzs7QUFYMEIsWUFjMUIsQ0FBSyxNQUFMLENBQVksRUFBWixDQUFlLGdCQUFmLEVBQWlDLEtBQUssZUFBTCxDQUFxQixJQUFyQixDQUEwQixJQUExQixDQUFqQyxFQWQwQjtLQUFaOztBQWlCbEIscUJBQWlCLHlCQUFTLElBQVQsRUFBZTs7O0FBQzVCLGFBQUssT0FBTCxDQUFhLE9BQWIsQ0FBcUIsVUFBVSxLQUFWLEVBQWlCO0FBQ2xDLGtCQUFNLE1BQU4sQ0FBYSxJQUFiLEdBRGtDO1NBQWpCLENBQXJCLENBRDRCOztBQUs1QixhQUFLLE9BQUwsR0FBZSxFQUFmLENBTDRCOztBQU81QixhQUFLLE9BQUwsQ0FBYSxPQUFiLENBQXFCLFVBQUMsTUFBRCxFQUFZO0FBQzdCLGdCQUFJLE9BQU8sRUFBUCxLQUFlLE9BQU8sT0FBSyxNQUFMLENBQVksRUFBWixFQUN0QixPQURKOztBQUdBLGdCQUFJLGtCQUFrQixhQUFhLE9BQU8sRUFBUCxFQUFXLE9BQUssSUFBTCxFQUFXLE9BQUssTUFBTCxFQUFhLE9BQU8sQ0FBUCxFQUFVLE9BQU8sQ0FBUCxDQUE1RSxDQUp5QjtBQUs3QixtQkFBSyxPQUFMLENBQWEsSUFBYixDQUFrQixlQUFsQixFQUw2QjtBQU03QixtQkFBSyxPQUFMLENBQWEsT0FBSyxPQUFMLENBQWEsTUFBYixHQUFzQixDQUF0QixDQUFiLENBQXNDLE1BQXRDLENBQTZDLFVBQTdDLENBQXdELEdBQXhELENBQTRELE1BQTVELEVBQW9FLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixDQUFwRSxFQUFrRixFQUFsRixFQUFzRixJQUF0RixFQU42QjtBQU83QixtQkFBSyxPQUFMLENBQWEsT0FBSyxPQUFMLENBQWEsTUFBYixHQUFzQixDQUF0QixDQUFiLENBQXNDLE1BQXRDLENBQTZDLFVBQTdDLENBQXdELEdBQXhELENBQTRELE9BQTVELEVBQXFFLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixDQUFyRSxFQUFtRixFQUFuRixFQUF1RixJQUF2RixFQVA2QjtTQUFaLENBQXJCLENBUDRCO0tBQWY7OztBQW1CakIsdUJBQW1CLDZCQUFXO0FBQzFCLGdCQUFRLEdBQVIsQ0FBWSw0QkFBWjs7O0FBRDBCLFlBSTFCLENBQUssT0FBTCxDQUFhLE9BQWIsQ0FBcUIsVUFBVSxLQUFWLEVBQWlCO0FBQ2xDLGtCQUFNLElBQU4sR0FEa0M7U0FBakIsQ0FBckIsQ0FKMEI7QUFPMUIsYUFBSyxPQUFMLEdBQWUsRUFBZjs7O0FBUDBCLFlBVTFCLENBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsWUFBakIsRUFBK0I7QUFDM0Isc0JBQVUsS0FBSyxRQUFMO0FBQ1YsZUFBRyxLQUFLLE1BQUwsQ0FBWSxDQUFaO0FBQ0gsZUFBRyxLQUFLLE1BQUwsQ0FBWSxDQUFaO1NBSFAsRUFWMEI7S0FBWDs7O0FBa0JuQix3QkFBb0IsOEJBQVc7QUFDM0IsZ0JBQVEsR0FBUixDQUFZLGlDQUFaLEVBRDJCO0tBQVg7OztBQUtwQixrQkFBYyxzQkFBUyxJQUFULEVBQWU7QUFDekIsWUFBSSxhQUFhLEtBQUssVUFBTCxDQUFnQixLQUFLLEVBQUwsQ0FBN0I7Ozs7O0FBRHFCLFlBTXJCLENBQUUsVUFBRixFQUFjO0FBQ2QsbUJBRGM7U0FBbEI7OztBQU55QixrQkFXekIsQ0FBVyxNQUFYLENBQWtCLENBQWxCLEdBQXNCLEtBQUssQ0FBTCxDQVhHO0FBWXpCLG1CQUFXLE1BQVgsQ0FBa0IsQ0FBbEIsR0FBc0IsS0FBSyxDQUFMLENBWkc7O0FBY3pCLFlBQUksV0FBVyxNQUFYLENBQWtCLENBQWxCLEdBQXNCLFdBQVcsWUFBWCxDQUF3QixDQUF4QixFQUEyQjtBQUNqRCx1QkFBVyxNQUFYLENBQWtCLFVBQWxCLENBQTZCLElBQTdCLENBQWtDLE9BQWxDLEVBRGlEO1NBQXJELE1BR0ssSUFBSSxXQUFXLE1BQVgsQ0FBa0IsQ0FBbEIsR0FBc0IsV0FBVyxZQUFYLENBQXdCLENBQXhCLEVBQy9CO0FBQ0ksdUJBQVcsTUFBWCxDQUFrQixVQUFsQixDQUE2QixJQUE3QixDQUFrQyxNQUFsQyxFQURKO1NBREssTUFLTDtBQUNJLHVCQUFXLE1BQVgsQ0FBa0IsVUFBbEIsQ0FBNkIsSUFBN0IsR0FESjtBQUVJLHVCQUFXLE1BQVgsQ0FBa0IsS0FBbEIsR0FBMEIsQ0FBMUIsQ0FGSjtTQUxLOztBQVVMLG1CQUFXLFlBQVgsQ0FBd0IsQ0FBeEIsR0FBNEIsV0FBVyxNQUFYLENBQWtCLENBQWxCLENBM0JIO0FBNEJ6QixtQkFBVyxZQUFYLENBQXdCLENBQXhCLEdBQTRCLFdBQVcsTUFBWCxDQUFrQixDQUFsQixDQTVCSDtLQUFmOzs7QUFnQ2Qsb0JBQWdCLHdCQUFTLElBQVQsRUFBZTtBQUMzQixZQUFJLGVBQWUsS0FBSyxVQUFMLENBQWdCLEtBQUssRUFBTCxDQUEvQjs7O0FBRHVCLFlBSXZCLENBQUMsWUFBRCxFQUFlO0FBQ2Ysb0JBQVEsR0FBUixDQUFZLG9CQUFaLEVBQWtDLEtBQUssRUFBTCxDQUFsQyxDQURlO0FBRWYsbUJBRmU7U0FBbkI7O0FBS0EscUJBQWEsTUFBYixDQUFvQixJQUFwQjs7O0FBVDJCLFlBWTNCLENBQUssT0FBTCxDQUFhLE1BQWIsQ0FBb0IsS0FBSyxPQUFMLENBQWEsT0FBYixDQUFxQixZQUFyQixDQUFwQixFQUF3RCxDQUF4RCxFQVoyQjtLQUFmOzs7QUFnQmhCLGdCQUFZLG9CQUFTLEVBQVQsRUFBYTtBQUNyQixhQUFLLElBQUksSUFBSSxDQUFKLEVBQU8sSUFBSSxLQUFLLE9BQUwsQ0FBYSxNQUFiLEVBQXFCLEdBQXpDLEVBQThDO0FBQzFDLGdCQUFJLEtBQUssT0FBTCxDQUFhLENBQWIsRUFBZ0IsTUFBaEIsQ0FBdUIsRUFBdkIsS0FBOEIsRUFBOUIsRUFBa0M7QUFDbEMsdUJBQU8sS0FBSyxPQUFMLENBQWEsQ0FBYixDQUFQLENBRGtDO2FBQXRDO1NBREo7O0FBTUEsZUFBTyxLQUFQLENBUHFCO0tBQWI7Q0E3VWhCOztBQXdWQSxLQUFLLEtBQUwsQ0FBVyxHQUFYLENBQWUsTUFBZixFQUF1QixlQUF2QixFQUF3QyxJQUF4Qzs7O0FDdFhBOztBQUVBLElBQUksU0FBUyxTQUFULE1BQVMsQ0FBVSxJQUFWLEVBQWdCLEdBQWhCLEVBQXFCO0FBQzlCLFdBQU8sTUFBUCxDQUFjLElBQWQsQ0FBbUIsSUFBbkIsRUFBeUIsSUFBekIsRUFBK0IsQ0FBL0IsRUFBa0MsQ0FBbEMsRUFBcUMsR0FBckMsRUFEOEI7O0FBRzlCLFNBQUssT0FBTCxDQUFhLFdBQWIsQ0FBeUIsU0FBekIsR0FBcUMsS0FBSyxVQUFMLENBQWdCLE9BQWhCLENBSFA7O0FBSzlCLFNBQUssTUFBTCxDQUFZLEdBQVosQ0FBZ0IsR0FBaEIsRUFMOEI7O0FBTzlCLFNBQUssZ0JBQUwsR0FBd0IsSUFBeEIsQ0FQOEI7QUFROUIsU0FBSyxlQUFMLEdBQXVCLElBQXZCLENBUjhCO0FBUzlCLFNBQUssTUFBTCxHQUFjLEtBQWQsQ0FUOEI7O0FBVzlCLFNBQUssUUFBTCxHQUFnQixLQUFoQixDQVg4QjtBQVk5QixTQUFLLFVBQUwsR0FBa0IsQ0FBbEIsQ0FaOEI7Q0FBckI7O0FBZ0JiLE9BQU8sU0FBUCxHQUFtQixPQUFPLE1BQVAsQ0FBYyxPQUFPLE1BQVAsQ0FBYyxTQUFkLENBQWpDO0FBQ0EsT0FBTyxTQUFQLENBQWlCLFdBQWpCLEdBQStCLE1BQS9COztBQUVBLE9BQU8sU0FBUCxDQUFpQixJQUFqQixHQUF3QixVQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLEtBQWhCLEVBQXVCLEtBQXZCLEVBQThCLEVBQTlCLEVBQWtDLEVBQWxDLEVBQXNDO0FBQzFELFNBQUssTUFBTSxDQUFOLENBRHFEO0FBRTFELFNBQUssTUFBTSxDQUFOLENBRnFEO0FBRzFELFNBQUssS0FBTCxDQUFXLENBQVgsRUFBYyxDQUFkOzs7QUFIMEQsUUFNMUQsQ0FBSyxJQUFMLENBQVUsT0FBVixDQUFrQixNQUFsQixDQUF5QixhQUF6QixDQUF1QyxJQUF2QyxFQUE2QyxLQUE3QyxFQU4wRDtBQU8xRCxTQUFLLElBQUwsQ0FBVSxPQUFWLENBQWtCLENBQWxCLEdBQXNCLENBQUMsSUFBRCxDQVBvQztDQUF0Qzs7QUFVeEIsT0FBTyxTQUFQLENBQWlCLE1BQWpCLEdBQTBCLFlBQVk7QUFDbEMsUUFBSSxLQUFLLFFBQUwsRUFDSjtBQUNJLGFBQUssUUFBTCxHQUFnQixLQUFLLEtBQUwsQ0FBVyxLQUFLLElBQUwsQ0FBVSxRQUFWLENBQW1CLENBQW5CLEVBQXNCLEtBQUssSUFBTCxDQUFVLFFBQVYsQ0FBbUIsQ0FBbkIsQ0FBakQsQ0FESjtLQURBOztBQUtBLFFBQUksS0FBSyxVQUFMLEdBQWtCLENBQWxCLEVBQ0o7QUFDSSxhQUFLLEtBQUwsQ0FBVyxDQUFYLElBQWdCLEtBQUssVUFBTCxDQURwQjtBQUVJLGFBQUssS0FBTCxDQUFXLENBQVgsSUFBZ0IsS0FBSyxVQUFMLENBRnBCO0tBREE7Q0FOc0I7O0FBYTFCLE9BQU8sT0FBUCxHQUFpQixNQUFqQjs7O0FDNUNBOztBQUVBLE9BQU8sT0FBUCxHQUFpQixTQUFTLGFBQVQsR0FBeUI7QUFDdEMsT0FBSSxLQUFLLFNBQUwsRUFBSyxHQUFXO0FBQ2pCLGFBQU8sQ0FBQyxDQUFFLElBQUUsS0FBSyxNQUFMLEVBQUYsQ0FBRCxHQUFrQixPQUFsQixHQUEyQixDQUE1QixDQUFELENBQWdDLFFBQWhDLENBQXlDLEVBQXpDLEVBQTZDLFNBQTdDLENBQXVELENBQXZELENBQVAsQ0FEaUI7SUFBWCxDQUQ2Qjs7QUFLdEMsVUFBUSxPQUFLLElBQUwsR0FBVSxHQUFWLEdBQWMsSUFBZCxHQUFtQixHQUFuQixHQUF1QixJQUF2QixHQUE0QixHQUE1QixHQUFnQyxJQUFoQyxHQUFxQyxHQUFyQyxHQUF5QyxJQUF6QyxHQUE4QyxJQUE5QyxHQUFtRCxJQUFuRCxDQUw4QjtDQUF6Qjs7O0FDRmpCOztBQUVBLE9BQU8sT0FBUCxHQUFpQjs7OztBQUliLHVCQUFtQiw2QkFBVztBQUMxQixlQUFPLEtBQUssS0FBTCxDQUFXLFFBQVgsQ0FBb0IsTUFBcEIsQ0FBMkIsT0FBTyxRQUFQLENBQWdCLENBQWhCLENBQWxDLENBRDBCO0tBQVg7Ozs7O0FBT25CLHdCQUFvQiw4QkFBVztBQUMzQixlQUFPLEtBQUssS0FBTCxDQUFXLFFBQVgsQ0FBb0IsTUFBcEIsQ0FBMkIsT0FBTyxRQUFQLENBQWdCLENBQWhCLENBQWxDLENBRDJCO0tBQVg7Ozs7O0FBT3BCLHFCQUFpQix5QkFBUyxRQUFULEVBQW1CO0FBQ2hDLGVBQU8sS0FBSyxLQUFMLENBQVcsUUFBWCxDQUFvQixZQUFwQixDQUFpQyxPQUFPLFFBQVAsQ0FBZ0IsQ0FBaEIsRUFBbUIsUUFBcEQsQ0FBUCxDQURnQztLQUFuQjs7O0FBS2pCLHFCQUFpQiwyQkFBVztBQUN4QixlQUFPLEtBQUssS0FBTCxDQUFXLFFBQVgsQ0FBb0IsVUFBcEIsQ0FBK0IsT0FBTyxRQUFQLENBQWdCLENBQWhCLENBQXRDLENBRHdCO0tBQVg7Q0F2QnJCOzs7QUNGQTs7QUFFQSxJQUFJLGVBQWUsU0FBZixZQUFlLENBQVMsRUFBVCxFQUFhLElBQWIsRUFBbUIsTUFBbkIsRUFBMkIsTUFBM0IsRUFBbUMsTUFBbkMsRUFBMkM7QUFDMUQsUUFBSSxrQkFBa0I7QUFDbEIsV0FBRyxNQUFIO0FBQ0EsV0FBRyxNQUFIO0FBQ0EsWUFBSSxJQUFKO0FBQ0EsY0FBTSxJQUFOO0FBQ0EsZ0JBQVEsR0FBUjtBQUNBLGdCQUFRLE1BQVI7QUFDQSxlQUFPLElBQVA7QUFDQSxzQkFBYztBQUNWLGVBQUcsTUFBSDtBQUNBLGVBQUcsTUFBSDtTQUZKO0tBUkE7OztBQURzRCxtQkFnQjFELENBQWdCLE1BQWhCLEdBQXlCLEtBQUssR0FBTCxDQUFTLE1BQVQsQ0FBZ0IsTUFBaEIsRUFBd0IsTUFBeEIsRUFBZ0MsT0FBaEMsQ0FBekI7OztBQWhCMEQsbUJBbUIxRCxDQUFnQixNQUFoQixDQUF1QixVQUF2QixDQUFrQyxHQUFsQyxDQUFzQyxNQUF0QyxFQUE4QyxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsQ0FBOUMsRUFBNEQsRUFBNUQsRUFBZ0UsSUFBaEUsRUFuQjBEO0FBb0IxRCxvQkFBZ0IsTUFBaEIsQ0FBdUIsVUFBdkIsQ0FBa0MsR0FBbEMsQ0FBc0MsT0FBdEMsRUFBK0MsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLENBQS9DLEVBQTZELEVBQTdELEVBQWlFLElBQWpFLEVBcEIwRDs7QUFzQjFELG9CQUFnQixNQUFoQixDQUF1QixFQUF2QixHQUE0QixFQUE1QixDQXRCMEQ7O0FBd0IxRCxXQUFPLGVBQVAsQ0F4QjBEO0NBQTNDOztBQTJCbkIsT0FBTyxPQUFQLEdBQWlCLFlBQWpCOzs7QUM3QkE7O0FBRUEsSUFBSSxTQUFTLFFBQVEsV0FBUixDQUFUOztBQUVKLElBQUksT0FBTyxTQUFQLElBQU8sQ0FBVSxJQUFWLEVBQWdCO0FBQ3ZCLFdBQU8sS0FBUCxDQUFhLElBQWIsQ0FBa0IsSUFBbEIsRUFBd0IsSUFBeEIsRUFBOEIsS0FBSyxLQUFMLEVBQVksT0FBMUMsRUFBbUQsS0FBbkQsRUFBMEQsSUFBMUQsRUFBZ0UsT0FBTyxPQUFQLENBQWUsTUFBZixDQUFoRSxDQUR1Qjs7QUFHdkIsU0FBSyxNQUFMLEdBQWMsRUFBZCxDQUh1QjtBQUl2QixTQUFLLFFBQUwsR0FBZ0IsQ0FBaEIsQ0FKdUI7QUFLdkIsU0FBSyxXQUFMLEdBQW1CLElBQW5COztBQUx1QixRQU92QixDQUFLLFFBQUwsR0FBZ0IsVUFBaEIsQ0FQdUI7O0FBU3ZCLFNBQUssSUFBSSxJQUFJLENBQUosRUFBTyxJQUFJLEVBQUosRUFBUSxHQUF4QixFQUNBO0FBQ0ksWUFBSSxTQUFTLElBQUksTUFBSixDQUFXLEtBQUssSUFBTCxFQUFXLFFBQXRCLENBQVQsQ0FEUjtBQUVJLGVBQU8sTUFBUCxHQUFnQixDQUFoQixDQUZKO0FBR0ksZUFBTyxLQUFQLEdBQWUsRUFBZixDQUhKO0FBSUksZUFBTyxNQUFQLEdBQWdCLEVBQWhCLENBSko7QUFLSSxhQUFLLEdBQUwsQ0FBUyxNQUFULEVBQWlCLElBQWpCLEVBTEo7S0FEQTs7QUFTQSxXQUFPLElBQVAsQ0FsQnVCO0NBQWhCOztBQXFCWCxLQUFLLFNBQUwsR0FBaUIsT0FBTyxNQUFQLENBQWMsT0FBTyxLQUFQLENBQWEsU0FBYixDQUEvQjtBQUNBLEtBQUssU0FBTCxDQUFlLFdBQWYsR0FBNkIsSUFBN0I7O0FBRUEsS0FBSyxTQUFMLENBQWUsSUFBZixHQUFzQixVQUFVLE1BQVYsRUFBa0I7O0FBRXBDLFFBQUksS0FBSyxJQUFMLENBQVUsSUFBVixDQUFlLElBQWYsR0FBc0IsS0FBSyxRQUFMLEVBQ3RCLE9BREo7O0FBR0EsUUFBSSxJQUFJLE9BQU8sQ0FBUCxHQUFXLEVBQVgsQ0FMNEI7QUFNcEMsUUFBSSxJQUFJLE9BQU8sQ0FBUCxHQUFXLEVBQVgsQ0FONEI7O0FBUXBDLFNBQUssY0FBTCxDQUFvQixLQUFwQixFQUEyQixJQUEzQixDQUFnQyxDQUFoQyxFQUFtQyxDQUFuQyxFQUFzQyxDQUF0QyxFQUF5QyxLQUFLLFdBQUwsRUFBa0IsQ0FBM0QsRUFBOEQsQ0FBOUQsRUFSb0M7QUFTcEMsU0FBSyxNQUFMLENBQVksVUFBWixFQUF3QixJQUF4QixFQVRvQzs7QUFXcEMsU0FBSyxRQUFMLEdBQWdCLEtBQUssSUFBTCxDQUFVLElBQVYsQ0FBZSxJQUFmLEdBQXNCLEtBQUssUUFBTCxDQVhGO0NBQWxCOztBQWN0QixPQUFPLE9BQVAsR0FBaUIsSUFBakI7OztBQzFDQTs7QUFFQSxJQUFJLFNBQVMsUUFBUSxXQUFSLENBQVQ7O0FBRUosSUFBSSxjQUFjLFNBQWQsV0FBYyxDQUFVLElBQVYsRUFBZ0I7QUFDOUIsV0FBTyxLQUFQLENBQWEsSUFBYixDQUFrQixJQUFsQixFQUF3QixJQUF4QixFQUE4QixLQUFLLEtBQUwsRUFBWSxPQUExQyxFQUFtRCxLQUFuRCxFQUEwRCxJQUExRCxFQUFnRSxPQUFPLE9BQVAsQ0FBZSxNQUFmLENBQWhFLENBRDhCOztBQUc5QixTQUFLLElBQUwsR0FBWSxjQUFaLENBSDhCO0FBSTlCLFNBQUssTUFBTCxHQUFjLEVBQWQsQ0FKOEI7QUFLOUIsU0FBSyxRQUFMLEdBQWdCLENBQWhCLENBTDhCO0FBTTlCLFNBQUssV0FBTCxHQUFtQixJQUFuQjs7O0FBTjhCLFFBUzlCLENBQUssUUFBTCxHQUFnQixJQUFoQixDQVQ4Qjs7QUFXOUIsU0FBSyxJQUFJLElBQUksQ0FBSixFQUFPLElBQUksRUFBSixFQUFRLEdBQXhCLEVBQ0E7QUFDSSxZQUFJLFNBQVMsSUFBSSxNQUFKLENBQVcsS0FBSyxJQUFMLEVBQVcsUUFBdEIsQ0FBVCxDQURSO0FBRUksZUFBTyxNQUFQLEdBQWdCLENBQWhCLENBRko7QUFHSSxlQUFPLEtBQVAsR0FBZSxFQUFmLENBSEo7QUFJSSxlQUFPLE1BQVAsR0FBZ0IsRUFBaEIsQ0FKSjs7QUFNSSxhQUFLLEdBQUwsQ0FBUyxNQUFULEVBQWlCLElBQWpCLEVBTko7S0FEQTs7QUFVQSxXQUFPLElBQVAsQ0FyQjhCO0NBQWhCOztBQXdCbEIsWUFBWSxTQUFaLEdBQXdCLE9BQU8sTUFBUCxDQUFjLE9BQU8sS0FBUCxDQUFhLFNBQWIsQ0FBdEM7QUFDQSxZQUFZLFNBQVosQ0FBc0IsV0FBdEIsR0FBb0MsV0FBcEM7O0FBRUEsWUFBWSxTQUFaLENBQXNCLElBQXRCLEdBQTZCLFVBQVUsTUFBVixFQUFrQjtBQUMzQyxRQUFJLEtBQUssSUFBTCxDQUFVLElBQVYsQ0FBZSxJQUFmLEdBQXNCLEtBQUssUUFBTCxFQUN0QixPQURKOztBQUdBLFFBQUksSUFBSSxPQUFPLENBQVAsR0FBVyxFQUFYLENBSm1DO0FBSzNDLFFBQUksSUFBSSxPQUFPLENBQVAsR0FBVyxFQUFYLENBTG1DOztBQU8zQyxTQUFLLGNBQUwsQ0FBb0IsS0FBcEIsRUFBMkIsSUFBM0IsQ0FBZ0MsQ0FBaEMsRUFBbUMsQ0FBbkMsRUFBc0MsQ0FBdEMsRUFBeUMsS0FBSyxXQUFMLEVBQWtCLENBQTNELEVBQThELENBQTlELEVBUDJDO0FBUTNDLFNBQUssTUFBTCxDQUFZLFVBQVosRUFBd0IsSUFBeEIsRUFSMkM7O0FBVTNDLFNBQUssUUFBTCxHQUFnQixLQUFLLElBQUwsQ0FBVSxJQUFWLENBQWUsSUFBZixHQUFzQixLQUFLLFFBQUwsQ0FWSztDQUFsQjs7QUFhN0IsT0FBTyxPQUFQLEdBQWlCLFdBQWpCOzs7QUM1Q0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXdCQSxPQUFPLE9BQVAsR0FBaUI7QUFDYixVQUFRLFFBQVEsUUFBUixDQUFSO0FBQ0EsaUJBQWUsUUFBUSxlQUFSLENBQWY7Q0FGSjs7O0FDeEJBOztBQUVBLElBQUksVUFBVSxFQUFWOztBQUVKLFFBQVEsTUFBUixHQUFpQixVQUFTLEtBQVQsRUFBZ0I7QUFDN0IsU0FBSyxLQUFMLEdBQWEsS0FBYixDQUQ2Qjs7QUFHN0IsU0FBSyxlQUFMLEdBSDZCO0FBSTdCLFNBQUssZUFBTCxHQUo2QjtBQUs3QixTQUFLLFlBQUwsR0FMNkI7O0FBTzdCLFNBQUssS0FBTCxDQUFXLFNBQVgsQ0FBcUIsTUFBckIsQ0FBNEIsZ0JBQTVCLEVBQThDLElBQTlDLEVBUDZCO0FBUTdCLFNBQUssS0FBTCxDQUFXLFNBQVgsQ0FBcUIsTUFBckIsQ0FBNEIsbUJBQTVCLEVBQWlELEtBQWpELEVBUjZCO0NBQWhCOztBQVdqQixRQUFRLFlBQVIsR0FBdUIsWUFBVzs7O0FBQzlCLFFBQUksU0FBUzs7OztBQUlULE1BQUUsSUFBSSxDQUFKLEVBQU8sR0FBRyxDQUFILEVBQU0sR0FBRyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEtBQWhCLENBQXNCLE1BQXRCLEdBQStCLEdBQS9CLEVBQW9DLE9BQU8sR0FBUCxFQUFZLFFBQVEsRUFBUixFQUp6RDtBQUtULE1BQUUsSUFBSSxDQUFKLEVBQU8sR0FBRyxDQUFILEVBQU0sR0FBRyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEtBQWhCLENBQXNCLE1BQXRCLEdBQStCLEdBQS9CLEVBQW9DLE9BQU8sR0FBUCxFQUFZLFFBQVEsRUFBUixFQUx6RDs7QUFPVCxNQUFFLElBQUksQ0FBSixFQUFPLEdBQUcsSUFBSCxFQUFTLEdBQUcsS0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixLQUFoQixDQUFzQixNQUF0QixHQUErQixHQUEvQixFQUFvQyxPQUFPLEdBQVAsRUFBWSxRQUFRLEVBQVIsRUFQNUQ7QUFRVCxNQUFFLElBQUksQ0FBSixFQUFPLEdBQUcsSUFBSCxFQUFTLEdBQUcsS0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixLQUFoQixDQUFzQixNQUF0QixHQUErQixHQUEvQixFQUFvQyxPQUFPLEdBQVAsRUFBWSxRQUFRLEVBQVIsRUFSNUQ7OztBQVdULE1BQUUsSUFBSSxDQUFKLEVBQU8sR0FBRyxDQUFILEVBQU0sR0FBRyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEtBQWhCLENBQXNCLE1BQXRCLEdBQStCLEdBQS9CLEVBQW9DLE9BQU8sR0FBUCxFQUFZLFFBQVEsR0FBUixFQVh6RDtBQVlULE1BQUUsSUFBSSxDQUFKLEVBQU8sR0FBRyxHQUFILEVBQVEsR0FBRyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEtBQWhCLENBQXNCLE1BQXRCLEdBQStCLEdBQS9CLEVBQW9DLE9BQU8sR0FBUCxFQUFZLFFBQVEsR0FBUixFQVozRDtBQWFULE1BQUUsSUFBSSxDQUFKLEVBQU8sR0FBRyxJQUFILEVBQVMsR0FBRyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEtBQWhCLENBQXNCLE1BQXRCLEdBQStCLEdBQS9CLEVBQW9DLE9BQU8sSUFBUCxFQUFhLFFBQVEsR0FBUixFQWI3RDtBQWNULE1BQUUsSUFBSSxDQUFKLEVBQU8sR0FBRyxJQUFILEVBQVMsR0FBRyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEtBQWhCLENBQXNCLE1BQXRCLEdBQStCLEdBQS9CLEVBQW9DLE9BQU8sR0FBUCxFQUFZLFFBQVEsR0FBUixFQWQ1RDtBQWVULE1BQUUsSUFBSSxDQUFKLEVBQU8sR0FBRyxJQUFILEVBQVMsR0FBRyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEtBQWhCLENBQXNCLE1BQXRCLEdBQStCLEdBQS9CLEVBQW9DLE9BQU8sR0FBUCxFQUFZLFFBQVEsR0FBUixFQWY1RDs7O0FBa0JULE1BQUUsSUFBSSxFQUFKLEVBQVEsR0FBRyxHQUFILEVBQVEsR0FBRyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEtBQWhCLENBQXNCLE1BQXRCLEdBQStCLEdBQS9CLEVBQW9DLE9BQU8sR0FBUCxFQUFZLFFBQVEsRUFBUixFQWxCNUQsRUFtQlQsRUFBRSxJQUFJLEVBQUosRUFBUSxHQUFHLElBQUgsRUFBUyxHQUFHLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsS0FBaEIsQ0FBc0IsTUFBdEIsR0FBK0IsR0FBL0IsRUFBb0MsT0FBTyxHQUFQLEVBQVksUUFBUSxFQUFSLEVBbkI3RCxFQW9CVCxFQUFFLElBQUksRUFBSixFQUFRLEdBQUcsR0FBSCxFQUFRLEdBQUcsS0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixLQUFoQixDQUFzQixNQUF0QixHQUErQixHQUEvQixFQUFvQyxPQUFPLEdBQVAsRUFBWSxRQUFRLEVBQVIsRUFwQjVELEVBcUJULEVBQUUsSUFBSSxFQUFKLEVBQVEsR0FBRyxJQUFILEVBQVMsR0FBRyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEtBQWhCLENBQXNCLE1BQXRCLEdBQStCLEdBQS9CLEVBQW9DLE9BQU8sR0FBUCxFQUFZLFFBQVEsR0FBUixFQXJCN0QsRUFzQlQsRUFBRSxJQUFJLEVBQUosRUFBUSxHQUFHLElBQUgsRUFBUyxHQUFHLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsS0FBaEIsQ0FBc0IsTUFBdEIsR0FBK0IsR0FBL0IsRUFBb0MsT0FBTyxHQUFQLEVBQVksUUFBUSxFQUFSLEVBdEI3RCxFQXVCVCxFQUFFLElBQUksRUFBSixFQUFRLEdBQUcsSUFBSCxFQUFTLEdBQUcsS0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixLQUFoQixDQUFzQixNQUF0QixHQUErQixHQUEvQixFQUFvQyxPQUFPLEdBQVAsRUFBWSxRQUFRLEVBQVIsRUF2QjdELEVBd0JULEVBQUUsSUFBSSxFQUFKLEVBQVEsR0FBRyxJQUFILEVBQVMsR0FBRyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEtBQWhCLENBQXNCLE1BQXRCLEdBQStCLEdBQS9CLEVBQW9DLE9BQU8sR0FBUCxFQUFZLFFBQVEsRUFBUixFQXhCN0Q7OztBQTJCVCxNQUFFLElBQUksRUFBSixFQUFRLEdBQUcsR0FBSCxFQUFRLEdBQUcsS0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixLQUFoQixDQUFzQixNQUF0QixHQUErQixHQUEvQixFQUFvQyxPQUFPLEdBQVAsRUFBWSxRQUFRLEVBQVIsRUEzQjVELEVBNEJULEVBQUUsSUFBSSxFQUFKLEVBQVEsR0FBRyxHQUFILEVBQVEsR0FBRyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEtBQWhCLENBQXNCLE1BQXRCLEdBQStCLEdBQS9CLEVBQW9DLE9BQU8sRUFBUCxFQUFXLFFBQVEsRUFBUixFQTVCM0QsQ0FBVCxDQUQwQjs7QUFpQzlCLFdBQU8sT0FBUCxDQUFlLFVBQUMsS0FBRCxFQUFXO0FBQ3RCLFlBQUksV0FBVyxNQUFLLEtBQUwsQ0FBVyxTQUFYLENBQXFCLE1BQXJCLENBQTRCLE1BQU0sQ0FBTixFQUFTLE1BQU0sQ0FBTixFQUFTLFFBQTlDLENBQVg7O0FBRGtCLGdCQUd0QixDQUFTLE1BQVQsR0FBa0IsTUFBTSxNQUFOLENBSEk7QUFJdEIsaUJBQVMsS0FBVCxHQUFpQixNQUFNLEtBQU47OztBQUpLLGdCQU90QixDQUFTLEtBQVQsR0FBaUIsR0FBakIsQ0FQc0I7QUFRdEIsWUFBSSxRQUFRLEVBQUUsTUFBTSxZQUFOLEVBQW9CLE1BQU0sU0FBTixFQUFpQixPQUFPLFFBQVAsRUFBaUIsaUJBQWlCLFNBQWpCLEVBQWhFLENBUmtCO0FBU3RCLFlBQUksT0FBTyxNQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEdBQWhCLENBQW9CLElBQXBCLENBQXlCLE1BQU0sQ0FBTixFQUFTLE1BQU0sQ0FBTixFQUFTLE1BQU0sRUFBTixFQUFVLEtBQXJELENBQVAsQ0FUa0I7QUFVdEIsYUFBSyxLQUFMLEdBQWEsR0FBYixDQVZzQjtLQUFYLENBQWYsQ0FqQzhCO0NBQVg7O0FBK0N2QixRQUFRLGVBQVIsR0FBMEIsWUFBVztBQUNqQyxTQUFLLEtBQUwsQ0FBVyxHQUFYLENBQWUsVUFBZixDQUEwQixDQUExQixFQUE2QixLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEtBQWhCLENBQXNCLE1BQXRCLEdBQStCLElBQS9CLEVBQXFDLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsS0FBaEIsQ0FBc0IsS0FBdEIsRUFBNkIsSUFBL0YsRUFBcUcsV0FBckcsRUFEaUM7Q0FBWDs7QUFJMUIsUUFBUSxlQUFSLEdBQTBCLFlBQVc7QUFDakMsU0FBSyxLQUFMLENBQVcsU0FBWCxHQUF1QixLQUFLLEtBQUwsQ0FBVyxHQUFYLENBQWUsS0FBZixFQUF2QixDQURpQztBQUVqQyxTQUFLLEtBQUwsQ0FBVyxTQUFYLENBQXFCLFVBQXJCLEdBQWtDLElBQWxDLENBRmlDO0NBQVg7O0FBSzFCLE9BQU8sT0FBUCxHQUFpQixPQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCdcblxubGV0IEZvcmVzdEN0ZiA9IHJlcXVpcmUoJy4vbWFwcy9Gb3Jlc3RDdGYnKVxubGV0IFJlbW90ZVBsYXllciA9IHJlcXVpcmUoJy4vbGliL1JlbW90ZVBsYXllcicpXG5sZXQgR3VpZCA9IHJlcXVpcmUoJy4vbGliL0d1aWQnKVxubGV0IFdlYXBvbnMgPSByZXF1aXJlKCcuL2xpYi9XZWFwb25zJylcbmxldCBJbnB1dEhhbmRsZXIgPSByZXF1aXJlKCcuL2xpYi9JbnB1dEhhbmRsZXInKVxuXG5sZXQgZ2FtZVdpZHRoID0gd2luZG93LmlubmVyV2lkdGhcbmxldCBnYW1lSGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0XG5sZXQgd29ybGRXaWR0aCA9IDQwMDBcbmxldCB3b3JsZEhlaWdodCA9IDE1MDBcblxubGV0IGdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoZ2FtZVdpZHRoLCBnYW1lSGVpZ2h0LCBQaGFzZXIuQ0FOVkFTLCAncmFuZ2VyLXN0ZXZlLWdhbWUnKTtcblxubGV0IFJhbmdlclN0ZXZlR2FtZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY2xpZW50SWQgPSBHdWlkKClcbiAgICB0aGlzLmN1cnJlbnRXZWFwb24gPSAwO1xuICAgIHRoaXMuZW5lbWllcyA9IFtdXG4gICAgdGhpcy5nYW1lID0gZ2FtZVxuICAgIHRoaXMuZ3JvdW5kXG4gICAgdGhpcy5wbGF0Zm9ybXNcbiAgICB0aGlzLnBsYXllclxuICAgIHRoaXMuc2NvcmUgPSAwXG4gICAgdGhpcy5zY29yZVRleHRcbiAgICB0aGlzLnNvY2tldFxuICAgIHRoaXMud2VhcG9uTmFtZSA9IG51bGw7XG4gICAgdGhpcy53ZWFwb25zID0gW107XG59XG5cblJhbmdlclN0ZXZlR2FtZS5wcm90b3R5cGUgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZ2FtZS5yZW5kZXJlci5yZW5kZXJTZXNzaW9uLnJvdW5kUGl4ZWxzID0gdHJ1ZVxuICAgICAgICB0aGlzLmdhbWUuc3RhZ2UuZGlzYWJsZVZpc2liaWxpdHlDaGFuZ2UgPSB0cnVlXG4gICAgICAgIHRoaXMucGh5c2ljcy5zdGFydFN5c3RlbShQaGFzZXIuUGh5c2ljcy5BUkNBREUpXG4gICAgfSxcblxuICAgIHByZWxvYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmxvYWQuaW1hZ2UoJ2J1bGxldDExJywgJy9pbWFnZXMvYnVsbGV0MTEucG5nJylcbiAgICAgICAgdGhpcy5sb2FkLmltYWdlKCdidWxsZXQxMCcsICcvaW1hZ2VzL2J1bGxldDEwLnBuZycpXG4gICAgICAgIHRoaXMubG9hZC5pbWFnZSgnYnVsbGV0OScsICcvaW1hZ2VzL2J1bGxldDkucG5nJylcbiAgICAgICAgdGhpcy5sb2FkLmltYWdlKCdidWxsZXQ4JywgJy9pbWFnZXMvYnVsbGV0OC5wbmcnKVxuICAgICAgICB0aGlzLmxvYWQuaW1hZ2UoJ2J1bGxldDcnLCAnL2ltYWdlcy9idWxsZXQ3LnBuZycpXG4gICAgICAgIHRoaXMubG9hZC5pbWFnZSgnYnVsbGV0NScsICcvaW1hZ2VzL2J1bGxldDUucG5nJylcbiAgICAgICAgdGhpcy5sb2FkLmltYWdlKCdidWxsZXQ0JywgJy9pbWFnZXMvYnVsbGV0NC5wbmcnKVxuICAgICAgICB0aGlzLmxvYWQuaW1hZ2UoJ3RyZWVzY2FwZScsICcvaW1hZ2VzL21hcC1jdGYxLnBuZycpXG4gICAgICAgIHRoaXMubG9hZC5pbWFnZSgnZ3JvdW5kJywgJy9pbWFnZXMvcGxhdGZvcm0ucG5nJylcbiAgICAgICAgdGhpcy5sb2FkLnNwcml0ZXNoZWV0KCdkdWRlJywgJy9pbWFnZXMvZHVkZS5wbmcnLCAzMiwgNDgpXG4gICAgICAgIHRoaXMubG9hZC5zcHJpdGVzaGVldCgnZW5lbXknLCAnL2ltYWdlcy9kdWRlLnBuZycsIDMyLCA0OClcbiAgICB9LFxuXG4gICAgY3JlYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zb2NrZXQgPSBpby5jb25uZWN0KClcbiAgICAgICAgdGhpcy5lbmVtaWVzID0gW11cblxuICAgICAgICAvLyAgV2UncmUgZ29pbmcgdG8gYmUgdXNpbmcgcGh5c2ljcywgc28gZW5hYmxlIHRoZSBBcmNhZGUgUGh5c2ljcyBzeXN0ZW1cbiAgICAgICAgdGhpcy5waHlzaWNzLnN0YXJ0U3lzdGVtKFBoYXNlci5QaHlzaWNzLkFSQ0FERSlcblxuICAgICAgICB0aGlzLndvcmxkLnNldEJvdW5kcygwLCAwLCB3b3JsZFdpZHRoLCB3b3JsZEhlaWdodClcbiAgICAgICAgdGhpcy5nYW1lLnN0YWdlLmJhY2tncm91bmRDb2xvciA9IFwiIzJGOTFEMFwiXG5cbiAgICAgICAgLy8gU2NhbGUgZ2FtZSBvbiB3aW5kb3cgcmVzaXplXG4gICAgICAgIHRoaXMuZ2FtZS5zY2FsZS5zY2FsZU1vZGUgPSBQaGFzZXIuU2NhbGVNYW5hZ2VyLlJFU0laRTtcbiAgICAgICAgdGhpcy5nYW1lLnNjYWxlLnNldFNob3dBbGwoKTtcbiAgICAgICAgdGhpcy5nYW1lLnNjYWxlLnJlZnJlc2goKVxuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIE1hcFxuICAgICAgICAgKi9cbiAgICAgICAgRm9yZXN0Q3RmLmNyZWF0ZSh0aGlzKVxuXG4gICAgICAgIC8vIERlZmluZSBtb3ZlbWVudCBjb25zdGFudHNcbiAgICAgICAgdGhpcy5NQVhfU1BFRUQgPSA0MDA7IC8vIHBpeGVscy9zZWNvbmRcbiAgICAgICAgdGhpcy5BQ0NFTEVSQVRJT04gPSAxOTYwOyAvLyBwaXhlbHMvc2Vjb25kL3NlY29uZFxuICAgICAgICB0aGlzLkRSQUcgPSAxNTAwOyAvLyBwaXhlbHMvc2Vjb25kXG4gICAgICAgIHRoaXMuR1JBVklUWSA9IDE5MDA7IC8vIHBpeGVscy9zZWNvbmQvc2Vjb25kXG4gICAgICAgIHRoaXMuSlVNUF9TUEVFRCA9IC04NTA7IC8vIHBpeGVscy9zZWNvbmQgKG5lZ2F0aXZlIHkgaXMgdXApXG5cblxuICAgICAgICAvKipcbiAgICAgICAgICogUGxheWVyIFNldHRpbmdzXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnBsYXllciA9IHRoaXMuYWRkLnNwcml0ZSgyMDAsIHRoaXMud29ybGQuaGVpZ2h0IC0gNDAwLCAnZHVkZScpO1xuXG4gICAgICAgIC8vICBXZSBuZWVkIHRvIGVuYWJsZSBwaHlzaWNzIG9uIHRoZSBwbGF5ZXJcbiAgICAgICAgdGhpcy5waHlzaWNzLmFyY2FkZS5lbmFibGUodGhpcy5wbGF5ZXIpO1xuXG4gICAgICAgIC8vIEVuYWJsZSBwaHlzaWNzIG9uIHRoZSBwbGF5ZXJcbiAgICAgICAgdGhpcy5nYW1lLnBoeXNpY3MuZW5hYmxlKHRoaXMucGxheWVyLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuXG4gICAgICAgIC8vIE1ha2UgcGxheWVyIGNvbGxpZGUgd2l0aCB3b3JsZCBib3VuZGFyaWVzIHNvIGhlIGRvZXNuJ3QgbGVhdmUgdGhlIHN0YWdlXG4gICAgICAgIHRoaXMucGxheWVyLmJvZHkuY29sbGlkZVdvcmxkQm91bmRzID0gdHJ1ZTtcblxuICAgICAgICAvLyBTZXQgcGxheWVyIG1pbmltdW0gYW5kIG1heGltdW0gbW92ZW1lbnQgc3BlZWRcbiAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5tYXhWZWxvY2l0eS5zZXRUbyh0aGlzLk1BWF9TUEVFRCwgdGhpcy5NQVhfU1BFRUQgKiAxMCk7IC8vIHgsIHlcblxuICAgICAgICAvLyBBZGQgZHJhZyB0byB0aGUgcGxheWVyIHRoYXQgc2xvd3MgdGhlbSBkb3duIHdoZW4gdGhleSBhcmUgbm90IGFjY2VsZXJhdGluZ1xuICAgICAgICB0aGlzLnBsYXllci5ib2R5LmRyYWcuc2V0VG8odGhpcy5EUkFHLCAwKTsgLy8geCwgeVxuXG4gICAgICAgIC8vIFNpbmNlIHdlJ3JlIGp1bXBpbmcgd2UgbmVlZCBncmF2aXR5XG4gICAgICAgIGdhbWUucGh5c2ljcy5hcmNhZGUuZ3Jhdml0eS55ID0gdGhpcy5HUkFWSVRZO1xuXG4gICAgICAgIC8vIEZsYWcgdG8gdHJhY2sgaWYgdGhlIGp1bXAgYnV0dG9uIGlzIHByZXNzZWRcbiAgICAgICAgdGhpcy5qdW1waW5nID0gZmFsc2U7XG5cbiAgICAgICAgLy8gIE91ciB0d28gYW5pbWF0aW9ucywgd2Fsa2luZyBsZWZ0IGFuZCByaWdodC5cbiAgICAgICAgdGhpcy5wbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ2xlZnQnLCBbMCwgMSwgMiwgM10sIDEwLCB0cnVlKVxuICAgICAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLmFkZCgncmlnaHQnLCBbNSwgNiwgNywgOF0sIDEwLCB0cnVlKVxuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdlYXBvbnNcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY3VycmVudFdlYXBvbiA9IDA7XG4gICAgICAgIHRoaXMud2VhcG9ucy5wdXNoKG5ldyBXZWFwb25zLkFLNDcodGhpcy5nYW1lKSk7XG4gICAgICAgIHRoaXMud2VhcG9ucy5wdXNoKG5ldyBXZWFwb25zLkJhcnJldE04MkExKHRoaXMuZ2FtZSkpO1xuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRleHRcbiAgICAgICAgICovXG4gICAgICAgIGxldCB0ZXh0U3R5bGVzID0geyBmb250U2l6ZTogJzI0cHgnLCBmaWxsOiAnIzAwMCcgfVxuICAgICAgICB0aGlzLnNjb3JlVGV4dCA9IHRoaXMuYWRkLnRleHQoMjUsIDI1LCAnU2NvcmU6IDAnLCB0ZXh0U3R5bGVzKVxuICAgICAgICB0aGlzLnNjb3JlVGV4dC5maXhlZFRvQ2FtZXJhID0gdHJ1ZVxuICAgICAgICB0aGlzLndlYXBvbk5hbWUgPSB0aGlzLmFkZC50ZXh0KHRoaXMuY2FtZXJhLndpZHRoIC0gMTAwLCB0aGlzLmNhbWVyYS5oZWlnaHQgLSA0NSwgJ0FLLTQ3JywgdGV4dFN0eWxlcylcbiAgICAgICAgdGhpcy53ZWFwb25OYW1lLmZpeGVkVG9DYW1lcmEgPSB0cnVlXG4gICAgICAgIHRoaXMuY3VycmVudEhlYWx0aFRleHQgPSB0aGlzLmFkZC50ZXh0KHRoaXMuY2FtZXJhLnggKyAyNSwgdGhpcy5jYW1lcmEuaGVpZ2h0IC0gNDUsICcxMDAnLCB0ZXh0U3R5bGVzKVxuICAgICAgICB0aGlzLmN1cnJlbnRIZWFsdGhUZXh0LmZpeGVkVG9DYW1lcmEgPSB0cnVlXG5cblxuICAgICAgICAvKipcbiAgICAgICAgICogQ2FtZXJhIFNldHRpbmdzXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNhbWVyYS5mb2xsb3codGhpcy5wbGF5ZXIpO1xuXG4gICAgICAgIGxldCBjaGFuZ2VLZXkgPSB0aGlzLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuRU5URVIpO1xuICAgICAgICBjaGFuZ2VLZXkub25Eb3duLmFkZCh0aGlzLm5leHRXZWFwb24sIHRoaXMpXG5cblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVzaXppbmcgRXZlbnRzXG4gICAgICAgICAqL1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5nYW1lLnNjYWxlLnJlZnJlc2goKVxuICAgICAgICAgICAgdGhpcy5nYW1lLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodFxuICAgICAgICAgICAgdGhpcy5nYW1lLndpZHRoID0gd2luZG93LmlubmVyV2lkdGhcblxuICAgICAgICAgICAgdGhpcy53ZWFwb25OYW1lLmNhbWVyYU9mZnNldC54ID0gdGhpcy5jYW1lcmEud2lkdGggLSAxMDBcbiAgICAgICAgICAgIHRoaXMud2VhcG9uTmFtZS5jYW1lcmFPZmZzZXQueSA9IHRoaXMuY2FtZXJhLmhlaWdodCAtIDQ1XG5cbiAgICAgICAgICAgIHRoaXMuc2NvcmVUZXh0LmNhbWVyYU9mZnNldC54ID0gMjVcbiAgICAgICAgICAgIHRoaXMuc2NvcmVUZXh0LmNhbWVyYU9mZnNldC55ID0gMjVcbiAgICAgICAgfSlcblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTdGFydCBsaXN0ZW5pbmcgZm9yIGV2ZW50c1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zZXRFdmVudEhhbmRsZXJzKClcbiAgICB9LFxuXG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gIENvbGxpZGUgdGhlIHBsYXllciBhbmQgdGhlIHN0YXJzIHdpdGggdGhlIHBsYXRmb3Jtc1xuICAgICAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5wbGF5ZXIsIHRoaXMucGxhdGZvcm1zKVxuICAgICAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5wbGF0Zm9ybXMsIHRoaXMud2VhcG9ucywgZnVuY3Rpb24ocGxhdGZvcm0sIHdlYXBvbikge1xuICAgICAgICAgICAgd2VhcG9uLmtpbGwoKVxuICAgICAgICB9LCBudWxsLCB0aGlzKTtcblxuICAgICAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5lbmVteSwgdGhpcy53ZWFwb25zLCBmdW5jdGlvbihlbmVteSwgd2VhcG9uKSB7XG4gICAgICAgICAgICBlbmVteS5oZWFsdGggLT0gd2VhcG9uLmRhbWFnZVxuICAgICAgICAgICAgd2VhcG9uLmtpbGwoKVxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1lvdSBoaXQgdGhlbSEnLCBlbmVteS5oZWFsdGgsIHdlYXBvbi5kYW1hZ2UpXG4gICAgICAgICAgICBpZiAoZW5lbXkuaGVhbHRoIDw9IDApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnVGhleSBhcmUgZGVhZCEnKVxuICAgICAgICAgICAgICAgIHRoaXMuZW5lbXkueCA9IDIwMFxuICAgICAgICAgICAgICAgIHRoaXMuZW5lbXkueSA9IDIwMFxuICAgICAgICAgICAgICAgIHRoaXMuZW5lbXkuaGVhbHRoID0gMTAwXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIG51bGwsIHRoaXMpO1xuXG4gICAgICAgIGlmICh0aGlzLmxlZnRJbnB1dElzQWN0aXZlKCkpIHtcbiAgICAgICAgICAgIC8vIElmIHRoZSBMRUZUIGtleSBpcyBkb3duLCBzZXQgdGhlIHBsYXllciB2ZWxvY2l0eSB0byBtb3ZlIGxlZnRcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmJvZHkuYWNjZWxlcmF0aW9uLnggPSAtdGhpcy5BQ0NFTEVSQVRJT047XG4gICAgICAgICAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLnBsYXkoJ2xlZnQnKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucmlnaHRJbnB1dElzQWN0aXZlKCkpIHtcbiAgICAgICAgICAgIC8vIElmIHRoZSBSSUdIVCBrZXkgaXMgZG93biwgc2V0IHRoZSBwbGF5ZXIgdmVsb2NpdHkgdG8gbW92ZSByaWdodFxuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5hY2NlbGVyYXRpb24ueCA9IHRoaXMuQUNDRUxFUkFUSU9OO1xuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdyaWdodCcpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBTdGFuZCBzdGlsbFxuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5hY2NlbGVyYXRpb24ueCA9IDBcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmFuaW1hdGlvbnMuc3RvcCgpXG4gICAgICAgICAgICB0aGlzLnBsYXllci5mcmFtZSA9IDRcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNldCBhIHZhcmlhYmxlIHRoYXQgaXMgdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgaXMgdG91Y2hpbmcgdGhlIGdyb3VuZFxuICAgICAgICBsZXQgb25UaGVHcm91bmQgPSB0aGlzLnBsYXllci5ib2R5LnRvdWNoaW5nLmRvd247XG5cbiAgICAgICAgLy8gSWYgdGhlIHBsYXllciBpcyB0b3VjaGluZyB0aGUgZ3JvdW5kLCBsZXQgaGltIGhhdmUgMiBqdW1wc1xuICAgICAgICBpZiAob25UaGVHcm91bmQpIHtcbiAgICAgICAgICAgIHRoaXMuanVtcHMgPSAyO1xuICAgICAgICAgICAgdGhpcy5qdW1waW5nID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBKdW1wIVxuICAgICAgICBpZiAodGhpcy5qdW1wcyA+IDAgJiYgdGhpcy51cElucHV0SXNBY3RpdmUoNSkpIHtcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmJvZHkudmVsb2NpdHkueSA9IHRoaXMuSlVNUF9TUEVFRDtcbiAgICAgICAgICAgIHRoaXMuanVtcGluZyA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZWR1Y2UgdGhlIG51bWJlciBvZiBhdmFpbGFibGUganVtcHMgaWYgdGhlIGp1bXAgaW5wdXQgaXMgcmVsZWFzZWRcbiAgICAgICAgaWYgKHRoaXMuanVtcGluZyAmJiB0aGlzLnVwSW5wdXRSZWxlYXNlZCgpKSB7XG4gICAgICAgICAgICB0aGlzLmp1bXBzLS07XG4gICAgICAgICAgICB0aGlzLmp1bXBpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmdhbWUuaW5wdXQuYWN0aXZlUG9pbnRlci5pc0Rvd24pXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLmZpcmUodGhpcy5wbGF5ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnbW92ZSBwbGF5ZXInLCB7IHg6IHRoaXMucGxheWVyLngsIHk6IHRoaXMucGxheWVyLnkgfSlcbiAgICB9LFxuXG4gICAgbGVmdElucHV0SXNBY3RpdmU6IElucHV0SGFuZGxlci5sZWZ0SW5wdXRJc0FjdGl2ZSxcbiAgICByaWdodElucHV0SXNBY3RpdmU6IElucHV0SGFuZGxlci5yaWdodElucHV0SXNBY3RpdmUsXG4gICAgdXBJbnB1dElzQWN0aXZlOiBJbnB1dEhhbmRsZXIudXBJbnB1dElzQWN0aXZlLFxuICAgIHVwSW5wdXRSZWxlYXNlZDogSW5wdXRIYW5kbGVyLnVwSW5wdXRSZWxlYXNlZCxcblxuICAgIG5leHRXZWFwb246IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyAgVGlkeS11cCB0aGUgY3VycmVudCB3ZWFwb25cbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFdlYXBvbiA+IDkpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLnJlc2V0KCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS5jYWxsQWxsKCdyZXNldCcsIG51bGwsIDAsIDApO1xuICAgICAgICAgICAgdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0uc2V0QWxsKCdleGlzdHMnLCBmYWxzZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyAgQWN0aXZhdGUgdGhlIG5ldyBvbmVcbiAgICAgICAgdGhpcy5jdXJyZW50V2VhcG9uKys7XG5cbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFdlYXBvbiA9PT0gdGhpcy53ZWFwb25zLmxlbmd0aClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50V2VhcG9uID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLnZpc2libGUgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMud2VhcG9uTmFtZS50ZXh0ID0gdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0ubmFtZTtcbiAgICB9LFxuXG4gICAgc2V0RXZlbnRIYW5kbGVyczogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBTb2NrZXQgY29ubmVjdGlvbiBzdWNjZXNzZnVsXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdjb25uZWN0JywgdGhpcy5vblNvY2tldENvbm5lY3RlZC5iaW5kKHRoaXMpKVxuXG4gICAgICAgIC8vIFNvY2tldCBkaXNjb25uZWN0aW9uXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdkaXNjb25uZWN0JywgdGhpcy5vblNvY2tldERpc2Nvbm5lY3QuYmluZCh0aGlzKSlcblxuICAgICAgICAvLyBQbGF5ZXIgbW92ZSBtZXNzYWdlIHJlY2VpdmVkXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdtb3ZlIHBsYXllcicsIHRoaXMub25Nb3ZlUGxheWVyLmJpbmQodGhpcykpXG5cbiAgICAgICAgLy8gUGxheWVyIHJlbW92ZWQgbWVzc2FnZSByZWNlaXZlZFxuICAgICAgICB0aGlzLnNvY2tldC5vbigncmVtb3ZlIHBsYXllcicsIHRoaXMub25SZW1vdmVQbGF5ZXIuYmluZCh0aGlzKSlcblxuICAgICAgICAvLyBVcGRhdGVkIGxpc3Qgb2YgcGxheWVycyB0byBzeW5jIGVuZW1pZXMgdG9cbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ3VwZGF0ZSBwbGF5ZXJzJywgdGhpcy5vblVwZGF0ZVBsYXllcnMuYmluZCh0aGlzKSlcbiAgICB9LFxuXG4gICAgb25VcGRhdGVQbGF5ZXJzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHRoaXMuZW5lbWllcy5mb3JFYWNoKGZ1bmN0aW9uIChlbmVteSkge1xuICAgICAgICAgICAgZW5lbXkucGxheWVyLmtpbGwoKVxuICAgICAgICB9KVxuXG4gICAgICAgIHRoaXMuZW5lbWllcyA9IFtdXG5cbiAgICAgICAgZGF0YS5wbGF5ZXJzLmZvckVhY2goKHBsYXllcikgPT4ge1xuICAgICAgICAgICAgaWYgKHBsYXllci5pZCA9PT0gKCcvIycgKyB0aGlzLnNvY2tldC5pZCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgICAgIGxldCBuZXdSZW1vdGVQbGF5ZXIgPSBSZW1vdGVQbGF5ZXIocGxheWVyLmlkLCB0aGlzLmdhbWUsIHRoaXMucGxheWVyLCBwbGF5ZXIueCwgcGxheWVyLnkpXG4gICAgICAgICAgICB0aGlzLmVuZW1pZXMucHVzaChuZXdSZW1vdGVQbGF5ZXIpXG4gICAgICAgICAgICB0aGlzLmVuZW1pZXNbdGhpcy5lbmVtaWVzLmxlbmd0aCAtIDFdLnBsYXllci5hbmltYXRpb25zLmFkZCgnbGVmdCcsIFswLCAxLCAyLCAzXSwgMTAsIHRydWUpXG4gICAgICAgICAgICB0aGlzLmVuZW1pZXNbdGhpcy5lbmVtaWVzLmxlbmd0aCAtIDFdLnBsYXllci5hbmltYXRpb25zLmFkZCgncmlnaHQnLCBbNSwgNiwgNywgOF0sIDEwLCB0cnVlKVxuICAgICAgICB9KVxuICAgIH0sXG5cbiAgICAvLyBTb2NrZXQgY29ubmVjdGVkXG4gICAgb25Tb2NrZXRDb25uZWN0ZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zb2xlLmxvZygnQ29ubmVjdGVkIHRvIHNvY2tldCBzZXJ2ZXInKVxuXG4gICAgICAgICAvLyBSZXNldCBlbmVtaWVzIG9uIHJlY29ubmVjdFxuICAgICAgICB0aGlzLmVuZW1pZXMuZm9yRWFjaChmdW5jdGlvbiAoZW5lbXkpIHtcbiAgICAgICAgICAgIGVuZW15LmtpbGwoKVxuICAgICAgICB9KVxuICAgICAgICB0aGlzLmVuZW1pZXMgPSBbXVxuXG4gICAgICAgIC8vIFNlbmQgbG9jYWwgcGxheWVyIGRhdGEgdG8gdGhlIGdhbWUgc2VydmVyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ25ldyBwbGF5ZXInLCB7XG4gICAgICAgICAgICBjbGllbnRJZDogdGhpcy5jbGllbnRJZCxcbiAgICAgICAgICAgIHg6IHRoaXMucGxheWVyLngsXG4gICAgICAgICAgICB5OiB0aGlzLnBsYXllci55XG4gICAgICAgIH0pXG4gICAgfSxcblxuICAgIC8vIFNvY2tldCBkaXNjb25uZWN0ZWRcbiAgICBvblNvY2tldERpc2Nvbm5lY3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zb2xlLmxvZygnRGlzY29ubmVjdGVkIGZyb20gc29ja2V0IHNlcnZlcicpXG4gICAgfSxcblxuICAgIC8vIE1vdmUgcGxheWVyXG4gICAgb25Nb3ZlUGxheWVyOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGxldCBtb3ZlUGxheWVyID0gdGhpcy5wbGF5ZXJCeUlkKGRhdGEuaWQpXG5cbiAgICAgICAgLy8gY29uc29sZS5sb2coZGF0YS5pZCwgbW92ZVBsYXllcilcblxuICAgICAgICAvLyBQbGF5ZXIgbm90IGZvdW5kXG4gICAgICAgIGlmICghIG1vdmVQbGF5ZXIpIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgLy8gVXBkYXRlIHBsYXllciBwb3NpdGlvblxuICAgICAgICBtb3ZlUGxheWVyLnBsYXllci54ID0gZGF0YS54XG4gICAgICAgIG1vdmVQbGF5ZXIucGxheWVyLnkgPSBkYXRhLnlcblxuICAgICAgICBpZiAobW92ZVBsYXllci5wbGF5ZXIueCA+IG1vdmVQbGF5ZXIubGFzdFBvc2l0aW9uLngpIHtcbiAgICAgICAgICAgIG1vdmVQbGF5ZXIucGxheWVyLmFuaW1hdGlvbnMucGxheSgncmlnaHQnKVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG1vdmVQbGF5ZXIucGxheWVyLnggPCBtb3ZlUGxheWVyLmxhc3RQb3NpdGlvbi54KVxuICAgICAgICB7XG4gICAgICAgICAgICBtb3ZlUGxheWVyLnBsYXllci5hbmltYXRpb25zLnBsYXkoJ2xlZnQnKVxuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAge1xuICAgICAgICAgICAgbW92ZVBsYXllci5wbGF5ZXIuYW5pbWF0aW9ucy5zdG9wKClcbiAgICAgICAgICAgIG1vdmVQbGF5ZXIucGxheWVyLmZyYW1lID0gNDtcbiAgICAgICAgfVxuXG4gICAgICAgIG1vdmVQbGF5ZXIubGFzdFBvc2l0aW9uLnggPSBtb3ZlUGxheWVyLnBsYXllci54XG4gICAgICAgIG1vdmVQbGF5ZXIubGFzdFBvc2l0aW9uLnkgPSBtb3ZlUGxheWVyLnBsYXllci55XG4gICAgfSxcblxuICAgIC8vIFJlbW92ZSBwbGF5ZXJcbiAgICBvblJlbW92ZVBsYXllcjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBsZXQgcmVtb3ZlUGxheWVyID0gdGhpcy5wbGF5ZXJCeUlkKGRhdGEuaWQpXG5cbiAgICAgICAgLy8gUGxheWVyIG5vdCBmb3VuZFxuICAgICAgICBpZiAoIXJlbW92ZVBsYXllcikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1BsYXllciBub3QgZm91bmQ6ICcsIGRhdGEuaWQpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIHJlbW92ZVBsYXllci5wbGF5ZXIua2lsbCgpXG5cbiAgICAgICAgLy8gUmVtb3ZlIHBsYXllciBmcm9tIGFycmF5XG4gICAgICAgIHRoaXMuZW5lbWllcy5zcGxpY2UodGhpcy5lbmVtaWVzLmluZGV4T2YocmVtb3ZlUGxheWVyKSwgMSlcbiAgICB9LFxuXG4gICAgLy8gRmluZCBwbGF5ZXIgYnkgSURcbiAgICBwbGF5ZXJCeUlkOiBmdW5jdGlvbihpZCkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZW5lbWllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHRoaXMuZW5lbWllc1tpXS5wbGF5ZXIuaWQgPT09IGlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZW5lbWllc1tpXVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxufVxuXG5nYW1lLnN0YXRlLmFkZCgnR2FtZScsIFJhbmdlclN0ZXZlR2FtZSwgdHJ1ZSk7XG4iLCIndXNlIHN0cmljdCdcblxudmFyIEJ1bGxldCA9IGZ1bmN0aW9uIChnYW1lLCBrZXkpIHtcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgMCwgMCwga2V5KTtcblxuICAgIHRoaXMudGV4dHVyZS5iYXNlVGV4dHVyZS5zY2FsZU1vZGUgPSBQSVhJLnNjYWxlTW9kZXMuTkVBUkVTVDtcblxuICAgIHRoaXMuYW5jaG9yLnNldCgwLjUpO1xuXG4gICAgdGhpcy5jaGVja1dvcmxkQm91bmRzID0gdHJ1ZTtcbiAgICB0aGlzLm91dE9mQm91bmRzS2lsbCA9IHRydWU7XG4gICAgdGhpcy5leGlzdHMgPSBmYWxzZTtcblxuICAgIHRoaXMudHJhY2tpbmcgPSBmYWxzZTtcbiAgICB0aGlzLnNjYWxlU3BlZWQgPSAwO1xuXG59O1xuXG5CdWxsZXQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSk7XG5CdWxsZXQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQnVsbGV0O1xuXG5CdWxsZXQucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbiAoeCwgeSwgYW5nbGUsIHNwZWVkLCBneCwgZ3kpIHtcbiAgICBneCA9IGd4IHx8IDBcbiAgICBneSA9IGd5IHx8IDBcbiAgICB0aGlzLnJlc2V0KHgsIHkpXG4gICAgLy8gdGhpcy5zY2FsZS5zZXQoMSk7XG5cbiAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUubW92ZVRvUG9pbnRlcih0aGlzLCBzcGVlZClcbiAgICB0aGlzLmJvZHkuZ3Jhdml0eS55ID0gLTE4MDBcbn1cblxuQnVsbGV0LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMudHJhY2tpbmcpXG4gICAge1xuICAgICAgICB0aGlzLnJvdGF0aW9uID0gTWF0aC5hdGFuMih0aGlzLmJvZHkudmVsb2NpdHkueSwgdGhpcy5ib2R5LnZlbG9jaXR5LngpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnNjYWxlU3BlZWQgPiAwKVxuICAgIHtcbiAgICAgICAgdGhpcy5zY2FsZS54ICs9IHRoaXMuc2NhbGVTcGVlZDtcbiAgICAgICAgdGhpcy5zY2FsZS55ICs9IHRoaXMuc2NhbGVTcGVlZDtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQnVsbGV0XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBndWlkR2VuZXJhdG9yKCkge1xuICAgIHZhciBTNCA9IGZ1bmN0aW9uKCkge1xuICAgICAgIHJldHVybiAoKCgxK01hdGgucmFuZG9tKCkpKjB4MTAwMDApfDApLnRvU3RyaW5nKDE2KS5zdWJzdHJpbmcoMSlcbiAgICB9XG5cbiAgICByZXR1cm4gKFM0KCkrUzQoKStcIi1cIitTNCgpK1wiLVwiK1M0KCkrXCItXCIrUzQoKStcIi1cIitTNCgpK1M0KCkrUzQoKSlcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvLyBUaGlzIGZ1bmN0aW9uIHNob3VsZCByZXR1cm4gdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgYWN0aXZhdGVzIHRoZSBcImdvIGxlZnRcIiBjb250cm9sXG4gICAgLy8gSW4gdGhpcyBjYXNlLCBlaXRoZXIgaG9sZGluZyB0aGUgcmlnaHQgYXJyb3cgb3IgdGFwcGluZyBvciBjbGlja2luZyBvbiB0aGUgbGVmdFxuICAgIC8vIHNpZGUgb2YgdGhlIHNjcmVlbi5cbiAgICBsZWZ0SW5wdXRJc0FjdGl2ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlucHV0LmtleWJvYXJkLmlzRG93bihQaGFzZXIuS2V5Ym9hcmQuQSlcbiAgICB9LFxuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiBzaG91bGQgcmV0dXJuIHRydWUgd2hlbiB0aGUgcGxheWVyIGFjdGl2YXRlcyB0aGUgXCJnbyByaWdodFwiIGNvbnRyb2xcbiAgICAvLyBJbiB0aGlzIGNhc2UsIGVpdGhlciBob2xkaW5nIHRoZSByaWdodCBhcnJvdyBvciB0YXBwaW5nIG9yIGNsaWNraW5nIG9uIHRoZSByaWdodFxuICAgIC8vIHNpZGUgb2YgdGhlIHNjcmVlbi5cbiAgICByaWdodElucHV0SXNBY3RpdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnB1dC5rZXlib2FyZC5pc0Rvd24oUGhhc2VyLktleWJvYXJkLkQpXG4gICAgfSxcblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gc2hvdWxkIHJldHVybiB0cnVlIHdoZW4gdGhlIHBsYXllciBhY3RpdmF0ZXMgdGhlIFwianVtcFwiIGNvbnRyb2xcbiAgICAvLyBJbiB0aGlzIGNhc2UsIGVpdGhlciBob2xkaW5nIHRoZSB1cCBhcnJvdyBvciB0YXBwaW5nIG9yIGNsaWNraW5nIG9uIHRoZSBjZW50ZXJcbiAgICAvLyBwYXJ0IG9mIHRoZSBzY3JlZW4uXG4gICAgdXBJbnB1dElzQWN0aXZlOiBmdW5jdGlvbihkdXJhdGlvbikge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnB1dC5rZXlib2FyZC5kb3duRHVyYXRpb24oUGhhc2VyLktleWJvYXJkLlcsIGR1cmF0aW9uKVxuICAgIH0sXG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIHJldHVybnMgdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgcmVsZWFzZXMgdGhlIFwianVtcFwiIGNvbnRyb2xcbiAgICB1cElucHV0UmVsZWFzZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnB1dC5rZXlib2FyZC51cER1cmF0aW9uKFBoYXNlci5LZXlib2FyZC5XKVxuICAgIH1cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgUmVtb3RlUGxheWVyID0gZnVuY3Rpb24oaWQsIGdhbWUsIHBsYXllciwgc3RhcnRYLCBzdGFydFkpIHtcbiAgICBsZXQgbmV3UmVtb3RlUGxheWVyID0ge1xuICAgICAgICB4OiBzdGFydFgsXG4gICAgICAgIHk6IHN0YXJ0WSxcbiAgICAgICAgaWQ6IG51bGwsXG4gICAgICAgIGdhbWU6IGdhbWUsXG4gICAgICAgIGhlYWx0aDogMTAwLFxuICAgICAgICBwbGF5ZXI6IHBsYXllcixcbiAgICAgICAgYWxpdmU6IHRydWUsXG4gICAgICAgIGxhc3RQb3NpdGlvbjoge1xuICAgICAgICAgICAgeDogc3RhcnRYLFxuICAgICAgICAgICAgeTogc3RhcnRZXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgdGhlIHBsYXllcidzIGVuZW15IHNwcml0ZVxuICAgIG5ld1JlbW90ZVBsYXllci5wbGF5ZXIgPSBnYW1lLmFkZC5zcHJpdGUoc3RhcnRYLCBzdGFydFksICdlbmVteScpXG5cbiAgICAvLyBPdXIgdHdvIGFuaW1hdGlvbnMsIHdhbGtpbmcgbGVmdCBhbmQgcmlnaHQuXG4gICAgbmV3UmVtb3RlUGxheWVyLnBsYXllci5hbmltYXRpb25zLmFkZCgnbGVmdCcsIFswLCAxLCAyLCAzXSwgMTAsIHRydWUpXG4gICAgbmV3UmVtb3RlUGxheWVyLnBsYXllci5hbmltYXRpb25zLmFkZCgncmlnaHQnLCBbNSwgNiwgNywgOF0sIDEwLCB0cnVlKVxuXG4gICAgbmV3UmVtb3RlUGxheWVyLnBsYXllci5pZCA9IGlkXG5cbiAgICByZXR1cm4gbmV3UmVtb3RlUGxheWVyXG59XG5cbm1vZHVsZS5leHBvcnRzID0gUmVtb3RlUGxheWVyXG4iLCIndXNlIHN0cmljdCdcblxubGV0IEJ1bGxldCA9IHJlcXVpcmUoJy4uL0J1bGxldCcpXG5cbmxldCBBSzQ3ID0gZnVuY3Rpb24gKGdhbWUpIHtcbiAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCBnYW1lLCBnYW1lLndvcmxkLCAnQUstNDcnLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcblxuICAgIHRoaXMuZGFtYWdlID0gMjJcbiAgICB0aGlzLm5leHRGaXJlID0gMDtcbiAgICB0aGlzLmJ1bGxldFNwZWVkID0gMTAwMDtcbiAgICAvLyBBSzQ3IGZpcmVzIGFib3V0IDYwMCBidWxsZXRzIHBlciBzZWNvbmRcbiAgICB0aGlzLmZpcmVSYXRlID0gMTY2LjY2NjY2NztcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNjQ7IGkrKylcbiAgICB7XG4gICAgICAgIGxldCBidWxsZXQgPSBuZXcgQnVsbGV0KHRoaXMuZ2FtZSwgJ2dyb3VuZCcpXG4gICAgICAgIGJ1bGxldC5oZWlnaHQgPSAyXG4gICAgICAgIGJ1bGxldC53aWR0aCA9IDEwXG4gICAgICAgIGJ1bGxldC5kYW1hZ2UgPSAyMlxuICAgICAgICB0aGlzLmFkZChidWxsZXQsIHRydWUpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG59XG5cbkFLNDcucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcbkFLNDcucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQUs0NztcblxuQUs0Ny5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uIChzb3VyY2UpIHtcblxuICAgIGlmICh0aGlzLmdhbWUudGltZS50aW1lIDwgdGhpcy5uZXh0RmlyZSlcbiAgICAgICAgcmV0dXJuXG5cbiAgICB2YXIgeCA9IHNvdXJjZS54ICsgMTU7XG4gICAgdmFyIHkgPSBzb3VyY2UueSArIDMwO1xuXG4gICAgdGhpcy5nZXRGaXJzdEV4aXN0cyhmYWxzZSkuZmlyZSh4LCB5LCAwLCB0aGlzLmJ1bGxldFNwZWVkLCAwLCAwKTtcbiAgICB0aGlzLnNldEFsbCgndHJhY2tpbmcnLCB0cnVlKVxuXG4gICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMuZ2FtZS50aW1lLnRpbWUgKyB0aGlzLmZpcmVSYXRlXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQUs0N1xuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBCdWxsZXQgPSByZXF1aXJlKCcuLi9CdWxsZXQnKVxuXG5sZXQgQmFycmV0TTgyQTEgPSBmdW5jdGlvbiAoZ2FtZSkge1xuICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGdhbWUsIGdhbWUud29ybGQsICdBSy00NycsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuXG4gICAgdGhpcy5uYW1lID0gJ0JhcnJldCBNODJBMSdcbiAgICB0aGlzLmRhbWFnZSA9IDg4XG4gICAgdGhpcy5uZXh0RmlyZSA9IDBcbiAgICB0aGlzLmJ1bGxldFNwZWVkID0gMzQzNVxuXG4gICAgLy8gQmFycmV0TTgyQTEgZmlyZXMgYWJvdXQgNjAwIGJ1bGxldHMgcGVyIHNlY29uZFxuICAgIHRoaXMuZmlyZVJhdGUgPSA0MDAwXG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDY0OyBpKyspXG4gICAge1xuICAgICAgICBsZXQgYnVsbGV0ID0gbmV3IEJ1bGxldCh0aGlzLmdhbWUsICdncm91bmQnKVxuICAgICAgICBidWxsZXQuaGVpZ2h0ID0gMlxuICAgICAgICBidWxsZXQud2lkdGggPSAxMFxuICAgICAgICBidWxsZXQuZGFtYWdlID0gODhcblxuICAgICAgICB0aGlzLmFkZChidWxsZXQsIHRydWUpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbn1cblxuQmFycmV0TTgyQTEucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcbkJhcnJldE04MkExLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEJhcnJldE04MkExO1xuXG5CYXJyZXRNODJBMS5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uIChzb3VyY2UpIHtcbiAgICBpZiAodGhpcy5nYW1lLnRpbWUudGltZSA8IHRoaXMubmV4dEZpcmUpXG4gICAgICAgIHJldHVyblxuXG4gICAgdmFyIHggPSBzb3VyY2UueCArIDE1O1xuICAgIHZhciB5ID0gc291cmNlLnkgKyAzMDtcblxuICAgIHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgMClcbiAgICB0aGlzLnNldEFsbCgndHJhY2tpbmcnLCB0cnVlKVxuXG4gICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMuZ2FtZS50aW1lLnRpbWUgKyB0aGlzLmZpcmVSYXRlXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQmFycmV0TTgyQTFcbiIsIid1c2Ugc3RyaWN0J1xuXG4vKipcbiAqIFByaW1hcnkgV2VhcG9uc1xuICogMS4gRGVzZXJ0IEVhZ2xlc1xuICogMi4gSEsgTVA1XG4gKiAzLiBBSzQ3XG4gKiA0LiBNMTZcbiAqIDUuIFNwYXMtMTJcbiAqIDYuIFJ1Z2VyIDc3XG4gKiA3LiBNNzlcbiAqIDguIEJhcnJldCBNODJBMVxuICogOS4gRk4gTWluaW1pXG4gKiAxMC4gWE0yMTQgTWluaWd1blxuICovXG5cbi8qKlxuICogU2Vjb25kYXJ5IFdlYXBvbnNcbiAqIDEuIFVTU09DT01cbiAqIDIuIENvbWJhdCBLbmlmZVxuICogMy4gQ2hhaW5zYXdcbiAqIDQuIE03MiBMYXdcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBcIkFLNDdcIjogcmVxdWlyZSgnLi9BSzQ3JyksXG4gICAgXCJCYXJyZXRNODJBMVwiOiByZXF1aXJlKCcuL0JhcnJldE04MkExJylcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgTWFwQ3RmMSA9IHt9XG5cbk1hcEN0ZjEuY3JlYXRlID0gZnVuY3Rpb24oc2NvcGUpIHtcbiAgICB0aGlzLnNjb3BlID0gc2NvcGVcblxuICAgIHRoaXMuY3JlYXRlU2t5U3ByaXRlKClcbiAgICB0aGlzLmNyZWF0ZVBsYXRmb3JtcygpXG4gICAgdGhpcy5jcmVhdGVMZWRnZXMoKVxuXG4gICAgdGhpcy5zY29wZS5wbGF0Zm9ybXMuc2V0QWxsKCdib2R5LmltbW92YWJsZScsIHRydWUpXG4gICAgdGhpcy5zY29wZS5wbGF0Zm9ybXMuc2V0QWxsKCdib2R5LmFsbG93R3Jhdml0eScsIGZhbHNlKVxufVxuXG5NYXBDdGYxLmNyZWF0ZUxlZGdlcyA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBsZWRnZXMgPSBbXG4gICAgICAgIC8vIHt4LCB5LCB3aWR0aCwgaGVpZ2h0fVxuXG4gICAgICAgIC8vIFN0YXJ0aW5nIExlZGdlc1xuICAgICAgICB7IGlkOiAxLCB4OiAwLCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gNDMxLCB3aWR0aDogMTI4LCBoZWlnaHQ6IDkyIH0sIC8vIExlZnQgYm90dG9tIGxlZGdlXG4gICAgICAgIHsgaWQ6IDIsIHg6IDAsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA4MzgsIHdpZHRoOiAxMjgsIGhlaWdodDogOTIgfSwgLy8gTGVmdCB0b3AgbGVkZ2VcblxuICAgICAgICB7IGlkOiAzLCB4OiAzODcyLCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gNDI3LCB3aWR0aDogMTI4LCBoZWlnaHQ6IDkyIH0sIC8vIFJpZ2h0IGJvdHRvbSBsZWRnZVxuICAgICAgICB7IGlkOiA0LCB4OiAzODcyLCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gODM1LCB3aWR0aDogMTI4LCBoZWlnaHQ6IDkyIH0sIC8vIFJpZ2h0IHRvcCBsZWRnZVxuXG4gICAgICAgIC8vIEdyb3VuZCBMZWRnZXNcbiAgICAgICAgeyBpZDogNSwgeDogMCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDEyOCwgd2lkdGg6IDQ3NCwgaGVpZ2h0OiAxMjggfSwgLy8gTWFpbiBib3R0b20gc3RhcnRpbmcgbGVmdCBsZWRnZVxuICAgICAgICB7IGlkOiA2LCB4OiA0NzQsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSAyNTYsIHdpZHRoOiA2NDEsIGhlaWdodDogMjYwIH0sIC8vIE1haW4gYm90dG9tIGxlZnQgbGVkZ2VcbiAgICAgICAgeyBpZDogNywgeDogMTExNSwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDM4NCwgd2lkdGg6IDE3ODUsIGhlaWdodDogMzkwIH0sIC8vIE1haW4gYm90dG9tIGNlbnRlciBsZWRnZVxuICAgICAgICB7IGlkOiA4LCB4OiAyOTAwLCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gMjU2LCB3aWR0aDogNjQxLCBoZWlnaHQ6IDI2MCB9LCAvLyBNYWluIGJvdHRvbSByaWdodCBsZWRnZVxuICAgICAgICB7IGlkOiA5LCB4OiAzNTQwLCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gMTI4LCB3aWR0aDogNDc0LCBoZWlnaHQ6IDEyOCB9LCAvLyBNYWluIGJvdHRvbSBzdGFydGluZyByaWdodCBsZWRnZVxuXG4gICAgICAgIC8vIEFpciBMZWRnZXNcbiAgICAgICAgeyBpZDogMTAsIHg6IDMwMCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDYwOCwgd2lkdGg6IDY0MSwgaGVpZ2h0OiA5MiB9LFxuICAgICAgICB7IGlkOiAxMSwgeDogMTExMCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDcwMSwgd2lkdGg6IDUxMywgaGVpZ2h0OiA5MiB9LFxuICAgICAgICB7IGlkOiAxMiwgeDogODcwLCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gOTgyLCB3aWR0aDogMjU2LCBoZWlnaHQ6IDkyIH0sXG4gICAgICAgIHsgaWQ6IDEzLCB4OiAxNzQ0LCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gODc0LCB3aWR0aDogNTA3LCBoZWlnaHQ6IDI1NCB9LFxuICAgICAgICB7IGlkOiAxNCwgeDogMjM5MCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDY4OSwgd2lkdGg6IDUxMywgaGVpZ2h0OiA5MiB9LFxuICAgICAgICB7IGlkOiAxNSwgeDogMzAzMSwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDYwOCwgd2lkdGg6IDY0MSwgaGVpZ2h0OiA5MiB9LFxuICAgICAgICB7IGlkOiAxNiwgeDogMjkwMywgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDk1Nywgd2lkdGg6IDI1NiwgaGVpZ2h0OiA5MiB9LFxuXG4gICAgICAgIC8vIEJveGVzXG4gICAgICAgIHsgaWQ6IDE3LCB4OiA3MTcsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA2ODYsIHdpZHRoOiAxNTUsIGhlaWdodDogNzcgfSxcbiAgICAgICAgeyBpZDogMTcsIHg6IDc1NywgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDc2Mywgd2lkdGg6IDc3LCBoZWlnaHQ6IDc3IH1cbiAgICBdXG5cblxuICAgIGxlZGdlcy5mb3JFYWNoKChsZWRnZSkgPT4ge1xuICAgICAgICB2YXIgbmV3TGVkZ2UgPSB0aGlzLnNjb3BlLnBsYXRmb3Jtcy5jcmVhdGUobGVkZ2UueCwgbGVkZ2UueSwgJ2dyb3VuZCcpXG4gICAgICAgIC8vIHZhciBuZXdMZWRnZSA9IHRoaXMuc2NvcGUucGxhdGZvcm1zLmNyZWF0ZShsZWRnZS54LCBsZWRnZS55KVxuICAgICAgICBuZXdMZWRnZS5oZWlnaHQgPSBsZWRnZS5oZWlnaHRcbiAgICAgICAgbmV3TGVkZ2Uud2lkdGggPSBsZWRnZS53aWR0aFxuXG4gICAgICAgIC8vIERlYnVnIHN0dWZmXG4gICAgICAgIG5ld0xlZGdlLmFscGhhID0gMC4yXG4gICAgICAgIGxldCBzdHlsZSA9IHsgZm9udDogXCIyMHB4IEFyaWFsXCIsIGZpbGw6IFwiI2ZmMDA0NFwiLCBhbGlnbjogXCJjZW50ZXJcIiwgYmFja2dyb3VuZENvbG9yOiBcIiNmZmZmMDBcIiB9XG4gICAgICAgIGxldCB0ZXh0ID0gdGhpcy5zY29wZS5nYW1lLmFkZC50ZXh0KGxlZGdlLngsIGxlZGdlLnksIGxlZGdlLmlkLCBzdHlsZSlcbiAgICAgICAgdGV4dC5hbHBoYSA9IDAuMlxuICAgIH0pXG59XG5cbk1hcEN0ZjEuY3JlYXRlU2t5U3ByaXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zY29wZS5hZGQudGlsZVNwcml0ZSgwLCB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gMTUwMCwgdGhpcy5zY29wZS5nYW1lLndvcmxkLndpZHRoLCAxNTAwLCAndHJlZXNjYXBlJylcbn1cblxuTWFwQ3RmMS5jcmVhdGVQbGF0Zm9ybXMgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNjb3BlLnBsYXRmb3JtcyA9IHRoaXMuc2NvcGUuYWRkLmdyb3VwKClcbiAgICB0aGlzLnNjb3BlLnBsYXRmb3Jtcy5lbmFibGVCb2R5ID0gdHJ1ZVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1hcEN0ZjFcbiJdfQ==
