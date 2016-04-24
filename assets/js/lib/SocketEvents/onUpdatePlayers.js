import { PropTypes } from 'react'
import RemotePlayer from '../RemotePlayer'
import EventHandler from '../EventHandler'

const propTypes = {
    room: PropTypes.shape({
        id: PropTypes.string.isRequired,
        players: PropTypes.array.isRequired
    })
}

export default function onUpdatePlayers(data) {
    check(data, propTypes)

    this.roomId = data.room.id

    let newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?roomId=' + data.room.id;
    window.history.pushState({ path: newurl }, '', newurl);

    this.enemies.forEach(function (enemy) {
        enemy.kill()
    })

    this.enemies = []

    EventHandler.emit('players update', data.room.players)

    data.room.players.forEach((player) => {
        if (player.id === ('/#' + this.socket.id)) {
            EventHandler.emit('score update', String(player.meta.score))
            EventHandler.emit('health update', String(player.meta.health))
            EventHandler.emit('player update', { player })
            return
        }

        let newRemotePlayer = RemotePlayer.call(this, player)
        this.enemies.push(newRemotePlayer)
    })
}
