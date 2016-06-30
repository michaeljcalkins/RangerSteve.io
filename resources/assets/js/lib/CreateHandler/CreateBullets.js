export default function() {
    this.bullets = this.game.add.group()
    this.bullets.createMultiple(30, 'bullet')
    this.bullets.setAll('checkWorldBounds', true)
    this.bullets.setAll('outOfBoundsKill', true)

    this.physics.arcade.enable(this.bullets)
    this.bullets.forEach(function(bullet) {
        bullet.body.height = 60
        bullet.body.width = 20
        bullet.height = 60
        bullet.width = 20
        // Add a touch of tile padding for the collision detection
        bullet.body.tilePadding.x = 10
        bullet.body.tilePadding.y = 10
    }, this)
    this.game.slopes.enable(this.bullets)

    this.enemyBullets = this.game.add.group()
    this.enemyBullets.enableBody = true
    this.enemyBullets.createMultiple(50, 'bullet')
    this.enemyBullets.setAll('checkWorldBounds', true)
    this.enemyBullets.setAll('outOfBoundsKill', true)
}
