'use strict'

module.exports = function() {
    console.log(this)
    this.game.renderer.renderSession.roundPixels = true
    this.game.stage.disableVisibilityChange = true
    this.physics.startSystem(Phaser.Physics.ARCADE)
}
