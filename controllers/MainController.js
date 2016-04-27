module.exports = {
    home: function(req, res, next) {
        res.render('home', { title: 'Home | Ranger Steve: Buffalo Invasion' });
    },
    game:  function(req, res, next) {
        res.render('game', { title: 'Game | Ranger Steve: Buffalo Invasion' });
    }
}
