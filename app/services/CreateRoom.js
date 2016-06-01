'use strict'

let moment = require('moment')
let _ = require('lodash')

let CreateRoom = function(data) {
    let playersObj = {}
    playersObj[data.player.id] = data.player

    return {
        id: data.id,
        players: playersObj,
        roundEndTime: moment().add(1, 'minutes').unix(),
        state: 'active',
        map: _.sample(['HighRuleJungle', 'PunkFallout'])
    }
}

module.exports = CreateRoom
