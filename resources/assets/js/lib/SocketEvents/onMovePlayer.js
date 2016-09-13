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
    weaponId: PropTypes.string.isRequired
}

export default function onMovePlayer(data) {
    check(data, propTypes)

    const store = this.game.store
    if (store.getState().game.state !== 'active') return

    if (data.id === ('/#' + window.socket.id)) return

    let movePlayer = PlayerById.call(this, data.id)

    if (! movePlayer || (store.getState().room !== null && store.getState().room.state === 'ended')) return

    if (movePlayer.meta.health <= 0) {
        return movePlayer.alpha = 0
    }

    // Update player position
    movePlayer.x = data.x
    movePlayer.y = data.y

    movePlayer.alpha = 1
    movePlayer.rightArmGroup.visible = true
    movePlayer.leftArmGroup.visible = true
    movePlayer.headGroup.visible = true
    movePlayer.torsoGroup.visible = true

    // Control jump jet visibility
    movePlayer.rightJumpjet.visible = data.flying
    movePlayer.leftJumpjet.visible = data.flying

    // Control muzzle flash visibility
    movePlayer.muzzleFlash.visible = data.shooting

    // Update player angles
    movePlayer.rightArmGroup.angle = data.rightArmAngle
    movePlayer.leftArmGroup.angle = data.leftArmAngle

    if (data.facing === 'right') {
        playerFaceRight(movePlayer)
    } else {
        playerFaceLeft(movePlayer)
    }

    if (movePlayer.x > movePlayer.lastPosition.x && ! data.flying) {
        movePlayer.animations.play('right')
    } else if (movePlayer.x < movePlayer.lastPosition.x && ! data.flying) {
        movePlayer.animations.play('left')
    } else {
        movePlayer.animations.stop()

        if (movePlayer.facing === 'right') {
            movePlayer.frame = 7
        } else {
            movePlayer.frame = 6
        }
    }

    if (movePlayer.currentWeaponSprite.id !== data.weaponId) {
        movePlayer.currentWeaponSprite.loadTexture(data.weaponId)
        movePlayer.currentWeaponSprite.scale.setTo(GameConsts.WEAPONS[data.weaponId].position.scale)
        movePlayer.currentWeaponSprite.rotation = GameConsts.WEAPONS[data.weaponId].position.rotation

        if (movePlayer.facing === 'left') {
            movePlayer.currentWeaponSprite.x = GameConsts.WEAPONS[data.weaponId].position.leftFaceX
            movePlayer.currentWeaponSprite.y = GameConsts.WEAPONS[data.weaponId].position.leftFaceY
            movePlayer.currentWeaponSprite.scale.y *= -1
        } else {
            movePlayer.currentWeaponSprite.x = GameConsts.WEAPONS[data.weaponId].position.rightFaceX
            movePlayer.currentWeaponSprite.y = GameConsts.WEAPONS[data.weaponId].position.rightFaceY
        }

        movePlayer.currentWeaponSprite.id = data.weaponId
    }

    movePlayer.lastPosition.x = movePlayer.x
    movePlayer.lastPosition.y = movePlayer.y
}
