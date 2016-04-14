import setEventHandlers from './setEventHandlers'
import onSocketConnected from './onSocketConnected'
import onSocketDisconnect from './onSocketDisconnect'

import onMovePlayer from './onMovePlayer'
import onRemovePlayer from './onRemovePlayer'
import onUpdatePlayers from './onUpdatePlayers'

import onPlayerDamaged from './onPlayerDamaged'
import onPlayerRespawn from './onPlayerRespawn'

import onBulletFired from './onBulletFired'
import onBulletRemoved from './onBulletRemoved'

export default {
    setEventHandlers,

    onSocketConnected,
    onSocketDisconnect,

    onMovePlayer,
    onRemovePlayer,
    onUpdatePlayers,

    onPlayerDamaged,
    onPlayerRespawn,

    onBulletFired,
    onBulletRemoved
}
