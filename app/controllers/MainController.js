'use strict'

let MainController = {
    home: function(req, res) {
        res.render('home', {
            title: 'Ranger Steve: Buffalo Invasion'
        })
    },
    game: function(req, res) {
        res.render('game', {
            title: 'Game'
        })
    },
    credits: function(req, res) {
        res.render('credits', {
            title: 'Credits'
        })
    }
}

module.exports = MainController
