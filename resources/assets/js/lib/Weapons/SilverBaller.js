import FireStandardBullet from '../FireStandardBullet'

export default class SilverBaller extends Phaser.Group {
    constructor(rootScope) {
        super(rootScope)

        this.muzzleFlashHandler = null
        this.rootScope = rootScope

        Phaser.Group.call(this, rootScope.game, rootScope.game.world, 'SilverBaller', false, true, Phaser.Physics.ARCADE)

        this.meta = {
            id: 'SilverBaller',
            rotation: 80.15,
            scale: 1.4,

            leftFaceX: -12,
            leftFaceY: -20,

            rightFaceX: 9,
            rightFaceY: -29,

            muzzleFlashX: 35,
            muzzleFlashY: -80
        }
        this.bulletHeight = 2
        this.bulletSpeed = 2300
        this.bulletWidth = 40
        this.bulletAlpha = 0
        this.damage = 32
        this.fireRate = 250
        this.fx = rootScope.game.add.audio('SilverBaller-sound')
        this.nextFire = 0
    }

    fire() {
        if (this.rootScope.game.time.now < this.nextFire || this.rootScope.bullets.countDead() <= 0)
            return

        this.rootScope.camera.shake(0.0015, 100, true)
        this.rootScope.muzzleFlash.visible = true
        clearTimeout(this.muzzleFlashHandler)
        this.muzzleFlashHandler = setTimeout(() => {
            this.rootScope.muzzleFlash.visible = false
        }, 80)

        this.nextFire = this.rootScope.game.time.now + this.fireRate
        FireStandardBullet.call(this)
    }
}
