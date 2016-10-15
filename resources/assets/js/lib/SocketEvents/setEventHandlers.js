import onUpdatePlayers from './onUpdatePlayers'
import onSocketConnected from './onSocketConnected'
import onSocketDisconnect from './onSocketDisconnect'
import onMovePlayer from './onMovePlayer'
import onBulletFired from './onBulletFired'
import onPlayerDamaged from './onPlayerDamaged'
import onPlayerRespawn from './onPlayerRespawn'
import onPlayerHealthUpdate from './onPlayerHealthUpdate'
import onPlayerKillConfirmed from './onPlayerKillConfirmed'
import onMessageReceived from './onMessageReceived'
import onPlayerKillLog from './onPlayerKillLog'
import onRefreshRoom from './onRefreshRoom'
import onLoadGame from './onLoadGame'

export default function() {
    window.socket.on('connect', onSocketConnected.bind(this))
    window.socket.on('disconnect', onSocketDisconnect.bind(this))

    window.socket.on('update players', onUpdatePlayers.bind(this))
    window.socket.on('move player', onMovePlayer.bind(this))

    window.socket.on('player respawn', onPlayerRespawn.bind(this))
    window.socket.on('player damaged', onPlayerDamaged.bind(this))
    window.socket.on('player health update', onPlayerHealthUpdate.bind(this))
    window.socket.on('player kill confirmed', onPlayerKillConfirmed.bind(this))
    window.socket.on('player kill log', onPlayerKillLog.bind(this))

    window.socket.on('message received', onMessageReceived.bind(this))

    window.socket.on('refresh room', onRefreshRoom.bind(this))
    window.socket.on('bullet fired', onBulletFired.bind(this))
    window.socket.on('load game', onLoadGame.bind(this))
}
