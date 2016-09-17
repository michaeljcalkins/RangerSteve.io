import _ from 'lodash'
import moment from 'moment'

import CollisionHandler from '../lib/CollisionHandler'
import PlayerMovementHandler from '../lib/PlayerMovementHandler'
import PlayerJumpHandler from '../lib/PlayerJumpHandler'
import PlayerAngleHandler from '../lib/PlayerAngleHandler'
import FireStandardBullet from '../lib/FireStandardBullet'
import FireShotgunShell from '../lib/FireShotgunShell'
import FireRocket from '../lib/FireRocket'
import emitMovePlayer from '../lib/SocketEvents/emitMovePlayer'
import Maps from '../lib/Maps'
import InitEvents from '../lib/CreateHandler/CreateEvents'
import actions from '../actions'
import GameConsts from '../lib/GameConsts'
import RemainingFuelPercent from '../lib/RemainingFuelPercent'

let lastPlayerData = {}

export default function Update() {
    if (this.game.store.getState().game.resetEventsFlag) {
        this.game.store.dispatch(actions.game.setResetEventsFlag(false))
        InitEvents.call(this)
    }

    const state = this.game.store.getState()

    if (state.game.state !== 'active' || ! state.room) return


    this.hudHealthText.setText(state.player.health)

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

    // Pause controls so user can't do anything in the background accidentally
    const isPaused = state.game.settingsModalIsOpen || state.game.chatModalIsOpen
    this.game.input.enabled = !isPaused

    // Define some shortcuts to some useful objects
    var body = this.player.body

    // Update player body properties
    body.drag.x = GameConsts.SLOPE_FEATURES.dragX
    body.drag.y = GameConsts.SLOPE_FEATURES.dragY
    body.bounce.x = GameConsts.SLOPE_FEATURES.bounceX
    body.bounce.y = GameConsts.SLOPE_FEATURES.bounceY

    // Update player body Arcade Slopes properties
    body.slopes.friction.x = GameConsts.SLOPE_FEATURES.frictionX
    body.slopes.friction.y = GameConsts.SLOPE_FEATURES.frictionY
    body.slopes.preferY    = GameConsts.SLOPE_FEATURES.minimumOffsetY
    body.slopes.pullUp     = GameConsts.SLOPE_FEATURES.pullUp
    body.slopes.pullDown   = GameConsts.SLOPE_FEATURES.pullDown
    body.slopes.pullLeft   = GameConsts.SLOPE_FEATURES.pullLeft
    body.slopes.pullRight  = GameConsts.SLOPE_FEATURES.pullRight
    body.slopes.snapUp     = GameConsts.SLOPE_FEATURES.snapUp
    body.slopes.snapDown   = GameConsts.SLOPE_FEATURES.snapDown
    body.slopes.snapLeft   = GameConsts.SLOPE_FEATURES.snapLeft
    body.slopes.snapRight  = GameConsts.SLOPE_FEATURES.snapRight

    CollisionHandler.call(this)
    Maps[state.room.map].update.call(this)

    /**
     * User related movement and sprite angles
     */
    if (state.player.health > 0) {
        PlayerMovementHandler.call(this)
        PlayerJumpHandler.call(this)
        PlayerAngleHandler.call(this)
    }

    /**
     * Fire current weapon
     */
    if (this.game.input.activePointer.leftButton.isDown) {
        const player = this.game.store.getState().player
        const currentWeaponId = player.currentWeapon === 'primaryWeapon'
            ? player.selectedPrimaryWeaponId
            : player.selectedSecondaryWeaponId
        const currentWeapon = GameConsts.WEAPONS[currentWeaponId]

        // Check if primary gun has ammo and is selected
        if (
            player.currentWeapon === 'primaryWeapon' &&
            (
                player.isPrimaryReloading ||
                player.primaryAmmoRemaining <= 0
            )
        ) return

        // Check if secondary gun has ammo and is selected
        if (
            player.currentWeapon === 'secondaryWeapon' &&
            (
                player.isSecondaryReloading ||
                player.secondaryAmmoRemaining <= 0
            )
        ) return

        switch(currentWeapon.bulletType) {
            case 'rocket':
                FireRocket.call(this, currentWeaponId)
                break;

            case 'shotgun':
                FireShotgunShell.call(this, currentWeaponId)
                break

            default:
                FireStandardBullet.call(this, currentWeaponId)
        }
    }

    /**
     * Fade in or out the hurt border sprite
     */
    if (state.player.health < 100) {
        this.hurtBorderSprite.alpha = ((100 - state.player.health) / 100).toFixed(2)
    } else {
        this.hurtBorderSprite.alpha = 0
    }

    /**
     * Rotate bullets according to trajectory
     */
    this.bullets.forEach((bullet) => {
        bullet.rotation = Math.atan2(bullet.body.velocity.y, bullet.body.velocity.x)
    })

    this.enemyBullets.forEach((bullet) => {
        bullet.rotation = Math.atan2(bullet.body.velocity.y, bullet.body.velocity.x)
    })

    /**
     * Emit player's latest position on the map
     */
    if (state.room.id && state.player.health > 0 && state.room.state !== 'ended' && state.player.facing !== null) {
        let newPlayerData = {
            id: ('/#' + window.socket.id),
            roomId: state.room.id,
            x: this.player.x,
            y: this.player.y,
            rightArmAngle: this.rightArmGroup.angle,
            leftArmAngle: this.leftArmGroup.angle,
            facing: state.player.facing,
            flying: this.rightJumpjet.visible && this.leftJumpjet.visible,
            shooting: this.muzzleFlash.visible,
            weaponId: state.player.currentWeapon === 'primaryWeapon' ? state.player.selectedPrimaryWeaponId : state.player.selectedSecondaryWeaponId
        }

        if (_.isEqual(lastPlayerData, newPlayerData)) return

        emitMovePlayer.call(this, newPlayerData)
        lastPlayerData = newPlayerData
    }
}
