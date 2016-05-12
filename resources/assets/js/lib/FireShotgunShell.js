import Guid from './Guid'
import emitBulletFired from './SocketEvents/emitBulletFired'

const rangeOfVariance = _.range(.03, .15, .01)

export default function FireShotgunShell() {
    let x = this.rootScope.player.x
    let y = this.rootScope.player.y

    let pointerAngle = null
    for(var i = 0; i < 4; i++) {
        let bullet = this.rootScope.bullets.getFirstDead()
        bullet.bulletId = Guid()
        bullet.height = this.bulletHeight
        bullet.width = this.bulletWidth
        bullet.body.gravity.y = -1800
        bullet.alpha = 0
        bullet.reset(x, y)

        let socketPointerAngle = null
        if (pointerAngle === null) {
            pointerAngle = this.rootScope.game.physics.arcade.moveToPointer(bullet, this.bulletSpeed)
            bullet.rotation = pointerAngle
            socketPointerAngle = pointerAngle
        } else {
            let randomPointerAngle = _.sample(rangeOfVariance) + pointerAngle
            let newVelocity = this.game.physics.arcade.velocityFromRotation(randomPointerAngle, this.bulletSpeed)
            bullet.body.velocity.x += newVelocity.x
            bullet.body.velocity.y += newVelocity.y
            bullet.rotation = randomPointerAngle
            socketPointerAngle = randomPointerAngle
        }

        setTimeout(function() {
            bullet.alpha = 1
        }, 40)

        emitBulletFired.call(this.rootScope, {
            roomId: this.rootScope.roomId,
            bulletId: bullet.bulletId,
            playerId: '/#' + this.rootScope.socket.id,
            x,
            y,
            pointerAngle: socketPointerAngle,
            bulletSpeed: this.bulletSpeed,
            height: bullet.height,
            width: bullet.width,
            damage: this.damage
        })
    }

    this.fx.volume = this.rootScope.volume
    this.fx.play()
}
