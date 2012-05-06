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
    _ = require('underscore');

var PostResource = module.exports = common.GamificationMongooseResource.extend({
    init:function () {

        this._super(models.Post, 'post', common.getGamificationTokenPrice('post'));
        this.allowed_methods = ['get', 'post'];
        this.authorization = new common.TokenAuthorization();
        this.authentication = new common.SessionAuthentication();
        this.filtering = {discussion_id:null};
        this.default_query = function (query) {
            return query.sort('creation_date', 'descending');
        };
        this.fields = {
            creator_id : {
                first_name:null,
                last_name:null,
                avatar_url:null,
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

        console.log('debugging waterfall');

        async.waterfall([

            function(cbk)
            {
                console.log('debugging waterfall 1');
                fields.creator_id = user_id;
                fields.first_name = user.first_name;
                fields.last_name = user.last_name;
                fields.avatar = user.avatar;

                for (var field in fields) {
                    post_object.set(field, fields[field]);
                }
                self.authorization.edit_object(req, post_object, cbk);
                g_user = user;
            },

            function(post_object, cbk){

                console.log('debugging waterfall 2');
                var discussion_id = post_object.discussion_id;
                post_object.save(function(err,result,num)
                {
                    cbk(err,result);
                });
            },
            function (object,cbk) {
                var discussion_id = object.discussion_id;
                console.log('debugging waterfall 3');
                //if post created successfuly, add user to discussion
                // + add discussion to user
                //  + take tokens from the user
                async.parallel([
                    function(cbk2)
                    {
                        console.log('debugging waterfall 3 1');
                        models.Discussion.update({_id:object.discussion_id}, {$addToSet: {users: user_id}}, cbk2);

                    },
                    function(cbk2)
                    {
                        console.log('debugging waterfall 3 2');
                        // add discussion_id to the list of discussions in user
                        if (common.isArgIsInList(object.discussion_id, user.discussions) == false) {
                            user.discussions.push(object.discussion_id);
                        }
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
            var rsp = {};
            _.each(['text','popularity','creation_date','votes_for','votes_against'],function(field)
            {
                rsp[field] = post_object[field];
            });
            rsp.creator_id = req.user;
            callback(self.elaborate_mongoose_errors(err), rsp);
        });
    }
});

