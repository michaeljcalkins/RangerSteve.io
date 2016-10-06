import { PropTypes } from 'react'

const propTypes = {
    bulletY: PropTypes.number.isRequired,
    bulletX: PropTypes.number.isRequired
}

export default function(data) {
    check(data, propTypes)

    const ricochet = this.ricochets.getFirstExists(false)
    ricochet.reset(data.bulletX, data.bulletY)
    ricochet.scale.setTo(.1)
    ricochet.anchor.setTo(.5, .5)
    ricochet.animations.play('collision', 35, false, true)
}
