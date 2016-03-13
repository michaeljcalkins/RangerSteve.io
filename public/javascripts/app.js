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
        this.GRAVITY = 1900; // pixels/second/second
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
        //  Collide the player and the stars with the platforms
        this.physics.arcade.collide(this.player, this.platforms);
        this.physics.arcade.collide(this.platforms, this.weapons, function (platform, weapon) {
            weapon.kill();
        }, null, this);

        this.physics.arcade.collide(this.enemy, this.weapons, function (enemy, weapon) {
            enemy.health -= weapon.damage;
            weapon.kill();
            console.log('You hit them!', enemy.health, weapon.damage);
            if (enemy.health <= 0) {
                console.log('They are dead!');
                this.enemy.x = 200;
                this.enemy.y = 200;
                this.enemy.health = 100;
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
        var isActive = false;

        isActive = this.input.keyboard.isDown(Phaser.Keyboard.A);

        return isActive;
    },

    // This function should return true when the player activates the "go right" control
    // In this case, either holding the right arrow or tapping or clicking on the right
    // side of the screen.
    rightInputIsActive: function rightInputIsActive() {
        var isActive = false;

        isActive = this.input.keyboard.isDown(Phaser.Keyboard.D);

        return isActive;
    },

    // This function should return true when the player activates the "jump" control
    // In this case, either holding the up arrow or tapping or clicking on the center
    // part of the screen.
    upInputIsActive: function upInputIsActive(duration) {
        var isActive = false;

        isActive = this.input.keyboard.downDuration(Phaser.Keyboard.W, duration);

        return isActive;
    },

    // This function returns true when the player releases the "jump" control
    upInputReleased: function upInputReleased() {
        var released = false;

        released = this.input.keyboard.upDuration(Phaser.Keyboard.W);

        return released;
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

        // Add new player to the remote players array
        var newRemotePlayer = RemotePlayer.create(data.id, this.game, this.player, data.x, data.y);
        this.enemies.push(newRemotePlayer);
        this.enemies[this.enemies.length - 1].player.animations.add('left', [0, 1, 2, 3], 10, true);
        this.enemies[this.enemies.length - 1].player.animations.add('right', [5, 6, 7, 8], 10, true);
    },

    // Move player
    onMovePlayer: function onMovePlayer(data) {
        var movePlayer = this.playerById(data.id);

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
    },

    // Remove player
    onRemovePlayer: function onRemovePlayer(data) {
        var removePlayer = this.playerById(data.id);

        // Player not found
        if (!removePlayer) {
            console.log('Player not found: ', data.id);
            return;
        }

        removePlayer.player.kill();

        // Remove player from array
        this.enemies.splice(this.enemies.indexOf(removePlayer), 1);
    },

    // Find player by ID
    playerById: function playerById(id) {
        for (var i = 0; i < this.enemies.length; i++) {
            if (this.enemies[i].player.name === id) {
                return this.enemies[i];
            }
        }

        return false;
    }
};

game.state.add('Game', RangerSteveGame, true);

},{"./lib/Bullet":2,"./lib/Guid":3,"./lib/RemotePlayer":4,"./lib/WeaponSettings":5,"./lib/Weapons":8,"./maps/MapCtf1":9}],2:[function(require,module,exports){
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
    // this.scale.set(1);

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

var RemotePlayer = {
    lastPosition: {
        x: 0,
        y: 0
    }
};

RemotePlayer.update = function () {
    if (this.player.x !== this.lastPosition.x || this.player.y !== this.lastPosition.y) {
        this.player.play('move');
    } else {
        this.player.play('stop');
    }

    this.lastPosition.x = this.player.x;
    this.lastPosition.y = this.player.y;
};

module.exports = {
    create: function create(index, game, player, startX, startY) {
        var newRemotePlayer = {
            x: startX,
            y: startY,
            game: game,
            health: 100,
            player: player,
            alive: true,
            lastPosition: {
                x: startX,
                y: startY
            }
        };

        newRemotePlayer = Object.assign(RemotePlayer, newRemotePlayer);

        // Create the player's enemy sprite
        newRemotePlayer.player = game.add.sprite(startX, startY, 'enemy');

        // Our two animations, walking left and right.
        newRemotePlayer.player.animations.add('left', [0, 1, 2, 3], 10, true);
        newRemotePlayer.player.animations.add('right', [5, 6, 7, 8], 10, true);

        newRemotePlayer.player.name = index.toString();

        return newRemotePlayer;
    }
};

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
        bullet.height = 2;
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

},{"../Bullet":2}],7:[function(require,module,exports){
'use strict';

var Bullet = require('../Bullet');

var BarretM82A1 = function BarretM82A1(game) {
    Phaser.Group.call(this, game, game.world, 'AK-47', false, true, Phaser.Physics.ARCADE);

    this.name = 'Barret M82A1';
    this.damage = 88;
    this.nextFire = 0;
    this.bulletSpeed = 3435;

    // BarretM82A1 fires about 600 bullets per second
    this.fireRate = 4000;

    for (var i = 0; i < 64; i++) {
        var bullet = new Bullet(this.game, 'ground');
        bullet.height = 2;
        bullet.width = 10;
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
};

module.exports = BarretM82A1;

},{"../Bullet":2}],8:[function(require,module,exports){
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
};

},{"./AK47":6,"./BarretM82A1":7}],9:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvYXBwLmpzIiwiYXNzZXRzL2pzL2xpYi9CdWxsZXQuanMiLCJhc3NldHMvanMvbGliL0d1aWQuanMiLCJhc3NldHMvanMvbGliL1JlbW90ZVBsYXllci5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9uU2V0dGluZ3MuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvQUs0Ny5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9CYXJyZXRNODJBMS5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9pbmRleC5qcyIsImFzc2V0cy9qcy9tYXBzL01hcEN0ZjEuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7QUFFQSxJQUFJLFVBQVUsUUFBUSxnQkFBUixDQUFWO0FBQ0osSUFBSSxlQUFlLFFBQVEsb0JBQVIsQ0FBZjtBQUNKLElBQUksaUJBQWlCLFFBQVEsc0JBQVIsQ0FBakI7QUFDSixJQUFJLE9BQU8sUUFBUSxZQUFSLENBQVA7QUFDSixJQUFJLFVBQVUsUUFBUSxlQUFSLENBQVY7QUFDSixJQUFJLFNBQVMsUUFBUSxjQUFSLENBQVQ7O0FBRUosSUFBSSxZQUFZLE9BQU8sVUFBUDtBQUNoQixJQUFJLGFBQWEsT0FBTyxXQUFQO0FBQ2pCLElBQUksYUFBYSxJQUFiO0FBQ0osSUFBSSxjQUFjLElBQWQ7O0FBRUosSUFBSSxPQUFPLElBQUksT0FBTyxJQUFQLENBQVksU0FBaEIsRUFBMkIsVUFBM0IsRUFBdUMsT0FBTyxNQUFQLEVBQWUsbUJBQXRELENBQVA7O0FBRUosSUFBSSxrQkFBa0IsU0FBbEIsZUFBa0IsR0FBVztBQUM3QixTQUFLLFFBQUwsR0FBZ0IsTUFBaEIsQ0FENkI7QUFFN0IsU0FBSyxhQUFMLEdBQXFCLENBQXJCLENBRjZCO0FBRzdCLFNBQUssT0FBTCxHQUFlLEVBQWYsQ0FINkI7QUFJN0IsU0FBSyxJQUFMLEdBQVksSUFBWixDQUo2QjtBQUs3QixTQUFLLE1BQUwsQ0FMNkI7QUFNN0IsU0FBSyxTQUFMLENBTjZCO0FBTzdCLFNBQUssTUFBTCxDQVA2QjtBQVE3QixTQUFLLEtBQUwsR0FBYSxDQUFiLENBUjZCO0FBUzdCLFNBQUssU0FBTCxDQVQ2QjtBQVU3QixTQUFLLE1BQUwsQ0FWNkI7QUFXN0IsU0FBSyxVQUFMLEdBQWtCLElBQWxCLENBWDZCO0FBWTdCLFNBQUssT0FBTCxHQUFlLEVBQWYsQ0FaNkI7Q0FBWDs7QUFldEIsZ0JBQWdCLFNBQWhCLEdBQTRCO0FBQ3hCLFVBQU0sZ0JBQVc7QUFDYixhQUFLLElBQUwsQ0FBVSxRQUFWLENBQW1CLGFBQW5CLENBQWlDLFdBQWpDLEdBQStDLElBQS9DLENBRGE7QUFFYixhQUFLLElBQUwsQ0FBVSxLQUFWLENBQWdCLHVCQUFoQixHQUEwQyxJQUExQyxDQUZhO0FBR2IsYUFBSyxPQUFMLENBQWEsV0FBYixDQUF5QixPQUFPLE9BQVAsQ0FBZSxNQUFmLENBQXpCLENBSGE7S0FBWDs7QUFNTixhQUFTLG1CQUFXO0FBQ2hCLGFBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsVUFBaEIsRUFBNEIsc0JBQTVCLEVBRGdCO0FBRWhCLGFBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsVUFBaEIsRUFBNEIsc0JBQTVCLEVBRmdCO0FBR2hCLGFBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsU0FBaEIsRUFBMkIscUJBQTNCLEVBSGdCO0FBSWhCLGFBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsU0FBaEIsRUFBMkIscUJBQTNCLEVBSmdCO0FBS2hCLGFBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsU0FBaEIsRUFBMkIscUJBQTNCLEVBTGdCO0FBTWhCLGFBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsU0FBaEIsRUFBMkIscUJBQTNCLEVBTmdCO0FBT2hCLGFBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsU0FBaEIsRUFBMkIscUJBQTNCLEVBUGdCO0FBUWhCLGFBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsV0FBaEIsRUFBNkIsc0JBQTdCLEVBUmdCO0FBU2hCLGFBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsUUFBaEIsRUFBMEIsc0JBQTFCLEVBVGdCO0FBVWhCLGFBQUssSUFBTCxDQUFVLFdBQVYsQ0FBc0IsTUFBdEIsRUFBOEIsa0JBQTlCLEVBQWtELEVBQWxELEVBQXNELEVBQXRELEVBVmdCO0FBV2hCLGFBQUssSUFBTCxDQUFVLFdBQVYsQ0FBc0IsT0FBdEIsRUFBK0Isa0JBQS9CLEVBQW1ELEVBQW5ELEVBQXVELEVBQXZELEVBWGdCO0tBQVg7O0FBY1QsWUFBUSxrQkFBVzs7O0FBQ2YsYUFBSyxNQUFMLEdBQWMsR0FBRyxPQUFILEVBQWQsQ0FEZTtBQUVmLGFBQUssT0FBTCxHQUFlLEVBQWY7OztBQUZlLFlBS2YsQ0FBSyxPQUFMLENBQWEsV0FBYixDQUF5QixPQUFPLE9BQVAsQ0FBZSxNQUFmLENBQXpCLENBTGU7O0FBT2YsYUFBSyxLQUFMLENBQVcsU0FBWCxDQUFxQixDQUFyQixFQUF3QixDQUF4QixFQUEyQixVQUEzQixFQUF1QyxXQUF2QyxFQVBlO0FBUWYsYUFBSyxJQUFMLENBQVUsS0FBVixDQUFnQixlQUFoQixHQUFrQyxTQUFsQzs7O0FBUmUsWUFXZixDQUFLLElBQUwsQ0FBVSxLQUFWLENBQWdCLFNBQWhCLEdBQTRCLE9BQU8sWUFBUCxDQUFvQixNQUFwQixDQVhiO0FBWWYsYUFBSyxJQUFMLENBQVUsS0FBVixDQUFnQixVQUFoQixHQVplO0FBYWYsYUFBSyxJQUFMLENBQVUsS0FBVixDQUFnQixPQUFoQjs7Ozs7QUFiZSxlQW1CZixDQUFRLE1BQVIsQ0FBZSxJQUFmOzs7QUFuQmUsWUFzQmYsQ0FBSyxTQUFMLEdBQWlCLEdBQWpCO0FBdEJlLFlBdUJmLENBQUssWUFBTCxHQUFvQixJQUFwQjtBQXZCZSxZQXdCZixDQUFLLElBQUwsR0FBWSxJQUFaO0FBeEJlLFlBeUJmLENBQUssT0FBTCxHQUFlLElBQWY7QUF6QmUsWUEwQmYsQ0FBSyxVQUFMLEdBQWtCLENBQUMsR0FBRDs7Ozs7QUExQkgsWUFnQ2YsQ0FBSyxNQUFMLEdBQWMsS0FBSyxHQUFMLENBQVMsTUFBVCxDQUFnQixHQUFoQixFQUFxQixLQUFLLEtBQUwsQ0FBVyxNQUFYLEdBQW9CLEdBQXBCLEVBQXlCLE1BQTlDLENBQWQ7OztBQWhDZSxZQW1DZixDQUFLLE9BQUwsQ0FBYSxNQUFiLENBQW9CLE1BQXBCLENBQTJCLEtBQUssTUFBTCxDQUEzQjs7O0FBbkNlLFlBc0NmLENBQUssSUFBTCxDQUFVLE9BQVYsQ0FBa0IsTUFBbEIsQ0FBeUIsS0FBSyxNQUFMLEVBQWEsT0FBTyxPQUFQLENBQWUsTUFBZixDQUF0Qzs7O0FBdENlLFlBeUNmLENBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsa0JBQWpCLEdBQXNDLElBQXRDOzs7QUF6Q2UsWUE0Q2YsQ0FBSyxNQUFMLENBQVksSUFBWixDQUFpQixXQUFqQixDQUE2QixLQUE3QixDQUFtQyxLQUFLLFNBQUwsRUFBZ0IsS0FBSyxTQUFMLEdBQWlCLEVBQWpCLENBQW5EOzs7QUE1Q2UsWUErQ2YsQ0FBSyxNQUFMLENBQVksSUFBWixDQUFpQixJQUFqQixDQUFzQixLQUF0QixDQUE0QixLQUFLLElBQUwsRUFBVyxDQUF2Qzs7O0FBL0NlLFlBa0RmLENBQUssT0FBTCxDQUFhLE1BQWIsQ0FBb0IsT0FBcEIsQ0FBNEIsQ0FBNUIsR0FBZ0MsS0FBSyxPQUFMOzs7QUFsRGpCLFlBcURmLENBQUssT0FBTCxHQUFlLEtBQWY7OztBQXJEZSxZQXdEZixDQUFLLE1BQUwsQ0FBWSxVQUFaLENBQXVCLEdBQXZCLENBQTJCLE1BQTNCLEVBQW1DLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixDQUFuQyxFQUFpRCxFQUFqRCxFQUFxRCxJQUFyRCxFQXhEZTtBQXlEZixhQUFLLE1BQUwsQ0FBWSxVQUFaLENBQXVCLEdBQXZCLENBQTJCLE9BQTNCLEVBQW9DLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixDQUFwQyxFQUFrRCxFQUFsRCxFQUFzRCxJQUF0RDs7Ozs7QUF6RGUsWUErRGYsQ0FBSyxhQUFMLEdBQXFCLENBQXJCLENBL0RlO0FBZ0VmLGFBQUssT0FBTCxDQUFhLElBQWIsQ0FBa0IsSUFBSSxRQUFRLElBQVIsQ0FBYSxLQUFLLElBQUwsQ0FBbkMsRUFoRWU7QUFpRWYsYUFBSyxPQUFMLENBQWEsSUFBYixDQUFrQixJQUFJLFFBQVEsV0FBUixDQUFvQixLQUFLLElBQUwsQ0FBMUM7Ozs7O0FBakVlLFlBdUVYLGFBQWEsRUFBRSxVQUFVLE1BQVYsRUFBa0IsTUFBTSxNQUFOLEVBQWpDLENBdkVXO0FBd0VmLGFBQUssU0FBTCxHQUFpQixLQUFLLEdBQUwsQ0FBUyxJQUFULENBQWMsRUFBZCxFQUFrQixFQUFsQixFQUFzQixVQUF0QixFQUFrQyxVQUFsQyxDQUFqQixDQXhFZTtBQXlFZixhQUFLLFNBQUwsQ0FBZSxhQUFmLEdBQStCLElBQS9CLENBekVlO0FBMEVmLGFBQUssVUFBTCxHQUFrQixLQUFLLEdBQUwsQ0FBUyxJQUFULENBQWMsS0FBSyxNQUFMLENBQVksS0FBWixHQUFvQixHQUFwQixFQUF5QixLQUFLLE1BQUwsQ0FBWSxNQUFaLEdBQXFCLEVBQXJCLEVBQXlCLE9BQWhFLEVBQXlFLFVBQXpFLENBQWxCLENBMUVlO0FBMkVmLGFBQUssVUFBTCxDQUFnQixhQUFoQixHQUFnQyxJQUFoQyxDQTNFZTtBQTRFZixhQUFLLGlCQUFMLEdBQXlCLEtBQUssR0FBTCxDQUFTLElBQVQsQ0FBYyxLQUFLLE1BQUwsQ0FBWSxDQUFaLEdBQWdCLEVBQWhCLEVBQW9CLEtBQUssTUFBTCxDQUFZLE1BQVosR0FBcUIsRUFBckIsRUFBeUIsS0FBM0QsRUFBa0UsVUFBbEUsQ0FBekIsQ0E1RWU7QUE2RWYsYUFBSyxpQkFBTCxDQUF1QixhQUF2QixHQUF1QyxJQUF2Qzs7Ozs7QUE3RWUsWUFtRmYsQ0FBSyxNQUFMLENBQVksTUFBWixDQUFtQixLQUFLLE1BQUwsQ0FBbkIsQ0FuRmU7O0FBcUZmLFlBQUksWUFBWSxLQUFLLEtBQUwsQ0FBVyxRQUFYLENBQW9CLE1BQXBCLENBQTJCLE9BQU8sUUFBUCxDQUFnQixLQUFoQixDQUF2QyxDQXJGVztBQXNGZixrQkFBVSxNQUFWLENBQWlCLEdBQWpCLENBQXFCLEtBQUssVUFBTCxFQUFpQixJQUF0Qzs7Ozs7QUF0RmUsY0E0RmYsQ0FBTyxnQkFBUCxDQUF3QixRQUF4QixFQUFrQyxZQUFNO0FBQ3BDLGtCQUFLLElBQUwsQ0FBVSxLQUFWLENBQWdCLE9BQWhCLEdBRG9DO0FBRXBDLGtCQUFLLElBQUwsQ0FBVSxNQUFWLEdBQW1CLE9BQU8sV0FBUCxDQUZpQjtBQUdwQyxrQkFBSyxJQUFMLENBQVUsS0FBVixHQUFrQixPQUFPLFVBQVAsQ0FIa0I7O0FBS3BDLGtCQUFLLFVBQUwsQ0FBZ0IsWUFBaEIsQ0FBNkIsQ0FBN0IsR0FBaUMsTUFBSyxNQUFMLENBQVksS0FBWixHQUFvQixHQUFwQixDQUxHO0FBTXBDLGtCQUFLLFVBQUwsQ0FBZ0IsWUFBaEIsQ0FBNkIsQ0FBN0IsR0FBaUMsTUFBSyxNQUFMLENBQVksTUFBWixHQUFxQixFQUFyQixDQU5HOztBQVFwQyxrQkFBSyxTQUFMLENBQWUsWUFBZixDQUE0QixDQUE1QixHQUFnQyxFQUFoQyxDQVJvQztBQVNwQyxrQkFBSyxTQUFMLENBQWUsWUFBZixDQUE0QixDQUE1QixHQUFnQyxFQUFoQyxDQVRvQztTQUFOLENBQWxDOzs7OztBQTVGZSxZQTRHZixDQUFLLGdCQUFMLEdBNUdlO0tBQVg7O0FBK0dSLFlBQVEsa0JBQVc7O0FBRWYsYUFBSyxPQUFMLENBQWEsTUFBYixDQUFvQixPQUFwQixDQUE0QixLQUFLLE1BQUwsRUFBYSxLQUFLLFNBQUwsQ0FBekMsQ0FGZTtBQUdmLGFBQUssT0FBTCxDQUFhLE1BQWIsQ0FBb0IsT0FBcEIsQ0FBNEIsS0FBSyxTQUFMLEVBQWdCLEtBQUssT0FBTCxFQUFjLFVBQVMsUUFBVCxFQUFtQixNQUFuQixFQUEyQjtBQUNqRixtQkFBTyxJQUFQLEdBRGlGO1NBQTNCLEVBRXZELElBRkgsRUFFUyxJQUZULEVBSGU7O0FBT2YsYUFBSyxPQUFMLENBQWEsTUFBYixDQUFvQixPQUFwQixDQUE0QixLQUFLLEtBQUwsRUFBWSxLQUFLLE9BQUwsRUFBYyxVQUFTLEtBQVQsRUFBZ0IsTUFBaEIsRUFBd0I7QUFDMUUsa0JBQU0sTUFBTixJQUFnQixPQUFPLE1BQVAsQ0FEMEQ7QUFFMUUsbUJBQU8sSUFBUCxHQUYwRTtBQUcxRSxvQkFBUSxHQUFSLENBQVksZUFBWixFQUE2QixNQUFNLE1BQU4sRUFBYyxPQUFPLE1BQVAsQ0FBM0MsQ0FIMEU7QUFJMUUsZ0JBQUksTUFBTSxNQUFOLElBQWdCLENBQWhCLEVBQW1CO0FBQ25CLHdCQUFRLEdBQVIsQ0FBWSxnQkFBWixFQURtQjtBQUVuQixxQkFBSyxLQUFMLENBQVcsQ0FBWCxHQUFlLEdBQWYsQ0FGbUI7QUFHbkIscUJBQUssS0FBTCxDQUFXLENBQVgsR0FBZSxHQUFmLENBSG1CO0FBSW5CLHFCQUFLLEtBQUwsQ0FBVyxNQUFYLEdBQW9CLEdBQXBCLENBSm1CO2FBQXZCO1NBSmtELEVBVW5ELElBVkgsRUFVUyxJQVZULEVBUGU7O0FBbUJmLFlBQUksS0FBSyxpQkFBTCxFQUFKLEVBQThCOztBQUUxQixpQkFBSyxNQUFMLENBQVksSUFBWixDQUFpQixZQUFqQixDQUE4QixDQUE5QixHQUFrQyxDQUFDLEtBQUssWUFBTCxDQUZUO0FBRzFCLGlCQUFLLE1BQUwsQ0FBWSxVQUFaLENBQXVCLElBQXZCLENBQTRCLE1BQTVCLEVBSDBCO1NBQTlCLE1BSU8sSUFBSSxLQUFLLGtCQUFMLEVBQUosRUFBK0I7O0FBRWxDLGlCQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLFlBQWpCLENBQThCLENBQTlCLEdBQWtDLEtBQUssWUFBTCxDQUZBO0FBR2xDLGlCQUFLLE1BQUwsQ0FBWSxVQUFaLENBQXVCLElBQXZCLENBQTRCLE9BQTVCLEVBSGtDO1NBQS9CLE1BSUE7O0FBRUgsaUJBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsWUFBakIsQ0FBOEIsQ0FBOUIsR0FBa0MsQ0FBbEMsQ0FGRztBQUdILGlCQUFLLE1BQUwsQ0FBWSxVQUFaLENBQXVCLElBQXZCLEdBSEc7QUFJSCxpQkFBSyxNQUFMLENBQVksS0FBWixHQUFvQixDQUFwQixDQUpHO1NBSkE7OztBQXZCUSxZQW1DWCxjQUFjLEtBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsUUFBakIsQ0FBMEIsSUFBMUI7OztBQW5DSCxZQXNDWCxXQUFKLEVBQWlCO0FBQ2IsaUJBQUssS0FBTCxHQUFhLENBQWIsQ0FEYTtBQUViLGlCQUFLLE9BQUwsR0FBZSxLQUFmLENBRmE7U0FBakI7OztBQXRDZSxZQTRDWCxLQUFLLEtBQUwsR0FBYSxDQUFiLElBQWtCLEtBQUssZUFBTCxDQUFxQixDQUFyQixDQUFsQixFQUEyQztBQUMzQyxpQkFBSyxNQUFMLENBQVksSUFBWixDQUFpQixRQUFqQixDQUEwQixDQUExQixHQUE4QixLQUFLLFVBQUwsQ0FEYTtBQUUzQyxpQkFBSyxPQUFMLEdBQWUsSUFBZixDQUYyQztTQUEvQzs7O0FBNUNlLFlBa0RYLEtBQUssT0FBTCxJQUFnQixLQUFLLGVBQUwsRUFBaEIsRUFBd0M7QUFDeEMsaUJBQUssS0FBTCxHQUR3QztBQUV4QyxpQkFBSyxPQUFMLEdBQWUsS0FBZixDQUZ3QztTQUE1Qzs7QUFLQSxZQUFJLEtBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsYUFBaEIsQ0FBOEIsTUFBOUIsRUFDSjtBQUNJLGlCQUFLLE9BQUwsQ0FBYSxLQUFLLGFBQUwsQ0FBYixDQUFpQyxJQUFqQyxDQUFzQyxLQUFLLE1BQUwsQ0FBdEMsQ0FESjtTQURBOztBQUtBLGFBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsYUFBakIsRUFBZ0MsRUFBRSxHQUFHLEtBQUssTUFBTCxDQUFZLENBQVosRUFBZSxHQUFHLEtBQUssTUFBTCxDQUFZLENBQVosRUFBdkQsRUE1RGU7S0FBWDs7Ozs7QUFrRVIsdUJBQW1CLDZCQUFXO0FBQzFCLFlBQUksV0FBVyxLQUFYLENBRHNCOztBQUcxQixtQkFBVyxLQUFLLEtBQUwsQ0FBVyxRQUFYLENBQW9CLE1BQXBCLENBQTJCLE9BQU8sUUFBUCxDQUFnQixDQUFoQixDQUF0QyxDQUgwQjs7QUFLMUIsZUFBTyxRQUFQLENBTDBCO0tBQVg7Ozs7O0FBV25CLHdCQUFvQiw4QkFBVztBQUMzQixZQUFJLFdBQVcsS0FBWCxDQUR1Qjs7QUFHM0IsbUJBQVcsS0FBSyxLQUFMLENBQVcsUUFBWCxDQUFvQixNQUFwQixDQUEyQixPQUFPLFFBQVAsQ0FBZ0IsQ0FBaEIsQ0FBdEMsQ0FIMkI7O0FBSzNCLGVBQU8sUUFBUCxDQUwyQjtLQUFYOzs7OztBQVdwQixxQkFBaUIseUJBQVMsUUFBVCxFQUFtQjtBQUNoQyxZQUFJLFdBQVcsS0FBWCxDQUQ0Qjs7QUFHaEMsbUJBQVcsS0FBSyxLQUFMLENBQVcsUUFBWCxDQUFvQixZQUFwQixDQUFpQyxPQUFPLFFBQVAsQ0FBZ0IsQ0FBaEIsRUFBbUIsUUFBcEQsQ0FBWCxDQUhnQzs7QUFLaEMsZUFBTyxRQUFQLENBTGdDO0tBQW5COzs7QUFTakIscUJBQWlCLDJCQUFXO0FBQ3hCLFlBQUksV0FBVyxLQUFYLENBRG9COztBQUd4QixtQkFBVyxLQUFLLEtBQUwsQ0FBVyxRQUFYLENBQW9CLFVBQXBCLENBQStCLE9BQU8sUUFBUCxDQUFnQixDQUFoQixDQUExQyxDQUh3Qjs7QUFLeEIsZUFBTyxRQUFQLENBTHdCO0tBQVg7O0FBUWpCLGdCQUFZLHNCQUFXOztBQUVuQixZQUFJLEtBQUssYUFBTCxHQUFxQixDQUFyQixFQUNKO0FBQ0ksaUJBQUssT0FBTCxDQUFhLEtBQUssYUFBTCxDQUFiLENBQWlDLEtBQWpDLEdBREo7U0FEQSxNQUtBO0FBQ0ksaUJBQUssT0FBTCxDQUFhLEtBQUssYUFBTCxDQUFiLENBQWlDLE9BQWpDLEdBQTJDLEtBQTNDLENBREo7QUFFSSxpQkFBSyxPQUFMLENBQWEsS0FBSyxhQUFMLENBQWIsQ0FBaUMsT0FBakMsQ0FBeUMsT0FBekMsRUFBa0QsSUFBbEQsRUFBd0QsQ0FBeEQsRUFBMkQsQ0FBM0QsRUFGSjtBQUdJLGlCQUFLLE9BQUwsQ0FBYSxLQUFLLGFBQUwsQ0FBYixDQUFpQyxNQUFqQyxDQUF3QyxRQUF4QyxFQUFrRCxLQUFsRCxFQUhKO1NBTEE7OztBQUZtQixZQWNuQixDQUFLLGFBQUwsR0FkbUI7O0FBZ0JuQixZQUFJLEtBQUssYUFBTCxLQUF1QixLQUFLLE9BQUwsQ0FBYSxNQUFiLEVBQzNCO0FBQ0ksaUJBQUssYUFBTCxHQUFxQixDQUFyQixDQURKO1NBREE7O0FBS0EsYUFBSyxPQUFMLENBQWEsS0FBSyxhQUFMLENBQWIsQ0FBaUMsT0FBakMsR0FBMkMsSUFBM0MsQ0FyQm1COztBQXVCbkIsYUFBSyxVQUFMLENBQWdCLElBQWhCLEdBQXVCLEtBQUssT0FBTCxDQUFhLEtBQUssYUFBTCxDQUFiLENBQWlDLElBQWpDLENBdkJKO0tBQVg7O0FBMEJaLHNCQUFrQiw0QkFBWTs7QUFFMUIsYUFBSyxNQUFMLENBQVksRUFBWixDQUFlLFNBQWYsRUFBMEIsS0FBSyxpQkFBTCxDQUF1QixJQUF2QixDQUE0QixJQUE1QixDQUExQjs7O0FBRjBCLFlBSzFCLENBQUssTUFBTCxDQUFZLEVBQVosQ0FBZSxZQUFmLEVBQTZCLEtBQUssa0JBQUwsQ0FBd0IsSUFBeEIsQ0FBNkIsSUFBN0IsQ0FBN0I7OztBQUwwQixZQVExQixDQUFLLE1BQUwsQ0FBWSxFQUFaLENBQWUsWUFBZixFQUE2QixLQUFLLFdBQUwsQ0FBaUIsSUFBakIsQ0FBc0IsSUFBdEIsQ0FBN0I7OztBQVIwQixZQVcxQixDQUFLLE1BQUwsQ0FBWSxFQUFaLENBQWUsYUFBZixFQUE4QixLQUFLLFlBQUwsQ0FBa0IsSUFBbEIsQ0FBdUIsSUFBdkIsQ0FBOUI7OztBQVgwQixZQWMxQixDQUFLLE1BQUwsQ0FBWSxFQUFaLENBQWUsZUFBZixFQUFnQyxLQUFLLGNBQUwsQ0FBb0IsSUFBcEIsQ0FBeUIsSUFBekIsQ0FBaEMsRUFkMEI7S0FBWjs7O0FBa0JsQix1QkFBbUIsMkJBQVMsSUFBVCxFQUFlO0FBQzlCLGdCQUFRLEdBQVIsQ0FBWSw0QkFBWjs7O0FBRDhCLFlBSTlCLENBQUssT0FBTCxDQUFhLE9BQWIsQ0FBcUIsVUFBVSxLQUFWLEVBQWlCO0FBQ2xDLGtCQUFNLE1BQU4sQ0FBYSxJQUFiLEdBRGtDO1NBQWpCLENBQXJCLENBSjhCO0FBTzlCLGFBQUssT0FBTCxHQUFlLEVBQWY7OztBQVA4QixZQVU5QixDQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLFlBQWpCLEVBQStCO0FBQzNCLHNCQUFVLEtBQUssUUFBTDtBQUNWLGVBQUcsS0FBSyxNQUFMLENBQVksQ0FBWjtBQUNILGVBQUcsS0FBSyxNQUFMLENBQVksQ0FBWjtTQUhQLEVBVjhCO0tBQWY7OztBQWtCbkIsd0JBQW9CLDhCQUFXO0FBQzNCLGdCQUFRLEdBQVIsQ0FBWSxpQ0FBWixFQUQyQjtLQUFYOzs7QUFLcEIsaUJBQWEscUJBQVMsSUFBVCxFQUFlO0FBQ3hCLGdCQUFRLEdBQVIsQ0FBWSx1QkFBWixFQUFxQyxLQUFLLEVBQUwsQ0FBckM7OztBQUR3QixZQUlwQixZQUFZLEtBQUssVUFBTCxDQUFnQixLQUFLLEVBQUwsQ0FBNUIsQ0FKb0I7QUFLeEIsWUFBSSxhQUFhLEtBQUssUUFBTCxLQUFrQixLQUFLLFFBQUwsRUFBZTtBQUM5QyxvQkFBUSxHQUFSLENBQVksbUJBQVosRUFEOEM7QUFFOUMsbUJBRjhDO1NBQWxEOzs7QUFMd0IsWUFXcEIsa0JBQWtCLGFBQWEsTUFBYixDQUFvQixLQUFLLEVBQUwsRUFBUyxLQUFLLElBQUwsRUFBVyxLQUFLLE1BQUwsRUFBYSxLQUFLLENBQUwsRUFBUSxLQUFLLENBQUwsQ0FBL0UsQ0FYb0I7QUFZeEIsYUFBSyxPQUFMLENBQWEsSUFBYixDQUFrQixlQUFsQixFQVp3QjtBQWF4QixhQUFLLE9BQUwsQ0FBYSxLQUFLLE9BQUwsQ0FBYSxNQUFiLEdBQXNCLENBQXRCLENBQWIsQ0FBc0MsTUFBdEMsQ0FBNkMsVUFBN0MsQ0FBd0QsR0FBeEQsQ0FBNEQsTUFBNUQsRUFBb0UsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLENBQXBFLEVBQWtGLEVBQWxGLEVBQXNGLElBQXRGLEVBYndCO0FBY3hCLGFBQUssT0FBTCxDQUFhLEtBQUssT0FBTCxDQUFhLE1BQWIsR0FBc0IsQ0FBdEIsQ0FBYixDQUFzQyxNQUF0QyxDQUE2QyxVQUE3QyxDQUF3RCxHQUF4RCxDQUE0RCxPQUE1RCxFQUFxRSxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsQ0FBckUsRUFBbUYsRUFBbkYsRUFBdUYsSUFBdkYsRUFkd0I7S0FBZjs7O0FBa0JiLGtCQUFjLHNCQUFTLElBQVQsRUFBZTtBQUN6QixZQUFJLGFBQWEsS0FBSyxVQUFMLENBQWdCLEtBQUssRUFBTCxDQUE3Qjs7O0FBRHFCLFlBSXJCLENBQUUsVUFBRixFQUFjO0FBQ2QsbUJBRGM7U0FBbEI7OztBQUp5QixrQkFTekIsQ0FBVyxNQUFYLENBQWtCLENBQWxCLEdBQXNCLEtBQUssQ0FBTCxDQVRHO0FBVXpCLG1CQUFXLE1BQVgsQ0FBa0IsQ0FBbEIsR0FBc0IsS0FBSyxDQUFMLENBVkc7O0FBWXpCLFlBQUksV0FBVyxNQUFYLENBQWtCLENBQWxCLEdBQXNCLFdBQVcsWUFBWCxDQUF3QixDQUF4QixFQUEyQjtBQUNqRCx1QkFBVyxNQUFYLENBQWtCLFVBQWxCLENBQTZCLElBQTdCLENBQWtDLE9BQWxDLEVBRGlEO1NBQXJELE1BR0ssSUFBSSxXQUFXLE1BQVgsQ0FBa0IsQ0FBbEIsR0FBc0IsV0FBVyxZQUFYLENBQXdCLENBQXhCLEVBQy9CO0FBQ0ksdUJBQVcsTUFBWCxDQUFrQixVQUFsQixDQUE2QixJQUE3QixDQUFrQyxNQUFsQyxFQURKO1NBREssTUFLTDtBQUNJLHVCQUFXLE1BQVgsQ0FBa0IsVUFBbEIsQ0FBNkIsSUFBN0IsR0FESjtBQUVJLHVCQUFXLE1BQVgsQ0FBa0IsS0FBbEIsR0FBMEIsQ0FBMUIsQ0FGSjtTQUxLOztBQVVMLG1CQUFXLFlBQVgsQ0FBd0IsQ0FBeEIsR0FBNEIsV0FBVyxNQUFYLENBQWtCLENBQWxCLENBekJIO0FBMEJ6QixtQkFBVyxZQUFYLENBQXdCLENBQXhCLEdBQTRCLFdBQVcsTUFBWCxDQUFrQixDQUFsQixDQTFCSDtLQUFmOzs7QUE4QmQsb0JBQWdCLHdCQUFTLElBQVQsRUFBZTtBQUMzQixZQUFJLGVBQWUsS0FBSyxVQUFMLENBQWdCLEtBQUssRUFBTCxDQUEvQjs7O0FBRHVCLFlBSXZCLENBQUMsWUFBRCxFQUFlO0FBQ2Ysb0JBQVEsR0FBUixDQUFZLG9CQUFaLEVBQWtDLEtBQUssRUFBTCxDQUFsQyxDQURlO0FBRWYsbUJBRmU7U0FBbkI7O0FBS0EscUJBQWEsTUFBYixDQUFvQixJQUFwQjs7O0FBVDJCLFlBWTNCLENBQUssT0FBTCxDQUFhLE1BQWIsQ0FBb0IsS0FBSyxPQUFMLENBQWEsT0FBYixDQUFxQixZQUFyQixDQUFwQixFQUF3RCxDQUF4RCxFQVoyQjtLQUFmOzs7QUFnQmhCLGdCQUFZLG9CQUFTLEVBQVQsRUFBYTtBQUNyQixhQUFLLElBQUksSUFBSSxDQUFKLEVBQU8sSUFBSSxLQUFLLE9BQUwsQ0FBYSxNQUFiLEVBQXFCLEdBQXpDLEVBQThDO0FBQzFDLGdCQUFJLEtBQUssT0FBTCxDQUFhLENBQWIsRUFBZ0IsTUFBaEIsQ0FBdUIsSUFBdkIsS0FBZ0MsRUFBaEMsRUFBb0M7QUFDcEMsdUJBQU8sS0FBSyxPQUFMLENBQWEsQ0FBYixDQUFQLENBRG9DO2FBQXhDO1NBREo7O0FBTUEsZUFBTyxLQUFQLENBUHFCO0tBQWI7Q0FoWGhCOztBQTJYQSxLQUFLLEtBQUwsQ0FBVyxHQUFYLENBQWUsTUFBZixFQUF1QixlQUF2QixFQUF3QyxJQUF4Qzs7O0FDMVpBOztBQUVBLElBQUksU0FBUyxTQUFULE1BQVMsQ0FBVSxJQUFWLEVBQWdCLEdBQWhCLEVBQXFCO0FBQzlCLFdBQU8sTUFBUCxDQUFjLElBQWQsQ0FBbUIsSUFBbkIsRUFBeUIsSUFBekIsRUFBK0IsQ0FBL0IsRUFBa0MsQ0FBbEMsRUFBcUMsR0FBckMsRUFEOEI7O0FBRzlCLFNBQUssT0FBTCxDQUFhLFdBQWIsQ0FBeUIsU0FBekIsR0FBcUMsS0FBSyxVQUFMLENBQWdCLE9BQWhCLENBSFA7O0FBSzlCLFNBQUssTUFBTCxDQUFZLEdBQVosQ0FBZ0IsR0FBaEIsRUFMOEI7O0FBTzlCLFNBQUssZ0JBQUwsR0FBd0IsSUFBeEIsQ0FQOEI7QUFROUIsU0FBSyxlQUFMLEdBQXVCLElBQXZCLENBUjhCO0FBUzlCLFNBQUssTUFBTCxHQUFjLEtBQWQsQ0FUOEI7O0FBVzlCLFNBQUssUUFBTCxHQUFnQixLQUFoQixDQVg4QjtBQVk5QixTQUFLLFVBQUwsR0FBa0IsQ0FBbEIsQ0FaOEI7Q0FBckI7O0FBZ0JiLE9BQU8sU0FBUCxHQUFtQixPQUFPLE1BQVAsQ0FBYyxPQUFPLE1BQVAsQ0FBYyxTQUFkLENBQWpDO0FBQ0EsT0FBTyxTQUFQLENBQWlCLFdBQWpCLEdBQStCLE1BQS9COztBQUVBLE9BQU8sU0FBUCxDQUFpQixJQUFqQixHQUF3QixVQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLEtBQWhCLEVBQXVCLEtBQXZCLEVBQThCLEVBQTlCLEVBQWtDLEVBQWxDLEVBQXNDO0FBQzFELFNBQUssTUFBTSxDQUFOLENBRHFEO0FBRTFELFNBQUssTUFBTSxDQUFOLENBRnFEO0FBRzFELFNBQUssS0FBTCxDQUFXLENBQVgsRUFBYyxDQUFkOzs7QUFIMEQsUUFNMUQsQ0FBSyxJQUFMLENBQVUsT0FBVixDQUFrQixNQUFsQixDQUF5QixhQUF6QixDQUF1QyxJQUF2QyxFQUE2QyxLQUE3QyxFQU4wRDtBQU8xRCxTQUFLLElBQUwsQ0FBVSxPQUFWLENBQWtCLENBQWxCLEdBQXNCLENBQUMsSUFBRCxDQVBvQztDQUF0Qzs7QUFVeEIsT0FBTyxTQUFQLENBQWlCLE1BQWpCLEdBQTBCLFlBQVk7QUFDbEMsUUFBSSxLQUFLLFFBQUwsRUFDSjtBQUNJLGFBQUssUUFBTCxHQUFnQixLQUFLLEtBQUwsQ0FBVyxLQUFLLElBQUwsQ0FBVSxRQUFWLENBQW1CLENBQW5CLEVBQXNCLEtBQUssSUFBTCxDQUFVLFFBQVYsQ0FBbUIsQ0FBbkIsQ0FBakQsQ0FESjtLQURBOztBQUtBLFFBQUksS0FBSyxVQUFMLEdBQWtCLENBQWxCLEVBQ0o7QUFDSSxhQUFLLEtBQUwsQ0FBVyxDQUFYLElBQWdCLEtBQUssVUFBTCxDQURwQjtBQUVJLGFBQUssS0FBTCxDQUFXLENBQVgsSUFBZ0IsS0FBSyxVQUFMLENBRnBCO0tBREE7Q0FOc0I7O0FBYTFCLE9BQU8sT0FBUCxHQUFpQixNQUFqQjs7O0FDNUNBOztBQUVBLE9BQU8sT0FBUCxHQUFpQixTQUFTLGFBQVQsR0FBeUI7QUFDdEMsT0FBSSxLQUFLLFNBQUwsRUFBSyxHQUFXO0FBQ2pCLGFBQU8sQ0FBQyxDQUFFLElBQUUsS0FBSyxNQUFMLEVBQUYsQ0FBRCxHQUFrQixPQUFsQixHQUEyQixDQUE1QixDQUFELENBQWdDLFFBQWhDLENBQXlDLEVBQXpDLEVBQTZDLFNBQTdDLENBQXVELENBQXZELENBQVAsQ0FEaUI7SUFBWCxDQUQ2Qjs7QUFLdEMsVUFBUSxPQUFLLElBQUwsR0FBVSxHQUFWLEdBQWMsSUFBZCxHQUFtQixHQUFuQixHQUF1QixJQUF2QixHQUE0QixHQUE1QixHQUFnQyxJQUFoQyxHQUFxQyxHQUFyQyxHQUF5QyxJQUF6QyxHQUE4QyxJQUE5QyxHQUFtRCxJQUFuRCxDQUw4QjtDQUF6Qjs7O0FDRmpCOztBQUVBLElBQUksZUFBZTtBQUNmLGtCQUFjO0FBQ1YsV0FBRyxDQUFIO0FBQ0EsV0FBRyxDQUFIO0tBRko7Q0FEQTs7QUFPSixhQUFhLE1BQWIsR0FBc0IsWUFBWTtBQUM5QixRQUFJLEtBQUssTUFBTCxDQUFZLENBQVosS0FBa0IsS0FBSyxZQUFMLENBQWtCLENBQWxCLElBQXVCLEtBQUssTUFBTCxDQUFZLENBQVosS0FBa0IsS0FBSyxZQUFMLENBQWtCLENBQWxCLEVBQXFCO0FBQ2hGLGFBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsTUFBakIsRUFEZ0Y7S0FBcEYsTUFFTztBQUNILGFBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsTUFBakIsRUFERztLQUZQOztBQU1BLFNBQUssWUFBTCxDQUFrQixDQUFsQixHQUFzQixLQUFLLE1BQUwsQ0FBWSxDQUFaLENBUFE7QUFROUIsU0FBSyxZQUFMLENBQWtCLENBQWxCLEdBQXNCLEtBQUssTUFBTCxDQUFZLENBQVosQ0FSUTtDQUFaOztBQVd0QixPQUFPLE9BQVAsR0FBaUI7QUFDYixZQUFRLGdCQUFTLEtBQVQsRUFBZ0IsSUFBaEIsRUFBc0IsTUFBdEIsRUFBOEIsTUFBOUIsRUFBc0MsTUFBdEMsRUFBOEM7QUFDbEQsWUFBSSxrQkFBa0I7QUFDbEIsZUFBRyxNQUFIO0FBQ0EsZUFBRyxNQUFIO0FBQ0Esa0JBQU0sSUFBTjtBQUNBLG9CQUFRLEdBQVI7QUFDQSxvQkFBUSxNQUFSO0FBQ0EsbUJBQU8sSUFBUDtBQUNBLDBCQUFjO0FBQ1YsbUJBQUcsTUFBSDtBQUNBLG1CQUFHLE1BQUg7YUFGSjtTQVBBLENBRDhDOztBQWNsRCwwQkFBa0IsT0FBTyxNQUFQLENBQWMsWUFBZCxFQUE0QixlQUE1QixDQUFsQjs7O0FBZGtELHVCQWlCbEQsQ0FBZ0IsTUFBaEIsR0FBeUIsS0FBSyxHQUFMLENBQVMsTUFBVCxDQUFnQixNQUFoQixFQUF3QixNQUF4QixFQUFnQyxPQUFoQyxDQUF6Qjs7O0FBakJrRCx1QkFvQmxELENBQWdCLE1BQWhCLENBQXVCLFVBQXZCLENBQWtDLEdBQWxDLENBQXNDLE1BQXRDLEVBQThDLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixDQUE5QyxFQUE0RCxFQUE1RCxFQUFnRSxJQUFoRSxFQXBCa0Q7QUFxQmxELHdCQUFnQixNQUFoQixDQUF1QixVQUF2QixDQUFrQyxHQUFsQyxDQUFzQyxPQUF0QyxFQUErQyxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsQ0FBL0MsRUFBNkQsRUFBN0QsRUFBaUUsSUFBakUsRUFyQmtEOztBQXVCbEQsd0JBQWdCLE1BQWhCLENBQXVCLElBQXZCLEdBQThCLE1BQU0sUUFBTixFQUE5QixDQXZCa0Q7O0FBeUJsRCxlQUFPLGVBQVAsQ0F6QmtEO0tBQTlDO0NBRFo7Ozs7O0FDcEJBLE9BQU8sT0FBUCxHQUFpQjtBQUNiLGVBQVc7QUFDUCxnQkFBUSxTQUFSO0FBQ0Esa0JBQVUsR0FBVjtBQUNBLHdCQUFnQixFQUFoQjtBQUNBLGdCQUFRLEVBQVI7QUFDQSxzQkFBYyxFQUFkO0FBQ0EsaUJBQVMsR0FBVDtBQUNBLHVCQUFlLENBQWY7QUFDQSx1QkFBZSxDQUFmO0FBQ0EsZ0JBQVEsQ0FBUjtBQUNBLHVCQUFlLENBQWY7S0FWSjtBQVlBLG9CQUFnQjtBQUNaLGdCQUFRLGVBQVI7QUFDQSxrQkFBVSxHQUFWO0FBQ0Esd0JBQWdCLEVBQWhCO0FBQ0EsZ0JBQVEsQ0FBUjtBQUNBLHNCQUFjLEVBQWQ7QUFDQSxpQkFBUyxHQUFUO0FBQ0EsdUJBQWUsQ0FBZjtBQUNBLHVCQUFlLENBQWY7QUFDQSxnQkFBUSxDQUFSO0FBQ0EsdUJBQWUsQ0FBZjtLQVZKO0FBWUEsYUFBUztBQUNMLGdCQUFRLFFBQVI7QUFDQSxrQkFBVSxHQUFWO0FBQ0Esd0JBQWdCLENBQWhCO0FBQ0EsZ0JBQVEsRUFBUjtBQUNBLHNCQUFjLEdBQWQ7QUFDQSxpQkFBUyxHQUFUO0FBQ0EsdUJBQWUsQ0FBZjtBQUNBLHVCQUFlLENBQWY7QUFDQSxnQkFBUSxDQUFSO0FBQ0EsdUJBQWUsQ0FBZjtLQVZKO0FBWUEsWUFBUTtBQUNKLGdCQUFRLE9BQVI7QUFDQSxrQkFBVSxLQUFWO0FBQ0Esd0JBQWdCLElBQWhCO0FBQ0EsZ0JBQVEsSUFBUjtBQUNBLHNCQUFjLEtBQWQ7QUFDQSxpQkFBUyxLQUFUO0FBQ0EsdUJBQWUsR0FBZjtBQUNBLHVCQUFlLEdBQWY7QUFDQSxnQkFBUSxHQUFSO0FBQ0EsdUJBQWUsR0FBZjtLQVZKO0FBWUEsZ0JBQVk7QUFDUixnQkFBUSxLQUFSO0FBQ0Esa0JBQVUsSUFBVjtBQUNBLHdCQUFnQixHQUFoQjtBQUNBLGdCQUFRLElBQVI7QUFDQSxzQkFBYyxLQUFkO0FBQ0EsaUJBQVMsS0FBVDtBQUNBLHVCQUFlLEdBQWY7QUFDQSx1QkFBZSxHQUFmO0FBQ0EsZ0JBQVEsR0FBUjtBQUNBLHVCQUFlLEdBQWY7S0FWSjtBQVlBLGNBQVU7QUFDTixnQkFBUSxTQUFSO0FBQ0Esa0JBQVUsS0FBVjtBQUNBLHdCQUFnQixJQUFoQjtBQUNBLGdCQUFRLEdBQVI7QUFDQSxzQkFBYyxLQUFkO0FBQ0EsaUJBQVMsS0FBVDtBQUNBLHVCQUFlLEdBQWY7QUFDQSx1QkFBZSxHQUFmO0FBQ0EsZ0JBQVEsSUFBUjtBQUNBLHVCQUFlLEdBQWY7S0FWSjtBQVlBLGVBQVc7QUFDUCxnQkFBUSxVQUFSO0FBQ0Esa0JBQVUsS0FBVjtBQUNBLHdCQUFnQixJQUFoQjtBQUNBLGdCQUFRLEdBQVI7QUFDQSxzQkFBYyxJQUFkO0FBQ0EsaUJBQVMsS0FBVDtBQUNBLHVCQUFlLEdBQWY7QUFDQSx1QkFBZSxHQUFmO0FBQ0EsZ0JBQVEsSUFBUjtBQUNBLHVCQUFlLEdBQWY7S0FWSjtBQVlBLFdBQU87QUFDSCxrQkFBVSxNQUFWO0FBQ0Esd0JBQWdCLENBQWhCO0FBQ0EsZ0JBQVEsQ0FBUjtBQUNBLHNCQUFjLEdBQWQ7QUFDQSxpQkFBUyxHQUFUO0FBQ0EsdUJBQWUsQ0FBZjtBQUNBLHVCQUFlLENBQWY7QUFDQSxnQkFBUSxFQUFSO0FBQ0EsdUJBQWUsQ0FBZjtLQVRKO0FBV0Esb0JBQWdCO0FBQ1osa0JBQVUsR0FBVjtBQUNBLHdCQUFnQixHQUFoQjtBQUNBLGdCQUFRLEVBQVI7QUFDQSxzQkFBYyxHQUFkO0FBQ0EsaUJBQVMsS0FBVDtBQUNBLHVCQUFlLEdBQWY7QUFDQSx1QkFBZSxHQUFmO0FBQ0EsZ0JBQVEsSUFBUjtBQUNBLHVCQUFlLEdBQWY7S0FUSjtBQVdBLGlCQUFhO0FBQ1Qsa0JBQVUsS0FBVjtBQUNBLHdCQUFnQixHQUFoQjtBQUNBLGdCQUFRLElBQVI7QUFDQSxzQkFBYyxLQUFkO0FBQ0EsaUJBQVMsS0FBVDtBQUNBLHVCQUFlLEdBQWY7QUFDQSx1QkFBZSxHQUFmO0FBQ0EsZ0JBQVEsR0FBUjtBQUNBLHVCQUFlLEdBQWY7S0FUSjtBQVdBLHFCQUFpQjtBQUNiLGtCQUFVLElBQVY7QUFDQSx3QkFBZ0IsR0FBaEI7QUFDQSxnQkFBUSxLQUFSO0FBQ0Esc0JBQWMsS0FBZDtBQUNBLGlCQUFTLEtBQVQ7QUFDQSx1QkFBZSxHQUFmO0FBQ0EsdUJBQWUsSUFBZjtBQUNBLGdCQUFRLEdBQVI7QUFDQSx1QkFBZSxHQUFmO0tBVEo7QUFXQSxjQUFVO0FBQ04sa0JBQVUsTUFBVjtBQUNBLHdCQUFnQixHQUFoQjtBQUNBLGdCQUFRLEtBQVI7QUFDQSxzQkFBYyxHQUFkO0FBQ0EsaUJBQVMsS0FBVDtBQUNBLHVCQUFlLEdBQWY7QUFDQSx1QkFBZSxHQUFmO0FBQ0EsZ0JBQVEsR0FBUjtBQUNBLHVCQUFlLEdBQWY7S0FUSjtBQVdBLGlCQUFhO0FBQ1Qsa0JBQVUsTUFBVjtBQUNBLHdCQUFnQixJQUFoQjtBQUNBLGdCQUFRLEdBQVI7QUFDQSxzQkFBYyxJQUFkO0FBQ0EsaUJBQVMsS0FBVDtBQUNBLHVCQUFlLEdBQWY7QUFDQSx1QkFBZSxHQUFmO0FBQ0EsZ0JBQVEsR0FBUjtBQUNBLHVCQUFlLEdBQWY7S0FUSjtBQVdBLHFCQUFpQjtBQUNiLGtCQUFVLEtBQVY7QUFDQSx3QkFBZ0IsSUFBaEI7QUFDQSxnQkFBUSxHQUFSO0FBQ0Esc0JBQWMsSUFBZDtBQUNBLGlCQUFTLEtBQVQ7QUFDQSx1QkFBZSxHQUFmO0FBQ0EsdUJBQWUsR0FBZjtBQUNBLGdCQUFRLEdBQVI7QUFDQSx1QkFBZSxHQUFmO0tBVEo7QUFXQSxvQkFBZ0I7QUFDWixrQkFBVSxRQUFWO0FBQ0Esd0JBQWdCLEdBQWhCO0FBQ0EsZ0JBQVEsR0FBUjtBQUNBLHNCQUFjLEdBQWQ7QUFDQSxpQkFBUyxJQUFUO0FBQ0EsdUJBQWUsSUFBZjtBQUNBLHVCQUFlLEdBQWY7QUFDQSxnQkFBUSxHQUFSO0FBQ0EsdUJBQWUsR0FBZjtLQVRKO0FBV0EsZ0JBQVk7QUFDUixrQkFBVSxNQUFWO0FBQ0Esd0JBQWdCLEdBQWhCO0FBQ0EsZ0JBQVEsSUFBUjtBQUNBLHNCQUFjLElBQWQ7QUFDQSxpQkFBUyxJQUFUO0FBQ0EsdUJBQWUsSUFBZjtBQUNBLHVCQUFlLEdBQWY7QUFDQSxnQkFBUSxHQUFSO0FBQ0EsdUJBQWUsR0FBZjtLQVRKO0FBV0EsZUFBVztBQUNQLGtCQUFVLFFBQVY7QUFDQSx3QkFBZ0IsSUFBaEI7QUFDQSxnQkFBUSxHQUFSO0FBQ0Esc0JBQWMsS0FBZDtBQUNBLGlCQUFTLEtBQVQ7QUFDQSx1QkFBZSxJQUFmO0FBQ0EsdUJBQWUsR0FBZjtBQUNBLGdCQUFRLElBQVI7QUFDQSx1QkFBZSxHQUFmO0tBVEo7QUFXQSxhQUFTO0FBQ0wsa0JBQVUsT0FBVjtBQUNBLHdCQUFnQixHQUFoQjtBQUNBLGdCQUFRLEdBQVI7QUFDQSxzQkFBYyxHQUFkO0FBQ0EsaUJBQVMsSUFBVDtBQUNBLHVCQUFlLEdBQWY7QUFDQSx1QkFBZSxHQUFmO0FBQ0EsZ0JBQVEsR0FBUjtBQUNBLHVCQUFlLEdBQWY7S0FUSjtBQVdBLGVBQVc7QUFDUCxrQkFBVSxRQUFWO0FBQ0Esd0JBQWdCLElBQWhCO0FBQ0EsZ0JBQVEsR0FBUjtBQUNBLHNCQUFjLElBQWQ7QUFDQSxpQkFBUyxJQUFUO0FBQ0EsdUJBQWUsR0FBZjtBQUNBLHVCQUFlLEdBQWY7QUFDQSxnQkFBUSxHQUFSO0FBQ0EsdUJBQWUsR0FBZjtLQVRKO0FBV0Esc0JBQWtCO0FBQ2Qsa0JBQVUsSUFBVjtBQUNBLHdCQUFnQixHQUFoQjtBQUNBLGdCQUFRLEtBQVI7QUFDQSxzQkFBYyxLQUFkO0FBQ0EsaUJBQVMsS0FBVDtBQUNBLHVCQUFlLEdBQWY7QUFDQSx1QkFBZSxHQUFmO0FBQ0EsZ0JBQVEsR0FBUjtBQUNBLHVCQUFlLEdBQWY7S0FUSjtDQXpOSjs7O0FDQUE7O0FBRUEsSUFBSSxTQUFTLFFBQVEsV0FBUixDQUFUOztBQUVKLElBQUksT0FBTyxTQUFQLElBQU8sQ0FBVSxJQUFWLEVBQWdCO0FBQ3ZCLFdBQU8sS0FBUCxDQUFhLElBQWIsQ0FBa0IsSUFBbEIsRUFBd0IsSUFBeEIsRUFBOEIsS0FBSyxLQUFMLEVBQVksT0FBMUMsRUFBbUQsS0FBbkQsRUFBMEQsSUFBMUQsRUFBZ0UsT0FBTyxPQUFQLENBQWUsTUFBZixDQUFoRSxDQUR1Qjs7QUFHdkIsU0FBSyxNQUFMLEdBQWMsRUFBZCxDQUh1QjtBQUl2QixTQUFLLFFBQUwsR0FBZ0IsQ0FBaEIsQ0FKdUI7QUFLdkIsU0FBSyxXQUFMLEdBQW1CLElBQW5COztBQUx1QixRQU92QixDQUFLLFFBQUwsR0FBZ0IsVUFBaEIsQ0FQdUI7O0FBU3ZCLFNBQUssSUFBSSxJQUFJLENBQUosRUFBTyxJQUFJLEVBQUosRUFBUSxHQUF4QixFQUNBO0FBQ0ksWUFBSSxTQUFTLElBQUksTUFBSixDQUFXLEtBQUssSUFBTCxFQUFXLFFBQXRCLENBQVQsQ0FEUjtBQUVJLGVBQU8sTUFBUCxHQUFnQixDQUFoQixDQUZKO0FBR0ksZUFBTyxLQUFQLEdBQWUsRUFBZixDQUhKO0FBSUksZUFBTyxNQUFQLEdBQWdCLEVBQWhCLENBSko7QUFLSSxhQUFLLEdBQUwsQ0FBUyxNQUFULEVBQWlCLElBQWpCLEVBTEo7S0FEQTs7QUFTQSxXQUFPLElBQVAsQ0FsQnVCO0NBQWhCOztBQXFCWCxLQUFLLFNBQUwsR0FBaUIsT0FBTyxNQUFQLENBQWMsT0FBTyxLQUFQLENBQWEsU0FBYixDQUEvQjtBQUNBLEtBQUssU0FBTCxDQUFlLFdBQWYsR0FBNkIsSUFBN0I7O0FBRUEsS0FBSyxTQUFMLENBQWUsSUFBZixHQUFzQixVQUFVLE1BQVYsRUFBa0I7O0FBRXBDLFFBQUksS0FBSyxJQUFMLENBQVUsSUFBVixDQUFlLElBQWYsR0FBc0IsS0FBSyxRQUFMLEVBQ3RCLE9BREo7O0FBR0EsUUFBSSxJQUFJLE9BQU8sQ0FBUCxHQUFXLEVBQVgsQ0FMNEI7QUFNcEMsUUFBSSxJQUFJLE9BQU8sQ0FBUCxHQUFXLEVBQVgsQ0FONEI7O0FBUXBDLFNBQUssY0FBTCxDQUFvQixLQUFwQixFQUEyQixJQUEzQixDQUFnQyxDQUFoQyxFQUFtQyxDQUFuQyxFQUFzQyxDQUF0QyxFQUF5QyxLQUFLLFdBQUwsRUFBa0IsQ0FBM0QsRUFBOEQsQ0FBOUQsRUFSb0M7QUFTcEMsU0FBSyxNQUFMLENBQVksVUFBWixFQUF3QixJQUF4QixFQVRvQzs7QUFXcEMsU0FBSyxRQUFMLEdBQWdCLEtBQUssSUFBTCxDQUFVLElBQVYsQ0FBZSxJQUFmLEdBQXNCLEtBQUssUUFBTCxDQVhGO0NBQWxCOztBQWN0QixPQUFPLE9BQVAsR0FBaUIsSUFBakI7OztBQzFDQTs7QUFFQSxJQUFJLFNBQVMsUUFBUSxXQUFSLENBQVQ7O0FBRUosSUFBSSxjQUFjLFNBQWQsV0FBYyxDQUFVLElBQVYsRUFBZ0I7QUFDOUIsV0FBTyxLQUFQLENBQWEsSUFBYixDQUFrQixJQUFsQixFQUF3QixJQUF4QixFQUE4QixLQUFLLEtBQUwsRUFBWSxPQUExQyxFQUFtRCxLQUFuRCxFQUEwRCxJQUExRCxFQUFnRSxPQUFPLE9BQVAsQ0FBZSxNQUFmLENBQWhFLENBRDhCOztBQUc5QixTQUFLLElBQUwsR0FBWSxjQUFaLENBSDhCO0FBSTlCLFNBQUssTUFBTCxHQUFjLEVBQWQsQ0FKOEI7QUFLOUIsU0FBSyxRQUFMLEdBQWdCLENBQWhCLENBTDhCO0FBTTlCLFNBQUssV0FBTCxHQUFtQixJQUFuQjs7O0FBTjhCLFFBUzlCLENBQUssUUFBTCxHQUFnQixJQUFoQixDQVQ4Qjs7QUFXOUIsU0FBSyxJQUFJLElBQUksQ0FBSixFQUFPLElBQUksRUFBSixFQUFRLEdBQXhCLEVBQ0E7QUFDSSxZQUFJLFNBQVMsSUFBSSxNQUFKLENBQVcsS0FBSyxJQUFMLEVBQVcsUUFBdEIsQ0FBVCxDQURSO0FBRUksZUFBTyxNQUFQLEdBQWdCLENBQWhCLENBRko7QUFHSSxlQUFPLEtBQVAsR0FBZSxFQUFmLENBSEo7QUFJSSxlQUFPLE1BQVAsR0FBZ0IsRUFBaEIsQ0FKSjs7QUFNSSxhQUFLLEdBQUwsQ0FBUyxNQUFULEVBQWlCLElBQWpCLEVBTko7S0FEQTs7QUFVQSxXQUFPLElBQVAsQ0FyQjhCO0NBQWhCOztBQXdCbEIsWUFBWSxTQUFaLEdBQXdCLE9BQU8sTUFBUCxDQUFjLE9BQU8sS0FBUCxDQUFhLFNBQWIsQ0FBdEM7QUFDQSxZQUFZLFNBQVosQ0FBc0IsV0FBdEIsR0FBb0MsV0FBcEM7O0FBRUEsWUFBWSxTQUFaLENBQXNCLElBQXRCLEdBQTZCLFVBQVUsTUFBVixFQUFrQjtBQUMzQyxRQUFJLEtBQUssSUFBTCxDQUFVLElBQVYsQ0FBZSxJQUFmLEdBQXNCLEtBQUssUUFBTCxFQUN0QixPQURKOztBQUdBLFFBQUksSUFBSSxPQUFPLENBQVAsR0FBVyxFQUFYLENBSm1DO0FBSzNDLFFBQUksSUFBSSxPQUFPLENBQVAsR0FBVyxFQUFYLENBTG1DOztBQU8zQyxTQUFLLGNBQUwsQ0FBb0IsS0FBcEIsRUFBMkIsSUFBM0IsQ0FBZ0MsQ0FBaEMsRUFBbUMsQ0FBbkMsRUFBc0MsQ0FBdEMsRUFBeUMsS0FBSyxXQUFMLEVBQWtCLENBQTNELEVBQThELENBQTlELEVBUDJDO0FBUTNDLFNBQUssTUFBTCxDQUFZLFVBQVosRUFBd0IsSUFBeEIsRUFSMkM7O0FBVTNDLFNBQUssUUFBTCxHQUFnQixLQUFLLElBQUwsQ0FBVSxJQUFWLENBQWUsSUFBZixHQUFzQixLQUFLLFFBQUwsQ0FWSztDQUFsQjs7QUFhN0IsT0FBTyxPQUFQLEdBQWlCLFdBQWpCOzs7QUM1Q0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXdCQSxPQUFPLE9BQVAsR0FBaUI7QUFDYixVQUFRLFFBQVEsUUFBUixDQUFSO0FBQ0EsaUJBQWUsUUFBUSxlQUFSLENBQWY7Q0FGSjs7O0FDeEJBOztBQUVBLElBQUksVUFBVSxFQUFWOztBQUVKLFFBQVEsTUFBUixHQUFpQixVQUFTLEtBQVQsRUFBZ0I7QUFDN0IsU0FBSyxLQUFMLEdBQWEsS0FBYixDQUQ2Qjs7QUFHN0IsU0FBSyxlQUFMLEdBSDZCO0FBSTdCLFNBQUssZUFBTCxHQUo2QjtBQUs3QixTQUFLLFlBQUwsR0FMNkI7O0FBTzdCLFNBQUssS0FBTCxDQUFXLFNBQVgsQ0FBcUIsTUFBckIsQ0FBNEIsZ0JBQTVCLEVBQThDLElBQTlDLEVBUDZCO0FBUTdCLFNBQUssS0FBTCxDQUFXLFNBQVgsQ0FBcUIsTUFBckIsQ0FBNEIsbUJBQTVCLEVBQWlELEtBQWpELEVBUjZCO0NBQWhCOztBQVdqQixRQUFRLFlBQVIsR0FBdUIsWUFBVzs7O0FBQzlCLFFBQUksU0FBUzs7OztBQUlULE1BQUUsSUFBSSxDQUFKLEVBQU8sR0FBRyxDQUFILEVBQU0sR0FBRyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEtBQWhCLENBQXNCLE1BQXRCLEdBQStCLEdBQS9CLEVBQW9DLE9BQU8sR0FBUCxFQUFZLFFBQVEsRUFBUixFQUp6RDtBQUtULE1BQUUsSUFBSSxDQUFKLEVBQU8sR0FBRyxDQUFILEVBQU0sR0FBRyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEtBQWhCLENBQXNCLE1BQXRCLEdBQStCLEdBQS9CLEVBQW9DLE9BQU8sR0FBUCxFQUFZLFFBQVEsRUFBUixFQUx6RDs7QUFPVCxNQUFFLElBQUksQ0FBSixFQUFPLEdBQUcsSUFBSCxFQUFTLEdBQUcsS0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixLQUFoQixDQUFzQixNQUF0QixHQUErQixHQUEvQixFQUFvQyxPQUFPLEdBQVAsRUFBWSxRQUFRLEVBQVIsRUFQNUQ7QUFRVCxNQUFFLElBQUksQ0FBSixFQUFPLEdBQUcsSUFBSCxFQUFTLEdBQUcsS0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixLQUFoQixDQUFzQixNQUF0QixHQUErQixHQUEvQixFQUFvQyxPQUFPLEdBQVAsRUFBWSxRQUFRLEVBQVIsRUFSNUQ7OztBQVdULE1BQUUsSUFBSSxDQUFKLEVBQU8sR0FBRyxDQUFILEVBQU0sR0FBRyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEtBQWhCLENBQXNCLE1BQXRCLEdBQStCLEdBQS9CLEVBQW9DLE9BQU8sR0FBUCxFQUFZLFFBQVEsR0FBUixFQVh6RDtBQVlULE1BQUUsSUFBSSxDQUFKLEVBQU8sR0FBRyxHQUFILEVBQVEsR0FBRyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEtBQWhCLENBQXNCLE1BQXRCLEdBQStCLEdBQS9CLEVBQW9DLE9BQU8sR0FBUCxFQUFZLFFBQVEsR0FBUixFQVozRDtBQWFULE1BQUUsSUFBSSxDQUFKLEVBQU8sR0FBRyxJQUFILEVBQVMsR0FBRyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEtBQWhCLENBQXNCLE1BQXRCLEdBQStCLEdBQS9CLEVBQW9DLE9BQU8sSUFBUCxFQUFhLFFBQVEsR0FBUixFQWI3RDtBQWNULE1BQUUsSUFBSSxDQUFKLEVBQU8sR0FBRyxJQUFILEVBQVMsR0FBRyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEtBQWhCLENBQXNCLE1BQXRCLEdBQStCLEdBQS9CLEVBQW9DLE9BQU8sR0FBUCxFQUFZLFFBQVEsR0FBUixFQWQ1RDtBQWVULE1BQUUsSUFBSSxDQUFKLEVBQU8sR0FBRyxJQUFILEVBQVMsR0FBRyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEtBQWhCLENBQXNCLE1BQXRCLEdBQStCLEdBQS9CLEVBQW9DLE9BQU8sR0FBUCxFQUFZLFFBQVEsR0FBUixFQWY1RDs7O0FBa0JULE1BQUUsSUFBSSxFQUFKLEVBQVEsR0FBRyxHQUFILEVBQVEsR0FBRyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEtBQWhCLENBQXNCLE1BQXRCLEdBQStCLEdBQS9CLEVBQW9DLE9BQU8sR0FBUCxFQUFZLFFBQVEsRUFBUixFQWxCNUQsRUFtQlQsRUFBRSxJQUFJLEVBQUosRUFBUSxHQUFHLElBQUgsRUFBUyxHQUFHLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsS0FBaEIsQ0FBc0IsTUFBdEIsR0FBK0IsR0FBL0IsRUFBb0MsT0FBTyxHQUFQLEVBQVksUUFBUSxFQUFSLEVBbkI3RCxFQW9CVCxFQUFFLElBQUksRUFBSixFQUFRLEdBQUcsR0FBSCxFQUFRLEdBQUcsS0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixLQUFoQixDQUFzQixNQUF0QixHQUErQixHQUEvQixFQUFvQyxPQUFPLEdBQVAsRUFBWSxRQUFRLEVBQVIsRUFwQjVELEVBcUJULEVBQUUsSUFBSSxFQUFKLEVBQVEsR0FBRyxJQUFILEVBQVMsR0FBRyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEtBQWhCLENBQXNCLE1BQXRCLEdBQStCLEdBQS9CLEVBQW9DLE9BQU8sR0FBUCxFQUFZLFFBQVEsR0FBUixFQXJCN0QsRUFzQlQsRUFBRSxJQUFJLEVBQUosRUFBUSxHQUFHLElBQUgsRUFBUyxHQUFHLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsS0FBaEIsQ0FBc0IsTUFBdEIsR0FBK0IsR0FBL0IsRUFBb0MsT0FBTyxHQUFQLEVBQVksUUFBUSxFQUFSLEVBdEI3RCxFQXVCVCxFQUFFLElBQUksRUFBSixFQUFRLEdBQUcsSUFBSCxFQUFTLEdBQUcsS0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixLQUFoQixDQUFzQixNQUF0QixHQUErQixHQUEvQixFQUFvQyxPQUFPLEdBQVAsRUFBWSxRQUFRLEVBQVIsRUF2QjdELEVBd0JULEVBQUUsSUFBSSxFQUFKLEVBQVEsR0FBRyxJQUFILEVBQVMsR0FBRyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEtBQWhCLENBQXNCLE1BQXRCLEdBQStCLEdBQS9CLEVBQW9DLE9BQU8sR0FBUCxFQUFZLFFBQVEsRUFBUixFQXhCN0QsQ0FBVCxDQUQwQjs7QUE2QjlCLFdBQU8sT0FBUCxDQUFlLFVBQUMsS0FBRCxFQUFXOztBQUV0QixZQUFJLFdBQVcsTUFBSyxLQUFMLENBQVcsU0FBWCxDQUFxQixNQUFyQixDQUE0QixNQUFNLENBQU4sRUFBUyxNQUFNLENBQU4sQ0FBaEQsQ0FGa0I7QUFHdEIsaUJBQVMsTUFBVCxHQUFrQixNQUFNLE1BQU4sQ0FISTtBQUl0QixpQkFBUyxLQUFULEdBQWlCLE1BQU0sS0FBTjs7Ozs7OztBQUpLLEtBQVgsQ0FBZixDQTdCOEI7Q0FBWDs7QUEyQ3ZCLFFBQVEsZUFBUixHQUEwQixZQUFXO0FBQ2pDLFNBQUssS0FBTCxDQUFXLEdBQVgsQ0FBZSxVQUFmLENBQTBCLENBQTFCLEVBQTZCLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsS0FBaEIsQ0FBc0IsTUFBdEIsR0FBK0IsSUFBL0IsRUFBcUMsS0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixLQUFoQixDQUFzQixLQUF0QixFQUE2QixJQUEvRixFQUFxRyxXQUFyRyxFQURpQztDQUFYOztBQUkxQixRQUFRLGVBQVIsR0FBMEIsWUFBVztBQUNqQyxTQUFLLEtBQUwsQ0FBVyxTQUFYLEdBQXVCLEtBQUssS0FBTCxDQUFXLEdBQVgsQ0FBZSxLQUFmLEVBQXZCLENBRGlDO0FBRWpDLFNBQUssS0FBTCxDQUFXLFNBQVgsQ0FBcUIsVUFBckIsR0FBa0MsSUFBbEMsQ0FGaUM7Q0FBWDs7QUFLMUIsT0FBTyxPQUFQLEdBQWlCLE9BQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0J1xuXG52YXIgTWFwQ3RmMSA9IHJlcXVpcmUoJy4vbWFwcy9NYXBDdGYxJylcbnZhciBSZW1vdGVQbGF5ZXIgPSByZXF1aXJlKCcuL2xpYi9SZW1vdGVQbGF5ZXInKVxubGV0IFdlYXBvblNldHRpbmdzID0gcmVxdWlyZSgnLi9saWIvV2VhcG9uU2V0dGluZ3MnKVxudmFyIEd1aWQgPSByZXF1aXJlKCcuL2xpYi9HdWlkJylcbmxldCBXZWFwb25zID0gcmVxdWlyZSgnLi9saWIvV2VhcG9ucycpXG5sZXQgQnVsbGV0ID0gcmVxdWlyZSgnLi9saWIvQnVsbGV0JylcblxudmFyIGdhbWVXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXG52YXIgZ2FtZUhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodFxudmFyIHdvcmxkV2lkdGggPSA0MDAwXG52YXIgd29ybGRIZWlnaHQgPSAxNTAwXG5cbnZhciBnYW1lID0gbmV3IFBoYXNlci5HYW1lKGdhbWVXaWR0aCwgZ2FtZUhlaWdodCwgUGhhc2VyLkNBTlZBUywgJ3Jhbmdlci1zdGV2ZS1nYW1lJyk7XG5cbnZhciBSYW5nZXJTdGV2ZUdhbWUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmNsaWVudElkID0gR3VpZCgpXG4gICAgdGhpcy5jdXJyZW50V2VhcG9uID0gMDtcbiAgICB0aGlzLmVuZW1pZXMgPSBbXVxuICAgIHRoaXMuZ2FtZSA9IGdhbWVcbiAgICB0aGlzLmdyb3VuZFxuICAgIHRoaXMucGxhdGZvcm1zXG4gICAgdGhpcy5wbGF5ZXJcbiAgICB0aGlzLnNjb3JlID0gMFxuICAgIHRoaXMuc2NvcmVUZXh0XG4gICAgdGhpcy5zb2NrZXRcbiAgICB0aGlzLndlYXBvbk5hbWUgPSBudWxsO1xuICAgIHRoaXMud2VhcG9ucyA9IFtdO1xufVxuXG5SYW5nZXJTdGV2ZUdhbWUucHJvdG90eXBlID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmdhbWUucmVuZGVyZXIucmVuZGVyU2Vzc2lvbi5yb3VuZFBpeGVscyA9IHRydWVcbiAgICAgICAgdGhpcy5nYW1lLnN0YWdlLmRpc2FibGVWaXNpYmlsaXR5Q2hhbmdlID0gdHJ1ZVxuICAgICAgICB0aGlzLnBoeXNpY3Muc3RhcnRTeXN0ZW0oUGhhc2VyLlBoeXNpY3MuQVJDQURFKVxuICAgIH0sXG5cbiAgICBwcmVsb2FkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5sb2FkLmltYWdlKCdidWxsZXQxMScsICcvaW1hZ2VzL2J1bGxldDExLnBuZycpXG4gICAgICAgIHRoaXMubG9hZC5pbWFnZSgnYnVsbGV0MTAnLCAnL2ltYWdlcy9idWxsZXQxMC5wbmcnKVxuICAgICAgICB0aGlzLmxvYWQuaW1hZ2UoJ2J1bGxldDknLCAnL2ltYWdlcy9idWxsZXQ5LnBuZycpXG4gICAgICAgIHRoaXMubG9hZC5pbWFnZSgnYnVsbGV0OCcsICcvaW1hZ2VzL2J1bGxldDgucG5nJylcbiAgICAgICAgdGhpcy5sb2FkLmltYWdlKCdidWxsZXQ3JywgJy9pbWFnZXMvYnVsbGV0Ny5wbmcnKVxuICAgICAgICB0aGlzLmxvYWQuaW1hZ2UoJ2J1bGxldDUnLCAnL2ltYWdlcy9idWxsZXQ1LnBuZycpXG4gICAgICAgIHRoaXMubG9hZC5pbWFnZSgnYnVsbGV0NCcsICcvaW1hZ2VzL2J1bGxldDQucG5nJylcbiAgICAgICAgdGhpcy5sb2FkLmltYWdlKCd0cmVlc2NhcGUnLCAnL2ltYWdlcy9tYXAtY3RmMS5wbmcnKVxuICAgICAgICB0aGlzLmxvYWQuaW1hZ2UoJ2dyb3VuZCcsICcvaW1hZ2VzL3BsYXRmb3JtLnBuZycpXG4gICAgICAgIHRoaXMubG9hZC5zcHJpdGVzaGVldCgnZHVkZScsICcvaW1hZ2VzL2R1ZGUucG5nJywgMzIsIDQ4KVxuICAgICAgICB0aGlzLmxvYWQuc3ByaXRlc2hlZXQoJ2VuZW15JywgJy9pbWFnZXMvZHVkZS5wbmcnLCAzMiwgNDgpXG4gICAgfSxcblxuICAgIGNyZWF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc29ja2V0ID0gaW8uY29ubmVjdCgpXG4gICAgICAgIHRoaXMuZW5lbWllcyA9IFtdXG5cbiAgICAgICAgLy8gIFdlJ3JlIGdvaW5nIHRvIGJlIHVzaW5nIHBoeXNpY3MsIHNvIGVuYWJsZSB0aGUgQXJjYWRlIFBoeXNpY3Mgc3lzdGVtXG4gICAgICAgIHRoaXMucGh5c2ljcy5zdGFydFN5c3RlbShQaGFzZXIuUGh5c2ljcy5BUkNBREUpXG5cbiAgICAgICAgdGhpcy53b3JsZC5zZXRCb3VuZHMoMCwgMCwgd29ybGRXaWR0aCwgd29ybGRIZWlnaHQpXG4gICAgICAgIHRoaXMuZ2FtZS5zdGFnZS5iYWNrZ3JvdW5kQ29sb3IgPSBcIiMyRjkxRDBcIlxuXG4gICAgICAgIC8vIFNjYWxlIGdhbWUgb24gd2luZG93IHJlc2l6ZVxuICAgICAgICB0aGlzLmdhbWUuc2NhbGUuc2NhbGVNb2RlID0gUGhhc2VyLlNjYWxlTWFuYWdlci5SRVNJWkU7XG4gICAgICAgIHRoaXMuZ2FtZS5zY2FsZS5zZXRTaG93QWxsKCk7XG4gICAgICAgIHRoaXMuZ2FtZS5zY2FsZS5yZWZyZXNoKClcblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBNYXBcbiAgICAgICAgICovXG4gICAgICAgIE1hcEN0ZjEuY3JlYXRlKHRoaXMpXG5cbiAgICAgICAgLy8gRGVmaW5lIG1vdmVtZW50IGNvbnN0YW50c1xuICAgICAgICB0aGlzLk1BWF9TUEVFRCA9IDQwMDsgLy8gcGl4ZWxzL3NlY29uZFxuICAgICAgICB0aGlzLkFDQ0VMRVJBVElPTiA9IDE5NjA7IC8vIHBpeGVscy9zZWNvbmQvc2Vjb25kXG4gICAgICAgIHRoaXMuRFJBRyA9IDE1MDA7IC8vIHBpeGVscy9zZWNvbmRcbiAgICAgICAgdGhpcy5HUkFWSVRZID0gMTkwMDsgLy8gcGl4ZWxzL3NlY29uZC9zZWNvbmRcbiAgICAgICAgdGhpcy5KVU1QX1NQRUVEID0gLTg1MDsgLy8gcGl4ZWxzL3NlY29uZCAobmVnYXRpdmUgeSBpcyB1cClcblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQbGF5ZXIgU2V0dGluZ3NcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucGxheWVyID0gdGhpcy5hZGQuc3ByaXRlKDIwMCwgdGhpcy53b3JsZC5oZWlnaHQgLSA0MDAsICdkdWRlJyk7XG5cbiAgICAgICAgLy8gIFdlIG5lZWQgdG8gZW5hYmxlIHBoeXNpY3Mgb24gdGhlIHBsYXllclxuICAgICAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmVuYWJsZSh0aGlzLnBsYXllcik7XG5cbiAgICAgICAgLy8gRW5hYmxlIHBoeXNpY3Mgb24gdGhlIHBsYXllclxuICAgICAgICB0aGlzLmdhbWUucGh5c2ljcy5lbmFibGUodGhpcy5wbGF5ZXIsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG5cbiAgICAgICAgLy8gTWFrZSBwbGF5ZXIgY29sbGlkZSB3aXRoIHdvcmxkIGJvdW5kYXJpZXMgc28gaGUgZG9lc24ndCBsZWF2ZSB0aGUgc3RhZ2VcbiAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5jb2xsaWRlV29ybGRCb3VuZHMgPSB0cnVlO1xuXG4gICAgICAgIC8vIFNldCBwbGF5ZXIgbWluaW11bSBhbmQgbWF4aW11bSBtb3ZlbWVudCBzcGVlZFxuICAgICAgICB0aGlzLnBsYXllci5ib2R5Lm1heFZlbG9jaXR5LnNldFRvKHRoaXMuTUFYX1NQRUVELCB0aGlzLk1BWF9TUEVFRCAqIDEwKTsgLy8geCwgeVxuXG4gICAgICAgIC8vIEFkZCBkcmFnIHRvIHRoZSBwbGF5ZXIgdGhhdCBzbG93cyB0aGVtIGRvd24gd2hlbiB0aGV5IGFyZSBub3QgYWNjZWxlcmF0aW5nXG4gICAgICAgIHRoaXMucGxheWVyLmJvZHkuZHJhZy5zZXRUbyh0aGlzLkRSQUcsIDApOyAvLyB4LCB5XG5cbiAgICAgICAgLy8gU2luY2Ugd2UncmUganVtcGluZyB3ZSBuZWVkIGdyYXZpdHlcbiAgICAgICAgZ2FtZS5waHlzaWNzLmFyY2FkZS5ncmF2aXR5LnkgPSB0aGlzLkdSQVZJVFk7XG5cbiAgICAgICAgLy8gRmxhZyB0byB0cmFjayBpZiB0aGUganVtcCBidXR0b24gaXMgcHJlc3NlZFxuICAgICAgICB0aGlzLmp1bXBpbmcgPSBmYWxzZTtcblxuICAgICAgICAvLyAgT3VyIHR3byBhbmltYXRpb25zLCB3YWxraW5nIGxlZnQgYW5kIHJpZ2h0LlxuICAgICAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLmFkZCgnbGVmdCcsIFswLCAxLCAyLCAzXSwgMTAsIHRydWUpXG4gICAgICAgIHRoaXMucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdyaWdodCcsIFs1LCA2LCA3LCA4XSwgMTAsIHRydWUpXG5cblxuICAgICAgICAvKipcbiAgICAgICAgICogV2VhcG9uc1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jdXJyZW50V2VhcG9uID0gMDtcbiAgICAgICAgdGhpcy53ZWFwb25zLnB1c2gobmV3IFdlYXBvbnMuQUs0Nyh0aGlzLmdhbWUpKTtcbiAgICAgICAgdGhpcy53ZWFwb25zLnB1c2gobmV3IFdlYXBvbnMuQmFycmV0TTgyQTEodGhpcy5nYW1lKSk7XG5cblxuICAgICAgICAvKipcbiAgICAgICAgICogVGV4dFxuICAgICAgICAgKi9cbiAgICAgICAgbGV0IHRleHRTdHlsZXMgPSB7IGZvbnRTaXplOiAnMjRweCcsIGZpbGw6ICcjMDAwJyB9XG4gICAgICAgIHRoaXMuc2NvcmVUZXh0ID0gdGhpcy5hZGQudGV4dCgyNSwgMjUsICdTY29yZTogMCcsIHRleHRTdHlsZXMpXG4gICAgICAgIHRoaXMuc2NvcmVUZXh0LmZpeGVkVG9DYW1lcmEgPSB0cnVlXG4gICAgICAgIHRoaXMud2VhcG9uTmFtZSA9IHRoaXMuYWRkLnRleHQodGhpcy5jYW1lcmEud2lkdGggLSAxMDAsIHRoaXMuY2FtZXJhLmhlaWdodCAtIDQ1LCAnQUstNDcnLCB0ZXh0U3R5bGVzKVxuICAgICAgICB0aGlzLndlYXBvbk5hbWUuZml4ZWRUb0NhbWVyYSA9IHRydWVcbiAgICAgICAgdGhpcy5jdXJyZW50SGVhbHRoVGV4dCA9IHRoaXMuYWRkLnRleHQodGhpcy5jYW1lcmEueCArIDI1LCB0aGlzLmNhbWVyYS5oZWlnaHQgLSA0NSwgJzEwMCcsIHRleHRTdHlsZXMpXG4gICAgICAgIHRoaXMuY3VycmVudEhlYWx0aFRleHQuZml4ZWRUb0NhbWVyYSA9IHRydWVcblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDYW1lcmEgU2V0dGluZ3NcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2FtZXJhLmZvbGxvdyh0aGlzLnBsYXllcik7XG5cbiAgICAgICAgdmFyIGNoYW5nZUtleSA9IHRoaXMuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5FTlRFUik7XG4gICAgICAgIGNoYW5nZUtleS5vbkRvd24uYWRkKHRoaXMubmV4dFdlYXBvbiwgdGhpcylcblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXNpemluZyBFdmVudHNcbiAgICAgICAgICovXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmdhbWUuc2NhbGUucmVmcmVzaCgpXG4gICAgICAgICAgICB0aGlzLmdhbWUuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0XG4gICAgICAgICAgICB0aGlzLmdhbWUud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aFxuXG4gICAgICAgICAgICB0aGlzLndlYXBvbk5hbWUuY2FtZXJhT2Zmc2V0LnggPSB0aGlzLmNhbWVyYS53aWR0aCAtIDEwMFxuICAgICAgICAgICAgdGhpcy53ZWFwb25OYW1lLmNhbWVyYU9mZnNldC55ID0gdGhpcy5jYW1lcmEuaGVpZ2h0IC0gNDVcblxuICAgICAgICAgICAgdGhpcy5zY29yZVRleHQuY2FtZXJhT2Zmc2V0LnggPSAyNVxuICAgICAgICAgICAgdGhpcy5zY29yZVRleHQuY2FtZXJhT2Zmc2V0LnkgPSAyNVxuICAgICAgICB9KVxuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFN0YXJ0IGxpc3RlbmluZyBmb3IgZXZlbnRzXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnNldEV2ZW50SGFuZGxlcnMoKVxuICAgIH0sXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyAgQ29sbGlkZSB0aGUgcGxheWVyIGFuZCB0aGUgc3RhcnMgd2l0aCB0aGUgcGxhdGZvcm1zXG4gICAgICAgIHRoaXMucGh5c2ljcy5hcmNhZGUuY29sbGlkZSh0aGlzLnBsYXllciwgdGhpcy5wbGF0Zm9ybXMpXG4gICAgICAgIHRoaXMucGh5c2ljcy5hcmNhZGUuY29sbGlkZSh0aGlzLnBsYXRmb3JtcywgdGhpcy53ZWFwb25zLCBmdW5jdGlvbihwbGF0Zm9ybSwgd2VhcG9uKSB7XG4gICAgICAgICAgICB3ZWFwb24ua2lsbCgpXG4gICAgICAgIH0sIG51bGwsIHRoaXMpO1xuXG4gICAgICAgIHRoaXMucGh5c2ljcy5hcmNhZGUuY29sbGlkZSh0aGlzLmVuZW15LCB0aGlzLndlYXBvbnMsIGZ1bmN0aW9uKGVuZW15LCB3ZWFwb24pIHtcbiAgICAgICAgICAgIGVuZW15LmhlYWx0aCAtPSB3ZWFwb24uZGFtYWdlXG4gICAgICAgICAgICB3ZWFwb24ua2lsbCgpXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnWW91IGhpdCB0aGVtIScsIGVuZW15LmhlYWx0aCwgd2VhcG9uLmRhbWFnZSlcbiAgICAgICAgICAgIGlmIChlbmVteS5oZWFsdGggPD0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdUaGV5IGFyZSBkZWFkIScpXG4gICAgICAgICAgICAgICAgdGhpcy5lbmVteS54ID0gMjAwXG4gICAgICAgICAgICAgICAgdGhpcy5lbmVteS55ID0gMjAwXG4gICAgICAgICAgICAgICAgdGhpcy5lbmVteS5oZWFsdGggPSAxMDBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgbnVsbCwgdGhpcyk7XG5cbiAgICAgICAgaWYgKHRoaXMubGVmdElucHV0SXNBY3RpdmUoKSkge1xuICAgICAgICAgICAgLy8gSWYgdGhlIExFRlQga2V5IGlzIGRvd24sIHNldCB0aGUgcGxheWVyIHZlbG9jaXR5IHRvIG1vdmUgbGVmdFxuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5hY2NlbGVyYXRpb24ueCA9IC10aGlzLkFDQ0VMRVJBVElPTjtcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmFuaW1hdGlvbnMucGxheSgnbGVmdCcpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5yaWdodElucHV0SXNBY3RpdmUoKSkge1xuICAgICAgICAgICAgLy8gSWYgdGhlIFJJR0hUIGtleSBpcyBkb3duLCBzZXQgdGhlIHBsYXllciB2ZWxvY2l0eSB0byBtb3ZlIHJpZ2h0XG4gICAgICAgICAgICB0aGlzLnBsYXllci5ib2R5LmFjY2VsZXJhdGlvbi54ID0gdGhpcy5BQ0NFTEVSQVRJT047XG4gICAgICAgICAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLnBsYXkoJ3JpZ2h0JylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFN0YW5kIHN0aWxsXG4gICAgICAgICAgICB0aGlzLnBsYXllci5ib2R5LmFjY2VsZXJhdGlvbi54ID0gMFxuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuYW5pbWF0aW9ucy5zdG9wKClcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmZyYW1lID0gNFxuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2V0IGEgdmFyaWFibGUgdGhhdCBpcyB0cnVlIHdoZW4gdGhlIHBsYXllciBpcyB0b3VjaGluZyB0aGUgZ3JvdW5kXG4gICAgICAgIHZhciBvblRoZUdyb3VuZCA9IHRoaXMucGxheWVyLmJvZHkudG91Y2hpbmcuZG93bjtcblxuICAgICAgICAvLyBJZiB0aGUgcGxheWVyIGlzIHRvdWNoaW5nIHRoZSBncm91bmQsIGxldCBoaW0gaGF2ZSAyIGp1bXBzXG4gICAgICAgIGlmIChvblRoZUdyb3VuZCkge1xuICAgICAgICAgICAgdGhpcy5qdW1wcyA9IDI7XG4gICAgICAgICAgICB0aGlzLmp1bXBpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEp1bXAhXG4gICAgICAgIGlmICh0aGlzLmp1bXBzID4gMCAmJiB0aGlzLnVwSW5wdXRJc0FjdGl2ZSg1KSkge1xuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS52ZWxvY2l0eS55ID0gdGhpcy5KVU1QX1NQRUVEO1xuICAgICAgICAgICAgdGhpcy5qdW1waW5nID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlZHVjZSB0aGUgbnVtYmVyIG9mIGF2YWlsYWJsZSBqdW1wcyBpZiB0aGUganVtcCBpbnB1dCBpcyByZWxlYXNlZFxuICAgICAgICBpZiAodGhpcy5qdW1waW5nICYmIHRoaXMudXBJbnB1dFJlbGVhc2VkKCkpIHtcbiAgICAgICAgICAgIHRoaXMuanVtcHMtLTtcbiAgICAgICAgICAgIHRoaXMuanVtcGluZyA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuZ2FtZS5pbnB1dC5hY3RpdmVQb2ludGVyLmlzRG93bilcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0uZmlyZSh0aGlzLnBsYXllcik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdtb3ZlIHBsYXllcicsIHsgeDogdGhpcy5wbGF5ZXIueCwgeTogdGhpcy5wbGF5ZXIueSB9KVxuICAgIH0sXG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIHNob3VsZCByZXR1cm4gdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgYWN0aXZhdGVzIHRoZSBcImdvIGxlZnRcIiBjb250cm9sXG4gICAgLy8gSW4gdGhpcyBjYXNlLCBlaXRoZXIgaG9sZGluZyB0aGUgcmlnaHQgYXJyb3cgb3IgdGFwcGluZyBvciBjbGlja2luZyBvbiB0aGUgbGVmdFxuICAgIC8vIHNpZGUgb2YgdGhlIHNjcmVlbi5cbiAgICBsZWZ0SW5wdXRJc0FjdGl2ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBpc0FjdGl2ZSA9IGZhbHNlO1xuXG4gICAgICAgIGlzQWN0aXZlID0gdGhpcy5pbnB1dC5rZXlib2FyZC5pc0Rvd24oUGhhc2VyLktleWJvYXJkLkEpO1xuXG4gICAgICAgIHJldHVybiBpc0FjdGl2ZTtcbiAgICB9LFxuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiBzaG91bGQgcmV0dXJuIHRydWUgd2hlbiB0aGUgcGxheWVyIGFjdGl2YXRlcyB0aGUgXCJnbyByaWdodFwiIGNvbnRyb2xcbiAgICAvLyBJbiB0aGlzIGNhc2UsIGVpdGhlciBob2xkaW5nIHRoZSByaWdodCBhcnJvdyBvciB0YXBwaW5nIG9yIGNsaWNraW5nIG9uIHRoZSByaWdodFxuICAgIC8vIHNpZGUgb2YgdGhlIHNjcmVlbi5cbiAgICByaWdodElucHV0SXNBY3RpdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaXNBY3RpdmUgPSBmYWxzZTtcblxuICAgICAgICBpc0FjdGl2ZSA9IHRoaXMuaW5wdXQua2V5Ym9hcmQuaXNEb3duKFBoYXNlci5LZXlib2FyZC5EKTtcblxuICAgICAgICByZXR1cm4gaXNBY3RpdmU7XG4gICAgfSxcblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gc2hvdWxkIHJldHVybiB0cnVlIHdoZW4gdGhlIHBsYXllciBhY3RpdmF0ZXMgdGhlIFwianVtcFwiIGNvbnRyb2xcbiAgICAvLyBJbiB0aGlzIGNhc2UsIGVpdGhlciBob2xkaW5nIHRoZSB1cCBhcnJvdyBvciB0YXBwaW5nIG9yIGNsaWNraW5nIG9uIHRoZSBjZW50ZXJcbiAgICAvLyBwYXJ0IG9mIHRoZSBzY3JlZW4uXG4gICAgdXBJbnB1dElzQWN0aXZlOiBmdW5jdGlvbihkdXJhdGlvbikge1xuICAgICAgICB2YXIgaXNBY3RpdmUgPSBmYWxzZTtcblxuICAgICAgICBpc0FjdGl2ZSA9IHRoaXMuaW5wdXQua2V5Ym9hcmQuZG93bkR1cmF0aW9uKFBoYXNlci5LZXlib2FyZC5XLCBkdXJhdGlvbik7XG5cbiAgICAgICAgcmV0dXJuIGlzQWN0aXZlO1xuICAgIH0sXG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIHJldHVybnMgdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgcmVsZWFzZXMgdGhlIFwianVtcFwiIGNvbnRyb2xcbiAgICB1cElucHV0UmVsZWFzZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVsZWFzZWQgPSBmYWxzZTtcblxuICAgICAgICByZWxlYXNlZCA9IHRoaXMuaW5wdXQua2V5Ym9hcmQudXBEdXJhdGlvbihQaGFzZXIuS2V5Ym9hcmQuVyk7XG5cbiAgICAgICAgcmV0dXJuIHJlbGVhc2VkO1xuICAgIH0sXG5cbiAgICBuZXh0V2VhcG9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gIFRpZHktdXAgdGhlIGN1cnJlbnQgd2VhcG9uXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRXZWFwb24gPiA5KVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS5yZXNldCgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0udmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0uY2FsbEFsbCgncmVzZXQnLCBudWxsLCAwLCAwKTtcbiAgICAgICAgICAgIHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLnNldEFsbCgnZXhpc3RzJywgZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gIEFjdGl2YXRlIHRoZSBuZXcgb25lXG4gICAgICAgIHRoaXMuY3VycmVudFdlYXBvbisrO1xuXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRXZWFwb24gPT09IHRoaXMud2VhcG9ucy5sZW5ndGgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFdlYXBvbiA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS52aXNpYmxlID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLndlYXBvbk5hbWUudGV4dCA9IHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLm5hbWU7XG4gICAgfSxcblxuICAgIHNldEV2ZW50SGFuZGxlcnM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gU29ja2V0IGNvbm5lY3Rpb24gc3VjY2Vzc2Z1bFxuICAgICAgICB0aGlzLnNvY2tldC5vbignY29ubmVjdCcsIHRoaXMub25Tb2NrZXRDb25uZWN0ZWQuYmluZCh0aGlzKSlcblxuICAgICAgICAvLyBTb2NrZXQgZGlzY29ubmVjdGlvblxuICAgICAgICB0aGlzLnNvY2tldC5vbignZGlzY29ubmVjdCcsIHRoaXMub25Tb2NrZXREaXNjb25uZWN0LmJpbmQodGhpcykpXG5cbiAgICAgICAgLy8gTmV3IHBsYXllciBtZXNzYWdlIHJlY2VpdmVkXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCduZXcgcGxheWVyJywgdGhpcy5vbk5ld1BsYXllci5iaW5kKHRoaXMpKVxuXG4gICAgICAgIC8vIFBsYXllciBtb3ZlIG1lc3NhZ2UgcmVjZWl2ZWRcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ21vdmUgcGxheWVyJywgdGhpcy5vbk1vdmVQbGF5ZXIuYmluZCh0aGlzKSlcblxuICAgICAgICAvLyBQbGF5ZXIgcmVtb3ZlZCBtZXNzYWdlIHJlY2VpdmVkXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdyZW1vdmUgcGxheWVyJywgdGhpcy5vblJlbW92ZVBsYXllci5iaW5kKHRoaXMpKVxuICAgIH0sXG5cbiAgICAvLyBTb2NrZXQgY29ubmVjdGVkXG4gICAgb25Tb2NrZXRDb25uZWN0ZWQ6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0Nvbm5lY3RlZCB0byBzb2NrZXQgc2VydmVyJylcblxuICAgICAgICAgLy8gUmVzZXQgZW5lbWllcyBvbiByZWNvbm5lY3RcbiAgICAgICAgdGhpcy5lbmVtaWVzLmZvckVhY2goZnVuY3Rpb24gKGVuZW15KSB7XG4gICAgICAgICAgICBlbmVteS5wbGF5ZXIua2lsbCgpXG4gICAgICAgIH0pXG4gICAgICAgIHRoaXMuZW5lbWllcyA9IFtdXG5cbiAgICAgICAgLy8gU2VuZCBsb2NhbCBwbGF5ZXIgZGF0YSB0byB0aGUgZ2FtZSBzZXJ2ZXJcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnbmV3IHBsYXllcicsIHtcbiAgICAgICAgICAgIGNsaWVudElkOiB0aGlzLmNsaWVudElkLFxuICAgICAgICAgICAgeDogdGhpcy5wbGF5ZXIueCxcbiAgICAgICAgICAgIHk6IHRoaXMucGxheWVyLnlcbiAgICAgICAgfSlcbiAgICB9LFxuXG4gICAgLy8gU29ja2V0IGRpc2Nvbm5lY3RlZFxuICAgIG9uU29ja2V0RGlzY29ubmVjdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdEaXNjb25uZWN0ZWQgZnJvbSBzb2NrZXQgc2VydmVyJylcbiAgICB9LFxuXG4gICAgLy8gTmV3IHBsYXllclxuICAgIG9uTmV3UGxheWVyOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdOZXcgcGxheWVyIGNvbm5lY3RlZDonLCBkYXRhLmlkKVxuXG4gICAgICAgIC8vIEF2b2lkIHBvc3NpYmxlIGR1cGxpY2F0ZSBwbGF5ZXJzXG4gICAgICAgIHZhciBkdXBsaWNhdGUgPSB0aGlzLnBsYXllckJ5SWQoZGF0YS5pZClcbiAgICAgICAgaWYgKGR1cGxpY2F0ZSB8fCBkYXRhLmNsaWVudElkID09PSB0aGlzLmNsaWVudElkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnRHVwbGljYXRlIHBsYXllciEnKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICAvLyBBZGQgbmV3IHBsYXllciB0byB0aGUgcmVtb3RlIHBsYXllcnMgYXJyYXlcbiAgICAgICAgbGV0IG5ld1JlbW90ZVBsYXllciA9IFJlbW90ZVBsYXllci5jcmVhdGUoZGF0YS5pZCwgdGhpcy5nYW1lLCB0aGlzLnBsYXllciwgZGF0YS54LCBkYXRhLnkpXG4gICAgICAgIHRoaXMuZW5lbWllcy5wdXNoKG5ld1JlbW90ZVBsYXllcilcbiAgICAgICAgdGhpcy5lbmVtaWVzW3RoaXMuZW5lbWllcy5sZW5ndGggLSAxXS5wbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ2xlZnQnLCBbMCwgMSwgMiwgM10sIDEwLCB0cnVlKVxuICAgICAgICB0aGlzLmVuZW1pZXNbdGhpcy5lbmVtaWVzLmxlbmd0aCAtIDFdLnBsYXllci5hbmltYXRpb25zLmFkZCgncmlnaHQnLCBbNSwgNiwgNywgOF0sIDEwLCB0cnVlKVxuICAgIH0sXG5cbiAgICAvLyBNb3ZlIHBsYXllclxuICAgIG9uTW92ZVBsYXllcjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgbW92ZVBsYXllciA9IHRoaXMucGxheWVyQnlJZChkYXRhLmlkKVxuXG4gICAgICAgIC8vIFBsYXllciBub3QgZm91bmRcbiAgICAgICAgaWYgKCEgbW92ZVBsYXllcikge1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICAvLyBVcGRhdGUgcGxheWVyIHBvc2l0aW9uXG4gICAgICAgIG1vdmVQbGF5ZXIucGxheWVyLnggPSBkYXRhLnhcbiAgICAgICAgbW92ZVBsYXllci5wbGF5ZXIueSA9IGRhdGEueVxuXG4gICAgICAgIGlmIChtb3ZlUGxheWVyLnBsYXllci54ID4gbW92ZVBsYXllci5sYXN0UG9zaXRpb24ueCkge1xuICAgICAgICAgICAgbW92ZVBsYXllci5wbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdyaWdodCcpXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobW92ZVBsYXllci5wbGF5ZXIueCA8IG1vdmVQbGF5ZXIubGFzdFBvc2l0aW9uLngpXG4gICAgICAgIHtcbiAgICAgICAgICAgIG1vdmVQbGF5ZXIucGxheWVyLmFuaW1hdGlvbnMucGxheSgnbGVmdCcpXG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICBtb3ZlUGxheWVyLnBsYXllci5hbmltYXRpb25zLnN0b3AoKVxuICAgICAgICAgICAgbW92ZVBsYXllci5wbGF5ZXIuZnJhbWUgPSA0O1xuICAgICAgICB9XG5cbiAgICAgICAgbW92ZVBsYXllci5sYXN0UG9zaXRpb24ueCA9IG1vdmVQbGF5ZXIucGxheWVyLnhcbiAgICAgICAgbW92ZVBsYXllci5sYXN0UG9zaXRpb24ueSA9IG1vdmVQbGF5ZXIucGxheWVyLnlcbiAgICB9LFxuXG4gICAgLy8gUmVtb3ZlIHBsYXllclxuICAgIG9uUmVtb3ZlUGxheWVyOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciByZW1vdmVQbGF5ZXIgPSB0aGlzLnBsYXllckJ5SWQoZGF0YS5pZClcblxuICAgICAgICAvLyBQbGF5ZXIgbm90IGZvdW5kXG4gICAgICAgIGlmICghcmVtb3ZlUGxheWVyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnUGxheWVyIG5vdCBmb3VuZDogJywgZGF0YS5pZClcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgcmVtb3ZlUGxheWVyLnBsYXllci5raWxsKClcblxuICAgICAgICAvLyBSZW1vdmUgcGxheWVyIGZyb20gYXJyYXlcbiAgICAgICAgdGhpcy5lbmVtaWVzLnNwbGljZSh0aGlzLmVuZW1pZXMuaW5kZXhPZihyZW1vdmVQbGF5ZXIpLCAxKVxuICAgIH0sXG5cbiAgICAvLyBGaW5kIHBsYXllciBieSBJRFxuICAgIHBsYXllckJ5SWQ6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5lbmVtaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5lbmVtaWVzW2ldLnBsYXllci5uYW1lID09PSBpZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmVuZW1pZXNbaV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbn1cblxuZ2FtZS5zdGF0ZS5hZGQoJ0dhbWUnLCBSYW5nZXJTdGV2ZUdhbWUsIHRydWUpO1xuIiwiJ3VzZSBzdHJpY3QnXG5cbnZhciBCdWxsZXQgPSBmdW5jdGlvbiAoZ2FtZSwga2V5KSB7XG4gICAgUGhhc2VyLlNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIDAsIDAsIGtleSk7XG5cbiAgICB0aGlzLnRleHR1cmUuYmFzZVRleHR1cmUuc2NhbGVNb2RlID0gUElYSS5zY2FsZU1vZGVzLk5FQVJFU1Q7XG5cbiAgICB0aGlzLmFuY2hvci5zZXQoMC41KTtcblxuICAgIHRoaXMuY2hlY2tXb3JsZEJvdW5kcyA9IHRydWU7XG4gICAgdGhpcy5vdXRPZkJvdW5kc0tpbGwgPSB0cnVlO1xuICAgIHRoaXMuZXhpc3RzID0gZmFsc2U7XG5cbiAgICB0aGlzLnRyYWNraW5nID0gZmFsc2U7XG4gICAgdGhpcy5zY2FsZVNwZWVkID0gMDtcblxufTtcblxuQnVsbGV0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpO1xuQnVsbGV0LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEJ1bGxldDtcblxuQnVsbGV0LnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24gKHgsIHksIGFuZ2xlLCBzcGVlZCwgZ3gsIGd5KSB7XG4gICAgZ3ggPSBneCB8fCAwXG4gICAgZ3kgPSBneSB8fCAwXG4gICAgdGhpcy5yZXNldCh4LCB5KVxuICAgIC8vIHRoaXMuc2NhbGUuc2V0KDEpO1xuXG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLm1vdmVUb1BvaW50ZXIodGhpcywgc3BlZWQpXG4gICAgdGhpcy5ib2R5LmdyYXZpdHkueSA9IC0xODAwXG59XG5cbkJ1bGxldC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnRyYWNraW5nKVxuICAgIHtcbiAgICAgICAgdGhpcy5yb3RhdGlvbiA9IE1hdGguYXRhbjIodGhpcy5ib2R5LnZlbG9jaXR5LnksIHRoaXMuYm9keS52ZWxvY2l0eS54KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zY2FsZVNwZWVkID4gMClcbiAgICB7XG4gICAgICAgIHRoaXMuc2NhbGUueCArPSB0aGlzLnNjYWxlU3BlZWQ7XG4gICAgICAgIHRoaXMuc2NhbGUueSArPSB0aGlzLnNjYWxlU3BlZWQ7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1bGxldFxuIiwiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ3VpZEdlbmVyYXRvcigpIHtcbiAgICB2YXIgUzQgPSBmdW5jdGlvbigpIHtcbiAgICAgICByZXR1cm4gKCgoMStNYXRoLnJhbmRvbSgpKSoweDEwMDAwKXwwKS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpXG4gICAgfVxuXG4gICAgcmV0dXJuIChTNCgpK1M0KCkrXCItXCIrUzQoKStcIi1cIitTNCgpK1wiLVwiK1M0KCkrXCItXCIrUzQoKStTNCgpK1M0KCkpXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IFJlbW90ZVBsYXllciA9IHtcbiAgICBsYXN0UG9zaXRpb246IHtcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogMFxuICAgIH1cbn1cblxuUmVtb3RlUGxheWVyLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5wbGF5ZXIueCAhPT0gdGhpcy5sYXN0UG9zaXRpb24ueCB8fCB0aGlzLnBsYXllci55ICE9PSB0aGlzLmxhc3RQb3NpdGlvbi55KSB7XG4gICAgICAgIHRoaXMucGxheWVyLnBsYXkoJ21vdmUnKVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucGxheWVyLnBsYXkoJ3N0b3AnKVxuICAgIH1cblxuICAgIHRoaXMubGFzdFBvc2l0aW9uLnggPSB0aGlzLnBsYXllci54XG4gICAgdGhpcy5sYXN0UG9zaXRpb24ueSA9IHRoaXMucGxheWVyLnlcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgY3JlYXRlOiBmdW5jdGlvbihpbmRleCwgZ2FtZSwgcGxheWVyLCBzdGFydFgsIHN0YXJ0WSkge1xuICAgICAgICBsZXQgbmV3UmVtb3RlUGxheWVyID0ge1xuICAgICAgICAgICAgeDogc3RhcnRYLFxuICAgICAgICAgICAgeTogc3RhcnRZLFxuICAgICAgICAgICAgZ2FtZTogZ2FtZSxcbiAgICAgICAgICAgIGhlYWx0aDogMTAwLFxuICAgICAgICAgICAgcGxheWVyOiBwbGF5ZXIsXG4gICAgICAgICAgICBhbGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgIGxhc3RQb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgIHg6IHN0YXJ0WCxcbiAgICAgICAgICAgICAgICB5OiBzdGFydFlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIG5ld1JlbW90ZVBsYXllciA9IE9iamVjdC5hc3NpZ24oUmVtb3RlUGxheWVyLCBuZXdSZW1vdGVQbGF5ZXIpXG5cbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBwbGF5ZXIncyBlbmVteSBzcHJpdGVcbiAgICAgICAgbmV3UmVtb3RlUGxheWVyLnBsYXllciA9IGdhbWUuYWRkLnNwcml0ZShzdGFydFgsIHN0YXJ0WSwgJ2VuZW15JylcblxuICAgICAgICAvLyBPdXIgdHdvIGFuaW1hdGlvbnMsIHdhbGtpbmcgbGVmdCBhbmQgcmlnaHQuXG4gICAgICAgIG5ld1JlbW90ZVBsYXllci5wbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ2xlZnQnLCBbMCwgMSwgMiwgM10sIDEwLCB0cnVlKVxuICAgICAgICBuZXdSZW1vdGVQbGF5ZXIucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdyaWdodCcsIFs1LCA2LCA3LCA4XSwgMTAsIHRydWUpXG5cbiAgICAgICAgbmV3UmVtb3RlUGxheWVyLnBsYXllci5uYW1lID0gaW5kZXgudG9TdHJpbmcoKVxuXG4gICAgICAgIHJldHVybiBuZXdSZW1vdGVQbGF5ZXJcbiAgICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBcIlVTU09DT01cIjoge1xuICAgICAgICBcIm5hbWVcIjogXCJVU1NPQ09NXCIsXG4gICAgICAgIFwiRGFtYWdlXCI6IDE5MCxcbiAgICAgICAgXCJGaXJlSW50ZXJ2YWxcIjogMTIsXG4gICAgICAgIFwiQW1tb1wiOiAxMixcbiAgICAgICAgXCJSZWxvYWRUaW1lXCI6IDY1LFxuICAgICAgICBcIlNwZWVkXCI6IDE4MCxcbiAgICAgICAgXCJCdWxsZXRTdHlsZVwiOiAxLFxuICAgICAgICBcIlN0YXJ0VXBUaW1lXCI6IDAsXG4gICAgICAgIFwiQmlua1wiOiA0LFxuICAgICAgICBcIk1vdmVtZW50QWNjXCI6IDFcbiAgICB9LFxuICAgIFwiRGVzZXJ0RWFnbGVzXCI6IHtcbiAgICAgICAgXCJuYW1lXCI6IFwiRGVzZXJ0IEVhZ2xlc1wiLFxuICAgICAgICBcIkRhbWFnZVwiOiAyMTAsXG4gICAgICAgIFwiRmlyZUludGVydmFsXCI6IDIyLFxuICAgICAgICBcIkFtbW9cIjogNyxcbiAgICAgICAgXCJSZWxvYWRUaW1lXCI6IDkwLFxuICAgICAgICBcIlNwZWVkXCI6IDE5MCxcbiAgICAgICAgXCJCdWxsZXRTdHlsZVwiOiAxLFxuICAgICAgICBcIlN0YXJ0VXBUaW1lXCI6IDAsXG4gICAgICAgIFwiQmlua1wiOiA3LFxuICAgICAgICBcIk1vdmVtZW50QWNjXCI6IDFcbiAgICB9LFxuICAgIFwiSEtNUDVcIjoge1xuICAgICAgICBcIm5hbWVcIjogXCJISyBNUDVcIixcbiAgICAgICAgXCJEYW1hZ2VcIjogMTIwLFxuICAgICAgICBcIkZpcmVJbnRlcnZhbFwiOiA2LFxuICAgICAgICBcIkFtbW9cIjogMzAsXG4gICAgICAgIFwiUmVsb2FkVGltZVwiOiAxMDUsXG4gICAgICAgIFwiU3BlZWRcIjogMTkwLFxuICAgICAgICBcIkJ1bGxldFN0eWxlXCI6IDEsXG4gICAgICAgIFwiU3RhcnRVcFRpbWVcIjogMCxcbiAgICAgICAgXCJCaW5rXCI6IDIsXG4gICAgICAgIFwiTW92ZW1lbnRBY2NcIjogMVxuICAgIH0sXG4gICAgXCJBSzQ3XCI6IHtcbiAgICAgICAgXCJuYW1lXCI6IFwiQUstNDdcIixcbiAgICAgICAgXCJkYW1hZ2VcIjogXCIxMjJcIixcbiAgICAgICAgXCJmaXJlSW50ZXJ2YWxcIjogXCIxMFwiLFxuICAgICAgICBcImFtbW9cIjogXCI0MFwiLFxuICAgICAgICBcInJlbG9hZFRpbWVcIjogXCIxNTBcIixcbiAgICAgICAgXCJzcGVlZFwiOiBcIjI0MFwiLFxuICAgICAgICBcImJ1bGxldFN0eWxlXCI6IFwiMVwiLFxuICAgICAgICBcInN0YXJ0VXBUaW1lXCI6IFwiMFwiLFxuICAgICAgICBcImJpbmtcIjogXCIzXCIsXG4gICAgICAgIFwibW92ZW1lbnRBY2NcIjogXCIxXCJcbiAgICB9LFxuICAgIFwiU3RleXJBVUdcIjoge1xuICAgICAgICBcIm5hbWVcIjogXCJNMTZcIixcbiAgICAgICAgXCJEYW1hZ2VcIjogXCI4MFwiLFxuICAgICAgICBcIkZpcmVJbnRlcnZhbFwiOiBcIjdcIixcbiAgICAgICAgXCJBbW1vXCI6IFwiMzBcIixcbiAgICAgICAgXCJSZWxvYWRUaW1lXCI6IFwiMTE1XCIsXG4gICAgICAgIFwiU3BlZWRcIjogXCIyNjBcIixcbiAgICAgICAgXCJCdWxsZXRTdHlsZVwiOiBcIjFcIixcbiAgICAgICAgXCJTdGFydFVwVGltZVwiOiBcIjBcIixcbiAgICAgICAgXCJCaW5rXCI6IFwiMlwiLFxuICAgICAgICBcIk1vdmVtZW50QWNjXCI6IFwiMVwiXG4gICAgfSxcbiAgICBcIlNwYXMxMlwiOiB7XG4gICAgICAgIFwibmFtZVwiOiBcIlNwYXMtMTJcIixcbiAgICAgICAgXCJEYW1hZ2VcIjogXCIxMzBcIixcbiAgICAgICAgXCJGaXJlSW50ZXJ2YWxcIjogXCIzMlwiLFxuICAgICAgICBcIkFtbW9cIjogXCI3XCIsXG4gICAgICAgIFwiUmVsb2FkVGltZVwiOiBcIjE3NVwiLFxuICAgICAgICBcIlNwZWVkXCI6IFwiMTQwXCIsXG4gICAgICAgIFwiQnVsbGV0U3R5bGVcIjogXCIzXCIsXG4gICAgICAgIFwiU3RhcnRVcFRpbWVcIjogXCIwXCIsXG4gICAgICAgIFwiQmlua1wiOiBcIjEwXCIsXG4gICAgICAgIFwiTW92ZW1lbnRBY2NcIjogXCIxXCJcbiAgICB9LFxuICAgIFwiUnVnZXI3N1wiOiB7XG4gICAgICAgIFwibmFtZVwiOiBcIlJ1Z2VyIDc3XCIsXG4gICAgICAgIFwiRGFtYWdlXCI6IFwiMjUyXCIsXG4gICAgICAgIFwiRmlyZUludGVydmFsXCI6IFwiMzBcIixcbiAgICAgICAgXCJBbW1vXCI6IFwiNFwiLFxuICAgICAgICBcIlJlbG9hZFRpbWVcIjogXCI3NVwiLFxuICAgICAgICBcIlNwZWVkXCI6IFwiMzMwXCIsXG4gICAgICAgIFwiQnVsbGV0U3R5bGVcIjogXCIxXCIsXG4gICAgICAgIFwiU3RhcnRVcFRpbWVcIjogXCIwXCIsXG4gICAgICAgIFwiQmlua1wiOiBcIjE1XCIsXG4gICAgICAgIFwiTW92ZW1lbnRBY2NcIjogXCIzXCJcbiAgICB9LFxuICAgIFwiTTc5XCI6IHtcbiAgICAgICAgXCJEYW1hZ2VcIjogMTYwMDAwLFxuICAgICAgICBcIkZpcmVJbnRlcnZhbFwiOiA2LFxuICAgICAgICBcIkFtbW9cIjogMSxcbiAgICAgICAgXCJSZWxvYWRUaW1lXCI6IDE4MCxcbiAgICAgICAgXCJTcGVlZFwiOiAxMTUsXG4gICAgICAgIFwiQnVsbGV0U3R5bGVcIjogNCxcbiAgICAgICAgXCJTdGFydFVwVGltZVwiOiAwLFxuICAgICAgICBcIkJpbmtcIjogMzAsXG4gICAgICAgIFwiTW92ZW1lbnRBY2NcIjogM1xuICAgIH0sXG4gICAgXCJCYXJyZXQgTTgyQTFcIjoge1xuICAgICAgICBcIkRhbWFnZVwiOiA0OTUsXG4gICAgICAgIFwiRmlyZUludGVydmFsXCI6IDI0MCxcbiAgICAgICAgXCJBbW1vXCI6IDEwLFxuICAgICAgICBcIlJlbG9hZFRpbWVcIjogMzAwLFxuICAgICAgICBcIlNwZWVkXCI6IFwiNTUwXCIsXG4gICAgICAgIFwiQnVsbGV0U3R5bGVcIjogXCIxXCIsXG4gICAgICAgIFwiU3RhcnRVcFRpbWVcIjogXCIwXCIsXG4gICAgICAgIFwiQmlua1wiOiBcIjgwXCIsXG4gICAgICAgIFwiTW92ZW1lbnRBY2NcIjogXCI2XCJcbiAgICB9LFxuICAgIFwiRk4gTWluaW1pXCI6IHtcbiAgICAgICAgXCJEYW1hZ2VcIjogXCIxMDBcIixcbiAgICAgICAgXCJGaXJlSW50ZXJ2YWxcIjogXCI5XCIsXG4gICAgICAgIFwiQW1tb1wiOiBcIjUwXCIsXG4gICAgICAgIFwiUmVsb2FkVGltZVwiOiBcIjI1MFwiLFxuICAgICAgICBcIlNwZWVkXCI6IFwiMjcwXCIsXG4gICAgICAgIFwiQnVsbGV0U3R5bGVcIjogXCIxXCIsXG4gICAgICAgIFwiU3RhcnRVcFRpbWVcIjogXCIwXCIsXG4gICAgICAgIFwiQmlua1wiOiBcIjNcIixcbiAgICAgICAgXCJNb3ZlbWVudEFjY1wiOiBcIjJcIlxuICAgIH0sXG4gICAgXCJYTTIxNCBNaW5pZ3VuXCI6IHtcbiAgICAgICAgXCJEYW1hZ2VcIjogXCI1NVwiLFxuICAgICAgICBcIkZpcmVJbnRlcnZhbFwiOiBcIjRcIixcbiAgICAgICAgXCJBbW1vXCI6IFwiMTAwXCIsXG4gICAgICAgIFwiUmVsb2FkVGltZVwiOiBcIjM2NlwiLFxuICAgICAgICBcIlNwZWVkXCI6IFwiMjkwXCIsXG4gICAgICAgIFwiQnVsbGV0U3R5bGVcIjogXCIxXCIsXG4gICAgICAgIFwiU3RhcnRVcFRpbWVcIjogXCI1MFwiLFxuICAgICAgICBcIkJpbmtcIjogXCIxXCIsXG4gICAgICAgIFwiTW92ZW1lbnRBY2NcIjogXCIxXCJcbiAgICB9LFxuICAgIFwiRmxhbWVyXCI6IHtcbiAgICAgICAgXCJEYW1hZ2VcIjogXCIxMDAwXCIsXG4gICAgICAgIFwiRmlyZUludGVydmFsXCI6IFwiNlwiLFxuICAgICAgICBcIkFtbW9cIjogXCIyMDBcIixcbiAgICAgICAgXCJSZWxvYWRUaW1lXCI6IFwiNVwiLFxuICAgICAgICBcIlNwZWVkXCI6IFwiMTA1XCIsXG4gICAgICAgIFwiQnVsbGV0U3R5bGVcIjogXCI1XCIsXG4gICAgICAgIFwiU3RhcnRVcFRpbWVcIjogXCIwXCIsXG4gICAgICAgIFwiQmlua1wiOiBcIjJcIixcbiAgICAgICAgXCJNb3ZlbWVudEFjY1wiOiBcIjFcIlxuICAgIH0sXG4gICAgXCJSYW1ibyBCb3dcIjoge1xuICAgICAgICBcIkRhbWFnZVwiOiBcIjEyMDBcIixcbiAgICAgICAgXCJGaXJlSW50ZXJ2YWxcIjogXCIxMFwiLFxuICAgICAgICBcIkFtbW9cIjogXCIxXCIsXG4gICAgICAgIFwiUmVsb2FkVGltZVwiOiBcIjI1XCIsXG4gICAgICAgIFwiU3BlZWRcIjogXCIyMTBcIixcbiAgICAgICAgXCJCdWxsZXRTdHlsZVwiOiBcIjdcIixcbiAgICAgICAgXCJTdGFydFVwVGltZVwiOiBcIjBcIixcbiAgICAgICAgXCJCaW5rXCI6IFwiM1wiLFxuICAgICAgICBcIk1vdmVtZW50QWNjXCI6IFwiMVwiXG4gICAgfSxcbiAgICBcIkZsYW1lZCBBcnJvd3NcIjoge1xuICAgICAgICBcIkRhbWFnZVwiOiBcIjgwMFwiLFxuICAgICAgICBcIkZpcmVJbnRlcnZhbFwiOiBcIjEwXCIsXG4gICAgICAgIFwiQW1tb1wiOiBcIjFcIixcbiAgICAgICAgXCJSZWxvYWRUaW1lXCI6IFwiMzZcIixcbiAgICAgICAgXCJTcGVlZFwiOiBcIjE4MFwiLFxuICAgICAgICBcIkJ1bGxldFN0eWxlXCI6IFwiOFwiLFxuICAgICAgICBcIlN0YXJ0VXBUaW1lXCI6IFwiMFwiLFxuICAgICAgICBcIkJpbmtcIjogXCIzXCIsXG4gICAgICAgIFwiTW92ZW1lbnRBY2NcIjogXCIxXCJcbiAgICB9LFxuICAgIFwiQ29tYmF0IEtuaWZlXCI6IHtcbiAgICAgICAgXCJEYW1hZ2VcIjogXCIyMTAwMDBcIixcbiAgICAgICAgXCJGaXJlSW50ZXJ2YWxcIjogXCI2XCIsXG4gICAgICAgIFwiQW1tb1wiOiBcIjFcIixcbiAgICAgICAgXCJSZWxvYWRUaW1lXCI6IFwiM1wiLFxuICAgICAgICBcIlNwZWVkXCI6IFwiNjBcIixcbiAgICAgICAgXCJCdWxsZXRTdHlsZVwiOiBcIjExXCIsXG4gICAgICAgIFwiU3RhcnRVcFRpbWVcIjogXCIwXCIsXG4gICAgICAgIFwiQmlua1wiOiBcIjBcIixcbiAgICAgICAgXCJNb3ZlbWVudEFjY1wiOiBcIjFcIlxuICAgIH0sXG4gICAgXCJDaGFpbnNhd1wiOiB7XG4gICAgICAgIFwiRGFtYWdlXCI6IFwiMjEwMFwiLFxuICAgICAgICBcIkZpcmVJbnRlcnZhbFwiOiBcIjRcIixcbiAgICAgICAgXCJBbW1vXCI6IFwiMzBcIixcbiAgICAgICAgXCJSZWxvYWRUaW1lXCI6IFwiNzBcIixcbiAgICAgICAgXCJTcGVlZFwiOiBcIjcwXCIsXG4gICAgICAgIFwiQnVsbGV0U3R5bGVcIjogXCIxMVwiLFxuICAgICAgICBcIlN0YXJ0VXBUaW1lXCI6IFwiMFwiLFxuICAgICAgICBcIkJpbmtcIjogXCIwXCIsXG4gICAgICAgIFwiTW92ZW1lbnRBY2NcIjogXCIxXCJcbiAgICB9LFxuICAgIFwiTTcyIExBV1wiOiB7XG4gICAgICAgIFwiRGFtYWdlXCI6IFwiMTUwMDAwXCIsXG4gICAgICAgIFwiRmlyZUludGVydmFsXCI6IFwiNjBcIixcbiAgICAgICAgXCJBbW1vXCI6IFwiMVwiLFxuICAgICAgICBcIlJlbG9hZFRpbWVcIjogXCI2MDBcIixcbiAgICAgICAgXCJTcGVlZFwiOiBcIjIzMFwiLFxuICAgICAgICBcIkJ1bGxldFN0eWxlXCI6IFwiMTJcIixcbiAgICAgICAgXCJTdGFydFVwVGltZVwiOiBcIjBcIixcbiAgICAgICAgXCJCaW5rXCI6IFwiMjBcIixcbiAgICAgICAgXCJNb3ZlbWVudEFjY1wiOiBcIjFcIlxuICAgIH0sXG4gICAgXCJQdW5jaFwiOiB7XG4gICAgICAgIFwiRGFtYWdlXCI6IFwiMzMwMDBcIixcbiAgICAgICAgXCJGaXJlSW50ZXJ2YWxcIjogXCI2XCIsXG4gICAgICAgIFwiQW1tb1wiOiBcIjFcIixcbiAgICAgICAgXCJSZWxvYWRUaW1lXCI6IFwiM1wiLFxuICAgICAgICBcIlNwZWVkXCI6IFwiNTBcIixcbiAgICAgICAgXCJCdWxsZXRTdHlsZVwiOiBcIjZcIixcbiAgICAgICAgXCJTdGFydFVwVGltZVwiOiBcIjBcIixcbiAgICAgICAgXCJCaW5rXCI6IFwiMlwiLFxuICAgICAgICBcIk1vdmVtZW50QWNjXCI6IFwiMVwiXG4gICAgfSxcbiAgICBcIkdyZW5hZGVcIjoge1xuICAgICAgICBcIkRhbWFnZVwiOiBcIjE1MDAwMFwiLFxuICAgICAgICBcIkZpcmVJbnRlcnZhbFwiOiBcIjgwXCIsXG4gICAgICAgIFwiQW1tb1wiOiBcIjFcIixcbiAgICAgICAgXCJSZWxvYWRUaW1lXCI6IFwiMjBcIixcbiAgICAgICAgXCJTcGVlZFwiOiBcIjUwXCIsXG4gICAgICAgIFwiQnVsbGV0U3R5bGVcIjogXCIyXCIsXG4gICAgICAgIFwiU3RhcnRVcFRpbWVcIjogXCIwXCIsXG4gICAgICAgIFwiQmlua1wiOiBcIjBcIixcbiAgICAgICAgXCJNb3ZlbWVudEFjY1wiOiBcIjFcIlxuICAgIH0sXG4gICAgXCJTdGF0aW9uYXJ5IEd1blwiOiB7XG4gICAgICAgIFwiRGFtYWdlXCI6IFwiNTBcIixcbiAgICAgICAgXCJGaXJlSW50ZXJ2YWxcIjogXCI0XCIsXG4gICAgICAgIFwiQW1tb1wiOiBcIjEwMFwiLFxuICAgICAgICBcIlJlbG9hZFRpbWVcIjogXCIzNjZcIixcbiAgICAgICAgXCJTcGVlZFwiOiBcIjI5MFwiLFxuICAgICAgICBcIkJ1bGxldFN0eWxlXCI6IFwiMVwiLFxuICAgICAgICBcIlN0YXJ0VXBUaW1lXCI6IFwiMFwiLFxuICAgICAgICBcIkJpbmtcIjogXCIwXCIsXG4gICAgICAgIFwiTW92ZW1lbnRBY2NcIjogXCIxXCJcbiAgICB9XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IEJ1bGxldCA9IHJlcXVpcmUoJy4uL0J1bGxldCcpXG5cbmxldCBBSzQ3ID0gZnVuY3Rpb24gKGdhbWUpIHtcbiAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCBnYW1lLCBnYW1lLndvcmxkLCAnQUstNDcnLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcblxuICAgIHRoaXMuZGFtYWdlID0gMjJcbiAgICB0aGlzLm5leHRGaXJlID0gMDtcbiAgICB0aGlzLmJ1bGxldFNwZWVkID0gMTAwMDtcbiAgICAvLyBBSzQ3IGZpcmVzIGFib3V0IDYwMCBidWxsZXRzIHBlciBzZWNvbmRcbiAgICB0aGlzLmZpcmVSYXRlID0gMTY2LjY2NjY2NztcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNjQ7IGkrKylcbiAgICB7XG4gICAgICAgIGxldCBidWxsZXQgPSBuZXcgQnVsbGV0KHRoaXMuZ2FtZSwgJ2dyb3VuZCcpXG4gICAgICAgIGJ1bGxldC5oZWlnaHQgPSAyXG4gICAgICAgIGJ1bGxldC53aWR0aCA9IDEwXG4gICAgICAgIGJ1bGxldC5kYW1hZ2UgPSAyMlxuICAgICAgICB0aGlzLmFkZChidWxsZXQsIHRydWUpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG59XG5cbkFLNDcucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcbkFLNDcucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQUs0NztcblxuQUs0Ny5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uIChzb3VyY2UpIHtcblxuICAgIGlmICh0aGlzLmdhbWUudGltZS50aW1lIDwgdGhpcy5uZXh0RmlyZSlcbiAgICAgICAgcmV0dXJuXG5cbiAgICB2YXIgeCA9IHNvdXJjZS54ICsgMTU7XG4gICAgdmFyIHkgPSBzb3VyY2UueSArIDMwO1xuXG4gICAgdGhpcy5nZXRGaXJzdEV4aXN0cyhmYWxzZSkuZmlyZSh4LCB5LCAwLCB0aGlzLmJ1bGxldFNwZWVkLCAwLCAwKTtcbiAgICB0aGlzLnNldEFsbCgndHJhY2tpbmcnLCB0cnVlKVxuXG4gICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMuZ2FtZS50aW1lLnRpbWUgKyB0aGlzLmZpcmVSYXRlXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQUs0N1xuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBCdWxsZXQgPSByZXF1aXJlKCcuLi9CdWxsZXQnKVxuXG5sZXQgQmFycmV0TTgyQTEgPSBmdW5jdGlvbiAoZ2FtZSkge1xuICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGdhbWUsIGdhbWUud29ybGQsICdBSy00NycsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuXG4gICAgdGhpcy5uYW1lID0gJ0JhcnJldCBNODJBMSdcbiAgICB0aGlzLmRhbWFnZSA9IDg4XG4gICAgdGhpcy5uZXh0RmlyZSA9IDBcbiAgICB0aGlzLmJ1bGxldFNwZWVkID0gMzQzNVxuXG4gICAgLy8gQmFycmV0TTgyQTEgZmlyZXMgYWJvdXQgNjAwIGJ1bGxldHMgcGVyIHNlY29uZFxuICAgIHRoaXMuZmlyZVJhdGUgPSA0MDAwXG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDY0OyBpKyspXG4gICAge1xuICAgICAgICBsZXQgYnVsbGV0ID0gbmV3IEJ1bGxldCh0aGlzLmdhbWUsICdncm91bmQnKVxuICAgICAgICBidWxsZXQuaGVpZ2h0ID0gMlxuICAgICAgICBidWxsZXQud2lkdGggPSAxMFxuICAgICAgICBidWxsZXQuZGFtYWdlID0gODhcblxuICAgICAgICB0aGlzLmFkZChidWxsZXQsIHRydWUpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbn1cblxuQmFycmV0TTgyQTEucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcbkJhcnJldE04MkExLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEJhcnJldE04MkExO1xuXG5CYXJyZXRNODJBMS5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uIChzb3VyY2UpIHtcbiAgICBpZiAodGhpcy5nYW1lLnRpbWUudGltZSA8IHRoaXMubmV4dEZpcmUpXG4gICAgICAgIHJldHVyblxuXG4gICAgdmFyIHggPSBzb3VyY2UueCArIDE1O1xuICAgIHZhciB5ID0gc291cmNlLnkgKyAzMDtcblxuICAgIHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgMClcbiAgICB0aGlzLnNldEFsbCgndHJhY2tpbmcnLCB0cnVlKVxuXG4gICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMuZ2FtZS50aW1lLnRpbWUgKyB0aGlzLmZpcmVSYXRlXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQmFycmV0TTgyQTFcbiIsIid1c2Ugc3RyaWN0J1xuXG4vKipcbiAqIFByaW1hcnkgV2VhcG9uc1xuICogMS4gRGVzZXJ0IEVhZ2xlc1xuICogMi4gSEsgTVA1XG4gKiAzLiBBSzQ3XG4gKiA0LiBNMTZcbiAqIDUuIFNwYXMtMTJcbiAqIDYuIFJ1Z2VyIDc3XG4gKiA3LiBNNzlcbiAqIDguIEJhcnJldCBNODJBMVxuICogOS4gRk4gTWluaW1pXG4gKiAxMC4gWE0yMTQgTWluaWd1blxuICovXG5cbi8qKlxuICogU2Vjb25kYXJ5IFdlYXBvbnNcbiAqIDEuIFVTU09DT01cbiAqIDIuIENvbWJhdCBLbmlmZVxuICogMy4gQ2hhaW5zYXdcbiAqIDQuIE03MiBMYXdcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBcIkFLNDdcIjogcmVxdWlyZSgnLi9BSzQ3JyksXG4gICAgXCJCYXJyZXRNODJBMVwiOiByZXF1aXJlKCcuL0JhcnJldE04MkExJylcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgTWFwQ3RmMSA9IHt9XG5cbk1hcEN0ZjEuY3JlYXRlID0gZnVuY3Rpb24oc2NvcGUpIHtcbiAgICB0aGlzLnNjb3BlID0gc2NvcGVcblxuICAgIHRoaXMuY3JlYXRlU2t5U3ByaXRlKClcbiAgICB0aGlzLmNyZWF0ZVBsYXRmb3JtcygpXG4gICAgdGhpcy5jcmVhdGVMZWRnZXMoKVxuXG4gICAgdGhpcy5zY29wZS5wbGF0Zm9ybXMuc2V0QWxsKCdib2R5LmltbW92YWJsZScsIHRydWUpXG4gICAgdGhpcy5zY29wZS5wbGF0Zm9ybXMuc2V0QWxsKCdib2R5LmFsbG93R3Jhdml0eScsIGZhbHNlKVxufVxuXG5NYXBDdGYxLmNyZWF0ZUxlZGdlcyA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBsZWRnZXMgPSBbXG4gICAgICAgIC8vIHt4LCB5LCB3aWR0aCwgaGVpZ2h0fVxuXG4gICAgICAgIC8vIFN0YXJ0aW5nIExlZGdlc1xuICAgICAgICB7IGlkOiAxLCB4OiAwLCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gNDMxLCB3aWR0aDogMTI4LCBoZWlnaHQ6IDkyIH0sIC8vIExlZnQgYm90dG9tIGxlZGdlXG4gICAgICAgIHsgaWQ6IDIsIHg6IDAsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA4MzgsIHdpZHRoOiAxMjgsIGhlaWdodDogOTIgfSwgLy8gTGVmdCB0b3AgbGVkZ2VcblxuICAgICAgICB7IGlkOiAzLCB4OiAzODcyLCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gNDI3LCB3aWR0aDogMTI4LCBoZWlnaHQ6IDkyIH0sIC8vIFJpZ2h0IGJvdHRvbSBsZWRnZVxuICAgICAgICB7IGlkOiA0LCB4OiAzODcyLCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gODM1LCB3aWR0aDogMTI4LCBoZWlnaHQ6IDkyIH0sIC8vIFJpZ2h0IHRvcCBsZWRnZVxuXG4gICAgICAgIC8vIEdyb3VuZCBMZWRnZXNcbiAgICAgICAgeyBpZDogNSwgeDogMCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDEyOCwgd2lkdGg6IDQ3NCwgaGVpZ2h0OiAxMjggfSwgLy8gTWFpbiBib3R0b20gc3RhcnRpbmcgbGVmdCBsZWRnZVxuICAgICAgICB7IGlkOiA2LCB4OiA0NzQsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSAyNTYsIHdpZHRoOiA2NDEsIGhlaWdodDogMjYwIH0sIC8vIE1haW4gYm90dG9tIGxlZnQgbGVkZ2VcbiAgICAgICAgeyBpZDogNywgeDogMTExNSwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDM4NCwgd2lkdGg6IDE3ODUsIGhlaWdodDogMzkwIH0sIC8vIE1haW4gYm90dG9tIGNlbnRlciBsZWRnZVxuICAgICAgICB7IGlkOiA4LCB4OiAyOTAwLCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gMjU2LCB3aWR0aDogNjQxLCBoZWlnaHQ6IDI2MCB9LCAvLyBNYWluIGJvdHRvbSByaWdodCBsZWRnZVxuICAgICAgICB7IGlkOiA5LCB4OiAzNTQwLCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gMTI4LCB3aWR0aDogNDc0LCBoZWlnaHQ6IDEyOCB9LCAvLyBNYWluIGJvdHRvbSBzdGFydGluZyByaWdodCBsZWRnZVxuXG4gICAgICAgIC8vIEFpciBMZWRnZXNcbiAgICAgICAgeyBpZDogMTAsIHg6IDMwMCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDYwOCwgd2lkdGg6IDY0MSwgaGVpZ2h0OiA5MiB9LFxuICAgICAgICB7IGlkOiAxMSwgeDogMTExMCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDcwMSwgd2lkdGg6IDUxMywgaGVpZ2h0OiA5MiB9LFxuICAgICAgICB7IGlkOiAxMiwgeDogODcwLCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gOTgyLCB3aWR0aDogMjU2LCBoZWlnaHQ6IDkyIH0sXG4gICAgICAgIHsgaWQ6IDEzLCB4OiAxNzQ0LCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gODc0LCB3aWR0aDogNTA3LCBoZWlnaHQ6IDI1NCB9LFxuICAgICAgICB7IGlkOiAxNCwgeDogMjM5MCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDY4OSwgd2lkdGg6IDUxMywgaGVpZ2h0OiA5MiB9LFxuICAgICAgICB7IGlkOiAxNSwgeDogMzAzMSwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDYwOCwgd2lkdGg6IDY0MSwgaGVpZ2h0OiA5MiB9LFxuICAgICAgICB7IGlkOiAxNiwgeDogMjkwMywgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDk1Nywgd2lkdGg6IDI1NiwgaGVpZ2h0OiA5MiB9XG4gICAgXVxuXG5cbiAgICBsZWRnZXMuZm9yRWFjaCgobGVkZ2UpID0+IHtcbiAgICAgICAgLy8gdmFyIG5ld0xlZGdlID0gdGhpcy5zY29wZS5wbGF0Zm9ybXMuY3JlYXRlKGxlZGdlLngsIGxlZGdlLnksICdncm91bmQnKVxuICAgICAgICB2YXIgbmV3TGVkZ2UgPSB0aGlzLnNjb3BlLnBsYXRmb3Jtcy5jcmVhdGUobGVkZ2UueCwgbGVkZ2UueSlcbiAgICAgICAgbmV3TGVkZ2UuaGVpZ2h0ID0gbGVkZ2UuaGVpZ2h0XG4gICAgICAgIG5ld0xlZGdlLndpZHRoID0gbGVkZ2Uud2lkdGhcblxuICAgICAgICAvLyBEZWJ1ZyBzdHVmZlxuICAgICAgICAvLyBuZXdMZWRnZS5hbHBoYSA9IDAuMlxuICAgICAgICAvLyBsZXQgc3R5bGUgPSB7IGZvbnQ6IFwiMjBweCBBcmlhbFwiLCBmaWxsOiBcIiNmZjAwNDRcIiwgYWxpZ246IFwiY2VudGVyXCIsIGJhY2tncm91bmRDb2xvcjogXCIjZmZmZjAwXCIgfVxuICAgICAgICAvLyBsZXQgdGV4dCA9IHRoaXMuc2NvcGUuZ2FtZS5hZGQudGV4dChsZWRnZS54LCBsZWRnZS55LCBsZWRnZS5pZCwgc3R5bGUpXG4gICAgICAgIC8vIHRleHQuYWxwaGEgPSAwLjJcbiAgICB9KVxufVxuXG5NYXBDdGYxLmNyZWF0ZVNreVNwcml0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2NvcGUuYWRkLnRpbGVTcHJpdGUoMCwgdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDE1MDAsIHRoaXMuc2NvcGUuZ2FtZS53b3JsZC53aWR0aCwgMTUwMCwgJ3RyZWVzY2FwZScpXG59XG5cbk1hcEN0ZjEuY3JlYXRlUGxhdGZvcm1zID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zY29wZS5wbGF0Zm9ybXMgPSB0aGlzLnNjb3BlLmFkZC5ncm91cCgpXG4gICAgdGhpcy5zY29wZS5wbGF0Zm9ybXMuZW5hYmxlQm9keSA9IHRydWVcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBNYXBDdGYxXG4iXX0=
