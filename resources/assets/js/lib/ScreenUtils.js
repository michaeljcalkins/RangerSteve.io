export function getScreenMetrics() {
    // get dimension of window
    var windowWidth = window.innerWidth
    var windowHeight = window.innerHeight

    var

    if (windowWidth > windowHeight) {
        var scaleX = windowWidth / 1600
        var scaleY = windowWidth / 900
    } else {
        var scaleX = windowHeight / 1600
        var scaleY = windowHeight / 900
    }

    return {
        scaleX,
        scaleY
    }
}
