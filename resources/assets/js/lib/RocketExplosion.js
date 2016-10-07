import { PropTypes } from 'react'

const propTypes = {
    bulletY: PropTypes.number.isRequired,
    bulletX: PropTypes.number.isRequired
}

export default function(data) {
    let rpgExplosion = this.rpgExplosions.getFirstExists(false)
    rpgExplosion.reset(data.bulletX, data.bulletY - 50)
    rpgExplosion.scale.setTo(.7)
    rpgExplosion.anchor.setTo(.5, .5)
    rpgExplosion.animations.play('collision', 17, false, true)

    this.camera.shake(0.01, 200, true)

    this.fx = this.game.add.audio('RPG-explosion-sound')
    this.fx.volume = this.game.store.getState().game.sfxVolume
    this.fx.play()
}
