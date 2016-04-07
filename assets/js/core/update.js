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





    if (this.leftInputIsActive()) {
        // If the LEFT key is down, set the player velocity to move left
        this.player.body.acceleration.x = -this.ACCELERATION
        this.player.animations.play('left')

        // Left facing head needs to be set only once
        if (this.player.meta.facing !== 'left') {
            this.player.meta.facing = 'left'

            this.headSprite.scale.x *= -1
            this.headSprite.x = 12

            this.torsoSprite.scale.x *= -1
            this.torsoSprite.x = 49

            this.leftArmSprite.scale.y *= -1
            this.rightArmSprite.scale.y *= -1
            this.ak47Sprite.scale.y *= -1
        }

    } else if (this.rightInputIsActive()) {
        // If the RIGHT key is down, set the player velocity to move right
        this.player.body.acceleration.x = this.ACCELERATION
        this.player.animations.play('right')

        if (this.player.meta.facing !== 'right') {
            this.player.meta.facing = 'right'

            this.headSprite.scale.x *= -1
            this.headSprite.x = 0

            this.torsoSprite.scale.x *= -1
            this.torsoSprite.x = -37

            this.leftArmSprite.scale.y *= -1
            this.rightArmSprite.scale.y *= -1
            this.ak47Sprite.scale.y *= -1
        }
    } else {
        // Stand still
        this.player.body.acceleration.x = 0
        this.player.animations.stop()

        if (this.game.input.worldX > this.player.x) {
            this.player.frame = 7
            if (this.player.meta.facing !== 'right') {
                this.player.meta.facing = 'right'

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
            }
        }

        if (this.game.input.worldX < this.player.x) {
            this.player.frame = 6
            if (this.player.meta.facing !== 'left') {
                this.player.meta.facing = 'left'

                this.headSprite.scale.x *= -1
                this.headSprite.x = 12

                this.torsoSprite.scale.x *= -1
                this.torsoSprite.x = 49

                this.leftArmSprite.scale.y *= -1
                this.leftArmSprite.y = -85

                this.rightArmSprite.scale.y *= -1
                this.rightArmSprite.y = 65

                this.ak47Sprite.scale.y *= -1
                this.ak47Sprite.y = 65
            }
        }
    }








    let angleInDegrees = (this.game.physics.arcade.angleToPointer(this.player) * 180 / Math.PI) + 90;


    this.rightArmGroup.angle = angleInDegrees
    // console.log('angleInDegrees', angleInDegrees)

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
        this.weapons[this.currentWeapon].fire(this.player, this.socket, this.roomId, this.volume)
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.ONE)) {
        this.setCurrentWeapon(0)
        EventHandler.emit('weapon update', 1)
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.TWO)) {
        this.setCurrentWeapon(1)
        EventHandler.emit('weapon update', 2)
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.THREE)) {
        this.setCurrentWeapon(2)
        EventHandler.emit('weapon update', 3)
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.FOUR)) {
        this.setCurrentWeapon(3)
        EventHandler.emit('weapon update', 4)
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.FIVE)) {
        this.setCurrentWeapon(4)
        EventHandler.emit('weapon update', 5)
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.SIX)) {
        this.setCurrentWeapon(5)
        EventHandler.emit('weapon update', 6)
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.SEVEN)) {
        this.setCurrentWeapon(6)
        EventHandler.emit('weapon update', 7)
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.EIGHT)) {
        this.setCurrentWeapon(7)
        EventHandler.emit('weapon update', 8)
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.NINE)) {
        this.setCurrentWeapon(8)
        EventHandler.emit('weapon update', 9)
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.ZERO)) {
        this.setCurrentWeapon(9)
        EventHandler.emit('weapon update', 0)
    }

    this.positionText.text = `${this.game.input.worldX}, ${this.game.input.worldY}`

    this.socket.emit('move player', {
        roomId: this.roomId,
        x: this.player.x,
        y: this.player.y
    })
}
