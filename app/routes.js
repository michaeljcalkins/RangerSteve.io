'use strict'

var express = require('express')
var router = express.Router()
var MainController = require('./controllers/MainController')
var UserController = require('./controllers/UserController')

router.get('/', MainController.home)
router.get('/game', MainController.game)
router.get('/credits', MainController.credits)
router.get('/gallery', MainController.gallery)
router.get('/api/v1/users/count', UserController.count)

module.exports = router
