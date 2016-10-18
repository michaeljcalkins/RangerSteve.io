// import Preload from './game/Preload'
// import Update from './game/Update'
// import Create from './game/Create'
// import Render from './game/Render'
// import setEventHandlers from './lib/SocketEvents/setEventHandlers'

import Boot from './states/Boot'
import Preloader from './states/Preloader'
import AssetLoader from './states/AssetLoader'
import Deathmatch from './states/Deathmatch'
import EndOfRound from './states/EndOfRound'

export default function(store) {
    const game = new Phaser.Game('100%', '100%', Phaser.AUTO)
    game.store = store

    game.state.add('Boot', Boot)
    game.state.add('Preloader', Preloader)
    game.state.add('AssetLoader', AssetLoader)
    game.state.add('Deathmatch', Deathmatch)
    game.state.add('EndOfRound', EndOfRound)

    game.state.start('Boot')
}

// const game = new Phaser.Game('100%', '100%', Phaser.AUTO, 'ranger-steve-game', function() {
//     this.game = game
//     this.game.store = store
//     this.preload = Preload
//     this.create = Create
//     this.update = Update
//     this.render = Render

//     setEventHandlers.call(this)
// })
