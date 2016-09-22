import Preload from './game/Preload'
import Update from './game/Update'
import Create from './game/Create'
import Render from './game/Render'
import setEventHandlers from './lib/SocketEvents/setEventHandlers'

export default function(store) {
    const game = new Phaser.Game('100%', '100%', Phaser.CANVAS, 'ranger-steve-game', function() {
        this.game = game
        this.game.store = store
        this.preload = Preload
        this.create = Create
        this.update = Update
        this.render = Render

        setEventHandlers.call(this)
    })
}
