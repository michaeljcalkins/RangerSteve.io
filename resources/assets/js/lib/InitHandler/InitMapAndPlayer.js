import Maps from '../../maps'
import PlayerSpriteHandler from '../PlayerSpriteHandler'

export default function() {
    Maps[this.room.map].create.call(this)
    PlayerSpriteHandler.call(this)
    Maps[this.room.map].createOverlays.call(this)
}
