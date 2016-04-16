import EventHandler from '../EventHandler'

export default function onPlayerHealthUpdate(data) {
    if (data.id !== ('/#' + this.socket.id))
        return

    this.player.meta.health = data.health
    EventHandler.emit('health update', String(this.player.meta.health))
}
