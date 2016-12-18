// @flow
// import playerFromServerSchema from 'lib/schemas/playerFromServerSchema'
import includes from 'lodash/includes'

import PlayerById from'../PlayerById'
import GameConsts from 'lib/GameConsts'
import updatePlayerAngles from '../updatePlayerAngles'

function isNotMoving(movePlayer) {
    return movePlayer.x === movePlayer.lastPosition.x && movePlayer.y === movePlayer.lastPosition.y
}

export default function onMovePlayer(data) {
    const store = this.game.store

    if (includes(['Boot', 'Preloader'], this.game.state.current)) return

    // const data = playerFromServerSchema.decode(buffer)

    if (data.id === window.SOCKET_ID) return

    let movePlayer = PlayerById.call(this, data.id)

    if (! movePlayer || (store.getState().room !== null && store.getState().room.state === 'ended')) return

    if (movePlayer.meta.health <= 0) {
        movePlayer.visible = false
        return
    }

    // Update player position
    movePlayer.x = data.x
    movePlayer.y = data.y
    movePlayer.visible = true

    // Control jump jet visibility
    movePlayer.rightJumpjet.visible = data.flying
    movePlayer.leftJumpjet.visible = data.flying

    movePlayer.meta.weaponId = data.weaponId

    // Control muzzle flash visibility
    if (data.shooting) {
        movePlayer.rightArmSprite.animations.frame = GameConsts.WEAPONS[movePlayer.meta.weaponId].shootingFrame
    } else {
        movePlayer.rightArmSprite.animations.frame = GameConsts.WEAPONS[movePlayer.meta.weaponId].frame
    }

    updatePlayerAngles.call(this, movePlayer, data.angle)

    if (
        (data.flying && movePlayer.facing === 'right') ||
        (isNotMoving(movePlayer) && movePlayer.facing === 'right')
    ) {
        // Standing still or flying and facing right
        movePlayer.playerSprite.animations.stop()
        movePlayer.playerSprite.frame = GameConsts.STANDING_RIGHT_FRAME
    } else if (
        (data.flying && movePlayer.facing === 'left') ||
        (isNotMoving(movePlayer) && movePlayer.facing === 'left')
    ) {
        // Standing still or flying and facing left
        movePlayer.playerSprite.animations.stop()
        movePlayer.playerSprite.frame = GameConsts.STANDING_LEFT_FRAME
    } else if (
        movePlayer.x > movePlayer.lastPosition.x &&
        movePlayer.facing === 'right' &&
        ! data.flying
    ) {
        movePlayer.playerSprite.animations.play('runRight-faceRight')
    }
    else if (
        movePlayer.x < movePlayer.lastPosition.x &&
        movePlayer.facing === 'left' &&
        ! data.flying
    ) {
        movePlayer.playerSprite.animations.play('runLeft-faceLeft')
    } else if (
        movePlayer.x < movePlayer.lastPosition.x &&
        movePlayer.facing === 'right' &&
        ! data.flying
    ) {
        movePlayer.playerSprite.animations.play('runLeft-faceRight')
    } else if (
        movePlayer.x > movePlayer.lastPosition.x &&
        movePlayer.facing === 'left' &&
        ! data.flying
    ) {
        movePlayer.playerSprite.animations.play('runRight-faceLeft')
    }

    movePlayer.lastPosition.x = movePlayer.x
    movePlayer.lastPosition.y = movePlayer.y
}
