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
    console.log('newRemotePlayer', newRemotePlayer);

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
    this.bulletSpeed = 5000;

    // AK47 fires about 600 bullets per second
    this.fireRate = 166.666667;

    for (var i = 0; i < 64; i++) {
        var bullet = new Bullet(this.game, 'ground');
        bullet.height = 3;
        bullet.width = 84;
        bullet.damage = 22;
        this.add(bullet, true);
    }

    return this;
};

AK47.prototype = Object.create(Phaser.Group.prototype);
AK47.prototype.constructor = AK47;

AK47.prototype.fire = function (source) {
    if (this.game.time.time < this.nextFire) return;

    var x = source.x + 22;
    var y = source.y + 30;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0);
    this.setAll('tracking', true);

    this.nextFire = this.game.time.time + this.fireRate;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvYXBwLmpzIiwiYXNzZXRzL2pzL2xpYi9CdWxsZXQuanMiLCJhc3NldHMvanMvbGliL0d1aWQuanMiLCJhc3NldHMvanMvbGliL1JlbW90ZVBsYXllci5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9uU2V0dGluZ3MuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvQUs0Ny5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9pbmRleC5qcyIsImFzc2V0cy9qcy9tYXBzL01hcEN0ZjEuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7QUFFQSxJQUFJLFVBQVUsUUFBUSxnQkFBUixDQUFWO0FBQ0osSUFBSSxlQUFlLFFBQVEsb0JBQVIsQ0FBZjtBQUNKLElBQUksaUJBQWlCLFFBQVEsc0JBQVIsQ0FBakI7QUFDSixJQUFJLE9BQU8sUUFBUSxZQUFSLENBQVA7QUFDSixJQUFJLFVBQVUsUUFBUSxlQUFSLENBQVY7QUFDSixJQUFJLFNBQVMsUUFBUSxjQUFSLENBQVQ7O0FBRUosSUFBSSxZQUFZLE9BQU8sVUFBUDtBQUNoQixJQUFJLGFBQWEsT0FBTyxXQUFQO0FBQ2pCLElBQUksYUFBYSxJQUFiO0FBQ0osSUFBSSxjQUFjLElBQWQ7O0FBRUosSUFBSSxPQUFPLElBQUksT0FBTyxJQUFQLENBQVksU0FBaEIsRUFBMkIsVUFBM0IsRUFBdUMsT0FBTyxNQUFQLEVBQWUsbUJBQXRELENBQVA7O0FBRUosSUFBSSxrQkFBa0IsU0FBbEIsZUFBa0IsR0FBVztBQUM3QixTQUFLLFFBQUwsR0FBZ0IsTUFBaEIsQ0FENkI7QUFFN0IsU0FBSyxhQUFMLEdBQXFCLENBQXJCLENBRjZCO0FBRzdCLFNBQUssT0FBTCxHQUFlLEVBQWYsQ0FINkI7QUFJN0IsU0FBSyxJQUFMLEdBQVksSUFBWixDQUo2QjtBQUs3QixTQUFLLE1BQUwsQ0FMNkI7QUFNN0IsU0FBSyxTQUFMLENB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SUFBWCxDQUFnQixLQUFoQixDQUFzQixNQUF0QixHQUErQixJQUEvQixFQUFxQyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEtBQWhCLENBQXNCLEtBQXRCLEVBQTZCLElBQS9GLEVBQXFHLFdBQXJHLEVBRGlDO0NBQVg7O0FBSTFCLFFBQVEsZUFBUixHQUEwQixZQUFXO0FBQ2pDLFNBQUssS0FBTCxDQUFXLFNBQVgsR0FBdUIsS0FBSyxLQUFMLENBQVcsR0FBWCxDQUFlLEtBQWYsRUFBdkIsQ0FEaUM7QUFFakMsU0FBSyxLQUFMLENBQVcsU0FBWCxDQUFxQixVQUFyQixHQUFrQyxJQUFsQyxDQUZpQztDQUFYOztBQUsxQixPQUFPLE9BQVAsR0FBaUIsT0FBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnXG5cbnZhciBNYXBDdGYxID0gcmVxdWlyZSgnLi9tYXBzL01hcEN0ZjEnKVxudmFyIFJlbW90ZVBsYXllciA9IHJlcXVpcmUoJy4vbGliL1JlbW90ZVBsYXllcicpXG5sZXQgV2VhcG9uU2V0dGluZ3MgPSByZXF1aXJlKCcuL2xpYi9XZWFwb25TZXR0aW5ncycpXG52YXIgR3VpZCA9IHJlcXVpcmUoJy4vbGliL0d1aWQnKVxubGV0IFdlYXBvbnMgPSByZXF1aXJlKCcuL2xpYi9XZWFwb25zJylcbmxldCBCdWxsZXQgPSByZXF1aXJlKCcuL2xpYi9CdWxsZXQnKVxuXG52YXIgZ2FtZVdpZHRoID0gd2luZG93LmlubmVyV2lkdGhcbnZhciBnYW1lSGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0XG52YXIgd29ybGRXaWR0aCA9IDQwMDBcbnZhciB3b3JsZEhlaWdodCA9IDE1MDBcblxudmFyIGdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoZ2FtZVdpZHRoLCBnYW1lSGVpZ2h0LCBQaGFzZXIuQ0FOVkFTLCAncmFuZ2VyLXN0ZXZlLWdhbWUnKTtcblxudmFyIFJhbmdlclN0ZXZlR2FtZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY2xpZW50SWQgPSBHdWlkKClcbiAgICB0aGlzLmN1cnJlbnRXZWFwb24gPSAwO1xuICAgIHRoaXMuZW5lbWllcyA9IFtdXG4gICAgdGhpcy5nYW1lID0gZ2FtZVxuICAgIHRoaXMuZ3JvdW5kXG4gICAgdGhpcy5wbGF0Zm9ybXNcbiAgICB0aGlzLnBsYXllclxuICAgIHRoaXMuc2NvcmUgPSAwXG4gICAgdGhpcy5zY29yZVRleHRcbiAgICB0aGlzLnNvY2tldFxuICAgIHRoaXMud2VhcG9uTmFtZSA9IG51bGw7XG4gICAgdGhpcy53ZWFwb25zID0gW107XG59XG5cblJhbmdlclN0ZXZlR2FtZS5wcm90b3R5cGUgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZ2FtZS5yZW5kZXJlci5yZW5kZXJTZXNzaW9uLnJvdW5kUGl4ZWxzID0gdHJ1ZVxuICAgICAgICB0aGlzLmdhbWUuc3RhZ2UuZGlzYWJsZVZpc2liaWxpdHlDaGFuZ2UgPSB0cnVlXG4gICAgICAgIHRoaXMucGh5c2ljcy5zdGFydFN5c3RlbShQaGFzZXIuUGh5c2ljcy5BUkNBREUpXG4gICAgfSxcblxuICAgIHByZWxvYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmxvYWQuaW1hZ2UoJ2J1bGxldDExJywgJy9pbWFnZXMvYnVsbGV0MTEucG5nJylcbiAgICAgICAgdGhpcy5sb2FkLmltYWdlKCdidWxsZXQxMCcsICcvaW1hZ2VzL2J1bGxldDEwLnBuZycpXG4gICAgICAgIHRoaXMubG9hZC5pbWFnZSgnYnVsbGV0OScsICcvaW1hZ2VzL2J1bGxldDkucG5nJylcbiAgICAgICAgdGhpcy5sb2FkLmltYWdlKCdidWxsZXQ4JywgJy9pbWFnZXMvYnVsbGV0OC5wbmcnKVxuICAgICAgICB0aGlzLmxvYWQuaW1hZ2UoJ2J1bGxldDcnLCAnL2ltYWdlcy9idWxsZXQ3LnBuZycpXG4gICAgICAgIHRoaXMubG9hZC5pbWFnZSgnYnVsbGV0NScsICcvaW1hZ2VzL2J1bGxldDUucG5nJylcbiAgICAgICAgdGhpcy5sb2FkLmltYWdlKCdidWxsZXQ0JywgJy9pbWFnZXMvYnVsbGV0NC5wbmcnKVxuICAgICAgICB0aGlzLmxvYWQuaW1hZ2UoJ3RyZWVzY2FwZScsICcvaW1hZ2VzL21hcC1jdGYxLnBuZycpXG4gICAgICAgIHRoaXMubG9hZC5pbWFnZSgnZ3JvdW5kJywgJy9pbWFnZXMvcGxhdGZvcm0ucG5nJylcbiAgICAgICAgdGhpcy5sb2FkLnNwcml0ZXNoZWV0KCdkdWRlJywgJy9pbWFnZXMvZHVkZS5wbmcnLCAzMiwgNDgpXG4gICAgICAgIHRoaXMubG9hZC5zcHJpdGVzaGVldCgnZW5lbXknLCAnL2ltYWdlcy9kdWRlLnBuZycsIDMyLCA0OClcbiAgICB9LFxuXG4gICAgY3JlYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zb2NrZXQgPSBpby5jb25uZWN0KClcbiAgICAgICAgdGhpcy5lbmVtaWVzID0gW11cblxuICAgICAgICAvLyAgV2UncmUgZ29pbmcgdG8gYmUgdXNpbmcgcGh5c2ljcywgc28gZW5hYmxlIHRoZSBBcmNhZGUgUGh5c2ljcyBzeXN0ZW1cbiAgICAgICAgdGhpcy5waHlzaWNzLnN0YXJ0U3lzdGVtKFBoYXNlci5QaHlzaWNzLkFSQ0FERSlcblxuICAgICAgICB0aGlzLndvcmxkLnNldEJvdW5kcygwLCAwLCB3b3JsZFdpZHRoLCB3b3JsZEhlaWdodClcbiAgICAgICAgdGhpcy5nYW1lLnN0YWdlLmJhY2tncm91bmRDb2xvciA9IFwiIzJGOTFEMFwiXG5cbiAgICAgICAgLy8gU2NhbGUgZ2FtZSBvbiB3aW5kb3cgcmVzaXplXG4gICAgICAgIHRoaXMuZ2FtZS5zY2FsZS5zY2FsZU1vZGUgPSBQaGFzZXIuU2NhbGVNYW5hZ2VyLlJFU0laRTtcbiAgICAgICAgdGhpcy5nYW1lLnNjYWxlLnNldFNob3dBbGwoKTtcbiAgICAgICAgdGhpcy5nYW1lLnNjYWxlLnJlZnJlc2goKVxuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIE1hcFxuICAgICAgICAgKi9cbiAgICAgICAgTWFwQ3RmMS5jcmVhdGUodGhpcylcblxuICAgICAgICAvLyBEZWZpbmUgbW92ZW1lbnQgY29uc3RhbnRzXG4gICAgICAgIHRoaXMuTUFYX1NQRUVEID0gNDAwOyAvLyBwaXhlbHMvc2Vjb25kXG4gICAgICAgIHRoaXMuQUNDRUxFUkFUSU9OID0gMTk2MDsgLy8gcGl4ZWxzL3NlY29uZC9zZWNvbmRcbiAgICAgICAgdGhpcy5EUkFHID0gMTUwMDsgLy8gcGl4ZWxzL3NlY29uZFxuICAgICAgICB0aGlzLkdSQVZJVFkgPSAxOTYwOyAvLyBwaXhlbHMvc2Vjb25kL3NlY29uZFxuICAgICAgICB0aGlzLkpVTVBfU1BFRUQgPSAtODUwOyAvLyBwaXhlbHMvc2Vjb25kIChuZWdhdGl2ZSB5IGlzIHVwKVxuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFBsYXllciBTZXR0aW5nc1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5wbGF5ZXIgPSB0aGlzLmFkZC5zcHJpdGUoMjAwLCB0aGlzLndvcmxkLmhlaWdodCAtIDQwMCwgJ2R1ZGUnKTtcblxuICAgICAgICAvLyAgV2UgbmVlZCB0byBlbmFibGUgcGh5c2ljcyBvbiB0aGUgcGxheWVyXG4gICAgICAgIHRoaXMucGh5c2ljcy5hcmNhZGUuZW5hYmxlKHRoaXMucGxheWVyKTtcblxuICAgICAgICAvLyBFbmFibGUgcGh5c2ljcyBvbiB0aGUgcGxheWVyXG4gICAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLmVuYWJsZSh0aGlzLnBsYXllciwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcblxuICAgICAgICAvLyBNYWtlIHBsYXllciBjb2xsaWRlIHdpdGggd29ybGQgYm91bmRhcmllcyBzbyBoZSBkb2Vzbid0IGxlYXZlIHRoZSBzdGFnZVxuICAgICAgICB0aGlzLnBsYXllci5ib2R5LmNvbGxpZGVXb3JsZEJvdW5kcyA9IHRydWU7XG5cbiAgICAgICAgLy8gU2V0IHBsYXllciBtaW5pbXVtIGFuZCBtYXhpbXVtIG1vdmVtZW50IHNwZWVkXG4gICAgICAgIHRoaXMucGxheWVyLmJvZHkubWF4VmVsb2NpdHkuc2V0VG8odGhpcy5NQVhfU1BFRUQsIHRoaXMuTUFYX1NQRUVEICogMTApOyAvLyB4LCB5XG5cbiAgICAgICAgLy8gQWRkIGRyYWcgdG8gdGhlIHBsYXllciB0aGF0IHNsb3dzIHRoZW0gZG93biB3aGVuIHRoZXkgYXJlIG5vdCBhY2NlbGVyYXRpbmdcbiAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5kcmFnLnNldFRvKHRoaXMuRFJBRywgMCk7IC8vIHgsIHlcblxuICAgICAgICAvLyBTaW5jZSB3ZSdyZSBqdW1waW5nIHdlIG5lZWQgZ3Jhdml0eVxuICAgICAgICBnYW1lLnBoeXNpY3MuYXJjYWRlLmdyYXZpdHkueSA9IHRoaXMuR1JBVklUWTtcblxuICAgICAgICAvLyBGbGFnIHRvIHRyYWNrIGlmIHRoZSBqdW1wIGJ1dHRvbiBpcyBwcmVzc2VkXG4gICAgICAgIHRoaXMuanVtcGluZyA9IGZhbHNlO1xuXG4gICAgICAgIC8vICBPdXIgdHdvIGFuaW1hdGlvbnMsIHdhbGtpbmcgbGVmdCBhbmQgcmlnaHQuXG4gICAgICAgIHRoaXMucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdsZWZ0JywgWzAsIDEsIDIsIDNdLCAxMCwgdHJ1ZSlcbiAgICAgICAgdGhpcy5wbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ3JpZ2h0JywgWzUsIDYsIDcsIDhdLCAxMCwgdHJ1ZSlcbiAgICAgICAgdGhpcy5wbGF5ZXIuc2NvcmUgPSAwXG5cblxuICAgICAgICAvKipcbiAgICAgICAgICogV2VhcG9uc1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jdXJyZW50V2VhcG9uID0gMDtcbiAgICAgICAgdGhpcy53ZWFwb25zLnB1c2gobmV3IFdlYXBvbnMuQUs0Nyh0aGlzLmdhbWUpKTtcblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUZXh0XG4gICAgICAgICAqL1xuICAgICAgICBsZXQgdGV4dFN0eWxlcyA9IHsgZm9udFNpemU6ICcyNHB4JywgZmlsbDogJyMwMDAnIH1cbiAgICAgICAgdGhpcy5zY29yZVRleHQgPSB0aGlzLmFkZC50ZXh0KDI1LCAyNSwgJ1Njb3JlOiAwJywgdGV4dFN0eWxlcylcbiAgICAgICAgdGhpcy5zY29yZVRleHQuZml4ZWRUb0NhbWVyYSA9IHRydWVcbiAgICAgICAgdGhpcy53ZWFwb25OYW1lID0gdGhpcy5hZGQudGV4dCh0aGlzLmNhbWVyYS53aWR0aCAtIDEwMCwgdGhpcy5jYW1lcmEuaGVpZ2h0IC0gNDUsICdBSy00NycsIHRleHRTdHlsZXMpXG4gICAgICAgIHRoaXMud2VhcG9uTmFtZS5maXhlZFRvQ2FtZXJhID0gdHJ1ZVxuICAgICAgICB0aGlzLmN1cnJlbnRIZWFsdGhUZXh0ID0gdGhpcy5hZGQudGV4dCh0aGlzLmNhbWVyYS54ICsgMjUsIHRoaXMuY2FtZXJhLmhlaWdodCAtIDQ1LCAnMTAwJywgdGV4dFN0eWxlcylcbiAgICAgICAgdGhpcy5jdXJyZW50SGVhbHRoVGV4dC5maXhlZFRvQ2FtZXJhID0gdHJ1ZVxuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENhbWVyYSBTZXR0aW5nc1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jYW1lcmEuZm9sbG93KHRoaXMucGxheWVyKTtcblxuICAgICAgICB2YXIgY2hhbmdlS2V5ID0gdGhpcy5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLkVOVEVSKTtcbiAgICAgICAgY2hhbmdlS2V5Lm9uRG93bi5hZGQodGhpcy5uZXh0V2VhcG9uLCB0aGlzKVxuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlc2l6aW5nIEV2ZW50c1xuICAgICAgICAgKi9cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5zY2FsZS5yZWZyZXNoKClcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHRcbiAgICAgICAgICAgIHRoaXMuZ2FtZS53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXG5cbiAgICAgICAgICAgIHRoaXMud2VhcG9uTmFtZS5jYW1lcmFPZmZzZXQueCA9IHRoaXMuY2FtZXJhLndpZHRoIC0gMTAwXG4gICAgICAgICAgICB0aGlzLndlYXBvbk5hbWUuY2FtZXJhT2Zmc2V0LnkgPSB0aGlzLmNhbWVyYS5oZWlnaHQgLSA0NVxuXG4gICAgICAgICAgICB0aGlzLnNjb3JlVGV4dC5jYW1lcmFPZmZzZXQueCA9IDI1XG4gICAgICAgICAgICB0aGlzLnNjb3JlVGV4dC5jYW1lcmFPZmZzZXQueSA9IDI1XG4gICAgICAgIH0pXG5cblxuICAgICAgICAvKipcbiAgICAgICAgICogU3RhcnQgbGlzdGVuaW5nIGZvciBldmVudHNcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuc2V0RXZlbnRIYW5kbGVycygpXG4gICAgfSxcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vICBDb2xsaWRlIHRoZSBwbGF5ZXIgYW5kIHRoZSBzdGFycyB3aXRoIHRoZSBwbGF0Zm9ybXNcbiAgICAgICAgdGhpcy5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMucGxheWVyLCB0aGlzLnBsYXRmb3JtcylcbiAgICAgICAgdGhpcy5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMuZW5lbWllcywgdGhpcy5wbGF0Zm9ybXMpXG4gICAgICAgIHRoaXMucGh5c2ljcy5hcmNhZGUuY29sbGlkZSh0aGlzLmVuZW15LCB0aGlzLnBsYXRmb3JtcylcbiAgICAgICAgdGhpcy5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMucGxhdGZvcm1zLCB0aGlzLndlYXBvbnMsIGZ1bmN0aW9uKHBsYXRmb3JtLCB3ZWFwb24pIHtcbiAgICAgICAgICAgIHdlYXBvbi5raWxsKClcbiAgICAgICAgfSwgbnVsbCwgdGhpcyk7XG5cbiAgICAgICAgdGhpcy5lbmVtaWVzLmZvckVhY2goKGVuZW15KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUub3ZlcmxhcChlbmVteSwgdGhpcy53ZWFwb25zLCAoZW5lbXksIHdlYXBvbikgPT4ge1xuICAgICAgICAgICAgICAgIGVuZW15LmhlYWx0aCAtPSB3ZWFwb24uZGFtYWdlXG4gICAgICAgICAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnZGFtYWdlZCBwbGF5ZXInLCB7XG4gICAgICAgICAgICAgICAgICAgIHBsYXllcklkOiBlbmVteS5pZCxcbiAgICAgICAgICAgICAgICAgICAgY2xpZW50SWQ6IHRoaXMuY2xpZW50SWQsXG4gICAgICAgICAgICAgICAgICAgIGRhbWFnZTogd2VhcG9uLmRhbWFnZVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgd2VhcG9uLmtpbGwoKVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdZb3UgaGl0IHRoZW0hJywgZW5lbXkuaGVhbHRoLCB3ZWFwb24uZGFtYWdlKVxuICAgICAgICAgICAgfSwgbnVsbCwgdGhpcylcbiAgICAgICAgfSlcblxuXG4gICAgICAgIC8vIEJ1bGxldCBoYXMgaGl0IGEgcGxheWVyXG4gICAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5vdmVybGFwKHRoaXMuZW5lbXksIHRoaXMud2VhcG9ucywgKGVuZW15LCB3ZWFwb24pID0+IHtcbiAgICAgICAgICAgIGVuZW15LmhlYWx0aCAtPSB3ZWFwb24uZGFtYWdlXG4gICAgICAgICAgICB3ZWFwb24ua2lsbCgpXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnWW91IGhpdCB0aGVtIScsIGVuZW15LmhlYWx0aCwgd2VhcG9uLmRhbWFnZSlcbiAgICAgICAgICAgIGlmIChlbmVteS5oZWFsdGggPD0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdUaGV5IGFyZSBkZWFkIScpXG4gICAgICAgICAgICAgICAgdGhpcy5lbmVteS54ID0gMjAwXG4gICAgICAgICAgICAgICAgdGhpcy5lbmVteS55ID0gMjAwXG4gICAgICAgICAgICAgICAgdGhpcy5lbmVteS5oZWFsdGggPSAxMDBcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllci5zY29yZSsrXG4gICAgICAgICAgICAgICAgdGhpcy5zY29yZVRleHQudGV4dCA9IHRoaXMucGxheWVyLnNjb3JlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIG51bGwsIHRoaXMpXG5cbiAgICAgICAgaWYgKHRoaXMubGVmdElucHV0SXNBY3RpdmUoKSkge1xuICAgICAgICAgICAgLy8gSWYgdGhlIExFRlQga2V5IGlzIGRvd24sIHNldCB0aGUgcGxheWVyIHZlbG9jaXR5IHRvIG1vdmUgbGVmdFxuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5hY2NlbGVyYXRpb24ueCA9IC10aGlzLkFDQ0VMRVJBVElPTjtcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmFuaW1hdGlvbnMucGxheSgnbGVmdCcpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5yaWdodElucHV0SXNBY3RpdmUoKSkge1xuICAgICAgICAgICAgLy8gSWYgdGhlIFJJR0hUIGtleSBpcyBkb3duLCBzZXQgdGhlIHBsYXllciB2ZWxvY2l0eSB0byBtb3ZlIHJpZ2h0XG4gICAgICAgICAgICB0aGlzLnBsYXllci5ib2R5LmFjY2VsZXJhdGlvbi54ID0gdGhpcy5BQ0NFTEVSQVRJT047XG4gICAgICAgICAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLnBsYXkoJ3JpZ2h0JylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFN0YW5kIHN0aWxsXG4gICAgICAgICAgICB0aGlzLnBsYXllci5ib2R5LmFjY2VsZXJhdGlvbi54ID0gMFxuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuYW5pbWF0aW9ucy5zdG9wKClcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmZyYW1lID0gNFxuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2V0IGEgdmFyaWFibGUgdGhhdCBpcyB0cnVlIHdoZW4gdGhlIHBsYXllciBpcyB0b3VjaGluZyB0aGUgZ3JvdW5kXG4gICAgICAgIHZhciBvblRoZUdyb3VuZCA9IHRoaXMucGxheWVyLmJvZHkudG91Y2hpbmcuZG93bjtcblxuICAgICAgICAvLyBJZiB0aGUgcGxheWVyIGlzIHRvdWNoaW5nIHRoZSBncm91bmQsIGxldCBoaW0gaGF2ZSAyIGp1bXBzXG4gICAgICAgIGlmIChvblRoZUdyb3VuZCkge1xuICAgICAgICAgICAgdGhpcy5qdW1wcyA9IDI7XG4gICAgICAgICAgICB0aGlzLmp1bXBpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEp1bXAhXG4gICAgICAgIGlmICh0aGlzLmp1bXBzID4gMCAmJiB0aGlzLnVwSW5wdXRJc0FjdGl2ZSg1KSkge1xuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS52ZWxvY2l0eS55ID0gdGhpcy5KVU1QX1NQRUVEO1xuICAgICAgICAgICAgdGhpcy5qdW1waW5nID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlZHVjZSB0aGUgbnVtYmVyIG9mIGF2YWlsYWJsZSBqdW1wcyBpZiB0aGUganVtcCBpbnB1dCBpcyByZWxlYXNlZFxuICAgICAgICBpZiAodGhpcy5qdW1waW5nICYmIHRoaXMudXBJbnB1dFJlbGVhc2VkKCkpIHtcbiAgICAgICAgICAgIHRoaXMuanVtcHMtLTtcbiAgICAgICAgICAgIHRoaXMuanVtcGluZyA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuZ2FtZS5pbnB1dC5hY3RpdmVQb2ludGVyLmlzRG93bilcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0uZmlyZSh0aGlzLnBsYXllcik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdtb3ZlIHBsYXllcicsIHsgeDogdGhpcy5wbGF5ZXIueCwgeTogdGhpcy5wbGF5ZXIueSB9KVxuICAgIH0sXG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIHNob3VsZCByZXR1cm4gdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgYWN0aXZhdGVzIHRoZSBcImdvIGxlZnRcIiBjb250cm9sXG4gICAgLy8gSW4gdGhpcyBjYXNlLCBlaXRoZXIgaG9sZGluZyB0aGUgcmlnaHQgYXJyb3cgb3IgdGFwcGluZyBvciBjbGlja2luZyBvbiB0aGUgbGVmdFxuICAgIC8vIHNpZGUgb2YgdGhlIHNjcmVlbi5cbiAgICBsZWZ0SW5wdXRJc0FjdGl2ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlucHV0LmtleWJvYXJkLmlzRG93bihQaGFzZXIuS2V5Ym9hcmQuQSlcbiAgICB9LFxuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiBzaG91bGQgcmV0dXJuIHRydWUgd2hlbiB0aGUgcGxheWVyIGFjdGl2YXRlcyB0aGUgXCJnbyByaWdodFwiIGNvbnRyb2xcbiAgICAvLyBJbiB0aGlzIGNhc2UsIGVpdGhlciBob2xkaW5nIHRoZSByaWdodCBhcnJvdyBvciB0YXBwaW5nIG9yIGNsaWNraW5nIG9uIHRoZSByaWdodFxuICAgIC8vIHNpZGUgb2YgdGhlIHNjcmVlbi5cbiAgICByaWdodElucHV0SXNBY3RpdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnB1dC5rZXlib2FyZC5pc0Rvd24oUGhhc2VyLktleWJvYXJkLkQpXG4gICAgfSxcblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gc2hvdWxkIHJldHVybiB0cnVlIHdoZW4gdGhlIHBsYXllciBhY3RpdmF0ZXMgdGhlIFwianVtcFwiIGNvbnRyb2xcbiAgICAvLyBJbiB0aGlzIGNhc2UsIGVpdGhlciBob2xkaW5nIHRoZSB1cCBhcnJvdyBvciB0YXBwaW5nIG9yIGNsaWNraW5nIG9uIHRoZSBjZW50ZXJcbiAgICAvLyBwYXJ0IG9mIHRoZSBzY3JlZW4uXG4gICAgdXBJbnB1dElzQWN0aXZlOiBmdW5jdGlvbihkdXJhdGlvbikge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnB1dC5rZXlib2FyZC5kb3duRHVyYXRpb24oUGhhc2VyLktleWJvYXJkLlcsIGR1cmF0aW9uKTtcbiAgICB9LFxuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiByZXR1cm5zIHRydWUgd2hlbiB0aGUgcGxheWVyIHJlbGVhc2VzIHRoZSBcImp1bXBcIiBjb250cm9sXG4gICAgdXBJbnB1dFJlbGVhc2VkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5wdXQua2V5Ym9hcmQudXBEdXJhdGlvbihQaGFzZXIuS2V5Ym9hcmQuVyk7XG4gICAgfSxcblxuICAgIG5leHRXZWFwb246IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyAgVGlkeS11cCB0aGUgY3VycmVudCB3ZWFwb25cbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFdlYXBvbiA+IDkpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLnJlc2V0KCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS5jYWxsQWxsKCdyZXNldCcsIG51bGwsIDAsIDApO1xuICAgICAgICAgICAgdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0uc2V0QWxsKCdleGlzdHMnLCBmYWxzZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyAgQWN0aXZhdGUgdGhlIG5ldyBvbmVcbiAgICAgICAgdGhpcy5jdXJyZW50V2VhcG9uKys7XG5cbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFdlYXBvbiA9PT0gdGhpcy53ZWFwb25zLmxlbmd0aClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50V2VhcG9uID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLnZpc2libGUgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMud2VhcG9uTmFtZS50ZXh0ID0gdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0ubmFtZTtcbiAgICB9LFxuXG4gICAgc2V0RXZlbnRIYW5kbGVyczogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBTb2NrZXQgY29ubmVjdGlvbiBzdWNjZXNzZnVsXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdjb25uZWN0JywgdGhpcy5vblNvY2tldENvbm5lY3RlZC5iaW5kKHRoaXMpKVxuXG4gICAgICAgIC8vIFNvY2tldCBkaXNjb25uZWN0aW9uXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdkaXNjb25uZWN0JywgdGhpcy5vblNvY2tldERpc2Nvbm5lY3QuYmluZCh0aGlzKSlcblxuICAgICAgICAvLyBOZXcgcGxheWVyIG1lc3NhZ2UgcmVjZWl2ZWRcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ25ldyBwbGF5ZXInLCB0aGlzLm9uTmV3UGxheWVyLmJpbmQodGhpcykpXG5cbiAgICAgICAgLy8gUGxheWVyIG1vdmUgbWVzc2FnZSByZWNlaXZlZFxuICAgICAgICB0aGlzLnNvY2tldC5vbignbW92ZSBwbGF5ZXInLCB0aGlzLm9uTW92ZVBsYXllci5iaW5kKHRoaXMpKVxuXG4gICAgICAgIC8vIFBsYXllciByZW1vdmVkIG1lc3NhZ2UgcmVjZWl2ZWRcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ3JlbW92ZSBwbGF5ZXInLCB0aGlzLm9uUmVtb3ZlUGxheWVyLmJpbmQodGhpcykpXG4gICAgfSxcblxuICAgIC8vIFNvY2tldCBjb25uZWN0ZWRcbiAgICBvblNvY2tldENvbm5lY3RlZDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBjb25zb2xlLmxvZygnQ29ubmVjdGVkIHRvIHNvY2tldCBzZXJ2ZXInKVxuXG4gICAgICAgICAvLyBSZXNldCBlbmVtaWVzIG9uIHJlY29ubmVjdFxuICAgICAgICB0aGlzLmVuZW1pZXMuZm9yRWFjaChmdW5jdGlvbiAoZW5lbXkpIHtcbiAgICAgICAgICAgIGVuZW15LnBsYXllci5raWxsKClcbiAgICAgICAgfSlcbiAgICAgICAgdGhpcy5lbmVtaWVzID0gW11cblxuICAgICAgICAvLyBTZW5kIGxvY2FsIHBsYXllciBkYXRhIHRvIHRoZSBnYW1lIHNlcnZlclxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCduZXcgcGxheWVyJywge1xuICAgICAgICAgICAgY2xpZW50SWQ6IHRoaXMuY2xpZW50SWQsXG4gICAgICAgICAgICB4OiB0aGlzLnBsYXllci54LFxuICAgICAgICAgICAgeTogdGhpcy5wbGF5ZXIueVxuICAgICAgICB9KVxuICAgIH0sXG5cbiAgICAvLyBTb2NrZXQgZGlzY29ubmVjdGVkXG4gICAgb25Tb2NrZXREaXNjb25uZWN0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0Rpc2Nvbm5lY3RlZCBmcm9tIHNvY2tldCBzZXJ2ZXInKVxuICAgIH0sXG5cbiAgICAvLyBOZXcgcGxheWVyXG4gICAgb25OZXdQbGF5ZXI6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ05ldyBwbGF5ZXIgY29ubmVjdGVkOicsIGRhdGEuaWQpXG5cbiAgICAgICAgLy8gQXZvaWQgcG9zc2libGUgZHVwbGljYXRlIHBsYXllcnNcbiAgICAgICAgdmFyIGR1cGxpY2F0ZSA9IHRoaXMucGxheWVyQnlJZChkYXRhLmlkKVxuICAgICAgICBpZiAoZHVwbGljYXRlIHx8IGRhdGEuY2xpZW50SWQgPT09IHRoaXMuY2xpZW50SWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdEdXBsaWNhdGUgcGxheWVyIScpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBuZXdSZW1vdGVQbGF5ZXIgPSBSZW1vdGVQbGF5ZXIuY3JlYXRlLmNhbGwodGhpcywge1xuICAgICAgICAgICAgeDogZGF0YS54LFxuICAgICAgICAgICAgeTogZGF0YS55LFxuICAgICAgICAgICAgaWQ6IGRhdGEuaWRcbiAgICAgICAgfSlcblxuICAgICAgICB0aGlzLmVuZW1pZXMucHVzaChuZXdSZW1vdGVQbGF5ZXIpXG4gICAgfSxcblxuICAgIC8vIE1vdmUgcGxheWVyXG4gICAgb25Nb3ZlUGxheWVyOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBtb3ZlUGxheWVyID0gdGhpcy5wbGF5ZXJCeUlkKGRhdGEuaWQpXG5cbiAgICAgICAgLy8gUGxheWVyIG5vdCBmb3VuZFxuICAgICAgICBpZiAoISBtb3ZlUGxheWVyKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFVwZGF0ZSBwbGF5ZXIgcG9zaXRpb25cbiAgICAgICAgbW92ZVBsYXllci54ID0gZGF0YS54XG4gICAgICAgIG1vdmVQbGF5ZXIueSA9IGRhdGEueVxuXG4gICAgICAgIGlmIChtb3ZlUGxheWVyLnggPiBtb3ZlUGxheWVyLmxhc3RQb3NpdGlvbi54KSB7XG4gICAgICAgICAgICBtb3ZlUGxheWVyLmFuaW1hdGlvbnMucGxheSgncmlnaHQnKVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG1vdmVQbGF5ZXIueCA8IG1vdmVQbGF5ZXIubGFzdFBvc2l0aW9uLngpXG4gICAgICAgIHtcbiAgICAgICAgICAgIG1vdmVQbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdsZWZ0JylcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgIHtcbiAgICAgICAgICAgIG1vdmVQbGF5ZXIuYW5pbWF0aW9ucy5zdG9wKClcbiAgICAgICAgICAgIG1vdmVQbGF5ZXIuZnJhbWUgPSA0O1xuICAgICAgICB9XG5cbiAgICAgICAgbW92ZVBsYXllci5sYXN0UG9zaXRpb24ueCA9IG1vdmVQbGF5ZXIueFxuICAgICAgICBtb3ZlUGxheWVyLmxhc3RQb3NpdGlvbi55ID0gbW92ZVBsYXllci55XG4gICAgfSxcblxuICAgIC8vIFJlbW92ZSBwbGF5ZXJcbiAgICBvblJlbW92ZVBsYXllcjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgcmVtb3ZlUGxheWVyID0gdGhpcy5wbGF5ZXJCeUlkKGRhdGEuaWQpXG5cbiAgICAgICAgLy8gUGxheWVyIG5vdCBmb3VuZFxuICAgICAgICBpZiAoIXJlbW92ZVBsYXllcikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1BsYXllciBub3QgZm91bmQ6ICcsIGRhdGEuaWQpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIHJlbW92ZVBsYXllci5raWxsKClcblxuICAgICAgICAvLyBSZW1vdmUgcGxheWVyIGZyb20gYXJyYXlcbiAgICAgICAgdGhpcy5lbmVtaWVzLnNwbGljZSh0aGlzLmVuZW1pZXMuaW5kZXhPZihyZW1vdmVQbGF5ZXIpLCAxKVxuICAgIH0sXG5cbiAgICAvLyBGaW5kIHBsYXllciBieSBJRFxuICAgIHBsYXllckJ5SWQ6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5lbmVtaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5lbmVtaWVzW2ldLmlkID09PSBpZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmVuZW1pZXNbaV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbn1cblxuZ2FtZS5zdGF0ZS5hZGQoJ0dhbWUnLCBSYW5nZXJTdGV2ZUdhbWUsIHRydWUpO1xuIiwiJ3VzZSBzdHJpY3QnXG5cbnZhciBCdWxsZXQgPSBmdW5jdGlvbiAoZ2FtZSwga2V5KSB7XG4gICAgUGhhc2VyLlNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIDAsIDAsIGtleSk7XG5cbiAgICB0aGlzLnRleHR1cmUuYmFzZVRleHR1cmUuc2NhbGVNb2RlID0gUElYSS5zY2FsZU1vZGVzLk5FQVJFU1Q7XG5cbiAgICB0aGlzLmFuY2hvci5zZXQoMC41KTtcblxuICAgIHRoaXMuY2hlY2tXb3JsZEJvdW5kcyA9IHRydWU7XG4gICAgdGhpcy5vdXRPZkJvdW5kc0tpbGwgPSB0cnVlO1xuICAgIHRoaXMuZXhpc3RzID0gZmFsc2U7XG5cbiAgICB0aGlzLnRyYWNraW5nID0gZmFsc2U7XG4gICAgdGhpcy5zY2FsZVNwZWVkID0gMDtcbn07XG5cbkJ1bGxldC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TcHJpdGUucHJvdG90eXBlKTtcbkJ1bGxldC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBCdWxsZXQ7XG5cbkJ1bGxldC5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uICh4LCB5LCBhbmdsZSwgc3BlZWQsIGd4LCBneSkge1xuICAgIGd4ID0gZ3ggfHwgMFxuICAgIGd5ID0gZ3kgfHwgMFxuICAgIHRoaXMucmVzZXQoeCwgeSlcbiAgICAvLyB0aGlzLnNjYWxlLnNldCgxKVxuXG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLm1vdmVUb1BvaW50ZXIodGhpcywgc3BlZWQpXG59XG5cbkJ1bGxldC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnRyYWNraW5nKVxuICAgIHtcbiAgICAgICAgdGhpcy5yb3RhdGlvbiA9IE1hdGguYXRhbjIodGhpcy5ib2R5LnZlbG9jaXR5LnksIHRoaXMuYm9keS52ZWxvY2l0eS54KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zY2FsZVNwZWVkID4gMClcbiAgICB7XG4gICAgICAgIHRoaXMuc2NhbGUueCArPSB0aGlzLnNjYWxlU3BlZWQ7XG4gICAgICAgIHRoaXMuc2NhbGUueSArPSB0aGlzLnNjYWxlU3BlZWQ7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1bGxldFxuIiwiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ3VpZEdlbmVyYXRvcigpIHtcbiAgICB2YXIgUzQgPSBmdW5jdGlvbigpIHtcbiAgICAgICByZXR1cm4gKCgoMStNYXRoLnJhbmRvbSgpKSoweDEwMDAwKXwwKS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpXG4gICAgfVxuXG4gICAgcmV0dXJuIChTNCgpK1M0KCkrXCItXCIrUzQoKStcIi1cIitTNCgpK1wiLVwiK1M0KCkrXCItXCIrUzQoKStTNCgpK1M0KCkpXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IFJlbW90ZVBsYXllciA9IHt9XG5cblJlbW90ZVBsYXllci5jcmVhdGUgPSBmdW5jdGlvbihjb25maWcpIHtcbiAgICAvLyBBZGQgbmV3IHBsYXllciB0byB0aGUgcmVtb3RlIHBsYXllcnMgYXJyYXlcbiAgICBsZXQgbmV3UmVtb3RlUGxheWVyID0gdGhpcy5hZGQuc3ByaXRlKGNvbmZpZy54LCBjb25maWcueSwgJ2R1ZGUnKTtcbiAgICBuZXdSZW1vdGVQbGF5ZXIuaWQgPSBjb25maWcuaWRcblxuICAgIG5ld1JlbW90ZVBsYXllci5sYXN0UG9zaXRpb24gPSB7XG4gICAgICAgIHg6IGNvbmZpZy54LFxuICAgICAgICB5OiBjb25maWcueVxuICAgIH1cblxuICAgIC8vICBXZSBuZWVkIHRvIGVuYWJsZSBwaHlzaWNzIG9uIHRoZSBwbGF5ZXJcbiAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmVuYWJsZShuZXdSZW1vdGVQbGF5ZXIpO1xuICAgIGNvbnNvbGUubG9nKCduZXdSZW1vdGVQbGF5ZXInLCBuZXdSZW1vdGVQbGF5ZXIpXG5cbiAgICAvLyBFbmFibGUgcGh5c2ljcyBvbiB0aGUgcGxheWVyXG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuZW5hYmxlKG5ld1JlbW90ZVBsYXllciwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcblxuICAgIC8vIE1ha2UgcGxheWVyIGNvbGxpZGUgd2l0aCB3b3JsZCBib3VuZGFyaWVzIHNvIGhlIGRvZXNuJ3QgbGVhdmUgdGhlIHN0YWdlXG4gICAgbmV3UmVtb3RlUGxheWVyLmJvZHkuY29sbGlkZVdvcmxkQm91bmRzID0gdHJ1ZTtcblxuICAgIC8vIFNldCBwbGF5ZXIgbWluaW11bSBhbmQgbWF4aW11bSBtb3ZlbWVudCBzcGVlZFxuICAgIG5ld1JlbW90ZVBsYXllci5ib2R5Lm1heFZlbG9jaXR5LnNldFRvKHRoaXMuTUFYX1NQRUVELCB0aGlzLk1BWF9TUEVFRCAqIDEwKTsgLy8geCwgeVxuXG4gICAgLy8gQWRkIGRyYWcgdG8gdGhlIHBsYXllciB0aGF0IHNsb3dzIHRoZW0gZG93biB3aGVuIHRoZXkgYXJlIG5vdCBhY2NlbGVyYXRpbmdcbiAgICBuZXdSZW1vdGVQbGF5ZXIuYm9keS5kcmFnLnNldFRvKHRoaXMuRFJBRywgMCk7IC8vIHgsIHlcblxuICAgIG5ld1JlbW90ZVBsYXllci5oZWFsdGggPSAxMDBcblxuICAgIG5ld1JlbW90ZVBsYXllci5hbmltYXRpb25zLmFkZCgnbGVmdCcsIFswLCAxLCAyLCAzXSwgMTAsIHRydWUpXG4gICAgbmV3UmVtb3RlUGxheWVyLmFuaW1hdGlvbnMuYWRkKCdyaWdodCcsIFs1LCA2LCA3LCA4XSwgMTAsIHRydWUpXG5cbiAgICByZXR1cm4gbmV3UmVtb3RlUGxheWVyXG59XG5cbm1vZHVsZS5leHBvcnRzID0gUmVtb3RlUGxheWVyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBcIlVTU09DT01cIjoge1xuICAgICAgICBcIm5hbWVcIjogXCJVU1NPQ09NXCIsXG4gICAgICAgIFwiRGFtYWdlXCI6IDE5MCxcbiAgICAgICAgXCJGaXJlSW50ZXJ2YWxcIjogMTIsXG4gICAgICAgIFwiQW1tb1wiOiAxMixcbiAgICAgICAgXCJSZWxvYWRUaW1lXCI6IDY1LFxuICAgICAgICBcIlNwZWVkXCI6IDE4MCxcbiAgICAgICAgXCJCdWxsZXRTdHlsZVwiOiAxLFxuICAgICAgICBcIlN0YXJ0VXBUaW1lXCI6IDAsXG4gICAgICAgIFwiQmlua1wiOiA0LFxuICAgICAgICBcIk1vdmVtZW50QWNjXCI6IDFcbiAgICB9LFxuICAgIFwiRGVzZXJ0RWFnbGVzXCI6IHtcbiAgICAgICAgXCJuYW1lXCI6IFwiRGVzZXJ0IEVhZ2xlc1wiLFxuICAgICAgICBcIkRhbWFnZVwiOiAyMTAsXG4gICAgICAgIFwiRmlyZUludGVydmFsXCI6IDIyLFxuICAgICAgICBcIkFtbW9cIjogNyxcbiAgICAgICAgXCJSZWxvYWRUaW1lXCI6IDkwLFxuICAgICAgICBcIlNwZWVkXCI6IDE5MCxcbiAgICAgICAgXCJCdWxsZXRTdHlsZVwiOiAxLFxuICAgICAgICBcIlN0YXJ0VXBUaW1lXCI6IDAsXG4gICAgICAgIFwiQmlua1wiOiA3LFxuICAgICAgICBcIk1vdmVtZW50QWNjXCI6IDFcbiAgICB9LFxuICAgIFwiSEtNUDVcIjoge1xuICAgICAgICBcIm5hbWVcIjogXCJISyBNUDVcIixcbiAgICAgICAgXCJEYW1hZ2VcIjogMTIwLFxuICAgICAgICBcIkZpcmVJbnRlcnZhbFwiOiA2LFxuICAgICAgICBcIkFtbW9cIjogMzAsXG4gICAgICAgIFwiUmVsb2FkVGltZVwiOiAxMDUsXG4gICAgICAgIFwiU3BlZWRcIjogMTkwLFxuICAgICAgICBcIkJ1bGxldFN0eWxlXCI6IDEsXG4gICAgICAgIFwiU3RhcnRVcFRpbWVcIjogMCxcbiAgICAgICAgXCJCaW5rXCI6IDIsXG4gICAgICAgIFwiTW92ZW1lbnRBY2NcIjogMVxuICAgIH0sXG4gICAgXCJBSzQ3XCI6IHtcbiAgICAgICAgXCJuYW1lXCI6IFwiQUstNDdcIixcbiAgICAgICAgXCJkYW1hZ2VcIjogXCIxMjJcIixcbiAgICAgICAgXCJmaXJlSW50ZXJ2YWxcIjogXCIxMFwiLFxuICAgICAgICBcImFtbW9cIjogXCI0MFwiLFxuICAgICAgICBcInJlbG9hZFRpbWVcIjogXCIxNTBcIixcbiAgICAgICAgXCJzcGVlZFwiOiBcIjI0MFwiLFxuICAgICAgICBcImJ1bGxldFN0eWxlXCI6IFwiMVwiLFxuICAgICAgICBcInN0YXJ0VXBUaW1lXCI6IFwiMFwiLFxuICAgICAgICBcImJpbmtcIjogXCIzXCIsXG4gICAgICAgIFwibW92ZW1lbnRBY2NcIjogXCIxXCJcbiAgICB9LFxuICAgIFwiU3RleXJBVUdcIjoge1xuICAgICAgICBcIm5hbWVcIjogXCJNMTZcIixcbiAgICAgICAgXCJEYW1hZ2VcIjogXCI4MFwiLFxuICAgICAgICBcIkZpcmVJbnRlcnZhbFwiOiBcIjdcIixcbiAgICAgICAgXCJBbW1vXCI6IFwiMzBcIixcbiAgICAgICAgXCJSZWxvYWRUaW1lXCI6IFwiMTE1XCIsXG4gICAgICAgIFwiU3BlZWRcIjogXCIyNjBcIixcbiAgICAgICAgXCJCdWxsZXRTdHlsZVwiOiBcIjFcIixcbiAgICAgICAgXCJTdGFydFVwVGltZVwiOiBcIjBcIixcbiAgICAgICAgXCJCaW5rXCI6IFwiMlwiLFxuICAgICAgICBcIk1vdmVtZW50QWNjXCI6IFwiMVwiXG4gICAgfSxcbiAgICBcIlNwYXMxMlwiOiB7XG4gICAgICAgIFwibmFtZVwiOiBcIlNwYXMtMTJcIixcbiAgICAgICAgXCJEYW1hZ2VcIjogXCIxMzBcIixcbiAgICAgICAgXCJGaXJlSW50ZXJ2YWxcIjogXCIzMlwiLFxuICAgICAgICBcIkFtbW9cIjogXCI3XCIsXG4gICAgICAgIFwiUmVsb2FkVGltZVwiOiBcIjE3NVwiLFxuICAgICAgICBcIlNwZWVkXCI6IFwiMTQwXCIsXG4gICAgICAgIFwiQnVsbGV0U3R5bGVcIjogXCIzXCIsXG4gICAgICAgIFwiU3RhcnRVcFRpbWVcIjogXCIwXCIsXG4gICAgICAgIFwiQmlua1wiOiBcIjEwXCIsXG4gICAgICAgIFwiTW92ZW1lbnRBY2NcIjogXCIxXCJcbiAgICB9LFxuICAgIFwiUnVnZXI3N1wiOiB7XG4gICAgICAgIFwibmFtZVwiOiBcIlJ1Z2VyIDc3XCIsXG4gICAgICAgIFwiRGFtYWdlXCI6IFwiMjUyXCIsXG4gICAgICAgIFwiRmlyZUludGVydmFsXCI6IFwiMzBcIixcbiAgICAgICAgXCJBbW1vXCI6IFwiNFwiLFxuICAgICAgICBcIlJlbG9hZFRpbWVcIjogXCI3NVwiLFxuICAgICAgICBcIlNwZWVkXCI6IFwiMzMwXCIsXG4gICAgICAgIFwiQnVsbGV0U3R5bGVcIjogXCIxXCIsXG4gICAgICAgIFwiU3RhcnRVcFRpbWVcIjogXCIwXCIsXG4gICAgICAgIFwiQmlua1wiOiBcIjE1XCIsXG4gICAgICAgIFwiTW92ZW1lbnRBY2NcIjogXCIzXCJcbiAgICB9LFxuICAgIFwiTTc5XCI6IHtcbiAgICAgICAgXCJEYW1hZ2VcIjogMTYwMDAwLFxuICAgICAgICBcIkZpcmVJbnRlcnZhbFwiOiA2LFxuICAgICAgICBcIkFtbW9cIjogMSxcbiAgICAgICAgXCJSZWxvYWRUaW1lXCI6IDE4MCxcbiAgICAgICAgXCJTcGVlZFwiOiAxMTUsXG4gICAgICAgIFwiQnVsbGV0U3R5bGVcIjogNCxcbiAgICAgICAgXCJTdGFydFVwVGltZVwiOiAwLFxuICAgICAgICBcIkJpbmtcIjogMzAsXG4gICAgICAgIFwiTW92ZW1lbnRBY2NcIjogM1xuICAgIH0sXG4gICAgXCJCYXJyZXQgTTgyQTFcIjoge1xuICAgICAgICBcIkRhbWFnZVwiOiA0OTUsXG4gICAgICAgIFwiRmlyZUludGVydmFsXCI6IDI0MCxcbiAgICAgICAgXCJBbW1vXCI6IDEwLFxuICAgICAgICBcIlJlbG9hZFRpbWVcIjogMzAwLFxuICAgICAgICBcIlNwZWVkXCI6IFwiNTUwXCIsXG4gICAgICAgIFwiQnVsbGV0U3R5bGVcIjogXCIxXCIsXG4gICAgICAgIFwiU3RhcnRVcFRpbWVcIjogXCIwXCIsXG4gICAgICAgIFwiQmlua1wiOiBcIjgwXCIsXG4gICAgICAgIFwiTW92ZW1lbnRBY2NcIjogXCI2XCJcbiAgICB9LFxuICAgIFwiRk4gTWluaW1pXCI6IHtcbiAgICAgICAgXCJEYW1hZ2VcIjogXCIxMDBcIixcbiAgICAgICAgXCJGaXJlSW50ZXJ2YWxcIjogXCI5XCIsXG4gICAgICAgIFwiQW1tb1wiOiBcIjUwXCIsXG4gICAgICAgIFwiUmVsb2FkVGltZVwiOiBcIjI1MFwiLFxuICAgICAgICBcIlNwZWVkXCI6IFwiMjcwXCIsXG4gICAgICAgIFwiQnVsbGV0U3R5bGVcIjogXCIxXCIsXG4gICAgICAgIFwiU3RhcnRVcFRpbWVcIjogXCIwXCIsXG4gICAgICAgIFwiQmlua1wiOiBcIjNcIixcbiAgICAgICAgXCJNb3ZlbWVudEFjY1wiOiBcIjJcIlxuICAgIH0sXG4gICAgXCJYTTIxNCBNaW5pZ3VuXCI6IHtcbiAgICAgICAgXCJEYW1hZ2VcIjogXCI1NVwiLFxuICAgICAgICBcIkZpcmVJbnRlcnZhbFwiOiBcIjRcIixcbiAgICAgICAgXCJBbW1vXCI6IFwiMTAwXCIsXG4gICAgICAgIFwiUmVsb2FkVGltZVwiOiBcIjM2NlwiLFxuICAgICAgICBcIlNwZWVkXCI6IFwiMjkwXCIsXG4gICAgICAgIFwiQnVsbGV0U3R5bGVcIjogXCIxXCIsXG4gICAgICAgIFwiU3RhcnRVcFRpbWVcIjogXCI1MFwiLFxuICAgICAgICBcIkJpbmtcIjogXCIxXCIsXG4gICAgICAgIFwiTW92ZW1lbnRBY2NcIjogXCIxXCJcbiAgICB9LFxuICAgIFwiRmxhbWVyXCI6IHtcbiAgICAgICAgXCJEYW1hZ2VcIjogXCIxMDAwXCIsXG4gICAgICAgIFwiRmlyZUludGVydmFsXCI6IFwiNlwiLFxuICAgICAgICBcIkFtbW9cIjogXCIyMDBcIixcbiAgICAgICAgXCJSZWxvYWRUaW1lXCI6IFwiNVwiLFxuICAgICAgICBcIlNwZWVkXCI6IFwiMTA1XCIsXG4gICAgICAgIFwiQnVsbGV0U3R5bGVcIjogXCI1XCIsXG4gICAgICAgIFwiU3RhcnRVcFRpbWVcIjogXCIwXCIsXG4gICAgICAgIFwiQmlua1wiOiBcIjJcIixcbiAgICAgICAgXCJNb3ZlbWVudEFjY1wiOiBcIjFcIlxuICAgIH0sXG4gICAgXCJSYW1ibyBCb3dcIjoge1xuICAgICAgICBcIkRhbWFnZVwiOiBcIjEyMDBcIixcbiAgICAgICAgXCJGaXJlSW50ZXJ2YWxcIjogXCIxMFwiLFxuICAgICAgICBcIkFtbW9cIjogXCIxXCIsXG4gICAgICAgIFwiUmVsb2FkVGltZVwiOiBcIjI1XCIsXG4gICAgICAgIFwiU3BlZWRcIjogXCIyMTBcIixcbiAgICAgICAgXCJCdWxsZXRTdHlsZVwiOiBcIjdcIixcbiAgICAgICAgXCJTdGFydFVwVGltZVwiOiBcIjBcIixcbiAgICAgICAgXCJCaW5rXCI6IFwiM1wiLFxuICAgICAgICBcIk1vdmVtZW50QWNjXCI6IFwiMVwiXG4gICAgfSxcbiAgICBcIkZsYW1lZCBBcnJvd3NcIjoge1xuICAgICAgICBcIkRhbWFnZVwiOiBcIjgwMFwiLFxuICAgICAgICBcIkZpcmVJbnRlcnZhbFwiOiBcIjEwXCIsXG4gICAgICAgIFwiQW1tb1wiOiBcIjFcIixcbiAgICAgICAgXCJSZWxvYWRUaW1lXCI6IFwiMzZcIixcbiAgICAgICAgXCJTcGVlZFwiOiBcIjE4MFwiLFxuICAgICAgICBcIkJ1bGxldFN0eWxlXCI6IFwiOFwiLFxuICAgICAgICBcIlN0YXJ0VXBUaW1lXCI6IFwiMFwiLFxuICAgICAgICBcIkJpbmtcIjogXCIzXCIsXG4gICAgICAgIFwiTW92ZW1lbnRBY2NcIjogXCIxXCJcbiAgICB9LFxuICAgIFwiQ29tYmF0IEtuaWZlXCI6IHtcbiAgICAgICAgXCJEYW1hZ2VcIjogXCIyMTAwMDBcIixcbiAgICAgICAgXCJGaXJlSW50ZXJ2YWxcIjogXCI2XCIsXG4gICAgICAgIFwiQW1tb1wiOiBcIjFcIixcbiAgICAgICAgXCJSZWxvYWRUaW1lXCI6IFwiM1wiLFxuICAgICAgICBcIlNwZWVkXCI6IFwiNjBcIixcbiAgICAgICAgXCJCdWxsZXRTdHlsZVwiOiBcIjExXCIsXG4gICAgICAgIFwiU3RhcnRVcFRpbWVcIjogXCIwXCIsXG4gICAgICAgIFwiQmlua1wiOiBcIjBcIixcbiAgICAgICAgXCJNb3ZlbWVudEFjY1wiOiBcIjFcIlxuICAgIH0sXG4gICAgXCJDaGFpbnNhd1wiOiB7XG4gICAgICAgIFwiRGFtYWdlXCI6IFwiMjEwMFwiLFxuICAgICAgICBcIkZpcmVJbnRlcnZhbFwiOiBcIjRcIixcbiAgICAgICAgXCJBbW1vXCI6IFwiMzBcIixcbiAgICAgICAgXCJSZWxvYWRUaW1lXCI6IFwiNzBcIixcbiAgICAgICAgXCJTcGVlZFwiOiBcIjcwXCIsXG4gICAgICAgIFwiQnVsbGV0U3R5bGVcIjogXCIxMVwiLFxuICAgICAgICBcIlN0YXJ0VXBUaW1lXCI6IFwiMFwiLFxuICAgICAgICBcIkJpbmtcIjogXCIwXCIsXG4gICAgICAgIFwiTW92ZW1lbnRBY2NcIjogXCIxXCJcbiAgICB9LFxuICAgIFwiTTcyIExBV1wiOiB7XG4gICAgICAgIFwiRGFtYWdlXCI6IFwiMTUwMDAwXCIsXG4gICAgICAgIFwiRmlyZUludGVydmFsXCI6IFwiNjBcIixcbiAgICAgICAgXCJBbW1vXCI6IFwiMVwiLFxuICAgICAgICBcIlJlbG9hZFRpbWVcIjogXCI2MDBcIixcbiAgICAgICAgXCJTcGVlZFwiOiBcIjIzMFwiLFxuICAgICAgICBcIkJ1bGxldFN0eWxlXCI6IFwiMTJcIixcbiAgICAgICAgXCJTdGFydFVwVGltZVwiOiBcIjBcIixcbiAgICAgICAgXCJCaW5rXCI6IFwiMjBcIixcbiAgICAgICAgXCJNb3ZlbWVudEFjY1wiOiBcIjFcIlxuICAgIH0sXG4gICAgXCJQdW5jaFwiOiB7XG4gICAgICAgIFwiRGFtYWdlXCI6IFwiMzMwMDBcIixcbiAgICAgICAgXCJGaXJlSW50ZXJ2YWxcIjogXCI2XCIsXG4gICAgICAgIFwiQW1tb1wiOiBcIjFcIixcbiAgICAgICAgXCJSZWxvYWRUaW1lXCI6IFwiM1wiLFxuICAgICAgICBcIlNwZWVkXCI6IFwiNTBcIixcbiAgICAgICAgXCJCdWxsZXRTdHlsZVwiOiBcIjZcIixcbiAgICAgICAgXCJTdGFydFVwVGltZVwiOiBcIjBcIixcbiAgICAgICAgXCJCaW5rXCI6IFwiMlwiLFxuICAgICAgICBcIk1vdmVtZW50QWNjXCI6IFwiMVwiXG4gICAgfSxcbiAgICBcIkdyZW5hZGVcIjoge1xuICAgICAgICBcIkRhbWFnZVwiOiBcIjE1MDAwMFwiLFxuICAgICAgICBcIkZpcmVJbnRlcnZhbFwiOiBcIjgwXCIsXG4gICAgICAgIFwiQW1tb1wiOiBcIjFcIixcbiAgICAgICAgXCJSZWxvYWRUaW1lXCI6IFwiMjBcIixcbiAgICAgICAgXCJTcGVlZFwiOiBcIjUwXCIsXG4gICAgICAgIFwiQnVsbGV0U3R5bGVcIjogXCIyXCIsXG4gICAgICAgIFwiU3RhcnRVcFRpbWVcIjogXCIwXCIsXG4gICAgICAgIFwiQmlua1wiOiBcIjBcIixcbiAgICAgICAgXCJNb3ZlbWVudEFjY1wiOiBcIjFcIlxuICAgIH0sXG4gICAgXCJTdGF0aW9uYXJ5IEd1blwiOiB7XG4gICAgICAgIFwiRGFtYWdlXCI6IFwiNTBcIixcbiAgICAgICAgXCJGaXJlSW50ZXJ2YWxcIjogXCI0XCIsXG4gICAgICAgIFwiQW1tb1wiOiBcIjEwMFwiLFxuICAgICAgICBcIlJlbG9hZFRpbWVcIjogXCIzNjZcIixcbiAgICAgICAgXCJTcGVlZFwiOiBcIjI5MFwiLFxuICAgICAgICBcIkJ1bGxldFN0eWxlXCI6IFwiMVwiLFxuICAgICAgICBcIlN0YXJ0VXBUaW1lXCI6IFwiMFwiLFxuICAgICAgICBcIkJpbmtcIjogXCIwXCIsXG4gICAgICAgIFwiTW92ZW1lbnRBY2NcIjogXCIxXCJcbiAgICB9XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IEJ1bGxldCA9IHJlcXVpcmUoJy4uL0J1bGxldCcpXG5cbmxldCBBSzQ3ID0gZnVuY3Rpb24gKGdhbWUpIHtcbiAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCBnYW1lLCBnYW1lLndvcmxkLCAnQUstNDcnLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcblxuICAgIHRoaXMuZGFtYWdlID0gMjJcbiAgICB0aGlzLm5leHRGaXJlID0gMFxuICAgIHRoaXMuYnVsbGV0U3BlZWQgPSA1MDAwXG5cbiAgICAvLyBBSzQ3IGZpcmVzIGFib3V0IDYwMCBidWxsZXRzIHBlciBzZWNvbmRcbiAgICB0aGlzLmZpcmVSYXRlID0gMTY2LjY2NjY2N1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA2NDsgaSsrKVxuICAgIHtcbiAgICAgICAgbGV0IGJ1bGxldCA9IG5ldyBCdWxsZXQodGhpcy5nYW1lLCAnZ3JvdW5kJylcbiAgICAgICAgYnVsbGV0LmhlaWdodCA9IDNcbiAgICAgICAgYnVsbGV0LndpZHRoID0gODRcbiAgICAgICAgYnVsbGV0LmRhbWFnZSA9IDIyXG4gICAgICAgIHRoaXMuYWRkKGJ1bGxldCwgdHJ1ZSlcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xufVxuXG5BSzQ3LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLkdyb3VwLnByb3RvdHlwZSk7XG5BSzQ3LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEFLNDc7XG5cbkFLNDcucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbiAoc291cmNlKSB7XG4gICAgaWYgKHRoaXMuZ2FtZS50aW1lLnRpbWUgPCB0aGlzLm5leHRGaXJlKVxuICAgICAgICByZXR1cm5cblxuICAgIHZhciB4ID0gc291cmNlLnggKyAyMjtcbiAgICB2YXIgeSA9IHNvdXJjZS55ICsgMzA7XG5cbiAgICB0aGlzLmdldEZpcnN0RXhpc3RzKGZhbHNlKS5maXJlKHgsIHksIDAsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDApO1xuICAgIHRoaXMuc2V0QWxsKCd0cmFja2luZycsIHRydWUpXG5cbiAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5nYW1lLnRpbWUudGltZSArIHRoaXMuZmlyZVJhdGVcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBSzQ3XG4iLCIndXNlIHN0cmljdCdcblxuLyoqXG4gKiBQcmltYXJ5IFdlYXBvbnNcbiAqIDEuIERlc2VydCBFYWdsZXNcbiAqIDIuIEhLIE1QNVxuICogMy4gQUs0N1xuICogNC4gTTE2XG4gKiA1LiBTcGFzLTEyXG4gKiA2LiBSdWdlciA3N1xuICogNy4gTTc5XG4gKiA4LiBCYXJyZXQgTTgyQTFcbiAqIDkuIEZOIE1pbmltaVxuICogMTAuIFhNMjE0IE1pbmlndW5cbiAqL1xuXG4vKipcbiAqIFNlY29uZGFyeSBXZWFwb25zXG4gKiAxLiBVU1NPQ09NXG4gKiAyLiBDb21iYXQgS25pZmVcbiAqIDMuIENoYWluc2F3XG4gKiA0LiBNNzIgTGF3XG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgXCJBSzQ3XCI6IHJlcXVpcmUoJy4vQUs0NycpXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IE1hcEN0ZjEgPSB7fVxuXG5NYXBDdGYxLmNyZWF0ZSA9IGZ1bmN0aW9uKHNjb3BlKSB7XG4gICAgdGhpcy5zY29wZSA9IHNjb3BlXG5cbiAgICB0aGlzLmNyZWF0ZVNreVNwcml0ZSgpXG4gICAgdGhpcy5jcmVhdGVQbGF0Zm9ybXMoKVxuICAgIHRoaXMuY3JlYXRlTGVkZ2VzKClcblxuICAgIHRoaXMuc2NvcGUucGxhdGZvcm1zLnNldEFsbCgnYm9keS5pbW1vdmFibGUnLCB0cnVlKVxuICAgIHRoaXMuc2NvcGUucGxhdGZvcm1zLnNldEFsbCgnYm9keS5hbGxvd0dyYXZpdHknLCBmYWxzZSlcbn1cblxuTWFwQ3RmMS5jcmVhdGVMZWRnZXMgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgbGVkZ2VzID0gW1xuICAgICAgICAvLyB7eCwgeSwgd2lkdGgsIGhlaWdodH1cblxuICAgICAgICAvLyBTdGFydGluZyBMZWRnZXNcbiAgICAgICAgeyBpZDogMSwgeDogMCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDQzMSwgd2lkdGg6IDEyOCwgaGVpZ2h0OiA5MiB9LCAvLyBMZWZ0IGJvdHRvbSBsZWRnZVxuICAgICAgICB7IGlkOiAyLCB4OiAwLCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gODM4LCB3aWR0aDogMTI4LCBoZWlnaHQ6IDkyIH0sIC8vIExlZnQgdG9wIGxlZGdlXG5cbiAgICAgICAgeyBpZDogMywgeDogMzg3MiwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDQyNywgd2lkdGg6IDEyOCwgaGVpZ2h0OiA5MiB9LCAvLyBSaWdodCBib3R0b20gbGVkZ2VcbiAgICAgICAgeyBpZDogNCwgeDogMzg3MiwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDgzNSwgd2lkdGg6IDEyOCwgaGVpZ2h0OiA5MiB9LCAvLyBSaWdodCB0b3AgbGVkZ2VcblxuICAgICAgICAvLyBHcm91bmQgTGVkZ2VzXG4gICAgICAgIHsgaWQ6IDUsIHg6IDAsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSAxMjgsIHdpZHRoOiA0NzQsIGhlaWdodDogMTI4IH0sIC8vIE1haW4gYm90dG9tIHN0YXJ0aW5nIGxlZnQgbGVkZ2VcbiAgICAgICAgeyBpZDogNiwgeDogNDc0LCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gMjU2LCB3aWR0aDogNjQxLCBoZWlnaHQ6IDI2MCB9LCAvLyBNYWluIGJvdHRvbSBsZWZ0IGxlZGdlXG4gICAgICAgIHsgaWQ6IDcsIHg6IDExMTUsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSAzODQsIHdpZHRoOiAxNzg1LCBoZWlnaHQ6IDM5MCB9LCAvLyBNYWluIGJvdHRvbSBjZW50ZXIgbGVkZ2VcbiAgICAgICAgeyBpZDogOCwgeDogMjkwMCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDI1Niwgd2lkdGg6IDY0MSwgaGVpZ2h0OiAyNjAgfSwgLy8gTWFpbiBib3R0b20gcmlnaHQgbGVkZ2VcbiAgICAgICAgeyBpZDogOSwgeDogMzU0MCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDEyOCwgd2lkdGg6IDQ3NCwgaGVpZ2h0OiAxMjggfSwgLy8gTWFpbiBib3R0b20gc3RhcnRpbmcgcmlnaHQgbGVkZ2VcblxuICAgICAgICAvLyBBaXIgTGVkZ2VzXG4gICAgICAgIHsgaWQ6IDEwLCB4OiAzMDAsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA2MDgsIHdpZHRoOiA2NDEsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogMTEsIHg6IDExMTAsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA3MDEsIHdpZHRoOiA1MTMsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogMTIsIHg6IDg3MCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDk4Miwgd2lkdGg6IDI1NiwgaGVpZ2h0OiA5MiB9LFxuICAgICAgICB7IGlkOiAxMywgeDogMTc0NCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDg3NCwgd2lkdGg6IDUwNywgaGVpZ2h0OiAyNTQgfSxcbiAgICAgICAgeyBpZDogMTQsIHg6IDIzOTAsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA2ODksIHdpZHRoOiA1MTMsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogMTUsIHg6IDMwMzEsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA2MDgsIHdpZHRoOiA2NDEsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogMTYsIHg6IDI5MDMsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA5NTcsIHdpZHRoOiAyNTYsIGhlaWdodDogOTIgfVxuICAgIF1cblxuXG4gICAgbGVkZ2VzLmZvckVhY2goKGxlZGdlKSA9PiB7XG4gICAgICAgIC8vIHZhciBuZXdMZWRnZSA9IHRoaXMuc2NvcGUucGxhdGZvcm1zLmNyZWF0ZShsZWRnZS54LCBsZWRnZS55LCAnZ3JvdW5kJylcbiAgICAgICAgdmFyIG5ld0xlZGdlID0gdGhpcy5zY29wZS5wbGF0Zm9ybXMuY3JlYXRlKGxlZGdlLngsIGxlZGdlLnkpXG4gICAgICAgIG5ld0xlZGdlLmhlaWdodCA9IGxlZGdlLmhlaWdodFxuICAgICAgICBuZXdMZWRnZS53aWR0aCA9IGxlZGdlLndpZHRoXG5cbiAgICAgICAgLy8gRGVidWcgc3R1ZmZcbiAgICAgICAgLy8gbmV3TGVkZ2UuYWxwaGEgPSAwLjJcbiAgICAgICAgLy8gbGV0IHN0eWxlID0geyBmb250OiBcIjIwcHggQXJpYWxcIiwgZmlsbDogXCIjZmYwMDQ0XCIsIGFsaWduOiBcImNlbnRlclwiLCBiYWNrZ3JvdW5kQ29sb3I6IFwiI2ZmZmYwMFwiIH1cbiAgICAgICAgLy8gbGV0IHRleHQgPSB0aGlzLnNjb3BlLmdhbWUuYWRkLnRleHQobGVkZ2UueCwgbGVkZ2UueSwgbGVkZ2UuaWQsIHN0eWxlKVxuICAgICAgICAvLyB0ZXh0LmFscGhhID0gMC4yXG4gICAgfSlcbn1cblxuTWFwQ3RmMS5jcmVhdGVTa3lTcHJpdGUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNjb3BlLmFkZC50aWxlU3ByaXRlKDAsIHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSAxNTAwLCB0aGlzLnNjb3BlLmdhbWUud29ybGQud2lkdGgsIDE1MDAsICd0cmVlc2NhcGUnKVxufVxuXG5NYXBDdGYxLmNyZWF0ZVBsYXRmb3JtcyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2NvcGUucGxhdGZvcm1zID0gdGhpcy5zY29wZS5hZGQuZ3JvdXAoKVxuICAgIHRoaXMuc2NvcGUucGxhdGZvcm1zLmVuYWJsZUJvZHkgPSB0cnVlXG59XG5cbm1vZHVsZS5leHBvcnRzID0gTWFwQ3RmMVxuIl19
