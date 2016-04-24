import { PropTypes } from 'react'

const propTypes = {
    id: PropTypes.string.isRequired
}

export default function PlayerById(id) {
    check({ id }, propTypes)

    for (let i = 0; i < this.enemies.length; i++) {
        if (this.enemies[i].id === id) {
            return this.enemies[i]
        }
    }

    return false
}
