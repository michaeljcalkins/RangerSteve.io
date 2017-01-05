import GameConsts from 'lib/GameConsts'

export default function() {
  RS.rpgExplosions = this.game.add.group()
  RS.rpgExplosions.createMultiple(20, 'rpgExplosion')
  RS.rpgExplosions.forEach(rpgExplosion => rpgExplosion.animations.add('collision'))

  RS.ricochets = this.game.add.group()
  RS.ricochets.createMultiple(200, 'ricochet')
  RS.ricochets.forEach(ricochet => ricochet.animations.add('collision'))

  RS.bloodSprays = this.game.add.group()
  RS.bloodSprays.createMultiple(200, 'blood')
  RS.bloodSprays.forEach(bloodSpray => bloodSpray.animations.add('spray'))

  RS.playerDeaths = this.game.add.group()
  RS.playerDeaths.createMultiple(20, 'player-death')
  RS.playerDeaths.forEach(playerDeath => playerDeath.animations.add('death'))

  RS.bullets = this.game.add.group()
  RS.bullets.createMultiple(200, 'bullet')
  RS.bullets.setAll('checkWorldBounds', true)
  RS.bullets.setAll('outOfBoundsKill', true)

  this.game.physics.arcade.enable(RS.bullets)
  this.game.slopes.enable(RS.bullets)
  RS.bullets.forEach(function(bullet) {
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

  RS.enemyBullets = this.game.add.group()
  RS.enemyBullets.enableBody = true
  RS.enemyBullets.createMultiple(200, 'bullet')
  RS.enemyBullets.setAll('checkWorldBounds', true)
  RS.enemyBullets.setAll('outOfBoundsKill', true)

  this.game.physics.arcade.enable(RS.enemyBullets)
  RS.enemyBullets.forEach(function(bullet) {
    bullet.body.height = 15
    bullet.body.width = 15
    bullet.height = 2
    bullet.width = 40
  }, this)
  this.game.slopes.enable(RS.enemyBullets)
}
