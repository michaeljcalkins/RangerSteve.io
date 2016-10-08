import emitPlayerDamaged from './SocketEvents/emitPlayerDamaged'
import actions from '../actions'
import PlayPlayerDeathAnimation from './PlayPlayerDeathAnimation'

export default function() {
    const store = this.game.store

    // this.game.input.enabled = false
    this.player.body.acceleration.x = 0
    this.player.body.acceleration.y = 0
    store.dispatch(actions.player.setHealth(0))

    this.player.visible = false

    emitPlayerDamaged.call(this, {
        roomId: store.getState().room.id,
        damage: 100,
        damagedPlayerId: window.SOCKET_ID,
        attackingPlayerId: null
    })

    PlayPlayerDeathAnimation.call(this, {
        x: this.player.x,
        y: this.player.y
    })
}