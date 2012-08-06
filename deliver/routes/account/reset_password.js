var models = require('../../../models')
    , common = require('./common');

module.exports ={
    get: function(req, res){
        res.render('reset_password.ejs',{
            url: req.url,
            tag_name: req.query.tag_name,
            layout: false,
            user_logged: req.isAuthenticated(),
            user: req.session.user,
            next: req.query.next,
            title: "רישום",
            big_impressive_title: ""
        });
    },

    post: function(req, res){

       var user_id = req.query.id;
       var validation_code = req.query.validation;
       var password= req.body.new_password;

       if(user_id){
           models.User.findById(user_id, function(err, user){
               if(!err && user){
                   if(user.validation_code ==  validation_code){
                       user.password = common.hash_password(password);
                       user.is_activated = true;
                       user.save(function(err, user){
                           if(!err){
                               req.body.password = password;
                               req.body.email = user.email;
                               req.authenticate('simple', function (err, is_authenticated) {
                                   if (is_authenticated) {
                                       var next = req.query.next || common.DEFAULT_LOGIN_REDIRECT;
                                       res.redirect(next);
                                   }
                                   else {
                                       res.send('error', 500);
                                   }
                               });
                           }else{
                               res.send('error', 500);
                           }
                       })

                   }else{
                       res.send('something wrong', 500);
                   }
               }else{
                   res.send('something wrong', 500);
               }
           })
       } else{
           res.send('something wrong', 500);
       }
    }
}

