
var models = require('../../../models');

module.exports = function(req,res)
{
    // get subject
    models.Subject.findById(req.params[0],function(err,subject)
    {
        // render whatever
        console.log(subject)   ;
        res.render('discussion_create.ejs',
            {
                layout: false,
                title:"יצירת דיון",
                logged: req.isAuthenticated(),
                big_impressive_title: "",
                subject:subject,
                user: req.session.user,
                avatar:req.session.avatar_url,
                user_logged: req.isAuthenticated(),
                facebook_app_id:req.app.settings.facebook_app_id,
                url:req.url,
                tab:'discussions'
        });
    });
};