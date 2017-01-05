import actions from 'actions'

export default function onBulletFired(data) {
  this.game.store.dispatch(actions.game.addChatMessage(data))
}
