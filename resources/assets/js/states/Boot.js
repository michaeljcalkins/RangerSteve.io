/**
 * Connect to the server and start Preloader.
 */
import setEventHandlers from '../lib/SocketEvents/setEventHandlers'

function Boot(game) {
    this.game = game
}

Boot.prototype = {

    create: function() {
        window.socket = io.connect()
        setEventHandlers.call(this)
    }

}

export default Boot