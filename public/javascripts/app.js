(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

// require('./ui')
require('./game');

},{"./game":7}],2:[function(require,module,exports){
'use strict';

var _EventHandler = require('../lib/EventHandler');

var _EventHandler2 = _interopRequireDefault(_EventHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var HighRuleDesert = require('../maps/HighRuleDesert');
var Weapons = require('../lib/Weapons');


var worldWidth = 8000;
var worldHeight = 3966;

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
    this.volume = .5;

    //  We're going to be using physics, so enable the Arcade Physics system
    this.physics.startSystem(Phaser.Physics.ARCADE);

    this.world.setBounds(0, 0, worldWidth, worldHeight);

    // Scale game on window resize
    this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
    this.game.scale.setShowAll();
    this.game.scale.refresh();

    /**
     * Map
     */
    HighRuleDesert.create.call(this);

    /**
     * Player Settings
     */
    var spawnPoint = HighRuleDesert.getRandomSpawnPoint.call(this);
    this.player = this.add.sprite(spawnPoint.x, spawnPoint.y, 'commando');
    this.player.scale.setTo(.3);
    this.player.anchor.setTo(.5);

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
    this.player.body.setSize(300, 290, 0, -3);
    this.player.meta = {
        health: 100
    };

    // Since we're jumping we need gravity
    this.game.physics.arcade.gravity.y = this.GRAVITY;

    // Flag to track if the jump button is pressed
    this.jumping = false;

    //  Our two animations, walking left and right.
    this.player.animations.add('left', [0, 1, 2, 3, 4, 5], 10, true);
    this.player.animations.add('right', [8, 9, 10, 11, 12, 13], 10, true);

    this.player.meta = {
        health: 100
    };

    this.leftArmGroup = this.game.add.group();
    this.leftArmSprite = this.game.add.sprite(0, 0, 'left-arm');
    this.leftArmSprite.anchor.setTo(.2, .2);
    this.leftArmSprite.scale.setTo(.75);
    this.leftArmSprite.rotation = 81.8;
    this.leftArmGroup.add(this.leftArmSprite);

    this.rightArmGroup = this.game.add.group();

    this.ak47Sprite = this.game.add.sprite(12, 19, 'ak47');
    this.ak47Sprite.scale.setTo(1.3);
    this.ak47Sprite.rotation = 80;
    this.rightArmGroup.add(this.ak47Sprite);

    this.rightArmSprite = this.game.add.sprite(0, 0, 'right-arm');
    this.rightArmSprite.anchor.setTo(.2, .24);
    this.rightArmSprite.scale.setTo(1.7);
    this.rightArmSprite.rotation = 80;
    this.rightArmGroup.add(this.rightArmSprite);

    this.player.addChild(this.rightArmGroup);
    this.rightArmGroup.pivot.x = 0;
    this.rightArmGroup.pivot.y = 0;
    this.rightArmGroup.x = -25;
    this.rightArmGroup.y = -65;

    this.player.addChild(this.leftArmGroup);
    this.leftArmGroup.pivot.x = 0;
    this.leftArmGroup.pivot.y = 0;
    this.leftArmGroup.x = 45;
    this.leftArmGroup.y = -70;

    /**
     * Weapons
     */
    this.currentWeapon = 0;
    this.weapons = [new Weapons.AK47({
        game: this.game
    }), new Weapons.M500({
        game: this.game
    }), new Weapons.Skorpion({
        game: this.game
    }), new Weapons.Aug({
        game: this.game
    }), new Weapons.P90({
        game: this.game
    }), new Weapons.DesertEagle({
        game: this.game
    }), new Weapons.G43({
        game: this.game
    }), new Weapons.M4A1({
        game: this.game
    }), new Weapons.Barrett({
        game: this.game
    }), new Weapons.RPG({
        game: this.game
    })];

    /**
     * Text
     */
    var textStyles = { fontSize: '14px', fill: '#000' };

    _EventHandler2.default.emit('score update', '');
    _EventHandler2.default.emit('health update', '');
    _EventHandler2.default.on('volume update', function (data) {
        _this.volume = data.volume;
    });

    this.positionText = this.add.text(25, 25, this.game.input.mousePointer.x + ',' + this.game.input.mousePointer.y, textStyles);
    this.positionText.fixedToCamera = true;

    /**
     * Camera Settings
     */
    this.camera.follow(this.player);

    /**
     * Resizing Events
     */
    window.addEventListener('resize', function () {
        _this.game.scale.refresh();
        _this.game.height = window.innerHeight;
        _this.game.width = window.innerWidth;
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

},{"../lib/EventHandler":9,"../lib/Weapons":35,"../maps/HighRuleDesert":36}],3:[function(require,module,exports){
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
    this.load.image('map-bg', '/images/high-rule-desert.png');
    this.load.image('ground', '/images/platform.png');
    this.load.image('bullet12', '/images/bullet12.png');

    this.load.spritesheet('dude', '/images/dude.png', 32, 48);
    this.load.spritesheet('commando', '/images/commando.png', 300, 315);
    this.load.spritesheet('enemy', '/images/dude.png', 32, 48);

    this.load.image('ak47', '/images/guns/Spr_AK47.png');
    this.load.image('right-arm', '/images/body/right-arm.png');
    this.load.image('left-arm', '/images/body/left-arm.png');

    this.load.audio('AK47-sound', '/audio/AK47.ogg');
    this.load.audio('BarretM90-sound', '/audio/BarretM90.ogg');
    this.load.audio('M249-sound', '/audio/M249.ogg');
    this.load.audio('MP5-sound', '/audio/MP5.ogg');
    this.load.audio('DesertEagle-sound', '/audio/DesertEagle.ogg');
    this.load.audio('M4A1-sound', '/audio/M4A1.ogg');
};

},{}],6:[function(require,module,exports){
'use strict';

var _EventHandler = require('../lib/EventHandler');

var _EventHandler2 = _interopRequireDefault(_EventHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
        this.player.frame = 7;
    }

    // let leftArmRotation = this.game.physics.arcade.angleToPointer(this.leftArmSprite)
    // this.leftArmSprite.rotation = leftArmRotation
    // this.leftArmSprite.x = this.player.x + 49
    // this.leftArmSprite.y = this.player.y + 22

    var angleInDegrees = this.game.physics.arcade.angleToPointer(this.player) * 180 / Math.PI;
    this.rightArmGroup.angle = angleInDegrees + 90;

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
        this.weapons[this.currentWeapon].fire(this.player, this.socket, this.roomId, this.volume);
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.ONE)) {
        this.setCurrentWeapon(0);
        _EventHandler2.default.emit('weapon update', 1);
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.TWO)) {
        this.setCurrentWeapon(1);
        _EventHandler2.default.emit('weapon update', 2);
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.THREE)) {
        this.setCurrentWeapon(2);
        _EventHandler2.default.emit('weapon update', 3);
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.FOUR)) {
        this.setCurrentWeapon(3);
        _EventHandler2.default.emit('weapon update', 4);
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.FIVE)) {
        this.setCurrentWeapon(4);
        _EventHandler2.default.emit('weapon update', 5);
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.SIX)) {
        this.setCurrentWeapon(5);
        _EventHandler2.default.emit('weapon update', 6);
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.SEVEN)) {
        this.setCurrentWeapon(6);
        _EventHandler2.default.emit('weapon update', 7);
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.EIGHT)) {
        this.setCurrentWeapon(7);
        _EventHandler2.default.emit('weapon update', 8);
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.NINE)) {
        this.setCurrentWeapon(8);
        _EventHandler2.default.emit('weapon update', 9);
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.ZERO)) {
        this.setCurrentWeapon(9);
        _EventHandler2.default.emit('weapon update', 0);
    }

    this.positionText.text = this.game.input.worldX + ', ' + this.game.input.worldY;

    this.socket.emit('move player', {
        roomId: this.roomId,
        x: this.player.x,
        y: this.player.y
    });
};

},{"../lib/EventHandler":9}],7:[function(require,module,exports){
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
    render: function render() {},

    leftInputIsActive: InputHandler.leftInputIsActive,
    rightInputIsActive: InputHandler.rightInputIsActive,
    upInputIsActive: InputHandler.upInputIsActive,
    upInputReleased: InputHandler.upInputReleased,

    setCurrentWeapon: function setCurrentWeapon(newCurrentWeapon) {
        if (newCurrentWeapon === this.weapons.length) newCurrentWeapon = 0;

        //  Reset current weapon
        this.weapons[this.currentWeapon].visible = false;
        this.weapons[this.currentWeapon].callAll('reset', null, 0, 0);
        this.weapons[this.currentWeapon].setAll('exists', false);

        //  Activate the new one
        this.currentWeapon = newCurrentWeapon;
        this.weapons[this.currentWeapon].visible = true;
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

},{"./core":3,"./lib/InputHandler":11,"./lib/SocketEvents":14}],8:[function(require,module,exports){
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

},{"./Guid":10}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _eventEmitter = require('event-emitter');

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EventHandler = (0, _eventEmitter2.default)({});

exports.default = EventHandler;

},{"event-emitter":51}],10:[function(require,module,exports){
'use strict';

module.exports = function guidGenerator() {
   var S4 = function S4() {
      return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
   };

   return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
};

},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
'use strict';

module.exports = function (id) {
    for (var i = 0; i < this.enemies.length; i++) {
        if (this.enemies[i].player.id === id) {
            return this.enemies[i];
        }
    }

    return false;
};

},{}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

},{"./onBulletFired":15,"./onBulletRemoved":16,"./onMovePlayer":17,"./onPlayerDamaged":18,"./onPlayerRespawn":19,"./onRemovePlayer":20,"./onSocketConnected":21,"./onSocketDisconnect":22,"./onUpdatePlayers":23,"./setEventHandlers":24}],15:[function(require,module,exports){
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

},{"../Bullet":8}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
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

},{"../PlayerById":12}],18:[function(require,module,exports){
'use strict';

var _EventHandler = require('../EventHandler');

var _EventHandler2 = _interopRequireDefault(_EventHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (data) {
    if (data.damagedPlayerId !== '/#' + this.socket.id) return;

    this.player.meta.health = data.health;
    _EventHandler2.default.emit('health update', this.player.meta.health);
};

},{"../EventHandler":9}],19:[function(require,module,exports){
'use strict';

var _EventHandler = require('../EventHandler');

var _EventHandler2 = _interopRequireDefault(_EventHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var HighRuleDesert = require('../../maps/HighRuleDesert');

module.exports = function (data) {
    if (data.damagedPlayerId !== '/#' + this.socket.id) return;

    this.player.meta.health = data.health;
    _EventHandler2.default.emit('health update', String(this.player.meta.health));

    var spawnPoint = HighRuleDesert.getRandomSpawnPoint.call(this);
    this.player.x = spawnPoint.x;
    this.player.y = spawnPoint.y;
};

},{"../../maps/HighRuleDesert":36,"../EventHandler":9}],20:[function(require,module,exports){
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

},{"../PlayerById":12}],21:[function(require,module,exports){
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

},{}],22:[function(require,module,exports){
'use strict';

module.exports = function () {
    console.log('Disconnected from socket server');
};

},{}],23:[function(require,module,exports){
'use strict';

var _EventHandler = require('../EventHandler');

var _EventHandler2 = _interopRequireDefault(_EventHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

    _EventHandler2.default.emit('players update', data.room.players);

    data.room.players.forEach(function (player) {
        if (player.id === '/#' + _this.socket.id) {
            _EventHandler2.default.emit('score update', String(player.meta.score));
            _EventHandler2.default.emit('health update', String(player.meta.health));
            return;
        }

        var newRemotePlayer = RemotePlayer.call(_this, player.id, _this.game, _this.player, player.x, player.y);
        _this.enemies.push(newRemotePlayer);
        _this.enemies[_this.enemies.length - 1].player.animations.add('left', [0, 1, 2, 3], 10, true);
        _this.enemies[_this.enemies.length - 1].player.animations.add('right', [5, 6, 7, 8], 10, true);
    });
};

},{"../EventHandler":9,"../RemotePlayer":13}],24:[function(require,module,exports){
'use strict';

var _EventHandler = require('../EventHandler');

var _EventHandler2 = _interopRequireDefault(_EventHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function () {
    var _this = this;

    this.socket.on('connect', this.onSocketConnected.bind(this));
    this.socket.on('disconnect', this.onSocketDisconnect.bind(this));

    this.socket.on('update players', this.onUpdatePlayers.bind(this));
    this.socket.on('move player', this.onMovePlayer.bind(this));
    this.socket.on('remove player', this.onRemovePlayer.bind(this));

    this.socket.on('player respawn', this.onPlayerRespawn.bind(this));
    this.socket.on('player damaged', this.onPlayerDamaged.bind(this));

    this.socket.on('bullet fired', this.onBulletFired.bind(this));
    this.socket.on('bullet removed', this.onBulletRemoved.bind(this));

    _EventHandler2.default.on('player update nickname', function (data) {
        _this.socket.emit('player update nickname', {
            roomId: _this.roomId,
            nickname: data.nickname
        });
    });
};

},{"../EventHandler":9}],25:[function(require,module,exports){
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

AK47.prototype.fire = function (player, socket, roomId, volume) {
    if (this.game.time.time < this.nextFire) return;

    var x = player.x + 10;
    var y = player.y + -10;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0, socket, roomId);
    this.setAll('tracking', true);

    this.nextFire = this.game.time.time + this.fireRate;
    this.fx.volume = .3 * volume;
    this.fx.play();
};

module.exports = AK47;

},{"../Bullet":8,"../Guid":10}],26:[function(require,module,exports){
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

AK47.prototype.fire = function (player, socket, roomId, volume) {
    if (this.game.time.time < this.nextFire) return;

    var x = player.x + 15;
    var y = player.y + 30;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0, socket, roomId);
    this.setAll('tracking', true);

    this.nextFire = this.game.time.time + this.fireRate;
    console.log(volume);
    console.log(.3 * volume);
    this.fx.volume = .3 * volume;
    this.fx.play();
};

module.exports = AK47;

},{"../Bullet":8,"../Guid":10}],27:[function(require,module,exports){
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

},{"../Bullet":8,"../Guid":10}],28:[function(require,module,exports){
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

},{"../Bullet":8,"../Guid":10}],29:[function(require,module,exports){
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

AK47.prototype.fire = function (player, socket, roomId, volume) {
    if (this.game.time.time < this.nextFire) return;

    var x = player.x + 15;
    var y = player.y + 30;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0, socket, roomId);
    this.setAll('tracking', true);

    this.nextFire = this.game.time.time + this.fireRate;
    console.log(volume);
    console.log(.3 * volume);
    this.fx.volume = .3 * volume;
    this.fx.play();
};

module.exports = AK47;

},{"../Bullet":8,"../Guid":10}],30:[function(require,module,exports){
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

},{"../Bullet":8,"../Guid":10}],31:[function(require,module,exports){
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

},{"../Bullet":8,"../Guid":10}],32:[function(require,module,exports){
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

AK47.prototype.fire = function (player, socket, roomId, volume) {
    if (this.game.time.time < this.nextFire) return;

    var x = player.x + 15;
    var y = player.y + 30;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0, socket, roomId);
    this.setAll('tracking', true);

    this.nextFire = this.game.time.time + this.fireRate;
    console.log(volume);
    console.log(.3 * volume);
    this.fx.volume = .3 * volume;
    this.fx.play();
};

module.exports = AK47;

},{"../Bullet":8,"../Guid":10}],33:[function(require,module,exports){
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

AK47.prototype.fire = function (player, socket, roomId, volume) {
    if (this.game.time.time < this.nextFire) return;

    var x = player.x + 15;
    var y = player.y + 30;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0, socket, roomId);
    this.setAll('tracking', true);

    this.nextFire = this.game.time.time + this.fireRate;
    this.fx.volume = .3 * volume;
    this.fx.play();
};

module.exports = AK47;

//
// ///////////////////////////////////////////////////////////////////
// //  RPG that visually track the direction they're heading in //
// ///////////////////////////////////////////////////////////////////
//
// Weapon.RPG = function (game) {
//
//     Phaser.Group.call(this, game, game.world, 'RPG', false, true, Phaser.Physics.ARCADE);
//
//     this.nextFire = 0;
//     this.bulletSpeed = 400;
//     this.fireRate = 250;
//
//     for (var i = 0; i < 32; i++)
//     {
//         this.add(new Bullet(game, 'bullet10'), true);
//     }
//
//     this.setAll('tracking', true)
//
//     return this;
//
// };
//
// Weapon.RPG.prototype = Object.create(Phaser.Group.prototype);
// Weapon.RPG.prototype.constructor = Weapon.RPG;
//
// Weapon.RPG.prototype.fire = function (source) {
//
//     if (this.game.time.time < this.nextFire) { return; }
//
//     var x = source.x + 10;
//     var y = source.y + 10;
//
//     this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, -700);
//     this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 700);
//
//     this.nextFire = this.game.time.time + this.fireRate;
//
// };

},{"../Bullet":8,"../Guid":10}],34:[function(require,module,exports){
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

AK47.prototype.fire = function (player, socket, roomId, volume) {
    if (this.game.time.time < this.nextFire) return;

    var x = player.x + 15;
    var y = player.y + 30;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0, socket, roomId);
    this.setAll('tracking', true);

    this.nextFire = this.game.time.time + this.fireRate;
    this.fx.volume = .3 * volume;
    this.fx.play();
};

module.exports = AK47;

},{"../Bullet":8,"../Guid":10}],35:[function(require,module,exports){
'use strict';

module.exports = {
    "AK47": require('./AK47'),
    "Barrett": require('./Barrett'),
    "DesertEagle": require('./DesertEagle'),
    "M4A1": require('./M4A1'),
    "M500": require('./M500'),
    "Skorpion": require('./Skorpion'),
    "Aug": require('./Aug'),
    "RPG": require('./RPG'),
    "P90": require('./P90'),
    "G43": require('./G43')
};

},{"./AK47":25,"./Aug":26,"./Barrett":27,"./DesertEagle":28,"./G43":29,"./M4A1":30,"./M500":31,"./P90":32,"./RPG":33,"./Skorpion":34}],36:[function(require,module,exports){
'use strict';

var HighRuleDesert = {};

HighRuleDesert.create = function () {
    this.spawnPoints = [{
        x: 4400,
        y: this.world.height - 2400
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
    HighRuleDesert.createSkySprite.call(this);
    HighRuleDesert.createPlatforms.call(this);
    HighRuleDesert.createLedges.call(this);

    this.platforms.setAll('body.immovable', true);
    this.platforms.setAll('body.allowGravity', false);
};

HighRuleDesert.createSkySprite = function () {
    this.skysprite = this.add.tileSprite(0, this.game.world.height - 3930, this.game.world.width, this.game.world.height, 'map-bg');
};

HighRuleDesert.createPlatforms = function () {
    this.platforms = this.add.group();
    this.platforms.enableBody = true;
};

HighRuleDesert.getRandomSpawnPoint = function () {
    return _.sample(this.spawnPoints);
};

HighRuleDesert.createLedges = function () {
    var _this = this;

    var ledges = [{ id: 1, x: 0, y: this.game.world.height - 431, width: 128, height: 92 }, { id: 2, x: 0, y: this.game.world.height - 838, width: 128, height: 92 }, { id: 3, x: 3872, y: this.game.world.height - 427, width: 128, height: 92 }, { id: 4, x: 3872, y: this.game.world.height - 835, width: 128, height: 92 }, { id: 5, x: 422, y: this.game.world.height - 2105, width: 1150, height: 300 }, { id: 6, x: 1555, y: this.game.world.height - 2180, width: 270, height: 600 }, { id: 7, x: 1820, y: this.game.world.height - 2180, width: 470, height: 6 }, { id: 8, x: 2275, y: this.game.world.height - 2180, width: 320, height: 260 }, { id: 9, x: 2595, y: this.game.world.height - 2260, width: 1120, height: 260 }, { id: 10, x: 4299, y: 1658, width: 375, height: 1300 }, { id: 11, x: 1110, y: this.game.world.height - 701, width: 513, height: 92 }, { id: 12, x: 870, y: this.game.world.height - 982, width: 256, height: 92 }, { id: 13, x: 1744, y: this.game.world.height - 1474, width: 507, height: 254 }, { id: 14, x: 2390, y: this.game.world.height - 689, width: 513, height: 92 }, { id: 15, x: 3031, y: this.game.world.height - 608, width: 641, height: 92 }, { id: 16, x: 2903, y: this.game.world.height - 957, width: 256, height: 92 }, { id: 17, x: 717, y: this.game.world.height - 685, width: 154, height: 77 }, { id: 18, x: 757, y: this.game.world.height - 762, width: 77, height: 77 }, { id: 19, x: 1418, y: this.game.world.height - 778, width: 77, height: 77 }, { id: 20, x: 1931, y: this.game.world.height - 461, width: 154, height: 77 }, { id: 21, x: 3205, y: this.game.world.height - 685, width: 154, height: 77 }, { id: 22, x: 3245, y: this.game.world.height - 762, width: 77, height: 77 }];

    ledges.forEach(function (ledge) {
        var newLedge = _this.platforms.create(ledge.x, ledge.y, 'ground');
        // var newLedge = this.platforms.create(ledge.x, ledge.y)
        newLedge.height = ledge.height;
        newLedge.width = ledge.width;

        // Debug stuff
        newLedge.alpha = 0.2;
        var style = { font: "20px Arial", fill: "#ff0044", align: "center", backgroundColor: "#ffff00" };
        var text = _this.game.add.text(ledge.x, ledge.y, ledge.id, style);
        text.alpha = 0.2;
    });
};

module.exports = HighRuleDesert;

},{}],37:[function(require,module,exports){
'use strict';

var assign = require('es5-ext/object/assign'),
    normalizeOpts = require('es5-ext/object/normalize-options'),
    isCallable = require('es5-ext/object/is-callable'),
    contains = require('es5-ext/string/#/contains'),
    d;

d = module.exports = function (dscr, value /*, options*/) {
	var c, e, w, options, desc;
	if (arguments.length < 2 || typeof dscr !== 'string') {
		options = value;
		value = dscr;
		dscr = null;
	} else {
		options = arguments[2];
	}
	if (dscr == null) {
		c = w = true;
		e = false;
	} else {
		c = contains.call(dscr, 'c');
		e = contains.call(dscr, 'e');
		w = contains.call(dscr, 'w');
	}

	desc = { value: value, configurable: c, enumerable: e, writable: w };
	return !options ? desc : assign(normalizeOpts(options), desc);
};

d.gs = function (dscr, get, set /*, options*/) {
	var c, e, options, desc;
	if (typeof dscr !== 'string') {
		options = set;
		set = get;
		get = dscr;
		dscr = null;
	} else {
		options = arguments[3];
	}
	if (get == null) {
		get = undefined;
	} else if (!isCallable(get)) {
		options = get;
		get = set = undefined;
	} else if (set == null) {
		set = undefined;
	} else if (!isCallable(set)) {
		options = set;
		set = undefined;
	}
	if (dscr == null) {
		c = true;
		e = false;
	} else {
		c = contains.call(dscr, 'c');
		e = contains.call(dscr, 'e');
	}

	desc = { get: get, set: set, configurable: c, enumerable: e };
	return !options ? desc : assign(normalizeOpts(options), desc);
};

},{"es5-ext/object/assign":38,"es5-ext/object/is-callable":41,"es5-ext/object/normalize-options":45,"es5-ext/string/#/contains":48}],38:[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')() ? Object.assign : require('./shim');

},{"./is-implemented":39,"./shim":40}],39:[function(require,module,exports){
'use strict';

module.exports = function () {
	var assign = Object.assign,
	    obj;
	if (typeof assign !== 'function') return false;
	obj = { foo: 'raz' };
	assign(obj, { bar: 'dwa' }, { trzy: 'trzy' });
	return obj.foo + obj.bar + obj.trzy === 'razdwatrzy';
};

},{}],40:[function(require,module,exports){
'use strict';

var keys = require('../keys'),
    value = require('../valid-value'),
    max = Math.max;

module.exports = function (dest, src /*, …srcn*/) {
	var error,
	    i,
	    l = max(arguments.length, 2),
	    assign;
	dest = Object(value(dest));
	assign = function assign(key) {
		try {
			dest[key] = src[key];
		} catch (e) {
			if (!error) error = e;
		}
	};
	for (i = 1; i < l; ++i) {
		src = arguments[i];
		keys(src).forEach(assign);
	}
	if (error !== undefined) throw error;
	return dest;
};

},{"../keys":42,"../valid-value":47}],41:[function(require,module,exports){
// Deprecated

'use strict';

module.exports = function (obj) {
  return typeof obj === 'function';
};

},{}],42:[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')() ? Object.keys : require('./shim');

},{"./is-implemented":43,"./shim":44}],43:[function(require,module,exports){
'use strict';

module.exports = function () {
	try {
		Object.keys('primitive');
		return true;
	} catch (e) {
		return false;
	}
};

},{}],44:[function(require,module,exports){
'use strict';

var keys = Object.keys;

module.exports = function (object) {
	return keys(object == null ? object : Object(object));
};

},{}],45:[function(require,module,exports){
'use strict';

var forEach = Array.prototype.forEach,
    create = Object.create;

var process = function process(src, obj) {
	var key;
	for (key in src) {
		obj[key] = src[key];
	}
};

module.exports = function (options /*, …options*/) {
	var result = create(null);
	forEach.call(arguments, function (options) {
		if (options == null) return;
		process(Object(options), result);
	});
	return result;
};

},{}],46:[function(require,module,exports){
'use strict';

module.exports = function (fn) {
	if (typeof fn !== 'function') throw new TypeError(fn + " is not a function");
	return fn;
};

},{}],47:[function(require,module,exports){
'use strict';

module.exports = function (value) {
	if (value == null) throw new TypeError("Cannot use null or undefined");
	return value;
};

},{}],48:[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')() ? String.prototype.contains : require('./shim');

},{"./is-implemented":49,"./shim":50}],49:[function(require,module,exports){
'use strict';

var str = 'razdwatrzy';

module.exports = function () {
	if (typeof str.contains !== 'function') return false;
	return str.contains('dwa') === true && str.contains('foo') === false;
};

},{}],50:[function(require,module,exports){
'use strict';

var indexOf = String.prototype.indexOf;

module.exports = function (searchString /*, position*/) {
	return indexOf.call(this, searchString, arguments[1]) > -1;
};

},{}],51:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var d = require('d'),
    callable = require('es5-ext/object/valid-callable'),
    apply = Function.prototype.apply,
    call = Function.prototype.call,
    create = Object.create,
    defineProperty = Object.defineProperty,
    defineProperties = Object.defineProperties,
    hasOwnProperty = Object.prototype.hasOwnProperty,
    descriptor = { configurable: true, enumerable: false, writable: true },
    on,
    _once2,
    off,
    emit,
    methods,
    descriptors,
    base;

