export default function PlayerById(id) {
    for (let i = 0; i < this.enemies.length; i++) {
        if (this.enemies[i].player.id === id) {
            return this.enemies[i]
        }
    }

    return false
}
