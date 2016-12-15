// @flow
import includes from 'lodash/includes'
import values from 'lodash/values'

import RemotePlayer from '../RemotePlayer'
import actions from 'actions'

let lastRoomState = null

export default function onUpdatePlayers(data: {
    room: {
        map: string,
        gamemode: string,
        id: string,
        players: Object,
    },
}) {
    return
    if (includes(['Boot', 'Preloader'], this.game.state.current)) return

    const store = this.game.store

    store.dispatch(actions.room.setRoom(data.room))

    // Allows you to share the url with your friends to play
    const newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?roomId=' + store.getState().room.id
    window.history.pushState({ path: newurl }, '', newurl)

    if (RS.enemies) RS.enemies.destroy(true)
    // RS.enemies = this.game.add.group()

    const rankedPlayers = values(store.getState().room.players)
        .sort((a, b) => a.meta.score < b.meta.score) // TODO should consider meta.secondsInRound as well
        .map(player => player)

    values(store.getState().room.players).forEach((player) => {
        if (player.id === window.SOCKET_ID) {
            store.dispatch(actions.player.setScore(player.meta.score))
            store.dispatch(actions.player.setHealth(player.meta.health))
            return
        }

        let newRemotePlayer = RemotePlayer.call(this, player)
        let enemyPlayerName = player.meta.nickname ? player.meta.nickname : 'Unnamed Ranger'

        if (rankedPlayers[0] && rankedPlayers[0].id === player.id) enemyPlayerName = `#1 ${enemyPlayerName}`
        if (rankedPlayers[1] && rankedPlayers[1].id === player.id) enemyPlayerName = `#2 ${enemyPlayerName}`
        if (rankedPlayers[2] && rankedPlayers[2].id === player.id) enemyPlayerName = `#3 ${enemyPlayerName}`

        const style = {
            font: "10px Arial",
            fill: "#fff",
            align: "center",
            stroke: "black",
            strokeThickness: 2,
        }
        const text = this.game.add.text(0, -50, enemyPlayerName, style)
        newRemotePlayer.addChild(text)
        text.x = (text.width / 2) * -1
        text.smoothed = true

        if (player.meta.health <= 0) {
            newRemotePlayer.visible = false
        }

        RS.enemies.add(newRemotePlayer)
    })

    // Round has ended so pause the game
    if (store.getState().room.state === 'ended') {
        RS.jumpjetFx.stop()
        this.game.input.enabled = false
        this.game.input.reset()
        this.game.paused = true
    }

    // Round has restarted and the user will rejoin on a new map
    if (store.getState().room.state === 'active' && lastRoomState === 'ended') {
        lastRoomState = 'active'
        this.game.paused = false
        this.game.world.removeAll()
        this.game.state.start('Preloader', true, false)
        return
    }

    // Used to detect the round went active -> ended -> active
    lastRoomState = store.getState().room.state
}
