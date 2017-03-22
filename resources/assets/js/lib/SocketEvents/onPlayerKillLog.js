import actions from 'actions'
import PlayKillingSpreeSound from '../PlayKillingSpreeSound'

let killConfirmedHandle = null
let lastKillingSpreeCount = 0

export default function onPlayerKillLog (data) {
  const store = this.game.store

  /**
   * Kill log
   */
  store.dispatch(actions.game.addKillLogMessage(data))
  setTimeout(() => {
    store.dispatch(actions.game.removeKillLogMessage(data))
  }, 10000)

  /**
   * Kill confirmed
   */
  if (data.id === window.SOCKET_ID) {
    store.dispatch(actions.game.setShowKillConfirmed(true))
    clearTimeout(killConfirmedHandle)
    killConfirmedHandle = setTimeout(() => {
      store.dispatch(actions.game.setShowKillConfirmed(false))
    }, 3000)

    // Show the killing spree hud if applicable
    store.dispatch(actions.player.setKillingSpreeCount(data.killingSpree))
    if (data.killingSpree !== lastKillingSpreeCount) {
      lastKillingSpreeCount = data.killingSpree
      PlayKillingSpreeSound.call(this, data.killingSpree, store.getState().game.sfxVolume)
    }

    // This will hide the killing spree hud
    setTimeout(() => {
      store.dispatch(actions.player.setKillingSpreeCount(0))
    }, 3000)

    // Play headshot soundeffect
    if (data.wasHeadshot) {
      window.RS.headshotSound.volume = store.getState().game.sfxVolume
      window.RS.headshotSound.play()
    }
  }

  /**
   * Update player scores
   */
  if (!data.players) return
  const room = store.getState().room

  Object.keys(data.players).forEach(playerId => {
    if (!data.players[playerId]) return

    room.players[playerId] = {
      ...room.players[playerId],
      ...data.players[playerId]
    }
  })

  room.blueTeamScore = data.blueTeamScore
  room.redTeamScore = data.redTeamScore
  room.highscore = data.highscore

  store.dispatch(actions.room.setRoom(room))
}
