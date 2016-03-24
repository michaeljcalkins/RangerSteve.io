'use strict'

module.exports = {
    setEventHandlers: require('./setEventHandlers'),

    onSocketConnected: require('./onSocketConnected'),
    onSocketDisconnect: require('./onSocketDisconnect'),

    onMovePlayer: require('./onMovePlayer'),
    onRemovePlayer: require('./onRemovePlayer'),
    onUpdatePlayers: require('./onUpdatePlayers'),

    onPlayerDamaged: require('./onPlayerDamaged'),
    onPlayerRespawn: require('./onPlayerRespawn'),

    onBulletFired: require('./onBulletFired'),
    onBulletRemoved: require('./onBulletRemoved')
}
