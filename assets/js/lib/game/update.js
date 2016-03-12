'use strict'

module.exports = function() {
    //  Collide the player and the stars with the platforms
    this.physics.arcade.collide(this.player, this.platforms)
    this.physics.arcade.collide(this.enemies, this.platforms)
    this.physics.arcade.collide(this.enemy, this.platforms)
    this.physics.arcade.collide(this.platforms, this.weapons, function(platform, weapon) {
        weapon.kill()
    }, null, this);

    this.enemies.forEach((enemy) => {
        this.game.physics.arcade.overlap(enemy, this.weapons, (enemy, weapon) => {
            enemy.health -= weapon.damage
            this.socket.emit('damaged player', {
                playerId: enemy.id,
                clientId: this.clientId,
                damage: weapon.damage
            })
            weapon.kill()
            console.log('You hit them!', enemy.health, weapon.damage, enemy)
        }, null, this)
    })

    if (this.leftInputIsActive()) {
        // If the LEFT key is down, set the player velocity to move left
        this.player.body.acceleration.x = -this.ACCELERATION;
        this.player.animations.play('left')
    } else if (this.rightInputIsActive()) {
        // If the RIGHT key is down, set the player velocity to move right
        this.player.body.acceleration.x = this.ACCELERATION;
        this.player.animations.play('right')
    } else {
        // Stand still
        this.player.body.acceleration.x = 0
        this.player.animations.stop()
        this.player.frame = 4
    }

    // Set a variable that is true when the player is touching the ground
    var onTheGround = this.player.body.touching.down;

    // If the player is touching the ground, let him have 2 jumps
    if (onTheGround) {
        this.jumps = 2;
        this.jumping = false;
    }

    // Jump!
    if (this.jumps > 0 && this.upInputIsActive(5)) {
        this.player.body.velocity.y = this.JUMP_SPEED;
        this.jumping = true;
    }

    // Reduce the number of available jumps if the jump input is released
    if (this.jumping && this.upInputReleased()) {
        this.jumps--;
        this.jumping = false;
    }

    if (this.game.input.activePointer.isDown)
    {
        this.weapons[this.currentWeapon].fire(this.player);
    }

    this.socket.emit('move player', { x: this.player.x, y: this.player.y })
}
