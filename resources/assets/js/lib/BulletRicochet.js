import { PropTypes } from 'react'

const propTypes = {
    bulletY: PropTypes.number.isRequired,
    bulletX: PropTypes.number.isRequired
}

export default function(data) {
    check(data, propTypes)

    let ricochet = this.add.sprite(data.bulletX - 10, data.bulletY - 10, 'ricochet')
    ricochet.scale.setTo(.17)
    ricochet.anchor.setTo(.5, .5)
    ricochet.animations.add('collision', [0,1,2,3,4,5], 45, false, true)
    ricochet.animations.play('collision')
    ricochet.animations.currentAnim.killOnComplete = true
}
