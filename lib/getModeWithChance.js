'use strict'

const _ = require('lodash')

const getModeWithChance = function (modes, chanceInPercent, defaultMode = '') {
  return _.random(1, 100) <= chanceInPercent ? _.sample(modes.filter(mode => mode !== defaultMode)) : defaultMode
}

module.exports = getModeWithChance
