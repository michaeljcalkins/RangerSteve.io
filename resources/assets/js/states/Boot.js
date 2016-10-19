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

function Boot(game) {
    this.game = game
}

Boot.prototype = {

    preload: function() {
        console.log('Boot')
        this.load.image('ranger-steve', '/images/ranger-steve.png')
    },

    create: function() {
        this.stage.backgroundColor = '#2B2825'

        this.rangerSteveSprite = this.add.sprite(this.world.centerX, this.world.centerY, 'ranger-steve')
        this.rangerSteveSprite.anchor.setTo(0.5)

        const style = {
            font: "35px Bangers",
            fill: "#fff"
        }
        let text = this.game.add.text(this.rangerSteveSprite.x - 20, this.rangerSteveSprite.y + 110, 'Loading...', style)
        text.anchor.set(0.5)
        text.smoothed = true

        this.game.state.start('Preloader', false)
    }

}

export default Boot