import { PropTypes } from 'react'
import _ from 'lodash'

import RemotePlayer from '../RemotePlayer'
import InitHandler from '../InitHandler'
import EventHandler from '../EventHandler'
import Maps from '../../maps'

const propTypes = {
    room: PropTypes.shape({
        id: PropTypes.string.isRequired,
        players: PropTypes.object.isRequired
    })
}

let lastRoomState = null

export default function onUpdatePlayers(data) {
    check(data, propTypes)

    this.roomId = data.room.id
    this.room = data.room

    let newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?roomId=' + data.room.id
    window.history.pushState({ path: newurl }, '', newurl)

    if (this.gameState === 'loading') {
        Maps[this.room.map].preload.call(this)
        this.currentMap = this.room.map

        this.load.onLoadComplete.add(() => {
            this.enemies = this.game.add.group()

            InitHandler.call(this)

            this.gameState = 'active'
        }, this)

        this.load.start()
    }

    if (this.gameState === 'active') {
        this.enemies.forEach(function (enemy) {
            enemy.kill()
        })

        this.enemies = this.game.add.group()

        EventHandler.emit('room update', data.room)

        _.values(data.room.players).forEach((player) => {
            if (player.id === ('/#' + this.socket.id)) {
                EventHandler.emit('score update', player.meta.score)
                EventHandler.emit('health update', player.meta.health)
                EventHandler.emit('player update', { player })
                return
            }

            let newRemotePlayer = RemotePlayer.call(this, player)
            let enemyPlayerName = player.meta.nickname ? player.meta.nickname : 'Unnamed Ranger'

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
        })

        if (this.room.state === 'ended') {
            this.game.paused = true
        }

        if (this.room.state === 'active' && lastRoomState === 'ended') {
            window.location.reload()
            return
        }

        lastRoomState = this.room.state
    }
}
