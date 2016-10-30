'use strict'

const moment = require('moment')
const _ = require('lodash')
const util = require('util')

const GameConsts = require('../../resources/assets/js/lib/GameConsts')

const Room = function(data) {
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
        roundEndTime: moment().add(GameConsts.ROUND_LENGTH_MINUTES, 'minutes').unix(),
        state: 'active',
        map: _.sample(GameConsts.MAPS),
        gamemode: _.sample(GameConsts.GAMEMODES),
        redTeamScore: 0,
        blueTeamScore: 0,
        messages: data.messages || [],
    }
}

module.exports = Room
