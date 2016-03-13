(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var ForestCtf = require('./maps/ForestCtf');
var RemotePlayer = require('./lib/RemotePlayer');
var Guid = require('./lib/Guid');
var Weapons = require('./lib/Weapons');
var InputHandler = require('./lib/InputHandler');

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

    setEventHandlers: function setEventHandlers() {
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
    },

    onUpdatePlayers: function onUpdatePlayers(data) {
        var _this2 = this;

        this.enemies.forEach(function (enemy) {
            enemy.player.kill();
        });

        this.enemies = [];

        data.players.forEach(function (player) {
            if (player.id === '/#' + _this2.socket.id) return;

            var newRemotePlayer = RemotePlayer(player.id, _this2.game, _this2.player, player.x, player.y);
            _this2.enemies.push(newRemotePlayer);
            _this2.enemies[_this2.enemies.length - 1].player.animations.add('left', [0, 1, 2, 3], 10, true);
            _this2.enemies[_this2.enemies.length - 1].player.animations.add('right', [5, 6, 7, 8], 10, true);
        });
    },

    // Socket connected
    onSocketConnected: function onSocketConnected() {
        console.log('Connected to socket server');

        // Reset enemies on reconnect
        this.enemies.forEach(function (enemy) {
            enemy.kill();
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

    // Move player
    onMovePlayer: function onMovePlayer(data) {
        var movePlayer = this.playerById(data.id);

        // console.log(data.id, movePlayer)

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
            if (this.enemies[i].player.id === id) {
                return this.enemies[i];
            }
        }

        return false;
    }
};

game.state.add('Game', RangerSteveGame, true);

},{"./lib/Guid":3,"./lib/InputHandler":4,"./lib/RemotePlayer":5,"./lib/Weapons":10,"./maps/ForestCtf":11}],2:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

    // Our two animations, walking left and right.
    newRemotePlayer.player.animations.add('left', [0, 1, 2, 3], 10, true);
    newRemotePlayer.player.animations.add('right', [5, 6, 7, 8], 10, true);

    newRemotePlayer.player.id = id;

    return newRemotePlayer;
};

