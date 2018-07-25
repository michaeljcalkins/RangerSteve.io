export default function() {
  const state = this.game.store.getState();

  /**
   * Fade in or out the hurt border sprite
   */
  this.hurtBorderSprite.alpha =
    state.player.health < 100
      ? ((100 - state.player.health) / 100).toFixed(2)
      : 0;

  this.hurtBorderSprite.width = this.camera.width;
  this.hurtBorderSprite.height = this.camera.height;
}
