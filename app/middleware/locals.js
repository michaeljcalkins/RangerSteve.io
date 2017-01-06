'use strict'

let Locals = function (req, res, next) {
  res.locals = {
    isProduction: process.env.NODE_ENV === 'production',
  }
  next()
}

module.exports = Locals
