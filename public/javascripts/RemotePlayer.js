/* global game */

var RemotePlayer = function (index, game, player, startX, startY) {
    var x = startX
    var y = startY

    this.game = game
    this.health = 3
    this.player = player
    this.alive = true

    this.player = game.add.sprite(x, y, 'enemy')

    // this.player.body.immovable = true
    // this.player.body.collideWorldBounds = true

    //  Our two animations, walking left and right.
    this.player.animations.add('left', [0, 1, 2, 3], 10, true)
    this.player.animations.add('right', [5, 6, 7, 8], 10, true)

    this.player.name = index.toString()

    this.lastPosition = { x: x, y: y }
}

RemotePlayer.prototype.update = function () {
    console.log('remote player update')
    if (this.player.x !== this.lastPosition.x || this.player.y !== this.lastPosition.y) {
        this.player.play('move')
    } else {
        this.player.play('stop')
    }

    this.lastPosition.x = this.player.x
    this.lastPosition.y = this.player.y
}

window.RemotePlayer = RemotePlayer
