import Guid from '../Guid'
import Bullet from '../Bullet'

export default class DesertEagle extends Phaser.Group {
    constructor(rootScope) {
        super(rootScope)

        Phaser.Group.call(this, rootScope.game, rootScope.game.world, 'Desert Eagle', false, true, Phaser.Physics.ARCADE)

        this.rootScope = rootScope
        this.fx = rootScope.game.add.audio('DesertEagle-sound')
        this.allowMultiple = true
        this.damage = 33
        this.nextFire = 0
        this.bulletSpeed = 2300
        this.fireRate = 267;

        for (var i = 0; i < 64; i++)
        {
            let bullet = new Bullet(this.rootScope)
            bullet.bulletId = Guid()
            bullet.height = 2
            bullet.width = 40
            bullet.damage = 22
            this.add(bullet, true);
        }
    }

    fire(player, socket, roomId, volume) {
        if (this.rootScope.game.time.time < this.nextFire)
            return

        var x = player.x + 15;
        var y = player.y + 30;

        this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0, socket, roomId)
        this.setAll('tracking', true)

        this.nextFire = this.game.time.time + this.fireRate
        this.fx.volume = .3 * volume
        this.fx.play()
    }
}
