'use strict'

var express = require('express')
var router = express.Router()
var MainController = require('./controllers/MainController')

router.get('/', MainController.home)
router.get('/game', MainController.game)
router.get('/credits', MainController.credits)
router.get('/buy', MainController.buy)

module.exports = router
