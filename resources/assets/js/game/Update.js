import _ from 'lodash'
import CollisionHandler from '../lib/CollisionHandler'
import PlayerMovementHandler from '../lib/PlayerMovementHandler'
import PlayerJumpHandler from '../lib/PlayerJumpHandler'
import PlayerAngleHandler from '../lib/PlayerAngleHandler'
import emitMovePlayer from '../lib/SocketEvents/emitMovePlayer'
import Maps from '../lib/Maps'
import InitEvents from '../lib/CreateHandler/CreateEvents'
import actions from '../actions'
import GameConsts from '../lib/GameConsts'

let lastPlayerData = {}

export default function Update() {
    if (this.game.store.getState().game.resetEventsFlag) {
        this.game.store.dispatch(actions.game.setResetEventsFlag(false))
        InitEvents.call(this)
    }

    const state = this.game.store.getState()
    const currentWeapon = state.player.currentWeapon

    if (this.audioPlayer) {
        this.audioPlayer.volume = state.game.musicVolume
    }

    if (state.game.state !== 'active' || ! state.room) return

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

    if (state.player.health > 0) {
        PlayerMovementHandler.call(this)
        PlayerJumpHandler.call(this)
        PlayerAngleHandler.call(this)
    }

    if (this.game.input.activePointer.leftButton.isDown) {
        if (this.game.store.getState().player.currentWeapon === 'primaryWeapon' && this.game.store.getState().player.isPrimaryReloading) return
        if (this.game.store.getState().player.currentWeapon === 'secondaryWeapon' && this.game.store.getState().player.isSecondaryReloading) return

        this.game.store.getState().player[currentWeapon].fire()
    }

    if (state.player.health < 100) {
        this.hurtBorderSprite.alpha = ((100 - state.player.health) / 100).toFixed(2)
    } else {
        this.hurtBorderSprite.alpha = 0
    }

    if (state.room.id && state.player.health > 0 && state.room.state !== 'ended' && state.player.facing !== null) {
        let newPlayerData = {
            roomId: state.room.id,
            x: this.player.x,
            y: this.player.y,
            rightArmAngle: this.rightArmGroup.angle,
            leftArmAngle: this.leftArmGroup.angle,
            facing: state.player.facing,
            weaponId: state.player.currentWeapon === 'primaryWeapon' ? state.player.selectedPrimaryWeaponId : state.player.selectedSecondaryWeaponId
        }

        if (_.isEqual(lastPlayerData, newPlayerData)) return

        emitMovePlayer.call(this, newPlayerData)
        lastPlayerData = newPlayerData
    }
}
