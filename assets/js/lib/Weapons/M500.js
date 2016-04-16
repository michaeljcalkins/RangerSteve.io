import Guid from '../Guid'
import Bullet from '../Bullet'

export default class M500 extends Phaser.Group {
    constructor(config) {
        super()

        Phaser.Group.call(this, config.game, config.game.world, 'M500', false, true, Phaser.Physics.ARCADE)

        this.fx = config.game.add.audio('M500-sound')

        this.nextFire = 0
        this.bulletSpeed = 1900
        this.fireRate = 1650

        for (var i = 0; i < 32; i++)
        {
            let bullet = new Bullet(config.game, 'bullet12', config.socket)
            bullet.bulletId = Guid()
            bullet.height = 2
            bullet.width = 40
            bullet.damage = 22
            this.add(bullet, true)
        }
    }

    fire(player, socket, roomId, volume) {
        if (this.game.time.time < this.nextFire)
            return

        var x = player.x + 15
        var y = player.y + 30



        var bulletInstance = this.getFirstExists(false)
        if (!bulletInstance) return
        bulletInstance.fire(x, y, .3, this.bulletSpeed, 0, 0, socket, roomId)




        bulletInstance = this.getFirstExists(false)
        if (!bulletInstance) return
        bulletInstance.fire(x, y, -0.3, this.bulletSpeed, 0, 0, socket, roomId)



        bulletInstance = this.getFirstExists(false)
        if (!bulletInstance) return
        bulletInstance.fire(x, y, 0, this.bulletSpeed, 0, 0, socket, roomId)





        bulletInstance = this.getFirstExists(false)
        if (!bulletInstance) return
        bulletInstance.fire(x, y, 0, this.bulletSpeed, 0, 0, socket, roomId)




        this.setAll('tracking', true)

        this.nextFire = this.game.time.time + this.fireRate
        this.fx.volume = .3 * volume
        this.fx.play()
    }
}
