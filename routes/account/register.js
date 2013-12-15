var models = require('../../models')
    ,sendActivationMail = require('./activation').sendActivationMail
    ,async = require('async')
    , common = require('./common');


module.exports = {
    post:function (req, res) {
        var next = req.body.next || req.query.next || '';
        var data = req.body;

        registerUser(req,data,next,function(err,user) {
            if(err)
                res.render('register.ejs', {
                    user: user,
                    next: req.query.next,
                    title: "רישום",
                    body: req.body || {},
                    error_message: err.message || err
                });
            else
                res.redirect('/discussions?is_new=register&next=' + next);
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

/**
 * Registers user and callbacks with a user object
 * @param req
 * @param data
 * @param next
 * @param callback
 * function(err,user)
 */
var registerUser = module.exports.registerUser = function(req,data,next,callback) {
    var user = new models.User();
    user.email = (data.email || '').toLowerCase().trim();
    if ('full_name' in data) {
        var name_parts = data['full_name'].trim().split(' ');
        user.first_name = name_parts.shift();
        user.last_name = name_parts.join(' ');
    } else {
        user.first_name = data.first_name;
        user.last_name = data.last_name;
    }
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
            models.User.findOne({email:new RegExp(user.email,'i')},cbk);
        },

        // 2) save user
        function(user_obj,cbk) {
            if (!user_obj) {
                user.save(function(err) {
                    req.session.user = user;
                    cbk(err);
                });
            }
            else{
                req.session.user = user_obj;
                cbk('already_exists');
            }
        },

        // 3) send activation mail
        function(cbk) {
            sendActivationMail(user, next,null,cbk);
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
            callback(err,user);
        });
};
