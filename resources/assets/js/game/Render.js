import GameConsts from '../lib/GameConsts'

export default function Render() {
    if (GameConsts.DEBUG) {
        this.game.debug.inputInfo(60, 60)
    }
}
