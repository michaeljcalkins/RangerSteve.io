import { PropTypes } from 'react'

const propTypes = {
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired
}

export default function(data) {
    const playerDeath = this.playerDeaths.getFirstExists(false)
    playerDeath.reset(data.x, data.y)
    playerDeath.scale.setTo(.31)
    playerDeath.anchor.setTo(.5)
    playerDeath.animations.play('death', 13)
    playerDeath.animations.currentAnim.onComplete.add(() => {
        setTimeout(() => {
            playerDeath.kill()
        }, 3000)
    })
}
