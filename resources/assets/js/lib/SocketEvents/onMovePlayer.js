import { PropTypes } from 'react'
import PlayerById from'../PlayerById'
import { playerFaceLeft, playerFaceRight } from '../RemotePlayerFaceHandler'
import GameConsts from '../GameConsts'

const propTypes = {
    id: PropTypes.string.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    rightArmAngle: PropTypes.number.isRequired,
    leftArmAngle: PropTypes.number.isRequired,
    facing: PropTypes.string.isRequired,
    health: PropTypes.number.isRequired,
    weaponId: PropTypes.string.isRequired,
    shooting: PropTypes.bool.isRequired
}

function isNotMoving(movePlayer) {
    return movePlayer.x === movePlayer.lastPosition.x && movePlayer.y === movePlayer.lastPosition.y
}

export default function onMovePlayer(data) {
    const store = this.game.store
    if (store.getState().game.state !== 'active') return

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

    // Update player angles
    movePlayer.rightArmGroup.angle = data.rightArmAngle
    movePlayer.leftArmGroup.angle = data.leftArmAngle

    if (data.facing === 'right') {
        playerFaceRight(movePlayer)
    } else {
        playerFaceLeft(movePlayer)
    }

    if (
        movePlayer.x > movePlayer.lastPosition.x &&
        data.facing === 'right' &&
        ! data.flying
    ) {
        movePlayer.playerSprite.animations.play('runRight-faceRight')
    }
    else if (
        movePlayer.x < movePlayer.lastPosition.x &&
        data.facing === 'left' &&
        ! data.flying
    ) {
        movePlayer.playerSprite.animations.play('runLeft-faceLeft')
    } else if (
        movePlayer.x < movePlayer.lastPosition.x &&
        data.facing === 'right' &&
        ! data.flying
    ) {
        movePlayer.playerSprite.animations.play('runLeft-faceRight')
    } else if (
        movePlayer.x > movePlayer.lastPosition.x &&
        data.facing === 'left' &&
        ! data.flying
    ) {
        movePlayer.playerSprite.animations.play('runRight-faceLeft')
    }

    // Is the player moving
    if (isNotMoving(movePlayer)) {
        movePlayer.playerSprite.animations.stop()
    }

    // Standing still and facing right
    if (isNotMoving(movePlayer) && movePlayer.facing === 'right') {
        movePlayer.playerSprite.frame = GameConsts.STANDING_LEFT_FRAME
    }

    // Standing still and facing left
    if (isNotMoving(movePlayer) && movePlayer.facing === 'left') {
        movePlayer.playerSprite.frame = GameConsts.STANDING_RIGHT_FRAME
    }

    movePlayer.lastPosition.x = movePlayer.x
    movePlayer.lastPosition.y = movePlayer.y
}
