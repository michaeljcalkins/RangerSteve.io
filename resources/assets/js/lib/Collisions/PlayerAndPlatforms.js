export default function() {
    // Collide the player against the collision layer
    this.physics.arcade.collide(this.player, this.ground)
}
