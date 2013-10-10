var models = require('../../models')
    , common = require('./common');

module.exports ={
    get: function(req, res){
        res.render('reset_password.ejs',{
            next: req.query.next,
            title: "רישום"
        });
    },

    post: function(req, res){

       var user_id = req.query.id;
       var validation_code = req.query.code;
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
                                       if(next.indexOf('?') > -1)
                                          next += '&is_new=reset';
                                       else
                                           next += '?is_new=reset';
                                       res.redirect(next);
                                   }
                                   else {
                                       res.render('500.ejs', {error:err});
                                   }
                               });
                           }else{
                               console.error('cant save',err);
                               res.render('500.ejs', {error:err});
                           }
                       })

                   }else{
                       console.error('bad link');
                       res.render('500.ejs', {error:'לינק שגוי או מיושן, שלח מייל מחדש'});
                   }
               }else{
                   console.error('no user',err);
                   res.render('500.ejs', {error:err});
               }
           })
       } else{
           console.error('bad link');
           res.render('500.ejs', {error:'לינק שגוי'});
       }
    }
}

