/**   Simple Authentication ************/
var Basic = require("connect-auth").Basic
    ,common = require('./common')
    ,Models = require('../../../models');

var SimpleAuthentication = module.exports = function (options) {
    options = options || {};
    var that = Basic(options);
    var my = {};

    function validatePasswordFunction(username, password, successCallback, failureCallback) {

        var user_model = Models.User;

        user_model.findOne({username:username, identity_provider:'register'}, function (err, result) {
            if (err == null) {

                if (result == null) {     //user is not registered
                    failureCallback();
                } else {
                    if (common.check_password(result.password, password)) {
                        successCallback(result.id);
                    } else {
                        failureCallback();
                    }
                }
            } else {
                throw "Error reading db.User";
            }
        });
    }

    that.name = options.name || "simple";

    that.authenticate = function (request, response, callback) {
        var self = this;
        var username = request.body.username;
        var password = request.body.password;
        var email = request.body.email;
//        var _id = request.body._id;

        validatePasswordFunction(username, password, function (custom) {
            var result = /*custom || {"username": username  "email": email };*/{'user_id':custom};
            self.success(result, callback);
        }, function (error) {
            if (error)
                callback(error);
            else
                self.fail(callback);
            //that._unAuthenticated(self, request, response, callback);
        });
    };
    return that;
};
