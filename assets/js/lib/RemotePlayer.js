import GameConsts from './GameConsts'

export default function RemotePlayer(id, game, player, startX, startY) {
    let newRemotePlayer = {
        x: startX,
        y: startY,
        id: null,
        game: game,
        health: 100,
        player: player,
        alive: true,
        lastPosition: {
            x: startX,
            y: startY
        }
    }

    // Create the player's enemy sprite
    newRemotePlayer.player = game.add.sprite(startX, startY, 'commando')
    newRemotePlayer.player.scale.setTo(GameConsts.PLAYER_SCALE)
    newRemotePlayer.player.anchor.setTo(GameConsts.PLAYER_ANCHOR)

    // Our two animations, walking left and right.
    newRemotePlayer.player.animations.add('left', GameConsts.ANIMATION_LEFT, GameConsts.ANIMATION_FRAMERATE, true)
    newRemotePlayer.player.animations.add('right', GameConsts.ANIMATION_RIGHT, GameConsts.ANIMATION_FRAMERATE, true)

    newRemotePlayer.player.id = id

    return newRemotePlayer
}
