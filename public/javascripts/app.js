(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

toastr.options = {
    closeButton: false,
    debug: false,
    newestOnTop: false,
    progressBar: false,
    positionClass: 'toast-top-center',
    preventDuplicates: false,
    onclick: null,
    showDuration: 300,
    hideDuration: 1000,
    timeOut: 3000,
    extendedTimeOut: 1000,
    showEasing: 'swing',
    hideEasing: 'linear',
    showMethod: 'fadeIn',
    hideMethod: 'fadeOut'
};

// require('./ui')
require('./game');

},{"./game":6}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = Create;

var _GameConsts = require('../lib/GameConsts');

var _GameConsts2 = _interopRequireDefault(_GameConsts);

var _SetEventHandlers = require('../lib/SocketEvents/SetEventHandlers');

var _SetEventHandlers2 = _interopRequireDefault(_SetEventHandlers);

var _EventHandler = require('../lib/EventHandler');

var _EventHandler2 = _interopRequireDefault(_EventHandler);

var _HighRuleJungle = require('../maps/HighRuleJungle');

var _HighRuleJungle2 = _interopRequireDefault(_HighRuleJungle);

var _Weapons = require('../lib/Weapons');

var _Weapons2 = _interopRequireDefault(_Weapons);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Create() {
    var _this = this;

    this.socket = io.connect();
    this.enemies = this.game.add.group();

    this.volume = _GameConsts2.default.STARTING_VOLUME;
    this.enemyBullets = this.game.add.group();
    this.enemyBullets.enableBody = true;
    this.enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;

    //  We're going to be using physics, so enable the Arcade Physics system
    this.physics.startSystem(Phaser.Physics.ARCADE);

    this.world.setBounds(0, 0, _GameConsts2.default.WORLD_WIDTH, _GameConsts2.default.WORLD_HEIGHT);

    // Scale game on window resize
    this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
    this.game.scale.setShowAll();
    this.game.scale.refresh();

    /**
     * Map
     */
    this.mapInstance = new _HighRuleJungle2.default(this);
    this.mapInstance.create();

    /**
     * Bullet Settings
     */
    this.bullets = this.game.add.group();
    this.bullets.enableBody = true;
    this.physicsBodyType = Phaser.Physics.ARCADE;
    this.bullets.createMultiple(50, 'bullet12');
    this.bullets.setAll('checkWorldBounds', true);
    this.bullets.setAll('outOfBoundsKill', true);

    /**
     * Player Settings
     */
    var spawnPoint = this.mapInstance.getRandomSpawnPoint();
    this.player = this.add.sprite(spawnPoint.x, spawnPoint.y, 'commando');
    this.player.scale.setTo(_GameConsts2.default.PLAYER_SCALE);
    this.player.anchor.setTo(_GameConsts2.default.PLAYER_ANCHOR);

    //  We need to enable physics on the player
    this.physics.arcade.enable(this.player);

    // Enable physics on the player
    this.game.physics.enable(this.player, Phaser.Physics.ARCADE);

    // Make player collide with world boundaries so he doesn't leave the stage
    this.player.body.collideWorldBounds = true;

    // Set player minimum and maximum movement speed
    this.player.body.maxVelocity.setTo(_GameConsts2.default.MAX_SPEED, _GameConsts2.default.MAX_SPEED * 10); // x, y

    // Add drag to the player that slows them down when they are not accelerating
    this.player.body.drag.setTo(_GameConsts2.default.DRAG, 0); // x, y
    this.player.body.setSize(230, 290, -10, 0);
    this.player.meta = {
        health: 100
    };

    // Since we're jumping we need gravity
    this.game.physics.arcade.gravity.y = _GameConsts2.default.GRAVITY;

    // Flag to track if the jump button is pressed
    this.jumping = false;

    //  Our two animations, walking left and right.
    this.player.animations.add('left', _GameConsts2.default.ANIMATION_LEFT, _GameConsts2.default.ANIMATION_FRAMERATE, true);
    this.player.animations.add('right', _GameConsts2.default.ANIMATION_RIGHT, _GameConsts2.default.ANIMATION_FRAMERATE, true);

    this.player.meta = {
        health: 100,
        primaryWeapon: new _Weapons2.default.AK47(this),
        secondaryWeapon: new _Weapons2.default.DesertEagle(this),
        selectedPrimaryWeaponId: 'AK47',
        selectedSecondaryWeaponId: 'DesertEagle'
    };

    this.player.meta.primaryWeapon.id = 'AK47';
    this.player.meta.secondaryWeapon.id = 'DesertEagle';

    this.leftArmGroup = this.game.add.group();
    this.rightArmGroup = this.game.add.group();
    this.headGroup = this.game.add.group();
    this.torsoGroup = this.game.add.group();

    // Torso
    this.torsoSprite = this.game.add.sprite(-37, -105, 'torso');
    this.torsoSprite.scale.setTo(1.8);
    this.torsoGroup.add(this.torsoSprite);

    // Head
    this.headSprite = this.game.add.sprite(0, -148, 'head');
    this.headSprite.scale.setTo(1.8);
    this.headGroup.add(this.headSprite);

    // Left arm
    this.leftArmSprite = this.game.add.sprite(0, 0, 'left-arm');
    this.leftArmSprite.anchor.setTo(.2, .2);
    this.leftArmSprite.scale.setTo(1.6);
    this.leftArmSprite.rotation = 80.1;
    this.leftArmGroup.add(this.leftArmSprite);

    // Gun
    this.ak47Sprite = this.game.add.sprite(12, 19, 'AK47');
    this.ak47Sprite.scale.setTo(1.3);
    this.ak47Sprite.rotation = 80.15;

    // Right arm
    this.rightArmGroup.add(this.ak47Sprite);
    this.rightArmSprite = this.game.add.sprite(0, 0, 'right-arm');
    this.rightArmSprite.anchor.setTo(.2, .24);
    this.rightArmSprite.scale.setTo(1.7);
    this.rightArmSprite.rotation = 80.1;
    this.rightArmGroup.add(this.rightArmSprite);

    this.player.addChild(this.leftArmGroup);
    this.leftArmGroup.pivot.x = 0;
    this.leftArmGroup.pivot.y = 0;
    this.leftArmGroup.x = 45;
    this.leftArmGroup.y = -70;

    this.player.addChild(this.torsoGroup);
    this.player.addChild(this.headGroup);

    this.player.addChild(this.rightArmGroup);
    this.rightArmGroup.pivot.x = 0;
    this.rightArmGroup.pivot.y = 0;
    this.rightArmGroup.x = -25;
    this.rightArmGroup.y = -65;

    /**
     * Weapons
     */
    this.currentWeapon = 'primaryWeapon';

    /**
     * Text
     */
    var textStyles = { fontSize: '14px', fill: '#000' };

    _EventHandler2.default.emit('score update', '');
    _EventHandler2.default.emit('health update', '');
    _EventHandler2.default.on('volume update', function (data) {
        _this.volume = data.volume;
    });

    _EventHandler2.default.on('primary weapon update', function (weapon) {
        _this.player.meta.selectedPrimaryWeaponId = weapon.id;
    });

    _EventHandler2.default.on('secondary weapon update', function (weapon) {
        _this.player.meta.selectedSecondaryWeaponId = weapon.id;
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
     * Keyboard Events
     */
    // Open settings modal
    this.input.keyboard.addKey(Phaser.Keyboard.TAB).onDown.add(function () {
        _EventHandler2.default.emit('settings open');
    });

    // Switch weapons
    this.input.keyboard.addKey(Phaser.Keyboard.Q).onDown.add(function () {
        _this.currentWeapon = _this.currentWeapon === 'primaryWeapon' ? 'secondaryWeapon' : 'primaryWeapon';
        _this.ak47Sprite.loadTexture(_this.player.meta[_this.currentWeapon].id);
    });

    /**
     * Start listening for events
     */
    _SetEventHandlers2.default.call(this);
}

},{"../lib/EventHandler":8,"../lib/GameConsts":12,"../lib/SocketEvents/SetEventHandlers":23,"../lib/Weapons":44,"../maps/HighRuleJungle":45}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = Init;
function Init() {
    this.game.renderer.renderSession.roundPixels = true;
    this.game.stage.disableVisibilityChange = true;
}

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = Preload;

var _GameConsts = require('../lib/GameConsts');

var _GameConsts2 = _interopRequireDefault(_GameConsts);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Preload() {
    var _this = this;

    this.load.image('map-bg', '/images/high-rule-desert.png');
    this.load.image('ground', '/images/platform.png');
    this.load.image('bullet12', '/images/bullet.png');

    this.load.spritesheet('dude', '/images/dude.png', 32, 48);
    this.load.spritesheet('commando', '/images/commando.png', 300, 315);
    this.load.spritesheet('enemy', '/images/dude.png', 32, 48);

    // Weapons
    _GameConsts2.default.PRIMARY_WEAPONS.forEach(function (weapon) {
        _this.load.image(weapon.id, weapon.image);
    });

    _GameConsts2.default.SECONDARY_WEAPONS.forEach(function (weapon) {
        _this.load.image(weapon.id, weapon.image);
    });

    this.load.image('right-arm', '/images/body/right-arm.png');
    this.load.image('left-arm', '/images/body/left-arm.png');
    this.load.image('head', '/images/body/head.png');
    this.load.image('torso', '/images/body/torso.png');

    this.load.audio('AK47-sound', '/audio/AK47.ogg');
    this.load.audio('M500-sound', '/audio/M500.ogg');
    this.load.audio('Skorpion-sound', '/audio/Skorpion.ogg');
    this.load.audio('AUG-sound', '/audio/AUG.ogg');
    this.load.audio('G43-sound', '/audio/G43.ogg');
    this.load.audio('P90-sound', '/audio/P90.ogg');
    this.load.audio('M4A1-sound', '/audio/M4A1.ogg');
    this.load.audio('BarretM90-sound', '/audio/BarretM90.ogg');

    this.load.audio('DesertEagle-sound', '/audio/DesertEagle.ogg');
    this.load.audio('RPG-sound', '/audio/RPG.ogg');
}

},{"../lib/GameConsts":12}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = Update;

var _CollisionHandler = require('../lib/CollisionHandler');

var _CollisionHandler2 = _interopRequireDefault(_CollisionHandler);

var _PlayerMovementHandler = require('../lib/PlayerMovementHandler');

var _PlayerMovementHandler2 = _interopRequireDefault(_PlayerMovementHandler);

var _PlayerJumpHandler = require('../lib/PlayerJumpHandler');

var _PlayerJumpHandler2 = _interopRequireDefault(_PlayerJumpHandler);

var _PlayerAngleHandler = require('../lib/PlayerAngleHandler');

var _PlayerAngleHandler2 = _interopRequireDefault(_PlayerAngleHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Update() {
    _CollisionHandler2.default.call(this);
    _PlayerMovementHandler2.default.call(this);
    _PlayerJumpHandler2.default.call(this);
    _PlayerAngleHandler2.default.call(this);

    if (this.game.input.activePointer.isDown) {
        this.player.meta[this.currentWeapon].fire();
    }

    this.positionText.text = this.game.input.worldX + ', ' + this.game.input.worldY;

    // Check for out of bounds kill
    if (this.player.body.onFloor()) {
        this.socket.emit('player damaged', {
            roomId: this.roomId,
            damage: 1000,
            damagedPlayerId: '/#' + this.socket.id,
            attackingPlayerId: null
        });
    }

    this.socket.emit('move player', {
        roomId: this.roomId,
        x: this.player.x,
        y: this.player.y
    });
}

},{"../lib/CollisionHandler":7,"../lib/PlayerAngleHandler":16,"../lib/PlayerJumpHandler":19,"../lib/PlayerMovementHandler":20}],6:[function(require,module,exports){
'use strict';

var _Init = require('./core/Init');

var _Init2 = _interopRequireDefault(_Init);

var _Preload = require('./core/Preload');

var _Preload2 = _interopRequireDefault(_Preload);

var _Update = require('./core/Update');

var _Update2 = _interopRequireDefault(_Update);

var _Create = require('./core/Create');

var _Create2 = _interopRequireDefault(_Create);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var gameWidth = window.innerWidth;
var gameHeight = window.innerHeight;
var game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, 'ranger-steve-game');

game.state.add('Game', function () {
    this.currentWeapon = 0;
    this.enemies = [];
    this.ground;
    this.platforms;
    this.player;
    this.socket;

    this.game = game;
    this.init = _Init2.default;
    this.preload = _Preload2.default;
    this.create = _Create2.default;
    this.update = _Update2.default;
}, true);

},{"./core/Create":2,"./core/Init":3,"./core/Preload":4,"./core/Update":5}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = CollisionHandler;
function CollisionHandler() {
    var _this = this;

    // Collide this player with the map
    this.physics.arcade.collide(this.player, this.platforms, null, null, this);

    // Did this player's bullets hit any platforms
    this.physics.arcade.collide(this.platforms, this.bullets, function (platform, bullet) {
        bullet.kill();
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
}

},{}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _eventEmitter = require('event-emitter');

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EventHandler = (0, _eventEmitter2.default)({});

exports.default = EventHandler;

},{"event-emitter":60}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = FireRocket;

var _Guid = require('./Guid');

var _Guid2 = _interopRequireDefault(_Guid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function FireRocket() {
    var x = this.rootScope.player.x;
    var y = this.rootScope.player.y;

    var bullet = this.rootScope.bullets.getFirstDead();
    bullet.bulletId = (0, _Guid2.default)();
    bullet.height = this.bulletHeight;
    bullet.width = this.bulletWidth;
    bullet.body.gravity.y = -1800;
    bullet.reset(x, y);
    var pointerAngle = this.rootScope.game.physics.arcade.moveToPointer(bullet, this.bulletSpeed);
    bullet.rotation = pointerAngle;

    this.fx.volume = .3 * this.rootScope.volume;
    this.fx.play();

    this.rootScope.socket.emit('bullet fired', {
        roomId: this.rootScope.roomId,
        bulletId: this.bulletId,
        playerId: '/#' + this.rootScope.socket.id,
        x: x,
        y: y,
        pointerAngle: pointerAngle,
        bulletSpeed: this.bulletSpeed,
        height: this.bulletHeight,
        width: this.bulletWidth,
        damage: this.damage
    });
}

},{"./Guid":14}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = FireShotgunShell;

var _Guid = require('./Guid');

var _Guid2 = _interopRequireDefault(_Guid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function FireShotgunShell() {
    var x = this.rootScope.player.x;
    var y = this.rootScope.player.y;

    var bullet = this.rootScope.bullets.getFirstDead();
    bullet.bulletId = (0, _Guid2.default)();
    bullet.height = this.bulletHeight;
    bullet.width = this.bulletWidth;
    bullet.body.gravity.y = -1800;
    bullet.reset(x, y);
    var pointerAngle = this.rootScope.game.physics.arcade.moveToPointer(bullet, this.bulletSpeed);
    bullet.rotation = pointerAngle;

    this.fx.volume = .5 * this.rootScope.volume;
    this.fx.play();

    this.rootScope.socket.emit('bullet fired', {
        roomId: this.rootScope.roomId,
        bulletId: this.bulletId,
        playerId: '/#' + this.rootScope.socket.id,
        x: x,
        y: y,
        pointerAngle: pointerAngle,
        bulletSpeed: this.bulletSpeed,
        height: this.bulletHeight,
        width: this.bulletWidth,
        damage: this.damage
    });
}

},{"./Guid":14}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = FireStandardBullet;

var _Guid = require('./Guid');

var _Guid2 = _interopRequireDefault(_Guid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function FireStandardBullet() {
    var x = this.rootScope.player.x;
    var y = this.rootScope.player.y;

    var bullet = this.rootScope.bullets.getFirstDead();
    bullet.bulletId = (0, _Guid2.default)();
    bullet.height = this.bulletHeight;
    bullet.width = this.bulletWidth;
    bullet.body.gravity.y = -1800;
    bullet.reset(x, y);
    var pointerAngle = this.rootScope.game.physics.arcade.moveToPointer(bullet, this.bulletSpeed);
    bullet.rotation = pointerAngle;

    this.fx.volume = .3 * this.rootScope.volume;
    this.fx.play();

    this.rootScope.socket.emit('bullet fired', {
        roomId: this.rootScope.roomId,
        bulletId: bullet.bulletId,
        playerId: '/#' + this.rootScope.socket.id,
        x: x,
        y: y,
        pointerAngle: pointerAngle,
        bulletSpeed: bullet.bulletSpeed,
        height: bullet.bulletHeight,
        width: bullet.bulletWidth,
        damage: bullet.damage
    });
}

},{"./Guid":14}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var GameConsts = {
    WORLD_WIDTH: 8000,
    WORLD_HEIGHT: 3966,
    STARTING_VOLUME: .5,

    // Physics
    MAX_SPEED: 600,
    ACCELERATION: 1960,
    DRAG: 1500,
    GRAVITY: 1900,
    JUMP_SPEED: -850,
    JUMP_JET_SPEED: -2400,
    JUMP_JET_SPEED_REGENERATION: -2400,

    // Player Model
    ANIMATION_LEFT: [0, 1, 2, 3, 4, 5],
    ANIMATION_RIGHT: [8, 9, 10, 11, 12, 13],
    ANIMATION_FRAMERATE: 10,
    PLAYER_SCALE: .27,
    PLAYER_ANCHOR: .5,

    // Weapons
    PRIMARY_WEAPONS: [{
        id: 'AK47',
        name: 'AK-47',
        image: '/images/guns/Spr_AK47.png',
        minScore: 0
    }, {
        id: 'M500',
        name: 'M500',
        image: '/images/guns/Spr_M500.png',
        minScore: 0
        // minScore: 10
    }, {
        id: 'Skorpion',
        name: 'Skorpion',
        image: '/images/guns/Spr_Skorpion.png',
        minScore: 0
        // minScore: 20
    }, {
        id: 'Aug',
        name: 'Aug',
        image: '/images/guns/Spr_Aug.png',
        minScore: 0
        // minScore: 30
    }, {
        id: 'G43',
        name: 'G43',
        image: '/images/guns/Spr_g43.png',
        minScore: 0
        // minScore: 40
    }, {
        id: 'P90',
        name: 'P90',
        image: '/images/guns/Spr_p90.png',
        minScore: 0
        // minScore: 30
    }, {
        id: 'M4A1',
        name: 'M4A1',
        image: '/images/guns/Spr_M4A1.png',
        minScore: 0
        // minScore: 10
    }, {
        id: 'Barrett',
        name: 'Barrett',
        image: '/images/guns/Spr_Barrett.png',
        minScore: 0
        // minScore: 70
    }],

    SECONDARY_WEAPONS: [{
        id: 'DesertEagle',
        name: 'Desert Eagle',
        image: '/images/guns/Spr_DesertEagle.png',
        minScore: 0
    }, {
        id: 'RPG',
        name: 'RPG',
        image: '/images/guns/Spr_RPG.png',
        minScore: 20
    }]
};

exports.default = GameConsts;

},{}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = GetQueryString;
function GetQueryString(field, url) {
    var href = url ? url : window.location.href;
    var reg = new RegExp('[?&]' + field + '=([^&#]*)', 'i');
    var string = reg.exec(href);
    return string ? string[1] : null;
}

},{}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = Guid;
function S4() {
    return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
}

function Guid() {
    return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
}

},{}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.leftInputIsActive = leftInputIsActive;
exports.rightInputIsActive = rightInputIsActive;
exports.upInputIsActive = upInputIsActive;
exports.upInputReleased = upInputReleased;
// This function should return true when the player activates the "go left" control
// In this case, either holding the right arrow or tapping or clicking on the left
// side of the screen.
function leftInputIsActive() {
    return this.input.keyboard.isDown(Phaser.Keyboard.A);
}

// This function should return true when the player activates the "go right" control
// In this case, either holding the right arrow or tapping or clicking on the right
// side of the screen.
function rightInputIsActive() {
    return this.input.keyboard.isDown(Phaser.Keyboard.D);
}

// This function should return true when the player activates the "jump" control
// In this case, either holding the up arrow or tapping or clicking on the center
// part of the screen.
function upInputIsActive(duration) {
    return this.input.keyboard.downDuration(Phaser.Keyboard.W, duration);
}

// This function returns true when the player releases the "jump" control
function upInputReleased() {
    return this.input.keyboard.upDuration(Phaser.Keyboard.W);
}

},{}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = PlayerAngleHandler;
function PlayerAngleHandler() {
    var angleInDegrees = this.game.physics.arcade.angleToPointer(this.player) * 180 / Math.PI + 90;

    if (this.player.meta.facing === 'right') {
        this.rightArmGroup.angle = angleInDegrees + 5;

        // User is aiming up
        if (angleInDegrees <= 81 && angleInDegrees >= 71) {
            angleInDegrees -= 10;
        } else if (angleInDegrees < 71 && angleInDegrees >= 61) {
            angleInDegrees -= 20;
        } else if (angleInDegrees < 61 && angleInDegrees >= 51) {
            angleInDegrees -= 30;
        } else if (angleInDegrees < 51 && angleInDegrees >= 41) {
            angleInDegrees -= 40;
        } else if (angleInDegrees < 41 && angleInDegrees >= 31) {
            angleInDegrees -= 50;
        } else if (angleInDegrees < 31 && angleInDegrees >= 21) {
            angleInDegrees -= 60;
        } else if (angleInDegrees < 21 && angleInDegrees >= 11) {
            angleInDegrees -= 70;
        } else if (angleInDegrees < 11 && angleInDegrees >= 0) {
            angleInDegrees -= 80;
        }

        // User is aiming down
        if (angleInDegrees >= 99 && angleInDegrees <= 109) {
            angleInDegrees += 10;
        } else if (angleInDegrees > 109 && angleInDegrees <= 119) {
            angleInDegrees += 20;
        } else if (angleInDegrees > 119 && angleInDegrees <= 129) {
            angleInDegrees += 30;
        } else if (angleInDegrees > 129 && angleInDegrees <= 139) {
            angleInDegrees += 40;
        } else if (angleInDegrees > 139 && angleInDegrees <= 149) {
            angleInDegrees += 50;
        } else if (angleInDegrees > 149 && angleInDegrees <= 159) {
            angleInDegrees += 60;
        } else if (angleInDegrees > 159 && angleInDegrees <= 169) {
            angleInDegrees += 70;
        } else if (angleInDegrees > 169 && angleInDegrees <= 180) {
            angleInDegrees += 80;
        }
    }

    if (this.player.meta.facing === 'left') {
        this.rightArmGroup.angle = angleInDegrees - 7;

        // User is aiming up
        if (angleInDegrees >= -81 && angleInDegrees <= -71) {
            angleInDegrees += 20;
        } else if (angleInDegrees > -71 && angleInDegrees <= -61) {
            angleInDegrees += 30;
        } else if (angleInDegrees > -61 && angleInDegrees <= -51) {
            angleInDegrees += 40;
        } else if (angleInDegrees > -51 && angleInDegrees <= -41) {
            angleInDegrees += 50;
        } else if (angleInDegrees > -41 && angleInDegrees <= -31) {
            angleInDegrees += 60;
        } else if (angleInDegrees > -31 && angleInDegrees <= -21) {
            angleInDegrees += 70;
        } else if (angleInDegrees > -21 && angleInDegrees <= -11) {
            angleInDegrees += 80;
        } else if (angleInDegrees > -11 && angleInDegrees <= 0) {
            angleInDegrees += 90;
        }

        // User is aiming down
        if (angleInDegrees <= 270 && angleInDegrees >= 260) {
            angleInDegrees -= 10;
        } else if (angleInDegrees < 260 && angleInDegrees >= 250) {
            angleInDegrees -= 20;
        } else if (angleInDegrees < 250 && angleInDegrees >= 240) {
            angleInDegrees -= 30;
        } else if (angleInDegrees < 240 && angleInDegrees >= 230) {
            angleInDegrees -= 40;
        } else if (angleInDegrees < 230 && angleInDegrees >= 220) {
            angleInDegrees -= 50;
        } else if (angleInDegrees < 220 && angleInDegrees >= 210) {
            angleInDegrees -= 60;
        } else if (angleInDegrees < 210 && angleInDegrees >= 200) {
            angleInDegrees -= 70;
        } else if (angleInDegrees < 200 && angleInDegrees >= 190) {
            angleInDegrees -= 80;
        }
    }

    this.leftArmGroup.angle = angleInDegrees;
}

},{}],17:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = PlayerById;
function PlayerById(id) {
    for (var i = 0; i < this.enemies.children.length; i++) {
        if (this.enemies.children[i].id === id) {
            return this.enemies.children[i];
        }
    }

    return false;
}

},{}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.playerFaceLeft = playerFaceLeft;
exports.playerFaceRight = playerFaceRight;
function playerFaceLeft() {
    if (this.player.meta.facing !== 'left') {
        this.player.meta.facing = 'left';

        this.rightArmGroup.x = 25;
        this.rightArmGroup.y = -65;

        this.leftArmGroup.x = -40;
        this.leftArmGroup.y = -70;

        this.headSprite.scale.x *= -1;
        this.headSprite.x = 12;

        this.torsoSprite.scale.x *= -1;
        this.torsoSprite.x = 49;

        this.leftArmSprite.scale.y *= -1;
        this.leftArmSprite.y = 5;

        this.rightArmSprite.scale.y *= -1;
        this.rightArmSprite.y = 10;

        this.ak47Sprite.scale.y *= -1;
        this.ak47Sprite.y = 30;
        this.ak47Sprite.x = -7;
    }
}

function playerFaceRight() {
    if (this.player.meta.facing !== 'right') {
        this.player.meta.facing = 'right';

        this.rightArmGroup.x = -25;
        this.rightArmGroup.y = -65;

        this.leftArmGroup.x = 45;
        this.leftArmGroup.y = -70;

        this.headSprite.scale.x *= -1;
        this.headSprite.x = 0;

        this.torsoSprite.scale.x *= -1;
        this.torsoSprite.x = -37;

        this.leftArmSprite.scale.y *= -1;
        this.leftArmSprite.y = 0;

        this.rightArmSprite.scale.y *= -1;
        this.rightArmSprite.y = 0;

        this.ak47Sprite.scale.y *= -1;
        this.ak47Sprite.y = 19;
        this.ak47Sprite.x = 3;
    }
}

},{}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = PlayerJumpHandler;

var _GameConsts = require('./GameConsts');

var _GameConsts2 = _interopRequireDefault(_GameConsts);

var _EventHandler = require('./EventHandler');

var _EventHandler2 = _interopRequireDefault(_EventHandler);

