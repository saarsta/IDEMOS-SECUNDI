var Model= require("../models.js");
var mongoose_resource = require('jest');
var util = require('util');
var common = require('./common');


//Authorization
var Authoriztion = function() {};
util.inherits(Authoriztion,mongoose_resource.Authorization);

Authoriztion.prototype.limit_object_list = Authoriztion.prototype.limit_object = function(req, query, callback){
    if(req.user){
//        var email = req.session.auth.user.email;
        var user_id = req.user._id;

//        query.where('email', email);
        query.where('_id', user_id);
        callback(null, query);
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
//        discussions:null
//        avatar: null,
        avatar_url:null
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
