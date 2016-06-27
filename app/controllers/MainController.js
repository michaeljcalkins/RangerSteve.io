'use strict'

let fs = require('fs')
let moment = require('moment')

let MainController = {
    home: function(req, res) {
        let fileStat = fs.statSync('public/js/app.js')
        let lastModifiedTime = moment(fileStat.mtime).format('MMMM, Do YYYY')

        res.render('home', {
            lastUpdatedAt: lastModifiedTime
        })
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
    gallery: function(req, res) {
        res.render('gallery')
    }
}

module.exports = MainController
