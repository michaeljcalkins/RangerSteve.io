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

        this.weaponText.text = this.weapons[this.currentWeapon].name;
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
    }), new Weapons.BarretM90({
        game: this.game
    }), new Weapons.DesertEagle({
        game: this.game
    }), new Weapons.M4A1({
        game: this.game
    }),
    // new Weapons.M79({
    //     game: this.game
    // }),
    new Weapons.M249({
        game: this.game
    }), new Weapons.MP5({
        game: this.game
    }),
    // new Weapons.RPG({
    //     game: this.game
    // }),
    new Weapons.Spas12({
        game: this.game
    })];

    /**
     * Text
     */
    var textStyles = { fontSize: '24px', fill: '#000' };

    this.scoreText = this.add.text(25, 25, 'Score: 0', textStyles);
    this.scoreText.fixedToCamera = true;

    this.weaponText = this.add.text(this.camera.x + 120, this.camera.height - 45, 'AK-47', textStyles);
    this.weaponText.fixedToCamera = true;

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

        setTimeout(function () {
            _this.healthText.cameraOffset.y = _this.camera.height - 45;
            _this.weaponText.cameraOffset.y = _this.camera.height - 45;

            _this.scoreText.cameraOffset.x = 25;
            _this.scoreText.cameraOffset.y = 25;
        }, 200);
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

},{"../lib/Weapons":31,"../maps/ForestCtf":32}],3:[function(require,module,exports){
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
    this.load.audio('BarretM90-sound', '/audio/BarretM90.ogg');
    this.load.audio('M249-sound', '/audio/M249.ogg');
    this.load.audio('MP5-sound', '/audio/MP5.ogg');
    this.load.audio('DesertEagle-sound', '/audio/DesertEagle.ogg');
    this.load.audio('M4A1-sound', '/audio/M4A1.ogg');
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
        this.weapons[this.currentWeapon].fire(this.player, this.socket, this.roomId);
    }

    this.socket.emit('move player', {
        roomId: this.roomId,
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

    this.player.meta.health = data.health;
    this.healthText.text = this.player.meta.health;

    var spawnPoint = ForestCtf.getRandomSpawnPoint.call(this);
    this.player.x = spawnPoint.x;
    this.player.y = spawnPoint.y;
};

},{"../../maps/ForestCtf":32}],18:[function(require,module,exports){
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

    console.log('update players', data);

    this.roomId = data.room.id;

    var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?roomId=' + data.room.id;
    window.history.pushState({ path: newurl }, '', newurl);

    this.enemies.forEach(function (enemy) {
        enemy.player.kill();
    });

    this.enemies = [];

    data.room.players.forEach(function (player) {
        if (player.id === '/#' + _this.socket.id) {
            _this.scoreText.text = player.meta.score;
            return;
        }

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

},{"../Bullet":7,"../Guid":8}],24:[function(require,module,exports){
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

},{"../Bullet":7,"../Guid":8}],25:[function(require,module,exports){
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

},{"../Bullet":7,"../Guid":8}],26:[function(require,module,exports){
'use strict';

var Bullet = require('../Bullet');
var Guid = require('../Guid');

var AK47 = function AK47(config) {
    Phaser.Group.call(this, config.game, config.game.world, 'M249', false, true, Phaser.Physics.ARCADE);

    //	Here we set-up our audio sprite
    this.fx = config.game.add.audio('M249-sound');
    this.allowMultiple = true;

    this.damage = 20;
    this.nextFire = 0;
    this.bulletSpeed = 1900;
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

},{"../Bullet":7,"../Guid":8}],27:[function(require,module,exports){
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

},{"../Bullet":7,"../Guid":8}],28:[function(require,module,exports){
'use strict';

var Bullet = require('../Bullet');
var Guid = require('../Guid');

var AK47 = function AK47(config) {
    Phaser.Group.call(this, config.game, config.game.world, 'M79', false, true, Phaser.Physics.ARCADE);

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

AK47.prototype.fire = function (player, socket, roomId) {
    if (this.game.time.time < this.nextFire) return;

    var x = player.x + 15;
    var y = player.y + 30;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0, socket, roomId);
    this.setAll('tracking', true);

    this.nextFire = this.game.time.time + this.fireRate;
    this.fx.play();
};

module.exports = AK47;

},{"../Bullet":7,"../Guid":8}],29:[function(require,module,exports){
'use strict';

var Bullet = require('../Bullet');
var Guid = require('../Guid');

var MP5 = function MP5(config) {
    Phaser.Group.call(this, config.game, config.game.world, 'MP5', false, true, Phaser.Physics.ARCADE);

    //	Here we set-up our audio sprite
    this.fx = config.game.add.audio('MP5-sound');
    this.allowMultiple = true;

    this.damage = 18;
    this.nextFire = 0;
    this.bulletSpeed = 2350;
    this.fireRate = 110;

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

MP5.prototype = Object.create(Phaser.Group.prototype);
MP5.prototype.constructor = MP5;

MP5.prototype.fire = function (player, socket, roomId) {
    if (this.game.time.time < this.nextFire) return;

    var x = player.x + 15;
    var y = player.y + 30;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0, socket, roomId);
    this.setAll('tracking', true);

    this.nextFire = this.game.time.time + this.fireRate;
    this.fx.play();
};

module.exports = MP5;

},{"../Bullet":7,"../Guid":8}],30:[function(require,module,exports){
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

},{"../Bullet":7,"../Guid":8}],31:[function(require,module,exports){
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
 * 1. Desert Eagle
 * 2. Combat Knife
 * 3. Chainsaw
 * 4. RPG
 */

module.exports = {
  "AK47": require('./AK47'),
  "BarretM90": require('./BarretM90'),
  "DesertEagle": require('./DesertEagle'),
  "M4A1": require('./M4A1'),
  "M79": require('./M79'),
  "M249": require('./M249'),
  "MP5": require('./MP5'),
  // "RPG": require('./RPG'),
  "Spas12": require('./Spas12')
};

},{"./AK47":23,"./BarretM90":24,"./DesertEagle":25,"./M249":26,"./M4A1":27,"./M79":28,"./MP5":29,"./Spas12":30}],32:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvYXBwLmpzIiwiYXNzZXRzL2pzL2NvcmUvY3JlYXRlLmpzIiwiYXNzZXRzL2pzL2NvcmUvaW5kZXguanMiLCJhc3NldHMvanMvY29yZS9pbml0LmpzIiwiYXNzZXRzL2pzL2NvcmUvcHJlbG9hZC5qcyIsImFzc2V0cy9qcy9jb3JlL3VwZGF0ZS5qcyIsImFzc2V0cy9qcy9saWIvQnVsbGV0LmpzIiwiYXNzZXRzL2pzL2xpYi9HdWlkLmpzIiwiYXNzZXRzL2pzL2xpYi9JbnB1dEhhbmRsZXIuanMiLCJhc3NldHMvanMvbGliL1BsYXllckJ5SWQuanMiLCJhc3NldHMvanMvbGliL1JlbW90ZVBsYXllci5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL2luZGV4LmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvb25CdWxsZXRGaXJlZC5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL29uQnVsbGV0UmVtb3ZlZC5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL29uTW92ZVBsYXllci5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL29uUGxheWVyRGFtYWdlZC5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL29uUGxheWVyUmVzcGF3bi5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL29uUmVtb3ZlUGxheWVyLmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvb25Tb2NrZXRDb25uZWN0ZWQuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vblNvY2tldERpc2Nvbm5lY3QuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vblVwZGF0ZVBsYXllcnMuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9zZXRFdmVudEhhbmRsZXJzLmpzIiwiYXNzZXRzL2pzL2xpYi9XZWFwb25zL0FLNDcuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvQmFycmV0TTkwLmpzIiwiYXNzZXRzL2pzL2xpYi9XZWFwb25zL0Rlc2VydEVhZ2xlLmpzIiwiYXNzZXRzL2pzL2xpYi9XZWFwb25zL00yNDkuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvTTRBMS5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9NNzkuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvTVA1LmpzIiwiYXNzZXRzL2pzL2xpYi9XZWFwb25zL1NwYXMxMi5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9pbmRleC5qcyIsImFzc2V0cy9qcy9tYXBzL0ZvcmVzdEN0Zi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQUVBLElBQUksZUFBZSxRQUFRLG9CQUFSLENBQWY7O0FBRUosSUFBSSxlQUFlLFFBQVEsb0JBQVIsQ0FBZjtBQUNKLElBQUksT0FBTyxRQUFRLFFBQVIsQ0FBUDs7QUFFSixJQUFJLFlBQVksT0FBTyxVQUFQO0FBQ2hCLElBQUksYUFBYSxPQUFPLFdBQVA7QUFDakIsSUFBSSxPQUFPLElBQUksT0FBTyxJQUFQLENBQVksU0FBaEIsRUFBMkIsVUFBM0IsRUFBdUMsT0FBTyxJQUFQLEVBQWEsbUJBQXBELENBQVA7O0FBRUosSUFBSSxrQkFBa0IsU0FBbEIsZUFBa0IsR0FBVztBQUM3QixTQUFLLGFBQUwsR0FBcUIsQ0FBckIsQ0FENkI7QUFFN0IsU0FBSyxPQUFMLEdBQWUsRUFBZixDQUY2QjtBQUc3QixTQUFLLElBQUwsR0FBWSxJQUFaLENBSDZCO0FBSTdCLFNBQUssTUFBTCxDQUo2QjtBQUs3QixTQUFLLFNBQUwsQ0FMNkI7QUFNN0IsU0FBSyxNQUFMLENBTjZCO0FBTzdCLFNBQUssS0FBTCxHQUFhLENBQWIsQ0FQNkI7QUFRN0IsU0FBSyxTQUFMLENBUjZCO0FBUzdCLFNBQUssTUFBTCxDQVQ2QjtBQVU3QixTQUFLLFVBQUwsR0FBa0IsSUFBbEIsQ0FWNkI7QUFXN0IsU0FBSyxPQUFM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QW9DaEMsV0FBTyxPQUFQLENBQWUsVUFBQyxLQUFELEVBQVc7O0FBRXRCLFlBQUksV0FBVyxNQUFLLFNBQUwsQ0FBZSxNQUFmLENBQXNCLE1BQU0sQ0FBTixFQUFTLE1BQU0sQ0FBTixDQUExQyxDQUZrQjtBQUd0QixpQkFBUyxNQUFULEdBQWtCLE1BQU0sTUFBTixDQUhJO0FBSXRCLGlCQUFTLEtBQVQsR0FBaUIsTUFBTSxLQUFOOzs7Ozs7O0FBSkssS0FBWCxDQUFmLENBcENnQztDQUFYOztBQWtEekIsT0FBTyxPQUFQLEdBQWlCLFNBQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgSW5wdXRIYW5kbGVyID0gcmVxdWlyZSgnLi9saWIvSW5wdXRIYW5kbGVyJylcbi8vIGxldCBFbmVteUJ1ZmZhbG8gPSByZXF1aXJlKCcuL2xpYi9FbmVteUJ1ZmZhbG8nKVxubGV0IFNvY2tldEV2ZW50cyA9IHJlcXVpcmUoJy4vbGliL1NvY2tldEV2ZW50cycpXG5sZXQgQ29yZSA9IHJlcXVpcmUoJy4vY29yZScpXG5cbmxldCBnYW1lV2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aFxubGV0IGdhbWVIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHRcbmxldCBnYW1lID0gbmV3IFBoYXNlci5HYW1lKGdhbWVXaWR0aCwgZ2FtZUhlaWdodCwgUGhhc2VyLkFVVE8sICdyYW5nZXItc3RldmUtZ2FtZScpXG5cbmxldCBSYW5nZXJTdGV2ZUdhbWUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmN1cnJlbnRXZWFwb24gPSAwXG4gICAgdGhpcy5lbmVtaWVzID0gW11cbiAgICB0aGlzLmdhbWUgPSBnYW1lXG4gICAgdGhpcy5ncm91bmRcbiAgICB0aGlzLnBsYXRmb3Jtc1xuICAgIHRoaXMucGxheWVyXG4gICAgdGhpcy5zY29yZSA9IDBcbiAgICB0aGlzLnNjb3JlVGV4dFxuICAgIHRoaXMuc29ja2V0XG4gICAgdGhpcy53ZWFwb25OYW1lID0gbnVsbFxuICAgIHRoaXMud2VhcG9ucyA9IFtdXG59XG5cblJhbmdlclN0ZXZlR2FtZS5wcm90b3R5cGUgPSB7XG4gICAgaW5pdDogQ29yZS5pbml0LFxuICAgIHByZWxvYWQ6IENvcmUucHJlbG9hZCxcbiAgICBjcmVhdGU6IENvcmUuY3JlYXRlLFxuICAgIHVwZGF0ZTogQ29yZS51cGRhdGUsXG5cbiAgICBsZWZ0SW5wdXRJc0FjdGl2ZTogSW5wdXRIYW5kbGVyLmxlZnRJbnB1dElzQWN0aXZlLFxuICAgIHJpZ2h0SW5wdXRJc0FjdGl2ZTogSW5wdXRIYW5kbGVyLnJpZ2h0SW5wdXRJc0FjdGl2ZSxcbiAgICB1cElucHV0SXNBY3RpdmU6IElucHV0SGFuZGxlci51cElucHV0SXNBY3RpdmUsXG4gICAgdXBJbnB1dFJlbGVhc2VkOiBJbnB1dEhhbmRsZXIudXBJbnB1dFJlbGVhc2VkLFxuXG4gICAgbmV4dFdlYXBvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vICBUaWR5LXVwIHRoZSBjdXJyZW50IHdlYXBvblxuICAgICAgICBpZiAodGhpcy5jdXJyZW50V2VhcG9uID4gOSlcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0ucmVzZXQoKVxuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0udmlzaWJsZSA9IGZhbHNlXG4gICAgICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS5jYWxsQWxsKCdyZXNldCcsIG51bGwsIDAsIDApXG4gICAgICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS5zZXRBbGwoJ2V4aXN0cycsIGZhbHNlKVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gIEFjdGl2YXRlIHRoZSBuZXcgb25lXG4gICAgICAgIHRoaXMuY3VycmVudFdlYXBvbisrXG5cbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFdlYXBvbiA9PT0gdGhpcy53ZWFwb25zLmxlbmd0aClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50V2VhcG9uID0gMFxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0udmlzaWJsZSA9IHRydWVcblxuICAgICAgICB0aGlzLndlYXBvblRleHQudGV4dCA9IHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLm5hbWVcbiAgICB9LFxuXG4gICAgc2V0RXZlbnRIYW5kbGVyczogU29ja2V0RXZlbnRzLnNldEV2ZW50SGFuZGxlcnMsXG4gICAgb25VcGRhdGVQbGF5ZXJzOiBTb2NrZXRFdmVudHMub25VcGRhdGVQbGF5ZXJzLFxuICAgIG9uU29ja2V0Q29ubmVjdGVkOiBTb2NrZXRFdmVudHMub25Tb2NrZXRDb25uZWN0ZWQsXG4gICAgb25Tb2NrZXREaXNjb25uZWN0OiBTb2NrZXRFdmVudHMub25Tb2NrZXREaXNjb25uZWN0LFxuICAgIG9uTW92ZVBsYXllcjogU29ja2V0RXZlbnRzLm9uTW92ZVBsYXllcixcbiAgICBvblJlbW92ZVBsYXllcjogU29ja2V0RXZlbnRzLm9uUmVtb3ZlUGxheWVyLFxuICAgIG9uQnVsbGV0RmlyZWQ6IFNvY2tldEV2ZW50cy5vbkJ1bGxldEZpcmVkLFxuICAgIG9uQnVsbGV0UmVtb3ZlZDogU29ja2V0RXZlbnRzLm9uQnVsbGV0UmVtb3ZlZCxcbiAgICBvblBsYXllckRhbWFnZWQ6IFNvY2tldEV2ZW50cy5vblBsYXllckRhbWFnZWQsXG4gICAgb25QbGF5ZXJSZXNwYXduOiBTb2NrZXRFdmVudHMub25QbGF5ZXJSZXNwYXduXG59XG5cbmdhbWUuc3RhdGUuYWRkKCdHYW1lJywgUmFuZ2VyU3RldmVHYW1lLCB0cnVlKVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBGb3Jlc3RDdGYgPSByZXF1aXJlKCcuLi9tYXBzL0ZvcmVzdEN0ZicpXG5sZXQgV2VhcG9ucyA9IHJlcXVpcmUoJy4uL2xpYi9XZWFwb25zJylcblxubGV0IHdvcmxkV2lkdGggPSA0MDAwXG5sZXQgd29ybGRIZWlnaHQgPSAxNTAwXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gRGVmaW5lIG1vdmVtZW50IGNvbnN0YW50c1xuICAgIHRoaXMuTUFYX1NQRUVEID0gNDAwIC8vIHBpeGVscy9zZWNvbmRcbiAgICB0aGlzLkFDQ0VMRVJBVElPTiA9IDE5NjAgLy8gcGl4ZWxzL3NlY29uZC9zZWNvbmRcbiAgICB0aGlzLkRSQUcgPSAxNTAwIC8vIHBpeGVscy9zZWNvbmRcbiAgICB0aGlzLkdSQVZJVFkgPSAxOTAwIC8vIHBpeGVscy9zZWNvbmQvc2Vjb25kXG4gICAgdGhpcy5KVU1QX1NQRUVEID0gLTg1MCAvLyBwaXhlbHMvc2Vjb25kIChuZWdhdGl2ZSB5IGlzIHVwKVxuXG4gICAgdGhpcy5zb2NrZXQgPSBpby5jb25uZWN0KClcbiAgICB0aGlzLmVuZW1pZXMgPSBbXVxuXG5cbiAgICAvLyAgV2UncmUgZ29pbmcgdG8gYmUgdXNpbmcgcGh5c2ljcywgc28gZW5hYmxlIHRoZSBBcmNhZGUgUGh5c2ljcyBzeXN0ZW1cbiAgICB0aGlzLnBoeXNpY3Muc3RhcnRTeXN0ZW0oUGhhc2VyLlBoeXNpY3MuQVJDQURFKVxuXG4gICAgdGhpcy53b3JsZC5zZXRCb3VuZHMoMCwgMCwgd29ybGRXaWR0aCwgd29ybGRIZWlnaHQpXG4gICAgdGhpcy5nYW1lLnN0YWdlLmJhY2tncm91bmRDb2xvciA9IFwiIzJGOTFEMFwiXG5cbiAgICAvLyBTY2FsZSBnYW1lIG9uIHdpbmRvdyByZXNpemVcbiAgICB0aGlzLmdhbWUuc2NhbGUuc2NhbGVNb2RlID0gUGhhc2VyLlNjYWxlTWFuYWdlci5SRVNJWkVcbiAgICB0aGlzLmdhbWUuc2NhbGUuc2V0U2hvd0FsbCgpXG4gICAgdGhpcy5nYW1lLnNjYWxlLnJlZnJlc2goKVxuXG5cbiAgICAvKipcbiAgICAgKiBNYXBcbiAgICAgKi9cbiAgICBGb3Jlc3RDdGYuY3JlYXRlLmNhbGwodGhpcylcblxuICAgIC8qKlxuICAgICAqIFBsYXllciBTZXR0aW5nc1xuICAgICAqL1xuICAgIGxldCBzcGF3blBvaW50ID0gRm9yZXN0Q3RmLmdldFJhbmRvbVNwYXduUG9pbnQuY2FsbCh0aGlzKVxuICAgIHRoaXMucGxheWVyID0gdGhpcy5hZGQuc3ByaXRlKHNwYXduUG9pbnQueCwgc3Bhd25Qb2ludC55LCAnZHVkZScpXG5cbiAgICAvLyAgV2UgbmVlZCB0byBlbmFibGUgcGh5c2ljcyBvbiB0aGUgcGxheWVyXG4gICAgdGhpcy5waHlzaWNzLmFyY2FkZS5lbmFibGUodGhpcy5wbGF5ZXIpXG5cbiAgICAvLyBFbmFibGUgcGh5c2ljcyBvbiB0aGUgcGxheWVyXG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuZW5hYmxlKHRoaXMucGxheWVyLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpXG5cbiAgICAvLyBNYWtlIHBsYXllciBjb2xsaWRlIHdpdGggd29ybGQgYm91bmRhcmllcyBzbyBoZSBkb2Vzbid0IGxlYXZlIHRoZSBzdGFnZVxuICAgIHRoaXMucGxheWVyLmJvZHkuY29sbGlkZVdvcmxkQm91bmRzID0gdHJ1ZVxuXG4gICAgLy8gU2V0IHBsYXllciBtaW5pbXVtIGFuZCBtYXhpbXVtIG1vdmVtZW50IHNwZWVkXG4gICAgdGhpcy5wbGF5ZXIuYm9keS5tYXhWZWxvY2l0eS5zZXRUbyh0aGlzLk1BWF9TUEVFRCwgdGhpcy5NQVhfU1BFRUQgKiAxMCkgLy8geCwgeVxuXG4gICAgLy8gQWRkIGRyYWcgdG8gdGhlIHBsYXllciB0aGF0IHNsb3dzIHRoZW0gZG93biB3aGVuIHRoZXkgYXJlIG5vdCBhY2NlbGVyYXRpbmdcbiAgICB0aGlzLnBsYXllci5ib2R5LmRyYWcuc2V0VG8odGhpcy5EUkFHLCAwKSAvLyB4LCB5XG4gICAgdGhpcy5wbGF5ZXIubWV0YSA9IHtcbiAgICAgICAgaGVhbHRoOiAxMDBcbiAgICB9XG5cbiAgICAvLyBTaW5jZSB3ZSdyZSBqdW1waW5nIHdlIG5lZWQgZ3Jhdml0eVxuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5ncmF2aXR5LnkgPSB0aGlzLkdSQVZJVFlcblxuICAgIC8vIEZsYWcgdG8gdHJhY2sgaWYgdGhlIGp1bXAgYnV0dG9uIGlzIHByZXNzZWRcbiAgICB0aGlzLmp1bXBpbmcgPSBmYWxzZVxuXG4gICAgLy8gIE91ciB0d28gYW5pbWF0aW9ucywgd2Fsa2luZyBsZWZ0IGFuZCByaWdodC5cbiAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLmFkZCgnbGVmdCcsIFswLCAxLCAyLCAzXSwgMTAsIHRydWUpXG4gICAgdGhpcy5wbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ3JpZ2h0JywgWzUsIDYsIDcsIDhdLCAxMCwgdHJ1ZSlcblxuICAgIHRoaXMucGxheWVyLm1ldGEgPSB7XG4gICAgICAgIGhlYWx0aDogMTAwXG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBXZWFwb25zXG4gICAgICovXG4gICAgdGhpcy5jdXJyZW50V2VhcG9uID0gMFxuICAgIHRoaXMud2VhcG9ucyA9IFtcbiAgICAgICAgbmV3IFdlYXBvbnMuQUs0Nyh7XG4gICAgICAgICAgICBnYW1lOiB0aGlzLmdhbWVcbiAgICAgICAgfSksXG4gICAgICAgIG5ldyBXZWFwb25zLkJhcnJldE05MCh7XG4gICAgICAgICAgICBnYW1lOiB0aGlzLmdhbWVcbiAgICAgICAgfSksXG4gICAgICAgIG5ldyBXZWFwb25zLkRlc2VydEVhZ2xlKHtcbiAgICAgICAgICAgIGdhbWU6IHRoaXMuZ2FtZVxuICAgICAgICB9KSxcbiAgICAgICAgbmV3IFdlYXBvbnMuTTRBMSh7XG4gICAgICAgICAgICBnYW1lOiB0aGlzLmdhbWVcbiAgICAgICAgfSksXG4gICAgICAgIC8vIG5ldyBXZWFwb25zLk03OSh7XG4gICAgICAgIC8vICAgICBnYW1lOiB0aGlzLmdhbWVcbiAgICAgICAgLy8gfSksXG4gICAgICAgIG5ldyBXZWFwb25zLk0yNDkoe1xuICAgICAgICAgICAgZ2FtZTogdGhpcy5nYW1lXG4gICAgICAgIH0pLFxuICAgICAgICBuZXcgV2VhcG9ucy5NUDUoe1xuICAgICAgICAgICAgZ2FtZTogdGhpcy5nYW1lXG4gICAgICAgIH0pLFxuICAgICAgICAvLyBuZXcgV2VhcG9ucy5SUEcoe1xuICAgICAgICAvLyAgICAgZ2FtZTogdGhpcy5nYW1lXG4gICAgICAgIC8vIH0pLFxuICAgICAgICBuZXcgV2VhcG9ucy5TcGFzMTIoe1xuICAgICAgICAgICAgZ2FtZTogdGhpcy5nYW1lXG4gICAgICAgIH0pXG4gICAgXVxuXG5cbiAgICAvKipcbiAgICAgKiBUZXh0XG4gICAgICovXG4gICAgbGV0IHRleHRTdHlsZXMgPSB7IGZvbnRTaXplOiAnMjRweCcsIGZpbGw6ICcjMDAwJyB9XG5cbiAgICB0aGlzLnNjb3JlVGV4dCA9IHRoaXMuYWRkLnRleHQoMjUsIDI1LCAnU2NvcmU6IDAnLCB0ZXh0U3R5bGVzKVxuICAgIHRoaXMuc2NvcmVUZXh0LmZpeGVkVG9DYW1lcmEgPSB0cnVlXG5cbiAgICB0aGlzLndlYXBvblRleHQgPSB0aGlzLmFkZC50ZXh0KHRoaXMuY2FtZXJhLnggKyAxMjAsIHRoaXMuY2FtZXJhLmhlaWdodCAtIDQ1LCAnQUstNDcnLCB0ZXh0U3R5bGVzKVxuICAgIHRoaXMud2VhcG9uVGV4dC5maXhlZFRvQ2FtZXJhID0gdHJ1ZVxuXG4gICAgdGhpcy5oZWFsdGhUZXh0ID0gdGhpcy5hZGQudGV4dCh0aGlzLmNhbWVyYS54ICsgMjUsIHRoaXMuY2FtZXJhLmhlaWdodCAtIDQ1LCB0aGlzLnBsYXllci5tZXRhLmhlYWx0aCwgdGV4dFN0eWxlcylcbiAgICB0aGlzLmhlYWx0aFRleHQuZml4ZWRUb0NhbWVyYSA9IHRydWVcblxuXG4gICAgLyoqXG4gICAgICogQ2FtZXJhIFNldHRpbmdzXG4gICAgICovXG4gICAgdGhpcy5jYW1lcmEuZm9sbG93KHRoaXMucGxheWVyKVxuXG4gICAgbGV0IGNoYW5nZUtleSA9IHRoaXMuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5FTlRFUilcbiAgICBjaGFuZ2VLZXkub25Eb3duLmFkZCh0aGlzLm5leHRXZWFwb24sIHRoaXMpXG5cblxuICAgIC8qKlxuICAgICAqIFJlc2l6aW5nIEV2ZW50c1xuICAgICAqL1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuZ2FtZS5zY2FsZS5yZWZyZXNoKClcbiAgICAgICAgdGhpcy5nYW1lLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodFxuICAgICAgICB0aGlzLmdhbWUud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aFxuXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5oZWFsdGhUZXh0LmNhbWVyYU9mZnNldC55ID0gdGhpcy5jYW1lcmEuaGVpZ2h0IC0gNDVcbiAgICAgICAgICAgIHRoaXMud2VhcG9uVGV4dC5jYW1lcmFPZmZzZXQueSA9IHRoaXMuY2FtZXJhLmhlaWdodCAtIDQ1XG5cbiAgICAgICAgICAgIHRoaXMuc2NvcmVUZXh0LmNhbWVyYU9mZnNldC54ID0gMjVcbiAgICAgICAgICAgIHRoaXMuc2NvcmVUZXh0LmNhbWVyYU9mZnNldC55ID0gMjVcbiAgICAgICAgfSwgMjAwKVxuICAgIH0pXG5cblxuICAgIC8qKlxuICAgICAqIEVuZW15IEJ1bGxldHNcbiAgICAgKi9cbiAgICB0aGlzLmVuZW15QnVsbGV0cyA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKVxuXG5cbiAgICAvKipcbiAgICAgKiBTdGFydCBsaXN0ZW5pbmcgZm9yIGV2ZW50c1xuICAgICAqL1xuICAgIHRoaXMuc2V0RXZlbnRIYW5kbGVycygpXG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgY3JlYXRlOiByZXF1aXJlKCcuL2NyZWF0ZScpLFxuICAgIGluaXQ6IHJlcXVpcmUoJy4vaW5pdCcpLFxuICAgIHByZWxvYWQ6IHJlcXVpcmUoJy4vcHJlbG9hZCcpLFxuICAgIHVwZGF0ZTogcmVxdWlyZSgnLi91cGRhdGUnKVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5nYW1lLnJlbmRlcmVyLnJlbmRlclNlc3Npb24ucm91bmRQaXhlbHMgPSB0cnVlXG4gICAgdGhpcy5nYW1lLnN0YWdlLmRpc2FibGVWaXNpYmlsaXR5Q2hhbmdlID0gdHJ1ZVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5sb2FkLmltYWdlKCd0cmVlc2NhcGUnLCAnL2ltYWdlcy9tYXAtY3RmMS5wbmcnKVxuICAgIHRoaXMubG9hZC5pbWFnZSgnZ3JvdW5kJywgJy9pbWFnZXMvcGxhdGZvcm0ucG5nJylcbiAgICB0aGlzLmxvYWQuaW1hZ2UoJ2J1bGxldDEyJywgJy9pbWFnZXMvYnVsbGV0MTIucG5nJylcblxuICAgIHRoaXMubG9hZC5zcHJpdGVzaGVldCgnZHVkZScsICcvaW1hZ2VzL2R1ZGUucG5nJywgMzIsIDQ4KVxuICAgIHRoaXMubG9hZC5zcHJpdGVzaGVldCgnZW5lbXknLCAnL2ltYWdlcy9kdWRlLnBuZycsIDMyLCA0OClcblxuICAgIHRoaXMubG9hZC5hdWRpbygnQUs0Ny1zb3VuZCcsICcvYXVkaW8vQUs0Ny5vZ2cnKVxuICAgIHRoaXMubG9hZC5hdWRpbygnQmFycmV0TTkwLXNvdW5kJywgJy9hdWRpby9CYXJyZXRNOTAub2dnJylcbiAgICB0aGlzLmxvYWQuYXVkaW8oJ00yNDktc291bmQnLCAnL2F1ZGlvL00yNDkub2dnJylcbiAgICB0aGlzLmxvYWQuYXVkaW8oJ01QNS1zb3VuZCcsICcvYXVkaW8vTVA1Lm9nZycpXG4gICAgdGhpcy5sb2FkLmF1ZGlvKCdEZXNlcnRFYWdsZS1zb3VuZCcsICcvYXVkaW8vRGVzZXJ0RWFnbGUub2dnJylcbiAgICB0aGlzLmxvYWQuYXVkaW8oJ000QTEtc291bmQnLCAnL2F1ZGlvL000QTEub2dnJylcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIENvbGxpZGUgdGhpcyBwbGF5ZXIgd2l0aCB0aGUgbWFwXG4gICAgdGhpcy5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMucGxheWVyLCB0aGlzLnBsYXRmb3JtcywgbnVsbCwgbnVsbCwgdGhpcylcblxuICAgIC8vIERpZCB0aGlzIHBsYXllcidzIGJ1bGxldHMgaGl0IGFueSBwbGF0Zm9ybXNcbiAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5wbGF0Zm9ybXMsIHRoaXMud2VhcG9ucywgKHBsYXRmb3JtLCB3ZWFwb24pID0+IHtcbiAgICAgICAgd2VhcG9uLmtpbGwoKVxuICAgIH0sIG51bGwsIHRoaXMpXG5cbiAgICAvLyBEaWQgZW5lbXkgYnVsbGV0cyBoaXQgYW55IHBsYXRmb3Jtc1xuICAgIHRoaXMucGh5c2ljcy5hcmNhZGUuY29sbGlkZSh0aGlzLnBsYXRmb3JtcywgdGhpcy5lbmVteUJ1bGxldHMsIChwbGF0Zm9ybSwgYnVsbGV0KSA9PiB7XG4gICAgICAgIGJ1bGxldC5raWxsKClcbiAgICB9LCBudWxsLCB0aGlzKVxuXG4gICAgLy8gRGlkIHRoaXMgcGxheWVyIGdldCBoaXQgYnkgYW55IGVuZW15IGJ1bGxldHNcbiAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5wbGF5ZXIsIHRoaXMuZW5lbXlCdWxsZXRzLCBudWxsLCAocGxheWVyLCBidWxsZXQpID0+IHtcbiAgICAgICAgYnVsbGV0LmtpbGwoKVxuXG4gICAgICAgIGNvbnNvbGUubG9nKCdZb3Ugd2VyZSBoaXQgYnknLCBidWxsZXQuYnVsbGV0SWQpXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ2J1bGxldCByZW1vdmVkJywge1xuICAgICAgICAgICAgcm9vbUlkOiB0aGlzLnJvb21JZCxcbiAgICAgICAgICAgIGJ1bGxldElkOiBidWxsZXQuYnVsbGV0SWRcbiAgICAgICAgfSlcblxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdwbGF5ZXIgZGFtYWdlZCcsIHtcbiAgICAgICAgICAgIHJvb21JZDogdGhpcy5yb29tSWQsXG4gICAgICAgICAgICBkYW1hZ2U6IGJ1bGxldC5kYW1hZ2UsXG4gICAgICAgICAgICBkYW1hZ2VkUGxheWVySWQ6ICcvIycgKyB0aGlzLnNvY2tldC5pZCxcbiAgICAgICAgICAgIGF0dGFja2luZ1BsYXllcklkOiBidWxsZXQucGxheWVySWRcbiAgICAgICAgfSlcblxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICB9LCB0aGlzKVxuXG4gICAgaWYgKHRoaXMubGVmdElucHV0SXNBY3RpdmUoKSkge1xuICAgICAgICAvLyBJZiB0aGUgTEVGVCBrZXkgaXMgZG93biwgc2V0IHRoZSBwbGF5ZXIgdmVsb2NpdHkgdG8gbW92ZSBsZWZ0XG4gICAgICAgIHRoaXMucGxheWVyLmJvZHkuYWNjZWxlcmF0aW9uLnggPSAtdGhpcy5BQ0NFTEVSQVRJT05cbiAgICAgICAgdGhpcy5wbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdsZWZ0JylcbiAgICB9IGVsc2UgaWYgKHRoaXMucmlnaHRJbnB1dElzQWN0aXZlKCkpIHtcbiAgICAgICAgLy8gSWYgdGhlIFJJR0hUIGtleSBpcyBkb3duLCBzZXQgdGhlIHBsYXllciB2ZWxvY2l0eSB0byBtb3ZlIHJpZ2h0XG4gICAgICAgIHRoaXMucGxheWVyLmJvZHkuYWNjZWxlcmF0aW9uLnggPSB0aGlzLkFDQ0VMRVJBVElPTlxuICAgICAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLnBsYXkoJ3JpZ2h0JylcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBTdGFuZCBzdGlsbFxuICAgICAgICB0aGlzLnBsYXllci5ib2R5LmFjY2VsZXJhdGlvbi54ID0gMFxuICAgICAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLnN0b3AoKVxuICAgICAgICB0aGlzLnBsYXllci5mcmFtZSA9IDRcbiAgICB9XG5cbiAgICAvLyBTZXQgYSB2YXJpYWJsZSB0aGF0IGlzIHRydWUgd2hlbiB0aGUgcGxheWVyIGlzIHRvdWNoaW5nIHRoZSBncm91bmRcbiAgICBsZXQgb25UaGVHcm91bmQgPSB0aGlzLnBsYXllci5ib2R5LnRvdWNoaW5nLmRvd25cblxuICAgIC8vIElmIHRoZSBwbGF5ZXIgaXMgdG91Y2hpbmcgdGhlIGdyb3VuZCwgbGV0IGhpbSBoYXZlIDIganVtcHNcbiAgICBpZiAob25UaGVHcm91bmQpIHtcbiAgICAgICAgdGhpcy5qdW1wcyA9IDJcbiAgICAgICAgdGhpcy5qdW1waW5nID0gZmFsc2VcbiAgICB9XG5cbiAgICAvLyBKdW1wIVxuICAgIGlmICh0aGlzLmp1bXBzID4gMCAmJiB0aGlzLnVwSW5wdXRJc0FjdGl2ZSg1KSkge1xuICAgICAgICB0aGlzLnBsYXllci5ib2R5LnZlbG9jaXR5LnkgPSB0aGlzLkpVTVBfU1BFRURcbiAgICAgICAgdGhpcy5qdW1waW5nID0gdHJ1ZVxuICAgIH1cblxuICAgIC8vIFJlZHVjZSB0aGUgbnVtYmVyIG9mIGF2YWlsYWJsZSBqdW1wcyBpZiB0aGUganVtcCBpbnB1dCBpcyByZWxlYXNlZFxuICAgIGlmICh0aGlzLmp1bXBpbmcgJiYgdGhpcy51cElucHV0UmVsZWFzZWQoKSkge1xuICAgICAgICB0aGlzLmp1bXBzLS1cbiAgICAgICAgdGhpcy5qdW1waW5nID0gZmFsc2VcbiAgICB9XG5cbiAgICBpZiAodGhpcy5nYW1lLmlucHV0LmFjdGl2ZVBvaW50ZXIuaXNEb3duKVxuICAgIHtcbiAgICAgICAgdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0uZmlyZSh0aGlzLnBsYXllciwgdGhpcy5zb2NrZXQsIHRoaXMucm9vbUlkKVxuICAgIH1cblxuICAgIHRoaXMuc29ja2V0LmVtaXQoJ21vdmUgcGxheWVyJywge1xuICAgICAgICByb29tSWQ6IHRoaXMucm9vbUlkLFxuICAgICAgICB4OiB0aGlzLnBsYXllci54LFxuICAgICAgICB5OiB0aGlzLnBsYXllci55XG4gICAgfSlcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgR3VpZCA9IHJlcXVpcmUoJy4vR3VpZCcpXG5cbnZhciBCdWxsZXQgPSBmdW5jdGlvbiAoZ2FtZSwga2V5KSB7XG4gICAgUGhhc2VyLlNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIDAsIDAsIGtleSlcbiAgICB0aGlzLnRleHR1cmUuYmFzZVRleHR1cmUuc2NhbGVNb2RlID0gUElYSS5zY2FsZU1vZGVzLk5FQVJFU1RcbiAgICB0aGlzLmFuY2hvci5zZXQoMC41KVxuICAgIHRoaXMuY2hlY2tXb3JsZEJvdW5kcyA9IHRydWVcbiAgICB0aGlzLm91dE9mQm91bmRzS2lsbCA9IHRydWVcbiAgICB0aGlzLmV4aXN0cyA9IGZhbHNlXG4gICAgdGhpcy50cmFja2luZyA9IGZhbHNlXG4gICAgdGhpcy5zY2FsZVNwZWVkID0gMFxufVxuXG5CdWxsZXQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSlcbkJ1bGxldC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBCdWxsZXRcblxuQnVsbGV0LnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24gKHgsIHksIGFuZ2xlLCBzcGVlZCwgZ3gsIGd5LCBzb2NrZXQsIHJvb21JZCkge1xuICAgIHRoaXMucmVzZXQoeCwgeSlcblxuICAgIGxldCBwb2ludGVyQW5nbGUgPSB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUubW92ZVRvUG9pbnRlcih0aGlzLCBzcGVlZClcbiAgICB0aGlzLmJvZHkuZ3Jhdml0eS55ID0gLTE4MDBcblxuICAgIGNvbnNvbGUubG9nKCdGaXJpbmcgYnVsbGV0IGxvY2FsbHknLCB0aGlzLmJ1bGxldElkKVxuXG4gICAgc29ja2V0LmVtaXQoJ2J1bGxldCBmaXJlZCcsIHtcbiAgICAgICAgcm9vbUlkOiByb29tSWQsXG4gICAgICAgIGJ1bGxldElkOiB0aGlzLmJ1bGxldElkLFxuICAgICAgICBwbGF5ZXJJZDogJy8jJyArIHNvY2tldC5pZCxcbiAgICAgICAgeCxcbiAgICAgICAgeSxcbiAgICAgICAgYW5nbGUsXG4gICAgICAgIHNwZWVkLFxuICAgICAgICBneCxcbiAgICAgICAgZ3ksXG4gICAgICAgIHBvaW50ZXJBbmdsZSxcbiAgICAgICAgaGVpZ2h0OiB0aGlzLmhlaWdodCxcbiAgICAgICAgd2lkdGg6IHRoaXMud2lkdGgsXG4gICAgICAgIGRhbWFnZTogdGhpcy5kYW1hZ2VcbiAgICB9KVxufVxuXG5CdWxsZXQucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy50cmFja2luZykge1xuICAgICAgICB0aGlzLnJvdGF0aW9uID0gTWF0aC5hdGFuMih0aGlzLmJvZHkudmVsb2NpdHkueSwgdGhpcy5ib2R5LnZlbG9jaXR5LngpXG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1bGxldFxuIiwiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ3VpZEdlbmVyYXRvcigpIHtcbiAgICB2YXIgUzQgPSBmdW5jdGlvbigpIHtcbiAgICAgICByZXR1cm4gKCgoMStNYXRoLnJhbmRvbSgpKSoweDEwMDAwKXwwKS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpXG4gICAgfVxuXG4gICAgcmV0dXJuIChTNCgpK1M0KCkrXCItXCIrUzQoKStcIi1cIitTNCgpK1wiLVwiK1M0KCkrXCItXCIrUzQoKStTNCgpK1M0KCkpXG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgLy8gVGhpcyBmdW5jdGlvbiBzaG91bGQgcmV0dXJuIHRydWUgd2hlbiB0aGUgcGxheWVyIGFjdGl2YXRlcyB0aGUgXCJnbyBsZWZ0XCIgY29udHJvbFxuICAgIC8vIEluIHRoaXMgY2FzZSwgZWl0aGVyIGhvbGRpbmcgdGhlIHJpZ2h0IGFycm93IG9yIHRhcHBpbmcgb3IgY2xpY2tpbmcgb24gdGhlIGxlZnRcbiAgICAvLyBzaWRlIG9mIHRoZSBzY3JlZW4uXG4gICAgbGVmdElucHV0SXNBY3RpdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnB1dC5rZXlib2FyZC5pc0Rvd24oUGhhc2VyLktleWJvYXJkLkEpXG4gICAgfSxcblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gc2hvdWxkIHJldHVybiB0cnVlIHdoZW4gdGhlIHBsYXllciBhY3RpdmF0ZXMgdGhlIFwiZ28gcmlnaHRcIiBjb250cm9sXG4gICAgLy8gSW4gdGhpcyBjYXNlLCBlaXRoZXIgaG9sZGluZyB0aGUgcmlnaHQgYXJyb3cgb3IgdGFwcGluZyBvciBjbGlja2luZyBvbiB0aGUgcmlnaHRcbiAgICAvLyBzaWRlIG9mIHRoZSBzY3JlZW4uXG4gICAgcmlnaHRJbnB1dElzQWN0aXZlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5wdXQua2V5Ym9hcmQuaXNEb3duKFBoYXNlci5LZXlib2FyZC5EKVxuICAgIH0sXG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIHNob3VsZCByZXR1cm4gdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgYWN0aXZhdGVzIHRoZSBcImp1bXBcIiBjb250cm9sXG4gICAgLy8gSW4gdGhpcyBjYXNlLCBlaXRoZXIgaG9sZGluZyB0aGUgdXAgYXJyb3cgb3IgdGFwcGluZyBvciBjbGlja2luZyBvbiB0aGUgY2VudGVyXG4gICAgLy8gcGFydCBvZiB0aGUgc2NyZWVuLlxuICAgIHVwSW5wdXRJc0FjdGl2ZTogZnVuY3Rpb24oZHVyYXRpb24pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5wdXQua2V5Ym9hcmQuZG93bkR1cmF0aW9uKFBoYXNlci5LZXlib2FyZC5XLCBkdXJhdGlvbilcbiAgICB9LFxuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiByZXR1cm5zIHRydWUgd2hlbiB0aGUgcGxheWVyIHJlbGVhc2VzIHRoZSBcImp1bXBcIiBjb250cm9sXG4gICAgdXBJbnB1dFJlbGVhc2VkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5wdXQua2V5Ym9hcmQudXBEdXJhdGlvbihQaGFzZXIuS2V5Ym9hcmQuVylcbiAgICB9XG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpZCkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5lbmVtaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICh0aGlzLmVuZW1pZXNbaV0ucGxheWVyLmlkID09PSBpZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZW5lbWllc1tpXVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IFJlbW90ZVBsYXllciA9IGZ1bmN0aW9uKGlkLCBnYW1lLCBwbGF5ZXIsIHN0YXJ0WCwgc3RhcnRZKSB7XG4gICAgbGV0IG5ld1JlbW90ZVBsYXllciA9IHtcbiAgICAgICAgeDogc3RhcnRYLFxuICAgICAgICB5OiBzdGFydFksXG4gICAgICAgIGlkOiBudWxsLFxuICAgICAgICBnYW1lOiBnYW1lLFxuICAgICAgICBoZWFsdGg6IDEwMCxcbiAgICAgICAgcGxheWVyOiBwbGF5ZXIsXG4gICAgICAgIGFsaXZlOiB0cnVlLFxuICAgICAgICBsYXN0UG9zaXRpb246IHtcbiAgICAgICAgICAgIHg6IHN0YXJ0WCxcbiAgICAgICAgICAgIHk6IHN0YXJ0WVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIHRoZSBwbGF5ZXIncyBlbmVteSBzcHJpdGVcbiAgICBuZXdSZW1vdGVQbGF5ZXIucGxheWVyID0gZ2FtZS5hZGQuc3ByaXRlKHN0YXJ0WCwgc3RhcnRZLCAnZW5lbXknKVxuXG4gICAgLy8gIFdlIG5lZWQgdG8gZW5hYmxlIHBoeXNpY3Mgb24gdGhlIHBsYXllclxuICAgIC8vIHRoaXMucGh5c2ljcy5hcmNhZGUuZW5hYmxlKG5ld1JlbW90ZVBsYXllci5wbGF5ZXIpXG5cbiAgICAvLyAvLyBFbmFibGUgcGh5c2ljcyBvbiB0aGUgcGxheWVyXG4gICAgLy8gdGhpcy5nYW1lLnBoeXNpY3MuZW5hYmxlKG5ld1JlbW90ZVBsYXllci5wbGF5ZXIsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSlcblxuICAgIC8vIE1ha2UgcGxheWVyIGNvbGxpZGUgd2l0aCB3b3JsZCBib3VuZGFyaWVzIHNvIGhlIGRvZXNuJ3QgbGVhdmUgdGhlIHN0YWdlXG4gICAgLy8gbmV3UmVtb3RlUGxheWVyLnBsYXllci5ib2R5LmNvbGxpZGVXb3JsZEJvdW5kcyA9IHRydWVcblxuICAgIC8vIE91ciB0d28gYW5pbWF0aW9ucywgd2Fsa2luZyBsZWZ0IGFuZCByaWdodC5cbiAgICBuZXdSZW1vdGVQbGF5ZXIucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdsZWZ0JywgWzAsIDEsIDIsIDNdLCAxMCwgdHJ1ZSlcbiAgICBuZXdSZW1vdGVQbGF5ZXIucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdyaWdodCcsIFs1LCA2LCA3LCA4XSwgMTAsIHRydWUpXG5cbiAgICBuZXdSZW1vdGVQbGF5ZXIucGxheWVyLmlkID0gaWRcblxuICAgIHJldHVybiBuZXdSZW1vdGVQbGF5ZXJcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBSZW1vdGVQbGF5ZXJcbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBzZXRFdmVudEhhbmRsZXJzOiByZXF1aXJlKCcuL3NldEV2ZW50SGFuZGxlcnMnKSxcblxuICAgIG9uU29ja2V0Q29ubmVjdGVkOiByZXF1aXJlKCcuL29uU29ja2V0Q29ubmVjdGVkJyksXG4gICAgb25Tb2NrZXREaXNjb25uZWN0OiByZXF1aXJlKCcuL29uU29ja2V0RGlzY29ubmVjdCcpLFxuXG4gICAgb25Nb3ZlUGxheWVyOiByZXF1aXJlKCcuL29uTW92ZVBsYXllcicpLFxuICAgIG9uUmVtb3ZlUGxheWVyOiByZXF1aXJlKCcuL29uUmVtb3ZlUGxheWVyJyksXG4gICAgb25VcGRhdGVQbGF5ZXJzOiByZXF1aXJlKCcuL29uVXBkYXRlUGxheWVycycpLFxuXG4gICAgb25QbGF5ZXJEYW1hZ2VkOiByZXF1aXJlKCcuL29uUGxheWVyRGFtYWdlZCcpLFxuICAgIG9uUGxheWVyUmVzcGF3bjogcmVxdWlyZSgnLi9vblBsYXllclJlc3Bhd24nKSxcblxuICAgIG9uQnVsbGV0RmlyZWQ6IHJlcXVpcmUoJy4vb25CdWxsZXRGaXJlZCcpLFxuICAgIG9uQnVsbGV0UmVtb3ZlZDogcmVxdWlyZSgnLi9vbkJ1bGxldFJlbW92ZWQnKVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBCdWxsZXQgPSByZXF1aXJlKCcuLi9CdWxsZXQnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBpZiAoZGF0YS5pZCA9PT0gKCcvIycgKyB0aGlzLnNvY2tldC5pZCkpXG4gICAgICAgIHJldHVyblxuXG4gICAgY29uc29sZS5sb2coJ0ZpcmluZyBidWxsZXQgcmVtb3RlbHknLCBkYXRhLmJ1bGxldElkKVxuXG4gICAgbGV0IG5ld0VuZW15QnVsbGV0ID0gdGhpcy5lbmVteUJ1bGxldHMuY3JlYXRlKGRhdGEueCwgZGF0YS55LCAnYnVsbGV0MTInKVxuICAgIG5ld0VuZW15QnVsbGV0LmJ1bGxldElkID0gZGF0YS5idWxsZXRJZFxuICAgIG5ld0VuZW15QnVsbGV0LnBsYXllcklkID0gZGF0YS5wbGF5ZXJJZFxuICAgIG5ld0VuZW15QnVsbGV0LmRhbWFnZSA9IGRhdGEuZGFtYWdlXG4gICAgbmV3RW5lbXlCdWxsZXQucm90YXRpb24gPSBkYXRhLnBvaW50ZXJBbmdsZVxuICAgIG5ld0VuZW15QnVsbGV0LmhlaWdodCA9IGRhdGEuaGVpZ2h0XG4gICAgbmV3RW5lbXlCdWxsZXQud2lkdGggPSBkYXRhLndpZHRoXG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuZW5hYmxlKG5ld0VuZW15QnVsbGV0LCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpXG4gICAgbmV3RW5lbXlCdWxsZXQuYm9keS5ncmF2aXR5LnkgPSAtMTgwMFxuXG4gICAgbGV0IG5ld1ZlbG9jaXR5ID0gdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLnZlbG9jaXR5RnJvbVJvdGF0aW9uKGRhdGEucG9pbnRlckFuZ2xlLCBkYXRhLnNwZWVkKVxuICAgIG5ld0VuZW15QnVsbGV0LmJvZHkudmVsb2NpdHkueCArPSBuZXdWZWxvY2l0eS54XG4gICAgbmV3RW5lbXlCdWxsZXQuYm9keS52ZWxvY2l0eS55ICs9IG5ld1ZlbG9jaXR5Lnlcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBpZiAoZGF0YS5pZCA9PT0gKCcvIycgKyB0aGlzLnNvY2tldC5pZCkpXG4gICAgICAgIHJldHVyblxuXG4gICAgY29uc29sZS5sb2coJ1JlbW92aW5nIGJ1bGxldCcsIGRhdGEuYnVsbGV0SWQpXG5cbiAgICBsZXQgcmVtb3ZlQnVsbGV0ID0gXy5maW5kKHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLmNoaWxkcmVuLCB7XG4gICAgICAgIGJ1bGxldElkOiBkYXRhLmJ1bGxldElkXG4gICAgfSlcblxuICAgIGlmICghcmVtb3ZlQnVsbGV0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdCdWxsZXQgbm90IGZvdW5kOiAnLCBkYXRhLmJ1bGxldElkKVxuICAgICAgICByZXR1cm5cbiAgICB9XG5cbiAgICByZW1vdmVCdWxsZXQua2lsbCgpXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IFBsYXllckJ5SWQgPSByZXF1aXJlKCcuLi9QbGF5ZXJCeUlkJylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgbGV0IG1vdmVQbGF5ZXIgPSBQbGF5ZXJCeUlkLmNhbGwodGhpcywgZGF0YS5pZClcblxuICAgIC8vIFBsYXllciBub3QgZm91bmRcbiAgICBpZiAoISBtb3ZlUGxheWVyKSB7XG4gICAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIFVwZGF0ZSBwbGF5ZXIgcG9zaXRpb25cbiAgICBtb3ZlUGxheWVyLnBsYXllci54ID0gZGF0YS54XG4gICAgbW92ZVBsYXllci5wbGF5ZXIueSA9IGRhdGEueVxuXG4gICAgaWYgKG1vdmVQbGF5ZXIucGxheWVyLnggPiBtb3ZlUGxheWVyLmxhc3RQb3NpdGlvbi54KSB7XG4gICAgICAgIG1vdmVQbGF5ZXIucGxheWVyLmFuaW1hdGlvbnMucGxheSgncmlnaHQnKVxuICAgIH1cbiAgICBlbHNlIGlmIChtb3ZlUGxheWVyLnBsYXllci54IDwgbW92ZVBsYXllci5sYXN0UG9zaXRpb24ueClcbiAgICB7XG4gICAgICAgIG1vdmVQbGF5ZXIucGxheWVyLmFuaW1hdGlvbnMucGxheSgnbGVmdCcpXG4gICAgfVxuICAgIGVsc2VcbiAgICB7XG4gICAgICAgIG1vdmVQbGF5ZXIucGxheWVyLmFuaW1hdGlvbnMuc3RvcCgpXG4gICAgICAgIG1vdmVQbGF5ZXIucGxheWVyLmZyYW1lID0gNFxuICAgIH1cblxuICAgIG1vdmVQbGF5ZXIubGFzdFBvc2l0aW9uLnggPSBtb3ZlUGxheWVyLnBsYXllci54XG4gICAgbW92ZVBsYXllci5sYXN0UG9zaXRpb24ueSA9IG1vdmVQbGF5ZXIucGxheWVyLnlcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBpZiAoZGF0YS5kYW1hZ2VkUGxheWVySWQgIT09ICgnLyMnICsgdGhpcy5zb2NrZXQuaWQpKVxuICAgICAgICByZXR1cm5cblxuICAgIHRoaXMucGxheWVyLm1ldGEuaGVhbHRoID0gZGF0YS5oZWFsdGhcbiAgICB0aGlzLmhlYWx0aFRleHQudGV4dCA9IHRoaXMucGxheWVyLm1ldGEuaGVhbHRoXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IEZvcmVzdEN0ZiA9IHJlcXVpcmUoJy4uLy4uL21hcHMvRm9yZXN0Q3RmJylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgaWYgKGRhdGEuZGFtYWdlZFBsYXllcklkICE9PSAoJy8jJyArIHRoaXMuc29ja2V0LmlkKSlcbiAgICAgICAgcmV0dXJuXG5cbiAgICB0aGlzLnBsYXllci5tZXRhLmhlYWx0aCA9IGRhdGEuaGVhbHRoXG4gICAgdGhpcy5oZWFsdGhUZXh0LnRleHQgPSB0aGlzLnBsYXllci5tZXRhLmhlYWx0aFxuXG4gICAgbGV0IHNwYXduUG9pbnQgPSBGb3Jlc3RDdGYuZ2V0UmFuZG9tU3Bhd25Qb2ludC5jYWxsKHRoaXMpXG4gICAgdGhpcy5wbGF5ZXIueCA9IHNwYXduUG9pbnQueFxuICAgIHRoaXMucGxheWVyLnkgPSBzcGF3blBvaW50Lnlcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgUGxheWVyQnlJZCA9IHJlcXVpcmUoJy4uL1BsYXllckJ5SWQnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBsZXQgcmVtb3ZlUGxheWVyID0gUGxheWVyQnlJZC5jYWxsKHRoaXMsIGRhdGEuaWQpXG5cbiAgICAvLyBQbGF5ZXIgbm90IGZvdW5kXG4gICAgaWYgKCFyZW1vdmVQbGF5ZXIpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1BsYXllciBub3QgZm91bmQ6ICcsIGRhdGEuaWQpXG4gICAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHJlbW92ZVBsYXllci5wbGF5ZXIua2lsbCgpXG5cbiAgICAvLyBSZW1vdmUgcGxheWVyIGZyb20gYXJyYXlcbiAgICB0aGlzLmVuZW1pZXMuc3BsaWNlKHRoaXMuZW5lbWllcy5pbmRleE9mKHJlbW92ZVBsYXllciksIDEpXG59XG4iLCIndXNlIHN0cmljdCdcblxudmFyIGdldFF1ZXJ5U3RyaW5nID0gZnVuY3Rpb24gKCBmaWVsZCwgdXJsICkge1xuICAgIHZhciBocmVmID0gdXJsID8gdXJsIDogd2luZG93LmxvY2F0aW9uLmhyZWY7XG4gICAgdmFyIHJlZyA9IG5ldyBSZWdFeHAoICdbPyZdJyArIGZpZWxkICsgJz0oW14mI10qKScsICdpJyApO1xuICAgIHZhciBzdHJpbmcgPSByZWcuZXhlYyhocmVmKTtcbiAgICByZXR1cm4gc3RyaW5nID8gc3RyaW5nWzFdIDogbnVsbDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coJ0Nvbm5lY3RlZCB0byBzb2NrZXQgc2VydmVyJylcblxuICAgICAvLyBSZXNldCBlbmVtaWVzIG9uIHJlY29ubmVjdFxuICAgIHRoaXMuZW5lbWllcy5mb3JFYWNoKGZ1bmN0aW9uIChlbmVteSkge1xuICAgICAgICBpZiAoZW5lbXkpIGVuZW15LmtpbGwoKVxuICAgIH0pXG5cbiAgICB0aGlzLmVuZW1pZXMgPSBbXVxuXG4gICAgLy8gU2VuZCBsb2NhbCBwbGF5ZXIgZGF0YSB0byB0aGUgZ2FtZSBzZXJ2ZXJcbiAgICB0aGlzLnNvY2tldC5lbWl0KCduZXcgcGxheWVyJywge1xuICAgICAgICByb29tSWQ6IGdldFF1ZXJ5U3RyaW5nKCdyb29tSWQnKSxcbiAgICAgICAgeDogdGhpcy5wbGF5ZXIueCxcbiAgICAgICAgeTogdGhpcy5wbGF5ZXIueVxuICAgIH0pXG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZygnRGlzY29ubmVjdGVkIGZyb20gc29ja2V0IHNlcnZlcicpXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IFJlbW90ZVBsYXllciA9IHJlcXVpcmUoJy4uL1JlbW90ZVBsYXllcicpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIGNvbnNvbGUubG9nKCd1cGRhdGUgcGxheWVycycsIGRhdGEpXG5cbiAgICB0aGlzLnJvb21JZCA9IGRhdGEucm9vbS5pZFxuXG4gICAgbGV0IG5ld3VybCA9IHdpbmRvdy5sb2NhdGlvbi5wcm90b2NvbCArIFwiLy9cIiArIHdpbmRvdy5sb2NhdGlvbi5ob3N0ICsgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lICsgJz9yb29tSWQ9JyArIGRhdGEucm9vbS5pZDtcbiAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUoeyBwYXRoOiBuZXd1cmwgfSwgJycsIG5ld3VybCk7XG5cbiAgICB0aGlzLmVuZW1pZXMuZm9yRWFjaChmdW5jdGlvbiAoZW5lbXkpIHtcbiAgICAgICAgZW5lbXkucGxheWVyLmtpbGwoKVxuICAgIH0pXG5cbiAgICB0aGlzLmVuZW1pZXMgPSBbXVxuXG4gICAgZGF0YS5yb29tLnBsYXllcnMuZm9yRWFjaCgocGxheWVyKSA9PiB7XG4gICAgICAgIGlmIChwbGF5ZXIuaWQgPT09ICgnLyMnICsgdGhpcy5zb2NrZXQuaWQpKSB7XG4gICAgICAgICAgICB0aGlzLnNjb3JlVGV4dC50ZXh0ID0gcGxheWVyLm1ldGEuc2NvcmVcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG5ld1JlbW90ZVBsYXllciA9IFJlbW90ZVBsYXllci5jYWxsKHRoaXMsIHBsYXllci5pZCwgdGhpcy5nYW1lLCB0aGlzLnBsYXllciwgcGxheWVyLngsIHBsYXllci55KVxuICAgICAgICB0aGlzLmVuZW1pZXMucHVzaChuZXdSZW1vdGVQbGF5ZXIpXG4gICAgICAgIHRoaXMuZW5lbWllc1t0aGlzLmVuZW1pZXMubGVuZ3RoIC0gMV0ucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdsZWZ0JywgWzAsIDEsIDIsIDNdLCAxMCwgdHJ1ZSlcbiAgICAgICAgdGhpcy5lbmVtaWVzW3RoaXMuZW5lbWllcy5sZW5ndGggLSAxXS5wbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ3JpZ2h0JywgWzUsIDYsIDcsIDhdLCAxMCwgdHJ1ZSlcbiAgICB9KVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuc29ja2V0Lm9uKCdjb25uZWN0JywgdGhpcy5vblNvY2tldENvbm5lY3RlZC5iaW5kKHRoaXMpKVxuICAgIHRoaXMuc29ja2V0Lm9uKCdkaXNjb25uZWN0JywgdGhpcy5vblNvY2tldERpc2Nvbm5lY3QuYmluZCh0aGlzKSlcblxuICAgIHRoaXMuc29ja2V0Lm9uKCd1cGRhdGUgcGxheWVycycsIHRoaXMub25VcGRhdGVQbGF5ZXJzLmJpbmQodGhpcykpXG4gICAgdGhpcy5zb2NrZXQub24oJ21vdmUgcGxheWVyJywgdGhpcy5vbk1vdmVQbGF5ZXIuYmluZCh0aGlzKSlcbiAgICB0aGlzLnNvY2tldC5vbigncmVtb3ZlIHBsYXllcicsIHRoaXMub25SZW1vdmVQbGF5ZXIuYmluZCh0aGlzKSlcblxuICAgIHRoaXMuc29ja2V0Lm9uKCdwbGF5ZXIgcmVzcGF3bicsIHRoaXMub25QbGF5ZXJSZXNwYXduLmJpbmQodGhpcykpXG4gICAgdGhpcy5zb2NrZXQub24oJ3BsYXllciBkYW1hZ2VkJywgdGhpcy5vblBsYXllckRhbWFnZWQuYmluZCh0aGlzKSlcblxuICAgIHRoaXMuc29ja2V0Lm9uKCdidWxsZXQgZmlyZWQnLCB0aGlzLm9uQnVsbGV0RmlyZWQuYmluZCh0aGlzKSlcbiAgICB0aGlzLnNvY2tldC5vbignYnVsbGV0IHJlbW92ZWQnLCB0aGlzLm9uQnVsbGV0UmVtb3ZlZC5iaW5kKHRoaXMpKVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBCdWxsZXQgPSByZXF1aXJlKCcuLi9CdWxsZXQnKVxubGV0IEd1aWQgPSByZXF1aXJlKCcuLi9HdWlkJylcblxubGV0IEFLNDcgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgY29uZmlnLmdhbWUsIGNvbmZpZy5nYW1lLndvcmxkLCAnQUstNDcnLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcblxuICAgIC8vXHRIZXJlIHdlIHNldC11cCBvdXIgYXVkaW8gc3ByaXRlXG4gICAgdGhpcy5meCA9IGNvbmZpZy5nYW1lLmFkZC5hdWRpbygnQUs0Ny1zb3VuZCcpXG4gICAgdGhpcy5hbGxvd011bHRpcGxlID0gdHJ1ZVxuXG4gICAgdGhpcy5kYW1hZ2UgPSAyMlxuICAgIHRoaXMubmV4dEZpcmUgPSAwXG4gICAgdGhpcy5idWxsZXRTcGVlZCA9IDIzMDBcbiAgICB0aGlzLmZpcmVSYXRlID0gMTYwO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA2NDsgaSsrKVxuICAgIHtcbiAgICAgICAgbGV0IGJ1bGxldCA9IG5ldyBCdWxsZXQoY29uZmlnLmdhbWUsICdidWxsZXQxMicsIGNvbmZpZy5zb2NrZXQpXG4gICAgICAgIGJ1bGxldC5idWxsZXRJZCA9IEd1aWQoKVxuICAgICAgICBidWxsZXQuaGVpZ2h0ID0gMlxuICAgICAgICBidWxsZXQud2lkdGggPSA0MFxuICAgICAgICBidWxsZXQuZGFtYWdlID0gMjJcbiAgICAgICAgdGhpcy5hZGQoYnVsbGV0LCB0cnVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xufVxuXG5BSzQ3LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLkdyb3VwLnByb3RvdHlwZSk7XG5BSzQ3LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEFLNDc7XG5cbkFLNDcucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbihwbGF5ZXIsIHNvY2tldCwgcm9vbUlkKSB7XG4gICAgaWYgKHRoaXMuZ2FtZS50aW1lLnRpbWUgPCB0aGlzLm5leHRGaXJlKVxuICAgICAgICByZXR1cm5cblxuICAgIHZhciB4ID0gcGxheWVyLnggKyAxNTtcbiAgICB2YXIgeSA9IHBsYXllci55ICsgMzA7XG5cbiAgICB0aGlzLmdldEZpcnN0RXhpc3RzKGZhbHNlKS5maXJlKHgsIHksIDAsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDAsIHNvY2tldCwgcm9vbUlkKVxuICAgIHRoaXMuc2V0QWxsKCd0cmFja2luZycsIHRydWUpXG5cbiAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5nYW1lLnRpbWUudGltZSArIHRoaXMuZmlyZVJhdGVcbiAgICB0aGlzLmZ4LnZvbHVtZSA9IC4zXG4gICAgdGhpcy5meC5wbGF5KClcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBSzQ3XG4iLCIndXNlIHN0cmljdCdcblxubGV0IEJ1bGxldCA9IHJlcXVpcmUoJy4uL0J1bGxldCcpXG5sZXQgR3VpZCA9IHJlcXVpcmUoJy4uL0d1aWQnKVxuXG5sZXQgQmFycmV0TTkwID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGNvbmZpZy5nYW1lLCBjb25maWcuZ2FtZS53b3JsZCwgJ0JhcnJldCBNOTAnLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcblxuICAgIC8vXHRIZXJlIHdlIHNldC11cCBvdXIgYXVkaW8gc3ByaXRlXG4gICAgdGhpcy5meCA9IGNvbmZpZy5nYW1lLmFkZC5hdWRpbygnQmFycmV0TTkwLXNvdW5kJylcbiAgICB0aGlzLmFsbG93TXVsdGlwbGUgPSB0cnVlXG5cbiAgICB0aGlzLm5hbWUgPSAnQmFycmV0IE05MCdcbiAgICB0aGlzLmRhbWFnZSA9IDg4XG4gICAgdGhpcy5uZXh0RmlyZSA9IDBcbiAgICB0aGlzLmJ1bGxldFNwZWVkID0gMzQzNVxuXG4gICAgLy8gQmFycmV0TTkwIGZpcmVzIGFib3V0IDYwMCBidWxsZXRzIHBlciBzZWNvbmRcbiAgICB0aGlzLmZpcmVSYXRlID0gMzAwMFxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA2NDsgaSsrKVxuICAgIHtcbiAgICAgICAgbGV0IGJ1bGxldCA9IG5ldyBCdWxsZXQoY29uZmlnLmdhbWUsICdidWxsZXQxMicsIGNvbmZpZy5zb2NrZXQpXG4gICAgICAgIGJ1bGxldC5idWxsZXRJZCA9IEd1aWQoKVxuICAgICAgICBidWxsZXQuaGVpZ2h0ID0gMlxuICAgICAgICBidWxsZXQud2lkdGggPSA0MFxuICAgICAgICBidWxsZXQuZGFtYWdlID0gODhcblxuICAgICAgICB0aGlzLmFkZChidWxsZXQsIHRydWUpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbn1cblxuQmFycmV0TTkwLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLkdyb3VwLnByb3RvdHlwZSk7XG5CYXJyZXRNOTAucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQmFycmV0TTkwO1xuXG5CYXJyZXRNOTAucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbiAocGxheWVyLCBzb2NrZXQsIHJvb21JZCkge1xuICAgIGlmICh0aGlzLmdhbWUudGltZS50aW1lIDwgdGhpcy5uZXh0RmlyZSlcbiAgICAgICAgcmV0dXJuXG5cbiAgICB2YXIgeCA9IHBsYXllci54ICsgMTU7XG4gICAgdmFyIHkgPSBwbGF5ZXIueSArIDMwO1xuXG4gICAgdGhpcy5nZXRGaXJzdEV4aXN0cyhmYWxzZSkuZmlyZSh4LCB5LCAwLCB0aGlzLmJ1bGxldFNwZWVkLCAwLCAwLCBzb2NrZXQsIHJvb21JZClcbiAgICB0aGlzLnNldEFsbCgndHJhY2tpbmcnLCB0cnVlKVxuXG4gICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMuZ2FtZS50aW1lLnRpbWUgKyB0aGlzLmZpcmVSYXRlXG4gICAgdGhpcy5meC52b2x1bWUgPSAuNlxuICAgIHRoaXMuZngucGxheSgpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQmFycmV0TTkwXG4iLCIndXNlIHN0cmljdCdcblxubGV0IEJ1bGxldCA9IHJlcXVpcmUoJy4uL0J1bGxldCcpXG5sZXQgR3VpZCA9IHJlcXVpcmUoJy4uL0d1aWQnKVxuXG5sZXQgQUs0NyA9IGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCBjb25maWcuZ2FtZSwgY29uZmlnLmdhbWUud29ybGQsICdEZXNlcnQgRWFnbGUnLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcblxuICAgIC8vXHRIZXJlIHdlIHNldC11cCBvdXIgYXVkaW8gc3ByaXRlXG4gICAgdGhpcy5meCA9IGNvbmZpZy5nYW1lLmFkZC5hdWRpbygnRGVzZXJ0RWFnbGUtc291bmQnKVxuICAgIHRoaXMuYWxsb3dNdWx0aXBsZSA9IHRydWVcblxuICAgIHRoaXMuZGFtYWdlID0gMzNcbiAgICB0aGlzLm5leHRGaXJlID0gMFxuICAgIHRoaXMuYnVsbGV0U3BlZWQgPSAyMzAwXG4gICAgdGhpcy5maXJlUmF0ZSA9IDI2NztcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNjQ7IGkrKylcbiAgICB7XG4gICAgICAgIGxldCBidWxsZXQgPSBuZXcgQnVsbGV0KGNvbmZpZy5nYW1lLCAnYnVsbGV0MTInLCBjb25maWcuc29ja2V0KVxuICAgICAgICBidWxsZXQuYnVsbGV0SWQgPSBHdWlkKClcbiAgICAgICAgYnVsbGV0LmhlaWdodCA9IDJcbiAgICAgICAgYnVsbGV0LndpZHRoID0gNDBcbiAgICAgICAgYnVsbGV0LmRhbWFnZSA9IDIyXG4gICAgICAgIHRoaXMuYWRkKGJ1bGxldCwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbn1cblxuQUs0Ny5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuQUs0Ny5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBBSzQ3O1xuXG5BSzQ3LnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24ocGxheWVyLCBzb2NrZXQsIHJvb21JZCkge1xuICAgIGlmICh0aGlzLmdhbWUudGltZS50aW1lIDwgdGhpcy5uZXh0RmlyZSlcbiAgICAgICAgcmV0dXJuXG5cbiAgICB2YXIgeCA9IHBsYXllci54ICsgMTU7XG4gICAgdmFyIHkgPSBwbGF5ZXIueSArIDMwO1xuXG4gICAgdGhpcy5nZXRGaXJzdEV4aXN0cyhmYWxzZSkuZmlyZSh4LCB5LCAwLCB0aGlzLmJ1bGxldFNwZWVkLCAwLCAwLCBzb2NrZXQsIHJvb21JZClcbiAgICB0aGlzLnNldEFsbCgndHJhY2tpbmcnLCB0cnVlKVxuXG4gICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMuZ2FtZS50aW1lLnRpbWUgKyB0aGlzLmZpcmVSYXRlXG4gICAgdGhpcy5meC52b2x1bWUgPSAuM1xuICAgIHRoaXMuZngucGxheSgpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQUs0N1xuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBCdWxsZXQgPSByZXF1aXJlKCcuLi9CdWxsZXQnKVxubGV0IEd1aWQgPSByZXF1aXJlKCcuLi9HdWlkJylcblxubGV0IEFLNDcgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgY29uZmlnLmdhbWUsIGNvbmZpZy5nYW1lLndvcmxkLCAnTTI0OScsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuXG4gICAgLy9cdEhlcmUgd2Ugc2V0LXVwIG91ciBhdWRpbyBzcHJpdGVcbiAgICB0aGlzLmZ4ID0gY29uZmlnLmdhbWUuYWRkLmF1ZGlvKCdNMjQ5LXNvdW5kJylcbiAgICB0aGlzLmFsbG93TXVsdGlwbGUgPSB0cnVlXG5cbiAgICB0aGlzLmRhbWFnZSA9IDIwXG4gICAgdGhpcy5uZXh0RmlyZSA9IDBcbiAgICB0aGlzLmJ1bGxldFNwZWVkID0gMTkwMFxuICAgIHRoaXMuZmlyZVJhdGUgPSAxNTA7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDY0OyBpKyspXG4gICAge1xuICAgICAgICBsZXQgYnVsbGV0ID0gbmV3IEJ1bGxldChjb25maWcuZ2FtZSwgJ2J1bGxldDEyJywgY29uZmlnLnNvY2tldClcbiAgICAgICAgYnVsbGV0LmJ1bGxldElkID0gR3VpZCgpXG4gICAgICAgIGJ1bGxldC5oZWlnaHQgPSAyXG4gICAgICAgIGJ1bGxldC53aWR0aCA9IDQwXG4gICAgICAgIGJ1bGxldC5kYW1hZ2UgPSAyMlxuICAgICAgICB0aGlzLmFkZChidWxsZXQsIHRydWUpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG59XG5cbkFLNDcucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcbkFLNDcucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQUs0NztcblxuQUs0Ny5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uKHBsYXllciwgc29ja2V0LCByb29tSWQpIHtcbiAgICBpZiAodGhpcy5nYW1lLnRpbWUudGltZSA8IHRoaXMubmV4dEZpcmUpXG4gICAgICAgIHJldHVyblxuXG4gICAgdmFyIHggPSBwbGF5ZXIueCArIDE1O1xuICAgIHZhciB5ID0gcGxheWVyLnkgKyAzMDtcblxuICAgIHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgMCwgc29ja2V0LCByb29tSWQpXG4gICAgdGhpcy5zZXRBbGwoJ3RyYWNraW5nJywgdHJ1ZSlcblxuICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLmdhbWUudGltZS50aW1lICsgdGhpcy5maXJlUmF0ZVxuICAgIHRoaXMuZngudm9sdW1lID0gLjNcbiAgICB0aGlzLmZ4LnBsYXkoKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFLNDdcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgQnVsbGV0ID0gcmVxdWlyZSgnLi4vQnVsbGV0JylcbmxldCBHdWlkID0gcmVxdWlyZSgnLi4vR3VpZCcpXG5cbmxldCBBSzQ3ID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGNvbmZpZy5nYW1lLCBjb25maWcuZ2FtZS53b3JsZCwgJ000QTEnLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcblxuICAgIC8vXHRIZXJlIHdlIHNldC11cCBvdXIgYXVkaW8gc3ByaXRlXG4gICAgdGhpcy5meCA9IGNvbmZpZy5nYW1lLmFkZC5hdWRpbygnTTRBMS1zb3VuZCcpXG4gICAgdGhpcy5hbGxvd011bHRpcGxlID0gdHJ1ZVxuXG4gICAgdGhpcy5kYW1hZ2UgPSAyMFxuICAgIHRoaXMubmV4dEZpcmUgPSAwXG4gICAgdGhpcy5idWxsZXRTcGVlZCA9IDI0MDBcbiAgICB0aGlzLmZpcmVSYXRlID0gMTUwO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA2NDsgaSsrKVxuICAgIHtcbiAgICAgICAgbGV0IGJ1bGxldCA9IG5ldyBCdWxsZXQoY29uZmlnLmdhbWUsICdidWxsZXQxMicsIGNvbmZpZy5zb2NrZXQpXG4gICAgICAgIGJ1bGxldC5idWxsZXRJZCA9IEd1aWQoKVxuICAgICAgICBidWxsZXQuaGVpZ2h0ID0gMlxuICAgICAgICBidWxsZXQud2lkdGggPSA0MFxuICAgICAgICBidWxsZXQuZGFtYWdlID0gMjJcbiAgICAgICAgdGhpcy5hZGQoYnVsbGV0LCB0cnVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xufVxuXG5BSzQ3LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLkdyb3VwLnByb3RvdHlwZSk7XG5BSzQ3LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEFLNDc7XG5cbkFLNDcucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbihwbGF5ZXIsIHNvY2tldCwgcm9vbUlkKSB7XG4gICAgaWYgKHRoaXMuZ2FtZS50aW1lLnRpbWUgPCB0aGlzLm5leHRGaXJlKVxuICAgICAgICByZXR1cm5cblxuICAgIHZhciB4ID0gcGxheWVyLnggKyAxNTtcbiAgICB2YXIgeSA9IHBsYXllci55ICsgMzA7XG5cbiAgICB0aGlzLmdldEZpcnN0RXhpc3RzKGZhbHNlKS5maXJlKHgsIHksIDAsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDAsIHNvY2tldCwgcm9vbUlkKVxuICAgIHRoaXMuc2V0QWxsKCd0cmFja2luZycsIHRydWUpXG5cbiAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5nYW1lLnRpbWUudGltZSArIHRoaXMuZmlyZVJhdGVcbiAgICB0aGlzLmZ4LnZvbHVtZSA9IC4zXG4gICAgdGhpcy5meC5wbGF5KClcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBSzQ3XG4iLCIndXNlIHN0cmljdCdcblxubGV0IEJ1bGxldCA9IHJlcXVpcmUoJy4uL0J1bGxldCcpXG5sZXQgR3VpZCA9IHJlcXVpcmUoJy4uL0d1aWQnKVxuXG5sZXQgQUs0NyA9IGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCBjb25maWcuZ2FtZSwgY29uZmlnLmdhbWUud29ybGQsICdNNzknLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcblxuICAgIC8vXHRIZXJlIHdlIHNldC11cCBvdXIgYXVkaW8gc3ByaXRlXG4gICAgdGhpcy5meCA9IGNvbmZpZy5nYW1lLmFkZC5hdWRpbygnQUs0Ny1zb3VuZCcpXG4gICAgdGhpcy5hbGxvd011bHRpcGxlID0gdHJ1ZVxuXG4gICAgdGhpcy5kYW1hZ2UgPSAyMlxuICAgIHRoaXMubmV4dEZpcmUgPSAwXG4gICAgdGhpcy5idWxsZXRTcGVlZCA9IDE4MDBcbiAgICB0aGlzLmZpcmVSYXRlID0gMTYwO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA2NDsgaSsrKVxuICAgIHtcbiAgICAgICAgbGV0IGJ1bGxldCA9IG5ldyBCdWxsZXQoY29uZmlnLmdhbWUsICdidWxsZXQxMicsIGNvbmZpZy5zb2NrZXQpXG4gICAgICAgIGJ1bGxldC5idWxsZXRJZCA9IEd1aWQoKVxuICAgICAgICBidWxsZXQuaGVpZ2h0ID0gMlxuICAgICAgICBidWxsZXQud2lkdGggPSA0MFxuICAgICAgICBidWxsZXQuZGFtYWdlID0gMjJcbiAgICAgICAgdGhpcy5hZGQoYnVsbGV0LCB0cnVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xufVxuXG5BSzQ3LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLkdyb3VwLnByb3RvdHlwZSk7XG5BSzQ3LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEFLNDc7XG5cbkFLNDcucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbihwbGF5ZXIsIHNvY2tldCwgcm9vbUlkKSB7XG4gICAgaWYgKHRoaXMuZ2FtZS50aW1lLnRpbWUgPCB0aGlzLm5leHRGaXJlKVxuICAgICAgICByZXR1cm5cblxuICAgIHZhciB4ID0gcGxheWVyLnggKyAxNTtcbiAgICB2YXIgeSA9IHBsYXllci55ICsgMzA7XG5cbiAgICB0aGlzLmdldEZpcnN0RXhpc3RzKGZhbHNlKS5maXJlKHgsIHksIDAsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDAsIHNvY2tldCwgcm9vbUlkKVxuICAgIHRoaXMuc2V0QWxsKCd0cmFja2luZycsIHRydWUpXG5cbiAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5nYW1lLnRpbWUudGltZSArIHRoaXMuZmlyZVJhdGVcbiAgICB0aGlzLmZ4LnBsYXkoKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFLNDdcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgQnVsbGV0ID0gcmVxdWlyZSgnLi4vQnVsbGV0JylcbmxldCBHdWlkID0gcmVxdWlyZSgnLi4vR3VpZCcpXG5cbmxldCBNUDUgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgY29uZmlnLmdhbWUsIGNvbmZpZy5nYW1lLndvcmxkLCAnTVA1JywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG5cbiAgICAvL1x0SGVyZSB3ZSBzZXQtdXAgb3VyIGF1ZGlvIHNwcml0ZVxuICAgIHRoaXMuZnggPSBjb25maWcuZ2FtZS5hZGQuYXVkaW8oJ01QNS1zb3VuZCcpXG4gICAgdGhpcy5hbGxvd011bHRpcGxlID0gdHJ1ZVxuXG4gICAgdGhpcy5kYW1hZ2UgPSAxOFxuICAgIHRoaXMubmV4dEZpcmUgPSAwXG4gICAgdGhpcy5idWxsZXRTcGVlZCA9IDIzNTBcbiAgICB0aGlzLmZpcmVSYXRlID0gMTEwXG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDY0OyBpKyspXG4gICAge1xuICAgICAgICBsZXQgYnVsbGV0ID0gbmV3IEJ1bGxldChjb25maWcuZ2FtZSwgJ2J1bGxldDEyJywgY29uZmlnLnNvY2tldClcbiAgICAgICAgYnVsbGV0LmJ1bGxldElkID0gR3VpZCgpXG4gICAgICAgIGJ1bGxldC5oZWlnaHQgPSAyXG4gICAgICAgIGJ1bGxldC53aWR0aCA9IDQwXG4gICAgICAgIGJ1bGxldC5kYW1hZ2UgPSAyMlxuICAgICAgICB0aGlzLmFkZChidWxsZXQsIHRydWUpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbn1cblxuTVA1LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLkdyb3VwLnByb3RvdHlwZSlcbk1QNS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBNUDVcblxuTVA1LnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24ocGxheWVyLCBzb2NrZXQsIHJvb21JZCkge1xuICAgIGlmICh0aGlzLmdhbWUudGltZS50aW1lIDwgdGhpcy5uZXh0RmlyZSlcbiAgICAgICAgcmV0dXJuXG5cbiAgICB2YXIgeCA9IHBsYXllci54ICsgMTVcbiAgICB2YXIgeSA9IHBsYXllci55ICsgMzBcblxuICAgIHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgMCwgc29ja2V0LCByb29tSWQpXG4gICAgdGhpcy5zZXRBbGwoJ3RyYWNraW5nJywgdHJ1ZSlcblxuICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLmdhbWUudGltZS50aW1lICsgdGhpcy5maXJlUmF0ZVxuICAgIHRoaXMuZngucGxheSgpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gTVA1XG4iLCIndXNlIHN0cmljdCdcblxubGV0IEJ1bGxldCA9IHJlcXVpcmUoJy4uL0J1bGxldCcpXG5sZXQgR3VpZCA9IHJlcXVpcmUoJy4uL0d1aWQnKVxuXG5sZXQgU3BhczEyID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGNvbmZpZy5nYW1lLCBjb25maWcuZ2FtZS53b3JsZCwgJ1NwYXMtMTInLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKVxuXG4gICAgdGhpcy5uZXh0RmlyZSA9IDBcbiAgICB0aGlzLmJ1bGxldFNwZWVkID0gMTkwMFxuICAgIHRoaXMuZmlyZVJhdGUgPSA1MDBcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMzI7IGkrKylcbiAgICB7XG4gICAgICAgIGxldCBidWxsZXQgPSBuZXcgQnVsbGV0KGNvbmZpZy5nYW1lLCAnYnVsbGV0MTInLCBjb25maWcuc29ja2V0KVxuICAgICAgICBidWxsZXQuYnVsbGV0SWQgPSBHdWlkKClcbiAgICAgICAgYnVsbGV0LmhlaWdodCA9IDJcbiAgICAgICAgYnVsbGV0LndpZHRoID0gNDBcbiAgICAgICAgYnVsbGV0LmRhbWFnZSA9IDIyXG4gICAgICAgIHRoaXMuYWRkKGJ1bGxldCwgdHJ1ZSlcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xufVxuXG5TcGFzMTIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKVxuU3BhczEyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFNwYXMxMlxuXG5TcGFzMTIucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbiAocGxheWVyLCBzb2NrZXQsIHJvb21JZCkge1xuICAgIGlmICh0aGlzLmdhbWUudGltZS50aW1lIDwgdGhpcy5uZXh0RmlyZSlcbiAgICAgICAgcmV0dXJuXG5cblxuXG5cblxuICAgIHZhciB4ID0gcGxheWVyLnggKyAxNVxuICAgIHZhciB5ID0gcGxheWVyLnkgKyAzMFxuXG5cblxuICAgIHZhciBidWxsZXRJbnN0YW5jZSA9IHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpXG4gICAgaWYgKCFidWxsZXRJbnN0YW5jZSkgcmV0dXJuXG4gICAgYnVsbGV0SW5zdGFuY2UuZmlyZSh4LCB5LCAuMywgdGhpcy5idWxsZXRTcGVlZCwgMCwgMCwgc29ja2V0LCByb29tSWQpXG5cblxuXG5cbiAgICBidWxsZXRJbnN0YW5jZSA9IHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpXG4gICAgaWYgKCFidWxsZXRJbnN0YW5jZSkgcmV0dXJuXG4gICAgYnVsbGV0SW5zdGFuY2UuZmlyZSh4LCB5LCAtMC4zLCB0aGlzLmJ1bGxldFNwZWVkLCAwLCAwLCBzb2NrZXQsIHJvb21JZClcblxuXG5cbiAgICBidWxsZXRJbnN0YW5jZSA9IHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpXG4gICAgaWYgKCFidWxsZXRJbnN0YW5jZSkgcmV0dXJuXG4gICAgYnVsbGV0SW5zdGFuY2UuZmlyZSh4LCB5LCAwLCB0aGlzLmJ1bGxldFNwZWVkLCAwLCAwLCBzb2NrZXQsIHJvb21JZClcblxuXG5cblxuXG4gICAgYnVsbGV0SW5zdGFuY2UgPSB0aGlzLmdldEZpcnN0RXhpc3RzKGZhbHNlKVxuICAgIGlmICghYnVsbGV0SW5zdGFuY2UpIHJldHVyblxuICAgIGJ1bGxldEluc3RhbmNlLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgMCwgc29ja2V0LCByb29tSWQpXG5cblxuXG5cbiAgICB0aGlzLnNldEFsbCgndHJhY2tpbmcnLCB0cnVlKVxuXG4gICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMuZ2FtZS50aW1lLnRpbWUgKyB0aGlzLmZpcmVSYXRlXG59XG5cbm1vZHVsZS5leHBvcnRzID0gU3BhczEyXG4iLCIndXNlIHN0cmljdCdcblxuLyoqXG4gKiBQcmltYXJ5IFdlYXBvbnNcbiAqIDEuIERlc2VydCBFYWdsZXNcbiAqIDIuIEhLIE1QNVxuICogMy4gQUs0N1xuICogNC4gTTE2XG4gKiA1LiBTcGFzLTEyXG4gKiA2LiBSdWdlciA3N1xuICogNy4gTTc5XG4gKiA4LiBCYXJyZXQgTTgyQTFcbiAqIDkuIEZOIE1pbmltaVxuICogMTAuIFhNMjE0IE1pbmlndW5cbiAqL1xuXG4vKipcbiAqIFNlY29uZGFyeSBXZWFwb25zXG4gKiAxLiBEZXNlcnQgRWFnbGVcbiAqIDIuIENvbWJhdCBLbmlmZVxuICogMy4gQ2hhaW5zYXdcbiAqIDQuIFJQR1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIFwiQUs0N1wiOiByZXF1aXJlKCcuL0FLNDcnKSxcbiAgICBcIkJhcnJldE05MFwiOiByZXF1aXJlKCcuL0JhcnJldE05MCcpLFxuICAgIFwiRGVzZXJ0RWFnbGVcIjogcmVxdWlyZSgnLi9EZXNlcnRFYWdsZScpLFxuICAgIFwiTTRBMVwiOiByZXF1aXJlKCcuL000QTEnKSxcbiAgICBcIk03OVwiOiByZXF1aXJlKCcuL003OScpLFxuICAgIFwiTTI0OVwiOiByZXF1aXJlKCcuL00yNDknKSxcbiAgICBcIk1QNVwiOiByZXF1aXJlKCcuL01QNScpLFxuICAgIC8vIFwiUlBHXCI6IHJlcXVpcmUoJy4vUlBHJyksXG4gICAgXCJTcGFzMTJcIjogcmVxdWlyZSgnLi9TcGFzMTInKVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBGb3Jlc3RDdGYgPSB7fVxuXG5Gb3Jlc3RDdGYuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zcGF3blBvaW50cyA9IFtcbiAgICAgICAge1xuICAgICAgICAgICAgeDogNTAwLFxuICAgICAgICAgICAgeTogdGhpcy53b3JsZC5oZWlnaHQgLSA3MDBcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgeDogMjAwLFxuICAgICAgICAgICAgeTogdGhpcy53b3JsZC5oZWlnaHQgLSAyMDBcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgeDogMzc1MCxcbiAgICAgICAgICAgIHk6IHRoaXMud29ybGQuaGVpZ2h0IC0gMjAwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIHg6IDM0NTAsXG4gICAgICAgICAgICB5OiB0aGlzLndvcmxkLmhlaWdodCAtIDcwMFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICB4OiAyNjAwLFxuICAgICAgICAgICAgeTogdGhpcy53b3JsZC5oZWlnaHQgLSA4MDBcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgeDogMTI1MCxcbiAgICAgICAgICAgIHk6IHRoaXMud29ybGQuaGVpZ2h0IC0gODAwXG4gICAgICAgIH1cbiAgICBdXG5cbiAgICBGb3Jlc3RDdGYuY3JlYXRlU2t5U3ByaXRlLmNhbGwodGhpcylcbiAgICBGb3Jlc3RDdGYuY3JlYXRlUGxhdGZvcm1zLmNhbGwodGhpcylcbiAgICBGb3Jlc3RDdGYuY3JlYXRlTGVkZ2VzLmNhbGwodGhpcylcblxuICAgIHRoaXMucGxhdGZvcm1zLnNldEFsbCgnYm9keS5pbW1vdmFibGUnLCB0cnVlKVxuICAgIHRoaXMucGxhdGZvcm1zLnNldEFsbCgnYm9keS5hbGxvd0dyYXZpdHknLCBmYWxzZSlcbn1cblxuRm9yZXN0Q3RmLmNyZWF0ZVNreVNwcml0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuYWRkLnRpbGVTcHJpdGUoMCwgdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDE1MDAsIHRoaXMuZ2FtZS53b3JsZC53aWR0aCwgMTUwMCwgJ3RyZWVzY2FwZScpXG59XG5cbkZvcmVzdEN0Zi5jcmVhdGVQbGF0Zm9ybXMgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnBsYXRmb3JtcyA9IHRoaXMuYWRkLmdyb3VwKClcbiAgICB0aGlzLnBsYXRmb3Jtcy5lbmFibGVCb2R5ID0gdHJ1ZVxufVxuXG5Gb3Jlc3RDdGYuZ2V0UmFuZG9tU3Bhd25Qb2ludCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBfLnNhbXBsZSh0aGlzLnNwYXduUG9pbnRzKVxufVxuXG5Gb3Jlc3RDdGYuY3JlYXRlTGVkZ2VzID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IGxlZGdlcyA9IFtcbiAgICAgICAgLy8ge3gsIHksIHdpZHRoLCBoZWlnaHR9XG5cbiAgICAgICAgLy8gU3RhcnRpbmcgTGVkZ2VzXG4gICAgICAgIHsgaWQ6IDEsIHg6IDAsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSA0MzEsIHdpZHRoOiAxMjgsIGhlaWdodDogOTIgfSwgLy8gTGVmdCBib3R0b20gbGVkZ2VcbiAgICAgICAgeyBpZDogMiwgeDogMCwgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDgzOCwgd2lkdGg6IDEyOCwgaGVpZ2h0OiA5MiB9LCAvLyBMZWZ0IHRvcCBsZWRnZVxuXG4gICAgICAgIHsgaWQ6IDMsIHg6IDM4NzIsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSA0MjcsIHdpZHRoOiAxMjgsIGhlaWdodDogOTIgfSwgLy8gUmlnaHQgYm90dG9tIGxlZGdlXG4gICAgICAgIHsgaWQ6IDQsIHg6IDM4NzIsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSA4MzUsIHdpZHRoOiAxMjgsIGhlaWdodDogOTIgfSwgLy8gUmlnaHQgdG9wIGxlZGdlXG5cbiAgICAgICAgLy8gR3JvdW5kIExlZGdlc1xuICAgICAgICB7IGlkOiA1LCB4OiAwLCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gMTI4LCB3aWR0aDogNDc0LCBoZWlnaHQ6IDEyOCB9LCAvLyBNYWluIGJvdHRvbSBzdGFydGluZyBsZWZ0IGxlZGdlXG4gICAgICAgIHsgaWQ6IDYsIHg6IDQ3NCwgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDI1Niwgd2lkdGg6IDY0MSwgaGVpZ2h0OiAyNjAgfSwgLy8gTWFpbiBib3R0b20gbGVmdCBsZWRnZVxuICAgICAgICB7IGlkOiA3LCB4OiAxMTE1LCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gMzg0LCB3aWR0aDogMTc4NSwgaGVpZ2h0OiAzOTAgfSwgLy8gTWFpbiBib3R0b20gY2VudGVyIGxlZGdlXG4gICAgICAgIHsgaWQ6IDgsIHg6IDI5MDAsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSAyNTYsIHdpZHRoOiA2NDEsIGhlaWdodDogMjYwIH0sIC8vIE1haW4gYm90dG9tIHJpZ2h0IGxlZGdlXG4gICAgICAgIHsgaWQ6IDksIHg6IDM1NDAsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSAxMjgsIHdpZHRoOiA0NzQsIGhlaWdodDogMTI4IH0sIC8vIE1haW4gYm90dG9tIHN0YXJ0aW5nIHJpZ2h0IGxlZGdlXG5cbiAgICAgICAgLy8gQWlyIExlZGdlc1xuICAgICAgICB7IGlkOiAxMCwgeDogMzAwLCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gNjA4LCB3aWR0aDogNjQxLCBoZWlnaHQ6IDkyIH0sXG4gICAgICAgIHsgaWQ6IDExLCB4OiAxMTEwLCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gNzAxLCB3aWR0aDogNTEzLCBoZWlnaHQ6IDkyIH0sXG4gICAgICAgIHsgaWQ6IDEyLCB4OiA4NzAsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSA5ODIsIHdpZHRoOiAyNTYsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogMTMsIHg6IDE3NDQsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSA4NzQsIHdpZHRoOiA1MDcsIGhlaWdodDogMjU0IH0sXG4gICAgICAgIHsgaWQ6IDE0LCB4OiAyMzkwLCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gNjg5LCB3aWR0aDogNTEzLCBoZWlnaHQ6IDkyIH0sXG4gICAgICAgIHsgaWQ6IDE1LCB4OiAzMDMxLCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gNjA4LCB3aWR0aDogNjQxLCBoZWlnaHQ6IDkyIH0sXG4gICAgICAgIHsgaWQ6IDE2LCB4OiAyOTAzLCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gOTU3LCB3aWR0aDogMjU2LCBoZWlnaHQ6IDkyIH0sXG5cbiAgICAgICAgLy8gQm94ZXNcbiAgICAgICAgeyBpZDogMTcsIHg6IDcxNywgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDY4NSwgd2lkdGg6IDE1NCwgaGVpZ2h0OiA3NyB9LFxuICAgICAgICB7IGlkOiAxOCwgeDogNzU3LCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gNzYyLCB3aWR0aDogNzcsIGhlaWdodDogNzcgfSxcbiAgICAgICAgeyBpZDogMTksIHg6IDE0MTgsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSA3NzgsIHdpZHRoOiA3NywgaGVpZ2h0OiA3NyB9LFxuICAgICAgICB7IGlkOiAyMCwgeDogMTkzMSwgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDQ2MSwgd2lkdGg6IDE1NCwgaGVpZ2h0OiA3NyB9LFxuICAgICAgICB7IGlkOiAyMSwgeDogMzIwNSwgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDY4NSwgd2lkdGg6IDE1NCwgaGVpZ2h0OiA3NyB9LFxuICAgICAgICB7IGlkOiAyMiwgeDogMzI0NSwgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDc2Miwgd2lkdGg6IDc3LCBoZWlnaHQ6IDc3IH1cbiAgICBdXG5cbiAgICBsZWRnZXMuZm9yRWFjaCgobGVkZ2UpID0+IHtcbiAgICAgICAgLy8gdmFyIG5ld0xlZGdlID0gdGhpcy5wbGF0Zm9ybXMuY3JlYXRlKGxlZGdlLngsIGxlZGdlLnksICdncm91bmQnKVxuICAgICAgICB2YXIgbmV3TGVkZ2UgPSB0aGlzLnBsYXRmb3Jtcy5jcmVhdGUobGVkZ2UueCwgbGVkZ2UueSlcbiAgICAgICAgbmV3TGVkZ2UuaGVpZ2h0ID0gbGVkZ2UuaGVpZ2h0XG4gICAgICAgIG5ld0xlZGdlLndpZHRoID0gbGVkZ2Uud2lkdGhcblxuICAgICAgICAvLyBEZWJ1ZyBzdHVmZlxuICAgICAgICAvLyBuZXdMZWRnZS5hbHBoYSA9IDAuMlxuICAgICAgICAvLyBsZXQgc3R5bGUgPSB7IGZvbnQ6IFwiMjBweCBBcmlhbFwiLCBmaWxsOiBcIiNmZjAwNDRcIiwgYWxpZ246IFwiY2VudGVyXCIsIGJhY2tncm91bmRDb2xvcjogXCIjZmZmZjAwXCIgfVxuICAgICAgICAvLyBsZXQgdGV4dCA9IHRoaXMuZ2FtZS5hZGQudGV4dChsZWRnZS54LCBsZWRnZS55LCBsZWRnZS5pZCwgc3R5bGUpXG4gICAgICAgIC8vIHRleHQuYWxwaGEgPSAwLjJcbiAgICB9KVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZvcmVzdEN0ZlxuIl19
