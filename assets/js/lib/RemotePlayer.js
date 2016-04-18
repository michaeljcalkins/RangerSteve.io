import GameConsts from './GameConsts'
import { PropTypes } from 'react'

const propTypes = {
    x: PropTypes.number.isRequired,
    y:  PropTypes.number.isRequired,
    id: PropTypes.string.isRequired
}

export default function RemotePlayer(player) {
    check(player, propTypes)

    let newRemotePlayer = this.game.add.sprite(player.x, player.y, 'commando')
    newRemotePlayer.scale.setTo(GameConsts.PLAYER_SCALE)
    newRemotePlayer.anchor.setTo(GameConsts.PLAYER_ANCHOR)
    newRemotePlayer.alive = true
    newRemotePlayer.animations.add('left', GameConsts.ANIMATION_LEFT, GameConsts.ANIMATION_FRAMERATE, true)
    newRemotePlayer.animations.add('right', GameConsts.ANIMATION_RIGHT, GameConsts.ANIMATION_FRAMERATE, true)
    newRemotePlayer.id = player.id
    newRemotePlayer.lastPosition = {
        x: player.x,
        y: player.y
    }

    return newRemotePlayer
}
