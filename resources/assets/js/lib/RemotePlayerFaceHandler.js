import GameConsts from 'lib/GameConsts'

export function playerFaceLeft(remotePlayer) {
    if (remotePlayer.facing === 'left') return

    remotePlayer.facing = 'left'

    remotePlayer.rightArmSprite.scale.y *= -1
    remotePlayer.rightArmGroup.x = GameConsts.PLAYER_FACE.LEFT.RIGHT_ARM_X
    remotePlayer.rightArmGroup.y = GameConsts.PLAYER_FACE.LEFT.RIGHT_ARM_Y

    remotePlayer.leftArmSprite.scale.y *= -1
    remotePlayer.leftArmGroup.x = GameConsts.PLAYER_FACE.LEFT.LEFT_ARM_X
    remotePlayer.leftArmGroup.y = GameConsts.PLAYER_FACE.LEFT.LEFT_ARM_Y
}

export function playerFaceRight(remotePlayer) {
    if (remotePlayer.facing === 'right') return

    remotePlayer.facing = 'right'

    remotePlayer.rightArmSprite.scale.y *= -1
    remotePlayer.rightArmGroup.x = GameConsts.PLAYER_FACE.RIGHT.RIGHT_ARM_X
    remotePlayer.rightArmGroup.y = GameConsts.PLAYER_FACE.RIGHT.RIGHT_ARM_Y

    remotePlayer.leftArmSprite.scale.y *= -1
    remotePlayer.leftArmGroup.x = GameConsts.PLAYER_FACE.RIGHT.LEFT_ARM_X
    remotePlayer.leftArmGroup.y = GameConsts.PLAYER_FACE.RIGHT.LEFT_ARM_Y
}
