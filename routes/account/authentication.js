/**   Simple Authentication ************/
var Basic = require("connect-auth").Basic
    ,common = require('./common')
    ,async = require('async')
    ,Models = require('../../models');

var SimpleAuthentication = module.exports = function (options) {
    options = options || {};
    var that = Basic(options);
    var my = {};

    function validatePasswordFunction(request, email, password, successCallback, failureCallback) {

        var user_model = Models.User;

        user_model.findOne({email: email/*, identity_provider:'register'*/}, function (err, result) {
            if (err == null) {

                if (result == null) {     //user is not registered
                    failureCallback('אימייל לא קיים');
                } else {
                    if (common.check_password(result.password, password)) {
                        request.session.user_id = result._id;
                        request.user = result;
                        successCallback(result.id);
                    } else {
                        failureCallback('סיסמא שגויה');
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
        var password = request.body.password;
        var email = request.body.email;
//        var _id = request.body._id;

        validatePasswordFunction(request, email, password, function (custom) {
            var result = {'user_id':custom};
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

