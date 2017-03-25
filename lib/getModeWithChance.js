'use strict'

const _ = require('lodash')

const getModeWithChance = function (modes, chanceInPercent, defaultMod = '') {
  return _.random(1, 100) <= chanceInPercent ? _.sample(modes.filter(mode => mode !== defaultMod)) : defaultMod
}

module.exports = getModeWithChance
