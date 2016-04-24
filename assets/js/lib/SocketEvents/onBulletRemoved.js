import { PropTypes } from 'react'

const propTypes = {
    id: PropTypes.string.isRequired,
    bulletId: PropTypes.string.isRequired
}

export default function onBulletRemoved(data) {
    check(data, propTypes)

    if (data.id === ('/#' + this.socket.id))
        return

    let removeEnemyBullet = _.find(this.enemyBullets, {
        bulletId: data.bulletId
    })

    let removeLocalBullet = _.find(this.bullets.children, {
        bulletId: data.bulletId
    })

    if (!removeEnemyBullet && !removeLocalBullet) {
        console.log('Bullet not found: ', data.bulletId)
        return
    }

    if (removeEnemyBullet) {
        let lastKnownX = removeEnemyBullet.x
        let lastKnownY = removeEnemyBullet.y

        removeEnemyBullet.kill()

        _.remove(this.enemyBullets, {
            bulletId: data.bulletId
        })

        let ricochet = this.add.sprite(lastKnownX, lastKnownY - 15, 'ricochet')
        ricochet.scale.setTo(.17)
        ricochet.animations.add('collision', [0,1,2,3,4,5], 45, false, true)
        ricochet.animations.play('collision')
        ricochet.animations.currentAnim.killOnComplete = true
    }

    if (removeLocalBullet) {
        let lastKnownX = removeEnemyBullet.x
        let lastKnownY = removeEnemyBullet.x

        removeLocalBullet.kill()

        let ricochet = this.add.sprite(lastKnownX, lastKnownY - 15, 'ricochet')
        ricochet.scale.setTo(.17)
        ricochet.animations.add('collision', [0,1,2,3,4,5], 45, false, true)
        ricochet.animations.play('collision')
        ricochet.animations.currentAnim.killOnComplete = true
    }
}
