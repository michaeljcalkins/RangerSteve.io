import GameConsts from '../GameConsts'

export default function() {
    const state = this.game.store.getState()

    this.leftHudBg = this.game.add.tileSprite(0, this.camera.height - 50, 500, 100, 'leftHudBg')
    this.leftHudBg.fixedToCamera = true
    this.rightHudBg = this.game.add.tileSprite(this.camera.width - 500, this.camera.height - 50, 500, 100, 'rightHudBg')
    this.rightHudBg.fixedToCamera = true

    // Health
    let style = {
        font: "36px Bebas Neue",
        fill: "#fff"
    }
    let text = this.game.add.text(80, this.camera.height - 43, state.player.health, style)
    text.anchor.set(0.5, 0)
    text.smoothed = true
    text.fixedToCamera = true

}