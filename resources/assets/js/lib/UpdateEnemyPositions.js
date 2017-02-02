import GameConsts from 'lib/GameConsts'

export default function () {
  const state = this.game.store.getState()

  if (
    !state.room.id ||
    state.room.state !== 'active' ||
    !window.RS.enemies
  ) return

  window.RS.enemies.forEach((enemy) => {
    const targetPosition = enemy.data.targetPosition

    if (
      !targetPosition ||
      targetPosition.millisRemaining < 0
    ) return

    const weight = 1 - targetPosition.millisRemaining / GameConsts.TICK_RATE // between 0.0 and 1.0

    enemy.x = this.game.math.linear(enemy.x || 0, targetPosition.x, weight)
    enemy.y = this.game.math.linear(enemy.y || 0, targetPosition.y, weight)

    targetPosition.millisRemaining = Math.max(targetPosition.millisRemaining - this.game.time.elapsed, 0)
  })
}
