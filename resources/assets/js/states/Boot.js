/**
 * Connect to the server and start Preloader.
 */
import GameConsts from '../lib/GameConsts'
import setEventHandlers from '../lib/SocketEvents/setEventHandlers'

function Boot(game) {
    this.game = game
}

Boot.prototype = {

    create: function() {
        window.socket = io.connect()
        setEventHandlers.call(this)

        if (GameConsts.PHASER_DEBUG) {
            const phaserDebug = require('phaser-debug')
            this.add.plugin(phaserDebug)

            // needed to correctly style other elements in css
            $('body').addClass('phaser-debug')
        }
    }

}

export default Boot
