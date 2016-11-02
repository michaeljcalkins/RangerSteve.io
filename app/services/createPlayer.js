'use strict'

const _ = require('lodash')

module.exports = function(id, startX, startY) {
    return {
        x: startX,
        y: startY,
        id: id,
        meta: {
            health: 100,
            deaths: 0,
            kills: 0,
            bestKillingSpree: 0,
            killingSpree: 0,
            bulletsFired: 0,
            secondsInRound: 0,
            bulletsHit: 0,
            score: 0,
            headshots: 0,
            team: _.sample(['red', 'blue']),
        },
    }
}
