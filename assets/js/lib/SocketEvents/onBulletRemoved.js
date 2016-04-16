'use strict'

module.exports = function(data) {
    if (data.id === ('/#' + this.socket.id))
        return

    let removeBullet = _.find(this.weapons[this.currentWeapon].children, {
        bulletId: data.bulletId
    })

    if (!removeBullet) {
        console.log('Bullet not found: ', data.bulletId)
        return
    }

    removeBullet.kill()
}
