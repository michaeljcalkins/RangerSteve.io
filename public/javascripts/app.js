(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var guid = require('./lib/guid');

// Game functions
var init = require('./lib/game/init');
var preload = require('./lib/game/preload');
var create = require('./lib/game/create');
var update = require('./lib/game/update');

var clientSocketHandler = require('./lib/clientSocketHandler');
var clienInputHandler = require('./lib/clientInputHandler');

var gameWidth = window.innerWidth;
var gameHeight = window.innerHeight;
var game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, 'ranger-steve-game');

var RangerSteveGame = function RangerSteveGame() {
    this.clientId = guid();
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
    // Game functions
    init: init,
    preload: preload,
    create: create,
    update: update,

    // Socket events
    setEventHandlers: clientSocketHandler.setEventHandlers,
    onSocketConnected: clientSocketHandler.onSocketConnected,
    onSocketDisconnect: clientSocketHandler.onSocketDisconnect,
    onNewPlayer: clientSocketHandler.onNewPlayer,
    onDeadPlayer: clientSocketHandler.onDeadPlayer,
    onMovePlayer: clientSocketHandler.onMovePlayer,
    onRemovePlayer: clientSocketHandler.onRemovePlayer,

    // Input controls
    leftInputIsActive: clienInputHandler.leftInputIsActive,
    rightInputIsActive: clienInputHandler.rightInputIsActive,
    upInputIsActive: clienInputHandler.upInputIsActive,
    upInputReleased: clienInputHandler.upInputReleased,

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
    }
};

