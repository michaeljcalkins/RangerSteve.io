import includes from 'lodash/includes'

import actions from 'actions'
import PlayerById from'../PlayerById'
import GameConsts from 'lib/GameConsts'
import updatePlayerAngles from '../updatePlayerAngles'

function isNotMoving(player) {
    return player.x === player.lastPosition.x && player.y === player.lastPosition.y
}

export default function onRefreshRoom(data) {
    const store = this.game.store
    store.dispatch(actions.room.setRoom(data))

    if (includes(['Boot', 'Preloader'], this.game.state.current)) return

    // 1. check for players that do not exist anymore

    Object.keys(data.players).forEach((playerId) => {
        const playerData = data.players[playerId]
        let player = PlayerById.call(this, playerId)

        // 2. if player is not found create them and continue

        if (! player || (store.getState().room !== null && store.getState().room.state === 'ended')) return

        // 3. update the player

        if (player.meta.health <= 0) {
            player.visible = false
            return
        }

        // Update player position
        player.x = playerData.x
        player.y = playerData.y
        player.visible = true

        // Control jump jet visibility
        player.rightJumpjet.visible = playerData.flying
        player.leftJumpjet.visible = playerData.flying

        player.meta.weaponId = playerData.weaponId

        // Control muzzle flash visibility
        if (playerData.shooting) {
            player.rightArmSprite.animations.frame = GameConsts.WEAPONS[player.meta.weaponId].shootingFrame
        } else {
            player.rightArmSprite.animations.frame = GameConsts.WEAPONS[player.meta.weaponId].frame
        }

        updatePlayerAngles.call(this, player, playerData.angle)

        if (
            (playerData.flying && player.facing === 'right') ||
            (isNotMoving(player) && player.facing === 'right')
        ) {
            // Standing still or flying and facing right
            player.playerSprite.animations.stop()
            player.playerSprite.frame = GameConsts.STANDING_RIGHT_FRAME
        } else if (
            (playerData.flying && player.facing === 'left') ||
            (isNotMoving(player) && player.facing === 'left')
        ) {
            // Standing still or flying and facing left
            player.playerSprite.animations.stop()
            player.playerSprite.frame = GameConsts.STANDING_LEFT_FRAME
        } else if (
            player.x > player.lastPosition.x &&
            player.facing === 'right' &&
            ! playerData.flying
        ) {
            player.playerSprite.animations.play('runRight-faceRight')
        }
        else if (
            player.x < player.lastPosition.x &&
            player.facing === 'left' &&
            ! playerData.flying
        ) {
            player.playerSprite.animations.play('runLeft-faceLeft')
        } else if (
            player.x < player.lastPosition.x &&
            player.facing === 'right' &&
            ! playerData.flying
        ) {
            player.playerSprite.animations.play('runLeft-faceRight')
        } else if (
            player.x > player.lastPosition.x &&
            player.facing === 'left' &&
            ! playerData.flying
        ) {
            player.playerSprite.animations.play('runRight-faceLeft')
        }

        player.lastPosition.x = player.x
        player.lastPosition.y = player.y
    })
}
