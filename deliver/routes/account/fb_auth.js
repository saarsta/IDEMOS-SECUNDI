var Basic = require("connect-auth").Basic
    ,common = require('./common')
    ,async = require('async')
    ,Models = require('../../../models')
    ,facebook_login = require('./facebook_login');

var FbServerAuthentication = module.exports = function (options) {
    options = options || {};
    var that = Basic(options);
    var my = {};

    that.name = options.name || "fb_server";

    that.authenticate = function (request, response, callback) {
        var self = this;
        var access_token = request.body.access_token;
        var fb_id = request.body.fb_id;
        var fb_user_details;
        var g_user_id;

        // check if user is in data base
        // if so, update access token
        // if not, go get user details from facebook and create user in DB
        // finally, self.success(user)

        async.waterfall([
            function(cbk){
                getFBUserDetails(access_token, cbk);
            },

            function(user, cbk){
                fb_user_details = user;
                fb_user_details.invited_by = request.session['referred_by'];
                facebook_login.isUserInDataBase(fb_id, cbk);
            },

            function(is_user_in_db, cbk){
                if(is_user_in_db)
                    facebook_login.updateUesrAccessToken(fb_user_details, access_token, cbk);
                else
                    facebook_login.createNewUser(fb_user_details, access_token, cbk)
            },

            function(user_id, cbk){
                g_user_id = user_id;
                request.session.user_id = user_id;
                request.session.save(cbk);
            }

        ], function(err, result){
            if(err)
                self.fail(callback);
            else
                self.success(g_user_id, callback);
        })
    };

    return that;
};

var getFBUserDetails = function(token, callback) {
    var request  = https.request({
            host: 'graph.facebook.com',
            path:'/me/?access_token=' + token,
            method:"GET"
        },

        function(res) {
            var lines = [];
            res.on('data',function(d)
            {
                lines.push(d);
            });

            res.on('end',function(err)
            {
                if(res.statusCode != 200) {
                    callback('error from facebook');
                } else {
                    var complete = lines.join('');
                    var json = JSON.parse(complete);
                    callback(null,json);
                }
            });
        });

    request.end();
};
