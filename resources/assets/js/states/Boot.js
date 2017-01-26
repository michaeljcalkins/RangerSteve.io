import GameConsts from 'lib/GameConsts'
import setEventHandlers from '../lib/SocketEvents/setEventHandlers'

/**
 * Connect to the server and start Preloader.
 */
function Boot (game) {
  this.game = game
}

Boot.prototype = {

  preload: function () {
    this.game.load.image('ranger-steve', '/images/ranger-steve.png')
  },

  create: function () {
    this.scale.scaleMode = window.Phaser.ScaleManager.RESIZE
    // Smooths sprite rendering
    this.game.renderer.renderSession.roundPixels = true
    // Prevents game from pausing when tab loses focus
    this.game.stage.disableVisibilityChange = true
    this.game.scale.refresh()

    // Loading screen
    this.game.stage.backgroundColor = '#2B2825'
    window.RS.rangerSteveSprite = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'ranger-steve')
    window.RS.rangerSteveSprite.anchor.setTo(0.5)

    const style = {
      font: '35px Bangers',
      fill: '#fff'
    }
    let text = this.game.add.text(window.RS.rangerSteveSprite.x - 20, window.RS.rangerSteveSprite.y + 110, 'Loading...', style)
    text.anchor.set(0.5)
    text.smoothed = true

    // Initializes the socket connection and
    // when connected the next game
    // state will be started.
    window.socket = window.Primus.connect()
    setEventHandlers.call(this)
  }

}

export default Boot
