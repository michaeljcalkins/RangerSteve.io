import actions from 'actions'

export default function onMessageReceived (data) {
  this.game.store.dispatch(actions.game.addChatMessage(data))
}
