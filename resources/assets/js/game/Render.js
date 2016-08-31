import GameConsts from '../lib/GameConsts'

export default function Render() {
    if (! GameConsts.DEBUG || ! this.player) return

    this.game.debug.body(this.player)
    this.game.debug.inputInfo(32, 200)
    this.game.debug.cameraInfo(this.camera, 32, 110)
    this.game.debug.text('FPS: ' + (this.time.fps || '--'), 32, 80, "#ffffff")
    this.bullets.forEach((bullet) => {
        this.game.debug.body(bullet)
    })

    this.enemies.forEach((bullet) => {
        this.game.debug.body(bullet)
    })
}
