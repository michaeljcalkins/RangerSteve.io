import FireStandardBullet from '../FireStandardBullet'

export default class DesertEagle extends Phaser.Group {
    constructor(rootScope) {
        super(rootScope)

        this.rootScope = rootScope

        Phaser.Group.call(this, rootScope.game, rootScope.game.world, 'Desert Eagle', false, true, Phaser.Physics.ARCADE)

        this.bulletHeight = 2
        this.bulletSpeed = 2300
        this.bulletWidth = 40
        this.damage = 33
        this.fireRate = 267
        this.fx = rootScope.game.add.audio('DesertEagle-sound')
        this.nextFire = 0
    }

    fire() {
        if (this.rootScope.game.time.now < this.nextFire || this.rootScope.bullets.countDead() <= 0)
            return

        this.nextFire = this.rootScope.game.time.now + this.fireRate

        FireStandardBullet.call(this)
    }
}
