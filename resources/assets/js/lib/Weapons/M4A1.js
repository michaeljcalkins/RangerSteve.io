import FireStandardBullet from '../FireStandardBullet'

export default class M4A1 extends Phaser.Group {
    constructor(rootScope) {
        super(rootScope)

        this.muzzleFlashHandler = null
        this.rootScope = rootScope

        Phaser.Group.call(this, this.rootScope.game, this.rootScope.game.world, 'M4A1', false, true, Phaser.Physics.ARCADE)

        this.meta = {
            id: 'M4A1',
            rotation: 80.06,
            scale: 1.4,

            leftFaceX: -7,
            leftFaceY: 30,

            rightFaceX: -7,
            rightFaceY: 19,

            muzzleFlashX: 102,
            muzzleFlashY: -72
        }
        this.bulletHeight = 2
        this.bulletSpeed = 2400
        this.bulletWidth = 40
        this.damage = 18
        this.fireRate = 150
        this.fx = this.rootScope.game.add.audio('M4A1-sound')
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
