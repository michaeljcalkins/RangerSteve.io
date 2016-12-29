import find from 'lodash/find'

import PlayBloodSpray from '../PlayBloodSpray'
import PlayRocketExplosion from '../PlayRocketExplosion'

export default function() {
    const state = this.game.store.getState()

    // Did enemy bullets hit you
    this.game.physics.arcade.overlap(RS.player, RS.enemyBullets, (player, bullet) => {
        const enemy = state.room.players[bullet.data.playerId]

        if (
            ! bullet.weaponId ||
            ! window.SOCKET_ID ||
            state.player.health <= 0 ||
            enemy.team === RS.player.team
        ) return

        bullet.kill()

        PlayBloodSpray.call(this, {
            bulletY: bullet.y,
            bulletX: bullet.x,
            playerX: player.x,
            bulletRotation: bullet.rotation,
        })

        if (bullet.weaponId === 'RPG') {
            PlayRocketExplosion.call(this, {
                bulletY: bullet.y,
                bulletX: bullet.x,
            })
        }
    }, null, this)
}
