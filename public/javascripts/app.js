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
    onRemovePlayer: SocketEvents.onRemovePlayer,
    onBulletFired: SocketEvents.onBulletFired,
    onBulletRemoved: SocketEvents.onBulletRemoved
};

game.state.add('Game', RangerSteveGame, true);

},{"./core":3,"./lib/InputHandler":9,"./lib/SocketEvents":12}],2:[function(require,module,exports){
'use strict';

var ForestCtf = require('../maps/ForestCtf');
var Weapons = require('../lib/Weapons');

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

  /**
   * Map
   */
  ForestCtf.create.call(this);

  /**
   * Player Settings
   */
  var spawnPoint = ForestCtf.getRandomSpawnPoint.call(this);
  this.player = this.add.sprite(spawnPoint.x, spawnPoint.y, 'dude');

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
  this.weapons = [new Weapons.AK47({
    game: this.game
  }), new Weapons.BarretM82A1({
    game: this.game
  })];

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
   * Enemy Bullets
   */
  this.enemyBullets = this.game.add.group();

  /**
   * Start listening for events
   */
  this.setEventHandlers();
};

},{"../lib/Weapons":23,"../maps/ForestCtf":24}],3:[function(require,module,exports){
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
            bulletId: bullet.bulletId
        });

        return false;
    }, this);

    // Did this player hit any enemies
    // this.enemies.forEach((enemy) => {
    //     this.physics.arcade.collide(enemy.player, this.weapons, null, function(enemyPlayer, weapon) {
    //         console.log('You hit someone!')
    //         weapon.kill()
    //         this.socket.emit('bullet removed', {
    //             bulletId: weapon.id
    //         })
    //
    //         return false
    //     }, this)
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

    if (this.game.input.activePointer.isDown) {
        this.weapons[this.currentWeapon].fire(this.player, this.socket);
    }

    this.socket.emit('move player', {
        x: this.player.x,
        y: this.player.y
    });
};

},{}],7:[function(require,module,exports){
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

Bullet.prototype.fire = function (x, y, angle, speed, gx, gy, socket) {
    this.reset(x, y);

    var pointerAngle = this.game.physics.arcade.moveToPointer(this, speed);
    this.body.gravity.y = -1800;

    console.log('Firing bullet locally', this.bulletId);

    socket.emit('bullet fired', {
        bulletId: this.bulletId,
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

},{"./Guid":8}],8:[function(require,module,exports){
'use strict';

module.exports = function guidGenerator() {
   var S4 = function S4() {
      return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
   };

   return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
};

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
'use strict';

module.exports = function (id) {
    for (var i = 0; i < this.enemies.length; i++) {
        if (this.enemies[i].player.id === id) {
            return this.enemies[i];
        }
    }

    return false;
};

},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
'use strict';

module.exports = {
    setEventHandlers: require('./setEventHandlers'),

    onSocketConnected: require('./onSocketConnected'),
    onSocketDisconnect: require('./onSocketDisconnect'),

    onMovePlayer: require('./onMovePlayer'),
    onRemovePlayer: require('./onRemovePlayer'),
    onUpdatePlayers: require('./onUpdatePlayers'),

    onBulletFired: require('./onBulletFired'),
    onBulletRemoved: require('./onBulletRemoved')
};

},{"./onBulletFired":13,"./onBulletRemoved":14,"./onMovePlayer":15,"./onRemovePlayer":16,"./onSocketConnected":17,"./onSocketDisconnect":18,"./onUpdatePlayers":19,"./setEventHandlers":20}],13:[function(require,module,exports){
'use strict';

var Bullet = require('../Bullet');

module.exports = function (data) {
    if (data.id === '/#' + this.socket.id) return;

    console.log('Firing bullet remotely', data.bulletId);

    var newEnemyBullet = this.enemyBullets.create(data.x, data.y, 'bullet12');
    newEnemyBullet.bulletId = data.bulletId;
    newEnemyBullet.rotation = data.pointerAngle;
    newEnemyBullet.height = data.height;
    newEnemyBullet.width = data.width;
    this.game.physics.enable(newEnemyBullet, Phaser.Physics.ARCADE);
    newEnemyBullet.body.gravity.y = -1800;

    var newVelocity = this.game.physics.arcade.velocityFromRotation(data.pointerAngle, data.speed);
    newEnemyBullet.body.velocity.x += newVelocity.x;
    newEnemyBullet.body.velocity.y += newVelocity.y;
};

},{"../Bullet":7}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
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

},{"../PlayerById":10}],16:[function(require,module,exports){
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

},{"../PlayerById":10}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
'use strict';

module.exports = function () {
    console.log('Disconnected from socket server');
};

},{}],19:[function(require,module,exports){
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

},{"../RemotePlayer":11}],20:[function(require,module,exports){
'use strict';

module.exports = function () {
    this.socket.on('connect', this.onSocketConnected.bind(this));
    this.socket.on('disconnect', this.onSocketDisconnect.bind(this));

    this.socket.on('update players', this.onUpdatePlayers.bind(this));
    this.socket.on('move player', this.onMovePlayer.bind(this));
    this.socket.on('remove player', this.onRemovePlayer.bind(this));

    this.socket.on('bullet fired', this.onBulletFired.bind(this));
    this.socket.on('bullet removed', this.onBulletRemoved.bind(this));
};

},{}],21:[function(require,module,exports){
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
    this.bulletSpeed = 1800;
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

AK47.prototype.fire = function (player, socket) {
    if (this.game.time.time < this.nextFire) return;

    var x = player.x + 15;
    var y = player.y + 30;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0, socket);
    this.setAll('tracking', true);

    this.nextFire = this.game.time.time + this.fireRate;
    this.fx.play();
};

module.exports = AK47;

},{"../Bullet":7,"../Guid":8}],22:[function(require,module,exports){
'use strict';

var Bullet = require('../Bullet');
var Guid = require('../Guid');

var BarretM82A1 = function BarretM82A1(config) {
    Phaser.Group.call(this, config.game, config.game.world, 'Barret M82A1', false, true, Phaser.Physics.ARCADE);

    //	Here we set-up our audio sprite
    this.fx = config.game.add.audio('BarretM82A1-sound');
    this.allowMultiple = true;

    this.name = 'Barret M82A1';
    this.damage = 88;
    this.nextFire = 0;
    this.bulletSpeed = 3435;

    // BarretM82A1 fires about 600 bullets per second
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

BarretM82A1.prototype = Object.create(Phaser.Group.prototype);
BarretM82A1.prototype.constructor = BarretM82A1;

BarretM82A1.prototype.fire = function (player, socket) {
    if (this.game.time.time < this.nextFire) return;

    var x = player.x + 15;
    var y = player.y + 30;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0, socket);
    this.setAll('tracking', true);

    this.nextFire = this.game.time.time + this.fireRate;
    this.fx.volume = .6;
    this.fx.play();
};

module.exports = BarretM82A1;

},{"../Bullet":7,"../Guid":8}],23:[function(require,module,exports){
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

},{"./AK47":21,"./BarretM82A1":22}],24:[function(require,module,exports){
'use strict';

var ForestCtf = {};

ForestCtf.create = function () {
    this.spawnPoints = [{
        x: 500,
        y: this.world.height - 700
    }];

    // {
    //     x: 200,
    //     y: this.world.height - 200
    // },
    // {
    //     x: 3750,
    //     y: this.world.height - 200
    // },
    // {
    //     x: 3450,
    //     y: this.world.height - 700
    // },
    // {
    //     x: 2600,
    //     y: this.world.height - 800
    // },
    // {
    //     x: 1250,
    //     y: this.world.height - 800
    // }
    ForestCtf.createSkySprite.call(this);
    ForestCtf.createPlatforms.call(this);
    ForestCtf.createLedges.call(this);

    this.platforms.setAll('body.immovable', true);
    this.platforms.setAll('body.allowGravity', false);
};

ForestCtf.createSkySprite = function () {
    this.add.tileSprite(0, this.game.world.height - 1500, this.game.world.width, 1500, 'treescape');
};

ForestCtf.createPlatforms = function () {
    this.platforms = this.add.group();
    this.platforms.enableBody = true;
};

ForestCtf.getRandomSpawnPoint = function () {
    return _.sample(this.spawnPoints);
};

ForestCtf.createLedges = function () {
    var _this = this;

    var ledges = [
    // {x, y, width, height}

    // Starting Ledges
    { id: 1, x: 0, y: this.game.world.height - 431, width: 128, height: 92 }, // Left bottom ledge
    { id: 2, x: 0, y: this.game.world.height - 838, width: 128, height: 92 }, // Left top ledge

    { id: 3, x: 3872, y: this.game.world.height - 427, width: 128, height: 92 }, // Right bottom ledge
    { id: 4, x: 3872, y: this.game.world.height - 835, width: 128, height: 92 }, // Right top ledge

    // Ground Ledges
    { id: 5, x: 0, y: this.game.world.height - 128, width: 474, height: 128 }, // Main bottom starting left ledge
    { id: 6, x: 474, y: this.game.world.height - 256, width: 641, height: 260 }, // Main bottom left ledge
    { id: 7, x: 1115, y: this.game.world.height - 384, width: 1785, height: 390 }, // Main bottom center ledge
    { id: 8, x: 2900, y: this.game.world.height - 256, width: 641, height: 260 }, // Main bottom right ledge
    { id: 9, x: 3540, y: this.game.world.height - 128, width: 474, height: 128 }, // Main bottom starting right ledge

    // Air Ledges
    { id: 10, x: 300, y: this.game.world.height - 608, width: 641, height: 92 }, { id: 11, x: 1110, y: this.game.world.height - 701, width: 513, height: 92 }, { id: 12, x: 870, y: this.game.world.height - 982, width: 256, height: 92 }, { id: 13, x: 1744, y: this.game.world.height - 874, width: 507, height: 254 }, { id: 14, x: 2390, y: this.game.world.height - 689, width: 513, height: 92 }, { id: 15, x: 3031, y: this.game.world.height - 608, width: 641, height: 92 }, { id: 16, x: 2903, y: this.game.world.height - 957, width: 256, height: 92 },

    // Boxes
    { id: 17, x: 717, y: this.game.world.height - 685, width: 154, height: 77 }, { id: 18, x: 757, y: this.game.world.height - 762, width: 77, height: 77 }, { id: 19, x: 1418, y: this.game.world.height - 778, width: 77, height: 77 }, { id: 20, x: 1931, y: this.game.world.height - 461, width: 154, height: 77 }, { id: 21, x: 3205, y: this.game.world.height - 685, width: 154, height: 77 }, { id: 22, x: 3245, y: this.game.world.height - 762, width: 77, height: 77 }];

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

module.exports = ForestCtf;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvYXBwLmpzIiwiYXNzZXRzL2pzL2NvcmUvY3JlYXRlLmpzIiwiYXNzZXRzL2pzL2NvcmUvaW5kZXguanMiLCJhc3NldHMvanMvY29yZS9pbml0LmpzIiwiYXNzZXRzL2pzL2NvcmUvcHJlbG9hZC5qcyIsImFzc2V0cy9qcy9jb3JlL3VwZGF0ZS5qcyIsImFzc2V0cy9qcy9saWIvQnVsbGV0LmpzIiwiYXNzZXRzL2pzL2xpYi9HdWlkLmpzIiwiYXNzZXRzL2pzL2xpYi9JbnB1dEhhbmRsZXIuanMiLCJhc3NldHMvanMvbGliL1BsYXllckJ5SWQuanMiLCJhc3NldHMvanMvbGliL1JlbW90ZVBsYXllci5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL2luZGV4LmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvb25CdWxsZXRGaXJlZC5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL29uQnVsbGV0UmVtb3ZlZC5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL29uTW92ZVBsYXllci5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL29uUmVtb3ZlUGxheWVyLmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvb25Tb2NrZXRDb25uZWN0ZWQuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vblNvY2tldERpc2Nvbm5lY3QuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vblVwZGF0ZVBsYXllcnMuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9zZXRFdmVudEhhbmRsZXJzLmpzIiwiYXNzZXRzL2pzL2xpYi9XZWFwb25zL0FLNDcuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvQmFycmV0TTgyQTEuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvaW5kZXguanMiLCJhc3NldHMvanMvbWFw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QThCLE9BQU8sR0FBUCxFQUFZLFFBQVEsRUFBUixFQTlCdkQsRUErQlQsRUFBRSxJQUFJLEVBQUosRUFBUSxHQUFHLElBQUgsRUFBUyxHQUFHLEtBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsTUFBaEIsR0FBeUIsR0FBekIsRUFBOEIsT0FBTyxHQUFQLEVBQVksUUFBUSxFQUFSLEVBL0J2RCxFQWdDVCxFQUFFLElBQUksRUFBSixFQUFRLEdBQUcsSUFBSCxFQUFTLEdBQUcsS0FBSyxJQUFMLENBQVUsS0FBVixDQUFnQixNQUFoQixHQUF5QixHQUF6QixFQUE4QixPQUFPLEVBQVAsRUFBVyxRQUFRLEVBQVIsRUFoQ3RELENBQVQsQ0FENEI7O0FBb0NoQyxXQUFPLE9BQVAsQ0FBZSxVQUFDLEtBQUQsRUFBVzs7QUFFdEIsWUFBSSxXQUFXLE1BQUssU0FBTCxDQUFlLE1BQWYsQ0FBc0IsTUFBTSxDQUFOLEVBQVMsTUFBTSxDQUFOLENBQTFDLENBRmtCO0FBR3RCLGlCQUFTLE1BQVQsR0FBa0IsTUFBTSxNQUFOLENBSEk7QUFJdEIsaUJBQVMsS0FBVCxHQUFpQixNQUFNLEtBQU47Ozs7Ozs7QUFKSyxLQUFYLENBQWYsQ0FwQ2dDO0NBQVg7O0FBa0R6QixPQUFPLE9BQVAsR0FBaUIsU0FBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBJbnB1dEhhbmRsZXIgPSByZXF1aXJlKCcuL2xpYi9JbnB1dEhhbmRsZXInKVxuLy8gbGV0IEVuZW15QnVmZmFsbyA9IHJlcXVpcmUoJy4vbGliL0VuZW15QnVmZmFsbycpXG5sZXQgU29ja2V0RXZlbnRzID0gcmVxdWlyZSgnLi9saWIvU29ja2V0RXZlbnRzJylcbmxldCBDb3JlID0gcmVxdWlyZSgnLi9jb3JlJylcblxubGV0IGdhbWVXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXG5sZXQgZ2FtZUhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodFxubGV0IGdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoZ2FtZVdpZHRoLCBnYW1lSGVpZ2h0LCBQaGFzZXIuQVVUTywgJ3Jhbmdlci1zdGV2ZS1nYW1lJylcblxubGV0IFJhbmdlclN0ZXZlR2FtZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY3VycmVudFdlYXBvbiA9IDBcbiAgICB0aGlzLmVuZW1pZXMgPSBbXVxuICAgIHRoaXMuZ2FtZSA9IGdhbWVcbiAgICB0aGlzLmdyb3VuZFxuICAgIHRoaXMucGxhdGZvcm1zXG4gICAgdGhpcy5wbGF5ZXJcbiAgICB0aGlzLnNjb3JlID0gMFxuICAgIHRoaXMuc2NvcmVUZXh0XG4gICAgdGhpcy5zb2NrZXRcbiAgICB0aGlzLndlYXBvbk5hbWUgPSBudWxsXG4gICAgdGhpcy53ZWFwb25zID0gW11cbn1cblxuUmFuZ2VyU3RldmVHYW1lLnByb3RvdHlwZSA9IHtcbiAgICBpbml0OiBDb3JlLmluaXQsXG4gICAgcHJlbG9hZDogQ29yZS5wcmVsb2FkLFxuICAgIGNyZWF0ZTogQ29yZS5jcmVhdGUsXG4gICAgdXBkYXRlOiBDb3JlLnVwZGF0ZSxcblxuICAgIGxlZnRJbnB1dElzQWN0aXZlOiBJbnB1dEhhbmRsZXIubGVmdElucHV0SXNBY3RpdmUsXG4gICAgcmlnaHRJbnB1dElzQWN0aXZlOiBJbnB1dEhhbmRsZXIucmlnaHRJbnB1dElzQWN0aXZlLFxuICAgIHVwSW5wdXRJc0FjdGl2ZTogSW5wdXRIYW5kbGVyLnVwSW5wdXRJc0FjdGl2ZSxcbiAgICB1cElucHV0UmVsZWFzZWQ6IElucHV0SGFuZGxlci51cElucHV0UmVsZWFzZWQsXG5cbiAgICBuZXh0V2VhcG9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gIFRpZHktdXAgdGhlIGN1cnJlbnQgd2VhcG9uXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRXZWFwb24gPiA5KVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS5yZXNldCgpXG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS52aXNpYmxlID0gZmFsc2VcbiAgICAgICAgICAgIHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLmNhbGxBbGwoJ3Jlc2V0JywgbnVsbCwgMCwgMClcbiAgICAgICAgICAgIHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLnNldEFsbCgnZXhpc3RzJywgZmFsc2UpXG4gICAgICAgIH1cblxuICAgICAgICAvLyAgQWN0aXZhdGUgdGhlIG5ldyBvbmVcbiAgICAgICAgdGhpcy5jdXJyZW50V2VhcG9uKytcblxuICAgICAgICBpZiAodGhpcy5jdXJyZW50V2VhcG9uID09PSB0aGlzLndlYXBvbnMubGVuZ3RoKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRXZWFwb24gPSAwXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS52aXNpYmxlID0gdHJ1ZVxuXG4gICAgICAgIHRoaXMud2VhcG9uTmFtZS50ZXh0ID0gdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0ubmFtZVxuICAgIH0sXG5cbiAgICBzZXRFdmVudEhhbmRsZXJzOiBTb2NrZXRFdmVudHMuc2V0RXZlbnRIYW5kbGVycyxcbiAgICBvblVwZGF0ZVBsYXllcnM6IFNvY2tldEV2ZW50cy5vblVwZGF0ZVBsYXllcnMsXG4gICAgb25Tb2NrZXRDb25uZWN0ZWQ6IFNvY2tldEV2ZW50cy5vblNvY2tldENvbm5lY3RlZCxcbiAgICBvblNvY2tldERpc2Nvbm5lY3Q6IFNvY2tldEV2ZW50cy5vblNvY2tldERpc2Nvbm5lY3QsXG4gICAgb25Nb3ZlUGxheWVyOiBTb2NrZXRFdmVudHMub25Nb3ZlUGxheWVyLFxuICAgIG9uUmVtb3ZlUGxheWVyOiBTb2NrZXRFdmVudHMub25SZW1vdmVQbGF5ZXIsXG4gICAgb25CdWxsZXRGaXJlZDogU29ja2V0RXZlbnRzLm9uQnVsbGV0RmlyZWQsXG4gICAgb25CdWxsZXRSZW1vdmVkOiBTb2NrZXRFdmVudHMub25CdWxsZXRSZW1vdmVkXG59XG5cbmdhbWUuc3RhdGUuYWRkKCdHYW1lJywgUmFuZ2VyU3RldmVHYW1lLCB0cnVlKVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBGb3Jlc3RDdGYgPSByZXF1aXJlKCcuLi9tYXBzL0ZvcmVzdEN0ZicpXG5sZXQgV2VhcG9ucyA9IHJlcXVpcmUoJy4uL2xpYi9XZWFwb25zJylcblxubGV0IHdvcmxkV2lkdGggPSA0MDAwXG5sZXQgd29ybGRIZWlnaHQgPSAxNTAwXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gRGVmaW5lIG1vdmVtZW50IGNvbnN0YW50c1xuICAgIHRoaXMuTUFYX1NQRUVEID0gNDAwIC8vIHBpeGVscy9zZWNvbmRcbiAgICB0aGlzLkFDQ0VMRVJBVElPTiA9IDE5NjAgLy8gcGl4ZWxzL3NlY29uZC9zZWNvbmRcbiAgICB0aGlzLkRSQUcgPSAxNTAwIC8vIHBpeGVscy9zZWNvbmRcbiAgICB0aGlzLkdSQVZJVFkgPSAxOTAwIC8vIHBpeGVscy9zZWNvbmQvc2Vjb25kXG4gICAgdGhpcy5KVU1QX1NQRUVEID0gLTg1MCAvLyBwaXhlbHMvc2Vjb25kIChuZWdhdGl2ZSB5IGlzIHVwKVxuXG4gICAgdGhpcy5zb2NrZXQgPSBpby5jb25uZWN0KClcbiAgICB0aGlzLmVuZW1pZXMgPSBbXVxuXG5cbiAgICAvLyAgV2UncmUgZ29pbmcgdG8gYmUgdXNpbmcgcGh5c2ljcywgc28gZW5hYmxlIHRoZSBBcmNhZGUgUGh5c2ljcyBzeXN0ZW1cbiAgICB0aGlzLnBoeXNpY3Muc3RhcnRTeXN0ZW0oUGhhc2VyLlBoeXNpY3MuQVJDQURFKVxuXG4gICAgdGhpcy53b3JsZC5zZXRCb3VuZHMoMCwgMCwgd29ybGRXaWR0aCwgd29ybGRIZWlnaHQpXG4gICAgdGhpcy5nYW1lLnN0YWdlLmJhY2tncm91bmRDb2xvciA9IFwiIzJGOTFEMFwiXG5cbiAgICAvLyBTY2FsZSBnYW1lIG9uIHdpbmRvdyByZXNpemVcbiAgICB0aGlzLmdhbWUuc2NhbGUuc2NhbGVNb2RlID0gUGhhc2VyLlNjYWxlTWFuYWdlci5SRVNJWkVcbiAgICB0aGlzLmdhbWUuc2NhbGUuc2V0U2hvd0FsbCgpXG4gICAgdGhpcy5nYW1lLnNjYWxlLnJlZnJlc2goKVxuXG5cbiAgICAvKipcbiAgICAgKiBNYXBcbiAgICAgKi9cbiAgICBGb3Jlc3RDdGYuY3JlYXRlLmNhbGwodGhpcylcblxuICAgIC8qKlxuICAgICAqIFBsYXllciBTZXR0aW5nc1xuICAgICAqL1xuICAgIGxldCBzcGF3blBvaW50ID0gRm9yZXN0Q3RmLmdldFJhbmRvbVNwYXduUG9pbnQuY2FsbCh0aGlzKVxuICAgIHRoaXMucGxheWVyID0gdGhpcy5hZGQuc3ByaXRlKHNwYXduUG9pbnQueCwgc3Bhd25Qb2ludC55LCAnZHVkZScpXG5cbiAgICAvLyAgV2UgbmVlZCB0byBlbmFibGUgcGh5c2ljcyBvbiB0aGUgcGxheWVyXG4gICAgdGhpcy5waHlzaWNzLmFyY2FkZS5lbmFibGUodGhpcy5wbGF5ZXIpXG5cbiAgICAvLyBFbmFibGUgcGh5c2ljcyBvbiB0aGUgcGxheWVyXG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuZW5hYmxlKHRoaXMucGxheWVyLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpXG5cbiAgICAvLyBNYWtlIHBsYXllciBjb2xsaWRlIHdpdGggd29ybGQgYm91bmRhcmllcyBzbyBoZSBkb2Vzbid0IGxlYXZlIHRoZSBzdGFnZVxuICAgIHRoaXMucGxheWVyLmJvZHkuY29sbGlkZVdvcmxkQm91bmRzID0gdHJ1ZVxuXG4gICAgLy8gU2V0IHBsYXllciBtaW5pbXVtIGFuZCBtYXhpbXVtIG1vdmVtZW50IHNwZWVkXG4gICAgdGhpcy5wbGF5ZXIuYm9keS5tYXhWZWxvY2l0eS5zZXRUbyh0aGlzLk1BWF9TUEVFRCwgdGhpcy5NQVhfU1BFRUQgKiAxMCkgLy8geCwgeVxuXG4gICAgLy8gQWRkIGRyYWcgdG8gdGhlIHBsYXllciB0aGF0IHNsb3dzIHRoZW0gZG93biB3aGVuIHRoZXkgYXJlIG5vdCBhY2NlbGVyYXRpbmdcbiAgICB0aGlzLnBsYXllci5ib2R5LmRyYWcuc2V0VG8odGhpcy5EUkFHLCAwKSAvLyB4LCB5XG5cbiAgICAvLyBTaW5jZSB3ZSdyZSBqdW1waW5nIHdlIG5lZWQgZ3Jhdml0eVxuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5ncmF2aXR5LnkgPSB0aGlzLkdSQVZJVFlcblxuICAgIC8vIEZsYWcgdG8gdHJhY2sgaWYgdGhlIGp1bXAgYnV0dG9uIGlzIHByZXNzZWRcbiAgICB0aGlzLmp1bXBpbmcgPSBmYWxzZVxuXG4gICAgLy8gIE91ciB0d28gYW5pbWF0aW9ucywgd2Fsa2luZyBsZWZ0IGFuZCByaWdodC5cbiAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLmFkZCgnbGVmdCcsIFswLCAxLCAyLCAzXSwgMTAsIHRydWUpXG4gICAgdGhpcy5wbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ3JpZ2h0JywgWzUsIDYsIDcsIDhdLCAxMCwgdHJ1ZSlcblxuICAgIHRoaXMucGxheWVyLm1ldGEgPSB7XG4gICAgICAgIGhlYWx0aDogMTAwXG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBFbmVteSBTZXR0aW5nc1xuICAgICAqL1xuICAgIC8vIEVuZW15QnVmZmFsby5jYWxsKHRoaXMpXG5cblxuICAgIC8qKlxuICAgICAqIFdlYXBvbnNcbiAgICAgKi9cbiAgICB0aGlzLmN1cnJlbnRXZWFwb24gPSAwXG4gICAgdGhpcy53ZWFwb25zID0gW1xuICAgICAgICBuZXcgV2VhcG9ucy5BSzQ3KHtcbiAgICAgICAgICAgIGdhbWU6IHRoaXMuZ2FtZVxuICAgICAgICB9KSxcbiAgICAgICAgbmV3IFdlYXBvbnMuQmFycmV0TTgyQTEoe1xuICAgICAgICAgICAgZ2FtZTogdGhpcy5nYW1lXG4gICAgICAgIH0pXG4gICAgXVxuXG5cbiAgICAvKipcbiAgICAgKiBUZXh0XG4gICAgICovXG4gICAgbGV0IHRleHRTdHlsZXMgPSB7IGZvbnRTaXplOiAnMjRweCcsIGZpbGw6ICcjMDAwJyB9XG4gICAgdGhpcy5zY29yZVRleHQgPSB0aGlzLmFkZC50ZXh0KDI1LCAyNSwgJ1Njb3JlOiAwJywgdGV4dFN0eWxlcylcbiAgICB0aGlzLnNjb3JlVGV4dC5maXhlZFRvQ2FtZXJhID0gdHJ1ZVxuICAgIHRoaXMud2VhcG9uTmFtZSA9IHRoaXMuYWRkLnRleHQodGhpcy5jYW1lcmEud2lkdGggLSAxMDAsIHRoaXMuY2FtZXJhLmhlaWdodCAtIDQ1LCAnQUstNDcnLCB0ZXh0U3R5bGVzKVxuICAgIHRoaXMud2VhcG9uTmFtZS5maXhlZFRvQ2FtZXJhID0gdHJ1ZVxuICAgIHRoaXMuaGVhbHRoVGV4dCA9IHRoaXMuYWRkLnRleHQodGhpcy5jYW1lcmEueCArIDI1LCB0aGlzLmNhbWVyYS5oZWlnaHQgLSA0NSwgdGhpcy5wbGF5ZXIubWV0YS5oZWFsdGgsIHRleHRTdHlsZXMpXG4gICAgdGhpcy5oZWFsdGhUZXh0LmZpeGVkVG9DYW1lcmEgPSB0cnVlXG5cblxuICAgIC8qKlxuICAgICAqIENhbWVyYSBTZXR0aW5nc1xuICAgICAqL1xuICAgIHRoaXMuY2FtZXJhLmZvbGxvdyh0aGlzLnBsYXllcilcblxuICAgIGxldCBjaGFuZ2VLZXkgPSB0aGlzLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuRU5URVIpXG4gICAgY2hhbmdlS2V5Lm9uRG93bi5hZGQodGhpcy5uZXh0V2VhcG9uLCB0aGlzKVxuXG5cbiAgICAvKipcbiAgICAgKiBSZXNpemluZyBFdmVudHNcbiAgICAgKi9cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xuICAgICAgICB0aGlzLmdhbWUuc2NhbGUucmVmcmVzaCgpXG4gICAgICAgIHRoaXMuZ2FtZS5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHRcbiAgICAgICAgdGhpcy5nYW1lLndpZHRoID0gd2luZG93LmlubmVyV2lkdGhcblxuICAgICAgICB0aGlzLndlYXBvbk5hbWUuY2FtZXJhT2Zmc2V0LnggPSB0aGlzLmNhbWVyYS53aWR0aCAtIDEwMFxuICAgICAgICB0aGlzLndlYXBvbk5hbWUuY2FtZXJhT2Zmc2V0LnkgPSB0aGlzLmNhbWVyYS5oZWlnaHQgLSA0NVxuXG4gICAgICAgIHRoaXMuc2NvcmVUZXh0LmNhbWVyYU9mZnNldC54ID0gMjVcbiAgICAgICAgdGhpcy5zY29yZVRleHQuY2FtZXJhT2Zmc2V0LnkgPSAyNVxuICAgIH0pXG5cblxuICAgIC8qKlxuICAgICAqIEVuZW15IEJ1bGxldHNcbiAgICAgKi9cbiAgICB0aGlzLmVuZW15QnVsbGV0cyA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKVxuXG5cbiAgICAvKipcbiAgICAgKiBTdGFydCBsaXN0ZW5pbmcgZm9yIGV2ZW50c1xuICAgICAqL1xuICAgIHRoaXMuc2V0RXZlbnRIYW5kbGVycygpXG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgY3JlYXRlOiByZXF1aXJlKCcuL2NyZWF0ZScpLFxuICAgIGluaXQ6IHJlcXVpcmUoJy4vaW5pdCcpLFxuICAgIHByZWxvYWQ6IHJlcXVpcmUoJy4vcHJlbG9hZCcpLFxuICAgIHVwZGF0ZTogcmVxdWlyZSgnLi91cGRhdGUnKVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5nYW1lLnJlbmRlcmVyLnJlbmRlclNlc3Npb24ucm91bmRQaXhlbHMgPSB0cnVlXG4gICAgdGhpcy5nYW1lLnN0YWdlLmRpc2FibGVWaXNpYmlsaXR5Q2hhbmdlID0gdHJ1ZVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5sb2FkLmltYWdlKCd0cmVlc2NhcGUnLCAnL2ltYWdlcy9tYXAtY3RmMS5wbmcnKVxuICAgIHRoaXMubG9hZC5pbWFnZSgnZ3JvdW5kJywgJy9pbWFnZXMvcGxhdGZvcm0ucG5nJylcbiAgICB0aGlzLmxvYWQuaW1hZ2UoJ2J1bGxldDEyJywgJy9pbWFnZXMvYnVsbGV0MTIucG5nJylcblxuICAgIHRoaXMubG9hZC5zcHJpdGVzaGVldCgnZHVkZScsICcvaW1hZ2VzL2R1ZGUucG5nJywgMzIsIDQ4KVxuICAgIHRoaXMubG9hZC5zcHJpdGVzaGVldCgnZW5lbXknLCAnL2ltYWdlcy9kdWRlLnBuZycsIDMyLCA0OClcblxuICAgIHRoaXMubG9hZC5hdWRpbygnQUs0Ny1zb3VuZCcsICcvYXVkaW8vQUs0Ny5vZ2cnKVxuICAgIHRoaXMubG9hZC5hdWRpbygnQmFycmV0TTgyQTEtc291bmQnLCAnL2F1ZGlvL0JhcnJldE04MkExLm9nZycpXG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBDb2xsaWRlIHRoaXMgcGxheWVyIHdpdGggdGhlIG1hcFxuICAgIHRoaXMucGh5c2ljcy5hcmNhZGUuY29sbGlkZSh0aGlzLnBsYXllciwgdGhpcy5wbGF0Zm9ybXMsIG51bGwsIG51bGwsIHRoaXMpXG5cbiAgICAvLyBEaWQgdGhpcyBwbGF5ZXIncyBidWxsZXRzIGhpdCBhbnkgcGxhdGZvcm1zXG4gICAgdGhpcy5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMucGxhdGZvcm1zLCB0aGlzLndlYXBvbnMsIChwbGF0Zm9ybSwgd2VhcG9uKSA9PiB7XG4gICAgICAgIHdlYXBvbi5raWxsKClcbiAgICB9LCBudWxsLCB0aGlzKVxuXG4gICAgLy8gRGlkIGVuZW15IGJ1bGxldHMgaGl0IGFueSBwbGF0Zm9ybXNcbiAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5wbGF0Zm9ybXMsIHRoaXMuZW5lbXlCdWxsZXRzLCAocGxhdGZvcm0sIGJ1bGxldCkgPT4ge1xuICAgICAgICBidWxsZXQua2lsbCgpXG4gICAgfSwgbnVsbCwgdGhpcylcblxuICAgIC8vIERpZCB0aGlzIHBsYXllciBnZXQgaGl0IGJ5IGFueSBlbmVteSBidWxsZXRzXG4gICAgdGhpcy5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMucGxheWVyLCB0aGlzLmVuZW15QnVsbGV0cywgbnVsbCwgKHBsYXllciwgYnVsbGV0KSA9PiB7XG4gICAgICAgIGJ1bGxldC5raWxsKClcblxuICAgICAgICBjb25zb2xlLmxvZygnWW91IHdlcmUgaGl0IGJ5JywgYnVsbGV0LmJ1bGxldElkKVxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdidWxsZXQgcmVtb3ZlZCcsIHtcbiAgICAgICAgICAgIGJ1bGxldElkOiBidWxsZXQuYnVsbGV0SWRcbiAgICAgICAgfSlcblxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICB9LCB0aGlzKVxuXG4gICAgLy8gRGlkIHRoaXMgcGxheWVyIGhpdCBhbnkgZW5lbWllc1xuICAgIC8vIHRoaXMuZW5lbWllcy5mb3JFYWNoKChlbmVteSkgPT4ge1xuICAgIC8vICAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUoZW5lbXkucGxheWVyLCB0aGlzLndlYXBvbnMsIG51bGwsIGZ1bmN0aW9uKGVuZW15UGxheWVyLCB3ZWFwb24pIHtcbiAgICAvLyAgICAgICAgIGNvbnNvbGUubG9nKCdZb3UgaGl0IHNvbWVvbmUhJylcbiAgICAvLyAgICAgICAgIHdlYXBvbi5raWxsKClcbiAgICAvLyAgICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ2J1bGxldCByZW1vdmVkJywge1xuICAgIC8vICAgICAgICAgICAgIGJ1bGxldElkOiB3ZWFwb24uaWRcbiAgICAvLyAgICAgICAgIH0pXG4gICAgLy9cbiAgICAvLyAgICAgICAgIHJldHVybiBmYWxzZVxuICAgIC8vICAgICB9LCB0aGlzKVxuICAgIC8vIH0pXG5cbiAgICBpZiAodGhpcy5sZWZ0SW5wdXRJc0FjdGl2ZSgpKSB7XG4gICAgICAgIC8vIElmIHRoZSBMRUZUIGtleSBpcyBkb3duLCBzZXQgdGhlIHBsYXllciB2ZWxvY2l0eSB0byBtb3ZlIGxlZnRcbiAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5hY2NlbGVyYXRpb24ueCA9IC10aGlzLkFDQ0VMRVJBVElPTlxuICAgICAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLnBsYXkoJ2xlZnQnKVxuICAgIH0gZWxzZSBpZiAodGhpcy5yaWdodElucHV0SXNBY3RpdmUoKSkge1xuICAgICAgICAvLyBJZiB0aGUgUklHSFQga2V5IGlzIGRvd24sIHNldCB0aGUgcGxheWVyIHZlbG9jaXR5IHRvIG1vdmUgcmlnaHRcbiAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5hY2NlbGVyYXRpb24ueCA9IHRoaXMuQUNDRUxFUkFUSU9OXG4gICAgICAgIHRoaXMucGxheWVyLmFuaW1hdGlvbnMucGxheSgncmlnaHQnKVxuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFN0YW5kIHN0aWxsXG4gICAgICAgIHRoaXMucGxheWVyLmJvZHkuYWNjZWxlcmF0aW9uLnggPSAwXG4gICAgICAgIHRoaXMucGxheWVyLmFuaW1hdGlvbnMuc3RvcCgpXG4gICAgICAgIHRoaXMucGxheWVyLmZyYW1lID0gNFxuICAgIH1cblxuICAgIC8vIFNldCBhIHZhcmlhYmxlIHRoYXQgaXMgdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgaXMgdG91Y2hpbmcgdGhlIGdyb3VuZFxuICAgIGxldCBvblRoZUdyb3VuZCA9IHRoaXMucGxheWVyLmJvZHkudG91Y2hpbmcuZG93blxuXG4gICAgLy8gSWYgdGhlIHBsYXllciBpcyB0b3VjaGluZyB0aGUgZ3JvdW5kLCBsZXQgaGltIGhhdmUgMiBqdW1wc1xuICAgIGlmIChvblRoZUdyb3VuZCkge1xuICAgICAgICB0aGlzLmp1bXBzID0gMlxuICAgICAgICB0aGlzLmp1bXBpbmcgPSBmYWxzZVxuICAgIH1cblxuICAgIC8vIEp1bXAhXG4gICAgaWYgKHRoaXMuanVtcHMgPiAwICYmIHRoaXMudXBJbnB1dElzQWN0aXZlKDUpKSB7XG4gICAgICAgIHRoaXMucGxheWVyLmJvZHkudmVsb2NpdHkueSA9IHRoaXMuSlVNUF9TUEVFRFxuICAgICAgICB0aGlzLmp1bXBpbmcgPSB0cnVlXG4gICAgfVxuXG4gICAgLy8gUmVkdWNlIHRoZSBudW1iZXIgb2YgYXZhaWxhYmxlIGp1bXBzIGlmIHRoZSBqdW1wIGlucHV0IGlzIHJlbGVhc2VkXG4gICAgaWYgKHRoaXMuanVtcGluZyAmJiB0aGlzLnVwSW5wdXRSZWxlYXNlZCgpKSB7XG4gICAgICAgIHRoaXMuanVtcHMtLVxuICAgICAgICB0aGlzLmp1bXBpbmcgPSBmYWxzZVxuICAgIH1cblxuICAgIGlmICh0aGlzLmdhbWUuaW5wdXQuYWN0aXZlUG9pbnRlci5pc0Rvd24pXG4gICAge1xuICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS5maXJlKHRoaXMucGxheWVyLCB0aGlzLnNvY2tldClcbiAgICB9XG5cbiAgICB0aGlzLnNvY2tldC5lbWl0KCdtb3ZlIHBsYXllcicsIHtcbiAgICAgICAgeDogdGhpcy5wbGF5ZXIueCxcbiAgICAgICAgeTogdGhpcy5wbGF5ZXIueVxuICAgIH0pXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IEd1aWQgPSByZXF1aXJlKCcuL0d1aWQnKVxuXG52YXIgQnVsbGV0ID0gZnVuY3Rpb24gKGdhbWUsIGtleSkge1xuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCAwLCAwLCBrZXkpXG4gICAgdGhpcy50ZXh0dXJlLmJhc2VUZXh0dXJlLnNjYWxlTW9kZSA9IFBJWEkuc2NhbGVNb2Rlcy5ORUFSRVNUXG4gICAgdGhpcy5hbmNob3Iuc2V0KDAuNSlcbiAgICB0aGlzLmNoZWNrV29ybGRCb3VuZHMgPSB0cnVlXG4gICAgdGhpcy5vdXRPZkJvdW5kc0tpbGwgPSB0cnVlXG4gICAgdGhpcy5leGlzdHMgPSBmYWxzZVxuICAgIHRoaXMudHJhY2tpbmcgPSBmYWxzZVxuICAgIHRoaXMuc2NhbGVTcGVlZCA9IDBcbn1cblxuQnVsbGV0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpXG5CdWxsZXQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQnVsbGV0XG5cbkJ1bGxldC5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uICh4LCB5LCBhbmdsZSwgc3BlZWQsIGd4LCBneSwgc29ja2V0KSB7XG4gICAgdGhpcy5yZXNldCh4LCB5KVxuXG4gICAgbGV0IHBvaW50ZXJBbmdsZSA9IHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5tb3ZlVG9Qb2ludGVyKHRoaXMsIHNwZWVkKVxuICAgIHRoaXMuYm9keS5ncmF2aXR5LnkgPSAtMTgwMFxuXG4gICAgY29uc29sZS5sb2coJ0ZpcmluZyBidWxsZXQgbG9jYWxseScsIHRoaXMuYnVsbGV0SWQpXG5cbiAgICBzb2NrZXQuZW1pdCgnYnVsbGV0IGZpcmVkJywge1xuICAgICAgICBidWxsZXRJZDogdGhpcy5idWxsZXRJZCxcbiAgICAgICAgeCxcbiAgICAgICAgeSxcbiAgICAgICAgYW5nbGUsXG4gICAgICAgIHNwZWVkLFxuICAgICAgICBneCxcbiAgICAgICAgZ3ksXG4gICAgICAgIHBvaW50ZXJBbmdsZSxcbiAgICAgICAgaGVpZ2h0OiB0aGlzLmhlaWdodCxcbiAgICAgICAgd2lkdGg6IHRoaXMud2lkdGgsXG4gICAgICAgIGRhbWFnZTogdGhpcy5kYW1hZ2VcbiAgICB9KVxufVxuXG5CdWxsZXQucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy50cmFja2luZykge1xuICAgICAgICB0aGlzLnJvdGF0aW9uID0gTWF0aC5hdGFuMih0aGlzLmJvZHkudmVsb2NpdHkueSwgdGhpcy5ib2R5LnZlbG9jaXR5LngpXG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1bGxldFxuIiwiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ3VpZEdlbmVyYXRvcigpIHtcbiAgICB2YXIgUzQgPSBmdW5jdGlvbigpIHtcbiAgICAgICByZXR1cm4gKCgoMStNYXRoLnJhbmRvbSgpKSoweDEwMDAwKXwwKS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpXG4gICAgfVxuXG4gICAgcmV0dXJuIChTNCgpK1M0KCkrXCItXCIrUzQoKStcIi1cIitTNCgpK1wiLVwiK1M0KCkrXCItXCIrUzQoKStTNCgpK1M0KCkpXG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgLy8gVGhpcyBmdW5jdGlvbiBzaG91bGQgcmV0dXJuIHRydWUgd2hlbiB0aGUgcGxheWVyIGFjdGl2YXRlcyB0aGUgXCJnbyBsZWZ0XCIgY29udHJvbFxuICAgIC8vIEluIHRoaXMgY2FzZSwgZWl0aGVyIGhvbGRpbmcgdGhlIHJpZ2h0IGFycm93IG9yIHRhcHBpbmcgb3IgY2xpY2tpbmcgb24gdGhlIGxlZnRcbiAgICAvLyBzaWRlIG9mIHRoZSBzY3JlZW4uXG4gICAgbGVmdElucHV0SXNBY3RpdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnB1dC5rZXlib2FyZC5pc0Rvd24oUGhhc2VyLktleWJvYXJkLkEpXG4gICAgfSxcblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gc2hvdWxkIHJldHVybiB0cnVlIHdoZW4gdGhlIHBsYXllciBhY3RpdmF0ZXMgdGhlIFwiZ28gcmlnaHRcIiBjb250cm9sXG4gICAgLy8gSW4gdGhpcyBjYXNlLCBlaXRoZXIgaG9sZGluZyB0aGUgcmlnaHQgYXJyb3cgb3IgdGFwcGluZyBvciBjbGlja2luZyBvbiB0aGUgcmlnaHRcbiAgICAvLyBzaWRlIG9mIHRoZSBzY3JlZW4uXG4gICAgcmlnaHRJbnB1dElzQWN0aXZlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5wdXQua2V5Ym9hcmQuaXNEb3duKFBoYXNlci5LZXlib2FyZC5EKVxuICAgIH0sXG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIHNob3VsZCByZXR1cm4gdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgYWN0aXZhdGVzIHRoZSBcImp1bXBcIiBjb250cm9sXG4gICAgLy8gSW4gdGhpcyBjYXNlLCBlaXRoZXIgaG9sZGluZyB0aGUgdXAgYXJyb3cgb3IgdGFwcGluZyBvciBjbGlja2luZyBvbiB0aGUgY2VudGVyXG4gICAgLy8gcGFydCBvZiB0aGUgc2NyZWVuLlxuICAgIHVwSW5wdXRJc0FjdGl2ZTogZnVuY3Rpb24oZHVyYXRpb24pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5wdXQua2V5Ym9hcmQuZG93bkR1cmF0aW9uKFBoYXNlci5LZXlib2FyZC5XLCBkdXJhdGlvbilcbiAgICB9LFxuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiByZXR1cm5zIHRydWUgd2hlbiB0aGUgcGxheWVyIHJlbGVhc2VzIHRoZSBcImp1bXBcIiBjb250cm9sXG4gICAgdXBJbnB1dFJlbGVhc2VkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5wdXQua2V5Ym9hcmQudXBEdXJhdGlvbihQaGFzZXIuS2V5Ym9hcmQuVylcbiAgICB9XG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpZCkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5lbmVtaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICh0aGlzLmVuZW1pZXNbaV0ucGxheWVyLmlkID09PSBpZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZW5lbWllc1tpXVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IFJlbW90ZVBsYXllciA9IGZ1bmN0aW9uKGlkLCBnYW1lLCBwbGF5ZXIsIHN0YXJ0WCwgc3RhcnRZKSB7XG4gICAgbGV0IG5ld1JlbW90ZVBsYXllciA9IHtcbiAgICAgICAgeDogc3RhcnRYLFxuICAgICAgICB5OiBzdGFydFksXG4gICAgICAgIGlkOiBudWxsLFxuICAgICAgICBnYW1lOiBnYW1lLFxuICAgICAgICBoZWFsdGg6IDEwMCxcbiAgICAgICAgcGxheWVyOiBwbGF5ZXIsXG4gICAgICAgIGFsaXZlOiB0cnVlLFxuICAgICAgICBsYXN0UG9zaXRpb246IHtcbiAgICAgICAgICAgIHg6IHN0YXJ0WCxcbiAgICAgICAgICAgIHk6IHN0YXJ0WVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIHRoZSBwbGF5ZXIncyBlbmVteSBzcHJpdGVcbiAgICBuZXdSZW1vdGVQbGF5ZXIucGxheWVyID0gZ2FtZS5hZGQuc3ByaXRlKHN0YXJ0WCwgc3RhcnRZLCAnZW5lbXknKVxuXG4gICAgLy8gIFdlIG5lZWQgdG8gZW5hYmxlIHBoeXNpY3Mgb24gdGhlIHBsYXllclxuICAgIC8vIHRoaXMucGh5c2ljcy5hcmNhZGUuZW5hYmxlKG5ld1JlbW90ZVBsYXllci5wbGF5ZXIpXG5cbiAgICAvLyAvLyBFbmFibGUgcGh5c2ljcyBvbiB0aGUgcGxheWVyXG4gICAgLy8gdGhpcy5nYW1lLnBoeXNpY3MuZW5hYmxlKG5ld1JlbW90ZVBsYXllci5wbGF5ZXIsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSlcblxuICAgIC8vIE1ha2UgcGxheWVyIGNvbGxpZGUgd2l0aCB3b3JsZCBib3VuZGFyaWVzIHNvIGhlIGRvZXNuJ3QgbGVhdmUgdGhlIHN0YWdlXG4gICAgLy8gbmV3UmVtb3RlUGxheWVyLnBsYXllci5ib2R5LmNvbGxpZGVXb3JsZEJvdW5kcyA9IHRydWVcblxuICAgIC8vIE91ciB0d28gYW5pbWF0aW9ucywgd2Fsa2luZyBsZWZ0IGFuZCByaWdodC5cbiAgICBuZXdSZW1vdGVQbGF5ZXIucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdsZWZ0JywgWzAsIDEsIDIsIDNdLCAxMCwgdHJ1ZSlcbiAgICBuZXdSZW1vdGVQbGF5ZXIucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdyaWdodCcsIFs1LCA2LCA3LCA4XSwgMTAsIHRydWUpXG5cbiAgICBuZXdSZW1vdGVQbGF5ZXIucGxheWVyLmlkID0gaWRcblxuICAgIHJldHVybiBuZXdSZW1vdGVQbGF5ZXJcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBSZW1vdGVQbGF5ZXJcbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBzZXRFdmVudEhhbmRsZXJzOiByZXF1aXJlKCcuL3NldEV2ZW50SGFuZGxlcnMnKSxcblxuICAgIG9uU29ja2V0Q29ubmVjdGVkOiByZXF1aXJlKCcuL29uU29ja2V0Q29ubmVjdGVkJyksXG4gICAgb25Tb2NrZXREaXNjb25uZWN0OiByZXF1aXJlKCcuL29uU29ja2V0RGlzY29ubmVjdCcpLFxuXG4gICAgb25Nb3ZlUGxheWVyOiByZXF1aXJlKCcuL29uTW92ZVBsYXllcicpLFxuICAgIG9uUmVtb3ZlUGxheWVyOiByZXF1aXJlKCcuL29uUmVtb3ZlUGxheWVyJyksXG4gICAgb25VcGRhdGVQbGF5ZXJzOiByZXF1aXJlKCcuL29uVXBkYXRlUGxheWVycycpLFxuXG4gICAgb25CdWxsZXRGaXJlZDogcmVxdWlyZSgnLi9vbkJ1bGxldEZpcmVkJyksXG4gICAgb25CdWxsZXRSZW1vdmVkOiByZXF1aXJlKCcuL29uQnVsbGV0UmVtb3ZlZCcpXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IEJ1bGxldCA9IHJlcXVpcmUoJy4uL0J1bGxldCcpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIGlmIChkYXRhLmlkID09PSAoJy8jJyArIHRoaXMuc29ja2V0LmlkKSlcbiAgICAgICAgcmV0dXJuXG5cbiAgICBjb25zb2xlLmxvZygnRmlyaW5nIGJ1bGxldCByZW1vdGVseScsIGRhdGEuYnVsbGV0SWQpXG5cbiAgICBsZXQgbmV3RW5lbXlCdWxsZXQgPSB0aGlzLmVuZW15QnVsbGV0cy5jcmVhdGUoZGF0YS54LCBkYXRhLnksICdidWxsZXQxMicpXG4gICAgbmV3RW5lbXlCdWxsZXQuYnVsbGV0SWQgPSBkYXRhLmJ1bGxldElkXG4gICAgbmV3RW5lbXlCdWxsZXQucm90YXRpb24gPSBkYXRhLnBvaW50ZXJBbmdsZVxuICAgIG5ld0VuZW15QnVsbGV0LmhlaWdodCA9IGRhdGEuaGVpZ2h0XG4gICAgbmV3RW5lbXlCdWxsZXQud2lkdGggPSBkYXRhLndpZHRoXG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuZW5hYmxlKG5ld0VuZW15QnVsbGV0LCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpXG4gICAgbmV3RW5lbXlCdWxsZXQuYm9keS5ncmF2aXR5LnkgPSAtMTgwMFxuXG4gICAgbGV0IG5ld1ZlbG9jaXR5ID0gdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLnZlbG9jaXR5RnJvbVJvdGF0aW9uKGRhdGEucG9pbnRlckFuZ2xlLCBkYXRhLnNwZWVkKVxuICAgIG5ld0VuZW15QnVsbGV0LmJvZHkudmVsb2NpdHkueCArPSBuZXdWZWxvY2l0eS54XG4gICAgbmV3RW5lbXlCdWxsZXQuYm9keS52ZWxvY2l0eS55ICs9IG5ld1ZlbG9jaXR5Lnlcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBpZiAoZGF0YS5pZCA9PT0gKCcvIycgKyB0aGlzLnNvY2tldC5pZCkpXG4gICAgICAgIHJldHVyblxuXG4gICAgY29uc29sZS5sb2coJ1JlbW92aW5nIGJ1bGxldCcsIGRhdGEuYnVsbGV0SWQpXG5cbiAgICBsZXQgcmVtb3ZlQnVsbGV0ID0gXy5maW5kKHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLmNoaWxkcmVuLCB7XG4gICAgICAgIGJ1bGxldElkOiBkYXRhLmJ1bGxldElkXG4gICAgfSlcblxuICAgIGlmICghcmVtb3ZlQnVsbGV0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdCdWxsZXQgbm90IGZvdW5kOiAnLCBkYXRhLmJ1bGxldElkKVxuICAgICAgICByZXR1cm5cbiAgICB9XG5cbiAgICByZW1vdmVCdWxsZXQua2lsbCgpXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IFBsYXllckJ5SWQgPSByZXF1aXJlKCcuLi9QbGF5ZXJCeUlkJylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgbGV0IG1vdmVQbGF5ZXIgPSBQbGF5ZXJCeUlkLmNhbGwodGhpcywgZGF0YS5pZClcblxuICAgIC8vIFBsYXllciBub3QgZm91bmRcbiAgICBpZiAoISBtb3ZlUGxheWVyKSB7XG4gICAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIFVwZGF0ZSBwbGF5ZXIgcG9zaXRpb25cbiAgICBtb3ZlUGxheWVyLnBsYXllci54ID0gZGF0YS54XG4gICAgbW92ZVBsYXllci5wbGF5ZXIueSA9IGRhdGEueVxuXG4gICAgaWYgKG1vdmVQbGF5ZXIucGxheWVyLnggPiBtb3ZlUGxheWVyLmxhc3RQb3NpdGlvbi54KSB7XG4gICAgICAgIG1vdmVQbGF5ZXIucGxheWVyLmFuaW1hdGlvbnMucGxheSgncmlnaHQnKVxuICAgIH1cbiAgICBlbHNlIGlmIChtb3ZlUGxheWVyLnBsYXllci54IDwgbW92ZVBsYXllci5sYXN0UG9zaXRpb24ueClcbiAgICB7XG4gICAgICAgIG1vdmVQbGF5ZXIucGxheWVyLmFuaW1hdGlvbnMucGxheSgnbGVmdCcpXG4gICAgfVxuICAgIGVsc2VcbiAgICB7XG4gICAgICAgIG1vdmVQbGF5ZXIucGxheWVyLmFuaW1hdGlvbnMuc3RvcCgpXG4gICAgICAgIG1vdmVQbGF5ZXIucGxheWVyLmZyYW1lID0gNFxuICAgIH1cblxuICAgIG1vdmVQbGF5ZXIubGFzdFBvc2l0aW9uLnggPSBtb3ZlUGxheWVyLnBsYXllci54XG4gICAgbW92ZVBsYXllci5sYXN0UG9zaXRpb24ueSA9IG1vdmVQbGF5ZXIucGxheWVyLnlcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgUGxheWVyQnlJZCA9IHJlcXVpcmUoJy4uL1BsYXllckJ5SWQnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBsZXQgcmVtb3ZlUGxheWVyID0gUGxheWVyQnlJZC5jYWxsKHRoaXMsIGRhdGEuaWQpXG5cbiAgICAvLyBQbGF5ZXIgbm90IGZvdW5kXG4gICAgaWYgKCFyZW1vdmVQbGF5ZXIpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1BsYXllciBub3QgZm91bmQ6ICcsIGRhdGEuaWQpXG4gICAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHJlbW92ZVBsYXllci5wbGF5ZXIua2lsbCgpXG5cbiAgICAvLyBSZW1vdmUgcGxheWVyIGZyb20gYXJyYXlcbiAgICB0aGlzLmVuZW1pZXMuc3BsaWNlKHRoaXMuZW5lbWllcy5pbmRleE9mKHJlbW92ZVBsYXllciksIDEpXG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZygnQ29ubmVjdGVkIHRvIHNvY2tldCBzZXJ2ZXInKVxuXG4gICAgIC8vIFJlc2V0IGVuZW1pZXMgb24gcmVjb25uZWN0XG4gICAgdGhpcy5lbmVtaWVzLmZvckVhY2goZnVuY3Rpb24gKGVuZW15KSB7XG4gICAgICAgIGlmIChlbmVteSkgZW5lbXkua2lsbCgpXG4gICAgfSlcbiAgICBcbiAgICB0aGlzLmVuZW1pZXMgPSBbXVxuXG4gICAgLy8gU2VuZCBsb2NhbCBwbGF5ZXIgZGF0YSB0byB0aGUgZ2FtZSBzZXJ2ZXJcbiAgICB0aGlzLnNvY2tldC5lbWl0KCduZXcgcGxheWVyJywge1xuICAgICAgICB4OiB0aGlzLnBsYXllci54LFxuICAgICAgICB5OiB0aGlzLnBsYXllci55XG4gICAgfSlcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKCdEaXNjb25uZWN0ZWQgZnJvbSBzb2NrZXQgc2VydmVyJylcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgUmVtb3RlUGxheWVyID0gcmVxdWlyZSgnLi4vUmVtb3RlUGxheWVyJylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgdGhpcy5lbmVtaWVzLmZvckVhY2goZnVuY3Rpb24gKGVuZW15KSB7XG4gICAgICAgIGVuZW15LnBsYXllci5raWxsKClcbiAgICB9KVxuXG4gICAgdGhpcy5lbmVtaWVzID0gW11cblxuICAgIGRhdGEucGxheWVycy5mb3JFYWNoKChwbGF5ZXIpID0+IHtcbiAgICAgICAgaWYgKHBsYXllci5pZCA9PT0gKCcvIycgKyB0aGlzLnNvY2tldC5pZCkpXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICBsZXQgbmV3UmVtb3RlUGxheWVyID0gUmVtb3RlUGxheWVyLmNhbGwodGhpcywgcGxheWVyLmlkLCB0aGlzLmdhbWUsIHRoaXMucGxheWVyLCBwbGF5ZXIueCwgcGxheWVyLnkpXG4gICAgICAgIHRoaXMuZW5lbWllcy5wdXNoKG5ld1JlbW90ZVBsYXllcilcbiAgICAgICAgdGhpcy5lbmVtaWVzW3RoaXMuZW5lbWllcy5sZW5ndGggLSAxXS5wbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ2xlZnQnLCBbMCwgMSwgMiwgM10sIDEwLCB0cnVlKVxuICAgICAgICB0aGlzLmVuZW1pZXNbdGhpcy5lbmVtaWVzLmxlbmd0aCAtIDFdLnBsYXllci5hbmltYXRpb25zLmFkZCgncmlnaHQnLCBbNSwgNiwgNywgOF0sIDEwLCB0cnVlKVxuICAgIH0pXG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zb2NrZXQub24oJ2Nvbm5lY3QnLCB0aGlzLm9uU29ja2V0Q29ubmVjdGVkLmJpbmQodGhpcykpXG4gICAgdGhpcy5zb2NrZXQub24oJ2Rpc2Nvbm5lY3QnLCB0aGlzLm9uU29ja2V0RGlzY29ubmVjdC5iaW5kKHRoaXMpKVxuXG4gICAgdGhpcy5zb2NrZXQub24oJ3VwZGF0ZSBwbGF5ZXJzJywgdGhpcy5vblVwZGF0ZVBsYXllcnMuYmluZCh0aGlzKSlcbiAgICB0aGlzLnNvY2tldC5vbignbW92ZSBwbGF5ZXInLCB0aGlzLm9uTW92ZVBsYXllci5iaW5kKHRoaXMpKVxuICAgIHRoaXMuc29ja2V0Lm9uKCdyZW1vdmUgcGxheWVyJywgdGhpcy5vblJlbW92ZVBsYXllci5iaW5kKHRoaXMpKVxuXG4gICAgdGhpcy5zb2NrZXQub24oJ2J1bGxldCBmaXJlZCcsIHRoaXMub25CdWxsZXRGaXJlZC5iaW5kKHRoaXMpKVxuICAgIHRoaXMuc29ja2V0Lm9uKCdidWxsZXQgcmVtb3ZlZCcsIHRoaXMub25CdWxsZXRSZW1vdmVkLmJpbmQodGhpcykpXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IEJ1bGxldCA9IHJlcXVpcmUoJy4uL0J1bGxldCcpXG5sZXQgR3VpZCA9IHJlcXVpcmUoJy4uL0d1aWQnKVxuXG5sZXQgQUs0NyA9IGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCBjb25maWcuZ2FtZSwgY29uZmlnLmdhbWUud29ybGQsICdBSy00NycsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuXG4gICAgLy9cdEhlcmUgd2Ugc2V0LXVwIG91ciBhdWRpbyBzcHJpdGVcbiAgICB0aGlzLmZ4ID0gY29uZmlnLmdhbWUuYWRkLmF1ZGlvKCdBSzQ3LXNvdW5kJylcbiAgICB0aGlzLmFsbG93TXVsdGlwbGUgPSB0cnVlXG5cbiAgICB0aGlzLmRhbWFnZSA9IDIyXG4gICAgdGhpcy5uZXh0RmlyZSA9IDBcbiAgICB0aGlzLmJ1bGxldFNwZWVkID0gMTgwMFxuICAgIHRoaXMuZmlyZVJhdGUgPSAxNjA7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDY0OyBpKyspXG4gICAge1xuICAgICAgICBsZXQgYnVsbGV0ID0gbmV3IEJ1bGxldChjb25maWcuZ2FtZSwgJ2J1bGxldDEyJywgY29uZmlnLnNvY2tldClcbiAgICAgICAgYnVsbGV0LmJ1bGxldElkID0gR3VpZCgpXG4gICAgICAgIGJ1bGxldC5oZWlnaHQgPSAyXG4gICAgICAgIGJ1bGxldC53aWR0aCA9IDQwXG4gICAgICAgIGJ1bGxldC5kYW1hZ2UgPSAyMlxuICAgICAgICB0aGlzLmFkZChidWxsZXQsIHRydWUpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG59XG5cbkFLNDcucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcbkFLNDcucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQUs0NztcblxuQUs0Ny5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uKHBsYXllciwgc29ja2V0KSB7XG4gICAgaWYgKHRoaXMuZ2FtZS50aW1lLnRpbWUgPCB0aGlzLm5leHRGaXJlKVxuICAgICAgICByZXR1cm5cblxuICAgIHZhciB4ID0gcGxheWVyLnggKyAxNTtcbiAgICB2YXIgeSA9IHBsYXllci55ICsgMzA7XG5cbiAgICB0aGlzLmdldEZpcnN0RXhpc3RzKGZhbHNlKS5maXJlKHgsIHksIDAsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDAsIHNvY2tldClcbiAgICB0aGlzLnNldEFsbCgndHJhY2tpbmcnLCB0cnVlKVxuXG4gICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMuZ2FtZS50aW1lLnRpbWUgKyB0aGlzLmZpcmVSYXRlXG4gICAgdGhpcy5meC5wbGF5KClcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBSzQ3XG4iLCIndXNlIHN0cmljdCdcblxubGV0IEJ1bGxldCA9IHJlcXVpcmUoJy4uL0J1bGxldCcpXG5sZXQgR3VpZCA9IHJlcXVpcmUoJy4uL0d1aWQnKVxuXG5sZXQgQmFycmV0TTgyQTEgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgY29uZmlnLmdhbWUsIGNvbmZpZy5nYW1lLndvcmxkLCAnQmFycmV0IE04MkExJywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG5cbiAgICAvL1x0SGVyZSB3ZSBzZXQtdXAgb3VyIGF1ZGlvIHNwcml0ZVxuICAgIHRoaXMuZnggPSBjb25maWcuZ2FtZS5hZGQuYXVkaW8oJ0JhcnJldE04MkExLXNvdW5kJylcbiAgICB0aGlzLmFsbG93TXVsdGlwbGUgPSB0cnVlXG5cbiAgICB0aGlzLm5hbWUgPSAnQmFycmV0IE04MkExJ1xuICAgIHRoaXMuZGFtYWdlID0gODhcbiAgICB0aGlzLm5leHRGaXJlID0gMFxuICAgIHRoaXMuYnVsbGV0U3BlZWQgPSAzNDM1XG5cbiAgICAvLyBCYXJyZXRNODJBMSBmaXJlcyBhYm91dCA2MDAgYnVsbGV0cyBwZXIgc2Vjb25kXG4gICAgdGhpcy5maXJlUmF0ZSA9IDMwMDBcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNjQ7IGkrKylcbiAgICB7XG4gICAgICAgIGxldCBidWxsZXQgPSBuZXcgQnVsbGV0KGNvbmZpZy5nYW1lLCAnYnVsbGV0MTInLCBjb25maWcuc29ja2V0KVxuICAgICAgICBidWxsZXQuYnVsbGV0SWQgPSBHdWlkKClcbiAgICAgICAgYnVsbGV0LmhlaWdodCA9IDJcbiAgICAgICAgYnVsbGV0LndpZHRoID0gNDBcbiAgICAgICAgYnVsbGV0LmRhbWFnZSA9IDg4XG5cbiAgICAgICAgdGhpcy5hZGQoYnVsbGV0LCB0cnVlKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG59XG5cbkJhcnJldE04MkExLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLkdyb3VwLnByb3RvdHlwZSk7XG5CYXJyZXRNODJBMS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBCYXJyZXRNODJBMTtcblxuQmFycmV0TTgyQTEucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbiAocGxheWVyLCBzb2NrZXQpIHtcbiAgICBpZiAodGhpcy5nYW1lLnRpbWUudGltZSA8IHRoaXMubmV4dEZpcmUpXG4gICAgICAgIHJldHVyblxuXG4gICAgdmFyIHggPSBwbGF5ZXIueCArIDE1O1xuICAgIHZhciB5ID0gcGxheWVyLnkgKyAzMDtcblxuICAgIHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgMCwgc29ja2V0KVxuICAgIHRoaXMuc2V0QWxsKCd0cmFja2luZycsIHRydWUpXG5cbiAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5nYW1lLnRpbWUudGltZSArIHRoaXMuZmlyZVJhdGVcbiAgICB0aGlzLmZ4LnZvbHVtZSA9IC42XG4gICAgdGhpcy5meC5wbGF5KClcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCYXJyZXRNODJBMVxuIiwiJ3VzZSBzdHJpY3QnXG5cbi8qKlxuICogUHJpbWFyeSBXZWFwb25zXG4gKiAxLiBEZXNlcnQgRWFnbGVzXG4gKiAyLiBISyBNUDVcbiAqIDMuIEFLNDdcbiAqIDQuIE0xNlxuICogNS4gU3Bhcy0xMlxuICogNi4gUnVnZXIgNzdcbiAqIDcuIE03OVxuICogOC4gQmFycmV0IE04MkExXG4gKiA5LiBGTiBNaW5pbWlcbiAqIDEwLiBYTTIxNCBNaW5pZ3VuXG4gKi9cblxuLyoqXG4gKiBTZWNvbmRhcnkgV2VhcG9uc1xuICogMS4gVVNTT0NPTVxuICogMi4gQ29tYmF0IEtuaWZlXG4gKiAzLiBDaGFpbnNhd1xuICogNC4gTTcyIExhd1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIFwiQUs0N1wiOiByZXF1aXJlKCcuL0FLNDcnKSxcbiAgICBcIkJhcnJldE04MkExXCI6IHJlcXVpcmUoJy4vQmFycmV0TTgyQTEnKVxuICAgIC8vIFwiU3BhczEyXCI6IHJlcXVpcmUoJy4vU3BhczEyJyksXG4gICAgLy8gXCJSUEdcIjogcmVxdWlyZSgnLi9SUEcnKVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBGb3Jlc3RDdGYgPSB7fVxuXG5Gb3Jlc3RDdGYuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zcGF3blBvaW50cyA9IFtcbiAgICAgICAge1xuICAgICAgICAgICAgeDogNTAwLFxuICAgICAgICAgICAgeTogdGhpcy53b3JsZC5oZWlnaHQgLSA3MDBcbiAgICAgICAgfSxcbiAgICAgICAgLy8ge1xuICAgICAgICAvLyAgICAgeDogMjAwLFxuICAgICAgICAvLyAgICAgeTogdGhpcy53b3JsZC5oZWlnaHQgLSAyMDBcbiAgICAgICAgLy8gfSxcbiAgICAgICAgLy8ge1xuICAgICAgICAvLyAgICAgeDogMzc1MCxcbiAgICAgICAgLy8gICAgIHk6IHRoaXMud29ybGQuaGVpZ2h0IC0gMjAwXG4gICAgICAgIC8vIH0sXG4gICAgICAgIC8vIHtcbiAgICAgICAgLy8gICAgIHg6IDM0NTAsXG4gICAgICAgIC8vICAgICB5OiB0aGlzLndvcmxkLmhlaWdodCAtIDcwMFxuICAgICAgICAvLyB9LFxuICAgICAgICAvLyB7XG4gICAgICAgIC8vICAgICB4OiAyNjAwLFxuICAgICAgICAvLyAgICAgeTogdGhpcy53b3JsZC5oZWlnaHQgLSA4MDBcbiAgICAgICAgLy8gfSxcbiAgICAgICAgLy8ge1xuICAgICAgICAvLyAgICAgeDogMTI1MCxcbiAgICAgICAgLy8gICAgIHk6IHRoaXMud29ybGQuaGVpZ2h0IC0gODAwXG4gICAgICAgIC8vIH1cbiAgICBdXG5cbiAgICBGb3Jlc3RDdGYuY3JlYXRlU2t5U3ByaXRlLmNhbGwodGhpcylcbiAgICBGb3Jlc3RDdGYuY3JlYXRlUGxhdGZvcm1zLmNhbGwodGhpcylcbiAgICBGb3Jlc3RDdGYuY3JlYXRlTGVkZ2VzLmNhbGwodGhpcylcblxuICAgIHRoaXMucGxhdGZvcm1zLnNldEFsbCgnYm9keS5pbW1vdmFibGUnLCB0cnVlKVxuICAgIHRoaXMucGxhdGZvcm1zLnNldEFsbCgnYm9keS5hbGxvd0dyYXZpdHknLCBmYWxzZSlcbn1cblxuRm9yZXN0Q3RmLmNyZWF0ZVNreVNwcml0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuYWRkLnRpbGVTcHJpdGUoMCwgdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDE1MDAsIHRoaXMuZ2FtZS53b3JsZC53aWR0aCwgMTUwMCwgJ3RyZWVzY2FwZScpXG59XG5cbkZvcmVzdEN0Zi5jcmVhdGVQbGF0Zm9ybXMgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnBsYXRmb3JtcyA9IHRoaXMuYWRkLmdyb3VwKClcbiAgICB0aGlzLnBsYXRmb3Jtcy5lbmFibGVCb2R5ID0gdHJ1ZVxufVxuXG5Gb3Jlc3RDdGYuZ2V0UmFuZG9tU3Bhd25Qb2ludCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBfLnNhbXBsZSh0aGlzLnNwYXduUG9pbnRzKVxufVxuXG5Gb3Jlc3RDdGYuY3JlYXRlTGVkZ2VzID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IGxlZGdlcyA9IFtcbiAgICAgICAgLy8ge3gsIHksIHdpZHRoLCBoZWlnaHR9XG5cbiAgICAgICAgLy8gU3RhcnRpbmcgTGVkZ2VzXG4gICAgICAgIHsgaWQ6IDEsIHg6IDAsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSA0MzEsIHdpZHRoOiAxMjgsIGhlaWdodDogOTIgfSwgLy8gTGVmdCBib3R0b20gbGVkZ2VcbiAgICAgICAgeyBpZDogMiwgeDogMCwgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDgzOCwgd2lkdGg6IDEyOCwgaGVpZ2h0OiA5MiB9LCAvLyBMZWZ0IHRvcCBsZWRnZVxuXG4gICAgICAgIHsgaWQ6IDMsIHg6IDM4NzIsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSA0MjcsIHdpZHRoOiAxMjgsIGhlaWdodDogOTIgfSwgLy8gUmlnaHQgYm90dG9tIGxlZGdlXG4gICAgICAgIHsgaWQ6IDQsIHg6IDM4NzIsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSA4MzUsIHdpZHRoOiAxMjgsIGhlaWdodDogOTIgfSwgLy8gUmlnaHQgdG9wIGxlZGdlXG5cbiAgICAgICAgLy8gR3JvdW5kIExlZGdlc1xuICAgICAgICB7IGlkOiA1LCB4OiAwLCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gMTI4LCB3aWR0aDogNDc0LCBoZWlnaHQ6IDEyOCB9LCAvLyBNYWluIGJvdHRvbSBzdGFydGluZyBsZWZ0IGxlZGdlXG4gICAgICAgIHsgaWQ6IDYsIHg6IDQ3NCwgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDI1Niwgd2lkdGg6IDY0MSwgaGVpZ2h0OiAyNjAgfSwgLy8gTWFpbiBib3R0b20gbGVmdCBsZWRnZVxuICAgICAgICB7IGlkOiA3LCB4OiAxMTE1LCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gMzg0LCB3aWR0aDogMTc4NSwgaGVpZ2h0OiAzOTAgfSwgLy8gTWFpbiBib3R0b20gY2VudGVyIGxlZGdlXG4gICAgICAgIHsgaWQ6IDgsIHg6IDI5MDAsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSAyNTYsIHdpZHRoOiA2NDEsIGhlaWdodDogMjYwIH0sIC8vIE1haW4gYm90dG9tIHJpZ2h0IGxlZGdlXG4gICAgICAgIHsgaWQ6IDksIHg6IDM1NDAsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSAxMjgsIHdpZHRoOiA0NzQsIGhlaWdodDogMTI4IH0sIC8vIE1haW4gYm90dG9tIHN0YXJ0aW5nIHJpZ2h0IGxlZGdlXG5cbiAgICAgICAgLy8gQWlyIExlZGdlc1xuICAgICAgICB7IGlkOiAxMCwgeDogMzAwLCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gNjA4LCB3aWR0aDogNjQxLCBoZWlnaHQ6IDkyIH0sXG4gICAgICAgIHsgaWQ6IDExLCB4OiAxMTEwLCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gNzAxLCB3aWR0aDogNTEzLCBoZWlnaHQ6IDkyIH0sXG4gICAgICAgIHsgaWQ6IDEyLCB4OiA4NzAsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSA5ODIsIHdpZHRoOiAyNTYsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogMTMsIHg6IDE3NDQsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSA4NzQsIHdpZHRoOiA1MDcsIGhlaWdodDogMjU0IH0sXG4gICAgICAgIHsgaWQ6IDE0LCB4OiAyMzkwLCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gNjg5LCB3aWR0aDogNTEzLCBoZWlnaHQ6IDkyIH0sXG4gICAgICAgIHsgaWQ6IDE1LCB4OiAzMDMxLCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gNjA4LCB3aWR0aDogNjQxLCBoZWlnaHQ6IDkyIH0sXG4gICAgICAgIHsgaWQ6IDE2LCB4OiAyOTAzLCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gOTU3LCB3aWR0aDogMjU2LCBoZWlnaHQ6IDkyIH0sXG5cbiAgICAgICAgLy8gQm94ZXNcbiAgICAgICAgeyBpZDogMTcsIHg6IDcxNywgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDY4NSwgd2lkdGg6IDE1NCwgaGVpZ2h0OiA3NyB9LFxuICAgICAgICB7IGlkOiAxOCwgeDogNzU3LCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gNzYyLCB3aWR0aDogNzcsIGhlaWdodDogNzcgfSxcbiAgICAgICAgeyBpZDogMTksIHg6IDE0MTgsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSA3NzgsIHdpZHRoOiA3NywgaGVpZ2h0OiA3NyB9LFxuICAgICAgICB7IGlkOiAyMCwgeDogMTkzMSwgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDQ2MSwgd2lkdGg6IDE1NCwgaGVpZ2h0OiA3NyB9LFxuICAgICAgICB7IGlkOiAyMSwgeDogMzIwNSwgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDY4NSwgd2lkdGg6IDE1NCwgaGVpZ2h0OiA3NyB9LFxuICAgICAgICB7IGlkOiAyMiwgeDogMzI0NSwgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDc2Miwgd2lkdGg6IDc3LCBoZWlnaHQ6IDc3IH1cbiAgICBdXG5cbiAgICBsZWRnZXMuZm9yRWFjaCgobGVkZ2UpID0+IHtcbiAgICAgICAgLy8gdmFyIG5ld0xlZGdlID0gdGhpcy5wbGF0Zm9ybXMuY3JlYXRlKGxlZGdlLngsIGxlZGdlLnksICdncm91bmQnKVxuICAgICAgICB2YXIgbmV3TGVkZ2UgPSB0aGlzLnBsYXRmb3Jtcy5jcmVhdGUobGVkZ2UueCwgbGVkZ2UueSlcbiAgICAgICAgbmV3TGVkZ2UuaGVpZ2h0ID0gbGVkZ2UuaGVpZ2h0XG4gICAgICAgIG5ld0xlZGdlLndpZHRoID0gbGVkZ2Uud2lkdGhcblxuICAgICAgICAvLyBEZWJ1ZyBzdHVmZlxuICAgICAgICAvLyBuZXdMZWRnZS5hbHBoYSA9IDAuMlxuICAgICAgICAvLyBsZXQgc3R5bGUgPSB7IGZvbnQ6IFwiMjBweCBBcmlhbFwiLCBmaWxsOiBcIiNmZjAwNDRcIiwgYWxpZ246IFwiY2VudGVyXCIsIGJhY2tncm91bmRDb2xvcjogXCIjZmZmZjAwXCIgfVxuICAgICAgICAvLyBsZXQgdGV4dCA9IHRoaXMuZ2FtZS5hZGQudGV4dChsZWRnZS54LCBsZWRnZS55LCBsZWRnZS5pZCwgc3R5bGUpXG4gICAgICAgIC8vIHRleHQuYWxwaGEgPSAwLjJcbiAgICB9KVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZvcmVzdEN0ZlxuIl19
