var Model= require("../models");
var mongoose_resource = require('jest');
var util = require('util');
var common = require('./common');

//Authorization
//var Authoriztion =  mongoose_resource.Authorization.extend({
//    limit_object_list: function(req, query, callback){
//        if(req.user){
//            var user_id = req.user._id;
//
//            query.where('_id', user_id);
//            callback(null, query);
//        }else{
//            callback({message: "Error: User Is Not Authenticated", code: 401}, null);
//        }
//    }
//});

var UserResource = module.exports =  mongoose_resource.MongooseResource.extend({
    init: function() {
        this._super(Model.User, null);
        this.fields = {
            id : null,
//            username:null,
//            facebook_id:null,
            first_name:null,
            last_name:null,
//            email:null,
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
//        this.authorization = new Authoriztion();
        this.filtering = {'followers.follower_id': {
            exact:true,
            in:true
        }}
    }
});


