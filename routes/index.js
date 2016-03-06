module.exports = function(io) {
    var express = require('express');
    var router = express.Router();
    var controllers = require('../controllers')
    // var SocketHandler = require('../lib/SocketHandler')

    // SocketHandler.init(io)

    /* GET home */
    router.get('/', controllers.main.home)

    /* GET game */
    router.get('/game', controllers.main.game)

    return router
}
