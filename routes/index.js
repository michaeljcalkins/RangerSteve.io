module.exports = function() {
    var express = require('express');
    var router = express.Router();
    var controllers = require('../controllers')

    router.get('/', controllers.main.home)
    router.get('/game', controllers.main.game)

    return router
}
