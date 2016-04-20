import FireStandardBullet from '../FireStandardBullet'

export default class AK47 extends Phaser.Group {
    constructor(rootScope) {
        super(rootScope)

        this.muzzleFlashHandler = null
        this.rootScope = rootScope

        Phaser.Group.call(this, this.rootScope.game, this.rootScope.game.world, 'AK-47', false, true, Phaser.Physics.ARCADE)

        this.meta = {
            rotation: 80.20,
            scale: 1.3,
            spriteX: 12,
            spriteY: 19
        }
        this.bulletHeight = 2
        this.bulletSpeed = 2300
        this.bulletWidth = 40
        this.damage = 22
        this.fireRate = 160
        this.fx = this.rootScope.game.add.audio('AK47-sound')
        this.nextFire = 0
    }

    fire() {
        if (this.rootScope.game.time.now < this.nextFire || this.rootScope.bullets.countDead() <= 0)
            return

        this.rootScope.muzzleFlash.visible = true
        clearTimeout(this.muzzleFlashHandler)
        this.muzzleFlashHandler = setTimeout(() => {
            this.rootScope.muzzleFlash.visible = false
        }, 80)

        this.nextFire = this.rootScope.game.time.now + this.fireRate
        FireStandardBullet.call(this)
    }
}
