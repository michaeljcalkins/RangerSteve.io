export default function PlayerAngleHandler() {
    let angleInDegrees = (this.game.physics.arcade.angleToPointer(this.player) * 180 / Math.PI) + 90

    if (this.player.meta.facing === 'right') {
        this.rightArmGroup.angle = angleInDegrees

        // User is aiming up
        if (angleInDegrees <= 81 && angleInDegrees >= 71) {
            angleInDegrees -= 0
        } else if (angleInDegrees < 71 && angleInDegrees >= 61) {
            angleInDegrees -= 15
        } else if (angleInDegrees < 61 && angleInDegrees >= 51) {
            angleInDegrees -= 25
        } else if (angleInDegrees < 51 && angleInDegrees >= 41) {
            angleInDegrees -= 35
        } else if (angleInDegrees < 41 && angleInDegrees >= 31) {
            angleInDegrees -= 40
        } else if (angleInDegrees < 31 && angleInDegrees >= 21) {
            angleInDegrees -= 50
        } else if (angleInDegrees < 21 && angleInDegrees >= 11) {
            angleInDegrees -= 60
        } else if (angleInDegrees < 11 && angleInDegrees >= 0) {
            angleInDegrees -= 70
        }

        // User is aiming down
        if (angleInDegrees >= 82 && angleInDegrees <= 91 ) {
            angleInDegrees += 10
        } else if (angleInDegrees > 91 && angleInDegrees <= 99) {
            angleInDegrees += 20
        } else if (angleInDegrees > 99 && angleInDegrees <= 109) {
            angleInDegrees += 30
        } else if (angleInDegrees > 109 && angleInDegrees <= 119) {
            angleInDegrees += 40
        } else if (angleInDegrees > 119 && angleInDegrees <= 129) {
            angleInDegrees += 50
        } else if (angleInDegrees > 129 && angleInDegrees <= 139) {
            angleInDegrees += 60
        } else if (angleInDegrees > 139 && angleInDegrees <= 149) {
            angleInDegrees += 70
        } else if (angleInDegrees > 149 && angleInDegrees <= 159) {
            angleInDegrees += 80
        } else if (angleInDegrees > 159 && angleInDegrees <= 169) {
            angleInDegrees += 90
        } else if (angleInDegrees > 169 && angleInDegrees <= 180) {
            angleInDegrees += 100
        }
    }

    if (this.player.meta.facing === 'left') {
        this.rightArmGroup.angle = angleInDegrees

        // User is aiming up
        if (angleInDegrees >= -91 && angleInDegrees <= -81) {
            angleInDegrees += 20
        } else if (angleInDegrees > -81 && angleInDegrees <= -71) {
            angleInDegrees += 30
        } else if (angleInDegrees > -71 && angleInDegrees <= -61) {
            angleInDegrees += 35
        } else if (angleInDegrees > -61 && angleInDegrees <= -51) {
            angleInDegrees += 50
        } else if (angleInDegrees > -51 && angleInDegrees <= -41) {
            angleInDegrees += 60
        } else if (angleInDegrees > -41 && angleInDegrees <= -31) {
            angleInDegrees += 65
        } else if (angleInDegrees > -31 && angleInDegrees <= -21) {
            angleInDegrees += 75
        } else if (angleInDegrees > -21 && angleInDegrees <= -11) {
            angleInDegrees += 80
        } else if (angleInDegrees > -11 && angleInDegrees <= 0) {
            angleInDegrees += 90
        }

        // User is aiming down
        if (angleInDegrees <= 270 && angleInDegrees >= 260) {
            angleInDegrees -= 5
        } else if (angleInDegrees < 260 && angleInDegrees >= 250) {
            angleInDegrees -= 15
        } else if (angleInDegrees < 250 && angleInDegrees >= 240) {
            angleInDegrees -= 25
        } else if (angleInDegrees < 240 && angleInDegrees >= 230) {
            angleInDegrees -= 35
        } else if (angleInDegrees < 230 && angleInDegrees >= 220) {
            angleInDegrees -= 45
        } else if (angleInDegrees < 220 && angleInDegrees >= 210) {
            angleInDegrees -= 50
        } else if (angleInDegrees < 210 && angleInDegrees >= 200) {
            angleInDegrees -= 60
        } else if (angleInDegrees < 200 && angleInDegrees >= 190) {
            angleInDegrees -= 70
        }
    }

    this.leftArmGroup.angle = angleInDegrees
}
