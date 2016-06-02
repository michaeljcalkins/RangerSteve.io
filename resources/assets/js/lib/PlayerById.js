import { PropTypes } from 'react'

const propTypes = {
    id: PropTypes.string.isRequired
}

export default function PlayerById(id) {
    check({ id }, propTypes)

    if (! this.enemies) return

    for (let i = 0; i < this.enemies.children.length; i++) {
        if (this.enemies.children[i].id === id) {
            return this.enemies.children[i]
        }
    }

    return false
}
