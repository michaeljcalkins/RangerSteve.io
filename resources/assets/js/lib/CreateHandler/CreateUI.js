import GameConsts from '../GameConsts'

export default function() {
    const state = this.game.store.getState()

    this.leftHudBg = this.game.add.tileSprite(-100, this.camera.height - 50, 500, 100, 'leftHudBg')
    this.leftHudBg.fixedToCamera = true

    this.rightHudBg = this.game.add.tileSprite(this.camera.width - 400, this.camera.height - 50, 500, 100, 'rightHudBg')
    this.rightHudBg.fixedToCamera = true

    const style = {
        font: "36px Bebas Neue",
        fill: "#fff"
    }

    // Health
    this.hudHealthText = this.game.add.text(60, this.camera.height - 43, state.player.health, style)
    this.hudHealthText.smoothed = true
    this.hudHealthText.fixedToCamera = true

    // Health Icon
    this.hudHealthIcon = this.game.add.sprite(25, this.camera.height - 35,  'hudHealthIcon')
    this.hudHealthIcon.fixedToCamera = true

    // Ammo
    const currentAmmoRemaining = state.player.currentWeapon === 'primaryWeapon'
        ? state.player.primaryAmmoRemaining
        : state.player.secondaryAmmoRemaining
    this.hudAmmoText = this.game.add.text(this.camera.width - 230, this.camera.height - 43, currentAmmoRemaining, style)
    this.hudAmmoText.smoothed = true
    this.hudAmmoText.fixedToCamera = true

    this.hudAmmoIcon = this.game.add.sprite(this.camera.width - 270, this.camera.height - 35,  'hudAmmoIcon')
    this.hudAmmoIcon.fixedToCamera = true

    // Jump Jet
    var width = 100 // example;
    var height = 20 // example;
    var bmd = this.game.add.bitmapData(width, height);
    bmd.ctx.beginPath()
    bmd.ctx.rect(0, 0, width, height)
    bmd.ctx.fillStyle = '#ffffff'
    bmd.ctx.fill()
    this.hudJumpJetBar = this.game.add.sprite(this.camera.width - 125, this.camera.height - 35, bmd)
    this.hudJumpJetBar.fixedToCamera = true
    // player.jumpJetCounter

    this.hudJumpJetIcon = this.game.add.sprite(this.camera.width - 165, this.camera.height - 35,  'hudGasIcon')
    this.hudJumpJetIcon.fixedToCamera = true

    // Timer
    const centerHudX = this.camera.width / 2 - 250
    this.centerHudBg = this.game.add.tileSprite(centerHudX, this.camera.height - 50, 500, 100, 'centerHudBg')
    this.centerHudBg.fixedToCamera = true

    this.hudTimerText = this.game.add.text(this.camera.width / 2, this.camera.height - 43, '4:30', style)
    this.hudTimerText.x = (this.camera.width / 2) - (this.hudTimerText.width / 2)
    this.hudTimerText.smoothed = true
    this.hudTimerText.fixedToCamera = true
}