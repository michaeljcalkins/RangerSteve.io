// Player has moved
function onMovePlayer (data) {
    // Find player in array
    var movePlayer = playerById(this.id)

    // Player not found
    if (!movePlayer) {
        util.log('Player not found: ' + this.id)
        return
    }

    // Update player position
    movePlayer.setX(data.x)
    movePlayer.setY(data.y)

    // Broadcast updated position to connected socket clients
    io.emit('move player', {
        id: movePlayer.id,
        clientId: movePlayer.clientId,
        x: movePlayer.getX(),
        y: movePlayer.getY()
    })
}
