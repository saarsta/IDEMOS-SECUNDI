/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 23/02/12
 * Time: 12:02
 * To change this template use File | Settings | File Templates.
 */

var resources = require('jest'),
    util = require('util'),
    models = require('../models'),
    common = require('./common'),
    async = require('async'),
    DISCUSSION_PRICE = 3;

//Authorization
var Authorization = common.TokenAuthorization.extend({
    limit_object_list:function (req, query, callback) {

        if (req.method == "GET"){
            if (req.session.auth.user) {
                var id = req.session.user_id;

                if (req.method == "PUT" || req.method == "DELETE") {
                    query.where('is_published', false).where('creator_id', id);
                    callback(null, query);
                } else {
                    query.or([
                        { 'is_published':true },
                        {'creator_id':id }
                    ]);
                    callback(null, query);
                }
            } else {
                callback("Error: User Is Not Authenticated", null);
            }

        }
    },
    limit_object:function (req, query, callback) {
        return this.limit_object_list(req, query, callback);
    }
});

var DiscussionResource = module.exports = common.GamificationMongooseResource.extend({
    init:function () {
        this._super(models.Discussion, null, 0);
        this.allowed_methods = ['get', 'post', 'put', 'delete'];
        this.authentication = new common.SessionAuthentication();
        this.filtering = {subject_id:null, users:null, is_published:null, tags: null};
        this.authorization = new Authorization();
        this.default_query = function (query) {
            return query.sort('creation_date', 'descending');
        };
    },

    get_object:function (req, id, callback) {
        var discussion_id = req.discussion;
        models.Discussion.findOne({_id:discussion_id}, function (err, object) {
            if (err) {
                callback(err, null);
            }
            else {
                object.is_follower = common.isArgIsInList(id,req.user.discussions);
                callback(null, object);
            }
        });
    },

    get_objects: function (req, filters, sorts, limit, offset, callback) {

        if(req.query.get == "myUru"){
            filters.users = req.user._id;
        }

        this._super(req, filters, sorts, limit, offset, callback);
    },

    create_obj:function (req, fields, callback) {
        var user_id = req.session.user_id;
        var self = this;
        var object = new self.model();

        var user = req.user;
        fields.creator_id = user_id;
        fields.first_name = user.first_name;
        fields.last_name = user.last_name;
        fields.users = user_id;
        for (var field in fields) {
            object.set(field, fields[field]);
        }

        self.authorization.edit_object(req, object, function (err, object) {
            if (err) callback(err);
            else {
                //if success with creating new discussion - add discussion to user schema
                object.save(function (err, obj) {
                    if (!err) {
                        user.discussions.push(obj._id);
                        if (object.is_published) {
                            req.gamification_type = "discussion";
                            req.token_price = DISCUSSION_PRICE;
                        }
                        user.save(function (err, user) {
                            callback(self.elaborate_mongoose_errors(err), obj);
                        });
                    }
                });
            }
        });
    },

    update_obj:function (req, object, callback) {

        user = req.user;
        if (req.query.put == "follower"){
            if (common.isArgIsInList(object._id, user.discussions) == false){
                async.parallel([
                    function(cbk2){
                        models.User.update({_id: user._id}, {$addToSet: {discussions: object._id}}, cbk2);
                    },

                    function(cbk2){
                        models.Discussion.update({_id: object._id}, {$inc: {followers_count: 1},  $addToSet: {users: user._id}}, cbk2);
                    }
                ], function(){
                    object.followers_count++;
                    callback(null, object);
                });
            }else{
                callback({message:"user is already a follower",code:401}, null);
            }
        }else{
            if (object.is_published) {
                callback("this discussion is already published", null);
            } else {
                req.gamification_type = "discussion";
                req.token_price = DISCUSSION_PRICE;
                object.is_published = true;
                object.save(callback);
            }
        }
    }
});


