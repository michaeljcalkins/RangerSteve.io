import { PropTypes } from 'react'

const propTypes = {
    id: PropTypes.string.isRequired
}

export default function PlayerById(id) {
    if (! RS.enemies) return

    for (let i = 0; i < RS.enemies.children.length; i++) {
        if (RS.enemies.children[i].id === id) {
            return RS.enemies.children[i]
        }
    }

    return false
}
