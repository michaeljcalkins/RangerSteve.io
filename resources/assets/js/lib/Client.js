import GameConsts from 'lib/GameConsts'
import { sizeOf, formatByteSize } from 'lib/helpers'

const _stats = {
  dataSent: 0
}

const Client = {
  getId: (callback) => {
    window.socket.id(callback)
  },

  getStats: () => {
    return _stats
  },

  send: (type, payload) => {
    const data = {
      type,
      payload
    }

    const sizeOfData = sizeOf(data)
    _stats.dataSent += sizeOfData

    if (
      GameConsts.ENABLE_NETWORK_EVENT_LOGS
      && type !== GameConsts.EVENT.MOVE_PLAYER
    ) {
      console.log('* LOG * Client.send', type, GameConsts.EVENTS[type], payload, formatByteSize(sizeOfData))
    }
    window.socket.write(data)
  }
}

export default Client
