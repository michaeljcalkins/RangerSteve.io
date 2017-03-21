const GameConsts = require('../lib/GameConsts')
const sizeOf = require('../lib/helpers').sizeOf
const formatByteSize = require('../lib/helpers').formatByteSize

const _stats = {
  dataSent: 0
}

const Server = {
  init (io) {
    this.io = io
  },

  getStats () {
    return _stats
  },

  sendToRoom (roomId, type, payload, excludedIds = []) {
    const excludedIdsString = excludedIds.join(' ')
    return this.io.room(roomId) && this.io.room(roomId).except(excludedIdsString).write(this._prepareData(type, payload))
  },

  sendToSocket (socketId, type, payload) {
    return this.io.spark(socketId) && this.io.spark(socketId).write(this._prepareData(type, payload))
  },

  send (type, payload) {
    this.io.write(this._prepareData(type, payload))
  },

  _prepareData (type, payload) {
    const data = {
      type,
      payload
    }

    const sizeOfData = sizeOf(data)
    _stats.dataSent += sizeOfData

    if (
      GameConsts.ENABLE_NETWORK_EVENT_LOGS &&
      type !== GameConsts.EVENT.GAME_LOOP &&
      type !== GameConsts.EVENT.NTP_SYNC
    ) {
      console.log('* LOG * Server._prepareData', type, GameConsts.EVENTS[type], payload, formatByteSize(sizeOfData))
    }

    return data
  }
}

module.exports = Server
