'use strict'

const _ = require('lodash')

const getModWithChance = function (mods, chanceInPercent, defaultMod = '') {
  return _.random(1, 100) <= chanceInPercent ? _.sample(mods.filter(mod => mod !== defaultMod)) : defaultMod
}

module.exports = getModWithChance
