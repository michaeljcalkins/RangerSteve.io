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

    // this.leftArmSprite = this.game.add.sprite(500, this.world.height - 2300, 'left-arm')
    // this.leftArmSprite.anchor.set(.2, .2)
    // this.leftArmSprite.width = this.leftArmSprite.height = 19
    // this.leftArmSprite.visible = false

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

    console.log(this.rightArmGroup);

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

    this.positionText.text = this.game.input.mousePointer.x + ', ' + this.game.input.mousePointer.y;

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

    var x = player.x + 15;
    var y = player.y + 30;

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
        x: 500,
        y: this.world.height - 2300
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
    var skysprite = this.add.tileSprite(0, this.game.world.height - 3930, this.game.world.width, this.game.world.height, 'map-bg');
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

    var ledges = [
    // {x, y, width, height}

    // Starting Ledges
    { id: 1, x: 0, y: this.game.world.height - 431, width: 128, height: 92 }, // Left bottom ledge
    { id: 2, x: 0, y: this.game.world.height - 838, width: 128, height: 92 }, // Left top ledge

    { id: 3, x: 3872, y: this.game.world.height - 427, width: 128, height: 92 }, // Right bottom ledge
    { id: 4, x: 3872, y: this.game.world.height - 835, width: 128, height: 92 }, // Right top ledge

    // Ground Ledges
    { id: 5, x: 363, y: this.game.world.height - 2105, width: 1150, height: 300 }, // Main bottom starting left ledge
    { id: 6, x: 1510, y: this.game.world.height - 2185, width: 270, height: 260 }, // Main bottom left ledge
    { id: 7, x: 1510, y: this.game.world.height - 2185, width: 270, height: 260 }, // Main bottom left ledge
    { id: 8, x: 2900, y: this.game.world.height - 256, width: 641, height: 260 }, // Main bottom right ledge
    { id: 9, x: 3540, y: this.game.world.height - 128, width: 474, height: 128 }, // Main bottom starting right ledge

    // Air Ledges
    { id: 10, x: 300, y: this.game.world.height - 608, width: 641, height: 92 }, { id: 11, x: 1110, y: this.game.world.height - 701, width: 513, height: 92 }, { id: 12, x: 870, y: this.game.world.height - 982, width: 256, height: 92 }, { id: 13, x: 1744, y: this.game.world.height - 1474, width: 507, height: 254 }, { id: 14, x: 2390, y: this.game.world.height - 689, width: 513, height: 92 }, { id: 15, x: 3031, y: this.game.world.height - 608, width: 641, height: 92 }, { id: 16, x: 2903, y: this.game.world.height - 957, width: 256, height: 92 },

    // Boxes
    { id: 17, x: 717, y: this.game.world.height - 685, width: 154, height: 77 }, { id: 18, x: 757, y: this.game.world.height - 762, width: 77, height: 77 }, { id: 19, x: 1418, y: this.game.world.height - 778, width: 77, height: 77 }, { id: 20, x: 1931, y: this.game.world.height - 461, width: 154, height: 77 }, { id: 21, x: 3205, y: this.game.world.height - 685, width: 154, height: 77 }, { id: 22, x: 3245, y: this.game.world.height - 762, width: 77, height: 77 }];

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvYXBwLmpzIiwiYXNzZXRzL2pzL2NvcmUvY3JlYXRlLmpzIiwiYXNzZXRzL2pzL2NvcmUvaW5kZXguanMiLCJhc3NldHMvanMvY29yZS9pbml0LmpzIiwiYXNzZXRzL2pzL2NvcmUvcHJlbG9hZC5qcyIsImFzc2V0cy9qcy9jb3JlL3VwZGF0ZS5qcyIsImFzc2V0cy9qcy9nYW1lLmpzIiwiYXNzZXRzL2pzL2xpYi9CdWxsZXQuanMiLCJhc3NldHMvanMvbGliL0V2ZW50SGFuZGxlci5qcyIsImFzc2V0cy9qcy9saWIvR3VpZC5qcyIsImFzc2V0cy9qcy9saWIvSW5wdXRIYW5kbGVyLmpzIiwiYXNzZXRzL2pzL2xpYi9QbGF5ZXJCeUlkLmpzIiwiYXNzZXRzL2pzL2xpYi9SZW1vdGVQbGF5ZXIuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9pbmRleC5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL29uQnVsbGV0RmlyZWQuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vbkJ1bGxldFJlbW92ZWQuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vbk1vdmVQbGF5ZXIuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vblBsYXllckRhbWFnZWQuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vblBsYXllclJlc3Bhd24uanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vblJlbW92ZVBsYXllci5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL29uU29ja2V0Q29ubmVjdGVkLmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvb25Tb2NrZXREaXNjb25uZWN0LmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvb25VcGRhdGVQbGF5ZXJzLmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvc2V0RXZlbnRIYW5kbGVycy5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9BSzQ3LmpzIiwiYXNzZXRzL2pzL2xpYi9XZWFwb25zL0F1Zy5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9CYXJyZXR0LmpzIiwiYXNzZXRzL2pzL2xpYi9XZWFwb25zL0Rlc2VydEVhZ2xlLmpzIiwiYXNzZXRzL2pzL2xpYi9XZWFwb25zL0c0My5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9NNEExLmpzIiwiYXNzZXRzL2pzL2xpYi9XZWFwb25zL001MDAuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvUDkwLmpzIiwiYXNzZXRzL2pzL2xpYi9XZWFwb25zL1JQRy5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9Ta29ycGlvbi5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9pbmRleC5qcyIsImFzc2V0cy9qcy9tYXBzL0hpZ2hSdWxlRGVzZXJ0LmpzIiwibm9kZV9tb2R1bGVzL2QvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZXM1LWV4dC9vYmplY3QvYXNzaWduL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2VzNS1leHQvb2JqZWN0L2Fzc2lnbi9pcy1pbXBsZW1lbnRlZC5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L29iamVjdC9hc3NpZ24vc2hpbS5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L29iamVjdC9pcy1jYWxsYWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L29iamVjdC9rZXlzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2VzNS1leHQvb2JqZWN0L2tleXMvaXMtaW1wbGVtZW50ZWQuanMiLCJub2RlX21vZHVsZXMvZXM1LWV4dC9vYmplY3Qva2V5cy9zaGltLmpzIiwibm9kZV9tb2R1bGVzL2VzNS1leHQvb2JqZWN0L25vcm1hbGl6ZS1vcHRpb25zLmpzIiwibm9kZV9tb2R1bGVzL2VzNS1leHQvb2JqZWN0L3ZhbGlkLWNhbGxhYmxlLmpzIiwibm9kZV9tb2R1bGVzL2VzNS1leHQvb2JqZWN0L3ZhbGlkLXZhbHVlLmpzIiwibm9kZV9tb2R1bGVzL2VzNS1leHQvc3RyaW5nLyMvY29udGFpbnMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZXM1LWV4dC9zdHJpbmcvIy9jb250YWlucy9pcy1pbXBsZW1lbnRlZC5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L3N0cmluZy8jL2NvbnRhaW5zL3NoaW0uanMiLCJub2RlX21vZHVsZXMvZXZlbnQtZW1pdHRlci9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztBQ0NBLFFBQVEsUUFBUjs7O0FDREE7O0FBSUE7Ozs7OztBQUZBLElBQUksaUJBQWlCLFFBQVEsd0JBQVIsQ0FBakI7QUFDSixJQUFJLFVBQVUsUUFBUSxnQkFBUixDQUFWOzs7QUFHSixJQUFJLGFBQWEsSUFBYjtBQUNKLElBQUksY0FBYyxJQUFkOztBQUVKLE9BQU8sT0FBUCxHQUFpQixZQUFXOzs7O0FBRXhCLFNBQUssU0FBTCxHQUFpQixHQUFqQjtBQUZ3QixRQUd4QixDQUFLLFlBQUwsR0FBb0IsSUFBcEI7QUFId0IsUUFJeEIsQ0FBSyxJQUFMLEdBQVksSUFBWjtBQUp3QixRQUt4QixDQUFLLE9BQUwsR0FBZSxJQUFmO0FBTHdCLFFBTXhCLENBQUssVUFBTCxHQUFrQixDQUFDLEdBQUQ7O0FBTk0sUUFReEIsQ0FBSyxNQUFMLEdBQWMsR0FBRyxPQUFILEVBQWQsQ0FSd0I7QUFTeEIsU0FBSyxPQUFMLEdBQWUsRUFBZixDQVR3QjtBQVV4QixTQUFLLE1BQUwsR0FBYyxFQUFkOzs7QUFWd0IsUUFheEIsQ0FBSyxPQUFMLENBQWEsV0FBYixDQUF5QixPQUFPLE9BQVAsQ0FBZSxNQUFmLENBQXpCLENBYndCOztBQWV4QixTQUFLLEtBQUwsQ0FBVyxTQUFYLENBQXFCLENBQXJCLEVBQXdCLENBQXhCLEVBQTJCLFVBQTNCLEVBQXVDLFdBQXZDOzs7QUFmd0IsUUFrQnhCLENBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsU0FBaEIsR0FBNEIsT0FB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LE9BQVIsR0FBa0IsT0FBbEIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gcmVxdWlyZSgnLi91aScpXG5yZXF1aXJlKCcuL2dhbWUnKVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBIaWdoUnVsZURlc2VydCA9IHJlcXVpcmUoJy4uL21hcHMvSGlnaFJ1bGVEZXNlcnQnKVxubGV0IFdlYXBvbnMgPSByZXF1aXJlKCcuLi9saWIvV2VhcG9ucycpXG5pbXBvcnQgRXZlbnRIYW5kbGVyIGZyb20gJy4uL2xpYi9FdmVudEhhbmRsZXInXG5cbmxldCB3b3JsZFdpZHRoID0gODAwMFxubGV0IHdvcmxkSGVpZ2h0ID0gMzk2NlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIERlZmluZSBtb3ZlbWVudCBjb25zdGFudHNcbiAgICB0aGlzLk1BWF9TUEVFRCA9IDQwMCAvLyBwaXhlbHMvc2Vjb25kXG4gICAgdGhpcy5BQ0NFTEVSQVRJT04gPSAxOTYwIC8vIHBpeGVscy9zZWNvbmQvc2Vjb25kXG4gICAgdGhpcy5EUkFHID0gMTUwMCAvLyBwaXhlbHMvc2Vjb25kXG4gICAgdGhpcy5HUkFWSVRZID0gMTkwMCAvLyBwaXhlbHMvc2Vjb25kL3NlY29uZFxuICAgIHRoaXMuSlVNUF9TUEVFRCA9IC04NTAgLy8gcGl4ZWxzL3NlY29uZCAobmVnYXRpdmUgeSBpcyB1cClcblxuICAgIHRoaXMuc29ja2V0ID0gaW8uY29ubmVjdCgpXG4gICAgdGhpcy5lbmVtaWVzID0gW11cbiAgICB0aGlzLnZvbHVtZSA9IC41XG5cbiAgICAvLyAgV2UncmUgZ29pbmcgdG8gYmUgdXNpbmcgcGh5c2ljcywgc28gZW5hYmxlIHRoZSBBcmNhZGUgUGh5c2ljcyBzeXN0ZW1cbiAgICB0aGlzLnBoeXNpY3Muc3RhcnRTeXN0ZW0oUGhhc2VyLlBoeXNpY3MuQVJDQURFKVxuXG4gICAgdGhpcy53b3JsZC5zZXRCb3VuZHMoMCwgMCwgd29ybGRXaWR0aCwgd29ybGRIZWlnaHQpXG5cbiAgICAvLyBTY2FsZSBnYW1lIG9uIHdpbmRvdyByZXNpemVcbiAgICB0aGlzLmdhbWUuc2NhbGUuc2NhbGVNb2RlID0gUGhhc2VyLlNjYWxlTWFuYWdlci5SRVNJWkVcbiAgICB0aGlzLmdhbWUuc2NhbGUuc2V0U2hvd0FsbCgpXG4gICAgdGhpcy5nYW1lLnNjYWxlLnJlZnJlc2goKVxuXG5cbiAgICAvKipcbiAgICAgKiBNYXBcbiAgICAgKi9cbiAgICBIaWdoUnVsZURlc2VydC5jcmVhdGUuY2FsbCh0aGlzKVxuXG5cbiAgICAvKipcbiAgICAgKiBQbGF5ZXIgU2V0dGluZ3NcbiAgICAgKi9cbiAgICBsZXQgc3Bhd25Qb2ludCA9IEhpZ2hSdWxlRGVzZXJ0LmdldFJhbmRvbVNwYXduUG9pbnQuY2FsbCh0aGlzKVxuICAgIHRoaXMucGxheWVyID0gdGhpcy5hZGQuc3ByaXRlKHNwYXduUG9pbnQueCwgc3Bhd25Qb2ludC55LCAnY29tbWFuZG8nKVxuICAgIHRoaXMucGxheWVyLnNjYWxlLnNldFRvKC4zKVxuICAgIHRoaXMucGxheWVyLmFuY2hvci5zZXRUbyguNSlcblxuICAgIC8vICBXZSBuZWVkIHRvIGVuYWJsZSBwaHlzaWNzIG9uIHRoZSBwbGF5ZXJcbiAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmVuYWJsZSh0aGlzLnBsYXllcilcblxuICAgIC8vIEVuYWJsZSBwaHlzaWNzIG9uIHRoZSBwbGF5ZXJcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5lbmFibGUodGhpcy5wbGF5ZXIsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSlcblxuICAgIC8vIE1ha2UgcGxheWVyIGNvbGxpZGUgd2l0aCB3b3JsZCBib3VuZGFyaWVzIHNvIGhlIGRvZXNuJ3QgbGVhdmUgdGhlIHN0YWdlXG4gICAgdGhpcy5wbGF5ZXIuYm9keS5jb2xsaWRlV29ybGRCb3VuZHMgPSB0cnVlXG5cbiAgICAvLyBTZXQgcGxheWVyIG1pbmltdW0gYW5kIG1heGltdW0gbW92ZW1lbnQgc3BlZWRcbiAgICB0aGlzLnBsYXllci5ib2R5Lm1heFZlbG9jaXR5LnNldFRvKHRoaXMuTUFYX1NQRUVELCB0aGlzLk1BWF9TUEVFRCAqIDEwKSAvLyB4LCB5XG5cbiAgICAvLyBBZGQgZHJhZyB0byB0aGUgcGxheWVyIHRoYXQgc2xvd3MgdGhlbSBkb3duIHdoZW4gdGhleSBhcmUgbm90IGFjY2VsZXJhdGluZ1xuICAgIHRoaXMucGxheWVyLmJvZHkuZHJhZy5zZXRUbyh0aGlzLkRSQUcsIDApIC8vIHgsIHlcbiAgICB0aGlzLnBsYXllci5ib2R5LnNldFNpemUoMzAwLCAyOTAsIDAsIC0zKVxuICAgIHRoaXMucGxheWVyLm1ldGEgPSB7XG4gICAgICAgIGhlYWx0aDogMTAwXG4gICAgfVxuXG4gICAgLy8gU2luY2Ugd2UncmUganVtcGluZyB3ZSBuZWVkIGdyYXZpdHlcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZ3Jhdml0eS55ID0gdGhpcy5HUkFWSVRZXG5cbiAgICAvLyBGbGFnIHRvIHRyYWNrIGlmIHRoZSBqdW1wIGJ1dHRvbiBpcyBwcmVzc2VkXG4gICAgdGhpcy5qdW1waW5nID0gZmFsc2VcblxuICAgIC8vICBPdXIgdHdvIGFuaW1hdGlvbnMsIHdhbGtpbmcgbGVmdCBhbmQgcmlnaHQuXG4gICAgdGhpcy5wbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ2xlZnQnLCBbMCwgMSwgMiwgMywgNCwgNV0sIDEwLCB0cnVlKVxuICAgIHRoaXMucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdyaWdodCcsIFs4LCA5LCAxMCwgMTEsIDEyLCAxM10sIDEwLCB0cnVlKVxuXG4gICAgdGhpcy5wbGF5ZXIubWV0YSA9IHtcbiAgICAgICAgaGVhbHRoOiAxMDBcbiAgICB9XG5cbiAgICAvLyB0aGlzLmxlZnRBcm1TcHJpdGUgPSB0aGlzLmdhbWUuYWRkLnNwcml0ZSg1MDAsIHRoaXMud29ybGQuaGVpZ2h0IC0gMjMwMCwgJ2xlZnQtYXJtJylcbiAgICAvLyB0aGlzLmxlZnRBcm1TcHJpdGUuYW5jaG9yLnNldCguMiwgLjIpXG4gICAgLy8gdGhpcy5sZWZ0QXJtU3ByaXRlLndpZHRoID0gdGhpcy5sZWZ0QXJtU3ByaXRlLmhlaWdodCA9IDE5XG4gICAgLy8gdGhpcy5sZWZ0QXJtU3ByaXRlLnZpc2libGUgPSBmYWxzZVxuXG4gICAgdGhpcy5yaWdodEFybUdyb3VwID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpXG5cbiAgICB0aGlzLmFrNDdTcHJpdGUgPSB0aGlzLmdhbWUuYWRkLnNwcml0ZSgxMiwgMTksICdhazQ3JylcbiAgICB0aGlzLmFrNDdTcHJpdGUuc2NhbGUuc2V0VG8oMS4zKVxuICAgIHRoaXMuYWs0N1Nwcml0ZS5yb3RhdGlvbiA9IDgwXG4gICAgdGhpcy5yaWdodEFybUdyb3VwLmFkZCh0aGlzLmFrNDdTcHJpdGUpXG5cbiAgICB0aGlzLnJpZ2h0QXJtU3ByaXRlID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUoMCwgMCwgJ3JpZ2h0LWFybScpXG4gICAgdGhpcy5yaWdodEFybVNwcml0ZS5hbmNob3Iuc2V0VG8oLjIsIC4yNClcbiAgICB0aGlzLnJpZ2h0QXJtU3ByaXRlLnNjYWxlLnNldFRvKDEuNylcbiAgICB0aGlzLnJpZ2h0QXJtU3ByaXRlLnJvdGF0aW9uID0gODBcbiAgICB0aGlzLnJpZ2h0QXJtR3JvdXAuYWRkKHRoaXMucmlnaHRBcm1TcHJpdGUpXG5cbiAgICB0aGlzLnBsYXllci5hZGRDaGlsZCh0aGlzLnJpZ2h0QXJtR3JvdXApXG4gICAgdGhpcy5yaWdodEFybUdyb3VwLnBpdm90LnggPSAwXG4gICAgdGhpcy5yaWdodEFybUdyb3VwLnBpdm90LnkgPSAwXG4gICAgdGhpcy5yaWdodEFybUdyb3VwLnggPSAtMjVcbiAgICB0aGlzLnJpZ2h0QXJtR3JvdXAueSA9IC02NVxuXG4gICAgY29uc29sZS5sb2codGhpcy5yaWdodEFybUdyb3VwKVxuXG5cbiAgICAvKipcbiAgICAgKiBXZWFwb25zXG4gICAgICovXG4gICAgdGhpcy5jdXJyZW50V2VhcG9uID0gMFxuICAgIHRoaXMud2VhcG9ucyA9IFtcbiAgICAgICAgbmV3IFdlYXBvbnMuQUs0Nyh7XG4gICAgICAgICAgICBnYW1lOiB0aGlzLmdhbWVcbiAgICAgICAgfSksXG4gICAgICAgIG5ldyBXZWFwb25zLk01MDAoe1xuICAgICAgICAgICAgZ2FtZTogdGhpcy5nYW1lXG4gICAgICAgIH0pLFxuICAgICAgICBuZXcgV2VhcG9ucy5Ta29ycGlvbih7XG4gICAgICAgICAgICBnYW1lOiB0aGlzLmdhbWVcbiAgICAgICAgfSksXG4gICAgICAgIG5ldyBXZWFwb25zLkF1Zyh7XG4gICAgICAgICAgICBnYW1lOiB0aGlzLmdhbWVcbiAgICAgICAgfSksXG4gICAgICAgIG5ldyBXZWFwb25zLlA5MCh7XG4gICAgICAgICAgICBnYW1lOiB0aGlzLmdhbWVcbiAgICAgICAgfSksXG4gICAgICAgIG5ldyBXZWFwb25zLkRlc2VydEVhZ2xlKHtcbiAgICAgICAgICAgIGdhbWU6IHRoaXMuZ2FtZVxuICAgICAgICB9KSxcbiAgICAgICAgbmV3IFdlYXBvbnMuRzQzKHtcbiAgICAgICAgICAgIGdhbWU6IHRoaXMuZ2FtZVxuICAgICAgICB9KSxcbiAgICAgICAgbmV3IFdlYXBvbnMuTTRBMSh7XG4gICAgICAgICAgICBnYW1lOiB0aGlzLmdhbWVcbiAgICAgICAgfSksXG4gICAgICAgIG5ldyBXZWFwb25zLkJhcnJldHQoe1xuICAgICAgICAgICAgZ2FtZTogdGhpcy5nYW1lXG4gICAgICAgIH0pLFxuICAgICAgICBuZXcgV2VhcG9ucy5SUEcoe1xuICAgICAgICAgICAgZ2FtZTogdGhpcy5nYW1lXG4gICAgICAgIH0pLFxuICAgIF1cblxuXG4gICAgLyoqXG4gICAgICogVGV4dFxuICAgICAqL1xuICAgIGxldCB0ZXh0U3R5bGVzID0geyBmb250U2l6ZTogJzE0cHgnLCBmaWxsOiAnIzAwMCcgfVxuXG4gICAgRXZlbnRIYW5kbGVyLmVtaXQoJ3Njb3JlIHVwZGF0ZScsICcnKVxuICAgIEV2ZW50SGFuZGxlci5lbWl0KCdoZWFsdGggdXBkYXRlJywgJycpXG4gICAgRXZlbnRIYW5kbGVyLm9uKCd2b2x1bWUgdXBkYXRlJywgKGRhdGEpID0+IHtcbiAgICAgICAgdGhpcy52b2x1bWUgPSBkYXRhLnZvbHVtZVxuICAgIH0pXG5cbiAgICB0aGlzLnBvc2l0aW9uVGV4dCA9IHRoaXMuYWRkLnRleHQoMjUsIDI1LCBgJHt0aGlzLmdhbWUuaW5wdXQubW91c2VQb2ludGVyLnh9LCR7dGhpcy5nYW1lLmlucHV0Lm1vdXNlUG9pbnRlci55fWAsIHRleHRTdHlsZXMpXG4gICAgdGhpcy5wb3NpdGlvblRleHQuZml4ZWRUb0NhbWVyYSA9IHRydWVcblxuXG4gICAgLyoqXG4gICAgICogQ2FtZXJhIFNldHRpbmdzXG4gICAgICovXG4gICAgdGhpcy5jYW1lcmEuZm9sbG93KHRoaXMucGxheWVyKVxuXG5cbiAgICAvKipcbiAgICAgKiBSZXNpemluZyBFdmVudHNcbiAgICAgKi9cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xuICAgICAgICB0aGlzLmdhbWUuc2NhbGUucmVmcmVzaCgpXG4gICAgICAgIHRoaXMuZ2FtZS5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHRcbiAgICAgICAgdGhpcy5nYW1lLndpZHRoID0gd2luZG93LmlubmVyV2lkdGhcbiAgICB9KVxuXG5cbiAgICAvKipcbiAgICAgKiBFbmVteSBCdWxsZXRzXG4gICAgICovXG4gICAgdGhpcy5lbmVteUJ1bGxldHMgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKClcblxuXG4gICAgLyoqXG4gICAgICogU3RhcnQgbGlzdGVuaW5nIGZvciBldmVudHNcbiAgICAgKi9cbiAgICB0aGlzLnNldEV2ZW50SGFuZGxlcnMoKVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGNyZWF0ZTogcmVxdWlyZSgnLi9jcmVhdGUnKSxcbiAgICBpbml0OiByZXF1aXJlKCcuL2luaXQnKSxcbiAgICBwcmVsb2FkOiByZXF1aXJlKCcuL3ByZWxvYWQnKSxcbiAgICB1cGRhdGU6IHJlcXVpcmUoJy4vdXBkYXRlJylcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZ2FtZS5yZW5kZXJlci5yZW5kZXJTZXNzaW9uLnJvdW5kUGl4ZWxzID0gdHJ1ZVxuICAgIHRoaXMuZ2FtZS5zdGFnZS5kaXNhYmxlVmlzaWJpbGl0eUNoYW5nZSA9IHRydWVcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMubG9hZC5pbWFnZSgnbWFwLWJnJywgJy9pbWFnZXMvaGlnaC1ydWxlLWRlc2VydC5wbmcnKVxuICAgIHRoaXMubG9hZC5pbWFnZSgnZ3JvdW5kJywgJy9pbWFnZXMvcGxhdGZvcm0ucG5nJylcbiAgICB0aGlzLmxvYWQuaW1hZ2UoJ2J1bGxldDEyJywgJy9pbWFnZXMvYnVsbGV0MTIucG5nJylcblxuICAgIHRoaXMubG9hZC5zcHJpdGVzaGVldCgnZHVkZScsICcvaW1hZ2VzL2R1ZGUucG5nJywgMzIsIDQ4KVxuICAgIHRoaXMubG9hZC5zcHJpdGVzaGVldCgnY29tbWFuZG8nLCAnL2ltYWdlcy9jb21tYW5kby5wbmcnLCAzMDAsIDMxNSlcbiAgICB0aGlzLmxvYWQuc3ByaXRlc2hlZXQoJ2VuZW15JywgJy9pbWFnZXMvZHVkZS5wbmcnLCAzMiwgNDgpXG5cbiAgICB0aGlzLmxvYWQuaW1hZ2UoJ2FrNDcnLCAnL2ltYWdlcy9ndW5zL1Nwcl9BSzQ3LnBuZycpXG4gICAgdGhpcy5sb2FkLmltYWdlKCdyaWdodC1hcm0nLCAnL2ltYWdlcy9ib2R5L3JpZ2h0LWFybS5wbmcnKVxuICAgIHRoaXMubG9hZC5pbWFnZSgnbGVmdC1hcm0nLCAnL2ltYWdlcy9ib2R5L2xlZnQtYXJtLnBuZycpXG5cbiAgICB0aGlzLmxvYWQuYXVkaW8oJ0FLNDctc291bmQnLCAnL2F1ZGlvL0FLNDcub2dnJylcbiAgICB0aGlzLmxvYWQuYXVkaW8oJ0JhcnJldE05MC1zb3VuZCcsICcvYXVkaW8vQmFycmV0TTkwLm9nZycpXG4gICAgdGhpcy5sb2FkLmF1ZGlvKCdNMjQ5LXNvdW5kJywgJy9hdWRpby9NMjQ5Lm9nZycpXG4gICAgdGhpcy5sb2FkLmF1ZGlvKCdNUDUtc291bmQnLCAnL2F1ZGlvL01QNS5vZ2cnKVxuICAgIHRoaXMubG9hZC5hdWRpbygnRGVzZXJ0RWFnbGUtc291bmQnLCAnL2F1ZGlvL0Rlc2VydEVhZ2xlLm9nZycpXG4gICAgdGhpcy5sb2FkLmF1ZGlvKCdNNEExLXNvdW5kJywgJy9hdWRpby9NNEExLm9nZycpXG59XG4iLCIndXNlIHN0cmljdCdcblxuaW1wb3J0IEV2ZW50SGFuZGxlciBmcm9tICcuLi9saWIvRXZlbnRIYW5kbGVyJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuXG5cblxuICAgIC8vIENvbGxpZGUgdGhpcyBwbGF5ZXIgd2l0aCB0aGUgbWFwXG4gICAgdGhpcy5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMucGxheWVyLCB0aGlzLnBsYXRmb3JtcywgbnVsbCwgbnVsbCwgdGhpcylcblxuICAgIC8vIERpZCB0aGlzIHBsYXllcidzIGJ1bGxldHMgaGl0IGFueSBwbGF0Zm9ybXNcbiAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5wbGF0Zm9ybXMsIHRoaXMud2VhcG9ucywgKHBsYXRmb3JtLCB3ZWFwb24pID0+IHtcbiAgICAgICAgd2VhcG9uLmtpbGwoKVxuICAgIH0sIG51bGwsIHRoaXMpXG5cbiAgICAvLyBEaWQgZW5lbXkgYnVsbGV0cyBoaXQgYW55IHBsYXRmb3Jtc1xuICAgIHRoaXMucGh5c2ljcy5hcmNhZGUuY29sbGlkZSh0aGlzLnBsYXRmb3JtcywgdGhpcy5lbmVteUJ1bGxldHMsIChwbGF0Zm9ybSwgYnVsbGV0KSA9PiB7XG4gICAgICAgIGJ1bGxldC5raWxsKClcbiAgICB9LCBudWxsLCB0aGlzKVxuXG4gICAgLy8gRGlkIHRoaXMgcGxheWVyIGdldCBoaXQgYnkgYW55IGVuZW15IGJ1bGxldHNcbiAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5wbGF5ZXIsIHRoaXMuZW5lbXlCdWxsZXRzLCBudWxsLCAocGxheWVyLCBidWxsZXQpID0+IHtcbiAgICAgICAgYnVsbGV0LmtpbGwoKVxuXG4gICAgICAgIGNvbnNvbGUubG9nKCdZb3Ugd2VyZSBoaXQgYnknLCBidWxsZXQuYnVsbGV0SWQpXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ2J1bGxldCByZW1vdmVkJywge1xuICAgICAgICAgICAgcm9vbUlkOiB0aGlzLnJvb21JZCxcbiAgICAgICAgICAgIGJ1bGxldElkOiBidWxsZXQuYnVsbGV0SWRcbiAgICAgICAgfSlcblxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdwbGF5ZXIgZGFtYWdlZCcsIHtcbiAgICAgICAgICAgIHJvb21JZDogdGhpcy5yb29tSWQsXG4gICAgICAgICAgICBkYW1hZ2U6IGJ1bGxldC5kYW1hZ2UsXG4gICAgICAgICAgICBkYW1hZ2VkUGxheWVySWQ6ICcvIycgKyB0aGlzLnNvY2tldC5pZCxcbiAgICAgICAgICAgIGF0dGFja2luZ1BsYXllcklkOiBidWxsZXQucGxheWVySWRcbiAgICAgICAgfSlcblxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICB9LCB0aGlzKVxuXG4gICAgaWYgKHRoaXMubGVmdElucHV0SXNBY3RpdmUoKSkge1xuICAgICAgICAvLyBJZiB0aGUgTEVGVCBrZXkgaXMgZG93biwgc2V0IHRoZSBwbGF5ZXIgdmVsb2NpdHkgdG8gbW92ZSBsZWZ0XG4gICAgICAgIHRoaXMucGxheWVyLmJvZHkuYWNjZWxlcmF0aW9uLnggPSAtdGhpcy5BQ0NFTEVSQVRJT05cbiAgICAgICAgdGhpcy5wbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdsZWZ0JylcbiAgICB9IGVsc2UgaWYgKHRoaXMucmlnaHRJbnB1dElzQWN0aXZlKCkpIHtcbiAgICAgICAgLy8gSWYgdGhlIFJJR0hUIGtleSBpcyBkb3duLCBzZXQgdGhlIHBsYXllciB2ZWxvY2l0eSB0byBtb3ZlIHJpZ2h0XG4gICAgICAgIHRoaXMucGxheWVyLmJvZHkuYWNjZWxlcmF0aW9uLnggPSB0aGlzLkFDQ0VMRVJBVElPTlxuICAgICAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLnBsYXkoJ3JpZ2h0JylcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBTdGFuZCBzdGlsbFxuICAgICAgICB0aGlzLnBsYXllci5ib2R5LmFjY2VsZXJhdGlvbi54ID0gMFxuICAgICAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLnN0b3AoKVxuICAgICAgICB0aGlzLnBsYXllci5mcmFtZSA9IDdcbiAgICB9XG5cblxuXG5cblxuXG5cblxuICAgIC8vIGxldCBsZWZ0QXJtUm90YXRpb24gPSB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuYW5nbGVUb1BvaW50ZXIodGhpcy5sZWZ0QXJtU3ByaXRlKVxuICAgIC8vIHRoaXMubGVmdEFybVNwcml0ZS5yb3RhdGlvbiA9IGxlZnRBcm1Sb3RhdGlvblxuICAgIC8vIHRoaXMubGVmdEFybVNwcml0ZS54ID0gdGhpcy5wbGF5ZXIueCArIDQ5XG4gICAgLy8gdGhpcy5sZWZ0QXJtU3ByaXRlLnkgPSB0aGlzLnBsYXllci55ICsgMjJcblxuXG4gICAgbGV0IGFuZ2xlSW5EZWdyZWVzID0gdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmFuZ2xlVG9Qb2ludGVyKHRoaXMucGxheWVyKSAqIDE4MCAvIE1hdGguUEk7XG4gICAgdGhpcy5yaWdodEFybUdyb3VwLmFuZ2xlID0gYW5nbGVJbkRlZ3JlZXMgKyA5MFxuXG5cblxuXG5cbiAgICAvLyBTZXQgYSB2YXJpYWJsZSB0aGF0IGlzIHRydWUgd2hlbiB0aGUgcGxheWVyIGlzIHRvdWNoaW5nIHRoZSBncm91bmRcbiAgICBsZXQgb25UaGVHcm91bmQgPSB0aGlzLnBsYXllci5ib2R5LnRvdWNoaW5nLmRvd25cblxuICAgIC8vIElmIHRoZSBwbGF5ZXIgaXMgdG91Y2hpbmcgdGhlIGdyb3VuZCwgbGV0IGhpbSBoYXZlIDIganVtcHNcbiAgICBpZiAob25UaGVHcm91bmQpIHtcbiAgICAgICAgdGhpcy5qdW1wcyA9IDJcbiAgICAgICAgdGhpcy5qdW1waW5nID0gZmFsc2VcbiAgICB9XG5cbiAgICAvLyBKdW1wIVxuICAgIGlmICh0aGlzLmp1bXBzID4gMCAmJiB0aGlzLnVwSW5wdXRJc0FjdGl2ZSg1KSkge1xuICAgICAgICB0aGlzLnBsYXllci5ib2R5LnZlbG9jaXR5LnkgPSB0aGlzLkpVTVBfU1BFRURcbiAgICAgICAgdGhpcy5qdW1waW5nID0gdHJ1ZVxuICAgIH1cblxuICAgIC8vIFJlZHVjZSB0aGUgbnVtYmVyIG9mIGF2YWlsYWJsZSBqdW1wcyBpZiB0aGUganVtcCBpbnB1dCBpcyByZWxlYXNlZFxuICAgIGlmICh0aGlzLmp1bXBpbmcgJiYgdGhpcy51cElucHV0UmVsZWFzZWQoKSkge1xuICAgICAgICB0aGlzLmp1bXBzLS1cbiAgICAgICAgdGhpcy5qdW1waW5nID0gZmFsc2VcbiAgICB9XG5cbiAgICBpZiAodGhpcy5nYW1lLmlucHV0LmFjdGl2ZVBvaW50ZXIuaXNEb3duKVxuICAgIHtcbiAgICAgICAgdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0uZmlyZSh0aGlzLnBsYXllciwgdGhpcy5zb2NrZXQsIHRoaXMucm9vbUlkLCB0aGlzLnZvbHVtZSlcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pbnB1dC5rZXlib2FyZC5pc0Rvd24oUGhhc2VyLktleWJvYXJkLk9ORSkpIHtcbiAgICAgICAgdGhpcy5zZXRDdXJyZW50V2VhcG9uKDApXG4gICAgICAgIEV2ZW50SGFuZGxlci5lbWl0KCd3ZWFwb24gdXBkYXRlJywgMSlcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pbnB1dC5rZXlib2FyZC5pc0Rvd24oUGhhc2VyLktleWJvYXJkLlRXTykpIHtcbiAgICAgICAgdGhpcy5zZXRDdXJyZW50V2VhcG9uKDEpXG4gICAgICAgIEV2ZW50SGFuZGxlci5lbWl0KCd3ZWFwb24gdXBkYXRlJywgMilcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pbnB1dC5rZXlib2FyZC5pc0Rvd24oUGhhc2VyLktleWJvYXJkLlRIUkVFKSkge1xuICAgICAgICB0aGlzLnNldEN1cnJlbnRXZWFwb24oMilcbiAgICAgICAgRXZlbnRIYW5kbGVyLmVtaXQoJ3dlYXBvbiB1cGRhdGUnLCAzKVxuICAgIH1cblxuICAgIGlmICh0aGlzLmlucHV0LmtleWJvYXJkLmlzRG93bihQaGFzZXIuS2V5Ym9hcmQuRk9VUikpIHtcbiAgICAgICAgdGhpcy5zZXRDdXJyZW50V2VhcG9uKDMpXG4gICAgICAgIEV2ZW50SGFuZGxlci5lbWl0KCd3ZWFwb24gdXBkYXRlJywgNClcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pbnB1dC5rZXlib2FyZC5pc0Rvd24oUGhhc2VyLktleWJvYXJkLkZJVkUpKSB7XG4gICAgICAgIHRoaXMuc2V0Q3VycmVudFdlYXBvbig0KVxuICAgICAgICBFdmVudEhhbmRsZXIuZW1pdCgnd2VhcG9uIHVwZGF0ZScsIDUpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaW5wdXQua2V5Ym9hcmQuaXNEb3duKFBoYXNlci5LZXlib2FyZC5TSVgpKSB7XG4gICAgICAgIHRoaXMuc2V0Q3VycmVudFdlYXBvbig1KVxuICAgICAgICBFdmVudEhhbmRsZXIuZW1pdCgnd2VhcG9uIHVwZGF0ZScsIDYpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaW5wdXQua2V5Ym9hcmQuaXNEb3duKFBoYXNlci5LZXlib2FyZC5TRVZFTikpIHtcbiAgICAgICAgdGhpcy5zZXRDdXJyZW50V2VhcG9uKDYpXG4gICAgICAgIEV2ZW50SGFuZGxlci5lbWl0KCd3ZWFwb24gdXBkYXRlJywgNylcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pbnB1dC5rZXlib2FyZC5pc0Rvd24oUGhhc2VyLktleWJvYXJkLkVJR0hUKSkge1xuICAgICAgICB0aGlzLnNldEN1cnJlbnRXZWFwb24oNylcbiAgICAgICAgRXZlbnRIYW5kbGVyLmVtaXQoJ3dlYXBvbiB1cGRhdGUnLCA4KVxuICAgIH1cblxuICAgIGlmICh0aGlzLmlucHV0LmtleWJvYXJkLmlzRG93bihQaGFzZXIuS2V5Ym9hcmQuTklORSkpIHtcbiAgICAgICAgdGhpcy5zZXRDdXJyZW50V2VhcG9uKDgpXG4gICAgICAgIEV2ZW50SGFuZGxlci5lbWl0KCd3ZWFwb24gdXBkYXRlJywgOSlcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pbnB1dC5rZXlib2FyZC5pc0Rvd24oUGhhc2VyLktleWJvYXJkLlpFUk8pKSB7XG4gICAgICAgIHRoaXMuc2V0Q3VycmVudFdlYXBvbig5KVxuICAgICAgICBFdmVudEhhbmRsZXIuZW1pdCgnd2VhcG9uIHVwZGF0ZScsIDApXG4gICAgfVxuXG4gICAgdGhpcy5wb3NpdGlvblRleHQudGV4dCA9IGAke3RoaXMuZ2FtZS5pbnB1dC5tb3VzZVBvaW50ZXIueH0sICR7dGhpcy5nYW1lLmlucHV0Lm1vdXNlUG9pbnRlci55fWBcblxuICAgIHRoaXMuc29ja2V0LmVtaXQoJ21vdmUgcGxheWVyJywge1xuICAgICAgICByb29tSWQ6IHRoaXMucm9vbUlkLFxuICAgICAgICB4OiB0aGlzLnBsYXllci54LFxuICAgICAgICB5OiB0aGlzLnBsYXllci55XG4gICAgfSlcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgSW5wdXRIYW5kbGVyID0gcmVxdWlyZSgnLi9saWIvSW5wdXRIYW5kbGVyJylcbi8vIGxldCBFbmVteUJ1ZmZhbG8gPSByZXF1aXJlKCcuL2xpYi9FbmVteUJ1ZmZhbG8nKVxubGV0IFNvY2tldEV2ZW50cyA9IHJlcXVpcmUoJy4vbGliL1NvY2tldEV2ZW50cycpXG5sZXQgQ29yZSA9IHJlcXVpcmUoJy4vY29yZScpXG5cbmxldCBnYW1lV2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aFxubGV0IGdhbWVIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHRcbmxldCBnYW1lID0gbmV3IFBoYXNlci5HYW1lKGdhbWVXaWR0aCwgZ2FtZUhlaWdodCwgUGhhc2VyLkFVVE8sICdyYW5nZXItc3RldmUtZ2FtZScpXG5cbmxldCBSYW5nZXJTdGV2ZUdhbWUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmN1cnJlbnRXZWFwb24gPSAwXG4gICAgdGhpcy5lbmVtaWVzID0gW11cbiAgICB0aGlzLmdhbWUgPSBnYW1lXG4gICAgdGhpcy5ncm91bmRcbiAgICB0aGlzLnBsYXRmb3Jtc1xuICAgIHRoaXMucGxheWVyXG4gICAgdGhpcy5zY29yZSA9IDBcbiAgICB0aGlzLnNjb3JlVGV4dFxuICAgIHRoaXMuc29ja2V0XG4gICAgdGhpcy53ZWFwb25OYW1lID0gbnVsbFxuICAgIHRoaXMud2VhcG9ucyA9IFtdXG59XG5cblJhbmdlclN0ZXZlR2FtZS5wcm90b3R5cGUgPSB7XG4gICAgaW5pdDogQ29yZS5pbml0LFxuICAgIHByZWxvYWQ6IENvcmUucHJlbG9hZCxcbiAgICBjcmVhdGU6IENvcmUuY3JlYXRlLFxuICAgIHVwZGF0ZTogQ29yZS51cGRhdGUsXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB9LFxuXG4gICAgbGVmdElucHV0SXNBY3RpdmU6IElucHV0SGFuZGxlci5sZWZ0SW5wdXRJc0FjdGl2ZSxcbiAgICByaWdodElucHV0SXNBY3RpdmU6IElucHV0SGFuZGxlci5yaWdodElucHV0SXNBY3RpdmUsXG4gICAgdXBJbnB1dElzQWN0aXZlOiBJbnB1dEhhbmRsZXIudXBJbnB1dElzQWN0aXZlLFxuICAgIHVwSW5wdXRSZWxlYXNlZDogSW5wdXRIYW5kbGVyLnVwSW5wdXRSZWxlYXNlZCxcblxuICAgIHNldEN1cnJlbnRXZWFwb246IGZ1bmN0aW9uKG5ld0N1cnJlbnRXZWFwb24pIHtcbiAgICAgICAgaWYgKG5ld0N1cnJlbnRXZWFwb24gPT09IHRoaXMud2VhcG9ucy5sZW5ndGgpXG4gICAgICAgICAgICBuZXdDdXJyZW50V2VhcG9uID0gMFxuXG4gICAgICAgIC8vICBSZXNldCBjdXJyZW50IHdlYXBvblxuICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS52aXNpYmxlID0gZmFsc2VcbiAgICAgICAgdGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0uY2FsbEFsbCgncmVzZXQnLCBudWxsLCAwLCAwKVxuICAgICAgICB0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS5zZXRBbGwoJ2V4aXN0cycsIGZhbHNlKVxuXG4gICAgICAgIC8vICBBY3RpdmF0ZSB0aGUgbmV3IG9uZVxuICAgICAgICB0aGlzLmN1cnJlbnRXZWFwb24gPSBuZXdDdXJyZW50V2VhcG9uXG4gICAgICAgIHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLnZpc2libGUgPSB0cnVlXG4gICAgfSxcblxuICAgIHNldEV2ZW50SGFuZGxlcnM6IFNvY2tldEV2ZW50cy5zZXRFdmVudEhhbmRsZXJzLFxuICAgIG9uVXBkYXRlUGxheWVyczogU29ja2V0RXZlbnRzLm9uVXBkYXRlUGxheWVycyxcbiAgICBvblNvY2tldENvbm5lY3RlZDogU29ja2V0RXZlbnRzLm9uU29ja2V0Q29ubmVjdGVkLFxuICAgIG9uU29ja2V0RGlzY29ubmVjdDogU29ja2V0RXZlbnRzLm9uU29ja2V0RGlzY29ubmVjdCxcbiAgICBvbk1vdmVQbGF5ZXI6IFNvY2tldEV2ZW50cy5vbk1vdmVQbGF5ZXIsXG4gICAgb25SZW1vdmVQbGF5ZXI6IFNvY2tldEV2ZW50cy5vblJlbW92ZVBsYXllcixcbiAgICBvbkJ1bGxldEZpcmVkOiBTb2NrZXRFdmVudHMub25CdWxsZXRGaXJlZCxcbiAgICBvbkJ1bGxldFJlbW92ZWQ6IFNvY2tldEV2ZW50cy5vbkJ1bGxldFJlbW92ZWQsXG4gICAgb25QbGF5ZXJEYW1hZ2VkOiBTb2NrZXRFdmVudHMub25QbGF5ZXJEYW1hZ2VkLFxuICAgIG9uUGxheWVyUmVzcGF3bjogU29ja2V0RXZlbnRzLm9uUGxheWVyUmVzcGF3blxufVxuXG5nYW1lLnN0YXRlLmFkZCgnR2FtZScsIFJhbmdlclN0ZXZlR2FtZSwgdHJ1ZSlcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgR3VpZCA9IHJlcXVpcmUoJy4vR3VpZCcpXG5cbnZhciBCdWxsZXQgPSBmdW5jdGlvbiAoZ2FtZSwga2V5KSB7XG4gICAgUGhhc2VyLlNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIDAsIDAsIGtleSlcbiAgICB0aGlzLnRleHR1cmUuYmFzZVRleHR1cmUuc2NhbGVNb2RlID0gUElYSS5zY2FsZU1vZGVzLk5FQVJFU1RcbiAgICB0aGlzLmFuY2hvci5zZXQoMC41KVxuICAgIHRoaXMuY2hlY2tXb3JsZEJvdW5kcyA9IHRydWVcbiAgICB0aGlzLm91dE9mQm91bmRzS2lsbCA9IHRydWVcbiAgICB0aGlzLmV4aXN0cyA9IGZhbHNlXG4gICAgdGhpcy50cmFja2luZyA9IGZhbHNlXG4gICAgdGhpcy5zY2FsZVNwZWVkID0gMFxufVxuXG5CdWxsZXQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSlcbkJ1bGxldC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBCdWxsZXRcblxuQnVsbGV0LnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24gKHgsIHksIGFuZ2xlLCBzcGVlZCwgZ3gsIGd5LCBzb2NrZXQsIHJvb21JZCkge1xuICAgIHRoaXMucmVzZXQoeCwgeSlcblxuICAgIGxldCBwb2ludGVyQW5nbGUgPSB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUubW92ZVRvUG9pbnRlcih0aGlzLCBzcGVlZClcbiAgICB0aGlzLmJvZHkuZ3Jhdml0eS55ID0gLTE4MDBcblxuICAgIGNvbnNvbGUubG9nKCdGaXJpbmcgYnVsbGV0IGxvY2FsbHknLCB0aGlzLmJ1bGxldElkKVxuXG4gICAgc29ja2V0LmVtaXQoJ2J1bGxldCBmaXJlZCcsIHtcbiAgICAgICAgcm9vbUlkOiByb29tSWQsXG4gICAgICAgIGJ1bGxldElkOiB0aGlzLmJ1bGxldElkLFxuICAgICAgICBwbGF5ZXJJZDogJy8jJyArIHNvY2tldC5pZCxcbiAgICAgICAgeCxcbiAgICAgICAgeSxcbiAgICAgICAgYW5nbGUsXG4gICAgICAgIHNwZWVkLFxuICAgICAgICBneCxcbiAgICAgICAgZ3ksXG4gICAgICAgIHBvaW50ZXJBbmdsZSxcbiAgICAgICAgaGVpZ2h0OiB0aGlzLmhlaWdodCxcbiAgICAgICAgd2lkdGg6IHRoaXMud2lkdGgsXG4gICAgICAgIGRhbWFnZTogdGhpcy5kYW1hZ2VcbiAgICB9KVxufVxuXG5CdWxsZXQucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy50cmFja2luZykge1xuICAgICAgICB0aGlzLnJvdGF0aW9uID0gTWF0aC5hdGFuMih0aGlzLmJvZHkudmVsb2NpdHkueSwgdGhpcy5ib2R5LnZlbG9jaXR5LngpXG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1bGxldFxuIiwiaW1wb3J0IGVtaXR0ZXIgZnJvbSAnZXZlbnQtZW1pdHRlcidcblxubGV0IEV2ZW50SGFuZGxlciA9IGVtaXR0ZXIoe30pXG5cbmV4cG9ydCBkZWZhdWx0IEV2ZW50SGFuZGxlclxuIiwiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ3VpZEdlbmVyYXRvcigpIHtcbiAgICB2YXIgUzQgPSBmdW5jdGlvbigpIHtcbiAgICAgICByZXR1cm4gKCgoMStNYXRoLnJhbmRvbSgpKSoweDEwMDAwKXwwKS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpXG4gICAgfVxuXG4gICAgcmV0dXJuIChTNCgpK1M0KCkrXCItXCIrUzQoKStcIi1cIitTNCgpK1wiLVwiK1M0KCkrXCItXCIrUzQoKStTNCgpK1M0KCkpXG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgLy8gVGhpcyBmdW5jdGlvbiBzaG91bGQgcmV0dXJuIHRydWUgd2hlbiB0aGUgcGxheWVyIGFjdGl2YXRlcyB0aGUgXCJnbyBsZWZ0XCIgY29udHJvbFxuICAgIC8vIEluIHRoaXMgY2FzZSwgZWl0aGVyIGhvbGRpbmcgdGhlIHJpZ2h0IGFycm93IG9yIHRhcHBpbmcgb3IgY2xpY2tpbmcgb24gdGhlIGxlZnRcbiAgICAvLyBzaWRlIG9mIHRoZSBzY3JlZW4uXG4gICAgbGVmdElucHV0SXNBY3RpdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnB1dC5rZXlib2FyZC5pc0Rvd24oUGhhc2VyLktleWJvYXJkLkEpXG4gICAgfSxcblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gc2hvdWxkIHJldHVybiB0cnVlIHdoZW4gdGhlIHBsYXllciBhY3RpdmF0ZXMgdGhlIFwiZ28gcmlnaHRcIiBjb250cm9sXG4gICAgLy8gSW4gdGhpcyBjYXNlLCBlaXRoZXIgaG9sZGluZyB0aGUgcmlnaHQgYXJyb3cgb3IgdGFwcGluZyBvciBjbGlja2luZyBvbiB0aGUgcmlnaHRcbiAgICAvLyBzaWRlIG9mIHRoZSBzY3JlZW4uXG4gICAgcmlnaHRJbnB1dElzQWN0aXZlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5wdXQua2V5Ym9hcmQuaXNEb3duKFBoYXNlci5LZXlib2FyZC5EKVxuICAgIH0sXG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIHNob3VsZCByZXR1cm4gdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgYWN0aXZhdGVzIHRoZSBcImp1bXBcIiBjb250cm9sXG4gICAgLy8gSW4gdGhpcyBjYXNlLCBlaXRoZXIgaG9sZGluZyB0aGUgdXAgYXJyb3cgb3IgdGFwcGluZyBvciBjbGlja2luZyBvbiB0aGUgY2VudGVyXG4gICAgLy8gcGFydCBvZiB0aGUgc2NyZWVuLlxuICAgIHVwSW5wdXRJc0FjdGl2ZTogZnVuY3Rpb24oZHVyYXRpb24pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5wdXQua2V5Ym9hcmQuZG93bkR1cmF0aW9uKFBoYXNlci5LZXlib2FyZC5XLCBkdXJhdGlvbilcbiAgICB9LFxuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiByZXR1cm5zIHRydWUgd2hlbiB0aGUgcGxheWVyIHJlbGVhc2VzIHRoZSBcImp1bXBcIiBjb250cm9sXG4gICAgdXBJbnB1dFJlbGVhc2VkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5wdXQua2V5Ym9hcmQudXBEdXJhdGlvbihQaGFzZXIuS2V5Ym9hcmQuVylcbiAgICB9XG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpZCkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5lbmVtaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICh0aGlzLmVuZW1pZXNbaV0ucGxheWVyLmlkID09PSBpZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZW5lbWllc1tpXVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IFJlbW90ZVBsYXllciA9IGZ1bmN0aW9uKGlkLCBnYW1lLCBwbGF5ZXIsIHN0YXJ0WCwgc3RhcnRZKSB7XG4gICAgbGV0IG5ld1JlbW90ZVBsYXllciA9IHtcbiAgICAgICAgeDogc3RhcnRYLFxuICAgICAgICB5OiBzdGFydFksXG4gICAgICAgIGlkOiBudWxsLFxuICAgICAgICBnYW1lOiBnYW1lLFxuICAgICAgICBoZWFsdGg6IDEwMCxcbiAgICAgICAgcGxheWVyOiBwbGF5ZXIsXG4gICAgICAgIGFsaXZlOiB0cnVlLFxuICAgICAgICBsYXN0UG9zaXRpb246IHtcbiAgICAgICAgICAgIHg6IHN0YXJ0WCxcbiAgICAgICAgICAgIHk6IHN0YXJ0WVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIHRoZSBwbGF5ZXIncyBlbmVteSBzcHJpdGVcbiAgICBuZXdSZW1vdGVQbGF5ZXIucGxheWVyID0gZ2FtZS5hZGQuc3ByaXRlKHN0YXJ0WCwgc3RhcnRZLCAnZW5lbXknKVxuXG4gICAgLy8gIFdlIG5lZWQgdG8gZW5hYmxlIHBoeXNpY3Mgb24gdGhlIHBsYXllclxuICAgIC8vIHRoaXMucGh5c2ljcy5hcmNhZGUuZW5hYmxlKG5ld1JlbW90ZVBsYXllci5wbGF5ZXIpXG5cbiAgICAvLyAvLyBFbmFibGUgcGh5c2ljcyBvbiB0aGUgcGxheWVyXG4gICAgLy8gdGhpcy5nYW1lLnBoeXNpY3MuZW5hYmxlKG5ld1JlbW90ZVBsYXllci5wbGF5ZXIsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSlcblxuICAgIC8vIE1ha2UgcGxheWVyIGNvbGxpZGUgd2l0aCB3b3JsZCBib3VuZGFyaWVzIHNvIGhlIGRvZXNuJ3QgbGVhdmUgdGhlIHN0YWdlXG4gICAgLy8gbmV3UmVtb3RlUGxheWVyLnBsYXllci5ib2R5LmNvbGxpZGVXb3JsZEJvdW5kcyA9IHRydWVcblxuICAgIC8vIE91ciB0d28gYW5pbWF0aW9ucywgd2Fsa2luZyBsZWZ0IGFuZCByaWdodC5cbiAgICBuZXdSZW1vdGVQbGF5ZXIucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdsZWZ0JywgWzAsIDEsIDIsIDNdLCAxMCwgdHJ1ZSlcbiAgICBuZXdSZW1vdGVQbGF5ZXIucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdyaWdodCcsIFs1LCA2LCA3LCA4XSwgMTAsIHRydWUpXG5cbiAgICBuZXdSZW1vdGVQbGF5ZXIucGxheWVyLmlkID0gaWRcblxuICAgIHJldHVybiBuZXdSZW1vdGVQbGF5ZXJcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBSZW1vdGVQbGF5ZXJcbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBzZXRFdmVudEhhbmRsZXJzOiByZXF1aXJlKCcuL3NldEV2ZW50SGFuZGxlcnMnKSxcblxuICAgIG9uU29ja2V0Q29ubmVjdGVkOiByZXF1aXJlKCcuL29uU29ja2V0Q29ubmVjdGVkJyksXG4gICAgb25Tb2NrZXREaXNjb25uZWN0OiByZXF1aXJlKCcuL29uU29ja2V0RGlzY29ubmVjdCcpLFxuXG4gICAgb25Nb3ZlUGxheWVyOiByZXF1aXJlKCcuL29uTW92ZVBsYXllcicpLFxuICAgIG9uUmVtb3ZlUGxheWVyOiByZXF1aXJlKCcuL29uUmVtb3ZlUGxheWVyJyksXG4gICAgb25VcGRhdGVQbGF5ZXJzOiByZXF1aXJlKCcuL29uVXBkYXRlUGxheWVycycpLFxuXG4gICAgb25QbGF5ZXJEYW1hZ2VkOiByZXF1aXJlKCcuL29uUGxheWVyRGFtYWdlZCcpLFxuICAgIG9uUGxheWVyUmVzcGF3bjogcmVxdWlyZSgnLi9vblBsYXllclJlc3Bhd24nKSxcblxuICAgIG9uQnVsbGV0RmlyZWQ6IHJlcXVpcmUoJy4vb25CdWxsZXRGaXJlZCcpLFxuICAgIG9uQnVsbGV0UmVtb3ZlZDogcmVxdWlyZSgnLi9vbkJ1bGxldFJlbW92ZWQnKVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBCdWxsZXQgPSByZXF1aXJlKCcuLi9CdWxsZXQnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBpZiAoZGF0YS5pZCA9PT0gKCcvIycgKyB0aGlzLnNvY2tldC5pZCkpXG4gICAgICAgIHJldHVyblxuXG4gICAgY29uc29sZS5sb2coJ0ZpcmluZyBidWxsZXQgcmVtb3RlbHknLCBkYXRhLmJ1bGxldElkKVxuXG4gICAgbGV0IG5ld0VuZW15QnVsbGV0ID0gdGhpcy5lbmVteUJ1bGxldHMuY3JlYXRlKGRhdGEueCwgZGF0YS55LCAnYnVsbGV0MTInKVxuICAgIG5ld0VuZW15QnVsbGV0LmJ1bGxldElkID0gZGF0YS5idWxsZXRJZFxuICAgIG5ld0VuZW15QnVsbGV0LnBsYXllcklkID0gZGF0YS5wbGF5ZXJJZFxuICAgIG5ld0VuZW15QnVsbGV0LmRhbWFnZSA9IGRhdGEuZGFtYWdlXG4gICAgbmV3RW5lbXlCdWxsZXQucm90YXRpb24gPSBkYXRhLnBvaW50ZXJBbmdsZVxuICAgIG5ld0VuZW15QnVsbGV0LmhlaWdodCA9IGRhdGEuaGVpZ2h0XG4gICAgbmV3RW5lbXlCdWxsZXQud2lkdGggPSBkYXRhLndpZHRoXG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuZW5hYmxlKG5ld0VuZW15QnVsbGV0LCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpXG4gICAgbmV3RW5lbXlCdWxsZXQuYm9keS5ncmF2aXR5LnkgPSAtMTgwMFxuXG4gICAgbGV0IG5ld1ZlbG9jaXR5ID0gdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLnZlbG9jaXR5RnJvbVJvdGF0aW9uKGRhdGEucG9pbnRlckFuZ2xlLCBkYXRhLnNwZWVkKVxuICAgIG5ld0VuZW15QnVsbGV0LmJvZHkudmVsb2NpdHkueCArPSBuZXdWZWxvY2l0eS54XG4gICAgbmV3RW5lbXlCdWxsZXQuYm9keS52ZWxvY2l0eS55ICs9IG5ld1ZlbG9jaXR5Lnlcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBpZiAoZGF0YS5pZCA9PT0gKCcvIycgKyB0aGlzLnNvY2tldC5pZCkpXG4gICAgICAgIHJldHVyblxuXG4gICAgY29uc29sZS5sb2coJ1JlbW92aW5nIGJ1bGxldCcsIGRhdGEuYnVsbGV0SWQpXG5cbiAgICBsZXQgcmVtb3ZlQnVsbGV0ID0gXy5maW5kKHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLmNoaWxkcmVuLCB7XG4gICAgICAgIGJ1bGxldElkOiBkYXRhLmJ1bGxldElkXG4gICAgfSlcblxuICAgIGlmICghcmVtb3ZlQnVsbGV0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdCdWxsZXQgbm90IGZvdW5kOiAnLCBkYXRhLmJ1bGxldElkKVxuICAgICAgICByZXR1cm5cbiAgICB9XG5cbiAgICByZW1vdmVCdWxsZXQua2lsbCgpXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IFBsYXllckJ5SWQgPSByZXF1aXJlKCcuLi9QbGF5ZXJCeUlkJylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgbGV0IG1vdmVQbGF5ZXIgPSBQbGF5ZXJCeUlkLmNhbGwodGhpcywgZGF0YS5pZClcblxuICAgIC8vIFBsYXllciBub3QgZm91bmRcbiAgICBpZiAoISBtb3ZlUGxheWVyKSB7XG4gICAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIFVwZGF0ZSBwbGF5ZXIgcG9zaXRpb25cbiAgICBtb3ZlUGxheWVyLnBsYXllci54ID0gZGF0YS54XG4gICAgbW92ZVBsYXllci5wbGF5ZXIueSA9IGRhdGEueVxuXG4gICAgaWYgKG1vdmVQbGF5ZXIucGxheWVyLnggPiBtb3ZlUGxheWVyLmxhc3RQb3NpdGlvbi54KSB7XG4gICAgICAgIG1vdmVQbGF5ZXIucGxheWVyLmFuaW1hdGlvbnMucGxheSgncmlnaHQnKVxuICAgIH1cbiAgICBlbHNlIGlmIChtb3ZlUGxheWVyLnBsYXllci54IDwgbW92ZVBsYXllci5sYXN0UG9zaXRpb24ueClcbiAgICB7XG4gICAgICAgIG1vdmVQbGF5ZXIucGxheWVyLmFuaW1hdGlvbnMucGxheSgnbGVmdCcpXG4gICAgfVxuICAgIGVsc2VcbiAgICB7XG4gICAgICAgIG1vdmVQbGF5ZXIucGxheWVyLmFuaW1hdGlvbnMuc3RvcCgpXG4gICAgICAgIG1vdmVQbGF5ZXIucGxheWVyLmZyYW1lID0gNFxuICAgIH1cblxuICAgIG1vdmVQbGF5ZXIubGFzdFBvc2l0aW9uLnggPSBtb3ZlUGxheWVyLnBsYXllci54XG4gICAgbW92ZVBsYXllci5sYXN0UG9zaXRpb24ueSA9IG1vdmVQbGF5ZXIucGxheWVyLnlcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5pbXBvcnQgRXZlbnRIYW5kbGVyIGZyb20gJy4uL0V2ZW50SGFuZGxlcidcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgaWYgKGRhdGEuZGFtYWdlZFBsYXllcklkICE9PSAoJy8jJyArIHRoaXMuc29ja2V0LmlkKSlcbiAgICAgICAgcmV0dXJuXG5cbiAgICB0aGlzLnBsYXllci5tZXRhLmhlYWx0aCA9IGRhdGEuaGVhbHRoXG4gICAgRXZlbnRIYW5kbGVyLmVtaXQoJ2hlYWx0aCB1cGRhdGUnLCB0aGlzLnBsYXllci5tZXRhLmhlYWx0aClcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5pbXBvcnQgRXZlbnRIYW5kbGVyIGZyb20gJy4uL0V2ZW50SGFuZGxlcidcbmxldCBIaWdoUnVsZURlc2VydCA9IHJlcXVpcmUoJy4uLy4uL21hcHMvSGlnaFJ1bGVEZXNlcnQnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBpZiAoZGF0YS5kYW1hZ2VkUGxheWVySWQgIT09ICgnLyMnICsgdGhpcy5zb2NrZXQuaWQpKVxuICAgICAgICByZXR1cm5cblxuICAgIHRoaXMucGxheWVyLm1ldGEuaGVhbHRoID0gZGF0YS5oZWFsdGhcbiAgICBFdmVudEhhbmRsZXIuZW1pdCgnaGVhbHRoIHVwZGF0ZScsIFN0cmluZyh0aGlzLnBsYXllci5tZXRhLmhlYWx0aCkpXG5cbiAgICBsZXQgc3Bhd25Qb2ludCA9IEhpZ2hSdWxlRGVzZXJ0LmdldFJhbmRvbVNwYXduUG9pbnQuY2FsbCh0aGlzKVxuICAgIHRoaXMucGxheWVyLnggPSBzcGF3blBvaW50LnhcbiAgICB0aGlzLnBsYXllci55ID0gc3Bhd25Qb2ludC55XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IFBsYXllckJ5SWQgPSByZXF1aXJlKCcuLi9QbGF5ZXJCeUlkJylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgbGV0IHJlbW92ZVBsYXllciA9IFBsYXllckJ5SWQuY2FsbCh0aGlzLCBkYXRhLmlkKVxuXG4gICAgLy8gUGxheWVyIG5vdCBmb3VuZFxuICAgIGlmICghcmVtb3ZlUGxheWVyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdQbGF5ZXIgbm90IGZvdW5kOiAnLCBkYXRhLmlkKVxuICAgICAgICByZXR1cm5cbiAgICB9XG5cbiAgICByZW1vdmVQbGF5ZXIucGxheWVyLmtpbGwoKVxuXG4gICAgLy8gUmVtb3ZlIHBsYXllciBmcm9tIGFycmF5XG4gICAgdGhpcy5lbmVtaWVzLnNwbGljZSh0aGlzLmVuZW1pZXMuaW5kZXhPZihyZW1vdmVQbGF5ZXIpLCAxKVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbnZhciBnZXRRdWVyeVN0cmluZyA9IGZ1bmN0aW9uICggZmllbGQsIHVybCApIHtcbiAgICB2YXIgaHJlZiA9IHVybCA/IHVybCA6IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuICAgIHZhciByZWcgPSBuZXcgUmVnRXhwKCAnWz8mXScgKyBmaWVsZCArICc9KFteJiNdKiknLCAnaScgKTtcbiAgICB2YXIgc3RyaW5nID0gcmVnLmV4ZWMoaHJlZik7XG4gICAgcmV0dXJuIHN0cmluZyA/IHN0cmluZ1sxXSA6IG51bGw7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKCdDb25uZWN0ZWQgdG8gc29ja2V0IHNlcnZlcicpXG5cbiAgICAgLy8gUmVzZXQgZW5lbWllcyBvbiByZWNvbm5lY3RcbiAgICB0aGlzLmVuZW1pZXMuZm9yRWFjaChmdW5jdGlvbiAoZW5lbXkpIHtcbiAgICAgICAgaWYgKGVuZW15KSBlbmVteS5raWxsKClcbiAgICB9KVxuXG4gICAgdGhpcy5lbmVtaWVzID0gW11cblxuICAgIC8vIFNlbmQgbG9jYWwgcGxheWVyIGRhdGEgdG8gdGhlIGdhbWUgc2VydmVyXG4gICAgdGhpcy5zb2NrZXQuZW1pdCgnbmV3IHBsYXllcicsIHtcbiAgICAgICAgcm9vbUlkOiBnZXRRdWVyeVN0cmluZygncm9vbUlkJyksXG4gICAgICAgIHg6IHRoaXMucGxheWVyLngsXG4gICAgICAgIHk6IHRoaXMucGxheWVyLnlcbiAgICB9KVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coJ0Rpc2Nvbm5lY3RlZCBmcm9tIHNvY2tldCBzZXJ2ZXInKVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBSZW1vdGVQbGF5ZXIgPSByZXF1aXJlKCcuLi9SZW1vdGVQbGF5ZXInKVxuaW1wb3J0IEV2ZW50SGFuZGxlciBmcm9tICcuLi9FdmVudEhhbmRsZXInXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIGNvbnNvbGUubG9nKCd1cGRhdGUgcGxheWVycycsIGRhdGEpXG5cbiAgICB0aGlzLnJvb21JZCA9IGRhdGEucm9vbS5pZFxuXG4gICAgbGV0IG5ld3VybCA9IHdpbmRvdy5sb2NhdGlvbi5wcm90b2NvbCArIFwiLy9cIiArIHdpbmRvdy5sb2NhdGlvbi5ob3N0ICsgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lICsgJz9yb29tSWQ9JyArIGRhdGEucm9vbS5pZDtcbiAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUoeyBwYXRoOiBuZXd1cmwgfSwgJycsIG5ld3VybCk7XG5cbiAgICB0aGlzLmVuZW1pZXMuZm9yRWFjaChmdW5jdGlvbiAoZW5lbXkpIHtcbiAgICAgICAgZW5lbXkucGxheWVyLmtpbGwoKVxuICAgIH0pXG5cbiAgICB0aGlzLmVuZW1pZXMgPSBbXVxuXG4gICAgRXZlbnRIYW5kbGVyLmVtaXQoJ3BsYXllcnMgdXBkYXRlJywgZGF0YS5yb29tLnBsYXllcnMpXG5cbiAgICBkYXRhLnJvb20ucGxheWVycy5mb3JFYWNoKChwbGF5ZXIpID0+IHtcbiAgICAgICAgaWYgKHBsYXllci5pZCA9PT0gKCcvIycgKyB0aGlzLnNvY2tldC5pZCkpIHtcbiAgICAgICAgICAgIEV2ZW50SGFuZGxlci5lbWl0KCdzY29yZSB1cGRhdGUnLCBTdHJpbmcocGxheWVyLm1ldGEuc2NvcmUpKVxuICAgICAgICAgICAgRXZlbnRIYW5kbGVyLmVtaXQoJ2hlYWx0aCB1cGRhdGUnLCBTdHJpbmcocGxheWVyLm1ldGEuaGVhbHRoKSlcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG5ld1JlbW90ZVBsYXllciA9IFJlbW90ZVBsYXllci5jYWxsKHRoaXMsIHBsYXllci5pZCwgdGhpcy5nYW1lLCB0aGlzLnBsYXllciwgcGxheWVyLngsIHBsYXllci55KVxuICAgICAgICB0aGlzLmVuZW1pZXMucHVzaChuZXdSZW1vdGVQbGF5ZXIpXG4gICAgICAgIHRoaXMuZW5lbWllc1t0aGlzLmVuZW1pZXMubGVuZ3RoIC0gMV0ucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdsZWZ0JywgWzAsIDEsIDIsIDNdLCAxMCwgdHJ1ZSlcbiAgICAgICAgdGhpcy5lbmVtaWVzW3RoaXMuZW5lbWllcy5sZW5ndGggLSAxXS5wbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ3JpZ2h0JywgWzUsIDYsIDcsIDhdLCAxMCwgdHJ1ZSlcbiAgICB9KVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmltcG9ydCBFdmVudEhhbmRsZXIgZnJvbSAnLi4vRXZlbnRIYW5kbGVyJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnNvY2tldC5vbignY29ubmVjdCcsIHRoaXMub25Tb2NrZXRDb25uZWN0ZWQuYmluZCh0aGlzKSlcbiAgICB0aGlzLnNvY2tldC5vbignZGlzY29ubmVjdCcsIHRoaXMub25Tb2NrZXREaXNjb25uZWN0LmJpbmQodGhpcykpXG5cbiAgICB0aGlzLnNvY2tldC5vbigndXBkYXRlIHBsYXllcnMnLCB0aGlzLm9uVXBkYXRlUGxheWVycy5iaW5kKHRoaXMpKVxuICAgIHRoaXMuc29ja2V0Lm9uKCdtb3ZlIHBsYXllcicsIHRoaXMub25Nb3ZlUGxheWVyLmJpbmQodGhpcykpXG4gICAgdGhpcy5zb2NrZXQub24oJ3JlbW92ZSBwbGF5ZXInLCB0aGlzLm9uUmVtb3ZlUGxheWVyLmJpbmQodGhpcykpXG5cbiAgICB0aGlzLnNvY2tldC5vbigncGxheWVyIHJlc3Bhd24nLCB0aGlzLm9uUGxheWVyUmVzcGF3bi5iaW5kKHRoaXMpKVxuICAgIHRoaXMuc29ja2V0Lm9uKCdwbGF5ZXIgZGFtYWdlZCcsIHRoaXMub25QbGF5ZXJEYW1hZ2VkLmJpbmQodGhpcykpXG5cbiAgICB0aGlzLnNvY2tldC5vbignYnVsbGV0IGZpcmVkJywgdGhpcy5vbkJ1bGxldEZpcmVkLmJpbmQodGhpcykpXG4gICAgdGhpcy5zb2NrZXQub24oJ2J1bGxldCByZW1vdmVkJywgdGhpcy5vbkJ1bGxldFJlbW92ZWQuYmluZCh0aGlzKSlcblxuICAgIEV2ZW50SGFuZGxlci5vbigncGxheWVyIHVwZGF0ZSBuaWNrbmFtZScsIChkYXRhKSA9PiB7XG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ3BsYXllciB1cGRhdGUgbmlja25hbWUnLCB7XG4gICAgICAgICAgICByb29tSWQ6IHRoaXMucm9vbUlkLFxuICAgICAgICAgICAgbmlja25hbWU6IGRhdGEubmlja25hbWVcbiAgICAgICAgfSlcbiAgICB9KVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBCdWxsZXQgPSByZXF1aXJlKCcuLi9CdWxsZXQnKVxubGV0IEd1aWQgPSByZXF1aXJlKCcuLi9HdWlkJylcblxubGV0IEFLNDcgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgY29uZmlnLmdhbWUsIGNvbmZpZy5nYW1lLndvcmxkLCAnQUstNDcnLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcblxuICAgIC8vXHRIZXJlIHdlIHNldC11cCBvdXIgYXVkaW8gc3ByaXRlXG4gICAgdGhpcy5meCA9IGNvbmZpZy5nYW1lLmFkZC5hdWRpbygnQUs0Ny1zb3VuZCcpXG4gICAgdGhpcy5hbGxvd011bHRpcGxlID0gdHJ1ZVxuXG4gICAgdGhpcy5kYW1hZ2UgPSAyMlxuICAgIHRoaXMubmV4dEZpcmUgPSAwXG4gICAgdGhpcy5idWxsZXRTcGVlZCA9IDIzMDBcbiAgICB0aGlzLmZpcmVSYXRlID0gMTYwO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA2NDsgaSsrKVxuICAgIHtcbiAgICAgICAgbGV0IGJ1bGxldCA9IG5ldyBCdWxsZXQoY29uZmlnLmdhbWUsICdidWxsZXQxMicsIGNvbmZpZy5zb2NrZXQpXG4gICAgICAgIGJ1bGxldC5idWxsZXRJZCA9IEd1aWQoKVxuICAgICAgICBidWxsZXQuaGVpZ2h0ID0gMlxuICAgICAgICBidWxsZXQud2lkdGggPSA0MFxuICAgICAgICBidWxsZXQuZGFtYWdlID0gMjJcbiAgICAgICAgdGhpcy5hZGQoYnVsbGV0LCB0cnVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xufVxuXG5BSzQ3LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLkdyb3VwLnByb3RvdHlwZSk7XG5BSzQ3LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEFLNDc7XG5cbkFLNDcucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbihwbGF5ZXIsIHNvY2tldCwgcm9vbUlkLCB2b2x1bWUpIHtcbiAgICBpZiAodGhpcy5nYW1lLnRpbWUudGltZSA8IHRoaXMubmV4dEZpcmUpXG4gICAgICAgIHJldHVyblxuXG4gICAgdmFyIHggPSBwbGF5ZXIueCArIDE1O1xuICAgIHZhciB5ID0gcGxheWVyLnkgKyAzMDtcblxuICAgIHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgMCwgc29ja2V0LCByb29tSWQpXG4gICAgdGhpcy5zZXRBbGwoJ3RyYWNraW5nJywgdHJ1ZSlcblxuICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLmdhbWUudGltZS50aW1lICsgdGhpcy5maXJlUmF0ZVxuICAgIHRoaXMuZngudm9sdW1lID0gLjMgKiB2b2x1bWVcbiAgICB0aGlzLmZ4LnBsYXkoKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFLNDdcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgQnVsbGV0ID0gcmVxdWlyZSgnLi4vQnVsbGV0JylcbmxldCBHdWlkID0gcmVxdWlyZSgnLi4vR3VpZCcpXG5cbmxldCBBSzQ3ID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGNvbmZpZy5nYW1lLCBjb25maWcuZ2FtZS53b3JsZCwgJ0FLLTQ3JywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG5cbiAgICAvL1x0SGVyZSB3ZSBzZXQtdXAgb3VyIGF1ZGlvIHNwcml0ZVxuICAgIHRoaXMuZnggPSBjb25maWcuZ2FtZS5hZGQuYXVkaW8oJ0FLNDctc291bmQnKVxuICAgIHRoaXMuYWxsb3dNdWx0aXBsZSA9IHRydWVcblxuICAgIHRoaXMuZGFtYWdlID0gMjJcbiAgICB0aGlzLm5leHRGaXJlID0gMFxuICAgIHRoaXMuYnVsbGV0U3BlZWQgPSAyMzAwXG4gICAgdGhpcy5maXJlUmF0ZSA9IDE2MDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNjQ7IGkrKylcbiAgICB7XG4gICAgICAgIGxldCBidWxsZXQgPSBuZXcgQnVsbGV0KGNvbmZpZy5nYW1lLCAnYnVsbGV0MTInLCBjb25maWcuc29ja2V0KVxuICAgICAgICBidWxsZXQuYnVsbGV0SWQgPSBHdWlkKClcbiAgICAgICAgYnVsbGV0LmhlaWdodCA9IDJcbiAgICAgICAgYnVsbGV0LndpZHRoID0gNDBcbiAgICAgICAgYnVsbGV0LmRhbWFnZSA9IDIyXG4gICAgICAgIHRoaXMuYWRkKGJ1bGxldCwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbn1cblxuQUs0Ny5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuQUs0Ny5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBBSzQ3O1xuXG5BSzQ3LnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24ocGxheWVyLCBzb2NrZXQsIHJvb21JZCwgdm9sdW1lKSB7XG4gICAgaWYgKHRoaXMuZ2FtZS50aW1lLnRpbWUgPCB0aGlzLm5leHRGaXJlKVxuICAgICAgICByZXR1cm5cblxuICAgIHZhciB4ID0gcGxheWVyLnggKyAxNTtcbiAgICB2YXIgeSA9IHBsYXllci55ICsgMzA7XG5cbiAgICB0aGlzLmdldEZpcnN0RXhpc3RzKGZhbHNlKS5maXJlKHgsIHksIDAsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDAsIHNvY2tldCwgcm9vbUlkKVxuICAgIHRoaXMuc2V0QWxsKCd0cmFja2luZycsIHRydWUpXG5cbiAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5nYW1lLnRpbWUudGltZSArIHRoaXMuZmlyZVJhdGVcbiAgICBjb25zb2xlLmxvZyh2b2x1bWUpXG4gICAgY29uc29sZS5sb2coLjMgKiB2b2x1bWUpXG4gICAgdGhpcy5meC52b2x1bWUgPSAuMyAqIHZvbHVtZVxuICAgIHRoaXMuZngucGxheSgpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQUs0N1xuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBCdWxsZXQgPSByZXF1aXJlKCcuLi9CdWxsZXQnKVxubGV0IEd1aWQgPSByZXF1aXJlKCcuLi9HdWlkJylcblxubGV0IEJhcnJldE05MCA9IGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCBjb25maWcuZ2FtZSwgY29uZmlnLmdhbWUud29ybGQsICdCYXJyZXQgTTkwJywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG5cbiAgICAvL1x0SGVyZSB3ZSBzZXQtdXAgb3VyIGF1ZGlvIHNwcml0ZVxuICAgIHRoaXMuZnggPSBjb25maWcuZ2FtZS5hZGQuYXVkaW8oJ0JhcnJldE05MC1zb3VuZCcpXG4gICAgdGhpcy5hbGxvd011bHRpcGxlID0gdHJ1ZVxuXG4gICAgdGhpcy5uYW1lID0gJ0JhcnJldCBNOTAnXG4gICAgdGhpcy5kYW1hZ2UgPSA4OFxuICAgIHRoaXMubmV4dEZpcmUgPSAwXG4gICAgdGhpcy5idWxsZXRTcGVlZCA9IDM0MzVcblxuICAgIC8vIEJhcnJldE05MCBmaXJlcyBhYm91dCA2MDAgYnVsbGV0cyBwZXIgc2Vjb25kXG4gICAgdGhpcy5maXJlUmF0ZSA9IDMwMDBcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNjQ7IGkrKylcbiAgICB7XG4gICAgICAgIGxldCBidWxsZXQgPSBuZXcgQnVsbGV0KGNvbmZpZy5nYW1lLCAnYnVsbGV0MTInLCBjb25maWcuc29ja2V0KVxuICAgICAgICBidWxsZXQuYnVsbGV0SWQgPSBHdWlkKClcbiAgICAgICAgYnVsbGV0LmhlaWdodCA9IDJcbiAgICAgICAgYnVsbGV0LndpZHRoID0gNDBcbiAgICAgICAgYnVsbGV0LmRhbWFnZSA9IDg4XG5cbiAgICAgICAgdGhpcy5hZGQoYnVsbGV0LCB0cnVlKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG59XG5cbkJhcnJldE05MC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuQmFycmV0TTkwLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEJhcnJldE05MDtcblxuQmFycmV0TTkwLnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24gKHBsYXllciwgc29ja2V0LCByb29tSWQpIHtcbiAgICBpZiAodGhpcy5nYW1lLnRpbWUudGltZSA8IHRoaXMubmV4dEZpcmUpXG4gICAgICAgIHJldHVyblxuXG4gICAgdmFyIHggPSBwbGF5ZXIueCArIDE1O1xuICAgIHZhciB5ID0gcGxheWVyLnkgKyAzMDtcblxuICAgIHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgMCwgc29ja2V0LCByb29tSWQpXG4gICAgdGhpcy5zZXRBbGwoJ3RyYWNraW5nJywgdHJ1ZSlcblxuICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLmdhbWUudGltZS50aW1lICsgdGhpcy5maXJlUmF0ZVxuICAgIHRoaXMuZngudm9sdW1lID0gLjZcbiAgICB0aGlzLmZ4LnBsYXkoKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhcnJldE05MFxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBCdWxsZXQgPSByZXF1aXJlKCcuLi9CdWxsZXQnKVxubGV0IEd1aWQgPSByZXF1aXJlKCcuLi9HdWlkJylcblxubGV0IEFLNDcgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgY29uZmlnLmdhbWUsIGNvbmZpZy5nYW1lLndvcmxkLCAnRGVzZXJ0IEVhZ2xlJywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG5cbiAgICAvL1x0SGVyZSB3ZSBzZXQtdXAgb3VyIGF1ZGlvIHNwcml0ZVxuICAgIHRoaXMuZnggPSBjb25maWcuZ2FtZS5hZGQuYXVkaW8oJ0Rlc2VydEVhZ2xlLXNvdW5kJylcbiAgICB0aGlzLmFsbG93TXVsdGlwbGUgPSB0cnVlXG5cbiAgICB0aGlzLmRhbWFnZSA9IDMzXG4gICAgdGhpcy5uZXh0RmlyZSA9IDBcbiAgICB0aGlzLmJ1bGxldFNwZWVkID0gMjMwMFxuICAgIHRoaXMuZmlyZVJhdGUgPSAyNjc7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDY0OyBpKyspXG4gICAge1xuICAgICAgICBsZXQgYnVsbGV0ID0gbmV3IEJ1bGxldChjb25maWcuZ2FtZSwgJ2J1bGxldDEyJywgY29uZmlnLnNvY2tldClcbiAgICAgICAgYnVsbGV0LmJ1bGxldElkID0gR3VpZCgpXG4gICAgICAgIGJ1bGxldC5oZWlnaHQgPSAyXG4gICAgICAgIGJ1bGxldC53aWR0aCA9IDQwXG4gICAgICAgIGJ1bGxldC5kYW1hZ2UgPSAyMlxuICAgICAgICB0aGlzLmFkZChidWxsZXQsIHRydWUpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG59XG5cbkFLNDcucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcbkFLNDcucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQUs0NztcblxuQUs0Ny5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uKHBsYXllciwgc29ja2V0LCByb29tSWQpIHtcbiAgICBpZiAodGhpcy5nYW1lLnRpbWUudGltZSA8IHRoaXMubmV4dEZpcmUpXG4gICAgICAgIHJldHVyblxuXG4gICAgdmFyIHggPSBwbGF5ZXIueCArIDE1O1xuICAgIHZhciB5ID0gcGxheWVyLnkgKyAzMDtcblxuICAgIHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgMCwgc29ja2V0LCByb29tSWQpXG4gICAgdGhpcy5zZXRBbGwoJ3RyYWNraW5nJywgdHJ1ZSlcblxuICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLmdhbWUudGltZS50aW1lICsgdGhpcy5maXJlUmF0ZVxuICAgIHRoaXMuZngudm9sdW1lID0gLjNcbiAgICB0aGlzLmZ4LnBsYXkoKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFLNDdcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgQnVsbGV0ID0gcmVxdWlyZSgnLi4vQnVsbGV0JylcbmxldCBHdWlkID0gcmVxdWlyZSgnLi4vR3VpZCcpXG5cbmxldCBBSzQ3ID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGNvbmZpZy5nYW1lLCBjb25maWcuZ2FtZS53b3JsZCwgJ0FLLTQ3JywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG5cbiAgICAvL1x0SGVyZSB3ZSBzZXQtdXAgb3VyIGF1ZGlvIHNwcml0ZVxuICAgIHRoaXMuZnggPSBjb25maWcuZ2FtZS5hZGQuYXVkaW8oJ0FLNDctc291bmQnKVxuICAgIHRoaXMuYWxsb3dNdWx0aXBsZSA9IHRydWVcblxuICAgIHRoaXMuZGFtYWdlID0gMjJcbiAgICB0aGlzLm5leHRGaXJlID0gMFxuICAgIHRoaXMuYnVsbGV0U3BlZWQgPSAyMzAwXG4gICAgdGhpcy5maXJlUmF0ZSA9IDE2MDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNjQ7IGkrKylcbiAgICB7XG4gICAgICAgIGxldCBidWxsZXQgPSBuZXcgQnVsbGV0KGNvbmZpZy5nYW1lLCAnYnVsbGV0MTInLCBjb25maWcuc29ja2V0KVxuICAgICAgICBidWxsZXQuYnVsbGV0SWQgPSBHdWlkKClcbiAgICAgICAgYnVsbGV0LmhlaWdodCA9IDJcbiAgICAgICAgYnVsbGV0LndpZHRoID0gNDBcbiAgICAgICAgYnVsbGV0LmRhbWFnZSA9IDIyXG4gICAgICAgIHRoaXMuYWRkKGJ1bGxldCwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbn1cblxuQUs0Ny5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuQUs0Ny5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBBSzQ3O1xuXG5BSzQ3LnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24ocGxheWVyLCBzb2NrZXQsIHJvb21JZCwgdm9sdW1lKSB7XG4gICAgaWYgKHRoaXMuZ2FtZS50aW1lLnRpbWUgPCB0aGlzLm5leHRGaXJlKVxuICAgICAgICByZXR1cm5cblxuICAgIHZhciB4ID0gcGxheWVyLnggKyAxNTtcbiAgICB2YXIgeSA9IHBsYXllci55ICsgMzA7XG5cbiAgICB0aGlzLmdldEZpcnN0RXhpc3RzKGZhbHNlKS5maXJlKHgsIHksIDAsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDAsIHNvY2tldCwgcm9vbUlkKVxuICAgIHRoaXMuc2V0QWxsKCd0cmFja2luZycsIHRydWUpXG5cbiAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5nYW1lLnRpbWUudGltZSArIHRoaXMuZmlyZVJhdGVcbiAgICBjb25zb2xlLmxvZyh2b2x1bWUpXG4gICAgY29uc29sZS5sb2coLjMgKiB2b2x1bWUpXG4gICAgdGhpcy5meC52b2x1bWUgPSAuMyAqIHZvbHVtZVxuICAgIHRoaXMuZngucGxheSgpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQUs0N1xuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBCdWxsZXQgPSByZXF1aXJlKCcuLi9CdWxsZXQnKVxubGV0IEd1aWQgPSByZXF1aXJlKCcuLi9HdWlkJylcblxubGV0IEFLNDcgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgY29uZmlnLmdhbWUsIGNvbmZpZy5nYW1lLndvcmxkLCAnTTRBMScsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuXG4gICAgLy9cdEhlcmUgd2Ugc2V0LXVwIG91ciBhdWRpbyBzcHJpdGVcbiAgICB0aGlzLmZ4ID0gY29uZmlnLmdhbWUuYWRkLmF1ZGlvKCdNNEExLXNvdW5kJylcbiAgICB0aGlzLmFsbG93TXVsdGlwbGUgPSB0cnVlXG5cbiAgICB0aGlzLmRhbWFnZSA9IDIwXG4gICAgdGhpcy5uZXh0RmlyZSA9IDBcbiAgICB0aGlzLmJ1bGxldFNwZWVkID0gMjQwMFxuICAgIHRoaXMuZmlyZVJhdGUgPSAxNTA7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDY0OyBpKyspXG4gICAge1xuICAgICAgICBsZXQgYnVsbGV0ID0gbmV3IEJ1bGxldChjb25maWcuZ2FtZSwgJ2J1bGxldDEyJywgY29uZmlnLnNvY2tldClcbiAgICAgICAgYnVsbGV0LmJ1bGxldElkID0gR3VpZCgpXG4gICAgICAgIGJ1bGxldC5oZWlnaHQgPSAyXG4gICAgICAgIGJ1bGxldC53aWR0aCA9IDQwXG4gICAgICAgIGJ1bGxldC5kYW1hZ2UgPSAyMlxuICAgICAgICB0aGlzLmFkZChidWxsZXQsIHRydWUpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG59XG5cbkFLNDcucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcbkFLNDcucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQUs0NztcblxuQUs0Ny5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uKHBsYXllciwgc29ja2V0LCByb29tSWQpIHtcbiAgICBpZiAodGhpcy5nYW1lLnRpbWUudGltZSA8IHRoaXMubmV4dEZpcmUpXG4gICAgICAgIHJldHVyblxuXG4gICAgdmFyIHggPSBwbGF5ZXIueCArIDE1O1xuICAgIHZhciB5ID0gcGxheWVyLnkgKyAzMDtcblxuICAgIHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgMCwgc29ja2V0LCByb29tSWQpXG4gICAgdGhpcy5zZXRBbGwoJ3RyYWNraW5nJywgdHJ1ZSlcblxuICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLmdhbWUudGltZS50aW1lICsgdGhpcy5maXJlUmF0ZVxuICAgIHRoaXMuZngudm9sdW1lID0gLjNcbiAgICB0aGlzLmZ4LnBsYXkoKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFLNDdcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgQnVsbGV0ID0gcmVxdWlyZSgnLi4vQnVsbGV0JylcbmxldCBHdWlkID0gcmVxdWlyZSgnLi4vR3VpZCcpXG5cbmxldCBTcGFzMTIgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgY29uZmlnLmdhbWUsIGNvbmZpZy5nYW1lLndvcmxkLCAnU3Bhcy0xMicsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpXG5cbiAgICB0aGlzLm5leHRGaXJlID0gMFxuICAgIHRoaXMuYnVsbGV0U3BlZWQgPSAxOTAwXG4gICAgdGhpcy5maXJlUmF0ZSA9IDUwMFxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzMjsgaSsrKVxuICAgIHtcbiAgICAgICAgbGV0IGJ1bGxldCA9IG5ldyBCdWxsZXQoY29uZmlnLmdhbWUsICdidWxsZXQxMicsIGNvbmZpZy5zb2NrZXQpXG4gICAgICAgIGJ1bGxldC5idWxsZXRJZCA9IEd1aWQoKVxuICAgICAgICBidWxsZXQuaGVpZ2h0ID0gMlxuICAgICAgICBidWxsZXQud2lkdGggPSA0MFxuICAgICAgICBidWxsZXQuZGFtYWdlID0gMjJcbiAgICAgICAgdGhpcy5hZGQoYnVsbGV0LCB0cnVlKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG59XG5cblNwYXMxMi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpXG5TcGFzMTIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU3BhczEyXG5cblNwYXMxMi5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uIChwbGF5ZXIsIHNvY2tldCwgcm9vbUlkKSB7XG4gICAgaWYgKHRoaXMuZ2FtZS50aW1lLnRpbWUgPCB0aGlzLm5leHRGaXJlKVxuICAgICAgICByZXR1cm5cblxuXG5cblxuXG4gICAgdmFyIHggPSBwbGF5ZXIueCArIDE1XG4gICAgdmFyIHkgPSBwbGF5ZXIueSArIDMwXG5cblxuXG4gICAgdmFyIGJ1bGxldEluc3RhbmNlID0gdGhpcy5nZXRGaXJzdEV4aXN0cyhmYWxzZSlcbiAgICBpZiAoIWJ1bGxldEluc3RhbmNlKSByZXR1cm5cbiAgICBidWxsZXRJbnN0YW5jZS5maXJlKHgsIHksIC4zLCB0aGlzLmJ1bGxldFNwZWVkLCAwLCAwLCBzb2NrZXQsIHJvb21JZClcblxuXG5cblxuICAgIGJ1bGxldEluc3RhbmNlID0gdGhpcy5nZXRGaXJzdEV4aXN0cyhmYWxzZSlcbiAgICBpZiAoIWJ1bGxldEluc3RhbmNlKSByZXR1cm5cbiAgICBidWxsZXRJbnN0YW5jZS5maXJlKHgsIHksIC0wLjMsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDAsIHNvY2tldCwgcm9vbUlkKVxuXG5cblxuICAgIGJ1bGxldEluc3RhbmNlID0gdGhpcy5nZXRGaXJzdEV4aXN0cyhmYWxzZSlcbiAgICBpZiAoIWJ1bGxldEluc3RhbmNlKSByZXR1cm5cbiAgICBidWxsZXRJbnN0YW5jZS5maXJlKHgsIHksIDAsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDAsIHNvY2tldCwgcm9vbUlkKVxuXG5cblxuXG5cbiAgICBidWxsZXRJbnN0YW5jZSA9IHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpXG4gICAgaWYgKCFidWxsZXRJbnN0YW5jZSkgcmV0dXJuXG4gICAgYnVsbGV0SW5zdGFuY2UuZmlyZSh4LCB5LCAwLCB0aGlzLmJ1bGxldFNwZWVkLCAwLCAwLCBzb2NrZXQsIHJvb21JZClcblxuXG5cblxuICAgIHRoaXMuc2V0QWxsKCd0cmFja2luZycsIHRydWUpXG5cbiAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5nYW1lLnRpbWUudGltZSArIHRoaXMuZmlyZVJhdGVcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTcGFzMTJcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgQnVsbGV0ID0gcmVxdWlyZSgnLi4vQnVsbGV0JylcbmxldCBHdWlkID0gcmVxdWlyZSgnLi4vR3VpZCcpXG5cbmxldCBBSzQ3ID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGNvbmZpZy5nYW1lLCBjb25maWcuZ2FtZS53b3JsZCwgJ0FLLTQ3JywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG5cbiAgICAvL1x0SGVyZSB3ZSBzZXQtdXAgb3VyIGF1ZGlvIHNwcml0ZVxuICAgIHRoaXMuZnggPSBjb25maWcuZ2FtZS5hZGQuYXVkaW8oJ0FLNDctc291bmQnKVxuICAgIHRoaXMuYWxsb3dNdWx0aXBsZSA9IHRydWVcblxuICAgIHRoaXMuZGFtYWdlID0gMjJcbiAgICB0aGlzLm5leHRGaXJlID0gMFxuICAgIHRoaXMuYnVsbGV0U3BlZWQgPSAyMzAwXG4gICAgdGhpcy5maXJlUmF0ZSA9IDE2MDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNjQ7IGkrKylcbiAgICB7XG4gICAgICAgIGxldCBidWxsZXQgPSBuZXcgQnVsbGV0KGNvbmZpZy5nYW1lLCAnYnVsbGV0MTInLCBjb25maWcuc29ja2V0KVxuICAgICAgICBidWxsZXQuYnVsbGV0SWQgPSBHdWlkKClcbiAgICAgICAgYnVsbGV0LmhlaWdodCA9IDJcbiAgICAgICAgYnVsbGV0LndpZHRoID0gNDBcbiAgICAgICAgYnVsbGV0LmRhbWFnZSA9IDIyXG4gICAgICAgIHRoaXMuYWRkKGJ1bGxldCwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbn1cblxuQUs0Ny5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuQUs0Ny5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBBSzQ3O1xuXG5BSzQ3LnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24ocGxheWVyLCBzb2NrZXQsIHJvb21JZCwgdm9sdW1lKSB7XG4gICAgaWYgKHRoaXMuZ2FtZS50aW1lLnRpbWUgPCB0aGlzLm5leHRGaXJlKVxuICAgICAgICByZXR1cm5cblxuICAgIHZhciB4ID0gcGxheWVyLnggKyAxNTtcbiAgICB2YXIgeSA9IHBsYXllci55ICsgMzA7XG5cbiAgICB0aGlzLmdldEZpcnN0RXhpc3RzKGZhbHNlKS5maXJlKHgsIHksIDAsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDAsIHNvY2tldCwgcm9vbUlkKVxuICAgIHRoaXMuc2V0QWxsKCd0cmFja2luZycsIHRydWUpXG5cbiAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5nYW1lLnRpbWUudGltZSArIHRoaXMuZmlyZVJhdGVcbiAgICBjb25zb2xlLmxvZyh2b2x1bWUpXG4gICAgY29uc29sZS5sb2coLjMgKiB2b2x1bWUpXG4gICAgdGhpcy5meC52b2x1bWUgPSAuMyAqIHZvbHVtZVxuICAgIHRoaXMuZngucGxheSgpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQUs0N1xuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBCdWxsZXQgPSByZXF1aXJlKCcuLi9CdWxsZXQnKVxubGV0IEd1aWQgPSByZXF1aXJlKCcuLi9HdWlkJylcblxubGV0IEFLNDcgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgY29uZmlnLmdhbWUsIGNvbmZpZy5nYW1lLndvcmxkLCAnQUstNDcnLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcblxuICAgIC8vXHRIZXJlIHdlIHNldC11cCBvdXIgYXVkaW8gc3ByaXRlXG4gICAgdGhpcy5meCA9IGNvbmZpZy5nYW1lLmFkZC5hdWRpbygnQUs0Ny1zb3VuZCcpXG4gICAgdGhpcy5hbGxvd011bHRpcGxlID0gdHJ1ZVxuXG4gICAgdGhpcy5kYW1hZ2UgPSAyMlxuICAgIHRoaXMubmV4dEZpcmUgPSAwXG4gICAgdGhpcy5idWxsZXRTcGVlZCA9IDIzMDBcbiAgICB0aGlzLmZpcmVSYXRlID0gMTYwO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA2NDsgaSsrKVxuICAgIHtcbiAgICAgICAgbGV0IGJ1bGxldCA9IG5ldyBCdWxsZXQoY29uZmlnLmdhbWUsICdidWxsZXQxMicsIGNvbmZpZy5zb2NrZXQpXG4gICAgICAgIGJ1bGxldC5idWxsZXRJZCA9IEd1aWQoKVxuICAgICAgICBidWxsZXQuaGVpZ2h0ID0gMlxuICAgICAgICBidWxsZXQud2lkdGggPSA0MFxuICAgICAgICBidWxsZXQuZGFtYWdlID0gMjJcbiAgICAgICAgdGhpcy5hZGQoYnVsbGV0LCB0cnVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xufVxuXG5BSzQ3LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLkdyb3VwLnByb3RvdHlwZSk7XG5BSzQ3LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEFLNDc7XG5cbkFLNDcucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbihwbGF5ZXIsIHNvY2tldCwgcm9vbUlkLCB2b2x1bWUpIHtcbiAgICBpZiAodGhpcy5nYW1lLnRpbWUudGltZSA8IHRoaXMubmV4dEZpcmUpXG4gICAgICAgIHJldHVyblxuXG4gICAgdmFyIHggPSBwbGF5ZXIueCArIDE1O1xuICAgIHZhciB5ID0gcGxheWVyLnkgKyAzMDtcblxuICAgIHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgMCwgc29ja2V0LCByb29tSWQpXG4gICAgdGhpcy5zZXRBbGwoJ3RyYWNraW5nJywgdHJ1ZSlcblxuICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLmdhbWUudGltZS50aW1lICsgdGhpcy5maXJlUmF0ZVxuICAgIHRoaXMuZngudm9sdW1lID0gLjMgKiB2b2x1bWVcbiAgICB0aGlzLmZ4LnBsYXkoKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFLNDdcblxuXG4vL1xuLy8gLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gLy8gIFJQRyB0aGF0IHZpc3VhbGx5IHRyYWNrIHRoZSBkaXJlY3Rpb24gdGhleSdyZSBoZWFkaW5nIGluIC8vXG4vLyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vL1xuLy8gV2VhcG9uLlJQRyA9IGZ1bmN0aW9uIChnYW1lKSB7XG4vL1xuLy8gICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGdhbWUsIGdhbWUud29ybGQsICdSUEcnLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcbi8vXG4vLyAgICAgdGhpcy5uZXh0RmlyZSA9IDA7XG4vLyAgICAgdGhpcy5idWxsZXRTcGVlZCA9IDQwMDtcbi8vICAgICB0aGlzLmZpcmVSYXRlID0gMjUwO1xuLy9cbi8vICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDMyOyBpKyspXG4vLyAgICAge1xuLy8gICAgICAgICB0aGlzLmFkZChuZXcgQnVsbGV0KGdhbWUsICdidWxsZXQxMCcpLCB0cnVlKTtcbi8vICAgICB9XG4vL1xuLy8gICAgIHRoaXMuc2V0QWxsKCd0cmFja2luZycsIHRydWUpXG4vL1xuLy8gICAgIHJldHVybiB0aGlzO1xuLy9cbi8vIH07XG4vL1xuLy8gV2VhcG9uLlJQRy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuLy8gV2VhcG9uLlJQRy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBXZWFwb24uUlBHO1xuLy9cbi8vIFdlYXBvbi5SUEcucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbiAoc291cmNlKSB7XG4vL1xuLy8gICAgIGlmICh0aGlzLmdhbWUudGltZS50aW1lIDwgdGhpcy5uZXh0RmlyZSkgeyByZXR1cm47IH1cbi8vXG4vLyAgICAgdmFyIHggPSBzb3VyY2UueCArIDEwO1xuLy8gICAgIHZhciB5ID0gc291cmNlLnkgKyAxMDtcbi8vXG4vLyAgICAgdGhpcy5nZXRGaXJzdEV4aXN0cyhmYWxzZSkuZmlyZSh4LCB5LCAwLCB0aGlzLmJ1bGxldFNwZWVkLCAwLCAtNzAwKTtcbi8vICAgICB0aGlzLmdldEZpcnN0RXhpc3RzKGZhbHNlKS5maXJlKHgsIHksIDAsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDcwMCk7XG4vL1xuLy8gICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLmdhbWUudGltZS50aW1lICsgdGhpcy5maXJlUmF0ZTtcbi8vXG4vLyB9O1xuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBCdWxsZXQgPSByZXF1aXJlKCcuLi9CdWxsZXQnKVxubGV0IEd1aWQgPSByZXF1aXJlKCcuLi9HdWlkJylcblxubGV0IEFLNDcgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgY29uZmlnLmdhbWUsIGNvbmZpZy5nYW1lLndvcmxkLCAnQUstNDcnLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcblxuICAgIC8vXHRIZXJlIHdlIHNldC11cCBvdXIgYXVkaW8gc3ByaXRlXG4gICAgdGhpcy5meCA9IGNvbmZpZy5nYW1lLmFkZC5hdWRpbygnQUs0Ny1zb3VuZCcpXG4gICAgdGhpcy5hbGxvd011bHRpcGxlID0gdHJ1ZVxuXG4gICAgdGhpcy5kYW1hZ2UgPSAyMlxuICAgIHRoaXMubmV4dEZpcmUgPSAwXG4gICAgdGhpcy5idWxsZXRTcGVlZCA9IDIzMDBcbiAgICB0aGlzLmZpcmVSYXRlID0gMTYwO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA2NDsgaSsrKVxuICAgIHtcbiAgICAgICAgbGV0IGJ1bGxldCA9IG5ldyBCdWxsZXQoY29uZmlnLmdhbWUsICdidWxsZXQxMicsIGNvbmZpZy5zb2NrZXQpXG4gICAgICAgIGJ1bGxldC5idWxsZXRJZCA9IEd1aWQoKVxuICAgICAgICBidWxsZXQuaGVpZ2h0ID0gMlxuICAgICAgICBidWxsZXQud2lkdGggPSA0MFxuICAgICAgICBidWxsZXQuZGFtYWdlID0gMjJcbiAgICAgICAgdGhpcy5hZGQoYnVsbGV0LCB0cnVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xufVxuXG5BSzQ3LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLkdyb3VwLnByb3RvdHlwZSk7XG5BSzQ3LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEFLNDc7XG5cbkFLNDcucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbihwbGF5ZXIsIHNvY2tldCwgcm9vbUlkLCB2b2x1bWUpIHtcbiAgICBpZiAodGhpcy5nYW1lLnRpbWUudGltZSA8IHRoaXMubmV4dEZpcmUpXG4gICAgICAgIHJldHVyblxuXG4gICAgdmFyIHggPSBwbGF5ZXIueCArIDE1O1xuICAgIHZhciB5ID0gcGxheWVyLnkgKyAzMDtcblxuICAgIHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgMCwgc29ja2V0LCByb29tSWQpXG4gICAgdGhpcy5zZXRBbGwoJ3RyYWNraW5nJywgdHJ1ZSlcblxuICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLmdhbWUudGltZS50aW1lICsgdGhpcy5maXJlUmF0ZVxuICAgIHRoaXMuZngudm9sdW1lID0gLjMgKiB2b2x1bWVcbiAgICB0aGlzLmZ4LnBsYXkoKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFLNDdcbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBcIkFLNDdcIjogcmVxdWlyZSgnLi9BSzQ3JyksXG4gICAgXCJCYXJyZXR0XCI6IHJlcXVpcmUoJy4vQmFycmV0dCcpLFxuICAgIFwiRGVzZXJ0RWFnbGVcIjogcmVxdWlyZSgnLi9EZXNlcnRFYWdsZScpLFxuICAgIFwiTTRBMVwiOiByZXF1aXJlKCcuL000QTEnKSxcbiAgICBcIk01MDBcIjogcmVxdWlyZSgnLi9NNTAwJyksXG4gICAgXCJTa29ycGlvblwiOiByZXF1aXJlKCcuL1Nrb3JwaW9uJyksXG4gICAgXCJBdWdcIjogcmVxdWlyZSgnLi9BdWcnKSxcbiAgICBcIlJQR1wiOiByZXF1aXJlKCcuL1JQRycpLFxuICAgIFwiUDkwXCI6IHJlcXVpcmUoJy4vUDkwJyksXG4gICAgXCJHNDNcIjogcmVxdWlyZSgnLi9HNDMnKVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBIaWdoUnVsZURlc2VydCA9IHt9XG5cbkhpZ2hSdWxlRGVzZXJ0LmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc3Bhd25Qb2ludHMgPSBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIHg6IDUwMCxcbiAgICAgICAgICAgIHk6IHRoaXMud29ybGQuaGVpZ2h0IC0gMjMwMFxuICAgICAgICB9LFxuICAgICAgICAvLyB7XG4gICAgICAgIC8vICAgICB4OiAyMDAsXG4gICAgICAgIC8vICAgICB5OiB0aGlzLndvcmxkLmhlaWdodCAtIDIwMFxuICAgICAgICAvLyB9LFxuICAgICAgICAvLyB7XG4gICAgICAgIC8vICAgICB4OiAzNzUwLFxuICAgICAgICAvLyAgICAgeTogdGhpcy53b3JsZC5oZWlnaHQgLSAyMDBcbiAgICAgICAgLy8gfSxcbiAgICAgICAgLy8ge1xuICAgICAgICAvLyAgICAgeDogMzQ1MCxcbiAgICAgICAgLy8gICAgIHk6IHRoaXMud29ybGQuaGVpZ2h0IC0gNzAwXG4gICAgICAgIC8vIH0sXG4gICAgICAgIC8vIHtcbiAgICAgICAgLy8gICAgIHg6IDI2MDAsXG4gICAgICAgIC8vICAgICB5OiB0aGlzLndvcmxkLmhlaWdodCAtIDgwMFxuICAgICAgICAvLyB9LFxuICAgICAgICAvLyB7XG4gICAgICAgIC8vICAgICB4OiAxMjUwLFxuICAgICAgICAvLyAgICAgeTogdGhpcy53b3JsZC5oZWlnaHQgLSA4MDBcbiAgICAgICAgLy8gfVxuICAgIF1cblxuICAgIEhpZ2hSdWxlRGVzZXJ0LmNyZWF0ZVNreVNwcml0ZS5jYWxsKHRoaXMpXG4gICAgSGlnaFJ1bGVEZXNlcnQuY3JlYXRlUGxhdGZvcm1zLmNhbGwodGhpcylcbiAgICBIaWdoUnVsZURlc2VydC5jcmVhdGVMZWRnZXMuY2FsbCh0aGlzKVxuXG4gICAgdGhpcy5wbGF0Zm9ybXMuc2V0QWxsKCdib2R5LmltbW92YWJsZScsIHRydWUpXG4gICAgdGhpcy5wbGF0Zm9ybXMuc2V0QWxsKCdib2R5LmFsbG93R3Jhdml0eScsIGZhbHNlKVxufVxuXG5IaWdoUnVsZURlc2VydC5jcmVhdGVTa3lTcHJpdGUgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgc2t5c3ByaXRlID0gdGhpcy5hZGQudGlsZVNwcml0ZSgwLCB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gMzkzMCwgdGhpcy5nYW1lLndvcmxkLndpZHRoLCB0aGlzLmdhbWUud29ybGQuaGVpZ2h0LCAnbWFwLWJnJylcbn1cblxuSGlnaFJ1bGVEZXNlcnQuY3JlYXRlUGxhdGZvcm1zID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wbGF0Zm9ybXMgPSB0aGlzLmFkZC5ncm91cCgpXG4gICAgdGhpcy5wbGF0Zm9ybXMuZW5hYmxlQm9keSA9IHRydWVcbn1cblxuSGlnaFJ1bGVEZXNlcnQuZ2V0UmFuZG9tU3Bhd25Qb2ludCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBfLnNhbXBsZSh0aGlzLnNwYXduUG9pbnRzKVxufVxuXG5IaWdoUnVsZURlc2VydC5jcmVhdGVMZWRnZXMgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgbGVkZ2VzID0gW1xuICAgICAgICAvLyB7eCwgeSwgd2lkdGgsIGhlaWdodH1cblxuICAgICAgICAvLyBTdGFydGluZyBMZWRnZXNcbiAgICAgICAgeyBpZDogMSwgeDogMCwgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDQzMSwgd2lkdGg6IDEyOCwgaGVpZ2h0OiA5MiB9LCAvLyBMZWZ0IGJvdHRvbSBsZWRnZVxuICAgICAgICB7IGlkOiAyLCB4OiAwLCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gODM4LCB3aWR0aDogMTI4LCBoZWlnaHQ6IDkyIH0sIC8vIExlZnQgdG9wIGxlZGdlXG5cbiAgICAgICAgeyBpZDogMywgeDogMzg3MiwgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDQyNywgd2lkdGg6IDEyOCwgaGVpZ2h0OiA5MiB9LCAvLyBSaWdodCBib3R0b20gbGVkZ2VcbiAgICAgICAgeyBpZDogNCwgeDogMzg3MiwgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDgzNSwgd2lkdGg6IDEyOCwgaGVpZ2h0OiA5MiB9LCAvLyBSaWdodCB0b3AgbGVkZ2VcblxuICAgICAgICAvLyBHcm91bmQgTGVkZ2VzXG4gICAgICAgIHsgaWQ6IDUsIHg6IDM2MywgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDIxMDUsIHdpZHRoOiAxMTUwLCBoZWlnaHQ6IDMwMCB9LCAvLyBNYWluIGJvdHRvbSBzdGFydGluZyBsZWZ0IGxlZGdlXG4gICAgICAgIHsgaWQ6IDYsIHg6IDE1MTAsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSAyMTg1LCB3aWR0aDogMjcwLCBoZWlnaHQ6IDI2MCB9LCAvLyBNYWluIGJvdHRvbSBsZWZ0IGxlZGdlXG4gICAgICAgIHsgaWQ6IDcsIHg6IDE1MTAsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSAyMTg1LCB3aWR0aDogMjcwLCBoZWlnaHQ6IDI2MCB9LCAvLyBNYWluIGJvdHRvbSBsZWZ0IGxlZGdlXG4gICAgICAgIHsgaWQ6IDgsIHg6IDI5MDAsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSAyNTYsIHdpZHRoOiA2NDEsIGhlaWdodDogMjYwIH0sIC8vIE1haW4gYm90dG9tIHJpZ2h0IGxlZGdlXG4gICAgICAgIHsgaWQ6IDksIHg6IDM1NDAsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSAxMjgsIHdpZHRoOiA0NzQsIGhlaWdodDogMTI4IH0sIC8vIE1haW4gYm90dG9tIHN0YXJ0aW5nIHJpZ2h0IGxlZGdlXG5cbiAgICAgICAgLy8gQWlyIExlZGdlc1xuICAgICAgICB7IGlkOiAxMCwgeDogMzAwLCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gNjA4LCB3aWR0aDogNjQxLCBoZWlnaHQ6IDkyIH0sXG4gICAgICAgIHsgaWQ6IDExLCB4OiAxMTEwLCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gNzAxLCB3aWR0aDogNTEzLCBoZWlnaHQ6IDkyIH0sXG4gICAgICAgIHsgaWQ6IDEyLCB4OiA4NzAsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSA5ODIsIHdpZHRoOiAyNTYsIGhlaWdodDogOTIgfSxcbiAgICAgICAgeyBpZDogMTMsIHg6IDE3NDQsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSAxNDc0LCB3aWR0aDogNTA3LCBoZWlnaHQ6IDI1NCB9LFxuICAgICAgICB7IGlkOiAxNCwgeDogMjM5MCwgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDY4OSwgd2lkdGg6IDUxMywgaGVpZ2h0OiA5MiB9LFxuICAgICAgICB7IGlkOiAxNSwgeDogMzAzMSwgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDYwOCwgd2lkdGg6IDY0MSwgaGVpZ2h0OiA5MiB9LFxuICAgICAgICB7IGlkOiAxNiwgeDogMjkwMywgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDk1Nywgd2lkdGg6IDI1NiwgaGVpZ2h0OiA5MiB9LFxuXG4gICAgICAgIC8vIEJveGVzXG4gICAgICAgIHsgaWQ6IDE3LCB4OiA3MTcsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSA2ODUsIHdpZHRoOiAxNTQsIGhlaWdodDogNzcgfSxcbiAgICAgICAgeyBpZDogMTgsIHg6IDc1NywgeTogdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIDc2Miwgd2lkdGg6IDc3LCBoZWlnaHQ6IDc3IH0sXG4gICAgICAgIHsgaWQ6IDE5LCB4OiAxNDE4LCB5OiB0aGlzLmdhbWUud29ybGQuaGVpZ2h0IC0gNzc4LCB3aWR0aDogNzcsIGhlaWdodDogNzcgfSxcbiAgICAgICAgeyBpZDogMjAsIHg6IDE5MzEsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSA0NjEsIHdpZHRoOiAxNTQsIGhlaWdodDogNzcgfSxcbiAgICAgICAgeyBpZDogMjEsIHg6IDMyMDUsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSA2ODUsIHdpZHRoOiAxNTQsIGhlaWdodDogNzcgfSxcbiAgICAgICAgeyBpZDogMjIsIHg6IDMyNDUsIHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSA3NjIsIHdpZHRoOiA3NywgaGVpZ2h0OiA3NyB9XG4gICAgXVxuXG4gICAgbGVkZ2VzLmZvckVhY2goKGxlZGdlKSA9PiB7XG4gICAgICAgIHZhciBuZXdMZWRnZSA9IHRoaXMucGxhdGZvcm1zLmNyZWF0ZShsZWRnZS54LCBsZWRnZS55LCAnZ3JvdW5kJylcbiAgICAgICAgLy8gdmFyIG5ld0xlZGdlID0gdGhpcy5wbGF0Zm9ybXMuY3JlYXRlKGxlZGdlLngsIGxlZGdlLnkpXG4gICAgICAgIG5ld0xlZGdlLmhlaWdodCA9IGxlZGdlLmhlaWdodFxuICAgICAgICBuZXdMZWRnZS53aWR0aCA9IGxlZGdlLndpZHRoXG5cbiAgICAgICAgLy8gRGVidWcgc3R1ZmZcbiAgICAgICAgbmV3TGVkZ2UuYWxwaGEgPSAwLjJcbiAgICAgICAgbGV0IHN0eWxlID0geyBmb250OiBcIjIwcHggQXJpYWxcIiwgZmlsbDogXCIjZmYwMDQ0XCIsIGFsaWduOiBcImNlbnRlclwiLCBiYWNrZ3JvdW5kQ29sb3I6IFwiI2ZmZmYwMFwiIH1cbiAgICAgICAgbGV0IHRleHQgPSB0aGlzLmdhbWUuYWRkLnRleHQobGVkZ2UueCwgbGVkZ2UueSwgbGVkZ2UuaWQsIHN0eWxlKVxuICAgICAgICB0ZXh0LmFscGhhID0gMC4yXG4gICAgfSlcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBIaWdoUnVsZURlc2VydFxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYXNzaWduICAgICAgICA9IHJlcXVpcmUoJ2VzNS1leHQvb2JqZWN0L2Fzc2lnbicpXG4gICwgbm9ybWFsaXplT3B0cyA9IHJlcXVpcmUoJ2VzNS1leHQvb2JqZWN0L25vcm1hbGl6ZS1vcHRpb25zJylcbiAgLCBpc0NhbGxhYmxlICAgID0gcmVxdWlyZSgnZXM1LWV4dC9vYmplY3QvaXMtY2FsbGFibGUnKVxuICAsIGNvbnRhaW5zICAgICAgPSByZXF1aXJlKCdlczUtZXh0L3N0cmluZy8jL2NvbnRhaW5zJylcblxuICAsIGQ7XG5cbmQgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChkc2NyLCB2YWx1ZS8qLCBvcHRpb25zKi8pIHtcblx0dmFyIGMsIGUsIHcsIG9wdGlvbnMsIGRlc2M7XG5cdGlmICgoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHx8ICh0eXBlb2YgZHNjciAhPT0gJ3N0cmluZycpKSB7XG5cdFx0b3B0aW9ucyA9IHZhbHVlO1xuXHRcdHZhbHVlID0gZHNjcjtcblx0XHRkc2NyID0gbnVsbDtcblx0fSBlbHNlIHtcblx0XHRvcHRpb25zID0gYXJndW1lbnRzWzJdO1xuXHR9XG5cdGlmIChkc2NyID09IG51bGwpIHtcblx0XHRjID0gdyA9IHRydWU7XG5cdFx0ZSA9IGZhbHNlO1xuXHR9IGVsc2Uge1xuXHRcdGMgPSBjb250YWlucy5jYWxsKGRzY3IsICdjJyk7XG5cdFx0ZSA9IGNvbnRhaW5zLmNhbGwoZHNjciwgJ2UnKTtcblx0XHR3ID0gY29udGFpbnMuY2FsbChkc2NyLCAndycpO1xuXHR9XG5cblx0ZGVzYyA9IHsgdmFsdWU6IHZhbHVlLCBjb25maWd1cmFibGU6IGMsIGVudW1lcmFibGU6IGUsIHdyaXRhYmxlOiB3IH07XG5cdHJldHVybiAhb3B0aW9ucyA/IGRlc2MgOiBhc3NpZ24obm9ybWFsaXplT3B0cyhvcHRpb25zKSwgZGVzYyk7XG59O1xuXG5kLmdzID0gZnVuY3Rpb24gKGRzY3IsIGdldCwgc2V0LyosIG9wdGlvbnMqLykge1xuXHR2YXIgYywgZSwgb3B0aW9ucywgZGVzYztcblx0aWYgKHR5cGVvZiBkc2NyICE9PSAnc3RyaW5nJykge1xuXHRcdG9wdGlvbnMgPSBzZXQ7XG5cdFx0c2V0ID0gZ2V0O1xuXHRcdGdldCA9IGRzY3I7XG5cdFx0ZHNjciA9IG51bGw7XG5cdH0gZWxzZSB7XG5cdFx0b3B0aW9ucyA9IGFyZ3VtZW50c1szXTtcblx0fVxuXHRpZiAoZ2V0ID09IG51bGwpIHtcblx0XHRnZXQgPSB1bmRlZmluZWQ7XG5cdH0gZWxzZSBpZiAoIWlzQ2FsbGFibGUoZ2V0KSkge1xuXHRcdG9wdGlvbnMgPSBnZXQ7XG5cdFx0Z2V0ID0gc2V0ID0gdW5kZWZpbmVkO1xuXHR9IGVsc2UgaWYgKHNldCA9PSBudWxsKSB7XG5cdFx0c2V0ID0gdW5kZWZpbmVkO1xuXHR9IGVsc2UgaWYgKCFpc0NhbGxhYmxlKHNldCkpIHtcblx0XHRvcHRpb25zID0gc2V0O1xuXHRcdHNldCA9IHVuZGVmaW5lZDtcblx0fVxuXHRpZiAoZHNjciA9PSBudWxsKSB7XG5cdFx0YyA9IHRydWU7XG5cdFx0ZSA9IGZhbHNlO1xuXHR9IGVsc2Uge1xuXHRcdGMgPSBjb250YWlucy5jYWxsKGRzY3IsICdjJyk7XG5cdFx0ZSA9IGNvbnRhaW5zLmNhbGwoZHNjciwgJ2UnKTtcblx0fVxuXG5cdGRlc2MgPSB7IGdldDogZ2V0LCBzZXQ6IHNldCwgY29uZmlndXJhYmxlOiBjLCBlbnVtZXJhYmxlOiBlIH07XG5cdHJldHVybiAhb3B0aW9ucyA/IGRlc2MgOiBhc3NpZ24obm9ybWFsaXplT3B0cyhvcHRpb25zKSwgZGVzYyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vaXMtaW1wbGVtZW50ZWQnKSgpXG5cdD8gT2JqZWN0LmFzc2lnblxuXHQ6IHJlcXVpcmUoJy4vc2hpbScpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcblx0dmFyIGFzc2lnbiA9IE9iamVjdC5hc3NpZ24sIG9iajtcblx0aWYgKHR5cGVvZiBhc3NpZ24gIT09ICdmdW5jdGlvbicpIHJldHVybiBmYWxzZTtcblx0b2JqID0geyBmb286ICdyYXonIH07XG5cdGFzc2lnbihvYmosIHsgYmFyOiAnZHdhJyB9LCB7IHRyenk6ICd0cnp5JyB9KTtcblx0cmV0dXJuIChvYmouZm9vICsgb2JqLmJhciArIG9iai50cnp5KSA9PT0gJ3JhemR3YXRyenknO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGtleXMgID0gcmVxdWlyZSgnLi4va2V5cycpXG4gICwgdmFsdWUgPSByZXF1aXJlKCcuLi92YWxpZC12YWx1ZScpXG5cbiAgLCBtYXggPSBNYXRoLm1heDtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZGVzdCwgc3JjLyosIOKApnNyY24qLykge1xuXHR2YXIgZXJyb3IsIGksIGwgPSBtYXgoYXJndW1lbnRzLmxlbmd0aCwgMiksIGFzc2lnbjtcblx0ZGVzdCA9IE9iamVjdCh2YWx1ZShkZXN0KSk7XG5cdGFzc2lnbiA9IGZ1bmN0aW9uIChrZXkpIHtcblx0XHR0cnkgeyBkZXN0W2tleV0gPSBzcmNba2V5XTsgfSBjYXRjaCAoZSkge1xuXHRcdFx0aWYgKCFlcnJvcikgZXJyb3IgPSBlO1xuXHRcdH1cblx0fTtcblx0Zm9yIChpID0gMTsgaSA8IGw7ICsraSkge1xuXHRcdHNyYyA9IGFyZ3VtZW50c1tpXTtcblx0XHRrZXlzKHNyYykuZm9yRWFjaChhc3NpZ24pO1xuXHR9XG5cdGlmIChlcnJvciAhPT0gdW5kZWZpbmVkKSB0aHJvdyBlcnJvcjtcblx0cmV0dXJuIGRlc3Q7XG59O1xuIiwiLy8gRGVwcmVjYXRlZFxuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iaiA9PT0gJ2Z1bmN0aW9uJzsgfTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2lzLWltcGxlbWVudGVkJykoKVxuXHQ/IE9iamVjdC5rZXlzXG5cdDogcmVxdWlyZSgnLi9zaGltJyk7XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuXHR0cnkge1xuXHRcdE9iamVjdC5rZXlzKCdwcmltaXRpdmUnKTtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSBjYXRjaCAoZSkgeyByZXR1cm4gZmFsc2U7IH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBrZXlzID0gT2JqZWN0LmtleXM7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9iamVjdCkge1xuXHRyZXR1cm4ga2V5cyhvYmplY3QgPT0gbnVsbCA/IG9iamVjdCA6IE9iamVjdChvYmplY3QpKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBmb3JFYWNoID0gQXJyYXkucHJvdG90eXBlLmZvckVhY2gsIGNyZWF0ZSA9IE9iamVjdC5jcmVhdGU7XG5cbnZhciBwcm9jZXNzID0gZnVuY3Rpb24gKHNyYywgb2JqKSB7XG5cdHZhciBrZXk7XG5cdGZvciAoa2V5IGluIHNyYykgb2JqW2tleV0gPSBzcmNba2V5XTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9wdGlvbnMvKiwg4oCmb3B0aW9ucyovKSB7XG5cdHZhciByZXN1bHQgPSBjcmVhdGUobnVsbCk7XG5cdGZvckVhY2guY2FsbChhcmd1bWVudHMsIGZ1bmN0aW9uIChvcHRpb25zKSB7XG5cdFx0aWYgKG9wdGlvbnMgPT0gbnVsbCkgcmV0dXJuO1xuXHRcdHByb2Nlc3MoT2JqZWN0KG9wdGlvbnMpLCByZXN1bHQpO1xuXHR9KTtcblx0cmV0dXJuIHJlc3VsdDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGZuKSB7XG5cdGlmICh0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHRocm93IG5ldyBUeXBlRXJyb3IoZm4gKyBcIiBpcyBub3QgYSBmdW5jdGlvblwiKTtcblx0cmV0dXJuIGZuO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAodmFsdWUpIHtcblx0aWYgKHZhbHVlID09IG51bGwpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgdXNlIG51bGwgb3IgdW5kZWZpbmVkXCIpO1xuXHRyZXR1cm4gdmFsdWU7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vaXMtaW1wbGVtZW50ZWQnKSgpXG5cdD8gU3RyaW5nLnByb3RvdHlwZS5jb250YWluc1xuXHQ6IHJlcXVpcmUoJy4vc2hpbScpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgc3RyID0gJ3JhemR3YXRyenknO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcblx0aWYgKHR5cGVvZiBzdHIuY29udGFpbnMgIT09ICdmdW5jdGlvbicpIHJldHVybiBmYWxzZTtcblx0cmV0dXJuICgoc3RyLmNvbnRhaW5zKCdkd2EnKSA9PT0gdHJ1ZSkgJiYgKHN0ci5jb250YWlucygnZm9vJykgPT09IGZhbHNlKSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaW5kZXhPZiA9IFN0cmluZy5wcm90b3R5cGUuaW5kZXhPZjtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoc2VhcmNoU3RyaW5nLyosIHBvc2l0aW9uKi8pIHtcblx0cmV0dXJuIGluZGV4T2YuY2FsbCh0aGlzLCBzZWFyY2hTdHJpbmcsIGFyZ3VtZW50c1sxXSkgPiAtMTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBkICAgICAgICA9IHJlcXVpcmUoJ2QnKVxuICAsIGNhbGxhYmxlID0gcmVxdWlyZSgnZXM1LWV4dC9vYmplY3QvdmFsaWQtY2FsbGFibGUnKVxuXG4gICwgYXBwbHkgPSBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHksIGNhbGwgPSBGdW5jdGlvbi5wcm90b3R5cGUuY2FsbFxuICAsIGNyZWF0ZSA9IE9iamVjdC5jcmVhdGUsIGRlZmluZVByb3BlcnR5ID0gT2JqZWN0LmRlZmluZVByb3BlcnR5XG4gICwgZGVmaW5lUHJvcGVydGllcyA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzXG4gICwgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5XG4gICwgZGVzY3JpcHRvciA9IHsgY29uZmlndXJhYmxlOiB0cnVlLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUgfVxuXG4gICwgb24sIG9uY2UsIG9mZiwgZW1pdCwgbWV0aG9kcywgZGVzY3JpcHRvcnMsIGJhc2U7XG5cbm9uID0gZnVuY3Rpb24gKHR5cGUsIGxpc3RlbmVyKSB7XG5cdHZhciBkYXRhO1xuXG5cdGNhbGxhYmxlKGxpc3RlbmVyKTtcblxuXHRpZiAoIWhhc093blByb3BlcnR5LmNhbGwodGhpcywgJ19fZWVfXycpKSB7XG5cdFx0ZGF0YSA9IGRlc2NyaXB0b3IudmFsdWUgPSBjcmVhdGUobnVsbCk7XG5cdFx0ZGVmaW5lUHJvcGVydHkodGhpcywgJ19fZWVfXycsIGRlc2NyaXB0b3IpO1xuXHRcdGRlc2NyaXB0b3IudmFsdWUgPSBudWxsO1xuXHR9IGVsc2Uge1xuXHRcdGRhdGEgPSB0aGlzLl9fZWVfXztcblx0fVxuXHRpZiAoIWRhdGFbdHlwZV0pIGRhdGFbdHlwZV0gPSBsaXN0ZW5lcjtcblx0ZWxzZSBpZiAodHlwZW9mIGRhdGFbdHlwZV0gPT09ICdvYmplY3QnKSBkYXRhW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuXHRlbHNlIGRhdGFbdHlwZV0gPSBbZGF0YVt0eXBlXSwgbGlzdGVuZXJdO1xuXG5cdHJldHVybiB0aGlzO1xufTtcblxub25jZSA9IGZ1bmN0aW9uICh0eXBlLCBsaXN0ZW5lcikge1xuXHR2YXIgb25jZSwgc2VsZjtcblxuXHRjYWxsYWJsZShsaXN0ZW5lcik7XG5cdHNlbGYgPSB0aGlzO1xuXHRvbi5jYWxsKHRoaXMsIHR5cGUsIG9uY2UgPSBmdW5jdGlvbiAoKSB7XG5cdFx0b2ZmLmNhbGwoc2VsZiwgdHlwZSwgb25jZSk7XG5cdFx0YXBwbHkuY2FsbChsaXN0ZW5lciwgdGhpcywgYXJndW1lbnRzKTtcblx0fSk7XG5cblx0b25jZS5fX2VlT25jZUxpc3RlbmVyX18gPSBsaXN0ZW5lcjtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG5vZmYgPSBmdW5jdGlvbiAodHlwZSwgbGlzdGVuZXIpIHtcblx0dmFyIGRhdGEsIGxpc3RlbmVycywgY2FuZGlkYXRlLCBpO1xuXG5cdGNhbGxhYmxlKGxpc3RlbmVyKTtcblxuXHRpZiAoIWhhc093blByb3BlcnR5LmNhbGwodGhpcywgJ19fZWVfXycpKSByZXR1cm4gdGhpcztcblx0ZGF0YSA9IHRoaXMuX19lZV9fO1xuXHRpZiAoIWRhdGFbdHlwZV0pIHJldHVybiB0aGlzO1xuXHRsaXN0ZW5lcnMgPSBkYXRhW3R5cGVdO1xuXG5cdGlmICh0eXBlb2YgbGlzdGVuZXJzID09PSAnb2JqZWN0Jykge1xuXHRcdGZvciAoaSA9IDA7IChjYW5kaWRhdGUgPSBsaXN0ZW5lcnNbaV0pOyArK2kpIHtcblx0XHRcdGlmICgoY2FuZGlkYXRlID09PSBsaXN0ZW5lcikgfHxcblx0XHRcdFx0XHQoY2FuZGlkYXRlLl9fZWVPbmNlTGlzdGVuZXJfXyA9PT0gbGlzdGVuZXIpKSB7XG5cdFx0XHRcdGlmIChsaXN0ZW5lcnMubGVuZ3RoID09PSAyKSBkYXRhW3R5cGVdID0gbGlzdGVuZXJzW2kgPyAwIDogMV07XG5cdFx0XHRcdGVsc2UgbGlzdGVuZXJzLnNwbGljZShpLCAxKTtcblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0aWYgKChsaXN0ZW5lcnMgPT09IGxpc3RlbmVyKSB8fFxuXHRcdFx0XHQobGlzdGVuZXJzLl9fZWVPbmNlTGlzdGVuZXJfXyA9PT0gbGlzdGVuZXIpKSB7XG5cdFx0XHRkZWxldGUgZGF0YVt0eXBlXTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gdGhpcztcbn07XG5cbmVtaXQgPSBmdW5jdGlvbiAodHlwZSkge1xuXHR2YXIgaSwgbCwgbGlzdGVuZXIsIGxpc3RlbmVycywgYXJncztcblxuXHRpZiAoIWhhc093blByb3BlcnR5LmNhbGwodGhpcywgJ19fZWVfXycpKSByZXR1cm47XG5cdGxpc3RlbmVycyA9IHRoaXMuX19lZV9fW3R5cGVdO1xuXHRpZiAoIWxpc3RlbmVycykgcmV0dXJuO1xuXG5cdGlmICh0eXBlb2YgbGlzdGVuZXJzID09PSAnb2JqZWN0Jykge1xuXHRcdGwgPSBhcmd1bWVudHMubGVuZ3RoO1xuXHRcdGFyZ3MgPSBuZXcgQXJyYXkobCAtIDEpO1xuXHRcdGZvciAoaSA9IDE7IGkgPCBsOyArK2kpIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuXG5cdFx0bGlzdGVuZXJzID0gbGlzdGVuZXJzLnNsaWNlKCk7XG5cdFx0Zm9yIChpID0gMDsgKGxpc3RlbmVyID0gbGlzdGVuZXJzW2ldKTsgKytpKSB7XG5cdFx0XHRhcHBseS5jYWxsKGxpc3RlbmVyLCB0aGlzLCBhcmdzKTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0c3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG5cdFx0Y2FzZSAxOlxuXHRcdFx0Y2FsbC5jYWxsKGxpc3RlbmVycywgdGhpcyk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIDI6XG5cdFx0XHRjYWxsLmNhbGwobGlzdGVuZXJzLCB0aGlzLCBhcmd1bWVudHNbMV0pO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAzOlxuXHRcdFx0Y2FsbC5jYWxsKGxpc3RlbmVycywgdGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuXHRcdFx0YnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdGwgPSBhcmd1bWVudHMubGVuZ3RoO1xuXHRcdFx0YXJncyA9IG5ldyBBcnJheShsIC0gMSk7XG5cdFx0XHRmb3IgKGkgPSAxOyBpIDwgbDsgKytpKSB7XG5cdFx0XHRcdGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuXHRcdFx0fVxuXHRcdFx0YXBwbHkuY2FsbChsaXN0ZW5lcnMsIHRoaXMsIGFyZ3MpO1xuXHRcdH1cblx0fVxufTtcblxubWV0aG9kcyA9IHtcblx0b246IG9uLFxuXHRvbmNlOiBvbmNlLFxuXHRvZmY6IG9mZixcblx0ZW1pdDogZW1pdFxufTtcblxuZGVzY3JpcHRvcnMgPSB7XG5cdG9uOiBkKG9uKSxcblx0b25jZTogZChvbmNlKSxcblx0b2ZmOiBkKG9mZiksXG5cdGVtaXQ6IGQoZW1pdClcbn07XG5cbmJhc2UgPSBkZWZpbmVQcm9wZXJ0aWVzKHt9LCBkZXNjcmlwdG9ycyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IGZ1bmN0aW9uIChvKSB7XG5cdHJldHVybiAobyA9PSBudWxsKSA/IGNyZWF0ZShiYXNlKSA6IGRlZmluZVByb3BlcnRpZXMoT2JqZWN0KG8pLCBkZXNjcmlwdG9ycyk7XG59O1xuZXhwb3J0cy5tZXRob2RzID0gbWV0aG9kcztcbiJdfQ==
