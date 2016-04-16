(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

toastr.options = {
    "closeButton": false,
    "debug": false,
    "newestOnTop": false,
    "progressBar": false,
    "positionClass": "toast-top-center",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "3000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
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
    this.enemies = [];
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
        primaryWeapon: new _Weapons2.default.AK47({
            game: this.game,
            rootScope: this
        }),
        secondaryWeapon: new _Weapons2.default.DesertEagle({
            game: this.game,
            rootScope: this
        }),
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

},{"../lib/EventHandler":9,"../lib/GameConsts":10,"../lib/SocketEvents/SetEventHandlers":20,"../lib/Weapons":41,"../maps/HighRuleJungle":42}],3:[function(require,module,exports){
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

},{"../lib/GameConsts":10}],5:[function(require,module,exports){
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
        this.player.meta[this.currentWeapon].fire(this.player, this.socket, this.roomId, this.volume);
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

},{"../lib/CollisionHandler":8,"../lib/PlayerAngleHandler":14,"../lib/PlayerJumpHandler":17,"../lib/PlayerMovementHandler":18}],6:[function(require,module,exports){
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

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Bullet = function (_Phaser$Sprite) {
    _inherits(Bullet, _Phaser$Sprite);

    function Bullet(rootScope, game, key) {
        _classCallCheck(this, Bullet);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Bullet).call(this));

        Phaser.Sprite.call(rootScope, game, 0, 0, key);
        _this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
        _this.anchor.set(0.5);
        _this.checkWorldBounds = true;
        _this.outOfBoundsKill = true;
        _this.exists = false;
        _this.tracking = false;
        _this.scaleSpeed = 0;
        return _this;
    }

    _createClass(Bullet, [{
        key: 'fire',
        value: function fire(x, y, angle, speed, gx, gy, socket, roomId) {
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
        }
    }, {
        key: 'update',
        value: function update() {
            if (this.tracking) {
                this.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x);
            }
        }
    }]);

    return Bullet;
}(Phaser.Sprite);

exports.default = Bullet;

},{}],8:[function(require,module,exports){
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
    this.physics.arcade.collide(this.platforms, this.player.meta.primaryWeapon, function (platform, weapon) {
        weapon.kill();
    }, null, this);

    this.physics.arcade.collide(this.platforms, this.player.meta.secondaryWeapon, function (platform, weapon) {
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
}

},{}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _eventEmitter = require('event-emitter');

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EventHandler = (0, _eventEmitter2.default)({});

exports.default = EventHandler;

},{"event-emitter":57}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = PlayerById;
function PlayerById(id) {
    for (var i = 0; i < this.enemies.length; i++) {
        if (this.enemies[i].player.id === id) {
            return this.enemies[i];
        }
    }

    return false;
}

},{}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
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
            jumpJetCounter -= _GameConsts2.default.JUMP_JET_SPEED;
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

},{"./EventHandler":9,"./GameConsts":10,"./InputHelpers":13}],18:[function(require,module,exports){
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

},{"./GameConsts":10,"./InputHelpers":13,"./PlayerFaceHandler":16}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = RemotePlayer;

var _GameConsts = require('./GameConsts');

var _GameConsts2 = _interopRequireDefault(_GameConsts);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function RemotePlayer(id, game, player, startX, startY) {
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
    newRemotePlayer.player = game.add.sprite(startX, startY, 'commando');
    newRemotePlayer.player.scale.setTo(_GameConsts2.default.PLAYER_SCALE);
    newRemotePlayer.player.anchor.setTo(_GameConsts2.default.PLAYER_ANCHOR);

    // Our two animations, walking left and right.
    newRemotePlayer.player.animations.add('left', _GameConsts2.default.ANIMATION_LEFT, _GameConsts2.default.ANIMATION_FRAMERATE, true);
    newRemotePlayer.player.animations.add('right', _GameConsts2.default.ANIMATION_RIGHT, _GameConsts2.default.ANIMATION_FRAMERATE, true);

    newRemotePlayer.player.id = id;

    return newRemotePlayer;
}

},{"./GameConsts":10}],20:[function(require,module,exports){
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

},{"../EventHandler":9,"./onBulletFired":21,"./onBulletRemoved":22,"./onMovePlayer":23,"./onPlayerDamaged":24,"./onPlayerHealthUpdate":25,"./onPlayerRespawn":26,"./onRemovePlayer":27,"./onSocketConnected":28,"./onSocketDisconnect":29,"./onUpdatePlayers":30}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = onBulletFired;
function onBulletFired(data) {
    if (data.id === '/#' + this.socket.id) return;

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
}

},{}],22:[function(require,module,exports){
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

},{}],23:[function(require,module,exports){
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
    movePlayer.player.x = data.x;
    movePlayer.player.y = data.y;

    if (movePlayer.player.x > movePlayer.lastPosition.x) {
        movePlayer.player.animations.play('right');
    } else if (movePlayer.player.x < movePlayer.lastPosition.x) {
        movePlayer.player.animations.play('left');
    } else {
        movePlayer.player.animations.stop();
        movePlayer.player.frame = 6;
    }

    movePlayer.lastPosition.x = movePlayer.player.x;
    movePlayer.lastPosition.y = movePlayer.player.y;
}

},{"../PlayerById":15}],24:[function(require,module,exports){
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

},{"../EventHandler":9}],25:[function(require,module,exports){
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

},{"../EventHandler":9}],26:[function(require,module,exports){
'use strict';

var _EventHandler = require('../EventHandler');

var _EventHandler2 = _interopRequireDefault(_EventHandler);

var _Weapons = require('../Weapons');

var _Weapons2 = _interopRequireDefault(_Weapons);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (data) {
    if (data.damagedPlayerId !== '/#' + this.socket.id) return;

    // Set primary weapon
    this.player.meta.primaryWeapon = new _Weapons2.default[this.player.meta.selectedPrimaryWeaponId]({
        game: this.game
    });
    this.player.meta.primaryWeapon.id = this.player.meta.selectedPrimaryWeaponId;

    if (this.currentWeapon === 'primaryWeapon') this.ak47Sprite.loadTexture(this.player.meta.selectedPrimaryWeaponId);

    // Set secondary weapon
    this.player.meta.secondaryWeapon = new _Weapons2.default[this.player.meta.selectedSecondaryWeaponId]({
        game: this.game
    });
    this.player.meta.secondaryWeapon.id = this.player.meta.selectedSecondaryWeaponId;

    if (this.currentWeapon === 'secondaryWeapon') this.ak47Sprite.loadTexture(this.player.meta.selectedSecondaryWeaponId);

    // Reset health
    this.player.meta.health = data.health;
    _EventHandler2.default.emit('health update', String(this.player.meta.health));

    // Spawn player
    var spawnPoint = this.mapInstance.getRandomSpawnPoint();
    this.player.x = spawnPoint.x;
    this.player.y = spawnPoint.y;
};

},{"../EventHandler":9,"../Weapons":41}],27:[function(require,module,exports){
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

},{"../PlayerById":15}],28:[function(require,module,exports){
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

},{"../GetQueryString":11}],29:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = onSocketDisconnect;
function onSocketDisconnect() {
    console.log('Disconnected from socket server');
}

},{}],30:[function(require,module,exports){
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
        enemy.player.kill();
    });

    this.enemies = [];

    _EventHandler2.default.emit('players update', data.room.players);

    data.room.players.forEach(function (player) {
        if (player.id === '/#' + _this.socket.id) {
            _EventHandler2.default.emit('score update', String(player.meta.score));
            _EventHandler2.default.emit('health update', String(player.meta.health));
            _EventHandler2.default.emit('player update', { player: player });
            return;
        }

        var newRemotePlayer = _RemotePlayer2.default.call(_this, player.id, _this.game, _this.player, player.x, player.y);
        _this.enemies.push(newRemotePlayer);
    });
}

},{"../EventHandler":9,"../RemotePlayer":19}],31:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Guid = require('../Guid');

var _Guid2 = _interopRequireDefault(_Guid);

var _Bullet = require('../Bullet');

var _Bullet2 = _interopRequireDefault(_Bullet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AK47 = function (_Phaser$Group) {
    _inherits(AK47, _Phaser$Group);

    function AK47(config) {
        _classCallCheck(this, AK47);

        // Object.keys(Phaser.Group.prototype).forEach((key) => {
        //     this[key] = Phaser.Group.prototype[key]
        // })

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AK47).call(this));

        Phaser.Group.call(config.rootScope, config.game, config.game.world, 'AK-47', false, true, Phaser.Physics.ARCADE);

        //	Here we set-up our audio sprite
        _this.fx = config.game.add.audio('AK47-sound');
        _this.allowMultiple = true;

        _this.damage = 22;
        _this.nextFire = 0;
        _this.bulletSpeed = 2300;
        _this.fireRate = 160;

        for (var i = 0; i < 64; i++) {
            var bullet = new _Bullet2.default(config.game, 'bullet12', config.socket);
            bullet.bulletId = (0, _Guid2.default)();
            bullet.height = 3;
            bullet.width = 60;
            bullet.damage = 22;
            _this.add(bullet, true);
        }
        return _this;
    }

    _createClass(AK47, [{
        key: 'fire',
        value: function fire(player, socket, roomId, volume) {
            if (this.game.time.time < this.nextFire) return;

            var x = player.x + 10;
            var y = player.y + -10;

            this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0, socket, roomId);
            this.setAll('tracking', true);

            this.nextFire = this.game.time.time + this.fireRate;
            this.fx.volume = .3 * volume;
            this.fx.play();
        }
    }]);

    return AK47;
}(Phaser.Group);

exports.default = AK47;

},{"../Bullet":7,"../Guid":12}],32:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Guid = require('../Guid');

var _Guid2 = _interopRequireDefault(_Guid);

var _Bullet = require('../Bullet');

var _Bullet2 = _interopRequireDefault(_Bullet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AUG = function (_Phaser$group) {
    _inherits(AUG, _Phaser$group);

    function AUG(config) {
        _classCallCheck(this, AUG);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AUG).call(this));

        Phaser.Group.call(config.rootScope, config.game, config.game.world, 'AK-47', false, true, Phaser.Physics.ARCADE);

        //	Here we set-up our audio sprite
        _this.fx = config.game.add.audio('AUG-sound');
        _this.allowMultiple = true;

        _this.damage = 22;
        _this.nextFire = 0;
        _this.bulletSpeed = 2300;
        _this.fireRate = 160;

        for (var i = 0; i < 64; i++) {
            var bullet = new _Bullet2.default(config.game, 'bullet12', config.socket);
            bullet.bulletId = (0, _Guid2.default)();
            bullet.height = 2;
            bullet.width = 40;
            bullet.damage = 22;
            _this.add(bullet, true);
        }
        return _this;
    }

    _createClass(AUG, [{
        key: 'fire',
        value: function fire(player, socket, roomId, volume) {
            if (this.game.time.time < this.nextFire) return;

            var x = player.x + 15;
            var y = player.y + 30;

            this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0, socket, roomId);
            this.setAll('tracking', true);

            this.nextFire = this.game.time.time + this.fireRate;
            this.fx.volume = .7 * volume;
            this.fx.play();
        }
    }]);

    return AUG;
}(Phaser.group);

exports.default = AUG;

},{"../Bullet":7,"../Guid":12}],33:[function(require,module,exports){
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

},{"../Bullet":7,"../Guid":12}],34:[function(require,module,exports){
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

},{"../Bullet":7,"../Guid":12}],35:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Guid = require('../Guid');

var _Guid2 = _interopRequireDefault(_Guid);

var _Bullet = require('../Bullet');

var _Bullet2 = _interopRequireDefault(_Bullet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AK47 = function (_Phaser$Group) {
    _inherits(AK47, _Phaser$Group);

    function AK47(config) {
        var _ret;

        _classCallCheck(this, AK47);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AK47).call(this));

        Phaser.Group.call(_this, config.game, config.game.world, 'AK-47', false, true, Phaser.Physics.ARCADE);

        //	Here we set-up our audio sprite
        _this.fx = config.game.add.audio('G43-sound');
        _this.allowMultiple = true;

        _this.damage = 44;
        _this.nextFire = 0;
        _this.bulletSpeed = 2300;
        _this.fireRate = 1300;

        for (var i = 0; i < 64; i++) {
            var bullet = new _Bullet2.default(config.game, 'bullet12', config.socket);
            bullet.bulletId = (0, _Guid2.default)();
            bullet.height = 2;
            bullet.width = 40;
            bullet.damage = 22;
            _this.add(bullet, true);
        }

        return _ret = _this, _possibleConstructorReturn(_this, _ret);
    }

    _createClass(AK47, [{
        key: 'fire',
        value: function fire(player, socket, roomId, volume) {
            if (this.game.time.time < this.nextFire) return;

            var x = player.x + 15;
            var y = player.y + 30;

            this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0, socket, roomId);
            this.setAll('tracking', true);

            this.nextFire = this.game.time.time + this.fireRate;
            this.fx.volume = .85 * volume;
            this.fx.play();
        }
    }]);

    return AK47;
}(Phaser.Group);

exports.default = AK47;

},{"../Bullet":7,"../Guid":12}],36:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Guid = require('../Guid');

var _Guid2 = _interopRequireDefault(_Guid);

var _Bullet = require('../Bullet');

var _Bullet2 = _interopRequireDefault(_Bullet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var M4A1 = function (_Phaser$Group) {
    _inherits(M4A1, _Phaser$Group);

    function M4A1(config) {
        _classCallCheck(this, M4A1);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(M4A1).call(this));

        Phaser.Group.call(_this, config.game, config.game.world, 'M4A1', false, true, Phaser.Physics.ARCADE);

        //	Here we set-up our audio sprite
        _this.fx = config.game.add.audio('M4A1-sound');
        _this.allowMultiple = true;

        _this.damage = 20;
        _this.nextFire = 0;
        _this.bulletSpeed = 2400;
        _this.fireRate = 150;

        for (var i = 0; i < 64; i++) {
            var bullet = new _Bullet2.default(config.game, 'bullet12', config.socket);
            bullet.bulletId = (0, _Guid2.default)();
            bullet.height = 2;
            bullet.width = 40;
            bullet.damage = 22;
            _this.add(bullet, true);
        }
        return _this;
    }

    _createClass(M4A1, [{
        key: 'fire',
        value: function fire(player, socket, roomId) {
            if (this.game.time.time < this.nextFire) return;

            var x = player.x + 15;
            var y = player.y + 30;

            this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0, socket, roomId);
            this.setAll('tracking', true);

            this.nextFire = this.game.time.time + this.fireRate;
            this.fx.volume = .3;
            this.fx.play();
        }
    }]);

    return M4A1;
}(Phaser.Group);

exports.default = M4A1;

},{"../Bullet":7,"../Guid":12}],37:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Guid = require('../Guid');

var _Guid2 = _interopRequireDefault(_Guid);

var _Bullet = require('../Bullet');

var _Bullet2 = _interopRequireDefault(_Bullet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var M500 = function (_Phaser$Group) {
    _inherits(M500, _Phaser$Group);

    function M500(config) {
        _classCallCheck(this, M500);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(M500).call(this));

        Phaser.Group.call(_this, config.game, config.game.world, 'M500', false, true, Phaser.Physics.ARCADE);

        _this.fx = config.game.add.audio('M500-sound');

        _this.nextFire = 0;
        _this.bulletSpeed = 1900;
        _this.fireRate = 1650;

        for (var i = 0; i < 32; i++) {
            var bullet = new _Bullet2.default(config.game, 'bullet12', config.socket);
            bullet.bulletId = (0, _Guid2.default)();
            bullet.height = 2;
            bullet.width = 40;
            bullet.damage = 22;
            _this.add(bullet, true);
        }
        return _this;
    }

    _createClass(M500, [{
        key: 'fire',
        value: function fire(player, socket, roomId, volume) {
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
            this.fx.volume = .3 * volume;
            this.fx.play();
        }
    }]);

    return M500;
}(Phaser.Group);

exports.default = M500;

},{"../Bullet":7,"../Guid":12}],38:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Guid = require('../Guid');

var _Guid2 = _interopRequireDefault(_Guid);

var _Bullet = require('../Bullet');

var _Bullet2 = _interopRequireDefault(_Bullet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var P90 = function (_Phaser$Group) {
    _inherits(P90, _Phaser$Group);

    function P90(config) {
        _classCallCheck(this, P90);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(P90).call(this));

        Phaser.Group.call(_this, config.game, config.game.world, 'P90', false, true, Phaser.Physics.ARCADE);

        //	Here we set-up our audio sprite
        _this.fx = config.game.add.audio('P90-sound');
        _this.allowMultiple = true;

        _this.damage = 22;
        _this.nextFire = 0;
        _this.bulletSpeed = 2300;
        _this.fireRate = 120;

        for (var i = 0; i < 64; i++) {
            var bullet = new _Bullet2.default(config.game, 'bullet12', config.socket);
            bullet.bulletId = (0, _Guid2.default)();
            bullet.height = 2;
            bullet.width = 40;
            bullet.damage = 22;
            _this.add(bullet, true);
        }
        return _this;
    }

    _createClass(P90, [{
        key: 'fire',
        value: function fire(player, socket, roomId, volume) {
            if (this.game.time.time < this.nextFire) return;

            var x = player.x + 15;
            var y = player.y + 30;

            this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0, socket, roomId);
            this.setAll('tracking', true);

            this.nextFire = this.game.time.time + this.fireRate;
            this.fx.volume = .3 * volume;
            this.fx.play();
        }
    }]);

    return P90;
}(Phaser.Group);

exports.default = P90;

},{"../Bullet":7,"../Guid":12}],39:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Guid = require('../Guid');

var _Guid2 = _interopRequireDefault(_Guid);

var _Bullet = require('../Bullet');

var _Bullet2 = _interopRequireDefault(_Bullet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RPG = function (_Phaser$Group) {
    _inherits(RPG, _Phaser$Group);

    function RPG(config) {
        _classCallCheck(this, RPG);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(RPG).call(this));

        Phaser.Group.call(_this, config.game, config.game.world, 'RPG', false, true, Phaser.Physics.ARCADE);

        //	Here we set-up our audio sprite
        _this.fx = config.game.add.audio('RPG-sound');
        _this.allowMultiple = true;

        _this.damage = 22;
        _this.nextFire = 0;
        _this.bulletSpeed = 2300;
        _this.fireRate = 3000;

        for (var i = 0; i < 64; i++) {
            var bullet = new _Bullet2.default(config.game, 'bullet12', config.socket);
            bullet.bulletId = (0, _Guid2.default)();
            bullet.height = 2;
            bullet.width = 40;
            bullet.damage = 22;
            _this.add(bullet, true);
        }
        return _this;
    }

    _createClass(RPG, [{
        key: 'fire',
        value: function fire(player, socket, roomId, volume) {
            if (this.game.time.time < this.nextFire) return;

            var x = player.x + 15;
            var y = player.y + 30;

            this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0, socket, roomId);
            this.setAll('tracking', true);

            this.nextFire = this.game.time.time + this.fireRate;
            this.fx.volume = .6 * volume;
            this.fx.play();
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

},{"../Bullet":7,"../Guid":12}],40:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Guid = require('../Guid');

var _Guid2 = _interopRequireDefault(_Guid);

var _Bullet = require('../Bullet');

var _Bullet2 = _interopRequireDefault(_Bullet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Skorpion = function (_Phaser$Group) {
    _inherits(Skorpion, _Phaser$Group);

    function Skorpion(config) {
        _classCallCheck(this, Skorpion);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Skorpion).call(this));

        Phaser.Group.call(_this, config.game, config.game.world, 'AK-47', false, true, Phaser.Physics.ARCADE);

        //	Here we set-up our audio sprite
        _this.fx = config.game.add.audio('Skorpion-sound');
        _this.allowMultiple = true;

        _this.damage = 22;
        _this.nextFire = 0;
        _this.bulletSpeed = 2300;
        _this.fireRate = 120;

        for (var i = 0; i < 64; i++) {
            var bullet = new _Bullet2.default(config.game, 'bullet12', config.socket);
            bullet.bulletId = (0, _Guid2.default)();
            bullet.height = 2;
            bullet.width = 40;
            bullet.damage = 22;
            _this.add(bullet, true);
        }
        return _this;
    }

    _createClass(Skorpion, [{
        key: 'fire',
        value: function fire(player, socket, roomId, volume) {
            if (this.game.time.time < this.nextFire) return;

            var x = player.x + 15;
            var y = player.y + 30;

            this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0, socket, roomId);
            this.setAll('tracking', true);

            this.nextFire = this.game.time.time + this.fireRate;
            this.fx.volume = .8 * volume;
            this.fx.play();
        }
    }]);

    return Skorpion;
}(Phaser.Group);

exports.default = Skorpion;

},{"../Bullet":7,"../Guid":12}],41:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _AK = require('./AK47');

var _AK2 = _interopRequireDefault(_AK);

var _Barrett = require('./Barrett');

var _Barrett2 = _interopRequireDefault(_Barrett);

var _DesertEagle = require('./DesertEagle');

var _DesertEagle2 = _interopRequireDefault(_DesertEagle);

var _M4A = require('./M4A1');

var _M4A2 = _interopRequireDefault(_M4A);

var _M = require('./M500');

var _M2 = _interopRequireDefault(_M);

var _Skorpion = require('./Skorpion');

var _Skorpion2 = _interopRequireDefault(_Skorpion);

var _AUG = require('./AUG');

var _AUG2 = _interopRequireDefault(_AUG);

var _RPG = require('./RPG');

var _RPG2 = _interopRequireDefault(_RPG);

var _P = require('./P90');

var _P2 = _interopRequireDefault(_P);

var _G = require('./G43');

var _G2 = _interopRequireDefault(_G);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
    AK47: _AK2.default,
    Barrett: _Barrett2.default,
    DesertEagle: _DesertEagle2.default,
    M4A1: _M4A2.default,
    M500: _M2.default,
    Skorpion: _Skorpion2.default,
    AUG: _AUG2.default,
    RPG: _RPG2.default,
    P90: _P2.default,
    G43: _G2.default
};

},{"./AK47":31,"./AUG":32,"./Barrett":33,"./DesertEagle":34,"./G43":35,"./M4A1":36,"./M500":37,"./P90":38,"./RPG":39,"./Skorpion":40}],42:[function(require,module,exports){
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

},{}],43:[function(require,module,exports){
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

},{"es5-ext/object/assign":44,"es5-ext/object/is-callable":47,"es5-ext/object/normalize-options":51,"es5-ext/string/#/contains":54}],44:[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')() ? Object.assign : require('./shim');

},{"./is-implemented":45,"./shim":46}],45:[function(require,module,exports){
'use strict';

module.exports = function () {
	var assign = Object.assign,
	    obj;
	if (typeof assign !== 'function') return false;
	obj = { foo: 'raz' };
	assign(obj, { bar: 'dwa' }, { trzy: 'trzy' });
	return obj.foo + obj.bar + obj.trzy === 'razdwatrzy';
};

},{}],46:[function(require,module,exports){
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

},{"../keys":48,"../valid-value":53}],47:[function(require,module,exports){
// Deprecated

'use strict';

module.exports = function (obj) {
  return typeof obj === 'function';
};

},{}],48:[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')() ? Object.keys : require('./shim');

},{"./is-implemented":49,"./shim":50}],49:[function(require,module,exports){
'use strict';

module.exports = function () {
	try {
		Object.keys('primitive');
		return true;
	} catch (e) {
		return false;
	}
};

},{}],50:[function(require,module,exports){
'use strict';

var keys = Object.keys;

module.exports = function (object) {
	return keys(object == null ? object : Object(object));
};

},{}],51:[function(require,module,exports){
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

},{}],52:[function(require,module,exports){
'use strict';

module.exports = function (fn) {
	if (typeof fn !== 'function') throw new TypeError(fn + " is not a function");
	return fn;
};

},{}],53:[function(require,module,exports){
'use strict';

module.exports = function (value) {
	if (value == null) throw new TypeError("Cannot use null or undefined");
	return value;
};

},{}],54:[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')() ? String.prototype.contains : require('./shim');

},{"./is-implemented":55,"./shim":56}],55:[function(require,module,exports){
'use strict';

var str = 'razdwatrzy';

module.exports = function () {
	if (typeof str.contains !== 'function') return false;
	return str.contains('dwa') === true && str.contains('foo') === false;
};

},{}],56:[function(require,module,exports){
'use strict';

var indexOf = String.prototype.indexOf;

module.exports = function (searchString /*, position*/) {
	return indexOf.call(this, searchString, arguments[1]) > -1;
};

},{}],57:[function(require,module,exports){
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

},{"d":43,"es5-ext/object/valid-callable":52}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvYXBwLmpzIiwiYXNzZXRzL2pzL2NvcmUvQ3JlYXRlLmpzIiwiYXNzZXRzL2pzL2NvcmUvSW5pdC5qcyIsImFzc2V0cy9qcy9jb3JlL1ByZWxvYWQuanMiLCJhc3NldHMvanMvY29yZS9VcGRhdGUuanMiLCJhc3NldHMvanMvZ2FtZS5qcyIsImFzc2V0cy9qcy9saWIvQnVsbGV0LmpzIiwiYXNzZXRzL2pzL2xpYi9Db2xsaXNpb25IYW5kbGVyLmpzIiwiYXNzZXRzL2pzL2xpYi9FdmVudEhhbmRsZXIuanMiLCJhc3NldHMvanMvbGliL0dhbWVDb25zdHMuanMiLCJhc3NldHMvanMvbGliL0dldFF1ZXJ5U3RyaW5nLmpzIiwiYXNzZXRzL2pzL2xpYi9HdWlkLmpzIiwiYXNzZXRzL2pzL2xpYi9JbnB1dEhlbHBlcnMuanMiLCJhc3NldHMvanMvbGliL1BsYXllckFuZ2xlSGFuZGxlci5qcyIsImFzc2V0cy9qcy9saWIvUGxheWVyQnlJZC5qcyIsImFzc2V0cy9qcy9saWIvUGxheWVyRmFjZUhhbmRsZXIuanMiLCJhc3NldHMvanMvbGliL1BsYXllckp1bXBIYW5kbGVyLmpzIiwiYXNzZXRzL2pzL2xpYi9QbGF5ZXJNb3ZlbWVudEhhbmRsZXIuanMiLCJhc3NldHMvanMvbGliL1JlbW90ZVBsYXllci5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL1NldEV2ZW50SGFuZGxlcnMuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vbkJ1bGxldEZpcmVkLmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvb25CdWxsZXRSZW1vdmVkLmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvb25Nb3ZlUGxheWVyLmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvb25QbGF5ZXJEYW1hZ2VkLmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvb25QbGF5ZXJIZWFsdGhVcGRhdGUuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vblBsYXllclJlc3Bhd24uanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vblJlbW92ZVBsYXllci5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL29uU29ja2V0Q29ubmVjdGVkLmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvb25Tb2NrZXREaXNjb25uZWN0LmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvb25VcGRhdGVQbGF5ZXJzLmpzIiwiYXNzZXRzL2pzL2xpYi9XZWFwb25zL0FLNDcuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvQVVHLmpzIiwiYXNzZXRzL2pzL2xpYi9XZWFwb25zL0JhcnJldHQuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvRGVzZXJ0RWFnbGUuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvRzQzLmpzIiwiYXNzZXRzL2pzL2xpYi9XZWFwb25zL000QTEuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvTTUwMC5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9QOTAuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvUlBHLmpzIiwiYXNzZXRzL2pzL2xpYi9XZWFwb25zL1Nrb3JwaW9uLmpzIiwiYXNzZXRzL2pzL2xpYi9XZWFwb25zL2luZGV4LmpzIiwiYXNzZXRzL2pzL21hcHMvSGlnaFJ1bGVKdW5nbGUuanMiLCJub2RlX21vZHVsZXMvZC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L29iamVjdC9hc3NpZ24vaW5kZXguanMiLCJub2RlX21vZHVsZXMvZXM1LWV4dC9vYmplY3QvYXNzaWduL2lzLWltcGxlbWVudGVkLmpzIiwibm9kZV9tb2R1bGVzL2VzNS1leHQvb2JqZWN0L2Fzc2lnbi9zaGltLmpzIiwibm9kZV9tb2R1bGVzL2VzNS1leHQvb2JqZWN0L2lzLWNhbGxhYmxlLmpzIiwibm9kZV9tb2R1bGVzL2VzNS1leHQvb2JqZWN0L2tleXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZXM1LWV4dC9vYmplY3Qva2V5cy9pcy1pbXBsZW1lbnRlZC5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L29iamVjdC9rZXlzL3NoaW0uanMiLCJub2RlX21vZHVsZXMvZXM1LWV4dC9vYmplY3Qvbm9ybWFsaXplLW9wdGlvbnMuanMiLCJub2RlX21vZHVsZXMvZXM1LWV4dC9vYmplY3QvdmFsaWQtY2FsbGFibGUuanMiLCJub2RlX21vZHVsZXMvZXM1LWV4dC9vYmplY3QvdmFsaWQtdmFsdWUuanMiLCJub2RlX21vZHVsZXMvZXM1LWV4dC9zdHJpbmcvIy9jb250YWlucy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L3N0cmluZy8jL2NvbnRhaW5zL2lzLWltcGxlbWVudGVkLmpzIiwibm9kZV9tb2R1bGVzL2VzNS1leHQvc3RyaW5nLyMvY29udGFpbnMvc2hpbS5qcyIsIm5vZGVfbW9kdWxlcy9ldmVudC1lbWl0dGVyL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxPQUFPLE9BQVAsR0FBaUI7QUFDYixtQkFBZSxLQUFmO0FBQ0EsYUFBUyxLQUFUO0FBQ0EsbUJBQWUsS0FBZjtBQUNBLG1CQUFlLEtBQWY7QUFDQSxxQkFBaUIsa0JBQWpCO0FBQ0EseUJBQXFCLEtBQXJCO0FBQ0EsZUFBVyxJQUFYO0FBQ0Esb0JBQWdCLEtBQWhCO0FBQ0Esb0JBQWdCLE1BQWhCO0FBQ0EsZUFBVyxNQUFYO0FBQ0EsdUJBQW1CLE1BQW5CO0FBQ0Esa0JBQWMsT0FBZDtBQUNBLGtCQUFjLFFBQWQ7QUFDQSxrQkFBYyxRQUFkO0FBQ0Esa0JBQWMsU0FBZDtDQWZKOzs7QUFtQkEsUUFBUSxRQUFSOzs7Ozs7OztrQkNid0I7O0FBTnhCOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUVlLFNBQVMsTUFBVCxHQUFrQjs7O0FBQzdCLFNBQUssTUFBTCxHQUFjLEdBQUcsT0FBSCxFQUFkLENBRDZCO0FBRTdCLFNBQUssT0FBTCxHQUFlLEVBQWYsQ0FGNkI7QUFHN0IsU0FBSyxNQUFMLEdBQWMscUJBQVcsZUFBWCxDQUhlO0FBSTdCLFNBQUssWUFBTCxHQUFvQixLQUFLLElBQUwsQ0FBVSxHQUFWLENBQWMsS0FBZCxFQUFwQjs7O0FBSjZCLFFBTzdCLENBQUssT0FBTCxDQUFhLFdBQWIsQ0FBeUIsT0FBTyxPQUFQLENBQWUsTUFBZixDQUF6QixDQVA2Qjs7QUFTN0IsU0FBSyxLQUFMLENBQVcsU0FBWCxDQUFxQixDQUFyQixFQUF3QixDQUF4QixFQUEyQixxQkFBVyxXQUFYLEVBQXdCLHFCQUFXLFlBQVgsQ0FBbkQ7OztBQVQ2QixRQVk3QixDQUFLLElBQUwsQ0FBVSxLQUFWLENBQWdCLFNBQWhCLEdBQTRCLE9BQU8sWUFBUCxDQUFvQixNQUFwQixDQVpDO0FBYTdCLFNBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsVUFBaEIsR0FiNkI7QUFjN0IsU0FBSyxJQUFMLENBQVUsS0FBVixDQUFnQixPQUFoQjs7Ozs7QUFkNkIsUUFvQjdCLENBQUssV0FBTCxHQUFtQiw2QkFBbUIsSUFBbkIsQ0FBbkIsQ0FwQjZCO0FBcUI3QixTQUFLLFdBQUwsQ0FBaUIsTUFBakI7Ozs7O0FBckI2QixRQTJCekIsYUFBYSxLQUFLLFdBQUwsQ0FBaUIsbUJBQWpCLEVBQWIsQ0EzQnlCO0FBNEI3QixTQUFLLE1BQUwsR0FBYyxLQUFLLEdBQUwsQ0FBUyxNQUFULENBQWdCLFdBQVcsQ0FBWCxFQUFjLFdBQVcsQ0FBWCxFQUFjLFVBQTVDLENBQWQsQ0E1QjZCO0FBNkI3QixTQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLEtBQWxCLENBQXdCLHFCQUFXLFlBQVgsQ0FBeEIsQ0E3QjZCO0FBOEI3QixTQUFLLE1BQUwsQ0FBWSxNQUFaLENBQW1CLEtBQW5CLENBQXlCLHFCQUFXLGFBQVgsQ0FBekI7OztBQTlCNkIsUUFpQzdCLENBQUssT0FBTCxDQUFhLE1BQWIsQ0FBb0IsTUFBcEIsQ0FBMkIsS0FBSyxNQUFMLENBQTNCOzs7QUFqQzZCLFFBb0M3QixDQUFLLElBQUwsQ0FBVSxPQUFWLENBQWtCLE1BQWxCLENBQXlCLEtBQUssTUFBTCxFQUFhLE9BQU8sT0FBUCxDQUFlLE1BQWYsQ0FBdEM7OztBQXBDNkIsUUF1QzdCLENBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsa0JBQWpCLEdBQXNDLElBQXRDOzs7QUF2QzZCLFFBMEM3QixDQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLFdBQWpCLENBQTZCLEtBQTdCLENBQW1DLHFCQUFXLFNBQVgsRUFBc0IscUJBQVcsU0FBWCxHQUF1QixFQUF2QixDQUF6RDs7O0FBMUM2QixRQTZDN0IsQ0FBSyxNQUFMLENBQVksSUFBWixDQUFpQixJQUFqQixDQUFzQixLQUF0QixDQUE0QixxQkFBVyxJQUFYLEVBQWlCLENBQTdDO0FBN0M2QixRQThDN0IsQ0FBSyxNQUFMLENBQVksSUFBWixDQUFpQixPQUFqQixDQUF5QixHQUF6QixFQUE4QixHQUE5QixFQUFtQyxDQUFDLEVBQUQsRUFBSyxDQUF4QyxFQTlDNkI7QUErQzdCLFNBQUssTUFBTCxDQUFZLElBQVosR0FBbUI7QUFDZixnQkFBUSxHQUFSO0tBREo7OztBQS9DNkIsUUFvRDdCLENBQUssSUFBTCxDQUFVLE9BQVYsQ0FBa0IsTUFBbEIsQ0FBeUIsT0FBekIsQ0FBaUMsQ0FBakMsR0FBcUMscUJBQVcsT0FBWDs7O0FBcERSLFFBdUQ3QixDQUFLLE9BQUwsR0FBZSxLQUFmOzs7QUF2RDZCLFFBMEQ3QixDQUFLLE1BQUwsQ0FBWSxVQUFaLENBQXVCLEdBQXZCLENBQTJCLE1BQTNCLEVBQW1DLHFCQUFXLGNBQVgsRUFBMkIscUJBQVcsbUJBQVgsRUFBZ0MsSUFBOUYsRUExRDZCO0FBMkQ3QixTQUFLLE1BQUwsQ0FBWSxVQUFaLENBQXVCLEdBQXZCLENBQTJCLE9BQTNCLEVBQW9DLHFCQUFXLGVBQVgsRUFBNEIscUJBQVcsbUJBQVgsRUFBZ0MsSUFBaEcsRUEzRDZCOztBQTZEN0IsU0FBSyxNQUFMLENBQVksSUFBWixHQUFtQjtBQUNmLGdCQUFRLEdBQVI7QUFDQSx1QkFBZSxJQUFJLGtCQUFRLElBQVIsQ0FBYTtBQUM1QixrQkFBTSxLQUFLLElBQUw7QUFDTix1QkFBVyxJQUFYO1NBRlcsQ0FBZjtBQUlBLHlCQUFpQixJQUFJLGtCQUFRLFdBQVIsQ0FBb0I7QUFDckMsa0JBQU0sS0FBSyxJQUFMO0FBQ04sdUJBQVcsSUFBWDtTQUZhLENBQWpCO0FBSUEsaUNBQXlCLE1BQXpCO0FBQ0EsbUNBQTJCLGFBQTNCO0tBWEosQ0E3RDZCOztBQTJFN0IsU0FBSyxNQUFMLENBQVksSUFBWixDQUFpQixhQUFqQixDQUErQixFQUEvQixHQUFvQyxNQUFwQyxDQTNFNkI7QUE0RTdCLFNBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsZUFBakIsQ0FBaUMsRUFBakMsR0FBc0MsYUFBdEMsQ0E1RTZCOztBQThFN0IsU0FBSyxZQUFMLEdBQW9CLEtBQUssSUFBTCxDQUFVLEdBQVYsQ0FBYyxLQUFkLEVBQXBCLENBOUU2QjtBQStFN0IsU0FBSyxhQUFMLEdBQXFCLEtBQUssSUFBTCxDQUFVLEdBQVYsQ0FBYyxLQUFkLEVBQXJCLENBL0U2QjtBQWdGN0IsU0FBSyxTQUFMLEdBQWlCLEtBQUssSUFBTCxDQUFVLEdBQVYsQ0FBYyxLQUFkLEVBQWpCLENBaEY2QjtBQWlGN0IsU0FBSyxVQUFMLEdBQWtCLEtBQUssSUFBTCxDQUFVLEdBQVYsQ0FBYyxLQUFkLEVBQWxCOzs7QUFqRjZCLFFBb0Y3QixDQUFLLFdBQUwsR0FBbUIsS0FBSyxJQUFMLENBQVUsR0FBVixDQUFjLE1BQWQsQ0FBcUIsQ0FBQyxFQUFELEVBQUssQ0FBQyxHQUFELEVBQU0sT0FBaEMsQ0FBbkIsQ0FwRjZCO0FBcUY3QixTQUFLLFdBQUwsQ0FBaUIsS0FBakIsQ0FBdUIsS0FBdkIsQ0FBNkIsR0FBN0IsRUFyRjZCO0FBc0Y3QixTQUFLLFVBQUwsQ0FBZ0IsR0FBaEIsQ0FBb0IsS0FBSyxXQUFMLENBQXBCOzs7QUF0RjZCLFFBeUY3QixDQUFLLFVBQUwsR0FBa0IsS0FBSyxJQUFMLENBQVUsR0FBVixDQUFjLE1BQWQsQ0FBcUIsQ0FBckIsRUFBd0IsQ0FBQyxHQUFELEVBQU0sTUFBOUIsQ0FBbEIsQ0F6RjZCO0FBMEY3QixTQUFLLFVBQUwsQ0FBZ0IsS0FBaEIsQ0FBc0IsS0FBdEIsQ0FBNEIsR0FBNUIsRUExRjZCO0FBMkY3QixTQUFLLFNBQUwsQ0FBZSxHQUFmLENBQW1CLEtBQUssVUFBTCxDQUFuQjs7O0FBM0Y2QixRQThGN0IsQ0FBSyxhQUFMLEdBQXFCLEtBQUssSUFBTCxDQUFVLEdBQVYsQ0FBYyxNQUFkLENBQXFCLENBQXJCLEVBQXdCLENBQXhCLEVBQTJCLFVBQTNCLENBQXJCLENBOUY2QjtBQStGN0IsU0FBSyxhQUFMLENBQW1CLE1BQW5CLENBQTBCLEtBQTFCLENBQWdDLEVBQWhDLEVBQW9DLEVBQXBDLEVBL0Y2QjtBQWdHN0IsU0FBSyxhQUFMLENBQW1CLEtBQW5CLENBQXlCLEtBQXpCLENBQStCLEdBQS9CLEVBaEc2QjtBQWlHN0IsU0FBSyxhQUFMLENBQW1CLFFBQW5CLEdBQThCLElBQTlCLENBakc2QjtBQWtHN0IsU0FBSyxZQUFMLENBQWtCLEdBQWxCLENBQXNCLEtBQUssYUFBTCxDQUF0Qjs7O0FBbEc2QixRQXFHN0IsQ0FBSyxVQUFMLEdBQWtCLEtBQUssSUFBTCxDQUFVLEdBQVYsQ0FBYyxNQUFkLENBQXFCLEVBQXJCLEVBQXlCLEVBQXpCLEVBQTZCLE1BQTdCLENBQWxCLENBckc2QjtBQXNHN0IsU0FBSyxVQUFMLENBQWdCLEtBQWhCLENBQXNCLEtBQXRCLENBQTRCLEdBQTVCLEVBdEc2QjtBQXVHN0IsU0FBSyxVQUFMLENBQWdCLFFBQWhCLEdBQTJCLEtBQTNCOzs7QUF2RzZCLFFBMEc3QixDQUFLLGFBQUwsQ0FBbUIsR0FBbkIsQ0FBdUIsS0FBSyxVQUFMLENBQXZCLENBMUc2QjtBQTJHN0IsU0FBSyxjQUFMLEdBQXNCLEtBQUssSUFBTCxDQUFVLEdBQVYsQ0FBYyxNQUFkLENBQXFCLENBQXJCLEVBQXdCLENBQXhCLEVBQTJCLFdBQTNCLENBQXRCLENBM0c2QjtBQTRHN0IsU0FBSyxjQUFMLENBQW9CLE1BQXBCLENBQTJCLEtBQTNCLENBQWlDLEVBQWpDLEVBQXFDLEdBQXJDLEVBNUc2QjtBQTZHN0IsU0FBSyxjQUFMLENBQW9CLEtBQXBCLENBQTBCLEtBQTFCLENBQWdDLEdBQWhDLEVBN0c2QjtBQThHN0IsU0FBSyxjQUFMLENBQW9CLFFBQXBCLEdBQStCLElBQS9CLENBOUc2QjtBQStHN0IsU0FBSyxhQUFMLENBQW1CLEdBQW5CLENBQXVCLEtBQUssY0FBTCxDQUF2QixDQS9HNkI7O0FBaUg3QixTQUFLLE1BQUwsQ0FBWSxRQUFaLENBQXFCLEtBQUssWUFBTCxDQUFyQixDQWpINkI7QUFrSDdCLFNBQUssWUFBTCxDQUFrQixLQUFsQixDQUF3QixDQUF4QixHQUE0QixDQUE1QixDQWxINkI7QUFtSDdCLFNBQUssWUFBTCxDQUFrQixLQUFsQixDQUF3QixDQUF4QixHQUE0QixDQUE1QixDQW5INkI7QUFvSDdCLFNBQUssWUFBTCxDQUFrQixDQUFsQixHQUFzQixFQUF0QixDQXBINkI7QUFxSDdCLFNBQUssWUFBTCxDQUFrQixDQUFsQixHQUFzQixDQUFDLEVBQUQsQ0FySE87O0FBdUg3QixTQUFLLE1BQUwsQ0FBWSxRQUFaLENBQXFCLEtBQUssVUFBTCxDQUFyQixDQXZINkI7QUF3SDdCLFNBQUssTUFBTCxDQUFZLFFBQVosQ0FBcUIsS0FBSyxTQUFMLENBQXJCLENBeEg2Qjs7QUEwSDdCLFNBQUssTUFBTCxDQUFZLFFBQVosQ0FBcUIsS0FBSyxhQUFMLENBQXJCLENBMUg2QjtBQTJIN0IsU0FBSyxhQUFMLENBQW1CLEtBQW5CLENBQXlCLENBQXpCLEdBQTZCLENBQTdCLENBM0g2QjtBQTRIN0IsU0FBSyxhQUFMLENBQW1CLEtBQW5CLENBQXlCLENBQXpCLEdBQTZCLENBQTdCLENBNUg2QjtBQTZIN0IsU0FBSyxhQUFMLENBQW1CLENBQW5CLEdBQXVCLENBQUMsRUFBRCxDQTdITTtBQThIN0IsU0FBSyxhQUFMLENBQW1CLENBQW5CLEdBQXVCLENBQUMsRUFBRDs7Ozs7QUE5SE0sUUFvSTdCLENBQUssYUFBTCxHQUFxQixlQUFyQjs7Ozs7QUFwSTZCLFFBMEl6QixhQUFhLEVBQUUsVUFBVSxNQUFWLEVBQWtCLE1BQU0sTUFBTixFQUFqQyxDQTFJeUI7O0FBNEk3QiwyQkFBYSxJQUFiLENBQWtCLGNBQWxCLEVBQWtDLEVBQWxDLEVBNUk2QjtBQTZJN0IsMkJBQWEsSUFBYixDQUFrQixlQUFsQixFQUFtQyxFQUFuQyxFQTdJNkI7QUE4STdCLDJCQUFhLEVBQWIsQ0FBZ0IsZUFBaEIsRUFBaUMsVUFBQyxJQUFELEVBQVU7QUFDdkMsY0FBSyxNQUFMLEdBQWMsS0FBSyxNQUFMLENBRHlCO0tBQVYsQ0FBakMsQ0E5STZCOztBQWtKN0IsMkJBQWEsRUFBYixDQUFnQix1QkFBaEIsRUFBeUMsVUFBQyxNQUFELEVBQVk7QUFDakQsY0FBSyxNQUFMLENBQVksSUFBWixDQUFpQix1QkFBakIsR0FBMkMsT0FBTyxFQUFQLENBRE07S0FBWixDQUF6QyxDQWxKNkI7O0FBc0o3QiwyQkFBYSxFQUFiLENBQWdCLHlCQUFoQixFQUEyQyxVQUFDLE1BQUQsRUFBWTtBQUNuRCxjQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLHlCQUFqQixHQUE2QyxPQUFPLEVBQVAsQ0FETTtLQUFaLENBQTNDLENBdEo2Qjs7QUEwSjdCLFNBQUssWUFBTCxHQUFvQixLQUFLLEdBQUwsQ0FBUyxJQUFULENBQWMsRUFBZCxFQUFrQixFQUFsQixFQUF5QixLQUFLLElBQUwsQ0FBVSxLQUFWLENBQWdCLFlBQWhCLENBQTZCLENBQTdCLFNBQWtDLEtBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsWUFBaEIsQ0FBNkIsQ0FBN0IsRUFBa0MsVUFBN0YsQ0FBcEIsQ0ExSjZCO0FBMko3QixTQUFLLFlBQUwsQ0FBa0IsYUFBbEIsR0FBa0MsSUFBbEM7Ozs7O0FBM0o2QixRQWlLN0IsQ0FBSyxNQUFMLENBQVksTUFBWixDQUFtQixLQUFLLE1BQUwsQ0FBbkI7Ozs7O0FBaks2QixVQXVLN0IsQ0FBTyxnQkFBUCxDQUF3QixRQUF4QixFQUFrQyxZQUFNO0FBQ3BDLGNBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsT0FBaEIsR0FEb0M7QUFFcEMsY0FBSyxJQUFMLENBQVUsTUFBVixHQUFtQixPQUFPLFdBQVAsQ0FGaUI7QUFHcEMsY0FBSyxJQUFMLENBQVUsS0FBVixHQUFrQixPQUFPLFVBQVAsQ0FIa0I7S0FBTixDQUFsQzs7Ozs7O0FBdks2QixRQWtMN0IsQ0FBSyxLQUFMLENBQVcsUUFBWCxDQUFvQixNQUFwQixDQUEyQixPQUFPLFFBQVAsQ0FBZ0IsR0FBaEIsQ0FBM0IsQ0FBZ0QsTUFBaEQsQ0FBdUQsR0FBdkQsQ0FBMkQsWUFBVztBQUNsRSwrQkFBYSxJQUFiLENBQWtCLGVBQWxCLEVBRGtFO0tBQVgsQ0FBM0Q7OztBQWxMNkIsUUF1TDdCLENBQUssS0FBTCxDQUFXLFFBQVgsQ0FBb0IsTUFBcEIsQ0FBMkIsT0FBTyxRQUFQLENBQWdCLENBQWhCLENBQTNCLENBQThDLE1BQTlDLENBQXFELEdBQXJELENBQXlELFlBQU07QUFDM0QsY0FBSyxhQUFMLEdBQXFCLE1BQUssYUFBTCxLQUF1QixlQUF2QixHQUNmLGlCQURlLEdBRWYsZUFGZSxDQURzQztBQUkzRCxjQUFLLFVBQUwsQ0FBZ0IsV0FBaEIsQ0FBNEIsTUFBSyxNQUFMLENBQVksSUFBWixDQUFpQixNQUFLLGFBQUwsQ0FBakIsQ0FBcUMsRUFBckMsQ0FBNUIsQ0FKMkQ7S0FBTixDQUF6RDs7Ozs7QUF2TDZCLDhCQWtNN0IsQ0FBaUIsSUFBakIsQ0FBc0IsSUFBdEIsRUFsTTZCO0NBQWxCOzs7Ozs7OztrQkNOUztBQUFULFNBQVMsSUFBVCxHQUFnQjtBQUMzQixTQUFLLElBQUwsQ0FBVSxRQUFWLENBQW1CLGFBQW5CLENBQWlDLFdBQWpDLEdBQStDLElBQS9DLENBRDJCO0FBRTNCLFNBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsdUJBQWhCLEdBQTBDLElBQTFDLENBRjJCO0NBQWhCOzs7Ozs7OztrQkNFUzs7QUFGeEI7Ozs7OztBQUVlLFNBQVMsT0FBVCxHQUFtQjs7O0FBQzlCLFNBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsUUFBaEIsRUFBMEIsOEJBQTFCLEVBRDhCO0FBRTlCLFNBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsUUFBaEIsRUFBMEIsc0JBQTFCLEVBRjhCO0FBRzlCLFNBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsVUFBaEIsRUFBNEIsb0JBQTVCLEVBSDhCOztBQUs5QixTQUFLLElBQUwsQ0FBVSxXQUFWLENBQXNCLE1BQXRCLEVBQThCLGtCQUE5QixFQUFrRCxFQUFsRCxFQUFzRCxFQUF0RCxFQUw4QjtBQU05QixTQUFLLElBQUwsQ0FBVSxXQUFWLENBQXNCLFVBQXRCLEVBQWtDLHNCQUFsQyxFQUEwRCxHQUExRCxFQUErRCxHQUEvRCxFQU44QjtBQU85QixTQUFLLElBQUwsQ0FBVSxXQUFWLENBQXNCLE9BQXRCLEVBQStCLGtCQUEvQixFQUFtRCxFQUFuRCxFQUF1RCxFQUF2RDs7O0FBUDhCLHdCQVU5QixDQUFXLGVBQVgsQ0FBMkIsT0FBM0IsQ0FBbUMsVUFBQyxNQUFELEVBQVk7QUFDM0MsY0FBSyxJQUFMLENBQVUsS0FBVixDQUFnQixPQUFPLEVBQVAsRUFBVyxPQUFPLEtBQVAsQ0FBM0IsQ0FEMkM7S0FBWixDQUFuQyxDQVY4Qjs7QUFjOUIseUJBQVcsaUJBQVgsQ0FBNkIsT0FBN0IsQ0FBcUMsVUFBQyxNQUFELEVBQVk7QUFDN0MsY0FBSyxJQUFMLENBQVUsS0FBVixDQUFnQixPQUFPLEVBQVAsRUFBVyxPQUFPLEtBQVAsQ0FBM0IsQ0FENkM7S0FBWixDQUFyQyxDQWQ4Qjs7QUFrQjlCLFNBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsV0FBaEIsRUFBNkIsNEJBQTdCLEVBbEI4QjtBQW1COUIsU0FBSyxJQUFMLENBQVUsS0FBVixDQUFnQixVQUFoQixFQUE0QiwyQkFBNUIsRUFuQjhCO0FBb0I5QixTQUFLLElBQUwsQ0FBVSxLQUFWLENBQWdCLE1BQWhCLEVBQXdCLHVCQUF4QixFQXBCOEI7QUFxQjlCLFNBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsT0FBaEIsRUFBeUIsd0JBQXpCLEVBckI4Qjs7QUF1QjlCLFNBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsWUFBaEIsRUFBOEIsaUJBQTlCLEVBdkI4QjtBQXdCOUIsU0FBSyxJQUFMLENBQVUsS0FBVixDQUFnQixZQUFoQixFQUE4QixpQkFBOUIsRUF4QjhCO0FBeUI5QixTQUFLLElBQUwsQ0FBVSxLQUFWLENBQWdCLGdCQUFoQixFQUFrQyxxQkFBbEMsRUF6QjhCO0FBMEI5QixTQUFLLElBQUwsQ0FBVSxLQUFWLENBQWdCLFdBQWhCLEVBQTZCLGdCQUE3QixFQTFCOEI7QUEyQjlCLFNBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsV0FBaEIsRUFBNkIsZ0JBQTdCLEVBM0I4QjtBQTRCOUIsU0FBSyxJQUFMLENBQVUsS0FBVixDQUFnQixXQUFoQixFQUE2QixnQkFBN0IsRUE1QjhCO0FBNkI5QixTQUFLLElBQUwsQ0FBVSxLQUFWLENBQWdCLFlBQWhCLEVBQThCLGlCQUE5QixFQTdCOEI7QUE4QjlCLFNBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsaUJBQWhCLEVBQW1DLHNCQUFuQyxFQTlCOEI7O0FBZ0M5QixTQUFLLElBQUwsQ0FBVSxLQUFWLENBQWdCLG1CQUFoQixFQUFxQyx3QkFBckMsRUFoQzhCO0FBaUM5QixTQUFLLElBQUwsQ0FBVSxLQUFWLENBQWdCLFdBQWhCLEVBQTZCLGdCQUE3QixFQWpDOEI7Q0FBbkI7Ozs7Ozs7O2tCQ0dTOztBQUx4Qjs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRWUsU0FBUyxNQUFULEdBQWtCO0FBQzdCLCtCQUFpQixJQUFqQixDQUFzQixJQUF0QixFQUQ2QjtBQUU3QixvQ0FBc0IsSUFBdEIsQ0FBMkIsSUFBM0IsRUFGNkI7QUFHN0IsZ0NBQWtCLElBQWxCLENBQXVCLElBQXZCLEVBSDZCO0FBSTdCLGlDQUFtQixJQUFuQixDQUF3QixJQUF4QixFQUo2Qjs7QUFNN0IsUUFBSSxLQUFLLElBQUwsQ0FBVSxLQUFWLENBQWdCLGFBQWhCLENBQThCLE1BQTlCLEVBQ0o7QUFDSSxhQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLEtBQUssYUFBTCxDQUFqQixDQUFxQyxJQUFyQyxDQUEwQyxLQUFLLE1BQUwsRUFBYSxLQUFLLE1BQUwsRUFBYSxLQUFLLE1BQUwsRUFBYSxLQUFLLE1BQUwsQ0FBakYsQ0FESjtLQURBOztBQUtBLFNBQUssWUFBTCxDQUFrQixJQUFsQixHQUE0QixLQUFLLElBQUwsQ0FBVSxLQUFWLENBQWdCLE1BQWhCLFVBQTJCLEtBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsTUFBaEI7OztBQVgxQixRQWN6QixLQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLE9BQWpCLEVBQUosRUFBZ0M7QUFDNUIsYUFBSyxNQUFMLENBQVksSUFBWixDQUFpQixnQkFBakIsRUFBbUM7QUFDL0Isb0JBQVEsS0FBSyxNQUFMO0FBQ1Isb0JBQVEsSUFBUjtBQUNBLDZCQUFpQixPQUFPLEtBQUssTUFBTCxDQUFZLEVBQVo7QUFDeEIsK0JBQW1CLElBQW5CO1NBSkosRUFENEI7S0FBaEM7O0FBU0EsU0FBSyxNQUFMLENBQVksSUFBWixDQUFpQixhQUFqQixFQUFnQztBQUM1QixnQkFBUSxLQUFLLE1BQUw7QUFDUixXQUFHLEtBQUssTUFBTCxDQUFZLENBQVo7QUFDSCxXQUFHLEtBQUssTUFBTCxDQUFZLENBQVo7S0FIUCxFQXZCNkI7Q0FBbEI7Ozs7O0FDTGY7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUVBLElBQU0sWUFBWSxPQUFPLFVBQVA7QUFDbEIsSUFBTSxhQUFhLE9BQU8sV0FBUDtBQUNuQixJQUFJLE9BQU8sSUFBSSxPQUFPLElBQVAsQ0FBWSxTQUFoQixFQUEyQixVQUEzQixFQUF1QyxPQUFPLElBQVAsRUFBYSxtQkFBcEQsQ0FBUDs7QUFFSixLQUFLLEtBQUwsQ0FBVyxHQUFYLENBQWUsTUFBZixFQUF1QixZQUFXO0FBQzlCLFNBQUssYUFBTCxHQUFxQixDQUFyQixDQUQ4QjtBQUU5QixTQUFLLE9BQUwsR0FBZSxFQUFmLENBRjhCO0FBRzlCLFNBQUssTUFBTCxDQUg4QjtBQUk5QixTQUFLLFNBQUwsQ0FKOEI7QUFLOUIsU0FBSyxNQUFMLENBTDhCO0FBTTlCLFNBQUssTUFBTCxDQU44Qjs7QUFROUIsU0FBSyxJQUFMLEdBQVksSUFBWixDQVI4QjtBQVM5QixTQUFLLElBQUwsa0JBVDhCO0FBVTlCLFNBQUssT0FBTCxxQkFWOEI7QUFXOUIsU0FBSyxNQUFMLG9CQVg4QjtBQVk5QixTQUFLLE1BQUwsb0JBWjhCO0NBQVgsRUFhcEIsSUFiSDs7Ozs7Ozs7Ozs7Ozs7Ozs7SUNUcUI7OztBQUNqQixhQURpQixNQUNqQixDQUFZLFNBQVosRUFBdUIsSUFBdkIsRUFBNkIsR0FBN0IsRUFBa0M7OEJBRGpCLFFBQ2lCOzsyRUFEakIsb0JBQ2lCOztBQUc5QixlQUFPLE1BQVAsQ0FBYyxJQUFkLENBQW1CLFNBQW5CLEVBQThCLElBQTlCLEVBQW9DLENBQXBDLEVBQXVDLENBQXZDLEVBQTBDLEdBQTFDLEVBSDhCO0FBSTlCLGNBQUssT0FBTCxDQUFhLFdBQWIsQ0FBeUIsU0FBekIsR0FBcUMsS0FBSyxVQUFMLENBQWdCLE9BQWhCLENBSlA7QUFLOUIsY0FBSyxNQUFMLENBQVksR0FBWixDQUFnQixHQUFoQixFQUw4QjtBQU05QixjQUFLLGdCQUFMLEdBQXdCLElBQXhCLENBTjhCO0FBTzlCLGNBQUssZUFBTCxHQUF1QixJQUF2QixDQVA4QjtBQVE5QixjQUFLLE1BQUwsR0FBYyxLQUFkLENBUjhCO0FBUzlCLGNBQUssUUFBTCxHQUFnQixLQUFoQixDQVQ4QjtBQVU5QixjQUFLLFVBQUwsR0FBa0IsQ0FBbEIsQ0FWOEI7O0tBQWxDOztpQkFEaUI7OzZCQWNaLEdBQUcsR0FBRyxPQUFPLE9BQU8sSUFBSSxJQUFJLFFBQVEsUUFBUTtBQUM3QyxpQkFBSyxLQUFMLENBQVcsQ0FBWCxFQUFjLENBQWQsRUFENkM7O0FBRzdDLGdCQUFJLGVBQWUsS0FBSyxJQUFMLENBQVUsT0FBVixDQUFrQixNQUFsQixDQUF5QixhQUF6QixDQUF1QyxJQUF2QyxFQUE2QyxLQUE3QyxDQUFmLENBSHlDO0FBSTdDLGlCQUFLLElBQUwsQ0FBVSxPQUFWLENBQWtCLENBQWxCLEdBQXNCLENBQUMsSUFBRCxDQUp1Qjs7QUFNN0Msb0JBQVEsR0FBUixDQUFZLHVCQUFaLEVBQXFDLEtBQUssUUFBTCxDQUFyQyxDQU42Qzs7QUFRN0MsbUJBQU8sSUFBUCxDQUFZLGNBQVosRUFBNEI7QUFDeEIsd0JBQVEsTUFBUjtBQUNBLDBCQUFVLEtBQUssUUFBTDtBQUNWLDBCQUFVLE9BQU8sT0FBTyxFQUFQO0FBQ2pCLG9CQUp3QjtBQUt4QixvQkFMd0I7QUFNeEIsNEJBTndCO0FBT3hCLDRCQVB3QjtBQVF4QixzQkFSd0I7QUFTeEIsc0JBVHdCO0FBVXhCLDBDQVZ3QjtBQVd4Qix3QkFBUSxLQUFLLE1BQUw7QUFDUix1QkFBTyxLQUFLLEtBQUw7QUFDUCx3QkFBUSxLQUFLLE1BQUw7YUFiWixFQVI2Qzs7OztpQ0F5QnhDO0FBQ0wsZ0JBQUksS0FBSyxRQUFMLEVBQWU7QUFDZixxQkFBSyxRQUFMLEdBQWdCLEtBQUssS0FBTCxDQUFXLEtBQUssSUFBTCxDQUFVLFFBQVYsQ0FBbUIsQ0FBbkIsRUFBc0IsS0FBSyxJQUFMLENBQVUsUUFBVixDQUFtQixDQUFuQixDQUFqRCxDQURlO2FBQW5COzs7O1dBeENhO0VBQWUsT0FBTyxNQUFQOztrQkFBZjs7Ozs7Ozs7a0JDQUc7QUFBVCxTQUFTLGdCQUFULEdBQTRCOzs7O0FBRXZDLFNBQUssT0FBTCxDQUFhLE1BQWIsQ0FBb0IsT0FBcEIsQ0FBNEIsS0FBSyxNQUFMLEVBQWEsS0FBSyxTQUFMLEVBQWdCLElBQXpELEVBQStELElBQS9ELEVBQXFFLElBQXJFOzs7QUFGdUMsUUFLdkMsQ0FBSyxPQUFMLENBQWEsTUFBYixDQUFvQixPQUFwQixDQUE0QixLQUFLLFNBQUwsRUFBZ0IsS0FBSyxNQUFMLENBQVksSUFBWixDQUFpQixhQUFqQixFQUFnQyxVQUFDLFFBQUQsRUFBVyxNQUFYLEVBQXNCO0FBQzlGLGVBQU8sSUFBUCxHQUQ4RjtLQUF0QixFQUV6RSxJQUZILEVBRVMsSUFGVCxFQUx1Qzs7QUFTdkMsU0FBSyxPQUFMLENBQWEsTUFBYixDQUFvQixPQUFwQixDQUE0QixLQUFLLFNBQUwsRUFBZ0IsS0FBSyxNQUFMLENBQVksSUFBWixDQUFpQixlQUFqQixFQUFrQyxVQUFDLFFBQUQsRUFBVyxNQUFYLEVBQXNCO0FBQ2hHLGVBQU8sSUFBUCxHQURnRztLQUF0QixFQUUzRSxJQUZILEVBRVMsSUFGVDs7O0FBVHVDLFFBY3ZDLENBQUssT0FBTCxDQUFhLE1BQWIsQ0FBb0IsT0FBcEIsQ0FBNEIsS0FBSyxTQUFMLEVBQWdCLEtBQUssWUFBTCxFQUFtQixVQUFDLFFBQUQsRUFBVyxNQUFYLEVBQXNCO0FBQ2pGLGVBQU8sSUFBUCxHQURpRjtLQUF0QixFQUU1RCxJQUZILEVBRVMsSUFGVDs7O0FBZHVDLFFBbUJ2QyxDQUFLLE9BQUwsQ0FBYSxNQUFiLENBQW9CLE9BQXBCLENBQTRCLEtBQUssTUFBTCxFQUFhLEtBQUssWUFBTCxFQUFtQixJQUE1RCxFQUFrRSxVQUFDLE1BQUQsRUFBUyxNQUFULEVBQW9CO0FBQ2xGLGVBQU8sSUFBUCxHQURrRjs7QUFHbEYsZ0JBQVEsR0FBUixDQUFZLGlCQUFaLEVBQStCLE9BQU8sUUFBUCxDQUEvQixDQUhrRjtBQUlsRixjQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLGdCQUFqQixFQUFtQztBQUMvQixvQkFBUSxNQUFLLE1BQUw7QUFDUixzQkFBVSxPQUFPLFFBQVA7U0FGZCxFQUprRjs7QUFTbEYsY0FBSyxNQUFMLENBQVksSUFBWixDQUFpQixnQkFBakIsRUFBbUM7QUFDL0Isb0JBQVEsTUFBSyxNQUFMO0FBQ1Isb0JBQVEsT0FBTyxNQUFQO0FBQ1IsNkJBQWlCLE9BQU8sTUFBSyxNQUFMLENBQVksRUFBWjtBQUN4QiwrQkFBbUIsT0FBTyxRQUFQO1NBSnZCLEVBVGtGOztBQWdCbEYsZUFBTyxLQUFQLENBaEJrRjtLQUFwQixFQWlCL0QsSUFqQkgsRUFuQnVDO0NBQTVCOzs7Ozs7Ozs7QUNBZjs7Ozs7O0FBRUEsSUFBSSxlQUFlLDRCQUFRLEVBQVIsQ0FBZjs7a0JBRVc7Ozs7Ozs7O0FDSmYsSUFBTSxhQUFhO0FBQ2YsaUJBQWEsSUFBYjtBQUNBLGtCQUFjLElBQWQ7QUFDQSxxQkFBaUIsRUFBakI7OztBQUdBLGVBQVcsR0FBWDtBQUNBLGtCQUFjLElBQWQ7QUFDQSxVQUFNLElBQU47QUFDQSxhQUFTLElBQVQ7QUFDQSxnQkFBWSxDQUFDLEdBQUQ7QUFDWixvQkFBZ0IsQ0FBQyxJQUFEOzs7QUFHaEIsb0JBQWdCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0FBaEI7QUFDQSxxQkFBaUIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLEVBQVAsRUFBVyxFQUFYLEVBQWUsRUFBZixFQUFtQixFQUFuQixDQUFqQjtBQUNBLHlCQUFxQixFQUFyQjtBQUNBLGtCQUFjLEdBQWQ7QUFDQSxtQkFBZSxFQUFmOzs7QUFHQSxxQkFBaUIsQ0FDYjtBQUNJLFlBQUksTUFBSjtBQUNBLGNBQU0sT0FBTjtBQUNBLGVBQU8sMkJBQVA7QUFDQSxrQkFBVSxDQUFWO0tBTFMsRUFPYjtBQUNJLFlBQUksTUFBSjtBQUNBLGNBQU0sTUFBTjtBQUNBLGVBQU8sMkJBQVA7QUFDQSxrQkFBVSxDQUFWOztBQUpKLEtBUGEsRUFjYjtBQUNJLFlBQUksVUFBSjtBQUNBLGNBQU0sVUFBTjtBQUNBLGVBQU8sK0JBQVA7QUFDQSxrQkFBVSxDQUFWOztBQUpKLEtBZGEsRUFxQmI7QUFDSSxZQUFJLEtBQUo7QUFDQSxjQUFNLEtBQU47QUFDQSxlQUFPLDBCQUFQO0FBQ0Esa0JBQVUsQ0FBVjs7QUFKSixLQXJCYSxFQTRCYjtBQUNJLFlBQUksS0FBSjtBQUNBLGNBQU0sS0FBTjtBQUNBLGVBQU8sMEJBQVA7QUFDQSxrQkFBVSxDQUFWOztBQUpKLEtBNUJhLEVBbUNiO0FBQ0ksWUFBSSxLQUFKO0FBQ0EsY0FBTSxLQUFOO0FBQ0EsZUFBTywwQkFBUDtBQUNBLGtCQUFVLENBQVY7O0FBSkosS0FuQ2EsRUEwQ2I7QUFDSSxZQUFJLE1BQUo7QUFDQSxjQUFNLE1BQU47QUFDQSxlQUFPLDJCQUFQO0FBQ0Esa0JBQVUsQ0FBVjs7QUFKSixLQTFDYSxFQWlEYjtBQUNJLFlBQUksU0FBSjtBQUNBLGNBQU0sU0FBTjtBQUNBLGVBQU8sOEJBQVA7QUFDQSxrQkFBVSxDQUFWOztBQUpKLEtBakRhLENBQWpCOztBQTBEQSx1QkFBbUIsQ0FDZjtBQUNJLFlBQUksYUFBSjtBQUNBLGNBQU0sY0FBTjtBQUNBLGVBQU8sa0NBQVA7QUFDQSxrQkFBVSxDQUFWO0tBTFcsRUFPZjtBQUNJLFlBQUksS0FBSjtBQUNBLGNBQU0sS0FBTjtBQUNBLGVBQU8sMEJBQVA7QUFDQSxrQkFBVSxFQUFWO0tBWFcsQ0FBbkI7Q0EvRUU7O2tCQStGUzs7Ozs7Ozs7a0JDL0ZTO0FBQVQsU0FBUyxjQUFULENBQXdCLEtBQXhCLEVBQStCLEdBQS9CLEVBQW9DO0FBQy9DLFFBQUksT0FBTyxNQUFNLEdBQU4sR0FBWSxPQUFPLFFBQVAsQ0FBZ0IsSUFBaEIsQ0FEd0I7QUFFL0MsUUFBSSxNQUFNLElBQUksTUFBSixDQUFZLFNBQVMsS0FBVCxHQUFpQixXQUFqQixFQUE4QixHQUExQyxDQUFOLENBRjJDO0FBRy9DLFFBQUksU0FBUyxJQUFJLElBQUosQ0FBUyxJQUFULENBQVQsQ0FIMkM7QUFJL0MsV0FBTyxTQUFTLE9BQU8sQ0FBUCxDQUFULEdBQXFCLElBQXJCLENBSndDO0NBQXBDOzs7Ozs7OztrQkNJUztBQUp4QixTQUFTLEVBQVQsR0FBYztBQUNWLFdBQU8sQ0FBQyxDQUFFLElBQUUsS0FBSyxNQUFMLEVBQUYsQ0FBRCxHQUFrQixPQUFsQixHQUEyQixDQUE1QixDQUFELENBQWdDLFFBQWhDLENBQXlDLEVBQXpDLEVBQTZDLFNBQTdDLENBQXVELENBQXZELENBQVAsQ0FEVTtDQUFkOztBQUllLFNBQVMsSUFBVCxHQUFnQjtBQUMzQixXQUFRLE9BQUssSUFBTCxHQUFVLEdBQVYsR0FBYyxJQUFkLEdBQW1CLEdBQW5CLEdBQXVCLElBQXZCLEdBQTRCLEdBQTVCLEdBQWdDLElBQWhDLEdBQXFDLEdBQXJDLEdBQXlDLElBQXpDLEdBQThDLElBQTlDLEdBQW1ELElBQW5ELENBRG1CO0NBQWhCOzs7Ozs7OztRQ0RDO1FBT0E7UUFPQTtRQUtBOzs7O0FBbkJULFNBQVMsaUJBQVQsR0FBNkI7QUFDaEMsV0FBTyxLQUFLLEtBQUwsQ0FBVyxRQUFYLENBQW9CLE1BQXBCLENBQTJCLE9BQU8sUUFBUCxDQUFnQixDQUFoQixDQUFsQyxDQURnQztDQUE3Qjs7Ozs7QUFPQSxTQUFTLGtCQUFULEdBQThCO0FBQ2pDLFdBQU8sS0FBSyxLQUFMLENBQVcsUUFBWCxDQUFvQixNQUFwQixDQUEyQixPQUFPLFFBQVAsQ0FBZ0IsQ0FBaEIsQ0FBbEMsQ0FEaUM7Q0FBOUI7Ozs7O0FBT0EsU0FBUyxlQUFULENBQXlCLFFBQXpCLEVBQW1DO0FBQ3RDLFdBQU8sS0FBSyxLQUFMLENBQVcsUUFBWCxDQUFvQixZQUFwQixDQUFpQyxPQUFPLFFBQVAsQ0FBZ0IsQ0FBaEIsRUFBbUIsUUFBcEQsQ0FBUCxDQURzQztDQUFuQzs7O0FBS0EsU0FBUyxlQUFULEdBQTJCO0FBQzlCLFdBQU8sS0FBSyxLQUFMLENBQVcsUUFBWCxDQUFvQixVQUFwQixDQUErQixPQUFPLFFBQVAsQ0FBZ0IsQ0FBaEIsQ0FBdEMsQ0FEOEI7Q0FBM0I7Ozs7Ozs7O2tCQ3RCaUI7QUFBVCxTQUFTLGtCQUFULEdBQThCO0FBQ3pDLFFBQUksaUJBQWlCLElBQUMsQ0FBSyxJQUFMLENBQVUsT0FBVixDQUFrQixNQUFsQixDQUF5QixjQUF6QixDQUF3QyxLQUFLLE1BQUwsQ0FBeEMsR0FBdUQsR0FBdkQsR0FBNkQsS0FBSyxFQUFMLEdBQVcsRUFBekUsQ0FEb0I7O0FBR3pDLFFBQUksS0FBSyxNQUFMLENBQVksSUFBWixDQUFpQixNQUFqQixLQUE0QixPQUE1QixFQUFxQztBQUNyQyxhQUFLLGFBQUwsQ0FBbUIsS0FBbkIsR0FBMkIsaUJBQWlCLENBQWpCOzs7QUFEVSxZQUlqQyxrQkFBa0IsRUFBbEIsSUFBd0Isa0JBQWtCLEVBQWxCLEVBQXNCO0FBQzlDLDhCQUFrQixFQUFsQixDQUQ4QztTQUFsRCxNQUVPLElBQUksaUJBQWlCLEVBQWpCLElBQXVCLGtCQUFrQixFQUFsQixFQUFzQjtBQUNwRCw4QkFBa0IsRUFBbEIsQ0FEb0Q7U0FBakQsTUFFQSxJQUFJLGlCQUFpQixFQUFqQixJQUF1QixrQkFBa0IsRUFBbEIsRUFBc0I7QUFDcEQsOEJBQWtCLEVBQWxCLENBRG9EO1NBQWpELE1BRUEsSUFBSSxpQkFBaUIsRUFBakIsSUFBdUIsa0JBQWtCLEVBQWxCLEVBQXNCO0FBQ3BELDhCQUFrQixFQUFsQixDQURvRDtTQUFqRCxNQUVBLElBQUksaUJBQWlCLEVBQWpCLElBQXVCLGtCQUFrQixFQUFsQixFQUFzQjtBQUNwRCw4QkFBa0IsRUFBbEIsQ0FEb0Q7U0FBakQsTUFFQSxJQUFJLGlCQUFpQixFQUFqQixJQUF1QixrQkFBa0IsRUFBbEIsRUFBc0I7QUFDcEQsOEJBQWtCLEVBQWxCLENBRG9EO1NBQWpELE1BRUEsSUFBSSxpQkFBaUIsRUFBakIsSUFBdUIsa0JBQWtCLEVBQWxCLEVBQXNCO0FBQ3BELDhCQUFrQixFQUFsQixDQURvRDtTQUFqRCxNQUVBLElBQUksaUJBQWlCLEVBQWpCLElBQXVCLGtCQUFrQixDQUFsQixFQUFxQjtBQUNuRCw4QkFBa0IsRUFBbEIsQ0FEbUQ7U0FBaEQ7OztBQWxCOEIsWUF1QmpDLGtCQUFrQixFQUFsQixJQUF3QixrQkFBa0IsR0FBbEIsRUFBdUI7QUFDL0MsOEJBQWtCLEVBQWxCLENBRCtDO1NBQW5ELE1BRU8sSUFBSSxpQkFBaUIsR0FBakIsSUFBd0Isa0JBQWtCLEdBQWxCLEVBQXVCO0FBQ3RELDhCQUFrQixFQUFsQixDQURzRDtTQUFuRCxNQUVBLElBQUksaUJBQWlCLEdBQWpCLElBQXdCLGtCQUFrQixHQUFsQixFQUF1QjtBQUN0RCw4QkFBa0IsRUFBbEIsQ0FEc0Q7U0FBbkQsTUFFQSxJQUFJLGlCQUFpQixHQUFqQixJQUF3QixrQkFBa0IsR0FBbEIsRUFBdUI7QUFDdEQsOEJBQWtCLEVBQWxCLENBRHNEO1NBQW5ELE1BRUEsSUFBSSxpQkFBaUIsR0FBakIsSUFBd0Isa0JBQWtCLEdBQWxCLEVBQXVCO0FBQ3RELDhCQUFrQixFQUFsQixDQURzRDtTQUFuRCxNQUVBLElBQUksaUJBQWlCLEdBQWpCLElBQXdCLGtCQUFrQixHQUFsQixFQUF1QjtBQUN0RCw4QkFBa0IsRUFBbEIsQ0FEc0Q7U0FBbkQsTUFFQSxJQUFJLGlCQUFpQixHQUFqQixJQUF3QixrQkFBa0IsR0FBbEIsRUFBdUI7QUFDdEQsOEJBQWtCLEVBQWxCLENBRHNEO1NBQW5ELE1BRUEsSUFBSSxpQkFBaUIsR0FBakIsSUFBd0Isa0JBQWtCLEdBQWxCLEVBQXVCO0FBQ3RELDhCQUFrQixFQUFsQixDQURzRDtTQUFuRDtLQXJDWDs7QUEwQ0EsUUFBSSxLQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLE1BQWpCLEtBQTRCLE1BQTVCLEVBQW9DO0FBQ3BDLGFBQUssYUFBTCxDQUFtQixLQUFuQixHQUEyQixpQkFBaUIsQ0FBakI7OztBQURTLFlBSWhDLGtCQUFrQixDQUFDLEVBQUQsSUFBTyxrQkFBa0IsQ0FBQyxFQUFELEVBQUs7QUFDaEQsOEJBQWtCLEVBQWxCLENBRGdEO1NBQXBELE1BRU8sSUFBSSxpQkFBaUIsQ0FBQyxFQUFELElBQU8sa0JBQWtCLENBQUMsRUFBRCxFQUFLO0FBQ3RELDhCQUFrQixFQUFsQixDQURzRDtTQUFuRCxNQUVBLElBQUksaUJBQWlCLENBQUMsRUFBRCxJQUFPLGtCQUFrQixDQUFDLEVBQUQsRUFBSztBQUN0RCw4QkFBa0IsRUFBbEIsQ0FEc0Q7U0FBbkQsTUFFQSxJQUFJLGlCQUFpQixDQUFDLEVBQUQsSUFBTyxrQkFBa0IsQ0FBQyxFQUFELEVBQUs7QUFDdEQsOEJBQWtCLEVBQWxCLENBRHNEO1NBQW5ELE1BRUEsSUFBSSxpQkFBaUIsQ0FBQyxFQUFELElBQU8sa0JBQWtCLENBQUMsRUFBRCxFQUFLO0FBQ3RELDhCQUFrQixFQUFsQixDQURzRDtTQUFuRCxNQUVBLElBQUksaUJBQWlCLENBQUMsRUFBRCxJQUFPLGtCQUFrQixDQUFDLEVBQUQsRUFBSztBQUN0RCw4QkFBa0IsRUFBbEIsQ0FEc0Q7U0FBbkQsTUFFQSxJQUFJLGlCQUFpQixDQUFDLEVBQUQsSUFBTyxrQkFBa0IsQ0FBQyxFQUFELEVBQUs7QUFDdEQsOEJBQWtCLEVBQWxCLENBRHNEO1NBQW5ELE1BRUEsSUFBSSxpQkFBaUIsQ0FBQyxFQUFELElBQU8sa0JBQWtCLENBQWxCLEVBQXFCO0FBQ3BELDhCQUFrQixFQUFsQixDQURvRDtTQUFqRDs7O0FBbEI2QixZQXVCaEMsa0JBQWtCLEdBQWxCLElBQXlCLGtCQUFrQixHQUFsQixFQUF1QjtBQUNoRCw4QkFBa0IsRUFBbEIsQ0FEZ0Q7U0FBcEQsTUFFTyxJQUFJLGlCQUFpQixHQUFqQixJQUF3QixrQkFBa0IsR0FBbEIsRUFBdUI7QUFDdEQsOEJBQWtCLEVBQWxCLENBRHNEO1NBQW5ELE1BRUEsSUFBSSxpQkFBaUIsR0FBakIsSUFBd0Isa0JBQWtCLEdBQWxCLEVBQXVCO0FBQ3RELDhCQUFrQixFQUFsQixDQURzRDtTQUFuRCxNQUVBLElBQUksaUJBQWlCLEdBQWpCLElBQXdCLGtCQUFrQixHQUFsQixFQUF1QjtBQUN0RCw4QkFBa0IsRUFBbEIsQ0FEc0Q7U0FBbkQsTUFFQSxJQUFJLGlCQUFpQixHQUFqQixJQUF3QixrQkFBa0IsR0FBbEIsRUFBdUI7QUFDdEQsOEJBQWtCLEVBQWxCLENBRHNEO1NBQW5ELE1BRUEsSUFBSSxpQkFBaUIsR0FBakIsSUFBd0Isa0JBQWtCLEdBQWxCLEVBQXVCO0FBQ3RELDhCQUFrQixFQUFsQixDQURzRDtTQUFuRCxNQUVBLElBQUksaUJBQWlCLEdBQWpCLElBQXdCLGtCQUFrQixHQUFsQixFQUF1QjtBQUN0RCw4QkFBa0IsRUFBbEIsQ0FEc0Q7U0FBbkQsTUFFQSxJQUFJLGlCQUFpQixHQUFqQixJQUF3QixrQkFBa0IsR0FBbEIsRUFBdUI7QUFDdEQsOEJBQWtCLEVBQWxCLENBRHNEO1NBQW5EO0tBckNYOztBQTBDQSxTQUFLLFlBQUwsQ0FBa0IsS0FBbEIsR0FBMEIsY0FBMUIsQ0F2RnlDO0NBQTlCOzs7Ozs7OztrQkNBUztBQUFULFNBQVMsVUFBVCxDQUFvQixFQUFwQixFQUF3QjtBQUNuQyxTQUFLLElBQUksSUFBSSxDQUFKLEVBQU8sSUFBSSxLQUFLLE9BQUwsQ0FBYSxNQUFiLEVBQXFCLEdBQXpDLEVBQThDO0FBQzFDLFlBQUksS0FBSyxPQUFMLENBQWEsQ0FBYixFQUFnQixNQUFoQixDQUF1QixFQUF2QixLQUE4QixFQUE5QixFQUFrQztBQUNsQyxtQkFBTyxLQUFLLE9BQUwsQ0FBYSxDQUFiLENBQVAsQ0FEa0M7U0FBdEM7S0FESjs7QUFNQSxXQUFPLEtBQVAsQ0FQbUM7Q0FBeEI7Ozs7Ozs7O1FDQUM7UUE0QkE7QUE1QlQsU0FBUyxjQUFULEdBQTBCO0FBQzdCLFFBQUksS0FBSyxNQUFMLENBQVksSUFBWixDQUFpQixNQUFqQixLQUE0QixNQUE1QixFQUFvQztBQUNwQyxhQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLE1BQWpCLEdBQTBCLE1BQTFCLENBRG9DOztBQUdwQyxhQUFLLGFBQUwsQ0FBbUIsQ0FBbkIsR0FBdUIsRUFBdkIsQ0FIb0M7QUFJcEMsYUFBSyxhQUFMLENBQW1CLENBQW5CLEdBQXVCLENBQUMsRUFBRCxDQUphOztBQU1wQyxhQUFLLFlBQUwsQ0FBa0IsQ0FBbEIsR0FBc0IsQ0FBQyxFQUFELENBTmM7QUFPcEMsYUFBSyxZQUFMLENBQWtCLENBQWxCLEdBQXNCLENBQUMsRUFBRCxDQVBjOztBQVNwQyxhQUFLLFVBQUwsQ0FBZ0IsS0FBaEIsQ0FBc0IsQ0FBdEIsSUFBMkIsQ0FBQyxDQUFELENBVFM7QUFVcEMsYUFBSyxVQUFMLENBQWdCLENBQWhCLEdBQW9CLEVBQXBCLENBVm9DOztBQVlwQyxhQUFLLFdBQUwsQ0FBaUIsS0FBakIsQ0FBdUIsQ0FBdkIsSUFBNEIsQ0FBQyxDQUFELENBWlE7QUFhcEMsYUFBSyxXQUFMLENBQWlCLENBQWpCLEdBQXFCLEVBQXJCLENBYm9DOztBQWVwQyxhQUFLLGFBQUwsQ0FBbUIsS0FBbkIsQ0FBeUIsQ0FBekIsSUFBOEIsQ0FBQyxDQUFELENBZk07QUFnQnBDLGFBQUssYUFBTCxDQUFtQixDQUFuQixHQUF1QixDQUF2QixDQWhCb0M7O0FBa0JwQyxhQUFLLGNBQUwsQ0FBb0IsS0FBcEIsQ0FBMEIsQ0FBMUIsSUFBK0IsQ0FBQyxDQUFELENBbEJLO0FBbUJwQyxhQUFLLGNBQUwsQ0FBb0IsQ0FBcEIsR0FBd0IsRUFBeEIsQ0FuQm9DOztBQXFCcEMsYUFBSyxVQUFMLENBQWdCLEtBQWhCLENBQXNCLENBQXRCLElBQTJCLENBQUMsQ0FBRCxDQXJCUztBQXNCcEMsYUFBSyxVQUFMLENBQWdCLENBQWhCLEdBQW9CLEVBQXBCLENBdEJvQztBQXVCcEMsYUFBSyxVQUFMLENBQWdCLENBQWhCLEdBQW9CLENBQUMsQ0FBRCxDQXZCZ0I7S0FBeEM7Q0FERzs7QUE0QkEsU0FBUyxlQUFULEdBQTJCO0FBQzlCLFFBQUksS0FBSyxNQUFMLENBQVksSUFBWixDQUFpQixNQUFqQixLQUE0QixPQUE1QixFQUFxQztBQUNyQyxhQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLE1BQWpCLEdBQTBCLE9BQTFCLENBRHFDOztBQUdyQyxhQUFLLGFBQUwsQ0FBbUIsQ0FBbkIsR0FBdUIsQ0FBQyxFQUFELENBSGM7QUFJckMsYUFBSyxhQUFMLENBQW1CLENBQW5CLEdBQXVCLENBQUMsRUFBRCxDQUpjOztBQU1yQyxhQUFLLFlBQUwsQ0FBa0IsQ0FBbEIsR0FBc0IsRUFBdEIsQ0FOcUM7QUFPckMsYUFBSyxZQUFMLENBQWtCLENBQWxCLEdBQXNCLENBQUMsRUFBRCxDQVBlOztBQVNyQyxhQUFLLFVBQUwsQ0FBZ0IsS0FBaEIsQ0FBc0IsQ0FBdEIsSUFBMkIsQ0FBQyxDQUFELENBVFU7QUFVckMsYUFBSyxVQUFMLENBQWdCLENBQWhCLEdBQW9CLENBQXBCLENBVnFDOztBQVlyQyxhQUFLLFdBQUwsQ0FBaUIsS0FBakIsQ0FBdUIsQ0FBdkIsSUFBNEIsQ0FBQyxDQUFELENBWlM7QUFhckMsYUFBSyxXQUFMLENBQWlCLENBQWpCLEdBQXFCLENBQUMsRUFBRCxDQWJnQjs7QUFlckMsYUFBSyxhQUFMLENBQW1CLEtBQW5CLENBQXlCLENBQXpCLElBQThCLENBQUMsQ0FBRCxDQWZPO0FBZ0JyQyxhQUFLLGFBQUwsQ0FBbUIsQ0FBbkIsR0FBdUIsQ0FBdkIsQ0FoQnFDOztBQWtCckMsYUFBSyxjQUFMLENBQW9CLEtBQXBCLENBQTBCLENBQTFCLElBQStCLENBQUMsQ0FBRCxDQWxCTTtBQW1CckMsYUFBSyxjQUFMLENBQW9CLENBQXBCLEdBQXdCLENBQXhCLENBbkJxQzs7QUFxQnJDLGFBQUssVUFBTCxDQUFnQixLQUFoQixDQUFzQixDQUF0QixJQUEyQixDQUFDLENBQUQsQ0FyQlU7QUFzQnJDLGFBQUssVUFBTCxDQUFnQixDQUFoQixHQUFvQixFQUFwQixDQXRCcUM7QUF1QnJDLGFBQUssVUFBTCxDQUFnQixDQUFoQixHQUFvQixDQUFwQixDQXZCcUM7S0FBekM7Q0FERzs7Ozs7Ozs7a0JDdEJpQjs7QUFOeEI7Ozs7QUFDQTs7OztBQUNBOzs7O0FBRUEsSUFBSSxpQkFBaUIsQ0FBakI7O0FBRVcsU0FBUyxpQkFBVCxHQUE2Qjs7QUFFeEMsUUFBSSxjQUFjLEtBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsUUFBakIsQ0FBMEIsSUFBMUI7OztBQUZzQixRQUtwQyxXQUFKLEVBQWlCO0FBQ2IsYUFBSyxLQUFMLEdBQWEsQ0FBYixDQURhO0FBRWIsYUFBSyxPQUFMLEdBQWUsS0FBZixDQUZhO0tBQWpCOzs7QUFMd0MsUUFXcEMsS0FBSyxLQUFMLEtBQWUsQ0FBZixJQUFvQiw4QkFBZ0IsSUFBaEIsQ0FBcUIsSUFBckIsRUFBMkIsQ0FBM0IsQ0FBcEIsSUFBcUQsV0FBckQsRUFBa0U7QUFDbEUsYUFBSyxNQUFMLENBQVksSUFBWixDQUFpQixRQUFqQixDQUEwQixDQUExQixHQUE4QixxQkFBVyxVQUFYLENBRG9DO0FBRWxFLGFBQUssT0FBTCxHQUFlLElBQWYsQ0FGa0U7S0FBdEUsTUFHTyxJQUFJLDhCQUFnQixJQUFoQixDQUFxQixJQUFyQixFQUEyQixDQUEzQixDQUFKLEVBQW1DO0FBQ3RDLGFBQUssS0FBTCxHQUFhLENBQWIsQ0FEc0M7S0FBbkM7OztBQWRpQyxRQW1CcEMsS0FBSyxLQUFMLEtBQWUsQ0FBZixJQUFvQixLQUFLLEtBQUwsQ0FBVyxRQUFYLENBQW9CLE1BQXBCLENBQTJCLE9BQU8sUUFBUCxDQUFnQixDQUFoQixDQUEvQyxJQUFxRSxpQkFBaUIsQ0FBQyxNQUFELEVBQVM7QUFDL0YsYUFBSyxNQUFMLENBQVksSUFBWixDQUFpQixZQUFqQixDQUE4QixDQUE5QixHQUFrQyxxQkFBVyxjQUFYLENBRDZEO0FBRS9GLDBCQUFrQixxQkFBVyxjQUFYLENBRjZFO0tBQW5HLE1BR087QUFDSCxhQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLFlBQWpCLENBQThCLENBQTlCLEdBQWtDLENBQWxDLENBREc7O0FBR0gsWUFBSSxpQkFBaUIsQ0FBakIsRUFBb0I7QUFDcEIsOEJBQWtCLHFCQUFXLGNBQVgsQ0FERTtTQUF4QixNQUVPO0FBQ0gsNkJBQWlCLENBQWpCLENBREc7U0FGUDtLQU5KOztBQWFBLDJCQUFhLElBQWIsQ0FBa0Isd0JBQWxCLEVBQTRDLEVBQUUsOEJBQUYsRUFBNUM7OztBQWhDd0MsUUFtQ3BDLEtBQUssT0FBTCxJQUFnQiw4QkFBZ0IsSUFBaEIsQ0FBcUIsSUFBckIsQ0FBaEIsRUFBNEM7QUFDNUMsYUFBSyxNQUFMLENBQVksSUFBWixDQUFpQixZQUFqQixDQUE4QixDQUE5QixHQUFrQyxDQUFsQyxDQUQ0QztBQUU1QyxhQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLFlBQWpCLENBQThCLENBQTlCLEdBQWtDLENBQWxDLENBRjRDOztBQUk1QyxZQUFJLEtBQUssS0FBTCxLQUFlLENBQWYsRUFBa0I7QUFDbEIsaUJBQUssS0FBTCxHQURrQjtTQUF0Qjs7QUFJQSxhQUFLLE9BQUwsR0FBZSxLQUFmLENBUjRDO0tBQWhEO0NBbkNXOzs7Ozs7OztrQkNGUzs7QUFKeEI7Ozs7QUFDQTs7QUFDQTs7OztBQUVlLFNBQVMscUJBQVQsR0FBaUM7QUFDNUMsUUFBSSxnQ0FBa0IsSUFBbEIsQ0FBdUIsSUFBdkIsQ0FBSixFQUFrQzs7QUFFOUIsYUFBSyxNQUFMLENBQVksSUFBWixDQUFpQixZQUFqQixDQUE4QixDQUE5QixHQUFrQyxDQUFDLHFCQUFXLFlBQVgsQ0FGTDtBQUc5QixhQUFLLE1BQUwsQ0FBWSxVQUFaLENBQXVCLElBQXZCLENBQTRCLE1BQTVCOzs7QUFIOEIseUNBTTlCLENBQWUsSUFBZixDQUFvQixJQUFwQixFQU44QjtLQUFsQyxNQU9PLElBQUksaUNBQW1CLElBQW5CLENBQXdCLElBQXhCLENBQUosRUFBbUM7O0FBRXRDLGFBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsWUFBakIsQ0FBOEIsQ0FBOUIsR0FBa0MscUJBQVcsWUFBWCxDQUZJO0FBR3RDLGFBQUssTUFBTCxDQUFZLFVBQVosQ0FBdUIsSUFBdkIsQ0FBNEIsT0FBNUIsRUFIc0M7O0FBS3RDLDJDQUFnQixJQUFoQixDQUFxQixJQUFyQixFQUxzQztLQUFuQyxNQU1BOztBQUVILGFBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsWUFBakIsQ0FBOEIsQ0FBOUIsR0FBa0MsQ0FBbEMsQ0FGRztBQUdILGFBQUssTUFBTCxDQUFZLFVBQVosQ0FBdUIsSUFBdkIsR0FIRzs7QUFLSCxZQUFJLEtBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsTUFBaEIsR0FBeUIsS0FBSyxNQUFMLENBQVksQ0FBWixFQUFlO0FBQ3hDLGlCQUFLLE1BQUwsQ0FBWSxLQUFaLEdBQW9CLENBQXBCLENBRHdDO0FBRXhDLCtDQUFnQixJQUFoQixDQUFxQixJQUFyQixFQUZ3QztTQUE1Qzs7QUFLQSxZQUFJLEtBQUssSUFBTCxDQUFVLEtBQVYsQ0FBZ0IsTUFBaEIsR0FBeUIsS0FBSyxNQUFMLENBQVksQ0FBWixFQUFlO0FBQ3hDLGlCQUFLLE1BQUwsQ0FBWSxLQUFaLEdBQW9CLENBQXBCLENBRHdDO0FBRXhDLDhDQUFlLElBQWYsQ0FBb0IsSUFBcEIsRUFGd0M7U0FBNUM7S0FoQkc7Q0FSSTs7Ozs7Ozs7a0JDRlM7O0FBRnhCOzs7Ozs7QUFFZSxTQUFTLFlBQVQsQ0FBc0IsRUFBdEIsRUFBMEIsSUFBMUIsRUFBZ0MsTUFBaEMsRUFBd0MsTUFBeEMsRUFBZ0QsTUFBaEQsRUFBd0Q7QUFDbkUsUUFBSSxrQkFBa0I7QUFDbEIsV0FBRyxNQUFIO0FBQ0EsV0FBRyxNQUFIO0FBQ0EsWUFBSSxJQUFKO0FBQ0EsY0FBTSxJQUFOO0FBQ0EsZ0JBQVEsR0FBUjtBQUNBLGdCQUFRLE1BQVI7QUFDQSxlQUFPLElBQVA7QUFDQSxzQkFBYztBQUNWLGVBQUcsTUFBSDtBQUNBLGVBQUcsTUFBSDtTQUZKO0tBUkE7OztBQUQrRCxtQkFnQm5FLENBQWdCLE1BQWhCLEdBQXlCLEtBQUssR0FBTCxDQUFTLE1BQVQsQ0FBZ0IsTUFBaEIsRUFBd0IsTUFBeEIsRUFBZ0MsVUFBaEMsQ0FBekIsQ0FoQm1FO0FBaUJuRSxvQkFBZ0IsTUFBaEIsQ0FBdUIsS0FBdkIsQ0FBNkIsS0FBN0IsQ0FBbUMscUJBQVcsWUFBWCxDQUFuQyxDQWpCbUU7QUFrQm5FLG9CQUFnQixNQUFoQixDQUF1QixNQUF2QixDQUE4QixLQUE5QixDQUFvQyxxQkFBVyxhQUFYLENBQXBDOzs7QUFsQm1FLG1CQXFCbkUsQ0FBZ0IsTUFBaEIsQ0FBdUIsVUFBdkIsQ0FBa0MsR0FBbEMsQ0FBc0MsTUFBdEMsRUFBOEMscUJBQVcsY0FBWCxFQUEyQixxQkFBVyxtQkFBWCxFQUFnQyxJQUF6RyxFQXJCbUU7QUFzQm5FLG9CQUFnQixNQUFoQixDQUF1QixVQUF2QixDQUFrQyxHQUFsQyxDQUFzQyxPQUF0QyxFQUErQyxxQkFBVyxlQUFYLEVBQTRCLHFCQUFXLG1CQUFYLEVBQWdDLElBQTNHLEVBdEJtRTs7QUF3Qm5FLG9CQUFnQixNQUFoQixDQUF1QixFQUF2QixHQUE0QixFQUE1QixDQXhCbUU7O0FBMEJuRSxXQUFPLGVBQVAsQ0ExQm1FO0NBQXhEOzs7Ozs7Ozs7a0JDVUEsWUFBVzs7O0FBQ3RCLFNBQUssTUFBTCxDQUFZLEVBQVosQ0FBZSxTQUFmLEVBQTBCLDRCQUFrQixJQUFsQixDQUF1QixJQUF2QixDQUExQixFQURzQjtBQUV0QixTQUFLLE1BQUwsQ0FBWSxFQUFaLENBQWUsWUFBZixFQUE2Qiw2QkFBbUIsSUFBbkIsQ0FBd0IsSUFBeEIsQ0FBN0IsRUFGc0I7O0FBSXRCLFNBQUssTUFBTCxDQUFZLEVBQVosQ0FBZSxnQkFBZixFQUFpQywwQkFBZ0IsSUFBaEIsQ0FBcUIsSUFBckIsQ0FBakMsRUFKc0I7QUFLdEIsU0FBSyxNQUFMLENBQVksRUFBWixDQUFlLGFBQWYsRUFBOEIsdUJBQWEsSUFBYixDQUFrQixJQUFsQixDQUE5QixFQUxzQjtBQU10QixTQUFLLE1BQUwsQ0FBWSxFQUFaLENBQWUsZUFBZixFQUFnQyx5QkFBZSxJQUFmLENBQW9CLElBQXBCLENBQWhDLEVBTnNCOztBQVF0QixTQUFLLE1BQUwsQ0FBWSxFQUFaLENBQWUsZ0JBQWYsRUFBaUMsMEJBQWdCLElBQWhCLENBQXFCLElBQXJCLENBQWpDLEVBUnNCO0FBU3RCLFNBQUssTUFBTCxDQUFZLEVBQVosQ0FBZSxnQkFBZixFQUFpQywwQkFBZ0IsSUFBaEIsQ0FBcUIsSUFBckIsQ0FBakMsRUFUc0I7QUFVdEIsU0FBSyxNQUFMLENBQVksRUFBWixDQUFlLHNCQUFmLEVBQXVDLCtCQUFxQixJQUFyQixDQUEwQixJQUExQixDQUF2QyxFQVZzQjs7QUFZdEIsU0FBSyxNQUFMLENBQVksRUFBWixDQUFlLGNBQWYsRUFBK0Isd0JBQWMsSUFBZCxDQUFtQixJQUFuQixDQUEvQixFQVpzQjtBQWF0QixTQUFLLE1BQUwsQ0FBWSxFQUFaLENBQWUsZ0JBQWYsRUFBaUMsMEJBQWdCLElBQWhCLENBQXFCLElBQXJCLENBQWpDLEVBYnNCOztBQWV0QiwyQkFBYSxFQUFiLENBQWdCLHdCQUFoQixFQUEwQyxVQUFDLElBQUQsRUFBVTtBQUNoRCxjQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLHdCQUFqQixFQUEyQztBQUN2QyxvQkFBUSxNQUFLLE1BQUw7QUFDUixzQkFBVSxLQUFLLFFBQUw7U0FGZCxFQURnRDtLQUFWLENBQTFDLENBZnNCO0NBQVg7O0FBWmY7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7Ozs7O2tCQ1Z3QjtBQUFULFNBQVMsYUFBVCxDQUF1QixJQUF2QixFQUE2QjtBQUN4QyxRQUFJLEtBQUssRUFBTCxLQUFhLE9BQU8sS0FBSyxNQUFMLENBQVksRUFBWixFQUNwQixPQURKOztBQUdBLFFBQUksaUJBQWlCLEtBQUssWUFBTCxDQUFrQixNQUFsQixDQUF5QixLQUFLLENBQUwsRUFBUSxLQUFLLENBQUwsRUFBUSxVQUF6QyxDQUFqQixDQUpvQztBQUt4QyxtQkFBZSxRQUFmLEdBQTBCLEtBQUssUUFBTCxDQUxjO0FBTXhDLG1CQUFlLFFBQWYsR0FBMEIsS0FBSyxRQUFMLENBTmM7QUFPeEMsbUJBQWUsTUFBZixHQUF3QixLQUFLLE1BQUwsQ0FQZ0I7QUFReEMsbUJBQWUsUUFBZixHQUEwQixLQUFLLFlBQUwsQ0FSYztBQVN4QyxtQkFBZSxNQUFmLEdBQXdCLEtBQUssTUFBTCxDQVRnQjtBQVV4QyxtQkFBZSxLQUFmLEdBQXVCLEtBQUssS0FBTCxDQVZpQjtBQVd4QyxTQUFLLElBQUwsQ0FBVSxPQUFWLENBQWtCLE1BQWxCLENBQXlCLGNBQXpCLEVBQXlDLE9BQU8sT0FBUCxDQUFlLE1BQWYsQ0FBekMsQ0FYd0M7QUFZeEMsbUJBQWUsSUFBZixDQUFvQixPQUFwQixDQUE0QixDQUE1QixHQUFnQyxDQUFDLElBQUQsQ0FaUTs7QUFjeEMsUUFBSSxjQUFjLEtBQUssSUFBTCxDQUFVLE9BQVYsQ0FBa0IsTUFBbEIsQ0FBeUIsb0JBQXpCLENBQThDLEtBQUssWUFBTCxFQUFtQixLQUFLLEtBQUwsQ0FBL0UsQ0Fkb0M7QUFleEMsbUJBQWUsSUFBZixDQUFvQixRQUFwQixDQUE2QixDQUE3QixJQUFrQyxZQUFZLENBQVosQ0FmTTtBQWdCeEMsbUJBQWUsSUFBZixDQUFvQixRQUFwQixDQUE2QixDQUE3QixJQUFrQyxZQUFZLENBQVosQ0FoQk07Q0FBN0I7Ozs7Ozs7O2tCQ0FTO0FBQVQsU0FBUyxlQUFULENBQXlCLElBQXpCLEVBQStCO0FBQzFDLFFBQUksS0FBSyxFQUFMLEtBQWEsT0FBTyxLQUFLLE1BQUwsQ0FBWSxFQUFaLEVBQ3BCLE9BREo7O0FBR0EsUUFBSSxlQUFlLEVBQUUsSUFBRixDQUFPLEtBQUssT0FBTCxDQUFhLEtBQUssYUFBTCxDQUFiLENBQWlDLFFBQWpDLEVBQTJDO0FBQ2pFLGtCQUFVLEtBQUssUUFBTDtLQURLLENBQWYsQ0FKc0M7O0FBUTFDLFFBQUksQ0FBQyxZQUFELEVBQWU7QUFDZixnQkFBUSxHQUFSLENBQVksb0JBQVosRUFBa0MsS0FBSyxRQUFMLENBQWxDLENBRGU7QUFFZixlQUZlO0tBQW5COztBQUtBLGlCQUFhLElBQWIsR0FiMEM7Q0FBL0I7Ozs7Ozs7O2tCQ0VTOztBQUZ4Qjs7Ozs7O0FBRWUsU0FBUyxZQUFULENBQXNCLElBQXRCLEVBQTRCO0FBQ3ZDLFFBQUksYUFBYSxxQkFBVyxJQUFYLENBQWdCLElBQWhCLEVBQXNCLEtBQUssRUFBTCxDQUFuQzs7O0FBRG1DLFFBSW5DLENBQUUsVUFBRixFQUFjO0FBQ2QsZUFEYztLQUFsQjs7O0FBSnVDLGNBU3ZDLENBQVcsTUFBWCxDQUFrQixDQUFsQixHQUFzQixLQUFLLENBQUwsQ0FUaUI7QUFVdkMsZUFBVyxNQUFYLENBQWtCLENBQWxCLEdBQXNCLEtBQUssQ0FBTCxDQVZpQjs7QUFZdkMsUUFBSSxXQUFXLE1BQVgsQ0FBa0IsQ0FBbEIsR0FBc0IsV0FBVyxZQUFYLENBQXdCLENBQXhCLEVBQTJCO0FBQ2pELG1CQUFXLE1BQVgsQ0FBa0IsVUFBbEIsQ0FBNkIsSUFBN0IsQ0FBa0MsT0FBbEMsRUFEaUQ7S0FBckQsTUFHSyxJQUFJLFdBQVcsTUFBWCxDQUFrQixDQUFsQixHQUFzQixXQUFXLFlBQVgsQ0FBd0IsQ0FBeEIsRUFDL0I7QUFDSSxtQkFBVyxNQUFYLENBQWtCLFVBQWxCLENBQTZCLElBQTdCLENBQWtDLE1BQWxDLEVBREo7S0FESyxNQUtMO0FBQ0ksbUJBQVcsTUFBWCxDQUFrQixVQUFsQixDQUE2QixJQUE3QixHQURKO0FBRUksbUJBQVcsTUFBWCxDQUFrQixLQUFsQixHQUEwQixDQUExQixDQUZKO0tBTEs7O0FBVUwsZUFBVyxZQUFYLENBQXdCLENBQXhCLEdBQTRCLFdBQVcsTUFBWCxDQUFrQixDQUFsQixDQXpCVztBQTBCdkMsZUFBVyxZQUFYLENBQXdCLENBQXhCLEdBQTRCLFdBQVcsTUFBWCxDQUFrQixDQUFsQixDQTFCVztDQUE1Qjs7Ozs7Ozs7a0JDSVM7O0FBTnhCOzs7Ozs7QUFFQSxJQUFJLGdCQUFnQixJQUFoQjtBQUNKLElBQUksa0JBQWtCLElBQWxCO0FBQ0osSUFBSSxrQkFBa0IsSUFBbEI7O0FBRVcsU0FBUyxlQUFULENBQXlCLElBQXpCLEVBQStCOzs7QUFDMUMsUUFBSSxLQUFLLGVBQUwsS0FBMEIsT0FBTyxLQUFLLE1BQUwsQ0FBWSxFQUFaLEVBQ2pDLE9BREo7O0FBR0EsU0FBSyxNQUFMLENBQVksSUFBWixDQUFpQixNQUFqQixHQUEwQixLQUFLLE1BQUwsQ0FKZ0I7QUFLMUMsMkJBQWEsSUFBYixDQUFrQixlQUFsQixFQUFtQyxPQUFPLEtBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsTUFBakIsQ0FBMUMsRUFMMEM7O0FBTzFDLFFBQUksS0FBSyxNQUFMLENBQVksSUFBWixDQUFpQixNQUFqQixHQUEwQixFQUExQixJQUFnQyxLQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLE1BQWpCLEdBQTBCLEdBQTFCLEVBQStCO0FBQy9ELHFCQUFhLGFBQWIsRUFEK0Q7QUFFL0Qsd0JBQWdCLFdBQVcsWUFBTTs7QUFFN0Isa0JBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsb0JBQWpCLEVBQXVDO0FBQ25DLHdCQUFRLE1BQUssTUFBTDthQURaLEVBRjZCO1NBQU4sRUFLeEIsSUFMYSxDQUFoQixDQUYrRDtLQUFuRTs7QUFVQSxRQUFJLEtBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsTUFBakIsR0FBMEIsQ0FBMUIsSUFBK0IsS0FBSyxNQUFMLENBQVksSUFBWixDQUFpQixNQUFqQixJQUEyQixFQUEzQixFQUErQjs7QUFFOUQscUJBQWEsYUFBYixFQUY4RDtBQUc5RCxzQkFBYyxlQUFkLEVBSDhEO0FBSTlELHdCQUFnQixXQUFXLFlBQU07QUFDN0IsOEJBQWtCLE1BQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsTUFBakIsQ0FEVztBQUU3Qiw4QkFBa0IsWUFBWSxZQUFNO0FBQ2hDLG9CQUFJLG1CQUFtQixHQUFuQixFQUF3QjtBQUN4QixrQ0FBYyxlQUFkLEVBRHdCO2lCQUE1Qjs7QUFJQSxtQ0FBbUIsRUFBbkI7OztBQUxnQyxxQkFRaEMsQ0FBSyxNQUFMLENBQVksSUFBWixDQUFpQixnQkFBakIsRUFBbUM7QUFDL0IsNEJBQVEsTUFBSyxNQUFMO2lCQURaLEVBUmdDO2FBQU4sRUFXM0IsR0FYZSxDQUFsQixDQUY2QjtTQUFOLEVBY3hCLElBZGEsQ0FBaEIsQ0FKOEQ7S0FBbEU7Q0FqQlc7Ozs7Ozs7O2tCQ0pTOztBQUZ4Qjs7Ozs7O0FBRWUsU0FBUyxvQkFBVCxDQUE4QixJQUE5QixFQUFvQztBQUMvQyxRQUFJLEtBQUssRUFBTCxLQUFhLE9BQU8sS0FBSyxNQUFMLENBQVksRUFBWixFQUNwQixPQURKOztBQUdBLFNBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsTUFBakIsR0FBMEIsS0FBSyxNQUFMLENBSnFCO0FBSy9DLDJCQUFhLElBQWIsQ0FBa0IsZUFBbEIsRUFBbUMsT0FBTyxLQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLE1BQWpCLENBQTFDLEVBTCtDO0NBQXBDOzs7OztBQ0ZmOzs7O0FBQ0E7Ozs7OztBQUVBLE9BQU8sT0FBUCxHQUFpQixVQUFTLElBQVQsRUFBZTtBQUM1QixRQUFJLEtBQUssZUFBTCxLQUEwQixPQUFPLEtBQUssTUFBTCxDQUFZLEVBQVosRUFDakMsT0FESjs7O0FBRDRCLFFBSzVCLENBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsYUFBakIsR0FBaUMsSUFBSSxrQkFBUSxLQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLHVCQUFqQixDQUFaLENBQXNEO0FBQ25GLGNBQU0sS0FBSyxJQUFMO0tBRHVCLENBQWpDLENBTDRCO0FBUTVCLFNBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsYUFBakIsQ0FBK0IsRUFBL0IsR0FBb0MsS0FBSyxNQUFMLENBQVksSUFBWixDQUFpQix1QkFBakIsQ0FSUjs7QUFVNUIsUUFBSSxLQUFLLGFBQUwsS0FBdUIsZUFBdkIsRUFDQSxLQUFLLFVBQUwsQ0FBZ0IsV0FBaEIsQ0FBNEIsS0FBSyxNQUFMLENBQVksSUFBWixDQUFpQix1QkFBakIsQ0FBNUIsQ0FESjs7O0FBVjRCLFFBYzVCLENBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsZUFBakIsR0FBbUMsSUFBSSxrQkFBUSxLQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLHlCQUFqQixDQUFaLENBQXdEO0FBQ3ZGLGNBQU0sS0FBSyxJQUFMO0tBRHlCLENBQW5DLENBZDRCO0FBaUI1QixTQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLGVBQWpCLENBQWlDLEVBQWpDLEdBQXNDLEtBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIseUJBQWpCLENBakJWOztBQW1CNUIsUUFBSSxLQUFLLGFBQUwsS0FBdUIsaUJBQXZCLEVBQ0EsS0FBSyxVQUFMLENBQWdCLFdBQWhCLENBQTRCLEtBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIseUJBQWpCLENBQTVCLENBREo7OztBQW5CNEIsUUF1QjVCLENBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsTUFBakIsR0FBMEIsS0FBSyxNQUFMLENBdkJFO0FBd0I1QiwyQkFBYSxJQUFiLENBQWtCLGVBQWxCLEVBQW1DLE9BQU8sS0FBSyxNQUFMLENBQVksSUFBWixDQUFpQixNQUFqQixDQUExQzs7O0FBeEI0QixRQTJCeEIsYUFBYSxLQUFLLFdBQUwsQ0FBaUIsbUJBQWpCLEVBQWIsQ0EzQndCO0FBNEI1QixTQUFLLE1BQUwsQ0FBWSxDQUFaLEdBQWdCLFdBQVcsQ0FBWCxDQTVCWTtBQTZCNUIsU0FBSyxNQUFMLENBQVksQ0FBWixHQUFnQixXQUFXLENBQVgsQ0E3Qlk7Q0FBZjs7Ozs7Ozs7a0JDRE87O0FBRnhCOzs7Ozs7QUFFZSxTQUFTLGNBQVQsQ0FBd0IsSUFBeEIsRUFBOEI7QUFDekMsUUFBSSxlQUFlLHFCQUFXLElBQVgsQ0FBZ0IsSUFBaEIsRUFBc0IsS0FBSyxFQUFMLENBQXJDOzs7QUFEcUMsUUFJckMsQ0FBQyxZQUFELEVBQWU7QUFDZixnQkFBUSxHQUFSLENBQVksb0JBQVosRUFBa0MsS0FBSyxFQUFMLENBQWxDLENBRGU7QUFFZixlQUZlO0tBQW5COztBQUtBLGlCQUFhLE1BQWIsQ0FBb0IsSUFBcEI7OztBQVR5QyxRQVl6QyxDQUFLLE9BQUwsQ0FBYSxNQUFiLENBQW9CLEtBQUssT0FBTCxDQUFhLE9BQWIsQ0FBcUIsWUFBckIsQ0FBcEIsRUFBd0QsQ0FBeEQsRUFaeUM7Q0FBOUI7Ozs7Ozs7O2tCQ0FTOztBQUZ4Qjs7Ozs7O0FBRWUsU0FBUyxpQkFBVCxHQUE2QjtBQUN4QyxZQUFRLEdBQVIsQ0FBWSw0QkFBWjs7O0FBRHdDLFFBSXhDLENBQUssT0FBTCxDQUFhLE9BQWIsQ0FBcUIsVUFBVSxLQUFWLEVBQWlCO0FBQ2xDLFlBQUksS0FBSixFQUFXLE1BQU0sSUFBTixHQUFYO0tBRGlCLENBQXJCLENBSndDOztBQVF4QyxTQUFLLE9BQUwsR0FBZSxFQUFmOzs7QUFSd0MsUUFXeEMsQ0FBSyxNQUFMLENBQVksSUFBWixDQUFpQixZQUFqQixFQUErQjtBQUMzQixnQkFBUSw4QkFBZSxRQUFmLENBQVI7QUFDQSxXQUFHLEtBQUssTUFBTCxDQUFZLENBQVo7QUFDSCxXQUFHLEtBQUssTUFBTCxDQUFZLENBQVo7S0FIUCxFQVh3QztDQUE3Qjs7Ozs7Ozs7a0JDRlM7QUFBVCxTQUFTLGtCQUFULEdBQThCO0FBQ3pDLFlBQVEsR0FBUixDQUFZLGlDQUFaLEVBRHlDO0NBQTlCOzs7Ozs7OztrQkNHUzs7QUFIeEI7Ozs7QUFDQTs7Ozs7O0FBRWUsU0FBUyxlQUFULENBQXlCLElBQXpCLEVBQStCOzs7QUFDMUMsU0FBSyxNQUFMLEdBQWMsS0FBSyxJQUFMLENBQVUsRUFBVixDQUQ0Qjs7QUFHMUMsUUFBSSxTQUFTLE9BQU8sUUFBUCxDQUFnQixRQUFoQixHQUEyQixJQUEzQixHQUFrQyxPQUFPLFFBQVAsQ0FBZ0IsSUFBaEIsR0FBdUIsT0FBTyxRQUFQLENBQWdCLFFBQWhCLEdBQTJCLFVBQXBGLEdBQWlHLEtBQUssSUFBTCxDQUFVLEVBQVYsQ0FIcEU7QUFJMUMsV0FBTyxPQUFQLENBQWUsU0FBZixDQUF5QixFQUFFLE1BQU0sTUFBTixFQUEzQixFQUEyQyxFQUEzQyxFQUErQyxNQUEvQyxFQUowQzs7QUFNMUMsU0FBSyxPQUFMLENBQWEsT0FBYixDQUFxQixVQUFVLEtBQVYsRUFBaUI7QUFDbEMsY0FBTSxNQUFOLENBQWEsSUFBYixHQURrQztLQUFqQixDQUFyQixDQU4wQzs7QUFVMUMsU0FBSyxPQUFMLEdBQWUsRUFBZixDQVYwQzs7QUFZMUMsMkJBQWEsSUFBYixDQUFrQixnQkFBbEIsRUFBb0MsS0FBSyxJQUFMLENBQVUsT0FBVixDQUFwQyxDQVowQzs7QUFjMUMsU0FBSyxJQUFMLENBQVUsT0FBVixDQUFrQixPQUFsQixDQUEwQixVQUFDLE1BQUQsRUFBWTtBQUNsQyxZQUFJLE9BQU8sRUFBUCxLQUFlLE9BQU8sTUFBSyxNQUFMLENBQVksRUFBWixFQUFpQjtBQUN2QyxtQ0FBYSxJQUFiLENBQWtCLGNBQWxCLEVBQWtDLE9BQU8sT0FBTyxJQUFQLENBQVksS0FBWixDQUF6QyxFQUR1QztBQUV2QyxtQ0FBYSxJQUFiLENBQWtCLGVBQWxCLEVBQW1DLE9BQU8sT0FBTyxJQUFQLENBQVksTUFBWixDQUExQyxFQUZ1QztBQUd2QyxtQ0FBYSxJQUFiLENBQWtCLGVBQWxCLEVBQW1DLEVBQUUsY0FBRixFQUFuQyxFQUh1QztBQUl2QyxtQkFKdUM7U0FBM0M7O0FBT0EsWUFBSSxrQkFBa0IsdUJBQWEsSUFBYixRQUF3QixPQUFPLEVBQVAsRUFBVyxNQUFLLElBQUwsRUFBVyxNQUFLLE1BQUwsRUFBYSxPQUFPLENBQVAsRUFBVSxPQUFPLENBQVAsQ0FBdkYsQ0FSOEI7QUFTbEMsY0FBSyxPQUFMLENBQWEsSUFBYixDQUFrQixlQUFsQixFQVRrQztLQUFaLENBQTFCLENBZDBDO0NBQS9COzs7Ozs7Ozs7OztBQ0hmOzs7O0FBQ0E7Ozs7Ozs7Ozs7OztJQUVxQjs7O0FBQ2pCLGFBRGlCLElBQ2pCLENBQVksTUFBWixFQUFvQjs4QkFESCxNQUNHOzs7Ozs7MkVBREgsa0JBQ0c7O0FBTWhCLGVBQU8sS0FBUCxDQUFhLElBQWIsQ0FBa0IsT0FBTyxTQUFQLEVBQWtCLE9BQU8sSUFBUCxFQUFhLE9BQU8sSUFBUCxDQUFZLEtBQVosRUFBbUIsT0FBcEUsRUFBNkUsS0FBN0UsRUFBb0YsSUFBcEYsRUFBMEYsT0FBTyxPQUFQLENBQWUsTUFBZixDQUExRjs7O0FBTmdCLGFBU2hCLENBQUssRUFBTCxHQUFVLE9BQU8sSUFBUCxDQUFZLEdBQVosQ0FBZ0IsS0FBaEIsQ0FBc0IsWUFBdEIsQ0FBVixDQVRnQjtBQVVoQixjQUFLLGFBQUwsR0FBcUIsSUFBckIsQ0FWZ0I7O0FBWWhCLGNBQUssTUFBTCxHQUFjLEVBQWQsQ0FaZ0I7QUFhaEIsY0FBSyxRQUFMLEdBQWdCLENBQWhCLENBYmdCO0FBY2hCLGNBQUssV0FBTCxHQUFtQixJQUFuQixDQWRnQjtBQWVoQixjQUFLLFFBQUwsR0FBZ0IsR0FBaEIsQ0FmZ0I7O0FBaUJoQixhQUFLLElBQUksSUFBSSxDQUFKLEVBQU8sSUFBSSxFQUFKLEVBQVEsR0FBeEIsRUFDQTtBQUNJLGdCQUFJLFNBQVMscUJBQVcsT0FBTyxJQUFQLEVBQWEsVUFBeEIsRUFBb0MsT0FBTyxNQUFQLENBQTdDLENBRFI7QUFFSSxtQkFBTyxRQUFQLEdBQWtCLHFCQUFsQixDQUZKO0FBR0ksbUJBQU8sTUFBUCxHQUFnQixDQUFoQixDQUhKO0FBSUksbUJBQU8sS0FBUCxHQUFlLEVBQWYsQ0FKSjtBQUtJLG1CQUFPLE1BQVAsR0FBZ0IsRUFBaEIsQ0FMSjtBQU1JLGtCQUFLLEdBQUwsQ0FBUyxNQUFULEVBQWlCLElBQWpCLEVBTko7U0FEQTtxQkFqQmdCO0tBQXBCOztpQkFEaUI7OzZCQTZCWixRQUFRLFFBQVEsUUFBUSxRQUFRO0FBQ2pDLGdCQUFJLEtBQUssSUFBTCxDQUFVLElBQVYsQ0FBZSxJQUFmLEdBQXNCLEtBQUssUUFBTCxFQUN0QixPQURKOztBQUdBLGdCQUFJLElBQUksT0FBTyxDQUFQLEdBQVcsRUFBWCxDQUp5QjtBQUtqQyxnQkFBSSxJQUFJLE9BQU8sQ0FBUCxHQUFXLENBQUMsRUFBRCxDQUxjOztBQU9qQyxpQkFBSyxjQUFMLENBQW9CLEtBQXBCLEVBQTJCLElBQTNCLENBQWdDLENBQWhDLEVBQW1DLENBQW5DLEVBQXNDLENBQXRDLEVBQXlDLEtBQUssV0FBTCxFQUFrQixDQUEzRCxFQUE4RCxDQUE5RCxFQUFpRSxNQUFqRSxFQUF5RSxNQUF6RSxFQVBpQztBQVFqQyxpQkFBSyxNQUFMLENBQVksVUFBWixFQUF3QixJQUF4QixFQVJpQzs7QUFVakMsaUJBQUssUUFBTCxHQUFnQixLQUFLLElBQUwsQ0FBVSxJQUFWLENBQWUsSUFBZixHQUFzQixLQUFLLFFBQUwsQ0FWTDtBQVdqQyxpQkFBSyxFQUFMLENBQVEsTUFBUixHQUFpQixLQUFLLE1BQUwsQ0FYZ0I7QUFZakMsaUJBQUssRUFBTCxDQUFRLElBQVIsR0FaaUM7Ozs7V0E3QnBCO0VBQWEsT0FBTyxLQUFQOztrQkFBYjs7Ozs7Ozs7Ozs7QUNIckI7Ozs7QUFDQTs7Ozs7Ozs7Ozs7O0lBRXFCOzs7QUFDakIsYUFEaUIsR0FDakIsQ0FBYSxNQUFiLEVBQXFCOzhCQURKLEtBQ0k7OzJFQURKLGlCQUNJOztBQUdqQixlQUFPLEtBQVAsQ0FBYSxJQUFiLENBQWtCLE9BQU8sU0FBUCxFQUFrQixPQUFPLElBQVAsRUFBYSxPQUFPLElBQVAsQ0FBWSxLQUFaLEVBQW1CLE9BQXBFLEVBQTZFLEtBQTdFLEVBQW9GLElBQXBGLEVBQTBGLE9BQU8sT0FBUCxDQUFlLE1BQWYsQ0FBMUY7OztBQUhpQixhQU1qQixDQUFLLEVBQUwsR0FBVSxPQUFPLElBQVAsQ0FBWSxHQUFaLENBQWdCLEtBQWhCLENBQXNCLFdBQXRCLENBQVYsQ0FOaUI7QUFPakIsY0FBSyxhQUFMLEdBQXFCLElBQXJCLENBUGlCOztBQVNqQixjQUFLLE1BQUwsR0FBYyxFQUFkLENBVGlCO0FBVWpCLGNBQUssUUFBTCxHQUFnQixDQUFoQixDQVZpQjtBQVdqQixjQUFLLFdBQUwsR0FBbUIsSUFBbkIsQ0FYaUI7QUFZakIsY0FBSyxRQUFMLEdBQWdCLEdBQWhCLENBWmlCOztBQWNqQixhQUFLLElBQUksSUFBSSxDQUFKLEVBQU8sSUFBSSxFQUFKLEVBQVEsR0FBeEIsRUFDQTtBQUNJLGdCQUFJLFNBQVMscUJBQVcsT0FBTyxJQUFQLEVBQWEsVUFBeEIsRUFBb0MsT0FBTyxNQUFQLENBQTdDLENBRFI7QUFFSSxtQkFBTyxRQUFQLEdBQWtCLHFCQUFsQixDQUZKO0FBR0ksbUJBQU8sTUFBUCxHQUFnQixDQUFoQixDQUhKO0FBSUksbUJBQU8sS0FBUCxHQUFlLEVBQWYsQ0FKSjtBQUtJLG1CQUFPLE1BQVAsR0FBZ0IsRUFBaEIsQ0FMSjtBQU1JLGtCQUFLLEdBQUwsQ0FBUyxNQUFULEVBQWlCLElBQWpCLEVBTko7U0FEQTtxQkFkaUI7S0FBckI7O2lCQURpQjs7NkJBMEJaLFFBQVEsUUFBUSxRQUFRLFFBQVE7QUFDakMsZ0JBQUksS0FBSyxJQUFMLENBQVUsSUFBVixDQUFlLElBQWYsR0FBc0IsS0FBSyxRQUFMLEVBQ3RCLE9BREo7O0FBR0EsZ0JBQUksSUFBSSxPQUFPLENBQVAsR0FBVyxFQUFYLENBSnlCO0FBS2pDLGdCQUFJLElBQUksT0FBTyxDQUFQLEdBQVcsRUFBWCxDQUx5Qjs7QUFPakMsaUJBQUssY0FBTCxDQUFvQixLQUFwQixFQUEyQixJQUEzQixDQUFnQyxDQUFoQyxFQUFtQyxDQUFuQyxFQUFzQyxDQUF0QyxFQUF5QyxLQUFLLFdBQUwsRUFBa0IsQ0FBM0QsRUFBOEQsQ0FBOUQsRUFBaUUsTUFBakUsRUFBeUUsTUFBekUsRUFQaUM7QUFRakMsaUJBQUssTUFBTCxDQUFZLFVBQVosRUFBd0IsSUFBeEIsRUFSaUM7O0FBVWpDLGlCQUFLLFFBQUwsR0FBZ0IsS0FBSyxJQUFMLENBQVUsSUFBVixDQUFlLElBQWYsR0FBc0IsS0FBSyxRQUFMLENBVkw7QUFXakMsaUJBQUssRUFBTCxDQUFRLE1BQVIsR0FBaUIsS0FBSyxNQUFMLENBWGdCO0FBWWpDLGlCQUFLLEVBQUwsQ0FBUSxJQUFSLEdBWmlDOzs7O1dBMUJwQjtFQUFZLE9BQU8sS0FBUDs7a0JBQVo7OztBQ0hyQjs7QUFFQSxJQUFJLFNBQVMsUUFBUSxXQUFSLENBQVQ7QUFDSixJQUFJLE9BQU8sUUFBUSxTQUFSLENBQVA7O0FBRUosSUFBSSxZQUFZLFNBQVosU0FBWSxDQUFVLE1BQVYsRUFBa0I7QUFDOUIsV0FBTyxLQUFQLENBQWEsSUFBYixDQUFrQixJQUFsQixFQUF3QixPQUFPLElBQVAsRUFBYSxPQUFPLElBQVAsQ0FBWSxLQUFaLEVBQW1CLFlBQXhELEVBQXNFLEtBQXRFLEVBQTZFLElBQTdFLEVBQW1GLE9BQU8sT0FBUCxDQUFlLE1BQWYsQ0FBbkY7OztBQUQ4QixRQUk5QixDQUFLLEVBQUwsR0FBVSxPQUFPLElBQVAsQ0FBWSxHQUFaLENBQWdCLEtBQWhCLENBQXNCLGlCQUF0QixDQUFWLENBSjhCO0FBSzlCLFNBQUssYUFBTCxHQUFxQixJQUFyQixDQUw4Qjs7QUFPOUIsU0FBSyxJQUFMLEdBQVksWUFBWixDQVA4QjtBQVE5QixTQUFLLE1BQUwsR0FBYyxFQUFkLENBUjhCO0FBUzlCLFNBQUssUUFBTCxHQUFnQixDQUFoQixDQVQ4QjtBQVU5QixTQUFLLFdBQUwsR0FBbUIsSUFBbkI7OztBQVY4QixRQWE5QixDQUFLLFFBQUwsR0FBZ0IsSUFBaEIsQ0FiOEI7O0FBZTlCLFNBQUssSUFBSSxJQUFJLENBQUosRUFBTyxJQUFJLEVBQUosRUFBUSxHQUF4QixFQUNBO0FBQ0ksWUFBSSxTQUFTLElBQUksTUFBSixDQUFXLE9BQU8sSUFBUCxFQUFhLFVBQXhCLEVBQW9DLE9BQU8sTUFBUCxDQUE3QyxDQURSO0FBRUksZUFBTyxRQUFQLEdBQWtCLE1BQWxCLENBRko7QUFHSSxlQUFPLE1BQVAsR0FBZ0IsQ0FBaEIsQ0FISjtBQUlJLGVBQU8sS0FBUCxHQUFlLEVBQWYsQ0FKSjtBQUtJLGVBQU8sTUFBUCxHQUFnQixFQUFoQixDQUxKOztBQU9JLGFBQUssR0FBTCxDQUFTLE1BQVQsRUFBaUIsSUFBakIsRUFQSjtLQURBOztBQVdBLFdBQU8sSUFBUCxDQTFCOEI7Q0FBbEI7O0FBNkJoQixVQUFVLFNBQVYsR0FBc0IsT0FBTyxNQUFQLENBQWMsT0FBTyxLQUFQLENBQWEsU0FBYixDQUFwQztBQUNBLFVBQVUsU0FBVixDQUFvQixXQUFwQixHQUFrQyxTQUFsQzs7QUFFQSxVQUFVLFNBQVYsQ0FBb0IsSUFBcEIsR0FBMkIsVUFBVSxNQUFWLEVBQWtCLE1BQWxCLEVBQTBCLE1BQTFCLEVBQWtDO0FBQ3pELFFBQUksS0FBSyxJQUFMLENBQVUsSUFBVixDQUFlLElBQWYsR0FBc0IsS0FBSyxRQUFMLEVBQ3RCLE9BREo7O0FBR0EsUUFBSSxJQUFJLE9BQU8sQ0FBUCxHQUFXLEVBQVgsQ0FKaUQ7QUFLekQsUUFBSSxJQUFJLE9BQU8sQ0FBUCxHQUFXLEVBQVgsQ0FMaUQ7O0FBT3pELFNBQUssY0FBTCxDQUFvQixLQUFwQixFQUEyQixJQUEzQixDQUFnQyxDQUFoQyxFQUFtQyxDQUFuQyxFQUFzQyxDQUF0QyxFQUF5QyxLQUFLLFdBQUwsRUFBa0IsQ0FBM0QsRUFBOEQsQ0FBOUQsRUFBaUUsTUFBakUsRUFBeUUsTUFBekUsRUFQeUQ7QUFRekQsU0FBSyxNQUFMLENBQVksVUFBWixFQUF3QixJQUF4QixFQVJ5RDs7QUFVekQsU0FBSyxRQUFMLEdBQWdCLEtBQUssSUFBTCxDQUFVLElBQVYsQ0FBZSxJQUFmLEdBQXNCLEtBQUssUUFBTCxDQVZtQjtBQVd6RCxTQUFLLEVBQUwsQ0FBUSxNQUFSLEdBQWlCLEVBQWpCLENBWHlEO0FBWXpELFNBQUssRUFBTCxDQUFRLElBQVIsR0FaeUQ7Q0FBbEM7O0FBZTNCLE9BQU8sT0FBUCxHQUFpQixTQUFqQjs7O0FDcERBOztBQUVBLElBQUksU0FBUyxRQUFRLFdBQVIsQ0FBVDtBQUNKLElBQUksT0FBTyxRQUFRLFNBQVIsQ0FBUDs7QUFFSixJQUFJLE9BQU8sU0FBUCxJQUFPLENBQVUsTUFBVixFQUFrQjtBQUN6QixXQUFPLEtBQVAsQ0FBYSxJQUFiLENBQWtCLElBQWxCLEVBQXdCLE9BQU8sSUFBUCxFQUFhLE9BQU8sSUFBUCxDQUFZLEtBQVosRUFBbUIsY0FBeEQsRUFBd0UsS0FBeEUsRUFBK0UsSUFBL0UsRUFBcUYsT0FBTyxPQUFQLENBQWUsTUFBZixDQUFyRjs7O0FBRHlCLFFBSXpCLENBQUssRUFBTCxHQUFVLE9BQU8sSUFBUCxDQUFZLEdBQVosQ0FBZ0IsS0FBaEIsQ0FBc0IsbUJBQXRCLENBQVYsQ0FKeUI7QUFLekIsU0FBSyxhQUFMLEdBQXFCLElBQXJCLENBTHlCOztBQU96QixTQUFLLE1BQUwsR0FBYyxFQUFkLENBUHlCO0FBUXpCLFNBQUssUUFBTCxHQUFnQixDQUFoQixDQVJ5QjtBQVN6QixTQUFLLFdBQUwsR0FBbUIsSUFBbkIsQ0FUeUI7QUFVekIsU0FBSyxRQUFMLEdBQWdCLEdBQWhCLENBVnlCOztBQVl6QixTQUFLLElBQUksSUFBSSxDQUFKLEVBQU8sSUFBSSxFQUFKLEVBQVEsR0FBeEIsRUFDQTtBQUNJLFlBQUksU0FBUyxJQUFJLE1BQUosQ0FBVyxPQUFPLElBQVAsRUFBYSxVQUF4QixFQUFvQyxPQUFPLE1BQVAsQ0FBN0MsQ0FEUjtBQUVJLGVBQU8sUUFBUCxHQUFrQixNQUFsQixDQUZKO0FBR0ksZUFBTyxNQUFQLEdBQWdCLENBQWhCLENBSEo7QUFJSSxlQUFPLEtBQVAsR0FBZSxFQUFmLENBSko7QUFLSSxlQUFPLE1BQVAsR0FBZ0IsRUFBaEIsQ0FMSjtBQU1JLGFBQUssR0FBTCxDQUFTLE1BQVQsRUFBaUIsSUFBakIsRUFOSjtLQURBOztBQVVBLFdBQU8sSUFBUCxDQXRCeUI7Q0FBbEI7O0FBeUJYLEtBQUssU0FBTCxHQUFpQixPQUFPLE1BQVAsQ0FBYyxPQUFPLEtBQVAsQ0FBYSxTQUFiLENBQS9CO0FBQ0EsS0FBSyxTQUFMLENBQWUsV0FBZixHQUE2QixJQUE3Qjs7QUFFQSxLQUFLLFNBQUwsQ0FBZSxJQUFmLEdBQXNCLFVBQVMsTUFBVCxFQUFpQixNQUFqQixFQUF5QixNQUF6QixFQUFpQztBQUNuRCxRQUFJLEtBQUssSUFBTCxDQUFVLElBQVYsQ0FBZSxJQUFmLEdBQXNCLEtBQUssUUFBTCxFQUN0QixPQURKOztBQUdBLFFBQUksSUFBSSxPQUFPLENBQVAsR0FBVyxFQUFYLENBSjJDO0FBS25ELFFBQUksSUFBSSxPQUFPLENBQVAsR0FBVyxFQUFYLENBTDJDOztBQU9uRCxTQUFLLGNBQUwsQ0FBb0IsS0FBcEIsRUFBMkIsSUFBM0IsQ0FBZ0MsQ0FBaEMsRUFBbUMsQ0FBbkMsRUFBc0MsQ0FBdEMsRUFBeUMsS0FBSyxXQUFMLEVBQWtCLENBQTNELEVBQThELENBQTlELEVBQWlFLE1BQWpFLEVBQXlFLE1BQXpFLEVBUG1EO0FBUW5ELFNBQUssTUFBTCxDQUFZLFVBQVosRUFBd0IsSUFBeEIsRUFSbUQ7O0FBVW5ELFNBQUssUUFBTCxHQUFnQixLQUFLLElBQUwsQ0FBVSxJQUFWLENBQWUsSUFBZixHQUFzQixLQUFLLFFBQUwsQ0FWYTtBQVduRCxTQUFLLEVBQUwsQ0FBUSxNQUFSLEdBQWlCLEVBQWpCLENBWG1EO0FBWW5ELFNBQUssRUFBTCxDQUFRLElBQVIsR0FabUQ7Q0FBakM7O0FBZXRCLE9BQU8sT0FBUCxHQUFpQixJQUFqQjs7Ozs7Ozs7Ozs7QUNoREE7Ozs7QUFDQTs7Ozs7Ozs7Ozs7O0lBRXFCOzs7QUFDakIsYUFEaUIsSUFDakIsQ0FBWSxNQUFaLEVBQW9COzs7OEJBREgsTUFDRzs7MkVBREgsa0JBQ0c7O0FBR2hCLGVBQU8sS0FBUCxDQUFhLElBQWIsUUFBd0IsT0FBTyxJQUFQLEVBQWEsT0FBTyxJQUFQLENBQVksS0FBWixFQUFtQixPQUF4RCxFQUFpRSxLQUFqRSxFQUF3RSxJQUF4RSxFQUE4RSxPQUFPLE9BQVAsQ0FBZSxNQUFmLENBQTlFOzs7QUFIZ0IsYUFNaEIsQ0FBSyxFQUFMLEdBQVUsT0FBTyxJQUFQLENBQVksR0FBWixDQUFnQixLQUFoQixDQUFzQixXQUF0QixDQUFWLENBTmdCO0FBT2hCLGNBQUssYUFBTCxHQUFxQixJQUFyQixDQVBnQjs7QUFTaEIsY0FBSyxNQUFMLEdBQWMsRUFBZCxDQVRnQjtBQVVoQixjQUFLLFFBQUwsR0FBZ0IsQ0FBaEIsQ0FWZ0I7QUFXaEIsY0FBSyxXQUFMLEdBQW1CLElBQW5CLENBWGdCO0FBWWhCLGNBQUssUUFBTCxHQUFnQixJQUFoQixDQVpnQjs7QUFjaEIsYUFBSyxJQUFJLElBQUksQ0FBSixFQUFPLElBQUksRUFBSixFQUFRLEdBQXhCLEVBQ0E7QUFDSSxnQkFBSSxTQUFTLHFCQUFXLE9BQU8sSUFBUCxFQUFhLFVBQXhCLEVBQW9DLE9BQU8sTUFBUCxDQUE3QyxDQURSO0FBRUksbUJBQU8sUUFBUCxHQUFrQixxQkFBbEIsQ0FGSjtBQUdJLG1CQUFPLE1BQVAsR0FBZ0IsQ0FBaEIsQ0FISjtBQUlJLG1CQUFPLEtBQVAsR0FBZSxFQUFmLENBSko7QUFLSSxtQkFBTyxNQUFQLEdBQWdCLEVBQWhCLENBTEo7QUFNSSxrQkFBSyxHQUFMLENBQVMsTUFBVCxFQUFpQixJQUFqQixFQU5KO1NBREE7O0FBVUEscUVBeEJnQjtLQUFwQjs7aUJBRGlCOzs2QkE0QlosUUFBUSxRQUFRLFFBQVEsUUFBUTtBQUNqQyxnQkFBSSxLQUFLLElBQUwsQ0FBVSxJQUFWLENBQWUsSUFBZixHQUFzQixLQUFLLFFBQUwsRUFDdEIsT0FESjs7QUFHQSxnQkFBSSxJQUFJLE9BQU8sQ0FBUCxHQUFXLEVBQVgsQ0FKeUI7QUFLakMsZ0JBQUksSUFBSSxPQUFPLENBQVAsR0FBVyxFQUFYLENBTHlCOztBQU9qQyxpQkFBSyxjQUFMLENBQW9CLEtBQXBCLEVBQTJCLElBQTNCLENBQWdDLENBQWhDLEVBQW1DLENBQW5DLEVBQXNDLENBQXRDLEVBQXlDLEtBQUssV0FBTCxFQUFrQixDQUEzRCxFQUE4RCxDQUE5RCxFQUFpRSxNQUFqRSxFQUF5RSxNQUF6RSxFQVBpQztBQVFqQyxpQkFBSyxNQUFMLENBQVksVUFBWixFQUF3QixJQUF4QixFQVJpQzs7QUFVakMsaUJBQUssUUFBTCxHQUFnQixLQUFLLElBQUwsQ0FBVSxJQUFWLENBQWUsSUFBZixHQUFzQixLQUFLLFFBQUwsQ0FWTDtBQVdqQyxpQkFBSyxFQUFMLENBQVEsTUFBUixHQUFpQixNQUFNLE1BQU4sQ0FYZ0I7QUFZakMsaUJBQUssRUFBTCxDQUFRLElBQVIsR0FaaUM7Ozs7V0E1QnBCO0VBQWEsT0FBTyxLQUFQOztrQkFBYjs7Ozs7Ozs7Ozs7QUNIckI7Ozs7QUFDQTs7Ozs7Ozs7Ozs7O0lBRXFCOzs7QUFDakIsYUFEaUIsSUFDakIsQ0FBWSxNQUFaLEVBQW9COzhCQURILE1BQ0c7OzJFQURILGtCQUNHOztBQUdoQixlQUFPLEtBQVAsQ0FBYSxJQUFiLFFBQXdCLE9BQU8sSUFBUCxFQUFhLE9BQU8sSUFBUCxDQUFZLEtBQVosRUFBbUIsTUFBeEQsRUFBZ0UsS0FBaEUsRUFBdUUsSUFBdkUsRUFBNkUsT0FBTyxPQUFQLENBQWUsTUFBZixDQUE3RTs7O0FBSGdCLGFBTWhCLENBQUssRUFBTCxHQUFVLE9BQU8sSUFBUCxDQUFZLEdBQVosQ0FBZ0IsS0FBaEIsQ0FBc0IsWUFBdEIsQ0FBVixDQU5nQjtBQU9oQixjQUFLLGFBQUwsR0FBcUIsSUFBckIsQ0FQZ0I7O0FBU2hCLGNBQUssTUFBTCxHQUFjLEVBQWQsQ0FUZ0I7QUFVaEIsY0FBSyxRQUFMLEdBQWdCLENBQWhCLENBVmdCO0FBV2hCLGNBQUssV0FBTCxHQUFtQixJQUFuQixDQVhnQjtBQVloQixjQUFLLFFBQUwsR0FBZ0IsR0FBaEIsQ0FaZ0I7O0FBY2hCLGFBQUssSUFBSSxJQUFJLENBQUosRUFBTyxJQUFJLEVBQUosRUFBUSxHQUF4QixFQUNBO0FBQ0ksZ0JBQUksU0FBUyxxQkFBVyxPQUFPLElBQVAsRUFBYSxVQUF4QixFQUFvQyxPQUFPLE1BQVAsQ0FBN0MsQ0FEUjtBQUVJLG1CQUFPLFFBQVAsR0FBa0IscUJBQWxCLENBRko7QUFHSSxtQkFBTyxNQUFQLEdBQWdCLENBQWhCLENBSEo7QUFJSSxtQkFBTyxLQUFQLEdBQWUsRUFBZixDQUpKO0FBS0ksbUJBQU8sTUFBUCxHQUFnQixFQUFoQixDQUxKO0FBTUksa0JBQUssR0FBTCxDQUFTLE1BQVQsRUFBaUIsSUFBakIsRUFOSjtTQURBO3FCQWRnQjtLQUFwQjs7aUJBRGlCOzs2QkEwQlosUUFBUSxRQUFRLFFBQVE7QUFDekIsZ0JBQUksS0FBSyxJQUFMLENBQVUsSUFBVixDQUFlLElBQWYsR0FBc0IsS0FBSyxRQUFMLEVBQ3RCLE9BREo7O0FBR0EsZ0JBQUksSUFBSSxPQUFPLENBQVAsR0FBVyxFQUFYLENBSmlCO0FBS3pCLGdCQUFJLElBQUksT0FBTyxDQUFQLEdBQVcsRUFBWCxDQUxpQjs7QUFPekIsaUJBQUssY0FBTCxDQUFvQixLQUFwQixFQUEyQixJQUEzQixDQUFnQyxDQUFoQyxFQUFtQyxDQUFuQyxFQUFzQyxDQUF0QyxFQUF5QyxLQUFLLFdBQUwsRUFBa0IsQ0FBM0QsRUFBOEQsQ0FBOUQsRUFBaUUsTUFBakUsRUFBeUUsTUFBekUsRUFQeUI7QUFRekIsaUJBQUssTUFBTCxDQUFZLFVBQVosRUFBd0IsSUFBeEIsRUFSeUI7O0FBVXpCLGlCQUFLLFFBQUwsR0FBZ0IsS0FBSyxJQUFMLENBQVUsSUFBVixDQUFlLElBQWYsR0FBc0IsS0FBSyxRQUFMLENBVmI7QUFXekIsaUJBQUssRUFBTCxDQUFRLE1BQVIsR0FBaUIsRUFBakIsQ0FYeUI7QUFZekIsaUJBQUssRUFBTCxDQUFRLElBQVIsR0FaeUI7Ozs7V0ExQlo7RUFBYSxPQUFPLEtBQVA7O2tCQUFiOzs7Ozs7Ozs7OztBQ0hyQjs7OztBQUNBOzs7Ozs7Ozs7Ozs7SUFFcUI7OztBQUNqQixhQURpQixJQUNqQixDQUFZLE1BQVosRUFBb0I7OEJBREgsTUFDRzs7MkVBREgsa0JBQ0c7O0FBR2hCLGVBQU8sS0FBUCxDQUFhLElBQWIsUUFBd0IsT0FBTyxJQUFQLEVBQWEsT0FBTyxJQUFQLENBQVksS0FBWixFQUFtQixNQUF4RCxFQUFnRSxLQUFoRSxFQUF1RSxJQUF2RSxFQUE2RSxPQUFPLE9BQVAsQ0FBZSxNQUFmLENBQTdFLENBSGdCOztBQUtoQixjQUFLLEVBQUwsR0FBVSxPQUFPLElBQVAsQ0FBWSxHQUFaLENBQWdCLEtBQWhCLENBQXNCLFlBQXRCLENBQVYsQ0FMZ0I7O0FBT2hCLGNBQUssUUFBTCxHQUFnQixDQUFoQixDQVBnQjtBQVFoQixjQUFLLFdBQUwsR0FBbUIsSUFBbkIsQ0FSZ0I7QUFTaEIsY0FBSyxRQUFMLEdBQWdCLElBQWhCLENBVGdCOztBQVdoQixhQUFLLElBQUksSUFBSSxDQUFKLEVBQU8sSUFBSSxFQUFKLEVBQVEsR0FBeEIsRUFDQTtBQUNJLGdCQUFJLFNBQVMscUJBQVcsT0FBTyxJQUFQLEVBQWEsVUFBeEIsRUFBb0MsT0FBTyxNQUFQLENBQTdDLENBRFI7QUFFSSxtQkFBTyxRQUFQLEdBQWtCLHFCQUFsQixDQUZKO0FBR0ksbUJBQU8sTUFBUCxHQUFnQixDQUFoQixDQUhKO0FBSUksbUJBQU8sS0FBUCxHQUFlLEVBQWYsQ0FKSjtBQUtJLG1CQUFPLE1BQVAsR0FBZ0IsRUFBaEIsQ0FMSjtBQU1JLGtCQUFLLEdBQUwsQ0FBUyxNQUFULEVBQWlCLElBQWpCLEVBTko7U0FEQTtxQkFYZ0I7S0FBcEI7O2lCQURpQjs7NkJBdUJaLFFBQVEsUUFBUSxRQUFRLFFBQVE7QUFDakMsZ0JBQUksS0FBSyxJQUFMLENBQVUsSUFBVixDQUFlLElBQWYsR0FBc0IsS0FBSyxRQUFMLEVBQ3RCLE9BREo7O0FBR0EsZ0JBQUksSUFBSSxPQUFPLENBQVAsR0FBVyxFQUFYLENBSnlCO0FBS2pDLGdCQUFJLElBQUksT0FBTyxDQUFQLEdBQVcsRUFBWCxDQUx5Qjs7QUFTakMsZ0JBQUksaUJBQWlCLEtBQUssY0FBTCxDQUFvQixLQUFwQixDQUFqQixDQVQ2QjtBQVVqQyxnQkFBSSxDQUFDLGNBQUQsRUFBaUIsT0FBckI7QUFDQSwyQkFBZSxJQUFmLENBQW9CLENBQXBCLEVBQXVCLENBQXZCLEVBQTBCLEVBQTFCLEVBQThCLEtBQUssV0FBTCxFQUFrQixDQUFoRCxFQUFtRCxDQUFuRCxFQUFzRCxNQUF0RCxFQUE4RCxNQUE5RCxFQVhpQzs7QUFnQmpDLDZCQUFpQixLQUFLLGNBQUwsQ0FBb0IsS0FBcEIsQ0FBakIsQ0FoQmlDO0FBaUJqQyxnQkFBSSxDQUFDLGNBQUQsRUFBaUIsT0FBckI7QUFDQSwyQkFBZSxJQUFmLENBQW9CLENBQXBCLEVBQXVCLENBQXZCLEVBQTBCLENBQUMsR0FBRCxFQUFNLEtBQUssV0FBTCxFQUFrQixDQUFsRCxFQUFxRCxDQUFyRCxFQUF3RCxNQUF4RCxFQUFnRSxNQUFoRSxFQWxCaUM7O0FBc0JqQyw2QkFBaUIsS0FBSyxjQUFMLENBQW9CLEtBQXBCLENBQWpCLENBdEJpQztBQXVCakMsZ0JBQUksQ0FBQyxjQUFELEVBQWlCLE9BQXJCO0FBQ0EsMkJBQWUsSUFBZixDQUFvQixDQUFwQixFQUF1QixDQUF2QixFQUEwQixDQUExQixFQUE2QixLQUFLLFdBQUwsRUFBa0IsQ0FBL0MsRUFBa0QsQ0FBbEQsRUFBcUQsTUFBckQsRUFBNkQsTUFBN0QsRUF4QmlDOztBQThCakMsNkJBQWlCLEtBQUssY0FBTCxDQUFvQixLQUFwQixDQUFqQixDQTlCaUM7QUErQmpDLGdCQUFJLENBQUMsY0FBRCxFQUFpQixPQUFyQjtBQUNBLDJCQUFlLElBQWYsQ0FBb0IsQ0FBcEIsRUFBdUIsQ0FBdkIsRUFBMEIsQ0FBMUIsRUFBNkIsS0FBSyxXQUFMLEVBQWtCLENBQS9DLEVBQWtELENBQWxELEVBQXFELE1BQXJELEVBQTZELE1BQTdELEVBaENpQzs7QUFxQ2pDLGlCQUFLLE1BQUwsQ0FBWSxVQUFaLEVBQXdCLElBQXhCLEVBckNpQzs7QUF1Q2pDLGlCQUFLLFFBQUwsR0FBZ0IsS0FBSyxJQUFMLENBQVUsSUFBVixDQUFlLElBQWYsR0FBc0IsS0FBSyxRQUFMLENBdkNMO0FBd0NqQyxpQkFBSyxFQUFMLENBQVEsTUFBUixHQUFpQixLQUFLLE1BQUwsQ0F4Q2dCO0FBeUNqQyxpQkFBSyxFQUFMLENBQVEsSUFBUixHQXpDaUM7Ozs7V0F2QnBCO0VBQWEsT0FBTyxLQUFQOztrQkFBYjs7Ozs7Ozs7Ozs7QUNIckI7Ozs7QUFDQTs7Ozs7Ozs7Ozs7O0lBRXFCOzs7QUFDakIsYUFEaUIsR0FDakIsQ0FBWSxNQUFaLEVBQW9COzhCQURILEtBQ0c7OzJFQURILGlCQUNHOztBQUdoQixlQUFPLEtBQVAsQ0FBYSxJQUFiLFFBQXdCLE9BQU8sSUFBUCxFQUFhLE9BQU8sSUFBUCxDQUFZLEtBQVosRUFBbUIsS0FBeEQsRUFBK0QsS0FBL0QsRUFBc0UsSUFBdEUsRUFBNEUsT0FBTyxPQUFQLENBQWUsTUFBZixDQUE1RTs7O0FBSGdCLGFBTWhCLENBQUssRUFBTCxHQUFVLE9BQU8sSUFBUCxDQUFZLEdBQVosQ0FBZ0IsS0FBaEIsQ0FBc0IsV0FBdEIsQ0FBVixDQU5nQjtBQU9oQixjQUFLLGFBQUwsR0FBcUIsSUFBckIsQ0FQZ0I7O0FBU2hCLGNBQUssTUFBTCxHQUFjLEVBQWQsQ0FUZ0I7QUFVaEIsY0FBSyxRQUFMLEdBQWdCLENBQWhCLENBVmdCO0FBV2hCLGNBQUssV0FBTCxHQUFtQixJQUFuQixDQVhnQjtBQVloQixjQUFLLFFBQUwsR0FBZ0IsR0FBaEIsQ0FaZ0I7O0FBY2hCLGFBQUssSUFBSSxJQUFJLENBQUosRUFBTyxJQUFJLEVBQUosRUFBUSxHQUF4QixFQUNBO0FBQ0ksZ0JBQUksU0FBUyxxQkFBVyxPQUFPLElBQVAsRUFBYSxVQUF4QixFQUFvQyxPQUFPLE1BQVAsQ0FBN0MsQ0FEUjtBQUVJLG1CQUFPLFFBQVAsR0FBa0IscUJBQWxCLENBRko7QUFHSSxtQkFBTyxNQUFQLEdBQWdCLENBQWhCLENBSEo7QUFJSSxtQkFBTyxLQUFQLEdBQWUsRUFBZixDQUpKO0FBS0ksbUJBQU8sTUFBUCxHQUFnQixFQUFoQixDQUxKO0FBTUksa0JBQUssR0FBTCxDQUFTLE1BQVQsRUFBaUIsSUFBakIsRUFOSjtTQURBO3FCQWRnQjtLQUFwQjs7aUJBRGlCOzs2QkEwQlosUUFBUSxRQUFRLFFBQVEsUUFBUTtBQUNqQyxnQkFBSSxLQUFLLElBQUwsQ0FBVSxJQUFWLENBQWUsSUFBZixHQUFzQixLQUFLLFFBQUwsRUFDdEIsT0FESjs7QUFHQSxnQkFBSSxJQUFJLE9BQU8sQ0FBUCxHQUFXLEVBQVgsQ0FKeUI7QUFLakMsZ0JBQUksSUFBSSxPQUFPLENBQVAsR0FBVyxFQUFYLENBTHlCOztBQU9qQyxpQkFBSyxjQUFMLENBQW9CLEtBQXBCLEVBQTJCLElBQTNCLENBQWdDLENBQWhDLEVBQW1DLENBQW5DLEVBQXNDLENBQXRDLEVBQXlDLEtBQUssV0FBTCxFQUFrQixDQUEzRCxFQUE4RCxDQUE5RCxFQUFpRSxNQUFqRSxFQUF5RSxNQUF6RSxFQVBpQztBQVFqQyxpQkFBSyxNQUFMLENBQVksVUFBWixFQUF3QixJQUF4QixFQVJpQzs7QUFVakMsaUJBQUssUUFBTCxHQUFnQixLQUFLLElBQUwsQ0FBVSxJQUFWLENBQWUsSUFBZixHQUFzQixLQUFLLFFBQUwsQ0FWTDtBQVdqQyxpQkFBSyxFQUFMLENBQVEsTUFBUixHQUFpQixLQUFLLE1BQUwsQ0FYZ0I7QUFZakMsaUJBQUssRUFBTCxDQUFRLElBQVIsR0FaaUM7Ozs7V0ExQnBCO0VBQVksT0FBTyxLQUFQOztrQkFBWjs7Ozs7Ozs7Ozs7QUNIckI7Ozs7QUFDQTs7Ozs7Ozs7Ozs7O0lBRXFCOzs7QUFDakIsYUFEaUIsR0FDakIsQ0FBWSxNQUFaLEVBQW9COzhCQURILEtBQ0c7OzJFQURILGlCQUNHOztBQUdoQixlQUFPLEtBQVAsQ0FBYSxJQUFiLFFBQXdCLE9BQU8sSUFBUCxFQUFhLE9BQU8sSUFBUCxDQUFZLEtBQVosRUFBbUIsS0FBeEQsRUFBK0QsS0FBL0QsRUFBc0UsSUFBdEUsRUFBNEUsT0FBTyxPQUFQLENBQWUsTUFBZixDQUE1RTs7O0FBSGdCLGFBTWhCLENBQUssRUFBTCxHQUFVLE9BQU8sSUFBUCxDQUFZLEdBQVosQ0FBZ0IsS0FBaEIsQ0FBc0IsV0FBdEIsQ0FBVixDQU5nQjtBQU9oQixjQUFLLGFBQUwsR0FBcUIsSUFBckIsQ0FQZ0I7O0FBU2hCLGNBQUssTUFBTCxHQUFjLEVBQWQsQ0FUZ0I7QUFVaEIsY0FBSyxRQUFMLEdBQWdCLENBQWhCLENBVmdCO0FBV2hCLGNBQUssV0FBTCxHQUFtQixJQUFuQixDQVhnQjtBQVloQixjQUFLLFFBQUwsR0FBZ0IsSUFBaEIsQ0FaZ0I7O0FBY2hCLGFBQUssSUFBSSxJQUFJLENBQUosRUFBTyxJQUFJLEVBQUosRUFBUSxHQUF4QixFQUNBO0FBQ0ksZ0JBQUksU0FBUyxxQkFBVyxPQUFPLElBQVAsRUFBYSxVQUF4QixFQUFvQyxPQUFPLE1BQVAsQ0FBN0MsQ0FEUjtBQUVJLG1CQUFPLFFBQVAsR0FBa0IscUJBQWxCLENBRko7QUFHSSxtQkFBTyxNQUFQLEdBQWdCLENBQWhCLENBSEo7QUFJSSxtQkFBTyxLQUFQLEdBQWUsRUFBZixDQUpKO0FBS0ksbUJBQU8sTUFBUCxHQUFnQixFQUFoQixDQUxKO0FBTUksa0JBQUssR0FBTCxDQUFTLE1BQVQsRUFBaUIsSUFBakIsRUFOSjtTQURBO3FCQWRnQjtLQUFwQjs7aUJBRGlCOzs2QkEwQlosUUFBUSxRQUFRLFFBQVEsUUFBUTtBQUNqQyxnQkFBSSxLQUFLLElBQUwsQ0FBVSxJQUFWLENBQWUsSUFBZixHQUFzQixLQUFLLFFBQUwsRUFDdEIsT0FESjs7QUFHQSxnQkFBSSxJQUFJLE9BQU8sQ0FBUCxHQUFXLEVBQVgsQ0FKeUI7QUFLakMsZ0JBQUksSUFBSSxPQUFPLENBQVAsR0FBVyxFQUFYLENBTHlCOztBQU9qQyxpQkFBSyxjQUFMLENBQW9CLEtBQXBCLEVBQTJCLElBQTNCLENBQWdDLENBQWhDLEVBQW1DLENBQW5DLEVBQXNDLENBQXRDLEVBQXlDLEtBQUssV0FBTCxFQUFrQixDQUEzRCxFQUE4RCxDQUE5RCxFQUFpRSxNQUFqRSxFQUF5RSxNQUF6RSxFQVBpQztBQVFqQyxpQkFBSyxNQUFMLENBQVksVUFBWixFQUF3QixJQUF4QixFQVJpQzs7QUFVakMsaUJBQUssUUFBTCxHQUFnQixLQUFLLElBQUwsQ0FBVSxJQUFWLENBQWUsSUFBZixHQUFzQixLQUFLLFFBQUwsQ0FWTDtBQVdqQyxpQkFBSyxFQUFMLENBQVEsTUFBUixHQUFpQixLQUFLLE1BQUwsQ0FYZ0I7QUFZakMsaUJBQUssRUFBTCxDQUFRLElBQVIsR0FaaUM7Ozs7V0ExQnBCO0VBQVksT0FBTyxLQUFQOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztrQkFBWjs7Ozs7Ozs7Ozs7QUNIckI7Ozs7QUFDQTs7Ozs7Ozs7Ozs7O0lBRXFCOzs7QUFDakIsYUFEaUIsUUFDakIsQ0FBWSxNQUFaLEVBQW9COzhCQURILFVBQ0c7OzJFQURILHNCQUNHOztBQUdoQixlQUFPLEtBQVAsQ0FBYSxJQUFiLFFBQXdCLE9BQU8sSUFBUCxFQUFhLE9BQU8sSUFBUCxDQUFZLEtBQVosRUFBbUIsT0FBeEQsRUFBaUUsS0FBakUsRUFBd0UsSUFBeEUsRUFBOEUsT0FBTyxPQUFQLENBQWUsTUFBZixDQUE5RTs7O0FBSGdCLGFBTWhCLENBQUssRUFBTCxHQUFVLE9BQU8sSUFBUCxDQUFZLEdBQVosQ0FBZ0IsS0FBaEIsQ0FBc0IsZ0JBQXRCLENBQVYsQ0FOZ0I7QUFPaEIsY0FBSyxhQUFMLEdBQXFCLElBQXJCLENBUGdCOztBQVNoQixjQUFLLE1BQUwsR0FBYyxFQUFkLENBVGdCO0FBVWhCLGNBQUssUUFBTCxHQUFnQixDQUFoQixDQVZnQjtBQVdoQixjQUFLLFdBQUwsR0FBbUIsSUFBbkIsQ0FYZ0I7QUFZaEIsY0FBSyxRQUFMLEdBQWdCLEdBQWhCLENBWmdCOztBQWNoQixhQUFLLElBQUksSUFBSSxDQUFKLEVBQU8sSUFBSSxFQUFKLEVBQVEsR0FBeEIsRUFDQTtBQUNJLGdCQUFJLFNBQVMscUJBQVcsT0FBTyxJQUFQLEVBQWEsVUFBeEIsRUFBb0MsT0FBTyxNQUFQLENBQTdDLENBRFI7QUFFSSxtQkFBTyxRQUFQLEdBQWtCLHFCQUFsQixDQUZKO0FBR0ksbUJBQU8sTUFBUCxHQUFnQixDQUFoQixDQUhKO0FBSUksbUJBQU8sS0FBUCxHQUFlLEVBQWYsQ0FKSjtBQUtJLG1CQUFPLE1BQVAsR0FBZ0IsRUFBaEIsQ0FMSjtBQU1JLGtCQUFLLEdBQUwsQ0FBUyxNQUFULEVBQWlCLElBQWpCLEVBTko7U0FEQTtxQkFkZ0I7S0FBcEI7O2lCQURpQjs7NkJBMEJaLFFBQVEsUUFBUSxRQUFRLFFBQVE7QUFDakMsZ0JBQUksS0FBSyxJQUFMLENBQVUsSUFBVixDQUFlLElBQWYsR0FBc0IsS0FBSyxRQUFMLEVBQ3RCLE9BREo7O0FBR0EsZ0JBQUksSUFBSSxPQUFPLENBQVAsR0FBVyxFQUFYLENBSnlCO0FBS2pDLGdCQUFJLElBQUksT0FBTyxDQUFQLEdBQVcsRUFBWCxDQUx5Qjs7QUFPakMsaUJBQUssY0FBTCxDQUFvQixLQUFwQixFQUEyQixJQUEzQixDQUFnQyxDQUFoQyxFQUFtQyxDQUFuQyxFQUFzQyxDQUF0QyxFQUF5QyxLQUFLLFdBQUwsRUFBa0IsQ0FBM0QsRUFBOEQsQ0FBOUQsRUFBaUUsTUFBakUsRUFBeUUsTUFBekUsRUFQaUM7QUFRakMsaUJBQUssTUFBTCxDQUFZLFVBQVosRUFBd0IsSUFBeEIsRUFSaUM7O0FBVWpDLGlCQUFLLFFBQUwsR0FBZ0IsS0FBSyxJQUFMLENBQVUsSUFBVixDQUFlLElBQWYsR0FBc0IsS0FBSyxRQUFMLENBVkw7QUFXakMsaUJBQUssRUFBTCxDQUFRLE1BQVIsR0FBaUIsS0FBSyxNQUFMLENBWGdCO0FBWWpDLGlCQUFLLEVBQUwsQ0FBUSxJQUFSLEdBWmlDOzs7O1dBMUJwQjtFQUFpQixPQUFPLEtBQVA7O2tCQUFqQjs7Ozs7Ozs7O0FDSHJCOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7a0JBRWU7QUFDWCxzQkFEVztBQUVYLDhCQUZXO0FBR1gsc0NBSFc7QUFJWCx1QkFKVztBQUtYLHFCQUxXO0FBTVgsZ0NBTlc7QUFPWCxzQkFQVztBQVFYLHNCQVJXO0FBU1gsb0JBVFc7QUFVWCxvQkFWVzs7Ozs7Ozs7Ozs7Ozs7QUNYZixJQUFNLGNBQWMsQ0FDaEIsRUFBRSxHQUFHLEdBQUgsRUFBUSxHQUFHLElBQUgsRUFETSxFQUVoQixFQUFFLEdBQUcsSUFBSCxFQUFTLEdBQUcsSUFBSCxFQUZLLEVBR2hCLEVBQUUsR0FBRyxJQUFILEVBQVMsR0FBRyxJQUFILEVBSEssRUFJaEIsRUFBRSxHQUFHLElBQUgsRUFBUyxHQUFHLElBQUgsRUFKSyxFQUtoQixFQUFFLEdBQUcsSUFBSCxFQUFTLEdBQUcsSUFBSCxFQUxLLEVBTWhCLEVBQUUsR0FBRyxJQUFILEVBQVMsR0FBRyxJQUFILEVBTkssRUFPaEIsRUFBRSxHQUFHLElBQUgsRUFBUyxHQUFHLElBQUgsRUFQSyxDQUFkOztBQVVOLElBQU0sU0FBUyxDQUNYLEVBQUUsSUFBSSxDQUFKLEVBQU8sR0FBRyxJQUFILEVBQVMsR0FBRyxJQUFILEVBQVMsT0FBTyxHQUFQLEVBQVksUUFBUSxFQUFSLEVBRDVCLEVBRVgsRUFBRSxJQUFJLENBQUosRUFBTyxHQUFHLElBQUgsRUFBUyxHQUFHLElBQUgsRUFBUyxPQUFPLElBQVAsRUFBYSxRQUFRLEdBQVIsRUFGN0IsRUFHWCxFQUFFLElBQUksQ0FBSixFQUFPLEdBQUcsSUFBSCxFQUFTLEdBQUcsSUFBSCxFQUFTLE9BQU8sR0FBUCxFQUFZLFFBQVEsR0FBUixFQUg1QixFQUlYLEVBQUUsSUFBSSxDQUFKLEVBQU8sR0FBRyxJQUFILEVBQVMsR0FBRyxJQUFILEVBQVMsT0FBTyxHQUFQLEVBQVksUUFBUSxHQUFSLEVBSjVCLEVBS1gsRUFBRSxJQUFJLENBQUosRUFBTyxHQUFHLEdBQUgsRUFBUSxHQUFHLElBQUgsRUFBUyxPQUFPLElBQVAsRUFBYSxRQUFRLEdBQVIsRUFMNUIsRUFNWCxFQUFFLElBQUksQ0FBSixFQUFPLEdBQUcsSUFBSCxFQUFTLEdBQUcsSUFBSCxFQUFTLE9BQU8sR0FBUCxFQUFZLFFBQVEsR0FBUixFQU41QixFQU9YLEVBQUUsSUFBSSxDQUFKLEVBQU8sR0FBRyxJQUFILEVBQVMsR0FBRyxJQUFILEVBQVMsT0FBTyxHQUFQLEVBQVksUUFBUSxDQUFSLEVBUDVCLEVBUVgsRUFBRSxJQUFJLENBQUosRUFBTyxHQUFHLElBQUgsRUFBUyxHQUFHLElBQUgsRUFBUyxPQUFPLEdBQVAsRUFBWSxRQUFRLEdBQVIsRUFSNUIsRUFTWCxFQUFFLElBQUksQ0FBSixFQUFPLEdBQUcsSUFBSCxFQUFTLEdBQUcsSUFBSCxFQUFTLE9BQU8sSUFBUCxFQUFhLFFBQVEsR0FBUixFQVQ3QixFQVVYLEVBQUUsSUFBSSxFQUFKLEVBQVEsR0FBRyxJQUFILEVBQVMsR0FBRyxJQUFILEVBQVMsT0FBTyxHQUFQLEVBQVksUUFBUSxJQUFSLEVBVjdCLEVBV1gsRUFBRSxJQUFJLEVBQUosRUFBUSxHQUFHLElBQUgsRUFBUyxHQUFHLElBQUgsRUFBUyxPQUFPLEdBQVAsRUFBWSxRQUFRLEdBQVIsRUFYN0IsRUFZWCxFQUFFLElBQUksRUFBSixFQUFRLEdBQUcsSUFBSCxFQUFTLEdBQUcsSUFBSCxFQUFTLE9BQU8sR0FBUCxFQUFZLFFBQVEsRUFBUixFQVo3QixFQWFYLEVBQUUsSUFBSSxFQUFKLEVBQVEsR0FBRyxJQUFILEVBQVMsR0FBRyxJQUFILEVBQVMsT0FBTyxHQUFQLEVBQVksUUFBUSxHQUFSLEVBYjdCLEVBY1gsRUFBRSxJQUFJLEVBQUosRUFBUSxHQUFHLElBQUgsRUFBUyxHQUFHLElBQUgsRUFBUyxPQUFPLEdBQVAsRUFBWSxRQUFRLEdBQVIsRUFkN0IsRUFlWCxFQUFFLElBQUksRUFBSixFQUFRLEdBQUcsSUFBSCxFQUFTLEdBQUcsSUFBSCxFQUFTLE9BQU8sR0FBUCxFQUFZLFFBQVEsR0FBUixFQWY3QixFQWdCWCxFQUFFLElBQUksRUFBSixFQUFRLEdBQUcsSUFBSCxFQUFTLEdBQUcsSUFBSCxFQUFTLE9BQU8sSUFBUCxFQUFhLFFBQVEsR0FBUixFQWhCOUIsRUFpQlgsRUFBRSxJQUFJLEVBQUosRUFBUSxHQUFHLElBQUgsRUFBUyxHQUFHLElBQUgsRUFBUyxPQUFPLEdBQVAsRUFBWSxRQUFRLEVBQVIsRUFqQjdCLEVBa0JYLEVBQUUsSUFBSSxFQUFKLEVBQVEsR0FBRyxJQUFILEVBQVMsR0FBRyxJQUFILEVBQVMsT0FBTyxHQUFQLEVBQVksUUFBUSxFQUFSLEVBbEI3QixFQW1CWCxFQUFFLElBQUksRUFBSixFQUFRLEdBQUcsSUFBSCxFQUFTLEdBQUcsSUFBSCxFQUFTLE9BQU8sR0FBUCxFQUFZLFFBQVEsR0FBUixFQW5CN0IsRUFvQlgsRUFBRSxJQUFJLEVBQUosRUFBUSxHQUFHLElBQUgsRUFBUyxHQUFHLElBQUgsRUFBUyxPQUFPLEdBQVAsRUFBWSxRQUFRLEdBQVIsRUFwQjdCLEVBcUJYLEVBQUUsSUFBSSxFQUFKLEVBQVEsR0FBRyxJQUFILEVBQVMsR0FBRyxJQUFILEVBQVMsT0FBTyxHQUFQLEVBQVksUUFBUSxHQUFSLEVBckI3QixFQXNCWCxFQUFFLElBQUksRUFBSixFQUFRLEdBQUcsSUFBSCxFQUFTLEdBQUcsSUFBSCxFQUFTLE9BQU8sR0FBUCxFQUFZLFFBQVEsR0FBUixFQXRCN0IsRUF1QlgsRUFBRSxJQUFJLEVBQUosRUFBUSxHQUFHLElBQUgsRUFBUyxHQUFHLElBQUgsRUFBUyxPQUFPLElBQVAsRUFBYSxRQUFRLEdBQVIsRUF2QjlCLENBQVQ7O0lBMEJlO0FBQ2pCLGFBRGlCLGNBQ2pCLENBQVksU0FBWixFQUF1Qjs4QkFETixnQkFDTTs7QUFDbkIsYUFBSyxTQUFMLEdBQWlCLFNBQWpCLENBRG1CO0tBQXZCOztpQkFEaUI7OzhDQUtLO0FBQ2xCLG1CQUFPLEVBQUUsTUFBRixDQUFTLFdBQVQsQ0FBUCxDQURrQjs7OztpQ0FJYjtBQUNMLGlCQUFLLFNBQUwsQ0FBZSxTQUFmLEdBQTJCLEtBQUssU0FBTCxDQUFlLEdBQWYsQ0FBbUIsVUFBbkIsQ0FBOEIsQ0FBOUIsRUFBaUMsQ0FBakMsRUFBb0MsS0FBSyxTQUFMLENBQWUsSUFBZixDQUFvQixLQUFwQixDQUEwQixLQUExQixFQUFpQyxLQUFLLFNBQUwsQ0FBZSxJQUFmLENBQW9CLEtBQXBCLENBQTBCLE1BQTFCLEVBQWtDLFFBQXZHLENBQTNCLENBREs7QUFFTCxpQkFBSyxTQUFMLENBQWUsU0FBZixHQUEyQixLQUFLLFNBQUwsQ0FBZSxHQUFmLENBQW1CLEtBQW5CLEVBQTNCLENBRks7QUFHTCxpQkFBSyxTQUFMLENBQWUsU0FBZixDQUF5QixVQUF6QixHQUFzQyxJQUF0QyxDQUhLO0FBSUwsaUJBQUssWUFBTCxHQUpLO0FBS0wsaUJBQUssU0FBTCxDQUFlLFNBQWYsQ0FBeUIsTUFBekIsQ0FBZ0MsZ0JBQWhDLEVBQWtELElBQWxELEVBTEs7QUFNTCxpQkFBSyxTQUFMLENBQWUsU0FBZixDQUF5QixNQUF6QixDQUFnQyxtQkFBaEMsRUFBcUQsS0FBckQsRUFOSzs7Ozt1Q0FTTTs7O0FBQ1gsbUJBQU8sT0FBUCxDQUFlLFVBQUMsS0FBRCxFQUFXOztBQUV0QixvQkFBSSxXQUFXLE1BQUssU0FBTCxDQUFlLFNBQWYsQ0FBeUIsTUFBekIsQ0FBZ0MsTUFBTSxDQUFOLEVBQVMsTUFBTSxDQUFOLENBQXBELENBRmtCO0FBR3RCLHlCQUFTLE1BQVQsR0FBa0IsTUFBTSxNQUFOLENBSEk7QUFJdEIseUJBQVMsS0FBVCxHQUFpQixNQUFNLEtBQU47Ozs7Ozs7QUFKSyxhQUFYLENBQWYsQ0FEVzs7OztXQWxCRTs7Ozs7O0FDcENyQjs7QUFFQSxJQUFJLFNBQWdCLFFBQVEsdUJBQVIsQ0FBaEI7SUFDQSxnQkFBZ0IsUUFBUSxrQ0FBUixDQUFoQjtJQUNBLGFBQWdCLFFBQVEsNEJBQVIsQ0FBaEI7SUFDQSxXQUFnQixRQUFRLDJCQUFSLENBQWhCO0lBRUEsQ0FMSjs7QUFPQSxJQUFJLE9BQU8sT0FBUCxHQUFpQixVQUFVLElBQVYsRUFBZ0IsbUJBQWhCLEVBQW9DO0FBQ3hELEtBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsT0FBYixFQUFzQixJQUF0QixDQUR3RDtBQUV4RCxLQUFJLFNBQUMsQ0FBVSxNQUFWLEdBQW1CLENBQW5CLElBQTBCLE9BQU8sSUFBUCxLQUFnQixRQUFoQixFQUEyQjtBQUN6RCxZQUFVLEtBQVYsQ0FEeUQ7QUFFekQsVUFBUSxJQUFSLENBRnlEO0FBR3pELFNBQU8sSUFBUCxDQUh5RDtFQUExRCxNQUlPO0FBQ04sWUFBVSxVQUFVLENBQVYsQ0FBVixDQURNO0VBSlA7QUFPQSxLQUFJLFFBQVEsSUFBUixFQUFjO0FBQ2pCLE1BQUksSUFBSSxJQUFKLENBRGE7QUFFakIsTUFBSSxLQUFKLENBRmlCO0VBQWxCLE1BR087QUFDTixNQUFJLFNBQVMsSUFBVCxDQUFjLElBQWQsRUFBb0IsR0FBcEIsQ0FBSixDQURNO0FBRU4sTUFBSSxTQUFTLElBQVQsQ0FBYyxJQUFkLEVBQW9CLEdBQXBCLENBQUosQ0FGTTtBQUdOLE1BQUksU0FBUyxJQUFULENBQWMsSUFBZCxFQUFvQixHQUFwQixDQUFKLENBSE07RUFIUDs7QUFTQSxRQUFPLEVBQUUsT0FBTyxLQUFQLEVBQWMsY0FBYyxDQUFkLEVBQWlCLFlBQVksQ0FBWixFQUFlLFVBQVUsQ0FBVixFQUF2RCxDQWxCd0Q7QUFtQnhELFFBQU8sQ0FBQyxPQUFELEdBQVcsSUFBWCxHQUFrQixPQUFPLGNBQWMsT0FBZCxDQUFQLEVBQStCLElBQS9CLENBQWxCLENBbkJpRDtDQUFwQzs7QUFzQnJCLEVBQUUsRUFBRixHQUFPLFVBQVUsSUFBVixFQUFnQixHQUFoQixFQUFxQixpQkFBckIsRUFBdUM7QUFDN0MsS0FBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLE9BQVYsRUFBbUIsSUFBbkIsQ0FENkM7QUFFN0MsS0FBSSxPQUFPLElBQVAsS0FBZ0IsUUFBaEIsRUFBMEI7QUFDN0IsWUFBVSxHQUFWLENBRDZCO0FBRTdCLFFBQU0sR0FBTixDQUY2QjtBQUc3QixRQUFNLElBQU4sQ0FINkI7QUFJN0IsU0FBTyxJQUFQLENBSjZCO0VBQTlCLE1BS087QUFDTixZQUFVLFVBQVUsQ0FBVixDQUFWLENBRE07RUFMUDtBQVFBLEtBQUksT0FBTyxJQUFQLEVBQWE7QUFDaEIsUUFBTSxTQUFOLENBRGdCO0VBQWpCLE1BRU8sSUFBSSxDQUFDLFdBQVcsR0FBWCxDQUFELEVBQWtCO0FBQzVCLFlBQVUsR0FBVixDQUQ0QjtBQUU1QixRQUFNLE1BQU0sU0FBTixDQUZzQjtFQUF0QixNQUdBLElBQUksT0FBTyxJQUFQLEVBQWE7QUFDdkIsUUFBTSxTQUFOLENBRHVCO0VBQWpCLE1BRUEsSUFBSSxDQUFDLFdBQVcsR0FBWCxDQUFELEVBQWtCO0FBQzVCLFlBQVUsR0FBVixDQUQ0QjtBQUU1QixRQUFNLFNBQU4sQ0FGNEI7RUFBdEI7QUFJUCxLQUFJLFFBQVEsSUFBUixFQUFjO0FBQ2pCLE1BQUksSUFBSixDQURpQjtBQUVqQixNQUFJLEtBQUosQ0FGaUI7RUFBbEIsTUFHTztBQUNOLE1BQUksU0FBUyxJQUFULENBQWMsSUFBZCxFQUFvQixHQUFwQixDQUFKLENBRE07QUFFTixNQUFJLFNBQVMsSUFBVCxDQUFjLElBQWQsRUFBb0IsR0FBcEIsQ0FBSixDQUZNO0VBSFA7O0FBUUEsUUFBTyxFQUFFLEtBQUssR0FBTCxFQUFVLEtBQUssR0FBTCxFQUFVLGNBQWMsQ0FBZCxFQUFpQixZQUFZLENBQVosRUFBOUMsQ0E3QjZDO0FBOEI3QyxRQUFPLENBQUMsT0FBRCxHQUFXLElBQVgsR0FBa0IsT0FBTyxjQUFjLE9BQWQsQ0FBUCxFQUErQixJQUEvQixDQUFsQixDQTlCc0M7Q0FBdkM7OztBQy9CUDs7QUFFQSxPQUFPLE9BQVAsR0FBaUIsUUFBUSxrQkFBUixNQUNkLE9BQU8sTUFBUCxHQUNBLFFBQVEsUUFBUixDQUZjOzs7QUNGakI7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLFlBQVk7QUFDNUIsS0FBSSxTQUFTLE9BQU8sTUFBUDtLQUFlLEdBQTVCLENBRDRCO0FBRTVCLEtBQUksT0FBTyxNQUFQLEtBQWtCLFVBQWxCLEVBQThCLE9BQU8sS0FBUCxDQUFsQztBQUNBLE9BQU0sRUFBRSxLQUFLLEtBQUwsRUFBUixDQUg0QjtBQUk1QixRQUFPLEdBQVAsRUFBWSxFQUFFLEtBQUssS0FBTCxFQUFkLEVBQTRCLEVBQUUsTUFBTSxNQUFOLEVBQTlCLEVBSjRCO0FBSzVCLFFBQU8sR0FBQyxDQUFJLEdBQUosR0FBVSxJQUFJLEdBQUosR0FBVSxJQUFJLElBQUosS0FBYyxZQUFuQyxDQUxxQjtDQUFaOzs7QUNGakI7O0FBRUEsSUFBSSxPQUFRLFFBQVEsU0FBUixDQUFSO0lBQ0EsUUFBUSxRQUFRLGdCQUFSLENBQVI7SUFFQSxNQUFNLEtBQUssR0FBTDs7QUFFVixPQUFPLE9BQVAsR0FBaUIsVUFBVSxJQUFWLEVBQWdCLGVBQWhCLEVBQWdDO0FBQ2hELEtBQUksS0FBSjtLQUFXLENBQVg7S0FBYyxJQUFJLElBQUksVUFBVSxNQUFWLEVBQWtCLENBQXRCLENBQUo7S0FBOEIsTUFBNUMsQ0FEZ0Q7QUFFaEQsUUFBTyxPQUFPLE1BQU0sSUFBTixDQUFQLENBQVAsQ0FGZ0Q7QUFHaEQsVUFBUyxnQkFBVSxHQUFWLEVBQWU7QUFDdkIsTUFBSTtBQUFFLFFBQUssR0FBTCxJQUFZLElBQUksR0FBSixDQUFaLENBQUY7R0FBSixDQUE4QixPQUFPLENBQVAsRUFBVTtBQUN2QyxPQUFJLENBQUMsS0FBRCxFQUFRLFFBQVEsQ0FBUixDQUFaO0dBRDZCO0VBRHRCLENBSHVDO0FBUWhELE1BQUssSUFBSSxDQUFKLEVBQU8sSUFBSSxDQUFKLEVBQU8sRUFBRSxDQUFGLEVBQUs7QUFDdkIsUUFBTSxVQUFVLENBQVYsQ0FBTixDQUR1QjtBQUV2QixPQUFLLEdBQUwsRUFBVSxPQUFWLENBQWtCLE1BQWxCLEVBRnVCO0VBQXhCO0FBSUEsS0FBSSxVQUFVLFNBQVYsRUFBcUIsTUFBTSxLQUFOLENBQXpCO0FBQ0EsUUFBTyxJQUFQLENBYmdEO0NBQWhDOzs7OztBQ0xqQjs7QUFFQSxPQUFPLE9BQVAsR0FBaUIsVUFBVSxHQUFWLEVBQWU7QUFBRSxTQUFPLE9BQU8sR0FBUCxLQUFlLFVBQWYsQ0FBVDtDQUFmOzs7QUNKakI7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLFFBQVEsa0JBQVIsTUFDZCxPQUFPLElBQVAsR0FDQSxRQUFRLFFBQVIsQ0FGYzs7O0FDRmpCOztBQUVBLE9BQU8sT0FBUCxHQUFpQixZQUFZO0FBQzVCLEtBQUk7QUFDSCxTQUFPLElBQVAsQ0FBWSxXQUFaLEVBREc7QUFFSCxTQUFPLElBQVAsQ0FGRztFQUFKLENBR0UsT0FBTyxDQUFQLEVBQVU7QUFBRSxTQUFPLEtBQVAsQ0FBRjtFQUFWO0NBSmM7OztBQ0ZqQjs7QUFFQSxJQUFJLE9BQU8sT0FBTyxJQUFQOztBQUVYLE9BQU8sT0FBUCxHQUFpQixVQUFVLE1BQVYsRUFBa0I7QUFDbEMsUUFBTyxLQUFLLFVBQVUsSUFBVixHQUFpQixNQUFqQixHQUEwQixPQUFPLE1BQVAsQ0FBMUIsQ0FBWixDQURrQztDQUFsQjs7O0FDSmpCOztBQUVBLElBQUksVUFBVSxNQUFNLFNBQU4sQ0FBZ0IsT0FBaEI7SUFBeUIsU0FBUyxPQUFPLE1BQVA7O0FBRWhELElBQUksVUFBVSxTQUFWLE9BQVUsQ0FBVSxHQUFWLEVBQWUsR0FBZixFQUFvQjtBQUNqQyxLQUFJLEdBQUosQ0FEaUM7QUFFakMsTUFBSyxHQUFMLElBQVksR0FBWjtBQUFpQixNQUFJLEdBQUosSUFBVyxJQUFJLEdBQUosQ0FBWDtFQUFqQjtDQUZhOztBQUtkLE9BQU8sT0FBUCxHQUFpQixVQUFVLHNCQUFWLEVBQWlDO0FBQ2pELEtBQUksU0FBUyxPQUFPLElBQVAsQ0FBVCxDQUQ2QztBQUVqRCxTQUFRLElBQVIsQ0FBYSxTQUFiLEVBQXdCLFVBQVUsT0FBVixFQUFtQjtBQUMxQyxNQUFJLFdBQVcsSUFBWCxFQUFpQixPQUFyQjtBQUNBLFVBQVEsT0FBTyxPQUFQLENBQVIsRUFBeUIsTUFBekIsRUFGMEM7RUFBbkIsQ0FBeEIsQ0FGaUQ7QUFNakQsUUFBTyxNQUFQLENBTmlEO0NBQWpDOzs7QUNUakI7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLFVBQVUsRUFBVixFQUFjO0FBQzlCLEtBQUksT0FBTyxFQUFQLEtBQWMsVUFBZCxFQUEwQixNQUFNLElBQUksU0FBSixDQUFjLEtBQUssb0JBQUwsQ0FBcEIsQ0FBOUI7QUFDQSxRQUFPLEVBQVAsQ0FGOEI7Q0FBZDs7O0FDRmpCOztBQUVBLE9BQU8sT0FBUCxHQUFpQixVQUFVLEtBQVYsRUFBaUI7QUFDakMsS0FBSSxTQUFTLElBQVQsRUFBZSxNQUFNLElBQUksU0FBSixDQUFjLDhCQUFkLENBQU4sQ0FBbkI7QUFDQSxRQUFPLEtBQVAsQ0FGaUM7Q0FBakI7OztBQ0ZqQjs7QUFFQSxPQUFPLE9BQVAsR0FBaUIsUUFBUSxrQkFBUixNQUNkLE9BQU8sU0FBUCxDQUFpQixRQUFqQixHQUNBLFFBQVEsUUFBUixDQUZjOzs7QUNGakI7O0FBRUEsSUFBSSxNQUFNLFlBQU47O0FBRUosT0FBTyxPQUFQLEdBQWlCLFlBQVk7QUFDNUIsS0FBSSxPQUFPLElBQUksUUFBSixLQUFpQixVQUF4QixFQUFvQyxPQUFPLEtBQVAsQ0FBeEM7QUFDQSxRQUFRLEdBQUMsQ0FBSSxRQUFKLENBQWEsS0FBYixNQUF3QixJQUF4QixJQUFrQyxJQUFJLFFBQUosQ0FBYSxLQUFiLE1BQXdCLEtBQXhCLENBRmY7Q0FBWjs7O0FDSmpCOztBQUVBLElBQUksVUFBVSxPQUFPLFNBQVAsQ0FBaUIsT0FBakI7O0FBRWQsT0FBTyxPQUFQLEdBQWlCLFVBQVUsMkJBQVYsRUFBc0M7QUFDdEQsUUFBTyxRQUFRLElBQVIsQ0FBYSxJQUFiLEVBQW1CLFlBQW5CLEVBQWlDLFVBQVUsQ0FBVixDQUFqQyxJQUFpRCxDQUFDLENBQUQsQ0FERjtDQUF0Qzs7O0FDSmpCOzs7O0FBRUEsSUFBSSxJQUFXLFFBQVEsR0FBUixDQUFYO0lBQ0EsV0FBVyxRQUFRLCtCQUFSLENBQVg7SUFFQSxRQUFRLFNBQVMsU0FBVCxDQUFtQixLQUFuQjtJQUEwQixPQUFPLFNBQVMsU0FBVCxDQUFtQixJQUFuQjtJQUN6QyxTQUFTLE9BQU8sTUFBUDtJQUFlLGlCQUFpQixPQUFPLGNBQVA7SUFDekMsbUJBQW1CLE9BQU8sZ0JBQVA7SUFDbkIsaUJBQWlCLE9BQU8sU0FBUCxDQUFpQixjQUFqQjtJQUNqQixhQUFhLEVBQUUsY0FBYyxJQUFkLEVBQW9CLFlBQVksS0FBWixFQUFtQixVQUFVLElBQVYsRUFBdEQ7SUFFQSxFQVRKO0lBU1EsTUFUUjtJQVNjLEdBVGQ7SUFTbUIsSUFUbkI7SUFTeUIsT0FUekI7SUFTa0MsV0FUbEM7SUFTK0MsSUFUL0M7O0FBV0EsS0FBSyxZQUFVLElBQVYsRUFBZ0IsUUFBaEIsRUFBMEI7QUFDOUIsS0FBSSxJQUFKLENBRDhCOztBQUc5QixVQUFTLFFBQVQsRUFIOEI7O0FBSzlCLEtBQUksQ0FBQyxlQUFlLElBQWYsQ0FBb0IsSUFBcEIsRUFBMEIsUUFBMUIsQ0FBRCxFQUFzQztBQUN6QyxTQUFPLFdBQVcsS0FBWCxHQUFtQixPQUFPLElBQVAsQ0FBbkIsQ0FEa0M7QUFFekMsaUJBQWUsSUFBZixFQUFxQixRQUFyQixFQUErQixVQUEvQixFQUZ5QztBQUd6QyxhQUFXLEtBQVgsR0FBbUIsSUFBbkIsQ0FIeUM7RUFBMUMsTUFJTztBQUNOLFNBQU8sS0FBSyxNQUFMLENBREQ7RUFKUDtBQU9BLEtBQUksQ0FBQyxLQUFLLElBQUwsQ0FBRCxFQUFhLEtBQUssSUFBTCxJQUFhLFFBQWIsQ0FBakIsS0FDSyxJQUFJLFFBQU8sS0FBSyxJQUFMLEVBQVAsS0FBc0IsUUFBdEIsRUFBZ0MsS0FBSyxJQUFMLEVBQVcsSUFBWCxDQUFnQixRQUFoQixFQUFwQyxLQUNBLEtBQUssSUFBTCxJQUFhLENBQUMsS0FBSyxJQUFMLENBQUQsRUFBYSxRQUFiLENBQWIsQ0FEQTs7QUFHTCxRQUFPLElBQVAsQ0FoQjhCO0NBQTFCOztBQW1CTCxTQUFPLGNBQVUsSUFBVixFQUFnQixRQUFoQixFQUEwQjtBQUNoQyxLQUFJLEtBQUosRUFBVSxJQUFWLENBRGdDOztBQUdoQyxVQUFTLFFBQVQsRUFIZ0M7QUFJaEMsUUFBTyxJQUFQLENBSmdDO0FBS2hDLElBQUcsSUFBSCxDQUFRLElBQVIsRUFBYyxJQUFkLEVBQW9CLFFBQU8sZ0JBQVk7QUFDdEMsTUFBSSxJQUFKLENBQVMsSUFBVCxFQUFlLElBQWYsRUFBcUIsS0FBckIsRUFEc0M7QUFFdEMsUUFBTSxJQUFOLENBQVcsUUFBWCxFQUFxQixJQUFyQixFQUEyQixTQUEzQixFQUZzQztFQUFaLENBQTNCLENBTGdDOztBQVVoQyxPQUFLLGtCQUFMLEdBQTBCLFFBQTFCLENBVmdDO0FBV2hDLFFBQU8sSUFBUCxDQVhnQztDQUExQjs7QUFjUCxNQUFNLGFBQVUsSUFBVixFQUFnQixRQUFoQixFQUEwQjtBQUMvQixLQUFJLElBQUosRUFBVSxTQUFWLEVBQXFCLFNBQXJCLEVBQWdDLENBQWhDLENBRCtCOztBQUcvQixVQUFTLFFBQVQsRUFIK0I7O0FBSy9CLEtBQUksQ0FBQyxlQUFlLElBQWYsQ0FBb0IsSUFBcEIsRUFBMEIsUUFBMUIsQ0FBRCxFQUFzQyxPQUFPLElBQVAsQ0FBMUM7QUFDQSxRQUFPLEtBQUssTUFBTCxDQU53QjtBQU8vQixLQUFJLENBQUMsS0FBSyxJQUFMLENBQUQsRUFBYSxPQUFPLElBQVAsQ0FBakI7QUFDQSxhQUFZLEtBQUssSUFBTCxDQUFaLENBUitCOztBQVUvQixLQUFJLFFBQU8sNkRBQVAsS0FBcUIsUUFBckIsRUFBK0I7QUFDbEMsT0FBSyxJQUFJLENBQUosRUFBUSxZQUFZLFVBQVUsQ0FBVixDQUFaLEVBQTJCLEVBQUUsQ0FBRixFQUFLO0FBQzVDLE9BQUksU0FBQyxLQUFjLFFBQWQsSUFDRixVQUFVLGtCQUFWLEtBQWlDLFFBQWpDLEVBQTRDO0FBQzlDLFFBQUksVUFBVSxNQUFWLEtBQXFCLENBQXJCLEVBQXdCLEtBQUssSUFBTCxJQUFhLFVBQVUsSUFBSSxDQUFKLEdBQVEsQ0FBUixDQUF2QixDQUE1QixLQUNLLFVBQVUsTUFBVixDQUFpQixDQUFqQixFQUFvQixDQUFwQixFQURMO0lBRkQ7R0FERDtFQURELE1BUU87QUFDTixNQUFJLFNBQUMsS0FBYyxRQUFkLElBQ0YsVUFBVSxrQkFBVixLQUFpQyxRQUFqQyxFQUE0QztBQUM5QyxVQUFPLEtBQUssSUFBTCxDQUFQLENBRDhDO0dBRC9DO0VBVEQ7O0FBZUEsUUFBTyxJQUFQLENBekIrQjtDQUExQjs7QUE0Qk4sT0FBTyxjQUFVLElBQVYsRUFBZ0I7QUFDdEIsS0FBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLFFBQVYsRUFBb0IsU0FBcEIsRUFBK0IsSUFBL0IsQ0FEc0I7O0FBR3RCLEtBQUksQ0FBQyxlQUFlLElBQWYsQ0FBb0IsSUFBcEIsRUFBMEIsUUFBMUIsQ0FBRCxFQUFzQyxPQUExQztBQUNBLGFBQVksS0FBSyxNQUFMLENBQVksSUFBWixDQUFaLENBSnNCO0FBS3RCLEtBQUksQ0FBQyxTQUFELEVBQVksT0FBaEI7O0FBRUEsS0FBSSxRQUFPLDZEQUFQLEtBQXFCLFFBQXJCLEVBQStCO0FBQ2xDLE1BQUksVUFBVSxNQUFWLENBRDhCO0FBRWxDLFNBQU8sSUFBSSxLQUFKLENBQVUsSUFBSSxDQUFKLENBQWpCLENBRmtDO0FBR2xDLE9BQUssSUFBSSxDQUFKLEVBQU8sSUFBSSxDQUFKLEVBQU8sRUFBRSxDQUFGO0FBQUssUUFBSyxJQUFJLENBQUosQ0FBTCxHQUFjLFVBQVUsQ0FBVixDQUFkO0dBQXhCLFNBRUEsR0FBWSxVQUFVLEtBQVYsRUFBWixDQUxrQztBQU1sQyxPQUFLLElBQUksQ0FBSixFQUFRLFdBQVcsVUFBVSxDQUFWLENBQVgsRUFBMEIsRUFBRSxDQUFGLEVBQUs7QUFDM0MsU0FBTSxJQUFOLENBQVcsUUFBWCxFQUFxQixJQUFyQixFQUEyQixJQUEzQixFQUQyQztHQUE1QztFQU5ELE1BU087QUFDTixVQUFRLFVBQVUsTUFBVjtBQUNSLFFBQUssQ0FBTDtBQUNDLFNBQUssSUFBTCxDQUFVLFNBQVYsRUFBcUIsSUFBckIsRUFERDtBQUVDLFVBRkQ7QUFEQSxRQUlLLENBQUw7QUFDQyxTQUFLLElBQUwsQ0FBVSxTQUFWLEVBQXFCLElBQXJCLEVBQTJCLFVBQVUsQ0FBVixDQUEzQixFQUREO0FBRUMsVUFGRDtBQUpBLFFBT0ssQ0FBTDtBQUNDLFNBQUssSUFBTCxDQUFVLFNBQVYsRUFBcUIsSUFBckIsRUFBMkIsVUFBVSxDQUFWLENBQTNCLEVBQXlDLFVBQVUsQ0FBVixDQUF6QyxFQUREO0FBRUMsVUFGRDtBQVBBO0FBV0MsUUFBSSxVQUFVLE1BQVYsQ0FETDtBQUVDLFdBQU8sSUFBSSxLQUFKLENBQVUsSUFBSSxDQUFKLENBQWpCLENBRkQ7QUFHQyxTQUFLLElBQUksQ0FBSixFQUFPLElBQUksQ0FBSixFQUFPLEVBQUUsQ0FBRixFQUFLO0FBQ3ZCLFVBQUssSUFBSSxDQUFKLENBQUwsR0FBYyxVQUFVLENBQVYsQ0FBZCxDQUR1QjtLQUF4QjtBQUdBLFVBQU0sSUFBTixDQUFXLFNBQVgsRUFBc0IsSUFBdEIsRUFBNEIsSUFBNUIsRUFORDtBQVZBLEdBRE07RUFUUDtDQVBNOztBQXNDUCxVQUFVO0FBQ1QsS0FBSSxFQUFKO0FBQ0EsT0FBTSxNQUFOO0FBQ0EsTUFBSyxHQUFMO0FBQ0EsT0FBTSxJQUFOO0NBSkQ7O0FBT0EsY0FBYztBQUNiLEtBQUksRUFBRSxFQUFGLENBQUo7QUFDQSxPQUFNLEVBQUUsTUFBRixDQUFOO0FBQ0EsTUFBSyxFQUFFLEdBQUYsQ0FBTDtBQUNBLE9BQU0sRUFBRSxJQUFGLENBQU47Q0FKRDs7QUFPQSxPQUFPLGlCQUFpQixFQUFqQixFQUFxQixXQUFyQixDQUFQOztBQUVBLE9BQU8sT0FBUCxHQUFpQixVQUFVLGlCQUFVLENBQVYsRUFBYTtBQUN2QyxRQUFPLENBQUMsSUFBSyxJQUFMLEdBQWEsT0FBTyxJQUFQLENBQWQsR0FBNkIsaUJBQWlCLE9BQU8sQ0FBUCxDQUFqQixFQUE0QixXQUE1QixDQUE3QixDQURnQztDQUFiO0FBRzNCLFFBQVEsT0FBUixHQUFrQixPQUFsQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ0b2FzdHIub3B0aW9ucyA9IHtcbiAgICBcImNsb3NlQnV0dG9uXCI6IGZhbHNlLFxuICAgIFwiZGVidWdcIjogZmFsc2UsXG4gICAgXCJuZXdlc3RPblRvcFwiOiBmYWxzZSxcbiAgICBcInByb2dyZXNzQmFyXCI6IGZhbHNlLFxuICAgIFwicG9zaXRpb25DbGFzc1wiOiBcInRvYXN0LXRvcC1jZW50ZXJcIixcbiAgICBcInByZXZlbnREdXBsaWNhdGVzXCI6IGZhbHNlLFxuICAgIFwib25jbGlja1wiOiBudWxsLFxuICAgIFwic2hvd0R1cmF0aW9uXCI6IFwiMzAwXCIsXG4gICAgXCJoaWRlRHVyYXRpb25cIjogXCIxMDAwXCIsXG4gICAgXCJ0aW1lT3V0XCI6IFwiMzAwMFwiLFxuICAgIFwiZXh0ZW5kZWRUaW1lT3V0XCI6IFwiMTAwMFwiLFxuICAgIFwic2hvd0Vhc2luZ1wiOiBcInN3aW5nXCIsXG4gICAgXCJoaWRlRWFzaW5nXCI6IFwibGluZWFyXCIsXG4gICAgXCJzaG93TWV0aG9kXCI6IFwiZmFkZUluXCIsXG4gICAgXCJoaWRlTWV0aG9kXCI6IFwiZmFkZU91dFwiXG59XG5cbi8vIHJlcXVpcmUoJy4vdWknKVxucmVxdWlyZSgnLi9nYW1lJylcbiIsImltcG9ydCBHYW1lQ29uc3RzIGZyb20gJy4uL2xpYi9HYW1lQ29uc3RzJ1xuaW1wb3J0IFNldEV2ZW50SGFuZGxlcnMgZnJvbSAnLi4vbGliL1NvY2tldEV2ZW50cy9TZXRFdmVudEhhbmRsZXJzJ1xuaW1wb3J0IEV2ZW50SGFuZGxlciBmcm9tICcuLi9saWIvRXZlbnRIYW5kbGVyJ1xuaW1wb3J0IEhpZ2hSdWxlSnVuZ2xlIGZyb20gJy4uL21hcHMvSGlnaFJ1bGVKdW5nbGUnXG5pbXBvcnQgV2VhcG9ucyBmcm9tICcuLi9saWIvV2VhcG9ucydcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQ3JlYXRlKCkge1xuICAgIHRoaXMuc29ja2V0ID0gaW8uY29ubmVjdCgpXG4gICAgdGhpcy5lbmVtaWVzID0gW11cbiAgICB0aGlzLnZvbHVtZSA9IEdhbWVDb25zdHMuU1RBUlRJTkdfVk9MVU1FXG4gICAgdGhpcy5lbmVteUJ1bGxldHMgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKClcblxuICAgIC8vICBXZSdyZSBnb2luZyB0byBiZSB1c2luZyBwaHlzaWNzLCBzbyBlbmFibGUgdGhlIEFyY2FkZSBQaHlzaWNzIHN5c3RlbVxuICAgIHRoaXMucGh5c2ljcy5zdGFydFN5c3RlbShQaGFzZXIuUGh5c2ljcy5BUkNBREUpXG5cbiAgICB0aGlzLndvcmxkLnNldEJvdW5kcygwLCAwLCBHYW1lQ29uc3RzLldPUkxEX1dJRFRILCBHYW1lQ29uc3RzLldPUkxEX0hFSUdIVClcblxuICAgIC8vIFNjYWxlIGdhbWUgb24gd2luZG93IHJlc2l6ZVxuICAgIHRoaXMuZ2FtZS5zY2FsZS5zY2FsZU1vZGUgPSBQaGFzZXIuU2NhbGVNYW5hZ2VyLlJFU0laRVxuICAgIHRoaXMuZ2FtZS5zY2FsZS5zZXRTaG93QWxsKClcbiAgICB0aGlzLmdhbWUuc2NhbGUucmVmcmVzaCgpXG5cblxuICAgIC8qKlxuICAgICAqIE1hcFxuICAgICAqL1xuICAgIHRoaXMubWFwSW5zdGFuY2UgPSBuZXcgSGlnaFJ1bGVKdW5nbGUodGhpcylcbiAgICB0aGlzLm1hcEluc3RhbmNlLmNyZWF0ZSgpXG5cblxuICAgIC8qKlxuICAgICAqIFBsYXllciBTZXR0aW5nc1xuICAgICAqL1xuICAgIGxldCBzcGF3blBvaW50ID0gdGhpcy5tYXBJbnN0YW5jZS5nZXRSYW5kb21TcGF3blBvaW50KClcbiAgICB0aGlzLnBsYXllciA9IHRoaXMuYWRkLnNwcml0ZShzcGF3blBvaW50LngsIHNwYXduUG9pbnQueSwgJ2NvbW1hbmRvJylcbiAgICB0aGlzLnBsYXllci5zY2FsZS5zZXRUbyhHYW1lQ29uc3RzLlBMQVlFUl9TQ0FMRSlcbiAgICB0aGlzLnBsYXllci5hbmNob3Iuc2V0VG8oR2FtZUNvbnN0cy5QTEFZRVJfQU5DSE9SKVxuXG4gICAgLy8gIFdlIG5lZWQgdG8gZW5hYmxlIHBoeXNpY3Mgb24gdGhlIHBsYXllclxuICAgIHRoaXMucGh5c2ljcy5hcmNhZGUuZW5hYmxlKHRoaXMucGxheWVyKVxuXG4gICAgLy8gRW5hYmxlIHBoeXNpY3Mgb24gdGhlIHBsYXllclxuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmVuYWJsZSh0aGlzLnBsYXllciwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKVxuXG4gICAgLy8gTWFrZSBwbGF5ZXIgY29sbGlkZSB3aXRoIHdvcmxkIGJvdW5kYXJpZXMgc28gaGUgZG9lc24ndCBsZWF2ZSB0aGUgc3RhZ2VcbiAgICB0aGlzLnBsYXllci5ib2R5LmNvbGxpZGVXb3JsZEJvdW5kcyA9IHRydWVcblxuICAgIC8vIFNldCBwbGF5ZXIgbWluaW11bSBhbmQgbWF4aW11bSBtb3ZlbWVudCBzcGVlZFxuICAgIHRoaXMucGxheWVyLmJvZHkubWF4VmVsb2NpdHkuc2V0VG8oR2FtZUNvbnN0cy5NQVhfU1BFRUQsIEdhbWVDb25zdHMuTUFYX1NQRUVEICogMTApIC8vIHgsIHlcblxuICAgIC8vIEFkZCBkcmFnIHRvIHRoZSBwbGF5ZXIgdGhhdCBzbG93cyB0aGVtIGRvd24gd2hlbiB0aGV5IGFyZSBub3QgYWNjZWxlcmF0aW5nXG4gICAgdGhpcy5wbGF5ZXIuYm9keS5kcmFnLnNldFRvKEdhbWVDb25zdHMuRFJBRywgMCkgLy8geCwgeVxuICAgIHRoaXMucGxheWVyLmJvZHkuc2V0U2l6ZSgyMzAsIDI5MCwgLTEwLCAwKVxuICAgIHRoaXMucGxheWVyLm1ldGEgPSB7XG4gICAgICAgIGhlYWx0aDogMTAwXG4gICAgfVxuXG4gICAgLy8gU2luY2Ugd2UncmUganVtcGluZyB3ZSBuZWVkIGdyYXZpdHlcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZ3Jhdml0eS55ID0gR2FtZUNvbnN0cy5HUkFWSVRZXG5cbiAgICAvLyBGbGFnIHRvIHRyYWNrIGlmIHRoZSBqdW1wIGJ1dHRvbiBpcyBwcmVzc2VkXG4gICAgdGhpcy5qdW1waW5nID0gZmFsc2VcblxuICAgIC8vICBPdXIgdHdvIGFuaW1hdGlvbnMsIHdhbGtpbmcgbGVmdCBhbmQgcmlnaHQuXG4gICAgdGhpcy5wbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ2xlZnQnLCBHYW1lQ29uc3RzLkFOSU1BVElPTl9MRUZULCBHYW1lQ29uc3RzLkFOSU1BVElPTl9GUkFNRVJBVEUsIHRydWUpXG4gICAgdGhpcy5wbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ3JpZ2h0JywgR2FtZUNvbnN0cy5BTklNQVRJT05fUklHSFQsIEdhbWVDb25zdHMuQU5JTUFUSU9OX0ZSQU1FUkFURSwgdHJ1ZSlcblxuICAgIHRoaXMucGxheWVyLm1ldGEgPSB7XG4gICAgICAgIGhlYWx0aDogMTAwLFxuICAgICAgICBwcmltYXJ5V2VhcG9uOiBuZXcgV2VhcG9ucy5BSzQ3KHtcbiAgICAgICAgICAgIGdhbWU6IHRoaXMuZ2FtZSxcbiAgICAgICAgICAgIHJvb3RTY29wZTogdGhpc1xuICAgICAgICB9KSxcbiAgICAgICAgc2Vjb25kYXJ5V2VhcG9uOiBuZXcgV2VhcG9ucy5EZXNlcnRFYWdsZSh7XG4gICAgICAgICAgICBnYW1lOiB0aGlzLmdhbWUsXG4gICAgICAgICAgICByb290U2NvcGU6IHRoaXNcbiAgICAgICAgfSksXG4gICAgICAgIHNlbGVjdGVkUHJpbWFyeVdlYXBvbklkOiAnQUs0NycsXG4gICAgICAgIHNlbGVjdGVkU2Vjb25kYXJ5V2VhcG9uSWQ6ICdEZXNlcnRFYWdsZSdcbiAgICB9XG5cbiAgICB0aGlzLnBsYXllci5tZXRhLnByaW1hcnlXZWFwb24uaWQgPSAnQUs0NydcbiAgICB0aGlzLnBsYXllci5tZXRhLnNlY29uZGFyeVdlYXBvbi5pZCA9ICdEZXNlcnRFYWdsZSdcblxuICAgIHRoaXMubGVmdEFybUdyb3VwID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpXG4gICAgdGhpcy5yaWdodEFybUdyb3VwID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpXG4gICAgdGhpcy5oZWFkR3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKClcbiAgICB0aGlzLnRvcnNvR3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKClcblxuICAgIC8vIFRvcnNvXG4gICAgdGhpcy50b3Jzb1Nwcml0ZSA9IHRoaXMuZ2FtZS5hZGQuc3ByaXRlKC0zNywgLTEwNSwgJ3RvcnNvJylcbiAgICB0aGlzLnRvcnNvU3ByaXRlLnNjYWxlLnNldFRvKDEuOClcbiAgICB0aGlzLnRvcnNvR3JvdXAuYWRkKHRoaXMudG9yc29TcHJpdGUpXG5cbiAgICAvLyBIZWFkXG4gICAgdGhpcy5oZWFkU3ByaXRlID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUoMCwgLTE0OCwgJ2hlYWQnKVxuICAgIHRoaXMuaGVhZFNwcml0ZS5zY2FsZS5zZXRUbygxLjgpXG4gICAgdGhpcy5oZWFkR3JvdXAuYWRkKHRoaXMuaGVhZFNwcml0ZSlcblxuICAgIC8vIExlZnQgYXJtXG4gICAgdGhpcy5sZWZ0QXJtU3ByaXRlID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUoMCwgMCwgJ2xlZnQtYXJtJylcbiAgICB0aGlzLmxlZnRBcm1TcHJpdGUuYW5jaG9yLnNldFRvKC4yLCAuMilcbiAgICB0aGlzLmxlZnRBcm1TcHJpdGUuc2NhbGUuc2V0VG8oMS42KVxuICAgIHRoaXMubGVmdEFybVNwcml0ZS5yb3RhdGlvbiA9IDgwLjFcbiAgICB0aGlzLmxlZnRBcm1Hcm91cC5hZGQodGhpcy5sZWZ0QXJtU3ByaXRlKVxuXG4gICAgLy8gR3VuXG4gICAgdGhpcy5hazQ3U3ByaXRlID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUoMTIsIDE5LCAnQUs0NycpXG4gICAgdGhpcy5hazQ3U3ByaXRlLnNjYWxlLnNldFRvKDEuMylcbiAgICB0aGlzLmFrNDdTcHJpdGUucm90YXRpb24gPSA4MC4xNVxuXG4gICAgLy8gUmlnaHQgYXJtXG4gICAgdGhpcy5yaWdodEFybUdyb3VwLmFkZCh0aGlzLmFrNDdTcHJpdGUpXG4gICAgdGhpcy5yaWdodEFybVNwcml0ZSA9IHRoaXMuZ2FtZS5hZGQuc3ByaXRlKDAsIDAsICdyaWdodC1hcm0nKVxuICAgIHRoaXMucmlnaHRBcm1TcHJpdGUuYW5jaG9yLnNldFRvKC4yLCAuMjQpXG4gICAgdGhpcy5yaWdodEFybVNwcml0ZS5zY2FsZS5zZXRUbygxLjcpXG4gICAgdGhpcy5yaWdodEFybVNwcml0ZS5yb3RhdGlvbiA9IDgwLjFcbiAgICB0aGlzLnJpZ2h0QXJtR3JvdXAuYWRkKHRoaXMucmlnaHRBcm1TcHJpdGUpXG5cbiAgICB0aGlzLnBsYXllci5hZGRDaGlsZCh0aGlzLmxlZnRBcm1Hcm91cClcbiAgICB0aGlzLmxlZnRBcm1Hcm91cC5waXZvdC54ID0gMFxuICAgIHRoaXMubGVmdEFybUdyb3VwLnBpdm90LnkgPSAwXG4gICAgdGhpcy5sZWZ0QXJtR3JvdXAueCA9IDQ1XG4gICAgdGhpcy5sZWZ0QXJtR3JvdXAueSA9IC03MFxuXG4gICAgdGhpcy5wbGF5ZXIuYWRkQ2hpbGQodGhpcy50b3Jzb0dyb3VwKVxuICAgIHRoaXMucGxheWVyLmFkZENoaWxkKHRoaXMuaGVhZEdyb3VwKVxuXG4gICAgdGhpcy5wbGF5ZXIuYWRkQ2hpbGQodGhpcy5yaWdodEFybUdyb3VwKVxuICAgIHRoaXMucmlnaHRBcm1Hcm91cC5waXZvdC54ID0gMFxuICAgIHRoaXMucmlnaHRBcm1Hcm91cC5waXZvdC55ID0gMFxuICAgIHRoaXMucmlnaHRBcm1Hcm91cC54ID0gLTI1XG4gICAgdGhpcy5yaWdodEFybUdyb3VwLnkgPSAtNjVcblxuXG4gICAgLyoqXG4gICAgICogV2VhcG9uc1xuICAgICAqL1xuICAgIHRoaXMuY3VycmVudFdlYXBvbiA9ICdwcmltYXJ5V2VhcG9uJ1xuXG5cbiAgICAvKipcbiAgICAgKiBUZXh0XG4gICAgICovXG4gICAgbGV0IHRleHRTdHlsZXMgPSB7IGZvbnRTaXplOiAnMTRweCcsIGZpbGw6ICcjMDAwJyB9XG5cbiAgICBFdmVudEhhbmRsZXIuZW1pdCgnc2NvcmUgdXBkYXRlJywgJycpXG4gICAgRXZlbnRIYW5kbGVyLmVtaXQoJ2hlYWx0aCB1cGRhdGUnLCAnJylcbiAgICBFdmVudEhhbmRsZXIub24oJ3ZvbHVtZSB1cGRhdGUnLCAoZGF0YSkgPT4ge1xuICAgICAgICB0aGlzLnZvbHVtZSA9IGRhdGEudm9sdW1lXG4gICAgfSlcblxuICAgIEV2ZW50SGFuZGxlci5vbigncHJpbWFyeSB3ZWFwb24gdXBkYXRlJywgKHdlYXBvbikgPT4ge1xuICAgICAgICB0aGlzLnBsYXllci5tZXRhLnNlbGVjdGVkUHJpbWFyeVdlYXBvbklkID0gd2VhcG9uLmlkXG4gICAgfSlcblxuICAgIEV2ZW50SGFuZGxlci5vbignc2Vjb25kYXJ5IHdlYXBvbiB1cGRhdGUnLCAod2VhcG9uKSA9PiB7XG4gICAgICAgIHRoaXMucGxheWVyLm1ldGEuc2VsZWN0ZWRTZWNvbmRhcnlXZWFwb25JZCA9IHdlYXBvbi5pZFxuICAgIH0pXG5cbiAgICB0aGlzLnBvc2l0aW9uVGV4dCA9IHRoaXMuYWRkLnRleHQoMjUsIDI1LCBgJHt0aGlzLmdhbWUuaW5wdXQubW91c2VQb2ludGVyLnh9LCR7dGhpcy5nYW1lLmlucHV0Lm1vdXNlUG9pbnRlci55fWAsIHRleHRTdHlsZXMpXG4gICAgdGhpcy5wb3NpdGlvblRleHQuZml4ZWRUb0NhbWVyYSA9IHRydWVcblxuXG4gICAgLyoqXG4gICAgICogQ2FtZXJhIFNldHRpbmdzXG4gICAgICovXG4gICAgdGhpcy5jYW1lcmEuZm9sbG93KHRoaXMucGxheWVyKVxuXG5cbiAgICAvKipcbiAgICAgKiBSZXNpemluZyBFdmVudHNcbiAgICAgKi9cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xuICAgICAgICB0aGlzLmdhbWUuc2NhbGUucmVmcmVzaCgpXG4gICAgICAgIHRoaXMuZ2FtZS5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHRcbiAgICAgICAgdGhpcy5nYW1lLndpZHRoID0gd2luZG93LmlubmVyV2lkdGhcbiAgICB9KVxuXG5cbiAgICAvKipcbiAgICAgKiBLZXlib2FyZCBFdmVudHNcbiAgICAgKi9cbiAgICAvLyBPcGVuIHNldHRpbmdzIG1vZGFsXG4gICAgdGhpcy5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLlRBQikub25Eb3duLmFkZChmdW5jdGlvbigpIHtcbiAgICAgICAgRXZlbnRIYW5kbGVyLmVtaXQoJ3NldHRpbmdzIG9wZW4nKVxuICAgIH0pXG5cbiAgICAvLyBTd2l0Y2ggd2VhcG9uc1xuICAgIHRoaXMuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5RKS5vbkRvd24uYWRkKCgpID0+IHtcbiAgICAgICAgdGhpcy5jdXJyZW50V2VhcG9uID0gdGhpcy5jdXJyZW50V2VhcG9uID09PSAncHJpbWFyeVdlYXBvbidcbiAgICAgICAgICAgID8gJ3NlY29uZGFyeVdlYXBvbidcbiAgICAgICAgICAgIDogJ3ByaW1hcnlXZWFwb24nXG4gICAgICAgIHRoaXMuYWs0N1Nwcml0ZS5sb2FkVGV4dHVyZSh0aGlzLnBsYXllci5tZXRhW3RoaXMuY3VycmVudFdlYXBvbl0uaWQpXG4gICAgfSlcblxuXG4gICAgLyoqXG4gICAgICogU3RhcnQgbGlzdGVuaW5nIGZvciBldmVudHNcbiAgICAgKi9cbiAgICBTZXRFdmVudEhhbmRsZXJzLmNhbGwodGhpcylcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEluaXQoKSB7XG4gICAgdGhpcy5nYW1lLnJlbmRlcmVyLnJlbmRlclNlc3Npb24ucm91bmRQaXhlbHMgPSB0cnVlXG4gICAgdGhpcy5nYW1lLnN0YWdlLmRpc2FibGVWaXNpYmlsaXR5Q2hhbmdlID0gdHJ1ZVxufVxuIiwiaW1wb3J0IEdhbWVDb25zdHMgZnJvbSAnLi4vbGliL0dhbWVDb25zdHMnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFByZWxvYWQoKSB7XG4gICAgdGhpcy5sb2FkLmltYWdlKCdtYXAtYmcnLCAnL2ltYWdlcy9oaWdoLXJ1bGUtZGVzZXJ0LnBuZycpXG4gICAgdGhpcy5sb2FkLmltYWdlKCdncm91bmQnLCAnL2ltYWdlcy9wbGF0Zm9ybS5wbmcnKVxuICAgIHRoaXMubG9hZC5pbWFnZSgnYnVsbGV0MTInLCAnL2ltYWdlcy9idWxsZXQucG5nJylcblxuICAgIHRoaXMubG9hZC5zcHJpdGVzaGVldCgnZHVkZScsICcvaW1hZ2VzL2R1ZGUucG5nJywgMzIsIDQ4KVxuICAgIHRoaXMubG9hZC5zcHJpdGVzaGVldCgnY29tbWFuZG8nLCAnL2ltYWdlcy9jb21tYW5kby5wbmcnLCAzMDAsIDMxNSlcbiAgICB0aGlzLmxvYWQuc3ByaXRlc2hlZXQoJ2VuZW15JywgJy9pbWFnZXMvZHVkZS5wbmcnLCAzMiwgNDgpXG5cbiAgICAvLyBXZWFwb25zXG4gICAgR2FtZUNvbnN0cy5QUklNQVJZX1dFQVBPTlMuZm9yRWFjaCgod2VhcG9uKSA9PiB7XG4gICAgICAgIHRoaXMubG9hZC5pbWFnZSh3ZWFwb24uaWQsIHdlYXBvbi5pbWFnZSlcbiAgICB9KVxuXG4gICAgR2FtZUNvbnN0cy5TRUNPTkRBUllfV0VBUE9OUy5mb3JFYWNoKCh3ZWFwb24pID0+IHtcbiAgICAgICAgdGhpcy5sb2FkLmltYWdlKHdlYXBvbi5pZCwgd2VhcG9uLmltYWdlKVxuICAgIH0pXG5cbiAgICB0aGlzLmxvYWQuaW1hZ2UoJ3JpZ2h0LWFybScsICcvaW1hZ2VzL2JvZHkvcmlnaHQtYXJtLnBuZycpXG4gICAgdGhpcy5sb2FkLmltYWdlKCdsZWZ0LWFybScsICcvaW1hZ2VzL2JvZHkvbGVmdC1hcm0ucG5nJylcbiAgICB0aGlzLmxvYWQuaW1hZ2UoJ2hlYWQnLCAnL2ltYWdlcy9ib2R5L2hlYWQucG5nJylcbiAgICB0aGlzLmxvYWQuaW1hZ2UoJ3RvcnNvJywgJy9pbWFnZXMvYm9keS90b3Jzby5wbmcnKVxuXG4gICAgdGhpcy5sb2FkLmF1ZGlvKCdBSzQ3LXNvdW5kJywgJy9hdWRpby9BSzQ3Lm9nZycpXG4gICAgdGhpcy5sb2FkLmF1ZGlvKCdNNTAwLXNvdW5kJywgJy9hdWRpby9NNTAwLm9nZycpXG4gICAgdGhpcy5sb2FkLmF1ZGlvKCdTa29ycGlvbi1zb3VuZCcsICcvYXVkaW8vU2tvcnBpb24ub2dnJylcbiAgICB0aGlzLmxvYWQuYXVkaW8oJ0FVRy1zb3VuZCcsICcvYXVkaW8vQVVHLm9nZycpXG4gICAgdGhpcy5sb2FkLmF1ZGlvKCdHNDMtc291bmQnLCAnL2F1ZGlvL0c0My5vZ2cnKVxuICAgIHRoaXMubG9hZC5hdWRpbygnUDkwLXNvdW5kJywgJy9hdWRpby9QOTAub2dnJylcbiAgICB0aGlzLmxvYWQuYXVkaW8oJ000QTEtc291bmQnLCAnL2F1ZGlvL000QTEub2dnJylcbiAgICB0aGlzLmxvYWQuYXVkaW8oJ0JhcnJldE05MC1zb3VuZCcsICcvYXVkaW8vQmFycmV0TTkwLm9nZycpXG5cbiAgICB0aGlzLmxvYWQuYXVkaW8oJ0Rlc2VydEVhZ2xlLXNvdW5kJywgJy9hdWRpby9EZXNlcnRFYWdsZS5vZ2cnKVxuICAgIHRoaXMubG9hZC5hdWRpbygnUlBHLXNvdW5kJywgJy9hdWRpby9SUEcub2dnJylcbn1cbiIsImltcG9ydCBDb2xsaXNpb25IYW5kbGVyIGZyb20gJy4uL2xpYi9Db2xsaXNpb25IYW5kbGVyJ1xuaW1wb3J0IFBsYXllck1vdmVtZW50SGFuZGxlciBmcm9tICcuLi9saWIvUGxheWVyTW92ZW1lbnRIYW5kbGVyJ1xuaW1wb3J0IFBsYXllckp1bXBIYW5kbGVyIGZyb20gJy4uL2xpYi9QbGF5ZXJKdW1wSGFuZGxlcidcbmltcG9ydCBQbGF5ZXJBbmdsZUhhbmRsZXIgZnJvbSAnLi4vbGliL1BsYXllckFuZ2xlSGFuZGxlcidcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gVXBkYXRlKCkge1xuICAgIENvbGxpc2lvbkhhbmRsZXIuY2FsbCh0aGlzKVxuICAgIFBsYXllck1vdmVtZW50SGFuZGxlci5jYWxsKHRoaXMpXG4gICAgUGxheWVySnVtcEhhbmRsZXIuY2FsbCh0aGlzKVxuICAgIFBsYXllckFuZ2xlSGFuZGxlci5jYWxsKHRoaXMpXG5cbiAgICBpZiAodGhpcy5nYW1lLmlucHV0LmFjdGl2ZVBvaW50ZXIuaXNEb3duKVxuICAgIHtcbiAgICAgICAgdGhpcy5wbGF5ZXIubWV0YVt0aGlzLmN1cnJlbnRXZWFwb25dLmZpcmUodGhpcy5wbGF5ZXIsIHRoaXMuc29ja2V0LCB0aGlzLnJvb21JZCwgdGhpcy52b2x1bWUpXG4gICAgfVxuXG4gICAgdGhpcy5wb3NpdGlvblRleHQudGV4dCA9IGAke3RoaXMuZ2FtZS5pbnB1dC53b3JsZFh9LCAke3RoaXMuZ2FtZS5pbnB1dC53b3JsZFl9YFxuXG4gICAgLy8gQ2hlY2sgZm9yIG91dCBvZiBib3VuZHMga2lsbFxuICAgIGlmICh0aGlzLnBsYXllci5ib2R5Lm9uRmxvb3IoKSkge1xuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdwbGF5ZXIgZGFtYWdlZCcsIHtcbiAgICAgICAgICAgIHJvb21JZDogdGhpcy5yb29tSWQsXG4gICAgICAgICAgICBkYW1hZ2U6IDEwMDAsXG4gICAgICAgICAgICBkYW1hZ2VkUGxheWVySWQ6ICcvIycgKyB0aGlzLnNvY2tldC5pZCxcbiAgICAgICAgICAgIGF0dGFja2luZ1BsYXllcklkOiBudWxsXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgdGhpcy5zb2NrZXQuZW1pdCgnbW92ZSBwbGF5ZXInLCB7XG4gICAgICAgIHJvb21JZDogdGhpcy5yb29tSWQsXG4gICAgICAgIHg6IHRoaXMucGxheWVyLngsXG4gICAgICAgIHk6IHRoaXMucGxheWVyLnlcbiAgICB9KVxufVxuIiwiaW1wb3J0IGluaXQgZnJvbSAnLi9jb3JlL0luaXQnXG5pbXBvcnQgcHJlbG9hZCBmcm9tICcuL2NvcmUvUHJlbG9hZCdcbmltcG9ydCB1cGRhdGUgZnJvbSAnLi9jb3JlL1VwZGF0ZSdcbmltcG9ydCBjcmVhdGUgZnJvbSAnLi9jb3JlL0NyZWF0ZSdcblxuY29uc3QgZ2FtZVdpZHRoID0gd2luZG93LmlubmVyV2lkdGhcbmNvbnN0IGdhbWVIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHRcbmxldCBnYW1lID0gbmV3IFBoYXNlci5HYW1lKGdhbWVXaWR0aCwgZ2FtZUhlaWdodCwgUGhhc2VyLkFVVE8sICdyYW5nZXItc3RldmUtZ2FtZScpXG5cbmdhbWUuc3RhdGUuYWRkKCdHYW1lJywgZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5jdXJyZW50V2VhcG9uID0gMFxuICAgIHRoaXMuZW5lbWllcyA9IFtdXG4gICAgdGhpcy5ncm91bmRcbiAgICB0aGlzLnBsYXRmb3Jtc1xuICAgIHRoaXMucGxheWVyXG4gICAgdGhpcy5zb2NrZXRcblxuICAgIHRoaXMuZ2FtZSA9IGdhbWVcbiAgICB0aGlzLmluaXQgPSBpbml0XG4gICAgdGhpcy5wcmVsb2FkID0gcHJlbG9hZFxuICAgIHRoaXMuY3JlYXRlID0gY3JlYXRlXG4gICAgdGhpcy51cGRhdGUgPSB1cGRhdGVcbn0sIHRydWUpXG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBCdWxsZXQgZXh0ZW5kcyBQaGFzZXIuU3ByaXRlIHtcbiAgICBjb25zdHJ1Y3Rvcihyb290U2NvcGUsIGdhbWUsIGtleSkge1xuICAgICAgICBzdXBlcigpXG5cbiAgICAgICAgUGhhc2VyLlNwcml0ZS5jYWxsKHJvb3RTY29wZSwgZ2FtZSwgMCwgMCwga2V5KVxuICAgICAgICB0aGlzLnRleHR1cmUuYmFzZVRleHR1cmUuc2NhbGVNb2RlID0gUElYSS5zY2FsZU1vZGVzLk5FQVJFU1RcbiAgICAgICAgdGhpcy5hbmNob3Iuc2V0KDAuNSlcbiAgICAgICAgdGhpcy5jaGVja1dvcmxkQm91bmRzID0gdHJ1ZVxuICAgICAgICB0aGlzLm91dE9mQm91bmRzS2lsbCA9IHRydWVcbiAgICAgICAgdGhpcy5leGlzdHMgPSBmYWxzZVxuICAgICAgICB0aGlzLnRyYWNraW5nID0gZmFsc2VcbiAgICAgICAgdGhpcy5zY2FsZVNwZWVkID0gMFxuICAgIH1cblxuICAgIGZpcmUoeCwgeSwgYW5nbGUsIHNwZWVkLCBneCwgZ3ksIHNvY2tldCwgcm9vbUlkKSB7XG4gICAgICAgIHRoaXMucmVzZXQoeCwgeSlcblxuICAgICAgICBsZXQgcG9pbnRlckFuZ2xlID0gdGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLm1vdmVUb1BvaW50ZXIodGhpcywgc3BlZWQpXG4gICAgICAgIHRoaXMuYm9keS5ncmF2aXR5LnkgPSAtMTgwMFxuXG4gICAgICAgIGNvbnNvbGUubG9nKCdGaXJpbmcgYnVsbGV0IGxvY2FsbHknLCB0aGlzLmJ1bGxldElkKVxuXG4gICAgICAgIHNvY2tldC5lbWl0KCdidWxsZXQgZmlyZWQnLCB7XG4gICAgICAgICAgICByb29tSWQ6IHJvb21JZCxcbiAgICAgICAgICAgIGJ1bGxldElkOiB0aGlzLmJ1bGxldElkLFxuICAgICAgICAgICAgcGxheWVySWQ6ICcvIycgKyBzb2NrZXQuaWQsXG4gICAgICAgICAgICB4LFxuICAgICAgICAgICAgeSxcbiAgICAgICAgICAgIGFuZ2xlLFxuICAgICAgICAgICAgc3BlZWQsXG4gICAgICAgICAgICBneCxcbiAgICAgICAgICAgIGd5LFxuICAgICAgICAgICAgcG9pbnRlckFuZ2xlLFxuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLmhlaWdodCxcbiAgICAgICAgICAgIHdpZHRoOiB0aGlzLndpZHRoLFxuICAgICAgICAgICAgZGFtYWdlOiB0aGlzLmRhbWFnZVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIHVwZGF0ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMudHJhY2tpbmcpIHtcbiAgICAgICAgICAgIHRoaXMucm90YXRpb24gPSBNYXRoLmF0YW4yKHRoaXMuYm9keS52ZWxvY2l0eS55LCB0aGlzLmJvZHkudmVsb2NpdHkueClcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIENvbGxpc2lvbkhhbmRsZXIoKSB7XG4gICAgLy8gQ29sbGlkZSB0aGlzIHBsYXllciB3aXRoIHRoZSBtYXBcbiAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5wbGF5ZXIsIHRoaXMucGxhdGZvcm1zLCBudWxsLCBudWxsLCB0aGlzKVxuXG4gICAgLy8gRGlkIHRoaXMgcGxheWVyJ3MgYnVsbGV0cyBoaXQgYW55IHBsYXRmb3Jtc1xuICAgIHRoaXMucGh5c2ljcy5hcmNhZGUuY29sbGlkZSh0aGlzLnBsYXRmb3JtcywgdGhpcy5wbGF5ZXIubWV0YS5wcmltYXJ5V2VhcG9uLCAocGxhdGZvcm0sIHdlYXBvbikgPT4ge1xuICAgICAgICB3ZWFwb24ua2lsbCgpXG4gICAgfSwgbnVsbCwgdGhpcylcblxuICAgIHRoaXMucGh5c2ljcy5hcmNhZGUuY29sbGlkZSh0aGlzLnBsYXRmb3JtcywgdGhpcy5wbGF5ZXIubWV0YS5zZWNvbmRhcnlXZWFwb24sIChwbGF0Zm9ybSwgd2VhcG9uKSA9PiB7XG4gICAgICAgIHdlYXBvbi5raWxsKClcbiAgICB9LCBudWxsLCB0aGlzKVxuXG4gICAgLy8gRGlkIGVuZW15IGJ1bGxldHMgaGl0IGFueSBwbGF0Zm9ybXNcbiAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5wbGF0Zm9ybXMsIHRoaXMuZW5lbXlCdWxsZXRzLCAocGxhdGZvcm0sIGJ1bGxldCkgPT4ge1xuICAgICAgICBidWxsZXQua2lsbCgpXG4gICAgfSwgbnVsbCwgdGhpcylcblxuICAgIC8vIERpZCB0aGlzIHBsYXllciBnZXQgaGl0IGJ5IGFueSBlbmVteSBidWxsZXRzXG4gICAgdGhpcy5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMucGxheWVyLCB0aGlzLmVuZW15QnVsbGV0cywgbnVsbCwgKHBsYXllciwgYnVsbGV0KSA9PiB7XG4gICAgICAgIGJ1bGxldC5raWxsKClcblxuICAgICAgICBjb25zb2xlLmxvZygnWW91IHdlcmUgaGl0IGJ5JywgYnVsbGV0LmJ1bGxldElkKVxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdidWxsZXQgcmVtb3ZlZCcsIHtcbiAgICAgICAgICAgIHJvb21JZDogdGhpcy5yb29tSWQsXG4gICAgICAgICAgICBidWxsZXRJZDogYnVsbGV0LmJ1bGxldElkXG4gICAgICAgIH0pXG5cbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgncGxheWVyIGRhbWFnZWQnLCB7XG4gICAgICAgICAgICByb29tSWQ6IHRoaXMucm9vbUlkLFxuICAgICAgICAgICAgZGFtYWdlOiBidWxsZXQuZGFtYWdlLFxuICAgICAgICAgICAgZGFtYWdlZFBsYXllcklkOiAnLyMnICsgdGhpcy5zb2NrZXQuaWQsXG4gICAgICAgICAgICBhdHRhY2tpbmdQbGF5ZXJJZDogYnVsbGV0LnBsYXllcklkXG4gICAgICAgIH0pXG5cbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfSwgdGhpcylcbn1cbiIsImltcG9ydCBlbWl0dGVyIGZyb20gJ2V2ZW50LWVtaXR0ZXInXG5cbmxldCBFdmVudEhhbmRsZXIgPSBlbWl0dGVyKHt9KVxuXG5leHBvcnQgZGVmYXVsdCBFdmVudEhhbmRsZXJcbiIsImNvbnN0IEdhbWVDb25zdHMgPSB7XG4gICAgV09STERfV0lEVEg6IDgwMDAsXG4gICAgV09STERfSEVJR0hUOiAzOTY2LFxuICAgIFNUQVJUSU5HX1ZPTFVNRTogLjUsXG5cbiAgICAvLyBQaHlzaWNzXG4gICAgTUFYX1NQRUVEOiA2MDAsXG4gICAgQUNDRUxFUkFUSU9OOiAxOTYwLFxuICAgIERSQUc6IDE1MDAsXG4gICAgR1JBVklUWTogMTkwMCxcbiAgICBKVU1QX1NQRUVEOiAtODUwLFxuICAgIEpVTVBfSkVUX1NQRUVEOiAtMjQwMCxcblxuICAgIC8vIFBsYXllciBNb2RlbFxuICAgIEFOSU1BVElPTl9MRUZUOiBbMCwgMSwgMiwgMywgNCwgNV0sXG4gICAgQU5JTUFUSU9OX1JJR0hUOiBbOCwgOSwgMTAsIDExLCAxMiwgMTNdLFxuICAgIEFOSU1BVElPTl9GUkFNRVJBVEU6IDEwLFxuICAgIFBMQVlFUl9TQ0FMRTogLjI3LFxuICAgIFBMQVlFUl9BTkNIT1I6IC41LFxuXG4gICAgLy8gV2VhcG9uc1xuICAgIFBSSU1BUllfV0VBUE9OUzogW1xuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ0FLNDcnLFxuICAgICAgICAgICAgbmFtZTogJ0FLLTQ3JyxcbiAgICAgICAgICAgIGltYWdlOiAnL2ltYWdlcy9ndW5zL1Nwcl9BSzQ3LnBuZycsXG4gICAgICAgICAgICBtaW5TY29yZTogMFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ001MDAnLFxuICAgICAgICAgICAgbmFtZTogJ001MDAnLFxuICAgICAgICAgICAgaW1hZ2U6ICcvaW1hZ2VzL2d1bnMvU3ByX001MDAucG5nJyxcbiAgICAgICAgICAgIG1pblNjb3JlOiAwXG4gICAgICAgICAgICAvLyBtaW5TY29yZTogMTBcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICdTa29ycGlvbicsXG4gICAgICAgICAgICBuYW1lOiAnU2tvcnBpb24nLFxuICAgICAgICAgICAgaW1hZ2U6ICcvaW1hZ2VzL2d1bnMvU3ByX1Nrb3JwaW9uLnBuZycsXG4gICAgICAgICAgICBtaW5TY29yZTogMFxuICAgICAgICAgICAgLy8gbWluU2NvcmU6IDIwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnQXVnJyxcbiAgICAgICAgICAgIG5hbWU6ICdBdWcnLFxuICAgICAgICAgICAgaW1hZ2U6ICcvaW1hZ2VzL2d1bnMvU3ByX0F1Zy5wbmcnLFxuICAgICAgICAgICAgbWluU2NvcmU6IDBcbiAgICAgICAgICAgIC8vIG1pblNjb3JlOiAzMFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ0c0MycsXG4gICAgICAgICAgICBuYW1lOiAnRzQzJyxcbiAgICAgICAgICAgIGltYWdlOiAnL2ltYWdlcy9ndW5zL1Nwcl9nNDMucG5nJyxcbiAgICAgICAgICAgIG1pblNjb3JlOiAwXG4gICAgICAgICAgICAvLyBtaW5TY29yZTogNDBcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICdQOTAnLFxuICAgICAgICAgICAgbmFtZTogJ1A5MCcsXG4gICAgICAgICAgICBpbWFnZTogJy9pbWFnZXMvZ3Vucy9TcHJfcDkwLnBuZycsXG4gICAgICAgICAgICBtaW5TY29yZTogMFxuICAgICAgICAgICAgLy8gbWluU2NvcmU6IDMwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnTTRBMScsXG4gICAgICAgICAgICBuYW1lOiAnTTRBMScsXG4gICAgICAgICAgICBpbWFnZTogJy9pbWFnZXMvZ3Vucy9TcHJfTTRBMS5wbmcnLFxuICAgICAgICAgICAgbWluU2NvcmU6IDBcbiAgICAgICAgICAgIC8vIG1pblNjb3JlOiAxMFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ0JhcnJldHQnLFxuICAgICAgICAgICAgbmFtZTogJ0JhcnJldHQnLFxuICAgICAgICAgICAgaW1hZ2U6ICcvaW1hZ2VzL2d1bnMvU3ByX0JhcnJldHQucG5nJyxcbiAgICAgICAgICAgIG1pblNjb3JlOiAwXG4gICAgICAgICAgICAvLyBtaW5TY29yZTogNzBcbiAgICAgICAgfVxuICAgIF0sXG5cbiAgICBTRUNPTkRBUllfV0VBUE9OUzogW1xuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ0Rlc2VydEVhZ2xlJyxcbiAgICAgICAgICAgIG5hbWU6ICdEZXNlcnQgRWFnbGUnLFxuICAgICAgICAgICAgaW1hZ2U6ICcvaW1hZ2VzL2d1bnMvU3ByX0Rlc2VydEVhZ2xlLnBuZycsXG4gICAgICAgICAgICBtaW5TY29yZTogMFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ1JQRycsXG4gICAgICAgICAgICBuYW1lOiAnUlBHJyxcbiAgICAgICAgICAgIGltYWdlOiAnL2ltYWdlcy9ndW5zL1Nwcl9SUEcucG5nJyxcbiAgICAgICAgICAgIG1pblNjb3JlOiAyMFxuICAgICAgICB9XG4gICAgXVxufVxuXG5leHBvcnQgZGVmYXVsdCBHYW1lQ29uc3RzXG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBHZXRRdWVyeVN0cmluZyhmaWVsZCwgdXJsKSB7XG4gICAgdmFyIGhyZWYgPSB1cmwgPyB1cmwgOiB3aW5kb3cubG9jYXRpb24uaHJlZjtcbiAgICB2YXIgcmVnID0gbmV3IFJlZ0V4cCggJ1s/Jl0nICsgZmllbGQgKyAnPShbXiYjXSopJywgJ2knICk7XG4gICAgdmFyIHN0cmluZyA9IHJlZy5leGVjKGhyZWYpO1xuICAgIHJldHVybiBzdHJpbmcgPyBzdHJpbmdbMV0gOiBudWxsO1xufVxuIiwiZnVuY3Rpb24gUzQoKSB7XG4gICAgcmV0dXJuICgoKDErTWF0aC5yYW5kb20oKSkqMHgxMDAwMCl8MCkudG9TdHJpbmcoMTYpLnN1YnN0cmluZygxKVxufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBHdWlkKCkge1xuICAgIHJldHVybiAoUzQoKStTNCgpK1wiLVwiK1M0KCkrXCItXCIrUzQoKStcIi1cIitTNCgpK1wiLVwiK1M0KCkrUzQoKStTNCgpKVxufVxuIiwiLy8gVGhpcyBmdW5jdGlvbiBzaG91bGQgcmV0dXJuIHRydWUgd2hlbiB0aGUgcGxheWVyIGFjdGl2YXRlcyB0aGUgXCJnbyBsZWZ0XCIgY29udHJvbFxuLy8gSW4gdGhpcyBjYXNlLCBlaXRoZXIgaG9sZGluZyB0aGUgcmlnaHQgYXJyb3cgb3IgdGFwcGluZyBvciBjbGlja2luZyBvbiB0aGUgbGVmdFxuLy8gc2lkZSBvZiB0aGUgc2NyZWVuLlxuZXhwb3J0IGZ1bmN0aW9uIGxlZnRJbnB1dElzQWN0aXZlKCkge1xuICAgIHJldHVybiB0aGlzLmlucHV0LmtleWJvYXJkLmlzRG93bihQaGFzZXIuS2V5Ym9hcmQuQSlcbn1cblxuLy8gVGhpcyBmdW5jdGlvbiBzaG91bGQgcmV0dXJuIHRydWUgd2hlbiB0aGUgcGxheWVyIGFjdGl2YXRlcyB0aGUgXCJnbyByaWdodFwiIGNvbnRyb2xcbi8vIEluIHRoaXMgY2FzZSwgZWl0aGVyIGhvbGRpbmcgdGhlIHJpZ2h0IGFycm93IG9yIHRhcHBpbmcgb3IgY2xpY2tpbmcgb24gdGhlIHJpZ2h0XG4vLyBzaWRlIG9mIHRoZSBzY3JlZW4uXG5leHBvcnQgZnVuY3Rpb24gcmlnaHRJbnB1dElzQWN0aXZlKCkge1xuICAgIHJldHVybiB0aGlzLmlucHV0LmtleWJvYXJkLmlzRG93bihQaGFzZXIuS2V5Ym9hcmQuRClcbn1cblxuLy8gVGhpcyBmdW5jdGlvbiBzaG91bGQgcmV0dXJuIHRydWUgd2hlbiB0aGUgcGxheWVyIGFjdGl2YXRlcyB0aGUgXCJqdW1wXCIgY29udHJvbFxuLy8gSW4gdGhpcyBjYXNlLCBlaXRoZXIgaG9sZGluZyB0aGUgdXAgYXJyb3cgb3IgdGFwcGluZyBvciBjbGlja2luZyBvbiB0aGUgY2VudGVyXG4vLyBwYXJ0IG9mIHRoZSBzY3JlZW4uXG5leHBvcnQgZnVuY3Rpb24gdXBJbnB1dElzQWN0aXZlKGR1cmF0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5wdXQua2V5Ym9hcmQuZG93bkR1cmF0aW9uKFBoYXNlci5LZXlib2FyZC5XLCBkdXJhdGlvbilcbn1cblxuLy8gVGhpcyBmdW5jdGlvbiByZXR1cm5zIHRydWUgd2hlbiB0aGUgcGxheWVyIHJlbGVhc2VzIHRoZSBcImp1bXBcIiBjb250cm9sXG5leHBvcnQgZnVuY3Rpb24gdXBJbnB1dFJlbGVhc2VkKCkge1xuICAgIHJldHVybiB0aGlzLmlucHV0LmtleWJvYXJkLnVwRHVyYXRpb24oUGhhc2VyLktleWJvYXJkLlcpXG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBQbGF5ZXJBbmdsZUhhbmRsZXIoKSB7XG4gICAgbGV0IGFuZ2xlSW5EZWdyZWVzID0gKHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5hbmdsZVRvUG9pbnRlcih0aGlzLnBsYXllcikgKiAxODAgLyBNYXRoLlBJKSArIDkwO1xuXG4gICAgaWYgKHRoaXMucGxheWVyLm1ldGEuZmFjaW5nID09PSAncmlnaHQnKSB7XG4gICAgICAgIHRoaXMucmlnaHRBcm1Hcm91cC5hbmdsZSA9IGFuZ2xlSW5EZWdyZWVzICsgNVxuXG4gICAgICAgIC8vIFVzZXIgaXMgYWltaW5nIHVwXG4gICAgICAgIGlmIChhbmdsZUluRGVncmVlcyA8PSA4MSAmJiBhbmdsZUluRGVncmVlcyA+PSA3MSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgLT0gMTBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA8IDcxICYmIGFuZ2xlSW5EZWdyZWVzID49IDYxKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyAtPSAyMFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzIDwgNjEgJiYgYW5nbGVJbkRlZ3JlZXMgPj0gNTEpIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzIC09IDMwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPCA1MSAmJiBhbmdsZUluRGVncmVlcyA+PSA0MSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgLT0gNDBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA8IDQxICYmIGFuZ2xlSW5EZWdyZWVzID49IDMxKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyAtPSA1MFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzIDwgMzEgJiYgYW5nbGVJbkRlZ3JlZXMgPj0gMjEpIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzIC09IDYwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPCAyMSAmJiBhbmdsZUluRGVncmVlcyA+PSAxMSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgLT0gNzBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA8IDExICYmIGFuZ2xlSW5EZWdyZWVzID49IDApIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzIC09IDgwXG4gICAgICAgIH1cblxuICAgICAgICAvLyBVc2VyIGlzIGFpbWluZyBkb3duXG4gICAgICAgIGlmIChhbmdsZUluRGVncmVlcyA+PSA5OSAmJiBhbmdsZUluRGVncmVlcyA8PSAxMDkpIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzICs9IDEwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPiAxMDkgJiYgYW5nbGVJbkRlZ3JlZXMgPD0gMTE5KSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyArPSAyMFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzID4gMTE5ICYmIGFuZ2xlSW5EZWdyZWVzIDw9IDEyOSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgKz0gMzBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA+IDEyOSAmJiBhbmdsZUluRGVncmVlcyA8PSAxMzkpIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzICs9IDQwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPiAxMzkgJiYgYW5nbGVJbkRlZ3JlZXMgPD0gMTQ5KSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyArPSA1MFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzID4gMTQ5ICYmIGFuZ2xlSW5EZWdyZWVzIDw9IDE1OSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgKz0gNjBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA+IDE1OSAmJiBhbmdsZUluRGVncmVlcyA8PSAxNjkpIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzICs9IDcwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPiAxNjkgJiYgYW5nbGVJbkRlZ3JlZXMgPD0gMTgwKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyArPSA4MFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucGxheWVyLm1ldGEuZmFjaW5nID09PSAnbGVmdCcpIHtcbiAgICAgICAgdGhpcy5yaWdodEFybUdyb3VwLmFuZ2xlID0gYW5nbGVJbkRlZ3JlZXMgLSA3XG5cbiAgICAgICAgLy8gVXNlciBpcyBhaW1pbmcgdXBcbiAgICAgICAgaWYgKGFuZ2xlSW5EZWdyZWVzID49IC04MSAmJiBhbmdsZUluRGVncmVlcyA8PSAtNzEpIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzICs9IDIwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPiAtNzEgJiYgYW5nbGVJbkRlZ3JlZXMgPD0gLTYxKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyArPSAzMFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzID4gLTYxICYmIGFuZ2xlSW5EZWdyZWVzIDw9IC01MSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgKz0gNDBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA+IC01MSAmJiBhbmdsZUluRGVncmVlcyA8PSAtNDEpIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzICs9IDUwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPiAtNDEgJiYgYW5nbGVJbkRlZ3JlZXMgPD0gLTMxKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyArPSA2MFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzID4gLTMxICYmIGFuZ2xlSW5EZWdyZWVzIDw9IC0yMSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgKz0gNzBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA+IC0yMSAmJiBhbmdsZUluRGVncmVlcyA8PSAtMTEpIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzICs9IDgwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPiAtMTEgJiYgYW5nbGVJbkRlZ3JlZXMgPD0gMCkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgKz0gOTBcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFVzZXIgaXMgYWltaW5nIGRvd25cbiAgICAgICAgaWYgKGFuZ2xlSW5EZWdyZWVzIDw9IDI3MCAmJiBhbmdsZUluRGVncmVlcyA+PSAyNjApIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzIC09IDEwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPCAyNjAgJiYgYW5nbGVJbkRlZ3JlZXMgPj0gMjUwKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyAtPSAyMFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzIDwgMjUwICYmIGFuZ2xlSW5EZWdyZWVzID49IDI0MCkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgLT0gMzBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA8IDI0MCAmJiBhbmdsZUluRGVncmVlcyA+PSAyMzApIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzIC09IDQwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPCAyMzAgJiYgYW5nbGVJbkRlZ3JlZXMgPj0gMjIwKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyAtPSA1MFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzIDwgMjIwICYmIGFuZ2xlSW5EZWdyZWVzID49IDIxMCkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgLT0gNjBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA8IDIxMCAmJiBhbmdsZUluRGVncmVlcyA+PSAyMDApIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzIC09IDcwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPCAyMDAgJiYgYW5nbGVJbkRlZ3JlZXMgPj0gMTkwKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyAtPSA4MFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5sZWZ0QXJtR3JvdXAuYW5nbGUgPSBhbmdsZUluRGVncmVlc1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gUGxheWVyQnlJZChpZCkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5lbmVtaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICh0aGlzLmVuZW1pZXNbaV0ucGxheWVyLmlkID09PSBpZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZW5lbWllc1tpXVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlXG59XG4iLCJleHBvcnQgZnVuY3Rpb24gcGxheWVyRmFjZUxlZnQoKSB7XG4gICAgaWYgKHRoaXMucGxheWVyLm1ldGEuZmFjaW5nICE9PSAnbGVmdCcpIHtcbiAgICAgICAgdGhpcy5wbGF5ZXIubWV0YS5mYWNpbmcgPSAnbGVmdCdcblxuICAgICAgICB0aGlzLnJpZ2h0QXJtR3JvdXAueCA9IDI1XG4gICAgICAgIHRoaXMucmlnaHRBcm1Hcm91cC55ID0gLTY1XG5cbiAgICAgICAgdGhpcy5sZWZ0QXJtR3JvdXAueCA9IC00MFxuICAgICAgICB0aGlzLmxlZnRBcm1Hcm91cC55ID0gLTcwXG5cbiAgICAgICAgdGhpcy5oZWFkU3ByaXRlLnNjYWxlLnggKj0gLTFcbiAgICAgICAgdGhpcy5oZWFkU3ByaXRlLnggPSAxMlxuXG4gICAgICAgIHRoaXMudG9yc29TcHJpdGUuc2NhbGUueCAqPSAtMVxuICAgICAgICB0aGlzLnRvcnNvU3ByaXRlLnggPSA0OVxuXG4gICAgICAgIHRoaXMubGVmdEFybVNwcml0ZS5zY2FsZS55ICo9IC0xXG4gICAgICAgIHRoaXMubGVmdEFybVNwcml0ZS55ID0gNVxuXG4gICAgICAgIHRoaXMucmlnaHRBcm1TcHJpdGUuc2NhbGUueSAqPSAtMVxuICAgICAgICB0aGlzLnJpZ2h0QXJtU3ByaXRlLnkgPSAxMFxuXG4gICAgICAgIHRoaXMuYWs0N1Nwcml0ZS5zY2FsZS55ICo9IC0xXG4gICAgICAgIHRoaXMuYWs0N1Nwcml0ZS55ID0gMzBcbiAgICAgICAgdGhpcy5hazQ3U3ByaXRlLnggPSAtN1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBsYXllckZhY2VSaWdodCgpIHtcbiAgICBpZiAodGhpcy5wbGF5ZXIubWV0YS5mYWNpbmcgIT09ICdyaWdodCcpIHtcbiAgICAgICAgdGhpcy5wbGF5ZXIubWV0YS5mYWNpbmcgPSAncmlnaHQnXG5cbiAgICAgICAgdGhpcy5yaWdodEFybUdyb3VwLnggPSAtMjVcbiAgICAgICAgdGhpcy5yaWdodEFybUdyb3VwLnkgPSAtNjVcblxuICAgICAgICB0aGlzLmxlZnRBcm1Hcm91cC54ID0gNDVcbiAgICAgICAgdGhpcy5sZWZ0QXJtR3JvdXAueSA9IC03MFxuXG4gICAgICAgIHRoaXMuaGVhZFNwcml0ZS5zY2FsZS54ICo9IC0xXG4gICAgICAgIHRoaXMuaGVhZFNwcml0ZS54ID0gMFxuXG4gICAgICAgIHRoaXMudG9yc29TcHJpdGUuc2NhbGUueCAqPSAtMVxuICAgICAgICB0aGlzLnRvcnNvU3ByaXRlLnggPSAtMzdcblxuICAgICAgICB0aGlzLmxlZnRBcm1TcHJpdGUuc2NhbGUueSAqPSAtMVxuICAgICAgICB0aGlzLmxlZnRBcm1TcHJpdGUueSA9IDBcblxuICAgICAgICB0aGlzLnJpZ2h0QXJtU3ByaXRlLnNjYWxlLnkgKj0gLTFcbiAgICAgICAgdGhpcy5yaWdodEFybVNwcml0ZS55ID0gMFxuXG4gICAgICAgIHRoaXMuYWs0N1Nwcml0ZS5zY2FsZS55ICo9IC0xXG4gICAgICAgIHRoaXMuYWs0N1Nwcml0ZS55ID0gMTlcbiAgICAgICAgdGhpcy5hazQ3U3ByaXRlLnggPSAzXG4gICAgfVxufVxuIiwiaW1wb3J0IEdhbWVDb25zdHMgZnJvbSAnLi9HYW1lQ29uc3RzJ1xuaW1wb3J0IEV2ZW50SGFuZGxlciBmcm9tICcuL0V2ZW50SGFuZGxlcidcbmltcG9ydCB7IHVwSW5wdXRJc0FjdGl2ZSwgdXBJbnB1dFJlbGVhc2VkIH0gZnJvbSAnLi9JbnB1dEhlbHBlcnMnXG5cbmxldCBqdW1wSmV0Q291bnRlciA9IDBcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gUGxheWVySnVtcEhhbmRsZXIoKSB7XG4gICAgLy8gU2V0IGEgdmFyaWFibGUgdGhhdCBpcyB0cnVlIHdoZW4gdGhlIHBsYXllciBpcyB0b3VjaGluZyB0aGUgZ3JvdW5kXG4gICAgbGV0IG9uVGhlR3JvdW5kID0gdGhpcy5wbGF5ZXIuYm9keS50b3VjaGluZy5kb3duXG5cbiAgICAvLyBJZiB0aGUgcGxheWVyIGlzIHRvdWNoaW5nIHRoZSBncm91bmQsIGxldCBoaW0gaGF2ZSAyIGp1bXBzXG4gICAgaWYgKG9uVGhlR3JvdW5kKSB7XG4gICAgICAgIHRoaXMuanVtcHMgPSAyXG4gICAgICAgIHRoaXMuanVtcGluZyA9IGZhbHNlXG4gICAgfVxuXG4gICAgLy8gSnVtcCFcbiAgICBpZiAodGhpcy5qdW1wcyA9PT0gMiAmJiB1cElucHV0SXNBY3RpdmUuY2FsbCh0aGlzLCA1KSAmJiBvblRoZUdyb3VuZCkge1xuICAgICAgICB0aGlzLnBsYXllci5ib2R5LnZlbG9jaXR5LnkgPSBHYW1lQ29uc3RzLkpVTVBfU1BFRURcbiAgICAgICAgdGhpcy5qdW1waW5nID0gdHJ1ZVxuICAgIH0gZWxzZSBpZiAodXBJbnB1dElzQWN0aXZlLmNhbGwodGhpcywgNSkpIHtcbiAgICAgICAgdGhpcy5qdW1wcyA9IDFcbiAgICB9XG5cbiAgICAvLyBKdW1wIEpldCFcbiAgICBpZiAodGhpcy5qdW1wcyA9PT0gMSAmJiB0aGlzLmlucHV0LmtleWJvYXJkLmlzRG93bihQaGFzZXIuS2V5Ym9hcmQuVykgJiYganVtcEpldENvdW50ZXIgPiAtMTMwMDAwKSB7XG4gICAgICAgIHRoaXMucGxheWVyLmJvZHkuYWNjZWxlcmF0aW9uLnkgPSBHYW1lQ29uc3RzLkpVTVBfSkVUX1NQRUVEXG4gICAgICAgIGp1bXBKZXRDb3VudGVyICs9IEdhbWVDb25zdHMuSlVNUF9KRVRfU1BFRURcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnBsYXllci5ib2R5LmFjY2VsZXJhdGlvbi55ID0gMFxuXG4gICAgICAgIGlmIChqdW1wSmV0Q291bnRlciA8IDApIHtcbiAgICAgICAgICAgIGp1bXBKZXRDb3VudGVyIC09IEdhbWVDb25zdHMuSlVNUF9KRVRfU1BFRURcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGp1bXBKZXRDb3VudGVyID0gMFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgRXZlbnRIYW5kbGVyLmVtaXQoJ3BsYXllciBqdW1wIGpldCB1cGRhdGUnLCB7IGp1bXBKZXRDb3VudGVyIH0pXG5cbiAgICAvLyBSZWR1Y2UgdGhlIG51bWJlciBvZiBhdmFpbGFibGUganVtcHMgaWYgdGhlIGp1bXAgaW5wdXQgaXMgcmVsZWFzZWRcbiAgICBpZiAodGhpcy5qdW1waW5nICYmIHVwSW5wdXRSZWxlYXNlZC5jYWxsKHRoaXMpKSB7XG4gICAgICAgIHRoaXMucGxheWVyLmJvZHkuYWNjZWxlcmF0aW9uLnggPSAwXG4gICAgICAgIHRoaXMucGxheWVyLmJvZHkuYWNjZWxlcmF0aW9uLnkgPSAwXG5cbiAgICAgICAgaWYgKHRoaXMuanVtcHMgIT09IDEpIHtcbiAgICAgICAgICAgIHRoaXMuanVtcHMtLVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5qdW1waW5nID0gZmFsc2VcbiAgICB9XG59XG4iLCJpbXBvcnQgR2FtZUNvbnN0cyBmcm9tICcuL0dhbWVDb25zdHMnXG5pbXBvcnQgeyBwbGF5ZXJGYWNlTGVmdCwgcGxheWVyRmFjZVJpZ2h0IH0gZnJvbSAnLi9QbGF5ZXJGYWNlSGFuZGxlcidcbmltcG9ydCB7IGxlZnRJbnB1dElzQWN0aXZlLCByaWdodElucHV0SXNBY3RpdmUgfSBmcm9tICcuL0lucHV0SGVscGVycydcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gUGxheWVyTW92ZW1lbnRIYW5kbGVyKCkge1xuICAgIGlmIChsZWZ0SW5wdXRJc0FjdGl2ZS5jYWxsKHRoaXMpKSB7XG4gICAgICAgIC8vIElmIHRoZSBMRUZUIGtleSBpcyBkb3duLCBzZXQgdGhlIHBsYXllciB2ZWxvY2l0eSB0byBtb3ZlIGxlZnRcbiAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5hY2NlbGVyYXRpb24ueCA9IC1HYW1lQ29uc3RzLkFDQ0VMRVJBVElPTlxuICAgICAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLnBsYXkoJ2xlZnQnKVxuXG4gICAgICAgIC8vIExlZnQgZmFjaW5nIGhlYWQgbmVlZHMgdG8gYmUgc2V0IG9ubHkgb25jZVxuICAgICAgICBwbGF5ZXJGYWNlTGVmdC5jYWxsKHRoaXMpXG4gICAgfSBlbHNlIGlmIChyaWdodElucHV0SXNBY3RpdmUuY2FsbCh0aGlzKSkge1xuICAgICAgICAvLyBJZiB0aGUgUklHSFQga2V5IGlzIGRvd24sIHNldCB0aGUgcGxheWVyIHZlbG9jaXR5IHRvIG1vdmUgcmlnaHRcbiAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5hY2NlbGVyYXRpb24ueCA9IEdhbWVDb25zdHMuQUNDRUxFUkFUSU9OXG4gICAgICAgIHRoaXMucGxheWVyLmFuaW1hdGlvbnMucGxheSgncmlnaHQnKVxuXG4gICAgICAgIHBsYXllckZhY2VSaWdodC5jYWxsKHRoaXMpXG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gU3RhbmQgc3RpbGxcbiAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5hY2NlbGVyYXRpb24ueCA9IDBcbiAgICAgICAgdGhpcy5wbGF5ZXIuYW5pbWF0aW9ucy5zdG9wKClcblxuICAgICAgICBpZiAodGhpcy5nYW1lLmlucHV0LndvcmxkWCA+IHRoaXMucGxheWVyLngpIHtcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmZyYW1lID0gN1xuICAgICAgICAgICAgcGxheWVyRmFjZVJpZ2h0LmNhbGwodGhpcylcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmdhbWUuaW5wdXQud29ybGRYIDwgdGhpcy5wbGF5ZXIueCkge1xuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuZnJhbWUgPSA2XG4gICAgICAgICAgICBwbGF5ZXJGYWNlTGVmdC5jYWxsKHRoaXMpXG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJpbXBvcnQgR2FtZUNvbnN0cyBmcm9tICcuL0dhbWVDb25zdHMnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFJlbW90ZVBsYXllcihpZCwgZ2FtZSwgcGxheWVyLCBzdGFydFgsIHN0YXJ0WSkge1xuICAgIGxldCBuZXdSZW1vdGVQbGF5ZXIgPSB7XG4gICAgICAgIHg6IHN0YXJ0WCxcbiAgICAgICAgeTogc3RhcnRZLFxuICAgICAgICBpZDogbnVsbCxcbiAgICAgICAgZ2FtZTogZ2FtZSxcbiAgICAgICAgaGVhbHRoOiAxMDAsXG4gICAgICAgIHBsYXllcjogcGxheWVyLFxuICAgICAgICBhbGl2ZTogdHJ1ZSxcbiAgICAgICAgbGFzdFBvc2l0aW9uOiB7XG4gICAgICAgICAgICB4OiBzdGFydFgsXG4gICAgICAgICAgICB5OiBzdGFydFlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIENyZWF0ZSB0aGUgcGxheWVyJ3MgZW5lbXkgc3ByaXRlXG4gICAgbmV3UmVtb3RlUGxheWVyLnBsYXllciA9IGdhbWUuYWRkLnNwcml0ZShzdGFydFgsIHN0YXJ0WSwgJ2NvbW1hbmRvJylcbiAgICBuZXdSZW1vdGVQbGF5ZXIucGxheWVyLnNjYWxlLnNldFRvKEdhbWVDb25zdHMuUExBWUVSX1NDQUxFKVxuICAgIG5ld1JlbW90ZVBsYXllci5wbGF5ZXIuYW5jaG9yLnNldFRvKEdhbWVDb25zdHMuUExBWUVSX0FOQ0hPUilcblxuICAgIC8vIE91ciB0d28gYW5pbWF0aW9ucywgd2Fsa2luZyBsZWZ0IGFuZCByaWdodC5cbiAgICBuZXdSZW1vdGVQbGF5ZXIucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdsZWZ0JywgR2FtZUNvbnN0cy5BTklNQVRJT05fTEVGVCwgR2FtZUNvbnN0cy5BTklNQVRJT05fRlJBTUVSQVRFLCB0cnVlKVxuICAgIG5ld1JlbW90ZVBsYXllci5wbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ3JpZ2h0JywgR2FtZUNvbnN0cy5BTklNQVRJT05fUklHSFQsIEdhbWVDb25zdHMuQU5JTUFUSU9OX0ZSQU1FUkFURSwgdHJ1ZSlcblxuICAgIG5ld1JlbW90ZVBsYXllci5wbGF5ZXIuaWQgPSBpZFxuXG4gICAgcmV0dXJuIG5ld1JlbW90ZVBsYXllclxufVxuIiwiaW1wb3J0IEV2ZW50SGFuZGxlciBmcm9tICcuLi9FdmVudEhhbmRsZXInXG5pbXBvcnQgb25VcGRhdGVQbGF5ZXJzIGZyb20gJy4vb25VcGRhdGVQbGF5ZXJzJ1xuaW1wb3J0IG9uU29ja2V0Q29ubmVjdGVkIGZyb20gJy4vb25Tb2NrZXRDb25uZWN0ZWQnXG5pbXBvcnQgb25Tb2NrZXREaXNjb25uZWN0IGZyb20gJy4vb25Tb2NrZXREaXNjb25uZWN0J1xuaW1wb3J0IG9uTW92ZVBsYXllciBmcm9tICcuL29uTW92ZVBsYXllcidcbmltcG9ydCBvblJlbW92ZVBsYXllciBmcm9tICcuL29uUmVtb3ZlUGxheWVyJ1xuaW1wb3J0IG9uQnVsbGV0RmlyZWQgZnJvbSAnLi9vbkJ1bGxldEZpcmVkJ1xuaW1wb3J0IG9uQnVsbGV0UmVtb3ZlZCBmcm9tICcuL29uQnVsbGV0UmVtb3ZlZCdcbmltcG9ydCBvblBsYXllckRhbWFnZWQgZnJvbSAnLi9vblBsYXllckRhbWFnZWQnXG5pbXBvcnQgb25QbGF5ZXJSZXNwYXduIGZyb20gJy4vb25QbGF5ZXJSZXNwYXduJ1xuaW1wb3J0IG9uUGxheWVySGVhbHRoVXBkYXRlIGZyb20gJy4vb25QbGF5ZXJIZWFsdGhVcGRhdGUnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc29ja2V0Lm9uKCdjb25uZWN0Jywgb25Tb2NrZXRDb25uZWN0ZWQuYmluZCh0aGlzKSlcbiAgICB0aGlzLnNvY2tldC5vbignZGlzY29ubmVjdCcsIG9uU29ja2V0RGlzY29ubmVjdC5iaW5kKHRoaXMpKVxuXG4gICAgdGhpcy5zb2NrZXQub24oJ3VwZGF0ZSBwbGF5ZXJzJywgb25VcGRhdGVQbGF5ZXJzLmJpbmQodGhpcykpXG4gICAgdGhpcy5zb2NrZXQub24oJ21vdmUgcGxheWVyJywgb25Nb3ZlUGxheWVyLmJpbmQodGhpcykpXG4gICAgdGhpcy5zb2NrZXQub24oJ3JlbW92ZSBwbGF5ZXInLCBvblJlbW92ZVBsYXllci5iaW5kKHRoaXMpKVxuXG4gICAgdGhpcy5zb2NrZXQub24oJ3BsYXllciByZXNwYXduJywgb25QbGF5ZXJSZXNwYXduLmJpbmQodGhpcykpXG4gICAgdGhpcy5zb2NrZXQub24oJ3BsYXllciBkYW1hZ2VkJywgb25QbGF5ZXJEYW1hZ2VkLmJpbmQodGhpcykpXG4gICAgdGhpcy5zb2NrZXQub24oJ3BsYXllciBoZWFsdGggdXBkYXRlJywgb25QbGF5ZXJIZWFsdGhVcGRhdGUuYmluZCh0aGlzKSlcblxuICAgIHRoaXMuc29ja2V0Lm9uKCdidWxsZXQgZmlyZWQnLCBvbkJ1bGxldEZpcmVkLmJpbmQodGhpcykpXG4gICAgdGhpcy5zb2NrZXQub24oJ2J1bGxldCByZW1vdmVkJywgb25CdWxsZXRSZW1vdmVkLmJpbmQodGhpcykpXG5cbiAgICBFdmVudEhhbmRsZXIub24oJ3BsYXllciB1cGRhdGUgbmlja25hbWUnLCAoZGF0YSkgPT4ge1xuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdwbGF5ZXIgdXBkYXRlIG5pY2tuYW1lJywge1xuICAgICAgICAgICAgcm9vbUlkOiB0aGlzLnJvb21JZCxcbiAgICAgICAgICAgIG5pY2tuYW1lOiBkYXRhLm5pY2tuYW1lXG4gICAgICAgIH0pXG4gICAgfSlcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG9uQnVsbGV0RmlyZWQoZGF0YSkge1xuICAgIGlmIChkYXRhLmlkID09PSAoJy8jJyArIHRoaXMuc29ja2V0LmlkKSlcbiAgICAgICAgcmV0dXJuXG5cbiAgICBsZXQgbmV3RW5lbXlCdWxsZXQgPSB0aGlzLmVuZW15QnVsbGV0cy5jcmVhdGUoZGF0YS54LCBkYXRhLnksICdidWxsZXQxMicpXG4gICAgbmV3RW5lbXlCdWxsZXQuYnVsbGV0SWQgPSBkYXRhLmJ1bGxldElkXG4gICAgbmV3RW5lbXlCdWxsZXQucGxheWVySWQgPSBkYXRhLnBsYXllcklkXG4gICAgbmV3RW5lbXlCdWxsZXQuZGFtYWdlID0gZGF0YS5kYW1hZ2VcbiAgICBuZXdFbmVteUJ1bGxldC5yb3RhdGlvbiA9IGRhdGEucG9pbnRlckFuZ2xlXG4gICAgbmV3RW5lbXlCdWxsZXQuaGVpZ2h0ID0gZGF0YS5oZWlnaHRcbiAgICBuZXdFbmVteUJ1bGxldC53aWR0aCA9IGRhdGEud2lkdGhcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5lbmFibGUobmV3RW5lbXlCdWxsZXQsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSlcbiAgICBuZXdFbmVteUJ1bGxldC5ib2R5LmdyYXZpdHkueSA9IC0xODAwXG5cbiAgICBsZXQgbmV3VmVsb2NpdHkgPSB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUudmVsb2NpdHlGcm9tUm90YXRpb24oZGF0YS5wb2ludGVyQW5nbGUsIGRhdGEuc3BlZWQpXG4gICAgbmV3RW5lbXlCdWxsZXQuYm9keS52ZWxvY2l0eS54ICs9IG5ld1ZlbG9jaXR5LnhcbiAgICBuZXdFbmVteUJ1bGxldC5ib2R5LnZlbG9jaXR5LnkgKz0gbmV3VmVsb2NpdHkueVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gb25CdWxsZXRSZW1vdmVkKGRhdGEpIHtcbiAgICBpZiAoZGF0YS5pZCA9PT0gKCcvIycgKyB0aGlzLnNvY2tldC5pZCkpXG4gICAgICAgIHJldHVyblxuXG4gICAgbGV0IHJlbW92ZUJ1bGxldCA9IF8uZmluZCh0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS5jaGlsZHJlbiwge1xuICAgICAgICBidWxsZXRJZDogZGF0YS5idWxsZXRJZFxuICAgIH0pXG5cbiAgICBpZiAoIXJlbW92ZUJ1bGxldCkge1xuICAgICAgICBjb25zb2xlLmxvZygnQnVsbGV0IG5vdCBmb3VuZDogJywgZGF0YS5idWxsZXRJZClcbiAgICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgcmVtb3ZlQnVsbGV0LmtpbGwoKVxufVxuIiwiaW1wb3J0IFBsYXllckJ5SWQgZnJvbScuLi9QbGF5ZXJCeUlkJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBvbk1vdmVQbGF5ZXIoZGF0YSkge1xuICAgIGxldCBtb3ZlUGxheWVyID0gUGxheWVyQnlJZC5jYWxsKHRoaXMsIGRhdGEuaWQpXG5cbiAgICAvLyBQbGF5ZXIgbm90IGZvdW5kXG4gICAgaWYgKCEgbW92ZVBsYXllcikge1xuICAgICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgcGxheWVyIHBvc2l0aW9uXG4gICAgbW92ZVBsYXllci5wbGF5ZXIueCA9IGRhdGEueFxuICAgIG1vdmVQbGF5ZXIucGxheWVyLnkgPSBkYXRhLnlcblxuICAgIGlmIChtb3ZlUGxheWVyLnBsYXllci54ID4gbW92ZVBsYXllci5sYXN0UG9zaXRpb24ueCkge1xuICAgICAgICBtb3ZlUGxheWVyLnBsYXllci5hbmltYXRpb25zLnBsYXkoJ3JpZ2h0JylcbiAgICB9XG4gICAgZWxzZSBpZiAobW92ZVBsYXllci5wbGF5ZXIueCA8IG1vdmVQbGF5ZXIubGFzdFBvc2l0aW9uLngpXG4gICAge1xuICAgICAgICBtb3ZlUGxheWVyLnBsYXllci5hbmltYXRpb25zLnBsYXkoJ2xlZnQnKVxuICAgIH1cbiAgICBlbHNlXG4gICAge1xuICAgICAgICBtb3ZlUGxheWVyLnBsYXllci5hbmltYXRpb25zLnN0b3AoKVxuICAgICAgICBtb3ZlUGxheWVyLnBsYXllci5mcmFtZSA9IDZcbiAgICB9XG5cbiAgICBtb3ZlUGxheWVyLmxhc3RQb3NpdGlvbi54ID0gbW92ZVBsYXllci5wbGF5ZXIueFxuICAgIG1vdmVQbGF5ZXIubGFzdFBvc2l0aW9uLnkgPSBtb3ZlUGxheWVyLnBsYXllci55XG59XG4iLCJpbXBvcnQgRXZlbnRIYW5kbGVyIGZyb20gJy4uL0V2ZW50SGFuZGxlcidcblxubGV0IGRhbWFnZVRpbWVvdXQgPSBudWxsXG5sZXQgaGVhbGluZ0ludGVydmFsID0gbnVsbFxubGV0IGxhc3RLbm93bkhlYWx0aCA9IG51bGxcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gb25QbGF5ZXJEYW1hZ2VkKGRhdGEpIHtcbiAgICBpZiAoZGF0YS5kYW1hZ2VkUGxheWVySWQgIT09ICgnLyMnICsgdGhpcy5zb2NrZXQuaWQpKVxuICAgICAgICByZXR1cm5cblxuICAgIHRoaXMucGxheWVyLm1ldGEuaGVhbHRoID0gZGF0YS5oZWFsdGhcbiAgICBFdmVudEhhbmRsZXIuZW1pdCgnaGVhbHRoIHVwZGF0ZScsIFN0cmluZyh0aGlzLnBsYXllci5tZXRhLmhlYWx0aCkpXG5cbiAgICBpZiAodGhpcy5wbGF5ZXIubWV0YS5oZWFsdGggPiA1NSAmJiB0aGlzLnBsYXllci5tZXRhLmhlYWx0aCA8IDEwMCkge1xuICAgICAgICBjbGVhclRpbWVvdXQoZGFtYWdlVGltZW91dClcbiAgICAgICAgZGFtYWdlVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgLy8gUGxheWVyJ3MgaGVhbHRoIHdpbGwgZnVsbHkgcmVnZW5lcmF0ZVxuICAgICAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgncGxheWVyIGZ1bGwgaGVhbHRoJywge1xuICAgICAgICAgICAgICAgIHJvb21JZDogdGhpcy5yb29tSWRcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0sIDUwMDApXG4gICAgfVxuXG4gICAgaWYgKHRoaXMucGxheWVyLm1ldGEuaGVhbHRoID4gMCAmJiB0aGlzLnBsYXllci5tZXRhLmhlYWx0aCA8PSA1NSkge1xuICAgICAgICAvLyBXYWl0IDUgc2Vjb25kcyB0byBiZWdpbiBoZWFsaW5nIHByb2Nlc3NcbiAgICAgICAgY2xlYXJUaW1lb3V0KGRhbWFnZVRpbWVvdXQpXG4gICAgICAgIGNsZWFySW50ZXJ2YWwoaGVhbGluZ0ludGVydmFsKVxuICAgICAgICBkYW1hZ2VUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBsYXN0S25vd25IZWFsdGggPSB0aGlzLnBsYXllci5tZXRhLmhlYWx0aFxuICAgICAgICAgICAgaGVhbGluZ0ludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChsYXN0S25vd25IZWFsdGggPj0gMTAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaGVhbGluZ0ludGVydmFsKVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxhc3RLbm93bkhlYWx0aCArPSAxMFxuXG4gICAgICAgICAgICAgICAgLy8gSW5jcmVhc2UgcGxheWVyIGhlYWx0aCBieSAxMCBldmVyeSAxLzIgYSBzZWNvbmRcbiAgICAgICAgICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdwbGF5ZXIgaGVhbGluZycsIHtcbiAgICAgICAgICAgICAgICAgICAgcm9vbUlkOiB0aGlzLnJvb21JZFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9LCA1MDApXG4gICAgICAgIH0sIDUwMDApXG4gICAgfVxufVxuIiwiaW1wb3J0IEV2ZW50SGFuZGxlciBmcm9tICcuLi9FdmVudEhhbmRsZXInXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG9uUGxheWVySGVhbHRoVXBkYXRlKGRhdGEpIHtcbiAgICBpZiAoZGF0YS5pZCAhPT0gKCcvIycgKyB0aGlzLnNvY2tldC5pZCkpXG4gICAgICAgIHJldHVyblxuXG4gICAgdGhpcy5wbGF5ZXIubWV0YS5oZWFsdGggPSBkYXRhLmhlYWx0aFxuICAgIEV2ZW50SGFuZGxlci5lbWl0KCdoZWFsdGggdXBkYXRlJywgU3RyaW5nKHRoaXMucGxheWVyLm1ldGEuaGVhbHRoKSlcbn1cbiIsImltcG9ydCBFdmVudEhhbmRsZXIgZnJvbSAnLi4vRXZlbnRIYW5kbGVyJ1xuaW1wb3J0IFdlYXBvbnMgZnJvbSAnLi4vV2VhcG9ucydcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgaWYgKGRhdGEuZGFtYWdlZFBsYXllcklkICE9PSAoJy8jJyArIHRoaXMuc29ja2V0LmlkKSlcbiAgICAgICAgcmV0dXJuXG5cbiAgICAvLyBTZXQgcHJpbWFyeSB3ZWFwb25cbiAgICB0aGlzLnBsYXllci5tZXRhLnByaW1hcnlXZWFwb24gPSBuZXcgV2VhcG9uc1t0aGlzLnBsYXllci5tZXRhLnNlbGVjdGVkUHJpbWFyeVdlYXBvbklkXSh7XG4gICAgICAgIGdhbWU6IHRoaXMuZ2FtZVxuICAgIH0pXG4gICAgdGhpcy5wbGF5ZXIubWV0YS5wcmltYXJ5V2VhcG9uLmlkID0gdGhpcy5wbGF5ZXIubWV0YS5zZWxlY3RlZFByaW1hcnlXZWFwb25JZFxuXG4gICAgaWYgKHRoaXMuY3VycmVudFdlYXBvbiA9PT0gJ3ByaW1hcnlXZWFwb24nKVxuICAgICAgICB0aGlzLmFrNDdTcHJpdGUubG9hZFRleHR1cmUodGhpcy5wbGF5ZXIubWV0YS5zZWxlY3RlZFByaW1hcnlXZWFwb25JZClcblxuICAgIC8vIFNldCBzZWNvbmRhcnkgd2VhcG9uXG4gICAgdGhpcy5wbGF5ZXIubWV0YS5zZWNvbmRhcnlXZWFwb24gPSBuZXcgV2VhcG9uc1t0aGlzLnBsYXllci5tZXRhLnNlbGVjdGVkU2Vjb25kYXJ5V2VhcG9uSWRdKHtcbiAgICAgICAgZ2FtZTogdGhpcy5nYW1lXG4gICAgfSlcbiAgICB0aGlzLnBsYXllci5tZXRhLnNlY29uZGFyeVdlYXBvbi5pZCA9IHRoaXMucGxheWVyLm1ldGEuc2VsZWN0ZWRTZWNvbmRhcnlXZWFwb25JZFxuXG4gICAgaWYgKHRoaXMuY3VycmVudFdlYXBvbiA9PT0gJ3NlY29uZGFyeVdlYXBvbicpXG4gICAgICAgIHRoaXMuYWs0N1Nwcml0ZS5sb2FkVGV4dHVyZSh0aGlzLnBsYXllci5tZXRhLnNlbGVjdGVkU2Vjb25kYXJ5V2VhcG9uSWQpXG5cbiAgICAvLyBSZXNldCBoZWFsdGhcbiAgICB0aGlzLnBsYXllci5tZXRhLmhlYWx0aCA9IGRhdGEuaGVhbHRoXG4gICAgRXZlbnRIYW5kbGVyLmVtaXQoJ2hlYWx0aCB1cGRhdGUnLCBTdHJpbmcodGhpcy5wbGF5ZXIubWV0YS5oZWFsdGgpKVxuXG4gICAgLy8gU3Bhd24gcGxheWVyXG4gICAgbGV0IHNwYXduUG9pbnQgPSB0aGlzLm1hcEluc3RhbmNlLmdldFJhbmRvbVNwYXduUG9pbnQoKVxuICAgIHRoaXMucGxheWVyLnggPSBzcGF3blBvaW50LnhcbiAgICB0aGlzLnBsYXllci55ID0gc3Bhd25Qb2ludC55XG59XG4iLCJpbXBvcnQgUGxheWVyQnlJZCBmcm9tICcuLi9QbGF5ZXJCeUlkJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBvblJlbW92ZVBsYXllcihkYXRhKSB7XG4gICAgbGV0IHJlbW92ZVBsYXllciA9IFBsYXllckJ5SWQuY2FsbCh0aGlzLCBkYXRhLmlkKVxuXG4gICAgLy8gUGxheWVyIG5vdCBmb3VuZFxuICAgIGlmICghcmVtb3ZlUGxheWVyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdQbGF5ZXIgbm90IGZvdW5kOiAnLCBkYXRhLmlkKVxuICAgICAgICByZXR1cm5cbiAgICB9XG5cbiAgICByZW1vdmVQbGF5ZXIucGxheWVyLmtpbGwoKVxuXG4gICAgLy8gUmVtb3ZlIHBsYXllciBmcm9tIGFycmF5XG4gICAgdGhpcy5lbmVtaWVzLnNwbGljZSh0aGlzLmVuZW1pZXMuaW5kZXhPZihyZW1vdmVQbGF5ZXIpLCAxKVxufVxuIiwiaW1wb3J0IEdldFF1ZXJ5U3RyaW5nIGZyb20gJy4uL0dldFF1ZXJ5U3RyaW5nJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBvblNvY2tldENvbm5lY3RlZCgpIHtcbiAgICBjb25zb2xlLmxvZygnQ29ubmVjdGVkIHRvIHNvY2tldCBzZXJ2ZXInKVxuXG4gICAgIC8vIFJlc2V0IGVuZW1pZXMgb24gcmVjb25uZWN0XG4gICAgdGhpcy5lbmVtaWVzLmZvckVhY2goZnVuY3Rpb24gKGVuZW15KSB7XG4gICAgICAgIGlmIChlbmVteSkgZW5lbXkua2lsbCgpXG4gICAgfSlcblxuICAgIHRoaXMuZW5lbWllcyA9IFtdXG5cbiAgICAvLyBTZW5kIGxvY2FsIHBsYXllciBkYXRhIHRvIHRoZSBnYW1lIHNlcnZlclxuICAgIHRoaXMuc29ja2V0LmVtaXQoJ25ldyBwbGF5ZXInLCB7XG4gICAgICAgIHJvb21JZDogR2V0UXVlcnlTdHJpbmcoJ3Jvb21JZCcpLFxuICAgICAgICB4OiB0aGlzLnBsYXllci54LFxuICAgICAgICB5OiB0aGlzLnBsYXllci55XG4gICAgfSlcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG9uU29ja2V0RGlzY29ubmVjdCgpIHtcbiAgICBjb25zb2xlLmxvZygnRGlzY29ubmVjdGVkIGZyb20gc29ja2V0IHNlcnZlcicpXG59XG4iLCJpbXBvcnQgUmVtb3RlUGxheWVyIGZyb20gJy4uL1JlbW90ZVBsYXllcidcbmltcG9ydCBFdmVudEhhbmRsZXIgZnJvbSAnLi4vRXZlbnRIYW5kbGVyJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBvblVwZGF0ZVBsYXllcnMoZGF0YSkge1xuICAgIHRoaXMucm9vbUlkID0gZGF0YS5yb29tLmlkXG5cbiAgICBsZXQgbmV3dXJsID0gd2luZG93LmxvY2F0aW9uLnByb3RvY29sICsgXCIvL1wiICsgd2luZG93LmxvY2F0aW9uLmhvc3QgKyB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgKyAnP3Jvb21JZD0nICsgZGF0YS5yb29tLmlkO1xuICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSh7IHBhdGg6IG5ld3VybCB9LCAnJywgbmV3dXJsKTtcblxuICAgIHRoaXMuZW5lbWllcy5mb3JFYWNoKGZ1bmN0aW9uIChlbmVteSkge1xuICAgICAgICBlbmVteS5wbGF5ZXIua2lsbCgpXG4gICAgfSlcblxuICAgIHRoaXMuZW5lbWllcyA9IFtdXG5cbiAgICBFdmVudEhhbmRsZXIuZW1pdCgncGxheWVycyB1cGRhdGUnLCBkYXRhLnJvb20ucGxheWVycylcblxuICAgIGRhdGEucm9vbS5wbGF5ZXJzLmZvckVhY2goKHBsYXllcikgPT4ge1xuICAgICAgICBpZiAocGxheWVyLmlkID09PSAoJy8jJyArIHRoaXMuc29ja2V0LmlkKSkge1xuICAgICAgICAgICAgRXZlbnRIYW5kbGVyLmVtaXQoJ3Njb3JlIHVwZGF0ZScsIFN0cmluZyhwbGF5ZXIubWV0YS5zY29yZSkpXG4gICAgICAgICAgICBFdmVudEhhbmRsZXIuZW1pdCgnaGVhbHRoIHVwZGF0ZScsIFN0cmluZyhwbGF5ZXIubWV0YS5oZWFsdGgpKVxuICAgICAgICAgICAgRXZlbnRIYW5kbGVyLmVtaXQoJ3BsYXllciB1cGRhdGUnLCB7IHBsYXllciB9KVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICBsZXQgbmV3UmVtb3RlUGxheWVyID0gUmVtb3RlUGxheWVyLmNhbGwodGhpcywgcGxheWVyLmlkLCB0aGlzLmdhbWUsIHRoaXMucGxheWVyLCBwbGF5ZXIueCwgcGxheWVyLnkpXG4gICAgICAgIHRoaXMuZW5lbWllcy5wdXNoKG5ld1JlbW90ZVBsYXllcilcbiAgICB9KVxufVxuIiwiaW1wb3J0IEd1aWQgZnJvbSAnLi4vR3VpZCdcbmltcG9ydCBCdWxsZXQgZnJvbSAnLi4vQnVsbGV0J1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBSzQ3IGV4dGVuZHMgUGhhc2VyLkdyb3VwIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcpIHtcbiAgICAgICAgc3VwZXIoKVxuICAgICAgICAvLyBPYmplY3Qua2V5cyhQaGFzZXIuR3JvdXAucHJvdG90eXBlKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgLy8gICAgIHRoaXNba2V5XSA9IFBoYXNlci5Hcm91cC5wcm90b3R5cGVba2V5XVxuICAgICAgICAvLyB9KVxuXG4gICAgICAgIFBoYXNlci5Hcm91cC5jYWxsKGNvbmZpZy5yb290U2NvcGUsIGNvbmZpZy5nYW1lLCBjb25maWcuZ2FtZS53b3JsZCwgJ0FLLTQ3JywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG5cbiAgICAgICAgLy9cdEhlcmUgd2Ugc2V0LXVwIG91ciBhdWRpbyBzcHJpdGVcbiAgICAgICAgdGhpcy5meCA9IGNvbmZpZy5nYW1lLmFkZC5hdWRpbygnQUs0Ny1zb3VuZCcpXG4gICAgICAgIHRoaXMuYWxsb3dNdWx0aXBsZSA9IHRydWVcblxuICAgICAgICB0aGlzLmRhbWFnZSA9IDIyXG4gICAgICAgIHRoaXMubmV4dEZpcmUgPSAwXG4gICAgICAgIHRoaXMuYnVsbGV0U3BlZWQgPSAyMzAwXG4gICAgICAgIHRoaXMuZmlyZVJhdGUgPSAxNjBcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDY0OyBpKyspXG4gICAgICAgIHtcbiAgICAgICAgICAgIGxldCBidWxsZXQgPSBuZXcgQnVsbGV0KGNvbmZpZy5nYW1lLCAnYnVsbGV0MTInLCBjb25maWcuc29ja2V0KVxuICAgICAgICAgICAgYnVsbGV0LmJ1bGxldElkID0gR3VpZCgpXG4gICAgICAgICAgICBidWxsZXQuaGVpZ2h0ID0gM1xuICAgICAgICAgICAgYnVsbGV0LndpZHRoID0gNjBcbiAgICAgICAgICAgIGJ1bGxldC5kYW1hZ2UgPSAyMlxuICAgICAgICAgICAgdGhpcy5hZGQoYnVsbGV0LCB0cnVlKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZmlyZShwbGF5ZXIsIHNvY2tldCwgcm9vbUlkLCB2b2x1bWUpIHtcbiAgICAgICAgaWYgKHRoaXMuZ2FtZS50aW1lLnRpbWUgPCB0aGlzLm5leHRGaXJlKVxuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgdmFyIHggPSBwbGF5ZXIueCArIDEwXG4gICAgICAgIHZhciB5ID0gcGxheWVyLnkgKyAtMTBcblxuICAgICAgICB0aGlzLmdldEZpcnN0RXhpc3RzKGZhbHNlKS5maXJlKHgsIHksIDAsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDAsIHNvY2tldCwgcm9vbUlkKVxuICAgICAgICB0aGlzLnNldEFsbCgndHJhY2tpbmcnLCB0cnVlKVxuXG4gICAgICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLmdhbWUudGltZS50aW1lICsgdGhpcy5maXJlUmF0ZVxuICAgICAgICB0aGlzLmZ4LnZvbHVtZSA9IC4zICogdm9sdW1lXG4gICAgICAgIHRoaXMuZngucGxheSgpXG4gICAgfVxufVxuIiwiaW1wb3J0IEd1aWQgZnJvbSAnLi4vR3VpZCdcbmltcG9ydCBCdWxsZXQgZnJvbSAnLi4vQnVsbGV0J1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBVUcgZXh0ZW5kcyBQaGFzZXIuZ3JvdXAge1xuICAgIGNvbnN0cnVjdG9yIChjb25maWcpIHtcbiAgICAgICAgc3VwZXIoKVxuXG4gICAgICAgIFBoYXNlci5Hcm91cC5jYWxsKGNvbmZpZy5yb290U2NvcGUsIGNvbmZpZy5nYW1lLCBjb25maWcuZ2FtZS53b3JsZCwgJ0FLLTQ3JywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG5cbiAgICAgICAgLy9cdEhlcmUgd2Ugc2V0LXVwIG91ciBhdWRpbyBzcHJpdGVcbiAgICAgICAgdGhpcy5meCA9IGNvbmZpZy5nYW1lLmFkZC5hdWRpbygnQVVHLXNvdW5kJylcbiAgICAgICAgdGhpcy5hbGxvd011bHRpcGxlID0gdHJ1ZVxuXG4gICAgICAgIHRoaXMuZGFtYWdlID0gMjJcbiAgICAgICAgdGhpcy5uZXh0RmlyZSA9IDBcbiAgICAgICAgdGhpcy5idWxsZXRTcGVlZCA9IDIzMDBcbiAgICAgICAgdGhpcy5maXJlUmF0ZSA9IDE2MDtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDY0OyBpKyspXG4gICAgICAgIHtcbiAgICAgICAgICAgIGxldCBidWxsZXQgPSBuZXcgQnVsbGV0KGNvbmZpZy5nYW1lLCAnYnVsbGV0MTInLCBjb25maWcuc29ja2V0KVxuICAgICAgICAgICAgYnVsbGV0LmJ1bGxldElkID0gR3VpZCgpXG4gICAgICAgICAgICBidWxsZXQuaGVpZ2h0ID0gMlxuICAgICAgICAgICAgYnVsbGV0LndpZHRoID0gNDBcbiAgICAgICAgICAgIGJ1bGxldC5kYW1hZ2UgPSAyMlxuICAgICAgICAgICAgdGhpcy5hZGQoYnVsbGV0LCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZpcmUocGxheWVyLCBzb2NrZXQsIHJvb21JZCwgdm9sdW1lKSB7XG4gICAgICAgIGlmICh0aGlzLmdhbWUudGltZS50aW1lIDwgdGhpcy5uZXh0RmlyZSlcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIHZhciB4ID0gcGxheWVyLnggKyAxNTtcbiAgICAgICAgdmFyIHkgPSBwbGF5ZXIueSArIDMwO1xuXG4gICAgICAgIHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgMCwgc29ja2V0LCByb29tSWQpXG4gICAgICAgIHRoaXMuc2V0QWxsKCd0cmFja2luZycsIHRydWUpXG5cbiAgICAgICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMuZ2FtZS50aW1lLnRpbWUgKyB0aGlzLmZpcmVSYXRlXG4gICAgICAgIHRoaXMuZngudm9sdW1lID0gLjcgKiB2b2x1bWVcbiAgICAgICAgdGhpcy5meC5wbGF5KClcbiAgICB9XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IEJ1bGxldCA9IHJlcXVpcmUoJy4uL0J1bGxldCcpXG5sZXQgR3VpZCA9IHJlcXVpcmUoJy4uL0d1aWQnKVxuXG5sZXQgQmFycmV0TTkwID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGNvbmZpZy5nYW1lLCBjb25maWcuZ2FtZS53b3JsZCwgJ0JhcnJldCBNOTAnLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcblxuICAgIC8vXHRIZXJlIHdlIHNldC11cCBvdXIgYXVkaW8gc3ByaXRlXG4gICAgdGhpcy5meCA9IGNvbmZpZy5nYW1lLmFkZC5hdWRpbygnQmFycmV0TTkwLXNvdW5kJylcbiAgICB0aGlzLmFsbG93TXVsdGlwbGUgPSB0cnVlXG5cbiAgICB0aGlzLm5hbWUgPSAnQmFycmV0IE05MCdcbiAgICB0aGlzLmRhbWFnZSA9IDg4XG4gICAgdGhpcy5uZXh0RmlyZSA9IDBcbiAgICB0aGlzLmJ1bGxldFNwZWVkID0gMzQzNVxuXG4gICAgLy8gQmFycmV0TTkwIGZpcmVzIGFib3V0IDYwMCBidWxsZXRzIHBlciBzZWNvbmRcbiAgICB0aGlzLmZpcmVSYXRlID0gMzAwMFxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA2NDsgaSsrKVxuICAgIHtcbiAgICAgICAgbGV0IGJ1bGxldCA9IG5ldyBCdWxsZXQoY29uZmlnLmdhbWUsICdidWxsZXQxMicsIGNvbmZpZy5zb2NrZXQpXG4gICAgICAgIGJ1bGxldC5idWxsZXRJZCA9IEd1aWQoKVxuICAgICAgICBidWxsZXQuaGVpZ2h0ID0gMlxuICAgICAgICBidWxsZXQud2lkdGggPSA0MFxuICAgICAgICBidWxsZXQuZGFtYWdlID0gODhcblxuICAgICAgICB0aGlzLmFkZChidWxsZXQsIHRydWUpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbn1cblxuQmFycmV0TTkwLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLkdyb3VwLnByb3RvdHlwZSk7XG5CYXJyZXRNOTAucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQmFycmV0TTkwO1xuXG5CYXJyZXRNOTAucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbiAocGxheWVyLCBzb2NrZXQsIHJvb21JZCkge1xuICAgIGlmICh0aGlzLmdhbWUudGltZS50aW1lIDwgdGhpcy5uZXh0RmlyZSlcbiAgICAgICAgcmV0dXJuXG5cbiAgICB2YXIgeCA9IHBsYXllci54ICsgMTU7XG4gICAgdmFyIHkgPSBwbGF5ZXIueSArIDMwO1xuXG4gICAgdGhpcy5nZXRGaXJzdEV4aXN0cyhmYWxzZSkuZmlyZSh4LCB5LCAwLCB0aGlzLmJ1bGxldFNwZWVkLCAwLCAwLCBzb2NrZXQsIHJvb21JZClcbiAgICB0aGlzLnNldEFsbCgndHJhY2tpbmcnLCB0cnVlKVxuXG4gICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMuZ2FtZS50aW1lLnRpbWUgKyB0aGlzLmZpcmVSYXRlXG4gICAgdGhpcy5meC52b2x1bWUgPSAuNlxuICAgIHRoaXMuZngucGxheSgpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQmFycmV0TTkwXG4iLCIndXNlIHN0cmljdCdcblxubGV0IEJ1bGxldCA9IHJlcXVpcmUoJy4uL0J1bGxldCcpXG5sZXQgR3VpZCA9IHJlcXVpcmUoJy4uL0d1aWQnKVxuXG5sZXQgQUs0NyA9IGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCBjb25maWcuZ2FtZSwgY29uZmlnLmdhbWUud29ybGQsICdEZXNlcnQgRWFnbGUnLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcblxuICAgIC8vXHRIZXJlIHdlIHNldC11cCBvdXIgYXVkaW8gc3ByaXRlXG4gICAgdGhpcy5meCA9IGNvbmZpZy5nYW1lLmFkZC5hdWRpbygnRGVzZXJ0RWFnbGUtc291bmQnKVxuICAgIHRoaXMuYWxsb3dNdWx0aXBsZSA9IHRydWVcblxuICAgIHRoaXMuZGFtYWdlID0gMzNcbiAgICB0aGlzLm5leHRGaXJlID0gMFxuICAgIHRoaXMuYnVsbGV0U3BlZWQgPSAyMzAwXG4gICAgdGhpcy5maXJlUmF0ZSA9IDI2NztcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNjQ7IGkrKylcbiAgICB7XG4gICAgICAgIGxldCBidWxsZXQgPSBuZXcgQnVsbGV0KGNvbmZpZy5nYW1lLCAnYnVsbGV0MTInLCBjb25maWcuc29ja2V0KVxuICAgICAgICBidWxsZXQuYnVsbGV0SWQgPSBHdWlkKClcbiAgICAgICAgYnVsbGV0LmhlaWdodCA9IDJcbiAgICAgICAgYnVsbGV0LndpZHRoID0gNDBcbiAgICAgICAgYnVsbGV0LmRhbWFnZSA9IDIyXG4gICAgICAgIHRoaXMuYWRkKGJ1bGxldCwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbn1cblxuQUs0Ny5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuQUs0Ny5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBBSzQ3O1xuXG5BSzQ3LnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24ocGxheWVyLCBzb2NrZXQsIHJvb21JZCkge1xuICAgIGlmICh0aGlzLmdhbWUudGltZS50aW1lIDwgdGhpcy5uZXh0RmlyZSlcbiAgICAgICAgcmV0dXJuXG5cbiAgICB2YXIgeCA9IHBsYXllci54ICsgMTU7XG4gICAgdmFyIHkgPSBwbGF5ZXIueSArIDMwO1xuXG4gICAgdGhpcy5nZXRGaXJzdEV4aXN0cyhmYWxzZSkuZmlyZSh4LCB5LCAwLCB0aGlzLmJ1bGxldFNwZWVkLCAwLCAwLCBzb2NrZXQsIHJvb21JZClcbiAgICB0aGlzLnNldEFsbCgndHJhY2tpbmcnLCB0cnVlKVxuXG4gICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMuZ2FtZS50aW1lLnRpbWUgKyB0aGlzLmZpcmVSYXRlXG4gICAgdGhpcy5meC52b2x1bWUgPSAuM1xuICAgIHRoaXMuZngucGxheSgpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQUs0N1xuIiwiaW1wb3J0IEd1aWQgZnJvbSAnLi4vR3VpZCdcbmltcG9ydCBCdWxsZXQgZnJvbSAnLi4vQnVsbGV0J1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBSzQ3IGV4dGVuZHMgUGhhc2VyLkdyb3VwIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcpIHtcbiAgICAgICAgc3VwZXIoKVxuXG4gICAgICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGNvbmZpZy5nYW1lLCBjb25maWcuZ2FtZS53b3JsZCwgJ0FLLTQ3JywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG5cbiAgICAgICAgLy9cdEhlcmUgd2Ugc2V0LXVwIG91ciBhdWRpbyBzcHJpdGVcbiAgICAgICAgdGhpcy5meCA9IGNvbmZpZy5nYW1lLmFkZC5hdWRpbygnRzQzLXNvdW5kJylcbiAgICAgICAgdGhpcy5hbGxvd011bHRpcGxlID0gdHJ1ZVxuXG4gICAgICAgIHRoaXMuZGFtYWdlID0gNDRcbiAgICAgICAgdGhpcy5uZXh0RmlyZSA9IDBcbiAgICAgICAgdGhpcy5idWxsZXRTcGVlZCA9IDIzMDBcbiAgICAgICAgdGhpcy5maXJlUmF0ZSA9IDEzMDA7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA2NDsgaSsrKVxuICAgICAgICB7XG4gICAgICAgICAgICBsZXQgYnVsbGV0ID0gbmV3IEJ1bGxldChjb25maWcuZ2FtZSwgJ2J1bGxldDEyJywgY29uZmlnLnNvY2tldClcbiAgICAgICAgICAgIGJ1bGxldC5idWxsZXRJZCA9IEd1aWQoKVxuICAgICAgICAgICAgYnVsbGV0LmhlaWdodCA9IDJcbiAgICAgICAgICAgIGJ1bGxldC53aWR0aCA9IDQwXG4gICAgICAgICAgICBidWxsZXQuZGFtYWdlID0gMjJcbiAgICAgICAgICAgIHRoaXMuYWRkKGJ1bGxldCwgdHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH1cblxuICAgIGZpcmUocGxheWVyLCBzb2NrZXQsIHJvb21JZCwgdm9sdW1lKSB7XG4gICAgICAgIGlmICh0aGlzLmdhbWUudGltZS50aW1lIDwgdGhpcy5uZXh0RmlyZSlcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIHZhciB4ID0gcGxheWVyLnggKyAxNTtcbiAgICAgICAgdmFyIHkgPSBwbGF5ZXIueSArIDMwO1xuXG4gICAgICAgIHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgMCwgc29ja2V0LCByb29tSWQpXG4gICAgICAgIHRoaXMuc2V0QWxsKCd0cmFja2luZycsIHRydWUpXG5cbiAgICAgICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMuZ2FtZS50aW1lLnRpbWUgKyB0aGlzLmZpcmVSYXRlXG4gICAgICAgIHRoaXMuZngudm9sdW1lID0gLjg1ICogdm9sdW1lXG4gICAgICAgIHRoaXMuZngucGxheSgpXG4gICAgfVxufVxuIiwiaW1wb3J0IEd1aWQgZnJvbSAnLi4vR3VpZCdcbmltcG9ydCBCdWxsZXQgZnJvbSAnLi4vQnVsbGV0J1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNNEExIGV4dGVuZHMgUGhhc2VyLkdyb3VwIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcpIHtcbiAgICAgICAgc3VwZXIoKVxuXG4gICAgICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGNvbmZpZy5nYW1lLCBjb25maWcuZ2FtZS53b3JsZCwgJ000QTEnLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcblxuICAgICAgICAvL1x0SGVyZSB3ZSBzZXQtdXAgb3VyIGF1ZGlvIHNwcml0ZVxuICAgICAgICB0aGlzLmZ4ID0gY29uZmlnLmdhbWUuYWRkLmF1ZGlvKCdNNEExLXNvdW5kJylcbiAgICAgICAgdGhpcy5hbGxvd011bHRpcGxlID0gdHJ1ZVxuXG4gICAgICAgIHRoaXMuZGFtYWdlID0gMjBcbiAgICAgICAgdGhpcy5uZXh0RmlyZSA9IDBcbiAgICAgICAgdGhpcy5idWxsZXRTcGVlZCA9IDI0MDBcbiAgICAgICAgdGhpcy5maXJlUmF0ZSA9IDE1MDtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDY0OyBpKyspXG4gICAgICAgIHtcbiAgICAgICAgICAgIGxldCBidWxsZXQgPSBuZXcgQnVsbGV0KGNvbmZpZy5nYW1lLCAnYnVsbGV0MTInLCBjb25maWcuc29ja2V0KVxuICAgICAgICAgICAgYnVsbGV0LmJ1bGxldElkID0gR3VpZCgpXG4gICAgICAgICAgICBidWxsZXQuaGVpZ2h0ID0gMlxuICAgICAgICAgICAgYnVsbGV0LndpZHRoID0gNDBcbiAgICAgICAgICAgIGJ1bGxldC5kYW1hZ2UgPSAyMlxuICAgICAgICAgICAgdGhpcy5hZGQoYnVsbGV0LCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZpcmUocGxheWVyLCBzb2NrZXQsIHJvb21JZCkge1xuICAgICAgICBpZiAodGhpcy5nYW1lLnRpbWUudGltZSA8IHRoaXMubmV4dEZpcmUpXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICB2YXIgeCA9IHBsYXllci54ICsgMTU7XG4gICAgICAgIHZhciB5ID0gcGxheWVyLnkgKyAzMDtcblxuICAgICAgICB0aGlzLmdldEZpcnN0RXhpc3RzKGZhbHNlKS5maXJlKHgsIHksIDAsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDAsIHNvY2tldCwgcm9vbUlkKVxuICAgICAgICB0aGlzLnNldEFsbCgndHJhY2tpbmcnLCB0cnVlKVxuXG4gICAgICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLmdhbWUudGltZS50aW1lICsgdGhpcy5maXJlUmF0ZVxuICAgICAgICB0aGlzLmZ4LnZvbHVtZSA9IC4zXG4gICAgICAgIHRoaXMuZngucGxheSgpXG4gICAgfVxufVxuIiwiaW1wb3J0IEd1aWQgZnJvbSAnLi4vR3VpZCdcbmltcG9ydCBCdWxsZXQgZnJvbSAnLi4vQnVsbGV0J1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNNTAwIGV4dGVuZHMgUGhhc2VyLkdyb3VwIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcpIHtcbiAgICAgICAgc3VwZXIoKVxuXG4gICAgICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGNvbmZpZy5nYW1lLCBjb25maWcuZ2FtZS53b3JsZCwgJ001MDAnLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKVxuXG4gICAgICAgIHRoaXMuZnggPSBjb25maWcuZ2FtZS5hZGQuYXVkaW8oJ001MDAtc291bmQnKVxuXG4gICAgICAgIHRoaXMubmV4dEZpcmUgPSAwXG4gICAgICAgIHRoaXMuYnVsbGV0U3BlZWQgPSAxOTAwXG4gICAgICAgIHRoaXMuZmlyZVJhdGUgPSAxNjUwXG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzMjsgaSsrKVxuICAgICAgICB7XG4gICAgICAgICAgICBsZXQgYnVsbGV0ID0gbmV3IEJ1bGxldChjb25maWcuZ2FtZSwgJ2J1bGxldDEyJywgY29uZmlnLnNvY2tldClcbiAgICAgICAgICAgIGJ1bGxldC5idWxsZXRJZCA9IEd1aWQoKVxuICAgICAgICAgICAgYnVsbGV0LmhlaWdodCA9IDJcbiAgICAgICAgICAgIGJ1bGxldC53aWR0aCA9IDQwXG4gICAgICAgICAgICBidWxsZXQuZGFtYWdlID0gMjJcbiAgICAgICAgICAgIHRoaXMuYWRkKGJ1bGxldCwgdHJ1ZSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZpcmUocGxheWVyLCBzb2NrZXQsIHJvb21JZCwgdm9sdW1lKSB7XG4gICAgICAgIGlmICh0aGlzLmdhbWUudGltZS50aW1lIDwgdGhpcy5uZXh0RmlyZSlcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIHZhciB4ID0gcGxheWVyLnggKyAxNVxuICAgICAgICB2YXIgeSA9IHBsYXllci55ICsgMzBcblxuXG5cbiAgICAgICAgdmFyIGJ1bGxldEluc3RhbmNlID0gdGhpcy5nZXRGaXJzdEV4aXN0cyhmYWxzZSlcbiAgICAgICAgaWYgKCFidWxsZXRJbnN0YW5jZSkgcmV0dXJuXG4gICAgICAgIGJ1bGxldEluc3RhbmNlLmZpcmUoeCwgeSwgLjMsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDAsIHNvY2tldCwgcm9vbUlkKVxuXG5cblxuXG4gICAgICAgIGJ1bGxldEluc3RhbmNlID0gdGhpcy5nZXRGaXJzdEV4aXN0cyhmYWxzZSlcbiAgICAgICAgaWYgKCFidWxsZXRJbnN0YW5jZSkgcmV0dXJuXG4gICAgICAgIGJ1bGxldEluc3RhbmNlLmZpcmUoeCwgeSwgLTAuMywgdGhpcy5idWxsZXRTcGVlZCwgMCwgMCwgc29ja2V0LCByb29tSWQpXG5cblxuXG4gICAgICAgIGJ1bGxldEluc3RhbmNlID0gdGhpcy5nZXRGaXJzdEV4aXN0cyhmYWxzZSlcbiAgICAgICAgaWYgKCFidWxsZXRJbnN0YW5jZSkgcmV0dXJuXG4gICAgICAgIGJ1bGxldEluc3RhbmNlLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgMCwgc29ja2V0LCByb29tSWQpXG5cblxuXG5cblxuICAgICAgICBidWxsZXRJbnN0YW5jZSA9IHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpXG4gICAgICAgIGlmICghYnVsbGV0SW5zdGFuY2UpIHJldHVyblxuICAgICAgICBidWxsZXRJbnN0YW5jZS5maXJlKHgsIHksIDAsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDAsIHNvY2tldCwgcm9vbUlkKVxuXG5cblxuXG4gICAgICAgIHRoaXMuc2V0QWxsKCd0cmFja2luZycsIHRydWUpXG5cbiAgICAgICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMuZ2FtZS50aW1lLnRpbWUgKyB0aGlzLmZpcmVSYXRlXG4gICAgICAgIHRoaXMuZngudm9sdW1lID0gLjMgKiB2b2x1bWVcbiAgICAgICAgdGhpcy5meC5wbGF5KClcbiAgICB9XG59XG4iLCJpbXBvcnQgR3VpZCBmcm9tICcuLi9HdWlkJ1xuaW1wb3J0IEJ1bGxldCBmcm9tICcuLi9CdWxsZXQnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFA5MCBleHRlbmRzIFBoYXNlci5Hcm91cCB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnKSB7XG4gICAgICAgIHN1cGVyKClcblxuICAgICAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCBjb25maWcuZ2FtZSwgY29uZmlnLmdhbWUud29ybGQsICdQOTAnLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcblxuICAgICAgICAvL1x0SGVyZSB3ZSBzZXQtdXAgb3VyIGF1ZGlvIHNwcml0ZVxuICAgICAgICB0aGlzLmZ4ID0gY29uZmlnLmdhbWUuYWRkLmF1ZGlvKCdQOTAtc291bmQnKVxuICAgICAgICB0aGlzLmFsbG93TXVsdGlwbGUgPSB0cnVlXG5cbiAgICAgICAgdGhpcy5kYW1hZ2UgPSAyMlxuICAgICAgICB0aGlzLm5leHRGaXJlID0gMFxuICAgICAgICB0aGlzLmJ1bGxldFNwZWVkID0gMjMwMFxuICAgICAgICB0aGlzLmZpcmVSYXRlID0gMTIwO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNjQ7IGkrKylcbiAgICAgICAge1xuICAgICAgICAgICAgbGV0IGJ1bGxldCA9IG5ldyBCdWxsZXQoY29uZmlnLmdhbWUsICdidWxsZXQxMicsIGNvbmZpZy5zb2NrZXQpXG4gICAgICAgICAgICBidWxsZXQuYnVsbGV0SWQgPSBHdWlkKClcbiAgICAgICAgICAgIGJ1bGxldC5oZWlnaHQgPSAyXG4gICAgICAgICAgICBidWxsZXQud2lkdGggPSA0MFxuICAgICAgICAgICAgYnVsbGV0LmRhbWFnZSA9IDIyXG4gICAgICAgICAgICB0aGlzLmFkZChidWxsZXQsIHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZmlyZShwbGF5ZXIsIHNvY2tldCwgcm9vbUlkLCB2b2x1bWUpIHtcbiAgICAgICAgaWYgKHRoaXMuZ2FtZS50aW1lLnRpbWUgPCB0aGlzLm5leHRGaXJlKVxuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgdmFyIHggPSBwbGF5ZXIueCArIDE1O1xuICAgICAgICB2YXIgeSA9IHBsYXllci55ICsgMzA7XG5cbiAgICAgICAgdGhpcy5nZXRGaXJzdEV4aXN0cyhmYWxzZSkuZmlyZSh4LCB5LCAwLCB0aGlzLmJ1bGxldFNwZWVkLCAwLCAwLCBzb2NrZXQsIHJvb21JZClcbiAgICAgICAgdGhpcy5zZXRBbGwoJ3RyYWNraW5nJywgdHJ1ZSlcblxuICAgICAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5nYW1lLnRpbWUudGltZSArIHRoaXMuZmlyZVJhdGVcbiAgICAgICAgdGhpcy5meC52b2x1bWUgPSAuMyAqIHZvbHVtZVxuICAgICAgICB0aGlzLmZ4LnBsYXkoKVxuICAgIH1cbn1cbiIsImltcG9ydCBHdWlkIGZyb20gJy4uL0d1aWQnXG5pbXBvcnQgQnVsbGV0IGZyb20gJy4uL0J1bGxldCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUlBHIGV4dGVuZHMgUGhhc2VyLkdyb3VwIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcpIHtcbiAgICAgICAgc3VwZXIoKVxuXG4gICAgICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGNvbmZpZy5nYW1lLCBjb25maWcuZ2FtZS53b3JsZCwgJ1JQRycsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuXG4gICAgICAgIC8vXHRIZXJlIHdlIHNldC11cCBvdXIgYXVkaW8gc3ByaXRlXG4gICAgICAgIHRoaXMuZnggPSBjb25maWcuZ2FtZS5hZGQuYXVkaW8oJ1JQRy1zb3VuZCcpXG4gICAgICAgIHRoaXMuYWxsb3dNdWx0aXBsZSA9IHRydWVcblxuICAgICAgICB0aGlzLmRhbWFnZSA9IDIyXG4gICAgICAgIHRoaXMubmV4dEZpcmUgPSAwXG4gICAgICAgIHRoaXMuYnVsbGV0U3BlZWQgPSAyMzAwXG4gICAgICAgIHRoaXMuZmlyZVJhdGUgPSAzMDAwXG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA2NDsgaSsrKVxuICAgICAgICB7XG4gICAgICAgICAgICBsZXQgYnVsbGV0ID0gbmV3IEJ1bGxldChjb25maWcuZ2FtZSwgJ2J1bGxldDEyJywgY29uZmlnLnNvY2tldClcbiAgICAgICAgICAgIGJ1bGxldC5idWxsZXRJZCA9IEd1aWQoKVxuICAgICAgICAgICAgYnVsbGV0LmhlaWdodCA9IDJcbiAgICAgICAgICAgIGJ1bGxldC53aWR0aCA9IDQwXG4gICAgICAgICAgICBidWxsZXQuZGFtYWdlID0gMjJcbiAgICAgICAgICAgIHRoaXMuYWRkKGJ1bGxldCwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmaXJlKHBsYXllciwgc29ja2V0LCByb29tSWQsIHZvbHVtZSkge1xuICAgICAgICBpZiAodGhpcy5nYW1lLnRpbWUudGltZSA8IHRoaXMubmV4dEZpcmUpXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICB2YXIgeCA9IHBsYXllci54ICsgMTU7XG4gICAgICAgIHZhciB5ID0gcGxheWVyLnkgKyAzMDtcblxuICAgICAgICB0aGlzLmdldEZpcnN0RXhpc3RzKGZhbHNlKS5maXJlKHgsIHksIDAsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDAsIHNvY2tldCwgcm9vbUlkKVxuICAgICAgICB0aGlzLnNldEFsbCgndHJhY2tpbmcnLCB0cnVlKVxuXG4gICAgICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLmdhbWUudGltZS50aW1lICsgdGhpcy5maXJlUmF0ZVxuICAgICAgICB0aGlzLmZ4LnZvbHVtZSA9IC42ICogdm9sdW1lXG4gICAgICAgIHRoaXMuZngucGxheSgpXG4gICAgfVxufVxuXG4vL1xuLy8gLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gLy8gIFJQRyB0aGF0IHZpc3VhbGx5IHRyYWNrIHRoZSBkaXJlY3Rpb24gdGhleSdyZSBoZWFkaW5nIGluIC8vXG4vLyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vL1xuLy8gV2VhcG9uLlJQRyA9IGZ1bmN0aW9uIChnYW1lKSB7XG4vL1xuLy8gICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGdhbWUsIGdhbWUud29ybGQsICdSUEcnLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcbi8vXG4vLyAgICAgdGhpcy5uZXh0RmlyZSA9IDA7XG4vLyAgICAgdGhpcy5idWxsZXRTcGVlZCA9IDQwMDtcbi8vICAgICB0aGlzLmZpcmVSYXRlID0gMjUwO1xuLy9cbi8vICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDMyOyBpKyspXG4vLyAgICAge1xuLy8gICAgICAgICB0aGlzLmFkZChuZXcgQnVsbGV0KGdhbWUsICdidWxsZXQxMCcpLCB0cnVlKTtcbi8vICAgICB9XG4vL1xuLy8gICAgIHRoaXMuc2V0QWxsKCd0cmFja2luZycsIHRydWUpXG4vL1xuLy8gICAgIHJldHVybiB0aGlzO1xuLy9cbi8vIH07XG4vL1xuLy8gV2VhcG9uLlJQRy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuLy8gV2VhcG9uLlJQRy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBXZWFwb24uUlBHO1xuLy9cbi8vIFdlYXBvbi5SUEcucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbiAoc291cmNlKSB7XG4vL1xuLy8gICAgIGlmICh0aGlzLmdhbWUudGltZS50aW1lIDwgdGhpcy5uZXh0RmlyZSkgeyByZXR1cm47IH1cbi8vXG4vLyAgICAgdmFyIHggPSBzb3VyY2UueCArIDEwO1xuLy8gICAgIHZhciB5ID0gc291cmNlLnkgKyAxMDtcbi8vXG4vLyAgICAgdGhpcy5nZXRGaXJzdEV4aXN0cyhmYWxzZSkuZmlyZSh4LCB5LCAwLCB0aGlzLmJ1bGxldFNwZWVkLCAwLCAtNzAwKTtcbi8vICAgICB0aGlzLmdldEZpcnN0RXhpc3RzKGZhbHNlKS5maXJlKHgsIHksIDAsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDcwMCk7XG4vL1xuLy8gICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLmdhbWUudGltZS50aW1lICsgdGhpcy5maXJlUmF0ZTtcbi8vXG4vLyB9O1xuIiwiaW1wb3J0IEd1aWQgZnJvbSAnLi4vR3VpZCdcbmltcG9ydCBCdWxsZXQgZnJvbSAnLi4vQnVsbGV0J1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTa29ycGlvbiBleHRlbmRzIFBoYXNlci5Hcm91cCB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnKSB7XG4gICAgICAgIHN1cGVyKClcblxuICAgICAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCBjb25maWcuZ2FtZSwgY29uZmlnLmdhbWUud29ybGQsICdBSy00NycsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuXG4gICAgICAgIC8vXHRIZXJlIHdlIHNldC11cCBvdXIgYXVkaW8gc3ByaXRlXG4gICAgICAgIHRoaXMuZnggPSBjb25maWcuZ2FtZS5hZGQuYXVkaW8oJ1Nrb3JwaW9uLXNvdW5kJylcbiAgICAgICAgdGhpcy5hbGxvd011bHRpcGxlID0gdHJ1ZVxuXG4gICAgICAgIHRoaXMuZGFtYWdlID0gMjJcbiAgICAgICAgdGhpcy5uZXh0RmlyZSA9IDBcbiAgICAgICAgdGhpcy5idWxsZXRTcGVlZCA9IDIzMDBcbiAgICAgICAgdGhpcy5maXJlUmF0ZSA9IDEyMDtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDY0OyBpKyspXG4gICAgICAgIHtcbiAgICAgICAgICAgIGxldCBidWxsZXQgPSBuZXcgQnVsbGV0KGNvbmZpZy5nYW1lLCAnYnVsbGV0MTInLCBjb25maWcuc29ja2V0KVxuICAgICAgICAgICAgYnVsbGV0LmJ1bGxldElkID0gR3VpZCgpXG4gICAgICAgICAgICBidWxsZXQuaGVpZ2h0ID0gMlxuICAgICAgICAgICAgYnVsbGV0LndpZHRoID0gNDBcbiAgICAgICAgICAgIGJ1bGxldC5kYW1hZ2UgPSAyMlxuICAgICAgICAgICAgdGhpcy5hZGQoYnVsbGV0LCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZpcmUocGxheWVyLCBzb2NrZXQsIHJvb21JZCwgdm9sdW1lKSB7XG4gICAgICAgIGlmICh0aGlzLmdhbWUudGltZS50aW1lIDwgdGhpcy5uZXh0RmlyZSlcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIHZhciB4ID0gcGxheWVyLnggKyAxNTtcbiAgICAgICAgdmFyIHkgPSBwbGF5ZXIueSArIDMwO1xuXG4gICAgICAgIHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgMCwgc29ja2V0LCByb29tSWQpXG4gICAgICAgIHRoaXMuc2V0QWxsKCd0cmFja2luZycsIHRydWUpXG5cbiAgICAgICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMuZ2FtZS50aW1lLnRpbWUgKyB0aGlzLmZpcmVSYXRlXG4gICAgICAgIHRoaXMuZngudm9sdW1lID0gLjggKiB2b2x1bWVcbiAgICAgICAgdGhpcy5meC5wbGF5KClcbiAgICB9XG59XG4iLCJpbXBvcnQgQUs0NyBmcm9tICcuL0FLNDcnXG5pbXBvcnQgQmFycmV0dCBmcm9tICcuL0JhcnJldHQnXG5pbXBvcnQgRGVzZXJ0RWFnbGUgZnJvbSAnLi9EZXNlcnRFYWdsZSdcbmltcG9ydCBNNEExIGZyb20gJy4vTTRBMSdcbmltcG9ydCBNNTAwIGZyb20gJy4vTTUwMCdcbmltcG9ydCBTa29ycGlvbiBmcm9tICcuL1Nrb3JwaW9uJ1xuaW1wb3J0IEFVRyBmcm9tICcuL0FVRydcbmltcG9ydCBSUEcgZnJvbSAnLi9SUEcnXG5pbXBvcnQgUDkwIGZyb20gJy4vUDkwJ1xuaW1wb3J0IEc0MyBmcm9tICcuL0c0MydcblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIEFLNDcsXG4gICAgQmFycmV0dCxcbiAgICBEZXNlcnRFYWdsZSxcbiAgICBNNEExLFxuICAgIE01MDAsXG4gICAgU2tvcnBpb24sXG4gICAgQVVHLFxuICAgIFJQRyxcbiAgICBQOTAsXG4gICAgRzQzXG59XG4iLCJjb25zdCBzcGF3blBvaW50cyA9IFtcbiAgICB7IHg6IDgxNSwgeTogMTczMCB9LFxuICAgIHsgeDogMzM4MCwgeTogMTAzMCB9LFxuICAgIHsgeDogNDQzNywgeTogMTU1MCB9LFxuICAgIHsgeDogNjY5MCwgeTogMTg2MCB9LFxuICAgIHsgeDogMzgzMiwgeTogMzM1MCB9LFxuICAgIHsgeDogMzc3NSwgeTogMjMwMCB9LFxuICAgIHsgeDogMjQyMCwgeTogMjkwMCB9XG5dXG5cbmNvbnN0IGxlZGdlcyA9IFtcbiAgICB7IGlkOiAxLCB4OiAyMTQ1LCB5OiAyMDY1LCB3aWR0aDogMTM1LCBoZWlnaHQ6IDQwIH0sXG4gICAgeyBpZDogMiwgeDogMjYxMywgeTogMTA5NCwgd2lkdGg6IDExMDAsIGhlaWdodDogMTEyIH0sXG4gICAgeyBpZDogMywgeDogMzY1NywgeTogMzQ0Niwgd2lkdGg6IDUwMCwgaGVpZ2h0OiA2MDAgfSxcbiAgICB7IGlkOiA0LCB4OiA1MjE3LCB5OiAxOTM4LCB3aWR0aDogMzgwLCBoZWlnaHQ6IDYwMCB9LFxuICAgIHsgaWQ6IDUsIHg6IDQyMiwgeTogMTgyNCwgd2lkdGg6IDExNTAsIGhlaWdodDogMzAwIH0sXG4gICAgeyBpZDogNiwgeDogMTU1NSwgeTogMTc0OSwgd2lkdGg6IDI3MCwgaGVpZ2h0OiA3MzAgfSxcbiAgICB7IGlkOiA3LCB4OiAxODIwLCB5OiAxNzQ5LCB3aWR0aDogNDcwLCBoZWlnaHQ6IDYgfSxcbiAgICB7IGlkOiA4LCB4OiAyMjc1LCB5OiAxNzQ5LCB3aWR0aDogMzIwLCBoZWlnaHQ6IDYzMCB9LFxuICAgIHsgaWQ6IDksIHg6IDI1OTUsIHk6IDE2NjcsIHdpZHRoOiAxMTIwLCBoZWlnaHQ6IDI2MCB9LFxuICAgIHsgaWQ6IDEwLCB4OiA0MzA0LCB5OiAxNjIxLCB3aWR0aDogMzc1LCBoZWlnaHQ6IDEzMDAgfSxcbiAgICB7IGlkOiAxMSwgeDogMTgyNSwgeTogMjI5OCwgd2lkdGg6IDE2MCwgaGVpZ2h0OiAxNTIgfSxcbiAgICB7IGlkOiAxMiwgeDogNTY0NCwgeTogMTU3Mywgd2lkdGg6IDMzMCwgaGVpZ2h0OiAyMCB9LFxuICAgIHsgaWQ6IDEzLCB4OiA0NjczLCB5OiAyMDE3LCB3aWR0aDogNTcwLCBoZWlnaHQ6IDI1NCB9LFxuICAgIHsgaWQ6IDE0LCB4OiAyOTQ4LCB5OiAzMTM3LCB3aWR0aDogMzgwLCBoZWlnaHQ6IDMwMCB9LFxuICAgIHsgaWQ6IDE1LCB4OiAzOTgzLCB5OiAyMDI4LCB3aWR0aDogMzQxLCBoZWlnaHQ6IDcwMCB9LFxuICAgIHsgaWQ6IDE2LCB4OiAxOTEyLCB5OiAyOTY3LCB3aWR0aDogMTA0NSwgaGVpZ2h0OiA1MDAgfSxcbiAgICB7IGlkOiAxNywgeDogNjYyOCwgeTogMTU5MCwgd2lkdGg6IDM4NSwgaGVpZ2h0OiAzNyB9LFxuICAgIHsgaWQ6IDE4LCB4OiA2NjI4LCB5OiAxMTc4LCB3aWR0aDogMzg1LCBoZWlnaHQ6IDM3IH0sXG4gICAgeyBpZDogMTksIHg6IDU1OTAsIHk6IDIwMzgsIHdpZHRoOiAzNTAsIGhlaWdodDogNjAwIH0sXG4gICAgeyBpZDogMjAsIHg6IDY5ODQsIHk6IDE5ODksIHdpZHRoOiA0NTAsIGhlaWdodDogMTY3IH0sXG4gICAgeyBpZDogMjEsIHg6IDM2NzIsIHk6IDI0MDEsIHdpZHRoOiAzMzAsIGhlaWdodDogNTAwIH0sXG4gICAgeyBpZDogMjIsIHg6IDMzMDMsIHk6IDI1OTksIHdpZHRoOiA0MDAsIGhlaWdodDogMzAwIH0sXG4gICAgeyBpZDogMjMsIHg6IDU5NDAsIHk6IDIwMTgsIHdpZHRoOiAxMDUwLCBoZWlnaHQ6IDYwMCB9XG5dXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhpZ2hSdWxlSnVuZ2xlIHtcbiAgICBjb25zdHJ1Y3Rvcihyb290U2NvcGUpIHtcbiAgICAgICAgdGhpcy5yb290U2NvcGUgPSByb290U2NvcGVcbiAgICB9XG5cbiAgICBnZXRSYW5kb21TcGF3blBvaW50KCkge1xuICAgICAgICByZXR1cm4gXy5zYW1wbGUoc3Bhd25Qb2ludHMpXG4gICAgfVxuXG4gICAgY3JlYXRlKCkge1xuICAgICAgICB0aGlzLnJvb3RTY29wZS5za3lzcHJpdGUgPSB0aGlzLnJvb3RTY29wZS5hZGQudGlsZVNwcml0ZSgwLCAwLCB0aGlzLnJvb3RTY29wZS5nYW1lLndvcmxkLndpZHRoLCB0aGlzLnJvb3RTY29wZS5nYW1lLndvcmxkLmhlaWdodCwgJ21hcC1iZycpXG4gICAgICAgIHRoaXMucm9vdFNjb3BlLnBsYXRmb3JtcyA9IHRoaXMucm9vdFNjb3BlLmFkZC5ncm91cCgpXG4gICAgICAgIHRoaXMucm9vdFNjb3BlLnBsYXRmb3Jtcy5lbmFibGVCb2R5ID0gdHJ1ZVxuICAgICAgICB0aGlzLmNyZWF0ZUxlZGdlcygpXG4gICAgICAgIHRoaXMucm9vdFNjb3BlLnBsYXRmb3Jtcy5zZXRBbGwoJ2JvZHkuaW1tb3ZhYmxlJywgdHJ1ZSlcbiAgICAgICAgdGhpcy5yb290U2NvcGUucGxhdGZvcm1zLnNldEFsbCgnYm9keS5hbGxvd0dyYXZpdHknLCBmYWxzZSlcbiAgICB9XG5cbiAgICBjcmVhdGVMZWRnZXMoKSB7XG4gICAgICAgIGxlZGdlcy5mb3JFYWNoKChsZWRnZSkgPT4ge1xuICAgICAgICAgICAgLy8gdmFyIG5ld0xlZGdlID0gdGhpcy5yb290U2NvcGUucGxhdGZvcm1zLmNyZWF0ZShsZWRnZS54LCBsZWRnZS55LCAnZ3JvdW5kJylcbiAgICAgICAgICAgIHZhciBuZXdMZWRnZSA9IHRoaXMucm9vdFNjb3BlLnBsYXRmb3Jtcy5jcmVhdGUobGVkZ2UueCwgbGVkZ2UueSlcbiAgICAgICAgICAgIG5ld0xlZGdlLmhlaWdodCA9IGxlZGdlLmhlaWdodFxuICAgICAgICAgICAgbmV3TGVkZ2Uud2lkdGggPSBsZWRnZS53aWR0aFxuXG4gICAgICAgICAgICAvLyBEZWJ1ZyBzdHVmZlxuICAgICAgICAgICAgLy8gbmV3TGVkZ2UuYWxwaGEgPSAwLjRcbiAgICAgICAgICAgIC8vIGxldCBzdHlsZSA9IHsgZm9udDogXCIyMHB4IEFyaWFsXCIsIGZpbGw6IFwiI2ZmMDA0NFwiLCBhbGlnbjogXCJjZW50ZXJcIiwgYmFja2dyb3VuZENvbG9yOiBcIiNmZmZmMDBcIiB9XG4gICAgICAgICAgICAvLyBsZXQgdGV4dCA9IHRoaXMucm9vdFNjb3BlLmdhbWUuYWRkLnRleHQobGVkZ2UueCwgbGVkZ2UueSwgbGVkZ2UuaWQsIHN0eWxlKVxuICAgICAgICAgICAgLy8gdGV4dC5hbHBoYSA9IDAuMlxuICAgICAgICB9KVxuICAgIH1cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGFzc2lnbiAgICAgICAgPSByZXF1aXJlKCdlczUtZXh0L29iamVjdC9hc3NpZ24nKVxuICAsIG5vcm1hbGl6ZU9wdHMgPSByZXF1aXJlKCdlczUtZXh0L29iamVjdC9ub3JtYWxpemUtb3B0aW9ucycpXG4gICwgaXNDYWxsYWJsZSAgICA9IHJlcXVpcmUoJ2VzNS1leHQvb2JqZWN0L2lzLWNhbGxhYmxlJylcbiAgLCBjb250YWlucyAgICAgID0gcmVxdWlyZSgnZXM1LWV4dC9zdHJpbmcvIy9jb250YWlucycpXG5cbiAgLCBkO1xuXG5kID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZHNjciwgdmFsdWUvKiwgb3B0aW9ucyovKSB7XG5cdHZhciBjLCBlLCB3LCBvcHRpb25zLCBkZXNjO1xuXHRpZiAoKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB8fCAodHlwZW9mIGRzY3IgIT09ICdzdHJpbmcnKSkge1xuXHRcdG9wdGlvbnMgPSB2YWx1ZTtcblx0XHR2YWx1ZSA9IGRzY3I7XG5cdFx0ZHNjciA9IG51bGw7XG5cdH0gZWxzZSB7XG5cdFx0b3B0aW9ucyA9IGFyZ3VtZW50c1syXTtcblx0fVxuXHRpZiAoZHNjciA9PSBudWxsKSB7XG5cdFx0YyA9IHcgPSB0cnVlO1xuXHRcdGUgPSBmYWxzZTtcblx0fSBlbHNlIHtcblx0XHRjID0gY29udGFpbnMuY2FsbChkc2NyLCAnYycpO1xuXHRcdGUgPSBjb250YWlucy5jYWxsKGRzY3IsICdlJyk7XG5cdFx0dyA9IGNvbnRhaW5zLmNhbGwoZHNjciwgJ3cnKTtcblx0fVxuXG5cdGRlc2MgPSB7IHZhbHVlOiB2YWx1ZSwgY29uZmlndXJhYmxlOiBjLCBlbnVtZXJhYmxlOiBlLCB3cml0YWJsZTogdyB9O1xuXHRyZXR1cm4gIW9wdGlvbnMgPyBkZXNjIDogYXNzaWduKG5vcm1hbGl6ZU9wdHMob3B0aW9ucyksIGRlc2MpO1xufTtcblxuZC5ncyA9IGZ1bmN0aW9uIChkc2NyLCBnZXQsIHNldC8qLCBvcHRpb25zKi8pIHtcblx0dmFyIGMsIGUsIG9wdGlvbnMsIGRlc2M7XG5cdGlmICh0eXBlb2YgZHNjciAhPT0gJ3N0cmluZycpIHtcblx0XHRvcHRpb25zID0gc2V0O1xuXHRcdHNldCA9IGdldDtcblx0XHRnZXQgPSBkc2NyO1xuXHRcdGRzY3IgPSBudWxsO1xuXHR9IGVsc2Uge1xuXHRcdG9wdGlvbnMgPSBhcmd1bWVudHNbM107XG5cdH1cblx0aWYgKGdldCA9PSBudWxsKSB7XG5cdFx0Z2V0ID0gdW5kZWZpbmVkO1xuXHR9IGVsc2UgaWYgKCFpc0NhbGxhYmxlKGdldCkpIHtcblx0XHRvcHRpb25zID0gZ2V0O1xuXHRcdGdldCA9IHNldCA9IHVuZGVmaW5lZDtcblx0fSBlbHNlIGlmIChzZXQgPT0gbnVsbCkge1xuXHRcdHNldCA9IHVuZGVmaW5lZDtcblx0fSBlbHNlIGlmICghaXNDYWxsYWJsZShzZXQpKSB7XG5cdFx0b3B0aW9ucyA9IHNldDtcblx0XHRzZXQgPSB1bmRlZmluZWQ7XG5cdH1cblx0aWYgKGRzY3IgPT0gbnVsbCkge1xuXHRcdGMgPSB0cnVlO1xuXHRcdGUgPSBmYWxzZTtcblx0fSBlbHNlIHtcblx0XHRjID0gY29udGFpbnMuY2FsbChkc2NyLCAnYycpO1xuXHRcdGUgPSBjb250YWlucy5jYWxsKGRzY3IsICdlJyk7XG5cdH1cblxuXHRkZXNjID0geyBnZXQ6IGdldCwgc2V0OiBzZXQsIGNvbmZpZ3VyYWJsZTogYywgZW51bWVyYWJsZTogZSB9O1xuXHRyZXR1cm4gIW9wdGlvbnMgPyBkZXNjIDogYXNzaWduKG5vcm1hbGl6ZU9wdHMob3B0aW9ucyksIGRlc2MpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2lzLWltcGxlbWVudGVkJykoKVxuXHQ/IE9iamVjdC5hc3NpZ25cblx0OiByZXF1aXJlKCcuL3NoaW0nKTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG5cdHZhciBhc3NpZ24gPSBPYmplY3QuYXNzaWduLCBvYmo7XG5cdGlmICh0eXBlb2YgYXNzaWduICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gZmFsc2U7XG5cdG9iaiA9IHsgZm9vOiAncmF6JyB9O1xuXHRhc3NpZ24ob2JqLCB7IGJhcjogJ2R3YScgfSwgeyB0cnp5OiAndHJ6eScgfSk7XG5cdHJldHVybiAob2JqLmZvbyArIG9iai5iYXIgKyBvYmoudHJ6eSkgPT09ICdyYXpkd2F0cnp5Jztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBrZXlzICA9IHJlcXVpcmUoJy4uL2tleXMnKVxuICAsIHZhbHVlID0gcmVxdWlyZSgnLi4vdmFsaWQtdmFsdWUnKVxuXG4gICwgbWF4ID0gTWF0aC5tYXg7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGRlc3QsIHNyYy8qLCDigKZzcmNuKi8pIHtcblx0dmFyIGVycm9yLCBpLCBsID0gbWF4KGFyZ3VtZW50cy5sZW5ndGgsIDIpLCBhc3NpZ247XG5cdGRlc3QgPSBPYmplY3QodmFsdWUoZGVzdCkpO1xuXHRhc3NpZ24gPSBmdW5jdGlvbiAoa2V5KSB7XG5cdFx0dHJ5IHsgZGVzdFtrZXldID0gc3JjW2tleV07IH0gY2F0Y2ggKGUpIHtcblx0XHRcdGlmICghZXJyb3IpIGVycm9yID0gZTtcblx0XHR9XG5cdH07XG5cdGZvciAoaSA9IDE7IGkgPCBsOyArK2kpIHtcblx0XHRzcmMgPSBhcmd1bWVudHNbaV07XG5cdFx0a2V5cyhzcmMpLmZvckVhY2goYXNzaWduKTtcblx0fVxuXHRpZiAoZXJyb3IgIT09IHVuZGVmaW5lZCkgdGhyb3cgZXJyb3I7XG5cdHJldHVybiBkZXN0O1xufTtcbiIsIi8vIERlcHJlY2F0ZWRcblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmogPT09ICdmdW5jdGlvbic7IH07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9pcy1pbXBsZW1lbnRlZCcpKClcblx0PyBPYmplY3Qua2V5c1xuXHQ6IHJlcXVpcmUoJy4vc2hpbScpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcblx0dHJ5IHtcblx0XHRPYmplY3Qua2V5cygncHJpbWl0aXZlJyk7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH0gY2F0Y2ggKGUpIHsgcmV0dXJuIGZhbHNlOyB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIga2V5cyA9IE9iamVjdC5rZXlzO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvYmplY3QpIHtcblx0cmV0dXJuIGtleXMob2JqZWN0ID09IG51bGwgPyBvYmplY3QgOiBPYmplY3Qob2JqZWN0KSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZm9yRWFjaCA9IEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLCBjcmVhdGUgPSBPYmplY3QuY3JlYXRlO1xuXG52YXIgcHJvY2VzcyA9IGZ1bmN0aW9uIChzcmMsIG9iaikge1xuXHR2YXIga2V5O1xuXHRmb3IgKGtleSBpbiBzcmMpIG9ialtrZXldID0gc3JjW2tleV07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvcHRpb25zLyosIOKApm9wdGlvbnMqLykge1xuXHR2YXIgcmVzdWx0ID0gY3JlYXRlKG51bGwpO1xuXHRmb3JFYWNoLmNhbGwoYXJndW1lbnRzLCBmdW5jdGlvbiAob3B0aW9ucykge1xuXHRcdGlmIChvcHRpb25zID09IG51bGwpIHJldHVybjtcblx0XHRwcm9jZXNzKE9iamVjdChvcHRpb25zKSwgcmVzdWx0KTtcblx0fSk7XG5cdHJldHVybiByZXN1bHQ7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChmbikge1xuXHRpZiAodHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB0aHJvdyBuZXcgVHlwZUVycm9yKGZuICsgXCIgaXMgbm90IGEgZnVuY3Rpb25cIik7XG5cdHJldHVybiBmbjtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHZhbHVlKSB7XG5cdGlmICh2YWx1ZSA9PSBudWxsKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IHVzZSBudWxsIG9yIHVuZGVmaW5lZFwiKTtcblx0cmV0dXJuIHZhbHVlO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2lzLWltcGxlbWVudGVkJykoKVxuXHQ/IFN0cmluZy5wcm90b3R5cGUuY29udGFpbnNcblx0OiByZXF1aXJlKCcuL3NoaW0nKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHN0ciA9ICdyYXpkd2F0cnp5JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG5cdGlmICh0eXBlb2Ygc3RyLmNvbnRhaW5zICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gZmFsc2U7XG5cdHJldHVybiAoKHN0ci5jb250YWlucygnZHdhJykgPT09IHRydWUpICYmIChzdHIuY29udGFpbnMoJ2ZvbycpID09PSBmYWxzZSkpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGluZGV4T2YgPSBTdHJpbmcucHJvdG90eXBlLmluZGV4T2Y7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHNlYXJjaFN0cmluZy8qLCBwb3NpdGlvbiovKSB7XG5cdHJldHVybiBpbmRleE9mLmNhbGwodGhpcywgc2VhcmNoU3RyaW5nLCBhcmd1bWVudHNbMV0pID4gLTE7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZCAgICAgICAgPSByZXF1aXJlKCdkJylcbiAgLCBjYWxsYWJsZSA9IHJlcXVpcmUoJ2VzNS1leHQvb2JqZWN0L3ZhbGlkLWNhbGxhYmxlJylcblxuICAsIGFwcGx5ID0gRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5LCBjYWxsID0gRnVuY3Rpb24ucHJvdG90eXBlLmNhbGxcbiAgLCBjcmVhdGUgPSBPYmplY3QuY3JlYXRlLCBkZWZpbmVQcm9wZXJ0eSA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eVxuICAsIGRlZmluZVByb3BlcnRpZXMgPSBPYmplY3QuZGVmaW5lUHJvcGVydGllc1xuICAsIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eVxuICAsIGRlc2NyaXB0b3IgPSB7IGNvbmZpZ3VyYWJsZTogdHJ1ZSwgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlIH1cblxuICAsIG9uLCBvbmNlLCBvZmYsIGVtaXQsIG1ldGhvZHMsIGRlc2NyaXB0b3JzLCBiYXNlO1xuXG5vbiA9IGZ1bmN0aW9uICh0eXBlLCBsaXN0ZW5lcikge1xuXHR2YXIgZGF0YTtcblxuXHRjYWxsYWJsZShsaXN0ZW5lcik7XG5cblx0aWYgKCFoYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMsICdfX2VlX18nKSkge1xuXHRcdGRhdGEgPSBkZXNjcmlwdG9yLnZhbHVlID0gY3JlYXRlKG51bGwpO1xuXHRcdGRlZmluZVByb3BlcnR5KHRoaXMsICdfX2VlX18nLCBkZXNjcmlwdG9yKTtcblx0XHRkZXNjcmlwdG9yLnZhbHVlID0gbnVsbDtcblx0fSBlbHNlIHtcblx0XHRkYXRhID0gdGhpcy5fX2VlX187XG5cdH1cblx0aWYgKCFkYXRhW3R5cGVdKSBkYXRhW3R5cGVdID0gbGlzdGVuZXI7XG5cdGVsc2UgaWYgKHR5cGVvZiBkYXRhW3R5cGVdID09PSAnb2JqZWN0JykgZGF0YVt0eXBlXS5wdXNoKGxpc3RlbmVyKTtcblx0ZWxzZSBkYXRhW3R5cGVdID0gW2RhdGFbdHlwZV0sIGxpc3RlbmVyXTtcblxuXHRyZXR1cm4gdGhpcztcbn07XG5cbm9uY2UgPSBmdW5jdGlvbiAodHlwZSwgbGlzdGVuZXIpIHtcblx0dmFyIG9uY2UsIHNlbGY7XG5cblx0Y2FsbGFibGUobGlzdGVuZXIpO1xuXHRzZWxmID0gdGhpcztcblx0b24uY2FsbCh0aGlzLCB0eXBlLCBvbmNlID0gZnVuY3Rpb24gKCkge1xuXHRcdG9mZi5jYWxsKHNlbGYsIHR5cGUsIG9uY2UpO1xuXHRcdGFwcGx5LmNhbGwobGlzdGVuZXIsIHRoaXMsIGFyZ3VtZW50cyk7XG5cdH0pO1xuXG5cdG9uY2UuX19lZU9uY2VMaXN0ZW5lcl9fID0gbGlzdGVuZXI7XG5cdHJldHVybiB0aGlzO1xufTtcblxub2ZmID0gZnVuY3Rpb24gKHR5cGUsIGxpc3RlbmVyKSB7XG5cdHZhciBkYXRhLCBsaXN0ZW5lcnMsIGNhbmRpZGF0ZSwgaTtcblxuXHRjYWxsYWJsZShsaXN0ZW5lcik7XG5cblx0aWYgKCFoYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMsICdfX2VlX18nKSkgcmV0dXJuIHRoaXM7XG5cdGRhdGEgPSB0aGlzLl9fZWVfXztcblx0aWYgKCFkYXRhW3R5cGVdKSByZXR1cm4gdGhpcztcblx0bGlzdGVuZXJzID0gZGF0YVt0eXBlXTtcblxuXHRpZiAodHlwZW9mIGxpc3RlbmVycyA9PT0gJ29iamVjdCcpIHtcblx0XHRmb3IgKGkgPSAwOyAoY2FuZGlkYXRlID0gbGlzdGVuZXJzW2ldKTsgKytpKSB7XG5cdFx0XHRpZiAoKGNhbmRpZGF0ZSA9PT0gbGlzdGVuZXIpIHx8XG5cdFx0XHRcdFx0KGNhbmRpZGF0ZS5fX2VlT25jZUxpc3RlbmVyX18gPT09IGxpc3RlbmVyKSkge1xuXHRcdFx0XHRpZiAobGlzdGVuZXJzLmxlbmd0aCA9PT0gMikgZGF0YVt0eXBlXSA9IGxpc3RlbmVyc1tpID8gMCA6IDFdO1xuXHRcdFx0XHRlbHNlIGxpc3RlbmVycy5zcGxpY2UoaSwgMSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdGlmICgobGlzdGVuZXJzID09PSBsaXN0ZW5lcikgfHxcblx0XHRcdFx0KGxpc3RlbmVycy5fX2VlT25jZUxpc3RlbmVyX18gPT09IGxpc3RlbmVyKSkge1xuXHRcdFx0ZGVsZXRlIGRhdGFbdHlwZV07XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHRoaXM7XG59O1xuXG5lbWl0ID0gZnVuY3Rpb24gKHR5cGUpIHtcblx0dmFyIGksIGwsIGxpc3RlbmVyLCBsaXN0ZW5lcnMsIGFyZ3M7XG5cblx0aWYgKCFoYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMsICdfX2VlX18nKSkgcmV0dXJuO1xuXHRsaXN0ZW5lcnMgPSB0aGlzLl9fZWVfX1t0eXBlXTtcblx0aWYgKCFsaXN0ZW5lcnMpIHJldHVybjtcblxuXHRpZiAodHlwZW9mIGxpc3RlbmVycyA9PT0gJ29iamVjdCcpIHtcblx0XHRsID0gYXJndW1lbnRzLmxlbmd0aDtcblx0XHRhcmdzID0gbmV3IEFycmF5KGwgLSAxKTtcblx0XHRmb3IgKGkgPSAxOyBpIDwgbDsgKytpKSBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcblxuXHRcdGxpc3RlbmVycyA9IGxpc3RlbmVycy5zbGljZSgpO1xuXHRcdGZvciAoaSA9IDA7IChsaXN0ZW5lciA9IGxpc3RlbmVyc1tpXSk7ICsraSkge1xuXHRcdFx0YXBwbHkuY2FsbChsaXN0ZW5lciwgdGhpcywgYXJncyk7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuXHRcdGNhc2UgMTpcblx0XHRcdGNhbGwuY2FsbChsaXN0ZW5lcnMsIHRoaXMpO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAyOlxuXHRcdFx0Y2FsbC5jYWxsKGxpc3RlbmVycywgdGhpcywgYXJndW1lbnRzWzFdKTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgMzpcblx0XHRcdGNhbGwuY2FsbChsaXN0ZW5lcnMsIHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcblx0XHRcdGJyZWFrO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRsID0gYXJndW1lbnRzLmxlbmd0aDtcblx0XHRcdGFyZ3MgPSBuZXcgQXJyYXkobCAtIDEpO1xuXHRcdFx0Zm9yIChpID0gMTsgaSA8IGw7ICsraSkge1xuXHRcdFx0XHRhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcblx0XHRcdH1cblx0XHRcdGFwcGx5LmNhbGwobGlzdGVuZXJzLCB0aGlzLCBhcmdzKTtcblx0XHR9XG5cdH1cbn07XG5cbm1ldGhvZHMgPSB7XG5cdG9uOiBvbixcblx0b25jZTogb25jZSxcblx0b2ZmOiBvZmYsXG5cdGVtaXQ6IGVtaXRcbn07XG5cbmRlc2NyaXB0b3JzID0ge1xuXHRvbjogZChvbiksXG5cdG9uY2U6IGQob25jZSksXG5cdG9mZjogZChvZmYpLFxuXHRlbWl0OiBkKGVtaXQpXG59O1xuXG5iYXNlID0gZGVmaW5lUHJvcGVydGllcyh7fSwgZGVzY3JpcHRvcnMpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBmdW5jdGlvbiAobykge1xuXHRyZXR1cm4gKG8gPT0gbnVsbCkgPyBjcmVhdGUoYmFzZSkgOiBkZWZpbmVQcm9wZXJ0aWVzKE9iamVjdChvKSwgZGVzY3JpcHRvcnMpO1xufTtcbmV4cG9ydHMubWV0aG9kcyA9IG1ldGhvZHM7XG4iXX0=
