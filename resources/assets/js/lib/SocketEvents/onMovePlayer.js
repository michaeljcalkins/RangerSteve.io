import { PropTypes } from 'react'
import PlayerById from'../PlayerById'
import { playerFaceLeft, playerFaceRight } from '../RemotePlayerFaceHandler'

const propTypes = {
    id: PropTypes.string.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    rightArmAngle: PropTypes.number.isRequired,
    leftArmAngle: PropTypes.number.isRequired,
    facing: PropTypes.string.isRequired
}

export default function onMovePlayer(data) {
    check(data, propTypes)

    if (data.id === ('/#' + this.socket.id))
        return

    let movePlayer = PlayerById.call(this, data.id)

    // Player not found
    if (! movePlayer) {
        console.log('Could not find player', data)
        console.log('This players id', '/#' + this.socket.id)
        return
    }

    if (data.respawnInProgress) {
        movePlayer.x = -1000
        return
    }

    // Update player position
    movePlayer.x = data.x
    movePlayer.y = data.y

    // Update player angles
    movePlayer.rightArmGroup.angle = data.rightArmAngle
    movePlayer.leftArmGroup.angle = data.leftArmAngle

    if (data.facing === 'right') {
        playerFaceRight(movePlayer)
    } else {
        playerFaceLeft(movePlayer)
    }

    if (movePlayer.x > movePlayer.lastPosition.x) {
        movePlayer.animations.play('right')
    }
    else if (movePlayer.x < movePlayer.lastPosition.x)
    {
        movePlayer.animations.play('left')
    }
    else
    {
        movePlayer.animations.stop()

        if (movePlayer.facing === 'right') {
            movePlayer.frame = 7
        } else {
            movePlayer.frame = 6
        }
    }

    movePlayer.lastPosition.x = movePlayer.x
    movePlayer.lastPosition.y = movePlayer.y
}
