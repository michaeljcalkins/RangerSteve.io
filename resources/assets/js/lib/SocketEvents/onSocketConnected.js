import store from 'store'

export default function onSocketConnected() {
    // Reset enemies on reconnect
    this.enemies.forEach(function (enemy) {
        if (enemy) enemy.kill()
    })

    this.enemies = this.game.add.group()

    // Send local player data to the game server
    this.socket.emit('new player', {
        roomId: this.roomId,
        x: this.player.x,
        y: this.player.y,
        nickname: store.get('nickname')
    })
}
