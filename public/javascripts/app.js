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
    onBulletRemoved: SocketEvents.onBulletRemoved,
    onPlayerDamaged: SocketEvents.onPlayerDamaged,
    onPlayerRespawn: SocketEvents.onPlayerRespawn
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
  this.player.meta = {
    health: 100
  };

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

},{"../lib/Weapons":25,"../maps/ForestCtf":26}],3:[function(require,module,exports){
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

        _this.socket.emit('player damaged', {
            damage: _this.weapons[_this.currentWeapon].damage,
            damagedPlayerId: '/#' + _this.socket.id
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

    onPlayerDamaged: require('./onPlayerDamaged'),
    onPlayerRespawn: require('./onPlayerRespawn'),

    onBulletFired: require('./onBulletFired'),
    onBulletRemoved: require('./onBulletRemoved')
};

},{"./onBulletFired":13,"./onBulletRemoved":14,"./onMovePlayer":15,"./onPlayerDamaged":16,"./onPlayerRespawn":17,"./onRemovePlayer":18,"./onSocketConnected":19,"./onSocketDisconnect":20,"./onUpdatePlayers":21,"./setEventHandlers":22}],13:[function(require,module,exports){
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

module.exports = function (data) {
    if (data.damagedPlayerId !== '/#' + this.socket.id) return;

    this.player.meta.health = data.health;
    this.healthText.text = this.player.meta.health;
};

},{}],17:[function(require,module,exports){
'use strict';

var ForestCtf = require('../../maps/ForestCtf');

module.exports = function (data) {
    if (data.damagedPlayerId !== '/#' + this.socket.id) return;

    console.log('respawn!');

    this.player.meta.health = data.health;
    this.healthText.text = this.player.meta.health;

    var spawnPoint = ForestCtf.getRandomSpawnPoint.call(this);
    this.player.x = spawnPoint.x;
    this.player.y = spawnPoint.y;
};

},{"../../maps/ForestCtf":26}],18:[function(require,module,exports){
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

},{"../PlayerById":10}],19:[function(require,module,exports){
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

},{}],20:[function(require,module,exports){
'use strict';

module.exports = function () {
    console.log('Disconnected from socket server');
};

},{}],21:[function(require,module,exports){
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

},{"../RemotePlayer":11}],22:[function(require,module,exports){
'use strict';

module.exports = function () {
    this.socket.on('connect', this.onSocketConnected.bind(this));
    this.socket.on('disconnect', this.onSocketDisconnect.bind(this));

    this.socket.on('update players', this.onUpdatePlayers.bind(this));
    this.socket.on('move player', this.onMovePlayer.bind(this));
    this.socket.on('remove player', this.onRemovePlayer.bind(this));

    this.socket.on('player respawn', this.onPlayerRespawn.bind(this));
    this.socket.on('player damaged', this.onPlayerDamaged.bind(this));

    this.socket.on('bullet fired', this.onBulletFired.bind(this));
    this.socket.on('bullet removed', this.onBulletRemoved.bind(this));
};

},{}],23:[function(require,module,exports){
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

},{"../Bullet":7,"../Guid":8}],24:[function(require,module,exports){
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

},{"../Bullet":7,"../Guid":8}],25:[function(require,module,exports){
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

},{"./AK47":23,"./BarretM82A1":24}],26:[function(require,module,exports){
'use strict';

var ForestCtf = {};

ForestCtf.create = function () {
    this.spawnPoints = [{
        x: 500,
        y: this.world.height - 700
    }, {
        x: 200,
        y: this.world.height - 200
    }, {
        x: 3750,
        y: this.world.height - 200
    }, {
        x: 3450,
        y: this.world.height - 700
    }, {
        x: 2600,
        y: this.world.height - 800
    }, {
        x: 1250,
        y: this.world.height - 800
    }];

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvYXBwLmpzIiwiYXNzZXRzL2pzL2NvcmUvY3JlYXRlLmpzIiwiYXNzZXRzL2pzL2NvcmUvaW5kZXguanMiLCJhc3NldHMvanMvY29yZS9pbml0LmpzIiwiYXNzZXRzL2pzL2NvcmUvcHJlbG9hZC5qcyIsImFzc2V0cy9qcy9jb3JlL3VwZGF0ZS5qcyIsImFzc2V0cy9qcy9saWIvQnVsbGV0LmpzIiwiYXNzZXRzL2pzL2xpYi9HdWlkLmpzIiwiYXNzZXRzL2pzL2xpYi9JbnB1dEhhbmRsZXIuanMiLCJhc3NldHMvanMvbGliL1BsYXllckJ5SWQuanMiLCJhc3NldHMvanMvbGliL1JlbW90ZVBsYXllci5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL2luZGV4LmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvb25CdWxsZXRGaXJlZC5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL29uQnVsbGV0UmVtb3ZlZC5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL29uTW92ZVBsYXllci5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL29uUGxheWVyRGFtYWdlZC5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL29uUGxheWVyUmVzcGF3bi5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL29uUmVtb3ZlUGxheWVyLmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvb25Tb2NrZXRDb25uZWN0ZWQuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vblNvY2tldERpc2Nvbm5lY3QuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vblVwZGF0ZVBsYXllcnMuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9zZXRFdmVudEhhbmRsZXJzLmpzIiwiYXNzZXRzL2pzL2xpYi9XZWFwb25zL0FLNDcuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvQmFycmV0TTgyQTEuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvaW5kZXguanMiLCJhc3NldHMvanMvbWFwcy9Gb3Jlc3RDdGYuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7QUFFQSxJQUFJLGVBQWUsUUFBUSxvQkFBUixDQUFmOztBQUVKLElBQUksZUFBZSxRQUFRLG9CQUFSLENBQWY7QUFDSixJQUFJLE9BQU8sUUFBUSxRQUFSLENBQVA7O0FBRUosSUFBSSxZQUFZLE9BQU8sVUFBUDtBQUNoQixJQUFJLGFBQWEsT0FBTyxXQUFQO0FBQ2pCLElBQUksT0FBTyxJQUFJLE9BQU8sSUFBUCxDQUFZLFNBQWhCLEVBQTJCLFVBQTNCLEVBQXVDLE9BQU8sSUFBUCxFQUFhLG1CQUFwRCxDQUFQOztBQUVKLElBQUksa0JBQWtCLFNBQWxCLGVBQWtCLEdBQVc7QUFDN0IsU0FBSyxhQUFMLEdBQXFCLENBQXJCLENBRDZCO0FBRTdCLFNBQUssT0FBTCxHQUFlLEVBQWYsQ0FGNkI7QUFHN0IsU0FBSyxJQUFMLEdBQVksSUFBWixDQUg2QjtBQUk3QixTQUFLLE1BQUwsQ0FKNkI7QUFLN0IsU0FBSyxTQUFMLENBTDZCO0FBTTdCLFNBQUssTUFBTCxDQU42QjtBQU83QixTQUFLLEtBQUwsR0FBYSxDQUFiLENBUDZCO0FBUTdCLFNBQUssU0FBTCxDQVI2QjtBQVM3QixTQUFLLE1BQUwsQ0FUNkI7QUFVN0IsU0FBSyxVQUFMLEdBQWtCLElBQWxCLENBVjZCO0FBVzdCLFNBQUssT0FBTCxHQUFlLEVBQWYsQ0FYNkI7Q0FBWDs7QUFjdEIsZ0JBQWdCLFNBQWhCLEdBQTRCO0FBQ3hCLFVBQU0sS0FBSyxJQUFMO0FBQ04sYUFBUyxLQUFLLE9BQUw7QUFDVCxZQUFRLEtBQUssTUFBTDtBQUNSLFlBQVEsS0FBSyxNQUFMOztBQUVSLHVCQUFtQixhQUFhLGlCQUFiO0FBQ25CLHdCQUFvQixhQUFhLGtCQUFiO0FBQ3BCLHFCQUFpQixhQUFhLGVB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LEdBQUcsSUFBSCxFQUFTLEdBQUcsS0FBSyxJQUFMLENBQVUsS0FBVixDQUFnQixNQUFoQixHQUF5QixHQUF6QixFQUE4QixPQUFPLEVBQVAsRUFBVyxRQUFRLEVBQVIsRUFoQ3RELENBQVQsQ0FENEI7O0FBb0NoQyxXQUFPLE9BQVAsQ0FBZSxVQUFDLEtBQUQsRUFBVzs7QUFFdEIsWUFBSSxXQUFXLE1BQUssU0FBTCxDQUFlLE1BQWYsQ0FBc0IsTUFBTSxDQUFOLEVBQVMsTUFBTSxDQUFOLENBQTFDLENBRmtCO0FBR3RCLGlCQUFTLE1BQVQsR0FBa0IsTUFBTSxNQUFOLENBSEk7QUFJdEIsaUJBQVMsS0FBVCxHQUFpQixNQUFNLEtBQU47Ozs7Ozs7QUFKSyxLQUFYLENBQWYsQ0FwQ2dDO0NBQVg7O0FBa0R6QixPQUFPLE9BQVAsR0FBaUIsU0FBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBJbnB1dEhhbmRsZXIgPSByZXF1aXJlKCcuL2xpYi9JbnB1dEhhbmRsZXInKVxuLy8gbGV0IEVuZW15QnVmZmFsbyA9IHJlcXVpcmUoJy4vbGliL0VuZW15QnVmZmFsbycpXG5sZXQgU29ja2V0RXZlbnRzID0gcmVxdWlyZSgnLi9saWIvU29ja2V0RXZlbnRzJylcbmxldCBDb3JlID0gcmVxdWlyZSgnLi9jb3JlJylcblxubGV0IGdhbWVXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXG5sZXQgZ2FtZUhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodFxubGV0IGdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoZ2FtZVdpZHRoLCBnYW1lSGVpZ2h0LCBQaGFzZXIuQVVUTywgJ3Jhbmdlci1zdGV2ZS1nYW1lJylcblxubGV0IFJhbmdlclN0ZXZlR2FtZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY3VycmVudFdlYXBvbiA9IDBcbiAgICB0aGlzLmVuZW1pZXMgPSBbXVxuICAgIHRoaXMuZ2FtZSA9IGdhbWVcbiAgICB0aGlzLmdyb3VuZFxuICAgIHRoaXMucGxhdGZvcm1zXG4gICAgdGhpcy5wbGF5ZXJcbiAgICB0aGlzLnNjb3JlID0gMFxuICAgIHRoaXMuc2NvcmVUZXh0XG4gICAgdGhpcy5zb2NrZXRcbiAgICB0aGlzLndlYXBvbk5hbWUgPSBudWxsXG4gICAgdGhpcy53ZWFwb25zID0gW11cbn1cblxuUmFuZ2VyU3RldmVHYW1lLnByb3RvdHlwZSA9IHtcbiAgICBpbml0OiBDb3JlLmluaXQsXG4gICAgcHJlbG9hZDogQ29yZS5wcmVsb2FkLFxuICAgIGNyZWF0ZTogQ29yZS5jcmVhdGUsXG4gICAgdXBkYXRlOiBDb3JlLnVwZGF0ZSxcblxuICAgIGxlZnRJbnB1dElzQWN0aXZlOiBJbnB1dEhhbmRsZXIubGVmdElucHV0SXNBY3RpdmUsXG4gICAgcmlnaHRJbnB1dElzQWN0aXZlOiBJbnB1dEhhbmRsZXIucmlnaHRJbnB1dElzQWN0aXZlLFxuICAgIHVwSW5wdXRJc0FjdGl2ZTogSW5wdXRIYW5kbGVyLnVwSW5wdXRJc0FjdGl2ZSxcbiAgICB1cElucHV0UmVsZWFzZWQ6IElucHV0SGFuZGxlci51cElucHV0UmVsZWFzZWQsXG5cbiAgICBuZXh0V2VhcG9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gIFRpZHktdXAgdGhlIGN1cnJlbnQgd2VhcG9uXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRXZWFwb24gPiA5KVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS5yZXNldCgpXG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS52aXNpYmxlID0gZmFsc2VcbiAgICAgICAgICAgIHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLmNhbGxBbGwoJ3Jlc2V0JywgbnVsbCwgMCwgMClcbiAgICAgICAgICAgIHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLnNldEFsbCgnZXhpc3RzJywgZmFsc2UpXG4gICAgICAgIH1cblxuICAgICAgICAvLyAgQWN0aXZhdGUgdGhlIG5ldyBvbmVcbiAgICAgICAgdGhpcy5jdXJyZW50V2VhcG9uKytcblxuICAgICAgICBpZiAodGhpcy5jdXJyZW50V2VhcG9uID09PSB0aGlzLndlYXBvbnMubGVuZ3RoKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRXZWFwb24gPSAwXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS52aXNpYmxlID0gdHJ1ZVxuXG4gICAgICAgIHRoaXMud2VhcG9uTmFtZS50ZXh0ID0gdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0ubmFtZVxuICAgIH0sXG5cbiAgICBzZXRFdmVudEhhbmRsZXJzOiBTb2NrZXRFdmVudHMuc2V0RXZlbnRIYW5kbGVycyxcbiAgICBvblVwZGF0ZVBsYXllcnM6IFNvY2tldEV2ZW50cy5vblVwZGF0ZVBsYXllcnMsXG4gICAgb25Tb2NrZXRDb25uZWN0ZWQ6IFNvY2tldEV2ZW50cy5vblNvY2tldENvbm5lY3RlZCxcbiAgICBvblNvY2tldERpc2Nvbm5lY3Q6IFNvY2tldEV2ZW50cy5vblNvY2tldERpc2Nvbm5lY3QsXG4gICAgb25Nb3ZlUGxheWVyOiBTb2NrZXRFdmVudHMub25Nb3ZlUGxheWVyLFxuICAgIG9uUmVtb3ZlUGxheWVyOiBTb2NrZXRFdmVudHMub25SZW1vdmVQbGF5ZXIsXG4gICAgb25CdWxsZXRGaXJlZDogU29ja2V0RXZlbnRzLm9uQnVsbGV0RmlyZWQsXG4gICAgb25CdWxsZXRSZW1vdmVkOiBTb2NrZXRFdmVudHMub25CdWxsZXRSZW1vdmVkLFxuICAgIG9uUGxheWVyRGFtYWdlZDogU29ja2V0RXZlbnRzLm9uUGxheWVyRGFtYWdlZCxcbiAgICBvblBsYXllclJlc3Bhd246IFNvY2tldEV2ZW50cy5vblBsYXllclJlc3Bhd25cbn1cblxuZ2FtZS5zdGF0ZS5hZGQoJ0dhbWUnLCBSYW5nZXJTdGV2ZUdhbWUsIHRydWUpXG4iLCIndXNlIHN0cmljdCdcblxubGV0IEZvcmVzdEN0ZiA9IHJlcXVpcmUoJy4uL21hcHMvRm9yZXN0Q3RmJylcbmxldCBXZWFwb25zID0gcmVxdWlyZSgnLi4vbGliL1dlYXBvbnMnKVxuXG5sZXQgd29ybGRXaWR0aCA9IDQwMDBcbmxldCB3b3JsZEhlaWdodCA9IDE1MDBcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBEZWZpbmUgbW92ZW1lbnQgY29uc3RhbnRzXG4gICAgdGhpcy5NQVhfU1BFRUQgPSA0MDAgLy8gcGl4ZWxzL3NlY29uZFxuICAgIHRoaXMuQUNDRUxFUkFUSU9OID0gMTk2MCAvLyBwaXhlbHMvc2Vjb25kL3NlY29uZFxuICAgIHRoaXMuRFJBRyA9IDE1MDAgLy8gcGl4ZWxzL3NlY29uZFxuICAgIHRoaXMuR1JBVklUWSA9IDE5MDAgLy8gcGl4ZWxzL3NlY29uZC9zZWNvbmRcbiAgICB0aGlzLkpVTVBfU1BFRUQgPSAtODUwIC8vIHBpeGVscy9zZWNvbmQgKG5lZ2F0aXZlIHkgaXMgdXApXG5cbiAgICB0aGlzLnNvY2tldCA9IGlvLmNvbm5lY3QoKVxuICAgIHRoaXMuZW5lbWllcyA9IFtdXG5cblxuICAgIC8vICBXZSdyZSBnb2luZyB0byBiZSB1c2luZyBwaHlzaWNzLCBzbyBlbmFibGUgdGhlIEFyY2FkZSBQaHlzaWNzIHN5c3RlbVxuICAgIHRoaXMucGh5c2ljcy5zdGFydFN5c3RlbShQaGFzZXIuUGh5c2ljcy5BUkNBREUpXG5cbiAgICB0aGlzLndvcmxkLnNldEJvdW5kcygwLCAwLCB3b3JsZFdpZHRoLCB3b3JsZEhlaWdodClcbiAgICB0aGlzLmdhbWUuc3RhZ2UuYmFja2dyb3VuZENvbG9yID0gXCIjMkY5MUQwXCJcblxuICAgIC8vIFNjYWxlIGdhbWUgb24gd2luZG93IHJlc2l6ZVxuICAgIHRoaXMuZ2FtZS5zY2FsZS5zY2FsZU1vZGUgPSBQaGFzZXIuU2NhbGVNYW5hZ2VyLlJFU0laRVxuICAgIHRoaXMuZ2FtZS5zY2FsZS5zZXRTaG93QWxsKClcbiAgICB0aGlzLmdhbWUuc2NhbGUucmVmcmVzaCgpXG5cblxuICAgIC8qKlxuICAgICAqIE1hcFxuICAgICAqL1xuICAgIEZvcmVzdEN0Zi5jcmVhdGUuY2FsbCh0aGlzKVxuXG4gICAgLyoqXG4gICAgICogUGxheWVyIFNldHRpbmdzXG4gICAgICovXG4gICAgbGV0IHNwYXduUG9pbnQgPSBGb3Jlc3RDdGYuZ2V0UmFuZG9tU3Bhd25Qb2ludC5jYWxsKHRoaXMpXG4gICAgdGhpcy5wbGF5ZXIgPSB0aGlzLmFkZC5zcHJpdGUoc3Bhd25Qb2ludC54LCBzcGF3blBvaW50LnksICdkdWRlJylcblxuICAgIC8vICBXZSBuZWVkIHRvIGVuYWJsZSBwaHlzaWNzIG9uIHRoZSBwbGF5ZXJcbiAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmVuYWJsZSh0aGlzLnBsYXllcilcblxuICAgIC8vIEVuYWJsZSBwaHlzaWNzIG9uIHRoZSBwbGF5ZXJcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5lbmFibGUodGhpcy5wbGF5ZXIsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSlcblxuICAgIC8vIE1ha2UgcGxheWVyIGNvbGxpZGUgd2l0aCB3b3JsZCBib3VuZGFyaWVzIHNvIGhlIGRvZXNuJ3QgbGVhdmUgdGhlIHN0YWdlXG4gICAgdGhpcy5wbGF5ZXIuYm9keS5jb2xsaWRlV29ybGRCb3VuZHMgPSB0cnVlXG5cbiAgICAvLyBTZXQgcGxheWVyIG1pbmltdW0gYW5kIG1heGltdW0gbW92ZW1lbnQgc3BlZWRcbiAgICB0aGlzLnBsYXllci5ib2R5Lm1heFZlbG9jaXR5LnNldFRvKHRoaXMuTUFYX1NQRUVELCB0aGlzLk1BWF9TUEVFRCAqIDEwKSAvLyB4LCB5XG5cbiAgICAvLyBBZGQgZHJhZyB0byB0aGUgcGxheWVyIHRoYXQgc2xvd3MgdGhlbSBkb3duIHdoZW4gdGhleSBhcmUgbm90IGFjY2VsZXJhdGluZ1xuICAgIHRoaXMucGxheWVyLmJvZHkuZHJhZy5zZXRUbyh0aGlzLkRSQUcsIDApIC8vIHgsIHlcbiAgICB0aGlzLnBsYXllci5tZXRhID0ge1xuICAgICAgICBoZWFsdGg6IDEwMFxuICAgIH1cblxuICAgIC8vIFNpbmNlIHdlJ3JlIGp1bXBpbmcgd2UgbmVlZCBncmF2aXR5XG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmdyYXZpdHkueSA9IHRoaXMuR1JBVklUWVxuXG4gICAgLy8gRmxhZyB0byB0cmFjayBpZiB0aGUganVtcCBidXR0b24gaXMgcHJlc3NlZFxuICAgIHRoaXMuanVtcGluZyA9IGZhbHNlXG5cbiAgICAvLyAgT3VyIHR3byBhbmltYXRpb25zLCB3YWxraW5nIGxlZnQgYW5kIHJpZ2h0LlxuICAgIHRoaXMucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdsZWZ0JywgWzAsIDEsIDIsIDNdLCAxMCwgdHJ1ZSlcbiAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLmFkZCgncmlnaHQnLCBbNSwgNiwgNywgOF0sIDEwLCB0cnVlKVxuXG4gICAgdGhpcy5wbGF5ZXIubWV0YSA9IHtcbiAgICAgICAgaGVhbHRoOiAxMDBcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIFdlYXBvbnNcbiAgICAgKi9cbiAgICB0aGlzLmN1cnJlbnRXZWFwb24gPSAwXG4gICAgdGhpcy53ZWFwb25zID0gW1xuICAgICAgICBuZXcgV2VhcG9ucy5BSzQ3KHtcbiAgICAgICAgICAgIGdhbWU6IHRoaXMuZ2FtZVxuICAgICAgICB9KSxcbiAgICAgICAgbmV3IFdlYXBvbnMuQmFycmV0TTgyQTEoe1xuICAgICAgICAgICAgZ2FtZTogdGhpcy5nYW1lXG4gICAgICAgIH0pXG4gICAgXVxuXG5cbiAgICAvKipcbiAgICAgKiBUZXh0XG4gICAgICovXG4gICAgbGV0IHRleHRTdHlsZXMgPSB7IGZvbnRTaXplOiAnMjRweCcsIGZpbGw6ICcjMDAwJyB9XG4gICAgdGhpcy5zY29yZVRleHQgPSB0aGlzLmFkZC50ZXh0KDI1LCAyNSwgJ1Njb3JlOiAwJywgdGV4dFN0eWxlcylcbiAgICB0aGlzLnNjb3JlVGV4dC5maXhlZFRvQ2FtZXJhID0gdHJ1ZVxuICAgIHRoaXMud2VhcG9uTmFtZSA9IHRoaXMuYWRkLnRleHQodGhpcy5jYW1lcmEud2lkdGggLSAxMDAsIHRoaXMuY2FtZXJhLmhlaWdodCAtIDQ1LCAnQUstNDcnLCB0ZXh0U3R5bGVzKVxuICAgIHRoaXMud2VhcG9uTmFtZS5maXhlZFRvQ2FtZXJhID0gdHJ1ZVxuICAgIHRoaXMuaGVhbHRoVGV4dCA9IHRoaXMuYWRkLnRleHQodGhpcy5jYW1lcmEueCArIDI1LCB0aGlzLmNhbWVyYS5oZWlnaHQgLSA0NSwgdGhpcy5wbGF5ZXIubWV0YS5oZWFsdGgsIHRleHRTdHlsZXMpXG4gICAgdGhpcy5oZWFsdGhUZXh0LmZpeGVkVG9DYW1lcmEgPSB0cnVlXG5cblxuICAgIC8qKlxuICAgICAqIENhbWVyYSBTZXR0aW5nc1xuICAgICAqL1xuICAgIHRoaXMuY2FtZXJhLmZvbGxvdyh0aGlzLnBsYXllcilcblxuICAgIGxldCBjaGFuZ2VLZXkgPSB0aGlzLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuRU5URVIpXG4gICAgY2hhbmdlS2V5Lm9uRG93bi5hZGQodGhpcy5uZXh0V2VhcG9uLCB0aGlzKVxuXG5cbiAgICAvKipcbiAgICAgKiBSZXNpemluZyBFdmVudHNcbiAgICAgKi9cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xuICAgICAgICB0aGlzLmdhbWUuc2NhbGUucmVmcmVzaCgpXG4gICAgICAgIHRoaXMuZ2FtZS5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHRcbiAgICAgICAgdGhpcy5nYW1lLndpZHRoID0gd2luZG93LmlubmVyV2lkdGhcblxuICAgICAgICB0aGlzLndlYXBvbk5hbWUuY2FtZXJhT2Zmc2V0LnggPSB0aGlzLmNhbWVyYS53aWR0aCAtIDEwMFxuICAgICAgICB0aGlzLndlYXBvbk5hbWUuY2FtZXJhT2Zmc2V0LnkgPSB0aGlzLmNhbWVyYS5oZWlnaHQgLSA0NVxuXG4gICAgICAgIHRoaXMuc2NvcmVUZXh0LmNhbWVyYU9mZnNldC54ID0gMjVcbiAgICAgICAgdGhpcy5zY29yZVRleHQuY2FtZXJhT2Zmc2V0LnkgPSAyNVxuICAgIH0pXG5cblxuICAgIC8qKlxuICAgICAqIEVuZW15IEJ1bGxldHNcbiAgICAgKi9cbiAgICB0aGlzLmVuZW15QnVsbGV0cyA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKVxuXG5cbiAgICAvKipcbiAgICAgKiBTdGFydCBsaXN0ZW5pbmcgZm9yIGV2ZW50c1xuICAgICAqL1xuICAgIHRoaXMuc2V0RXZlbnRIYW5kbGVycygpXG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgY3JlYXRlOiByZXF1aXJlKCcuL2NyZWF0ZScpLFxuICAgIGluaXQ6IHJlcXVpcmUoJy4vaW5pdCcpLFxuICAgIHByZWxvYWQ6IHJlcXVpcmUoJy4vcHJlbG9hZCcpLFxuICAgIHVwZGF0ZTogcmVxdWlyZSgnLi91cGRhdGUnKVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5nYW1lLnJlbmRlcmVyLnJlbmRlclNlc3Npb24ucm91bmRQaXhlbHMgPSB0cnVlXG4gICAgdGhpcy5nYW1lLnN0YWdlLmRpc2FibGVWaXNpYmlsaXR5Q2hhbmdlID0gdHJ1ZVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5sb2FkLmltYWdlKCd0cmVlc2NhcGUnLCAnL2ltYWdlcy9tYXAtY3RmMS5wbmcnKVxuICAgIHRoaXMubG9hZC5pbWFnZSgnZ3JvdW5kJywgJy9pbWFnZXMvcGxhdGZvcm0ucG5nJylcbiAgICB0aGlzLmxvYWQuaW1hZ2UoJ2J1bGxldDEyJywgJy9pbWFnZXMvYnVsbGV0MTIucG5nJylcblxuICAgIHRoaXMubG9hZC5zcHJpdGVzaGVldCgnZHVkZScsICcvaW1hZ2VzL2R1ZGUucG5nJywgMzIsIDQ4KVxuICAgIHRoaXMubG9hZC5zcHJpdGVzaGVldCgnZW5lbXknLCAnL2ltYWdlcy9kdWRlLnBuZycsIDMyLCA0OClcblxuICAgIHRoaXMubG9hZC5hdWRpbygnQUs0Ny1zb3VuZCcsICcvYXVkaW8vQUs0Ny5vZ2cnKVxuICAgIHRoaXMubG9hZC5hdWRpbygnQmFycmV0TTgyQTEtc291bmQnLCAnL2F1ZGlvL0JhcnJldE04MkExLm9nZycpXG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBDb2xsaWRlIHRoaXMgcGxheWVyIHdpdGggdGhlIG1hcFxuICAgIHRoaXMucGh5c2ljcy5hcmNhZGUuY29sbGlkZSh0aGlzLnBsYXllciwgdGhpcy5wbGF0Zm9ybXMsIG51bGwsIG51bGwsIHRoaXMpXG5cbiAgICAvLyBEaWQgdGhpcyBwbGF5ZXIncyBidWxsZXRzIGhpdCBhbnkgcGxhdGZvcm1zXG4gICAgdGhpcy5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMucGxhdGZvcm1zLCB0aGlzLndlYXBvbnMsIChwbGF0Zm9ybSwgd2VhcG9uKSA9PiB7XG4gICAgICAgIHdlYXBvbi5raWxsKClcbiAgICB9LCBudWxsLCB0aGlzKVxuXG4gICAgLy8gRGlkIGVuZW15IGJ1bGxldHMgaGl0IGFueSBwbGF0Zm9ybXNcbiAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5wbGF0Zm9ybXMsIHRoaXMuZW5lbXlCdWxsZXRzLCAocGxhdGZvcm0sIGJ1bGxldCkgPT4ge1xuICAgICAgICBidWxsZXQua2lsbCgpXG4gICAgfSwgbnVsbCwgdGhpcylcblxuICAgIC8vIERpZCB0aGlzIHBsYXllciBnZXQgaGl0IGJ5IGFueSBlbmVteSBidWxsZXRzXG4gICAgdGhpcy5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMucGxheWVyLCB0aGlzLmVuZW15QnVsbGV0cywgbnVsbCwgKHBsYXllciwgYnVsbGV0KSA9PiB7XG4gICAgICAgIGJ1bGxldC5raWxsKClcblxuICAgICAgICBjb25zb2xlLmxvZygnWW91IHdlcmUgaGl0IGJ5JywgYnVsbGV0LmJ1bGxldElkKVxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdidWxsZXQgcmVtb3ZlZCcsIHtcbiAgICAgICAgICAgIGJ1bGxldElkOiBidWxsZXQuYnVsbGV0SWRcbiAgICAgICAgfSlcblxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdwbGF5ZXIgZGFtYWdlZCcsIHtcbiAgICAgICAgICAgIGRhbWFnZTogdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0uZGFtYWdlLFxuICAgICAgICAgICAgZGFtYWdlZFBsYXllcklkOiAnLyMnICsgdGhpcy5zb2NrZXQuaWRcbiAgICAgICAgfSlcblxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICB9LCB0aGlzKVxuXG4gICAgLy8gRGlkIHRoaXMgcGxheWVyIGhpdCBhbnkgZW5lbWllc1xuICAgIC8vIHRoaXMuZW5lbWllcy5mb3JFYWNoKChlbmVteSkgPT4ge1xuICAgIC8vICAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUoZW5lbXkucGxheWVyLCB0aGlzLndlYXBvbnMsIG51bGwsIGZ1bmN0aW9uKGVuZW15UGxheWVyLCB3ZWFwb24pIHtcbiAgICAvLyAgICAgICAgIGNvbnNvbGUubG9nKCdZb3UgaGl0IHNvbWVvbmUhJylcbiAgICAvLyAgICAgICAgIHdlYXBvbi5raWxsKClcbiAgICAvLyAgICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ2J1bGxldCByZW1vdmVkJywge1xuICAgIC8vICAgICAgICAgICAgIGJ1bGxldElkOiB3ZWFwb24uaWRcbiAgICAvLyAgICAgICAgIH0pXG4gICAgLy9cbiAgICAvLyAgICAgICAgIHJldHVybiBmYWxzZVxuICAgIC8vICAgICB9LCB0aGlzKVxuICAgIC8vIH0pXG5cbiAgICBpZiAodGhpcy5sZWZ0SW5wdXRJc0FjdGl2ZSgpKSB7XG4gICAgICAgIC8vIElmIHRoZSBMRUZUIGtleSBpcyBkb3duLCBzZXQgdGhlIHBsYXllciB2ZWxvY2l0eSB0byBtb3ZlIGxlZnRcbiAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5hY2NlbGVyYXRpb24ueCA9IC10aGlzLkFDQ0VMRVJBVElPTlxuICAgICAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLnBsYXkoJ2xlZnQnKVxuICAgIH0gZWxzZSBpZiAodGhpcy5yaWdodElucHV0SXNBY3RpdmUoKSkge1xuICAgICAgICAvLyBJZiB0aGUgUklHSFQga2V5IGlzIGRvd24sIHNldCB0aGUgcGxheWVyIHZlbG9jaXR5IHRvIG1vdmUgcmlnaHRcbiAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5hY2NlbGVyYXRpb24ueCA9IHRoaXMuQUNDRUxFUkFUSU9OXG4gICAgICAgIHRoaXMucGxheWVyLmFuaW1hdGlvbnMucGxheSgncmlnaHQnKVxuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFN0YW5kIHN0aWxsXG4gICAgICAgIHRoaXMucGxheWVyLmJvZHkuYWNjZWxlcmF0aW9uLnggPSAwXG4gICAgICAgIHRoaXMucGxheWVyLmFuaW1hdGlvbnMuc3RvcCgpXG4gICAgICAgIHRoaXMucGxheWVyLmZyYW1lID0gNFxuICAgIH1cblxuICAgIC8vIFNldCBhIHZhcmlhYmxlIHRoYXQgaXMgdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgaXMgdG91Y2hpbmcgdGhlIGdyb3VuZFxuICAgIGxldCBvblRoZUdyb3VuZCA9IHRoaXMucGxheWVyLmJvZHkudG91Y2hpbmcuZG93blxuXG4gICAgLy8gSWYgdGhlIHBsYXllciBpcyB0b3VjaGluZyB0aGUgZ3JvdW5kLCBsZXQgaGltIGhhdmUgMiBqdW1wc1xuICAgIGlmIChvblRoZUdyb3VuZCkge1xuICAgICAgICB0aGlzLmp1bXBzID0gMlxuICAgICAgICB0aGlzLmp1bXBpbmcgPSBmYWxzZVxuICAgIH1cblxuICAgIC8vIEp1bXAhXG4gICAgaWYgKHRoaXMuanVtcHMgPiAwICYmIHRoaXMudXBJbnB1dElzQWN0aXZlKDUpKSB7XG4gICAgICAgIHRoaXMucGxheWVyLmJvZHkudmVsb2NpdHkueSA9IHRoaXMuSlVNUF9TUEVFRFxuICAgICAgICB0aGlzLmp1bXBpbmcgPSB0cnVlXG4gICAgfVxuXG4gICAgLy8gUmVkdWNlIHRoZSBudW1iZXIgb2YgYXZhaWxhYmxlIGp1bXBzIGlmIHRoZSBqdW1wIGlucHV0IGlzIHJlbGVhc2VkXG4gICAgaWYgKHRoaXMuanVtcGluZyAmJiB0aGlzLnVwSW5wdXRSZWxlYXNlZCgpKSB7XG4gICAgICAgIHRoaXMuanVtcHMtLVxuICAgICAgICB0aGlzLmp1bXBpbmcgPSBmYWxzZVxuICAgIH1cblxuICAgIGlmICh0aGlzLmdhbWUuaW5wdXQuYWN0aXZlUG9pbnRlci5pc0Rvd24pXG4gICAge1xuICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS5maXJlKHRoaXMucGxheWVyLCB0aGlzLnNvY2tldClcbiAgICB9XG5cbiAgICB0aGlzLnNvY2tldC5lbWl0KCdtb3ZlIHBsYXllcicsIHtcbiAgICAgICAgeDogdGhpcy5wbGF5ZXIueCxcbiAgICAgICAgeTogdGhpcy5wbGF5ZXIueVxuICAgIH0pXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IEd1aWQgPSByZXF1aXJlKCcuL0d1aWQnKVxuXG52YXIgQnVsbGV0ID0gZnVuY3Rpb24gKGdhbWUsIGtleSkge1xuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCAwLCAwLCBrZXkpXG4gICAgdGhpcy50ZXh0dXJlLmJhc2VUZXh0dXJlLnNjYWxlTW9kZSA9IFBJWEkuc2NhbGVNb2Rlcy5ORUFSRVNUXG4gICAgdGhpcy5hbmNob3Iuc2V0KDAuNSlcbiAgICB0aGlzLmNoZWNrV29ybGRCb3VuZHMgPSB0cnVlXG4gICAgdGhpcy5vdXRPZkJvdW5kc0tpbGwgPSB0cnVlXG4gICAgdGhpcy5leGlzdHMgPSBmYWxzZVxuICAgIHRoaXMudHJhY2tpbmcgPSBmYWxzZVxuICAgIHRoaXMuc2NhbGVTcGVlZCA9IDBcbn1cblxuQnVsbGV0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpXG5CdWxsZXQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQnVsbGV0XG5cbkJ1bGxldC5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uICh4LCB5LCBhbmdsZSwgc3BlZWQsIGd4LCBneSwgc29ja2V0KSB7XG4gICAgdGhpcy5yZXNldCh4LCB5KVxuXG4gICAgbGV0IHBvaW50ZXJBbmdsZSA9IHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5tb3ZlVG9Qb2ludGVyKHRoaXMsIHNwZWVkKVxuICAgIHRoaXMuYm9keS5ncmF2aXR5LnkgPSAtMTgwMFxuXG4gICAgY29uc29sZS5sb2coJ0ZpcmluZyBidWxsZXQgbG9jYWxseScsIHRoaXMuYnVsbGV0SWQpXG5cbiAgICBzb2NrZXQuZW1pdCgnYnVsbGV0IGZpcmVkJywge1xuICAgICAgICBidWxsZXRJZDogdGhpcy5idWxsZXRJZCxcbiAgICAgICAgeCxcbiAgICAgICAgeSxcbiAgICAgICAgYW5nbGUsXG4gICAgICAgIHNwZWVkLFxuICAgICAgICBneCxcbiAgICAgICAgZ3ksXG4gICAgICAgIHBvaW50ZXJBbmdsZSxcbiAgICAgICAgaGVpZ2h0OiB0aGlzLmhlaWdodCxcbiAgICAgICAgd2lkdGg6IHRoaXMud2lkdGgsXG4gICAgICAgIGRhbWFnZTogdGhpcy5kYW1hZ2VcbiAgICB9KVxufVxuXG5CdWxsZXQucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy50cmFja2luZykge1xuICAgICAgICB0aGlzLnJvdGF0aW9uID0gTWF0aC5hdGFuMih0aGlzLmJvZHkudmVsb2NpdHkueSwgdGhpcy5ib2R5LnZlbG9jaXR5LngpXG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1bGxldFxuIiwiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ3VpZEdlbmVyYXRvcigpIHtcbiAgICB2YXIgUzQgPSBmdW5jdGlvbigpIHtcbiAgICAgICByZXR1cm4gKCgoMStNYXRoLnJhbmRvbSgpKSoweDEwMDAwKXwwKS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpXG4gICAgfVxuXG4gICAgcmV0dXJuIChTNCgpK1M0KCkrXCItXCIrUzQoKStcIi1cIitTNCgpK1wiLVwiK1M0KCkrXCItXCIrUzQoKStTNCgpK1M0KCkpXG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgLy8gVGhpcyBmdW5jdGlvbiBzaG91bGQgcmV0dXJuIHRydWUgd2hlbiB0aGUgcGxheWVyIGFjdGl2YXRlcyB0aGUgXCJnbyBsZWZ0XCIgY29udHJvbFxuICAgIC8vIEluIHRoaXMgY2FzZSwgZWl0aGVyIGhvbGRpbmcgdGhlIHJpZ2h0IGFycm93IG9yIHRhcHBpbmcgb3IgY2xpY2tpbmcgb24gdGhlIGxlZnRcbiAgICAvLyBzaWRlIG9mIHRoZSBzY3JlZW4uXG4gICAgbGVmdElucHV0SXNBY3RpdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnB1dC5rZXlib2FyZC5pc0Rvd24oUGhhc2VyLktleWJvYXJkLkEpXG4gICAgfSxcblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gc2hvdWxkIHJldHVybiB0cnVlIHdoZW4gdGhlIHBsYXllciBhY3RpdmF0ZXMgdGhlIFwiZ28gcmlnaHRcIiBjb250cm9sXG4gICAgLy8gSW4gdGhpcyBjYXNlLCBlaXRoZXIgaG9sZGluZyB0aGUgcmlnaHQgYXJyb3cgb3IgdGFwcGluZyBvciBjbGlja2luZyBvbiB0aGUgcmlnaHRcbiAgICAvLyBzaWRlIG9mIHRoZSBzY3JlZW4uXG4gICAgcmlnaHRJbnB1dElzQWN0aXZlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5wdXQua2V5Ym9hcmQuaXNEb3duKFBoYXNlci5LZXlib2FyZC5EKVxuICAgIH0sXG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIHNob3VsZCByZXR1cm4gdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgYWN0aXZhdGVzIHRoZSBcImp1bXBcIiBjb250cm9sXG4gICAgLy8gSW4gdGhpcyBjYXNlLCBlaXRoZXIgaG9sZGluZyB0aGUgdXAgYXJyb3cgb3IgdGFwcGluZyBvciBjbGlja2luZyBvbiB0aGUgY2VudGVyXG4gICAgLy8gcGFydCBvZiB0aGUgc2NyZWVuLlxuICAgIHVwSW5wdXRJc0FjdGl2ZTogZnVuY3Rpb24oZHVyYXRpb24pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5wdXQua2V5Ym9hcmQuZG93bkR1cmF0aW9uKFBoYXNlci5LZXlib2FyZC5XLCBkdXJhdGlvbilcbiAgICB9LFxuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiByZXR1cm5zIHRydWUgd2hlbiB0aGUgcGxheWVyIHJlbGVhc2VzIHRoZSBcImp1bXBcIiBjb250cm9sXG4gICAgdXBJbnB1dFJlbGVhc2VkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5wdXQua2V5Ym9hcmQudXBEdXJhdGlvbihQaGFzZXIuS2V5Ym9hcmQuVylcbiAgICB9XG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpZCkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5lbmVtaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICh0aGlzLmVuZW1pZXNbaV0ucGxheWVyLmlkID09PSBpZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZW5lbWllc1tpXVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IFJlbW90ZVBsYXllciA9IGZ1bmN0aW9uKGlkLCBnYW1lLCBwbGF5ZXIsIHN0YXJ0WCwgc3RhcnRZKSB7XG4gICAgbGV0IG5ld1JlbW90ZVBsYXllciA9IHtcbiAgICAgICAgeDogc3RhcnRYLFxuICAgICAgICB5OiBzdGFydFksXG4gICAgICAgIGlkOiBudWxsLFxuICAgICAgICBnYW1lOiBnYW1lLFxuICAgICAgICBoZWFsdGg6IDEwMCxcbiAgICAgICAgcGxheWVyOiBwbGF5ZXIsXG4gICAgICAgIGFsaXZlOiB0cnVlLFxuICAgICAgICBsYXN0UG9zaXRpb246IHtcbiAgICAgICAgICAgIHg6IHN0YXJ0WCxcbiAgICAgICAgICAgIHk6IHN0YXJ0WVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIHRoZSBwbGF5ZXIncyBlbmVteSBzcHJpdGVcbiAgICBuZXdSZW1vdGVQbGF5ZXIucGxheWVyID0gZ2FtZS5hZGQuc3ByaXRlKHN0YXJ0WCwgc3RhcnRZLCAnZW5lbXknKVxuXG4gICAgLy8gIFdlIG5lZWQgdG8gZW5hYmxlIHBoeXNpY3Mgb24gdGhlIHBsYXllclxuICAgIC8vIHRoaXMucGh5c2ljcy5hcmNhZGUuZW5hYmxlKG5ld1JlbW90ZVBsYXllci5wbGF5ZXIpXG5cbiAgICAvLyAvLyBFbmFibGUgcGh5c2ljcyBvbiB0aGUgcGxheWVyXG4gICAgLy8gdGhpcy5nYW1lLnBoeXNpY3MuZW5hYmxlKG5ld1JlbW90ZVBsYXllci5wbGF5ZXIsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSlcblxuICAgIC8vIE1ha2UgcGxheWVyIGNvbGxpZGUgd2l0aCB3b3JsZCBib3VuZGFyaWVzIHNvIGhlIGRvZXNuJ3QgbGVhdmUgdGhlIHN0YWdlXG4gICAgLy8gbmV3UmVtb3RlUGxheWVyLnBsYXllci5ib2R5LmNvbGxpZGVXb3JsZEJvdW5kcyA9IHRydWVcblxuICAgIC8vIE91ciB0d28gYW5pbWF0aW9ucywgd2Fsa2luZyBsZWZ0IGFuZCByaWdodC5cbiAgICBuZXdSZW1vdGVQbGF5ZXIucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdsZWZ0JywgWzAsIDEsIDIsIDNdLCAxMCwgdHJ1ZSlcbiAgICBuZXdSZW1vdGVQbGF5ZXIucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdyaWdodCcsIFs1LCA2LCA3LCA4XSwgMTAsIHRydWUpXG5cbiAgICBuZXdSZW1vdGVQbGF5ZXIucGxheWVyLmlkID0gaWRcblxuICAgIHJldHVybiBuZXdSZW1vdGVQbGF5ZXJcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBSZW1vdGVQbGF5ZXJcbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBzZXRFdmVudEhhbmRsZXJzOiByZXF1aXJlKCcuL3NldEV2ZW50SGFuZGxlcnMnKSxcblxuICAgIG9uU29ja2V0Q29ubmVjdGVkOiByZXF1aXJlKCcuL29uU29ja2V0Q29ubmVjdGVkJyksXG4gICAgb25Tb2NrZXREaXNjb25uZWN0OiByZXF1aXJlKCcuL29uU29ja2V0RGlzY29ubmVjdCcpLFxuXG4gICAgb25Nb3ZlUGxheWVyOiByZXF1aXJlKCcuL29uTW92ZVBsYXllcicpLFxuICAgIG9uUmVtb3ZlUGxheWVyOiByZXF1aXJlKCcuL29uUmVtb3ZlUGxheWVyJyksXG4gICAgb25VcGRhdGVQbGF5ZXJzOiByZXF1aXJlKCcuL29uVXBkYXRlUGxheWVycycpLFxuXG4gICAgb25QbGF5ZXJEYW1hZ2VkOiByZXF1aXJlKCcuL29uUGxheWVyRGFtYWdlZCcpLFxuICAgIG9uUGxheWVyUmVzcGF3bjogcmVxdWlyZSgnLi9vblBsYXllclJlc3Bhd24nKSxcblxuICAgIG9uQnVsbGV0RmlyZWQ6IHJlcXVpcmUoJy4vb25CdWxsZXRGaXJlZCcpLFxuICAgIG9uQnVsbGV0UmVtb3ZlZDogcmVxdWlyZSgnLi9vbkJ1bGxldFJlbW92ZWQnKVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBCdWxsZXQgPSByZXF1aXJlKCcuLi9CdWxsZXQnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBpZiAoZGF0YS5pZCA9PT0gKCcvIycgKyB0aGlzLnNvY2tldC5pZCkpXG4gICAgICAgIHJldHVyblxuXG4gICAgY29uc29sZS5sb2coJ0ZpcmluZyBidWxsZXQgcmVtb3RlbHknLCBkYXRhLmJ1bGxldElkKVxuXG4gICAgbGV0IG5ld0VuZW15QnVsbGV0ID0gdGhpcy5lbmVteUJ1bGxldHMuY3JlYXRlKGRhdGEueCwgZGF0YS55LCAnYnVsbGV0MTInKVxuICAgIG5ld0VuZW15QnVsbGV0LmJ1bGxldElkID0gZGF0YS5idWxsZXRJZFxuICAgIG5ld0VuZW15QnVsbGV0LnJvdGF0aW9uID0gZGF0YS5wb2ludGVyQW5nbGVcbiAgICBuZXdFbmVteUJ1bGxldC5oZWlnaHQgPSBkYXRhLmhlaWdodFxuICAgIG5ld0VuZW15QnVsbGV0LndpZHRoID0gZGF0YS53aWR0aFxuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmVuYWJsZShuZXdFbmVteUJ1bGxldCwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKVxuICAgIG5ld0VuZW15QnVsbGV0LmJvZHkuZ3Jhdml0eS55ID0gLTE4MDBcblxuICAgIGxldCBuZXdWZWxvY2l0eSA9IHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS52ZWxvY2l0eUZyb21Sb3RhdGlvbihkYXRhLnBvaW50ZXJBbmdsZSwgZGF0YS5zcGVlZClcbiAgICBuZXdFbmVteUJ1bGxldC5ib2R5LnZlbG9jaXR5LnggKz0gbmV3VmVsb2NpdHkueFxuICAgIG5ld0VuZW15QnVsbGV0LmJvZHkudmVsb2NpdHkueSArPSBuZXdWZWxvY2l0eS55XG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgaWYgKGRhdGEuaWQgPT09ICgnLyMnICsgdGhpcy5zb2NrZXQuaWQpKVxuICAgICAgICByZXR1cm5cblxuICAgIGNvbnNvbGUubG9nKCdSZW1vdmluZyBidWxsZXQnLCBkYXRhLmJ1bGxldElkKVxuXG4gICAgbGV0IHJlbW92ZUJ1bGxldCA9IF8uZmluZCh0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS5jaGlsZHJlbiwge1xuICAgICAgICBidWxsZXRJZDogZGF0YS5idWxsZXRJZFxuICAgIH0pXG5cbiAgICBpZiAoIXJlbW92ZUJ1bGxldCkge1xuICAgICAgICBjb25zb2xlLmxvZygnQnVsbGV0IG5vdCBmb3VuZDogJywgZGF0YS5idWxsZXRJZClcbiAgICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgcmVtb3ZlQnVsbGV0LmtpbGwoKVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBQbGF5ZXJCeUlkID0gcmVxdWlyZSgnLi4vUGxheWVyQnlJZCcpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIGxldCBtb3ZlUGxheWVyID0gUGxheWVyQnlJZC5jYWxsKHRoaXMsIGRhdGEuaWQpXG5cbiAgICAvLyBQbGF5ZXIgbm90IGZvdW5kXG4gICAgaWYgKCEgbW92ZVBsYXllcikge1xuICAgICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgcGxheWVyIHBvc2l0aW9uXG4gICAgbW92ZVBsYXllci5wbGF5ZXIueCA9IGRhdGEueFxuICAgIG1vdmVQbGF5ZXIucGxheWVyLnkgPSBkYXRhLnlcblxuICAgIGlmIChtb3ZlUGxheWVyLnBsYXllci54ID4gbW92ZVBsYXllci5sYXN0UG9zaXRpb24ueCkge1xuICAgICAgICBtb3ZlUGxheWVyLnBsYXllci5hbmltYXRpb25zLnBsYXkoJ3JpZ2h0JylcbiAgICB9XG4gICAgZWxzZSBpZiAobW92ZVBsYXllci5wbGF5ZXIueCA8IG1vdmVQbGF5ZXIubGFzdFBvc2l0aW9uLngpXG4gICAge1xuICAgICAgICBtb3ZlUGxheWVyLnBsYXllci5hbmltYXRpb25zLnBsYXkoJ2xlZnQnKVxuICAgIH1cbiAgICBlbHNlXG4gICAge1xuICAgICAgICBtb3ZlUGxheWVyLnBsYXllci5hbmltYXRpb25zLnN0b3AoKVxuICAgICAgICBtb3ZlUGxheWVyLnBsYXllci5mcmFtZSA9IDRcbiAgICB9XG5cbiAgICBtb3ZlUGxheWVyLmxhc3RQb3NpdGlvbi54ID0gbW92ZVBsYXllci5wbGF5ZXIueFxuICAgIG1vdmVQbGF5ZXIubGFzdFBvc2l0aW9uLnkgPSBtb3ZlUGxheWVyLnBsYXllci55XG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgaWYgKGRhdGEuZGFtYWdlZFBsYXllcklkICE9PSAoJy8jJyArIHRoaXMuc29ja2V0LmlkKSlcbiAgICAgICAgcmV0dXJuXG5cbiAgICB0aGlzLnBsYXllci5tZXRhLmhlYWx0aCA9IGRhdGEuaGVhbHRoXG4gICAgdGhpcy5oZWFsdGhUZXh0LnRleHQgPSB0aGlzLnBsYXllci5tZXRhLmhlYWx0aFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBGb3Jlc3RDdGYgPSByZXF1aXJlKCcuLi8uLi9tYXBzL0ZvcmVzdEN0ZicpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIGlmIChkYXRhLmRhbWFnZWRQbGF5ZXJJZCAhPT0gKCcvIycgKyB0aGlzLnNvY2tldC5pZCkpXG4gICAgICAgIHJldHVyblxuXG4gICAgY29uc29sZS5sb2coJ3Jlc3Bhd24hJylcblxuICAgIHRoaXMucGxheWVyLm1ldGEuaGVhbHRoID0gZGF0YS5oZWFsdGhcbiAgICB0aGlzLmhlYWx0aFRleHQudGV4dCA9IHRoaXMucGxheWVyLm1ldGEuaGVhbHRoXG5cbiAgICBsZXQgc3Bhd25Qb2ludCA9IEZvcmVzdEN0Zi5nZXRSYW5kb21TcGF3blBvaW50LmNhbGwodGhpcylcbiAgICB0aGlzLnBsYXllci54ID0gc3Bhd25Qb2ludC54XG4gICAgdGhpcy5wbGF5ZXIueSA9IHNwYXduUG9pbnQueVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBQbGF5ZXJCeUlkID0gcmVxdWlyZSgnLi4vUGxheWVyQnlJZCcpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIGxldCByZW1vdmVQbGF5ZXIgPSBQbGF5ZXJCeUlkLmNhbGwodGhpcywgZGF0YS5pZClcblxuICAgIC8vIFBsYXllciBub3QgZm91bmRcbiAgICBpZiAoIXJlbW92ZVBsYXllcikge1xuICAgICAgICBjb25zb2xlLmxvZygnUGxheWVyIG5vdCBmb3VuZDogJywgZGF0YS5pZClcbiAgICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgcmVtb3ZlUGxheWVyLnBsYXllci5raWxsKClcblxuICAgIC8vIFJlbW92ZSBwbGF5ZXIgZnJvbSBhcnJheVxuICAgIHRoaXMuZW5lbWllcy5zcGxpY2UodGhpcy5lbmVtaWVzLmluZGV4T2YocmVtb3ZlUGxheWVyKSwgMSlcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKCdDb25uZWN0ZWQgdG8gc29ja2V0IHNlcnZlcicpXG5cbiAgICAgLy8gUmVzZXQgZW5lbWllcyBvbiByZWNvbm5lY3RcbiAgICB0aGlzLmVuZW1pZXMuZm9yRWFjaChmdW5jdGlvbiAoZW5lbXkpIHtcbiAgICAgICAgaWYgKGVuZW15KSBlbmVteS5raWxsKClcbiAgICB9KVxuICAgIFxuICAgIHRoaXMuZW5lbWllcyA9IFtdXG5cbiAgICAvLyBTZW5kIGxvY2FsIHBsYXllciBkYXRhIHRvIHRoZSBnYW1lIHNlcnZlclxuICAgIHRoaXMuc29ja2V0LmVtaXQoJ25ldyBwbGF5ZXInLCB7XG4gICAgICAgIHg6IHRoaXMucGxheWVyLngsXG4gICAgICAgIHk6IHRoaXMucGxheWVyLnlcbiAgICB9KVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coJ0Rpc2Nvbm5lY3RlZCBmcm9tIHNvY2tldCBzZXJ2ZXInKVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBSZW1vdGVQbGF5ZXIgPSByZXF1aXJlKCcuLi9SZW1vdGVQbGF5ZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICB0aGlzLmVuZW1pZXMuZm9yRWFjaChmdW5jdGlvbiAoZW5lbXkpIHtcbiAgICAgICAgZW5lbXkucGxheWVyLmtpbGwoKVxuICAgIH0pXG5cbiAgICB0aGlzLmVuZW1pZXMgPSBbXVxuXG4gICAgZGF0YS5wbGF5ZXJzLmZvckVhY2goKHBsYXllcikgPT4ge1xuICAgICAgICBpZiAocGxheWVyLmlkID09PSAoJy8jJyArIHRoaXMuc29ja2V0LmlkKSlcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIGxldCBuZXdSZW1vdGVQbGF5ZXIgPSBSZW1vdGVQbGF5ZXIuY2FsbCh0aGlzLCBwbGF5ZXIuaWQsIHRoaXMuZ2FtZSwgdGhpcy5wbGF5ZXIsIHBsYXllci54LCBwbGF5ZXIueSlcbiAgICAgICAgdGhpcy5lbmVtaWVzLnB1c2gobmV3UmVtb3RlUGxheWVyKVxuICAgICAgICB0aGlzLmVuZW1pZXNbdGhpcy5lbmVtaWVzLmxlbmd0aCAtIDFdLnBsYXllci5hbmltYXRpb25zLmFkZCgnbGVmdCcsIFswLCAxLCAyLCAzXSwgMTAsIHRydWUpXG4gICAgICAgIHRoaXMuZW5lbWllc1t0aGlzLmVuZW1pZXMubGVuZ3RoIC0gMV0ucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdyaWdodCcsIFs1LCA2LCA3LCA4XSwgMTAsIHRydWUpXG4gICAgfSlcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnNvY2tldC5vbignY29ubmVjdCcsIHRoaXMub25Tb2NrZXRDb25uZWN0ZWQuYmluZCh0aGlzKSlcbiAgICB0aGlzLnNvY2tldC5vbignZGlzY29ubmVjdCcsIHRoaXMub25Tb2NrZXREaXNjb25uZWN0LmJpbmQodGhpcykpXG5cbiAgICB0aGlzLnNvY2tldC5vbigndXBkYXRlIHBsYXllcnMnLCB0aGlzLm9uVXBkYXRlUGxheWVycy5iaW5kKHRoaXMpKVxuICAgIHRoaXMuc29ja2V0Lm9uKCdtb3ZlIHBsYXllcicsIHRoaXMub25Nb3ZlUGxheWVyLmJpbmQodGhpcykpXG4gICAgdGhpcy5zb2NrZXQub24oJ3JlbW92ZSBwbGF5ZXInLCB0aGlzLm9uUmVtb3ZlUGxheWVyLmJpbmQodGhpcykpXG5cbiAgICB0aGlzLnNvY2tldC5vbigncGxheWVyIHJlc3Bhd24nLCB0aGlzLm9uUGxheWVyUmVzcGF3bi5iaW5kKHRoaXMpKVxuICAgIHRoaXMuc29ja2V0Lm9uKCdwbGF5ZXIgZGFtYWdlZCcsIHRoaXMub25QbGF5ZXJEYW1hZ2VkLmJpbmQodGhpcykpXG5cbiAgICB0aGlzLnNvY2tldC5vbignYnVsbGV0IGZpcmVkJywgdGhpcy5vbkJ1bGxldEZpcmVkLmJpbmQodGhpcykpXG4gICAgdGhpcy5zb2NrZXQub24oJ2J1bGxldCByZW1vdmVkJywgdGhpcy5vbkJ1bGxldFJlbW92ZWQuYmluZCh0aGlzKSlcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgQnVsbGV0ID0gcmVxdWlyZSgnLi4vQnVsbGV0JylcbmxldCBHdWlkID0gcmVxdWlyZSgnLi4vR3VpZCcpXG5cbmxldCBBSzQ3ID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGNvbmZpZy5nYW1lLCBjb25maWcuZ2FtZS53b3JsZCwgJ0FLLTQ3JywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG5cbiAgICAvL1x0SGVyZSB3ZSBzZXQtdXAgb3VyIGF1ZGlvIHNwcml0ZVxuICAgIHRoaXMuZnggPSBjb25maWcuZ2FtZS5hZGQuYXVkaW8oJ0FLNDctc291bmQnKVxuICAgIHRoaXMuYWxsb3dNdWx0aXBsZSA9IHRydWVcblxuICAgIHRoaXMuZGFtYWdlID0gMjJcbiAgICB0aGlzLm5leHRGaXJlID0gMFxuICAgIHRoaXMuYnVsbGV0U3BlZWQgPSAxODAwXG4gICAgdGhpcy5maXJlUmF0ZSA9IDE2MDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNjQ7IGkrKylcbiAgICB7XG4gICAgICAgIGxldCBidWxsZXQgPSBuZXcgQnVsbGV0KGNvbmZpZy5nYW1lLCAnYnVsbGV0MTInLCBjb25maWcuc29ja2V0KVxuICAgICAgICBidWxsZXQuYnVsbGV0SWQgPSBHdWlkKClcbiAgICAgICAgYnVsbGV0LmhlaWdodCA9IDJcbiAgICAgICAgYnVsbGV0LndpZHRoID0gNDBcbiAgICAgICAgYnVsbGV0LmRhbWFnZSA9IDIyXG4gICAgICAgIHRoaXMuYWRkKGJ1bGxldCwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbn1cblxuQUs0Ny5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuQUs0Ny5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBBSzQ3O1xuXG5BSzQ3LnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24ocGxheWVyLCBzb2NrZXQpIHtcbiAgICBpZiAodGhpcy5nYW1lLnRpbWUudGltZSA8IHRoaXMubmV4dEZpcmUpXG4gICAgICAgIHJldHVyblxuXG4gICAgdmFyIHggPSBwbGF5ZXIueCArIDE1O1xuICAgIHZhciB5ID0gcGxheWVyLnkgKyAzMDtcblxuICAgIHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgMCwgc29ja2V0KVxuICAgIHRoaXMuc2V0QWxsKCd0cmFja2luZycsIHRydWUpXG5cbiAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5nYW1lLnRpbWUudGltZSArIHRoaXMuZmlyZVJhdGVcbiAgICB0aGlzLmZ4LnBsYXkoKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFLNDdcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgQnVsbGV0ID0gcmVxdWlyZSgnLi4vQnVsbGV0JylcbmxldCBHdWlkID0gcmVxdWlyZSgnLi4vR3VpZCcpXG5cbmxldCBCYXJyZXRNODJBMSA9IGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCBjb25maWcuZ2FtZSwgY29uZmlnLmdhbWUud29ybGQsICdCYXJyZXQgTTgyQTEnLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcblxuICAgIC8vXHRIZXJlIHdlIHNldC11cCBvdXIgYXVkaW8gc3ByaXRlXG4gICAgdGhpcy5meCA9IGNvbmZpZy5nYW1lLmFkZC5hdWRpbygnQmFycmV0TTgyQTEtc291bmQnKVxuICAgIHRoaXMuYWxsb3dNdWx0aXBsZSA9IHRydWVcblxuICAgIHRoaXMubmFtZSA9ICdCYXJyZXQgTTgyQTEnXG4gICAgdGhpcy5kYW1hZ2UgPSA4OFxuICAgIHRoaXMubmV4dEZpcmUgPSAwXG4gICAgdGhpcy5idWxsZXRTcGVlZCA9IDM0MzVcblxuICAgIC8vIEJhcnJldE04MkExIGZpcmVzIGFib3V0IDYwMCBidWxsZXRzIHBlciBzZWNvbmRcbiAgICB0aGlzLmZpcmVSYXRlID0gMzAwMFxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA2NDsgaSsrKVxuICAgIHtcbiAgICAgICAgbGV0IGJ1bGxldCA9IG5ldyBCdWxsZXQoY29uZmlnLmdhbWUsICdidWxsZXQxMicsIGNvbmZpZy5zb2NrZXQpXG4gICAgICAgIGJ1bGxldC5idWxsZXRJZCA9IEd1aWQoKVxuICAgICAgICBidWxsZXQuaGVpZ2h0ID0gMlxuICAgICAgICBidWxsZXQud2lkdGggPSA0MFxuICAgICAgICBidWxsZXQuZGFtYWdlID0gODhcblxuICAgICAgICB0aGlzLmFkZChidWxsZXQsIHRydWUpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbn1cblxuQmFycmV0TTgyQTEucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcbkJhcnJldE04MkExLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEJhcnJldE04MkExO1xuXG5CYXJyZXRNODJBMS5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uIChwbGF5ZXIsIHNvY2tldCkge1xuICAgIGlmICh0aGlzLmdhbWUudGltZS50aW1lIDwgdGhpcy5uZXh0RmlyZSlcbiAgICAgICAgcmV0dXJuXG5cbiAgICB2YXIgeCA9IHBsYXllci54ICsgMTU7XG4gICAgdmFyIHkgPSBwbGF5ZXIueSArIDMwO1xuXG4gICAgdGhpcy5nZXRGaXJzdEV4aXN0cyhmYWxzZSkuZmlyZSh4LCB5LCAwLCB0aGlzLmJ1bGxldFNwZWVkLCAwLCAwLCBzb2NrZXQpXG4gICAgdGhpcy5zZXRBbGwoJ3RyYWNraW5nJywgdHJ1ZSlcblxuICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLmdhbWUudGltZS50aW1lICsgdGhpcy5maXJlUmF0ZVxuICAgIHRoaXMuZngudm9sdW1lID0gLjZcbiAgICB0aGlzLmZ4LnBsYXkoKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhcnJldE04MkExXG4iLCIndXNlIHN0cmljdCdcblxuLyoqXG4gKiBQcmltYXJ5IFdlYXBvbnNcbiAqIDEuIERlc2VydCBFYWdsZXNcbiAqIDIuIEhLIE1QNVxuICogMy4gQUs0N1xuICogNC4gTTE2XG4gKiA1LiBTcGFzLTEyXG4gKiA2LiBSdWdlciA3N1xuICogNy4gTTc5XG4gKiA4LiBCYXJyZXQgTTgyQTFcbiAqIDkuIEZOIE1pbmltaVxuICogMTAuIFhNMjE0IE1pbmlndW5cbiAqL1xuXG4vKipcbiAqIFNlY29uZGFyeSBXZWFwb25zXG4gKiAxLiBVU1NPQ09NXG4gKiAyLiBDb21iYXQgS25pZmVcbiAqIDMuIENoYWluc2F3XG4gKiA0LiBNNzIgTGF3XG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgXCJBSzQ3XCI6IHJlcXVpcmUoJy4vQUs0NycpLFxuICAgIFwiQmFycmV0TTgyQTFcIjogcmVxdWlyZSgnLi9CYXJyZXRNODJBMScpXG4gICAgLy8gXCJTcGFzMTJcIjogcmVxdWlyZSgnLi9TcGFzMTInKSxcbiAgICAvLyBcIlJQR1wiOiByZXF1aXJlKCcuL1JQRycpXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IEZvcmVzdEN0ZiA9IHt9XG5cbkZvcmVzdEN0Zi5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNwYXduUG9pbnRzID0gW1xuICAgICAgICB7XG4gICAgICAgICAgICB4OiA1MDAsXG4gICAgICAgICAgICB5OiB0aGlzLndvcmxkLmhlaWdodCAtIDcwMFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICB4OiAyMDAsXG4gICAgICAgICAgICB5OiB0aGlzLndvcmxkLmhlaWdodCAtIDIwMFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICB4OiAzNzUwLFxuICAgICAgICAgICAgeTogdGhpcy53b3JsZC5oZWlnaHQgLSAyMDBcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgeDogMzQ1MCxcbiAgICAgICAgICAgIHk6IHRoaXMud29ybGQuaGVpZ2h0IC0gNzAwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIHg6IDI2MDAsXG4gICAgICAgICAgICB5OiB0aGlzLndvcmxkLmhlaWdodCAtIDgwMFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICB4OiAxMjUwLFxuICAgICAgICAgICAgeTogdGhpcy53b3JsZC5oZWlnaHQgLSA4MDBcbiAgICAgICAgfVxuICAgIF1cblxuICAgIEZvcmVzdEN0Zi5jcmVhdGVTa3lTcHJpdGUuY2FsbCh0aGlzKVxuICAgIEZvcmVzdEN0Zi5jcmVhdGVQbGF0Zm9ybXMuY2FsbCh0aGlzKVxuICAgIEZvcmVzdEN0Zi5jcmVhdGVMZWRnZXMuY2FsbCh0aGlzKVxuXG4gICAgdGhpcy5wbGF0Zm9ybXMuc2V0QWxsKCdib2R5LmltbW92YWJsZScsIHRydWUpXG4gICAgdGhpcy5wbGF0Zm9ybXMuc2V0QWxsKCdib2R5LmFsbG93R3Jhdml0eScsIGZhbHNlKVxufVxuXG5Gb3Jlc3RDdGYuY3JlYXRlU2t5U3ByaXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5hZGQudGlsZVNwcml0ZSgwLCB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gMTUwMCwgdGhpcy5nYW1lLndvcmxkLndpZHRoLCAxNTAwLCAndHJlZXNjYXBlJylcbn1cblxuRm9yZXN0Q3RmLmNyZWF0ZVBsYXRmb3JtcyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucGxhdGZvcm1zID0gdGhpcy5hZGQuZ3JvdXAoKVxuICAgIHRoaXMucGxhdGZvcm1zLmVuYWJsZUJvZHkgPSB0cnVlXG59XG5cbkZvcmVzdEN0Zi5nZXRSYW5kb21TcGF3blBvaW50ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIF8uc2FtcGxlKHRoaXMuc3Bhd25Qb2ludHMpXG59XG5cbkZvcmVzdEN0Zi5jcmVhdGVMZWRnZXMgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgbGVkZ2VzID0gW1xuICAgICAgICAvLyB7eCwgeSwgd2lkdGgsIGhlaWdodH1cblxuICAgICAgICAvLyBTdGFydGluZyBMZWRnZXNcbiAgICAgICAgeyBpZDogMSwgeDogMCwgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDQzMSwgd2lkdGg6IDEyOCwgaGVpZ2h0OiA5MiB9LCAvLyBMZWZ0IGJvdHRvbSBsZWRnZVxuICAgICAgICB7IGlkOiAyLCB4OiAwLCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gODM4LCB3aWR0aDogMTI4LCBoZWlnaHQ6IDkyIH0sIC8vIExlZnQgdG9wIGxlZGdlXG5cbiAgICAgICAgeyBpZDogMywgeDogMzg3MiwgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDQyNywgd2lkdGg6IDEyOCwgaGVpZ2h0OiA5MiB9LCAvLyBSaWdodCBib3R0b20gbGVkZ2VcbiAgICAgICAgeyBpZDogNCwgeDogMzg3MiwgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDgzNSwgd2lkdGg6IDEyOCwgaGVpZ2h0OiA5MiB9LCAvLyBSaWdodCB0b3AgbGVkZ2VcblxuICAgICAgICAvLyBHcm91bmQgTGVkZ2VzXG4gICAgICAgIHsgaWQ6IDUsIHg6IDAsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSAxMjgsIHdpZHRoOiA0NzQsIGhlaWdodDogMTI4IH0sIC8vIE1haW4gYm90dG9tIHN0YXJ0aW5nIGxlZnQgbGVkZ2VcbiAgICAgICAgeyBpZDogNiwgeDogNDc0LCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gMjU2LCB3aWR0aDogNjQxLCBoZWlnaHQ6IDI2MCB9LCAvLyBNYWluIGJvdHRvbSBsZWZ0IGxlZGdlXG4gICAgICAgIHsgaWQ6IDcsIHg6IDExMTUsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSAzODQsIHdpZHRoOiAxNzg1LCBoZWlnaHQ6IDM5MCB9LCAvLyBNYWluIGJvdHRvbSBjZW50ZXIgbGVkZ2VcbiAgICAgICAgeyBpZDogOCwgeDogMjkwMCwgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDI1Niwgd2lkdGg6IDY0MSwgaGVpZ2h0OiAyNjAgfSwgLy8gTWFpbiBib3R0b20gcmlnaHQgbGVkZ2VcbiAgICAgICAgeyBpZDogOSwgeDogMzU0MCwgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDEyOCwgd2lkdGg6IDQ3NCwgaGVpZ2h0OiAxMjggfSwgLy8gTWFpbiBib3R0b20gc3RhcnRpbmcgcmlnaHQgbGVkZ2VcblxuICAgICAgICAvLyBBaXIgTGVkZ2VzXG4gICAgICAgIHsgaWQ6IDEwLCB4OiAzMDAsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSA2MDgsIHdpZHRoOiA2NDEsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogMTEsIHg6IDExMTAsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSA3MDEsIHdpZHRoOiA1MTMsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogMTIsIHg6IDg3MCwgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDk4Miwgd2lkdGg6IDI1NiwgaGVpZ2h0OiA5MiB9LFxuICAgICAgICB7IGlkOiAxMywgeDogMTc0NCwgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDg3NCwgd2lkdGg6IDUwNywgaGVpZ2h0OiAyNTQgfSxcbiAgICAgICAgeyBpZDogMTQsIHg6IDIzOTAsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSA2ODksIHdpZHRoOiA1MTMsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogMTUsIHg6IDMwMzEsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSA2MDgsIHdpZHRoOiA2NDEsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogMTYsIHg6IDI5MDMsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSA5NTcsIHdpZHRoOiAyNTYsIGhlaWdodDogOTIgfSxcblxuICAgICAgICAvLyBCb3hlc1xuICAgICAgICB7IGlkOiAxNywgeDogNzE3LCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gNjg1LCB3aWR0aDogMTU0LCBoZWlnaHQ6IDc3IH0sXG4gICAgICAgIHsgaWQ6IDE4LCB4OiA3NTcsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSA3NjIsIHdpZHRoOiA3NywgaGVpZ2h0OiA3NyB9LFxuICAgICAgICB7IGlkOiAxOSwgeDogMTQxOCwgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDc3OCwgd2lkdGg6IDc3LCBoZWlnaHQ6IDc3IH0sXG4gICAgICAgIHsgaWQ6IDIwLCB4OiAxOTMxLCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gNDYxLCB3aWR0aDogMTU0LCBoZWlnaHQ6IDc3IH0sXG4gICAgICAgIHsgaWQ6IDIxLCB4OiAzMjA1LCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gNjg1LCB3aWR0aDogMTU0LCBoZWlnaHQ6IDc3IH0sXG4gICAgICAgIHsgaWQ6IDIyLCB4OiAzMjQ1LCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gNzYyLCB3aWR0aDogNzcsIGhlaWdodDogNzcgfVxuICAgIF1cblxuICAgIGxlZGdlcy5mb3JFYWNoKChsZWRnZSkgPT4ge1xuICAgICAgICAvLyB2YXIgbmV3TGVkZ2UgPSB0aGlzLnBsYXRmb3Jtcy5jcmVhdGUobGVkZ2UueCwgbGVkZ2UueSwgJ2dyb3VuZCcpXG4gICAgICAgIHZhciBuZXdMZWRnZSA9IHRoaXMucGxhdGZvcm1zLmNyZWF0ZShsZWRnZS54LCBsZWRnZS55KVxuICAgICAgICBuZXdMZWRnZS5oZWlnaHQgPSBsZWRnZS5oZWlnaHRcbiAgICAgICAgbmV3TGVkZ2Uud2lkdGggPSBsZWRnZS53aWR0aFxuXG4gICAgICAgIC8vIERlYnVnIHN0dWZmXG4gICAgICAgIC8vIG5ld0xlZGdlLmFscGhhID0gMC4yXG4gICAgICAgIC8vIGxldCBzdHlsZSA9IHsgZm9udDogXCIyMHB4IEFyaWFsXCIsIGZpbGw6IFwiI2ZmMDA0NFwiLCBhbGlnbjogXCJjZW50ZXJcIiwgYmFja2dyb3VuZENvbG9yOiBcIiNmZmZmMDBcIiB9XG4gICAgICAgIC8vIGxldCB0ZXh0ID0gdGhpcy5nYW1lLmFkZC50ZXh0KGxlZGdlLngsIGxlZGdlLnksIGxlZGdlLmlkLCBzdHlsZSlcbiAgICAgICAgLy8gdGV4dC5hbHBoYSA9IDAuMlxuICAgIH0pXG59XG5cbm1vZHVsZS5leHBvcnRzID0gRm9yZXN0Q3RmXG4iXX0=
