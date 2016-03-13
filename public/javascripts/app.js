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
    },

    playerById: function playerById(id) {
        for (var i = 0; i < this.enemies.length; i++) {
            if (this.enemies[i].id === id) {
                return this.enemies[i];
            }
        }

        return false;
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
        console.log('Connected to socket server', '/#' + this.socket.id);
        this.player.id = '/#' + this.socket.id;

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
        var duplicate = this.playerById(data.id);
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
        var movePlayer = this.playerById(data.id);

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
        var removePlayer = this.playerById(data.id);

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
    //  Collide the player and the stars with the platforms
    this.physics.arcade.collide(this.player, this.platforms);
    this.physics.arcade.collide(this.enemies, this.platforms);
    this.physics.arcade.collide(this.platforms, this.weapons, function (platform, weapon) {
        weapon.kill();
    }, null, this);

    // this.enemies.forEach((enemy) => {
    //     this.game.physics.arcade.overlap(enemy, this.weapons, (enemy, weapon) => {
    //         enemy.health -= weapon.damage
    //         console.log(this.player)
    //         this.socket.emit('damaged player', {
    //             attackingPlayerId: '/#' + this.socket.id,
    //             damagedPlayerId: enemy.id,
    //             damage: weapon.damage
    //         })
    //         weapon.kill()
    //         console.log('You hit them!', enemy.health, weapon.damage, enemy)
    //     }, null, this)
    // })

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

    console.log('Emitting new position...', this.player.id, this.player.x, this.player.y);
    this.socket.emit('move player', {
        x: this.player.x,
        y: this.player.y
    });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvYXBwLmpzIiwiYXNzZXRzL2pzL2xpYi9CdWxsZXQuanMiLCJhc3NldHMvanMvbGliL2NsaWVudElucHV0SGFuZGxlci5qcyIsImFzc2V0cy9qcy9saWIvY2xpZW50U29ja2V0SGFuZGxlci5qcyIsImFzc2V0cy9qcy9saWIvZ2FtZS9jcmVhdGUuanMiLCJhc3NldHMvanMvbGliL2dhbWUvaW5pdC5qcyIsImFzc2V0cy9qcy9saWIvZ2FtZS9wcmVsb2FkLmpzIiwiYXNzZXRzL2pzL2xpYi9nYW1lL3VwZGF0ZS5qcyIsImFzc2V0cy9qcy9saWIvZ3VpZC5qcyIsImFzc2V0cy9qcy9saWIvcGxheWVyLmpzIiwiYXNzZXRzL2pzL2xpYi9yZW1vdGVQbGF5ZXIuanMiLCJhc3NldHMvanMvbGliL3dlYXBvbnMvYUs0Ny5qcyIsImFzc2V0cy9qcy9saWIvd2VhcG9ucy9iYXJyZXRNODJBMS5qcyIsImFzc2V0cy9qcy9saWIvd2VhcG9ucy9pbmRleC5qcyIsImFzc2V0cy9qcy9tYXBzL2ZvcmVzdGlhLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7O0FBRUEsSUFBSSxPQUFPLFFBQVEsWUFBUixDQUFQOzs7QUFHSixJQUFJLE9BQU8sUUFBUSxpQkFBUixDQUFQO0FBQ0osSUFBSSxVQUFVLFFBQVEsb0JBQVIsQ0FBVjtBQUNKLElBQUksU0FBUyxRQUFRLG1CQUFSLENBQVQ7QUFDSixJQUFJLFNBQVMsUUFBUSxtQkFBUixDQUFUOztBQUVKLElBQUksc0JBQXNCLFFBQVEsMkJBQVIsQ0FBdEI7QUFDSixJQUFJLG9CQUFvQixRQUFRLDBCQUFSLENBQXBCOztBQUVKLElBQUksWUFBWSxPQUFPLFVBQVA7QUFDaEIsSUFBSSxhQUFhLE9BQU8sV0FBUDtBQUNqQixJQUFJLE9BQU8sSUFBSSxPQUFPLElBQVAsQ0FBWSxTQUFoQixFQUEyQixVQUEzQixFQUF1QyxPQUFP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QUFDLEtBQUQsRUFBVzs7QUFFdEIsWUFBSSxXQUFXLE1BQUssS0FBTCxDQUFXLFNBQVgsQ0FBcUIsTUFBckIsQ0FBNEIsTUFBTSxDQUFOLEVBQVMsTUFBTSxDQUFOLENBQWhELENBRmtCO0FBR3RCLGlCQUFTLE1BQVQsR0FBa0IsTUFBTSxNQUFOLENBSEk7QUFJdEIsaUJBQVMsS0FBVCxHQUFpQixNQUFNLEtBQU47Ozs7Ozs7QUFKSyxLQUFYLENBQWYsQ0E3QjhCO0NBQVg7O0FBMkN2QixRQUFRLGVBQVIsR0FBMEIsWUFBVztBQUNqQyxTQUFLLEtBQUwsQ0FBVyxHQUFYLENBQWUsVUFBZixDQUEwQixDQUExQixFQUE2QixLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEtBQWhCLENBQXNCLE1BQXRCLEdBQStCLElBQS9CLEVBQXFDLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsS0FBaEIsQ0FBc0IsS0FBdEIsRUFBNkIsSUFBL0YsRUFBcUcsV0FBckcsRUFEaUM7Q0FBWDs7QUFJMUIsUUFBUSxlQUFSLEdBQTBCLFlBQVc7QUFDakMsU0FBSyxLQUFMLENBQVcsU0FBWCxHQUF1QixLQUFLLEtBQUwsQ0FBVyxHQUFYLENBQWUsS0FBZixFQUF2QixDQURpQztBQUVqQyxTQUFLLEtBQUwsQ0FBVyxTQUFYLENBQXFCLFVBQXJCLEdBQWtDLElBQWxDLENBRmlDO0NBQVg7O0FBSzFCLE9BQU8sT0FBUCxHQUFpQixPQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCdcblxubGV0IGd1aWQgPSByZXF1aXJlKCcuL2xpYi9ndWlkJylcblxuLy8gR2FtZSBmdW5jdGlvbnNcbmxldCBpbml0ID0gcmVxdWlyZSgnLi9saWIvZ2FtZS9pbml0JylcbmxldCBwcmVsb2FkID0gcmVxdWlyZSgnLi9saWIvZ2FtZS9wcmVsb2FkJylcbmxldCBjcmVhdGUgPSByZXF1aXJlKCcuL2xpYi9nYW1lL2NyZWF0ZScpXG5sZXQgdXBkYXRlID0gcmVxdWlyZSgnLi9saWIvZ2FtZS91cGRhdGUnKVxuXG5sZXQgY2xpZW50U29ja2V0SGFuZGxlciA9IHJlcXVpcmUoJy4vbGliL2NsaWVudFNvY2tldEhhbmRsZXInKVxubGV0IGNsaWVuSW5wdXRIYW5kbGVyID0gcmVxdWlyZSgnLi9saWIvY2xpZW50SW5wdXRIYW5kbGVyJylcblxubGV0IGdhbWVXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXG5sZXQgZ2FtZUhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodFxubGV0IGdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoZ2FtZVdpZHRoLCBnYW1lSGVpZ2h0LCBQaGFzZXIuQVVUTywgJ3Jhbmdlci1zdGV2ZS1nYW1lJyk7XG5cbnZhciBSYW5nZXJTdGV2ZUdhbWUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmNsaWVudElkID0gZ3VpZCgpXG4gICAgdGhpcy5jdXJyZW50V2VhcG9uID0gMDtcbiAgICB0aGlzLmVuZW1pZXMgPSBbXVxuICAgIHRoaXMuZ2FtZSA9IGdhbWVcbiAgICB0aGlzLmdyb3VuZFxuICAgIHRoaXMucGxhdGZvcm1zXG4gICAgdGhpcy5wbGF5ZXJcbiAgICB0aGlzLnNjb3JlID0gMFxuICAgIHRoaXMuc2NvcmVUZXh0XG4gICAgdGhpcy5zb2NrZXRcbiAgICB0aGlzLndlYXBvbk5hbWUgPSBudWxsO1xuICAgIHRoaXMud2VhcG9ucyA9IFtdO1xufVxuXG5SYW5nZXJTdGV2ZUdhbWUucHJvdG90eXBlID0ge1xuICAgIC8vIEdhbWUgZnVuY3Rpb25zXG4gICAgaW5pdCxcbiAgICBwcmVsb2FkLFxuICAgIGNyZWF0ZSxcbiAgICB1cGRhdGUsXG5cbiAgICAvLyBTb2NrZXQgZXZlbnRzXG4gICAgc2V0RXZlbnRIYW5kbGVyczogY2xpZW50U29ja2V0SGFuZGxlci5zZXRFdmVudEhhbmRsZXJzLFxuICAgIG9uU29ja2V0Q29ubmVjdGVkOiBjbGllbnRTb2NrZXRIYW5kbGVyLm9uU29ja2V0Q29ubmVjdGVkLFxuICAgIG9uU29ja2V0RGlzY29ubmVjdDogY2xpZW50U29ja2V0SGFuZGxlci5vblNvY2tldERpc2Nvbm5lY3QsXG4gICAgb25OZXdQbGF5ZXI6IGNsaWVudFNvY2tldEhhbmRsZXIub25OZXdQbGF5ZXIsXG4gICAgb25EZWFkUGxheWVyOiBjbGllbnRTb2NrZXRIYW5kbGVyLm9uRGVhZFBsYXllcixcbiAgICBvbk1vdmVQbGF5ZXI6IGNsaWVudFNvY2tldEhhbmRsZXIub25Nb3ZlUGxheWVyLFxuICAgIG9uUmVtb3ZlUGxheWVyOiBjbGllbnRTb2NrZXRIYW5kbGVyLm9uUmVtb3ZlUGxheWVyLFxuXG4gICAgLy8gSW5wdXQgY29udHJvbHNcbiAgICBsZWZ0SW5wdXRJc0FjdGl2ZTogY2xpZW5JbnB1dEhhbmRsZXIubGVmdElucHV0SXNBY3RpdmUsXG4gICAgcmlnaHRJbnB1dElzQWN0aXZlOiBjbGllbklucHV0SGFuZGxlci5yaWdodElucHV0SXNBY3RpdmUsXG4gICAgdXBJbnB1dElzQWN0aXZlOiBjbGllbklucHV0SGFuZGxlci51cElucHV0SXNBY3RpdmUsXG4gICAgdXBJbnB1dFJlbGVhc2VkOiBjbGllbklucHV0SGFuZGxlci51cElucHV0UmVsZWFzZWQsXG5cbiAgICBuZXh0V2VhcG9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gIFRpZHktdXAgdGhlIGN1cnJlbnQgd2VhcG9uXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRXZWFwb24gPiA5KVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS5yZXNldCgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0udmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0uY2FsbEFsbCgncmVzZXQnLCBudWxsLCAwLCAwKTtcbiAgICAgICAgICAgIHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLnNldEFsbCgnZXhpc3RzJywgZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gIEFjdGl2YXRlIHRoZSBuZXcgb25lXG4gICAgICAgIHRoaXMuY3VycmVudFdlYXBvbisrO1xuXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRXZWFwb24gPT09IHRoaXMud2VhcG9ucy5sZW5ndGgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFdlYXBvbiA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS52aXNpYmxlID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLndlYXBvbk5hbWUudGV4dCA9IHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLm5hbWVcbiAgICB9LFxuXG4gICAgcGxheWVyQnlJZDogZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmVuZW1pZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmVuZW1pZXNbaV0uaWQgPT09IGlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZW5lbWllc1tpXVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxufVxuXG5nYW1lLnN0YXRlLmFkZCgnR2FtZScsIFJhbmdlclN0ZXZlR2FtZSwgdHJ1ZSlcbiIsIid1c2Ugc3RyaWN0J1xuXG52YXIgQnVsbGV0ID0gZnVuY3Rpb24gKGdhbWUsIGtleSkge1xuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCAwLCAwLCBrZXkpXG5cbiAgICB0aGlzLnRleHR1cmUuYmFzZVRleHR1cmUuc2NhbGVNb2RlID0gUElYSS5zY2FsZU1vZGVzLk5FQVJFU1RcblxuICAgIHRoaXMuYW5jaG9yLnNldCgwLjUpXG5cbiAgICB0aGlzLmNoZWNrV29ybGRCb3VuZHMgPSB0cnVlXG4gICAgdGhpcy5vdXRPZkJvdW5kc0tpbGwgPSB0cnVlXG4gICAgdGhpcy5leGlzdHMgPSBmYWxzZVxuXG4gICAgdGhpcy50cmFja2luZyA9IGZhbHNlXG4gICAgdGhpcy5zY2FsZVNwZWVkID0gMFxufVxuXG5CdWxsZXQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSlcbkJ1bGxldC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBCdWxsZXRcblxuQnVsbGV0LnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24gKHgsIHksIGFuZ2xlLCBzcGVlZCwgZ3gsIGd5KSB7XG4gICAgZ3ggPSBneCB8fCAwXG4gICAgZ3kgPSBneSB8fCAwXG4gICAgdGhpcy5yZXNldCh4LCB5KVxuICAgIC8vIHRoaXMuc2NhbGUuc2V0KDEpXG5cbiAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUubW92ZVRvUG9pbnRlcih0aGlzLCBzcGVlZClcbiAgICBjb25zb2xlLmxvZygpXG4gICAgdGhpcy5ib2R5LmdyYXZpdHkueSA9IC0xODAwXG59XG5cbkJ1bGxldC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnRyYWNraW5nKVxuICAgIHtcbiAgICAgICAgdGhpcy5yb3RhdGlvbiA9IE1hdGguYXRhbjIodGhpcy5ib2R5LnZlbG9jaXR5LnksIHRoaXMuYm9keS52ZWxvY2l0eS54KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zY2FsZVNwZWVkID4gMClcbiAgICB7XG4gICAgICAgIHRoaXMuc2NhbGUueCArPSB0aGlzLnNjYWxlU3BlZWQ7XG4gICAgICAgIHRoaXMuc2NhbGUueSArPSB0aGlzLnNjYWxlU3BlZWQ7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1bGxldFxuIiwiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIC8vIFRoaXMgZnVuY3Rpb24gc2hvdWxkIHJldHVybiB0cnVlIHdoZW4gdGhlIHBsYXllciBhY3RpdmF0ZXMgdGhlIFwiZ28gbGVmdFwiIGNvbnRyb2xcbiAgICAvLyBJbiB0aGlzIGNhc2UsIGVpdGhlciBob2xkaW5nIHRoZSByaWdodCBhcnJvdyBvciB0YXBwaW5nIG9yIGNsaWNraW5nIG9uIHRoZSBsZWZ0XG4gICAgLy8gc2lkZSBvZiB0aGUgc2NyZWVuLlxuICAgIGxlZnRJbnB1dElzQWN0aXZlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5wdXQua2V5Ym9hcmQuaXNEb3duKFBoYXNlci5LZXlib2FyZC5BKVxuICAgIH0sXG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIHNob3VsZCByZXR1cm4gdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgYWN0aXZhdGVzIHRoZSBcImdvIHJpZ2h0XCIgY29udHJvbFxuICAgIC8vIEluIHRoaXMgY2FzZSwgZWl0aGVyIGhvbGRpbmcgdGhlIHJpZ2h0IGFycm93IG9yIHRhcHBpbmcgb3IgY2xpY2tpbmcgb24gdGhlIHJpZ2h0XG4gICAgLy8gc2lkZSBvZiB0aGUgc2NyZWVuLlxuICAgIHJpZ2h0SW5wdXRJc0FjdGl2ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlucHV0LmtleWJvYXJkLmlzRG93bihQaGFzZXIuS2V5Ym9hcmQuRClcbiAgICB9LFxuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiBzaG91bGQgcmV0dXJuIHRydWUgd2hlbiB0aGUgcGxheWVyIGFjdGl2YXRlcyB0aGUgXCJqdW1wXCIgY29udHJvbFxuICAgIC8vIEluIHRoaXMgY2FzZSwgZWl0aGVyIGhvbGRpbmcgdGhlIHVwIGFycm93IG9yIHRhcHBpbmcgb3IgY2xpY2tpbmcgb24gdGhlIGNlbnRlclxuICAgIC8vIHBhcnQgb2YgdGhlIHNjcmVlbi5cbiAgICB1cElucHV0SXNBY3RpdmU6IGZ1bmN0aW9uKGR1cmF0aW9uKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlucHV0LmtleWJvYXJkLmRvd25EdXJhdGlvbihQaGFzZXIuS2V5Ym9hcmQuVywgZHVyYXRpb24pO1xuICAgIH0sXG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIHJldHVybnMgdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgcmVsZWFzZXMgdGhlIFwianVtcFwiIGNvbnRyb2xcbiAgICB1cElucHV0UmVsZWFzZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnB1dC5rZXlib2FyZC51cER1cmF0aW9uKFBoYXNlci5LZXlib2FyZC5XKTtcbiAgICB9XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IHJlbW90ZVBsYXllciA9IHJlcXVpcmUoJy4vcmVtb3RlUGxheWVyJylcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgc2V0RXZlbnRIYW5kbGVyczogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBTb2NrZXQgY29ubmVjdGlvbiBzdWNjZXNzZnVsXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdjb25uZWN0JywgdGhpcy5vblNvY2tldENvbm5lY3RlZC5iaW5kKHRoaXMpKVxuXG4gICAgICAgIC8vIFNvY2tldCBkaXNjb25uZWN0aW9uXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdkaXNjb25uZWN0JywgdGhpcy5vblNvY2tldERpc2Nvbm5lY3QuYmluZCh0aGlzKSlcblxuICAgICAgICAvLyBOZXcgcGxheWVyIG1lc3NhZ2UgcmVjZWl2ZWRcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ25ldyBwbGF5ZXInLCB0aGlzLm9uTmV3UGxheWVyLmJpbmQodGhpcykpXG5cbiAgICAgICAgLy8gUGxheWVyIG1vdmUgbWVzc2FnZSByZWNlaXZlZFxuICAgICAgICB0aGlzLnNvY2tldC5vbignbW92ZSBwbGF5ZXInLCB0aGlzLm9uTW92ZVBsYXllci5iaW5kKHRoaXMpKVxuXG4gICAgICAgIC8vIFBsYXllciByZW1vdmVkIG1lc3NhZ2UgcmVjZWl2ZWRcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ3JlbW92ZSBwbGF5ZXInLCB0aGlzLm9uUmVtb3ZlUGxheWVyLmJpbmQodGhpcykpXG5cbiAgICAgICAgLy8gVXBkYXRlZCBwbGF5ZXIgbGlzdCByZWNlaXZlZFxuICAgICAgICAvLyB0aGlzLnNvY2tldC5vbigndXBkYXRlIHBsYXllcnMnLCB0aGlzLm9uVXBkYXRlUGxheWVycy5iaW5kKHRoaXMpKVxuXG4gICAgICAgIC8vIEEgcGxheWVyIGhhcyBkaWVkXG4gICAgICAgIC8vIHRoaXMuc29ja2V0Lm9uKCdkZWFkIHBsYXllcicsIHRoaXMub25EZWFkUGxheWVyLmJpbmQodGhpcykpXG5cbiAgICAgICAgY29uc29sZS5sb2coJ1NvY2tldCBldmVudHMgaW5pdGlhbGl6ZWQuJylcbiAgICB9LFxuXG4gICAgLy8gU29ja2V0IGNvbm5lY3RlZFxuICAgIG9uU29ja2V0Q29ubmVjdGVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0Nvbm5lY3RlZCB0byBzb2NrZXQgc2VydmVyJywgJy8jJyArIHRoaXMuc29ja2V0LmlkKVxuICAgICAgICB0aGlzLnBsYXllci5pZCA9ICcvIycgKyB0aGlzLnNvY2tldC5pZFxuXG4gICAgICAgICAvLyBSZXNldCBlbmVtaWVzIG9uIHJlY29ubmVjdFxuICAgICAgICB0aGlzLmVuZW1pZXMuZm9yRWFjaChmdW5jdGlvbiAoZW5lbXkpIHtcbiAgICAgICAgICAgIGVuZW15LnBsYXllci5raWxsKClcbiAgICAgICAgfSlcbiAgICAgICAgdGhpcy5lbmVtaWVzID0gW11cblxuICAgICAgICAvLyBTZW5kIGxvY2FsIHBsYXllciBkYXRhIHRvIHRoZSBnYW1lIHNlcnZlclxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCduZXcgcGxheWVyJywge1xuICAgICAgICAgICAgeDogdGhpcy5wbGF5ZXIueCxcbiAgICAgICAgICAgIHk6IHRoaXMucGxheWVyLnlcbiAgICAgICAgfSlcbiAgICB9LFxuXG4gICAgLy8gU29ja2V0IGRpc2Nvbm5lY3RlZFxuICAgIG9uU29ja2V0RGlzY29ubmVjdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdEaXNjb25uZWN0ZWQgZnJvbSBzb2NrZXQgc2VydmVyJylcbiAgICB9LFxuXG4gICAgb25VcGRhdGVQbGF5ZXJzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdVcGRhdGVkIHBsYXllciBsaXN0IHJlY2VpdmVkJywgZGF0YSlcbiAgICB9LFxuXG4gICAgLy8gTmV3IHBsYXllclxuICAgIG9uTmV3UGxheWVyOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdOZXcgcGxheWVyIGNvbm5lY3RlZDonLCBkYXRhLmlkKVxuXG4gICAgICAgIC8vIEF2b2lkIHBvc3NpYmxlIGR1cGxpY2F0ZSBwbGF5ZXJzXG4gICAgICAgIGxldCBkdXBsaWNhdGUgPSB0aGlzLnBsYXllckJ5SWQoZGF0YS5pZClcbiAgICAgICAgaWYgKGR1cGxpY2F0ZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0R1cGxpY2F0ZSBwbGF5ZXIhJylcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG5ld1JlbW90ZVBsYXllciA9IHJlbW90ZVBsYXllci5jcmVhdGUuY2FsbCh0aGlzLCB7XG4gICAgICAgICAgICB4OiBkYXRhLngsXG4gICAgICAgICAgICB5OiBkYXRhLnksXG4gICAgICAgICAgICBpZDogZGF0YS5pZFxuICAgICAgICB9KVxuXG4gICAgICAgIHRoaXMuZW5lbWllcy5wdXNoKG5ld1JlbW90ZVBsYXllcilcbiAgICB9LFxuXG4gICAgb25EZWFkUGxheWVyOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGlmIChkYXRhLmRlYWRQbGF5ZXJJZCAhPT0gKCcvIycgKyB0aGlzLnNvY2tldC5pZCkpXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICBjb25zb2xlLmxvZygnWU9VIERJRUQhISEnKVxuXG4gICAgICAgIHRoaXMucGxheWVyLnggPSAyMDBcbiAgICAgICAgdGhpcy5wbGF5ZXIueSA9IHRoaXMud29ybGQuaGVpZ2h0IC0gNDAwXG4gICAgfSxcblxuICAgIC8vIE1vdmUgcGxheWVyXG4gICAgb25Nb3ZlUGxheWVyOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBtb3ZlUGxheWVyID0gdGhpcy5wbGF5ZXJCeUlkKGRhdGEuaWQpXG5cbiAgICAgICAgLy8gUGxheWVyIG5vdCBmb3VuZFxuICAgICAgICBpZiAoISBtb3ZlUGxheWVyKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFVwZGF0ZSBwbGF5ZXIgcG9zaXRpb25cbiAgICAgICAgbW92ZVBsYXllci54ID0gZGF0YS54XG4gICAgICAgIG1vdmVQbGF5ZXIueSA9IGRhdGEueVxuXG4gICAgICAgIGlmIChtb3ZlUGxheWVyLnggPiBtb3ZlUGxheWVyLmxhc3RQb3NpdGlvbi54KSB7XG4gICAgICAgICAgICBtb3ZlUGxheWVyLmFuaW1hdGlvbnMucGxheSgncmlnaHQnKVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG1vdmVQbGF5ZXIueCA8IG1vdmVQbGF5ZXIubGFzdFBvc2l0aW9uLngpXG4gICAgICAgIHtcbiAgICAgICAgICAgIG1vdmVQbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdsZWZ0JylcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgIHtcbiAgICAgICAgICAgIG1vdmVQbGF5ZXIuYW5pbWF0aW9ucy5zdG9wKClcbiAgICAgICAgICAgIG1vdmVQbGF5ZXIuZnJhbWUgPSA0O1xuICAgICAgICB9XG5cbiAgICAgICAgbW92ZVBsYXllci5sYXN0UG9zaXRpb24ueCA9IG1vdmVQbGF5ZXIueFxuICAgICAgICBtb3ZlUGxheWVyLmxhc3RQb3NpdGlvbi55ID0gbW92ZVBsYXllci55XG4gICAgfSxcblxuICAgIC8vIFJlbW92ZSBwbGF5ZXJcbiAgICBvblJlbW92ZVBsYXllcjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgcmVtb3ZlUGxheWVyID0gdGhpcy5wbGF5ZXJCeUlkKGRhdGEuaWQpXG5cbiAgICAgICAgLy8gUGxheWVyIG5vdCBmb3VuZFxuICAgICAgICBpZiAoIXJlbW92ZVBsYXllcikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0Rpc2Nvbm5lY3RlZCBwbGF5ZXIgbm90IGZvdW5kOiAnLCBkYXRhKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICByZW1vdmVQbGF5ZXIua2lsbCgpXG5cbiAgICAgICAgLy8gUmVtb3ZlIHBsYXllciBmcm9tIGFycmF5XG4gICAgICAgIHRoaXMuZW5lbWllcy5zcGxpY2UodGhpcy5lbmVtaWVzLmluZGV4T2YocmVtb3ZlUGxheWVyKSwgMSlcbiAgICB9XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGZvcmVzdGlhID0gcmVxdWlyZSgnLi4vLi4vbWFwcy9mb3Jlc3RpYScpXG5sZXQgd2VhcG9ucyA9IHJlcXVpcmUoJy4uL3dlYXBvbnMnKVxubGV0IHBsYXllciA9IHJlcXVpcmUoJy4uL3BsYXllcicpXG5cbmxldCB3b3JsZFdpZHRoID0gNDAwMFxubGV0IHdvcmxkSGVpZ2h0ID0gMTUwMFxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIERlZmluZSBtb3ZlbWVudCBjb25zdGFudHNcbiAgICB0aGlzLk1BWF9TUEVFRCA9IDQwMDsgLy8gcGl4ZWxzL3NlY29uZFxuICAgIHRoaXMuQUNDRUxFUkFUSU9OID0gMTk2MDsgLy8gcGl4ZWxzL3NlY29uZC9zZWNvbmRcbiAgICB0aGlzLkRSQUcgPSAxNTAwOyAvLyBwaXhlbHMvc2Vjb25kXG4gICAgdGhpcy5HUkFWSVRZID0gMTkwMDsgLy8gcGl4ZWxzL3NlY29uZC9zZWNvbmRcbiAgICB0aGlzLkpVTVBfU1BFRUQgPSAtODUwOyAvLyBwaXhlbHMvc2Vjb25kIChuZWdhdGl2ZSB5IGlzIHVwKVxuICAgIHRoaXMuc29ja2V0ID0gaW8uY29ubmVjdCgpXG4gICAgdGhpcy5lbmVtaWVzID0gW11cblxuICAgIC8vICBXZSdyZSBnb2luZyB0byBiZSB1c2luZyBwaHlzaWNzLCBzbyBlbmFibGUgdGhlIEFyY2FkZSBQaHlzaWNzIHN5c3RlbVxuICAgIHRoaXMucGh5c2ljcy5zdGFydFN5c3RlbShQaGFzZXIuUGh5c2ljcy5BUkNBREUpXG5cbiAgICB0aGlzLndvcmxkLnNldEJvdW5kcygwLCAwLCB3b3JsZFdpZHRoLCB3b3JsZEhlaWdodClcbiAgICB0aGlzLmdhbWUuc3RhZ2UuYmFja2dyb3VuZENvbG9yID0gXCIjMkY5MUQwXCJcblxuICAgIC8vIFNjYWxlIGdhbWUgb24gd2luZG93IHJlc2l6ZVxuICAgIHRoaXMuZ2FtZS5zY2FsZS5zY2FsZU1vZGUgPSBQaGFzZXIuU2NhbGVNYW5hZ2VyLlJFU0laRTtcbiAgICB0aGlzLmdhbWUuc2NhbGUuc2V0U2hvd0FsbCgpO1xuICAgIHRoaXMuZ2FtZS5zY2FsZS5yZWZyZXNoKClcblxuICAgIC8vIFNpbmNlIHdlJ3JlIGp1bXBpbmcgd2UgbmVlZCBncmF2aXR5XG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmdyYXZpdHkueSA9IHRoaXMuR1JBVklUWTtcblxuICAgIC8vIEZsYWcgdG8gdHJhY2sgaWYgdGhlIGp1bXAgYnV0dG9uIGlzIHByZXNzZWRcbiAgICB0aGlzLmp1bXBpbmcgPSBmYWxzZTtcblxuXG4gICAgLyoqXG4gICAgICogTWFwXG4gICAgICovXG4gICAgZm9yZXN0aWEuY3JlYXRlKHRoaXMpXG5cblxuICAgIC8qKlxuICAgICAqIFBsYXllciBTZXR0aW5nc1xuICAgICAqL1xuICAgIHRoaXMucGxheWVyID0gcGxheWVyLmNyZWF0ZS5jYWxsKHRoaXMpXG5cblxuICAgIC8qKlxuICAgICAqIFdlYXBvbnNcbiAgICAgKi9cbiAgICB0aGlzLmN1cnJlbnRXZWFwb24gPSAwO1xuICAgIHRoaXMud2VhcG9ucy5wdXNoKG5ldyB3ZWFwb25zLmFLNDcodGhpcy5nYW1lKSlcbiAgICB0aGlzLndlYXBvbnMucHVzaChuZXcgd2VhcG9ucy5iYXJyZXRNODJBMSh0aGlzLmdhbWUpKVxuXG5cbiAgICAvKipcbiAgICAgKiBUZXh0XG4gICAgICovXG4gICAgbGV0IHRleHRTdHlsZXMgPSB7IGZvbnRTaXplOiAnMjRweCcsIGZpbGw6ICcjMDAwJyB9XG4gICAgdGhpcy5zY29yZVRleHQgPSB0aGlzLmFkZC50ZXh0KDI1LCAyNSwgJ1Njb3JlOiAwJywgdGV4dFN0eWxlcylcbiAgICB0aGlzLnNjb3JlVGV4dC5maXhlZFRvQ2FtZXJhID0gdHJ1ZVxuICAgIHRoaXMud2VhcG9uTmFtZSA9IHRoaXMuYWRkLnRleHQodGhpcy5jYW1lcmEud2lkdGggLSAxMDAsIHRoaXMuY2FtZXJhLmhlaWdodCAtIDQ1LCAnQUstNDcnLCB0ZXh0U3R5bGVzKVxuICAgIHRoaXMud2VhcG9uTmFtZS5maXhlZFRvQ2FtZXJhID0gdHJ1ZVxuICAgIHRoaXMuY3VycmVudEhlYWx0aFRleHQgPSB0aGlzLmFkZC50ZXh0KHRoaXMuY2FtZXJhLnggKyAyNSwgdGhpcy5jYW1lcmEuaGVpZ2h0IC0gNDUsICcxMDAnLCB0ZXh0U3R5bGVzKVxuICAgIHRoaXMuY3VycmVudEhlYWx0aFRleHQuZml4ZWRUb0NhbWVyYSA9IHRydWVcblxuXG4gICAgLyoqXG4gICAgICogQ2FtZXJhIFNldHRpbmdzXG4gICAgICovXG4gICAgdGhpcy5jYW1lcmEuZm9sbG93KHRoaXMucGxheWVyKTtcblxuICAgIHZhciBjaGFuZ2VLZXkgPSB0aGlzLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuRU5URVIpO1xuICAgIGNoYW5nZUtleS5vbkRvd24uYWRkKHRoaXMubmV4dFdlYXBvbiwgdGhpcylcblxuXG4gICAgLyoqXG4gICAgICogUmVzaXppbmcgRXZlbnRzXG4gICAgICovXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICgpID0+IHtcbiAgICAgICAgdGhpcy5nYW1lLnNjYWxlLnJlZnJlc2goKVxuICAgICAgICB0aGlzLmdhbWUuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0XG4gICAgICAgIHRoaXMuZ2FtZS53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXG5cbiAgICAgICAgdGhpcy53ZWFwb25OYW1lLmNhbWVyYU9mZnNldC54ID0gdGhpcy5jYW1lcmEud2lkdGggLSAxMDBcbiAgICAgICAgdGhpcy53ZWFwb25OYW1lLmNhbWVyYU9mZnNldC55ID0gdGhpcy5jYW1lcmEuaGVpZ2h0IC0gNDVcblxuICAgICAgICB0aGlzLnNjb3JlVGV4dC5jYW1lcmFPZmZzZXQueCA9IDI1XG4gICAgICAgIHRoaXMuc2NvcmVUZXh0LmNhbWVyYU9mZnNldC55ID0gMjVcbiAgICB9KVxuXG5cbiAgICAvKipcbiAgICAgKiBTdGFydCBsaXN0ZW5pbmcgZm9yIGV2ZW50c1xuICAgICAqL1xuICAgIHRoaXMuc2V0RXZlbnRIYW5kbGVycygpXG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmdhbWUucmVuZGVyZXIucmVuZGVyU2Vzc2lvbi5yb3VuZFBpeGVscyA9IHRydWVcbiAgICB0aGlzLmdhbWUuc3RhZ2UuZGlzYWJsZVZpc2liaWxpdHlDaGFuZ2UgPSB0cnVlXG4gICAgdGhpcy5waHlzaWNzLnN0YXJ0U3lzdGVtKFBoYXNlci5QaHlzaWNzLkFSQ0FERSlcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMubG9hZC5pbWFnZSgnYnVsbGV0MTEnLCAnL2ltYWdlcy9idWxsZXQxMS5wbmcnKVxuICAgIHRoaXMubG9hZC5pbWFnZSgnYnVsbGV0MTAnLCAnL2ltYWdlcy9idWxsZXQxMC5wbmcnKVxuICAgIHRoaXMubG9hZC5pbWFnZSgnYnVsbGV0OScsICcvaW1hZ2VzL2J1bGxldDkucG5nJylcbiAgICB0aGlzLmxvYWQuaW1hZ2UoJ2J1bGxldDgnLCAnL2ltYWdlcy9idWxsZXQ4LnBuZycpXG4gICAgdGhpcy5sb2FkLmltYWdlKCdidWxsZXQ3JywgJy9pbWFnZXMvYnVsbGV0Ny5wbmcnKVxuICAgIHRoaXMubG9hZC5pbWFnZSgnYnVsbGV0NScsICcvaW1hZ2VzL2J1bGxldDUucG5nJylcbiAgICB0aGlzLmxvYWQuaW1hZ2UoJ2J1bGxldDQnLCAnL2ltYWdlcy9idWxsZXQ0LnBuZycpXG4gICAgdGhpcy5sb2FkLmltYWdlKCd0cmVlc2NhcGUnLCAnL2ltYWdlcy9tYXAtY3RmMS5wbmcnKVxuICAgIHRoaXMubG9hZC5pbWFnZSgnZ3JvdW5kJywgJy9pbWFnZXMvcGxhdGZvcm0ucG5nJylcbiAgICB0aGlzLmxvYWQuc3ByaXRlc2hlZXQoJ2R1ZGUnLCAnL2ltYWdlcy9kdWRlLnBuZycsIDMyLCA0OClcbiAgICB0aGlzLmxvYWQuc3ByaXRlc2hlZXQoJ2VuZW15JywgJy9pbWFnZXMvZHVkZS5wbmcnLCAzMiwgNDgpXG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICAvLyAgQ29sbGlkZSB0aGUgcGxheWVyIGFuZCB0aGUgc3RhcnMgd2l0aCB0aGUgcGxhdGZvcm1zXG4gICAgdGhpcy5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMucGxheWVyLCB0aGlzLnBsYXRmb3JtcylcbiAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5lbmVtaWVzLCB0aGlzLnBsYXRmb3JtcylcbiAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5wbGF0Zm9ybXMsIHRoaXMud2VhcG9ucywgZnVuY3Rpb24ocGxhdGZvcm0sIHdlYXBvbikge1xuICAgICAgICB3ZWFwb24ua2lsbCgpXG4gICAgfSwgbnVsbCwgdGhpcyk7XG5cbiAgICAvLyB0aGlzLmVuZW1pZXMuZm9yRWFjaCgoZW5lbXkpID0+IHtcbiAgICAvLyAgICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLm92ZXJsYXAoZW5lbXksIHRoaXMud2VhcG9ucywgKGVuZW15LCB3ZWFwb24pID0+IHtcbiAgICAvLyAgICAgICAgIGVuZW15LmhlYWx0aCAtPSB3ZWFwb24uZGFtYWdlXG4gICAgLy8gICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnBsYXllcilcbiAgICAvLyAgICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ2RhbWFnZWQgcGxheWVyJywge1xuICAgIC8vICAgICAgICAgICAgIGF0dGFja2luZ1BsYXllcklkOiAnLyMnICsgdGhpcy5zb2NrZXQuaWQsXG4gICAgLy8gICAgICAgICAgICAgZGFtYWdlZFBsYXllcklkOiBlbmVteS5pZCxcbiAgICAvLyAgICAgICAgICAgICBkYW1hZ2U6IHdlYXBvbi5kYW1hZ2VcbiAgICAvLyAgICAgICAgIH0pXG4gICAgLy8gICAgICAgICB3ZWFwb24ua2lsbCgpXG4gICAgLy8gICAgICAgICBjb25zb2xlLmxvZygnWW91IGhpdCB0aGVtIScsIGVuZW15LmhlYWx0aCwgd2VhcG9uLmRhbWFnZSwgZW5lbXkpXG4gICAgLy8gICAgIH0sIG51bGwsIHRoaXMpXG4gICAgLy8gfSlcblxuICAgIGlmICh0aGlzLmxlZnRJbnB1dElzQWN0aXZlKCkpIHtcbiAgICAgICAgLy8gSWYgdGhlIExFRlQga2V5IGlzIGRvd24sIHNldCB0aGUgcGxheWVyIHZlbG9jaXR5IHRvIG1vdmUgbGVmdFxuICAgICAgICB0aGlzLnBsYXllci5ib2R5LmFjY2VsZXJhdGlvbi54ID0gLXRoaXMuQUNDRUxFUkFUSU9OO1xuICAgICAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLnBsYXkoJ2xlZnQnKVxuICAgIH0gZWxzZSBpZiAodGhpcy5yaWdodElucHV0SXNBY3RpdmUoKSkge1xuICAgICAgICAvLyBJZiB0aGUgUklHSFQga2V5IGlzIGRvd24sIHNldCB0aGUgcGxheWVyIHZlbG9jaXR5IHRvIG1vdmUgcmlnaHRcbiAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5hY2NlbGVyYXRpb24ueCA9IHRoaXMuQUNDRUxFUkFUSU9OO1xuICAgICAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLnBsYXkoJ3JpZ2h0JylcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBTdGFuZCBzdGlsbFxuICAgICAgICB0aGlzLnBsYXllci5ib2R5LmFjY2VsZXJhdGlvbi54ID0gMFxuICAgICAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLnN0b3AoKVxuICAgICAgICB0aGlzLnBsYXllci5mcmFtZSA9IDRcbiAgICB9XG5cbiAgICAvLyBTZXQgYSB2YXJpYWJsZSB0aGF0IGlzIHRydWUgd2hlbiB0aGUgcGxheWVyIGlzIHRvdWNoaW5nIHRoZSBncm91bmRcbiAgICB2YXIgb25UaGVHcm91bmQgPSB0aGlzLnBsYXllci5ib2R5LnRvdWNoaW5nLmRvd247XG5cbiAgICAvLyBJZiB0aGUgcGxheWVyIGlzIHRvdWNoaW5nIHRoZSBncm91bmQsIGxldCBoaW0gaGF2ZSAyIGp1bXBzXG4gICAgaWYgKG9uVGhlR3JvdW5kKSB7XG4gICAgICAgIHRoaXMuanVtcHMgPSAyO1xuICAgICAgICB0aGlzLmp1bXBpbmcgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBKdW1wIVxuICAgIGlmICh0aGlzLmp1bXBzID4gMCAmJiB0aGlzLnVwSW5wdXRJc0FjdGl2ZSg1KSkge1xuICAgICAgICB0aGlzLnBsYXllci5ib2R5LnZlbG9jaXR5LnkgPSB0aGlzLkpVTVBfU1BFRUQ7XG4gICAgICAgIHRoaXMuanVtcGluZyA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gUmVkdWNlIHRoZSBudW1iZXIgb2YgYXZhaWxhYmxlIGp1bXBzIGlmIHRoZSBqdW1wIGlucHV0IGlzIHJlbGVhc2VkXG4gICAgaWYgKHRoaXMuanVtcGluZyAmJiB0aGlzLnVwSW5wdXRSZWxlYXNlZCgpKSB7XG4gICAgICAgIHRoaXMuanVtcHMtLTtcbiAgICAgICAgdGhpcy5qdW1waW5nID0gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gRmlyZSBjdXJyZW50IHdlYXBvblxuICAgIGlmICh0aGlzLmdhbWUuaW5wdXQuYWN0aXZlUG9pbnRlci5pc0Rvd24pXG4gICAge1xuICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS5maXJlKHRoaXMucGxheWVyKTtcbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZygnRW1pdHRpbmcgbmV3IHBvc2l0aW9uLi4uJywgdGhpcy5wbGF5ZXIuaWQsIHRoaXMucGxheWVyLngsIHRoaXMucGxheWVyLnkpXG4gICAgdGhpcy5zb2NrZXQuZW1pdCgnbW92ZSBwbGF5ZXInLCB7XG4gICAgICAgIHg6IHRoaXMucGxheWVyLngsXG4gICAgICAgIHk6IHRoaXMucGxheWVyLnlcbiAgICB9KVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ3VpZEdlbmVyYXRvcigpIHtcbiAgICB2YXIgUzQgPSBmdW5jdGlvbigpIHtcbiAgICAgICByZXR1cm4gKCgoMStNYXRoLnJhbmRvbSgpKSoweDEwMDAwKXwwKS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpXG4gICAgfVxuXG4gICAgcmV0dXJuIChTNCgpK1M0KCkrXCItXCIrUzQoKStcIi1cIitTNCgpK1wiLVwiK1M0KCkrXCItXCIrUzQoKStTNCgpK1M0KCkpXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IFBsYXllciA9IHt9XG5cblBsYXllci5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgbmV3UGxheWVyID0gdGhpcy5hZGQuc3ByaXRlKDIwMCwgdGhpcy53b3JsZC5oZWlnaHQgLSA0MDAsICdkdWRlJyk7XG5cbiAgICAvLyAgV2UgbmVlZCB0byBlbmFibGUgcGh5c2ljcyBvbiB0aGUgcGxheWVyXG4gICAgdGhpcy5waHlzaWNzLmFyY2FkZS5lbmFibGUobmV3UGxheWVyKTtcblxuICAgIC8vIEVuYWJsZSBwaHlzaWNzIG9uIHRoZSBwbGF5ZXJcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5lbmFibGUobmV3UGxheWVyLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuXG4gICAgLy8gTWFrZSBwbGF5ZXIgY29sbGlkZSB3aXRoIHdvcmxkIGJvdW5kYXJpZXMgc28gaGUgZG9lc24ndCBsZWF2ZSB0aGUgc3RhZ2VcbiAgICBuZXdQbGF5ZXIuYm9keS5jb2xsaWRlV29ybGRCb3VuZHMgPSB0cnVlO1xuXG4gICAgLy8gU2V0IHBsYXllciBtaW5pbXVtIGFuZCBtYXhpbXVtIG1vdmVtZW50IHNwZWVkXG4gICAgbmV3UGxheWVyLmJvZHkubWF4VmVsb2NpdHkuc2V0VG8odGhpcy5NQVhfU1BFRUQsIHRoaXMuTUFYX1NQRUVEICogMTApOyAvLyB4LCB5XG5cbiAgICAvLyBBZGQgZHJhZyB0byB0aGUgcGxheWVyIHRoYXQgc2xvd3MgdGhlbSBkb3duIHdoZW4gdGhleSBhcmUgbm90IGFjY2VsZXJhdGluZ1xuICAgIG5ld1BsYXllci5ib2R5LmRyYWcuc2V0VG8odGhpcy5EUkFHLCAwKTsgLy8geCwgeVxuXG4gICAgLy8gIE91ciB0d28gYW5pbWF0aW9ucywgd2Fsa2luZyBsZWZ0IGFuZCByaWdodC5cbiAgICBuZXdQbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ2xlZnQnLCBbMCwgMSwgMiwgM10sIDEwLCB0cnVlKVxuICAgIG5ld1BsYXllci5hbmltYXRpb25zLmFkZCgncmlnaHQnLCBbNSwgNiwgNywgOF0sIDEwLCB0cnVlKVxuICAgIG5ld1BsYXllci5zY29yZSA9IDBcblxuICAgIHJldHVybiBuZXdQbGF5ZXJcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXJcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgUmVtb3RlUGxheWVyID0ge31cblxuUmVtb3RlUGxheWVyLmNyZWF0ZSA9IGZ1bmN0aW9uKGNvbmZpZykge1xuICAgIC8vIEFkZCBuZXcgcGxheWVyIHRvIHRoZSByZW1vdGUgcGxheWVycyBhcnJheVxuICAgIGxldCBuZXdSZW1vdGVQbGF5ZXIgPSB0aGlzLmFkZC5zcHJpdGUoY29uZmlnLngsIGNvbmZpZy55LCAnZHVkZScpO1xuICAgIG5ld1JlbW90ZVBsYXllci5pZCA9IGNvbmZpZy5pZFxuICAgIG5ld1JlbW90ZVBsYXllci5sYXN0UG9zaXRpb24gPSB7XG4gICAgICAgIHg6IGNvbmZpZy54LFxuICAgICAgICB5OiBjb25maWcueVxuICAgIH1cblxuICAgIC8vICBXZSBuZWVkIHRvIGVuYWJsZSBwaHlzaWNzIG9uIHRoZSBwbGF5ZXJcbiAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmVuYWJsZShuZXdSZW1vdGVQbGF5ZXIpXG5cbiAgICAvLyBFbmFibGUgcGh5c2ljcyBvbiB0aGUgcGxheWVyXG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuZW5hYmxlKG5ld1JlbW90ZVBsYXllciwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKVxuXG4gICAgLy8gTWFrZSBwbGF5ZXIgY29sbGlkZSB3aXRoIHdvcmxkIGJvdW5kYXJpZXMgc28gaGUgZG9lc24ndCBsZWF2ZSB0aGUgc3RhZ2VcbiAgICBuZXdSZW1vdGVQbGF5ZXIuYm9keS5jb2xsaWRlV29ybGRCb3VuZHMgPSB0cnVlO1xuXG4gICAgLy8gU2V0IHBsYXllciBtaW5pbXVtIGFuZCBtYXhpbXVtIG1vdmVtZW50IHNwZWVkXG4gICAgbmV3UmVtb3RlUGxheWVyLmJvZHkubWF4VmVsb2NpdHkuc2V0VG8odGhpcy5NQVhfU1BFRUQsIHRoaXMuTUFYX1NQRUVEICogMTApOyAvLyB4LCB5XG5cbiAgICAvLyBBZGQgZHJhZyB0byB0aGUgcGxheWVyIHRoYXQgc2xvd3MgdGhlbSBkb3duIHdoZW4gdGhleSBhcmUgbm90IGFjY2VsZXJhdGluZ1xuICAgIG5ld1JlbW90ZVBsYXllci5ib2R5LmRyYWcuc2V0VG8odGhpcy5EUkFHLCAwKTsgLy8geCwgeVxuXG4gICAgbmV3UmVtb3RlUGxheWVyLmhlYWx0aCA9IDEwMFxuXG4gICAgbmV3UmVtb3RlUGxheWVyLmFuaW1hdGlvbnMuYWRkKCdsZWZ0JywgWzAsIDEsIDIsIDNdLCAxMCwgdHJ1ZSlcbiAgICBuZXdSZW1vdGVQbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ3JpZ2h0JywgWzUsIDYsIDcsIDhdLCAxMCwgdHJ1ZSlcblxuICAgIHJldHVybiBuZXdSZW1vdGVQbGF5ZXJcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBSZW1vdGVQbGF5ZXJcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgQnVsbGV0ID0gcmVxdWlyZSgnLi4vQnVsbGV0JylcblxubGV0IEFLNDcgPSBmdW5jdGlvbiAoZ2FtZSkge1xuICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGdhbWUsIGdhbWUud29ybGQsICdBSy00NycsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuXG4gICAgdGhpcy5uYW1lID0gJ0FLLTQ3J1xuICAgIHRoaXMuZGFtYWdlID0gMjJcbiAgICB0aGlzLm5leHRGaXJlID0gMFxuICAgIHRoaXMuYnVsbGV0U3BlZWQgPSAxNTAwXG5cbiAgICAvLyBBSzQ3IGZpcmVzIGFib3V0IDYwMCBidWxsZXRzIHBlciBzZWNvbmRcbiAgICB0aGlzLmZpcmVSYXRlID0gMTY2LjY2NjY2N1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA2NDsgaSsrKVxuICAgIHtcbiAgICAgICAgbGV0IGJ1bGxldCA9IG5ldyBCdWxsZXQodGhpcy5nYW1lLCAnZ3JvdW5kJylcbiAgICAgICAgYnVsbGV0LmhlaWdodCA9IDNcbiAgICAgICAgYnVsbGV0LndpZHRoID0gMTBcbiAgICAgICAgYnVsbGV0LmRhbWFnZSA9IDIyXG5cbiAgICAgICAgdGhpcy5hZGQoYnVsbGV0LCB0cnVlKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG59XG5cbkFLNDcucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcbkFLNDcucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQUs0NztcblxuQUs0Ny5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uIChzb3VyY2UpIHtcbiAgICBpZiAodGhpcy5nYW1lLnRpbWUudGltZSA8IHRoaXMubmV4dEZpcmUpXG4gICAgICAgIHJldHVyblxuXG4gICAgdmFyIHggPSBzb3VyY2UueCArIDE1O1xuICAgIHZhciB5ID0gc291cmNlLnkgKyAzMDtcblxuICAgIHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgMClcbiAgICB0aGlzLnNldEFsbCgndHJhY2tpbmcnLCB0cnVlKVxuXG4gICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMuZ2FtZS50aW1lLnRpbWUgKyB0aGlzLmZpcmVSYXRlXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQUs0N1xuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBCdWxsZXQgPSByZXF1aXJlKCcuLi9CdWxsZXQnKVxuXG5sZXQgYmFycmV0TTgyQTEgPSBmdW5jdGlvbiAoZ2FtZSkge1xuICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGdhbWUsIGdhbWUud29ybGQsICdBSy00NycsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuXG4gICAgdGhpcy5uYW1lID0gJ0JhcnJldCBNODJBMSdcbiAgICB0aGlzLmRhbWFnZSA9IDg4XG4gICAgdGhpcy5uZXh0RmlyZSA9IDBcbiAgICB0aGlzLmJ1bGxldFNwZWVkID0gMzQzNVxuXG4gICAgLy8gYmFycmV0TTgyQTEgZmlyZXMgYWJvdXQgNjAwIGJ1bGxldHMgcGVyIHNlY29uZFxuICAgIHRoaXMuZmlyZVJhdGUgPSA0MDAwXG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDY0OyBpKyspXG4gICAge1xuICAgICAgICBsZXQgYnVsbGV0ID0gbmV3IEJ1bGxldCh0aGlzLmdhbWUsICdncm91bmQnKVxuICAgICAgICBidWxsZXQuaGVpZ2h0ID0gM1xuICAgICAgICBidWxsZXQud2lkdGggPSAxMFxuICAgICAgICBidWxsZXQuZGFtYWdlID0gODhcblxuICAgICAgICB0aGlzLmFkZChidWxsZXQsIHRydWUpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbn1cblxuYmFycmV0TTgyQTEucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcbmJhcnJldE04MkExLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGJhcnJldE04MkExO1xuXG5iYXJyZXRNODJBMS5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uIChzb3VyY2UpIHtcbiAgICBpZiAodGhpcy5nYW1lLnRpbWUudGltZSA8IHRoaXMubmV4dEZpcmUpXG4gICAgICAgIHJldHVyblxuXG4gICAgdmFyIHggPSBzb3VyY2UueCArIDE1O1xuICAgIHZhciB5ID0gc291cmNlLnkgKyAzMDtcblxuICAgIHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgMClcbiAgICB0aGlzLnNldEFsbCgndHJhY2tpbmcnLCB0cnVlKVxuXG4gICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMuZ2FtZS50aW1lLnRpbWUgKyB0aGlzLmZpcmVSYXRlXG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFycmV0TTgyQTFcbiIsIid1c2Ugc3RyaWN0J1xuXG4vKipcbiAqIFByaW1hcnkgV2VhcG9uc1xuICogMS4gRGVzZXJ0IEVhZ2xlc1xuICogMi4gSEsgTVA1XG4gKiAzLiBBSzQ3XG4gKiA0LiBNMTZcbiAqIDUuIFNwYXMtMTJcbiAqIDYuIFJ1Z2VyIDc3XG4gKiA3LiBNNzlcbiAqIDguIEJhcnJldCBNODJBMVxuICogOS4gRk4gTWluaW1pXG4gKiAxMC4gWE0yMTQgTWluaWd1blxuICovXG5cbi8qKlxuICogU2Vjb25kYXJ5IFdlYXBvbnNcbiAqIDEuIFVTU09DT01cbiAqIDIuIENvbWJhdCBLbmlmZVxuICogMy4gQ2hhaW5zYXdcbiAqIDQuIE03MiBMYXdcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBhSzQ3OiByZXF1aXJlKCcuL2FLNDcnKSxcbiAgICBiYXJyZXRNODJBMTogcmVxdWlyZSgnLi9iYXJyZXRNODJBMScpXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IE1hcEN0ZjEgPSB7fVxuXG5NYXBDdGYxLmNyZWF0ZSA9IGZ1bmN0aW9uKHNjb3BlKSB7XG4gICAgdGhpcy5zY29wZSA9IHNjb3BlXG5cbiAgICB0aGlzLmNyZWF0ZVNreVNwcml0ZSgpXG4gICAgdGhpcy5jcmVhdGVQbGF0Zm9ybXMoKVxuICAgIHRoaXMuY3JlYXRlTGVkZ2VzKClcblxuICAgIHRoaXMuc2NvcGUucGxhdGZvcm1zLnNldEFsbCgnYm9keS5pbW1vdmFibGUnLCB0cnVlKVxuICAgIHRoaXMuc2NvcGUucGxhdGZvcm1zLnNldEFsbCgnYm9keS5hbGxvd0dyYXZpdHknLCBmYWxzZSlcbn1cblxuTWFwQ3RmMS5jcmVhdGVMZWRnZXMgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgbGVkZ2VzID0gW1xuICAgICAgICAvLyB7eCwgeSwgd2lkdGgsIGhlaWdodH1cblxuICAgICAgICAvLyBTdGFydGluZyBMZWRnZXNcbiAgICAgICAgeyBpZDogMSwgeDogMCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDQzMSwgd2lkdGg6IDEyOCwgaGVpZ2h0OiA5MiB9LCAvLyBMZWZ0IGJvdHRvbSBsZWRnZVxuICAgICAgICB7IGlkOiAyLCB4OiAwLCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gODM4LCB3aWR0aDogMTI4LCBoZWlnaHQ6IDkyIH0sIC8vIExlZnQgdG9wIGxlZGdlXG5cbiAgICAgICAgeyBpZDogMywgeDogMzg3MiwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDQyNywgd2lkdGg6IDEyOCwgaGVpZ2h0OiA5MiB9LCAvLyBSaWdodCBib3R0b20gbGVkZ2VcbiAgICAgICAgeyBpZDogNCwgeDogMzg3MiwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDgzNSwgd2lkdGg6IDEyOCwgaGVpZ2h0OiA5MiB9LCAvLyBSaWdodCB0b3AgbGVkZ2VcblxuICAgICAgICAvLyBHcm91bmQgTGVkZ2VzXG4gICAgICAgIHsgaWQ6IDUsIHg6IDAsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSAxMjgsIHdpZHRoOiA0NzQsIGhlaWdodDogMTI4IH0sIC8vIE1haW4gYm90dG9tIHN0YXJ0aW5nIGxlZnQgbGVkZ2VcbiAgICAgICAgeyBpZDogNiwgeDogNDc0LCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gMjU2LCB3aWR0aDogNjQxLCBoZWlnaHQ6IDI2MCB9LCAvLyBNYWluIGJvdHRvbSBsZWZ0IGxlZGdlXG4gICAgICAgIHsgaWQ6IDcsIHg6IDExMTUsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSAzODQsIHdpZHRoOiAxNzg1LCBoZWlnaHQ6IDM5MCB9LCAvLyBNYWluIGJvdHRvbSBjZW50ZXIgbGVkZ2VcbiAgICAgICAgeyBpZDogOCwgeDogMjkwMCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDI1Niwgd2lkdGg6IDY0MSwgaGVpZ2h0OiAyNjAgfSwgLy8gTWFpbiBib3R0b20gcmlnaHQgbGVkZ2VcbiAgICAgICAgeyBpZDogOSwgeDogMzU0MCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDEyOCwgd2lkdGg6IDQ3NCwgaGVpZ2h0OiAxMjggfSwgLy8gTWFpbiBib3R0b20gc3RhcnRpbmcgcmlnaHQgbGVkZ2VcblxuICAgICAgICAvLyBBaXIgTGVkZ2VzXG4gICAgICAgIHsgaWQ6IDEwLCB4OiAzMDAsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA2MDgsIHdpZHRoOiA2NDEsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogMTEsIHg6IDExMTAsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA3MDEsIHdpZHRoOiA1MTMsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogMTIsIHg6IDg3MCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDk4Miwgd2lkdGg6IDI1NiwgaGVpZ2h0OiA5MiB9LFxuICAgICAgICB7IGlkOiAxMywgeDogMTc0NCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDg3NCwgd2lkdGg6IDUwNywgaGVpZ2h0OiAyNTQgfSxcbiAgICAgICAgeyBpZDogMTQsIHg6IDIzOTAsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA2ODksIHdpZHRoOiA1MTMsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogMTUsIHg6IDMwMzEsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA2MDgsIHdpZHRoOiA2NDEsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogMTYsIHg6IDI5MDMsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA5NTcsIHdpZHRoOiAyNTYsIGhlaWdodDogOTIgfVxuICAgIF1cblxuXG4gICAgbGVkZ2VzLmZvckVhY2goKGxlZGdlKSA9PiB7XG4gICAgICAgIC8vIHZhciBuZXdMZWRnZSA9IHRoaXMuc2NvcGUucGxhdGZvcm1zLmNyZWF0ZShsZWRnZS54LCBsZWRnZS55LCAnZ3JvdW5kJylcbiAgICAgICAgdmFyIG5ld0xlZGdlID0gdGhpcy5zY29wZS5wbGF0Zm9ybXMuY3JlYXRlKGxlZGdlLngsIGxlZGdlLnkpXG4gICAgICAgIG5ld0xlZGdlLmhlaWdodCA9IGxlZGdlLmhlaWdodFxuICAgICAgICBuZXdMZWRnZS53aWR0aCA9IGxlZGdlLndpZHRoXG5cbiAgICAgICAgLy8gRGVidWcgc3R1ZmZcbiAgICAgICAgLy8gbmV3TGVkZ2UuYWxwaGEgPSAwLjJcbiAgICAgICAgLy8gbGV0IHN0eWxlID0geyBmb250OiBcIjIwcHggQXJpYWxcIiwgZmlsbDogXCIjZmYwMDQ0XCIsIGFsaWduOiBcImNlbnRlclwiLCBiYWNrZ3JvdW5kQ29sb3I6IFwiI2ZmZmYwMFwiIH1cbiAgICAgICAgLy8gbGV0IHRleHQgPSB0aGlzLnNjb3BlLmdhbWUuYWRkLnRleHQobGVkZ2UueCwgbGVkZ2UueSwgbGVkZ2UuaWQsIHN0eWxlKVxuICAgICAgICAvLyB0ZXh0LmFscGhhID0gMC4yXG4gICAgfSlcbn1cblxuTWFwQ3RmMS5jcmVhdGVTa3lTcHJpdGUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNjb3BlLmFkZC50aWxlU3ByaXRlKDAsIHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSAxNTAwLCB0aGlzLnNjb3BlLmdhbWUud29ybGQud2lkdGgsIDE1MDAsICd0cmVlc2NhcGUnKVxufVxuXG5NYXBDdGYxLmNyZWF0ZVBsYXRmb3JtcyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2NvcGUucGxhdGZvcm1zID0gdGhpcy5zY29wZS5hZGQuZ3JvdXAoKVxuICAgIHRoaXMuc2NvcGUucGxhdGZvcm1zLmVuYWJsZUJvZHkgPSB0cnVlXG59XG5cbm1vZHVsZS5leHBvcnRzID0gTWFwQ3RmMVxuIl19
