const Server = {
    init(io) {
        this.io = io
    },

    sendToRoom(roomId, type, payload) {
        return this.io.room(roomId).write({type, payload})
    },

    sendToSocket(socketId, type, payload) {
        return this.io.spark(socketId).write({type, payload})
    },

    send(type, payload) {
        this.io.write({type, payload})
    },
}

module.exports = Server
