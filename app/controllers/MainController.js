'use strict'

let fs = require('fs')
let moment = require('moment')

let MainController = {
    home: function(req, res) {
        res.render('home')
    },
    game: function(req, res) {
        let fileStat = fs.statSync('public/js/app.js')
        let lastModifiedTime = moment(fileStat.mtime).unix()

        res.render('game', {
            lastModifiedTime: lastModifiedTime
        })
    },
    credits: function(req, res) {
        res.render('credits')
    },
    buy: function(req, res) {
        res.render('buy')
    }
}

module.exports = MainController
