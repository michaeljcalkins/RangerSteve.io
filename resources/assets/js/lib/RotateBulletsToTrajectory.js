/**
 * Rotate bullets according to trajectory
 */
export default function() {
    RS.bullets.forEach((bullet) => {
        bullet.rotation = Math.atan2(bullet.body.velocity.y, bullet.body.velocity.x)
    })

    RS.enemyBullets.forEach((bullet) => {
        bullet.rotation = Math.atan2(bullet.body.velocity.y, bullet.body.velocity.x)
    })
}