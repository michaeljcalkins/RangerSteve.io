export default function() {
    const state = this.game.store.getState()

    this.leftHudBg = this.game.add.tileSprite(-100, this.camera.height - 45, 500, 100, 'leftHudBg')
    this.leftHudBg.fixedToCamera = true

    this.rightHudBg = this.game.add.tileSprite(this.camera.width - 400, this.camera.height - 45, 500, 100, 'rightHudBg')
    this.rightHudBg.fixedToCamera = true

    const style = {
        font: "24px Keep Calm",
        fill: "#fff",
    }

    // Health
    this.hudHealthText = this.game.add.text(60, this.camera.height - 39, state.player.health, style)
    this.hudHealthText.smoothed = true
    this.hudHealthText.fixedToCamera = true

    // Health Icon
    this.hudHealthIcon = this.game.add.sprite(25, this.camera.height - 34,  'hudHealthIcon')
    this.hudHealthIcon.fixedToCamera = true

    // Ammo
    const currentAmmoRemaining = state.player.currentWeapon === 'primaryWeapon'
        ? state.player.primaryAmmoRemaining
        : state.player.secondaryAmmoRemaining
    this.hudAmmoText = this.game.add.text(this.camera.width - 230, this.camera.height - 39, currentAmmoRemaining, style)
    this.hudAmmoText.smoothed = true
    this.hudAmmoText.fixedToCamera = true

    this.hudAmmoIcon = this.game.add.sprite(this.camera.width - 270, this.camera.height - 34,  'hudAmmoIcon')
    this.hudAmmoIcon.fixedToCamera = true

    // Jump Jet
    var width = 100
    var height = 20
    var bmd = this.game.add.bitmapData(width, height);
    bmd.ctx.beginPath()
    bmd.ctx.rect(0, 0, width, height)
    bmd.ctx.fillStyle = '#ffffff'
    bmd.ctx.fill()
    this.hudJumpJetBar = this.game.add.sprite(this.camera.width - 125, this.camera.height - 32, bmd)
    this.hudJumpJetBar.fixedToCamera = true

    this.hudJumpJetIcon = this.game.add.sprite(this.camera.width - 165, this.camera.height - 34,  'hudGasIcon')
    this.hudJumpJetIcon.fixedToCamera = true

    // Timer
    this.hudTimerText = this.game.add.text(this.camera.width / 2, 10, '--', style)
    this.hudTimerText.smoothed = true
    this.hudTimerText.fixedToCamera = true
    this.hudTimerText.stroke = '#000'
    this.hudTimerText.strokeThickness = 3

    // Gamemode
    this.hudGamemodeText = this.game.add.text(0, 0, state.room.gamemode, {
        font: "12px Keep Calm",
        fill: "#fff",
    })
    this.hudGamemodeText.smoothed = true
    this.hudGamemodeText.fixedToCamera = true
    this.hudGamemodeText.stroke = '#000'
    this.hudGamemodeText.strokeThickness = 2

    // Kill confirmed
    this.hudKillConfirmed = this.game.add.text(0, 0, '+10', {
        font: "24px Keep Calm",
        fill: "#fff",
    })
    this.hudKillConfirmed.smoothed = true
    this.hudKillConfirmed.fixedToCamera = true
    this.hudKillConfirmed.stroke = '#000'
    this.hudKillConfirmed.strokeThickness = 3
    this.hudKillConfirmed.visible = false
}
