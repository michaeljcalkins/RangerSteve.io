import FireStandardBullet from '../FireStandardBullet'

export default class AUG extends Phaser.Group {
    constructor(rootScope) {
        super(rootScope)

        this.rootScope = rootScope

        Phaser.Group.call(this, this.rootScope.game, this.rootScope.game.world, 'AUG', false, true, Phaser.Physics.ARCADE)

        this.meta = {
            rotation: 80.1,
            scale: 1.23,
            spriteX: 14,
            spriteY: 29
        }
        this.bulletHeight = 2
        this.bulletSpeed = 2300
        this.bulletWidth = 40
        this.damage = 22
        this.fireRate = 160
        this.fx = this.rootScope.game.add.audio('AUG-sound')
        this.nextFire = 0
    }

    fire() {
        if (this.rootScope.game.time.now < this.nextFire || this.rootScope.bullets.countDead() <= 0)
            return

        this.nextFire = this.rootScope.game.time.now + this.fireRate

        FireStandardBullet.call(this)
    }
}
