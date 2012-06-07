
var models = require('../../../models');

module.exports = function(req,res)
{
    var item_id = req.params[0];

    models.InformationItem.findById(item_id).populate('subject_id').run(function(err,item){
        if(err)
            res.render('500.ejs',{err:err});
        else
        {
            if(!item)
                res.redirect('/information_items');
            else
            {
                res.render('information_item.ejs',{
                    url: req.url,
                    item:item,
                    tag_name:req.query.tag_name||'',
                    layout: false,
                    user_logged: req.isAuthenticated(),
                    user: req.session.user,
                    auth_user: req.session.auth.user,
                    tab:'information_items',
                    avatar_url: req.session.avatar_url
                });
            }
        }
    })

};