var _InputHelpers = require('./InputHelpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var jumpJetCounter = 0;

function PlayerJumpHandler() {
    // Set a variable that is true when the player is touching the ground
    var onTheGround = this.player.body.touching.down;

    // If the player is touching the ground, let him have 2 jumps
    if (onTheGround) {
        this.jumps = 2;
        this.jumping = false;
    }

    // Jump!
    if (this.jumps === 2 && _InputHelpers.upInputIsActive.call(this, 5) && onTheGround) {
        this.player.body.velocity.y = _GameConsts2.default.JUMP_SPEED;
        this.jumping = true;
    } else if (_InputHelpers.upInputIsActive.call(this, 5)) {
        this.jumps = 1;
    }

    // Jump Jet!
    if (this.jumps === 1 && this.input.keyboard.isDown(Phaser.Keyboard.W) && jumpJetCounter > -130000) {
        this.player.body.acceleration.y = _GameConsts2.default.JUMP_JET_SPEED;
        jumpJetCounter += _GameConsts2.default.JUMP_JET_SPEED;
    } else {
        this.player.body.acceleration.y = 0;

        if (jumpJetCounter < 0) {
            jumpJetCounter -= _GameConsts2.default.JUMP_JET_SPEED_REGENERATION;
        } else {
            jumpJetCounter = 0;
        }
    }

    _EventHandler2.default.emit('player jump jet update', { jumpJetCounter: jumpJetCounter });

    // Reduce the number of available jumps if the jump input is released
    if (this.jumping && _InputHelpers.upInputReleased.call(this)) {
        this.player.body.acceleration.x = 0;
        this.player.body.acceleration.y = 0;

        if (this.jumps !== 1) {
            this.jumps--;
        }

        this.jumping = false;
    }
}

},{"./EventHandler":8,"./GameConsts":12,"./InputHelpers":15}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = PlayerMovementHandler;

var _GameConsts = require('./GameConsts');

var _GameConsts2 = _interopRequireDefault(_GameConsts);

var _PlayerFaceHandler = require('./PlayerFaceHandler');

var _InputHelpers = require('./InputHelpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function PlayerMovementHandler() {
    if (_InputHelpers.leftInputIsActive.call(this)) {
        // If the LEFT key is down, set the player velocity to move left
        this.player.body.acceleration.x = -_GameConsts2.default.ACCELERATION;
        this.player.animations.play('left');

        // Left facing head needs to be set only once
        _PlayerFaceHandler.playerFaceLeft.call(this);
    } else if (_InputHelpers.rightInputIsActive.call(this)) {
        // If the RIGHT key is down, set the player velocity to move right
        this.player.body.acceleration.x = _GameConsts2.default.ACCELERATION;
        this.player.animations.play('right');

        _PlayerFaceHandler.playerFaceRight.call(this);
    } else {
        // Stand still
        this.player.body.acceleration.x = 0;
        this.player.animations.stop();

        if (this.game.input.worldX > this.player.x) {
            this.player.frame = 7;
            _PlayerFaceHandler.playerFaceRight.call(this);
        }

        if (this.game.input.worldX < this.player.x) {
            this.player.frame = 6;
            _PlayerFaceHandler.playerFaceLeft.call(this);
        }
    }
}

},{"./GameConsts":12,"./InputHelpers":15,"./PlayerFaceHandler":18}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = RemoteBullet;
function RemoteBullet(data) {
    var enemyBullet = this.enemyBullets.create(data.x, data.y, 'bullet12');
    enemyBullet.bulletId = data.bulletId;
    enemyBullet.playerId = data.playerId;
    enemyBullet.damage = data.damage;
    enemyBullet.rotation = data.pointerAngle;
    enemyBullet.height = data.height;
    enemyBullet.width = data.width;
    enemyBullet.body.gravity.y = -1800;

    return enemyBullet;
}

},{}],22:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = RemotePlayer;

var _GameConsts = require('./GameConsts');

var _GameConsts2 = _interopRequireDefault(_GameConsts);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function RemotePlayer(player) {
    var newRemotePlayer = this.game.add.sprite(player.x, player.y, 'commando');
    newRemotePlayer.scale.setTo(_GameConsts2.default.PLAYER_SCALE);
    newRemotePlayer.anchor.setTo(_GameConsts2.default.PLAYER_ANCHOR);
    newRemotePlayer.alive = true;
    newRemotePlayer.animations.add('left', _GameConsts2.default.ANIMATION_LEFT, _GameConsts2.default.ANIMATION_FRAMERATE, true);
    newRemotePlayer.animations.add('right', _GameConsts2.default.ANIMATION_RIGHT, _GameConsts2.default.ANIMATION_FRAMERATE, true);
    newRemotePlayer.id = player.id;
    newRemotePlayer.lastPosition = {
        x: player.x,
        y: player.y
    };

    return newRemotePlayer;
}

},{"./GameConsts":12}],23:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function () {
    var _this = this;

    this.socket.on('connect', _onSocketConnected2.default.bind(this));
    this.socket.on('disconnect', _onSocketDisconnect2.default.bind(this));

    this.socket.on('update players', _onUpdatePlayers2.default.bind(this));
    this.socket.on('move player', _onMovePlayer2.default.bind(this));
    this.socket.on('remove player', _onRemovePlayer2.default.bind(this));

    this.socket.on('player respawn', _onPlayerRespawn2.default.bind(this));
    this.socket.on('player damaged', _onPlayerDamaged2.default.bind(this));
    this.socket.on('player health update', _onPlayerHealthUpdate2.default.bind(this));

    this.socket.on('bullet fired', _onBulletFired2.default.bind(this));
    this.socket.on('bullet removed', _onBulletRemoved2.default.bind(this));

    _EventHandler2.default.on('player update nickname', function (data) {
        _this.socket.emit('player update nickname', {
            roomId: _this.roomId,
            nickname: data.nickname
        });
    });
};

var _EventHandler = require('../EventHandler');

var _EventHandler2 = _interopRequireDefault(_EventHandler);

var _onUpdatePlayers = require('./onUpdatePlayers');

var _onUpdatePlayers2 = _interopRequireDefault(_onUpdatePlayers);

var _onSocketConnected = require('./onSocketConnected');

var _onSocketConnected2 = _interopRequireDefault(_onSocketConnected);

var _onSocketDisconnect = require('./onSocketDisconnect');

var _onSocketDisconnect2 = _interopRequireDefault(_onSocketDisconnect);

var _onMovePlayer = require('./onMovePlayer');

var _onMovePlayer2 = _interopRequireDefault(_onMovePlayer);

var _onRemovePlayer = require('./onRemovePlayer');

var _onRemovePlayer2 = _interopRequireDefault(_onRemovePlayer);

var _onBulletFired = require('./onBulletFired');

var _onBulletFired2 = _interopRequireDefault(_onBulletFired);

var _onBulletRemoved = require('./onBulletRemoved');

var _onBulletRemoved2 = _interopRequireDefault(_onBulletRemoved);

var _onPlayerDamaged = require('./onPlayerDamaged');

var _onPlayerDamaged2 = _interopRequireDefault(_onPlayerDamaged);

var _onPlayerRespawn = require('./onPlayerRespawn');

var _onPlayerRespawn2 = _interopRequireDefault(_onPlayerRespawn);

var _onPlayerHealthUpdate = require('./onPlayerHealthUpdate');

var _onPlayerHealthUpdate2 = _interopRequireDefault(_onPlayerHealthUpdate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

},{"../EventHandler":8,"./onBulletFired":24,"./onBulletRemoved":25,"./onMovePlayer":26,"./onPlayerDamaged":27,"./onPlayerHealthUpdate":28,"./onPlayerRespawn":29,"./onRemovePlayer":30,"./onSocketConnected":31,"./onSocketDisconnect":32,"./onUpdatePlayers":33}],24:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = onBulletFired;

var _RemoteBullet = require('../RemoteBullet');

var _RemoteBullet2 = _interopRequireDefault(_RemoteBullet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function onBulletFired(data) {
    if (data.id === '/#' + this.socket.id) return;

    var enemyBullet = _RemoteBullet2.default.call(this, data);
    var newVelocity = this.game.physics.arcade.velocityFromRotation(data.pointerAngle, data.bulletSpeed);
    enemyBullet.body.velocity.x += newVelocity.x;
    enemyBullet.body.velocity.y += newVelocity.y;
}

},{"../RemoteBullet":21}],25:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = onBulletRemoved;
function onBulletRemoved(data) {
    if (data.id === '/#' + this.socket.id) return;

    var removeBullet = _.find(this.bullets.children, {
        bulletId: data.bulletId
    });

    if (!removeBullet) {
        console.log('Bullet not found: ', data.bulletId);
        return;
    }

    removeBullet.kill();
}

},{}],26:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = onMovePlayer;

var _PlayerById = require('../PlayerById');

var _PlayerById2 = _interopRequireDefault(_PlayerById);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function onMovePlayer(data) {
    var movePlayer = _PlayerById2.default.call(this, data.id);

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
        movePlayer.frame = 6;
    }

    movePlayer.lastPosition.x = movePlayer.x;
    movePlayer.lastPosition.y = movePlayer.y;
}

},{"../PlayerById":17}],27:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = onPlayerDamaged;

var _EventHandler = require('../EventHandler');

var _EventHandler2 = _interopRequireDefault(_EventHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var damageTimeout = null;
var healingInterval = null;
var lastKnownHealth = null;

function onPlayerDamaged(data) {
    var _this = this;

    if (data.damagedPlayerId !== '/#' + this.socket.id) return;

    this.player.meta.health = data.health;
    _EventHandler2.default.emit('health update', String(this.player.meta.health));

    if (this.player.meta.health > 55 && this.player.meta.health < 100) {
        clearTimeout(damageTimeout);
        damageTimeout = setTimeout(function () {
            // Player's health will fully regenerate
            _this.socket.emit('player full health', {
                roomId: _this.roomId
            });
        }, 5000);
    }

    if (this.player.meta.health > 0 && this.player.meta.health <= 55) {
        // Wait 5 seconds to begin healing process
        clearTimeout(damageTimeout);
        clearInterval(healingInterval);
        damageTimeout = setTimeout(function () {
            lastKnownHealth = _this.player.meta.health;
            healingInterval = setInterval(function () {
                if (lastKnownHealth >= 100) {
                    clearInterval(healingInterval);
                }

                lastKnownHealth += 10;

                // Increase player health by 10 every 1/2 a second
                _this.socket.emit('player healing', {
                    roomId: _this.roomId
                });
            }, 500);
        }, 5000);
    }
}

},{"../EventHandler":8}],28:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = onPlayerHealthUpdate;

var _EventHandler = require('../EventHandler');

var _EventHandler2 = _interopRequireDefault(_EventHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function onPlayerHealthUpdate(data) {
    if (data.id !== '/#' + this.socket.id) return;

    this.player.meta.health = data.health;
    _EventHandler2.default.emit('health update', String(this.player.meta.health));
}

},{"../EventHandler":8}],29:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = onPlayerRespawn;

var _EventHandler = require('../EventHandler');

var _EventHandler2 = _interopRequireDefault(_EventHandler);

var _Weapons = require('../Weapons');

var _Weapons2 = _interopRequireDefault(_Weapons);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function onPlayerRespawn(data) {
    if (data.damagedPlayerId !== '/#' + this.socket.id) return;

    // Set primary weapon
    this.player.meta.primaryWeapon = new _Weapons2.default[this.player.meta.selectedPrimaryWeaponId](this);
    this.player.meta.primaryWeapon.id = this.player.meta.selectedPrimaryWeaponId;

    if (this.currentWeapon === 'primaryWeapon') this.ak47Sprite.loadTexture(this.player.meta.selectedPrimaryWeaponId);

    // Set secondary weapon
    this.player.meta.secondaryWeapon = new _Weapons2.default[this.player.meta.selectedSecondaryWeaponId](this);
    this.player.meta.secondaryWeapon.id = this.player.meta.selectedSecondaryWeaponId;

    if (this.currentWeapon === 'secondaryWeapon') this.ak47Sprite.loadTexture(this.player.meta.selectedSecondaryWeaponId);

    // Reset health
    this.player.meta.health = data.health;
    _EventHandler2.default.emit('health update', String(this.player.meta.health));

    // Spawn player
    var spawnPoint = this.mapInstance.getRandomSpawnPoint();
    this.player.x = spawnPoint.x;
    this.player.y = spawnPoint.y;
}

},{"../EventHandler":8,"../Weapons":44}],30:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = onRemovePlayer;

var _PlayerById = require('../PlayerById');

var _PlayerById2 = _interopRequireDefault(_PlayerById);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function onRemovePlayer(data) {
    var removePlayer = _PlayerById2.default.call(this, data.id);

    // Player not found
    if (!removePlayer) {
        console.log('Player not found: ', data.id);
        return;
    }

    removePlayer.player.kill();

    // Remove player from array
    this.enemies.splice(this.enemies.indexOf(removePlayer), 1);
}

},{"../PlayerById":17}],31:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = onSocketConnected;

var _GetQueryString = require('../GetQueryString');

var _GetQueryString2 = _interopRequireDefault(_GetQueryString);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function onSocketConnected() {
    console.log('Connected to socket server');

    // Reset enemies on reconnect
    this.enemies.forEach(function (enemy) {
        if (enemy) enemy.kill();
    });

    this.enemies = [];

    // Send local player data to the game server
    this.socket.emit('new player', {
        roomId: (0, _GetQueryString2.default)('roomId'),
        x: this.player.x,
        y: this.player.y
    });
}

},{"../GetQueryString":13}],32:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = onSocketDisconnect;
function onSocketDisconnect() {
    console.log('Disconnected from socket server');
}

},{}],33:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = onUpdatePlayers;

var _RemotePlayer = require('../RemotePlayer');

var _RemotePlayer2 = _interopRequireDefault(_RemotePlayer);

var _EventHandler = require('../EventHandler');

var _EventHandler2 = _interopRequireDefault(_EventHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function onUpdatePlayers(data) {
    var _this = this;

    this.roomId = data.room.id;

    var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?roomId=' + data.room.id;
    window.history.pushState({ path: newurl }, '', newurl);

    this.enemies.forEach(function (enemy) {
        enemy.kill();
    });

    this.enemies = this.game.add.group();

    _EventHandler2.default.emit('players update', data.room.players);

    data.room.players.forEach(function (player) {
        if (player.id === '/#' + _this.socket.id) {
            _EventHandler2.default.emit('score update', String(player.meta.score));
            _EventHandler2.default.emit('health update', String(player.meta.health));
            _EventHandler2.default.emit('player update', { player: player });
            return;
        }

        var newRemotePlayer = _RemotePlayer2.default.call(_this, player);
        _this.enemies.add(newRemotePlayer);
    });
}

},{"../EventHandler":8,"../RemotePlayer":22}],34:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _FireStandardBullet = require('../FireStandardBullet');

var _FireStandardBullet2 = _interopRequireDefault(_FireStandardBullet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AK47 = function (_Phaser$Group) {
    _inherits(AK47, _Phaser$Group);

    function AK47(rootScope) {
        _classCallCheck(this, AK47);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AK47).call(this, rootScope));

        _this.rootScope = rootScope;

        Phaser.Group.call(_this, _this.rootScope.game, _this.rootScope.game.world, 'AK-47', false, true, Phaser.Physics.ARCADE);

        _this.bulletHeight = 2;
        _this.bulletSpeed = 2300;
        _this.bulletWidth = 40;
        _this.damage = 22;
        _this.fireRate = 160;
        _this.fx = _this.rootScope.game.add.audio('AK47-sound');
        _this.nextFire = 0;
        return _this;
    }

    _createClass(AK47, [{
        key: 'fire',
        value: function fire() {
            if (this.rootScope.game.time.now < this.nextFire || this.rootScope.bullets.countDead() <= 0) return;

            this.nextFire = this.rootScope.game.time.now + this.fireRate;

            _FireStandardBullet2.default.call(this);
        }
    }]);

    return AK47;
}(Phaser.Group);

exports.default = AK47;

},{"../FireStandardBullet":11}],35:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _FireStandardBullet = require('../FireStandardBullet');

var _FireStandardBullet2 = _interopRequireDefault(_FireStandardBullet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AUG = function (_Phaser$Group) {
    _inherits(AUG, _Phaser$Group);

    function AUG(rootScope) {
        _classCallCheck(this, AUG);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AUG).call(this, rootScope));

        _this.rootScope = rootScope;

        Phaser.Group.call(_this, _this.rootScope.game, _this.rootScope.game.world, 'AUG', false, true, Phaser.Physics.ARCADE);

        _this.bulletHeight = 2;
        _this.bulletSpeed = 2300;
        _this.bulletWidth = 40;
        _this.damage = 22;
        _this.fireRate = 160;
        _this.fx = _this.rootScope.game.add.audio('AUG-sound');
        _this.nextFire = 0;
        return _this;
    }

    _createClass(AUG, [{
        key: 'fire',
        value: function fire() {
            if (this.rootScope.game.time.now < this.nextFire || this.rootScope.bullets.countDead() <= 0) return;

            this.nextFire = this.rootScope.game.time.now + this.fireRate;

            _FireStandardBullet2.default.call(this);
        }
    }]);

    return AUG;
}(Phaser.Group);

exports.default = AUG;

},{"../FireStandardBullet":11}],36:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _FireStandardBullet = require('../FireStandardBullet');

var _FireStandardBullet2 = _interopRequireDefault(_FireStandardBullet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Barrett = function (_Phaser$Group) {
    _inherits(Barrett, _Phaser$Group);

    function Barrett(rootScope) {
        _classCallCheck(this, Barrett);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Barrett).call(this, rootScope));

        _this.rootScope = rootScope;

        Phaser.Group.call(_this, _this.rootScope.game, _this.rootScope.game.world, 'AK-47', false, true, Phaser.Physics.ARCADE);

        _this.bulletHeight = 2;
        _this.bulletSpeed = 3435;
        _this.bulletWidth = 40;
        _this.damage = 88;
        _this.fireRate = 3000;
        _this.fx = _this.rootScope.game.add.audio('BarretM90-sound');
        _this.nextFire = 0;
        return _this;
    }

    _createClass(Barrett, [{
        key: 'fire',
        value: function fire() {
            if (this.rootScope.game.time.now < this.nextFire || this.rootScope.bullets.countDead() <= 0) return;

            this.nextFire = this.rootScope.game.time.now + this.fireRate;

            _FireStandardBullet2.default.call(this);
        }
    }]);

    return Barrett;
}(Phaser.Group);

exports.default = Barrett;

},{"../FireStandardBullet":11}],37:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _FireStandardBullet = require('../FireStandardBullet');

var _FireStandardBullet2 = _interopRequireDefault(_FireStandardBullet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DesertEagle = function (_Phaser$Group) {
    _inherits(DesertEagle, _Phaser$Group);

    function DesertEagle(rootScope) {
        _classCallCheck(this, DesertEagle);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(DesertEagle).call(this, rootScope));

        _this.rootScope = rootScope;

        Phaser.Group.call(_this, rootScope.game, rootScope.game.world, 'Desert Eagle', false, true, Phaser.Physics.ARCADE);

        _this.bulletHeight = 2;
        _this.bulletSpeed = 2300;
        _this.bulletWidth = 40;
        _this.damage = 33;
        _this.fireRate = 267;
        _this.fx = rootScope.game.add.audio('DesertEagle-sound');
        _this.nextFire = 0;
        return _this;
    }

    _createClass(DesertEagle, [{
        key: 'fire',
        value: function fire() {
            if (this.rootScope.game.time.now < this.nextFire || this.rootScope.bullets.countDead() <= 0) return;

            this.nextFire = this.rootScope.game.time.now + this.fireRate;

            _FireStandardBullet2.default.call(this);
        }
    }]);

    return DesertEagle;
}(Phaser.Group);

exports.default = DesertEagle;

},{"../FireStandardBullet":11}],38:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _FireStandardBullet = require('../FireStandardBullet');

var _FireStandardBullet2 = _interopRequireDefault(_FireStandardBullet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var G43 = function (_Phaser$Group) {
    _inherits(G43, _Phaser$Group);

    function G43(rootScope) {
        _classCallCheck(this, G43);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(G43).call(this, rootScope));

        _this.rootScope = rootScope;

        Phaser.Group.call(_this, _this.rootScope.game, _this.rootScope.game.world, 'G43', false, true, Phaser.Physics.ARCADE);

        _this.bulletHeight = 2;
        _this.bulletSpeed = 2300;
        _this.bulletWidth = 40;
        _this.damage = 44;
        _this.fireRate = 1300;
        _this.fx = _this.rootScope.game.add.audio('G43-sound');
        _this.nextFire = 0;
        return _this;
    }

    _createClass(G43, [{
        key: 'fire',
        value: function fire() {
            if (this.rootScope.game.time.now < this.nextFire || this.rootScope.bullets.countDead() <= 0) return;

            this.nextFire = this.rootScope.game.time.now + this.fireRate;

            _FireStandardBullet2.default.call(this);
        }
    }]);

    return G43;
}(Phaser.Group);

exports.default = G43;

},{"../FireStandardBullet":11}],39:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _FireStandardBullet = require('../FireStandardBullet');

var _FireStandardBullet2 = _interopRequireDefault(_FireStandardBullet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var M4A1 = function (_Phaser$Group) {
    _inherits(M4A1, _Phaser$Group);

    function M4A1(rootScope) {
        _classCallCheck(this, M4A1);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(M4A1).call(this, rootScope));

        _this.rootScope = rootScope;

        Phaser.Group.call(_this, _this.rootScope.game, _this.rootScope.game.world, 'M4A1', false, true, Phaser.Physics.ARCADE);

        _this.bulletHeight = 2;
        _this.bulletSpeed = 2400;
        _this.bulletWidth = 40;
        _this.damage = 20;
        _this.fireRate = 150;
        _this.fx = _this.rootScope.game.add.audio('M4A1-sound');
        _this.nextFire = 0;
        return _this;
    }

    _createClass(M4A1, [{
        key: 'fire',
        value: function fire() {
            if (this.rootScope.game.time.now < this.nextFire || this.rootScope.bullets.countDead() <= 0) return;

            this.nextFire = this.rootScope.game.time.now + this.fireRate;

            _FireStandardBullet2.default.call(this);
        }
    }]);

    return M4A1;
}(Phaser.Group);

exports.default = M4A1;

},{"../FireStandardBullet":11}],40:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _FireShotgunShell = require('../FireShotgunShell');

var _FireShotgunShell2 = _interopRequireDefault(_FireShotgunShell);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var M500 = function (_Phaser$Group) {
    _inherits(M500, _Phaser$Group);

    function M500(rootScope) {
        _classCallCheck(this, M500);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(M500).call(this, rootScope));

        _this.rootScope = rootScope;

        Phaser.Group.call(_this, _this.rootScope.game, _this.rootScope.game.world, 'M500', false, true, Phaser.Physics.ARCADE);

        _this.bulletHeight = 2;
        _this.bulletSpeed = 1900;
        _this.bulletWidth = 40;
        _this.fireRate = 1650;
        _this.fx = _this.rootScope.game.add.audio('M500-sound');
        _this.nextFire = 0;
        return _this;
    }

    _createClass(M500, [{
        key: 'fire',
        value: function fire() {
            if (this.rootScope.game.time.now < this.nextFire || this.rootScope.bullets.countDead() <= 0) return;

            this.nextFire = this.rootScope.game.time.now + this.fireRate;

            _FireShotgunShell2.default.call(this);
        }
    }]);

    return M500;
}(Phaser.Group);

exports.default = M500;

},{"../FireShotgunShell":10}],41:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _FireStandardBullet = require('../FireStandardBullet');

var _FireStandardBullet2 = _interopRequireDefault(_FireStandardBullet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var P90 = function (_Phaser$Group) {
    _inherits(P90, _Phaser$Group);

    function P90(rootScope) {
        _classCallCheck(this, P90);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(P90).call(this, rootScope));

        _this.rootScope = rootScope;

        Phaser.Group.call(_this, _this.rootScope.game, _this.rootScope.game.world, 'P90', false, true, Phaser.Physics.ARCADE);

        _this.bulletHeight = 2;
        _this.bulletSpeed = 2300;
        _this.bulletWidth = 40;
        _this.damage = 22;
        _this.fireRate = 120;
        _this.fx = _this.rootScope.game.add.audio('P90-sound');
        _this.nextFire = 0;
        return _this;
    }

    _createClass(P90, [{
        key: 'fire',
        value: function fire() {
            if (this.rootScope.game.time.now < this.nextFire || this.rootScope.bullets.countDead() <= 0) return;

            this.nextFire = this.rootScope.game.time.now + this.fireRate;

            _FireStandardBullet2.default.call(this);
        }
    }]);

    return P90;
}(Phaser.Group);

exports.default = P90;

},{"../FireStandardBullet":11}],42:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _FireRocket = require('../FireRocket');

var _FireRocket2 = _interopRequireDefault(_FireRocket);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RPG = function (_Phaser$Group) {
    _inherits(RPG, _Phaser$Group);

    function RPG(rootScope) {
        _classCallCheck(this, RPG);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(RPG).call(this, rootScope));

        _this.rootScope = rootScope;

        Phaser.Group.call(_this, _this.rootScope.game, _this.rootScope.game.world, 'AK-47', false, true, Phaser.Physics.ARCADE);

        _this.bulletHeight = 2;
        _this.bulletSpeed = 2300;
        _this.bulletWidth = 40;
        _this.damage = 22;
        _this.fireRate = 3000;
        _this.fx = _this.rootScope.game.add.audio('RPG-sound');
        _this.nextFire = 0;
        return _this;
    }

    _createClass(RPG, [{
        key: 'fire',
        value: function fire() {
            if (this.rootScope.game.time.now < this.nextFire || this.rootScope.bullets.countDead() <= 0) return;

            this.nextFire = this.rootScope.game.time.now + this.fireRate;

            _FireRocket2.default.call(this);
        }
    }]);

    return RPG;
}(Phaser.Group);

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


exports.default = RPG;

},{"../FireRocket":9}],43:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _FireStandardBullet = require('../FireStandardBullet');

var _FireStandardBullet2 = _interopRequireDefault(_FireStandardBullet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Skorpion = function (_Phaser$Group) {
    _inherits(Skorpion, _Phaser$Group);

    function Skorpion(rootScope) {
        _classCallCheck(this, Skorpion);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Skorpion).call(this, rootScope));

        _this.rootScope = rootScope;

        Phaser.Group.call(_this, _this.rootScope.game, _this.rootScope.game.world, 'Skorpion', false, true, Phaser.Physics.ARCADE);

        _this.bulletHeight = 2;
        _this.bulletSpeed = 2300;
        _this.bulletWidth = 40;
        _this.damage = 22;
        _this.fireRate = 120;
        _this.fx = _this.rootScope.game.add.audio('Skorpion-sound');
        _this.nextFire = 0;
        return _this;
    }

    _createClass(Skorpion, [{
        key: 'fire',
        value: function fire() {
            if (this.rootScope.game.time.now < this.nextFire || this.rootScope.bullets.countDead() <= 0) return;

            this.nextFire = this.rootScope.game.time.now + this.fireRate;

            _FireStandardBullet2.default.call(this);
        }
    }]);

    return Skorpion;
}(Phaser.Group);

exports.default = Skorpion;

},{"../FireStandardBullet":11}],44:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _AK = require('./AK47');

var _AK2 = _interopRequireDefault(_AK);

var _AUG = require('./AUG');

var _AUG2 = _interopRequireDefault(_AUG);

var _Barrett = require('./Barrett');

