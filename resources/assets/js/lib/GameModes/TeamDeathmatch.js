import BulletsAndEnemyTeamPlayers from '../Collisions/BulletsAndEnemyTeamPlayers'
import PlayerAndEnemyTeamBullets from '../Collisions/PlayerAndEnemyTeamBullets'

export function update () {
  PlayerAndEnemyTeamBullets.call(this)
  BulletsAndEnemyTeamPlayers.call(this)
}
