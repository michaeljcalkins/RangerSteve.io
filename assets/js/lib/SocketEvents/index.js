'use strict'

module.exports = {
    setEventHandlers: require('./setEventHandlers'),

    onSocketConnected: require('./onSocketConnected'),
    onSocketDisconnect: require('./onSocketDisconnect'),

    onMovePlayer: require('./onMovePlayer'),
    onRemovePlayer: require('./onRemovePlayer'),
    onUpdatePlayers: require('./onUpdatePlayers'),

    onBulletFired: require('./onBulletFired'),
    onBulletRemoved: require('./onBulletRemoved')
}
