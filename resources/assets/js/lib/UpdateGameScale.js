// import $ from 'jquery'

export default function() {
    const qualities = [1000, 600, 300]
    const scaleFactor = qualities[0]
    const innerWidth = window.innerWidth
    const innerHeight = window.innerHeight
    const gameRatio = innerWidth / innerHeight

    const widthScaleFactor = Math.ceil(scaleFactor * gameRatio)
    const heightScaleFactor = scaleFactor

    // $("#ui-app").css({
    //     transform: "scale(" + Math.min(innerWidth / 1100, 1) + ")",
    //     "transform-origin": "top right",
    // })

    this.game.scale.setGameSize(widthScaleFactor, heightScaleFactor)
    RS.tiles && RS.tiles.resize(widthScaleFactor, heightScaleFactor)
}