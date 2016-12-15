// @flow
import GameConsts from 'lib/GameConsts'
import { sizeOf } from 'lib/helpers'

const _stats = {
    dataSent: 0,
}

const Client = {
    getId(callback: Function) {
        window.socket.id(callback)
    },

    getStats() {
        return _stats
    },

    send(type: number, payload: Object) {
        const data = {
            type,
            payload,
        }

        _stats.dataSent += sizeOf(data)

        // if (type !== GameConsts.EVENT.MOVE_PLAYER) {
        //     console.log('* LOG * Client.send', type, GameConsts.EVENTS[type], payload, formatByteSize(_stats.dataSent));
        // }
        window.socket.write(data)
    },
}

export default Client
