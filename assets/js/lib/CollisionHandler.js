export default function CollisionHandler() {
    // Collide this player with the map
    this.physics.arcade.collide(this.player, this.platforms, null, null, this)

    // Did this player's bullets hit any platforms
    this.physics.arcade.collide(this.platforms, this.bullets, (platform, bullet) => {
        bullet.kill()
    }, null, this)

    // Did enemy bullets hit any platforms
    this.physics.arcade.collide(this.platforms, this.enemyBullets, (platform, bullet) => {
        bullet.kill()

        this.socket.emit('bullet removed', {
            roomId: this.roomId,
            bulletId: bullet.bulletId
        })
    }, null, this)

    // Did this player get hit by any enemy bullets
    this.physics.arcade.collide(this.player, this.enemyBullets, (player, bullet) => {
        bullet.kill()

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
    },
    function() {
        return false
    }, this)
}
