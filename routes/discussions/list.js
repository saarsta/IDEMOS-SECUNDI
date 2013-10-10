var models = require('../../models');


module.exports = function(req,res) {
    res.render('discussion_list.ejs',
        {
            layout: false,
            tag_name:req.query.tag_name,
            title:"דיונים",
            logged: req.isAuthenticated(),
            big_impressive_title: "",
            user_id: req.user && req.user.id,
            avatar:req.session.avatar_url,
            user_logged: req.isAuthenticated(),
            url:req.url,
            tab:'discussions',
            user:req.user
        });
};
