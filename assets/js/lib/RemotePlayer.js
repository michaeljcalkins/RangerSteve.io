'use strict'

let RemotePlayer = {}

RemotePlayer.create = function(config) {
    // Add new player to the remote players array
    let newRemotePlayer = this.add.sprite(config.x, config.y, 'dude');
    newRemotePlayer.id = config.id

    newRemotePlayer.lastPosition = {
        x: config.x,
        y: config.y
    }

    //  We need to enable physics on the player
    this.physics.arcade.enable(newRemotePlayer);
    console.log('newRemotePlayer', newRemotePlayer)

    // Enable physics on the player
    this.game.physics.enable(newRemotePlayer, Phaser.Physics.ARCADE);

    // Make player collide with world boundaries so he doesn't leave the stage
    newRemotePlayer.body.collideWorldBounds = true;

    // Set player minimum and maximum movement speed
    newRemotePlayer.body.maxVelocity.setTo(this.MAX_SPEED, this.MAX_SPEED * 10); // x, y

    // Add drag to the player that slows them down when they are not accelerating
    newRemotePlayer.body.drag.setTo(this.DRAG, 0); // x, y

    newRemotePlayer.health = 100

    newRemotePlayer.animations.add('left', [0, 1, 2, 3], 10, true)
    newRemotePlayer.animations.add('right', [5, 6, 7, 8], 10, true)

    return newRemotePlayer
}

module.exports = RemotePlayer
