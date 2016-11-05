'use strict'

let rooms = require('../sockets').rooms

let UserController = {
    count: function(req, res) {
        let userCount = 0
        Object.keys(rooms).forEach(function(key) {
            userCount += Object.keys(rooms[key].players).length
        })

        res.send(String(userCount))
    },
}

module.exports = UserController
