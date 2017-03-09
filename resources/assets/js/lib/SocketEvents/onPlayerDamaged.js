import actions from 'actions'
import GameConsts from 'lib/GameConsts'
import Client from '../Client'
import PlayPlayerDeathAnimation from '../PlayPlayerDeathAnimation'
import PlayerById from '../PlayerById'

let damageTimeout = null
let healingInterval = null
let lastKnownHealth = null

export default function onPlayerDamaged (data) {
  // When an enemy is killed play the death animation where they were.
  if (data.damagedPlayerId !== window.SOCKET_ID && data.health <= 0) {
    const damagedPlayer = PlayerById.call(this, data.damagedPlayerId)

    // In cases where the local user hasn't loaded all players yet
    if (!damagedPlayer) return

    damagedPlayer.visible = false
    damagedPlayer.alive = false

    PlayPlayerDeathAnimation.call(this, {
      x: damagedPlayer.x,
      y: damagedPlayer.y
    })
    return
  }

  // If player damaged was not you do not you and you're not dead don't do anything.
  if (data.damagedPlayerId !== window.SOCKET_ID) return

  const store = this.game.store

  clearTimeout(damageTimeout)
  clearInterval(healingInterval)

  store.dispatch(actions.player.setHealth(data.health))
  store.dispatch(actions.player.setDamageStats(data.damageStats))
  store.dispatch(actions.player.setAttackingDamageStats(data.attackingDamageStats))

  if (data.health <= 0) {
    const newRespawnTime = data.canRespawnTime
    store.dispatch(actions.player.setRespawnTime(newRespawnTime))
  }

  if (store.getState().player.health > 55 && store.getState().player.health < 100) {
    clearTimeout(damageTimeout)
    damageTimeout = setTimeout(() => {
      // Player's health will fully regenerate
      Client.send(GameConsts.EVENT.PLAYER_FULL_HEALTH)
    }, 5000)
  }

  // Wait 5 seconds to begin healing process
  if (store.getState().player.health > 0 && store.getState().player.health <= 55) {
    clearTimeout(damageTimeout)
    clearInterval(healingInterval)
    damageTimeout = setTimeout(() => {
      lastKnownHealth = store.getState().player.health
      healingInterval = setInterval(() => {
        if (lastKnownHealth >= 100) clearInterval(healingInterval)

        lastKnownHealth += 10

        // Increase player health by 10 every 1/2 a second
        Client.send(GameConsts.EVENT.PLAYER_HEALING)
      }, 500)
    }, 5000)
  }

    // Player has died
  if (store.getState().player.health <= 0) {
    window.RS.player.visible = false
    window.RS.player.alive = false
    PlayPlayerDeathAnimation.call(this, {
      x: window.RS.player.x,
      y: window.RS.player.y
    })
  }
}
