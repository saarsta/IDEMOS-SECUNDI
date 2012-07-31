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
    async = require('async'),
    POST_PRICE = 1;

var PostActionResource = module.exports = common.GamificationMongooseResource.extend({
    init:function () {
        this._super(models.PostAction, 'post_action');
        this.allowed_methods = ['get', 'post'];
        this.authorization = new common.TokenAuthorization();
        this.authentication = new common.SessionAuthentication();
        this.filtering = {action_id:null};
        this.default_query = function (query) {
            return query.sort('creation_date', 'descending');
        };
    },

    get_objects: function (req, filters, sorts, limit, offset, callback) {
        //TODO - maybe imrove it
//        this._super(req, filters, sorts, limit, offset, function(err, results){
//            var user_id;
//            if(req.user){
//                user_id = req.user._id;
//
//                async.waterfall([
//                    function(cbk){
//                        models.User.findById(user_id, cbk);
//                    },
//
//                    function(user_obj, cbk){
//
//                        var proxies = user_obj.proxy;
//
//                        async.forEach(results.objects, function(post, itr_cbk){
//                            //update each post creator if he is a follower or not
//                            var flag = false;
//
//                            var proxy = _.find(proxies, function(proxy){
//                                if(!post.creator_id)
//                                    return null;
//                                else
//                                    return proxy.user_id + "" == post.creator_id._id + ""});
//                            if(proxy)
//                                post.mandates_curr_user_gave_creator = proxy.number_of_tokens;
//                            if(post.creator_id)
//                                flag =  _.any(post.creator_id.followers, function(follower){return follower.follower_id + "" == user_id + ""});
//                            post.is_user_follower = flag;
//
//                            //update each post creator with his vote balance
//                            models.Vote.findOne({user_id: user_id, post_id: post._id}, function(err, vote){
//                                post.voter_balance = vote ? (vote.ballance || 0) : 0;
//                                itr_cbk(err);
//                            })
//                        }, function(err, obj){
//                            cbk(err, results);
//                        });
//                    }
//                ], function(err, results){
//                    callback(err, results);
//                })
//            }else{
//                _.each(results.objects, function(post){ post.is_user_follower = false; })
//                callback(err, results);
//            }
//        });
    },

    create_obj:function (req, fields, callback) {

        var user_id = req.session.user_id;
        var self = this;
        var base = this._super;
        var post_object = new self.model();
        var user = req.user;

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
                var action_id = object.action_id;
                // if post created successfuly, add user to action
                // + add action to user
                async.parallel([
                    //2.1 if post created successfuly, add user to action to "people that connected somehow to action"
                    function(cbk2)
                    {
                        //TODO - is that right
                        models.Action.update({_id:object.action_id}, {$addToSet: {users: user_id}}, cbk2);

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
                    }
                ],
                    cbk);

            }
        ],function(err,result)
        {
            callback(err, post_object);
        });
    }
});


