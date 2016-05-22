import FireStandardBullet from '../FireStandardBullet'

export default class G43 extends Phaser.Group {
    constructor(rootScope) {
        super(rootScope)

        this.muzzleFlashHandler = null
        this.rootScope = rootScope

        Phaser.Group.call(this, this.rootScope.game, this.rootScope.game.world, 'G43', false, true, Phaser.Physics.ARCADE)

        this.meta = {
            id: 'G43',
            rotation: 80.20,
            scale: 1.3,

            leftFaceX: -7,
            leftFaceY: 30,

            rightFaceX: -7,
            rightFaceY: 19,

            muzzleFlashX: 102,
            muzzleFlashY: -72
        }
        this.bulletHeight = 2
        this.bulletSpeed = 2500
        this.bulletWidth = 40
        this.damage = 42
        this.fireRate = 800
        this.fx = this.rootScope.game.add.audio('G43-sound')
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
