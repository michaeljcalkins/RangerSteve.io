export default function PlayerAngleHandler() {
    const state = this.game.store.getState()
    const angleInDegrees = (this.game.physics.arcade.angleToPointer(RS.player) * 180 / Math.PI) + 90

    let leftAngle = angleInDegrees
    let rightAngle = angleInDegrees

    if (state.player.facing === 'right') {
        // User is aiming up and to the right
        if (angleInDegrees <= 81 && angleInDegrees >= 71) {
            leftAngle -= -10
            rightAngle -= 3
        } else if (angleInDegrees < 71 && angleInDegrees >= 61) {
            leftAngle -= 0
            rightAngle -= 4
        } else if (angleInDegrees < 61 && angleInDegrees >= 51) {
            leftAngle -= 10
            rightAngle -= 4
        } else if (angleInDegrees < 51 && angleInDegrees >= 41) {
            leftAngle -= 20
            rightAngle -= 4
        } else if (angleInDegrees < 41 && angleInDegrees >= 31) {
            leftAngle -= 20
            rightAngle -= 4
        } else if (angleInDegrees < 31 && angleInDegrees >= 21) {
            leftAngle -= 20
            rightAngle -= 5
        } else if (angleInDegrees < 21 && angleInDegrees >= 11) {
            leftAngle -= 20
            rightAngle -= 5
        } else if (angleInDegrees < 11 && angleInDegrees >= 0) {
            leftAngle -= 20
            rightAngle -= 5
        }

        // User is aiming down and to the right
        if (angleInDegrees >= 81 && angleInDegrees <= 91 ) {
            leftAngle -= -5
            rightAngle -= 7
        } else if (angleInDegrees > 91 && angleInDegrees <= 99) {
            leftAngle += 15
            rightAngle -= 7
        } else if (angleInDegrees > 99 && angleInDegrees <= 109) {
            leftAngle += 35
            rightAngle -= 7
        } else if (angleInDegrees > 109 && angleInDegrees <= 119) {
            leftAngle += 45
            rightAngle -= 7
        } else if (angleInDegrees > 119 && angleInDegrees <= 129) {
            leftAngle += 55
            rightAngle -= 7
        } else if (angleInDegrees > 129 && angleInDegrees <= 139) {
            leftAngle += 60
            rightAngle -= 7
        } else if (angleInDegrees > 139 && angleInDegrees <= 149) {
            leftAngle += 70
            rightAngle -= 7
        } else if (angleInDegrees > 149 && angleInDegrees <= 159) {
            leftAngle += 80
            rightAngle -= 7
        } else if (angleInDegrees > 159 && angleInDegrees <= 169) {
            leftAngle += 90
            rightAngle -= 8
        } else if (angleInDegrees > 169 && angleInDegrees <= 180) {
            leftAngle += 100
            rightAngle -= 10
        } else if (angleInDegrees > 180 && angleInDegrees <= 189) {
            leftAngle += 110
            rightAngle -= 12
        }
    }

    if (state.player.facing === 'left') {
        // User is aiming up and to the left
        if (angleInDegrees >= -91 && angleInDegrees <= -81) {
            leftAngle += 20
            rightAngle -= 9
        } else if (angleInDegrees > -81 && angleInDegrees <= -71) {
            leftAngle += 20
            rightAngle -= 8
        } else if (angleInDegrees > -71 && angleInDegrees <= -61) {
            leftAngle += 30
            rightAngle -= 8
        } else if (angleInDegrees > -61 && angleInDegrees <= -51) {
            leftAngle += 40
            rightAngle -= 6
        } else if (angleInDegrees > -51 && angleInDegrees <= -41) {
            leftAngle += 40
            rightAngle -= 6
        } else if (angleInDegrees > -41 && angleInDegrees <= -31) {
            leftAngle += 50
            rightAngle -= 5
        } else if (angleInDegrees > -31 && angleInDegrees <= -21) {
            leftAngle += 50
            rightAngle -= 5
        } else if (angleInDegrees > -21 && angleInDegrees <= -11) {
            leftAngle += 60
            rightAngle -= 5
        } else if (angleInDegrees > -11 && angleInDegrees <= 0) {
            leftAngle += 70
            rightAngle -= 5
        }

        // User is aiming down and to the left
        if (angleInDegrees <= 270 && angleInDegrees >= 260) {
            leftAngle += 10
            rightAngle -= 9
        } else if (angleInDegrees < 260 && angleInDegrees >= 250) {
            leftAngle += 10
            rightAngle -= 8
        } else if (angleInDegrees < 250 && angleInDegrees >= 240) {
            leftAngle += 5
            rightAngle -= 7
        } else if (angleInDegrees < 240 && angleInDegrees >= 230) {
            leftAngle += 5
            rightAngle -= 6
        } else if (angleInDegrees < 230 && angleInDegrees >= 220) {
            leftAngle += 0
            rightAngle -= 5
        } else if (angleInDegrees < 220 && angleInDegrees >= 210) {
            leftAngle += 0
            rightAngle -= 5
        } else if (angleInDegrees < 210 && angleInDegrees >= 200) {
            leftAngle += 0
            rightAngle -= 5
        } else if (angleInDegrees < 200 && angleInDegrees >= 190) {
            leftAngle += 0
            rightAngle -= 5
        } else if (angleInDegrees < 190 && angleInDegrees >= 180) {
            leftAngle += 0
            rightAngle += 1
        }
    }

    RS.leftArmGroup.angle = leftAngle
    RS.rightArmGroup.angle = rightAngle
}
