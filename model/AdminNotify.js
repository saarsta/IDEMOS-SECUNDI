/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 27/03/12
 * Time: 17:53
 * To change this template use File | Settings | File Templates.
 */

var resources = require('jest'),
    util = require('util'),
    models = require('../models'),
    async = require('async'),
    common = require('./common');

var AdminAuthentication = function () { };
util.inherits(AdminAuthentication, resources.Authentication);

AdminAuthentication.prototype.is_authenticated = function(req,callback){
    var is_auth = req.isAuthenticated();
    if(is_auth)
    {
        var user_id = req.session.user_id;
        models.User.findById(user_id,function(err,user)
        {
            if(err)
            {
                callback(err);
            }
            else
            {
//                req.user = user;
                callback(null,true);
            }
        });
    }
    else
        callback(null,false);
};

var AdminAuthorization = resources.Authorization.extend( {
    /*init:function(token_price)
    {
        this.token_price = token_price;
    },*/

    edit_object : function(req,object,callback){

        //TODO ishai how to recognize admin?
        if(req.user.admin)
        {
            callback(null, object);
        }else{
            callback({message:"Error: Unauthorized - only admin can do this action",code:401}, null);
        }
    }
});

var AdminNotify = module.exports = common.GamificationMongooseResource.extend(
{
    init:function () {
//        this._super(models.InformationItem, null, null);
        this._super(null, null, null);
        this.allowed_methods = ['post'];
        this.authentication = new AdminAuthentication();
        this.authorization = new AdminAuthorization();
    },

    //this happens after admin changed something that sould modify user gamification...
    //gamification_type and user_id can be passed through req.data or something
    //TODO to "letaem" with ishai
    create_obj: function(req, fields, callback){
        req.gamification_type = req.data.approved_info_item;

        models.User.findById(req.data.user_id, function(err, user){
            if(err){
                callback(err, null)
            }else{
                req.user = user;
                callback(null, null);
            }
        });
    }
});
