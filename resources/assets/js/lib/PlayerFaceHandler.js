import actions from '../actions'
import GameConsts from './GameConsts'

export function playerFaceLeft() {
    if (this.game.store.getState().player.facing === 'left') return

    this.game.store.dispatch(actions.player.setFacing('left'))

    RS.rightArmSprite.scale.y = 0.37
    RS.rightArmGroup.x = GameConsts.PLAYER_FACE.LEFT.RIGHT_ARM_X
    RS.rightArmGroup.y = GameConsts.PLAYER_FACE.LEFT.RIGHT_ARM_Y

    RS.leftArmSprite.scale.y = 0.37
    RS.leftArmGroup.x = GameConsts.PLAYER_FACE.LEFT.LEFT_ARM_X
    RS.leftArmGroup.y = GameConsts.PLAYER_FACE.LEFT.LEFT_ARM_Y
}

export function playerFaceRight() {
    if (this.game.store.getState().player.facing === 'right')  return

    this.game.store.dispatch(actions.player.setFacing('right'))

    RS.rightArmSprite.scale.y = -0.37
    RS.rightArmGroup.x = GameConsts.PLAYER_FACE.RIGHT.RIGHT_ARM_X
    RS.rightArmGroup.y = GameConsts.PLAYER_FACE.RIGHT.RIGHT_ARM_Y

    RS.leftArmSprite.scale.y = -0.37
    RS.leftArmGroup.x = GameConsts.PLAYER_FACE.RIGHT.LEFT_ARM_X
    RS.leftArmGroup.y = GameConsts.PLAYER_FACE.RIGHT.LEFT_ARM_Y
}
