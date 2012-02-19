var Model= require("../Models.js");
var mongoose_resource = require('mongoose-resource');
var util = require('util');
var common = require('./common');


//Authorization
var Authoriztion = function() {};
util.inherits(Authoriztion,mongoose_resource.Authorization);

Authoriztion.prototype.limit_object_list = function(req, query, callback){
    if(req.session.auth.user){
        var email = req.session.auth.user.email;
        query.where('email', email);
        callback(null, query);
    }else{
        callback("Error: User Is Not Autthenticated", null);
    }
};

Authoriztion.prototype.limit_object = function(req,object,callback){
    if(req.session.auth.user){
        var email = req.session.auth.user.email;
        object.where('email', email);
        callback(null, object);
    }else{
        callback("Error: User Is Not Autthenticated", null);
    }
};

Authoriztion.prototype.edit_object = function(req,object,callback){
    if(req.session.auth.user){
        var email = req.session.auth.user.email;
        object.where('email', email);
        callback(null, object);
    }else{
        callback("Error: User Is Not Autthenticated", null);
    }
};


var UserResource = module.exports =  function() {
    UserResource.super_.call(this,Model.User);
    this.fields = {
        id : null,
        username:null,
        facebook_id:null,
        first_name:null,
        last_name:null,
        email:null,
        gender:null,
        age:null,
        discussions:null
    };
    this.update_fields = {
        first_name:null,
        last_name:null,
        gender:null,
        age:null
    }
    this.allowed_methods = ['get','post','put','delete'];
    this.authentication = new common.SessionAuthentication();
    this.authorization = new Authoriztion();
};


util.inherits(UserResource,mongoose_resource.MongooseResource);


UserResource.prototype.get_object = function(req,id,callback){
    // do stuff before the method
    UserResource.super_.prototype.get_object.call(this,req,id,function(err,object)
    {
        if(err) callback(err);
        else
        {
            // DO stuff after the the method
            //object.comments = Comment.find()
            callback(null,object);
        }
    });
};

UserResource.prototype.limit_update_fields = function(req, callback){

    UserResource.super_.prototype.get_object.call(this, req, function(err, object){
        if(err){
            callback(err);
        } else{
            callback(null, object);

        }
    });
}