game.state.add('Game', RangerSteveGame, true);

},{"./lib/clientInputHandler":3,"./lib/clientSocketHandler":4,"./lib/game/create":5,"./lib/game/init":6,"./lib/game/preload":7,"./lib/game/update":8,"./lib/guid":9}],2:[function(require,module,exports){
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
    // this.scale.set(1)

    this.game.physics.arcade.moveToPointer(this, speed);
    console.log();
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

},{}],4:[function(require,module,exports){
'use strict';

var remotePlayer = require('./remotePlayer');

module.exports = {
    setEventHandlers: function setEventHandlers() {
        // Socket connection successful
        this.socket.on('connect', this.onSocketConnected.bind(this));

        // Socket disconnection
        this.socket.on('disconnect', this.onSocketDisconnect.bind(this));

        // New player message received
        this.socket.on('new player', this.onNewPlayer.bind(this));

        // Player move message received
        this.socket.on('move player', this.onMovePlayer.bind(this));

        // Player removed message received
        this.socket.on('remove player', this.onRemovePlayer.bind(this));

        // Updated player list received
        // this.socket.on('update players', this.onUpdatePlayers.bind(this))

        // A player has died
        // this.socket.on('dead player', this.onDeadPlayer.bind(this))

        console.log('Socket events initialized.');
    },

    // Socket connected
    onSocketConnected: function onSocketConnected() {
        console.log('Connected to socket server');

        // Reset enemies on reconnect
        this.enemies.forEach(function (enemy) {
            enemy.player.kill();
        });
        this.enemies = [];

        // Send local player data to the game server
        this.socket.emit('new player', {
            x: this.player.x,
            y: this.player.y
        });
    },

    // Socket disconnected
    onSocketDisconnect: function onSocketDisconnect() {
        console.log('Disconnected from socket server');
    },

    onUpdatePlayers: function onUpdatePlayers(data) {
        console.log('Updated player list received', data);
    },

    // New player
    onNewPlayer: function onNewPlayer(data) {
        console.log('New player connected:', data.id);

        // Avoid possible duplicate players
        var duplicate = _.find(this.enemies, { id: data.id });
        if (duplicate) {
            console.log('Duplicate player!');
            return;
        }

        var newRemotePlayer = remotePlayer.create.call(this, {
            x: data.x,
            y: data.y,
            id: data.id
        });

        this.enemies.push(newRemotePlayer);
    },

    onDeadPlayer: function onDeadPlayer(data) {
        if (data.deadPlayerId !== '/#' + this.socket.id) return;

        console.log('YOU DIED!!!');

        this.player.x = 200;
        this.player.y = this.world.height - 400;
    },

    // Move player
    onMovePlayer: function onMovePlayer(data) {
        var movePlayer = _.find(this.enemies, { id: data.id });

        // Player not found
        if (!movePlayer) {
            return;
        }

        // Update player position
        movePlayer.x = data.x;
        movePlayer.y = data.y;
        //
        // if (movePlayer.x > movePlayer.lastPosition.x) {
        //     movePlayer.animations.play('right')
        // }
        // else if (movePlayer.x < movePlayer.lastPosition.x)
        // {
        //     movePlayer.animations.play('left')
        // }
        // else
        // {
        //     movePlayer.animations.stop()
        //     movePlayer.frame = 4;
        // }
        //
        // movePlayer.lastPosition.x = movePlayer.x
        // movePlayer.lastPosition.y = movePlayer.y
    },

    // Remove player
    onRemovePlayer: function onRemovePlayer(data) {
        var removePlayer = _.find(this.enemies, { id: data.id });

        // Player not found
        if (!removePlayer) {
            console.log('Disconnected player not found: ', data);
            return;
        }

        removePlayer.kill();

        // Remove player from array
        this.enemies.splice(this.enemies.indexOf(removePlayer), 1);
    }
};

},{"./remotePlayer":11}],5:[function(require,module,exports){
'use strict';

var forestia = require('../../maps/forestia');
var weapons = require('../weapons');
var player = require('../player');

var worldWidth = 4000;
var worldHeight = 1500;

module.exports = function () {
  var _this = this;

  // Define movement constants
  this.MAX_SPEED = 400; // pixels/second
  this.ACCELERATION = 1960; // pixels/second/second
  this.DRAG = 1500; // pixels/second
  this.GRAVITY = 1900; // pixels/second/second
  this.JUMP_SPEED = -850; // pixels/second (negative y is up)

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

  // Since we're jumping we need gravity
  this.game.physics.arcade.gravity.y = this.GRAVITY;

  // Flag to track if the jump button is pressed
  this.jumping = false;

  /**
   * Map
   */
  forestia.create(this);

  /**
   * Player Settings
   */
  this.player = player.create.call(this);

  /**
   * Weapons
   */
  this.currentWeapon = 0;
  this.weapons.push(new weapons.aK47(this.game));
  this.weapons.push(new weapons.barretM82A1(this.game));

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
};

},{"../../maps/forestia":15,"../player":10,"../weapons":14}],6:[function(require,module,exports){
'use strict';

module.exports = function () {
    this.game.renderer.renderSession.roundPixels = true;
    this.game.stage.disableVisibilityChange = true;
    this.physics.startSystem(Phaser.Physics.ARCADE);
};

},{}],7:[function(require,module,exports){
'use strict';

module.exports = function () {
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
};

},{}],8:[function(require,module,exports){
'use strict';

module.exports = function () {
    var _this = this;

    //  Collide the player and the stars with the platforms
    this.physics.arcade.collide(this.player, this.platforms);
    this.physics.arcade.collide(this.enemies, this.platforms);
    this.physics.arcade.collide(this.enemy, this.platforms);
    this.physics.arcade.collide(this.platforms, this.weapons, function (platform, weapon) {
        weapon.kill();
    }, null, this);

    this.enemies.forEach(function (enemy) {
        _this.game.physics.arcade.overlap(enemy, _this.weapons, function (enemy, weapon) {
            enemy.health -= weapon.damage;
            console.log(_this.player);
            _this.socket.emit('damaged player', {
                attackingPlayerId: '/#' + _this.socket.id,
                damagedPlayerId: enemy.id,
                damage: weapon.damage
            });
            weapon.kill();
            console.log('You hit them!', enemy.health, weapon.damage, enemy);
        }, null, _this);
    });

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

    // Fire current weapon
    if (this.game.input.activePointer.isDown) {
        this.weapons[this.currentWeapon].fire(this.player);
    }

    this.socket.emit('move player', { x: this.player.x, y: this.player.y });
};

},{}],9:[function(require,module,exports){
'use strict';

module.exports = function guidGenerator() {
   var S4 = function S4() {
      return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
   };

   return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
};

},{}],10:[function(require,module,exports){
'use strict';

var Player = {};

Player.create = function () {
    var newPlayer = this.add.sprite(200, this.world.height - 400, 'dude');

    //  We need to enable physics on the player
    this.physics.arcade.enable(newPlayer);

    // Enable physics on the player
    this.game.physics.enable(newPlayer, Phaser.Physics.ARCADE);

    // Make player collide with world boundaries so he doesn't leave the stage
    newPlayer.body.collideWorldBounds = true;

    // Set player minimum and maximum movement speed
    newPlayer.body.maxVelocity.setTo(this.MAX_SPEED, this.MAX_SPEED * 10); // x, y

    // Add drag to the player that slows them down when they are not accelerating
    newPlayer.body.drag.setTo(this.DRAG, 0); // x, y

    //  Our two animations, walking left and right.
    newPlayer.animations.add('left', [0, 1, 2, 3], 10, true);
    newPlayer.animations.add('right', [5, 6, 7, 8], 10, true);
    newPlayer.score = 0;

    return newPlayer;
};

module.exports = Player;

},{}],11:[function(require,module,exports){
'use strict';

var RemotePlayer = {};

RemotePlayer.create = function (config) {
    // Add new player to the remote players array
    var newRemotePlayer = this.add.sprite(config.x, config.y, 'dude');
    newRemotePlayer.id = config.id;

    newRemotePlayer.lastPosition = {
        x: config.x,
        y: config.y
    };

    //  We need to enable physics on the player
    this.physics.arcade.enable(newRemotePlayer);

    // Enable physics on the player
    this.game.physics.enable(newRemotePlayer, Phaser.Physics.ARCADE);

    // Make player collide with world boundaries so he doesn't leave the stage
    newRemotePlayer.body.collideWorldBounds = true;

    // Set player minimum and maximum movement speed
    newRemotePlayer.body.maxVelocity.setTo(this.MAX_SPEED, this.MAX_SPEED * 10); // x, y

    // Add drag to the player that slows them down when they are not accelerating
    newRemotePlayer.body.drag.setTo(this.DRAG, 0); // x, y

    newRemotePlayer.health = 100;

    newRemotePlayer.animations.add('left', [0, 1, 2, 3], 10, true);
    newRemotePlayer.animations.add('right', [5, 6, 7, 8], 10, true);

    return newRemotePlayer;
};

module.exports = RemotePlayer;

},{}],12:[function(require,module,exports){
'use strict';

var Bullet = require('../Bullet');

var AK47 = function AK47(game) {
    Phaser.Group.call(this, game, game.world, 'AK-47', false, true, Phaser.Physics.ARCADE);

    this.name = 'AK-47';
    this.damage = 22;
    this.nextFire = 0;
    this.bulletSpeed = 1500;

    // AK47 fires about 600 bullets per second
    this.fireRate = 166.666667;

    for (var i = 0; i < 64; i++) {
        var bullet = new Bullet(this.game, 'ground');
        bullet.height = 3;
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

},{"../Bullet":2}],13:[function(require,module,exports){
'use strict';

var Bullet = require('../Bullet');

var barretM82A1 = function barretM82A1(game) {
    Phaser.Group.call(this, game, game.world, 'AK-47', false, true, Phaser.Physics.ARCADE);

    this.name = 'Barret M82A1';
    this.damage = 88;
    this.nextFire = 0;
    this.bulletSpeed = 3435;

    // barretM82A1 fires about 600 bullets per second
    this.fireRate = 4000;

    for (var i = 0; i < 64; i++) {
        var bullet = new Bullet(this.game, 'ground');
        bullet.height = 3;
        bullet.width = 10;
        bullet.damage = 88;

        this.add(bullet, true);
    }

    return this;
};

barretM82A1.prototype = Object.create(Phaser.Group.prototype);
barretM82A1.prototype.constructor = barretM82A1;

barretM82A1.prototype.fire = function (source) {
    if (this.game.time.time < this.nextFire) return;

    var x = source.x + 15;
    var y = source.y + 30;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0);
    this.setAll('tracking', true);

    this.nextFire = this.game.time.time + this.fireRate;
};

module.exports = barretM82A1;

},{"../Bullet":2}],14:[function(require,module,exports){
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
  aK47: require('./aK47'),
  barretM82A1: require('./barretM82A1')
};

},{"./aK47":12,"./barretM82A1":13}],15:[function(require,module,exports){
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
    { id: 10, x: 300, y: this.scope.game.world.height - 608, width: 641, height: 92 }, { id: 11, x: 1110, y: this.scope.game.world.height - 701, width: 513, height: 92 }, { id: 12, x: 870, y: this.scope.game.world.height - 982, width: 256, height: 92 }, { id: 13, x: 1744, y: this.scope.game.world.height - 874, width: 507, height: 254 }, { id: 14, x: 2390, y: this.scope.game.world.height - 689, width: 513, height: 92 }, { id: 15, x: 3031, y: this.scope.game.world.height - 608, width: 641, height: 92 }, { id: 16, x: 2903, y: this.scope.game.world.height - 957, width: 256, height: 92 }];

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvYXBwLmpzIiwiYXNzZXRzL2pzL2xpYi9CdWxsZXQuanMiLCJhc3NldHMvanMvbGliL2NsaWVudElucHV0SGFuZGxlci5qcyIsImFzc2V0cy9qcy9saWIvY2xpZW50U29ja2V0SGFuZGxlci5qcyIsImFzc2V0cy9qcy9saWIvZ2FtZS9jcmVhdGUuanMiLCJhc3NldHMvanMvbGliL2dhbWUvaW5pdC5qcyIsImFzc2V0cy9qcy9saWIvZ2FtZS9wcmVsb2FkLmpzIiwiYXNzZXRzL2pzL2xpYi9nYW1lL3VwZGF0ZS5qcyIsImFzc2V0cy9qcy9saWIvZ3VpZC5qcyIsImFzc2V0cy9qcy9saWIvcGxheWVyLmpzIiwiYXNzZXRzL2pzL2xpYi9yZW1vdGVQbGF5ZXIuanMiLCJhc3NldHMvanMvbGliL3dlYXBvbnMvYUs0Ny5qcyIsImFzc2V0cy9qcy9saWIvd2VhcG9ucy9iYXJyZXRNODJBMS5qcyIsImFzc2V0cy9qcy9saWIvd2VhcG9ucy9pbmRleC5qcyIsImFzc2V0cy9qcy9tYXBzL2ZvcmVzdGlhLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7O0FBRUEsSUFBSSxPQUFPLFFBQVEsWUFBUixDQUFQOzs7QUFHSixJQUFJLE9BQU8sUUFBUSxpQkFBUixDQUFQO0FBQ0osSUFBSSxVQUFVLFFBQVEsb0JBQVIsQ0FBVjtBQUNKLElBQUksU0FBUyxRQUFRLG1CQUFSLENBQVQ7QUFDSixJQUFJLFNBQVMsUUFBUSxtQkFBUixDQUFUOztBQUVKLElBQUksc0JBQXNCLFFBQVEsMkJBQVIsQ0FBdEI7QUFDSixJQUFJLG9CQUFvQixRQUFRLDBCQUFSLENBQXBCOztBQUVKLElBQUksWUFBWSxPQUFPLFVBQVA7QUFDaEIsSUFBSSxhQUFhLE9BQU8sV0FBUDtBQUNqQixJQUFJLE9BQU8sSUFBSSxPQUFPLElBQVAsQ0FBWSxTQUFoQixFQUEyQixVQUEzQixFQUF1QyxPQUFP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QUFULEdBQWlCLE1BQU0sS0FBTjs7Ozs7OztBQUpLLEtBQVgsQ0FBZixDQTdCOEI7Q0FBWDs7QUEyQ3ZCLFFBQVEsZUFBUixHQUEwQixZQUFXO0FBQ2pDLFNBQUssS0FBTCxDQUFXLEdBQVgsQ0FBZSxVQUFmLENBQTBCLENBQTFCLEVBQTZCLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsS0FBaEIsQ0FBc0IsTUFBdEIsR0FBK0IsSUFBL0IsRUFBcUMsS0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixLQUFoQixDQUFzQixLQUF0QixFQUE2QixJQUEvRixFQUFxRyxXQUFyRyxFQURpQztDQUFYOztBQUkxQixRQUFRLGVBQVIsR0FBMEIsWUFBVztBQUNqQyxTQUFLLEtBQUwsQ0FBVyxTQUFYLEdBQXVCLEtBQUssS0FBTCxDQUFXLEdBQVgsQ0FBZSxLQUFmLEVBQXZCLENBRGlDO0FBRWpDLFNBQUssS0FBTCxDQUFXLFNBQVgsQ0FBcUIsVUFBckIsR0FBa0MsSUFBbEMsQ0FGaUM7Q0FBWDs7QUFLMUIsT0FBTyxPQUFQLEdBQWlCLE9BQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ3VpZCA9IHJlcXVpcmUoJy4vbGliL2d1aWQnKVxuXG4vLyBHYW1lIGZ1bmN0aW9uc1xubGV0IGluaXQgPSByZXF1aXJlKCcuL2xpYi9nYW1lL2luaXQnKVxubGV0IHByZWxvYWQgPSByZXF1aXJlKCcuL2xpYi9nYW1lL3ByZWxvYWQnKVxubGV0IGNyZWF0ZSA9IHJlcXVpcmUoJy4vbGliL2dhbWUvY3JlYXRlJylcbmxldCB1cGRhdGUgPSByZXF1aXJlKCcuL2xpYi9nYW1lL3VwZGF0ZScpXG5cbmxldCBjbGllbnRTb2NrZXRIYW5kbGVyID0gcmVxdWlyZSgnLi9saWIvY2xpZW50U29ja2V0SGFuZGxlcicpXG5sZXQgY2xpZW5JbnB1dEhhbmRsZXIgPSByZXF1aXJlKCcuL2xpYi9jbGllbnRJbnB1dEhhbmRsZXInKVxuXG52YXIgZ2FtZVdpZHRoID0gd2luZG93LmlubmVyV2lkdGhcbnZhciBnYW1lSGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0XG52YXIgZ2FtZSA9IG5ldyBQaGFzZXIuR2FtZShnYW1lV2lkdGgsIGdhbWVIZWlnaHQsIFBoYXNlci5BVVRPLCAncmFuZ2VyLXN0ZXZlLWdhbWUnKTtcblxudmFyIFJhbmdlclN0ZXZlR2FtZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY2xpZW50SWQgPSBndWlkKClcbiAgICB0aGlzLmN1cnJlbnRXZWFwb24gPSAwO1xuICAgIHRoaXMuZW5lbWllcyA9IFtdXG4gICAgdGhpcy5nYW1lID0gZ2FtZVxuICAgIHRoaXMuZ3JvdW5kXG4gICAgdGhpcy5wbGF0Zm9ybXNcbiAgICB0aGlzLnBsYXllclxuICAgIHRoaXMuc2NvcmUgPSAwXG4gICAgdGhpcy5zY29yZVRleHRcbiAgICB0aGlzLnNvY2tldFxuICAgIHRoaXMud2VhcG9uTmFtZSA9IG51bGw7XG4gICAgdGhpcy53ZWFwb25zID0gW107XG59XG5cblJhbmdlclN0ZXZlR2FtZS5wcm90b3R5cGUgPSB7XG4gICAgLy8gR2FtZSBmdW5jdGlvbnNcbiAgICBpbml0LFxuICAgIHByZWxvYWQsXG4gICAgY3JlYXRlLFxuICAgIHVwZGF0ZSxcblxuICAgIC8vIFNvY2tldCBldmVudHNcbiAgICBzZXRFdmVudEhhbmRsZXJzOiBjbGllbnRTb2NrZXRIYW5kbGVyLnNldEV2ZW50SGFuZGxlcnMsXG4gICAgb25Tb2NrZXRDb25uZWN0ZWQ6IGNsaWVudFNvY2tldEhhbmRsZXIub25Tb2NrZXRDb25uZWN0ZWQsXG4gICAgb25Tb2NrZXREaXNjb25uZWN0OiBjbGllbnRTb2NrZXRIYW5kbGVyLm9uU29ja2V0RGlzY29ubmVjdCxcbiAgICBvbk5ld1BsYXllcjogY2xpZW50U29ja2V0SGFuZGxlci5vbk5ld1BsYXllcixcbiAgICBvbkRlYWRQbGF5ZXI6IGNsaWVudFNvY2tldEhhbmRsZXIub25EZWFkUGxheWVyLFxuICAgIG9uTW92ZVBsYXllcjogY2xpZW50U29ja2V0SGFuZGxlci5vbk1vdmVQbGF5ZXIsXG4gICAgb25SZW1vdmVQbGF5ZXI6IGNsaWVudFNvY2tldEhhbmRsZXIub25SZW1vdmVQbGF5ZXIsXG5cbiAgICAvLyBJbnB1dCBjb250cm9sc1xuICAgIGxlZnRJbnB1dElzQWN0aXZlOiBjbGllbklucHV0SGFuZGxlci5sZWZ0SW5wdXRJc0FjdGl2ZSxcbiAgICByaWdodElucHV0SXNBY3RpdmU6IGNsaWVuSW5wdXRIYW5kbGVyLnJpZ2h0SW5wdXRJc0FjdGl2ZSxcbiAgICB1cElucHV0SXNBY3RpdmU6IGNsaWVuSW5wdXRIYW5kbGVyLnVwSW5wdXRJc0FjdGl2ZSxcbiAgICB1cElucHV0UmVsZWFzZWQ6IGNsaWVuSW5wdXRIYW5kbGVyLnVwSW5wdXRSZWxlYXNlZCxcblxuICAgIG5leHRXZWFwb246IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyAgVGlkeS11cCB0aGUgY3VycmVudCB3ZWFwb25cbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFdlYXBvbiA+IDkpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLnJlc2V0KCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS5jYWxsQWxsKCdyZXNldCcsIG51bGwsIDAsIDApO1xuICAgICAgICAgICAgdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0uc2V0QWxsKCdleGlzdHMnLCBmYWxzZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyAgQWN0aXZhdGUgdGhlIG5ldyBvbmVcbiAgICAgICAgdGhpcy5jdXJyZW50V2VhcG9uKys7XG5cbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFdlYXBvbiA9PT0gdGhpcy53ZWFwb25zLmxlbmd0aClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50V2VhcG9uID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLnZpc2libGUgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMud2VhcG9uTmFtZS50ZXh0ID0gdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0ubmFtZVxuICAgIH1cbn1cblxuZ2FtZS5zdGF0ZS5hZGQoJ0dhbWUnLCBSYW5nZXJTdGV2ZUdhbWUsIHRydWUpXG4iLCIndXNlIHN0cmljdCdcblxudmFyIEJ1bGxldCA9IGZ1bmN0aW9uIChnYW1lLCBrZXkpIHtcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgMCwgMCwga2V5KVxuXG4gICAgdGhpcy50ZXh0dXJlLmJhc2VUZXh0dXJlLnNjYWxlTW9kZSA9IFBJWEkuc2NhbGVNb2Rlcy5ORUFSRVNUXG5cbiAgICB0aGlzLmFuY2hvci5zZXQoMC41KVxuXG4gICAgdGhpcy5jaGVja1dvcmxkQm91bmRzID0gdHJ1ZVxuICAgIHRoaXMub3V0T2ZCb3VuZHNLaWxsID0gdHJ1ZVxuICAgIHRoaXMuZXhpc3RzID0gZmFsc2VcblxuICAgIHRoaXMudHJhY2tpbmcgPSBmYWxzZVxuICAgIHRoaXMuc2NhbGVTcGVlZCA9IDBcbn1cblxuQnVsbGV0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpXG5CdWxsZXQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQnVsbGV0XG5cbkJ1bGxldC5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uICh4LCB5LCBhbmdsZSwgc3BlZWQsIGd4LCBneSkge1xuICAgIGd4ID0gZ3ggfHwgMFxuICAgIGd5ID0gZ3kgfHwgMFxuICAgIHRoaXMucmVzZXQoeCwgeSlcbiAgICAvLyB0aGlzLnNjYWxlLnNldCgxKVxuXG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLm1vdmVUb1BvaW50ZXIodGhpcywgc3BlZWQpXG4gICAgY29uc29sZS5sb2coKVxuICAgIHRoaXMuYm9keS5ncmF2aXR5LnkgPSAtMTgwMFxufVxuXG5CdWxsZXQucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy50cmFja2luZylcbiAgICB7XG4gICAgICAgIHRoaXMucm90YXRpb24gPSBNYXRoLmF0YW4yKHRoaXMuYm9keS52ZWxvY2l0eS55LCB0aGlzLmJvZHkudmVsb2NpdHkueCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc2NhbGVTcGVlZCA+IDApXG4gICAge1xuICAgICAgICB0aGlzLnNjYWxlLnggKz0gdGhpcy5zY2FsZVNwZWVkO1xuICAgICAgICB0aGlzLnNjYWxlLnkgKz0gdGhpcy5zY2FsZVNwZWVkO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCdWxsZXRcbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvLyBUaGlzIGZ1bmN0aW9uIHNob3VsZCByZXR1cm4gdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgYWN0aXZhdGVzIHRoZSBcImdvIGxlZnRcIiBjb250cm9sXG4gICAgLy8gSW4gdGhpcyBjYXNlLCBlaXRoZXIgaG9sZGluZyB0aGUgcmlnaHQgYXJyb3cgb3IgdGFwcGluZyBvciBjbGlja2luZyBvbiB0aGUgbGVmdFxuICAgIC8vIHNpZGUgb2YgdGhlIHNjcmVlbi5cbiAgICBsZWZ0SW5wdXRJc0FjdGl2ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlucHV0LmtleWJvYXJkLmlzRG93bihQaGFzZXIuS2V5Ym9hcmQuQSlcbiAgICB9LFxuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiBzaG91bGQgcmV0dXJuIHRydWUgd2hlbiB0aGUgcGxheWVyIGFjdGl2YXRlcyB0aGUgXCJnbyByaWdodFwiIGNvbnRyb2xcbiAgICAvLyBJbiB0aGlzIGNhc2UsIGVpdGhlciBob2xkaW5nIHRoZSByaWdodCBhcnJvdyBvciB0YXBwaW5nIG9yIGNsaWNraW5nIG9uIHRoZSByaWdodFxuICAgIC8vIHNpZGUgb2YgdGhlIHNjcmVlbi5cbiAgICByaWdodElucHV0SXNBY3RpdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnB1dC5rZXlib2FyZC5pc0Rvd24oUGhhc2VyLktleWJvYXJkLkQpXG4gICAgfSxcblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gc2hvdWxkIHJldHVybiB0cnVlIHdoZW4gdGhlIHBsYXllciBhY3RpdmF0ZXMgdGhlIFwianVtcFwiIGNvbnRyb2xcbiAgICAvLyBJbiB0aGlzIGNhc2UsIGVpdGhlciBob2xkaW5nIHRoZSB1cCBhcnJvdyBvciB0YXBwaW5nIG9yIGNsaWNraW5nIG9uIHRoZSBjZW50ZXJcbiAgICAvLyBwYXJ0IG9mIHRoZSBzY3JlZW4uXG4gICAgdXBJbnB1dElzQWN0aXZlOiBmdW5jdGlvbihkdXJhdGlvbikge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnB1dC5rZXlib2FyZC5kb3duRHVyYXRpb24oUGhhc2VyLktleWJvYXJkLlcsIGR1cmF0aW9uKTtcbiAgICB9LFxuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiByZXR1cm5zIHRydWUgd2hlbiB0aGUgcGxheWVyIHJlbGVhc2VzIHRoZSBcImp1bXBcIiBjb250cm9sXG4gICAgdXBJbnB1dFJlbGVhc2VkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5wdXQua2V5Ym9hcmQudXBEdXJhdGlvbihQaGFzZXIuS2V5Ym9hcmQuVyk7XG4gICAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCByZW1vdGVQbGF5ZXIgPSByZXF1aXJlKCcuL3JlbW90ZVBsYXllcicpXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHNldEV2ZW50SGFuZGxlcnM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gU29ja2V0IGNvbm5lY3Rpb24gc3VjY2Vzc2Z1bFxuICAgICAgICB0aGlzLnNvY2tldC5vbignY29ubmVjdCcsIHRoaXMub25Tb2NrZXRDb25uZWN0ZWQuYmluZCh0aGlzKSlcblxuICAgICAgICAvLyBTb2NrZXQgZGlzY29ubmVjdGlvblxuICAgICAgICB0aGlzLnNvY2tldC5vbignZGlzY29ubmVjdCcsIHRoaXMub25Tb2NrZXREaXNjb25uZWN0LmJpbmQodGhpcykpXG5cbiAgICAgICAgLy8gTmV3IHBsYXllciBtZXNzYWdlIHJlY2VpdmVkXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCduZXcgcGxheWVyJywgdGhpcy5vbk5ld1BsYXllci5iaW5kKHRoaXMpKVxuXG4gICAgICAgIC8vIFBsYXllciBtb3ZlIG1lc3NhZ2UgcmVjZWl2ZWRcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ21vdmUgcGxheWVyJywgdGhpcy5vbk1vdmVQbGF5ZXIuYmluZCh0aGlzKSlcblxuICAgICAgICAvLyBQbGF5ZXIgcmVtb3ZlZCBtZXNzYWdlIHJlY2VpdmVkXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdyZW1vdmUgcGxheWVyJywgdGhpcy5vblJlbW92ZVBsYXllci5iaW5kKHRoaXMpKVxuXG4gICAgICAgIC8vIFVwZGF0ZWQgcGxheWVyIGxpc3QgcmVjZWl2ZWRcbiAgICAgICAgLy8gdGhpcy5zb2NrZXQub24oJ3VwZGF0ZSBwbGF5ZXJzJywgdGhpcy5vblVwZGF0ZVBsYXllcnMuYmluZCh0aGlzKSlcblxuICAgICAgICAvLyBBIHBsYXllciBoYXMgZGllZFxuICAgICAgICAvLyB0aGlzLnNvY2tldC5vbignZGVhZCBwbGF5ZXInLCB0aGlzLm9uRGVhZFBsYXllci5iaW5kKHRoaXMpKVxuXG4gICAgICAgIGNvbnNvbGUubG9nKCdTb2NrZXQgZXZlbnRzIGluaXRpYWxpemVkLicpXG4gICAgfSxcblxuICAgIC8vIFNvY2tldCBjb25uZWN0ZWRcbiAgICBvblNvY2tldENvbm5lY3RlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdDb25uZWN0ZWQgdG8gc29ja2V0IHNlcnZlcicpXG5cbiAgICAgICAgIC8vIFJlc2V0IGVuZW1pZXMgb24gcmVjb25uZWN0XG4gICAgICAgIHRoaXMuZW5lbWllcy5mb3JFYWNoKGZ1bmN0aW9uIChlbmVteSkge1xuICAgICAgICAgICAgZW5lbXkucGxheWVyLmtpbGwoKVxuICAgICAgICB9KVxuICAgICAgICB0aGlzLmVuZW1pZXMgPSBbXVxuXG4gICAgICAgIC8vIFNlbmQgbG9jYWwgcGxheWVyIGRhdGEgdG8gdGhlIGdhbWUgc2VydmVyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ25ldyBwbGF5ZXInLCB7XG4gICAgICAgICAgICB4OiB0aGlzLnBsYXllci54LFxuICAgICAgICAgICAgeTogdGhpcy5wbGF5ZXIueVxuICAgICAgICB9KVxuICAgIH0sXG5cbiAgICAvLyBTb2NrZXQgZGlzY29ubmVjdGVkXG4gICAgb25Tb2NrZXREaXNjb25uZWN0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0Rpc2Nvbm5lY3RlZCBmcm9tIHNvY2tldCBzZXJ2ZXInKVxuICAgIH0sXG5cbiAgICBvblVwZGF0ZVBsYXllcnM6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1VwZGF0ZWQgcGxheWVyIGxpc3QgcmVjZWl2ZWQnLCBkYXRhKVxuICAgIH0sXG5cbiAgICAvLyBOZXcgcGxheWVyXG4gICAgb25OZXdQbGF5ZXI6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ05ldyBwbGF5ZXIgY29ubmVjdGVkOicsIGRhdGEuaWQpXG5cbiAgICAgICAgLy8gQXZvaWQgcG9zc2libGUgZHVwbGljYXRlIHBsYXllcnNcbiAgICAgICAgdmFyIGR1cGxpY2F0ZSA9IF8uZmluZCh0aGlzLmVuZW1pZXMsIHsgaWQ6IGRhdGEuaWQgfSlcbiAgICAgICAgaWYgKGR1cGxpY2F0ZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0R1cGxpY2F0ZSBwbGF5ZXIhJylcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG5ld1JlbW90ZVBsYXllciA9IHJlbW90ZVBsYXllci5jcmVhdGUuY2FsbCh0aGlzLCB7XG4gICAgICAgICAgICB4OiBkYXRhLngsXG4gICAgICAgICAgICB5OiBkYXRhLnksXG4gICAgICAgICAgICBpZDogZGF0YS5pZFxuICAgICAgICB9KVxuXG4gICAgICAgIHRoaXMuZW5lbWllcy5wdXNoKG5ld1JlbW90ZVBsYXllcilcbiAgICB9LFxuXG4gICAgb25EZWFkUGxheWVyOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGlmIChkYXRhLmRlYWRQbGF5ZXJJZCAhPT0gKCcvIycgKyB0aGlzLnNvY2tldC5pZCkpXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICBjb25zb2xlLmxvZygnWU9VIERJRUQhISEnKVxuXG4gICAgICAgIHRoaXMucGxheWVyLnggPSAyMDBcbiAgICAgICAgdGhpcy5wbGF5ZXIueSA9IHRoaXMud29ybGQuaGVpZ2h0IC0gNDAwXG4gICAgfSxcblxuICAgIC8vIE1vdmUgcGxheWVyXG4gICAgb25Nb3ZlUGxheWVyOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBtb3ZlUGxheWVyID0gXy5maW5kKHRoaXMuZW5lbWllcywgeyBpZDogZGF0YS5pZCB9KVxuXG4gICAgICAgIC8vIFBsYXllciBub3QgZm91bmRcbiAgICAgICAgaWYgKCEgbW92ZVBsYXllcikge1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICAvLyBVcGRhdGUgcGxheWVyIHBvc2l0aW9uXG4gICAgICAgIG1vdmVQbGF5ZXIueCA9IGRhdGEueFxuICAgICAgICBtb3ZlUGxheWVyLnkgPSBkYXRhLnlcbiAgICAgICAgLy9cbiAgICAgICAgLy8gaWYgKG1vdmVQbGF5ZXIueCA+IG1vdmVQbGF5ZXIubGFzdFBvc2l0aW9uLngpIHtcbiAgICAgICAgLy8gICAgIG1vdmVQbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdyaWdodCcpXG4gICAgICAgIC8vIH1cbiAgICAgICAgLy8gZWxzZSBpZiAobW92ZVBsYXllci54IDwgbW92ZVBsYXllci5sYXN0UG9zaXRpb24ueClcbiAgICAgICAgLy8ge1xuICAgICAgICAvLyAgICAgbW92ZVBsYXllci5hbmltYXRpb25zLnBsYXkoJ2xlZnQnKVxuICAgICAgICAvLyB9XG4gICAgICAgIC8vIGVsc2VcbiAgICAgICAgLy8ge1xuICAgICAgICAvLyAgICAgbW92ZVBsYXllci5hbmltYXRpb25zLnN0b3AoKVxuICAgICAgICAvLyAgICAgbW92ZVBsYXllci5mcmFtZSA9IDQ7XG4gICAgICAgIC8vIH1cbiAgICAgICAgLy9cbiAgICAgICAgLy8gbW92ZVBsYXllci5sYXN0UG9zaXRpb24ueCA9IG1vdmVQbGF5ZXIueFxuICAgICAgICAvLyBtb3ZlUGxheWVyLmxhc3RQb3NpdGlvbi55ID0gbW92ZVBsYXllci55XG4gICAgfSxcblxuICAgIC8vIFJlbW92ZSBwbGF5ZXJcbiAgICBvblJlbW92ZVBsYXllcjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgcmVtb3ZlUGxheWVyID0gXy5maW5kKHRoaXMuZW5lbWllcywgeyBpZDogZGF0YS5pZCB9KVxuXG4gICAgICAgIC8vIFBsYXllciBub3QgZm91bmRcbiAgICAgICAgaWYgKCFyZW1vdmVQbGF5ZXIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdEaXNjb25uZWN0ZWQgcGxheWVyIG5vdCBmb3VuZDogJywgZGF0YSlcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgcmVtb3ZlUGxheWVyLmtpbGwoKVxuXG4gICAgICAgIC8vIFJlbW92ZSBwbGF5ZXIgZnJvbSBhcnJheVxuICAgICAgICB0aGlzLmVuZW1pZXMuc3BsaWNlKHRoaXMuZW5lbWllcy5pbmRleE9mKHJlbW92ZVBsYXllciksIDEpXG4gICAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBmb3Jlc3RpYSA9IHJlcXVpcmUoJy4uLy4uL21hcHMvZm9yZXN0aWEnKVxubGV0IHdlYXBvbnMgPSByZXF1aXJlKCcuLi93ZWFwb25zJylcbmxldCBwbGF5ZXIgPSByZXF1aXJlKCcuLi9wbGF5ZXInKVxuXG5sZXQgd29ybGRXaWR0aCA9IDQwMDBcbmxldCB3b3JsZEhlaWdodCA9IDE1MDBcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBEZWZpbmUgbW92ZW1lbnQgY29uc3RhbnRzXG4gICAgdGhpcy5NQVhfU1BFRUQgPSA0MDA7IC8vIHBpeGVscy9zZWNvbmRcbiAgICB0aGlzLkFDQ0VMRVJBVElPTiA9IDE5NjA7IC8vIHBpeGVscy9zZWNvbmQvc2Vjb25kXG4gICAgdGhpcy5EUkFHID0gMTUwMDsgLy8gcGl4ZWxzL3NlY29uZFxuICAgIHRoaXMuR1JBVklUWSA9IDE5MDA7IC8vIHBpeGVscy9zZWNvbmQvc2Vjb25kXG4gICAgdGhpcy5KVU1QX1NQRUVEID0gLTg1MDsgLy8gcGl4ZWxzL3NlY29uZCAobmVnYXRpdmUgeSBpcyB1cClcblxuICAgIHRoaXMuc29ja2V0ID0gaW8uY29ubmVjdCgpXG4gICAgdGhpcy5lbmVtaWVzID0gW11cblxuICAgIC8vICBXZSdyZSBnb2luZyB0byBiZSB1c2luZyBwaHlzaWNzLCBzbyBlbmFibGUgdGhlIEFyY2FkZSBQaHlzaWNzIHN5c3RlbVxuICAgIHRoaXMucGh5c2ljcy5zdGFydFN5c3RlbShQaGFzZXIuUGh5c2ljcy5BUkNBREUpXG5cbiAgICB0aGlzLndvcmxkLnNldEJvdW5kcygwLCAwLCB3b3JsZFdpZHRoLCB3b3JsZEhlaWdodClcbiAgICB0aGlzLmdhbWUuc3RhZ2UuYmFja2dyb3VuZENvbG9yID0gXCIjMkY5MUQwXCJcblxuICAgIC8vIFNjYWxlIGdhbWUgb24gd2luZG93IHJlc2l6ZVxuICAgIHRoaXMuZ2FtZS5zY2FsZS5zY2FsZU1vZGUgPSBQaGFzZXIuU2NhbGVNYW5hZ2VyLlJFU0laRTtcbiAgICB0aGlzLmdhbWUuc2NhbGUuc2V0U2hvd0FsbCgpO1xuICAgIHRoaXMuZ2FtZS5zY2FsZS5yZWZyZXNoKClcblxuICAgIC8vIFNpbmNlIHdlJ3JlIGp1bXBpbmcgd2UgbmVlZCBncmF2aXR5XG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmdyYXZpdHkueSA9IHRoaXMuR1JBVklUWTtcblxuICAgIC8vIEZsYWcgdG8gdHJhY2sgaWYgdGhlIGp1bXAgYnV0dG9uIGlzIHByZXNzZWRcbiAgICB0aGlzLmp1bXBpbmcgPSBmYWxzZTtcblxuXG4gICAgLyoqXG4gICAgICogTWFwXG4gICAgICovXG4gICAgZm9yZXN0aWEuY3JlYXRlKHRoaXMpXG5cblxuICAgIC8qKlxuICAgICAqIFBsYXllciBTZXR0aW5nc1xuICAgICAqL1xuICAgIHRoaXMucGxheWVyID0gcGxheWVyLmNyZWF0ZS5jYWxsKHRoaXMpXG5cblxuICAgIC8qKlxuICAgICAqIFdlYXBvbnNcbiAgICAgKi9cbiAgICB0aGlzLmN1cnJlbnRXZWFwb24gPSAwO1xuICAgIHRoaXMud2VhcG9ucy5wdXNoKG5ldyB3ZWFwb25zLmFLNDcodGhpcy5nYW1lKSlcbiAgICB0aGlzLndlYXBvbnMucHVzaChuZXcgd2VhcG9ucy5iYXJyZXRNODJBMSh0aGlzLmdhbWUpKVxuXG5cbiAgICAvKipcbiAgICAgKiBUZXh0XG4gICAgICovXG4gICAgbGV0IHRleHRTdHlsZXMgPSB7IGZvbnRTaXplOiAnMjRweCcsIGZpbGw6ICcjMDAwJyB9XG4gICAgdGhpcy5zY29yZVRleHQgPSB0aGlzLmFkZC50ZXh0KDI1LCAyNSwgJ1Njb3JlOiAwJywgdGV4dFN0eWxlcylcbiAgICB0aGlzLnNjb3JlVGV4dC5maXhlZFRvQ2FtZXJhID0gdHJ1ZVxuICAgIHRoaXMud2VhcG9uTmFtZSA9IHRoaXMuYWRkLnRleHQodGhpcy5jYW1lcmEud2lkdGggLSAxMDAsIHRoaXMuY2FtZXJhLmhlaWdodCAtIDQ1LCAnQUstNDcnLCB0ZXh0U3R5bGVzKVxuICAgIHRoaXMud2VhcG9uTmFtZS5maXhlZFRvQ2FtZXJhID0gdHJ1ZVxuICAgIHRoaXMuY3VycmVudEhlYWx0aFRleHQgPSB0aGlzLmFkZC50ZXh0KHRoaXMuY2FtZXJhLnggKyAyNSwgdGhpcy5jYW1lcmEuaGVpZ2h0IC0gNDUsICcxMDAnLCB0ZXh0U3R5bGVzKVxuICAgIHRoaXMuY3VycmVudEhlYWx0aFRleHQuZml4ZWRUb0NhbWVyYSA9IHRydWVcblxuXG4gICAgLyoqXG4gICAgICogQ2FtZXJhIFNldHRpbmdzXG4gICAgICovXG4gICAgdGhpcy5jYW1lcmEuZm9sbG93KHRoaXMucGxheWVyKTtcblxuICAgIHZhciBjaGFuZ2VLZXkgPSB0aGlzLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuRU5URVIpO1xuICAgIGNoYW5nZUtleS5vbkRvd24uYWRkKHRoaXMubmV4dFdlYXBvbiwgdGhpcylcblxuXG4gICAgLyoqXG4gICAgICogUmVzaXppbmcgRXZlbnRzXG4gICAgICovXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICgpID0+IHtcbiAgICAgICAgdGhpcy5nYW1lLnNjYWxlLnJlZnJlc2goKVxuICAgICAgICB0aGlzLmdhbWUuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0XG4gICAgICAgIHRoaXMuZ2FtZS53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXG5cbiAgICAgICAgdGhpcy53ZWFwb25OYW1lLmNhbWVyYU9mZnNldC54ID0gdGhpcy5jYW1lcmEud2lkdGggLSAxMDBcbiAgICAgICAgdGhpcy53ZWFwb25OYW1lLmNhbWVyYU9mZnNldC55ID0gdGhpcy5jYW1lcmEuaGVpZ2h0IC0gNDVcblxuICAgICAgICB0aGlzLnNjb3JlVGV4dC5jYW1lcmFPZmZzZXQueCA9IDI1XG4gICAgICAgIHRoaXMuc2NvcmVUZXh0LmNhbWVyYU9mZnNldC55ID0gMjVcbiAgICB9KVxuXG5cbiAgICAvKipcbiAgICAgKiBTdGFydCBsaXN0ZW5pbmcgZm9yIGV2ZW50c1xuICAgICAqL1xuICAgIHRoaXMuc2V0RXZlbnRIYW5kbGVycygpXG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmdhbWUucmVuZGVyZXIucmVuZGVyU2Vzc2lvbi5yb3VuZFBpeGVscyA9IHRydWVcbiAgICB0aGlzLmdhbWUuc3RhZ2UuZGlzYWJsZVZpc2liaWxpdHlDaGFuZ2UgPSB0cnVlXG4gICAgdGhpcy5waHlzaWNzLnN0YXJ0U3lzdGVtKFBoYXNlci5QaHlzaWNzLkFSQ0FERSlcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMubG9hZC5pbWFnZSgnYnVsbGV0MTEnLCAnL2ltYWdlcy9idWxsZXQxMS5wbmcnKVxuICAgIHRoaXMubG9hZC5pbWFnZSgnYnVsbGV0MTAnLCAnL2ltYWdlcy9idWxsZXQxMC5wbmcnKVxuICAgIHRoaXMubG9hZC5pbWFnZSgnYnVsbGV0OScsICcvaW1hZ2VzL2J1bGxldDkucG5nJylcbiAgICB0aGlzLmxvYWQuaW1hZ2UoJ2J1bGxldDgnLCAnL2ltYWdlcy9idWxsZXQ4LnBuZycpXG4gICAgdGhpcy5sb2FkLmltYWdlKCdidWxsZXQ3JywgJy9pbWFnZXMvYnVsbGV0Ny5wbmcnKVxuICAgIHRoaXMubG9hZC5pbWFnZSgnYnVsbGV0NScsICcvaW1hZ2VzL2J1bGxldDUucG5nJylcbiAgICB0aGlzLmxvYWQuaW1hZ2UoJ2J1bGxldDQnLCAnL2ltYWdlcy9idWxsZXQ0LnBuZycpXG4gICAgdGhpcy5sb2FkLmltYWdlKCd0cmVlc2NhcGUnLCAnL2ltYWdlcy9tYXAtY3RmMS5wbmcnKVxuICAgIHRoaXMubG9hZC5pbWFnZSgnZ3JvdW5kJywgJy9pbWFnZXMvcGxhdGZvcm0ucG5nJylcbiAgICB0aGlzLmxvYWQuc3ByaXRlc2hlZXQoJ2R1ZGUnLCAnL2ltYWdlcy9kdWRlLnBuZycsIDMyLCA0OClcbiAgICB0aGlzLmxvYWQuc3ByaXRlc2hlZXQoJ2VuZW15JywgJy9pbWFnZXMvZHVkZS5wbmcnLCAzMiwgNDgpXG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICAvLyAgQ29sbGlkZSB0aGUgcGxheWVyIGFuZCB0aGUgc3RhcnMgd2l0aCB0aGUgcGxhdGZvcm1zXG4gICAgdGhpcy5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMucGxheWVyLCB0aGlzLnBsYXRmb3JtcylcbiAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5lbmVtaWVzLCB0aGlzLnBsYXRmb3JtcylcbiAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5lbmVteSwgdGhpcy5wbGF0Zm9ybXMpXG4gICAgdGhpcy5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMucGxhdGZvcm1zLCB0aGlzLndlYXBvbnMsIGZ1bmN0aW9uKHBsYXRmb3JtLCB3ZWFwb24pIHtcbiAgICAgICAgd2VhcG9uLmtpbGwoKVxuICAgIH0sIG51bGwsIHRoaXMpO1xuXG4gICAgdGhpcy5lbmVtaWVzLmZvckVhY2goKGVuZW15KSA9PiB7XG4gICAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5vdmVybGFwKGVuZW15LCB0aGlzLndlYXBvbnMsIChlbmVteSwgd2VhcG9uKSA9PiB7XG4gICAgICAgICAgICBlbmVteS5oZWFsdGggLT0gd2VhcG9uLmRhbWFnZVxuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5wbGF5ZXIpXG4gICAgICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdkYW1hZ2VkIHBsYXllcicsIHtcbiAgICAgICAgICAgICAgICBhdHRhY2tpbmdQbGF5ZXJJZDogJy8jJyArIHRoaXMuc29ja2V0LmlkLFxuICAgICAgICAgICAgICAgIGRhbWFnZWRQbGF5ZXJJZDogZW5lbXkuaWQsXG4gICAgICAgICAgICAgICAgZGFtYWdlOiB3ZWFwb24uZGFtYWdlXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgd2VhcG9uLmtpbGwoKVxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1lvdSBoaXQgdGhlbSEnLCBlbmVteS5oZWFsdGgsIHdlYXBvbi5kYW1hZ2UsIGVuZW15KVxuICAgICAgICB9LCBudWxsLCB0aGlzKVxuICAgIH0pXG5cbiAgICBpZiAodGhpcy5sZWZ0SW5wdXRJc0FjdGl2ZSgpKSB7XG4gICAgICAgIC8vIElmIHRoZSBMRUZUIGtleSBpcyBkb3duLCBzZXQgdGhlIHBsYXllciB2ZWxvY2l0eSB0byBtb3ZlIGxlZnRcbiAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5hY2NlbGVyYXRpb24ueCA9IC10aGlzLkFDQ0VMRVJBVElPTjtcbiAgICAgICAgdGhpcy5wbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdsZWZ0JylcbiAgICB9IGVsc2UgaWYgKHRoaXMucmlnaHRJbnB1dElzQWN0aXZlKCkpIHtcbiAgICAgICAgLy8gSWYgdGhlIFJJR0hUIGtleSBpcyBkb3duLCBzZXQgdGhlIHBsYXllciB2ZWxvY2l0eSB0byBtb3ZlIHJpZ2h0XG4gICAgICAgIHRoaXMucGxheWVyLmJvZHkuYWNjZWxlcmF0aW9uLnggPSB0aGlzLkFDQ0VMRVJBVElPTjtcbiAgICAgICAgdGhpcy5wbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdyaWdodCcpXG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gU3RhbmQgc3RpbGxcbiAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5hY2NlbGVyYXRpb24ueCA9IDBcbiAgICAgICAgdGhpcy5wbGF5ZXIuYW5pbWF0aW9ucy5zdG9wKClcbiAgICAgICAgdGhpcy5wbGF5ZXIuZnJhbWUgPSA0XG4gICAgfVxuXG4gICAgLy8gU2V0IGEgdmFyaWFibGUgdGhhdCBpcyB0cnVlIHdoZW4gdGhlIHBsYXllciBpcyB0b3VjaGluZyB0aGUgZ3JvdW5kXG4gICAgdmFyIG9uVGhlR3JvdW5kID0gdGhpcy5wbGF5ZXIuYm9keS50b3VjaGluZy5kb3duO1xuXG4gICAgLy8gSWYgdGhlIHBsYXllciBpcyB0b3VjaGluZyB0aGUgZ3JvdW5kLCBsZXQgaGltIGhhdmUgMiBqdW1wc1xuICAgIGlmIChvblRoZUdyb3VuZCkge1xuICAgICAgICB0aGlzLmp1bXBzID0gMjtcbiAgICAgICAgdGhpcy5qdW1waW5nID0gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gSnVtcCFcbiAgICBpZiAodGhpcy5qdW1wcyA+IDAgJiYgdGhpcy51cElucHV0SXNBY3RpdmUoNSkpIHtcbiAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS52ZWxvY2l0eS55ID0gdGhpcy5KVU1QX1NQRUVEO1xuICAgICAgICB0aGlzLmp1bXBpbmcgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIFJlZHVjZSB0aGUgbnVtYmVyIG9mIGF2YWlsYWJsZSBqdW1wcyBpZiB0aGUganVtcCBpbnB1dCBpcyByZWxlYXNlZFxuICAgIGlmICh0aGlzLmp1bXBpbmcgJiYgdGhpcy51cElucHV0UmVsZWFzZWQoKSkge1xuICAgICAgICB0aGlzLmp1bXBzLS07XG4gICAgICAgIHRoaXMuanVtcGluZyA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8vIEZpcmUgY3VycmVudCB3ZWFwb25cbiAgICBpZiAodGhpcy5nYW1lLmlucHV0LmFjdGl2ZVBvaW50ZXIuaXNEb3duKVxuICAgIHtcbiAgICAgICAgdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0uZmlyZSh0aGlzLnBsYXllcik7XG4gICAgfVxuXG4gICAgdGhpcy5zb2NrZXQuZW1pdCgnbW92ZSBwbGF5ZXInLCB7IHg6IHRoaXMucGxheWVyLngsIHk6IHRoaXMucGxheWVyLnkgfSlcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGd1aWRHZW5lcmF0b3IoKSB7XG4gICAgdmFyIFM0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgcmV0dXJuICgoKDErTWF0aC5yYW5kb20oKSkqMHgxMDAwMCl8MCkudG9TdHJpbmcoMTYpLnN1YnN0cmluZygxKVxuICAgIH1cblxuICAgIHJldHVybiAoUzQoKStTNCgpK1wiLVwiK1M0KCkrXCItXCIrUzQoKStcIi1cIitTNCgpK1wiLVwiK1M0KCkrUzQoKStTNCgpKVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBQbGF5ZXIgPSB7fVxuXG5QbGF5ZXIuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IG5ld1BsYXllciA9IHRoaXMuYWRkLnNwcml0ZSgyMDAsIHRoaXMud29ybGQuaGVpZ2h0IC0gNDAwLCAnZHVkZScpO1xuXG4gICAgLy8gIFdlIG5lZWQgdG8gZW5hYmxlIHBoeXNpY3Mgb24gdGhlIHBsYXllclxuICAgIHRoaXMucGh5c2ljcy5hcmNhZGUuZW5hYmxlKG5ld1BsYXllcik7XG5cbiAgICAvLyBFbmFibGUgcGh5c2ljcyBvbiB0aGUgcGxheWVyXG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuZW5hYmxlKG5ld1BsYXllciwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcblxuICAgIC8vIE1ha2UgcGxheWVyIGNvbGxpZGUgd2l0aCB3b3JsZCBib3VuZGFyaWVzIHNvIGhlIGRvZXNuJ3QgbGVhdmUgdGhlIHN0YWdlXG4gICAgbmV3UGxheWVyLmJvZHkuY29sbGlkZVdvcmxkQm91bmRzID0gdHJ1ZTtcblxuICAgIC8vIFNldCBwbGF5ZXIgbWluaW11bSBhbmQgbWF4aW11bSBtb3ZlbWVudCBzcGVlZFxuICAgIG5ld1BsYXllci5ib2R5Lm1heFZlbG9jaXR5LnNldFRvKHRoaXMuTUFYX1NQRUVELCB0aGlzLk1BWF9TUEVFRCAqIDEwKTsgLy8geCwgeVxuXG4gICAgLy8gQWRkIGRyYWcgdG8gdGhlIHBsYXllciB0aGF0IHNsb3dzIHRoZW0gZG93biB3aGVuIHRoZXkgYXJlIG5vdCBhY2NlbGVyYXRpbmdcbiAgICBuZXdQbGF5ZXIuYm9keS5kcmFnLnNldFRvKHRoaXMuRFJBRywgMCk7IC8vIHgsIHlcblxuICAgIC8vICBPdXIgdHdvIGFuaW1hdGlvbnMsIHdhbGtpbmcgbGVmdCBhbmQgcmlnaHQuXG4gICAgbmV3UGxheWVyLmFuaW1hdGlvbnMuYWRkKCdsZWZ0JywgWzAsIDEsIDIsIDNdLCAxMCwgdHJ1ZSlcbiAgICBuZXdQbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ3JpZ2h0JywgWzUsIDYsIDcsIDhdLCAxMCwgdHJ1ZSlcbiAgICBuZXdQbGF5ZXIuc2NvcmUgPSAwXG5cbiAgICByZXR1cm4gbmV3UGxheWVyXG59XG5cbm1vZHVsZS5leHBvcnRzID0gUGxheWVyXG4iLCIndXNlIHN0cmljdCdcblxubGV0IFJlbW90ZVBsYXllciA9IHt9XG5cblJlbW90ZVBsYXllci5jcmVhdGUgPSBmdW5jdGlvbihjb25maWcpIHtcbiAgICAvLyBBZGQgbmV3IHBsYXllciB0byB0aGUgcmVtb3RlIHBsYXllcnMgYXJyYXlcbiAgICBsZXQgbmV3UmVtb3RlUGxheWVyID0gdGhpcy5hZGQuc3ByaXRlKGNvbmZpZy54LCBjb25maWcueSwgJ2R1ZGUnKTtcbiAgICBuZXdSZW1vdGVQbGF5ZXIuaWQgPSBjb25maWcuaWRcblxuICAgIG5ld1JlbW90ZVBsYXllci5sYXN0UG9zaXRpb24gPSB7XG4gICAgICAgIHg6IGNvbmZpZy54LFxuICAgICAgICB5OiBjb25maWcueVxuICAgIH1cblxuICAgIC8vICBXZSBuZWVkIHRvIGVuYWJsZSBwaHlzaWNzIG9uIHRoZSBwbGF5ZXJcbiAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmVuYWJsZShuZXdSZW1vdGVQbGF5ZXIpXG5cbiAgICAvLyBFbmFibGUgcGh5c2ljcyBvbiB0aGUgcGxheWVyXG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuZW5hYmxlKG5ld1JlbW90ZVBsYXllciwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKVxuXG4gICAgLy8gTWFrZSBwbGF5ZXIgY29sbGlkZSB3aXRoIHdvcmxkIGJvdW5kYXJpZXMgc28gaGUgZG9lc24ndCBsZWF2ZSB0aGUgc3RhZ2VcbiAgICBuZXdSZW1vdGVQbGF5ZXIuYm9keS5jb2xsaWRlV29ybGRCb3VuZHMgPSB0cnVlO1xuXG4gICAgLy8gU2V0IHBsYXllciBtaW5pbXVtIGFuZCBtYXhpbXVtIG1vdmVtZW50IHNwZWVkXG4gICAgbmV3UmVtb3RlUGxheWVyLmJvZHkubWF4VmVsb2NpdHkuc2V0VG8odGhpcy5NQVhfU1BFRUQsIHRoaXMuTUFYX1NQRUVEICogMTApOyAvLyB4LCB5XG5cbiAgICAvLyBBZGQgZHJhZyB0byB0aGUgcGxheWVyIHRoYXQgc2xvd3MgdGhlbSBkb3duIHdoZW4gdGhleSBhcmUgbm90IGFjY2VsZXJhdGluZ1xuICAgIG5ld1JlbW90ZVBsYXllci5ib2R5LmRyYWcuc2V0VG8odGhpcy5EUkFHLCAwKTsgLy8geCwgeVxuXG4gICAgbmV3UmVtb3RlUGxheWVyLmhlYWx0aCA9IDEwMFxuXG4gICAgbmV3UmVtb3RlUGxheWVyLmFuaW1hdGlvbnMuYWRkKCdsZWZ0JywgWzAsIDEsIDIsIDNdLCAxMCwgdHJ1ZSlcbiAgICBuZXdSZW1vdGVQbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ3JpZ2h0JywgWzUsIDYsIDcsIDhdLCAxMCwgdHJ1ZSlcblxuICAgIHJldHVybiBuZXdSZW1vdGVQbGF5ZXJcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBSZW1vdGVQbGF5ZXJcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgQnVsbGV0ID0gcmVxdWlyZSgnLi4vQnVsbGV0JylcblxubGV0IEFLNDcgPSBmdW5jdGlvbiAoZ2FtZSkge1xuICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGdhbWUsIGdhbWUud29ybGQsICdBSy00NycsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuXG4gICAgdGhpcy5uYW1lID0gJ0FLLTQ3J1xuICAgIHRoaXMuZGFtYWdlID0gMjJcbiAgICB0aGlzLm5leHRGaXJlID0gMFxuICAgIHRoaXMuYnVsbGV0U3BlZWQgPSAxNTAwXG5cbiAgICAvLyBBSzQ3IGZpcmVzIGFib3V0IDYwMCBidWxsZXRzIHBlciBzZWNvbmRcbiAgICB0aGlzLmZpcmVSYXRlID0gMTY2LjY2NjY2N1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA2NDsgaSsrKVxuICAgIHtcbiAgICAgICAgbGV0IGJ1bGxldCA9IG5ldyBCdWxsZXQodGhpcy5nYW1lLCAnZ3JvdW5kJylcbiAgICAgICAgYnVsbGV0LmhlaWdodCA9IDNcbiAgICAgICAgYnVsbGV0LndpZHRoID0gMTBcbiAgICAgICAgYnVsbGV0LmRhbWFnZSA9IDIyXG5cbiAgICAgICAgdGhpcy5hZGQoYnVsbGV0LCB0cnVlKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG59XG5cbkFLNDcucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcbkFLNDcucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQUs0NztcblxuQUs0Ny5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uIChzb3VyY2UpIHtcbiAgICBpZiAodGhpcy5nYW1lLnRpbWUudGltZSA8IHRoaXMubmV4dEZpcmUpXG4gICAgICAgIHJldHVyblxuXG4gICAgdmFyIHggPSBzb3VyY2UueCArIDE1O1xuICAgIHZhciB5ID0gc291cmNlLnkgKyAzMDtcblxuICAgIHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgMClcbiAgICB0aGlzLnNldEFsbCgndHJhY2tpbmcnLCB0cnVlKVxuXG4gICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMuZ2FtZS50aW1lLnRpbWUgKyB0aGlzLmZpcmVSYXRlXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQUs0N1xuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBCdWxsZXQgPSByZXF1aXJlKCcuLi9CdWxsZXQnKVxuXG5sZXQgYmFycmV0TTgyQTEgPSBmdW5jdGlvbiAoZ2FtZSkge1xuICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGdhbWUsIGdhbWUud29ybGQsICdBSy00NycsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuXG4gICAgdGhpcy5uYW1lID0gJ0JhcnJldCBNODJBMSdcbiAgICB0aGlzLmRhbWFnZSA9IDg4XG4gICAgdGhpcy5uZXh0RmlyZSA9IDBcbiAgICB0aGlzLmJ1bGxldFNwZWVkID0gMzQzNVxuXG4gICAgLy8gYmFycmV0TTgyQTEgZmlyZXMgYWJvdXQgNjAwIGJ1bGxldHMgcGVyIHNlY29uZFxuICAgIHRoaXMuZmlyZVJhdGUgPSA0MDAwXG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDY0OyBpKyspXG4gICAge1xuICAgICAgICBsZXQgYnVsbGV0ID0gbmV3IEJ1bGxldCh0aGlzLmdhbWUsICdncm91bmQnKVxuICAgICAgICBidWxsZXQuaGVpZ2h0ID0gM1xuICAgICAgICBidWxsZXQud2lkdGggPSAxMFxuICAgICAgICBidWxsZXQuZGFtYWdlID0gODhcblxuICAgICAgICB0aGlzLmFkZChidWxsZXQsIHRydWUpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbn1cblxuYmFycmV0TTgyQTEucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcbmJhcnJldE04MkExLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGJhcnJldE04MkExO1xuXG5iYXJyZXRNODJBMS5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uIChzb3VyY2UpIHtcbiAgICBpZiAodGhpcy5nYW1lLnRpbWUudGltZSA8IHRoaXMubmV4dEZpcmUpXG4gICAgICAgIHJldHVyblxuXG4gICAgdmFyIHggPSBzb3VyY2UueCArIDE1O1xuICAgIHZhciB5ID0gc291cmNlLnkgKyAzMDtcblxuICAgIHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgMClcbiAgICB0aGlzLnNldEFsbCgndHJhY2tpbmcnLCB0cnVlKVxuXG4gICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMuZ2FtZS50aW1lLnRpbWUgKyB0aGlzLmZpcmVSYXRlXG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFycmV0TTgyQTFcbiIsIid1c2Ugc3RyaWN0J1xuXG4vKipcbiAqIFByaW1hcnkgV2VhcG9uc1xuICogMS4gRGVzZXJ0IEVhZ2xlc1xuICogMi4gSEsgTVA1XG4gKiAzLiBBSzQ3XG4gKiA0LiBNMTZcbiAqIDUuIFNwYXMtMTJcbiAqIDYuIFJ1Z2VyIDc3XG4gKiA3LiBNNzlcbiAqIDguIEJhcnJldCBNODJBMVxuICogOS4gRk4gTWluaW1pXG4gKiAxMC4gWE0yMTQgTWluaWd1blxuICovXG5cbi8qKlxuICogU2Vjb25kYXJ5IFdlYXBvbnNcbiAqIDEuIFVTU09DT01cbiAqIDIuIENvbWJhdCBLbmlmZVxuICogMy4gQ2hhaW5zYXdcbiAqIDQuIE03MiBMYXdcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBhSzQ3OiByZXF1aXJlKCcuL2FLNDcnKSxcbiAgICBiYXJyZXRNODJBMTogcmVxdWlyZSgnLi9iYXJyZXRNODJBMScpXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IE1hcEN0ZjEgPSB7fVxuXG5NYXBDdGYxLmNyZWF0ZSA9IGZ1bmN0aW9uKHNjb3BlKSB7XG4gICAgdGhpcy5zY29wZSA9IHNjb3BlXG5cbiAgICB0aGlzLmNyZWF0ZVNreVNwcml0ZSgpXG4gICAgdGhpcy5jcmVhdGVQbGF0Zm9ybXMoKVxuICAgIHRoaXMuY3JlYXRlTGVkZ2VzKClcblxuICAgIHRoaXMuc2NvcGUucGxhdGZvcm1zLnNldEFsbCgnYm9keS5pbW1vdmFibGUnLCB0cnVlKVxuICAgIHRoaXMuc2NvcGUucGxhdGZvcm1zLnNldEFsbCgnYm9keS5hbGxvd0dyYXZpdHknLCBmYWxzZSlcbn1cblxuTWFwQ3RmMS5jcmVhdGVMZWRnZXMgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgbGVkZ2VzID0gW1xuICAgICAgICAvLyB7eCwgeSwgd2lkdGgsIGhlaWdodH1cblxuICAgICAgICAvLyBTdGFydGluZyBMZWRnZXNcbiAgICAgICAgeyBpZDogMSwgeDogMCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDQzMSwgd2lkdGg6IDEyOCwgaGVpZ2h0OiA5MiB9LCAvLyBMZWZ0IGJvdHRvbSBsZWRnZVxuICAgICAgICB7IGlkOiAyLCB4OiAwLCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gODM4LCB3aWR0aDogMTI4LCBoZWlnaHQ6IDkyIH0sIC8vIExlZnQgdG9wIGxlZGdlXG5cbiAgICAgICAgeyBpZDogMywgeDogMzg3MiwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDQyNywgd2lkdGg6IDEyOCwgaGVpZ2h0OiA5MiB9LCAvLyBSaWdodCBib3R0b20gbGVkZ2VcbiAgICAgICAgeyBpZDogNCwgeDogMzg3MiwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDgzNSwgd2lkdGg6IDEyOCwgaGVpZ2h0OiA5MiB9LCAvLyBSaWdodCB0b3AgbGVkZ2VcblxuICAgICAgICAvLyBHcm91bmQgTGVkZ2VzXG4gICAgICAgIHsgaWQ6IDUsIHg6IDAsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSAxMjgsIHdpZHRoOiA0NzQsIGhlaWdodDogMTI4IH0sIC8vIE1haW4gYm90dG9tIHN0YXJ0aW5nIGxlZnQgbGVkZ2VcbiAgICAgICAgeyBpZDogNiwgeDogNDc0LCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gMjU2LCB3aWR0aDogNjQxLCBoZWlnaHQ6IDI2MCB9LCAvLyBNYWluIGJvdHRvbSBsZWZ0IGxlZGdlXG4gICAgICAgIHsgaWQ6IDcsIHg6IDExMTUsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSAzODQsIHdpZHRoOiAxNzg1LCBoZWlnaHQ6IDM5MCB9LCAvLyBNYWluIGJvdHRvbSBjZW50ZXIgbGVkZ2VcbiAgICAgICAgeyBpZDogOCwgeDogMjkwMCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDI1Niwgd2lkdGg6IDY0MSwgaGVpZ2h0OiAyNjAgfSwgLy8gTWFpbiBib3R0b20gcmlnaHQgbGVkZ2VcbiAgICAgICAgeyBpZDogOSwgeDogMzU0MCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDEyOCwgd2lkdGg6IDQ3NCwgaGVpZ2h0OiAxMjggfSwgLy8gTWFpbiBib3R0b20gc3RhcnRpbmcgcmlnaHQgbGVkZ2VcblxuICAgICAgICAvLyBBaXIgTGVkZ2VzXG4gICAgICAgIHsgaWQ6IDEwLCB4OiAzMDAsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA2MDgsIHdpZHRoOiA2NDEsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogMTEsIHg6IDExMTAsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA3MDEsIHdpZHRoOiA1MTMsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogMTIsIHg6IDg3MCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDk4Miwgd2lkdGg6IDI1NiwgaGVpZ2h0OiA5MiB9LFxuICAgICAgICB7IGlkOiAxMywgeDogMTc0NCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDg3NCwgd2lkdGg6IDUwNywgaGVpZ2h0OiAyNTQgfSxcbiAgICAgICAgeyBpZDogMTQsIHg6IDIzOTAsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA2ODksIHdpZHRoOiA1MTMsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogMTUsIHg6IDMwMzEsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA2MDgsIHdpZHRoOiA2NDEsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogMTYsIHg6IDI5MDMsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA5NTcsIHdpZHRoOiAyNTYsIGhlaWdodDogOTIgfVxuICAgIF1cblxuXG4gICAgbGVkZ2VzLmZvckVhY2goKGxlZGdlKSA9PiB7XG4gICAgICAgIC8vIHZhciBuZXdMZWRnZSA9IHRoaXMuc2NvcGUucGxhdGZvcm1zLmNyZWF0ZShsZWRnZS54LCBsZWRnZS55LCAnZ3JvdW5kJylcbiAgICAgICAgdmFyIG5ld0xlZGdlID0gdGhpcy5zY29wZS5wbGF0Zm9ybXMuY3JlYXRlKGxlZGdlLngsIGxlZGdlLnkpXG4gICAgICAgIG5ld0xlZGdlLmhlaWdodCA9IGxlZGdlLmhlaWdodFxuICAgICAgICBuZXdMZWRnZS53aWR0aCA9IGxlZGdlLndpZHRoXG5cbiAgICAgICAgLy8gRGVidWcgc3R1ZmZcbiAgICAgICAgLy8gbmV3TGVkZ2UuYWxwaGEgPSAwLjJcbiAgICAgICAgLy8gbGV0IHN0eWxlID0geyBmb250OiBcIjIwcHggQXJpYWxcIiwgZmlsbDogXCIjZmYwMDQ0XCIsIGFsaWduOiBcImNlbnRlclwiLCBiYWNrZ3JvdW5kQ29sb3I6IFwiI2ZmZmYwMFwiIH1cbiAgICAgICAgLy8gbGV0IHRleHQgPSB0aGlzLnNjb3BlLmdhbWUuYWRkLnRleHQobGVkZ2UueCwgbGVkZ2UueSwgbGVkZ2UuaWQsIHN0eWxlKVxuICAgICAgICAvLyB0ZXh0LmFscGhhID0gMC4yXG4gICAgfSlcbn1cblxuTWFwQ3RmMS5jcmVhdGVTa3lTcHJpdGUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNjb3BlLmFkZC50aWxlU3ByaXRlKDAsIHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSAxNTAwLCB0aGlzLnNjb3BlLmdhbWUud29ybGQud2lkdGgsIDE1MDAsICd0cmVlc2NhcGUnKVxufVxuXG5NYXBDdGYxLmNyZWF0ZVBsYXRmb3JtcyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2NvcGUucGxhdGZvcm1zID0gdGhpcy5zY29wZS5hZGQuZ3JvdXAoKVxuICAgIHRoaXMuc2NvcGUucGxhdGZvcm1zLmVuYWJsZUJvZHkgPSB0cnVlXG59XG5cbm1vZHVsZS5leHBvcnRzID0gTWFwQ3RmMVxuIl19
