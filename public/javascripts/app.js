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

        // A player has died
        this.socket.on('dead player', this.onDeadPlayer.bind(this));

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
            clientId: this.clientId,
            x: this.player.x,
            y: this.player.y
        });
    },

    // Socket disconnected
    onSocketDisconnect: function onSocketDisconnect() {
        console.log('Disconnected from socket server');
    },

    // New player
    onNewPlayer: function onNewPlayer(data) {
        console.log('New player connected:', data.id);

        // Avoid possible duplicate players
        var duplicate = _.find(this.enemies, { id: data.id });
        if (duplicate || data.id === this.socket.id) {
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
        if (data.deadPlayerId !== this.socket.id) return;

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

        if (movePlayer.x > movePlayer.lastPosition.x) {
            movePlayer.animations.play('right');
        } else if (movePlayer.x < movePlayer.lastPosition.x) {
            movePlayer.animations.play('left');
        } else {
            movePlayer.animations.stop();
            movePlayer.frame = 4;
        }

        movePlayer.lastPosition.x = movePlayer.x;
        movePlayer.lastPosition.y = movePlayer.y;
    },

    // Remove player
    onRemovePlayer: function onRemovePlayer(data) {
        var removePlayer = _.find(this.enemies, { id: data.id });

        // Player not found
        if (!removePlayer) {
            console.log('Player not found: ', data);
            _.remove(this.enemies, { id: data.id });
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
                attackingPlayerId: _this.player.id,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvYXBwLmpzIiwiYXNzZXRzL2pzL2xpYi9CdWxsZXQuanMiLCJhc3NldHMvanMvbGliL2NsaWVudElucHV0SGFuZGxlci5qcyIsImFzc2V0cy9qcy9saWIvY2xpZW50U29ja2V0SGFuZGxlci5qcyIsImFzc2V0cy9qcy9saWIvZ2FtZS9jcmVhdGUuanMiLCJhc3NldHMvanMvbGliL2dhbWUvaW5pdC5qcyIsImFzc2V0cy9qcy9saWIvZ2FtZS9wcmVsb2FkLmpzIiwiYXNzZXRzL2pzL2xpYi9nYW1lL3VwZGF0ZS5qcyIsImFzc2V0cy9qcy9saWIvZ3VpZC5qcyIsImFzc2V0cy9qcy9saWIvcGxheWVyLmpzIiwiYXNzZXRzL2pzL2xpYi9yZW1vdGVQbGF5ZXIuanMiLCJhc3NldHMvanMvbGliL3dlYXBvbnMvYUs0Ny5qcyIsImFzc2V0cy9qcy9saWIvd2VhcG9ucy9iYXJyZXRNODJBMS5qcyIsImFzc2V0cy9qcy9saWIvd2VhcG9ucy9pbmRleC5qcyIsImFzc2V0cy9qcy9tYXBzL2ZvcmVzdGlhLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7O0FBRUEsSUFBSSxPQUFPLFFBQVEsWUFBUixDQUFQOzs7QUFHSixJQUFJLE9BQU8sUUFBUSxpQkFBUixDQUFQO0FBQ0osSUFBSSxVQUFVLFFBQVEsb0JBQVIsQ0FBVjtBQUNKLElBQUksU0FBUyxRQUFRLG1CQUFSLENBQVQ7QUFDSixJQUFJLFNBQVMsUUFBUSxtQkFBUixDQUFUOztBQUVKLElBQUksc0JBQXNCLFFBQVEsMkJBQVIsQ0FBdEI7QUFDSixJQUFJLG9CQUFvQixRQUFRLDBCQUFSLENBQXBCOztBQUVKLElBQUksWUFBWSxPQUFPLFVBQVA7QUFDaEIsSUFBSSxhQUFhLE9BQU8sV0FBUDtBQUNqQixJQUFJLE9BQU8sSUFBSSxPQUFPLElBQVAsQ0FBWSxTQUFoQixFQUEyQixVQUEzQixFQUF1QyxPQUFP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QVgsQ0FBcUIsVUFBckIsR0FBa0MsSUFBbEMsQ0FGaUM7Q0FBWDs7QUFLMUIsT0FBTyxPQUFQLEdBQWlCLE9BQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ3VpZCA9IHJlcXVpcmUoJy4vbGliL2d1aWQnKVxuXG4vLyBHYW1lIGZ1bmN0aW9uc1xubGV0IGluaXQgPSByZXF1aXJlKCcuL2xpYi9nYW1lL2luaXQnKVxubGV0IHByZWxvYWQgPSByZXF1aXJlKCcuL2xpYi9nYW1lL3ByZWxvYWQnKVxubGV0IGNyZWF0ZSA9IHJlcXVpcmUoJy4vbGliL2dhbWUvY3JlYXRlJylcbmxldCB1cGRhdGUgPSByZXF1aXJlKCcuL2xpYi9nYW1lL3VwZGF0ZScpXG5cbmxldCBjbGllbnRTb2NrZXRIYW5kbGVyID0gcmVxdWlyZSgnLi9saWIvY2xpZW50U29ja2V0SGFuZGxlcicpXG5sZXQgY2xpZW5JbnB1dEhhbmRsZXIgPSByZXF1aXJlKCcuL2xpYi9jbGllbnRJbnB1dEhhbmRsZXInKVxuXG52YXIgZ2FtZVdpZHRoID0gd2luZG93LmlubmVyV2lkdGhcbnZhciBnYW1lSGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0XG52YXIgZ2FtZSA9IG5ldyBQaGFzZXIuR2FtZShnYW1lV2lkdGgsIGdhbWVIZWlnaHQsIFBoYXNlci5BVVRPLCAncmFuZ2VyLXN0ZXZlLWdhbWUnKTtcblxudmFyIFJhbmdlclN0ZXZlR2FtZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY2xpZW50SWQgPSBndWlkKClcbiAgICB0aGlzLmN1cnJlbnRXZWFwb24gPSAwO1xuICAgIHRoaXMuZW5lbWllcyA9IFtdXG4gICAgdGhpcy5nYW1lID0gZ2FtZVxuICAgIHRoaXMuZ3JvdW5kXG4gICAgdGhpcy5wbGF0Zm9ybXNcbiAgICB0aGlzLnBsYXllclxuICAgIHRoaXMuc2NvcmUgPSAwXG4gICAgdGhpcy5zY29yZVRleHRcbiAgICB0aGlzLnNvY2tldFxuICAgIHRoaXMud2VhcG9uTmFtZSA9IG51bGw7XG4gICAgdGhpcy53ZWFwb25zID0gW107XG59XG5cblJhbmdlclN0ZXZlR2FtZS5wcm90b3R5cGUgPSB7XG4gICAgLy8gR2FtZSBmdW5jdGlvbnNcbiAgICBpbml0LFxuICAgIHByZWxvYWQsXG4gICAgY3JlYXRlLFxuICAgIHVwZGF0ZSxcblxuICAgIC8vIFNvY2tldCBldmVudHNcbiAgICBzZXRFdmVudEhhbmRsZXJzOiBjbGllbnRTb2NrZXRIYW5kbGVyLnNldEV2ZW50SGFuZGxlcnMsXG4gICAgb25Tb2NrZXRDb25uZWN0ZWQ6IGNsaWVudFNvY2tldEhhbmRsZXIub25Tb2NrZXRDb25uZWN0ZWQsXG4gICAgb25Tb2NrZXREaXNjb25uZWN0OiBjbGllbnRTb2NrZXRIYW5kbGVyLm9uU29ja2V0RGlzY29ubmVjdCxcbiAgICBvbk5ld1BsYXllcjogY2xpZW50U29ja2V0SGFuZGxlci5vbk5ld1BsYXllcixcbiAgICBvbkRlYWRQbGF5ZXI6IGNsaWVudFNvY2tldEhhbmRsZXIub25EZWFkUGxheWVyLFxuICAgIG9uTW92ZVBsYXllcjogY2xpZW50U29ja2V0SGFuZGxlci5vbk1vdmVQbGF5ZXIsXG4gICAgb25SZW1vdmVQbGF5ZXI6IGNsaWVudFNvY2tldEhhbmRsZXIub25SZW1vdmVQbGF5ZXIsXG5cbiAgICAvLyBJbnB1dCBjb250cm9sc1xuICAgIGxlZnRJbnB1dElzQWN0aXZlOiBjbGllbklucHV0SGFuZGxlci5sZWZ0SW5wdXRJc0FjdGl2ZSxcbiAgICByaWdodElucHV0SXNBY3RpdmU6IGNsaWVuSW5wdXRIYW5kbGVyLnJpZ2h0SW5wdXRJc0FjdGl2ZSxcbiAgICB1cElucHV0SXNBY3RpdmU6IGNsaWVuSW5wdXRIYW5kbGVyLnVwSW5wdXRJc0FjdGl2ZSxcbiAgICB1cElucHV0UmVsZWFzZWQ6IGNsaWVuSW5wdXRIYW5kbGVyLnVwSW5wdXRSZWxlYXNlZCxcblxuICAgIG5leHRXZWFwb246IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyAgVGlkeS11cCB0aGUgY3VycmVudCB3ZWFwb25cbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFdlYXBvbiA+IDkpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLnJlc2V0KCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS5jYWxsQWxsKCdyZXNldCcsIG51bGwsIDAsIDApO1xuICAgICAgICAgICAgdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0uc2V0QWxsKCdleGlzdHMnLCBmYWxzZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyAgQWN0aXZhdGUgdGhlIG5ldyBvbmVcbiAgICAgICAgdGhpcy5jdXJyZW50V2VhcG9uKys7XG5cbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFdlYXBvbiA9PT0gdGhpcy53ZWFwb25zLmxlbmd0aClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50V2VhcG9uID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLnZpc2libGUgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMud2VhcG9uTmFtZS50ZXh0ID0gdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0ubmFtZVxuICAgIH1cbn1cblxuZ2FtZS5zdGF0ZS5hZGQoJ0dhbWUnLCBSYW5nZXJTdGV2ZUdhbWUsIHRydWUpXG4iLCIndXNlIHN0cmljdCdcblxudmFyIEJ1bGxldCA9IGZ1bmN0aW9uIChnYW1lLCBrZXkpIHtcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgMCwgMCwga2V5KVxuXG4gICAgdGhpcy50ZXh0dXJlLmJhc2VUZXh0dXJlLnNjYWxlTW9kZSA9IFBJWEkuc2NhbGVNb2Rlcy5ORUFSRVNUXG5cbiAgICB0aGlzLmFuY2hvci5zZXQoMC41KVxuXG4gICAgdGhpcy5jaGVja1dvcmxkQm91bmRzID0gdHJ1ZVxuICAgIHRoaXMub3V0T2ZCb3VuZHNLaWxsID0gdHJ1ZVxuICAgIHRoaXMuZXhpc3RzID0gZmFsc2VcblxuICAgIHRoaXMudHJhY2tpbmcgPSBmYWxzZVxuICAgIHRoaXMuc2NhbGVTcGVlZCA9IDBcbn1cblxuQnVsbGV0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpXG5CdWxsZXQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQnVsbGV0XG5cbkJ1bGxldC5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uICh4LCB5LCBhbmdsZSwgc3BlZWQsIGd4LCBneSkge1xuICAgIGd4ID0gZ3ggfHwgMFxuICAgIGd5ID0gZ3kgfHwgMFxuICAgIHRoaXMucmVzZXQoeCwgeSlcbiAgICAvLyB0aGlzLnNjYWxlLnNldCgxKVxuXG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLm1vdmVUb1BvaW50ZXIodGhpcywgc3BlZWQpXG4gICAgY29uc29sZS5sb2coKVxuICAgIHRoaXMuYm9keS5ncmF2aXR5LnkgPSAtMTgwMFxufVxuXG5CdWxsZXQucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy50cmFja2luZylcbiAgICB7XG4gICAgICAgIHRoaXMucm90YXRpb24gPSBNYXRoLmF0YW4yKHRoaXMuYm9keS52ZWxvY2l0eS55LCB0aGlzLmJvZHkudmVsb2NpdHkueCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc2NhbGVTcGVlZCA+IDApXG4gICAge1xuICAgICAgICB0aGlzLnNjYWxlLnggKz0gdGhpcy5zY2FsZVNwZWVkO1xuICAgICAgICB0aGlzLnNjYWxlLnkgKz0gdGhpcy5zY2FsZVNwZWVkO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCdWxsZXRcbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvLyBUaGlzIGZ1bmN0aW9uIHNob3VsZCByZXR1cm4gdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgYWN0aXZhdGVzIHRoZSBcImdvIGxlZnRcIiBjb250cm9sXG4gICAgLy8gSW4gdGhpcyBjYXNlLCBlaXRoZXIgaG9sZGluZyB0aGUgcmlnaHQgYXJyb3cgb3IgdGFwcGluZyBvciBjbGlja2luZyBvbiB0aGUgbGVmdFxuICAgIC8vIHNpZGUgb2YgdGhlIHNjcmVlbi5cbiAgICBsZWZ0SW5wdXRJc0FjdGl2ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlucHV0LmtleWJvYXJkLmlzRG93bihQaGFzZXIuS2V5Ym9hcmQuQSlcbiAgICB9LFxuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiBzaG91bGQgcmV0dXJuIHRydWUgd2hlbiB0aGUgcGxheWVyIGFjdGl2YXRlcyB0aGUgXCJnbyByaWdodFwiIGNvbnRyb2xcbiAgICAvLyBJbiB0aGlzIGNhc2UsIGVpdGhlciBob2xkaW5nIHRoZSByaWdodCBhcnJvdyBvciB0YXBwaW5nIG9yIGNsaWNraW5nIG9uIHRoZSByaWdodFxuICAgIC8vIHNpZGUgb2YgdGhlIHNjcmVlbi5cbiAgICByaWdodElucHV0SXNBY3RpdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnB1dC5rZXlib2FyZC5pc0Rvd24oUGhhc2VyLktleWJvYXJkLkQpXG4gICAgfSxcblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gc2hvdWxkIHJldHVybiB0cnVlIHdoZW4gdGhlIHBsYXllciBhY3RpdmF0ZXMgdGhlIFwianVtcFwiIGNvbnRyb2xcbiAgICAvLyBJbiB0aGlzIGNhc2UsIGVpdGhlciBob2xkaW5nIHRoZSB1cCBhcnJvdyBvciB0YXBwaW5nIG9yIGNsaWNraW5nIG9uIHRoZSBjZW50ZXJcbiAgICAvLyBwYXJ0IG9mIHRoZSBzY3JlZW4uXG4gICAgdXBJbnB1dElzQWN0aXZlOiBmdW5jdGlvbihkdXJhdGlvbikge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnB1dC5rZXlib2FyZC5kb3duRHVyYXRpb24oUGhhc2VyLktleWJvYXJkLlcsIGR1cmF0aW9uKTtcbiAgICB9LFxuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiByZXR1cm5zIHRydWUgd2hlbiB0aGUgcGxheWVyIHJlbGVhc2VzIHRoZSBcImp1bXBcIiBjb250cm9sXG4gICAgdXBJbnB1dFJlbGVhc2VkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5wdXQua2V5Ym9hcmQudXBEdXJhdGlvbihQaGFzZXIuS2V5Ym9hcmQuVyk7XG4gICAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCByZW1vdGVQbGF5ZXIgPSByZXF1aXJlKCcuL3JlbW90ZVBsYXllcicpXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHNldEV2ZW50SGFuZGxlcnM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gU29ja2V0IGNvbm5lY3Rpb24gc3VjY2Vzc2Z1bFxuICAgICAgICB0aGlzLnNvY2tldC5vbignY29ubmVjdCcsIHRoaXMub25Tb2NrZXRDb25uZWN0ZWQuYmluZCh0aGlzKSlcblxuICAgICAgICAvLyBTb2NrZXQgZGlzY29ubmVjdGlvblxuICAgICAgICB0aGlzLnNvY2tldC5vbignZGlzY29ubmVjdCcsIHRoaXMub25Tb2NrZXREaXNjb25uZWN0LmJpbmQodGhpcykpXG5cbiAgICAgICAgLy8gTmV3IHBsYXllciBtZXNzYWdlIHJlY2VpdmVkXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCduZXcgcGxheWVyJywgdGhpcy5vbk5ld1BsYXllci5iaW5kKHRoaXMpKVxuXG4gICAgICAgIC8vIFBsYXllciBtb3ZlIG1lc3NhZ2UgcmVjZWl2ZWRcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ21vdmUgcGxheWVyJywgdGhpcy5vbk1vdmVQbGF5ZXIuYmluZCh0aGlzKSlcblxuICAgICAgICAvLyBQbGF5ZXIgcmVtb3ZlZCBtZXNzYWdlIHJlY2VpdmVkXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdyZW1vdmUgcGxheWVyJywgdGhpcy5vblJlbW92ZVBsYXllci5iaW5kKHRoaXMpKVxuXG4gICAgICAgIC8vIEEgcGxheWVyIGhhcyBkaWVkXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdkZWFkIHBsYXllcicsIHRoaXMub25EZWFkUGxheWVyLmJpbmQodGhpcykpXG5cbiAgICAgICAgY29uc29sZS5sb2coJ1NvY2tldCBldmVudHMgaW5pdGlhbGl6ZWQuJylcbiAgICB9LFxuXG4gICAgLy8gU29ja2V0IGNvbm5lY3RlZFxuICAgIG9uU29ja2V0Q29ubmVjdGVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0Nvbm5lY3RlZCB0byBzb2NrZXQgc2VydmVyJylcblxuICAgICAgICAgLy8gUmVzZXQgZW5lbWllcyBvbiByZWNvbm5lY3RcbiAgICAgICAgdGhpcy5lbmVtaWVzLmZvckVhY2goZnVuY3Rpb24gKGVuZW15KSB7XG4gICAgICAgICAgICBlbmVteS5wbGF5ZXIua2lsbCgpXG4gICAgICAgIH0pXG4gICAgICAgIHRoaXMuZW5lbWllcyA9IFtdXG5cbiAgICAgICAgLy8gU2VuZCBsb2NhbCBwbGF5ZXIgZGF0YSB0byB0aGUgZ2FtZSBzZXJ2ZXJcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnbmV3IHBsYXllcicsIHtcbiAgICAgICAgICAgIGNsaWVudElkOiB0aGlzLmNsaWVudElkLFxuICAgICAgICAgICAgeDogdGhpcy5wbGF5ZXIueCxcbiAgICAgICAgICAgIHk6IHRoaXMucGxheWVyLnlcbiAgICAgICAgfSlcbiAgICB9LFxuXG4gICAgLy8gU29ja2V0IGRpc2Nvbm5lY3RlZFxuICAgIG9uU29ja2V0RGlzY29ubmVjdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdEaXNjb25uZWN0ZWQgZnJvbSBzb2NrZXQgc2VydmVyJylcbiAgICB9LFxuXG4gICAgLy8gTmV3IHBsYXllclxuICAgIG9uTmV3UGxheWVyOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdOZXcgcGxheWVyIGNvbm5lY3RlZDonLCBkYXRhLmlkKVxuXG4gICAgICAgIC8vIEF2b2lkIHBvc3NpYmxlIGR1cGxpY2F0ZSBwbGF5ZXJzXG4gICAgICAgIHZhciBkdXBsaWNhdGUgPSBfLmZpbmQodGhpcy5lbmVtaWVzLCB7IGlkOiBkYXRhLmlkIH0pXG4gICAgICAgIGlmIChkdXBsaWNhdGUgfHwgZGF0YS5pZCA9PT0gdGhpcy5zb2NrZXQuaWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdEdXBsaWNhdGUgcGxheWVyIScpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBuZXdSZW1vdGVQbGF5ZXIgPSByZW1vdGVQbGF5ZXIuY3JlYXRlLmNhbGwodGhpcywge1xuICAgICAgICAgICAgeDogZGF0YS54LFxuICAgICAgICAgICAgeTogZGF0YS55LFxuICAgICAgICAgICAgaWQ6IGRhdGEuaWRcbiAgICAgICAgfSlcblxuICAgICAgICB0aGlzLmVuZW1pZXMucHVzaChuZXdSZW1vdGVQbGF5ZXIpXG4gICAgfSxcblxuICAgIG9uRGVhZFBsYXllcjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBpZiAoZGF0YS5kZWFkUGxheWVySWQgIT09IHRoaXMuc29ja2V0LmlkKVxuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgY29uc29sZS5sb2coJ1lPVSBESUVEISEhJylcblxuICAgICAgICB0aGlzLnBsYXllci54ID0gMjAwXG4gICAgICAgIHRoaXMucGxheWVyLnkgPSB0aGlzLndvcmxkLmhlaWdodCAtIDQwMFxuICAgIH0sXG5cbiAgICAvLyBNb3ZlIHBsYXllclxuICAgIG9uTW92ZVBsYXllcjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgbW92ZVBsYXllciA9IF8uZmluZCh0aGlzLmVuZW1pZXMsIHsgaWQ6IGRhdGEuaWQgfSlcblxuICAgICAgICAvLyBQbGF5ZXIgbm90IGZvdW5kXG4gICAgICAgIGlmICghIG1vdmVQbGF5ZXIpIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgLy8gVXBkYXRlIHBsYXllciBwb3NpdGlvblxuICAgICAgICBtb3ZlUGxheWVyLnggPSBkYXRhLnhcbiAgICAgICAgbW92ZVBsYXllci55ID0gZGF0YS55XG5cbiAgICAgICAgaWYgKG1vdmVQbGF5ZXIueCA+IG1vdmVQbGF5ZXIubGFzdFBvc2l0aW9uLngpIHtcbiAgICAgICAgICAgIG1vdmVQbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdyaWdodCcpXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobW92ZVBsYXllci54IDwgbW92ZVBsYXllci5sYXN0UG9zaXRpb24ueClcbiAgICAgICAge1xuICAgICAgICAgICAgbW92ZVBsYXllci5hbmltYXRpb25zLnBsYXkoJ2xlZnQnKVxuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAge1xuICAgICAgICAgICAgbW92ZVBsYXllci5hbmltYXRpb25zLnN0b3AoKVxuICAgICAgICAgICAgbW92ZVBsYXllci5mcmFtZSA9IDQ7XG4gICAgICAgIH1cblxuICAgICAgICBtb3ZlUGxheWVyLmxhc3RQb3NpdGlvbi54ID0gbW92ZVBsYXllci54XG4gICAgICAgIG1vdmVQbGF5ZXIubGFzdFBvc2l0aW9uLnkgPSBtb3ZlUGxheWVyLnlcbiAgICB9LFxuXG4gICAgLy8gUmVtb3ZlIHBsYXllclxuICAgIG9uUmVtb3ZlUGxheWVyOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciByZW1vdmVQbGF5ZXIgPSBfLmZpbmQodGhpcy5lbmVtaWVzLCB7IGlkOiBkYXRhLmlkIH0pXG5cbiAgICAgICAgLy8gUGxheWVyIG5vdCBmb3VuZFxuICAgICAgICBpZiAoIXJlbW92ZVBsYXllcikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1BsYXllciBub3QgZm91bmQ6ICcsIGRhdGEpXG4gICAgICAgICAgICBfLnJlbW92ZSh0aGlzLmVuZW1pZXMsIHsgaWQ6IGRhdGEuaWQgfSlcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgcmVtb3ZlUGxheWVyLmtpbGwoKVxuXG4gICAgICAgIC8vIFJlbW92ZSBwbGF5ZXIgZnJvbSBhcnJheVxuICAgICAgICB0aGlzLmVuZW1pZXMuc3BsaWNlKHRoaXMuZW5lbWllcy5pbmRleE9mKHJlbW92ZVBsYXllciksIDEpXG4gICAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBmb3Jlc3RpYSA9IHJlcXVpcmUoJy4uLy4uL21hcHMvZm9yZXN0aWEnKVxubGV0IHdlYXBvbnMgPSByZXF1aXJlKCcuLi93ZWFwb25zJylcbmxldCBwbGF5ZXIgPSByZXF1aXJlKCcuLi9wbGF5ZXInKVxuXG5sZXQgd29ybGRXaWR0aCA9IDQwMDBcbmxldCB3b3JsZEhlaWdodCA9IDE1MDBcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBEZWZpbmUgbW92ZW1lbnQgY29uc3RhbnRzXG4gICAgdGhpcy5NQVhfU1BFRUQgPSA0MDA7IC8vIHBpeGVscy9zZWNvbmRcbiAgICB0aGlzLkFDQ0VMRVJBVElPTiA9IDE5NjA7IC8vIHBpeGVscy9zZWNvbmQvc2Vjb25kXG4gICAgdGhpcy5EUkFHID0gMTUwMDsgLy8gcGl4ZWxzL3NlY29uZFxuICAgIHRoaXMuR1JBVklUWSA9IDE5MDA7IC8vIHBpeGVscy9zZWNvbmQvc2Vjb25kXG4gICAgdGhpcy5KVU1QX1NQRUVEID0gLTg1MDsgLy8gcGl4ZWxzL3NlY29uZCAobmVnYXRpdmUgeSBpcyB1cClcblxuICAgIHRoaXMuc29ja2V0ID0gaW8uY29ubmVjdCgpXG4gICAgdGhpcy5lbmVtaWVzID0gW11cblxuICAgIC8vICBXZSdyZSBnb2luZyB0byBiZSB1c2luZyBwaHlzaWNzLCBzbyBlbmFibGUgdGhlIEFyY2FkZSBQaHlzaWNzIHN5c3RlbVxuICAgIHRoaXMucGh5c2ljcy5zdGFydFN5c3RlbShQaGFzZXIuUGh5c2ljcy5BUkNBREUpXG5cbiAgICB0aGlzLndvcmxkLnNldEJvdW5kcygwLCAwLCB3b3JsZFdpZHRoLCB3b3JsZEhlaWdodClcbiAgICB0aGlzLmdhbWUuc3RhZ2UuYmFja2dyb3VuZENvbG9yID0gXCIjMkY5MUQwXCJcblxuICAgIC8vIFNjYWxlIGdhbWUgb24gd2luZG93IHJlc2l6ZVxuICAgIHRoaXMuZ2FtZS5zY2FsZS5zY2FsZU1vZGUgPSBQaGFzZXIuU2NhbGVNYW5hZ2VyLlJFU0laRTtcbiAgICB0aGlzLmdhbWUuc2NhbGUuc2V0U2hvd0FsbCgpO1xuICAgIHRoaXMuZ2FtZS5zY2FsZS5yZWZyZXNoKClcblxuICAgIC8vIFNpbmNlIHdlJ3JlIGp1bXBpbmcgd2UgbmVlZCBncmF2aXR5XG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmdyYXZpdHkueSA9IHRoaXMuR1JBVklUWTtcblxuICAgIC8vIEZsYWcgdG8gdHJhY2sgaWYgdGhlIGp1bXAgYnV0dG9uIGlzIHByZXNzZWRcbiAgICB0aGlzLmp1bXBpbmcgPSBmYWxzZTtcblxuXG4gICAgLyoqXG4gICAgICogTWFwXG4gICAgICovXG4gICAgZm9yZXN0aWEuY3JlYXRlKHRoaXMpXG5cblxuICAgIC8qKlxuICAgICAqIFBsYXllciBTZXR0aW5nc1xuICAgICAqL1xuICAgIHRoaXMucGxheWVyID0gcGxheWVyLmNyZWF0ZS5jYWxsKHRoaXMpXG5cblxuICAgIC8qKlxuICAgICAqIFdlYXBvbnNcbiAgICAgKi9cbiAgICB0aGlzLmN1cnJlbnRXZWFwb24gPSAwO1xuICAgIHRoaXMud2VhcG9ucy5wdXNoKG5ldyB3ZWFwb25zLmFLNDcodGhpcy5nYW1lKSlcbiAgICB0aGlzLndlYXBvbnMucHVzaChuZXcgd2VhcG9ucy5iYXJyZXRNODJBMSh0aGlzLmdhbWUpKVxuXG5cbiAgICAvKipcbiAgICAgKiBUZXh0XG4gICAgICovXG4gICAgbGV0IHRleHRTdHlsZXMgPSB7IGZvbnRTaXplOiAnMjRweCcsIGZpbGw6ICcjMDAwJyB9XG4gICAgdGhpcy5zY29yZVRleHQgPSB0aGlzLmFkZC50ZXh0KDI1LCAyNSwgJ1Njb3JlOiAwJywgdGV4dFN0eWxlcylcbiAgICB0aGlzLnNjb3JlVGV4dC5maXhlZFRvQ2FtZXJhID0gdHJ1ZVxuICAgIHRoaXMud2VhcG9uTmFtZSA9IHRoaXMuYWRkLnRleHQodGhpcy5jYW1lcmEud2lkdGggLSAxMDAsIHRoaXMuY2FtZXJhLmhlaWdodCAtIDQ1LCAnQUstNDcnLCB0ZXh0U3R5bGVzKVxuICAgIHRoaXMud2VhcG9uTmFtZS5maXhlZFRvQ2FtZXJhID0gdHJ1ZVxuICAgIHRoaXMuY3VycmVudEhlYWx0aFRleHQgPSB0aGlzLmFkZC50ZXh0KHRoaXMuY2FtZXJhLnggKyAyNSwgdGhpcy5jYW1lcmEuaGVpZ2h0IC0gNDUsICcxMDAnLCB0ZXh0U3R5bGVzKVxuICAgIHRoaXMuY3VycmVudEhlYWx0aFRleHQuZml4ZWRUb0NhbWVyYSA9IHRydWVcblxuXG4gICAgLyoqXG4gICAgICogQ2FtZXJhIFNldHRpbmdzXG4gICAgICovXG4gICAgdGhpcy5jYW1lcmEuZm9sbG93KHRoaXMucGxheWVyKTtcblxuICAgIHZhciBjaGFuZ2VLZXkgPSB0aGlzLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuRU5URVIpO1xuICAgIGNoYW5nZUtleS5vbkRvd24uYWRkKHRoaXMubmV4dFdlYXBvbiwgdGhpcylcblxuXG4gICAgLyoqXG4gICAgICogUmVzaXppbmcgRXZlbnRzXG4gICAgICovXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICgpID0+IHtcbiAgICAgICAgdGhpcy5nYW1lLnNjYWxlLnJlZnJlc2goKVxuICAgICAgICB0aGlzLmdhbWUuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0XG4gICAgICAgIHRoaXMuZ2FtZS53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXG5cbiAgICAgICAgdGhpcy53ZWFwb25OYW1lLmNhbWVyYU9mZnNldC54ID0gdGhpcy5jYW1lcmEud2lkdGggLSAxMDBcbiAgICAgICAgdGhpcy53ZWFwb25OYW1lLmNhbWVyYU9mZnNldC55ID0gdGhpcy5jYW1lcmEuaGVpZ2h0IC0gNDVcblxuICAgICAgICB0aGlzLnNjb3JlVGV4dC5jYW1lcmFPZmZzZXQueCA9IDI1XG4gICAgICAgIHRoaXMuc2NvcmVUZXh0LmNhbWVyYU9mZnNldC55ID0gMjVcbiAgICB9KVxuXG5cbiAgICAvKipcbiAgICAgKiBTdGFydCBsaXN0ZW5pbmcgZm9yIGV2ZW50c1xuICAgICAqL1xuICAgIHRoaXMuc2V0RXZlbnRIYW5kbGVycygpXG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmdhbWUucmVuZGVyZXIucmVuZGVyU2Vzc2lvbi5yb3VuZFBpeGVscyA9IHRydWVcbiAgICB0aGlzLmdhbWUuc3RhZ2UuZGlzYWJsZVZpc2liaWxpdHlDaGFuZ2UgPSB0cnVlXG4gICAgdGhpcy5waHlzaWNzLnN0YXJ0U3lzdGVtKFBoYXNlci5QaHlzaWNzLkFSQ0FERSlcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMubG9hZC5pbWFnZSgnYnVsbGV0MTEnLCAnL2ltYWdlcy9idWxsZXQxMS5wbmcnKVxuICAgIHRoaXMubG9hZC5pbWFnZSgnYnVsbGV0MTAnLCAnL2ltYWdlcy9idWxsZXQxMC5wbmcnKVxuICAgIHRoaXMubG9hZC5pbWFnZSgnYnVsbGV0OScsICcvaW1hZ2VzL2J1bGxldDkucG5nJylcbiAgICB0aGlzLmxvYWQuaW1hZ2UoJ2J1bGxldDgnLCAnL2ltYWdlcy9idWxsZXQ4LnBuZycpXG4gICAgdGhpcy5sb2FkLmltYWdlKCdidWxsZXQ3JywgJy9pbWFnZXMvYnVsbGV0Ny5wbmcnKVxuICAgIHRoaXMubG9hZC5pbWFnZSgnYnVsbGV0NScsICcvaW1hZ2VzL2J1bGxldDUucG5nJylcbiAgICB0aGlzLmxvYWQuaW1hZ2UoJ2J1bGxldDQnLCAnL2ltYWdlcy9idWxsZXQ0LnBuZycpXG4gICAgdGhpcy5sb2FkLmltYWdlKCd0cmVlc2NhcGUnLCAnL2ltYWdlcy9tYXAtY3RmMS5wbmcnKVxuICAgIHRoaXMubG9hZC5pbWFnZSgnZ3JvdW5kJywgJy9pbWFnZXMvcGxhdGZvcm0ucG5nJylcbiAgICB0aGlzLmxvYWQuc3ByaXRlc2hlZXQoJ2R1ZGUnLCAnL2ltYWdlcy9kdWRlLnBuZycsIDMyLCA0OClcbiAgICB0aGlzLmxvYWQuc3ByaXRlc2hlZXQoJ2VuZW15JywgJy9pbWFnZXMvZHVkZS5wbmcnLCAzMiwgNDgpXG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICAvLyAgQ29sbGlkZSB0aGUgcGxheWVyIGFuZCB0aGUgc3RhcnMgd2l0aCB0aGUgcGxhdGZvcm1zXG4gICAgdGhpcy5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMucGxheWVyLCB0aGlzLnBsYXRmb3JtcylcbiAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5lbmVtaWVzLCB0aGlzLnBsYXRmb3JtcylcbiAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5lbmVteSwgdGhpcy5wbGF0Zm9ybXMpXG4gICAgdGhpcy5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMucGxhdGZvcm1zLCB0aGlzLndlYXBvbnMsIGZ1bmN0aW9uKHBsYXRmb3JtLCB3ZWFwb24pIHtcbiAgICAgICAgd2VhcG9uLmtpbGwoKVxuICAgIH0sIG51bGwsIHRoaXMpO1xuXG4gICAgdGhpcy5lbmVtaWVzLmZvckVhY2goKGVuZW15KSA9PiB7XG4gICAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5vdmVybGFwKGVuZW15LCB0aGlzLndlYXBvbnMsIChlbmVteSwgd2VhcG9uKSA9PiB7XG4gICAgICAgICAgICBlbmVteS5oZWFsdGggLT0gd2VhcG9uLmRhbWFnZVxuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5wbGF5ZXIpXG4gICAgICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdkYW1hZ2VkIHBsYXllcicsIHtcbiAgICAgICAgICAgICAgICBhdHRhY2tpbmdQbGF5ZXJJZDogdGhpcy5wbGF5ZXIuaWQsXG4gICAgICAgICAgICAgICAgZGFtYWdlZFBsYXllcklkOiBlbmVteS5pZCxcbiAgICAgICAgICAgICAgICBkYW1hZ2U6IHdlYXBvbi5kYW1hZ2VcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB3ZWFwb24ua2lsbCgpXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnWW91IGhpdCB0aGVtIScsIGVuZW15LmhlYWx0aCwgd2VhcG9uLmRhbWFnZSwgZW5lbXkpXG4gICAgICAgIH0sIG51bGwsIHRoaXMpXG4gICAgfSlcblxuICAgIGlmICh0aGlzLmxlZnRJbnB1dElzQWN0aXZlKCkpIHtcbiAgICAgICAgLy8gSWYgdGhlIExFRlQga2V5IGlzIGRvd24sIHNldCB0aGUgcGxheWVyIHZlbG9jaXR5IHRvIG1vdmUgbGVmdFxuICAgICAgICB0aGlzLnBsYXllci5ib2R5LmFjY2VsZXJhdGlvbi54ID0gLXRoaXMuQUNDRUxFUkFUSU9OO1xuICAgICAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLnBsYXkoJ2xlZnQnKVxuICAgIH0gZWxzZSBpZiAodGhpcy5yaWdodElucHV0SXNBY3RpdmUoKSkge1xuICAgICAgICAvLyBJZiB0aGUgUklHSFQga2V5IGlzIGRvd24sIHNldCB0aGUgcGxheWVyIHZlbG9jaXR5IHRvIG1vdmUgcmlnaHRcbiAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5hY2NlbGVyYXRpb24ueCA9IHRoaXMuQUNDRUxFUkFUSU9OO1xuICAgICAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLnBsYXkoJ3JpZ2h0JylcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBTdGFuZCBzdGlsbFxuICAgICAgICB0aGlzLnBsYXllci5ib2R5LmFjY2VsZXJhdGlvbi54ID0gMFxuICAgICAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLnN0b3AoKVxuICAgICAgICB0aGlzLnBsYXllci5mcmFtZSA9IDRcbiAgICB9XG5cbiAgICAvLyBTZXQgYSB2YXJpYWJsZSB0aGF0IGlzIHRydWUgd2hlbiB0aGUgcGxheWVyIGlzIHRvdWNoaW5nIHRoZSBncm91bmRcbiAgICB2YXIgb25UaGVHcm91bmQgPSB0aGlzLnBsYXllci5ib2R5LnRvdWNoaW5nLmRvd247XG5cbiAgICAvLyBJZiB0aGUgcGxheWVyIGlzIHRvdWNoaW5nIHRoZSBncm91bmQsIGxldCBoaW0gaGF2ZSAyIGp1bXBzXG4gICAgaWYgKG9uVGhlR3JvdW5kKSB7XG4gICAgICAgIHRoaXMuanVtcHMgPSAyO1xuICAgICAgICB0aGlzLmp1bXBpbmcgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBKdW1wIVxuICAgIGlmICh0aGlzLmp1bXBzID4gMCAmJiB0aGlzLnVwSW5wdXRJc0FjdGl2ZSg1KSkge1xuICAgICAgICB0aGlzLnBsYXllci5ib2R5LnZlbG9jaXR5LnkgPSB0aGlzLkpVTVBfU1BFRUQ7XG4gICAgICAgIHRoaXMuanVtcGluZyA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gUmVkdWNlIHRoZSBudW1iZXIgb2YgYXZhaWxhYmxlIGp1bXBzIGlmIHRoZSBqdW1wIGlucHV0IGlzIHJlbGVhc2VkXG4gICAgaWYgKHRoaXMuanVtcGluZyAmJiB0aGlzLnVwSW5wdXRSZWxlYXNlZCgpKSB7XG4gICAgICAgIHRoaXMuanVtcHMtLTtcbiAgICAgICAgdGhpcy5qdW1waW5nID0gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gRmlyZSBjdXJyZW50IHdlYXBvblxuICAgIGlmICh0aGlzLmdhbWUuaW5wdXQuYWN0aXZlUG9pbnRlci5pc0Rvd24pXG4gICAge1xuICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS5maXJlKHRoaXMucGxheWVyKTtcbiAgICB9XG5cbiAgICB0aGlzLnNvY2tldC5lbWl0KCdtb3ZlIHBsYXllcicsIHsgeDogdGhpcy5wbGF5ZXIueCwgeTogdGhpcy5wbGF5ZXIueSB9KVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ3VpZEdlbmVyYXRvcigpIHtcbiAgICB2YXIgUzQgPSBmdW5jdGlvbigpIHtcbiAgICAgICByZXR1cm4gKCgoMStNYXRoLnJhbmRvbSgpKSoweDEwMDAwKXwwKS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpXG4gICAgfVxuXG4gICAgcmV0dXJuIChTNCgpK1M0KCkrXCItXCIrUzQoKStcIi1cIitTNCgpK1wiLVwiK1M0KCkrXCItXCIrUzQoKStTNCgpK1M0KCkpXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IFBsYXllciA9IHt9XG5cblBsYXllci5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgbmV3UGxheWVyID0gdGhpcy5hZGQuc3ByaXRlKDIwMCwgdGhpcy53b3JsZC5oZWlnaHQgLSA0MDAsICdkdWRlJyk7XG5cbiAgICAvLyAgV2UgbmVlZCB0byBlbmFibGUgcGh5c2ljcyBvbiB0aGUgcGxheWVyXG4gICAgdGhpcy5waHlzaWNzLmFyY2FkZS5lbmFibGUobmV3UGxheWVyKTtcblxuICAgIC8vIEVuYWJsZSBwaHlzaWNzIG9uIHRoZSBwbGF5ZXJcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5lbmFibGUobmV3UGxheWVyLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuXG4gICAgLy8gTWFrZSBwbGF5ZXIgY29sbGlkZSB3aXRoIHdvcmxkIGJvdW5kYXJpZXMgc28gaGUgZG9lc24ndCBsZWF2ZSB0aGUgc3RhZ2VcbiAgICBuZXdQbGF5ZXIuYm9keS5jb2xsaWRlV29ybGRCb3VuZHMgPSB0cnVlO1xuXG4gICAgLy8gU2V0IHBsYXllciBtaW5pbXVtIGFuZCBtYXhpbXVtIG1vdmVtZW50IHNwZWVkXG4gICAgbmV3UGxheWVyLmJvZHkubWF4VmVsb2NpdHkuc2V0VG8odGhpcy5NQVhfU1BFRUQsIHRoaXMuTUFYX1NQRUVEICogMTApOyAvLyB4LCB5XG5cbiAgICAvLyBBZGQgZHJhZyB0byB0aGUgcGxheWVyIHRoYXQgc2xvd3MgdGhlbSBkb3duIHdoZW4gdGhleSBhcmUgbm90IGFjY2VsZXJhdGluZ1xuICAgIG5ld1BsYXllci5ib2R5LmRyYWcuc2V0VG8odGhpcy5EUkFHLCAwKTsgLy8geCwgeVxuXG4gICAgLy8gIE91ciB0d28gYW5pbWF0aW9ucywgd2Fsa2luZyBsZWZ0IGFuZCByaWdodC5cbiAgICBuZXdQbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ2xlZnQnLCBbMCwgMSwgMiwgM10sIDEwLCB0cnVlKVxuICAgIG5ld1BsYXllci5hbmltYXRpb25zLmFkZCgncmlnaHQnLCBbNSwgNiwgNywgOF0sIDEwLCB0cnVlKVxuICAgIG5ld1BsYXllci5zY29yZSA9IDBcblxuICAgIHJldHVybiBuZXdQbGF5ZXJcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXJcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgUmVtb3RlUGxheWVyID0ge31cblxuUmVtb3RlUGxheWVyLmNyZWF0ZSA9IGZ1bmN0aW9uKGNvbmZpZykge1xuICAgIC8vIEFkZCBuZXcgcGxheWVyIHRvIHRoZSByZW1vdGUgcGxheWVycyBhcnJheVxuICAgIGxldCBuZXdSZW1vdGVQbGF5ZXIgPSB0aGlzLmFkZC5zcHJpdGUoY29uZmlnLngsIGNvbmZpZy55LCAnZHVkZScpO1xuICAgIG5ld1JlbW90ZVBsYXllci5pZCA9IGNvbmZpZy5pZFxuXG4gICAgbmV3UmVtb3RlUGxheWVyLmxhc3RQb3NpdGlvbiA9IHtcbiAgICAgICAgeDogY29uZmlnLngsXG4gICAgICAgIHk6IGNvbmZpZy55XG4gICAgfVxuXG4gICAgLy8gIFdlIG5lZWQgdG8gZW5hYmxlIHBoeXNpY3Mgb24gdGhlIHBsYXllclxuICAgIHRoaXMucGh5c2ljcy5hcmNhZGUuZW5hYmxlKG5ld1JlbW90ZVBsYXllcilcblxuICAgIC8vIEVuYWJsZSBwaHlzaWNzIG9uIHRoZSBwbGF5ZXJcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5lbmFibGUobmV3UmVtb3RlUGxheWVyLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpXG5cbiAgICAvLyBNYWtlIHBsYXllciBjb2xsaWRlIHdpdGggd29ybGQgYm91bmRhcmllcyBzbyBoZSBkb2Vzbid0IGxlYXZlIHRoZSBzdGFnZVxuICAgIG5ld1JlbW90ZVBsYXllci5ib2R5LmNvbGxpZGVXb3JsZEJvdW5kcyA9IHRydWU7XG5cbiAgICAvLyBTZXQgcGxheWVyIG1pbmltdW0gYW5kIG1heGltdW0gbW92ZW1lbnQgc3BlZWRcbiAgICBuZXdSZW1vdGVQbGF5ZXIuYm9keS5tYXhWZWxvY2l0eS5zZXRUbyh0aGlzLk1BWF9TUEVFRCwgdGhpcy5NQVhfU1BFRUQgKiAxMCk7IC8vIHgsIHlcblxuICAgIC8vIEFkZCBkcmFnIHRvIHRoZSBwbGF5ZXIgdGhhdCBzbG93cyB0aGVtIGRvd24gd2hlbiB0aGV5IGFyZSBub3QgYWNjZWxlcmF0aW5nXG4gICAgbmV3UmVtb3RlUGxheWVyLmJvZHkuZHJhZy5zZXRUbyh0aGlzLkRSQUcsIDApOyAvLyB4LCB5XG5cbiAgICBuZXdSZW1vdGVQbGF5ZXIuaGVhbHRoID0gMTAwXG5cbiAgICBuZXdSZW1vdGVQbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ2xlZnQnLCBbMCwgMSwgMiwgM10sIDEwLCB0cnVlKVxuICAgIG5ld1JlbW90ZVBsYXllci5hbmltYXRpb25zLmFkZCgncmlnaHQnLCBbNSwgNiwgNywgOF0sIDEwLCB0cnVlKVxuXG4gICAgcmV0dXJuIG5ld1JlbW90ZVBsYXllclxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlbW90ZVBsYXllclxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBCdWxsZXQgPSByZXF1aXJlKCcuLi9CdWxsZXQnKVxuXG5sZXQgQUs0NyA9IGZ1bmN0aW9uIChnYW1lKSB7XG4gICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgZ2FtZSwgZ2FtZS53b3JsZCwgJ0FLLTQ3JywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG5cbiAgICB0aGlzLm5hbWUgPSAnQUstNDcnXG4gICAgdGhpcy5kYW1hZ2UgPSAyMlxuICAgIHRoaXMubmV4dEZpcmUgPSAwXG4gICAgdGhpcy5idWxsZXRTcGVlZCA9IDE1MDBcblxuICAgIC8vIEFLNDcgZmlyZXMgYWJvdXQgNjAwIGJ1bGxldHMgcGVyIHNlY29uZFxuICAgIHRoaXMuZmlyZVJhdGUgPSAxNjYuNjY2NjY3XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDY0OyBpKyspXG4gICAge1xuICAgICAgICBsZXQgYnVsbGV0ID0gbmV3IEJ1bGxldCh0aGlzLmdhbWUsICdncm91bmQnKVxuICAgICAgICBidWxsZXQuaGVpZ2h0ID0gM1xuICAgICAgICBidWxsZXQud2lkdGggPSAxMFxuICAgICAgICBidWxsZXQuZGFtYWdlID0gMjJcblxuICAgICAgICB0aGlzLmFkZChidWxsZXQsIHRydWUpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbn1cblxuQUs0Ny5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuQUs0Ny5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBBSzQ3O1xuXG5BSzQ3LnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24gKHNvdXJjZSkge1xuICAgIGlmICh0aGlzLmdhbWUudGltZS50aW1lIDwgdGhpcy5uZXh0RmlyZSlcbiAgICAgICAgcmV0dXJuXG5cbiAgICB2YXIgeCA9IHNvdXJjZS54ICsgMTU7XG4gICAgdmFyIHkgPSBzb3VyY2UueSArIDMwO1xuXG4gICAgdGhpcy5nZXRGaXJzdEV4aXN0cyhmYWxzZSkuZmlyZSh4LCB5LCAwLCB0aGlzLmJ1bGxldFNwZWVkLCAwLCAwKVxuICAgIHRoaXMuc2V0QWxsKCd0cmFja2luZycsIHRydWUpXG5cbiAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5nYW1lLnRpbWUudGltZSArIHRoaXMuZmlyZVJhdGVcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBSzQ3XG4iLCIndXNlIHN0cmljdCdcblxubGV0IEJ1bGxldCA9IHJlcXVpcmUoJy4uL0J1bGxldCcpXG5cbmxldCBiYXJyZXRNODJBMSA9IGZ1bmN0aW9uIChnYW1lKSB7XG4gICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgZ2FtZSwgZ2FtZS53b3JsZCwgJ0FLLTQ3JywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG5cbiAgICB0aGlzLm5hbWUgPSAnQmFycmV0IE04MkExJ1xuICAgIHRoaXMuZGFtYWdlID0gODhcbiAgICB0aGlzLm5leHRGaXJlID0gMFxuICAgIHRoaXMuYnVsbGV0U3BlZWQgPSAzNDM1XG5cbiAgICAvLyBiYXJyZXRNODJBMSBmaXJlcyBhYm91dCA2MDAgYnVsbGV0cyBwZXIgc2Vjb25kXG4gICAgdGhpcy5maXJlUmF0ZSA9IDQwMDBcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNjQ7IGkrKylcbiAgICB7XG4gICAgICAgIGxldCBidWxsZXQgPSBuZXcgQnVsbGV0KHRoaXMuZ2FtZSwgJ2dyb3VuZCcpXG4gICAgICAgIGJ1bGxldC5oZWlnaHQgPSAzXG4gICAgICAgIGJ1bGxldC53aWR0aCA9IDEwXG4gICAgICAgIGJ1bGxldC5kYW1hZ2UgPSA4OFxuXG4gICAgICAgIHRoaXMuYWRkKGJ1bGxldCwgdHJ1ZSlcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xufVxuXG5iYXJyZXRNODJBMS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuYmFycmV0TTgyQTEucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gYmFycmV0TTgyQTE7XG5cbmJhcnJldE04MkExLnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24gKHNvdXJjZSkge1xuICAgIGlmICh0aGlzLmdhbWUudGltZS50aW1lIDwgdGhpcy5uZXh0RmlyZSlcbiAgICAgICAgcmV0dXJuXG5cbiAgICB2YXIgeCA9IHNvdXJjZS54ICsgMTU7XG4gICAgdmFyIHkgPSBzb3VyY2UueSArIDMwO1xuXG4gICAgdGhpcy5nZXRGaXJzdEV4aXN0cyhmYWxzZSkuZmlyZSh4LCB5LCAwLCB0aGlzLmJ1bGxldFNwZWVkLCAwLCAwKVxuICAgIHRoaXMuc2V0QWxsKCd0cmFja2luZycsIHRydWUpXG5cbiAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5nYW1lLnRpbWUudGltZSArIHRoaXMuZmlyZVJhdGVcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXJyZXRNODJBMVxuIiwiJ3VzZSBzdHJpY3QnXG5cbi8qKlxuICogUHJpbWFyeSBXZWFwb25zXG4gKiAxLiBEZXNlcnQgRWFnbGVzXG4gKiAyLiBISyBNUDVcbiAqIDMuIEFLNDdcbiAqIDQuIE0xNlxuICogNS4gU3Bhcy0xMlxuICogNi4gUnVnZXIgNzdcbiAqIDcuIE03OVxuICogOC4gQmFycmV0IE04MkExXG4gKiA5LiBGTiBNaW5pbWlcbiAqIDEwLiBYTTIxNCBNaW5pZ3VuXG4gKi9cblxuLyoqXG4gKiBTZWNvbmRhcnkgV2VhcG9uc1xuICogMS4gVVNTT0NPTVxuICogMi4gQ29tYmF0IEtuaWZlXG4gKiAzLiBDaGFpbnNhd1xuICogNC4gTTcyIExhd1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGFLNDc6IHJlcXVpcmUoJy4vYUs0NycpLFxuICAgIGJhcnJldE04MkExOiByZXF1aXJlKCcuL2JhcnJldE04MkExJylcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgTWFwQ3RmMSA9IHt9XG5cbk1hcEN0ZjEuY3JlYXRlID0gZnVuY3Rpb24oc2NvcGUpIHtcbiAgICB0aGlzLnNjb3BlID0gc2NvcGVcblxuICAgIHRoaXMuY3JlYXRlU2t5U3ByaXRlKClcbiAgICB0aGlzLmNyZWF0ZVBsYXRmb3JtcygpXG4gICAgdGhpcy5jcmVhdGVMZWRnZXMoKVxuXG4gICAgdGhpcy5zY29wZS5wbGF0Zm9ybXMuc2V0QWxsKCdib2R5LmltbW92YWJsZScsIHRydWUpXG4gICAgdGhpcy5zY29wZS5wbGF0Zm9ybXMuc2V0QWxsKCdib2R5LmFsbG93R3Jhdml0eScsIGZhbHNlKVxufVxuXG5NYXBDdGYxLmNyZWF0ZUxlZGdlcyA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBsZWRnZXMgPSBbXG4gICAgICAgIC8vIHt4LCB5LCB3aWR0aCwgaGVpZ2h0fVxuXG4gICAgICAgIC8vIFN0YXJ0aW5nIExlZGdlc1xuICAgICAgICB7IGlkOiAxLCB4OiAwLCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gNDMxLCB3aWR0aDogMTI4LCBoZWlnaHQ6IDkyIH0sIC8vIExlZnQgYm90dG9tIGxlZGdlXG4gICAgICAgIHsgaWQ6IDIsIHg6IDAsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA4MzgsIHdpZHRoOiAxMjgsIGhlaWdodDogOTIgfSwgLy8gTGVmdCB0b3AgbGVkZ2VcblxuICAgICAgICB7IGlkOiAzLCB4OiAzODcyLCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gNDI3LCB3aWR0aDogMTI4LCBoZWlnaHQ6IDkyIH0sIC8vIFJpZ2h0IGJvdHRvbSBsZWRnZVxuICAgICAgICB7IGlkOiA0LCB4OiAzODcyLCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gODM1LCB3aWR0aDogMTI4LCBoZWlnaHQ6IDkyIH0sIC8vIFJpZ2h0IHRvcCBsZWRnZVxuXG4gICAgICAgIC8vIEdyb3VuZCBMZWRnZXNcbiAgICAgICAgeyBpZDogNSwgeDogMCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDEyOCwgd2lkdGg6IDQ3NCwgaGVpZ2h0OiAxMjggfSwgLy8gTWFpbiBib3R0b20gc3RhcnRpbmcgbGVmdCBsZWRnZVxuICAgICAgICB7IGlkOiA2LCB4OiA0NzQsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSAyNTYsIHdpZHRoOiA2NDEsIGhlaWdodDogMjYwIH0sIC8vIE1haW4gYm90dG9tIGxlZnQgbGVkZ2VcbiAgICAgICAgeyBpZDogNywgeDogMTExNSwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDM4NCwgd2lkdGg6IDE3ODUsIGhlaWdodDogMzkwIH0sIC8vIE1haW4gYm90dG9tIGNlbnRlciBsZWRnZVxuICAgICAgICB7IGlkOiA4LCB4OiAyOTAwLCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gMjU2LCB3aWR0aDogNjQxLCBoZWlnaHQ6IDI2MCB9LCAvLyBNYWluIGJvdHRvbSByaWdodCBsZWRnZVxuICAgICAgICB7IGlkOiA5LCB4OiAzNTQwLCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gMTI4LCB3aWR0aDogNDc0LCBoZWlnaHQ6IDEyOCB9LCAvLyBNYWluIGJvdHRvbSBzdGFydGluZyByaWdodCBsZWRnZVxuXG4gICAgICAgIC8vIEFpciBMZWRnZXNcbiAgICAgICAgeyBpZDogMTAsIHg6IDMwMCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDYwOCwgd2lkdGg6IDY0MSwgaGVpZ2h0OiA5MiB9LFxuICAgICAgICB7IGlkOiAxMSwgeDogMTExMCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDcwMSwgd2lkdGg6IDUxMywgaGVpZ2h0OiA5MiB9LFxuICAgICAgICB7IGlkOiAxMiwgeDogODcwLCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gOTgyLCB3aWR0aDogMjU2LCBoZWlnaHQ6IDkyIH0sXG4gICAgICAgIHsgaWQ6IDEzLCB4OiAxNzQ0LCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gODc0LCB3aWR0aDogNTA3LCBoZWlnaHQ6IDI1NCB9LFxuICAgICAgICB7IGlkOiAxNCwgeDogMjM5MCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDY4OSwgd2lkdGg6IDUxMywgaGVpZ2h0OiA5MiB9LFxuICAgICAgICB7IGlkOiAxNSwgeDogMzAzMSwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDYwOCwgd2lkdGg6IDY0MSwgaGVpZ2h0OiA5MiB9LFxuICAgICAgICB7IGlkOiAxNiwgeDogMjkwMywgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDk1Nywgd2lkdGg6IDI1NiwgaGVpZ2h0OiA5MiB9XG4gICAgXVxuXG5cbiAgICBsZWRnZXMuZm9yRWFjaCgobGVkZ2UpID0+IHtcbiAgICAgICAgLy8gdmFyIG5ld0xlZGdlID0gdGhpcy5zY29wZS5wbGF0Zm9ybXMuY3JlYXRlKGxlZGdlLngsIGxlZGdlLnksICdncm91bmQnKVxuICAgICAgICB2YXIgbmV3TGVkZ2UgPSB0aGlzLnNjb3BlLnBsYXRmb3Jtcy5jcmVhdGUobGVkZ2UueCwgbGVkZ2UueSlcbiAgICAgICAgbmV3TGVkZ2UuaGVpZ2h0ID0gbGVkZ2UuaGVpZ2h0XG4gICAgICAgIG5ld0xlZGdlLndpZHRoID0gbGVkZ2Uud2lkdGhcblxuICAgICAgICAvLyBEZWJ1ZyBzdHVmZlxuICAgICAgICAvLyBuZXdMZWRnZS5hbHBoYSA9IDAuMlxuICAgICAgICAvLyBsZXQgc3R5bGUgPSB7IGZvbnQ6IFwiMjBweCBBcmlhbFwiLCBmaWxsOiBcIiNmZjAwNDRcIiwgYWxpZ246IFwiY2VudGVyXCIsIGJhY2tncm91bmRDb2xvcjogXCIjZmZmZjAwXCIgfVxuICAgICAgICAvLyBsZXQgdGV4dCA9IHRoaXMuc2NvcGUuZ2FtZS5hZGQudGV4dChsZWRnZS54LCBsZWRnZS55LCBsZWRnZS5pZCwgc3R5bGUpXG4gICAgICAgIC8vIHRleHQuYWxwaGEgPSAwLjJcbiAgICB9KVxufVxuXG5NYXBDdGYxLmNyZWF0ZVNreVNwcml0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2NvcGUuYWRkLnRpbGVTcHJpdGUoMCwgdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDE1MDAsIHRoaXMuc2NvcGUuZ2FtZS53b3JsZC53aWR0aCwgMTUwMCwgJ3RyZWVzY2FwZScpXG59XG5cbk1hcEN0ZjEuY3JlYXRlUGxhdGZvcm1zID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zY29wZS5wbGF0Zm9ybXMgPSB0aGlzLnNjb3BlLmFkZC5ncm91cCgpXG4gICAgdGhpcy5zY29wZS5wbGF0Zm9ybXMuZW5hYmxlQm9keSA9IHRydWVcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBNYXBDdGYxXG4iXX0=
