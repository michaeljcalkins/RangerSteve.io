'use strict'

let Player = {}

Player.create = function() {
    let newPlayer = this.add.sprite(200, this.world.height - 400, 'dude');

    //  We need to enable physics on the player
    this.physics.arcade.enable(newPlayer);

    // Enable physics on the player
    this.game.physics.enable(newPlayer, Phaser.Physics.ARCADE);

    // Make player collide with world boundaries so he doesn't leave the stage
    newPlayer.body.collideWorldBounds = true;

    // Set player minimum and maximum movement speed
    newPlayer.body.maxVelocity.setTo(this.MAX_SPEED, this.MAX_SPEED * 10); // x, y

    // Add drag to the player that slows them down when they are not accelerating
    newPlayer.body.drag.setTo(this.DRAG, 0); // x, y

    //  Our two animations, walking left and right.
    newPlayer.animations.add('left', [0, 1, 2, 3], 10, true)
    newPlayer.animations.add('right', [5, 6, 7, 8], 10, true)
    newPlayer.score = 0

    return newPlayer
}

module.exports = Player
