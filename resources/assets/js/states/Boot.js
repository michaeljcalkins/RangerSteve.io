import $ from 'jquery'

import GameConsts from '../lib/GameConsts'
import setEventHandlers from '../lib/SocketEvents/setEventHandlers'

/**
 * Connect to the server and start Preloader.
 */
function Boot(game) {
    this.game = game
}

Boot.prototype = {

    preload: function() {
        this.game.load.image('ranger-steve', '/images/ranger-steve.png')
    },

    create: function() {
        // Loading screen
        this.game.stage.backgroundColor = '#2B2825'
        RS.rangerSteveSprite = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'ranger-steve')
        RS.rangerSteveSprite.anchor.setTo(0.5)

        const style = {
            font: "35px Bangers",
            fill: "#fff",
        }
        let text = this.game.add.text(RS.rangerSteveSprite.x - 20, RS.rangerSteveSprite.y + 110, 'Loading...', style)
        text.anchor.set(0.5)
        text.smoothed = true

        window.socket = io.connect()
        setEventHandlers.call(this)

        // if (GameConsts.PHASER_DEBUG) {
        //     const phaserDebug = require('phaser-debug')
        //     this.add.plugin(phaserDebug)

        //     // needed to correctly style other elements in css
        //     $('body').addClass('phaser-debug')
        // }
    },

}

export default Boot
