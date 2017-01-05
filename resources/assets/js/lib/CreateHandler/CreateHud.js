export default function() {
  const state = this.game.store.getState()

  RS.leftHudBg = this.game.add.tileSprite(-100, this.camera.height - 45, 500, 100, 'leftHudBg')
  RS.leftHudBg.fixedToCamera = true

  RS.rightHudBg = this.game.add.tileSprite(this.camera.width - 400, this.camera.height - 45, 500, 100, 'rightHudBg')
  RS.rightHudBg.fixedToCamera = true

  const style = {
    font: "24px Keep Calm",
    fill: "#fff",
  }

    // Health
  RS.hudHealthText = this.game.add.text(60, this.camera.height - 39, state.player.health, style)
  RS.hudHealthText.smoothed = true
  RS.hudHealthText.fixedToCamera = true

    // Health Icon
  RS.hudHealthIcon = this.game.add.sprite(25, this.camera.height - 34,  'hudHealthIcon')
  RS.hudHealthIcon.fixedToCamera = true

    // Ammo
  const currentAmmoRemaining = state.player.currentWeapon === 'primaryWeapon'
        ? state.player.primaryAmmoRemaining
        : state.player.secondaryAmmoRemaining
  RS.hudAmmoText = this.game.add.text(this.camera.width - 230, this.camera.height - 39, currentAmmoRemaining, style)
  RS.hudAmmoText.smoothed = true
  RS.hudAmmoText.fixedToCamera = true

  RS.hudAmmoIcon = this.game.add.sprite(this.camera.width - 270, this.camera.height - 34,  'hudAmmoIcon')
  RS.hudAmmoIcon.fixedToCamera = true

    // Jump Jet
  var width = 100
  var height = 20
  var bmd = this.game.add.bitmapData(width, height);
  bmd.ctx.beginPath()
  bmd.ctx.rect(0, 0, width, height)
  bmd.ctx.fillStyle = '#ffffff'
  bmd.ctx.fill()
  RS.hudJumpJetBar = this.game.add.sprite(this.camera.width - 125, this.camera.height - 32, bmd)
  RS.hudJumpJetBar.fixedToCamera = true

  RS.hudJumpJetIcon = this.game.add.sprite(this.camera.width - 165, this.camera.height - 34,  'hudGasIcon')
  RS.hudJumpJetIcon.fixedToCamera = true

    // Timer
  RS.hudTimerText = this.game.add.text(this.camera.width / 2, 10, '--', style)
  RS.hudTimerText.smoothed = true
  RS.hudTimerText.fixedToCamera = true
  RS.hudTimerText.stroke = '#000'
  RS.hudTimerText.strokeThickness = 3

    // Gamemode
  let gamemodeText = state.room.gamemode === 'Deathmatch' ? 'DEATHMATCH' : null
  gamemodeText = state.room.gamemode === 'TeamDeathmatch' ? 'TEAM DEATHMATCH': gamemodeText

  RS.hudGamemodeText = this.game.add.text(0, 0, gamemodeText, {
    font: "12px Keep Calm",
    fill: "#fff",
  })
  RS.hudGamemodeText.smoothed = true
  RS.hudGamemodeText.fixedToCamera = true
  RS.hudGamemodeText.stroke = '#000'
  RS.hudGamemodeText.strokeThickness = 2

    // Kill confirmed
  RS.hudKillConfirmed = this.game.add.text(0, 0, '+10', {
    font: "24px Keep Calm",
    fill: "#fff",
  })
  RS.hudKillConfirmed.smoothed = true
  RS.hudKillConfirmed.fixedToCamera = true
  RS.hudKillConfirmed.stroke = '#000'
  RS.hudKillConfirmed.strokeThickness = 3
  RS.hudKillConfirmed.visible = false

  if (state.room.gamemode === 'TeamDeathmatch') {
    RS.redTeamScore = this.game.add.text(0, 0, state.room.redTeamScore, {
      font: "24px Keep Calm",
      fill: "#FF2525",
    })
    RS.redTeamScore.smoothed = true
    RS.redTeamScore.fixedToCamera = true
    RS.redTeamScore.stroke = '#000'
    RS.redTeamScore.strokeThickness = 1

    RS.blueTeamScore = this.game.add.text(0, 0, state.room.blueTeamScore, {
      font: "24px Keep Calm",
      fill: "#2578FF",
    })
    RS.blueTeamScore.smoothed = true
    RS.blueTeamScore.fixedToCamera = true
    RS.blueTeamScore.stroke = '#000'
    RS.blueTeamScore.strokeThickness = 1
  }
}
