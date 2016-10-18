// init
// preload
// loadUpdate
// loadRender
// create
// update
// preRender
// render
// resize
// paused
// resumed
// pauseUpdate
// shutdown

/**
 * Load map assets and start gamemode.
 */

function AssetLoader(game) {
    console.log('AssetLoader')
    this.game = game
}

AssetLoader.prototype = {

    preload: function() {
        // Maps[store.getState().room.map].preload.call(this)
        // this.currentMap = store.getState().room.map

        // this.game.load.onLoadComplete.add(() => {
        //     CreateHandler.call(this)

        //     window.socket.emit('load complete', {
        //         roomId: store.getState().room.id
        //     })
        // }, this)

        // this.game.load.start()
    },

    create: function() {

    }

}

export default AssetLoader