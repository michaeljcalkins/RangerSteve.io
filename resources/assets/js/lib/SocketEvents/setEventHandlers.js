import onUpdatePlayers from './onUpdatePlayers'
import onSocketConnected from './onSocketConnected'
import onSocketDisconnect from './onSocketDisconnect'
import onMovePlayer from './onMovePlayer'
import onRemovePlayer from './onRemovePlayer'
import onBulletFired from './onBulletFired'
import onPlayerDamaged from './onPlayerDamaged'
import onPlayerRespawn from './onPlayerRespawn'
import onPlayerHealthUpdate from './onPlayerHealthUpdate'
import onPlayerKillConfirmed from './onPlayerKillConfirmed'
import onMessageReceived from './onMessageReceived'
import onPlayerRemove from './onPlayerRemove'
import onPlayerKillLog from './onPlayerKillLog'
import onPlayerUpdateWeapon from './onPlayerUpdateWeapon'
import onKickPlayer from './onKickPlayer'

export default function() {
    window.socket.on('connect', onSocketConnected.bind(this))
    window.socket.on('disconnect', onSocketDisconnect.bind(this))

    window.socket.on('update players', onUpdatePlayers.bind(this))
    window.socket.on('move player', onMovePlayer.bind(this))
    window.socket.on('remove player', onRemovePlayer.bind(this))

    window.socket.on('player respawn', onPlayerRespawn.bind(this))
    window.socket.on('player remove', onPlayerRemove.bind(this))
    window.socket.on('player damaged', onPlayerDamaged.bind(this))
    window.socket.on('player health update', onPlayerHealthUpdate.bind(this))
    window.socket.on('player kill confirmed', onPlayerKillConfirmed.bind(this))
    window.socket.on('player kill log', onPlayerKillLog.bind(this))
    window.socket.on('player update weapon', onPlayerUpdateWeapon.bind(this))

    window.socket.on('message received', onMessageReceived.bind(this))

    window.socket.on('bullet fired', onBulletFired.bind(this))
    window.socket.on('kick player', onKickPlayer.bind(this))
}
