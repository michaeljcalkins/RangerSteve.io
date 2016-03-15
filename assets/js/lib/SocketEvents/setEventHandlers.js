'use strict'

module.exports = function () {
    // Socket connection successful
    this.socket.on('connect', this.onSocketConnected.bind(this))

    // Socket disconnection
    this.socket.on('disconnect', this.onSocketDisconnect.bind(this))

    // Player move message received
    this.socket.on('move player', this.onMovePlayer.bind(this))

    // Player removed message received
    this.socket.on('remove player', this.onRemovePlayer.bind(this))

    // Updated list of players to sync enemies to
    this.socket.on('update players', this.onUpdatePlayers.bind(this))
}
