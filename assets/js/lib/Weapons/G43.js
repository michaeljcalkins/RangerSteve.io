import FireStandardBullet from '../FireStandardBullet'

export default class G43 extends Phaser.Group {
    constructor(rootScope) {
        super(rootScope)

        this.rootScope = rootScope

        Phaser.Group.call(this, this.rootScope.game, this.rootScope.game.world, 'G43', false, true, Phaser.Physics.ARCADE)

        this.meta = {
            rotation: 80.15,
            scale: 1.3,
            spriteX: 12,
            spriteY: 19
        }
        this.bulletHeight = 2
        this.bulletSpeed = 2300
        this.bulletWidth = 40
        this.damage = 44
        this.fireRate = 1300
        this.fx = this.rootScope.game.add.audio('G43-sound')
        this.nextFire = 0
    }

    fire() {
        if (this.rootScope.game.time.now < this.nextFire || this.rootScope.bullets.countDead() <= 0)
            return

        this.nextFire = this.rootScope.game.time.now + this.fireRate

        FireStandardBullet.call(this)
    }
}
