/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 15/02/12
 * Time: 20:22
 * To change this template use File | Settings | File Templates.
 */

var resources = require('mongoose-resource'),
    util = require('util'),
    models = require('../models'),
    common = require('./common');


//Authorization
var Authoriztion = function() {};
util.inherits(Authoriztion,resources.Authorization);

Authoriztion.prototype.limit_object_list = function(req, query, callback){
    if(req.session.auth.user){
        var email = req.session.auth.user.email;
        models.User.findOne({email:email},function(err,object)
        {
            if(err) callback(err);
            else
            {
                var id = object.id;
                query.where('users', id);
                callback(null, query);
            }
        });
    }else{
        callback("Error: User Is Not Authenticated", null);
    }
};

var ShoppingCartResource = module.exports = function()
{
    ShoppingCartResource.super_.call(this,models.InformationItem);
    this.allowed_methods = ['get','post', 'put', 'delete'];
    this.authentication = new common.SessionAuthentication();
   // this.authorization = new Authoriztion();
    this.default_query = function(query)
    {
        return query.where('is_visible',true).sort('creation_date','descending');
    };
    //this.validation = new resources.Validation();
};


util.inherits(ShoppingCartResource,resources.MongooseResource);

ShoppingCartResource.prototype.update_obj = function(req,object,callback){
    object.users.push(req.session.auth.user._id);
    object.save(callback);
}

ShoppingCartResource.prototype.delete_obj = function(req,object,callback){
    object.users.pop(req.session.auth.user._id);
    object.save(callback);
}
