import PlayerAndPlatforms from './Collisions/PlayerAndPlatforms'
import PlayerAndGround from './Collisions/PlayerAndGround'
import PlayerAndEnemyBullets from './Collisions/PlayerAndEnemyBullets'
import BulletsAndEnemyPlayers from './Collisions/BulletsAndEnemyPlayers'
import BulletsAndPlatforms from './Collisions/BulletsAndPlatforms'
import EnemyBulletsAndPlatforms from './Collisions/EnemyBulletsAndPlatforms'

export default function CollisionHandler() {
    PlayerAndPlatforms.call(this)
    PlayerAndGround.call(this)
    PlayerAndEnemyBullets.call(this)
    BulletsAndEnemyPlayers.call(this)
    EnemyBulletsAndPlatforms.call(this)
    BulletsAndPlatforms.call(this)
}
