export default class Bullet extends Phaser.Sprite {
    constructor(rootScope, game, key) {
        super()

        Phaser.Sprite.call(rootScope, game, 0, 0, key)
        this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST
        this.anchor.set(0.5)
        this.checkWorldBounds = true
        this.outOfBoundsKill = true
        this.exists = false
        this.tracking = false
        this.scaleSpeed = 0
    }

    fire(x, y, angle, speed, gx, gy, socket, roomId) {
        this.reset(x, y)

        let pointerAngle = this.game.physics.arcade.moveToPointer(this, speed)
        this.body.gravity.y = -1800

        console.log('Firing bullet locally', this.bulletId)

        socket.emit('bullet fired', {
            roomId: roomId,
            bulletId: this.bulletId,
            playerId: '/#' + socket.id,
            x,
            y,
            angle,
            speed,
            gx,
            gy,
            pointerAngle,
            height: this.height,
            width: this.width,
            damage: this.damage
        })
    }

    update() {
        if (this.tracking) {
            this.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x)
        }
    }
}
