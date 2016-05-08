import Guid from './Guid'
import emitBulletFired from './SocketEvents/emitBulletFired'

export default function FireShotgunShell() {
    let x = this.rootScope.player.x
    let y = this.rootScope.player.y

    let bullet = this.rootScope.bullets.getFirstDead()
    bullet.bulletId = Guid()
    bullet.height = this.bulletHeight
    bullet.width = this.bulletWidth
    bullet.body.gravity.y = -1800
    bullet.alpha = 0
    bullet.reset(x, y)
    let pointerAngle = this.rootScope.game.physics.arcade.moveToPointer(bullet, this.bulletSpeed)
    bullet.rotation = pointerAngle

    setTimeout(function() {
        bullet.alpha = 1
    }, 40)

    this.fx.volume = .3 * this.rootScope.volume
    this.fx.play()

    emitBulletFired.call(this.rootScope, {
        roomId: this.rootScope.roomId,
        bulletId: bullet.bulletId,
        playerId: '/#' + this.rootScope.socket.id,
        x,
        y,
        pointerAngle,
        bulletSpeed: this.bulletSpeed,
        height: bullet.height,
        width: bullet.width,
        damage: this.damage
    })
}
