import { PropTypes } from 'react'
import actions from '../../actions'
import PlayKillingSpreeSound from '../PlayKillingSpreeSound'
import PlayerById from '../PlayerById'
import PlayPlayerDeathAnimation from '../PlayPlayerDeathAnimation'

const propTypes = {
    id: PropTypes.string.isRequired,
    damagedPlayerId: PropTypes.string.isRequired,
    killingSpree: PropTypes.number.isRequired
}

let killConfirmedHandle = null
let lastKillingSpreeCount = 0

export default function onPlayerKillConfirmed(data) {
    const store = this.game.store

    if (data.id !== window.SOCKET_ID) return

    store.dispatch(actions.player.setShowKillConfirmed(true))
    clearTimeout(killConfirmedHandle)
    killConfirmedHandle = setTimeout(() => {
        store.dispatch(actions.player.setShowKillConfirmed(false))
    }, 3000)

    // Show the killing spree hud if applicable
    store.dispatch(actions.player.setKillingSpreeCount(data.killingSpree))
    if (data.killingSpree === lastKillingSpreeCount) return
    lastKillingSpreeCount = data.killingSpree
    PlayKillingSpreeSound.call(this, data.killingSpree, store.getState().game.sfxVolume)

    // This will hide the killing spree hud
    setTimeout(() => {
        store.dispatch(actions.player.setKillingSpreeCount(0))
    }, 3000)

    // Play headshot soundeffect
    if (data.wasHeadshot) {
        this.headshotSound.volume = store.getState().game.sfxVolume
        this.headshotSound.play()
    }

    // Play enemy death animation
    const movePlayer = PlayerById.call(this, data.damagedPlayerId)
    if (movePlayer && movePlayer.meta.health) {
        movePlayer.visible = false
        PlayPlayerDeathAnimation.call(this, {
            x: movePlayer.x,
            y: movePlayer.y
        })
    }
}
