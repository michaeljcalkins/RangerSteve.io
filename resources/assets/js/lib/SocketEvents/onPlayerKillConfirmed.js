import actions from '../../actions'
import PlayKillingSpreeSound from '../PlayKillingSpreeSound'

let killConfirmedHandle = null
let lastKillingSpreeCount = 0

export default function onPlayerKillConfirmed(data) {
    const store = this.game.store

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
        RS.headshotSound.volume = store.getState().game.sfxVolume
        RS.headshotSound.play()
    }
}
