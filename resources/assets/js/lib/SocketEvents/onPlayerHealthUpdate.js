import actions from 'actions'

export default function onPlayerHealthUpdate(data) {
  const store = this.game.store
  store.dispatch(actions.player.setHealth(data))
}
