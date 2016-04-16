import Guid from '../Guid'
import Bullet from '../Bullet'

export default class AUG extends Phaser.group {
    constructor (config) {
        super()

        Phaser.Group.call(config.rootScope, config.game, config.game.world, 'AK-47', false, true, Phaser.Physics.ARCADE);

        //	Here we set-up our audio sprite
        this.fx = config.game.add.audio('AUG-sound')
        this.allowMultiple = true

        this.damage = 22
        this.nextFire = 0
        this.bulletSpeed = 2300
        this.fireRate = 160;

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

    fire(player, socket, roomId, volume) {
        if (this.game.time.time < this.nextFire)
            return

        var x = player.x + 15;
        var y = player.y + 30;

        this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0, socket, roomId)
        this.setAll('tracking', true)

        this.nextFire = this.game.time.time + this.fireRate
        this.fx.volume = .7 * volume
        this.fx.play()
    }
}
