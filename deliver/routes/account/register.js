var Models = require('../../../models')
    , common = require('./common');


module.exports = {
    post:function (req, res) {
        var data = req.body;
        var user = new Models.User(data);
        user.password = common.hash_password(data.password);
        user.identity_provider = "register";
        if (req.session.referred_by) {
            user.invited_by = req.session.referred_by;
        }

        var user_model = Models.User;

        user_model.findOne({email: user.email/*, identity_provider:'register'*/}, function (err, result) {
            if (!err) {
                if (!result || (result.identity_provider == "facebook" && !result.password)) {
                 //user is not registered or registered with fbconnect

                    if(result.identity_provider == "facebook" && !result.password){
                        result.password = user.password;
                        user = result;
                    }

                    user.save(function (err, user) {
                        if (err) {
                            res.render('/account/register.ejs'/*, {title:'Login', failed:true, exist_username:false, errors: err.errors, next: req.query.next}*/);
                        }
                        else {
                            req.body['email'] = user.email;
                            req.body['password'] = data['password'];
                            req.authenticate('simple', function (err, is_authenticated) {
                                if (err) res.send('something wrong: ' + err.message, 500);
                                else {
                                    if (!is_authenticated) res.send('something wrong', 500);
                                    else {
                                        var next = req.query.next || common.DEFAULT_LOGIN_REDIRECT;
                                        res.redirect(next);
                                    }
                                }
                            });
                        }
                    });
                 }
                 else{
                        //send messaage: email is all ready in use

                        res.render('account/register.ejs'/*, {title:'Login',
                         tab:'users',
                         failed:false, exist_username:true, next:req.query.next}*/);
                 }
            } else {
                throw "Error reading db.User";
            }
        });
    },

    get:function (req, res) {
//        console.log(req.session.auth.user.user_id);
        var user = {
            _id: req.session.auth.user ? req.session.auth.user.user_id : null
        }

        res.render('register.ejs',{
            url: req.url,
            tag_name:req.query.tag_name,
            layout: false,
            user_logged: req.isAuthenticated(),
            user: user /*req.session.auth.user*/,
//            auth_user: req.session.auth.user,
//            tab:'user',
//            avatar_url: req.session.avatar_url,
//            failed:false,
//            exist_username:false,
            next: req.query.next,
            title: "רישום",
            big_impressive_title: ""

//            layout: false,
//            tag_name:req.query.tag_name,

//            title:"אורו שלי",
//            logged: req.isAuthenticated(),
//            big_impressive_title: "",
//            user: user,
//            avatar:req.session.avatar_url,
//            user_logged: req.isAuthenticated(),
//            url:req.url,
//            tokensBarModel:tokensBarModel,
//            tab:''
        });
    }
};