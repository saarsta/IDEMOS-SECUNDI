

var models = require('../../models');

module.exports = function(req,res)
{
    res.render('cycle_list.ejs',
        {
            layout: false,
            tag_name:req.query.tag_name,

            title:"קמפיינים",
            logged: req.isAuthenticated(),
            big_impressive_title: "",
            user: req.user,
            avatar:req.session.avatar_url,
            user_logged: req.isAuthenticated(),
            url:req.url,
            tab:'cycles',
            type: 'cycle',
            social_popup: null
        });
};
