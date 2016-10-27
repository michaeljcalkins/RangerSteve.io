import Boot from './states/Boot'
import Preloader from './states/Preloader'
import Deathmatch from './states/Deathmatch'

export default function(store) {
    const game = new Phaser.Game('100%', '100%', Phaser.AUTO, 'game')
    game.store = store

    window.RS = {
        Boot,
        Preloader,
        Deathmatch
    }

    game.state.add('Boot', RS.Boot)
    game.state.add('Preloader', RS.Preloader)
    game.state.add('Deathmatch', RS.Deathmatch)

    game.state.start('Boot')
}
