import actions from '../actions'

export function playerFaceLeft() {    
    if (this.game.store.getState().player.facing !== 'left') {
        this.game.store.dispatch(actions.player.setFacing('left'))
        const player = this.game.store.getState().player

        this.rightArmGroup.x = 25
        this.rightArmGroup.y = -65

        this.leftArmGroup.x = -40
        this.leftArmGroup.y = -70

        this.headSprite.scale.x *= -1
        this.headSprite.x = 12

        this.torsoSprite.scale.x *= -1
        this.torsoSprite.x = 49

        this.leftArmSprite.scale.y *= -1
        this.leftArmSprite.y = 5

        this.rightArmSprite.scale.y *= -1
        this.rightArmSprite.y = 10

        this.currentWeaponSprite.scale.y *= -1
        this.currentWeaponSprite.x = player[player.currentWeapon].meta.leftFaceX
        this.currentWeaponSprite.y = player[player.currentWeapon].meta.leftFaceY
    }
}

export function playerFaceRight() {
    if (this.game.store.getState().player.facing !== 'right') {
        this.game.store.dispatch(actions.player.setFacing('right'))
        const player = this.game.store.getState().player

        this.rightArmGroup.x = -25
        this.rightArmGroup.y = -65

        this.leftArmGroup.x = 45
        this.leftArmGroup.y = -70

        this.headSprite.scale.x *= -1
        this.headSprite.x = 0

        this.torsoSprite.scale.x *= -1
        this.torsoSprite.x = -37

        this.leftArmSprite.scale.y *= -1
        this.leftArmSprite.y = 0

        this.rightArmSprite.scale.y *= -1
        this.rightArmSprite.y = 0

        this.currentWeaponSprite.scale.y *= -1
        this.currentWeaponSprite.x = player[player.currentWeapon].meta.rightFaceX
        this.currentWeaponSprite.y = player[player.currentWeapon].meta.rightFaceY
    }
}
