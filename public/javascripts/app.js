(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var MapCtf1 = require('./maps/MapCtf1');
var RemotePlayer = require('./lib/RemotePlayer');
var guid = require('./lib/Guid');

var gameWidth = window.innerWidth;
var gameHeight = window.innerHeight;
var worldWidth = 4000;
var worldHeight = 1500;

var game = new Phaser.Game(gameWidth, gameHeight, Phaser.CANVAS, 'ranger-steve-game');

var RangerSteveGame = function RangerSteveGame() {
    this.game = game;
    this.clientId = guid();
    this.player;
    this.enemies = [];
    this.socket;
    this.platforms;
    this.ground;

    this.score = 0;
    this.scoreText;

    this.weapons = [];
    this.currentWeapon = 0;
    this.weaponName = null;
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
        this.MAX_SPEED = 500; // pixels/second
        this.ACCELERATION = 1500; // pixels/second/second
        this.DRAG = 600; // pixels/second
        this.GRAVITY = 2600; // pixels/second/second
        this.JUMP_SPEED = -1000; // pixels/second (negative y is up)

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
         * Control Settings
         */
        // this.upButton = this.input.keyboard.addKey(Phaser.Keyboard.W);
        // this.downButton = this.input.keyboard.addKey(Phaser.Keyboard.S);
        // this.leftButton = this.input.keyboard.addKey(Phaser.Keyboard.A);
        // this.rightButton = this.input.keyboard.addKey(Phaser.Keyboard.D);

        // Capture certain keys to prevent their default actions in the browser.
        // This is only necessary because this is an HTML5 game. Games on other
        // platforms may not need code like this.
        this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.W, Phaser.Keyboard.S, Phaser.Keyboard.A, Phaser.Keyboard.D]);

        /**
         * Weapons
         */
        this.currentWeapon = 0;

        for (var i = 1; i < this.weapons.length; i++) {
            this.weapons[i].visible = false;
        }

        this.weapons.push(new Weapon.Ak47(this.game));
        this.weapons.push(new Weapon.ScatterShot(this.game));
        this.weapons.push(new Weapon.Beam(this.game));
        this.weapons.push(new Weapon.SplitShot(this.game));
        this.weapons.push(new Weapon.Pattern(this.game));
        this.weapons.push(new Weapon.Rockets(this.game));
        this.weapons.push(new Weapon.ScaleBullet(this.game));

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

    game.physics.arcade.moveToPointer(this, speed);
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

var Weapon = {};

////////////////////////////////////////////////////
//  A single bullet is fired in front of the ship //
////////////////////////////////////////////////////

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

Weapon.Ak47 = function (game) {

    Phaser.Group.call(this, game, game.world, 'AK-47', false, true, Phaser.Physics.ARCADE);

    this.nextFire = 0;
    this.bulletSpeed = 1300;
    this.fireRate = 100;

    for (var i = 0; i < 64; i++) {
        this.add(new Bullet(game, 'bullet5'), true);
    }

    return this;
};

Weapon.Ak47.prototype = Object.create(Phaser.Group.prototype);
Weapon.Ak47.prototype.constructor = Weapon.Ak47;

Weapon.Ak47.prototype.fire = function (source) {

    if (this.game.time.time < this.nextFire) return;

    var x = source.x + 22;
    var y = source.y + 30;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0);
    this.setAll('tracking', true);

    this.nextFire = this.game.time.time + this.fireRate;
};

////////////////////////////////////////////////////
//  Bullets are fired out scattered on the y axis //
////////////////////////////////////////////////////

Weapon.ScatterShot = function (game) {

    Phaser.Group.call(this, game, game.world, 'Scatter Shot', false, true, Phaser.Physics.ARCADE);

    this.nextFire = 0;
    this.bulletSpeed = 600;
    this.fireRate = 40;

    for (var i = 0; i < 32; i++) {
        this.add(new Bullet(game, 'bullet5'), true);
    }

    return this;
};

Weapon.ScatterShot.prototype = Object.create(Phaser.Group.prototype);
Weapon.ScatterShot.prototype.constructor = Weapon.ScatterShot;

Weapon.ScatterShot.prototype.fire = function (source) {

    if (this.game.time.time < this.nextFire) {
        return;
    }

    var x = source.x + 16;
    var y = source.y + source.height / 2 + this.game.rnd.between(-10, 10);

    var bulletInstance = this.getFirstExists(false);

    if (!bulletInstance) return;

    bulletInstance.fire(x, y, 0, this.bulletSpeed, 0, 0);

    this.nextFire = this.game.time.time + this.fireRate;
};

//////////////////////////////////////////////////////////////////////////
//  Fires a streaming beam of lazers, very fast, in front of the player //
//////////////////////////////////////////////////////////////////////////

Weapon.Beam = function (game) {

    Phaser.Group.call(this, game, game.world, 'Beam', false, true, Phaser.Physics.ARCADE);

    this.nextFire = 0;
    this.bulletSpeed = 1000;
    this.fireRate = 45;

    for (var i = 0; i < 64; i++) {
        this.add(new Bullet(game, 'bullet11'), true);
    }

    return this;
};

Weapon.Beam.prototype = Object.create(Phaser.Group.prototype);
Weapon.Beam.prototype.constructor = Weapon.Beam;

Weapon.Beam.prototype.fire = function (source) {

    if (this.game.time.time < this.nextFire) {
        return;
    }

    var x = source.x + 40;
    var y = source.y + 10;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0);

    this.nextFire = this.game.time.time + this.fireRate;
};

///////////////////////////////////////////////////////////////////////
//  A three-way fire where the top and bottom bullets bend on a path //
///////////////////////////////////////////////////////////////////////

Weapon.SplitShot = function (game) {

    Phaser.Group.call(this, game, game.world, 'Split Shot', false, true, Phaser.Physics.ARCADE);

    this.nextFire = 0;
    this.bulletSpeed = 700;
    this.fireRate = 40;

    for (var i = 0; i < 64; i++) {
        this.add(new Bullet(game, 'bullet8'), true);
    }

    return this;
};

Weapon.SplitShot.prototype = Object.create(Phaser.Group.prototype);
Weapon.SplitShot.prototype.constructor = Weapon.SplitShot;

Weapon.SplitShot.prototype.fire = function (source) {
    if (this.game.time.time < this.nextFire) {
        return;
    }

    var x = source.x + 20;
    var y = source.y + 10;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, -500);
    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0);
    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 500);

    this.nextFire = this.game.time.time + this.fireRate;
};

///////////////////////////////////////////////////////////////////////
//  Bullets have Gravity.y set on a repeating pre-calculated pattern //
///////////////////////////////////////////////////////////////////////

Weapon.Pattern = function (game) {

    Phaser.Group.call(this, game, game.world, 'Pattern', false, true, Phaser.Physics.ARCADE);

    this.nextFire = 0;
    this.bulletSpeed = 600;
    this.fireRate = 40;

    this.pattern = Phaser.ArrayUtils.numberArrayStep(-800, 800, 200);
    this.pattern = this.pattern.concat(Phaser.ArrayUtils.numberArrayStep(800, -800, -200));

    this.patternIndex = 0;

    for (var i = 0; i < 64; i++) {
        this.add(new Bullet(game, 'bullet4'), true);
    }

    return this;
};

Weapon.Pattern.prototype = Object.create(Phaser.Group.prototype);
Weapon.Pattern.prototype.constructor = Weapon.Pattern;

Weapon.Pattern.prototype.fire = function (source) {

    if (this.game.time.time < this.nextFire) {
        return;
    }

    var x = source.x + 20;
    var y = source.y + 10;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, this.pattern[this.patternIndex]);

    this.patternIndex++;

    if (this.patternIndex === this.pattern.length) {
        this.patternIndex = 0;
    }

    this.nextFire = this.game.time.time + this.fireRate;
};

///////////////////////////////////////////////////////////////////
//  Rockets that visually track the direction they're heading in //
///////////////////////////////////////////////////////////////////

Weapon.Rockets = function (game) {

    Phaser.Group.call(this, game, game.world, 'Rockets', false, true, Phaser.Physics.ARCADE);

    this.nextFire = 0;
    this.bulletSpeed = 400;
    this.fireRate = 250;

    for (var i = 0; i < 32; i++) {
        this.add(new Bullet(game, 'bullet10'), true);
    }

    this.setAll('tracking', true);

    return this;
};

Weapon.Rockets.prototype = Object.create(Phaser.Group.prototype);
Weapon.Rockets.prototype.constructor = Weapon.Rockets;

Weapon.Rockets.prototype.fire = function (source) {

    if (this.game.time.time < this.nextFire) {
        return;
    }

    var x = source.x + 10;
    var y = source.y + 10;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, -700);
    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 700);

    this.nextFire = this.game.time.time + this.fireRate;
};

////////////////////////////////////////////////////////////////////////
//  A single bullet that scales in size as it moves across the screen //
////////////////////////////////////////////////////////////////////////

Weapon.ScaleBullet = function (game) {

    Phaser.Group.call(this, game, game.world, 'Scale Bullet', false, true, Phaser.Physics.ARCADE);

    this.nextFire = 0;
    this.bulletSpeed = 800;
    this.fireRate = 100;

    for (var i = 0; i < 32; i++) {
        this.add(new Bullet(game, 'bullet9'), true);
    }

    this.setAll('scaleSpeed', 0.05);

    return this;
};

Weapon.ScaleBullet.prototype = Object.create(Phaser.Group.prototype);
Weapon.ScaleBullet.prototype.constructor = Weapon.ScaleBullet;

Weapon.ScaleBullet.prototype.fire = function (source) {

    if (this.game.time.time < this.nextFire) {
        return;
    }

    var x = source.x + 10;
    var y = source.y + 10;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0);

    this.nextFire = this.game.time.time + this.fireRate;
};

