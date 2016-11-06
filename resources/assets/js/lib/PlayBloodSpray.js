// @flow
export default function(data: {
    bulletY: number,
    bulletX: number,
    playerX: number,
    bulletRotation: number,
}) {
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
    bloodSpray.reset(bloodX, bloodY)
    bloodSpray.scale.setTo(.14)
    bloodSpray.rotation = bloodRotation
    bloodSpray.animations.play('spray', 45, false, true)
}
