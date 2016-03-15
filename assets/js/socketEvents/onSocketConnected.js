'use strict'

module.exports = function() {
    console.log('Connected to socket server')

     // Reset enemies on reconnect
    this.enemies.forEach(function (enemy) {
        if (enemy) enemy.kill()
    })
    
    this.enemies = []

    // Send local player data to the game server
    this.socket.emit('new player', {
        x: this.player.x,
        y: this.player.y
    })
}
