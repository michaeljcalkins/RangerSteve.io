export default function CollisionHandler() {
    // Collide this player with the map
    this.physics.arcade.collide(this.player, this.platforms, null, null, this)

    // Did this player's bullets hit any platforms
    this.physics.arcade.collide(this.platforms, this.player.meta.primaryWeapon, (platform, weapon) => {
        weapon.kill()
    }, null, this)

    this.physics.arcade.collide(this.platforms, this.player.meta.secondaryWeapon, (platform, weapon) => {
        weapon.kill()
    }, null, this)

    // Did enemy bullets hit any platforms
    this.physics.arcade.collide(this.platforms, this.enemyBullets, (platform, bullet) => {
        bullet.kill()
    }, null, this)

    // Did this player get hit by any enemy bullets
    this.physics.arcade.collide(this.player, this.enemyBullets, null, (player, bullet) => {
        bullet.kill()

        console.log('You were hit by', bullet.bulletId)
        this.socket.emit('bullet removed', {
            roomId: this.roomId,
            bulletId: bullet.bulletId
        })

        this.socket.emit('player damaged', {
            roomId: this.roomId,
            damage: bullet.damage,
            damagedPlayerId: '/#' + this.socket.id,
            attackingPlayerId: bullet.playerId
        })

        return false
    }, this)
}
