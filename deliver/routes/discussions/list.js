

var models = require('../../../models');

module.exports = function(req,res)
{
    res.render('discussion_list.ejs',
        {
            layout: false,
            title:"דיונים",
            logged: req.isAuthenticated(),
            big_impressive_title: "",
            user: req.session.user,
            avatar:req.session.avatar_url,
            user_logged: req.isAuthenticated(),
            url:req.url,
            tab:'discussions'
        });
};