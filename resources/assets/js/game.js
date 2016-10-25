import Boot from './states/Boot'
import Preloader from './states/Preloader'
import Deathmatch from './states/Deathmatch'

export default function(store) {
    const game = new Phaser.Game('100%', '100%', Phaser.AUTO)
    game.store = store

    window.RangerSteve = {
        Boot,
        Preloader,
        Deathmatch
    }

    game.state.add('Boot', RangerSteve.Boot)
    game.state.add('Preloader', RangerSteve.Preloader)
    game.state.add('Deathmatch', RangerSteve.Deathmatch)

    game.state.start('Boot')
}
