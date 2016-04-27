module.exports = {
    home: function(req, res) {
        res.render('home', { title: 'Home | Ranger Steve: Buffalo Invasion' });
    },
    game:  function(req, res) {
        res.render('game', { title: 'Game | Ranger Steve: Buffalo Invasion' });
    }
}
