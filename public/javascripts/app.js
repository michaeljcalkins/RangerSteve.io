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

},{"../lib/EventHandler":8,"../lib/GameConsts":10,"../lib/SocketEvents/SetEventHandlers":20,"../lib/Weapons":33,"../maps/HighRuleJungle":34}],3:[function(require,module,exports){
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

},{"../lib/CollisionHandler":7,"../lib/PlayerAngleHandler":14,"../lib/PlayerJumpHandler":17,"../lib/PlayerMovementHandler":18}],6:[function(require,module,exports){
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
    this.render = function () {
        game.debug.text('Active Bullets: ' + this.bullets.countLiving() + ' / ' + this.bullets.total, 32, 32);
    };
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
    // this.physics.arcade.collide(this.platforms, this.enemyBullets, (platform, bullet) => {
    //     bullet.kill()
    // }, null, this)

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

},{"event-emitter":49}],9:[function(require,module,exports){
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

},{"./Guid":12}],10:[function(require,module,exports){
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

},{"./EventHandler":8,"./GameConsts":10,"./InputHelpers":13}],18:[function(require,module,exports){
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

},{"../EventHandler":8,"./onBulletFired":21,"./onBulletRemoved":22,"./onMovePlayer":23,"./onPlayerDamaged":24,"./onPlayerHealthUpdate":25,"./onPlayerRespawn":26,"./onRemovePlayer":27,"./onSocketConnected":28,"./onSocketDisconnect":29,"./onUpdatePlayers":30}],21:[function(require,module,exports){
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

},{"../EventHandler":8}],25:[function(require,module,exports){
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

},{"../EventHandler":8}],26:[function(require,module,exports){
'use strict';

var _EventHandler = require('../EventHandler');

var _EventHandler2 = _interopRequireDefault(_EventHandler);

var _Weapons = require('../Weapons');

var _Weapons2 = _interopRequireDefault(_Weapons);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (data) {
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
};

},{"../EventHandler":8,"../Weapons":33}],27:[function(require,module,exports){
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

},{"../EventHandler":8,"../RemotePlayer":19}],31:[function(require,module,exports){
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

},{"../FireStandardBullet":9}],32:[function(require,module,exports){
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

},{"../FireStandardBullet":9}],33:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _AK = require('./AK47');

var _AK2 = _interopRequireDefault(_AK);

var _DesertEagle = require('./DesertEagle');

var _DesertEagle2 = _interopRequireDefault(_DesertEagle);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import M4A1 from './M4A1'
// import M500 from './M500'
// import Skorpion from './Skorpion'
// import AUG from './AUG'
// import RPG from './RPG'
// import P90 from './P90'
// import G43 from './G43'

