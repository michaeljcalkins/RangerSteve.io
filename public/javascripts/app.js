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

    this.volume = _GameConsts2.default.STARTING_VOLUME;
    this.socket = io.connect();
    this.enemies = this.game.add.group();
    this.enemyBullets = this.game.add.group();
    // this.enemyBullets.enableBody = true
    // this.enemyBullets.physicsBodyType = Phaser.Physics.ARCADE

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
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = CollisionHandler;
function CollisionHandler() {
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
    // this.physics.arcade.collide(this.player, this.enemyBullets, null, (player, bullet) => {
    //     bullet.kill()
    //
    //     console.log('You were hit by', bullet.bulletId)
    //     this.socket.emit('bullet removed', {
    //         roomId: this.roomId,
    //         bulletId: bullet.bulletId
    //     })
    //
    //     this.socket.emit('player damaged', {
    //         roomId: this.roomId,
    //         damage: bullet.damage,
    //         damagedPlayerId: '/#' + this.socket.id,
    //         attackingPlayerId: bullet.playerId
    //     })
    //
    //     return false
    // }, this)
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
        bulletSpeed: this.bulletSpeed,
        height: bullet.height,
        width: bullet.width,
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
    var enemyBullet = this.game.add.sprite(data.x, data.y, 'bullet12');
    enemyBullet.bulletId = data.bulletId;
    enemyBullet.playerId = data.playerId;
    enemyBullet.damage = data.damage;
    enemyBullet.rotation = data.pointerAngle;
    enemyBullet.height = data.height;
    enemyBullet.width = data.width;
    enemyBullet.physicsBodyType = Phaser.Physics.ARCADE;
    this.game.physics.enable(enemyBullet, Phaser.Physics.ARCADE);
    enemyBullet.body.gravity.y = -1800;
    enemyBullet.x = data.x;
    enemyBullet.y = data.y;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvYXBwLmpzIiwiYXNzZXRzL2pzL2NvcmUvQ3JlYXRlLmpzIiwiYXNzZXRzL2pzL2NvcmUvSW5pdC5qcyIsImFzc2V0cy9qcy9jb3JlL1ByZWxvYWQuanMiLCJhc3NldHMvanMvY29yZS9VcGRhdGUuanMiLCJhc3NldHMvanMvZ2FtZS5qcyIsImFzc2V0cy9qcy9saWIvQ29sbGlzaW9uSGFuZGxlci5qcyIsImFzc2V0cy9qcy9saWIvRXZlbnRIYW5kbGVyLmpzIiwiYXNzZXRzL2pzL2xpYi9GaXJlUm9ja2V0LmpzIiwiYXNzZXRzL2pzL2xpYi9GaXJlU2hvdGd1blNoZWxsLmpzIiwiYXNzZXRzL2pzL2xpYi9GaXJlU3RhbmRhcmRCdWxsZXQuanMiLCJhc3NldHMvanMvbGliL0dhbWVDb25zdHMuanMiLCJhc3NldHMvanMvbGliL0dldFF1ZXJ5U3RyaW5nLmpzIiwiYXNzZXRzL2pzL2xpYi9HdWlkLmpzIiwiYXNzZXRzL2pzL2xpYi9JbnB1dEhlbHBlcnMuanMiLCJhc3NldHMvanMvbGliL1BsYXllckFuZ2xlSGFuZGxlci5qcyIsImFzc2V0cy9qcy9saWIvUGxheWVyQnlJZC5qcyIsImFzc2V0cy9qcy9saWIvUGxheWVyRmFjZUhhbmRsZXIuanMiLCJhc3NldHMvanMvbGliL1BsYXllckp1bXBIYW5kbGVyLmpzIiwiYXNzZXRzL2pzL2xpYi9QbGF5ZXJNb3ZlbWVudEhhbmRsZXIuanMiLCJhc3NldHMvanMvbGliL1JlbW90ZUJ1bGxldC5qcyIsImFzc2V0cy9qcy9saWIvUmVtb3RlUGxheWVyLmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvU2V0RXZlbnRIYW5kbGVycy5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL29uQnVsbGV0RmlyZWQuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vbkJ1bGxldFJlbW92ZWQuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vbk1vdmVQbGF5ZXIuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vblBsYXllckRhbWFnZWQuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vblBsYXllckhlYWx0aFVwZGF0ZS5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL29uUGxheWVyUmVzcGF3bi5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL29uUmVtb3ZlUGxheWVyLmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvb25Tb2NrZXRDb25uZWN0ZWQuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vblNvY2tldERpc2Nvbm5lY3QuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vblVwZGF0ZVBsYXllcnMuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvQUs0Ny5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9BVUcuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvQmFycmV0dC5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9EZXNlcnRFYWdsZS5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9HNDMuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvTTRBMS5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9NNTAwLmpzIiwiYXNzZXRzL2pzL2xpYi9XZWFwb25zL1A5MC5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9SUEcuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvU2tvcnBpb24uanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvaW5kZXguanMiLCJhc3NldHMvanMvbWFwcy9IaWdoUnVsZUp1bmdsZS5qcyIsIm5vZGVfbW9kdWxlcy9kL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2VzNS1leHQvb2JqZWN0L2Fzc2lnbi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L29iamVjdC9hc3NpZ24vaXMtaW1wbGVtZW50ZWQuanMiLCJub2RlX21vZHVsZXMvZXM1LWV4dC9vYmplY3QvYXNzaWduL3NoaW0uanMiLCJub2RlX21vZHVsZXMvZXM1LWV4dC9vYmplY3QvaXMtY2FsbGFibGUuanMiLCJub2RlX21vZHVsZXMvZXM1LWV4dC9vYmplY3Qva2V5cy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L29iamVjdC9rZXlzL2lzLWltcGxlbWVudGVkLmpzIiwibm9kZV9tb2R1bGVzL2VzNS1leHQvb2JqZWN0L2tleXMvc2hpbS5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L29iamVjdC9ub3JtYWxpemUtb3B0aW9ucy5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L29iamVjdC92YWxpZC1jYWxsYWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L29iamVjdC92YWxpZC12YWx1ZS5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L3N0cmluZy8jL2NvbnRhaW5zL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2VzNS1leHQvc3RyaW5nLyMvY29udGFpbnMvaXMtaW1wbGVtZW50ZWQuanMiLCJub2RlX21vZHVsZXMvZXM1LWV4dC9zdHJpbmcvIy9jb250YWlucy9zaGltLmpzIiwibm9kZV9tb2R1bGVzL2V2ZW50LWVtaXR0ZXIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLE9BQU8sT0FBUCxHQUFpQjtBQUNiLGlCQUFhLEtBQWI7QUFDQSxXQUFPLEtBQVA7QUFDQSxpQkFBYSxLQUFiO0FBQ0EsaUJBQWEsS0FBYjtBQUNBLG1CQUFlLGtCQUFmO0FBQ0EsdUJBQW1CLEtBQW5CO0FBQ0EsYUFBUyxJQUFUO0FBQ0Esa0JBQWMsR0FBZDtBQUNBLGtCQUFjLElBQWQ7QUFDQSxhQUFTLElBQVQ7QUFDQSxxQkFBaUIsSUFBakI7QUFDQSxnQkFBWSxPQUFaO0FBQ0EsZ0JBQVksUUFBWjtBQUNBLGdCQUFZLFFBQVo7QUFDQSxnQkFBWSxTQUFaO0NBZko7OztBQW1CQSxRQUFRLFFBQVI7Ozs7Ozs7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QUFGLENBQUo7QUFDQSxPQUFNLEVBQUUsTUFBRixDQUFOO0FBQ0EsTUFBSyxFQUFFLEdBQUYsQ0FBTDtBQUNBLE9BQU0sRUFBRSxJQUFGLENBQU47Q0FKRDs7QUFPQSxPQUFPLGlCQUFpQixFQUFqQixFQUFxQixXQUFyQixDQUFQOztBQUVBLE9BQU8sT0FBUCxHQUFpQixVQUFVLGlCQUFVLENBQVYsRUFBYTtBQUN2QyxRQUFPLENBQUMsSUFBSyxJQUFMLEdBQWEsT0FBTyxJQUFQLENBQWQsR0FBNkIsaUJBQWlCLE9BQU8sQ0FBUCxDQUFqQixFQUE0QixXQUE1QixDQUE3QixDQURnQztDQUFiO0FBRzNCLFFBQVEsT0FBUixHQUFrQixPQUFsQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ0b2FzdHIub3B0aW9ucyA9IHtcbiAgICBjbG9zZUJ1dHRvbjogZmFsc2UsXG4gICAgZGVidWc6IGZhbHNlLFxuICAgIG5ld2VzdE9uVG9wOiBmYWxzZSxcbiAgICBwcm9ncmVzc0JhcjogZmFsc2UsXG4gICAgcG9zaXRpb25DbGFzczogJ3RvYXN0LXRvcC1jZW50ZXInLFxuICAgIHByZXZlbnREdXBsaWNhdGVzOiBmYWxzZSxcbiAgICBvbmNsaWNrOiBudWxsLFxuICAgIHNob3dEdXJhdGlvbjogMzAwLFxuICAgIGhpZGVEdXJhdGlvbjogMTAwMCxcbiAgICB0aW1lT3V0OiAzMDAwLFxuICAgIGV4dGVuZGVkVGltZU91dDogMTAwMCxcbiAgICBzaG93RWFzaW5nOiAnc3dpbmcnLFxuICAgIGhpZGVFYXNpbmc6ICdsaW5lYXInLFxuICAgIHNob3dNZXRob2Q6ICdmYWRlSW4nLFxuICAgIGhpZGVNZXRob2Q6ICdmYWRlT3V0J1xufVxuXG4vLyByZXF1aXJlKCcuL3VpJylcbnJlcXVpcmUoJy4vZ2FtZScpXG4iLCJpbXBvcnQgR2FtZUNvbnN0cyBmcm9tICcuLi9saWIvR2FtZUNvbnN0cydcbmltcG9ydCBTZXRFdmVudEhhbmRsZXJzIGZyb20gJy4uL2xpYi9Tb2NrZXRFdmVudHMvU2V0RXZlbnRIYW5kbGVycydcbmltcG9ydCBFdmVudEhhbmRsZXIgZnJvbSAnLi4vbGliL0V2ZW50SGFuZGxlcidcbmltcG9ydCBIaWdoUnVsZUp1bmdsZSBmcm9tICcuLi9tYXBzL0hpZ2hSdWxlSnVuZ2xlJ1xuaW1wb3J0IFdlYXBvbnMgZnJvbSAnLi4vbGliL1dlYXBvbnMnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIENyZWF0ZSgpIHtcbiAgICB0aGlzLnZvbHVtZSA9IEdhbWVDb25zdHMuU1RBUlRJTkdfVk9MVU1FXG4gICAgdGhpcy5zb2NrZXQgPSBpby5jb25uZWN0KClcbiAgICB0aGlzLmVuZW1pZXMgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKClcbiAgICB0aGlzLmVuZW15QnVsbGV0cyA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKVxuICAgIC8vIHRoaXMuZW5lbXlCdWxsZXRzLmVuYWJsZUJvZHkgPSB0cnVlXG4gICAgLy8gdGhpcy5lbmVteUJ1bGxldHMucGh5c2ljc0JvZHlUeXBlID0gUGhhc2VyLlBoeXNpY3MuQVJDQURFXG5cbiAgICAvLyAgV2UncmUgZ29pbmcgdG8gYmUgdXNpbmcgcGh5c2ljcywgc28gZW5hYmxlIHRoZSBBcmNhZGUgUGh5c2ljcyBzeXN0ZW1cbiAgICB0aGlzLnBoeXNpY3Muc3RhcnRTeXN0ZW0oUGhhc2VyLlBoeXNpY3MuQVJDQURFKVxuXG4gICAgdGhpcy53b3JsZC5zZXRCb3VuZHMoMCwgMCwgR2FtZUNvbnN0cy5XT1JMRF9XSURUSCwgR2FtZUNvbnN0cy5XT1JMRF9IRUlHSFQpXG5cbiAgICAvLyBTY2FsZSBnYW1lIG9uIHdpbmRvdyByZXNpemVcbiAgICB0aGlzLmdhbWUuc2NhbGUuc2NhbGVNb2RlID0gUGhhc2VyLlNjYWxlTWFuYWdlci5SRVNJWkVcbiAgICB0aGlzLmdhbWUuc2NhbGUuc2V0U2hvd0FsbCgpXG4gICAgdGhpcy5nYW1lLnNjYWxlLnJlZnJlc2goKVxuXG5cbiAgICAvKipcbiAgICAgKiBNYXBcbiAgICAgKi9cbiAgICB0aGlzLm1hcEluc3RhbmNlID0gbmV3IEhpZ2hSdWxlSnVuZ2xlKHRoaXMpXG4gICAgdGhpcy5tYXBJbnN0YW5jZS5jcmVhdGUoKVxuXG5cbiAgICAvKipcbiAgICAgKiBCdWxsZXQgU2V0dGluZ3NcbiAgICAgKi9cbiAgICB0aGlzLmJ1bGxldHMgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKClcbiAgICB0aGlzLmJ1bGxldHMuZW5hYmxlQm9keSA9IHRydWVcbiAgICB0aGlzLnBoeXNpY3NCb2R5VHlwZSA9IFBoYXNlci5QaHlzaWNzLkFSQ0FERVxuICAgIHRoaXMuYnVsbGV0cy5jcmVhdGVNdWx0aXBsZSg1MCwgJ2J1bGxldDEyJylcbiAgICB0aGlzLmJ1bGxldHMuc2V0QWxsKCdjaGVja1dvcmxkQm91bmRzJywgdHJ1ZSlcbiAgICB0aGlzLmJ1bGxldHMuc2V0QWxsKCdvdXRPZkJvdW5kc0tpbGwnLCB0cnVlKVxuXG5cbiAgICAvKipcbiAgICAgKiBQbGF5ZXIgU2V0dGluZ3NcbiAgICAgKi9cbiAgICBsZXQgc3Bhd25Qb2ludCA9IHRoaXMubWFwSW5zdGFuY2UuZ2V0UmFuZG9tU3Bhd25Qb2ludCgpXG4gICAgdGhpcy5wbGF5ZXIgPSB0aGlzLmFkZC5zcHJpdGUoc3Bhd25Qb2ludC54LCBzcGF3blBvaW50LnksICdjb21tYW5kbycpXG4gICAgdGhpcy5wbGF5ZXIuc2NhbGUuc2V0VG8oR2FtZUNvbnN0cy5QTEFZRVJfU0NBTEUpXG4gICAgdGhpcy5wbGF5ZXIuYW5jaG9yLnNldFRvKEdhbWVDb25zdHMuUExBWUVSX0FOQ0hPUilcblxuICAgIC8vICBXZSBuZWVkIHRvIGVuYWJsZSBwaHlzaWNzIG9uIHRoZSBwbGF5ZXJcbiAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmVuYWJsZSh0aGlzLnBsYXllcilcblxuICAgIC8vIEVuYWJsZSBwaHlzaWNzIG9uIHRoZSBwbGF5ZXJcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5lbmFibGUodGhpcy5wbGF5ZXIsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSlcblxuICAgIC8vIE1ha2UgcGxheWVyIGNvbGxpZGUgd2l0aCB3b3JsZCBib3VuZGFyaWVzIHNvIGhlIGRvZXNuJ3QgbGVhdmUgdGhlIHN0YWdlXG4gICAgdGhpcy5wbGF5ZXIuYm9keS5jb2xsaWRlV29ybGRCb3VuZHMgPSB0cnVlXG5cbiAgICAvLyBTZXQgcGxheWVyIG1pbmltdW0gYW5kIG1heGltdW0gbW92ZW1lbnQgc3BlZWRcbiAgICB0aGlzLnBsYXllci5ib2R5Lm1heFZlbG9jaXR5LnNldFRvKEdhbWVDb25zdHMuTUFYX1NQRUVELCBHYW1lQ29uc3RzLk1BWF9TUEVFRCAqIDEwKSAvLyB4LCB5XG5cbiAgICAvLyBBZGQgZHJhZyB0byB0aGUgcGxheWVyIHRoYXQgc2xvd3MgdGhlbSBkb3duIHdoZW4gdGhleSBhcmUgbm90IGFjY2VsZXJhdGluZ1xuICAgIHRoaXMucGxheWVyLmJvZHkuZHJhZy5zZXRUbyhHYW1lQ29uc3RzLkRSQUcsIDApIC8vIHgsIHlcbiAgICB0aGlzLnBsYXllci5ib2R5LnNldFNpemUoMjMwLCAyOTAsIC0xMCwgMClcbiAgICB0aGlzLnBsYXllci5tZXRhID0ge1xuICAgICAgICBoZWFsdGg6IDEwMFxuICAgIH1cblxuICAgIC8vIFNpbmNlIHdlJ3JlIGp1bXBpbmcgd2UgbmVlZCBncmF2aXR5XG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmdyYXZpdHkueSA9IEdhbWVDb25zdHMuR1JBVklUWVxuXG4gICAgLy8gRmxhZyB0byB0cmFjayBpZiB0aGUganVtcCBidXR0b24gaXMgcHJlc3NlZFxuICAgIHRoaXMuanVtcGluZyA9IGZhbHNlXG5cbiAgICAvLyAgT3VyIHR3byBhbmltYXRpb25zLCB3YWxraW5nIGxlZnQgYW5kIHJpZ2h0LlxuICAgIHRoaXMucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdsZWZ0JywgR2FtZUNvbnN0cy5BTklNQVRJT05fTEVGVCwgR2FtZUNvbnN0cy5BTklNQVRJT05fRlJBTUVSQVRFLCB0cnVlKVxuICAgIHRoaXMucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdyaWdodCcsIEdhbWVDb25zdHMuQU5JTUFUSU9OX1JJR0hULCBHYW1lQ29uc3RzLkFOSU1BVElPTl9GUkFNRVJBVEUsIHRydWUpXG5cbiAgICB0aGlzLnBsYXllci5tZXRhID0ge1xuICAgICAgICBoZWFsdGg6IDEwMCxcbiAgICAgICAgcHJpbWFyeVdlYXBvbjogbmV3IFdlYXBvbnMuQUs0Nyh0aGlzKSxcbiAgICAgICAgc2Vjb25kYXJ5V2VhcG9uOiBuZXcgV2VhcG9ucy5EZXNlcnRFYWdsZSh0aGlzKSxcbiAgICAgICAgc2VsZWN0ZWRQcmltYXJ5V2VhcG9uSWQ6ICdBSzQ3JyxcbiAgICAgICAgc2VsZWN0ZWRTZWNvbmRhcnlXZWFwb25JZDogJ0Rlc2VydEVhZ2xlJ1xuICAgIH1cblxuICAgIHRoaXMucGxheWVyLm1ldGEucHJpbWFyeVdlYXBvbi5pZCA9ICdBSzQ3J1xuICAgIHRoaXMucGxheWVyLm1ldGEuc2Vjb25kYXJ5V2VhcG9uLmlkID0gJ0Rlc2VydEVhZ2xlJ1xuXG4gICAgdGhpcy5sZWZ0QXJtR3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKClcbiAgICB0aGlzLnJpZ2h0QXJtR3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKClcbiAgICB0aGlzLmhlYWRHcm91cCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKVxuICAgIHRoaXMudG9yc29Hcm91cCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKVxuXG4gICAgLy8gVG9yc29cbiAgICB0aGlzLnRvcnNvU3ByaXRlID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUoLTM3LCAtMTA1LCAndG9yc28nKVxuICAgIHRoaXMudG9yc29TcHJpdGUuc2NhbGUuc2V0VG8oMS44KVxuICAgIHRoaXMudG9yc29Hcm91cC5hZGQodGhpcy50b3Jzb1Nwcml0ZSlcblxuICAgIC8vIEhlYWRcbiAgICB0aGlzLmhlYWRTcHJpdGUgPSB0aGlzLmdhbWUuYWRkLnNwcml0ZSgwLCAtMTQ4LCAnaGVhZCcpXG4gICAgdGhpcy5oZWFkU3ByaXRlLnNjYWxlLnNldFRvKDEuOClcbiAgICB0aGlzLmhlYWRHcm91cC5hZGQodGhpcy5oZWFkU3ByaXRlKVxuXG4gICAgLy8gTGVmdCBhcm1cbiAgICB0aGlzLmxlZnRBcm1TcHJpdGUgPSB0aGlzLmdhbWUuYWRkLnNwcml0ZSgwLCAwLCAnbGVmdC1hcm0nKVxuICAgIHRoaXMubGVmdEFybVNwcml0ZS5hbmNob3Iuc2V0VG8oLjIsIC4yKVxuICAgIHRoaXMubGVmdEFybVNwcml0ZS5zY2FsZS5zZXRUbygxLjYpXG4gICAgdGhpcy5sZWZ0QXJtU3ByaXRlLnJvdGF0aW9uID0gODAuMVxuICAgIHRoaXMubGVmdEFybUdyb3VwLmFkZCh0aGlzLmxlZnRBcm1TcHJpdGUpXG5cbiAgICAvLyBHdW5cbiAgICB0aGlzLmFrNDdTcHJpdGUgPSB0aGlzLmdhbWUuYWRkLnNwcml0ZSgxMiwgMTksICdBSzQ3JylcbiAgICB0aGlzLmFrNDdTcHJpdGUuc2NhbGUuc2V0VG8oMS4zKVxuICAgIHRoaXMuYWs0N1Nwcml0ZS5yb3RhdGlvbiA9IDgwLjE1XG5cbiAgICAvLyBSaWdodCBhcm1cbiAgICB0aGlzLnJpZ2h0QXJtR3JvdXAuYWRkKHRoaXMuYWs0N1Nwcml0ZSlcbiAgICB0aGlzLnJpZ2h0QXJtU3ByaXRlID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUoMCwgMCwgJ3JpZ2h0LWFybScpXG4gICAgdGhpcy5yaWdodEFybVNwcml0ZS5hbmNob3Iuc2V0VG8oLjIsIC4yNClcbiAgICB0aGlzLnJpZ2h0QXJtU3ByaXRlLnNjYWxlLnNldFRvKDEuNylcbiAgICB0aGlzLnJpZ2h0QXJtU3ByaXRlLnJvdGF0aW9uID0gODAuMVxuICAgIHRoaXMucmlnaHRBcm1Hcm91cC5hZGQodGhpcy5yaWdodEFybVNwcml0ZSlcblxuICAgIHRoaXMucGxheWVyLmFkZENoaWxkKHRoaXMubGVmdEFybUdyb3VwKVxuICAgIHRoaXMubGVmdEFybUdyb3VwLnBpdm90LnggPSAwXG4gICAgdGhpcy5sZWZ0QXJtR3JvdXAucGl2b3QueSA9IDBcbiAgICB0aGlzLmxlZnRBcm1Hcm91cC54ID0gNDVcbiAgICB0aGlzLmxlZnRBcm1Hcm91cC55ID0gLTcwXG5cbiAgICB0aGlzLnBsYXllci5hZGRDaGlsZCh0aGlzLnRvcnNvR3JvdXApXG4gICAgdGhpcy5wbGF5ZXIuYWRkQ2hpbGQodGhpcy5oZWFkR3JvdXApXG5cbiAgICB0aGlzLnBsYXllci5hZGRDaGlsZCh0aGlzLnJpZ2h0QXJtR3JvdXApXG4gICAgdGhpcy5yaWdodEFybUdyb3VwLnBpdm90LnggPSAwXG4gICAgdGhpcy5yaWdodEFybUdyb3VwLnBpdm90LnkgPSAwXG4gICAgdGhpcy5yaWdodEFybUdyb3VwLnggPSAtMjVcbiAgICB0aGlzLnJpZ2h0QXJtR3JvdXAueSA9IC02NVxuXG5cbiAgICAvKipcbiAgICAgKiBXZWFwb25zXG4gICAgICovXG4gICAgdGhpcy5jdXJyZW50V2VhcG9uID0gJ3ByaW1hcnlXZWFwb24nXG5cblxuICAgIC8qKlxuICAgICAqIFRleHRcbiAgICAgKi9cbiAgICBsZXQgdGV4dFN0eWxlcyA9IHsgZm9udFNpemU6ICcxNHB4JywgZmlsbDogJyMwMDAnIH1cblxuICAgIEV2ZW50SGFuZGxlci5lbWl0KCdzY29yZSB1cGRhdGUnLCAnJylcbiAgICBFdmVudEhhbmRsZXIuZW1pdCgnaGVhbHRoIHVwZGF0ZScsICcnKVxuICAgIEV2ZW50SGFuZGxlci5vbigndm9sdW1lIHVwZGF0ZScsIChkYXRhKSA9PiB7XG4gICAgICAgIHRoaXMudm9sdW1lID0gZGF0YS52b2x1bWVcbiAgICB9KVxuXG4gICAgRXZlbnRIYW5kbGVyLm9uKCdwcmltYXJ5IHdlYXBvbiB1cGRhdGUnLCAod2VhcG9uKSA9PiB7XG4gICAgICAgIHRoaXMucGxheWVyLm1ldGEuc2VsZWN0ZWRQcmltYXJ5V2VhcG9uSWQgPSB3ZWFwb24uaWRcbiAgICB9KVxuXG4gICAgRXZlbnRIYW5kbGVyLm9uKCdzZWNvbmRhcnkgd2VhcG9uIHVwZGF0ZScsICh3ZWFwb24pID0+IHtcbiAgICAgICAgdGhpcy5wbGF5ZXIubWV0YS5zZWxlY3RlZFNlY29uZGFyeVdlYXBvbklkID0gd2VhcG9uLmlkXG4gICAgfSlcblxuICAgIHRoaXMucG9zaXRpb25UZXh0ID0gdGhpcy5hZGQudGV4dCgyNSwgMjUsIGAke3RoaXMuZ2FtZS5pbnB1dC5tb3VzZVBvaW50ZXIueH0sJHt0aGlzLmdhbWUuaW5wdXQubW91c2VQb2ludGVyLnl9YCwgdGV4dFN0eWxlcylcbiAgICB0aGlzLnBvc2l0aW9uVGV4dC5maXhlZFRvQ2FtZXJhID0gdHJ1ZVxuXG5cbiAgICAvKipcbiAgICAgKiBDYW1lcmEgU2V0dGluZ3NcbiAgICAgKi9cbiAgICB0aGlzLmNhbWVyYS5mb2xsb3codGhpcy5wbGF5ZXIpXG5cblxuICAgIC8qKlxuICAgICAqIFJlc2l6aW5nIEV2ZW50c1xuICAgICAqL1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuZ2FtZS5zY2FsZS5yZWZyZXNoKClcbiAgICAgICAgdGhpcy5nYW1lLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodFxuICAgICAgICB0aGlzLmdhbWUud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aFxuICAgIH0pXG5cblxuICAgIC8qKlxuICAgICAqIEtleWJvYXJkIEV2ZW50c1xuICAgICAqL1xuICAgIC8vIE9wZW4gc2V0dGluZ3MgbW9kYWxcbiAgICB0aGlzLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuVEFCKS5vbkRvd24uYWRkKGZ1bmN0aW9uKCkge1xuICAgICAgICBFdmVudEhhbmRsZXIuZW1pdCgnc2V0dGluZ3Mgb3BlbicpXG4gICAgfSlcblxuICAgIC8vIFN3aXRjaCB3ZWFwb25zXG4gICAgdGhpcy5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLlEpLm9uRG93bi5hZGQoKCkgPT4ge1xuICAgICAgICB0aGlzLmN1cnJlbnRXZWFwb24gPSB0aGlzLmN1cnJlbnRXZWFwb24gPT09ICdwcmltYXJ5V2VhcG9uJ1xuICAgICAgICAgICAgPyAnc2Vjb25kYXJ5V2VhcG9uJ1xuICAgICAgICAgICAgOiAncHJpbWFyeVdlYXBvbidcbiAgICAgICAgdGhpcy5hazQ3U3ByaXRlLmxvYWRUZXh0dXJlKHRoaXMucGxheWVyLm1ldGFbdGhpcy5jdXJyZW50V2VhcG9uXS5pZClcbiAgICB9KVxuXG5cbiAgICAvKipcbiAgICAgKiBTdGFydCBsaXN0ZW5pbmcgZm9yIGV2ZW50c1xuICAgICAqL1xuICAgIFNldEV2ZW50SGFuZGxlcnMuY2FsbCh0aGlzKVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gSW5pdCgpIHtcbiAgICB0aGlzLmdhbWUucmVuZGVyZXIucmVuZGVyU2Vzc2lvbi5yb3VuZFBpeGVscyA9IHRydWVcbiAgICB0aGlzLmdhbWUuc3RhZ2UuZGlzYWJsZVZpc2liaWxpdHlDaGFuZ2UgPSB0cnVlXG59XG4iLCJpbXBvcnQgR2FtZUNvbnN0cyBmcm9tICcuLi9saWIvR2FtZUNvbnN0cydcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gUHJlbG9hZCgpIHtcbiAgICB0aGlzLmxvYWQuaW1hZ2UoJ21hcC1iZycsICcvaW1hZ2VzL2hpZ2gtcnVsZS1kZXNlcnQucG5nJylcbiAgICB0aGlzLmxvYWQuaW1hZ2UoJ2dyb3VuZCcsICcvaW1hZ2VzL3BsYXRmb3JtLnBuZycpXG4gICAgdGhpcy5sb2FkLmltYWdlKCdidWxsZXQxMicsICcvaW1hZ2VzL2J1bGxldC5wbmcnKVxuXG4gICAgdGhpcy5sb2FkLnNwcml0ZXNoZWV0KCdkdWRlJywgJy9pbWFnZXMvZHVkZS5wbmcnLCAzMiwgNDgpXG4gICAgdGhpcy5sb2FkLnNwcml0ZXNoZWV0KCdjb21tYW5kbycsICcvaW1hZ2VzL2NvbW1hbmRvLnBuZycsIDMwMCwgMzE1KVxuICAgIHRoaXMubG9hZC5zcHJpdGVzaGVldCgnZW5lbXknLCAnL2ltYWdlcy9kdWRlLnBuZycsIDMyLCA0OClcblxuICAgIC8vIFdlYXBvbnNcbiAgICBHYW1lQ29uc3RzLlBSSU1BUllfV0VBUE9OUy5mb3JFYWNoKCh3ZWFwb24pID0+IHtcbiAgICAgICAgdGhpcy5sb2FkLmltYWdlKHdlYXBvbi5pZCwgd2VhcG9uLmltYWdlKVxuICAgIH0pXG5cbiAgICBHYW1lQ29uc3RzLlNFQ09OREFSWV9XRUFQT05TLmZvckVhY2goKHdlYXBvbikgPT4ge1xuICAgICAgICB0aGlzLmxvYWQuaW1hZ2Uod2VhcG9uLmlkLCB3ZWFwb24uaW1hZ2UpXG4gICAgfSlcblxuICAgIHRoaXMubG9hZC5pbWFnZSgncmlnaHQtYXJtJywgJy9pbWFnZXMvYm9keS9yaWdodC1hcm0ucG5nJylcbiAgICB0aGlzLmxvYWQuaW1hZ2UoJ2xlZnQtYXJtJywgJy9pbWFnZXMvYm9keS9sZWZ0LWFybS5wbmcnKVxuICAgIHRoaXMubG9hZC5pbWFnZSgnaGVhZCcsICcvaW1hZ2VzL2JvZHkvaGVhZC5wbmcnKVxuICAgIHRoaXMubG9hZC5pbWFnZSgndG9yc28nLCAnL2ltYWdlcy9ib2R5L3RvcnNvLnBuZycpXG5cbiAgICB0aGlzLmxvYWQuYXVkaW8oJ0FLNDctc291bmQnLCAnL2F1ZGlvL0FLNDcub2dnJylcbiAgICB0aGlzLmxvYWQuYXVkaW8oJ001MDAtc291bmQnLCAnL2F1ZGlvL001MDAub2dnJylcbiAgICB0aGlzLmxvYWQuYXVkaW8oJ1Nrb3JwaW9uLXNvdW5kJywgJy9hdWRpby9Ta29ycGlvbi5vZ2cnKVxuICAgIHRoaXMubG9hZC5hdWRpbygnQVVHLXNvdW5kJywgJy9hdWRpby9BVUcub2dnJylcbiAgICB0aGlzLmxvYWQuYXVkaW8oJ0c0My1zb3VuZCcsICcvYXVkaW8vRzQzLm9nZycpXG4gICAgdGhpcy5sb2FkLmF1ZGlvKCdQOTAtc291bmQnLCAnL2F1ZGlvL1A5MC5vZ2cnKVxuICAgIHRoaXMubG9hZC5hdWRpbygnTTRBMS1zb3VuZCcsICcvYXVkaW8vTTRBMS5vZ2cnKVxuICAgIHRoaXMubG9hZC5hdWRpbygnQmFycmV0TTkwLXNvdW5kJywgJy9hdWRpby9CYXJyZXRNOTAub2dnJylcblxuICAgIHRoaXMubG9hZC5hdWRpbygnRGVzZXJ0RWFnbGUtc291bmQnLCAnL2F1ZGlvL0Rlc2VydEVhZ2xlLm9nZycpXG4gICAgdGhpcy5sb2FkLmF1ZGlvKCdSUEctc291bmQnLCAnL2F1ZGlvL1JQRy5vZ2cnKVxufVxuIiwiaW1wb3J0IENvbGxpc2lvbkhhbmRsZXIgZnJvbSAnLi4vbGliL0NvbGxpc2lvbkhhbmRsZXInXG5pbXBvcnQgUGxheWVyTW92ZW1lbnRIYW5kbGVyIGZyb20gJy4uL2xpYi9QbGF5ZXJNb3ZlbWVudEhhbmRsZXInXG5pbXBvcnQgUGxheWVySnVtcEhhbmRsZXIgZnJvbSAnLi4vbGliL1BsYXllckp1bXBIYW5kbGVyJ1xuaW1wb3J0IFBsYXllckFuZ2xlSGFuZGxlciBmcm9tICcuLi9saWIvUGxheWVyQW5nbGVIYW5kbGVyJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBVcGRhdGUoKSB7XG4gICAgQ29sbGlzaW9uSGFuZGxlci5jYWxsKHRoaXMpXG4gICAgUGxheWVyTW92ZW1lbnRIYW5kbGVyLmNhbGwodGhpcylcbiAgICBQbGF5ZXJKdW1wSGFuZGxlci5jYWxsKHRoaXMpXG4gICAgUGxheWVyQW5nbGVIYW5kbGVyLmNhbGwodGhpcylcblxuICAgIGlmICh0aGlzLmdhbWUuaW5wdXQuYWN0aXZlUG9pbnRlci5pc0Rvd24pXG4gICAge1xuICAgICAgICB0aGlzLnBsYXllci5tZXRhW3RoaXMuY3VycmVudFdlYXBvbl0uZmlyZSgpXG4gICAgfVxuXG4gICAgdGhpcy5wb3NpdGlvblRleHQudGV4dCA9IGAke3RoaXMuZ2FtZS5pbnB1dC53b3JsZFh9LCAke3RoaXMuZ2FtZS5pbnB1dC53b3JsZFl9YFxuXG4gICAgLy8gQ2hlY2sgZm9yIG91dCBvZiBib3VuZHMga2lsbFxuICAgIGlmICh0aGlzLnBsYXllci5ib2R5Lm9uRmxvb3IoKSkge1xuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdwbGF5ZXIgZGFtYWdlZCcsIHtcbiAgICAgICAgICAgIHJvb21JZDogdGhpcy5yb29tSWQsXG4gICAgICAgICAgICBkYW1hZ2U6IDEwMDAsXG4gICAgICAgICAgICBkYW1hZ2VkUGxheWVySWQ6ICcvIycgKyB0aGlzLnNvY2tldC5pZCxcbiAgICAgICAgICAgIGF0dGFja2luZ1BsYXllcklkOiBudWxsXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgdGhpcy5zb2NrZXQuZW1pdCgnbW92ZSBwbGF5ZXInLCB7XG4gICAgICAgIHJvb21JZDogdGhpcy5yb29tSWQsXG4gICAgICAgIHg6IHRoaXMucGxheWVyLngsXG4gICAgICAgIHk6IHRoaXMucGxheWVyLnlcbiAgICB9KVxufVxuIiwiaW1wb3J0IGluaXQgZnJvbSAnLi9jb3JlL0luaXQnXG5pbXBvcnQgcHJlbG9hZCBmcm9tICcuL2NvcmUvUHJlbG9hZCdcbmltcG9ydCB1cGRhdGUgZnJvbSAnLi9jb3JlL1VwZGF0ZSdcbmltcG9ydCBjcmVhdGUgZnJvbSAnLi9jb3JlL0NyZWF0ZSdcblxuY29uc3QgZ2FtZVdpZHRoID0gd2luZG93LmlubmVyV2lkdGhcbmNvbnN0IGdhbWVIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHRcbmxldCBnYW1lID0gbmV3IFBoYXNlci5HYW1lKGdhbWVXaWR0aCwgZ2FtZUhlaWdodCwgUGhhc2VyLkFVVE8sICdyYW5nZXItc3RldmUtZ2FtZScpXG5cbmdhbWUuc3RhdGUuYWRkKCdHYW1lJywgZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5jdXJyZW50V2VhcG9uID0gMFxuICAgIHRoaXMuZW5lbWllcyA9IFtdXG4gICAgdGhpcy5ncm91bmRcbiAgICB0aGlzLnBsYXRmb3Jtc1xuICAgIHRoaXMucGxheWVyXG4gICAgdGhpcy5zb2NrZXRcblxuICAgIHRoaXMuZ2FtZSA9IGdhbWVcbiAgICB0aGlzLmluaXQgPSBpbml0XG4gICAgdGhpcy5wcmVsb2FkID0gcHJlbG9hZFxuICAgIHRoaXMuY3JlYXRlID0gY3JlYXRlXG4gICAgdGhpcy51cGRhdGUgPSB1cGRhdGVcbn0sIHRydWUpXG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBDb2xsaXNpb25IYW5kbGVyKCkge1xuICAgIC8vIENvbGxpZGUgdGhpcyBwbGF5ZXIgd2l0aCB0aGUgbWFwXG4gICAgdGhpcy5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMucGxheWVyLCB0aGlzLnBsYXRmb3JtcywgbnVsbCwgbnVsbCwgdGhpcylcblxuICAgIC8vIERpZCB0aGlzIHBsYXllcidzIGJ1bGxldHMgaGl0IGFueSBwbGF0Zm9ybXNcbiAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5wbGF0Zm9ybXMsIHRoaXMuYnVsbGV0cywgKHBsYXRmb3JtLCBidWxsZXQpID0+IHtcbiAgICAgICAgYnVsbGV0LmtpbGwoKVxuICAgIH0sIG51bGwsIHRoaXMpXG5cbiAgICAvLyBEaWQgZW5lbXkgYnVsbGV0cyBoaXQgYW55IHBsYXRmb3Jtc1xuICAgIHRoaXMucGh5c2ljcy5hcmNhZGUuY29sbGlkZSh0aGlzLnBsYXRmb3JtcywgdGhpcy5lbmVteUJ1bGxldHMsIChwbGF0Zm9ybSwgYnVsbGV0KSA9PiB7XG4gICAgICAgIGJ1bGxldC5raWxsKClcbiAgICB9LCBudWxsLCB0aGlzKVxuXG4gICAgLy8gRGlkIHRoaXMgcGxheWVyIGdldCBoaXQgYnkgYW55IGVuZW15IGJ1bGxldHNcbiAgICAvLyB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5wbGF5ZXIsIHRoaXMuZW5lbXlCdWxsZXRzLCBudWxsLCAocGxheWVyLCBidWxsZXQpID0+IHtcbiAgICAvLyAgICAgYnVsbGV0LmtpbGwoKVxuICAgIC8vXG4gICAgLy8gICAgIGNvbnNvbGUubG9nKCdZb3Ugd2VyZSBoaXQgYnknLCBidWxsZXQuYnVsbGV0SWQpXG4gICAgLy8gICAgIHRoaXMuc29ja2V0LmVtaXQoJ2J1bGxldCByZW1vdmVkJywge1xuICAgIC8vICAgICAgICAgcm9vbUlkOiB0aGlzLnJvb21JZCxcbiAgICAvLyAgICAgICAgIGJ1bGxldElkOiBidWxsZXQuYnVsbGV0SWRcbiAgICAvLyAgICAgfSlcbiAgICAvL1xuICAgIC8vICAgICB0aGlzLnNvY2tldC5lbWl0KCdwbGF5ZXIgZGFtYWdlZCcsIHtcbiAgICAvLyAgICAgICAgIHJvb21JZDogdGhpcy5yb29tSWQsXG4gICAgLy8gICAgICAgICBkYW1hZ2U6IGJ1bGxldC5kYW1hZ2UsXG4gICAgLy8gICAgICAgICBkYW1hZ2VkUGxheWVySWQ6ICcvIycgKyB0aGlzLnNvY2tldC5pZCxcbiAgICAvLyAgICAgICAgIGF0dGFja2luZ1BsYXllcklkOiBidWxsZXQucGxheWVySWRcbiAgICAvLyAgICAgfSlcbiAgICAvL1xuICAgIC8vICAgICByZXR1cm4gZmFsc2VcbiAgICAvLyB9LCB0aGlzKVxufVxuIiwiaW1wb3J0IGVtaXR0ZXIgZnJvbSAnZXZlbnQtZW1pdHRlcidcblxubGV0IEV2ZW50SGFuZGxlciA9IGVtaXR0ZXIoe30pXG5cbmV4cG9ydCBkZWZhdWx0IEV2ZW50SGFuZGxlclxuIiwiaW1wb3J0IEd1aWQgZnJvbSAnLi9HdWlkJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBGaXJlUm9ja2V0KCkge1xuICAgIGxldCB4ID0gdGhpcy5yb290U2NvcGUucGxheWVyLnhcbiAgICBsZXQgeSA9IHRoaXMucm9vdFNjb3BlLnBsYXllci55XG5cbiAgICBsZXQgYnVsbGV0ID0gdGhpcy5yb290U2NvcGUuYnVsbGV0cy5nZXRGaXJzdERlYWQoKVxuICAgIGJ1bGxldC5idWxsZXRJZCA9IEd1aWQoKVxuICAgIGJ1bGxldC5oZWlnaHQgPSB0aGlzLmJ1bGxldEhlaWdodFxuICAgIGJ1bGxldC53aWR0aCA9IHRoaXMuYnVsbGV0V2lkdGhcbiAgICBidWxsZXQuYm9keS5ncmF2aXR5LnkgPSAtMTgwMFxuICAgIGJ1bGxldC5yZXNldCh4LCB5KVxuICAgIGxldCBwb2ludGVyQW5nbGUgPSB0aGlzLnJvb3RTY29wZS5nYW1lLnBoeXNpY3MuYXJjYWRlLm1vdmVUb1BvaW50ZXIoYnVsbGV0LCB0aGlzLmJ1bGxldFNwZWVkKVxuICAgIGJ1bGxldC5yb3RhdGlvbiA9IHBvaW50ZXJBbmdsZVxuXG4gICAgdGhpcy5meC52b2x1bWUgPSAuMyAqIHRoaXMucm9vdFNjb3BlLnZvbHVtZVxuICAgIHRoaXMuZngucGxheSgpXG5cbiAgICB0aGlzLnJvb3RTY29wZS5zb2NrZXQuZW1pdCgnYnVsbGV0IGZpcmVkJywge1xuICAgICAgICByb29tSWQ6IHRoaXMucm9vdFNjb3BlLnJvb21JZCxcbiAgICAgICAgYnVsbGV0SWQ6IHRoaXMuYnVsbGV0SWQsXG4gICAgICAgIHBsYXllcklkOiAnLyMnICsgdGhpcy5yb290U2NvcGUuc29ja2V0LmlkLFxuICAgICAgICB4LFxuICAgICAgICB5LFxuICAgICAgICBwb2ludGVyQW5nbGUsXG4gICAgICAgIGJ1bGxldFNwZWVkOiB0aGlzLmJ1bGxldFNwZWVkLFxuICAgICAgICBoZWlnaHQ6IHRoaXMuYnVsbGV0SGVpZ2h0LFxuICAgICAgICB3aWR0aDogdGhpcy5idWxsZXRXaWR0aCxcbiAgICAgICAgZGFtYWdlOiB0aGlzLmRhbWFnZVxuICAgIH0pXG59XG4iLCJpbXBvcnQgR3VpZCBmcm9tICcuL0d1aWQnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEZpcmVTaG90Z3VuU2hlbGwoKSB7XG4gICAgbGV0IHggPSB0aGlzLnJvb3RTY29wZS5wbGF5ZXIueFxuICAgIGxldCB5ID0gdGhpcy5yb290U2NvcGUucGxheWVyLnlcblxuICAgIGxldCBidWxsZXQgPSB0aGlzLnJvb3RTY29wZS5idWxsZXRzLmdldEZpcnN0RGVhZCgpXG4gICAgYnVsbGV0LmJ1bGxldElkID0gR3VpZCgpXG4gICAgYnVsbGV0LmhlaWdodCA9IHRoaXMuYnVsbGV0SGVpZ2h0XG4gICAgYnVsbGV0LndpZHRoID0gdGhpcy5idWxsZXRXaWR0aFxuICAgIGJ1bGxldC5ib2R5LmdyYXZpdHkueSA9IC0xODAwXG4gICAgYnVsbGV0LnJlc2V0KHgsIHkpXG4gICAgbGV0IHBvaW50ZXJBbmdsZSA9IHRoaXMucm9vdFNjb3BlLmdhbWUucGh5c2ljcy5hcmNhZGUubW92ZVRvUG9pbnRlcihidWxsZXQsIHRoaXMuYnVsbGV0U3BlZWQpXG4gICAgYnVsbGV0LnJvdGF0aW9uID0gcG9pbnRlckFuZ2xlXG5cbiAgICB0aGlzLmZ4LnZvbHVtZSA9IC41ICogdGhpcy5yb290U2NvcGUudm9sdW1lXG4gICAgdGhpcy5meC5wbGF5KClcblxuICAgIHRoaXMucm9vdFNjb3BlLnNvY2tldC5lbWl0KCdidWxsZXQgZmlyZWQnLCB7XG4gICAgICAgIHJvb21JZDogdGhpcy5yb290U2NvcGUucm9vbUlkLFxuICAgICAgICBidWxsZXRJZDogdGhpcy5idWxsZXRJZCxcbiAgICAgICAgcGxheWVySWQ6ICcvIycgKyB0aGlzLnJvb3RTY29wZS5zb2NrZXQuaWQsXG4gICAgICAgIHgsXG4gICAgICAgIHksXG4gICAgICAgIHBvaW50ZXJBbmdsZSxcbiAgICAgICAgYnVsbGV0U3BlZWQ6IHRoaXMuYnVsbGV0U3BlZWQsXG4gICAgICAgIGhlaWdodDogdGhpcy5idWxsZXRIZWlnaHQsXG4gICAgICAgIHdpZHRoOiB0aGlzLmJ1bGxldFdpZHRoLFxuICAgICAgICBkYW1hZ2U6IHRoaXMuZGFtYWdlXG4gICAgfSlcbn1cbiIsImltcG9ydCBHdWlkIGZyb20gJy4vR3VpZCdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gRmlyZVN0YW5kYXJkQnVsbGV0KCkge1xuICAgIGxldCB4ID0gdGhpcy5yb290U2NvcGUucGxheWVyLnhcbiAgICBsZXQgeSA9IHRoaXMucm9vdFNjb3BlLnBsYXllci55XG5cbiAgICBsZXQgYnVsbGV0ID0gdGhpcy5yb290U2NvcGUuYnVsbGV0cy5nZXRGaXJzdERlYWQoKVxuICAgIGJ1bGxldC5idWxsZXRJZCA9IEd1aWQoKVxuICAgIGJ1bGxldC5oZWlnaHQgPSB0aGlzLmJ1bGxldEhlaWdodFxuICAgIGJ1bGxldC53aWR0aCA9IHRoaXMuYnVsbGV0V2lkdGhcbiAgICBidWxsZXQuYm9keS5ncmF2aXR5LnkgPSAtMTgwMFxuICAgIGJ1bGxldC5yZXNldCh4LCB5KVxuICAgIGxldCBwb2ludGVyQW5nbGUgPSB0aGlzLnJvb3RTY29wZS5nYW1lLnBoeXNpY3MuYXJjYWRlLm1vdmVUb1BvaW50ZXIoYnVsbGV0LCB0aGlzLmJ1bGxldFNwZWVkKVxuICAgIGJ1bGxldC5yb3RhdGlvbiA9IHBvaW50ZXJBbmdsZVxuXG4gICAgdGhpcy5meC52b2x1bWUgPSAuMyAqIHRoaXMucm9vdFNjb3BlLnZvbHVtZVxuICAgIHRoaXMuZngucGxheSgpXG5cbiAgICB0aGlzLnJvb3RTY29wZS5zb2NrZXQuZW1pdCgnYnVsbGV0IGZpcmVkJywge1xuICAgICAgICByb29tSWQ6IHRoaXMucm9vdFNjb3BlLnJvb21JZCxcbiAgICAgICAgYnVsbGV0SWQ6IGJ1bGxldC5idWxsZXRJZCxcbiAgICAgICAgcGxheWVySWQ6ICcvIycgKyB0aGlzLnJvb3RTY29wZS5zb2NrZXQuaWQsXG4gICAgICAgIHgsXG4gICAgICAgIHksXG4gICAgICAgIHBvaW50ZXJBbmdsZSxcbiAgICAgICAgYnVsbGV0U3BlZWQ6IHRoaXMuYnVsbGV0U3BlZWQsXG4gICAgICAgIGhlaWdodDogYnVsbGV0LmhlaWdodCxcbiAgICAgICAgd2lkdGg6IGJ1bGxldC53aWR0aCxcbiAgICAgICAgZGFtYWdlOiBidWxsZXQuZGFtYWdlXG4gICAgfSlcbn1cbiIsImNvbnN0IEdhbWVDb25zdHMgPSB7XG4gICAgV09STERfV0lEVEg6IDgwMDAsXG4gICAgV09STERfSEVJR0hUOiAzOTY2LFxuICAgIFNUQVJUSU5HX1ZPTFVNRTogLjUsXG5cbiAgICAvLyBQaHlzaWNzXG4gICAgTUFYX1NQRUVEOiA2MDAsXG4gICAgQUNDRUxFUkFUSU9OOiAxOTYwLFxuICAgIERSQUc6IDE1MDAsXG4gICAgR1JBVklUWTogMTkwMCxcbiAgICBKVU1QX1NQRUVEOiAtODUwLFxuICAgIEpVTVBfSkVUX1NQRUVEOiAtMjQwMCxcbiAgICBKVU1QX0pFVF9TUEVFRF9SRUdFTkVSQVRJT046IC0yNDAwLFxuXG4gICAgLy8gUGxheWVyIE1vZGVsXG4gICAgQU5JTUFUSU9OX0xFRlQ6IFswLCAxLCAyLCAzLCA0LCA1XSxcbiAgICBBTklNQVRJT05fUklHSFQ6IFs4LCA5LCAxMCwgMTEsIDEyLCAxM10sXG4gICAgQU5JTUFUSU9OX0ZSQU1FUkFURTogMTAsXG4gICAgUExBWUVSX1NDQUxFOiAuMjcsXG4gICAgUExBWUVSX0FOQ0hPUjogLjUsXG5cbiAgICAvLyBXZWFwb25zXG4gICAgUFJJTUFSWV9XRUFQT05TOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnQUs0NycsXG4gICAgICAgICAgICBuYW1lOiAnQUstNDcnLFxuICAgICAgICAgICAgaW1hZ2U6ICcvaW1hZ2VzL2d1bnMvU3ByX0FLNDcucG5nJyxcbiAgICAgICAgICAgIG1pblNjb3JlOiAwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnTTUwMCcsXG4gICAgICAgICAgICBuYW1lOiAnTTUwMCcsXG4gICAgICAgICAgICBpbWFnZTogJy9pbWFnZXMvZ3Vucy9TcHJfTTUwMC5wbmcnLFxuICAgICAgICAgICAgbWluU2NvcmU6IDBcbiAgICAgICAgICAgIC8vIG1pblNjb3JlOiAxMFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ1Nrb3JwaW9uJyxcbiAgICAgICAgICAgIG5hbWU6ICdTa29ycGlvbicsXG4gICAgICAgICAgICBpbWFnZTogJy9pbWFnZXMvZ3Vucy9TcHJfU2tvcnBpb24ucG5nJyxcbiAgICAgICAgICAgIG1pblNjb3JlOiAwXG4gICAgICAgICAgICAvLyBtaW5TY29yZTogMjBcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICdBdWcnLFxuICAgICAgICAgICAgbmFtZTogJ0F1ZycsXG4gICAgICAgICAgICBpbWFnZTogJy9pbWFnZXMvZ3Vucy9TcHJfQXVnLnBuZycsXG4gICAgICAgICAgICBtaW5TY29yZTogMFxuICAgICAgICAgICAgLy8gbWluU2NvcmU6IDMwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnRzQzJyxcbiAgICAgICAgICAgIG5hbWU6ICdHNDMnLFxuICAgICAgICAgICAgaW1hZ2U6ICcvaW1hZ2VzL2d1bnMvU3ByX2c0My5wbmcnLFxuICAgICAgICAgICAgbWluU2NvcmU6IDBcbiAgICAgICAgICAgIC8vIG1pblNjb3JlOiA0MFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ1A5MCcsXG4gICAgICAgICAgICBuYW1lOiAnUDkwJyxcbiAgICAgICAgICAgIGltYWdlOiAnL2ltYWdlcy9ndW5zL1Nwcl9wOTAucG5nJyxcbiAgICAgICAgICAgIG1pblNjb3JlOiAwXG4gICAgICAgICAgICAvLyBtaW5TY29yZTogMzBcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICdNNEExJyxcbiAgICAgICAgICAgIG5hbWU6ICdNNEExJyxcbiAgICAgICAgICAgIGltYWdlOiAnL2ltYWdlcy9ndW5zL1Nwcl9NNEExLnBuZycsXG4gICAgICAgICAgICBtaW5TY29yZTogMFxuICAgICAgICAgICAgLy8gbWluU2NvcmU6IDEwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnQmFycmV0dCcsXG4gICAgICAgICAgICBuYW1lOiAnQmFycmV0dCcsXG4gICAgICAgICAgICBpbWFnZTogJy9pbWFnZXMvZ3Vucy9TcHJfQmFycmV0dC5wbmcnLFxuICAgICAgICAgICAgbWluU2NvcmU6IDBcbiAgICAgICAgICAgIC8vIG1pblNjb3JlOiA3MFxuICAgICAgICB9XG4gICAgXSxcblxuICAgIFNFQ09OREFSWV9XRUFQT05TOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnRGVzZXJ0RWFnbGUnLFxuICAgICAgICAgICAgbmFtZTogJ0Rlc2VydCBFYWdsZScsXG4gICAgICAgICAgICBpbWFnZTogJy9pbWFnZXMvZ3Vucy9TcHJfRGVzZXJ0RWFnbGUucG5nJyxcbiAgICAgICAgICAgIG1pblNjb3JlOiAwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnUlBHJyxcbiAgICAgICAgICAgIG5hbWU6ICdSUEcnLFxuICAgICAgICAgICAgaW1hZ2U6ICcvaW1hZ2VzL2d1bnMvU3ByX1JQRy5wbmcnLFxuICAgICAgICAgICAgbWluU2NvcmU6IDIwXG4gICAgICAgIH1cbiAgICBdXG59XG5cbmV4cG9ydCBkZWZhdWx0IEdhbWVDb25zdHNcbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEdldFF1ZXJ5U3RyaW5nKGZpZWxkLCB1cmwpIHtcbiAgICB2YXIgaHJlZiA9IHVybCA/IHVybCA6IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuICAgIHZhciByZWcgPSBuZXcgUmVnRXhwKCAnWz8mXScgKyBmaWVsZCArICc9KFteJiNdKiknLCAnaScgKTtcbiAgICB2YXIgc3RyaW5nID0gcmVnLmV4ZWMoaHJlZik7XG4gICAgcmV0dXJuIHN0cmluZyA/IHN0cmluZ1sxXSA6IG51bGw7XG59XG4iLCJmdW5jdGlvbiBTNCgpIHtcbiAgICByZXR1cm4gKCgoMStNYXRoLnJhbmRvbSgpKSoweDEwMDAwKXwwKS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpXG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEd1aWQoKSB7XG4gICAgcmV0dXJuIChTNCgpK1M0KCkrXCItXCIrUzQoKStcIi1cIitTNCgpK1wiLVwiK1M0KCkrXCItXCIrUzQoKStTNCgpK1M0KCkpXG59XG4iLCIvLyBUaGlzIGZ1bmN0aW9uIHNob3VsZCByZXR1cm4gdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgYWN0aXZhdGVzIHRoZSBcImdvIGxlZnRcIiBjb250cm9sXG4vLyBJbiB0aGlzIGNhc2UsIGVpdGhlciBob2xkaW5nIHRoZSByaWdodCBhcnJvdyBvciB0YXBwaW5nIG9yIGNsaWNraW5nIG9uIHRoZSBsZWZ0XG4vLyBzaWRlIG9mIHRoZSBzY3JlZW4uXG5leHBvcnQgZnVuY3Rpb24gbGVmdElucHV0SXNBY3RpdmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5wdXQua2V5Ym9hcmQuaXNEb3duKFBoYXNlci5LZXlib2FyZC5BKVxufVxuXG4vLyBUaGlzIGZ1bmN0aW9uIHNob3VsZCByZXR1cm4gdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgYWN0aXZhdGVzIHRoZSBcImdvIHJpZ2h0XCIgY29udHJvbFxuLy8gSW4gdGhpcyBjYXNlLCBlaXRoZXIgaG9sZGluZyB0aGUgcmlnaHQgYXJyb3cgb3IgdGFwcGluZyBvciBjbGlja2luZyBvbiB0aGUgcmlnaHRcbi8vIHNpZGUgb2YgdGhlIHNjcmVlbi5cbmV4cG9ydCBmdW5jdGlvbiByaWdodElucHV0SXNBY3RpdmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5wdXQua2V5Ym9hcmQuaXNEb3duKFBoYXNlci5LZXlib2FyZC5EKVxufVxuXG4vLyBUaGlzIGZ1bmN0aW9uIHNob3VsZCByZXR1cm4gdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgYWN0aXZhdGVzIHRoZSBcImp1bXBcIiBjb250cm9sXG4vLyBJbiB0aGlzIGNhc2UsIGVpdGhlciBob2xkaW5nIHRoZSB1cCBhcnJvdyBvciB0YXBwaW5nIG9yIGNsaWNraW5nIG9uIHRoZSBjZW50ZXJcbi8vIHBhcnQgb2YgdGhlIHNjcmVlbi5cbmV4cG9ydCBmdW5jdGlvbiB1cElucHV0SXNBY3RpdmUoZHVyYXRpb24pIHtcbiAgICByZXR1cm4gdGhpcy5pbnB1dC5rZXlib2FyZC5kb3duRHVyYXRpb24oUGhhc2VyLktleWJvYXJkLlcsIGR1cmF0aW9uKVxufVxuXG4vLyBUaGlzIGZ1bmN0aW9uIHJldHVybnMgdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgcmVsZWFzZXMgdGhlIFwianVtcFwiIGNvbnRyb2xcbmV4cG9ydCBmdW5jdGlvbiB1cElucHV0UmVsZWFzZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5wdXQua2V5Ym9hcmQudXBEdXJhdGlvbihQaGFzZXIuS2V5Ym9hcmQuVylcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFBsYXllckFuZ2xlSGFuZGxlcigpIHtcbiAgICBsZXQgYW5nbGVJbkRlZ3JlZXMgPSAodGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmFuZ2xlVG9Qb2ludGVyKHRoaXMucGxheWVyKSAqIDE4MCAvIE1hdGguUEkpICsgOTA7XG5cbiAgICBpZiAodGhpcy5wbGF5ZXIubWV0YS5mYWNpbmcgPT09ICdyaWdodCcpIHtcbiAgICAgICAgdGhpcy5yaWdodEFybUdyb3VwLmFuZ2xlID0gYW5nbGVJbkRlZ3JlZXMgKyA1XG5cbiAgICAgICAgLy8gVXNlciBpcyBhaW1pbmcgdXBcbiAgICAgICAgaWYgKGFuZ2xlSW5EZWdyZWVzIDw9IDgxICYmIGFuZ2xlSW5EZWdyZWVzID49IDcxKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyAtPSAxMFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzIDwgNzEgJiYgYW5nbGVJbkRlZ3JlZXMgPj0gNjEpIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzIC09IDIwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPCA2MSAmJiBhbmdsZUluRGVncmVlcyA+PSA1MSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgLT0gMzBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA8IDUxICYmIGFuZ2xlSW5EZWdyZWVzID49IDQxKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyAtPSA0MFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzIDwgNDEgJiYgYW5nbGVJbkRlZ3JlZXMgPj0gMzEpIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzIC09IDUwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPCAzMSAmJiBhbmdsZUluRGVncmVlcyA+PSAyMSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgLT0gNjBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA8IDIxICYmIGFuZ2xlSW5EZWdyZWVzID49IDExKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyAtPSA3MFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzIDwgMTEgJiYgYW5nbGVJbkRlZ3JlZXMgPj0gMCkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgLT0gODBcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFVzZXIgaXMgYWltaW5nIGRvd25cbiAgICAgICAgaWYgKGFuZ2xlSW5EZWdyZWVzID49IDk5ICYmIGFuZ2xlSW5EZWdyZWVzIDw9IDEwOSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgKz0gMTBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA+IDEwOSAmJiBhbmdsZUluRGVncmVlcyA8PSAxMTkpIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzICs9IDIwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPiAxMTkgJiYgYW5nbGVJbkRlZ3JlZXMgPD0gMTI5KSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyArPSAzMFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzID4gMTI5ICYmIGFuZ2xlSW5EZWdyZWVzIDw9IDEzOSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgKz0gNDBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA+IDEzOSAmJiBhbmdsZUluRGVncmVlcyA8PSAxNDkpIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzICs9IDUwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPiAxNDkgJiYgYW5nbGVJbkRlZ3JlZXMgPD0gMTU5KSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyArPSA2MFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzID4gMTU5ICYmIGFuZ2xlSW5EZWdyZWVzIDw9IDE2OSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgKz0gNzBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA+IDE2OSAmJiBhbmdsZUluRGVncmVlcyA8PSAxODApIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzICs9IDgwXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5wbGF5ZXIubWV0YS5mYWNpbmcgPT09ICdsZWZ0Jykge1xuICAgICAgICB0aGlzLnJpZ2h0QXJtR3JvdXAuYW5nbGUgPSBhbmdsZUluRGVncmVlcyAtIDdcblxuICAgICAgICAvLyBVc2VyIGlzIGFpbWluZyB1cFxuICAgICAgICBpZiAoYW5nbGVJbkRlZ3JlZXMgPj0gLTgxICYmIGFuZ2xlSW5EZWdyZWVzIDw9IC03MSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgKz0gMjBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA+IC03MSAmJiBhbmdsZUluRGVncmVlcyA8PSAtNjEpIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzICs9IDMwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPiAtNjEgJiYgYW5nbGVJbkRlZ3JlZXMgPD0gLTUxKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyArPSA0MFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzID4gLTUxICYmIGFuZ2xlSW5EZWdyZWVzIDw9IC00MSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgKz0gNTBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA+IC00MSAmJiBhbmdsZUluRGVncmVlcyA8PSAtMzEpIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzICs9IDYwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPiAtMzEgJiYgYW5nbGVJbkRlZ3JlZXMgPD0gLTIxKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyArPSA3MFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzID4gLTIxICYmIGFuZ2xlSW5EZWdyZWVzIDw9IC0xMSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgKz0gODBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA+IC0xMSAmJiBhbmdsZUluRGVncmVlcyA8PSAwKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyArPSA5MFxuICAgICAgICB9XG5cbiAgICAgICAgLy8gVXNlciBpcyBhaW1pbmcgZG93blxuICAgICAgICBpZiAoYW5nbGVJbkRlZ3JlZXMgPD0gMjcwICYmIGFuZ2xlSW5EZWdyZWVzID49IDI2MCkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgLT0gMTBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA8IDI2MCAmJiBhbmdsZUluRGVncmVlcyA+PSAyNTApIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzIC09IDIwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPCAyNTAgJiYgYW5nbGVJbkRlZ3JlZXMgPj0gMjQwKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyAtPSAzMFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzIDwgMjQwICYmIGFuZ2xlSW5EZWdyZWVzID49IDIzMCkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgLT0gNDBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA8IDIzMCAmJiBhbmdsZUluRGVncmVlcyA+PSAyMjApIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzIC09IDUwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPCAyMjAgJiYgYW5nbGVJbkRlZ3JlZXMgPj0gMjEwKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyAtPSA2MFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzIDwgMjEwICYmIGFuZ2xlSW5EZWdyZWVzID49IDIwMCkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgLT0gNzBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA8IDIwMCAmJiBhbmdsZUluRGVncmVlcyA+PSAxOTApIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzIC09IDgwXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmxlZnRBcm1Hcm91cC5hbmdsZSA9IGFuZ2xlSW5EZWdyZWVzXG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBQbGF5ZXJCeUlkKGlkKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmVuZW1pZXMuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHRoaXMuZW5lbWllcy5jaGlsZHJlbltpXS5pZCA9PT0gaWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmVuZW1pZXMuY2hpbGRyZW5baV1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZVxufVxuIiwiZXhwb3J0IGZ1bmN0aW9uIHBsYXllckZhY2VMZWZ0KCkge1xuICAgIGlmICh0aGlzLnBsYXllci5tZXRhLmZhY2luZyAhPT0gJ2xlZnQnKSB7XG4gICAgICAgIHRoaXMucGxheWVyLm1ldGEuZmFjaW5nID0gJ2xlZnQnXG5cbiAgICAgICAgdGhpcy5yaWdodEFybUdyb3VwLnggPSAyNVxuICAgICAgICB0aGlzLnJpZ2h0QXJtR3JvdXAueSA9IC02NVxuXG4gICAgICAgIHRoaXMubGVmdEFybUdyb3VwLnggPSAtNDBcbiAgICAgICAgdGhpcy5sZWZ0QXJtR3JvdXAueSA9IC03MFxuXG4gICAgICAgIHRoaXMuaGVhZFNwcml0ZS5zY2FsZS54ICo9IC0xXG4gICAgICAgIHRoaXMuaGVhZFNwcml0ZS54ID0gMTJcblxuICAgICAgICB0aGlzLnRvcnNvU3ByaXRlLnNjYWxlLnggKj0gLTFcbiAgICAgICAgdGhpcy50b3Jzb1Nwcml0ZS54ID0gNDlcblxuICAgICAgICB0aGlzLmxlZnRBcm1TcHJpdGUuc2NhbGUueSAqPSAtMVxuICAgICAgICB0aGlzLmxlZnRBcm1TcHJpdGUueSA9IDVcblxuICAgICAgICB0aGlzLnJpZ2h0QXJtU3ByaXRlLnNjYWxlLnkgKj0gLTFcbiAgICAgICAgdGhpcy5yaWdodEFybVNwcml0ZS55ID0gMTBcblxuICAgICAgICB0aGlzLmFrNDdTcHJpdGUuc2NhbGUueSAqPSAtMVxuICAgICAgICB0aGlzLmFrNDdTcHJpdGUueSA9IDMwXG4gICAgICAgIHRoaXMuYWs0N1Nwcml0ZS54ID0gLTdcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwbGF5ZXJGYWNlUmlnaHQoKSB7XG4gICAgaWYgKHRoaXMucGxheWVyLm1ldGEuZmFjaW5nICE9PSAncmlnaHQnKSB7XG4gICAgICAgIHRoaXMucGxheWVyLm1ldGEuZmFjaW5nID0gJ3JpZ2h0J1xuXG4gICAgICAgIHRoaXMucmlnaHRBcm1Hcm91cC54ID0gLTI1XG4gICAgICAgIHRoaXMucmlnaHRBcm1Hcm91cC55ID0gLTY1XG5cbiAgICAgICAgdGhpcy5sZWZ0QXJtR3JvdXAueCA9IDQ1XG4gICAgICAgIHRoaXMubGVmdEFybUdyb3VwLnkgPSAtNzBcblxuICAgICAgICB0aGlzLmhlYWRTcHJpdGUuc2NhbGUueCAqPSAtMVxuICAgICAgICB0aGlzLmhlYWRTcHJpdGUueCA9IDBcblxuICAgICAgICB0aGlzLnRvcnNvU3ByaXRlLnNjYWxlLnggKj0gLTFcbiAgICAgICAgdGhpcy50b3Jzb1Nwcml0ZS54ID0gLTM3XG5cbiAgICAgICAgdGhpcy5sZWZ0QXJtU3ByaXRlLnNjYWxlLnkgKj0gLTFcbiAgICAgICAgdGhpcy5sZWZ0QXJtU3ByaXRlLnkgPSAwXG5cbiAgICAgICAgdGhpcy5yaWdodEFybVNwcml0ZS5zY2FsZS55ICo9IC0xXG4gICAgICAgIHRoaXMucmlnaHRBcm1TcHJpdGUueSA9IDBcblxuICAgICAgICB0aGlzLmFrNDdTcHJpdGUuc2NhbGUueSAqPSAtMVxuICAgICAgICB0aGlzLmFrNDdTcHJpdGUueSA9IDE5XG4gICAgICAgIHRoaXMuYWs0N1Nwcml0ZS54ID0gM1xuICAgIH1cbn1cbiIsImltcG9ydCBHYW1lQ29uc3RzIGZyb20gJy4vR2FtZUNvbnN0cydcbmltcG9ydCBFdmVudEhhbmRsZXIgZnJvbSAnLi9FdmVudEhhbmRsZXInXG5pbXBvcnQgeyB1cElucHV0SXNBY3RpdmUsIHVwSW5wdXRSZWxlYXNlZCB9IGZyb20gJy4vSW5wdXRIZWxwZXJzJ1xuXG5sZXQganVtcEpldENvdW50ZXIgPSAwXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFBsYXllckp1bXBIYW5kbGVyKCkge1xuICAgIC8vIFNldCBhIHZhcmlhYmxlIHRoYXQgaXMgdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgaXMgdG91Y2hpbmcgdGhlIGdyb3VuZFxuICAgIGxldCBvblRoZUdyb3VuZCA9IHRoaXMucGxheWVyLmJvZHkudG91Y2hpbmcuZG93blxuXG4gICAgLy8gSWYgdGhlIHBsYXllciBpcyB0b3VjaGluZyB0aGUgZ3JvdW5kLCBsZXQgaGltIGhhdmUgMiBqdW1wc1xuICAgIGlmIChvblRoZUdyb3VuZCkge1xuICAgICAgICB0aGlzLmp1bXBzID0gMlxuICAgICAgICB0aGlzLmp1bXBpbmcgPSBmYWxzZVxuICAgIH1cblxuICAgIC8vIEp1bXAhXG4gICAgaWYgKHRoaXMuanVtcHMgPT09IDIgJiYgdXBJbnB1dElzQWN0aXZlLmNhbGwodGhpcywgNSkgJiYgb25UaGVHcm91bmQpIHtcbiAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS52ZWxvY2l0eS55ID0gR2FtZUNvbnN0cy5KVU1QX1NQRUVEXG4gICAgICAgIHRoaXMuanVtcGluZyA9IHRydWVcbiAgICB9IGVsc2UgaWYgKHVwSW5wdXRJc0FjdGl2ZS5jYWxsKHRoaXMsIDUpKSB7XG4gICAgICAgIHRoaXMuanVtcHMgPSAxXG4gICAgfVxuXG4gICAgLy8gSnVtcCBKZXQhXG4gICAgaWYgKHRoaXMuanVtcHMgPT09IDEgJiYgdGhpcy5pbnB1dC5rZXlib2FyZC5pc0Rvd24oUGhhc2VyLktleWJvYXJkLlcpICYmIGp1bXBKZXRDb3VudGVyID4gLTEzMDAwMCkge1xuICAgICAgICB0aGlzLnBsYXllci5ib2R5LmFjY2VsZXJhdGlvbi55ID0gR2FtZUNvbnN0cy5KVU1QX0pFVF9TUEVFRFxuICAgICAgICBqdW1wSmV0Q291bnRlciArPSBHYW1lQ29uc3RzLkpVTVBfSkVUX1NQRUVEXG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5hY2NlbGVyYXRpb24ueSA9IDBcblxuICAgICAgICBpZiAoanVtcEpldENvdW50ZXIgPCAwKSB7XG4gICAgICAgICAgICBqdW1wSmV0Q291bnRlciAtPSBHYW1lQ29uc3RzLkpVTVBfSkVUX1NQRUVEX1JFR0VORVJBVElPTlxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAganVtcEpldENvdW50ZXIgPSAwXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBFdmVudEhhbmRsZXIuZW1pdCgncGxheWVyIGp1bXAgamV0IHVwZGF0ZScsIHsganVtcEpldENvdW50ZXIgfSlcblxuICAgIC8vIFJlZHVjZSB0aGUgbnVtYmVyIG9mIGF2YWlsYWJsZSBqdW1wcyBpZiB0aGUganVtcCBpbnB1dCBpcyByZWxlYXNlZFxuICAgIGlmICh0aGlzLmp1bXBpbmcgJiYgdXBJbnB1dFJlbGVhc2VkLmNhbGwodGhpcykpIHtcbiAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5hY2NlbGVyYXRpb24ueCA9IDBcbiAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5hY2NlbGVyYXRpb24ueSA9IDBcblxuICAgICAgICBpZiAodGhpcy5qdW1wcyAhPT0gMSkge1xuICAgICAgICAgICAgdGhpcy5qdW1wcy0tXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmp1bXBpbmcgPSBmYWxzZVxuICAgIH1cbn1cbiIsImltcG9ydCBHYW1lQ29uc3RzIGZyb20gJy4vR2FtZUNvbnN0cydcbmltcG9ydCB7IHBsYXllckZhY2VMZWZ0LCBwbGF5ZXJGYWNlUmlnaHQgfSBmcm9tICcuL1BsYXllckZhY2VIYW5kbGVyJ1xuaW1wb3J0IHsgbGVmdElucHV0SXNBY3RpdmUsIHJpZ2h0SW5wdXRJc0FjdGl2ZSB9IGZyb20gJy4vSW5wdXRIZWxwZXJzJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBQbGF5ZXJNb3ZlbWVudEhhbmRsZXIoKSB7XG4gICAgaWYgKGxlZnRJbnB1dElzQWN0aXZlLmNhbGwodGhpcykpIHtcbiAgICAgICAgLy8gSWYgdGhlIExFRlQga2V5IGlzIGRvd24sIHNldCB0aGUgcGxheWVyIHZlbG9jaXR5IHRvIG1vdmUgbGVmdFxuICAgICAgICB0aGlzLnBsYXllci5ib2R5LmFjY2VsZXJhdGlvbi54ID0gLUdhbWVDb25zdHMuQUNDRUxFUkFUSU9OXG4gICAgICAgIHRoaXMucGxheWVyLmFuaW1hdGlvbnMucGxheSgnbGVmdCcpXG5cbiAgICAgICAgLy8gTGVmdCBmYWNpbmcgaGVhZCBuZWVkcyB0byBiZSBzZXQgb25seSBvbmNlXG4gICAgICAgIHBsYXllckZhY2VMZWZ0LmNhbGwodGhpcylcbiAgICB9IGVsc2UgaWYgKHJpZ2h0SW5wdXRJc0FjdGl2ZS5jYWxsKHRoaXMpKSB7XG4gICAgICAgIC8vIElmIHRoZSBSSUdIVCBrZXkgaXMgZG93biwgc2V0IHRoZSBwbGF5ZXIgdmVsb2NpdHkgdG8gbW92ZSByaWdodFxuICAgICAgICB0aGlzLnBsYXllci5ib2R5LmFjY2VsZXJhdGlvbi54ID0gR2FtZUNvbnN0cy5BQ0NFTEVSQVRJT05cbiAgICAgICAgdGhpcy5wbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdyaWdodCcpXG5cbiAgICAgICAgcGxheWVyRmFjZVJpZ2h0LmNhbGwodGhpcylcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBTdGFuZCBzdGlsbFxuICAgICAgICB0aGlzLnBsYXllci5ib2R5LmFjY2VsZXJhdGlvbi54ID0gMFxuICAgICAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLnN0b3AoKVxuXG4gICAgICAgIGlmICh0aGlzLmdhbWUuaW5wdXQud29ybGRYID4gdGhpcy5wbGF5ZXIueCkge1xuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuZnJhbWUgPSA3XG4gICAgICAgICAgICBwbGF5ZXJGYWNlUmlnaHQuY2FsbCh0aGlzKVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuZ2FtZS5pbnB1dC53b3JsZFggPCB0aGlzLnBsYXllci54KSB7XG4gICAgICAgICAgICB0aGlzLnBsYXllci5mcmFtZSA9IDZcbiAgICAgICAgICAgIHBsYXllckZhY2VMZWZ0LmNhbGwodGhpcylcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFJlbW90ZUJ1bGxldChkYXRhKSB7XG4gICAgbGV0IGVuZW15QnVsbGV0ID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUoZGF0YS54LCBkYXRhLnksICdidWxsZXQxMicpXG4gICAgZW5lbXlCdWxsZXQuYnVsbGV0SWQgPSBkYXRhLmJ1bGxldElkXG4gICAgZW5lbXlCdWxsZXQucGxheWVySWQgPSBkYXRhLnBsYXllcklkXG4gICAgZW5lbXlCdWxsZXQuZGFtYWdlID0gZGF0YS5kYW1hZ2VcbiAgICBlbmVteUJ1bGxldC5yb3RhdGlvbiA9IGRhdGEucG9pbnRlckFuZ2xlXG4gICAgZW5lbXlCdWxsZXQuaGVpZ2h0ID0gZGF0YS5oZWlnaHRcbiAgICBlbmVteUJ1bGxldC53aWR0aCA9IGRhdGEud2lkdGhcbiAgICBlbmVteUJ1bGxldC5waHlzaWNzQm9keVR5cGUgPSBQaGFzZXIuUGh5c2ljcy5BUkNBREVcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5lbmFibGUoZW5lbXlCdWxsZXQsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSlcbiAgICBlbmVteUJ1bGxldC5ib2R5LmdyYXZpdHkueSA9IC0xODAwXG4gICAgZW5lbXlCdWxsZXQueCA9IGRhdGEueFxuICAgIGVuZW15QnVsbGV0LnkgPSBkYXRhLnlcblxuICAgIHJldHVybiBlbmVteUJ1bGxldFxufVxuIiwiaW1wb3J0IEdhbWVDb25zdHMgZnJvbSAnLi9HYW1lQ29uc3RzJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBSZW1vdGVQbGF5ZXIocGxheWVyKSB7XG4gICAgbGV0IG5ld1JlbW90ZVBsYXllciA9IHRoaXMuZ2FtZS5hZGQuc3ByaXRlKHBsYXllci54LCBwbGF5ZXIueSwgJ2NvbW1hbmRvJylcbiAgICBuZXdSZW1vdGVQbGF5ZXIuc2NhbGUuc2V0VG8oR2FtZUNvbnN0cy5QTEFZRVJfU0NBTEUpXG4gICAgbmV3UmVtb3RlUGxheWVyLmFuY2hvci5zZXRUbyhHYW1lQ29uc3RzLlBMQVlFUl9BTkNIT1IpXG4gICAgbmV3UmVtb3RlUGxheWVyLmFsaXZlID0gdHJ1ZVxuICAgIG5ld1JlbW90ZVBsYXllci5hbmltYXRpb25zLmFkZCgnbGVmdCcsIEdhbWVDb25zdHMuQU5JTUFUSU9OX0xFRlQsIEdhbWVDb25zdHMuQU5JTUFUSU9OX0ZSQU1FUkFURSwgdHJ1ZSlcbiAgICBuZXdSZW1vdGVQbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ3JpZ2h0JywgR2FtZUNvbnN0cy5BTklNQVRJT05fUklHSFQsIEdhbWVDb25zdHMuQU5JTUFUSU9OX0ZSQU1FUkFURSwgdHJ1ZSlcbiAgICBuZXdSZW1vdGVQbGF5ZXIuaWQgPSBwbGF5ZXIuaWRcbiAgICBuZXdSZW1vdGVQbGF5ZXIubGFzdFBvc2l0aW9uID0ge1xuICAgICAgICB4OiBwbGF5ZXIueCxcbiAgICAgICAgeTogcGxheWVyLnlcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3UmVtb3RlUGxheWVyXG59XG4iLCJpbXBvcnQgRXZlbnRIYW5kbGVyIGZyb20gJy4uL0V2ZW50SGFuZGxlcidcbmltcG9ydCBvblVwZGF0ZVBsYXllcnMgZnJvbSAnLi9vblVwZGF0ZVBsYXllcnMnXG5pbXBvcnQgb25Tb2NrZXRDb25uZWN0ZWQgZnJvbSAnLi9vblNvY2tldENvbm5lY3RlZCdcbmltcG9ydCBvblNvY2tldERpc2Nvbm5lY3QgZnJvbSAnLi9vblNvY2tldERpc2Nvbm5lY3QnXG5pbXBvcnQgb25Nb3ZlUGxheWVyIGZyb20gJy4vb25Nb3ZlUGxheWVyJ1xuaW1wb3J0IG9uUmVtb3ZlUGxheWVyIGZyb20gJy4vb25SZW1vdmVQbGF5ZXInXG5pbXBvcnQgb25CdWxsZXRGaXJlZCBmcm9tICcuL29uQnVsbGV0RmlyZWQnXG5pbXBvcnQgb25CdWxsZXRSZW1vdmVkIGZyb20gJy4vb25CdWxsZXRSZW1vdmVkJ1xuaW1wb3J0IG9uUGxheWVyRGFtYWdlZCBmcm9tICcuL29uUGxheWVyRGFtYWdlZCdcbmltcG9ydCBvblBsYXllclJlc3Bhd24gZnJvbSAnLi9vblBsYXllclJlc3Bhd24nXG5pbXBvcnQgb25QbGF5ZXJIZWFsdGhVcGRhdGUgZnJvbSAnLi9vblBsYXllckhlYWx0aFVwZGF0ZSdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zb2NrZXQub24oJ2Nvbm5lY3QnLCBvblNvY2tldENvbm5lY3RlZC5iaW5kKHRoaXMpKVxuICAgIHRoaXMuc29ja2V0Lm9uKCdkaXNjb25uZWN0Jywgb25Tb2NrZXREaXNjb25uZWN0LmJpbmQodGhpcykpXG5cbiAgICB0aGlzLnNvY2tldC5vbigndXBkYXRlIHBsYXllcnMnLCBvblVwZGF0ZVBsYXllcnMuYmluZCh0aGlzKSlcbiAgICB0aGlzLnNvY2tldC5vbignbW92ZSBwbGF5ZXInLCBvbk1vdmVQbGF5ZXIuYmluZCh0aGlzKSlcbiAgICB0aGlzLnNvY2tldC5vbigncmVtb3ZlIHBsYXllcicsIG9uUmVtb3ZlUGxheWVyLmJpbmQodGhpcykpXG5cbiAgICB0aGlzLnNvY2tldC5vbigncGxheWVyIHJlc3Bhd24nLCBvblBsYXllclJlc3Bhd24uYmluZCh0aGlzKSlcbiAgICB0aGlzLnNvY2tldC5vbigncGxheWVyIGRhbWFnZWQnLCBvblBsYXllckRhbWFnZWQuYmluZCh0aGlzKSlcbiAgICB0aGlzLnNvY2tldC5vbigncGxheWVyIGhlYWx0aCB1cGRhdGUnLCBvblBsYXllckhlYWx0aFVwZGF0ZS5iaW5kKHRoaXMpKVxuXG4gICAgdGhpcy5zb2NrZXQub24oJ2J1bGxldCBmaXJlZCcsIG9uQnVsbGV0RmlyZWQuYmluZCh0aGlzKSlcbiAgICB0aGlzLnNvY2tldC5vbignYnVsbGV0IHJlbW92ZWQnLCBvbkJ1bGxldFJlbW92ZWQuYmluZCh0aGlzKSlcblxuICAgIEV2ZW50SGFuZGxlci5vbigncGxheWVyIHVwZGF0ZSBuaWNrbmFtZScsIChkYXRhKSA9PiB7XG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ3BsYXllciB1cGRhdGUgbmlja25hbWUnLCB7XG4gICAgICAgICAgICByb29tSWQ6IHRoaXMucm9vbUlkLFxuICAgICAgICAgICAgbmlja25hbWU6IGRhdGEubmlja25hbWVcbiAgICAgICAgfSlcbiAgICB9KVxufVxuIiwiaW1wb3J0IFJlbW90ZUJ1bGxldCBmcm9tICcuLi9SZW1vdGVCdWxsZXQnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG9uQnVsbGV0RmlyZWQoZGF0YSkge1xuICAgIGlmIChkYXRhLmlkID09PSAoJy8jJyArIHRoaXMuc29ja2V0LmlkKSlcbiAgICAgICAgcmV0dXJuXG5cbiAgICBsZXQgZW5lbXlCdWxsZXQgPSBSZW1vdGVCdWxsZXQuY2FsbCh0aGlzLCBkYXRhKVxuICAgIGxldCBuZXdWZWxvY2l0eSA9IHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS52ZWxvY2l0eUZyb21Sb3RhdGlvbihkYXRhLnBvaW50ZXJBbmdsZSwgZGF0YS5idWxsZXRTcGVlZClcbiAgICBlbmVteUJ1bGxldC5ib2R5LnZlbG9jaXR5LnggKz0gbmV3VmVsb2NpdHkueFxuICAgIGVuZW15QnVsbGV0LmJvZHkudmVsb2NpdHkueSArPSBuZXdWZWxvY2l0eS55XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBvbkJ1bGxldFJlbW92ZWQoZGF0YSkge1xuICAgIGlmIChkYXRhLmlkID09PSAoJy8jJyArIHRoaXMuc29ja2V0LmlkKSlcbiAgICAgICAgcmV0dXJuXG5cbiAgICBsZXQgcmVtb3ZlQnVsbGV0ID0gXy5maW5kKHRoaXMuYnVsbGV0cy5jaGlsZHJlbiwge1xuICAgICAgICBidWxsZXRJZDogZGF0YS5idWxsZXRJZFxuICAgIH0pXG5cbiAgICBpZiAoIXJlbW92ZUJ1bGxldCkge1xuICAgICAgICBjb25zb2xlLmxvZygnQnVsbGV0IG5vdCBmb3VuZDogJywgZGF0YS5idWxsZXRJZClcbiAgICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgcmVtb3ZlQnVsbGV0LmtpbGwoKVxufVxuIiwiaW1wb3J0IFBsYXllckJ5SWQgZnJvbScuLi9QbGF5ZXJCeUlkJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBvbk1vdmVQbGF5ZXIoZGF0YSkge1xuICAgIGxldCBtb3ZlUGxheWVyID0gUGxheWVyQnlJZC5jYWxsKHRoaXMsIGRhdGEuaWQpXG5cbiAgICAvLyBQbGF5ZXIgbm90IGZvdW5kXG4gICAgaWYgKCEgbW92ZVBsYXllcikge1xuICAgICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgcGxheWVyIHBvc2l0aW9uXG4gICAgbW92ZVBsYXllci54ID0gZGF0YS54XG4gICAgbW92ZVBsYXllci55ID0gZGF0YS55XG5cbiAgICBpZiAobW92ZVBsYXllci54ID4gbW92ZVBsYXllci5sYXN0UG9zaXRpb24ueCkge1xuICAgICAgICBtb3ZlUGxheWVyLmFuaW1hdGlvbnMucGxheSgncmlnaHQnKVxuICAgIH1cbiAgICBlbHNlIGlmIChtb3ZlUGxheWVyLnggPCBtb3ZlUGxheWVyLmxhc3RQb3NpdGlvbi54KVxuICAgIHtcbiAgICAgICAgbW92ZVBsYXllci5hbmltYXRpb25zLnBsYXkoJ2xlZnQnKVxuICAgIH1cbiAgICBlbHNlXG4gICAge1xuICAgICAgICBtb3ZlUGxheWVyLmFuaW1hdGlvbnMuc3RvcCgpXG4gICAgICAgIG1vdmVQbGF5ZXIuZnJhbWUgPSA2XG4gICAgfVxuXG4gICAgbW92ZVBsYXllci5sYXN0UG9zaXRpb24ueCA9IG1vdmVQbGF5ZXIueFxuICAgIG1vdmVQbGF5ZXIubGFzdFBvc2l0aW9uLnkgPSBtb3ZlUGxheWVyLnlcbn1cbiIsImltcG9ydCBFdmVudEhhbmRsZXIgZnJvbSAnLi4vRXZlbnRIYW5kbGVyJ1xuXG5sZXQgZGFtYWdlVGltZW91dCA9IG51bGxcbmxldCBoZWFsaW5nSW50ZXJ2YWwgPSBudWxsXG5sZXQgbGFzdEtub3duSGVhbHRoID0gbnVsbFxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBvblBsYXllckRhbWFnZWQoZGF0YSkge1xuICAgIGlmIChkYXRhLmRhbWFnZWRQbGF5ZXJJZCAhPT0gKCcvIycgKyB0aGlzLnNvY2tldC5pZCkpXG4gICAgICAgIHJldHVyblxuXG4gICAgdGhpcy5wbGF5ZXIubWV0YS5oZWFsdGggPSBkYXRhLmhlYWx0aFxuICAgIEV2ZW50SGFuZGxlci5lbWl0KCdoZWFsdGggdXBkYXRlJywgU3RyaW5nKHRoaXMucGxheWVyLm1ldGEuaGVhbHRoKSlcblxuICAgIGlmICh0aGlzLnBsYXllci5tZXRhLmhlYWx0aCA+IDU1ICYmIHRoaXMucGxheWVyLm1ldGEuaGVhbHRoIDwgMTAwKSB7XG4gICAgICAgIGNsZWFyVGltZW91dChkYW1hZ2VUaW1lb3V0KVxuICAgICAgICBkYW1hZ2VUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAvLyBQbGF5ZXIncyBoZWFsdGggd2lsbCBmdWxseSByZWdlbmVyYXRlXG4gICAgICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdwbGF5ZXIgZnVsbCBoZWFsdGgnLCB7XG4gICAgICAgICAgICAgICAgcm9vbUlkOiB0aGlzLnJvb21JZFxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSwgNTAwMClcbiAgICB9XG5cbiAgICBpZiAodGhpcy5wbGF5ZXIubWV0YS5oZWFsdGggPiAwICYmIHRoaXMucGxheWVyLm1ldGEuaGVhbHRoIDw9IDU1KSB7XG4gICAgICAgIC8vIFdhaXQgNSBzZWNvbmRzIHRvIGJlZ2luIGhlYWxpbmcgcHJvY2Vzc1xuICAgICAgICBjbGVhclRpbWVvdXQoZGFtYWdlVGltZW91dClcbiAgICAgICAgY2xlYXJJbnRlcnZhbChoZWFsaW5nSW50ZXJ2YWwpXG4gICAgICAgIGRhbWFnZVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGxhc3RLbm93bkhlYWx0aCA9IHRoaXMucGxheWVyLm1ldGEuaGVhbHRoXG4gICAgICAgICAgICBoZWFsaW5nSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGxhc3RLbm93bkhlYWx0aCA+PSAxMDApIHtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChoZWFsaW5nSW50ZXJ2YWwpXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGFzdEtub3duSGVhbHRoICs9IDEwXG5cbiAgICAgICAgICAgICAgICAvLyBJbmNyZWFzZSBwbGF5ZXIgaGVhbHRoIGJ5IDEwIGV2ZXJ5IDEvMiBhIHNlY29uZFxuICAgICAgICAgICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ3BsYXllciBoZWFsaW5nJywge1xuICAgICAgICAgICAgICAgICAgICByb29tSWQ6IHRoaXMucm9vbUlkXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0sIDUwMClcbiAgICAgICAgfSwgNTAwMClcbiAgICB9XG59XG4iLCJpbXBvcnQgRXZlbnRIYW5kbGVyIGZyb20gJy4uL0V2ZW50SGFuZGxlcidcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gb25QbGF5ZXJIZWFsdGhVcGRhdGUoZGF0YSkge1xuICAgIGlmIChkYXRhLmlkICE9PSAoJy8jJyArIHRoaXMuc29ja2V0LmlkKSlcbiAgICAgICAgcmV0dXJuXG5cbiAgICB0aGlzLnBsYXllci5tZXRhLmhlYWx0aCA9IGRhdGEuaGVhbHRoXG4gICAgRXZlbnRIYW5kbGVyLmVtaXQoJ2hlYWx0aCB1cGRhdGUnLCBTdHJpbmcodGhpcy5wbGF5ZXIubWV0YS5oZWFsdGgpKVxufVxuIiwiaW1wb3J0IEV2ZW50SGFuZGxlciBmcm9tICcuLi9FdmVudEhhbmRsZXInXG5pbXBvcnQgV2VhcG9ucyBmcm9tICcuLi9XZWFwb25zJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBvblBsYXllclJlc3Bhd24oZGF0YSkge1xuICAgIGlmIChkYXRhLmRhbWFnZWRQbGF5ZXJJZCAhPT0gKCcvIycgKyB0aGlzLnNvY2tldC5pZCkpXG4gICAgICAgIHJldHVyblxuXG4gICAgLy8gU2V0IHByaW1hcnkgd2VhcG9uXG4gICAgdGhpcy5wbGF5ZXIubWV0YS5wcmltYXJ5V2VhcG9uID0gbmV3IFdlYXBvbnNbdGhpcy5wbGF5ZXIubWV0YS5zZWxlY3RlZFByaW1hcnlXZWFwb25JZF0odGhpcylcbiAgICB0aGlzLnBsYXllci5tZXRhLnByaW1hcnlXZWFwb24uaWQgPSB0aGlzLnBsYXllci5tZXRhLnNlbGVjdGVkUHJpbWFyeVdlYXBvbklkXG5cbiAgICBpZiAodGhpcy5jdXJyZW50V2VhcG9uID09PSAncHJpbWFyeVdlYXBvbicpXG4gICAgICAgIHRoaXMuYWs0N1Nwcml0ZS5sb2FkVGV4dHVyZSh0aGlzLnBsYXllci5tZXRhLnNlbGVjdGVkUHJpbWFyeVdlYXBvbklkKVxuXG4gICAgLy8gU2V0IHNlY29uZGFyeSB3ZWFwb25cbiAgICB0aGlzLnBsYXllci5tZXRhLnNlY29uZGFyeVdlYXBvbiA9IG5ldyBXZWFwb25zW3RoaXMucGxheWVyLm1ldGEuc2VsZWN0ZWRTZWNvbmRhcnlXZWFwb25JZF0odGhpcylcbiAgICB0aGlzLnBsYXllci5tZXRhLnNlY29uZGFyeVdlYXBvbi5pZCA9IHRoaXMucGxheWVyLm1ldGEuc2VsZWN0ZWRTZWNvbmRhcnlXZWFwb25JZFxuXG4gICAgaWYgKHRoaXMuY3VycmVudFdlYXBvbiA9PT0gJ3NlY29uZGFyeVdlYXBvbicpXG4gICAgICAgIHRoaXMuYWs0N1Nwcml0ZS5sb2FkVGV4dHVyZSh0aGlzLnBsYXllci5tZXRhLnNlbGVjdGVkU2Vjb25kYXJ5V2VhcG9uSWQpXG5cbiAgICAvLyBSZXNldCBoZWFsdGhcbiAgICB0aGlzLnBsYXllci5tZXRhLmhlYWx0aCA9IGRhdGEuaGVhbHRoXG4gICAgRXZlbnRIYW5kbGVyLmVtaXQoJ2hlYWx0aCB1cGRhdGUnLCBTdHJpbmcodGhpcy5wbGF5ZXIubWV0YS5oZWFsdGgpKVxuXG4gICAgLy8gU3Bhd24gcGxheWVyXG4gICAgbGV0IHNwYXduUG9pbnQgPSB0aGlzLm1hcEluc3RhbmNlLmdldFJhbmRvbVNwYXduUG9pbnQoKVxuICAgIHRoaXMucGxheWVyLnggPSBzcGF3blBvaW50LnhcbiAgICB0aGlzLnBsYXllci55ID0gc3Bhd25Qb2ludC55XG59XG4iLCJpbXBvcnQgUGxheWVyQnlJZCBmcm9tICcuLi9QbGF5ZXJCeUlkJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBvblJlbW92ZVBsYXllcihkYXRhKSB7XG4gICAgbGV0IHJlbW92ZVBsYXllciA9IFBsYXllckJ5SWQuY2FsbCh0aGlzLCBkYXRhLmlkKVxuXG4gICAgLy8gUGxheWVyIG5vdCBmb3VuZFxuICAgIGlmICghcmVtb3ZlUGxheWVyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdQbGF5ZXIgbm90IGZvdW5kOiAnLCBkYXRhLmlkKVxuICAgICAgICByZXR1cm5cbiAgICB9XG5cbiAgICByZW1vdmVQbGF5ZXIucGxheWVyLmtpbGwoKVxuXG4gICAgLy8gUmVtb3ZlIHBsYXllciBmcm9tIGFycmF5XG4gICAgdGhpcy5lbmVtaWVzLnNwbGljZSh0aGlzLmVuZW1pZXMuaW5kZXhPZihyZW1vdmVQbGF5ZXIpLCAxKVxufVxuIiwiaW1wb3J0IEdldFF1ZXJ5U3RyaW5nIGZyb20gJy4uL0dldFF1ZXJ5U3RyaW5nJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBvblNvY2tldENvbm5lY3RlZCgpIHtcbiAgICBjb25zb2xlLmxvZygnQ29ubmVjdGVkIHRvIHNvY2tldCBzZXJ2ZXInKVxuXG4gICAgIC8vIFJlc2V0IGVuZW1pZXMgb24gcmVjb25uZWN0XG4gICAgdGhpcy5lbmVtaWVzLmZvckVhY2goZnVuY3Rpb24gKGVuZW15KSB7XG4gICAgICAgIGlmIChlbmVteSkgZW5lbXkua2lsbCgpXG4gICAgfSlcblxuICAgIHRoaXMuZW5lbWllcyA9IFtdXG5cbiAgICAvLyBTZW5kIGxvY2FsIHBsYXllciBkYXRhIHRvIHRoZSBnYW1lIHNlcnZlclxuICAgIHRoaXMuc29ja2V0LmVtaXQoJ25ldyBwbGF5ZXInLCB7XG4gICAgICAgIHJvb21JZDogR2V0UXVlcnlTdHJpbmcoJ3Jvb21JZCcpLFxuICAgICAgICB4OiB0aGlzLnBsYXllci54LFxuICAgICAgICB5OiB0aGlzLnBsYXllci55XG4gICAgfSlcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG9uU29ja2V0RGlzY29ubmVjdCgpIHtcbiAgICBjb25zb2xlLmxvZygnRGlzY29ubmVjdGVkIGZyb20gc29ja2V0IHNlcnZlcicpXG59XG4iLCJpbXBvcnQgUmVtb3RlUGxheWVyIGZyb20gJy4uL1JlbW90ZVBsYXllcidcbmltcG9ydCBFdmVudEhhbmRsZXIgZnJvbSAnLi4vRXZlbnRIYW5kbGVyJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBvblVwZGF0ZVBsYXllcnMoZGF0YSkge1xuICAgIHRoaXMucm9vbUlkID0gZGF0YS5yb29tLmlkXG5cbiAgICBsZXQgbmV3dXJsID0gd2luZG93LmxvY2F0aW9uLnByb3RvY29sICsgXCIvL1wiICsgd2luZG93LmxvY2F0aW9uLmhvc3QgKyB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgKyAnP3Jvb21JZD0nICsgZGF0YS5yb29tLmlkO1xuICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSh7IHBhdGg6IG5ld3VybCB9LCAnJywgbmV3dXJsKTtcblxuICAgIHRoaXMuZW5lbWllcy5mb3JFYWNoKGZ1bmN0aW9uIChlbmVteSkge1xuICAgICAgICBlbmVteS5raWxsKClcbiAgICB9KVxuXG4gICAgdGhpcy5lbmVtaWVzID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpXG5cbiAgICBFdmVudEhhbmRsZXIuZW1pdCgncGxheWVycyB1cGRhdGUnLCBkYXRhLnJvb20ucGxheWVycylcblxuICAgIGRhdGEucm9vbS5wbGF5ZXJzLmZvckVhY2goKHBsYXllcikgPT4ge1xuICAgICAgICBpZiAocGxheWVyLmlkID09PSAoJy8jJyArIHRoaXMuc29ja2V0LmlkKSkge1xuICAgICAgICAgICAgRXZlbnRIYW5kbGVyLmVtaXQoJ3Njb3JlIHVwZGF0ZScsIFN0cmluZyhwbGF5ZXIubWV0YS5zY29yZSkpXG4gICAgICAgICAgICBFdmVudEhhbmRsZXIuZW1pdCgnaGVhbHRoIHVwZGF0ZScsIFN0cmluZyhwbGF5ZXIubWV0YS5oZWFsdGgpKVxuICAgICAgICAgICAgRXZlbnRIYW5kbGVyLmVtaXQoJ3BsYXllciB1cGRhdGUnLCB7IHBsYXllciB9KVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICBsZXQgbmV3UmVtb3RlUGxheWVyID0gUmVtb3RlUGxheWVyLmNhbGwodGhpcywgcGxheWVyKVxuICAgICAgICB0aGlzLmVuZW1pZXMuYWRkKG5ld1JlbW90ZVBsYXllcilcbiAgICB9KVxufVxuIiwiaW1wb3J0IEZpcmVTdGFuZGFyZEJ1bGxldCBmcm9tICcuLi9GaXJlU3RhbmRhcmRCdWxsZXQnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFLNDcgZXh0ZW5kcyBQaGFzZXIuR3JvdXAge1xuICAgIGNvbnN0cnVjdG9yKHJvb3RTY29wZSkge1xuICAgICAgICBzdXBlcihyb290U2NvcGUpXG5cbiAgICAgICAgdGhpcy5yb290U2NvcGUgPSByb290U2NvcGVcblxuICAgICAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCB0aGlzLnJvb3RTY29wZS5nYW1lLCB0aGlzLnJvb3RTY29wZS5nYW1lLndvcmxkLCAnQUstNDcnLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKVxuXG4gICAgICAgIHRoaXMuYnVsbGV0SGVpZ2h0ID0gMlxuICAgICAgICB0aGlzLmJ1bGxldFNwZWVkID0gMjMwMFxuICAgICAgICB0aGlzLmJ1bGxldFdpZHRoID0gNDBcbiAgICAgICAgdGhpcy5kYW1hZ2UgPSAyMlxuICAgICAgICB0aGlzLmZpcmVSYXRlID0gMTYwXG4gICAgICAgIHRoaXMuZnggPSB0aGlzLnJvb3RTY29wZS5nYW1lLmFkZC5hdWRpbygnQUs0Ny1zb3VuZCcpXG4gICAgICAgIHRoaXMubmV4dEZpcmUgPSAwXG4gICAgfVxuXG4gICAgZmlyZSgpIHtcbiAgICAgICAgaWYgKHRoaXMucm9vdFNjb3BlLmdhbWUudGltZS5ub3cgPCB0aGlzLm5leHRGaXJlIHx8IHRoaXMucm9vdFNjb3BlLmJ1bGxldHMuY291bnREZWFkKCkgPD0gMClcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLnJvb3RTY29wZS5nYW1lLnRpbWUubm93ICsgdGhpcy5maXJlUmF0ZVxuXG4gICAgICAgIEZpcmVTdGFuZGFyZEJ1bGxldC5jYWxsKHRoaXMpXG4gICAgfVxufVxuIiwiaW1wb3J0IEZpcmVTdGFuZGFyZEJ1bGxldCBmcm9tICcuLi9GaXJlU3RhbmRhcmRCdWxsZXQnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFVRyBleHRlbmRzIFBoYXNlci5Hcm91cCB7XG4gICAgY29uc3RydWN0b3Iocm9vdFNjb3BlKSB7XG4gICAgICAgIHN1cGVyKHJvb3RTY29wZSlcblxuICAgICAgICB0aGlzLnJvb3RTY29wZSA9IHJvb3RTY29wZVxuXG4gICAgICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIHRoaXMucm9vdFNjb3BlLmdhbWUsIHRoaXMucm9vdFNjb3BlLmdhbWUud29ybGQsICdBVUcnLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKVxuXG4gICAgICAgIHRoaXMuYnVsbGV0SGVpZ2h0ID0gMlxuICAgICAgICB0aGlzLmJ1bGxldFNwZWVkID0gMjMwMFxuICAgICAgICB0aGlzLmJ1bGxldFdpZHRoID0gNDBcbiAgICAgICAgdGhpcy5kYW1hZ2UgPSAyMlxuICAgICAgICB0aGlzLmZpcmVSYXRlID0gMTYwXG4gICAgICAgIHRoaXMuZnggPSB0aGlzLnJvb3RTY29wZS5nYW1lLmFkZC5hdWRpbygnQVVHLXNvdW5kJylcbiAgICAgICAgdGhpcy5uZXh0RmlyZSA9IDBcbiAgICB9XG5cbiAgICBmaXJlKCkge1xuICAgICAgICBpZiAodGhpcy5yb290U2NvcGUuZ2FtZS50aW1lLm5vdyA8IHRoaXMubmV4dEZpcmUgfHwgdGhpcy5yb290U2NvcGUuYnVsbGV0cy5jb3VudERlYWQoKSA8PSAwKVxuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMucm9vdFNjb3BlLmdhbWUudGltZS5ub3cgKyB0aGlzLmZpcmVSYXRlXG5cbiAgICAgICAgRmlyZVN0YW5kYXJkQnVsbGV0LmNhbGwodGhpcylcbiAgICB9XG59XG4iLCJpbXBvcnQgRmlyZVN0YW5kYXJkQnVsbGV0IGZyb20gJy4uL0ZpcmVTdGFuZGFyZEJ1bGxldCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmFycmV0dCBleHRlbmRzIFBoYXNlci5Hcm91cCB7XG4gICAgY29uc3RydWN0b3Iocm9vdFNjb3BlKSB7XG4gICAgICAgIHN1cGVyKHJvb3RTY29wZSlcblxuICAgICAgICB0aGlzLnJvb3RTY29wZSA9IHJvb3RTY29wZVxuXG4gICAgICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIHRoaXMucm9vdFNjb3BlLmdhbWUsIHRoaXMucm9vdFNjb3BlLmdhbWUud29ybGQsICdBSy00NycsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpXG5cbiAgICAgICAgdGhpcy5idWxsZXRIZWlnaHQgPSAyXG4gICAgICAgIHRoaXMuYnVsbGV0U3BlZWQgPSAzNDM1XG4gICAgICAgIHRoaXMuYnVsbGV0V2lkdGggPSA0MFxuICAgICAgICB0aGlzLmRhbWFnZSA9IDg4XG4gICAgICAgIHRoaXMuZmlyZVJhdGUgPSAzMDAwXG4gICAgICAgIHRoaXMuZnggPSB0aGlzLnJvb3RTY29wZS5nYW1lLmFkZC5hdWRpbygnQmFycmV0TTkwLXNvdW5kJylcbiAgICAgICAgdGhpcy5uZXh0RmlyZSA9IDBcbiAgICB9XG5cbiAgICBmaXJlKCkge1xuICAgICAgICBpZiAodGhpcy5yb290U2NvcGUuZ2FtZS50aW1lLm5vdyA8IHRoaXMubmV4dEZpcmUgfHwgdGhpcy5yb290U2NvcGUuYnVsbGV0cy5jb3VudERlYWQoKSA8PSAwKVxuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMucm9vdFNjb3BlLmdhbWUudGltZS5ub3cgKyB0aGlzLmZpcmVSYXRlXG5cbiAgICAgICAgRmlyZVN0YW5kYXJkQnVsbGV0LmNhbGwodGhpcylcbiAgICB9XG59XG4iLCJpbXBvcnQgRmlyZVN0YW5kYXJkQnVsbGV0IGZyb20gJy4uL0ZpcmVTdGFuZGFyZEJ1bGxldCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGVzZXJ0RWFnbGUgZXh0ZW5kcyBQaGFzZXIuR3JvdXAge1xuICAgIGNvbnN0cnVjdG9yKHJvb3RTY29wZSkge1xuICAgICAgICBzdXBlcihyb290U2NvcGUpXG5cbiAgICAgICAgdGhpcy5yb290U2NvcGUgPSByb290U2NvcGVcblxuICAgICAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCByb290U2NvcGUuZ2FtZSwgcm9vdFNjb3BlLmdhbWUud29ybGQsICdEZXNlcnQgRWFnbGUnLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKVxuXG4gICAgICAgIHRoaXMuYnVsbGV0SGVpZ2h0ID0gMlxuICAgICAgICB0aGlzLmJ1bGxldFNwZWVkID0gMjMwMFxuICAgICAgICB0aGlzLmJ1bGxldFdpZHRoID0gNDBcbiAgICAgICAgdGhpcy5kYW1hZ2UgPSAzM1xuICAgICAgICB0aGlzLmZpcmVSYXRlID0gMjY3XG4gICAgICAgIHRoaXMuZnggPSByb290U2NvcGUuZ2FtZS5hZGQuYXVkaW8oJ0Rlc2VydEVhZ2xlLXNvdW5kJylcbiAgICAgICAgdGhpcy5uZXh0RmlyZSA9IDBcbiAgICB9XG5cbiAgICBmaXJlKCkge1xuICAgICAgICBpZiAodGhpcy5yb290U2NvcGUuZ2FtZS50aW1lLm5vdyA8IHRoaXMubmV4dEZpcmUgfHwgdGhpcy5yb290U2NvcGUuYnVsbGV0cy5jb3VudERlYWQoKSA8PSAwKVxuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMucm9vdFNjb3BlLmdhbWUudGltZS5ub3cgKyB0aGlzLmZpcmVSYXRlXG5cbiAgICAgICAgRmlyZVN0YW5kYXJkQnVsbGV0LmNhbGwodGhpcylcbiAgICB9XG59XG4iLCJpbXBvcnQgRmlyZVN0YW5kYXJkQnVsbGV0IGZyb20gJy4uL0ZpcmVTdGFuZGFyZEJ1bGxldCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRzQzIGV4dGVuZHMgUGhhc2VyLkdyb3VwIHtcbiAgICBjb25zdHJ1Y3Rvcihyb290U2NvcGUpIHtcbiAgICAgICAgc3VwZXIocm9vdFNjb3BlKVxuXG4gICAgICAgIHRoaXMucm9vdFNjb3BlID0gcm9vdFNjb3BlXG5cbiAgICAgICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgdGhpcy5yb290U2NvcGUuZ2FtZSwgdGhpcy5yb290U2NvcGUuZ2FtZS53b3JsZCwgJ0c0MycsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpXG5cbiAgICAgICAgdGhpcy5idWxsZXRIZWlnaHQgPSAyXG4gICAgICAgIHRoaXMuYnVsbGV0U3BlZWQgPSAyMzAwXG4gICAgICAgIHRoaXMuYnVsbGV0V2lkdGggPSA0MFxuICAgICAgICB0aGlzLmRhbWFnZSA9IDQ0XG4gICAgICAgIHRoaXMuZmlyZVJhdGUgPSAxMzAwXG4gICAgICAgIHRoaXMuZnggPSB0aGlzLnJvb3RTY29wZS5nYW1lLmFkZC5hdWRpbygnRzQzLXNvdW5kJylcbiAgICAgICAgdGhpcy5uZXh0RmlyZSA9IDBcbiAgICB9XG5cbiAgICBmaXJlKCkge1xuICAgICAgICBpZiAodGhpcy5yb290U2NvcGUuZ2FtZS50aW1lLm5vdyA8IHRoaXMubmV4dEZpcmUgfHwgdGhpcy5yb290U2NvcGUuYnVsbGV0cy5jb3VudERlYWQoKSA8PSAwKVxuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMucm9vdFNjb3BlLmdhbWUudGltZS5ub3cgKyB0aGlzLmZpcmVSYXRlXG5cbiAgICAgICAgRmlyZVN0YW5kYXJkQnVsbGV0LmNhbGwodGhpcylcbiAgICB9XG59XG4iLCJpbXBvcnQgRmlyZVN0YW5kYXJkQnVsbGV0IGZyb20gJy4uL0ZpcmVTdGFuZGFyZEJ1bGxldCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTTRBMSBleHRlbmRzIFBoYXNlci5Hcm91cCB7XG4gICAgY29uc3RydWN0b3Iocm9vdFNjb3BlKSB7XG4gICAgICAgIHN1cGVyKHJvb3RTY29wZSlcblxuICAgICAgICB0aGlzLnJvb3RTY29wZSA9IHJvb3RTY29wZVxuXG4gICAgICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIHRoaXMucm9vdFNjb3BlLmdhbWUsIHRoaXMucm9vdFNjb3BlLmdhbWUud29ybGQsICdNNEExJywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSlcblxuICAgICAgICB0aGlzLmJ1bGxldEhlaWdodCA9IDJcbiAgICAgICAgdGhpcy5idWxsZXRTcGVlZCA9IDI0MDBcbiAgICAgICAgdGhpcy5idWxsZXRXaWR0aCA9IDQwXG4gICAgICAgIHRoaXMuZGFtYWdlID0gMjBcbiAgICAgICAgdGhpcy5maXJlUmF0ZSA9IDE1MFxuICAgICAgICB0aGlzLmZ4ID0gdGhpcy5yb290U2NvcGUuZ2FtZS5hZGQuYXVkaW8oJ000QTEtc291bmQnKVxuICAgICAgICB0aGlzLm5leHRGaXJlID0gMFxuICAgIH1cblxuICAgIGZpcmUoKSB7XG4gICAgICAgIGlmICh0aGlzLnJvb3RTY29wZS5nYW1lLnRpbWUubm93IDwgdGhpcy5uZXh0RmlyZSB8fCB0aGlzLnJvb3RTY29wZS5idWxsZXRzLmNvdW50RGVhZCgpIDw9IDApXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5yb290U2NvcGUuZ2FtZS50aW1lLm5vdyArIHRoaXMuZmlyZVJhdGVcblxuICAgICAgICBGaXJlU3RhbmRhcmRCdWxsZXQuY2FsbCh0aGlzKVxuICAgIH1cbn1cbiIsImltcG9ydCBGaXJlU2hvdGd1blNoZWxsIGZyb20gJy4uL0ZpcmVTaG90Z3VuU2hlbGwnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE01MDAgZXh0ZW5kcyBQaGFzZXIuR3JvdXAge1xuICAgIGNvbnN0cnVjdG9yKHJvb3RTY29wZSkge1xuICAgICAgICBzdXBlcihyb290U2NvcGUpXG5cbiAgICAgICAgdGhpcy5yb290U2NvcGUgPSByb290U2NvcGVcblxuICAgICAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCB0aGlzLnJvb3RTY29wZS5nYW1lLCB0aGlzLnJvb3RTY29wZS5nYW1lLndvcmxkLCAnTTUwMCcsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpXG5cbiAgICAgICAgdGhpcy5idWxsZXRIZWlnaHQgPSAyXG4gICAgICAgIHRoaXMuYnVsbGV0U3BlZWQgPSAxOTAwXG4gICAgICAgIHRoaXMuYnVsbGV0V2lkdGggPSA0MFxuICAgICAgICB0aGlzLmZpcmVSYXRlID0gMTY1MFxuICAgICAgICB0aGlzLmZ4ID0gdGhpcy5yb290U2NvcGUuZ2FtZS5hZGQuYXVkaW8oJ001MDAtc291bmQnKVxuICAgICAgICB0aGlzLm5leHRGaXJlID0gMFxuICAgIH1cblxuICAgIGZpcmUoKSB7XG4gICAgICAgIGlmICh0aGlzLnJvb3RTY29wZS5nYW1lLnRpbWUubm93IDwgdGhpcy5uZXh0RmlyZSB8fCB0aGlzLnJvb3RTY29wZS5idWxsZXRzLmNvdW50RGVhZCgpIDw9IDApXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5yb290U2NvcGUuZ2FtZS50aW1lLm5vdyArIHRoaXMuZmlyZVJhdGVcblxuICAgICAgICBGaXJlU2hvdGd1blNoZWxsLmNhbGwodGhpcylcbiAgICB9XG59XG4iLCJpbXBvcnQgRmlyZVN0YW5kYXJkQnVsbGV0IGZyb20gJy4uL0ZpcmVTdGFuZGFyZEJ1bGxldCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUDkwIGV4dGVuZHMgUGhhc2VyLkdyb3VwIHtcbiAgICBjb25zdHJ1Y3Rvcihyb290U2NvcGUpIHtcbiAgICAgICAgc3VwZXIocm9vdFNjb3BlKVxuXG4gICAgICAgIHRoaXMucm9vdFNjb3BlID0gcm9vdFNjb3BlXG5cbiAgICAgICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgdGhpcy5yb290U2NvcGUuZ2FtZSwgdGhpcy5yb290U2NvcGUuZ2FtZS53b3JsZCwgJ1A5MCcsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpXG5cbiAgICAgICAgdGhpcy5idWxsZXRIZWlnaHQgPSAyXG4gICAgICAgIHRoaXMuYnVsbGV0U3BlZWQgPSAyMzAwXG4gICAgICAgIHRoaXMuYnVsbGV0V2lkdGggPSA0MFxuICAgICAgICB0aGlzLmRhbWFnZSA9IDIyXG4gICAgICAgIHRoaXMuZmlyZVJhdGUgPSAxMjBcbiAgICAgICAgdGhpcy5meCA9IHRoaXMucm9vdFNjb3BlLmdhbWUuYWRkLmF1ZGlvKCdQOTAtc291bmQnKVxuICAgICAgICB0aGlzLm5leHRGaXJlID0gMFxuICAgIH1cblxuICAgIGZpcmUoKSB7XG4gICAgICAgIGlmICh0aGlzLnJvb3RTY29wZS5nYW1lLnRpbWUubm93IDwgdGhpcy5uZXh0RmlyZSB8fCB0aGlzLnJvb3RTY29wZS5idWxsZXRzLmNvdW50RGVhZCgpIDw9IDApXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5yb290U2NvcGUuZ2FtZS50aW1lLm5vdyArIHRoaXMuZmlyZVJhdGVcblxuICAgICAgICBGaXJlU3RhbmRhcmRCdWxsZXQuY2FsbCh0aGlzKVxuICAgIH1cbn1cbiIsImltcG9ydCBGaXJlUm9ja2V0IGZyb20gJy4uL0ZpcmVSb2NrZXQnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJQRyBleHRlbmRzIFBoYXNlci5Hcm91cCB7XG4gICAgY29uc3RydWN0b3Iocm9vdFNjb3BlKSB7XG4gICAgICAgIHN1cGVyKHJvb3RTY29wZSlcblxuICAgICAgICB0aGlzLnJvb3RTY29wZSA9IHJvb3RTY29wZVxuXG4gICAgICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIHRoaXMucm9vdFNjb3BlLmdhbWUsIHRoaXMucm9vdFNjb3BlLmdhbWUud29ybGQsICdBSy00NycsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpXG5cbiAgICAgICAgdGhpcy5idWxsZXRIZWlnaHQgPSAyXG4gICAgICAgIHRoaXMuYnVsbGV0U3BlZWQgPSAyMzAwXG4gICAgICAgIHRoaXMuYnVsbGV0V2lkdGggPSA0MFxuICAgICAgICB0aGlzLmRhbWFnZSA9IDIyXG4gICAgICAgIHRoaXMuZmlyZVJhdGUgPSAzMDAwXG4gICAgICAgIHRoaXMuZnggPSB0aGlzLnJvb3RTY29wZS5nYW1lLmFkZC5hdWRpbygnUlBHLXNvdW5kJylcbiAgICAgICAgdGhpcy5uZXh0RmlyZSA9IDBcbiAgICB9XG5cbiAgICBmaXJlKCkge1xuICAgICAgICBpZiAodGhpcy5yb290U2NvcGUuZ2FtZS50aW1lLm5vdyA8IHRoaXMubmV4dEZpcmUgfHwgdGhpcy5yb290U2NvcGUuYnVsbGV0cy5jb3VudERlYWQoKSA8PSAwKVxuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMucm9vdFNjb3BlLmdhbWUudGltZS5ub3cgKyB0aGlzLmZpcmVSYXRlXG5cbiAgICAgICAgRmlyZVJvY2tldC5jYWxsKHRoaXMpXG4gICAgfVxufVxuXG4vL1xuLy8gLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gLy8gIFJQRyB0aGF0IHZpc3VhbGx5IHRyYWNrIHRoZSBkaXJlY3Rpb24gdGhleSdyZSBoZWFkaW5nIGluIC8vXG4vLyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vL1xuLy8gV2VhcG9uLlJQRyA9IGZ1bmN0aW9uIChnYW1lKSB7XG4vL1xuLy8gICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGdhbWUsIGdhbWUud29ybGQsICdSUEcnLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcbi8vXG4vLyAgICAgdGhpcy5uZXh0RmlyZSA9IDA7XG4vLyAgICAgdGhpcy5idWxsZXRTcGVlZCA9IDQwMDtcbi8vICAgICB0aGlzLmZpcmVSYXRlID0gMjUwO1xuLy9cbi8vICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDMyOyBpKyspXG4vLyAgICAge1xuLy8gICAgICAgICB0aGlzLmFkZChuZXcgQnVsbGV0KGdhbWUsICdidWxsZXQxMCcpLCB0cnVlKTtcbi8vICAgICB9XG4vL1xuLy8gICAgIHRoaXMuc2V0QWxsKCd0cmFja2luZycsIHRydWUpXG4vL1xuLy8gICAgIHJldHVybiB0aGlzO1xuLy9cbi8vIH07XG4vL1xuLy8gV2VhcG9uLlJQRy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuLy8gV2VhcG9uLlJQRy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBXZWFwb24uUlBHO1xuLy9cbi8vIFdlYXBvbi5SUEcucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbiAoc291cmNlKSB7XG4vL1xuLy8gICAgIGlmICh0aGlzLmdhbWUudGltZS50aW1lIDwgdGhpcy5uZXh0RmlyZSkgeyByZXR1cm47IH1cbi8vXG4vLyAgICAgdmFyIHggPSBzb3VyY2UueCArIDEwO1xuLy8gICAgIHZhciB5ID0gc291cmNlLnkgKyAxMDtcbi8vXG4vLyAgICAgdGhpcy5nZXRGaXJzdEV4aXN0cyhmYWxzZSkuZmlyZSh4LCB5LCAwLCB0aGlzLmJ1bGxldFNwZWVkLCAwLCAtNzAwKTtcbi8vICAgICB0aGlzLmdldEZpcnN0RXhpc3RzKGZhbHNlKS5maXJlKHgsIHksIDAsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDcwMCk7XG4vL1xuLy8gICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLmdhbWUudGltZS50aW1lICsgdGhpcy5maXJlUmF0ZTtcbi8vXG4vLyB9O1xuIiwiaW1wb3J0IEZpcmVTdGFuZGFyZEJ1bGxldCBmcm9tICcuLi9GaXJlU3RhbmRhcmRCdWxsZXQnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNrb3JwaW9uIGV4dGVuZHMgUGhhc2VyLkdyb3VwIHtcbiAgICBjb25zdHJ1Y3Rvcihyb290U2NvcGUpIHtcbiAgICAgICAgc3VwZXIocm9vdFNjb3BlKVxuXG4gICAgICAgIHRoaXMucm9vdFNjb3BlID0gcm9vdFNjb3BlXG5cbiAgICAgICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgdGhpcy5yb290U2NvcGUuZ2FtZSwgdGhpcy5yb290U2NvcGUuZ2FtZS53b3JsZCwgJ1Nrb3JwaW9uJywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSlcblxuICAgICAgICB0aGlzLmJ1bGxldEhlaWdodCA9IDJcbiAgICAgICAgdGhpcy5idWxsZXRTcGVlZCA9IDIzMDBcbiAgICAgICAgdGhpcy5idWxsZXRXaWR0aCA9IDQwXG4gICAgICAgIHRoaXMuZGFtYWdlID0gMjJcbiAgICAgICAgdGhpcy5maXJlUmF0ZSA9IDEyMFxuICAgICAgICB0aGlzLmZ4ID0gdGhpcy5yb290U2NvcGUuZ2FtZS5hZGQuYXVkaW8oJ1Nrb3JwaW9uLXNvdW5kJylcbiAgICAgICAgdGhpcy5uZXh0RmlyZSA9IDBcbiAgICB9XG5cbiAgICBmaXJlKCkge1xuICAgICAgICBpZiAodGhpcy5yb290U2NvcGUuZ2FtZS50aW1lLm5vdyA8IHRoaXMubmV4dEZpcmUgfHwgdGhpcy5yb290U2NvcGUuYnVsbGV0cy5jb3VudERlYWQoKSA8PSAwKVxuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMucm9vdFNjb3BlLmdhbWUudGltZS5ub3cgKyB0aGlzLmZpcmVSYXRlXG5cbiAgICAgICAgRmlyZVN0YW5kYXJkQnVsbGV0LmNhbGwodGhpcylcbiAgICB9XG59XG4iLCJpbXBvcnQgQUs0NyBmcm9tICcuL0FLNDcnXG5pbXBvcnQgQVVHIGZyb20gJy4vQVVHJ1xuaW1wb3J0IEJhcnJldHQgZnJvbSAnLi9CYXJyZXR0J1xuaW1wb3J0IERlc2VydEVhZ2xlIGZyb20gJy4vRGVzZXJ0RWFnbGUnXG5pbXBvcnQgRzQzIGZyb20gJy4vRzQzJ1xuaW1wb3J0IE00QTEgZnJvbSAnLi9NNEExJ1xuaW1wb3J0IE01MDAgZnJvbSAnLi9NNTAwJ1xuaW1wb3J0IFA5MCBmcm9tICcuL1A5MCdcbmltcG9ydCBSUEcgZnJvbSAnLi9SUEcnXG5pbXBvcnQgU2tvcnBpb24gZnJvbSAnLi9Ta29ycGlvbidcblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIEFLNDcsXG4gICAgQVVHLFxuICAgIEJhcnJldHQsXG4gICAgRGVzZXJ0RWFnbGUsXG4gICAgRzQzLFxuICAgIE00QTEsXG4gICAgTTUwMCxcbiAgICBQOTAsXG4gICAgUlBHLFxuICAgIFNrb3JwaW9uXG59XG4iLCJjb25zdCBzcGF3blBvaW50cyA9IFtcbiAgICB7IHg6IDgxNSwgeTogMTczMCB9LFxuICAgIHsgeDogMzM4MCwgeTogMTAzMCB9LFxuICAgIHsgeDogNDQzNywgeTogMTU1MCB9LFxuICAgIHsgeDogNjY5MCwgeTogMTg2MCB9LFxuICAgIHsgeDogMzgzMiwgeTogMzM1MCB9LFxuICAgIHsgeDogMzc3NSwgeTogMjMwMCB9LFxuICAgIHsgeDogMjQyMCwgeTogMjkwMCB9XG5dXG5cbmNvbnN0IGxlZGdlcyA9IFtcbiAgICB7IGlkOiAxLCB4OiAyMTQ1LCB5OiAyMDY1LCB3aWR0aDogMTM1LCBoZWlnaHQ6IDQwIH0sXG4gICAgeyBpZDogMiwgeDogMjYxMywgeTogMTA5NCwgd2lkdGg6IDExMDAsIGhlaWdodDogMTEyIH0sXG4gICAgeyBpZDogMywgeDogMzY1NywgeTogMzQ0Niwgd2lkdGg6IDUwMCwgaGVpZ2h0OiA2MDAgfSxcbiAgICB7IGlkOiA0LCB4OiA1MjE3LCB5OiAxOTM4LCB3aWR0aDogMzgwLCBoZWlnaHQ6IDYwMCB9LFxuICAgIHsgaWQ6IDUsIHg6IDQyMiwgeTogMTgyNCwgd2lkdGg6IDExNTAsIGhlaWdodDogMzAwIH0sXG4gICAgeyBpZDogNiwgeDogMTU1NSwgeTogMTc0OSwgd2lkdGg6IDI3MCwgaGVpZ2h0OiA3MzAgfSxcbiAgICB7IGlkOiA3LCB4OiAxODIwLCB5OiAxNzQ5LCB3aWR0aDogNDcwLCBoZWlnaHQ6IDYgfSxcbiAgICB7IGlkOiA4LCB4OiAyMjc1LCB5OiAxNzQ5LCB3aWR0aDogMzIwLCBoZWlnaHQ6IDYzMCB9LFxuICAgIHsgaWQ6IDksIHg6IDI1OTUsIHk6IDE2NjcsIHdpZHRoOiAxMTIwLCBoZWlnaHQ6IDI2MCB9LFxuICAgIHsgaWQ6IDEwLCB4OiA0MzA0LCB5OiAxNjIxLCB3aWR0aDogMzc1LCBoZWlnaHQ6IDEzMDAgfSxcbiAgICB7IGlkOiAxMSwgeDogMTgyNSwgeTogMjI5OCwgd2lkdGg6IDE2MCwgaGVpZ2h0OiAxNTIgfSxcbiAgICB7IGlkOiAxMiwgeDogNTY0NCwgeTogMTU3Mywgd2lkdGg6IDMzMCwgaGVpZ2h0OiAyMCB9LFxuICAgIHsgaWQ6IDEzLCB4OiA0NjczLCB5OiAyMDE3LCB3aWR0aDogNTcwLCBoZWlnaHQ6IDI1NCB9LFxuICAgIHsgaWQ6IDE0LCB4OiAyOTQ4LCB5OiAzMTM3LCB3aWR0aDogMzgwLCBoZWlnaHQ6IDMwMCB9LFxuICAgIHsgaWQ6IDE1LCB4OiAzOTgzLCB5OiAyMDI4LCB3aWR0aDogMzQxLCBoZWlnaHQ6IDcwMCB9LFxuICAgIHsgaWQ6IDE2LCB4OiAxOTEyLCB5OiAyOTY3LCB3aWR0aDogMTA0NSwgaGVpZ2h0OiA1MDAgfSxcbiAgICB7IGlkOiAxNywgeDogNjYyOCwgeTogMTU5MCwgd2lkdGg6IDM4NSwgaGVpZ2h0OiAzNyB9LFxuICAgIHsgaWQ6IDE4LCB4OiA2NjI4LCB5OiAxMTc4LCB3aWR0aDogMzg1LCBoZWlnaHQ6IDM3IH0sXG4gICAgeyBpZDogMTksIHg6IDU1OTAsIHk6IDIwMzgsIHdpZHRoOiAzNTAsIGhlaWdodDogNjAwIH0sXG4gICAgeyBpZDogMjAsIHg6IDY5ODQsIHk6IDE5ODksIHdpZHRoOiA0NTAsIGhlaWdodDogMTY3IH0sXG4gICAgeyBpZDogMjEsIHg6IDM2NzIsIHk6IDI0MDEsIHdpZHRoOiAzMzAsIGhlaWdodDogNTAwIH0sXG4gICAgeyBpZDogMjIsIHg6IDMzMDMsIHk6IDI1OTksIHdpZHRoOiA0MDAsIGhlaWdodDogMzAwIH0sXG4gICAgeyBpZDogMjMsIHg6IDU5NDAsIHk6IDIwMTgsIHdpZHRoOiAxMDUwLCBoZWlnaHQ6IDYwMCB9XG5dXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhpZ2hSdWxlSnVuZ2xlIHtcbiAgICBjb25zdHJ1Y3Rvcihyb290U2NvcGUpIHtcbiAgICAgICAgdGhpcy5yb290U2NvcGUgPSByb290U2NvcGVcbiAgICB9XG5cbiAgICBnZXRSYW5kb21TcGF3blBvaW50KCkge1xuICAgICAgICByZXR1cm4gXy5zYW1wbGUoc3Bhd25Qb2ludHMpXG4gICAgfVxuXG4gICAgY3JlYXRlKCkge1xuICAgICAgICB0aGlzLnJvb3RTY29wZS5za3lzcHJpdGUgPSB0aGlzLnJvb3RTY29wZS5hZGQudGlsZVNwcml0ZSgwLCAwLCB0aGlzLnJvb3RTY29wZS5nYW1lLndvcmxkLndpZHRoLCB0aGlzLnJvb3RTY29wZS5nYW1lLndvcmxkLmhlaWdodCwgJ21hcC1iZycpXG4gICAgICAgIHRoaXMucm9vdFNjb3BlLnBsYXRmb3JtcyA9IHRoaXMucm9vdFNjb3BlLmFkZC5ncm91cCgpXG4gICAgICAgIHRoaXMucm9vdFNjb3BlLnBsYXRmb3Jtcy5lbmFibGVCb2R5ID0gdHJ1ZVxuICAgICAgICB0aGlzLmNyZWF0ZUxlZGdlcygpXG4gICAgICAgIHRoaXMucm9vdFNjb3BlLnBsYXRmb3Jtcy5zZXRBbGwoJ2JvZHkuaW1tb3ZhYmxlJywgdHJ1ZSlcbiAgICAgICAgdGhpcy5yb290U2NvcGUucGxhdGZvcm1zLnNldEFsbCgnYm9keS5hbGxvd0dyYXZpdHknLCBmYWxzZSlcbiAgICB9XG5cbiAgICBjcmVhdGVMZWRnZXMoKSB7XG4gICAgICAgIGxlZGdlcy5mb3JFYWNoKChsZWRnZSkgPT4ge1xuICAgICAgICAgICAgLy8gdmFyIG5ld0xlZGdlID0gdGhpcy5yb290U2NvcGUucGxhdGZvcm1zLmNyZWF0ZShsZWRnZS54LCBsZWRnZS55LCAnZ3JvdW5kJylcbiAgICAgICAgICAgIHZhciBuZXdMZWRnZSA9IHRoaXMucm9vdFNjb3BlLnBsYXRmb3Jtcy5jcmVhdGUobGVkZ2UueCwgbGVkZ2UueSlcbiAgICAgICAgICAgIG5ld0xlZGdlLmhlaWdodCA9IGxlZGdlLmhlaWdodFxuICAgICAgICAgICAgbmV3TGVkZ2Uud2lkdGggPSBsZWRnZS53aWR0aFxuXG4gICAgICAgICAgICAvLyBEZWJ1ZyBzdHVmZlxuICAgICAgICAgICAgLy8gbmV3TGVkZ2UuYWxwaGEgPSAwLjRcbiAgICAgICAgICAgIC8vIGxldCBzdHlsZSA9IHsgZm9udDogXCIyMHB4IEFyaWFsXCIsIGZpbGw6IFwiI2ZmMDA0NFwiLCBhbGlnbjogXCJjZW50ZXJcIiwgYmFja2dyb3VuZENvbG9yOiBcIiNmZmZmMDBcIiB9XG4gICAgICAgICAgICAvLyBsZXQgdGV4dCA9IHRoaXMucm9vdFNjb3BlLmdhbWUuYWRkLnRleHQobGVkZ2UueCwgbGVkZ2UueSwgbGVkZ2UuaWQsIHN0eWxlKVxuICAgICAgICAgICAgLy8gdGV4dC5hbHBoYSA9IDAuMlxuICAgICAgICB9KVxuICAgIH1cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGFzc2lnbiAgICAgICAgPSByZXF1aXJlKCdlczUtZXh0L29iamVjdC9hc3NpZ24nKVxuICAsIG5vcm1hbGl6ZU9wdHMgPSByZXF1aXJlKCdlczUtZXh0L29iamVjdC9ub3JtYWxpemUtb3B0aW9ucycpXG4gICwgaXNDYWxsYWJsZSAgICA9IHJlcXVpcmUoJ2VzNS1leHQvb2JqZWN0L2lzLWNhbGxhYmxlJylcbiAgLCBjb250YWlucyAgICAgID0gcmVxdWlyZSgnZXM1LWV4dC9zdHJpbmcvIy9jb250YWlucycpXG5cbiAgLCBkO1xuXG5kID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZHNjciwgdmFsdWUvKiwgb3B0aW9ucyovKSB7XG5cdHZhciBjLCBlLCB3LCBvcHRpb25zLCBkZXNjO1xuXHRpZiAoKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB8fCAodHlwZW9mIGRzY3IgIT09ICdzdHJpbmcnKSkge1xuXHRcdG9wdGlvbnMgPSB2YWx1ZTtcblx0XHR2YWx1ZSA9IGRzY3I7XG5cdFx0ZHNjciA9IG51bGw7XG5cdH0gZWxzZSB7XG5cdFx0b3B0aW9ucyA9IGFyZ3VtZW50c1syXTtcblx0fVxuXHRpZiAoZHNjciA9PSBudWxsKSB7XG5cdFx0YyA9IHcgPSB0cnVlO1xuXHRcdGUgPSBmYWxzZTtcblx0fSBlbHNlIHtcblx0XHRjID0gY29udGFpbnMuY2FsbChkc2NyLCAnYycpO1xuXHRcdGUgPSBjb250YWlucy5jYWxsKGRzY3IsICdlJyk7XG5cdFx0dyA9IGNvbnRhaW5zLmNhbGwoZHNjciwgJ3cnKTtcblx0fVxuXG5cdGRlc2MgPSB7IHZhbHVlOiB2YWx1ZSwgY29uZmlndXJhYmxlOiBjLCBlbnVtZXJhYmxlOiBlLCB3cml0YWJsZTogdyB9O1xuXHRyZXR1cm4gIW9wdGlvbnMgPyBkZXNjIDogYXNzaWduKG5vcm1hbGl6ZU9wdHMob3B0aW9ucyksIGRlc2MpO1xufTtcblxuZC5ncyA9IGZ1bmN0aW9uIChkc2NyLCBnZXQsIHNldC8qLCBvcHRpb25zKi8pIHtcblx0dmFyIGMsIGUsIG9wdGlvbnMsIGRlc2M7XG5cdGlmICh0eXBlb2YgZHNjciAhPT0gJ3N0cmluZycpIHtcblx0XHRvcHRpb25zID0gc2V0O1xuXHRcdHNldCA9IGdldDtcblx0XHRnZXQgPSBkc2NyO1xuXHRcdGRzY3IgPSBudWxsO1xuXHR9IGVsc2Uge1xuXHRcdG9wdGlvbnMgPSBhcmd1bWVudHNbM107XG5cdH1cblx0aWYgKGdldCA9PSBudWxsKSB7XG5cdFx0Z2V0ID0gdW5kZWZpbmVkO1xuXHR9IGVsc2UgaWYgKCFpc0NhbGxhYmxlKGdldCkpIHtcblx0XHRvcHRpb25zID0gZ2V0O1xuXHRcdGdldCA9IHNldCA9IHVuZGVmaW5lZDtcblx0fSBlbHNlIGlmIChzZXQgPT0gbnVsbCkge1xuXHRcdHNldCA9IHVuZGVmaW5lZDtcblx0fSBlbHNlIGlmICghaXNDYWxsYWJsZShzZXQpKSB7XG5cdFx0b3B0aW9ucyA9IHNldDtcblx0XHRzZXQgPSB1bmRlZmluZWQ7XG5cdH1cblx0aWYgKGRzY3IgPT0gbnVsbCkge1xuXHRcdGMgPSB0cnVlO1xuXHRcdGUgPSBmYWxzZTtcblx0fSBlbHNlIHtcblx0XHRjID0gY29udGFpbnMuY2FsbChkc2NyLCAnYycpO1xuXHRcdGUgPSBjb250YWlucy5jYWxsKGRzY3IsICdlJyk7XG5cdH1cblxuXHRkZXNjID0geyBnZXQ6IGdldCwgc2V0OiBzZXQsIGNvbmZpZ3VyYWJsZTogYywgZW51bWVyYWJsZTogZSB9O1xuXHRyZXR1cm4gIW9wdGlvbnMgPyBkZXNjIDogYXNzaWduKG5vcm1hbGl6ZU9wdHMob3B0aW9ucyksIGRlc2MpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2lzLWltcGxlbWVudGVkJykoKVxuXHQ/IE9iamVjdC5hc3NpZ25cblx0OiByZXF1aXJlKCcuL3NoaW0nKTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG5cdHZhciBhc3NpZ24gPSBPYmplY3QuYXNzaWduLCBvYmo7XG5cdGlmICh0eXBlb2YgYXNzaWduICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gZmFsc2U7XG5cdG9iaiA9IHsgZm9vOiAncmF6JyB9O1xuXHRhc3NpZ24ob2JqLCB7IGJhcjogJ2R3YScgfSwgeyB0cnp5OiAndHJ6eScgfSk7XG5cdHJldHVybiAob2JqLmZvbyArIG9iai5iYXIgKyBvYmoudHJ6eSkgPT09ICdyYXpkd2F0cnp5Jztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBrZXlzICA9IHJlcXVpcmUoJy4uL2tleXMnKVxuICAsIHZhbHVlID0gcmVxdWlyZSgnLi4vdmFsaWQtdmFsdWUnKVxuXG4gICwgbWF4ID0gTWF0aC5tYXg7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGRlc3QsIHNyYy8qLCDigKZzcmNuKi8pIHtcblx0dmFyIGVycm9yLCBpLCBsID0gbWF4KGFyZ3VtZW50cy5sZW5ndGgsIDIpLCBhc3NpZ247XG5cdGRlc3QgPSBPYmplY3QodmFsdWUoZGVzdCkpO1xuXHRhc3NpZ24gPSBmdW5jdGlvbiAoa2V5KSB7XG5cdFx0dHJ5IHsgZGVzdFtrZXldID0gc3JjW2tleV07IH0gY2F0Y2ggKGUpIHtcblx0XHRcdGlmICghZXJyb3IpIGVycm9yID0gZTtcblx0XHR9XG5cdH07XG5cdGZvciAoaSA9IDE7IGkgPCBsOyArK2kpIHtcblx0XHRzcmMgPSBhcmd1bWVudHNbaV07XG5cdFx0a2V5cyhzcmMpLmZvckVhY2goYXNzaWduKTtcblx0fVxuXHRpZiAoZXJyb3IgIT09IHVuZGVmaW5lZCkgdGhyb3cgZXJyb3I7XG5cdHJldHVybiBkZXN0O1xufTtcbiIsIi8vIERlcHJlY2F0ZWRcblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmogPT09ICdmdW5jdGlvbic7IH07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9pcy1pbXBsZW1lbnRlZCcpKClcblx0PyBPYmplY3Qua2V5c1xuXHQ6IHJlcXVpcmUoJy4vc2hpbScpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcblx0dHJ5IHtcblx0XHRPYmplY3Qua2V5cygncHJpbWl0aXZlJyk7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH0gY2F0Y2ggKGUpIHsgcmV0dXJuIGZhbHNlOyB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIga2V5cyA9IE9iamVjdC5rZXlzO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvYmplY3QpIHtcblx0cmV0dXJuIGtleXMob2JqZWN0ID09IG51bGwgPyBvYmplY3QgOiBPYmplY3Qob2JqZWN0KSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZm9yRWFjaCA9IEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLCBjcmVhdGUgPSBPYmplY3QuY3JlYXRlO1xuXG52YXIgcHJvY2VzcyA9IGZ1bmN0aW9uIChzcmMsIG9iaikge1xuXHR2YXIga2V5O1xuXHRmb3IgKGtleSBpbiBzcmMpIG9ialtrZXldID0gc3JjW2tleV07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvcHRpb25zLyosIOKApm9wdGlvbnMqLykge1xuXHR2YXIgcmVzdWx0ID0gY3JlYXRlKG51bGwpO1xuXHRmb3JFYWNoLmNhbGwoYXJndW1lbnRzLCBmdW5jdGlvbiAob3B0aW9ucykge1xuXHRcdGlmIChvcHRpb25zID09IG51bGwpIHJldHVybjtcblx0XHRwcm9jZXNzKE9iamVjdChvcHRpb25zKSwgcmVzdWx0KTtcblx0fSk7XG5cdHJldHVybiByZXN1bHQ7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChmbikge1xuXHRpZiAodHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB0aHJvdyBuZXcgVHlwZUVycm9yKGZuICsgXCIgaXMgbm90IGEgZnVuY3Rpb25cIik7XG5cdHJldHVybiBmbjtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHZhbHVlKSB7XG5cdGlmICh2YWx1ZSA9PSBudWxsKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IHVzZSBudWxsIG9yIHVuZGVmaW5lZFwiKTtcblx0cmV0dXJuIHZhbHVlO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2lzLWltcGxlbWVudGVkJykoKVxuXHQ/IFN0cmluZy5wcm90b3R5cGUuY29udGFpbnNcblx0OiByZXF1aXJlKCcuL3NoaW0nKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHN0ciA9ICdyYXpkd2F0cnp5JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG5cdGlmICh0eXBlb2Ygc3RyLmNvbnRhaW5zICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gZmFsc2U7XG5cdHJldHVybiAoKHN0ci5jb250YWlucygnZHdhJykgPT09IHRydWUpICYmIChzdHIuY29udGFpbnMoJ2ZvbycpID09PSBmYWxzZSkpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGluZGV4T2YgPSBTdHJpbmcucHJvdG90eXBlLmluZGV4T2Y7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHNlYXJjaFN0cmluZy8qLCBwb3NpdGlvbiovKSB7XG5cdHJldHVybiBpbmRleE9mLmNhbGwodGhpcywgc2VhcmNoU3RyaW5nLCBhcmd1bWVudHNbMV0pID4gLTE7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZCAgICAgICAgPSByZXF1aXJlKCdkJylcbiAgLCBjYWxsYWJsZSA9IHJlcXVpcmUoJ2VzNS1leHQvb2JqZWN0L3ZhbGlkLWNhbGxhYmxlJylcblxuICAsIGFwcGx5ID0gRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5LCBjYWxsID0gRnVuY3Rpb24ucHJvdG90eXBlLmNhbGxcbiAgLCBjcmVhdGUgPSBPYmplY3QuY3JlYXRlLCBkZWZpbmVQcm9wZXJ0eSA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eVxuICAsIGRlZmluZVByb3BlcnRpZXMgPSBPYmplY3QuZGVmaW5lUHJvcGVydGllc1xuICAsIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eVxuICAsIGRlc2NyaXB0b3IgPSB7IGNvbmZpZ3VyYWJsZTogdHJ1ZSwgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlIH1cblxuICAsIG9uLCBvbmNlLCBvZmYsIGVtaXQsIG1ldGhvZHMsIGRlc2NyaXB0b3JzLCBiYXNlO1xuXG5vbiA9IGZ1bmN0aW9uICh0eXBlLCBsaXN0ZW5lcikge1xuXHR2YXIgZGF0YTtcblxuXHRjYWxsYWJsZShsaXN0ZW5lcik7XG5cblx0aWYgKCFoYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMsICdfX2VlX18nKSkge1xuXHRcdGRhdGEgPSBkZXNjcmlwdG9yLnZhbHVlID0gY3JlYXRlKG51bGwpO1xuXHRcdGRlZmluZVByb3BlcnR5KHRoaXMsICdfX2VlX18nLCBkZXNjcmlwdG9yKTtcblx0XHRkZXNjcmlwdG9yLnZhbHVlID0gbnVsbDtcblx0fSBlbHNlIHtcblx0XHRkYXRhID0gdGhpcy5fX2VlX187XG5cdH1cblx0aWYgKCFkYXRhW3R5cGVdKSBkYXRhW3R5cGVdID0gbGlzdGVuZXI7XG5cdGVsc2UgaWYgKHR5cGVvZiBkYXRhW3R5cGVdID09PSAnb2JqZWN0JykgZGF0YVt0eXBlXS5wdXNoKGxpc3RlbmVyKTtcblx0ZWxzZSBkYXRhW3R5cGVdID0gW2RhdGFbdHlwZV0sIGxpc3RlbmVyXTtcblxuXHRyZXR1cm4gdGhpcztcbn07XG5cbm9uY2UgPSBmdW5jdGlvbiAodHlwZSwgbGlzdGVuZXIpIHtcblx0dmFyIG9uY2UsIHNlbGY7XG5cblx0Y2FsbGFibGUobGlzdGVuZXIpO1xuXHRzZWxmID0gdGhpcztcblx0b24uY2FsbCh0aGlzLCB0eXBlLCBvbmNlID0gZnVuY3Rpb24gKCkge1xuXHRcdG9mZi5jYWxsKHNlbGYsIHR5cGUsIG9uY2UpO1xuXHRcdGFwcGx5LmNhbGwobGlzdGVuZXIsIHRoaXMsIGFyZ3VtZW50cyk7XG5cdH0pO1xuXG5cdG9uY2UuX19lZU9uY2VMaXN0ZW5lcl9fID0gbGlzdGVuZXI7XG5cdHJldHVybiB0aGlzO1xufTtcblxub2ZmID0gZnVuY3Rpb24gKHR5cGUsIGxpc3RlbmVyKSB7XG5cdHZhciBkYXRhLCBsaXN0ZW5lcnMsIGNhbmRpZGF0ZSwgaTtcblxuXHRjYWxsYWJsZShsaXN0ZW5lcik7XG5cblx0aWYgKCFoYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMsICdfX2VlX18nKSkgcmV0dXJuIHRoaXM7XG5cdGRhdGEgPSB0aGlzLl9fZWVfXztcblx0aWYgKCFkYXRhW3R5cGVdKSByZXR1cm4gdGhpcztcblx0bGlzdGVuZXJzID0gZGF0YVt0eXBlXTtcblxuXHRpZiAodHlwZW9mIGxpc3RlbmVycyA9PT0gJ29iamVjdCcpIHtcblx0XHRmb3IgKGkgPSAwOyAoY2FuZGlkYXRlID0gbGlzdGVuZXJzW2ldKTsgKytpKSB7XG5cdFx0XHRpZiAoKGNhbmRpZGF0ZSA9PT0gbGlzdGVuZXIpIHx8XG5cdFx0XHRcdFx0KGNhbmRpZGF0ZS5fX2VlT25jZUxpc3RlbmVyX18gPT09IGxpc3RlbmVyKSkge1xuXHRcdFx0XHRpZiAobGlzdGVuZXJzLmxlbmd0aCA9PT0gMikgZGF0YVt0eXBlXSA9IGxpc3RlbmVyc1tpID8gMCA6IDFdO1xuXHRcdFx0XHRlbHNlIGxpc3RlbmVycy5zcGxpY2UoaSwgMSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdGlmICgobGlzdGVuZXJzID09PSBsaXN0ZW5lcikgfHxcblx0XHRcdFx0KGxpc3RlbmVycy5fX2VlT25jZUxpc3RlbmVyX18gPT09IGxpc3RlbmVyKSkge1xuXHRcdFx0ZGVsZXRlIGRhdGFbdHlwZV07XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHRoaXM7XG59O1xuXG5lbWl0ID0gZnVuY3Rpb24gKHR5cGUpIHtcblx0dmFyIGksIGwsIGxpc3RlbmVyLCBsaXN0ZW5lcnMsIGFyZ3M7XG5cblx0aWYgKCFoYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMsICdfX2VlX18nKSkgcmV0dXJuO1xuXHRsaXN0ZW5lcnMgPSB0aGlzLl9fZWVfX1t0eXBlXTtcblx0aWYgKCFsaXN0ZW5lcnMpIHJldHVybjtcblxuXHRpZiAodHlwZW9mIGxpc3RlbmVycyA9PT0gJ29iamVjdCcpIHtcblx0XHRsID0gYXJndW1lbnRzLmxlbmd0aDtcblx0XHRhcmdzID0gbmV3IEFycmF5KGwgLSAxKTtcblx0XHRmb3IgKGkgPSAxOyBpIDwgbDsgKytpKSBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcblxuXHRcdGxpc3RlbmVycyA9IGxpc3RlbmVycy5zbGljZSgpO1xuXHRcdGZvciAoaSA9IDA7IChsaXN0ZW5lciA9IGxpc3RlbmVyc1tpXSk7ICsraSkge1xuXHRcdFx0YXBwbHkuY2FsbChsaXN0ZW5lciwgdGhpcywgYXJncyk7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuXHRcdGNhc2UgMTpcblx0XHRcdGNhbGwuY2FsbChsaXN0ZW5lcnMsIHRoaXMpO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAyOlxuXHRcdFx0Y2FsbC5jYWxsKGxpc3RlbmVycywgdGhpcywgYXJndW1lbnRzWzFdKTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgMzpcblx0XHRcdGNhbGwuY2FsbChsaXN0ZW5lcnMsIHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcblx0XHRcdGJyZWFrO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRsID0gYXJndW1lbnRzLmxlbmd0aDtcblx0XHRcdGFyZ3MgPSBuZXcgQXJyYXkobCAtIDEpO1xuXHRcdFx0Zm9yIChpID0gMTsgaSA8IGw7ICsraSkge1xuXHRcdFx0XHRhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcblx0XHRcdH1cblx0XHRcdGFwcGx5LmNhbGwobGlzdGVuZXJzLCB0aGlzLCBhcmdzKTtcblx0XHR9XG5cdH1cbn07XG5cbm1ldGhvZHMgPSB7XG5cdG9uOiBvbixcblx0b25jZTogb25jZSxcblx0b2ZmOiBvZmYsXG5cdGVtaXQ6IGVtaXRcbn07XG5cbmRlc2NyaXB0b3JzID0ge1xuXHRvbjogZChvbiksXG5cdG9uY2U6IGQob25jZSksXG5cdG9mZjogZChvZmYpLFxuXHRlbWl0OiBkKGVtaXQpXG59O1xuXG5iYXNlID0gZGVmaW5lUHJvcGVydGllcyh7fSwgZGVzY3JpcHRvcnMpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBmdW5jdGlvbiAobykge1xuXHRyZXR1cm4gKG8gPT0gbnVsbCkgPyBjcmVhdGUoYmFzZSkgOiBkZWZpbmVQcm9wZXJ0aWVzKE9iamVjdChvKSwgZGVzY3JpcHRvcnMpO1xufTtcbmV4cG9ydHMubWV0aG9kcyA9IG1ldGhvZHM7XG4iXX0=
