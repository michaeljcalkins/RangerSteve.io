function playerFaceLeft() {
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

        this.ak47Sprite.scale.y *= -1
        this.ak47Sprite.y = 30
        this.ak47Sprite.x = -7
    }
}

function playerFaceRight() {
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

        this.ak47Sprite.scale.y *= -1
        this.ak47Sprite.y = 19
        this.ak47Sprite.x = 3
    }
}

export {
    playerFaceLeft,
    playerFaceRight
}
