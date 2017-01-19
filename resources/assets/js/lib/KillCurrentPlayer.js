import emitPlayerDamaged from './SocketEvents/emitPlayerDamaged'
import actions from '../actions'

export default function () {
  const store = this.game.store

  this.game.input.enabled = false
  this.game.input.reset()
  window.RS.player.body.acceleration.x = 0
  window.RS.player.body.acceleration.y = 0
  window.RS.player.body.velocity.x = 0
  window.RS.player.body.velocity.y = 0
  store.dispatch(actions.player.setHealth(0))

  window.RS.player.visible = false

  emitPlayerDamaged.call(this, {
    damage: 100,
    damagedPlayerId: window.SOCKET_ID,
    attackingPlayerId: null
  })
}
