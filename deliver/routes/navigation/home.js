module.exports = function(req, res){

    if(req.isAuthenticated())
    {
        res.render('index.ejs', {
            layout: false,
            url: req.url,
            user_logged: req.isAuthenticated(),
            user: req.session.user,
            avatar_url: req.session.avatar_url
        });
    }else{
        res.render('index_not_logged.ejs', {
            layout: false,
            url: req.url,
            user_logged: req.isAuthenticated(),
            user: req.session.user,
            avatar_url: req.session.avatar_url
        });
    }
};