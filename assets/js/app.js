'use strict'

let guid = require('./lib/guid')

// Game functions
let init = require('./lib/game/init')
let preload = require('./lib/game/preload')
let create = require('./lib/game/create')
let update = require('./lib/game/update')

let clientSocketHandler = require('./lib/clientSocketHandler')
let clienInputHandler = require('./lib/clientInputHandler')

var gameWidth = window.innerWidth
var gameHeight = window.innerHeight
var game = new Phaser.Game(gameWidth, gameHeight, Phaser.CANVAS, 'ranger-steve-game');

var RangerSteveGame = function() {
    this.clientId = guid()
    this.currentWeapon = 0;
    this.enemies = []
    this.game = game
    this.ground
    this.platforms
    this.player
    this.score = 0
    this.scoreText
    this.socket
    this.weaponName = null;
    this.weapons = [];
}

RangerSteveGame.prototype = {
    // Game functions
    init,
    preload,
    create,
    update,

    // Socket events
    setEventHandlers: clientSocketHandler.setEventHandlers,
    onSocketConnected: clientSocketHandler.onSocketConnected,
    onSocketDisconnect: clientSocketHandler.onSocketDisconnect,
    onNewPlayer: clientSocketHandler.onNewPlayer,
    onDeadPlayer: clientSocketHandler.onDeadPlayer,
    onMovePlayer: clientSocketHandler.onMovePlayer,
    onRemovePlayer: clientSocketHandler.onRemovePlayer,

    // Input controls
    leftInputIsActive: clienInputHandler.leftInputIsActive,
    rightInputIsActive: clienInputHandler.rightInputIsActive,
    upInputIsActive: clienInputHandler.upInputIsActive,
    upInputReleased: clienInputHandler.upInputReleased,

    nextWeapon: function() {
        //  Tidy-up the current weapon
        if (this.currentWeapon > 9)
        {
            this.weapons[this.currentWeapon].reset();
        }
        else
        {
            this.weapons[this.currentWeapon].visible = false;
            this.weapons[this.currentWeapon].callAll('reset', null, 0, 0);
            this.weapons[this.currentWeapon].setAll('exists', false);
        }

        //  Activate the new one
        this.currentWeapon++;

        if (this.currentWeapon === this.weapons.length)
        {
            this.currentWeapon = 0;
        }

        this.weapons[this.currentWeapon].visible = true;

        this.weaponName.text = this.weapons[this.currentWeapon].name
    }
}

game.state.add('Game', RangerSteveGame, true)
