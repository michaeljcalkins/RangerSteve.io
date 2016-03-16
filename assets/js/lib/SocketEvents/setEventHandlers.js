'use strict'

module.exports = function () {
    this.socket.on('connect', this.onSocketConnected.bind(this))
    this.socket.on('disconnect', this.onSocketDisconnect.bind(this))

    this.socket.on('update players', this.onUpdatePlayers.bind(this))
    this.socket.on('move player', this.onMovePlayer.bind(this))
    this.socket.on('remove player', this.onRemovePlayer.bind(this))

    this.socket.on('bullet fired', this.onBulletFired.bind(this))
    // this.socket.on('bullets update', this.onBulletsUpdate.bind(this))
    // this.socket.on('bullet moved', this.onBulletMoved.bind(this))
    // this.socket.on('bullet removed', this.onBulletRemoved.bind(this))
}
