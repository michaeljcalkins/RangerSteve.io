import FireStandardBullet from '../FireStandardBullet'

export default class DesertEagle extends Phaser.Group {
    constructor(rootScope) {
        super(rootScope)

        this.muzzleFlashHandler = null
        this.rootScope = rootScope

        Phaser.Group.call(this, rootScope.game, rootScope.game.world, 'Desert Eagle', false, true, Phaser.Physics.ARCADE)

        this.meta = {
            id: 'DesertEagle',
            rotation: 80.15,
            scale: 1.3,

            leftFaceX: -12,
            leftFaceY: -20,

            rightFaceX: 9,
            rightFaceY: -29,

            muzzleFlashX: 5,
            muzzleFlashY: -75
        }
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

        this.rootScope.camera.shake(0.001, 100, true)
        this.rootScope.muzzleFlash.visible = true
        clearTimeout(this.muzzleFlashHandler)
        this.muzzleFlashHandler = setTimeout(() => {
            this.rootScope.muzzleFlash.visible = false
        }, 80)

        this.nextFire = this.rootScope.game.time.now + this.fireRate
        FireStandardBullet.call(this)
    }
}
