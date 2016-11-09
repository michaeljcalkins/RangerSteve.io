import Boot from './states/Boot'
import Preloader from './states/Preloader'
import Deathmatch from './states/Deathmatch'
import TeamDeathmatch from './states/TeamDeathmatch'

// Modify the tilemap collision function to handle larger tilemaps
// http://www.thebotanistgame.com/blog/2015/07/24/optimizing-giant-maps-lots-of-collisions.html
require('lib/OverrideTilemapCollision')

export default function(store) {
    const game = new Phaser.Game('100%', '100%', Phaser.AUTO, 'game')
    game.store = store

    window.RS = {
        Boot,
        Preloader,
        Deathmatch,
        TeamDeathmatch,
    }

    game.state.add('Boot', RS.Boot)
    game.state.add('Preloader', RS.Preloader)
    game.state.add('Deathmatch', RS.Deathmatch)
    game.state.add('TeamDeathmatch', RS.TeamDeathmatch)

    game.state.start('Boot')
}
