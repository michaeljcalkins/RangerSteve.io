'use strict'

import EventHandler from '../lib/EventHandler'

module.exports = function() {
    // Collide this player with the map
    this.physics.arcade.collide(this.player, this.platforms, null, null, this)

    // Did this player's bullets hit any platforms
    this.physics.arcade.collide(this.platforms, this.weapons, (platform, weapon) => {
        weapon.kill()
    }, null, this)

    // Did enemy bullets hit any platforms
    this.physics.arcade.collide(this.platforms, this.enemyBullets, (platform, bullet) => {
        bullet.kill()
    }, null, this)

    // Did this player get hit by any enemy bullets
    this.physics.arcade.collide(this.player, this.enemyBullets, null, (player, bullet) => {
        bullet.kill()

        console.log('You were hit by', bullet.bulletId)
        this.socket.emit('bullet removed', {
            roomId: this.roomId,
            bulletId: bullet.bulletId
        })

        this.socket.emit('player damaged', {
            roomId: this.roomId,
            damage: bullet.damage,
            damagedPlayerId: '/#' + this.socket.id,
            attackingPlayerId: bullet.playerId
        })

        return false
    }, this)



    let playerFaceLeft = () => {
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

    let playerFaceRight = () => {
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



    if (this.leftInputIsActive()) {
        // If the LEFT key is down, set the player velocity to move left
        this.player.body.acceleration.x = -this.ACCELERATION
        this.player.animations.play('left')

        // Left facing head needs to be set only once
        playerFaceLeft()
    } else if (this.rightInputIsActive()) {
        // If the RIGHT key is down, set the player velocity to move right
        this.player.body.acceleration.x = this.ACCELERATION
        this.player.animations.play('right')

        playerFaceRight()
    } else {
        // Stand still
        this.player.body.acceleration.x = 0
        this.player.animations.stop()

        if (this.game.input.worldX > this.player.x) {
            this.player.frame = 7
            playerFaceRight()
        }

        if (this.game.input.worldX < this.player.x) {
            this.player.frame = 6
            playerFaceLeft()
        }
    }








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







    // Set a variable that is true when the player is touching the ground
    let onTheGround = this.player.body.touching.down

    // If the player is touching the ground, let him have 2 jumps
    if (onTheGround) {
        this.jumps = 2
        this.jumping = false
    }

    // Jump!
    if (this.jumps === 2 && this.upInputIsActive(5) && onTheGround) {
        this.player.body.velocity.y = this.JUMP_SPEED
        this.jumping = true
    } else if (this.upInputIsActive(5) && !onTheGround) {
        this.jumps = 1
    }

    // Jump Jet!
    if (this.jumps === 1 && this.input.keyboard.isDown(Phaser.Keyboard.W)) {
        this.player.body.acceleration.y = this.JUMP_JET_SPEED
    } else {
        this.player.body.acceleration.y = 0
    }

    // Reduce the number of available jumps if the jump input is released
    if (this.jumping && this.upInputReleased()) {
        this.player.body.acceleration.x = 0
        this.player.body.acceleration.y = 0

        if (this.jumps !== 1) {
            this.jumps--
        }

        this.jumping = false
    }

    if (this.game.input.activePointer.isDown)
    {
        this.player.meta[this.currentWeapon].fire(this.player, this.socket, this.roomId, this.volume)
    }

    this.positionText.text = `${this.game.input.worldX}, ${this.game.input.worldY}`

    this.socket.emit('move player', {
        roomId: this.roomId,
        x: this.player.x,
        y: this.player.y
    })
}
