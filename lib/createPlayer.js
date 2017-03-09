'use strict'

const GameConsts = require('./GameConsts')

module.exports = function (id, startX, startY) {
  return {
    bestKillingSpree: 0,
    bulletsFired: 0,
    bulletsHit: 0,
    damageInflicted: 0,
    deaths: 0,
    headshots: 0,
    health: GameConsts.PLAYER_FULL_HEALTH,
    id: id,
    killingSpree: 0,
    kills: 0,
    nickname: null,
    noDamageUntilTime: 0,
    state: 0, // 0: loading, 1: ready
    isProtected: true,
    score: 0,
    isVisibleAfterTime: Date.now() + 1000,
    secondsInRound: 0,
    team: null,
    timesHit: 0,
    weaponId: null,
    x: startX,
    y: startY
  }
}
