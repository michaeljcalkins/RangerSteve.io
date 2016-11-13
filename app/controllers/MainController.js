'use strict'

let fs = require('fs')
let moment = require('moment')

let MainController = {
    home: function(req, res) {
        // Cache busting
        const fileStat = fs.statSync('public/css/app.css')
        const lastModifiedTime = moment(fileStat.mtime).unix()

        // Room table
        const rooms = require('../sockets').getRooms()
        const numberOfRooms = Object.keys(rooms).length
        const maxRoomSize = require('../../lib/GameConsts').MAX_ROOM_SIZE

        res.render('home', {
            lastModifiedTime: lastModifiedTime,
            maxRoomSize: maxRoomSize,
            numberOfRooms: numberOfRooms,
            rooms: rooms,
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

}

module.exports = MainController
