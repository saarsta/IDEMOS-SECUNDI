var models = require('../../../models');



module.exports = function(req, res){

    var user = req.session.user;

    models.User.findById(user.id)
        .select({
            id: 1,
            first_name: 1,
            last_name: 1,
            avatar_url: 1,
            score: 1,
            num_of_given_mandates: 1,
            num_of_proxies_i_represent: 1,
            has_voted: 1,
            no_mail_notifications: 1,
            identity_provider: 1,
            mail_notification_configuration: 1
        })
        .exec(function(err, user_obj){
            if(err){
                res.render('500.ejs',{error:err});
            }else{
                res.render('mail_configuration.ejs',{
                    title:"הגדרות עדכונים",
                    user: user_obj
                });
            }
        })
}