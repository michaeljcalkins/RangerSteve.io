import { PropTypes } from 'react'

const propTypes = {
    bulletY: PropTypes.number.isRequired,
    bulletX: PropTypes.number.isRequired
}

export default function(data) {
    check(data, propTypes)

    let ricochet = this.add.sprite(data.bulletX, data.bulletY - 50, 'rocket')
    ricochet.scale.setTo(.5, .5)
    ricochet.anchor.setTo(.5, .5)
    ricochet.animations.add('collision', [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14], 17, false, true)
    ricochet.animations.play('collision')
    ricochet.animations.currentAnim.killOnComplete = true

    this.fullDamageBlastRadius = this.add.sprite(ricochet.x, ricochet.y, 'ground')
    this.fullDamageBlastRadius.alpha = 0
    this.fullDamageBlastRadius.anchor.setTo(.5, .5)
    this.fullDamageBlastRadius.height = 85
    this.fullDamageBlastRadius.width = 100
    setTimeout(() => {
        this.fullDamageBlastRadius.kill()
    }, 200)

    this.partialDamageBlastRadius = this.add.sprite(ricochet.x, ricochet.y, 'ground')
    this.partialDamageBlastRadius.alpha = 0
    this.partialDamageBlastRadius.anchor.setTo(.5, .5)
    this.partialDamageBlastRadius.height = 170
    this.partialDamageBlastRadius.width = 200
    setTimeout(() => {
        this.partialDamageBlastRadius.kill()
    }, 200)
}
