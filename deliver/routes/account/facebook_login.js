var models = require('../../../models')
    ,common = require('./common');


module.exports = function (req, res) {

    if(req.query['error']) {
        res.render('500.ejs');
        return;
    }
//   facebook_login(req, res);
    function go() {

        req.authenticate("facebook", function (error, authenticated) {
            var next = req.session['fb_next'];
            var referred_by = req.session['referred_by'];
            console.log(error);
            if (!error && authenticated) {

                var user_detailes = req.getAuthDetails().user;
                var access_token = req.session["access_token"];
                var user_fb_id = req.getAuthDetails().user.id;

                isUserInDataBase(user_fb_id, function (is_user_in_db) {

                    if (!is_user_in_db) {
//                        req.session['fb_next'] = "/account/code_after_fb_connect";
//                        next = req.session['fb_next'];
                        user_detailes.invited_by = referred_by;
                        createNewUser(user_detailes, access_token, function (_id) {
                            req.session.user_id = _id;
//                            req.session.auth.user._id = _id; i can delete this
                            req.session.save(function (err, object) {
                                if (err != null) {
                                    console.log(err);
                                } else {
                                    console.log('user _id to session is ok');
                                    redirectAfterLogin(req,res,next);
                                }
                            });
                        });
                    } else {
                        updateUesrAccessToken(user_detailes, access_token, function (err,_id) {
                            if(err){
                                console.error(err);
                                console.trace();
                                res.send("error in registration", 500);
                            }else{
                                req.session.auth.user._id = _id;
                                req.session.save(function (err, object) {
                                    if (err != null) {
                                        console.error(err);
                                        console.trace();
                                        res.send("error in registration", 500);
                                    } else {
                                        console.log('user _id to session is ok');
                                        redirectAfterLogin(req,res,next);
                                    }

                                });
                            }
                        });
                    }
                });
            }
            else {
                console.log('can\'t authenticate with facebook');
            }
        });
    }

    if (req.query.next) {
        req.session['fb_next'] = req.query.next;

        req.session.save(go);
    }
    else
        go();

};

function redirectAfterLogin(req,res,redirect_to) {
    if(!redirect_to || /^\/account\/register/.test(redirect_to))
        redirect_to = common.DEFAULT_LOGIN_REDIRECT;
    res.redirect(redirect_to);
};


var isUserInDataBase = module.exports.isUserInDataBase = function(user_facebook_id, callback) {

    var user_model = models.User,
        flag = false, user;

    user_model.find({facebook_id:user_facebook_id}, function (err, result) {
        if (err == null) {
            if (result.length == 1) { // its not a new user
                //var user_id = result[0]._id;
                //console.log("isUserInDataBase returns true")
                flag = true;
                user = result[0];
            } else {
                if (result.length == 0) { // its a new user
                    callback(null,false);
                    return;
                } else { // handle error here
                    flag = true;
                    user = result[0];
                    console.error("Error: Too many users with same user_facebook_id");
                }
            }
        } else {
            callback(err);
        }
        callback(err, flag, user);
    });
}

var createNewUser = module.exports.createNewFacebookUser = function (data, access_token, callback) {

    var user = new models.User();
    user.username = data.username;
    user.identity_provider = "facebook";
    user.first_name = data.first_name;
    user.last_name = data.last_name;
    user.email = data.email;
    if (data.hometown) {
        user.address = data.hometown.name;
    }
    user.gender = data.gender;
    user.facebook_id = data.id;
    if(data.invited_by)
        user.invited_by = data.invited_by;
    user.access_token = access_token;
    user.save(function (err, object) {
        if (err != null) {
            console.log(err);
            callback(null);
        } else {
            callback(object.id,object);
            console.log("done creating new user - " + user.first_name + " " + user.last_name);
//            res.write("done creating new user - " + user.first_name + " " + user.last_name);
        }
//        res.end();
    });
}

var updateUesrAccessToken = module.exports.updateUesrAccessToken = function(data, access_token, callback) {
    var user_model = models.User;

    user_model.findOne({facebook_id: data.id}, function (err, user) {
        if (err) {
            return next(err);
        }
        user.access_token = access_token;
//            user.session_id = session_id;
        user.save(function (err) {
            if (err) {
                console.error(err);
                callback(err);
            } else {
                callback(null, user.id);
            }
        });
//        res.end();
    });
}


function facebook_login(req, res){
    function go() {

        req.authenticate("facebook", function (error, authenticated) {
            var next = req.session['fb_next'];
            var referred_by = req.session['referred_by'];
            console.log(error);
            if (authenticated) {

                var user_detailes = req.getAuthDetails().user;
                var access_token = req.session["access_token"];
                var user_fb_id = req.getAuthDetails().user.id;

                isUserInDataBase(user_fb_id, function (is_user_in_db) {

                    if (!is_user_in_db) {
//                        req.session['fb_next'] = "/account/code_after_fb_connect";
//                        next = req.session['fb_next'];
                        user_detailes.invited_by = referred_by;
                        createNewUser(user_detailes, access_token, function (_id) {
                            req.session.user_id = _id;
//                            req.session.auth.user._id = _id; i can delete this
                            req.session.save(function (err, object) {
                                if (err != null) {
                                    console.log(err);
                                } else {
                                    console.log('user _id to session is ok');
                                    redirectAfterLogin(req,res,next);
                                }
                            });
                        });
                    } else {
                        updateUesrAccessToken(user_detailes, access_token, function (err,_id) {
                            if(err){
                                console.error(err);
                                console.trace();
                                res.send("error in registration", 500);
                            }else{
                                req.session.auth.user._id = _id;
                                req.session.save(function (err, object) {
                                    if (err != null) {
                                        console.error(err);
                                        console.trace();
                                        res.send("error in registration", 500);
                                    } else {
                                        console.log('user _id to session is ok');
                                        redirectAfterLogin(req,res,next);
                                    }

                                });
                            }
                        });
                    }
                });
            }
        });
    }

    if (req.query.next) {
        req.session['fb_next'] = req.query.next;

        req.session.save(go);
    }
    else
        go();
}