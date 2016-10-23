export default function() {
    const state = this.game.store.getState()

    /**
     * Fade in or out the hurt border sprite
     */
    if (state.player.health < 100) {
        this.hurtBorderSprite.alpha = ((100 - state.player.health) / 100).toFixed(2)
    } else {
        this.hurtBorderSprite.alpha = 0
    }

    this.hurtBorderSprite.width = window.innerWidth
    this.hurtBorderSprite.height = window.innerHeight
}