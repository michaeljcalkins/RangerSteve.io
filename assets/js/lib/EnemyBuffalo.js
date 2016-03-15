'use strict'

module.exports = function() {
    this.enemyBuffalo = this.add.sprite(200, this.world.height - 400, 'dude')

    //  We need to enable physics on the player
    this.physics.arcade.enable(this.enemyBuffalo)

    // Enable physics on the player
    this.game.physics.enable(this.enemyBuffalo, Phaser.Physics.ARCADE)

    // Make player collide with world boundaries so he doesn't leave the stage
    this.enemyBuffalo.body.collideWorldBounds = true

    // Set player minimum and maximum movement speed
    this.enemyBuffalo.body.maxVelocity.setTo(this.MAX_SPEED, this.MAX_SPEED * 10) // x, y

    // Add drag to the player that slows them down when they are not accelerating
    this.enemyBuffalo.body.drag.setTo(this.DRAG, 0) // x, y

    //  Our two animations, walking left and right.
    this.enemyBuffalo.animations.add('left', [0, 1, 2, 3], 10, true)
    this.enemyBuffalo.animations.add('right', [5, 6, 7, 8], 10, true)

    this.enemyBuffalo.meta = {
        health: 100,
        damage: 22,
        reloadTime: 1000
    }
}