exports.default = {
    AK47: _AK2.default,
    // Barrett,
    DesertEagle: _DesertEagle2.default
};
// import Barrett from './Barrett'

},{"./AK47":31,"./DesertEagle":32}],34:[function(require,module,exports){
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

},{}],35:[function(require,module,exports){
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

},{"es5-ext/object/assign":36,"es5-ext/object/is-callable":39,"es5-ext/object/normalize-options":43,"es5-ext/string/#/contains":46}],36:[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')() ? Object.assign : require('./shim');

},{"./is-implemented":37,"./shim":38}],37:[function(require,module,exports){
'use strict';

module.exports = function () {
	var assign = Object.assign,
	    obj;
	if (typeof assign !== 'function') return false;
	obj = { foo: 'raz' };
	assign(obj, { bar: 'dwa' }, { trzy: 'trzy' });
	return obj.foo + obj.bar + obj.trzy === 'razdwatrzy';
};

},{}],38:[function(require,module,exports){
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

},{"../keys":40,"../valid-value":45}],39:[function(require,module,exports){
// Deprecated

'use strict';

module.exports = function (obj) {
  return typeof obj === 'function';
};

},{}],40:[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')() ? Object.keys : require('./shim');

},{"./is-implemented":41,"./shim":42}],41:[function(require,module,exports){
'use strict';

module.exports = function () {
	try {
		Object.keys('primitive');
		return true;
	} catch (e) {
		return false;
	}
};

},{}],42:[function(require,module,exports){
'use strict';

var keys = Object.keys;

module.exports = function (object) {
	return keys(object == null ? object : Object(object));
};

},{}],43:[function(require,module,exports){
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

},{}],44:[function(require,module,exports){
'use strict';

module.exports = function (fn) {
	if (typeof fn !== 'function') throw new TypeError(fn + " is not a function");
	return fn;
};

},{}],45:[function(require,module,exports){
'use strict';

module.exports = function (value) {
	if (value == null) throw new TypeError("Cannot use null or undefined");
	return value;
};

},{}],46:[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')() ? String.prototype.contains : require('./shim');

},{"./is-implemented":47,"./shim":48}],47:[function(require,module,exports){
'use strict';

var str = 'razdwatrzy';

module.exports = function () {
	if (typeof str.contains !== 'function') return false;
	return str.contains('dwa') === true && str.contains('foo') === false;
};

},{}],48:[function(require,module,exports){
'use strict';

var indexOf = String.prototype.indexOf;

module.exports = function (searchString /*, position*/) {
	return indexOf.call(this, searchString, arguments[1]) > -1;
};

},{}],49:[function(require,module,exports){
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

},{"d":35,"es5-ext/object/valid-callable":44}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvYXBwLmpzIiwiYXNzZXRzL2pzL2NvcmUvQ3JlYXRlLmpzIiwiYXNzZXRzL2pzL2NvcmUvSW5pdC5qcyIsImFzc2V0cy9qcy9jb3JlL1ByZWxvYWQuanMiLCJhc3NldHMvanMvY29yZS9VcGRhdGUuanMiLCJhc3NldHMvanMvZ2FtZS5qcyIsImFzc2V0cy9qcy9saWIvQ29sbGlzaW9uSGFuZGxlci5qcyIsImFzc2V0cy9qcy9saWIvRXZlbnRIYW5kbGVyLmpzIiwiYXNzZXRzL2pzL2xpYi9GaXJlU3RhbmRhcmRCdWxsZXQuanMiLCJhc3NldHMvanMvbGliL0dhbWVDb25zdHMuanMiLCJhc3NldHMvanMvbGliL0dldFF1ZXJ5U3RyaW5nLmpzIiwiYXNzZXRzL2pzL2xpYi9HdWlkLmpzIiwiYXNzZXRzL2pzL2xpYi9JbnB1dEhlbHBlcnMuanMiLCJhc3NldHMvanMvbGliL1BsYXllckFuZ2xlSGFuZGxlci5qcyIsImFzc2V0cy9qcy9saWIvUGxheWVyQnlJZC5qcyIsImFzc2V0cy9qcy9saWIvUGxheWVyRmFjZUhhbmRsZXIuanMiLCJhc3NldHMvanMvbGliL1BsYXllckp1bXBIYW5kbGVyLmpzIiwiYXNzZXRzL2pzL2xpYi9QbGF5ZXJNb3ZlbWVudEhhbmRsZXIuanMiLCJhc3NldHMvanMvbGliL1JlbW90ZVBsYXllci5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL1NldEV2ZW50SGFuZGxlcnMuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vbkJ1bGxldEZpcmVkLmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvb25CdWxsZXRSZW1vdmVkLmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvb25Nb3ZlUGxheWVyLmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvb25QbGF5ZXJEYW1hZ2VkLmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvb25QbGF5ZXJIZWFsdGhVcGRhdGUuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vblBsYXllclJlc3Bhd24uanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vblJlbW92ZVBsYXllci5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL29uU29ja2V0Q29ubmVjdGVkLmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvb25Tb2NrZXREaXNjb25uZWN0LmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvb25VcGRhdGVQbGF5ZXJzLmpzIiwiYXNzZXRzL2pzL2xpYi9XZWFwb25zL0FLNDcuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvRGVzZXJ0RWFnbGUuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvaW5kZXguanMiLCJhc3NldHMvanMvbWFwcy9IaWdoUnVsZUp1bmdsZS5qcyIsIm5vZGVfbW9kdWxlcy9kL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2VzNS1leHQvb2JqZWN0L2Fzc2lnbi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L29iamVjdC9hc3NpZ24vaXMtaW1wbGVtZW50ZWQuanMiLCJub2RlX21vZHVsZXMvZXM1LWV4dC9vYmplY3QvYXNzaWduL3NoaW0uanMiLCJub2RlX21vZHVsZXMvZXM1LWV4dC9vYmplY3QvaXMtY2FsbGFibGUuanMiLCJub2RlX21vZHVsZXMvZXM1LWV4dC9vYmplY3Qva2V5cy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L29iamVjdC9rZXlzL2lzLWltcGxlbWVudGVkLmpzIiwibm9kZV9tb2R1bGVzL2VzNS1leHQvb2JqZWN0L2tleXMvc2hpbS5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L29iamVjdC9ub3JtYWxpemUtb3B0aW9ucy5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L29iamVjdC92YWxpZC1jYWxsYWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L29iamVjdC92YWxpZC12YWx1ZS5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L3N0cmluZy8jL2NvbnRhaW5zL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2VzNS1leHQvc3RyaW5nLyMvY29udGFpbnMvaXMtaW1wbGVtZW50ZWQuanMiLCJub2RlX21vZHVsZXMvZXM1LWV4dC9zdHJpbmcvIy9jb250YWlucy9zaGltLmpzIiwibm9kZV9tb2R1bGVzL2V2ZW50LWVtaXR0ZXIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLE9BQU8sT0FBUCxHQUFpQjtBQUNiLG1CQUFlLEtBQWY7QUFDQSxhQUFTLEtBQVQ7QUFDQSxtQkFBZSxLQUFmO0FBQ0EsbUJBQWUsS0FBZjtBQUNBLHFCQUFpQixrQkFBakI7QUFDQSx5QkFBcUIsS0FBckI7QUFDQSxlQUFXLElBQVg7QUFDQSxvQkFBZ0IsS0FBaEI7QUFDQSxvQkFBZ0IsTUFBaEI7QUFDQSxlQUFXLE1BQVg7QUFDQSx1QkFBbUIsTUFBbkI7QUFDQSxrQkFBYyxPQUFkO0FBQ0Esa0JBQWMsUUFBZDtBQUNBLGtCQUFjLFFBQWQ7QUFDQSxrQkFBYyxTQUFkO0NBZko7OztBQW1CQSxRQUFRLFFBQVI7Ozs7Ozs7O2tCQ2J3Qjs7QUFOeEI7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRWUsU0FBUyxNQUFULEdBQWtCOzs7QUFDN0IsU0FBSyxNQUFMLEdBQWMsR0FBRyxPQUFILEVBQWQsQ0FENkI7QUFFN0IsU0FBSyxPQUFMLEdBQWUsRUFBZixDQUY2QjtBQUc3QixTQUFLLE1BQUwsR0FBYyxxQkFBVyxlQUFYLENBSGU7QUFJN0IsU0FBSyxZQUFMLEdBQW9CLEtBQUssSUFBTCxDQUFVLEdBQVYsQ0FBYyxLQUFkLEVBQXBCOzs7QUFKNkIsUUFPN0IsQ0FBSyxPQUFMLENBQWEsV0FBYixDQUF5QixPQUFPLE9BQVAsQ0FBZSxNQUFmLENBQXpCLENBUDZCOztBQVM3QixTQUFLLEtBQUwsQ0FBVyxTQUFYLENBQXFCLENB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QWpCLENBRkQ7QUFHQyxTQUFLLElBQUksQ0FBSixFQUFPLElBQUksQ0FBSixFQUFPLEVBQUUsQ0FBRixFQUFLO0FBQ3ZCLFVBQUssSUFBSSxDQUFKLENBQUwsR0FBYyxVQUFVLENBQVYsQ0FBZCxDQUR1QjtLQUF4QjtBQUdBLFVBQU0sSUFBTixDQUFXLFNBQVgsRUFBc0IsSUFBdEIsRUFBNEIsSUFBNUIsRUFORDtBQVZBLEdBRE07RUFUUDtDQVBNOztBQXNDUCxVQUFVO0FBQ1QsS0FBSSxFQUFKO0FBQ0EsT0FBTSxNQUFOO0FBQ0EsTUFBSyxHQUFMO0FBQ0EsT0FBTSxJQUFOO0NBSkQ7O0FBT0EsY0FBYztBQUNiLEtBQUksRUFBRSxFQUFGLENBQUo7QUFDQSxPQUFNLEVBQUUsTUFBRixDQUFOO0FBQ0EsTUFBSyxFQUFFLEdBQUYsQ0FBTDtBQUNBLE9BQU0sRUFBRSxJQUFGLENBQU47Q0FKRDs7QUFPQSxPQUFPLGlCQUFpQixFQUFqQixFQUFxQixXQUFyQixDQUFQOztBQUVBLE9BQU8sT0FBUCxHQUFpQixVQUFVLGlCQUFVLENBQVYsRUFBYTtBQUN2QyxRQUFPLENBQUMsSUFBSyxJQUFMLEdBQWEsT0FBTyxJQUFQLENBQWQsR0FBNkIsaUJBQWlCLE9BQU8sQ0FBUCxDQUFqQixFQUE0QixXQUE1QixDQUE3QixDQURnQztDQUFiO0FBRzNCLFFBQVEsT0FBUixHQUFrQixPQUFsQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ0b2FzdHIub3B0aW9ucyA9IHtcbiAgICBcImNsb3NlQnV0dG9uXCI6IGZhbHNlLFxuICAgIFwiZGVidWdcIjogZmFsc2UsXG4gICAgXCJuZXdlc3RPblRvcFwiOiBmYWxzZSxcbiAgICBcInByb2dyZXNzQmFyXCI6IGZhbHNlLFxuICAgIFwicG9zaXRpb25DbGFzc1wiOiBcInRvYXN0LXRvcC1jZW50ZXJcIixcbiAgICBcInByZXZlbnREdXBsaWNhdGVzXCI6IGZhbHNlLFxuICAgIFwib25jbGlja1wiOiBudWxsLFxuICAgIFwic2hvd0R1cmF0aW9uXCI6IFwiMzAwXCIsXG4gICAgXCJoaWRlRHVyYXRpb25cIjogXCIxMDAwXCIsXG4gICAgXCJ0aW1lT3V0XCI6IFwiMzAwMFwiLFxuICAgIFwiZXh0ZW5kZWRUaW1lT3V0XCI6IFwiMTAwMFwiLFxuICAgIFwic2hvd0Vhc2luZ1wiOiBcInN3aW5nXCIsXG4gICAgXCJoaWRlRWFzaW5nXCI6IFwibGluZWFyXCIsXG4gICAgXCJzaG93TWV0aG9kXCI6IFwiZmFkZUluXCIsXG4gICAgXCJoaWRlTWV0aG9kXCI6IFwiZmFkZU91dFwiXG59XG5cbi8vIHJlcXVpcmUoJy4vdWknKVxucmVxdWlyZSgnLi9nYW1lJylcbiIsImltcG9ydCBHYW1lQ29uc3RzIGZyb20gJy4uL2xpYi9HYW1lQ29uc3RzJ1xuaW1wb3J0IFNldEV2ZW50SGFuZGxlcnMgZnJvbSAnLi4vbGliL1NvY2tldEV2ZW50cy9TZXRFdmVudEhhbmRsZXJzJ1xuaW1wb3J0IEV2ZW50SGFuZGxlciBmcm9tICcuLi9saWIvRXZlbnRIYW5kbGVyJ1xuaW1wb3J0IEhpZ2hSdWxlSnVuZ2xlIGZyb20gJy4uL21hcHMvSGlnaFJ1bGVKdW5nbGUnXG5pbXBvcnQgV2VhcG9ucyBmcm9tICcuLi9saWIvV2VhcG9ucydcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQ3JlYXRlKCkge1xuICAgIHRoaXMuc29ja2V0ID0gaW8uY29ubmVjdCgpXG4gICAgdGhpcy5lbmVtaWVzID0gW11cbiAgICB0aGlzLnZvbHVtZSA9IEdhbWVDb25zdHMuU1RBUlRJTkdfVk9MVU1FXG4gICAgdGhpcy5lbmVteUJ1bGxldHMgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKClcblxuICAgIC8vICBXZSdyZSBnb2luZyB0byBiZSB1c2luZyBwaHlzaWNzLCBzbyBlbmFibGUgdGhlIEFyY2FkZSBQaHlzaWNzIHN5c3RlbVxuICAgIHRoaXMucGh5c2ljcy5zdGFydFN5c3RlbShQaGFzZXIuUGh5c2ljcy5BUkNBREUpXG5cbiAgICB0aGlzLndvcmxkLnNldEJvdW5kcygwLCAwLCBHYW1lQ29uc3RzLldPUkxEX1dJRFRILCBHYW1lQ29uc3RzLldPUkxEX0hFSUdIVClcblxuICAgIC8vIFNjYWxlIGdhbWUgb24gd2luZG93IHJlc2l6ZVxuICAgIHRoaXMuZ2FtZS5zY2FsZS5zY2FsZU1vZGUgPSBQaGFzZXIuU2NhbGVNYW5hZ2VyLlJFU0laRVxuICAgIHRoaXMuZ2FtZS5zY2FsZS5zZXRTaG93QWxsKClcbiAgICB0aGlzLmdhbWUuc2NhbGUucmVmcmVzaCgpXG5cblxuICAgIC8qKlxuICAgICAqIE1hcFxuICAgICAqL1xuICAgIHRoaXMubWFwSW5zdGFuY2UgPSBuZXcgSGlnaFJ1bGVKdW5nbGUodGhpcylcbiAgICB0aGlzLm1hcEluc3RhbmNlLmNyZWF0ZSgpXG5cblxuICAgIC8qKlxuICAgICAqIEJ1bGxldCBTZXR0aW5nc1xuICAgICAqL1xuICAgIHRoaXMuYnVsbGV0cyA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKVxuICAgIHRoaXMuYnVsbGV0cy5lbmFibGVCb2R5ID0gdHJ1ZVxuICAgIHRoaXMucGh5c2ljc0JvZHlUeXBlID0gUGhhc2VyLlBoeXNpY3MuQVJDQURFXG4gICAgdGhpcy5idWxsZXRzLmNyZWF0ZU11bHRpcGxlKDUwLCAnYnVsbGV0MTInKVxuICAgIHRoaXMuYnVsbGV0cy5zZXRBbGwoJ2NoZWNrV29ybGRCb3VuZHMnLCB0cnVlKVxuICAgIHRoaXMuYnVsbGV0cy5zZXRBbGwoJ291dE9mQm91bmRzS2lsbCcsIHRydWUpXG5cblxuICAgIC8qKlxuICAgICAqIFBsYXllciBTZXR0aW5nc1xuICAgICAqL1xuICAgIGxldCBzcGF3blBvaW50ID0gdGhpcy5tYXBJbnN0YW5jZS5nZXRSYW5kb21TcGF3blBvaW50KClcbiAgICB0aGlzLnBsYXllciA9IHRoaXMuYWRkLnNwcml0ZShzcGF3blBvaW50LngsIHNwYXduUG9pbnQueSwgJ2NvbW1hbmRvJylcbiAgICB0aGlzLnBsYXllci5zY2FsZS5zZXRUbyhHYW1lQ29uc3RzLlBMQVlFUl9TQ0FMRSlcbiAgICB0aGlzLnBsYXllci5hbmNob3Iuc2V0VG8oR2FtZUNvbnN0cy5QTEFZRVJfQU5DSE9SKVxuXG4gICAgLy8gIFdlIG5lZWQgdG8gZW5hYmxlIHBoeXNpY3Mgb24gdGhlIHBsYXllclxuICAgIHRoaXMucGh5c2ljcy5hcmNhZGUuZW5hYmxlKHRoaXMucGxheWVyKVxuXG4gICAgLy8gRW5hYmxlIHBoeXNpY3Mgb24gdGhlIHBsYXllclxuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmVuYWJsZSh0aGlzLnBsYXllciwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKVxuXG4gICAgLy8gTWFrZSBwbGF5ZXIgY29sbGlkZSB3aXRoIHdvcmxkIGJvdW5kYXJpZXMgc28gaGUgZG9lc24ndCBsZWF2ZSB0aGUgc3RhZ2VcbiAgICB0aGlzLnBsYXllci5ib2R5LmNvbGxpZGVXb3JsZEJvdW5kcyA9IHRydWVcblxuICAgIC8vIFNldCBwbGF5ZXIgbWluaW11bSBhbmQgbWF4aW11bSBtb3ZlbWVudCBzcGVlZFxuICAgIHRoaXMucGxheWVyLmJvZHkubWF4VmVsb2NpdHkuc2V0VG8oR2FtZUNvbnN0cy5NQVhfU1BFRUQsIEdhbWVDb25zdHMuTUFYX1NQRUVEICogMTApIC8vIHgsIHlcblxuICAgIC8vIEFkZCBkcmFnIHRvIHRoZSBwbGF5ZXIgdGhhdCBzbG93cyB0aGVtIGRvd24gd2hlbiB0aGV5IGFyZSBub3QgYWNjZWxlcmF0aW5nXG4gICAgdGhpcy5wbGF5ZXIuYm9keS5kcmFnLnNldFRvKEdhbWVDb25zdHMuRFJBRywgMCkgLy8geCwgeVxuICAgIHRoaXMucGxheWVyLmJvZHkuc2V0U2l6ZSgyMzAsIDI5MCwgLTEwLCAwKVxuICAgIHRoaXMucGxheWVyLm1ldGEgPSB7XG4gICAgICAgIGhlYWx0aDogMTAwXG4gICAgfVxuXG4gICAgLy8gU2luY2Ugd2UncmUganVtcGluZyB3ZSBuZWVkIGdyYXZpdHlcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZ3Jhdml0eS55ID0gR2FtZUNvbnN0cy5HUkFWSVRZXG5cbiAgICAvLyBGbGFnIHRvIHRyYWNrIGlmIHRoZSBqdW1wIGJ1dHRvbiBpcyBwcmVzc2VkXG4gICAgdGhpcy5qdW1waW5nID0gZmFsc2VcblxuICAgIC8vICBPdXIgdHdvIGFuaW1hdGlvbnMsIHdhbGtpbmcgbGVmdCBhbmQgcmlnaHQuXG4gICAgdGhpcy5wbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ2xlZnQnLCBHYW1lQ29uc3RzLkFOSU1BVElPTl9MRUZULCBHYW1lQ29uc3RzLkFOSU1BVElPTl9GUkFNRVJBVEUsIHRydWUpXG4gICAgdGhpcy5wbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ3JpZ2h0JywgR2FtZUNvbnN0cy5BTklNQVRJT05fUklHSFQsIEdhbWVDb25zdHMuQU5JTUFUSU9OX0ZSQU1FUkFURSwgdHJ1ZSlcblxuICAgIHRoaXMucGxheWVyLm1ldGEgPSB7XG4gICAgICAgIGhlYWx0aDogMTAwLFxuICAgICAgICBwcmltYXJ5V2VhcG9uOiBuZXcgV2VhcG9ucy5BSzQ3KHRoaXMpLFxuICAgICAgICBzZWNvbmRhcnlXZWFwb246IG5ldyBXZWFwb25zLkRlc2VydEVhZ2xlKHRoaXMpLFxuICAgICAgICBzZWxlY3RlZFByaW1hcnlXZWFwb25JZDogJ0FLNDcnLFxuICAgICAgICBzZWxlY3RlZFNlY29uZGFyeVdlYXBvbklkOiAnRGVzZXJ0RWFnbGUnXG4gICAgfVxuXG4gICAgdGhpcy5wbGF5ZXIubWV0YS5wcmltYXJ5V2VhcG9uLmlkID0gJ0FLNDcnXG4gICAgdGhpcy5wbGF5ZXIubWV0YS5zZWNvbmRhcnlXZWFwb24uaWQgPSAnRGVzZXJ0RWFnbGUnXG5cbiAgICB0aGlzLmxlZnRBcm1Hcm91cCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKVxuICAgIHRoaXMucmlnaHRBcm1Hcm91cCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKVxuICAgIHRoaXMuaGVhZEdyb3VwID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpXG4gICAgdGhpcy50b3Jzb0dyb3VwID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpXG5cbiAgICAvLyBUb3Jzb1xuICAgIHRoaXMudG9yc29TcHJpdGUgPSB0aGlzLmdhbWUuYWRkLnNwcml0ZSgtMzcsIC0xMDUsICd0b3JzbycpXG4gICAgdGhpcy50b3Jzb1Nwcml0ZS5zY2FsZS5zZXRUbygxLjgpXG4gICAgdGhpcy50b3Jzb0dyb3VwLmFkZCh0aGlzLnRvcnNvU3ByaXRlKVxuXG4gICAgLy8gSGVhZFxuICAgIHRoaXMuaGVhZFNwcml0ZSA9IHRoaXMuZ2FtZS5hZGQuc3ByaXRlKDAsIC0xNDgsICdoZWFkJylcbiAgICB0aGlzLmhlYWRTcHJpdGUuc2NhbGUuc2V0VG8oMS44KVxuICAgIHRoaXMuaGVhZEdyb3VwLmFkZCh0aGlzLmhlYWRTcHJpdGUpXG5cbiAgICAvLyBMZWZ0IGFybVxuICAgIHRoaXMubGVmdEFybVNwcml0ZSA9IHRoaXMuZ2FtZS5hZGQuc3ByaXRlKDAsIDAsICdsZWZ0LWFybScpXG4gICAgdGhpcy5sZWZ0QXJtU3ByaXRlLmFuY2hvci5zZXRUbyguMiwgLjIpXG4gICAgdGhpcy5sZWZ0QXJtU3ByaXRlLnNjYWxlLnNldFRvKDEuNilcbiAgICB0aGlzLmxlZnRBcm1TcHJpdGUucm90YXRpb24gPSA4MC4xXG4gICAgdGhpcy5sZWZ0QXJtR3JvdXAuYWRkKHRoaXMubGVmdEFybVNwcml0ZSlcblxuICAgIC8vIEd1blxuICAgIHRoaXMuYWs0N1Nwcml0ZSA9IHRoaXMuZ2FtZS5hZGQuc3ByaXRlKDEyLCAxOSwgJ0FLNDcnKVxuICAgIHRoaXMuYWs0N1Nwcml0ZS5zY2FsZS5zZXRUbygxLjMpXG4gICAgdGhpcy5hazQ3U3ByaXRlLnJvdGF0aW9uID0gODAuMTVcblxuICAgIC8vIFJpZ2h0IGFybVxuICAgIHRoaXMucmlnaHRBcm1Hcm91cC5hZGQodGhpcy5hazQ3U3ByaXRlKVxuICAgIHRoaXMucmlnaHRBcm1TcHJpdGUgPSB0aGlzLmdhbWUuYWRkLnNwcml0ZSgwLCAwLCAncmlnaHQtYXJtJylcbiAgICB0aGlzLnJpZ2h0QXJtU3ByaXRlLmFuY2hvci5zZXRUbyguMiwgLjI0KVxuICAgIHRoaXMucmlnaHRBcm1TcHJpdGUuc2NhbGUuc2V0VG8oMS43KVxuICAgIHRoaXMucmlnaHRBcm1TcHJpdGUucm90YXRpb24gPSA4MC4xXG4gICAgdGhpcy5yaWdodEFybUdyb3VwLmFkZCh0aGlzLnJpZ2h0QXJtU3ByaXRlKVxuXG4gICAgdGhpcy5wbGF5ZXIuYWRkQ2hpbGQodGhpcy5sZWZ0QXJtR3JvdXApXG4gICAgdGhpcy5sZWZ0QXJtR3JvdXAucGl2b3QueCA9IDBcbiAgICB0aGlzLmxlZnRBcm1Hcm91cC5waXZvdC55ID0gMFxuICAgIHRoaXMubGVmdEFybUdyb3VwLnggPSA0NVxuICAgIHRoaXMubGVmdEFybUdyb3VwLnkgPSAtNzBcblxuICAgIHRoaXMucGxheWVyLmFkZENoaWxkKHRoaXMudG9yc29Hcm91cClcbiAgICB0aGlzLnBsYXllci5hZGRDaGlsZCh0aGlzLmhlYWRHcm91cClcblxuICAgIHRoaXMucGxheWVyLmFkZENoaWxkKHRoaXMucmlnaHRBcm1Hcm91cClcbiAgICB0aGlzLnJpZ2h0QXJtR3JvdXAucGl2b3QueCA9IDBcbiAgICB0aGlzLnJpZ2h0QXJtR3JvdXAucGl2b3QueSA9IDBcbiAgICB0aGlzLnJpZ2h0QXJtR3JvdXAueCA9IC0yNVxuICAgIHRoaXMucmlnaHRBcm1Hcm91cC55ID0gLTY1XG5cblxuICAgIC8qKlxuICAgICAqIFdlYXBvbnNcbiAgICAgKi9cbiAgICB0aGlzLmN1cnJlbnRXZWFwb24gPSAncHJpbWFyeVdlYXBvbidcblxuXG4gICAgLyoqXG4gICAgICogVGV4dFxuICAgICAqL1xuICAgIGxldCB0ZXh0U3R5bGVzID0geyBmb250U2l6ZTogJzE0cHgnLCBmaWxsOiAnIzAwMCcgfVxuXG4gICAgRXZlbnRIYW5kbGVyLmVtaXQoJ3Njb3JlIHVwZGF0ZScsICcnKVxuICAgIEV2ZW50SGFuZGxlci5lbWl0KCdoZWFsdGggdXBkYXRlJywgJycpXG4gICAgRXZlbnRIYW5kbGVyLm9uKCd2b2x1bWUgdXBkYXRlJywgKGRhdGEpID0+IHtcbiAgICAgICAgdGhpcy52b2x1bWUgPSBkYXRhLnZvbHVtZVxuICAgIH0pXG5cbiAgICBFdmVudEhhbmRsZXIub24oJ3ByaW1hcnkgd2VhcG9uIHVwZGF0ZScsICh3ZWFwb24pID0+IHtcbiAgICAgICAgdGhpcy5wbGF5ZXIubWV0YS5zZWxlY3RlZFByaW1hcnlXZWFwb25JZCA9IHdlYXBvbi5pZFxuICAgIH0pXG5cbiAgICBFdmVudEhhbmRsZXIub24oJ3NlY29uZGFyeSB3ZWFwb24gdXBkYXRlJywgKHdlYXBvbikgPT4ge1xuICAgICAgICB0aGlzLnBsYXllci5tZXRhLnNlbGVjdGVkU2Vjb25kYXJ5V2VhcG9uSWQgPSB3ZWFwb24uaWRcbiAgICB9KVxuXG4gICAgdGhpcy5wb3NpdGlvblRleHQgPSB0aGlzLmFkZC50ZXh0KDI1LCAyNSwgYCR7dGhpcy5nYW1lLmlucHV0Lm1vdXNlUG9pbnRlci54fSwke3RoaXMuZ2FtZS5pbnB1dC5tb3VzZVBvaW50ZXIueX1gLCB0ZXh0U3R5bGVzKVxuICAgIHRoaXMucG9zaXRpb25UZXh0LmZpeGVkVG9DYW1lcmEgPSB0cnVlXG5cblxuICAgIC8qKlxuICAgICAqIENhbWVyYSBTZXR0aW5nc1xuICAgICAqL1xuICAgIHRoaXMuY2FtZXJhLmZvbGxvdyh0aGlzLnBsYXllcilcblxuXG4gICAgLyoqXG4gICAgICogUmVzaXppbmcgRXZlbnRzXG4gICAgICovXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICgpID0+IHtcbiAgICAgICAgdGhpcy5nYW1lLnNjYWxlLnJlZnJlc2goKVxuICAgICAgICB0aGlzLmdhbWUuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0XG4gICAgICAgIHRoaXMuZ2FtZS53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXG4gICAgfSlcblxuXG4gICAgLyoqXG4gICAgICogS2V5Ym9hcmQgRXZlbnRzXG4gICAgICovXG4gICAgLy8gT3BlbiBzZXR0aW5ncyBtb2RhbFxuICAgIHRoaXMuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5UQUIpLm9uRG93bi5hZGQoZnVuY3Rpb24oKSB7XG4gICAgICAgIEV2ZW50SGFuZGxlci5lbWl0KCdzZXR0aW5ncyBvcGVuJylcbiAgICB9KVxuXG4gICAgLy8gU3dpdGNoIHdlYXBvbnNcbiAgICB0aGlzLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuUSkub25Eb3duLmFkZCgoKSA9PiB7XG4gICAgICAgIHRoaXMuY3VycmVudFdlYXBvbiA9IHRoaXMuY3VycmVudFdlYXBvbiA9PT0gJ3ByaW1hcnlXZWFwb24nXG4gICAgICAgICAgICA/ICdzZWNvbmRhcnlXZWFwb24nXG4gICAgICAgICAgICA6ICdwcmltYXJ5V2VhcG9uJ1xuICAgICAgICB0aGlzLmFrNDdTcHJpdGUubG9hZFRleHR1cmUodGhpcy5wbGF5ZXIubWV0YVt0aGlzLmN1cnJlbnRXZWFwb25dLmlkKVxuICAgIH0pXG5cblxuICAgIC8qKlxuICAgICAqIFN0YXJ0IGxpc3RlbmluZyBmb3IgZXZlbnRzXG4gICAgICovXG4gICAgU2V0RXZlbnRIYW5kbGVycy5jYWxsKHRoaXMpXG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBJbml0KCkge1xuICAgIHRoaXMuZ2FtZS5yZW5kZXJlci5yZW5kZXJTZXNzaW9uLnJvdW5kUGl4ZWxzID0gdHJ1ZVxuICAgIHRoaXMuZ2FtZS5zdGFnZS5kaXNhYmxlVmlzaWJpbGl0eUNoYW5nZSA9IHRydWVcbn1cbiIsImltcG9ydCBHYW1lQ29uc3RzIGZyb20gJy4uL2xpYi9HYW1lQ29uc3RzJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBQcmVsb2FkKCkge1xuICAgIHRoaXMubG9hZC5pbWFnZSgnbWFwLWJnJywgJy9pbWFnZXMvaGlnaC1ydWxlLWRlc2VydC5wbmcnKVxuICAgIHRoaXMubG9hZC5pbWFnZSgnZ3JvdW5kJywgJy9pbWFnZXMvcGxhdGZvcm0ucG5nJylcbiAgICB0aGlzLmxvYWQuaW1hZ2UoJ2J1bGxldDEyJywgJy9pbWFnZXMvYnVsbGV0LnBuZycpXG5cbiAgICB0aGlzLmxvYWQuc3ByaXRlc2hlZXQoJ2R1ZGUnLCAnL2ltYWdlcy9kdWRlLnBuZycsIDMyLCA0OClcbiAgICB0aGlzLmxvYWQuc3ByaXRlc2hlZXQoJ2NvbW1hbmRvJywgJy9pbWFnZXMvY29tbWFuZG8ucG5nJywgMzAwLCAzMTUpXG4gICAgdGhpcy5sb2FkLnNwcml0ZXNoZWV0KCdlbmVteScsICcvaW1hZ2VzL2R1ZGUucG5nJywgMzIsIDQ4KVxuXG4gICAgLy8gV2VhcG9uc1xuICAgIEdhbWVDb25zdHMuUFJJTUFSWV9XRUFQT05TLmZvckVhY2goKHdlYXBvbikgPT4ge1xuICAgICAgICB0aGlzLmxvYWQuaW1hZ2Uod2VhcG9uLmlkLCB3ZWFwb24uaW1hZ2UpXG4gICAgfSlcblxuICAgIEdhbWVDb25zdHMuU0VDT05EQVJZX1dFQVBPTlMuZm9yRWFjaCgod2VhcG9uKSA9PiB7XG4gICAgICAgIHRoaXMubG9hZC5pbWFnZSh3ZWFwb24uaWQsIHdlYXBvbi5pbWFnZSlcbiAgICB9KVxuXG4gICAgdGhpcy5sb2FkLmltYWdlKCdyaWdodC1hcm0nLCAnL2ltYWdlcy9ib2R5L3JpZ2h0LWFybS5wbmcnKVxuICAgIHRoaXMubG9hZC5pbWFnZSgnbGVmdC1hcm0nLCAnL2ltYWdlcy9ib2R5L2xlZnQtYXJtLnBuZycpXG4gICAgdGhpcy5sb2FkLmltYWdlKCdoZWFkJywgJy9pbWFnZXMvYm9keS9oZWFkLnBuZycpXG4gICAgdGhpcy5sb2FkLmltYWdlKCd0b3JzbycsICcvaW1hZ2VzL2JvZHkvdG9yc28ucG5nJylcblxuICAgIHRoaXMubG9hZC5hdWRpbygnQUs0Ny1zb3VuZCcsICcvYXVkaW8vQUs0Ny5vZ2cnKVxuICAgIHRoaXMubG9hZC5hdWRpbygnTTUwMC1zb3VuZCcsICcvYXVkaW8vTTUwMC5vZ2cnKVxuICAgIHRoaXMubG9hZC5hdWRpbygnU2tvcnBpb24tc291bmQnLCAnL2F1ZGlvL1Nrb3JwaW9uLm9nZycpXG4gICAgdGhpcy5sb2FkLmF1ZGlvKCdBVUctc291bmQnLCAnL2F1ZGlvL0FVRy5vZ2cnKVxuICAgIHRoaXMubG9hZC5hdWRpbygnRzQzLXNvdW5kJywgJy9hdWRpby9HNDMub2dnJylcbiAgICB0aGlzLmxvYWQuYXVkaW8oJ1A5MC1zb3VuZCcsICcvYXVkaW8vUDkwLm9nZycpXG4gICAgdGhpcy5sb2FkLmF1ZGlvKCdNNEExLXNvdW5kJywgJy9hdWRpby9NNEExLm9nZycpXG4gICAgdGhpcy5sb2FkLmF1ZGlvKCdCYXJyZXRNOTAtc291bmQnLCAnL2F1ZGlvL0JhcnJldE05MC5vZ2cnKVxuXG4gICAgdGhpcy5sb2FkLmF1ZGlvKCdEZXNlcnRFYWdsZS1zb3VuZCcsICcvYXVkaW8vRGVzZXJ0RWFnbGUub2dnJylcbiAgICB0aGlzLmxvYWQuYXVkaW8oJ1JQRy1zb3VuZCcsICcvYXVkaW8vUlBHLm9nZycpXG59XG4iLCJpbXBvcnQgQ29sbGlzaW9uSGFuZGxlciBmcm9tICcuLi9saWIvQ29sbGlzaW9uSGFuZGxlcidcbmltcG9ydCBQbGF5ZXJNb3ZlbWVudEhhbmRsZXIgZnJvbSAnLi4vbGliL1BsYXllck1vdmVtZW50SGFuZGxlcidcbmltcG9ydCBQbGF5ZXJKdW1wSGFuZGxlciBmcm9tICcuLi9saWIvUGxheWVySnVtcEhhbmRsZXInXG5pbXBvcnQgUGxheWVyQW5nbGVIYW5kbGVyIGZyb20gJy4uL2xpYi9QbGF5ZXJBbmdsZUhhbmRsZXInXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFVwZGF0ZSgpIHtcbiAgICBDb2xsaXNpb25IYW5kbGVyLmNhbGwodGhpcylcbiAgICBQbGF5ZXJNb3ZlbWVudEhhbmRsZXIuY2FsbCh0aGlzKVxuICAgIFBsYXllckp1bXBIYW5kbGVyLmNhbGwodGhpcylcbiAgICBQbGF5ZXJBbmdsZUhhbmRsZXIuY2FsbCh0aGlzKVxuXG4gICAgaWYgKHRoaXMuZ2FtZS5pbnB1dC5hY3RpdmVQb2ludGVyLmlzRG93bilcbiAgICB7XG4gICAgICAgIHRoaXMucGxheWVyLm1ldGFbdGhpcy5jdXJyZW50V2VhcG9uXS5maXJlKClcbiAgICB9XG5cbiAgICB0aGlzLnBvc2l0aW9uVGV4dC50ZXh0ID0gYCR7dGhpcy5nYW1lLmlucHV0LndvcmxkWH0sICR7dGhpcy5nYW1lLmlucHV0LndvcmxkWX1gXG5cbiAgICAvLyBDaGVjayBmb3Igb3V0IG9mIGJvdW5kcyBraWxsXG4gICAgaWYgKHRoaXMucGxheWVyLmJvZHkub25GbG9vcigpKSB7XG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ3BsYXllciBkYW1hZ2VkJywge1xuICAgICAgICAgICAgcm9vbUlkOiB0aGlzLnJvb21JZCxcbiAgICAgICAgICAgIGRhbWFnZTogMTAwMCxcbiAgICAgICAgICAgIGRhbWFnZWRQbGF5ZXJJZDogJy8jJyArIHRoaXMuc29ja2V0LmlkLFxuICAgICAgICAgICAgYXR0YWNraW5nUGxheWVySWQ6IG51bGxcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICB0aGlzLnNvY2tldC5lbWl0KCdtb3ZlIHBsYXllcicsIHtcbiAgICAgICAgcm9vbUlkOiB0aGlzLnJvb21JZCxcbiAgICAgICAgeDogdGhpcy5wbGF5ZXIueCxcbiAgICAgICAgeTogdGhpcy5wbGF5ZXIueVxuICAgIH0pXG59XG4iLCJpbXBvcnQgaW5pdCBmcm9tICcuL2NvcmUvSW5pdCdcbmltcG9ydCBwcmVsb2FkIGZyb20gJy4vY29yZS9QcmVsb2FkJ1xuaW1wb3J0IHVwZGF0ZSBmcm9tICcuL2NvcmUvVXBkYXRlJ1xuaW1wb3J0IGNyZWF0ZSBmcm9tICcuL2NvcmUvQ3JlYXRlJ1xuXG5jb25zdCBnYW1lV2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aFxuY29uc3QgZ2FtZUhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodFxubGV0IGdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoZ2FtZVdpZHRoLCBnYW1lSGVpZ2h0LCBQaGFzZXIuQVVUTywgJ3Jhbmdlci1zdGV2ZS1nYW1lJylcblxuZ2FtZS5zdGF0ZS5hZGQoJ0dhbWUnLCBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmN1cnJlbnRXZWFwb24gPSAwXG4gICAgdGhpcy5lbmVtaWVzID0gW11cbiAgICB0aGlzLmdyb3VuZFxuICAgIHRoaXMucGxhdGZvcm1zXG4gICAgdGhpcy5wbGF5ZXJcbiAgICB0aGlzLnNvY2tldFxuXG4gICAgdGhpcy5nYW1lID0gZ2FtZVxuICAgIHRoaXMuaW5pdCA9IGluaXRcbiAgICB0aGlzLnByZWxvYWQgPSBwcmVsb2FkXG4gICAgdGhpcy5jcmVhdGUgPSBjcmVhdGVcbiAgICB0aGlzLnVwZGF0ZSA9IHVwZGF0ZVxuICAgIHRoaXMucmVuZGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGdhbWUuZGVidWcudGV4dCgnQWN0aXZlIEJ1bGxldHM6ICcgKyB0aGlzLmJ1bGxldHMuY291bnRMaXZpbmcoKSArICcgLyAnICsgdGhpcy5idWxsZXRzLnRvdGFsLCAzMiwgMzIpO1xuICAgIH1cbn0sIHRydWUpXG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBDb2xsaXNpb25IYW5kbGVyKCkge1xuICAgIC8vIENvbGxpZGUgdGhpcyBwbGF5ZXIgd2l0aCB0aGUgbWFwXG4gICAgdGhpcy5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMucGxheWVyLCB0aGlzLnBsYXRmb3JtcywgbnVsbCwgbnVsbCwgdGhpcylcblxuICAgIC8vIERpZCB0aGlzIHBsYXllcidzIGJ1bGxldHMgaGl0IGFueSBwbGF0Zm9ybXNcbiAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5wbGF0Zm9ybXMsIHRoaXMuYnVsbGV0cywgKHBsYXRmb3JtLCBidWxsZXQpID0+IHtcbiAgICAgICAgYnVsbGV0LmtpbGwoKVxuICAgIH0sIG51bGwsIHRoaXMpXG5cbiAgICAvLyBEaWQgZW5lbXkgYnVsbGV0cyBoaXQgYW55IHBsYXRmb3Jtc1xuICAgIC8vIHRoaXMucGh5c2ljcy5hcmNhZGUuY29sbGlkZSh0aGlzLnBsYXRmb3JtcywgdGhpcy5lbmVteUJ1bGxldHMsIChwbGF0Zm9ybSwgYnVsbGV0KSA9PiB7XG4gICAgLy8gICAgIGJ1bGxldC5raWxsKClcbiAgICAvLyB9LCBudWxsLCB0aGlzKVxuXG4gICAgLy8gRGlkIHRoaXMgcGxheWVyIGdldCBoaXQgYnkgYW55IGVuZW15IGJ1bGxldHNcbiAgICAvLyB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5wbGF5ZXIsIHRoaXMuZW5lbXlCdWxsZXRzLCBudWxsLCAocGxheWVyLCBidWxsZXQpID0+IHtcbiAgICAvLyAgICAgYnVsbGV0LmtpbGwoKVxuICAgIC8vXG4gICAgLy8gICAgIGNvbnNvbGUubG9nKCdZb3Ugd2VyZSBoaXQgYnknLCBidWxsZXQuYnVsbGV0SWQpXG4gICAgLy8gICAgIHRoaXMuc29ja2V0LmVtaXQoJ2J1bGxldCByZW1vdmVkJywge1xuICAgIC8vICAgICAgICAgcm9vbUlkOiB0aGlzLnJvb21JZCxcbiAgICAvLyAgICAgICAgIGJ1bGxldElkOiBidWxsZXQuYnVsbGV0SWRcbiAgICAvLyAgICAgfSlcbiAgICAvL1xuICAgIC8vICAgICB0aGlzLnNvY2tldC5lbWl0KCdwbGF5ZXIgZGFtYWdlZCcsIHtcbiAgICAvLyAgICAgICAgIHJvb21JZDogdGhpcy5yb29tSWQsXG4gICAgLy8gICAgICAgICBkYW1hZ2U6IGJ1bGxldC5kYW1hZ2UsXG4gICAgLy8gICAgICAgICBkYW1hZ2VkUGxheWVySWQ6ICcvIycgKyB0aGlzLnNvY2tldC5pZCxcbiAgICAvLyAgICAgICAgIGF0dGFja2luZ1BsYXllcklkOiBidWxsZXQucGxheWVySWRcbiAgICAvLyAgICAgfSlcbiAgICAvL1xuICAgIC8vICAgICByZXR1cm4gZmFsc2VcbiAgICAvLyB9LCB0aGlzKVxufVxuIiwiaW1wb3J0IGVtaXR0ZXIgZnJvbSAnZXZlbnQtZW1pdHRlcidcblxubGV0IEV2ZW50SGFuZGxlciA9IGVtaXR0ZXIoe30pXG5cbmV4cG9ydCBkZWZhdWx0IEV2ZW50SGFuZGxlclxuIiwiaW1wb3J0IEd1aWQgZnJvbSAnLi9HdWlkJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBGaXJlU3RhbmRhcmRCdWxsZXQoKSB7XG4gICAgbGV0IHggPSB0aGlzLnJvb3RTY29wZS5wbGF5ZXIueFxuICAgIGxldCB5ID0gdGhpcy5yb290U2NvcGUucGxheWVyLnlcblxuICAgIGxldCBidWxsZXQgPSB0aGlzLnJvb3RTY29wZS5idWxsZXRzLmdldEZpcnN0RGVhZCgpXG4gICAgYnVsbGV0LmJ1bGxldElkID0gR3VpZCgpXG4gICAgYnVsbGV0LmhlaWdodCA9IHRoaXMuYnVsbGV0SGVpZ2h0XG4gICAgYnVsbGV0LndpZHRoID0gdGhpcy5idWxsZXRXaWR0aFxuICAgIGJ1bGxldC5ib2R5LmdyYXZpdHkueSA9IC0xODAwXG4gICAgYnVsbGV0LnJlc2V0KHgsIHkpXG4gICAgbGV0IHBvaW50ZXJBbmdsZSA9IHRoaXMucm9vdFNjb3BlLmdhbWUucGh5c2ljcy5hcmNhZGUubW92ZVRvUG9pbnRlcihidWxsZXQsIHRoaXMuYnVsbGV0U3BlZWQpXG4gICAgYnVsbGV0LnJvdGF0aW9uID0gcG9pbnRlckFuZ2xlXG5cbiAgICB0aGlzLmZ4LnZvbHVtZSA9IC4zICogdGhpcy5yb290U2NvcGUudm9sdW1lXG4gICAgdGhpcy5meC5wbGF5KClcblxuICAgIHRoaXMucm9vdFNjb3BlLnNvY2tldC5lbWl0KCdidWxsZXQgZmlyZWQnLCB7XG4gICAgICAgIHJvb21JZDogdGhpcy5yb290U2NvcGUucm9vbUlkLFxuICAgICAgICBidWxsZXRJZDogdGhpcy5idWxsZXRJZCxcbiAgICAgICAgcGxheWVySWQ6ICcvIycgKyB0aGlzLnJvb3RTY29wZS5zb2NrZXQuaWQsXG4gICAgICAgIHgsXG4gICAgICAgIHksXG4gICAgICAgIHBvaW50ZXJBbmdsZSxcbiAgICAgICAgYnVsbGV0U3BlZWQ6IHRoaXMuYnVsbGV0U3BlZWQsXG4gICAgICAgIGhlaWdodDogdGhpcy5idWxsZXRIZWlnaHQsXG4gICAgICAgIHdpZHRoOiB0aGlzLmJ1bGxldFdpZHRoLFxuICAgICAgICBkYW1hZ2U6IHRoaXMuZGFtYWdlXG4gICAgfSlcbn1cbiIsImNvbnN0IEdhbWVDb25zdHMgPSB7XG4gICAgV09STERfV0lEVEg6IDgwMDAsXG4gICAgV09STERfSEVJR0hUOiAzOTY2LFxuICAgIFNUQVJUSU5HX1ZPTFVNRTogLjUsXG5cbiAgICAvLyBQaHlzaWNzXG4gICAgTUFYX1NQRUVEOiA2MDAsXG4gICAgQUNDRUxFUkFUSU9OOiAxOTYwLFxuICAgIERSQUc6IDE1MDAsXG4gICAgR1JBVklUWTogMTkwMCxcbiAgICBKVU1QX1NQRUVEOiAtODUwLFxuICAgIEpVTVBfSkVUX1NQRUVEOiAtMjQwMCxcbiAgICBKVU1QX0pFVF9TUEVFRF9SRUdFTkVSQVRJT046IC0yNDAwLFxuXG4gICAgLy8gUGxheWVyIE1vZGVsXG4gICAgQU5JTUFUSU9OX0xFRlQ6IFswLCAxLCAyLCAzLCA0LCA1XSxcbiAgICBBTklNQVRJT05fUklHSFQ6IFs4LCA5LCAxMCwgMTEsIDEyLCAxM10sXG4gICAgQU5JTUFUSU9OX0ZSQU1FUkFURTogMTAsXG4gICAgUExBWUVSX1NDQUxFOiAuMjcsXG4gICAgUExBWUVSX0FOQ0hPUjogLjUsXG5cbiAgICAvLyBXZWFwb25zXG4gICAgUFJJTUFSWV9XRUFQT05TOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnQUs0NycsXG4gICAgICAgICAgICBuYW1lOiAnQUstNDcnLFxuICAgICAgICAgICAgaW1hZ2U6ICcvaW1hZ2VzL2d1bnMvU3ByX0FLNDcucG5nJyxcbiAgICAgICAgICAgIG1pblNjb3JlOiAwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnTTUwMCcsXG4gICAgICAgICAgICBuYW1lOiAnTTUwMCcsXG4gICAgICAgICAgICBpbWFnZTogJy9pbWFnZXMvZ3Vucy9TcHJfTTUwMC5wbmcnLFxuICAgICAgICAgICAgbWluU2NvcmU6IDBcbiAgICAgICAgICAgIC8vIG1pblNjb3JlOiAxMFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ1Nrb3JwaW9uJyxcbiAgICAgICAgICAgIG5hbWU6ICdTa29ycGlvbicsXG4gICAgICAgICAgICBpbWFnZTogJy9pbWFnZXMvZ3Vucy9TcHJfU2tvcnBpb24ucG5nJyxcbiAgICAgICAgICAgIG1pblNjb3JlOiAwXG4gICAgICAgICAgICAvLyBtaW5TY29yZTogMjBcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICdBdWcnLFxuICAgICAgICAgICAgbmFtZTogJ0F1ZycsXG4gICAgICAgICAgICBpbWFnZTogJy9pbWFnZXMvZ3Vucy9TcHJfQXVnLnBuZycsXG4gICAgICAgICAgICBtaW5TY29yZTogMFxuICAgICAgICAgICAgLy8gbWluU2NvcmU6IDMwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnRzQzJyxcbiAgICAgICAgICAgIG5hbWU6ICdHNDMnLFxuICAgICAgICAgICAgaW1hZ2U6ICcvaW1hZ2VzL2d1bnMvU3ByX2c0My5wbmcnLFxuICAgICAgICAgICAgbWluU2NvcmU6IDBcbiAgICAgICAgICAgIC8vIG1pblNjb3JlOiA0MFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ1A5MCcsXG4gICAgICAgICAgICBuYW1lOiAnUDkwJyxcbiAgICAgICAgICAgIGltYWdlOiAnL2ltYWdlcy9ndW5zL1Nwcl9wOTAucG5nJyxcbiAgICAgICAgICAgIG1pblNjb3JlOiAwXG4gICAgICAgICAgICAvLyBtaW5TY29yZTogMzBcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICdNNEExJyxcbiAgICAgICAgICAgIG5hbWU6ICdNNEExJyxcbiAgICAgICAgICAgIGltYWdlOiAnL2ltYWdlcy9ndW5zL1Nwcl9NNEExLnBuZycsXG4gICAgICAgICAgICBtaW5TY29yZTogMFxuICAgICAgICAgICAgLy8gbWluU2NvcmU6IDEwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnQmFycmV0dCcsXG4gICAgICAgICAgICBuYW1lOiAnQmFycmV0dCcsXG4gICAgICAgICAgICBpbWFnZTogJy9pbWFnZXMvZ3Vucy9TcHJfQmFycmV0dC5wbmcnLFxuICAgICAgICAgICAgbWluU2NvcmU6IDBcbiAgICAgICAgICAgIC8vIG1pblNjb3JlOiA3MFxuICAgICAgICB9XG4gICAgXSxcblxuICAgIFNFQ09OREFSWV9XRUFQT05TOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnRGVzZXJ0RWFnbGUnLFxuICAgICAgICAgICAgbmFtZTogJ0Rlc2VydCBFYWdsZScsXG4gICAgICAgICAgICBpbWFnZTogJy9pbWFnZXMvZ3Vucy9TcHJfRGVzZXJ0RWFnbGUucG5nJyxcbiAgICAgICAgICAgIG1pblNjb3JlOiAwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnUlBHJyxcbiAgICAgICAgICAgIG5hbWU6ICdSUEcnLFxuICAgICAgICAgICAgaW1hZ2U6ICcvaW1hZ2VzL2d1bnMvU3ByX1JQRy5wbmcnLFxuICAgICAgICAgICAgbWluU2NvcmU6IDIwXG4gICAgICAgIH1cbiAgICBdXG59XG5cbmV4cG9ydCBkZWZhdWx0IEdhbWVDb25zdHNcbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEdldFF1ZXJ5U3RyaW5nKGZpZWxkLCB1cmwpIHtcbiAgICB2YXIgaHJlZiA9IHVybCA/IHVybCA6IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuICAgIHZhciByZWcgPSBuZXcgUmVnRXhwKCAnWz8mXScgKyBmaWVsZCArICc9KFteJiNdKiknLCAnaScgKTtcbiAgICB2YXIgc3RyaW5nID0gcmVnLmV4ZWMoaHJlZik7XG4gICAgcmV0dXJuIHN0cmluZyA/IHN0cmluZ1sxXSA6IG51bGw7XG59XG4iLCJmdW5jdGlvbiBTNCgpIHtcbiAgICByZXR1cm4gKCgoMStNYXRoLnJhbmRvbSgpKSoweDEwMDAwKXwwKS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpXG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEd1aWQoKSB7XG4gICAgcmV0dXJuIChTNCgpK1M0KCkrXCItXCIrUzQoKStcIi1cIitTNCgpK1wiLVwiK1M0KCkrXCItXCIrUzQoKStTNCgpK1M0KCkpXG59XG4iLCIvLyBUaGlzIGZ1bmN0aW9uIHNob3VsZCByZXR1cm4gdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgYWN0aXZhdGVzIHRoZSBcImdvIGxlZnRcIiBjb250cm9sXG4vLyBJbiB0aGlzIGNhc2UsIGVpdGhlciBob2xkaW5nIHRoZSByaWdodCBhcnJvdyBvciB0YXBwaW5nIG9yIGNsaWNraW5nIG9uIHRoZSBsZWZ0XG4vLyBzaWRlIG9mIHRoZSBzY3JlZW4uXG5leHBvcnQgZnVuY3Rpb24gbGVmdElucHV0SXNBY3RpdmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5wdXQua2V5Ym9hcmQuaXNEb3duKFBoYXNlci5LZXlib2FyZC5BKVxufVxuXG4vLyBUaGlzIGZ1bmN0aW9uIHNob3VsZCByZXR1cm4gdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgYWN0aXZhdGVzIHRoZSBcImdvIHJpZ2h0XCIgY29udHJvbFxuLy8gSW4gdGhpcyBjYXNlLCBlaXRoZXIgaG9sZGluZyB0aGUgcmlnaHQgYXJyb3cgb3IgdGFwcGluZyBvciBjbGlja2luZyBvbiB0aGUgcmlnaHRcbi8vIHNpZGUgb2YgdGhlIHNjcmVlbi5cbmV4cG9ydCBmdW5jdGlvbiByaWdodElucHV0SXNBY3RpdmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5wdXQua2V5Ym9hcmQuaXNEb3duKFBoYXNlci5LZXlib2FyZC5EKVxufVxuXG4vLyBUaGlzIGZ1bmN0aW9uIHNob3VsZCByZXR1cm4gdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgYWN0aXZhdGVzIHRoZSBcImp1bXBcIiBjb250cm9sXG4vLyBJbiB0aGlzIGNhc2UsIGVpdGhlciBob2xkaW5nIHRoZSB1cCBhcnJvdyBvciB0YXBwaW5nIG9yIGNsaWNraW5nIG9uIHRoZSBjZW50ZXJcbi8vIHBhcnQgb2YgdGhlIHNjcmVlbi5cbmV4cG9ydCBmdW5jdGlvbiB1cElucHV0SXNBY3RpdmUoZHVyYXRpb24pIHtcbiAgICByZXR1cm4gdGhpcy5pbnB1dC5rZXlib2FyZC5kb3duRHVyYXRpb24oUGhhc2VyLktleWJvYXJkLlcsIGR1cmF0aW9uKVxufVxuXG4vLyBUaGlzIGZ1bmN0aW9uIHJldHVybnMgdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgcmVsZWFzZXMgdGhlIFwianVtcFwiIGNvbnRyb2xcbmV4cG9ydCBmdW5jdGlvbiB1cElucHV0UmVsZWFzZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5wdXQua2V5Ym9hcmQudXBEdXJhdGlvbihQaGFzZXIuS2V5Ym9hcmQuVylcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFBsYXllckFuZ2xlSGFuZGxlcigpIHtcbiAgICBsZXQgYW5nbGVJbkRlZ3JlZXMgPSAodGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmFuZ2xlVG9Qb2ludGVyKHRoaXMucGxheWVyKSAqIDE4MCAvIE1hdGguUEkpICsgOTA7XG5cbiAgICBpZiAodGhpcy5wbGF5ZXIubWV0YS5mYWNpbmcgPT09ICdyaWdodCcpIHtcbiAgICAgICAgdGhpcy5yaWdodEFybUdyb3VwLmFuZ2xlID0gYW5nbGVJbkRlZ3JlZXMgKyA1XG5cbiAgICAgICAgLy8gVXNlciBpcyBhaW1pbmcgdXBcbiAgICAgICAgaWYgKGFuZ2xlSW5EZWdyZWVzIDw9IDgxICYmIGFuZ2xlSW5EZWdyZWVzID49IDcxKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyAtPSAxMFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzIDwgNzEgJiYgYW5nbGVJbkRlZ3JlZXMgPj0gNjEpIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzIC09IDIwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPCA2MSAmJiBhbmdsZUluRGVncmVlcyA+PSA1MSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgLT0gMzBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA8IDUxICYmIGFuZ2xlSW5EZWdyZWVzID49IDQxKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyAtPSA0MFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzIDwgNDEgJiYgYW5nbGVJbkRlZ3JlZXMgPj0gMzEpIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzIC09IDUwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPCAzMSAmJiBhbmdsZUluRGVncmVlcyA+PSAyMSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgLT0gNjBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA8IDIxICYmIGFuZ2xlSW5EZWdyZWVzID49IDExKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyAtPSA3MFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzIDwgMTEgJiYgYW5nbGVJbkRlZ3JlZXMgPj0gMCkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgLT0gODBcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFVzZXIgaXMgYWltaW5nIGRvd25cbiAgICAgICAgaWYgKGFuZ2xlSW5EZWdyZWVzID49IDk5ICYmIGFuZ2xlSW5EZWdyZWVzIDw9IDEwOSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgKz0gMTBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA+IDEwOSAmJiBhbmdsZUluRGVncmVlcyA8PSAxMTkpIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzICs9IDIwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPiAxMTkgJiYgYW5nbGVJbkRlZ3JlZXMgPD0gMTI5KSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyArPSAzMFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzID4gMTI5ICYmIGFuZ2xlSW5EZWdyZWVzIDw9IDEzOSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgKz0gNDBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA+IDEzOSAmJiBhbmdsZUluRGVncmVlcyA8PSAxNDkpIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzICs9IDUwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPiAxNDkgJiYgYW5nbGVJbkRlZ3JlZXMgPD0gMTU5KSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyArPSA2MFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzID4gMTU5ICYmIGFuZ2xlSW5EZWdyZWVzIDw9IDE2OSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgKz0gNzBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA+IDE2OSAmJiBhbmdsZUluRGVncmVlcyA8PSAxODApIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzICs9IDgwXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5wbGF5ZXIubWV0YS5mYWNpbmcgPT09ICdsZWZ0Jykge1xuICAgICAgICB0aGlzLnJpZ2h0QXJtR3JvdXAuYW5nbGUgPSBhbmdsZUluRGVncmVlcyAtIDdcblxuICAgICAgICAvLyBVc2VyIGlzIGFpbWluZyB1cFxuICAgICAgICBpZiAoYW5nbGVJbkRlZ3JlZXMgPj0gLTgxICYmIGFuZ2xlSW5EZWdyZWVzIDw9IC03MSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgKz0gMjBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA+IC03MSAmJiBhbmdsZUluRGVncmVlcyA8PSAtNjEpIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzICs9IDMwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPiAtNjEgJiYgYW5nbGVJbkRlZ3JlZXMgPD0gLTUxKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyArPSA0MFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzID4gLTUxICYmIGFuZ2xlSW5EZWdyZWVzIDw9IC00MSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgKz0gNTBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA+IC00MSAmJiBhbmdsZUluRGVncmVlcyA8PSAtMzEpIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzICs9IDYwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPiAtMzEgJiYgYW5nbGVJbkRlZ3JlZXMgPD0gLTIxKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyArPSA3MFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzID4gLTIxICYmIGFuZ2xlSW5EZWdyZWVzIDw9IC0xMSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgKz0gODBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA+IC0xMSAmJiBhbmdsZUluRGVncmVlcyA8PSAwKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyArPSA5MFxuICAgICAgICB9XG5cbiAgICAgICAgLy8gVXNlciBpcyBhaW1pbmcgZG93blxuICAgICAgICBpZiAoYW5nbGVJbkRlZ3JlZXMgPD0gMjcwICYmIGFuZ2xlSW5EZWdyZWVzID49IDI2MCkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgLT0gMTBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA8IDI2MCAmJiBhbmdsZUluRGVncmVlcyA+PSAyNTApIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzIC09IDIwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPCAyNTAgJiYgYW5nbGVJbkRlZ3JlZXMgPj0gMjQwKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyAtPSAzMFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzIDwgMjQwICYmIGFuZ2xlSW5EZWdyZWVzID49IDIzMCkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgLT0gNDBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA8IDIzMCAmJiBhbmdsZUluRGVncmVlcyA+PSAyMjApIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzIC09IDUwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPCAyMjAgJiYgYW5nbGVJbkRlZ3JlZXMgPj0gMjEwKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyAtPSA2MFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzIDwgMjEwICYmIGFuZ2xlSW5EZWdyZWVzID49IDIwMCkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgLT0gNzBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA8IDIwMCAmJiBhbmdsZUluRGVncmVlcyA+PSAxOTApIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzIC09IDgwXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmxlZnRBcm1Hcm91cC5hbmdsZSA9IGFuZ2xlSW5EZWdyZWVzXG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBQbGF5ZXJCeUlkKGlkKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmVuZW1pZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHRoaXMuZW5lbWllc1tpXS5wbGF5ZXIuaWQgPT09IGlkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lbmVtaWVzW2ldXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2Vcbn1cbiIsImV4cG9ydCBmdW5jdGlvbiBwbGF5ZXJGYWNlTGVmdCgpIHtcbiAgICBpZiAodGhpcy5wbGF5ZXIubWV0YS5mYWNpbmcgIT09ICdsZWZ0Jykge1xuICAgICAgICB0aGlzLnBsYXllci5tZXRhLmZhY2luZyA9ICdsZWZ0J1xuXG4gICAgICAgIHRoaXMucmlnaHRBcm1Hcm91cC54ID0gMjVcbiAgICAgICAgdGhpcy5yaWdodEFybUdyb3VwLnkgPSAtNjVcblxuICAgICAgICB0aGlzLmxlZnRBcm1Hcm91cC54ID0gLTQwXG4gICAgICAgIHRoaXMubGVmdEFybUdyb3VwLnkgPSAtNzBcblxuICAgICAgICB0aGlzLmhlYWRTcHJpdGUuc2NhbGUueCAqPSAtMVxuICAgICAgICB0aGlzLmhlYWRTcHJpdGUueCA9IDEyXG5cbiAgICAgICAgdGhpcy50b3Jzb1Nwcml0ZS5zY2FsZS54ICo9IC0xXG4gICAgICAgIHRoaXMudG9yc29TcHJpdGUueCA9IDQ5XG5cbiAgICAgICAgdGhpcy5sZWZ0QXJtU3ByaXRlLnNjYWxlLnkgKj0gLTFcbiAgICAgICAgdGhpcy5sZWZ0QXJtU3ByaXRlLnkgPSA1XG5cbiAgICAgICAgdGhpcy5yaWdodEFybVNwcml0ZS5zY2FsZS55ICo9IC0xXG4gICAgICAgIHRoaXMucmlnaHRBcm1TcHJpdGUueSA9IDEwXG5cbiAgICAgICAgdGhpcy5hazQ3U3ByaXRlLnNjYWxlLnkgKj0gLTFcbiAgICAgICAgdGhpcy5hazQ3U3ByaXRlLnkgPSAzMFxuICAgICAgICB0aGlzLmFrNDdTcHJpdGUueCA9IC03XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcGxheWVyRmFjZVJpZ2h0KCkge1xuICAgIGlmICh0aGlzLnBsYXllci5tZXRhLmZhY2luZyAhPT0gJ3JpZ2h0Jykge1xuICAgICAgICB0aGlzLnBsYXllci5tZXRhLmZhY2luZyA9ICdyaWdodCdcblxuICAgICAgICB0aGlzLnJpZ2h0QXJtR3JvdXAueCA9IC0yNVxuICAgICAgICB0aGlzLnJpZ2h0QXJtR3JvdXAueSA9IC02NVxuXG4gICAgICAgIHRoaXMubGVmdEFybUdyb3VwLnggPSA0NVxuICAgICAgICB0aGlzLmxlZnRBcm1Hcm91cC55ID0gLTcwXG5cbiAgICAgICAgdGhpcy5oZWFkU3ByaXRlLnNjYWxlLnggKj0gLTFcbiAgICAgICAgdGhpcy5oZWFkU3ByaXRlLnggPSAwXG5cbiAgICAgICAgdGhpcy50b3Jzb1Nwcml0ZS5zY2FsZS54ICo9IC0xXG4gICAgICAgIHRoaXMudG9yc29TcHJpdGUueCA9IC0zN1xuXG4gICAgICAgIHRoaXMubGVmdEFybVNwcml0ZS5zY2FsZS55ICo9IC0xXG4gICAgICAgIHRoaXMubGVmdEFybVNwcml0ZS55ID0gMFxuXG4gICAgICAgIHRoaXMucmlnaHRBcm1TcHJpdGUuc2NhbGUueSAqPSAtMVxuICAgICAgICB0aGlzLnJpZ2h0QXJtU3ByaXRlLnkgPSAwXG5cbiAgICAgICAgdGhpcy5hazQ3U3ByaXRlLnNjYWxlLnkgKj0gLTFcbiAgICAgICAgdGhpcy5hazQ3U3ByaXRlLnkgPSAxOVxuICAgICAgICB0aGlzLmFrNDdTcHJpdGUueCA9IDNcbiAgICB9XG59XG4iLCJpbXBvcnQgR2FtZUNvbnN0cyBmcm9tICcuL0dhbWVDb25zdHMnXG5pbXBvcnQgRXZlbnRIYW5kbGVyIGZyb20gJy4vRXZlbnRIYW5kbGVyJ1xuaW1wb3J0IHsgdXBJbnB1dElzQWN0aXZlLCB1cElucHV0UmVsZWFzZWQgfSBmcm9tICcuL0lucHV0SGVscGVycydcblxubGV0IGp1bXBKZXRDb3VudGVyID0gMFxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBQbGF5ZXJKdW1wSGFuZGxlcigpIHtcbiAgICAvLyBTZXQgYSB2YXJpYWJsZSB0aGF0IGlzIHRydWUgd2hlbiB0aGUgcGxheWVyIGlzIHRvdWNoaW5nIHRoZSBncm91bmRcbiAgICBsZXQgb25UaGVHcm91bmQgPSB0aGlzLnBsYXllci5ib2R5LnRvdWNoaW5nLmRvd25cblxuICAgIC8vIElmIHRoZSBwbGF5ZXIgaXMgdG91Y2hpbmcgdGhlIGdyb3VuZCwgbGV0IGhpbSBoYXZlIDIganVtcHNcbiAgICBpZiAob25UaGVHcm91bmQpIHtcbiAgICAgICAgdGhpcy5qdW1wcyA9IDJcbiAgICAgICAgdGhpcy5qdW1waW5nID0gZmFsc2VcbiAgICB9XG5cbiAgICAvLyBKdW1wIVxuICAgIGlmICh0aGlzLmp1bXBzID09PSAyICYmIHVwSW5wdXRJc0FjdGl2ZS5jYWxsKHRoaXMsIDUpICYmIG9uVGhlR3JvdW5kKSB7XG4gICAgICAgIHRoaXMucGxheWVyLmJvZHkudmVsb2NpdHkueSA9IEdhbWVDb25zdHMuSlVNUF9TUEVFRFxuICAgICAgICB0aGlzLmp1bXBpbmcgPSB0cnVlXG4gICAgfSBlbHNlIGlmICh1cElucHV0SXNBY3RpdmUuY2FsbCh0aGlzLCA1KSkge1xuICAgICAgICB0aGlzLmp1bXBzID0gMVxuICAgIH1cblxuICAgIC8vIEp1bXAgSmV0IVxuICAgIGlmICh0aGlzLmp1bXBzID09PSAxICYmIHRoaXMuaW5wdXQua2V5Ym9hcmQuaXNEb3duKFBoYXNlci5LZXlib2FyZC5XKSAmJiBqdW1wSmV0Q291bnRlciA+IC0xMzAwMDApIHtcbiAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5hY2NlbGVyYXRpb24ueSA9IEdhbWVDb25zdHMuSlVNUF9KRVRfU1BFRURcbiAgICAgICAganVtcEpldENvdW50ZXIgKz0gR2FtZUNvbnN0cy5KVU1QX0pFVF9TUEVFRFxuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucGxheWVyLmJvZHkuYWNjZWxlcmF0aW9uLnkgPSAwXG5cbiAgICAgICAgaWYgKGp1bXBKZXRDb3VudGVyIDwgMCkge1xuICAgICAgICAgICAganVtcEpldENvdW50ZXIgLT0gR2FtZUNvbnN0cy5KVU1QX0pFVF9TUEVFRF9SRUdFTkVSQVRJT05cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGp1bXBKZXRDb3VudGVyID0gMFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgRXZlbnRIYW5kbGVyLmVtaXQoJ3BsYXllciBqdW1wIGpldCB1cGRhdGUnLCB7IGp1bXBKZXRDb3VudGVyIH0pXG5cbiAgICAvLyBSZWR1Y2UgdGhlIG51bWJlciBvZiBhdmFpbGFibGUganVtcHMgaWYgdGhlIGp1bXAgaW5wdXQgaXMgcmVsZWFzZWRcbiAgICBpZiAodGhpcy5qdW1waW5nICYmIHVwSW5wdXRSZWxlYXNlZC5jYWxsKHRoaXMpKSB7XG4gICAgICAgIHRoaXMucGxheWVyLmJvZHkuYWNjZWxlcmF0aW9uLnggPSAwXG4gICAgICAgIHRoaXMucGxheWVyLmJvZHkuYWNjZWxlcmF0aW9uLnkgPSAwXG5cbiAgICAgICAgaWYgKHRoaXMuanVtcHMgIT09IDEpIHtcbiAgICAgICAgICAgIHRoaXMuanVtcHMtLVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5qdW1waW5nID0gZmFsc2VcbiAgICB9XG59XG4iLCJpbXBvcnQgR2FtZUNvbnN0cyBmcm9tICcuL0dhbWVDb25zdHMnXG5pbXBvcnQgeyBwbGF5ZXJGYWNlTGVmdCwgcGxheWVyRmFjZVJpZ2h0IH0gZnJvbSAnLi9QbGF5ZXJGYWNlSGFuZGxlcidcbmltcG9ydCB7IGxlZnRJbnB1dElzQWN0aXZlLCByaWdodElucHV0SXNBY3RpdmUgfSBmcm9tICcuL0lucHV0SGVscGVycydcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gUGxheWVyTW92ZW1lbnRIYW5kbGVyKCkge1xuICAgIGlmIChsZWZ0SW5wdXRJc0FjdGl2ZS5jYWxsKHRoaXMpKSB7XG4gICAgICAgIC8vIElmIHRoZSBMRUZUIGtleSBpcyBkb3duLCBzZXQgdGhlIHBsYXllciB2ZWxvY2l0eSB0byBtb3ZlIGxlZnRcbiAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5hY2NlbGVyYXRpb24ueCA9IC1HYW1lQ29uc3RzLkFDQ0VMRVJBVElPTlxuICAgICAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLnBsYXkoJ2xlZnQnKVxuXG4gICAgICAgIC8vIExlZnQgZmFjaW5nIGhlYWQgbmVlZHMgdG8gYmUgc2V0IG9ubHkgb25jZVxuICAgICAgICBwbGF5ZXJGYWNlTGVmdC5jYWxsKHRoaXMpXG4gICAgfSBlbHNlIGlmIChyaWdodElucHV0SXNBY3RpdmUuY2FsbCh0aGlzKSkge1xuICAgICAgICAvLyBJZiB0aGUgUklHSFQga2V5IGlzIGRvd24sIHNldCB0aGUgcGxheWVyIHZlbG9jaXR5IHRvIG1vdmUgcmlnaHRcbiAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5hY2NlbGVyYXRpb24ueCA9IEdhbWVDb25zdHMuQUNDRUxFUkFUSU9OXG4gICAgICAgIHRoaXMucGxheWVyLmFuaW1hdGlvbnMucGxheSgncmlnaHQnKVxuXG4gICAgICAgIHBsYXllckZhY2VSaWdodC5jYWxsKHRoaXMpXG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gU3RhbmQgc3RpbGxcbiAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5hY2NlbGVyYXRpb24ueCA9IDBcbiAgICAgICAgdGhpcy5wbGF5ZXIuYW5pbWF0aW9ucy5zdG9wKClcblxuICAgICAgICBpZiAodGhpcy5nYW1lLmlucHV0LndvcmxkWCA+IHRoaXMucGxheWVyLngpIHtcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmZyYW1lID0gN1xuICAgICAgICAgICAgcGxheWVyRmFjZVJpZ2h0LmNhbGwodGhpcylcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmdhbWUuaW5wdXQud29ybGRYIDwgdGhpcy5wbGF5ZXIueCkge1xuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuZnJhbWUgPSA2XG4gICAgICAgICAgICBwbGF5ZXJGYWNlTGVmdC5jYWxsKHRoaXMpXG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJpbXBvcnQgR2FtZUNvbnN0cyBmcm9tICcuL0dhbWVDb25zdHMnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFJlbW90ZVBsYXllcihpZCwgZ2FtZSwgcGxheWVyLCBzdGFydFgsIHN0YXJ0WSkge1xuICAgIGxldCBuZXdSZW1vdGVQbGF5ZXIgPSB7XG4gICAgICAgIHg6IHN0YXJ0WCxcbiAgICAgICAgeTogc3RhcnRZLFxuICAgICAgICBpZDogbnVsbCxcbiAgICAgICAgZ2FtZTogZ2FtZSxcbiAgICAgICAgaGVhbHRoOiAxMDAsXG4gICAgICAgIHBsYXllcjogcGxheWVyLFxuICAgICAgICBhbGl2ZTogdHJ1ZSxcbiAgICAgICAgbGFzdFBvc2l0aW9uOiB7XG4gICAgICAgICAgICB4OiBzdGFydFgsXG4gICAgICAgICAgICB5OiBzdGFydFlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIENyZWF0ZSB0aGUgcGxheWVyJ3MgZW5lbXkgc3ByaXRlXG4gICAgbmV3UmVtb3RlUGxheWVyLnBsYXllciA9IGdhbWUuYWRkLnNwcml0ZShzdGFydFgsIHN0YXJ0WSwgJ2NvbW1hbmRvJylcbiAgICBuZXdSZW1vdGVQbGF5ZXIucGxheWVyLnNjYWxlLnNldFRvKEdhbWVDb25zdHMuUExBWUVSX1NDQUxFKVxuICAgIG5ld1JlbW90ZVBsYXllci5wbGF5ZXIuYW5jaG9yLnNldFRvKEdhbWVDb25zdHMuUExBWUVSX0FOQ0hPUilcblxuICAgIC8vIE91ciB0d28gYW5pbWF0aW9ucywgd2Fsa2luZyBsZWZ0IGFuZCByaWdodC5cbiAgICBuZXdSZW1vdGVQbGF5ZXIucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdsZWZ0JywgR2FtZUNvbnN0cy5BTklNQVRJT05fTEVGVCwgR2FtZUNvbnN0cy5BTklNQVRJT05fRlJBTUVSQVRFLCB0cnVlKVxuICAgIG5ld1JlbW90ZVBsYXllci5wbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ3JpZ2h0JywgR2FtZUNvbnN0cy5BTklNQVRJT05fUklHSFQsIEdhbWVDb25zdHMuQU5JTUFUSU9OX0ZSQU1FUkFURSwgdHJ1ZSlcblxuICAgIG5ld1JlbW90ZVBsYXllci5wbGF5ZXIuaWQgPSBpZFxuXG4gICAgcmV0dXJuIG5ld1JlbW90ZVBsYXllclxufVxuIiwiaW1wb3J0IEV2ZW50SGFuZGxlciBmcm9tICcuLi9FdmVudEhhbmRsZXInXG5pbXBvcnQgb25VcGRhdGVQbGF5ZXJzIGZyb20gJy4vb25VcGRhdGVQbGF5ZXJzJ1xuaW1wb3J0IG9uU29ja2V0Q29ubmVjdGVkIGZyb20gJy4vb25Tb2NrZXRDb25uZWN0ZWQnXG5pbXBvcnQgb25Tb2NrZXREaXNjb25uZWN0IGZyb20gJy4vb25Tb2NrZXREaXNjb25uZWN0J1xuaW1wb3J0IG9uTW92ZVBsYXllciBmcm9tICcuL29uTW92ZVBsYXllcidcbmltcG9ydCBvblJlbW92ZVBsYXllciBmcm9tICcuL29uUmVtb3ZlUGxheWVyJ1xuaW1wb3J0IG9uQnVsbGV0RmlyZWQgZnJvbSAnLi9vbkJ1bGxldEZpcmVkJ1xuaW1wb3J0IG9uQnVsbGV0UmVtb3ZlZCBmcm9tICcuL29uQnVsbGV0UmVtb3ZlZCdcbmltcG9ydCBvblBsYXllckRhbWFnZWQgZnJvbSAnLi9vblBsYXllckRhbWFnZWQnXG5pbXBvcnQgb25QbGF5ZXJSZXNwYXduIGZyb20gJy4vb25QbGF5ZXJSZXNwYXduJ1xuaW1wb3J0IG9uUGxheWVySGVhbHRoVXBkYXRlIGZyb20gJy4vb25QbGF5ZXJIZWFsdGhVcGRhdGUnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc29ja2V0Lm9uKCdjb25uZWN0Jywgb25Tb2NrZXRDb25uZWN0ZWQuYmluZCh0aGlzKSlcbiAgICB0aGlzLnNvY2tldC5vbignZGlzY29ubmVjdCcsIG9uU29ja2V0RGlzY29ubmVjdC5iaW5kKHRoaXMpKVxuXG4gICAgdGhpcy5zb2NrZXQub24oJ3VwZGF0ZSBwbGF5ZXJzJywgb25VcGRhdGVQbGF5ZXJzLmJpbmQodGhpcykpXG4gICAgdGhpcy5zb2NrZXQub24oJ21vdmUgcGxheWVyJywgb25Nb3ZlUGxheWVyLmJpbmQodGhpcykpXG4gICAgdGhpcy5zb2NrZXQub24oJ3JlbW92ZSBwbGF5ZXInLCBvblJlbW92ZVBsYXllci5iaW5kKHRoaXMpKVxuXG4gICAgdGhpcy5zb2NrZXQub24oJ3BsYXllciByZXNwYXduJywgb25QbGF5ZXJSZXNwYXduLmJpbmQodGhpcykpXG4gICAgdGhpcy5zb2NrZXQub24oJ3BsYXllciBkYW1hZ2VkJywgb25QbGF5ZXJEYW1hZ2VkLmJpbmQodGhpcykpXG4gICAgdGhpcy5zb2NrZXQub24oJ3BsYXllciBoZWFsdGggdXBkYXRlJywgb25QbGF5ZXJIZWFsdGhVcGRhdGUuYmluZCh0aGlzKSlcblxuICAgIHRoaXMuc29ja2V0Lm9uKCdidWxsZXQgZmlyZWQnLCBvbkJ1bGxldEZpcmVkLmJpbmQodGhpcykpXG4gICAgdGhpcy5zb2NrZXQub24oJ2J1bGxldCByZW1vdmVkJywgb25CdWxsZXRSZW1vdmVkLmJpbmQodGhpcykpXG5cbiAgICBFdmVudEhhbmRsZXIub24oJ3BsYXllciB1cGRhdGUgbmlja25hbWUnLCAoZGF0YSkgPT4ge1xuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdwbGF5ZXIgdXBkYXRlIG5pY2tuYW1lJywge1xuICAgICAgICAgICAgcm9vbUlkOiB0aGlzLnJvb21JZCxcbiAgICAgICAgICAgIG5pY2tuYW1lOiBkYXRhLm5pY2tuYW1lXG4gICAgICAgIH0pXG4gICAgfSlcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG9uQnVsbGV0RmlyZWQoZGF0YSkge1xuICAgIGlmIChkYXRhLmlkID09PSAoJy8jJyArIHRoaXMuc29ja2V0LmlkKSlcbiAgICAgICAgcmV0dXJuXG5cbiAgICBsZXQgbmV3RW5lbXlCdWxsZXQgPSB0aGlzLmVuZW15QnVsbGV0cy5jcmVhdGUoZGF0YS54LCBkYXRhLnksICdidWxsZXQxMicpXG4gICAgbmV3RW5lbXlCdWxsZXQuYnVsbGV0SWQgPSBkYXRhLmJ1bGxldElkXG4gICAgbmV3RW5lbXlCdWxsZXQucGxheWVySWQgPSBkYXRhLnBsYXllcklkXG4gICAgbmV3RW5lbXlCdWxsZXQuZGFtYWdlID0gZGF0YS5kYW1hZ2VcbiAgICBuZXdFbmVteUJ1bGxldC5yb3RhdGlvbiA9IGRhdGEucG9pbnRlckFuZ2xlXG4gICAgbmV3RW5lbXlCdWxsZXQuaGVpZ2h0ID0gZGF0YS5oZWlnaHRcbiAgICBuZXdFbmVteUJ1bGxldC53aWR0aCA9IGRhdGEud2lkdGhcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5lbmFibGUobmV3RW5lbXlCdWxsZXQsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSlcbiAgICBuZXdFbmVteUJ1bGxldC5ib2R5LmdyYXZpdHkueSA9IC0xODAwXG5cbiAgICBsZXQgbmV3VmVsb2NpdHkgPSB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUudmVsb2NpdHlGcm9tUm90YXRpb24oZGF0YS5wb2ludGVyQW5nbGUsIGRhdGEuc3BlZWQpXG4gICAgbmV3RW5lbXlCdWxsZXQuYm9keS52ZWxvY2l0eS54ICs9IG5ld1ZlbG9jaXR5LnhcbiAgICBuZXdFbmVteUJ1bGxldC5ib2R5LnZlbG9jaXR5LnkgKz0gbmV3VmVsb2NpdHkueVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gb25CdWxsZXRSZW1vdmVkKGRhdGEpIHtcbiAgICBpZiAoZGF0YS5pZCA9PT0gKCcvIycgKyB0aGlzLnNvY2tldC5pZCkpXG4gICAgICAgIHJldHVyblxuXG4gICAgbGV0IHJlbW92ZUJ1bGxldCA9IF8uZmluZCh0aGlzLndlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS5jaGlsZHJlbiwge1xuICAgICAgICBidWxsZXRJZDogZGF0YS5idWxsZXRJZFxuICAgIH0pXG5cbiAgICBpZiAoIXJlbW92ZUJ1bGxldCkge1xuICAgICAgICBjb25zb2xlLmxvZygnQnVsbGV0IG5vdCBmb3VuZDogJywgZGF0YS5idWxsZXRJZClcbiAgICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgcmVtb3ZlQnVsbGV0LmtpbGwoKVxufVxuIiwiaW1wb3J0IFBsYXllckJ5SWQgZnJvbScuLi9QbGF5ZXJCeUlkJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBvbk1vdmVQbGF5ZXIoZGF0YSkge1xuICAgIGxldCBtb3ZlUGxheWVyID0gUGxheWVyQnlJZC5jYWxsKHRoaXMsIGRhdGEuaWQpXG5cbiAgICAvLyBQbGF5ZXIgbm90IGZvdW5kXG4gICAgaWYgKCEgbW92ZVBsYXllcikge1xuICAgICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgcGxheWVyIHBvc2l0aW9uXG4gICAgbW92ZVBsYXllci5wbGF5ZXIueCA9IGRhdGEueFxuICAgIG1vdmVQbGF5ZXIucGxheWVyLnkgPSBkYXRhLnlcblxuICAgIGlmIChtb3ZlUGxheWVyLnBsYXllci54ID4gbW92ZVBsYXllci5sYXN0UG9zaXRpb24ueCkge1xuICAgICAgICBtb3ZlUGxheWVyLnBsYXllci5hbmltYXRpb25zLnBsYXkoJ3JpZ2h0JylcbiAgICB9XG4gICAgZWxzZSBpZiAobW92ZVBsYXllci5wbGF5ZXIueCA8IG1vdmVQbGF5ZXIubGFzdFBvc2l0aW9uLngpXG4gICAge1xuICAgICAgICBtb3ZlUGxheWVyLnBsYXllci5hbmltYXRpb25zLnBsYXkoJ2xlZnQnKVxuICAgIH1cbiAgICBlbHNlXG4gICAge1xuICAgICAgICBtb3ZlUGxheWVyLnBsYXllci5hbmltYXRpb25zLnN0b3AoKVxuICAgICAgICBtb3ZlUGxheWVyLnBsYXllci5mcmFtZSA9IDZcbiAgICB9XG5cbiAgICBtb3ZlUGxheWVyLmxhc3RQb3NpdGlvbi54ID0gbW92ZVBsYXllci5wbGF5ZXIueFxuICAgIG1vdmVQbGF5ZXIubGFzdFBvc2l0aW9uLnkgPSBtb3ZlUGxheWVyLnBsYXllci55XG59XG4iLCJpbXBvcnQgRXZlbnRIYW5kbGVyIGZyb20gJy4uL0V2ZW50SGFuZGxlcidcblxubGV0IGRhbWFnZVRpbWVvdXQgPSBudWxsXG5sZXQgaGVhbGluZ0ludGVydmFsID0gbnVsbFxubGV0IGxhc3RLbm93bkhlYWx0aCA9IG51bGxcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gb25QbGF5ZXJEYW1hZ2VkKGRhdGEpIHtcbiAgICBpZiAoZGF0YS5kYW1hZ2VkUGxheWVySWQgIT09ICgnLyMnICsgdGhpcy5zb2NrZXQuaWQpKVxuICAgICAgICByZXR1cm5cblxuICAgIHRoaXMucGxheWVyLm1ldGEuaGVhbHRoID0gZGF0YS5oZWFsdGhcbiAgICBFdmVudEhhbmRsZXIuZW1pdCgnaGVhbHRoIHVwZGF0ZScsIFN0cmluZyh0aGlzLnBsYXllci5tZXRhLmhlYWx0aCkpXG5cbiAgICBpZiAodGhpcy5wbGF5ZXIubWV0YS5oZWFsdGggPiA1NSAmJiB0aGlzLnBsYXllci5tZXRhLmhlYWx0aCA8IDEwMCkge1xuICAgICAgICBjbGVhclRpbWVvdXQoZGFtYWdlVGltZW91dClcbiAgICAgICAgZGFtYWdlVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgLy8gUGxheWVyJ3MgaGVhbHRoIHdpbGwgZnVsbHkgcmVnZW5lcmF0ZVxuICAgICAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgncGxheWVyIGZ1bGwgaGVhbHRoJywge1xuICAgICAgICAgICAgICAgIHJvb21JZDogdGhpcy5yb29tSWRcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0sIDUwMDApXG4gICAgfVxuXG4gICAgaWYgKHRoaXMucGxheWVyLm1ldGEuaGVhbHRoID4gMCAmJiB0aGlzLnBsYXllci5tZXRhLmhlYWx0aCA8PSA1NSkge1xuICAgICAgICAvLyBXYWl0IDUgc2Vjb25kcyB0byBiZWdpbiBoZWFsaW5nIHByb2Nlc3NcbiAgICAgICAgY2xlYXJUaW1lb3V0KGRhbWFnZVRpbWVvdXQpXG4gICAgICAgIGNsZWFySW50ZXJ2YWwoaGVhbGluZ0ludGVydmFsKVxuICAgICAgICBkYW1hZ2VUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBsYXN0S25vd25IZWFsdGggPSB0aGlzLnBsYXllci5tZXRhLmhlYWx0aFxuICAgICAgICAgICAgaGVhbGluZ0ludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChsYXN0S25vd25IZWFsdGggPj0gMTAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaGVhbGluZ0ludGVydmFsKVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxhc3RLbm93bkhlYWx0aCArPSAxMFxuXG4gICAgICAgICAgICAgICAgLy8gSW5jcmVhc2UgcGxheWVyIGhlYWx0aCBieSAxMCBldmVyeSAxLzIgYSBzZWNvbmRcbiAgICAgICAgICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdwbGF5ZXIgaGVhbGluZycsIHtcbiAgICAgICAgICAgICAgICAgICAgcm9vbUlkOiB0aGlzLnJvb21JZFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9LCA1MDApXG4gICAgICAgIH0sIDUwMDApXG4gICAgfVxufVxuIiwiaW1wb3J0IEV2ZW50SGFuZGxlciBmcm9tICcuLi9FdmVudEhhbmRsZXInXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG9uUGxheWVySGVhbHRoVXBkYXRlKGRhdGEpIHtcbiAgICBpZiAoZGF0YS5pZCAhPT0gKCcvIycgKyB0aGlzLnNvY2tldC5pZCkpXG4gICAgICAgIHJldHVyblxuXG4gICAgdGhpcy5wbGF5ZXIubWV0YS5oZWFsdGggPSBkYXRhLmhlYWx0aFxuICAgIEV2ZW50SGFuZGxlci5lbWl0KCdoZWFsdGggdXBkYXRlJywgU3RyaW5nKHRoaXMucGxheWVyLm1ldGEuaGVhbHRoKSlcbn1cbiIsImltcG9ydCBFdmVudEhhbmRsZXIgZnJvbSAnLi4vRXZlbnRIYW5kbGVyJ1xuaW1wb3J0IFdlYXBvbnMgZnJvbSAnLi4vV2VhcG9ucydcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgaWYgKGRhdGEuZGFtYWdlZFBsYXllcklkICE9PSAoJy8jJyArIHRoaXMuc29ja2V0LmlkKSlcbiAgICAgICAgcmV0dXJuXG5cbiAgICAvLyBTZXQgcHJpbWFyeSB3ZWFwb25cbiAgICB0aGlzLnBsYXllci5tZXRhLnByaW1hcnlXZWFwb24gPSBuZXcgV2VhcG9uc1t0aGlzLnBsYXllci5tZXRhLnNlbGVjdGVkUHJpbWFyeVdlYXBvbklkXSh0aGlzKVxuICAgIHRoaXMucGxheWVyLm1ldGEucHJpbWFyeVdlYXBvbi5pZCA9IHRoaXMucGxheWVyLm1ldGEuc2VsZWN0ZWRQcmltYXJ5V2VhcG9uSWRcblxuICAgIGlmICh0aGlzLmN1cnJlbnRXZWFwb24gPT09ICdwcmltYXJ5V2VhcG9uJylcbiAgICAgICAgdGhpcy5hazQ3U3ByaXRlLmxvYWRUZXh0dXJlKHRoaXMucGxheWVyLm1ldGEuc2VsZWN0ZWRQcmltYXJ5V2VhcG9uSWQpXG5cbiAgICAvLyBTZXQgc2Vjb25kYXJ5IHdlYXBvblxuICAgIHRoaXMucGxheWVyLm1ldGEuc2Vjb25kYXJ5V2VhcG9uID0gbmV3IFdlYXBvbnNbdGhpcy5wbGF5ZXIubWV0YS5zZWxlY3RlZFNlY29uZGFyeVdlYXBvbklkXSh0aGlzKVxuICAgIHRoaXMucGxheWVyLm1ldGEuc2Vjb25kYXJ5V2VhcG9uLmlkID0gdGhpcy5wbGF5ZXIubWV0YS5zZWxlY3RlZFNlY29uZGFyeVdlYXBvbklkXG5cbiAgICBpZiAodGhpcy5jdXJyZW50V2VhcG9uID09PSAnc2Vjb25kYXJ5V2VhcG9uJylcbiAgICAgICAgdGhpcy5hazQ3U3ByaXRlLmxvYWRUZXh0dXJlKHRoaXMucGxheWVyLm1ldGEuc2VsZWN0ZWRTZWNvbmRhcnlXZWFwb25JZClcblxuICAgIC8vIFJlc2V0IGhlYWx0aFxuICAgIHRoaXMucGxheWVyLm1ldGEuaGVhbHRoID0gZGF0YS5oZWFsdGhcbiAgICBFdmVudEhhbmRsZXIuZW1pdCgnaGVhbHRoIHVwZGF0ZScsIFN0cmluZyh0aGlzLnBsYXllci5tZXRhLmhlYWx0aCkpXG5cbiAgICAvLyBTcGF3biBwbGF5ZXJcbiAgICBsZXQgc3Bhd25Qb2ludCA9IHRoaXMubWFwSW5zdGFuY2UuZ2V0UmFuZG9tU3Bhd25Qb2ludCgpXG4gICAgdGhpcy5wbGF5ZXIueCA9IHNwYXduUG9pbnQueFxuICAgIHRoaXMucGxheWVyLnkgPSBzcGF3blBvaW50Lnlcbn1cbiIsImltcG9ydCBQbGF5ZXJCeUlkIGZyb20gJy4uL1BsYXllckJ5SWQnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG9uUmVtb3ZlUGxheWVyKGRhdGEpIHtcbiAgICBsZXQgcmVtb3ZlUGxheWVyID0gUGxheWVyQnlJZC5jYWxsKHRoaXMsIGRhdGEuaWQpXG5cbiAgICAvLyBQbGF5ZXIgbm90IGZvdW5kXG4gICAgaWYgKCFyZW1vdmVQbGF5ZXIpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1BsYXllciBub3QgZm91bmQ6ICcsIGRhdGEuaWQpXG4gICAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHJlbW92ZVBsYXllci5wbGF5ZXIua2lsbCgpXG5cbiAgICAvLyBSZW1vdmUgcGxheWVyIGZyb20gYXJyYXlcbiAgICB0aGlzLmVuZW1pZXMuc3BsaWNlKHRoaXMuZW5lbWllcy5pbmRleE9mKHJlbW92ZVBsYXllciksIDEpXG59XG4iLCJpbXBvcnQgR2V0UXVlcnlTdHJpbmcgZnJvbSAnLi4vR2V0UXVlcnlTdHJpbmcnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG9uU29ja2V0Q29ubmVjdGVkKCkge1xuICAgIGNvbnNvbGUubG9nKCdDb25uZWN0ZWQgdG8gc29ja2V0IHNlcnZlcicpXG5cbiAgICAgLy8gUmVzZXQgZW5lbWllcyBvbiByZWNvbm5lY3RcbiAgICB0aGlzLmVuZW1pZXMuZm9yRWFjaChmdW5jdGlvbiAoZW5lbXkpIHtcbiAgICAgICAgaWYgKGVuZW15KSBlbmVteS5raWxsKClcbiAgICB9KVxuXG4gICAgdGhpcy5lbmVtaWVzID0gW11cblxuICAgIC8vIFNlbmQgbG9jYWwgcGxheWVyIGRhdGEgdG8gdGhlIGdhbWUgc2VydmVyXG4gICAgdGhpcy5zb2NrZXQuZW1pdCgnbmV3IHBsYXllcicsIHtcbiAgICAgICAgcm9vbUlkOiBHZXRRdWVyeVN0cmluZygncm9vbUlkJyksXG4gICAgICAgIHg6IHRoaXMucGxheWVyLngsXG4gICAgICAgIHk6IHRoaXMucGxheWVyLnlcbiAgICB9KVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gb25Tb2NrZXREaXNjb25uZWN0KCkge1xuICAgIGNvbnNvbGUubG9nKCdEaXNjb25uZWN0ZWQgZnJvbSBzb2NrZXQgc2VydmVyJylcbn1cbiIsImltcG9ydCBSZW1vdGVQbGF5ZXIgZnJvbSAnLi4vUmVtb3RlUGxheWVyJ1xuaW1wb3J0IEV2ZW50SGFuZGxlciBmcm9tICcuLi9FdmVudEhhbmRsZXInXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG9uVXBkYXRlUGxheWVycyhkYXRhKSB7XG4gICAgdGhpcy5yb29tSWQgPSBkYXRhLnJvb20uaWRcblxuICAgIGxldCBuZXd1cmwgPSB3aW5kb3cubG9jYXRpb24ucHJvdG9jb2wgKyBcIi8vXCIgKyB3aW5kb3cubG9jYXRpb24uaG9zdCArIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArICc/cm9vbUlkPScgKyBkYXRhLnJvb20uaWQ7XG4gICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKHsgcGF0aDogbmV3dXJsIH0sICcnLCBuZXd1cmwpO1xuXG4gICAgdGhpcy5lbmVtaWVzLmZvckVhY2goZnVuY3Rpb24gKGVuZW15KSB7XG4gICAgICAgIGVuZW15LnBsYXllci5raWxsKClcbiAgICB9KVxuXG4gICAgdGhpcy5lbmVtaWVzID0gW11cblxuICAgIEV2ZW50SGFuZGxlci5lbWl0KCdwbGF5ZXJzIHVwZGF0ZScsIGRhdGEucm9vbS5wbGF5ZXJzKVxuXG4gICAgZGF0YS5yb29tLnBsYXllcnMuZm9yRWFjaCgocGxheWVyKSA9PiB7XG4gICAgICAgIGlmIChwbGF5ZXIuaWQgPT09ICgnLyMnICsgdGhpcy5zb2NrZXQuaWQpKSB7XG4gICAgICAgICAgICBFdmVudEhhbmRsZXIuZW1pdCgnc2NvcmUgdXBkYXRlJywgU3RyaW5nKHBsYXllci5tZXRhLnNjb3JlKSlcbiAgICAgICAgICAgIEV2ZW50SGFuZGxlci5lbWl0KCdoZWFsdGggdXBkYXRlJywgU3RyaW5nKHBsYXllci5tZXRhLmhlYWx0aCkpXG4gICAgICAgICAgICBFdmVudEhhbmRsZXIuZW1pdCgncGxheWVyIHVwZGF0ZScsIHsgcGxheWVyIH0pXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBuZXdSZW1vdGVQbGF5ZXIgPSBSZW1vdGVQbGF5ZXIuY2FsbCh0aGlzLCBwbGF5ZXIuaWQsIHRoaXMuZ2FtZSwgdGhpcy5wbGF5ZXIsIHBsYXllci54LCBwbGF5ZXIueSlcbiAgICAgICAgdGhpcy5lbmVtaWVzLnB1c2gobmV3UmVtb3RlUGxheWVyKVxuICAgIH0pXG59XG4iLCJpbXBvcnQgRmlyZVN0YW5kYXJkQnVsbGV0IGZyb20gJy4uL0ZpcmVTdGFuZGFyZEJ1bGxldCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQUs0NyBleHRlbmRzIFBoYXNlci5Hcm91cCB7XG4gICAgY29uc3RydWN0b3Iocm9vdFNjb3BlKSB7XG4gICAgICAgIHN1cGVyKHJvb3RTY29wZSlcblxuICAgICAgICB0aGlzLnJvb3RTY29wZSA9IHJvb3RTY29wZVxuXG4gICAgICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIHRoaXMucm9vdFNjb3BlLmdhbWUsIHRoaXMucm9vdFNjb3BlLmdhbWUud29ybGQsICdBSy00NycsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpXG5cbiAgICAgICAgdGhpcy5idWxsZXRIZWlnaHQgPSAyXG4gICAgICAgIHRoaXMuYnVsbGV0U3BlZWQgPSAyMzAwXG4gICAgICAgIHRoaXMuYnVsbGV0V2lkdGggPSA0MFxuICAgICAgICB0aGlzLmRhbWFnZSA9IDIyXG4gICAgICAgIHRoaXMuZmlyZVJhdGUgPSAxNjBcbiAgICAgICAgdGhpcy5meCA9IHRoaXMucm9vdFNjb3BlLmdhbWUuYWRkLmF1ZGlvKCdBSzQ3LXNvdW5kJylcbiAgICAgICAgdGhpcy5uZXh0RmlyZSA9IDBcbiAgICB9XG5cbiAgICBmaXJlKCkge1xuICAgICAgICBpZiAodGhpcy5yb290U2NvcGUuZ2FtZS50aW1lLm5vdyA8IHRoaXMubmV4dEZpcmUgfHwgdGhpcy5yb290U2NvcGUuYnVsbGV0cy5jb3VudERlYWQoKSA8PSAwKVxuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMucm9vdFNjb3BlLmdhbWUudGltZS5ub3cgKyB0aGlzLmZpcmVSYXRlXG5cbiAgICAgICAgRmlyZVN0YW5kYXJkQnVsbGV0LmNhbGwodGhpcylcbiAgICB9XG59XG4iLCJpbXBvcnQgRmlyZVN0YW5kYXJkQnVsbGV0IGZyb20gJy4uL0ZpcmVTdGFuZGFyZEJ1bGxldCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGVzZXJ0RWFnbGUgZXh0ZW5kcyBQaGFzZXIuR3JvdXAge1xuICAgIGNvbnN0cnVjdG9yKHJvb3RTY29wZSkge1xuICAgICAgICBzdXBlcihyb290U2NvcGUpXG5cbiAgICAgICAgdGhpcy5yb290U2NvcGUgPSByb290U2NvcGVcblxuICAgICAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCByb290U2NvcGUuZ2FtZSwgcm9vdFNjb3BlLmdhbWUud29ybGQsICdEZXNlcnQgRWFnbGUnLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKVxuXG4gICAgICAgIHRoaXMuYnVsbGV0SGVpZ2h0ID0gMlxuICAgICAgICB0aGlzLmJ1bGxldFNwZWVkID0gMjMwMFxuICAgICAgICB0aGlzLmJ1bGxldFdpZHRoID0gNDBcbiAgICAgICAgdGhpcy5kYW1hZ2UgPSAzM1xuICAgICAgICB0aGlzLmZpcmVSYXRlID0gMjY3XG4gICAgICAgIHRoaXMuZnggPSByb290U2NvcGUuZ2FtZS5hZGQuYXVkaW8oJ0Rlc2VydEVhZ2xlLXNvdW5kJylcbiAgICAgICAgdGhpcy5uZXh0RmlyZSA9IDBcbiAgICB9XG5cbiAgICBmaXJlKCkge1xuICAgICAgICBpZiAodGhpcy5yb290U2NvcGUuZ2FtZS50aW1lLm5vdyA8IHRoaXMubmV4dEZpcmUgfHwgdGhpcy5yb290U2NvcGUuYnVsbGV0cy5jb3VudERlYWQoKSA8PSAwKVxuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMucm9vdFNjb3BlLmdhbWUudGltZS5ub3cgKyB0aGlzLmZpcmVSYXRlXG5cbiAgICAgICAgRmlyZVN0YW5kYXJkQnVsbGV0LmNhbGwodGhpcylcbiAgICB9XG59XG4iLCJpbXBvcnQgQUs0NyBmcm9tICcuL0FLNDcnXG4vLyBpbXBvcnQgQmFycmV0dCBmcm9tICcuL0JhcnJldHQnXG5pbXBvcnQgRGVzZXJ0RWFnbGUgZnJvbSAnLi9EZXNlcnRFYWdsZSdcbi8vIGltcG9ydCBNNEExIGZyb20gJy4vTTRBMSdcbi8vIGltcG9ydCBNNTAwIGZyb20gJy4vTTUwMCdcbi8vIGltcG9ydCBTa29ycGlvbiBmcm9tICcuL1Nrb3JwaW9uJ1xuLy8gaW1wb3J0IEFVRyBmcm9tICcuL0FVRydcbi8vIGltcG9ydCBSUEcgZnJvbSAnLi9SUEcnXG4vLyBpbXBvcnQgUDkwIGZyb20gJy4vUDkwJ1xuLy8gaW1wb3J0IEc0MyBmcm9tICcuL0c0MydcblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIEFLNDcsXG4gICAgLy8gQmFycmV0dCxcbiAgICBEZXNlcnRFYWdsZSxcbiAgICAvLyBNNEExLFxuICAgIC8vIE01MDAsXG4gICAgLy8gU2tvcnBpb24sXG4gICAgLy8gQVVHLFxuICAgIC8vIFJQRyxcbiAgICAvLyBQOTAsXG4gICAgLy8gRzQzXG59XG4iLCJjb25zdCBzcGF3blBvaW50cyA9IFtcbiAgICB7IHg6IDgxNSwgeTogMTczMCB9LFxuICAgIHsgeDogMzM4MCwgeTogMTAzMCB9LFxuICAgIHsgeDogNDQzNywgeTogMTU1MCB9LFxuICAgIHsgeDogNjY5MCwgeTogMTg2MCB9LFxuICAgIHsgeDogMzgzMiwgeTogMzM1MCB9LFxuICAgIHsgeDogMzc3NSwgeTogMjMwMCB9LFxuICAgIHsgeDogMjQyMCwgeTogMjkwMCB9XG5dXG5cbmNvbnN0IGxlZGdlcyA9IFtcbiAgICB7IGlkOiAxLCB4OiAyMTQ1LCB5OiAyMDY1LCB3aWR0aDogMTM1LCBoZWlnaHQ6IDQwIH0sXG4gICAgeyBpZDogMiwgeDogMjYxMywgeTogMTA5NCwgd2lkdGg6IDExMDAsIGhlaWdodDogMTEyIH0sXG4gICAgeyBpZDogMywgeDogMzY1NywgeTogMzQ0Niwgd2lkdGg6IDUwMCwgaGVpZ2h0OiA2MDAgfSxcbiAgICB7IGlkOiA0LCB4OiA1MjE3LCB5OiAxOTM4LCB3aWR0aDogMzgwLCBoZWlnaHQ6IDYwMCB9LFxuICAgIHsgaWQ6IDUsIHg6IDQyMiwgeTogMTgyNCwgd2lkdGg6IDExNTAsIGhlaWdodDogMzAwIH0sXG4gICAgeyBpZDogNiwgeDogMTU1NSwgeTogMTc0OSwgd2lkdGg6IDI3MCwgaGVpZ2h0OiA3MzAgfSxcbiAgICB7IGlkOiA3LCB4OiAxODIwLCB5OiAxNzQ5LCB3aWR0aDogNDcwLCBoZWlnaHQ6IDYgfSxcbiAgICB7IGlkOiA4LCB4OiAyMjc1LCB5OiAxNzQ5LCB3aWR0aDogMzIwLCBoZWlnaHQ6IDYzMCB9LFxuICAgIHsgaWQ6IDksIHg6IDI1OTUsIHk6IDE2NjcsIHdpZHRoOiAxMTIwLCBoZWlnaHQ6IDI2MCB9LFxuICAgIHsgaWQ6IDEwLCB4OiA0MzA0LCB5OiAxNjIxLCB3aWR0aDogMzc1LCBoZWlnaHQ6IDEzMDAgfSxcbiAgICB7IGlkOiAxMSwgeDogMTgyNSwgeTogMjI5OCwgd2lkdGg6IDE2MCwgaGVpZ2h0OiAxNTIgfSxcbiAgICB7IGlkOiAxMiwgeDogNTY0NCwgeTogMTU3Mywgd2lkdGg6IDMzMCwgaGVpZ2h0OiAyMCB9LFxuICAgIHsgaWQ6IDEzLCB4OiA0NjczLCB5OiAyMDE3LCB3aWR0aDogNTcwLCBoZWlnaHQ6IDI1NCB9LFxuICAgIHsgaWQ6IDE0LCB4OiAyOTQ4LCB5OiAzMTM3LCB3aWR0aDogMzgwLCBoZWlnaHQ6IDMwMCB9LFxuICAgIHsgaWQ6IDE1LCB4OiAzOTgzLCB5OiAyMDI4LCB3aWR0aDogMzQxLCBoZWlnaHQ6IDcwMCB9LFxuICAgIHsgaWQ6IDE2LCB4OiAxOTEyLCB5OiAyOTY3LCB3aWR0aDogMTA0NSwgaGVpZ2h0OiA1MDAgfSxcbiAgICB7IGlkOiAxNywgeDogNjYyOCwgeTogMTU5MCwgd2lkdGg6IDM4NSwgaGVpZ2h0OiAzNyB9LFxuICAgIHsgaWQ6IDE4LCB4OiA2NjI4LCB5OiAxMTc4LCB3aWR0aDogMzg1LCBoZWlnaHQ6IDM3IH0sXG4gICAgeyBpZDogMTksIHg6IDU1OTAsIHk6IDIwMzgsIHdpZHRoOiAzNTAsIGhlaWdodDogNjAwIH0sXG4gICAgeyBpZDogMjAsIHg6IDY5ODQsIHk6IDE5ODksIHdpZHRoOiA0NTAsIGhlaWdodDogMTY3IH0sXG4gICAgeyBpZDogMjEsIHg6IDM2NzIsIHk6IDI0MDEsIHdpZHRoOiAzMzAsIGhlaWdodDogNTAwIH0sXG4gICAgeyBpZDogMjIsIHg6IDMzMDMsIHk6IDI1OTksIHdpZHRoOiA0MDAsIGhlaWdodDogMzAwIH0sXG4gICAgeyBpZDogMjMsIHg6IDU5NDAsIHk6IDIwMTgsIHdpZHRoOiAxMDUwLCBoZWlnaHQ6IDYwMCB9XG5dXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhpZ2hSdWxlSnVuZ2xlIHtcbiAgICBjb25zdHJ1Y3Rvcihyb290U2NvcGUpIHtcbiAgICAgICAgdGhpcy5yb290U2NvcGUgPSByb290U2NvcGVcbiAgICB9XG5cbiAgICBnZXRSYW5kb21TcGF3blBvaW50KCkge1xuICAgICAgICByZXR1cm4gXy5zYW1wbGUoc3Bhd25Qb2ludHMpXG4gICAgfVxuXG4gICAgY3JlYXRlKCkge1xuICAgICAgICB0aGlzLnJvb3RTY29wZS5za3lzcHJpdGUgPSB0aGlzLnJvb3RTY29wZS5hZGQudGlsZVNwcml0ZSgwLCAwLCB0aGlzLnJvb3RTY29wZS5nYW1lLndvcmxkLndpZHRoLCB0aGlzLnJvb3RTY29wZS5nYW1lLndvcmxkLmhlaWdodCwgJ21hcC1iZycpXG4gICAgICAgIHRoaXMucm9vdFNjb3BlLnBsYXRmb3JtcyA9IHRoaXMucm9vdFNjb3BlLmFkZC5ncm91cCgpXG4gICAgICAgIHRoaXMucm9vdFNjb3BlLnBsYXRmb3Jtcy5lbmFibGVCb2R5ID0gdHJ1ZVxuICAgICAgICB0aGlzLmNyZWF0ZUxlZGdlcygpXG4gICAgICAgIHRoaXMucm9vdFNjb3BlLnBsYXRmb3Jtcy5zZXRBbGwoJ2JvZHkuaW1tb3ZhYmxlJywgdHJ1ZSlcbiAgICAgICAgdGhpcy5yb290U2NvcGUucGxhdGZvcm1zLnNldEFsbCgnYm9keS5hbGxvd0dyYXZpdHknLCBmYWxzZSlcbiAgICB9XG5cbiAgICBjcmVhdGVMZWRnZXMoKSB7XG4gICAgICAgIGxlZGdlcy5mb3JFYWNoKChsZWRnZSkgPT4ge1xuICAgICAgICAgICAgLy8gdmFyIG5ld0xlZGdlID0gdGhpcy5yb290U2NvcGUucGxhdGZvcm1zLmNyZWF0ZShsZWRnZS54LCBsZWRnZS55LCAnZ3JvdW5kJylcbiAgICAgICAgICAgIHZhciBuZXdMZWRnZSA9IHRoaXMucm9vdFNjb3BlLnBsYXRmb3Jtcy5jcmVhdGUobGVkZ2UueCwgbGVkZ2UueSlcbiAgICAgICAgICAgIG5ld0xlZGdlLmhlaWdodCA9IGxlZGdlLmhlaWdodFxuICAgICAgICAgICAgbmV3TGVkZ2Uud2lkdGggPSBsZWRnZS53aWR0aFxuXG4gICAgICAgICAgICAvLyBEZWJ1ZyBzdHVmZlxuICAgICAgICAgICAgLy8gbmV3TGVkZ2UuYWxwaGEgPSAwLjRcbiAgICAgICAgICAgIC8vIGxldCBzdHlsZSA9IHsgZm9udDogXCIyMHB4IEFyaWFsXCIsIGZpbGw6IFwiI2ZmMDA0NFwiLCBhbGlnbjogXCJjZW50ZXJcIiwgYmFja2dyb3VuZENvbG9yOiBcIiNmZmZmMDBcIiB9XG4gICAgICAgICAgICAvLyBsZXQgdGV4dCA9IHRoaXMucm9vdFNjb3BlLmdhbWUuYWRkLnRleHQobGVkZ2UueCwgbGVkZ2UueSwgbGVkZ2UuaWQsIHN0eWxlKVxuICAgICAgICAgICAgLy8gdGV4dC5hbHBoYSA9IDAuMlxuICAgICAgICB9KVxuICAgIH1cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGFzc2lnbiAgICAgICAgPSByZXF1aXJlKCdlczUtZXh0L29iamVjdC9hc3NpZ24nKVxuICAsIG5vcm1hbGl6ZU9wdHMgPSByZXF1aXJlKCdlczUtZXh0L29iamVjdC9ub3JtYWxpemUtb3B0aW9ucycpXG4gICwgaXNDYWxsYWJsZSAgICA9IHJlcXVpcmUoJ2VzNS1leHQvb2JqZWN0L2lzLWNhbGxhYmxlJylcbiAgLCBjb250YWlucyAgICAgID0gcmVxdWlyZSgnZXM1LWV4dC9zdHJpbmcvIy9jb250YWlucycpXG5cbiAgLCBkO1xuXG5kID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZHNjciwgdmFsdWUvKiwgb3B0aW9ucyovKSB7XG5cdHZhciBjLCBlLCB3LCBvcHRpb25zLCBkZXNjO1xuXHRpZiAoKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB8fCAodHlwZW9mIGRzY3IgIT09ICdzdHJpbmcnKSkge1xuXHRcdG9wdGlvbnMgPSB2YWx1ZTtcblx0XHR2YWx1ZSA9IGRzY3I7XG5cdFx0ZHNjciA9IG51bGw7XG5cdH0gZWxzZSB7XG5cdFx0b3B0aW9ucyA9IGFyZ3VtZW50c1syXTtcblx0fVxuXHRpZiAoZHNjciA9PSBudWxsKSB7XG5cdFx0YyA9IHcgPSB0cnVlO1xuXHRcdGUgPSBmYWxzZTtcblx0fSBlbHNlIHtcblx0XHRjID0gY29udGFpbnMuY2FsbChkc2NyLCAnYycpO1xuXHRcdGUgPSBjb250YWlucy5jYWxsKGRzY3IsICdlJyk7XG5cdFx0dyA9IGNvbnRhaW5zLmNhbGwoZHNjciwgJ3cnKTtcblx0fVxuXG5cdGRlc2MgPSB7IHZhbHVlOiB2YWx1ZSwgY29uZmlndXJhYmxlOiBjLCBlbnVtZXJhYmxlOiBlLCB3cml0YWJsZTogdyB9O1xuXHRyZXR1cm4gIW9wdGlvbnMgPyBkZXNjIDogYXNzaWduKG5vcm1hbGl6ZU9wdHMob3B0aW9ucyksIGRlc2MpO1xufTtcblxuZC5ncyA9IGZ1bmN0aW9uIChkc2NyLCBnZXQsIHNldC8qLCBvcHRpb25zKi8pIHtcblx0dmFyIGMsIGUsIG9wdGlvbnMsIGRlc2M7XG5cdGlmICh0eXBlb2YgZHNjciAhPT0gJ3N0cmluZycpIHtcblx0XHRvcHRpb25zID0gc2V0O1xuXHRcdHNldCA9IGdldDtcblx0XHRnZXQgPSBkc2NyO1xuXHRcdGRzY3IgPSBudWxsO1xuXHR9IGVsc2Uge1xuXHRcdG9wdGlvbnMgPSBhcmd1bWVudHNbM107XG5cdH1cblx0aWYgKGdldCA9PSBudWxsKSB7XG5cdFx0Z2V0ID0gdW5kZWZpbmVkO1xuXHR9IGVsc2UgaWYgKCFpc0NhbGxhYmxlKGdldCkpIHtcblx0XHRvcHRpb25zID0gZ2V0O1xuXHRcdGdldCA9IHNldCA9IHVuZGVmaW5lZDtcblx0fSBlbHNlIGlmIChzZXQgPT0gbnVsbCkge1xuXHRcdHNldCA9IHVuZGVmaW5lZDtcblx0fSBlbHNlIGlmICghaXNDYWxsYWJsZShzZXQpKSB7XG5cdFx0b3B0aW9ucyA9IHNldDtcblx0XHRzZXQgPSB1bmRlZmluZWQ7XG5cdH1cblx0aWYgKGRzY3IgPT0gbnVsbCkge1xuXHRcdGMgPSB0cnVlO1xuXHRcdGUgPSBmYWxzZTtcblx0fSBlbHNlIHtcblx0XHRjID0gY29udGFpbnMuY2FsbChkc2NyLCAnYycpO1xuXHRcdGUgPSBjb250YWlucy5jYWxsKGRzY3IsICdlJyk7XG5cdH1cblxuXHRkZXNjID0geyBnZXQ6IGdldCwgc2V0OiBzZXQsIGNvbmZpZ3VyYWJsZTogYywgZW51bWVyYWJsZTogZSB9O1xuXHRyZXR1cm4gIW9wdGlvbnMgPyBkZXNjIDogYXNzaWduKG5vcm1hbGl6ZU9wdHMob3B0aW9ucyksIGRlc2MpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2lzLWltcGxlbWVudGVkJykoKVxuXHQ/IE9iamVjdC5hc3NpZ25cblx0OiByZXF1aXJlKCcuL3NoaW0nKTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG5cdHZhciBhc3NpZ24gPSBPYmplY3QuYXNzaWduLCBvYmo7XG5cdGlmICh0eXBlb2YgYXNzaWduICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gZmFsc2U7XG5cdG9iaiA9IHsgZm9vOiAncmF6JyB9O1xuXHRhc3NpZ24ob2JqLCB7IGJhcjogJ2R3YScgfSwgeyB0cnp5OiAndHJ6eScgfSk7XG5cdHJldHVybiAob2JqLmZvbyArIG9iai5iYXIgKyBvYmoudHJ6eSkgPT09ICdyYXpkd2F0cnp5Jztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBrZXlzICA9IHJlcXVpcmUoJy4uL2tleXMnKVxuICAsIHZhbHVlID0gcmVxdWlyZSgnLi4vdmFsaWQtdmFsdWUnKVxuXG4gICwgbWF4ID0gTWF0aC5tYXg7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGRlc3QsIHNyYy8qLCDigKZzcmNuKi8pIHtcblx0dmFyIGVycm9yLCBpLCBsID0gbWF4KGFyZ3VtZW50cy5sZW5ndGgsIDIpLCBhc3NpZ247XG5cdGRlc3QgPSBPYmplY3QodmFsdWUoZGVzdCkpO1xuXHRhc3NpZ24gPSBmdW5jdGlvbiAoa2V5KSB7XG5cdFx0dHJ5IHsgZGVzdFtrZXldID0gc3JjW2tleV07IH0gY2F0Y2ggKGUpIHtcblx0XHRcdGlmICghZXJyb3IpIGVycm9yID0gZTtcblx0XHR9XG5cdH07XG5cdGZvciAoaSA9IDE7IGkgPCBsOyArK2kpIHtcblx0XHRzcmMgPSBhcmd1bWVudHNbaV07XG5cdFx0a2V5cyhzcmMpLmZvckVhY2goYXNzaWduKTtcblx0fVxuXHRpZiAoZXJyb3IgIT09IHVuZGVmaW5lZCkgdGhyb3cgZXJyb3I7XG5cdHJldHVybiBkZXN0O1xufTtcbiIsIi8vIERlcHJlY2F0ZWRcblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmogPT09ICdmdW5jdGlvbic7IH07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9pcy1pbXBsZW1lbnRlZCcpKClcblx0PyBPYmplY3Qua2V5c1xuXHQ6IHJlcXVpcmUoJy4vc2hpbScpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcblx0dHJ5IHtcblx0XHRPYmplY3Qua2V5cygncHJpbWl0aXZlJyk7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH0gY2F0Y2ggKGUpIHsgcmV0dXJuIGZhbHNlOyB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIga2V5cyA9IE9iamVjdC5rZXlzO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvYmplY3QpIHtcblx0cmV0dXJuIGtleXMob2JqZWN0ID09IG51bGwgPyBvYmplY3QgOiBPYmplY3Qob2JqZWN0KSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZm9yRWFjaCA9IEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLCBjcmVhdGUgPSBPYmplY3QuY3JlYXRlO1xuXG52YXIgcHJvY2VzcyA9IGZ1bmN0aW9uIChzcmMsIG9iaikge1xuXHR2YXIga2V5O1xuXHRmb3IgKGtleSBpbiBzcmMpIG9ialtrZXldID0gc3JjW2tleV07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvcHRpb25zLyosIOKApm9wdGlvbnMqLykge1xuXHR2YXIgcmVzdWx0ID0gY3JlYXRlKG51bGwpO1xuXHRmb3JFYWNoLmNhbGwoYXJndW1lbnRzLCBmdW5jdGlvbiAob3B0aW9ucykge1xuXHRcdGlmIChvcHRpb25zID09IG51bGwpIHJldHVybjtcblx0XHRwcm9jZXNzKE9iamVjdChvcHRpb25zKSwgcmVzdWx0KTtcblx0fSk7XG5cdHJldHVybiByZXN1bHQ7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChmbikge1xuXHRpZiAodHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB0aHJvdyBuZXcgVHlwZUVycm9yKGZuICsgXCIgaXMgbm90IGEgZnVuY3Rpb25cIik7XG5cdHJldHVybiBmbjtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHZhbHVlKSB7XG5cdGlmICh2YWx1ZSA9PSBudWxsKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IHVzZSBudWxsIG9yIHVuZGVmaW5lZFwiKTtcblx0cmV0dXJuIHZhbHVlO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2lzLWltcGxlbWVudGVkJykoKVxuXHQ/IFN0cmluZy5wcm90b3R5cGUuY29udGFpbnNcblx0OiByZXF1aXJlKCcuL3NoaW0nKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHN0ciA9ICdyYXpkd2F0cnp5JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG5cdGlmICh0eXBlb2Ygc3RyLmNvbnRhaW5zICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gZmFsc2U7XG5cdHJldHVybiAoKHN0ci5jb250YWlucygnZHdhJykgPT09IHRydWUpICYmIChzdHIuY29udGFpbnMoJ2ZvbycpID09PSBmYWxzZSkpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGluZGV4T2YgPSBTdHJpbmcucHJvdG90eXBlLmluZGV4T2Y7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHNlYXJjaFN0cmluZy8qLCBwb3NpdGlvbiovKSB7XG5cdHJldHVybiBpbmRleE9mLmNhbGwodGhpcywgc2VhcmNoU3RyaW5nLCBhcmd1bWVudHNbMV0pID4gLTE7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZCAgICAgICAgPSByZXF1aXJlKCdkJylcbiAgLCBjYWxsYWJsZSA9IHJlcXVpcmUoJ2VzNS1leHQvb2JqZWN0L3ZhbGlkLWNhbGxhYmxlJylcblxuICAsIGFwcGx5ID0gRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5LCBjYWxsID0gRnVuY3Rpb24ucHJvdG90eXBlLmNhbGxcbiAgLCBjcmVhdGUgPSBPYmplY3QuY3JlYXRlLCBkZWZpbmVQcm9wZXJ0eSA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eVxuICAsIGRlZmluZVByb3BlcnRpZXMgPSBPYmplY3QuZGVmaW5lUHJvcGVydGllc1xuICAsIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eVxuICAsIGRlc2NyaXB0b3IgPSB7IGNvbmZpZ3VyYWJsZTogdHJ1ZSwgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlIH1cblxuICAsIG9uLCBvbmNlLCBvZmYsIGVtaXQsIG1ldGhvZHMsIGRlc2NyaXB0b3JzLCBiYXNlO1xuXG5vbiA9IGZ1bmN0aW9uICh0eXBlLCBsaXN0ZW5lcikge1xuXHR2YXIgZGF0YTtcblxuXHRjYWxsYWJsZShsaXN0ZW5lcik7XG5cblx0aWYgKCFoYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMsICdfX2VlX18nKSkge1xuXHRcdGRhdGEgPSBkZXNjcmlwdG9yLnZhbHVlID0gY3JlYXRlKG51bGwpO1xuXHRcdGRlZmluZVByb3BlcnR5KHRoaXMsICdfX2VlX18nLCBkZXNjcmlwdG9yKTtcblx0XHRkZXNjcmlwdG9yLnZhbHVlID0gbnVsbDtcblx0fSBlbHNlIHtcblx0XHRkYXRhID0gdGhpcy5fX2VlX187XG5cdH1cblx0aWYgKCFkYXRhW3R5cGVdKSBkYXRhW3R5cGVdID0gbGlzdGVuZXI7XG5cdGVsc2UgaWYgKHR5cGVvZiBkYXRhW3R5cGVdID09PSAnb2JqZWN0JykgZGF0YVt0eXBlXS5wdXNoKGxpc3RlbmVyKTtcblx0ZWxzZSBkYXRhW3R5cGVdID0gW2RhdGFbdHlwZV0sIGxpc3RlbmVyXTtcblxuXHRyZXR1cm4gdGhpcztcbn07XG5cbm9uY2UgPSBmdW5jdGlvbiAodHlwZSwgbGlzdGVuZXIpIHtcblx0dmFyIG9uY2UsIHNlbGY7XG5cblx0Y2FsbGFibGUobGlzdGVuZXIpO1xuXHRzZWxmID0gdGhpcztcblx0b24uY2FsbCh0aGlzLCB0eXBlLCBvbmNlID0gZnVuY3Rpb24gKCkge1xuXHRcdG9mZi5jYWxsKHNlbGYsIHR5cGUsIG9uY2UpO1xuXHRcdGFwcGx5LmNhbGwobGlzdGVuZXIsIHRoaXMsIGFyZ3VtZW50cyk7XG5cdH0pO1xuXG5cdG9uY2UuX19lZU9uY2VMaXN0ZW5lcl9fID0gbGlzdGVuZXI7XG5cdHJldHVybiB0aGlzO1xufTtcblxub2ZmID0gZnVuY3Rpb24gKHR5cGUsIGxpc3RlbmVyKSB7XG5cdHZhciBkYXRhLCBsaXN0ZW5lcnMsIGNhbmRpZGF0ZSwgaTtcblxuXHRjYWxsYWJsZShsaXN0ZW5lcik7XG5cblx0aWYgKCFoYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMsICdfX2VlX18nKSkgcmV0dXJuIHRoaXM7XG5cdGRhdGEgPSB0aGlzLl9fZWVfXztcblx0aWYgKCFkYXRhW3R5cGVdKSByZXR1cm4gdGhpcztcblx0bGlzdGVuZXJzID0gZGF0YVt0eXBlXTtcblxuXHRpZiAodHlwZW9mIGxpc3RlbmVycyA9PT0gJ29iamVjdCcpIHtcblx0XHRmb3IgKGkgPSAwOyAoY2FuZGlkYXRlID0gbGlzdGVuZXJzW2ldKTsgKytpKSB7XG5cdFx0XHRpZiAoKGNhbmRpZGF0ZSA9PT0gbGlzdGVuZXIpIHx8XG5cdFx0XHRcdFx0KGNhbmRpZGF0ZS5fX2VlT25jZUxpc3RlbmVyX18gPT09IGxpc3RlbmVyKSkge1xuXHRcdFx0XHRpZiAobGlzdGVuZXJzLmxlbmd0aCA9PT0gMikgZGF0YVt0eXBlXSA9IGxpc3RlbmVyc1tpID8gMCA6IDFdO1xuXHRcdFx0XHRlbHNlIGxpc3RlbmVycy5zcGxpY2UoaSwgMSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdGlmICgobGlzdGVuZXJzID09PSBsaXN0ZW5lcikgfHxcblx0XHRcdFx0KGxpc3RlbmVycy5fX2VlT25jZUxpc3RlbmVyX18gPT09IGxpc3RlbmVyKSkge1xuXHRcdFx0ZGVsZXRlIGRhdGFbdHlwZV07XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHRoaXM7XG59O1xuXG5lbWl0ID0gZnVuY3Rpb24gKHR5cGUpIHtcblx0dmFyIGksIGwsIGxpc3RlbmVyLCBsaXN0ZW5lcnMsIGFyZ3M7XG5cblx0aWYgKCFoYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMsICdfX2VlX18nKSkgcmV0dXJuO1xuXHRsaXN0ZW5lcnMgPSB0aGlzLl9fZWVfX1t0eXBlXTtcblx0aWYgKCFsaXN0ZW5lcnMpIHJldHVybjtcblxuXHRpZiAodHlwZW9mIGxpc3RlbmVycyA9PT0gJ29iamVjdCcpIHtcblx0XHRsID0gYXJndW1lbnRzLmxlbmd0aDtcblx0XHRhcmdzID0gbmV3IEFycmF5KGwgLSAxKTtcblx0XHRmb3IgKGkgPSAxOyBpIDwgbDsgKytpKSBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcblxuXHRcdGxpc3RlbmVycyA9IGxpc3RlbmVycy5zbGljZSgpO1xuXHRcdGZvciAoaSA9IDA7IChsaXN0ZW5lciA9IGxpc3RlbmVyc1tpXSk7ICsraSkge1xuXHRcdFx0YXBwbHkuY2FsbChsaXN0ZW5lciwgdGhpcywgYXJncyk7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuXHRcdGNhc2UgMTpcblx0XHRcdGNhbGwuY2FsbChsaXN0ZW5lcnMsIHRoaXMpO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAyOlxuXHRcdFx0Y2FsbC5jYWxsKGxpc3RlbmVycywgdGhpcywgYXJndW1lbnRzWzFdKTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgMzpcblx0XHRcdGNhbGwuY2FsbChsaXN0ZW5lcnMsIHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcblx0XHRcdGJyZWFrO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRsID0gYXJndW1lbnRzLmxlbmd0aDtcblx0XHRcdGFyZ3MgPSBuZXcgQXJyYXkobCAtIDEpO1xuXHRcdFx0Zm9yIChpID0gMTsgaSA8IGw7ICsraSkge1xuXHRcdFx0XHRhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcblx0XHRcdH1cblx0XHRcdGFwcGx5LmNhbGwobGlzdGVuZXJzLCB0aGlzLCBhcmdzKTtcblx0XHR9XG5cdH1cbn07XG5cbm1ldGhvZHMgPSB7XG5cdG9uOiBvbixcblx0b25jZTogb25jZSxcblx0b2ZmOiBvZmYsXG5cdGVtaXQ6IGVtaXRcbn07XG5cbmRlc2NyaXB0b3JzID0ge1xuXHRvbjogZChvbiksXG5cdG9uY2U6IGQob25jZSksXG5cdG9mZjogZChvZmYpLFxuXHRlbWl0OiBkKGVtaXQpXG59O1xuXG5iYXNlID0gZGVmaW5lUHJvcGVydGllcyh7fSwgZGVzY3JpcHRvcnMpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBmdW5jdGlvbiAobykge1xuXHRyZXR1cm4gKG8gPT0gbnVsbCkgPyBjcmVhdGUoYmFzZSkgOiBkZWZpbmVQcm9wZXJ0aWVzKE9iamVjdChvKSwgZGVzY3JpcHRvcnMpO1xufTtcbmV4cG9ydHMubWV0aG9kcyA9IG1ldGhvZHM7XG4iXX0=
