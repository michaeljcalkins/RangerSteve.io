// @flow
const Client = {
    getId(callback: Function) {
        window.socket.id(callback)
    },

    send(type: number, payload: Object) {
        const data = {
            type,
            payload,
        }
        window.socket.write(data)
    },
}

export default Client
