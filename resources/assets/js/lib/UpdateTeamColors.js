const blue = 0x2578FF
const red = 0xFF2525

export default function() {
    const state = this.game.store.getState()

    if (state.room.players[window.SOCKET_ID]) {
        switch (state.room.players[window.SOCKET_ID].meta.team) {
            case 'red':
                RS.playerSprite.tint = red
                RS.leftArmSprite.tint = red
                RS.rightArmSprite.tint = red
                break

            case 'blue':
                RS.playerSprite.tint = blue
                RS.leftArmSprite.tint = blue
                RS.rightArmSprite.tint = blue
                break
        }
    }

    RS.enemies.forEach(enemy => {
        if (state.room.players[enemy.id]) {
            switch (state.room.players[enemy.id].meta.team) {
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
