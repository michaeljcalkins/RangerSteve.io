import Init from './game/Init'
import Preload from './game/Preload'
import Update from './game/Update'
import Create from './game/Create'
import Render from './game/Render'

export default function(store) {
    const gameWidth = window.innerWidth
    const gameHeight = window.innerHeight
    const game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, 'ranger-steve-game')

    game.state.add('Game', function() {
        this.game = game
        this.game.store = store
        this.init = Init
        this.preload = Preload
        this.create = Create
        this.update = Update
        this.render = Render
    }, true)
}
