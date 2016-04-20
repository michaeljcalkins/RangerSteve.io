import FireStandardBullet from '../FireStandardBullet'

export default class Barrett extends Phaser.Group {
    constructor(rootScope) {
        super(rootScope)

        this.rootScope = rootScope

        Phaser.Group.call(this, this.rootScope.game, this.rootScope.game.world, 'AK-47', false, true, Phaser.Physics.ARCADE)

        this.meta = {
            rotation: 80.06,
            scale: 1.3,
            spriteX: 12,
            spriteY: 19
        }
        this.bulletHeight = 2
        this.bulletSpeed = 3435
        this.bulletWidth = 40
        this.damage = 88
        this.fireRate = 3000
        this.fx = this.rootScope.game.add.audio('BarretM90-sound')
        this.nextFire = 0
    }

    fire() {
        if (this.rootScope.game.time.now < this.nextFire || this.rootScope.bullets.countDead() <= 0)
            return

        this.nextFire = this.rootScope.game.time.now + this.fireRate

        FireStandardBullet.call(this)
    }
}
