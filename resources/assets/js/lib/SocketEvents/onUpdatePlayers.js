import { PropTypes } from 'react'
import _ from 'lodash'

import RemotePlayer from '../RemotePlayer'
import actions from '../../actions'

const propTypes = {
    room: PropTypes.shape({
        id: PropTypes.string.isRequired,
        players: PropTypes.object.isRequired
    })
}

let lastRoomState = null

export default function onUpdatePlayers(data) {
    check(data, propTypes)

    const store = this.game.store

    if (store.getState().game.state !== 'active') return

    store.dispatch(actions.room.setRoom(data.room))

    const newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?roomId=' + store.getState().room.id
    window.history.pushState({ path: newurl }, '', newurl)

    this.enemies.forEach(function (enemy) {
        enemy.kill()
    })

    _.values(store.getState().room.players).forEach((player) => {
        if (player.id === ('/#' + window.socket.id)) {
            store.dispatch(actions.player.setScore(player.meta.score))
            store.dispatch(actions.player.setHealth(player.meta.health))
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

    if (store.getState().room.state === 'ended') {
        this.game.paused = true
    }

    if (store.getState().room.state === 'active' && lastRoomState === 'ended') {
        window.location.reload()
        return
    }

    lastRoomState = store.getState().room.state
}
