import GameConsts from '../GameConsts.js'

export default function() {
    this.bullets = this.game.add.group()
    this.bullets.createMultiple(30, 'bullet')
    this.bullets.setAll('checkWorldBounds', true)
    this.bullets.setAll('outOfBoundsKill', true)

    this.physics.arcade.enable(this.bullets)
    this.game.slopes.enable(this.bullets)
    this.bullets.forEach(function(bullet) {
        bullet.body.height = 15
        bullet.body.width = 15
        bullet.height = 2
        bullet.width = 40

        // Define some shortcuts to some useful objects
        var body = bullet.body

        // Update player body properties
        body.drag.x = GameConsts.SLOPE_FEATURES.dragX
        body.drag.y = GameConsts.SLOPE_FEATURES.dragY
        body.bounce.x = GameConsts.SLOPE_FEATURES.bounceX
        body.bounce.y = GameConsts.SLOPE_FEATURES.bounceY

        // Update player body Arcade Slopes properties
        body.slopes.friction.x = GameConsts.SLOPE_FEATURES.frictionX
        body.slopes.friction.y = GameConsts.SLOPE_FEATURES.frictionY
        body.slopes.preferY    = GameConsts.SLOPE_FEATURES.minimumOffsetY
        body.slopes.pullUp     = GameConsts.SLOPE_FEATURES.pullUp
        body.slopes.pullDown   = GameConsts.SLOPE_FEATURES.pullDown
        body.slopes.pullLeft   = GameConsts.SLOPE_FEATURES.pullLeft
        body.slopes.pullRight  = GameConsts.SLOPE_FEATURES.pullRight
        body.slopes.snapUp     = GameConsts.SLOPE_FEATURES.snapUp
        body.slopes.snapDown   = GameConsts.SLOPE_FEATURES.snapDown
        body.slopes.snapLeft   = GameConsts.SLOPE_FEATURES.snapLeft
        body.slopes.snapRight  = GameConsts.SLOPE_FEATURES.snapRight
    }, this)

    this.enemyBullets = this.game.add.group()
    this.enemyBullets.enableBody = true
    this.enemyBullets.createMultiple(30, 'bullet')
    this.enemyBullets.setAll('checkWorldBounds', true)
    this.enemyBullets.setAll('outOfBoundsKill', true)

    this.physics.arcade.enable(this.enemyBullets)
    this.enemyBullets.forEach(function(bullet) {
        bullet.body.height = 15
        bullet.body.width = 15
        bullet.height = 2
        bullet.width = 40
    }, this)
    this.game.slopes.enable(this.enemyBullets)
}
