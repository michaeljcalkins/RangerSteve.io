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

var _SetEventHandlers = require('../lib/SocketEvents/SetEventHandlers');

var _SetEventHandlers2 = _interopRequireDefault(_SetEventHandlers);

var _EventHandler = require('../lib/EventHandler');

var _EventHandler2 = _interopRequireDefault(_EventHandler);

var _HighRuleJungle = require('../maps/HighRuleJungle');

var _HighRuleJungle2 = _interopRequireDefault(_HighRuleJungle);

var _Weapons = require('../lib/Weapons');

var _Weapons2 = _interopRequireDefault(_Weapons);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var worldWidth = 8000;
var worldHeight = 3966;

function Create() {
    var _this = this;

    // Define movement constants
    this.MAX_SPEED = 600;
    this.ACCELERATION = 1960;
    this.DRAG = 1500;
    this.GRAVITY = 1900;
    this.JUMP_SPEED = -850;
    this.JUMP_JET_SPEED = -2400;

    this.socket = io.connect();
    this.enemies = [];
    this.volume = .5;
    this.enemyBullets = this.game.add.group();

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
    this.mapInstance = new _HighRuleJungle2.default(this);
    this.mapInstance.create();

    /**
     * Player Settings
     */
    var spawnPoint = this.mapInstance.getRandomSpawnPoint();
    this.player = this.add.sprite(spawnPoint.x, spawnPoint.y, 'commando');
    this.player.scale.setTo(.27);
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
    this.player.body.setSize(230, 290, -10, 0);
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
        health: 100,
        primaryWeapon: new _Weapons2.default.AK47({
            game: this.game
        }),
        secondaryWeapon: new _Weapons2.default.DesertEagle({
            game: this.game
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

},{"../lib/EventHandler":9,"../lib/SocketEvents/SetEventHandlers":20,"../lib/Weapons":41,"../maps/HighRuleJungle":42}],3:[function(require,module,exports){
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

var _PrimaryWeapons = require('../lib/PrimaryWeapons');

var _PrimaryWeapons2 = _interopRequireDefault(_PrimaryWeapons);

var _SecondaryWeapons = require('../lib/SecondaryWeapons');

var _SecondaryWeapons2 = _interopRequireDefault(_SecondaryWeapons);

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
    _PrimaryWeapons2.default.forEach(function (weapon) {
        _this.load.image(weapon.id, weapon.image);
    });

    _SecondaryWeapons2.default.forEach(function (weapon) {
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

},{"../lib/PrimaryWeapons":17,"../lib/SecondaryWeapons":19}],5:[function(require,module,exports){
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

},{"../lib/CollisionHandler":8,"../lib/PlayerAngleHandler":12,"../lib/PlayerJumpHandler":15,"../lib/PlayerMovementHandler":16}],6:[function(require,module,exports){
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

var RangerSteveGame = function RangerSteveGame() {
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
};

RangerSteveGame.prototype = {};

game.state.add('Game', RangerSteveGame, true);

},{"./core/Create":2,"./core/Init":3,"./core/Preload":4,"./core/Update":5}],7:[function(require,module,exports){
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

},{"./Guid":10}],8:[function(require,module,exports){
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

module.exports = function guidGenerator() {
   var S4 = function S4() {
      return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
   };

   return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
};

},{}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
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

exports.leftInputIsActive = leftInputIsActive;
exports.rightInputIsActive = rightInputIsActive;
exports.upInputIsActive = upInputIsActive;
exports.upInputReleased = upInputReleased;

},{}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
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

exports.playerFaceLeft = playerFaceLeft;
exports.playerFaceRight = playerFaceRight;

},{}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = PlayerJumpHandler;

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
        this.player.body.velocity.y = this.JUMP_SPEED;
        this.jumping = true;
    } else if (_InputHelpers.upInputIsActive.call(this, 5)) {
        this.jumps = 1;
    }

    // Jump Jet!
    if (this.jumps === 1 && this.input.keyboard.isDown(Phaser.Keyboard.W) && jumpJetCounter > -130000) {
        this.player.body.acceleration.y = this.JUMP_JET_SPEED;
        jumpJetCounter += this.JUMP_JET_SPEED;
    } else {
        this.player.body.acceleration.y = 0;

        if (jumpJetCounter < 0) {
            jumpJetCounter -= this.JUMP_JET_SPEED;
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

},{"./EventHandler":9,"./InputHelpers":11}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = PlayerMovementHandler;

var _PlayerFaceHandler = require('./PlayerFaceHandler');

var _InputHelpers = require('./InputHelpers');

function PlayerMovementHandler() {
    if (_InputHelpers.leftInputIsActive.call(this)) {
        // If the LEFT key is down, set the player velocity to move left
        this.player.body.acceleration.x = -this.ACCELERATION;
        this.player.animations.play('left');

        // Left facing head needs to be set only once
        _PlayerFaceHandler.playerFaceLeft.call(this);
    } else if (_InputHelpers.rightInputIsActive.call(this)) {
        // If the RIGHT key is down, set the player velocity to move right
        this.player.body.acceleration.x = this.ACCELERATION;
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

},{"./InputHelpers":11,"./PlayerFaceHandler":14}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = [{
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
}];

},{}],18:[function(require,module,exports){
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
    newRemotePlayer.player = game.add.sprite(startX, startY, 'commando');

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

},{}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = [{
    id: 'DesertEagle',
    name: 'Desert Eagle',
    image: '/images/guns/Spr_DesertEagle.png',
    minScore: 0
}, {
    id: 'RPG',
    name: 'RPG',
    image: '/images/guns/Spr_RPG.png',
    minScore: 20
}];

},{}],20:[function(require,module,exports){
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

    this.socket.on('bullet fired', _onBulletFired2.default.bind(this));
    this.socket.on('bullet removed', _onBulletRemoved2.default.bind(this));

    this.socket.on('player health update', _onPlayerHealthUpdate2.default.bind(this));

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

var Bullet = require('../Bullet');

module.exports = function (data) {
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
};

},{"../Bullet":7}],22:[function(require,module,exports){
'use strict';

module.exports = function (data) {
    if (data.id === '/#' + this.socket.id) return;

    var removeBullet = _.find(this.weapons[this.currentWeapon].children, {
        bulletId: data.bulletId
    });

    if (!removeBullet) {
        console.log('Bullet not found: ', data.bulletId);
        return;
    }

    removeBullet.kill();
};

},{}],23:[function(require,module,exports){
'use strict';

var _PlayerById = require('../PlayerById');

var _PlayerById2 = _interopRequireDefault(_PlayerById);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (data) {
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
        movePlayer.player.frame = 4;
    }

    movePlayer.lastPosition.x = movePlayer.player.x;
    movePlayer.lastPosition.y = movePlayer.player.y;
};

},{"../PlayerById":13}],24:[function(require,module,exports){
'use strict';

var _EventHandler = require('../EventHandler');

var _EventHandler2 = _interopRequireDefault(_EventHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var damageTimeout = null;
var healingInterval = null;
var lastKnownHealth = null;

module.exports = function (data) {
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
};

},{"../EventHandler":9}],25:[function(require,module,exports){
'use strict';

var _EventHandler = require('../EventHandler');

var _EventHandler2 = _interopRequireDefault(_EventHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (data) {
    if (data.id !== '/#' + this.socket.id) return;

    this.player.meta.health = data.health;
    _EventHandler2.default.emit('health update', String(this.player.meta.health));
};

},{"../EventHandler":9}],26:[function(require,module,exports){
'use strict';

var _EventHandler = require('../EventHandler');

var _EventHandler2 = _interopRequireDefault(_EventHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var HighRuleJungle = require('../../maps/HighRuleJungle');
var Weapons = require('../Weapons');

module.exports = function (data) {
    if (data.damagedPlayerId !== '/#' + this.socket.id) return;

    // Set primary weapon
    this.player.meta.primaryWeapon = new Weapons[this.player.meta.selectedPrimaryWeaponId]({
        game: this.game
    });
    this.player.meta.primaryWeapon.id = this.player.meta.selectedPrimaryWeaponId;

    if (this.currentWeapon === 'primaryWeapon') this.ak47Sprite.loadTexture(this.player.meta.selectedPrimaryWeaponId);

    // Set secondary weapon
    this.player.meta.secondaryWeapon = new Weapons[this.player.meta.selectedSecondaryWeaponId]({
        game: this.game
    });
    this.player.meta.secondaryWeapon.id = this.player.meta.selectedSecondaryWeaponId;

    if (this.currentWeapon === 'secondaryWeapon') this.ak47Sprite.loadTexture(this.player.meta.selectedSecondaryWeaponId);

    // Reset health
    this.player.meta.health = data.health;
    _EventHandler2.default.emit('health update', String(this.player.meta.health));

    // Spawn player
    //
    var spawnPoint = this.mapInstance.getRandomSpawnPoint();
    this.player.x = spawnPoint.x;
    this.player.y = spawnPoint.y;
};

},{"../../maps/HighRuleJungle":42,"../EventHandler":9,"../Weapons":41}],27:[function(require,module,exports){
'use strict';

var _PlayerById = require('../PlayerById');

var _PlayerById2 = _interopRequireDefault(_PlayerById);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (data) {
    var removePlayer = _PlayerById2.default.call(this, data.id);

    // Player not found
    if (!removePlayer) {
        console.log('Player not found: ', data.id);
        return;
    }

    removePlayer.player.kill();

    // Remove player from array
    this.enemies.splice(this.enemies.indexOf(removePlayer), 1);
};

},{"../PlayerById":13}],28:[function(require,module,exports){
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

},{}],29:[function(require,module,exports){
'use strict';

module.exports = function () {
    console.log('Disconnected from socket server');
};

},{}],30:[function(require,module,exports){
'use strict';

var _EventHandler = require('../EventHandler');

var _EventHandler2 = _interopRequireDefault(_EventHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var RemotePlayer = require('../RemotePlayer');


module.exports = function (data) {
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

        var newRemotePlayer = RemotePlayer.call(_this, player.id, _this.game, _this.player, player.x, player.y);
        _this.enemies.push(newRemotePlayer);
        _this.enemies[_this.enemies.length - 1].player.animations.add('left', [0, 1, 2, 3], 10, true);
        _this.enemies[_this.enemies.length - 1].player.animations.add('right', [5, 6, 7, 8], 10, true);
    });
};

},{"../EventHandler":9,"../RemotePlayer":18}],31:[function(require,module,exports){
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
        bullet.height = 3;
        bullet.width = 60;
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

},{"../Bullet":7,"../Guid":10}],32:[function(require,module,exports){
'use strict';

var Bullet = require('../Bullet');
var Guid = require('../Guid');

var AK47 = function AK47(config) {
    Phaser.Group.call(this, config.game, config.game.world, 'AK-47', false, true, Phaser.Physics.ARCADE);

    //	Here we set-up our audio sprite
    this.fx = config.game.add.audio('AUG-sound');
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
    this.fx.volume = .7 * volume;
    this.fx.play();
};

module.exports = AK47;

},{"../Bullet":7,"../Guid":10}],33:[function(require,module,exports){
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

},{"../Bullet":7,"../Guid":10}],34:[function(require,module,exports){
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

},{"../Bullet":7,"../Guid":10}],35:[function(require,module,exports){
'use strict';

var Bullet = require('../Bullet');
var Guid = require('../Guid');

var AK47 = function AK47(config) {
    Phaser.Group.call(this, config.game, config.game.world, 'AK-47', false, true, Phaser.Physics.ARCADE);

    //	Here we set-up our audio sprite
    this.fx = config.game.add.audio('G43-sound');
    this.allowMultiple = true;

    this.damage = 44;
    this.nextFire = 0;
    this.bulletSpeed = 2300;
    this.fireRate = 1300;

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
    this.fx.volume = .85 * volume;
    this.fx.play();
};

module.exports = AK47;

},{"../Bullet":7,"../Guid":10}],36:[function(require,module,exports){
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

},{"../Bullet":7,"../Guid":10}],37:[function(require,module,exports){
'use strict';

var Bullet = require('../Bullet');
var Guid = require('../Guid');

var M500 = function M500(config) {
    Phaser.Group.call(this, config.game, config.game.world, 'Spas-12', false, true, Phaser.Physics.ARCADE);

    this.fx = config.game.add.audio('M500-sound');

    this.nextFire = 0;
    this.bulletSpeed = 1900;
    this.fireRate = 1650;

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

M500.prototype = Object.create(Phaser.Group.prototype);
M500.prototype.constructor = M500;

M500.prototype.fire = function (player, socket, roomId, volume) {
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
};

module.exports = M500;

},{"../Bullet":7,"../Guid":10}],38:[function(require,module,exports){
'use strict';

var Bullet = require('../Bullet');
var Guid = require('../Guid');

var AK47 = function AK47(config) {
    Phaser.Group.call(this, config.game, config.game.world, 'AK-47', false, true, Phaser.Physics.ARCADE);

    //	Here we set-up our audio sprite
    this.fx = config.game.add.audio('P90-sound');
    this.allowMultiple = true;

    this.damage = 22;
    this.nextFire = 0;
    this.bulletSpeed = 2300;
    this.fireRate = 120;

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

},{"../Bullet":7,"../Guid":10}],39:[function(require,module,exports){
'use strict';

var Bullet = require('../Bullet');
var Guid = require('../Guid');

var AK47 = function AK47(config) {
    Phaser.Group.call(this, config.game, config.game.world, 'AK-47', false, true, Phaser.Physics.ARCADE);

    //	Here we set-up our audio sprite
    this.fx = config.game.add.audio('RPG-sound');
    this.allowMultiple = true;

    this.damage = 22;
    this.nextFire = 0;
    this.bulletSpeed = 2300;
    this.fireRate = 3000;

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
    this.fx.volume = .6 * volume;
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

},{"../Bullet":7,"../Guid":10}],40:[function(require,module,exports){
'use strict';

var Bullet = require('../Bullet');
var Guid = require('../Guid');

var AK47 = function AK47(config) {
    Phaser.Group.call(this, config.game, config.game.world, 'AK-47', false, true, Phaser.Physics.ARCADE);

    //	Here we set-up our audio sprite
    this.fx = config.game.add.audio('Skorpion-sound');
    this.allowMultiple = true;

    this.damage = 22;
    this.nextFire = 0;
    this.bulletSpeed = 2300;
    this.fireRate = 120;

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
    this.fx.volume = .8 * volume;
    this.fx.play();
};

module.exports = AK47;

},{"../Bullet":7,"../Guid":10}],41:[function(require,module,exports){
'use strict';

module.exports = {
    "AK47": require('./AK47'),
    "Barrett": require('./Barrett'),
    "DesertEagle": require('./DesertEagle'),
    "M4A1": require('./M4A1'),
    "M500": require('./M500'),
    "Skorpion": require('./Skorpion'),
    "AUG": require('./AUG'),
    "RPG": require('./RPG'),
    "P90": require('./P90'),
    "G43": require('./G43')
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvYXBwLmpzIiwiYXNzZXRzL2pzL2NvcmUvQ3JlYXRlLmpzIiwiYXNzZXRzL2pzL2NvcmUvSW5pdC5qcyIsImFzc2V0cy9qcy9jb3JlL1ByZWxvYWQuanMiLCJhc3NldHMvanMvY29yZS9VcGRhdGUuanMiLCJhc3NldHMvanMvZ2FtZS5qcyIsImFzc2V0cy9qcy9saWIvQnVsbGV0LmpzIiwiYXNzZXRzL2pzL2xpYi9Db2xsaXNpb25IYW5kbGVyLmpzIiwiYXNzZXRzL2pzL2xpYi9FdmVudEhhbmRsZXIuanMiLCJhc3NldHMvanMvbGliL0d1aWQuanMiLCJhc3NldHMvanMvbGliL0lucHV0SGVscGVycy5qcyIsImFzc2V0cy9qcy9saWIvUGxheWVyQW5nbGVIYW5kbGVyLmpzIiwiYXNzZXRzL2pzL2xpYi9QbGF5ZXJCeUlkLmpzIiwiYXNzZXRzL2pzL2xpYi9QbGF5ZXJGYWNlSGFuZGxlci5qcyIsImFzc2V0cy9qcy9saWIvUGxheWVySnVtcEhhbmRsZXIuanMiLCJhc3NldHMvanMvbGliL1BsYXllck1vdmVtZW50SGFuZGxlci5qcyIsImFzc2V0cy9qcy9saWIvUHJpbWFyeVdlYXBvbnMuanMiLCJhc3NldHMvanMvbGliL1JlbW90ZVBsYXllci5qcyIsImFzc2V0cy9qcy9saWIvU2Vjb25kYXJ5V2VhcG9ucy5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL1NldEV2ZW50SGFuZGxlcnMuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vbkJ1bGxldEZpcmVkLmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvb25CdWxsZXRSZW1vdmVkLmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvb25Nb3ZlUGxheWVyLmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvb25QbGF5ZXJEYW1hZ2VkLmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvb25QbGF5ZXJIZWFsdGhVcGRhdGUuanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vblBsYXllclJlc3Bhd24uanMiLCJhc3NldHMvanMvbGliL1NvY2tldEV2ZW50cy9vblJlbW92ZVBsYXllci5qcyIsImFzc2V0cy9qcy9saWIvU29ja2V0RXZlbnRzL29uU29ja2V0Q29ubmVjdGVkLmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvb25Tb2NrZXREaXNjb25uZWN0LmpzIiwiYXNzZXRzL2pzL2xpYi9Tb2NrZXRFdmVudHMvb25VcGRhdGVQbGF5ZXJzLmpzIiwiYXNzZXRzL2pzL2xpYi9XZWFwb25zL0FLNDcuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvQVVHLmpzIiwiYXNzZXRzL2pzL2xpYi9XZWFwb25zL0JhcnJldHQuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvRGVzZXJ0RWFnbGUuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvRzQzLmpzIiwiYXNzZXRzL2pzL2xpYi9XZWFwb25zL000QTEuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvTTUwMC5qcyIsImFzc2V0cy9qcy9saWIvV2VhcG9ucy9QOTAuanMiLCJhc3NldHMvanMvbGliL1dlYXBvbnMvUlBHLmpzIiwiYXNzZXRzL2pzL2xpYi9XZWFwb25zL1Nrb3JwaW9uLmpzIiwiYXNzZXRzL2pzL2xpYi9XZWFwb25zL2luZGV4LmpzIiwiYXNzZXRzL2pzL21hcHMvSGlnaFJ1bGVKdW5nbGUuanMiLCJub2RlX21vZHVsZXMvZC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L29iamVjdC9hc3NpZ24vaW5kZXguanMiLCJub2RlX21vZHVsZXMvZXM1LWV4dC9vYmplY3QvYXNzaWduL2lzLWltcGxlbWVudGVkLmpzIiwibm9kZV9tb2R1bGVzL2VzNS1leHQvb2JqZWN0L2Fzc2lnbi9zaGltLmpzIiwibm9kZV9tb2R1bGVzL2VzNS1leHQvb2JqZWN0L2lzLWNhbGxhYmxlLmpzIiwibm9kZV9tb2R1bGVzL2VzNS1leHQvb2JqZWN0L2tleXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZXM1LWV4dC9vYmplY3Qva2V5cy9pcy1pbXBsZW1lbnRlZC5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L29iamVjdC9rZXlzL3NoaW0uanMiLCJub2RlX21vZHVsZXMvZXM1LWV4dC9vYmplY3Qvbm9ybWFsaXplLW9wdGlvbnMuanMiLCJub2RlX21vZHVsZXMvZXM1LWV4dC9vYmplY3QvdmFsaWQtY2FsbGFibGUuanMiLCJub2RlX21vZHVsZXMvZXM1LWV4dC9vYmplY3QvdmFsaWQtdmFsdWUuanMiLCJub2RlX21vZHVsZXMvZXM1LWV4dC9zdHJpbmcvIy9jb250YWlucy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9lczUtZXh0L3N0cmluZy8jL2NvbnRhaW5zL2lzLWltcGxlbWVudGVkLmpzIiwibm9kZV9tb2R1bGVzL2VzNS1leHQvc3RyaW5nLyMvY29udGFpbnMvc2hpbS5qcyIsIm5vZGVfbW9kdWxlcy9ldmVudC1lbWl0dGVyL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxPQUFPLE9BQVAsR0FBaUI7QUFDYixtQkFBZSxLQUFmO0FBQ0EsYUFBUyxLQUFUO0FBQ0EsbUJBQWUsS0FBZjtBQUNBLG1CQUFlLEtBQWY7QUFDQSxxQkFBaUIsa0JBQWpCO0FBQ0EseUJBQXFCLEtBQXJCO0FBQ0EsZUFBVyxJQUFYO0FBQ0Esb0JBQWdCLEtBQWhCO0FBQ0Esb0JBQWdCLE1BQWhCO0FBQ0EsZUFBVyxNQUFYO0FBQ0EsdUJBQW1CLE1BQW5CO0FBQ0Esa0JBQWMsT0FBZDtBQUNBLGtCQUFjLFFBQWQ7QUFDQSxrQkFBYyxRQUFkO0FBQ0Esa0JBQWMsU0FBZDtDQWZKOzs7QUFtQkEsUUFBUSxRQUFSOzs7Ozs7OztrQkNYd0I7O0FBUnhCOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQSxJQUFNLGFBQWEsSUFBYjtBQUNOLElBQU0sY0FBYyxJQUFkOztBQUVTLFNBQVMsTUFB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QUF5QyxVQUFVLENBQVYsQ0FBekMsRUFERDtBQUVDLFVBRkQ7QUFQQTtBQVdDLFFBQUksVUFBVSxNQUFWLENBREw7QUFFQyxXQUFPLElBQUksS0FBSixDQUFVLElBQUksQ0FBSixDQUFqQixDQUZEO0FBR0MsU0FBSyxJQUFJLENBQUosRUFBTyxJQUFJLENBQUosRUFBTyxFQUFFLENBQUYsRUFBSztBQUN2QixVQUFLLElBQUksQ0FBSixDQUFMLEdBQWMsVUFBVSxDQUFWLENBQWQsQ0FEdUI7S0FBeEI7QUFHQSxVQUFNLElBQU4sQ0FBVyxTQUFYLEVBQXNCLElBQXRCLEVBQTRCLElBQTVCLEVBTkQ7QUFWQSxHQURNO0VBVFA7Q0FQTTs7QUFzQ1AsVUFBVTtBQUNULEtBQUksRUFBSjtBQUNBLE9BQU0sTUFBTjtBQUNBLE1BQUssR0FBTDtBQUNBLE9BQU0sSUFBTjtDQUpEOztBQU9BLGNBQWM7QUFDYixLQUFJLEVBQUUsRUFBRixDQUFKO0FBQ0EsT0FBTSxFQUFFLE1BQUYsQ0FBTjtBQUNBLE1BQUssRUFBRSxHQUFGLENBQUw7QUFDQSxPQUFNLEVBQUUsSUFBRixDQUFOO0NBSkQ7O0FBT0EsT0FBTyxpQkFBaUIsRUFBakIsRUFBcUIsV0FBckIsQ0FBUDs7QUFFQSxPQUFPLE9BQVAsR0FBaUIsVUFBVSxpQkFBVSxDQUFWLEVBQWE7QUFDdkMsUUFBTyxDQUFDLElBQUssSUFBTCxHQUFhLE9BQU8sSUFBUCxDQUFkLEdBQTZCLGlCQUFpQixPQUFPLENBQVAsQ0FBakIsRUFBNEIsV0FBNUIsQ0FBN0IsQ0FEZ0M7Q0FBYjtBQUczQixRQUFRLE9BQVIsR0FBa0IsT0FBbEIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidG9hc3RyLm9wdGlvbnMgPSB7XG4gICAgXCJjbG9zZUJ1dHRvblwiOiBmYWxzZSxcbiAgICBcImRlYnVnXCI6IGZhbHNlLFxuICAgIFwibmV3ZXN0T25Ub3BcIjogZmFsc2UsXG4gICAgXCJwcm9ncmVzc0JhclwiOiBmYWxzZSxcbiAgICBcInBvc2l0aW9uQ2xhc3NcIjogXCJ0b2FzdC10b3AtY2VudGVyXCIsXG4gICAgXCJwcmV2ZW50RHVwbGljYXRlc1wiOiBmYWxzZSxcbiAgICBcIm9uY2xpY2tcIjogbnVsbCxcbiAgICBcInNob3dEdXJhdGlvblwiOiBcIjMwMFwiLFxuICAgIFwiaGlkZUR1cmF0aW9uXCI6IFwiMTAwMFwiLFxuICAgIFwidGltZU91dFwiOiBcIjMwMDBcIixcbiAgICBcImV4dGVuZGVkVGltZU91dFwiOiBcIjEwMDBcIixcbiAgICBcInNob3dFYXNpbmdcIjogXCJzd2luZ1wiLFxuICAgIFwiaGlkZUVhc2luZ1wiOiBcImxpbmVhclwiLFxuICAgIFwic2hvd01ldGhvZFwiOiBcImZhZGVJblwiLFxuICAgIFwiaGlkZU1ldGhvZFwiOiBcImZhZGVPdXRcIlxufVxuXG4vLyByZXF1aXJlKCcuL3VpJylcbnJlcXVpcmUoJy4vZ2FtZScpXG4iLCJpbXBvcnQgU2V0RXZlbnRIYW5kbGVycyBmcm9tICcuLi9saWIvU29ja2V0RXZlbnRzL1NldEV2ZW50SGFuZGxlcnMnXG5pbXBvcnQgRXZlbnRIYW5kbGVyIGZyb20gJy4uL2xpYi9FdmVudEhhbmRsZXInXG5pbXBvcnQgSGlnaFJ1bGVKdW5nbGUgZnJvbSAnLi4vbWFwcy9IaWdoUnVsZUp1bmdsZSdcbmltcG9ydCBXZWFwb25zIGZyb20gJy4uL2xpYi9XZWFwb25zJ1xuXG5jb25zdCB3b3JsZFdpZHRoID0gODAwMFxuY29uc3Qgd29ybGRIZWlnaHQgPSAzOTY2XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIENyZWF0ZSgpIHtcbiAgICAvLyBEZWZpbmUgbW92ZW1lbnQgY29uc3RhbnRzXG4gICAgdGhpcy5NQVhfU1BFRUQgPSA2MDBcbiAgICB0aGlzLkFDQ0VMRVJBVElPTiA9IDE5NjBcbiAgICB0aGlzLkRSQUcgPSAxNTAwXG4gICAgdGhpcy5HUkFWSVRZID0gMTkwMFxuICAgIHRoaXMuSlVNUF9TUEVFRCA9IC04NTBcbiAgICB0aGlzLkpVTVBfSkVUX1NQRUVEID0gLTI0MDBcblxuICAgIHRoaXMuc29ja2V0ID0gaW8uY29ubmVjdCgpXG4gICAgdGhpcy5lbmVtaWVzID0gW11cbiAgICB0aGlzLnZvbHVtZSA9IC41XG4gICAgdGhpcy5lbmVteUJ1bGxldHMgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKClcblxuICAgIC8vICBXZSdyZSBnb2luZyB0byBiZSB1c2luZyBwaHlzaWNzLCBzbyBlbmFibGUgdGhlIEFyY2FkZSBQaHlzaWNzIHN5c3RlbVxuICAgIHRoaXMucGh5c2ljcy5zdGFydFN5c3RlbShQaGFzZXIuUGh5c2ljcy5BUkNBREUpXG5cbiAgICB0aGlzLndvcmxkLnNldEJvdW5kcygwLCAwLCB3b3JsZFdpZHRoLCB3b3JsZEhlaWdodClcblxuICAgIC8vIFNjYWxlIGdhbWUgb24gd2luZG93IHJlc2l6ZVxuICAgIHRoaXMuZ2FtZS5zY2FsZS5zY2FsZU1vZGUgPSBQaGFzZXIuU2NhbGVNYW5hZ2VyLlJFU0laRVxuICAgIHRoaXMuZ2FtZS5zY2FsZS5zZXRTaG93QWxsKClcbiAgICB0aGlzLmdhbWUuc2NhbGUucmVmcmVzaCgpXG5cblxuICAgIC8qKlxuICAgICAqIE1hcFxuICAgICAqL1xuICAgIHRoaXMubWFwSW5zdGFuY2UgPSBuZXcgSGlnaFJ1bGVKdW5nbGUodGhpcylcbiAgICB0aGlzLm1hcEluc3RhbmNlLmNyZWF0ZSgpXG5cblxuICAgIC8qKlxuICAgICAqIFBsYXllciBTZXR0aW5nc1xuICAgICAqL1xuICAgIGxldCBzcGF3blBvaW50ID0gdGhpcy5tYXBJbnN0YW5jZS5nZXRSYW5kb21TcGF3blBvaW50KClcbiAgICB0aGlzLnBsYXllciA9IHRoaXMuYWRkLnNwcml0ZShzcGF3blBvaW50LngsIHNwYXduUG9pbnQueSwgJ2NvbW1hbmRvJylcbiAgICB0aGlzLnBsYXllci5zY2FsZS5zZXRUbyguMjcpXG4gICAgdGhpcy5wbGF5ZXIuYW5jaG9yLnNldFRvKC41KVxuXG4gICAgLy8gIFdlIG5lZWQgdG8gZW5hYmxlIHBoeXNpY3Mgb24gdGhlIHBsYXllclxuICAgIHRoaXMucGh5c2ljcy5hcmNhZGUuZW5hYmxlKHRoaXMucGxheWVyKVxuXG4gICAgLy8gRW5hYmxlIHBoeXNpY3Mgb24gdGhlIHBsYXllclxuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmVuYWJsZSh0aGlzLnBsYXllciwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKVxuXG4gICAgLy8gTWFrZSBwbGF5ZXIgY29sbGlkZSB3aXRoIHdvcmxkIGJvdW5kYXJpZXMgc28gaGUgZG9lc24ndCBsZWF2ZSB0aGUgc3RhZ2VcbiAgICB0aGlzLnBsYXllci5ib2R5LmNvbGxpZGVXb3JsZEJvdW5kcyA9IHRydWVcblxuICAgIC8vIFNldCBwbGF5ZXIgbWluaW11bSBhbmQgbWF4aW11bSBtb3ZlbWVudCBzcGVlZFxuICAgIHRoaXMucGxheWVyLmJvZHkubWF4VmVsb2NpdHkuc2V0VG8odGhpcy5NQVhfU1BFRUQsIHRoaXMuTUFYX1NQRUVEICogMTApIC8vIHgsIHlcblxuICAgIC8vIEFkZCBkcmFnIHRvIHRoZSBwbGF5ZXIgdGhhdCBzbG93cyB0aGVtIGRvd24gd2hlbiB0aGV5IGFyZSBub3QgYWNjZWxlcmF0aW5nXG4gICAgdGhpcy5wbGF5ZXIuYm9keS5kcmFnLnNldFRvKHRoaXMuRFJBRywgMCkgLy8geCwgeVxuICAgIHRoaXMucGxheWVyLmJvZHkuc2V0U2l6ZSgyMzAsIDI5MCwgLTEwLCAwKVxuICAgIHRoaXMucGxheWVyLm1ldGEgPSB7XG4gICAgICAgIGhlYWx0aDogMTAwXG4gICAgfVxuXG4gICAgLy8gU2luY2Ugd2UncmUganVtcGluZyB3ZSBuZWVkIGdyYXZpdHlcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5hcmNhZGUuZ3Jhdml0eS55ID0gdGhpcy5HUkFWSVRZXG5cbiAgICAvLyBGbGFnIHRvIHRyYWNrIGlmIHRoZSBqdW1wIGJ1dHRvbiBpcyBwcmVzc2VkXG4gICAgdGhpcy5qdW1waW5nID0gZmFsc2VcblxuICAgIC8vICBPdXIgdHdvIGFuaW1hdGlvbnMsIHdhbGtpbmcgbGVmdCBhbmQgcmlnaHQuXG4gICAgdGhpcy5wbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ2xlZnQnLCBbMCwgMSwgMiwgMywgNCwgNV0sIDEwLCB0cnVlKVxuICAgIHRoaXMucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdyaWdodCcsIFs4LCA5LCAxMCwgMTEsIDEyLCAxM10sIDEwLCB0cnVlKVxuXG4gICAgdGhpcy5wbGF5ZXIubWV0YSA9IHtcbiAgICAgICAgaGVhbHRoOiAxMDAsXG4gICAgICAgIHByaW1hcnlXZWFwb246IG5ldyBXZWFwb25zLkFLNDcoe1xuICAgICAgICAgICAgZ2FtZTogdGhpcy5nYW1lXG4gICAgICAgIH0pLFxuICAgICAgICBzZWNvbmRhcnlXZWFwb246IG5ldyBXZWFwb25zLkRlc2VydEVhZ2xlKHtcbiAgICAgICAgICAgIGdhbWU6IHRoaXMuZ2FtZVxuICAgICAgICB9KSxcbiAgICAgICAgc2VsZWN0ZWRQcmltYXJ5V2VhcG9uSWQ6ICdBSzQ3JyxcbiAgICAgICAgc2VsZWN0ZWRTZWNvbmRhcnlXZWFwb25JZDogJ0Rlc2VydEVhZ2xlJ1xuICAgIH1cblxuICAgIHRoaXMucGxheWVyLm1ldGEucHJpbWFyeVdlYXBvbi5pZCA9ICdBSzQ3J1xuICAgIHRoaXMucGxheWVyLm1ldGEuc2Vjb25kYXJ5V2VhcG9uLmlkID0gJ0Rlc2VydEVhZ2xlJ1xuXG4gICAgdGhpcy5sZWZ0QXJtR3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKClcbiAgICB0aGlzLnJpZ2h0QXJtR3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKClcbiAgICB0aGlzLmhlYWRHcm91cCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKVxuICAgIHRoaXMudG9yc29Hcm91cCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKVxuXG4gICAgLy8gVG9yc29cbiAgICB0aGlzLnRvcnNvU3ByaXRlID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUoLTM3LCAtMTA1LCAndG9yc28nKVxuICAgIHRoaXMudG9yc29TcHJpdGUuc2NhbGUuc2V0VG8oMS44KVxuICAgIHRoaXMudG9yc29Hcm91cC5hZGQodGhpcy50b3Jzb1Nwcml0ZSlcblxuICAgIC8vIEhlYWRcbiAgICB0aGlzLmhlYWRTcHJpdGUgPSB0aGlzLmdhbWUuYWRkLnNwcml0ZSgwLCAtMTQ4LCAnaGVhZCcpXG4gICAgdGhpcy5oZWFkU3ByaXRlLnNjYWxlLnNldFRvKDEuOClcbiAgICB0aGlzLmhlYWRHcm91cC5hZGQodGhpcy5oZWFkU3ByaXRlKVxuXG4gICAgLy8gTGVmdCBhcm1cbiAgICB0aGlzLmxlZnRBcm1TcHJpdGUgPSB0aGlzLmdhbWUuYWRkLnNwcml0ZSgwLCAwLCAnbGVmdC1hcm0nKVxuICAgIHRoaXMubGVmdEFybVNwcml0ZS5hbmNob3Iuc2V0VG8oLjIsIC4yKVxuICAgIHRoaXMubGVmdEFybVNwcml0ZS5zY2FsZS5zZXRUbygxLjYpXG4gICAgdGhpcy5sZWZ0QXJtU3ByaXRlLnJvdGF0aW9uID0gODAuMVxuICAgIHRoaXMubGVmdEFybUdyb3VwLmFkZCh0aGlzLmxlZnRBcm1TcHJpdGUpXG5cbiAgICAvLyBHdW5cbiAgICB0aGlzLmFrNDdTcHJpdGUgPSB0aGlzLmdhbWUuYWRkLnNwcml0ZSgxMiwgMTksICdBSzQ3JylcbiAgICB0aGlzLmFrNDdTcHJpdGUuc2NhbGUuc2V0VG8oMS4zKVxuICAgIHRoaXMuYWs0N1Nwcml0ZS5yb3RhdGlvbiA9IDgwLjE1XG5cbiAgICAvLyBSaWdodCBhcm1cbiAgICB0aGlzLnJpZ2h0QXJtR3JvdXAuYWRkKHRoaXMuYWs0N1Nwcml0ZSlcbiAgICB0aGlzLnJpZ2h0QXJtU3ByaXRlID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUoMCwgMCwgJ3JpZ2h0LWFybScpXG4gICAgdGhpcy5yaWdodEFybVNwcml0ZS5hbmNob3Iuc2V0VG8oLjIsIC4yNClcbiAgICB0aGlzLnJpZ2h0QXJtU3ByaXRlLnNjYWxlLnNldFRvKDEuNylcbiAgICB0aGlzLnJpZ2h0QXJtU3ByaXRlLnJvdGF0aW9uID0gODAuMVxuICAgIHRoaXMucmlnaHRBcm1Hcm91cC5hZGQodGhpcy5yaWdodEFybVNwcml0ZSlcblxuICAgIHRoaXMucGxheWVyLmFkZENoaWxkKHRoaXMubGVmdEFybUdyb3VwKVxuICAgIHRoaXMubGVmdEFybUdyb3VwLnBpdm90LnggPSAwXG4gICAgdGhpcy5sZWZ0QXJtR3JvdXAucGl2b3QueSA9IDBcbiAgICB0aGlzLmxlZnRBcm1Hcm91cC54ID0gNDVcbiAgICB0aGlzLmxlZnRBcm1Hcm91cC55ID0gLTcwXG5cbiAgICB0aGlzLnBsYXllci5hZGRDaGlsZCh0aGlzLnRvcnNvR3JvdXApXG4gICAgdGhpcy5wbGF5ZXIuYWRkQ2hpbGQodGhpcy5oZWFkR3JvdXApXG5cbiAgICB0aGlzLnBsYXllci5hZGRDaGlsZCh0aGlzLnJpZ2h0QXJtR3JvdXApXG4gICAgdGhpcy5yaWdodEFybUdyb3VwLnBpdm90LnggPSAwXG4gICAgdGhpcy5yaWdodEFybUdyb3VwLnBpdm90LnkgPSAwXG4gICAgdGhpcy5yaWdodEFybUdyb3VwLnggPSAtMjVcbiAgICB0aGlzLnJpZ2h0QXJtR3JvdXAueSA9IC02NVxuXG5cbiAgICAvKipcbiAgICAgKiBXZWFwb25zXG4gICAgICovXG4gICAgdGhpcy5jdXJyZW50V2VhcG9uID0gJ3ByaW1hcnlXZWFwb24nXG5cblxuICAgIC8qKlxuICAgICAqIFRleHRcbiAgICAgKi9cbiAgICBsZXQgdGV4dFN0eWxlcyA9IHsgZm9udFNpemU6ICcxNHB4JywgZmlsbDogJyMwMDAnIH1cblxuICAgIEV2ZW50SGFuZGxlci5lbWl0KCdzY29yZSB1cGRhdGUnLCAnJylcbiAgICBFdmVudEhhbmRsZXIuZW1pdCgnaGVhbHRoIHVwZGF0ZScsICcnKVxuICAgIEV2ZW50SGFuZGxlci5vbigndm9sdW1lIHVwZGF0ZScsIChkYXRhKSA9PiB7XG4gICAgICAgIHRoaXMudm9sdW1lID0gZGF0YS52b2x1bWVcbiAgICB9KVxuXG4gICAgRXZlbnRIYW5kbGVyLm9uKCdwcmltYXJ5IHdlYXBvbiB1cGRhdGUnLCAod2VhcG9uKSA9PiB7XG4gICAgICAgIHRoaXMucGxheWVyLm1ldGEuc2VsZWN0ZWRQcmltYXJ5V2VhcG9uSWQgPSB3ZWFwb24uaWRcbiAgICB9KVxuXG4gICAgRXZlbnRIYW5kbGVyLm9uKCdzZWNvbmRhcnkgd2VhcG9uIHVwZGF0ZScsICh3ZWFwb24pID0+IHtcbiAgICAgICAgdGhpcy5wbGF5ZXIubWV0YS5zZWxlY3RlZFNlY29uZGFyeVdlYXBvbklkID0gd2VhcG9uLmlkXG4gICAgfSlcblxuICAgIHRoaXMucG9zaXRpb25UZXh0ID0gdGhpcy5hZGQudGV4dCgyNSwgMjUsIGAke3RoaXMuZ2FtZS5pbnB1dC5tb3VzZVBvaW50ZXIueH0sJHt0aGlzLmdhbWUuaW5wdXQubW91c2VQb2ludGVyLnl9YCwgdGV4dFN0eWxlcylcbiAgICB0aGlzLnBvc2l0aW9uVGV4dC5maXhlZFRvQ2FtZXJhID0gdHJ1ZVxuXG5cbiAgICAvKipcbiAgICAgKiBDYW1lcmEgU2V0dGluZ3NcbiAgICAgKi9cbiAgICB0aGlzLmNhbWVyYS5mb2xsb3codGhpcy5wbGF5ZXIpXG5cblxuICAgIC8qKlxuICAgICAqIFJlc2l6aW5nIEV2ZW50c1xuICAgICAqL1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuZ2FtZS5zY2FsZS5yZWZyZXNoKClcbiAgICAgICAgdGhpcy5nYW1lLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodFxuICAgICAgICB0aGlzLmdhbWUud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aFxuICAgIH0pXG5cblxuICAgIC8qKlxuICAgICAqIEtleWJvYXJkIEV2ZW50c1xuICAgICAqL1xuICAgIC8vIE9wZW4gc2V0dGluZ3MgbW9kYWxcbiAgICB0aGlzLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuVEFCKS5vbkRvd24uYWRkKGZ1bmN0aW9uKCkge1xuICAgICAgICBFdmVudEhhbmRsZXIuZW1pdCgnc2V0dGluZ3Mgb3BlbicpXG4gICAgfSlcblxuICAgIC8vIFN3aXRjaCB3ZWFwb25zXG4gICAgdGhpcy5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLlEpLm9uRG93bi5hZGQoKCkgPT4ge1xuICAgICAgICB0aGlzLmN1cnJlbnRXZWFwb24gPSB0aGlzLmN1cnJlbnRXZWFwb24gPT09ICdwcmltYXJ5V2VhcG9uJ1xuICAgICAgICAgICAgPyAnc2Vjb25kYXJ5V2VhcG9uJ1xuICAgICAgICAgICAgOiAncHJpbWFyeVdlYXBvbidcbiAgICAgICAgdGhpcy5hazQ3U3ByaXRlLmxvYWRUZXh0dXJlKHRoaXMucGxheWVyLm1ldGFbdGhpcy5jdXJyZW50V2VhcG9uXS5pZClcbiAgICB9KVxuXG5cbiAgICAvKipcbiAgICAgKiBTdGFydCBsaXN0ZW5pbmcgZm9yIGV2ZW50c1xuICAgICAqL1xuICAgIFNldEV2ZW50SGFuZGxlcnMuY2FsbCh0aGlzKVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gSW5pdCgpIHtcbiAgICB0aGlzLmdhbWUucmVuZGVyZXIucmVuZGVyU2Vzc2lvbi5yb3VuZFBpeGVscyA9IHRydWVcbiAgICB0aGlzLmdhbWUuc3RhZ2UuZGlzYWJsZVZpc2liaWxpdHlDaGFuZ2UgPSB0cnVlXG59XG4iLCJpbXBvcnQgcHJpbWFyeVdlYXBvbnMgZnJvbSAnLi4vbGliL1ByaW1hcnlXZWFwb25zJ1xuaW1wb3J0IHNlY29uZGFyeVdlYXBvbnMgZnJvbSAnLi4vbGliL1NlY29uZGFyeVdlYXBvbnMnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFByZWxvYWQoKSB7XG4gICAgdGhpcy5sb2FkLmltYWdlKCdtYXAtYmcnLCAnL2ltYWdlcy9oaWdoLXJ1bGUtZGVzZXJ0LnBuZycpXG4gICAgdGhpcy5sb2FkLmltYWdlKCdncm91bmQnLCAnL2ltYWdlcy9wbGF0Zm9ybS5wbmcnKVxuICAgIHRoaXMubG9hZC5pbWFnZSgnYnVsbGV0MTInLCAnL2ltYWdlcy9idWxsZXQucG5nJylcblxuICAgIHRoaXMubG9hZC5zcHJpdGVzaGVldCgnZHVkZScsICcvaW1hZ2VzL2R1ZGUucG5nJywgMzIsIDQ4KVxuICAgIHRoaXMubG9hZC5zcHJpdGVzaGVldCgnY29tbWFuZG8nLCAnL2ltYWdlcy9jb21tYW5kby5wbmcnLCAzMDAsIDMxNSlcbiAgICB0aGlzLmxvYWQuc3ByaXRlc2hlZXQoJ2VuZW15JywgJy9pbWFnZXMvZHVkZS5wbmcnLCAzMiwgNDgpXG5cbiAgICAvLyBXZWFwb25zXG4gICAgcHJpbWFyeVdlYXBvbnMuZm9yRWFjaCgod2VhcG9uKSA9PiB7XG4gICAgICAgIHRoaXMubG9hZC5pbWFnZSh3ZWFwb24uaWQsIHdlYXBvbi5pbWFnZSlcbiAgICB9KVxuXG4gICAgc2Vjb25kYXJ5V2VhcG9ucy5mb3JFYWNoKCh3ZWFwb24pID0+IHtcbiAgICAgICAgdGhpcy5sb2FkLmltYWdlKHdlYXBvbi5pZCwgd2VhcG9uLmltYWdlKVxuICAgIH0pXG5cbiAgICB0aGlzLmxvYWQuaW1hZ2UoJ3JpZ2h0LWFybScsICcvaW1hZ2VzL2JvZHkvcmlnaHQtYXJtLnBuZycpXG4gICAgdGhpcy5sb2FkLmltYWdlKCdsZWZ0LWFybScsICcvaW1hZ2VzL2JvZHkvbGVmdC1hcm0ucG5nJylcbiAgICB0aGlzLmxvYWQuaW1hZ2UoJ2hlYWQnLCAnL2ltYWdlcy9ib2R5L2hlYWQucG5nJylcbiAgICB0aGlzLmxvYWQuaW1hZ2UoJ3RvcnNvJywgJy9pbWFnZXMvYm9keS90b3Jzby5wbmcnKVxuXG4gICAgdGhpcy5sb2FkLmF1ZGlvKCdBSzQ3LXNvdW5kJywgJy9hdWRpby9BSzQ3Lm9nZycpXG4gICAgdGhpcy5sb2FkLmF1ZGlvKCdNNTAwLXNvdW5kJywgJy9hdWRpby9NNTAwLm9nZycpXG4gICAgdGhpcy5sb2FkLmF1ZGlvKCdTa29ycGlvbi1zb3VuZCcsICcvYXVkaW8vU2tvcnBpb24ub2dnJylcbiAgICB0aGlzLmxvYWQuYXVkaW8oJ0FVRy1zb3VuZCcsICcvYXVkaW8vQVVHLm9nZycpXG4gICAgdGhpcy5sb2FkLmF1ZGlvKCdHNDMtc291bmQnLCAnL2F1ZGlvL0c0My5vZ2cnKVxuICAgIHRoaXMubG9hZC5hdWRpbygnUDkwLXNvdW5kJywgJy9hdWRpby9QOTAub2dnJylcbiAgICB0aGlzLmxvYWQuYXVkaW8oJ000QTEtc291bmQnLCAnL2F1ZGlvL000QTEub2dnJylcbiAgICB0aGlzLmxvYWQuYXVkaW8oJ0JhcnJldE05MC1zb3VuZCcsICcvYXVkaW8vQmFycmV0TTkwLm9nZycpXG5cbiAgICB0aGlzLmxvYWQuYXVkaW8oJ0Rlc2VydEVhZ2xlLXNvdW5kJywgJy9hdWRpby9EZXNlcnRFYWdsZS5vZ2cnKVxuICAgIHRoaXMubG9hZC5hdWRpbygnUlBHLXNvdW5kJywgJy9hdWRpby9SUEcub2dnJylcbn1cbiIsImltcG9ydCBDb2xsaXNpb25IYW5kbGVyIGZyb20gJy4uL2xpYi9Db2xsaXNpb25IYW5kbGVyJ1xuaW1wb3J0IFBsYXllck1vdmVtZW50SGFuZGxlciBmcm9tICcuLi9saWIvUGxheWVyTW92ZW1lbnRIYW5kbGVyJ1xuaW1wb3J0IFBsYXllckp1bXBIYW5kbGVyIGZyb20gJy4uL2xpYi9QbGF5ZXJKdW1wSGFuZGxlcidcbmltcG9ydCBQbGF5ZXJBbmdsZUhhbmRsZXIgZnJvbSAnLi4vbGliL1BsYXllckFuZ2xlSGFuZGxlcidcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gVXBkYXRlKCkge1xuICAgIENvbGxpc2lvbkhhbmRsZXIuY2FsbCh0aGlzKVxuICAgIFBsYXllck1vdmVtZW50SGFuZGxlci5jYWxsKHRoaXMpXG4gICAgUGxheWVySnVtcEhhbmRsZXIuY2FsbCh0aGlzKVxuICAgIFBsYXllckFuZ2xlSGFuZGxlci5jYWxsKHRoaXMpXG5cbiAgICBpZiAodGhpcy5nYW1lLmlucHV0LmFjdGl2ZVBvaW50ZXIuaXNEb3duKVxuICAgIHtcbiAgICAgICAgdGhpcy5wbGF5ZXIubWV0YVt0aGlzLmN1cnJlbnRXZWFwb25dLmZpcmUodGhpcy5wbGF5ZXIsIHRoaXMuc29ja2V0LCB0aGlzLnJvb21JZCwgdGhpcy52b2x1bWUpXG4gICAgfVxuXG4gICAgdGhpcy5wb3NpdGlvblRleHQudGV4dCA9IGAke3RoaXMuZ2FtZS5pbnB1dC53b3JsZFh9LCAke3RoaXMuZ2FtZS5pbnB1dC53b3JsZFl9YFxuXG4gICAgLy8gQ2hlY2sgZm9yIG91dCBvZiBib3VuZHMga2lsbFxuICAgIGlmICh0aGlzLnBsYXllci5ib2R5Lm9uRmxvb3IoKSkge1xuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdwbGF5ZXIgZGFtYWdlZCcsIHtcbiAgICAgICAgICAgIHJvb21JZDogdGhpcy5yb29tSWQsXG4gICAgICAgICAgICBkYW1hZ2U6IDEwMDAsXG4gICAgICAgICAgICBkYW1hZ2VkUGxheWVySWQ6ICcvIycgKyB0aGlzLnNvY2tldC5pZCxcbiAgICAgICAgICAgIGF0dGFja2luZ1BsYXllcklkOiBudWxsXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgdGhpcy5zb2NrZXQuZW1pdCgnbW92ZSBwbGF5ZXInLCB7XG4gICAgICAgIHJvb21JZDogdGhpcy5yb29tSWQsXG4gICAgICAgIHg6IHRoaXMucGxheWVyLngsXG4gICAgICAgIHk6IHRoaXMucGxheWVyLnlcbiAgICB9KVxufVxuIiwiaW1wb3J0IGluaXQgZnJvbSAnLi9jb3JlL0luaXQnXG5pbXBvcnQgcHJlbG9hZCBmcm9tICcuL2NvcmUvUHJlbG9hZCdcbmltcG9ydCB1cGRhdGUgZnJvbSAnLi9jb3JlL1VwZGF0ZSdcbmltcG9ydCBjcmVhdGUgZnJvbSAnLi9jb3JlL0NyZWF0ZSdcblxuY29uc3QgZ2FtZVdpZHRoID0gd2luZG93LmlubmVyV2lkdGhcbmNvbnN0IGdhbWVIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHRcbmxldCBnYW1lID0gbmV3IFBoYXNlci5HYW1lKGdhbWVXaWR0aCwgZ2FtZUhlaWdodCwgUGhhc2VyLkFVVE8sICdyYW5nZXItc3RldmUtZ2FtZScpXG5cbmxldCBSYW5nZXJTdGV2ZUdhbWUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmN1cnJlbnRXZWFwb24gPSAwXG4gICAgdGhpcy5lbmVtaWVzID0gW11cbiAgICB0aGlzLmdyb3VuZFxuICAgIHRoaXMucGxhdGZvcm1zXG4gICAgdGhpcy5wbGF5ZXJcbiAgICB0aGlzLnNvY2tldFxuXG4gICAgdGhpcy5nYW1lID0gZ2FtZVxuICAgIHRoaXMuaW5pdCA9IGluaXRcbiAgICB0aGlzLnByZWxvYWQgPSBwcmVsb2FkXG4gICAgdGhpcy5jcmVhdGUgPSBjcmVhdGVcbiAgICB0aGlzLnVwZGF0ZSA9IHVwZGF0ZVxufVxuXG5SYW5nZXJTdGV2ZUdhbWUucHJvdG90eXBlID0ge1xuXG59XG5cbmdhbWUuc3RhdGUuYWRkKCdHYW1lJywgUmFuZ2VyU3RldmVHYW1lLCB0cnVlKVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBHdWlkID0gcmVxdWlyZSgnLi9HdWlkJylcblxudmFyIEJ1bGxldCA9IGZ1bmN0aW9uIChnYW1lLCBrZXkpIHtcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgMCwgMCwga2V5KVxuICAgIHRoaXMudGV4dHVyZS5iYXNlVGV4dHVyZS5zY2FsZU1vZGUgPSBQSVhJLnNjYWxlTW9kZXMuTkVBUkVTVFxuICAgIHRoaXMuYW5jaG9yLnNldCgwLjUpXG4gICAgdGhpcy5jaGVja1dvcmxkQm91bmRzID0gdHJ1ZVxuICAgIHRoaXMub3V0T2ZCb3VuZHNLaWxsID0gdHJ1ZVxuICAgIHRoaXMuZXhpc3RzID0gZmFsc2VcbiAgICB0aGlzLnRyYWNraW5nID0gZmFsc2VcbiAgICB0aGlzLnNjYWxlU3BlZWQgPSAwXG59XG5cbkJ1bGxldC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TcHJpdGUucHJvdG90eXBlKVxuQnVsbGV0LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEJ1bGxldFxuXG5CdWxsZXQucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbiAoeCwgeSwgYW5nbGUsIHNwZWVkLCBneCwgZ3ksIHNvY2tldCwgcm9vbUlkKSB7XG4gICAgdGhpcy5yZXNldCh4LCB5KVxuXG4gICAgbGV0IHBvaW50ZXJBbmdsZSA9IHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS5tb3ZlVG9Qb2ludGVyKHRoaXMsIHNwZWVkKVxuICAgIHRoaXMuYm9keS5ncmF2aXR5LnkgPSAtMTgwMFxuXG4gICAgY29uc29sZS5sb2coJ0ZpcmluZyBidWxsZXQgbG9jYWxseScsIHRoaXMuYnVsbGV0SWQpXG5cbiAgICBzb2NrZXQuZW1pdCgnYnVsbGV0IGZpcmVkJywge1xuICAgICAgICByb29tSWQ6IHJvb21JZCxcbiAgICAgICAgYnVsbGV0SWQ6IHRoaXMuYnVsbGV0SWQsXG4gICAgICAgIHBsYXllcklkOiAnLyMnICsgc29ja2V0LmlkLFxuICAgICAgICB4LFxuICAgICAgICB5LFxuICAgICAgICBhbmdsZSxcbiAgICAgICAgc3BlZWQsXG4gICAgICAgIGd4LFxuICAgICAgICBneSxcbiAgICAgICAgcG9pbnRlckFuZ2xlLFxuICAgICAgICBoZWlnaHQ6IHRoaXMuaGVpZ2h0LFxuICAgICAgICB3aWR0aDogdGhpcy53aWR0aCxcbiAgICAgICAgZGFtYWdlOiB0aGlzLmRhbWFnZVxuICAgIH0pXG59XG5cbkJ1bGxldC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnRyYWNraW5nKSB7XG4gICAgICAgIHRoaXMucm90YXRpb24gPSBNYXRoLmF0YW4yKHRoaXMuYm9keS52ZWxvY2l0eS55LCB0aGlzLmJvZHkudmVsb2NpdHkueClcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQnVsbGV0XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBDb2xsaXNpb25IYW5kbGVyKCkge1xuICAgIC8vIENvbGxpZGUgdGhpcyBwbGF5ZXIgd2l0aCB0aGUgbWFwXG4gICAgdGhpcy5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMucGxheWVyLCB0aGlzLnBsYXRmb3JtcywgbnVsbCwgbnVsbCwgdGhpcylcblxuICAgIC8vIERpZCB0aGlzIHBsYXllcidzIGJ1bGxldHMgaGl0IGFueSBwbGF0Zm9ybXNcbiAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5wbGF0Zm9ybXMsIHRoaXMucGxheWVyLm1ldGEucHJpbWFyeVdlYXBvbiwgKHBsYXRmb3JtLCB3ZWFwb24pID0+IHtcbiAgICAgICAgd2VhcG9uLmtpbGwoKVxuICAgIH0sIG51bGwsIHRoaXMpXG5cbiAgICB0aGlzLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUodGhpcy5wbGF0Zm9ybXMsIHRoaXMucGxheWVyLm1ldGEuc2Vjb25kYXJ5V2VhcG9uLCAocGxhdGZvcm0sIHdlYXBvbikgPT4ge1xuICAgICAgICB3ZWFwb24ua2lsbCgpXG4gICAgfSwgbnVsbCwgdGhpcylcblxuICAgIC8vIERpZCBlbmVteSBidWxsZXRzIGhpdCBhbnkgcGxhdGZvcm1zXG4gICAgdGhpcy5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHRoaXMucGxhdGZvcm1zLCB0aGlzLmVuZW15QnVsbGV0cywgKHBsYXRmb3JtLCBidWxsZXQpID0+IHtcbiAgICAgICAgYnVsbGV0LmtpbGwoKVxuICAgIH0sIG51bGwsIHRoaXMpXG5cbiAgICAvLyBEaWQgdGhpcyBwbGF5ZXIgZ2V0IGhpdCBieSBhbnkgZW5lbXkgYnVsbGV0c1xuICAgIHRoaXMucGh5c2ljcy5hcmNhZGUuY29sbGlkZSh0aGlzLnBsYXllciwgdGhpcy5lbmVteUJ1bGxldHMsIG51bGwsIChwbGF5ZXIsIGJ1bGxldCkgPT4ge1xuICAgICAgICBidWxsZXQua2lsbCgpXG5cbiAgICAgICAgY29uc29sZS5sb2coJ1lvdSB3ZXJlIGhpdCBieScsIGJ1bGxldC5idWxsZXRJZClcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnYnVsbGV0IHJlbW92ZWQnLCB7XG4gICAgICAgICAgICByb29tSWQ6IHRoaXMucm9vbUlkLFxuICAgICAgICAgICAgYnVsbGV0SWQ6IGJ1bGxldC5idWxsZXRJZFxuICAgICAgICB9KVxuXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ3BsYXllciBkYW1hZ2VkJywge1xuICAgICAgICAgICAgcm9vbUlkOiB0aGlzLnJvb21JZCxcbiAgICAgICAgICAgIGRhbWFnZTogYnVsbGV0LmRhbWFnZSxcbiAgICAgICAgICAgIGRhbWFnZWRQbGF5ZXJJZDogJy8jJyArIHRoaXMuc29ja2V0LmlkLFxuICAgICAgICAgICAgYXR0YWNraW5nUGxheWVySWQ6IGJ1bGxldC5wbGF5ZXJJZFxuICAgICAgICB9KVxuXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIH0sIHRoaXMpXG59XG4iLCJpbXBvcnQgZW1pdHRlciBmcm9tICdldmVudC1lbWl0dGVyJ1xuXG5sZXQgRXZlbnRIYW5kbGVyID0gZW1pdHRlcih7fSlcblxuZXhwb3J0IGRlZmF1bHQgRXZlbnRIYW5kbGVyXG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBndWlkR2VuZXJhdG9yKCkge1xuICAgIHZhciBTNCA9IGZ1bmN0aW9uKCkge1xuICAgICAgIHJldHVybiAoKCgxK01hdGgucmFuZG9tKCkpKjB4MTAwMDApfDApLnRvU3RyaW5nKDE2KS5zdWJzdHJpbmcoMSlcbiAgICB9XG5cbiAgICByZXR1cm4gKFM0KCkrUzQoKStcIi1cIitTNCgpK1wiLVwiK1M0KCkrXCItXCIrUzQoKStcIi1cIitTNCgpK1M0KCkrUzQoKSlcbn1cbiIsIi8vIFRoaXMgZnVuY3Rpb24gc2hvdWxkIHJldHVybiB0cnVlIHdoZW4gdGhlIHBsYXllciBhY3RpdmF0ZXMgdGhlIFwiZ28gbGVmdFwiIGNvbnRyb2xcbi8vIEluIHRoaXMgY2FzZSwgZWl0aGVyIGhvbGRpbmcgdGhlIHJpZ2h0IGFycm93IG9yIHRhcHBpbmcgb3IgY2xpY2tpbmcgb24gdGhlIGxlZnRcbi8vIHNpZGUgb2YgdGhlIHNjcmVlbi5cbmZ1bmN0aW9uIGxlZnRJbnB1dElzQWN0aXZlKCkge1xuICAgIHJldHVybiB0aGlzLmlucHV0LmtleWJvYXJkLmlzRG93bihQaGFzZXIuS2V5Ym9hcmQuQSlcbn1cblxuLy8gVGhpcyBmdW5jdGlvbiBzaG91bGQgcmV0dXJuIHRydWUgd2hlbiB0aGUgcGxheWVyIGFjdGl2YXRlcyB0aGUgXCJnbyByaWdodFwiIGNvbnRyb2xcbi8vIEluIHRoaXMgY2FzZSwgZWl0aGVyIGhvbGRpbmcgdGhlIHJpZ2h0IGFycm93IG9yIHRhcHBpbmcgb3IgY2xpY2tpbmcgb24gdGhlIHJpZ2h0XG4vLyBzaWRlIG9mIHRoZSBzY3JlZW4uXG5mdW5jdGlvbiByaWdodElucHV0SXNBY3RpdmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5wdXQua2V5Ym9hcmQuaXNEb3duKFBoYXNlci5LZXlib2FyZC5EKVxufVxuXG4vLyBUaGlzIGZ1bmN0aW9uIHNob3VsZCByZXR1cm4gdHJ1ZSB3aGVuIHRoZSBwbGF5ZXIgYWN0aXZhdGVzIHRoZSBcImp1bXBcIiBjb250cm9sXG4vLyBJbiB0aGlzIGNhc2UsIGVpdGhlciBob2xkaW5nIHRoZSB1cCBhcnJvdyBvciB0YXBwaW5nIG9yIGNsaWNraW5nIG9uIHRoZSBjZW50ZXJcbi8vIHBhcnQgb2YgdGhlIHNjcmVlbi5cbmZ1bmN0aW9uIHVwSW5wdXRJc0FjdGl2ZShkdXJhdGlvbikge1xuICAgIHJldHVybiB0aGlzLmlucHV0LmtleWJvYXJkLmRvd25EdXJhdGlvbihQaGFzZXIuS2V5Ym9hcmQuVywgZHVyYXRpb24pXG59XG5cbi8vIFRoaXMgZnVuY3Rpb24gcmV0dXJucyB0cnVlIHdoZW4gdGhlIHBsYXllciByZWxlYXNlcyB0aGUgXCJqdW1wXCIgY29udHJvbFxuZnVuY3Rpb24gdXBJbnB1dFJlbGVhc2VkKCkge1xuICAgIHJldHVybiB0aGlzLmlucHV0LmtleWJvYXJkLnVwRHVyYXRpb24oUGhhc2VyLktleWJvYXJkLlcpXG59XG5cbmV4cG9ydCB7XG4gICAgbGVmdElucHV0SXNBY3RpdmUsXG4gICAgcmlnaHRJbnB1dElzQWN0aXZlLFxuICAgIHVwSW5wdXRJc0FjdGl2ZSxcbiAgICB1cElucHV0UmVsZWFzZWRcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFBsYXllckFuZ2xlSGFuZGxlcigpIHtcbiAgICBsZXQgYW5nbGVJbkRlZ3JlZXMgPSAodGhpcy5nYW1lLnBoeXNpY3MuYXJjYWRlLmFuZ2xlVG9Qb2ludGVyKHRoaXMucGxheWVyKSAqIDE4MCAvIE1hdGguUEkpICsgOTA7XG5cbiAgICBpZiAodGhpcy5wbGF5ZXIubWV0YS5mYWNpbmcgPT09ICdyaWdodCcpIHtcbiAgICAgICAgdGhpcy5yaWdodEFybUdyb3VwLmFuZ2xlID0gYW5nbGVJbkRlZ3JlZXMgKyA1XG5cbiAgICAgICAgLy8gVXNlciBpcyBhaW1pbmcgdXBcbiAgICAgICAgaWYgKGFuZ2xlSW5EZWdyZWVzIDw9IDgxICYmIGFuZ2xlSW5EZWdyZWVzID49IDcxKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyAtPSAxMFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzIDwgNzEgJiYgYW5nbGVJbkRlZ3JlZXMgPj0gNjEpIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzIC09IDIwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPCA2MSAmJiBhbmdsZUluRGVncmVlcyA+PSA1MSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgLT0gMzBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA8IDUxICYmIGFuZ2xlSW5EZWdyZWVzID49IDQxKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyAtPSA0MFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzIDwgNDEgJiYgYW5nbGVJbkRlZ3JlZXMgPj0gMzEpIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzIC09IDUwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPCAzMSAmJiBhbmdsZUluRGVncmVlcyA+PSAyMSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgLT0gNjBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA8IDIxICYmIGFuZ2xlSW5EZWdyZWVzID49IDExKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyAtPSA3MFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzIDwgMTEgJiYgYW5nbGVJbkRlZ3JlZXMgPj0gMCkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgLT0gODBcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFVzZXIgaXMgYWltaW5nIGRvd25cbiAgICAgICAgaWYgKGFuZ2xlSW5EZWdyZWVzID49IDk5ICYmIGFuZ2xlSW5EZWdyZWVzIDw9IDEwOSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgKz0gMTBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA+IDEwOSAmJiBhbmdsZUluRGVncmVlcyA8PSAxMTkpIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzICs9IDIwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPiAxMTkgJiYgYW5nbGVJbkRlZ3JlZXMgPD0gMTI5KSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyArPSAzMFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzID4gMTI5ICYmIGFuZ2xlSW5EZWdyZWVzIDw9IDEzOSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgKz0gNDBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA+IDEzOSAmJiBhbmdsZUluRGVncmVlcyA8PSAxNDkpIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzICs9IDUwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPiAxNDkgJiYgYW5nbGVJbkRlZ3JlZXMgPD0gMTU5KSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyArPSA2MFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzID4gMTU5ICYmIGFuZ2xlSW5EZWdyZWVzIDw9IDE2OSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgKz0gNzBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA+IDE2OSAmJiBhbmdsZUluRGVncmVlcyA8PSAxODApIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzICs9IDgwXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5wbGF5ZXIubWV0YS5mYWNpbmcgPT09ICdsZWZ0Jykge1xuICAgICAgICB0aGlzLnJpZ2h0QXJtR3JvdXAuYW5nbGUgPSBhbmdsZUluRGVncmVlcyAtIDdcblxuICAgICAgICAvLyBVc2VyIGlzIGFpbWluZyB1cFxuICAgICAgICBpZiAoYW5nbGVJbkRlZ3JlZXMgPj0gLTgxICYmIGFuZ2xlSW5EZWdyZWVzIDw9IC03MSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgKz0gMjBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA+IC03MSAmJiBhbmdsZUluRGVncmVlcyA8PSAtNjEpIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzICs9IDMwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPiAtNjEgJiYgYW5nbGVJbkRlZ3JlZXMgPD0gLTUxKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyArPSA0MFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzID4gLTUxICYmIGFuZ2xlSW5EZWdyZWVzIDw9IC00MSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgKz0gNTBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA+IC00MSAmJiBhbmdsZUluRGVncmVlcyA8PSAtMzEpIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzICs9IDYwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPiAtMzEgJiYgYW5nbGVJbkRlZ3JlZXMgPD0gLTIxKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyArPSA3MFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzID4gLTIxICYmIGFuZ2xlSW5EZWdyZWVzIDw9IC0xMSkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgKz0gODBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA+IC0xMSAmJiBhbmdsZUluRGVncmVlcyA8PSAwKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyArPSA5MFxuICAgICAgICB9XG5cbiAgICAgICAgLy8gVXNlciBpcyBhaW1pbmcgZG93blxuICAgICAgICBpZiAoYW5nbGVJbkRlZ3JlZXMgPD0gMjcwICYmIGFuZ2xlSW5EZWdyZWVzID49IDI2MCkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgLT0gMTBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA8IDI2MCAmJiBhbmdsZUluRGVncmVlcyA+PSAyNTApIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzIC09IDIwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPCAyNTAgJiYgYW5nbGVJbkRlZ3JlZXMgPj0gMjQwKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyAtPSAzMFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzIDwgMjQwICYmIGFuZ2xlSW5EZWdyZWVzID49IDIzMCkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgLT0gNDBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA8IDIzMCAmJiBhbmdsZUluRGVncmVlcyA+PSAyMjApIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzIC09IDUwXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGVJbkRlZ3JlZXMgPCAyMjAgJiYgYW5nbGVJbkRlZ3JlZXMgPj0gMjEwKSB7XG4gICAgICAgICAgICBhbmdsZUluRGVncmVlcyAtPSA2MFxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlSW5EZWdyZWVzIDwgMjEwICYmIGFuZ2xlSW5EZWdyZWVzID49IDIwMCkge1xuICAgICAgICAgICAgYW5nbGVJbkRlZ3JlZXMgLT0gNzBcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZUluRGVncmVlcyA8IDIwMCAmJiBhbmdsZUluRGVncmVlcyA+PSAxOTApIHtcbiAgICAgICAgICAgIGFuZ2xlSW5EZWdyZWVzIC09IDgwXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmxlZnRBcm1Hcm91cC5hbmdsZSA9IGFuZ2xlSW5EZWdyZWVzXG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBQbGF5ZXJCeUlkKGlkKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmVuZW1pZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHRoaXMuZW5lbWllc1tpXS5wbGF5ZXIuaWQgPT09IGlkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lbmVtaWVzW2ldXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2Vcbn1cbiIsImZ1bmN0aW9uIHBsYXllckZhY2VMZWZ0KCkge1xuICAgIGlmICh0aGlzLnBsYXllci5tZXRhLmZhY2luZyAhPT0gJ2xlZnQnKSB7XG4gICAgICAgIHRoaXMucGxheWVyLm1ldGEuZmFjaW5nID0gJ2xlZnQnXG5cbiAgICAgICAgdGhpcy5yaWdodEFybUdyb3VwLnggPSAyNVxuICAgICAgICB0aGlzLnJpZ2h0QXJtR3JvdXAueSA9IC02NVxuXG4gICAgICAgIHRoaXMubGVmdEFybUdyb3VwLnggPSAtNDBcbiAgICAgICAgdGhpcy5sZWZ0QXJtR3JvdXAueSA9IC03MFxuXG4gICAgICAgIHRoaXMuaGVhZFNwcml0ZS5zY2FsZS54ICo9IC0xXG4gICAgICAgIHRoaXMuaGVhZFNwcml0ZS54ID0gMTJcblxuICAgICAgICB0aGlzLnRvcnNvU3ByaXRlLnNjYWxlLnggKj0gLTFcbiAgICAgICAgdGhpcy50b3Jzb1Nwcml0ZS54ID0gNDlcblxuICAgICAgICB0aGlzLmxlZnRBcm1TcHJpdGUuc2NhbGUueSAqPSAtMVxuICAgICAgICB0aGlzLmxlZnRBcm1TcHJpdGUueSA9IDVcblxuICAgICAgICB0aGlzLnJpZ2h0QXJtU3ByaXRlLnNjYWxlLnkgKj0gLTFcbiAgICAgICAgdGhpcy5yaWdodEFybVNwcml0ZS55ID0gMTBcblxuICAgICAgICB0aGlzLmFrNDdTcHJpdGUuc2NhbGUueSAqPSAtMVxuICAgICAgICB0aGlzLmFrNDdTcHJpdGUueSA9IDMwXG4gICAgICAgIHRoaXMuYWs0N1Nwcml0ZS54ID0gLTdcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHBsYXllckZhY2VSaWdodCgpIHtcbiAgICBpZiAodGhpcy5wbGF5ZXIubWV0YS5mYWNpbmcgIT09ICdyaWdodCcpIHtcbiAgICAgICAgdGhpcy5wbGF5ZXIubWV0YS5mYWNpbmcgPSAncmlnaHQnXG5cbiAgICAgICAgdGhpcy5yaWdodEFybUdyb3VwLnggPSAtMjVcbiAgICAgICAgdGhpcy5yaWdodEFybUdyb3VwLnkgPSAtNjVcblxuICAgICAgICB0aGlzLmxlZnRBcm1Hcm91cC54ID0gNDVcbiAgICAgICAgdGhpcy5sZWZ0QXJtR3JvdXAueSA9IC03MFxuXG4gICAgICAgIHRoaXMuaGVhZFNwcml0ZS5zY2FsZS54ICo9IC0xXG4gICAgICAgIHRoaXMuaGVhZFNwcml0ZS54ID0gMFxuXG4gICAgICAgIHRoaXMudG9yc29TcHJpdGUuc2NhbGUueCAqPSAtMVxuICAgICAgICB0aGlzLnRvcnNvU3ByaXRlLnggPSAtMzdcblxuICAgICAgICB0aGlzLmxlZnRBcm1TcHJpdGUuc2NhbGUueSAqPSAtMVxuICAgICAgICB0aGlzLmxlZnRBcm1TcHJpdGUueSA9IDBcblxuICAgICAgICB0aGlzLnJpZ2h0QXJtU3ByaXRlLnNjYWxlLnkgKj0gLTFcbiAgICAgICAgdGhpcy5yaWdodEFybVNwcml0ZS55ID0gMFxuXG4gICAgICAgIHRoaXMuYWs0N1Nwcml0ZS5zY2FsZS55ICo9IC0xXG4gICAgICAgIHRoaXMuYWs0N1Nwcml0ZS55ID0gMTlcbiAgICAgICAgdGhpcy5hazQ3U3ByaXRlLnggPSAzXG4gICAgfVxufVxuXG5leHBvcnQge1xuICAgIHBsYXllckZhY2VMZWZ0LFxuICAgIHBsYXllckZhY2VSaWdodFxufVxuIiwiaW1wb3J0IEV2ZW50SGFuZGxlciBmcm9tICcuL0V2ZW50SGFuZGxlcidcbmltcG9ydCB7XG4gICAgdXBJbnB1dElzQWN0aXZlLFxuICAgIHVwSW5wdXRSZWxlYXNlZFxufSBmcm9tICcuL0lucHV0SGVscGVycydcblxubGV0IGp1bXBKZXRDb3VudGVyID0gMFxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBQbGF5ZXJKdW1wSGFuZGxlcigpIHtcbiAgICAvLyBTZXQgYSB2YXJpYWJsZSB0aGF0IGlzIHRydWUgd2hlbiB0aGUgcGxheWVyIGlzIHRvdWNoaW5nIHRoZSBncm91bmRcbiAgICBsZXQgb25UaGVHcm91bmQgPSB0aGlzLnBsYXllci5ib2R5LnRvdWNoaW5nLmRvd25cblxuICAgIC8vIElmIHRoZSBwbGF5ZXIgaXMgdG91Y2hpbmcgdGhlIGdyb3VuZCwgbGV0IGhpbSBoYXZlIDIganVtcHNcbiAgICBpZiAob25UaGVHcm91bmQpIHtcbiAgICAgICAgdGhpcy5qdW1wcyA9IDJcbiAgICAgICAgdGhpcy5qdW1waW5nID0gZmFsc2VcbiAgICB9XG5cbiAgICAvLyBKdW1wIVxuICAgIGlmICh0aGlzLmp1bXBzID09PSAyICYmIHVwSW5wdXRJc0FjdGl2ZS5jYWxsKHRoaXMsIDUpICYmIG9uVGhlR3JvdW5kKSB7XG4gICAgICAgIHRoaXMucGxheWVyLmJvZHkudmVsb2NpdHkueSA9IHRoaXMuSlVNUF9TUEVFRFxuICAgICAgICB0aGlzLmp1bXBpbmcgPSB0cnVlXG4gICAgfSBlbHNlIGlmICh1cElucHV0SXNBY3RpdmUuY2FsbCh0aGlzLCA1KSkge1xuICAgICAgICB0aGlzLmp1bXBzID0gMVxuICAgIH1cblxuICAgIC8vIEp1bXAgSmV0IVxuICAgIGlmICh0aGlzLmp1bXBzID09PSAxICYmIHRoaXMuaW5wdXQua2V5Ym9hcmQuaXNEb3duKFBoYXNlci5LZXlib2FyZC5XKSAmJiBqdW1wSmV0Q291bnRlciA+IC0xMzAwMDApIHtcbiAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5hY2NlbGVyYXRpb24ueSA9IHRoaXMuSlVNUF9KRVRfU1BFRURcbiAgICAgICAganVtcEpldENvdW50ZXIgKz0gdGhpcy5KVU1QX0pFVF9TUEVFRFxuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucGxheWVyLmJvZHkuYWNjZWxlcmF0aW9uLnkgPSAwXG5cbiAgICAgICAgaWYgKGp1bXBKZXRDb3VudGVyIDwgMCkge1xuICAgICAgICAgICAganVtcEpldENvdW50ZXIgLT0gdGhpcy5KVU1QX0pFVF9TUEVFRFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAganVtcEpldENvdW50ZXIgPSAwXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBFdmVudEhhbmRsZXIuZW1pdCgncGxheWVyIGp1bXAgamV0IHVwZGF0ZScsIHsganVtcEpldENvdW50ZXIgfSlcblxuICAgIC8vIFJlZHVjZSB0aGUgbnVtYmVyIG9mIGF2YWlsYWJsZSBqdW1wcyBpZiB0aGUganVtcCBpbnB1dCBpcyByZWxlYXNlZFxuICAgIGlmICh0aGlzLmp1bXBpbmcgJiYgdXBJbnB1dFJlbGVhc2VkLmNhbGwodGhpcykpIHtcbiAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5hY2NlbGVyYXRpb24ueCA9IDBcbiAgICAgICAgdGhpcy5wbGF5ZXIuYm9keS5hY2NlbGVyYXRpb24ueSA9IDBcblxuICAgICAgICBpZiAodGhpcy5qdW1wcyAhPT0gMSkge1xuICAgICAgICAgICAgdGhpcy5qdW1wcy0tXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmp1bXBpbmcgPSBmYWxzZVxuICAgIH1cbn1cbiIsImltcG9ydCB7XG4gICAgcGxheWVyRmFjZUxlZnQsXG4gICAgcGxheWVyRmFjZVJpZ2h0XG59IGZyb20gJy4vUGxheWVyRmFjZUhhbmRsZXInXG5cbmltcG9ydCB7XG4gICAgbGVmdElucHV0SXNBY3RpdmUsXG4gICAgcmlnaHRJbnB1dElzQWN0aXZlXG59IGZyb20gJy4vSW5wdXRIZWxwZXJzJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBQbGF5ZXJNb3ZlbWVudEhhbmRsZXIoKSB7XG4gICAgaWYgKGxlZnRJbnB1dElzQWN0aXZlLmNhbGwodGhpcykpIHtcbiAgICAgICAgLy8gSWYgdGhlIExFRlQga2V5IGlzIGRvd24sIHNldCB0aGUgcGxheWVyIHZlbG9jaXR5IHRvIG1vdmUgbGVmdFxuICAgICAgICB0aGlzLnBsYXllci5ib2R5LmFjY2VsZXJhdGlvbi54ID0gLXRoaXMuQUNDRUxFUkFUSU9OXG4gICAgICAgIHRoaXMucGxheWVyLmFuaW1hdGlvbnMucGxheSgnbGVmdCcpXG5cbiAgICAgICAgLy8gTGVmdCBmYWNpbmcgaGVhZCBuZWVkcyB0byBiZSBzZXQgb25seSBvbmNlXG4gICAgICAgIHBsYXllckZhY2VMZWZ0LmNhbGwodGhpcylcbiAgICB9IGVsc2UgaWYgKHJpZ2h0SW5wdXRJc0FjdGl2ZS5jYWxsKHRoaXMpKSB7XG4gICAgICAgIC8vIElmIHRoZSBSSUdIVCBrZXkgaXMgZG93biwgc2V0IHRoZSBwbGF5ZXIgdmVsb2NpdHkgdG8gbW92ZSByaWdodFxuICAgICAgICB0aGlzLnBsYXllci5ib2R5LmFjY2VsZXJhdGlvbi54ID0gdGhpcy5BQ0NFTEVSQVRJT05cbiAgICAgICAgdGhpcy5wbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdyaWdodCcpXG5cbiAgICAgICAgcGxheWVyRmFjZVJpZ2h0LmNhbGwodGhpcylcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBTdGFuZCBzdGlsbFxuICAgICAgICB0aGlzLnBsYXllci5ib2R5LmFjY2VsZXJhdGlvbi54ID0gMFxuICAgICAgICB0aGlzLnBsYXllci5hbmltYXRpb25zLnN0b3AoKVxuXG4gICAgICAgIGlmICh0aGlzLmdhbWUuaW5wdXQud29ybGRYID4gdGhpcy5wbGF5ZXIueCkge1xuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuZnJhbWUgPSA3XG4gICAgICAgICAgICBwbGF5ZXJGYWNlUmlnaHQuY2FsbCh0aGlzKVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuZ2FtZS5pbnB1dC53b3JsZFggPCB0aGlzLnBsYXllci54KSB7XG4gICAgICAgICAgICB0aGlzLnBsYXllci5mcmFtZSA9IDZcbiAgICAgICAgICAgIHBsYXllckZhY2VMZWZ0LmNhbGwodGhpcylcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IFtcbiAgICB7XG4gICAgICAgIGlkOiAnQUs0NycsXG4gICAgICAgIG5hbWU6ICdBSy00NycsXG4gICAgICAgIGltYWdlOiAnL2ltYWdlcy9ndW5zL1Nwcl9BSzQ3LnBuZycsXG4gICAgICAgIG1pblNjb3JlOiAwXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkOiAnTTUwMCcsXG4gICAgICAgIG5hbWU6ICdNNTAwJyxcbiAgICAgICAgaW1hZ2U6ICcvaW1hZ2VzL2d1bnMvU3ByX001MDAucG5nJyxcbiAgICAgICAgbWluU2NvcmU6IDBcbiAgICAgICAgLy8gbWluU2NvcmU6IDEwXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkOiAnU2tvcnBpb24nLFxuICAgICAgICBuYW1lOiAnU2tvcnBpb24nLFxuICAgICAgICBpbWFnZTogJy9pbWFnZXMvZ3Vucy9TcHJfU2tvcnBpb24ucG5nJyxcbiAgICAgICAgbWluU2NvcmU6IDBcbiAgICAgICAgLy8gbWluU2NvcmU6IDIwXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkOiAnQXVnJyxcbiAgICAgICAgbmFtZTogJ0F1ZycsXG4gICAgICAgIGltYWdlOiAnL2ltYWdlcy9ndW5zL1Nwcl9BdWcucG5nJyxcbiAgICAgICAgbWluU2NvcmU6IDBcbiAgICAgICAgLy8gbWluU2NvcmU6IDMwXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkOiAnRzQzJyxcbiAgICAgICAgbmFtZTogJ0c0MycsXG4gICAgICAgIGltYWdlOiAnL2ltYWdlcy9ndW5zL1Nwcl9nNDMucG5nJyxcbiAgICAgICAgbWluU2NvcmU6IDBcbiAgICAgICAgLy8gbWluU2NvcmU6IDQwXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkOiAnUDkwJyxcbiAgICAgICAgbmFtZTogJ1A5MCcsXG4gICAgICAgIGltYWdlOiAnL2ltYWdlcy9ndW5zL1Nwcl9wOTAucG5nJyxcbiAgICAgICAgbWluU2NvcmU6IDBcbiAgICAgICAgLy8gbWluU2NvcmU6IDMwXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkOiAnTTRBMScsXG4gICAgICAgIG5hbWU6ICdNNEExJyxcbiAgICAgICAgaW1hZ2U6ICcvaW1hZ2VzL2d1bnMvU3ByX000QTEucG5nJyxcbiAgICAgICAgbWluU2NvcmU6IDBcbiAgICAgICAgLy8gbWluU2NvcmU6IDEwXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkOiAnQmFycmV0dCcsXG4gICAgICAgIG5hbWU6ICdCYXJyZXR0JyxcbiAgICAgICAgaW1hZ2U6ICcvaW1hZ2VzL2d1bnMvU3ByX0JhcnJldHQucG5nJyxcbiAgICAgICAgbWluU2NvcmU6IDBcbiAgICAgICAgLy8gbWluU2NvcmU6IDcwXG4gICAgfVxuXVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBSZW1vdGVQbGF5ZXIgPSBmdW5jdGlvbihpZCwgZ2FtZSwgcGxheWVyLCBzdGFydFgsIHN0YXJ0WSkge1xuICAgIGxldCBuZXdSZW1vdGVQbGF5ZXIgPSB7XG4gICAgICAgIHg6IHN0YXJ0WCxcbiAgICAgICAgeTogc3RhcnRZLFxuICAgICAgICBpZDogbnVsbCxcbiAgICAgICAgZ2FtZTogZ2FtZSxcbiAgICAgICAgaGVhbHRoOiAxMDAsXG4gICAgICAgIHBsYXllcjogcGxheWVyLFxuICAgICAgICBhbGl2ZTogdHJ1ZSxcbiAgICAgICAgbGFzdFBvc2l0aW9uOiB7XG4gICAgICAgICAgICB4OiBzdGFydFgsXG4gICAgICAgICAgICB5OiBzdGFydFlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIENyZWF0ZSB0aGUgcGxheWVyJ3MgZW5lbXkgc3ByaXRlXG4gICAgbmV3UmVtb3RlUGxheWVyLnBsYXllciA9IGdhbWUuYWRkLnNwcml0ZShzdGFydFgsIHN0YXJ0WSwgJ2NvbW1hbmRvJylcblxuICAgIC8vICBXZSBuZWVkIHRvIGVuYWJsZSBwaHlzaWNzIG9uIHRoZSBwbGF5ZXJcbiAgICAvLyB0aGlzLnBoeXNpY3MuYXJjYWRlLmVuYWJsZShuZXdSZW1vdGVQbGF5ZXIucGxheWVyKVxuXG4gICAgLy8gLy8gRW5hYmxlIHBoeXNpY3Mgb24gdGhlIHBsYXllclxuICAgIC8vIHRoaXMuZ2FtZS5waHlzaWNzLmVuYWJsZShuZXdSZW1vdGVQbGF5ZXIucGxheWVyLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpXG5cbiAgICAvLyBNYWtlIHBsYXllciBjb2xsaWRlIHdpdGggd29ybGQgYm91bmRhcmllcyBzbyBoZSBkb2Vzbid0IGxlYXZlIHRoZSBzdGFnZVxuICAgIC8vIG5ld1JlbW90ZVBsYXllci5wbGF5ZXIuYm9keS5jb2xsaWRlV29ybGRCb3VuZHMgPSB0cnVlXG5cbiAgICAvLyBPdXIgdHdvIGFuaW1hdGlvbnMsIHdhbGtpbmcgbGVmdCBhbmQgcmlnaHQuXG4gICAgbmV3UmVtb3RlUGxheWVyLnBsYXllci5hbmltYXRpb25zLmFkZCgnbGVmdCcsIFswLCAxLCAyLCAzXSwgMTAsIHRydWUpXG4gICAgbmV3UmVtb3RlUGxheWVyLnBsYXllci5hbmltYXRpb25zLmFkZCgncmlnaHQnLCBbNSwgNiwgNywgOF0sIDEwLCB0cnVlKVxuXG4gICAgbmV3UmVtb3RlUGxheWVyLnBsYXllci5pZCA9IGlkXG5cbiAgICByZXR1cm4gbmV3UmVtb3RlUGxheWVyXG59XG5cbm1vZHVsZS5leHBvcnRzID0gUmVtb3RlUGxheWVyXG4iLCJleHBvcnQgZGVmYXVsdCBbXG4gICAge1xuICAgICAgICBpZDogJ0Rlc2VydEVhZ2xlJyxcbiAgICAgICAgbmFtZTogJ0Rlc2VydCBFYWdsZScsXG4gICAgICAgIGltYWdlOiAnL2ltYWdlcy9ndW5zL1Nwcl9EZXNlcnRFYWdsZS5wbmcnLFxuICAgICAgICBtaW5TY29yZTogMFxuICAgIH0sXG4gICAge1xuICAgICAgICBpZDogJ1JQRycsXG4gICAgICAgIG5hbWU6ICdSUEcnLFxuICAgICAgICBpbWFnZTogJy9pbWFnZXMvZ3Vucy9TcHJfUlBHLnBuZycsXG4gICAgICAgIG1pblNjb3JlOiAyMFxuICAgIH1cbl1cbiIsImltcG9ydCBFdmVudEhhbmRsZXIgZnJvbSAnLi4vRXZlbnRIYW5kbGVyJ1xuaW1wb3J0IG9uVXBkYXRlUGxheWVycyBmcm9tICcuL29uVXBkYXRlUGxheWVycydcbmltcG9ydCBvblNvY2tldENvbm5lY3RlZCBmcm9tICcuL29uU29ja2V0Q29ubmVjdGVkJ1xuaW1wb3J0IG9uU29ja2V0RGlzY29ubmVjdCBmcm9tICcuL29uU29ja2V0RGlzY29ubmVjdCdcbmltcG9ydCBvbk1vdmVQbGF5ZXIgZnJvbSAnLi9vbk1vdmVQbGF5ZXInXG5pbXBvcnQgb25SZW1vdmVQbGF5ZXIgZnJvbSAnLi9vblJlbW92ZVBsYXllcidcbmltcG9ydCBvbkJ1bGxldEZpcmVkIGZyb20gJy4vb25CdWxsZXRGaXJlZCdcbmltcG9ydCBvbkJ1bGxldFJlbW92ZWQgZnJvbSAnLi9vbkJ1bGxldFJlbW92ZWQnXG5pbXBvcnQgb25QbGF5ZXJEYW1hZ2VkIGZyb20gJy4vb25QbGF5ZXJEYW1hZ2VkJ1xuaW1wb3J0IG9uUGxheWVyUmVzcGF3biBmcm9tICcuL29uUGxheWVyUmVzcGF3bidcbmltcG9ydCBvblBsYXllckhlYWx0aFVwZGF0ZSBmcm9tICcuL29uUGxheWVySGVhbHRoVXBkYXRlJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNvY2tldC5vbignY29ubmVjdCcsIG9uU29ja2V0Q29ubmVjdGVkLmJpbmQodGhpcykpXG4gICAgdGhpcy5zb2NrZXQub24oJ2Rpc2Nvbm5lY3QnLCBvblNvY2tldERpc2Nvbm5lY3QuYmluZCh0aGlzKSlcblxuICAgIHRoaXMuc29ja2V0Lm9uKCd1cGRhdGUgcGxheWVycycsIG9uVXBkYXRlUGxheWVycy5iaW5kKHRoaXMpKVxuICAgIHRoaXMuc29ja2V0Lm9uKCdtb3ZlIHBsYXllcicsIG9uTW92ZVBsYXllci5iaW5kKHRoaXMpKVxuICAgIHRoaXMuc29ja2V0Lm9uKCdyZW1vdmUgcGxheWVyJywgb25SZW1vdmVQbGF5ZXIuYmluZCh0aGlzKSlcblxuICAgIHRoaXMuc29ja2V0Lm9uKCdwbGF5ZXIgcmVzcGF3bicsIG9uUGxheWVyUmVzcGF3bi5iaW5kKHRoaXMpKVxuICAgIHRoaXMuc29ja2V0Lm9uKCdwbGF5ZXIgZGFtYWdlZCcsIG9uUGxheWVyRGFtYWdlZC5iaW5kKHRoaXMpKVxuXG4gICAgdGhpcy5zb2NrZXQub24oJ2J1bGxldCBmaXJlZCcsIG9uQnVsbGV0RmlyZWQuYmluZCh0aGlzKSlcbiAgICB0aGlzLnNvY2tldC5vbignYnVsbGV0IHJlbW92ZWQnLCBvbkJ1bGxldFJlbW92ZWQuYmluZCh0aGlzKSlcblxuICAgIHRoaXMuc29ja2V0Lm9uKCdwbGF5ZXIgaGVhbHRoIHVwZGF0ZScsIG9uUGxheWVySGVhbHRoVXBkYXRlLmJpbmQodGhpcykpXG5cbiAgICBFdmVudEhhbmRsZXIub24oJ3BsYXllciB1cGRhdGUgbmlja25hbWUnLCAoZGF0YSkgPT4ge1xuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdwbGF5ZXIgdXBkYXRlIG5pY2tuYW1lJywge1xuICAgICAgICAgICAgcm9vbUlkOiB0aGlzLnJvb21JZCxcbiAgICAgICAgICAgIG5pY2tuYW1lOiBkYXRhLm5pY2tuYW1lXG4gICAgICAgIH0pXG4gICAgfSlcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgQnVsbGV0ID0gcmVxdWlyZSgnLi4vQnVsbGV0JylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgaWYgKGRhdGEuaWQgPT09ICgnLyMnICsgdGhpcy5zb2NrZXQuaWQpKVxuICAgICAgICByZXR1cm5cblxuICAgIGxldCBuZXdFbmVteUJ1bGxldCA9IHRoaXMuZW5lbXlCdWxsZXRzLmNyZWF0ZShkYXRhLngsIGRhdGEueSwgJ2J1bGxldDEyJylcbiAgICBuZXdFbmVteUJ1bGxldC5idWxsZXRJZCA9IGRhdGEuYnVsbGV0SWRcbiAgICBuZXdFbmVteUJ1bGxldC5wbGF5ZXJJZCA9IGRhdGEucGxheWVySWRcbiAgICBuZXdFbmVteUJ1bGxldC5kYW1hZ2UgPSBkYXRhLmRhbWFnZVxuICAgIG5ld0VuZW15QnVsbGV0LnJvdGF0aW9uID0gZGF0YS5wb2ludGVyQW5nbGVcbiAgICBuZXdFbmVteUJ1bGxldC5oZWlnaHQgPSBkYXRhLmhlaWdodFxuICAgIG5ld0VuZW15QnVsbGV0LndpZHRoID0gZGF0YS53aWR0aFxuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmVuYWJsZShuZXdFbmVteUJ1bGxldCwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKVxuICAgIG5ld0VuZW15QnVsbGV0LmJvZHkuZ3Jhdml0eS55ID0gLTE4MDBcblxuICAgIGxldCBuZXdWZWxvY2l0eSA9IHRoaXMuZ2FtZS5waHlzaWNzLmFyY2FkZS52ZWxvY2l0eUZyb21Sb3RhdGlvbihkYXRhLnBvaW50ZXJBbmdsZSwgZGF0YS5zcGVlZClcbiAgICBuZXdFbmVteUJ1bGxldC5ib2R5LnZlbG9jaXR5LnggKz0gbmV3VmVsb2NpdHkueFxuICAgIG5ld0VuZW15QnVsbGV0LmJvZHkudmVsb2NpdHkueSArPSBuZXdWZWxvY2l0eS55XG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgaWYgKGRhdGEuaWQgPT09ICgnLyMnICsgdGhpcy5zb2NrZXQuaWQpKVxuICAgICAgICByZXR1cm5cblxuICAgIGxldCByZW1vdmVCdWxsZXQgPSBfLmZpbmQodGhpcy53ZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0uY2hpbGRyZW4sIHtcbiAgICAgICAgYnVsbGV0SWQ6IGRhdGEuYnVsbGV0SWRcbiAgICB9KVxuXG4gICAgaWYgKCFyZW1vdmVCdWxsZXQpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0J1bGxldCBub3QgZm91bmQ6ICcsIGRhdGEuYnVsbGV0SWQpXG4gICAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHJlbW92ZUJ1bGxldC5raWxsKClcbn1cbiIsImltcG9ydCBQbGF5ZXJCeUlkIGZyb20nLi4vUGxheWVyQnlJZCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgbGV0IG1vdmVQbGF5ZXIgPSBQbGF5ZXJCeUlkLmNhbGwodGhpcywgZGF0YS5pZClcblxuICAgIC8vIFBsYXllciBub3QgZm91bmRcbiAgICBpZiAoISBtb3ZlUGxheWVyKSB7XG4gICAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIFVwZGF0ZSBwbGF5ZXIgcG9zaXRpb25cbiAgICBtb3ZlUGxheWVyLnBsYXllci54ID0gZGF0YS54XG4gICAgbW92ZVBsYXllci5wbGF5ZXIueSA9IGRhdGEueVxuXG4gICAgaWYgKG1vdmVQbGF5ZXIucGxheWVyLnggPiBtb3ZlUGxheWVyLmxhc3RQb3NpdGlvbi54KSB7XG4gICAgICAgIG1vdmVQbGF5ZXIucGxheWVyLmFuaW1hdGlvbnMucGxheSgncmlnaHQnKVxuICAgIH1cbiAgICBlbHNlIGlmIChtb3ZlUGxheWVyLnBsYXllci54IDwgbW92ZVBsYXllci5sYXN0UG9zaXRpb24ueClcbiAgICB7XG4gICAgICAgIG1vdmVQbGF5ZXIucGxheWVyLmFuaW1hdGlvbnMucGxheSgnbGVmdCcpXG4gICAgfVxuICAgIGVsc2VcbiAgICB7XG4gICAgICAgIG1vdmVQbGF5ZXIucGxheWVyLmFuaW1hdGlvbnMuc3RvcCgpXG4gICAgICAgIG1vdmVQbGF5ZXIucGxheWVyLmZyYW1lID0gNFxuICAgIH1cblxuICAgIG1vdmVQbGF5ZXIubGFzdFBvc2l0aW9uLnggPSBtb3ZlUGxheWVyLnBsYXllci54XG4gICAgbW92ZVBsYXllci5sYXN0UG9zaXRpb24ueSA9IG1vdmVQbGF5ZXIucGxheWVyLnlcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5pbXBvcnQgRXZlbnRIYW5kbGVyIGZyb20gJy4uL0V2ZW50SGFuZGxlcidcblxubGV0IGRhbWFnZVRpbWVvdXQgPSBudWxsXG5sZXQgaGVhbGluZ0ludGVydmFsID0gbnVsbFxubGV0IGxhc3RLbm93bkhlYWx0aCA9IG51bGxcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgaWYgKGRhdGEuZGFtYWdlZFBsYXllcklkICE9PSAoJy8jJyArIHRoaXMuc29ja2V0LmlkKSlcbiAgICAgICAgcmV0dXJuXG5cbiAgICB0aGlzLnBsYXllci5tZXRhLmhlYWx0aCA9IGRhdGEuaGVhbHRoXG4gICAgRXZlbnRIYW5kbGVyLmVtaXQoJ2hlYWx0aCB1cGRhdGUnLCBTdHJpbmcodGhpcy5wbGF5ZXIubWV0YS5oZWFsdGgpKVxuXG4gICAgaWYgKHRoaXMucGxheWVyLm1ldGEuaGVhbHRoID4gNTUgJiYgdGhpcy5wbGF5ZXIubWV0YS5oZWFsdGggPCAxMDApIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KGRhbWFnZVRpbWVvdXQpXG4gICAgICAgIGRhbWFnZVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIC8vIFBsYXllcidzIGhlYWx0aCB3aWxsIGZ1bGx5IHJlZ2VuZXJhdGVcbiAgICAgICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ3BsYXllciBmdWxsIGhlYWx0aCcsIHtcbiAgICAgICAgICAgICAgICByb29tSWQ6IHRoaXMucm9vbUlkXG4gICAgICAgICAgICB9KVxuICAgICAgICB9LCA1MDAwKVxuICAgIH1cblxuICAgIGlmICh0aGlzLnBsYXllci5tZXRhLmhlYWx0aCA+IDAgJiYgdGhpcy5wbGF5ZXIubWV0YS5oZWFsdGggPD0gNTUpIHtcbiAgICAgICAgLy8gV2FpdCA1IHNlY29uZHMgdG8gYmVnaW4gaGVhbGluZyBwcm9jZXNzXG4gICAgICAgIGNsZWFyVGltZW91dChkYW1hZ2VUaW1lb3V0KVxuICAgICAgICBjbGVhckludGVydmFsKGhlYWxpbmdJbnRlcnZhbClcbiAgICAgICAgZGFtYWdlVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgbGFzdEtub3duSGVhbHRoID0gdGhpcy5wbGF5ZXIubWV0YS5oZWFsdGhcbiAgICAgICAgICAgIGhlYWxpbmdJbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAobGFzdEtub3duSGVhbHRoID49IDEwMCkge1xuICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGhlYWxpbmdJbnRlcnZhbClcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsYXN0S25vd25IZWFsdGggKz0gMTBcblxuICAgICAgICAgICAgICAgIC8vIEluY3JlYXNlIHBsYXllciBoZWFsdGggYnkgMTAgZXZlcnkgMS8yIGEgc2Vjb25kXG4gICAgICAgICAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgncGxheWVyIGhlYWxpbmcnLCB7XG4gICAgICAgICAgICAgICAgICAgIHJvb21JZDogdGhpcy5yb29tSWRcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSwgNTAwKVxuICAgICAgICB9LCA1MDAwKVxuICAgIH1cbn1cbiIsImltcG9ydCBFdmVudEhhbmRsZXIgZnJvbSAnLi4vRXZlbnRIYW5kbGVyJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBpZiAoZGF0YS5pZCAhPT0gKCcvIycgKyB0aGlzLnNvY2tldC5pZCkpXG4gICAgICAgIHJldHVyblxuXG4gICAgdGhpcy5wbGF5ZXIubWV0YS5oZWFsdGggPSBkYXRhLmhlYWx0aFxuICAgIEV2ZW50SGFuZGxlci5lbWl0KCdoZWFsdGggdXBkYXRlJywgU3RyaW5nKHRoaXMucGxheWVyLm1ldGEuaGVhbHRoKSlcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5pbXBvcnQgRXZlbnRIYW5kbGVyIGZyb20gJy4uL0V2ZW50SGFuZGxlcidcbmxldCBIaWdoUnVsZUp1bmdsZSA9IHJlcXVpcmUoJy4uLy4uL21hcHMvSGlnaFJ1bGVKdW5nbGUnKVxubGV0IFdlYXBvbnMgPSByZXF1aXJlKCcuLi9XZWFwb25zJylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgaWYgKGRhdGEuZGFtYWdlZFBsYXllcklkICE9PSAoJy8jJyArIHRoaXMuc29ja2V0LmlkKSlcbiAgICAgICAgcmV0dXJuXG5cbiAgICAvLyBTZXQgcHJpbWFyeSB3ZWFwb25cbiAgICB0aGlzLnBsYXllci5tZXRhLnByaW1hcnlXZWFwb24gPSBuZXcgV2VhcG9uc1t0aGlzLnBsYXllci5tZXRhLnNlbGVjdGVkUHJpbWFyeVdlYXBvbklkXSh7XG4gICAgICAgIGdhbWU6IHRoaXMuZ2FtZVxuICAgIH0pXG4gICAgdGhpcy5wbGF5ZXIubWV0YS5wcmltYXJ5V2VhcG9uLmlkID0gdGhpcy5wbGF5ZXIubWV0YS5zZWxlY3RlZFByaW1hcnlXZWFwb25JZFxuXG4gICAgaWYgKHRoaXMuY3VycmVudFdlYXBvbiA9PT0gJ3ByaW1hcnlXZWFwb24nKVxuICAgICAgICB0aGlzLmFrNDdTcHJpdGUubG9hZFRleHR1cmUodGhpcy5wbGF5ZXIubWV0YS5zZWxlY3RlZFByaW1hcnlXZWFwb25JZClcblxuICAgIC8vIFNldCBzZWNvbmRhcnkgd2VhcG9uXG4gICAgdGhpcy5wbGF5ZXIubWV0YS5zZWNvbmRhcnlXZWFwb24gPSBuZXcgV2VhcG9uc1t0aGlzLnBsYXllci5tZXRhLnNlbGVjdGVkU2Vjb25kYXJ5V2VhcG9uSWRdKHtcbiAgICAgICAgZ2FtZTogdGhpcy5nYW1lXG4gICAgfSlcbiAgICB0aGlzLnBsYXllci5tZXRhLnNlY29uZGFyeVdlYXBvbi5pZCA9IHRoaXMucGxheWVyLm1ldGEuc2VsZWN0ZWRTZWNvbmRhcnlXZWFwb25JZFxuXG4gICAgaWYgKHRoaXMuY3VycmVudFdlYXBvbiA9PT0gJ3NlY29uZGFyeVdlYXBvbicpXG4gICAgICAgIHRoaXMuYWs0N1Nwcml0ZS5sb2FkVGV4dHVyZSh0aGlzLnBsYXllci5tZXRhLnNlbGVjdGVkU2Vjb25kYXJ5V2VhcG9uSWQpXG5cbiAgICAvLyBSZXNldCBoZWFsdGhcbiAgICB0aGlzLnBsYXllci5tZXRhLmhlYWx0aCA9IGRhdGEuaGVhbHRoXG4gICAgRXZlbnRIYW5kbGVyLmVtaXQoJ2hlYWx0aCB1cGRhdGUnLCBTdHJpbmcodGhpcy5wbGF5ZXIubWV0YS5oZWFsdGgpKVxuXG4gICAgLy8gU3Bhd24gcGxheWVyXG4gICAgLy9cbiAgICBsZXQgc3Bhd25Qb2ludCA9IHRoaXMubWFwSW5zdGFuY2UuZ2V0UmFuZG9tU3Bhd25Qb2ludCgpXG4gICAgdGhpcy5wbGF5ZXIueCA9IHNwYXduUG9pbnQueFxuICAgIHRoaXMucGxheWVyLnkgPSBzcGF3blBvaW50Lnlcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5pbXBvcnQgUGxheWVyQnlJZCBmcm9tICcuLi9QbGF5ZXJCeUlkJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBsZXQgcmVtb3ZlUGxheWVyID0gUGxheWVyQnlJZC5jYWxsKHRoaXMsIGRhdGEuaWQpXG5cbiAgICAvLyBQbGF5ZXIgbm90IGZvdW5kXG4gICAgaWYgKCFyZW1vdmVQbGF5ZXIpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1BsYXllciBub3QgZm91bmQ6ICcsIGRhdGEuaWQpXG4gICAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHJlbW92ZVBsYXllci5wbGF5ZXIua2lsbCgpXG5cbiAgICAvLyBSZW1vdmUgcGxheWVyIGZyb20gYXJyYXlcbiAgICB0aGlzLmVuZW1pZXMuc3BsaWNlKHRoaXMuZW5lbWllcy5pbmRleE9mKHJlbW92ZVBsYXllciksIDEpXG59XG4iLCIndXNlIHN0cmljdCdcblxudmFyIGdldFF1ZXJ5U3RyaW5nID0gZnVuY3Rpb24gKCBmaWVsZCwgdXJsICkge1xuICAgIHZhciBocmVmID0gdXJsID8gdXJsIDogd2luZG93LmxvY2F0aW9uLmhyZWY7XG4gICAgdmFyIHJlZyA9IG5ldyBSZWdFeHAoICdbPyZdJyArIGZpZWxkICsgJz0oW14mI10qKScsICdpJyApO1xuICAgIHZhciBzdHJpbmcgPSByZWcuZXhlYyhocmVmKTtcbiAgICByZXR1cm4gc3RyaW5nID8gc3RyaW5nWzFdIDogbnVsbDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coJ0Nvbm5lY3RlZCB0byBzb2NrZXQgc2VydmVyJylcblxuICAgICAvLyBSZXNldCBlbmVtaWVzIG9uIHJlY29ubmVjdFxuICAgIHRoaXMuZW5lbWllcy5mb3JFYWNoKGZ1bmN0aW9uIChlbmVteSkge1xuICAgICAgICBpZiAoZW5lbXkpIGVuZW15LmtpbGwoKVxuICAgIH0pXG5cbiAgICB0aGlzLmVuZW1pZXMgPSBbXVxuXG4gICAgLy8gU2VuZCBsb2NhbCBwbGF5ZXIgZGF0YSB0byB0aGUgZ2FtZSBzZXJ2ZXJcbiAgICB0aGlzLnNvY2tldC5lbWl0KCduZXcgcGxheWVyJywge1xuICAgICAgICByb29tSWQ6IGdldFF1ZXJ5U3RyaW5nKCdyb29tSWQnKSxcbiAgICAgICAgeDogdGhpcy5wbGF5ZXIueCxcbiAgICAgICAgeTogdGhpcy5wbGF5ZXIueVxuICAgIH0pXG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZygnRGlzY29ubmVjdGVkIGZyb20gc29ja2V0IHNlcnZlcicpXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IFJlbW90ZVBsYXllciA9IHJlcXVpcmUoJy4uL1JlbW90ZVBsYXllcicpXG5pbXBvcnQgRXZlbnRIYW5kbGVyIGZyb20gJy4uL0V2ZW50SGFuZGxlcidcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgdGhpcy5yb29tSWQgPSBkYXRhLnJvb20uaWRcblxuICAgIGxldCBuZXd1cmwgPSB3aW5kb3cubG9jYXRpb24ucHJvdG9jb2wgKyBcIi8vXCIgKyB3aW5kb3cubG9jYXRpb24uaG9zdCArIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArICc/cm9vbUlkPScgKyBkYXRhLnJvb20uaWQ7XG4gICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKHsgcGF0aDogbmV3dXJsIH0sICcnLCBuZXd1cmwpO1xuXG4gICAgdGhpcy5lbmVtaWVzLmZvckVhY2goZnVuY3Rpb24gKGVuZW15KSB7XG4gICAgICAgIGVuZW15LnBsYXllci5raWxsKClcbiAgICB9KVxuXG4gICAgdGhpcy5lbmVtaWVzID0gW11cblxuICAgIEV2ZW50SGFuZGxlci5lbWl0KCdwbGF5ZXJzIHVwZGF0ZScsIGRhdGEucm9vbS5wbGF5ZXJzKVxuXG4gICAgZGF0YS5yb29tLnBsYXllcnMuZm9yRWFjaCgocGxheWVyKSA9PiB7XG4gICAgICAgIGlmIChwbGF5ZXIuaWQgPT09ICgnLyMnICsgdGhpcy5zb2NrZXQuaWQpKSB7XG4gICAgICAgICAgICBFdmVudEhhbmRsZXIuZW1pdCgnc2NvcmUgdXBkYXRlJywgU3RyaW5nKHBsYXllci5tZXRhLnNjb3JlKSlcbiAgICAgICAgICAgIEV2ZW50SGFuZGxlci5lbWl0KCdoZWFsdGggdXBkYXRlJywgU3RyaW5nKHBsYXllci5tZXRhLmhlYWx0aCkpXG4gICAgICAgICAgICBFdmVudEhhbmRsZXIuZW1pdCgncGxheWVyIHVwZGF0ZScsIHsgcGxheWVyIH0pXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBuZXdSZW1vdGVQbGF5ZXIgPSBSZW1vdGVQbGF5ZXIuY2FsbCh0aGlzLCBwbGF5ZXIuaWQsIHRoaXMuZ2FtZSwgdGhpcy5wbGF5ZXIsIHBsYXllci54LCBwbGF5ZXIueSlcbiAgICAgICAgdGhpcy5lbmVtaWVzLnB1c2gobmV3UmVtb3RlUGxheWVyKVxuICAgICAgICB0aGlzLmVuZW1pZXNbdGhpcy5lbmVtaWVzLmxlbmd0aCAtIDFdLnBsYXllci5hbmltYXRpb25zLmFkZCgnbGVmdCcsIFswLCAxLCAyLCAzXSwgMTAsIHRydWUpXG4gICAgICAgIHRoaXMuZW5lbWllc1t0aGlzLmVuZW1pZXMubGVuZ3RoIC0gMV0ucGxheWVyLmFuaW1hdGlvbnMuYWRkKCdyaWdodCcsIFs1LCA2LCA3LCA4XSwgMTAsIHRydWUpXG4gICAgfSlcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgQnVsbGV0ID0gcmVxdWlyZSgnLi4vQnVsbGV0JylcbmxldCBHdWlkID0gcmVxdWlyZSgnLi4vR3VpZCcpXG5cbmxldCBBSzQ3ID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGNvbmZpZy5nYW1lLCBjb25maWcuZ2FtZS53b3JsZCwgJ0FLLTQ3JywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG5cbiAgICAvL1x0SGVyZSB3ZSBzZXQtdXAgb3VyIGF1ZGlvIHNwcml0ZVxuICAgIHRoaXMuZnggPSBjb25maWcuZ2FtZS5hZGQuYXVkaW8oJ0FLNDctc291bmQnKVxuICAgIHRoaXMuYWxsb3dNdWx0aXBsZSA9IHRydWVcblxuICAgIHRoaXMuZGFtYWdlID0gMjJcbiAgICB0aGlzLm5leHRGaXJlID0gMFxuICAgIHRoaXMuYnVsbGV0U3BlZWQgPSAyMzAwXG4gICAgdGhpcy5maXJlUmF0ZSA9IDE2MDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNjQ7IGkrKylcbiAgICB7XG4gICAgICAgIGxldCBidWxsZXQgPSBuZXcgQnVsbGV0KGNvbmZpZy5nYW1lLCAnYnVsbGV0MTInLCBjb25maWcuc29ja2V0KVxuICAgICAgICBidWxsZXQuYnVsbGV0SWQgPSBHdWlkKClcbiAgICAgICAgYnVsbGV0LmhlaWdodCA9IDNcbiAgICAgICAgYnVsbGV0LndpZHRoID0gNjBcbiAgICAgICAgYnVsbGV0LmRhbWFnZSA9IDIyXG4gICAgICAgIHRoaXMuYWRkKGJ1bGxldCwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbn1cblxuQUs0Ny5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuQUs0Ny5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBBSzQ3O1xuXG5BSzQ3LnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24ocGxheWVyLCBzb2NrZXQsIHJvb21JZCwgdm9sdW1lKSB7XG4gICAgaWYgKHRoaXMuZ2FtZS50aW1lLnRpbWUgPCB0aGlzLm5leHRGaXJlKVxuICAgICAgICByZXR1cm5cblxuICAgIHZhciB4ID0gcGxheWVyLnggKyAxMFxuICAgIHZhciB5ID0gcGxheWVyLnkgKyAtMTBcblxuICAgIHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgMCwgc29ja2V0LCByb29tSWQpXG4gICAgdGhpcy5zZXRBbGwoJ3RyYWNraW5nJywgdHJ1ZSlcblxuICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLmdhbWUudGltZS50aW1lICsgdGhpcy5maXJlUmF0ZVxuICAgIHRoaXMuZngudm9sdW1lID0gLjMgKiB2b2x1bWVcbiAgICB0aGlzLmZ4LnBsYXkoKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFLNDdcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgQnVsbGV0ID0gcmVxdWlyZSgnLi4vQnVsbGV0JylcbmxldCBHdWlkID0gcmVxdWlyZSgnLi4vR3VpZCcpXG5cbmxldCBBSzQ3ID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGNvbmZpZy5nYW1lLCBjb25maWcuZ2FtZS53b3JsZCwgJ0FLLTQ3JywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG5cbiAgICAvL1x0SGVyZSB3ZSBzZXQtdXAgb3VyIGF1ZGlvIHNwcml0ZVxuICAgIHRoaXMuZnggPSBjb25maWcuZ2FtZS5hZGQuYXVkaW8oJ0FVRy1zb3VuZCcpXG4gICAgdGhpcy5hbGxvd011bHRpcGxlID0gdHJ1ZVxuXG4gICAgdGhpcy5kYW1hZ2UgPSAyMlxuICAgIHRoaXMubmV4dEZpcmUgPSAwXG4gICAgdGhpcy5idWxsZXRTcGVlZCA9IDIzMDBcbiAgICB0aGlzLmZpcmVSYXRlID0gMTYwO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA2NDsgaSsrKVxuICAgIHtcbiAgICAgICAgbGV0IGJ1bGxldCA9IG5ldyBCdWxsZXQoY29uZmlnLmdhbWUsICdidWxsZXQxMicsIGNvbmZpZy5zb2NrZXQpXG4gICAgICAgIGJ1bGxldC5idWxsZXRJZCA9IEd1aWQoKVxuICAgICAgICBidWxsZXQuaGVpZ2h0ID0gMlxuICAgICAgICBidWxsZXQud2lkdGggPSA0MFxuICAgICAgICBidWxsZXQuZGFtYWdlID0gMjJcbiAgICAgICAgdGhpcy5hZGQoYnVsbGV0LCB0cnVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xufVxuXG5BSzQ3LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLkdyb3VwLnByb3RvdHlwZSk7XG5BSzQ3LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEFLNDc7XG5cbkFLNDcucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbihwbGF5ZXIsIHNvY2tldCwgcm9vbUlkLCB2b2x1bWUpIHtcbiAgICBpZiAodGhpcy5nYW1lLnRpbWUudGltZSA8IHRoaXMubmV4dEZpcmUpXG4gICAgICAgIHJldHVyblxuXG4gICAgdmFyIHggPSBwbGF5ZXIueCArIDE1O1xuICAgIHZhciB5ID0gcGxheWVyLnkgKyAzMDtcblxuICAgIHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgMCwgc29ja2V0LCByb29tSWQpXG4gICAgdGhpcy5zZXRBbGwoJ3RyYWNraW5nJywgdHJ1ZSlcblxuICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLmdhbWUudGltZS50aW1lICsgdGhpcy5maXJlUmF0ZVxuICAgIHRoaXMuZngudm9sdW1lID0gLjcgKiB2b2x1bWVcbiAgICB0aGlzLmZ4LnBsYXkoKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFLNDdcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgQnVsbGV0ID0gcmVxdWlyZSgnLi4vQnVsbGV0JylcbmxldCBHdWlkID0gcmVxdWlyZSgnLi4vR3VpZCcpXG5cbmxldCBCYXJyZXRNOTAgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgY29uZmlnLmdhbWUsIGNvbmZpZy5nYW1lLndvcmxkLCAnQmFycmV0IE05MCcsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuXG4gICAgLy9cdEhlcmUgd2Ugc2V0LXVwIG91ciBhdWRpbyBzcHJpdGVcbiAgICB0aGlzLmZ4ID0gY29uZmlnLmdhbWUuYWRkLmF1ZGlvKCdCYXJyZXRNOTAtc291bmQnKVxuICAgIHRoaXMuYWxsb3dNdWx0aXBsZSA9IHRydWVcblxuICAgIHRoaXMubmFtZSA9ICdCYXJyZXQgTTkwJ1xuICAgIHRoaXMuZGFtYWdlID0gODhcbiAgICB0aGlzLm5leHRGaXJlID0gMFxuICAgIHRoaXMuYnVsbGV0U3BlZWQgPSAzNDM1XG5cbiAgICAvLyBCYXJyZXRNOTAgZmlyZXMgYWJvdXQgNjAwIGJ1bGxldHMgcGVyIHNlY29uZFxuICAgIHRoaXMuZmlyZVJhdGUgPSAzMDAwXG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDY0OyBpKyspXG4gICAge1xuICAgICAgICBsZXQgYnVsbGV0ID0gbmV3IEJ1bGxldChjb25maWcuZ2FtZSwgJ2J1bGxldDEyJywgY29uZmlnLnNvY2tldClcbiAgICAgICAgYnVsbGV0LmJ1bGxldElkID0gR3VpZCgpXG4gICAgICAgIGJ1bGxldC5oZWlnaHQgPSAyXG4gICAgICAgIGJ1bGxldC53aWR0aCA9IDQwXG4gICAgICAgIGJ1bGxldC5kYW1hZ2UgPSA4OFxuXG4gICAgICAgIHRoaXMuYWRkKGJ1bGxldCwgdHJ1ZSlcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xufVxuXG5CYXJyZXRNOTAucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcbkJhcnJldE05MC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBCYXJyZXRNOTA7XG5cbkJhcnJldE05MC5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uIChwbGF5ZXIsIHNvY2tldCwgcm9vbUlkKSB7XG4gICAgaWYgKHRoaXMuZ2FtZS50aW1lLnRpbWUgPCB0aGlzLm5leHRGaXJlKVxuICAgICAgICByZXR1cm5cblxuICAgIHZhciB4ID0gcGxheWVyLnggKyAxNTtcbiAgICB2YXIgeSA9IHBsYXllci55ICsgMzA7XG5cbiAgICB0aGlzLmdldEZpcnN0RXhpc3RzKGZhbHNlKS5maXJlKHgsIHksIDAsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDAsIHNvY2tldCwgcm9vbUlkKVxuICAgIHRoaXMuc2V0QWxsKCd0cmFja2luZycsIHRydWUpXG5cbiAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5nYW1lLnRpbWUudGltZSArIHRoaXMuZmlyZVJhdGVcbiAgICB0aGlzLmZ4LnZvbHVtZSA9IC42XG4gICAgdGhpcy5meC5wbGF5KClcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCYXJyZXRNOTBcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgQnVsbGV0ID0gcmVxdWlyZSgnLi4vQnVsbGV0JylcbmxldCBHdWlkID0gcmVxdWlyZSgnLi4vR3VpZCcpXG5cbmxldCBBSzQ3ID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGNvbmZpZy5nYW1lLCBjb25maWcuZ2FtZS53b3JsZCwgJ0Rlc2VydCBFYWdsZScsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuXG4gICAgLy9cdEhlcmUgd2Ugc2V0LXVwIG91ciBhdWRpbyBzcHJpdGVcbiAgICB0aGlzLmZ4ID0gY29uZmlnLmdhbWUuYWRkLmF1ZGlvKCdEZXNlcnRFYWdsZS1zb3VuZCcpXG4gICAgdGhpcy5hbGxvd011bHRpcGxlID0gdHJ1ZVxuXG4gICAgdGhpcy5kYW1hZ2UgPSAzM1xuICAgIHRoaXMubmV4dEZpcmUgPSAwXG4gICAgdGhpcy5idWxsZXRTcGVlZCA9IDIzMDBcbiAgICB0aGlzLmZpcmVSYXRlID0gMjY3O1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA2NDsgaSsrKVxuICAgIHtcbiAgICAgICAgbGV0IGJ1bGxldCA9IG5ldyBCdWxsZXQoY29uZmlnLmdhbWUsICdidWxsZXQxMicsIGNvbmZpZy5zb2NrZXQpXG4gICAgICAgIGJ1bGxldC5idWxsZXRJZCA9IEd1aWQoKVxuICAgICAgICBidWxsZXQuaGVpZ2h0ID0gMlxuICAgICAgICBidWxsZXQud2lkdGggPSA0MFxuICAgICAgICBidWxsZXQuZGFtYWdlID0gMjJcbiAgICAgICAgdGhpcy5hZGQoYnVsbGV0LCB0cnVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xufVxuXG5BSzQ3LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLkdyb3VwLnByb3RvdHlwZSk7XG5BSzQ3LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEFLNDc7XG5cbkFLNDcucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbihwbGF5ZXIsIHNvY2tldCwgcm9vbUlkKSB7XG4gICAgaWYgKHRoaXMuZ2FtZS50aW1lLnRpbWUgPCB0aGlzLm5leHRGaXJlKVxuICAgICAgICByZXR1cm5cblxuICAgIHZhciB4ID0gcGxheWVyLnggKyAxNTtcbiAgICB2YXIgeSA9IHBsYXllci55ICsgMzA7XG5cbiAgICB0aGlzLmdldEZpcnN0RXhpc3RzKGZhbHNlKS5maXJlKHgsIHksIDAsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDAsIHNvY2tldCwgcm9vbUlkKVxuICAgIHRoaXMuc2V0QWxsKCd0cmFja2luZycsIHRydWUpXG5cbiAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5nYW1lLnRpbWUudGltZSArIHRoaXMuZmlyZVJhdGVcbiAgICB0aGlzLmZ4LnZvbHVtZSA9IC4zXG4gICAgdGhpcy5meC5wbGF5KClcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBSzQ3XG4iLCIndXNlIHN0cmljdCdcblxubGV0IEJ1bGxldCA9IHJlcXVpcmUoJy4uL0J1bGxldCcpXG5sZXQgR3VpZCA9IHJlcXVpcmUoJy4uL0d1aWQnKVxuXG5sZXQgQUs0NyA9IGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCBjb25maWcuZ2FtZSwgY29uZmlnLmdhbWUud29ybGQsICdBSy00NycsIGZhbHNlLCB0cnVlLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuXG4gICAgLy9cdEhlcmUgd2Ugc2V0LXVwIG91ciBhdWRpbyBzcHJpdGVcbiAgICB0aGlzLmZ4ID0gY29uZmlnLmdhbWUuYWRkLmF1ZGlvKCdHNDMtc291bmQnKVxuICAgIHRoaXMuYWxsb3dNdWx0aXBsZSA9IHRydWVcblxuICAgIHRoaXMuZGFtYWdlID0gNDRcbiAgICB0aGlzLm5leHRGaXJlID0gMFxuICAgIHRoaXMuYnVsbGV0U3BlZWQgPSAyMzAwXG4gICAgdGhpcy5maXJlUmF0ZSA9IDEzMDA7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDY0OyBpKyspXG4gICAge1xuICAgICAgICBsZXQgYnVsbGV0ID0gbmV3IEJ1bGxldChjb25maWcuZ2FtZSwgJ2J1bGxldDEyJywgY29uZmlnLnNvY2tldClcbiAgICAgICAgYnVsbGV0LmJ1bGxldElkID0gR3VpZCgpXG4gICAgICAgIGJ1bGxldC5oZWlnaHQgPSAyXG4gICAgICAgIGJ1bGxldC53aWR0aCA9IDQwXG4gICAgICAgIGJ1bGxldC5kYW1hZ2UgPSAyMlxuICAgICAgICB0aGlzLmFkZChidWxsZXQsIHRydWUpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG59XG5cbkFLNDcucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcbkFLNDcucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQUs0NztcblxuQUs0Ny5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uKHBsYXllciwgc29ja2V0LCByb29tSWQsIHZvbHVtZSkge1xuICAgIGlmICh0aGlzLmdhbWUudGltZS50aW1lIDwgdGhpcy5uZXh0RmlyZSlcbiAgICAgICAgcmV0dXJuXG5cbiAgICB2YXIgeCA9IHBsYXllci54ICsgMTU7XG4gICAgdmFyIHkgPSBwbGF5ZXIueSArIDMwO1xuXG4gICAgdGhpcy5nZXRGaXJzdEV4aXN0cyhmYWxzZSkuZmlyZSh4LCB5LCAwLCB0aGlzLmJ1bGxldFNwZWVkLCAwLCAwLCBzb2NrZXQsIHJvb21JZClcbiAgICB0aGlzLnNldEFsbCgndHJhY2tpbmcnLCB0cnVlKVxuXG4gICAgdGhpcy5uZXh0RmlyZSA9IHRoaXMuZ2FtZS50aW1lLnRpbWUgKyB0aGlzLmZpcmVSYXRlXG4gICAgdGhpcy5meC52b2x1bWUgPSAuODUgKiB2b2x1bWVcbiAgICB0aGlzLmZ4LnBsYXkoKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFLNDdcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgQnVsbGV0ID0gcmVxdWlyZSgnLi4vQnVsbGV0JylcbmxldCBHdWlkID0gcmVxdWlyZSgnLi4vR3VpZCcpXG5cbmxldCBBSzQ3ID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGNvbmZpZy5nYW1lLCBjb25maWcuZ2FtZS53b3JsZCwgJ000QTEnLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcblxuICAgIC8vXHRIZXJlIHdlIHNldC11cCBvdXIgYXVkaW8gc3ByaXRlXG4gICAgdGhpcy5meCA9IGNvbmZpZy5nYW1lLmFkZC5hdWRpbygnTTRBMS1zb3VuZCcpXG4gICAgdGhpcy5hbGxvd011bHRpcGxlID0gdHJ1ZVxuXG4gICAgdGhpcy5kYW1hZ2UgPSAyMFxuICAgIHRoaXMubmV4dEZpcmUgPSAwXG4gICAgdGhpcy5idWxsZXRTcGVlZCA9IDI0MDBcbiAgICB0aGlzLmZpcmVSYXRlID0gMTUwO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA2NDsgaSsrKVxuICAgIHtcbiAgICAgICAgbGV0IGJ1bGxldCA9IG5ldyBCdWxsZXQoY29uZmlnLmdhbWUsICdidWxsZXQxMicsIGNvbmZpZy5zb2NrZXQpXG4gICAgICAgIGJ1bGxldC5idWxsZXRJZCA9IEd1aWQoKVxuICAgICAgICBidWxsZXQuaGVpZ2h0ID0gMlxuICAgICAgICBidWxsZXQud2lkdGggPSA0MFxuICAgICAgICBidWxsZXQuZGFtYWdlID0gMjJcbiAgICAgICAgdGhpcy5hZGQoYnVsbGV0LCB0cnVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xufVxuXG5BSzQ3LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLkdyb3VwLnByb3RvdHlwZSk7XG5BSzQ3LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEFLNDc7XG5cbkFLNDcucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbihwbGF5ZXIsIHNvY2tldCwgcm9vbUlkKSB7XG4gICAgaWYgKHRoaXMuZ2FtZS50aW1lLnRpbWUgPCB0aGlzLm5leHRGaXJlKVxuICAgICAgICByZXR1cm5cblxuICAgIHZhciB4ID0gcGxheWVyLnggKyAxNTtcbiAgICB2YXIgeSA9IHBsYXllci55ICsgMzA7XG5cbiAgICB0aGlzLmdldEZpcnN0RXhpc3RzKGZhbHNlKS5maXJlKHgsIHksIDAsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDAsIHNvY2tldCwgcm9vbUlkKVxuICAgIHRoaXMuc2V0QWxsKCd0cmFja2luZycsIHRydWUpXG5cbiAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5nYW1lLnRpbWUudGltZSArIHRoaXMuZmlyZVJhdGVcbiAgICB0aGlzLmZ4LnZvbHVtZSA9IC4zXG4gICAgdGhpcy5meC5wbGF5KClcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBSzQ3XG4iLCIndXNlIHN0cmljdCdcblxubGV0IEJ1bGxldCA9IHJlcXVpcmUoJy4uL0J1bGxldCcpXG5sZXQgR3VpZCA9IHJlcXVpcmUoJy4uL0d1aWQnKVxuXG5sZXQgTTUwMCA9IGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCBjb25maWcuZ2FtZSwgY29uZmlnLmdhbWUud29ybGQsICdTcGFzLTEyJywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSlcblxuICAgIHRoaXMuZnggPSBjb25maWcuZ2FtZS5hZGQuYXVkaW8oJ001MDAtc291bmQnKVxuXG4gICAgdGhpcy5uZXh0RmlyZSA9IDBcbiAgICB0aGlzLmJ1bGxldFNwZWVkID0gMTkwMFxuICAgIHRoaXMuZmlyZVJhdGUgPSAxNjUwXG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDMyOyBpKyspXG4gICAge1xuICAgICAgICBsZXQgYnVsbGV0ID0gbmV3IEJ1bGxldChjb25maWcuZ2FtZSwgJ2J1bGxldDEyJywgY29uZmlnLnNvY2tldClcbiAgICAgICAgYnVsbGV0LmJ1bGxldElkID0gR3VpZCgpXG4gICAgICAgIGJ1bGxldC5oZWlnaHQgPSAyXG4gICAgICAgIGJ1bGxldC53aWR0aCA9IDQwXG4gICAgICAgIGJ1bGxldC5kYW1hZ2UgPSAyMlxuICAgICAgICB0aGlzLmFkZChidWxsZXQsIHRydWUpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbn1cblxuTTUwMC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpXG5NNTAwLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE01MDBcblxuTTUwMC5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uIChwbGF5ZXIsIHNvY2tldCwgcm9vbUlkLCB2b2x1bWUpIHtcbiAgICBpZiAodGhpcy5nYW1lLnRpbWUudGltZSA8IHRoaXMubmV4dEZpcmUpXG4gICAgICAgIHJldHVyblxuXG5cblxuXG5cbiAgICB2YXIgeCA9IHBsYXllci54ICsgMTVcbiAgICB2YXIgeSA9IHBsYXllci55ICsgMzBcblxuXG5cbiAgICB2YXIgYnVsbGV0SW5zdGFuY2UgPSB0aGlzLmdldEZpcnN0RXhpc3RzKGZhbHNlKVxuICAgIGlmICghYnVsbGV0SW5zdGFuY2UpIHJldHVyblxuICAgIGJ1bGxldEluc3RhbmNlLmZpcmUoeCwgeSwgLjMsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDAsIHNvY2tldCwgcm9vbUlkKVxuXG5cblxuXG4gICAgYnVsbGV0SW5zdGFuY2UgPSB0aGlzLmdldEZpcnN0RXhpc3RzKGZhbHNlKVxuICAgIGlmICghYnVsbGV0SW5zdGFuY2UpIHJldHVyblxuICAgIGJ1bGxldEluc3RhbmNlLmZpcmUoeCwgeSwgLTAuMywgdGhpcy5idWxsZXRTcGVlZCwgMCwgMCwgc29ja2V0LCByb29tSWQpXG5cblxuXG4gICAgYnVsbGV0SW5zdGFuY2UgPSB0aGlzLmdldEZpcnN0RXhpc3RzKGZhbHNlKVxuICAgIGlmICghYnVsbGV0SW5zdGFuY2UpIHJldHVyblxuICAgIGJ1bGxldEluc3RhbmNlLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgMCwgc29ja2V0LCByb29tSWQpXG5cblxuXG5cblxuICAgIGJ1bGxldEluc3RhbmNlID0gdGhpcy5nZXRGaXJzdEV4aXN0cyhmYWxzZSlcbiAgICBpZiAoIWJ1bGxldEluc3RhbmNlKSByZXR1cm5cbiAgICBidWxsZXRJbnN0YW5jZS5maXJlKHgsIHksIDAsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDAsIHNvY2tldCwgcm9vbUlkKVxuXG5cblxuXG4gICAgdGhpcy5zZXRBbGwoJ3RyYWNraW5nJywgdHJ1ZSlcblxuICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLmdhbWUudGltZS50aW1lICsgdGhpcy5maXJlUmF0ZVxuICAgIHRoaXMuZngudm9sdW1lID0gLjMgKiB2b2x1bWVcbiAgICB0aGlzLmZ4LnBsYXkoKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE01MDBcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgQnVsbGV0ID0gcmVxdWlyZSgnLi4vQnVsbGV0JylcbmxldCBHdWlkID0gcmVxdWlyZSgnLi4vR3VpZCcpXG5cbmxldCBBSzQ3ID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGNvbmZpZy5nYW1lLCBjb25maWcuZ2FtZS53b3JsZCwgJ0FLLTQ3JywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG5cbiAgICAvL1x0SGVyZSB3ZSBzZXQtdXAgb3VyIGF1ZGlvIHNwcml0ZVxuICAgIHRoaXMuZnggPSBjb25maWcuZ2FtZS5hZGQuYXVkaW8oJ1A5MC1zb3VuZCcpXG4gICAgdGhpcy5hbGxvd011bHRpcGxlID0gdHJ1ZVxuXG4gICAgdGhpcy5kYW1hZ2UgPSAyMlxuICAgIHRoaXMubmV4dEZpcmUgPSAwXG4gICAgdGhpcy5idWxsZXRTcGVlZCA9IDIzMDBcbiAgICB0aGlzLmZpcmVSYXRlID0gMTIwO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA2NDsgaSsrKVxuICAgIHtcbiAgICAgICAgbGV0IGJ1bGxldCA9IG5ldyBCdWxsZXQoY29uZmlnLmdhbWUsICdidWxsZXQxMicsIGNvbmZpZy5zb2NrZXQpXG4gICAgICAgIGJ1bGxldC5idWxsZXRJZCA9IEd1aWQoKVxuICAgICAgICBidWxsZXQuaGVpZ2h0ID0gMlxuICAgICAgICBidWxsZXQud2lkdGggPSA0MFxuICAgICAgICBidWxsZXQuZGFtYWdlID0gMjJcbiAgICAgICAgdGhpcy5hZGQoYnVsbGV0LCB0cnVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xufVxuXG5BSzQ3LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLkdyb3VwLnByb3RvdHlwZSk7XG5BSzQ3LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEFLNDc7XG5cbkFLNDcucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbihwbGF5ZXIsIHNvY2tldCwgcm9vbUlkLCB2b2x1bWUpIHtcbiAgICBpZiAodGhpcy5nYW1lLnRpbWUudGltZSA8IHRoaXMubmV4dEZpcmUpXG4gICAgICAgIHJldHVyblxuXG4gICAgdmFyIHggPSBwbGF5ZXIueCArIDE1O1xuICAgIHZhciB5ID0gcGxheWVyLnkgKyAzMDtcblxuICAgIHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgMCwgc29ja2V0LCByb29tSWQpXG4gICAgdGhpcy5zZXRBbGwoJ3RyYWNraW5nJywgdHJ1ZSlcblxuICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLmdhbWUudGltZS50aW1lICsgdGhpcy5maXJlUmF0ZVxuICAgIHRoaXMuZngudm9sdW1lID0gLjMgKiB2b2x1bWVcbiAgICB0aGlzLmZ4LnBsYXkoKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFLNDdcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgQnVsbGV0ID0gcmVxdWlyZSgnLi4vQnVsbGV0JylcbmxldCBHdWlkID0gcmVxdWlyZSgnLi4vR3VpZCcpXG5cbmxldCBBSzQ3ID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGNvbmZpZy5nYW1lLCBjb25maWcuZ2FtZS53b3JsZCwgJ0FLLTQ3JywgZmFsc2UsIHRydWUsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG5cbiAgICAvL1x0SGVyZSB3ZSBzZXQtdXAgb3VyIGF1ZGlvIHNwcml0ZVxuICAgIHRoaXMuZnggPSBjb25maWcuZ2FtZS5hZGQuYXVkaW8oJ1JQRy1zb3VuZCcpXG4gICAgdGhpcy5hbGxvd011bHRpcGxlID0gdHJ1ZVxuXG4gICAgdGhpcy5kYW1hZ2UgPSAyMlxuICAgIHRoaXMubmV4dEZpcmUgPSAwXG4gICAgdGhpcy5idWxsZXRTcGVlZCA9IDIzMDBcbiAgICB0aGlzLmZpcmVSYXRlID0gMzAwMFxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA2NDsgaSsrKVxuICAgIHtcbiAgICAgICAgbGV0IGJ1bGxldCA9IG5ldyBCdWxsZXQoY29uZmlnLmdhbWUsICdidWxsZXQxMicsIGNvbmZpZy5zb2NrZXQpXG4gICAgICAgIGJ1bGxldC5idWxsZXRJZCA9IEd1aWQoKVxuICAgICAgICBidWxsZXQuaGVpZ2h0ID0gMlxuICAgICAgICBidWxsZXQud2lkdGggPSA0MFxuICAgICAgICBidWxsZXQuZGFtYWdlID0gMjJcbiAgICAgICAgdGhpcy5hZGQoYnVsbGV0LCB0cnVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xufVxuXG5BSzQ3LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLkdyb3VwLnByb3RvdHlwZSk7XG5BSzQ3LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEFLNDc7XG5cbkFLNDcucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbihwbGF5ZXIsIHNvY2tldCwgcm9vbUlkLCB2b2x1bWUpIHtcbiAgICBpZiAodGhpcy5nYW1lLnRpbWUudGltZSA8IHRoaXMubmV4dEZpcmUpXG4gICAgICAgIHJldHVyblxuXG4gICAgdmFyIHggPSBwbGF5ZXIueCArIDE1O1xuICAgIHZhciB5ID0gcGxheWVyLnkgKyAzMDtcblxuICAgIHRoaXMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpLmZpcmUoeCwgeSwgMCwgdGhpcy5idWxsZXRTcGVlZCwgMCwgMCwgc29ja2V0LCByb29tSWQpXG4gICAgdGhpcy5zZXRBbGwoJ3RyYWNraW5nJywgdHJ1ZSlcblxuICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLmdhbWUudGltZS50aW1lICsgdGhpcy5maXJlUmF0ZVxuICAgIHRoaXMuZngudm9sdW1lID0gLjYgKiB2b2x1bWVcbiAgICB0aGlzLmZ4LnBsYXkoKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFLNDdcblxuXG4vL1xuLy8gLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gLy8gIFJQRyB0aGF0IHZpc3VhbGx5IHRyYWNrIHRoZSBkaXJlY3Rpb24gdGhleSdyZSBoZWFkaW5nIGluIC8vXG4vLyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vL1xuLy8gV2VhcG9uLlJQRyA9IGZ1bmN0aW9uIChnYW1lKSB7XG4vL1xuLy8gICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGdhbWUsIGdhbWUud29ybGQsICdSUEcnLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcbi8vXG4vLyAgICAgdGhpcy5uZXh0RmlyZSA9IDA7XG4vLyAgICAgdGhpcy5idWxsZXRTcGVlZCA9IDQwMDtcbi8vICAgICB0aGlzLmZpcmVSYXRlID0gMjUwO1xuLy9cbi8vICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDMyOyBpKyspXG4vLyAgICAge1xuLy8gICAgICAgICB0aGlzLmFkZChuZXcgQnVsbGV0KGdhbWUsICdidWxsZXQxMCcpLCB0cnVlKTtcbi8vICAgICB9XG4vL1xuLy8gICAgIHRoaXMuc2V0QWxsKCd0cmFja2luZycsIHRydWUpXG4vL1xuLy8gICAgIHJldHVybiB0aGlzO1xuLy9cbi8vIH07XG4vL1xuLy8gV2VhcG9uLlJQRy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuLy8gV2VhcG9uLlJQRy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBXZWFwb24uUlBHO1xuLy9cbi8vIFdlYXBvbi5SUEcucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbiAoc291cmNlKSB7XG4vL1xuLy8gICAgIGlmICh0aGlzLmdhbWUudGltZS50aW1lIDwgdGhpcy5uZXh0RmlyZSkgeyByZXR1cm47IH1cbi8vXG4vLyAgICAgdmFyIHggPSBzb3VyY2UueCArIDEwO1xuLy8gICAgIHZhciB5ID0gc291cmNlLnkgKyAxMDtcbi8vXG4vLyAgICAgdGhpcy5nZXRGaXJzdEV4aXN0cyhmYWxzZSkuZmlyZSh4LCB5LCAwLCB0aGlzLmJ1bGxldFNwZWVkLCAwLCAtNzAwKTtcbi8vICAgICB0aGlzLmdldEZpcnN0RXhpc3RzKGZhbHNlKS5maXJlKHgsIHksIDAsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDcwMCk7XG4vL1xuLy8gICAgIHRoaXMubmV4dEZpcmUgPSB0aGlzLmdhbWUudGltZS50aW1lICsgdGhpcy5maXJlUmF0ZTtcbi8vXG4vLyB9O1xuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBCdWxsZXQgPSByZXF1aXJlKCcuLi9CdWxsZXQnKVxubGV0IEd1aWQgPSByZXF1aXJlKCcuLi9HdWlkJylcblxubGV0IEFLNDcgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgY29uZmlnLmdhbWUsIGNvbmZpZy5nYW1lLndvcmxkLCAnQUstNDcnLCBmYWxzZSwgdHJ1ZSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcblxuICAgIC8vXHRIZXJlIHdlIHNldC11cCBvdXIgYXVkaW8gc3ByaXRlXG4gICAgdGhpcy5meCA9IGNvbmZpZy5nYW1lLmFkZC5hdWRpbygnU2tvcnBpb24tc291bmQnKVxuICAgIHRoaXMuYWxsb3dNdWx0aXBsZSA9IHRydWVcblxuICAgIHRoaXMuZGFtYWdlID0gMjJcbiAgICB0aGlzLm5leHRGaXJlID0gMFxuICAgIHRoaXMuYnVsbGV0U3BlZWQgPSAyMzAwXG4gICAgdGhpcy5maXJlUmF0ZSA9IDEyMDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNjQ7IGkrKylcbiAgICB7XG4gICAgICAgIGxldCBidWxsZXQgPSBuZXcgQnVsbGV0KGNvbmZpZy5nYW1lLCAnYnVsbGV0MTInLCBjb25maWcuc29ja2V0KVxuICAgICAgICBidWxsZXQuYnVsbGV0SWQgPSBHdWlkKClcbiAgICAgICAgYnVsbGV0LmhlaWdodCA9IDJcbiAgICAgICAgYnVsbGV0LndpZHRoID0gNDBcbiAgICAgICAgYnVsbGV0LmRhbWFnZSA9IDIyXG4gICAgICAgIHRoaXMuYWRkKGJ1bGxldCwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbn1cblxuQUs0Ny5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuQUs0Ny5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBBSzQ3O1xuXG5BSzQ3LnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24ocGxheWVyLCBzb2NrZXQsIHJvb21JZCwgdm9sdW1lKSB7XG4gICAgaWYgKHRoaXMuZ2FtZS50aW1lLnRpbWUgPCB0aGlzLm5leHRGaXJlKVxuICAgICAgICByZXR1cm5cblxuICAgIHZhciB4ID0gcGxheWVyLnggKyAxNTtcbiAgICB2YXIgeSA9IHBsYXllci55ICsgMzA7XG5cbiAgICB0aGlzLmdldEZpcnN0RXhpc3RzKGZhbHNlKS5maXJlKHgsIHksIDAsIHRoaXMuYnVsbGV0U3BlZWQsIDAsIDAsIHNvY2tldCwgcm9vbUlkKVxuICAgIHRoaXMuc2V0QWxsKCd0cmFja2luZycsIHRydWUpXG5cbiAgICB0aGlzLm5leHRGaXJlID0gdGhpcy5nYW1lLnRpbWUudGltZSArIHRoaXMuZmlyZVJhdGVcbiAgICB0aGlzLmZ4LnZvbHVtZSA9IC44ICogdm9sdW1lXG4gICAgdGhpcy5meC5wbGF5KClcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBSzQ3XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgXCJBSzQ3XCI6IHJlcXVpcmUoJy4vQUs0NycpLFxuICAgIFwiQmFycmV0dFwiOiByZXF1aXJlKCcuL0JhcnJldHQnKSxcbiAgICBcIkRlc2VydEVhZ2xlXCI6IHJlcXVpcmUoJy4vRGVzZXJ0RWFnbGUnKSxcbiAgICBcIk00QTFcIjogcmVxdWlyZSgnLi9NNEExJyksXG4gICAgXCJNNTAwXCI6IHJlcXVpcmUoJy4vTTUwMCcpLFxuICAgIFwiU2tvcnBpb25cIjogcmVxdWlyZSgnLi9Ta29ycGlvbicpLFxuICAgIFwiQVVHXCI6IHJlcXVpcmUoJy4vQVVHJyksXG4gICAgXCJSUEdcIjogcmVxdWlyZSgnLi9SUEcnKSxcbiAgICBcIlA5MFwiOiByZXF1aXJlKCcuL1A5MCcpLFxuICAgIFwiRzQzXCI6IHJlcXVpcmUoJy4vRzQzJylcbn1cbiIsImNvbnN0IHNwYXduUG9pbnRzID0gW1xuICAgIHsgeDogODE1LCB5OiAxNzMwIH0sXG4gICAgeyB4OiAzMzgwLCB5OiAxMDMwIH0sXG4gICAgeyB4OiA0NDM3LCB5OiAxNTUwIH0sXG4gICAgeyB4OiA2NjkwLCB5OiAxODYwIH0sXG4gICAgeyB4OiAzODMyLCB5OiAzMzUwIH0sXG4gICAgeyB4OiAzNzc1LCB5OiAyMzAwIH0sXG4gICAgeyB4OiAyNDIwLCB5OiAyOTAwIH1cbl1cblxuY29uc3QgbGVkZ2VzID0gW1xuICAgIHsgaWQ6IDEsIHg6IDIxNDUsIHk6IDIwNjUsIHdpZHRoOiAxMzUsIGhlaWdodDogNDAgfSxcbiAgICB7IGlkOiAyLCB4OiAyNjEzLCB5OiAxMDk0LCB3aWR0aDogMTEwMCwgaGVpZ2h0OiAxMTIgfSxcbiAgICB7IGlkOiAzLCB4OiAzNjU3LCB5OiAzNDQ2LCB3aWR0aDogNTAwLCBoZWlnaHQ6IDYwMCB9LFxuICAgIHsgaWQ6IDQsIHg6IDUyMTcsIHk6IDE5MzgsIHdpZHRoOiAzODAsIGhlaWdodDogNjAwIH0sXG4gICAgeyBpZDogNSwgeDogNDIyLCB5OiAxODI0LCB3aWR0aDogMTE1MCwgaGVpZ2h0OiAzMDAgfSxcbiAgICB7IGlkOiA2LCB4OiAxNTU1LCB5OiAxNzQ5LCB3aWR0aDogMjcwLCBoZWlnaHQ6IDczMCB9LFxuICAgIHsgaWQ6IDcsIHg6IDE4MjAsIHk6IDE3NDksIHdpZHRoOiA0NzAsIGhlaWdodDogNiB9LFxuICAgIHsgaWQ6IDgsIHg6IDIyNzUsIHk6IDE3NDksIHdpZHRoOiAzMjAsIGhlaWdodDogNjMwIH0sXG4gICAgeyBpZDogOSwgeDogMjU5NSwgeTogMTY2Nywgd2lkdGg6IDExMjAsIGhlaWdodDogMjYwIH0sXG4gICAgeyBpZDogMTAsIHg6IDQzMDQsIHk6IDE2MjEsIHdpZHRoOiAzNzUsIGhlaWdodDogMTMwMCB9LFxuICAgIHsgaWQ6IDExLCB4OiAxODI1LCB5OiAyMjk4LCB3aWR0aDogMTYwLCBoZWlnaHQ6IDE1MiB9LFxuICAgIHsgaWQ6IDEyLCB4OiA1NjQ0LCB5OiAxNTczLCB3aWR0aDogMzMwLCBoZWlnaHQ6IDIwIH0sXG4gICAgeyBpZDogMTMsIHg6IDQ2NzMsIHk6IDIwMTcsIHdpZHRoOiA1NzAsIGhlaWdodDogMjU0IH0sXG4gICAgeyBpZDogMTQsIHg6IDI5NDgsIHk6IDMxMzcsIHdpZHRoOiAzODAsIGhlaWdodDogMzAwIH0sXG4gICAgeyBpZDogMTUsIHg6IDM5ODMsIHk6IDIwMjgsIHdpZHRoOiAzNDEsIGhlaWdodDogNzAwIH0sXG4gICAgeyBpZDogMTYsIHg6IDE5MTIsIHk6IDI5NjcsIHdpZHRoOiAxMDQ1LCBoZWlnaHQ6IDUwMCB9LFxuICAgIHsgaWQ6IDE3LCB4OiA2NjI4LCB5OiAxNTkwLCB3aWR0aDogMzg1LCBoZWlnaHQ6IDM3IH0sXG4gICAgeyBpZDogMTgsIHg6IDY2MjgsIHk6IDExNzgsIHdpZHRoOiAzODUsIGhlaWdodDogMzcgfSxcbiAgICB7IGlkOiAxOSwgeDogNTU5MCwgeTogMjAzOCwgd2lkdGg6IDM1MCwgaGVpZ2h0OiA2MDAgfSxcbiAgICB7IGlkOiAyMCwgeDogNjk4NCwgeTogMTk4OSwgd2lkdGg6IDQ1MCwgaGVpZ2h0OiAxNjcgfSxcbiAgICB7IGlkOiAyMSwgeDogMzY3MiwgeTogMjQwMSwgd2lkdGg6IDMzMCwgaGVpZ2h0OiA1MDAgfSxcbiAgICB7IGlkOiAyMiwgeDogMzMwMywgeTogMjU5OSwgd2lkdGg6IDQwMCwgaGVpZ2h0OiAzMDAgfSxcbiAgICB7IGlkOiAyMywgeDogNTk0MCwgeTogMjAxOCwgd2lkdGg6IDEwNTAsIGhlaWdodDogNjAwIH1cbl1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSGlnaFJ1bGVKdW5nbGUge1xuICAgIGNvbnN0cnVjdG9yKHJvb3RTY29wZSkge1xuICAgICAgICB0aGlzLnJvb3RTY29wZSA9IHJvb3RTY29wZVxuICAgIH1cblxuICAgIGdldFJhbmRvbVNwYXduUG9pbnQoKSB7XG4gICAgICAgIHJldHVybiBfLnNhbXBsZShzcGF3blBvaW50cylcbiAgICB9XG5cbiAgICBjcmVhdGUoKSB7XG4gICAgICAgIHRoaXMucm9vdFNjb3BlLnNreXNwcml0ZSA9IHRoaXMucm9vdFNjb3BlLmFkZC50aWxlU3ByaXRlKDAsIDAsIHRoaXMucm9vdFNjb3BlLmdhbWUud29ybGQud2lkdGgsIHRoaXMucm9vdFNjb3BlLmdhbWUud29ybGQuaGVpZ2h0LCAnbWFwLWJnJylcbiAgICAgICAgdGhpcy5yb290U2NvcGUucGxhdGZvcm1zID0gdGhpcy5yb290U2NvcGUuYWRkLmdyb3VwKClcbiAgICAgICAgdGhpcy5yb290U2NvcGUucGxhdGZvcm1zLmVuYWJsZUJvZHkgPSB0cnVlXG4gICAgICAgIHRoaXMuY3JlYXRlTGVkZ2VzKClcbiAgICAgICAgdGhpcy5yb290U2NvcGUucGxhdGZvcm1zLnNldEFsbCgnYm9keS5pbW1vdmFibGUnLCB0cnVlKVxuICAgICAgICB0aGlzLnJvb3RTY29wZS5wbGF0Zm9ybXMuc2V0QWxsKCdib2R5LmFsbG93R3Jhdml0eScsIGZhbHNlKVxuICAgIH1cblxuICAgIGNyZWF0ZUxlZGdlcygpIHtcbiAgICAgICAgbGVkZ2VzLmZvckVhY2goKGxlZGdlKSA9PiB7XG4gICAgICAgICAgICAvLyB2YXIgbmV3TGVkZ2UgPSB0aGlzLnJvb3RTY29wZS5wbGF0Zm9ybXMuY3JlYXRlKGxlZGdlLngsIGxlZGdlLnksICdncm91bmQnKVxuICAgICAgICAgICAgdmFyIG5ld0xlZGdlID0gdGhpcy5yb290U2NvcGUucGxhdGZvcm1zLmNyZWF0ZShsZWRnZS54LCBsZWRnZS55KVxuICAgICAgICAgICAgbmV3TGVkZ2UuaGVpZ2h0ID0gbGVkZ2UuaGVpZ2h0XG4gICAgICAgICAgICBuZXdMZWRnZS53aWR0aCA9IGxlZGdlLndpZHRoXG5cbiAgICAgICAgICAgIC8vIERlYnVnIHN0dWZmXG4gICAgICAgICAgICAvLyBuZXdMZWRnZS5hbHBoYSA9IDAuNFxuICAgICAgICAgICAgLy8gbGV0IHN0eWxlID0geyBmb250OiBcIjIwcHggQXJpYWxcIiwgZmlsbDogXCIjZmYwMDQ0XCIsIGFsaWduOiBcImNlbnRlclwiLCBiYWNrZ3JvdW5kQ29sb3I6IFwiI2ZmZmYwMFwiIH1cbiAgICAgICAgICAgIC8vIGxldCB0ZXh0ID0gdGhpcy5yb290U2NvcGUuZ2FtZS5hZGQudGV4dChsZWRnZS54LCBsZWRnZS55LCBsZWRnZS5pZCwgc3R5bGUpXG4gICAgICAgICAgICAvLyB0ZXh0LmFscGhhID0gMC4yXG4gICAgICAgIH0pXG4gICAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYXNzaWduICAgICAgICA9IHJlcXVpcmUoJ2VzNS1leHQvb2JqZWN0L2Fzc2lnbicpXG4gICwgbm9ybWFsaXplT3B0cyA9IHJlcXVpcmUoJ2VzNS1leHQvb2JqZWN0L25vcm1hbGl6ZS1vcHRpb25zJylcbiAgLCBpc0NhbGxhYmxlICAgID0gcmVxdWlyZSgnZXM1LWV4dC9vYmplY3QvaXMtY2FsbGFibGUnKVxuICAsIGNvbnRhaW5zICAgICAgPSByZXF1aXJlKCdlczUtZXh0L3N0cmluZy8jL2NvbnRhaW5zJylcblxuICAsIGQ7XG5cbmQgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChkc2NyLCB2YWx1ZS8qLCBvcHRpb25zKi8pIHtcblx0dmFyIGMsIGUsIHcsIG9wdGlvbnMsIGRlc2M7XG5cdGlmICgoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHx8ICh0eXBlb2YgZHNjciAhPT0gJ3N0cmluZycpKSB7XG5cdFx0b3B0aW9ucyA9IHZhbHVlO1xuXHRcdHZhbHVlID0gZHNjcjtcblx0XHRkc2NyID0gbnVsbDtcblx0fSBlbHNlIHtcblx0XHRvcHRpb25zID0gYXJndW1lbnRzWzJdO1xuXHR9XG5cdGlmIChkc2NyID09IG51bGwpIHtcblx0XHRjID0gdyA9IHRydWU7XG5cdFx0ZSA9IGZhbHNlO1xuXHR9IGVsc2Uge1xuXHRcdGMgPSBjb250YWlucy5jYWxsKGRzY3IsICdjJyk7XG5cdFx0ZSA9IGNvbnRhaW5zLmNhbGwoZHNjciwgJ2UnKTtcblx0XHR3ID0gY29udGFpbnMuY2FsbChkc2NyLCAndycpO1xuXHR9XG5cblx0ZGVzYyA9IHsgdmFsdWU6IHZhbHVlLCBjb25maWd1cmFibGU6IGMsIGVudW1lcmFibGU6IGUsIHdyaXRhYmxlOiB3IH07XG5cdHJldHVybiAhb3B0aW9ucyA/IGRlc2MgOiBhc3NpZ24obm9ybWFsaXplT3B0cyhvcHRpb25zKSwgZGVzYyk7XG59O1xuXG5kLmdzID0gZnVuY3Rpb24gKGRzY3IsIGdldCwgc2V0LyosIG9wdGlvbnMqLykge1xuXHR2YXIgYywgZSwgb3B0aW9ucywgZGVzYztcblx0aWYgKHR5cGVvZiBkc2NyICE9PSAnc3RyaW5nJykge1xuXHRcdG9wdGlvbnMgPSBzZXQ7XG5cdFx0c2V0ID0gZ2V0O1xuXHRcdGdldCA9IGRzY3I7XG5cdFx0ZHNjciA9IG51bGw7XG5cdH0gZWxzZSB7XG5cdFx0b3B0aW9ucyA9IGFyZ3VtZW50c1szXTtcblx0fVxuXHRpZiAoZ2V0ID09IG51bGwpIHtcblx0XHRnZXQgPSB1bmRlZmluZWQ7XG5cdH0gZWxzZSBpZiAoIWlzQ2FsbGFibGUoZ2V0KSkge1xuXHRcdG9wdGlvbnMgPSBnZXQ7XG5cdFx0Z2V0ID0gc2V0ID0gdW5kZWZpbmVkO1xuXHR9IGVsc2UgaWYgKHNldCA9PSBudWxsKSB7XG5cdFx0c2V0ID0gdW5kZWZpbmVkO1xuXHR9IGVsc2UgaWYgKCFpc0NhbGxhYmxlKHNldCkpIHtcblx0XHRvcHRpb25zID0gc2V0O1xuXHRcdHNldCA9IHVuZGVmaW5lZDtcblx0fVxuXHRpZiAoZHNjciA9PSBudWxsKSB7XG5cdFx0YyA9IHRydWU7XG5cdFx0ZSA9IGZhbHNlO1xuXHR9IGVsc2Uge1xuXHRcdGMgPSBjb250YWlucy5jYWxsKGRzY3IsICdjJyk7XG5cdFx0ZSA9IGNvbnRhaW5zLmNhbGwoZHNjciwgJ2UnKTtcblx0fVxuXG5cdGRlc2MgPSB7IGdldDogZ2V0LCBzZXQ6IHNldCwgY29uZmlndXJhYmxlOiBjLCBlbnVtZXJhYmxlOiBlIH07XG5cdHJldHVybiAhb3B0aW9ucyA/IGRlc2MgOiBhc3NpZ24obm9ybWFsaXplT3B0cyhvcHRpb25zKSwgZGVzYyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vaXMtaW1wbGVtZW50ZWQnKSgpXG5cdD8gT2JqZWN0LmFzc2lnblxuXHQ6IHJlcXVpcmUoJy4vc2hpbScpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcblx0dmFyIGFzc2lnbiA9IE9iamVjdC5hc3NpZ24sIG9iajtcblx0aWYgKHR5cGVvZiBhc3NpZ24gIT09ICdmdW5jdGlvbicpIHJldHVybiBmYWxzZTtcblx0b2JqID0geyBmb286ICdyYXonIH07XG5cdGFzc2lnbihvYmosIHsgYmFyOiAnZHdhJyB9LCB7IHRyenk6ICd0cnp5JyB9KTtcblx0cmV0dXJuIChvYmouZm9vICsgb2JqLmJhciArIG9iai50cnp5KSA9PT0gJ3JhemR3YXRyenknO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGtleXMgID0gcmVxdWlyZSgnLi4va2V5cycpXG4gICwgdmFsdWUgPSByZXF1aXJlKCcuLi92YWxpZC12YWx1ZScpXG5cbiAgLCBtYXggPSBNYXRoLm1heDtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZGVzdCwgc3JjLyosIOKApnNyY24qLykge1xuXHR2YXIgZXJyb3IsIGksIGwgPSBtYXgoYXJndW1lbnRzLmxlbmd0aCwgMiksIGFzc2lnbjtcblx0ZGVzdCA9IE9iamVjdCh2YWx1ZShkZXN0KSk7XG5cdGFzc2lnbiA9IGZ1bmN0aW9uIChrZXkpIHtcblx0XHR0cnkgeyBkZXN0W2tleV0gPSBzcmNba2V5XTsgfSBjYXRjaCAoZSkge1xuXHRcdFx0aWYgKCFlcnJvcikgZXJyb3IgPSBlO1xuXHRcdH1cblx0fTtcblx0Zm9yIChpID0gMTsgaSA8IGw7ICsraSkge1xuXHRcdHNyYyA9IGFyZ3VtZW50c1tpXTtcblx0XHRrZXlzKHNyYykuZm9yRWFjaChhc3NpZ24pO1xuXHR9XG5cdGlmIChlcnJvciAhPT0gdW5kZWZpbmVkKSB0aHJvdyBlcnJvcjtcblx0cmV0dXJuIGRlc3Q7XG59O1xuIiwiLy8gRGVwcmVjYXRlZFxuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iaiA9PT0gJ2Z1bmN0aW9uJzsgfTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2lzLWltcGxlbWVudGVkJykoKVxuXHQ/IE9iamVjdC5rZXlzXG5cdDogcmVxdWlyZSgnLi9zaGltJyk7XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuXHR0cnkge1xuXHRcdE9iamVjdC5rZXlzKCdwcmltaXRpdmUnKTtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSBjYXRjaCAoZSkgeyByZXR1cm4gZmFsc2U7IH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBrZXlzID0gT2JqZWN0LmtleXM7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9iamVjdCkge1xuXHRyZXR1cm4ga2V5cyhvYmplY3QgPT0gbnVsbCA/IG9iamVjdCA6IE9iamVjdChvYmplY3QpKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBmb3JFYWNoID0gQXJyYXkucHJvdG90eXBlLmZvckVhY2gsIGNyZWF0ZSA9IE9iamVjdC5jcmVhdGU7XG5cbnZhciBwcm9jZXNzID0gZnVuY3Rpb24gKHNyYywgb2JqKSB7XG5cdHZhciBrZXk7XG5cdGZvciAoa2V5IGluIHNyYykgb2JqW2tleV0gPSBzcmNba2V5XTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9wdGlvbnMvKiwg4oCmb3B0aW9ucyovKSB7XG5cdHZhciByZXN1bHQgPSBjcmVhdGUobnVsbCk7XG5cdGZvckVhY2guY2FsbChhcmd1bWVudHMsIGZ1bmN0aW9uIChvcHRpb25zKSB7XG5cdFx0aWYgKG9wdGlvbnMgPT0gbnVsbCkgcmV0dXJuO1xuXHRcdHByb2Nlc3MoT2JqZWN0KG9wdGlvbnMpLCByZXN1bHQpO1xuXHR9KTtcblx0cmV0dXJuIHJlc3VsdDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGZuKSB7XG5cdGlmICh0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHRocm93IG5ldyBUeXBlRXJyb3IoZm4gKyBcIiBpcyBub3QgYSBmdW5jdGlvblwiKTtcblx0cmV0dXJuIGZuO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAodmFsdWUpIHtcblx0aWYgKHZhbHVlID09IG51bGwpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgdXNlIG51bGwgb3IgdW5kZWZpbmVkXCIpO1xuXHRyZXR1cm4gdmFsdWU7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vaXMtaW1wbGVtZW50ZWQnKSgpXG5cdD8gU3RyaW5nLnByb3RvdHlwZS5jb250YWluc1xuXHQ6IHJlcXVpcmUoJy4vc2hpbScpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgc3RyID0gJ3JhemR3YXRyenknO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcblx0aWYgKHR5cGVvZiBzdHIuY29udGFpbnMgIT09ICdmdW5jdGlvbicpIHJldHVybiBmYWxzZTtcblx0cmV0dXJuICgoc3RyLmNvbnRhaW5zKCdkd2EnKSA9PT0gdHJ1ZSkgJiYgKHN0ci5jb250YWlucygnZm9vJykgPT09IGZhbHNlKSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaW5kZXhPZiA9IFN0cmluZy5wcm90b3R5cGUuaW5kZXhPZjtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoc2VhcmNoU3RyaW5nLyosIHBvc2l0aW9uKi8pIHtcblx0cmV0dXJuIGluZGV4T2YuY2FsbCh0aGlzLCBzZWFyY2hTdHJpbmcsIGFyZ3VtZW50c1sxXSkgPiAtMTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBkICAgICAgICA9IHJlcXVpcmUoJ2QnKVxuICAsIGNhbGxhYmxlID0gcmVxdWlyZSgnZXM1LWV4dC9vYmplY3QvdmFsaWQtY2FsbGFibGUnKVxuXG4gICwgYXBwbHkgPSBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHksIGNhbGwgPSBGdW5jdGlvbi5wcm90b3R5cGUuY2FsbFxuICAsIGNyZWF0ZSA9IE9iamVjdC5jcmVhdGUsIGRlZmluZVByb3BlcnR5ID0gT2JqZWN0LmRlZmluZVByb3BlcnR5XG4gICwgZGVmaW5lUHJvcGVydGllcyA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzXG4gICwgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5XG4gICwgZGVzY3JpcHRvciA9IHsgY29uZmlndXJhYmxlOiB0cnVlLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUgfVxuXG4gICwgb24sIG9uY2UsIG9mZiwgZW1pdCwgbWV0aG9kcywgZGVzY3JpcHRvcnMsIGJhc2U7XG5cbm9uID0gZnVuY3Rpb24gKHR5cGUsIGxpc3RlbmVyKSB7XG5cdHZhciBkYXRhO1xuXG5cdGNhbGxhYmxlKGxpc3RlbmVyKTtcblxuXHRpZiAoIWhhc093blByb3BlcnR5LmNhbGwodGhpcywgJ19fZWVfXycpKSB7XG5cdFx0ZGF0YSA9IGRlc2NyaXB0b3IudmFsdWUgPSBjcmVhdGUobnVsbCk7XG5cdFx0ZGVmaW5lUHJvcGVydHkodGhpcywgJ19fZWVfXycsIGRlc2NyaXB0b3IpO1xuXHRcdGRlc2NyaXB0b3IudmFsdWUgPSBudWxsO1xuXHR9IGVsc2Uge1xuXHRcdGRhdGEgPSB0aGlzLl9fZWVfXztcblx0fVxuXHRpZiAoIWRhdGFbdHlwZV0pIGRhdGFbdHlwZV0gPSBsaXN0ZW5lcjtcblx0ZWxzZSBpZiAodHlwZW9mIGRhdGFbdHlwZV0gPT09ICdvYmplY3QnKSBkYXRhW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuXHRlbHNlIGRhdGFbdHlwZV0gPSBbZGF0YVt0eXBlXSwgbGlzdGVuZXJdO1xuXG5cdHJldHVybiB0aGlzO1xufTtcblxub25jZSA9IGZ1bmN0aW9uICh0eXBlLCBsaXN0ZW5lcikge1xuXHR2YXIgb25jZSwgc2VsZjtcblxuXHRjYWxsYWJsZShsaXN0ZW5lcik7XG5cdHNlbGYgPSB0aGlzO1xuXHRvbi5jYWxsKHRoaXMsIHR5cGUsIG9uY2UgPSBmdW5jdGlvbiAoKSB7XG5cdFx0b2ZmLmNhbGwoc2VsZiwgdHlwZSwgb25jZSk7XG5cdFx0YXBwbHkuY2FsbChsaXN0ZW5lciwgdGhpcywgYXJndW1lbnRzKTtcblx0fSk7XG5cblx0b25jZS5fX2VlT25jZUxpc3RlbmVyX18gPSBsaXN0ZW5lcjtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG5vZmYgPSBmdW5jdGlvbiAodHlwZSwgbGlzdGVuZXIpIHtcblx0dmFyIGRhdGEsIGxpc3RlbmVycywgY2FuZGlkYXRlLCBpO1xuXG5cdGNhbGxhYmxlKGxpc3RlbmVyKTtcblxuXHRpZiAoIWhhc093blByb3BlcnR5LmNhbGwodGhpcywgJ19fZWVfXycpKSByZXR1cm4gdGhpcztcblx0ZGF0YSA9IHRoaXMuX19lZV9fO1xuXHRpZiAoIWRhdGFbdHlwZV0pIHJldHVybiB0aGlzO1xuXHRsaXN0ZW5lcnMgPSBkYXRhW3R5cGVdO1xuXG5cdGlmICh0eXBlb2YgbGlzdGVuZXJzID09PSAnb2JqZWN0Jykge1xuXHRcdGZvciAoaSA9IDA7IChjYW5kaWRhdGUgPSBsaXN0ZW5lcnNbaV0pOyArK2kpIHtcblx0XHRcdGlmICgoY2FuZGlkYXRlID09PSBsaXN0ZW5lcikgfHxcblx0XHRcdFx0XHQoY2FuZGlkYXRlLl9fZWVPbmNlTGlzdGVuZXJfXyA9PT0gbGlzdGVuZXIpKSB7XG5cdFx0XHRcdGlmIChsaXN0ZW5lcnMubGVuZ3RoID09PSAyKSBkYXRhW3R5cGVdID0gbGlzdGVuZXJzW2kgPyAwIDogMV07XG5cdFx0XHRcdGVsc2UgbGlzdGVuZXJzLnNwbGljZShpLCAxKTtcblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0aWYgKChsaXN0ZW5lcnMgPT09IGxpc3RlbmVyKSB8fFxuXHRcdFx0XHQobGlzdGVuZXJzLl9fZWVPbmNlTGlzdGVuZXJfXyA9PT0gbGlzdGVuZXIpKSB7XG5cdFx0XHRkZWxldGUgZGF0YVt0eXBlXTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gdGhpcztcbn07XG5cbmVtaXQgPSBmdW5jdGlvbiAodHlwZSkge1xuXHR2YXIgaSwgbCwgbGlzdGVuZXIsIGxpc3RlbmVycywgYXJncztcblxuXHRpZiAoIWhhc093blByb3BlcnR5LmNhbGwodGhpcywgJ19fZWVfXycpKSByZXR1cm47XG5cdGxpc3RlbmVycyA9IHRoaXMuX19lZV9fW3R5cGVdO1xuXHRpZiAoIWxpc3RlbmVycykgcmV0dXJuO1xuXG5cdGlmICh0eXBlb2YgbGlzdGVuZXJzID09PSAnb2JqZWN0Jykge1xuXHRcdGwgPSBhcmd1bWVudHMubGVuZ3RoO1xuXHRcdGFyZ3MgPSBuZXcgQXJyYXkobCAtIDEpO1xuXHRcdGZvciAoaSA9IDE7IGkgPCBsOyArK2kpIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuXG5cdFx0bGlzdGVuZXJzID0gbGlzdGVuZXJzLnNsaWNlKCk7XG5cdFx0Zm9yIChpID0gMDsgKGxpc3RlbmVyID0gbGlzdGVuZXJzW2ldKTsgKytpKSB7XG5cdFx0XHRhcHBseS5jYWxsKGxpc3RlbmVyLCB0aGlzLCBhcmdzKTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0c3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG5cdFx0Y2FzZSAxOlxuXHRcdFx0Y2FsbC5jYWxsKGxpc3RlbmVycywgdGhpcyk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIDI6XG5cdFx0XHRjYWxsLmNhbGwobGlzdGVuZXJzLCB0aGlzLCBhcmd1bWVudHNbMV0pO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAzOlxuXHRcdFx0Y2FsbC5jYWxsKGxpc3RlbmVycywgdGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuXHRcdFx0YnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdGwgPSBhcmd1bWVudHMubGVuZ3RoO1xuXHRcdFx0YXJncyA9IG5ldyBBcnJheShsIC0gMSk7XG5cdFx0XHRmb3IgKGkgPSAxOyBpIDwgbDsgKytpKSB7XG5cdFx0XHRcdGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuXHRcdFx0fVxuXHRcdFx0YXBwbHkuY2FsbChsaXN0ZW5lcnMsIHRoaXMsIGFyZ3MpO1xuXHRcdH1cblx0fVxufTtcblxubWV0aG9kcyA9IHtcblx0b246IG9uLFxuXHRvbmNlOiBvbmNlLFxuXHRvZmY6IG9mZixcblx0ZW1pdDogZW1pdFxufTtcblxuZGVzY3JpcHRvcnMgPSB7XG5cdG9uOiBkKG9uKSxcblx0b25jZTogZChvbmNlKSxcblx0b2ZmOiBkKG9mZiksXG5cdGVtaXQ6IGQoZW1pdClcbn07XG5cbmJhc2UgPSBkZWZpbmVQcm9wZXJ0aWVzKHt9LCBkZXNjcmlwdG9ycyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IGZ1bmN0aW9uIChvKSB7XG5cdHJldHVybiAobyA9PSBudWxsKSA/IGNyZWF0ZShiYXNlKSA6IGRlZmluZVByb3BlcnRpZXMoT2JqZWN0KG8pLCBkZXNjcmlwdG9ycyk7XG59O1xuZXhwb3J0cy5tZXRob2RzID0gbWV0aG9kcztcbiJdfQ==
