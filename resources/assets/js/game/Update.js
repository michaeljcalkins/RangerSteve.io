import _ from 'lodash'
import CollisionHandler from '../lib/CollisionHandler'
import PlayerMovementHandler from '../lib/PlayerMovementHandler'
import PlayerJumpHandler from '../lib/PlayerJumpHandler'
import PlayerAngleHandler from '../lib/PlayerAngleHandler'
import emitMovePlayer from '../lib/SocketEvents/emitMovePlayer'
import Maps from '../lib/Maps'
import InitEvents from '../lib/CreateHandler/CreateEvents'
import actions from '../actions'

let lastPlayerData = {}

export default function Update() {
    if (this.game.store.getState().game.resetEventsFlag) {
        this.game.store.dispatch(actions.game.setResetEventsFlag(false))
        InitEvents.call(this)
    }

    const state = this.game.store.getState()

    if (this.audioPlayer) {
        this.audioPlayer.volume = state.game.musicVolume
    }

    if (state.game.state !== 'active' || ! state.room) return

    const currentWeapon = state.player.currentWeapon
    const isPaused = state.game.settingsModalIsOpen || state.game.chatModalIsOpen
    this.game.input.enabled = !isPaused

    // Define some shortcuts to some useful objects
    var body = this.player.body;
    var features = this.features;

    // Update player body properties
    body.drag.x = features.dragX;
    body.drag.y = features.dragY;
    body.bounce.x = features.bounceX;
    body.bounce.y = features.bounceY;

    // Update player body Arcade Slopes properties
    body.slopes.friction.x = features.frictionX;
    body.slopes.friction.y = features.frictionY;
    body.slopes.preferY    = this.features.minimumOffsetY;
    body.slopes.pullUp     = this.features.pullUp;
    body.slopes.pullDown   = this.features.pullDown;
    body.slopes.pullLeft   = this.features.pullLeft;
    body.slopes.pullRight  = this.features.pullRight;
    body.slopes.snapUp     = this.features.snapUp;
    body.slopes.snapDown   = this.features.snapDown;
    body.slopes.snapLeft   = this.features.snapLeft;
    body.slopes.snapRight  = this.features.snapRight;

    // Collide the player against the collision layer
    this.physics.arcade.collide(this.player, this.ground)


    CollisionHandler.call(this)
    Maps[state.room.map].update.call(this)

    if (state.player.health > 0) {
        PlayerMovementHandler.call(this)
        PlayerJumpHandler.call(this)
        PlayerAngleHandler.call(this)
    }

    if (this.game.input.activePointer.leftButton.isDown && state.player.health > 0) {
        state.player[currentWeapon].fire()
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
