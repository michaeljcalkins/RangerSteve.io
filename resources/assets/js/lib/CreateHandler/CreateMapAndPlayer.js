import Maps from '../../lib/Maps'
import PlayerSpriteHandler from '../PlayerSpriteHandler'

export default function () {
  const state = this.game.store.getState()
  Maps[state.room.map].create.call(this)
  PlayerSpriteHandler.call(this)
  Maps[state.room.map].createOverlays && Maps[state.room.map].createOverlays.call(this)
}
