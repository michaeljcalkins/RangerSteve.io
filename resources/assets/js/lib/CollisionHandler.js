import emitPlayerDamaged from './SocketEvents/emitPlayerDamaged'
import SprayBlood from './SprayBlood'

export default function CollisionHandler() {
    this.physics.arcade.collide(this.player, this.platforms)
    this.physics.arcade.collide(this.player, this.groundSprite, () => {
        if (this.player.meta.health <= 0 || this.player.y < 3900) return

        this.game.input.enabled = false
        this.player.body.acceleration.x = 0
        this.player.body.acceleration.y = 0
        this.player.meta.health = 0
        this.leftArmGroup.visible = false
        this.rightArmGroup.visible = false
        this.headGroup.visible = false
        this.torsoGroup.visible = false

        this.socket.emit('player damaged', {
            roomId: this.roomId,
            damage: 1000,
            damagedPlayerId: '/#' + this.socket.id,
            attackingPlayerId: null
        })

        this.player.animations.play('death')
    })

    // Did your bullets hit any enemies
    this.physics.arcade.overlap(this.enemies, this.bullets, function(enemy, bullet) {
        bullet.kill()

        SprayBlood.call(this, {
            bulletY: bullet.y,
            bulletX: bullet.x,
            playerX: enemy.x,
            bulletRotation: bullet.rotation
        })
    }, null, this)

    // Did your bullets hit any platforms
    this.physics.arcade.overlap(this.platforms, this.bullets, function(platform, bullet) {
        let lastKnownX = bullet.x
        let lastKnownY = bullet.y

        bullet.kill()

        let ricochet = this.add.sprite(lastKnownX, lastKnownY - 15, 'ricochet')
        ricochet.scale.setTo(.17)
        ricochet.animations.add('collision', [0,1,2,3,4,5], 45, false, true)
        ricochet.animations.play('collision')
        ricochet.animations.currentAnim.killOnComplete = true
    }, null, this)

    // Did enemy bullets hit any platforms
    this.physics.arcade.overlap(this.enemyBullets, this.platforms, function(bullet) {
        bullet.kill()

        let ricochet = this.add.sprite(bullet.x, bullet.y - 15, 'ricochet')
        ricochet.scale.setTo(.17)
        ricochet.animations.add('collision', [0,1,2,3,4,5], 45, false, true)
        ricochet.animations.play('collision')
        ricochet.animations.currentAnim.killOnComplete = true
    }, null, this)

    // Did enemy bullets hit you
    this.physics.arcade.overlap(this.player, this.enemyBullets, (player, bullet) => {
        if (! bullet.weaponId || ! this.socket.id) return

        bullet.kill()

        SprayBlood.call(this, {
            bulletY: bullet.y,
            bulletX: bullet.x,
            playerX: player.x,
            bulletRotation: bullet.rotation
        })

        emitPlayerDamaged.call(this, {
            roomId: this.roomId,
            damage: bullet.damage,
            weaponId: bullet.weaponId,
            damagedPlayerId: '/#' + this.socket.id,
            attackingPlayerId: bullet.playerId
        })
    })
}
