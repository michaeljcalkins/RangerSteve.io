export default function () {
  // Collide the player against the collision layer
  this.game.physics.arcade.collide(window.RS.player, window.RS.groundPolygons)
  this.game.physics.arcade.collide(window.RS.enemies, window.RS.groundPolygons)
}
