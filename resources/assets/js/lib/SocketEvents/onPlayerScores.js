import actions from 'actions'

export default function (data) {
  const store = this.game.store

  if (!data.players) return
  const room = store.getState().room

  Object.keys(data.players).forEach(playerId => {
    if (!data.players[playerId]) return

    room.players[playerId] = {
      ...room.players[playerId],
      ...data.players[playerId]
    }
  })

  room.blueTeamScore = data.blueTeamScore
  room.redTeamScore = data.redTeamScore
  room.roundStartTime = data.roundStartTime

  store.dispatch(actions.room.setRoom(room))
}
