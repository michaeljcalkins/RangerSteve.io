/**
 * Connect to the server and start Preloader.
 */
import phaserDebug from 'phaser-debug'
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
            this.add.plugin(phaserDebug)

            $('body').addClass('phaser-debug')
        }
    }

}

export default Boot
