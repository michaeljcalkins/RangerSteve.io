export function playerFaceLeft() {
    if (this.player.meta.facing !== 'left') {
        this.player.meta.facing = 'left'

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
        this.currentWeaponSprite.x = this.player.meta[this.currentWeapon].meta.leftFaceX
        this.currentWeaponSprite.y = this.player.meta[this.currentWeapon].meta.leftFaceY
        console.log('Player face left')
    }
}

export function playerFaceRight() {
    if (this.player.meta.facing !== 'right') {
        this.player.meta.facing = 'right'

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
        this.currentWeaponSprite.x = this.player.meta[this.currentWeapon].meta.rightFaceX
        this.currentWeaponSprite.y = this.player.meta[this.currentWeapon].meta.rightFaceY
        console.log('Player face right')
    }
}
