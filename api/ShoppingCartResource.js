/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 15/02/12
 * Time: 20:22
 * To change this template use File | Settings | File Templates.
 */

var resources = require('jest'),
    util = require('util'),
    models = require('../models'),
    common = require('./common');


    //Authorization
    var Authoriztion = function() {};
    util.inherits(Authoriztion,resources.Authorization);

    Authoriztion.prototype.limit_object_list = function(req, query, callback){
        if(req.session.auth.user){
                    var id = req.session.user_id;
                    query.where('users', id);
                    callback(null, query);
        }else{
            callback({message: "Error: User Is Not Authenticated", code: 401}, null);
        }
    };

var ShoppingCartResource = module.exports = function()
{
    ShoppingCartResource.super_.call(this,models.InformationItem);
    this.allowed_methods = ['get','post', 'put', 'delete'];
    this.authentication = new common.SessionAuthentication();
    this.authorization = new Authoriztion();
    this.default_query = function(query)
    {
        return query.where('is_visible',true).sort({'creation_date':'descending'});
    };
    //this.validation = new resources.Validation();
};


util.inherits(ShoppingCartResource,resources.MongooseResource);

ShoppingCartResource.prototype.update_obj = function(req,object,callback){
    var id = req.session.user_id;
    var is_exist = false;
//    models.InformationItem.update({_id:object._id},{$addToSet:{users:id}},function(err,n)
//    {
//        callback(err,object);
//    });
    object.users = object.users || [];
    for(var i=0; i<object.users.length; i++){
        if (object.users[i] == id){
            is_exist = true;
            break;
        }
    }
    if(is_exist){
        callback({message:"information item is already in shoping cart", code: 401}, null);
    }else{
        object.users.push(req.session.user_id);
        object.save(function(err, result){
            callback(err, result);
        });
    }
}

ShoppingCartResource.prototype.delete_obj = function(req,object,callback){
    for(var i=0; i<object.users.length; i++)
    {
        if(object.users[i] == req.session.user_id)
        {
            object.users.splice(i,1);
            i--;
        }
    }
    object.save(callback);
}
