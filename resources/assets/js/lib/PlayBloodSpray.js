export default function(data) {
  let bloodY = data.bulletY
  let bloodX = data.playerX
  const bloodRotation = data.bulletRotation
  if (data.playerX > data.bulletX) {
    bloodX += 10
    bloodY -= 25
  } else {
    bloodX -= 10
    bloodY += 25
  }
  const bloodSpray = RS.bloodSprays.getFirstExists(false)
  if (! bloodSpray) return console.error('No blood sprite available.')

  bloodSpray.reset(bloodX, bloodY)
  bloodSpray.rotation = bloodRotation
  bloodSpray.animations.play('spray', 45, false, true)
}
