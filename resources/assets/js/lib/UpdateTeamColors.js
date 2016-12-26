import get from 'lodash/get'
import has from 'lodash/has'

const blue = 0x2578FF
const red = 0xFF2525

export default function() {
    const state = this.game.store.getState()

    if (has(state, `room.players[${window.SOCKET_ID}]`)) {
        switch (get(state, `room.players[${window.SOCKET_ID}].team`)) {
            case 'red':
                RS.player.playerSprite.tint = red
                RS.player.leftArmSprite.tint = red
                RS.player.rightArmSprite.tint = red
                break

            case 'blue':
                RS.player.playerSprite.tint = blue
                RS.player.leftArmSprite.tint = blue
                RS.player.rightArmSprite.tint = blue
                break
        }
    }

    RS.enemies.forEach(enemy => {
        if (has(state, `room.players[${enemy.id}]`)) {
            switch (get(state, `room.players[${enemy.id}].team`)) {
                case 'red':
                    enemy.playerSprite.tint = red
                    enemy.leftArmSprite.tint = red
                    enemy.rightArmSprite.tint = red
                    break

                case 'blue':
                    enemy.playerSprite.tint = blue
                    enemy.leftArmSprite.tint = blue
                    enemy.rightArmSprite.tint = blue
                    break
            }
        }
    })
}
