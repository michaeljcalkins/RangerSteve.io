import RemoteBullet from '../RemoteBullet'

export default function onBulletFired(data) {
    if (data.id === ('/#' + this.socket.id))
        return

    let enemyBullet = RemoteBullet.call(this, data)
    let newVelocity = this.game.physics.arcade.velocityFromRotation(data.pointerAngle, data.bulletSpeed)
    enemyBullet.body.velocity.x += newVelocity.x
    enemyBullet.body.velocity.y += newVelocity.y
    this.enemyBullets.push(enemyBullet)
}
