import init from './game/Init'
import preload from './game/Preload'
import update from './game/Update'
import create from './game/Create'

const gameWidth = window.innerWidth
const gameHeight = window.innerHeight
let game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, 'ranger-steve-game')

game.state.add('Game', function() {
    this.game = game
    this.init = init
    this.preload = preload
    this.create = create
    this.update = update
    this.render = () => {
        // this.game.debug.body(this.player)
    }
}, true)
