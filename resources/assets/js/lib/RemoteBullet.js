// @flow
import GameConsts from 'lib/GameConsts'

export default function RemoteBullet(data: {
    bulletId: string,
    playerId: string,
    damage: number,
    pointerAngle: number,
    height: number,
    width: number,
    x: number,
    y: number,
    bulletSpeed: number,
}) {
    let bullet = RS.enemyBullets.getFirstDead()
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
