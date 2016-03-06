module.exports = {
    home: function(req, res, next) {
        res.render('home', { title: 'Ranger Steve: Buffalo Invasion' });
    },
    game:  function(req, res, next) {
        res.render('game', { title: 'Ranger Steve: Buffalo Invasion' });
    }
}
