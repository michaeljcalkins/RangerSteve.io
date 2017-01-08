// @flow
export default function(data: {
  bulletY: number,
  bulletX: number,
}) {
  const ricochet = RS.ricochets.getFirstExists(false)
  if (! ricochet) return console.error('No ricochet sprite available.')

  ricochet.reset(data.bulletX, data.bulletY)
  ricochet.anchor.setTo(.5, .5)
  ricochet.animations.play('collision', 35, false, true)
}
