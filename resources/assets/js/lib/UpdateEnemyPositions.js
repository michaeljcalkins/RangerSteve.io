import storage from 'store'

const interpolationBackTimeMs = storage.get('interpolationMs', 100)

export default function () {
  const state = this.game.store.getState()

  if (
    !state.room.id ||
    state.room.state !== 'active' ||
    !window.RS.enemies
  ) return

  const currentTime = Date.now() + window.socket.offset
  const interpolationTime = currentTime - interpolationBackTimeMs

  window.RS.enemies.forEach((enemy) => {
    if (!enemy.data.positionBuffer || !enemy.data.positionBuffer.length) {
      return
    }

    const positionBuffer = JSON.parse(JSON.stringify(enemy.data.positionBuffer))

    if (positionBuffer[0].time > interpolationTime) {
      let i = 0
      const positionBufferLength = positionBuffer.length
      for (; i < positionBufferLength; i++) {
        // find the closest state that matches network time, or use oldest state
        if (positionBuffer[i].time <= interpolationTime || i === positionBufferLength - 1) {
          // the state closest to network time
          const closestState = positionBuffer[i]
          // the state one slot newer
          const nextClosestState = positionBuffer[Math.max(i - 1, 0)]
          // use time between closestState and nextClosestState to interpolate
          const length = nextClosestState.time - closestState.time

          let t = 0
          if (length > 0.0001) {
            t = Math.max((interpolationTime - closestState.time) / length, 0)
          }

          enemy.x = this.game.math.linear(closestState.x, nextClosestState.x, t)
          enemy.y = this.game.math.linear(closestState.y, nextClosestState.y, t)

          break
        }
      }
    }
  })
}
