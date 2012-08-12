/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 23/02/12
 * Time: 12:03
 * To change this template use File | Settings | File Templates.
 */

var resources = require('jest'),
    og_action = require('../../og/og.js').doAction,
    models = require('../../models'),
    common = require('../common.js'),
    async = require('async'),
    _ = require('underscore'),
    sanitizer = require('sanitizer'),
    notifications = require('../notifications.js');

var PostResource = module.exports = common.GamificationMongooseResource.extend({
    init:function () {

        this._super(models.Post, 'post', null);
        this.allowed_methods = ['get', 'post'];
        this.authorization = new common.TokenAuthorization();
        this.authentication = new common.SessionAuthentication();
        this.filtering = {discussion_id:null};
        this.default_query = function (query) {
            return query.sort('creation_date', 'ascending');
        };
        this.fields = {
            creator_id : common.user_public_fields,
            voter_balance: null,
            mandates_curr_user_gave_creator: null,
            text:null,
            popularity:null,
            tokens:null,
            creation_date: null,
            total_votes:null,
            votes_against:null,
            votes_for:null,
            _id:null,
            ref_to_post_id: null,
            discussion_id:null,
            is_user_follower: null
        };
//    this.validation = new resources.Validation();=
        this.default_limit = 50;
    },

    run_query: function(req,query,callback)
    {
        query.populate('creator_id');
        this._super(req,query,callback);
    },

    get_objects: function (req, filters, sorts, limit, offset, callback) {
        this._super(req, filters, sorts, limit, offset, function(err, results){
           var user_id;
            if(req.user){
                user_id = req.user._id;

                        async.waterfall([
                            function(cbk){
                                models.User.findById(user_id, cbk);
                            },

                            function(user_obj, cbk){

                                var proxies = user_obj.proxy;

//                                _.each(results.objects, function(post){
//                                    var flag = false;
//
//                                    var proxy = _.find(proxies, function(proxy){
//                                        if(!post.creator_id)
//                                            return null;
//                                        else
//                                            return proxy.user_id + "" == post.creator_id._id + ""});
//                                    if(proxy)
//                                        post.mandates_curr_user_gave_creator = proxy.number_of_tokens;
//                                    if(post.creator_id)
//                                        flag =  _.any(post.creator_id.followers, function(follower){return follower.follower_id + "" == user_id + ""});
//                                    post.is_user_follower = flag;
//                                })

                                async.forEach(results.objects, function(post, itr_cbk){
                                    //update each post creator if he is a follower or not
                                    var flag = false;

                                    var proxy = _.find(proxies, function(proxy){
                                        if(!post.creator_id)
                                            return null;
                                        else
                                            return proxy.user_id + "" == post.creator_id._id + ""});
                                    if(proxy)
                                        post.mandates_curr_user_gave_creator = proxy.number_of_tokens;
                                    if(post.creator_id)
                                        flag =  _.any(post.creator_id.followers, function(follower){return follower.follower_id + "" == user_id + ""});
                                    post.is_user_follower = flag;

                                    //update each post creator with his vote balance
                                    models.Vote.findOne({user_id: user_id, post_id: post._id}, function(err, vote){
                                        post.voter_balance = vote ? (vote.ballance || 0) : 0;
                                        itr_cbk(err);
                                    })
                                }, function(err, obj){
                                    cbk(err, results);
                                });
                            }
                        ], function(err, results){
                            callback(err, results);
                        })
            }else{
                _.each(results.objects, function(post){ post.is_user_follower = false; })
                callback(err, results);
            }
        });
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
            if(user_schema.user_id){
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
            }else{
                console.log("in the following discussion - there is a user with no _id");
                console.log(discussion_id);
                itr_cbk()
            }

        }

        console.log('debugging waterfall');

        /**
         * Waterfall:
         * 1) set post object fields, send to authorization
         * 2) save post object
         * 3) send notifications
         * 4) publish to facebook
         * Final) return the object with the creator user object
         */
        async.waterfall([

            // 1) set post object fields, send to authorization
            function(cbk)
            {
                console.log('debugging waterfall 1');
                fields.creator_id = user_id;
                fields.first_name = user.first_name;
                fields.last_name = user.last_name;
                fields.avatar = user.avatar;
                if(fields.ref_to_post_id == "null" || fields.ref_to_post_id == "undefined")
                    fields.ref_to_post_id = null;

                // TODO add better sanitizer
             //   fields.text = sanitizer.sanitize(fields.text);

                for (var field in fields) {
                        post_object.set(field, fields[field]);
                }
                self.authorization.edit_object(req, post_object, cbk);
            },

            //  2) save post object
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

            // 3) send notifications
            function (object,cbk) {

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

                        models.Discussion.findById(object.discussion_id, function(err, disc_obj){
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
                            models.PostOrSuggestion.findById(post_object.ref_to_post_id, function(err, quoted_post){
                                if(err)
                                    cbk2(err, null);
                                else{
                                    if(quoted_post)
                                        notifications.create_user_notification("been_quoted", post_object._id/*ref_to_post_id*/, quoted_post.creator_id, post_object.creator_id, discussion_id, cbk2);
                                    else
                                    {
                                        console.log("there is no post with post_object.ref_to_post_id id");
                                        cbk2(err, 0);
                                    }
                                }
                            })
                        }else{
                            cbk2(null, 0);
                        }
                    },

                    //if this post create on discussion create, its free of tokens, otherwise put it on req
                    // TODO remove this. Post on Discussion create should be one single resource and one single calls, creation of first post should be done from there -> this check won't be necessary

                    function(cbk2){
                        models.Post.count({discussion_id: post_object.discussion_id}, function(err, count){
                            if(!err){
                                if(count > 1)
                                    req.token_price = common.getGamificationTokenPrice('post');
                            }

                            cbk2(err, count);
                        })
                    }
                    ],
                    cbk);
            },
            // 4) publish to facebook
            function(args,cbk) {
                og_action({
                    action: 'comment',
                    object_name:'discussion',
                    object_url : '/discussions/' + discussion_id + '?hash_post_' + post_id,
                    fid : user.facebook_id,
                    access_token:user.access_token,
                    user:user
                });
                cbk();
            }
        ],function(err)
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

