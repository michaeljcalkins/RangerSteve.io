import includes from 'lodash/includes'
import find from 'lodash/find'

import actions from 'actions'
import PlayerById from'../PlayerById'
import GameConsts from 'lib/GameConsts'
import updatePlayerAngles from '../updatePlayerAngles'
import RemotePlayer from '../RemotePlayer'

function isNotMoving(player) {
    return player.x === player.lastPosition.x && player.y === player.lastPosition.y
}

export default function onRefreshRoom(data) {
    const store = this.game.store

    const newRoomState = {
        ...store.room,
        state: data.state,
        players: data.players,
    }

    store.dispatch(actions.room.setRoom(newRoomState))

    if (
        includes(['Boot', 'Preloader'], this.game.state.current) ||
        ! RS.enemies
    ) return

    // Players should only be allowed to move when the room state is active
    this.game.paused = data.state !== 'active'

    // 1. Check for players that do not exist anymore
    if (RS.enemies) {
        RS.enemies.forEach((player, index) => {
            const enemy = find(data.players, { id: player.id })
            if (enemy) return RS.enemies.removeChildAt(index)
            player.destroy(true)
        })
    }

    data.players.forEach((playerData) => {
        if (playerData.id === window.SOCKET_ID) return

        let player = PlayerById.call(this, playerData.id)

        // 2. if player is not found create them and continue
        if (! player) {
            let newRemotePlayer = RemotePlayer.call(this, playerData)
            let enemyPlayerName = playerData.nickname
                ? playerData.nickname
                : 'Unnamed Ranger'

            const style = {
                font: "10px Arial",
                fill: "#fff",
                align: "center",
                stroke: "black",
                strokeThickness: 2,
            }
            const text = this.game.add.text(0, -50, enemyPlayerName, style)
            newRemotePlayer.addChild(text)
            text.x = (text.width / 2) * -1
            text.smoothed = true

            if (playerData.health <= 0) {
                newRemotePlayer.visible = false
            }

            RS.enemies.add(newRemotePlayer)
            player = PlayerById.call(this, playerData.id)
            player.data = {}
            this.game.world.bringToTop(RS.enemies)
        }

        // if (! player || (store.getState().room !== null && store.getState().room.state === 'ended')) return
        player.data.health = playerData.health
        player.data.weaponId = playerData.weaponId
        player.data.team = playerData.team

        // 3. update the player
        if (playerData.health <= 0) {
            player.visible = false
            return
        }

        // Update player position
        this.game.add.tween(player).to({
            x: playerData.x,
            y: playerData.y,
        }, GameConsts.TICK_RATE, Phaser.Easing.Linear.None, true)

        // Control jump jet visibility
        player.rightJumpjet.visible = playerData.flying
        player.leftJumpjet.visible = playerData.flying

        // Control muzzle flash visibility
        if (GameConsts.WEAPONS[playerData.weaponId]) {
            if (playerData.shooting) {
                player.rightArmSprite.animations.frame = GameConsts.WEAPONS[playerData.weaponId].shootingFrame
            } else {
                player.rightArmSprite.animations.frame = GameConsts.WEAPONS[playerData.weaponId].frame
            }
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
        player.visible = playerData.health > 0
    })
}
