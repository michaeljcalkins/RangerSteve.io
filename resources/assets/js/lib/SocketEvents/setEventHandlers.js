import GameConsts from 'lib/GameConsts'
import { NetworkStats, sizeOf } from 'lib/helpers'
import onUpdatePlayers from './onUpdatePlayers'
import onSocketConnected from './onSocketConnected'
import onSocketDisconnect from './onSocketDisconnect'
import onBulletFired from './onBulletFired'
import onPlayerDamaged from './onPlayerDamaged'
import onPlayerRespawn from './onPlayerRespawn'
import onPlayerHealthUpdate from './onPlayerHealthUpdate'
import onPlayerKillConfirmed from './onPlayerKillConfirmed'
import onMessageReceived from './onMessageReceived'
import onPlayerKillLog from './onPlayerKillLog'
import onRefreshRoom from './onRefreshRoom'
import onLoadGame from './onLoadGame'
import onAnnouncement from './onAnnouncement'
import Client from '../Client'

const events = {
    [GameConsts.EVENT.LOAD_GAME]: onLoadGame,
    [GameConsts.EVENT.UPDATE_PLAYERS]: onUpdatePlayers,
    [GameConsts.EVENT.PLAYER_RESPAWN]: onPlayerRespawn,
    [GameConsts.EVENT.PLAYER_DAMAGED]: onPlayerDamaged,
    [GameConsts.EVENT.PLAYER_HEALTH_UPDATE]: onPlayerHealthUpdate,
    [GameConsts.EVENT.PLAYER_KILL_CONFIRMED]: onPlayerKillConfirmed,
    [GameConsts.EVENT.PLAYER_KILL_LOG]: onPlayerKillLog,
    [GameConsts.EVENT.MESSAGE_RECEIVED]: onMessageReceived,
    [GameConsts.EVENT.REFRESH_ROOM]: onRefreshRoom,
    [GameConsts.EVENT.BULLET_FIRED]: onBulletFired,
    [GameConsts.EVENT.ANNOUNCEMENT]: onAnnouncement,
}

let dataReceived = 0

export default function() {
    window.socket.on('data', (data) => {
        dataReceived += sizeOf(data)
        // console.log('* LOG * data', data.type, data.payload)
        if (! data || ! data.type) return

        if (! events[data.type]) return

        events[data.type].call(this, data.payload)
    })

    window.socket.on('open', onSocketConnected.bind(this))
    window.socket.on('end', onSocketDisconnect.bind(this))

    if (GameConsts.ENABLE_NETWORK_STATS) {
        NetworkStats.loop(() => {
            const dataSent = Client.getStats().dataSent
            NetworkStats.print(dataSent, dataReceived)
        })
    }
}