var _Barrett2 = _interopRequireDefault(_Barrett);

var _DesertEagle = require('./DesertEagle');

var _DesertEagle2 = _interopRequireDefault(_DesertEagle);

var _G = require('./G43');

var _G2 = _interopRequireDefault(_G);

var _M4A = require('./M4A1');

var _M4A2 = _interopRequireDefault(_M4A);

var _M = require('./M500');

var _M2 = _interopRequireDefault(_M);

var _P = require('./P90');

var _P2 = _interopRequireDefault(_P);

var _RPG = require('./RPG');

var _RPG2 = _interopRequireDefault(_RPG);

var _Skorpion = require('./Skorpion');

var _Skorpion2 = _interopRequireDefault(_Skorpion);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
    AK47: _AK2.default,
    AUG: _AUG2.default,
    Barrett: _Barrett2.default,
    DesertEagle: _DesertEagle2.default,
    G43: _G2.default,
    M4A1: _M4A2.default,
    M500: _M2.default,
    P90: _P2.default,
    RPG: _RPG2.default,
    Skorpion: _Skorpion2.default
};

},{"./AK47":34,"./AUG":35,"./Barrett":36,"./DesertEagle":37,"./G43":38,"./M4A1":39,"./M500":40,"./P90":41,"./RPG":42,"./Skorpion":43}],45:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var spawnPoints = [{ x: 815, y: 1730 }, { x: 3380, y: 1030 }, { x: 4437, y: 1550 }, { x: 6690, y: 1860 }, { x: 3832, y: 3350 }, { x: 3775, y: 2300 }, { x: 2420, y: 2900 }];

var ledges = [{ id: 1, x: 2145, y: 2065, width: 135, height: 40 }, { id: 2, x: 2613, y: 1094, width: 1100, height: 112 }, { id: 3, x: 3657, y: 3446, width: 500, height: 600 }, { id: 4, x: 5217, y: 1938, width: 380, height: 600 }, { id: 5, x: 422, y: 1824, width: 1150, height: 300 }, { id: 6, x: 1555, y: 1749, width: 270, height: 730 }, { id: 7, x: 1820, y: 1749, width: 470, height: 6 }, { id: 8, x: 2275, y: 1749, width: 320, height: 630 }, { id: 9, x: 2595, y: 1667, width: 1120, height: 260 }, { id: 10, x: 4304, y: 1621, width: 375, height: 1300 }, { id: 11, x: 1825, y: 2298, width: 160, height: 152 }, { id: 12, x: 5644, y: 1573, width: 330, height: 20 }, { id: 13, x: 4673, y: 2017, width: 570, height: 254 }, { id: 14, x: 2948, y: 3137, width: 380, height: 300 }, { id: 15, x: 3983, y: 2028, width: 341, height: 700 }, { id: 16, x: 1912, y: 2967, width: 1045, height: 500 }, { id: 17, x: 6628, y: 1590, width: 385, height: 37 }, { id: 18, x: 6628, y: 1178, width: 385, height: 37 }, { id: 19, x: 5590, y: 2038, width: 350, height: 600 }, { id: 20, x: 6984, y: 1989, width: 450, height: 167 }, { id: 21, x: 3672, y: 2401, width: 330, height: 500 }, { id: 22, x: 3303, y: 2599, width: 400, height: 300 }, { id: 23, x: 5940, y: 2018, width: 1050, height: 600 }];

var HighRuleJungle = function () {
    function HighRuleJungle(rootScope) {
        _classCallCheck(this, HighRuleJungle);

        this.rootScope = rootScope;
    }

    _createClass(HighRuleJungle, [{
        key: 'getRandomSpawnPoint',
        value: function getRandomSpawnPoint() {
            return _.sample(spawnPoints);
        }
    }, {
        key: 'create',
        value: function create() {
            this.rootScope.skysprite = this.rootScope.add.tileSprite(0, 0, this.rootScope.game.world.width, this.rootScope.game.world.height, 'map-bg');
            this.rootScope.platforms = this.rootScope.add.group();
            this.rootScope.platforms.enableBody = true;
            this.createLedges();
            this.rootScope.platforms.setAll('body.immovable', true);
            this.rootScope.platforms.setAll('body.allowGravity', false);
        }
    }, {
        key: 'createLedges',
        value: function createLedges() {
            var _this = this;

            ledges.forEach(function (ledge) {
                // var newLedge = this.rootScope.platforms.create(ledge.x, ledge.y, 'ground')
                var newLedge = _this.rootScope.platforms.create(ledge.x, ledge.y);
                newLedge.height = ledge.height;
                newLedge.width = ledge.width;

                // Debug stuff
                // newLedge.alpha = 0.4
                // let style = { font: "20px Arial", fill: "#ff0044", align: "center", backgroundColor: "#ffff00" }
                // let text = this.rootScope.game.add.text(ledge.x, ledge.y, ledge.id, style)
                // text.alpha = 0.2
            });
        }
    }]);

    return HighRuleJungle;
}();

