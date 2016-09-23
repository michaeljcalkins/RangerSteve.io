import actions from '../actions'
import GameConsts from './GameConsts.js'

export function playerFaceLeft() {
    if (this.game.store.getState().player.facing !== 'left') {
        this.game.store.dispatch(actions.player.setFacing('left'))
        const player = this.game.store.getState().player
        const currentWeaponId = player.currentWeapon === 'primaryWeapon' ? player.selectedPrimaryWeaponId : player.selectedSecondaryWeaponId
        const currentWeapon = GameConsts.WEAPONS[currentWeaponId]

        this.rightArmGroup.x = GameConsts.PLAYER_FACE.LEFT.RIGHT_ARM_X
        this.rightArmGroup.y = GameConsts.PLAYER_FACE.LEFT.RIGHT_ARM_Y

        this.leftArmGroup.x = GameConsts.PLAYER_FACE.LEFT.LEFT_ARM_X
        this.leftArmGroup.y = GameConsts.PLAYER_FACE.LEFT.LEFT_ARM_Y

        this.headSprite.scale.x *= -1
        this.headSprite.x = 5

        this.torsoSprite.scale.x *= -1
        this.torsoSprite.x = 59

        this.leftArmSprite.scale.y *= -1
        this.leftArmSprite.y = 5

        this.rightArmSprite.scale.y *= -1
        this.rightArmSprite.y = 10

        this.currentWeaponSprite.scale.y *= -1
        this.currentWeaponSprite.x = currentWeapon.position.leftFaceX
        this.currentWeaponSprite.y = currentWeapon.position.leftFaceY
    }
}

export function playerFaceRight() {
    if (this.game.store.getState().player.facing !== 'right') {
        this.game.store.dispatch(actions.player.setFacing('right'))
        const player = this.game.store.getState().player
        const currentWeaponId = player.currentWeapon === 'primaryWeapon' ? player.selectedPrimaryWeaponId : player.selectedSecondaryWeaponId
        const currentWeapon = GameConsts.WEAPONS[currentWeaponId]

        this.rightArmGroup.x = GameConsts.PLAYER_FACE.RIGHT.RIGHT_ARM_X
        this.rightArmGroup.y = GameConsts.PLAYER_FACE.RIGHT.RIGHT_ARM_Y

        this.leftArmGroup.x = GameConsts.PLAYER_FACE.RIGHT.LEFT_ARM_X
        this.leftArmGroup.y = GameConsts.PLAYER_FACE.RIGHT.LEFT_ARM_Y

        this.headSprite.scale.x *= -1
        this.headSprite.x = -5

        this.torsoSprite.scale.x *= -1
        this.torsoSprite.x = -59

        this.leftArmSprite.scale.y *= -1
        this.leftArmSprite.y = 0

        this.rightArmSprite.scale.y *= -1
        this.rightArmSprite.y = 0

        this.currentWeaponSprite.scale.y *= -1
        this.currentWeaponSprite.x = currentWeapon.position.rightFaceX
        this.currentWeaponSprite.y = currentWeapon.position.rightFaceY
    }
}
