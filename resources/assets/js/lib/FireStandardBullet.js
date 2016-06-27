import Guid from './Guid'
import emitBulletFired from './SocketEvents/emitBulletFired'

export default function FireStandardBullet() {
    const state = this.rootScope.game.store.getState()

    let x = this.rootScope.player.x
    let y = this.rootScope.player.y - 10


    let bullet = this.rootScope.bullets.getFirstDead()

    // Define some shortcuts to some useful objects
    var body = bullet.body
    var features = this.rootScope.features

    // Update player body properties
    body.drag.x = features.dragX
    body.drag.y = features.dragY
    body.bounce.x = features.bounceX
    body.bounce.y = features.bounceY

    // Update player body Arcade Slopes properties
    body.slopes.friction.x = features.frictionX
    body.slopes.friction.y = features.frictionY
    body.slopes.preferY    = features.minimumOffsetY;
    body.slopes.pullUp     = features.pullUp;
    body.slopes.pullDown   = features.pullDown;
    body.slopes.pullLeft   = features.pullLeft;
    body.slopes.pullRight  = features.pullRight;
    body.slopes.snapUp     = features.snapUp;
    body.slopes.snapDown   = features.snapDown;
    body.slopes.snapLeft   = features.snapLeft;
    body.slopes.snapRight  = features.snapRight;


    bullet.bulletId = Guid()
    bullet.damage = this.damage
    bullet.weaponId = this.meta.id
    bullet.height = this.bulletHeight
    bullet.width = this.bulletWidth
    bullet.alpha = 0
    bullet.body.gravity.y = -1800

    // Add a touch of tile padding for the collision detection
    bullet.body.tilePadding.x = 50
    bullet.body.tilePadding.y = 1

    bullet.reset(x, y)
    let pointerAngle = this.rootScope.game.physics.arcade.moveToPointer(bullet, this.bulletSpeed)
    bullet.rotation = pointerAngle

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
