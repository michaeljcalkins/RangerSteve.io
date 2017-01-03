import get from 'lodash/get'

import actions from 'actions'

export default function removePlayersThatLeft(data) {
  if (!RS.enemies) return

  const store = this.game.store
  const room = this.game.store.getState().room

  RS.enemies.forEach((player, index) => {
    const playerId = get(player, 'data.id', false)

    // Does this enemy still exist in the data sent from the server
    const enemy = data.players[playerId]

    // Enemy not found so remove them from game
    if (! enemy && playerId) {
      RS.enemies.removeChildAt(index)
      player.destroy(true)

      delete room.players[playerId]
      store.dispatch(actions.room.setRoom(room))
    }
  })
}
