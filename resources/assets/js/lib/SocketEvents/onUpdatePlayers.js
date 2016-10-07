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

    // Allows you to share the url with your friends to play
    const newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?roomId=' + store.getState().room.id
    window.history.pushState({ path: newurl }, '', newurl)

    // TODO Instead of destroying all enemies look for the differences and adjust accordingly.
    this.enemies.forEach(function (enemy) {
        enemy.kill()
    })

    this.enemies = this.game.add.group()

    _.values(store.getState().room.players).forEach((player) => {
        console.log(player.id, '/#' + window.socket.id)

        if (player.id === ('/#' + window.socket.id)) {
            store.dispatch(actions.player.setScore(player.meta.score))
            store.dispatch(actions.player.setHealth(player.meta.health))
            return
        }

        let newRemotePlayer = RemotePlayer.call(this, player)
        let enemyPlayerName = player.meta.nickname ? player.meta.nickname : 'Unnamed Ranger'

        const style = {
            font: "10px Arial",
            fill: "#fff",
            align: "center",
            stroke: "black",
            strokeThickness: 2
        }
        const text = this.game.add.text(0, -50, enemyPlayerName, style)
        newRemotePlayer.addChild(text)
        text.x = (text.width / 2) * -1
        text.smoothed = true

        if (player.meta.health <= 0) {
            newRemotePlayer.alpha = 0
        }

        this.enemies.add(newRemotePlayer)
    })
    // ENDTODO

    // Round has ended so pause the game
    if (store.getState().room.state === 'ended') {
        this.game.paused = true
        mixpanel.track('map:' + store.getState().room.map)
    }

    // Round has restarted and the user will rejoin on a new map
    if (store.getState().room.state === 'active' && lastRoomState === 'ended') {
        window.location.reload()
        return
    }

    // Used to detect the round went active -> ended -> active
    lastRoomState = store.getState().room.state
}
