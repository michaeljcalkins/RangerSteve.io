import GameConsts from 'lib/GameConsts'

export default function () {
  const innerWidth = window.innerWidth
  const innerHeight = window.innerHeight

  let gameRatio, widthScaleFactor, heightScaleFactor

  // By default assume people want to play with a horizontal orientation.
  gameRatio = innerHeight / innerWidth
  widthScaleFactor = GameConsts.OPTIMAL_RESOLUTION.WIDTH
  heightScaleFactor = Math.ceil(GameConsts.OPTIMAL_RESOLUTION.WIDTH * gameRatio)

  // Vertical or even squareish resolutions give players large advantages so
  // any ratio that exceeds this constant is forced
  // onto a non optimal experience.
  if (gameRatio > GameConsts.MAX_OPTIMAL_GAME_RATIO) {
    gameRatio = innerWidth / innerHeight
    widthScaleFactor = Math.ceil(GameConsts.OPTIMAL_RESOLUTION.HEIGHT * gameRatio)
    heightScaleFactor = GameConsts.OPTIMAL_RESOLUTION.HEIGHT
  }

  this.scale.scaleMode = window.Phaser.ScaleManager.EXACT_FIT
  this.game.scale.setGameSize(widthScaleFactor, heightScaleFactor)
  window.RS.tiles && window.RS.tiles.resize(widthScaleFactor, heightScaleFactor)
}
