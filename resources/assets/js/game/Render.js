import GameConsts from '../lib/GameConsts'

export default function Render() {
    if (! GameConsts.DEBUG || ! this.player) return

    this.game.debug.body(this.player)
    this.game.debug.inputInfo(320, 628);
    this.game.debug.bodyInfo(this.player, 32, 32);
    this.game.debug.cameraInfo(this.camera, 32, 628);
    this.game.debug.text(this.time.fps || '--', 4, 16, "#ffffff");
}
