'use strict'

var express = require('express')
var router = express.Router()
var MainController = require('./controllers/MainController')

module.exports = function() {
    router.get('/', MainController.home)
    router.get('/game', MainController.game)
    router.get('/credits', MainController.credits)

    return router
}
