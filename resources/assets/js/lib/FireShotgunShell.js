import Guid from './Guid'
import emitBulletFired from './SocketEvents/emitBulletFired'

const rangeOfVariance = _.range(-.12, .12, .01)

export default function FireShotgunShell() {
    const state = this.rootScope.game.store.getState()

    let x = this.rootScope.player.x
    let y = this.rootScope.player.y

    let pointerAngle = null
    for(var i = 0; i < 4; i++) {
        let bullet = this.rootScope.bullets.getFirstDead()
        bullet.bulletId = Guid()
        bullet.damage = this.damage
        bullet.weaponId = this.meta.id
        bullet.height = this.bulletHeight
        bullet.width = this.bulletWidth
        bullet.body.gravity.y = -1150
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
            roomId: state.room.id,
            bulletId: bullet.bulletId,
            playerId: '/#' + window.socket.id,
            weaponId: this.meta.id,
            x,
            y,
            pointerAngle: socketPointerAngle,
            bulletSpeed: this.bulletSpeed,
            damage: this.damage
        })
    }

    this.fx.volume = state.game.sfxVolume
    this.fx.play()
}
