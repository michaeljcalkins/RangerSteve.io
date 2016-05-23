'use strict'

let MainController = {
    home: function(req, res) {
        res.render('home')
    },
    game: function(req, res) {
        res.render('game')
    },
    credits: function(req, res) {
        res.render('credits')
    }
}

module.exports = MainController
