var Basic = require("connect-auth").Basic
    ,async = require('async')
    ,facebook_login = require('./facebook_login')
    ,http = require('request');


module.exports = function (options) {
    options = options || {};
    var that = Basic(options);
    that.name = options.name || "fb_server";

    that.authenticate = function authenticate(request, response, callback) {
        var self = this;
        var access_token = request.body.access_token;

        // check if user is in database
        // if so, update access_token
        // if not, go get user details from facebook and create user in DB
        // finally, self.success(user)
        async.waterfall([
            // get facebook fresh data
            function(cbk){
                http({
                        url:'https://graph.facebook.com/me',
                        qs:{access_token:access_token},
                        json:true,
                        timeout:5000
                    },
                    function (error, response, body) {
                        if (error || response.statusCode != 200) {
                            console.log(error);
                            console.log('getFBUserDetails error: ' + (response && response.statusCode));
                            console.log(body);
                            cbk('error from facebook');
                            return;
                        }
                        cbk(null, body);
                    }
                );
            },

            // check if user is in db
            function(user, cbk){
                self.fb_user_details = user;
                facebook_login.isUserInDataBase(self.fb_user_details.id, function(err, obj){cbk(err, obj)});
            },

            // upsert user data and token
            function(is_user_in_db, cbk){
                if(!is_user_in_db){
                    self.fb_user_details.invited_by = request.session['referred_by'];
                    request.session.is_new_user = true;
                    facebook_login.createNewFacebookUser(self.fb_user_details, access_token, function(maybe_db_user_id) {
                        var maybe_error = (maybe_db_user_id) ? null : 'create user failed';
                        cbk(maybe_error, maybe_db_user_id);
                    });
                    return;
                }
                facebook_login.updateUesrAccessToken(self.fb_user_details, access_token, function(err, obj){
                    cbk(err, obj);
                });
            },

            // save user_id on session
            function(user_id, cbk){
                request.session.user_id = user_id;
                cbk();
            }

        ],
        // main callback
        function(err){
            if(err) {
                self.fail(callback);
                return;
            }
            self.success(request.session.user_id, callback);
        })
    };
    return that;
};
