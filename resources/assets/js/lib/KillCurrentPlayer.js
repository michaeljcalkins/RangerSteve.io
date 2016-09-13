import emitPlayerDamaged from './SocketEvents/emitPlayerDamaged'
import actions from '../actions'

export default function() {
    const store = this.game.store

    // this.game.input.enabled = false
    this.player.body.acceleration.x = 0
    this.player.body.acceleration.y = 0
    store.dispatch(actions.player.setHealth(0))

    this.leftArmGroup.visible = false
    this.rightArmGroup.visible = false
    this.headGroup.visible = false
    this.torsoGroup.visible = false

    emitPlayerDamaged.call(this, {
        roomId: store.getState().room.id,
        damage: 100,
        damagedPlayerId: '/#' + window.socket.id,
        attackingPlayerId: null
    })

    this.player.animations.play('death')
}