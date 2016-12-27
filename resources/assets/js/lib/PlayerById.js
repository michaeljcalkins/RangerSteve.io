// Returns either an object a boolean or false
export default function PlayerById(id) {
    if (! RS.enemies) return

    for (let i = 0; i < RS.enemies.children.length; i++) {
        if (RS.enemies.children[i].data.id === id) {
            return RS.enemies.children[i]
        }
    }

    return false
}
