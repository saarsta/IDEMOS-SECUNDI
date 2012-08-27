

var models = require('../../../models');

module.exports = function(req,res) {

    res.render('page.ejs',{
        layout: false,
        url: req.url,
        user_logged: req.isAuthenticated(),
        user: req.session.user,
        avatar_url: req.session.avatar_url,
        page:models.FooterLink.getFooterLink(req.params.link)
    });
};