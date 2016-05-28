import PlayerAndPlatforms from './Collisions/PlayerAndPlatforms'
import PlayerAndGround from './Collisions/PlayerAndGround'
import PlayerAndEnemyBullets from './Collisions/PlayerAndEnemyBullets'
import BulletsAndEnemyPlayers from './Collisions/BulletsAndEnemyPlayers'
import BulletsAndPlatforms from './Collisions/BulletsAndPlatforms'
import EnemyBulletsAndPlatforms from './Collisions/EnemyBulletsAndPlatforms'
import FullBlastRadiusAndEnemyPlayers from './FullBlastRadiusAndEnemyPlayers'
import FullBlastRadiusAndPlayer from './FullBlastRadiusAndPlayer'
import PartialBlastRadiusAndEnemyPlayers from './PartialBlastRadiusAndEnemyPlayers'
import PartialBlastRadiusAndPlayer from './PartialBlastRadiusAndPlayer'

export default function CollisionHandler() {
    PlayerAndPlatforms.call(this)
    PlayerAndGround.call(this)
    PlayerAndEnemyBullets.call(this)
    BulletsAndEnemyPlayers.call(this)
    EnemyBulletsAndPlatforms.call(this)
    BulletsAndPlatforms.call(this)
    FullBlastRadiusAndEnemyPlayers.call(this)
    FullBlastRadiusAndPlayer.call(this)
    PartialBlastRadiusAndEnemyPlayers.call(this)
    PartialBlastRadiusAndPlayer.call(this)
}
