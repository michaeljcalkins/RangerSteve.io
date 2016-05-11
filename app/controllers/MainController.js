'use strict'

let MainController = {
    home: function(req, res) {
        res.render('home', { title: 'Home | Ranger Steve: Buffalo Invasion' })
    },
    game: function(req, res) {
        res.render('game', { title: 'Game | Ranger Steve: Buffalo Invasion' })
    },
    credits: function(req, res) {
        res.render('credits', { title: 'Credits | Ranger Steve: Buffalo Invasion' })
    }
}

module.exports = MainController
