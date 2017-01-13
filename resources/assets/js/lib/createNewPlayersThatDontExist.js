import createRemotePlayer from './createRemotePlayer'
import PlayerById from './PlayerById'

const usernameTextStyle = {
  align: 'center',
  fill: '#fff',
  font: '10px Arial',
  stroke: 'black',
  strokeThickness: 2,
}

export default function createNewPlayersThatDontExist(room, playerId, playerData) {
  const newCreateRemotePlayer = createRemotePlayer.call(this, playerId, playerData)
  const enemyPlayerName = playerData.nickname
    ? playerData.nickname
    : 'Unnamed Ranger'

  newCreateRemotePlayer.usernameText = this.game.add.text(0, -50, enemyPlayerName, usernameTextStyle)
  newCreateRemotePlayer.addChild(newCreateRemotePlayer.usernameText)
  newCreateRemotePlayer.usernameText.x = (newCreateRemotePlayer.usernameText.width / 2) * -1
  newCreateRemotePlayer.usernameText.smoothed = true

  if (playerData.health <= 0) {
    newCreateRemotePlayer.visible = false
  }

  RS.enemies.add(newCreateRemotePlayer)
  const player = PlayerById.call(this, playerId)
  this.game.world.bringToTop(RS.enemies)

  return player
}
