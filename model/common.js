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



var isUserIsInDiscussion = exports.isUserIsInDiscussion = function(user_id, users_list){
    var flag = false;
    for (var i = 0; i < users_list.length; i++){
        if (user_id == users_list[i]){
            flag = true;
            break;
        }
    }
    return flag;
}

var isDiscussionIsInUser = exports.isDiscussionIsInUser = function(discussion_id, discussions_list){
    var flag = false;
    for (var i = 0; i < discussions_list.length; i++){
        if (discussion_id == discussions_list[i]){
            flag = true;
            break;
        }
    }
    return flag;
};


var GamificationResource = function()
{

};