module.exports = RemotePlayer;

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

},{}],9:[function(require,module,exports){
'use strict';

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

},{}],10:[function(require,module,exports){
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
  "BarretM82A1": require('./BarretM82A1'),
  "Spas12": require('./Spas12'),
  "RPG": require('./RPG')
};

},{"./AK47":6,"./BarretM82A1":7,"./RPG":8,"./Spas12":9}],11:[function(require,module,exports){
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
    { id: 17, x: 717, y: this.scope.game.world.height - 686, width: 154, height: 77 }, { id: 18, x: 757, y: this.scope.game.world.height - 763, width: 77, height: 77 }, { id: 19, x: 1418, y: this.scope.game.world.height - 778, width: 77, height: 77 }, { id: 20, x: 1931, y: this.scope.game.world.height - 461, width: 154, height: 77 }, { id: 21, x: 3205, y: this.scope.game.world.height - 686, width: 154, height: 77 }, { id: 22, x: 3245, y: this.scope.game.world.height - 763, width: 77, height: 77 }];

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvYXBwLmpzIiwiYXNzZXRzL2pzL2xpYi9CdWxsZXQuanMiLCJhc3NldHMvanMvbGliL0d1aWQuanMiLCJhc3NldHMvanMvbGliL0lucHV0SGFuZGxlci5qcyIsImFzc2V0cy9qcy9saWIvUmVtb3RlUGxheWVyLmpzIiwiYXNzZXRzL2pzL2xpYi9XZWFwb25zL0FLNDcuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvQmFycmV0TTgyQTEuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvUlBHLmpzIiwiYXNzZXRzL2pzL2xpYi9XZWFwb25zL1NwYXMxMi5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9pbmRleC5qcyIsImFzc2V0cy9qcy9tYXBzL0ZvcmVzdEN0Zi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQUVBLElBQUksWUFBWSxRQUFRLGtCQUFSLENBQVo7QUFDSixJQUFJLGVBQWUsUUFBUSxvQkFBUixDQUFmO0FBQ0osSUFBSSxPQUFPLFFBQVEsWUFBUixDQUFQO0FBQ0osSUFBSSxVQUFVLFFBQVEsZUFBUixDQUFWO0FBQ0osSUFBSSxlQUFlLFFBQVEsb0JBQVIsQ0FBZjs7QUFFSixJQUFJLFlBQVksT0FBTyxVQUFQO0FBQ2hCLElBQUksYUFBYSxPQUFPLFdBQVA7QUFDakIsSUFBSSxhQUFhLElBQWI7QUFDSixJQUFJLGNBQWMsSUFBZDs7QUFFSixJQUFJLE9BQU8sSUFBSSxPQUFPLElBQVAsQ0FBWSxTQUFoQixFQUEyQixVQUEzQixFQUF1QyxPQUFPLE1BQVAsRUFBZSxtQkFBdEQsQ0FBUDs7QUFFSixJQUFJLGtCQUFrQixTQUFsQixlQUFrQixHQUFXO0FBQzdCLFNBQUssUUFBTCxHQUFnQixNQUFoQixDQUQ2QjtBQUU3QixTQUFLLGFBQUwsR0FBcUIsQ0FBckIsQ0FGNkI7QUFHN0IsU0FBSyxPQUFMLEdBQWUsRUFBZixDQUg2QjtB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VztBQUNuQyxTQUFLLEtBQUwsQ0FBVyxHQUFYLENBQWUsVUFBZixDQUEwQixDQUExQixFQUE2QixLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEtBQWhCLENBQXNCLE1BQXRCLEdBQStCLElBQS9CLEVBQXFDLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsS0FBaEIsQ0FBc0IsS0FBdEIsRUFBNkIsSUFBL0YsRUFBcUcsV0FBckcsRUFEbUM7Q0FBWDs7QUFJNUIsVUFBVSxlQUFWLEdBQTRCLFlBQVc7QUFDbkMsU0FBSyxLQUFMLENBQVcsU0FBWCxHQUF1QixLQUFLLEtBQUwsQ0FBVyxHQUFYLENBQWUsS0FBZixFQUF2QixDQURtQztBQUVuQyxTQUFLLEtBQUwsQ0FBVyxTQUFYLENBQXFCLFVBQXJCLEdBQWtDLElBQWxDLENBRm1DO0NBQVg7O0FBSzVCLE9BQU8sT0FBUCxHQUFpQixTQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCdcblxubGV0IEZvcmVzdEN0ZiA9IHJlcXVpcmUoJy4vbWFwcy9Gb3Jlc3RDdGYnKVxubGV0IFJlbW90ZVBsYXllciA9IHJlcXVpcmUoJy4vbGliL1JlbW90ZVBsYXllcicpXG5sZXQgR3VpZCA9IHJlcXVpcmUoJy4vbGliL0d1aWQnKVxubGV0IFdlYXBvbnMgPSByZXF1aXJlKCcuL2xpYi9XZWFwb25zJylcbmxldCBJbnB1dEhhbmRsZXIgPSByZXF1aXJlKCcuL2xpYi9JbnB1dEhhbmRsZXInKVxuXG5sZXQgZ2FtZVdpZHRoID0gd2luZG93LmlubmVyV2lkdGhcbmxldCBnYW1lSGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0XG5sZXQgd29ybGRXaWR0aCA9IDQwMDBcbmxldCB3b3JsZEhlaWdodCA9IDE1MDBcblxubGV0IGdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoZ2FtZVdpZHRoLCBnYW1lSGVpZ2h0LCBQaGFzZXIuQ0FOVkFTLCAncmFuZ2VyLXN0ZXZlLWdhbWUnKTtcblxubGV0IFJhbmdlclN0ZXZlR2FtZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY2xpZW50SWQgPSBHdWlkKClcbiAgICB0aGlzLmN1cnJlbnRXZWFwb24gPSAwO1xuICAgIHRoaXMuZW5lbWllcyA9IFtdXG4gICAgdGhpcy5nYW1lID0gZ2FtZVxuICAgIHRoaXMuZ3JvdW5kXG4gICAgdGhpcy5wbGF0Zm9ybXNcbiAgICB0aGlzLnBsYXllclxuICAgIHRoaXMuc2NvcmUgPSAwXG4gICAgdGhpcy5zY29yZVRleHRcbiAgICB0aGlzLnNvY2tldFxuICAgIHRoaXMud2VhcG9uTmFtZSA9IG51bGw7XG4gICAgdGhpcy53ZWFwb25zID0gW107XG59XG5cblJhbmdlclN0ZXZlR2FtZS5wcm90b3R5cGUgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZ2FtZS5yZW5kZXJlci5yZW5kZXJTZXNzaW9uLnJvdW5kUGl4ZWxzID0gdHJ1ZVxuICAgICAgICB0aGlzLmdhbWUuc3RhZ2UuZGlzYWJsZVZpc2liaWxpdHlDaGFuZ2UgPSB0cnVlXG4gICAgICAgIHRoaXMucGh5c2ljcy5zdGFydFN5c3RlbShQaGFzZXIuUGh5c2ljcy5BUkNBREUpXG4gICAgfSxcblxuICAgIHByZWxvYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmxvYWQuaW1hZ2UoJ2J1bGxldDExJywgJy9pbWFnZXMvYnVsbGV0MTEucG5nJylcbiAgICAgICAgdGhpcy5sb2FkLmltYWdlKCdidWxsZXQxMCcsICcvaW1hZ2VzL2J1bGxldDEwLnBuZycpXG4gICAgICAgIHRoaXMubG9hZC5pbWFnZSgnYnVsbGV0OScsICcvaW1hZ2VzL2J1bGxldDkucG5nJylcbiAgICAgICAgdGhpcy5sb2FkLmltYWdlKCdidWxsZXQ4JywgJy9pbWFnZXMvYnVsbGV0OC5wbmcnKVxuICAgICAgICB0aGlzLmxvYWQuaW1hZ2UoJ2J1bGxldDcnLCAnL2ltYWdlcy9idWxsZXQ3LnBuZycpXG4gICAgICAgIHRoaXMubG9hZC5pbWFnZSgnYnVsbGV0NScsICcvaW1hZ2VzL2J1bGxldDUucG5nJylcbiAgICAgICAgdGhpcy5sb2FkLmltYWdlKCdidWxsZXQ0JywgJy9pbWFnZXMvYnVsbGV0NC5wbmcnKVxuICAgICAgICB0aGlzLmxvYWQuaW1hZ2UoJ3RyZWVzY2FwZScsICcvaW1hZ2VzL21hcC1jdGYxLnBuZycpXG4gICAgICAgIHRoaXMubG9hZC5pbWFnZSgnZ3JvdW5kJywgJy9pbWFnZXMvcGxhdGZvcm0ucG5nJylcbiAgICAgICAgdGhpcy5sb2FkLnNwcml0ZXNoZWV0KCdkdWRlJywgJy9pbWFnZXMvZHVkZS5wbmcnLCAzMiwgNDgpXG4gICAgICAgIHRoaXMubG9hZC5zcHJpdGVzaGVldCgnZW5lbXknLCAnL2ltYWdlcy9kdWRlLnBuZycsIDMyLCA0OClcbiAgICB9LFxuXG4gICAgY3JlYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zb2NrZXQgPSBpby5jb25uZWN0KClcbiAgICAgICAgdGhpcy5lbmVtaWVzID0gW11cblxuICAgICAgICAvLyAgV2UncmUgZ29pbmcgdG8gYmUgdXNpbmcgcGh5c2ljcywgc28gZW5hYmxlIHRoZSBBcmNhZGUgUGh5c2ljcyBzeXN0ZW1cbiAgICAgICAgdGhpcy5waHlzaWNzLnN0YXJ0U3lzdGVtKFBoYXNlci5QaHlzaWNzLkFSQ0FERSlcblxuICAgICAgICB0aGlzLndvcmxkLnNldEJvdW5kcygwLCAwLCB3b3JsZFdpZHRoLCB3b3JsZEhlaWdodClcbiAgICAgICAgdGhpcy5nYW1lLnN0YWdlLmJhY2tncm91bmRDb2xvciA9IFwiIzJGOTFEMFwiXG5cbiAgICAgICAgLy8gU2NhbGUgZ2FtZSBvbiB3aW5kb3cgcmVzaXplXG4gICAgICAgIHRoaXMuZ2FtZS5zY2FsZS5zY2FsZU1vZGUgPSBQaGFzZXIuU2NhbGVNYW5hZ2VyLlJFU0laRTtcbiAgICAgICAgdGhpcy5nYW1lLnNjYWxlLnNldFNob3dBbGwoKTtcbiAgICAgICAgdGhpcy5nYW1lLnNjYWxlLnJlZnJlc2goKVxuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIE1hcFxuICAgICAgICAgKi9cbiAgICAgICAgRm9yZXN0Q3RmLmNyZWF0ZSh0aGlzKVxuXG4gICAgICAgIC8vIERlZmluZSBtb3ZlbWVudCBjb25zdGFudHNcbiAgICAgICAgdGhpcy5NQVhfU1BFRUQgPSA0MDA7IC8vIHBpeGVscy9zZWNvbmRcbiAgICAgICAgdGhpcy5BQ0NFTEVSQVRJT04gPSAxOTYwOyAvLyBwaXhlbHMvc2Vjb25kL3NlY29uZFxuICAgICAgICB0aGlzLkRSQUcgPSAxNTAwOyAvLyBwaXhlbHMvc2Vjb25kXG4gICAgICAgIHRoaXMuR1JBVklUWSA9IDE5MDA7IC8vIHBpeGVscy9zZWNvbmQvc2Vjb25kXG4gICAgICAgIHRoaXMuSlVNUF9TUEVFRCA9IC04NTA7IC8vIHBpeGVscy9zZWNvbmQgKG5lZ2F0aXZlIHkgaXMgdXApXG5cblxuICAgICAgICAvKipcbiAgICAgICAgICogUGxheWVyIFNldHRpbmdzXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnBsYXllciA9IHRoaXMuYWRkLnNwcml0ZSgyMDAsIHRoaXMud29ybGQuaGVpZ2h0IC0gNDAwLCAnZHVkZScpO1xuXG4gICAgICAgIC8vICBXZSBuZWVkIHRvIGVuYWJsZSBwaHlzaWNzIG9uIHRoZSBwbGF5ZXJcbiAgICAgICAgdGhpcy5waHlzaWNzLmFyY2FkZS5lbmFibGUodGhpcy5wbGF5ZXIpO1xuXG4gICAgICAgIC8vIEVuYWJsZSBwaHlzaWNzIG9uIHRoZSBwbGF5ZXJcbiAgICAgICAgdGhpcy5nYW1lLnBoeXNpY3MuZW5hYmxlKHRoaXMucGxheWVyLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuXG4gICAgICAgIC8vIE1ha2UgcGxheWVyIGNvbGxpZGUgd2l0aCB3b3JsZCBib3VuZGFyaWVzIHNvIGhlIGRvZXNuJ3QgbGVhdmUgdGhlIHN0YWdlXG4gICAgICAgIHRoaXMucGxheWVyLmJvZHkuY29sbGlkZVdvcmxkQm91bmRzID0gdHJ1ZTtcblxuICAgICAgICAvLyBTZXQgcGxheWVyIG1pbmltdW0gYW5kIG1heGltdW0gbW92ZW1lbnQgc3BlZWRcbiAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5tYXhWZWxvY2l0eS5zZXRUbyh0aGlzLk1BWF9TUEVFRCwgdGhpcy5NQVhfU1BFRUQgKiAxMCk7IC8vIHgsIHlcblxuICAgICAgICAvLyBBZGQgZHJhZyB0byB0aGUgcGxheWVyIHRoYXQgc2xvd3MgdGhlbSBkb3duIHdoZW4gdGhleSBhcmUgbm90IGFjY2VsZXJhdGluZ1xuICAgICAgICB0aGlzLnBsYXllci5ib2R5LmRyYWcuc2V0VG8odGhpcy5EUkFHLCAwKTsgLy8geCwgeVxuXG4gICAgICAgIC8vIFNpbmNlIHdlJ3JlIGp1bXBpbmcgd2UgbmVlZCBncmF2aXR5XG4gICAgICAgIGdhbWUucGh5c2ljcy5hcmNhZGUuZ3Jhdml0eS55ID0gdGhpcy5HUkFWSVRZO1xuXG4gICAgICAgIC8vIEZsYWcgdG8gdHJhY2sgaWYgdGhlIGp1bXAgYnV0dG9uIGlzIHByZXNzZWRcbiAgICAgICAgdGhpcy5qdW1waW5nID0gZmFsc2U7XG5cbiAgICAgICAgLy8gIE91ciB0d28gYW5pbWF0aW9ucywgd2Fsa2luZyBsZWZ0IGFuZCByaWdodC5cbiAgICAgICAgdGhpcy5wbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ2xlZnQnLCBbMCwgMSwgMiwgM10sIDEwLCB0cnVlKVxuICAgICAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLmFkZCgncmlnaHQnLCBbNSwgNiwgNywgOF0sIDEwLCB0cnVlKVxuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdlYXBvbnNcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY3VycmVudFdlYXBvbiA9IDA7XG4gICAgICAgIHRoaXMud2VhcG9ucy5wdXNoKG5ldyBXZWFwb25zLkFLNDcodGhpcy5nYW1lKSk7XG4gICAgICAgIHRoaXMud2VhcG9ucy5wdXNoKG5ldyBXZWFwb25zLkJhcnJldE04MkExKHRoaXMuZ2FtZSkpO1xuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRleHRcbiAgICAgICAgICovXG4gICAgICAgIGxldCB0ZXh0U3R5bGVzID0geyBmb250U2l6ZTogJzI0cHgnLCBmaWxsOiAnIzAwMCcgfVxuICAgICAgICB0aGlzLnNjb3JlVGV4dCA9IHRoaXMuYWRkLnRleHQoMjUsIDI1LCAnU2NvcmU6IDAnLCB0ZXh0U3R5bGVzKVxuICAgICAgICB0aGlzLnNjb3JlVGV4dC5maXhlZFRvQ2FtZXJhID0gdHJ1ZVxuICAgICAgICB0aGlzLndlYXBvbk5hbWUgPSB0aGlzLmFkZC50ZXh0KHRoaXMuY2FtZXJhLndpZHRoIC0gMTAwLCB0aGlzLmNhbWVyYS5oZWlnaHQgLSA0NSwgJ0FLLTQ3JywgdGV4dFN0eWxlcylcbiAgICAgICAgdGhpcy53ZWFwb25OYW1lLmZpeGVkVG9DYW1lcmEgPSB0cnVlXG4gICAgICAgIHRoaXMuY3VycmVudEhlYWx0aFRleHQgPSB0aGlzLmFkZC50ZXh0KHRoaXMuY2FtZXJhLnggKyAyNSwgdGhpcy5jYW1lcmEuaGVpZ2h0IC0gNDUsICcxMDAnLCB0ZXh0U3R5bGVzKVxuICAgICAgICB0aGlzLmN1cnJlbnRIZWFsdGhUZXh0LmZpeGVkVG9DYW1lcmEgPSB0cnVlXG5cblxuICAgICAgICAvKipcbiAgICAgICAgICogQ2FtZXJhIFNldHRpbmdzXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNhbWVyYS5mb2xsb3codGhpcy5wbGF5ZXIpO1xuXG4gICAgICAgIGxldCBjaGFuZ2VLZXkgPSB0aGlzLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuRU5URVIpO1xuICAgICAgICBjaGFuZ2VLZXkub25Eb3duLmFkZCh0aGlzLm5leHRXZWFwb24sIHRoaXMpXG5cblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVzaXppbmcgRXZlbnRzXG4gICAgICAgICAqL1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5nYW1lLnNjYWxlLnJlZnJlc2goKVxuICAgICAgICAgICAgdGhpcy5nYW1lLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodFxuICAgICAgICAgICAgdGhpcy5nYW1lLndpZHRoID0gd2luZG93LmlubmVyV2lkdGhcblxuICAgICAgICAgICAgdGhpcy53ZWFwb25OYW1lLmNhbWVyYU9mZnNldC54ID0gdGhpcy5jYW1lcmEud2lkdGggLSAxMDBcbiAgICAgICAgICAgIHRoaXMud2VhcG9uTmFtZS5jYW1lcmFPZmZzZXQueSA9IHRoaXMuY2FtZXJhLmhlaWdodCAtIDQ1XG5cbiAgICAgICAgICAgIHRoaXMuc2NvcmVUZXh0LmNhbWVyYU9mZnNldC54ID0gMjVcbiAgICAgICAgICAgIHRoaXMuc2NvcmVUZXh0LmNhbWVyYU9mZnNldC55ID0gMjVcbiAgICAgICAgfSlcblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTdGFydCBsaXN0ZW5pbmcgZm9yIGV2ZW50c1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zZXRFdmVudEhhbmRsZXJzKClcbiAgICB9LFxuXG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gIENvbGxpZGUgdGhlIHBsYXllciBhbmQgdGhlIHN0YXJzIHdpdGggdGhlIHBsYXRmb3Jtc1xuICAgICAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5wbGF5ZXIsIHRoaXMucGxhdGZvcm1zKVxuICAgICAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5wbGF0Zm9ybXMsIHRoaXMud2VhcG9ucywgZnVuY3Rpb24ocGxhdGZvcm0sIHdlYXBvbikge1xuICAgICAgICAgICAgd2VhcG9uLmtpbGwoKVxuICAgICAgICB9LCBudWxsLCB0aGlzKTtcblxuICAgICAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5lbmVteSwgdGhpcy53ZWFwb25zLCBmdW5jdGlvbihlbmVteSwgd2VhcG9uKSB7XG4gICAgICAgICAgICBlbmVteS5oZWFsdGggLT0gd2VhcG9uLmRhbWFnZVxuICAgICAgICAgICAgd2VhcG9uLmtpbGwoKVxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1lvdSBoaXQgdGhlbSEnLCBlbmVteS5oZWFsdGgsIHdlYXBvbi5kYW1hZ2UpXG4gICAgICAgICAgICBpZiAoZW5lbXkuaGVhbHRoIDw9IDApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnVGhleSBhcmUgZGVhZCEnKVxuICAgICAgICAgICAgICAgIHRoaXMuZW5lbXkueCA9IDIwMFxuICAgICAgICAgICAgICAgIHRoaXMuZW5lbXkueSA9IDIwMFxuICAgICAgICAgICAgICAgIHRoaXMuZW5lbXkuaGVhbHRoID0gMTAwXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIG51bGwsIHRoaXMpO1xuXG4gICAgICAgIGlmICh0aGlzLmxlZnRJbnB1dElzQWN0aXZlKCkpIHtcbiAgICAgICAgICAgIC8vIElmIHRoZSBMRUZUIGtleSBpcyBkb3duLCBzZXQgdGhlIHBsYXllciB2ZWxvY2l0eSB0byBtb3ZlIGxlZnRcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmJvZHkuYWNjZWxlcmF0aW9uLnggPSAtdGhpcy5BQ0NFTEVSQVRJT047XG4gICAgICAgICAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLnBsYXkoJ2xlZnQnKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucmlnaHRJbnB1dElzQWN0aXZlKCkpIHtcbiAgICAgICAgICAgIC8vIElmIHRoZSBSSUdIVCBrZXkgaXMgZG93biwgc2V0IHRoZSBwbGF5ZXIgdmVsb2NpdHkgdG8gbW92ZSByaWdodFxuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5hY2NlbGVyYXRpb24ueCA9IHRoaXMuQUNDRUxFUkFUSU9OO1xuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdyaWdodCcpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBTdGFuZCBzdGlsbFxuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5hY2NlbGVyYXRpb24ueCA9IDBcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmFuaW1hdGlvbnMuc3RvcCgpXG4gICAgICAgICAgICB0aGlzLnBsYXllci5mcmFtZSA9IDRcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNldCBhIHZhcmlhYmxlIHRoYXQgaXMgdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgaXMgdG91Y2hpbmcgdGhlIGdyb3VuZFxuICAgICAgICBsZXQgb25UaGVHcm91bmQgPSB0aGlzLnBsYXllci5ib2R5LnRvdWNoaW5nLmRvd247XG5cbiAgICAgICAgLy8gSWYgdGhlIHBsYXllciBpcyB0b3VjaGluZyB0aGUgZ3JvdW5kLCBsZXQgaGltIGhhdmUgMiBqdW1wc1xuICAgICAgICBpZiAob25UaGVHcm91bmQpIHtcbiAgICAgICAgICAgIHRoaXMuanVtcHMgPSAyO1xuICAgICAgICAgICAgdGhpcy5qdW1waW5nID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBKdW1wIVxuICAgICAgICBpZiAodGhpcy5qdW1wcyA+IDAgJiYgdGhpcy51cElucHV0SXNBY3RpdmUoNSkpIHtcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmJvZHkudmVsb2NpdHkueSA9IHRoaXMuSlVNUF9TUEVFRDtcbiAgICAgICAgICAgIHRoaXMuanVtcGluZyA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZWR1Y2UgdGhlIG51bWJlciBvZiBhdmFpbGFibGUganVtcHMgaWYgdGhlIGp1bXAgaW5wdXQgaXMgcmVsZWFzZWRcbiAgICAgICAgaWYgKHRoaXMuanVtcGluZyAmJiB0aGlzLnVwSW5wdXRSZWxlYXNlZCgpKSB7XG4gICAgICAgICAgICB0aGlzLmp1bXBzLS07XG4gICAgICAgICAgICB0aGlzLmp1bXBpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmdhbWUuaW5wdXQuYWN0aXZlUG9pbnRlci5pc0Rvd24pXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLmZpcmUodGhpcy5wbGF5ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnbW92ZSBwbGF5ZXInLCB7IHg6IHRoaXMucGxheWVyLngsIHk6IHRoaXMucGxheWVyLnkgfSlcbiAgICB9LFxuXG4gICAgbGVmdElucHV0SXNBY3RpdmU6IElucHV0SGFuZGxlci5sZWZ0SW5wdXRJc0FjdGl2ZSxcbiAgICByaWdodElucHV0SXNBY3RpdmU6IElucHV0SGFuZGxlci5yaWdodElucHV0SXNBY3RpdmUsXG4gICAgdXBJbnB1dElzQWN0aXZlOiBJbnB1dEhhbmRsZXIudXBJbnB1dElzQWN0aXZlLFxuICAgIHVwSW5wdXRSZWxlYXNlZDogSW5wdXRIYW5kbGVyLnVwSW5wdXRSZWxlYXNlZCxcblxuICAgIG5leHRXZWFwb246IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyAgVGlkeS11cCB0aGUgY3VycmVudCB3ZWFwb25cbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFdlYXBvbiA+IDkpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLnJlc2V0KCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS5jYWxsQWxsKCdyZXNldCcsIG51bGwsIDAsIDApO1xuICAgICAgICAgICAgdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0uc2V0QWxsKCdleGlzdHMnLCBmYWxzZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyAgQWN0aXZhdGUgdGhlIG5ldyBvbmVcbiAgICAgICAgdGhpcy5jdXJyZW50V2VhcG9uKys7XG5cbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFdlYXBvbiA9PT0gdGhpcy53ZWFwb25zLmxlbmd0aClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50V2VhcG9uID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLnZpc2libGUgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMud2VhcG9uTmFtZS50ZXh0ID0gdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0ubmFtZTtcbiAgICB9LFxuXG4gICAgc2V0RXZlbnRIYW5kbGVyczogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBTb2NrZXQgY29ubmVjdGlvbiBzdWNjZXNzZnVsXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdjb25uZWN0JywgdGhpcy5vblNvY2tldENvbm5lY3RlZC5iaW5kKHRoaXMpKVxuXG4gICAgICAgIC8vIFNvY2tldCBkaXNjb25uZWN0aW9uXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdkaXNjb25uZWN0JywgdGhpcy5vblNvY2tldERpc2Nvbm5lY3QuYmluZCh0aGlzKSlcblxuICAgICAgICAvLyBQbGF5ZXIgbW92ZSBtZXNzYWdlIHJlY2VpdmVkXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdtb3ZlIHBsYXllcicsIHRoaXMub25Nb3ZlUGxheWVyLmJpbmQodGhpcykpXG5cbiAgICAgICAgLy8gUGxheWVyIHJlbW92ZWQgbWVzc2FnZSByZWNlaXZlZFxuICAgICAgICB0aGlzLnNvY2tldC5vbigncmVtb3ZlIHBsYXllcicsIHRoaXMub25SZW1vdmVQbGF5ZXIuYmluZCh0aGlzKSlcblxuICAgICAgICAvLyBVcGRhdGVkIGxpc3Qgb2YgcGxheWVycyB0byBzeW5jIGVuZW1pZXMgdG9cbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ3VwZGF0ZSBwbGF5ZXJzJywgdGhpcy5vblVwZGF0ZVBsYXllcnMuYmluZCh0aGlzKSlcbiAgICB9LFxuXG4gICAgb25VcGRhdGVQbGF5ZXJzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHRoaXMuZW5lbWllcy5mb3JFYWNoKGZ1bmN0aW9uIChlbmVteSkge1xuICAgICAgICAgICAgZW5lbXkucGxheWVyLmtpbGwoKVxuICAgICAgICB9KVxuXG4gICAgICAgIHRoaXMuZW5lbWllcyA9IFtdXG5cbiAgICAgICAgZGF0YS5wbGF5ZXJzLmZvckVhY2goKHBsYXllcikgPT4ge1xuICAgICAgICAgICAgaWYgKHBsYXllci5pZCA9PT0gKCcvIycgKyB0aGlzLnNvY2tldC5pZCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgICAgIGxldCBuZXdSZW1vdGVQbGF5ZXIgPSBSZW1vdGVQbGF5ZXIocGxheWVyLmlkLCB0aGlzLmdhbWUsIHRoaXMucGxheWVyLCBwbGF5ZXIueCwgcGxheWVyLnkpXG4gICAgICAgICAgICB0aGlzLmVuZW1pZXMucHVzaChuZXdSZW1vdGVQbGF5ZXIpXG4gICAgICAgICAgICB0aGlzLmVuZW1pZXNbdGhpcy5lbmVtaWVzLmxlbmd0aCAtIDFdLnBsYXllci5hbmltYXRpb25zLmFkZCgnbGVmdCcsIFswLCAxLCAyLCAzXSwgMTAsIHRydWUpXG4gICAgICAgICAgICB0aGlzLmVuZW1pZXNbdGhpcy5lbmVtaWVzLmxlbmd0aCAtIDFdLnBsYXllci5hbmltYXRpb25zLmFkZCgncmlnaHQnLCBbNSwgNiwgNywgOF0sIDEwLCB0cnVlKVxuICAgICAgICB9KVxuICAgIH0sXG5cbiAgICAvLyBTb2NrZXQgY29ubmVjdGVkXG4gICAgb25Tb2NrZXRDb25uZWN0ZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zb2xlLmxvZygnQ29ubmVjdGVkIHRvIHNvY2tldCBzZXJ2ZXInKVxuXG4gICAgICAgICAvLyBSZXNldCBlbmVtaWVzIG9uIHJlY29ubmVjdFxuICAgICAgICB0aGlzLmVuZW1pZXMuZm9yRWFjaChmdW5jdGlvbiAoZW5lbXkpIHtcbiAgICAgICAgICAgIGVuZW15LmtpbGwoKVxuICAgICAgICB9KVxuICAgICAgICB0aGlzLmVuZW1pZXMgPSBbXVxuXG4gICAgICAgIC8vIFNlbmQgbG9jYWwgcGxheWVyIGRhdGEgdG8gdGhlIGdhbWUgc2VydmVyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ25ldyBwbGF5ZXInLCB7XG4gICAgICAgICAgICBjbGllbnRJZDogdGhpcy5jbGllbnRJZCxcbiAgICAgICAgICAgIHg6IHRoaXMucGxheWVyLngsXG4gICAgICAgICAgICB5OiB0aGlzLnBsYXllci55XG4gICAgICAgIH0pXG4gICAgfSxcblxuICAgIC8vIFNvY2tldCBkaXNjb25uZWN0ZWRcbiAgICBvblNvY2tldERpc2Nvbm5lY3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zb2xlLmxvZygnRGlzY29ubmVjdGVkIGZyb20gc29ja2V0IHNlcnZlcicpXG4gICAgfSxcblxuICAgIC8vIE1vdmUgcGxheWVyXG4gICAgb25Nb3ZlUGxheWVyOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGxldCBtb3ZlUGxheWVyID0gdGhpcy5wbGF5ZXJCeUlkKGRhdGEuaWQpXG5cbiAgICAgICAgLy8gY29uc29sZS5sb2coZGF0YS5pZCwgbW92ZVBsYXllcilcblxuICAgICAgICAvLyBQbGF5ZXIgbm90IGZvdW5kXG4gICAgICAgIGlmICghIG1vdmVQbGF5ZXIpIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgLy8gVXBkYXRlIHBsYXllciBwb3NpdGlvblxuICAgICAgICBtb3ZlUGxheWVyLnBsYXllci54ID0gZGF0YS54XG4gICAgICAgIG1vdmVQbGF5ZXIucGxheWVyLnkgPSBkYXRhLnlcblxuICAgICAgICBpZiAobW92ZVBsYXllci5wbGF5ZXIueCA+IG1vdmVQbGF5ZXIubGFzdFBvc2l0aW9uLngpIHtcbiAgICAgICAgICAgIG1vdmVQbGF5ZXIucGxheWVyLmFuaW1hdGlvbnMucGxheSgncmlnaHQnKVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG1vdmVQbGF5ZXIucGxheWVyLnggPCBtb3ZlUGxheWVyLmxhc3RQb3NpdGlvbi54KVxuICAgICAgICB7XG4gICAgICAgICAgICBtb3ZlUGxheWVyLnBsYXllci5hbmltYXRpb25zLnBsYXkoJ2xlZnQnKVxuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAge1xuICAgICAgICAgICAgbW92ZVBsYXllci5wbGF5ZXIuYW5pbWF0aW9ucy5zdG9wKClcbiAgICAgICAgICAgIG1vdmVQbGF5ZXIucGxheWVyLmZyYW1lID0gNDtcbiAgICAgICAgfVxuXG4gICAgICAgIG1vdmVQbGF5ZXIubGFzdFBvc2l0aW9uLnggPSBtb3ZlUGxheWVyLnBsYXllci54XG4gICAgICAgIG1vdmVQbGF5ZXIubGFzdFBvc2l0aW9uLnkgPSBtb3ZlUGxheWVyLnBsYXllci55XG4gICAgfSxcblxuICAgIC8vIFJlbW92ZSBwbGF5ZXJcbiAgICBvblJlbW92ZVBsYXllcjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBsZXQgcmVtb3ZlUGxheWVyID0gdGhpcy5wbGF5ZXJCeUlkKGRhdGEuaWQpXG5cbiAgICAgICAgLy8gUGxheWVyIG5vdCBmb3VuZFxuICAgICAgICBpZiAoIXJlbW92ZVBsYXllcikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1BsYXllciBub3QgZm91bmQ6ICcsIGRhdGEuaWQpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIHJlbW92ZVBsYXllci5wbGF5ZXIua2lsbCgpXG5cbiAgICAgICAgLy8gUmVtb3ZlIHBsYXllciBmcm9tIGFycmF5XG4gICAgICAgIHRoaXMuZW5lbWllcy5zcGxpY2UodGhpcy5lbmVtaWVzLmluZGV4T2YocmVtb3ZlUGxheWVyKSwgMSlcbiAgICB9LFxuXG4gICAgLy8gRmluZCBwbGF5ZXIgYnkgSURcbiAgICBwbGF5ZXJCeUlkOiBmdW5jdGlvbihpZCkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZW5lbWllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHRoaXMuZW5lbWllc1tpXS5wbGF5ZXIuaWQgPT09IGlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZW5lbWllc1tpXVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxufVxuXG5nYW1lLnN0YXRlLmFkZCgnR2FtZScsIFJhbmdlclN0ZXZlR2FtZSwgdHJ1ZSk7XG4iLCIndXNlIHN0cmljdCdcblxudmFyIEJ1bGxldCA9IGZ1bmN0aW9uIChnYW1lLCBrZXkpIHtcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgMCwgMCwga2V5KTtcblxuICAgIHRoaXMudGV4dHVyZS5iYXNlVGV4dHVyZS5zY2FsZU1vZGUgPSBQSVhJLnNjYWxlTW9kZXMuTkVBUkVTVDtcblxuICAgIHRoaXMuYW5jaG9yLnNldCgwLjUpO1xuXG4gICAgdGhpcy5jaGVja1dvcmxkQm91bmRzID0gdHJ1ZTtcbiAgICB0aGlzLm91dE9mQm91bmRzS2lsbCA9IHRydWU7XG4gICAgdGhpcy5leGlzdHMgPSBmYWxzZTtcblxuICAgIHRoaXMudHJhY2tpbmcgPSBmYWxzZTtcbiAgICB0aGlzLnNjYWxlU3BlZWQgPSAwO1xuXG59O1xuXG5CdWxsZXQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSk7XG5CdWxsZXQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQnVsbGV0O1xuXG5CdWxsZXQucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbiAoeCwgeSwgYW5nbGUsIHNwZWVkLCBneCwgZ3kpIHtcbiAgICBneCA9IGd4IHx8IDBcbiAgICBneSA9IGd5IHx8IDBcbiAgICB0aGlzLnJlc2V0KHgsIHkpXG4gICAgLy8gdGhpcy5zY2FsZS5zZXQoMSk7XG5cbiAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUubW92ZVRvUG9pbnRlcih0aGlzLCBzcGVlZClcbiAgICB0aGlzLmJvZHkuZ3Jhdml0eS55ID0gLTE4MDBcbn1cblxuQnVsbGV0LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMudHJhY2tpbmcpXG4gICAge1xuICAgICAgICB0aGlzLnJvdGF0aW9uID0gTWF0aC5hdGFuMih0aGlzLmJvZHkudmVsb2NpdHkueSwgdGhpcy5ib2R5LnZlbG9jaXR5LngpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnNjYWxlU3BlZWQgPiAwKVxuICAgIHtcbiAgICAgICAgdGhpcy5zY2FsZS54ICs9IHRoaXMuc2NhbGVTcGVlZDtcbiAgICAgICAgdGhpcy5zY2FsZS55ICs9IHRoaXMuc2NhbGVTcGVlZDtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQnVsbGV0XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBndWlkR2VuZXJhdG9yKCkge1xuICAgIHZhciBTNCA9IGZ1bmN0aW9uKCkge1xuICAgICAgIHJldHVybiAoKCgxK01hdGgucmFuZG9tKCkpKjB4MTAwMDApfDApLnRvU3RyaW5nKDE2KS5zdWJzdHJpbmcoMSlcbiAgICB9XG5cbiAgICByZXR1cm4gKFM0KCkrUzQoKStcIi1cIitTNCgpK1wiLVwiK1M0KCkrXCItXCIrUzQoKStcIi1cIitTNCgpK1M0KCkrUzQoKSlcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvLyBUaGlzIGZ1bmN0aW9uIHNob3VsZCByZXR1cm4gdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgYWN0aXZhdGVzIHRoZSBcImdvIGxlZnRcIiBjb250cm9sXG4gICAgLy8gSW4gdGhpcyBjYXNlLCBlaXRoZXIgaG9sZGluZyB0aGUgcmlnaHQgYXJyb3cgb3IgdGFwcGluZyBvciBjbGlja2luZyBvbiB0aGUgbGVmdFxuICAgIC8vIHNpZGUgb2YgdGhlIHNjcmVlbi5cbiAgICBsZWZ0SW5wdXRJc0FjdGl2ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlucHV0LmtleWJvYXJkLmlzRG93bihQaGFzZXIuS2V5Ym9hcmQuQSlcbiAgICB9LFxuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiBzaG91bGQgcmV0dXJuIHRydWUgd2hlbiB0aGUgcGxheWVyIGFjdGl2YXRlcyB0aGUgXCJnbyByaWdodFwiIGNvbnRyb2xcbiAgICAvLyBJbiB0aGlzIGNhc2UsIGVpdGhlciBob2xkaW5nIHRoZSByaWdodCBhcnJvdyBvciB0YXBwaW5nIG9yIGNsaWNraW5nIG9uIHRoZSByaWdodFxuICAgIC8vIHNpZGUgb2YgdGhlIHNjcmVlbi5cbiAgICByaWdodElucHV0SXNBY3RpdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnB1dC5rZXlib2FyZC5pc0Rvd24oUGhhc2VyLktleWJvYXJkLkQpXG4gICAgfSxcblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gc2hvdWxkIHJldHVybiB0cnVlIHdoZW4gdGhlIHBsYXllciBhY3RpdmF0ZXMgdGhlIFwianVtcFwiIGNvbnRyb2xcbiAgICAvLyBJbiB0aGlzIGNhc2UsIGVpdGhlciBob2xkaW5nIHRoZSB1cCBhcnJvdyBvciB0YXBwaW5nIG9yIGNsaWNraW5nIG9uIHRoZSBjZW50ZXJcbiAgICAvLyBwYXJ0IG9mIHRoZSBzY3JlZW4uXG4gICAgdXBJbnB1dElzQWN0aXZlOiBmdW5jdGlvbihkdXJhdGlvbikge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnB1dC5rZXlib2FyZC5kb3duRHVyYXRpb24oUGhhc2VyLktleWJvYXJkLlcsIGR1cmF0aW9uKVxuICAgIH0sXG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIHJldHVybnMgdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgcmVsZWFzZXMgdGhlIFwianVtcFwiIGNvbnRyb2xcbiAgICB1cElucHV0UmVsZWFzZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnB1dC5rZXlib2FyZC51cER1cmF0aW9uKFBoYXNlci5LZXlib2FyZC5XKVxuICAgIH1cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgUmVtb3RlUGxheWVyID0gZnVuY3Rpb24oaWQsIGdhbWUsIHBsYXllciwgc3RhcnRYLCBzdGFydFkpIHtcbiAgICBsZXQgbmV3UmVtb3RlUGxheWVyID0ge1xuICAgICAgICB4OiBzdGFydFgsXG4gICAgICAgIHk6IHN0YXJ0WSxcbiAgICAgICAgaWQ6IG51bGwsXG4gICAgICAgIGdhbWU6IGdhbWUsXG4gICAgICAgIGhlYWx0aDogMTAwLFxuICAgICAgICBwbGF5ZXI6IHBsYXllcixcbiAgICAgICAgYWxpdmU6IHRydWUsXG4gICAgICAgIGxhc3RQb3NpdGlvbjoge1xuICAgICAgICAgICAgeDogc3RhcnRYLFxuICAgICAgICAgICAgeTogc3RhcnRZXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgdGhlIHBsYXllcidzIGVuZW15IHNwcml0ZVxuICAgIG5ld1JlbW90ZVBsYXllci5wbGF5ZXIgPSBnYW1lLmFkZC5zcHJpdGUoc3RhcnRYLCBzdGFydFksICdlbmVteScpXG5cbiAgICAvLyBPdXIgdHdvIGFuaW1hdGlvbnMsIHdhbGtpbmcgbGVmdCBhbmQgcmlnaHQuXG4gICAgbmV3UmVtb3RlUGxheWVyLnBsYXllci5hbmltYXRpb25zLmFkZCgnbGVmdCcsIFswLCAxLCAyLCAzXSwgMTAsIHRydWUpXG4gICAgbmV3UmVtb3RlUGxheWVyLnBsYXllci5hbmltYXRpb25zLmFkZCgncmlnaHQnLCBbNSwgNiwgNywgOF0sIDEwLCB0cnVlKVxuXG4gICAgbmV3UmVtb3RlUGxheWVyLnBsYXllci5pZCA9IGlkXG5cbiAgICByZXR1cm4gbmV3UmVtb3RlUGxheWVyXG59XG5cbm1vZHVsZS5leHBvcnRzID0gUmVtb3RlUGxheWVyXG4iLCIndXNlIHN0cmljdCdcblxubGV0IEJ1bGxldCA9IHJlcXVpcmUoJy4uL0J1bGxldCcpXG5cbmxldCBBSzQ3ID0gZnVuY3Rpb24gKGdhbWUpIHtcbiAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCBnYW1lLCBnYW1lLndvcmxkLCAnQUstNDcnLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcblxuICAgIHRoaXMuZGFtYWdlID0gMjJcbiAgICB0aGlzLm5leHRGaXJlID0gMDtcbiAgICB0aGlzLmJ1bGxldFNwZWVkID0gMTAwMDtcbiAgICAvLyBBSzQ3IGZpcmVzIGFib3V0IDYwMCBidWxsZXRzIHBlciBzZWNvbmRcbiAgICB0aGlzLmZpcmVSYXRlID0gMTY2LjY2NjY2NztcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNjQ7IGkrKylcbiAgICB7XG4gICAgICAgIGxldCBidWxsZXQgPSBuZXcgQnVsbGV0KHRoaXMuZ2FtZSwgJ2dyb3VuZCcpXG4gICAgICAgIGJ1bGxldC5oZWlnaHQgPSAyXG4gICAgICAgIGJ1bGxldC53aWR0aCA9IDEwXG4gICAgICAgIGJ1bGxldC5kYW1hZ2UgPSAyMlxuICAgICAgICB0aGlzLmFkZChidWxsZXQsIHRydWUpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG59XG5cbkFLNDcucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcbkFLNDcucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQUs0NztcblxuQUs0Ny5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uIChzb3VyY2UpIHtcblxuICAgIGlmICh0aGlzLmdhbWUudGltZS50aW1lIDwgdGhpcy5uZXh0RmlyZSlcbiAgICAgICAgcmV0dXJuXG5cbiAgICB2YXIgeCA9IHNvdXJjZS54ICsgMTU7XG4gICAgdmFyIHkgPSBzb3VyY2UueSArIDMwO1xuXG4gICAgdGhpcy5nZXRGaXJzdEV4aXN0cyhmYWxzZSkuZmlyZSh4LCB5LCAwLCB0aGlzLmJ1bGxldFNwZWVkLCAwLCAwKTtcbiAgICB0aGlzLnNldEFsbCgndHJhY2tpbmcnLCB0cnVlKVxuXG4gICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMuZ2FtZS50aW1lLnRpbWUgKyB0aGlzLmZpcmVSYXRlXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQUs0N1xuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBCdWxsZXQgPSByZXF1aXJlKCcuLi9CdWxsZXQnKVxuXG5sZXQgQmFycmV0TTgyQTEgPSBmdW5jdGlvbiAoZ2FtZSkge1xuICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGdhbWUsIGdhbWUud29ybGQsICdBSy00NycsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuXG4gICAgdGhpcy5uYW1lID0gJ0JhcnJldCBNODJBMSdcbiAgICB0aGlzLmRhbWFnZSA9IDg4XG4gICAgdGhpcy5uZXh0RmlyZSA9IDBcbiAgICB0aGlzLmJ1bGxldFNwZWVkID0gMzQzNVxuXG4gICAgLy8gQmFycmV0TTgyQTEgZmlyZXMgYWJvdXQgNjAwIGJ1bGxldHMgcGVyIHNlY29uZFxuICAgIHRoaXMuZmlyZVJhdGUgPSA0MDAwXG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDY0OyBpKyspXG4gICAge1xuICAgICAgICBsZXQgYnVsbGV0ID0gbmV3IEJ1bGxldCh0aGlzLmdhbWUsICdncm91bmQnKVxuICAgICAgICBidWxsZXQuaGVpZ2h0ID0gMlxuICAgICAgICBidWxsZXQud2lkdGggPSAxMFxuICAgICAgICBidWxsZXQuZGFtYWdlID0gODhcblxuICAgICAgICB0aGlzLmFkZChidWxsZXQsIHRydWUpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbn1cblxuQmFycmV0TTgyQTEucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcbkJhcnJldE04MkExLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEJhcnJldE04MkExO1xuXG5CYXJyZXRNODJBMS5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uIChzb3VyY2UpIHtcbiAgICBpZiAodGhpcy5nYW1lLnRpbWUudGltZSA8IHRoaXMubmV4dEZpcmUpXG4gICAgICAgIHJldHVyblxuXG4gICAgdmFyIHggPSBzb3VyY2UueCArIDE1O1xuICAgIHZhciB5ID0gc291cmNlLnkgKyAzMDtcblxuICAgIHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgMClcbiAgICB0aGlzLnNldEFsbCgndHJhY2tpbmcnLCB0cnVlKVxuXG4gICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMuZ2FtZS50aW1lLnRpbWUgKyB0aGlzLmZpcmVSYXRlXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQmFycmV0TTgyQTFcbiIsIlxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gIFJvY2tldHMgdGhhdCB2aXN1YWxseSB0cmFjayB0aGUgZGlyZWN0aW9uIHRoZXkncmUgaGVhZGluZyBpbiAvL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5XZWFwb24uUm9ja2V0cyA9IGZ1bmN0aW9uIChnYW1lKSB7XG5cbiAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCBnYW1lLCBnYW1lLndvcmxkLCAnUm9ja2V0cycsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuXG4gICAgdGhpcy5uZXh0RmlyZSA9IDA7XG4gICAgdGhpcy5idWxsZXRTcGVlZCA9IDQwMDtcbiAgICB0aGlzLmZpcmVSYXRlID0gMjUwO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzMjsgaSsrKVxuICAgIHtcbiAgICAgICAgdGhpcy5hZGQobmV3IEJ1bGxldChnYW1lLCAnYnVsbGV0MTAnKSwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRBbGwoJ3RyYWNraW5nJywgdHJ1ZSlcblxuICAgIHJldHVybiB0aGlzO1xuXG59O1xuXG5XZWFwb24uUm9ja2V0cy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuV2VhcG9uLlJvY2tldHMucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gV2VhcG9uLlJvY2tldHM7XG5cbldlYXBvbi5Sb2NrZXRzLnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24gKHNvdXJjZSkge1xuXG4gICAgaWYgKHRoaXMuZ2FtZS50aW1lLnRpbWUgPCB0aGlzLm5leHRGaXJlKSB7IHJldHVybjsgfVxuXG4gICAgdmFyIHggPSBzb3VyY2UueCArIDEwO1xuICAgIHZhciB5ID0gc291cmNlLnkgKyAxMDtcblxuICAgIHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgLTcwMCk7XG4gICAgdGhpcy5nZXRGaXJzdEV4aXN0cyhmYWxzZSkuZmlyZSh4LCB5LCAwLCB0aGlzLmJ1bGxldFNwZWVkLCAwLCA3MDApO1xuXG4gICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMuZ2FtZS50aW1lLnRpbWUgKyB0aGlzLmZpcmVSYXRlO1xuXG59O1xuIiwiXG5XZWFwb24uU2NhdHRlclNob3QgPSBmdW5jdGlvbiAoZ2FtZSkge1xuXG4gICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgZ2FtZSwgZ2FtZS53b3JsZCwgJ1NjYXR0ZXIgU2hvdCcsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuXG4gICAgdGhpcy5uZXh0RmlyZSA9IDA7XG4gICAgdGhpcy5idWxsZXRTcGVlZCA9IDYwMDtcbiAgICB0aGlzLmZpcmVSYXRlID0gNDA7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDMyOyBpKyspXG4gICAge1xuICAgICAgICB0aGlzLmFkZChuZXcgQnVsbGV0KGdhbWUsICdidWxsZXQ1JyksIHRydWUpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuXG59O1xuXG5XZWFwb24uU2NhdHRlclNob3QucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcbldlYXBvbi5TY2F0dGVyU2hvdC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBXZWFwb24uU2NhdHRlclNob3Q7XG5cbldlYXBvbi5TY2F0dGVyU2hvdC5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uIChzb3VyY2UpIHtcblxuICAgIGlmICh0aGlzLmdhbWUudGltZS50aW1lIDwgdGhpcy5uZXh0RmlyZSkgeyByZXR1cm47IH1cblxuICAgIHZhciB4ID0gc291cmNlLnggKyAxNjtcbiAgICB2YXIgeSA9IChzb3VyY2UueSArIHNvdXJjZS5oZWlnaHQgLyAyKSArIHRoaXMuZ2FtZS5ybmQuYmV0d2VlbigtMTAsIDEwKTtcblxuICAgIHZhciBidWxsZXRJbnN0YW5jZSA9IHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpXG5cbiAgICBpZiAoIWJ1bGxldEluc3RhbmNlKSByZXR1cm5cblxuICAgIGJ1bGxldEluc3RhbmNlLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgMCk7XG5cbiAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5nYW1lLnRpbWUudGltZSArIHRoaXMuZmlyZVJhdGU7XG5cbn07XG4iLCIndXNlIHN0cmljdCdcblxuLyoqXG4gKiBQcmltYXJ5IFdlYXBvbnNcbiAqIDEuIERlc2VydCBFYWdsZXNcbiAqIDIuIEhLIE1QNVxuICogMy4gQUs0N1xuICogNC4gTTE2XG4gKiA1LiBTcGFzLTEyXG4gKiA2LiBSdWdlciA3N1xuICogNy4gTTc5XG4gKiA4LiBCYXJyZXQgTTgyQTFcbiAqIDkuIEZOIE1pbmltaVxuICogMTAuIFhNMjE0IE1pbmlndW5cbiAqL1xuXG4vKipcbiAqIFNlY29uZGFyeSBXZWFwb25zXG4gKiAxLiBVU1NPQ09NXG4gKiAyLiBDb21iYXQgS25pZmVcbiAqIDMuIENoYWluc2F3XG4gKiA0LiBNNzIgTGF3XG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgXCJBSzQ3XCI6IHJlcXVpcmUoJy4vQUs0NycpLFxuICAgIFwiQmFycmV0TTgyQTFcIjogcmVxdWlyZSgnLi9CYXJyZXRNODJBMScpLFxuICAgIFwiU3BhczEyXCI6IHJlcXVpcmUoJy4vU3BhczEyJyksXG4gICAgXCJSUEdcIjogcmVxdWlyZSgnLi9SUEcnKVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBGb3Jlc3RDdGYgPSB7fVxuXG5Gb3Jlc3RDdGYuY3JlYXRlID0gZnVuY3Rpb24oc2NvcGUpIHtcbiAgICB0aGlzLnNjb3BlID0gc2NvcGVcblxuICAgIHRoaXMuY3JlYXRlU2t5U3ByaXRlKClcbiAgICB0aGlzLmNyZWF0ZVBsYXRmb3JtcygpXG4gICAgdGhpcy5jcmVhdGVMZWRnZXMoKVxuXG4gICAgdGhpcy5zY29wZS5wbGF0Zm9ybXMuc2V0QWxsKCdib2R5LmltbW92YWJsZScsIHRydWUpXG4gICAgdGhpcy5zY29wZS5wbGF0Zm9ybXMuc2V0QWxsKCdib2R5LmFsbG93R3Jhdml0eScsIGZhbHNlKVxufVxuXG5Gb3Jlc3RDdGYuY3JlYXRlTGVkZ2VzID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IGxlZGdlcyA9IFtcbiAgICAgICAgLy8ge3gsIHksIHdpZHRoLCBoZWlnaHR9XG5cbiAgICAgICAgLy8gU3RhcnRpbmcgTGVkZ2VzXG4gICAgICAgIHsgaWQ6IDEsIHg6IDAsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA0MzEsIHdpZHRoOiAxMjgsIGhlaWdodDogOTIgfSwgLy8gTGVmdCBib3R0b20gbGVkZ2VcbiAgICAgICAgeyBpZDogMiwgeDogMCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDgzOCwgd2lkdGg6IDEyOCwgaGVpZ2h0OiA5MiB9LCAvLyBMZWZ0IHRvcCBsZWRnZVxuXG4gICAgICAgIHsgaWQ6IDMsIHg6IDM4NzIsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA0MjcsIHdpZHRoOiAxMjgsIGhlaWdodDogOTIgfSwgLy8gUmlnaHQgYm90dG9tIGxlZGdlXG4gICAgICAgIHsgaWQ6IDQsIHg6IDM4NzIsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA4MzUsIHdpZHRoOiAxMjgsIGhlaWdodDogOTIgfSwgLy8gUmlnaHQgdG9wIGxlZGdlXG5cbiAgICAgICAgLy8gR3JvdW5kIExlZGdlc1xuICAgICAgICB7IGlkOiA1LCB4OiAwLCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gMTI4LCB3aWR0aDogNDc0LCBoZWlnaHQ6IDEyOCB9LCAvLyBNYWluIGJvdHRvbSBzdGFydGluZyBsZWZ0IGxlZGdlXG4gICAgICAgIHsgaWQ6IDYsIHg6IDQ3NCwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDI1Niwgd2lkdGg6IDY0MSwgaGVpZ2h0OiAyNjAgfSwgLy8gTWFpbiBib3R0b20gbGVmdCBsZWRnZVxuICAgICAgICB7IGlkOiA3LCB4OiAxMTE1LCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gMzg0LCB3aWR0aDogMTc4NSwgaGVpZ2h0OiAzOTAgfSwgLy8gTWFpbiBib3R0b20gY2VudGVyIGxlZGdlXG4gICAgICAgIHsgaWQ6IDgsIHg6IDI5MDAsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSAyNTYsIHdpZHRoOiA2NDEsIGhlaWdodDogMjYwIH0sIC8vIE1haW4gYm90dG9tIHJpZ2h0IGxlZGdlXG4gICAgICAgIHsgaWQ6IDksIHg6IDM1NDAsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSAxMjgsIHdpZHRoOiA0NzQsIGhlaWdodDogMTI4IH0sIC8vIE1haW4gYm90dG9tIHN0YXJ0aW5nIHJpZ2h0IGxlZGdlXG5cbiAgICAgICAgLy8gQWlyIExlZGdlc1xuICAgICAgICB7IGlkOiAxMCwgeDogMzAwLCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gNjA4LCB3aWR0aDogNjQxLCBoZWlnaHQ6IDkyIH0sXG4gICAgICAgIHsgaWQ6IDExLCB4OiAxMTEwLCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gNzAxLCB3aWR0aDogNTEzLCBoZWlnaHQ6IDkyIH0sXG4gICAgICAgIHsgaWQ6IDEyLCB4OiA4NzAsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA5ODIsIHdpZHRoOiAyNTYsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogMTMsIHg6IDE3NDQsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA4NzQsIHdpZHRoOiA1MDcsIGhlaWdodDogMjU0IH0sXG4gICAgICAgIHsgaWQ6IDE0LCB4OiAyMzkwLCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gNjg5LCB3aWR0aDogNTEzLCBoZWlnaHQ6IDkyIH0sXG4gICAgICAgIHsgaWQ6IDE1LCB4OiAzMDMxLCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gNjA4LCB3aWR0aDogNjQxLCBoZWlnaHQ6IDkyIH0sXG4gICAgICAgIHsgaWQ6IDE2LCB4OiAyOTAzLCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gOTU3LCB3aWR0aDogMjU2LCBoZWlnaHQ6IDkyIH0sXG5cbiAgICAgICAgLy8gQm94ZXNcbiAgICAgICAgeyBpZDogMTcsIHg6IDcxNywgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDY4Niwgd2lkdGg6IDE1NCwgaGVpZ2h0OiA3NyB9LFxuICAgICAgICB7IGlkOiAxOCwgeDogNzU3LCB5OiB0aGlzLnNjb3BlLmdhbWUud29ybGQuaGVpZ2h0IC0gNzYzLCB3aWR0aDogNzcsIGhlaWdodDogNzcgfSxcbiAgICAgICAgeyBpZDogMTksIHg6IDE0MTgsIHk6IHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSA3NzgsIHdpZHRoOiA3NywgaGVpZ2h0OiA3NyB9LFxuICAgICAgICB7IGlkOiAyMCwgeDogMTkzMSwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDQ2MSwgd2lkdGg6IDE1NCwgaGVpZ2h0OiA3NyB9LFxuICAgICAgICB7IGlkOiAyMSwgeDogMzIwNSwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDY4Niwgd2lkdGg6IDE1NCwgaGVpZ2h0OiA3NyB9LFxuICAgICAgICB7IGlkOiAyMiwgeDogMzI0NSwgeTogdGhpcy5zY29wZS5nYW1lLndvcmxkLmhlaWdodCAtIDc2Mywgd2lkdGg6IDc3LCBoZWlnaHQ6IDc3IH1cbiAgICBdXG5cblxuICAgIGxlZGdlcy5mb3JFYWNoKChsZWRnZSkgPT4ge1xuICAgICAgICAvLyB2YXIgbmV3TGVkZ2UgPSB0aGlzLnNjb3BlLnBsYXRmb3Jtcy5jcmVhdGUobGVkZ2UueCwgbGVkZ2UueSwgJ2dyb3VuZCcpXG4gICAgICAgIHZhciBuZXdMZWRnZSA9IHRoaXMuc2NvcGUucGxhdGZvcm1zLmNyZWF0ZShsZWRnZS54LCBsZWRnZS55KVxuICAgICAgICBuZXdMZWRnZS5oZWlnaHQgPSBsZWRnZS5oZWlnaHRcbiAgICAgICAgbmV3TGVkZ2Uud2lkdGggPSBsZWRnZS53aWR0aFxuXG4gICAgICAgIC8vIERlYnVnIHN0dWZmXG4gICAgICAgIC8vIG5ld0xlZGdlLmFscGhhID0gMC4yXG4gICAgICAgIC8vIGxldCBzdHlsZSA9IHsgZm9udDogXCIyMHB4IEFyaWFsXCIsIGZpbGw6IFwiI2ZmMDA0NFwiLCBhbGlnbjogXCJjZW50ZXJcIiwgYmFja2dyb3VuZENvbG9yOiBcIiNmZmZmMDBcIiB9XG4gICAgICAgIC8vIGxldCB0ZXh0ID0gdGhpcy5zY29wZS5nYW1lLmFkZC50ZXh0KGxlZGdlLngsIGxlZGdlLnksIGxlZGdlLmlkLCBzdHlsZSlcbiAgICAgICAgLy8gdGV4dC5hbHBoYSA9IDAuMlxuICAgIH0pXG59XG5cbkZvcmVzdEN0Zi5jcmVhdGVTa3lTcHJpdGUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNjb3BlLmFkZC50aWxlU3ByaXRlKDAsIHRoaXMuc2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQgLSAxNTAwLCB0aGlzLnNjb3BlLmdhbWUud29ybGQud2lkdGgsIDE1MDAsICd0cmVlc2NhcGUnKVxufVxuXG5Gb3Jlc3RDdGYuY3JlYXRlUGxhdGZvcm1zID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zY29wZS5wbGF0Zm9ybXMgPSB0aGlzLnNjb3BlLmFkZC5ncm91cCgpXG4gICAgdGhpcy5zY29wZS5wbGF0Zm9ybXMuZW5hYmxlQm9keSA9IHRydWVcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGb3Jlc3RDdGZcbiJdfQ==
