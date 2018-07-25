import BulletsAndEnemyPlayers from '../Collisions/BulletsAndEnemyPlayers'
import PlayerAndEnemyBullets from '../Collisions/PlayerAndEnemyBullets'

export function update () {
  BulletsAndEnemyPlayers.call(this)
  PlayerAndEnemyBullets.call(this)
}
