import { PropTypes } from 'react'

const propTypes = {
    id: PropTypes.string.isRequired
}

export default function PlayerById(id) {
    if (! RangerSteve.enemies) return

    for (let i = 0; i < RangerSteve.enemies.children.length; i++) {
        if (RangerSteve.enemies.children[i].id === id) {
            return RangerSteve.enemies.children[i]
        }
    }

    return false
}
