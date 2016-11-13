import GameConsts from 'lib/GameConsts'

export default function() {
    const state = this.game.store.getState()
    const scaleFactor = state.player.quality <= GameConsts.MAX_QUALITY_SIZE
        ? state.player.quality
        : GameConsts.MAX_QUALITY_SIZE
    const innerWidth = window.innerWidth
    const innerHeight = window.innerHeight
    const gameRatio = innerWidth / innerHeight
    const widthScaleFactor = Math.ceil(scaleFactor * gameRatio)
    const heightScaleFactor = scaleFactor

    this.game.scale.setGameSize(widthScaleFactor, heightScaleFactor)
    RS.tiles && RS.tiles.resize(widthScaleFactor, heightScaleFactor)

    // $("#ui-app").css({
    //     transform: "scale(" + Math.min(innerWidth / 1100, 1) + ")",
    //     "transform-origin": "top right",
    // })
}
