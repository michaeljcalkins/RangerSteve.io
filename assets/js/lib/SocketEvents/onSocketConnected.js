import GetQueryString from '../GetQueryString'

export default function onSocketConnected() {
    console.log('Connected to socket server')

     // Reset enemies on reconnect
    this.enemies.forEach(function (enemy) {
        if (enemy) enemy.kill()
    })

    this.enemies = []

    // Send local player data to the game server
    this.socket.emit('new player', {
        roomId: GetQueryString('roomId'),
        x: this.player.x,
        y: this.player.y
    })
}
