'use strict'

module.exports = function(data) {
    if (data.id === ('/#' + this.socket.id))
        return

    console.log('bullet moved!', data)
}
