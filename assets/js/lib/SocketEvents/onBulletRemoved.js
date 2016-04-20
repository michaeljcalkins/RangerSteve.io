import { PropTypes } from 'react'

const propTypes = {
    id: PropTypes.string.isRequired,
    bulletId: PropTypes.string.isRequired
}

export default function onBulletRemoved(data) {
    check(data, propTypes)

    if (data.id === ('/#' + this.socket.id))
        return

    let removeBullet = _.find(this.enemyBullets, {
        bulletId: data.bulletId
    })

    if (!removeBullet) {
        console.log('Bullet not found: ', data.bulletId)
        return
    }

    removeBullet.kill()
}