on = function on(type, listener) {
	var data;

	callable(listener);

	if (!hasOwnProperty.call(this, '__ee__')) {
		data = descriptor.value = create(null);
		defineProperty(this, '__ee__', descriptor);
		descriptor.value = null;
	} else {
		data = this.__ee__;
	}
	if (!data[type]) data[type] = listener;else if (_typeof(data[type]) === 'object') data[type].push(listener);else data[type] = [data[type], listener];

	return this;
};

_once2 = function once(type, listener) {
	var _once, self;

	callable(listener);
	self = this;
	on.call(this, type, _once = function once() {
		off.call(self, type, _once);
		apply.call(listener, this, arguments);
	});

	_once.__eeOnceListener__ = listener;
	return this;
};

off = function off(type, listener) {
	var data, listeners, candidate, i;

	callable(listener);

	if (!hasOwnProperty.call(this, '__ee__')) return this;
	data = this.__ee__;
	if (!data[type]) return this;
	listeners = data[type];

	if ((typeof listeners === 'undefined' ? 'undefined' : _typeof(listeners)) === 'object') {
		for (i = 0; candidate = listeners[i]; ++i) {
			if (candidate === listener || candidate.__eeOnceListener__ === listener) {
				if (listeners.length === 2) data[type] = listeners[i ? 0 : 1];else listeners.splice(i, 1);
			}
		}
	} else {
		if (listeners === listener || listeners.__eeOnceListener__ === listener) {
			delete data[type];
		}
	}

	return this;
};

emit = function emit(type) {
	var i, l, listener, listeners, args;

	if (!hasOwnProperty.call(this, '__ee__')) return;
	listeners = this.__ee__[type];
	if (!listeners) return;

	if ((typeof listeners === 'undefined' ? 'undefined' : _typeof(listeners)) === 'object') {
		l = arguments.length;
		args = new Array(l - 1);
		for (i = 1; i < l; ++i) {
			args[i - 1] = arguments[i];
		}listeners = listeners.slice();
		for (i = 0; listener = listeners[i]; ++i) {
			apply.call(listener, this, args);
		}
	} else {
		switch (arguments.length) {
			case 1:
				call.call(listeners, this);
				break;
			case 2:
				call.call(listeners, this, arguments[1]);
				break;
			case 3:
				call.call(listeners, this, arguments[1], arguments[2]);
				break;
			default:
				l = arguments.length;
				args = new Array(l - 1);
				for (i = 1; i < l; ++i) {
					args[i - 1] = arguments[i];
				}
				apply.call(listeners, this, args);
		}
	}
};

methods = {
	on: on,
	once: _once2,
	off: off,
	emit: emit
};

descriptors = {
	on: d(on),
	once: d(_once2),
	off: d(off),
	emit: d(emit)
};

base = defineProperties({}, descriptors);

