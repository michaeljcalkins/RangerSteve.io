import { PropTypes } from 'react'
import actions from '../../actions'

const propTypes = {
    id: PropTypes.string.isRequired,
    score: PropTypes.number.isRequired
}

let killConfirmedHandle = null

export default function onPlayerKillConfirmed(data) {
    check(data, propTypes)

    if (data.id !== ('/#' + this.socket.id))
        return

    this.game.store.dispatch(actions.player.setShowKillConfirmed(true))
    clearTimeout(killConfirmedHandle)
    killConfirmedHandle = setTimeout(() => {
        this.game.store.dispatch(actions.player.setShowKillConfirmed(false))
    }, 3000)

    let lastKillingSpreeCount = 0
    if (data.killingSpree === lastKillingSpreeCount) return
    lastKillingSpreeCount = data.killingSpree
    this.game.store.dispatch(actions.player.setKillingSpreeCount(data.killingSpree))
    setTimeout(() => {
        this.game.store.dispatch(actions.player.setKillingSpreeCount(0))
    }, 3000)
}
