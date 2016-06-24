export default function() {
    this.physics.arcade.collide(this.player, this.platforms)

    // Collide the player against the collision layer
    this.physics.arcade.collide(this.player, this.ground)
}
