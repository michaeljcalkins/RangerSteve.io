import EventHandler from '../EventHandler'
import onUpdatePlayers from './onUpdatePlayers'
import onSocketConnected from './onSocketConnected'
import onSocketDisconnect from './onSocketDisconnect'
import onMovePlayer from './onMovePlayer'
import onRemovePlayer from './onRemovePlayer'
import onBulletFired from './onBulletFired'
import onBulletRemoved from './onBulletRemoved'
import onPlayerDamaged from './onPlayerDamaged'
import onPlayerRespawn from './onPlayerRespawn'
import onPlayerHealthUpdate from './onPlayerHealthUpdate'

export default function() {
    this.socket.on('connect', onSocketConnected.bind(this))
    this.socket.on('disconnect', onSocketDisconnect.bind(this))

    this.socket.on('update players', onUpdatePlayers.bind(this))
    this.socket.on('move player', onMovePlayer.bind(this))
    this.socket.on('remove player', onRemovePlayer.bind(this))

    this.socket.on('player respawn', onPlayerRespawn.bind(this))
    this.socket.on('player damaged', onPlayerDamaged.bind(this))
    this.socket.on('player health update', onPlayerHealthUpdate.bind(this))

    this.socket.on('bullet fired', onBulletFired.bind(this))
    this.socket.on('bullet removed', onBulletRemoved.bind(this))

    EventHandler.on('player update nickname', (data) => {
        this.socket.emit('player update nickname', {
            roomId: this.roomId,
            nickname: data.nickname
        })
    })
}
