'use strict'

const moment = require('moment')
const _ = require('lodash')
const util = require('util')

let CreateRoom = function(data) {
    util.log('Creating room', data.id)

    let playersObj = {}
    if (data.player) {
        playersObj[data.player.id] = data.player
    } else {
        playersObj = data.players
    }

    return {
        id: data.id,
        players: playersObj,
        roundEndTime: moment().add(5, 'minutes').unix(),
        state: 'active',
        map: _.sample(['PunkFallout'])
    }
}

module.exports = CreateRoom
