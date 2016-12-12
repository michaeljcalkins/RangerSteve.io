'use strict'

var express = require('express')
var basicAuth = require('basicauth-middleware')
var router = express.Router()
var MainController = require('./controllers/MainController')

var auth = basicAuth('admin', '!rs(;;)')

router.get('/', MainController.home)
router.get('/game', MainController.game)
router.get('/credits', MainController.credits)
router.get('/admin', auth, MainController.admin)
router.post('/admin', auth, MainController.adminAnnouncement)

module.exports = router
