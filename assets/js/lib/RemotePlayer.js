import GameConsts from './GameConsts'

export default function RemotePlayer(player) {
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
