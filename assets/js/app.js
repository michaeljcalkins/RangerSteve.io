'use strict'

let InputHandler = require('./lib/InputHandler')
// let EnemyBuffalo = require('./lib/EnemyBuffalo')
let SocketEvents = require('./lib/SocketEvents')
let Core = require('./core')

let gameWidth = window.innerWidth
let gameHeight = window.innerHeight
let game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, 'ranger-steve-game')

let RangerSteveGame = function() {
    this.currentWeapon = 0
    this.enemies = []
    this.game = game
    this.ground
    this.platforms
    this.player
    this.score = 0
    this.scoreText
    this.socket
    this.weaponName = null
    this.weapons = []
}

RangerSteveGame.prototype = {
    init: Core.init,
    preload: Core.preload,
    create: Core.create,
    update: Core.update,

    leftInputIsActive: InputHandler.leftInputIsActive,
    rightInputIsActive: InputHandler.rightInputIsActive,
    upInputIsActive: InputHandler.upInputIsActive,
    upInputReleased: InputHandler.upInputReleased,

    nextWeapon: function() {
        //  Tidy-up the current weapon
        if (this.currentWeapon > 9)
        {
            this.weapons[this.currentWeapon].reset()
        }
        else
        {
            this.weapons[this.currentWeapon].visible = false
            this.weapons[this.currentWeapon].callAll('reset', null, 0, 0)
            this.weapons[this.currentWeapon].setAll('exists', false)
        }

        //  Activate the new one
        this.currentWeapon++

        if (this.currentWeapon === this.weapons.length)
        {
            this.currentWeapon = 0
        }

        this.weapons[this.currentWeapon].visible = true

        this.weaponName.text = this.weapons[this.currentWeapon].name
    },

    setEventHandlers: SocketEvents.setEventHandlers,
    onUpdatePlayers: SocketEvents.onUpdatePlayers,
    onSocketConnected: SocketEvents.onSocketConnected,
    onSocketDisconnect: SocketEvents.onSocketDisconnect,
    onMovePlayer: SocketEvents.onMovePlayer,
    onRemovePlayer: SocketEvents.onRemovePlayer,
    onBulletFired: SocketEvents.onBulletFired
    // onBulletsUpdate: SocketEvents.onBulletsUpdate,
    // onBulletMoved: SocketEvents.onBulletMoved,
    // onBulletRemoved: SocketEvents.onBulletRemoved
}

game.state.add('Game', RangerSteveGame, true)
