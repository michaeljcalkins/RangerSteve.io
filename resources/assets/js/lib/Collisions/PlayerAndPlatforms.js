export default function() {
    // Collide the player against the collision layer
    this.game.physics.arcade.collide(RangerSteve.player, this.ground)
}
