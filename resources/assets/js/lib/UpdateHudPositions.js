import moment from 'moment'
import RemainingFuelPercent from '../lib/RemainingFuelPercent'

const TEXT_Y_OFFSET = 39
const ICON_Y_OFFSET = 34

export default function() {
    const state = this.game.store.getState()

    // HUD Backgrounds
    RS.leftHudBg.x = -100
    RS.leftHudBg.y = this.camera.height - 45
    RS.leftHudBg.fixedToCamera = true

    RS.rightHudBg.x = this.camera.width - 400
    RS.rightHudBg.y = this.camera.height - 45
    RS.rightHudBg.fixedToCamera = true

    // Health
    RS.hudHealthText.x = 60
    RS.hudHealthText.y = this.camera.height - TEXT_Y_OFFSET
    RS.hudHealthText.fixedToCamera = true

    // Health Icon
    RS.hudHealthIcon.x = 25
    RS.hudHealthIcon.y = this.camera.height - ICON_Y_OFFSET
    RS.hudHealthIcon.fixedToCamera = true

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

    // Timer
    RS.hudTimerText.y = 10
    RS.hudTimerText.x = (this.camera.width / 2) - (RS.hudTimerText.width / 2)
    RS.hudTimerText.fixedToCamera = true

    // Gamemode
    RS.hudGamemodeText.y = 45
    RS.hudGamemodeText.x = (this.camera.width / 2) - (RS.hudGamemodeText.width / 2)
    RS.hudGamemodeText.fixedToCamera = true

    // Kill confirmed
    RS.hudKillConfirmed.x = (this.camera.width / 2) - (RS.hudKillConfirmed.width / 2)
    RS.hudKillConfirmed.y = (this.camera.height / 2) - (RS.hudKillConfirmed.height / 2) - 110
    RS.hudKillConfirmed.fixedToCamera = true
    RS.hudKillConfirmed.visible = state.game.showKillConfirmed

    // Health HUD
    RS.hudHealthText.setText(state.player.health)

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

    // Timer HUD
    let timeRemaining = state.room.roundEndTime - moment().unix()
    var minutes = Math.floor(timeRemaining / 60)
    var seconds = timeRemaining - minutes * 60
    seconds = `0${seconds}`.substr(-2)

    if (isNaN(minutes) || isNaN(seconds) || minutes < 0) {
        RS.hudTimerText.setText('0:00')
    } else {
        RS.hudTimerText.setText(`${minutes}:${seconds}`)
    }

    // Jump Jet HUD
    const widthPercent = RemainingFuelPercent(state.player.jumpJetCounter)
    RS.hudJumpJetBar.width = widthPercent


    if (state.room.gamemode === 'TeamDeathmatch') {
        RS.redTeamScore.y = 25
        RS.redTeamScore.x = (this.camera.width / 2) - (RS.redTeamScore.width / 2) - 100
        RS.redTeamScore.fixedToCamera = true

        RS.blueTeamScore.y = 25
        RS.blueTeamScore.x = (this.camera.width / 2) - (RS.blueTeamScore.width / 2) + 100
        RS.blueTeamScore.fixedToCamera = true
    }

}
