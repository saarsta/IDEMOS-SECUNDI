var models = require('../../models');

module.exports = function(req,res) {
    var subject_id = req.params[0];
    models.Subject.findById(subject_id, function(err,subject) {
        if(err)
            res.render('500.ejs',{error:err});
        else {
            if(!subject)
                res.redirect('/actions');
            else
                res.render('action_list_by_subject.ejs', {
                    subject:subject,
                    user: req.user,
                    avatar: req.session.avatar_url,
                    user_logged: req.isAuthenticated(),
                    url: req.url,
                    tab: 'actions',
                    type: 'approved_action',
                    social_popup: null
                });
        }
    });
};
