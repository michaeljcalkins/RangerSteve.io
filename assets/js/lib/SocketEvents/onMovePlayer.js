import PlayerById from'../PlayerById'

export default function onMovePlayer(data) {
    let movePlayer = PlayerById.call(this, data.id)

    // Player not found
    if (! movePlayer) {
        return
    }

    // Update player position
    movePlayer.x = data.x
    movePlayer.y = data.y

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
        movePlayer.frame = 6
    }

    movePlayer.lastPosition.x = movePlayer.x
    movePlayer.lastPosition.y = movePlayer.y
}
