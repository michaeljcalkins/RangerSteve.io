(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

    setEventHandlers: SocketEvents.setEventHandlers,
    onUpdatePlayers: SocketEvents.onUpdatePlayers,
    onSocketConnected: SocketEvents.onSocketConnected,
    onSocketDisconnect: SocketEvents.onSocketDisconnect,
    onMovePlayer: SocketEvents.onMovePlayer,
    onRemovePlayer: SocketEvents.onRemovePlayer
};

game.state.add('Game', RangerSteveGame, true);

},{"./core":3,"./lib/InputHandler":8,"./lib/SocketEvents":11}],2:[function(require,module,exports){
'use strict';

var ForestCtf = require('../maps/ForestCtf');
var Weapons = require('../lib/Weapons');

var worldWidth = 4000;
var worldHeight = 1500;

module.exports = function () {
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
  this.player = this.add.sprite(400, this.world.height - 400, 'dude');

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
  this.game.physics.arcade.gravity.y = this.GRAVITY;

  // Flag to track if the jump button is pressed
  this.jumping = false;

  //  Our two animations, walking left and right.
  this.player.animations.add('left', [0, 1, 2, 3], 10, true);
  this.player.animations.add('right', [5, 6, 7, 8], 10, true);

  this.player.meta = {
    health: 100
  };

  /**
   * Enemy Settings
   */
  // EnemyBuffalo.call(this)

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
  this.healthText = this.add.text(this.camera.x + 25, this.camera.height - 45, this.player.meta.health, textStyles);
  this.healthText.fixedToCamera = true;

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

},{"../lib/Weapons":20,"../maps/ForestCtf":21}],3:[function(require,module,exports){
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
    this.load.image('treescape', '/images/map-ctf1.png');
    this.load.image('ground', '/images/platform.png');
    this.load.image('bullet12', '/images/bullet12.png');

    this.load.spritesheet('dude', '/images/dude.png', 32, 48);
    this.load.spritesheet('enemy', '/images/dude.png', 32, 48);

    this.load.audio('AK47-sound', '/audio/AK47.ogg');
    this.load.audio('BarretM82A1-sound', '/audio/BarretM82A1.ogg');
};

},{}],6:[function(require,module,exports){
'use strict';

module.exports = function () {
    var _this = this;

    //  Collide the player and the stars with the platforms
    this.physics.arcade.collide(this.player, this.platforms, null, null, this);
    // this.physics.arcade.collide(this.enemyBuffalo, this.platforms)

    this.physics.arcade.collide(this.platforms, this.weapons, function (platform, weapon) {
        weapon.kill();
    }, null, this);

    this.enemies.forEach(function (enemy) {
        _this.physics.arcade.collide(enemy.player, _this.platforms, null, null, _this);
        _this.physics.arcade.collide(enemy.player, _this.weapons, function (enemyPlayer, weapon) {
            weapon.kill();

            return false;
        }, null, _this);
    });

    // this.physics.arcade.collide(this.enemyBuffalo, this.weapons,  null, function(enemyBuffalo, weapon) {
    //     weapon.kill()
    //     enemyBuffalo.meta.health -= weapon.damage
    //
    //     if (enemyBuffalo.meta.health <= 0) {
    //         enemyBuffalo.meta.health = 100
    //         enemyBuffalo.x = 200
    //         enemyBuffalo.y = this.world.height - 400
    //     }
    //
    //     return false
    // }, this)

    // this.physics.arcade.collide(this.enemyBuffalo, this.player,  null, function(enemyBuffalo, player) {
    //     if (enemyBuffalo.meta.reloading)
    //         return false
    //
    //     player.meta.health -= enemyBuffalo.meta.damage
    //     this.healthText.text = player.meta.health
    //     enemyBuffalo.meta.reloading = true
    //
    //     setTimeout(function() {
    //         enemyBuffalo.meta.reloading = false
    //     }, enemyBuffalo.meta.reloadTime)
    //
    //     if (player.meta.health <= 0) {
    //         player.meta.health = 100
    //         player.x = 200
    //         player.y = this.world.height - 400
    //         this.healthText.text = player.meta.health
    //     }
    //
    //     return false
    // }, this)

    // if (this.enemyBuffalo.x < this.player.x) {
    //     this.enemyBuffalo.body.acceleration.x = this.ACCELERATION
    // }
    //
    // if (this.enemyBuffalo.x > this.player.x) {
    //     this.enemyBuffalo.body.acceleration.x = -this.ACCELERATION
    // }

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
};

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
'use strict';

module.exports = function (id) {
    for (var i = 0; i < this.enemies.length; i++) {
        if (this.enemies[i].player.id === id) {
            return this.enemies[i];
        }
    }

    return false;
};

},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
'use strict';

module.exports = {
    onMovePlayer: require('./onMovePlayer'),
    onRemovePlayer: require('./onRemovePlayer'),
    onSocketConnected: require('./onSocketConnected'),
    onSocketDisconnect: require('./onSocketDisconnect'),
    onUpdatePlayers: require('./onUpdatePlayers'),
    setEventHandlers: require('./setEventHandlers')
};

},{"./onMovePlayer":12,"./onRemovePlayer":13,"./onSocketConnected":14,"./onSocketDisconnect":15,"./onUpdatePlayers":16,"./setEventHandlers":17}],12:[function(require,module,exports){
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

},{"../PlayerById":9}],13:[function(require,module,exports){
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

},{"../PlayerById":9}],14:[function(require,module,exports){
'use strict';

module.exports = function () {
    console.log('Connected to socket server');

    // Reset enemies on reconnect
    this.enemies.forEach(function (enemy) {
        if (enemy) enemy.kill();
    });

    this.enemies = [];

    // Send local player data to the game server
    this.socket.emit('new player', {
        x: this.player.x,
        y: this.player.y
    });
};

},{}],15:[function(require,module,exports){
'use strict';

module.exports = function () {
    console.log('Disconnected from socket server');
};

},{}],16:[function(require,module,exports){
'use strict';

var RemotePlayer = require('../RemotePlayer');

module.exports = function (data) {
    var _this = this;

    this.enemies.forEach(function (enemy) {
        enemy.player.kill();
    });

    this.enemies = [];

    data.players.forEach(function (player) {
        if (player.id === '/#' + _this.socket.id) return;

        var newRemotePlayer = RemotePlayer.call(_this, player.id, _this.game, _this.player, player.x, player.y);
        _this.enemies.push(newRemotePlayer);
        _this.enemies[_this.enemies.length - 1].player.animations.add('left', [0, 1, 2, 3], 10, true);
        _this.enemies[_this.enemies.length - 1].player.animations.add('right', [5, 6, 7, 8], 10, true);
    });
};

},{"../RemotePlayer":10}],17:[function(require,module,exports){
'use strict';

module.exports = function () {
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
};

},{}],18:[function(require,module,exports){
'use strict';

var Bullet = require('../Bullet');

var AK47 = function AK47(game) {
    Phaser.Group.call(this, game, game.world, 'AK-47', false, true, Phaser.Physics.ARCADE);

    //	Here we set-up our audio sprite
    this.fx = game.add.audio('AK47-sound');
    this.allowMultiple = true;

    this.damage = 22;
    this.nextFire = 0;
    this.bulletSpeed = 1800;
    // AK47 fires about 600 bullets per second
    this.fireRate = 160;

    for (var i = 0; i < 64; i++) {
        var bullet = new Bullet(this.game, 'bullet12');
        bullet.height = 2;
        bullet.width = 40;
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
    this.fx.play();
};

module.exports = AK47;

},{"../Bullet":7}],19:[function(require,module,exports){
'use strict';

var Bullet = require('../Bullet');

var BarretM82A1 = function BarretM82A1(game) {
    Phaser.Group.call(this, game, game.world, 'BarretM82A1', false, true, Phaser.Physics.ARCADE);

    //	Here we set-up our audio sprite
    this.fx = game.add.audio('BarretM82A1-sound');
    this.allowMultiple = true;

    this.name = 'Barret M82A1';
    this.damage = 88;
    this.nextFire = 0;
    this.bulletSpeed = 3435;

    // BarretM82A1 fires about 600 bullets per second
    this.fireRate = 3000;

    for (var i = 0; i < 64; i++) {
        var bullet = new Bullet(this.game, 'bullet12');
        bullet.height = 2;
        bullet.width = 40;
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
    this.fx.volume = .6;
    this.fx.play();
};

module.exports = BarretM82A1;

},{"../Bullet":7}],20:[function(require,module,exports){
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
  // "Spas12": require('./Spas12'),
  // "RPG": require('./RPG')
};

},{"./AK47":18,"./BarretM82A1":19}],21:[function(require,module,exports){
'use strict';

var ForestCtf = {};

ForestCtf.create = function (scope) {
    this.scope = scope;

    this.createSkySprite();
    this.createPlatforms();
    this.createLedges();

    this.scope.platforms.setAll('body.immovable', true);
    this.scope.platforms.setAll('body.allowGravity', false);
};

ForestCtf.createLedges = function () {
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
    { id: 17, x: 717, y: this.scope.game.world.height - 685, width: 154, height: 77 }, { id: 18, x: 757, y: this.scope.game.world.height - 762, width: 77, height: 77 }, { id: 19, x: 1418, y: this.scope.game.world.height - 778, width: 77, height: 77 }, { id: 20, x: 1931, y: this.scope.game.world.height - 461, width: 154, height: 77 }, { id: 21, x: 3205, y: this.scope.game.world.height - 685, width: 154, height: 77 }, { id: 22, x: 3245, y: this.scope.game.world.height - 762, width: 77, height: 77 }];

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

ForestCtf.createSkySprite = function () {
    this.scope.add.tileSprite(0, this.scope.game.world.height - 1500, this.scope.game.world.width, 1500, 'treescape');
};

ForestCtf.createPlatforms = function () {
    this.scope.platforms = this.scope.add.group();
    this.scope.platforms.enableBody = true;
};

module.exports = ForestCtf;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvYXBwLmpzIiwiYXNzZXRzL2pzL2NvcmUvY3JlYXRlLmpzIiwiYXNzZXRzL2pzL2NvcmUvaW5kZXguanMiLCJhc3NldHMvanMvY29yZS9pbml0LmpzIiwiYXNzZXRzL2pzL2NvcmUvcHJlbG9hZC5qcyIsImFzc2V0cy9qcy9jb3JlL3VwZGF0ZS5qcyIsImFzc2V0cy9qcy9saWIvQnVsbGV0LmpzIiwiYXNzZXRzL2pzL2xpYi9JbnB1dEhhbmRsZXIuanMiLCJhc3NldHMvanMvbGliL1BsYXllckJ5SWQuanMiLCJhc3NldHMvanMvbGliL1JlbW90ZVBsYXllci5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL2luZGV4LmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvb25Nb3ZlUGxheWVyLmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvb25SZW1vdmVQbGF5ZXIuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vblNvY2tldENvbm5lY3RlZC5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL29uU29ja2V0RGlzY29ubmVjdC5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL29uVXBkYXRlUGxheWVycy5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL3NldEV2ZW50SGFuZGxlcnMuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvQUs0Ny5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9CYXJyZXRNODJBMS5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9pbmRleC5qcyIsImFzc2V0cy9qcy9tYXBzL0ZvcmVzdEN0Zi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQUVBLElBQUksZUFBZSxRQUFRLG9CQUFSLENBQWY7O0FBRUosSUFBSSxlQUFlLFFBQVEsb0JBQVIsQ0FBZjtBQUNK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SyxLQUFMLENBQVcsSUFBWCxDQUFnQixLQUFoQixDQUFzQixNQUF0QixHQUErQixHQUEvQixFQUFvQyxPQUFPLEVBQVAsRUFBVyxRQUFRLEVBQVIsRUFoQzVELENBQVQsQ0FENEI7O0FBcUNoQyxXQUFPLE9BQVAsQ0FBZSxVQUFDLEtBQUQsRUFBVzs7QUFFdEIsWUFBSSxXQUFXLE1BQUssS0FBTCxDQUFXLFNBQVgsQ0FBcUIsTUFBckIsQ0FBNEIsTUFBTSxDQUFOLEVBQVMsTUFBTSxDQUFOLENBQWhELENBRmtCO0FBR3RCLGlCQUFTLE1BQVQsR0FBa0IsTUFBTSxNQUFOLENBSEk7QUFJdEIsaUJBQVMsS0FBVCxHQUFpQixNQUFNLEtBQU47Ozs7Ozs7QUFKSyxLQUFYLENBQWYsQ0FyQ2dDO0NBQVg7O0FBbUR6QixVQUFVLGVBQVYsR0FBNEIsWUFBVztBQUNuQyxTQUFLLEtBQUwsQ0FBVyxHQUFYLENBQWUsVUFBZixDQUEwQixDQUExQixFQUE2QixLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEtBQWhCLENBQXNCLE1BQXRCLEdBQStCLElBQS9CLEVBQXFDLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsS0FBaEIsQ0FBc0IsS0FBdEIsRUFBNkIsSUFBL0YsRUFBcUcsV0FBckcsRUFEbUM7Q0FBWDs7QUFJNUIsVUFBVSxlQUFWLEdBQTRCLFlBQVc7QUFDbkMsU0FBSyxLQUFMLENBQVcsU0FBWCxHQUF1QixLQUFLLEtBQUwsQ0FBVyxHQUFYLENBQWUsS0FBZixFQUF2QixDQURtQztBQUVuQyxTQUFLLEtBQUwsQ0FBVyxTQUFYLENBQXFCLFVBQXJCLEdBQWtDLElBQWxDLENBRm1DO0NBQVg7O0FBSzVCLE9BQU8sT0FBUCxHQUFpQixTQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCdcblxubGV0IElucHV0SGFuZGxlciA9IHJlcXVpcmUoJy4vbGliL0lucHV0SGFuZGxlcicpXG4vLyBsZXQgRW5lbXlCdWZmYWxvID0gcmVxdWlyZSgnLi9saWIvRW5lbXlCdWZmYWxvJylcbmxldCBTb2NrZXRFdmVudHMgPSByZXF1aXJlKCcuL2xpYi9Tb2NrZXRFdmVudHMnKVxubGV0IENvcmUgPSByZXF1aXJlKCcuL2NvcmUnKVxuXG5sZXQgZ2FtZVdpZHRoID0gd2luZG93LmlubmVyV2lkdGhcbmxldCBnYW1lSGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0XG5sZXQgZ2FtZSA9IG5ldyBQaGFzZXIuR2FtZShnYW1lV2lkdGgsIGdhbWVIZWlnaHQsIFBoYXNlci5BVVRPLCAncmFuZ2VyLXN0ZXZlLWdhbWUnKVxuXG5sZXQgUmFuZ2VyU3RldmVHYW1lID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5jdXJyZW50V2VhcG9uID0gMFxuICAgIHRoaXMuZW5lbWllcyA9IFtdXG4gICAgdGhpcy5nYW1lID0gZ2FtZVxuICAgIHRoaXMuZ3JvdW5kXG4gICAgdGhpcy5wbGF0Zm9ybXNcbiAgICB0aGlzLnBsYXllclxuICAgIHRoaXMuc2NvcmUgPSAwXG4gICAgdGhpcy5zY29yZVRleHRcbiAgICB0aGlzLnNvY2tldFxuICAgIHRoaXMud2VhcG9uTmFtZSA9IG51bGxcbiAgICB0aGlzLndlYXBvbnMgPSBbXVxufVxuXG5SYW5nZXJTdGV2ZUdhbWUucHJvdG90eXBlID0ge1xuICAgIGluaXQ6IENvcmUuaW5pdCxcbiAgICBwcmVsb2FkOiBDb3JlLnByZWxvYWQsXG4gICAgY3JlYXRlOiBDb3JlLmNyZWF0ZSxcbiAgICB1cGRhdGU6IENvcmUudXBkYXRlLFxuXG4gICAgbGVmdElucHV0SXNBY3RpdmU6IElucHV0SGFuZGxlci5sZWZ0SW5wdXRJc0FjdGl2ZSxcbiAgICByaWdodElucHV0SXNBY3RpdmU6IElucHV0SGFuZGxlci5yaWdodElucHV0SXNBY3RpdmUsXG4gICAgdXBJbnB1dElzQWN0aXZlOiBJbnB1dEhhbmRsZXIudXBJbnB1dElzQWN0aXZlLFxuICAgIHVwSW5wdXRSZWxlYXNlZDogSW5wdXRIYW5kbGVyLnVwSW5wdXRSZWxlYXNlZCxcblxuICAgIG5leHRXZWFwb246IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyAgVGlkeS11cCB0aGUgY3VycmVudCB3ZWFwb25cbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFdlYXBvbiA+IDkpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLnJlc2V0KClcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLnZpc2libGUgPSBmYWxzZVxuICAgICAgICAgICAgdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0uY2FsbEFsbCgncmVzZXQnLCBudWxsLCAwLCAwKVxuICAgICAgICAgICAgdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0uc2V0QWxsKCdleGlzdHMnLCBmYWxzZSlcbiAgICAgICAgfVxuXG4gICAgICAgIC8vICBBY3RpdmF0ZSB0aGUgbmV3IG9uZVxuICAgICAgICB0aGlzLmN1cnJlbnRXZWFwb24rK1xuXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRXZWFwb24gPT09IHRoaXMud2VhcG9ucy5sZW5ndGgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFdlYXBvbiA9IDBcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLnZpc2libGUgPSB0cnVlXG5cbiAgICAgICAgdGhpcy53ZWFwb25OYW1lLnRleHQgPSB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS5uYW1lXG4gICAgfSxcblxuICAgIHNldEV2ZW50SGFuZGxlcnM6IFNvY2tldEV2ZW50cy5zZXRFdmVudEhhbmRsZXJzLFxuICAgIG9uVXBkYXRlUGxheWVyczogU29ja2V0RXZlbnRzLm9uVXBkYXRlUGxheWVycyxcbiAgICBvblNvY2tldENvbm5lY3RlZDogU29ja2V0RXZlbnRzLm9uU29ja2V0Q29ubmVjdGVkLFxuICAgIG9uU29ja2V0RGlzY29ubmVjdDogU29ja2V0RXZlbnRzLm9uU29ja2V0RGlzY29ubmVjdCxcbiAgICBvbk1vdmVQbGF5ZXI6IFNvY2tldEV2ZW50cy5vbk1vdmVQbGF5ZXIsXG4gICAgb25SZW1vdmVQbGF5ZXI6IFNvY2tldEV2ZW50cy5vblJlbW92ZVBsYXllclxufVxuXG5nYW1lLnN0YXRlLmFkZCgnR2FtZScsIFJhbmdlclN0ZXZlR2FtZSwgdHJ1ZSlcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgRm9yZXN0Q3RmID0gcmVxdWlyZSgnLi4vbWFwcy9Gb3Jlc3RDdGYnKVxubGV0IFdlYXBvbnMgPSByZXF1aXJlKCcuLi9saWIvV2VhcG9ucycpXG5cbmxldCB3b3JsZFdpZHRoID0gNDAwMFxubGV0IHdvcmxkSGVpZ2h0ID0gMTUwMFxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc29ja2V0ID0gaW8uY29ubmVjdCgpXG4gICAgdGhpcy5lbmVtaWVzID0gW11cblxuICAgIC8vICBXZSdyZSBnb2luZyB0byBiZSB1c2luZyBwaHlzaWNzLCBzbyBlbmFibGUgdGhlIEFyY2FkZSBQaHlzaWNzIHN5c3RlbVxuICAgIHRoaXMucGh5c2ljcy5zdGFydFN5c3RlbShQaGFzZXIuUGh5c2ljcy5BUkNBREUpXG5cbiAgICB0aGlzLndvcmxkLnNldEJvdW5kcygwLCAwLCB3b3JsZFdpZHRoLCB3b3JsZEhlaWdodClcbiAgICB0aGlzLmdhbWUuc3RhZ2UuYmFja2dyb3VuZENvbG9yID0gXCIjMkY5MUQwXCJcblxuICAgIC8vIFNjYWxlIGdhbWUgb24gd2luZG93IHJlc2l6ZVxuICAgIHRoaXMuZ2FtZS5zY2FsZS5zY2FsZU1vZGUgPSBQaGFzZXIuU2NhbGVNYW5hZ2VyLlJFU0laRVxuICAgIHRoaXMuZ2FtZS5zY2FsZS5zZXRTaG93QWxsKClcbiAgICB0aGlzLmdhbWUuc2NhbGUucmVmcmVzaCgpXG5cblxuICAgIC8qKlxuICAgICAqIE1hcFxuICAgICAqL1xuICAgIEZvcmVzdEN0Zi5jcmVhdGUodGhpcylcblxuICAgIC8vIERlZmluZSBtb3ZlbWVudCBjb25zdGFudHNcbiAgICB0aGlzLk1BWF9TUEVFRCA9IDQwMCAvLyBwaXhlbHMvc2Vjb25kXG4gICAgdGhpcy5BQ0NFTEVSQVRJT04gPSAxOTYwIC8vIHBpeGVscy9zZWNvbmQvc2Vjb25kXG4gICAgdGhpcy5EUkFHID0gMTUwMCAvLyBwaXhlbHMvc2Vjb25kXG4gICAgdGhpcy5HUkFWSVRZID0gMTkwMCAvLyBwaXhlbHMvc2Vjb25kL3NlY29uZFxuICAgIHRoaXMuSlVNUF9TUEVFRCA9IC04NTAgLy8gcGl4ZWxzL3NlY29uZCAobmVnYXRpdmUgeSBpcyB1cClcblxuXG4gICAgLyoqXG4gICAgICogUGxheWVyIFNldHRpbmdzXG4gICAgICovXG4gICAgdGhpcy5wbGF5ZXIgPSB0aGlzLmFkZC5zcHJpdGUoNDAwLCB0aGlzLndvcmxkLmhlaWdodCAtIDQwMCwgJ2R1ZGUnKVxuXG4gICAgLy8gIFdlIG5lZWQgdG8gZW5hYmxlIHBoeXNpY3Mgb24gdGhlIHBsYXllclxuICAgIHRoaXMucGh5c2ljcy5hcmNhZGUuZW5hYmxlKHRoaXMucGxheWVyKVxuXG4gICAgLy8gRW5hYmxlIHBoeXNpY3Mgb24gdGhlIHBsYXllclxuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmVuYWJsZSh0aGlzLnBsYXllciwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKVxuXG4gICAgLy8gTWFrZSBwbGF5ZXIgY29sbGlkZSB3aXRoIHdvcmxkIGJvdW5kYXJpZXMgc28gaGUgZG9lc24ndCBsZWF2ZSB0aGUgc3RhZ2VcbiAgICB0aGlzLnBsYXllci5ib2R5LmNvbGxpZGVXb3JsZEJvdW5kcyA9IHRydWVcblxuICAgIC8vIFNldCBwbGF5ZXIgbWluaW11bSBhbmQgbWF4aW11bSBtb3ZlbWVudCBzcGVlZFxuICAgIHRoaXMucGxheWVyLmJvZHkubWF4VmVsb2NpdHkuc2V0VG8odGhpcy5NQVhfU1BFRUQsIHRoaXMuTUFYX1NQRUVEICogMTApIC8vIHgsIHlcblxuICAgIC8vIEFkZCBkcmFnIHRvIHRoZSBwbGF5ZXIgdGhhdCBzbG93cyB0aGVtIGRvd24gd2hlbiB0aGV5IGFyZSBub3QgYWNjZWxlcmF0aW5nXG4gICAgdGhpcy5wbGF5ZXIuYm9keS5kcmFnLnNldFRvKHRoaXMuRFJBRywgMCkgLy8geCwgeVxuXG4gICAgLy8gU2luY2Ugd2UncmUganVtcGluZyB3ZSBuZWVkIGdyYXZpdHlcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZ3Jhdml0eS55ID0gdGhpcy5HUkFWSVRZXG5cbiAgICAvLyBGbGFnIHRvIHRyYWNrIGlmIHRoZSBqdW1wIGJ1dHRvbiBpcyBwcmVzc2VkXG4gICAgdGhpcy5qdW1waW5nID0gZmFsc2VcblxuICAgIC8vICBPdXIgdHdvIGFuaW1hdGlvbnMsIHdhbGtpbmcgbGVmdCBhbmQgcmlnaHQuXG4gICAgdGhpcy5wbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ2xlZnQnLCBbMCwgMSwgMiwgM10sIDEwLCB0cnVlKVxuICAgIHRoaXMucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdyaWdodCcsIFs1LCA2LCA3LCA4XSwgMTAsIHRydWUpXG5cbiAgICB0aGlzLnBsYXllci5tZXRhID0ge1xuICAgICAgICBoZWFsdGg6IDEwMFxuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogRW5lbXkgU2V0dGluZ3NcbiAgICAgKi9cbiAgICAvLyBFbmVteUJ1ZmZhbG8uY2FsbCh0aGlzKVxuXG5cbiAgICAvKipcbiAgICAgKiBXZWFwb25zXG4gICAgICovXG4gICAgdGhpcy5jdXJyZW50V2VhcG9uID0gMFxuICAgIHRoaXMud2VhcG9ucy5wdXNoKG5ldyBXZWFwb25zLkFLNDcodGhpcy5nYW1lKSlcbiAgICB0aGlzLndlYXBvbnMucHVzaChuZXcgV2VhcG9ucy5CYXJyZXRNODJBMSh0aGlzLmdhbWUpKVxuXG5cbiAgICAvKipcbiAgICAgKiBUZXh0XG4gICAgICovXG4gICAgbGV0IHRleHRTdHlsZXMgPSB7IGZvbnRTaXplOiAnMjRweCcsIGZpbGw6ICcjMDAwJyB9XG4gICAgdGhpcy5zY29yZVRleHQgPSB0aGlzLmFkZC50ZXh0KDI1LCAyNSwgJ1Njb3JlOiAwJywgdGV4dFN0eWxlcylcbiAgICB0aGlzLnNjb3JlVGV4dC5maXhlZFRvQ2FtZXJhID0gdHJ1ZVxuICAgIHRoaXMud2VhcG9uTmFtZSA9IHRoaXMuYWRkLnRleHQodGhpcy5jYW1lcmEud2lkdGggLSAxMDAsIHRoaXMuY2FtZXJhLmhlaWdodCAtIDQ1LCAnQUstNDcnLCB0ZXh0U3R5bGVzKVxuICAgIHRoaXMud2VhcG9uTmFtZS5maXhlZFRvQ2FtZXJhID0gdHJ1ZVxuICAgIHRoaXMuaGVhbHRoVGV4dCA9IHRoaXMuYWRkLnRleHQodGhpcy5jYW1lcmEueCArIDI1LCB0aGlzLmNhbWVyYS5oZWlnaHQgLSA0NSwgdGhpcy5wbGF5ZXIubWV0YS5oZWFsdGgsIHRleHRTdHlsZXMpXG4gICAgdGhpcy5oZWFsdGhUZXh0LmZpeGVkVG9DYW1lcmEgPSB0cnVlXG5cblxuICAgIC8qKlxuICAgICAqIENhbWVyYSBTZXR0aW5nc1xuICAgICAqL1xuICAgIHRoaXMuY2FtZXJhLmZvbGxvdyh0aGlzLnBsYXllcilcblxuICAgIGxldCBjaGFuZ2VLZXkgPSB0aGlzLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuRU5URVIpXG4gICAgY2hhbmdlS2V5Lm9uRG93bi5hZGQodGhpcy5uZXh0V2VhcG9uLCB0aGlzKVxuXG5cbiAgICAvKipcbiAgICAgKiBSZXNpemluZyBFdmVudHNcbiAgICAgKi9cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xuICAgICAgICB0aGlzLmdhbWUuc2NhbGUucmVmcmVzaCgpXG4gICAgICAgIHRoaXMuZ2FtZS5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHRcbiAgICAgICAgdGhpcy5nYW1lLndpZHRoID0gd2luZG93LmlubmVyV2lkdGhcblxuICAgICAgICB0aGlzLndlYXBvbk5hbWUuY2FtZXJhT2Zmc2V0LnggPSB0aGlzLmNhbWVyYS53aWR0aCAtIDEwMFxuICAgICAgICB0aGlzLndlYXBvbk5hbWUuY2FtZXJhT2Zmc2V0LnkgPSB0aGlzLmNhbWVyYS5oZWlnaHQgLSA0NVxuXG4gICAgICAgIHRoaXMuc2NvcmVUZXh0LmNhbWVyYU9mZnNldC54ID0gMjVcbiAgICAgICAgdGhpcy5zY29yZVRleHQuY2FtZXJhT2Zmc2V0LnkgPSAyNVxuICAgIH0pXG5cblxuICAgIC8qKlxuICAgICAqIFN0YXJ0IGxpc3RlbmluZyBmb3IgZXZlbnRzXG4gICAgICovXG4gICAgdGhpcy5zZXRFdmVudEhhbmRsZXJzKClcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBjcmVhdGU6IHJlcXVpcmUoJy4vY3JlYXRlJyksXG4gICAgaW5pdDogcmVxdWlyZSgnLi9pbml0JyksXG4gICAgcHJlbG9hZDogcmVxdWlyZSgnLi9wcmVsb2FkJyksXG4gICAgdXBkYXRlOiByZXF1aXJlKCcuL3VwZGF0ZScpXG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmdhbWUucmVuZGVyZXIucmVuZGVyU2Vzc2lvbi5yb3VuZFBpeGVscyA9IHRydWVcbiAgICB0aGlzLmdhbWUuc3RhZ2UuZGlzYWJsZVZpc2liaWxpdHlDaGFuZ2UgPSB0cnVlXG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmxvYWQuaW1hZ2UoJ3RyZWVzY2FwZScsICcvaW1hZ2VzL21hcC1jdGYxLnBuZycpXG4gICAgdGhpcy5sb2FkLmltYWdlKCdncm91bmQnLCAnL2ltYWdlcy9wbGF0Zm9ybS5wbmcnKVxuICAgIHRoaXMubG9hZC5pbWFnZSgnYnVsbGV0MTInLCAnL2ltYWdlcy9idWxsZXQxMi5wbmcnKVxuXG4gICAgdGhpcy5sb2FkLnNwcml0ZXNoZWV0KCdkdWRlJywgJy9pbWFnZXMvZHVkZS5wbmcnLCAzMiwgNDgpXG4gICAgdGhpcy5sb2FkLnNwcml0ZXNoZWV0KCdlbmVteScsICcvaW1hZ2VzL2R1ZGUucG5nJywgMzIsIDQ4KVxuXG4gICAgdGhpcy5sb2FkLmF1ZGlvKCdBSzQ3LXNvdW5kJywgJy9hdWRpby9BSzQ3Lm9nZycpXG4gICAgdGhpcy5sb2FkLmF1ZGlvKCdCYXJyZXRNODJBMS1zb3VuZCcsICcvYXVkaW8vQmFycmV0TTgyQTEub2dnJylcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAgIC8vICBDb2xsaWRlIHRoZSBwbGF5ZXIgYW5kIHRoZSBzdGFycyB3aXRoIHRoZSBwbGF0Zm9ybXNcbiAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5wbGF5ZXIsIHRoaXMucGxhdGZvcm1zLCBudWxsLCBudWxsLCB0aGlzKVxuICAgIC8vIHRoaXMucGh5c2ljcy5hcmNhZGUuY29sbGlkZSh0aGlzLmVuZW15QnVmZmFsbywgdGhpcy5wbGF0Zm9ybXMpXG5cbiAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5wbGF0Zm9ybXMsIHRoaXMud2VhcG9ucywgZnVuY3Rpb24ocGxhdGZvcm0sIHdlYXBvbikge1xuICAgICAgICB3ZWFwb24ua2lsbCgpXG4gICAgfSwgbnVsbCwgdGhpcylcblxuICAgIHRoaXMuZW5lbWllcy5mb3JFYWNoKChlbmVteSkgPT4ge1xuICAgICAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUoZW5lbXkucGxheWVyLCB0aGlzLnBsYXRmb3JtcywgbnVsbCwgbnVsbCwgdGhpcylcbiAgICAgICAgdGhpcy5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKGVuZW15LnBsYXllciwgdGhpcy53ZWFwb25zLCBmdW5jdGlvbihlbmVteVBsYXllciwgd2VhcG9uKSB7XG4gICAgICAgICAgICB3ZWFwb24ua2lsbCgpXG5cblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH0sIG51bGwsIHRoaXMpXG5cbiAgICB9KVxuXG4gICAgLy8gdGhpcy5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMuZW5lbXlCdWZmYWxvLCB0aGlzLndlYXBvbnMsICBudWxsLCBmdW5jdGlvbihlbmVteUJ1ZmZhbG8sIHdlYXBvbikge1xuICAgIC8vICAgICB3ZWFwb24ua2lsbCgpXG4gICAgLy8gICAgIGVuZW15QnVmZmFsby5tZXRhLmhlYWx0aCAtPSB3ZWFwb24uZGFtYWdlXG4gICAgLy9cbiAgICAvLyAgICAgaWYgKGVuZW15QnVmZmFsby5tZXRhLmhlYWx0aCA8PSAwKSB7XG4gICAgLy8gICAgICAgICBlbmVteUJ1ZmZhbG8ubWV0YS5oZWFsdGggPSAxMDBcbiAgICAvLyAgICAgICAgIGVuZW15QnVmZmFsby54ID0gMjAwXG4gICAgLy8gICAgICAgICBlbmVteUJ1ZmZhbG8ueSA9IHRoaXMud29ybGQuaGVpZ2h0IC0gNDAwXG4gICAgLy8gICAgIH1cbiAgICAvL1xuICAgIC8vICAgICByZXR1cm4gZmFsc2VcbiAgICAvLyB9LCB0aGlzKVxuXG4gICAgLy8gdGhpcy5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMuZW5lbXlCdWZmYWxvLCB0aGlzLnBsYXllciwgIG51bGwsIGZ1bmN0aW9uKGVuZW15QnVmZmFsbywgcGxheWVyKSB7XG4gICAgLy8gICAgIGlmIChlbmVteUJ1ZmZhbG8ubWV0YS5yZWxvYWRpbmcpXG4gICAgLy8gICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAvL1xuICAgIC8vICAgICBwbGF5ZXIubWV0YS5oZWFsdGggLT0gZW5lbXlCdWZmYWxvLm1ldGEuZGFtYWdlXG4gICAgLy8gICAgIHRoaXMuaGVhbHRoVGV4dC50ZXh0ID0gcGxheWVyLm1ldGEuaGVhbHRoXG4gICAgLy8gICAgIGVuZW15QnVmZmFsby5tZXRhLnJlbG9hZGluZyA9IHRydWVcbiAgICAvL1xuICAgIC8vICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgIC8vICAgICAgICAgZW5lbXlCdWZmYWxvLm1ldGEucmVsb2FkaW5nID0gZmFsc2VcbiAgICAvLyAgICAgfSwgZW5lbXlCdWZmYWxvLm1ldGEucmVsb2FkVGltZSlcbiAgICAvL1xuICAgIC8vICAgICBpZiAocGxheWVyLm1ldGEuaGVhbHRoIDw9IDApIHtcbiAgICAvLyAgICAgICAgIHBsYXllci5tZXRhLmhlYWx0aCA9IDEwMFxuICAgIC8vICAgICAgICAgcGxheWVyLnggPSAyMDBcbiAgICAvLyAgICAgICAgIHBsYXllci55ID0gdGhpcy53b3JsZC5oZWlnaHQgLSA0MDBcbiAgICAvLyAgICAgICAgIHRoaXMuaGVhbHRoVGV4dC50ZXh0ID0gcGxheWVyLm1ldGEuaGVhbHRoXG4gICAgLy8gICAgIH1cbiAgICAvL1xuICAgIC8vICAgICByZXR1cm4gZmFsc2VcbiAgICAvLyB9LCB0aGlzKVxuXG4gICAgLy8gaWYgKHRoaXMuZW5lbXlCdWZmYWxvLnggPCB0aGlzLnBsYXllci54KSB7XG4gICAgLy8gICAgIHRoaXMuZW5lbXlCdWZmYWxvLmJvZHkuYWNjZWxlcmF0aW9uLnggPSB0aGlzLkFDQ0VMRVJBVElPTlxuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIGlmICh0aGlzLmVuZW15QnVmZmFsby54ID4gdGhpcy5wbGF5ZXIueCkge1xuICAgIC8vICAgICB0aGlzLmVuZW15QnVmZmFsby5ib2R5LmFjY2VsZXJhdGlvbi54ID0gLXRoaXMuQUNDRUxFUkFUSU9OXG4gICAgLy8gfVxuXG4gICAgaWYgKHRoaXMubGVmdElucHV0SXNBY3RpdmUoKSkge1xuICAgICAgICAvLyBJZiB0aGUgTEVGVCBrZXkgaXMgZG93biwgc2V0IHRoZSBwbGF5ZXIgdmVsb2NpdHkgdG8gbW92ZSBsZWZ0XG4gICAgICAgIHRoaXMucGxheWVyLmJvZHkuYWNjZWxlcmF0aW9uLnggPSAtdGhpcy5BQ0NFTEVSQVRJT05cbiAgICAgICAgdGhpcy5wbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdsZWZ0JylcbiAgICB9IGVsc2UgaWYgKHRoaXMucmlnaHRJbnB1dElzQWN0aXZlKCkpIHtcbiAgICAgICAgLy8gSWYgdGhlIFJJR0hUIGtleSBpcyBkb3duLCBzZXQgdGhlIHBsYXllciB2ZWxvY2l0eSB0byBtb3ZlIHJpZ2h0XG4gICAgICAgIHRoaXMucGxheWVyLmJvZHkuYWNjZWxlcmF0aW9uLnggPSB0aGlzLkFDQ0VMRVJBVElPTlxuICAgICAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLnBsYXkoJ3JpZ2h0JylcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBTdGFuZCBzdGlsbFxuICAgICAgICB0aGlzLnBsYXllci5ib2R5LmFjY2VsZXJhdGlvbi54ID0gMFxuICAgICAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLnN0b3AoKVxuICAgICAgICB0aGlzLnBsYXllci5mcmFtZSA9IDRcbiAgICB9XG5cbiAgICAvLyBTZXQgYSB2YXJpYWJsZSB0aGF0IGlzIHRydWUgd2hlbiB0aGUgcGxheWVyIGlzIHRvdWNoaW5nIHRoZSBncm91bmRcbiAgICBsZXQgb25UaGVHcm91bmQgPSB0aGlzLnBsYXllci5ib2R5LnRvdWNoaW5nLmRvd25cblxuICAgIC8vIElmIHRoZSBwbGF5ZXIgaXMgdG91Y2hpbmcgdGhlIGdyb3VuZCwgbGV0IGhpbSBoYXZlIDIganVtcHNcbiAgICBpZiAob25UaGVHcm91bmQpIHtcbiAgICAgICAgdGhpcy5qdW1wcyA9IDJcbiAgICAgICAgdGhpcy5qdW1waW5nID0gZmFsc2VcbiAgICB9XG5cbiAgICAvLyBKdW1wIVxuICAgIGlmICh0aGlzLmp1bXBzID4gMCAmJiB0aGlzLnVwSW5wdXRJc0FjdGl2ZSg1KSkge1xuICAgICAgICB0aGlzLnBsYXllci5ib2R5LnZlbG9jaXR5LnkgPSB0aGlzLkpVTVBfU1BFRURcbiAgICAgICAgdGhpcy5qdW1waW5nID0gdHJ1ZVxuICAgIH1cblxuICAgIC8vIFJlZHVjZSB0aGUgbnVtYmVyIG9mIGF2YWlsYWJsZSBqdW1wcyBpZiB0aGUganVtcCBpbnB1dCBpcyByZWxlYXNlZFxuICAgIGlmICh0aGlzLmp1bXBpbmcgJiYgdGhpcy51cElucHV0UmVsZWFzZWQoKSkge1xuICAgICAgICB0aGlzLmp1bXBzLS1cbiAgICAgICAgdGhpcy5qdW1waW5nID0gZmFsc2VcbiAgICB9XG5cbiAgICBpZiAodGhpcy5nYW1lLmlucHV0LmFjdGl2ZVBvaW50ZXIuaXNEb3duKVxuICAgIHtcbiAgICAgICAgdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0uZmlyZSh0aGlzLnBsYXllcilcbiAgICB9XG5cbiAgICB0aGlzLnNvY2tldC5lbWl0KCdtb3ZlIHBsYXllcicsIHsgeDogdGhpcy5wbGF5ZXIueCwgeTogdGhpcy5wbGF5ZXIueSB9KVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbnZhciBCdWxsZXQgPSBmdW5jdGlvbiAoZ2FtZSwga2V5KSB7XG4gICAgUGhhc2VyLlNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIDAsIDAsIGtleSlcblxuICAgIHRoaXMudGV4dHVyZS5iYXNlVGV4dHVyZS5zY2FsZU1vZGUgPSBQSVhJLnNjYWxlTW9kZXMuTkVBUkVTVFxuXG4gICAgdGhpcy5hbmNob3Iuc2V0KDAuNSlcblxuICAgIHRoaXMuY2hlY2tXb3JsZEJvdW5kcyA9IHRydWVcbiAgICB0aGlzLm91dE9mQm91bmRzS2lsbCA9IHRydWVcbiAgICB0aGlzLmV4aXN0cyA9IGZhbHNlXG5cbiAgICB0aGlzLnRyYWNraW5nID0gZmFsc2VcbiAgICB0aGlzLnNjYWxlU3BlZWQgPSAwXG59XG5cbkJ1bGxldC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TcHJpdGUucHJvdG90eXBlKVxuQnVsbGV0LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEJ1bGxldFxuXG5CdWxsZXQucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbiAoeCwgeSwgYW5nbGUsIHNwZWVkLCBneCwgZ3kpIHtcbiAgICBneCA9IGd4IHx8IDBcbiAgICBneSA9IGd5IHx8IDBcbiAgICB0aGlzLnJlc2V0KHgsIHkpXG5cbiAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUubW92ZVRvUG9pbnRlcih0aGlzLCBzcGVlZClcbiAgICB0aGlzLmJvZHkuZ3Jhdml0eS55ID0gLTE4MDBcbn1cblxuQnVsbGV0LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMudHJhY2tpbmcpXG4gICAge1xuICAgICAgICB0aGlzLnJvdGF0aW9uID0gTWF0aC5hdGFuMih0aGlzLmJvZHkudmVsb2NpdHkueSwgdGhpcy5ib2R5LnZlbG9jaXR5LngpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc2NhbGVTcGVlZCA+IDApXG4gICAge1xuICAgICAgICB0aGlzLnNjYWxlLnggKz0gdGhpcy5zY2FsZVNwZWVkXG4gICAgICAgIHRoaXMuc2NhbGUueSArPSB0aGlzLnNjYWxlU3BlZWRcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQnVsbGV0XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgLy8gVGhpcyBmdW5jdGlvbiBzaG91bGQgcmV0dXJuIHRydWUgd2hlbiB0aGUgcGxheWVyIGFjdGl2YXRlcyB0aGUgXCJnbyBsZWZ0XCIgY29udHJvbFxuICAgIC8vIEluIHRoaXMgY2FzZSwgZWl0aGVyIGhvbGRpbmcgdGhlIHJpZ2h0IGFycm93IG9yIHRhcHBpbmcgb3IgY2xpY2tpbmcgb24gdGhlIGxlZnRcbiAgICAvLyBzaWRlIG9mIHRoZSBzY3JlZW4uXG4gICAgbGVmdElucHV0SXNBY3RpdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnB1dC5rZXlib2FyZC5pc0Rvd24oUGhhc2VyLktleWJvYXJkLkEpXG4gICAgfSxcblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gc2hvdWxkIHJldHVybiB0cnVlIHdoZW4gdGhlIHBsYXllciBhY3RpdmF0ZXMgdGhlIFwiZ28gcmlnaHRcIiBjb250cm9sXG4gICAgLy8gSW4gdGhpcyBjYXNlLCBlaXRoZXIgaG9sZGluZyB0aGUgcmlnaHQgYXJyb3cgb3IgdGFwcGluZyBvciBjbGlja2luZyBvbiB0aGUgcmlnaHRcbiAgICAvLyBzaWRlIG9mIHRoZSBzY3JlZW4uXG4gICAgcmlnaHRJbnB1dElzQWN0aXZlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5wdXQua2V5Ym9hcmQuaXNEb3duKFBoYXNlci5LZXlib2FyZC5EKVxuICAgIH0sXG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIHNob3VsZCByZXR1cm4gdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgYWN0aXZhdGVzIHRoZSBcImp1bXBcIiBjb250cm9sXG4gICAgLy8gSW4gdGhpcyBjYXNlLCBlaXRoZXIgaG9sZGluZyB0aGUgdXAgYXJyb3cgb3IgdGFwcGluZyBvciBjbGlja2luZyBvbiB0aGUgY2VudGVyXG4gICAgLy8gcGFydCBvZiB0aGUgc2NyZWVuLlxuICAgIHVwSW5wdXRJc0FjdGl2ZTogZnVuY3Rpb24oZHVyYXRpb24pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5wdXQua2V5Ym9hcmQuZG93bkR1cmF0aW9uKFBoYXNlci5LZXlib2FyZC5XLCBkdXJhdGlvbilcbiAgICB9LFxuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiByZXR1cm5zIHRydWUgd2hlbiB0aGUgcGxheWVyIHJlbGVhc2VzIHRoZSBcImp1bXBcIiBjb250cm9sXG4gICAgdXBJbnB1dFJlbGVhc2VkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5wdXQua2V5Ym9hcmQudXBEdXJhdGlvbihQaGFzZXIuS2V5Ym9hcmQuVylcbiAgICB9XG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpZCkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5lbmVtaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICh0aGlzLmVuZW1pZXNbaV0ucGxheWVyLmlkID09PSBpZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZW5lbWllc1tpXVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IFJlbW90ZVBsYXllciA9IGZ1bmN0aW9uKGlkLCBnYW1lLCBwbGF5ZXIsIHN0YXJ0WCwgc3RhcnRZKSB7XG4gICAgbGV0IG5ld1JlbW90ZVBsYXllciA9IHtcbiAgICAgICAgeDogc3RhcnRYLFxuICAgICAgICB5OiBzdGFydFksXG4gICAgICAgIGlkOiBudWxsLFxuICAgICAgICBnYW1lOiBnYW1lLFxuICAgICAgICBoZWFsdGg6IDEwMCxcbiAgICAgICAgcGxheWVyOiBwbGF5ZXIsXG4gICAgICAgIGFsaXZlOiB0cnVlLFxuICAgICAgICBsYXN0UG9zaXRpb246IHtcbiAgICAgICAgICAgIHg6IHN0YXJ0WCxcbiAgICAgICAgICAgIHk6IHN0YXJ0WVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIHRoZSBwbGF5ZXIncyBlbmVteSBzcHJpdGVcbiAgICBuZXdSZW1vdGVQbGF5ZXIucGxheWVyID0gZ2FtZS5hZGQuc3ByaXRlKHN0YXJ0WCwgc3RhcnRZLCAnZW5lbXknKVxuXG4gICAgLy8gIFdlIG5lZWQgdG8gZW5hYmxlIHBoeXNpY3Mgb24gdGhlIHBsYXllclxuICAgIC8vIHRoaXMucGh5c2ljcy5hcmNhZGUuZW5hYmxlKG5ld1JlbW90ZVBsYXllci5wbGF5ZXIpXG5cbiAgICAvLyAvLyBFbmFibGUgcGh5c2ljcyBvbiB0aGUgcGxheWVyXG4gICAgLy8gdGhpcy5nYW1lLnBoeXNpY3MuZW5hYmxlKG5ld1JlbW90ZVBsYXllci5wbGF5ZXIsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSlcblxuICAgIC8vIE1ha2UgcGxheWVyIGNvbGxpZGUgd2l0aCB3b3JsZCBib3VuZGFyaWVzIHNvIGhlIGRvZXNuJ3QgbGVhdmUgdGhlIHN0YWdlXG4gICAgLy8gbmV3UmVtb3RlUGxheWVyLnBsYXllci5ib2R5LmNvbGxpZGVXb3JsZEJvdW5kcyA9IHRydWVcblxuICAgIC8vIE91ciB0d28gYW5pbWF0aW9ucywgd2Fsa2luZyBsZWZ0IGFuZCByaWdodC5cbiAgICBuZXdSZW1vdGVQbGF5ZXIucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdsZWZ0JywgWzAsIDEsIDIsIDNdLCAxMCwgdHJ1ZSlcbiAgICBuZXdSZW1vdGVQbGF5ZXIucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdyaWdodCcsIFs1LCA2LCA3LCA4XSwgMTAsIHRydWUpXG5cbiAgICBuZXdSZW1vdGVQbGF5ZXIucGxheWVyLmlkID0gaWRcblxuICAgIHJldHVybiBuZXdSZW1vdGVQbGF5ZXJcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBSZW1vdGVQbGF5ZXJcbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBvbk1vdmVQbGF5ZXI6IHJlcXVpcmUoJy4vb25Nb3ZlUGxheWVyJyksXG4gICAgb25SZW1vdmVQbGF5ZXI6IHJlcXVpcmUoJy4vb25SZW1vdmVQbGF5ZXInKSxcbiAgICBvblNvY2tldENvbm5lY3RlZDogcmVxdWlyZSgnLi9vblNvY2tldENvbm5lY3RlZCcpLFxuICAgIG9uU29ja2V0RGlzY29ubmVjdDogcmVxdWlyZSgnLi9vblNvY2tldERpc2Nvbm5lY3QnKSxcbiAgICBvblVwZGF0ZVBsYXllcnM6IHJlcXVpcmUoJy4vb25VcGRhdGVQbGF5ZXJzJyksXG4gICAgc2V0RXZlbnRIYW5kbGVyczogcmVxdWlyZSgnLi9zZXRFdmVudEhhbmRsZXJzJylcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgUGxheWVyQnlJZCA9IHJlcXVpcmUoJy4uL1BsYXllckJ5SWQnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBsZXQgbW92ZVBsYXllciA9IFBsYXllckJ5SWQuY2FsbCh0aGlzLCBkYXRhLmlkKVxuXG4gICAgLy8gUGxheWVyIG5vdCBmb3VuZFxuICAgIGlmICghIG1vdmVQbGF5ZXIpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIHBsYXllciBwb3NpdGlvblxuICAgIG1vdmVQbGF5ZXIucGxheWVyLnggPSBkYXRhLnhcbiAgICBtb3ZlUGxheWVyLnBsYXllci55ID0gZGF0YS55XG5cbiAgICBpZiAobW92ZVBsYXllci5wbGF5ZXIueCA+IG1vdmVQbGF5ZXIubGFzdFBvc2l0aW9uLngpIHtcbiAgICAgICAgbW92ZVBsYXllci5wbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdyaWdodCcpXG4gICAgfVxuICAgIGVsc2UgaWYgKG1vdmVQbGF5ZXIucGxheWVyLnggPCBtb3ZlUGxheWVyLmxhc3RQb3NpdGlvbi54KVxuICAgIHtcbiAgICAgICAgbW92ZVBsYXllci5wbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdsZWZ0JylcbiAgICB9XG4gICAgZWxzZVxuICAgIHtcbiAgICAgICAgbW92ZVBsYXllci5wbGF5ZXIuYW5pbWF0aW9ucy5zdG9wKClcbiAgICAgICAgbW92ZVBsYXllci5wbGF5ZXIuZnJhbWUgPSA0XG4gICAgfVxuXG4gICAgbW92ZVBsYXllci5sYXN0UG9zaXRpb24ueCA9IG1vdmVQbGF5ZXIucGxheWVyLnhcbiAgICBtb3ZlUGxheWVyLmxhc3RQb3NpdGlvbi55ID0gbW92ZVBsYXllci5wbGF5ZXIueVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBQbGF5ZXJCeUlkID0gcmVxdWlyZSgnLi4vUGxheWVyQnlJZCcpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIGxldCByZW1vdmVQbGF5ZXIgPSBQbGF5ZXJCeUlkLmNhbGwodGhpcywgZGF0YS5pZClcblxuICAgIC8vIFBsYXllciBub3QgZm91bmRcbiAgICBpZiAoIXJlbW92ZVBsYXllcikge1xuICAgICAgICBjb25zb2xlLmxvZygnUGxheWVyIG5vdCBmb3VuZDogJywgZGF0YS5pZClcbiAgICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgcmVtb3ZlUGxheWVyLnBsYXllci5raWxsKClcblxuICAgIC8vIFJlbW92ZSBwbGF5ZXIgZnJvbSBhcnJheVxuICAgIHRoaXMuZW5lbWllcy5zcGxpY2UodGhpcy5lbmVtaWVzLmluZGV4T2YocmVtb3ZlUGxheWVyKSwgMSlcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKCdDb25uZWN0ZWQgdG8gc29ja2V0IHNlcnZlcicpXG5cbiAgICAgLy8gUmVzZXQgZW5lbWllcyBvbiByZWNvbm5lY3RcbiAgICB0aGlzLmVuZW1pZXMuZm9yRWFjaChmdW5jdGlvbiAoZW5lbXkpIHtcbiAgICAgICAgaWYgKGVuZW15KSBlbmVteS5raWxsKClcbiAgICB9KVxuICAgIFxuICAgIHRoaXMuZW5lbWllcyA9IFtdXG5cbiAgICAvLyBTZW5kIGxvY2FsIHBsYXllciBkYXRhIHRvIHRoZSBnYW1lIHNlcnZlclxuICAgIHRoaXMuc29ja2V0LmVtaXQoJ25ldyBwbGF5ZXInLCB7XG4gICAgICAgIHg6IHRoaXMucGxheWVyLngsXG4gICAgICAgIHk6IHRoaXMucGxheWVyLnlcbiAgICB9KVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coJ0Rpc2Nvbm5lY3RlZCBmcm9tIHNvY2tldCBzZXJ2ZXInKVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBSZW1vdGVQbGF5ZXIgPSByZXF1aXJlKCcuLi9SZW1vdGVQbGF5ZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICB0aGlzLmVuZW1pZXMuZm9yRWFjaChmdW5jdGlvbiAoZW5lbXkpIHtcbiAgICAgICAgZW5lbXkucGxheWVyLmtpbGwoKVxuICAgIH0pXG5cbiAgICB0aGlzLmVuZW1pZXMgPSBbXVxuXG4gICAgZGF0YS5wbGF5ZXJzLmZvckVhY2goKHBsYXllcikgPT4ge1xuICAgICAgICBpZiAocGxheWVyLmlkID09PSAoJy8jJyArIHRoaXMuc29ja2V0LmlkKSlcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIGxldCBuZXdSZW1vdGVQbGF5ZXIgPSBSZW1vdGVQbGF5ZXIuY2FsbCh0aGlzLCBwbGF5ZXIuaWQsIHRoaXMuZ2FtZSwgdGhpcy5wbGF5ZXIsIHBsYXllci54LCBwbGF5ZXIueSlcbiAgICAgICAgdGhpcy5lbmVtaWVzLnB1c2gobmV3UmVtb3RlUGxheWVyKVxuICAgICAgICB0aGlzLmVuZW1pZXNbdGhpcy5lbmVtaWVzLmxlbmd0aCAtIDFdLnBsYXllci5hbmltYXRpb25zLmFkZCgnbGVmdCcsIFswLCAxLCAyLCAzXSwgMTAsIHRydWUpXG4gICAgICAgIHRoaXMuZW5lbWllc1t0aGlzLmVuZW1pZXMubGVuZ3RoIC0gMV0ucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdyaWdodCcsIFs1LCA2LCA3LCA4XSwgMTAsIHRydWUpXG4gICAgfSlcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBTb2NrZXQgY29ubmVjdGlvbiBzdWNjZXNzZnVsXG4gICAgdGhpcy5zb2NrZXQub24oJ2Nvbm5lY3QnLCB0aGlzLm9uU29ja2V0Q29ubmVjdGVkLmJpbmQodGhpcykpXG5cbiAgICAvLyBTb2NrZXQgZGlzY29ubmVjdGlvblxuICAgIHRoaXMuc29ja2V0Lm9uKCdkaXNjb25uZWN0JywgdGhpcy5vblNvY2tldERpc2Nvbm5lY3QuYmluZCh0aGlzKSlcblxuICAgIC8vIFBsYXllciBtb3ZlIG1lc3NhZ2UgcmVjZWl2ZWRcbiAgICB0aGlzLnNvY2tldC5vbignbW92ZSBwbGF5ZXInLCB0aGlzLm9uTW92ZVBsYXllci5iaW5kKHRoaXMpKVxuXG4gICAgLy8gUGxheWVyIHJlbW92ZWQgbWVzc2FnZSByZWNlaXZlZFxuICAgIHRoaXMuc29ja2V0Lm9uKCdyZW1vdmUgcGxheWVyJywgdGhpcy5vblJlbW92ZVBsYXllci5iaW5kKHRoaXMpKVxuXG4gICAgLy8gVXBkYXRlZCBsaXN0IG9mIHBsYXllcnMgdG8gc3luYyBlbmVtaWVzIHRvXG4gICAgdGhpcy5zb2NrZXQub24oJ3VwZGF0ZSBwbGF5ZXJzJywgdGhpcy5vblVwZGF0ZVBsYXllcnMuYmluZCh0aGlzKSlcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgQnVsbGV0ID0gcmVxdWlyZSgnLi4vQnVsbGV0JylcblxubGV0IEFLNDcgPSBmdW5jdGlvbiAoZ2FtZSkge1xuICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGdhbWUsIGdhbWUud29ybGQsICdBSy00NycsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuXG4gICAgLy9cdEhlcmUgd2Ugc2V0LXVwIG91ciBhdWRpbyBzcHJpdGVcbiAgICB0aGlzLmZ4ID0gZ2FtZS5hZGQuYXVkaW8oJ0FLNDctc291bmQnKVxuICAgIHRoaXMuYWxsb3dNdWx0aXBsZSA9IHRydWVcblxuICAgIHRoaXMuZGFtYWdlID0gMjJcbiAgICB0aGlzLm5leHRGaXJlID0gMFxuICAgIHRoaXMuYnVsbGV0U3BlZWQgPSAxODAwXG4gICAgLy8gQUs0NyBmaXJlcyBhYm91dCA2MDAgYnVsbGV0cyBwZXIgc2Vjb25kXG4gICAgdGhpcy5maXJlUmF0ZSA9IDE2MDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNjQ7IGkrKylcbiAgICB7XG4gICAgICAgIGxldCBidWxsZXQgPSBuZXcgQnVsbGV0KHRoaXMuZ2FtZSwgJ2J1bGxldDEyJylcbiAgICAgICAgYnVsbGV0LmhlaWdodCA9IDJcbiAgICAgICAgYnVsbGV0LndpZHRoID0gNDBcbiAgICAgICAgYnVsbGV0LmRhbWFnZSA9IDIyXG4gICAgICAgIHRoaXMuYWRkKGJ1bGxldCwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbn1cblxuQUs0Ny5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuQUs0Ny5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBBSzQ3O1xuXG5BSzQ3LnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24gKHNvdXJjZSkge1xuXG4gICAgaWYgKHRoaXMuZ2FtZS50aW1lLnRpbWUgPCB0aGlzLm5leHRGaXJlKVxuICAgICAgICByZXR1cm5cblxuICAgIHZhciB4ID0gc291cmNlLnggKyAxNTtcbiAgICB2YXIgeSA9IHNvdXJjZS55ICsgMzA7XG5cbiAgICB0aGlzLmdldEZpcnN0RXhpc3RzKGZhbHNlKS5maXJlKHgsIHksIDAsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDApO1xuICAgIHRoaXMuc2V0QWxsKCd0cmFja2luZycsIHRydWUpXG5cbiAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5nYW1lLnRpbWUudGltZSArIHRoaXMuZmlyZVJhdGVcbiAgICB0aGlzLmZ4LnBsYXkoKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFLNDdcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgQnVsbGV0ID0gcmVxdWlyZSgnLi4vQnVsbGV0JylcblxubGV0IEJhcnJldE04MkExID0gZnVuY3Rpb24gKGdhbWUpIHtcbiAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCBnYW1lLCBnYW1lLndvcmxkLCAnQmFycmV0TTgyQTEnLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcblxuICAgIC8vXHRIZXJlIHdlIHNldC11cCBvdXIgYXVkaW8gc3ByaXRlXG4gICAgdGhpcy5meCA9IGdhbWUuYWRkLmF1ZGlvKCdCYXJyZXRNODJBMS1zb3VuZCcpXG4gICAgdGhpcy5hbGxvd011bHRpcGxlID0gdHJ1ZVxuXG4gICAgdGhpcy5uYW1lID0gJ0JhcnJldCBNODJBMSdcbiAgICB0aGlzLmRhbWFnZSA9IDg4XG4gICAgdGhpcy5uZXh0RmlyZSA9IDBcbiAgICB0aGlzLmJ1bGxldFNwZWVkID0gMzQzNVxuXG4gICAgLy8gQmFycmV0TTgyQTEgZmlyZXMgYWJvdXQgNjAwIGJ1bGxldHMgcGVyIHNlY29uZFxuICAgIHRoaXMuZmlyZVJhdGUgPSAzMDAwXG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDY0OyBpKyspXG4gICAge1xuICAgICAgICBsZXQgYnVsbGV0ID0gbmV3IEJ1bGxldCh0aGlzLmdhbWUsICdidWxsZXQxMicpXG4gICAgICAgIGJ1bGxldC5oZWlnaHQgPSAyXG4gICAgICAgIGJ1bGxldC53aWR0aCA9IDQwXG4gICAgICAgIGJ1bGxldC5kYW1hZ2UgPSA4OFxuXG4gICAgICAgIHRoaXMuYWRkKGJ1bGxldCwgdHJ1ZSlcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xufVxuXG5CYXJyZXRNODJBMS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuQmFycmV0TTgyQTEucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQmFycmV0TTgyQTE7XG5cbkJhcnJldE04MkExLnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24gKHNvdXJjZSkge1xuICAgIGlmICh0aGlzLmdhbWUudGltZS50aW1lIDwgdGhpcy5uZXh0RmlyZSlcbiAgICAgICAgcmV0dXJuXG5cbiAgICB2YXIgeCA9IHNvdXJjZS54ICsgMTU7XG4gICAgdmFyIHkgPSBzb3VyY2UueSArIDMwO1xuXG4gICAgdGhpcy5nZXRGaXJzdEV4aXN0cyhmYWxzZSkuZmlyZSh4LCB5LCAwLCB0aGlzLmJ1bGxldFNwZWVkLCAwLCAwKVxuICAgIHRoaXMuc2V0QWxsKCd0cmFja2luZycsIHRydWUpXG5cbiAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5nYW1lLnRpbWUudGltZSArIHRoaXMuZmlyZVJhdGVcbiAgICB0aGlzLmZ4LnZvbHVtZSA9IC42XG4gICAgdGhpcy5meC5wbGF5KClcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCYXJyZXRNODJBMVxuIiwiJ3VzZSBzdHJpY3QnXG5cbi8qKlxuICogUHJpbWFyeSBXZWFwb25zXG4gKiAxLiBEZXNlcnQgRWFnbGVzXG4gKiAyLiBISyBNUDVcbiAqIDMuIEFLNDdcbiAqIDQuIE0xNlxuICogNS4gU3Bhcy0xMlxuICogNi4gUnVnZXIgNzdcbiAqIDcuIE03OVxuICogOC4gQmFycmV0IE04MkExXG4gKiA5LiBGTiBNaW5pbWlcbiAqIDEwLiBYTTIxNCBNaW5pZ3VuXG4gKi9cblxuLyoqXG4gKiBTZWNvbmRhcnkgV2VhcG9uc1xuICogMS4gVVNTT0NPTVxuICogMi4gQ29tYmF0IEtuaWZlXG4gKiAzLiBDaGFpbnNhd1xuICogNC4gTTcyIExhd1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIFwiQUs0N1wiOiByZXF1aXJlKCcuL0FLNDcnKSxcbiAgICBcIkJhcnJldE04MkExXCI6IHJlcXVpcmUoJy4vQmFycmV0TTgyQTEnKVxuICAgIC8vIFwiU3BhczEyXCI6IHJlcXVpcmUoJy4vU3BhczEyJyksXG4gICAgLy8gXCJSUEdcIjogcmVxdWlyZSgnLi9SUEcnKVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBGb3Jlc3RDdGYgPSB7fVxuXG5Gb3Jlc3RDdGYuY3JlYXRlID0gZnVuY3Rpb24oc2NvcGUpIHtcbiAgICB0aGlzLnNjb3BlID0gc2NvcGVcblxuICAgIHRoaXMuY3JlYXRlU2t5U3ByaXRlKClcbiAgICB0aGlzLmNyZWF0ZVBsYXRmb3JtcygpXG4gICAgdGhpcy5jcmVhdGVMZWRnZXMoKVxuXG4gICAgdGhpcy5zY29wZS5wbGF0Zm9ybXMuc2V0QWxsKCdib2R5LmltbW92YWJsZScsIHRydWUpXG4gICAgdGhpcy5zY29wZS5wbGF0Zm9ybXMuc2V0QWxsKCdib2R5LmFsbG93R3Jhdml0eScsIGZhbHNlKVxufVxuXG5Gb3Jlc3RDdGYuY3JlYXRlTGVkZ2VzID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IGxlZGdlcyA9IFtcbiAgICAgICAgLy8ge3gsIHksIHdpZHRoLCBoZWlnaHR9XG5cbiAgICAgICAgLy8gU3RhcnRpbmcgTGVkZ2VzXG4gICAgICAgIHsgaWQ6IDEsIHg6IDAsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA0MzEsIHdpZHRoOiAxMjgsIGhlaWdodDogOTIgfSwgLy8gTGVmdCBib3R0b20gbGVkZ2VcbiAgICAgICAgeyBpZDogMiwgeDogMCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDgzOCwgd2lkdGg6IDEyOCwgaGVpZ2h0OiA5MiB9LCAvLyBMZWZ0IHRvcCBsZWRnZVxuXG4gICAgICAgIHsgaWQ6IDMsIHg6IDM4NzIsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA0MjcsIHdpZHRoOiAxMjgsIGhlaWdodDogOTIgfSwgLy8gUmlnaHQgYm90dG9tIGxlZGdlXG4gICAgICAgIHsgaWQ6IDQsIHg6IDM4NzIsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA4MzUsIHdpZHRoOiAxMjgsIGhlaWdodDogOTIgfSwgLy8gUmlnaHQgdG9wIGxlZGdlXG5cbiAgICAgICAgLy8gR3JvdW5kIExlZGdlc1xuICAgICAgICB7IGlkOiA1LCB4OiAwLCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gMTI4LCB3aWR0aDogNDc0LCBoZWlnaHQ6IDEyOCB9LCAvLyBNYWluIGJvdHRvbSBzdGFydGluZyBsZWZ0IGxlZGdlXG4gICAgICAgIHsgaWQ6IDYsIHg6IDQ3NCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDI1Niwgd2lkdGg6IDY0MSwgaGVpZ2h0OiAyNjAgfSwgLy8gTWFpbiBib3R0b20gbGVmdCBsZWRnZVxuICAgICAgICB7IGlkOiA3LCB4OiAxMTE1LCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gMzg0LCB3aWR0aDogMTc4NSwgaGVpZ2h0OiAzOTAgfSwgLy8gTWFpbiBib3R0b20gY2VudGVyIGxlZGdlXG4gICAgICAgIHsgaWQ6IDgsIHg6IDI5MDAsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSAyNTYsIHdpZHRoOiA2NDEsIGhlaWdodDogMjYwIH0sIC8vIE1haW4gYm90dG9tIHJpZ2h0IGxlZGdlXG4gICAgICAgIHsgaWQ6IDksIHg6IDM1NDAsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSAxMjgsIHdpZHRoOiA0NzQsIGhlaWdodDogMTI4IH0sIC8vIE1haW4gYm90dG9tIHN0YXJ0aW5nIHJpZ2h0IGxlZGdlXG5cbiAgICAgICAgLy8gQWlyIExlZGdlc1xuICAgICAgICB7IGlkOiAxMCwgeDogMzAwLCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gNjA4LCB3aWR0aDogNjQxLCBoZWlnaHQ6IDkyIH0sXG4gICAgICAgIHsgaWQ6IDExLCB4OiAxMTEwLCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gNzAxLCB3aWR0aDogNTEzLCBoZWlnaHQ6IDkyIH0sXG4gICAgICAgIHsgaWQ6IDEyLCB4OiA4NzAsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA5ODIsIHdpZHRoOiAyNTYsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogMTMsIHg6IDE3NDQsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA4NzQsIHdpZHRoOiA1MDcsIGhlaWdodDogMjU0IH0sXG4gICAgICAgIHsgaWQ6IDE0LCB4OiAyMzkwLCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gNjg5LCB3aWR0aDogNTEzLCBoZWlnaHQ6IDkyIH0sXG4gICAgICAgIHsgaWQ6IDE1LCB4OiAzMDMxLCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gNjA4LCB3aWR0aDogNjQxLCBoZWlnaHQ6IDkyIH0sXG4gICAgICAgIHsgaWQ6IDE2LCB4OiAyOTAzLCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gOTU3LCB3aWR0aDogMjU2LCBoZWlnaHQ6IDkyIH0sXG5cbiAgICAgICAgLy8gQm94ZXNcbiAgICAgICAgeyBpZDogMTcsIHg6IDcxNywgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDY4NSwgd2lkdGg6IDE1NCwgaGVpZ2h0OiA3NyB9LFxuICAgICAgICB7IGlkOiAxOCwgeDogNzU3LCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gNzYyLCB3aWR0aDogNzcsIGhlaWdodDogNzcgfSxcbiAgICAgICAgeyBpZDogMTksIHg6IDE0MTgsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA3NzgsIHdpZHRoOiA3NywgaGVpZ2h0OiA3NyB9LFxuICAgICAgICB7IGlkOiAyMCwgeDogMTkzMSwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDQ2MSwgd2lkdGg6IDE1NCwgaGVpZ2h0OiA3NyB9LFxuICAgICAgICB7IGlkOiAyMSwgeDogMzIwNSwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDY4NSwgd2lkdGg6IDE1NCwgaGVpZ2h0OiA3NyB9LFxuICAgICAgICB7IGlkOiAyMiwgeDogMzI0NSwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDc2Miwgd2lkdGg6IDc3LCBoZWlnaHQ6IDc3IH1cbiAgICBdXG5cblxuICAgIGxlZGdlcy5mb3JFYWNoKChsZWRnZSkgPT4ge1xuICAgICAgICAvLyB2YXIgbmV3TGVkZ2UgPSB0aGlzLnNjb3BlLnBsYXRmb3Jtcy5jcmVhdGUobGVkZ2UueCwgbGVkZ2UueSwgJ2dyb3VuZCcpXG4gICAgICAgIHZhciBuZXdMZWRnZSA9IHRoaXMuc2NvcGUucGxhdGZvcm1zLmNyZWF0ZShsZWRnZS54LCBsZWRnZS55KVxuICAgICAgICBuZXdMZWRnZS5oZWlnaHQgPSBsZWRnZS5oZWlnaHRcbiAgICAgICAgbmV3TGVkZ2Uud2lkdGggPSBsZWRnZS53aWR0aFxuXG4gICAgICAgIC8vIERlYnVnIHN0dWZmXG4gICAgICAgIC8vIG5ld0xlZGdlLmFscGhhID0gMC4yXG4gICAgICAgIC8vIGxldCBzdHlsZSA9IHsgZm9udDogXCIyMHB4IEFyaWFsXCIsIGZpbGw6IFwiI2ZmMDA0NFwiLCBhbGlnbjogXCJjZW50ZXJcIiwgYmFja2dyb3VuZENvbG9yOiBcIiNmZmZmMDBcIiB9XG4gICAgICAgIC8vIGxldCB0ZXh0ID0gdGhpcy5zY29wZS5nYW1lLmFkZC50ZXh0KGxlZGdlLngsIGxlZGdlLnksIGxlZGdlLmlkLCBzdHlsZSlcbiAgICAgICAgLy8gdGV4dC5hbHBoYSA9IDAuMlxuICAgIH0pXG59XG5cbkZvcmVzdEN0Zi5jcmVhdGVTa3lTcHJpdGUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNjb3BlLmFkZC50aWxlU3ByaXRlKDAsIHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSAxNTAwLCB0aGlzLnNjb3BlLmdhbWUud29ybGQud2lkdGgsIDE1MDAsICd0cmVlc2NhcGUnKVxufVxuXG5Gb3Jlc3RDdGYuY3JlYXRlUGxhdGZvcm1zID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zY29wZS5wbGF0Zm9ybXMgPSB0aGlzLnNjb3BlLmFkZC5ncm91cCgpXG4gICAgdGhpcy5zY29wZS5wbGF0Zm9ybXMuZW5hYmxlQm9keSA9IHRydWVcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGb3Jlc3RDdGZcbiJdfQ==
