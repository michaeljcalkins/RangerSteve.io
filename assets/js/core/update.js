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
    } else if (this.rightInputIsActive()) {
        // If the RIGHT key is down, set the player velocity to move right
        this.player.body.acceleration.x = this.ACCELERATION
        this.player.animations.play('right')
    } else {
        // Stand still
        this.player.body.acceleration.x = 0
        this.player.animations.stop()

        if (this.game.input.worldX > this.player.x) {
            this.player.frame = 7
        }

        if (this.game.input.worldX < this.player.x) {
            this.player.frame = 6
        }
    }








    // let leftArmRotation = this.game.physics.arcade.angleToPointer(this.leftArmSprite)
    // this.leftArmSprite.rotation = leftArmRotation
    // this.leftArmSprite.x = this.player.x + 49
    // this.leftArmSprite.y = this.player.y + 22


    let angleInDegrees = this.game.physics.arcade.angleToPointer(this.player) * 180 / Math.PI;
    this.rightArmGroup.angle = angleInDegrees + 90





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
