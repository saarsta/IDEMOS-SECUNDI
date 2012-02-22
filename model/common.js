/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 15/02/12
 * Time: 17:21
 * To change this template use File | Settings | File Templates.
 */
var util = require('util');
// Authentication

var SessionAuthentication = exports.SessionAuthentication = function () { };
util.inherits(SessionAuthentication,require('jest').Authentication);

SessionAuthentication.prototype.is_authenticated = function(req,callback){
    var is_auth = req.isAuthenticated();
    callback(null, is_auth);
};
