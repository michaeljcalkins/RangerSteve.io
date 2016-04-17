import FireStandardBullet from '../FireStandardBullet'

export default class Skorpion extends Phaser.Group {
    constructor(rootScope) {
        super(rootScope)

        this.rootScope = rootScope

        Phaser.Group.call(this, this.rootScope.game, this.rootScope.game.world, 'Skorpion', false, true, Phaser.Physics.ARCADE)

        this.bulletHeight = 2
        this.bulletSpeed = 2300
        this.bulletWidth = 40
        this.damage = 22
        this.fireRate = 120
        this.fx = this.rootScope.game.add.audio('Skorpion-sound')
        this.nextFire = 0
    }

    fire() {
        if (this.rootScope.game.time.now < this.nextFire || this.rootScope.bullets.countDead() <= 0)
            return

        this.nextFire = this.rootScope.game.time.now + this.fireRate

        FireStandardBullet.call(this)
    }
}