game.state.add('Game', RangerSteveGame, true);

},{"./lib/Guid":2,"./lib/RemotePlayer":3,"./maps/MapCtf1":4}],2:[function(require,module,exports){
'use strict';

module.exports = function guidGenerator() {
   var S4 = function S4() {
      return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
   };

   return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
};

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvYXBwLmpzIiwiYXNzZXRzL2pzL2xpYi9HdWlkLmpzIiwiYXNzZXRzL2pzL2xpYi9SZW1vdGVQbGF5ZXIuanMiLCJhc3NldHMvanMvbWFwcy9NYXBDdGYxLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7O0FBRUEsSUFBSSxVQUFVLFFBQVEsZ0JBQVIsQ0FBVjtBQUNKLElBQUksZUFBZSxRQUFRLG9CQUFSLENBQWY7QUFDSixJQUFJLE9BQU8sUUFBUSxZQUFSLENBQVA7O0FBRUosSUFBSSxZQUFZLE9BQU8sVUFBUDtBQUNoQixJQUFJLGFBQWEsT0FBTyxXQUFQO0FBQ2pCLElBQUksYUFBYSxJQUFiO0FBQ0osSUFBSSxjQUFjLElBQWQ7O0FBRUosSUFBSSxPQUFPLElBQUksT0FBTyxJQUFQLENBQVksU0FBaEIsRUFBMkIsVUFBM0IsRUFBdUMsT0FBTyxNQUFQLEVBQWUsbUJBQXRELENBQVA7O0FBRUosSUFBSSxrQkFBa0IsU0FBbEIsZUFBa0IsR0FBVztBQUM3QixTQUFLLElBQUwsR0FBWSxJQUFaLENBRDZCO0FBRTdCLFNBQUssUUFBTCxHQUFnQixNQUFoQixDQUY2QjtBQUc3QixTQUFLLE1BQUwsQ0FINkI7QUFJN0IsU0FBSyxPQUFMLEdBQWUsRUFBZixDQUo2QjtBQUs3QixTQUFLLE1BQUwsQ0FMNkI7QUFNN0IsU0FBSyxTQUFMLENBTjZCO0FBTzdCLFNBQUssTUFBTCxDQVA2Qjs7QUFTN0IsU0FBSyxLQUFMLEdBQWEsQ0FBYixDQVQ2QjtBQVU3QixTQUFLLFNBQUwsQ0FWNkI7O0FBWTdCLFNBQUssT0FBTCxHQUFlLEVBQWYsQ0FaNkI7QUFhN0IsU0FBSyxhQUFMLEdBQXFCLENBQXJCLENBYjZCO0FBYzdCLFNBQUssVUFBTCxHQUFrQixJQUFsQixDQWQ2QjtDQUFYOztBQWlCdEIsZ0JBQWdCLFNBQWhCLEdBQTRCO0FBQ3hCLFVBQU0sZ0JBQVc7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USxlQUFSLEdBQTBCLFlBQVc7QUFDakMsU0FBSyxLQUFMLENBQVcsR0FBWCxDQUFlLFVBQWYsQ0FBMEIsQ0FBMUIsRUFBNkIsS0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixLQUFoQixDQUFzQixNQUF0QixHQUErQixJQUEvQixFQUFxQyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEtBQWhCLENBQXNCLEtBQXRCLEVBQTZCLElBQS9GLEVBQXFHLFdBQXJHLEVBRGlDO0NBQVg7O0FBSTFCLFFBQVEsZUFBUixHQUEwQixZQUFXO0FBQ2pDLFNBQUssS0FBTCxDQUFXLFNBQVgsR0FBdUIsS0FBSyxLQUFMLENBQVcsR0FBWCxDQUFlLEtBQWYsRUFBdkIsQ0FEaUM7QUFFakMsU0FBSyxLQUFMLENBQVcsU0FBWCxDQUFxQixVQUFyQixHQUFrQyxJQUFsQyxDQUZpQztDQUFYOztBQUsxQixPQUFPLE9BQVAsR0FBaUIsT0FBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnXG5cbnZhciBNYXBDdGYxID0gcmVxdWlyZSgnLi9tYXBzL01hcEN0ZjEnKVxudmFyIFJlbW90ZVBsYXllciA9IHJlcXVpcmUoJy4vbGliL1JlbW90ZVBsYXllcicpXG52YXIgZ3VpZCA9IHJlcXVpcmUoJy4vbGliL0d1aWQnKVxuXG52YXIgZ2FtZVdpZHRoID0gd2luZG93LmlubmVyV2lkdGhcbnZhciBnYW1lSGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0XG52YXIgd29ybGRXaWR0aCA9IDQwMDBcbnZhciB3b3JsZEhlaWdodCA9IDE1MDBcblxudmFyIGdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoZ2FtZVdpZHRoLCBnYW1lSGVpZ2h0LCBQaGFzZXIuQ0FOVkFTLCAncmFuZ2VyLXN0ZXZlLWdhbWUnKTtcblxudmFyIFJhbmdlclN0ZXZlR2FtZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZ2FtZSA9IGdhbWVcbiAgICB0aGlzLmNsaWVudElkID0gZ3VpZCgpXG4gICAgdGhpcy5wbGF5ZXJcbiAgICB0aGlzLmVuZW1pZXMgPSBbXVxuICAgIHRoaXMuc29ja2V0XG4gICAgdGhpcy5wbGF0Zm9ybXNcbiAgICB0aGlzLmdyb3VuZFxuXG4gICAgdGhpcy5zY29yZSA9IDBcbiAgICB0aGlzLnNjb3JlVGV4dFxuXG4gICAgdGhpcy53ZWFwb25zID0gW107XG4gICAgdGhpcy5jdXJyZW50V2VhcG9uID0gMDtcbiAgICB0aGlzLndlYXBvbk5hbWUgPSBudWxsO1xufVxuXG5SYW5nZXJTdGV2ZUdhbWUucHJvdG90eXBlID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmdhbWUucmVuZGVyZXIucmVuZGVyU2Vzc2lvbi5yb3VuZFBpeGVscyA9IHRydWVcbiAgICAgICAgdGhpcy5nYW1lLnN0YWdlLmRpc2FibGVWaXNpYmlsaXR5Q2hhbmdlID0gdHJ1ZVxuICAgICAgICB0aGlzLnBoeXNpY3Muc3RhcnRTeXN0ZW0oUGhhc2VyLlBoeXNpY3MuQVJDQURFKVxuICAgIH0sXG5cbiAgICBwcmVsb2FkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5sb2FkLmltYWdlKCdidWxsZXQxMScsICcvaW1hZ2VzL2J1bGxldDExLnBuZycpXG4gICAgICAgIHRoaXMubG9hZC5pbWFnZSgnYnVsbGV0MTAnLCAnL2ltYWdlcy9idWxsZXQxMC5wbmcnKVxuICAgICAgICB0aGlzLmxvYWQuaW1hZ2UoJ2J1bGxldDknLCAnL2ltYWdlcy9idWxsZXQ5LnBuZycpXG4gICAgICAgIHRoaXMubG9hZC5pbWFnZSgnYnVsbGV0OCcsICcvaW1hZ2VzL2J1bGxldDgucG5nJylcbiAgICAgICAgdGhpcy5sb2FkLmltYWdlKCdidWxsZXQ3JywgJy9pbWFnZXMvYnVsbGV0Ny5wbmcnKVxuICAgICAgICB0aGlzLmxvYWQuaW1hZ2UoJ2J1bGxldDUnLCAnL2ltYWdlcy9idWxsZXQ1LnBuZycpXG4gICAgICAgIHRoaXMubG9hZC5pbWFnZSgnYnVsbGV0NCcsICcvaW1hZ2VzL2J1bGxldDQucG5nJylcbiAgICAgICAgdGhpcy5sb2FkLmltYWdlKCd0cmVlc2NhcGUnLCAnL2ltYWdlcy9tYXAtY3RmMS5wbmcnKVxuICAgICAgICB0aGlzLmxvYWQuaW1hZ2UoJ2dyb3VuZCcsICcvaW1hZ2VzL3BsYXRmb3JtLnBuZycpXG4gICAgICAgIHRoaXMubG9hZC5zcHJpdGVzaGVldCgnZHVkZScsICcvaW1hZ2VzL2R1ZGUucG5nJywgMzIsIDQ4KVxuICAgICAgICB0aGlzLmxvYWQuc3ByaXRlc2hlZXQoJ2VuZW15JywgJy9pbWFnZXMvZHVkZS5wbmcnLCAzMiwgNDgpXG4gICAgfSxcblxuICAgIGNyZWF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc29ja2V0ID0gaW8uY29ubmVjdCgpXG4gICAgICAgIHRoaXMuZW5lbWllcyA9IFtdXG5cbiAgICAgICAgLy8gIFdlJ3JlIGdvaW5nIHRvIGJlIHVzaW5nIHBoeXNpY3MsIHNvIGVuYWJsZSB0aGUgQXJjYWRlIFBoeXNpY3Mgc3lzdGVtXG4gICAgICAgIHRoaXMucGh5c2ljcy5zdGFydFN5c3RlbShQaGFzZXIuUGh5c2ljcy5BUkNBREUpXG5cbiAgICAgICAgdGhpcy53b3JsZC5zZXRCb3VuZHMoMCwgMCwgd29ybGRXaWR0aCwgd29ybGRIZWlnaHQpXG4gICAgICAgIHRoaXMuZ2FtZS5zdGFnZS5iYWNrZ3JvdW5kQ29sb3IgPSBcIiMyRjkxRDBcIlxuXG4gICAgICAgIC8vIFNjYWxlIGdhbWUgb24gd2luZG93IHJlc2l6ZVxuICAgICAgICB0aGlzLmdhbWUuc2NhbGUuc2NhbGVNb2RlID0gUGhhc2VyLlNjYWxlTWFuYWdlci5SRVNJWkU7XG4gICAgICAgIHRoaXMuZ2FtZS5zY2FsZS5zZXRTaG93QWxsKCk7XG4gICAgICAgIHRoaXMuZ2FtZS5zY2FsZS5yZWZyZXNoKClcblxuICAgICAgICAvKipcbiAgICAgICAgICogTWFwXG4gICAgICAgICAqL1xuICAgICAgICBNYXBDdGYxLmNyZWF0ZSh0aGlzKVxuXG4gICAgICAgIC8vIERlZmluZSBtb3ZlbWVudCBjb25zdGFudHNcbiAgICAgICAgdGhpcy5NQVhfU1BFRUQgPSA1MDA7IC8vIHBpeGVscy9zZWNvbmRcbiAgICAgICAgdGhpcy5BQ0NFTEVSQVRJT04gPSAxNTAwOyAvLyBwaXhlbHMvc2Vjb25kL3NlY29uZFxuICAgICAgICB0aGlzLkRSQUcgPSA2MDA7IC8vIHBpeGVscy9zZWNvbmRcbiAgICAgICAgdGhpcy5HUkFWSVRZID0gMjYwMDsgLy8gcGl4ZWxzL3NlY29uZC9zZWNvbmRcbiAgICAgICAgdGhpcy5KVU1QX1NQRUVEID0gLTEwMDA7IC8vIHBpeGVscy9zZWNvbmQgKG5lZ2F0aXZlIHkgaXMgdXApXG5cblxuICAgICAgICAvKipcbiAgICAgICAgICogUGxheWVyIFNldHRpbmdzXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnBsYXllciA9IHRoaXMuYWRkLnNwcml0ZSgyMDAsIHRoaXMud29ybGQuaGVpZ2h0IC0gNDAwLCAnZHVkZScpO1xuXG4gICAgICAgIC8vICBXZSBuZWVkIHRvIGVuYWJsZSBwaHlzaWNzIG9uIHRoZSBwbGF5ZXJcbiAgICAgICAgdGhpcy5waHlzaWNzLmFyY2FkZS5lbmFibGUodGhpcy5wbGF5ZXIpO1xuXG4gICAgICAgIC8vIEVuYWJsZSBwaHlzaWNzIG9uIHRoZSBwbGF5ZXJcbiAgICAgICAgdGhpcy5nYW1lLnBoeXNpY3MuZW5hYmxlKHRoaXMucGxheWVyLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuXG4gICAgICAgIC8vIE1ha2UgcGxheWVyIGNvbGxpZGUgd2l0aCB3b3JsZCBib3VuZGFyaWVzIHNvIGhlIGRvZXNuJ3QgbGVhdmUgdGhlIHN0YWdlXG4gICAgICAgIHRoaXMucGxheWVyLmJvZHkuY29sbGlkZVdvcmxkQm91bmRzID0gdHJ1ZTtcblxuICAgICAgICAvLyBTZXQgcGxheWVyIG1pbmltdW0gYW5kIG1heGltdW0gbW92ZW1lbnQgc3BlZWRcbiAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5tYXhWZWxvY2l0eS5zZXRUbyh0aGlzLk1BWF9TUEVFRCwgdGhpcy5NQVhfU1BFRUQgKiAxMCk7IC8vIHgsIHlcblxuICAgICAgICAvLyBBZGQgZHJhZyB0byB0aGUgcGxheWVyIHRoYXQgc2xvd3MgdGhlbSBkb3duIHdoZW4gdGhleSBhcmUgbm90IGFjY2VsZXJhdGluZ1xuICAgICAgICB0aGlzLnBsYXllci5ib2R5LmRyYWcuc2V0VG8odGhpcy5EUkFHLCAwKTsgLy8geCwgeVxuXG4gICAgICAgIC8vIFNpbmNlIHdlJ3JlIGp1bXBpbmcgd2UgbmVlZCBncmF2aXR5XG4gICAgICAgIGdhbWUucGh5c2ljcy5hcmNhZGUuZ3Jhdml0eS55ID0gdGhpcy5HUkFWSVRZO1xuXG4gICAgICAgIC8vIEZsYWcgdG8gdHJhY2sgaWYgdGhlIGp1bXAgYnV0dG9uIGlzIHByZXNzZWRcbiAgICAgICAgdGhpcy5qdW1waW5nID0gZmFsc2U7XG5cblxuICAgICAgICAvLyAgT3VyIHR3byBhbmltYXRpb25zLCB3YWxraW5nIGxlZnQgYW5kIHJpZ2h0LlxuICAgICAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLmFkZCgnbGVmdCcsIFswLCAxLCAyLCAzXSwgMTAsIHRydWUpXG4gICAgICAgIHRoaXMucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdyaWdodCcsIFs1LCA2LCA3LCA4XSwgMTAsIHRydWUpXG5cblxuXG5cblxuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvbnRyb2wgU2V0dGluZ3NcbiAgICAgICAgICovXG4gICAgICAgIC8vIHRoaXMudXBCdXR0b24gPSB0aGlzLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuVyk7XG4gICAgICAgIC8vIHRoaXMuZG93bkJ1dHRvbiA9IHRoaXMuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5TKTtcbiAgICAgICAgLy8gdGhpcy5sZWZ0QnV0dG9uID0gdGhpcy5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLkEpO1xuICAgICAgICAvLyB0aGlzLnJpZ2h0QnV0dG9uID0gdGhpcy5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLkQpO1xuXG5cbiAgICAgICAgLy8gQ2FwdHVyZSBjZXJ0YWluIGtleXMgdG8gcHJldmVudCB0aGVpciBkZWZhdWx0IGFjdGlvbnMgaW4gdGhlIGJyb3dzZXIuXG4gICAgICAgIC8vIFRoaXMgaXMgb25seSBuZWNlc3NhcnkgYmVjYXVzZSB0aGlzIGlzIGFuIEhUTUw1IGdhbWUuIEdhbWVzIG9uIG90aGVyXG4gICAgICAgIC8vIHBsYXRmb3JtcyBtYXkgbm90IG5lZWQgY29kZSBsaWtlIHRoaXMuXG4gICAgICAgIHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXlDYXB0dXJlKFtcbiAgICAgICAgICAgIFBoYXNlci5LZXlib2FyZC5XLFxuICAgICAgICAgICAgUGhhc2VyLktleWJvYXJkLlMsXG4gICAgICAgICAgICBQaGFzZXIuS2V5Ym9hcmQuQSxcbiAgICAgICAgICAgIFBoYXNlci5LZXlib2FyZC5EXG4gICAgICAgIF0pO1xuXG5cblxuICAgICAgICAvKipcbiAgICAgICAgICogV2VhcG9uc1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jdXJyZW50V2VhcG9uID0gMDtcblxuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IHRoaXMud2VhcG9ucy5sZW5ndGg7IGkrKylcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy53ZWFwb25zW2ldLnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMud2VhcG9ucy5wdXNoKG5ldyBXZWFwb24uQWs0Nyh0aGlzLmdhbWUpKTtcbiAgICAgICAgdGhpcy53ZWFwb25zLnB1c2gobmV3IFdlYXBvbi5TY2F0dGVyU2hvdCh0aGlzLmdhbWUpKTtcbiAgICAgICAgdGhpcy53ZWFwb25zLnB1c2gobmV3IFdlYXBvbi5CZWFtKHRoaXMuZ2FtZSkpO1xuICAgICAgICB0aGlzLndlYXBvbnMucHVzaChuZXcgV2VhcG9uLlNwbGl0U2hvdCh0aGlzLmdhbWUpKTtcbiAgICAgICAgdGhpcy53ZWFwb25zLnB1c2gobmV3IFdlYXBvbi5QYXR0ZXJuKHRoaXMuZ2FtZSkpO1xuICAgICAgICB0aGlzLndlYXBvbnMucHVzaChuZXcgV2VhcG9uLlJvY2tldHModGhpcy5nYW1lKSk7XG4gICAgICAgIHRoaXMud2VhcG9ucy5wdXNoKG5ldyBXZWFwb24uU2NhbGVCdWxsZXQodGhpcy5nYW1lKSk7XG5cblxuICAgICAgICAvKipcbiAgICAgICAgICogVGV4dFxuICAgICAgICAgKi9cbiAgICAgICAgbGV0IHRleHRTdHlsZXMgPSB7IGZvbnRTaXplOiAnMjRweCcsIGZpbGw6ICcjMDAwJyB9XG4gICAgICAgIHRoaXMuc2NvcmVUZXh0ID0gdGhpcy5hZGQudGV4dCgyNSwgMjUsICdTY29yZTogMCcsIHRleHRTdHlsZXMpXG4gICAgICAgIHRoaXMuc2NvcmVUZXh0LmZpeGVkVG9DYW1lcmEgPSB0cnVlXG4gICAgICAgIHRoaXMud2VhcG9uTmFtZSA9IHRoaXMuYWRkLnRleHQodGhpcy5jYW1lcmEud2lkdGggLSAxMDAsIHRoaXMuY2FtZXJhLmhlaWdodCAtIDQ1LCAnQUstNDcnLCB0ZXh0U3R5bGVzKVxuICAgICAgICB0aGlzLndlYXBvbk5hbWUuZml4ZWRUb0NhbWVyYSA9IHRydWVcbiAgICAgICAgdGhpcy5jdXJyZW50SGVhbHRoVGV4dCA9IHRoaXMuYWRkLnRleHQodGhpcy5jYW1lcmEueCArIDI1LCB0aGlzLmNhbWVyYS5oZWlnaHQgLSA0NSwgJzEwMCcsIHRleHRTdHlsZXMpXG4gICAgICAgIHRoaXMuY3VycmVudEhlYWx0aFRleHQuZml4ZWRUb0NhbWVyYSA9IHRydWVcblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDYW1lcmEgU2V0dGluZ3NcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2FtZXJhLmZvbGxvdyh0aGlzLnBsYXllcik7XG5cbiAgICAgICAgdmFyIGNoYW5nZUtleSA9IHRoaXMuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5FTlRFUik7XG4gICAgICAgIGNoYW5nZUtleS5vbkRvd24uYWRkKHRoaXMubmV4dFdlYXBvbiwgdGhpcylcblxuXG5cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5zY2FsZS5yZWZyZXNoKClcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHRcbiAgICAgICAgICAgIHRoaXMuZ2FtZS53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXG5cbiAgICAgICAgICAgIHRoaXMud2VhcG9uTmFtZS5jYW1lcmFPZmZzZXQueCA9IHRoaXMuY2FtZXJhLndpZHRoIC0gMTAwXG4gICAgICAgICAgICB0aGlzLndlYXBvbk5hbWUuY2FtZXJhT2Zmc2V0LnkgPSB0aGlzLmNhbWVyYS5oZWlnaHQgLSA0NVxuXG4gICAgICAgICAgICB0aGlzLnNjb3JlVGV4dC5jYW1lcmFPZmZzZXQueCA9IDI1XG4gICAgICAgICAgICB0aGlzLnNjb3JlVGV4dC5jYW1lcmFPZmZzZXQueSA9IDI1XG4gICAgICAgIH0pXG5cblxuXG5cblxuICAgICAgICAvKipcbiAgICAgICAgICogU3RhcnQgbGlzdGVuaW5nIGZvciBldmVudHNcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuc2V0RXZlbnRIYW5kbGVycygpXG4gICAgfSxcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vICBDb2xsaWRlIHRoZSBwbGF5ZXIgYW5kIHRoZSBzdGFycyB3aXRoIHRoZSBwbGF0Zm9ybXNcbiAgICAgICAgdGhpcy5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMucGxheWVyLCB0aGlzLnBsYXRmb3JtcylcbiAgICAgICAgdGhpcy5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMucGxhdGZvcm1zLCB0aGlzLndlYXBvbnMsIGZ1bmN0aW9uKHBsYXRmb3JtLCB3ZWFwb24pIHtcbiAgICAgICAgICAgIHdlYXBvbi5raWxsKClcbiAgICAgICAgfSwgbnVsbCwgdGhpcyk7XG5cblxuICAgICAgICBpZiAodGhpcy5sZWZ0SW5wdXRJc0FjdGl2ZSgpKSB7XG4gICAgICAgICAgICAvLyBJZiB0aGUgTEVGVCBrZXkgaXMgZG93biwgc2V0IHRoZSBwbGF5ZXIgdmVsb2NpdHkgdG8gbW92ZSBsZWZ0XG4gICAgICAgICAgICB0aGlzLnBsYXllci5ib2R5LmFjY2VsZXJhdGlvbi54ID0gLXRoaXMuQUNDRUxFUkFUSU9OO1xuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdsZWZ0JylcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnJpZ2h0SW5wdXRJc0FjdGl2ZSgpKSB7XG4gICAgICAgICAgICAvLyBJZiB0aGUgUklHSFQga2V5IGlzIGRvd24sIHNldCB0aGUgcGxheWVyIHZlbG9jaXR5IHRvIG1vdmUgcmlnaHRcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmJvZHkuYWNjZWxlcmF0aW9uLnggPSB0aGlzLkFDQ0VMRVJBVElPTjtcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmFuaW1hdGlvbnMucGxheSgncmlnaHQnKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gU3RhbmQgc3RpbGxcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmJvZHkuYWNjZWxlcmF0aW9uLnggPSAwXG4gICAgICAgICAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLnN0b3AoKVxuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuZnJhbWUgPSA0XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZXQgYSB2YXJpYWJsZSB0aGF0IGlzIHRydWUgd2hlbiB0aGUgcGxheWVyIGlzIHRvdWNoaW5nIHRoZSBncm91bmRcbiAgICAgICAgdmFyIG9uVGhlR3JvdW5kID0gdGhpcy5wbGF5ZXIuYm9keS50b3VjaGluZy5kb3duO1xuXG4gICAgICAgIC8vIElmIHRoZSBwbGF5ZXIgaXMgdG91Y2hpbmcgdGhlIGdyb3VuZCwgbGV0IGhpbSBoYXZlIDIganVtcHNcbiAgICAgICAgaWYgKG9uVGhlR3JvdW5kKSB7XG4gICAgICAgICAgICB0aGlzLmp1bXBzID0gMjtcbiAgICAgICAgICAgIHRoaXMuanVtcGluZyA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSnVtcCFcbiAgICAgICAgaWYgKHRoaXMuanVtcHMgPiAwICYmIHRoaXMudXBJbnB1dElzQWN0aXZlKDUpKSB7XG4gICAgICAgICAgICB0aGlzLnBsYXllci5ib2R5LnZlbG9jaXR5LnkgPSB0aGlzLkpVTVBfU1BFRUQ7XG4gICAgICAgICAgICB0aGlzLmp1bXBpbmcgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVkdWNlIHRoZSBudW1iZXIgb2YgYXZhaWxhYmxlIGp1bXBzIGlmIHRoZSBqdW1wIGlucHV0IGlzIHJlbGVhc2VkXG4gICAgICAgIGlmICh0aGlzLmp1bXBpbmcgJiYgdGhpcy51cElucHV0UmVsZWFzZWQoKSkge1xuICAgICAgICAgICAgdGhpcy5qdW1wcy0tO1xuICAgICAgICAgICAgdGhpcy5qdW1waW5nID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5nYW1lLmlucHV0LmFjdGl2ZVBvaW50ZXIuaXNEb3duKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS5maXJlKHRoaXMucGxheWVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ21vdmUgcGxheWVyJywgeyB4OiB0aGlzLnBsYXllci54LCB5OiB0aGlzLnBsYXllci55IH0pXG4gICAgfSxcblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gc2hvdWxkIHJldHVybiB0cnVlIHdoZW4gdGhlIHBsYXllciBhY3RpdmF0ZXMgdGhlIFwiZ28gbGVmdFwiIGNvbnRyb2xcbiAgICAvLyBJbiB0aGlzIGNhc2UsIGVpdGhlciBob2xkaW5nIHRoZSByaWdodCBhcnJvdyBvciB0YXBwaW5nIG9yIGNsaWNraW5nIG9uIHRoZSBsZWZ0XG4gICAgLy8gc2lkZSBvZiB0aGUgc2NyZWVuLlxuICAgIGxlZnRJbnB1dElzQWN0aXZlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGlzQWN0aXZlID0gZmFsc2U7XG5cbiAgICAgICAgaXNBY3RpdmUgPSB0aGlzLmlucHV0LmtleWJvYXJkLmlzRG93bihQaGFzZXIuS2V5Ym9hcmQuQSk7XG5cbiAgICAgICAgcmV0dXJuIGlzQWN0aXZlO1xuICAgIH0sXG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIHNob3VsZCByZXR1cm4gdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgYWN0aXZhdGVzIHRoZSBcImdvIHJpZ2h0XCIgY29udHJvbFxuICAgIC8vIEluIHRoaXMgY2FzZSwgZWl0aGVyIGhvbGRpbmcgdGhlIHJpZ2h0IGFycm93IG9yIHRhcHBpbmcgb3IgY2xpY2tpbmcgb24gdGhlIHJpZ2h0XG4gICAgLy8gc2lkZSBvZiB0aGUgc2NyZWVuLlxuICAgIHJpZ2h0SW5wdXRJc0FjdGl2ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBpc0FjdGl2ZSA9IGZhbHNlO1xuXG4gICAgICAgIGlzQWN0aXZlID0gdGhpcy5pbnB1dC5rZXlib2FyZC5pc0Rvd24oUGhhc2VyLktleWJvYXJkLkQpO1xuXG4gICAgICAgIHJldHVybiBpc0FjdGl2ZTtcbiAgICB9LFxuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiBzaG91bGQgcmV0dXJuIHRydWUgd2hlbiB0aGUgcGxheWVyIGFjdGl2YXRlcyB0aGUgXCJqdW1wXCIgY29udHJvbFxuICAgIC8vIEluIHRoaXMgY2FzZSwgZWl0aGVyIGhvbGRpbmcgdGhlIHVwIGFycm93IG9yIHRhcHBpbmcgb3IgY2xpY2tpbmcgb24gdGhlIGNlbnRlclxuICAgIC8vIHBhcnQgb2YgdGhlIHNjcmVlbi5cbiAgICB1cElucHV0SXNBY3RpdmU6IGZ1bmN0aW9uKGR1cmF0aW9uKSB7XG4gICAgICAgIHZhciBpc0FjdGl2ZSA9IGZhbHNlO1xuXG4gICAgICAgIGlzQWN0aXZlID0gdGhpcy5pbnB1dC5rZXlib2FyZC5kb3duRHVyYXRpb24oUGhhc2VyLktleWJvYXJkLlcsIGR1cmF0aW9uKTtcblxuICAgICAgICByZXR1cm4gaXNBY3RpdmU7XG4gICAgfSxcblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gcmV0dXJucyB0cnVlIHdoZW4gdGhlIHBsYXllciByZWxlYXNlcyB0aGUgXCJqdW1wXCIgY29udHJvbFxuICAgIHVwSW5wdXRSZWxlYXNlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWxlYXNlZCA9IGZhbHNlO1xuXG4gICAgICAgIHJlbGVhc2VkID0gdGhpcy5pbnB1dC5rZXlib2FyZC51cER1cmF0aW9uKFBoYXNlci5LZXlib2FyZC5XKTtcblxuICAgICAgICByZXR1cm4gcmVsZWFzZWQ7XG4gICAgfSxcblxuICAgIG5leHRXZWFwb246IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyAgVGlkeS11cCB0aGUgY3VycmVudCB3ZWFwb25cbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFdlYXBvbiA+IDkpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLnJlc2V0KCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS5jYWxsQWxsKCdyZXNldCcsIG51bGwsIDAsIDApO1xuICAgICAgICAgICAgdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0uc2V0QWxsKCdleGlzdHMnLCBmYWxzZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyAgQWN0aXZhdGUgdGhlIG5ldyBvbmVcbiAgICAgICAgdGhpcy5jdXJyZW50V2VhcG9uKys7XG5cbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFdlYXBvbiA9PT0gdGhpcy53ZWFwb25zLmxlbmd0aClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50V2VhcG9uID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLnZpc2libGUgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMud2VhcG9uTmFtZS50ZXh0ID0gdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0ubmFtZTtcbiAgICB9LFxuXG4gICAgc2V0RXZlbnRIYW5kbGVyczogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBTb2NrZXQgY29ubmVjdGlvbiBzdWNjZXNzZnVsXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdjb25uZWN0JywgdGhpcy5vblNvY2tldENvbm5lY3RlZC5iaW5kKHRoaXMpKVxuXG4gICAgICAgIC8vIFNvY2tldCBkaXNjb25uZWN0aW9uXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdkaXNjb25uZWN0JywgdGhpcy5vblNvY2tldERpc2Nvbm5lY3QuYmluZCh0aGlzKSlcblxuICAgICAgICAvLyBOZXcgcGxheWVyIG1lc3NhZ2UgcmVjZWl2ZWRcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ25ldyBwbGF5ZXInLCB0aGlzLm9uTmV3UGxheWVyLmJpbmQodGhpcykpXG5cbiAgICAgICAgLy8gUGxheWVyIG1vdmUgbWVzc2FnZSByZWNlaXZlZFxuICAgICAgICB0aGlzLnNvY2tldC5vbignbW92ZSBwbGF5ZXInLCB0aGlzLm9uTW92ZVBsYXllci5iaW5kKHRoaXMpKVxuXG4gICAgICAgIC8vIFBsYXllciByZW1vdmVkIG1lc3NhZ2UgcmVjZWl2ZWRcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ3JlbW92ZSBwbGF5ZXInLCB0aGlzLm9uUmVtb3ZlUGxheWVyLmJpbmQodGhpcykpXG4gICAgfSxcblxuICAgIC8vIFNvY2tldCBjb25uZWN0ZWRcbiAgICBvblNvY2tldENvbm5lY3RlZDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBjb25zb2xlLmxvZygnQ29ubmVjdGVkIHRvIHNvY2tldCBzZXJ2ZXInKVxuXG4gICAgICAgICAvLyBSZXNldCBlbmVtaWVzIG9uIHJlY29ubmVjdFxuICAgICAgICB0aGlzLmVuZW1pZXMuZm9yRWFjaChmdW5jdGlvbiAoZW5lbXkpIHtcbiAgICAgICAgICAgIGVuZW15LnBsYXllci5raWxsKClcbiAgICAgICAgfSlcbiAgICAgICAgdGhpcy5lbmVtaWVzID0gW11cblxuICAgICAgICAvLyBTZW5kIGxvY2FsIHBsYXllciBkYXRhIHRvIHRoZSBnYW1lIHNlcnZlclxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCduZXcgcGxheWVyJywge1xuICAgICAgICAgICAgY2xpZW50SWQ6IHRoaXMuY2xpZW50SWQsXG4gICAgICAgICAgICB4OiB0aGlzLnBsYXllci54LFxuICAgICAgICAgICAgeTogdGhpcy5wbGF5ZXIueVxuICAgICAgICB9KVxuICAgIH0sXG5cbiAgICAvLyBTb2NrZXQgZGlzY29ubmVjdGVkXG4gICAgb25Tb2NrZXREaXNjb25uZWN0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0Rpc2Nvbm5lY3RlZCBmcm9tIHNvY2tldCBzZXJ2ZXInKVxuICAgIH0sXG5cbiAgICAvLyBOZXcgcGxheWVyXG4gICAgb25OZXdQbGF5ZXI6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ05ldyBwbGF5ZXIgY29ubmVjdGVkOicsIGRhdGEuaWQpXG5cbiAgICAgICAgLy8gQXZvaWQgcG9zc2libGUgZHVwbGljYXRlIHBsYXllcnNcbiAgICAgICAgdmFyIGR1cGxpY2F0ZSA9IHRoaXMucGxheWVyQnlJZChkYXRhLmlkKVxuICAgICAgICBpZiAoZHVwbGljYXRlIHx8IGRhdGEuY2xpZW50SWQgPT09IHRoaXMuY2xpZW50SWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdEdXBsaWNhdGUgcGxheWVyIScpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFkZCBuZXcgcGxheWVyIHRvIHRoZSByZW1vdGUgcGxheWVycyBhcnJheVxuICAgICAgICBsZXQgbmV3UmVtb3RlUGxheWVyID0gUmVtb3RlUGxheWVyLmNyZWF0ZShkYXRhLmlkLCB0aGlzLmdhbWUsIHRoaXMucGxheWVyLCBkYXRhLngsIGRhdGEueSlcbiAgICAgICAgdGhpcy5lbmVtaWVzLnB1c2gobmV3UmVtb3RlUGxheWVyKVxuICAgICAgICB0aGlzLmVuZW1pZXNbdGhpcy5lbmVtaWVzLmxlbmd0aCAtIDFdLnBsYXllci5hbmltYXRpb25zLmFkZCgnbGVmdCcsIFswLCAxLCAyLCAzXSwgMTAsIHRydWUpXG4gICAgICAgIHRoaXMuZW5lbWllc1t0aGlzLmVuZW1pZXMubGVuZ3RoIC0gMV0ucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdyaWdodCcsIFs1LCA2LCA3LCA4XSwgMTAsIHRydWUpXG4gICAgfSxcblxuICAgIC8vIE1vdmUgcGxheWVyXG4gICAgb25Nb3ZlUGxheWVyOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBtb3ZlUGxheWVyID0gdGhpcy5wbGF5ZXJCeUlkKGRhdGEuaWQpXG5cbiAgICAgICAgLy8gUGxheWVyIG5vdCBmb3VuZFxuICAgICAgICBpZiAoISBtb3ZlUGxheWVyKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFVwZGF0ZSBwbGF5ZXIgcG9zaXRpb25cbiAgICAgICAgbW92ZVBsYXllci5wbGF5ZXIueCA9IGRhdGEueFxuICAgICAgICBtb3ZlUGxheWVyLnBsYXllci55ID0gZGF0YS55XG5cbiAgICAgICAgaWYgKG1vdmVQbGF5ZXIucGxheWVyLnggPiBtb3ZlUGxheWVyLmxhc3RQb3NpdGlvbi54KSB7XG4gICAgICAgICAgICBtb3ZlUGxheWVyLnBsYXllci5hbmltYXRpb25zLnBsYXkoJ3JpZ2h0JylcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChtb3ZlUGxheWVyLnBsYXllci54IDwgbW92ZVBsYXllci5sYXN0UG9zaXRpb24ueClcbiAgICAgICAge1xuICAgICAgICAgICAgbW92ZVBsYXllci5wbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdsZWZ0JylcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgIHtcbiAgICAgICAgICAgIG1vdmVQbGF5ZXIucGxheWVyLmFuaW1hdGlvbnMuc3RvcCgpXG4gICAgICAgICAgICBtb3ZlUGxheWVyLnBsYXllci5mcmFtZSA9IDQ7XG4gICAgICAgIH1cblxuICAgICAgICBtb3ZlUGxheWVyLmxhc3RQb3NpdGlvbi54ID0gbW92ZVBsYXllci5wbGF5ZXIueFxuICAgICAgICBtb3ZlUGxheWVyLmxhc3RQb3NpdGlvbi55ID0gbW92ZVBsYXllci5wbGF5ZXIueVxuICAgIH0sXG5cbiAgICAvLyBSZW1vdmUgcGxheWVyXG4gICAgb25SZW1vdmVQbGF5ZXI6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIHJlbW92ZVBsYXllciA9IHRoaXMucGxheWVyQnlJZChkYXRhLmlkKVxuXG4gICAgICAgIC8vIFBsYXllciBub3QgZm91bmRcbiAgICAgICAgaWYgKCFyZW1vdmVQbGF5ZXIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdQbGF5ZXIgbm90IGZvdW5kOiAnLCBkYXRhLmlkKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICByZW1vdmVQbGF5ZXIucGxheWVyLmtpbGwoKVxuXG4gICAgICAgIC8vIFJlbW92ZSBwbGF5ZXIgZnJvbSBhcnJheVxuICAgICAgICB0aGlzLmVuZW1pZXMuc3BsaWNlKHRoaXMuZW5lbWllcy5pbmRleE9mKHJlbW92ZVBsYXllciksIDEpXG4gICAgfSxcblxuICAgIC8vIEZpbmQgcGxheWVyIGJ5IElEXG4gICAgcGxheWVyQnlJZDogZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmVuZW1pZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmVuZW1pZXNbaV0ucGxheWVyLm5hbWUgPT09IGlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZW5lbWllc1tpXVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxufVxuXG52YXIgQnVsbGV0ID0gZnVuY3Rpb24gKGdhbWUsIGtleSkge1xuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCAwLCAwLCBrZXkpO1xuXG4gICAgdGhpcy50ZXh0dXJlLmJhc2VUZXh0dXJlLnNjYWxlTW9kZSA9IFBJWEkuc2NhbGVNb2Rlcy5ORUFSRVNUO1xuXG4gICAgdGhpcy5hbmNob3Iuc2V0KDAuNSk7XG5cbiAgICB0aGlzLmNoZWNrV29ybGRCb3VuZHMgPSB0cnVlO1xuICAgIHRoaXMub3V0T2ZCb3VuZHNLaWxsID0gdHJ1ZTtcbiAgICB0aGlzLmV4aXN0cyA9IGZhbHNlO1xuXG4gICAgdGhpcy50cmFja2luZyA9IGZhbHNlO1xuICAgIHRoaXMuc2NhbGVTcGVlZCA9IDA7XG5cbn07XG5cbkJ1bGxldC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TcHJpdGUucHJvdG90eXBlKTtcbkJ1bGxldC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBCdWxsZXQ7XG5cbkJ1bGxldC5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uICh4LCB5LCBhbmdsZSwgc3BlZWQsIGd4LCBneSkge1xuXG4gICAgZ3ggPSBneCB8fCAwXG4gICAgZ3kgPSBneSB8fCAwXG4gICAgdGhpcy5yZXNldCh4LCB5KTtcbiAgICB0aGlzLnNjYWxlLnNldCgxKTtcblxuICAgIGdhbWUucGh5c2ljcy5hcmNhZGUubW92ZVRvUG9pbnRlcih0aGlzLCBzcGVlZCk7XG59XG5cbkJ1bGxldC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnRyYWNraW5nKVxuICAgIHtcbiAgICAgICAgdGhpcy5yb3RhdGlvbiA9IE1hdGguYXRhbjIodGhpcy5ib2R5LnZlbG9jaXR5LnksIHRoaXMuYm9keS52ZWxvY2l0eS54KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zY2FsZVNwZWVkID4gMClcbiAgICB7XG4gICAgICAgIHRoaXMuc2NhbGUueCArPSB0aGlzLnNjYWxlU3BlZWQ7XG4gICAgICAgIHRoaXMuc2NhbGUueSArPSB0aGlzLnNjYWxlU3BlZWQ7XG4gICAgfVxufVxuXG52YXIgV2VhcG9uID0ge307XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vICBBIHNpbmdsZSBidWxsZXQgaXMgZmlyZWQgaW4gZnJvbnQgb2YgdGhlIHNoaXAgLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLyoqXG4gKiBQcmltYXJ5IFdlYXBvbnNcbiAqIDEuIERlc2VydCBFYWdsZXNcbiAqIDIuIEhLIE1QNVxuICogMy4gQUs0N1xuICogNC4gTTE2XG4gKiA1LiBTcGFzLTEyXG4gKiA2LiBSdWdlciA3N1xuICogNy4gTTc5XG4gKiA4LiBCYXJyZXQgTTgyQTFcbiAqIDkuIEZOIE1pbmltaVxuICogMTAuIFhNMjE0IE1pbmlndW5cbiAqL1xuXG4vKipcbiAqIFNlY29uZGFyeSBXZWFwb25zXG4gKiAxLiBVU1NPQ09NXG4gKiAyLiBDb21iYXQgS25pZmVcbiAqIDMuIENoYWluc2F3XG4gKiA0LiBNNzIgTGF3XG4gKi9cblxuV2VhcG9uLkFrNDcgPSBmdW5jdGlvbiAoZ2FtZSkge1xuXG4gICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgZ2FtZSwgZ2FtZS53b3JsZCwgJ0FLLTQ3JywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG5cbiAgICB0aGlzLm5leHRGaXJlID0gMDtcbiAgICB0aGlzLmJ1bGxldFNwZWVkID0gMTMwMDtcbiAgICB0aGlzLmZpcmVSYXRlID0gMTAwO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA2NDsgaSsrKVxuICAgIHtcbiAgICAgICAgdGhpcy5hZGQobmV3IEJ1bGxldChnYW1lLCAnYnVsbGV0NScpLCB0cnVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcblxufTtcblxuV2VhcG9uLkFrNDcucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcbldlYXBvbi5BazQ3LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFdlYXBvbi5BazQ3O1xuXG5XZWFwb24uQWs0Ny5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uIChzb3VyY2UpIHtcblxuICAgIGlmICh0aGlzLmdhbWUudGltZS50aW1lIDwgdGhpcy5uZXh0RmlyZSlcbiAgICAgICAgcmV0dXJuXG5cbiAgICB2YXIgeCA9IHNvdXJjZS54ICsgMjI7XG4gICAgdmFyIHkgPSBzb3VyY2UueSArIDMwO1xuXG4gICAgdGhpcy5nZXRGaXJzdEV4aXN0cyhmYWxzZSkuZmlyZSh4LCB5LCAwLCB0aGlzLmJ1bGxldFNwZWVkLCAwLCAwKTtcbiAgICB0aGlzLnNldEFsbCgndHJhY2tpbmcnLCB0cnVlKVxuXG4gICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMuZ2FtZS50aW1lLnRpbWUgKyB0aGlzLmZpcmVSYXRlXG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gIEJ1bGxldHMgYXJlIGZpcmVkIG91dCBzY2F0dGVyZWQgb24gdGhlIHkgYXhpcyAvL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5XZWFwb24uU2NhdHRlclNob3QgPSBmdW5jdGlvbiAoZ2FtZSkge1xuXG4gICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgZ2FtZSwgZ2FtZS53b3JsZCwgJ1NjYXR0ZXIgU2hvdCcsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuXG4gICAgdGhpcy5uZXh0RmlyZSA9IDA7XG4gICAgdGhpcy5idWxsZXRTcGVlZCA9IDYwMDtcbiAgICB0aGlzLmZpcmVSYXRlID0gNDA7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDMyOyBpKyspXG4gICAge1xuICAgICAgICB0aGlzLmFkZChuZXcgQnVsbGV0KGdhbWUsICdidWxsZXQ1JyksIHRydWUpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuXG59O1xuXG5XZWFwb24uU2NhdHRlclNob3QucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcbldlYXBvbi5TY2F0dGVyU2hvdC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBXZWFwb24uU2NhdHRlclNob3Q7XG5cbldlYXBvbi5TY2F0dGVyU2hvdC5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uIChzb3VyY2UpIHtcblxuICAgIGlmICh0aGlzLmdhbWUudGltZS50aW1lIDwgdGhpcy5uZXh0RmlyZSkgeyByZXR1cm47IH1cblxuICAgIHZhciB4ID0gc291cmNlLnggKyAxNjtcbiAgICB2YXIgeSA9IChzb3VyY2UueSArIHNvdXJjZS5oZWlnaHQgLyAyKSArIHRoaXMuZ2FtZS5ybmQuYmV0d2VlbigtMTAsIDEwKTtcblxuICAgIHZhciBidWxsZXRJbnN0YW5jZSA9IHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpXG5cbiAgICBpZiAoIWJ1bGxldEluc3RhbmNlKSByZXR1cm5cblxuICAgIGJ1bGxldEluc3RhbmNlLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgMCk7XG5cbiAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5nYW1lLnRpbWUudGltZSArIHRoaXMuZmlyZVJhdGU7XG5cbn07XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyAgRmlyZXMgYSBzdHJlYW1pbmcgYmVhbSBvZiBsYXplcnMsIHZlcnkgZmFzdCwgaW4gZnJvbnQgb2YgdGhlIHBsYXllciAvL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuV2VhcG9uLkJlYW0gPSBmdW5jdGlvbiAoZ2FtZSkge1xuXG4gICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgZ2FtZSwgZ2FtZS53b3JsZCwgJ0JlYW0nLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcblxuICAgIHRoaXMubmV4dEZpcmUgPSAwO1xuICAgIHRoaXMuYnVsbGV0U3BlZWQgPSAxMDAwO1xuICAgIHRoaXMuZmlyZVJhdGUgPSA0NTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNjQ7IGkrKylcbiAgICB7XG4gICAgICAgIHRoaXMuYWRkKG5ldyBCdWxsZXQoZ2FtZSwgJ2J1bGxldDExJyksIHRydWUpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuXG59O1xuXG5XZWFwb24uQmVhbS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuV2VhcG9uLkJlYW0ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gV2VhcG9uLkJlYW07XG5cbldlYXBvbi5CZWFtLnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24gKHNvdXJjZSkge1xuXG4gICAgaWYgKHRoaXMuZ2FtZS50aW1lLnRpbWUgPCB0aGlzLm5leHRGaXJlKSB7IHJldHVybjsgfVxuXG4gICAgdmFyIHggPSBzb3VyY2UueCArIDQwO1xuICAgIHZhciB5ID0gc291cmNlLnkgKyAxMDtcblxuICAgIHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgMCk7XG5cbiAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5nYW1lLnRpbWUudGltZSArIHRoaXMuZmlyZVJhdGU7XG5cbn07XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyAgQSB0aHJlZS13YXkgZmlyZSB3aGVyZSB0aGUgdG9wIGFuZCBib3R0b20gYnVsbGV0cyBiZW5kIG9uIGEgcGF0aCAvL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuV2VhcG9uLlNwbGl0U2hvdCA9IGZ1bmN0aW9uIChnYW1lKSB7XG5cbiAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCBnYW1lLCBnYW1lLndvcmxkLCAnU3BsaXQgU2hvdCcsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuXG4gICAgdGhpcy5uZXh0RmlyZSA9IDA7XG4gICAgdGhpcy5idWxsZXRTcGVlZCA9IDcwMDtcbiAgICB0aGlzLmZpcmVSYXRlID0gNDA7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDY0OyBpKyspXG4gICAge1xuICAgICAgICB0aGlzLmFkZChuZXcgQnVsbGV0KGdhbWUsICdidWxsZXQ4JyksIHRydWUpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuXG59O1xuXG5XZWFwb24uU3BsaXRTaG90LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLkdyb3VwLnByb3RvdHlwZSk7XG5XZWFwb24uU3BsaXRTaG90LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFdlYXBvbi5TcGxpdFNob3Q7XG5cbldlYXBvbi5TcGxpdFNob3QucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbiAoc291cmNlKSB7XG4gICAgaWYgKHRoaXMuZ2FtZS50aW1lLnRpbWUgPCB0aGlzLm5leHRGaXJlKSB7IHJldHVybjsgfVxuXG4gICAgdmFyIHggPSBzb3VyY2UueCArIDIwXG4gICAgdmFyIHkgPSBzb3VyY2UueSArIDEwXG5cbiAgICB0aGlzLmdldEZpcnN0RXhpc3RzKGZhbHNlKS5maXJlKHgsIHksIDAsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIC01MDApXG4gICAgdGhpcy5nZXRGaXJzdEV4aXN0cyhmYWxzZSkuZmlyZSh4LCB5LCAwLCB0aGlzLmJ1bGxldFNwZWVkLCAwLCAwKVxuICAgIHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgNTAwKVxuXG4gICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMuZ2FtZS50aW1lLnRpbWUgKyB0aGlzLmZpcmVSYXRlO1xufVxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gIEJ1bGxldHMgaGF2ZSBHcmF2aXR5Lnkgc2V0IG9uIGEgcmVwZWF0aW5nIHByZS1jYWxjdWxhdGVkIHBhdHRlcm4gLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbldlYXBvbi5QYXR0ZXJuID0gZnVuY3Rpb24gKGdhbWUpIHtcblxuICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGdhbWUsIGdhbWUud29ybGQsICdQYXR0ZXJuJywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG5cbiAgICB0aGlzLm5leHRGaXJlID0gMDtcbiAgICB0aGlzLmJ1bGxldFNwZWVkID0gNjAwO1xuICAgIHRoaXMuZmlyZVJhdGUgPSA0MDtcblxuICAgIHRoaXMucGF0dGVybiA9IFBoYXNlci5BcnJheVV0aWxzLm51bWJlckFycmF5U3RlcCgtODAwLCA4MDAsIDIwMCk7XG4gICAgdGhpcy5wYXR0ZXJuID0gdGhpcy5wYXR0ZXJuLmNvbmNhdChQaGFzZXIuQXJyYXlVdGlscy5udW1iZXJBcnJheVN0ZXAoODAwLCAtODAwLCAtMjAwKSk7XG5cbiAgICB0aGlzLnBhdHRlcm5JbmRleCA9IDA7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDY0OyBpKyspXG4gICAge1xuICAgICAgICB0aGlzLmFkZChuZXcgQnVsbGV0KGdhbWUsICdidWxsZXQ0JyksIHRydWUpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuXG59O1xuXG5XZWFwb24uUGF0dGVybi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuV2VhcG9uLlBhdHRlcm4ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gV2VhcG9uLlBhdHRlcm47XG5cbldlYXBvbi5QYXR0ZXJuLnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24gKHNvdXJjZSkge1xuXG4gICAgaWYgKHRoaXMuZ2FtZS50aW1lLnRpbWUgPCB0aGlzLm5leHRGaXJlKSB7IHJldHVybjsgfVxuXG4gICAgdmFyIHggPSBzb3VyY2UueCArIDIwO1xuICAgIHZhciB5ID0gc291cmNlLnkgKyAxMDtcblxuICAgIHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgdGhpcy5wYXR0ZXJuW3RoaXMucGF0dGVybkluZGV4XSk7XG5cbiAgICB0aGlzLnBhdHRlcm5JbmRleCsrO1xuXG4gICAgaWYgKHRoaXMucGF0dGVybkluZGV4ID09PSB0aGlzLnBhdHRlcm4ubGVuZ3RoKVxuICAgIHtcbiAgICAgICAgdGhpcy5wYXR0ZXJuSW5kZXggPSAwO1xuICAgIH1cblxuICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLmdhbWUudGltZS50aW1lICsgdGhpcy5maXJlUmF0ZTtcblxufTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gIFJvY2tldHMgdGhhdCB2aXN1YWxseSB0cmFjayB0aGUgZGlyZWN0aW9uIHRoZXkncmUgaGVhZGluZyBpbiAvL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5XZWFwb24uUm9ja2V0cyA9IGZ1bmN0aW9uIChnYW1lKSB7XG5cbiAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCBnYW1lLCBnYW1lLndvcmxkLCAnUm9ja2V0cycsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuXG4gICAgdGhpcy5uZXh0RmlyZSA9IDA7XG4gICAgdGhpcy5idWxsZXRTcGVlZCA9IDQwMDtcbiAgICB0aGlzLmZpcmVSYXRlID0gMjUwO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzMjsgaSsrKVxuICAgIHtcbiAgICAgICAgdGhpcy5hZGQobmV3IEJ1bGxldChnYW1lLCAnYnVsbGV0MTAnKSwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRBbGwoJ3RyYWNraW5nJywgdHJ1ZSlcblxuICAgIHJldHVybiB0aGlzO1xuXG59O1xuXG5XZWFwb24uUm9ja2V0cy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuV2VhcG9uLlJvY2tldHMucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gV2VhcG9uLlJvY2tldHM7XG5cbldlYXBvbi5Sb2NrZXRzLnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24gKHNvdXJjZSkge1xuXG4gICAgaWYgKHRoaXMuZ2FtZS50aW1lLnRpbWUgPCB0aGlzLm5leHRGaXJlKSB7IHJldHVybjsgfVxuXG4gICAgdmFyIHggPSBzb3VyY2UueCArIDEwO1xuICAgIHZhciB5ID0gc291cmNlLnkgKyAxMDtcblxuICAgIHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgLTcwMCk7XG4gICAgdGhpcy5nZXRGaXJzdEV4aXN0cyhmYWxzZSkuZmlyZSh4LCB5LCAwLCB0aGlzLmJ1bGxldFNwZWVkLCAwLCA3MDApO1xuXG4gICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMuZ2FtZS50aW1lLnRpbWUgKyB0aGlzLmZpcmVSYXRlO1xuXG59O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vICBBIHNpbmdsZSBidWxsZXQgdGhhdCBzY2FsZXMgaW4gc2l6ZSBhcyBpdCBtb3ZlcyBhY3Jvc3MgdGhlIHNjcmVlbiAvL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbldlYXBvbi5TY2FsZUJ1bGxldCA9IGZ1bmN0aW9uIChnYW1lKSB7XG5cbiAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCBnYW1lLCBnYW1lLndvcmxkLCAnU2NhbGUgQnVsbGV0JywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG5cbiAgICB0aGlzLm5leHRGaXJlID0gMDtcbiAgICB0aGlzLmJ1bGxldFNwZWVkID0gODAwO1xuICAgIHRoaXMuZmlyZVJhdGUgPSAxMDA7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDMyOyBpKyspXG4gICAge1xuICAgICAgICB0aGlzLmFkZChuZXcgQnVsbGV0KGdhbWUsICdidWxsZXQ5JyksIHRydWUpO1xuICAgIH1cblxuICAgIHRoaXMuc2V0QWxsKCdzY2FsZVNwZWVkJywgMC4wNSk7XG5cbiAgICByZXR1cm4gdGhpcztcblxufTtcblxuV2VhcG9uLlNjYWxlQnVsbGV0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLkdyb3VwLnByb3RvdHlwZSk7XG5XZWFwb24uU2NhbGVCdWxsZXQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gV2VhcG9uLlNjYWxlQnVsbGV0O1xuXG5XZWFwb24uU2NhbGVCdWxsZXQucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbiAoc291cmNlKSB7XG5cbiAgICBpZiAodGhpcy5nYW1lLnRpbWUudGltZSA8IHRoaXMubmV4dEZpcmUpIHsgcmV0dXJuOyB9XG5cbiAgICB2YXIgeCA9IHNvdXJjZS54ICsgMTA7XG4gICAgdmFyIHkgPSBzb3VyY2UueSArIDEwO1xuXG4gICAgdGhpcy5nZXRGaXJzdEV4aXN0cyhmYWxzZSkuZmlyZSh4LCB5LCAwLCB0aGlzLmJ1bGxldFNwZWVkLCAwLCAwKTtcblxuICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLmdhbWUudGltZS50aW1lICsgdGhpcy5maXJlUmF0ZTtcbn1cblxuZ2FtZS5zdGF0ZS5hZGQoJ0dhbWUnLCBSYW5nZXJTdGV2ZUdhbWUsIHRydWUpO1xuIiwiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ3VpZEdlbmVyYXRvcigpIHtcbiAgICB2YXIgUzQgPSBmdW5jdGlvbigpIHtcbiAgICAgICByZXR1cm4gKCgoMStNYXRoLnJhbmRvbSgpKSoweDEwMDAwKXwwKS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpXG4gICAgfVxuXG4gICAgcmV0dXJuIChTNCgpK1M0KCkrXCItXCIrUzQoKStcIi1cIitTNCgpK1wiLVwiK1M0KCkrXCItXCIrUzQoKStTNCgpK1M0KCkpXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IFJlbW90ZVBsYXllciA9IHtcbiAgICBsYXN0UG9zaXRpb246IHtcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogMFxuICAgIH1cbn1cblxuUmVtb3RlUGxheWVyLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5wbGF5ZXIueCAhPT0gdGhpcy5sYXN0UG9zaXRpb24ueCB8fCB0aGlzLnBsYXllci55ICE9PSB0aGlzLmxhc3RQb3NpdGlvbi55KSB7XG4gICAgICAgIHRoaXMucGxheWVyLnBsYXkoJ21vdmUnKVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucGxheWVyLnBsYXkoJ3N0b3AnKVxuICAgIH1cblxuICAgIHRoaXMubGFzdFBvc2l0aW9uLnggPSB0aGlzLnBsYXllci54XG4gICAgdGhpcy5sYXN0UG9zaXRpb24ueSA9IHRoaXMucGxheWVyLnlcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgY3JlYXRlOiBmdW5jdGlvbihpbmRleCwgZ2FtZSwgcGxheWVyLCBzdGFydFgsIHN0YXJ0WSkge1xuICAgICAgICBsZXQgbmV3UmVtb3RlUGxheWVyID0ge1xuICAgICAgICAgICAgeDogc3RhcnRYLFxuICAgICAgICAgICAgeTogc3RhcnRZLFxuICAgICAgICAgICAgZ2FtZTogZ2FtZSxcbiAgICAgICAgICAgIGhlYWx0aDogMTAwLFxuICAgICAgICAgICAgcGxheWVyOiBwbGF5ZXIsXG4gICAgICAgICAgICBhbGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgIGxhc3RQb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgIHg6IHN0YXJ0WCxcbiAgICAgICAgICAgICAgICB5OiBzdGFydFlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIG5ld1JlbW90ZVBsYXllciA9IE9iamVjdC5hc3NpZ24oUmVtb3RlUGxheWVyLCBuZXdSZW1vdGVQbGF5ZXIpXG5cbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBwbGF5ZXIncyBlbmVteSBzcHJpdGVcbiAgICAgICAgbmV3UmVtb3RlUGxheWVyLnBsYXllciA9IGdhbWUuYWRkLnNwcml0ZShzdGFydFgsIHN0YXJ0WSwgJ2VuZW15JylcblxuICAgICAgICAvLyBPdXIgdHdvIGFuaW1hdGlvbnMsIHdhbGtpbmcgbGVmdCBhbmQgcmlnaHQuXG4gICAgICAgIG5ld1JlbW90ZVBsYXllci5wbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ2xlZnQnLCBbMCwgMSwgMiwgM10sIDEwLCB0cnVlKVxuICAgICAgICBuZXdSZW1vdGVQbGF5ZXIucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdyaWdodCcsIFs1LCA2LCA3LCA4XSwgMTAsIHRydWUpXG5cbiAgICAgICAgbmV3UmVtb3RlUGxheWVyLnBsYXllci5uYW1lID0gaW5kZXgudG9TdHJpbmcoKVxuXG4gICAgICAgIHJldHVybiBuZXdSZW1vdGVQbGF5ZXJcbiAgICB9XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IE1hcEN0ZjEgPSB7fVxuXG5NYXBDdGYxLmNyZWF0ZSA9IGZ1bmN0aW9uKHNjb3BlKSB7XG4gICAgdGhpcy5zY29wZSA9IHNjb3BlXG5cbiAgICB0aGlzLmNyZWF0ZVNreVNwcml0ZSgpXG4gICAgdGhpcy5jcmVhdGVQbGF0Zm9ybXMoKVxuICAgIHRoaXMuY3JlYXRlTGVkZ2VzKClcblxuICAgIHRoaXMuc2NvcGUucGxhdGZvcm1zLnNldEFsbCgnYm9keS5pbW1vdmFibGUnLCB0cnVlKVxuICAgIHRoaXMuc2NvcGUucGxhdGZvcm1zLnNldEFsbCgnYm9keS5hbGxvd0dyYXZpdHknLCBmYWxzZSlcbn1cblxuTWFwQ3RmMS5jcmVhdGVMZWRnZXMgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgbGVkZ2VzID0gW1xuICAgICAgICAvLyB7eCwgeSwgd2lkdGgsIGhlaWdodH1cblxuICAgICAgICAvLyBTdGFydGluZyBMZWRnZXNcbiAgICAgICAgeyBpZDogMSwgeDogMCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDQzMSwgd2lkdGg6IDEyOCwgaGVpZ2h0OiA5MiB9LCAvLyBMZWZ0IGJvdHRvbSBsZWRnZVxuICAgICAgICB7IGlkOiAyLCB4OiAwLCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gODM4LCB3aWR0aDogMTI4LCBoZWlnaHQ6IDkyIH0sIC8vIExlZnQgdG9wIGxlZGdlXG5cbiAgICAgICAgeyBpZDogMywgeDogMzg3MiwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDQyNywgd2lkdGg6IDEyOCwgaGVpZ2h0OiA5MiB9LCAvLyBSaWdodCBib3R0b20gbGVkZ2VcbiAgICAgICAgeyBpZDogNCwgeDogMzg3MiwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDgzNSwgd2lkdGg6IDEyOCwgaGVpZ2h0OiA5MiB9LCAvLyBSaWdodCB0b3AgbGVkZ2VcblxuICAgICAgICAvLyBHcm91bmQgTGVkZ2VzXG4gICAgICAgIHsgaWQ6IDUsIHg6IDAsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSAxMjgsIHdpZHRoOiA0NzQsIGhlaWdodDogMTI4IH0sIC8vIE1haW4gYm90dG9tIHN0YXJ0aW5nIGxlZnQgbGVkZ2VcbiAgICAgICAgeyBpZDogNiwgeDogNDc0LCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gMjU2LCB3aWR0aDogNjQxLCBoZWlnaHQ6IDI2MCB9LCAvLyBNYWluIGJvdHRvbSBsZWZ0IGxlZGdlXG4gICAgICAgIHsgaWQ6IDcsIHg6IDExMTUsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSAzODQsIHdpZHRoOiAxNzg1LCBoZWlnaHQ6IDM5MCB9LCAvLyBNYWluIGJvdHRvbSBjZW50ZXIgbGVkZ2VcbiAgICAgICAgeyBpZDogOCwgeDogMjkwMCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDI1Niwgd2lkdGg6IDY0MSwgaGVpZ2h0OiAyNjAgfSwgLy8gTWFpbiBib3R0b20gcmlnaHQgbGVkZ2VcbiAgICAgICAgeyBpZDogOSwgeDogMzU0MCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDEyOCwgd2lkdGg6IDQ3NCwgaGVpZ2h0OiAxMjggfSwgLy8gTWFpbiBib3R0b20gc3RhcnRpbmcgcmlnaHQgbGVkZ2VcblxuICAgICAgICAvLyBBaXIgTGVkZ2VzXG4gICAgICAgIHsgaWQ6IDEwLCB4OiAzMDAsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA2MDgsIHdpZHRoOiA2NDEsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogMTEsIHg6IDExMTAsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA3MDEsIHdpZHRoOiA1MTMsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogMTIsIHg6IDg3MCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDk4Miwgd2lkdGg6IDI1NiwgaGVpZ2h0OiA5MiB9LFxuICAgICAgICB7IGlkOiAxMywgeDogMTc0NCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDg3NCwgd2lkdGg6IDUwNywgaGVpZ2h0OiAyNTQgfSxcbiAgICAgICAgeyBpZDogMTQsIHg6IDIzOTAsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA2ODksIHdpZHRoOiA1MTMsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogMTUsIHg6IDMwMzEsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA2MDgsIHdpZHRoOiA2NDEsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogMTYsIHg6IDI5MDMsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA5NTcsIHdpZHRoOiAyNTYsIGhlaWdodDogOTIgfVxuICAgIF1cblxuXG4gICAgbGVkZ2VzLmZvckVhY2goKGxlZGdlKSA9PiB7XG4gICAgICAgIC8vIHZhciBuZXdMZWRnZSA9IHRoaXMuc2NvcGUucGxhdGZvcm1zLmNyZWF0ZShsZWRnZS54LCBsZWRnZS55LCAnZ3JvdW5kJylcbiAgICAgICAgdmFyIG5ld0xlZGdlID0gdGhpcy5zY29wZS5wbGF0Zm9ybXMuY3JlYXRlKGxlZGdlLngsIGxlZGdlLnkpXG4gICAgICAgIG5ld0xlZGdlLmhlaWdodCA9IGxlZGdlLmhlaWdodFxuICAgICAgICBuZXdMZWRnZS53aWR0aCA9IGxlZGdlLndpZHRoXG5cbiAgICAgICAgLy8gRGVidWcgc3R1ZmZcbiAgICAgICAgLy8gbmV3TGVkZ2UuYWxwaGEgPSAwLjJcbiAgICAgICAgLy8gbGV0IHN0eWxlID0geyBmb250OiBcIjIwcHggQXJpYWxcIiwgZmlsbDogXCIjZmYwMDQ0XCIsIGFsaWduOiBcImNlbnRlclwiLCBiYWNrZ3JvdW5kQ29sb3I6IFwiI2ZmZmYwMFwiIH1cbiAgICAgICAgLy8gbGV0IHRleHQgPSB0aGlzLnNjb3BlLmdhbWUuYWRkLnRleHQobGVkZ2UueCwgbGVkZ2UueSwgbGVkZ2UuaWQsIHN0eWxlKVxuICAgICAgICAvLyB0ZXh0LmFscGhhID0gMC4yXG4gICAgfSlcbn1cblxuTWFwQ3RmMS5jcmVhdGVTa3lTcHJpdGUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNjb3BlLmFkZC50aWxlU3ByaXRlKDAsIHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSAxNTAwLCB0aGlzLnNjb3BlLmdhbWUud29ybGQud2lkdGgsIDE1MDAsICd0cmVlc2NhcGUnKVxufVxuXG5NYXBDdGYxLmNyZWF0ZVBsYXRmb3JtcyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2NvcGUucGxhdGZvcm1zID0gdGhpcy5zY29wZS5hZGQuZ3JvdXAoKVxuICAgIHRoaXMuc2NvcGUucGxhdGZvcm1zLmVuYWJsZUJvZHkgPSB0cnVlXG59XG5cbm1vZHVsZS5leHBvcnRzID0gTWFwQ3RmMVxuIl19
