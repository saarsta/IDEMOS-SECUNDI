module.exports = function(req, res){
    res.render('elections_game_tmp.ejs', {
        layout: false,
        url: req.url,
        user_logged: req.isAuthenticated()
    });
};