var Models = require('../../../models')
    ,sendActivationMail = require('./activation').sendActivationMail
    ,async = require('async')
    , common = require('./common');


module.exports = {
    post:function (req, res) {
        var data = req.body;
        var user = new Models.User(data);
        user.email = (user.email || '').toLowerCase().trim();
        user.identity_provider = "register";
        if (req.session.referred_by) {
            user.invited_by = req.session.referred_by;
        }

        var user_model = Models.User;

        /***
         * Waterfall:
         * 1) get user by email
         * 2) send activation mail
         * 3) authenticate to log user in
         * Final) Render response
         */
        async.waterfall([
            // 1) get user by email
            function(cbk) {
                user_model.count({email: user.email},cbk);
            },

            // 2) send activation mail
            function(result,cbk) {
                if (!result) {
                    sendActivationMail(user, req.query.next,cbk);
                }
                else
                    cbk('already_exists');
            },
            // 3) authenticate to log user in
            function(cbk) {
                req.body['email'] = user.email;
                req.body['password'] = user.password;
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
                res.redirect('/account/activation?next=' + req.query.next);
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