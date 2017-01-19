export default function () {
  window.RS.enemies = this.game.add.group()
  window.RS.enemies.enableBody = true
  window.RS.enemies.physicsBodyType = window.Phaser.Physics.ARCADE
  this.game.physics.arcade.enable(window.RS.enemies)
  this.game.physics.enable(window.RS.enemies, window.Phaser.Physics.ARCADE)
}
