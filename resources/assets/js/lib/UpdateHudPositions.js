import moment from 'moment'
import RemainingFuelPercent from '../lib/RemainingFuelPercent'

const TEXT_Y_OFFSET = 39
const ICON_Y_OFFSET = 34

export default function() {
    const state = this.game.store.getState()

    // HUD Backgrounds
    const centerHudX = this.camera.width / 2 - 250
    this.centerHudBg.x = centerHudX
    this.centerHudBg.y = this.camera.height - 45
    this.centerHudBg.fixedToCamera = true

    this.leftHudBg.x = -100
    this.leftHudBg.y = this.camera.height - 45
    this.leftHudBg.fixedToCamera = true

    this.rightHudBg.x = this.camera.width - 400
    this.rightHudBg.y = this.camera.height - 45
    this.rightHudBg.fixedToCamera = true

    // Health
    this.hudHealthText.x = 60
    this.hudHealthText.y = this.camera.height - TEXT_Y_OFFSET
    this.hudHealthText.fixedToCamera = true

    // Health Icon
    this.hudHealthIcon.x = 25
    this.hudHealthIcon.y = this.camera.height - ICON_Y_OFFSET
    this.hudHealthIcon.fixedToCamera = true

    // Ammo
    this.hudAmmoText.x = this.camera.width - 230
    this.hudAmmoText.y = this.camera.height - TEXT_Y_OFFSET
    this.hudAmmoText.fixedToCamera = true

    this.hudAmmoIcon.x = this.camera.width - 270
    this.hudAmmoIcon.y = this.camera.height - ICON_Y_OFFSET
    this.hudAmmoIcon.fixedToCamera = true

    // Jump Jet
    this.hudJumpJetBar.x = this.camera.width - 125
    this.hudJumpJetBar.y = this.camera.height - 32
    this.hudJumpJetBar.fixedToCamera = true

    this.hudJumpJetIcon.x = this.camera.width - 165
    this.hudJumpJetIcon.y = this.camera.height - ICON_Y_OFFSET
    this.hudJumpJetIcon.fixedToCamera = true

    // Timer
    this.hudTimerText.y = this.camera.height - TEXT_Y_OFFSET
    this.hudTimerText.x = (this.camera.width / 2) - (this.hudTimerText.width / 2)
    this.hudTimerText.fixedToCamera = true

    // Health HUD
    this.hudHealthText.setText(state.player.health)

    // Ammo Hud
    const currentAmmoRemaining = state.player.currentWeapon === 'primaryWeapon'
        ? state.player.primaryAmmoRemaining
        : state.player.secondaryAmmoRemaining

    if (
        (state.player.currentWeapon === 'primaryWeapon' && state.player.isPrimaryReloading) ||
        (state.player.currentWeapon === 'secondaryWeapon' && state.player.isSecondaryReloading)
    ) {
        this.hudAmmoText.setText('--')
    } else {
        this.hudAmmoText.setText(currentAmmoRemaining)
    }

    // Timer HUD
    let timeRemaining = state.room.roundEndTime - moment().unix()
    var minutes = Math.floor(timeRemaining / 60)
    var seconds = timeRemaining - minutes * 60
    seconds = `0${seconds}`.substr(-2)

    if (isNaN(minutes) || isNaN(seconds) || minutes < 0) {
        this.hudTimerText.setText('0:00')
    } else {
        this.hudTimerText.setText(`${minutes}:${seconds}`)
    }

    // Jump Jet HUD
    const widthPercent = RemainingFuelPercent(state.player.jumpJetCounter)
    this.hudJumpJetBar.width = widthPercent

    if (this.audioPlayer) {
        this.audioPlayer.volume = state.game.musicVolume
    }
}