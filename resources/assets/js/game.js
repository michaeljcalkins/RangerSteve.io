import Boot from './states/Boot'
import Preloader from './states/Preloader'
import Deathmatch from './states/Deathmatch'
import EndOfRound from './states/EndOfRound'

export default function(store) {
    const game = new Phaser.Game('100%', '100%', Phaser.AUTO)
    game.store = store

    game.state.add('Boot', Boot)
    game.state.add('Preloader', Preloader)
    game.state.add('Deathmatch', Deathmatch)
    game.state.add('EndOfRound', EndOfRound)

    game.state.start('Boot')
}
