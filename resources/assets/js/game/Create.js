import GameConsts from '../lib/GameConsts'

export default function Create() {
    //  We're going to be using physics, so enable the Arcade Physics system
    this.physics.startSystem(Phaser.Physics.ARCADE)
    this.physicsBodyType = Phaser.Physics.ARCADE
    this.game.physics.arcade.gravity.y = GameConsts.GRAVITY

    // Scale game on window resize
    this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE
    this.game.scale.setShowAll()
    this.game.scale.refresh()


    /**
     * Enemy Settings
     */
    this.enemies = this.game.add.group()
    this.enemies.enableBody = true
    this.enemies.physicsBodyType = Phaser.Physics.ARCADE
    this.physics.arcade.enable(this.enemies)
    this.game.physics.enable(this.enemies, Phaser.Physics.ARCADE)

    window.Meta = {
        kickPlayerByUsername: (nickname) => {
            return window.socket.emit('kick player', {
                roomId: this.roomId,
                nickname
            })
        }
    }
}
