import createRemotePlayer from '../createRemotePlayer'

export default function (data) {
  if (data.id === window.SOCKET_ID) return

  const store = this.game.store
  const room = store.getState().room

  room.players[data.id] = data
  const newCreateRemotePlayer = createRemotePlayer.call(this, data.id, data)

  window.RS.enemies.add(newCreateRemotePlayer)
  this.game.world.bringToTop(window.RS.enemies)
}
