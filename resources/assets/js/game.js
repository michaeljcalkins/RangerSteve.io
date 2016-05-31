import init from './game/Init'
import preload from './game/Preload'
import update from './game/Update'
import create from './game/Create'
import GameConsts from './lib/GameConsts'

export default function() {
    const gameWidth = window.innerWidth
    const gameHeight = window.innerHeight
    let game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, 'ranger-steve-game')

    game.state.add('Game', function() {
        this.game = game
        this.init = init
        this.preload = preload
        this.create = create
        this.update = update
        this.render = () => {
            if (GameConsts.DEBUG) {
                this.game.debug.inputInfo(60, 60)
            }
        }
    }, true)
}
