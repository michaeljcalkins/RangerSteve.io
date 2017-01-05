import GameConsts from 'lib/GameConsts'

export default function RemainingFuelPercent(counter) {
  const maxFuel = GameConsts.JUMP_JET_STARTING_FUEL * -1
  let percent = 100

  if (counter < 0) {
    percent = 100 - ((counter * -1) / maxFuel * 100).toFixed(0)
    percent = percent < 0 ? 0 : percent
  }

  return percent
}
