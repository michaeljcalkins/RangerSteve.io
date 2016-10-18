// import Preload from './game/Preload'
// import Update from './game/Update'
// import Create from './game/Create'
// import Render from './game/Render'
// import setEventHandlers from './lib/SocketEvents/setEventHandlers'

import LoadingState from './states/LoadingState'
import DeathmatchState from './states/DeathmatchState'
import EndedState from './states/EndedState'

export default function(store) {
    const game = new Phaser.Game('100%', '100%', Phaser.AUTO)
    game.store = store

    game.state.add('LoadingState', LoadingState)
    game.state.add('DeathmatchState', DeathmatchState)
    game.state.add('EndedState', EndedState)

    game.state.start('LoadingState')
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
