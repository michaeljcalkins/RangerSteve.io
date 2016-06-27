import Guid from './Guid'
import emitBulletFired from './SocketEvents/emitBulletFired'

export default function FireStandardBullet() {
    const state = this.rootScope.game.store.getState()

    let x = this.rootScope.player.x
    let y = this.rootScope.player.y - 10

    let bullet = this.rootScope.bullets.getFirstDead()
    bullet.bulletId = Guid()
    bullet.damage = this.damage
    bullet.weaponId = this.meta.id
    bullet.height = this.bulletHeight
    bullet.width = this.bulletWidth
    bullet.alpha = 0
    bullet.body.gravity.y = -1800
    bullet.reset(x, y)
    let pointerAngle = this.rootScope.game.physics.arcade.moveToPointer(bullet, this.bulletSpeed)
    bullet.rotation = pointerAngle

    // Add a touch of tile padding for the collision detection
    bullet.body.tilePadding.x = 50
    bullet.body.tilePadding.y = 1

    setTimeout(() => {
        bullet.alpha = this.bulletAlpha !== undefined ? this.bulletAlpha : 1
    }, 40)

    this.fx.volume = state.game.sfxVolume
    this.fx.play()

    emitBulletFired.call(this.rootScope, {
        roomId: state.room.id,
        bulletId: bullet.bulletId,
        playerId: '/#' + window.socket.id,
        weaponId: this.meta.id,
        x,
        y,
        pointerAngle,
        bulletSpeed: this.bulletSpeed,
        height: bullet.height,
        width: bullet.width,
        damage: this.damage
    })
}
