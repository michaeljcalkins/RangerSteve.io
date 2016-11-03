'use strict'

const moment = require('moment')
const _ = require('lodash')
const hri = require('human-readable-ids').hri

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

    // Use the specified game mode if it exists
    const gamemodeId = data.gamemode && GameConsts.GAMEMODES.indexOf(data.gamemode) > -1
        ? data.gamemode
        : _.sample(GameConsts.GAMEMODES)

    // Use the specified map if it exists
    const mapId = data.map && GameConsts.MAPS.indexOf(data.map) > -1
        ? data.map
        : _.sample(GameConsts.MAPS)

    // Remove non alphanumeric and hyphens from custom room ids
    const cleanedRoomId = data.id
        ? data.id.replace(/[^a-zA-Z0-9 -]/g, '')
        : hri.random().replace(/[^a-zA-Z0-9 -]/g, '')

    return {
        blueTeamScore: 0,
        gamemode: gamemodeId,
        id: cleanedRoomId,
        map: mapId,
        messages: data.messages || [],
        players: players,
        redTeamScore: 0,
        roundEndTime: moment().add(GameConsts.ROUND_LENGTH_MINUTES, 'minutes').unix(),
        state: 'active',
    }
}