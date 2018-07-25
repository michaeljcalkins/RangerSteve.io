import Maps from '../../lib/Maps'
import createLocalPlayer from '../createLocalPlayer'

export default function () {
  const state = this.game.store.getState()
  Maps[state.room.map].create.call(this)
  createLocalPlayer.call(this)
  Maps[state.room.map].createOverlays && Maps[state.room.map].createOverlays.call(this)
}
