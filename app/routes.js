'use strict'

var express = require('express')
var basicAuth = require('basicauth-middleware')
var router = express.Router()
var MainController = require('./controllers/MainController')

var auth = basicAuth('admin', '!rs(;;)')

router.get('/', MainController.home)
router.get('/buy', MainController.buy)
router.get('/leaderboards', MainController.leaderboard)
router.get('/battle-stats/:username', MainController.battleStats)
router.get('/game', MainController.game)
router.get('/how-to-play', MainController.howToPlay)
router.get('/create-a-room', MainController.createARoom)
router.get('/credits', MainController.credits)
router.get('/admin', auth, MainController.admin)
router.post('/admin', auth, MainController.adminAnnouncement)

module.exports = router
