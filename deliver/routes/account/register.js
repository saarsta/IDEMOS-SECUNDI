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

        user_model.findOne({email: user.email, identity_provider:'register'}, function (err, result) {
            if (!err) {
                if (result) {     //user is not registered
                    user.save(function (err, user) {
                        if (err) {
                            res.render('login.ejs', {title:'Login', failed:true, exist_username:false, errors: err.errors, next: req.query.next});
                        }
                        else {
                            console.log('new user has been created by registration');
                            req.body['username'] = user.username;
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
                } else {
                    res.render('login.ejs', {title:'Login',
                        tab:'users',
                        failed:false, exist_username:true, next:req.query.next});
                }
            } else {
                throw "Error reading db.User";
            }
        });
    },

    get:function (req, res) {
        res.render('register.ejs',{
            url: req.url,
            tag_name:req.query.tag_name||'',
            layout: false,
            user_logged: req.isAuthenticated(),
            user: req.session.user,
            auth_user: req.session.auth.user,
            tab:'user',
            avatar_url: req.session.avatar_url,
            failed:false,
            exist_username:false,
            next:req.query.next
        });
    }
};