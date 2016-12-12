import GameConsts from 'lib/GameConsts'

export function playerFaceLeft(player) {
    if (player.facing === 'left') return

    player.facing = 'left'

    player.rightArmSprite.scale.y *= -1
    player.rightArmGroup.x = GameConsts.PLAYER_FACE.LEFT.RIGHT_ARM_X
    player.rightArmGroup.y = GameConsts.PLAYER_FACE.LEFT.RIGHT_ARM_Y

    player.leftArmSprite.scale.y *= -1
    player.leftArmGroup.x = GameConsts.PLAYER_FACE.LEFT.LEFT_ARM_X
    player.leftArmGroup.y = GameConsts.PLAYER_FACE.LEFT.LEFT_ARM_Y
}

export function playerFaceRight(player) {
    if (player.facing === 'right') return

    player.facing = 'right'

    player.rightArmSprite.scale.y *= -1
    player.rightArmGroup.x = GameConsts.PLAYER_FACE.RIGHT.RIGHT_ARM_X
    player.rightArmGroup.y = GameConsts.PLAYER_FACE.RIGHT.RIGHT_ARM_Y

    player.leftArmSprite.scale.y *= -1
    player.leftArmGroup.x = GameConsts.PLAYER_FACE.RIGHT.LEFT_ARM_X
    player.leftArmGroup.y = GameConsts.PLAYER_FACE.RIGHT.LEFT_ARM_Y
}
