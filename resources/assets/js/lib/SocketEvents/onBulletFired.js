import { PropTypes } from 'react'
import RemoteBullet from '../RemoteBullet'

const propTypes = {
    bulletId: PropTypes.string.isRequired,
    playerId: PropTypes.string.isRequired,
    damage: PropTypes.number.isRequired,
    pointerAngle: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    bulletSpeed: PropTypes.number.isRequired
}

export default function onBulletFired(data) {
    check(data, propTypes)

    if (data.id === ('/#' + this.socket.id))
        return

    let enemyBullet = RemoteBullet.call(this, data)
    let newVelocity = this.game.physics.arcade
        .velocityFromRotation(data.pointerAngle, data.bulletSpeed)
    enemyBullet.body.velocity.x += newVelocity.x
    enemyBullet.body.velocity.y += newVelocity.y
}
