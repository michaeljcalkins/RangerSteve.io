import { PropTypes } from 'react'

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

    let enemyBullet = this.game.add.sprite(data.x, data.y, 'bullet12')
    enemyBullet.bulletId = data.bulletId
    enemyBullet.playerId = data.playerId
    enemyBullet.damage = data.damage
    enemyBullet.rotation = data.pointerAngle
    enemyBullet.height = data.height
    enemyBullet.width = data.width
    enemyBullet.enableBody = true
    enemyBullet.physicsBodyType = Phaser.Physics.ARCADE
    this.game.physics.enable(enemyBullet, Phaser.Physics.ARCADE)
    enemyBullet.body.gravity.y = -1800
    enemyBullet.x = data.x
    enemyBullet.y = data.y

    return enemyBullet
}
