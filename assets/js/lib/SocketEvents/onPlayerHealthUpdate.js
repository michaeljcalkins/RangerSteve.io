import EventHandler from '../EventHandler'

module.exports = function(data) {
    if (data.id !== ('/#' + this.socket.id))
        return

    this.player.meta.health = data.health
    EventHandler.emit('health update', String(this.player.meta.health))
}
