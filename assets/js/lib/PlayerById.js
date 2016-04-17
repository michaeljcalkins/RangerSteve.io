export default function PlayerById(id) {
    for (let i = 0; i < this.enemies.children.length; i++) {
        if (this.enemies.children[i].id === id) {
            return this.enemies.children[i]
        }
    }

    return false
}
