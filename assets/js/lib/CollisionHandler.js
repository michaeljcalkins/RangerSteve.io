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

    this.physics.arcade.overlap(this.bullets, this.enemies, (bullet) => {
        bullet.kill()
    })

    // Did this player get hit by any enemy bullets
    this.physics.arcade.overlap(this.player, this.enemyBullets, (player, bullet) => {
        bullet.kill()

        let bloodY = bullet.y
        let bloodX = player.x
        let bloodRotation = 0
        bloodRotation = bullet.rotation
        if (player.x > bullet.x) {
            console.log('left side')
            bloodX += 10
            bloodY -= 25
        } else {
            console.log('right side')
            bloodX -= 10
            bloodY += 25
        }

        let blood = this.add.sprite(bloodX, bloodY, 'blood')
        blood.scale.setTo(.17)
        blood.rotation = bloodRotation
        blood.animations.add('spray', [0,1,2,3,4,5,6,7,8,9,10,11,12,13], 45, false, true)
        blood.animations.play('spray')
        blood.animations.currentAnim.killOnComplete = true

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