module.exports = exports = function exports(o) {
	return o == null ? create(base) : defineProperties(Object(o), descriptors);
};
exports.methods = methods;

},{"d":37,"es5-ext/object/valid-callable":46}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvYXBwLmpzIiwiYXNzZXRzL2pzL2NvcmUvY3JlYXRlLmpzIiwiYXNzZXRzL2pzL2NvcmUvaW5kZXguanMiLCJhc3NldHMvanMvY29yZS9pbml0LmpzIiwiYXNzZXRzL2pzL2NvcmUvcHJlbG9hZC5qcyIsImFzc2V0cy9qcy9jb3JlL3VwZGF0ZS5qcyIsImFzc2V0cy9qcy9nYW1lLmpzIiwiYXNzZXRzL2pzL2xpYi9CdWxsZXQuanMiLCJhc3NldHMvanMvbGliL0V2ZW50SGFuZGxlci5qcyIsImFzc2V0cy9qcy9saWIvR3VpZC5qcyIsImFzc2V0cy9qcy9saWIvSW5wdXRIYW5kbGVyLmpzIiwiYXNzZXRzL2pzL2xpYi9QbGF5ZXJCeUlkLmpzIiwiYXNzZXRzL2pzL2xpYi9SZW1vdGVQbGF5ZXIuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9pbmRleC5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL29uQnVsbGV0RmlyZWQuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vbkJ1bGxldFJlbW92ZWQuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vbk1vdmVQbGF5ZXIuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vblBsYXllckRhbWFnZWQuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vblBsYXllclJlc3Bhd24uanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vblJlbW92ZVBsYXllci5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL29uU29ja2V0Q29ubmVjdGVkLmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvb25Tb2NrZXREaXNjb25uZWN0LmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvb25VcGRhdGVQbGF5ZXJzLmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvc2V0RXZlbnRIYW5kbGVycy5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9BSzQ3LmpzIiwiYXNzZXRzL2pzL2xpYi9XZWFwb25zL0F1Zy5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9CYXJyZXR0LmpzIiwiYXNzZXRzL2pzL2xpYi9XZWFwb25zL0Rlc2VydEVhZ2xlLmpzIiwiYXNzZXRzL2pzL2xpYi9XZWFwb25zL0c0My5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9NNEExLmpzIiwiYXNzZXRzL2pzL2xpYi9XZWFwb25zL001MDAuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvUDkwLmpzIiwiYXNzZXRzL2pzL2xpYi9XZWFwb25zL1JQRy5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9Ta29ycGlvbi5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9pbmRleC5qcyIsImFzc2V0cy9qcy9tYXBzL0hpZ2hSdWxlRGVzZXJ0LmpzIiwibm9kZV9tb2R1bGVzL2QvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZXM1LWV4dC9vYmplY3QvYXNzaWduL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2VzNS1leHQvb2JqZWN0L2Fzc2lnbi9pcy1pbXBsZW1lbnRlZC5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L29iamVjdC9hc3NpZ24vc2hpbS5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L29iamVjdC9pcy1jYWxsYWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L29iamVjdC9rZXlzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2VzNS1leHQvb2JqZWN0L2tleXMvaXMtaW1wbGVtZW50ZWQuanMiLCJub2RlX21vZHVsZXMvZXM1LWV4dC9vYmplY3Qva2V5cy9zaGltLmpzIiwibm9kZV9tb2R1bGVzL2VzNS1leHQvb2JqZWN0L25vcm1hbGl6ZS1vcHRpb25zLmpzIiwibm9kZV9tb2R1bGVzL2VzNS1leHQvb2JqZWN0L3ZhbGlkLWNhbGxhYmxlLmpzIiwibm9kZV9tb2R1bGVzL2VzNS1leHQvb2JqZWN0L3ZhbGlkLXZhbHVlLmpzIiwibm9kZV9tb2R1bGVzL2VzNS1leHQvc3RyaW5nLyMvY29udGFpbnMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZXM1LWV4dC9zdHJpbmcvIy9jb250YWlucy9pcy1pbXBsZW1lbnRlZC5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L3N0cmluZy8jL2NvbnRhaW5zL3NoaW0uanMiLCJub2RlX21vZHVsZXMvZXZlbnQtZW1pdHRlci9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztBQ0NBLFFBQVEsUUFBUjs7O0FDREE7O0FBSUE7Ozs7OztBQUZBLElBQUksaUJBQWlCLFFBQVEsd0JBQVIsQ0FBakI7QUFDSixJQUFJLFVBQVUsUUFBUSxnQkFBUixDQUFWOzs7QUFHSixJQUFJLGFBQWEsSUFBYjtBQUNKLElBQUksY0FBYyxJQUFkOztBQUVKLE9BQU8sT0FBUCxHQUFpQixZQUFXOzs7O0FBRXhCLFNBQUssU0FBTCxHQUFpQixHQUFqQjtBQUZ3QixRQUd4QixDQUFLLFlBQUwsR0FBb0IsSUFBcEI7QUFId0IsUUFJeEIsQ0FBSyxJQUFMLEdBQVksSUFBWjtBQUp3QixRQUt4QixDQUFLLE9BQUwsR0FBZSxJQUFmO0FBTHdCLFFBTXhCLENBQUssVUFBTCxHQUFrQixDQUFDLEdBQUQ7O0FBTk0sUUFReEIsQ0FBSyxNQUFMLEdBQWMsR0FBRyxPQUFILEVBQWQsQ0FSd0I7QUFTeEIsU0FBSyxPQUFMLEdBQWUsRUFBZixDQVR3QjtBQVV4QixTQUFLLE1BQUwsR0FBYyxFQUFkOzs7QUFWd0IsUUFheEIsQ0FBSyxPQUFMLENBQWEsV0FBYixDQUF5QixPQUFPLE9BQVAsQ0FBZSxNQUFmLENBQXpCLENBYndCOztBQWV4QixTQUFLLEtBQUwsQ0FBVyxTQUFYLENBQXFCLENBQXJCLEVBQXdCLENBQXhCLEVBQTJCLFVBQTNCLEVBQXVDLFdBQXZDOzs7QUFmd0IsUUFrQnhCLENBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsU0FBaEIsR0FBNEIsT0FB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QUosRUFBTyxJQUFJLENBQUosRUFBTyxFQUFFLENBQUYsRUFBSztBQUN2QixVQUFLLElBQUksQ0FBSixDQUFMLEdBQWMsVUFBVSxDQUFWLENBQWQsQ0FEdUI7S0FBeEI7QUFHQSxVQUFNLElBQU4sQ0FBVyxTQUFYLEVBQXNCLElBQXRCLEVBQTRCLElBQTVCLEVBTkQ7QUFWQSxHQURNO0VBVFA7Q0FQTTs7QUFzQ1AsVUFBVTtBQUNULEtBQUksRUFBSjtBQUNBLE9BQU0sTUFBTjtBQUNBLE1BQUssR0FBTDtBQUNBLE9BQU0sSUFBTjtDQUpEOztBQU9BLGNBQWM7QUFDYixLQUFJLEVBQUUsRUFBRixDQUFKO0FBQ0EsT0FBTSxFQUFFLE1BQUYsQ0FBTjtBQUNBLE1BQUssRUFBRSxHQUFGLENBQUw7QUFDQSxPQUFNLEVBQUUsSUFBRixDQUFOO0NBSkQ7O0FBT0EsT0FBTyxpQkFBaUIsRUFBakIsRUFBcUIsV0FBckIsQ0FBUDs7QUFFQSxPQUFPLE9BQVAsR0FBaUIsVUFBVSxpQkFBVSxDQUFWLEVBQWE7QUFDdkMsUUFBTyxDQUFDLElBQUssSUFBTCxHQUFhLE9BQU8sSUFBUCxDQUFkLEdBQTZCLGlCQUFpQixPQUFPLENBQVAsQ0FBakIsRUFBNEIsV0FBNUIsQ0FBN0IsQ0FEZ0M7Q0FBYjtBQUczQixRQUFRLE9BQVIsR0FBa0IsT0FBbEIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gcmVxdWlyZSgnLi91aScpXG5yZXF1aXJlKCcuL2dhbWUnKVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBIaWdoUnVsZURlc2VydCA9IHJlcXVpcmUoJy4uL21hcHMvSGlnaFJ1bGVEZXNlcnQnKVxubGV0IFdlYXBvbnMgPSByZXF1aXJlKCcuLi9saWIvV2VhcG9ucycpXG5pbXBvcnQgRXZlbnRIYW5kbGVyIGZyb20gJy4uL2xpYi9FdmVudEhhbmRsZXInXG5cbmxldCB3b3JsZFdpZHRoID0gODAwMFxubGV0IHdvcmxkSGVpZ2h0ID0gMzk2NlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIERlZmluZSBtb3ZlbWVudCBjb25zdGFudHNcbiAgICB0aGlzLk1BWF9TUEVFRCA9IDQwMCAvLyBwaXhlbHMvc2Vjb25kXG4gICAgdGhpcy5BQ0NFTEVSQVRJT04gPSAxOTYwIC8vIHBpeGVscy9zZWNvbmQvc2Vjb25kXG4gICAgdGhpcy5EUkFHID0gMTUwMCAvLyBwaXhlbHMvc2Vjb25kXG4gICAgdGhpcy5HUkFWSVRZID0gMTkwMCAvLyBwaXhlbHMvc2Vjb25kL3NlY29uZFxuICAgIHRoaXMuSlVNUF9TUEVFRCA9IC04NTAgLy8gcGl4ZWxzL3NlY29uZCAobmVnYXRpdmUgeSBpcyB1cClcblxuICAgIHRoaXMuc29ja2V0ID0gaW8uY29ubmVjdCgpXG4gICAgdGhpcy5lbmVtaWVzID0gW11cbiAgICB0aGlzLnZvbHVtZSA9IC41XG5cbiAgICAvLyAgV2UncmUgZ29pbmcgdG8gYmUgdXNpbmcgcGh5c2ljcywgc28gZW5hYmxlIHRoZSBBcmNhZGUgUGh5c2ljcyBzeXN0ZW1cbiAgICB0aGlzLnBoeXNpY3Muc3RhcnRTeXN0ZW0oUGhhc2VyLlBoeXNpY3MuQVJDQURFKVxuXG4gICAgdGhpcy53b3JsZC5zZXRCb3VuZHMoMCwgMCwgd29ybGRXaWR0aCwgd29ybGRIZWlnaHQpXG5cbiAgICAvLyBTY2FsZSBnYW1lIG9uIHdpbmRvdyByZXNpemVcbiAgICB0aGlzLmdhbWUuc2NhbGUuc2NhbGVNb2RlID0gUGhhc2VyLlNjYWxlTWFuYWdlci5SRVNJWkVcbiAgICB0aGlzLmdhbWUuc2NhbGUuc2V0U2hvd0FsbCgpXG4gICAgdGhpcy5nYW1lLnNjYWxlLnJlZnJlc2goKVxuXG5cbiAgICAvKipcbiAgICAgKiBNYXBcbiAgICAgKi9cbiAgICBIaWdoUnVsZURlc2VydC5jcmVhdGUuY2FsbCh0aGlzKVxuXG5cbiAgICAvKipcbiAgICAgKiBQbGF5ZXIgU2V0dGluZ3NcbiAgICAgKi9cbiAgICBsZXQgc3Bhd25Qb2ludCA9IEhpZ2hSdWxlRGVzZXJ0LmdldFJhbmRvbVNwYXduUG9pbnQuY2FsbCh0aGlzKVxuICAgIHRoaXMucGxheWVyID0gdGhpcy5hZGQuc3ByaXRlKHNwYXduUG9pbnQueCwgc3Bhd25Qb2ludC55LCAnY29tbWFuZG8nKVxuICAgIHRoaXMucGxheWVyLnNjYWxlLnNldFRvKC4zKVxuICAgIHRoaXMucGxheWVyLmFuY2hvci5zZXRUbyguNSlcblxuICAgIC8vICBXZSBuZWVkIHRvIGVuYWJsZSBwaHlzaWNzIG9uIHRoZSBwbGF5ZXJcbiAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmVuYWJsZSh0aGlzLnBsYXllcilcblxuICAgIC8vIEVuYWJsZSBwaHlzaWNzIG9uIHRoZSBwbGF5ZXJcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5lbmFibGUodGhpcy5wbGF5ZXIsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSlcblxuICAgIC8vIE1ha2UgcGxheWVyIGNvbGxpZGUgd2l0aCB3b3JsZCBib3VuZGFyaWVzIHNvIGhlIGRvZXNuJ3QgbGVhdmUgdGhlIHN0YWdlXG4gICAgdGhpcy5wbGF5ZXIuYm9keS5jb2xsaWRlV29ybGRCb3VuZHMgPSB0cnVlXG5cbiAgICAvLyBTZXQgcGxheWVyIG1pbmltdW0gYW5kIG1heGltdW0gbW92ZW1lbnQgc3BlZWRcbiAgICB0aGlzLnBsYXllci5ib2R5Lm1heFZlbG9jaXR5LnNldFRvKHRoaXMuTUFYX1NQRUVELCB0aGlzLk1BWF9TUEVFRCAqIDEwKSAvLyB4LCB5XG5cbiAgICAvLyBBZGQgZHJhZyB0byB0aGUgcGxheWVyIHRoYXQgc2xvd3MgdGhlbSBkb3duIHdoZW4gdGhleSBhcmUgbm90IGFjY2VsZXJhdGluZ1xuICAgIHRoaXMucGxheWVyLmJvZHkuZHJhZy5zZXRUbyh0aGlzLkRSQUcsIDApIC8vIHgsIHlcbiAgICB0aGlzLnBsYXllci5ib2R5LnNldFNpemUoMzAwLCAyOTAsIDAsIC0zKVxuICAgIHRoaXMucGxheWVyLm1ldGEgPSB7XG4gICAgICAgIGhlYWx0aDogMTAwXG4gICAgfVxuXG4gICAgLy8gU2luY2Ugd2UncmUganVtcGluZyB3ZSBuZWVkIGdyYXZpdHlcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZ3Jhdml0eS55ID0gdGhpcy5HUkFWSVRZXG5cbiAgICAvLyBGbGFnIHRvIHRyYWNrIGlmIHRoZSBqdW1wIGJ1dHRvbiBpcyBwcmVzc2VkXG4gICAgdGhpcy5qdW1waW5nID0gZmFsc2VcblxuICAgIC8vICBPdXIgdHdvIGFuaW1hdGlvbnMsIHdhbGtpbmcgbGVmdCBhbmQgcmlnaHQuXG4gICAgdGhpcy5wbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ2xlZnQnLCBbMCwgMSwgMiwgMywgNCwgNV0sIDEwLCB0cnVlKVxuICAgIHRoaXMucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdyaWdodCcsIFs4LCA5LCAxMCwgMTEsIDEyLCAxM10sIDEwLCB0cnVlKVxuXG4gICAgdGhpcy5wbGF5ZXIubWV0YSA9IHtcbiAgICAgICAgaGVhbHRoOiAxMDBcbiAgICB9XG5cbiAgICB0aGlzLmxlZnRBcm1Hcm91cCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKVxuICAgIHRoaXMubGVmdEFybVNwcml0ZSA9IHRoaXMuZ2FtZS5hZGQuc3ByaXRlKDAsIDAsICdsZWZ0LWFybScpXG4gICAgdGhpcy5sZWZ0QXJtU3ByaXRlLmFuY2hvci5zZXRUbyguMiwgLjIpXG4gICAgdGhpcy5sZWZ0QXJtU3ByaXRlLnNjYWxlLnNldFRvKC43NSlcbiAgICB0aGlzLmxlZnRBcm1TcHJpdGUucm90YXRpb24gPSA4MS44XG4gICAgdGhpcy5sZWZ0QXJtR3JvdXAuYWRkKHRoaXMubGVmdEFybVNwcml0ZSlcblxuICAgIHRoaXMucmlnaHRBcm1Hcm91cCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKVxuXG4gICAgdGhpcy5hazQ3U3ByaXRlID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUoMTIsIDE5LCAnYWs0NycpXG4gICAgdGhpcy5hazQ3U3ByaXRlLnNjYWxlLnNldFRvKDEuMylcbiAgICB0aGlzLmFrNDdTcHJpdGUucm90YXRpb24gPSA4MFxuICAgIHRoaXMucmlnaHRBcm1Hcm91cC5hZGQodGhpcy5hazQ3U3ByaXRlKVxuXG4gICAgdGhpcy5yaWdodEFybVNwcml0ZSA9IHRoaXMuZ2FtZS5hZGQuc3ByaXRlKDAsIDAsICdyaWdodC1hcm0nKVxuICAgIHRoaXMucmlnaHRBcm1TcHJpdGUuYW5jaG9yLnNldFRvKC4yLCAuMjQpXG4gICAgdGhpcy5yaWdodEFybVNwcml0ZS5zY2FsZS5zZXRUbygxLjcpXG4gICAgdGhpcy5yaWdodEFybVNwcml0ZS5yb3RhdGlvbiA9IDgwXG4gICAgdGhpcy5yaWdodEFybUdyb3VwLmFkZCh0aGlzLnJpZ2h0QXJtU3ByaXRlKVxuXG4gICAgdGhpcy5wbGF5ZXIuYWRkQ2hpbGQodGhpcy5yaWdodEFybUdyb3VwKVxuICAgIHRoaXMucmlnaHRBcm1Hcm91cC5waXZvdC54ID0gMFxuICAgIHRoaXMucmlnaHRBcm1Hcm91cC5waXZvdC55ID0gMFxuICAgIHRoaXMucmlnaHRBcm1Hcm91cC54ID0gLTI1XG4gICAgdGhpcy5yaWdodEFybUdyb3VwLnkgPSAtNjVcblxuICAgIHRoaXMucGxheWVyLmFkZENoaWxkKHRoaXMubGVmdEFybUdyb3VwKVxuICAgIHRoaXMubGVmdEFybUdyb3VwLnBpdm90LnggPSAwXG4gICAgdGhpcy5sZWZ0QXJtR3JvdXAucGl2b3QueSA9IDBcbiAgICB0aGlzLmxlZnRBcm1Hcm91cC54ID0gNDVcbiAgICB0aGlzLmxlZnRBcm1Hcm91cC55ID0gLTcwXG5cblxuICAgIC8qKlxuICAgICAqIFdlYXBvbnNcbiAgICAgKi9cbiAgICB0aGlzLmN1cnJlbnRXZWFwb24gPSAwXG4gICAgdGhpcy53ZWFwb25zID0gW1xuICAgICAgICBuZXcgV2VhcG9ucy5BSzQ3KHtcbiAgICAgICAgICAgIGdhbWU6IHRoaXMuZ2FtZVxuICAgICAgICB9KSxcbiAgICAgICAgbmV3IFdlYXBvbnMuTTUwMCh7XG4gICAgICAgICAgICBnYW1lOiB0aGlzLmdhbWVcbiAgICAgICAgfSksXG4gICAgICAgIG5ldyBXZWFwb25zLlNrb3JwaW9uKHtcbiAgICAgICAgICAgIGdhbWU6IHRoaXMuZ2FtZVxuICAgICAgICB9KSxcbiAgICAgICAgbmV3IFdlYXBvbnMuQXVnKHtcbiAgICAgICAgICAgIGdhbWU6IHRoaXMuZ2FtZVxuICAgICAgICB9KSxcbiAgICAgICAgbmV3IFdlYXBvbnMuUDkwKHtcbiAgICAgICAgICAgIGdhbWU6IHRoaXMuZ2FtZVxuICAgICAgICB9KSxcbiAgICAgICAgbmV3IFdlYXBvbnMuRGVzZXJ0RWFnbGUoe1xuICAgICAgICAgICAgZ2FtZTogdGhpcy5nYW1lXG4gICAgICAgIH0pLFxuICAgICAgICBuZXcgV2VhcG9ucy5HNDMoe1xuICAgICAgICAgICAgZ2FtZTogdGhpcy5nYW1lXG4gICAgICAgIH0pLFxuICAgICAgICBuZXcgV2VhcG9ucy5NNEExKHtcbiAgICAgICAgICAgIGdhbWU6IHRoaXMuZ2FtZVxuICAgICAgICB9KSxcbiAgICAgICAgbmV3IFdlYXBvbnMuQmFycmV0dCh7XG4gICAgICAgICAgICBnYW1lOiB0aGlzLmdhbWVcbiAgICAgICAgfSksXG4gICAgICAgIG5ldyBXZWFwb25zLlJQRyh7XG4gICAgICAgICAgICBnYW1lOiB0aGlzLmdhbWVcbiAgICAgICAgfSksXG4gICAgXVxuXG5cbiAgICAvKipcbiAgICAgKiBUZXh0XG4gICAgICovXG4gICAgbGV0IHRleHRTdHlsZXMgPSB7IGZvbnRTaXplOiAnMTRweCcsIGZpbGw6ICcjMDAwJyB9XG5cbiAgICBFdmVudEhhbmRsZXIuZW1pdCgnc2NvcmUgdXBkYXRlJywgJycpXG4gICAgRXZlbnRIYW5kbGVyLmVtaXQoJ2hlYWx0aCB1cGRhdGUnLCAnJylcbiAgICBFdmVudEhhbmRsZXIub24oJ3ZvbHVtZSB1cGRhdGUnLCAoZGF0YSkgPT4ge1xuICAgICAgICB0aGlzLnZvbHVtZSA9IGRhdGEudm9sdW1lXG4gICAgfSlcblxuICAgIHRoaXMucG9zaXRpb25UZXh0ID0gdGhpcy5hZGQudGV4dCgyNSwgMjUsIGAke3RoaXMuZ2FtZS5pbnB1dC5tb3VzZVBvaW50ZXIueH0sJHt0aGlzLmdhbWUuaW5wdXQubW91c2VQb2ludGVyLnl9YCwgdGV4dFN0eWxlcylcbiAgICB0aGlzLnBvc2l0aW9uVGV4dC5maXhlZFRvQ2FtZXJhID0gdHJ1ZVxuXG5cbiAgICAvKipcbiAgICAgKiBDYW1lcmEgU2V0dGluZ3NcbiAgICAgKi9cbiAgICB0aGlzLmNhbWVyYS5mb2xsb3codGhpcy5wbGF5ZXIpXG5cblxuICAgIC8qKlxuICAgICAqIFJlc2l6aW5nIEV2ZW50c1xuICAgICAqL1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuZ2FtZS5zY2FsZS5yZWZyZXNoKClcbiAgICAgICAgdGhpcy5nYW1lLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodFxuICAgICAgICB0aGlzLmdhbWUud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aFxuICAgIH0pXG5cblxuICAgIC8qKlxuICAgICAqIEVuZW15IEJ1bGxldHNcbiAgICAgKi9cbiAgICB0aGlzLmVuZW15QnVsbGV0cyA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKVxuXG5cbiAgICAvKipcbiAgICAgKiBTdGFydCBsaXN0ZW5pbmcgZm9yIGV2ZW50c1xuICAgICAqL1xuICAgIHRoaXMuc2V0RXZlbnRIYW5kbGVycygpXG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgY3JlYXRlOiByZXF1aXJlKCcuL2NyZWF0ZScpLFxuICAgIGluaXQ6IHJlcXVpcmUoJy4vaW5pdCcpLFxuICAgIHByZWxvYWQ6IHJlcXVpcmUoJy4vcHJlbG9hZCcpLFxuICAgIHVwZGF0ZTogcmVxdWlyZSgnLi91cGRhdGUnKVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5nYW1lLnJlbmRlcmVyLnJlbmRlclNlc3Npb24ucm91bmRQaXhlbHMgPSB0cnVlXG4gICAgdGhpcy5nYW1lLnN0YWdlLmRpc2FibGVWaXNpYmlsaXR5Q2hhbmdlID0gdHJ1ZVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5sb2FkLmltYWdlKCdtYXAtYmcnLCAnL2ltYWdlcy9oaWdoLXJ1bGUtZGVzZXJ0LnBuZycpXG4gICAgdGhpcy5sb2FkLmltYWdlKCdncm91bmQnLCAnL2ltYWdlcy9wbGF0Zm9ybS5wbmcnKVxuICAgIHRoaXMubG9hZC5pbWFnZSgnYnVsbGV0MTInLCAnL2ltYWdlcy9idWxsZXQxMi5wbmcnKVxuXG4gICAgdGhpcy5sb2FkLnNwcml0ZXNoZWV0KCdkdWRlJywgJy9pbWFnZXMvZHVkZS5wbmcnLCAzMiwgNDgpXG4gICAgdGhpcy5sb2FkLnNwcml0ZXNoZWV0KCdjb21tYW5kbycsICcvaW1hZ2VzL2NvbW1hbmRvLnBuZycsIDMwMCwgMzE1KVxuICAgIHRoaXMubG9hZC5zcHJpdGVzaGVldCgnZW5lbXknLCAnL2ltYWdlcy9kdWRlLnBuZycsIDMyLCA0OClcblxuICAgIHRoaXMubG9hZC5pbWFnZSgnYWs0NycsICcvaW1hZ2VzL2d1bnMvU3ByX0FLNDcucG5nJylcbiAgICB0aGlzLmxvYWQuaW1hZ2UoJ3JpZ2h0LWFybScsICcvaW1hZ2VzL2JvZHkvcmlnaHQtYXJtLnBuZycpXG4gICAgdGhpcy5sb2FkLmltYWdlKCdsZWZ0LWFybScsICcvaW1hZ2VzL2JvZHkvbGVmdC1hcm0ucG5nJylcblxuICAgIHRoaXMubG9hZC5hdWRpbygnQUs0Ny1zb3VuZCcsICcvYXVkaW8vQUs0Ny5vZ2cnKVxuICAgIHRoaXMubG9hZC5hdWRpbygnQmFycmV0TTkwLXNvdW5kJywgJy9hdWRpby9CYXJyZXRNOTAub2dnJylcbiAgICB0aGlzLmxvYWQuYXVkaW8oJ00yNDktc291bmQnLCAnL2F1ZGlvL00yNDkub2dnJylcbiAgICB0aGlzLmxvYWQuYXVkaW8oJ01QNS1zb3VuZCcsICcvYXVkaW8vTVA1Lm9nZycpXG4gICAgdGhpcy5sb2FkLmF1ZGlvKCdEZXNlcnRFYWdsZS1zb3VuZCcsICcvYXVkaW8vRGVzZXJ0RWFnbGUub2dnJylcbiAgICB0aGlzLmxvYWQuYXVkaW8oJ000QTEtc291bmQnLCAnL2F1ZGlvL000QTEub2dnJylcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5pbXBvcnQgRXZlbnRIYW5kbGVyIGZyb20gJy4uL2xpYi9FdmVudEhhbmRsZXInXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG5cblxuXG4gICAgLy8gQ29sbGlkZSB0aGlzIHBsYXllciB3aXRoIHRoZSBtYXBcbiAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5wbGF5ZXIsIHRoaXMucGxhdGZvcm1zLCBudWxsLCBudWxsLCB0aGlzKVxuXG4gICAgLy8gRGlkIHRoaXMgcGxheWVyJ3MgYnVsbGV0cyBoaXQgYW55IHBsYXRmb3Jtc1xuICAgIHRoaXMucGh5c2ljcy5hcmNhZGUuY29sbGlkZSh0aGlzLnBsYXRmb3JtcywgdGhpcy53ZWFwb25zLCAocGxhdGZvcm0sIHdlYXBvbikgPT4ge1xuICAgICAgICB3ZWFwb24ua2lsbCgpXG4gICAgfSwgbnVsbCwgdGhpcylcblxuICAgIC8vIERpZCBlbmVteSBidWxsZXRzIGhpdCBhbnkgcGxhdGZvcm1zXG4gICAgdGhpcy5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMucGxhdGZvcm1zLCB0aGlzLmVuZW15QnVsbGV0cywgKHBsYXRmb3JtLCBidWxsZXQpID0+IHtcbiAgICAgICAgYnVsbGV0LmtpbGwoKVxuICAgIH0sIG51bGwsIHRoaXMpXG5cbiAgICAvLyBEaWQgdGhpcyBwbGF5ZXIgZ2V0IGhpdCBieSBhbnkgZW5lbXkgYnVsbGV0c1xuICAgIHRoaXMucGh5c2ljcy5hcmNhZGUuY29sbGlkZSh0aGlzLnBsYXllciwgdGhpcy5lbmVteUJ1bGxldHMsIG51bGwsIChwbGF5ZXIsIGJ1bGxldCkgPT4ge1xuICAgICAgICBidWxsZXQua2lsbCgpXG5cbiAgICAgICAgY29uc29sZS5sb2coJ1lvdSB3ZXJlIGhpdCBieScsIGJ1bGxldC5idWxsZXRJZClcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnYnVsbGV0IHJlbW92ZWQnLCB7XG4gICAgICAgICAgICByb29tSWQ6IHRoaXMucm9vbUlkLFxuICAgICAgICAgICAgYnVsbGV0SWQ6IGJ1bGxldC5idWxsZXRJZFxuICAgICAgICB9KVxuXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ3BsYXllciBkYW1hZ2VkJywge1xuICAgICAgICAgICAgcm9vbUlkOiB0aGlzLnJvb21JZCxcbiAgICAgICAgICAgIGRhbWFnZTogYnVsbGV0LmRhbWFnZSxcbiAgICAgICAgICAgIGRhbWFnZWRQbGF5ZXJJZDogJy8jJyArIHRoaXMuc29ja2V0LmlkLFxuICAgICAgICAgICAgYXR0YWNraW5nUGxheWVySWQ6IGJ1bGxldC5wbGF5ZXJJZFxuICAgICAgICB9KVxuXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIH0sIHRoaXMpXG5cbiAgICBpZiAodGhpcy5sZWZ0SW5wdXRJc0FjdGl2ZSgpKSB7XG4gICAgICAgIC8vIElmIHRoZSBMRUZUIGtleSBpcyBkb3duLCBzZXQgdGhlIHBsYXllciB2ZWxvY2l0eSB0byBtb3ZlIGxlZnRcbiAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5hY2NlbGVyYXRpb24ueCA9IC10aGlzLkFDQ0VMRVJBVElPTlxuICAgICAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLnBsYXkoJ2xlZnQnKVxuICAgIH0gZWxzZSBpZiAodGhpcy5yaWdodElucHV0SXNBY3RpdmUoKSkge1xuICAgICAgICAvLyBJZiB0aGUgUklHSFQga2V5IGlzIGRvd24sIHNldCB0aGUgcGxheWVyIHZlbG9jaXR5IHRvIG1vdmUgcmlnaHRcbiAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5hY2NlbGVyYXRpb24ueCA9IHRoaXMuQUNDRUxFUkFUSU9OXG4gICAgICAgIHRoaXMucGxheWVyLmFuaW1hdGlvbnMucGxheSgncmlnaHQnKVxuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFN0YW5kIHN0aWxsXG4gICAgICAgIHRoaXMucGxheWVyLmJvZHkuYWNjZWxlcmF0aW9uLnggPSAwXG4gICAgICAgIHRoaXMucGxheWVyLmFuaW1hdGlvbnMuc3RvcCgpXG4gICAgICAgIHRoaXMucGxheWVyLmZyYW1lID0gN1xuICAgIH1cblxuXG5cblxuXG5cblxuXG4gICAgLy8gbGV0IGxlZnRBcm1Sb3RhdGlvbiA9IHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5hbmdsZVRvUG9pbnRlcih0aGlzLmxlZnRBcm1TcHJpdGUpXG4gICAgLy8gdGhpcy5sZWZ0QXJtU3ByaXRlLnJvdGF0aW9uID0gbGVmdEFybVJvdGF0aW9uXG4gICAgLy8gdGhpcy5sZWZ0QXJtU3ByaXRlLnggPSB0aGlzLnBsYXllci54ICsgNDlcbiAgICAvLyB0aGlzLmxlZnRBcm1TcHJpdGUueSA9IHRoaXMucGxheWVyLnkgKyAyMlxuXG5cbiAgICBsZXQgYW5nbGVJbkRlZ3JlZXMgPSB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuYW5nbGVUb1BvaW50ZXIodGhpcy5wbGF5ZXIpICogMTgwIC8gTWF0aC5QSTtcbiAgICB0aGlzLnJpZ2h0QXJtR3JvdXAuYW5nbGUgPSBhbmdsZUluRGVncmVlcyArIDkwXG5cblxuXG5cblxuICAgIC8vIFNldCBhIHZhcmlhYmxlIHRoYXQgaXMgdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgaXMgdG91Y2hpbmcgdGhlIGdyb3VuZFxuICAgIGxldCBvblRoZUdyb3VuZCA9IHRoaXMucGxheWVyLmJvZHkudG91Y2hpbmcuZG93blxuXG4gICAgLy8gSWYgdGhlIHBsYXllciBpcyB0b3VjaGluZyB0aGUgZ3JvdW5kLCBsZXQgaGltIGhhdmUgMiBqdW1wc1xuICAgIGlmIChvblRoZUdyb3VuZCkge1xuICAgICAgICB0aGlzLmp1bXBzID0gMlxuICAgICAgICB0aGlzLmp1bXBpbmcgPSBmYWxzZVxuICAgIH1cblxuICAgIC8vIEp1bXAhXG4gICAgaWYgKHRoaXMuanVtcHMgPiAwICYmIHRoaXMudXBJbnB1dElzQWN0aXZlKDUpKSB7XG4gICAgICAgIHRoaXMucGxheWVyLmJvZHkudmVsb2NpdHkueSA9IHRoaXMuSlVNUF9TUEVFRFxuICAgICAgICB0aGlzLmp1bXBpbmcgPSB0cnVlXG4gICAgfVxuXG4gICAgLy8gUmVkdWNlIHRoZSBudW1iZXIgb2YgYXZhaWxhYmxlIGp1bXBzIGlmIHRoZSBqdW1wIGlucHV0IGlzIHJlbGVhc2VkXG4gICAgaWYgKHRoaXMuanVtcGluZyAmJiB0aGlzLnVwSW5wdXRSZWxlYXNlZCgpKSB7XG4gICAgICAgIHRoaXMuanVtcHMtLVxuICAgICAgICB0aGlzLmp1bXBpbmcgPSBmYWxzZVxuICAgIH1cblxuICAgIGlmICh0aGlzLmdhbWUuaW5wdXQuYWN0aXZlUG9pbnRlci5pc0Rvd24pXG4gICAge1xuICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS5maXJlKHRoaXMucGxheWVyLCB0aGlzLnNvY2tldCwgdGhpcy5yb29tSWQsIHRoaXMudm9sdW1lKVxuICAgIH1cblxuICAgIGlmICh0aGlzLmlucHV0LmtleWJvYXJkLmlzRG93bihQaGFzZXIuS2V5Ym9hcmQuT05FKSkge1xuICAgICAgICB0aGlzLnNldEN1cnJlbnRXZWFwb24oMClcbiAgICAgICAgRXZlbnRIYW5kbGVyLmVtaXQoJ3dlYXBvbiB1cGRhdGUnLCAxKVxuICAgIH1cblxuICAgIGlmICh0aGlzLmlucHV0LmtleWJvYXJkLmlzRG93bihQaGFzZXIuS2V5Ym9hcmQuVFdPKSkge1xuICAgICAgICB0aGlzLnNldEN1cnJlbnRXZWFwb24oMSlcbiAgICAgICAgRXZlbnRIYW5kbGVyLmVtaXQoJ3dlYXBvbiB1cGRhdGUnLCAyKVxuICAgIH1cblxuICAgIGlmICh0aGlzLmlucHV0LmtleWJvYXJkLmlzRG93bihQaGFzZXIuS2V5Ym9hcmQuVEhSRUUpKSB7XG4gICAgICAgIHRoaXMuc2V0Q3VycmVudFdlYXBvbigyKVxuICAgICAgICBFdmVudEhhbmRsZXIuZW1pdCgnd2VhcG9uIHVwZGF0ZScsIDMpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaW5wdXQua2V5Ym9hcmQuaXNEb3duKFBoYXNlci5LZXlib2FyZC5GT1VSKSkge1xuICAgICAgICB0aGlzLnNldEN1cnJlbnRXZWFwb24oMylcbiAgICAgICAgRXZlbnRIYW5kbGVyLmVtaXQoJ3dlYXBvbiB1cGRhdGUnLCA0KVxuICAgIH1cblxuICAgIGlmICh0aGlzLmlucHV0LmtleWJvYXJkLmlzRG93bihQaGFzZXIuS2V5Ym9hcmQuRklWRSkpIHtcbiAgICAgICAgdGhpcy5zZXRDdXJyZW50V2VhcG9uKDQpXG4gICAgICAgIEV2ZW50SGFuZGxlci5lbWl0KCd3ZWFwb24gdXBkYXRlJywgNSlcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pbnB1dC5rZXlib2FyZC5pc0Rvd24oUGhhc2VyLktleWJvYXJkLlNJWCkpIHtcbiAgICAgICAgdGhpcy5zZXRDdXJyZW50V2VhcG9uKDUpXG4gICAgICAgIEV2ZW50SGFuZGxlci5lbWl0KCd3ZWFwb24gdXBkYXRlJywgNilcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pbnB1dC5rZXlib2FyZC5pc0Rvd24oUGhhc2VyLktleWJvYXJkLlNFVkVOKSkge1xuICAgICAgICB0aGlzLnNldEN1cnJlbnRXZWFwb24oNilcbiAgICAgICAgRXZlbnRIYW5kbGVyLmVtaXQoJ3dlYXBvbiB1cGRhdGUnLCA3KVxuICAgIH1cblxuICAgIGlmICh0aGlzLmlucHV0LmtleWJvYXJkLmlzRG93bihQaGFzZXIuS2V5Ym9hcmQuRUlHSFQpKSB7XG4gICAgICAgIHRoaXMuc2V0Q3VycmVudFdlYXBvbig3KVxuICAgICAgICBFdmVudEhhbmRsZXIuZW1pdCgnd2VhcG9uIHVwZGF0ZScsIDgpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaW5wdXQua2V5Ym9hcmQuaXNEb3duKFBoYXNlci5LZXlib2FyZC5OSU5FKSkge1xuICAgICAgICB0aGlzLnNldEN1cnJlbnRXZWFwb24oOClcbiAgICAgICAgRXZlbnRIYW5kbGVyLmVtaXQoJ3dlYXBvbiB1cGRhdGUnLCA5KVxuICAgIH1cblxuICAgIGlmICh0aGlzLmlucHV0LmtleWJvYXJkLmlzRG93bihQaGFzZXIuS2V5Ym9hcmQuWkVSTykpIHtcbiAgICAgICAgdGhpcy5zZXRDdXJyZW50V2VhcG9uKDkpXG4gICAgICAgIEV2ZW50SGFuZGxlci5lbWl0KCd3ZWFwb24gdXBkYXRlJywgMClcbiAgICB9XG5cbiAgICB0aGlzLnBvc2l0aW9uVGV4dC50ZXh0ID0gYCR7dGhpcy5nYW1lLmlucHV0LndvcmxkWH0sICR7dGhpcy5nYW1lLmlucHV0LndvcmxkWX1gXG5cbiAgICB0aGlzLnNvY2tldC5lbWl0KCdtb3ZlIHBsYXllcicsIHtcbiAgICAgICAgcm9vbUlkOiB0aGlzLnJvb21JZCxcbiAgICAgICAgeDogdGhpcy5wbGF5ZXIueCxcbiAgICAgICAgeTogdGhpcy5wbGF5ZXIueVxuICAgIH0pXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IElucHV0SGFuZGxlciA9IHJlcXVpcmUoJy4vbGliL0lucHV0SGFuZGxlcicpXG4vLyBsZXQgRW5lbXlCdWZmYWxvID0gcmVxdWlyZSgnLi9saWIvRW5lbXlCdWZmYWxvJylcbmxldCBTb2NrZXRFdmVudHMgPSByZXF1aXJlKCcuL2xpYi9Tb2NrZXRFdmVudHMnKVxubGV0IENvcmUgPSByZXF1aXJlKCcuL2NvcmUnKVxuXG5sZXQgZ2FtZVdpZHRoID0gd2luZG93LmlubmVyV2lkdGhcbmxldCBnYW1lSGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0XG5sZXQgZ2FtZSA9IG5ldyBQaGFzZXIuR2FtZShnYW1lV2lkdGgsIGdhbWVIZWlnaHQsIFBoYXNlci5BVVRPLCAncmFuZ2VyLXN0ZXZlLWdhbWUnKVxuXG5sZXQgUmFuZ2VyU3RldmVHYW1lID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5jdXJyZW50V2VhcG9uID0gMFxuICAgIHRoaXMuZW5lbWllcyA9IFtdXG4gICAgdGhpcy5nYW1lID0gZ2FtZVxuICAgIHRoaXMuZ3JvdW5kXG4gICAgdGhpcy5wbGF0Zm9ybXNcbiAgICB0aGlzLnBsYXllclxuICAgIHRoaXMuc2NvcmUgPSAwXG4gICAgdGhpcy5zY29yZVRleHRcbiAgICB0aGlzLnNvY2tldFxuICAgIHRoaXMud2VhcG9uTmFtZSA9IG51bGxcbiAgICB0aGlzLndlYXBvbnMgPSBbXVxufVxuXG5SYW5nZXJTdGV2ZUdhbWUucHJvdG90eXBlID0ge1xuICAgIGluaXQ6IENvcmUuaW5pdCxcbiAgICBwcmVsb2FkOiBDb3JlLnByZWxvYWQsXG4gICAgY3JlYXRlOiBDb3JlLmNyZWF0ZSxcbiAgICB1cGRhdGU6IENvcmUudXBkYXRlLFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgfSxcblxuICAgIGxlZnRJbnB1dElzQWN0aXZlOiBJbnB1dEhhbmRsZXIubGVmdElucHV0SXNBY3RpdmUsXG4gICAgcmlnaHRJbnB1dElzQWN0aXZlOiBJbnB1dEhhbmRsZXIucmlnaHRJbnB1dElzQWN0aXZlLFxuICAgIHVwSW5wdXRJc0FjdGl2ZTogSW5wdXRIYW5kbGVyLnVwSW5wdXRJc0FjdGl2ZSxcbiAgICB1cElucHV0UmVsZWFzZWQ6IElucHV0SGFuZGxlci51cElucHV0UmVsZWFzZWQsXG5cbiAgICBzZXRDdXJyZW50V2VhcG9uOiBmdW5jdGlvbihuZXdDdXJyZW50V2VhcG9uKSB7XG4gICAgICAgIGlmIChuZXdDdXJyZW50V2VhcG9uID09PSB0aGlzLndlYXBvbnMubGVuZ3RoKVxuICAgICAgICAgICAgbmV3Q3VycmVudFdlYXBvbiA9IDBcblxuICAgICAgICAvLyAgUmVzZXQgY3VycmVudCB3ZWFwb25cbiAgICAgICAgdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0udmlzaWJsZSA9IGZhbHNlXG4gICAgICAgIHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLmNhbGxBbGwoJ3Jlc2V0JywgbnVsbCwgMCwgMClcbiAgICAgICAgdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0uc2V0QWxsKCdleGlzdHMnLCBmYWxzZSlcblxuICAgICAgICAvLyAgQWN0aXZhdGUgdGhlIG5ldyBvbmVcbiAgICAgICAgdGhpcy5jdXJyZW50V2VhcG9uID0gbmV3Q3VycmVudFdlYXBvblxuICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS52aXNpYmxlID0gdHJ1ZVxuICAgIH0sXG5cbiAgICBzZXRFdmVudEhhbmRsZXJzOiBTb2NrZXRFdmVudHMuc2V0RXZlbnRIYW5kbGVycyxcbiAgICBvblVwZGF0ZVBsYXllcnM6IFNvY2tldEV2ZW50cy5vblVwZGF0ZVBsYXllcnMsXG4gICAgb25Tb2NrZXRDb25uZWN0ZWQ6IFNvY2tldEV2ZW50cy5vblNvY2tldENvbm5lY3RlZCxcbiAgICBvblNvY2tldERpc2Nvbm5lY3Q6IFNvY2tldEV2ZW50cy5vblNvY2tldERpc2Nvbm5lY3QsXG4gICAgb25Nb3ZlUGxheWVyOiBTb2NrZXRFdmVudHMub25Nb3ZlUGxheWVyLFxuICAgIG9uUmVtb3ZlUGxheWVyOiBTb2NrZXRFdmVudHMub25SZW1vdmVQbGF5ZXIsXG4gICAgb25CdWxsZXRGaXJlZDogU29ja2V0RXZlbnRzLm9uQnVsbGV0RmlyZWQsXG4gICAgb25CdWxsZXRSZW1vdmVkOiBTb2NrZXRFdmVudHMub25CdWxsZXRSZW1vdmVkLFxuICAgIG9uUGxheWVyRGFtYWdlZDogU29ja2V0RXZlbnRzLm9uUGxheWVyRGFtYWdlZCxcbiAgICBvblBsYXllclJlc3Bhd246IFNvY2tldEV2ZW50cy5vblBsYXllclJlc3Bhd25cbn1cblxuZ2FtZS5zdGF0ZS5hZGQoJ0dhbWUnLCBSYW5nZXJTdGV2ZUdhbWUsIHRydWUpXG4iLCIndXNlIHN0cmljdCdcblxubGV0IEd1aWQgPSByZXF1aXJlKCcuL0d1aWQnKVxuXG52YXIgQnVsbGV0ID0gZnVuY3Rpb24gKGdhbWUsIGtleSkge1xuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCAwLCAwLCBrZXkpXG4gICAgdGhpcy50ZXh0dXJlLmJhc2VUZXh0dXJlLnNjYWxlTW9kZSA9IFBJWEkuc2NhbGVNb2Rlcy5ORUFSRVNUXG4gICAgdGhpcy5hbmNob3Iuc2V0KDAuNSlcbiAgICB0aGlzLmNoZWNrV29ybGRCb3VuZHMgPSB0cnVlXG4gICAgdGhpcy5vdXRPZkJvdW5kc0tpbGwgPSB0cnVlXG4gICAgdGhpcy5leGlzdHMgPSBmYWxzZVxuICAgIHRoaXMudHJhY2tpbmcgPSBmYWxzZVxuICAgIHRoaXMuc2NhbGVTcGVlZCA9IDBcbn1cblxuQnVsbGV0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpXG5CdWxsZXQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQnVsbGV0XG5cbkJ1bGxldC5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uICh4LCB5LCBhbmdsZSwgc3BlZWQsIGd4LCBneSwgc29ja2V0LCByb29tSWQpIHtcbiAgICB0aGlzLnJlc2V0KHgsIHkpXG5cbiAgICBsZXQgcG9pbnRlckFuZ2xlID0gdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLm1vdmVUb1BvaW50ZXIodGhpcywgc3BlZWQpXG4gICAgdGhpcy5ib2R5LmdyYXZpdHkueSA9IC0xODAwXG5cbiAgICBjb25zb2xlLmxvZygnRmlyaW5nIGJ1bGxldCBsb2NhbGx5JywgdGhpcy5idWxsZXRJZClcblxuICAgIHNvY2tldC5lbWl0KCdidWxsZXQgZmlyZWQnLCB7XG4gICAgICAgIHJvb21JZDogcm9vbUlkLFxuICAgICAgICBidWxsZXRJZDogdGhpcy5idWxsZXRJZCxcbiAgICAgICAgcGxheWVySWQ6ICcvIycgKyBzb2NrZXQuaWQsXG4gICAgICAgIHgsXG4gICAgICAgIHksXG4gICAgICAgIGFuZ2xlLFxuICAgICAgICBzcGVlZCxcbiAgICAgICAgZ3gsXG4gICAgICAgIGd5LFxuICAgICAgICBwb2ludGVyQW5nbGUsXG4gICAgICAgIGhlaWdodDogdGhpcy5oZWlnaHQsXG4gICAgICAgIHdpZHRoOiB0aGlzLndpZHRoLFxuICAgICAgICBkYW1hZ2U6IHRoaXMuZGFtYWdlXG4gICAgfSlcbn1cblxuQnVsbGV0LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMudHJhY2tpbmcpIHtcbiAgICAgICAgdGhpcy5yb3RhdGlvbiA9IE1hdGguYXRhbjIodGhpcy5ib2R5LnZlbG9jaXR5LnksIHRoaXMuYm9keS52ZWxvY2l0eS54KVxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCdWxsZXRcbiIsImltcG9ydCBlbWl0dGVyIGZyb20gJ2V2ZW50LWVtaXR0ZXInXG5cbmxldCBFdmVudEhhbmRsZXIgPSBlbWl0dGVyKHt9KVxuXG5leHBvcnQgZGVmYXVsdCBFdmVudEhhbmRsZXJcbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGd1aWRHZW5lcmF0b3IoKSB7XG4gICAgdmFyIFM0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgcmV0dXJuICgoKDErTWF0aC5yYW5kb20oKSkqMHgxMDAwMCl8MCkudG9TdHJpbmcoMTYpLnN1YnN0cmluZygxKVxuICAgIH1cblxuICAgIHJldHVybiAoUzQoKStTNCgpK1wiLVwiK1M0KCkrXCItXCIrUzQoKStcIi1cIitTNCgpK1wiLVwiK1M0KCkrUzQoKStTNCgpKVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIC8vIFRoaXMgZnVuY3Rpb24gc2hvdWxkIHJldHVybiB0cnVlIHdoZW4gdGhlIHBsYXllciBhY3RpdmF0ZXMgdGhlIFwiZ28gbGVmdFwiIGNvbnRyb2xcbiAgICAvLyBJbiB0aGlzIGNhc2UsIGVpdGhlciBob2xkaW5nIHRoZSByaWdodCBhcnJvdyBvciB0YXBwaW5nIG9yIGNsaWNraW5nIG9uIHRoZSBsZWZ0XG4gICAgLy8gc2lkZSBvZiB0aGUgc2NyZWVuLlxuICAgIGxlZnRJbnB1dElzQWN0aXZlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5wdXQua2V5Ym9hcmQuaXNEb3duKFBoYXNlci5LZXlib2FyZC5BKVxuICAgIH0sXG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIHNob3VsZCByZXR1cm4gdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgYWN0aXZhdGVzIHRoZSBcImdvIHJpZ2h0XCIgY29udHJvbFxuICAgIC8vIEluIHRoaXMgY2FzZSwgZWl0aGVyIGhvbGRpbmcgdGhlIHJpZ2h0IGFycm93IG9yIHRhcHBpbmcgb3IgY2xpY2tpbmcgb24gdGhlIHJpZ2h0XG4gICAgLy8gc2lkZSBvZiB0aGUgc2NyZWVuLlxuICAgIHJpZ2h0SW5wdXRJc0FjdGl2ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlucHV0LmtleWJvYXJkLmlzRG93bihQaGFzZXIuS2V5Ym9hcmQuRClcbiAgICB9LFxuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiBzaG91bGQgcmV0dXJuIHRydWUgd2hlbiB0aGUgcGxheWVyIGFjdGl2YXRlcyB0aGUgXCJqdW1wXCIgY29udHJvbFxuICAgIC8vIEluIHRoaXMgY2FzZSwgZWl0aGVyIGhvbGRpbmcgdGhlIHVwIGFycm93IG9yIHRhcHBpbmcgb3IgY2xpY2tpbmcgb24gdGhlIGNlbnRlclxuICAgIC8vIHBhcnQgb2YgdGhlIHNjcmVlbi5cbiAgICB1cElucHV0SXNBY3RpdmU6IGZ1bmN0aW9uKGR1cmF0aW9uKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlucHV0LmtleWJvYXJkLmRvd25EdXJhdGlvbihQaGFzZXIuS2V5Ym9hcmQuVywgZHVyYXRpb24pXG4gICAgfSxcblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gcmV0dXJucyB0cnVlIHdoZW4gdGhlIHBsYXllciByZWxlYXNlcyB0aGUgXCJqdW1wXCIgY29udHJvbFxuICAgIHVwSW5wdXRSZWxlYXNlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlucHV0LmtleWJvYXJkLnVwRHVyYXRpb24oUGhhc2VyLktleWJvYXJkLlcpXG4gICAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaWQpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZW5lbWllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAodGhpcy5lbmVtaWVzW2ldLnBsYXllci5pZCA9PT0gaWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmVuZW1pZXNbaV1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBSZW1vdGVQbGF5ZXIgPSBmdW5jdGlvbihpZCwgZ2FtZSwgcGxheWVyLCBzdGFydFgsIHN0YXJ0WSkge1xuICAgIGxldCBuZXdSZW1vdGVQbGF5ZXIgPSB7XG4gICAgICAgIHg6IHN0YXJ0WCxcbiAgICAgICAgeTogc3RhcnRZLFxuICAgICAgICBpZDogbnVsbCxcbiAgICAgICAgZ2FtZTogZ2FtZSxcbiAgICAgICAgaGVhbHRoOiAxMDAsXG4gICAgICAgIHBsYXllcjogcGxheWVyLFxuICAgICAgICBhbGl2ZTogdHJ1ZSxcbiAgICAgICAgbGFzdFBvc2l0aW9uOiB7XG4gICAgICAgICAgICB4OiBzdGFydFgsXG4gICAgICAgICAgICB5OiBzdGFydFlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIENyZWF0ZSB0aGUgcGxheWVyJ3MgZW5lbXkgc3ByaXRlXG4gICAgbmV3UmVtb3RlUGxheWVyLnBsYXllciA9IGdhbWUuYWRkLnNwcml0ZShzdGFydFgsIHN0YXJ0WSwgJ2VuZW15JylcblxuICAgIC8vICBXZSBuZWVkIHRvIGVuYWJsZSBwaHlzaWNzIG9uIHRoZSBwbGF5ZXJcbiAgICAvLyB0aGlzLnBoeXNpY3MuYXJjYWRlLmVuYWJsZShuZXdSZW1vdGVQbGF5ZXIucGxheWVyKVxuXG4gICAgLy8gLy8gRW5hYmxlIHBoeXNpY3Mgb24gdGhlIHBsYXllclxuICAgIC8vIHRoaXMuZ2FtZS5waHlzaWNzLmVuYWJsZShuZXdSZW1vdGVQbGF5ZXIucGxheWVyLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpXG5cbiAgICAvLyBNYWtlIHBsYXllciBjb2xsaWRlIHdpdGggd29ybGQgYm91bmRhcmllcyBzbyBoZSBkb2Vzbid0IGxlYXZlIHRoZSBzdGFnZVxuICAgIC8vIG5ld1JlbW90ZVBsYXllci5wbGF5ZXIuYm9keS5jb2xsaWRlV29ybGRCb3VuZHMgPSB0cnVlXG5cbiAgICAvLyBPdXIgdHdvIGFuaW1hdGlvbnMsIHdhbGtpbmcgbGVmdCBhbmQgcmlnaHQuXG4gICAgbmV3UmVtb3RlUGxheWVyLnBsYXllci5hbmltYXRpb25zLmFkZCgnbGVmdCcsIFswLCAxLCAyLCAzXSwgMTAsIHRydWUpXG4gICAgbmV3UmVtb3RlUGxheWVyLnBsYXllci5hbmltYXRpb25zLmFkZCgncmlnaHQnLCBbNSwgNiwgNywgOF0sIDEwLCB0cnVlKVxuXG4gICAgbmV3UmVtb3RlUGxheWVyLnBsYXllci5pZCA9IGlkXG5cbiAgICByZXR1cm4gbmV3UmVtb3RlUGxheWVyXG59XG5cbm1vZHVsZS5leHBvcnRzID0gUmVtb3RlUGxheWVyXG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgc2V0RXZlbnRIYW5kbGVyczogcmVxdWlyZSgnLi9zZXRFdmVudEhhbmRsZXJzJyksXG5cbiAgICBvblNvY2tldENvbm5lY3RlZDogcmVxdWlyZSgnLi9vblNvY2tldENvbm5lY3RlZCcpLFxuICAgIG9uU29ja2V0RGlzY29ubmVjdDogcmVxdWlyZSgnLi9vblNvY2tldERpc2Nvbm5lY3QnKSxcblxuICAgIG9uTW92ZVBsYXllcjogcmVxdWlyZSgnLi9vbk1vdmVQbGF5ZXInKSxcbiAgICBvblJlbW92ZVBsYXllcjogcmVxdWlyZSgnLi9vblJlbW92ZVBsYXllcicpLFxuICAgIG9uVXBkYXRlUGxheWVyczogcmVxdWlyZSgnLi9vblVwZGF0ZVBsYXllcnMnKSxcblxuICAgIG9uUGxheWVyRGFtYWdlZDogcmVxdWlyZSgnLi9vblBsYXllckRhbWFnZWQnKSxcbiAgICBvblBsYXllclJlc3Bhd246IHJlcXVpcmUoJy4vb25QbGF5ZXJSZXNwYXduJyksXG5cbiAgICBvbkJ1bGxldEZpcmVkOiByZXF1aXJlKCcuL29uQnVsbGV0RmlyZWQnKSxcbiAgICBvbkJ1bGxldFJlbW92ZWQ6IHJlcXVpcmUoJy4vb25CdWxsZXRSZW1vdmVkJylcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgQnVsbGV0ID0gcmVxdWlyZSgnLi4vQnVsbGV0JylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgaWYgKGRhdGEuaWQgPT09ICgnLyMnICsgdGhpcy5zb2NrZXQuaWQpKVxuICAgICAgICByZXR1cm5cblxuICAgIGNvbnNvbGUubG9nKCdGaXJpbmcgYnVsbGV0IHJlbW90ZWx5JywgZGF0YS5idWxsZXRJZClcblxuICAgIGxldCBuZXdFbmVteUJ1bGxldCA9IHRoaXMuZW5lbXlCdWxsZXRzLmNyZWF0ZShkYXRhLngsIGRhdGEueSwgJ2J1bGxldDEyJylcbiAgICBuZXdFbmVteUJ1bGxldC5idWxsZXRJZCA9IGRhdGEuYnVsbGV0SWRcbiAgICBuZXdFbmVteUJ1bGxldC5wbGF5ZXJJZCA9IGRhdGEucGxheWVySWRcbiAgICBuZXdFbmVteUJ1bGxldC5kYW1hZ2UgPSBkYXRhLmRhbWFnZVxuICAgIG5ld0VuZW15QnVsbGV0LnJvdGF0aW9uID0gZGF0YS5wb2ludGVyQW5nbGVcbiAgICBuZXdFbmVteUJ1bGxldC5oZWlnaHQgPSBkYXRhLmhlaWdodFxuICAgIG5ld0VuZW15QnVsbGV0LndpZHRoID0gZGF0YS53aWR0aFxuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmVuYWJsZShuZXdFbmVteUJ1bGxldCwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKVxuICAgIG5ld0VuZW15QnVsbGV0LmJvZHkuZ3Jhdml0eS55ID0gLTE4MDBcblxuICAgIGxldCBuZXdWZWxvY2l0eSA9IHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS52ZWxvY2l0eUZyb21Sb3RhdGlvbihkYXRhLnBvaW50ZXJBbmdsZSwgZGF0YS5zcGVlZClcbiAgICBuZXdFbmVteUJ1bGxldC5ib2R5LnZlbG9jaXR5LnggKz0gbmV3VmVsb2NpdHkueFxuICAgIG5ld0VuZW15QnVsbGV0LmJvZHkudmVsb2NpdHkueSArPSBuZXdWZWxvY2l0eS55XG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgaWYgKGRhdGEuaWQgPT09ICgnLyMnICsgdGhpcy5zb2NrZXQuaWQpKVxuICAgICAgICByZXR1cm5cblxuICAgIGNvbnNvbGUubG9nKCdSZW1vdmluZyBidWxsZXQnLCBkYXRhLmJ1bGxldElkKVxuXG4gICAgbGV0IHJlbW92ZUJ1bGxldCA9IF8uZmluZCh0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS5jaGlsZHJlbiwge1xuICAgICAgICBidWxsZXRJZDogZGF0YS5idWxsZXRJZFxuICAgIH0pXG5cbiAgICBpZiAoIXJlbW92ZUJ1bGxldCkge1xuICAgICAgICBjb25zb2xlLmxvZygnQnVsbGV0IG5vdCBmb3VuZDogJywgZGF0YS5idWxsZXRJZClcbiAgICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgcmVtb3ZlQnVsbGV0LmtpbGwoKVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBQbGF5ZXJCeUlkID0gcmVxdWlyZSgnLi4vUGxheWVyQnlJZCcpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIGxldCBtb3ZlUGxheWVyID0gUGxheWVyQnlJZC5jYWxsKHRoaXMsIGRhdGEuaWQpXG5cbiAgICAvLyBQbGF5ZXIgbm90IGZvdW5kXG4gICAgaWYgKCEgbW92ZVBsYXllcikge1xuICAgICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgcGxheWVyIHBvc2l0aW9uXG4gICAgbW92ZVBsYXllci5wbGF5ZXIueCA9IGRhdGEueFxuICAgIG1vdmVQbGF5ZXIucGxheWVyLnkgPSBkYXRhLnlcblxuICAgIGlmIChtb3ZlUGxheWVyLnBsYXllci54ID4gbW92ZVBsYXllci5sYXN0UG9zaXRpb24ueCkge1xuICAgICAgICBtb3ZlUGxheWVyLnBsYXllci5hbmltYXRpb25zLnBsYXkoJ3JpZ2h0JylcbiAgICB9XG4gICAgZWxzZSBpZiAobW92ZVBsYXllci5wbGF5ZXIueCA8IG1vdmVQbGF5ZXIubGFzdFBvc2l0aW9uLngpXG4gICAge1xuICAgICAgICBtb3ZlUGxheWVyLnBsYXllci5hbmltYXRpb25zLnBsYXkoJ2xlZnQnKVxuICAgIH1cbiAgICBlbHNlXG4gICAge1xuICAgICAgICBtb3ZlUGxheWVyLnBsYXllci5hbmltYXRpb25zLnN0b3AoKVxuICAgICAgICBtb3ZlUGxheWVyLnBsYXllci5mcmFtZSA9IDRcbiAgICB9XG5cbiAgICBtb3ZlUGxheWVyLmxhc3RQb3NpdGlvbi54ID0gbW92ZVBsYXllci5wbGF5ZXIueFxuICAgIG1vdmVQbGF5ZXIubGFzdFBvc2l0aW9uLnkgPSBtb3ZlUGxheWVyLnBsYXllci55XG59XG4iLCIndXNlIHN0cmljdCdcblxuaW1wb3J0IEV2ZW50SGFuZGxlciBmcm9tICcuLi9FdmVudEhhbmRsZXInXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIGlmIChkYXRhLmRhbWFnZWRQbGF5ZXJJZCAhPT0gKCcvIycgKyB0aGlzLnNvY2tldC5pZCkpXG4gICAgICAgIHJldHVyblxuXG4gICAgdGhpcy5wbGF5ZXIubWV0YS5oZWFsdGggPSBkYXRhLmhlYWx0aFxuICAgIEV2ZW50SGFuZGxlci5lbWl0KCdoZWFsdGggdXBkYXRlJywgdGhpcy5wbGF5ZXIubWV0YS5oZWFsdGgpXG59XG4iLCIndXNlIHN0cmljdCdcblxuaW1wb3J0IEV2ZW50SGFuZGxlciBmcm9tICcuLi9FdmVudEhhbmRsZXInXG5sZXQgSGlnaFJ1bGVEZXNlcnQgPSByZXF1aXJlKCcuLi8uLi9tYXBzL0hpZ2hSdWxlRGVzZXJ0JylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgaWYgKGRhdGEuZGFtYWdlZFBsYXllcklkICE9PSAoJy8jJyArIHRoaXMuc29ja2V0LmlkKSlcbiAgICAgICAgcmV0dXJuXG5cbiAgICB0aGlzLnBsYXllci5tZXRhLmhlYWx0aCA9IGRhdGEuaGVhbHRoXG4gICAgRXZlbnRIYW5kbGVyLmVtaXQoJ2hlYWx0aCB1cGRhdGUnLCBTdHJpbmcodGhpcy5wbGF5ZXIubWV0YS5oZWFsdGgpKVxuXG4gICAgbGV0IHNwYXduUG9pbnQgPSBIaWdoUnVsZURlc2VydC5nZXRSYW5kb21TcGF3blBvaW50LmNhbGwodGhpcylcbiAgICB0aGlzLnBsYXllci54ID0gc3Bhd25Qb2ludC54XG4gICAgdGhpcy5wbGF5ZXIueSA9IHNwYXduUG9pbnQueVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBQbGF5ZXJCeUlkID0gcmVxdWlyZSgnLi4vUGxheWVyQnlJZCcpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIGxldCByZW1vdmVQbGF5ZXIgPSBQbGF5ZXJCeUlkLmNhbGwodGhpcywgZGF0YS5pZClcblxuICAgIC8vIFBsYXllciBub3QgZm91bmRcbiAgICBpZiAoIXJlbW92ZVBsYXllcikge1xuICAgICAgICBjb25zb2xlLmxvZygnUGxheWVyIG5vdCBmb3VuZDogJywgZGF0YS5pZClcbiAgICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgcmVtb3ZlUGxheWVyLnBsYXllci5raWxsKClcblxuICAgIC8vIFJlbW92ZSBwbGF5ZXIgZnJvbSBhcnJheVxuICAgIHRoaXMuZW5lbWllcy5zcGxpY2UodGhpcy5lbmVtaWVzLmluZGV4T2YocmVtb3ZlUGxheWVyKSwgMSlcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG52YXIgZ2V0UXVlcnlTdHJpbmcgPSBmdW5jdGlvbiAoIGZpZWxkLCB1cmwgKSB7XG4gICAgdmFyIGhyZWYgPSB1cmwgPyB1cmwgOiB3aW5kb3cubG9jYXRpb24uaHJlZjtcbiAgICB2YXIgcmVnID0gbmV3IFJlZ0V4cCggJ1s/Jl0nICsgZmllbGQgKyAnPShbXiYjXSopJywgJ2knICk7XG4gICAgdmFyIHN0cmluZyA9IHJlZy5leGVjKGhyZWYpO1xuICAgIHJldHVybiBzdHJpbmcgPyBzdHJpbmdbMV0gOiBudWxsO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZygnQ29ubmVjdGVkIHRvIHNvY2tldCBzZXJ2ZXInKVxuXG4gICAgIC8vIFJlc2V0IGVuZW1pZXMgb24gcmVjb25uZWN0XG4gICAgdGhpcy5lbmVtaWVzLmZvckVhY2goZnVuY3Rpb24gKGVuZW15KSB7XG4gICAgICAgIGlmIChlbmVteSkgZW5lbXkua2lsbCgpXG4gICAgfSlcblxuICAgIHRoaXMuZW5lbWllcyA9IFtdXG5cbiAgICAvLyBTZW5kIGxvY2FsIHBsYXllciBkYXRhIHRvIHRoZSBnYW1lIHNlcnZlclxuICAgIHRoaXMuc29ja2V0LmVtaXQoJ25ldyBwbGF5ZXInLCB7XG4gICAgICAgIHJvb21JZDogZ2V0UXVlcnlTdHJpbmcoJ3Jvb21JZCcpLFxuICAgICAgICB4OiB0aGlzLnBsYXllci54LFxuICAgICAgICB5OiB0aGlzLnBsYXllci55XG4gICAgfSlcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKCdEaXNjb25uZWN0ZWQgZnJvbSBzb2NrZXQgc2VydmVyJylcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgUmVtb3RlUGxheWVyID0gcmVxdWlyZSgnLi4vUmVtb3RlUGxheWVyJylcbmltcG9ydCBFdmVudEhhbmRsZXIgZnJvbSAnLi4vRXZlbnRIYW5kbGVyJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBjb25zb2xlLmxvZygndXBkYXRlIHBsYXllcnMnLCBkYXRhKVxuXG4gICAgdGhpcy5yb29tSWQgPSBkYXRhLnJvb20uaWRcblxuICAgIGxldCBuZXd1cmwgPSB3aW5kb3cubG9jYXRpb24ucHJvdG9jb2wgKyBcIi8vXCIgKyB3aW5kb3cubG9jYXRpb24uaG9zdCArIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArICc/cm9vbUlkPScgKyBkYXRhLnJvb20uaWQ7XG4gICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKHsgcGF0aDogbmV3dXJsIH0sICcnLCBuZXd1cmwpO1xuXG4gICAgdGhpcy5lbmVtaWVzLmZvckVhY2goZnVuY3Rpb24gKGVuZW15KSB7XG4gICAgICAgIGVuZW15LnBsYXllci5raWxsKClcbiAgICB9KVxuXG4gICAgdGhpcy5lbmVtaWVzID0gW11cblxuICAgIEV2ZW50SGFuZGxlci5lbWl0KCdwbGF5ZXJzIHVwZGF0ZScsIGRhdGEucm9vbS5wbGF5ZXJzKVxuXG4gICAgZGF0YS5yb29tLnBsYXllcnMuZm9yRWFjaCgocGxheWVyKSA9PiB7XG4gICAgICAgIGlmIChwbGF5ZXIuaWQgPT09ICgnLyMnICsgdGhpcy5zb2NrZXQuaWQpKSB7XG4gICAgICAgICAgICBFdmVudEhhbmRsZXIuZW1pdCgnc2NvcmUgdXBkYXRlJywgU3RyaW5nKHBsYXllci5tZXRhLnNjb3JlKSlcbiAgICAgICAgICAgIEV2ZW50SGFuZGxlci5lbWl0KCdoZWFsdGggdXBkYXRlJywgU3RyaW5nKHBsYXllci5tZXRhLmhlYWx0aCkpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBuZXdSZW1vdGVQbGF5ZXIgPSBSZW1vdGVQbGF5ZXIuY2FsbCh0aGlzLCBwbGF5ZXIuaWQsIHRoaXMuZ2FtZSwgdGhpcy5wbGF5ZXIsIHBsYXllci54LCBwbGF5ZXIueSlcbiAgICAgICAgdGhpcy5lbmVtaWVzLnB1c2gobmV3UmVtb3RlUGxheWVyKVxuICAgICAgICB0aGlzLmVuZW1pZXNbdGhpcy5lbmVtaWVzLmxlbmd0aCAtIDFdLnBsYXllci5hbmltYXRpb25zLmFkZCgnbGVmdCcsIFswLCAxLCAyLCAzXSwgMTAsIHRydWUpXG4gICAgICAgIHRoaXMuZW5lbWllc1t0aGlzLmVuZW1pZXMubGVuZ3RoIC0gMV0ucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdyaWdodCcsIFs1LCA2LCA3LCA4XSwgMTAsIHRydWUpXG4gICAgfSlcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5pbXBvcnQgRXZlbnRIYW5kbGVyIGZyb20gJy4uL0V2ZW50SGFuZGxlcidcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zb2NrZXQub24oJ2Nvbm5lY3QnLCB0aGlzLm9uU29ja2V0Q29ubmVjdGVkLmJpbmQodGhpcykpXG4gICAgdGhpcy5zb2NrZXQub24oJ2Rpc2Nvbm5lY3QnLCB0aGlzLm9uU29ja2V0RGlzY29ubmVjdC5iaW5kKHRoaXMpKVxuXG4gICAgdGhpcy5zb2NrZXQub24oJ3VwZGF0ZSBwbGF5ZXJzJywgdGhpcy5vblVwZGF0ZVBsYXllcnMuYmluZCh0aGlzKSlcbiAgICB0aGlzLnNvY2tldC5vbignbW92ZSBwbGF5ZXInLCB0aGlzLm9uTW92ZVBsYXllci5iaW5kKHRoaXMpKVxuICAgIHRoaXMuc29ja2V0Lm9uKCdyZW1vdmUgcGxheWVyJywgdGhpcy5vblJlbW92ZVBsYXllci5iaW5kKHRoaXMpKVxuXG4gICAgdGhpcy5zb2NrZXQub24oJ3BsYXllciByZXNwYXduJywgdGhpcy5vblBsYXllclJlc3Bhd24uYmluZCh0aGlzKSlcbiAgICB0aGlzLnNvY2tldC5vbigncGxheWVyIGRhbWFnZWQnLCB0aGlzLm9uUGxheWVyRGFtYWdlZC5iaW5kKHRoaXMpKVxuXG4gICAgdGhpcy5zb2NrZXQub24oJ2J1bGxldCBmaXJlZCcsIHRoaXMub25CdWxsZXRGaXJlZC5iaW5kKHRoaXMpKVxuICAgIHRoaXMuc29ja2V0Lm9uKCdidWxsZXQgcmVtb3ZlZCcsIHRoaXMub25CdWxsZXRSZW1vdmVkLmJpbmQodGhpcykpXG5cbiAgICBFdmVudEhhbmRsZXIub24oJ3BsYXllciB1cGRhdGUgbmlja25hbWUnLCAoZGF0YSkgPT4ge1xuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdwbGF5ZXIgdXBkYXRlIG5pY2tuYW1lJywge1xuICAgICAgICAgICAgcm9vbUlkOiB0aGlzLnJvb21JZCxcbiAgICAgICAgICAgIG5pY2tuYW1lOiBkYXRhLm5pY2tuYW1lXG4gICAgICAgIH0pXG4gICAgfSlcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgQnVsbGV0ID0gcmVxdWlyZSgnLi4vQnVsbGV0JylcbmxldCBHdWlkID0gcmVxdWlyZSgnLi4vR3VpZCcpXG5cbmxldCBBSzQ3ID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGNvbmZpZy5nYW1lLCBjb25maWcuZ2FtZS53b3JsZCwgJ0FLLTQ3JywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG5cbiAgICAvL1x0SGVyZSB3ZSBzZXQtdXAgb3VyIGF1ZGlvIHNwcml0ZVxuICAgIHRoaXMuZnggPSBjb25maWcuZ2FtZS5hZGQuYXVkaW8oJ0FLNDctc291bmQnKVxuICAgIHRoaXMuYWxsb3dNdWx0aXBsZSA9IHRydWVcblxuICAgIHRoaXMuZGFtYWdlID0gMjJcbiAgICB0aGlzLm5leHRGaXJlID0gMFxuICAgIHRoaXMuYnVsbGV0U3BlZWQgPSAyMzAwXG4gICAgdGhpcy5maXJlUmF0ZSA9IDE2MDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNjQ7IGkrKylcbiAgICB7XG4gICAgICAgIGxldCBidWxsZXQgPSBuZXcgQnVsbGV0KGNvbmZpZy5nYW1lLCAnYnVsbGV0MTInLCBjb25maWcuc29ja2V0KVxuICAgICAgICBidWxsZXQuYnVsbGV0SWQgPSBHdWlkKClcbiAgICAgICAgYnVsbGV0LmhlaWdodCA9IDJcbiAgICAgICAgYnVsbGV0LndpZHRoID0gNDBcbiAgICAgICAgYnVsbGV0LmRhbWFnZSA9IDIyXG4gICAgICAgIHRoaXMuYWRkKGJ1bGxldCwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbn1cblxuQUs0Ny5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuQUs0Ny5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBBSzQ3O1xuXG5BSzQ3LnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24ocGxheWVyLCBzb2NrZXQsIHJvb21JZCwgdm9sdW1lKSB7XG4gICAgaWYgKHRoaXMuZ2FtZS50aW1lLnRpbWUgPCB0aGlzLm5leHRGaXJlKVxuICAgICAgICByZXR1cm5cblxuICAgIHZhciB4ID0gcGxheWVyLnggKyAxMFxuICAgIHZhciB5ID0gcGxheWVyLnkgKyAtMTBcblxuICAgIHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgMCwgc29ja2V0LCByb29tSWQpXG4gICAgdGhpcy5zZXRBbGwoJ3RyYWNraW5nJywgdHJ1ZSlcblxuICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLmdhbWUudGltZS50aW1lICsgdGhpcy5maXJlUmF0ZVxuICAgIHRoaXMuZngudm9sdW1lID0gLjMgKiB2b2x1bWVcbiAgICB0aGlzLmZ4LnBsYXkoKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFLNDdcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgQnVsbGV0ID0gcmVxdWlyZSgnLi4vQnVsbGV0JylcbmxldCBHdWlkID0gcmVxdWlyZSgnLi4vR3VpZCcpXG5cbmxldCBBSzQ3ID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGNvbmZpZy5nYW1lLCBjb25maWcuZ2FtZS53b3JsZCwgJ0FLLTQ3JywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG5cbiAgICAvL1x0SGVyZSB3ZSBzZXQtdXAgb3VyIGF1ZGlvIHNwcml0ZVxuICAgIHRoaXMuZnggPSBjb25maWcuZ2FtZS5hZGQuYXVkaW8oJ0FLNDctc291bmQnKVxuICAgIHRoaXMuYWxsb3dNdWx0aXBsZSA9IHRydWVcblxuICAgIHRoaXMuZGFtYWdlID0gMjJcbiAgICB0aGlzLm5leHRGaXJlID0gMFxuICAgIHRoaXMuYnVsbGV0U3BlZWQgPSAyMzAwXG4gICAgdGhpcy5maXJlUmF0ZSA9IDE2MDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNjQ7IGkrKylcbiAgICB7XG4gICAgICAgIGxldCBidWxsZXQgPSBuZXcgQnVsbGV0KGNvbmZpZy5nYW1lLCAnYnVsbGV0MTInLCBjb25maWcuc29ja2V0KVxuICAgICAgICBidWxsZXQuYnVsbGV0SWQgPSBHdWlkKClcbiAgICAgICAgYnVsbGV0LmhlaWdodCA9IDJcbiAgICAgICAgYnVsbGV0LndpZHRoID0gNDBcbiAgICAgICAgYnVsbGV0LmRhbWFnZSA9IDIyXG4gICAgICAgIHRoaXMuYWRkKGJ1bGxldCwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbn1cblxuQUs0Ny5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuQUs0Ny5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBBSzQ3O1xuXG5BSzQ3LnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24ocGxheWVyLCBzb2NrZXQsIHJvb21JZCwgdm9sdW1lKSB7XG4gICAgaWYgKHRoaXMuZ2FtZS50aW1lLnRpbWUgPCB0aGlzLm5leHRGaXJlKVxuICAgICAgICByZXR1cm5cblxuICAgIHZhciB4ID0gcGxheWVyLnggKyAxNTtcbiAgICB2YXIgeSA9IHBsYXllci55ICsgMzA7XG5cbiAgICB0aGlzLmdldEZpcnN0RXhpc3RzKGZhbHNlKS5maXJlKHgsIHksIDAsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDAsIHNvY2tldCwgcm9vbUlkKVxuICAgIHRoaXMuc2V0QWxsKCd0cmFja2luZycsIHRydWUpXG5cbiAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5nYW1lLnRpbWUudGltZSArIHRoaXMuZmlyZVJhdGVcbiAgICBjb25zb2xlLmxvZyh2b2x1bWUpXG4gICAgY29uc29sZS5sb2coLjMgKiB2b2x1bWUpXG4gICAgdGhpcy5meC52b2x1bWUgPSAuMyAqIHZvbHVtZVxuICAgIHRoaXMuZngucGxheSgpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQUs0N1xuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBCdWxsZXQgPSByZXF1aXJlKCcuLi9CdWxsZXQnKVxubGV0IEd1aWQgPSByZXF1aXJlKCcuLi9HdWlkJylcblxubGV0IEJhcnJldE05MCA9IGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCBjb25maWcuZ2FtZSwgY29uZmlnLmdhbWUud29ybGQsICdCYXJyZXQgTTkwJywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG5cbiAgICAvL1x0SGVyZSB3ZSBzZXQtdXAgb3VyIGF1ZGlvIHNwcml0ZVxuICAgIHRoaXMuZnggPSBjb25maWcuZ2FtZS5hZGQuYXVkaW8oJ0JhcnJldE05MC1zb3VuZCcpXG4gICAgdGhpcy5hbGxvd011bHRpcGxlID0gdHJ1ZVxuXG4gICAgdGhpcy5uYW1lID0gJ0JhcnJldCBNOTAnXG4gICAgdGhpcy5kYW1hZ2UgPSA4OFxuICAgIHRoaXMubmV4dEZpcmUgPSAwXG4gICAgdGhpcy5idWxsZXRTcGVlZCA9IDM0MzVcblxuICAgIC8vIEJhcnJldE05MCBmaXJlcyBhYm91dCA2MDAgYnVsbGV0cyBwZXIgc2Vjb25kXG4gICAgdGhpcy5maXJlUmF0ZSA9IDMwMDBcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNjQ7IGkrKylcbiAgICB7XG4gICAgICAgIGxldCBidWxsZXQgPSBuZXcgQnVsbGV0KGNvbmZpZy5nYW1lLCAnYnVsbGV0MTInLCBjb25maWcuc29ja2V0KVxuICAgICAgICBidWxsZXQuYnVsbGV0SWQgPSBHdWlkKClcbiAgICAgICAgYnVsbGV0LmhlaWdodCA9IDJcbiAgICAgICAgYnVsbGV0LndpZHRoID0gNDBcbiAgICAgICAgYnVsbGV0LmRhbWFnZSA9IDg4XG5cbiAgICAgICAgdGhpcy5hZGQoYnVsbGV0LCB0cnVlKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG59XG5cbkJhcnJldE05MC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuQmFycmV0TTkwLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEJhcnJldE05MDtcblxuQmFycmV0TTkwLnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24gKHBsYXllciwgc29ja2V0LCByb29tSWQpIHtcbiAgICBpZiAodGhpcy5nYW1lLnRpbWUudGltZSA8IHRoaXMubmV4dEZpcmUpXG4gICAgICAgIHJldHVyblxuXG4gICAgdmFyIHggPSBwbGF5ZXIueCArIDE1O1xuICAgIHZhciB5ID0gcGxheWVyLnkgKyAzMDtcblxuICAgIHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgMCwgc29ja2V0LCByb29tSWQpXG4gICAgdGhpcy5zZXRBbGwoJ3RyYWNraW5nJywgdHJ1ZSlcblxuICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLmdhbWUudGltZS50aW1lICsgdGhpcy5maXJlUmF0ZVxuICAgIHRoaXMuZngudm9sdW1lID0gLjZcbiAgICB0aGlzLmZ4LnBsYXkoKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhcnJldE05MFxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBCdWxsZXQgPSByZXF1aXJlKCcuLi9CdWxsZXQnKVxubGV0IEd1aWQgPSByZXF1aXJlKCcuLi9HdWlkJylcblxubGV0IEFLNDcgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgY29uZmlnLmdhbWUsIGNvbmZpZy5nYW1lLndvcmxkLCAnRGVzZXJ0IEVhZ2xlJywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG5cbiAgICAvL1x0SGVyZSB3ZSBzZXQtdXAgb3VyIGF1ZGlvIHNwcml0ZVxuICAgIHRoaXMuZnggPSBjb25maWcuZ2FtZS5hZGQuYXVkaW8oJ0Rlc2VydEVhZ2xlLXNvdW5kJylcbiAgICB0aGlzLmFsbG93TXVsdGlwbGUgPSB0cnVlXG5cbiAgICB0aGlzLmRhbWFnZSA9IDMzXG4gICAgdGhpcy5uZXh0RmlyZSA9IDBcbiAgICB0aGlzLmJ1bGxldFNwZWVkID0gMjMwMFxuICAgIHRoaXMuZmlyZVJhdGUgPSAyNjc7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDY0OyBpKyspXG4gICAge1xuICAgICAgICBsZXQgYnVsbGV0ID0gbmV3IEJ1bGxldChjb25maWcuZ2FtZSwgJ2J1bGxldDEyJywgY29uZmlnLnNvY2tldClcbiAgICAgICAgYnVsbGV0LmJ1bGxldElkID0gR3VpZCgpXG4gICAgICAgIGJ1bGxldC5oZWlnaHQgPSAyXG4gICAgICAgIGJ1bGxldC53aWR0aCA9IDQwXG4gICAgICAgIGJ1bGxldC5kYW1hZ2UgPSAyMlxuICAgICAgICB0aGlzLmFkZChidWxsZXQsIHRydWUpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG59XG5cbkFLNDcucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcbkFLNDcucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQUs0NztcblxuQUs0Ny5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uKHBsYXllciwgc29ja2V0LCByb29tSWQpIHtcbiAgICBpZiAodGhpcy5nYW1lLnRpbWUudGltZSA8IHRoaXMubmV4dEZpcmUpXG4gICAgICAgIHJldHVyblxuXG4gICAgdmFyIHggPSBwbGF5ZXIueCArIDE1O1xuICAgIHZhciB5ID0gcGxheWVyLnkgKyAzMDtcblxuICAgIHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgMCwgc29ja2V0LCByb29tSWQpXG4gICAgdGhpcy5zZXRBbGwoJ3RyYWNraW5nJywgdHJ1ZSlcblxuICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLmdhbWUudGltZS50aW1lICsgdGhpcy5maXJlUmF0ZVxuICAgIHRoaXMuZngudm9sdW1lID0gLjNcbiAgICB0aGlzLmZ4LnBsYXkoKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFLNDdcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgQnVsbGV0ID0gcmVxdWlyZSgnLi4vQnVsbGV0JylcbmxldCBHdWlkID0gcmVxdWlyZSgnLi4vR3VpZCcpXG5cbmxldCBBSzQ3ID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGNvbmZpZy5nYW1lLCBjb25maWcuZ2FtZS53b3JsZCwgJ0FLLTQ3JywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG5cbiAgICAvL1x0SGVyZSB3ZSBzZXQtdXAgb3VyIGF1ZGlvIHNwcml0ZVxuICAgIHRoaXMuZnggPSBjb25maWcuZ2FtZS5hZGQuYXVkaW8oJ0FLNDctc291bmQnKVxuICAgIHRoaXMuYWxsb3dNdWx0aXBsZSA9IHRydWVcblxuICAgIHRoaXMuZGFtYWdlID0gMjJcbiAgICB0aGlzLm5leHRGaXJlID0gMFxuICAgIHRoaXMuYnVsbGV0U3BlZWQgPSAyMzAwXG4gICAgdGhpcy5maXJlUmF0ZSA9IDE2MDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNjQ7IGkrKylcbiAgICB7XG4gICAgICAgIGxldCBidWxsZXQgPSBuZXcgQnVsbGV0KGNvbmZpZy5nYW1lLCAnYnVsbGV0MTInLCBjb25maWcuc29ja2V0KVxuICAgICAgICBidWxsZXQuYnVsbGV0SWQgPSBHdWlkKClcbiAgICAgICAgYnVsbGV0LmhlaWdodCA9IDJcbiAgICAgICAgYnVsbGV0LndpZHRoID0gNDBcbiAgICAgICAgYnVsbGV0LmRhbWFnZSA9IDIyXG4gICAgICAgIHRoaXMuYWRkKGJ1bGxldCwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbn1cblxuQUs0Ny5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuQUs0Ny5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBBSzQ3O1xuXG5BSzQ3LnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24ocGxheWVyLCBzb2NrZXQsIHJvb21JZCwgdm9sdW1lKSB7XG4gICAgaWYgKHRoaXMuZ2FtZS50aW1lLnRpbWUgPCB0aGlzLm5leHRGaXJlKVxuICAgICAgICByZXR1cm5cblxuICAgIHZhciB4ID0gcGxheWVyLnggKyAxNTtcbiAgICB2YXIgeSA9IHBsYXllci55ICsgMzA7XG5cbiAgICB0aGlzLmdldEZpcnN0RXhpc3RzKGZhbHNlKS5maXJlKHgsIHksIDAsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDAsIHNvY2tldCwgcm9vbUlkKVxuICAgIHRoaXMuc2V0QWxsKCd0cmFja2luZycsIHRydWUpXG5cbiAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5nYW1lLnRpbWUudGltZSArIHRoaXMuZmlyZVJhdGVcbiAgICBjb25zb2xlLmxvZyh2b2x1bWUpXG4gICAgY29uc29sZS5sb2coLjMgKiB2b2x1bWUpXG4gICAgdGhpcy5meC52b2x1bWUgPSAuMyAqIHZvbHVtZVxuICAgIHRoaXMuZngucGxheSgpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQUs0N1xuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBCdWxsZXQgPSByZXF1aXJlKCcuLi9CdWxsZXQnKVxubGV0IEd1aWQgPSByZXF1aXJlKCcuLi9HdWlkJylcblxubGV0IEFLNDcgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgY29uZmlnLmdhbWUsIGNvbmZpZy5nYW1lLndvcmxkLCAnTTRBMScsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuXG4gICAgLy9cdEhlcmUgd2Ugc2V0LXVwIG91ciBhdWRpbyBzcHJpdGVcbiAgICB0aGlzLmZ4ID0gY29uZmlnLmdhbWUuYWRkLmF1ZGlvKCdNNEExLXNvdW5kJylcbiAgICB0aGlzLmFsbG93TXVsdGlwbGUgPSB0cnVlXG5cbiAgICB0aGlzLmRhbWFnZSA9IDIwXG4gICAgdGhpcy5uZXh0RmlyZSA9IDBcbiAgICB0aGlzLmJ1bGxldFNwZWVkID0gMjQwMFxuICAgIHRoaXMuZmlyZVJhdGUgPSAxNTA7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDY0OyBpKyspXG4gICAge1xuICAgICAgICBsZXQgYnVsbGV0ID0gbmV3IEJ1bGxldChjb25maWcuZ2FtZSwgJ2J1bGxldDEyJywgY29uZmlnLnNvY2tldClcbiAgICAgICAgYnVsbGV0LmJ1bGxldElkID0gR3VpZCgpXG4gICAgICAgIGJ1bGxldC5oZWlnaHQgPSAyXG4gICAgICAgIGJ1bGxldC53aWR0aCA9IDQwXG4gICAgICAgIGJ1bGxldC5kYW1hZ2UgPSAyMlxuICAgICAgICB0aGlzLmFkZChidWxsZXQsIHRydWUpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG59XG5cbkFLNDcucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcbkFLNDcucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQUs0NztcblxuQUs0Ny5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uKHBsYXllciwgc29ja2V0LCByb29tSWQpIHtcbiAgICBpZiAodGhpcy5nYW1lLnRpbWUudGltZSA8IHRoaXMubmV4dEZpcmUpXG4gICAgICAgIHJldHVyblxuXG4gICAgdmFyIHggPSBwbGF5ZXIueCArIDE1O1xuICAgIHZhciB5ID0gcGxheWVyLnkgKyAzMDtcblxuICAgIHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgMCwgc29ja2V0LCByb29tSWQpXG4gICAgdGhpcy5zZXRBbGwoJ3RyYWNraW5nJywgdHJ1ZSlcblxuICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLmdhbWUudGltZS50aW1lICsgdGhpcy5maXJlUmF0ZVxuICAgIHRoaXMuZngudm9sdW1lID0gLjNcbiAgICB0aGlzLmZ4LnBsYXkoKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFLNDdcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgQnVsbGV0ID0gcmVxdWlyZSgnLi4vQnVsbGV0JylcbmxldCBHdWlkID0gcmVxdWlyZSgnLi4vR3VpZCcpXG5cbmxldCBTcGFzMTIgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgY29uZmlnLmdhbWUsIGNvbmZpZy5nYW1lLndvcmxkLCAnU3Bhcy0xMicsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpXG5cbiAgICB0aGlzLm5leHRGaXJlID0gMFxuICAgIHRoaXMuYnVsbGV0U3BlZWQgPSAxOTAwXG4gICAgdGhpcy5maXJlUmF0ZSA9IDUwMFxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzMjsgaSsrKVxuICAgIHtcbiAgICAgICAgbGV0IGJ1bGxldCA9IG5ldyBCdWxsZXQoY29uZmlnLmdhbWUsICdidWxsZXQxMicsIGNvbmZpZy5zb2NrZXQpXG4gICAgICAgIGJ1bGxldC5idWxsZXRJZCA9IEd1aWQoKVxuICAgICAgICBidWxsZXQuaGVpZ2h0ID0gMlxuICAgICAgICBidWxsZXQud2lkdGggPSA0MFxuICAgICAgICBidWxsZXQuZGFtYWdlID0gMjJcbiAgICAgICAgdGhpcy5hZGQoYnVsbGV0LCB0cnVlKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG59XG5cblNwYXMxMi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpXG5TcGFzMTIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU3BhczEyXG5cblNwYXMxMi5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uIChwbGF5ZXIsIHNvY2tldCwgcm9vbUlkKSB7XG4gICAgaWYgKHRoaXMuZ2FtZS50aW1lLnRpbWUgPCB0aGlzLm5leHRGaXJlKVxuICAgICAgICByZXR1cm5cblxuXG5cblxuXG4gICAgdmFyIHggPSBwbGF5ZXIueCArIDE1XG4gICAgdmFyIHkgPSBwbGF5ZXIueSArIDMwXG5cblxuXG4gICAgdmFyIGJ1bGxldEluc3RhbmNlID0gdGhpcy5nZXRGaXJzdEV4aXN0cyhmYWxzZSlcbiAgICBpZiAoIWJ1bGxldEluc3RhbmNlKSByZXR1cm5cbiAgICBidWxsZXRJbnN0YW5jZS5maXJlKHgsIHksIC4zLCB0aGlzLmJ1bGxldFNwZWVkLCAwLCAwLCBzb2NrZXQsIHJvb21JZClcblxuXG5cblxuICAgIGJ1bGxldEluc3RhbmNlID0gdGhpcy5nZXRGaXJzdEV4aXN0cyhmYWxzZSlcbiAgICBpZiAoIWJ1bGxldEluc3RhbmNlKSByZXR1cm5cbiAgICBidWxsZXRJbnN0YW5jZS5maXJlKHgsIHksIC0wLjMsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDAsIHNvY2tldCwgcm9vbUlkKVxuXG5cblxuICAgIGJ1bGxldEluc3RhbmNlID0gdGhpcy5nZXRGaXJzdEV4aXN0cyhmYWxzZSlcbiAgICBpZiAoIWJ1bGxldEluc3RhbmNlKSByZXR1cm5cbiAgICBidWxsZXRJbnN0YW5jZS5maXJlKHgsIHksIDAsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDAsIHNvY2tldCwgcm9vbUlkKVxuXG5cblxuXG5cbiAgICBidWxsZXRJbnN0YW5jZSA9IHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpXG4gICAgaWYgKCFidWxsZXRJbnN0YW5jZSkgcmV0dXJuXG4gICAgYnVsbGV0SW5zdGFuY2UuZmlyZSh4LCB5LCAwLCB0aGlzLmJ1bGxldFNwZWVkLCAwLCAwLCBzb2NrZXQsIHJvb21JZClcblxuXG5cblxuICAgIHRoaXMuc2V0QWxsKCd0cmFja2luZycsIHRydWUpXG5cbiAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5nYW1lLnRpbWUudGltZSArIHRoaXMuZmlyZVJhdGVcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTcGFzMTJcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgQnVsbGV0ID0gcmVxdWlyZSgnLi4vQnVsbGV0JylcbmxldCBHdWlkID0gcmVxdWlyZSgnLi4vR3VpZCcpXG5cbmxldCBBSzQ3ID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGNvbmZpZy5nYW1lLCBjb25maWcuZ2FtZS53b3JsZCwgJ0FLLTQ3JywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG5cbiAgICAvL1x0SGVyZSB3ZSBzZXQtdXAgb3VyIGF1ZGlvIHNwcml0ZVxuICAgIHRoaXMuZnggPSBjb25maWcuZ2FtZS5hZGQuYXVkaW8oJ0FLNDctc291bmQnKVxuICAgIHRoaXMuYWxsb3dNdWx0aXBsZSA9IHRydWVcblxuICAgIHRoaXMuZGFtYWdlID0gMjJcbiAgICB0aGlzLm5leHRGaXJlID0gMFxuICAgIHRoaXMuYnVsbGV0U3BlZWQgPSAyMzAwXG4gICAgdGhpcy5maXJlUmF0ZSA9IDE2MDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNjQ7IGkrKylcbiAgICB7XG4gICAgICAgIGxldCBidWxsZXQgPSBuZXcgQnVsbGV0KGNvbmZpZy5nYW1lLCAnYnVsbGV0MTInLCBjb25maWcuc29ja2V0KVxuICAgICAgICBidWxsZXQuYnVsbGV0SWQgPSBHdWlkKClcbiAgICAgICAgYnVsbGV0LmhlaWdodCA9IDJcbiAgICAgICAgYnVsbGV0LndpZHRoID0gNDBcbiAgICAgICAgYnVsbGV0LmRhbWFnZSA9IDIyXG4gICAgICAgIHRoaXMuYWRkKGJ1bGxldCwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbn1cblxuQUs0Ny5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuQUs0Ny5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBBSzQ3O1xuXG5BSzQ3LnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24ocGxheWVyLCBzb2NrZXQsIHJvb21JZCwgdm9sdW1lKSB7XG4gICAgaWYgKHRoaXMuZ2FtZS50aW1lLnRpbWUgPCB0aGlzLm5leHRGaXJlKVxuICAgICAgICByZXR1cm5cblxuICAgIHZhciB4ID0gcGxheWVyLnggKyAxNTtcbiAgICB2YXIgeSA9IHBsYXllci55ICsgMzA7XG5cbiAgICB0aGlzLmdldEZpcnN0RXhpc3RzKGZhbHNlKS5maXJlKHgsIHksIDAsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDAsIHNvY2tldCwgcm9vbUlkKVxuICAgIHRoaXMuc2V0QWxsKCd0cmFja2luZycsIHRydWUpXG5cbiAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5nYW1lLnRpbWUudGltZSArIHRoaXMuZmlyZVJhdGVcbiAgICBjb25zb2xlLmxvZyh2b2x1bWUpXG4gICAgY29uc29sZS5sb2coLjMgKiB2b2x1bWUpXG4gICAgdGhpcy5meC52b2x1bWUgPSAuMyAqIHZvbHVtZVxuICAgIHRoaXMuZngucGxheSgpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQUs0N1xuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBCdWxsZXQgPSByZXF1aXJlKCcuLi9CdWxsZXQnKVxubGV0IEd1aWQgPSByZXF1aXJlKCcuLi9HdWlkJylcblxubGV0IEFLNDcgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgY29uZmlnLmdhbWUsIGNvbmZpZy5nYW1lLndvcmxkLCAnQUstNDcnLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcblxuICAgIC8vXHRIZXJlIHdlIHNldC11cCBvdXIgYXVkaW8gc3ByaXRlXG4gICAgdGhpcy5meCA9IGNvbmZpZy5nYW1lLmFkZC5hdWRpbygnQUs0Ny1zb3VuZCcpXG4gICAgdGhpcy5hbGxvd011bHRpcGxlID0gdHJ1ZVxuXG4gICAgdGhpcy5kYW1hZ2UgPSAyMlxuICAgIHRoaXMubmV4dEZpcmUgPSAwXG4gICAgdGhpcy5idWxsZXRTcGVlZCA9IDIzMDBcbiAgICB0aGlzLmZpcmVSYXRlID0gMTYwO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA2NDsgaSsrKVxuICAgIHtcbiAgICAgICAgbGV0IGJ1bGxldCA9IG5ldyBCdWxsZXQoY29uZmlnLmdhbWUsICdidWxsZXQxMicsIGNvbmZpZy5zb2NrZXQpXG4gICAgICAgIGJ1bGxldC5idWxsZXRJZCA9IEd1aWQoKVxuICAgICAgICBidWxsZXQuaGVpZ2h0ID0gMlxuICAgICAgICBidWxsZXQud2lkdGggPSA0MFxuICAgICAgICBidWxsZXQuZGFtYWdlID0gMjJcbiAgICAgICAgdGhpcy5hZGQoYnVsbGV0LCB0cnVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xufVxuXG5BSzQ3LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLkdyb3VwLnByb3RvdHlwZSk7XG5BSzQ3LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEFLNDc7XG5cbkFLNDcucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbihwbGF5ZXIsIHNvY2tldCwgcm9vbUlkLCB2b2x1bWUpIHtcbiAgICBpZiAodGhpcy5nYW1lLnRpbWUudGltZSA8IHRoaXMubmV4dEZpcmUpXG4gICAgICAgIHJldHVyblxuXG4gICAgdmFyIHggPSBwbGF5ZXIueCArIDE1O1xuICAgIHZhciB5ID0gcGxheWVyLnkgKyAzMDtcblxuICAgIHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgMCwgc29ja2V0LCByb29tSWQpXG4gICAgdGhpcy5zZXRBbGwoJ3RyYWNraW5nJywgdHJ1ZSlcblxuICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLmdhbWUudGltZS50aW1lICsgdGhpcy5maXJlUmF0ZVxuICAgIHRoaXMuZngudm9sdW1lID0gLjMgKiB2b2x1bWVcbiAgICB0aGlzLmZ4LnBsYXkoKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFLNDdcblxuXG4vL1xuLy8gLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gLy8gIFJQRyB0aGF0IHZpc3VhbGx5IHRyYWNrIHRoZSBkaXJlY3Rpb24gdGhleSdyZSBoZWFkaW5nIGluIC8vXG4vLyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vL1xuLy8gV2VhcG9uLlJQRyA9IGZ1bmN0aW9uIChnYW1lKSB7XG4vL1xuLy8gICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGdhbWUsIGdhbWUud29ybGQsICdSUEcnLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcbi8vXG4vLyAgICAgdGhpcy5uZXh0RmlyZSA9IDA7XG4vLyAgICAgdGhpcy5idWxsZXRTcGVlZCA9IDQwMDtcbi8vICAgICB0aGlzLmZpcmVSYXRlID0gMjUwO1xuLy9cbi8vICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDMyOyBpKyspXG4vLyAgICAge1xuLy8gICAgICAgICB0aGlzLmFkZChuZXcgQnVsbGV0KGdhbWUsICdidWxsZXQxMCcpLCB0cnVlKTtcbi8vICAgICB9XG4vL1xuLy8gICAgIHRoaXMuc2V0QWxsKCd0cmFja2luZycsIHRydWUpXG4vL1xuLy8gICAgIHJldHVybiB0aGlzO1xuLy9cbi8vIH07XG4vL1xuLy8gV2VhcG9uLlJQRy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuLy8gV2VhcG9uLlJQRy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBXZWFwb24uUlBHO1xuLy9cbi8vIFdlYXBvbi5SUEcucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbiAoc291cmNlKSB7XG4vL1xuLy8gICAgIGlmICh0aGlzLmdhbWUudGltZS50aW1lIDwgdGhpcy5uZXh0RmlyZSkgeyByZXR1cm47IH1cbi8vXG4vLyAgICAgdmFyIHggPSBzb3VyY2UueCArIDEwO1xuLy8gICAgIHZhciB5ID0gc291cmNlLnkgKyAxMDtcbi8vXG4vLyAgICAgdGhpcy5nZXRGaXJzdEV4aXN0cyhmYWxzZSkuZmlyZSh4LCB5LCAwLCB0aGlzLmJ1bGxldFNwZWVkLCAwLCAtNzAwKTtcbi8vICAgICB0aGlzLmdldEZpcnN0RXhpc3RzKGZhbHNlKS5maXJlKHgsIHksIDAsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDcwMCk7XG4vL1xuLy8gICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLmdhbWUudGltZS50aW1lICsgdGhpcy5maXJlUmF0ZTtcbi8vXG4vLyB9O1xuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBCdWxsZXQgPSByZXF1aXJlKCcuLi9CdWxsZXQnKVxubGV0IEd1aWQgPSByZXF1aXJlKCcuLi9HdWlkJylcblxubGV0IEFLNDcgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgY29uZmlnLmdhbWUsIGNvbmZpZy5nYW1lLndvcmxkLCAnQUstNDcnLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcblxuICAgIC8vXHRIZXJlIHdlIHNldC11cCBvdXIgYXVkaW8gc3ByaXRlXG4gICAgdGhpcy5meCA9IGNvbmZpZy5nYW1lLmFkZC5hdWRpbygnQUs0Ny1zb3VuZCcpXG4gICAgdGhpcy5hbGxvd011bHRpcGxlID0gdHJ1ZVxuXG4gICAgdGhpcy5kYW1hZ2UgPSAyMlxuICAgIHRoaXMubmV4dEZpcmUgPSAwXG4gICAgdGhpcy5idWxsZXRTcGVlZCA9IDIzMDBcbiAgICB0aGlzLmZpcmVSYXRlID0gMTYwO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA2NDsgaSsrKVxuICAgIHtcbiAgICAgICAgbGV0IGJ1bGxldCA9IG5ldyBCdWxsZXQoY29uZmlnLmdhbWUsICdidWxsZXQxMicsIGNvbmZpZy5zb2NrZXQpXG4gICAgICAgIGJ1bGxldC5idWxsZXRJZCA9IEd1aWQoKVxuICAgICAgICBidWxsZXQuaGVpZ2h0ID0gMlxuICAgICAgICBidWxsZXQud2lkdGggPSA0MFxuICAgICAgICBidWxsZXQuZGFtYWdlID0gMjJcbiAgICAgICAgdGhpcy5hZGQoYnVsbGV0LCB0cnVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xufVxuXG5BSzQ3LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLkdyb3VwLnByb3RvdHlwZSk7XG5BSzQ3LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEFLNDc7XG5cbkFLNDcucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbihwbGF5ZXIsIHNvY2tldCwgcm9vbUlkLCB2b2x1bWUpIHtcbiAgICBpZiAodGhpcy5nYW1lLnRpbWUudGltZSA8IHRoaXMubmV4dEZpcmUpXG4gICAgICAgIHJldHVyblxuXG4gICAgdmFyIHggPSBwbGF5ZXIueCArIDE1O1xuICAgIHZhciB5ID0gcGxheWVyLnkgKyAzMDtcblxuICAgIHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgMCwgc29ja2V0LCByb29tSWQpXG4gICAgdGhpcy5zZXRBbGwoJ3RyYWNraW5nJywgdHJ1ZSlcblxuICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLmdhbWUudGltZS50aW1lICsgdGhpcy5maXJlUmF0ZVxuICAgIHRoaXMuZngudm9sdW1lID0gLjMgKiB2b2x1bWVcbiAgICB0aGlzLmZ4LnBsYXkoKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFLNDdcbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBcIkFLNDdcIjogcmVxdWlyZSgnLi9BSzQ3JyksXG4gICAgXCJCYXJyZXR0XCI6IHJlcXVpcmUoJy4vQmFycmV0dCcpLFxuICAgIFwiRGVzZXJ0RWFnbGVcIjogcmVxdWlyZSgnLi9EZXNlcnRFYWdsZScpLFxuICAgIFwiTTRBMVwiOiByZXF1aXJlKCcuL000QTEnKSxcbiAgICBcIk01MDBcIjogcmVxdWlyZSgnLi9NNTAwJyksXG4gICAgXCJTa29ycGlvblwiOiByZXF1aXJlKCcuL1Nrb3JwaW9uJyksXG4gICAgXCJBdWdcIjogcmVxdWlyZSgnLi9BdWcnKSxcbiAgICBcIlJQR1wiOiByZXF1aXJlKCcuL1JQRycpLFxuICAgIFwiUDkwXCI6IHJlcXVpcmUoJy4vUDkwJyksXG4gICAgXCJHNDNcIjogcmVxdWlyZSgnLi9HNDMnKVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBIaWdoUnVsZURlc2VydCA9IHt9XG5cbkhpZ2hSdWxlRGVzZXJ0LmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc3Bhd25Qb2ludHMgPSBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIHg6IDQ0MDAsXG4gICAgICAgICAgICB5OiB0aGlzLndvcmxkLmhlaWdodCAtIDI0MDBcbiAgICAgICAgfSxcbiAgICAgICAgLy8ge1xuICAgICAgICAvLyAgICAgeDogMjAwLFxuICAgICAgICAvLyAgICAgeTogdGhpcy53b3JsZC5oZWlnaHQgLSAyMDBcbiAgICAgICAgLy8gfSxcbiAgICAgICAgLy8ge1xuICAgICAgICAvLyAgICAgeDogMzc1MCxcbiAgICAgICAgLy8gICAgIHk6IHRoaXMud29ybGQuaGVpZ2h0IC0gMjAwXG4gICAgICAgIC8vIH0sXG4gICAgICAgIC8vIHtcbiAgICAgICAgLy8gICAgIHg6IDM0NTAsXG4gICAgICAgIC8vICAgICB5OiB0aGlzLndvcmxkLmhlaWdodCAtIDcwMFxuICAgICAgICAvLyB9LFxuICAgICAgICAvLyB7XG4gICAgICAgIC8vICAgICB4OiAyNjAwLFxuICAgICAgICAvLyAgICAgeTogdGhpcy53b3JsZC5oZWlnaHQgLSA4MDBcbiAgICAgICAgLy8gfSxcbiAgICAgICAgLy8ge1xuICAgICAgICAvLyAgICAgeDogMTI1MCxcbiAgICAgICAgLy8gICAgIHk6IHRoaXMud29ybGQuaGVpZ2h0IC0gODAwXG4gICAgICAgIC8vIH1cbiAgICBdXG5cbiAgICBIaWdoUnVsZURlc2VydC5jcmVhdGVTa3lTcHJpdGUuY2FsbCh0aGlzKVxuICAgIEhpZ2hSdWxlRGVzZXJ0LmNyZWF0ZVBsYXRmb3Jtcy5jYWxsKHRoaXMpXG4gICAgSGlnaFJ1bGVEZXNlcnQuY3JlYXRlTGVkZ2VzLmNhbGwodGhpcylcblxuICAgIHRoaXMucGxhdGZvcm1zLnNldEFsbCgnYm9keS5pbW1vdmFibGUnLCB0cnVlKVxuICAgIHRoaXMucGxhdGZvcm1zLnNldEFsbCgnYm9keS5hbGxvd0dyYXZpdHknLCBmYWxzZSlcbn1cblxuSGlnaFJ1bGVEZXNlcnQuY3JlYXRlU2t5U3ByaXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5za3lzcHJpdGUgPSB0aGlzLmFkZC50aWxlU3ByaXRlKDAsIHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSAzOTMwLCB0aGlzLmdhbWUud29ybGQud2lkdGgsIHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQsICdtYXAtYmcnKVxufVxuXG5IaWdoUnVsZURlc2VydC5jcmVhdGVQbGF0Zm9ybXMgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnBsYXRmb3JtcyA9IHRoaXMuYWRkLmdyb3VwKClcbiAgICB0aGlzLnBsYXRmb3Jtcy5lbmFibGVCb2R5ID0gdHJ1ZVxufVxuXG5IaWdoUnVsZURlc2VydC5nZXRSYW5kb21TcGF3blBvaW50ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIF8uc2FtcGxlKHRoaXMuc3Bhd25Qb2ludHMpXG59XG5cbkhpZ2hSdWxlRGVzZXJ0LmNyZWF0ZUxlZGdlcyA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBsZWRnZXMgPSBbXG4gICAgICAgIHsgaWQ6IDEsIHg6IDAsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSA0MzEsIHdpZHRoOiAxMjgsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogMiwgeDogMCwgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDgzOCwgd2lkdGg6IDEyOCwgaGVpZ2h0OiA5MiB9LFxuICAgICAgICB7IGlkOiAzLCB4OiAzODcyLCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gNDI3LCB3aWR0aDogMTI4LCBoZWlnaHQ6IDkyIH0sXG4gICAgICAgIHsgaWQ6IDQsIHg6IDM4NzIsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSA4MzUsIHdpZHRoOiAxMjgsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogNSwgeDogNDIyLCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gMjEwNSwgd2lkdGg6IDExNTAsIGhlaWdodDogMzAwIH0sXG4gICAgICAgIHsgaWQ6IDYsIHg6IDE1NTUsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSAyMTgwLCB3aWR0aDogMjcwLCBoZWlnaHQ6IDYwMCB9LFxuICAgICAgICB7IGlkOiA3LCB4OiAxODIwLCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gMjE4MCwgd2lkdGg6IDQ3MCwgaGVpZ2h0OiA2IH0sXG4gICAgICAgIHsgaWQ6IDgsIHg6IDIyNzUsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSAyMTgwLCB3aWR0aDogMzIwLCBoZWlnaHQ6IDI2MCB9LFxuICAgICAgICB7IGlkOiA5LCB4OiAyNTk1LCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gMjI2MCwgd2lkdGg6IDExMjAsIGhlaWdodDogMjYwIH0sXG4gICAgICAgIHsgaWQ6IDEwLCB4OiA0Mjk5LCB5OiAxNjU4LCB3aWR0aDogMzc1LCBoZWlnaHQ6IDEzMDAgfSxcblxuICAgICAgICB7IGlkOiAxMSwgeDogMTExMCwgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDcwMSwgd2lkdGg6IDUxMywgaGVpZ2h0OiA5MiB9LFxuICAgICAgICB7IGlkOiAxMiwgeDogODcwLCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gOTgyLCB3aWR0aDogMjU2LCBoZWlnaHQ6IDkyIH0sXG4gICAgICAgIHsgaWQ6IDEzLCB4OiAxNzQ0LCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gMTQ3NCwgd2lkdGg6IDUwNywgaGVpZ2h0OiAyNTQgfSxcbiAgICAgICAgeyBpZDogMTQsIHg6IDIzOTAsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSA2ODksIHdpZHRoOiA1MTMsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogMTUsIHg6IDMwMzEsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSA2MDgsIHdpZHRoOiA2NDEsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogMTYsIHg6IDI5MDMsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSA5NTcsIHdpZHRoOiAyNTYsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogMTcsIHg6IDcxNywgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDY4NSwgd2lkdGg6IDE1NCwgaGVpZ2h0OiA3NyB9LFxuICAgICAgICB7IGlkOiAxOCwgeDogNzU3LCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gNzYyLCB3aWR0aDogNzcsIGhlaWdodDogNzcgfSxcbiAgICAgICAgeyBpZDogMTksIHg6IDE0MTgsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSA3NzgsIHdpZHRoOiA3NywgaGVpZ2h0OiA3NyB9LFxuICAgICAgICB7IGlkOiAyMCwgeDogMTkzMSwgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDQ2MSwgd2lkdGg6IDE1NCwgaGVpZ2h0OiA3NyB9LFxuICAgICAgICB7IGlkOiAyMSwgeDogMzIwNSwgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDY4NSwgd2lkdGg6IDE1NCwgaGVpZ2h0OiA3NyB9LFxuICAgICAgICB7IGlkOiAyMiwgeDogMzI0NSwgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDc2Miwgd2lkdGg6IDc3LCBoZWlnaHQ6IDc3IH1cbiAgICBdXG5cbiAgICBsZWRnZXMuZm9yRWFjaCgobGVkZ2UpID0+IHtcbiAgICAgICAgdmFyIG5ld0xlZGdlID0gdGhpcy5wbGF0Zm9ybXMuY3JlYXRlKGxlZGdlLngsIGxlZGdlLnksICdncm91bmQnKVxuICAgICAgICAvLyB2YXIgbmV3TGVkZ2UgPSB0aGlzLnBsYXRmb3Jtcy5jcmVhdGUobGVkZ2UueCwgbGVkZ2UueSlcbiAgICAgICAgbmV3TGVkZ2UuaGVpZ2h0ID0gbGVkZ2UuaGVpZ2h0XG4gICAgICAgIG5ld0xlZGdlLndpZHRoID0gbGVkZ2Uud2lkdGhcblxuICAgICAgICAvLyBEZWJ1ZyBzdHVmZlxuICAgICAgICBuZXdMZWRnZS5hbHBoYSA9IDAuMlxuICAgICAgICBsZXQgc3R5bGUgPSB7IGZvbnQ6IFwiMjBweCBBcmlhbFwiLCBmaWxsOiBcIiNmZjAwNDRcIiwgYWxpZ246IFwiY2VudGVyXCIsIGJhY2tncm91bmRDb2xvcjogXCIjZmZmZjAwXCIgfVxuICAgICAgICBsZXQgdGV4dCA9IHRoaXMuZ2FtZS5hZGQudGV4dChsZWRnZS54LCBsZWRnZS55LCBsZWRnZS5pZCwgc3R5bGUpXG4gICAgICAgIHRleHQuYWxwaGEgPSAwLjJcbiAgICB9KVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEhpZ2hSdWxlRGVzZXJ0XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBhc3NpZ24gICAgICAgID0gcmVxdWlyZSgnZXM1LWV4dC9vYmplY3QvYXNzaWduJylcbiAgLCBub3JtYWxpemVPcHRzID0gcmVxdWlyZSgnZXM1LWV4dC9vYmplY3Qvbm9ybWFsaXplLW9wdGlvbnMnKVxuICAsIGlzQ2FsbGFibGUgICAgPSByZXF1aXJlKCdlczUtZXh0L29iamVjdC9pcy1jYWxsYWJsZScpXG4gICwgY29udGFpbnMgICAgICA9IHJlcXVpcmUoJ2VzNS1leHQvc3RyaW5nLyMvY29udGFpbnMnKVxuXG4gICwgZDtcblxuZCA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGRzY3IsIHZhbHVlLyosIG9wdGlvbnMqLykge1xuXHR2YXIgYywgZSwgdywgb3B0aW9ucywgZGVzYztcblx0aWYgKChhcmd1bWVudHMubGVuZ3RoIDwgMikgfHwgKHR5cGVvZiBkc2NyICE9PSAnc3RyaW5nJykpIHtcblx0XHRvcHRpb25zID0gdmFsdWU7XG5cdFx0dmFsdWUgPSBkc2NyO1xuXHRcdGRzY3IgPSBudWxsO1xuXHR9IGVsc2Uge1xuXHRcdG9wdGlvbnMgPSBhcmd1bWVudHNbMl07XG5cdH1cblx0aWYgKGRzY3IgPT0gbnVsbCkge1xuXHRcdGMgPSB3ID0gdHJ1ZTtcblx0XHRlID0gZmFsc2U7XG5cdH0gZWxzZSB7XG5cdFx0YyA9IGNvbnRhaW5zLmNhbGwoZHNjciwgJ2MnKTtcblx0XHRlID0gY29udGFpbnMuY2FsbChkc2NyLCAnZScpO1xuXHRcdHcgPSBjb250YWlucy5jYWxsKGRzY3IsICd3Jyk7XG5cdH1cblxuXHRkZXNjID0geyB2YWx1ZTogdmFsdWUsIGNvbmZpZ3VyYWJsZTogYywgZW51bWVyYWJsZTogZSwgd3JpdGFibGU6IHcgfTtcblx0cmV0dXJuICFvcHRpb25zID8gZGVzYyA6IGFzc2lnbihub3JtYWxpemVPcHRzKG9wdGlvbnMpLCBkZXNjKTtcbn07XG5cbmQuZ3MgPSBmdW5jdGlvbiAoZHNjciwgZ2V0LCBzZXQvKiwgb3B0aW9ucyovKSB7XG5cdHZhciBjLCBlLCBvcHRpb25zLCBkZXNjO1xuXHRpZiAodHlwZW9mIGRzY3IgIT09ICdzdHJpbmcnKSB7XG5cdFx0b3B0aW9ucyA9IHNldDtcblx0XHRzZXQgPSBnZXQ7XG5cdFx0Z2V0ID0gZHNjcjtcblx0XHRkc2NyID0gbnVsbDtcblx0fSBlbHNlIHtcblx0XHRvcHRpb25zID0gYXJndW1lbnRzWzNdO1xuXHR9XG5cdGlmIChnZXQgPT0gbnVsbCkge1xuXHRcdGdldCA9IHVuZGVmaW5lZDtcblx0fSBlbHNlIGlmICghaXNDYWxsYWJsZShnZXQpKSB7XG5cdFx0b3B0aW9ucyA9IGdldDtcblx0XHRnZXQgPSBzZXQgPSB1bmRlZmluZWQ7XG5cdH0gZWxzZSBpZiAoc2V0ID09IG51bGwpIHtcblx0XHRzZXQgPSB1bmRlZmluZWQ7XG5cdH0gZWxzZSBpZiAoIWlzQ2FsbGFibGUoc2V0KSkge1xuXHRcdG9wdGlvbnMgPSBzZXQ7XG5cdFx0c2V0ID0gdW5kZWZpbmVkO1xuXHR9XG5cdGlmIChkc2NyID09IG51bGwpIHtcblx0XHRjID0gdHJ1ZTtcblx0XHRlID0gZmFsc2U7XG5cdH0gZWxzZSB7XG5cdFx0YyA9IGNvbnRhaW5zLmNhbGwoZHNjciwgJ2MnKTtcblx0XHRlID0gY29udGFpbnMuY2FsbChkc2NyLCAnZScpO1xuXHR9XG5cblx0ZGVzYyA9IHsgZ2V0OiBnZXQsIHNldDogc2V0LCBjb25maWd1cmFibGU6IGMsIGVudW1lcmFibGU6IGUgfTtcblx0cmV0dXJuICFvcHRpb25zID8gZGVzYyA6IGFzc2lnbihub3JtYWxpemVPcHRzKG9wdGlvbnMpLCBkZXNjKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9pcy1pbXBsZW1lbnRlZCcpKClcblx0PyBPYmplY3QuYXNzaWduXG5cdDogcmVxdWlyZSgnLi9zaGltJyk7XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuXHR2YXIgYXNzaWduID0gT2JqZWN0LmFzc2lnbiwgb2JqO1xuXHRpZiAodHlwZW9mIGFzc2lnbiAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuIGZhbHNlO1xuXHRvYmogPSB7IGZvbzogJ3JheicgfTtcblx0YXNzaWduKG9iaiwgeyBiYXI6ICdkd2EnIH0sIHsgdHJ6eTogJ3RyenknIH0pO1xuXHRyZXR1cm4gKG9iai5mb28gKyBvYmouYmFyICsgb2JqLnRyenkpID09PSAncmF6ZHdhdHJ6eSc7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIga2V5cyAgPSByZXF1aXJlKCcuLi9rZXlzJylcbiAgLCB2YWx1ZSA9IHJlcXVpcmUoJy4uL3ZhbGlkLXZhbHVlJylcblxuICAsIG1heCA9IE1hdGgubWF4O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChkZXN0LCBzcmMvKiwg4oCmc3JjbiovKSB7XG5cdHZhciBlcnJvciwgaSwgbCA9IG1heChhcmd1bWVudHMubGVuZ3RoLCAyKSwgYXNzaWduO1xuXHRkZXN0ID0gT2JqZWN0KHZhbHVlKGRlc3QpKTtcblx0YXNzaWduID0gZnVuY3Rpb24gKGtleSkge1xuXHRcdHRyeSB7IGRlc3Rba2V5XSA9IHNyY1trZXldOyB9IGNhdGNoIChlKSB7XG5cdFx0XHRpZiAoIWVycm9yKSBlcnJvciA9IGU7XG5cdFx0fVxuXHR9O1xuXHRmb3IgKGkgPSAxOyBpIDwgbDsgKytpKSB7XG5cdFx0c3JjID0gYXJndW1lbnRzW2ldO1xuXHRcdGtleXMoc3JjKS5mb3JFYWNoKGFzc2lnbik7XG5cdH1cblx0aWYgKGVycm9yICE9PSB1bmRlZmluZWQpIHRocm93IGVycm9yO1xuXHRyZXR1cm4gZGVzdDtcbn07XG4iLCIvLyBEZXByZWNhdGVkXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqID09PSAnZnVuY3Rpb24nOyB9O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vaXMtaW1wbGVtZW50ZWQnKSgpXG5cdD8gT2JqZWN0LmtleXNcblx0OiByZXF1aXJlKCcuL3NoaW0nKTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG5cdHRyeSB7XG5cdFx0T2JqZWN0LmtleXMoJ3ByaW1pdGl2ZScpO1xuXHRcdHJldHVybiB0cnVlO1xuXHR9IGNhdGNoIChlKSB7IHJldHVybiBmYWxzZTsgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGtleXMgPSBPYmplY3Qua2V5cztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob2JqZWN0KSB7XG5cdHJldHVybiBrZXlzKG9iamVjdCA9PSBudWxsID8gb2JqZWN0IDogT2JqZWN0KG9iamVjdCkpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGZvckVhY2ggPSBBcnJheS5wcm90b3R5cGUuZm9yRWFjaCwgY3JlYXRlID0gT2JqZWN0LmNyZWF0ZTtcblxudmFyIHByb2Nlc3MgPSBmdW5jdGlvbiAoc3JjLCBvYmopIHtcblx0dmFyIGtleTtcblx0Zm9yIChrZXkgaW4gc3JjKSBvYmpba2V5XSA9IHNyY1trZXldO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob3B0aW9ucy8qLCDigKZvcHRpb25zKi8pIHtcblx0dmFyIHJlc3VsdCA9IGNyZWF0ZShudWxsKTtcblx0Zm9yRWFjaC5jYWxsKGFyZ3VtZW50cywgZnVuY3Rpb24gKG9wdGlvbnMpIHtcblx0XHRpZiAob3B0aW9ucyA9PSBudWxsKSByZXR1cm47XG5cdFx0cHJvY2VzcyhPYmplY3Qob3B0aW9ucyksIHJlc3VsdCk7XG5cdH0pO1xuXHRyZXR1cm4gcmVzdWx0O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZm4pIHtcblx0aWYgKHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykgdGhyb3cgbmV3IFR5cGVFcnJvcihmbiArIFwiIGlzIG5vdCBhIGZ1bmN0aW9uXCIpO1xuXHRyZXR1cm4gZm47XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuXHRpZiAodmFsdWUgPT0gbnVsbCkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCB1c2UgbnVsbCBvciB1bmRlZmluZWRcIik7XG5cdHJldHVybiB2YWx1ZTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9pcy1pbXBsZW1lbnRlZCcpKClcblx0PyBTdHJpbmcucHJvdG90eXBlLmNvbnRhaW5zXG5cdDogcmVxdWlyZSgnLi9zaGltJyk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBzdHIgPSAncmF6ZHdhdHJ6eSc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuXHRpZiAodHlwZW9mIHN0ci5jb250YWlucyAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuIGZhbHNlO1xuXHRyZXR1cm4gKChzdHIuY29udGFpbnMoJ2R3YScpID09PSB0cnVlKSAmJiAoc3RyLmNvbnRhaW5zKCdmb28nKSA9PT0gZmFsc2UpKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBpbmRleE9mID0gU3RyaW5nLnByb3RvdHlwZS5pbmRleE9mO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChzZWFyY2hTdHJpbmcvKiwgcG9zaXRpb24qLykge1xuXHRyZXR1cm4gaW5kZXhPZi5jYWxsKHRoaXMsIHNlYXJjaFN0cmluZywgYXJndW1lbnRzWzFdKSA+IC0xO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGQgICAgICAgID0gcmVxdWlyZSgnZCcpXG4gICwgY2FsbGFibGUgPSByZXF1aXJlKCdlczUtZXh0L29iamVjdC92YWxpZC1jYWxsYWJsZScpXG5cbiAgLCBhcHBseSA9IEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseSwgY2FsbCA9IEZ1bmN0aW9uLnByb3RvdHlwZS5jYWxsXG4gICwgY3JlYXRlID0gT2JqZWN0LmNyZWF0ZSwgZGVmaW5lUHJvcGVydHkgPSBPYmplY3QuZGVmaW5lUHJvcGVydHlcbiAgLCBkZWZpbmVQcm9wZXJ0aWVzID0gT2JqZWN0LmRlZmluZVByb3BlcnRpZXNcbiAgLCBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHlcbiAgLCBkZXNjcmlwdG9yID0geyBjb25maWd1cmFibGU6IHRydWUsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSB9XG5cbiAgLCBvbiwgb25jZSwgb2ZmLCBlbWl0LCBtZXRob2RzLCBkZXNjcmlwdG9ycywgYmFzZTtcblxub24gPSBmdW5jdGlvbiAodHlwZSwgbGlzdGVuZXIpIHtcblx0dmFyIGRhdGE7XG5cblx0Y2FsbGFibGUobGlzdGVuZXIpO1xuXG5cdGlmICghaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLCAnX19lZV9fJykpIHtcblx0XHRkYXRhID0gZGVzY3JpcHRvci52YWx1ZSA9IGNyZWF0ZShudWxsKTtcblx0XHRkZWZpbmVQcm9wZXJ0eSh0aGlzLCAnX19lZV9fJywgZGVzY3JpcHRvcik7XG5cdFx0ZGVzY3JpcHRvci52YWx1ZSA9IG51bGw7XG5cdH0gZWxzZSB7XG5cdFx0ZGF0YSA9IHRoaXMuX19lZV9fO1xuXHR9XG5cdGlmICghZGF0YVt0eXBlXSkgZGF0YVt0eXBlXSA9IGxpc3RlbmVyO1xuXHRlbHNlIGlmICh0eXBlb2YgZGF0YVt0eXBlXSA9PT0gJ29iamVjdCcpIGRhdGFbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG5cdGVsc2UgZGF0YVt0eXBlXSA9IFtkYXRhW3R5cGVdLCBsaXN0ZW5lcl07XG5cblx0cmV0dXJuIHRoaXM7XG59O1xuXG5vbmNlID0gZnVuY3Rpb24gKHR5cGUsIGxpc3RlbmVyKSB7XG5cdHZhciBvbmNlLCBzZWxmO1xuXG5cdGNhbGxhYmxlKGxpc3RlbmVyKTtcblx0c2VsZiA9IHRoaXM7XG5cdG9uLmNhbGwodGhpcywgdHlwZSwgb25jZSA9IGZ1bmN0aW9uICgpIHtcblx0XHRvZmYuY2FsbChzZWxmLCB0eXBlLCBvbmNlKTtcblx0XHRhcHBseS5jYWxsKGxpc3RlbmVyLCB0aGlzLCBhcmd1bWVudHMpO1xuXHR9KTtcblxuXHRvbmNlLl9fZWVPbmNlTGlzdGVuZXJfXyA9IGxpc3RlbmVyO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbm9mZiA9IGZ1bmN0aW9uICh0eXBlLCBsaXN0ZW5lcikge1xuXHR2YXIgZGF0YSwgbGlzdGVuZXJzLCBjYW5kaWRhdGUsIGk7XG5cblx0Y2FsbGFibGUobGlzdGVuZXIpO1xuXG5cdGlmICghaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLCAnX19lZV9fJykpIHJldHVybiB0aGlzO1xuXHRkYXRhID0gdGhpcy5fX2VlX187XG5cdGlmICghZGF0YVt0eXBlXSkgcmV0dXJuIHRoaXM7XG5cdGxpc3RlbmVycyA9IGRhdGFbdHlwZV07XG5cblx0aWYgKHR5cGVvZiBsaXN0ZW5lcnMgPT09ICdvYmplY3QnKSB7XG5cdFx0Zm9yIChpID0gMDsgKGNhbmRpZGF0ZSA9IGxpc3RlbmVyc1tpXSk7ICsraSkge1xuXHRcdFx0aWYgKChjYW5kaWRhdGUgPT09IGxpc3RlbmVyKSB8fFxuXHRcdFx0XHRcdChjYW5kaWRhdGUuX19lZU9uY2VMaXN0ZW5lcl9fID09PSBsaXN0ZW5lcikpIHtcblx0XHRcdFx0aWYgKGxpc3RlbmVycy5sZW5ndGggPT09IDIpIGRhdGFbdHlwZV0gPSBsaXN0ZW5lcnNbaSA/IDAgOiAxXTtcblx0XHRcdFx0ZWxzZSBsaXN0ZW5lcnMuc3BsaWNlKGksIDEpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRpZiAoKGxpc3RlbmVycyA9PT0gbGlzdGVuZXIpIHx8XG5cdFx0XHRcdChsaXN0ZW5lcnMuX19lZU9uY2VMaXN0ZW5lcl9fID09PSBsaXN0ZW5lcikpIHtcblx0XHRcdGRlbGV0ZSBkYXRhW3R5cGVdO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiB0aGlzO1xufTtcblxuZW1pdCA9IGZ1bmN0aW9uICh0eXBlKSB7XG5cdHZhciBpLCBsLCBsaXN0ZW5lciwgbGlzdGVuZXJzLCBhcmdzO1xuXG5cdGlmICghaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLCAnX19lZV9fJykpIHJldHVybjtcblx0bGlzdGVuZXJzID0gdGhpcy5fX2VlX19bdHlwZV07XG5cdGlmICghbGlzdGVuZXJzKSByZXR1cm47XG5cblx0aWYgKHR5cGVvZiBsaXN0ZW5lcnMgPT09ICdvYmplY3QnKSB7XG5cdFx0bCA9IGFyZ3VtZW50cy5sZW5ndGg7XG5cdFx0YXJncyA9IG5ldyBBcnJheShsIC0gMSk7XG5cdFx0Zm9yIChpID0gMTsgaSA8IGw7ICsraSkgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG5cblx0XHRsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuc2xpY2UoKTtcblx0XHRmb3IgKGkgPSAwOyAobGlzdGVuZXIgPSBsaXN0ZW5lcnNbaV0pOyArK2kpIHtcblx0XHRcdGFwcGx5LmNhbGwobGlzdGVuZXIsIHRoaXMsIGFyZ3MpO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcblx0XHRjYXNlIDE6XG5cdFx0XHRjYWxsLmNhbGwobGlzdGVuZXJzLCB0aGlzKTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgMjpcblx0XHRcdGNhbGwuY2FsbChsaXN0ZW5lcnMsIHRoaXMsIGFyZ3VtZW50c1sxXSk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIDM6XG5cdFx0XHRjYWxsLmNhbGwobGlzdGVuZXJzLCB0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG5cdFx0XHRicmVhaztcblx0XHRkZWZhdWx0OlxuXHRcdFx0bCA9IGFyZ3VtZW50cy5sZW5ndGg7XG5cdFx0XHRhcmdzID0gbmV3IEFycmF5KGwgLSAxKTtcblx0XHRcdGZvciAoaSA9IDE7IGkgPCBsOyArK2kpIHtcblx0XHRcdFx0YXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG5cdFx0XHR9XG5cdFx0XHRhcHBseS5jYWxsKGxpc3RlbmVycywgdGhpcywgYXJncyk7XG5cdFx0fVxuXHR9XG59O1xuXG5tZXRob2RzID0ge1xuXHRvbjogb24sXG5cdG9uY2U6IG9uY2UsXG5cdG9mZjogb2ZmLFxuXHRlbWl0OiBlbWl0XG59O1xuXG5kZXNjcmlwdG9ycyA9IHtcblx0b246IGQob24pLFxuXHRvbmNlOiBkKG9uY2UpLFxuXHRvZmY6IGQob2ZmKSxcblx0ZW1pdDogZChlbWl0KVxufTtcblxuYmFzZSA9IGRlZmluZVByb3BlcnRpZXMoe30sIGRlc2NyaXB0b3JzKTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gZnVuY3Rpb24gKG8pIHtcblx0cmV0dXJuIChvID09IG51bGwpID8gY3JlYXRlKGJhc2UpIDogZGVmaW5lUHJvcGVydGllcyhPYmplY3QobyksIGRlc2NyaXB0b3JzKTtcbn07XG5leHBvcnRzLm1ldGhvZHMgPSBtZXRob2RzO1xuIl19
