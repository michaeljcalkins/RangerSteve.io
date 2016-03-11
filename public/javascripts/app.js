(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var MapCtf1 = require('./maps/MapCtf1');
var RemotePlayer = require('./lib/RemotePlayer');
var WeaponSettings = require('./lib/WeaponSettings');
var Guid = require('./lib/Guid');
var Weapons = require('./lib/Weapons');
var Bullet = require('./lib/Bullet');

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
        MapCtf1.create(this);

        // Define movement constants
        this.MAX_SPEED = 400; // pixels/second
        this.ACCELERATION = 1960; // pixels/second/second
        this.DRAG = 1500; // pixels/second
        this.GRAVITY = 1960; // pixels/second/second
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
        this.player.score = 0;

        /**
         * Weapons
         */
        this.currentWeapon = 0;
        this.weapons.push(new Weapons.AK47(this.game));

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
        var _this2 = this;

        //  Collide the player and the stars with the platforms
        this.physics.arcade.collide(this.player, this.platforms);
        this.physics.arcade.collide(this.enemies, this.platforms);
        this.physics.arcade.collide(this.enemy, this.platforms);
        this.physics.arcade.collide(this.platforms, this.weapons, function (platform, weapon) {
            weapon.kill();
        }, null, this);

        this.enemies.forEach(function (enemy) {
            _this2.game.physics.arcade.overlap(enemy, _this2.weapons, function (enemy, weapon) {
                enemy.health -= weapon.damage;
                _this2.socket.emit('damaged player', {
                    playerId: enemy.id,
                    clientId: _this2.clientId,
                    damage: weapon.damage
                });
                weapon.kill();
                console.log('You hit them!', enemy.health, weapon.damage);
            }, null, _this2);
        });

        // Bullet has hit a player
        this.game.physics.arcade.overlap(this.enemy, this.weapons, function (enemy, weapon) {
            enemy.health -= weapon.damage;
            weapon.kill();
            console.log('You hit them!', enemy.health, weapon.damage);
            if (enemy.health <= 0) {
                console.log('They are dead!');
                _this2.enemy.x = 200;
                _this2.enemy.y = 200;
                _this2.enemy.health = 100;
                _this2.player.score++;
                _this2.scoreText.text = _this2.player.score;
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
    },

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

        // New player message received
        this.socket.on('new player', this.onNewPlayer.bind(this));

        // Player move message received
        this.socket.on('move player', this.onMovePlayer.bind(this));

        // Player removed message received
        this.socket.on('remove player', this.onRemovePlayer.bind(this));
    },

    // Socket connected
    onSocketConnected: function onSocketConnected(data) {
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
        var duplicate = this.playerById(data.id);
        if (duplicate || data.clientId === this.clientId) {
            console.log('Duplicate player!');
            return;
        }

        var newRemotePlayer = RemotePlayer.create.call(this, {
            x: data.x,
            y: data.y,
            id: data.id
        });

        this.enemies.push(newRemotePlayer);
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
            console.log('Player not found: ', data.id);
            return;
        }

        removePlayer.kill();

        // Remove player from array
        this.enemies.splice(this.enemies.indexOf(removePlayer), 1);
    },

    // Find player by ID
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

},{"./lib/Bullet":2,"./lib/Guid":3,"./lib/RemotePlayer":4,"./lib/WeaponSettings":5,"./lib/Weapons":7,"./maps/MapCtf1":8}],2:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
"use strict";

module.exports = {
    "USSOCOM": {
        "name": "USSOCOM",
        "Damage": 190,
        "FireInterval": 12,
        "Ammo": 12,
        "ReloadTime": 65,
        "Speed": 180,
        "BulletStyle": 1,
        "StartUpTime": 0,
        "Bink": 4,
        "MovementAcc": 1
    },
    "DesertEagles": {
        "name": "Desert Eagles",
        "Damage": 210,
        "FireInterval": 22,
        "Ammo": 7,
        "ReloadTime": 90,
        "Speed": 190,
        "BulletStyle": 1,
        "StartUpTime": 0,
        "Bink": 7,
        "MovementAcc": 1
    },
    "HKMP5": {
        "name": "HK MP5",
        "Damage": 120,
        "FireInterval": 6,
        "Ammo": 30,
        "ReloadTime": 105,
        "Speed": 190,
        "BulletStyle": 1,
        "StartUpTime": 0,
        "Bink": 2,
        "MovementAcc": 1
    },
    "AK47": {
        "name": "AK-47",
        "damage": "122",
        "fireInterval": "10",
        "ammo": "40",
        "reloadTime": "150",
        "speed": "240",
        "bulletStyle": "1",
        "startUpTime": "0",
        "bink": "3",
        "movementAcc": "1"
    },
    "SteyrAUG": {
        "name": "M16",
        "Damage": "80",
        "FireInterval": "7",
        "Ammo": "30",
        "ReloadTime": "115",
        "Speed": "260",
        "BulletStyle": "1",
        "StartUpTime": "0",
        "Bink": "2",
        "MovementAcc": "1"
    },
    "Spas12": {
        "name": "Spas-12",
        "Damage": "130",
        "FireInterval": "32",
        "Ammo": "7",
        "ReloadTime": "175",
        "Speed": "140",
        "BulletStyle": "3",
        "StartUpTime": "0",
        "Bink": "10",
        "MovementAcc": "1"
    },
    "Ruger77": {
        "name": "Ruger 77",
        "Damage": "252",
        "FireInterval": "30",
        "Ammo": "4",
        "ReloadTime": "75",
        "Speed": "330",
        "BulletStyle": "1",
        "StartUpTime": "0",
        "Bink": "15",
        "MovementAcc": "3"
    },
    "M79": {
        "Damage": 160000,
        "FireInterval": 6,
        "Ammo": 1,
        "ReloadTime": 180,
        "Speed": 115,
        "BulletStyle": 4,
        "StartUpTime": 0,
        "Bink": 30,
        "MovementAcc": 3
    },
    "Barret M82A1": {
        "Damage": 495,
        "FireInterval": 240,
        "Ammo": 10,
        "ReloadTime": 300,
        "Speed": "550",
        "BulletStyle": "1",
        "StartUpTime": "0",
        "Bink": "80",
        "MovementAcc": "6"
    },
    "FN Minimi": {
        "Damage": "100",
        "FireInterval": "9",
        "Ammo": "50",
        "ReloadTime": "250",
        "Speed": "270",
        "BulletStyle": "1",
        "StartUpTime": "0",
        "Bink": "3",
        "MovementAcc": "2"
    },
    "XM214 Minigun": {
        "Damage": "55",
        "FireInterval": "4",
        "Ammo": "100",
        "ReloadTime": "366",
        "Speed": "290",
        "BulletStyle": "1",
        "StartUpTime": "50",
        "Bink": "1",
        "MovementAcc": "1"
    },
    "Flamer": {
        "Damage": "1000",
        "FireInterval": "6",
        "Ammo": "200",
        "ReloadTime": "5",
        "Speed": "105",
        "BulletStyle": "5",
        "StartUpTime": "0",
        "Bink": "2",
        "MovementAcc": "1"
    },
    "Rambo Bow": {
        "Damage": "1200",
        "FireInterval": "10",
        "Ammo": "1",
        "ReloadTime": "25",
        "Speed": "210",
        "BulletStyle": "7",
        "StartUpTime": "0",
        "Bink": "3",
        "MovementAcc": "1"
    },
    "Flamed Arrows": {
        "Damage": "800",
        "FireInterval": "10",
        "Ammo": "1",
        "ReloadTime": "36",
        "Speed": "180",
        "BulletStyle": "8",
        "StartUpTime": "0",
        "Bink": "3",
        "MovementAcc": "1"
    },
    "Combat Knife": {
        "Damage": "210000",
        "FireInterval": "6",
        "Ammo": "1",
        "ReloadTime": "3",
        "Speed": "60",
        "BulletStyle": "11",
        "StartUpTime": "0",
        "Bink": "0",
        "MovementAcc": "1"
    },
    "Chainsaw": {
        "Damage": "2100",
        "FireInterval": "4",
        "Ammo": "30",
        "ReloadTime": "70",
        "Speed": "70",
        "BulletStyle": "11",
        "StartUpTime": "0",
        "Bink": "0",
        "MovementAcc": "1"
    },
    "M72 LAW": {
        "Damage": "150000",
        "FireInterval": "60",
        "Ammo": "1",
        "ReloadTime": "600",
        "Speed": "230",
        "BulletStyle": "12",
        "StartUpTime": "0",
        "Bink": "20",
        "MovementAcc": "1"
    },
    "Punch": {
        "Damage": "33000",
        "FireInterval": "6",
        "Ammo": "1",
        "ReloadTime": "3",
        "Speed": "50",
        "BulletStyle": "6",
        "StartUpTime": "0",
        "Bink": "2",
        "MovementAcc": "1"
    },
    "Grenade": {
        "Damage": "150000",
        "FireInterval": "80",
        "Ammo": "1",
        "ReloadTime": "20",
        "Speed": "50",
        "BulletStyle": "2",
        "StartUpTime": "0",
        "Bink": "0",
        "MovementAcc": "1"
    },
    "Stationary Gun": {
        "Damage": "50",
        "FireInterval": "4",
        "Ammo": "100",
        "ReloadTime": "366",
        "Speed": "290",
        "BulletStyle": "1",
        "StartUpTime": "0",
        "Bink": "0",
        "MovementAcc": "1"
    }
};

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
        bullet.height = 3;
        bullet.width = 10;
        bullet.damage = 22;
        console.log(bullet);

        this.add(bullet, true);
    }

    return this;
};

AK47.prototype = Object.create(Phaser.Group.prototype);
AK47.prototype.constructor = AK47;

AK47.prototype.fire = function (source) {
    if (this.game.time.time < this.nextFire) return;

    var x = source.x - 22;
    var y = source.y + 30;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0);
    this.setAll('tracking', true);

    this.nextFire = this.game.time.time + this.fireRate;
    console.log(this);
};

