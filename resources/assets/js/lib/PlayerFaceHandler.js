import actions from '../actions'
import GameConsts from './GameConsts'

export function playerFaceLeft() {
    if (this.game.store.getState().player.facing === 'left') return

    this.game.store.dispatch(actions.player.setFacing('left'))

    this.rightArmSprite.scale.y *= -1
    this.rightArmGroup.x = GameConsts.PLAYER_FACE.LEFT.RIGHT_ARM_X
    this.rightArmGroup.y = GameConsts.PLAYER_FACE.LEFT.RIGHT_ARM_Y

    this.leftArmSprite.scale.y *= -1
    this.leftArmGroup.x = GameConsts.PLAYER_FACE.LEFT.LEFT_ARM_X
    this.leftArmGroup.y = GameConsts.PLAYER_FACE.LEFT.LEFT_ARM_Y
}

export function playerFaceRight() {
    if (this.game.store.getState().player.facing === 'right')  return

    this.game.store.dispatch(actions.player.setFacing('right'))

    this.rightArmSprite.scale.y *= -1
    this.rightArmGroup.x = GameConsts.PLAYER_FACE.RIGHT.RIGHT_ARM_X
    this.rightArmGroup.y = GameConsts.PLAYER_FACE.RIGHT.RIGHT_ARM_Y

    this.leftArmSprite.scale.y *= -1
    this.leftArmGroup.x = GameConsts.PLAYER_FACE.RIGHT.LEFT_ARM_X
    this.leftArmGroup.y = GameConsts.PLAYER_FACE.RIGHT.LEFT_ARM_Y
}
