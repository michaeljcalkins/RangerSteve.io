/**
 * Rotate bullets according to trajectory
 */
export default function() {
    RangerSteve.bullets.forEach((bullet) => {
        bullet.rotation = Math.atan2(bullet.body.velocity.y, bullet.body.velocity.x)
    })

    RangerSteve.enemyBullets.forEach((bullet) => {
        bullet.rotation = Math.atan2(bullet.body.velocity.y, bullet.body.velocity.x)
    })
}