
module.exports = function(req,res) {
    res.render('qa.ejs',{
        layout: false,
        url: req.url,
        user_logged: req.isAuthenticated(),
        user: req.session.user,
        avatar_url: req.session.avatar_url
    });
};
