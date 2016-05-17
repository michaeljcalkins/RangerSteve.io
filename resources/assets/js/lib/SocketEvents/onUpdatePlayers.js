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

    this.enemies = this.game.add.group()

    EventHandler.emit('players update', data.room.players)

    data.room.players.forEach((player) => {
        if (player.id === ('/#' + this.socket.id)) {
            EventHandler.emit('score update', player.meta.score)
            EventHandler.emit('health update', player.meta.health)
            EventHandler.emit('player update', { player })
            return
        }

        let newRemotePlayer = RemotePlayer.call(this, player)
        let enemyPlayerName = player.meta.nickname ? player.meta.nickname : 'Unamed Ranger'

        let style = {
            font: "36px Arial",
            fill: "#fff",
            align: "center",
            stroke: "black",
            strokeThickness: 7
        }
        let text = this.game.add.text(0, -210, enemyPlayerName, style)
        newRemotePlayer.addChild(text)
        text.x = (text.width / 2) * -1
        text.smoothed = true

        this.enemies.add(newRemotePlayer)

        if (player.meta.health <= 0) {
            newRemotePlayer.rightArmGroup.visible = false
            newRemotePlayer.leftArmGroup.visible = false
            newRemotePlayer.headGroup.visible = false
            newRemotePlayer.torsoGroup.visible = false
            newRemotePlayer.animations.play('death')
        }
    })
}
