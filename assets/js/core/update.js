'use strict'

module.exports = function() {
    //  Collide the player and the stars with the platforms
    this.physics.arcade.collide(this.player, this.platforms, null, null, this)
    // this.physics.arcade.collide(this.enemyBuffalo, this.platforms)

    this.physics.arcade.collide(this.platforms, this.weapons, (platform, weapon) => {
        weapon.kill()
        this.socket.emit('bullet removed', {
            bulletId: weapon.id
        })
    }, null, this)

    this.physics.arcade.collide(this.platforms, this.enemyBullets, (platform, bullet) => {
        bullet.kill()
    }, null, this)

    // this.physics.arcade.collide(this.player, this.enemyBullets, (player, bullet) => {
    //     bullet.kill()
    //
    //     return true
    // }, null, this)

    this.enemyBullets.forEach((enemyBullet) => {
        this.physics.arcade.overlap(this.player, enemyBullet, (player, bullet) => {
            console.log('You were hit!')
            bullet.kill()
            this.socket.emit('bullet removed', {
                bulletId: bullet.id
            })
        })
    })


    this.enemies.forEach((enemy) => {
        this.physics.arcade.collide(enemy.player, this.platforms, null, null, this)
        this.physics.arcade.collide(enemy.player, this.weapons, function(enemyPlayer, weapon) {
            console.log('You hit someone!')
            weapon.kill()
            this.socket.emit('bullet removed', {
                bulletId: weapon.id
            })

            return false
        }, null, this)

    })

    // this.physics.arcade.collide(this.enemyBuffalo, this.weapons,  null, function(enemyBuffalo, weapon) {
    //     weapon.kill()
    //     enemyBuffalo.meta.health -= weapon.damage
    //
    //     if (enemyBuffalo.meta.health <= 0) {
    //         enemyBuffalo.meta.health = 100
    //         enemyBuffalo.x = 200
    //         enemyBuffalo.y = this.world.height - 400
    //     }
    //
    //     return false
    // }, this)

    // this.physics.arcade.collide(this.enemyBuffalo, this.player,  null, function(enemyBuffalo, player) {
    //     if (enemyBuffalo.meta.reloading)
    //         return false
    //
    //     player.meta.health -= enemyBuffalo.meta.damage
    //     this.healthText.text = player.meta.health
    //     enemyBuffalo.meta.reloading = true
    //
    //     setTimeout(function() {
    //         enemyBuffalo.meta.reloading = false
    //     }, enemyBuffalo.meta.reloadTime)
    //
    //     if (player.meta.health <= 0) {
    //         player.meta.health = 100
    //         player.x = 200
    //         player.y = this.world.height - 400
    //         this.healthText.text = player.meta.health
    //     }
    //
    //     return false
    // }, this)

    // if (this.enemyBuffalo.x < this.player.x) {
    //     this.enemyBuffalo.body.acceleration.x = this.ACCELERATION
    // }
    //
    // if (this.enemyBuffalo.x > this.player.x) {
    //     this.enemyBuffalo.body.acceleration.x = -this.ACCELERATION
    // }

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
