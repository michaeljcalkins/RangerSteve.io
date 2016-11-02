'use strict'

const moment = require('moment')
const _ = require('lodash')

const GameConsts = require('../../resources/assets/js/lib/GameConsts')

module.exports = function(data) {
    let players = {}
    if (data.player) {
        // Initialize players object with a single player
        players[data.player.id] = data.player
    } else {
        // Add existing players to this room
        players = data.players
    }

    return {
        id: data.id,
        players: players,
        roundEndTime: moment().add(GameConsts.ROUND_LENGTH_MINUTES, 'minutes').unix(),
        state: 'active',
        map: _.sample(GameConsts.MAPS),
        gamemode: _.sample(GameConsts.GAMEMODES),
        redTeamScore: 0,
        blueTeamScore: 0,
        messages: data.messages || [],
    }
}