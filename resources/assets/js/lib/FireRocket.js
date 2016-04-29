import Guid from './Guid'

export default function FireRocket() {
    let x = this.rootScope.player.x
    let y = this.rootScope.player.y

    let bullet = this.rootScope.bullets.getFirstDead()
    bullet.bulletId = Guid()
    bullet.height = this.bulletHeight
    bullet.width = this.bulletWidth
    bullet.body.gravity.y = -1800
    bullet.reset(x, y)
    let pointerAngle = this.rootScope.game.physics.arcade.moveToPointer(bullet, this.bulletSpeed)
    bullet.rotation = pointerAngle

    this.fx.volume = .3 * this.rootScope.volume
    this.fx.play()

    this.rootScope.socket.emit('bullet fired', {
        roomId: this.rootScope.roomId,
        bulletId: this.bulletId,
        playerId: '/#' + this.rootScope.socket.id,
        x,
        y,
        pointerAngle,
        bulletSpeed: this.bulletSpeed,
        height: this.bulletHeight,
        width: this.bulletWidth,
        damage: this.damage
    })
}
