'use strict'

const GameConsts = require('../../lib/GameConsts')

module.exports = function(id, startX, startY) {
    return {
        x: startX,
        y: startY,
        id: id,
        meta: {
            bestKillingSpree: 0,
            bulletsFired: 0,
            bulletsHit: 0,
            damageInflicted: 0,
            deaths: 0,
            headshots: 0,
            health: GameConsts.PLAYER_FULL_HEALTH,
            killingSpree: 0,
            kills: 0,
            nickname: null,
            score: 0,
            secondsInRound: 0,
            team: null,
            weaponId: null,
        },
    }
}
