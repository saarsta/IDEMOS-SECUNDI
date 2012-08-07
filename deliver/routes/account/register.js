var models = require('../../../models')
    ,sendActivationMail = require('./activation').sendActivationMail
    ,async = require('async')
    , common = require('./common');


module.exports = {
    post:function (req, res) {
        var next = req.body.next || req.query.next || '';
        var data = req.body;
        var user = new models.User();
        user.email = (data.email || '').toLowerCase().trim();
        user.first_name = data.first_name;
        user.last_name = data.last_name;
        user.identity_provider = "register";
        if (req.session.referred_by) {
            user.invited_by = req.session.referred_by;
        }

        /***
         * Waterfall:
         * 1) get user by email
         * 2) save user
         * 3) send activation mail
         * 4) authenticate to log user in
         * Final) Render response
         */
        async.waterfall([
            // 1) get user by email
            function(cbk) {
                models.User.count({email:new RegExp(user.email,'i')},cbk);
            },

            // 2) save user
            function(result,cbk) {
                if (!result) {
                    user.save(function(err) {
                        cbk(err);
                    });
                }
                else
                    cbk('already_exists');
            },

            // 3) send activation mail
            function(cbk) {
                sendActivationMail(user, next,cbk);
            },
            // 4) authenticate to log user in
            function(temp_password,cbk) {
                req.body['email'] = user.email;
                req.body['password'] = temp_password;
                req.authenticate('simple',function(err,is_authenticated) {
                    cbk(err,is_authenticated);
                });
            }
        ],
            // Final) Render response
            function(err) {
            if(err)
                res.render('register.ejs', {
                    user: user,
                    next: req.query.next,
                    title: "רישום",
                    body:req.body || {},
                    error_message: err.message || err
                });
            else
                res.redirect('/?is_new=register&next=' + next);
        });
    },

    get:function (req, res) {
        var user = {
            _id: req.session.auth.user ? req.session.auth.user.user_id : null
        };

        res.render('register.ejs',{
            tag_name:req.query.tag_name,
            user: user /*req.session.auth.user*/,
            next: req.query.next,
            body:req.query || {},
            title: "רישום"
        });
    }
};