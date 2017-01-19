import GameConsts from 'lib/GameConsts'

export default function () {
  const state = this.game.store.getState()
  const innerWidth = window.innerWidth
  const innerHeight = window.innerHeight

  let gameRatio, widthScaleFactor, heightScaleFactor

  // Dynamically adjust the scale of the game
  if (innerWidth > innerHeight) {
    gameRatio = innerHeight / innerWidth
    widthScaleFactor = GameConsts.SCALING.SCALE_FACTOR
    heightScaleFactor = Math.ceil(GameConsts.SCALING.SCALE_FACTOR * gameRatio)
  } else {
    gameRatio = innerWidth / innerHeight
    widthScaleFactor = Math.ceil(GameConsts.SCALING.SCALE_FACTOR * gameRatio)
    heightScaleFactor = GameConsts.SCALING.SCALE_FACTOR
  }

  /**
   * If the client's height is greater than the allowed height limit we
   * force a scale factor on them to discourage this window ratio.
   * This gives all 16:9 ratio windows the best advantage.
   *
   * This is how the game should behave when resizing your window.
   * 1600x300 = disadvantage
   * 1600x900 = advantage
   * 300x1600 = disadvantage
   */
  // Statically adjust the scale of the game
  if (heightScaleFactor > GameConsts.SCALING.UPPER_HEIGHT_SCALE_FACTOR_LIMIT) {
    this.scale.scaleMode = window.Phaser.ScaleManager.RESIZE
    this.game.scale.setGameSize(
      GameConsts.SCALING.STATIC_WIDTH_SCALE_FACTOR,
      GameConsts.SCALING.STATIC_HEIGHT_SCALE_FACTOR
    )
    return
  }

  this.scale.scaleMode = window.Phaser.ScaleManager.EXACT_FIT
  this.game.scale.setGameSize(widthScaleFactor, heightScaleFactor)
  window.RS.tiles && window.RS.tiles.resize(widthScaleFactor, heightScaleFactor)

  // TODO resize ui with game
  // $("#ui-app").css({
  //     transform: "scale(" + Math.min(innerWidth / 1100, 1) + ")",
  //     "transform-origin": "top right",
  // })
}
