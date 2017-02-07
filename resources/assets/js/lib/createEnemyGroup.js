export default function () {
  window.RS.enemies = this.game.add.group()
  this.game.physics.arcade.enable(window.RS.enemies)
}
