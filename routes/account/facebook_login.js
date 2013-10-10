'use strict';
if (!module.parent) console.error('Please don\'t call me directly.I am just the main app\'s minion.') || process.process.exit(1);

var models = require('../../models');
var common = require('./common');


var redirectAfterLogin = function (req, res, redirect_to) {
    if (!redirect_to || /^\/account\/register/.test(redirect_to)) {
        redirect_to = common.DEFAULT_LOGIN_REDIRECT;
    }
    res.redirect(redirect_to);
};


module.exports = function (req, res) {
    if (req.query['error']) {
        res.redirect('/account/register');
        return;
    }
    if (req.query.next) {
        req.session['fb_next'] = req.query.next;
    }
    module.exports.facebook_register(req, function (err, is_new) {
        if (err) {
            res.json(500, {error: err.stack | err});
        } else {
            redirectAfterLogin(req, res, req.session['fb_next'], is_new);
        }
    });
};


module.exports.facebook_register = function (req, callback) {
    req.authenticate("facebook", function (error, authenticated) {
            var referred_by = req.session['referred_by'];
            if (error || !authenticated) {
                console.log('can\'t authenticate with facebook');
                return;
            }
            var user_details = req.getAuthDetails().user;
            var access_token = req.session["access_token"];
            var user_fb_id = req.getAuthDetails().user.id;
            module.exports.isUserInDataBase(user_fb_id, function (is_user_in_db) {
                if (is_user_in_db) {
                    var is_new_user = !is_user_in_db;
                    module.exports.updateUesrAccessToken(user_details, access_token, function (err, _id) {
                        if (err) throw err;
                        req.session.user_id = _id;
                        callback(null, is_new_user)
                    });
                } else {
                    user_details.invited_by = referred_by;
                    module.exports.createNewUser(user_details, access_token, function (_id) {
                        req.session.user_id = _id;
                        callback(null, is_new_user);
                    });
                }
            });
        }
    );
};


module.exports.isUserInDataBase = function (user_facebook_id, callback) {
    models.User.findOne({facebook_id: user_facebook_id}, function (err, user) {
        if (err) throw err;
        if (!user) {
            callback(null, false);
            return;
        }
        callback(null, true, user);
    });
};


module.exports.createNewFacebookUser = function (data, access_token, callback) {
    var email = (data.email || '').trim().toLowerCase();
    models.User.findOne({email: new RegExp(email, 'i')}, function (err, user) {
        if (err) {
            console.error(err.stack || err);
            var err2 = new Error('get user failed');
            callback(err2);
            return;
        }

        if (!user) {
            user = new models.User();
        }

        user.is_activated = true;
        user.username = user.username || data.username;
        user.identity_provider = "facebook";
        user.first_name = user.first_name || data.first_name;
        user.last_name = user.last_name || data.last_name;
        user.email = email;
        if (data.hometown) {
            user.address = data.hometown.name;
        }
        user.gender = user.gender || data.gender;
        user.facebook_id = data.id;
        if (data.invited_by) {
            user.invited_by = user.invited_by || data.invited_by;
        }
        user.access_token = access_token;
        user.save(function (err, object) {
            if (err) throw err;
            callback(object.id, object);
            console.log("done creating new user - %s %s", user.first_name, user.last_name);
        });
    });
};


module.exports.updateUesrAccessToken = function (data, access_token, callback) {
    var user_model = models.User;
    user_model.findOne({facebook_id: data.id}, function (err, user) {
        if (err) throw err;
        user.access_token = access_token;
        user.is_activated = true;
        user.save(function (err, object) {
            if (err) throw err;
            console.log("done updating user - %s %s", user.first_name, user.last_name);
            callback(null, object.id);
        });
    });
};

