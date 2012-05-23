
var models = require('../../../models');

module.exports = function(req,res)
{
    var discussion_id = req.params.id;

    models.Discussion.findById(discussion_id,function(err,discussion)
    {
        if(err)
            res.render('500.ejs',{error:err});
        else
        {
            if(!discussion)
                res.redirect('/discussions');
            else
            {
                res.render('discussion.ejs',{
                    title:"יצירת דיון",
                    url: req.url,
                    layout: false,
                    user_logged: req.isAuthenticated(),
                    big_impressive_title: "",
                    user: req.session.user,
                    avatar:req.session.avatar_url,
                    tab:'discussions',
                    discussion:discussion
                });
            }
        }
    })
};