/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 30/05/12
 * Time: 16:40
 * To change this template use File | Settings | File Templates.
 */

var resources = require('jest'),
    util = require('util'),
    models = require('../models'),
    common = require('./common'),
    async = require('async'),
    _ = require('underscore');

var Authorization = resources.Authorization.extend({
    edit_object : function(req,object,callback){
        if(req.user){
            if(object._id + "" == req.user._id + "")
                callback({message:"Error: Unauthorized - can't become your own follower", code: 401}, null);
            else
                callback();
        }else{
            callback({message: "Error: User Is Not Authenticated", code: 401}, null);
        }
    },

    limit_object_list: function(req, query, callback){
        if(req.user){
            var user_id = req.user._id;

            query.where('_id', user_id);
            callback(null, query);
        }else{
            callback({message: "Error: User Is Not Authenticated", code: 401}, null);
        }
    }
});

var UserFollowerResource = module.exports = common.GamificationMongooseResource.extend({
    init: function(){
        this._super(models.User, null, 0);
        this.allowed_methods = ['get', 'put'];
        this.authentication = new common.SessionAuthentication();
        this.authorization = new Authorization();
        this.fields = {
            _id: null,
            first_name: null,
            last_name: null,
            followers: {
                follower_id: {
                    _id: null,
                    first_name: null,
                    last_name: null,
                    avatar:null
                },
                join_date: null
            },
            is_follower: null
        }
//        this.default_query = function(query){
//            return query.populate("followers.follower_id");
//        };

    },

    run_query: function(req,query,callback)
    {
        if(req.method == 'GET'){
            query.populate("followers.follower_id");
        };
        this._super(req,query,callback);
    },

    get_object: function(req, id, callback){
        this._super(req, id, function(err, obj){
            if(req.method == "GET")
                _.each(obj.followers, function(follower){follower.follower_id.avatar = follower.follower_id.avatar_url()});
            callback(err, obj);
        })
    },

//    get_objects: function (req, filters, sorts, limit, offset, callback) {
//        this._super(req, filters, sorts, limit, offset, function(err, results){
//            var a = 8;
//        })
//    },

    update_obj: function (req, object, callback) {

        var follower_id = req.user._id;
        var follower = _.find(object.followers, function(follower){return follower.follower_id + "" == follower_id + ""});

        if(follower){
            //delete follower

            follower.remove(function(err, res){
                if(!err){
                    object.save(function(err, obj){
                        obj.is_follower = false;
                        callback(err, obj);
                    })
                }
            })
        }else{
            //add follower
            var new_follower = {
                follower_id: follower_id,
                join_date: Date.now()
            }

            object.followers.push(new_follower);
            object.save(function(err, obj){
                obj.is_follower = true;
                callback(err, obj);
            })
        }
    }
})