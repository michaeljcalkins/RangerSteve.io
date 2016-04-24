import emitBulletRemoved from './SocketEvents/emitBulletRemoved'
import emitPlayerDamaged from './SocketEvents/emitPlayerDamaged'

export default function CollisionHandler() {
    // Collide this player with the map
    this.physics.arcade.collide(this.player, this.platforms, null, null, this)

    // Did this player's bullets hit any platforms
    this.physics.arcade.collide(this.platforms, this.bullets, (platform, bullet) => {
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
    this.physics.arcade.overlap(this.platforms, this.enemyBullets, (platform, bullet) => {
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

    this.physics.arcade.overlap(this.bullets, this.enemies, (bullet, player) => {
        bullet.kill()
        console.log('your bullet collided with an enemy')
    })

    // Did this player get hit by any enemy bullets
    this.physics.arcade.overlap(this.player, this.enemyBullets, (player, bullet) => {
        bullet.kill()

        emitBulletRemoved.call(this, {
            roomId: this.roomId,
            bulletId: bullet.bulletId
        })

        emitPlayerDamaged.call(this, {
            roomId: this.roomId,
            damage: bullet.damage,
            damagedPlayerId: '/#' + this.socket.id,
            attackingPlayerId: bullet.playerId
        })
    })
}
