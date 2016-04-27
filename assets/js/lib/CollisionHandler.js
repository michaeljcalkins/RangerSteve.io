import emitBulletRemoved from './SocketEvents/emitBulletRemoved'
import emitPlayerDamaged from './SocketEvents/emitPlayerDamaged'
import SprayBlood from './SprayBlood'

export default function CollisionHandler() {
    // Collide this player with the map
    this.physics.arcade.collide(this.player, this.platforms)

    // Did this player's bullets hit any platforms
    this.physics.arcade.overlap(this.platforms, this.bullets, function(platform, bullet) {
        let lastKnownX = bullet.x
        let lastKnownY = bullet.y

        bullet.kill()

        let ricochet = this.add.sprite(lastKnownX, lastKnownY - 15, 'ricochet')
        ricochet.scale.setTo(.17)
        ricochet.animations.add('collision', [0,1,2,3,4,5], 45, false, true)
        ricochet.animations.play('collision')
        ricochet.animations.currentAnim.killOnComplete = true

        emitBulletRemoved.call(this, {
            roomId: this.roomId,
            bulletId: bullet.bulletId
        })
    }, null, this)

    // Did enemy bullets hit any platforms
    this.physics.arcade.overlap(this.enemyBullets, this.platforms, function(bullet) {
        bullet.kill()

        let ricochet = this.add.sprite(bullet.x, bullet.y - 15, 'ricochet')
        ricochet.scale.setTo(.17)
        ricochet.animations.add('collision', [0,1,2,3,4,5], 45, false, true)
        ricochet.animations.play('collision')
        ricochet.animations.currentAnim.killOnComplete = true

        emitBulletRemoved.call(this, {
            roomId: this.roomId,
            bulletId: bullet.bulletId
        })
    }, null, this)

    this.physics.arcade.overlap(this.bullets, this.enemies, function(bullet) {
        bullet.kill()
    })

    // Did this player get hit by any enemy bullets
    this.physics.arcade.overlap(this.player, this.enemyBullets, (player, bullet) => {
        if (this.respawnInProgress) return

        bullet.kill()

        SprayBlood.call(this, {
            bulletY: bullet.y,
            bulletX: bullet.x,
            playerX: player.x,
            bulletRotation: bullet.rotation
        })

        emitBulletRemoved.call(this, {
            roomId: this.roomId,
            bulletId: bullet.bulletId,
            hasDamagedPlayer: true,
            bulletX: bullet.x,
            bulletY: bullet.y,
            playerX: player.x,
            playerY: player.y,
            bulletRotation: bullet.rotation
        })

        emitPlayerDamaged.call(this, {
            roomId: this.roomId,
            damage: bullet.damage,
            damagedPlayerId: '/#' + this.socket.id,
            attackingPlayerId: bullet.playerId
        })
    })
}
