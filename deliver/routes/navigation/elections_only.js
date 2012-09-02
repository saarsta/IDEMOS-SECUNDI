module.exports = function(req, res){
    res.render('elections_only.ejs', {
        layout: false,
        url: req.url,
        user_logged: req.isAuthenticated(),
        user: req.session.user,
        avatar_url: req.session.avatar_url
    });
};