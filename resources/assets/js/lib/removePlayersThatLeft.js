import get from 'lodash/get'

export default function removePlayersThatLeft (data) {
  if (!window.RS.enemies) return

  const store = this.game.store
  const room = store.getState().room

  window.RS.enemies.forEach((enemy) => {
    const playerId = get(enemy, 'data.id', false)

    if (!playerId) {
      enemy.destroy(true)
      return
    }

    if (data.players[playerId]) return

    delete room.players[playerId]

    enemy.destroy(true)
  })
}
