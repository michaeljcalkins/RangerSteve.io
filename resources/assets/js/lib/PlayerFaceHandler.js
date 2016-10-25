import actions from '../actions'
import GameConsts from './GameConsts'

export function playerFaceLeft() {
    if (this.game.store.getState().player.facing === 'left') return

    this.game.store.dispatch(actions.player.setFacing('left'))

    RangerSteve.rightArmSprite.scale.y *= -1
    RangerSteve.rightArmGroup.x = GameConsts.PLAYER_FACE.LEFT.RIGHT_ARM_X
    RangerSteve.rightArmGroup.y = GameConsts.PLAYER_FACE.LEFT.RIGHT_ARM_Y

    RangerSteve.leftArmSprite.scale.y *= -1
    RangerSteve.leftArmGroup.x = GameConsts.PLAYER_FACE.LEFT.LEFT_ARM_X
    RangerSteve.leftArmGroup.y = GameConsts.PLAYER_FACE.LEFT.LEFT_ARM_Y
}

export function playerFaceRight() {
    if (this.game.store.getState().player.facing === 'right')  return

    this.game.store.dispatch(actions.player.setFacing('right'))

    RangerSteve.rightArmSprite.scale.y *= -1
    RangerSteve.rightArmGroup.x = GameConsts.PLAYER_FACE.RIGHT.RIGHT_ARM_X
    RangerSteve.rightArmGroup.y = GameConsts.PLAYER_FACE.RIGHT.RIGHT_ARM_Y

    RangerSteve.leftArmSprite.scale.y *= -1
    RangerSteve.leftArmGroup.x = GameConsts.PLAYER_FACE.RIGHT.LEFT_ARM_X
    RangerSteve.leftArmGroup.y = GameConsts.PLAYER_FACE.RIGHT.LEFT_ARM_Y
}
