import Guid from '../Guid'
import Bullet from '../Bullet'

export default class AK47 extends Phaser.Group {
    constructor(rootScope) {
        super(rootScope)

        this.rootScope = rootScope

        Phaser.Group.call(this, this.rootScope.game, this.rootScope.game.world, 'AK-47', false, true, Phaser.Physics.ARCADE)

        this.fx = this.rootScope.game.add.audio('AK47-sound')
        this.allowMultiple = true
        this.damage = 22
        this.nextFire = 0
        this.bulletSpeed = 2300
        this.fireRate = 160
    }

    fire(player, socket, roomId, volume) {
        if (this.rootScope.game.time.now > this.nextFire && this.rootScope.bullets.countDead() > 0) {
            let x = player.x
            let y = player.y

            this.nextFire = this.rootScope.game.time.now + this.fireRate
            let bullet = this.rootScope.bullets.getFirstDead()
            bullet.body.gravity.y = -1800
            bullet.reset(x, y)
            let pointerAngle = this.rootScope.game.physics.arcade.moveToPointer(bullet, this.bulletSpeed)
            bullet.rotation = pointerAngle
            this.fx.volume = .3 * volume
            this.fx.play()

            socket.emit('bullet fired', {
                roomId: roomId,
                bulletId: this.bulletId,
                playerId: '/#' + socket.id,
                x,
                y,
                pointerAngle,
                bulletSpeed: this.bulletSpeed,
                height: this.height,
                width: this.width,
                damage: this.damage
            })
        }
    }
}
