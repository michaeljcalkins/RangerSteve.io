import Guid from '../Guid'
import Bullet from '../Bullet'

export default class Barrett extends Phaser.Group {
    constructor(config) {
        super()

        Phaser.Group.call(this, config.game, config.game.world, 'Barret', false, true, Phaser.Physics.ARCADE);

        this.fx = config.game.add.audio('BarretM90-sound') 
        this.allowMultiple = true

        this.name = 'Barret M90'
        this.damage = 88
        this.nextFire = 0
        this.bulletSpeed = 3435
        this.fireRate = 3000

        for (var i = 0; i < 64; i++)
        {
            let bullet = new Bullet(config.game, 'bullet12', config.socket)
            bullet.bulletId = Guid()
            bullet.height = 2
            bullet.width = 40
            bullet.damage = 88

            this.add(bullet, true)
        }
    }

    fire(player, socket, roomId) {
        if (this.game.time.time < this.nextFire)
            return

        var x = player.x + 15;
        var y = player.y + 30;

        this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0, socket, roomId)
        this.setAll('tracking', true)

        this.nextFire = this.game.time.time + this.fireRate
        this.fx.volume = .6
        this.fx.play()
    }
}
