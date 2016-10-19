/**
 * Rotate bullets according to trajectory
 */
export default function() {
    this.bullets.forEach((bullet) => {
        bullet.rotation = Math.atan2(bullet.body.velocity.y, bullet.body.velocity.x)
    })

    this.enemyBullets.forEach((bullet) => {
        bullet.rotation = Math.atan2(bullet.body.velocity.y, bullet.body.velocity.x)
    })
}