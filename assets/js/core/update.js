import EventHandler from '../lib/EventHandler'
import CollisionHandler from '../lib/CollisionHandler'
import PlayerMovementHandler from '../lib/PlayerMovementHandler'
import PlayerJumpHandler from '../lib/PlayerJumpHandler'

module.exports = function() {
    CollisionHandler.call(this)
    PlayerMovementHandler.call(this)
    PlayerJumpHandler.call(this)

    let angleInDegrees = (this.game.physics.arcade.angleToPointer(this.player) * 180 / Math.PI) + 90;

    if (this.player.meta.facing === 'right') {
        this.rightArmGroup.angle = angleInDegrees + 5

        // User is aiming up
        if (angleInDegrees <= 81 && angleInDegrees >= 71) {
            angleInDegrees -= 10
        } else if (angleInDegrees < 71 && angleInDegrees >= 61) {
            angleInDegrees -= 20
        } else if (angleInDegrees < 61 && angleInDegrees >= 51) {
            angleInDegrees -= 30
        } else if (angleInDegrees < 51 && angleInDegrees >= 41) {
            angleInDegrees -= 40
        } else if (angleInDegrees < 41 && angleInDegrees >= 31) {
            angleInDegrees -= 50
        } else if (angleInDegrees < 31 && angleInDegrees >= 21) {
            angleInDegrees -= 60
        } else if (angleInDegrees < 21 && angleInDegrees >= 11) {
            angleInDegrees -= 70
        } else if (angleInDegrees < 11 && angleInDegrees >= 0) {
            angleInDegrees -= 80
        }

        // User is aiming down
        if (angleInDegrees >= 99 && angleInDegrees <= 109) {
            angleInDegrees += 10
        } else if (angleInDegrees > 109 && angleInDegrees <= 119) {
            angleInDegrees += 20
        } else if (angleInDegrees > 119 && angleInDegrees <= 129) {
            angleInDegrees += 30
        } else if (angleInDegrees > 129 && angleInDegrees <= 139) {
            angleInDegrees += 40
        } else if (angleInDegrees > 139 && angleInDegrees <= 149) {
            angleInDegrees += 50
        } else if (angleInDegrees > 149 && angleInDegrees <= 159) {
            angleInDegrees += 60
        } else if (angleInDegrees > 159 && angleInDegrees <= 169) {
            angleInDegrees += 70
        } else if (angleInDegrees > 169 && angleInDegrees <= 180) {
            angleInDegrees += 80
        }
    }

    if (this.player.meta.facing === 'left') {
        this.rightArmGroup.angle = angleInDegrees - 7

        // User is aiming up
        if (angleInDegrees >= -81 && angleInDegrees <= -71) {
            angleInDegrees += 20
        } else if (angleInDegrees > -71 && angleInDegrees <= -61) {
            angleInDegrees += 30
        } else if (angleInDegrees > -61 && angleInDegrees <= -51) {
            angleInDegrees += 40
        } else if (angleInDegrees > -51 && angleInDegrees <= -41) {
            angleInDegrees += 50
        } else if (angleInDegrees > -41 && angleInDegrees <= -31) {
            angleInDegrees += 60
        } else if (angleInDegrees > -31 && angleInDegrees <= -21) {
            angleInDegrees += 70
        } else if (angleInDegrees > -21 && angleInDegrees <= -11) {
            angleInDegrees += 80
        } else if (angleInDegrees > -11 && angleInDegrees <= 0) {
            angleInDegrees += 90
        }

        // User is aiming down
        if (angleInDegrees <= 270 && angleInDegrees >= 260) {
            angleInDegrees -= 10
        } else if (angleInDegrees < 260 && angleInDegrees >= 250) {
            angleInDegrees -= 20
        } else if (angleInDegrees < 250 && angleInDegrees >= 240) {
            angleInDegrees -= 30
        } else if (angleInDegrees < 240 && angleInDegrees >= 230) {
            angleInDegrees -= 40
        } else if (angleInDegrees < 230 && angleInDegrees >= 220) {
            angleInDegrees -= 50
        } else if (angleInDegrees < 220 && angleInDegrees >= 210) {
            angleInDegrees -= 60
        } else if (angleInDegrees < 210 && angleInDegrees >= 200) {
            angleInDegrees -= 70
        } else if (angleInDegrees < 200 && angleInDegrees >= 190) {
            angleInDegrees -= 80
        }
    }

    this.leftArmGroup.angle = angleInDegrees







    if (this.game.input.activePointer.isDown)
    {
        this.player.meta[this.currentWeapon].fire(this.player, this.socket, this.roomId, this.volume)
    }

    this.positionText.text = `${this.game.input.worldX}, ${this.game.input.worldY}`





    // Check for out of bounds kill
    if (this.player.body.onFloor()) {
        this.socket.emit('player damaged', {
            roomId: this.roomId,
            damage: 1000,
            damagedPlayerId: '/#' + this.socket.id,
            attackingPlayerId: null
        })
    }





    this.socket.emit('move player', {
        roomId: this.roomId,
        x: this.player.x,
        y: this.player.y
    })
}
