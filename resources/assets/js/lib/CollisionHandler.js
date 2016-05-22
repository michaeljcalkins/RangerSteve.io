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

        emitPlayerDamaged.call(this, {
            roomId: this.roomId,
            damage: 1000,
            damagedPlayerId: '/#' + this.socket.id,
            attackingPlayerId: null
        })

        this.player.animations.play('death')
    })

    // Did enemy bullets hit you
    this.physics.arcade.overlap(this.player, this.enemyBullets, (player, bullet) => {
        if (! bullet.weaponId || ! this.socket.id || this.player.meta.health <= 0) return

        bullet.kill()

        SprayBlood.call(this, {
            bulletY: bullet.y,
            bulletX: bullet.x,
            playerX: player.x,
            bulletRotation: bullet.rotation
        })

        if (bullet.weaponId === 'RPG') {
            let ricochet = this.add.sprite(bullet.x, bullet.y - 50, 'rocket')
            ricochet.scale.setTo(.5, .5)
            ricochet.anchor.setTo(.5, .5)
            ricochet.animations.add('collision', [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14], 17, false, true)
            ricochet.animations.play('collision')
            ricochet.animations.currentAnim.killOnComplete = true
        }
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

        if (bullet.weaponId === 'RPG') {
            let ricochet = this.add.sprite(bullet.x, bullet.y - 50, 'rocket')
            ricochet.scale.setTo(.5, .5)
            ricochet.anchor.setTo(.5, .5)
            ricochet.animations.add('collision', [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14], 17, false, true)
            ricochet.animations.play('collision')
            ricochet.animations.currentAnim.killOnComplete = true
        }

        emitPlayerDamaged.call(this, {
            roomId: this.roomId,
            damage: bullet.damage,
            weaponId: bullet.weaponId,
            damagedPlayerId: enemy.id,
            attackingPlayerId: '/#' + this.socket.id
        })
    }, null, this)

    // Did your bullets hit any platforms
    this.physics.arcade.overlap(this.platforms, this.bullets, function(platform, bullet) {
        bullet.kill()

        if (bullet.weaponId === 'RPG') {
            let ricochet = this.add.sprite(bullet.x, bullet.y - 50, 'rocket')
            ricochet.scale.setTo(.5, .5)
            ricochet.anchor.setTo(.5, .5)
            ricochet.animations.add('collision', [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14], 17, false, true)
            ricochet.animations.play('collision')
            ricochet.animations.currentAnim.killOnComplete = true
            return
        }

        let ricochet = this.add.sprite(bullet.x - 10, bullet.y - 10, 'ricochet')
        ricochet.scale.setTo(.17)
        ricochet.anchor.setTo(.5, .5)
        ricochet.animations.add('collision', [0,1,2,3,4,5], 45, false, true)
        ricochet.animations.play('collision')
        ricochet.animations.currentAnim.killOnComplete = true
    }, null, this)

    // Did enemy bullets hit any platforms
    this.physics.arcade.overlap(this.enemyBullets, this.platforms, function(bullet) {
        bullet.kill()

        if (bullet.weaponId === 'RPG') {
            let ricochet = this.add.sprite(bullet.x, bullet.y - 50, 'rocket')
            ricochet.scale.setTo(.5, .5)
            ricochet.anchor.setTo(.5, .5)
            ricochet.animations.add('collision', [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14], 17, false, true)
            ricochet.animations.play('collision')
            ricochet.animations.currentAnim.killOnComplete = true
            return
        }

        let ricochet = this.add.sprite(bullet.x - 10, bullet.y - 10, 'ricochet')
        ricochet.scale.setTo(.17)
        ricochet.anchor.setTo(.5, .5)
        ricochet.animations.add('collision', [0,1,2,3,4,5], 45, false, true)
        ricochet.animations.play('collision')
        ricochet.animations.currentAnim.killOnComplete = true
    }, null, this)
}
