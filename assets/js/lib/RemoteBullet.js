export default function RemoteBullet(data) {
    let enemyBullet = this.enemyBullets.create(data.x, data.y, 'bullet12')
    enemyBullet.bulletId = data.bulletId
    enemyBullet.playerId = data.playerId
    enemyBullet.damage = data.damage
    enemyBullet.rotation = data.pointerAngle
    enemyBullet.height = data.height
    enemyBullet.width = data.width
    enemyBullet.body.gravity.y = -1800

    return enemyBullet
}
