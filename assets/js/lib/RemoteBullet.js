export default function RemoteBullet(data) {
    let enemyBullet = this.game.add.sprite(data.x, data.y, 'bullet12')
    enemyBullet.bulletId = data.bulletId
    enemyBullet.playerId = data.playerId
    enemyBullet.damage = data.damage
    enemyBullet.rotation = data.pointerAngle
    enemyBullet.height = data.height
    enemyBullet.width = data.width
    // enemyBullet.enableBody = true
    // enemyBullet.physicsBodyType = Phaser.Physics.ARCADE
    this.game.physics.enable(enemyBullet, Phaser.Physics.ARCADE)
    enemyBullet.body.gravity.y = -1800
    enemyBullet.x = data.x
    enemyBullet.y = data.y

    return enemyBullet
}
