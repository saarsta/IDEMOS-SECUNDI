/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 23/02/12
 * Time: 12:03
 * To change this template use File | Settings | File Templates.
 */

var resources = require('jest'),
    util = require('util'),
    models = require('../models'),
    common = require('./common'),
    async = require('async'),
    _ = require('underscore'),
    notifications = require('./notifications');

var PostResource = module.exports = common.GamificationMongooseResource.extend({
    init:function () {

        this._super(models.Post, 'post', common.getGamificationTokenPrice('post') || 0);
        this.allowed_methods = ['get', 'post'];
        this.authorization = new common.TokenAuthorization();
        this.authentication = new common.SessionAuthentication();
        this.filtering = {discussion_id:null};
        this.default_query = function (query) {
            return query.sort('creation_date', 'ascending');
        };
        this.fields = {
            creator_id : {
                id:null,
                first_name:null,
                last_name:null,
                avatar_url:null,
                score: null,
                facebook_id:null
            },
            text:null,
            popularity:null,
            tokens:null,
            creation_date:null,
            total_votes:null,
            votes_against:null,
            votes_for:null,
            _id:null,
            discussion_id:null
        };
//    this.validation = new resources.Validation();=
    },

    run_query: function(req,query,callback)
    {
        query.populate('creator_id');
        this._super(req,query,callback);
    },

    create_obj:function (req, fields, callback) {

        var user_id = req.session.user_id;
        var self = this;
        var post_object = new self.model();
        var user = req.user;
//        var notification_type = "comment_on_discussion_you_are_part_of"
        var discussion_id;
        var discussion_creator_id;
        var post_id;

        var iterator = function(user_schema, itr_cbk){
            if (user_schema.user_id == user_id)
                itr_cbk(null, 0);
            else{
                if (discussion_creator_id + "" == user_schema.user_id + ""){
                    notifications.create_user_notification("comment_on_discussion_you_created", discussion_id, user_schema.user_id, user_id, post_id,function(err, results){
                        itr_cbk(err, results);
                    });
                }else{
                    notifications.create_user_notification("comment_on_discussion_you_are_part_of", discussion_id, user_schema.user_id, user_id, post_id,function(err, results){
                        itr_cbk(err, results);
                    });
                }
            }
        }

        console.log('debugging waterfall');

        async.waterfall([

            function(cbk)
            {
                console.log('debugging waterfall 1');
                fields.creator_id = user_id;
                fields.first_name = user.first_name;
                fields.last_name = user.last_name;
                fields.avatar = user.avatar;
                if(fields.ref_to_post_id == "null" || fields.ref_to_post_id == "undefined")
                    fields.ref_to_post_id = null;

                for (var field in fields) {
                        post_object.set(field, fields[field]);
                }
                self.authorization.edit_object(req, post_object, cbk);
            },

            function(_post_object, cbk){
                post_id = _post_object._id;
                post_object = _post_object;
                console.log('debugging waterfall 2');
                discussion_id = post_object.discussion_id;
                post_object.save(function(err,result,num)
                {
                    cbk(err,result);
                });
            },
            function (object,cbk) {
//                discussion_id = object.discussion_id;
                console.log('debugging waterfall 3');
                //if post created successfuly, add user to discussion
                // + add discussion to user
                //  + take tokens from the user

                async.parallel([
                    function(cbk2)
                    {
                        console.log('debugging waterfall 3 1');

                        //add user that connected somehow to discussion
                        models.Discussion.update({_id:object.discussion_id, "users.user_id": {$ne: user_id}},
                            {$addToSet: {users: {user_id: user_id, join_date: Date.now}}}, cbk2);
                    },

                    //add notification for the dicussion's connected people or creator
                    function(cbk2){
                        console.log('debugging waterfall 3 2');

                        models.Discussion.findById(object.discussion_id, /*["users", "creator_id"],*/ function(err, disc_obj){
                             if (err)
                                cbk2(err, null);
                             else{
                                discussion_creator_id = disc_obj.creator_id;
                                async.forEach(disc_obj.users, iterator, cbk2);
                             }
                        })
                    },

                    //add notification for Qouted comment creator
                    function(cbk2){
                        console.log('debugging waterfall 3 3');

                        if(post_object.ref_to_post_id){
                            models.Post.findById(post_object.ref_to_post_id, function(err, quoted_post){
                                if(err)
                                    cbk2(err, null);
                                else{
                                    notifications.create_user_notification("been_quoted", discussion_id, quoted_post.creator_id, post_object.creator_id, post_object._id/*ref_to_post_id*/, cbk);
                                }
                            })
                        }else{
                            cbk2(null, 0);
                        }
                    }
                    ],
                    cbk);

            }
        ],function(err,result)
        {
            var rsp = {};
            _.each(['text','popularity','creation_date','votes_for','votes_against', '_id'],function(field)
            {
                rsp[field] = post_object[field];
            });
            rsp.creator_id = req.user;
            callback(err, rsp);
        });
    }
});

