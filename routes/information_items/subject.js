
var models = require('../../models');

module.exports = function(req,res) {
    var subject_id = req.params[0];
    models.Subject.findById(subject_id,function(err,subject) {
        if(err)
            res.render('500.ejs',{err:err});
        else {
            if(!subject)
                res.redirect('/information_items');
            else {
                res.render('information_item_list_by_subject.ejs',{
                    url: req.url,
                    tag_name:req.query.tag_name,
                    layout: false,
                    user_logged: req.isAuthenticated(),
                    user: req.user,
                    auth_user: req.session.auth.user,
                    subject:subject,
                    tab:'information_items',
                    avatar_url: req.session.avatar_url
                });
            }
        }
    });
};
