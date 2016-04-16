import Guid from '../Guid'
import Bullet from '../Bullet'

export default class AK47 extends Phaser.Group {
    constructor(config) {
        super()
        // Object.keys(Phaser.Group.prototype).forEach((key) => {
        //     this[key] = Phaser.Group.prototype[key]
        // })

        Phaser.Group.call(config.rootScope, config.game, config.game.world, 'AK-47', false, true, Phaser.Physics.ARCADE);

        this.fx = config.game.add.audio('AK47-sound')
        this.allowMultiple = true
        this.damage = 22
        this.nextFire = 0
        this.bulletSpeed = 2300
        this.fireRate = 160

        for (var i = 0; i < 64; i++)
        {
            let bullet = new Bullet(config.game, 'bullet12', config.socket)
            bullet.bulletId = Guid()
            bullet.height = 3
            bullet.width = 60
            bullet.damage = 22
            this.add(bullet, true)
        }
    }

    fire(player, socket, roomId, volume) {
        if (this.game.time.time < this.nextFire)
            return

        var x = player.x + 10
        var y = player.y + -10

        this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0, socket, roomId)
        this.setAll('tracking', true)

        this.nextFire = this.game.time.time + this.fireRate
        this.fx.volume = .3 * volume
        this.fx.play()
    }
}
