import createRemotePlayer from './createRemotePlayer'
import updatePlayerColor from './updatePlayerColor'
import PlayerById from'./PlayerById'

const usernameTextStyle = {
    align: "center",
    fill: "#fff",
    font: "10px Arial",
    stroke: "black",
    strokeThickness: 2,
}

export default function createNewPlayersThatDontExist(room, playerId, playerData) {
    const playerCheck = PlayerById.call(this, playerId)

    if (playerCheck) return

    const newcreateRemotePlayer = createRemotePlayer.call(this, playerId, playerData)
    const enemyPlayerName = playerData.nickname
        ? playerData.nickname
        : 'Unnamed Ranger'

    const text = this.game.add.text(0, -50, enemyPlayerName, usernameTextStyle)
    newcreateRemotePlayer.addChild(text)
    text.x = (text.width / 2) * -1
    text.smoothed = true

    if (playerData.health <= 0) {
        newcreateRemotePlayer.visible = false
    }

    RS.enemies.add(newcreateRemotePlayer)
    const player = PlayerById.call(this, playerId)
    this.game.world.bringToTop(RS.enemies)
    if (playerData.team) updatePlayerColor(player, playerData.team)
}
