/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 23/02/12
 * Time: 12:03
 * To change this template use File | Settings | File Templates.
 */

var resources = require('jest'),
    util = require('util'),
    models = require('../../models'),
    common = require('../common.js'),
    notifications = require('../notifications.js'),
    async = require('async');

var PostActionResource = module.exports = common.GamificationMongooseResource.extend({
    init:function () {
        this._super(models.PostAction, 'post_action');
        this.allowed_methods = ['get', 'post'];
        this.authorization = new common.TokenAuthorization();
        this.authentication = new common.SessionAuthentication();
        this.filtering = {action_id:null};
        this.default_query = function (query) {
            return query.sort({creation_date: 'descending'});
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
    },

    run_query: function(req,query,callback)
    {
        query.populate('creator_id', {"_id": 1, "avatar": 1, "first_name": 1, "last_name" : 1, "score": 1, "facebook_id": 1,"num_of_proxies_i_represent": 1});
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
                            models.VoteActionPost.findOne({user_id: user_id, post_action_id: post._id}, function(err, vote){
                                post.voter_balance = vote ? (vote.balance || 0) : 0;
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

        var user_id = req.session.user_id + "";
        var self = this;
        var base = this._super;
        var post_object = new self.model();
        var user = req.user;
        if(!fields.ref_to_post_id || fields.ref_to_post_id == "null" || fields.ref_to_post_id == "undefined")
            delete fields.ref_to_post_id;

        async.waterfall([

            // 1. create post
            function(cbk){
                fields.creator_id = user_id;
                fields.first_name = user.first_name;
                fields.last_name = user.last_name;

                base.call(self, req, fields, cbk);
            },

            //2.1 if post created successfuly, add user to action to "people that connected somehow to action"
            //2.2 add action to user ?(duplication of "people that connected somehow to action")
            function (object,cbk) {
                post_object = object;
                var action_id = object.action_id;
                // if post created successfuly, add user to action
                // + add action to user
                async.parallel([
                    //2.1 if post created successfuly, add user to action to "people that connected somehow to action"
                    function(cbk2)
                    {
                        // here i can use "$$addToSet" cause this is a new action, so this is the first user
                        models.Action.update({_id:object.action_id}, {$addToSet: {users: {user_id:user_id,join_date:new Date()}}}, cbk2);

                    },
                    //2.2 add action to user ?(duplication of "people that connected somehow to action")
                    function(cbk2)
                    {
                        // add action_id to the list of actions in user
                        if (_.any(user.actions, function(action){ return object.action_id + "" == action}))
                            user.actions.push({action_id: object.action_id, join_date: Date.now()});

                        user.save(function(err,result)
                        {
                            cbk2(err,result);
                        });
                    },

                    // update actions done by user
                    function(cbk2){
                        models.User.update({_id:user.id},{$set: {"actions_done_by_user.post_on_object": true}}, function(err){
                            cbk2(err);
                        });
                    },

                    //add notifications to users that joined the action
                    function(cbk2){
                        action_id = action_id + "";
                        models.Action.findById(action_id, {'_id': 1, 'going_users': 1, 'cycle_id': 1, 'creator_id': 1}, function(err, action){
                            var creator_id = action.creator_id + "";
                            var notified_users = _.chain(action.going_users)
                                .map(function(user){return user.user_id + ''})
                                .compact()
                                .uniq()
                                .value();

                            async.forEach(notified_users, function(notified_user, itr_cbk){
                                if(user_id != notified_user){
                                    if(creator_id == notified_user){
                                        notifications.create_user_notification("post_added_to_action_you_created", post_object.id,
                                            notified_user, user_id , action_id, '/actions/' + action_id, function(err){
                                                itr_cbk(err);
                                            });
                                    } else {
                                        notifications.create_user_notification("post_added_to_action_you_joined", post_object.id,
                                            notified_user, user_id , action_id, '/actions/' + action_id, function(err){
                                                itr_cbk(err);
                                            });
                                    }
                                } else {
                                    itr_cbk();
                                }
                            }, cbk2)
                        })


                    }
                ],
                    cbk);

            }
        ],function(err,result)
        {
            //update each post creator with his vote balance
            post_object = JSON.parse(JSON.stringify(post_object));
            post_object.voter_balance = 0;
            post_object.is_user_follower = false;
            post_object.creator_id = req.user;
            callback(err, post_object);
        });
    }
});


