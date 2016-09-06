import FireShotgunShell from '../FireShotgunShell'

export default class M500 extends Phaser.Group {
    constructor(rootScope) {
        super(rootScope)

        this.muzzleFlashHandler = null
        this.rootScope = rootScope

        Phaser.Group.call(this, this.rootScope.game, this.rootScope.game.world, 'M500', false, true, Phaser.Physics.ARCADE)

        this.meta = {
            id: 'M500',
            rotation: 80.20,
            scale: 1.4,

            leftFaceX: -19,
            leftFaceY: 34,

            rightFaceX: 1,
            rightFaceY: 24,

            muzzleFlashX: 102,
            muzzleFlashY: -72
        }
        this.bulletHeight = 2
        this.bulletSpeed = 2300
        this.bulletWidth = 30
        this.damage = 25
        this.fireRate = 1400
        this.fx = this.rootScope.game.add.audio('M500-sound')
        this.nextFire = 0
    }

    fire() {
        if (this.rootScope.game.time.now < this.nextFire || this.rootScope.bullets.countDead() <= 0)
            return

        this.rootScope.camera.shake(0.002, 100, true)
        this.rootScope.muzzleFlash.visible = true
        clearTimeout(this.muzzleFlashHandler)
        this.muzzleFlashHandler = setTimeout(() => {
            this.rootScope.muzzleFlash.visible = false
        }, 80)

        this.nextFire = this.rootScope.game.time.now + this.fireRate
        FireShotgunShell.call(this)
    }
}
