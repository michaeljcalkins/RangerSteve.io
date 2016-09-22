import { PropTypes } from 'react'
import actions from '../../actions'
import PlayKillingSpreeSound from '../PlayKillingSpreeSound'
import PlayerById from '../PlayerById'
import GameConsts from '../GameConsts'

const propTypes = {
    id: PropTypes.string.isRequired,
    damagedPlayerId: PropTypes.string.isRequired,
    killingSpree: PropTypes.number.isRequired
}

let killConfirmedHandle = null
let lastKillingSpreeCount = 0
let deathAnimations = {}

export default function onPlayerKillConfirmed(data) {
    check(data, propTypes)

    const store = this.game.store
    if (store.getState().game.state !== 'active') return
    if (data.id !== ('/#' + window.socket.id)) return

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

    // Play enemy death animation
    const movePlayer = PlayerById.call(this, data.damagedPlayerId)
    if (movePlayer && movePlayer.meta.health && ! deathAnimations[movePlayer.id]) {
        movePlayer.alpha = 0
        let ricochet = this.add.sprite(movePlayer.x, movePlayer.y, 'player')
        ricochet.anchor.setTo(GameConsts.PLAYER_ANCHOR)
        ricochet.height = 91
        ricochet.width = 94
        ricochet.animations.add('collision', GameConsts.ANIMATION_DEATH, 20, false, true)
        ricochet.animations.play('collision')
        setTimeout(() => {
            ricochet.kill()
        }, 5000)
    }
}
