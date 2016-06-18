import FireRocket from '../FireRocket'

export default class RPG extends Phaser.Group {
    constructor(rootScope) {
        super(rootScope)

        this.muzzleFlashHandler = null
        this.rootScope = rootScope

        Phaser.Group.call(this, this.rootScope.game, this.rootScope.game.world, 'RPG', false, true, Phaser.Physics.ARCADE)

        this.meta = {
            id: 'RPG',
            rotation: 80.20,
            scale: 1.3,

            leftFaceX: 33,
            leftFaceY: 90,

            rightFaceX: -50,
            rightFaceY: 90,

            muzzleFlashX: 102,
            muzzleFlashY: -72
        }
        this.bulletHeight = 7
        this.bulletSpeed = 2000
        this.bulletWidth = 40
        this.damage = 100
        this.fireRate = 8000
        this.fx = this.rootScope.game.add.audio('RPG-sound')
        this.nextFire = 0
    }

    fire() {
        if (this.rootScope.game.time.now < this.nextFire || this.rootScope.bullets.countDead() <= 0)
            return

        this.rootScope.camera.shake(0.01, 100, true)
        this.rootScope.muzzleFlash.visible = true
        clearTimeout(this.muzzleFlashHandler)
        this.muzzleFlashHandler = setTimeout(() => {
            this.rootScope.muzzleFlash.visible = false
        }, 80)

        this.nextFire = this.rootScope.game.time.now + this.fireRate
        FireRocket.call(this)
    }
}
