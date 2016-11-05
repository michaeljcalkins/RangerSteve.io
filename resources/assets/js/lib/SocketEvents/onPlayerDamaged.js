import { PropTypes } from 'react'

import actions from '../../actions'
import PlayPlayerDeathAnimation from '../PlayPlayerDeathAnimation'

const propTypes = {
    damagedPlayerId: PropTypes.string.isRequired,
    health: PropTypes.number.isRequired,
    damageStats: PropTypes.object.isRequired,
    attackingDamageStats: PropTypes.object.isRequired,
    canRespawnTimestamp: PropTypes.number,
}

let damageTimeout = null
let healingInterval = null
let lastKnownHealth = null

export default function onPlayerDamaged(data) {
    // When an enemy is killed play the death animation where they were.
    if (data.damagedPlayerId !== window.SOCKET_ID) {
        PlayPlayerDeathAnimation.call(this, {
            x: data.playerX,
            y: data.playerY,
        })
        return
    }

    const store = this.game.store

    clearTimeout(damageTimeout)
    clearInterval(healingInterval)

    store.dispatch(actions.player.setHealth(data.health))
    store.dispatch(actions.player.setDamageStats(data.damageStats))
    store.dispatch(actions.player.setAttackingDamageStats(data.attackingDamageStats))

    if (data.health <= 0) {
        const newRespawnTime = data.canRespawnTimestamp * 1000
        store.dispatch(actions.player.setRespawnTime(newRespawnTime))
    }

    if (store.getState().player.health > 55 && store.getState().player.health < 100) {
        clearTimeout(damageTimeout)
        damageTimeout = setTimeout(() => {
            // Player's health will fully regenerate
            window.socket.emit('player full health', {
                roomId: store.getState().room.id,
            })
        }, 5000)
    }

    // Wait 5 seconds to begin healing process
    if (store.getState().player.health > 0 && store.getState().player.health <= 55) {
        clearTimeout(damageTimeout)
        clearInterval(healingInterval)
        damageTimeout = setTimeout(() => {
            lastKnownHealth = store.getState().player.health
            healingInterval = setInterval(() => {
                if (lastKnownHealth >= 100) {
                    clearInterval(healingInterval)
                }

                lastKnownHealth += 10

                // Increase player health by 10 every 1/2 a second
                window.socket.emit('player healing', {
                    roomId: store.getState().room.id,
                })
            }, 500)
        }, 5000)
    }

    // Player has died
    if (store.getState().player.health <= 0) {
        RS.player.visible = false
        PlayPlayerDeathAnimation.call(this, {
            x: RS.player.x,
            y: RS.player.y,
        })
    }
}