exports.default = HighRuleJungle;

},{}],46:[function(require,module,exports){
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

},{"es5-ext/object/assign":47,"es5-ext/object/is-callable":50,"es5-ext/object/normalize-options":54,"es5-ext/string/#/contains":57}],47:[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')() ? Object.assign : require('./shim');

},{"./is-implemented":48,"./shim":49}],48:[function(require,module,exports){
'use strict';

module.exports = function () {
	var assign = Object.assign,
	    obj;
	if (typeof assign !== 'function') return false;
	obj = { foo: 'raz' };
	assign(obj, { bar: 'dwa' }, { trzy: 'trzy' });
	return obj.foo + obj.bar + obj.trzy === 'razdwatrzy';
};

},{}],49:[function(require,module,exports){
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

},{"../keys":51,"../valid-value":56}],50:[function(require,module,exports){
// Deprecated

'use strict';

module.exports = function (obj) {
  return typeof obj === 'function';
};

},{}],51:[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')() ? Object.keys : require('./shim');

},{"./is-implemented":52,"./shim":53}],52:[function(require,module,exports){
'use strict';

module.exports = function () {
	try {
		Object.keys('primitive');
		return true;
	} catch (e) {
		return false;
	}
};

},{}],53:[function(require,module,exports){
'use strict';

var keys = Object.keys;

module.exports = function (object) {
	return keys(object == null ? object : Object(object));
};

},{}],54:[function(require,module,exports){
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

},{}],55:[function(require,module,exports){
'use strict';

module.exports = function (fn) {
	if (typeof fn !== 'function') throw new TypeError(fn + " is not a function");
	return fn;
};

},{}],56:[function(require,module,exports){
'use strict';

module.exports = function (value) {
	if (value == null) throw new TypeError("Cannot use null or undefined");
	return value;
};

},{}],57:[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')() ? String.prototype.contains : require('./shim');

},{"./is-implemented":58,"./shim":59}],58:[function(require,module,exports){
'use strict';

var str = 'razdwatrzy';

module.exports = function () {
	if (typeof str.contains !== 'function') return false;
	return str.contains('dwa') === true && str.contains('foo') === false;
};

},{}],59:[function(require,module,exports){
'use strict';

var indexOf = String.prototype.indexOf;

module.exports = function (searchString /*, position*/) {
	return indexOf.call(this, searchString, arguments[1]) > -1;
};

},{}],60:[function(require,module,exports){
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

},{"d":46,"es5-ext/object/valid-callable":55}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvYXBwLmpzIiwiYXNzZXRzL2pzL2NvcmUvQ3JlYXRlLmpzIiwiYXNzZXRzL2pzL2NvcmUvSW5pdC5qcyIsImFzc2V0cy9qcy9jb3JlL1ByZWxvYWQuanMiLCJhc3NldHMvanMvY29yZS9VcGRhdGUuanMiLCJhc3NldHMvanMvZ2FtZS5qcyIsImFzc2V0cy9qcy9saWIvQ29sbGlzaW9uSGFuZGxlci5qcyIsImFzc2V0cy9qcy9saWIvRXZlbnRIYW5kbGVyLmpzIiwiYXNzZXRzL2pzL2xpYi9GaXJlUm9ja2V0LmpzIiwiYXNzZXRzL2pzL2xpYi9GaXJlU2hvdGd1blNoZWxsLmpzIiwiYXNzZXRzL2pzL2xpYi9GaXJlU3RhbmRhcmRCdWxsZXQuanMiLCJhc3NldHMvanMvbGliL0dhbWVDb25zdHMuanMiLCJhc3NldHMvanMvbGliL0dldFF1ZXJ5U3RyaW5nLmpzIiwiYXNzZXRzL2pzL2xpYi9HdWlkLmpzIiwiYXNzZXRzL2pzL2xpYi9JbnB1dEhlbHBlcnMuanMiLCJhc3NldHMvanMvbGliL1BsYXllckFuZ2xlSGFuZGxlci5qcyIsImFzc2V0cy9qcy9saWIvUGxheWVyQnlJZC5qcyIsImFzc2V0cy9qcy9saWIvUGxheWVyRmFjZUhhbmRsZXIuanMiLCJhc3NldHMvanMvbGliL1BsYXllckp1bXBIYW5kbGVyLmpzIiwiYXNzZXRzL2pzL2xpYi9QbGF5ZXJNb3ZlbWVudEhhbmRsZXIuanMiLCJhc3NldHMvanMvbGliL1JlbW90ZUJ1bGxldC5qcyIsImFzc2V0cy9qcy9saWIvUmVtb3RlUGxheWVyLmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvU2V0RXZlbnRIYW5kbGVycy5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL29uQnVsbGV0RmlyZWQuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vbkJ1bGxldFJlbW92ZWQuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vbk1vdmVQbGF5ZXIuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vblBsYXllckRhbWFnZWQuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vblBsYXllckhlYWx0aFVwZGF0ZS5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL29uUGxheWVyUmVzcGF3bi5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL29uUmVtb3ZlUGxheWVyLmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvb25Tb2NrZXRDb25uZWN0ZWQuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vblNvY2tldERpc2Nvbm5lY3QuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vblVwZGF0ZVBsYXllcnMuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvQUs0Ny5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9BVUcuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvQmFycmV0dC5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9EZXNlcnRFYWdsZS5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9HNDMuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvTTRBMS5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9NNTAwLmpzIiwiYXNzZXRzL2pzL2xpYi9XZWFwb25zL1A5MC5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9SUEcuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvU2tvcnBpb24uanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvaW5kZXguanMiLCJhc3NldHMvanMvbWFwcy9IaWdoUnVsZUp1bmdsZS5qcyIsIm5vZGVfbW9kdWxlcy9kL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2VzNS1leHQvb2JqZWN0L2Fzc2lnbi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L29iamVjdC9hc3NpZ24vaXMtaW1wbGVtZW50ZWQuanMiLCJub2RlX21vZHVsZXMvZXM1LWV4dC9vYmplY3QvYXNzaWduL3NoaW0uanMiLCJub2RlX21vZHVsZXMvZXM1LWV4dC9vYmplY3QvaXMtY2FsbGFibGUuanMiLCJub2RlX21vZHVsZXMvZXM1LWV4dC9vYmplY3Qva2V5cy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L29iamVjdC9rZXlzL2lzLWltcGxlbWVudGVkLmpzIiwibm9kZV9tb2R1bGVzL2VzNS1leHQvb2JqZWN0L2tleXMvc2hpbS5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L29iamVjdC9ub3JtYWxpemUtb3B0aW9ucy5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L29iamVjdC92YWxpZC1jYWxsYWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L29iamVjdC92YWxpZC12YWx1ZS5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L3N0cmluZy8jL2NvbnRhaW5zL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2VzNS1leHQvc3RyaW5nLyMvY29udGFpbnMvaXMtaW1wbGVtZW50ZWQuanMiLCJub2RlX21vZHVsZXMvZXM1LWV4dC9zdHJpbmcvIy9jb250YWlucy9zaGltLmpzIiwibm9kZV9tb2R1bGVzL2V2ZW50LWVtaXR0ZXIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLE9BQU8sT0FBUCxHQUFpQjtBQUNiLGlCQUFhLEtBQWI7QUFDQSxXQUFPLEtBQVA7QUFDQSxpQkFBYSxLQUFiO0FBQ0EsaUJBQWEsS0FBYjtBQUNBLG1CQUFlLGtCQUFmO0FBQ0EsdUJBQW1CLEtBQW5CO0FBQ0EsYUFBUyxJQUFUO0FBQ0Esa0JBQWMsR0FBZDtBQUNBLGtCQUFjLElBQWQ7QUFDQSxhQUFTLElBQVQ7QUFDQSxxQkFBaUIsSUFBakI7QUFDQSxnQkFBWSxPQUFaO0FBQ0EsZ0JBQVksUUFBWjtBQUNBLGdCQUFZLFFBQVo7QUFDQSxnQkFBWSxTQUFaO0NBZko7OztBQW1CQSxRQUFRLFFBQVI7Ozs7Ozs7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RkQ7QUFQQTtBQVdDLFFBQUksVUFBVSxNQUFWLENBREw7QUFFQyxXQUFPLElBQUksS0FBSixDQUFVLElBQUksQ0FBSixDQUFqQixDQUZEO0FBR0MsU0FBSyxJQUFJLENBQUosRUFBTyxJQUFJLENBQUosRUFBTyxFQUFFLENBQUYsRUFBSztBQUN2QixVQUFLLElBQUksQ0FBSixDQUFMLEdBQWMsVUFBVSxDQUFWLENBQWQsQ0FEdUI7S0FBeEI7QUFHQSxVQUFNLElBQU4sQ0FBVyxTQUFYLEVBQXNCLElBQXRCLEVBQTRCLElBQTVCLEVBTkQ7QUFWQSxHQURNO0VBVFA7Q0FQTTs7QUFzQ1AsVUFBVTtBQUNULEtBQUksRUFBSjtBQUNBLE9BQU0sTUFBTjtBQUNBLE1BQUssR0FBTDtBQUNBLE9BQU0sSUFBTjtDQUpEOztBQU9BLGNBQWM7QUFDYixLQUFJLEVBQUUsRUFBRixDQUFKO0FBQ0EsT0FBTSxFQUFFLE1BQUYsQ0FBTjtBQUNBLE1BQUssRUFBRSxHQUFGLENBQUw7QUFDQSxPQUFNLEVBQUUsSUFBRixDQUFOO0NBSkQ7O0FBT0EsT0FBTyxpQkFBaUIsRUFBakIsRUFBcUIsV0FBckIsQ0FBUDs7QUFFQSxPQUFPLE9BQVAsR0FBaUIsVUFBVSxpQkFBVSxDQUFWLEVBQWE7QUFDdkMsUUFBTyxDQUFDLElBQUssSUFBTCxHQUFhLE9BQU8sSUFBUCxDQUFkLEdBQTZCLGlCQUFpQixPQUFPLENBQVAsQ0FBakIsRUFBNEIsV0FBNUIsQ0FBN0IsQ0FEZ0M7Q0FBYjtBQUczQixRQUFRLE9BQVIsR0FBa0IsT0FBbEIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidG9hc3RyLm9wdGlvbnMgPSB7XG4gICAgY2xvc2VCdXR0b246IGZhbHNlLFxuICAgIGRlYnVnOiBmYWxzZSxcbiAgICBuZXdlc3RPblRvcDogZmFsc2UsXG4gICAgcHJvZ3Jlc3NCYXI6IGZhbHNlLFxuICAgIHBvc2l0aW9uQ2xhc3M6ICd0b2FzdC10b3AtY2VudGVyJyxcbiAgICBwcmV2ZW50RHVwbGljYXRlczogZmFsc2UsXG4gICAgb25jbGljazogbnVsbCxcbiAgICBzaG93RHVyYXRpb246IDMwMCxcbiAgICBoaWRlRHVyYXRpb246IDEwMDAsXG4gICAgdGltZU91dDogMzAwMCxcbiAgICBleHRlbmRlZFRpbWVPdXQ6IDEwMDAsXG4gICAgc2hvd0Vhc2luZzogJ3N3aW5nJyxcbiAgICBoaWRlRWFzaW5nOiAnbGluZWFyJyxcbiAgICBzaG93TWV0aG9kOiAnZmFkZUluJyxcbiAgICBoaWRlTWV0aG9kOiAnZmFkZU91dCdcbn1cblxuLy8gcmVxdWlyZSgnLi91aScpXG5yZXF1aXJlKCcuL2dhbWUnKVxuIiwiaW1wb3J0IEdhbWVDb25zdHMgZnJvbSAnLi4vbGliL0dhbWVDb25zdHMnXG5pbXBvcnQgU2V0RXZlbnRIYW5kbGVycyBmcm9tICcuLi9saWIvU29ja2V0RXZlbnRzL1NldEV2ZW50SGFuZGxlcnMnXG5pbXBvcnQgRXZlbnRIYW5kbGVyIGZyb20gJy4uL2xpYi9FdmVudEhhbmRsZXInXG5pbXBvcnQgSGlnaFJ1bGVKdW5nbGUgZnJvbSAnLi4vbWFwcy9IaWdoUnVsZUp1bmdsZSdcbmltcG9ydCBXZWFwb25zIGZyb20gJy4uL2xpYi9XZWFwb25zJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBDcmVhdGUoKSB7XG4gICAgdGhpcy5zb2NrZXQgPSBpby5jb25uZWN0KClcbiAgICB0aGlzLmVuZW1pZXMgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKClcblxuICAgIHRoaXMudm9sdW1lID0gR2FtZUNvbnN0cy5TVEFSVElOR19WT0xVTUVcbiAgICB0aGlzLmVuZW15QnVsbGV0cyA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKVxuICAgIHRoaXMuZW5lbXlCdWxsZXRzLmVuYWJsZUJvZHkgPSB0cnVlXG4gICAgdGhpcy5lbmVteUJ1bGxldHMucGh5c2ljc0JvZHlUeXBlID0gUGhhc2VyLlBoeXNpY3MuQVJDQURFXG5cbiAgICAvLyAgV2UncmUgZ29pbmcgdG8gYmUgdXNpbmcgcGh5c2ljcywgc28gZW5hYmxlIHRoZSBBcmNhZGUgUGh5c2ljcyBzeXN0ZW1cbiAgICB0aGlzLnBoeXNpY3Muc3RhcnRTeXN0ZW0oUGhhc2VyLlBoeXNpY3MuQVJDQURFKVxuXG4gICAgdGhpcy53b3JsZC5zZXRCb3VuZHMoMCwgMCwgR2FtZUNvbnN0cy5XT1JMRF9XSURUSCwgR2FtZUNvbnN0cy5XT1JMRF9IRUlHSFQpXG5cbiAgICAvLyBTY2FsZSBnYW1lIG9uIHdpbmRvdyByZXNpemVcbiAgICB0aGlzLmdhbWUuc2NhbGUuc2NhbGVNb2RlID0gUGhhc2VyLlNjYWxlTWFuYWdlci5SRVNJWkVcbiAgICB0aGlzLmdhbWUuc2NhbGUuc2V0U2hvd0FsbCgpXG4gICAgdGhpcy5nYW1lLnNjYWxlLnJlZnJlc2goKVxuXG5cbiAgICAvKipcbiAgICAgKiBNYXBcbiAgICAgKi9cbiAgICB0aGlzLm1hcEluc3RhbmNlID0gbmV3IEhpZ2hSdWxlSnVuZ2xlKHRoaXMpXG4gICAgdGhpcy5tYXBJbnN0YW5jZS5jcmVhdGUoKVxuXG5cbiAgICAvKipcbiAgICAgKiBCdWxsZXQgU2V0dGluZ3NcbiAgICAgKi9cbiAgICB0aGlzLmJ1bGxldHMgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKClcbiAgICB0aGlzLmJ1bGxldHMuZW5hYmxlQm9keSA9IHRydWVcbiAgICB0aGlzLnBoeXNpY3NCb2R5VHlwZSA9IFBoYXNlci5QaHlzaWNzLkFSQ0FERVxuICAgIHRoaXMuYnVsbGV0cy5jcmVhdGVNdWx0aXBsZSg1MCwgJ2J1bGxldDEyJylcbiAgICB0aGlzLmJ1bGxldHMuc2V0QWxsKCdjaGVja1dvcmxkQm91bmRzJywgdHJ1ZSlcbiAgICB0aGlzLmJ1bGxldHMuc2V0QWxsKCdvdXRPZkJvdW5kc0tpbGwnLCB0cnVlKVxuXG5cbiAgICAvKipcbiAgICAgKiBQbGF5ZXIgU2V0dGluZ3NcbiAgICAgKi9cbiAgICBsZXQgc3Bhd25Qb2ludCA9IHRoaXMubWFwSW5zdGFuY2UuZ2V0UmFuZG9tU3Bhd25Qb2ludCgpXG4gICAgdGhpcy5wbGF5ZXIgPSB0aGlzLmFkZC5zcHJpdGUoc3Bhd25Qb2ludC54LCBzcGF3blBvaW50LnksICdjb21tYW5kbycpXG4gICAgdGhpcy5wbGF5ZXIuc2NhbGUuc2V0VG8oR2FtZUNvbnN0cy5QTEFZRVJfU0NBTEUpXG4gICAgdGhpcy5wbGF5ZXIuYW5jaG9yLnNldFRvKEdhbWVDb25zdHMuUExBWUVSX0FOQ0hPUilcblxuICAgIC8vICBXZSBuZWVkIHRvIGVuYWJsZSBwaHlzaWNzIG9uIHRoZSBwbGF5ZXJcbiAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmVuYWJsZSh0aGlzLnBsYXllcilcblxuICAgIC8vIEVuYWJsZSBwaHlzaWNzIG9uIHRoZSBwbGF5ZXJcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5lbmFibGUodGhpcy5wbGF5ZXIsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSlcblxuICAgIC8vIE1ha2UgcGxheWVyIGNvbGxpZGUgd2l0aCB3b3JsZCBib3VuZGFyaWVzIHNvIGhlIGRvZXNuJ3QgbGVhdmUgdGhlIHN0YWdlXG4gICAgdGhpcy5wbGF5ZXIuYm9keS5jb2xsaWRlV29ybGRCb3VuZHMgPSB0cnVlXG5cbiAgICAvLyBTZXQgcGxheWVyIG1pbmltdW0gYW5kIG1heGltdW0gbW92ZW1lbnQgc3BlZWRcbiAgICB0aGlzLnBsYXllci5ib2R5Lm1heFZlbG9jaXR5LnNldFRvKEdhbWVDb25zdHMuTUFYX1NQRUVELCBHYW1lQ29uc3RzLk1BWF9TUEVFRCAqIDEwKSAvLyB4LCB5XG5cbiAgICAvLyBBZGQgZHJhZyB0byB0aGUgcGxheWVyIHRoYXQgc2xvd3MgdGhlbSBkb3duIHdoZW4gdGhleSBhcmUgbm90IGFjY2VsZXJhdGluZ1xuICAgIHRoaXMucGxheWVyLmJvZHkuZHJhZy5zZXRUbyhHYW1lQ29uc3RzLkRSQUcsIDApIC8vIHgsIHlcbiAgICB0aGlzLnBsYXllci5ib2R5LnNldFNpemUoMjMwLCAyOTAsIC0xMCwgMClcbiAgICB0aGlzLnBsYXllci5tZXRhID0ge1xuICAgICAgICBoZWFsdGg6IDEwMFxuICAgIH1cblxuICAgIC8vIFNpbmNlIHdlJ3JlIGp1bXBpbmcgd2UgbmVlZCBncmF2aXR5XG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmdyYXZpdHkueSA9IEdhbWVDb25zdHMuR1JBVklUWVxuXG4gICAgLy8gRmxhZyB0byB0cmFjayBpZiB0aGUganVtcCBidXR0b24gaXMgcHJlc3NlZFxuICAgIHRoaXMuanVtcGluZyA9IGZhbHNlXG5cbiAgICAvLyAgT3VyIHR3byBhbmltYXRpb25zLCB3YWxraW5nIGxlZnQgYW5kIHJpZ2h0LlxuICAgIHRoaXMucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdsZWZ0JywgR2FtZUNvbnN0cy5BTklNQVRJT05fTEVGVCwgR2FtZUNvbnN0cy5BTklNQVRJT05fRlJBTUVSQVRFLCB0cnVlKVxuICAgIHRoaXMucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdyaWdodCcsIEdhbWVDb25zdHMuQU5JTUFUSU9OX1JJR0hULCBHYW1lQ29uc3RzLkFOSU1BVElPTl9GUkFNRVJBVEUsIHRydWUpXG5cbiAgICB0aGlzLnBsYXllci5tZXRhID0ge1xuICAgICAgICBoZWFsdGg6IDEwMCxcbiAgICAgICAgcHJpbWFyeVdlYXBvbjogbmV3IFdlYXBvbnMuQUs0Nyh0aGlzKSxcbiAgICAgICAgc2Vjb25kYXJ5V2VhcG9uOiBuZXcgV2VhcG9ucy5EZXNlcnRFYWdsZSh0aGlzKSxcbiAgICAgICAgc2VsZWN0ZWRQcmltYXJ5V2VhcG9uSWQ6ICdBSzQ3JyxcbiAgICAgICAgc2VsZWN0ZWRTZWNvbmRhcnlXZWFwb25JZDogJ0Rlc2VydEVhZ2xlJ1xuICAgIH1cblxuICAgIHRoaXMucGxheWVyLm1ldGEucHJpbWFyeVdlYXBvbi5pZCA9ICdBSzQ3J1xuICAgIHRoaXMucGxheWVyLm1ldGEuc2Vjb25kYXJ5V2VhcG9uLmlkID0gJ0Rlc2VydEVhZ2xlJ1xuXG4gICAgdGhpcy5sZWZ0QXJtR3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKClcbiAgICB0aGlzLnJpZ2h0QXJtR3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKClcbiAgICB0aGlzLmhlYWRHcm91cCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKVxuICAgIHRoaXMudG9yc29Hcm91cCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKVxuXG4gICAgLy8gVG9yc29cbiAgICB0aGlzLnRvcnNvU3ByaXRlID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUoLTM3LCAtMTA1LCAndG9yc28nKVxuICAgIHRoaXMudG9yc29TcHJpdGUuc2NhbGUuc2V0VG8oMS44KVxuICAgIHRoaXMudG9yc29Hcm91cC5hZGQodGhpcy50b3Jzb1Nwcml0ZSlcblxuICAgIC8vIEhlYWRcbiAgICB0aGlzLmhlYWRTcHJpdGUgPSB0aGlzLmdhbWUuYWRkLnNwcml0ZSgwLCAtMTQ4LCAnaGVhZCcpXG4gICAgdGhpcy5oZWFkU3ByaXRlLnNjYWxlLnNldFRvKDEuOClcbiAgICB0aGlzLmhlYWRHcm91cC5hZGQodGhpcy5oZWFkU3ByaXRlKVxuXG4gICAgLy8gTGVmdCBhcm1cbiAgICB0aGlzLmxlZnRBcm1TcHJpdGUgPSB0aGlzLmdhbWUuYWRkLnNwcml0ZSgwLCAwLCAnbGVmdC1hcm0nKVxuICAgIHRoaXMubGVmdEFybVNwcml0ZS5hbmNob3Iuc2V0VG8oLjIsIC4yKVxuICAgIHRoaXMubGVmdEFybVNwcml0ZS5zY2FsZS5zZXRUbygxLjYpXG4gICAgdGhpcy5sZWZ0QXJtU3ByaXRlLnJvdGF0aW9uID0gODAuMVxuICAgIHRoaXMubGVmdEFybUdyb3VwLmFkZCh0aGlzLmxlZnRBcm1TcHJpdGUpXG5cbiAgICAvLyBHdW5cbiAgICB0aGlzLmFrNDdTcHJpdGUgPSB0aGlzLmdhbWUuYWRkLnNwcml0ZSgxMiwgMTksICdBSzQ3JylcbiAgICB0aGlzLmFrNDdTcHJpdGUuc2NhbGUuc2V0VG8oMS4zKVxuICAgIHRoaXMuYWs0N1Nwcml0ZS5yb3RhdGlvbiA9IDgwLjE1XG5cbiAgICAvLyBSaWdodCBhcm1cbiAgICB0aGlzLnJpZ2h0QXJtR3JvdXAuYWRkKHRoaXMuYWs0N1Nwcml0ZSlcbiAgICB0aGlzLnJpZ2h0QXJtU3ByaXRlID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUoMCwgMCwgJ3JpZ2h0LWFybScpXG4gICAgdGhpcy5yaWdodEFybVNwcml0ZS5hbmNob3Iuc2V0VG8oLjIsIC4yNClcbiAgICB0aGlzLnJpZ2h0QXJtU3ByaXRlLnNjYWxlLnNldFRvKDEuNylcbiAgICB0aGlzLnJpZ2h0QXJtU3ByaXRlLnJvdGF0aW9uID0gODAuMVxuICAgIHRoaXMucmlnaHRBcm1Hcm91cC5hZGQodGhpcy5yaWdodEFybVNwcml0ZSlcblxuICAgIHRoaXMucGxheWVyLmFkZENoaWxkKHRoaXMubGVmdEFybUdyb3VwKVxuICAgIHRoaXMubGVmdEFybUdyb3VwLnBpdm90LnggPSAwXG4gICAgdGhpcy5sZWZ0QXJtR3JvdXAucGl2b3QueSA9IDBcbiAgICB0aGlzLmxlZnRBcm1Hcm91cC54ID0gNDVcbiAgICB0aGlzLmxlZnRBcm1Hcm91cC55ID0gLTcwXG5cbiAgICB0aGlzLnBsYXllci5hZGRDaGlsZCh0aGlzLnRvcnNvR3JvdXApXG4gICAgdGhpcy5wbGF5ZXIuYWRkQ2hpbGQodGhpcy5oZWFkR3JvdXApXG5cbiAgICB0aGlzLnBsYXllci5hZGRDaGlsZCh0aGlzLnJpZ2h0QXJtR3JvdXApXG4gICAgdGhpcy5yaWdodEFybUdyb3VwLnBpdm90LnggPSAwXG4gICAgdGhpcy5yaWdodEFybUdyb3VwLnBpdm90LnkgPSAwXG4gICAgdGhpcy5yaWdodEFybUdyb3VwLnggPSAtMjVcbiAgICB0aGlzLnJpZ2h0QXJtR3JvdXAueSA9IC02NVxuXG5cbiAgICAvKipcbiAgICAgKiBXZWFwb25zXG4gICAgICovXG4gICAgdGhpcy5jdXJyZW50V2VhcG9uID0gJ3ByaW1hcnlXZWFwb24nXG5cblxuICAgIC8qKlxuICAgICAqIFRleHRcbiAgICAgKi9cbiAgICBsZXQgdGV4dFN0eWxlcyA9IHsgZm9udFNpemU6ICcxNHB4JywgZmlsbDogJyMwMDAnIH1cblxuICAgIEV2ZW50SGFuZGxlci5lbWl0KCdzY29yZSB1cGRhdGUnLCAnJylcbiAgICBFdmVudEhhbmRsZXIuZW1pdCgnaGVhbHRoIHVwZGF0ZScsICcnKVxuICAgIEV2ZW50SGFuZGxlci5vbigndm9sdW1lIHVwZGF0ZScsIChkYXRhKSA9PiB7XG4gICAgICAgIHRoaXMudm9sdW1lID0gZGF0YS52b2x1bWVcbiAgICB9KVxuXG4gICAgRXZlbnRIYW5kbGVyLm9uKCdwcmltYXJ5IHdlYXBvbiB1cGRhdGUnLCAod2VhcG9uKSA9PiB7XG4gICAgICAgIHRoaXMucGxheWVyLm1ldGEuc2VsZWN0ZWRQcmltYXJ5V2VhcG9uSWQgPSB3ZWFwb24uaWRcbiAgICB9KVxuXG4gICAgRXZlbnRIYW5kbGVyLm9uKCdzZWNvbmRhcnkgd2VhcG9uIHVwZGF0ZScsICh3ZWFwb24pID0+IHtcbiAgICAgICAgdGhpcy5wbGF5ZXIubWV0YS5zZWxlY3RlZFNlY29uZGFyeVdlYXBvbklkID0gd2VhcG9uLmlkXG4gICAgfSlcblxuICAgIHRoaXMucG9zaXRpb25UZXh0ID0gdGhpcy5hZGQudGV4dCgyNSwgMjUsIGAke3RoaXMuZ2FtZS5pbnB1dC5tb3VzZVBvaW50ZXIueH0sJHt0aGlzLmdhbWUuaW5wdXQubW91c2VQb2ludGVyLnl9YCwgdGV4dFN0eWxlcylcbiAgICB0aGlzLnBvc2l0aW9uVGV4dC5maXhlZFRvQ2FtZXJhID0gdHJ1ZVxuXG5cbiAgICAvKipcbiAgICAgKiBDYW1lcmEgU2V0dGluZ3NcbiAgICAgKi9cbiAgICB0aGlzLmNhbWVyYS5mb2xsb3codGhpcy5wbGF5ZXIpXG5cblxuICAgIC8qKlxuICAgICAqIFJlc2l6aW5nIEV2ZW50c1xuICAgICAqL1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuZ2FtZS5zY2FsZS5yZWZyZXNoKClcbiAgICAgICAgdGhpcy5nYW1lLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodFxuICAgICAgICB0aGlzLmdhbWUud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aFxuICAgIH0pXG5cblxuICAgIC8qKlxuICAgICAqIEtleWJvYXJkIEV2ZW50c1xuICAgICAqL1xuICAgIC8vIE9wZW4gc2V0dGluZ3MgbW9kYWxcbiAgICB0aGlzLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuVEFCKS5vbkRvd24uYWRkKGZ1bmN0aW9uKCkge1xuICAgICAgICBFdmVudEhhbmRsZXIuZW1pdCgnc2V0dGluZ3Mgb3BlbicpXG4gICAgfSlcblxuICAgIC8vIFN3aXRjaCB3ZWFwb25zXG4gICAgdGhpcy5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLlEpLm9uRG93bi5hZGQoKCkgPT4ge1xuICAgICAgICB0aGlzLmN1cnJlbnRXZWFwb24gPSB0aGlzLmN1cnJlbnRXZWFwb24gPT09ICdwcmltYXJ5V2VhcG9uJ1xuICAgICAgICAgICAgPyAnc2Vjb25kYXJ5V2VhcG9uJ1xuICAgICAgICAgICAgOiAncHJpbWFyeVdlYXBvbidcbiAgICAgICAgdGhpcy5hazQ3U3ByaXRlLmxvYWRUZXh0dXJlKHRoaXMucGxheWVyLm1ldGFbdGhpcy5jdXJyZW50V2VhcG9uXS5pZClcbiAgICB9KVxuXG5cbiAgICAvKipcbiAgICAgKiBTdGFydCBsaXN0ZW5pbmcgZm9yIGV2ZW50c1xuICAgICAqL1xuICAgIFNldEV2ZW50SGFuZGxlcnMuY2FsbCh0aGlzKVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gSW5pdCgpIHtcbiAgICB0aGlzLmdhbWUucmVuZGVyZXIucmVuZGVyU2Vzc2lvbi5yb3VuZFBpeGVscyA9IHRydWVcbiAgICB0aGlzLmdhbWUuc3RhZ2UuZGlzYWJsZVZpc2liaWxpdHlDaGFuZ2UgPSB0cnVlXG59XG4iLCJpbXBvcnQgR2FtZUNvbnN0cyBmcm9tICcuLi9saWIvR2FtZUNvbnN0cydcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gUHJlbG9hZCgpIHtcbiAgICB0aGlzLmxvYWQuaW1hZ2UoJ21hcC1iZycsICcvaW1hZ2VzL2hpZ2gtcnVsZS1kZXNlcnQucG5nJylcbiAgICB0aGlzLmxvYWQuaW1hZ2UoJ2dyb3VuZCcsICcvaW1hZ2VzL3BsYXRmb3JtLnBuZycpXG4gICAgdGhpcy5sb2FkLmltYWdlKCdidWxsZXQxMicsICcvaW1hZ2VzL2J1bGxldC5wbmcnKVxuXG4gICAgdGhpcy5sb2FkLnNwcml0ZXNoZWV0KCdkdWRlJywgJy9pbWFnZXMvZHVkZS5wbmcnLCAzMiwgNDgpXG4gICAgdGhpcy5sb2FkLnNwcml0ZXNoZWV0KCdjb21tYW5kbycsICcvaW1hZ2VzL2NvbW1hbmRvLnBuZycsIDMwMCwgMzE1KVxuICAgIHRoaXMubG9hZC5zcHJpdGVzaGVldCgnZW5lbXknLCAnL2ltYWdlcy9kdWRlLnBuZycsIDMyLCA0OClcblxuICAgIC8vIFdlYXBvbnNcbiAgICBHYW1lQ29uc3RzLlBSSU1BUllfV0VBUE9OUy5mb3JFYWNoKCh3ZWFwb24pID0+IHtcbiAgICAgICAgdGhpcy5sb2FkLmltYWdlKHdlYXBvbi5pZCwgd2VhcG9uLmltYWdlKVxuICAgIH0pXG5cbiAgICBHYW1lQ29uc3RzLlNFQ09OREFSWV9XRUFQT05TLmZvckVhY2goKHdlYXBvbikgPT4ge1xuICAgICAgICB0aGlzLmxvYWQuaW1hZ2Uod2VhcG9uLmlkLCB3ZWFwb24uaW1hZ2UpXG4gICAgfSlcblxuICAgIHRoaXMubG9hZC5pbWFnZSgncmlnaHQtYXJtJywgJy9pbWFnZXMvYm9keS9yaWdodC1hcm0ucG5nJylcbiAgICB0aGlzLmxvYWQuaW1hZ2UoJ2xlZnQtYXJtJywgJy9pbWFnZXMvYm9keS9sZWZ0LWFybS5wbmcnKVxuICAgIHRoaXMubG9hZC5pbWFnZSgnaGVhZCcsICcvaW1hZ2VzL2JvZHkvaGVhZC5wbmcnKVxuICAgIHRoaXMubG9hZC5pbWFnZSgndG9yc28nLCAnL2ltYWdlcy9ib2R5L3RvcnNvLnBuZycpXG5cbiAgICB0aGlzLmxvYWQuYXVkaW8oJ0FLNDctc291bmQnLCAnL2F1ZGlvL0FLNDcub2dnJylcbiAgICB0aGlzLmxvYWQuYXVkaW8oJ001MDAtc291bmQnLCAnL2F1ZGlvL001MDAub2dnJylcbiAgICB0aGlzLmxvYWQuYXVkaW8oJ1Nrb3JwaW9uLXNvdW5kJywgJy9hdWRpby9Ta29ycGlvbi5vZ2cnKVxuICAgIHRoaXMubG9hZC5hdWRpbygnQVVHLXNvdW5kJywgJy9hdWRpby9BVUcub2dnJylcbiAgICB0aGlzLmxvYWQuYXVkaW8oJ0c0My1zb3VuZCcsICcvYXVkaW8vRzQzLm9nZycpXG4gICAgdGhpcy5sb2FkLmF1ZGlvKCdQOTAtc291bmQnLCAnL2F1ZGlvL1A5MC5vZ2cnKVxuICAgIHRoaXMubG9hZC5hdWRpbygnTTRBMS1zb3VuZCcsICcvYXVkaW8vTTRBMS5vZ2cnKVxuICAgIHRoaXMubG9hZC5hdWRpbygnQmFycmV0TTkwLXNvdW5kJywgJy9hdWRpby9CYXJyZXRNOTAub2dnJylcblxuICAgIHRoaXMubG9hZC5hdWRpbygnRGVzZXJ0RWFnbGUtc291bmQnLCAnL2F1ZGlvL0Rlc2VydEVhZ2xlLm9nZycpXG4gICAgdGhpcy5sb2FkLmF1ZGlvKCdSUEctc291bmQnLCAnL2F1ZGlvL1JQRy5vZ2cnKVxufVxuIiwiaW1wb3J0IENvbGxpc2lvbkhhbmRsZXIgZnJvbSAnLi4vbGliL0NvbGxpc2lvbkhhbmRsZXInXG5pbXBvcnQgUGxheWVyTW92ZW1lbnRIYW5kbGVyIGZyb20gJy4uL2xpYi9QbGF5ZXJNb3ZlbWVudEhhbmRsZXInXG5pbXBvcnQgUGxheWVySnVtcEhhbmRsZXIgZnJvbSAnLi4vbGliL1BsYXllckp1bXBIYW5kbGVyJ1xuaW1wb3J0IFBsYXllckFuZ2xlSGFuZGxlciBmcm9tICcuLi9saWIvUGxheWVyQW5nbGVIYW5kbGVyJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBVcGRhdGUoKSB7XG4gICAgQ29sbGlzaW9uSGFuZGxlci5jYWxsKHRoaXMpXG4gICAgUGxheWVyTW92ZW1lbnRIYW5kbGVyLmNhbGwodGhpcylcbiAgICBQbGF5ZXJKdW1wSGFuZGxlci5jYWxsKHRoaXMpXG4gICAgUGxheWVyQW5nbGVIYW5kbGVyLmNhbGwodGhpcylcblxuICAgIGlmICh0aGlzLmdhbWUuaW5wdXQuYWN0aXZlUG9pbnRlci5pc0Rvd24pXG4gICAge1xuICAgICAgICB0aGlzLnBsYXllci5tZXRhW3RoaXMuY3VycmVudFdlYXBvbl0uZmlyZSgpXG4gICAgfVxuXG4gICAgdGhpcy5wb3NpdGlvblRleHQudGV4dCA9IGAke3RoaXMuZ2FtZS5pbnB1dC53b3JsZFh9LCAke3RoaXMuZ2FtZS5pbnB1dC53b3JsZFl9YFxuXG4gICAgLy8gQ2hlY2sgZm9yIG91dCBvZiBib3VuZHMga2lsbFxuICAgIGlmICh0aGlzLnBsYXllci5ib2R5Lm9uRmxvb3IoKSkge1xuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdwbGF5ZXIgZGFtYWdlZCcsIHtcbiAgICAgICAgICAgIHJvb21JZDogdGhpcy5yb29tSWQsXG4gICAgICAgICAgICBkYW1hZ2U6IDEwMDAsXG4gICAgICAgICAgICBkYW1hZ2VkUGxheWVySWQ6ICcvIycgKyB0aGlzLnNvY2tldC5pZCxcbiAgICAgICAgICAgIGF0dGFja2luZ1BsYXllcklkOiBudWxsXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgdGhpcy5zb2NrZXQuZW1pdCgnbW92ZSBwbGF5ZXInLCB7XG4gICAgICAgIHJvb21JZDogdGhpcy5yb29tSWQsXG4gICAgICAgIHg6IHRoaXMucGxheWVyLngsXG4gICAgICAgIHk6IHRoaXMucGxheWVyLnlcbiAgICB9KVxufVxuIiwiaW1wb3J0IGluaXQgZnJvbSAnLi9jb3JlL0luaXQnXG5pbXBvcnQgcHJlbG9hZCBmcm9tICcuL2NvcmUvUHJlbG9hZCdcbmltcG9ydCB1cGRhdGUgZnJvbSAnLi9jb3JlL1VwZGF0ZSdcbmltcG9ydCBjcmVhdGUgZnJvbSAnLi9jb3JlL0NyZWF0ZSdcblxuY29uc3QgZ2FtZVdpZHRoID0gd2luZG93LmlubmVyV2lkdGhcbmNvbnN0IGdhbWVIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHRcbmxldCBnYW1lID0gbmV3IFBoYXNlci5HYW1lKGdhbWVXaWR0aCwgZ2FtZUhlaWdodCwgUGhhc2VyLkFVVE8sICdyYW5nZXItc3RldmUtZ2FtZScpXG5cbmdhbWUuc3RhdGUuYWRkKCdHYW1lJywgZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5jdXJyZW50V2VhcG9uID0gMFxuICAgIHRoaXMuZW5lbWllcyA9IFtdXG4gICAgdGhpcy5ncm91bmRcbiAgICB0aGlzLnBsYXRmb3Jtc1xuICAgIHRoaXMucGxheWVyXG4gICAgdGhpcy5zb2NrZXRcblxuICAgIHRoaXMuZ2FtZSA9IGdhbWVcbiAgICB0aGlzLmluaXQgPSBpbml0XG4gICAgdGhpcy5wcmVsb2FkID0gcHJlbG9hZFxuICAgIHRoaXMuY3JlYXRlID0gY3JlYXRlXG4gICAgdGhpcy51cGRhdGUgPSB1cGRhdGVcbn0sIHRydWUpXG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBDb2xsaXNpb25IYW5kbGVyKCkge1xuICAgIC8vIENvbGxpZGUgdGhpcyBwbGF5ZXIgd2l0aCB0aGUgbWFwXG4gICAgdGhpcy5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMucGxheWVyLCB0aGlzLnBsYXRmb3JtcywgbnVsbCwgbnVsbCwgdGhpcylcblxuICAgIC8vIERpZCB0aGlzIHBsYXllcidzIGJ1bGxldHMgaGl0IGFueSBwbGF0Zm9ybXNcbiAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5wbGF0Zm9ybXMsIHRoaXMuYnVsbGV0cywgKHBsYXRmb3JtLCBidWxsZXQpID0+IHtcbiAgICAgICAgYnVsbGV0LmtpbGwoKVxuICAgIH0sIG51bGwsIHRoaXMpXG5cbiAgICAvLyBEaWQgZW5lbXkgYnVsbGV0cyBoaXQgYW55IHBsYXRmb3Jtc1xuICAgIHRoaXMucGh5c2ljcy5hcmNhZGUuY29sbGlkZSh0aGlzLnBsYXRmb3JtcywgdGhpcy5lbmVteUJ1bGxldHMsIChwbGF0Zm9ybSwgYnVsbGV0KSA9PiB7XG4gICAgICAgIGJ1bGxldC5raWxsKClcbiAgICB9LCBudWxsLCB0aGlzKVxuXG4gICAgLy8gRGlkIHRoaXMgcGxheWVyIGdldCBoaXQgYnkgYW55IGVuZW15IGJ1bGxldHNcbiAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5wbGF5ZXIsIHRoaXMuZW5lbXlCdWxsZXRzLCBudWxsLCAocGxheWVyLCBidWxsZXQpID0+IHtcbiAgICAgICAgYnVsbGV0LmtpbGwoKVxuXG4gICAgICAgIGNvbnNvbGUubG9nKCdZb3Ugd2VyZSBoaXQgYnknLCBidWxsZXQuYnVsbGV0SWQpXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ2J1bGxldCByZW1vdmVkJywge1xuICAgICAgICAgICAgcm9vbUlkOiB0aGlzLnJvb21JZCxcbiAgICAgICAgICAgIGJ1bGxldElkOiBidWxsZXQuYnVsbGV0SWRcbiAgICAgICAgfSlcblxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdwbGF5ZXIgZGFtYWdlZCcsIHtcbiAgICAgICAgICAgIHJvb21JZDogdGhpcy5yb29tSWQsXG4gICAgICAgICAgICBkYW1hZ2U6IGJ1bGxldC5kYW1hZ2UsXG4gICAgICAgICAgICBkYW1hZ2VkUGxheWVySWQ6ICcvIycgKyB0aGlzLnNvY2tldC5pZCxcbiAgICAgICAgICAgIGF0dGFja2luZ1BsYXllcklkOiBidWxsZXQucGxheWVySWRcbiAgICAgICAgfSlcblxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICB9LCB0aGlzKVxufVxuIiwiaW1wb3J0IGVtaXR0ZXIgZnJvbSAnZXZlbnQtZW1pdHRlcidcblxubGV0IEV2ZW50SGFuZGxlciA9IGVtaXR0ZXIoe30pXG5cbmV4cG9ydCBkZWZhdWx0IEV2ZW50SGFuZGxlclxuIiwiaW1wb3J0IEd1aWQgZnJvbSAnLi9HdWlkJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBGaXJlUm9ja2V0KCkge1xuICAgIGxldCB4ID0gdGhpcy5yb290U2NvcGUucGxheWVyLnhcbiAgICBsZXQgeSA9IHRoaXMucm9vdFNjb3BlLnBsYXllci55XG5cbiAgICBsZXQgYnVsbGV0ID0gdGhpcy5yb290U2NvcGUuYnVsbGV0cy5nZXRGaXJzdERlYWQoKVxuICAgIGJ1bGxldC5idWxsZXRJZCA9IEd1aWQoKVxuICAgIGJ1bGxldC5oZWlnaHQgPSB0aGlzLmJ1bGxldEhlaWdodFxuICAgIGJ1bGxldC53aWR0aCA9IHRoaXMuYnVsbGV0V2lkdGhcbiAgICBidWxsZXQuYm9keS5ncmF2aXR5LnkgPSAtMTgwMFxuICAgIGJ1bGxldC5yZXNldCh4LCB5KVxuICAgIGxldCBwb2ludGVyQW5nbGUgPSB0aGlzLnJvb3RTY29wZS5nYW1lLnBoeXNpY3MuYXJjYWRlLm1vdmVUb1BvaW50ZXIoYnVsbGV0LCB0aGlzLmJ1bGxldFNwZWVkKVxuICAgIGJ1bGxldC5yb3RhdGlvbiA9IHBvaW50ZXJBbmdsZVxuXG4gICAgdGhpcy5meC52b2x1bWUgPSAuMyAqIHRoaXMucm9vdFNjb3BlLnZvbHVtZVxuICAgIHRoaXMuZngucGxheSgpXG5cbiAgICB0aGlzLnJvb3RTY29wZS5zb2NrZXQuZW1pdCgnYnVsbGV0IGZpcmVkJywge1xuICAgICAgICByb29tSWQ6IHRoaXMucm9vdFNjb3BlLnJvb21JZCxcbiAgICAgICAgYnVsbGV0SWQ6IHRoaXMuYnVsbGV0SWQsXG4gICAgICAgIHBsYXllcklkOiAnLyMnICsgdGhpcy5yb290U2NvcGUuc29ja2V0LmlkLFxuICAgICAgICB4LFxuICAgICAgICB5LFxuICAgICAgICBwb2ludGVyQW5nbGUsXG4gICAgICAgIGJ1bGxldFNwZWVkOiB0aGlzLmJ1bGxldFNwZWVkLFxuICAgICAgICBoZWlnaHQ6IHRoaXMuYnVsbGV0SGVpZ2h0LFxuICAgICAgICB3aWR0aDogdGhpcy5idWxsZXRXaWR0aCxcbiAgICAgICAgZGFtYWdlOiB0aGlzLmRhbWFnZVxuICAgIH0pXG59XG4iLCJpbXBvcnQgR3VpZCBmcm9tICcuL0d1aWQnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEZpcmVTaG90Z3VuU2hlbGwoKSB7XG4gICAgbGV0IHggPSB0aGlzLnJvb3RTY29wZS5wbGF5ZXIueFxuICAgIGxldCB5ID0gdGhpcy5yb290U2NvcGUucGxheWVyLnlcblxuICAgIGxldCBidWxsZXQgPSB0aGlzLnJvb3RTY29wZS5idWxsZXRzLmdldEZpcnN0RGVhZCgpXG4gICAgYnVsbGV0LmJ1bGxldElkID0gR3VpZCgpXG4gICAgYnVsbGV0LmhlaWdodCA9IHRoaXMuYnVsbGV0SGVpZ2h0XG4gICAgYnVsbGV0LndpZHRoID0gdGhpcy5idWxsZXRXaWR0aFxuICAgIGJ1bGxldC5ib2R5LmdyYXZpdHkueSA9IC0xODAwXG4gICAgYnVsbGV0LnJlc2V0KHgsIHkpXG4gICAgbGV0IHBvaW50ZXJBbmdsZSA9IHRoaXMucm9vdFNjb3BlLmdhbWUucGh5c2ljcy5hcmNhZGUubW92ZVRvUG9pbnRlcihidWxsZXQsIHRoaXMuYnVsbGV0U3BlZWQpXG4gICAgYnVsbGV0LnJvdGF0aW9uID0gcG9pbnRlckFuZ2xlXG5cbiAgICB0aGlzLmZ4LnZvbHVtZSA9IC41ICogdGhpcy5yb290U2NvcGUudm9sdW1lXG4gICAgdGhpcy5meC5wbGF5KClcblxuICAgIHRoaXMucm9vdFNjb3BlLnNvY2tldC5lbWl0KCdidWxsZXQgZmlyZWQnLCB7XG4gICAgICAgIHJvb21JZDogdGhpcy5yb290U2NvcGUucm9vbUlkLFxuICAgICAgICBidWxsZXRJZDogdGhpcy5idWxsZXRJZCxcbiAgICAgICAgcGxheWVySWQ6ICcvIycgKyB0aGlzLnJvb3RTY29wZS5zb2NrZXQuaWQsXG4gICAgICAgIHgsXG4gICAgICAgIHksXG4gICAgICAgIHBvaW50ZXJBbmdsZSxcbiAgICAgICAgYnVsbGV0U3BlZWQ6IHRoaXMuYnVsbGV0U3BlZWQsXG4gICAgICAgIGhlaWdodDogdGhpcy5idWxsZXRIZWlnaHQsXG4gICAgICAgIHdpZHRoOiB0aGlzLmJ1bGxldFdpZHRoLFxuICAgICAgICBkYW1hZ2U6IHRoaXMuZGFtYWdlXG4gICAgfSlcbn1cbiIsImltcG9ydCBHdWlkIGZyb20gJy4vR3VpZCdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gRmlyZVN0YW5kYXJkQnVsbGV0KCkge1xuICAgIGxldCB4ID0gdGhpcy5yb290U2NvcGUucGxheWVyLnhcbiAgICBsZXQgeSA9IHRoaXMucm9vdFNjb3BlLnBsYXllci55XG5cbiAgICBsZXQgYnVsbGV0ID0gdGhpcy5yb290U2NvcGUuYnVsbGV0cy5nZXRGaXJzdERlYWQoKVxuICAgIGJ1bGxldC5idWxsZXRJZCA9IEd1aWQoKVxuICAgIGJ1bGxldC5oZWlnaHQgPSB0aGlzLmJ1bGxldEhlaWdodFxuICAgIGJ1bGxldC53aWR0aCA9IHRoaXMuYnVsbGV0V2lkdGhcbiAgICBidWxsZXQuYm9keS5ncmF2aXR5LnkgPSAtMTgwMFxuICAgIGJ1bGxldC5yZXNldCh4LCB5KVxuICAgIGxldCBwb2ludGVyQW5nbGUgPSB0aGlzLnJvb3RTY29wZS5nYW1lLnBoeXNpY3MuYXJjYWRlLm1vdmVUb1BvaW50ZXIoYnVsbGV0LCB0aGlzLmJ1bGxldFNwZWVkKVxuICAgIGJ1bGxldC5yb3RhdGlvbiA9IHBvaW50ZXJBbmdsZVxuXG4gICAgdGhpcy5meC52b2x1bWUgPSAuMyAqIHRoaXMucm9vdFNjb3BlLnZvbHVtZVxuICAgIHRoaXMuZngucGxheSgpXG5cbiAgICB0aGlzLnJvb3RTY29wZS5zb2NrZXQuZW1pdCgnYnVsbGV0IGZpcmVkJywge1xuICAgICAgICByb29tSWQ6IHRoaXMucm9vdFNjb3BlLnJvb21JZCxcbiAgICAgICAgYnVsbGV0SWQ6IGJ1bGxldC5idWxsZXRJZCxcbiAgICAgICAgcGxheWVySWQ6ICcvIycgKyB0aGlzLnJvb3RTY29wZS5zb2NrZXQuaWQsXG4gICAgICAgIHgsXG4gICAgICAgIHksXG4gICAgICAgIHBvaW50ZXJBbmdsZSxcbiAgICAgICAgYnVsbGV0U3BlZWQ6IGJ1bGxldC5idWxsZXRTcGVlZCxcbiAgICAgICAgaGVpZ2h0OiBidWxsZXQuYnVsbGV0SGVpZ2h0LFxuICAgICAgICB3aWR0aDogYnVsbGV0LmJ1bGxldFdpZHRoLFxuICAgICAgICBkYW1hZ2U6IGJ1bGxldC5kYW1hZ2VcbiAgICB9KVxufVxuIiwiY29uc3QgR2FtZUNvbnN0cyA9IHtcbiAgICBXT1JMRF9XSURUSDogODAwMCxcbiAgICBXT1JMRF9IRUlHSFQ6IDM5NjYsXG4gICAgU1RBUlRJTkdfVk9MVU1FOiAuNSxcblxuICAgIC8vIFBoeXNpY3NcbiAgICBNQVhfU1BFRUQ6IDYwMCxcbiAgICBBQ0NFTEVSQVRJT046IDE5NjAsXG4gICAgRFJBRzogMTUwMCxcbiAgICBHUkFWSVRZOiAxOTAwLFxuICAgIEpVTVBfU1BFRUQ6IC04NTAsXG4gICAgSlVNUF9KRVRfU1BFRUQ6IC0yNDAwLFxuICAgIEpVTVBfSkVUX1NQRUVEX1JFR0VORVJBVElPTjogLTI0MDAsXG5cbiAgICAvLyBQbGF5ZXIgTW9kZWxcbiAgICBBTklNQVRJT05fTEVGVDogWzAsIDEsIDIsIDMsIDQsIDVdLFxuICAgIEFOSU1BVElPTl9SSUdIVDogWzgsIDksIDEwLCAxMSwgMTIsIDEzXSxcbiAgICBBTklNQVRJT05fRlJBTUVSQVRFOiAxMCxcbiAgICBQTEFZRVJfU0NBTEU6IC4yNyxcbiAgICBQTEFZRVJfQU5DSE9SOiAuNSxcblxuICAgIC8vIFdlYXBvbnNcbiAgICBQUklNQVJZX1dFQVBPTlM6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICdBSzQ3JyxcbiAgICAgICAgICAgIG5hbWU6ICdBSy00NycsXG4gICAgICAgICAgICBpbWFnZTogJy9pbWFnZXMvZ3Vucy9TcHJfQUs0Ny5wbmcnLFxuICAgICAgICAgICAgbWluU2NvcmU6IDBcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICdNNTAwJyxcbiAgICAgICAgICAgIG5hbWU6ICdNNTAwJyxcbiAgICAgICAgICAgIGltYWdlOiAnL2ltYWdlcy9ndW5zL1Nwcl9NNTAwLnBuZycsXG4gICAgICAgICAgICBtaW5TY29yZTogMFxuICAgICAgICAgICAgLy8gbWluU2NvcmU6IDEwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnU2tvcnBpb24nLFxuICAgICAgICAgICAgbmFtZTogJ1Nrb3JwaW9uJyxcbiAgICAgICAgICAgIGltYWdlOiAnL2ltYWdlcy9ndW5zL1Nwcl9Ta29ycGlvbi5wbmcnLFxuICAgICAgICAgICAgbWluU2NvcmU6IDBcbiAgICAgICAgICAgIC8vIG1pblNjb3JlOiAyMFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ0F1ZycsXG4gICAgICAgICAgICBuYW1lOiAnQXVnJyxcbiAgICAgICAgICAgIGltYWdlOiAnL2ltYWdlcy9ndW5zL1Nwcl9BdWcucG5nJyxcbiAgICAgICAgICAgIG1pblNjb3JlOiAwXG4gICAgICAgICAgICAvLyBtaW5TY29yZTogMzBcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICdHNDMnLFxuICAgICAgICAgICAgbmFtZTogJ0c0MycsXG4gICAgICAgICAgICBpbWFnZTogJy9pbWFnZXMvZ3Vucy9TcHJfZzQzLnBuZycsXG4gICAgICAgICAgICBtaW5TY29yZTogMFxuICAgICAgICAgICAgLy8gbWluU2NvcmU6IDQwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnUDkwJyxcbiAgICAgICAgICAgIG5hbWU6ICdQOTAnLFxuICAgICAgICAgICAgaW1hZ2U6ICcvaW1hZ2VzL2d1bnMvU3ByX3A5MC5wbmcnLFxuICAgICAgICAgICAgbWluU2NvcmU6IDBcbiAgICAgICAgICAgIC8vIG1pblNjb3JlOiAzMFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ000QTEnLFxuICAgICAgICAgICAgbmFtZTogJ000QTEnLFxuICAgICAgICAgICAgaW1hZ2U6ICcvaW1hZ2VzL2d1bnMvU3ByX000QTEucG5nJyxcbiAgICAgICAgICAgIG1pblNjb3JlOiAwXG4gICAgICAgICAgICAvLyBtaW5TY29yZTogMTBcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICdCYXJyZXR0JyxcbiAgICAgICAgICAgIG5hbWU6ICdCYXJyZXR0JyxcbiAgICAgICAgICAgIGltYWdlOiAnL2ltYWdlcy9ndW5zL1Nwcl9CYXJyZXR0LnBuZycsXG4gICAgICAgICAgICBtaW5TY29yZTogMFxuICAgICAgICAgICAgLy8gbWluU2NvcmU6IDcwXG4gICAgICAgIH1cbiAgICBdLFxuXG4gICAgU0VDT05EQVJZX1dFQVBPTlM6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICdEZXNlcnRFYWdsZScsXG4gICAgICAgICAgICBuYW1lOiAnRGVzZXJ0IEVhZ2xlJyxcbiAgICAgICAgICAgIGltYWdlOiAnL2ltYWdlcy9ndW5zL1Nwcl9EZXNlcnRFYWdsZS5wbmcnLFxuICAgICAgICAgICAgbWluU2NvcmU6IDBcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICdSUEcnLFxuICAgICAgICAgICAgbmFtZTogJ1JQRycsXG4gICAgICAgICAgICBpbWFnZTogJy9pbWFnZXMvZ3Vucy9TcHJfUlBHLnBuZycsXG4gICAgICAgICAgICBtaW5TY29yZTogMjBcbiAgICAgICAgfVxuICAgIF1cbn1cblxuZXhwb3J0IGRlZmF1bHQgR2FtZUNvbnN0c1xuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gR2V0UXVlcnlTdHJpbmcoZmllbGQsIHVybCkge1xuICAgIHZhciBocmVmID0gdXJsID8gdXJsIDogd2luZG93LmxvY2F0aW9uLmhyZWY7XG4gICAgdmFyIHJlZyA9IG5ldyBSZWdFeHAoICdbPyZdJyArIGZpZWxkICsgJz0oW14mI10qKScsICdpJyApO1xuICAgIHZhciBzdHJpbmcgPSByZWcuZXhlYyhocmVmKTtcbiAgICByZXR1cm4gc3RyaW5nID8gc3RyaW5nWzFdIDogbnVsbDtcbn1cbiIsImZ1bmN0aW9uIFM0KCkge1xuICAgIHJldHVybiAoKCgxK01hdGgucmFuZG9tKCkpKjB4MTAwMDApfDApLnRvU3RyaW5nKDE2KS5zdWJzdHJpbmcoMSlcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gR3VpZCgpIHtcbiAgICByZXR1cm4gKFM0KCkrUzQoKStcIi1cIitTNCgpK1wiLVwiK1M0KCkrXCItXCIrUzQoKStcIi1cIitTNCgpK1M0KCkrUzQoKSlcbn1cbiIsIi8vIFRoaXMgZnVuY3Rpb24gc2hvdWxkIHJldHVybiB0cnVlIHdoZW4gdGhlIHBsYXllciBhY3RpdmF0ZXMgdGhlIFwiZ28gbGVmdFwiIGNvbnRyb2xcbi8vIEluIHRoaXMgY2FzZSwgZWl0aGVyIGhvbGRpbmcgdGhlIHJpZ2h0IGFycm93IG9yIHRhcHBpbmcgb3IgY2xpY2tpbmcgb24gdGhlIGxlZnRcbi8vIHNpZGUgb2YgdGhlIHNjcmVlbi5cbmV4cG9ydCBmdW5jdGlvbiBsZWZ0SW5wdXRJc0FjdGl2ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5pbnB1dC5rZXlib2FyZC5pc0Rvd24oUGhhc2VyLktleWJvYXJkLkEpXG59XG5cbi8vIFRoaXMgZnVuY3Rpb24gc2hvdWxkIHJldHVybiB0cnVlIHdoZW4gdGhlIHBsYXllciBhY3RpdmF0ZXMgdGhlIFwiZ28gcmlnaHRcIiBjb250cm9sXG4vLyBJbiB0aGlzIGNhc2UsIGVpdGhlciBob2xkaW5nIHRoZSByaWdodCBhcnJvdyBvciB0YXBwaW5nIG9yIGNsaWNraW5nIG9uIHRoZSByaWdodFxuLy8gc2lkZSBvZiB0aGUgc2NyZWVuLlxuZXhwb3J0IGZ1bmN0aW9uIHJpZ2h0SW5wdXRJc0FjdGl2ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5pbnB1dC5rZXlib2FyZC5pc0Rvd24oUGhhc2VyLktleWJvYXJkLkQpXG59XG5cbi8vIFRoaXMgZnVuY3Rpb24gc2hvdWxkIHJldHVybiB0cnVlIHdoZW4gdGhlIHBsYXllciBhY3RpdmF0ZXMgdGhlIFwianVtcFwiIGNvbnRyb2xcbi8vIEluIHRoaXMgY2FzZSwgZWl0aGVyIGhvbGRpbmcgdGhlIHVwIGFycm93IG9yIHRhcHBpbmcgb3IgY2xpY2tpbmcgb24gdGhlIGNlbnRlclxuLy8gcGFydCBvZiB0aGUgc2NyZWVuLlxuZXhwb3J0IGZ1bmN0aW9uIHVwSW5wdXRJc0FjdGl2ZShkdXJhdGlvbikge1xuICAgIHJldHVybiB0aGlzLmlucHV0LmtleWJvYXJkLmRvd25EdXJhdGlvbihQaGFzZXIuS2V5Ym9hcmQuVywgZHVyYXRpb24pXG59XG5cbi8vIFRoaXMgZnVuY3Rpb24gcmV0dXJucyB0cnVlIHdoZW4gdGhlIHBsYXllciByZWxlYXNlcyB0aGUgXCJqdW1wXCIgY29udHJvbFxuZXhwb3J0IGZ1bmN0aW9uIHVwSW5wdXRSZWxlYXNlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5pbnB1dC5rZXlib2FyZC51cER1cmF0aW9uKFBoYXNlci5LZXlib2FyZC5XKVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gUGxheWVyQW5nbGVIYW5kbGVyKCkge1xuICAgIGxldCBhbmdsZUluRGVncmVlcyA9ICh0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuYW5nbGVUb1BvaW50ZXIodGhpcy5wbGF5ZXIpICogMTgwIC8gTWF0aC5QSSkgKyA5MDtcblxuICAgIGlmICh0aGlzLnBsYXllci5tZXRhLmZhY2luZyA9PT0gJ3JpZ2h0Jykge1xuICAgICAgICB0aGlzLnJpZ2h0QXJtR3JvdXAuYW5nbGUgPSBhbmdsZUluRGVncmVlcyArIDVcblxuICAgICAgICAvLyBVc2VyIGlzIGFpbWluZyB1cFxuICAgICAgICBpZiAoYW5nbGVJbkRlZ3JlZXMgPD0gODEgJiYgYW5nbGVJbkRlZ3JlZXMgPj0gNzEpIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzIC09IDEwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPCA3MSAmJiBhbmdsZUluRGVncmVlcyA+PSA2MSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgLT0gMjBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA8IDYxICYmIGFuZ2xlSW5EZWdyZWVzID49IDUxKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyAtPSAzMFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzIDwgNTEgJiYgYW5nbGVJbkRlZ3JlZXMgPj0gNDEpIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzIC09IDQwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPCA0MSAmJiBhbmdsZUluRGVncmVlcyA+PSAzMSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgLT0gNTBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA8IDMxICYmIGFuZ2xlSW5EZWdyZWVzID49IDIxKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyAtPSA2MFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzIDwgMjEgJiYgYW5nbGVJbkRlZ3JlZXMgPj0gMTEpIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzIC09IDcwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPCAxMSAmJiBhbmdsZUluRGVncmVlcyA+PSAwKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyAtPSA4MFxuICAgICAgICB9XG5cbiAgICAgICAgLy8gVXNlciBpcyBhaW1pbmcgZG93blxuICAgICAgICBpZiAoYW5nbGVJbkRlZ3JlZXMgPj0gOTkgJiYgYW5nbGVJbkRlZ3JlZXMgPD0gMTA5KSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyArPSAxMFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzID4gMTA5ICYmIGFuZ2xlSW5EZWdyZWVzIDw9IDExOSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgKz0gMjBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA+IDExOSAmJiBhbmdsZUluRGVncmVlcyA8PSAxMjkpIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzICs9IDMwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPiAxMjkgJiYgYW5nbGVJbkRlZ3JlZXMgPD0gMTM5KSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyArPSA0MFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzID4gMTM5ICYmIGFuZ2xlSW5EZWdyZWVzIDw9IDE0OSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgKz0gNTBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA+IDE0OSAmJiBhbmdsZUluRGVncmVlcyA8PSAxNTkpIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzICs9IDYwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPiAxNTkgJiYgYW5nbGVJbkRlZ3JlZXMgPD0gMTY5KSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyArPSA3MFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzID4gMTY5ICYmIGFuZ2xlSW5EZWdyZWVzIDw9IDE4MCkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgKz0gODBcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLnBsYXllci5tZXRhLmZhY2luZyA9PT0gJ2xlZnQnKSB7XG4gICAgICAgIHRoaXMucmlnaHRBcm1Hcm91cC5hbmdsZSA9IGFuZ2xlSW5EZWdyZWVzIC0gN1xuXG4gICAgICAgIC8vIFVzZXIgaXMgYWltaW5nIHVwXG4gICAgICAgIGlmIChhbmdsZUluRGVncmVlcyA+PSAtODEgJiYgYW5nbGVJbkRlZ3JlZXMgPD0gLTcxKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyArPSAyMFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzID4gLTcxICYmIGFuZ2xlSW5EZWdyZWVzIDw9IC02MSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgKz0gMzBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA+IC02MSAmJiBhbmdsZUluRGVncmVlcyA8PSAtNTEpIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzICs9IDQwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPiAtNTEgJiYgYW5nbGVJbkRlZ3JlZXMgPD0gLTQxKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyArPSA1MFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzID4gLTQxICYmIGFuZ2xlSW5EZWdyZWVzIDw9IC0zMSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgKz0gNjBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA+IC0zMSAmJiBhbmdsZUluRGVncmVlcyA8PSAtMjEpIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzICs9IDcwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPiAtMjEgJiYgYW5nbGVJbkRlZ3JlZXMgPD0gLTExKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyArPSA4MFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzID4gLTExICYmIGFuZ2xlSW5EZWdyZWVzIDw9IDApIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzICs9IDkwXG4gICAgICAgIH1cblxuICAgICAgICAvLyBVc2VyIGlzIGFpbWluZyBkb3duXG4gICAgICAgIGlmIChhbmdsZUluRGVncmVlcyA8PSAyNzAgJiYgYW5nbGVJbkRlZ3JlZXMgPj0gMjYwKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyAtPSAxMFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzIDwgMjYwICYmIGFuZ2xlSW5EZWdyZWVzID49IDI1MCkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgLT0gMjBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA8IDI1MCAmJiBhbmdsZUluRGVncmVlcyA+PSAyNDApIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzIC09IDMwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPCAyNDAgJiYgYW5nbGVJbkRlZ3JlZXMgPj0gMjMwKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyAtPSA0MFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzIDwgMjMwICYmIGFuZ2xlSW5EZWdyZWVzID49IDIyMCkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgLT0gNTBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA8IDIyMCAmJiBhbmdsZUluRGVncmVlcyA+PSAyMTApIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzIC09IDYwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPCAyMTAgJiYgYW5nbGVJbkRlZ3JlZXMgPj0gMjAwKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyAtPSA3MFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzIDwgMjAwICYmIGFuZ2xlSW5EZWdyZWVzID49IDE5MCkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgLT0gODBcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMubGVmdEFybUdyb3VwLmFuZ2xlID0gYW5nbGVJbkRlZ3JlZXNcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFBsYXllckJ5SWQoaWQpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZW5lbWllcy5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAodGhpcy5lbmVtaWVzLmNoaWxkcmVuW2ldLmlkID09PSBpZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZW5lbWllcy5jaGlsZHJlbltpXVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlXG59XG4iLCJleHBvcnQgZnVuY3Rpb24gcGxheWVyRmFjZUxlZnQoKSB7XG4gICAgaWYgKHRoaXMucGxheWVyLm1ldGEuZmFjaW5nICE9PSAnbGVmdCcpIHtcbiAgICAgICAgdGhpcy5wbGF5ZXIubWV0YS5mYWNpbmcgPSAnbGVmdCdcblxuICAgICAgICB0aGlzLnJpZ2h0QXJtR3JvdXAueCA9IDI1XG4gICAgICAgIHRoaXMucmlnaHRBcm1Hcm91cC55ID0gLTY1XG5cbiAgICAgICAgdGhpcy5sZWZ0QXJtR3JvdXAueCA9IC00MFxuICAgICAgICB0aGlzLmxlZnRBcm1Hcm91cC55ID0gLTcwXG5cbiAgICAgICAgdGhpcy5oZWFkU3ByaXRlLnNjYWxlLnggKj0gLTFcbiAgICAgICAgdGhpcy5oZWFkU3ByaXRlLnggPSAxMlxuXG4gICAgICAgIHRoaXMudG9yc29TcHJpdGUuc2NhbGUueCAqPSAtMVxuICAgICAgICB0aGlzLnRvcnNvU3ByaXRlLnggPSA0OVxuXG4gICAgICAgIHRoaXMubGVmdEFybVNwcml0ZS5zY2FsZS55ICo9IC0xXG4gICAgICAgIHRoaXMubGVmdEFybVNwcml0ZS55ID0gNVxuXG4gICAgICAgIHRoaXMucmlnaHRBcm1TcHJpdGUuc2NhbGUueSAqPSAtMVxuICAgICAgICB0aGlzLnJpZ2h0QXJtU3ByaXRlLnkgPSAxMFxuXG4gICAgICAgIHRoaXMuYWs0N1Nwcml0ZS5zY2FsZS55ICo9IC0xXG4gICAgICAgIHRoaXMuYWs0N1Nwcml0ZS55ID0gMzBcbiAgICAgICAgdGhpcy5hazQ3U3ByaXRlLnggPSAtN1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBsYXllckZhY2VSaWdodCgpIHtcbiAgICBpZiAodGhpcy5wbGF5ZXIubWV0YS5mYWNpbmcgIT09ICdyaWdodCcpIHtcbiAgICAgICAgdGhpcy5wbGF5ZXIubWV0YS5mYWNpbmcgPSAncmlnaHQnXG5cbiAgICAgICAgdGhpcy5yaWdodEFybUdyb3VwLnggPSAtMjVcbiAgICAgICAgdGhpcy5yaWdodEFybUdyb3VwLnkgPSAtNjVcblxuICAgICAgICB0aGlzLmxlZnRBcm1Hcm91cC54ID0gNDVcbiAgICAgICAgdGhpcy5sZWZ0QXJtR3JvdXAueSA9IC03MFxuXG4gICAgICAgIHRoaXMuaGVhZFNwcml0ZS5zY2FsZS54ICo9IC0xXG4gICAgICAgIHRoaXMuaGVhZFNwcml0ZS54ID0gMFxuXG4gICAgICAgIHRoaXMudG9yc29TcHJpdGUuc2NhbGUueCAqPSAtMVxuICAgICAgICB0aGlzLnRvcnNvU3ByaXRlLnggPSAtMzdcblxuICAgICAgICB0aGlzLmxlZnRBcm1TcHJpdGUuc2NhbGUueSAqPSAtMVxuICAgICAgICB0aGlzLmxlZnRBcm1TcHJpdGUueSA9IDBcblxuICAgICAgICB0aGlzLnJpZ2h0QXJtU3ByaXRlLnNjYWxlLnkgKj0gLTFcbiAgICAgICAgdGhpcy5yaWdodEFybVNwcml0ZS55ID0gMFxuXG4gICAgICAgIHRoaXMuYWs0N1Nwcml0ZS5zY2FsZS55ICo9IC0xXG4gICAgICAgIHRoaXMuYWs0N1Nwcml0ZS55ID0gMTlcbiAgICAgICAgdGhpcy5hazQ3U3ByaXRlLnggPSAzXG4gICAgfVxufVxuIiwiaW1wb3J0IEdhbWVDb25zdHMgZnJvbSAnLi9HYW1lQ29uc3RzJ1xuaW1wb3J0IEV2ZW50SGFuZGxlciBmcm9tICcuL0V2ZW50SGFuZGxlcidcbmltcG9ydCB7IHVwSW5wdXRJc0FjdGl2ZSwgdXBJbnB1dFJlbGVhc2VkIH0gZnJvbSAnLi9JbnB1dEhlbHBlcnMnXG5cbmxldCBqdW1wSmV0Q291bnRlciA9IDBcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gUGxheWVySnVtcEhhbmRsZXIoKSB7XG4gICAgLy8gU2V0IGEgdmFyaWFibGUgdGhhdCBpcyB0cnVlIHdoZW4gdGhlIHBsYXllciBpcyB0b3VjaGluZyB0aGUgZ3JvdW5kXG4gICAgbGV0IG9uVGhlR3JvdW5kID0gdGhpcy5wbGF5ZXIuYm9keS50b3VjaGluZy5kb3duXG5cbiAgICAvLyBJZiB0aGUgcGxheWVyIGlzIHRvdWNoaW5nIHRoZSBncm91bmQsIGxldCBoaW0gaGF2ZSAyIGp1bXBzXG4gICAgaWYgKG9uVGhlR3JvdW5kKSB7XG4gICAgICAgIHRoaXMuanVtcHMgPSAyXG4gICAgICAgIHRoaXMuanVtcGluZyA9IGZhbHNlXG4gICAgfVxuXG4gICAgLy8gSnVtcCFcbiAgICBpZiAodGhpcy5qdW1wcyA9PT0gMiAmJiB1cElucHV0SXNBY3RpdmUuY2FsbCh0aGlzLCA1KSAmJiBvblRoZUdyb3VuZCkge1xuICAgICAgICB0aGlzLnBsYXllci5ib2R5LnZlbG9jaXR5LnkgPSBHYW1lQ29uc3RzLkpVTVBfU1BFRURcbiAgICAgICAgdGhpcy5qdW1waW5nID0gdHJ1ZVxuICAgIH0gZWxzZSBpZiAodXBJbnB1dElzQWN0aXZlLmNhbGwodGhpcywgNSkpIHtcbiAgICAgICAgdGhpcy5qdW1wcyA9IDFcbiAgICB9XG5cbiAgICAvLyBKdW1wIEpldCFcbiAgICBpZiAodGhpcy5qdW1wcyA9PT0gMSAmJiB0aGlzLmlucHV0LmtleWJvYXJkLmlzRG93bihQaGFzZXIuS2V5Ym9hcmQuVykgJiYganVtcEpldENvdW50ZXIgPiAtMTMwMDAwKSB7XG4gICAgICAgIHRoaXMucGxheWVyLmJvZHkuYWNjZWxlcmF0aW9uLnkgPSBHYW1lQ29uc3RzLkpVTVBfSkVUX1NQRUVEXG4gICAgICAgIGp1bXBKZXRDb3VudGVyICs9IEdhbWVDb25zdHMuSlVNUF9KRVRfU1BFRURcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnBsYXllci5ib2R5LmFjY2VsZXJhdGlvbi55ID0gMFxuXG4gICAgICAgIGlmIChqdW1wSmV0Q291bnRlciA8IDApIHtcbiAgICAgICAgICAgIGp1bXBKZXRDb3VudGVyIC09IEdhbWVDb25zdHMuSlVNUF9KRVRfU1BFRURfUkVHRU5FUkFUSU9OXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBqdW1wSmV0Q291bnRlciA9IDBcbiAgICAgICAgfVxuICAgIH1cblxuICAgIEV2ZW50SGFuZGxlci5lbWl0KCdwbGF5ZXIganVtcCBqZXQgdXBkYXRlJywgeyBqdW1wSmV0Q291bnRlciB9KVxuXG4gICAgLy8gUmVkdWNlIHRoZSBudW1iZXIgb2YgYXZhaWxhYmxlIGp1bXBzIGlmIHRoZSBqdW1wIGlucHV0IGlzIHJlbGVhc2VkXG4gICAgaWYgKHRoaXMuanVtcGluZyAmJiB1cElucHV0UmVsZWFzZWQuY2FsbCh0aGlzKSkge1xuICAgICAgICB0aGlzLnBsYXllci5ib2R5LmFjY2VsZXJhdGlvbi54ID0gMFxuICAgICAgICB0aGlzLnBsYXllci5ib2R5LmFjY2VsZXJhdGlvbi55ID0gMFxuXG4gICAgICAgIGlmICh0aGlzLmp1bXBzICE9PSAxKSB7XG4gICAgICAgICAgICB0aGlzLmp1bXBzLS1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuanVtcGluZyA9IGZhbHNlXG4gICAgfVxufVxuIiwiaW1wb3J0IEdhbWVDb25zdHMgZnJvbSAnLi9HYW1lQ29uc3RzJ1xuaW1wb3J0IHsgcGxheWVyRmFjZUxlZnQsIHBsYXllckZhY2VSaWdodCB9IGZyb20gJy4vUGxheWVyRmFjZUhhbmRsZXInXG5pbXBvcnQgeyBsZWZ0SW5wdXRJc0FjdGl2ZSwgcmlnaHRJbnB1dElzQWN0aXZlIH0gZnJvbSAnLi9JbnB1dEhlbHBlcnMnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFBsYXllck1vdmVtZW50SGFuZGxlcigpIHtcbiAgICBpZiAobGVmdElucHV0SXNBY3RpdmUuY2FsbCh0aGlzKSkge1xuICAgICAgICAvLyBJZiB0aGUgTEVGVCBrZXkgaXMgZG93biwgc2V0IHRoZSBwbGF5ZXIgdmVsb2NpdHkgdG8gbW92ZSBsZWZ0XG4gICAgICAgIHRoaXMucGxheWVyLmJvZHkuYWNjZWxlcmF0aW9uLnggPSAtR2FtZUNvbnN0cy5BQ0NFTEVSQVRJT05cbiAgICAgICAgdGhpcy5wbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdsZWZ0JylcblxuICAgICAgICAvLyBMZWZ0IGZhY2luZyBoZWFkIG5lZWRzIHRvIGJlIHNldCBvbmx5IG9uY2VcbiAgICAgICAgcGxheWVyRmFjZUxlZnQuY2FsbCh0aGlzKVxuICAgIH0gZWxzZSBpZiAocmlnaHRJbnB1dElzQWN0aXZlLmNhbGwodGhpcykpIHtcbiAgICAgICAgLy8gSWYgdGhlIFJJR0hUIGtleSBpcyBkb3duLCBzZXQgdGhlIHBsYXllciB2ZWxvY2l0eSB0byBtb3ZlIHJpZ2h0XG4gICAgICAgIHRoaXMucGxheWVyLmJvZHkuYWNjZWxlcmF0aW9uLnggPSBHYW1lQ29uc3RzLkFDQ0VMRVJBVElPTlxuICAgICAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLnBsYXkoJ3JpZ2h0JylcblxuICAgICAgICBwbGF5ZXJGYWNlUmlnaHQuY2FsbCh0aGlzKVxuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFN0YW5kIHN0aWxsXG4gICAgICAgIHRoaXMucGxheWVyLmJvZHkuYWNjZWxlcmF0aW9uLnggPSAwXG4gICAgICAgIHRoaXMucGxheWVyLmFuaW1hdGlvbnMuc3RvcCgpXG5cbiAgICAgICAgaWYgKHRoaXMuZ2FtZS5pbnB1dC53b3JsZFggPiB0aGlzLnBsYXllci54KSB7XG4gICAgICAgICAgICB0aGlzLnBsYXllci5mcmFtZSA9IDdcbiAgICAgICAgICAgIHBsYXllckZhY2VSaWdodC5jYWxsKHRoaXMpXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5nYW1lLmlucHV0LndvcmxkWCA8IHRoaXMucGxheWVyLngpIHtcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmZyYW1lID0gNlxuICAgICAgICAgICAgcGxheWVyRmFjZUxlZnQuY2FsbCh0aGlzKVxuICAgICAgICB9XG4gICAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gUmVtb3RlQnVsbGV0KGRhdGEpIHtcbiAgICBsZXQgZW5lbXlCdWxsZXQgPSB0aGlzLmVuZW15QnVsbGV0cy5jcmVhdGUoZGF0YS54LCBkYXRhLnksICdidWxsZXQxMicpXG4gICAgZW5lbXlCdWxsZXQuYnVsbGV0SWQgPSBkYXRhLmJ1bGxldElkXG4gICAgZW5lbXlCdWxsZXQucGxheWVySWQgPSBkYXRhLnBsYXllcklkXG4gICAgZW5lbXlCdWxsZXQuZGFtYWdlID0gZGF0YS5kYW1hZ2VcbiAgICBlbmVteUJ1bGxldC5yb3RhdGlvbiA9IGRhdGEucG9pbnRlckFuZ2xlXG4gICAgZW5lbXlCdWxsZXQuaGVpZ2h0ID0gZGF0YS5oZWlnaHRcbiAgICBlbmVteUJ1bGxldC53aWR0aCA9IGRhdGEud2lkdGhcbiAgICBlbmVteUJ1bGxldC5ib2R5LmdyYXZpdHkueSA9IC0xODAwXG5cbiAgICByZXR1cm4gZW5lbXlCdWxsZXRcbn1cbiIsImltcG9ydCBHYW1lQ29uc3RzIGZyb20gJy4vR2FtZUNvbnN0cydcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gUmVtb3RlUGxheWVyKHBsYXllcikge1xuICAgIGxldCBuZXdSZW1vdGVQbGF5ZXIgPSB0aGlzLmdhbWUuYWRkLnNwcml0ZShwbGF5ZXIueCwgcGxheWVyLnksICdjb21tYW5kbycpXG4gICAgbmV3UmVtb3RlUGxheWVyLnNjYWxlLnNldFRvKEdhbWVDb25zdHMuUExBWUVSX1NDQUxFKVxuICAgIG5ld1JlbW90ZVBsYXllci5hbmNob3Iuc2V0VG8oR2FtZUNvbnN0cy5QTEFZRVJfQU5DSE9SKVxuICAgIG5ld1JlbW90ZVBsYXllci5hbGl2ZSA9IHRydWVcbiAgICBuZXdSZW1vdGVQbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ2xlZnQnLCBHYW1lQ29uc3RzLkFOSU1BVElPTl9MRUZULCBHYW1lQ29uc3RzLkFOSU1BVElPTl9GUkFNRVJBVEUsIHRydWUpXG4gICAgbmV3UmVtb3RlUGxheWVyLmFuaW1hdGlvbnMuYWRkKCdyaWdodCcsIEdhbWVDb25zdHMuQU5JTUFUSU9OX1JJR0hULCBHYW1lQ29uc3RzLkFOSU1BVElPTl9GUkFNRVJBVEUsIHRydWUpXG4gICAgbmV3UmVtb3RlUGxheWVyLmlkID0gcGxheWVyLmlkXG4gICAgbmV3UmVtb3RlUGxheWVyLmxhc3RQb3NpdGlvbiA9IHtcbiAgICAgICAgeDogcGxheWVyLngsXG4gICAgICAgIHk6IHBsYXllci55XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ld1JlbW90ZVBsYXllclxufVxuIiwiaW1wb3J0IEV2ZW50SGFuZGxlciBmcm9tICcuLi9FdmVudEhhbmRsZXInXG5pbXBvcnQgb25VcGRhdGVQbGF5ZXJzIGZyb20gJy4vb25VcGRhdGVQbGF5ZXJzJ1xuaW1wb3J0IG9uU29ja2V0Q29ubmVjdGVkIGZyb20gJy4vb25Tb2NrZXRDb25uZWN0ZWQnXG5pbXBvcnQgb25Tb2NrZXREaXNjb25uZWN0IGZyb20gJy4vb25Tb2NrZXREaXNjb25uZWN0J1xuaW1wb3J0IG9uTW92ZVBsYXllciBmcm9tICcuL29uTW92ZVBsYXllcidcbmltcG9ydCBvblJlbW92ZVBsYXllciBmcm9tICcuL29uUmVtb3ZlUGxheWVyJ1xuaW1wb3J0IG9uQnVsbGV0RmlyZWQgZnJvbSAnLi9vbkJ1bGxldEZpcmVkJ1xuaW1wb3J0IG9uQnVsbGV0UmVtb3ZlZCBmcm9tICcuL29uQnVsbGV0UmVtb3ZlZCdcbmltcG9ydCBvblBsYXllckRhbWFnZWQgZnJvbSAnLi9vblBsYXllckRhbWFnZWQnXG5pbXBvcnQgb25QbGF5ZXJSZXNwYXduIGZyb20gJy4vb25QbGF5ZXJSZXNwYXduJ1xuaW1wb3J0IG9uUGxheWVySGVhbHRoVXBkYXRlIGZyb20gJy4vb25QbGF5ZXJIZWFsdGhVcGRhdGUnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc29ja2V0Lm9uKCdjb25uZWN0Jywgb25Tb2NrZXRDb25uZWN0ZWQuYmluZCh0aGlzKSlcbiAgICB0aGlzLnNvY2tldC5vbignZGlzY29ubmVjdCcsIG9uU29ja2V0RGlzY29ubmVjdC5iaW5kKHRoaXMpKVxuXG4gICAgdGhpcy5zb2NrZXQub24oJ3VwZGF0ZSBwbGF5ZXJzJywgb25VcGRhdGVQbGF5ZXJzLmJpbmQodGhpcykpXG4gICAgdGhpcy5zb2NrZXQub24oJ21vdmUgcGxheWVyJywgb25Nb3ZlUGxheWVyLmJpbmQodGhpcykpXG4gICAgdGhpcy5zb2NrZXQub24oJ3JlbW92ZSBwbGF5ZXInLCBvblJlbW92ZVBsYXllci5iaW5kKHRoaXMpKVxuXG4gICAgdGhpcy5zb2NrZXQub24oJ3BsYXllciByZXNwYXduJywgb25QbGF5ZXJSZXNwYXduLmJpbmQodGhpcykpXG4gICAgdGhpcy5zb2NrZXQub24oJ3BsYXllciBkYW1hZ2VkJywgb25QbGF5ZXJEYW1hZ2VkLmJpbmQodGhpcykpXG4gICAgdGhpcy5zb2NrZXQub24oJ3BsYXllciBoZWFsdGggdXBkYXRlJywgb25QbGF5ZXJIZWFsdGhVcGRhdGUuYmluZCh0aGlzKSlcblxuICAgIHRoaXMuc29ja2V0Lm9uKCdidWxsZXQgZmlyZWQnLCBvbkJ1bGxldEZpcmVkLmJpbmQodGhpcykpXG4gICAgdGhpcy5zb2NrZXQub24oJ2J1bGxldCByZW1vdmVkJywgb25CdWxsZXRSZW1vdmVkLmJpbmQodGhpcykpXG5cbiAgICBFdmVudEhhbmRsZXIub24oJ3BsYXllciB1cGRhdGUgbmlja25hbWUnLCAoZGF0YSkgPT4ge1xuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdwbGF5ZXIgdXBkYXRlIG5pY2tuYW1lJywge1xuICAgICAgICAgICAgcm9vbUlkOiB0aGlzLnJvb21JZCxcbiAgICAgICAgICAgIG5pY2tuYW1lOiBkYXRhLm5pY2tuYW1lXG4gICAgICAgIH0pXG4gICAgfSlcbn1cbiIsImltcG9ydCBSZW1vdGVCdWxsZXQgZnJvbSAnLi4vUmVtb3RlQnVsbGV0J1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBvbkJ1bGxldEZpcmVkKGRhdGEpIHtcbiAgICBpZiAoZGF0YS5pZCA9PT0gKCcvIycgKyB0aGlzLnNvY2tldC5pZCkpXG4gICAgICAgIHJldHVyblxuXG4gICAgbGV0IGVuZW15QnVsbGV0ID0gUmVtb3RlQnVsbGV0LmNhbGwodGhpcywgZGF0YSlcbiAgICBsZXQgbmV3VmVsb2NpdHkgPSB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUudmVsb2NpdHlGcm9tUm90YXRpb24oZGF0YS5wb2ludGVyQW5nbGUsIGRhdGEuYnVsbGV0U3BlZWQpXG4gICAgZW5lbXlCdWxsZXQuYm9keS52ZWxvY2l0eS54ICs9IG5ld1ZlbG9jaXR5LnhcbiAgICBlbmVteUJ1bGxldC5ib2R5LnZlbG9jaXR5LnkgKz0gbmV3VmVsb2NpdHkueVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gb25CdWxsZXRSZW1vdmVkKGRhdGEpIHtcbiAgICBpZiAoZGF0YS5pZCA9PT0gKCcvIycgKyB0aGlzLnNvY2tldC5pZCkpXG4gICAgICAgIHJldHVyblxuXG4gICAgbGV0IHJlbW92ZUJ1bGxldCA9IF8uZmluZCh0aGlzLmJ1bGxldHMuY2hpbGRyZW4sIHtcbiAgICAgICAgYnVsbGV0SWQ6IGRhdGEuYnVsbGV0SWRcbiAgICB9KVxuXG4gICAgaWYgKCFyZW1vdmVCdWxsZXQpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0J1bGxldCBub3QgZm91bmQ6ICcsIGRhdGEuYnVsbGV0SWQpXG4gICAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHJlbW92ZUJ1bGxldC5raWxsKClcbn1cbiIsImltcG9ydCBQbGF5ZXJCeUlkIGZyb20nLi4vUGxheWVyQnlJZCdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gb25Nb3ZlUGxheWVyKGRhdGEpIHtcbiAgICBsZXQgbW92ZVBsYXllciA9IFBsYXllckJ5SWQuY2FsbCh0aGlzLCBkYXRhLmlkKVxuXG4gICAgLy8gUGxheWVyIG5vdCBmb3VuZFxuICAgIGlmICghIG1vdmVQbGF5ZXIpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIHBsYXllciBwb3NpdGlvblxuICAgIG1vdmVQbGF5ZXIueCA9IGRhdGEueFxuICAgIG1vdmVQbGF5ZXIueSA9IGRhdGEueVxuXG4gICAgaWYgKG1vdmVQbGF5ZXIueCA+IG1vdmVQbGF5ZXIubGFzdFBvc2l0aW9uLngpIHtcbiAgICAgICAgbW92ZVBsYXllci5hbmltYXRpb25zLnBsYXkoJ3JpZ2h0JylcbiAgICB9XG4gICAgZWxzZSBpZiAobW92ZVBsYXllci54IDwgbW92ZVBsYXllci5sYXN0UG9zaXRpb24ueClcbiAgICB7XG4gICAgICAgIG1vdmVQbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdsZWZ0JylcbiAgICB9XG4gICAgZWxzZVxuICAgIHtcbiAgICAgICAgbW92ZVBsYXllci5hbmltYXRpb25zLnN0b3AoKVxuICAgICAgICBtb3ZlUGxheWVyLmZyYW1lID0gNlxuICAgIH1cblxuICAgIG1vdmVQbGF5ZXIubGFzdFBvc2l0aW9uLnggPSBtb3ZlUGxheWVyLnhcbiAgICBtb3ZlUGxheWVyLmxhc3RQb3NpdGlvbi55ID0gbW92ZVBsYXllci55XG59XG4iLCJpbXBvcnQgRXZlbnRIYW5kbGVyIGZyb20gJy4uL0V2ZW50SGFuZGxlcidcblxubGV0IGRhbWFnZVRpbWVvdXQgPSBudWxsXG5sZXQgaGVhbGluZ0ludGVydmFsID0gbnVsbFxubGV0IGxhc3RLbm93bkhlYWx0aCA9IG51bGxcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gb25QbGF5ZXJEYW1hZ2VkKGRhdGEpIHtcbiAgICBpZiAoZGF0YS5kYW1hZ2VkUGxheWVySWQgIT09ICgnLyMnICsgdGhpcy5zb2NrZXQuaWQpKVxuICAgICAgICByZXR1cm5cblxuICAgIHRoaXMucGxheWVyLm1ldGEuaGVhbHRoID0gZGF0YS5oZWFsdGhcbiAgICBFdmVudEhhbmRsZXIuZW1pdCgnaGVhbHRoIHVwZGF0ZScsIFN0cmluZyh0aGlzLnBsYXllci5tZXRhLmhlYWx0aCkpXG5cbiAgICBpZiAodGhpcy5wbGF5ZXIubWV0YS5oZWFsdGggPiA1NSAmJiB0aGlzLnBsYXllci5tZXRhLmhlYWx0aCA8IDEwMCkge1xuICAgICAgICBjbGVhclRpbWVvdXQoZGFtYWdlVGltZW91dClcbiAgICAgICAgZGFtYWdlVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgLy8gUGxheWVyJ3MgaGVhbHRoIHdpbGwgZnVsbHkgcmVnZW5lcmF0ZVxuICAgICAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgncGxheWVyIGZ1bGwgaGVhbHRoJywge1xuICAgICAgICAgICAgICAgIHJvb21JZDogdGhpcy5yb29tSWRcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0sIDUwMDApXG4gICAgfVxuXG4gICAgaWYgKHRoaXMucGxheWVyLm1ldGEuaGVhbHRoID4gMCAmJiB0aGlzLnBsYXllci5tZXRhLmhlYWx0aCA8PSA1NSkge1xuICAgICAgICAvLyBXYWl0IDUgc2Vjb25kcyB0byBiZWdpbiBoZWFsaW5nIHByb2Nlc3NcbiAgICAgICAgY2xlYXJUaW1lb3V0KGRhbWFnZVRpbWVvdXQpXG4gICAgICAgIGNsZWFySW50ZXJ2YWwoaGVhbGluZ0ludGVydmFsKVxuICAgICAgICBkYW1hZ2VUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBsYXN0S25vd25IZWFsdGggPSB0aGlzLnBsYXllci5tZXRhLmhlYWx0aFxuICAgICAgICAgICAgaGVhbGluZ0ludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChsYXN0S25vd25IZWFsdGggPj0gMTAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaGVhbGluZ0ludGVydmFsKVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxhc3RLbm93bkhlYWx0aCArPSAxMFxuXG4gICAgICAgICAgICAgICAgLy8gSW5jcmVhc2UgcGxheWVyIGhlYWx0aCBieSAxMCBldmVyeSAxLzIgYSBzZWNvbmRcbiAgICAgICAgICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdwbGF5ZXIgaGVhbGluZycsIHtcbiAgICAgICAgICAgICAgICAgICAgcm9vbUlkOiB0aGlzLnJvb21JZFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9LCA1MDApXG4gICAgICAgIH0sIDUwMDApXG4gICAgfVxufVxuIiwiaW1wb3J0IEV2ZW50SGFuZGxlciBmcm9tICcuLi9FdmVudEhhbmRsZXInXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG9uUGxheWVySGVhbHRoVXBkYXRlKGRhdGEpIHtcbiAgICBpZiAoZGF0YS5pZCAhPT0gKCcvIycgKyB0aGlzLnNvY2tldC5pZCkpXG4gICAgICAgIHJldHVyblxuXG4gICAgdGhpcy5wbGF5ZXIubWV0YS5oZWFsdGggPSBkYXRhLmhlYWx0aFxuICAgIEV2ZW50SGFuZGxlci5lbWl0KCdoZWFsdGggdXBkYXRlJywgU3RyaW5nKHRoaXMucGxheWVyLm1ldGEuaGVhbHRoKSlcbn1cbiIsImltcG9ydCBFdmVudEhhbmRsZXIgZnJvbSAnLi4vRXZlbnRIYW5kbGVyJ1xuaW1wb3J0IFdlYXBvbnMgZnJvbSAnLi4vV2VhcG9ucydcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gb25QbGF5ZXJSZXNwYXduKGRhdGEpIHtcbiAgICBpZiAoZGF0YS5kYW1hZ2VkUGxheWVySWQgIT09ICgnLyMnICsgdGhpcy5zb2NrZXQuaWQpKVxuICAgICAgICByZXR1cm5cblxuICAgIC8vIFNldCBwcmltYXJ5IHdlYXBvblxuICAgIHRoaXMucGxheWVyLm1ldGEucHJpbWFyeVdlYXBvbiA9IG5ldyBXZWFwb25zW3RoaXMucGxheWVyLm1ldGEuc2VsZWN0ZWRQcmltYXJ5V2VhcG9uSWRdKHRoaXMpXG4gICAgdGhpcy5wbGF5ZXIubWV0YS5wcmltYXJ5V2VhcG9uLmlkID0gdGhpcy5wbGF5ZXIubWV0YS5zZWxlY3RlZFByaW1hcnlXZWFwb25JZFxuXG4gICAgaWYgKHRoaXMuY3VycmVudFdlYXBvbiA9PT0gJ3ByaW1hcnlXZWFwb24nKVxuICAgICAgICB0aGlzLmFrNDdTcHJpdGUubG9hZFRleHR1cmUodGhpcy5wbGF5ZXIubWV0YS5zZWxlY3RlZFByaW1hcnlXZWFwb25JZClcblxuICAgIC8vIFNldCBzZWNvbmRhcnkgd2VhcG9uXG4gICAgdGhpcy5wbGF5ZXIubWV0YS5zZWNvbmRhcnlXZWFwb24gPSBuZXcgV2VhcG9uc1t0aGlzLnBsYXllci5tZXRhLnNlbGVjdGVkU2Vjb25kYXJ5V2VhcG9uSWRdKHRoaXMpXG4gICAgdGhpcy5wbGF5ZXIubWV0YS5zZWNvbmRhcnlXZWFwb24uaWQgPSB0aGlzLnBsYXllci5tZXRhLnNlbGVjdGVkU2Vjb25kYXJ5V2VhcG9uSWRcblxuICAgIGlmICh0aGlzLmN1cnJlbnRXZWFwb24gPT09ICdzZWNvbmRhcnlXZWFwb24nKVxuICAgICAgICB0aGlzLmFrNDdTcHJpdGUubG9hZFRleHR1cmUodGhpcy5wbGF5ZXIubWV0YS5zZWxlY3RlZFNlY29uZGFyeVdlYXBvbklkKVxuXG4gICAgLy8gUmVzZXQgaGVhbHRoXG4gICAgdGhpcy5wbGF5ZXIubWV0YS5oZWFsdGggPSBkYXRhLmhlYWx0aFxuICAgIEV2ZW50SGFuZGxlci5lbWl0KCdoZWFsdGggdXBkYXRlJywgU3RyaW5nKHRoaXMucGxheWVyLm1ldGEuaGVhbHRoKSlcblxuICAgIC8vIFNwYXduIHBsYXllclxuICAgIGxldCBzcGF3blBvaW50ID0gdGhpcy5tYXBJbnN0YW5jZS5nZXRSYW5kb21TcGF3blBvaW50KClcbiAgICB0aGlzLnBsYXllci54ID0gc3Bhd25Qb2ludC54XG4gICAgdGhpcy5wbGF5ZXIueSA9IHNwYXduUG9pbnQueVxufVxuIiwiaW1wb3J0IFBsYXllckJ5SWQgZnJvbSAnLi4vUGxheWVyQnlJZCdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gb25SZW1vdmVQbGF5ZXIoZGF0YSkge1xuICAgIGxldCByZW1vdmVQbGF5ZXIgPSBQbGF5ZXJCeUlkLmNhbGwodGhpcywgZGF0YS5pZClcblxuICAgIC8vIFBsYXllciBub3QgZm91bmRcbiAgICBpZiAoIXJlbW92ZVBsYXllcikge1xuICAgICAgICBjb25zb2xlLmxvZygnUGxheWVyIG5vdCBmb3VuZDogJywgZGF0YS5pZClcbiAgICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgcmVtb3ZlUGxheWVyLnBsYXllci5raWxsKClcblxuICAgIC8vIFJlbW92ZSBwbGF5ZXIgZnJvbSBhcnJheVxuICAgIHRoaXMuZW5lbWllcy5zcGxpY2UodGhpcy5lbmVtaWVzLmluZGV4T2YocmVtb3ZlUGxheWVyKSwgMSlcbn1cbiIsImltcG9ydCBHZXRRdWVyeVN0cmluZyBmcm9tICcuLi9HZXRRdWVyeVN0cmluZydcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gb25Tb2NrZXRDb25uZWN0ZWQoKSB7XG4gICAgY29uc29sZS5sb2coJ0Nvbm5lY3RlZCB0byBzb2NrZXQgc2VydmVyJylcblxuICAgICAvLyBSZXNldCBlbmVtaWVzIG9uIHJlY29ubmVjdFxuICAgIHRoaXMuZW5lbWllcy5mb3JFYWNoKGZ1bmN0aW9uIChlbmVteSkge1xuICAgICAgICBpZiAoZW5lbXkpIGVuZW15LmtpbGwoKVxuICAgIH0pXG5cbiAgICB0aGlzLmVuZW1pZXMgPSBbXVxuXG4gICAgLy8gU2VuZCBsb2NhbCBwbGF5ZXIgZGF0YSB0byB0aGUgZ2FtZSBzZXJ2ZXJcbiAgICB0aGlzLnNvY2tldC5lbWl0KCduZXcgcGxheWVyJywge1xuICAgICAgICByb29tSWQ6IEdldFF1ZXJ5U3RyaW5nKCdyb29tSWQnKSxcbiAgICAgICAgeDogdGhpcy5wbGF5ZXIueCxcbiAgICAgICAgeTogdGhpcy5wbGF5ZXIueVxuICAgIH0pXG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBvblNvY2tldERpc2Nvbm5lY3QoKSB7XG4gICAgY29uc29sZS5sb2coJ0Rpc2Nvbm5lY3RlZCBmcm9tIHNvY2tldCBzZXJ2ZXInKVxufVxuIiwiaW1wb3J0IFJlbW90ZVBsYXllciBmcm9tICcuLi9SZW1vdGVQbGF5ZXInXG5pbXBvcnQgRXZlbnRIYW5kbGVyIGZyb20gJy4uL0V2ZW50SGFuZGxlcidcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gb25VcGRhdGVQbGF5ZXJzKGRhdGEpIHtcbiAgICB0aGlzLnJvb21JZCA9IGRhdGEucm9vbS5pZFxuXG4gICAgbGV0IG5ld3VybCA9IHdpbmRvdy5sb2NhdGlvbi5wcm90b2NvbCArIFwiLy9cIiArIHdpbmRvdy5sb2NhdGlvbi5ob3N0ICsgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lICsgJz9yb29tSWQ9JyArIGRhdGEucm9vbS5pZDtcbiAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUoeyBwYXRoOiBuZXd1cmwgfSwgJycsIG5ld3VybCk7XG5cbiAgICB0aGlzLmVuZW1pZXMuZm9yRWFjaChmdW5jdGlvbiAoZW5lbXkpIHtcbiAgICAgICAgZW5lbXkua2lsbCgpXG4gICAgfSlcblxuICAgIHRoaXMuZW5lbWllcyA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKVxuXG4gICAgRXZlbnRIYW5kbGVyLmVtaXQoJ3BsYXllcnMgdXBkYXRlJywgZGF0YS5yb29tLnBsYXllcnMpXG5cbiAgICBkYXRhLnJvb20ucGxheWVycy5mb3JFYWNoKChwbGF5ZXIpID0+IHtcbiAgICAgICAgaWYgKHBsYXllci5pZCA9PT0gKCcvIycgKyB0aGlzLnNvY2tldC5pZCkpIHtcbiAgICAgICAgICAgIEV2ZW50SGFuZGxlci5lbWl0KCdzY29yZSB1cGRhdGUnLCBTdHJpbmcocGxheWVyLm1ldGEuc2NvcmUpKVxuICAgICAgICAgICAgRXZlbnRIYW5kbGVyLmVtaXQoJ2hlYWx0aCB1cGRhdGUnLCBTdHJpbmcocGxheWVyLm1ldGEuaGVhbHRoKSlcbiAgICAgICAgICAgIEV2ZW50SGFuZGxlci5lbWl0KCdwbGF5ZXIgdXBkYXRlJywgeyBwbGF5ZXIgfSlcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG5ld1JlbW90ZVBsYXllciA9IFJlbW90ZVBsYXllci5jYWxsKHRoaXMsIHBsYXllcilcbiAgICAgICAgdGhpcy5lbmVtaWVzLmFkZChuZXdSZW1vdGVQbGF5ZXIpXG4gICAgfSlcbn1cbiIsImltcG9ydCBGaXJlU3RhbmRhcmRCdWxsZXQgZnJvbSAnLi4vRmlyZVN0YW5kYXJkQnVsbGV0J1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBSzQ3IGV4dGVuZHMgUGhhc2VyLkdyb3VwIHtcbiAgICBjb25zdHJ1Y3Rvcihyb290U2NvcGUpIHtcbiAgICAgICAgc3VwZXIocm9vdFNjb3BlKVxuXG4gICAgICAgIHRoaXMucm9vdFNjb3BlID0gcm9vdFNjb3BlXG5cbiAgICAgICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgdGhpcy5yb290U2NvcGUuZ2FtZSwgdGhpcy5yb290U2NvcGUuZ2FtZS53b3JsZCwgJ0FLLTQ3JywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSlcblxuICAgICAgICB0aGlzLmJ1bGxldEhlaWdodCA9IDJcbiAgICAgICAgdGhpcy5idWxsZXRTcGVlZCA9IDIzMDBcbiAgICAgICAgdGhpcy5idWxsZXRXaWR0aCA9IDQwXG4gICAgICAgIHRoaXMuZGFtYWdlID0gMjJcbiAgICAgICAgdGhpcy5maXJlUmF0ZSA9IDE2MFxuICAgICAgICB0aGlzLmZ4ID0gdGhpcy5yb290U2NvcGUuZ2FtZS5hZGQuYXVkaW8oJ0FLNDctc291bmQnKVxuICAgICAgICB0aGlzLm5leHRGaXJlID0gMFxuICAgIH1cblxuICAgIGZpcmUoKSB7XG4gICAgICAgIGlmICh0aGlzLnJvb3RTY29wZS5nYW1lLnRpbWUubm93IDwgdGhpcy5uZXh0RmlyZSB8fCB0aGlzLnJvb3RTY29wZS5idWxsZXRzLmNvdW50RGVhZCgpIDw9IDApXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5yb290U2NvcGUuZ2FtZS50aW1lLm5vdyArIHRoaXMuZmlyZVJhdGVcblxuICAgICAgICBGaXJlU3RhbmRhcmRCdWxsZXQuY2FsbCh0aGlzKVxuICAgIH1cbn1cbiIsImltcG9ydCBGaXJlU3RhbmRhcmRCdWxsZXQgZnJvbSAnLi4vRmlyZVN0YW5kYXJkQnVsbGV0J1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBVUcgZXh0ZW5kcyBQaGFzZXIuR3JvdXAge1xuICAgIGNvbnN0cnVjdG9yKHJvb3RTY29wZSkge1xuICAgICAgICBzdXBlcihyb290U2NvcGUpXG5cbiAgICAgICAgdGhpcy5yb290U2NvcGUgPSByb290U2NvcGVcblxuICAgICAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCB0aGlzLnJvb3RTY29wZS5nYW1lLCB0aGlzLnJvb3RTY29wZS5nYW1lLndvcmxkLCAnQVVHJywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSlcblxuICAgICAgICB0aGlzLmJ1bGxldEhlaWdodCA9IDJcbiAgICAgICAgdGhpcy5idWxsZXRTcGVlZCA9IDIzMDBcbiAgICAgICAgdGhpcy5idWxsZXRXaWR0aCA9IDQwXG4gICAgICAgIHRoaXMuZGFtYWdlID0gMjJcbiAgICAgICAgdGhpcy5maXJlUmF0ZSA9IDE2MFxuICAgICAgICB0aGlzLmZ4ID0gdGhpcy5yb290U2NvcGUuZ2FtZS5hZGQuYXVkaW8oJ0FVRy1zb3VuZCcpXG4gICAgICAgIHRoaXMubmV4dEZpcmUgPSAwXG4gICAgfVxuXG4gICAgZmlyZSgpIHtcbiAgICAgICAgaWYgKHRoaXMucm9vdFNjb3BlLmdhbWUudGltZS5ub3cgPCB0aGlzLm5leHRGaXJlIHx8IHRoaXMucm9vdFNjb3BlLmJ1bGxldHMuY291bnREZWFkKCkgPD0gMClcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLnJvb3RTY29wZS5nYW1lLnRpbWUubm93ICsgdGhpcy5maXJlUmF0ZVxuXG4gICAgICAgIEZpcmVTdGFuZGFyZEJ1bGxldC5jYWxsKHRoaXMpXG4gICAgfVxufVxuIiwiaW1wb3J0IEZpcmVTdGFuZGFyZEJ1bGxldCBmcm9tICcuLi9GaXJlU3RhbmRhcmRCdWxsZXQnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhcnJldHQgZXh0ZW5kcyBQaGFzZXIuR3JvdXAge1xuICAgIGNvbnN0cnVjdG9yKHJvb3RTY29wZSkge1xuICAgICAgICBzdXBlcihyb290U2NvcGUpXG5cbiAgICAgICAgdGhpcy5yb290U2NvcGUgPSByb290U2NvcGVcblxuICAgICAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCB0aGlzLnJvb3RTY29wZS5nYW1lLCB0aGlzLnJvb3RTY29wZS5nYW1lLndvcmxkLCAnQUstNDcnLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKVxuXG4gICAgICAgIHRoaXMuYnVsbGV0SGVpZ2h0ID0gMlxuICAgICAgICB0aGlzLmJ1bGxldFNwZWVkID0gMzQzNVxuICAgICAgICB0aGlzLmJ1bGxldFdpZHRoID0gNDBcbiAgICAgICAgdGhpcy5kYW1hZ2UgPSA4OFxuICAgICAgICB0aGlzLmZpcmVSYXRlID0gMzAwMFxuICAgICAgICB0aGlzLmZ4ID0gdGhpcy5yb290U2NvcGUuZ2FtZS5hZGQuYXVkaW8oJ0JhcnJldE05MC1zb3VuZCcpXG4gICAgICAgIHRoaXMubmV4dEZpcmUgPSAwXG4gICAgfVxuXG4gICAgZmlyZSgpIHtcbiAgICAgICAgaWYgKHRoaXMucm9vdFNjb3BlLmdhbWUudGltZS5ub3cgPCB0aGlzLm5leHRGaXJlIHx8IHRoaXMucm9vdFNjb3BlLmJ1bGxldHMuY291bnREZWFkKCkgPD0gMClcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLnJvb3RTY29wZS5nYW1lLnRpbWUubm93ICsgdGhpcy5maXJlUmF0ZVxuXG4gICAgICAgIEZpcmVTdGFuZGFyZEJ1bGxldC5jYWxsKHRoaXMpXG4gICAgfVxufVxuIiwiaW1wb3J0IEZpcmVTdGFuZGFyZEJ1bGxldCBmcm9tICcuLi9GaXJlU3RhbmRhcmRCdWxsZXQnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERlc2VydEVhZ2xlIGV4dGVuZHMgUGhhc2VyLkdyb3VwIHtcbiAgICBjb25zdHJ1Y3Rvcihyb290U2NvcGUpIHtcbiAgICAgICAgc3VwZXIocm9vdFNjb3BlKVxuXG4gICAgICAgIHRoaXMucm9vdFNjb3BlID0gcm9vdFNjb3BlXG5cbiAgICAgICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgcm9vdFNjb3BlLmdhbWUsIHJvb3RTY29wZS5nYW1lLndvcmxkLCAnRGVzZXJ0IEVhZ2xlJywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSlcblxuICAgICAgICB0aGlzLmJ1bGxldEhlaWdodCA9IDJcbiAgICAgICAgdGhpcy5idWxsZXRTcGVlZCA9IDIzMDBcbiAgICAgICAgdGhpcy5idWxsZXRXaWR0aCA9IDQwXG4gICAgICAgIHRoaXMuZGFtYWdlID0gMzNcbiAgICAgICAgdGhpcy5maXJlUmF0ZSA9IDI2N1xuICAgICAgICB0aGlzLmZ4ID0gcm9vdFNjb3BlLmdhbWUuYWRkLmF1ZGlvKCdEZXNlcnRFYWdsZS1zb3VuZCcpXG4gICAgICAgIHRoaXMubmV4dEZpcmUgPSAwXG4gICAgfVxuXG4gICAgZmlyZSgpIHtcbiAgICAgICAgaWYgKHRoaXMucm9vdFNjb3BlLmdhbWUudGltZS5ub3cgPCB0aGlzLm5leHRGaXJlIHx8IHRoaXMucm9vdFNjb3BlLmJ1bGxldHMuY291bnREZWFkKCkgPD0gMClcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLnJvb3RTY29wZS5nYW1lLnRpbWUubm93ICsgdGhpcy5maXJlUmF0ZVxuXG4gICAgICAgIEZpcmVTdGFuZGFyZEJ1bGxldC5jYWxsKHRoaXMpXG4gICAgfVxufVxuIiwiaW1wb3J0IEZpcmVTdGFuZGFyZEJ1bGxldCBmcm9tICcuLi9GaXJlU3RhbmRhcmRCdWxsZXQnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEc0MyBleHRlbmRzIFBoYXNlci5Hcm91cCB7XG4gICAgY29uc3RydWN0b3Iocm9vdFNjb3BlKSB7XG4gICAgICAgIHN1cGVyKHJvb3RTY29wZSlcblxuICAgICAgICB0aGlzLnJvb3RTY29wZSA9IHJvb3RTY29wZVxuXG4gICAgICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIHRoaXMucm9vdFNjb3BlLmdhbWUsIHRoaXMucm9vdFNjb3BlLmdhbWUud29ybGQsICdHNDMnLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKVxuXG4gICAgICAgIHRoaXMuYnVsbGV0SGVpZ2h0ID0gMlxuICAgICAgICB0aGlzLmJ1bGxldFNwZWVkID0gMjMwMFxuICAgICAgICB0aGlzLmJ1bGxldFdpZHRoID0gNDBcbiAgICAgICAgdGhpcy5kYW1hZ2UgPSA0NFxuICAgICAgICB0aGlzLmZpcmVSYXRlID0gMTMwMFxuICAgICAgICB0aGlzLmZ4ID0gdGhpcy5yb290U2NvcGUuZ2FtZS5hZGQuYXVkaW8oJ0c0My1zb3VuZCcpXG4gICAgICAgIHRoaXMubmV4dEZpcmUgPSAwXG4gICAgfVxuXG4gICAgZmlyZSgpIHtcbiAgICAgICAgaWYgKHRoaXMucm9vdFNjb3BlLmdhbWUudGltZS5ub3cgPCB0aGlzLm5leHRGaXJlIHx8IHRoaXMucm9vdFNjb3BlLmJ1bGxldHMuY291bnREZWFkKCkgPD0gMClcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLnJvb3RTY29wZS5nYW1lLnRpbWUubm93ICsgdGhpcy5maXJlUmF0ZVxuXG4gICAgICAgIEZpcmVTdGFuZGFyZEJ1bGxldC5jYWxsKHRoaXMpXG4gICAgfVxufVxuIiwiaW1wb3J0IEZpcmVTdGFuZGFyZEJ1bGxldCBmcm9tICcuLi9GaXJlU3RhbmRhcmRCdWxsZXQnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE00QTEgZXh0ZW5kcyBQaGFzZXIuR3JvdXAge1xuICAgIGNvbnN0cnVjdG9yKHJvb3RTY29wZSkge1xuICAgICAgICBzdXBlcihyb290U2NvcGUpXG5cbiAgICAgICAgdGhpcy5yb290U2NvcGUgPSByb290U2NvcGVcblxuICAgICAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCB0aGlzLnJvb3RTY29wZS5nYW1lLCB0aGlzLnJvb3RTY29wZS5nYW1lLndvcmxkLCAnTTRBMScsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpXG5cbiAgICAgICAgdGhpcy5idWxsZXRIZWlnaHQgPSAyXG4gICAgICAgIHRoaXMuYnVsbGV0U3BlZWQgPSAyNDAwXG4gICAgICAgIHRoaXMuYnVsbGV0V2lkdGggPSA0MFxuICAgICAgICB0aGlzLmRhbWFnZSA9IDIwXG4gICAgICAgIHRoaXMuZmlyZVJhdGUgPSAxNTBcbiAgICAgICAgdGhpcy5meCA9IHRoaXMucm9vdFNjb3BlLmdhbWUuYWRkLmF1ZGlvKCdNNEExLXNvdW5kJylcbiAgICAgICAgdGhpcy5uZXh0RmlyZSA9IDBcbiAgICB9XG5cbiAgICBmaXJlKCkge1xuICAgICAgICBpZiAodGhpcy5yb290U2NvcGUuZ2FtZS50aW1lLm5vdyA8IHRoaXMubmV4dEZpcmUgfHwgdGhpcy5yb290U2NvcGUuYnVsbGV0cy5jb3VudERlYWQoKSA8PSAwKVxuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMucm9vdFNjb3BlLmdhbWUudGltZS5ub3cgKyB0aGlzLmZpcmVSYXRlXG5cbiAgICAgICAgRmlyZVN0YW5kYXJkQnVsbGV0LmNhbGwodGhpcylcbiAgICB9XG59XG4iLCJpbXBvcnQgRmlyZVNob3RndW5TaGVsbCBmcm9tICcuLi9GaXJlU2hvdGd1blNoZWxsJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNNTAwIGV4dGVuZHMgUGhhc2VyLkdyb3VwIHtcbiAgICBjb25zdHJ1Y3Rvcihyb290U2NvcGUpIHtcbiAgICAgICAgc3VwZXIocm9vdFNjb3BlKVxuXG4gICAgICAgIHRoaXMucm9vdFNjb3BlID0gcm9vdFNjb3BlXG5cbiAgICAgICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgdGhpcy5yb290U2NvcGUuZ2FtZSwgdGhpcy5yb290U2NvcGUuZ2FtZS53b3JsZCwgJ001MDAnLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKVxuXG4gICAgICAgIHRoaXMuYnVsbGV0SGVpZ2h0ID0gMlxuICAgICAgICB0aGlzLmJ1bGxldFNwZWVkID0gMTkwMFxuICAgICAgICB0aGlzLmJ1bGxldFdpZHRoID0gNDBcbiAgICAgICAgdGhpcy5maXJlUmF0ZSA9IDE2NTBcbiAgICAgICAgdGhpcy5meCA9IHRoaXMucm9vdFNjb3BlLmdhbWUuYWRkLmF1ZGlvKCdNNTAwLXNvdW5kJylcbiAgICAgICAgdGhpcy5uZXh0RmlyZSA9IDBcbiAgICB9XG5cbiAgICBmaXJlKCkge1xuICAgICAgICBpZiAodGhpcy5yb290U2NvcGUuZ2FtZS50aW1lLm5vdyA8IHRoaXMubmV4dEZpcmUgfHwgdGhpcy5yb290U2NvcGUuYnVsbGV0cy5jb3VudERlYWQoKSA8PSAwKVxuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMucm9vdFNjb3BlLmdhbWUudGltZS5ub3cgKyB0aGlzLmZpcmVSYXRlXG5cbiAgICAgICAgRmlyZVNob3RndW5TaGVsbC5jYWxsKHRoaXMpXG4gICAgfVxufVxuIiwiaW1wb3J0IEZpcmVTdGFuZGFyZEJ1bGxldCBmcm9tICcuLi9GaXJlU3RhbmRhcmRCdWxsZXQnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFA5MCBleHRlbmRzIFBoYXNlci5Hcm91cCB7XG4gICAgY29uc3RydWN0b3Iocm9vdFNjb3BlKSB7XG4gICAgICAgIHN1cGVyKHJvb3RTY29wZSlcblxuICAgICAgICB0aGlzLnJvb3RTY29wZSA9IHJvb3RTY29wZVxuXG4gICAgICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIHRoaXMucm9vdFNjb3BlLmdhbWUsIHRoaXMucm9vdFNjb3BlLmdhbWUud29ybGQsICdQOTAnLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKVxuXG4gICAgICAgIHRoaXMuYnVsbGV0SGVpZ2h0ID0gMlxuICAgICAgICB0aGlzLmJ1bGxldFNwZWVkID0gMjMwMFxuICAgICAgICB0aGlzLmJ1bGxldFdpZHRoID0gNDBcbiAgICAgICAgdGhpcy5kYW1hZ2UgPSAyMlxuICAgICAgICB0aGlzLmZpcmVSYXRlID0gMTIwXG4gICAgICAgIHRoaXMuZnggPSB0aGlzLnJvb3RTY29wZS5nYW1lLmFkZC5hdWRpbygnUDkwLXNvdW5kJylcbiAgICAgICAgdGhpcy5uZXh0RmlyZSA9IDBcbiAgICB9XG5cbiAgICBmaXJlKCkge1xuICAgICAgICBpZiAodGhpcy5yb290U2NvcGUuZ2FtZS50aW1lLm5vdyA8IHRoaXMubmV4dEZpcmUgfHwgdGhpcy5yb290U2NvcGUuYnVsbGV0cy5jb3VudERlYWQoKSA8PSAwKVxuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMucm9vdFNjb3BlLmdhbWUudGltZS5ub3cgKyB0aGlzLmZpcmVSYXRlXG5cbiAgICAgICAgRmlyZVN0YW5kYXJkQnVsbGV0LmNhbGwodGhpcylcbiAgICB9XG59XG4iLCJpbXBvcnQgRmlyZVJvY2tldCBmcm9tICcuLi9GaXJlUm9ja2V0J1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSUEcgZXh0ZW5kcyBQaGFzZXIuR3JvdXAge1xuICAgIGNvbnN0cnVjdG9yKHJvb3RTY29wZSkge1xuICAgICAgICBzdXBlcihyb290U2NvcGUpXG5cbiAgICAgICAgdGhpcy5yb290U2NvcGUgPSByb290U2NvcGVcblxuICAgICAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCB0aGlzLnJvb3RTY29wZS5nYW1lLCB0aGlzLnJvb3RTY29wZS5nYW1lLndvcmxkLCAnQUstNDcnLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKVxuXG4gICAgICAgIHRoaXMuYnVsbGV0SGVpZ2h0ID0gMlxuICAgICAgICB0aGlzLmJ1bGxldFNwZWVkID0gMjMwMFxuICAgICAgICB0aGlzLmJ1bGxldFdpZHRoID0gNDBcbiAgICAgICAgdGhpcy5kYW1hZ2UgPSAyMlxuICAgICAgICB0aGlzLmZpcmVSYXRlID0gMzAwMFxuICAgICAgICB0aGlzLmZ4ID0gdGhpcy5yb290U2NvcGUuZ2FtZS5hZGQuYXVkaW8oJ1JQRy1zb3VuZCcpXG4gICAgICAgIHRoaXMubmV4dEZpcmUgPSAwXG4gICAgfVxuXG4gICAgZmlyZSgpIHtcbiAgICAgICAgaWYgKHRoaXMucm9vdFNjb3BlLmdhbWUudGltZS5ub3cgPCB0aGlzLm5leHRGaXJlIHx8IHRoaXMucm9vdFNjb3BlLmJ1bGxldHMuY291bnREZWFkKCkgPD0gMClcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLnJvb3RTY29wZS5nYW1lLnRpbWUubm93ICsgdGhpcy5maXJlUmF0ZVxuXG4gICAgICAgIEZpcmVSb2NrZXQuY2FsbCh0aGlzKVxuICAgIH1cbn1cblxuLy9cbi8vIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIC8vICBSUEcgdGhhdCB2aXN1YWxseSB0cmFjayB0aGUgZGlyZWN0aW9uIHRoZXkncmUgaGVhZGluZyBpbiAvL1xuLy8gLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy9cbi8vIFdlYXBvbi5SUEcgPSBmdW5jdGlvbiAoZ2FtZSkge1xuLy9cbi8vICAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCBnYW1lLCBnYW1lLndvcmxkLCAnUlBHJywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG4vL1xuLy8gICAgIHRoaXMubmV4dEZpcmUgPSAwO1xuLy8gICAgIHRoaXMuYnVsbGV0U3BlZWQgPSA0MDA7XG4vLyAgICAgdGhpcy5maXJlUmF0ZSA9IDI1MDtcbi8vXG4vLyAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzMjsgaSsrKVxuLy8gICAgIHtcbi8vICAgICAgICAgdGhpcy5hZGQobmV3IEJ1bGxldChnYW1lLCAnYnVsbGV0MTAnKSwgdHJ1ZSk7XG4vLyAgICAgfVxuLy9cbi8vICAgICB0aGlzLnNldEFsbCgndHJhY2tpbmcnLCB0cnVlKVxuLy9cbi8vICAgICByZXR1cm4gdGhpcztcbi8vXG4vLyB9O1xuLy9cbi8vIFdlYXBvbi5SUEcucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcbi8vIFdlYXBvbi5SUEcucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gV2VhcG9uLlJQRztcbi8vXG4vLyBXZWFwb24uUlBHLnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24gKHNvdXJjZSkge1xuLy9cbi8vICAgICBpZiAodGhpcy5nYW1lLnRpbWUudGltZSA8IHRoaXMubmV4dEZpcmUpIHsgcmV0dXJuOyB9XG4vL1xuLy8gICAgIHZhciB4ID0gc291cmNlLnggKyAxMDtcbi8vICAgICB2YXIgeSA9IHNvdXJjZS55ICsgMTA7XG4vL1xuLy8gICAgIHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgLTcwMCk7XG4vLyAgICAgdGhpcy5nZXRGaXJzdEV4aXN0cyhmYWxzZSkuZmlyZSh4LCB5LCAwLCB0aGlzLmJ1bGxldFNwZWVkLCAwLCA3MDApO1xuLy9cbi8vICAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5nYW1lLnRpbWUudGltZSArIHRoaXMuZmlyZVJhdGU7XG4vL1xuLy8gfTtcbiIsImltcG9ydCBGaXJlU3RhbmRhcmRCdWxsZXQgZnJvbSAnLi4vRmlyZVN0YW5kYXJkQnVsbGV0J1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTa29ycGlvbiBleHRlbmRzIFBoYXNlci5Hcm91cCB7XG4gICAgY29uc3RydWN0b3Iocm9vdFNjb3BlKSB7XG4gICAgICAgIHN1cGVyKHJvb3RTY29wZSlcblxuICAgICAgICB0aGlzLnJvb3RTY29wZSA9IHJvb3RTY29wZVxuXG4gICAgICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIHRoaXMucm9vdFNjb3BlLmdhbWUsIHRoaXMucm9vdFNjb3BlLmdhbWUud29ybGQsICdTa29ycGlvbicsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpXG5cbiAgICAgICAgdGhpcy5idWxsZXRIZWlnaHQgPSAyXG4gICAgICAgIHRoaXMuYnVsbGV0U3BlZWQgPSAyMzAwXG4gICAgICAgIHRoaXMuYnVsbGV0V2lkdGggPSA0MFxuICAgICAgICB0aGlzLmRhbWFnZSA9IDIyXG4gICAgICAgIHRoaXMuZmlyZVJhdGUgPSAxMjBcbiAgICAgICAgdGhpcy5meCA9IHRoaXMucm9vdFNjb3BlLmdhbWUuYWRkLmF1ZGlvKCdTa29ycGlvbi1zb3VuZCcpXG4gICAgICAgIHRoaXMubmV4dEZpcmUgPSAwXG4gICAgfVxuXG4gICAgZmlyZSgpIHtcbiAgICAgICAgaWYgKHRoaXMucm9vdFNjb3BlLmdhbWUudGltZS5ub3cgPCB0aGlzLm5leHRGaXJlIHx8IHRoaXMucm9vdFNjb3BlLmJ1bGxldHMuY291bnREZWFkKCkgPD0gMClcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLnJvb3RTY29wZS5nYW1lLnRpbWUubm93ICsgdGhpcy5maXJlUmF0ZVxuXG4gICAgICAgIEZpcmVTdGFuZGFyZEJ1bGxldC5jYWxsKHRoaXMpXG4gICAgfVxufVxuIiwiaW1wb3J0IEFLNDcgZnJvbSAnLi9BSzQ3J1xuaW1wb3J0IEFVRyBmcm9tICcuL0FVRydcbmltcG9ydCBCYXJyZXR0IGZyb20gJy4vQmFycmV0dCdcbmltcG9ydCBEZXNlcnRFYWdsZSBmcm9tICcuL0Rlc2VydEVhZ2xlJ1xuaW1wb3J0IEc0MyBmcm9tICcuL0c0MydcbmltcG9ydCBNNEExIGZyb20gJy4vTTRBMSdcbmltcG9ydCBNNTAwIGZyb20gJy4vTTUwMCdcbmltcG9ydCBQOTAgZnJvbSAnLi9QOTAnXG5pbXBvcnQgUlBHIGZyb20gJy4vUlBHJ1xuaW1wb3J0IFNrb3JwaW9uIGZyb20gJy4vU2tvcnBpb24nXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBBSzQ3LFxuICAgIEFVRyxcbiAgICBCYXJyZXR0LFxuICAgIERlc2VydEVhZ2xlLFxuICAgIEc0MyxcbiAgICBNNEExLFxuICAgIE01MDAsXG4gICAgUDkwLFxuICAgIFJQRyxcbiAgICBTa29ycGlvblxufVxuIiwiY29uc3Qgc3Bhd25Qb2ludHMgPSBbXG4gICAgeyB4OiA4MTUsIHk6IDE3MzAgfSxcbiAgICB7IHg6IDMzODAsIHk6IDEwMzAgfSxcbiAgICB7IHg6IDQ0MzcsIHk6IDE1NTAgfSxcbiAgICB7IHg6IDY2OTAsIHk6IDE4NjAgfSxcbiAgICB7IHg6IDM4MzIsIHk6IDMzNTAgfSxcbiAgICB7IHg6IDM3NzUsIHk6IDIzMDAgfSxcbiAgICB7IHg6IDI0MjAsIHk6IDI5MDAgfVxuXVxuXG5jb25zdCBsZWRnZXMgPSBbXG4gICAgeyBpZDogMSwgeDogMjE0NSwgeTogMjA2NSwgd2lkdGg6IDEzNSwgaGVpZ2h0OiA0MCB9LFxuICAgIHsgaWQ6IDIsIHg6IDI2MTMsIHk6IDEwOTQsIHdpZHRoOiAxMTAwLCBoZWlnaHQ6IDExMiB9LFxuICAgIHsgaWQ6IDMsIHg6IDM2NTcsIHk6IDM0NDYsIHdpZHRoOiA1MDAsIGhlaWdodDogNjAwIH0sXG4gICAgeyBpZDogNCwgeDogNTIxNywgeTogMTkzOCwgd2lkdGg6IDM4MCwgaGVpZ2h0OiA2MDAgfSxcbiAgICB7IGlkOiA1LCB4OiA0MjIsIHk6IDE4MjQsIHdpZHRoOiAxMTUwLCBoZWlnaHQ6IDMwMCB9LFxuICAgIHsgaWQ6IDYsIHg6IDE1NTUsIHk6IDE3NDksIHdpZHRoOiAyNzAsIGhlaWdodDogNzMwIH0sXG4gICAgeyBpZDogNywgeDogMTgyMCwgeTogMTc0OSwgd2lkdGg6IDQ3MCwgaGVpZ2h0OiA2IH0sXG4gICAgeyBpZDogOCwgeDogMjI3NSwgeTogMTc0OSwgd2lkdGg6IDMyMCwgaGVpZ2h0OiA2MzAgfSxcbiAgICB7IGlkOiA5LCB4OiAyNTk1LCB5OiAxNjY3LCB3aWR0aDogMTEyMCwgaGVpZ2h0OiAyNjAgfSxcbiAgICB7IGlkOiAxMCwgeDogNDMwNCwgeTogMTYyMSwgd2lkdGg6IDM3NSwgaGVpZ2h0OiAxMzAwIH0sXG4gICAgeyBpZDogMTEsIHg6IDE4MjUsIHk6IDIyOTgsIHdpZHRoOiAxNjAsIGhlaWdodDogMTUyIH0sXG4gICAgeyBpZDogMTIsIHg6IDU2NDQsIHk6IDE1NzMsIHdpZHRoOiAzMzAsIGhlaWdodDogMjAgfSxcbiAgICB7IGlkOiAxMywgeDogNDY3MywgeTogMjAxNywgd2lkdGg6IDU3MCwgaGVpZ2h0OiAyNTQgfSxcbiAgICB7IGlkOiAxNCwgeDogMjk0OCwgeTogMzEzNywgd2lkdGg6IDM4MCwgaGVpZ2h0OiAzMDAgfSxcbiAgICB7IGlkOiAxNSwgeDogMzk4MywgeTogMjAyOCwgd2lkdGg6IDM0MSwgaGVpZ2h0OiA3MDAgfSxcbiAgICB7IGlkOiAxNiwgeDogMTkxMiwgeTogMjk2Nywgd2lkdGg6IDEwNDUsIGhlaWdodDogNTAwIH0sXG4gICAgeyBpZDogMTcsIHg6IDY2MjgsIHk6IDE1OTAsIHdpZHRoOiAzODUsIGhlaWdodDogMzcgfSxcbiAgICB7IGlkOiAxOCwgeDogNjYyOCwgeTogMTE3OCwgd2lkdGg6IDM4NSwgaGVpZ2h0OiAzNyB9LFxuICAgIHsgaWQ6IDE5LCB4OiA1NTkwLCB5OiAyMDM4LCB3aWR0aDogMzUwLCBoZWlnaHQ6IDYwMCB9LFxuICAgIHsgaWQ6IDIwLCB4OiA2OTg0LCB5OiAxOTg5LCB3aWR0aDogNDUwLCBoZWlnaHQ6IDE2NyB9LFxuICAgIHsgaWQ6IDIxLCB4OiAzNjcyLCB5OiAyNDAxLCB3aWR0aDogMzMwLCBoZWlnaHQ6IDUwMCB9LFxuICAgIHsgaWQ6IDIyLCB4OiAzMzAzLCB5OiAyNTk5LCB3aWR0aDogNDAwLCBoZWlnaHQ6IDMwMCB9LFxuICAgIHsgaWQ6IDIzLCB4OiA1OTQwLCB5OiAyMDE4LCB3aWR0aDogMTA1MCwgaGVpZ2h0OiA2MDAgfVxuXVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIaWdoUnVsZUp1bmdsZSB7XG4gICAgY29uc3RydWN0b3Iocm9vdFNjb3BlKSB7XG4gICAgICAgIHRoaXMucm9vdFNjb3BlID0gcm9vdFNjb3BlXG4gICAgfVxuXG4gICAgZ2V0UmFuZG9tU3Bhd25Qb2ludCgpIHtcbiAgICAgICAgcmV0dXJuIF8uc2FtcGxlKHNwYXduUG9pbnRzKVxuICAgIH1cblxuICAgIGNyZWF0ZSgpIHtcbiAgICAgICAgdGhpcy5yb290U2NvcGUuc2t5c3ByaXRlID0gdGhpcy5yb290U2NvcGUuYWRkLnRpbGVTcHJpdGUoMCwgMCwgdGhpcy5yb290U2NvcGUuZ2FtZS53b3JsZC53aWR0aCwgdGhpcy5yb290U2NvcGUuZ2FtZS53b3JsZC5oZWlnaHQsICdtYXAtYmcnKVxuICAgICAgICB0aGlzLnJvb3RTY29wZS5wbGF0Zm9ybXMgPSB0aGlzLnJvb3RTY29wZS5hZGQuZ3JvdXAoKVxuICAgICAgICB0aGlzLnJvb3RTY29wZS5wbGF0Zm9ybXMuZW5hYmxlQm9keSA9IHRydWVcbiAgICAgICAgdGhpcy5jcmVhdGVMZWRnZXMoKVxuICAgICAgICB0aGlzLnJvb3RTY29wZS5wbGF0Zm9ybXMuc2V0QWxsKCdib2R5LmltbW92YWJsZScsIHRydWUpXG4gICAgICAgIHRoaXMucm9vdFNjb3BlLnBsYXRmb3Jtcy5zZXRBbGwoJ2JvZHkuYWxsb3dHcmF2aXR5JywgZmFsc2UpXG4gICAgfVxuXG4gICAgY3JlYXRlTGVkZ2VzKCkge1xuICAgICAgICBsZWRnZXMuZm9yRWFjaCgobGVkZ2UpID0+IHtcbiAgICAgICAgICAgIC8vIHZhciBuZXdMZWRnZSA9IHRoaXMucm9vdFNjb3BlLnBsYXRmb3Jtcy5jcmVhdGUobGVkZ2UueCwgbGVkZ2UueSwgJ2dyb3VuZCcpXG4gICAgICAgICAgICB2YXIgbmV3TGVkZ2UgPSB0aGlzLnJvb3RTY29wZS5wbGF0Zm9ybXMuY3JlYXRlKGxlZGdlLngsIGxlZGdlLnkpXG4gICAgICAgICAgICBuZXdMZWRnZS5oZWlnaHQgPSBsZWRnZS5oZWlnaHRcbiAgICAgICAgICAgIG5ld0xlZGdlLndpZHRoID0gbGVkZ2Uud2lkdGhcblxuICAgICAgICAgICAgLy8gRGVidWcgc3R1ZmZcbiAgICAgICAgICAgIC8vIG5ld0xlZGdlLmFscGhhID0gMC40XG4gICAgICAgICAgICAvLyBsZXQgc3R5bGUgPSB7IGZvbnQ6IFwiMjBweCBBcmlhbFwiLCBmaWxsOiBcIiNmZjAwNDRcIiwgYWxpZ246IFwiY2VudGVyXCIsIGJhY2tncm91bmRDb2xvcjogXCIjZmZmZjAwXCIgfVxuICAgICAgICAgICAgLy8gbGV0IHRleHQgPSB0aGlzLnJvb3RTY29wZS5nYW1lLmFkZC50ZXh0KGxlZGdlLngsIGxlZGdlLnksIGxlZGdlLmlkLCBzdHlsZSlcbiAgICAgICAgICAgIC8vIHRleHQuYWxwaGEgPSAwLjJcbiAgICAgICAgfSlcbiAgICB9XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBhc3NpZ24gICAgICAgID0gcmVxdWlyZSgnZXM1LWV4dC9vYmplY3QvYXNzaWduJylcbiAgLCBub3JtYWxpemVPcHRzID0gcmVxdWlyZSgnZXM1LWV4dC9vYmplY3Qvbm9ybWFsaXplLW9wdGlvbnMnKVxuICAsIGlzQ2FsbGFibGUgICAgPSByZXF1aXJlKCdlczUtZXh0L29iamVjdC9pcy1jYWxsYWJsZScpXG4gICwgY29udGFpbnMgICAgICA9IHJlcXVpcmUoJ2VzNS1leHQvc3RyaW5nLyMvY29udGFpbnMnKVxuXG4gICwgZDtcblxuZCA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGRzY3IsIHZhbHVlLyosIG9wdGlvbnMqLykge1xuXHR2YXIgYywgZSwgdywgb3B0aW9ucywgZGVzYztcblx0aWYgKChhcmd1bWVudHMubGVuZ3RoIDwgMikgfHwgKHR5cGVvZiBkc2NyICE9PSAnc3RyaW5nJykpIHtcblx0XHRvcHRpb25zID0gdmFsdWU7XG5cdFx0dmFsdWUgPSBkc2NyO1xuXHRcdGRzY3IgPSBudWxsO1xuXHR9IGVsc2Uge1xuXHRcdG9wdGlvbnMgPSBhcmd1bWVudHNbMl07XG5cdH1cblx0aWYgKGRzY3IgPT0gbnVsbCkge1xuXHRcdGMgPSB3ID0gdHJ1ZTtcblx0XHRlID0gZmFsc2U7XG5cdH0gZWxzZSB7XG5cdFx0YyA9IGNvbnRhaW5zLmNhbGwoZHNjciwgJ2MnKTtcblx0XHRlID0gY29udGFpbnMuY2FsbChkc2NyLCAnZScpO1xuXHRcdHcgPSBjb250YWlucy5jYWxsKGRzY3IsICd3Jyk7XG5cdH1cblxuXHRkZXNjID0geyB2YWx1ZTogdmFsdWUsIGNvbmZpZ3VyYWJsZTogYywgZW51bWVyYWJsZTogZSwgd3JpdGFibGU6IHcgfTtcblx0cmV0dXJuICFvcHRpb25zID8gZGVzYyA6IGFzc2lnbihub3JtYWxpemVPcHRzKG9wdGlvbnMpLCBkZXNjKTtcbn07XG5cbmQuZ3MgPSBmdW5jdGlvbiAoZHNjciwgZ2V0LCBzZXQvKiwgb3B0aW9ucyovKSB7XG5cdHZhciBjLCBlLCBvcHRpb25zLCBkZXNjO1xuXHRpZiAodHlwZW9mIGRzY3IgIT09ICdzdHJpbmcnKSB7XG5cdFx0b3B0aW9ucyA9IHNldDtcblx0XHRzZXQgPSBnZXQ7XG5cdFx0Z2V0ID0gZHNjcjtcblx0XHRkc2NyID0gbnVsbDtcblx0fSBlbHNlIHtcblx0XHRvcHRpb25zID0gYXJndW1lbnRzWzNdO1xuXHR9XG5cdGlmIChnZXQgPT0gbnVsbCkge1xuXHRcdGdldCA9IHVuZGVmaW5lZDtcblx0fSBlbHNlIGlmICghaXNDYWxsYWJsZShnZXQpKSB7XG5cdFx0b3B0aW9ucyA9IGdldDtcblx0XHRnZXQgPSBzZXQgPSB1bmRlZmluZWQ7XG5cdH0gZWxzZSBpZiAoc2V0ID09IG51bGwpIHtcblx0XHRzZXQgPSB1bmRlZmluZWQ7XG5cdH0gZWxzZSBpZiAoIWlzQ2FsbGFibGUoc2V0KSkge1xuXHRcdG9wdGlvbnMgPSBzZXQ7XG5cdFx0c2V0ID0gdW5kZWZpbmVkO1xuXHR9XG5cdGlmIChkc2NyID09IG51bGwpIHtcblx0XHRjID0gdHJ1ZTtcblx0XHRlID0gZmFsc2U7XG5cdH0gZWxzZSB7XG5cdFx0YyA9IGNvbnRhaW5zLmNhbGwoZHNjciwgJ2MnKTtcblx0XHRlID0gY29udGFpbnMuY2FsbChkc2NyLCAnZScpO1xuXHR9XG5cblx0ZGVzYyA9IHsgZ2V0OiBnZXQsIHNldDogc2V0LCBjb25maWd1cmFibGU6IGMsIGVudW1lcmFibGU6IGUgfTtcblx0cmV0dXJuICFvcHRpb25zID8gZGVzYyA6IGFzc2lnbihub3JtYWxpemVPcHRzKG9wdGlvbnMpLCBkZXNjKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9pcy1pbXBsZW1lbnRlZCcpKClcblx0PyBPYmplY3QuYXNzaWduXG5cdDogcmVxdWlyZSgnLi9zaGltJyk7XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuXHR2YXIgYXNzaWduID0gT2JqZWN0LmFzc2lnbiwgb2JqO1xuXHRpZiAodHlwZW9mIGFzc2lnbiAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuIGZhbHNlO1xuXHRvYmogPSB7IGZvbzogJ3JheicgfTtcblx0YXNzaWduKG9iaiwgeyBiYXI6ICdkd2EnIH0sIHsgdHJ6eTogJ3RyenknIH0pO1xuXHRyZXR1cm4gKG9iai5mb28gKyBvYmouYmFyICsgb2JqLnRyenkpID09PSAncmF6ZHdhdHJ6eSc7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIga2V5cyAgPSByZXF1aXJlKCcuLi9rZXlzJylcbiAgLCB2YWx1ZSA9IHJlcXVpcmUoJy4uL3ZhbGlkLXZhbHVlJylcblxuICAsIG1heCA9IE1hdGgubWF4O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChkZXN0LCBzcmMvKiwg4oCmc3JjbiovKSB7XG5cdHZhciBlcnJvciwgaSwgbCA9IG1heChhcmd1bWVudHMubGVuZ3RoLCAyKSwgYXNzaWduO1xuXHRkZXN0ID0gT2JqZWN0KHZhbHVlKGRlc3QpKTtcblx0YXNzaWduID0gZnVuY3Rpb24gKGtleSkge1xuXHRcdHRyeSB7IGRlc3Rba2V5XSA9IHNyY1trZXldOyB9IGNhdGNoIChlKSB7XG5cdFx0XHRpZiAoIWVycm9yKSBlcnJvciA9IGU7XG5cdFx0fVxuXHR9O1xuXHRmb3IgKGkgPSAxOyBpIDwgbDsgKytpKSB7XG5cdFx0c3JjID0gYXJndW1lbnRzW2ldO1xuXHRcdGtleXMoc3JjKS5mb3JFYWNoKGFzc2lnbik7XG5cdH1cblx0aWYgKGVycm9yICE9PSB1bmRlZmluZWQpIHRocm93IGVycm9yO1xuXHRyZXR1cm4gZGVzdDtcbn07XG4iLCIvLyBEZXByZWNhdGVkXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqID09PSAnZnVuY3Rpb24nOyB9O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vaXMtaW1wbGVtZW50ZWQnKSgpXG5cdD8gT2JqZWN0LmtleXNcblx0OiByZXF1aXJlKCcuL3NoaW0nKTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG5cdHRyeSB7XG5cdFx0T2JqZWN0LmtleXMoJ3ByaW1pdGl2ZScpO1xuXHRcdHJldHVybiB0cnVlO1xuXHR9IGNhdGNoIChlKSB7IHJldHVybiBmYWxzZTsgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGtleXMgPSBPYmplY3Qua2V5cztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob2JqZWN0KSB7XG5cdHJldHVybiBrZXlzKG9iamVjdCA9PSBudWxsID8gb2JqZWN0IDogT2JqZWN0KG9iamVjdCkpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGZvckVhY2ggPSBBcnJheS5wcm90b3R5cGUuZm9yRWFjaCwgY3JlYXRlID0gT2JqZWN0LmNyZWF0ZTtcblxudmFyIHByb2Nlc3MgPSBmdW5jdGlvbiAoc3JjLCBvYmopIHtcblx0dmFyIGtleTtcblx0Zm9yIChrZXkgaW4gc3JjKSBvYmpba2V5XSA9IHNyY1trZXldO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob3B0aW9ucy8qLCDigKZvcHRpb25zKi8pIHtcblx0dmFyIHJlc3VsdCA9IGNyZWF0ZShudWxsKTtcblx0Zm9yRWFjaC5jYWxsKGFyZ3VtZW50cywgZnVuY3Rpb24gKG9wdGlvbnMpIHtcblx0XHRpZiAob3B0aW9ucyA9PSBudWxsKSByZXR1cm47XG5cdFx0cHJvY2VzcyhPYmplY3Qob3B0aW9ucyksIHJlc3VsdCk7XG5cdH0pO1xuXHRyZXR1cm4gcmVzdWx0O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZm4pIHtcblx0aWYgKHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykgdGhyb3cgbmV3IFR5cGVFcnJvcihmbiArIFwiIGlzIG5vdCBhIGZ1bmN0aW9uXCIpO1xuXHRyZXR1cm4gZm47XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuXHRpZiAodmFsdWUgPT0gbnVsbCkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCB1c2UgbnVsbCBvciB1bmRlZmluZWRcIik7XG5cdHJldHVybiB2YWx1ZTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9pcy1pbXBsZW1lbnRlZCcpKClcblx0PyBTdHJpbmcucHJvdG90eXBlLmNvbnRhaW5zXG5cdDogcmVxdWlyZSgnLi9zaGltJyk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBzdHIgPSAncmF6ZHdhdHJ6eSc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuXHRpZiAodHlwZW9mIHN0ci5jb250YWlucyAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuIGZhbHNlO1xuXHRyZXR1cm4gKChzdHIuY29udGFpbnMoJ2R3YScpID09PSB0cnVlKSAmJiAoc3RyLmNvbnRhaW5zKCdmb28nKSA9PT0gZmFsc2UpKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBpbmRleE9mID0gU3RyaW5nLnByb3RvdHlwZS5pbmRleE9mO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChzZWFyY2hTdHJpbmcvKiwgcG9zaXRpb24qLykge1xuXHRyZXR1cm4gaW5kZXhPZi5jYWxsKHRoaXMsIHNlYXJjaFN0cmluZywgYXJndW1lbnRzWzFdKSA+IC0xO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGQgICAgICAgID0gcmVxdWlyZSgnZCcpXG4gICwgY2FsbGFibGUgPSByZXF1aXJlKCdlczUtZXh0L29iamVjdC92YWxpZC1jYWxsYWJsZScpXG5cbiAgLCBhcHBseSA9IEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseSwgY2FsbCA9IEZ1bmN0aW9uLnByb3RvdHlwZS5jYWxsXG4gICwgY3JlYXRlID0gT2JqZWN0LmNyZWF0ZSwgZGVmaW5lUHJvcGVydHkgPSBPYmplY3QuZGVmaW5lUHJvcGVydHlcbiAgLCBkZWZpbmVQcm9wZXJ0aWVzID0gT2JqZWN0LmRlZmluZVByb3BlcnRpZXNcbiAgLCBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHlcbiAgLCBkZXNjcmlwdG9yID0geyBjb25maWd1cmFibGU6IHRydWUsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSB9XG5cbiAgLCBvbiwgb25jZSwgb2ZmLCBlbWl0LCBtZXRob2RzLCBkZXNjcmlwdG9ycywgYmFzZTtcblxub24gPSBmdW5jdGlvbiAodHlwZSwgbGlzdGVuZXIpIHtcblx0dmFyIGRhdGE7XG5cblx0Y2FsbGFibGUobGlzdGVuZXIpO1xuXG5cdGlmICghaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLCAnX19lZV9fJykpIHtcblx0XHRkYXRhID0gZGVzY3JpcHRvci52YWx1ZSA9IGNyZWF0ZShudWxsKTtcblx0XHRkZWZpbmVQcm9wZXJ0eSh0aGlzLCAnX19lZV9fJywgZGVzY3JpcHRvcik7XG5cdFx0ZGVzY3JpcHRvci52YWx1ZSA9IG51bGw7XG5cdH0gZWxzZSB7XG5cdFx0ZGF0YSA9IHRoaXMuX19lZV9fO1xuXHR9XG5cdGlmICghZGF0YVt0eXBlXSkgZGF0YVt0eXBlXSA9IGxpc3RlbmVyO1xuXHRlbHNlIGlmICh0eXBlb2YgZGF0YVt0eXBlXSA9PT0gJ29iamVjdCcpIGRhdGFbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG5cdGVsc2UgZGF0YVt0eXBlXSA9IFtkYXRhW3R5cGVdLCBsaXN0ZW5lcl07XG5cblx0cmV0dXJuIHRoaXM7XG59O1xuXG5vbmNlID0gZnVuY3Rpb24gKHR5cGUsIGxpc3RlbmVyKSB7XG5cdHZhciBvbmNlLCBzZWxmO1xuXG5cdGNhbGxhYmxlKGxpc3RlbmVyKTtcblx0c2VsZiA9IHRoaXM7XG5cdG9uLmNhbGwodGhpcywgdHlwZSwgb25jZSA9IGZ1bmN0aW9uICgpIHtcblx0XHRvZmYuY2FsbChzZWxmLCB0eXBlLCBvbmNlKTtcblx0XHRhcHBseS5jYWxsKGxpc3RlbmVyLCB0aGlzLCBhcmd1bWVudHMpO1xuXHR9KTtcblxuXHRvbmNlLl9fZWVPbmNlTGlzdGVuZXJfXyA9IGxpc3RlbmVyO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbm9mZiA9IGZ1bmN0aW9uICh0eXBlLCBsaXN0ZW5lcikge1xuXHR2YXIgZGF0YSwgbGlzdGVuZXJzLCBjYW5kaWRhdGUsIGk7XG5cblx0Y2FsbGFibGUobGlzdGVuZXIpO1xuXG5cdGlmICghaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLCAnX19lZV9fJykpIHJldHVybiB0aGlzO1xuXHRkYXRhID0gdGhpcy5fX2VlX187XG5cdGlmICghZGF0YVt0eXBlXSkgcmV0dXJuIHRoaXM7XG5cdGxpc3RlbmVycyA9IGRhdGFbdHlwZV07XG5cblx0aWYgKHR5cGVvZiBsaXN0ZW5lcnMgPT09ICdvYmplY3QnKSB7XG5cdFx0Zm9yIChpID0gMDsgKGNhbmRpZGF0ZSA9IGxpc3RlbmVyc1tpXSk7ICsraSkge1xuXHRcdFx0aWYgKChjYW5kaWRhdGUgPT09IGxpc3RlbmVyKSB8fFxuXHRcdFx0XHRcdChjYW5kaWRhdGUuX19lZU9uY2VMaXN0ZW5lcl9fID09PSBsaXN0ZW5lcikpIHtcblx0XHRcdFx0aWYgKGxpc3RlbmVycy5sZW5ndGggPT09IDIpIGRhdGFbdHlwZV0gPSBsaXN0ZW5lcnNbaSA/IDAgOiAxXTtcblx0XHRcdFx0ZWxzZSBsaXN0ZW5lcnMuc3BsaWNlKGksIDEpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRpZiAoKGxpc3RlbmVycyA9PT0gbGlzdGVuZXIpIHx8XG5cdFx0XHRcdChsaXN0ZW5lcnMuX19lZU9uY2VMaXN0ZW5lcl9fID09PSBsaXN0ZW5lcikpIHtcblx0XHRcdGRlbGV0ZSBkYXRhW3R5cGVdO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiB0aGlzO1xufTtcblxuZW1pdCA9IGZ1bmN0aW9uICh0eXBlKSB7XG5cdHZhciBpLCBsLCBsaXN0ZW5lciwgbGlzdGVuZXJzLCBhcmdzO1xuXG5cdGlmICghaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLCAnX19lZV9fJykpIHJldHVybjtcblx0bGlzdGVuZXJzID0gdGhpcy5fX2VlX19bdHlwZV07XG5cdGlmICghbGlzdGVuZXJzKSByZXR1cm47XG5cblx0aWYgKHR5cGVvZiBsaXN0ZW5lcnMgPT09ICdvYmplY3QnKSB7XG5cdFx0bCA9IGFyZ3VtZW50cy5sZW5ndGg7XG5cdFx0YXJncyA9IG5ldyBBcnJheShsIC0gMSk7XG5cdFx0Zm9yIChpID0gMTsgaSA8IGw7ICsraSkgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG5cblx0XHRsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuc2xpY2UoKTtcblx0XHRmb3IgKGkgPSAwOyAobGlzdGVuZXIgPSBsaXN0ZW5lcnNbaV0pOyArK2kpIHtcblx0XHRcdGFwcGx5LmNhbGwobGlzdGVuZXIsIHRoaXMsIGFyZ3MpO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcblx0XHRjYXNlIDE6XG5cdFx0XHRjYWxsLmNhbGwobGlzdGVuZXJzLCB0aGlzKTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgMjpcblx0XHRcdGNhbGwuY2FsbChsaXN0ZW5lcnMsIHRoaXMsIGFyZ3VtZW50c1sxXSk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIDM6XG5cdFx0XHRjYWxsLmNhbGwobGlzdGVuZXJzLCB0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG5cdFx0XHRicmVhaztcblx0XHRkZWZhdWx0OlxuXHRcdFx0bCA9IGFyZ3VtZW50cy5sZW5ndGg7XG5cdFx0XHRhcmdzID0gbmV3IEFycmF5KGwgLSAxKTtcblx0XHRcdGZvciAoaSA9IDE7IGkgPCBsOyArK2kpIHtcblx0XHRcdFx0YXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG5cdFx0XHR9XG5cdFx0XHRhcHBseS5jYWxsKGxpc3RlbmVycywgdGhpcywgYXJncyk7XG5cdFx0fVxuXHR9XG59O1xuXG5tZXRob2RzID0ge1xuXHRvbjogb24sXG5cdG9uY2U6IG9uY2UsXG5cdG9mZjogb2ZmLFxuXHRlbWl0OiBlbWl0XG59O1xuXG5kZXNjcmlwdG9ycyA9IHtcblx0b246IGQob24pLFxuXHRvbmNlOiBkKG9uY2UpLFxuXHRvZmY6IGQob2ZmKSxcblx0ZW1pdDogZChlbWl0KVxufTtcblxuYmFzZSA9IGRlZmluZVByb3BlcnRpZXMoe30sIGRlc2NyaXB0b3JzKTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gZnVuY3Rpb24gKG8pIHtcblx0cmV0dXJuIChvID09IG51bGwpID8gY3JlYXRlKGJhc2UpIDogZGVmaW5lUHJvcGVydGllcyhPYmplY3QobyksIGRlc2NyaXB0b3JzKTtcbn07XG5leHBvcnRzLm1ldGhvZHMgPSBtZXRob2RzO1xuIl19
