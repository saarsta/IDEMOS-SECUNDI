
var resources = require('jest'),
    util = require('util'),
    models = require('../models'),
    common = require('./common'),
    async = require('async'),
    _ = require('underscore'),
    notifications = require('./notifications');

//Authorization
var Authorization = common.TokenAuthorization.extend({
    limit_object_list:function (req, query, callback) {

        if (req.method == "PUT" || req.method == "DELETE") {
            id = req.user._id;
//            query.where('is_published', false).where('creator_id', id);
            callback(null, query);
        } else {
            if(req.method == "GET"){
                query.where('is_published', true);
                callback(null, query);
            } else{
                callback(null, query);
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
        this.filtering = {subject_id:null, users:null, is_published:null, tags: null,
            'users.user_id': {
                exact:true,
                in:true
            }
        };
        this.authorization = new Authorization();
        this.default_query = function (query) {
            return query.sort('creation_date', 'descending');
        },
            this.fields = {
                title: null,
                image_field: null,
                image_field_preview: null,
                subject_id: null,
                creation_date: null,
                creator_id: null,
                first_name: null,
                last_name: null,
                vision_text_preview: null,
                vision_text: null,
                num_of_approved_change_suggestions: null,
                is_cycle: null,
                tags: null,
                followers_count: null,
                grade:Number,
                evaluate_counter: null,
                _id:null,
                is_follower: null,
                grade_id: null
            };
    },

    get_object:function (req, id, callback) {
        this._super(req, id, function(err, object){
            if(object){
                object.grade_id = 0;
                models.User.find({"discussions.discussion_id": id}, ["email", "first_name", "avatar", "facebook_id", "discussions"], function(err, objs){
                    var users = [];
                    if(!err){
                        object.users = _.map(objs, function(user){
                            var curr_discussion =  _.find(user.discussions, function(discussion){
                                return discussion.discussion_id == id;
                            });
                            return {
                                user_id:user,
                                join_date: curr_discussion.join_date
                            };
                        });
                    }
                    else
                        object.users = [];
                    object.is_follower = false;
                    if(req.user){
                        if(_.find(req.user.discussions, function(user_discussion){return user_discussion.discussion_id == id})){
                            object.is_follower = true;
                        }
                        models.Grade.findOne({user_id: req.user._id}, function(err, grade){
                            if(err){
                                callback(err, object);
                            }
                            else{
                                if (grade)
                                    object.grade_id = grade._id;
                            }
                            callback(err, object);
                        });
                    }else{
                        callback(err, object);
                    }

                });
            }else{
                callback(err, object);
            }
        })
    },

    get_objects: function (req, filters, sorts, limit, offset, callback) {

        var user_id = req.query.user_id || req.user._id;
        if(req.query.get == "myUru"){
            filters['users.user_id'] = user_id;
        }

        this._super(req, filters, sorts, limit, offset, function(err, results){

            var user_discussions;

            if(req.user)
                user_discussions = req.user.discussions;

            _.each(results.objects, function(discussion){
                discussion.is_follower = false;
                if(user_discussions){
                    if(_.find(user_discussions, function(user_discussion){ return user_discussion.discussion_id + "" == discussion._id + "" ; })){
                        discussion.is_follower = true;
                    }
                }
            })

            callback(err, results);
        });
    },

    create_obj:function (req, fields, callback) {
        var user_id = req.session.user_id;
        var self = this;
        var object = new self.model();
        var user = req.user;

        var min_tokens = /*common.getGamificationTokenPrice('create_discussion')*/ 10;
//        var total_tokens = user.tokens + user.num_of_extra_tokens;

        models.InformationItem.count({users: req.user._id}, function(err, count){
            if(!err){
                if(user.tokens <  min_tokens && user.tokens < min_tokens - (Math.min(Math.floor(count/2), 2))){
                    callback({message: "user must have a least 10 tokens to open create discussion", code:401}, null);
                }
                else
                {
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

                                    var user_discussion = {
                                        discussion_id: obj._id,
                                        join_date: Date.now()
                                    }
                                    models.User.update({_id: user._id}, {$addToSet: {discussions: user_discussion}}, function(err, num){
                                        if(!err){
                                            if (object.is_published) {
                                                req.gamification_type = "discussion";
                                                req.token_price = /*common.getGamificationTokenPrice('discussion')*/ 3;
                                            }
                                        }
                                        callback(err, obj);
                                    });
                                }
                            });
                        }
                    });
                }
            }else{
                callback(err, null);
            }
        })
    },

    update_obj:function (req, object, callback) {
        var user = req.user;
        if (req.query.put == "follower"){
            var disc = _.find(user.discussions, function(discussion) {return discussion.discussion_id + '' == object._id +'';} );
            if(!disc){
                async.parallel([
                    function(cbk2){
                        var user_discussion = {
                            discussion_id: object._id,
                            join_date: Date.now()
                        }
                        models.User.update({_id: user._id}, {$addToSet: {discussions: user_discussion}}, cbk2);
                    },

                    function(cbk2){
                        models.Discussion.update({_id: object._id}, {$inc: {followers_count: 1},  $addToSet: {users: user._id}}, cbk2);
                    }
                ], function(){
                    object.followers_count++;
                    object.is_follower = true;
                    callback(null, object);
                });
            }else{
                callback({message:"user is already a follower",code:401}, null);
            }
        }else{
            if(req.query.put == "leave"){

                async.waterfall([
                    function(cbk){
                        var disc = _.find(user.discussions, function(discussion) {return discussion.discussion_id + '' == object._id +'';} );

                        if(disc){
                            //delete this discussion
                                user.discussions.splice(_.indexOf(user.discussions, disc));
                            user.save(cbk);
                        }else{
                            callback({message:"user is not a follower", code:401}, null);
                        }
                    },

                    function(obj, cbk){
                        models.Discussion.update({_id: object._id}, {$inc: {followers_count: -1}}, function(err, num){
                            object.followers_count--;
                            object.is_follower = false;

                            callback(err, object);
                        });
                    }
                ], function(err, result){
                  callback(err, object);
                })
            }else{
                if (object.is_published) {
                    callback("this discussion is already published", null);
                }else {
                    req.gamification_type = "discussion";
                    req.token_price = common.getGamificationTokenPrice('discussion');
                    object.is_published = true;
                    object.save(callback);
                }
            }
        }
    }
});


