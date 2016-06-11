'use strict'

let moment = require('moment')
let _ = require('lodash')

let CreateRoom = function(data) {
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
        map: _.sample(['HighRuleJungle', 'PunkFallout', 'DarkForest'])
    }
}

module.exports = CreateRoom
