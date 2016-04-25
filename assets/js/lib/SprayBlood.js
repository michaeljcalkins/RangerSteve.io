import { PropTypes } from 'react'

const propTypes = {
    bulletY: PropTypes.number.isRequired,
    bulletX: PropTypes.number.isRequired,
    playerX: PropTypes.number.isRequired,
    bulletRotation: PropTypes.number.isRequired
}

export default function(data) {
    check(data, propTypes)

    let bloodY = data.bulletY
    let bloodX = data.playerX
    let bloodRotation = 0
    bloodRotation = data.bulletRotation
    if (data.playerX > data.bulletX) {
        bloodX += 10
        bloodY -= 25
    } else {
        bloodX -= 10
        bloodY += 25
    }

    let blood = this.add.sprite(bloodX, bloodY, 'blood')
    blood.scale.setTo(.14)
    blood.rotation = bloodRotation
    blood.animations.add('spray', [0,1,2,3,4,5,6,7,8,9,10,11,12,13], 45, false, true)
    blood.animations.play('spray')
    blood.animations.currentAnim.killOnComplete = true
}
