import RemotePlayer from '../RemotePlayer'
import EventHandler from '../EventHandler'

export default function onUpdatePlayers(data) {
    this.roomId = data.room.id

    let newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?roomId=' + data.room.id;
    window.history.pushState({ path: newurl }, '', newurl);

    this.enemies.forEach(function (enemy) {
        enemy.player.kill()
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

        let newRemotePlayer = RemotePlayer.call(this, player.id, this.game, this.player, player.x, player.y)
        this.enemies.push(newRemotePlayer)
    })
}
