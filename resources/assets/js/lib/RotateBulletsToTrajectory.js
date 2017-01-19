/**
 * Rotate bullets according to trajectory
 */
export default function () {
  window.RS.bullets.forEach(bullet => {
    bullet.rotation = Math.atan2(bullet.body.velocity.y, bullet.body.velocity.x)
  })

  window.RS.enemyBullets.forEach(bullet => {
    bullet.rotation = Math.atan2(bullet.body.velocity.y, bullet.body.velocity.x)
  })
}
