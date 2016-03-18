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
    onBulletFired: SocketEvents.onBulletFired
    // onBulletsUpdate: SocketEvents.onBulletsUpdate,
    // onBulletMoved: SocketEvents.onBulletMoved,
    // onBulletRemoved: SocketEvents.onBulletRemoved
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

},{"../lib/Weapons":22,"../maps/ForestCtf":23}],3:[function(require,module,exports){
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
    this.game.load.tilemap('level1', '/javascripts/HighruleTemple.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.image('1', '/images/Tiles/1.png');
    this.game.load.image('2', '/images/Tiles/2.png');
    this.game.load.image('3', '/images/Tiles/3.png');
    this.game.load.image('4', '/images/Tiles/4.png');
    this.game.load.image('5', '/images/Tiles/5.png');
    this.game.load.image('6', '/images/Tiles/6.png');
    this.game.load.image('7', '/images/Tiles/7.png');
    this.game.load.image('8', '/images/Tiles/8.png');
    this.game.load.image('9', '/images/Tiles/9.png');
    this.game.load.image('10', '/images/Tiles/10.png');
    this.game.load.image('11', '/images/Tiles/11.png');
    this.game.load.image('12', '/images/Tiles/12.png');
    this.game.load.image('13', '/images/Tiles/13.png');
    this.game.load.image('14', '/images/Tiles/14.png');
    this.game.load.image('15', '/images/Tiles/15.png');
    this.game.load.image('16', '/images/Tiles/16.png');
    this.game.load.image('17', '/images/Tiles/17.png');
    this.game.load.image('18', '/images/Tiles/18.png');
    this.game.load.image('BG', '/images/BG/BG.png');

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
        _this.socket.emit('bullet removed', {
            bulletId: weapon.id
        });
    }, null, this);

    this.enemies.forEach(function (enemy) {
        _this.physics.arcade.collide(enemy.player, _this.platforms, null, null, _this);
        _this.physics.arcade.collide(enemy.player, _this.weapons, function (enemyPlayer, weapon) {
            weapon.kill();
            this.socket.emit('bullet removed', {
                bulletId: weapon.id
            });

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

    socket.emit('bullet fired', {
        bulletId: Guid(),
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

    onBulletFired: require('./onBulletFired')
    // onBulletsUpdate: require('./onBulletsUpdate'),
    // onBulletMoved: require('./onBulletMoved'),
    // onBulletRemoved: require('./onBulletRemoved')
};

},{"./onBulletFired":13,"./onMovePlayer":14,"./onRemovePlayer":15,"./onSocketConnected":16,"./onSocketDisconnect":17,"./onUpdatePlayers":18,"./setEventHandlers":19}],13:[function(require,module,exports){
'use strict';

var Bullet = require('../Bullet');

module.exports = function (data) {
    if (data.id === '/#' + this.socket.id) return;

    var newEnemyBullet = this.enemyBullets.create(data.x, data.y, 'bullet12');
    newEnemyBullet.rotation = data.pointerAngle;
    newEnemyBullet.height = data.height;
    newEnemyBullet.width = data.width;

    console.log('Bullet fired by', data.id);
};

},{"../Bullet":7}],14:[function(require,module,exports){
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

},{"../PlayerById":10}],15:[function(require,module,exports){
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

},{"../PlayerById":10}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
'use strict';

module.exports = function () {
    console.log('Disconnected from socket server');
};

},{}],18:[function(require,module,exports){
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

},{"../RemotePlayer":11}],19:[function(require,module,exports){
'use strict';

module.exports = function () {
    this.socket.on('connect', this.onSocketConnected.bind(this));
    this.socket.on('disconnect', this.onSocketDisconnect.bind(this));

    this.socket.on('update players', this.onUpdatePlayers.bind(this));
    this.socket.on('move player', this.onMovePlayer.bind(this));
    this.socket.on('remove player', this.onRemovePlayer.bind(this));

    this.socket.on('bullet fired', this.onBulletFired.bind(this));
    // this.socket.on('bullets update', this.onBulletsUpdate.bind(this))
    // this.socket.on('bullet moved', this.onBulletMoved.bind(this))
    // this.socket.on('bullet removed', this.onBulletRemoved.bind(this))
};

},{}],20:[function(require,module,exports){
'use strict';

var Bullet = require('../Bullet');

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

},{"../Bullet":7}],21:[function(require,module,exports){
'use strict';

var Bullet = require('../Bullet');

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

},{"../Bullet":7}],22:[function(require,module,exports){
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

},{"./AK47":20,"./BarretM82A1":21}],23:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvYXBwLmpzIiwiYXNzZXRzL2pzL2NvcmUvY3JlYXRlLmpzIiwiYXNzZXRzL2pzL2NvcmUvaW5kZXguanMiLCJhc3NldHMvanMvY29yZS9pbml0LmpzIiwiYXNzZXRzL2pzL2NvcmUvcHJlbG9hZC5qcyIsImFzc2V0cy9qcy9jb3JlL3VwZGF0ZS5qcyIsImFzc2V0cy9qcy9saWIvQnVsbGV0LmpzIiwiYXNzZXRzL2pzL2xpYi9HdWlkLmpzIiwiYXNzZXRzL2pzL2xpYi9JbnB1dEhhbmRsZXIuanMiLCJhc3NldHMvanMvbGliL1BsYXllckJ5SWQuanMiLCJhc3NldHMvanMvbGliL1JlbW90ZVBsYXllci5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL2luZGV4LmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvb25CdWxsZXRGaXJlZC5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL29uTW92ZVBsYXllci5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL29uUmVtb3ZlUGxheWVyLmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvb25Tb2NrZXRDb25uZWN0ZWQuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vblNvY2tldERpc2Nvbm5lY3QuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vblVwZGF0ZVBsYXllcnMuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9zZXRFdmVudEhhbmRsZXJzLmpzIiwiYXNzZXRzL2pzL2xpYi9XZWFwb25zL0FLNDcuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvQmFycmV0TTgyQTEuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvaW5kZXguanMiLCJhc3NldHMvanMvbWFwcy9Gb3Jlc3RDdGYuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNB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QUFvQ2hDLFdBQU8sT0FBUCxDQUFlLFVBQUMsS0FBRCxFQUFXOztBQUV0QixZQUFJLFdBQVcsTUFBSyxTQUFMLENBQWUsTUFBZixDQUFzQixNQUFNLENBQU4sRUFBUyxNQUFNLENBQU4sQ0FBMUMsQ0FGa0I7QUFHdEIsaUJBQVMsTUFBVCxHQUFrQixNQUFNLE1BQU4sQ0FISTtBQUl0QixpQkFBUyxLQUFULEdBQWlCLE1BQU0sS0FBTjs7Ozs7OztBQUpLLEtBQVgsQ0FBZixDQXBDZ0M7Q0FBWDs7QUFrRHpCLE9BQU8sT0FBUCxHQUFpQixTQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCdcblxubGV0IElucHV0SGFuZGxlciA9IHJlcXVpcmUoJy4vbGliL0lucHV0SGFuZGxlcicpXG4vLyBsZXQgRW5lbXlCdWZmYWxvID0gcmVxdWlyZSgnLi9saWIvRW5lbXlCdWZmYWxvJylcbmxldCBTb2NrZXRFdmVudHMgPSByZXF1aXJlKCcuL2xpYi9Tb2NrZXRFdmVudHMnKVxubGV0IENvcmUgPSByZXF1aXJlKCcuL2NvcmUnKVxuXG5sZXQgZ2FtZVdpZHRoID0gd2luZG93LmlubmVyV2lkdGhcbmxldCBnYW1lSGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0XG5sZXQgZ2FtZSA9IG5ldyBQaGFzZXIuR2FtZShnYW1lV2lkdGgsIGdhbWVIZWlnaHQsIFBoYXNlci5BVVRPLCAncmFuZ2VyLXN0ZXZlLWdhbWUnKVxuXG5sZXQgUmFuZ2VyU3RldmVHYW1lID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5jdXJyZW50V2VhcG9uID0gMFxuICAgIHRoaXMuZW5lbWllcyA9IFtdXG4gICAgdGhpcy5nYW1lID0gZ2FtZVxuICAgIHRoaXMuZ3JvdW5kXG4gICAgdGhpcy5wbGF0Zm9ybXNcbiAgICB0aGlzLnBsYXllclxuICAgIHRoaXMuc2NvcmUgPSAwXG4gICAgdGhpcy5zY29yZVRleHRcbiAgICB0aGlzLnNvY2tldFxuICAgIHRoaXMud2VhcG9uTmFtZSA9IG51bGxcbiAgICB0aGlzLndlYXBvbnMgPSBbXVxufVxuXG5SYW5nZXJTdGV2ZUdhbWUucHJvdG90eXBlID0ge1xuICAgIGluaXQ6IENvcmUuaW5pdCxcbiAgICBwcmVsb2FkOiBDb3JlLnByZWxvYWQsXG4gICAgY3JlYXRlOiBDb3JlLmNyZWF0ZSxcbiAgICB1cGRhdGU6IENvcmUudXBkYXRlLFxuXG4gICAgbGVmdElucHV0SXNBY3RpdmU6IElucHV0SGFuZGxlci5sZWZ0SW5wdXRJc0FjdGl2ZSxcbiAgICByaWdodElucHV0SXNBY3RpdmU6IElucHV0SGFuZGxlci5yaWdodElucHV0SXNBY3RpdmUsXG4gICAgdXBJbnB1dElzQWN0aXZlOiBJbnB1dEhhbmRsZXIudXBJbnB1dElzQWN0aXZlLFxuICAgIHVwSW5wdXRSZWxlYXNlZDogSW5wdXRIYW5kbGVyLnVwSW5wdXRSZWxlYXNlZCxcblxuICAgIG5leHRXZWFwb246IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyAgVGlkeS11cCB0aGUgY3VycmVudCB3ZWFwb25cbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFdlYXBvbiA+IDkpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLnJlc2V0KClcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLnZpc2libGUgPSBmYWxzZVxuICAgICAgICAgICAgdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0uY2FsbEFsbCgncmVzZXQnLCBudWxsLCAwLCAwKVxuICAgICAgICAgICAgdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0uc2V0QWxsKCdleGlzdHMnLCBmYWxzZSlcbiAgICAgICAgfVxuXG4gICAgICAgIC8vICBBY3RpdmF0ZSB0aGUgbmV3IG9uZVxuICAgICAgICB0aGlzLmN1cnJlbnRXZWFwb24rK1xuXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRXZWFwb24gPT09IHRoaXMud2VhcG9ucy5sZW5ndGgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFdlYXBvbiA9IDBcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLnZpc2libGUgPSB0cnVlXG5cbiAgICAgICAgdGhpcy53ZWFwb25OYW1lLnRleHQgPSB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS5uYW1lXG4gICAgfSxcblxuICAgIHNldEV2ZW50SGFuZGxlcnM6IFNvY2tldEV2ZW50cy5zZXRFdmVudEhhbmRsZXJzLFxuICAgIG9uVXBkYXRlUGxheWVyczogU29ja2V0RXZlbnRzLm9uVXBkYXRlUGxheWVycyxcbiAgICBvblNvY2tldENvbm5lY3RlZDogU29ja2V0RXZlbnRzLm9uU29ja2V0Q29ubmVjdGVkLFxuICAgIG9uU29ja2V0RGlzY29ubmVjdDogU29ja2V0RXZlbnRzLm9uU29ja2V0RGlzY29ubmVjdCxcbiAgICBvbk1vdmVQbGF5ZXI6IFNvY2tldEV2ZW50cy5vbk1vdmVQbGF5ZXIsXG4gICAgb25SZW1vdmVQbGF5ZXI6IFNvY2tldEV2ZW50cy5vblJlbW92ZVBsYXllcixcbiAgICBvbkJ1bGxldEZpcmVkOiBTb2NrZXRFdmVudHMub25CdWxsZXRGaXJlZFxuICAgIC8vIG9uQnVsbGV0c1VwZGF0ZTogU29ja2V0RXZlbnRzLm9uQnVsbGV0c1VwZGF0ZSxcbiAgICAvLyBvbkJ1bGxldE1vdmVkOiBTb2NrZXRFdmVudHMub25CdWxsZXRNb3ZlZCxcbiAgICAvLyBvbkJ1bGxldFJlbW92ZWQ6IFNvY2tldEV2ZW50cy5vbkJ1bGxldFJlbW92ZWRcbn1cblxuZ2FtZS5zdGF0ZS5hZGQoJ0dhbWUnLCBSYW5nZXJTdGV2ZUdhbWUsIHRydWUpXG4iLCIndXNlIHN0cmljdCdcblxubGV0IEZvcmVzdEN0ZiA9IHJlcXVpcmUoJy4uL21hcHMvRm9yZXN0Q3RmJylcbmxldCBXZWFwb25zID0gcmVxdWlyZSgnLi4vbGliL1dlYXBvbnMnKVxuXG5sZXQgd29ybGRXaWR0aCA9IDQwMDBcbmxldCB3b3JsZEhlaWdodCA9IDE1MDBcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBEZWZpbmUgbW92ZW1lbnQgY29uc3RhbnRzXG4gICAgdGhpcy5NQVhfU1BFRUQgPSA0MDAgLy8gcGl4ZWxzL3NlY29uZFxuICAgIHRoaXMuQUNDRUxFUkFUSU9OID0gMTk2MCAvLyBwaXhlbHMvc2Vjb25kL3NlY29uZFxuICAgIHRoaXMuRFJBRyA9IDE1MDAgLy8gcGl4ZWxzL3NlY29uZFxuICAgIHRoaXMuR1JBVklUWSA9IDE5MDAgLy8gcGl4ZWxzL3NlY29uZC9zZWNvbmRcbiAgICB0aGlzLkpVTVBfU1BFRUQgPSAtODUwIC8vIHBpeGVscy9zZWNvbmQgKG5lZ2F0aXZlIHkgaXMgdXApXG5cbiAgICB0aGlzLnNvY2tldCA9IGlvLmNvbm5lY3QoKVxuICAgIHRoaXMuZW5lbWllcyA9IFtdXG5cblxuICAgIC8vICBXZSdyZSBnb2luZyB0byBiZSB1c2luZyBwaHlzaWNzLCBzbyBlbmFibGUgdGhlIEFyY2FkZSBQaHlzaWNzIHN5c3RlbVxuICAgIHRoaXMucGh5c2ljcy5zdGFydFN5c3RlbShQaGFzZXIuUGh5c2ljcy5BUkNBREUpXG5cbiAgICB0aGlzLndvcmxkLnNldEJvdW5kcygwLCAwLCB3b3JsZFdpZHRoLCB3b3JsZEhlaWdodClcbiAgICB0aGlzLmdhbWUuc3RhZ2UuYmFja2dyb3VuZENvbG9yID0gXCIjMkY5MUQwXCJcblxuICAgIC8vIFNjYWxlIGdhbWUgb24gd2luZG93IHJlc2l6ZVxuICAgIHRoaXMuZ2FtZS5zY2FsZS5zY2FsZU1vZGUgPSBQaGFzZXIuU2NhbGVNYW5hZ2VyLlJFU0laRVxuICAgIHRoaXMuZ2FtZS5zY2FsZS5zZXRTaG93QWxsKClcbiAgICB0aGlzLmdhbWUuc2NhbGUucmVmcmVzaCgpXG5cblxuICAgIC8qKlxuICAgICAqIE1hcFxuICAgICAqL1xuICAgIEZvcmVzdEN0Zi5jcmVhdGUuY2FsbCh0aGlzKVxuXG4gICAgLyoqXG4gICAgICogUGxheWVyIFNldHRpbmdzXG4gICAgICovXG4gICAgbGV0IHNwYXduUG9pbnQgPSBGb3Jlc3RDdGYuZ2V0UmFuZG9tU3Bhd25Qb2ludC5jYWxsKHRoaXMpXG4gICAgdGhpcy5wbGF5ZXIgPSB0aGlzLmFkZC5zcHJpdGUoc3Bhd25Qb2ludC54LCBzcGF3blBvaW50LnksICdkdWRlJylcblxuICAgIC8vICBXZSBuZWVkIHRvIGVuYWJsZSBwaHlzaWNzIG9uIHRoZSBwbGF5ZXJcbiAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmVuYWJsZSh0aGlzLnBsYXllcilcblxuICAgIC8vIEVuYWJsZSBwaHlzaWNzIG9uIHRoZSBwbGF5ZXJcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5lbmFibGUodGhpcy5wbGF5ZXIsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSlcblxuICAgIC8vIE1ha2UgcGxheWVyIGNvbGxpZGUgd2l0aCB3b3JsZCBib3VuZGFyaWVzIHNvIGhlIGRvZXNuJ3QgbGVhdmUgdGhlIHN0YWdlXG4gICAgdGhpcy5wbGF5ZXIuYm9keS5jb2xsaWRlV29ybGRCb3VuZHMgPSB0cnVlXG5cbiAgICAvLyBTZXQgcGxheWVyIG1pbmltdW0gYW5kIG1heGltdW0gbW92ZW1lbnQgc3BlZWRcbiAgICB0aGlzLnBsYXllci5ib2R5Lm1heFZlbG9jaXR5LnNldFRvKHRoaXMuTUFYX1NQRUVELCB0aGlzLk1BWF9TUEVFRCAqIDEwKSAvLyB4LCB5XG5cbiAgICAvLyBBZGQgZHJhZyB0byB0aGUgcGxheWVyIHRoYXQgc2xvd3MgdGhlbSBkb3duIHdoZW4gdGhleSBhcmUgbm90IGFjY2VsZXJhdGluZ1xuICAgIHRoaXMucGxheWVyLmJvZHkuZHJhZy5zZXRUbyh0aGlzLkRSQUcsIDApIC8vIHgsIHlcblxuICAgIC8vIFNpbmNlIHdlJ3JlIGp1bXBpbmcgd2UgbmVlZCBncmF2aXR5XG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmdyYXZpdHkueSA9IHRoaXMuR1JBVklUWVxuXG4gICAgLy8gRmxhZyB0byB0cmFjayBpZiB0aGUganVtcCBidXR0b24gaXMgcHJlc3NlZFxuICAgIHRoaXMuanVtcGluZyA9IGZhbHNlXG5cbiAgICAvLyAgT3VyIHR3byBhbmltYXRpb25zLCB3YWxraW5nIGxlZnQgYW5kIHJpZ2h0LlxuICAgIHRoaXMucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdsZWZ0JywgWzAsIDEsIDIsIDNdLCAxMCwgdHJ1ZSlcbiAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLmFkZCgncmlnaHQnLCBbNSwgNiwgNywgOF0sIDEwLCB0cnVlKVxuXG4gICAgdGhpcy5wbGF5ZXIubWV0YSA9IHtcbiAgICAgICAgaGVhbHRoOiAxMDBcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEVuZW15IFNldHRpbmdzXG4gICAgICovXG4gICAgLy8gRW5lbXlCdWZmYWxvLmNhbGwodGhpcylcblxuXG4gICAgLyoqXG4gICAgICogV2VhcG9uc1xuICAgICAqL1xuICAgIHRoaXMuY3VycmVudFdlYXBvbiA9IDBcbiAgICB0aGlzLndlYXBvbnMgPSBbXG4gICAgICAgIG5ldyBXZWFwb25zLkFLNDcoe1xuICAgICAgICAgICAgZ2FtZTogdGhpcy5nYW1lXG4gICAgICAgIH0pLFxuICAgICAgICBuZXcgV2VhcG9ucy5CYXJyZXRNODJBMSh7XG4gICAgICAgICAgICBnYW1lOiB0aGlzLmdhbWVcbiAgICAgICAgfSlcbiAgICBdXG5cblxuICAgIC8qKlxuICAgICAqIFRleHRcbiAgICAgKi9cbiAgICBsZXQgdGV4dFN0eWxlcyA9IHsgZm9udFNpemU6ICcyNHB4JywgZmlsbDogJyMwMDAnIH1cbiAgICB0aGlzLnNjb3JlVGV4dCA9IHRoaXMuYWRkLnRleHQoMjUsIDI1LCAnU2NvcmU6IDAnLCB0ZXh0U3R5bGVzKVxuICAgIHRoaXMuc2NvcmVUZXh0LmZpeGVkVG9DYW1lcmEgPSB0cnVlXG4gICAgdGhpcy53ZWFwb25OYW1lID0gdGhpcy5hZGQudGV4dCh0aGlzLmNhbWVyYS53aWR0aCAtIDEwMCwgdGhpcy5jYW1lcmEuaGVpZ2h0IC0gNDUsICdBSy00NycsIHRleHRTdHlsZXMpXG4gICAgdGhpcy53ZWFwb25OYW1lLmZpeGVkVG9DYW1lcmEgPSB0cnVlXG4gICAgdGhpcy5oZWFsdGhUZXh0ID0gdGhpcy5hZGQudGV4dCh0aGlzLmNhbWVyYS54ICsgMjUsIHRoaXMuY2FtZXJhLmhlaWdodCAtIDQ1LCB0aGlzLnBsYXllci5tZXRhLmhlYWx0aCwgdGV4dFN0eWxlcylcbiAgICB0aGlzLmhlYWx0aFRleHQuZml4ZWRUb0NhbWVyYSA9IHRydWVcblxuXG4gICAgLyoqXG4gICAgICogQ2FtZXJhIFNldHRpbmdzXG4gICAgICovXG4gICAgdGhpcy5jYW1lcmEuZm9sbG93KHRoaXMucGxheWVyKVxuXG4gICAgbGV0IGNoYW5nZUtleSA9IHRoaXMuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5FTlRFUilcbiAgICBjaGFuZ2VLZXkub25Eb3duLmFkZCh0aGlzLm5leHRXZWFwb24sIHRoaXMpXG5cblxuICAgIC8qKlxuICAgICAqIFJlc2l6aW5nIEV2ZW50c1xuICAgICAqL1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuZ2FtZS5zY2FsZS5yZWZyZXNoKClcbiAgICAgICAgdGhpcy5nYW1lLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodFxuICAgICAgICB0aGlzLmdhbWUud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aFxuXG4gICAgICAgIHRoaXMud2VhcG9uTmFtZS5jYW1lcmFPZmZzZXQueCA9IHRoaXMuY2FtZXJhLndpZHRoIC0gMTAwXG4gICAgICAgIHRoaXMud2VhcG9uTmFtZS5jYW1lcmFPZmZzZXQueSA9IHRoaXMuY2FtZXJhLmhlaWdodCAtIDQ1XG5cbiAgICAgICAgdGhpcy5zY29yZVRleHQuY2FtZXJhT2Zmc2V0LnggPSAyNVxuICAgICAgICB0aGlzLnNjb3JlVGV4dC5jYW1lcmFPZmZzZXQueSA9IDI1XG4gICAgfSlcblxuXG4gICAgLyoqXG4gICAgICogRW5lbXkgQnVsbGV0c1xuICAgICAqL1xuICAgIHRoaXMuZW5lbXlCdWxsZXRzID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpXG5cblxuICAgIC8qKlxuICAgICAqIFN0YXJ0IGxpc3RlbmluZyBmb3IgZXZlbnRzXG4gICAgICovXG4gICAgdGhpcy5zZXRFdmVudEhhbmRsZXJzKClcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBjcmVhdGU6IHJlcXVpcmUoJy4vY3JlYXRlJyksXG4gICAgaW5pdDogcmVxdWlyZSgnLi9pbml0JyksXG4gICAgcHJlbG9hZDogcmVxdWlyZSgnLi9wcmVsb2FkJyksXG4gICAgdXBkYXRlOiByZXF1aXJlKCcuL3VwZGF0ZScpXG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmdhbWUucmVuZGVyZXIucmVuZGVyU2Vzc2lvbi5yb3VuZFBpeGVscyA9IHRydWVcbiAgICB0aGlzLmdhbWUuc3RhZ2UuZGlzYWJsZVZpc2liaWxpdHlDaGFuZ2UgPSB0cnVlXG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmdhbWUubG9hZC50aWxlbWFwKCdsZXZlbDEnLCAnL2phdmFzY3JpcHRzL0hpZ2hydWxlVGVtcGxlLmpzb24nLCBudWxsLCBQaGFzZXIuVGlsZW1hcC5USUxFRF9KU09OKTtcbiAgICB0aGlzLmdhbWUubG9hZC5pbWFnZSgnMScsICcvaW1hZ2VzL1RpbGVzLzEucG5nJylcbiAgICB0aGlzLmdhbWUubG9hZC5pbWFnZSgnMicsICcvaW1hZ2VzL1RpbGVzLzIucG5nJylcbiAgICB0aGlzLmdhbWUubG9hZC5pbWFnZSgnMycsICcvaW1hZ2VzL1RpbGVzLzMucG5nJylcbiAgICB0aGlzLmdhbWUubG9hZC5pbWFnZSgnNCcsICcvaW1hZ2VzL1RpbGVzLzQucG5nJylcbiAgICB0aGlzLmdhbWUubG9hZC5pbWFnZSgnNScsICcvaW1hZ2VzL1RpbGVzLzUucG5nJylcbiAgICB0aGlzLmdhbWUubG9hZC5pbWFnZSgnNicsICcvaW1hZ2VzL1RpbGVzLzYucG5nJylcbiAgICB0aGlzLmdhbWUubG9hZC5pbWFnZSgnNycsICcvaW1hZ2VzL1RpbGVzLzcucG5nJylcbiAgICB0aGlzLmdhbWUubG9hZC5pbWFnZSgnOCcsICcvaW1hZ2VzL1RpbGVzLzgucG5nJylcbiAgICB0aGlzLmdhbWUubG9hZC5pbWFnZSgnOScsICcvaW1hZ2VzL1RpbGVzLzkucG5nJylcbiAgICB0aGlzLmdhbWUubG9hZC5pbWFnZSgnMTAnLCAnL2ltYWdlcy9UaWxlcy8xMC5wbmcnKVxuICAgIHRoaXMuZ2FtZS5sb2FkLmltYWdlKCcxMScsICcvaW1hZ2VzL1RpbGVzLzExLnBuZycpXG4gICAgdGhpcy5nYW1lLmxvYWQuaW1hZ2UoJzEyJywgJy9pbWFnZXMvVGlsZXMvMTIucG5nJylcbiAgICB0aGlzLmdhbWUubG9hZC5pbWFnZSgnMTMnLCAnL2ltYWdlcy9UaWxlcy8xMy5wbmcnKVxuICAgIHRoaXMuZ2FtZS5sb2FkLmltYWdlKCcxNCcsICcvaW1hZ2VzL1RpbGVzLzE0LnBuZycpXG4gICAgdGhpcy5nYW1lLmxvYWQuaW1hZ2UoJzE1JywgJy9pbWFnZXMvVGlsZXMvMTUucG5nJylcbiAgICB0aGlzLmdhbWUubG9hZC5pbWFnZSgnMTYnLCAnL2ltYWdlcy9UaWxlcy8xNi5wbmcnKVxuICAgIHRoaXMuZ2FtZS5sb2FkLmltYWdlKCcxNycsICcvaW1hZ2VzL1RpbGVzLzE3LnBuZycpXG4gICAgdGhpcy5nYW1lLmxvYWQuaW1hZ2UoJzE4JywgJy9pbWFnZXMvVGlsZXMvMTgucG5nJylcbiAgICB0aGlzLmdhbWUubG9hZC5pbWFnZSgnQkcnLCAnL2ltYWdlcy9CRy9CRy5wbmcnKVxuXG4gICAgdGhpcy5sb2FkLmltYWdlKCd0cmVlc2NhcGUnLCAnL2ltYWdlcy9tYXAtY3RmMS5wbmcnKVxuICAgIHRoaXMubG9hZC5pbWFnZSgnZ3JvdW5kJywgJy9pbWFnZXMvcGxhdGZvcm0ucG5nJylcbiAgICB0aGlzLmxvYWQuaW1hZ2UoJ2J1bGxldDEyJywgJy9pbWFnZXMvYnVsbGV0MTIucG5nJylcblxuICAgIHRoaXMubG9hZC5zcHJpdGVzaGVldCgnZHVkZScsICcvaW1hZ2VzL2R1ZGUucG5nJywgMzIsIDQ4KVxuICAgIHRoaXMubG9hZC5zcHJpdGVzaGVldCgnZW5lbXknLCAnL2ltYWdlcy9kdWRlLnBuZycsIDMyLCA0OClcblxuICAgIHRoaXMubG9hZC5hdWRpbygnQUs0Ny1zb3VuZCcsICcvYXVkaW8vQUs0Ny5vZ2cnKVxuICAgIHRoaXMubG9hZC5hdWRpbygnQmFycmV0TTgyQTEtc291bmQnLCAnL2F1ZGlvL0JhcnJldE04MkExLm9nZycpXG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICAvLyAgQ29sbGlkZSB0aGUgcGxheWVyIGFuZCB0aGUgc3RhcnMgd2l0aCB0aGUgcGxhdGZvcm1zXG4gICAgdGhpcy5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMucGxheWVyLCB0aGlzLnBsYXRmb3JtcywgbnVsbCwgbnVsbCwgdGhpcylcbiAgICAvLyB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5lbmVteUJ1ZmZhbG8sIHRoaXMucGxhdGZvcm1zKVxuXG4gICAgdGhpcy5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMucGxhdGZvcm1zLCB0aGlzLndlYXBvbnMsIChwbGF0Zm9ybSwgd2VhcG9uKSA9PiB7XG4gICAgICAgIHdlYXBvbi5raWxsKClcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnYnVsbGV0IHJlbW92ZWQnLCB7XG4gICAgICAgICAgICBidWxsZXRJZDogd2VhcG9uLmlkXG4gICAgICAgIH0pXG4gICAgfSwgbnVsbCwgdGhpcylcblxuICAgIHRoaXMuZW5lbWllcy5mb3JFYWNoKChlbmVteSkgPT4ge1xuICAgICAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUoZW5lbXkucGxheWVyLCB0aGlzLnBsYXRmb3JtcywgbnVsbCwgbnVsbCwgdGhpcylcbiAgICAgICAgdGhpcy5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKGVuZW15LnBsYXllciwgdGhpcy53ZWFwb25zLCBmdW5jdGlvbihlbmVteVBsYXllciwgd2VhcG9uKSB7XG4gICAgICAgICAgICB3ZWFwb24ua2lsbCgpXG4gICAgICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdidWxsZXQgcmVtb3ZlZCcsIHtcbiAgICAgICAgICAgICAgICBidWxsZXRJZDogd2VhcG9uLmlkXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfSwgbnVsbCwgdGhpcylcblxuICAgIH0pXG5cbiAgICAvLyB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5lbmVteUJ1ZmZhbG8sIHRoaXMud2VhcG9ucywgIG51bGwsIGZ1bmN0aW9uKGVuZW15QnVmZmFsbywgd2VhcG9uKSB7XG4gICAgLy8gICAgIHdlYXBvbi5raWxsKClcbiAgICAvLyAgICAgZW5lbXlCdWZmYWxvLm1ldGEuaGVhbHRoIC09IHdlYXBvbi5kYW1hZ2VcbiAgICAvL1xuICAgIC8vICAgICBpZiAoZW5lbXlCdWZmYWxvLm1ldGEuaGVhbHRoIDw9IDApIHtcbiAgICAvLyAgICAgICAgIGVuZW15QnVmZmFsby5tZXRhLmhlYWx0aCA9IDEwMFxuICAgIC8vICAgICAgICAgZW5lbXlCdWZmYWxvLnggPSAyMDBcbiAgICAvLyAgICAgICAgIGVuZW15QnVmZmFsby55ID0gdGhpcy53b3JsZC5oZWlnaHQgLSA0MDBcbiAgICAvLyAgICAgfVxuICAgIC8vXG4gICAgLy8gICAgIHJldHVybiBmYWxzZVxuICAgIC8vIH0sIHRoaXMpXG5cbiAgICAvLyB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5lbmVteUJ1ZmZhbG8sIHRoaXMucGxheWVyLCAgbnVsbCwgZnVuY3Rpb24oZW5lbXlCdWZmYWxvLCBwbGF5ZXIpIHtcbiAgICAvLyAgICAgaWYgKGVuZW15QnVmZmFsby5tZXRhLnJlbG9hZGluZylcbiAgICAvLyAgICAgICAgIHJldHVybiBmYWxzZVxuICAgIC8vXG4gICAgLy8gICAgIHBsYXllci5tZXRhLmhlYWx0aCAtPSBlbmVteUJ1ZmZhbG8ubWV0YS5kYW1hZ2VcbiAgICAvLyAgICAgdGhpcy5oZWFsdGhUZXh0LnRleHQgPSBwbGF5ZXIubWV0YS5oZWFsdGhcbiAgICAvLyAgICAgZW5lbXlCdWZmYWxvLm1ldGEucmVsb2FkaW5nID0gdHJ1ZVxuICAgIC8vXG4gICAgLy8gICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgLy8gICAgICAgICBlbmVteUJ1ZmZhbG8ubWV0YS5yZWxvYWRpbmcgPSBmYWxzZVxuICAgIC8vICAgICB9LCBlbmVteUJ1ZmZhbG8ubWV0YS5yZWxvYWRUaW1lKVxuICAgIC8vXG4gICAgLy8gICAgIGlmIChwbGF5ZXIubWV0YS5oZWFsdGggPD0gMCkge1xuICAgIC8vICAgICAgICAgcGxheWVyLm1ldGEuaGVhbHRoID0gMTAwXG4gICAgLy8gICAgICAgICBwbGF5ZXIueCA9IDIwMFxuICAgIC8vICAgICAgICAgcGxheWVyLnkgPSB0aGlzLndvcmxkLmhlaWdodCAtIDQwMFxuICAgIC8vICAgICAgICAgdGhpcy5oZWFsdGhUZXh0LnRleHQgPSBwbGF5ZXIubWV0YS5oZWFsdGhcbiAgICAvLyAgICAgfVxuICAgIC8vXG4gICAgLy8gICAgIHJldHVybiBmYWxzZVxuICAgIC8vIH0sIHRoaXMpXG5cbiAgICAvLyBpZiAodGhpcy5lbmVteUJ1ZmZhbG8ueCA8IHRoaXMucGxheWVyLngpIHtcbiAgICAvLyAgICAgdGhpcy5lbmVteUJ1ZmZhbG8uYm9keS5hY2NlbGVyYXRpb24ueCA9IHRoaXMuQUNDRUxFUkFUSU9OXG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gaWYgKHRoaXMuZW5lbXlCdWZmYWxvLnggPiB0aGlzLnBsYXllci54KSB7XG4gICAgLy8gICAgIHRoaXMuZW5lbXlCdWZmYWxvLmJvZHkuYWNjZWxlcmF0aW9uLnggPSAtdGhpcy5BQ0NFTEVSQVRJT05cbiAgICAvLyB9XG5cbiAgICBpZiAodGhpcy5sZWZ0SW5wdXRJc0FjdGl2ZSgpKSB7XG4gICAgICAgIC8vIElmIHRoZSBMRUZUIGtleSBpcyBkb3duLCBzZXQgdGhlIHBsYXllciB2ZWxvY2l0eSB0byBtb3ZlIGxlZnRcbiAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5hY2NlbGVyYXRpb24ueCA9IC10aGlzLkFDQ0VMRVJBVElPTlxuICAgICAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLnBsYXkoJ2xlZnQnKVxuICAgIH0gZWxzZSBpZiAodGhpcy5yaWdodElucHV0SXNBY3RpdmUoKSkge1xuICAgICAgICAvLyBJZiB0aGUgUklHSFQga2V5IGlzIGRvd24sIHNldCB0aGUgcGxheWVyIHZlbG9jaXR5IHRvIG1vdmUgcmlnaHRcbiAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5hY2NlbGVyYXRpb24ueCA9IHRoaXMuQUNDRUxFUkFUSU9OXG4gICAgICAgIHRoaXMucGxheWVyLmFuaW1hdGlvbnMucGxheSgncmlnaHQnKVxuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFN0YW5kIHN0aWxsXG4gICAgICAgIHRoaXMucGxheWVyLmJvZHkuYWNjZWxlcmF0aW9uLnggPSAwXG4gICAgICAgIHRoaXMucGxheWVyLmFuaW1hdGlvbnMuc3RvcCgpXG4gICAgICAgIHRoaXMucGxheWVyLmZyYW1lID0gNFxuICAgIH1cblxuICAgIC8vIFNldCBhIHZhcmlhYmxlIHRoYXQgaXMgdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgaXMgdG91Y2hpbmcgdGhlIGdyb3VuZFxuICAgIGxldCBvblRoZUdyb3VuZCA9IHRoaXMucGxheWVyLmJvZHkudG91Y2hpbmcuZG93blxuXG4gICAgLy8gSWYgdGhlIHBsYXllciBpcyB0b3VjaGluZyB0aGUgZ3JvdW5kLCBsZXQgaGltIGhhdmUgMiBqdW1wc1xuICAgIGlmIChvblRoZUdyb3VuZCkge1xuICAgICAgICB0aGlzLmp1bXBzID0gMlxuICAgICAgICB0aGlzLmp1bXBpbmcgPSBmYWxzZVxuICAgIH1cblxuICAgIC8vIEp1bXAhXG4gICAgaWYgKHRoaXMuanVtcHMgPiAwICYmIHRoaXMudXBJbnB1dElzQWN0aXZlKDUpKSB7XG4gICAgICAgIHRoaXMucGxheWVyLmJvZHkudmVsb2NpdHkueSA9IHRoaXMuSlVNUF9TUEVFRFxuICAgICAgICB0aGlzLmp1bXBpbmcgPSB0cnVlXG4gICAgfVxuXG4gICAgLy8gUmVkdWNlIHRoZSBudW1iZXIgb2YgYXZhaWxhYmxlIGp1bXBzIGlmIHRoZSBqdW1wIGlucHV0IGlzIHJlbGVhc2VkXG4gICAgaWYgKHRoaXMuanVtcGluZyAmJiB0aGlzLnVwSW5wdXRSZWxlYXNlZCgpKSB7XG4gICAgICAgIHRoaXMuanVtcHMtLVxuICAgICAgICB0aGlzLmp1bXBpbmcgPSBmYWxzZVxuICAgIH1cblxuICAgIGlmICh0aGlzLmdhbWUuaW5wdXQuYWN0aXZlUG9pbnRlci5pc0Rvd24pXG4gICAge1xuICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS5maXJlKHRoaXMucGxheWVyLCB0aGlzLnNvY2tldClcbiAgICB9XG5cbiAgICB0aGlzLnNvY2tldC5lbWl0KCdtb3ZlIHBsYXllcicsIHtcbiAgICAgICAgeDogdGhpcy5wbGF5ZXIueCxcbiAgICAgICAgeTogdGhpcy5wbGF5ZXIueVxuICAgIH0pXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IEd1aWQgPSByZXF1aXJlKCcuL0d1aWQnKVxuXG52YXIgQnVsbGV0ID0gZnVuY3Rpb24gKGdhbWUsIGtleSkge1xuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCAwLCAwLCBrZXkpXG4gICAgdGhpcy50ZXh0dXJlLmJhc2VUZXh0dXJlLnNjYWxlTW9kZSA9IFBJWEkuc2NhbGVNb2Rlcy5ORUFSRVNUXG4gICAgdGhpcy5hbmNob3Iuc2V0KDAuNSlcbiAgICB0aGlzLmNoZWNrV29ybGRCb3VuZHMgPSB0cnVlXG4gICAgdGhpcy5vdXRPZkJvdW5kc0tpbGwgPSB0cnVlXG4gICAgdGhpcy5leGlzdHMgPSBmYWxzZVxuICAgIHRoaXMudHJhY2tpbmcgPSBmYWxzZVxuICAgIHRoaXMuc2NhbGVTcGVlZCA9IDBcbn1cblxuQnVsbGV0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpXG5CdWxsZXQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQnVsbGV0XG5cbkJ1bGxldC5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uICh4LCB5LCBhbmdsZSwgc3BlZWQsIGd4LCBneSwgc29ja2V0KSB7XG4gICAgdGhpcy5yZXNldCh4LCB5KVxuXG4gICAgbGV0IHBvaW50ZXJBbmdsZSA9IHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5tb3ZlVG9Qb2ludGVyKHRoaXMsIHNwZWVkKVxuICAgIHRoaXMuYm9keS5ncmF2aXR5LnkgPSAtMTgwMFxuXG4gICAgc29ja2V0LmVtaXQoJ2J1bGxldCBmaXJlZCcsIHtcbiAgICAgICAgYnVsbGV0SWQ6IEd1aWQoKSxcbiAgICAgICAgeCxcbiAgICAgICAgeSxcbiAgICAgICAgYW5nbGUsXG4gICAgICAgIHNwZWVkLFxuICAgICAgICBneCxcbiAgICAgICAgZ3ksXG4gICAgICAgIHBvaW50ZXJBbmdsZSxcbiAgICAgICAgaGVpZ2h0OiB0aGlzLmhlaWdodCxcbiAgICAgICAgd2lkdGg6IHRoaXMud2lkdGgsXG4gICAgICAgIGRhbWFnZTogdGhpcy5kYW1hZ2VcbiAgICB9KVxufVxuXG5CdWxsZXQucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy50cmFja2luZykge1xuICAgICAgICB0aGlzLnJvdGF0aW9uID0gTWF0aC5hdGFuMih0aGlzLmJvZHkudmVsb2NpdHkueSwgdGhpcy5ib2R5LnZlbG9jaXR5LngpXG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1bGxldFxuIiwiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ3VpZEdlbmVyYXRvcigpIHtcbiAgICB2YXIgUzQgPSBmdW5jdGlvbigpIHtcbiAgICAgICByZXR1cm4gKCgoMStNYXRoLnJhbmRvbSgpKSoweDEwMDAwKXwwKS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpXG4gICAgfVxuXG4gICAgcmV0dXJuIChTNCgpK1M0KCkrXCItXCIrUzQoKStcIi1cIitTNCgpK1wiLVwiK1M0KCkrXCItXCIrUzQoKStTNCgpK1M0KCkpXG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgLy8gVGhpcyBmdW5jdGlvbiBzaG91bGQgcmV0dXJuIHRydWUgd2hlbiB0aGUgcGxheWVyIGFjdGl2YXRlcyB0aGUgXCJnbyBsZWZ0XCIgY29udHJvbFxuICAgIC8vIEluIHRoaXMgY2FzZSwgZWl0aGVyIGhvbGRpbmcgdGhlIHJpZ2h0IGFycm93IG9yIHRhcHBpbmcgb3IgY2xpY2tpbmcgb24gdGhlIGxlZnRcbiAgICAvLyBzaWRlIG9mIHRoZSBzY3JlZW4uXG4gICAgbGVmdElucHV0SXNBY3RpdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnB1dC5rZXlib2FyZC5pc0Rvd24oUGhhc2VyLktleWJvYXJkLkEpXG4gICAgfSxcblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gc2hvdWxkIHJldHVybiB0cnVlIHdoZW4gdGhlIHBsYXllciBhY3RpdmF0ZXMgdGhlIFwiZ28gcmlnaHRcIiBjb250cm9sXG4gICAgLy8gSW4gdGhpcyBjYXNlLCBlaXRoZXIgaG9sZGluZyB0aGUgcmlnaHQgYXJyb3cgb3IgdGFwcGluZyBvciBjbGlja2luZyBvbiB0aGUgcmlnaHRcbiAgICAvLyBzaWRlIG9mIHRoZSBzY3JlZW4uXG4gICAgcmlnaHRJbnB1dElzQWN0aXZlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5wdXQua2V5Ym9hcmQuaXNEb3duKFBoYXNlci5LZXlib2FyZC5EKVxuICAgIH0sXG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIHNob3VsZCByZXR1cm4gdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgYWN0aXZhdGVzIHRoZSBcImp1bXBcIiBjb250cm9sXG4gICAgLy8gSW4gdGhpcyBjYXNlLCBlaXRoZXIgaG9sZGluZyB0aGUgdXAgYXJyb3cgb3IgdGFwcGluZyBvciBjbGlja2luZyBvbiB0aGUgY2VudGVyXG4gICAgLy8gcGFydCBvZiB0aGUgc2NyZWVuLlxuICAgIHVwSW5wdXRJc0FjdGl2ZTogZnVuY3Rpb24oZHVyYXRpb24pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5wdXQua2V5Ym9hcmQuZG93bkR1cmF0aW9uKFBoYXNlci5LZXlib2FyZC5XLCBkdXJhdGlvbilcbiAgICB9LFxuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiByZXR1cm5zIHRydWUgd2hlbiB0aGUgcGxheWVyIHJlbGVhc2VzIHRoZSBcImp1bXBcIiBjb250cm9sXG4gICAgdXBJbnB1dFJlbGVhc2VkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5wdXQua2V5Ym9hcmQudXBEdXJhdGlvbihQaGFzZXIuS2V5Ym9hcmQuVylcbiAgICB9XG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpZCkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5lbmVtaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICh0aGlzLmVuZW1pZXNbaV0ucGxheWVyLmlkID09PSBpZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZW5lbWllc1tpXVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IFJlbW90ZVBsYXllciA9IGZ1bmN0aW9uKGlkLCBnYW1lLCBwbGF5ZXIsIHN0YXJ0WCwgc3RhcnRZKSB7XG4gICAgbGV0IG5ld1JlbW90ZVBsYXllciA9IHtcbiAgICAgICAgeDogc3RhcnRYLFxuICAgICAgICB5OiBzdGFydFksXG4gICAgICAgIGlkOiBudWxsLFxuICAgICAgICBnYW1lOiBnYW1lLFxuICAgICAgICBoZWFsdGg6IDEwMCxcbiAgICAgICAgcGxheWVyOiBwbGF5ZXIsXG4gICAgICAgIGFsaXZlOiB0cnVlLFxuICAgICAgICBsYXN0UG9zaXRpb246IHtcbiAgICAgICAgICAgIHg6IHN0YXJ0WCxcbiAgICAgICAgICAgIHk6IHN0YXJ0WVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIHRoZSBwbGF5ZXIncyBlbmVteSBzcHJpdGVcbiAgICBuZXdSZW1vdGVQbGF5ZXIucGxheWVyID0gZ2FtZS5hZGQuc3ByaXRlKHN0YXJ0WCwgc3RhcnRZLCAnZW5lbXknKVxuXG4gICAgLy8gIFdlIG5lZWQgdG8gZW5hYmxlIHBoeXNpY3Mgb24gdGhlIHBsYXllclxuICAgIC8vIHRoaXMucGh5c2ljcy5hcmNhZGUuZW5hYmxlKG5ld1JlbW90ZVBsYXllci5wbGF5ZXIpXG5cbiAgICAvLyAvLyBFbmFibGUgcGh5c2ljcyBvbiB0aGUgcGxheWVyXG4gICAgLy8gdGhpcy5nYW1lLnBoeXNpY3MuZW5hYmxlKG5ld1JlbW90ZVBsYXllci5wbGF5ZXIsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSlcblxuICAgIC8vIE1ha2UgcGxheWVyIGNvbGxpZGUgd2l0aCB3b3JsZCBib3VuZGFyaWVzIHNvIGhlIGRvZXNuJ3QgbGVhdmUgdGhlIHN0YWdlXG4gICAgLy8gbmV3UmVtb3RlUGxheWVyLnBsYXllci5ib2R5LmNvbGxpZGVXb3JsZEJvdW5kcyA9IHRydWVcblxuICAgIC8vIE91ciB0d28gYW5pbWF0aW9ucywgd2Fsa2luZyBsZWZ0IGFuZCByaWdodC5cbiAgICBuZXdSZW1vdGVQbGF5ZXIucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdsZWZ0JywgWzAsIDEsIDIsIDNdLCAxMCwgdHJ1ZSlcbiAgICBuZXdSZW1vdGVQbGF5ZXIucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdyaWdodCcsIFs1LCA2LCA3LCA4XSwgMTAsIHRydWUpXG5cbiAgICBuZXdSZW1vdGVQbGF5ZXIucGxheWVyLmlkID0gaWRcblxuICAgIHJldHVybiBuZXdSZW1vdGVQbGF5ZXJcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBSZW1vdGVQbGF5ZXJcbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBzZXRFdmVudEhhbmRsZXJzOiByZXF1aXJlKCcuL3NldEV2ZW50SGFuZGxlcnMnKSxcblxuICAgIG9uU29ja2V0Q29ubmVjdGVkOiByZXF1aXJlKCcuL29uU29ja2V0Q29ubmVjdGVkJyksXG4gICAgb25Tb2NrZXREaXNjb25uZWN0OiByZXF1aXJlKCcuL29uU29ja2V0RGlzY29ubmVjdCcpLFxuXG4gICAgb25Nb3ZlUGxheWVyOiByZXF1aXJlKCcuL29uTW92ZVBsYXllcicpLFxuICAgIG9uUmVtb3ZlUGxheWVyOiByZXF1aXJlKCcuL29uUmVtb3ZlUGxheWVyJyksXG4gICAgb25VcGRhdGVQbGF5ZXJzOiByZXF1aXJlKCcuL29uVXBkYXRlUGxheWVycycpLFxuXG4gICAgb25CdWxsZXRGaXJlZDogcmVxdWlyZSgnLi9vbkJ1bGxldEZpcmVkJylcbiAgICAvLyBvbkJ1bGxldHNVcGRhdGU6IHJlcXVpcmUoJy4vb25CdWxsZXRzVXBkYXRlJyksXG4gICAgLy8gb25CdWxsZXRNb3ZlZDogcmVxdWlyZSgnLi9vbkJ1bGxldE1vdmVkJyksXG4gICAgLy8gb25CdWxsZXRSZW1vdmVkOiByZXF1aXJlKCcuL29uQnVsbGV0UmVtb3ZlZCcpXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IEJ1bGxldCA9IHJlcXVpcmUoJy4uL0J1bGxldCcpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIGlmIChkYXRhLmlkID09PSAoJy8jJyArIHRoaXMuc29ja2V0LmlkKSlcbiAgICAgICAgcmV0dXJuXG5cbiAgICBsZXQgbmV3RW5lbXlCdWxsZXQgPSB0aGlzLmVuZW15QnVsbGV0cy5jcmVhdGUoZGF0YS54LCBkYXRhLnksICdidWxsZXQxMicpXG4gICAgbmV3RW5lbXlCdWxsZXQucm90YXRpb24gPSBkYXRhLnBvaW50ZXJBbmdsZVxuICAgIG5ld0VuZW15QnVsbGV0LmhlaWdodCA9IGRhdGEuaGVpZ2h0XG4gICAgbmV3RW5lbXlCdWxsZXQud2lkdGggPSBkYXRhLndpZHRoXG5cbiAgICBjb25zb2xlLmxvZygnQnVsbGV0IGZpcmVkIGJ5JywgZGF0YS5pZClcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgUGxheWVyQnlJZCA9IHJlcXVpcmUoJy4uL1BsYXllckJ5SWQnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBsZXQgbW92ZVBsYXllciA9IFBsYXllckJ5SWQuY2FsbCh0aGlzLCBkYXRhLmlkKVxuXG4gICAgLy8gUGxheWVyIG5vdCBmb3VuZFxuICAgIGlmICghIG1vdmVQbGF5ZXIpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIHBsYXllciBwb3NpdGlvblxuICAgIG1vdmVQbGF5ZXIucGxheWVyLnggPSBkYXRhLnhcbiAgICBtb3ZlUGxheWVyLnBsYXllci55ID0gZGF0YS55XG5cbiAgICBpZiAobW92ZVBsYXllci5wbGF5ZXIueCA+IG1vdmVQbGF5ZXIubGFzdFBvc2l0aW9uLngpIHtcbiAgICAgICAgbW92ZVBsYXllci5wbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdyaWdodCcpXG4gICAgfVxuICAgIGVsc2UgaWYgKG1vdmVQbGF5ZXIucGxheWVyLnggPCBtb3ZlUGxheWVyLmxhc3RQb3NpdGlvbi54KVxuICAgIHtcbiAgICAgICAgbW92ZVBsYXllci5wbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdsZWZ0JylcbiAgICB9XG4gICAgZWxzZVxuICAgIHtcbiAgICAgICAgbW92ZVBsYXllci5wbGF5ZXIuYW5pbWF0aW9ucy5zdG9wKClcbiAgICAgICAgbW92ZVBsYXllci5wbGF5ZXIuZnJhbWUgPSA0XG4gICAgfVxuXG4gICAgbW92ZVBsYXllci5sYXN0UG9zaXRpb24ueCA9IG1vdmVQbGF5ZXIucGxheWVyLnhcbiAgICBtb3ZlUGxheWVyLmxhc3RQb3NpdGlvbi55ID0gbW92ZVBsYXllci5wbGF5ZXIueVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBQbGF5ZXJCeUlkID0gcmVxdWlyZSgnLi4vUGxheWVyQnlJZCcpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIGxldCByZW1vdmVQbGF5ZXIgPSBQbGF5ZXJCeUlkLmNhbGwodGhpcywgZGF0YS5pZClcblxuICAgIC8vIFBsYXllciBub3QgZm91bmRcbiAgICBpZiAoIXJlbW92ZVBsYXllcikge1xuICAgICAgICBjb25zb2xlLmxvZygnUGxheWVyIG5vdCBmb3VuZDogJywgZGF0YS5pZClcbiAgICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgcmVtb3ZlUGxheWVyLnBsYXllci5raWxsKClcblxuICAgIC8vIFJlbW92ZSBwbGF5ZXIgZnJvbSBhcnJheVxuICAgIHRoaXMuZW5lbWllcy5zcGxpY2UodGhpcy5lbmVtaWVzLmluZGV4T2YocmVtb3ZlUGxheWVyKSwgMSlcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKCdDb25uZWN0ZWQgdG8gc29ja2V0IHNlcnZlcicpXG5cbiAgICAgLy8gUmVzZXQgZW5lbWllcyBvbiByZWNvbm5lY3RcbiAgICB0aGlzLmVuZW1pZXMuZm9yRWFjaChmdW5jdGlvbiAoZW5lbXkpIHtcbiAgICAgICAgaWYgKGVuZW15KSBlbmVteS5raWxsKClcbiAgICB9KVxuICAgIFxuICAgIHRoaXMuZW5lbWllcyA9IFtdXG5cbiAgICAvLyBTZW5kIGxvY2FsIHBsYXllciBkYXRhIHRvIHRoZSBnYW1lIHNlcnZlclxuICAgIHRoaXMuc29ja2V0LmVtaXQoJ25ldyBwbGF5ZXInLCB7XG4gICAgICAgIHg6IHRoaXMucGxheWVyLngsXG4gICAgICAgIHk6IHRoaXMucGxheWVyLnlcbiAgICB9KVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coJ0Rpc2Nvbm5lY3RlZCBmcm9tIHNvY2tldCBzZXJ2ZXInKVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBSZW1vdGVQbGF5ZXIgPSByZXF1aXJlKCcuLi9SZW1vdGVQbGF5ZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICB0aGlzLmVuZW1pZXMuZm9yRWFjaChmdW5jdGlvbiAoZW5lbXkpIHtcbiAgICAgICAgZW5lbXkucGxheWVyLmtpbGwoKVxuICAgIH0pXG5cbiAgICB0aGlzLmVuZW1pZXMgPSBbXVxuXG4gICAgZGF0YS5wbGF5ZXJzLmZvckVhY2goKHBsYXllcikgPT4ge1xuICAgICAgICBpZiAocGxheWVyLmlkID09PSAoJy8jJyArIHRoaXMuc29ja2V0LmlkKSlcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIGxldCBuZXdSZW1vdGVQbGF5ZXIgPSBSZW1vdGVQbGF5ZXIuY2FsbCh0aGlzLCBwbGF5ZXIuaWQsIHRoaXMuZ2FtZSwgdGhpcy5wbGF5ZXIsIHBsYXllci54LCBwbGF5ZXIueSlcbiAgICAgICAgdGhpcy5lbmVtaWVzLnB1c2gobmV3UmVtb3RlUGxheWVyKVxuICAgICAgICB0aGlzLmVuZW1pZXNbdGhpcy5lbmVtaWVzLmxlbmd0aCAtIDFdLnBsYXllci5hbmltYXRpb25zLmFkZCgnbGVmdCcsIFswLCAxLCAyLCAzXSwgMTAsIHRydWUpXG4gICAgICAgIHRoaXMuZW5lbWllc1t0aGlzLmVuZW1pZXMubGVuZ3RoIC0gMV0ucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdyaWdodCcsIFs1LCA2LCA3LCA4XSwgMTAsIHRydWUpXG4gICAgfSlcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnNvY2tldC5vbignY29ubmVjdCcsIHRoaXMub25Tb2NrZXRDb25uZWN0ZWQuYmluZCh0aGlzKSlcbiAgICB0aGlzLnNvY2tldC5vbignZGlzY29ubmVjdCcsIHRoaXMub25Tb2NrZXREaXNjb25uZWN0LmJpbmQodGhpcykpXG5cbiAgICB0aGlzLnNvY2tldC5vbigndXBkYXRlIHBsYXllcnMnLCB0aGlzLm9uVXBkYXRlUGxheWVycy5iaW5kKHRoaXMpKVxuICAgIHRoaXMuc29ja2V0Lm9uKCdtb3ZlIHBsYXllcicsIHRoaXMub25Nb3ZlUGxheWVyLmJpbmQodGhpcykpXG4gICAgdGhpcy5zb2NrZXQub24oJ3JlbW92ZSBwbGF5ZXInLCB0aGlzLm9uUmVtb3ZlUGxheWVyLmJpbmQodGhpcykpXG5cbiAgICB0aGlzLnNvY2tldC5vbignYnVsbGV0IGZpcmVkJywgdGhpcy5vbkJ1bGxldEZpcmVkLmJpbmQodGhpcykpXG4gICAgLy8gdGhpcy5zb2NrZXQub24oJ2J1bGxldHMgdXBkYXRlJywgdGhpcy5vbkJ1bGxldHNVcGRhdGUuYmluZCh0aGlzKSlcbiAgICAvLyB0aGlzLnNvY2tldC5vbignYnVsbGV0IG1vdmVkJywgdGhpcy5vbkJ1bGxldE1vdmVkLmJpbmQodGhpcykpXG4gICAgLy8gdGhpcy5zb2NrZXQub24oJ2J1bGxldCByZW1vdmVkJywgdGhpcy5vbkJ1bGxldFJlbW92ZWQuYmluZCh0aGlzKSlcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgQnVsbGV0ID0gcmVxdWlyZSgnLi4vQnVsbGV0JylcblxubGV0IEFLNDcgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgY29uZmlnLmdhbWUsIGNvbmZpZy5nYW1lLndvcmxkLCAnQUstNDcnLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcblxuICAgIC8vXHRIZXJlIHdlIHNldC11cCBvdXIgYXVkaW8gc3ByaXRlXG4gICAgdGhpcy5meCA9IGNvbmZpZy5nYW1lLmFkZC5hdWRpbygnQUs0Ny1zb3VuZCcpXG4gICAgdGhpcy5hbGxvd011bHRpcGxlID0gdHJ1ZVxuXG4gICAgdGhpcy5kYW1hZ2UgPSAyMlxuICAgIHRoaXMubmV4dEZpcmUgPSAwXG4gICAgdGhpcy5idWxsZXRTcGVlZCA9IDE4MDBcbiAgICB0aGlzLmZpcmVSYXRlID0gMTYwO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA2NDsgaSsrKVxuICAgIHtcbiAgICAgICAgbGV0IGJ1bGxldCA9IG5ldyBCdWxsZXQoY29uZmlnLmdhbWUsICdidWxsZXQxMicsIGNvbmZpZy5zb2NrZXQpXG4gICAgICAgIGJ1bGxldC5oZWlnaHQgPSAyXG4gICAgICAgIGJ1bGxldC53aWR0aCA9IDQwXG4gICAgICAgIGJ1bGxldC5kYW1hZ2UgPSAyMlxuICAgICAgICB0aGlzLmFkZChidWxsZXQsIHRydWUpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG59XG5cbkFLNDcucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcbkFLNDcucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQUs0NztcblxuQUs0Ny5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uKHBsYXllciwgc29ja2V0KSB7XG4gICAgaWYgKHRoaXMuZ2FtZS50aW1lLnRpbWUgPCB0aGlzLm5leHRGaXJlKVxuICAgICAgICByZXR1cm5cblxuICAgIHZhciB4ID0gcGxheWVyLnggKyAxNTtcbiAgICB2YXIgeSA9IHBsYXllci55ICsgMzA7XG5cbiAgICB0aGlzLmdldEZpcnN0RXhpc3RzKGZhbHNlKS5maXJlKHgsIHksIDAsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDAsIHNvY2tldClcbiAgICB0aGlzLnNldEFsbCgndHJhY2tpbmcnLCB0cnVlKVxuXG4gICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMuZ2FtZS50aW1lLnRpbWUgKyB0aGlzLmZpcmVSYXRlXG4gICAgdGhpcy5meC5wbGF5KClcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBSzQ3XG4iLCIndXNlIHN0cmljdCdcblxubGV0IEJ1bGxldCA9IHJlcXVpcmUoJy4uL0J1bGxldCcpXG5cbmxldCBCYXJyZXRNODJBMSA9IGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCBjb25maWcuZ2FtZSwgY29uZmlnLmdhbWUud29ybGQsICdCYXJyZXQgTTgyQTEnLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcblxuICAgIC8vXHRIZXJlIHdlIHNldC11cCBvdXIgYXVkaW8gc3ByaXRlXG4gICAgdGhpcy5meCA9IGNvbmZpZy5nYW1lLmFkZC5hdWRpbygnQmFycmV0TTgyQTEtc291bmQnKVxuICAgIHRoaXMuYWxsb3dNdWx0aXBsZSA9IHRydWVcblxuICAgIHRoaXMubmFtZSA9ICdCYXJyZXQgTTgyQTEnXG4gICAgdGhpcy5kYW1hZ2UgPSA4OFxuICAgIHRoaXMubmV4dEZpcmUgPSAwXG4gICAgdGhpcy5idWxsZXRTcGVlZCA9IDM0MzVcblxuICAgIC8vIEJhcnJldE04MkExIGZpcmVzIGFib3V0IDYwMCBidWxsZXRzIHBlciBzZWNvbmRcbiAgICB0aGlzLmZpcmVSYXRlID0gMzAwMFxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA2NDsgaSsrKVxuICAgIHtcbiAgICAgICAgbGV0IGJ1bGxldCA9IG5ldyBCdWxsZXQoY29uZmlnLmdhbWUsICdidWxsZXQxMicsIGNvbmZpZy5zb2NrZXQpXG4gICAgICAgIGJ1bGxldC5oZWlnaHQgPSAyXG4gICAgICAgIGJ1bGxldC53aWR0aCA9IDQwXG4gICAgICAgIGJ1bGxldC5kYW1hZ2UgPSA4OFxuXG4gICAgICAgIHRoaXMuYWRkKGJ1bGxldCwgdHJ1ZSlcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xufVxuXG5CYXJyZXRNODJBMS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuQmFycmV0TTgyQTEucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQmFycmV0TTgyQTE7XG5cbkJhcnJldE04MkExLnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24gKHBsYXllciwgc29ja2V0KSB7XG4gICAgaWYgKHRoaXMuZ2FtZS50aW1lLnRpbWUgPCB0aGlzLm5leHRGaXJlKVxuICAgICAgICByZXR1cm5cblxuICAgIHZhciB4ID0gcGxheWVyLnggKyAxNTtcbiAgICB2YXIgeSA9IHBsYXllci55ICsgMzA7XG5cbiAgICB0aGlzLmdldEZpcnN0RXhpc3RzKGZhbHNlKS5maXJlKHgsIHksIDAsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDAsIHNvY2tldClcbiAgICB0aGlzLnNldEFsbCgndHJhY2tpbmcnLCB0cnVlKVxuXG4gICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMuZ2FtZS50aW1lLnRpbWUgKyB0aGlzLmZpcmVSYXRlXG4gICAgdGhpcy5meC52b2x1bWUgPSAuNlxuICAgIHRoaXMuZngucGxheSgpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQmFycmV0TTgyQTFcbiIsIid1c2Ugc3RyaWN0J1xuXG4vKipcbiAqIFByaW1hcnkgV2VhcG9uc1xuICogMS4gRGVzZXJ0IEVhZ2xlc1xuICogMi4gSEsgTVA1XG4gKiAzLiBBSzQ3XG4gKiA0LiBNMTZcbiAqIDUuIFNwYXMtMTJcbiAqIDYuIFJ1Z2VyIDc3XG4gKiA3LiBNNzlcbiAqIDguIEJhcnJldCBNODJBMVxuICogOS4gRk4gTWluaW1pXG4gKiAxMC4gWE0yMTQgTWluaWd1blxuICovXG5cbi8qKlxuICogU2Vjb25kYXJ5IFdlYXBvbnNcbiAqIDEuIFVTU09DT01cbiAqIDIuIENvbWJhdCBLbmlmZVxuICogMy4gQ2hhaW5zYXdcbiAqIDQuIE03MiBMYXdcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBcIkFLNDdcIjogcmVxdWlyZSgnLi9BSzQ3JyksXG4gICAgXCJCYXJyZXRNODJBMVwiOiByZXF1aXJlKCcuL0JhcnJldE04MkExJylcbiAgICAvLyBcIlNwYXMxMlwiOiByZXF1aXJlKCcuL1NwYXMxMicpLFxuICAgIC8vIFwiUlBHXCI6IHJlcXVpcmUoJy4vUlBHJylcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgRm9yZXN0Q3RmID0ge31cblxuRm9yZXN0Q3RmLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc3Bhd25Qb2ludHMgPSBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIHg6IDUwMCxcbiAgICAgICAgICAgIHk6IHRoaXMud29ybGQuaGVpZ2h0IC0gNzAwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIHg6IDIwMCxcbiAgICAgICAgICAgIHk6IHRoaXMud29ybGQuaGVpZ2h0IC0gMjAwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIHg6IDM3NTAsXG4gICAgICAgICAgICB5OiB0aGlzLndvcmxkLmhlaWdodCAtIDIwMFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICB4OiAzNDUwLFxuICAgICAgICAgICAgeTogdGhpcy53b3JsZC5oZWlnaHQgLSA3MDBcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgeDogMjYwMCxcbiAgICAgICAgICAgIHk6IHRoaXMud29ybGQuaGVpZ2h0IC0gODAwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIHg6IDEyNTAsXG4gICAgICAgICAgICB5OiB0aGlzLndvcmxkLmhlaWdodCAtIDgwMFxuICAgICAgICB9XG4gICAgXVxuXG4gICAgRm9yZXN0Q3RmLmNyZWF0ZVNreVNwcml0ZS5jYWxsKHRoaXMpXG4gICAgRm9yZXN0Q3RmLmNyZWF0ZVBsYXRmb3Jtcy5jYWxsKHRoaXMpXG4gICAgRm9yZXN0Q3RmLmNyZWF0ZUxlZGdlcy5jYWxsKHRoaXMpXG5cbiAgICB0aGlzLnBsYXRmb3Jtcy5zZXRBbGwoJ2JvZHkuaW1tb3ZhYmxlJywgdHJ1ZSlcbiAgICB0aGlzLnBsYXRmb3Jtcy5zZXRBbGwoJ2JvZHkuYWxsb3dHcmF2aXR5JywgZmFsc2UpXG59XG5cbkZvcmVzdEN0Zi5jcmVhdGVTa3lTcHJpdGUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmFkZC50aWxlU3ByaXRlKDAsIHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSAxNTAwLCB0aGlzLmdhbWUud29ybGQud2lkdGgsIDE1MDAsICd0cmVlc2NhcGUnKVxufVxuXG5Gb3Jlc3RDdGYuY3JlYXRlUGxhdGZvcm1zID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wbGF0Zm9ybXMgPSB0aGlzLmFkZC5ncm91cCgpXG4gICAgdGhpcy5wbGF0Zm9ybXMuZW5hYmxlQm9keSA9IHRydWVcbn1cblxuRm9yZXN0Q3RmLmdldFJhbmRvbVNwYXduUG9pbnQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXy5zYW1wbGUodGhpcy5zcGF3blBvaW50cylcbn1cblxuRm9yZXN0Q3RmLmNyZWF0ZUxlZGdlcyA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBsZWRnZXMgPSBbXG4gICAgICAgIC8vIHt4LCB5LCB3aWR0aCwgaGVpZ2h0fVxuXG4gICAgICAgIC8vIFN0YXJ0aW5nIExlZGdlc1xuICAgICAgICB7IGlkOiAxLCB4OiAwLCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gNDMxLCB3aWR0aDogMTI4LCBoZWlnaHQ6IDkyIH0sIC8vIExlZnQgYm90dG9tIGxlZGdlXG4gICAgICAgIHsgaWQ6IDIsIHg6IDAsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSA4MzgsIHdpZHRoOiAxMjgsIGhlaWdodDogOTIgfSwgLy8gTGVmdCB0b3AgbGVkZ2VcblxuICAgICAgICB7IGlkOiAzLCB4OiAzODcyLCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gNDI3LCB3aWR0aDogMTI4LCBoZWlnaHQ6IDkyIH0sIC8vIFJpZ2h0IGJvdHRvbSBsZWRnZVxuICAgICAgICB7IGlkOiA0LCB4OiAzODcyLCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gODM1LCB3aWR0aDogMTI4LCBoZWlnaHQ6IDkyIH0sIC8vIFJpZ2h0IHRvcCBsZWRnZVxuXG4gICAgICAgIC8vIEdyb3VuZCBMZWRnZXNcbiAgICAgICAgeyBpZDogNSwgeDogMCwgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDEyOCwgd2lkdGg6IDQ3NCwgaGVpZ2h0OiAxMjggfSwgLy8gTWFpbiBib3R0b20gc3RhcnRpbmcgbGVmdCBsZWRnZVxuICAgICAgICB7IGlkOiA2LCB4OiA0NzQsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSAyNTYsIHdpZHRoOiA2NDEsIGhlaWdodDogMjYwIH0sIC8vIE1haW4gYm90dG9tIGxlZnQgbGVkZ2VcbiAgICAgICAgeyBpZDogNywgeDogMTExNSwgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDM4NCwgd2lkdGg6IDE3ODUsIGhlaWdodDogMzkwIH0sIC8vIE1haW4gYm90dG9tIGNlbnRlciBsZWRnZVxuICAgICAgICB7IGlkOiA4LCB4OiAyOTAwLCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gMjU2LCB3aWR0aDogNjQxLCBoZWlnaHQ6IDI2MCB9LCAvLyBNYWluIGJvdHRvbSByaWdodCBsZWRnZVxuICAgICAgICB7IGlkOiA5LCB4OiAzNTQwLCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gMTI4LCB3aWR0aDogNDc0LCBoZWlnaHQ6IDEyOCB9LCAvLyBNYWluIGJvdHRvbSBzdGFydGluZyByaWdodCBsZWRnZVxuXG4gICAgICAgIC8vIEFpciBMZWRnZXNcbiAgICAgICAgeyBpZDogMTAsIHg6IDMwMCwgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDYwOCwgd2lkdGg6IDY0MSwgaGVpZ2h0OiA5MiB9LFxuICAgICAgICB7IGlkOiAxMSwgeDogMTExMCwgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDcwMSwgd2lkdGg6IDUxMywgaGVpZ2h0OiA5MiB9LFxuICAgICAgICB7IGlkOiAxMiwgeDogODcwLCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gOTgyLCB3aWR0aDogMjU2LCBoZWlnaHQ6IDkyIH0sXG4gICAgICAgIHsgaWQ6IDEzLCB4OiAxNzQ0LCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gODc0LCB3aWR0aDogNTA3LCBoZWlnaHQ6IDI1NCB9LFxuICAgICAgICB7IGlkOiAxNCwgeDogMjM5MCwgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDY4OSwgd2lkdGg6IDUxMywgaGVpZ2h0OiA5MiB9LFxuICAgICAgICB7IGlkOiAxNSwgeDogMzAzMSwgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDYwOCwgd2lkdGg6IDY0MSwgaGVpZ2h0OiA5MiB9LFxuICAgICAgICB7IGlkOiAxNiwgeDogMjkwMywgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDk1Nywgd2lkdGg6IDI1NiwgaGVpZ2h0OiA5MiB9LFxuXG4gICAgICAgIC8vIEJveGVzXG4gICAgICAgIHsgaWQ6IDE3LCB4OiA3MTcsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSA2ODUsIHdpZHRoOiAxNTQsIGhlaWdodDogNzcgfSxcbiAgICAgICAgeyBpZDogMTgsIHg6IDc1NywgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDc2Miwgd2lkdGg6IDc3LCBoZWlnaHQ6IDc3IH0sXG4gICAgICAgIHsgaWQ6IDE5LCB4OiAxNDE4LCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gNzc4LCB3aWR0aDogNzcsIGhlaWdodDogNzcgfSxcbiAgICAgICAgeyBpZDogMjAsIHg6IDE5MzEsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSA0NjEsIHdpZHRoOiAxNTQsIGhlaWdodDogNzcgfSxcbiAgICAgICAgeyBpZDogMjEsIHg6IDMyMDUsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSA2ODUsIHdpZHRoOiAxNTQsIGhlaWdodDogNzcgfSxcbiAgICAgICAgeyBpZDogMjIsIHg6IDMyNDUsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSA3NjIsIHdpZHRoOiA3NywgaGVpZ2h0OiA3NyB9XG4gICAgXVxuXG4gICAgbGVkZ2VzLmZvckVhY2goKGxlZGdlKSA9PiB7XG4gICAgICAgIC8vIHZhciBuZXdMZWRnZSA9IHRoaXMucGxhdGZvcm1zLmNyZWF0ZShsZWRnZS54LCBsZWRnZS55LCAnZ3JvdW5kJylcbiAgICAgICAgdmFyIG5ld0xlZGdlID0gdGhpcy5wbGF0Zm9ybXMuY3JlYXRlKGxlZGdlLngsIGxlZGdlLnkpXG4gICAgICAgIG5ld0xlZGdlLmhlaWdodCA9IGxlZGdlLmhlaWdodFxuICAgICAgICBuZXdMZWRnZS53aWR0aCA9IGxlZGdlLndpZHRoXG5cbiAgICAgICAgLy8gRGVidWcgc3R1ZmZcbiAgICAgICAgLy8gbmV3TGVkZ2UuYWxwaGEgPSAwLjJcbiAgICAgICAgLy8gbGV0IHN0eWxlID0geyBmb250OiBcIjIwcHggQXJpYWxcIiwgZmlsbDogXCIjZmYwMDQ0XCIsIGFsaWduOiBcImNlbnRlclwiLCBiYWNrZ3JvdW5kQ29sb3I6IFwiI2ZmZmYwMFwiIH1cbiAgICAgICAgLy8gbGV0IHRleHQgPSB0aGlzLmdhbWUuYWRkLnRleHQobGVkZ2UueCwgbGVkZ2UueSwgbGVkZ2UuaWQsIHN0eWxlKVxuICAgICAgICAvLyB0ZXh0LmFscGhhID0gMC4yXG4gICAgfSlcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGb3Jlc3RDdGZcbiJdfQ==
