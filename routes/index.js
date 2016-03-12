var express = require('express')
var router = express.Router()
var controllers = require('../controllers')

module.exports = function() {
    /* GET home */
    router.get('/', controllers.main.home)

    /* GET game */
    router.get('/game', controllers.main.game)

    return router
}
