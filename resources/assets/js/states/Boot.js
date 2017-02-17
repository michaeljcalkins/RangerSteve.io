import setEventHandlers from '../lib/SocketEvents/setEventHandlers'

/**
 * Connect to the server and start Preloader.
 */
function Boot (game) {
  this.game = game
}

Boot.prototype = {
  create: function () {
    this.scale.scaleMode = window.Phaser.ScaleManager.RESIZE
    // Smooths sprite rendering
    this.game.renderer.renderSession.roundPixels = true
    // Prevents game from pausing when tab loses focus
    this.game.stage.disableVisibilityChange = true
    this.game.scale.refresh()

    // Initializes the socket connection and
    // when connected the next game
    // state will be started.
    window.socket = window.Primus.connect()
    setEventHandlers.call(this)
  }

}

export default Boot
