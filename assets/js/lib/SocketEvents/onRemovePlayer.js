import PlayerById from '../PlayerById'

export default function onRemovePlayer(data) {
    let removePlayer = PlayerById.call(this, data.id)

    // Player not found
    if (!removePlayer) {
        console.log('Player not found: ', data.id)
        return
    }

    removePlayer.player.kill()

    // Remove player from array
    this.enemies.splice(this.enemies.indexOf(removePlayer), 1)
}
