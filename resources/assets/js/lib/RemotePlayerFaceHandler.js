export function playerFaceLeft(remotePlayer) {
    if (remotePlayer.facing !== 'left') {
        remotePlayer.facing = 'left'

        remotePlayer.rightArmGroup.x = 25
        remotePlayer.rightArmGroup.y = -65

        remotePlayer.leftArmGroup.x = -40
        remotePlayer.leftArmGroup.y = -70

        // remotePlayer.leftArmSprite.scale.y *= -1
        remotePlayer.leftArmSprite.y = 5

        // remotePlayer.rightArmSprite.scale.y *= -1
        remotePlayer.rightArmSprite.y = 10

        // remotePlayer.currentWeaponSprite.scale.y *= -1
        remotePlayer.currentWeaponSprite.y = 30
        remotePlayer.currentWeaponSprite.x = -7
    }
}

export function playerFaceRight(remotePlayer) {
    if (remotePlayer.facing !== 'right') {
        remotePlayer.facing = 'right'

        remotePlayer.rightArmGroup.x = -25
        remotePlayer.rightArmGroup.y = -65

        remotePlayer.leftArmGroup.x = 45
        remotePlayer.leftArmGroup.y = -70

        // remotePlayer.leftArmSprite.scale.y *= -1
        remotePlayer.leftArmSprite.y = 0

        // remotePlayer.rightArmSprite.scale.y *= -1
        remotePlayer.rightArmSprite.y = 0

        // remotePlayer.currentWeaponSprite.scale.y *= -1
        remotePlayer.currentWeaponSprite.y = 19
        remotePlayer.currentWeaponSprite.x = 3
    }
}
