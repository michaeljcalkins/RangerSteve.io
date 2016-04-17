import FireShotgunShell from '../FireShotgunShell'

export default class M500 extends Phaser.Group {
    constructor(rootScope) {
        super(rootScope)

        this.rootScope = rootScope

        Phaser.Group.call(this, this.rootScope.game, this.rootScope.game.world, 'M500', false, true, Phaser.Physics.ARCADE)

        this.bulletHeight = 2
        this.bulletSpeed = 1900
        this.bulletWidth = 40
        this.fireRate = 1650
        this.fx = this.rootScope.game.add.audio('M500-sound')
        this.nextFire = 0
    }

    fire() {
        if (this.rootScope.game.time.now < this.nextFire || this.rootScope.bullets.countDead() <= 0)
            return

        this.nextFire = this.rootScope.game.time.now + this.fireRate

        FireShotgunShell.call(this)
    }
}
