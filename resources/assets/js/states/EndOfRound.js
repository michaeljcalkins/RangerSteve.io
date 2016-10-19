// init
// preload
// loadUpdate
// loadRender
// create
// update
// preRender
// render
// resize
// paused
// resumed
// pauseUpdate
// shutdown

/**
 * Setup loading screen and initialize Preloader.
 */

function EndOfRound(game) {
    this.game = game
}

EndOfRound.prototype = {

    preload: function() {
        console.log('EndOfRound')
    },

    create: function() {
        this.stage.backgroundColor = '#2B2825'

    }

}

export default EndOfRound