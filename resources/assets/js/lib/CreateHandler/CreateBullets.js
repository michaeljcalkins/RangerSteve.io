import GameConsts from '../GameConsts.js'

export default function() {
    RangerSteve.rpgExplosions = this.game.add.group()
    RangerSteve.rpgExplosions.createMultiple(20, 'rpgExplosion')
    RangerSteve.rpgExplosions.forEach(rpgExplosion => rpgExplosion.animations.add('collision'))

    RangerSteve.ricochets = this.game.add.group()
    RangerSteve.ricochets.createMultiple(200, 'ricochet')
    RangerSteve.ricochets.forEach(ricochet => ricochet.animations.add('collision'))

    RangerSteve.bloodSprays = this.game.add.group()
    RangerSteve.bloodSprays.createMultiple(200, 'blood')
    RangerSteve.bloodSprays.forEach(bloodSpray => bloodSpray.animations.add('spray'))

    RangerSteve.playerDeaths = this.game.add.group()
    RangerSteve.playerDeaths.createMultiple(20, 'player-death')
    RangerSteve.playerDeaths.forEach(playerDeath => playerDeath.animations.add('death'))

    RangerSteve.bullets = this.game.add.group()
    RangerSteve.bullets.createMultiple(200, 'bullet')
    RangerSteve.bullets.setAll('checkWorldBounds', true)
    RangerSteve.bullets.setAll('outOfBoundsKill', true)

    this.game.physics.arcade.enable(RangerSteve.bullets)
    this.game.slopes.enable(RangerSteve.bullets)
    RangerSteve.bullets.forEach(function(bullet) {
        bullet.body.height = 15
        bullet.body.width = 15
        bullet.height = 2
        bullet.width = 40

        // Define some shortcuts to some useful objects
        var body = bullet.body

        // Update player body properties
        body.drag.x = 0
        body.drag.y = 0
        body.bounce.x = 0
        body.bounce.y = 0
        body.gravity.y = GameConsts.BULLET_GRAVITY

        // Update player body Arcade Slopes properties
        body.slopes.friction.x = 0
        body.slopes.friction.y = 0
        body.slopes.preferY    = GameConsts.SLOPE_FEATURES.minimumOffsetY
    }, this)

    RangerSteve.enemyBullets = this.game.add.group()
    RangerSteve.enemyBullets.enableBody = true
    RangerSteve.enemyBullets.createMultiple(200, 'bullet')
    RangerSteve.enemyBullets.setAll('checkWorldBounds', true)
    RangerSteve.enemyBullets.setAll('outOfBoundsKill', true)

    this.game.physics.arcade.enable(RangerSteve.enemyBullets)
    RangerSteve.enemyBullets.forEach(function(bullet) {
        bullet.body.height = 15
        bullet.body.width = 15
        bullet.height = 2
        bullet.width = 40
    }, this)
    this.game.slopes.enable(RangerSteve.enemyBullets)
}
