import get from 'lodash/get'

// Returns either an object a boolean or false
export default function PlayerById(id) {
    if (! RS.enemies) return

    for (let i = 0; i < RS.enemies.children.length; i++) {
        if (get(RS, `enemies.children[${i}].data.id`) === id) {
            return RS.enemies.children[i]
        }
    }
}
