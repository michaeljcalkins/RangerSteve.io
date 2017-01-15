import GameConsts from 'lib/GameConsts'

export default function RemoteBullet(data) {
  if (! RS.enemyBullets) return
  let bullet = RS.enemyBullets.getFirstDead()
  if (! bullet) return console.error('No bullet sprite available.')

  bullet.reset(data.x, data.y)
  bullet.bulletId = data.bulletId
  bullet.playerId = data.playerId
  bullet.damage = data.damage
  bullet.rotation = data.pointerAngle
  bullet.height = data.height
  bullet.width = data.width
  bullet.body.gravity.y = GameConsts.BULLET_GRAVITY

  return bullet
}
