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

        this.enemy = this.add.sprite(200, this.world.height - 400, 'dude');

        //  We need to enable physics on the player
        this.physics.arcade.enable(this.enemy);

        // Enable physics on the player
        this.game.physics.enable(this.enemy, Phaser.Physics.ARCADE);

        // Make player collide with world boundaries so he doesn't leave the stage
        this.enemy.body.collideWorldBounds = true;

        // Set player minimum and maximum movement speed
        this.enemy.body.maxVelocity.setTo(this.MAX_SPEED, this.MAX_SPEED * 10); // x, y

        // Add drag to the player that slows them down when they are not accelerating
        this.enemy.body.drag.setTo(this.DRAG, 0); // x, y

        this.enemy.health = 100;

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
        //  Collide the player and the stars with the platforms
        this.physics.arcade.collide(this.player, this.platforms);
        this.physics.arcade.collide(this.enemy, this.platforms);
        this.physics.arcade.collide(this.platforms, this.weapons, function (platform, weapon) {
            weapon.kill();
        }, null, this);

        this.physics.arcade.collide(this.player, this.weapons, function (player, weapon) {
            weapon.kill();
            console.log('You were hit!');
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
    this.scale.set(1);

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
        var bullet = new Bullet(this.game, 'bullet5');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvYXBwLmpzIiwiYXNzZXRzL2pzL2xpYi9CdWxsZXQuanMiLCJhc3NldHMvanMvbGliL0d1aWQuanMiLCJhc3NldHMvanMvbGliL1JlbW90ZVBsYXllci5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9uU2V0dGluZ3MuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvQUs0Ny5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9pbmRleC5qcyIsImFzc2V0cy9qcy9tYXBzL01hcEN0ZjEuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7QUFFQSxJQUFJLFVBQVUsUUFBUSxnQkFBUixDQUFWO0FBQ0osSUFBSSxlQUFlLFFBQVEsb0JBQVIsQ0FBZjtBQUNKLElBQUksaUJBQWlCLFFBQVEsc0JBQVIsQ0FBakI7QUFDSixJQUFJLE9BQU8sUUFBUSxZQUFSLENBQVA7QUFDSixJQUFJLFVBQVUsUUFBUSxlQUFSLENBQVY7QUFDSixJQUFJLFNBQVMsUUFBUSxjQUFSLENBQVQ7O0FBRUosSUFBSSxZQUFZLE9BQU8sVUFBUDtBQUNoQixJQUFJLGFBQWEsT0FBTyxXQUFQO0FBQ2pCLElBQUksYUFBYSxJQUFiO0FBQ0osSUFBSSxjQUFjLElBQWQ7O0FBRUosSUFBSSxPQUFPLElBQUksT0FBTyxJQUFQLENBQVksU0FBaEIsRUFBMkIsVUFBM0IsRUFBdUMsT0FBTyxNQUFQLEVBQWUsbUJBQXRELENBQVA7O0FBRUosSUFBSSxrQkFBa0IsU0FBbEIsZUFBa0IsR0FBVztBQUM3QixTQUFLLFFBQUwsR0FBZ0IsTUFBaEIsQ0FENkI7QUFFN0IsU0FBSyxhQUFMLEdBQXFCLENBQXJCLENBRjZCO0FBRzdCLFNBQUssT0FBTCxHQUFlLEVBQWYsQ0FINkI7QUFJN0IsU0FBSyxJQUFMLEdBQVksSUFBWixDQUo2QjtBQUs3QixTQUFLLE1BQUwsQ0FMNkI7QUFNN0IsU0FBSyxTQUFMLENBTjZCO0FBTzdCLFNBQUssTUFBTCxDQVA2QjtBQVE3QixTQUFLLEtBQUwsR0FBYSxDQUFiLENBUjZCO0FBUzdCLFNBQUssU0FBTCxDQVQ2QjtBQVU3QixTQUFLLE1BQUwsQ0FWNkI7QUFXN0IsU0FBSyxVQUFMLEdBQWtCLElBQWxCLENBWDZCO0FBWTdCLFNBQUssT0FBTCxHQUFlLEVBQWYsQ0FaNkI7Q0FBWDs7QUFldEIsZ0JBQWdCLFNBQWhCLEdBQTRCO0FBQ3hCLFVBQU0sZ0JBQVc7QUFDYixhQUFLLElBQUwsQ0FBVSxRQUFWLENBQW1CLGFBQW5CLENBQWlDLFdBQWpDLEdBQStDLElBQS9DLENBRGE7QUFFYixhQUFLLElBQUwsQ0FBVSxLQUFWLENBQWdCLHVCQUFoQixHQUEwQyxJQUExQyxDQUZhO0FBR2IsYUFBSyxPQUFMLENBQWEsV0FBYixDQUF5QixPQUFPLE9BQVAsQ0FBZSxNQUFmLENBQXpCLENBSGE7S0FBWDs7QUFNTixhQUFTLG1CQUFXO0FBQ2hCLGFBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsVUFBaEIsRUFBNEIsc0JBQTVCLEVBRGdCO0FBRWhCLGFBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsVUFBaEIsRUFBNEIsc0JBQTVCLEVBRmdCO0FBR2hCLGFBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsU0FBaEIsRUFBMkIscUJBQTNCLEVBSGdCO0FBSWhCLGFBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsU0FBaEIsRUFBMkIscUJBQTNCLEVBSmdCO0FBS2hCLGFBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsU0FBaEIsRUFBMkIscUJBQTNCLEVBTGdCO0FBTWhCLGFBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsU0FBaEIsRUFBMkIscUJBQTNCLEVBTmdCO0FBT2hCLGFBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsU0FBaEIsRUFBMkIscUJBQTNCLEVBUGdCO0FBUWhCLGFBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsV0FBaEIsRUFBNkIsc0JBQTdCLEVBUmdCO0FBU2hCLGFBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsUUFBaEIsRUFBMEIsc0JBQTFCLEVBVGdCO0FBVWhCLGFBQUssSUFBTCxDQUFVLFdBQVYsQ0FBc0IsTUFBdEIsRUFBOEIsa0JBQTlCLEVBQWtELEVBQWxELEVBQXNELEVBQXRELEVBVmdCO0FBV2hCLGFBQUssSUFBTCxDQUFVLFdBQVYsQ0FBc0IsT0FBdEIsRUFBK0Isa0JBQS9CLEVBQW1ELEVBQW5ELEVBQXVELEVBQXZELEVBWGdCO0tBQVg7O0FBY1QsWUFBUSxrQkFBVzs7O0FBQ2YsYUFBSyxNQUFMLEdBQWMsR0FBRyxPQUFILEVBQWQsQ0FEZTtBQUVmLGFBQUssT0FBTCxHQUFlLEVBQWY7OztBQUZlLFlBS2YsQ0FBSyxPQUFMLENBQWEsV0FBYixDQUF5QixPQUFPLE9BQVAsQ0FBZSxNQUFmLENBQXpCLENBTGU7O0FBT2YsYUFBSyxLQUFMLENBQVcsU0FBWCxDQUFxQixDQUFyQixFQUF3QixDQUF4QixFQUEyQixVQUEzQixFQUF1QyxXQUF2QyxFQVBlO0FBUWYsYUFBSyxJQUFMLENBQVUsS0FBVixDQUFnQixlQUFoQixHQUFrQyxTQUFsQzs7O0FBUmUsWUFXZixDQUFLLElBQUwsQ0FBVSxLQUFWLENBQWdCLFNBQWhCLEdBQTRCLE9BQU8sWUFBUCxDQUFvQixNQUFwQixDQVhiO0FBWWYsYUFBSyxJQUFMLENBQVUsS0FBVixDQUFnQixVQUFoQixHQVplO0FBYWYsYUFBSyxJQUFMLENBQVUsS0FBVixDQUFnQixPQUFoQjs7Ozs7QUFiZSxlQW1CZixDQUFRLE1BQVIsQ0FBZSxJQUFmOzs7QUFuQmUsWUFzQmYsQ0FBSyxTQUFMLEdBQWlCLEdBQWpCO0FBdEJlLFlBdUJmLENBQUssWUFBTCxHQUFvQixJQUFwQjtBQXZCZSxZQXdCZixDQUFLLElBQUwsR0FBWSxJQUFaO0FBeEJlLFlBeUJmLENBQUssT0FBTCxHQUFlLElBQWY7QUF6QmUsWUEwQmYsQ0FBSyxVQUFMLEdBQWtCLENBQUMsR0FBRDs7Ozs7QUExQkgsWUFnQ2YsQ0FBSyxNQUFMLEdBQWMsS0FBSyxHQUFMLENBQVMsTUFBVCxDQUFnQixHQUFoQixFQUFxQixLQUFLLEtBQUwsQ0FBVyxNQUFYLEdBQW9CLEdBQXBCLEVBQXlCLE1BQTlDLENBQWQ7OztBQWhDZSxZQW1DZixDQUFLLE9BQUwsQ0FBYSxNQUFiLENBQW9CLE1BQXBCLENBQTJCLEtBQUssTUFBTCxDQUEzQjs7O0FBbkNlLFlBc0NmLENBQUssSUFBTCxDQUFVLE9BQVYsQ0FBa0IsTUFBbEIsQ0FBeUIsS0FBSyxNQUFMLEVBQWEsT0FBTyxPQUFQLENBQWUsTUFBZixDQUF0Qzs7O0FBdENlLFlBeUNmLENBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsa0JBQWpCLEdBQXNDLElBQXRDOzs7QUF6Q2UsWUE0Q2YsQ0FBSyxNQUFMLENBQVksSUFBWixDQUFpQixXQUFqQixDQUE2QixLQUE3QixDQUFtQyxLQUFLLFNBQUwsRUFBZ0IsS0FBSyxTQUFMLEdBQWlCLEVBQWpCLENBQW5EOzs7QUE1Q2UsWUErQ2YsQ0FBSyxNQUFMLENBQVksSUFBWixDQUFpQixJQUFqQixDQUFzQixLQUF0QixDQUE0QixLQUFLLElBQUwsRUFBVyxDQUF2Qzs7O0FBL0NlLFlBa0RmLENBQUssT0FBTCxDQUFhLE1BQWIsQ0FBb0IsT0FBcEIsQ0FBNEIsQ0FBNUIsR0FBZ0MsS0FBSyxPQUFMOzs7QUFsRGpCLFlBcURmLENBQUssT0FBTCxHQUFlLEtBQWY7OztBQXJEZSxZQXdEZixDQUFLLE1BQUwsQ0FBWSxVQUFaLENBQXVCLEdBQXZCLENBQTJCLE1BQTNCLEVBQW1DLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixDQUFuQyxFQUFpRCxFQUFqRCxFQUFxRCxJQUFyRCxFQXhEZTtBQXlEZixhQUFLLE1BQUwsQ0FBWSxVQUFaLENBQXVCLEdBQXZCLENBQTJCLE9BQTNCLEVBQW9DLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixDQUFwQyxFQUFrRCxFQUFsRCxFQUFzRCxJQUF0RCxFQXpEZTs7QUE4RGYsYUFBSyxLQUFMLEdBQWEsS0FBSyxHQUFMLENBQVMsTUFBVCxDQUFnQixHQUFoQixFQUFxQixLQUFLLEtBQUwsQ0FBVyxNQUFYLEdBQW9CLEdBQXBCLEVBQXlCLE1BQTlDLENBQWI7OztBQTlEZSxZQWlFZixDQUFLLE9BQUwsQ0FBYSxNQUFiLENBQW9CLE1BQXBCLENBQTJCLEtBQUssS0FBTCxDQUEzQjs7O0FBakVlLFlBb0VmLENBQUssSUFBTCxDQUFVLE9BQVYsQ0FBa0IsTUFBbEIsQ0FBeUIsS0FBSyxLQUFMLEVBQVksT0FBTyxPQUFQLENBQWUsTUFBZixDQUFyQzs7O0FBcEVlLFlBdUVmLENBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0Isa0JBQWhCLEdBQXFDLElBQXJDOzs7QUF2RWUsWUEwRWYsQ0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixXQUFoQixDQUE0QixLQUE1QixDQUFrQyxLQUFLLFNBQUwsRUFBZ0IsS0FBSyxTQUFMLEdBQWlCLEVBQWpCLENBQWxEOzs7QUExRWUsWUE2RWYsQ0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixJQUFoQixDQUFxQixLQUFyQixDQUEyQixLQUFLLElBQUwsRUFBVyxDQUF0Qzs7QUE3RWUsWUErRWYsQ0FBSyxLQUFMLENBQVcsTUFBWCxHQUFvQixHQUFwQjs7Ozs7QUEvRWUsWUFvRmYsQ0FBSyxhQUFMLEdBQXFCLENBQXJCLENBcEZlO0FBcUZmLGFBQUssT0FBTCxDQUFhLElBQWIsQ0FBa0IsSUFBSSxRQUFRLElBQVIsQ0FBYSxLQUFLLElBQUwsQ0FBbkM7Ozs7O0FBckZlLFlBMkZYLGFBQWEsRUFBRSxVQUFVLE1BQVYsRUFBa0IsTUFBTSxNQUFOLEVBQWpDLENBM0ZXO0FBNEZmLGFBQUssU0FBTCxHQUFpQixLQUFLLEdBQUwsQ0FBUyxJQUFULENBQWMsRUFBZCxFQUFrQixFQUFsQixFQUFzQixVQUF0QixFQUFrQyxVQUFsQyxDQUFqQixDQTVGZTtBQTZGZixhQUFLLFNBQUwsQ0FBZSxhQUFmLEdBQStCLElBQS9CLENBN0ZlO0FBOEZmLGFBQUssVUFBTCxHQUFrQixLQUFLLEdBQUwsQ0FBUyxJQUFULENBQWMsS0FBSyxNQUFMLENBQVksS0FBWixHQUFvQixHQUFwQixFQUF5QixLQUFLLE1BQUwsQ0FBWSxNQUFaLEdBQXFCLEVBQXJCLEVBQXlCLE9BQWhFLEVBQXlFLFVBQXpFLENBQWxCLENBOUZlO0FBK0ZmLGFBQUssVUFBTCxDQUFnQixhQUFoQixHQUFnQyxJQUFoQyxDQS9GZTtBQWdHZixhQUFLLGlCQUFMLEdBQXlCLEtBQUssR0FBTCxDQUFTLElBQVQsQ0FBYyxLQUFLLE1BQUwsQ0FBWSxDQUFaLEdBQWdCLEVBQWhCLEVBQW9CLEtBQUssTUFBTCxDQUFZLE1BQVosR0FBcUIsRUFBckIsRUFBeUIsS0FBM0QsRUFBa0UsVUFBbEUsQ0FBekIsQ0FoR2U7QUFpR2YsYUFBSyxpQkFBTCxDQUF1QixhQUF2QixHQUF1QyxJQUF2Qzs7Ozs7QUFqR2UsWUF1R2YsQ0FBSyxNQUFMLENBQVksTUFBWixDQUFtQixLQUFLLE1BQUwsQ0FBbkIsQ0F2R2U7O0FBeUdmLFlBQUksWUFBWSxLQUFLLEtBQUwsQ0FBVyxRQUFYLENBQW9CLE1BQXBCLENBQTJCLE9BQU8sUUFBUCxDQUFnQixLQUFoQixDQUF2QyxDQXpHVztBQTBHZixrQkFBVSxNQUFWLENBQWlCLEdBQWpCLENBQXFCLEtBQUssVUFBTCxFQUFpQixJQUF0Qzs7Ozs7QUExR2UsY0FnSGYsQ0FBTyxnQkFBUCxDQUF3QixRQUF4QixFQUFrQyxZQUFNO0FBQ3BDLGtCQUFLLElBQUwsQ0FBVSxLQUFWLENBQWdCLE9BQWhCLEdBRG9DO0FBRXBDLGtCQUFLLElBQUwsQ0FBVSxNQUFWLEdBQW1CLE9BQU8sV0FBUCxDQUZpQjtBQUdwQyxrQkFBSyxJQUFMLENBQVUsS0FBVixHQUFrQixPQUFPLFVBQVAsQ0FIa0I7O0FBS3BDLGtCQUFLLFVBQUwsQ0FBZ0IsWUFBaEIsQ0FBNkIsQ0FBN0IsR0FBaUMsTUFBSyxNQUFMLENBQVksS0FBWixHQUFvQixHQUFwQixDQUxHO0FBTXBDLGtCQUFLLFVBQUwsQ0FBZ0IsWUFBaEIsQ0FBNkIsQ0FBN0IsR0FBaUMsTUFBSyxNQUFMLENBQVksTUFBWixHQUFxQixFQUFyQixDQU5HOztBQVFwQyxrQkFBSyxTQUFMLENBQWUsWUFBZixDQUE0QixDQUE1QixHQUFnQyxFQUFoQyxDQVJvQztBQVNwQyxrQkFBSyxTQUFMLENBQWUsWUFBZixDQUE0QixDQUE1QixHQUFnQyxFQUFoQyxDQVRvQztTQUFOLENBQWxDOzs7OztBQWhIZSxZQWdJZixDQUFLLGdCQUFMLEdBaEllO0tBQVg7O0FBbUlSLFlBQVEsa0JBQVc7O0FBRWYsYUFBSyxPQUFMLENBQWEsTUFBYixDQUFvQixPQUFwQixDQUE0QixLQUFLLE1BQUwsRUFBYSxLQUFLLFNBQUwsQ0FBekMsQ0FGZTtBQUdmLGFBQUssT0FBTCxDQUFhLE1BQWIsQ0FBb0IsT0FBcEIsQ0FBNEIsS0FBSyxLQUFMLEVBQVksS0FBSyxTQUFMLENBQXhDLENBSGU7QUFJZixhQUFLLE9BQUwsQ0FBYSxNQUFiLENBQW9CLE9BQXBCLENBQTRCLEtBQUssU0FBTCxFQUFnQixLQUFLLE9BQUwsRUFBYyxVQUFTLFFBQVQsRUFBbUIsTUFBbkIsRUFBMkI7QUFDakYsbUJBQU8sSUFBUCxHQURpRjtTQUEzQixFQUV2RCxJQUZILEVBRVMsSUFGVCxFQUplOztBQVFmLGFBQUssT0FBTCxDQUFhLE1BQWIsQ0FBb0IsT0FBcEIsQ0FBNEIsS0FBSyxNQUFMLEVBQWEsS0FBSyxPQUFMLEVBQWMsVUFBUyxNQUFULEVBQWlCLE1BQWpCLEVBQXlCO0FBQzVFLG1CQUFPLElBQVAsR0FENEU7QUFFNUUsb0JBQVEsR0FBUixDQUFZLGVBQVosRUFGNEU7U0FBekIsRUFHcEQsSUFISCxFQUdTLElBSFQsRUFSZTs7QUFhZixhQUFLLE9BQUwsQ0FBYSxNQUFiLENBQW9CLE9BQXBCLENBQTRCLEtBQUssS0FBTCxFQUFZLEtBQUssT0FBTCxFQUFjLFVBQVMsS0FBVCxFQUFnQixNQUFoQixFQUF3QjtBQUMxRSxrQkFBTSxNQUFOLElBQWdCLE9BQU8sTUFBUCxDQUQwRDtBQUUxRSxtQkFBTyxJQUFQLEdBRjBFO0FBRzFFLG9CQUFRLEdBQVIsQ0FBWSxlQUFaLEVBQTZCLE1BQU0sTUFBTixFQUFjLE9BQU8sTUFBUCxDQUEzQyxDQUgwRTtBQUkxRSxnQkFBSSxNQUFNLE1BQU4sSUFBZ0IsQ0FBaEIsRUFBbUI7QUFDbkIsd0JBQVEsR0FBUixDQUFZLGdCQUFaLEVBRG1CO0FBRW5CLHFCQUFLLEtBQUwsQ0FBVyxDQUFYLEdBQWUsR0FBZixDQUZtQjtBQUduQixxQkFBSyxLQUFMLENBQVcsQ0FBWCxHQUFlLEdBQWYsQ0FIbUI7QUFJbkIscUJBQUssS0FBTCxDQUFXLE1BQVgsR0FBb0IsR0FBcEIsQ0FKbUI7YUFBdkI7U0FKa0QsRUFVbkQsSUFWSCxFQVVTLElBVlQsRUFiZTs7QUEwQmYsWUFBSSxLQUFLLGlCQUFMLEVBQUosRUFBOEI7O0FBRTFCLGlCQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLFlBQWpCLENBQThCLENBQTlCLEdBQWtDLENBQUMsS0FBSyxZQUFMLENBRlQ7QUFHMUIsaUJBQUssTUFBTCxDQUFZLFVBQVosQ0FBdUIsSUFBdkIsQ0FBNEIsTUFBNUIsRUFIMEI7U0FBOUIsTUFJTyxJQUFJLEtBQUssa0JBQUwsRUFBSixFQUErQjs7QUFFbEMsaUJBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsWUFBakIsQ0FBOEIsQ0FBOUIsR0FBa0MsS0FBSyxZQUFMLENBRkE7QUFHbEMsaUJBQUssTUFBTCxDQUFZLFVBQVosQ0FBdUIsSUFBdkIsQ0FBNEIsT0FBNUIsRUFIa0M7U0FBL0IsTUFJQTs7QUFFSCxpQkFBSyxNQUFMLENBQVksSUFBWixDQUFpQixZQUFqQixDQUE4QixDQUE5QixHQUFrQyxDQUFsQyxDQUZHO0FBR0gsaUJBQUssTUFBTCxDQUFZLFVBQVosQ0FBdUIsSUFBdkIsR0FIRztBQUlILGlCQUFLLE1BQUwsQ0FBWSxLQUFaLEdBQW9CLENBQXBCLENBSkc7U0FKQTs7O0FBOUJRLFlBMENYLGNBQWMsS0FBSyxNQUFMLENBQVksSUFBWixDQUFpQixRQUFqQixDQUEwQixJQUExQjs7O0FBMUNILFlBNkNYLFdBQUosRUFBaUI7QUFDYixpQkFBSyxLQUFMLEdBQWEsQ0FBYixDQURhO0FBRWIsaUJBQUssT0FBTCxHQUFlLEtBQWYsQ0FGYTtTQUFqQjs7O0FBN0NlLFlBbURYLEtBQUssS0FBTCxHQUFhLENBQWIsSUFBa0IsS0FBSyxlQUFMLENBQXFCLENBQXJCLENBQWxCLEVBQTJDO0FBQzNDLGlCQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLFFBQWpCLENBQTBCLENBQTFCLEdBQThCLEtBQUssVUFBTCxDQURhO0FBRTNDLGlCQUFLLE9BQUwsR0FBZSxJQUFmLENBRjJDO1NBQS9DOzs7QUFuRGUsWUF5RFgsS0FBSyxPQUFMLElBQWdCLEtBQUssZUFBTCxFQUFoQixFQUF3QztBQUN4QyxpQkFBSyxLQUFMLEdBRHdDO0FBRXhDLGlCQUFLLE9BQUwsR0FBZSxLQUFmLENBRndDO1NBQTVDOztBQUtBLFlBQUksS0FBSyxJQUFMLENBQVUsS0FBVixDQUFnQixhQUFoQixDQUE4QixNQUE5QixFQUNKO0FBQ0ksaUJBQUssT0FBTCxDQUFhLEtBQUssYUFBTCxDQUFiLENBQWlDLElBQWpDLENBQXNDLEtBQUssTUFBTCxDQUF0QyxDQURKO1NBREE7O0FBS0EsYUFBSyxNQUFMLENBQVksSUFBWixDQUFpQixhQUFqQixFQUFnQyxFQUFFLEdBQUcsS0FBSyxNQUFMLENBQVksQ0FBWixFQUFlLEdBQUcsS0FBSyxNQUFMLENBQVksQ0FBWixFQUF2RCxFQW5FZTtLQUFYOzs7OztBQXlFUix1QkFBbUIsNkJBQVc7QUFDMUIsWUFBSSxXQUFXLEtBQVgsQ0FEc0I7O0FBRzFCLG1CQUFXLEtBQUssS0FBTCxDQUFXLFFBQVgsQ0FBb0IsTUFBcEIsQ0FBMkIsT0FBTyxRQUFQLENBQWdCLENBQWhCLENBQXRDLENBSDBCOztBQUsxQixlQUFPLFFBQVAsQ0FMMEI7S0FBWDs7Ozs7QUFXbkIsd0JBQW9CLDhCQUFXO0FBQzNCLFlBQUksV0FBVyxLQUFYLENBRHVCOztBQUczQixtQkFBVyxLQUFLLEtBQUwsQ0FBVyxRQUFYLENBQW9CLE1BQXBCLENBQTJCLE9BQU8sUUFBUCxDQUFnQixDQUFoQixDQUF0QyxDQUgyQjs7QUFLM0IsZUFBTyxRQUFQLENBTDJCO0tBQVg7Ozs7O0FBV3BCLHFCQUFpQix5QkFBUyxRQUFULEVBQW1CO0FBQ2hDLFlBQUksV0FBVyxLQUFYLENBRDRCOztBQUdoQyxtQkFBVyxLQUFLLEtBQUwsQ0FBVyxRQUFYLENBQW9CLFlBQXBCLENBQWlDLE9BQU8sUUFBUCxDQUFnQixDQUFoQixFQUFtQixRQUFwRCxDQUFYLENBSGdDOztBQUtoQyxlQUFPLFFBQVAsQ0FMZ0M7S0FBbkI7OztBQVNqQixxQkFBaUIsMkJBQVc7QUFDeEIsWUFBSSxXQUFXLEtBQVgsQ0FEb0I7O0FBR3hCLG1CQUFXLEtBQUssS0FBTCxDQUFXLFFBQVgsQ0FBb0IsVUFBcEIsQ0FBK0IsT0FBTyxRQUFQLENBQWdCLENBQWhCLENBQTFDLENBSHdCOztBQUt4QixlQUFPLFFBQVAsQ0FMd0I7S0FBWDs7QUFRakIsZ0JBQVksc0JBQVc7O0FBRW5CLFlBQUksS0FBSyxhQUFMLEdBQXFCLENBQXJCLEVBQ0o7QUFDSSxpQkFBSyxPQUFMLENBQWEsS0FBSyxhQUFMLENBQWIsQ0FBaUMsS0FBakMsR0FESjtTQURBLE1BS0E7QUFDSSxpQkFBSyxPQUFMLENBQWEsS0FBSyxhQUFMLENBQWIsQ0FBaUMsT0FBakMsR0FBMkMsS0FBM0MsQ0FESjtBQUVJLGlCQUFLLE9BQUwsQ0FBYSxLQUFLLGFBQUwsQ0FBYixDQUFpQyxPQUFqQyxDQUF5QyxPQUF6QyxFQUFrRCxJQUFsRCxFQUF3RCxDQUF4RCxFQUEyRCxDQUEzRCxFQUZKO0FBR0ksaUJBQUssT0FBTCxDQUFhLEtBQUssYUFBTCxDQUFiLENBQWlDLE1BQWpDLENBQXdDLFFBQXhDLEVBQWtELEtBQWxELEVBSEo7U0FMQTs7O0FBRm1CLFlBY25CLENBQUssYUFBTCxHQWRtQjs7QUFnQm5CLFlBQUksS0FBSyxhQUFMLEtBQXVCLEtBQUssT0FBTCxDQUFhLE1BQWIsRUFDM0I7QUFDSSxpQkFBSyxhQUFMLEdBQXFCLENBQXJCLENBREo7U0FEQTs7QUFLQSxhQUFLLE9BQUwsQ0FBYSxLQUFLLGFBQUwsQ0FBYixDQUFpQyxPQUFqQyxHQUEyQyxJQUEzQyxDQXJCbUI7O0FBdUJuQixhQUFLLFVBQUwsQ0FBZ0IsSUFBaEIsR0FBdUIsS0FBSyxPQUFMLENBQWEsS0FBSyxhQUFMLENBQWIsQ0FBaUMsSUFBakMsQ0F2Qko7S0FBWDs7QUEwQlosc0JBQWtCLDRCQUFZOztBQUUxQixhQUFLLE1BQUwsQ0FBWSxFQUFaLENBQWUsU0FBZixFQUEwQixLQUFLLGlCQUFMLENBQXVCLElBQXZCLENBQTRCLElBQTVCLENBQTFCOzs7QUFGMEIsWUFLMUIsQ0FBSyxNQUFMLENBQVksRUFBWixDQUFlLFlBQWYsRUFBNkIsS0FBSyxrQkFBTCxDQUF3QixJQUF4QixDQUE2QixJQUE3QixDQUE3Qjs7O0FBTDBCLFlBUTFCLENBQUssTUFBTCxDQUFZLEVBQVosQ0FBZSxZQUFmLEVBQTZCLEtBQUssV0FBTCxDQUFpQixJQUFqQixDQUFzQixJQUF0QixDQUE3Qjs7O0FBUjBCLFlBVzFCLENBQUssTUFBTCxDQUFZLEVBQVosQ0FBZSxhQUFmLEVBQThCLEtBQUssWUFBTCxDQUFrQixJQUFsQixDQUF1QixJQUF2QixDQUE5Qjs7O0FBWDBCLFlBYzFCLENBQUssTUFBTCxDQUFZLEVBQVosQ0FBZSxlQUFmLEVBQWdDLEtBQUssY0FBTCxDQUFvQixJQUFwQixDQUF5QixJQUF6QixDQUFoQyxFQWQwQjtLQUFaOzs7QUFrQmxCLHVCQUFtQiwyQkFBUyxJQUFULEVBQWU7QUFDOUIsZ0JBQVEsR0FBUixDQUFZLDRCQUFaOzs7QUFEOEIsWUFJOUIsQ0FBSyxPQUFMLENBQWEsT0FBYixDQUFxQixVQUFVLEtBQVYsRUFBaUI7QUFDbEMsa0JBQU0sTUFBTixDQUFhLElBQWIsR0FEa0M7U0FBakIsQ0FBckIsQ0FKOEI7QUFPOUIsYUFBSyxPQUFMLEdBQWUsRUFBZjs7O0FBUDhCLFlBVTlCLENBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsWUFBakIsRUFBK0I7QUFDM0Isc0JBQVUsS0FBSyxRQUFMO0FBQ1YsZUFBRyxLQUFLLE1BQUwsQ0FBWSxDQUFaO0FBQ0gsZUFBRyxLQUFLLE1BQUwsQ0FBWSxDQUFaO1NBSFAsRUFWOEI7S0FBZjs7O0FBa0JuQix3QkFBb0IsOEJBQVc7QUFDM0IsZ0JBQVEsR0FBUixDQUFZLGlDQUFaLEVBRDJCO0tBQVg7OztBQUtwQixpQkFBYSxxQkFBUyxJQUFULEVBQWU7QUFDeEIsZ0JBQVEsR0FBUixDQUFZLHVCQUFaLEVBQXFDLEtBQUssRUFBTCxDQUFyQzs7O0FBRHdCLFlBSXBCLFlBQVksS0FBSyxVQUFMLENBQWdCLEtBQUssRUFBTCxDQUE1QixDQUpvQjtBQUt4QixZQUFJLGFBQWEsS0FBSyxRQUFMLEtBQWtCLEtBQUssUUFBTCxFQUFlO0FBQzlDLG9CQUFRLEdBQVIsQ0FBWSxtQkFBWixFQUQ4QztBQUU5QyxtQkFGOEM7U0FBbEQ7OztBQUx3QixZQVdwQixrQkFBa0IsYUFBYSxNQUFiLENBQW9CLEtBQUssRUFBTCxFQUFTLEtBQUssSUFBTCxFQUFXLEtBQUssTUFBTCxFQUFhLEtBQUssQ0FBTCxFQUFRLEtBQUssQ0FBTCxDQUEvRSxDQVhvQjtBQVl4QixhQUFLLE9BQUwsQ0FBYSxJQUFiLENBQWtCLGVBQWxCLEVBWndCO0FBYXhCLGFBQUssT0FBTCxDQUFhLEtBQUssT0FBTCxDQUFhLE1BQWIsR0FBc0IsQ0FBdEIsQ0FBYixDQUFzQyxNQUF0QyxDQUE2QyxVQUE3QyxDQUF3RCxHQUF4RCxDQUE0RCxNQUE1RCxFQUFvRSxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsQ0FBcEUsRUFBa0YsRUFBbEYsRUFBc0YsSUFBdEYsRUFid0I7QUFjeEIsYUFBSyxPQUFMLENBQWEsS0FBSyxPQUFMLENBQWEsTUFBYixHQUFzQixDQUF0QixDQUFiLENBQXNDLE1BQXRDLENBQTZDLFVBQTdDLENBQXdELEdBQXhELENBQTRELE9BQTVELEVBQXFFLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixDQUFyRSxFQUFtRixFQUFuRixFQUF1RixJQUF2RixFQWR3QjtLQUFmOzs7QUFrQmIsa0JBQWMsc0JBQVMsSUFBVCxFQUFlO0FBQ3pCLFlBQUksYUFBYSxLQUFLLFVBQUwsQ0FBZ0IsS0FBSyxFQUFMLENBQTdCOzs7QUFEcUIsWUFJckIsQ0FBRSxVQUFGLEVBQWM7QUFDZCxtQkFEYztTQUFsQjs7O0FBSnlCLGtCQVN6QixDQUFXLE1BQVgsQ0FBa0IsQ0FBbEIsR0FBc0IsS0FBSyxDQUFMLENBVEc7QUFVekIsbUJBQVcsTUFBWCxDQUFrQixDQUFsQixHQUFzQixLQUFLLENBQUwsQ0FWRzs7QUFZekIsWUFBSSxXQUFXLE1BQVgsQ0FBa0IsQ0FBbEIsR0FBc0IsV0FBVyxZQUFYLENBQXdCLENBQXhCLEVBQTJCO0FBQ2pELHVCQUFXLE1BQVgsQ0FBa0IsVUFBbEIsQ0FBNkIsSUFBN0IsQ0FBa0MsT0FBbEMsRUFEaUQ7U0FBckQsTUFHSyxJQUFJLFdBQVcsTUFBWCxDQUFrQixDQUFsQixHQUFzQixXQUFXLFlBQVgsQ0FBd0IsQ0FBeEIsRUFDL0I7QUFDSSx1QkFBVyxNQUFYLENBQWtCLFVBQWxCLENBQTZCLElBQTdCLENBQWtDLE1BQWxDLEVBREo7U0FESyxNQUtMO0FBQ0ksdUJBQVcsTUFBWCxDQUFrQixVQUFsQixDQUE2QixJQUE3QixHQURKO0FBRUksdUJBQVcsTUFBWCxDQUFrQixLQUFsQixHQUEwQixDQUExQixDQUZKO1NBTEs7O0FBVUwsbUJBQVcsWUFBWCxDQUF3QixDQUF4QixHQUE0QixXQUFXLE1BQVgsQ0FBa0IsQ0FBbEIsQ0F6Qkg7QUEwQnpCLG1CQUFXLFlBQVgsQ0FBd0IsQ0FBeEIsR0FBNEIsV0FBVyxNQUFYLENBQWtCLENBQWxCLENBMUJIO0tBQWY7OztBQThCZCxvQkFBZ0Isd0JBQVMsSUFBVCxFQUFlO0FBQzNCLFlBQUksZUFBZSxLQUFLLFVBQUwsQ0FBZ0IsS0FBSyxFQUFMLENBQS9COzs7QUFEdUIsWUFJdkIsQ0FBQyxZQUFELEVBQWU7QUFDZixvQkFBUSxHQUFSLENBQVksb0JBQVosRUFBa0MsS0FBSyxFQUFMLENBQWxDLENBRGU7QUFFZixtQkFGZTtTQUFuQjs7QUFLQSxxQkFBYSxNQUFiLENBQW9CLElBQXBCOzs7QUFUMkIsWUFZM0IsQ0FBSyxPQUFMLENBQWEsTUFBYixDQUFvQixLQUFLLE9BQUwsQ0FBYSxPQUFiLENBQXFCLFlBQXJCLENBQXBCLEVBQXdELENBQXhELEVBWjJCO0tBQWY7OztBQWdCaEIsZ0JBQVksb0JBQVMsRUFBVCxFQUFhO0FBQ3JCLGFBQUssSUFBSSxJQUFJLENBQUosRUFBTyxJQUFJLEtBQUssT0FBTCxDQUFhLE1BQWIsRUFBcUIsR0FBekMsRUFBOEM7QUFDMUMsZ0JBQUksS0FBSyxPQUFMLENBQWEsQ0FBYixFQUFnQixNQUFoQixDQUF1QixJQUF2QixLQUFnQyxFQUFoQyxFQUFvQztBQUNwQyx1QkFBTyxLQUFLLE9BQUwsQ0FBYSxDQUFiLENBQVAsQ0FEb0M7YUFBeEM7U0FESjs7QUFNQSxlQUFPLEtBQVAsQ0FQcUI7S0FBYjtDQTNZaEI7O0FBc1pBLEtBQUssS0FBTCxDQUFXLEdBQVgsQ0FBZSxNQUFmLEVBQXVCLGVBQXZCLEVBQXdDLElBQXhDOzs7QUNyYkE7O0FBRUEsSUFBSSxTQUFTLFNBQVQsTUFBUyxDQUFVLElBQVYsRUFBZ0IsR0FBaEIsRUFBcUI7QUFDOUIsV0FBTyxNQUFQLENBQWMsSUFBZCxDQUFtQixJQUFuQixFQUF5QixJQUF6QixFQUErQixDQUEvQixFQUFrQyxDQUFsQyxFQUFxQyxHQUFyQyxFQUQ4Qjs7QUFHOUIsU0FBSyxPQUFMLENBQWEsV0FBYixDQUF5QixTQUF6QixHQUFxQyxLQUFLLFVBQUwsQ0FBZ0IsT0FBaEIsQ0FIUDs7QUFLOUIsU0FBSyxNQUFMLENBQVksR0FBWixDQUFnQixHQUFoQixFQUw4Qjs7QUFPOUIsU0FBSyxnQkFBTCxHQUF3QixJQUF4QixDQVA4QjtBQVE5QixTQUFLLGVBQUwsR0FBdUIsSUFBdkIsQ0FSOEI7QUFTOUIsU0FBSyxNQUFMLEdBQWMsS0FBZCxDQVQ4Qjs7QUFXOUIsU0FBSyxRQUFMLEdBQWdCLEtBQWhCLENBWDhCO0FBWTlCLFNBQUssVUFBTCxHQUFrQixDQUFsQixDQVo4QjtDQUFyQjs7QUFnQmIsT0FBTyxTQUFQLEdBQW1CLE9BQU8sTUFBUCxDQUFjLE9BQU8sTUFBUCxDQUFjLFNBQWQsQ0FBakM7QUFDQSxPQUFPLFNBQVAsQ0FBaUIsV0FBakIsR0FBK0IsTUFBL0I7O0FBRUEsT0FBTyxTQUFQLENBQWlCLElBQWpCLEdBQXdCLFVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsS0FBaEIsRUFBdUIsS0FBdkIsRUFBOEIsRUFBOUIsRUFBa0MsRUFBbEMsRUFBc0M7QUFDMUQsU0FBSyxNQUFNLENBQU4sQ0FEcUQ7QUFFMUQsU0FBSyxNQUFNLENBQU4sQ0FGcUQ7QUFHMUQsU0FBSyxLQUFMLENBQVcsQ0FBWCxFQUFjLENBQWQsRUFIMEQ7QUFJMUQsU0FBSyxLQUFMLENBQVcsR0FBWCxDQUFlLENBQWYsRUFKMEQ7O0FBTTFELFNBQUssSUFBTCxDQUFVLE9BQVYsQ0FBa0IsTUFBbEIsQ0FBeUIsYUFBekIsQ0FBdUMsSUFBdkMsRUFBNkMsS0FBN0MsRUFOMEQ7Q0FBdEM7O0FBU3hCLE9BQU8sU0FBUCxDQUFpQixNQUFqQixHQUEwQixZQUFZO0FBQ2xDLFFBQUksS0FBSyxRQUFMLEVBQ0o7QUFDSSxhQUFLLFFBQUwsR0FBZ0IsS0FBSyxLQUFMLENBQVcsS0FBSyxJQUFMLENBQVUsUUFBVixDQUFtQixDQUFuQixFQUFzQixLQUFLLElBQUwsQ0FBVSxRQUFWLENBQW1CLENBQW5CLENBQWpELENBREo7S0FEQTs7QUFLQSxRQUFJLEtBQUssVUFBTCxHQUFrQixDQUFsQixFQUNKO0FBQ0ksYUFBSyxLQUFMLENBQVcsQ0FBWCxJQUFnQixLQUFLLFVBQUwsQ0FEcEI7QUFFSSxhQUFLLEtBQUwsQ0FBVyxDQUFYLElBQWdCLEtBQUssVUFBTCxDQUZwQjtLQURBO0NBTnNCOztBQWExQixPQUFPLE9BQVAsR0FBaUIsTUFBakI7OztBQzNDQTs7QUFFQSxPQUFPLE9BQVAsR0FBaUIsU0FBUyxhQUFULEdBQXlCO0FBQ3RDLE9BQUksS0FBSyxTQUFMLEVBQUssR0FBVztBQUNqQixhQUFPLENBQUMsQ0FBRSxJQUFFLEtBQUssTUFBTCxFQUFGLENBQUQsR0FBa0IsT0FBbEIsR0FBMkIsQ0FBNUIsQ0FBRCxDQUFnQyxRQUFoQyxDQUF5QyxFQUF6QyxFQUE2QyxTQUE3QyxDQUF1RCxDQUF2RCxDQUFQLENBRGlCO0lBQVgsQ0FENkI7O0FBS3RDLFVBQVEsT0FBSyxJQUFMLEdBQVUsR0FBVixHQUFjLElBQWQsR0FBbUIsR0FBbkIsR0FBdUIsSUFBdkIsR0FBNEIsR0FBNUIsR0FBZ0MsSUFBaEMsR0FBcUMsR0FBckMsR0FBeUMsSUFBekMsR0FBOEMsSUFBOUMsR0FBbUQsSUFBbkQsQ0FMOEI7Q0FBekI7OztBQ0ZqQjs7QUFFQSxJQUFJLGVBQWU7QUFDZixrQkFBYztBQUNWLFdBQUcsQ0FBSDtBQUNBLFdBQUcsQ0FBSDtLQUZKO0NBREE7O0FBT0osYUFBYSxNQUFiLEdBQXNCLFlBQVk7QUFDOUIsUUFBSSxLQUFLLE1BQUwsQ0FBWSxDQUFaLEtBQWtCLEtBQUssWUFBTCxDQUFrQixDQUFsQixJQUF1QixLQUFLLE1BQUwsQ0FBWSxDQUFaLEtBQWtCLEtBQUssWUFBTCxDQUFrQixDQUFsQixFQUFxQjtBQUNoRixhQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLE1BQWpCLEVBRGdGO0tBQXBGLE1BRU87QUFDSCxhQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLE1BQWpCLEVBREc7S0FGUDs7QUFNQSxTQUFLLFlBQUwsQ0FBa0IsQ0FBbEIsR0FBc0IsS0FBSyxNQUFMLENBQVksQ0FBWixDQVBRO0FBUTlCLFNBQUssWUFBTCxDQUFrQixDQUFsQixHQUFzQixLQUFLLE1BQUwsQ0FBWSxDQUFaLENBUlE7Q0FBWjs7QUFXdEIsT0FBTyxPQUFQLEdBQWlCO0FBQ2IsWUFBUSxnQkFBUyxLQUFULEVBQWdCLElBQWhCLEVBQXNCLE1BQXRCLEVBQThCLE1BQTlCLEVBQXNDLE1BQXRDLEVBQThDO0FBQ2xELFlBQUksa0JBQWtCO0FBQ2xCLGVBQUcsTUFBSDtBQUNBLGVBQUcsTUFBSDtBQUNBLGtCQUFNLElBQU47QUFDQSxvQkFBUSxHQUFSO0FBQ0Esb0JBQVEsTUFBUjtBQUNBLG1CQUFPLElBQVA7QUFDQSwwQkFBYztBQUNWLG1CQUFHLE1BQUg7QUFDQSxtQkFBRyxNQUFIO2FBRko7U0FQQSxDQUQ4Qzs7QUFjbEQsMEJBQWtCLE9BQU8sTUFBUCxDQUFjLFlBQWQsRUFBNEIsZUFBNUIsQ0FBbEI7OztBQWRrRCx1QkFpQmxELENBQWdCLE1BQWhCLEdBQXlCLEtBQUssR0FBTCxDQUFTLE1BQVQsQ0FBZ0IsTUFBaEIsRUFBd0IsTUFBeEIsRUFBZ0MsT0FBaEMsQ0FBekI7OztBQWpCa0QsdUJBb0JsRCxDQUFnQixNQUFoQixDQUF1QixVQUF2QixDQUFrQyxHQUFsQyxDQUFzQyxNQUF0QyxFQUE4QyxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsQ0FBOUMsRUFBNEQsRUFBNUQsRUFBZ0UsSUFBaEUsRUFwQmtEO0FBcUJsRCx3QkFBZ0IsTUFBaEIsQ0FBdUIsVUFBdkIsQ0FBa0MsR0FBbEMsQ0FBc0MsT0FBdEMsRUFBK0MsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLENBQS9DLEVBQTZELEVBQTdELEVBQWlFLElBQWpFLEVBckJrRDs7QUF1QmxELHdCQUFnQixNQUFoQixDQUF1QixJQUF2QixHQUE4QixNQUFNLFFBQU4sRUFBOUIsQ0F2QmtEOztBQXlCbEQsZUFBTyxlQUFQLENBekJrRDtLQUE5QztDQURaOzs7OztBQ3BCQSxPQUFPLE9BQVAsR0FBaUI7QUFDYixlQUFXO0FBQ1AsZ0JBQVEsU0FBUjtBQUNBLGtCQUFVLEdBQVY7QUFDQSx3QkFBZ0IsRUFBaEI7QUFDQSxnQkFBUSxFQUFSO0FBQ0Esc0JBQWMsRUFBZDtBQUNBLGlCQUFTLEdBQVQ7QUFDQSx1QkFBZSxDQUFmO0FBQ0EsdUJBQWUsQ0FBZjtBQUNBLGdCQUFRLENBQVI7QUFDQSx1QkFBZSxDQUFmO0tBVko7QUFZQSxvQkFBZ0I7QUFDWixnQkFBUSxlQUFSO0FBQ0Esa0JBQVUsR0FBVjtBQUNBLHdCQUFnQixFQUFoQjtBQUNBLGdCQUFRLENBQVI7QUFDQSxzQkFBYyxFQUFkO0FBQ0EsaUJBQVMsR0FBVDtBQUNBLHVCQUFlLENBQWY7QUFDQSx1QkFBZSxDQUFmO0FBQ0EsZ0JBQVEsQ0FBUjtBQUNBLHVCQUFlLENBQWY7S0FWSjtBQVlBLGFBQVM7QUFDTCxnQkFBUSxRQUFSO0FBQ0Esa0JBQVUsR0FBVjtBQUNBLHdCQUFnQixDQUFoQjtBQUNBLGdCQUFRLEVBQVI7QUFDQSxzQkFBYyxHQUFkO0FBQ0EsaUJBQVMsR0FBVDtBQUNBLHVCQUFlLENBQWY7QUFDQSx1QkFBZSxDQUFmO0FBQ0EsZ0JBQVEsQ0FBUjtBQUNBLHVCQUFlLENBQWY7S0FWSjtBQVlBLFlBQVE7QUFDSixnQkFBUSxPQUFSO0FBQ0Esa0JBQVUsS0FBVjtBQUNBLHdCQUFnQixJQUFoQjtBQUNBLGdCQUFRLElBQVI7QUFDQSxzQkFBYyxLQUFkO0FBQ0EsaUJBQVMsS0FBVDtBQUNBLHVCQUFlLEdBQWY7QUFDQSx1QkFBZSxHQUFmO0FBQ0EsZ0JBQVEsR0FBUjtBQUNBLHVCQUFlLEdBQWY7S0FWSjtBQVlBLGdCQUFZO0FBQ1IsZ0JBQVEsS0FBUjtBQUNBLGtCQUFVLElBQVY7QUFDQSx3QkFBZ0IsR0FBaEI7QUFDQSxnQkFBUSxJQUFSO0FBQ0Esc0JBQWMsS0FBZDtBQUNBLGlCQUFTLEtBQVQ7QUFDQSx1QkFBZSxHQUFmO0FBQ0EsdUJBQWUsR0FBZjtBQUNBLGdCQUFRLEdBQVI7QUFDQSx1QkFBZSxHQUFmO0tBVko7QUFZQSxjQUFVO0FBQ04sZ0JBQVEsU0FBUjtBQUNBLGtCQUFVLEtBQVY7QUFDQSx3QkFBZ0IsSUFBaEI7QUFDQSxnQkFBUSxHQUFSO0FBQ0Esc0JBQWMsS0FBZDtBQUNBLGlCQUFTLEtBQVQ7QUFDQSx1QkFBZSxHQUFmO0FBQ0EsdUJBQWUsR0FBZjtBQUNBLGdCQUFRLElBQVI7QUFDQSx1QkFBZSxHQUFmO0tBVko7QUFZQSxlQUFXO0FBQ1AsZ0JBQVEsVUFBUjtBQUNBLGtCQUFVLEtBQVY7QUFDQSx3QkFBZ0IsSUFBaEI7QUFDQSxnQkFBUSxHQUFSO0FBQ0Esc0JBQWMsSUFBZDtBQUNBLGlCQUFTLEtBQVQ7QUFDQSx1QkFBZSxHQUFmO0FBQ0EsdUJBQWUsR0FBZjtBQUNBLGdCQUFRLElBQVI7QUFDQSx1QkFBZSxHQUFmO0tBVko7QUFZQSxXQUFPO0FBQ0gsa0JBQVUsTUFBVjtBQUNBLHdCQUFnQixDQUFoQjtBQUNBLGdCQUFRLENBQVI7QUFDQSxzQkFBYyxHQUFkO0FBQ0EsaUJBQVMsR0FBVDtBQUNBLHVCQUFlLENBQWY7QUFDQSx1QkFBZSxDQUFmO0FBQ0EsZ0JBQVEsRUFBUjtBQUNBLHVCQUFlLENBQWY7S0FUSjtBQVdBLG9CQUFnQjtBQUNaLGtCQUFVLEdBQVY7QUFDQSx3QkFBZ0IsR0FBaEI7QUFDQSxnQkFBUSxFQUFSO0FBQ0Esc0JBQWMsR0FBZDtBQUNBLGlCQUFTLEtBQVQ7QUFDQSx1QkFBZSxHQUFmO0FBQ0EsdUJBQWUsR0FBZjtBQUNBLGdCQUFRLElBQVI7QUFDQSx1QkFBZSxHQUFmO0tBVEo7QUFXQSxpQkFBYTtBQUNULGtCQUFVLEtBQVY7QUFDQSx3QkFBZ0IsR0FBaEI7QUFDQSxnQkFBUSxJQUFSO0FBQ0Esc0JBQWMsS0FBZDtBQUNBLGlCQUFTLEtBQVQ7QUFDQSx1QkFBZSxHQUFmO0FBQ0EsdUJBQWUsR0FBZjtBQUNBLGdCQUFRLEdBQVI7QUFDQSx1QkFBZSxHQUFmO0tBVEo7QUFXQSxxQkFBaUI7QUFDYixrQkFBVSxJQUFWO0FBQ0Esd0JBQWdCLEdBQWhCO0FBQ0EsZ0JBQVEsS0FBUjtBQUNBLHNCQUFjLEtBQWQ7QUFDQSxpQkFBUyxLQUFUO0FBQ0EsdUJBQWUsR0FBZjtBQUNBLHVCQUFlLElBQWY7QUFDQSxnQkFBUSxHQUFSO0FBQ0EsdUJBQWUsR0FBZjtLQVRKO0FBV0EsY0FBVTtBQUNOLGtCQUFVLE1BQVY7QUFDQSx3QkFBZ0IsR0FBaEI7QUFDQSxnQkFBUSxLQUFSO0FBQ0Esc0JBQWMsR0FBZDtBQUNBLGlCQUFTLEtBQVQ7QUFDQSx1QkFBZSxHQUFmO0FBQ0EsdUJBQWUsR0FBZjtBQUNBLGdCQUFRLEdBQVI7QUFDQSx1QkFBZSxHQUFmO0tBVEo7QUFXQSxpQkFBYTtBQUNULGtCQUFVLE1BQVY7QUFDQSx3QkFBZ0IsSUFBaEI7QUFDQSxnQkFBUSxHQUFSO0FBQ0Esc0JBQWMsSUFBZDtBQUNBLGlCQUFTLEtBQVQ7QUFDQSx1QkFBZSxHQUFmO0FBQ0EsdUJBQWUsR0FBZjtBQUNBLGdCQUFRLEdBQVI7QUFDQSx1QkFBZSxHQUFmO0tBVEo7QUFXQSxxQkFBaUI7QUFDYixrQkFBVSxLQUFWO0FBQ0Esd0JBQWdCLElBQWhCO0FBQ0EsZ0JBQVEsR0FBUjtBQUNBLHNCQUFjLElBQWQ7QUFDQSxpQkFBUyxLQUFUO0FBQ0EsdUJBQWUsR0FBZjtBQUNBLHVCQUFlLEdBQWY7QUFDQSxnQkFBUSxHQUFSO0FBQ0EsdUJBQWUsR0FBZjtLQVRKO0FBV0Esb0JBQWdCO0FBQ1osa0JBQVUsUUFBVjtBQUNBLHdCQUFnQixHQUFoQjtBQUNBLGdCQUFRLEdBQVI7QUFDQSxzQkFBYyxHQUFkO0FBQ0EsaUJBQVMsSUFBVDtBQUNBLHVCQUFlLElBQWY7QUFDQSx1QkFBZSxHQUFmO0FBQ0EsZ0JBQVEsR0FBUjtBQUNBLHVCQUFlLEdBQWY7S0FUSjtBQVdBLGdCQUFZO0FBQ1Isa0JBQVUsTUFBVjtBQUNBLHdCQUFnQixHQUFoQjtBQUNBLGdCQUFRLElBQVI7QUFDQSxzQkFBYyxJQUFkO0FBQ0EsaUJBQVMsSUFBVDtBQUNBLHVCQUFlLElBQWY7QUFDQSx1QkFBZSxHQUFmO0FBQ0EsZ0JBQVEsR0FBUjtBQUNBLHVCQUFlLEdBQWY7S0FUSjtBQVdBLGVBQVc7QUFDUCxrQkFBVSxRQUFWO0FBQ0Esd0JBQWdCLElBQWhCO0FBQ0EsZ0JBQVEsR0FBUjtBQUNBLHNCQUFjLEtBQWQ7QUFDQSxpQkFBUyxLQUFUO0FBQ0EsdUJBQWUsSUFBZjtBQUNBLHVCQUFlLEdBQWY7QUFDQSxnQkFBUSxJQUFSO0FBQ0EsdUJBQWUsR0FBZjtLQVRKO0FBV0EsYUFBUztBQUNMLGtCQUFVLE9BQVY7QUFDQSx3QkFBZ0IsR0FBaEI7QUFDQSxnQkFBUSxHQUFSO0FBQ0Esc0JBQWMsR0FBZDtBQUNBLGlCQUFTLElBQVQ7QUFDQSx1QkFBZSxHQUFmO0FBQ0EsdUJBQWUsR0FBZjtBQUNBLGdCQUFRLEdBQVI7QUFDQSx1QkFBZSxHQUFmO0tBVEo7QUFXQSxlQUFXO0FBQ1Asa0JBQVUsUUFBVjtBQUNBLHdCQUFnQixJQUFoQjtBQUNBLGdCQUFRLEdBQVI7QUFDQSxzQkFBYyxJQUFkO0FBQ0EsaUJBQVMsSUFBVDtBQUNBLHVCQUFlLEdBQWY7QUFDQSx1QkFBZSxHQUFmO0FBQ0EsZ0JBQVEsR0FBUjtBQUNBLHVCQUFlLEdBQWY7S0FUSjtBQVdBLHNCQUFrQjtBQUNkLGtCQUFVLElBQVY7QUFDQSx3QkFBZ0IsR0FBaEI7QUFDQSxnQkFBUSxLQUFSO0FBQ0Esc0JBQWMsS0FBZDtBQUNBLGlCQUFTLEtBQVQ7QUFDQSx1QkFBZSxHQUFmO0FBQ0EsdUJBQWUsR0FBZjtBQUNBLGdCQUFRLEdBQVI7QUFDQSx1QkFBZSxHQUFmO0tBVEo7Q0F6Tko7OztBQ0FBOztBQUVBLElBQUksU0FBUyxRQUFRLFdBQVIsQ0FBVDs7QUFFSixJQUFJLE9BQU8sU0FBUCxJQUFPLENBQVUsSUFBVixFQUFnQjtBQUN2QixXQUFPLEtBQVAsQ0FBYSxJQUFiLENBQWtCLElBQWxCLEVBQXdCLElBQXhCLEVBQThCLEtBQUssS0FBTCxFQUFZLE9BQTFDLEVBQW1ELEtBQW5ELEVBQTBELElBQTFELEVBQWdFLE9BQU8sT0FBUCxDQUFlLE1BQWYsQ0FBaEUsQ0FEdUI7O0FBR3ZCLFNBQUssTUFBTCxHQUFjLEVBQWQsQ0FIdUI7QUFJdkIsU0FBSyxRQUFMLEdBQWdCLENBQWhCLENBSnVCO0FBS3ZCLFNBQUssV0FBTCxHQUFtQixJQUFuQjs7QUFMdUIsUUFPdkIsQ0FBSyxRQUFMLEdBQWdCLFVBQWhCLENBUHVCOztBQVN2QixTQUFLLElBQUksSUFBSSxDQUFKLEVBQU8sSUFBSSxFQUFKLEVBQVEsR0FBeEIsRUFDQTtBQUNJLFlBQUksU0FBUyxJQUFJLE1BQUosQ0FBVyxLQUFLLElBQUwsRUFBVyxTQUF0QixDQUFULENBRFI7QUFFSSxlQUFPLE1BQVAsR0FBZ0IsRUFBaEIsQ0FGSjtBQUdJLGFBQUssR0FBTCxDQUFTLE1BQVQsRUFBaUIsSUFBakIsRUFISjtLQURBOztBQU9BLFdBQU8sSUFBUCxDQWhCdUI7Q0FBaEI7O0FBbUJYLEtBQUssU0FBTCxHQUFpQixPQUFPLE1BQVAsQ0FBYyxPQUFPLEtBQVAsQ0FBYSxTQUFiLENBQS9CO0FBQ0EsS0FBSyxTQUFMLENBQWUsV0FBZixHQUE2QixJQUE3Qjs7QUFFQSxLQUFLLFNBQUwsQ0FBZSxJQUFmLEdBQXNCLFVBQVUsTUFBVixFQUFrQjs7QUFFcEMsUUFBSSxLQUFLLElBQUwsQ0FBVSxJQUFWLENBQWUsSUFBZixHQUFzQixLQUFLLFFBQUwsRUFDdEIsT0FESjs7QUFHQSxRQUFJLElBQUksT0FBTyxDQUFQLEdBQVcsRUFBWCxDQUw0QjtBQU1wQyxRQUFJLElBQUksT0FBTyxDQUFQLEdBQVcsRUFBWCxDQU40Qjs7QUFRcEMsU0FBSyxjQUFMLENBQW9CLEtBQXBCLEVBQTJCLElBQTNCLENBQWdDLENBQWhDLEVBQW1DLENBQW5DLEVBQXNDLENBQXRDLEVBQXlDLEtBQUssV0FBTCxFQUFrQixDQUEzRCxFQUE4RCxDQUE5RCxFQVJvQztBQVNwQyxTQUFLLE1BQUwsQ0FBWSxVQUFaLEVBQXdCLElBQXhCLEVBVG9DOztBQVdwQyxTQUFLLFFBQUwsR0FBZ0IsS0FBSyxJQUFMLENBQVUsSUFBVixDQUFlLElBQWYsR0FBc0IsS0FBSyxRQUFMLENBWEY7Q0FBbEI7O0FBY3RCLE9BQU8sT0FBUCxHQUFpQixJQUFqQjs7O0FDeENBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF3QkEsT0FBTyxPQUFQLEdBQWlCO0FBQ2IsVUFBUSxRQUFRLFFBQVIsQ0FBUjtDQURKOzs7QUN4QkE7O0FBRUEsSUFBSSxVQUFVLEVBQVY7O0FBRUosUUFBUSxNQUFSLEdBQWlCLFVBQVMsS0FBVCxFQUFnQjtBQUM3QixTQUFLLEtBQUwsR0FBYSxLQUFiLENBRDZCOztBQUc3QixTQUFLLGVBQUwsR0FINkI7QUFJN0IsU0FBSyxlQUFMLEdBSjZCO0FBSzdCLFNBQUssWUFBTCxHQUw2Qjs7QUFPN0IsU0FBSyxLQUFMLENBQVcsU0FBWCxDQUFxQixNQUFyQixDQUE0QixnQkFBNUIsRUFBOEMsSUFBOUMsRUFQNkI7QUFRN0IsU0FBSyxLQUFMLENBQVcsU0FBWCxDQUFxQixNQUFyQixDQUE0QixtQkFBNUIsRUFBaUQsS0FBakQsRUFSNkI7Q0FBaEI7O0FBV2pCLFFBQVEsWUFBUixHQUF1QixZQUFXOzs7QUFDOUIsUUFBSSxTQUFTOzs7O0FBSVQsTUFBRSxJQUFJLENBQUosRUFBTyxHQUFHLENBQUgsRUFBTSxHQUFHLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsS0FBaEIsQ0FBc0IsTUFBdEIsR0FBK0IsR0FBL0IsRUFBb0MsT0FBTyxHQUFQLEVBQVksUUFBUSxFQUFSLEVBSnpEO0FBS1QsTUFBRSxJQUFJLENBQUosRUFBTyxHQUFHLENBQUgsRUFBTSxHQUFHLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsS0FBaEIsQ0FBc0IsTUFBdEIsR0FBK0IsR0FBL0IsRUFBb0MsT0FBTyxHQUFQLEVBQVksUUFBUSxFQUFSLEVBTHpEOztBQU9ULE1BQUUsSUFBSSxDQUFKLEVBQU8sR0FBRyxJQUFILEVBQVMsR0FBRyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEtBQWhCLENBQXNCLE1BQXRCLEdBQStCLEdBQS9CLEVBQW9DLE9BQU8sR0FBUCxFQUFZLFFBQVEsRUFBUixFQVA1RDtBQVFULE1BQUUsSUFBSSxDQUFKLEVBQU8sR0FBRyxJQUFILEVBQVMsR0FBRyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEtBQWhCLENBQXNCLE1BQXRCLEdBQStCLEdBQS9CLEVBQW9DLE9BQU8sR0FBUCxFQUFZLFFBQVEsRUFBUixFQVI1RDs7O0FBV1QsTUFBRSxJQUFJLENBQUosRUFBTyxHQUFHLENBQUgsRUFBTSxHQUFHLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsS0FBaEIsQ0FBc0IsTUFBdEIsR0FBK0IsR0FBL0IsRUFBb0MsT0FBTyxHQUFQLEVBQVksUUFBUSxHQUFSLEVBWHpEO0FBWVQsTUFBRSxJQUFJLENBQUosRUFBTyxHQUFHLEdBQUgsRUFBUSxHQUFHLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsS0FBaEIsQ0FBc0IsTUFBdEIsR0FBK0IsR0FBL0IsRUFBb0MsT0FBTyxHQUFQLEVBQVksUUFBUSxHQUFSLEVBWjNEO0FBYVQsTUFBRSxJQUFJLENBQUosRUFBTyxHQUFHLElBQUgsRUFBUyxHQUFHLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsS0FBaEIsQ0FBc0IsTUFBdEIsR0FBK0IsR0FBL0IsRUFBb0MsT0FBTyxJQUFQLEVBQWEsUUFBUSxHQUFSLEVBYjdEO0FBY1QsTUFBRSxJQUFJLENBQUosRUFBTyxHQUFHLElBQUgsRUFBUyxHQUFHLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsS0FBaEIsQ0FBc0IsTUFBdEIsR0FBK0IsR0FBL0IsRUFBb0MsT0FBTyxHQUFQLEVBQVksUUFBUSxHQUFSLEVBZDVEO0FBZVQsTUFBRSxJQUFJLENBQUosRUFBTyxHQUFHLElBQUgsRUFBUyxHQUFHLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsS0FBaEIsQ0FBc0IsTUFBdEIsR0FBK0IsR0FBL0IsRUFBb0MsT0FBTyxHQUFQLEVBQVksUUFBUSxHQUFSLEVBZjVEOzs7QUFrQlQsTUFBRSxJQUFJLEVBQUosRUFBUSxHQUFHLEdBQUgsRUFBUSxHQUFHLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsS0FBaEIsQ0FBc0IsTUFBdEIsR0FBK0IsR0FBL0IsRUFBb0MsT0FBTyxHQUFQLEVBQVksUUFBUSxFQUFSLEVBbEI1RCxFQW1CVCxFQUFFLElBQUksRUFBSixFQUFRLEdBQUcsSUFBSCxFQUFTLEdBQUcsS0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixLQUFoQixDQUFzQixNQUF0QixHQUErQixHQUEvQixFQUFvQyxPQUFPLEdBQVAsRUFBWSxRQUFRLEVBQVIsRUFuQjdELEVBb0JULEVBQUUsSUFBSSxFQUFKLEVBQVEsR0FBRyxHQUFILEVBQVEsR0FBRyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEtBQWhCLENBQXNCLE1BQXRCLEdBQStCLEdBQS9CLEVBQW9DLE9BQU8sR0FBUCxFQUFZLFFBQVEsRUFBUixFQXBCNUQsRUFxQlQsRUFBRSxJQUFJLEVBQUosRUFBUSxHQUFHLElBQUgsRUFBUyxHQUFHLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsS0FBaEIsQ0FBc0IsTUFBdEIsR0FBK0IsR0FBL0IsRUFBb0MsT0FBTyxHQUFQLEVBQVksUUFBUSxHQUFSLEVBckI3RCxFQXNCVCxFQUFFLElBQUksRUFBSixFQUFRLEdBQUcsSUFBSCxFQUFTLEdBQUcsS0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixLQUFoQixDQUFzQixNQUF0QixHQUErQixHQUEvQixFQUFvQyxPQUFPLEdBQVAsRUFBWSxRQUFRLEVBQVIsRUF0QjdELEVBdUJULEVBQUUsSUFBSSxFQUFKLEVBQVEsR0FBRyxJQUFILEVBQVMsR0FBRyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEtBQWhCLENBQXNCLE1BQXRCLEdBQStCLEdBQS9CLEVBQW9DLE9BQU8sR0FBUCxFQUFZLFFBQVEsRUFBUixFQXZCN0QsRUF3QlQsRUFBRSxJQUFJLEVBQUosRUFBUSxHQUFHLElBQUgsRUFBUyxHQUFHLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsS0FBaEIsQ0FBc0IsTUFBdEIsR0FBK0IsR0FBL0IsRUFBb0MsT0FBTyxHQUFQLEVBQVksUUFBUSxFQUFSLEVBeEI3RCxDQUFULENBRDBCOztBQTZCOUIsV0FBTyxPQUFQLENBQWUsVUFBQyxLQUFELEVBQVc7O0FBRXRCLFlBQUksV0FBVyxNQUFLLEtBQUwsQ0FBVyxTQUFYLENBQXFCLE1BQXJCLENBQTRCLE1BQU0sQ0FBTixFQUFTLE1BQU0sQ0FBTixDQUFoRCxDQUZrQjtBQUd0QixpQkFBUyxNQUFULEdBQWtCLE1BQU0sTUFBTixDQUhJO0FBSXRCLGlCQUFTLEtBQVQsR0FBaUIsTUFBTSxLQUFOOzs7Ozs7O0FBSkssS0FBWCxDQUFmLENBN0I4QjtDQUFYOztBQTJDdkIsUUFBUSxlQUFSLEdBQTBCLFlBQVc7QUFDakMsU0FBSyxLQUFMLENBQVcsR0FBWCxDQUFlLFVBQWYsQ0FBMEIsQ0FBMUIsRUFBNkIsS0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixLQUFoQixDQUFzQixNQUF0QixHQUErQixJQUEvQixFQUFxQyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEtBQWhCLENBQXNCLEtBQXRCLEVBQTZCLElBQS9GLEVBQXFHLFdBQXJHLEVBRGlDO0NBQVg7O0FBSTFCLFFBQVEsZUFBUixHQUEwQixZQUFXO0FBQ2pDLFNBQUssS0FBTCxDQUFXLFNBQVgsR0FBdUIsS0FBSyxLQUFMLENBQVcsR0FBWCxDQUFlLEtBQWYsRUFBdkIsQ0FEaUM7QUFFakMsU0FBSyxLQUFMLENBQVcsU0FBWCxDQUFxQixVQUFyQixHQUFrQyxJQUFsQyxDQUZpQztDQUFYOztBQUsxQixPQUFPLE9BQVAsR0FBaUIsT0FBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnXG5cbnZhciBNYXBDdGYxID0gcmVxdWlyZSgnLi9tYXBzL01hcEN0ZjEnKVxudmFyIFJlbW90ZVBsYXllciA9IHJlcXVpcmUoJy4vbGliL1JlbW90ZVBsYXllcicpXG5sZXQgV2VhcG9uU2V0dGluZ3MgPSByZXF1aXJlKCcuL2xpYi9XZWFwb25TZXR0aW5ncycpXG52YXIgR3VpZCA9IHJlcXVpcmUoJy4vbGliL0d1aWQnKVxubGV0IFdlYXBvbnMgPSByZXF1aXJlKCcuL2xpYi9XZWFwb25zJylcbmxldCBCdWxsZXQgPSByZXF1aXJlKCcuL2xpYi9CdWxsZXQnKVxuXG52YXIgZ2FtZVdpZHRoID0gd2luZG93LmlubmVyV2lkdGhcbnZhciBnYW1lSGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0XG52YXIgd29ybGRXaWR0aCA9IDQwMDBcbnZhciB3b3JsZEhlaWdodCA9IDE1MDBcblxudmFyIGdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoZ2FtZVdpZHRoLCBnYW1lSGVpZ2h0LCBQaGFzZXIuQ0FOVkFTLCAncmFuZ2VyLXN0ZXZlLWdhbWUnKTtcblxudmFyIFJhbmdlclN0ZXZlR2FtZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY2xpZW50SWQgPSBHdWlkKClcbiAgICB0aGlzLmN1cnJlbnRXZWFwb24gPSAwO1xuICAgIHRoaXMuZW5lbWllcyA9IFtdXG4gICAgdGhpcy5nYW1lID0gZ2FtZVxuICAgIHRoaXMuZ3JvdW5kXG4gICAgdGhpcy5wbGF0Zm9ybXNcbiAgICB0aGlzLnBsYXllclxuICAgIHRoaXMuc2NvcmUgPSAwXG4gICAgdGhpcy5zY29yZVRleHRcbiAgICB0aGlzLnNvY2tldFxuICAgIHRoaXMud2VhcG9uTmFtZSA9IG51bGw7XG4gICAgdGhpcy53ZWFwb25zID0gW107XG59XG5cblJhbmdlclN0ZXZlR2FtZS5wcm90b3R5cGUgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZ2FtZS5yZW5kZXJlci5yZW5kZXJTZXNzaW9uLnJvdW5kUGl4ZWxzID0gdHJ1ZVxuICAgICAgICB0aGlzLmdhbWUuc3RhZ2UuZGlzYWJsZVZpc2liaWxpdHlDaGFuZ2UgPSB0cnVlXG4gICAgICAgIHRoaXMucGh5c2ljcy5zdGFydFN5c3RlbShQaGFzZXIuUGh5c2ljcy5BUkNBREUpXG4gICAgfSxcblxuICAgIHByZWxvYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmxvYWQuaW1hZ2UoJ2J1bGxldDExJywgJy9pbWFnZXMvYnVsbGV0MTEucG5nJylcbiAgICAgICAgdGhpcy5sb2FkLmltYWdlKCdidWxsZXQxMCcsICcvaW1hZ2VzL2J1bGxldDEwLnBuZycpXG4gICAgICAgIHRoaXMubG9hZC5pbWFnZSgnYnVsbGV0OScsICcvaW1hZ2VzL2J1bGxldDkucG5nJylcbiAgICAgICAgdGhpcy5sb2FkLmltYWdlKCdidWxsZXQ4JywgJy9pbWFnZXMvYnVsbGV0OC5wbmcnKVxuICAgICAgICB0aGlzLmxvYWQuaW1hZ2UoJ2J1bGxldDcnLCAnL2ltYWdlcy9idWxsZXQ3LnBuZycpXG4gICAgICAgIHRoaXMubG9hZC5pbWFnZSgnYnVsbGV0NScsICcvaW1hZ2VzL2J1bGxldDUucG5nJylcbiAgICAgICAgdGhpcy5sb2FkLmltYWdlKCdidWxsZXQ0JywgJy9pbWFnZXMvYnVsbGV0NC5wbmcnKVxuICAgICAgICB0aGlzLmxvYWQuaW1hZ2UoJ3RyZWVzY2FwZScsICcvaW1hZ2VzL21hcC1jdGYxLnBuZycpXG4gICAgICAgIHRoaXMubG9hZC5pbWFnZSgnZ3JvdW5kJywgJy9pbWFnZXMvcGxhdGZvcm0ucG5nJylcbiAgICAgICAgdGhpcy5sb2FkLnNwcml0ZXNoZWV0KCdkdWRlJywgJy9pbWFnZXMvZHVkZS5wbmcnLCAzMiwgNDgpXG4gICAgICAgIHRoaXMubG9hZC5zcHJpdGVzaGVldCgnZW5lbXknLCAnL2ltYWdlcy9kdWRlLnBuZycsIDMyLCA0OClcbiAgICB9LFxuXG4gICAgY3JlYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zb2NrZXQgPSBpby5jb25uZWN0KClcbiAgICAgICAgdGhpcy5lbmVtaWVzID0gW11cblxuICAgICAgICAvLyAgV2UncmUgZ29pbmcgdG8gYmUgdXNpbmcgcGh5c2ljcywgc28gZW5hYmxlIHRoZSBBcmNhZGUgUGh5c2ljcyBzeXN0ZW1cbiAgICAgICAgdGhpcy5waHlzaWNzLnN0YXJ0U3lzdGVtKFBoYXNlci5QaHlzaWNzLkFSQ0FERSlcblxuICAgICAgICB0aGlzLndvcmxkLnNldEJvdW5kcygwLCAwLCB3b3JsZFdpZHRoLCB3b3JsZEhlaWdodClcbiAgICAgICAgdGhpcy5nYW1lLnN0YWdlLmJhY2tncm91bmRDb2xvciA9IFwiIzJGOTFEMFwiXG5cbiAgICAgICAgLy8gU2NhbGUgZ2FtZSBvbiB3aW5kb3cgcmVzaXplXG4gICAgICAgIHRoaXMuZ2FtZS5zY2FsZS5zY2FsZU1vZGUgPSBQaGFzZXIuU2NhbGVNYW5hZ2VyLlJFU0laRTtcbiAgICAgICAgdGhpcy5nYW1lLnNjYWxlLnNldFNob3dBbGwoKTtcbiAgICAgICAgdGhpcy5nYW1lLnNjYWxlLnJlZnJlc2goKVxuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIE1hcFxuICAgICAgICAgKi9cbiAgICAgICAgTWFwQ3RmMS5jcmVhdGUodGhpcylcblxuICAgICAgICAvLyBEZWZpbmUgbW92ZW1lbnQgY29uc3RhbnRzXG4gICAgICAgIHRoaXMuTUFYX1NQRUVEID0gNDAwOyAvLyBwaXhlbHMvc2Vjb25kXG4gICAgICAgIHRoaXMuQUNDRUxFUkFUSU9OID0gMTk2MDsgLy8gcGl4ZWxzL3NlY29uZC9zZWNvbmRcbiAgICAgICAgdGhpcy5EUkFHID0gMTUwMDsgLy8gcGl4ZWxzL3NlY29uZFxuICAgICAgICB0aGlzLkdSQVZJVFkgPSAxOTYwOyAvLyBwaXhlbHMvc2Vjb25kL3NlY29uZFxuICAgICAgICB0aGlzLkpVTVBfU1BFRUQgPSAtODUwOyAvLyBwaXhlbHMvc2Vjb25kIChuZWdhdGl2ZSB5IGlzIHVwKVxuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFBsYXllciBTZXR0aW5nc1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5wbGF5ZXIgPSB0aGlzLmFkZC5zcHJpdGUoMjAwLCB0aGlzLndvcmxkLmhlaWdodCAtIDQwMCwgJ2R1ZGUnKTtcblxuICAgICAgICAvLyAgV2UgbmVlZCB0byBlbmFibGUgcGh5c2ljcyBvbiB0aGUgcGxheWVyXG4gICAgICAgIHRoaXMucGh5c2ljcy5hcmNhZGUuZW5hYmxlKHRoaXMucGxheWVyKTtcblxuICAgICAgICAvLyBFbmFibGUgcGh5c2ljcyBvbiB0aGUgcGxheWVyXG4gICAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLmVuYWJsZSh0aGlzLnBsYXllciwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcblxuICAgICAgICAvLyBNYWtlIHBsYXllciBjb2xsaWRlIHdpdGggd29ybGQgYm91bmRhcmllcyBzbyBoZSBkb2Vzbid0IGxlYXZlIHRoZSBzdGFnZVxuICAgICAgICB0aGlzLnBsYXllci5ib2R5LmNvbGxpZGVXb3JsZEJvdW5kcyA9IHRydWU7XG5cbiAgICAgICAgLy8gU2V0IHBsYXllciBtaW5pbXVtIGFuZCBtYXhpbXVtIG1vdmVtZW50IHNwZWVkXG4gICAgICAgIHRoaXMucGxheWVyLmJvZHkubWF4VmVsb2NpdHkuc2V0VG8odGhpcy5NQVhfU1BFRUQsIHRoaXMuTUFYX1NQRUVEICogMTApOyAvLyB4LCB5XG5cbiAgICAgICAgLy8gQWRkIGRyYWcgdG8gdGhlIHBsYXllciB0aGF0IHNsb3dzIHRoZW0gZG93biB3aGVuIHRoZXkgYXJlIG5vdCBhY2NlbGVyYXRpbmdcbiAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5kcmFnLnNldFRvKHRoaXMuRFJBRywgMCk7IC8vIHgsIHlcblxuICAgICAgICAvLyBTaW5jZSB3ZSdyZSBqdW1waW5nIHdlIG5lZWQgZ3Jhdml0eVxuICAgICAgICBnYW1lLnBoeXNpY3MuYXJjYWRlLmdyYXZpdHkueSA9IHRoaXMuR1JBVklUWTtcblxuICAgICAgICAvLyBGbGFnIHRvIHRyYWNrIGlmIHRoZSBqdW1wIGJ1dHRvbiBpcyBwcmVzc2VkXG4gICAgICAgIHRoaXMuanVtcGluZyA9IGZhbHNlO1xuXG4gICAgICAgIC8vICBPdXIgdHdvIGFuaW1hdGlvbnMsIHdhbGtpbmcgbGVmdCBhbmQgcmlnaHQuXG4gICAgICAgIHRoaXMucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdsZWZ0JywgWzAsIDEsIDIsIDNdLCAxMCwgdHJ1ZSlcbiAgICAgICAgdGhpcy5wbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ3JpZ2h0JywgWzUsIDYsIDcsIDhdLCAxMCwgdHJ1ZSlcblxuXG5cblxuICAgICAgICB0aGlzLmVuZW15ID0gdGhpcy5hZGQuc3ByaXRlKDIwMCwgdGhpcy53b3JsZC5oZWlnaHQgLSA0MDAsICdkdWRlJyk7XG5cbiAgICAgICAgLy8gIFdlIG5lZWQgdG8gZW5hYmxlIHBoeXNpY3Mgb24gdGhlIHBsYXllclxuICAgICAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmVuYWJsZSh0aGlzLmVuZW15KTtcblxuICAgICAgICAvLyBFbmFibGUgcGh5c2ljcyBvbiB0aGUgcGxheWVyXG4gICAgICAgIHRoaXMuZ2FtZS5waHlzaWNzLmVuYWJsZSh0aGlzLmVuZW15LCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuXG4gICAgICAgIC8vIE1ha2UgcGxheWVyIGNvbGxpZGUgd2l0aCB3b3JsZCBib3VuZGFyaWVzIHNvIGhlIGRvZXNuJ3QgbGVhdmUgdGhlIHN0YWdlXG4gICAgICAgIHRoaXMuZW5lbXkuYm9keS5jb2xsaWRlV29ybGRCb3VuZHMgPSB0cnVlO1xuXG4gICAgICAgIC8vIFNldCBwbGF5ZXIgbWluaW11bSBhbmQgbWF4aW11bSBtb3ZlbWVudCBzcGVlZFxuICAgICAgICB0aGlzLmVuZW15LmJvZHkubWF4VmVsb2NpdHkuc2V0VG8odGhpcy5NQVhfU1BFRUQsIHRoaXMuTUFYX1NQRUVEICogMTApOyAvLyB4LCB5XG5cbiAgICAgICAgLy8gQWRkIGRyYWcgdG8gdGhlIHBsYXllciB0aGF0IHNsb3dzIHRoZW0gZG93biB3aGVuIHRoZXkgYXJlIG5vdCBhY2NlbGVyYXRpbmdcbiAgICAgICAgdGhpcy5lbmVteS5ib2R5LmRyYWcuc2V0VG8odGhpcy5EUkFHLCAwKTsgLy8geCwgeVxuXG4gICAgICAgIHRoaXMuZW5lbXkuaGVhbHRoID0gMTAwXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdlYXBvbnNcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY3VycmVudFdlYXBvbiA9IDA7XG4gICAgICAgIHRoaXMud2VhcG9ucy5wdXNoKG5ldyBXZWFwb25zLkFLNDcodGhpcy5nYW1lKSk7XG5cblxuICAgICAgICAvKipcbiAgICAgICAgICogVGV4dFxuICAgICAgICAgKi9cbiAgICAgICAgbGV0IHRleHRTdHlsZXMgPSB7IGZvbnRTaXplOiAnMjRweCcsIGZpbGw6ICcjMDAwJyB9XG4gICAgICAgIHRoaXMuc2NvcmVUZXh0ID0gdGhpcy5hZGQudGV4dCgyNSwgMjUsICdTY29yZTogMCcsIHRleHRTdHlsZXMpXG4gICAgICAgIHRoaXMuc2NvcmVUZXh0LmZpeGVkVG9DYW1lcmEgPSB0cnVlXG4gICAgICAgIHRoaXMud2VhcG9uTmFtZSA9IHRoaXMuYWRkLnRleHQodGhpcy5jYW1lcmEud2lkdGggLSAxMDAsIHRoaXMuY2FtZXJhLmhlaWdodCAtIDQ1LCAnQUstNDcnLCB0ZXh0U3R5bGVzKVxuICAgICAgICB0aGlzLndlYXBvbk5hbWUuZml4ZWRUb0NhbWVyYSA9IHRydWVcbiAgICAgICAgdGhpcy5jdXJyZW50SGVhbHRoVGV4dCA9IHRoaXMuYWRkLnRleHQodGhpcy5jYW1lcmEueCArIDI1LCB0aGlzLmNhbWVyYS5oZWlnaHQgLSA0NSwgJzEwMCcsIHRleHRTdHlsZXMpXG4gICAgICAgIHRoaXMuY3VycmVudEhlYWx0aFRleHQuZml4ZWRUb0NhbWVyYSA9IHRydWVcblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDYW1lcmEgU2V0dGluZ3NcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2FtZXJhLmZvbGxvdyh0aGlzLnBsYXllcik7XG5cbiAgICAgICAgdmFyIGNoYW5nZUtleSA9IHRoaXMuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5FTlRFUik7XG4gICAgICAgIGNoYW5nZUtleS5vbkRvd24uYWRkKHRoaXMubmV4dFdlYXBvbiwgdGhpcylcblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXNpemluZyBFdmVudHNcbiAgICAgICAgICovXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmdhbWUuc2NhbGUucmVmcmVzaCgpXG4gICAgICAgICAgICB0aGlzLmdhbWUuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0XG4gICAgICAgICAgICB0aGlzLmdhbWUud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aFxuXG4gICAgICAgICAgICB0aGlzLndlYXBvbk5hbWUuY2FtZXJhT2Zmc2V0LnggPSB0aGlzLmNhbWVyYS53aWR0aCAtIDEwMFxuICAgICAgICAgICAgdGhpcy53ZWFwb25OYW1lLmNhbWVyYU9mZnNldC55ID0gdGhpcy5jYW1lcmEuaGVpZ2h0IC0gNDVcblxuICAgICAgICAgICAgdGhpcy5zY29yZVRleHQuY2FtZXJhT2Zmc2V0LnggPSAyNVxuICAgICAgICAgICAgdGhpcy5zY29yZVRleHQuY2FtZXJhT2Zmc2V0LnkgPSAyNVxuICAgICAgICB9KVxuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFN0YXJ0IGxpc3RlbmluZyBmb3IgZXZlbnRzXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnNldEV2ZW50SGFuZGxlcnMoKVxuICAgIH0sXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyAgQ29sbGlkZSB0aGUgcGxheWVyIGFuZCB0aGUgc3RhcnMgd2l0aCB0aGUgcGxhdGZvcm1zXG4gICAgICAgIHRoaXMucGh5c2ljcy5hcmNhZGUuY29sbGlkZSh0aGlzLnBsYXllciwgdGhpcy5wbGF0Zm9ybXMpXG4gICAgICAgIHRoaXMucGh5c2ljcy5hcmNhZGUuY29sbGlkZSh0aGlzLmVuZW15LCB0aGlzLnBsYXRmb3JtcylcbiAgICAgICAgdGhpcy5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMucGxhdGZvcm1zLCB0aGlzLndlYXBvbnMsIGZ1bmN0aW9uKHBsYXRmb3JtLCB3ZWFwb24pIHtcbiAgICAgICAgICAgIHdlYXBvbi5raWxsKClcbiAgICAgICAgfSwgbnVsbCwgdGhpcyk7XG5cbiAgICAgICAgdGhpcy5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMucGxheWVyLCB0aGlzLndlYXBvbnMsIGZ1bmN0aW9uKHBsYXllciwgd2VhcG9uKSB7XG4gICAgICAgICAgICB3ZWFwb24ua2lsbCgpXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnWW91IHdlcmUgaGl0IScpXG4gICAgICAgIH0sIG51bGwsIHRoaXMpO1xuXG4gICAgICAgIHRoaXMucGh5c2ljcy5hcmNhZGUuY29sbGlkZSh0aGlzLmVuZW15LCB0aGlzLndlYXBvbnMsIGZ1bmN0aW9uKGVuZW15LCB3ZWFwb24pIHtcbiAgICAgICAgICAgIGVuZW15LmhlYWx0aCAtPSB3ZWFwb24uZGFtYWdlXG4gICAgICAgICAgICB3ZWFwb24ua2lsbCgpXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnWW91IGhpdCB0aGVtIScsIGVuZW15LmhlYWx0aCwgd2VhcG9uLmRhbWFnZSlcbiAgICAgICAgICAgIGlmIChlbmVteS5oZWFsdGggPD0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdUaGV5IGFyZSBkZWFkIScpXG4gICAgICAgICAgICAgICAgdGhpcy5lbmVteS54ID0gMjAwXG4gICAgICAgICAgICAgICAgdGhpcy5lbmVteS55ID0gMjAwXG4gICAgICAgICAgICAgICAgdGhpcy5lbmVteS5oZWFsdGggPSAxMDBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgbnVsbCwgdGhpcyk7XG5cblxuICAgICAgICBpZiAodGhpcy5sZWZ0SW5wdXRJc0FjdGl2ZSgpKSB7XG4gICAgICAgICAgICAvLyBJZiB0aGUgTEVGVCBrZXkgaXMgZG93biwgc2V0IHRoZSBwbGF5ZXIgdmVsb2NpdHkgdG8gbW92ZSBsZWZ0XG4gICAgICAgICAgICB0aGlzLnBsYXllci5ib2R5LmFjY2VsZXJhdGlvbi54ID0gLXRoaXMuQUNDRUxFUkFUSU9OO1xuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdsZWZ0JylcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnJpZ2h0SW5wdXRJc0FjdGl2ZSgpKSB7XG4gICAgICAgICAgICAvLyBJZiB0aGUgUklHSFQga2V5IGlzIGRvd24sIHNldCB0aGUgcGxheWVyIHZlbG9jaXR5IHRvIG1vdmUgcmlnaHRcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmJvZHkuYWNjZWxlcmF0aW9uLnggPSB0aGlzLkFDQ0VMRVJBVElPTjtcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmFuaW1hdGlvbnMucGxheSgncmlnaHQnKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gU3RhbmQgc3RpbGxcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmJvZHkuYWNjZWxlcmF0aW9uLnggPSAwXG4gICAgICAgICAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLnN0b3AoKVxuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuZnJhbWUgPSA0XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZXQgYSB2YXJpYWJsZSB0aGF0IGlzIHRydWUgd2hlbiB0aGUgcGxheWVyIGlzIHRvdWNoaW5nIHRoZSBncm91bmRcbiAgICAgICAgdmFyIG9uVGhlR3JvdW5kID0gdGhpcy5wbGF5ZXIuYm9keS50b3VjaGluZy5kb3duO1xuXG4gICAgICAgIC8vIElmIHRoZSBwbGF5ZXIgaXMgdG91Y2hpbmcgdGhlIGdyb3VuZCwgbGV0IGhpbSBoYXZlIDIganVtcHNcbiAgICAgICAgaWYgKG9uVGhlR3JvdW5kKSB7XG4gICAgICAgICAgICB0aGlzLmp1bXBzID0gMjtcbiAgICAgICAgICAgIHRoaXMuanVtcGluZyA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSnVtcCFcbiAgICAgICAgaWYgKHRoaXMuanVtcHMgPiAwICYmIHRoaXMudXBJbnB1dElzQWN0aXZlKDUpKSB7XG4gICAgICAgICAgICB0aGlzLnBsYXllci5ib2R5LnZlbG9jaXR5LnkgPSB0aGlzLkpVTVBfU1BFRUQ7XG4gICAgICAgICAgICB0aGlzLmp1bXBpbmcgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVkdWNlIHRoZSBudW1iZXIgb2YgYXZhaWxhYmxlIGp1bXBzIGlmIHRoZSBqdW1wIGlucHV0IGlzIHJlbGVhc2VkXG4gICAgICAgIGlmICh0aGlzLmp1bXBpbmcgJiYgdGhpcy51cElucHV0UmVsZWFzZWQoKSkge1xuICAgICAgICAgICAgdGhpcy5qdW1wcy0tO1xuICAgICAgICAgICAgdGhpcy5qdW1waW5nID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5nYW1lLmlucHV0LmFjdGl2ZVBvaW50ZXIuaXNEb3duKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS5maXJlKHRoaXMucGxheWVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ21vdmUgcGxheWVyJywgeyB4OiB0aGlzLnBsYXllci54LCB5OiB0aGlzLnBsYXllci55IH0pXG4gICAgfSxcblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gc2hvdWxkIHJldHVybiB0cnVlIHdoZW4gdGhlIHBsYXllciBhY3RpdmF0ZXMgdGhlIFwiZ28gbGVmdFwiIGNvbnRyb2xcbiAgICAvLyBJbiB0aGlzIGNhc2UsIGVpdGhlciBob2xkaW5nIHRoZSByaWdodCBhcnJvdyBvciB0YXBwaW5nIG9yIGNsaWNraW5nIG9uIHRoZSBsZWZ0XG4gICAgLy8gc2lkZSBvZiB0aGUgc2NyZWVuLlxuICAgIGxlZnRJbnB1dElzQWN0aXZlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGlzQWN0aXZlID0gZmFsc2U7XG5cbiAgICAgICAgaXNBY3RpdmUgPSB0aGlzLmlucHV0LmtleWJvYXJkLmlzRG93bihQaGFzZXIuS2V5Ym9hcmQuQSk7XG5cbiAgICAgICAgcmV0dXJuIGlzQWN0aXZlO1xuICAgIH0sXG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIHNob3VsZCByZXR1cm4gdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgYWN0aXZhdGVzIHRoZSBcImdvIHJpZ2h0XCIgY29udHJvbFxuICAgIC8vIEluIHRoaXMgY2FzZSwgZWl0aGVyIGhvbGRpbmcgdGhlIHJpZ2h0IGFycm93IG9yIHRhcHBpbmcgb3IgY2xpY2tpbmcgb24gdGhlIHJpZ2h0XG4gICAgLy8gc2lkZSBvZiB0aGUgc2NyZWVuLlxuICAgIHJpZ2h0SW5wdXRJc0FjdGl2ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBpc0FjdGl2ZSA9IGZhbHNlO1xuXG4gICAgICAgIGlzQWN0aXZlID0gdGhpcy5pbnB1dC5rZXlib2FyZC5pc0Rvd24oUGhhc2VyLktleWJvYXJkLkQpO1xuXG4gICAgICAgIHJldHVybiBpc0FjdGl2ZTtcbiAgICB9LFxuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiBzaG91bGQgcmV0dXJuIHRydWUgd2hlbiB0aGUgcGxheWVyIGFjdGl2YXRlcyB0aGUgXCJqdW1wXCIgY29udHJvbFxuICAgIC8vIEluIHRoaXMgY2FzZSwgZWl0aGVyIGhvbGRpbmcgdGhlIHVwIGFycm93IG9yIHRhcHBpbmcgb3IgY2xpY2tpbmcgb24gdGhlIGNlbnRlclxuICAgIC8vIHBhcnQgb2YgdGhlIHNjcmVlbi5cbiAgICB1cElucHV0SXNBY3RpdmU6IGZ1bmN0aW9uKGR1cmF0aW9uKSB7XG4gICAgICAgIHZhciBpc0FjdGl2ZSA9IGZhbHNlO1xuXG4gICAgICAgIGlzQWN0aXZlID0gdGhpcy5pbnB1dC5rZXlib2FyZC5kb3duRHVyYXRpb24oUGhhc2VyLktleWJvYXJkLlcsIGR1cmF0aW9uKTtcblxuICAgICAgICByZXR1cm4gaXNBY3RpdmU7XG4gICAgfSxcblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gcmV0dXJucyB0cnVlIHdoZW4gdGhlIHBsYXllciByZWxlYXNlcyB0aGUgXCJqdW1wXCIgY29udHJvbFxuICAgIHVwSW5wdXRSZWxlYXNlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWxlYXNlZCA9IGZhbHNlO1xuXG4gICAgICAgIHJlbGVhc2VkID0gdGhpcy5pbnB1dC5rZXlib2FyZC51cER1cmF0aW9uKFBoYXNlci5LZXlib2FyZC5XKTtcblxuICAgICAgICByZXR1cm4gcmVsZWFzZWQ7XG4gICAgfSxcblxuICAgIG5leHRXZWFwb246IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyAgVGlkeS11cCB0aGUgY3VycmVudCB3ZWFwb25cbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFdlYXBvbiA+IDkpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLnJlc2V0KCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS5jYWxsQWxsKCdyZXNldCcsIG51bGwsIDAsIDApO1xuICAgICAgICAgICAgdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0uc2V0QWxsKCdleGlzdHMnLCBmYWxzZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyAgQWN0aXZhdGUgdGhlIG5ldyBvbmVcbiAgICAgICAgdGhpcy5jdXJyZW50V2VhcG9uKys7XG5cbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFdlYXBvbiA9PT0gdGhpcy53ZWFwb25zLmxlbmd0aClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50V2VhcG9uID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLnZpc2libGUgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMud2VhcG9uTmFtZS50ZXh0ID0gdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0ubmFtZTtcbiAgICB9LFxuXG4gICAgc2V0RXZlbnRIYW5kbGVyczogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBTb2NrZXQgY29ubmVjdGlvbiBzdWNjZXNzZnVsXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdjb25uZWN0JywgdGhpcy5vblNvY2tldENvbm5lY3RlZC5iaW5kKHRoaXMpKVxuXG4gICAgICAgIC8vIFNvY2tldCBkaXNjb25uZWN0aW9uXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdkaXNjb25uZWN0JywgdGhpcy5vblNvY2tldERpc2Nvbm5lY3QuYmluZCh0aGlzKSlcblxuICAgICAgICAvLyBOZXcgcGxheWVyIG1lc3NhZ2UgcmVjZWl2ZWRcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ25ldyBwbGF5ZXInLCB0aGlzLm9uTmV3UGxheWVyLmJpbmQodGhpcykpXG5cbiAgICAgICAgLy8gUGxheWVyIG1vdmUgbWVzc2FnZSByZWNlaXZlZFxuICAgICAgICB0aGlzLnNvY2tldC5vbignbW92ZSBwbGF5ZXInLCB0aGlzLm9uTW92ZVBsYXllci5iaW5kKHRoaXMpKVxuXG4gICAgICAgIC8vIFBsYXllciByZW1vdmVkIG1lc3NhZ2UgcmVjZWl2ZWRcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ3JlbW92ZSBwbGF5ZXInLCB0aGlzLm9uUmVtb3ZlUGxheWVyLmJpbmQodGhpcykpXG4gICAgfSxcblxuICAgIC8vIFNvY2tldCBjb25uZWN0ZWRcbiAgICBvblNvY2tldENvbm5lY3RlZDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBjb25zb2xlLmxvZygnQ29ubmVjdGVkIHRvIHNvY2tldCBzZXJ2ZXInKVxuXG4gICAgICAgICAvLyBSZXNldCBlbmVtaWVzIG9uIHJlY29ubmVjdFxuICAgICAgICB0aGlzLmVuZW1pZXMuZm9yRWFjaChmdW5jdGlvbiAoZW5lbXkpIHtcbiAgICAgICAgICAgIGVuZW15LnBsYXllci5raWxsKClcbiAgICAgICAgfSlcbiAgICAgICAgdGhpcy5lbmVtaWVzID0gW11cblxuICAgICAgICAvLyBTZW5kIGxvY2FsIHBsYXllciBkYXRhIHRvIHRoZSBnYW1lIHNlcnZlclxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCduZXcgcGxheWVyJywge1xuICAgICAgICAgICAgY2xpZW50SWQ6IHRoaXMuY2xpZW50SWQsXG4gICAgICAgICAgICB4OiB0aGlzLnBsYXllci54LFxuICAgICAgICAgICAgeTogdGhpcy5wbGF5ZXIueVxuICAgICAgICB9KVxuICAgIH0sXG5cbiAgICAvLyBTb2NrZXQgZGlzY29ubmVjdGVkXG4gICAgb25Tb2NrZXREaXNjb25uZWN0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0Rpc2Nvbm5lY3RlZCBmcm9tIHNvY2tldCBzZXJ2ZXInKVxuICAgIH0sXG5cbiAgICAvLyBOZXcgcGxheWVyXG4gICAgb25OZXdQbGF5ZXI6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ05ldyBwbGF5ZXIgY29ubmVjdGVkOicsIGRhdGEuaWQpXG5cbiAgICAgICAgLy8gQXZvaWQgcG9zc2libGUgZHVwbGljYXRlIHBsYXllcnNcbiAgICAgICAgdmFyIGR1cGxpY2F0ZSA9IHRoaXMucGxheWVyQnlJZChkYXRhLmlkKVxuICAgICAgICBpZiAoZHVwbGljYXRlIHx8IGRhdGEuY2xpZW50SWQgPT09IHRoaXMuY2xpZW50SWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdEdXBsaWNhdGUgcGxheWVyIScpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFkZCBuZXcgcGxheWVyIHRvIHRoZSByZW1vdGUgcGxheWVycyBhcnJheVxuICAgICAgICBsZXQgbmV3UmVtb3RlUGxheWVyID0gUmVtb3RlUGxheWVyLmNyZWF0ZShkYXRhLmlkLCB0aGlzLmdhbWUsIHRoaXMucGxheWVyLCBkYXRhLngsIGRhdGEueSlcbiAgICAgICAgdGhpcy5lbmVtaWVzLnB1c2gobmV3UmVtb3RlUGxheWVyKVxuICAgICAgICB0aGlzLmVuZW1pZXNbdGhpcy5lbmVtaWVzLmxlbmd0aCAtIDFdLnBsYXllci5hbmltYXRpb25zLmFkZCgnbGVmdCcsIFswLCAxLCAyLCAzXSwgMTAsIHRydWUpXG4gICAgICAgIHRoaXMuZW5lbWllc1t0aGlzLmVuZW1pZXMubGVuZ3RoIC0gMV0ucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdyaWdodCcsIFs1LCA2LCA3LCA4XSwgMTAsIHRydWUpXG4gICAgfSxcblxuICAgIC8vIE1vdmUgcGxheWVyXG4gICAgb25Nb3ZlUGxheWVyOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBtb3ZlUGxheWVyID0gdGhpcy5wbGF5ZXJCeUlkKGRhdGEuaWQpXG5cbiAgICAgICAgLy8gUGxheWVyIG5vdCBmb3VuZFxuICAgICAgICBpZiAoISBtb3ZlUGxheWVyKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFVwZGF0ZSBwbGF5ZXIgcG9zaXRpb25cbiAgICAgICAgbW92ZVBsYXllci5wbGF5ZXIueCA9IGRhdGEueFxuICAgICAgICBtb3ZlUGxheWVyLnBsYXllci55ID0gZGF0YS55XG5cbiAgICAgICAgaWYgKG1vdmVQbGF5ZXIucGxheWVyLnggPiBtb3ZlUGxheWVyLmxhc3RQb3NpdGlvbi54KSB7XG4gICAgICAgICAgICBtb3ZlUGxheWVyLnBsYXllci5hbmltYXRpb25zLnBsYXkoJ3JpZ2h0JylcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChtb3ZlUGxheWVyLnBsYXllci54IDwgbW92ZVBsYXllci5sYXN0UG9zaXRpb24ueClcbiAgICAgICAge1xuICAgICAgICAgICAgbW92ZVBsYXllci5wbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdsZWZ0JylcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgIHtcbiAgICAgICAgICAgIG1vdmVQbGF5ZXIucGxheWVyLmFuaW1hdGlvbnMuc3RvcCgpXG4gICAgICAgICAgICBtb3ZlUGxheWVyLnBsYXllci5mcmFtZSA9IDQ7XG4gICAgICAgIH1cblxuICAgICAgICBtb3ZlUGxheWVyLmxhc3RQb3NpdGlvbi54ID0gbW92ZVBsYXllci5wbGF5ZXIueFxuICAgICAgICBtb3ZlUGxheWVyLmxhc3RQb3NpdGlvbi55ID0gbW92ZVBsYXllci5wbGF5ZXIueVxuICAgIH0sXG5cbiAgICAvLyBSZW1vdmUgcGxheWVyXG4gICAgb25SZW1vdmVQbGF5ZXI6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIHJlbW92ZVBsYXllciA9IHRoaXMucGxheWVyQnlJZChkYXRhLmlkKVxuXG4gICAgICAgIC8vIFBsYXllciBub3QgZm91bmRcbiAgICAgICAgaWYgKCFyZW1vdmVQbGF5ZXIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdQbGF5ZXIgbm90IGZvdW5kOiAnLCBkYXRhLmlkKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICByZW1vdmVQbGF5ZXIucGxheWVyLmtpbGwoKVxuXG4gICAgICAgIC8vIFJlbW92ZSBwbGF5ZXIgZnJvbSBhcnJheVxuICAgICAgICB0aGlzLmVuZW1pZXMuc3BsaWNlKHRoaXMuZW5lbWllcy5pbmRleE9mKHJlbW92ZVBsYXllciksIDEpXG4gICAgfSxcblxuICAgIC8vIEZpbmQgcGxheWVyIGJ5IElEXG4gICAgcGxheWVyQnlJZDogZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmVuZW1pZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmVuZW1pZXNbaV0ucGxheWVyLm5hbWUgPT09IGlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZW5lbWllc1tpXVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxufVxuXG5nYW1lLnN0YXRlLmFkZCgnR2FtZScsIFJhbmdlclN0ZXZlR2FtZSwgdHJ1ZSk7XG4iLCIndXNlIHN0cmljdCdcblxudmFyIEJ1bGxldCA9IGZ1bmN0aW9uIChnYW1lLCBrZXkpIHtcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgMCwgMCwga2V5KTtcblxuICAgIHRoaXMudGV4dHVyZS5iYXNlVGV4dHVyZS5zY2FsZU1vZGUgPSBQSVhJLnNjYWxlTW9kZXMuTkVBUkVTVDtcblxuICAgIHRoaXMuYW5jaG9yLnNldCgwLjUpO1xuXG4gICAgdGhpcy5jaGVja1dvcmxkQm91bmRzID0gdHJ1ZTtcbiAgICB0aGlzLm91dE9mQm91bmRzS2lsbCA9IHRydWU7XG4gICAgdGhpcy5leGlzdHMgPSBmYWxzZTtcblxuICAgIHRoaXMudHJhY2tpbmcgPSBmYWxzZTtcbiAgICB0aGlzLnNjYWxlU3BlZWQgPSAwO1xuXG59O1xuXG5CdWxsZXQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSk7XG5CdWxsZXQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQnVsbGV0O1xuXG5CdWxsZXQucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbiAoeCwgeSwgYW5nbGUsIHNwZWVkLCBneCwgZ3kpIHtcbiAgICBneCA9IGd4IHx8IDBcbiAgICBneSA9IGd5IHx8IDBcbiAgICB0aGlzLnJlc2V0KHgsIHkpO1xuICAgIHRoaXMuc2NhbGUuc2V0KDEpO1xuXG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLm1vdmVUb1BvaW50ZXIodGhpcywgc3BlZWQpO1xufVxuXG5CdWxsZXQucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy50cmFja2luZylcbiAgICB7XG4gICAgICAgIHRoaXMucm90YXRpb24gPSBNYXRoLmF0YW4yKHRoaXMuYm9keS52ZWxvY2l0eS55LCB0aGlzLmJvZHkudmVsb2NpdHkueCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc2NhbGVTcGVlZCA+IDApXG4gICAge1xuICAgICAgICB0aGlzLnNjYWxlLnggKz0gdGhpcy5zY2FsZVNwZWVkO1xuICAgICAgICB0aGlzLnNjYWxlLnkgKz0gdGhpcy5zY2FsZVNwZWVkO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCdWxsZXRcbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGd1aWRHZW5lcmF0b3IoKSB7XG4gICAgdmFyIFM0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgcmV0dXJuICgoKDErTWF0aC5yYW5kb20oKSkqMHgxMDAwMCl8MCkudG9TdHJpbmcoMTYpLnN1YnN0cmluZygxKVxuICAgIH1cblxuICAgIHJldHVybiAoUzQoKStTNCgpK1wiLVwiK1M0KCkrXCItXCIrUzQoKStcIi1cIitTNCgpK1wiLVwiK1M0KCkrUzQoKStTNCgpKVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBSZW1vdGVQbGF5ZXIgPSB7XG4gICAgbGFzdFBvc2l0aW9uOiB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDBcbiAgICB9XG59XG5cblJlbW90ZVBsYXllci51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMucGxheWVyLnggIT09IHRoaXMubGFzdFBvc2l0aW9uLnggfHwgdGhpcy5wbGF5ZXIueSAhPT0gdGhpcy5sYXN0UG9zaXRpb24ueSkge1xuICAgICAgICB0aGlzLnBsYXllci5wbGF5KCdtb3ZlJylcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnBsYXllci5wbGF5KCdzdG9wJylcbiAgICB9XG5cbiAgICB0aGlzLmxhc3RQb3NpdGlvbi54ID0gdGhpcy5wbGF5ZXIueFxuICAgIHRoaXMubGFzdFBvc2l0aW9uLnkgPSB0aGlzLnBsYXllci55XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGNyZWF0ZTogZnVuY3Rpb24oaW5kZXgsIGdhbWUsIHBsYXllciwgc3RhcnRYLCBzdGFydFkpIHtcbiAgICAgICAgbGV0IG5ld1JlbW90ZVBsYXllciA9IHtcbiAgICAgICAgICAgIHg6IHN0YXJ0WCxcbiAgICAgICAgICAgIHk6IHN0YXJ0WSxcbiAgICAgICAgICAgIGdhbWU6IGdhbWUsXG4gICAgICAgICAgICBoZWFsdGg6IDEwMCxcbiAgICAgICAgICAgIHBsYXllcjogcGxheWVyLFxuICAgICAgICAgICAgYWxpdmU6IHRydWUsXG4gICAgICAgICAgICBsYXN0UG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICB4OiBzdGFydFgsXG4gICAgICAgICAgICAgICAgeTogc3RhcnRZXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBuZXdSZW1vdGVQbGF5ZXIgPSBPYmplY3QuYXNzaWduKFJlbW90ZVBsYXllciwgbmV3UmVtb3RlUGxheWVyKVxuXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgcGxheWVyJ3MgZW5lbXkgc3ByaXRlXG4gICAgICAgIG5ld1JlbW90ZVBsYXllci5wbGF5ZXIgPSBnYW1lLmFkZC5zcHJpdGUoc3RhcnRYLCBzdGFydFksICdlbmVteScpXG5cbiAgICAgICAgLy8gT3VyIHR3byBhbmltYXRpb25zLCB3YWxraW5nIGxlZnQgYW5kIHJpZ2h0LlxuICAgICAgICBuZXdSZW1vdGVQbGF5ZXIucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdsZWZ0JywgWzAsIDEsIDIsIDNdLCAxMCwgdHJ1ZSlcbiAgICAgICAgbmV3UmVtb3RlUGxheWVyLnBsYXllci5hbmltYXRpb25zLmFkZCgncmlnaHQnLCBbNSwgNiwgNywgOF0sIDEwLCB0cnVlKVxuXG4gICAgICAgIG5ld1JlbW90ZVBsYXllci5wbGF5ZXIubmFtZSA9IGluZGV4LnRvU3RyaW5nKClcblxuICAgICAgICByZXR1cm4gbmV3UmVtb3RlUGxheWVyXG4gICAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgXCJVU1NPQ09NXCI6IHtcbiAgICAgICAgXCJuYW1lXCI6IFwiVVNTT0NPTVwiLFxuICAgICAgICBcIkRhbWFnZVwiOiAxOTAsXG4gICAgICAgIFwiRmlyZUludGVydmFsXCI6IDEyLFxuICAgICAgICBcIkFtbW9cIjogMTIsXG4gICAgICAgIFwiUmVsb2FkVGltZVwiOiA2NSxcbiAgICAgICAgXCJTcGVlZFwiOiAxODAsXG4gICAgICAgIFwiQnVsbGV0U3R5bGVcIjogMSxcbiAgICAgICAgXCJTdGFydFVwVGltZVwiOiAwLFxuICAgICAgICBcIkJpbmtcIjogNCxcbiAgICAgICAgXCJNb3ZlbWVudEFjY1wiOiAxXG4gICAgfSxcbiAgICBcIkRlc2VydEVhZ2xlc1wiOiB7XG4gICAgICAgIFwibmFtZVwiOiBcIkRlc2VydCBFYWdsZXNcIixcbiAgICAgICAgXCJEYW1hZ2VcIjogMjEwLFxuICAgICAgICBcIkZpcmVJbnRlcnZhbFwiOiAyMixcbiAgICAgICAgXCJBbW1vXCI6IDcsXG4gICAgICAgIFwiUmVsb2FkVGltZVwiOiA5MCxcbiAgICAgICAgXCJTcGVlZFwiOiAxOTAsXG4gICAgICAgIFwiQnVsbGV0U3R5bGVcIjogMSxcbiAgICAgICAgXCJTdGFydFVwVGltZVwiOiAwLFxuICAgICAgICBcIkJpbmtcIjogNyxcbiAgICAgICAgXCJNb3ZlbWVudEFjY1wiOiAxXG4gICAgfSxcbiAgICBcIkhLTVA1XCI6IHtcbiAgICAgICAgXCJuYW1lXCI6IFwiSEsgTVA1XCIsXG4gICAgICAgIFwiRGFtYWdlXCI6IDEyMCxcbiAgICAgICAgXCJGaXJlSW50ZXJ2YWxcIjogNixcbiAgICAgICAgXCJBbW1vXCI6IDMwLFxuICAgICAgICBcIlJlbG9hZFRpbWVcIjogMTA1LFxuICAgICAgICBcIlNwZWVkXCI6IDE5MCxcbiAgICAgICAgXCJCdWxsZXRTdHlsZVwiOiAxLFxuICAgICAgICBcIlN0YXJ0VXBUaW1lXCI6IDAsXG4gICAgICAgIFwiQmlua1wiOiAyLFxuICAgICAgICBcIk1vdmVtZW50QWNjXCI6IDFcbiAgICB9LFxuICAgIFwiQUs0N1wiOiB7XG4gICAgICAgIFwibmFtZVwiOiBcIkFLLTQ3XCIsXG4gICAgICAgIFwiZGFtYWdlXCI6IFwiMTIyXCIsXG4gICAgICAgIFwiZmlyZUludGVydmFsXCI6IFwiMTBcIixcbiAgICAgICAgXCJhbW1vXCI6IFwiNDBcIixcbiAgICAgICAgXCJyZWxvYWRUaW1lXCI6IFwiMTUwXCIsXG4gICAgICAgIFwic3BlZWRcIjogXCIyNDBcIixcbiAgICAgICAgXCJidWxsZXRTdHlsZVwiOiBcIjFcIixcbiAgICAgICAgXCJzdGFydFVwVGltZVwiOiBcIjBcIixcbiAgICAgICAgXCJiaW5rXCI6IFwiM1wiLFxuICAgICAgICBcIm1vdmVtZW50QWNjXCI6IFwiMVwiXG4gICAgfSxcbiAgICBcIlN0ZXlyQVVHXCI6IHtcbiAgICAgICAgXCJuYW1lXCI6IFwiTTE2XCIsXG4gICAgICAgIFwiRGFtYWdlXCI6IFwiODBcIixcbiAgICAgICAgXCJGaXJlSW50ZXJ2YWxcIjogXCI3XCIsXG4gICAgICAgIFwiQW1tb1wiOiBcIjMwXCIsXG4gICAgICAgIFwiUmVsb2FkVGltZVwiOiBcIjExNVwiLFxuICAgICAgICBcIlNwZWVkXCI6IFwiMjYwXCIsXG4gICAgICAgIFwiQnVsbGV0U3R5bGVcIjogXCIxXCIsXG4gICAgICAgIFwiU3RhcnRVcFRpbWVcIjogXCIwXCIsXG4gICAgICAgIFwiQmlua1wiOiBcIjJcIixcbiAgICAgICAgXCJNb3ZlbWVudEFjY1wiOiBcIjFcIlxuICAgIH0sXG4gICAgXCJTcGFzMTJcIjoge1xuICAgICAgICBcIm5hbWVcIjogXCJTcGFzLTEyXCIsXG4gICAgICAgIFwiRGFtYWdlXCI6IFwiMTMwXCIsXG4gICAgICAgIFwiRmlyZUludGVydmFsXCI6IFwiMzJcIixcbiAgICAgICAgXCJBbW1vXCI6IFwiN1wiLFxuICAgICAgICBcIlJlbG9hZFRpbWVcIjogXCIxNzVcIixcbiAgICAgICAgXCJTcGVlZFwiOiBcIjE0MFwiLFxuICAgICAgICBcIkJ1bGxldFN0eWxlXCI6IFwiM1wiLFxuICAgICAgICBcIlN0YXJ0VXBUaW1lXCI6IFwiMFwiLFxuICAgICAgICBcIkJpbmtcIjogXCIxMFwiLFxuICAgICAgICBcIk1vdmVtZW50QWNjXCI6IFwiMVwiXG4gICAgfSxcbiAgICBcIlJ1Z2VyNzdcIjoge1xuICAgICAgICBcIm5hbWVcIjogXCJSdWdlciA3N1wiLFxuICAgICAgICBcIkRhbWFnZVwiOiBcIjI1MlwiLFxuICAgICAgICBcIkZpcmVJbnRlcnZhbFwiOiBcIjMwXCIsXG4gICAgICAgIFwiQW1tb1wiOiBcIjRcIixcbiAgICAgICAgXCJSZWxvYWRUaW1lXCI6IFwiNzVcIixcbiAgICAgICAgXCJTcGVlZFwiOiBcIjMzMFwiLFxuICAgICAgICBcIkJ1bGxldFN0eWxlXCI6IFwiMVwiLFxuICAgICAgICBcIlN0YXJ0VXBUaW1lXCI6IFwiMFwiLFxuICAgICAgICBcIkJpbmtcIjogXCIxNVwiLFxuICAgICAgICBcIk1vdmVtZW50QWNjXCI6IFwiM1wiXG4gICAgfSxcbiAgICBcIk03OVwiOiB7XG4gICAgICAgIFwiRGFtYWdlXCI6IDE2MDAwMCxcbiAgICAgICAgXCJGaXJlSW50ZXJ2YWxcIjogNixcbiAgICAgICAgXCJBbW1vXCI6IDEsXG4gICAgICAgIFwiUmVsb2FkVGltZVwiOiAxODAsXG4gICAgICAgIFwiU3BlZWRcIjogMTE1LFxuICAgICAgICBcIkJ1bGxldFN0eWxlXCI6IDQsXG4gICAgICAgIFwiU3RhcnRVcFRpbWVcIjogMCxcbiAgICAgICAgXCJCaW5rXCI6IDMwLFxuICAgICAgICBcIk1vdmVtZW50QWNjXCI6IDNcbiAgICB9LFxuICAgIFwiQmFycmV0IE04MkExXCI6IHtcbiAgICAgICAgXCJEYW1hZ2VcIjogNDk1LFxuICAgICAgICBcIkZpcmVJbnRlcnZhbFwiOiAyNDAsXG4gICAgICAgIFwiQW1tb1wiOiAxMCxcbiAgICAgICAgXCJSZWxvYWRUaW1lXCI6IDMwMCxcbiAgICAgICAgXCJTcGVlZFwiOiBcIjU1MFwiLFxuICAgICAgICBcIkJ1bGxldFN0eWxlXCI6IFwiMVwiLFxuICAgICAgICBcIlN0YXJ0VXBUaW1lXCI6IFwiMFwiLFxuICAgICAgICBcIkJpbmtcIjogXCI4MFwiLFxuICAgICAgICBcIk1vdmVtZW50QWNjXCI6IFwiNlwiXG4gICAgfSxcbiAgICBcIkZOIE1pbmltaVwiOiB7XG4gICAgICAgIFwiRGFtYWdlXCI6IFwiMTAwXCIsXG4gICAgICAgIFwiRmlyZUludGVydmFsXCI6IFwiOVwiLFxuICAgICAgICBcIkFtbW9cIjogXCI1MFwiLFxuICAgICAgICBcIlJlbG9hZFRpbWVcIjogXCIyNTBcIixcbiAgICAgICAgXCJTcGVlZFwiOiBcIjI3MFwiLFxuICAgICAgICBcIkJ1bGxldFN0eWxlXCI6IFwiMVwiLFxuICAgICAgICBcIlN0YXJ0VXBUaW1lXCI6IFwiMFwiLFxuICAgICAgICBcIkJpbmtcIjogXCIzXCIsXG4gICAgICAgIFwiTW92ZW1lbnRBY2NcIjogXCIyXCJcbiAgICB9LFxuICAgIFwiWE0yMTQgTWluaWd1blwiOiB7XG4gICAgICAgIFwiRGFtYWdlXCI6IFwiNTVcIixcbiAgICAgICAgXCJGaXJlSW50ZXJ2YWxcIjogXCI0XCIsXG4gICAgICAgIFwiQW1tb1wiOiBcIjEwMFwiLFxuICAgICAgICBcIlJlbG9hZFRpbWVcIjogXCIzNjZcIixcbiAgICAgICAgXCJTcGVlZFwiOiBcIjI5MFwiLFxuICAgICAgICBcIkJ1bGxldFN0eWxlXCI6IFwiMVwiLFxuICAgICAgICBcIlN0YXJ0VXBUaW1lXCI6IFwiNTBcIixcbiAgICAgICAgXCJCaW5rXCI6IFwiMVwiLFxuICAgICAgICBcIk1vdmVtZW50QWNjXCI6IFwiMVwiXG4gICAgfSxcbiAgICBcIkZsYW1lclwiOiB7XG4gICAgICAgIFwiRGFtYWdlXCI6IFwiMTAwMFwiLFxuICAgICAgICBcIkZpcmVJbnRlcnZhbFwiOiBcIjZcIixcbiAgICAgICAgXCJBbW1vXCI6IFwiMjAwXCIsXG4gICAgICAgIFwiUmVsb2FkVGltZVwiOiBcIjVcIixcbiAgICAgICAgXCJTcGVlZFwiOiBcIjEwNVwiLFxuICAgICAgICBcIkJ1bGxldFN0eWxlXCI6IFwiNVwiLFxuICAgICAgICBcIlN0YXJ0VXBUaW1lXCI6IFwiMFwiLFxuICAgICAgICBcIkJpbmtcIjogXCIyXCIsXG4gICAgICAgIFwiTW92ZW1lbnRBY2NcIjogXCIxXCJcbiAgICB9LFxuICAgIFwiUmFtYm8gQm93XCI6IHtcbiAgICAgICAgXCJEYW1hZ2VcIjogXCIxMjAwXCIsXG4gICAgICAgIFwiRmlyZUludGVydmFsXCI6IFwiMTBcIixcbiAgICAgICAgXCJBbW1vXCI6IFwiMVwiLFxuICAgICAgICBcIlJlbG9hZFRpbWVcIjogXCIyNVwiLFxuICAgICAgICBcIlNwZWVkXCI6IFwiMjEwXCIsXG4gICAgICAgIFwiQnVsbGV0U3R5bGVcIjogXCI3XCIsXG4gICAgICAgIFwiU3RhcnRVcFRpbWVcIjogXCIwXCIsXG4gICAgICAgIFwiQmlua1wiOiBcIjNcIixcbiAgICAgICAgXCJNb3ZlbWVudEFjY1wiOiBcIjFcIlxuICAgIH0sXG4gICAgXCJGbGFtZWQgQXJyb3dzXCI6IHtcbiAgICAgICAgXCJEYW1hZ2VcIjogXCI4MDBcIixcbiAgICAgICAgXCJGaXJlSW50ZXJ2YWxcIjogXCIxMFwiLFxuICAgICAgICBcIkFtbW9cIjogXCIxXCIsXG4gICAgICAgIFwiUmVsb2FkVGltZVwiOiBcIjM2XCIsXG4gICAgICAgIFwiU3BlZWRcIjogXCIxODBcIixcbiAgICAgICAgXCJCdWxsZXRTdHlsZVwiOiBcIjhcIixcbiAgICAgICAgXCJTdGFydFVwVGltZVwiOiBcIjBcIixcbiAgICAgICAgXCJCaW5rXCI6IFwiM1wiLFxuICAgICAgICBcIk1vdmVtZW50QWNjXCI6IFwiMVwiXG4gICAgfSxcbiAgICBcIkNvbWJhdCBLbmlmZVwiOiB7XG4gICAgICAgIFwiRGFtYWdlXCI6IFwiMjEwMDAwXCIsXG4gICAgICAgIFwiRmlyZUludGVydmFsXCI6IFwiNlwiLFxuICAgICAgICBcIkFtbW9cIjogXCIxXCIsXG4gICAgICAgIFwiUmVsb2FkVGltZVwiOiBcIjNcIixcbiAgICAgICAgXCJTcGVlZFwiOiBcIjYwXCIsXG4gICAgICAgIFwiQnVsbGV0U3R5bGVcIjogXCIxMVwiLFxuICAgICAgICBcIlN0YXJ0VXBUaW1lXCI6IFwiMFwiLFxuICAgICAgICBcIkJpbmtcIjogXCIwXCIsXG4gICAgICAgIFwiTW92ZW1lbnRBY2NcIjogXCIxXCJcbiAgICB9LFxuICAgIFwiQ2hhaW5zYXdcIjoge1xuICAgICAgICBcIkRhbWFnZVwiOiBcIjIxMDBcIixcbiAgICAgICAgXCJGaXJlSW50ZXJ2YWxcIjogXCI0XCIsXG4gICAgICAgIFwiQW1tb1wiOiBcIjMwXCIsXG4gICAgICAgIFwiUmVsb2FkVGltZVwiOiBcIjcwXCIsXG4gICAgICAgIFwiU3BlZWRcIjogXCI3MFwiLFxuICAgICAgICBcIkJ1bGxldFN0eWxlXCI6IFwiMTFcIixcbiAgICAgICAgXCJTdGFydFVwVGltZVwiOiBcIjBcIixcbiAgICAgICAgXCJCaW5rXCI6IFwiMFwiLFxuICAgICAgICBcIk1vdmVtZW50QWNjXCI6IFwiMVwiXG4gICAgfSxcbiAgICBcIk03MiBMQVdcIjoge1xuICAgICAgICBcIkRhbWFnZVwiOiBcIjE1MDAwMFwiLFxuICAgICAgICBcIkZpcmVJbnRlcnZhbFwiOiBcIjYwXCIsXG4gICAgICAgIFwiQW1tb1wiOiBcIjFcIixcbiAgICAgICAgXCJSZWxvYWRUaW1lXCI6IFwiNjAwXCIsXG4gICAgICAgIFwiU3BlZWRcIjogXCIyMzBcIixcbiAgICAgICAgXCJCdWxsZXRTdHlsZVwiOiBcIjEyXCIsXG4gICAgICAgIFwiU3RhcnRVcFRpbWVcIjogXCIwXCIsXG4gICAgICAgIFwiQmlua1wiOiBcIjIwXCIsXG4gICAgICAgIFwiTW92ZW1lbnRBY2NcIjogXCIxXCJcbiAgICB9LFxuICAgIFwiUHVuY2hcIjoge1xuICAgICAgICBcIkRhbWFnZVwiOiBcIjMzMDAwXCIsXG4gICAgICAgIFwiRmlyZUludGVydmFsXCI6IFwiNlwiLFxuICAgICAgICBcIkFtbW9cIjogXCIxXCIsXG4gICAgICAgIFwiUmVsb2FkVGltZVwiOiBcIjNcIixcbiAgICAgICAgXCJTcGVlZFwiOiBcIjUwXCIsXG4gICAgICAgIFwiQnVsbGV0U3R5bGVcIjogXCI2XCIsXG4gICAgICAgIFwiU3RhcnRVcFRpbWVcIjogXCIwXCIsXG4gICAgICAgIFwiQmlua1wiOiBcIjJcIixcbiAgICAgICAgXCJNb3ZlbWVudEFjY1wiOiBcIjFcIlxuICAgIH0sXG4gICAgXCJHcmVuYWRlXCI6IHtcbiAgICAgICAgXCJEYW1hZ2VcIjogXCIxNTAwMDBcIixcbiAgICAgICAgXCJGaXJlSW50ZXJ2YWxcIjogXCI4MFwiLFxuICAgICAgICBcIkFtbW9cIjogXCIxXCIsXG4gICAgICAgIFwiUmVsb2FkVGltZVwiOiBcIjIwXCIsXG4gICAgICAgIFwiU3BlZWRcIjogXCI1MFwiLFxuICAgICAgICBcIkJ1bGxldFN0eWxlXCI6IFwiMlwiLFxuICAgICAgICBcIlN0YXJ0VXBUaW1lXCI6IFwiMFwiLFxuICAgICAgICBcIkJpbmtcIjogXCIwXCIsXG4gICAgICAgIFwiTW92ZW1lbnRBY2NcIjogXCIxXCJcbiAgICB9LFxuICAgIFwiU3RhdGlvbmFyeSBHdW5cIjoge1xuICAgICAgICBcIkRhbWFnZVwiOiBcIjUwXCIsXG4gICAgICAgIFwiRmlyZUludGVydmFsXCI6IFwiNFwiLFxuICAgICAgICBcIkFtbW9cIjogXCIxMDBcIixcbiAgICAgICAgXCJSZWxvYWRUaW1lXCI6IFwiMzY2XCIsXG4gICAgICAgIFwiU3BlZWRcIjogXCIyOTBcIixcbiAgICAgICAgXCJCdWxsZXRTdHlsZVwiOiBcIjFcIixcbiAgICAgICAgXCJTdGFydFVwVGltZVwiOiBcIjBcIixcbiAgICAgICAgXCJCaW5rXCI6IFwiMFwiLFxuICAgICAgICBcIk1vdmVtZW50QWNjXCI6IFwiMVwiXG4gICAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBCdWxsZXQgPSByZXF1aXJlKCcuLi9CdWxsZXQnKVxuXG5sZXQgQUs0NyA9IGZ1bmN0aW9uIChnYW1lKSB7XG4gICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgZ2FtZSwgZ2FtZS53b3JsZCwgJ0FLLTQ3JywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG5cbiAgICB0aGlzLmRhbWFnZSA9IDIyXG4gICAgdGhpcy5uZXh0RmlyZSA9IDA7XG4gICAgdGhpcy5idWxsZXRTcGVlZCA9IDEwMDA7XG4gICAgLy8gQUs0NyBmaXJlcyBhYm91dCA2MDAgYnVsbGV0cyBwZXIgc2Vjb25kXG4gICAgdGhpcy5maXJlUmF0ZSA9IDE2Ni42NjY2Njc7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDY0OyBpKyspXG4gICAge1xuICAgICAgICBsZXQgYnVsbGV0ID0gbmV3IEJ1bGxldCh0aGlzLmdhbWUsICdidWxsZXQ1JylcbiAgICAgICAgYnVsbGV0LmRhbWFnZSA9IDIyXG4gICAgICAgIHRoaXMuYWRkKGJ1bGxldCwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbn1cblxuQUs0Ny5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuQUs0Ny5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBBSzQ3O1xuXG5BSzQ3LnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24gKHNvdXJjZSkge1xuXG4gICAgaWYgKHRoaXMuZ2FtZS50aW1lLnRpbWUgPCB0aGlzLm5leHRGaXJlKVxuICAgICAgICByZXR1cm5cblxuICAgIHZhciB4ID0gc291cmNlLnggKyAyMjtcbiAgICB2YXIgeSA9IHNvdXJjZS55ICsgMzA7XG5cbiAgICB0aGlzLmdldEZpcnN0RXhpc3RzKGZhbHNlKS5maXJlKHgsIHksIDAsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDApO1xuICAgIHRoaXMuc2V0QWxsKCd0cmFja2luZycsIHRydWUpXG5cbiAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5nYW1lLnRpbWUudGltZSArIHRoaXMuZmlyZVJhdGVcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBSzQ3XG4iLCIndXNlIHN0cmljdCdcblxuLyoqXG4gKiBQcmltYXJ5IFdlYXBvbnNcbiAqIDEuIERlc2VydCBFYWdsZXNcbiAqIDIuIEhLIE1QNVxuICogMy4gQUs0N1xuICogNC4gTTE2XG4gKiA1LiBTcGFzLTEyXG4gKiA2LiBSdWdlciA3N1xuICogNy4gTTc5XG4gKiA4LiBCYXJyZXQgTTgyQTFcbiAqIDkuIEZOIE1pbmltaVxuICogMTAuIFhNMjE0IE1pbmlndW5cbiAqL1xuXG4vKipcbiAqIFNlY29uZGFyeSBXZWFwb25zXG4gKiAxLiBVU1NPQ09NXG4gKiAyLiBDb21iYXQgS25pZmVcbiAqIDMuIENoYWluc2F3XG4gKiA0LiBNNzIgTGF3XG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgXCJBSzQ3XCI6IHJlcXVpcmUoJy4vQUs0NycpXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IE1hcEN0ZjEgPSB7fVxuXG5NYXBDdGYxLmNyZWF0ZSA9IGZ1bmN0aW9uKHNjb3BlKSB7XG4gICAgdGhpcy5zY29wZSA9IHNjb3BlXG5cbiAgICB0aGlzLmNyZWF0ZVNreVNwcml0ZSgpXG4gICAgdGhpcy5jcmVhdGVQbGF0Zm9ybXMoKVxuICAgIHRoaXMuY3JlYXRlTGVkZ2VzKClcblxuICAgIHRoaXMuc2NvcGUucGxhdGZvcm1zLnNldEFsbCgnYm9keS5pbW1vdmFibGUnLCB0cnVlKVxuICAgIHRoaXMuc2NvcGUucGxhdGZvcm1zLnNldEFsbCgnYm9keS5hbGxvd0dyYXZpdHknLCBmYWxzZSlcbn1cblxuTWFwQ3RmMS5jcmVhdGVMZWRnZXMgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgbGVkZ2VzID0gW1xuICAgICAgICAvLyB7eCwgeSwgd2lkdGgsIGhlaWdodH1cblxuICAgICAgICAvLyBTdGFydGluZyBMZWRnZXNcbiAgICAgICAgeyBpZDogMSwgeDogMCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDQzMSwgd2lkdGg6IDEyOCwgaGVpZ2h0OiA5MiB9LCAvLyBMZWZ0IGJvdHRvbSBsZWRnZVxuICAgICAgICB7IGlkOiAyLCB4OiAwLCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gODM4LCB3aWR0aDogMTI4LCBoZWlnaHQ6IDkyIH0sIC8vIExlZnQgdG9wIGxlZGdlXG5cbiAgICAgICAgeyBpZDogMywgeDogMzg3MiwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDQyNywgd2lkdGg6IDEyOCwgaGVpZ2h0OiA5MiB9LCAvLyBSaWdodCBib3R0b20gbGVkZ2VcbiAgICAgICAgeyBpZDogNCwgeDogMzg3MiwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDgzNSwgd2lkdGg6IDEyOCwgaGVpZ2h0OiA5MiB9LCAvLyBSaWdodCB0b3AgbGVkZ2VcblxuICAgICAgICAvLyBHcm91bmQgTGVkZ2VzXG4gICAgICAgIHsgaWQ6IDUsIHg6IDAsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSAxMjgsIHdpZHRoOiA0NzQsIGhlaWdodDogMTI4IH0sIC8vIE1haW4gYm90dG9tIHN0YXJ0aW5nIGxlZnQgbGVkZ2VcbiAgICAgICAgeyBpZDogNiwgeDogNDc0LCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gMjU2LCB3aWR0aDogNjQxLCBoZWlnaHQ6IDI2MCB9LCAvLyBNYWluIGJvdHRvbSBsZWZ0IGxlZGdlXG4gICAgICAgIHsgaWQ6IDcsIHg6IDExMTUsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSAzODQsIHdpZHRoOiAxNzg1LCBoZWlnaHQ6IDM5MCB9LCAvLyBNYWluIGJvdHRvbSBjZW50ZXIgbGVkZ2VcbiAgICAgICAgeyBpZDogOCwgeDogMjkwMCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDI1Niwgd2lkdGg6IDY0MSwgaGVpZ2h0OiAyNjAgfSwgLy8gTWFpbiBib3R0b20gcmlnaHQgbGVkZ2VcbiAgICAgICAgeyBpZDogOSwgeDogMzU0MCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDEyOCwgd2lkdGg6IDQ3NCwgaGVpZ2h0OiAxMjggfSwgLy8gTWFpbiBib3R0b20gc3RhcnRpbmcgcmlnaHQgbGVkZ2VcblxuICAgICAgICAvLyBBaXIgTGVkZ2VzXG4gICAgICAgIHsgaWQ6IDEwLCB4OiAzMDAsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA2MDgsIHdpZHRoOiA2NDEsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogMTEsIHg6IDExMTAsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA3MDEsIHdpZHRoOiA1MTMsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogMTIsIHg6IDg3MCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDk4Miwgd2lkdGg6IDI1NiwgaGVpZ2h0OiA5MiB9LFxuICAgICAgICB7IGlkOiAxMywgeDogMTc0NCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDg3NCwgd2lkdGg6IDUwNywgaGVpZ2h0OiAyNTQgfSxcbiAgICAgICAgeyBpZDogMTQsIHg6IDIzOTAsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA2ODksIHdpZHRoOiA1MTMsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogMTUsIHg6IDMwMzEsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA2MDgsIHdpZHRoOiA2NDEsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogMTYsIHg6IDI5MDMsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA5NTcsIHdpZHRoOiAyNTYsIGhlaWdodDogOTIgfVxuICAgIF1cblxuXG4gICAgbGVkZ2VzLmZvckVhY2goKGxlZGdlKSA9PiB7XG4gICAgICAgIC8vIHZhciBuZXdMZWRnZSA9IHRoaXMuc2NvcGUucGxhdGZvcm1zLmNyZWF0ZShsZWRnZS54LCBsZWRnZS55LCAnZ3JvdW5kJylcbiAgICAgICAgdmFyIG5ld0xlZGdlID0gdGhpcy5zY29wZS5wbGF0Zm9ybXMuY3JlYXRlKGxlZGdlLngsIGxlZGdlLnkpXG4gICAgICAgIG5ld0xlZGdlLmhlaWdodCA9IGxlZGdlLmhlaWdodFxuICAgICAgICBuZXdMZWRnZS53aWR0aCA9IGxlZGdlLndpZHRoXG5cbiAgICAgICAgLy8gRGVidWcgc3R1ZmZcbiAgICAgICAgLy8gbmV3TGVkZ2UuYWxwaGEgPSAwLjJcbiAgICAgICAgLy8gbGV0IHN0eWxlID0geyBmb250OiBcIjIwcHggQXJpYWxcIiwgZmlsbDogXCIjZmYwMDQ0XCIsIGFsaWduOiBcImNlbnRlclwiLCBiYWNrZ3JvdW5kQ29sb3I6IFwiI2ZmZmYwMFwiIH1cbiAgICAgICAgLy8gbGV0IHRleHQgPSB0aGlzLnNjb3BlLmdhbWUuYWRkLnRleHQobGVkZ2UueCwgbGVkZ2UueSwgbGVkZ2UuaWQsIHN0eWxlKVxuICAgICAgICAvLyB0ZXh0LmFscGhhID0gMC4yXG4gICAgfSlcbn1cblxuTWFwQ3RmMS5jcmVhdGVTa3lTcHJpdGUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNjb3BlLmFkZC50aWxlU3ByaXRlKDAsIHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSAxNTAwLCB0aGlzLnNjb3BlLmdhbWUud29ybGQud2lkdGgsIDE1MDAsICd0cmVlc2NhcGUnKVxufVxuXG5NYXBDdGYxLmNyZWF0ZVBsYXRmb3JtcyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2NvcGUucGxhdGZvcm1zID0gdGhpcy5zY29wZS5hZGQuZ3JvdXAoKVxuICAgIHRoaXMuc2NvcGUucGxhdGZvcm1zLmVuYWJsZUJvZHkgPSB0cnVlXG59XG5cbm1vZHVsZS5leHBvcnRzID0gTWFwQ3RmMVxuIl19
