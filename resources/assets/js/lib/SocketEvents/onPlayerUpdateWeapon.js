import { PropTypes } from 'react'
import PlayerById from '../PlayerById'

const propTypes = {
    id: PropTypes.string.isRequired,
    roomId: PropTypes.string.isRequired,
    currentWeaponMeta: PropTypes.object.isRequired
}

export default function(data) {
    check(data, propTypes)

    const store = this.game.store
    if (store.getState().game.state !== 'active') return
    if (data.id === ('/#' + window.socket.id)) return

    let player = PlayerById.call(this, data.id)

    if (! player) {
        console.log('Player not found when updating current weapon ', data.id)
        return
    }

    player.currentWeaponSprite.loadTexture(data.currentWeaponMeta.id)
    player.currentWeaponSprite.scale.setTo(data.currentWeaponMeta.scale)
    player.currentWeaponSprite.rotation = data.currentWeaponMeta.rotation
}
