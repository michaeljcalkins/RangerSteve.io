import FireStandardBullet from '../FireStandardBullet'

export default class M4A1 extends Phaser.Group {
    constructor(rootScope) {
        super(rootScope)

        this.rootScope = rootScope

        Phaser.Group.call(this, this.rootScope.game, this.rootScope.game.world, 'M4A1', false, true, Phaser.Physics.ARCADE)

        this.meta = {
            rotation: 80.06,
            scale: 1.4,
            spriteX: 120,
            spriteY: 209
        }
        this.bulletHeight = 2
        this.bulletSpeed = 2400
        this.bulletWidth = 40
        this.damage = 20
        this.fireRate = 150
        this.fx = this.rootScope.game.add.audio('M4A1-sound')
        this.nextFire = 0
    }

    fire() {
        if (this.rootScope.game.time.now < this.nextFire || this.rootScope.bullets.countDead() <= 0)
            return

        this.nextFire = this.rootScope.game.time.now + this.fireRate

        FireStandardBullet.call(this)
    }
}
