var Model= require("../models");
var mongoose_resource = require('jest');
var util = require('util');
var common = require('./common');

var UserResource = module.exports =  mongoose_resource.MongooseResource.extend({
    init: function() {
        this._super(Model.User, null);
        this.fields = {
            id : null,
//            username:null,
//            facebook_id:null,
            first_name: null,
            last_name: null,
            biography: null,

//            email:null,
            gender:null,
            age:null,
//        discussions:null
//        avatar: null,
            avatar_url:null
        };
        this.update_fields = {
//            first_name:null,
//            last_name:null,
//            gender:null,
//            age:null
            biography: null
        }
        this.allowed_methods = ['get','post','put','delete'];
        this.authentication = new common.SessionAuthentication();
//        this.authorization = new Authoriztion();
        this.filtering = {'followers.follower_id': {
            exact:true,
            in:true
        }}
    },

    //update user biography
    update_obj: function (req, object, callback) {
        object.biography = req.body.biography;

        object.save(function(err, user_obj){
            callback(err, user_obj);
        })
    }
});


