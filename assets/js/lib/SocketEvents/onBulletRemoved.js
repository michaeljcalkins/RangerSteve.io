import { PropTypes } from 'react'

const propTypes = {
    id: PropTypes.string.isRequired,
    bulletId: PropTypes.string.isRequired
}

export default function onBulletRemoved(data) {
    check(data, propTypes)

    if (data.id === ('/#' + this.socket.id))
        return

    let removeEnemyBullet = _.find(this.enemyBullets.children, {
        bulletId: data.bulletId
    })

    let removeLocalBullet = _.find(this.bullets.children, {
        bulletId: data.bulletId
    })

    if (!removeEnemyBullet && !removeLocalBullet) {
        console.log('Bullet not found: ', data.bulletId)
        return
    }

    if (removeEnemyBullet)
        removeEnemyBullet.kill()

    if (removeLocalBullet)
        removeLocalBullet.kill()
}