module.exports = AK47;

},{"../Bullet":2}],7:[function(require,module,exports){
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
  "AK47": require('./AK47')
};

},{"./AK47":6}],8:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvYXBwLmpzIiwiYXNzZXRzL2pzL2xpYi9CdWxsZXQuanMiLCJhc3NldHMvanMvbGliL0d1aWQuanMiLCJhc3NldHMvanMvbGliL1JlbW90ZVBsYXllci5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9uU2V0dGluZ3MuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvQUs0Ny5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9pbmRleC5qcyIsImFzc2V0cy9qcy9tYXBzL01hcEN0ZjEuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7QUFFQSxJQUFJLFVBQVUsUUFBUSxnQkFBUixDQUFWO0FBQ0osSUFBSSxlQUFlLFFBQVEsb0JBQVIsQ0FBZjtBQUNKLElBQUksaUJBQWlCLFFBQVEsc0JBQVIsQ0FBakI7QUFDSixJQUFJLE9BQU8sUUFBUSxZQUFSLENBQVA7QUFDSixJQUFJLFVBQVUsUUFBUSxlQUFSLENBQVY7QUFDSixJQUFJLFNBQVMsUUFBUSxjQUFSLENBQVQ7O0FBRUosSUFBSSxZQUFZLE9BQU8sVUFBUDtBQUNoQixJQUFJLGFBQWEsT0FBTyxXQUFQO0FBQ2pCLElBQUksYUFBYSxJQUFiO0FBQ0osSUFBSSxjQUFjLElBQWQ7O0FBRUosSUFBSSxPQUFPLElBQUksT0FBTyxJQUFQLENBQVksU0FBaEIsRUFBMkIsVUFBM0IsRUFBdUMsT0FBTyxNQUFQLEVBQWUsbUJBQXRELENBQVA7O0FBRUosSUFBSSxrQkFBa0IsU0FBbEIsZUFBa0IsR0FBVztBQUM3QixTQUFLLFFBQUwsR0FBZ0IsTUFBaEIsQ0FENkI7QUFFN0IsU0FBSyxhQUFMLEdBQXFCLENBQXJCLENBRjZCO0FBRzdCLFNBQUssT0FBTCxHQUFlLEVBQWYsQ0FINkI7QUFJN0IsU0FBSyxJQUFMLEdBQVksSUFBWixDQUo2QjtBQUs3QixTQUFLLE1BQUwsQ0FMNkI7QUFNN0IsU0FBSyxTQUFMLENB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QTZCLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsS0FBaEIsQ0FBc0IsTUFBdEIsR0FBK0IsSUFBL0IsRUFBcUMsS0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixLQUFoQixDQUFzQixLQUF0QixFQUE2QixJQUEvRixFQUFxRyxXQUFyRyxFQURpQztDQUFYOztBQUkxQixRQUFRLGVBQVIsR0FBMEIsWUFBVztBQUNqQyxTQUFLLEtBQUwsQ0FBVyxTQUFYLEdBQXVCLEtBQUssS0FBTCxDQUFXLEdBQVgsQ0FBZSxLQUFmLEVBQXZCLENBRGlDO0FBRWpDLFNBQUssS0FBTCxDQUFXLFNBQVgsQ0FBcUIsVUFBckIsR0FBa0MsSUFBbEMsQ0FGaUM7Q0FBWDs7QUFLMUIsT0FBTyxPQUFQLEdBQWlCLE9BQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0J1xuXG52YXIgTWFwQ3RmMSA9IHJlcXVpcmUoJy4vbWFwcy9NYXBDdGYxJylcbnZhciBSZW1vdGVQbGF5ZXIgPSByZXF1aXJlKCcuL2xpYi9SZW1vdGVQbGF5ZXInKVxubGV0IFdlYXBvblNldHRpbmdzID0gcmVxdWlyZSgnLi9saWIvV2VhcG9uU2V0dGluZ3MnKVxudmFyIEd1aWQgPSByZXF1aXJlKCcuL2xpYi9HdWlkJylcbmxldCBXZWFwb25zID0gcmVxdWlyZSgnLi9saWIvV2VhcG9ucycpXG5sZXQgQnVsbGV0ID0gcmVxdWlyZSgnLi9saWIvQnVsbGV0JylcblxudmFyIGdhbWVXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXG52YXIgZ2FtZUhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodFxudmFyIHdvcmxkV2lkdGggPSA0MDAwXG52YXIgd29ybGRIZWlnaHQgPSAxNTAwXG5cbnZhciBnYW1lID0gbmV3IFBoYXNlci5HYW1lKGdhbWVXaWR0aCwgZ2FtZUhlaWdodCwgUGhhc2VyLkNBTlZBUywgJ3Jhbmdlci1zdGV2ZS1nYW1lJyk7XG5cbnZhciBSYW5nZXJTdGV2ZUdhbWUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmNsaWVudElkID0gR3VpZCgpXG4gICAgdGhpcy5jdXJyZW50V2VhcG9uID0gMDtcbiAgICB0aGlzLmVuZW1pZXMgPSBbXVxuICAgIHRoaXMuZ2FtZSA9IGdhbWVcbiAgICB0aGlzLmdyb3VuZFxuICAgIHRoaXMucGxhdGZvcm1zXG4gICAgdGhpcy5wbGF5ZXJcbiAgICB0aGlzLnNjb3JlID0gMFxuICAgIHRoaXMuc2NvcmVUZXh0XG4gICAgdGhpcy5zb2NrZXRcbiAgICB0aGlzLndlYXBvbk5hbWUgPSBudWxsO1xuICAgIHRoaXMud2VhcG9ucyA9IFtdO1xufVxuXG5SYW5nZXJTdGV2ZUdhbWUucHJvdG90eXBlID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmdhbWUucmVuZGVyZXIucmVuZGVyU2Vzc2lvbi5yb3VuZFBpeGVscyA9IHRydWVcbiAgICAgICAgdGhpcy5nYW1lLnN0YWdlLmRpc2FibGVWaXNpYmlsaXR5Q2hhbmdlID0gdHJ1ZVxuICAgICAgICB0aGlzLnBoeXNpY3Muc3RhcnRTeXN0ZW0oUGhhc2VyLlBoeXNpY3MuQVJDQURFKVxuICAgIH0sXG5cbiAgICBwcmVsb2FkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5sb2FkLmltYWdlKCdidWxsZXQxMScsICcvaW1hZ2VzL2J1bGxldDExLnBuZycpXG4gICAgICAgIHRoaXMubG9hZC5pbWFnZSgnYnVsbGV0MTAnLCAnL2ltYWdlcy9idWxsZXQxMC5wbmcnKVxuICAgICAgICB0aGlzLmxvYWQuaW1hZ2UoJ2J1bGxldDknLCAnL2ltYWdlcy9idWxsZXQ5LnBuZycpXG4gICAgICAgIHRoaXMubG9hZC5pbWFnZSgnYnVsbGV0OCcsICcvaW1hZ2VzL2J1bGxldDgucG5nJylcbiAgICAgICAgdGhpcy5sb2FkLmltYWdlKCdidWxsZXQ3JywgJy9pbWFnZXMvYnVsbGV0Ny5wbmcnKVxuICAgICAgICB0aGlzLmxvYWQuaW1hZ2UoJ2J1bGxldDUnLCAnL2ltYWdlcy9idWxsZXQ1LnBuZycpXG4gICAgICAgIHRoaXMubG9hZC5pbWFnZSgnYnVsbGV0NCcsICcvaW1hZ2VzL2J1bGxldDQucG5nJylcbiAgICAgICAgdGhpcy5sb2FkLmltYWdlKCd0cmVlc2NhcGUnLCAnL2ltYWdlcy9tYXAtY3RmMS5wbmcnKVxuICAgICAgICB0aGlzLmxvYWQuaW1hZ2UoJ2dyb3VuZCcsICcvaW1hZ2VzL3BsYXRmb3JtLnBuZycpXG4gICAgICAgIHRoaXMubG9hZC5zcHJpdGVzaGVldCgnZHVkZScsICcvaW1hZ2VzL2R1ZGUucG5nJywgMzIsIDQ4KVxuICAgICAgICB0aGlzLmxvYWQuc3ByaXRlc2hlZXQoJ2VuZW15JywgJy9pbWFnZXMvZHVkZS5wbmcnLCAzMiwgNDgpXG4gICAgfSxcblxuICAgIGNyZWF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc29ja2V0ID0gaW8uY29ubmVjdCgpXG4gICAgICAgIHRoaXMuZW5lbWllcyA9IFtdXG5cbiAgICAgICAgLy8gIFdlJ3JlIGdvaW5nIHRvIGJlIHVzaW5nIHBoeXNpY3MsIHNvIGVuYWJsZSB0aGUgQXJjYWRlIFBoeXNpY3Mgc3lzdGVtXG4gICAgICAgIHRoaXMucGh5c2ljcy5zdGFydFN5c3RlbShQaGFzZXIuUGh5c2ljcy5BUkNBREUpXG5cbiAgICAgICAgdGhpcy53b3JsZC5zZXRCb3VuZHMoMCwgMCwgd29ybGRXaWR0aCwgd29ybGRIZWlnaHQpXG4gICAgICAgIHRoaXMuZ2FtZS5zdGFnZS5iYWNrZ3JvdW5kQ29sb3IgPSBcIiMyRjkxRDBcIlxuXG4gICAgICAgIC8vIFNjYWxlIGdhbWUgb24gd2luZG93IHJlc2l6ZVxuICAgICAgICB0aGlzLmdhbWUuc2NhbGUuc2NhbGVNb2RlID0gUGhhc2VyLlNjYWxlTWFuYWdlci5SRVNJWkU7XG4gICAgICAgIHRoaXMuZ2FtZS5zY2FsZS5zZXRTaG93QWxsKCk7XG4gICAgICAgIHRoaXMuZ2FtZS5zY2FsZS5yZWZyZXNoKClcblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBNYXBcbiAgICAgICAgICovXG4gICAgICAgIE1hcEN0ZjEuY3JlYXRlKHRoaXMpXG5cbiAgICAgICAgLy8gRGVmaW5lIG1vdmVtZW50IGNvbnN0YW50c1xuICAgICAgICB0aGlzLk1BWF9TUEVFRCA9IDQwMDsgLy8gcGl4ZWxzL3NlY29uZFxuICAgICAgICB0aGlzLkFDQ0VMRVJBVElPTiA9IDE5NjA7IC8vIHBpeGVscy9zZWNvbmQvc2Vjb25kXG4gICAgICAgIHRoaXMuRFJBRyA9IDE1MDA7IC8vIHBpeGVscy9zZWNvbmRcbiAgICAgICAgdGhpcy5HUkFWSVRZID0gMTk2MDsgLy8gcGl4ZWxzL3NlY29uZC9zZWNvbmRcbiAgICAgICAgdGhpcy5KVU1QX1NQRUVEID0gLTg1MDsgLy8gcGl4ZWxzL3NlY29uZCAobmVnYXRpdmUgeSBpcyB1cClcblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQbGF5ZXIgU2V0dGluZ3NcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucGxheWVyID0gdGhpcy5hZGQuc3ByaXRlKDIwMCwgdGhpcy53b3JsZC5oZWlnaHQgLSA0MDAsICdkdWRlJyk7XG5cbiAgICAgICAgLy8gIFdlIG5lZWQgdG8gZW5hYmxlIHBoeXNpY3Mgb24gdGhlIHBsYXllclxuICAgICAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmVuYWJsZSh0aGlzLnBsYXllcik7XG5cbiAgICAgICAgLy8gRW5hYmxlIHBoeXNpY3Mgb24gdGhlIHBsYXllclxuICAgICAgICB0aGlzLmdhbWUucGh5c2ljcy5lbmFibGUodGhpcy5wbGF5ZXIsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG5cbiAgICAgICAgLy8gTWFrZSBwbGF5ZXIgY29sbGlkZSB3aXRoIHdvcmxkIGJvdW5kYXJpZXMgc28gaGUgZG9lc24ndCBsZWF2ZSB0aGUgc3RhZ2VcbiAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5jb2xsaWRlV29ybGRCb3VuZHMgPSB0cnVlO1xuXG4gICAgICAgIC8vIFNldCBwbGF5ZXIgbWluaW11bSBhbmQgbWF4aW11bSBtb3ZlbWVudCBzcGVlZFxuICAgICAgICB0aGlzLnBsYXllci5ib2R5Lm1heFZlbG9jaXR5LnNldFRvKHRoaXMuTUFYX1NQRUVELCB0aGlzLk1BWF9TUEVFRCAqIDEwKTsgLy8geCwgeVxuXG4gICAgICAgIC8vIEFkZCBkcmFnIHRvIHRoZSBwbGF5ZXIgdGhhdCBzbG93cyB0aGVtIGRvd24gd2hlbiB0aGV5IGFyZSBub3QgYWNjZWxlcmF0aW5nXG4gICAgICAgIHRoaXMucGxheWVyLmJvZHkuZHJhZy5zZXRUbyh0aGlzLkRSQUcsIDApOyAvLyB4LCB5XG5cbiAgICAgICAgLy8gU2luY2Ugd2UncmUganVtcGluZyB3ZSBuZWVkIGdyYXZpdHlcbiAgICAgICAgZ2FtZS5waHlzaWNzLmFyY2FkZS5ncmF2aXR5LnkgPSB0aGlzLkdSQVZJVFk7XG5cbiAgICAgICAgLy8gRmxhZyB0byB0cmFjayBpZiB0aGUganVtcCBidXR0b24gaXMgcHJlc3NlZFxuICAgICAgICB0aGlzLmp1bXBpbmcgPSBmYWxzZTtcblxuICAgICAgICAvLyAgT3VyIHR3byBhbmltYXRpb25zLCB3YWxraW5nIGxlZnQgYW5kIHJpZ2h0LlxuICAgICAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLmFkZCgnbGVmdCcsIFswLCAxLCAyLCAzXSwgMTAsIHRydWUpXG4gICAgICAgIHRoaXMucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdyaWdodCcsIFs1LCA2LCA3LCA4XSwgMTAsIHRydWUpXG4gICAgICAgIHRoaXMucGxheWVyLnNjb3JlID0gMFxuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdlYXBvbnNcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY3VycmVudFdlYXBvbiA9IDA7XG4gICAgICAgIHRoaXMud2VhcG9ucy5wdXNoKG5ldyBXZWFwb25zLkFLNDcodGhpcy5nYW1lKSk7XG5cblxuICAgICAgICAvKipcbiAgICAgICAgICogVGV4dFxuICAgICAgICAgKi9cbiAgICAgICAgbGV0IHRleHRTdHlsZXMgPSB7IGZvbnRTaXplOiAnMjRweCcsIGZpbGw6ICcjMDAwJyB9XG4gICAgICAgIHRoaXMuc2NvcmVUZXh0ID0gdGhpcy5hZGQudGV4dCgyNSwgMjUsICdTY29yZTogMCcsIHRleHRTdHlsZXMpXG4gICAgICAgIHRoaXMuc2NvcmVUZXh0LmZpeGVkVG9DYW1lcmEgPSB0cnVlXG4gICAgICAgIHRoaXMud2VhcG9uTmFtZSA9IHRoaXMuYWRkLnRleHQodGhpcy5jYW1lcmEud2lkdGggLSAxMDAsIHRoaXMuY2FtZXJhLmhlaWdodCAtIDQ1LCAnQUstNDcnLCB0ZXh0U3R5bGVzKVxuICAgICAgICB0aGlzLndlYXBvbk5hbWUuZml4ZWRUb0NhbWVyYSA9IHRydWVcbiAgICAgICAgdGhpcy5jdXJyZW50SGVhbHRoVGV4dCA9IHRoaXMuYWRkLnRleHQodGhpcy5jYW1lcmEueCArIDI1LCB0aGlzLmNhbWVyYS5oZWlnaHQgLSA0NSwgJzEwMCcsIHRleHRTdHlsZXMpXG4gICAgICAgIHRoaXMuY3VycmVudEhlYWx0aFRleHQuZml4ZWRUb0NhbWVyYSA9IHRydWVcblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDYW1lcmEgU2V0dGluZ3NcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2FtZXJhLmZvbGxvdyh0aGlzLnBsYXllcik7XG5cbiAgICAgICAgdmFyIGNoYW5nZUtleSA9IHRoaXMuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5FTlRFUik7XG4gICAgICAgIGNoYW5nZUtleS5vbkRvd24uYWRkKHRoaXMubmV4dFdlYXBvbiwgdGhpcylcblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXNpemluZyBFdmVudHNcbiAgICAgICAgICovXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmdhbWUuc2NhbGUucmVmcmVzaCgpXG4gICAgICAgICAgICB0aGlzLmdhbWUuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0XG4gICAgICAgICAgICB0aGlzLmdhbWUud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aFxuXG4gICAgICAgICAgICB0aGlzLndlYXBvbk5hbWUuY2FtZXJhT2Zmc2V0LnggPSB0aGlzLmNhbWVyYS53aWR0aCAtIDEwMFxuICAgICAgICAgICAgdGhpcy53ZWFwb25OYW1lLmNhbWVyYU9mZnNldC55ID0gdGhpcy5jYW1lcmEuaGVpZ2h0IC0gNDVcblxuICAgICAgICAgICAgdGhpcy5zY29yZVRleHQuY2FtZXJhT2Zmc2V0LnggPSAyNVxuICAgICAgICAgICAgdGhpcy5zY29yZVRleHQuY2FtZXJhT2Zmc2V0LnkgPSAyNVxuICAgICAgICB9KVxuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFN0YXJ0IGxpc3RlbmluZyBmb3IgZXZlbnRzXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnNldEV2ZW50SGFuZGxlcnMoKVxuICAgIH0sXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyAgQ29sbGlkZSB0aGUgcGxheWVyIGFuZCB0aGUgc3RhcnMgd2l0aCB0aGUgcGxhdGZvcm1zXG4gICAgICAgIHRoaXMucGh5c2ljcy5hcmNhZGUuY29sbGlkZSh0aGlzLnBsYXllciwgdGhpcy5wbGF0Zm9ybXMpXG4gICAgICAgIHRoaXMucGh5c2ljcy5hcmNhZGUuY29sbGlkZSh0aGlzLmVuZW1pZXMsIHRoaXMucGxhdGZvcm1zKVxuICAgICAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5lbmVteSwgdGhpcy5wbGF0Zm9ybXMpXG4gICAgICAgIHRoaXMucGh5c2ljcy5hcmNhZGUuY29sbGlkZSh0aGlzLnBsYXRmb3JtcywgdGhpcy53ZWFwb25zLCBmdW5jdGlvbihwbGF0Zm9ybSwgd2VhcG9uKSB7XG4gICAgICAgICAgICB3ZWFwb24ua2lsbCgpXG4gICAgICAgIH0sIG51bGwsIHRoaXMpO1xuXG4gICAgICAgIHRoaXMuZW5lbWllcy5mb3JFYWNoKChlbmVteSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLm92ZXJsYXAoZW5lbXksIHRoaXMud2VhcG9ucywgKGVuZW15LCB3ZWFwb24pID0+IHtcbiAgICAgICAgICAgICAgICBlbmVteS5oZWFsdGggLT0gd2VhcG9uLmRhbWFnZVxuICAgICAgICAgICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ2RhbWFnZWQgcGxheWVyJywge1xuICAgICAgICAgICAgICAgICAgICBwbGF5ZXJJZDogZW5lbXkuaWQsXG4gICAgICAgICAgICAgICAgICAgIGNsaWVudElkOiB0aGlzLmNsaWVudElkLFxuICAgICAgICAgICAgICAgICAgICBkYW1hZ2U6IHdlYXBvbi5kYW1hZ2VcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIHdlYXBvbi5raWxsKClcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnWW91IGhpdCB0aGVtIScsIGVuZW15LmhlYWx0aCwgd2VhcG9uLmRhbWFnZSlcbiAgICAgICAgICAgIH0sIG51bGwsIHRoaXMpXG4gICAgICAgIH0pXG5cblxuICAgICAgICAvLyBCdWxsZXQgaGFzIGhpdCBhIHBsYXllclxuICAgICAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUub3ZlcmxhcCh0aGlzLmVuZW15LCB0aGlzLndlYXBvbnMsIChlbmVteSwgd2VhcG9uKSA9PiB7XG4gICAgICAgICAgICBlbmVteS5oZWFsdGggLT0gd2VhcG9uLmRhbWFnZVxuICAgICAgICAgICAgd2VhcG9uLmtpbGwoKVxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1lvdSBoaXQgdGhlbSEnLCBlbmVteS5oZWFsdGgsIHdlYXBvbi5kYW1hZ2UpXG4gICAgICAgICAgICBpZiAoZW5lbXkuaGVhbHRoIDw9IDApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnVGhleSBhcmUgZGVhZCEnKVxuICAgICAgICAgICAgICAgIHRoaXMuZW5lbXkueCA9IDIwMFxuICAgICAgICAgICAgICAgIHRoaXMuZW5lbXkueSA9IDIwMFxuICAgICAgICAgICAgICAgIHRoaXMuZW5lbXkuaGVhbHRoID0gMTAwXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXIuc2NvcmUrK1xuICAgICAgICAgICAgICAgIHRoaXMuc2NvcmVUZXh0LnRleHQgPSB0aGlzLnBsYXllci5zY29yZVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCBudWxsLCB0aGlzKVxuXG4gICAgICAgIGlmICh0aGlzLmxlZnRJbnB1dElzQWN0aXZlKCkpIHtcbiAgICAgICAgICAgIC8vIElmIHRoZSBMRUZUIGtleSBpcyBkb3duLCBzZXQgdGhlIHBsYXllciB2ZWxvY2l0eSB0byBtb3ZlIGxlZnRcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmJvZHkuYWNjZWxlcmF0aW9uLnggPSAtdGhpcy5BQ0NFTEVSQVRJT047XG4gICAgICAgICAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLnBsYXkoJ2xlZnQnKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucmlnaHRJbnB1dElzQWN0aXZlKCkpIHtcbiAgICAgICAgICAgIC8vIElmIHRoZSBSSUdIVCBrZXkgaXMgZG93biwgc2V0IHRoZSBwbGF5ZXIgdmVsb2NpdHkgdG8gbW92ZSByaWdodFxuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5hY2NlbGVyYXRpb24ueCA9IHRoaXMuQUNDRUxFUkFUSU9OO1xuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdyaWdodCcpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBTdGFuZCBzdGlsbFxuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5hY2NlbGVyYXRpb24ueCA9IDBcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmFuaW1hdGlvbnMuc3RvcCgpXG4gICAgICAgICAgICB0aGlzLnBsYXllci5mcmFtZSA9IDRcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNldCBhIHZhcmlhYmxlIHRoYXQgaXMgdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgaXMgdG91Y2hpbmcgdGhlIGdyb3VuZFxuICAgICAgICB2YXIgb25UaGVHcm91bmQgPSB0aGlzLnBsYXllci5ib2R5LnRvdWNoaW5nLmRvd247XG5cbiAgICAgICAgLy8gSWYgdGhlIHBsYXllciBpcyB0b3VjaGluZyB0aGUgZ3JvdW5kLCBsZXQgaGltIGhhdmUgMiBqdW1wc1xuICAgICAgICBpZiAob25UaGVHcm91bmQpIHtcbiAgICAgICAgICAgIHRoaXMuanVtcHMgPSAyO1xuICAgICAgICAgICAgdGhpcy5qdW1waW5nID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBKdW1wIVxuICAgICAgICBpZiAodGhpcy5qdW1wcyA+IDAgJiYgdGhpcy51cElucHV0SXNBY3RpdmUoNSkpIHtcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmJvZHkudmVsb2NpdHkueSA9IHRoaXMuSlVNUF9TUEVFRDtcbiAgICAgICAgICAgIHRoaXMuanVtcGluZyA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZWR1Y2UgdGhlIG51bWJlciBvZiBhdmFpbGFibGUganVtcHMgaWYgdGhlIGp1bXAgaW5wdXQgaXMgcmVsZWFzZWRcbiAgICAgICAgaWYgKHRoaXMuanVtcGluZyAmJiB0aGlzLnVwSW5wdXRSZWxlYXNlZCgpKSB7XG4gICAgICAgICAgICB0aGlzLmp1bXBzLS07XG4gICAgICAgICAgICB0aGlzLmp1bXBpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmdhbWUuaW5wdXQuYWN0aXZlUG9pbnRlci5pc0Rvd24pXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLmZpcmUodGhpcy5wbGF5ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnbW92ZSBwbGF5ZXInLCB7IHg6IHRoaXMucGxheWVyLngsIHk6IHRoaXMucGxheWVyLnkgfSlcbiAgICB9LFxuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiBzaG91bGQgcmV0dXJuIHRydWUgd2hlbiB0aGUgcGxheWVyIGFjdGl2YXRlcyB0aGUgXCJnbyBsZWZ0XCIgY29udHJvbFxuICAgIC8vIEluIHRoaXMgY2FzZSwgZWl0aGVyIGhvbGRpbmcgdGhlIHJpZ2h0IGFycm93IG9yIHRhcHBpbmcgb3IgY2xpY2tpbmcgb24gdGhlIGxlZnRcbiAgICAvLyBzaWRlIG9mIHRoZSBzY3JlZW4uXG4gICAgbGVmdElucHV0SXNBY3RpdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnB1dC5rZXlib2FyZC5pc0Rvd24oUGhhc2VyLktleWJvYXJkLkEpXG4gICAgfSxcblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gc2hvdWxkIHJldHVybiB0cnVlIHdoZW4gdGhlIHBsYXllciBhY3RpdmF0ZXMgdGhlIFwiZ28gcmlnaHRcIiBjb250cm9sXG4gICAgLy8gSW4gdGhpcyBjYXNlLCBlaXRoZXIgaG9sZGluZyB0aGUgcmlnaHQgYXJyb3cgb3IgdGFwcGluZyBvciBjbGlja2luZyBvbiB0aGUgcmlnaHRcbiAgICAvLyBzaWRlIG9mIHRoZSBzY3JlZW4uXG4gICAgcmlnaHRJbnB1dElzQWN0aXZlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5wdXQua2V5Ym9hcmQuaXNEb3duKFBoYXNlci5LZXlib2FyZC5EKVxuICAgIH0sXG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIHNob3VsZCByZXR1cm4gdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgYWN0aXZhdGVzIHRoZSBcImp1bXBcIiBjb250cm9sXG4gICAgLy8gSW4gdGhpcyBjYXNlLCBlaXRoZXIgaG9sZGluZyB0aGUgdXAgYXJyb3cgb3IgdGFwcGluZyBvciBjbGlja2luZyBvbiB0aGUgY2VudGVyXG4gICAgLy8gcGFydCBvZiB0aGUgc2NyZWVuLlxuICAgIHVwSW5wdXRJc0FjdGl2ZTogZnVuY3Rpb24oZHVyYXRpb24pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5wdXQua2V5Ym9hcmQuZG93bkR1cmF0aW9uKFBoYXNlci5LZXlib2FyZC5XLCBkdXJhdGlvbik7XG4gICAgfSxcblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gcmV0dXJucyB0cnVlIHdoZW4gdGhlIHBsYXllciByZWxlYXNlcyB0aGUgXCJqdW1wXCIgY29udHJvbFxuICAgIHVwSW5wdXRSZWxlYXNlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlucHV0LmtleWJvYXJkLnVwRHVyYXRpb24oUGhhc2VyLktleWJvYXJkLlcpO1xuICAgIH0sXG5cbiAgICBuZXh0V2VhcG9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gIFRpZHktdXAgdGhlIGN1cnJlbnQgd2VhcG9uXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRXZWFwb24gPiA5KVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS5yZXNldCgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0udmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0uY2FsbEFsbCgncmVzZXQnLCBudWxsLCAwLCAwKTtcbiAgICAgICAgICAgIHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLnNldEFsbCgnZXhpc3RzJywgZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gIEFjdGl2YXRlIHRoZSBuZXcgb25lXG4gICAgICAgIHRoaXMuY3VycmVudFdlYXBvbisrO1xuXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRXZWFwb24gPT09IHRoaXMud2VhcG9ucy5sZW5ndGgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFdlYXBvbiA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS52aXNpYmxlID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLndlYXBvbk5hbWUudGV4dCA9IHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLm5hbWU7XG4gICAgfSxcblxuICAgIHNldEV2ZW50SGFuZGxlcnM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gU29ja2V0IGNvbm5lY3Rpb24gc3VjY2Vzc2Z1bFxuICAgICAgICB0aGlzLnNvY2tldC5vbignY29ubmVjdCcsIHRoaXMub25Tb2NrZXRDb25uZWN0ZWQuYmluZCh0aGlzKSlcblxuICAgICAgICAvLyBTb2NrZXQgZGlzY29ubmVjdGlvblxuICAgICAgICB0aGlzLnNvY2tldC5vbignZGlzY29ubmVjdCcsIHRoaXMub25Tb2NrZXREaXNjb25uZWN0LmJpbmQodGhpcykpXG5cbiAgICAgICAgLy8gTmV3IHBsYXllciBtZXNzYWdlIHJlY2VpdmVkXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCduZXcgcGxheWVyJywgdGhpcy5vbk5ld1BsYXllci5iaW5kKHRoaXMpKVxuXG4gICAgICAgIC8vIFBsYXllciBtb3ZlIG1lc3NhZ2UgcmVjZWl2ZWRcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ21vdmUgcGxheWVyJywgdGhpcy5vbk1vdmVQbGF5ZXIuYmluZCh0aGlzKSlcblxuICAgICAgICAvLyBQbGF5ZXIgcmVtb3ZlZCBtZXNzYWdlIHJlY2VpdmVkXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdyZW1vdmUgcGxheWVyJywgdGhpcy5vblJlbW92ZVBsYXllci5iaW5kKHRoaXMpKVxuICAgIH0sXG5cbiAgICAvLyBTb2NrZXQgY29ubmVjdGVkXG4gICAgb25Tb2NrZXRDb25uZWN0ZWQ6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0Nvbm5lY3RlZCB0byBzb2NrZXQgc2VydmVyJylcblxuICAgICAgICAgLy8gUmVzZXQgZW5lbWllcyBvbiByZWNvbm5lY3RcbiAgICAgICAgdGhpcy5lbmVtaWVzLmZvckVhY2goZnVuY3Rpb24gKGVuZW15KSB7XG4gICAgICAgICAgICBlbmVteS5wbGF5ZXIua2lsbCgpXG4gICAgICAgIH0pXG4gICAgICAgIHRoaXMuZW5lbWllcyA9IFtdXG5cbiAgICAgICAgLy8gU2VuZCBsb2NhbCBwbGF5ZXIgZGF0YSB0byB0aGUgZ2FtZSBzZXJ2ZXJcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnbmV3IHBsYXllcicsIHtcbiAgICAgICAgICAgIGNsaWVudElkOiB0aGlzLmNsaWVudElkLFxuICAgICAgICAgICAgeDogdGhpcy5wbGF5ZXIueCxcbiAgICAgICAgICAgIHk6IHRoaXMucGxheWVyLnlcbiAgICAgICAgfSlcbiAgICB9LFxuXG4gICAgLy8gU29ja2V0IGRpc2Nvbm5lY3RlZFxuICAgIG9uU29ja2V0RGlzY29ubmVjdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdEaXNjb25uZWN0ZWQgZnJvbSBzb2NrZXQgc2VydmVyJylcbiAgICB9LFxuXG4gICAgLy8gTmV3IHBsYXllclxuICAgIG9uTmV3UGxheWVyOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdOZXcgcGxheWVyIGNvbm5lY3RlZDonLCBkYXRhLmlkKVxuXG4gICAgICAgIC8vIEF2b2lkIHBvc3NpYmxlIGR1cGxpY2F0ZSBwbGF5ZXJzXG4gICAgICAgIHZhciBkdXBsaWNhdGUgPSB0aGlzLnBsYXllckJ5SWQoZGF0YS5pZClcbiAgICAgICAgaWYgKGR1cGxpY2F0ZSB8fCBkYXRhLmNsaWVudElkID09PSB0aGlzLmNsaWVudElkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnRHVwbGljYXRlIHBsYXllciEnKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICBsZXQgbmV3UmVtb3RlUGxheWVyID0gUmVtb3RlUGxheWVyLmNyZWF0ZS5jYWxsKHRoaXMsIHtcbiAgICAgICAgICAgIHg6IGRhdGEueCxcbiAgICAgICAgICAgIHk6IGRhdGEueSxcbiAgICAgICAgICAgIGlkOiBkYXRhLmlkXG4gICAgICAgIH0pXG5cbiAgICAgICAgdGhpcy5lbmVtaWVzLnB1c2gobmV3UmVtb3RlUGxheWVyKVxuICAgIH0sXG5cbiAgICAvLyBNb3ZlIHBsYXllclxuICAgIG9uTW92ZVBsYXllcjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgbW92ZVBsYXllciA9IHRoaXMucGxheWVyQnlJZChkYXRhLmlkKVxuXG4gICAgICAgIC8vIFBsYXllciBub3QgZm91bmRcbiAgICAgICAgaWYgKCEgbW92ZVBsYXllcikge1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICAvLyBVcGRhdGUgcGxheWVyIHBvc2l0aW9uXG4gICAgICAgIG1vdmVQbGF5ZXIueCA9IGRhdGEueFxuICAgICAgICBtb3ZlUGxheWVyLnkgPSBkYXRhLnlcblxuICAgICAgICBpZiAobW92ZVBsYXllci54ID4gbW92ZVBsYXllci5sYXN0UG9zaXRpb24ueCkge1xuICAgICAgICAgICAgbW92ZVBsYXllci5hbmltYXRpb25zLnBsYXkoJ3JpZ2h0JylcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChtb3ZlUGxheWVyLnggPCBtb3ZlUGxheWVyLmxhc3RQb3NpdGlvbi54KVxuICAgICAgICB7XG4gICAgICAgICAgICBtb3ZlUGxheWVyLmFuaW1hdGlvbnMucGxheSgnbGVmdCcpXG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICBtb3ZlUGxheWVyLmFuaW1hdGlvbnMuc3RvcCgpXG4gICAgICAgICAgICBtb3ZlUGxheWVyLmZyYW1lID0gNDtcbiAgICAgICAgfVxuXG4gICAgICAgIG1vdmVQbGF5ZXIubGFzdFBvc2l0aW9uLnggPSBtb3ZlUGxheWVyLnhcbiAgICAgICAgbW92ZVBsYXllci5sYXN0UG9zaXRpb24ueSA9IG1vdmVQbGF5ZXIueVxuICAgIH0sXG5cbiAgICAvLyBSZW1vdmUgcGxheWVyXG4gICAgb25SZW1vdmVQbGF5ZXI6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIHJlbW92ZVBsYXllciA9IHRoaXMucGxheWVyQnlJZChkYXRhLmlkKVxuXG4gICAgICAgIC8vIFBsYXllciBub3QgZm91bmRcbiAgICAgICAgaWYgKCFyZW1vdmVQbGF5ZXIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdQbGF5ZXIgbm90IGZvdW5kOiAnLCBkYXRhLmlkKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICByZW1vdmVQbGF5ZXIua2lsbCgpXG5cbiAgICAgICAgLy8gUmVtb3ZlIHBsYXllciBmcm9tIGFycmF5XG4gICAgICAgIHRoaXMuZW5lbWllcy5zcGxpY2UodGhpcy5lbmVtaWVzLmluZGV4T2YocmVtb3ZlUGxheWVyKSwgMSlcbiAgICB9LFxuXG4gICAgLy8gRmluZCBwbGF5ZXIgYnkgSURcbiAgICBwbGF5ZXJCeUlkOiBmdW5jdGlvbihpZCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZW5lbWllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHRoaXMuZW5lbWllc1tpXS5pZCA9PT0gaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5lbmVtaWVzW2ldXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG59XG5cbmdhbWUuc3RhdGUuYWRkKCdHYW1lJywgUmFuZ2VyU3RldmVHYW1lLCB0cnVlKTtcbiIsIid1c2Ugc3RyaWN0J1xuXG52YXIgQnVsbGV0ID0gZnVuY3Rpb24gKGdhbWUsIGtleSkge1xuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCAwLCAwLCBrZXkpXG5cbiAgICB0aGlzLnRleHR1cmUuYmFzZVRleHR1cmUuc2NhbGVNb2RlID0gUElYSS5zY2FsZU1vZGVzLk5FQVJFU1RcblxuICAgIHRoaXMuYW5jaG9yLnNldCgwLjUpXG5cbiAgICB0aGlzLmNoZWNrV29ybGRCb3VuZHMgPSB0cnVlXG4gICAgdGhpcy5vdXRPZkJvdW5kc0tpbGwgPSB0cnVlXG4gICAgdGhpcy5leGlzdHMgPSBmYWxzZVxuXG4gICAgdGhpcy50cmFja2luZyA9IGZhbHNlXG4gICAgdGhpcy5zY2FsZVNwZWVkID0gMFxufVxuXG5CdWxsZXQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSlcbkJ1bGxldC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBCdWxsZXRcblxuQnVsbGV0LnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24gKHgsIHksIGFuZ2xlLCBzcGVlZCwgZ3gsIGd5KSB7XG4gICAgZ3ggPSBneCB8fCAwXG4gICAgZ3kgPSBneSB8fCAwXG4gICAgdGhpcy5yZXNldCh4LCB5KVxuICAgIC8vIHRoaXMuc2NhbGUuc2V0KDEpXG5cbiAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUubW92ZVRvUG9pbnRlcih0aGlzLCBzcGVlZClcbn1cblxuQnVsbGV0LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMudHJhY2tpbmcpXG4gICAge1xuICAgICAgICB0aGlzLnJvdGF0aW9uID0gTWF0aC5hdGFuMih0aGlzLmJvZHkudmVsb2NpdHkueSwgdGhpcy5ib2R5LnZlbG9jaXR5LngpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnNjYWxlU3BlZWQgPiAwKVxuICAgIHtcbiAgICAgICAgdGhpcy5zY2FsZS54ICs9IHRoaXMuc2NhbGVTcGVlZDtcbiAgICAgICAgdGhpcy5zY2FsZS55ICs9IHRoaXMuc2NhbGVTcGVlZDtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQnVsbGV0XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBndWlkR2VuZXJhdG9yKCkge1xuICAgIHZhciBTNCA9IGZ1bmN0aW9uKCkge1xuICAgICAgIHJldHVybiAoKCgxK01hdGgucmFuZG9tKCkpKjB4MTAwMDApfDApLnRvU3RyaW5nKDE2KS5zdWJzdHJpbmcoMSlcbiAgICB9XG5cbiAgICByZXR1cm4gKFM0KCkrUzQoKStcIi1cIitTNCgpK1wiLVwiK1M0KCkrXCItXCIrUzQoKStcIi1cIitTNCgpK1M0KCkrUzQoKSlcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgUmVtb3RlUGxheWVyID0ge31cblxuUmVtb3RlUGxheWVyLmNyZWF0ZSA9IGZ1bmN0aW9uKGNvbmZpZykge1xuICAgIC8vIEFkZCBuZXcgcGxheWVyIHRvIHRoZSByZW1vdGUgcGxheWVycyBhcnJheVxuICAgIGxldCBuZXdSZW1vdGVQbGF5ZXIgPSB0aGlzLmFkZC5zcHJpdGUoY29uZmlnLngsIGNvbmZpZy55LCAnZHVkZScpO1xuICAgIG5ld1JlbW90ZVBsYXllci5pZCA9IGNvbmZpZy5pZFxuXG4gICAgbmV3UmVtb3RlUGxheWVyLmxhc3RQb3NpdGlvbiA9IHtcbiAgICAgICAgeDogY29uZmlnLngsXG4gICAgICAgIHk6IGNvbmZpZy55XG4gICAgfVxuXG4gICAgLy8gIFdlIG5lZWQgdG8gZW5hYmxlIHBoeXNpY3Mgb24gdGhlIHBsYXllclxuICAgIHRoaXMucGh5c2ljcy5hcmNhZGUuZW5hYmxlKG5ld1JlbW90ZVBsYXllcilcblxuICAgIC8vIEVuYWJsZSBwaHlzaWNzIG9uIHRoZSBwbGF5ZXJcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5lbmFibGUobmV3UmVtb3RlUGxheWVyLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpXG5cbiAgICAvLyBNYWtlIHBsYXllciBjb2xsaWRlIHdpdGggd29ybGQgYm91bmRhcmllcyBzbyBoZSBkb2Vzbid0IGxlYXZlIHRoZSBzdGFnZVxuICAgIG5ld1JlbW90ZVBsYXllci5ib2R5LmNvbGxpZGVXb3JsZEJvdW5kcyA9IHRydWU7XG5cbiAgICAvLyBTZXQgcGxheWVyIG1pbmltdW0gYW5kIG1heGltdW0gbW92ZW1lbnQgc3BlZWRcbiAgICBuZXdSZW1vdGVQbGF5ZXIuYm9keS5tYXhWZWxvY2l0eS5zZXRUbyh0aGlzLk1BWF9TUEVFRCwgdGhpcy5NQVhfU1BFRUQgKiAxMCk7IC8vIHgsIHlcblxuICAgIC8vIEFkZCBkcmFnIHRvIHRoZSBwbGF5ZXIgdGhhdCBzbG93cyB0aGVtIGRvd24gd2hlbiB0aGV5IGFyZSBub3QgYWNjZWxlcmF0aW5nXG4gICAgbmV3UmVtb3RlUGxheWVyLmJvZHkuZHJhZy5zZXRUbyh0aGlzLkRSQUcsIDApOyAvLyB4LCB5XG5cbiAgICBuZXdSZW1vdGVQbGF5ZXIuaGVhbHRoID0gMTAwXG5cbiAgICBuZXdSZW1vdGVQbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ2xlZnQnLCBbMCwgMSwgMiwgM10sIDEwLCB0cnVlKVxuICAgIG5ld1JlbW90ZVBsYXllci5hbmltYXRpb25zLmFkZCgncmlnaHQnLCBbNSwgNiwgNywgOF0sIDEwLCB0cnVlKVxuXG4gICAgcmV0dXJuIG5ld1JlbW90ZVBsYXllclxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlbW90ZVBsYXllclxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgXCJVU1NPQ09NXCI6IHtcbiAgICAgICAgXCJuYW1lXCI6IFwiVVNTT0NPTVwiLFxuICAgICAgICBcIkRhbWFnZVwiOiAxOTAsXG4gICAgICAgIFwiRmlyZUludGVydmFsXCI6IDEyLFxuICAgICAgICBcIkFtbW9cIjogMTIsXG4gICAgICAgIFwiUmVsb2FkVGltZVwiOiA2NSxcbiAgICAgICAgXCJTcGVlZFwiOiAxODAsXG4gICAgICAgIFwiQnVsbGV0U3R5bGVcIjogMSxcbiAgICAgICAgXCJTdGFydFVwVGltZVwiOiAwLFxuICAgICAgICBcIkJpbmtcIjogNCxcbiAgICAgICAgXCJNb3ZlbWVudEFjY1wiOiAxXG4gICAgfSxcbiAgICBcIkRlc2VydEVhZ2xlc1wiOiB7XG4gICAgICAgIFwibmFtZVwiOiBcIkRlc2VydCBFYWdsZXNcIixcbiAgICAgICAgXCJEYW1hZ2VcIjogMjEwLFxuICAgICAgICBcIkZpcmVJbnRlcnZhbFwiOiAyMixcbiAgICAgICAgXCJBbW1vXCI6IDcsXG4gICAgICAgIFwiUmVsb2FkVGltZVwiOiA5MCxcbiAgICAgICAgXCJTcGVlZFwiOiAxOTAsXG4gICAgICAgIFwiQnVsbGV0U3R5bGVcIjogMSxcbiAgICAgICAgXCJTdGFydFVwVGltZVwiOiAwLFxuICAgICAgICBcIkJpbmtcIjogNyxcbiAgICAgICAgXCJNb3ZlbWVudEFjY1wiOiAxXG4gICAgfSxcbiAgICBcIkhLTVA1XCI6IHtcbiAgICAgICAgXCJuYW1lXCI6IFwiSEsgTVA1XCIsXG4gICAgICAgIFwiRGFtYWdlXCI6IDEyMCxcbiAgICAgICAgXCJGaXJlSW50ZXJ2YWxcIjogNixcbiAgICAgICAgXCJBbW1vXCI6IDMwLFxuICAgICAgICBcIlJlbG9hZFRpbWVcIjogMTA1LFxuICAgICAgICBcIlNwZWVkXCI6IDE5MCxcbiAgICAgICAgXCJCdWxsZXRTdHlsZVwiOiAxLFxuICAgICAgICBcIlN0YXJ0VXBUaW1lXCI6IDAsXG4gICAgICAgIFwiQmlua1wiOiAyLFxuICAgICAgICBcIk1vdmVtZW50QWNjXCI6IDFcbiAgICB9LFxuICAgIFwiQUs0N1wiOiB7XG4gICAgICAgIFwibmFtZVwiOiBcIkFLLTQ3XCIsXG4gICAgICAgIFwiZGFtYWdlXCI6IFwiMTIyXCIsXG4gICAgICAgIFwiZmlyZUludGVydmFsXCI6IFwiMTBcIixcbiAgICAgICAgXCJhbW1vXCI6IFwiNDBcIixcbiAgICAgICAgXCJyZWxvYWRUaW1lXCI6IFwiMTUwXCIsXG4gICAgICAgIFwic3BlZWRcIjogXCIyNDBcIixcbiAgICAgICAgXCJidWxsZXRTdHlsZVwiOiBcIjFcIixcbiAgICAgICAgXCJzdGFydFVwVGltZVwiOiBcIjBcIixcbiAgICAgICAgXCJiaW5rXCI6IFwiM1wiLFxuICAgICAgICBcIm1vdmVtZW50QWNjXCI6IFwiMVwiXG4gICAgfSxcbiAgICBcIlN0ZXlyQVVHXCI6IHtcbiAgICAgICAgXCJuYW1lXCI6IFwiTTE2XCIsXG4gICAgICAgIFwiRGFtYWdlXCI6IFwiODBcIixcbiAgICAgICAgXCJGaXJlSW50ZXJ2YWxcIjogXCI3XCIsXG4gICAgICAgIFwiQW1tb1wiOiBcIjMwXCIsXG4gICAgICAgIFwiUmVsb2FkVGltZVwiOiBcIjExNVwiLFxuICAgICAgICBcIlNwZWVkXCI6IFwiMjYwXCIsXG4gICAgICAgIFwiQnVsbGV0U3R5bGVcIjogXCIxXCIsXG4gICAgICAgIFwiU3RhcnRVcFRpbWVcIjogXCIwXCIsXG4gICAgICAgIFwiQmlua1wiOiBcIjJcIixcbiAgICAgICAgXCJNb3ZlbWVudEFjY1wiOiBcIjFcIlxuICAgIH0sXG4gICAgXCJTcGFzMTJcIjoge1xuICAgICAgICBcIm5hbWVcIjogXCJTcGFzLTEyXCIsXG4gICAgICAgIFwiRGFtYWdlXCI6IFwiMTMwXCIsXG4gICAgICAgIFwiRmlyZUludGVydmFsXCI6IFwiMzJcIixcbiAgICAgICAgXCJBbW1vXCI6IFwiN1wiLFxuICAgICAgICBcIlJlbG9hZFRpbWVcIjogXCIxNzVcIixcbiAgICAgICAgXCJTcGVlZFwiOiBcIjE0MFwiLFxuICAgICAgICBcIkJ1bGxldFN0eWxlXCI6IFwiM1wiLFxuICAgICAgICBcIlN0YXJ0VXBUaW1lXCI6IFwiMFwiLFxuICAgICAgICBcIkJpbmtcIjogXCIxMFwiLFxuICAgICAgICBcIk1vdmVtZW50QWNjXCI6IFwiMVwiXG4gICAgfSxcbiAgICBcIlJ1Z2VyNzdcIjoge1xuICAgICAgICBcIm5hbWVcIjogXCJSdWdlciA3N1wiLFxuICAgICAgICBcIkRhbWFnZVwiOiBcIjI1MlwiLFxuICAgICAgICBcIkZpcmVJbnRlcnZhbFwiOiBcIjMwXCIsXG4gICAgICAgIFwiQW1tb1wiOiBcIjRcIixcbiAgICAgICAgXCJSZWxvYWRUaW1lXCI6IFwiNzVcIixcbiAgICAgICAgXCJTcGVlZFwiOiBcIjMzMFwiLFxuICAgICAgICBcIkJ1bGxldFN0eWxlXCI6IFwiMVwiLFxuICAgICAgICBcIlN0YXJ0VXBUaW1lXCI6IFwiMFwiLFxuICAgICAgICBcIkJpbmtcIjogXCIxNVwiLFxuICAgICAgICBcIk1vdmVtZW50QWNjXCI6IFwiM1wiXG4gICAgfSxcbiAgICBcIk03OVwiOiB7XG4gICAgICAgIFwiRGFtYWdlXCI6IDE2MDAwMCxcbiAgICAgICAgXCJGaXJlSW50ZXJ2YWxcIjogNixcbiAgICAgICAgXCJBbW1vXCI6IDEsXG4gICAgICAgIFwiUmVsb2FkVGltZVwiOiAxODAsXG4gICAgICAgIFwiU3BlZWRcIjogMTE1LFxuICAgICAgICBcIkJ1bGxldFN0eWxlXCI6IDQsXG4gICAgICAgIFwiU3RhcnRVcFRpbWVcIjogMCxcbiAgICAgICAgXCJCaW5rXCI6IDMwLFxuICAgICAgICBcIk1vdmVtZW50QWNjXCI6IDNcbiAgICB9LFxuICAgIFwiQmFycmV0IE04MkExXCI6IHtcbiAgICAgICAgXCJEYW1hZ2VcIjogNDk1LFxuICAgICAgICBcIkZpcmVJbnRlcnZhbFwiOiAyNDAsXG4gICAgICAgIFwiQW1tb1wiOiAxMCxcbiAgICAgICAgXCJSZWxvYWRUaW1lXCI6IDMwMCxcbiAgICAgICAgXCJTcGVlZFwiOiBcIjU1MFwiLFxuICAgICAgICBcIkJ1bGxldFN0eWxlXCI6IFwiMVwiLFxuICAgICAgICBcIlN0YXJ0VXBUaW1lXCI6IFwiMFwiLFxuICAgICAgICBcIkJpbmtcIjogXCI4MFwiLFxuICAgICAgICBcIk1vdmVtZW50QWNjXCI6IFwiNlwiXG4gICAgfSxcbiAgICBcIkZOIE1pbmltaVwiOiB7XG4gICAgICAgIFwiRGFtYWdlXCI6IFwiMTAwXCIsXG4gICAgICAgIFwiRmlyZUludGVydmFsXCI6IFwiOVwiLFxuICAgICAgICBcIkFtbW9cIjogXCI1MFwiLFxuICAgICAgICBcIlJlbG9hZFRpbWVcIjogXCIyNTBcIixcbiAgICAgICAgXCJTcGVlZFwiOiBcIjI3MFwiLFxuICAgICAgICBcIkJ1bGxldFN0eWxlXCI6IFwiMVwiLFxuICAgICAgICBcIlN0YXJ0VXBUaW1lXCI6IFwiMFwiLFxuICAgICAgICBcIkJpbmtcIjogXCIzXCIsXG4gICAgICAgIFwiTW92ZW1lbnRBY2NcIjogXCIyXCJcbiAgICB9LFxuICAgIFwiWE0yMTQgTWluaWd1blwiOiB7XG4gICAgICAgIFwiRGFtYWdlXCI6IFwiNTVcIixcbiAgICAgICAgXCJGaXJlSW50ZXJ2YWxcIjogXCI0XCIsXG4gICAgICAgIFwiQW1tb1wiOiBcIjEwMFwiLFxuICAgICAgICBcIlJlbG9hZFRpbWVcIjogXCIzNjZcIixcbiAgICAgICAgXCJTcGVlZFwiOiBcIjI5MFwiLFxuICAgICAgICBcIkJ1bGxldFN0eWxlXCI6IFwiMVwiLFxuICAgICAgICBcIlN0YXJ0VXBUaW1lXCI6IFwiNTBcIixcbiAgICAgICAgXCJCaW5rXCI6IFwiMVwiLFxuICAgICAgICBcIk1vdmVtZW50QWNjXCI6IFwiMVwiXG4gICAgfSxcbiAgICBcIkZsYW1lclwiOiB7XG4gICAgICAgIFwiRGFtYWdlXCI6IFwiMTAwMFwiLFxuICAgICAgICBcIkZpcmVJbnRlcnZhbFwiOiBcIjZcIixcbiAgICAgICAgXCJBbW1vXCI6IFwiMjAwXCIsXG4gICAgICAgIFwiUmVsb2FkVGltZVwiOiBcIjVcIixcbiAgICAgICAgXCJTcGVlZFwiOiBcIjEwNVwiLFxuICAgICAgICBcIkJ1bGxldFN0eWxlXCI6IFwiNVwiLFxuICAgICAgICBcIlN0YXJ0VXBUaW1lXCI6IFwiMFwiLFxuICAgICAgICBcIkJpbmtcIjogXCIyXCIsXG4gICAgICAgIFwiTW92ZW1lbnRBY2NcIjogXCIxXCJcbiAgICB9LFxuICAgIFwiUmFtYm8gQm93XCI6IHtcbiAgICAgICAgXCJEYW1hZ2VcIjogXCIxMjAwXCIsXG4gICAgICAgIFwiRmlyZUludGVydmFsXCI6IFwiMTBcIixcbiAgICAgICAgXCJBbW1vXCI6IFwiMVwiLFxuICAgICAgICBcIlJlbG9hZFRpbWVcIjogXCIyNVwiLFxuICAgICAgICBcIlNwZWVkXCI6IFwiMjEwXCIsXG4gICAgICAgIFwiQnVsbGV0U3R5bGVcIjogXCI3XCIsXG4gICAgICAgIFwiU3RhcnRVcFRpbWVcIjogXCIwXCIsXG4gICAgICAgIFwiQmlua1wiOiBcIjNcIixcbiAgICAgICAgXCJNb3ZlbWVudEFjY1wiOiBcIjFcIlxuICAgIH0sXG4gICAgXCJGbGFtZWQgQXJyb3dzXCI6IHtcbiAgICAgICAgXCJEYW1hZ2VcIjogXCI4MDBcIixcbiAgICAgICAgXCJGaXJlSW50ZXJ2YWxcIjogXCIxMFwiLFxuICAgICAgICBcIkFtbW9cIjogXCIxXCIsXG4gICAgICAgIFwiUmVsb2FkVGltZVwiOiBcIjM2XCIsXG4gICAgICAgIFwiU3BlZWRcIjogXCIxODBcIixcbiAgICAgICAgXCJCdWxsZXRTdHlsZVwiOiBcIjhcIixcbiAgICAgICAgXCJTdGFydFVwVGltZVwiOiBcIjBcIixcbiAgICAgICAgXCJCaW5rXCI6IFwiM1wiLFxuICAgICAgICBcIk1vdmVtZW50QWNjXCI6IFwiMVwiXG4gICAgfSxcbiAgICBcIkNvbWJhdCBLbmlmZVwiOiB7XG4gICAgICAgIFwiRGFtYWdlXCI6IFwiMjEwMDAwXCIsXG4gICAgICAgIFwiRmlyZUludGVydmFsXCI6IFwiNlwiLFxuICAgICAgICBcIkFtbW9cIjogXCIxXCIsXG4gICAgICAgIFwiUmVsb2FkVGltZVwiOiBcIjNcIixcbiAgICAgICAgXCJTcGVlZFwiOiBcIjYwXCIsXG4gICAgICAgIFwiQnVsbGV0U3R5bGVcIjogXCIxMVwiLFxuICAgICAgICBcIlN0YXJ0VXBUaW1lXCI6IFwiMFwiLFxuICAgICAgICBcIkJpbmtcIjogXCIwXCIsXG4gICAgICAgIFwiTW92ZW1lbnRBY2NcIjogXCIxXCJcbiAgICB9LFxuICAgIFwiQ2hhaW5zYXdcIjoge1xuICAgICAgICBcIkRhbWFnZVwiOiBcIjIxMDBcIixcbiAgICAgICAgXCJGaXJlSW50ZXJ2YWxcIjogXCI0XCIsXG4gICAgICAgIFwiQW1tb1wiOiBcIjMwXCIsXG4gICAgICAgIFwiUmVsb2FkVGltZVwiOiBcIjcwXCIsXG4gICAgICAgIFwiU3BlZWRcIjogXCI3MFwiLFxuICAgICAgICBcIkJ1bGxldFN0eWxlXCI6IFwiMTFcIixcbiAgICAgICAgXCJTdGFydFVwVGltZVwiOiBcIjBcIixcbiAgICAgICAgXCJCaW5rXCI6IFwiMFwiLFxuICAgICAgICBcIk1vdmVtZW50QWNjXCI6IFwiMVwiXG4gICAgfSxcbiAgICBcIk03MiBMQVdcIjoge1xuICAgICAgICBcIkRhbWFnZVwiOiBcIjE1MDAwMFwiLFxuICAgICAgICBcIkZpcmVJbnRlcnZhbFwiOiBcIjYwXCIsXG4gICAgICAgIFwiQW1tb1wiOiBcIjFcIixcbiAgICAgICAgXCJSZWxvYWRUaW1lXCI6IFwiNjAwXCIsXG4gICAgICAgIFwiU3BlZWRcIjogXCIyMzBcIixcbiAgICAgICAgXCJCdWxsZXRTdHlsZVwiOiBcIjEyXCIsXG4gICAgICAgIFwiU3RhcnRVcFRpbWVcIjogXCIwXCIsXG4gICAgICAgIFwiQmlua1wiOiBcIjIwXCIsXG4gICAgICAgIFwiTW92ZW1lbnRBY2NcIjogXCIxXCJcbiAgICB9LFxuICAgIFwiUHVuY2hcIjoge1xuICAgICAgICBcIkRhbWFnZVwiOiBcIjMzMDAwXCIsXG4gICAgICAgIFwiRmlyZUludGVydmFsXCI6IFwiNlwiLFxuICAgICAgICBcIkFtbW9cIjogXCIxXCIsXG4gICAgICAgIFwiUmVsb2FkVGltZVwiOiBcIjNcIixcbiAgICAgICAgXCJTcGVlZFwiOiBcIjUwXCIsXG4gICAgICAgIFwiQnVsbGV0U3R5bGVcIjogXCI2XCIsXG4gICAgICAgIFwiU3RhcnRVcFRpbWVcIjogXCIwXCIsXG4gICAgICAgIFwiQmlua1wiOiBcIjJcIixcbiAgICAgICAgXCJNb3ZlbWVudEFjY1wiOiBcIjFcIlxuICAgIH0sXG4gICAgXCJHcmVuYWRlXCI6IHtcbiAgICAgICAgXCJEYW1hZ2VcIjogXCIxNTAwMDBcIixcbiAgICAgICAgXCJGaXJlSW50ZXJ2YWxcIjogXCI4MFwiLFxuICAgICAgICBcIkFtbW9cIjogXCIxXCIsXG4gICAgICAgIFwiUmVsb2FkVGltZVwiOiBcIjIwXCIsXG4gICAgICAgIFwiU3BlZWRcIjogXCI1MFwiLFxuICAgICAgICBcIkJ1bGxldFN0eWxlXCI6IFwiMlwiLFxuICAgICAgICBcIlN0YXJ0VXBUaW1lXCI6IFwiMFwiLFxuICAgICAgICBcIkJpbmtcIjogXCIwXCIsXG4gICAgICAgIFwiTW92ZW1lbnRBY2NcIjogXCIxXCJcbiAgICB9LFxuICAgIFwiU3RhdGlvbmFyeSBHdW5cIjoge1xuICAgICAgICBcIkRhbWFnZVwiOiBcIjUwXCIsXG4gICAgICAgIFwiRmlyZUludGVydmFsXCI6IFwiNFwiLFxuICAgICAgICBcIkFtbW9cIjogXCIxMDBcIixcbiAgICAgICAgXCJSZWxvYWRUaW1lXCI6IFwiMzY2XCIsXG4gICAgICAgIFwiU3BlZWRcIjogXCIyOTBcIixcbiAgICAgICAgXCJCdWxsZXRTdHlsZVwiOiBcIjFcIixcbiAgICAgICAgXCJTdGFydFVwVGltZVwiOiBcIjBcIixcbiAgICAgICAgXCJCaW5rXCI6IFwiMFwiLFxuICAgICAgICBcIk1vdmVtZW50QWNjXCI6IFwiMVwiXG4gICAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBCdWxsZXQgPSByZXF1aXJlKCcuLi9CdWxsZXQnKVxuXG5sZXQgQUs0NyA9IGZ1bmN0aW9uIChnYW1lKSB7XG4gICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgZ2FtZSwgZ2FtZS53b3JsZCwgJ0FLLTQ3JywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG5cbiAgICB0aGlzLmRhbWFnZSA9IDIyXG4gICAgdGhpcy5uZXh0RmlyZSA9IDBcbiAgICB0aGlzLmJ1bGxldFNwZWVkID0gMTAwMFxuXG4gICAgLy8gQUs0NyBmaXJlcyBhYm91dCA2MDAgYnVsbGV0cyBwZXIgc2Vjb25kXG4gICAgdGhpcy5maXJlUmF0ZSA9IDE2Ni42NjY2NjdcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNjQ7IGkrKylcbiAgICB7XG4gICAgICAgIGxldCBidWxsZXQgPSBuZXcgQnVsbGV0KHRoaXMuZ2FtZSwgJ2dyb3VuZCcpXG4gICAgICAgIGJ1bGxldC5oZWlnaHQgPSAzXG4gICAgICAgIGJ1bGxldC53aWR0aCA9IDEwXG4gICAgICAgIGJ1bGxldC5kYW1hZ2UgPSAyMlxuICAgICAgICBjb25zb2xlLmxvZyhidWxsZXQpXG5cbiAgICAgICAgdGhpcy5hZGQoYnVsbGV0LCB0cnVlKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG59XG5cbkFLNDcucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcbkFLNDcucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQUs0NztcblxuQUs0Ny5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uIChzb3VyY2UpIHtcbiAgICBpZiAodGhpcy5nYW1lLnRpbWUudGltZSA8IHRoaXMubmV4dEZpcmUpXG4gICAgICAgIHJldHVyblxuXG4gICAgdmFyIHggPSBzb3VyY2UueCAtIDIyO1xuICAgIHZhciB5ID0gc291cmNlLnkgKyAzMDtcblxuICAgIHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgMClcbiAgICB0aGlzLnNldEFsbCgndHJhY2tpbmcnLCB0cnVlKVxuXG4gICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMuZ2FtZS50aW1lLnRpbWUgKyB0aGlzLmZpcmVSYXRlXG4gICAgY29uc29sZS5sb2codGhpcylcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBSzQ3XG4iLCIndXNlIHN0cmljdCdcblxuLyoqXG4gKiBQcmltYXJ5IFdlYXBvbnNcbiAqIDEuIERlc2VydCBFYWdsZXNcbiAqIDIuIEhLIE1QNVxuICogMy4gQUs0N1xuICogNC4gTTE2XG4gKiA1LiBTcGFzLTEyXG4gKiA2LiBSdWdlciA3N1xuICogNy4gTTc5XG4gKiA4LiBCYXJyZXQgTTgyQTFcbiAqIDkuIEZOIE1pbmltaVxuICogMTAuIFhNMjE0IE1pbmlndW5cbiAqL1xuXG4vKipcbiAqIFNlY29uZGFyeSBXZWFwb25zXG4gKiAxLiBVU1NPQ09NXG4gKiAyLiBDb21iYXQgS25pZmVcbiAqIDMuIENoYWluc2F3XG4gKiA0LiBNNzIgTGF3XG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgXCJBSzQ3XCI6IHJlcXVpcmUoJy4vQUs0NycpXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IE1hcEN0ZjEgPSB7fVxuXG5NYXBDdGYxLmNyZWF0ZSA9IGZ1bmN0aW9uKHNjb3BlKSB7XG4gICAgdGhpcy5zY29wZSA9IHNjb3BlXG5cbiAgICB0aGlzLmNyZWF0ZVNreVNwcml0ZSgpXG4gICAgdGhpcy5jcmVhdGVQbGF0Zm9ybXMoKVxuICAgIHRoaXMuY3JlYXRlTGVkZ2VzKClcblxuICAgIHRoaXMuc2NvcGUucGxhdGZvcm1zLnNldEFsbCgnYm9keS5pbW1vdmFibGUnLCB0cnVlKVxuICAgIHRoaXMuc2NvcGUucGxhdGZvcm1zLnNldEFsbCgnYm9keS5hbGxvd0dyYXZpdHknLCBmYWxzZSlcbn1cblxuTWFwQ3RmMS5jcmVhdGVMZWRnZXMgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgbGVkZ2VzID0gW1xuICAgICAgICAvLyB7eCwgeSwgd2lkdGgsIGhlaWdodH1cblxuICAgICAgICAvLyBTdGFydGluZyBMZWRnZXNcbiAgICAgICAgeyBpZDogMSwgeDogMCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDQzMSwgd2lkdGg6IDEyOCwgaGVpZ2h0OiA5MiB9LCAvLyBMZWZ0IGJvdHRvbSBsZWRnZVxuICAgICAgICB7IGlkOiAyLCB4OiAwLCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gODM4LCB3aWR0aDogMTI4LCBoZWlnaHQ6IDkyIH0sIC8vIExlZnQgdG9wIGxlZGdlXG5cbiAgICAgICAgeyBpZDogMywgeDogMzg3MiwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDQyNywgd2lkdGg6IDEyOCwgaGVpZ2h0OiA5MiB9LCAvLyBSaWdodCBib3R0b20gbGVkZ2VcbiAgICAgICAgeyBpZDogNCwgeDogMzg3MiwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDgzNSwgd2lkdGg6IDEyOCwgaGVpZ2h0OiA5MiB9LCAvLyBSaWdodCB0b3AgbGVkZ2VcblxuICAgICAgICAvLyBHcm91bmQgTGVkZ2VzXG4gICAgICAgIHsgaWQ6IDUsIHg6IDAsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSAxMjgsIHdpZHRoOiA0NzQsIGhlaWdodDogMTI4IH0sIC8vIE1haW4gYm90dG9tIHN0YXJ0aW5nIGxlZnQgbGVkZ2VcbiAgICAgICAgeyBpZDogNiwgeDogNDc0LCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gMjU2LCB3aWR0aDogNjQxLCBoZWlnaHQ6IDI2MCB9LCAvLyBNYWluIGJvdHRvbSBsZWZ0IGxlZGdlXG4gICAgICAgIHsgaWQ6IDcsIHg6IDExMTUsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSAzODQsIHdpZHRoOiAxNzg1LCBoZWlnaHQ6IDM5MCB9LCAvLyBNYWluIGJvdHRvbSBjZW50ZXIgbGVkZ2VcbiAgICAgICAgeyBpZDogOCwgeDogMjkwMCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDI1Niwgd2lkdGg6IDY0MSwgaGVpZ2h0OiAyNjAgfSwgLy8gTWFpbiBib3R0b20gcmlnaHQgbGVkZ2VcbiAgICAgICAgeyBpZDogOSwgeDogMzU0MCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDEyOCwgd2lkdGg6IDQ3NCwgaGVpZ2h0OiAxMjggfSwgLy8gTWFpbiBib3R0b20gc3RhcnRpbmcgcmlnaHQgbGVkZ2VcblxuICAgICAgICAvLyBBaXIgTGVkZ2VzXG4gICAgICAgIHsgaWQ6IDEwLCB4OiAzMDAsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA2MDgsIHdpZHRoOiA2NDEsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogMTEsIHg6IDExMTAsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA3MDEsIHdpZHRoOiA1MTMsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogMTIsIHg6IDg3MCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDk4Miwgd2lkdGg6IDI1NiwgaGVpZ2h0OiA5MiB9LFxuICAgICAgICB7IGlkOiAxMywgeDogMTc0NCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDg3NCwgd2lkdGg6IDUwNywgaGVpZ2h0OiAyNTQgfSxcbiAgICAgICAgeyBpZDogMTQsIHg6IDIzOTAsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA2ODksIHdpZHRoOiA1MTMsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogMTUsIHg6IDMwMzEsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA2MDgsIHdpZHRoOiA2NDEsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogMTYsIHg6IDI5MDMsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA5NTcsIHdpZHRoOiAyNTYsIGhlaWdodDogOTIgfVxuICAgIF1cblxuXG4gICAgbGVkZ2VzLmZvckVhY2goKGxlZGdlKSA9PiB7XG4gICAgICAgIC8vIHZhciBuZXdMZWRnZSA9IHRoaXMuc2NvcGUucGxhdGZvcm1zLmNyZWF0ZShsZWRnZS54LCBsZWRnZS55LCAnZ3JvdW5kJylcbiAgICAgICAgdmFyIG5ld0xlZGdlID0gdGhpcy5zY29wZS5wbGF0Zm9ybXMuY3JlYXRlKGxlZGdlLngsIGxlZGdlLnkpXG4gICAgICAgIG5ld0xlZGdlLmhlaWdodCA9IGxlZGdlLmhlaWdodFxuICAgICAgICBuZXdMZWRnZS53aWR0aCA9IGxlZGdlLndpZHRoXG5cbiAgICAgICAgLy8gRGVidWcgc3R1ZmZcbiAgICAgICAgLy8gbmV3TGVkZ2UuYWxwaGEgPSAwLjJcbiAgICAgICAgLy8gbGV0IHN0eWxlID0geyBmb250OiBcIjIwcHggQXJpYWxcIiwgZmlsbDogXCIjZmYwMDQ0XCIsIGFsaWduOiBcImNlbnRlclwiLCBiYWNrZ3JvdW5kQ29sb3I6IFwiI2ZmZmYwMFwiIH1cbiAgICAgICAgLy8gbGV0IHRleHQgPSB0aGlzLnNjb3BlLmdhbWUuYWRkLnRleHQobGVkZ2UueCwgbGVkZ2UueSwgbGVkZ2UuaWQsIHN0eWxlKVxuICAgICAgICAvLyB0ZXh0LmFscGhhID0gMC4yXG4gICAgfSlcbn1cblxuTWFwQ3RmMS5jcmVhdGVTa3lTcHJpdGUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNjb3BlLmFkZC50aWxlU3ByaXRlKDAsIHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSAxNTAwLCB0aGlzLnNjb3BlLmdhbWUud29ybGQud2lkdGgsIDE1MDAsICd0cmVlc2NhcGUnKVxufVxuXG5NYXBDdGYxLmNyZWF0ZVBsYXRmb3JtcyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2NvcGUucGxhdGZvcm1zID0gdGhpcy5zY29wZS5hZGQuZ3JvdXAoKVxuICAgIHRoaXMuc2NvcGUucGxhdGZvcm1zLmVuYWJsZUJvZHkgPSB0cnVlXG59XG5cbm1vZHVsZS5leHBvcnRzID0gTWFwQ3RmMVxuIl19
