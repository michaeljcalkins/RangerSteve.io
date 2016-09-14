import { PropTypes } from 'react'

import GameConsts from './GameConsts'

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

export default function RemoteBullet(data) {
    check(data, propTypes)

    let bullet = this.enemyBullets.getFirstDead()
    bullet.reset(data.x, data.y)
    bullet.bulletId = data.bulletId
    bullet.playerId = data.playerId
    bullet.damage = data.damage
    bullet.rotation = data.pointerAngle
    bullet.height = data.height
    bullet.width = data.width
    bullet.body.gravity.y = GameConsts.BULLET_GRAVITY

    return bullet
}
