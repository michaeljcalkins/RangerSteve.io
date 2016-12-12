export default function(player, angle) {
    let leftAngle = angle
    let rightAngle = angle

    if (angle >= 0 && angle <= 180) {
        // User is aiming up and to the right
        if (angle <= 81 && angle >= 71) {
            leftAngle -= -10
            rightAngle -= 3
        } else if (angle < 71 && angle >= 61) {
            leftAngle -= 0
            rightAngle -= 4
        } else if (angle < 61 && angle >= 51) {
            leftAngle -= 10
            rightAngle -= 4
        } else if (angle < 51 && angle >= 41) {
            leftAngle -= 20
            rightAngle -= 4
        } else if (angle < 41 && angle >= 31) {
            leftAngle -= 20
            rightAngle -= 4
        } else if (angle < 31 && angle >= 21) {
            leftAngle -= 20
            rightAngle -= 5
        } else if (angle < 21 && angle >= 11) {
            leftAngle -= 20
            rightAngle -= 5
        } else if (angle < 11 && angle >= 0) {
            leftAngle -= 20
            rightAngle -= 5
        }

        // User is aiming down and to the right
        if (angle >= 81 && angle <= 91 ) {
            leftAngle -= -5
            rightAngle -= 7
        } else if (angle > 91 && angle <= 99) {
            leftAngle += 15
            rightAngle -= 7
        } else if (angle > 99 && angle <= 109) {
            leftAngle += 35
            rightAngle -= 7
        } else if (angle > 109 && angle <= 119) {
            leftAngle += 45
            rightAngle -= 7
        } else if (angle > 119 && angle <= 129) {
            leftAngle += 55
            rightAngle -= 7
        } else if (angle > 129 && angle <= 139) {
            leftAngle += 60
            rightAngle -= 7
        } else if (angle > 139 && angle <= 149) {
            leftAngle += 70
            rightAngle -= 7
        } else if (angle > 149 && angle <= 159) {
            leftAngle += 80
            rightAngle -= 7
        } else if (angle > 159 && angle <= 169) {
            leftAngle += 90
            rightAngle -= 8
        } else if (angle > 169 && angle <= 180) {
            leftAngle += 100
            rightAngle -= 10
        }
    } else {
        // User is aiming up and to the left
        if (angle >= -91 && angle <= -81) {
            leftAngle += 20
            rightAngle -= 9
        } else if (angle > -81 && angle <= -71) {
            leftAngle += 20
            rightAngle -= 8
        } else if (angle > -71 && angle <= -61) {
            leftAngle += 30
            rightAngle -= 8
        } else if (angle > -61 && angle <= -51) {
            leftAngle += 40
            rightAngle -= 6
        } else if (angle > -51 && angle <= -41) {
            leftAngle += 40
            rightAngle -= 6
        } else if (angle > -41 && angle <= -31) {
            leftAngle += 50
            rightAngle -= 5
        } else if (angle > -31 && angle <= -21) {
            leftAngle += 50
            rightAngle -= 5
        } else if (angle > -21 && angle <= -11) {
            leftAngle += 60
            rightAngle -= 5
        } else if (angle > -11 && angle <= 0) {
            leftAngle += 70
            rightAngle -= 5
        }

        // User is aiming down and to the left
        if (angle <= 270 && angle >= 260) {
            leftAngle += 10
            rightAngle -= 9
        } else if (angle < 260 && angle >= 250) {
            leftAngle += 10
            rightAngle -= 8
        } else if (angle < 250 && angle >= 240) {
            leftAngle += 5
            rightAngle -= 7
        } else if (angle < 240 && angle >= 230) {
            leftAngle += 5
            rightAngle -= 6
        } else if (angle < 230 && angle >= 220) {
            leftAngle += 0
            rightAngle -= 5
        } else if (angle < 220 && angle >= 210) {
            leftAngle += 0
            rightAngle -= 5
        } else if (angle < 210 && angle >= 200) {
            leftAngle += 0
            rightAngle -= 5
        } else if (angle < 200 && angle >= 190) {
            leftAngle += 0
            rightAngle -= 5
        } else if (angle < 190 && angle >= 180) {
            leftAngle += 0
            rightAngle += 1
        }
    }

    player.leftArmGroup.angle = leftAngle
    player.rightArmGroup.angle = rightAngle
}
