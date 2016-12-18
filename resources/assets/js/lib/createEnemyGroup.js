export default function() {
    RS.enemies = this.game.add.group()
    RS.enemies.enableBody = true
    RS.enemies.physicsBodyType = Phaser.Physics.ARCADE
    this.game.physics.arcade.enable(RS.enemies)
    this.game.physics.enable(RS.enemies, Phaser.Physics.ARCADE)
}
