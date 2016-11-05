// @flow

export default function(data: {
    x: number,
    y: number,
}) {
    const playerDeath = RS.playerDeaths.getFirstExists(false)
    playerDeath.reset(data.x, data.y)
    playerDeath.scale.setTo(.31)
    playerDeath.anchor.setTo(.5)
    playerDeath.animations.play('death', 17)
    playerDeath.animations.currentAnim.onComplete.add(() => {
        setTimeout(() => {
            playerDeath.kill()
        }, 3000)
    })
}
