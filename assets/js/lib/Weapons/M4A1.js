import Guid from '../Guid'
import Bullet from '../Bullet'

export default class M4A1 extends Phaser.Group {
    constructor(config) {
        super()

        Phaser.Group.call(this, config.game, config.game.world, 'M4A1', false, true, Phaser.Physics.ARCADE);

        //	Here we set-up our audio sprite
        this.fx = config.game.add.audio('M4A1-sound')
        this.allowMultiple = true

        this.damage = 20
        this.nextFire = 0
        this.bulletSpeed = 2400
        this.fireRate = 150;

        for (var i = 0; i < 64; i++)
        {
            let bullet = new Bullet(config.game, 'bullet12', config.socket)
            bullet.bulletId = Guid()
            bullet.height = 2
            bullet.width = 40
            bullet.damage = 22
            this.add(bullet, true);
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
        this.fx.volume = .3
        this.fx.play()
    }
}
