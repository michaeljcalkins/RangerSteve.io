import { PropTypes } from 'react'

const propTypes = {
    bulletY: PropTypes.number.isRequired,
    bulletX: PropTypes.number.isRequired,
    playerX: PropTypes.number.isRequired,
    bulletRotation: PropTypes.number.isRequired
}

export default function(data) {
    let bloodY = data.bulletY
    let bloodX = data.playerX
    const bloodRotation = data.bulletRotation
    if (data.playerX > data.bulletX) {
        bloodX += 10
        bloodY -= 25
    } else {
        bloodX -= 10
        bloodY += 25
    }

    const bloodSpray = this.bloodSprays.getFirstExists(false)
    bloodSpray.reset(bloodX, bloodY)
    bloodSpray.scale.setTo(.14)
    bloodSpray.rotation = bloodRotation
    bloodSpray.animations.play('spray')
}
