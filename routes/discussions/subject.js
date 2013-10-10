var models = require('../../models');

module.exports = function(req,res) {
    var subject_id = req.params[0];

    models.Subject.findById(subject_id,function(err,subject) {
        if(err)
            res.render('500.ejs',{error:err});
        else {
            if(!subject)
                res.redirect('/discussions');
            else
                res.render('discussion_list_by_subject.ejs', {
                        layout: false,
                        tag_name:req.query.tag_name,
                        subject:subject,
                        title:"דיונים",
                        logged: req.isAuthenticated(),
                        big_impressive_title: "",
                        user: req.user,
                        avatar:req.session.avatar_url,
                        user_logged: req.isAuthenticated(),
                        url:req.url,
                        tab:'discussions'
                });
        }
});
};
