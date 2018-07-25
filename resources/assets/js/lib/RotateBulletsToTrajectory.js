/**
 * Rotate bullets according to trajectory
 */
export default function() {
  window.RS.bullets.forEachAlive(bullet => {
    bullet.rotation = Math.atan2(
      bullet.body.velocity.y,
      bullet.body.velocity.x
    );
  });

  window.RS.enemyBullets.forEachAlive(bullet => {
    bullet.rotation = Math.atan2(
      bullet.body.velocity.y,
      bullet.body.velocity.x
    );
  });
}
