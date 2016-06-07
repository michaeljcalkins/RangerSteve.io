import init from './game/Init'
import preload from './game/Preload'
import update from './game/Update'
import create from './game/Create'
import render from './game/Render'

export default function(store) {
    const gameWidth = window.innerWidth
    const gameHeight = window.innerHeight
    const game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, 'ranger-steve-game')

    game.state.add('Game', function() {
        this.game = game
        this.init = init
        this.preload = preload
        this.create = create
        this.update = update
        this.render = render
        this.game.store = store
    }, true)
}
