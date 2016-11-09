'use strict'

let fs = require('fs')
let moment = require('moment')

let MainController = {
    home: function(req, res) {
        let fileStat = fs.statSync('public/css/app.css')
        let lastModifiedTime = moment(fileStat.mtime).unix()

        res.render('home', {
            lastModifiedTime: lastModifiedTime,
        })
    },

    game: function(req, res) {
        let fileStat = fs.statSync('public/js/app.js')
        let lastModifiedTime = moment(fileStat.mtime).unix()

        res.render('game', {
            lastModifiedTime: lastModifiedTime,
            isProduction: process.env.NODE_ENV === "production",
        })
    },

    credits: function(req, res) {
        let fileStat = fs.statSync('public/css/app.css')
        let lastModifiedTime = moment(fileStat.mtime).unix()

        res.render('credits', {
            lastModifiedTime: lastModifiedTime,
        })
    },

    rooms: function(req, res) {
        const rooms = require('../sockets').getRooms()
        const maxRoomSize = require('../../resources/assets/js/lib/GameConsts').MAX_ROOM_SIZE

        res.render('rooms', {
            rooms,
            maxRoomSize,
        })
    },
}

module.exports = MainController
