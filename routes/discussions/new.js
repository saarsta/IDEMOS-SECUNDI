
var models = require('../../models');

module.exports = function(req,res)
{
    // get subject
    models.Subject.findById(req.params[0],function(err,subject)
    {
        // render whatever
        console.log(subject);

        var user = req.user;
        var is_cup_for_create_discussion;
        if(user){
            is_cup_for_create_discussion = user.num_of_extra_tokens > 0 || (user.num_of_extra_tokens == 0 && req.params[0] == "4fd0dae0ded0cb0100000fde");
        }
        res.render('discussion_create.ejs',
            {
                layout: false,
                title:"יצירת דיון",
                logged: req.isAuthenticated(),
                big_impressive_title: "",
                subject:subject,
                user: user,
                avatar:req.session.avatar_url,
                user_logged: req.isAuthenticated(),
                url:req.url,
                tab:'discussions',
                is_cup_for_create_discussion: is_cup_for_create_discussion
        });
    });
};
