'use strict'

module.exports = {
    setEventHandlers: require('./setEventHandlers'),

    onSocketConnected: require('./onSocketConnected'),
    onSocketDisconnect: require('./onSocketDisconnect'),

    onMovePlayer: require('./onMovePlayer'),
    onRemovePlayer: require('./onRemovePlayer'),
    onUpdatePlayers: require('./onUpdatePlayers'),

    onBulletFired: require('./onBulletFired')
    // onBulletsUpdate: require('./onBulletsUpdate'),
    // onBulletMoved: require('./onBulletMoved'),
    // onBulletRemoved: require('./onBulletRemoved')
}
