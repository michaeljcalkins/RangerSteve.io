'use strict'

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
            bulletId: bullet.bulletId
        })

        return false
    }, this)

    // Did this player hit any enemies
    // this.enemies.forEach((enemy) => {
    //     this.physics.arcade.collide(enemy.player, this.weapons, null, function(enemyPlayer, weapon) {
    //         console.log('You hit someone!')
    //         weapon.kill()
    //         this.socket.emit('bullet removed', {
    //             bulletId: weapon.id
    //         })
    //
    //         return false
    //     }, this)
    // })

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
        this.player.frame = 4
    }

    // Set a variable that is true when the player is touching the ground
    let onTheGround = this.player.body.touching.down

    // If the player is touching the ground, let him have 2 jumps
    if (onTheGround) {
        this.jumps = 2
        this.jumping = false
    }

    // Jump!
    if (this.jumps > 0 && this.upInputIsActive(5)) {
        this.player.body.velocity.y = this.JUMP_SPEED
        this.jumping = true
    }

    // Reduce the number of available jumps if the jump input is released
    if (this.jumping && this.upInputReleased()) {
        this.jumps--
        this.jumping = false
    }

    if (this.game.input.activePointer.isDown)
    {
        this.weapons[this.currentWeapon].fire(this.player, this.socket)
    }

    this.socket.emit('move player', {
        x: this.player.x,
        y: this.player.y
    })
}
