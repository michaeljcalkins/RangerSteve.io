import RemainingFuelPercent from '../lib/RemainingFuelPercent'

const TEXT_Y_OFFSET = 39
const ICON_Y_OFFSET = 34

export default function() {
  const state = this.game.store.getState()

    // HUD Backgrounds
  RS.rightHudBg.x = this.camera.width - 400
  RS.rightHudBg.y = this.camera.height - 45
  RS.rightHudBg.fixedToCamera = true

    // Ammo
  RS.hudAmmoText.x = this.camera.width - 230
  RS.hudAmmoText.y = this.camera.height - TEXT_Y_OFFSET
  RS.hudAmmoText.fixedToCamera = true

  RS.hudAmmoIcon.x = this.camera.width - 270
  RS.hudAmmoIcon.y = this.camera.height - ICON_Y_OFFSET
  RS.hudAmmoIcon.fixedToCamera = true

    // Jump Jet
  RS.hudJumpJetBar.x = this.camera.width - 125
  RS.hudJumpJetBar.y = this.camera.height - 32
  RS.hudJumpJetBar.fixedToCamera = true

  RS.hudJumpJetIcon.x = this.camera.width - 165
  RS.hudJumpJetIcon.y = this.camera.height - ICON_Y_OFFSET
  RS.hudJumpJetIcon.fixedToCamera = true

    // Kill confirmed
  RS.hudKillConfirmed.x = (this.camera.width / 2) - (RS.hudKillConfirmed.width / 2)
  RS.hudKillConfirmed.y = (this.camera.height / 2) - (RS.hudKillConfirmed.height / 2) - 110
  RS.hudKillConfirmed.fixedToCamera = true
  RS.hudKillConfirmed.visible = state.game.showKillConfirmed

    // Ammo Hud
  const currentAmmoRemaining = state.player.currentWeapon === 'primaryWeapon'
        ? state.player.primaryAmmoRemaining
        : state.player.secondaryAmmoRemaining

  if (
        (state.player.currentWeapon === 'primaryWeapon' && state.player.isPrimaryReloading) ||
        (state.player.currentWeapon === 'secondaryWeapon' && state.player.isSecondaryReloading)
    ) {
    RS.hudAmmoText.setText('--')
  } else {
    RS.hudAmmoText.setText(currentAmmoRemaining)
  }

    // Jump Jet HUD
  const widthPercent = RemainingFuelPercent(state.player.jumpJetCounter)
  RS.hudJumpJetBar.width = widthPercent
}
