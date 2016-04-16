import PlayerById from'../PlayerById'

export default function onMovePlayer(data) {
    let movePlayer = PlayerById.call(this, data.id)

    // Player not found
    if (! movePlayer) {
        return
    }

    // Update player position
    movePlayer.player.x = data.x
    movePlayer.player.y = data.y

    if (movePlayer.player.x > movePlayer.lastPosition.x) {
        movePlayer.player.animations.play('right')
    }
    else if (movePlayer.player.x < movePlayer.lastPosition.x)
    {
        movePlayer.player.animations.play('left')
    }
    else
    {
        movePlayer.player.animations.stop()
        movePlayer.player.frame = 6
    }

    movePlayer.lastPosition.x = movePlayer.player.x
    movePlayer.lastPosition.y = movePlayer.player.y
}
