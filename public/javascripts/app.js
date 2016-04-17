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
    var enemyBullet = this.game.add.sprite(data.x, data.y, 'bullet12');
    enemyBullet.bulletId = data.bulletId;
    enemyBullet.playerId = data.playerId;
    enemyBullet.alive = true;
    enemyBullet.visible = true;
    enemyBullet.damage = data.damage;
    enemyBullet.rotation = data.pointerAngle;
    enemyBullet.height = data.height;
    enemyBullet.width = data.width;
    enemyBullet.enableBody = true;
    enemyBullet.physicsBodyType = Phaser.Physics.ARCADE;
    this.game.physics.enable(enemyBullet, Phaser.Physics.ARCADE);
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

    var removeBullet = _.find(this.weapons[this.currentWeapon].children, {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvYXBwLmpzIiwiYXNzZXRzL2pzL2NvcmUvQ3JlYXRlLmpzIiwiYXNzZXRzL2pzL2NvcmUvSW5pdC5qcyIsImFzc2V0cy9qcy9jb3JlL1ByZWxvYWQuanMiLCJhc3NldHMvanMvY29yZS9VcGRhdGUuanMiLCJhc3NldHMvanMvZ2FtZS5qcyIsImFzc2V0cy9qcy9saWIvQ29sbGlzaW9uSGFuZGxlci5qcyIsImFzc2V0cy9qcy9saWIvRXZlbnRIYW5kbGVyLmpzIiwiYXNzZXRzL2pzL2xpYi9GaXJlUm9ja2V0LmpzIiwiYXNzZXRzL2pzL2xpYi9GaXJlU2hvdGd1blNoZWxsLmpzIiwiYXNzZXRzL2pzL2xpYi9GaXJlU3RhbmRhcmRCdWxsZXQuanMiLCJhc3NldHMvanMvbGliL0dhbWVDb25zdHMuanMiLCJhc3NldHMvanMvbGliL0dldFF1ZXJ5U3RyaW5nLmpzIiwiYXNzZXRzL2pzL2xpYi9HdWlkLmpzIiwiYXNzZXRzL2pzL2xpYi9JbnB1dEhlbHBlcnMuanMiLCJhc3NldHMvanMvbGliL1BsYXllckFuZ2xlSGFuZGxlci5qcyIsImFzc2V0cy9qcy9saWIvUGxheWVyQnlJZC5qcyIsImFzc2V0cy9qcy9saWIvUGxheWVyRmFjZUhhbmRsZXIuanMiLCJhc3NldHMvanMvbGliL1BsYXllckp1bXBIYW5kbGVyLmpzIiwiYXNzZXRzL2pzL2xpYi9QbGF5ZXJNb3ZlbWVudEhhbmRsZXIuanMiLCJhc3NldHMvanMvbGliL1JlbW90ZUJ1bGxldC5qcyIsImFzc2V0cy9qcy9saWIvUmVtb3RlUGxheWVyLmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvU2V0RXZlbnRIYW5kbGVycy5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL29uQnVsbGV0RmlyZWQuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vbkJ1bGxldFJlbW92ZWQuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vbk1vdmVQbGF5ZXIuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vblBsYXllckRhbWFnZWQuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vblBsYXllckhlYWx0aFVwZGF0ZS5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL29uUGxheWVyUmVzcGF3bi5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL29uUmVtb3ZlUGxheWVyLmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvb25Tb2NrZXRDb25uZWN0ZWQuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vblNvY2tldERpc2Nvbm5lY3QuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vblVwZGF0ZVBsYXllcnMuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvQUs0Ny5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9BVUcuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvQmFycmV0dC5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9EZXNlcnRFYWdsZS5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9HNDMuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvTTRBMS5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9NNTAwLmpzIiwiYXNzZXRzL2pzL2xpYi9XZWFwb25zL1A5MC5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9SUEcuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvU2tvcnBpb24uanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvaW5kZXguanMiLCJhc3NldHMvanMvbWFwcy9IaWdoUnVsZUp1bmdsZS5qcyIsIm5vZGVfbW9kdWxlcy9kL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2VzNS1leHQvb2JqZWN0L2Fzc2lnbi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L29iamVjdC9hc3NpZ24vaXMtaW1wbGVtZW50ZWQuanMiLCJub2RlX21vZHVsZXMvZXM1LWV4dC9vYmplY3QvYXNzaWduL3NoaW0uanMiLCJub2RlX21vZHVsZXMvZXM1LWV4dC9vYmplY3QvaXMtY2FsbGFibGUuanMiLCJub2RlX21vZHVsZXMvZXM1LWV4dC9vYmplY3Qva2V5cy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L29iamVjdC9rZXlzL2lzLWltcGxlbWVudGVkLmpzIiwibm9kZV9tb2R1bGVzL2VzNS1leHQvb2JqZWN0L2tleXMvc2hpbS5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L29iamVjdC9ub3JtYWxpemUtb3B0aW9ucy5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L29iamVjdC92YWxpZC1jYWxsYWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L29iamVjdC92YWxpZC12YWx1ZS5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L3N0cmluZy8jL2NvbnRhaW5zL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2VzNS1leHQvc3RyaW5nLyMvY29udGFpbnMvaXMtaW1wbGVtZW50ZWQuanMiLCJub2RlX21vZHVsZXMvZXM1LWV4dC9zdHJpbmcvIy9jb250YWlucy9zaGltLmpzIiwibm9kZV9tb2R1bGVzL2V2ZW50LWVtaXR0ZXIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLE9BQU8sT0FBUCxHQUFpQjtBQUNiLGlCQUFhLEtBQWI7QUFDQSxXQUFPLEtBQVA7QUFDQSxpQkFBYSxLQUFiO0FBQ0EsaUJBQWEsS0FBYjtBQUNBLG1CQUFlLGtCQUFmO0FBQ0EsdUJBQW1CLEtBQW5CO0FBQ0EsYUFBUyxJQUFUO0FBQ0Esa0JBQWMsR0FBZDtBQUNBLGtCQUFjLElBQWQ7QUFDQSxhQUFTLElBQVQ7QUFDQSxxQkFBaUIsSUFBakI7QUFDQSxnQkFBWSxPQUFaO0FBQ0EsZ0JBQVksUUFBWjtBQUNBLGdCQUFZLFFBQVo7QUFDQSxnQkFBWSxTQUFaO0NBZko7OztBQW1CQSxRQUFRLFFBQVI7Ozs7Ozs7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dGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidG9hc3RyLm9wdGlvbnMgPSB7XG4gICAgY2xvc2VCdXR0b246IGZhbHNlLFxuICAgIGRlYnVnOiBmYWxzZSxcbiAgICBuZXdlc3RPblRvcDogZmFsc2UsXG4gICAgcHJvZ3Jlc3NCYXI6IGZhbHNlLFxuICAgIHBvc2l0aW9uQ2xhc3M6ICd0b2FzdC10b3AtY2VudGVyJyxcbiAgICBwcmV2ZW50RHVwbGljYXRlczogZmFsc2UsXG4gICAgb25jbGljazogbnVsbCxcbiAgICBzaG93RHVyYXRpb246IDMwMCxcbiAgICBoaWRlRHVyYXRpb246IDEwMDAsXG4gICAgdGltZU91dDogMzAwMCxcbiAgICBleHRlbmRlZFRpbWVPdXQ6IDEwMDAsXG4gICAgc2hvd0Vhc2luZzogJ3N3aW5nJyxcbiAgICBoaWRlRWFzaW5nOiAnbGluZWFyJyxcbiAgICBzaG93TWV0aG9kOiAnZmFkZUluJyxcbiAgICBoaWRlTWV0aG9kOiAnZmFkZU91dCdcbn1cblxuLy8gcmVxdWlyZSgnLi91aScpXG5yZXF1aXJlKCcuL2dhbWUnKVxuIiwiaW1wb3J0IEdhbWVDb25zdHMgZnJvbSAnLi4vbGliL0dhbWVDb25zdHMnXG5pbXBvcnQgU2V0RXZlbnRIYW5kbGVycyBmcm9tICcuLi9saWIvU29ja2V0RXZlbnRzL1NldEV2ZW50SGFuZGxlcnMnXG5pbXBvcnQgRXZlbnRIYW5kbGVyIGZyb20gJy4uL2xpYi9FdmVudEhhbmRsZXInXG5pbXBvcnQgSGlnaFJ1bGVKdW5nbGUgZnJvbSAnLi4vbWFwcy9IaWdoUnVsZUp1bmdsZSdcbmltcG9ydCBXZWFwb25zIGZyb20gJy4uL2xpYi9XZWFwb25zJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBDcmVhdGUoKSB7XG4gICAgdGhpcy5zb2NrZXQgPSBpby5jb25uZWN0KClcbiAgICB0aGlzLmVuZW1pZXMgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKClcblxuICAgIHRoaXMudm9sdW1lID0gR2FtZUNvbnN0cy5TVEFSVElOR19WT0xVTUVcbiAgICB0aGlzLmVuZW15QnVsbGV0cyA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKVxuXG4gICAgLy8gIFdlJ3JlIGdvaW5nIHRvIGJlIHVzaW5nIHBoeXNpY3MsIHNvIGVuYWJsZSB0aGUgQXJjYWRlIFBoeXNpY3Mgc3lzdGVtXG4gICAgdGhpcy5waHlzaWNzLnN0YXJ0U3lzdGVtKFBoYXNlci5QaHlzaWNzLkFSQ0FERSlcblxuICAgIHRoaXMud29ybGQuc2V0Qm91bmRzKDAsIDAsIEdhbWVDb25zdHMuV09STERfV0lEVEgsIEdhbWVDb25zdHMuV09STERfSEVJR0hUKVxuXG4gICAgLy8gU2NhbGUgZ2FtZSBvbiB3aW5kb3cgcmVzaXplXG4gICAgdGhpcy5nYW1lLnNjYWxlLnNjYWxlTW9kZSA9IFBoYXNlci5TY2FsZU1hbmFnZXIuUkVTSVpFXG4gICAgdGhpcy5nYW1lLnNjYWxlLnNldFNob3dBbGwoKVxuICAgIHRoaXMuZ2FtZS5zY2FsZS5yZWZyZXNoKClcblxuXG4gICAgLyoqXG4gICAgICogTWFwXG4gICAgICovXG4gICAgdGhpcy5tYXBJbnN0YW5jZSA9IG5ldyBIaWdoUnVsZUp1bmdsZSh0aGlzKVxuICAgIHRoaXMubWFwSW5zdGFuY2UuY3JlYXRlKClcblxuXG4gICAgLyoqXG4gICAgICogQnVsbGV0IFNldHRpbmdzXG4gICAgICovXG4gICAgdGhpcy5idWxsZXRzID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpXG4gICAgdGhpcy5idWxsZXRzLmVuYWJsZUJvZHkgPSB0cnVlXG4gICAgdGhpcy5waHlzaWNzQm9keVR5cGUgPSBQaGFzZXIuUGh5c2ljcy5BUkNBREVcbiAgICB0aGlzLmJ1bGxldHMuY3JlYXRlTXVsdGlwbGUoNTAsICdidWxsZXQxMicpXG4gICAgdGhpcy5idWxsZXRzLnNldEFsbCgnY2hlY2tXb3JsZEJvdW5kcycsIHRydWUpXG4gICAgdGhpcy5idWxsZXRzLnNldEFsbCgnb3V0T2ZCb3VuZHNLaWxsJywgdHJ1ZSlcblxuXG4gICAgLyoqXG4gICAgICogUGxheWVyIFNldHRpbmdzXG4gICAgICovXG4gICAgbGV0IHNwYXduUG9pbnQgPSB0aGlzLm1hcEluc3RhbmNlLmdldFJhbmRvbVNwYXduUG9pbnQoKVxuICAgIHRoaXMucGxheWVyID0gdGhpcy5hZGQuc3ByaXRlKHNwYXduUG9pbnQueCwgc3Bhd25Qb2ludC55LCAnY29tbWFuZG8nKVxuICAgIHRoaXMucGxheWVyLnNjYWxlLnNldFRvKEdhbWVDb25zdHMuUExBWUVSX1NDQUxFKVxuICAgIHRoaXMucGxheWVyLmFuY2hvci5zZXRUbyhHYW1lQ29uc3RzLlBMQVlFUl9BTkNIT1IpXG5cbiAgICAvLyAgV2UgbmVlZCB0byBlbmFibGUgcGh5c2ljcyBvbiB0aGUgcGxheWVyXG4gICAgdGhpcy5waHlzaWNzLmFyY2FkZS5lbmFibGUodGhpcy5wbGF5ZXIpXG5cbiAgICAvLyBFbmFibGUgcGh5c2ljcyBvbiB0aGUgcGxheWVyXG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuZW5hYmxlKHRoaXMucGxheWVyLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpXG5cbiAgICAvLyBNYWtlIHBsYXllciBjb2xsaWRlIHdpdGggd29ybGQgYm91bmRhcmllcyBzbyBoZSBkb2Vzbid0IGxlYXZlIHRoZSBzdGFnZVxuICAgIHRoaXMucGxheWVyLmJvZHkuY29sbGlkZVdvcmxkQm91bmRzID0gdHJ1ZVxuXG4gICAgLy8gU2V0IHBsYXllciBtaW5pbXVtIGFuZCBtYXhpbXVtIG1vdmVtZW50IHNwZWVkXG4gICAgdGhpcy5wbGF5ZXIuYm9keS5tYXhWZWxvY2l0eS5zZXRUbyhHYW1lQ29uc3RzLk1BWF9TUEVFRCwgR2FtZUNvbnN0cy5NQVhfU1BFRUQgKiAxMCkgLy8geCwgeVxuXG4gICAgLy8gQWRkIGRyYWcgdG8gdGhlIHBsYXllciB0aGF0IHNsb3dzIHRoZW0gZG93biB3aGVuIHRoZXkgYXJlIG5vdCBhY2NlbGVyYXRpbmdcbiAgICB0aGlzLnBsYXllci5ib2R5LmRyYWcuc2V0VG8oR2FtZUNvbnN0cy5EUkFHLCAwKSAvLyB4LCB5XG4gICAgdGhpcy5wbGF5ZXIuYm9keS5zZXRTaXplKDIzMCwgMjkwLCAtMTAsIDApXG4gICAgdGhpcy5wbGF5ZXIubWV0YSA9IHtcbiAgICAgICAgaGVhbHRoOiAxMDBcbiAgICB9XG5cbiAgICAvLyBTaW5jZSB3ZSdyZSBqdW1waW5nIHdlIG5lZWQgZ3Jhdml0eVxuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5ncmF2aXR5LnkgPSBHYW1lQ29uc3RzLkdSQVZJVFlcblxuICAgIC8vIEZsYWcgdG8gdHJhY2sgaWYgdGhlIGp1bXAgYnV0dG9uIGlzIHByZXNzZWRcbiAgICB0aGlzLmp1bXBpbmcgPSBmYWxzZVxuXG4gICAgLy8gIE91ciB0d28gYW5pbWF0aW9ucywgd2Fsa2luZyBsZWZ0IGFuZCByaWdodC5cbiAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLmFkZCgnbGVmdCcsIEdhbWVDb25zdHMuQU5JTUFUSU9OX0xFRlQsIEdhbWVDb25zdHMuQU5JTUFUSU9OX0ZSQU1FUkFURSwgdHJ1ZSlcbiAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLmFkZCgncmlnaHQnLCBHYW1lQ29uc3RzLkFOSU1BVElPTl9SSUdIVCwgR2FtZUNvbnN0cy5BTklNQVRJT05fRlJBTUVSQVRFLCB0cnVlKVxuXG4gICAgdGhpcy5wbGF5ZXIubWV0YSA9IHtcbiAgICAgICAgaGVhbHRoOiAxMDAsXG4gICAgICAgIHByaW1hcnlXZWFwb246IG5ldyBXZWFwb25zLkFLNDcodGhpcyksXG4gICAgICAgIHNlY29uZGFyeVdlYXBvbjogbmV3IFdlYXBvbnMuRGVzZXJ0RWFnbGUodGhpcyksXG4gICAgICAgIHNlbGVjdGVkUHJpbWFyeVdlYXBvbklkOiAnQUs0NycsXG4gICAgICAgIHNlbGVjdGVkU2Vjb25kYXJ5V2VhcG9uSWQ6ICdEZXNlcnRFYWdsZSdcbiAgICB9XG5cbiAgICB0aGlzLnBsYXllci5tZXRhLnByaW1hcnlXZWFwb24uaWQgPSAnQUs0NydcbiAgICB0aGlzLnBsYXllci5tZXRhLnNlY29uZGFyeVdlYXBvbi5pZCA9ICdEZXNlcnRFYWdsZSdcblxuICAgIHRoaXMubGVmdEFybUdyb3VwID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpXG4gICAgdGhpcy5yaWdodEFybUdyb3VwID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpXG4gICAgdGhpcy5oZWFkR3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKClcbiAgICB0aGlzLnRvcnNvR3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKClcblxuICAgIC8vIFRvcnNvXG4gICAgdGhpcy50b3Jzb1Nwcml0ZSA9IHRoaXMuZ2FtZS5hZGQuc3ByaXRlKC0zNywgLTEwNSwgJ3RvcnNvJylcbiAgICB0aGlzLnRvcnNvU3ByaXRlLnNjYWxlLnNldFRvKDEuOClcbiAgICB0aGlzLnRvcnNvR3JvdXAuYWRkKHRoaXMudG9yc29TcHJpdGUpXG5cbiAgICAvLyBIZWFkXG4gICAgdGhpcy5oZWFkU3ByaXRlID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUoMCwgLTE0OCwgJ2hlYWQnKVxuICAgIHRoaXMuaGVhZFNwcml0ZS5zY2FsZS5zZXRUbygxLjgpXG4gICAgdGhpcy5oZWFkR3JvdXAuYWRkKHRoaXMuaGVhZFNwcml0ZSlcblxuICAgIC8vIExlZnQgYXJtXG4gICAgdGhpcy5sZWZ0QXJtU3ByaXRlID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUoMCwgMCwgJ2xlZnQtYXJtJylcbiAgICB0aGlzLmxlZnRBcm1TcHJpdGUuYW5jaG9yLnNldFRvKC4yLCAuMilcbiAgICB0aGlzLmxlZnRBcm1TcHJpdGUuc2NhbGUuc2V0VG8oMS42KVxuICAgIHRoaXMubGVmdEFybVNwcml0ZS5yb3RhdGlvbiA9IDgwLjFcbiAgICB0aGlzLmxlZnRBcm1Hcm91cC5hZGQodGhpcy5sZWZ0QXJtU3ByaXRlKVxuXG4gICAgLy8gR3VuXG4gICAgdGhpcy5hazQ3U3ByaXRlID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUoMTIsIDE5LCAnQUs0NycpXG4gICAgdGhpcy5hazQ3U3ByaXRlLnNjYWxlLnNldFRvKDEuMylcbiAgICB0aGlzLmFrNDdTcHJpdGUucm90YXRpb24gPSA4MC4xNVxuXG4gICAgLy8gUmlnaHQgYXJtXG4gICAgdGhpcy5yaWdodEFybUdyb3VwLmFkZCh0aGlzLmFrNDdTcHJpdGUpXG4gICAgdGhpcy5yaWdodEFybVNwcml0ZSA9IHRoaXMuZ2FtZS5hZGQuc3ByaXRlKDAsIDAsICdyaWdodC1hcm0nKVxuICAgIHRoaXMucmlnaHRBcm1TcHJpdGUuYW5jaG9yLnNldFRvKC4yLCAuMjQpXG4gICAgdGhpcy5yaWdodEFybVNwcml0ZS5zY2FsZS5zZXRUbygxLjcpXG4gICAgdGhpcy5yaWdodEFybVNwcml0ZS5yb3RhdGlvbiA9IDgwLjFcbiAgICB0aGlzLnJpZ2h0QXJtR3JvdXAuYWRkKHRoaXMucmlnaHRBcm1TcHJpdGUpXG5cbiAgICB0aGlzLnBsYXllci5hZGRDaGlsZCh0aGlzLmxlZnRBcm1Hcm91cClcbiAgICB0aGlzLmxlZnRBcm1Hcm91cC5waXZvdC54ID0gMFxuICAgIHRoaXMubGVmdEFybUdyb3VwLnBpdm90LnkgPSAwXG4gICAgdGhpcy5sZWZ0QXJtR3JvdXAueCA9IDQ1XG4gICAgdGhpcy5sZWZ0QXJtR3JvdXAueSA9IC03MFxuXG4gICAgdGhpcy5wbGF5ZXIuYWRkQ2hpbGQodGhpcy50b3Jzb0dyb3VwKVxuICAgIHRoaXMucGxheWVyLmFkZENoaWxkKHRoaXMuaGVhZEdyb3VwKVxuXG4gICAgdGhpcy5wbGF5ZXIuYWRkQ2hpbGQodGhpcy5yaWdodEFybUdyb3VwKVxuICAgIHRoaXMucmlnaHRBcm1Hcm91cC5waXZvdC54ID0gMFxuICAgIHRoaXMucmlnaHRBcm1Hcm91cC5waXZvdC55ID0gMFxuICAgIHRoaXMucmlnaHRBcm1Hcm91cC54ID0gLTI1XG4gICAgdGhpcy5yaWdodEFybUdyb3VwLnkgPSAtNjVcblxuXG4gICAgLyoqXG4gICAgICogV2VhcG9uc1xuICAgICAqL1xuICAgIHRoaXMuY3VycmVudFdlYXBvbiA9ICdwcmltYXJ5V2VhcG9uJ1xuXG5cbiAgICAvKipcbiAgICAgKiBUZXh0XG4gICAgICovXG4gICAgbGV0IHRleHRTdHlsZXMgPSB7IGZvbnRTaXplOiAnMTRweCcsIGZpbGw6ICcjMDAwJyB9XG5cbiAgICBFdmVudEhhbmRsZXIuZW1pdCgnc2NvcmUgdXBkYXRlJywgJycpXG4gICAgRXZlbnRIYW5kbGVyLmVtaXQoJ2hlYWx0aCB1cGRhdGUnLCAnJylcbiAgICBFdmVudEhhbmRsZXIub24oJ3ZvbHVtZSB1cGRhdGUnLCAoZGF0YSkgPT4ge1xuICAgICAgICB0aGlzLnZvbHVtZSA9IGRhdGEudm9sdW1lXG4gICAgfSlcblxuICAgIEV2ZW50SGFuZGxlci5vbigncHJpbWFyeSB3ZWFwb24gdXBkYXRlJywgKHdlYXBvbikgPT4ge1xuICAgICAgICB0aGlzLnBsYXllci5tZXRhLnNlbGVjdGVkUHJpbWFyeVdlYXBvbklkID0gd2VhcG9uLmlkXG4gICAgfSlcblxuICAgIEV2ZW50SGFuZGxlci5vbignc2Vjb25kYXJ5IHdlYXBvbiB1cGRhdGUnLCAod2VhcG9uKSA9PiB7XG4gICAgICAgIHRoaXMucGxheWVyLm1ldGEuc2VsZWN0ZWRTZWNvbmRhcnlXZWFwb25JZCA9IHdlYXBvbi5pZFxuICAgIH0pXG5cbiAgICB0aGlzLnBvc2l0aW9uVGV4dCA9IHRoaXMuYWRkLnRleHQoMjUsIDI1LCBgJHt0aGlzLmdhbWUuaW5wdXQubW91c2VQb2ludGVyLnh9LCR7dGhpcy5nYW1lLmlucHV0Lm1vdXNlUG9pbnRlci55fWAsIHRleHRTdHlsZXMpXG4gICAgdGhpcy5wb3NpdGlvblRleHQuZml4ZWRUb0NhbWVyYSA9IHRydWVcblxuXG4gICAgLyoqXG4gICAgICogQ2FtZXJhIFNldHRpbmdzXG4gICAgICovXG4gICAgdGhpcy5jYW1lcmEuZm9sbG93KHRoaXMucGxheWVyKVxuXG5cbiAgICAvKipcbiAgICAgKiBSZXNpemluZyBFdmVudHNcbiAgICAgKi9cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xuICAgICAgICB0aGlzLmdhbWUuc2NhbGUucmVmcmVzaCgpXG4gICAgICAgIHRoaXMuZ2FtZS5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHRcbiAgICAgICAgdGhpcy5nYW1lLndpZHRoID0gd2luZG93LmlubmVyV2lkdGhcbiAgICB9KVxuXG5cbiAgICAvKipcbiAgICAgKiBLZXlib2FyZCBFdmVudHNcbiAgICAgKi9cbiAgICAvLyBPcGVuIHNldHRpbmdzIG1vZGFsXG4gICAgdGhpcy5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLlRBQikub25Eb3duLmFkZChmdW5jdGlvbigpIHtcbiAgICAgICAgRXZlbnRIYW5kbGVyLmVtaXQoJ3NldHRpbmdzIG9wZW4nKVxuICAgIH0pXG5cbiAgICAvLyBTd2l0Y2ggd2VhcG9uc1xuICAgIHRoaXMuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5RKS5vbkRvd24uYWRkKCgpID0+IHtcbiAgICAgICAgdGhpcy5jdXJyZW50V2VhcG9uID0gdGhpcy5jdXJyZW50V2VhcG9uID09PSAncHJpbWFyeVdlYXBvbidcbiAgICAgICAgICAgID8gJ3NlY29uZGFyeVdlYXBvbidcbiAgICAgICAgICAgIDogJ3ByaW1hcnlXZWFwb24nXG4gICAgICAgIHRoaXMuYWs0N1Nwcml0ZS5sb2FkVGV4dHVyZSh0aGlzLnBsYXllci5tZXRhW3RoaXMuY3VycmVudFdlYXBvbl0uaWQpXG4gICAgfSlcblxuXG4gICAgLyoqXG4gICAgICogU3RhcnQgbGlzdGVuaW5nIGZvciBldmVudHNcbiAgICAgKi9cbiAgICBTZXRFdmVudEhhbmRsZXJzLmNhbGwodGhpcylcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEluaXQoKSB7XG4gICAgdGhpcy5nYW1lLnJlbmRlcmVyLnJlbmRlclNlc3Npb24ucm91bmRQaXhlbHMgPSB0cnVlXG4gICAgdGhpcy5nYW1lLnN0YWdlLmRpc2FibGVWaXNpYmlsaXR5Q2hhbmdlID0gdHJ1ZVxufVxuIiwiaW1wb3J0IEdhbWVDb25zdHMgZnJvbSAnLi4vbGliL0dhbWVDb25zdHMnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFByZWxvYWQoKSB7XG4gICAgdGhpcy5sb2FkLmltYWdlKCdtYXAtYmcnLCAnL2ltYWdlcy9oaWdoLXJ1bGUtZGVzZXJ0LnBuZycpXG4gICAgdGhpcy5sb2FkLmltYWdlKCdncm91bmQnLCAnL2ltYWdlcy9wbGF0Zm9ybS5wbmcnKVxuICAgIHRoaXMubG9hZC5pbWFnZSgnYnVsbGV0MTInLCAnL2ltYWdlcy9idWxsZXQucG5nJylcblxuICAgIHRoaXMubG9hZC5zcHJpdGVzaGVldCgnZHVkZScsICcvaW1hZ2VzL2R1ZGUucG5nJywgMzIsIDQ4KVxuICAgIHRoaXMubG9hZC5zcHJpdGVzaGVldCgnY29tbWFuZG8nLCAnL2ltYWdlcy9jb21tYW5kby5wbmcnLCAzMDAsIDMxNSlcbiAgICB0aGlzLmxvYWQuc3ByaXRlc2hlZXQoJ2VuZW15JywgJy9pbWFnZXMvZHVkZS5wbmcnLCAzMiwgNDgpXG5cbiAgICAvLyBXZWFwb25zXG4gICAgR2FtZUNvbnN0cy5QUklNQVJZX1dFQVBPTlMuZm9yRWFjaCgod2VhcG9uKSA9PiB7XG4gICAgICAgIHRoaXMubG9hZC5pbWFnZSh3ZWFwb24uaWQsIHdlYXBvbi5pbWFnZSlcbiAgICB9KVxuXG4gICAgR2FtZUNvbnN0cy5TRUNPTkRBUllfV0VBUE9OUy5mb3JFYWNoKCh3ZWFwb24pID0+IHtcbiAgICAgICAgdGhpcy5sb2FkLmltYWdlKHdlYXBvbi5pZCwgd2VhcG9uLmltYWdlKVxuICAgIH0pXG5cbiAgICB0aGlzLmxvYWQuaW1hZ2UoJ3JpZ2h0LWFybScsICcvaW1hZ2VzL2JvZHkvcmlnaHQtYXJtLnBuZycpXG4gICAgdGhpcy5sb2FkLmltYWdlKCdsZWZ0LWFybScsICcvaW1hZ2VzL2JvZHkvbGVmdC1hcm0ucG5nJylcbiAgICB0aGlzLmxvYWQuaW1hZ2UoJ2hlYWQnLCAnL2ltYWdlcy9ib2R5L2hlYWQucG5nJylcbiAgICB0aGlzLmxvYWQuaW1hZ2UoJ3RvcnNvJywgJy9pbWFnZXMvYm9keS90b3Jzby5wbmcnKVxuXG4gICAgdGhpcy5sb2FkLmF1ZGlvKCdBSzQ3LXNvdW5kJywgJy9hdWRpby9BSzQ3Lm9nZycpXG4gICAgdGhpcy5sb2FkLmF1ZGlvKCdNNTAwLXNvdW5kJywgJy9hdWRpby9NNTAwLm9nZycpXG4gICAgdGhpcy5sb2FkLmF1ZGlvKCdTa29ycGlvbi1zb3VuZCcsICcvYXVkaW8vU2tvcnBpb24ub2dnJylcbiAgICB0aGlzLmxvYWQuYXVkaW8oJ0FVRy1zb3VuZCcsICcvYXVkaW8vQVVHLm9nZycpXG4gICAgdGhpcy5sb2FkLmF1ZGlvKCdHNDMtc291bmQnLCAnL2F1ZGlvL0c0My5vZ2cnKVxuICAgIHRoaXMubG9hZC5hdWRpbygnUDkwLXNvdW5kJywgJy9hdWRpby9QOTAub2dnJylcbiAgICB0aGlzLmxvYWQuYXVkaW8oJ000QTEtc291bmQnLCAnL2F1ZGlvL000QTEub2dnJylcbiAgICB0aGlzLmxvYWQuYXVkaW8oJ0JhcnJldE05MC1zb3VuZCcsICcvYXVkaW8vQmFycmV0TTkwLm9nZycpXG5cbiAgICB0aGlzLmxvYWQuYXVkaW8oJ0Rlc2VydEVhZ2xlLXNvdW5kJywgJy9hdWRpby9EZXNlcnRFYWdsZS5vZ2cnKVxuICAgIHRoaXMubG9hZC5hdWRpbygnUlBHLXNvdW5kJywgJy9hdWRpby9SUEcub2dnJylcbn1cbiIsImltcG9ydCBDb2xsaXNpb25IYW5kbGVyIGZyb20gJy4uL2xpYi9Db2xsaXNpb25IYW5kbGVyJ1xuaW1wb3J0IFBsYXllck1vdmVtZW50SGFuZGxlciBmcm9tICcuLi9saWIvUGxheWVyTW92ZW1lbnRIYW5kbGVyJ1xuaW1wb3J0IFBsYXllckp1bXBIYW5kbGVyIGZyb20gJy4uL2xpYi9QbGF5ZXJKdW1wSGFuZGxlcidcbmltcG9ydCBQbGF5ZXJBbmdsZUhhbmRsZXIgZnJvbSAnLi4vbGliL1BsYXllckFuZ2xlSGFuZGxlcidcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gVXBkYXRlKCkge1xuICAgIENvbGxpc2lvbkhhbmRsZXIuY2FsbCh0aGlzKVxuICAgIFBsYXllck1vdmVtZW50SGFuZGxlci5jYWxsKHRoaXMpXG4gICAgUGxheWVySnVtcEhhbmRsZXIuY2FsbCh0aGlzKVxuICAgIFBsYXllckFuZ2xlSGFuZGxlci5jYWxsKHRoaXMpXG5cbiAgICBpZiAodGhpcy5nYW1lLmlucHV0LmFjdGl2ZVBvaW50ZXIuaXNEb3duKVxuICAgIHtcbiAgICAgICAgdGhpcy5wbGF5ZXIubWV0YVt0aGlzLmN1cnJlbnRXZWFwb25dLmZpcmUoKVxuICAgIH1cblxuICAgIHRoaXMucG9zaXRpb25UZXh0LnRleHQgPSBgJHt0aGlzLmdhbWUuaW5wdXQud29ybGRYfSwgJHt0aGlzLmdhbWUuaW5wdXQud29ybGRZfWBcblxuICAgIC8vIENoZWNrIGZvciBvdXQgb2YgYm91bmRzIGtpbGxcbiAgICBpZiAodGhpcy5wbGF5ZXIuYm9keS5vbkZsb29yKCkpIHtcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgncGxheWVyIGRhbWFnZWQnLCB7XG4gICAgICAgICAgICByb29tSWQ6IHRoaXMucm9vbUlkLFxuICAgICAgICAgICAgZGFtYWdlOiAxMDAwLFxuICAgICAgICAgICAgZGFtYWdlZFBsYXllcklkOiAnLyMnICsgdGhpcy5zb2NrZXQuaWQsXG4gICAgICAgICAgICBhdHRhY2tpbmdQbGF5ZXJJZDogbnVsbFxuICAgICAgICB9KVxuICAgIH1cblxuICAgIHRoaXMuc29ja2V0LmVtaXQoJ21vdmUgcGxheWVyJywge1xuICAgICAgICByb29tSWQ6IHRoaXMucm9vbUlkLFxuICAgICAgICB4OiB0aGlzLnBsYXllci54LFxuICAgICAgICB5OiB0aGlzLnBsYXllci55XG4gICAgfSlcbn1cbiIsImltcG9ydCBpbml0IGZyb20gJy4vY29yZS9Jbml0J1xuaW1wb3J0IHByZWxvYWQgZnJvbSAnLi9jb3JlL1ByZWxvYWQnXG5pbXBvcnQgdXBkYXRlIGZyb20gJy4vY29yZS9VcGRhdGUnXG5pbXBvcnQgY3JlYXRlIGZyb20gJy4vY29yZS9DcmVhdGUnXG5cbmNvbnN0IGdhbWVXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXG5jb25zdCBnYW1lSGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0XG5sZXQgZ2FtZSA9IG5ldyBQaGFzZXIuR2FtZShnYW1lV2lkdGgsIGdhbWVIZWlnaHQsIFBoYXNlci5BVVRPLCAncmFuZ2VyLXN0ZXZlLWdhbWUnKVxuXG5nYW1lLnN0YXRlLmFkZCgnR2FtZScsIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY3VycmVudFdlYXBvbiA9IDBcbiAgICB0aGlzLmVuZW1pZXMgPSBbXVxuICAgIHRoaXMuZ3JvdW5kXG4gICAgdGhpcy5wbGF0Zm9ybXNcbiAgICB0aGlzLnBsYXllclxuICAgIHRoaXMuc29ja2V0XG5cbiAgICB0aGlzLmdhbWUgPSBnYW1lXG4gICAgdGhpcy5pbml0ID0gaW5pdFxuICAgIHRoaXMucHJlbG9hZCA9IHByZWxvYWRcbiAgICB0aGlzLmNyZWF0ZSA9IGNyZWF0ZVxuICAgIHRoaXMudXBkYXRlID0gdXBkYXRlXG59LCB0cnVlKVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQ29sbGlzaW9uSGFuZGxlcigpIHtcbiAgICAvLyBDb2xsaWRlIHRoaXMgcGxheWVyIHdpdGggdGhlIG1hcFxuICAgIHRoaXMucGh5c2ljcy5hcmNhZGUuY29sbGlkZSh0aGlzLnBsYXllciwgdGhpcy5wbGF0Zm9ybXMsIG51bGwsIG51bGwsIHRoaXMpXG5cbiAgICAvLyBEaWQgdGhpcyBwbGF5ZXIncyBidWxsZXRzIGhpdCBhbnkgcGxhdGZvcm1zXG4gICAgdGhpcy5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMucGxhdGZvcm1zLCB0aGlzLmJ1bGxldHMsIChwbGF0Zm9ybSwgYnVsbGV0KSA9PiB7XG4gICAgICAgIGJ1bGxldC5raWxsKClcbiAgICB9LCBudWxsLCB0aGlzKVxuXG4gICAgLy8gRGlkIGVuZW15IGJ1bGxldHMgaGl0IGFueSBwbGF0Zm9ybXNcbiAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5wbGF0Zm9ybXMsIHRoaXMuZW5lbXlCdWxsZXRzLCAocGxhdGZvcm0sIGJ1bGxldCkgPT4ge1xuICAgICAgICBidWxsZXQua2lsbCgpXG4gICAgfSwgbnVsbCwgdGhpcylcbiAgICBcbiAgICAvLyBEaWQgdGhpcyBwbGF5ZXIgZ2V0IGhpdCBieSBhbnkgZW5lbXkgYnVsbGV0c1xuICAgIHRoaXMucGh5c2ljcy5hcmNhZGUuY29sbGlkZSh0aGlzLnBsYXllciwgdGhpcy5lbmVteUJ1bGxldHMsIG51bGwsIChwbGF5ZXIsIGJ1bGxldCkgPT4ge1xuICAgICAgICBidWxsZXQua2lsbCgpXG5cbiAgICAgICAgY29uc29sZS5sb2coJ1lvdSB3ZXJlIGhpdCBieScsIGJ1bGxldC5idWxsZXRJZClcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnYnVsbGV0IHJlbW92ZWQnLCB7XG4gICAgICAgICAgICByb29tSWQ6IHRoaXMucm9vbUlkLFxuICAgICAgICAgICAgYnVsbGV0SWQ6IGJ1bGxldC5idWxsZXRJZFxuICAgICAgICB9KVxuXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ3BsYXllciBkYW1hZ2VkJywge1xuICAgICAgICAgICAgcm9vbUlkOiB0aGlzLnJvb21JZCxcbiAgICAgICAgICAgIGRhbWFnZTogYnVsbGV0LmRhbWFnZSxcbiAgICAgICAgICAgIGRhbWFnZWRQbGF5ZXJJZDogJy8jJyArIHRoaXMuc29ja2V0LmlkLFxuICAgICAgICAgICAgYXR0YWNraW5nUGxheWVySWQ6IGJ1bGxldC5wbGF5ZXJJZFxuICAgICAgICB9KVxuXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIH0sIHRoaXMpXG59XG4iLCJpbXBvcnQgZW1pdHRlciBmcm9tICdldmVudC1lbWl0dGVyJ1xuXG5sZXQgRXZlbnRIYW5kbGVyID0gZW1pdHRlcih7fSlcblxuZXhwb3J0IGRlZmF1bHQgRXZlbnRIYW5kbGVyXG4iLCJpbXBvcnQgR3VpZCBmcm9tICcuL0d1aWQnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEZpcmVSb2NrZXQoKSB7XG4gICAgbGV0IHggPSB0aGlzLnJvb3RTY29wZS5wbGF5ZXIueFxuICAgIGxldCB5ID0gdGhpcy5yb290U2NvcGUucGxheWVyLnlcblxuICAgIGxldCBidWxsZXQgPSB0aGlzLnJvb3RTY29wZS5idWxsZXRzLmdldEZpcnN0RGVhZCgpXG4gICAgYnVsbGV0LmJ1bGxldElkID0gR3VpZCgpXG4gICAgYnVsbGV0LmhlaWdodCA9IHRoaXMuYnVsbGV0SGVpZ2h0XG4gICAgYnVsbGV0LndpZHRoID0gdGhpcy5idWxsZXRXaWR0aFxuICAgIGJ1bGxldC5ib2R5LmdyYXZpdHkueSA9IC0xODAwXG4gICAgYnVsbGV0LnJlc2V0KHgsIHkpXG4gICAgbGV0IHBvaW50ZXJBbmdsZSA9IHRoaXMucm9vdFNjb3BlLmdhbWUucGh5c2ljcy5hcmNhZGUubW92ZVRvUG9pbnRlcihidWxsZXQsIHRoaXMuYnVsbGV0U3BlZWQpXG4gICAgYnVsbGV0LnJvdGF0aW9uID0gcG9pbnRlckFuZ2xlXG5cbiAgICB0aGlzLmZ4LnZvbHVtZSA9IC4zICogdGhpcy5yb290U2NvcGUudm9sdW1lXG4gICAgdGhpcy5meC5wbGF5KClcblxuICAgIHRoaXMucm9vdFNjb3BlLnNvY2tldC5lbWl0KCdidWxsZXQgZmlyZWQnLCB7XG4gICAgICAgIHJvb21JZDogdGhpcy5yb290U2NvcGUucm9vbUlkLFxuICAgICAgICBidWxsZXRJZDogdGhpcy5idWxsZXRJZCxcbiAgICAgICAgcGxheWVySWQ6ICcvIycgKyB0aGlzLnJvb3RTY29wZS5zb2NrZXQuaWQsXG4gICAgICAgIHgsXG4gICAgICAgIHksXG4gICAgICAgIHBvaW50ZXJBbmdsZSxcbiAgICAgICAgYnVsbGV0U3BlZWQ6IHRoaXMuYnVsbGV0U3BlZWQsXG4gICAgICAgIGhlaWdodDogdGhpcy5idWxsZXRIZWlnaHQsXG4gICAgICAgIHdpZHRoOiB0aGlzLmJ1bGxldFdpZHRoLFxuICAgICAgICBkYW1hZ2U6IHRoaXMuZGFtYWdlXG4gICAgfSlcbn1cbiIsImltcG9ydCBHdWlkIGZyb20gJy4vR3VpZCdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gRmlyZVNob3RndW5TaGVsbCgpIHtcbiAgICBsZXQgeCA9IHRoaXMucm9vdFNjb3BlLnBsYXllci54XG4gICAgbGV0IHkgPSB0aGlzLnJvb3RTY29wZS5wbGF5ZXIueVxuXG4gICAgbGV0IGJ1bGxldCA9IHRoaXMucm9vdFNjb3BlLmJ1bGxldHMuZ2V0Rmlyc3REZWFkKClcbiAgICBidWxsZXQuYnVsbGV0SWQgPSBHdWlkKClcbiAgICBidWxsZXQuaGVpZ2h0ID0gdGhpcy5idWxsZXRIZWlnaHRcbiAgICBidWxsZXQud2lkdGggPSB0aGlzLmJ1bGxldFdpZHRoXG4gICAgYnVsbGV0LmJvZHkuZ3Jhdml0eS55ID0gLTE4MDBcbiAgICBidWxsZXQucmVzZXQoeCwgeSlcbiAgICBsZXQgcG9pbnRlckFuZ2xlID0gdGhpcy5yb290U2NvcGUuZ2FtZS5waHlzaWNzLmFyY2FkZS5tb3ZlVG9Qb2ludGVyKGJ1bGxldCwgdGhpcy5idWxsZXRTcGVlZClcbiAgICBidWxsZXQucm90YXRpb24gPSBwb2ludGVyQW5nbGVcblxuICAgIHRoaXMuZngudm9sdW1lID0gLjUgKiB0aGlzLnJvb3RTY29wZS52b2x1bWVcbiAgICB0aGlzLmZ4LnBsYXkoKVxuXG4gICAgdGhpcy5yb290U2NvcGUuc29ja2V0LmVtaXQoJ2J1bGxldCBmaXJlZCcsIHtcbiAgICAgICAgcm9vbUlkOiB0aGlzLnJvb3RTY29wZS5yb29tSWQsXG4gICAgICAgIGJ1bGxldElkOiB0aGlzLmJ1bGxldElkLFxuICAgICAgICBwbGF5ZXJJZDogJy8jJyArIHRoaXMucm9vdFNjb3BlLnNvY2tldC5pZCxcbiAgICAgICAgeCxcbiAgICAgICAgeSxcbiAgICAgICAgcG9pbnRlckFuZ2xlLFxuICAgICAgICBidWxsZXRTcGVlZDogdGhpcy5idWxsZXRTcGVlZCxcbiAgICAgICAgaGVpZ2h0OiB0aGlzLmJ1bGxldEhlaWdodCxcbiAgICAgICAgd2lkdGg6IHRoaXMuYnVsbGV0V2lkdGgsXG4gICAgICAgIGRhbWFnZTogdGhpcy5kYW1hZ2VcbiAgICB9KVxufVxuIiwiaW1wb3J0IEd1aWQgZnJvbSAnLi9HdWlkJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBGaXJlU3RhbmRhcmRCdWxsZXQoKSB7XG4gICAgbGV0IHggPSB0aGlzLnJvb3RTY29wZS5wbGF5ZXIueFxuICAgIGxldCB5ID0gdGhpcy5yb290U2NvcGUucGxheWVyLnlcblxuICAgIGxldCBidWxsZXQgPSB0aGlzLnJvb3RTY29wZS5idWxsZXRzLmdldEZpcnN0RGVhZCgpXG4gICAgYnVsbGV0LmJ1bGxldElkID0gR3VpZCgpXG4gICAgYnVsbGV0LmhlaWdodCA9IHRoaXMuYnVsbGV0SGVpZ2h0XG4gICAgYnVsbGV0LndpZHRoID0gdGhpcy5idWxsZXRXaWR0aFxuICAgIGJ1bGxldC5ib2R5LmdyYXZpdHkueSA9IC0xODAwXG4gICAgYnVsbGV0LnJlc2V0KHgsIHkpXG4gICAgbGV0IHBvaW50ZXJBbmdsZSA9IHRoaXMucm9vdFNjb3BlLmdhbWUucGh5c2ljcy5hcmNhZGUubW92ZVRvUG9pbnRlcihidWxsZXQsIHRoaXMuYnVsbGV0U3BlZWQpXG4gICAgYnVsbGV0LnJvdGF0aW9uID0gcG9pbnRlckFuZ2xlXG5cbiAgICB0aGlzLmZ4LnZvbHVtZSA9IC4zICogdGhpcy5yb290U2NvcGUudm9sdW1lXG4gICAgdGhpcy5meC5wbGF5KClcblxuICAgIHRoaXMucm9vdFNjb3BlLnNvY2tldC5lbWl0KCdidWxsZXQgZmlyZWQnLCB7XG4gICAgICAgIHJvb21JZDogdGhpcy5yb290U2NvcGUucm9vbUlkLFxuICAgICAgICBidWxsZXRJZDogdGhpcy5idWxsZXRJZCxcbiAgICAgICAgcGxheWVySWQ6ICcvIycgKyB0aGlzLnJvb3RTY29wZS5zb2NrZXQuaWQsXG4gICAgICAgIHgsXG4gICAgICAgIHksXG4gICAgICAgIHBvaW50ZXJBbmdsZSxcbiAgICAgICAgYnVsbGV0U3BlZWQ6IHRoaXMuYnVsbGV0U3BlZWQsXG4gICAgICAgIGhlaWdodDogdGhpcy5idWxsZXRIZWlnaHQsXG4gICAgICAgIHdpZHRoOiB0aGlzLmJ1bGxldFdpZHRoLFxuICAgICAgICBkYW1hZ2U6IHRoaXMuZGFtYWdlXG4gICAgfSlcbn1cbiIsImNvbnN0IEdhbWVDb25zdHMgPSB7XG4gICAgV09STERfV0lEVEg6IDgwMDAsXG4gICAgV09STERfSEVJR0hUOiAzOTY2LFxuICAgIFNUQVJUSU5HX1ZPTFVNRTogLjUsXG5cbiAgICAvLyBQaHlzaWNzXG4gICAgTUFYX1NQRUVEOiA2MDAsXG4gICAgQUNDRUxFUkFUSU9OOiAxOTYwLFxuICAgIERSQUc6IDE1MDAsXG4gICAgR1JBVklUWTogMTkwMCxcbiAgICBKVU1QX1NQRUVEOiAtODUwLFxuICAgIEpVTVBfSkVUX1NQRUVEOiAtMjQwMCxcbiAgICBKVU1QX0pFVF9TUEVFRF9SRUdFTkVSQVRJT046IC0yNDAwLFxuXG4gICAgLy8gUGxheWVyIE1vZGVsXG4gICAgQU5JTUFUSU9OX0xFRlQ6IFswLCAxLCAyLCAzLCA0LCA1XSxcbiAgICBBTklNQVRJT05fUklHSFQ6IFs4LCA5LCAxMCwgMTEsIDEyLCAxM10sXG4gICAgQU5JTUFUSU9OX0ZSQU1FUkFURTogMTAsXG4gICAgUExBWUVSX1NDQUxFOiAuMjcsXG4gICAgUExBWUVSX0FOQ0hPUjogLjUsXG5cbiAgICAvLyBXZWFwb25zXG4gICAgUFJJTUFSWV9XRUFQT05TOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnQUs0NycsXG4gICAgICAgICAgICBuYW1lOiAnQUstNDcnLFxuICAgICAgICAgICAgaW1hZ2U6ICcvaW1hZ2VzL2d1bnMvU3ByX0FLNDcucG5nJyxcbiAgICAgICAgICAgIG1pblNjb3JlOiAwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnTTUwMCcsXG4gICAgICAgICAgICBuYW1lOiAnTTUwMCcsXG4gICAgICAgICAgICBpbWFnZTogJy9pbWFnZXMvZ3Vucy9TcHJfTTUwMC5wbmcnLFxuICAgICAgICAgICAgbWluU2NvcmU6IDBcbiAgICAgICAgICAgIC8vIG1pblNjb3JlOiAxMFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ1Nrb3JwaW9uJyxcbiAgICAgICAgICAgIG5hbWU6ICdTa29ycGlvbicsXG4gICAgICAgICAgICBpbWFnZTogJy9pbWFnZXMvZ3Vucy9TcHJfU2tvcnBpb24ucG5nJyxcbiAgICAgICAgICAgIG1pblNjb3JlOiAwXG4gICAgICAgICAgICAvLyBtaW5TY29yZTogMjBcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICdBdWcnLFxuICAgICAgICAgICAgbmFtZTogJ0F1ZycsXG4gICAgICAgICAgICBpbWFnZTogJy9pbWFnZXMvZ3Vucy9TcHJfQXVnLnBuZycsXG4gICAgICAgICAgICBtaW5TY29yZTogMFxuICAgICAgICAgICAgLy8gbWluU2NvcmU6IDMwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnRzQzJyxcbiAgICAgICAgICAgIG5hbWU6ICdHNDMnLFxuICAgICAgICAgICAgaW1hZ2U6ICcvaW1hZ2VzL2d1bnMvU3ByX2c0My5wbmcnLFxuICAgICAgICAgICAgbWluU2NvcmU6IDBcbiAgICAgICAgICAgIC8vIG1pblNjb3JlOiA0MFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ1A5MCcsXG4gICAgICAgICAgICBuYW1lOiAnUDkwJyxcbiAgICAgICAgICAgIGltYWdlOiAnL2ltYWdlcy9ndW5zL1Nwcl9wOTAucG5nJyxcbiAgICAgICAgICAgIG1pblNjb3JlOiAwXG4gICAgICAgICAgICAvLyBtaW5TY29yZTogMzBcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICdNNEExJyxcbiAgICAgICAgICAgIG5hbWU6ICdNNEExJyxcbiAgICAgICAgICAgIGltYWdlOiAnL2ltYWdlcy9ndW5zL1Nwcl9NNEExLnBuZycsXG4gICAgICAgICAgICBtaW5TY29yZTogMFxuICAgICAgICAgICAgLy8gbWluU2NvcmU6IDEwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnQmFycmV0dCcsXG4gICAgICAgICAgICBuYW1lOiAnQmFycmV0dCcsXG4gICAgICAgICAgICBpbWFnZTogJy9pbWFnZXMvZ3Vucy9TcHJfQmFycmV0dC5wbmcnLFxuICAgICAgICAgICAgbWluU2NvcmU6IDBcbiAgICAgICAgICAgIC8vIG1pblNjb3JlOiA3MFxuICAgICAgICB9XG4gICAgXSxcblxuICAgIFNFQ09OREFSWV9XRUFQT05TOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnRGVzZXJ0RWFnbGUnLFxuICAgICAgICAgICAgbmFtZTogJ0Rlc2VydCBFYWdsZScsXG4gICAgICAgICAgICBpbWFnZTogJy9pbWFnZXMvZ3Vucy9TcHJfRGVzZXJ0RWFnbGUucG5nJyxcbiAgICAgICAgICAgIG1pblNjb3JlOiAwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnUlBHJyxcbiAgICAgICAgICAgIG5hbWU6ICdSUEcnLFxuICAgICAgICAgICAgaW1hZ2U6ICcvaW1hZ2VzL2d1bnMvU3ByX1JQRy5wbmcnLFxuICAgICAgICAgICAgbWluU2NvcmU6IDIwXG4gICAgICAgIH1cbiAgICBdXG59XG5cbmV4cG9ydCBkZWZhdWx0IEdhbWVDb25zdHNcbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEdldFF1ZXJ5U3RyaW5nKGZpZWxkLCB1cmwpIHtcbiAgICB2YXIgaHJlZiA9IHVybCA/IHVybCA6IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuICAgIHZhciByZWcgPSBuZXcgUmVnRXhwKCAnWz8mXScgKyBmaWVsZCArICc9KFteJiNdKiknLCAnaScgKTtcbiAgICB2YXIgc3RyaW5nID0gcmVnLmV4ZWMoaHJlZik7XG4gICAgcmV0dXJuIHN0cmluZyA/IHN0cmluZ1sxXSA6IG51bGw7XG59XG4iLCJmdW5jdGlvbiBTNCgpIHtcbiAgICByZXR1cm4gKCgoMStNYXRoLnJhbmRvbSgpKSoweDEwMDAwKXwwKS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpXG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEd1aWQoKSB7XG4gICAgcmV0dXJuIChTNCgpK1M0KCkrXCItXCIrUzQoKStcIi1cIitTNCgpK1wiLVwiK1M0KCkrXCItXCIrUzQoKStTNCgpK1M0KCkpXG59XG4iLCIvLyBUaGlzIGZ1bmN0aW9uIHNob3VsZCByZXR1cm4gdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgYWN0aXZhdGVzIHRoZSBcImdvIGxlZnRcIiBjb250cm9sXG4vLyBJbiB0aGlzIGNhc2UsIGVpdGhlciBob2xkaW5nIHRoZSByaWdodCBhcnJvdyBvciB0YXBwaW5nIG9yIGNsaWNraW5nIG9uIHRoZSBsZWZ0XG4vLyBzaWRlIG9mIHRoZSBzY3JlZW4uXG5leHBvcnQgZnVuY3Rpb24gbGVmdElucHV0SXNBY3RpdmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5wdXQua2V5Ym9hcmQuaXNEb3duKFBoYXNlci5LZXlib2FyZC5BKVxufVxuXG4vLyBUaGlzIGZ1bmN0aW9uIHNob3VsZCByZXR1cm4gdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgYWN0aXZhdGVzIHRoZSBcImdvIHJpZ2h0XCIgY29udHJvbFxuLy8gSW4gdGhpcyBjYXNlLCBlaXRoZXIgaG9sZGluZyB0aGUgcmlnaHQgYXJyb3cgb3IgdGFwcGluZyBvciBjbGlja2luZyBvbiB0aGUgcmlnaHRcbi8vIHNpZGUgb2YgdGhlIHNjcmVlbi5cbmV4cG9ydCBmdW5jdGlvbiByaWdodElucHV0SXNBY3RpdmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5wdXQua2V5Ym9hcmQuaXNEb3duKFBoYXNlci5LZXlib2FyZC5EKVxufVxuXG4vLyBUaGlzIGZ1bmN0aW9uIHNob3VsZCByZXR1cm4gdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgYWN0aXZhdGVzIHRoZSBcImp1bXBcIiBjb250cm9sXG4vLyBJbiB0aGlzIGNhc2UsIGVpdGhlciBob2xkaW5nIHRoZSB1cCBhcnJvdyBvciB0YXBwaW5nIG9yIGNsaWNraW5nIG9uIHRoZSBjZW50ZXJcbi8vIHBhcnQgb2YgdGhlIHNjcmVlbi5cbmV4cG9ydCBmdW5jdGlvbiB1cElucHV0SXNBY3RpdmUoZHVyYXRpb24pIHtcbiAgICByZXR1cm4gdGhpcy5pbnB1dC5rZXlib2FyZC5kb3duRHVyYXRpb24oUGhhc2VyLktleWJvYXJkLlcsIGR1cmF0aW9uKVxufVxuXG4vLyBUaGlzIGZ1bmN0aW9uIHJldHVybnMgdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgcmVsZWFzZXMgdGhlIFwianVtcFwiIGNvbnRyb2xcbmV4cG9ydCBmdW5jdGlvbiB1cElucHV0UmVsZWFzZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5wdXQua2V5Ym9hcmQudXBEdXJhdGlvbihQaGFzZXIuS2V5Ym9hcmQuVylcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFBsYXllckFuZ2xlSGFuZGxlcigpIHtcbiAgICBsZXQgYW5nbGVJbkRlZ3JlZXMgPSAodGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmFuZ2xlVG9Qb2ludGVyKHRoaXMucGxheWVyKSAqIDE4MCAvIE1hdGguUEkpICsgOTA7XG5cbiAgICBpZiAodGhpcy5wbGF5ZXIubWV0YS5mYWNpbmcgPT09ICdyaWdodCcpIHtcbiAgICAgICAgdGhpcy5yaWdodEFybUdyb3VwLmFuZ2xlID0gYW5nbGVJbkRlZ3JlZXMgKyA1XG5cbiAgICAgICAgLy8gVXNlciBpcyBhaW1pbmcgdXBcbiAgICAgICAgaWYgKGFuZ2xlSW5EZWdyZWVzIDw9IDgxICYmIGFuZ2xlSW5EZWdyZWVzID49IDcxKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyAtPSAxMFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzIDwgNzEgJiYgYW5nbGVJbkRlZ3JlZXMgPj0gNjEpIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzIC09IDIwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPCA2MSAmJiBhbmdsZUluRGVncmVlcyA+PSA1MSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgLT0gMzBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA8IDUxICYmIGFuZ2xlSW5EZWdyZWVzID49IDQxKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyAtPSA0MFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzIDwgNDEgJiYgYW5nbGVJbkRlZ3JlZXMgPj0gMzEpIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzIC09IDUwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPCAzMSAmJiBhbmdsZUluRGVncmVlcyA+PSAyMSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgLT0gNjBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA8IDIxICYmIGFuZ2xlSW5EZWdyZWVzID49IDExKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyAtPSA3MFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzIDwgMTEgJiYgYW5nbGVJbkRlZ3JlZXMgPj0gMCkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgLT0gODBcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFVzZXIgaXMgYWltaW5nIGRvd25cbiAgICAgICAgaWYgKGFuZ2xlSW5EZWdyZWVzID49IDk5ICYmIGFuZ2xlSW5EZWdyZWVzIDw9IDEwOSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgKz0gMTBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA+IDEwOSAmJiBhbmdsZUluRGVncmVlcyA8PSAxMTkpIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzICs9IDIwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPiAxMTkgJiYgYW5nbGVJbkRlZ3JlZXMgPD0gMTI5KSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyArPSAzMFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzID4gMTI5ICYmIGFuZ2xlSW5EZWdyZWVzIDw9IDEzOSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgKz0gNDBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA+IDEzOSAmJiBhbmdsZUluRGVncmVlcyA8PSAxNDkpIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzICs9IDUwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPiAxNDkgJiYgYW5nbGVJbkRlZ3JlZXMgPD0gMTU5KSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyArPSA2MFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzID4gMTU5ICYmIGFuZ2xlSW5EZWdyZWVzIDw9IDE2OSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgKz0gNzBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA+IDE2OSAmJiBhbmdsZUluRGVncmVlcyA8PSAxODApIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzICs9IDgwXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5wbGF5ZXIubWV0YS5mYWNpbmcgPT09ICdsZWZ0Jykge1xuICAgICAgICB0aGlzLnJpZ2h0QXJtR3JvdXAuYW5nbGUgPSBhbmdsZUluRGVncmVlcyAtIDdcblxuICAgICAgICAvLyBVc2VyIGlzIGFpbWluZyB1cFxuICAgICAgICBpZiAoYW5nbGVJbkRlZ3JlZXMgPj0gLTgxICYmIGFuZ2xlSW5EZWdyZWVzIDw9IC03MSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgKz0gMjBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA+IC03MSAmJiBhbmdsZUluRGVncmVlcyA8PSAtNjEpIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzICs9IDMwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPiAtNjEgJiYgYW5nbGVJbkRlZ3JlZXMgPD0gLTUxKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyArPSA0MFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzID4gLTUxICYmIGFuZ2xlSW5EZWdyZWVzIDw9IC00MSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgKz0gNTBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA+IC00MSAmJiBhbmdsZUluRGVncmVlcyA8PSAtMzEpIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzICs9IDYwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPiAtMzEgJiYgYW5nbGVJbkRlZ3JlZXMgPD0gLTIxKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyArPSA3MFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzID4gLTIxICYmIGFuZ2xlSW5EZWdyZWVzIDw9IC0xMSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgKz0gODBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA+IC0xMSAmJiBhbmdsZUluRGVncmVlcyA8PSAwKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyArPSA5MFxuICAgICAgICB9XG5cbiAgICAgICAgLy8gVXNlciBpcyBhaW1pbmcgZG93blxuICAgICAgICBpZiAoYW5nbGVJbkRlZ3JlZXMgPD0gMjcwICYmIGFuZ2xlSW5EZWdyZWVzID49IDI2MCkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgLT0gMTBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA8IDI2MCAmJiBhbmdsZUluRGVncmVlcyA+PSAyNTApIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzIC09IDIwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPCAyNTAgJiYgYW5nbGVJbkRlZ3JlZXMgPj0gMjQwKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyAtPSAzMFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzIDwgMjQwICYmIGFuZ2xlSW5EZWdyZWVzID49IDIzMCkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgLT0gNDBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA8IDIzMCAmJiBhbmdsZUluRGVncmVlcyA+PSAyMjApIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzIC09IDUwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPCAyMjAgJiYgYW5nbGVJbkRlZ3JlZXMgPj0gMjEwKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyAtPSA2MFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzIDwgMjEwICYmIGFuZ2xlSW5EZWdyZWVzID49IDIwMCkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgLT0gNzBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA8IDIwMCAmJiBhbmdsZUluRGVncmVlcyA+PSAxOTApIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzIC09IDgwXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmxlZnRBcm1Hcm91cC5hbmdsZSA9IGFuZ2xlSW5EZWdyZWVzXG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBQbGF5ZXJCeUlkKGlkKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmVuZW1pZXMuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHRoaXMuZW5lbWllcy5jaGlsZHJlbltpXS5pZCA9PT0gaWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmVuZW1pZXMuY2hpbGRyZW5baV1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZVxufVxuIiwiZXhwb3J0IGZ1bmN0aW9uIHBsYXllckZhY2VMZWZ0KCkge1xuICAgIGlmICh0aGlzLnBsYXllci5tZXRhLmZhY2luZyAhPT0gJ2xlZnQnKSB7XG4gICAgICAgIHRoaXMucGxheWVyLm1ldGEuZmFjaW5nID0gJ2xlZnQnXG5cbiAgICAgICAgdGhpcy5yaWdodEFybUdyb3VwLnggPSAyNVxuICAgICAgICB0aGlzLnJpZ2h0QXJtR3JvdXAueSA9IC02NVxuXG4gICAgICAgIHRoaXMubGVmdEFybUdyb3VwLnggPSAtNDBcbiAgICAgICAgdGhpcy5sZWZ0QXJtR3JvdXAueSA9IC03MFxuXG4gICAgICAgIHRoaXMuaGVhZFNwcml0ZS5zY2FsZS54ICo9IC0xXG4gICAgICAgIHRoaXMuaGVhZFNwcml0ZS54ID0gMTJcblxuICAgICAgICB0aGlzLnRvcnNvU3ByaXRlLnNjYWxlLnggKj0gLTFcbiAgICAgICAgdGhpcy50b3Jzb1Nwcml0ZS54ID0gNDlcblxuICAgICAgICB0aGlzLmxlZnRBcm1TcHJpdGUuc2NhbGUueSAqPSAtMVxuICAgICAgICB0aGlzLmxlZnRBcm1TcHJpdGUueSA9IDVcblxuICAgICAgICB0aGlzLnJpZ2h0QXJtU3ByaXRlLnNjYWxlLnkgKj0gLTFcbiAgICAgICAgdGhpcy5yaWdodEFybVNwcml0ZS55ID0gMTBcblxuICAgICAgICB0aGlzLmFrNDdTcHJpdGUuc2NhbGUueSAqPSAtMVxuICAgICAgICB0aGlzLmFrNDdTcHJpdGUueSA9IDMwXG4gICAgICAgIHRoaXMuYWs0N1Nwcml0ZS54ID0gLTdcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwbGF5ZXJGYWNlUmlnaHQoKSB7XG4gICAgaWYgKHRoaXMucGxheWVyLm1ldGEuZmFjaW5nICE9PSAncmlnaHQnKSB7XG4gICAgICAgIHRoaXMucGxheWVyLm1ldGEuZmFjaW5nID0gJ3JpZ2h0J1xuXG4gICAgICAgIHRoaXMucmlnaHRBcm1Hcm91cC54ID0gLTI1XG4gICAgICAgIHRoaXMucmlnaHRBcm1Hcm91cC55ID0gLTY1XG5cbiAgICAgICAgdGhpcy5sZWZ0QXJtR3JvdXAueCA9IDQ1XG4gICAgICAgIHRoaXMubGVmdEFybUdyb3VwLnkgPSAtNzBcblxuICAgICAgICB0aGlzLmhlYWRTcHJpdGUuc2NhbGUueCAqPSAtMVxuICAgICAgICB0aGlzLmhlYWRTcHJpdGUueCA9IDBcblxuICAgICAgICB0aGlzLnRvcnNvU3ByaXRlLnNjYWxlLnggKj0gLTFcbiAgICAgICAgdGhpcy50b3Jzb1Nwcml0ZS54ID0gLTM3XG5cbiAgICAgICAgdGhpcy5sZWZ0QXJtU3ByaXRlLnNjYWxlLnkgKj0gLTFcbiAgICAgICAgdGhpcy5sZWZ0QXJtU3ByaXRlLnkgPSAwXG5cbiAgICAgICAgdGhpcy5yaWdodEFybVNwcml0ZS5zY2FsZS55ICo9IC0xXG4gICAgICAgIHRoaXMucmlnaHRBcm1TcHJpdGUueSA9IDBcblxuICAgICAgICB0aGlzLmFrNDdTcHJpdGUuc2NhbGUueSAqPSAtMVxuICAgICAgICB0aGlzLmFrNDdTcHJpdGUueSA9IDE5XG4gICAgICAgIHRoaXMuYWs0N1Nwcml0ZS54ID0gM1xuICAgIH1cbn1cbiIsImltcG9ydCBHYW1lQ29uc3RzIGZyb20gJy4vR2FtZUNvbnN0cydcbmltcG9ydCBFdmVudEhhbmRsZXIgZnJvbSAnLi9FdmVudEhhbmRsZXInXG5pbXBvcnQgeyB1cElucHV0SXNBY3RpdmUsIHVwSW5wdXRSZWxlYXNlZCB9IGZyb20gJy4vSW5wdXRIZWxwZXJzJ1xuXG5sZXQganVtcEpldENvdW50ZXIgPSAwXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFBsYXllckp1bXBIYW5kbGVyKCkge1xuICAgIC8vIFNldCBhIHZhcmlhYmxlIHRoYXQgaXMgdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgaXMgdG91Y2hpbmcgdGhlIGdyb3VuZFxuICAgIGxldCBvblRoZUdyb3VuZCA9IHRoaXMucGxheWVyLmJvZHkudG91Y2hpbmcuZG93blxuXG4gICAgLy8gSWYgdGhlIHBsYXllciBpcyB0b3VjaGluZyB0aGUgZ3JvdW5kLCBsZXQgaGltIGhhdmUgMiBqdW1wc1xuICAgIGlmIChvblRoZUdyb3VuZCkge1xuICAgICAgICB0aGlzLmp1bXBzID0gMlxuICAgICAgICB0aGlzLmp1bXBpbmcgPSBmYWxzZVxuICAgIH1cblxuICAgIC8vIEp1bXAhXG4gICAgaWYgKHRoaXMuanVtcHMgPT09IDIgJiYgdXBJbnB1dElzQWN0aXZlLmNhbGwodGhpcywgNSkgJiYgb25UaGVHcm91bmQpIHtcbiAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS52ZWxvY2l0eS55ID0gR2FtZUNvbnN0cy5KVU1QX1NQRUVEXG4gICAgICAgIHRoaXMuanVtcGluZyA9IHRydWVcbiAgICB9IGVsc2UgaWYgKHVwSW5wdXRJc0FjdGl2ZS5jYWxsKHRoaXMsIDUpKSB7XG4gICAgICAgIHRoaXMuanVtcHMgPSAxXG4gICAgfVxuXG4gICAgLy8gSnVtcCBKZXQhXG4gICAgaWYgKHRoaXMuanVtcHMgPT09IDEgJiYgdGhpcy5pbnB1dC5rZXlib2FyZC5pc0Rvd24oUGhhc2VyLktleWJvYXJkLlcpICYmIGp1bXBKZXRDb3VudGVyID4gLTEzMDAwMCkge1xuICAgICAgICB0aGlzLnBsYXllci5ib2R5LmFjY2VsZXJhdGlvbi55ID0gR2FtZUNvbnN0cy5KVU1QX0pFVF9TUEVFRFxuICAgICAgICBqdW1wSmV0Q291bnRlciArPSBHYW1lQ29uc3RzLkpVTVBfSkVUX1NQRUVEXG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5hY2NlbGVyYXRpb24ueSA9IDBcblxuICAgICAgICBpZiAoanVtcEpldENvdW50ZXIgPCAwKSB7XG4gICAgICAgICAgICBqdW1wSmV0Q291bnRlciAtPSBHYW1lQ29uc3RzLkpVTVBfSkVUX1NQRUVEX1JFR0VORVJBVElPTlxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAganVtcEpldENvdW50ZXIgPSAwXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBFdmVudEhhbmRsZXIuZW1pdCgncGxheWVyIGp1bXAgamV0IHVwZGF0ZScsIHsganVtcEpldENvdW50ZXIgfSlcblxuICAgIC8vIFJlZHVjZSB0aGUgbnVtYmVyIG9mIGF2YWlsYWJsZSBqdW1wcyBpZiB0aGUganVtcCBpbnB1dCBpcyByZWxlYXNlZFxuICAgIGlmICh0aGlzLmp1bXBpbmcgJiYgdXBJbnB1dFJlbGVhc2VkLmNhbGwodGhpcykpIHtcbiAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5hY2NlbGVyYXRpb24ueCA9IDBcbiAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5hY2NlbGVyYXRpb24ueSA9IDBcblxuICAgICAgICBpZiAodGhpcy5qdW1wcyAhPT0gMSkge1xuICAgICAgICAgICAgdGhpcy5qdW1wcy0tXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmp1bXBpbmcgPSBmYWxzZVxuICAgIH1cbn1cbiIsImltcG9ydCBHYW1lQ29uc3RzIGZyb20gJy4vR2FtZUNvbnN0cydcbmltcG9ydCB7IHBsYXllckZhY2VMZWZ0LCBwbGF5ZXJGYWNlUmlnaHQgfSBmcm9tICcuL1BsYXllckZhY2VIYW5kbGVyJ1xuaW1wb3J0IHsgbGVmdElucHV0SXNBY3RpdmUsIHJpZ2h0SW5wdXRJc0FjdGl2ZSB9IGZyb20gJy4vSW5wdXRIZWxwZXJzJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBQbGF5ZXJNb3ZlbWVudEhhbmRsZXIoKSB7XG4gICAgaWYgKGxlZnRJbnB1dElzQWN0aXZlLmNhbGwodGhpcykpIHtcbiAgICAgICAgLy8gSWYgdGhlIExFRlQga2V5IGlzIGRvd24sIHNldCB0aGUgcGxheWVyIHZlbG9jaXR5IHRvIG1vdmUgbGVmdFxuICAgICAgICB0aGlzLnBsYXllci5ib2R5LmFjY2VsZXJhdGlvbi54ID0gLUdhbWVDb25zdHMuQUNDRUxFUkFUSU9OXG4gICAgICAgIHRoaXMucGxheWVyLmFuaW1hdGlvbnMucGxheSgnbGVmdCcpXG5cbiAgICAgICAgLy8gTGVmdCBmYWNpbmcgaGVhZCBuZWVkcyB0byBiZSBzZXQgb25seSBvbmNlXG4gICAgICAgIHBsYXllckZhY2VMZWZ0LmNhbGwodGhpcylcbiAgICB9IGVsc2UgaWYgKHJpZ2h0SW5wdXRJc0FjdGl2ZS5jYWxsKHRoaXMpKSB7XG4gICAgICAgIC8vIElmIHRoZSBSSUdIVCBrZXkgaXMgZG93biwgc2V0IHRoZSBwbGF5ZXIgdmVsb2NpdHkgdG8gbW92ZSByaWdodFxuICAgICAgICB0aGlzLnBsYXllci5ib2R5LmFjY2VsZXJhdGlvbi54ID0gR2FtZUNvbnN0cy5BQ0NFTEVSQVRJT05cbiAgICAgICAgdGhpcy5wbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdyaWdodCcpXG5cbiAgICAgICAgcGxheWVyRmFjZVJpZ2h0LmNhbGwodGhpcylcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBTdGFuZCBzdGlsbFxuICAgICAgICB0aGlzLnBsYXllci5ib2R5LmFjY2VsZXJhdGlvbi54ID0gMFxuICAgICAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLnN0b3AoKVxuXG4gICAgICAgIGlmICh0aGlzLmdhbWUuaW5wdXQud29ybGRYID4gdGhpcy5wbGF5ZXIueCkge1xuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuZnJhbWUgPSA3XG4gICAgICAgICAgICBwbGF5ZXJGYWNlUmlnaHQuY2FsbCh0aGlzKVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuZ2FtZS5pbnB1dC53b3JsZFggPCB0aGlzLnBsYXllci54KSB7XG4gICAgICAgICAgICB0aGlzLnBsYXllci5mcmFtZSA9IDZcbiAgICAgICAgICAgIHBsYXllckZhY2VMZWZ0LmNhbGwodGhpcylcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFJlbW90ZUJ1bGxldChkYXRhKSB7XG4gICAgbGV0IGVuZW15QnVsbGV0ID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUoZGF0YS54LCBkYXRhLnksICdidWxsZXQxMicpXG4gICAgZW5lbXlCdWxsZXQuYnVsbGV0SWQgPSBkYXRhLmJ1bGxldElkXG4gICAgZW5lbXlCdWxsZXQucGxheWVySWQgPSBkYXRhLnBsYXllcklkXG4gICAgZW5lbXlCdWxsZXQuYWxpdmUgPSB0cnVlXG4gICAgZW5lbXlCdWxsZXQudmlzaWJsZSA9IHRydWVcbiAgICBlbmVteUJ1bGxldC5kYW1hZ2UgPSBkYXRhLmRhbWFnZVxuICAgIGVuZW15QnVsbGV0LnJvdGF0aW9uID0gZGF0YS5wb2ludGVyQW5nbGVcbiAgICBlbmVteUJ1bGxldC5oZWlnaHQgPSBkYXRhLmhlaWdodFxuICAgIGVuZW15QnVsbGV0LndpZHRoID0gZGF0YS53aWR0aFxuICAgIGVuZW15QnVsbGV0LmVuYWJsZUJvZHkgPSB0cnVlO1xuICAgIGVuZW15QnVsbGV0LnBoeXNpY3NCb2R5VHlwZSA9IFBoYXNlci5QaHlzaWNzLkFSQ0FERVxuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmVuYWJsZShlbmVteUJ1bGxldCwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKVxuICAgIGVuZW15QnVsbGV0LmJvZHkuZ3Jhdml0eS55ID0gLTE4MDBcblxuICAgIHJldHVybiBlbmVteUJ1bGxldFxufVxuIiwiaW1wb3J0IEdhbWVDb25zdHMgZnJvbSAnLi9HYW1lQ29uc3RzJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBSZW1vdGVQbGF5ZXIocGxheWVyKSB7XG4gICAgbGV0IG5ld1JlbW90ZVBsYXllciA9IHRoaXMuZ2FtZS5hZGQuc3ByaXRlKHBsYXllci54LCBwbGF5ZXIueSwgJ2NvbW1hbmRvJylcbiAgICBuZXdSZW1vdGVQbGF5ZXIuc2NhbGUuc2V0VG8oR2FtZUNvbnN0cy5QTEFZRVJfU0NBTEUpXG4gICAgbmV3UmVtb3RlUGxheWVyLmFuY2hvci5zZXRUbyhHYW1lQ29uc3RzLlBMQVlFUl9BTkNIT1IpXG4gICAgbmV3UmVtb3RlUGxheWVyLmFsaXZlID0gdHJ1ZVxuICAgIG5ld1JlbW90ZVBsYXllci5hbmltYXRpb25zLmFkZCgnbGVmdCcsIEdhbWVDb25zdHMuQU5JTUFUSU9OX0xFRlQsIEdhbWVDb25zdHMuQU5JTUFUSU9OX0ZSQU1FUkFURSwgdHJ1ZSlcbiAgICBuZXdSZW1vdGVQbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ3JpZ2h0JywgR2FtZUNvbnN0cy5BTklNQVRJT05fUklHSFQsIEdhbWVDb25zdHMuQU5JTUFUSU9OX0ZSQU1FUkFURSwgdHJ1ZSlcbiAgICBuZXdSZW1vdGVQbGF5ZXIuaWQgPSBwbGF5ZXIuaWRcbiAgICBuZXdSZW1vdGVQbGF5ZXIubGFzdFBvc2l0aW9uID0ge1xuICAgICAgICB4OiBwbGF5ZXIueCxcbiAgICAgICAgeTogcGxheWVyLnlcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3UmVtb3RlUGxheWVyXG59XG4iLCJpbXBvcnQgRXZlbnRIYW5kbGVyIGZyb20gJy4uL0V2ZW50SGFuZGxlcidcbmltcG9ydCBvblVwZGF0ZVBsYXllcnMgZnJvbSAnLi9vblVwZGF0ZVBsYXllcnMnXG5pbXBvcnQgb25Tb2NrZXRDb25uZWN0ZWQgZnJvbSAnLi9vblNvY2tldENvbm5lY3RlZCdcbmltcG9ydCBvblNvY2tldERpc2Nvbm5lY3QgZnJvbSAnLi9vblNvY2tldERpc2Nvbm5lY3QnXG5pbXBvcnQgb25Nb3ZlUGxheWVyIGZyb20gJy4vb25Nb3ZlUGxheWVyJ1xuaW1wb3J0IG9uUmVtb3ZlUGxheWVyIGZyb20gJy4vb25SZW1vdmVQbGF5ZXInXG5pbXBvcnQgb25CdWxsZXRGaXJlZCBmcm9tICcuL29uQnVsbGV0RmlyZWQnXG5pbXBvcnQgb25CdWxsZXRSZW1vdmVkIGZyb20gJy4vb25CdWxsZXRSZW1vdmVkJ1xuaW1wb3J0IG9uUGxheWVyRGFtYWdlZCBmcm9tICcuL29uUGxheWVyRGFtYWdlZCdcbmltcG9ydCBvblBsYXllclJlc3Bhd24gZnJvbSAnLi9vblBsYXllclJlc3Bhd24nXG5pbXBvcnQgb25QbGF5ZXJIZWFsdGhVcGRhdGUgZnJvbSAnLi9vblBsYXllckhlYWx0aFVwZGF0ZSdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zb2NrZXQub24oJ2Nvbm5lY3QnLCBvblNvY2tldENvbm5lY3RlZC5iaW5kKHRoaXMpKVxuICAgIHRoaXMuc29ja2V0Lm9uKCdkaXNjb25uZWN0Jywgb25Tb2NrZXREaXNjb25uZWN0LmJpbmQodGhpcykpXG5cbiAgICB0aGlzLnNvY2tldC5vbigndXBkYXRlIHBsYXllcnMnLCBvblVwZGF0ZVBsYXllcnMuYmluZCh0aGlzKSlcbiAgICB0aGlzLnNvY2tldC5vbignbW92ZSBwbGF5ZXInLCBvbk1vdmVQbGF5ZXIuYmluZCh0aGlzKSlcbiAgICB0aGlzLnNvY2tldC5vbigncmVtb3ZlIHBsYXllcicsIG9uUmVtb3ZlUGxheWVyLmJpbmQodGhpcykpXG5cbiAgICB0aGlzLnNvY2tldC5vbigncGxheWVyIHJlc3Bhd24nLCBvblBsYXllclJlc3Bhd24uYmluZCh0aGlzKSlcbiAgICB0aGlzLnNvY2tldC5vbigncGxheWVyIGRhbWFnZWQnLCBvblBsYXllckRhbWFnZWQuYmluZCh0aGlzKSlcbiAgICB0aGlzLnNvY2tldC5vbigncGxheWVyIGhlYWx0aCB1cGRhdGUnLCBvblBsYXllckhlYWx0aFVwZGF0ZS5iaW5kKHRoaXMpKVxuXG4gICAgdGhpcy5zb2NrZXQub24oJ2J1bGxldCBmaXJlZCcsIG9uQnVsbGV0RmlyZWQuYmluZCh0aGlzKSlcbiAgICB0aGlzLnNvY2tldC5vbignYnVsbGV0IHJlbW92ZWQnLCBvbkJ1bGxldFJlbW92ZWQuYmluZCh0aGlzKSlcblxuICAgIEV2ZW50SGFuZGxlci5vbigncGxheWVyIHVwZGF0ZSBuaWNrbmFtZScsIChkYXRhKSA9PiB7XG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ3BsYXllciB1cGRhdGUgbmlja25hbWUnLCB7XG4gICAgICAgICAgICByb29tSWQ6IHRoaXMucm9vbUlkLFxuICAgICAgICAgICAgbmlja25hbWU6IGRhdGEubmlja25hbWVcbiAgICAgICAgfSlcbiAgICB9KVxufVxuIiwiaW1wb3J0IFJlbW90ZUJ1bGxldCBmcm9tICcuLi9SZW1vdGVCdWxsZXQnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG9uQnVsbGV0RmlyZWQoZGF0YSkge1xuICAgIGlmIChkYXRhLmlkID09PSAoJy8jJyArIHRoaXMuc29ja2V0LmlkKSlcbiAgICAgICAgcmV0dXJuXG5cbiAgICBsZXQgZW5lbXlCdWxsZXQgPSBSZW1vdGVCdWxsZXQuY2FsbCh0aGlzLCBkYXRhKVxuICAgIGxldCBuZXdWZWxvY2l0eSA9IHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS52ZWxvY2l0eUZyb21Sb3RhdGlvbihkYXRhLnBvaW50ZXJBbmdsZSwgZGF0YS5idWxsZXRTcGVlZClcbiAgICBlbmVteUJ1bGxldC5ib2R5LnZlbG9jaXR5LnggKz0gbmV3VmVsb2NpdHkueFxuICAgIGVuZW15QnVsbGV0LmJvZHkudmVsb2NpdHkueSArPSBuZXdWZWxvY2l0eS55XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBvbkJ1bGxldFJlbW92ZWQoZGF0YSkge1xuICAgIGlmIChkYXRhLmlkID09PSAoJy8jJyArIHRoaXMuc29ja2V0LmlkKSlcbiAgICAgICAgcmV0dXJuXG5cbiAgICBsZXQgcmVtb3ZlQnVsbGV0ID0gXy5maW5kKHRoaXMud2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLmNoaWxkcmVuLCB7XG4gICAgICAgIGJ1bGxldElkOiBkYXRhLmJ1bGxldElkXG4gICAgfSlcblxuICAgIGlmICghcmVtb3ZlQnVsbGV0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdCdWxsZXQgbm90IGZvdW5kOiAnLCBkYXRhLmJ1bGxldElkKVxuICAgICAgICByZXR1cm5cbiAgICB9XG5cbiAgICByZW1vdmVCdWxsZXQua2lsbCgpXG59XG4iLCJpbXBvcnQgUGxheWVyQnlJZCBmcm9tJy4uL1BsYXllckJ5SWQnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG9uTW92ZVBsYXllcihkYXRhKSB7XG4gICAgbGV0IG1vdmVQbGF5ZXIgPSBQbGF5ZXJCeUlkLmNhbGwodGhpcywgZGF0YS5pZClcblxuICAgIC8vIFBsYXllciBub3QgZm91bmRcbiAgICBpZiAoISBtb3ZlUGxheWVyKSB7XG4gICAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIFVwZGF0ZSBwbGF5ZXIgcG9zaXRpb25cbiAgICBtb3ZlUGxheWVyLnggPSBkYXRhLnhcbiAgICBtb3ZlUGxheWVyLnkgPSBkYXRhLnlcblxuICAgIGlmIChtb3ZlUGxheWVyLnggPiBtb3ZlUGxheWVyLmxhc3RQb3NpdGlvbi54KSB7XG4gICAgICAgIG1vdmVQbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdyaWdodCcpXG4gICAgfVxuICAgIGVsc2UgaWYgKG1vdmVQbGF5ZXIueCA8IG1vdmVQbGF5ZXIubGFzdFBvc2l0aW9uLngpXG4gICAge1xuICAgICAgICBtb3ZlUGxheWVyLmFuaW1hdGlvbnMucGxheSgnbGVmdCcpXG4gICAgfVxuICAgIGVsc2VcbiAgICB7XG4gICAgICAgIG1vdmVQbGF5ZXIuYW5pbWF0aW9ucy5zdG9wKClcbiAgICAgICAgbW92ZVBsYXllci5mcmFtZSA9IDZcbiAgICB9XG5cbiAgICBtb3ZlUGxheWVyLmxhc3RQb3NpdGlvbi54ID0gbW92ZVBsYXllci54XG4gICAgbW92ZVBsYXllci5sYXN0UG9zaXRpb24ueSA9IG1vdmVQbGF5ZXIueVxufVxuIiwiaW1wb3J0IEV2ZW50SGFuZGxlciBmcm9tICcuLi9FdmVudEhhbmRsZXInXG5cbmxldCBkYW1hZ2VUaW1lb3V0ID0gbnVsbFxubGV0IGhlYWxpbmdJbnRlcnZhbCA9IG51bGxcbmxldCBsYXN0S25vd25IZWFsdGggPSBudWxsXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG9uUGxheWVyRGFtYWdlZChkYXRhKSB7XG4gICAgaWYgKGRhdGEuZGFtYWdlZFBsYXllcklkICE9PSAoJy8jJyArIHRoaXMuc29ja2V0LmlkKSlcbiAgICAgICAgcmV0dXJuXG5cbiAgICB0aGlzLnBsYXllci5tZXRhLmhlYWx0aCA9IGRhdGEuaGVhbHRoXG4gICAgRXZlbnRIYW5kbGVyLmVtaXQoJ2hlYWx0aCB1cGRhdGUnLCBTdHJpbmcodGhpcy5wbGF5ZXIubWV0YS5oZWFsdGgpKVxuXG4gICAgaWYgKHRoaXMucGxheWVyLm1ldGEuaGVhbHRoID4gNTUgJiYgdGhpcy5wbGF5ZXIubWV0YS5oZWFsdGggPCAxMDApIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KGRhbWFnZVRpbWVvdXQpXG4gICAgICAgIGRhbWFnZVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIC8vIFBsYXllcidzIGhlYWx0aCB3aWxsIGZ1bGx5IHJlZ2VuZXJhdGVcbiAgICAgICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ3BsYXllciBmdWxsIGhlYWx0aCcsIHtcbiAgICAgICAgICAgICAgICByb29tSWQ6IHRoaXMucm9vbUlkXG4gICAgICAgICAgICB9KVxuICAgICAgICB9LCA1MDAwKVxuICAgIH1cblxuICAgIGlmICh0aGlzLnBsYXllci5tZXRhLmhlYWx0aCA+IDAgJiYgdGhpcy5wbGF5ZXIubWV0YS5oZWFsdGggPD0gNTUpIHtcbiAgICAgICAgLy8gV2FpdCA1IHNlY29uZHMgdG8gYmVnaW4gaGVhbGluZyBwcm9jZXNzXG4gICAgICAgIGNsZWFyVGltZW91dChkYW1hZ2VUaW1lb3V0KVxuICAgICAgICBjbGVhckludGVydmFsKGhlYWxpbmdJbnRlcnZhbClcbiAgICAgICAgZGFtYWdlVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgbGFzdEtub3duSGVhbHRoID0gdGhpcy5wbGF5ZXIubWV0YS5oZWFsdGhcbiAgICAgICAgICAgIGhlYWxpbmdJbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAobGFzdEtub3duSGVhbHRoID49IDEwMCkge1xuICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGhlYWxpbmdJbnRlcnZhbClcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsYXN0S25vd25IZWFsdGggKz0gMTBcblxuICAgICAgICAgICAgICAgIC8vIEluY3JlYXNlIHBsYXllciBoZWFsdGggYnkgMTAgZXZlcnkgMS8yIGEgc2Vjb25kXG4gICAgICAgICAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgncGxheWVyIGhlYWxpbmcnLCB7XG4gICAgICAgICAgICAgICAgICAgIHJvb21JZDogdGhpcy5yb29tSWRcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSwgNTAwKVxuICAgICAgICB9LCA1MDAwKVxuICAgIH1cbn1cbiIsImltcG9ydCBFdmVudEhhbmRsZXIgZnJvbSAnLi4vRXZlbnRIYW5kbGVyJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBvblBsYXllckhlYWx0aFVwZGF0ZShkYXRhKSB7XG4gICAgaWYgKGRhdGEuaWQgIT09ICgnLyMnICsgdGhpcy5zb2NrZXQuaWQpKVxuICAgICAgICByZXR1cm5cblxuICAgIHRoaXMucGxheWVyLm1ldGEuaGVhbHRoID0gZGF0YS5oZWFsdGhcbiAgICBFdmVudEhhbmRsZXIuZW1pdCgnaGVhbHRoIHVwZGF0ZScsIFN0cmluZyh0aGlzLnBsYXllci5tZXRhLmhlYWx0aCkpXG59XG4iLCJpbXBvcnQgRXZlbnRIYW5kbGVyIGZyb20gJy4uL0V2ZW50SGFuZGxlcidcbmltcG9ydCBXZWFwb25zIGZyb20gJy4uL1dlYXBvbnMnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG9uUGxheWVyUmVzcGF3bihkYXRhKSB7XG4gICAgaWYgKGRhdGEuZGFtYWdlZFBsYXllcklkICE9PSAoJy8jJyArIHRoaXMuc29ja2V0LmlkKSlcbiAgICAgICAgcmV0dXJuXG5cbiAgICAvLyBTZXQgcHJpbWFyeSB3ZWFwb25cbiAgICB0aGlzLnBsYXllci5tZXRhLnByaW1hcnlXZWFwb24gPSBuZXcgV2VhcG9uc1t0aGlzLnBsYXllci5tZXRhLnNlbGVjdGVkUHJpbWFyeVdlYXBvbklkXSh0aGlzKVxuICAgIHRoaXMucGxheWVyLm1ldGEucHJpbWFyeVdlYXBvbi5pZCA9IHRoaXMucGxheWVyLm1ldGEuc2VsZWN0ZWRQcmltYXJ5V2VhcG9uSWRcblxuICAgIGlmICh0aGlzLmN1cnJlbnRXZWFwb24gPT09ICdwcmltYXJ5V2VhcG9uJylcbiAgICAgICAgdGhpcy5hazQ3U3ByaXRlLmxvYWRUZXh0dXJlKHRoaXMucGxheWVyLm1ldGEuc2VsZWN0ZWRQcmltYXJ5V2VhcG9uSWQpXG5cbiAgICAvLyBTZXQgc2Vjb25kYXJ5IHdlYXBvblxuICAgIHRoaXMucGxheWVyLm1ldGEuc2Vjb25kYXJ5V2VhcG9uID0gbmV3IFdlYXBvbnNbdGhpcy5wbGF5ZXIubWV0YS5zZWxlY3RlZFNlY29uZGFyeVdlYXBvbklkXSh0aGlzKVxuICAgIHRoaXMucGxheWVyLm1ldGEuc2Vjb25kYXJ5V2VhcG9uLmlkID0gdGhpcy5wbGF5ZXIubWV0YS5zZWxlY3RlZFNlY29uZGFyeVdlYXBvbklkXG5cbiAgICBpZiAodGhpcy5jdXJyZW50V2VhcG9uID09PSAnc2Vjb25kYXJ5V2VhcG9uJylcbiAgICAgICAgdGhpcy5hazQ3U3ByaXRlLmxvYWRUZXh0dXJlKHRoaXMucGxheWVyLm1ldGEuc2VsZWN0ZWRTZWNvbmRhcnlXZWFwb25JZClcblxuICAgIC8vIFJlc2V0IGhlYWx0aFxuICAgIHRoaXMucGxheWVyLm1ldGEuaGVhbHRoID0gZGF0YS5oZWFsdGhcbiAgICBFdmVudEhhbmRsZXIuZW1pdCgnaGVhbHRoIHVwZGF0ZScsIFN0cmluZyh0aGlzLnBsYXllci5tZXRhLmhlYWx0aCkpXG5cbiAgICAvLyBTcGF3biBwbGF5ZXJcbiAgICBsZXQgc3Bhd25Qb2ludCA9IHRoaXMubWFwSW5zdGFuY2UuZ2V0UmFuZG9tU3Bhd25Qb2ludCgpXG4gICAgdGhpcy5wbGF5ZXIueCA9IHNwYXduUG9pbnQueFxuICAgIHRoaXMucGxheWVyLnkgPSBzcGF3blBvaW50Lnlcbn1cbiIsImltcG9ydCBQbGF5ZXJCeUlkIGZyb20gJy4uL1BsYXllckJ5SWQnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG9uUmVtb3ZlUGxheWVyKGRhdGEpIHtcbiAgICBsZXQgcmVtb3ZlUGxheWVyID0gUGxheWVyQnlJZC5jYWxsKHRoaXMsIGRhdGEuaWQpXG5cbiAgICAvLyBQbGF5ZXIgbm90IGZvdW5kXG4gICAgaWYgKCFyZW1vdmVQbGF5ZXIpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1BsYXllciBub3QgZm91bmQ6ICcsIGRhdGEuaWQpXG4gICAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHJlbW92ZVBsYXllci5wbGF5ZXIua2lsbCgpXG5cbiAgICAvLyBSZW1vdmUgcGxheWVyIGZyb20gYXJyYXlcbiAgICB0aGlzLmVuZW1pZXMuc3BsaWNlKHRoaXMuZW5lbWllcy5pbmRleE9mKHJlbW92ZVBsYXllciksIDEpXG59XG4iLCJpbXBvcnQgR2V0UXVlcnlTdHJpbmcgZnJvbSAnLi4vR2V0UXVlcnlTdHJpbmcnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG9uU29ja2V0Q29ubmVjdGVkKCkge1xuICAgIGNvbnNvbGUubG9nKCdDb25uZWN0ZWQgdG8gc29ja2V0IHNlcnZlcicpXG5cbiAgICAgLy8gUmVzZXQgZW5lbWllcyBvbiByZWNvbm5lY3RcbiAgICB0aGlzLmVuZW1pZXMuZm9yRWFjaChmdW5jdGlvbiAoZW5lbXkpIHtcbiAgICAgICAgaWYgKGVuZW15KSBlbmVteS5raWxsKClcbiAgICB9KVxuXG4gICAgdGhpcy5lbmVtaWVzID0gW11cblxuICAgIC8vIFNlbmQgbG9jYWwgcGxheWVyIGRhdGEgdG8gdGhlIGdhbWUgc2VydmVyXG4gICAgdGhpcy5zb2NrZXQuZW1pdCgnbmV3IHBsYXllcicsIHtcbiAgICAgICAgcm9vbUlkOiBHZXRRdWVyeVN0cmluZygncm9vbUlkJyksXG4gICAgICAgIHg6IHRoaXMucGxheWVyLngsXG4gICAgICAgIHk6IHRoaXMucGxheWVyLnlcbiAgICB9KVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gb25Tb2NrZXREaXNjb25uZWN0KCkge1xuICAgIGNvbnNvbGUubG9nKCdEaXNjb25uZWN0ZWQgZnJvbSBzb2NrZXQgc2VydmVyJylcbn1cbiIsImltcG9ydCBSZW1vdGVQbGF5ZXIgZnJvbSAnLi4vUmVtb3RlUGxheWVyJ1xuaW1wb3J0IEV2ZW50SGFuZGxlciBmcm9tICcuLi9FdmVudEhhbmRsZXInXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG9uVXBkYXRlUGxheWVycyhkYXRhKSB7XG4gICAgdGhpcy5yb29tSWQgPSBkYXRhLnJvb20uaWRcblxuICAgIGxldCBuZXd1cmwgPSB3aW5kb3cubG9jYXRpb24ucHJvdG9jb2wgKyBcIi8vXCIgKyB3aW5kb3cubG9jYXRpb24uaG9zdCArIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArICc/cm9vbUlkPScgKyBkYXRhLnJvb20uaWQ7XG4gICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKHsgcGF0aDogbmV3dXJsIH0sICcnLCBuZXd1cmwpO1xuXG4gICAgdGhpcy5lbmVtaWVzLmZvckVhY2goZnVuY3Rpb24gKGVuZW15KSB7XG4gICAgICAgIGVuZW15LmtpbGwoKVxuICAgIH0pXG5cbiAgICB0aGlzLmVuZW1pZXMgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKClcblxuICAgIEV2ZW50SGFuZGxlci5lbWl0KCdwbGF5ZXJzIHVwZGF0ZScsIGRhdGEucm9vbS5wbGF5ZXJzKVxuXG4gICAgZGF0YS5yb29tLnBsYXllcnMuZm9yRWFjaCgocGxheWVyKSA9PiB7XG4gICAgICAgIGlmIChwbGF5ZXIuaWQgPT09ICgnLyMnICsgdGhpcy5zb2NrZXQuaWQpKSB7XG4gICAgICAgICAgICBFdmVudEhhbmRsZXIuZW1pdCgnc2NvcmUgdXBkYXRlJywgU3RyaW5nKHBsYXllci5tZXRhLnNjb3JlKSlcbiAgICAgICAgICAgIEV2ZW50SGFuZGxlci5lbWl0KCdoZWFsdGggdXBkYXRlJywgU3RyaW5nKHBsYXllci5tZXRhLmhlYWx0aCkpXG4gICAgICAgICAgICBFdmVudEhhbmRsZXIuZW1pdCgncGxheWVyIHVwZGF0ZScsIHsgcGxheWVyIH0pXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBuZXdSZW1vdGVQbGF5ZXIgPSBSZW1vdGVQbGF5ZXIuY2FsbCh0aGlzLCBwbGF5ZXIpXG4gICAgICAgIHRoaXMuZW5lbWllcy5hZGQobmV3UmVtb3RlUGxheWVyKVxuICAgIH0pXG59XG4iLCJpbXBvcnQgRmlyZVN0YW5kYXJkQnVsbGV0IGZyb20gJy4uL0ZpcmVTdGFuZGFyZEJ1bGxldCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQUs0NyBleHRlbmRzIFBoYXNlci5Hcm91cCB7XG4gICAgY29uc3RydWN0b3Iocm9vdFNjb3BlKSB7XG4gICAgICAgIHN1cGVyKHJvb3RTY29wZSlcblxuICAgICAgICB0aGlzLnJvb3RTY29wZSA9IHJvb3RTY29wZVxuXG4gICAgICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIHRoaXMucm9vdFNjb3BlLmdhbWUsIHRoaXMucm9vdFNjb3BlLmdhbWUud29ybGQsICdBSy00NycsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpXG5cbiAgICAgICAgdGhpcy5idWxsZXRIZWlnaHQgPSAyXG4gICAgICAgIHRoaXMuYnVsbGV0U3BlZWQgPSAyMzAwXG4gICAgICAgIHRoaXMuYnVsbGV0V2lkdGggPSA0MFxuICAgICAgICB0aGlzLmRhbWFnZSA9IDIyXG4gICAgICAgIHRoaXMuZmlyZVJhdGUgPSAxNjBcbiAgICAgICAgdGhpcy5meCA9IHRoaXMucm9vdFNjb3BlLmdhbWUuYWRkLmF1ZGlvKCdBSzQ3LXNvdW5kJylcbiAgICAgICAgdGhpcy5uZXh0RmlyZSA9IDBcbiAgICB9XG5cbiAgICBmaXJlKCkge1xuICAgICAgICBpZiAodGhpcy5yb290U2NvcGUuZ2FtZS50aW1lLm5vdyA8IHRoaXMubmV4dEZpcmUgfHwgdGhpcy5yb290U2NvcGUuYnVsbGV0cy5jb3VudERlYWQoKSA8PSAwKVxuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMucm9vdFNjb3BlLmdhbWUudGltZS5ub3cgKyB0aGlzLmZpcmVSYXRlXG5cbiAgICAgICAgRmlyZVN0YW5kYXJkQnVsbGV0LmNhbGwodGhpcylcbiAgICB9XG59XG4iLCJpbXBvcnQgRmlyZVN0YW5kYXJkQnVsbGV0IGZyb20gJy4uL0ZpcmVTdGFuZGFyZEJ1bGxldCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQVVHIGV4dGVuZHMgUGhhc2VyLkdyb3VwIHtcbiAgICBjb25zdHJ1Y3Rvcihyb290U2NvcGUpIHtcbiAgICAgICAgc3VwZXIocm9vdFNjb3BlKVxuXG4gICAgICAgIHRoaXMucm9vdFNjb3BlID0gcm9vdFNjb3BlXG5cbiAgICAgICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgdGhpcy5yb290U2NvcGUuZ2FtZSwgdGhpcy5yb290U2NvcGUuZ2FtZS53b3JsZCwgJ0FVRycsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpXG5cbiAgICAgICAgdGhpcy5idWxsZXRIZWlnaHQgPSAyXG4gICAgICAgIHRoaXMuYnVsbGV0U3BlZWQgPSAyMzAwXG4gICAgICAgIHRoaXMuYnVsbGV0V2lkdGggPSA0MFxuICAgICAgICB0aGlzLmRhbWFnZSA9IDIyXG4gICAgICAgIHRoaXMuZmlyZVJhdGUgPSAxNjBcbiAgICAgICAgdGhpcy5meCA9IHRoaXMucm9vdFNjb3BlLmdhbWUuYWRkLmF1ZGlvKCdBVUctc291bmQnKVxuICAgICAgICB0aGlzLm5leHRGaXJlID0gMFxuICAgIH1cblxuICAgIGZpcmUoKSB7XG4gICAgICAgIGlmICh0aGlzLnJvb3RTY29wZS5nYW1lLnRpbWUubm93IDwgdGhpcy5uZXh0RmlyZSB8fCB0aGlzLnJvb3RTY29wZS5idWxsZXRzLmNvdW50RGVhZCgpIDw9IDApXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5yb290U2NvcGUuZ2FtZS50aW1lLm5vdyArIHRoaXMuZmlyZVJhdGVcblxuICAgICAgICBGaXJlU3RhbmRhcmRCdWxsZXQuY2FsbCh0aGlzKVxuICAgIH1cbn1cbiIsImltcG9ydCBGaXJlU3RhbmRhcmRCdWxsZXQgZnJvbSAnLi4vRmlyZVN0YW5kYXJkQnVsbGV0J1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCYXJyZXR0IGV4dGVuZHMgUGhhc2VyLkdyb3VwIHtcbiAgICBjb25zdHJ1Y3Rvcihyb290U2NvcGUpIHtcbiAgICAgICAgc3VwZXIocm9vdFNjb3BlKVxuXG4gICAgICAgIHRoaXMucm9vdFNjb3BlID0gcm9vdFNjb3BlXG5cbiAgICAgICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgdGhpcy5yb290U2NvcGUuZ2FtZSwgdGhpcy5yb290U2NvcGUuZ2FtZS53b3JsZCwgJ0FLLTQ3JywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSlcblxuICAgICAgICB0aGlzLmJ1bGxldEhlaWdodCA9IDJcbiAgICAgICAgdGhpcy5idWxsZXRTcGVlZCA9IDM0MzVcbiAgICAgICAgdGhpcy5idWxsZXRXaWR0aCA9IDQwXG4gICAgICAgIHRoaXMuZGFtYWdlID0gODhcbiAgICAgICAgdGhpcy5maXJlUmF0ZSA9IDMwMDBcbiAgICAgICAgdGhpcy5meCA9IHRoaXMucm9vdFNjb3BlLmdhbWUuYWRkLmF1ZGlvKCdCYXJyZXRNOTAtc291bmQnKVxuICAgICAgICB0aGlzLm5leHRGaXJlID0gMFxuICAgIH1cblxuICAgIGZpcmUoKSB7XG4gICAgICAgIGlmICh0aGlzLnJvb3RTY29wZS5nYW1lLnRpbWUubm93IDwgdGhpcy5uZXh0RmlyZSB8fCB0aGlzLnJvb3RTY29wZS5idWxsZXRzLmNvdW50RGVhZCgpIDw9IDApXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5yb290U2NvcGUuZ2FtZS50aW1lLm5vdyArIHRoaXMuZmlyZVJhdGVcblxuICAgICAgICBGaXJlU3RhbmRhcmRCdWxsZXQuY2FsbCh0aGlzKVxuICAgIH1cbn1cbiIsImltcG9ydCBGaXJlU3RhbmRhcmRCdWxsZXQgZnJvbSAnLi4vRmlyZVN0YW5kYXJkQnVsbGV0J1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEZXNlcnRFYWdsZSBleHRlbmRzIFBoYXNlci5Hcm91cCB7XG4gICAgY29uc3RydWN0b3Iocm9vdFNjb3BlKSB7XG4gICAgICAgIHN1cGVyKHJvb3RTY29wZSlcblxuICAgICAgICB0aGlzLnJvb3RTY29wZSA9IHJvb3RTY29wZVxuXG4gICAgICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIHJvb3RTY29wZS5nYW1lLCByb290U2NvcGUuZ2FtZS53b3JsZCwgJ0Rlc2VydCBFYWdsZScsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpXG5cbiAgICAgICAgdGhpcy5idWxsZXRIZWlnaHQgPSAyXG4gICAgICAgIHRoaXMuYnVsbGV0U3BlZWQgPSAyMzAwXG4gICAgICAgIHRoaXMuYnVsbGV0V2lkdGggPSA0MFxuICAgICAgICB0aGlzLmRhbWFnZSA9IDMzXG4gICAgICAgIHRoaXMuZmlyZVJhdGUgPSAyNjdcbiAgICAgICAgdGhpcy5meCA9IHJvb3RTY29wZS5nYW1lLmFkZC5hdWRpbygnRGVzZXJ0RWFnbGUtc291bmQnKVxuICAgICAgICB0aGlzLm5leHRGaXJlID0gMFxuICAgIH1cblxuICAgIGZpcmUoKSB7XG4gICAgICAgIGlmICh0aGlzLnJvb3RTY29wZS5nYW1lLnRpbWUubm93IDwgdGhpcy5uZXh0RmlyZSB8fCB0aGlzLnJvb3RTY29wZS5idWxsZXRzLmNvdW50RGVhZCgpIDw9IDApXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5yb290U2NvcGUuZ2FtZS50aW1lLm5vdyArIHRoaXMuZmlyZVJhdGVcblxuICAgICAgICBGaXJlU3RhbmRhcmRCdWxsZXQuY2FsbCh0aGlzKVxuICAgIH1cbn1cbiIsImltcG9ydCBGaXJlU3RhbmRhcmRCdWxsZXQgZnJvbSAnLi4vRmlyZVN0YW5kYXJkQnVsbGV0J1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHNDMgZXh0ZW5kcyBQaGFzZXIuR3JvdXAge1xuICAgIGNvbnN0cnVjdG9yKHJvb3RTY29wZSkge1xuICAgICAgICBzdXBlcihyb290U2NvcGUpXG5cbiAgICAgICAgdGhpcy5yb290U2NvcGUgPSByb290U2NvcGVcblxuICAgICAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCB0aGlzLnJvb3RTY29wZS5nYW1lLCB0aGlzLnJvb3RTY29wZS5nYW1lLndvcmxkLCAnRzQzJywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSlcblxuICAgICAgICB0aGlzLmJ1bGxldEhlaWdodCA9IDJcbiAgICAgICAgdGhpcy5idWxsZXRTcGVlZCA9IDIzMDBcbiAgICAgICAgdGhpcy5idWxsZXRXaWR0aCA9IDQwXG4gICAgICAgIHRoaXMuZGFtYWdlID0gNDRcbiAgICAgICAgdGhpcy5maXJlUmF0ZSA9IDEzMDBcbiAgICAgICAgdGhpcy5meCA9IHRoaXMucm9vdFNjb3BlLmdhbWUuYWRkLmF1ZGlvKCdHNDMtc291bmQnKVxuICAgICAgICB0aGlzLm5leHRGaXJlID0gMFxuICAgIH1cblxuICAgIGZpcmUoKSB7XG4gICAgICAgIGlmICh0aGlzLnJvb3RTY29wZS5nYW1lLnRpbWUubm93IDwgdGhpcy5uZXh0RmlyZSB8fCB0aGlzLnJvb3RTY29wZS5idWxsZXRzLmNvdW50RGVhZCgpIDw9IDApXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5yb290U2NvcGUuZ2FtZS50aW1lLm5vdyArIHRoaXMuZmlyZVJhdGVcblxuICAgICAgICBGaXJlU3RhbmRhcmRCdWxsZXQuY2FsbCh0aGlzKVxuICAgIH1cbn1cbiIsImltcG9ydCBGaXJlU3RhbmRhcmRCdWxsZXQgZnJvbSAnLi4vRmlyZVN0YW5kYXJkQnVsbGV0J1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNNEExIGV4dGVuZHMgUGhhc2VyLkdyb3VwIHtcbiAgICBjb25zdHJ1Y3Rvcihyb290U2NvcGUpIHtcbiAgICAgICAgc3VwZXIocm9vdFNjb3BlKVxuXG4gICAgICAgIHRoaXMucm9vdFNjb3BlID0gcm9vdFNjb3BlXG5cbiAgICAgICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgdGhpcy5yb290U2NvcGUuZ2FtZSwgdGhpcy5yb290U2NvcGUuZ2FtZS53b3JsZCwgJ000QTEnLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKVxuXG4gICAgICAgIHRoaXMuYnVsbGV0SGVpZ2h0ID0gMlxuICAgICAgICB0aGlzLmJ1bGxldFNwZWVkID0gMjQwMFxuICAgICAgICB0aGlzLmJ1bGxldFdpZHRoID0gNDBcbiAgICAgICAgdGhpcy5kYW1hZ2UgPSAyMFxuICAgICAgICB0aGlzLmZpcmVSYXRlID0gMTUwXG4gICAgICAgIHRoaXMuZnggPSB0aGlzLnJvb3RTY29wZS5nYW1lLmFkZC5hdWRpbygnTTRBMS1zb3VuZCcpXG4gICAgICAgIHRoaXMubmV4dEZpcmUgPSAwXG4gICAgfVxuXG4gICAgZmlyZSgpIHtcbiAgICAgICAgaWYgKHRoaXMucm9vdFNjb3BlLmdhbWUudGltZS5ub3cgPCB0aGlzLm5leHRGaXJlIHx8IHRoaXMucm9vdFNjb3BlLmJ1bGxldHMuY291bnREZWFkKCkgPD0gMClcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLnJvb3RTY29wZS5nYW1lLnRpbWUubm93ICsgdGhpcy5maXJlUmF0ZVxuXG4gICAgICAgIEZpcmVTdGFuZGFyZEJ1bGxldC5jYWxsKHRoaXMpXG4gICAgfVxufVxuIiwiaW1wb3J0IEZpcmVTaG90Z3VuU2hlbGwgZnJvbSAnLi4vRmlyZVNob3RndW5TaGVsbCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTTUwMCBleHRlbmRzIFBoYXNlci5Hcm91cCB7XG4gICAgY29uc3RydWN0b3Iocm9vdFNjb3BlKSB7XG4gICAgICAgIHN1cGVyKHJvb3RTY29wZSlcblxuICAgICAgICB0aGlzLnJvb3RTY29wZSA9IHJvb3RTY29wZVxuXG4gICAgICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIHRoaXMucm9vdFNjb3BlLmdhbWUsIHRoaXMucm9vdFNjb3BlLmdhbWUud29ybGQsICdNNTAwJywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSlcblxuICAgICAgICB0aGlzLmJ1bGxldEhlaWdodCA9IDJcbiAgICAgICAgdGhpcy5idWxsZXRTcGVlZCA9IDE5MDBcbiAgICAgICAgdGhpcy5idWxsZXRXaWR0aCA9IDQwXG4gICAgICAgIHRoaXMuZmlyZVJhdGUgPSAxNjUwXG4gICAgICAgIHRoaXMuZnggPSB0aGlzLnJvb3RTY29wZS5nYW1lLmFkZC5hdWRpbygnTTUwMC1zb3VuZCcpXG4gICAgICAgIHRoaXMubmV4dEZpcmUgPSAwXG4gICAgfVxuXG4gICAgZmlyZSgpIHtcbiAgICAgICAgaWYgKHRoaXMucm9vdFNjb3BlLmdhbWUudGltZS5ub3cgPCB0aGlzLm5leHRGaXJlIHx8IHRoaXMucm9vdFNjb3BlLmJ1bGxldHMuY291bnREZWFkKCkgPD0gMClcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLnJvb3RTY29wZS5nYW1lLnRpbWUubm93ICsgdGhpcy5maXJlUmF0ZVxuXG4gICAgICAgIEZpcmVTaG90Z3VuU2hlbGwuY2FsbCh0aGlzKVxuICAgIH1cbn1cbiIsImltcG9ydCBGaXJlU3RhbmRhcmRCdWxsZXQgZnJvbSAnLi4vRmlyZVN0YW5kYXJkQnVsbGV0J1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQOTAgZXh0ZW5kcyBQaGFzZXIuR3JvdXAge1xuICAgIGNvbnN0cnVjdG9yKHJvb3RTY29wZSkge1xuICAgICAgICBzdXBlcihyb290U2NvcGUpXG5cbiAgICAgICAgdGhpcy5yb290U2NvcGUgPSByb290U2NvcGVcblxuICAgICAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCB0aGlzLnJvb3RTY29wZS5nYW1lLCB0aGlzLnJvb3RTY29wZS5nYW1lLndvcmxkLCAnUDkwJywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSlcblxuICAgICAgICB0aGlzLmJ1bGxldEhlaWdodCA9IDJcbiAgICAgICAgdGhpcy5idWxsZXRTcGVlZCA9IDIzMDBcbiAgICAgICAgdGhpcy5idWxsZXRXaWR0aCA9IDQwXG4gICAgICAgIHRoaXMuZGFtYWdlID0gMjJcbiAgICAgICAgdGhpcy5maXJlUmF0ZSA9IDEyMFxuICAgICAgICB0aGlzLmZ4ID0gdGhpcy5yb290U2NvcGUuZ2FtZS5hZGQuYXVkaW8oJ1A5MC1zb3VuZCcpXG4gICAgICAgIHRoaXMubmV4dEZpcmUgPSAwXG4gICAgfVxuXG4gICAgZmlyZSgpIHtcbiAgICAgICAgaWYgKHRoaXMucm9vdFNjb3BlLmdhbWUudGltZS5ub3cgPCB0aGlzLm5leHRGaXJlIHx8IHRoaXMucm9vdFNjb3BlLmJ1bGxldHMuY291bnREZWFkKCkgPD0gMClcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLnJvb3RTY29wZS5nYW1lLnRpbWUubm93ICsgdGhpcy5maXJlUmF0ZVxuXG4gICAgICAgIEZpcmVTdGFuZGFyZEJ1bGxldC5jYWxsKHRoaXMpXG4gICAgfVxufVxuIiwiaW1wb3J0IEZpcmVSb2NrZXQgZnJvbSAnLi4vRmlyZVJvY2tldCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUlBHIGV4dGVuZHMgUGhhc2VyLkdyb3VwIHtcbiAgICBjb25zdHJ1Y3Rvcihyb290U2NvcGUpIHtcbiAgICAgICAgc3VwZXIocm9vdFNjb3BlKVxuXG4gICAgICAgIHRoaXMucm9vdFNjb3BlID0gcm9vdFNjb3BlXG5cbiAgICAgICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgdGhpcy5yb290U2NvcGUuZ2FtZSwgdGhpcy5yb290U2NvcGUuZ2FtZS53b3JsZCwgJ0FLLTQ3JywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSlcblxuICAgICAgICB0aGlzLmJ1bGxldEhlaWdodCA9IDJcbiAgICAgICAgdGhpcy5idWxsZXRTcGVlZCA9IDIzMDBcbiAgICAgICAgdGhpcy5idWxsZXRXaWR0aCA9IDQwXG4gICAgICAgIHRoaXMuZGFtYWdlID0gMjJcbiAgICAgICAgdGhpcy5maXJlUmF0ZSA9IDMwMDBcbiAgICAgICAgdGhpcy5meCA9IHRoaXMucm9vdFNjb3BlLmdhbWUuYWRkLmF1ZGlvKCdSUEctc291bmQnKVxuICAgICAgICB0aGlzLm5leHRGaXJlID0gMFxuICAgIH1cblxuICAgIGZpcmUoKSB7XG4gICAgICAgIGlmICh0aGlzLnJvb3RTY29wZS5nYW1lLnRpbWUubm93IDwgdGhpcy5uZXh0RmlyZSB8fCB0aGlzLnJvb3RTY29wZS5idWxsZXRzLmNvdW50RGVhZCgpIDw9IDApXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5yb290U2NvcGUuZ2FtZS50aW1lLm5vdyArIHRoaXMuZmlyZVJhdGVcblxuICAgICAgICBGaXJlUm9ja2V0LmNhbGwodGhpcylcbiAgICB9XG59XG5cbi8vXG4vLyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyAvLyAgUlBHIHRoYXQgdmlzdWFsbHkgdHJhY2sgdGhlIGRpcmVjdGlvbiB0aGV5J3JlIGhlYWRpbmcgaW4gLy9cbi8vIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vXG4vLyBXZWFwb24uUlBHID0gZnVuY3Rpb24gKGdhbWUpIHtcbi8vXG4vLyAgICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgZ2FtZSwgZ2FtZS53b3JsZCwgJ1JQRycsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuLy9cbi8vICAgICB0aGlzLm5leHRGaXJlID0gMDtcbi8vICAgICB0aGlzLmJ1bGxldFNwZWVkID0gNDAwO1xuLy8gICAgIHRoaXMuZmlyZVJhdGUgPSAyNTA7XG4vL1xuLy8gICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMzI7IGkrKylcbi8vICAgICB7XG4vLyAgICAgICAgIHRoaXMuYWRkKG5ldyBCdWxsZXQoZ2FtZSwgJ2J1bGxldDEwJyksIHRydWUpO1xuLy8gICAgIH1cbi8vXG4vLyAgICAgdGhpcy5zZXRBbGwoJ3RyYWNraW5nJywgdHJ1ZSlcbi8vXG4vLyAgICAgcmV0dXJuIHRoaXM7XG4vL1xuLy8gfTtcbi8vXG4vLyBXZWFwb24uUlBHLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLkdyb3VwLnByb3RvdHlwZSk7XG4vLyBXZWFwb24uUlBHLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFdlYXBvbi5SUEc7XG4vL1xuLy8gV2VhcG9uLlJQRy5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uIChzb3VyY2UpIHtcbi8vXG4vLyAgICAgaWYgKHRoaXMuZ2FtZS50aW1lLnRpbWUgPCB0aGlzLm5leHRGaXJlKSB7IHJldHVybjsgfVxuLy9cbi8vICAgICB2YXIgeCA9IHNvdXJjZS54ICsgMTA7XG4vLyAgICAgdmFyIHkgPSBzb3VyY2UueSArIDEwO1xuLy9cbi8vICAgICB0aGlzLmdldEZpcnN0RXhpc3RzKGZhbHNlKS5maXJlKHgsIHksIDAsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIC03MDApO1xuLy8gICAgIHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgNzAwKTtcbi8vXG4vLyAgICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMuZ2FtZS50aW1lLnRpbWUgKyB0aGlzLmZpcmVSYXRlO1xuLy9cbi8vIH07XG4iLCJpbXBvcnQgRmlyZVN0YW5kYXJkQnVsbGV0IGZyb20gJy4uL0ZpcmVTdGFuZGFyZEJ1bGxldCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2tvcnBpb24gZXh0ZW5kcyBQaGFzZXIuR3JvdXAge1xuICAgIGNvbnN0cnVjdG9yKHJvb3RTY29wZSkge1xuICAgICAgICBzdXBlcihyb290U2NvcGUpXG5cbiAgICAgICAgdGhpcy5yb290U2NvcGUgPSByb290U2NvcGVcblxuICAgICAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCB0aGlzLnJvb3RTY29wZS5nYW1lLCB0aGlzLnJvb3RTY29wZS5nYW1lLndvcmxkLCAnU2tvcnBpb24nLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKVxuXG4gICAgICAgIHRoaXMuYnVsbGV0SGVpZ2h0ID0gMlxuICAgICAgICB0aGlzLmJ1bGxldFNwZWVkID0gMjMwMFxuICAgICAgICB0aGlzLmJ1bGxldFdpZHRoID0gNDBcbiAgICAgICAgdGhpcy5kYW1hZ2UgPSAyMlxuICAgICAgICB0aGlzLmZpcmVSYXRlID0gMTIwXG4gICAgICAgIHRoaXMuZnggPSB0aGlzLnJvb3RTY29wZS5nYW1lLmFkZC5hdWRpbygnU2tvcnBpb24tc291bmQnKVxuICAgICAgICB0aGlzLm5leHRGaXJlID0gMFxuICAgIH1cblxuICAgIGZpcmUoKSB7XG4gICAgICAgIGlmICh0aGlzLnJvb3RTY29wZS5nYW1lLnRpbWUubm93IDwgdGhpcy5uZXh0RmlyZSB8fCB0aGlzLnJvb3RTY29wZS5idWxsZXRzLmNvdW50RGVhZCgpIDw9IDApXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5yb290U2NvcGUuZ2FtZS50aW1lLm5vdyArIHRoaXMuZmlyZVJhdGVcblxuICAgICAgICBGaXJlU3RhbmRhcmRCdWxsZXQuY2FsbCh0aGlzKVxuICAgIH1cbn1cbiIsImltcG9ydCBBSzQ3IGZyb20gJy4vQUs0NydcbmltcG9ydCBBVUcgZnJvbSAnLi9BVUcnXG5pbXBvcnQgQmFycmV0dCBmcm9tICcuL0JhcnJldHQnXG5pbXBvcnQgRGVzZXJ0RWFnbGUgZnJvbSAnLi9EZXNlcnRFYWdsZSdcbmltcG9ydCBHNDMgZnJvbSAnLi9HNDMnXG5pbXBvcnQgTTRBMSBmcm9tICcuL000QTEnXG5pbXBvcnQgTTUwMCBmcm9tICcuL001MDAnXG5pbXBvcnQgUDkwIGZyb20gJy4vUDkwJ1xuaW1wb3J0IFJQRyBmcm9tICcuL1JQRydcbmltcG9ydCBTa29ycGlvbiBmcm9tICcuL1Nrb3JwaW9uJ1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgQUs0NyxcbiAgICBBVUcsXG4gICAgQmFycmV0dCxcbiAgICBEZXNlcnRFYWdsZSxcbiAgICBHNDMsXG4gICAgTTRBMSxcbiAgICBNNTAwLFxuICAgIFA5MCxcbiAgICBSUEcsXG4gICAgU2tvcnBpb25cbn1cbiIsImNvbnN0IHNwYXduUG9pbnRzID0gW1xuICAgIHsgeDogODE1LCB5OiAxNzMwIH0sXG4gICAgeyB4OiAzMzgwLCB5OiAxMDMwIH0sXG4gICAgeyB4OiA0NDM3LCB5OiAxNTUwIH0sXG4gICAgeyB4OiA2NjkwLCB5OiAxODYwIH0sXG4gICAgeyB4OiAzODMyLCB5OiAzMzUwIH0sXG4gICAgeyB4OiAzNzc1LCB5OiAyMzAwIH0sXG4gICAgeyB4OiAyNDIwLCB5OiAyOTAwIH1cbl1cblxuY29uc3QgbGVkZ2VzID0gW1xuICAgIHsgaWQ6IDEsIHg6IDIxNDUsIHk6IDIwNjUsIHdpZHRoOiAxMzUsIGhlaWdodDogNDAgfSxcbiAgICB7IGlkOiAyLCB4OiAyNjEzLCB5OiAxMDk0LCB3aWR0aDogMTEwMCwgaGVpZ2h0OiAxMTIgfSxcbiAgICB7IGlkOiAzLCB4OiAzNjU3LCB5OiAzNDQ2LCB3aWR0aDogNTAwLCBoZWlnaHQ6IDYwMCB9LFxuICAgIHsgaWQ6IDQsIHg6IDUyMTcsIHk6IDE5MzgsIHdpZHRoOiAzODAsIGhlaWdodDogNjAwIH0sXG4gICAgeyBpZDogNSwgeDogNDIyLCB5OiAxODI0LCB3aWR0aDogMTE1MCwgaGVpZ2h0OiAzMDAgfSxcbiAgICB7IGlkOiA2LCB4OiAxNTU1LCB5OiAxNzQ5LCB3aWR0aDogMjcwLCBoZWlnaHQ6IDczMCB9LFxuICAgIHsgaWQ6IDcsIHg6IDE4MjAsIHk6IDE3NDksIHdpZHRoOiA0NzAsIGhlaWdodDogNiB9LFxuICAgIHsgaWQ6IDgsIHg6IDIyNzUsIHk6IDE3NDksIHdpZHRoOiAzMjAsIGhlaWdodDogNjMwIH0sXG4gICAgeyBpZDogOSwgeDogMjU5NSwgeTogMTY2Nywgd2lkdGg6IDExMjAsIGhlaWdodDogMjYwIH0sXG4gICAgeyBpZDogMTAsIHg6IDQzMDQsIHk6IDE2MjEsIHdpZHRoOiAzNzUsIGhlaWdodDogMTMwMCB9LFxuICAgIHsgaWQ6IDExLCB4OiAxODI1LCB5OiAyMjk4LCB3aWR0aDogMTYwLCBoZWlnaHQ6IDE1MiB9LFxuICAgIHsgaWQ6IDEyLCB4OiA1NjQ0LCB5OiAxNTczLCB3aWR0aDogMzMwLCBoZWlnaHQ6IDIwIH0sXG4gICAgeyBpZDogMTMsIHg6IDQ2NzMsIHk6IDIwMTcsIHdpZHRoOiA1NzAsIGhlaWdodDogMjU0IH0sXG4gICAgeyBpZDogMTQsIHg6IDI5NDgsIHk6IDMxMzcsIHdpZHRoOiAzODAsIGhlaWdodDogMzAwIH0sXG4gICAgeyBpZDogMTUsIHg6IDM5ODMsIHk6IDIwMjgsIHdpZHRoOiAzNDEsIGhlaWdodDogNzAwIH0sXG4gICAgeyBpZDogMTYsIHg6IDE5MTIsIHk6IDI5NjcsIHdpZHRoOiAxMDQ1LCBoZWlnaHQ6IDUwMCB9LFxuICAgIHsgaWQ6IDE3LCB4OiA2NjI4LCB5OiAxNTkwLCB3aWR0aDogMzg1LCBoZWlnaHQ6IDM3IH0sXG4gICAgeyBpZDogMTgsIHg6IDY2MjgsIHk6IDExNzgsIHdpZHRoOiAzODUsIGhlaWdodDogMzcgfSxcbiAgICB7IGlkOiAxOSwgeDogNTU5MCwgeTogMjAzOCwgd2lkdGg6IDM1MCwgaGVpZ2h0OiA2MDAgfSxcbiAgICB7IGlkOiAyMCwgeDogNjk4NCwgeTogMTk4OSwgd2lkdGg6IDQ1MCwgaGVpZ2h0OiAxNjcgfSxcbiAgICB7IGlkOiAyMSwgeDogMzY3MiwgeTogMjQwMSwgd2lkdGg6IDMzMCwgaGVpZ2h0OiA1MDAgfSxcbiAgICB7IGlkOiAyMiwgeDogMzMwMywgeTogMjU5OSwgd2lkdGg6IDQwMCwgaGVpZ2h0OiAzMDAgfSxcbiAgICB7IGlkOiAyMywgeDogNTk0MCwgeTogMjAxOCwgd2lkdGg6IDEwNTAsIGhlaWdodDogNjAwIH1cbl1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSGlnaFJ1bGVKdW5nbGUge1xuICAgIGNvbnN0cnVjdG9yKHJvb3RTY29wZSkge1xuICAgICAgICB0aGlzLnJvb3RTY29wZSA9IHJvb3RTY29wZVxuICAgIH1cblxuICAgIGdldFJhbmRvbVNwYXduUG9pbnQoKSB7XG4gICAgICAgIHJldHVybiBfLnNhbXBsZShzcGF3blBvaW50cylcbiAgICB9XG5cbiAgICBjcmVhdGUoKSB7XG4gICAgICAgIHRoaXMucm9vdFNjb3BlLnNreXNwcml0ZSA9IHRoaXMucm9vdFNjb3BlLmFkZC50aWxlU3ByaXRlKDAsIDAsIHRoaXMucm9vdFNjb3BlLmdhbWUud29ybGQud2lkdGgsIHRoaXMucm9vdFNjb3BlLmdhbWUud29ybGQuaGVpZ2h0LCAnbWFwLWJnJylcbiAgICAgICAgdGhpcy5yb290U2NvcGUucGxhdGZvcm1zID0gdGhpcy5yb290U2NvcGUuYWRkLmdyb3VwKClcbiAgICAgICAgdGhpcy5yb290U2NvcGUucGxhdGZvcm1zLmVuYWJsZUJvZHkgPSB0cnVlXG4gICAgICAgIHRoaXMuY3JlYXRlTGVkZ2VzKClcbiAgICAgICAgdGhpcy5yb290U2NvcGUucGxhdGZvcm1zLnNldEFsbCgnYm9keS5pbW1vdmFibGUnLCB0cnVlKVxuICAgICAgICB0aGlzLnJvb3RTY29wZS5wbGF0Zm9ybXMuc2V0QWxsKCdib2R5LmFsbG93R3Jhdml0eScsIGZhbHNlKVxuICAgIH1cblxuICAgIGNyZWF0ZUxlZGdlcygpIHtcbiAgICAgICAgbGVkZ2VzLmZvckVhY2goKGxlZGdlKSA9PiB7XG4gICAgICAgICAgICAvLyB2YXIgbmV3TGVkZ2UgPSB0aGlzLnJvb3RTY29wZS5wbGF0Zm9ybXMuY3JlYXRlKGxlZGdlLngsIGxlZGdlLnksICdncm91bmQnKVxuICAgICAgICAgICAgdmFyIG5ld0xlZGdlID0gdGhpcy5yb290U2NvcGUucGxhdGZvcm1zLmNyZWF0ZShsZWRnZS54LCBsZWRnZS55KVxuICAgICAgICAgICAgbmV3TGVkZ2UuaGVpZ2h0ID0gbGVkZ2UuaGVpZ2h0XG4gICAgICAgICAgICBuZXdMZWRnZS53aWR0aCA9IGxlZGdlLndpZHRoXG5cbiAgICAgICAgICAgIC8vIERlYnVnIHN0dWZmXG4gICAgICAgICAgICAvLyBuZXdMZWRnZS5hbHBoYSA9IDAuNFxuICAgICAgICAgICAgLy8gbGV0IHN0eWxlID0geyBmb250OiBcIjIwcHggQXJpYWxcIiwgZmlsbDogXCIjZmYwMDQ0XCIsIGFsaWduOiBcImNlbnRlclwiLCBiYWNrZ3JvdW5kQ29sb3I6IFwiI2ZmZmYwMFwiIH1cbiAgICAgICAgICAgIC8vIGxldCB0ZXh0ID0gdGhpcy5yb290U2NvcGUuZ2FtZS5hZGQudGV4dChsZWRnZS54LCBsZWRnZS55LCBsZWRnZS5pZCwgc3R5bGUpXG4gICAgICAgICAgICAvLyB0ZXh0LmFscGhhID0gMC4yXG4gICAgICAgIH0pXG4gICAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYXNzaWduICAgICAgICA9IHJlcXVpcmUoJ2VzNS1leHQvb2JqZWN0L2Fzc2lnbicpXG4gICwgbm9ybWFsaXplT3B0cyA9IHJlcXVpcmUoJ2VzNS1leHQvb2JqZWN0L25vcm1hbGl6ZS1vcHRpb25zJylcbiAgLCBpc0NhbGxhYmxlICAgID0gcmVxdWlyZSgnZXM1LWV4dC9vYmplY3QvaXMtY2FsbGFibGUnKVxuICAsIGNvbnRhaW5zICAgICAgPSByZXF1aXJlKCdlczUtZXh0L3N0cmluZy8jL2NvbnRhaW5zJylcblxuICAsIGQ7XG5cbmQgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChkc2NyLCB2YWx1ZS8qLCBvcHRpb25zKi8pIHtcblx0dmFyIGMsIGUsIHcsIG9wdGlvbnMsIGRlc2M7XG5cdGlmICgoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHx8ICh0eXBlb2YgZHNjciAhPT0gJ3N0cmluZycpKSB7XG5cdFx0b3B0aW9ucyA9IHZhbHVlO1xuXHRcdHZhbHVlID0gZHNjcjtcblx0XHRkc2NyID0gbnVsbDtcblx0fSBlbHNlIHtcblx0XHRvcHRpb25zID0gYXJndW1lbnRzWzJdO1xuXHR9XG5cdGlmIChkc2NyID09IG51bGwpIHtcblx0XHRjID0gdyA9IHRydWU7XG5cdFx0ZSA9IGZhbHNlO1xuXHR9IGVsc2Uge1xuXHRcdGMgPSBjb250YWlucy5jYWxsKGRzY3IsICdjJyk7XG5cdFx0ZSA9IGNvbnRhaW5zLmNhbGwoZHNjciwgJ2UnKTtcblx0XHR3ID0gY29udGFpbnMuY2FsbChkc2NyLCAndycpO1xuXHR9XG5cblx0ZGVzYyA9IHsgdmFsdWU6IHZhbHVlLCBjb25maWd1cmFibGU6IGMsIGVudW1lcmFibGU6IGUsIHdyaXRhYmxlOiB3IH07XG5cdHJldHVybiAhb3B0aW9ucyA/IGRlc2MgOiBhc3NpZ24obm9ybWFsaXplT3B0cyhvcHRpb25zKSwgZGVzYyk7XG59O1xuXG5kLmdzID0gZnVuY3Rpb24gKGRzY3IsIGdldCwgc2V0LyosIG9wdGlvbnMqLykge1xuXHR2YXIgYywgZSwgb3B0aW9ucywgZGVzYztcblx0aWYgKHR5cGVvZiBkc2NyICE9PSAnc3RyaW5nJykge1xuXHRcdG9wdGlvbnMgPSBzZXQ7XG5cdFx0c2V0ID0gZ2V0O1xuXHRcdGdldCA9IGRzY3I7XG5cdFx0ZHNjciA9IG51bGw7XG5cdH0gZWxzZSB7XG5cdFx0b3B0aW9ucyA9IGFyZ3VtZW50c1szXTtcblx0fVxuXHRpZiAoZ2V0ID09IG51bGwpIHtcblx0XHRnZXQgPSB1bmRlZmluZWQ7XG5cdH0gZWxzZSBpZiAoIWlzQ2FsbGFibGUoZ2V0KSkge1xuXHRcdG9wdGlvbnMgPSBnZXQ7XG5cdFx0Z2V0ID0gc2V0ID0gdW5kZWZpbmVkO1xuXHR9IGVsc2UgaWYgKHNldCA9PSBudWxsKSB7XG5cdFx0c2V0ID0gdW5kZWZpbmVkO1xuXHR9IGVsc2UgaWYgKCFpc0NhbGxhYmxlKHNldCkpIHtcblx0XHRvcHRpb25zID0gc2V0O1xuXHRcdHNldCA9IHVuZGVmaW5lZDtcblx0fVxuXHRpZiAoZHNjciA9PSBudWxsKSB7XG5cdFx0YyA9IHRydWU7XG5cdFx0ZSA9IGZhbHNlO1xuXHR9IGVsc2Uge1xuXHRcdGMgPSBjb250YWlucy5jYWxsKGRzY3IsICdjJyk7XG5cdFx0ZSA9IGNvbnRhaW5zLmNhbGwoZHNjciwgJ2UnKTtcblx0fVxuXG5cdGRlc2MgPSB7IGdldDogZ2V0LCBzZXQ6IHNldCwgY29uZmlndXJhYmxlOiBjLCBlbnVtZXJhYmxlOiBlIH07XG5cdHJldHVybiAhb3B0aW9ucyA/IGRlc2MgOiBhc3NpZ24obm9ybWFsaXplT3B0cyhvcHRpb25zKSwgZGVzYyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vaXMtaW1wbGVtZW50ZWQnKSgpXG5cdD8gT2JqZWN0LmFzc2lnblxuXHQ6IHJlcXVpcmUoJy4vc2hpbScpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcblx0dmFyIGFzc2lnbiA9IE9iamVjdC5hc3NpZ24sIG9iajtcblx0aWYgKHR5cGVvZiBhc3NpZ24gIT09ICdmdW5jdGlvbicpIHJldHVybiBmYWxzZTtcblx0b2JqID0geyBmb286ICdyYXonIH07XG5cdGFzc2lnbihvYmosIHsgYmFyOiAnZHdhJyB9LCB7IHRyenk6ICd0cnp5JyB9KTtcblx0cmV0dXJuIChvYmouZm9vICsgb2JqLmJhciArIG9iai50cnp5KSA9PT0gJ3JhemR3YXRyenknO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGtleXMgID0gcmVxdWlyZSgnLi4va2V5cycpXG4gICwgdmFsdWUgPSByZXF1aXJlKCcuLi92YWxpZC12YWx1ZScpXG5cbiAgLCBtYXggPSBNYXRoLm1heDtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZGVzdCwgc3JjLyosIOKApnNyY24qLykge1xuXHR2YXIgZXJyb3IsIGksIGwgPSBtYXgoYXJndW1lbnRzLmxlbmd0aCwgMiksIGFzc2lnbjtcblx0ZGVzdCA9IE9iamVjdCh2YWx1ZShkZXN0KSk7XG5cdGFzc2lnbiA9IGZ1bmN0aW9uIChrZXkpIHtcblx0XHR0cnkgeyBkZXN0W2tleV0gPSBzcmNba2V5XTsgfSBjYXRjaCAoZSkge1xuXHRcdFx0aWYgKCFlcnJvcikgZXJyb3IgPSBlO1xuXHRcdH1cblx0fTtcblx0Zm9yIChpID0gMTsgaSA8IGw7ICsraSkge1xuXHRcdHNyYyA9IGFyZ3VtZW50c1tpXTtcblx0XHRrZXlzKHNyYykuZm9yRWFjaChhc3NpZ24pO1xuXHR9XG5cdGlmIChlcnJvciAhPT0gdW5kZWZpbmVkKSB0aHJvdyBlcnJvcjtcblx0cmV0dXJuIGRlc3Q7XG59O1xuIiwiLy8gRGVwcmVjYXRlZFxuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iaiA9PT0gJ2Z1bmN0aW9uJzsgfTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2lzLWltcGxlbWVudGVkJykoKVxuXHQ/IE9iamVjdC5rZXlzXG5cdDogcmVxdWlyZSgnLi9zaGltJyk7XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuXHR0cnkge1xuXHRcdE9iamVjdC5rZXlzKCdwcmltaXRpdmUnKTtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSBjYXRjaCAoZSkgeyByZXR1cm4gZmFsc2U7IH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBrZXlzID0gT2JqZWN0LmtleXM7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9iamVjdCkge1xuXHRyZXR1cm4ga2V5cyhvYmplY3QgPT0gbnVsbCA/IG9iamVjdCA6IE9iamVjdChvYmplY3QpKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBmb3JFYWNoID0gQXJyYXkucHJvdG90eXBlLmZvckVhY2gsIGNyZWF0ZSA9IE9iamVjdC5jcmVhdGU7XG5cbnZhciBwcm9jZXNzID0gZnVuY3Rpb24gKHNyYywgb2JqKSB7XG5cdHZhciBrZXk7XG5cdGZvciAoa2V5IGluIHNyYykgb2JqW2tleV0gPSBzcmNba2V5XTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9wdGlvbnMvKiwg4oCmb3B0aW9ucyovKSB7XG5cdHZhciByZXN1bHQgPSBjcmVhdGUobnVsbCk7XG5cdGZvckVhY2guY2FsbChhcmd1bWVudHMsIGZ1bmN0aW9uIChvcHRpb25zKSB7XG5cdFx0aWYgKG9wdGlvbnMgPT0gbnVsbCkgcmV0dXJuO1xuXHRcdHByb2Nlc3MoT2JqZWN0KG9wdGlvbnMpLCByZXN1bHQpO1xuXHR9KTtcblx0cmV0dXJuIHJlc3VsdDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGZuKSB7XG5cdGlmICh0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHRocm93IG5ldyBUeXBlRXJyb3IoZm4gKyBcIiBpcyBub3QgYSBmdW5jdGlvblwiKTtcblx0cmV0dXJuIGZuO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAodmFsdWUpIHtcblx0aWYgKHZhbHVlID09IG51bGwpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgdXNlIG51bGwgb3IgdW5kZWZpbmVkXCIpO1xuXHRyZXR1cm4gdmFsdWU7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vaXMtaW1wbGVtZW50ZWQnKSgpXG5cdD8gU3RyaW5nLnByb3RvdHlwZS5jb250YWluc1xuXHQ6IHJlcXVpcmUoJy4vc2hpbScpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgc3RyID0gJ3JhemR3YXRyenknO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcblx0aWYgKHR5cGVvZiBzdHIuY29udGFpbnMgIT09ICdmdW5jdGlvbicpIHJldHVybiBmYWxzZTtcblx0cmV0dXJuICgoc3RyLmNvbnRhaW5zKCdkd2EnKSA9PT0gdHJ1ZSkgJiYgKHN0ci5jb250YWlucygnZm9vJykgPT09IGZhbHNlKSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaW5kZXhPZiA9IFN0cmluZy5wcm90b3R5cGUuaW5kZXhPZjtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoc2VhcmNoU3RyaW5nLyosIHBvc2l0aW9uKi8pIHtcblx0cmV0dXJuIGluZGV4T2YuY2FsbCh0aGlzLCBzZWFyY2hTdHJpbmcsIGFyZ3VtZW50c1sxXSkgPiAtMTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBkICAgICAgICA9IHJlcXVpcmUoJ2QnKVxuICAsIGNhbGxhYmxlID0gcmVxdWlyZSgnZXM1LWV4dC9vYmplY3QvdmFsaWQtY2FsbGFibGUnKVxuXG4gICwgYXBwbHkgPSBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHksIGNhbGwgPSBGdW5jdGlvbi5wcm90b3R5cGUuY2FsbFxuICAsIGNyZWF0ZSA9IE9iamVjdC5jcmVhdGUsIGRlZmluZVByb3BlcnR5ID0gT2JqZWN0LmRlZmluZVByb3BlcnR5XG4gICwgZGVmaW5lUHJvcGVydGllcyA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzXG4gICwgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5XG4gICwgZGVzY3JpcHRvciA9IHsgY29uZmlndXJhYmxlOiB0cnVlLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUgfVxuXG4gICwgb24sIG9uY2UsIG9mZiwgZW1pdCwgbWV0aG9kcywgZGVzY3JpcHRvcnMsIGJhc2U7XG5cbm9uID0gZnVuY3Rpb24gKHR5cGUsIGxpc3RlbmVyKSB7XG5cdHZhciBkYXRhO1xuXG5cdGNhbGxhYmxlKGxpc3RlbmVyKTtcblxuXHRpZiAoIWhhc093blByb3BlcnR5LmNhbGwodGhpcywgJ19fZWVfXycpKSB7XG5cdFx0ZGF0YSA9IGRlc2NyaXB0b3IudmFsdWUgPSBjcmVhdGUobnVsbCk7XG5cdFx0ZGVmaW5lUHJvcGVydHkodGhpcywgJ19fZWVfXycsIGRlc2NyaXB0b3IpO1xuXHRcdGRlc2NyaXB0b3IudmFsdWUgPSBudWxsO1xuXHR9IGVsc2Uge1xuXHRcdGRhdGEgPSB0aGlzLl9fZWVfXztcblx0fVxuXHRpZiAoIWRhdGFbdHlwZV0pIGRhdGFbdHlwZV0gPSBsaXN0ZW5lcjtcblx0ZWxzZSBpZiAodHlwZW9mIGRhdGFbdHlwZV0gPT09ICdvYmplY3QnKSBkYXRhW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuXHRlbHNlIGRhdGFbdHlwZV0gPSBbZGF0YVt0eXBlXSwgbGlzdGVuZXJdO1xuXG5cdHJldHVybiB0aGlzO1xufTtcblxub25jZSA9IGZ1bmN0aW9uICh0eXBlLCBsaXN0ZW5lcikge1xuXHR2YXIgb25jZSwgc2VsZjtcblxuXHRjYWxsYWJsZShsaXN0ZW5lcik7XG5cdHNlbGYgPSB0aGlzO1xuXHRvbi5jYWxsKHRoaXMsIHR5cGUsIG9uY2UgPSBmdW5jdGlvbiAoKSB7XG5cdFx0b2ZmLmNhbGwoc2VsZiwgdHlwZSwgb25jZSk7XG5cdFx0YXBwbHkuY2FsbChsaXN0ZW5lciwgdGhpcywgYXJndW1lbnRzKTtcblx0fSk7XG5cblx0b25jZS5fX2VlT25jZUxpc3RlbmVyX18gPSBsaXN0ZW5lcjtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG5vZmYgPSBmdW5jdGlvbiAodHlwZSwgbGlzdGVuZXIpIHtcblx0dmFyIGRhdGEsIGxpc3RlbmVycywgY2FuZGlkYXRlLCBpO1xuXG5cdGNhbGxhYmxlKGxpc3RlbmVyKTtcblxuXHRpZiAoIWhhc093blByb3BlcnR5LmNhbGwodGhpcywgJ19fZWVfXycpKSByZXR1cm4gdGhpcztcblx0ZGF0YSA9IHRoaXMuX19lZV9fO1xuXHRpZiAoIWRhdGFbdHlwZV0pIHJldHVybiB0aGlzO1xuXHRsaXN0ZW5lcnMgPSBkYXRhW3R5cGVdO1xuXG5cdGlmICh0eXBlb2YgbGlzdGVuZXJzID09PSAnb2JqZWN0Jykge1xuXHRcdGZvciAoaSA9IDA7IChjYW5kaWRhdGUgPSBsaXN0ZW5lcnNbaV0pOyArK2kpIHtcblx0XHRcdGlmICgoY2FuZGlkYXRlID09PSBsaXN0ZW5lcikgfHxcblx0XHRcdFx0XHQoY2FuZGlkYXRlLl9fZWVPbmNlTGlzdGVuZXJfXyA9PT0gbGlzdGVuZXIpKSB7XG5cdFx0XHRcdGlmIChsaXN0ZW5lcnMubGVuZ3RoID09PSAyKSBkYXRhW3R5cGVdID0gbGlzdGVuZXJzW2kgPyAwIDogMV07XG5cdFx0XHRcdGVsc2UgbGlzdGVuZXJzLnNwbGljZShpLCAxKTtcblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0aWYgKChsaXN0ZW5lcnMgPT09IGxpc3RlbmVyKSB8fFxuXHRcdFx0XHQobGlzdGVuZXJzLl9fZWVPbmNlTGlzdGVuZXJfXyA9PT0gbGlzdGVuZXIpKSB7XG5cdFx0XHRkZWxldGUgZGF0YVt0eXBlXTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gdGhpcztcbn07XG5cbmVtaXQgPSBmdW5jdGlvbiAodHlwZSkge1xuXHR2YXIgaSwgbCwgbGlzdGVuZXIsIGxpc3RlbmVycywgYXJncztcblxuXHRpZiAoIWhhc093blByb3BlcnR5LmNhbGwodGhpcywgJ19fZWVfXycpKSByZXR1cm47XG5cdGxpc3RlbmVycyA9IHRoaXMuX19lZV9fW3R5cGVdO1xuXHRpZiAoIWxpc3RlbmVycykgcmV0dXJuO1xuXG5cdGlmICh0eXBlb2YgbGlzdGVuZXJzID09PSAnb2JqZWN0Jykge1xuXHRcdGwgPSBhcmd1bWVudHMubGVuZ3RoO1xuXHRcdGFyZ3MgPSBuZXcgQXJyYXkobCAtIDEpO1xuXHRcdGZvciAoaSA9IDE7IGkgPCBsOyArK2kpIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuXG5cdFx0bGlzdGVuZXJzID0gbGlzdGVuZXJzLnNsaWNlKCk7XG5cdFx0Zm9yIChpID0gMDsgKGxpc3RlbmVyID0gbGlzdGVuZXJzW2ldKTsgKytpKSB7XG5cdFx0XHRhcHBseS5jYWxsKGxpc3RlbmVyLCB0aGlzLCBhcmdzKTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0c3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG5cdFx0Y2FzZSAxOlxuXHRcdFx0Y2FsbC5jYWxsKGxpc3RlbmVycywgdGhpcyk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIDI6XG5cdFx0XHRjYWxsLmNhbGwobGlzdGVuZXJzLCB0aGlzLCBhcmd1bWVudHNbMV0pO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAzOlxuXHRcdFx0Y2FsbC5jYWxsKGxpc3RlbmVycywgdGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuXHRcdFx0YnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdGwgPSBhcmd1bWVudHMubGVuZ3RoO1xuXHRcdFx0YXJncyA9IG5ldyBBcnJheShsIC0gMSk7XG5cdFx0XHRmb3IgKGkgPSAxOyBpIDwgbDsgKytpKSB7XG5cdFx0XHRcdGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuXHRcdFx0fVxuXHRcdFx0YXBwbHkuY2FsbChsaXN0ZW5lcnMsIHRoaXMsIGFyZ3MpO1xuXHRcdH1cblx0fVxufTtcblxubWV0aG9kcyA9IHtcblx0b246IG9uLFxuXHRvbmNlOiBvbmNlLFxuXHRvZmY6IG9mZixcblx0ZW1pdDogZW1pdFxufTtcblxuZGVzY3JpcHRvcnMgPSB7XG5cdG9uOiBkKG9uKSxcblx0b25jZTogZChvbmNlKSxcblx0b2ZmOiBkKG9mZiksXG5cdGVtaXQ6IGQoZW1pdClcbn07XG5cbmJhc2UgPSBkZWZpbmVQcm9wZXJ0aWVzKHt9LCBkZXNjcmlwdG9ycyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IGZ1bmN0aW9uIChvKSB7XG5cdHJldHVybiAobyA9PSBudWxsKSA/IGNyZWF0ZShiYXNlKSA6IGRlZmluZVByb3BlcnRpZXMoT2JqZWN0KG8pLCBkZXNjcmlwdG9ycyk7XG59O1xuZXhwb3J0cy5tZXRob2RzID0gbWV0aG9kcztcbiJdfQ==
