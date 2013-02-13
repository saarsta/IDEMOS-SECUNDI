

module.exports = function(req,res)
{
    res.render('information_item_list.ejs',{
        url: req.url,
        tag_name:req.query.tag_name,
        layout: false,
        user_logged: req.isAuthenticated(),
        user: req.user,
        auth_user: req.session.auth.user,
        tab:'information_items',
        avatar_url: req.session.avatar_url
    });

};
