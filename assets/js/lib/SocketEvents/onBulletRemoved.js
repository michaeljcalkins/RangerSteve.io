import { PropTypes } from 'react'

const OnBulletFiredInterface = {
    id: PropTypes.string.isRequired,
    bulletId: PropTypes.string.isRequired
}

export default function onBulletRemoved(data) {
    check(data, OnBulletFiredInterface)

    if (data.id === ('/#' + this.socket.id))
        return

    let removeBullet = _.find(this.bullets.children, {
        bulletId: data.bulletId
    })

    if (!removeBullet) {
        console.log('Bullet not found: ', data.bulletId)
        return
    }

    removeBullet.kill()
}
