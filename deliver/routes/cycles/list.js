

var models = require('../../../models');

module.exports = function(req,res)
{
    res.render('cycle_list.ejs',
        {
            layout: false,
            tag_name:req.query.tag_name,

            title:"מעגלי תנופה",
            logged: req.isAuthenticated(),
            big_impressive_title: "",
            user: req.session.user,
            avatar:req.session.avatar_url,
            user_logged: req.isAuthenticated(),
            url:req.url,
            tab:'cycles',
            type: 'cycle',
            social_popup_title: "",
            social_popup_text: ""
        });
};