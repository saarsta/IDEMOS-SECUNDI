var Navigation = module.exports = {
    index : function(req, res){
        res.render('index.ejs', {
            layout: false,
            url: req.url,
            user_logged: req.isAuthenticated(),
            user: req.session.user,
//            auth_user: req.session.auth.user,
            avatar_url: req.session.avatar_url
        });
    }
};