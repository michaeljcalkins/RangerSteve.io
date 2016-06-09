import { PropTypes } from 'react'

const propTypes = {
    player: PropTypes.object.isRequired,
    platforms: PropTypes.array.isRequired
}

export default function() {
    this.physics.arcade.collide(this.player, this.platforms)
}
