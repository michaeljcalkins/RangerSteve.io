import init from './core/Init'
import preload from './core/Preload'
import update from './core/Update'
import create from './core/Create'

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
    init,
    preload,
    create,
    update
}

game.state.add('Game', RangerSteveGame, true)
