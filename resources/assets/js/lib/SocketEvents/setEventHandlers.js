import EventHandler from '../EventHandler'
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
import emitMessageSend from './emitMessageSend'
import onKickPlayer from './onKickPlayer'

export default function() {
    this.socket.on('connect', onSocketConnected.bind(this))
    this.socket.on('disconnect', onSocketDisconnect.bind(this))

    this.socket.on('update players', onUpdatePlayers.bind(this))
    this.socket.on('move player', onMovePlayer.bind(this))
    this.socket.on('remove player', onRemovePlayer.bind(this))

    this.socket.on('player respawn', onPlayerRespawn.bind(this))
    this.socket.on('player remove', onPlayerRemove.bind(this))
    this.socket.on('player damaged', onPlayerDamaged.bind(this))
    this.socket.on('player health update', onPlayerHealthUpdate.bind(this))
    this.socket.on('player kill confirmed', onPlayerKillConfirmed.bind(this))
    this.socket.on('player kill log', onPlayerKillLog.bind(this))
    this.socket.on('player update weapon', onPlayerUpdateWeapon.bind(this))

    this.socket.on('message received', onMessageReceived.bind(this))

    this.socket.on('bullet fired', onBulletFired.bind(this))
    this.socket.on('kick player', onKickPlayer.bind(this))

    EventHandler.on('message send', (data) => {
        emitMessageSend.call(this, {
            roomId: this.roomId,
            playerId: '/#' + this.socket.id,
            playerNickname: this.player.meta.nickname ? this.player.meta.nickname : 'Unnamed Ranger',
            message: data.message
        })
    })

    EventHandler.on('player update nickname', (data) => {
        this.player.meta.nickname = data.nickname
        this.socket.emit('player update nickname', {
            roomId: this.roomId,
            nickname: data.nickname
        })
    })
}
