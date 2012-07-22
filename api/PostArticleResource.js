var resources = require('jest'),
    og_action = require('../og/og').doAction,
    models = require('../models'),
    common = require('./common'),
    async = require('async'),
    _ = require('underscore'),
    notifications = require('./notifications');

var PostArticleResource = module.exports = common.GamificationMongooseResource.extend({
    init:function () {

        this._super(models.PostArticle, 'post_article', 0);
        this.allowed_methods = ['get', 'post'];
        this.authorization = new common.TokenAuthorization();
        this.authentication = new common.SessionAuthentication();
        this.filtering = {article_id:null};
        this.default_query = function (query) {
            return query.sort('creation_date', 'ascending');
        };
        this.update_fields = {
            article_id: null,
            text: null,
            ref_to_post_id: null
        },
        this.fields = {
            creator_id : common.user_public_fields,
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

    run_query: function(req, query,callback)
    {
        query.populate('creator_id');
        this._super(req,query,callback);
    },

    create_obj:function (req, fields, callback) {

        var creator_id = req.user._id;
        var self = this;
        var base = this._super;

        /*
        *  1 - set post fields and create post
        *  final - return the object with creator user object
        *
        *
        * */
        async.waterfall([
            //set post fields and create post
            function(cbk){
                fields.creator_id = user_id;
                fields.first_name = user.first_name;
                fields.last_name = user.last_name;
                fields.avatar = user.avatar;
                fields.ref_to_post_id = fields.ref_to_post_id || null;

                base.call(self, req, fields, cbk);
            }


        ], function(err, post){
            post.creator_id = req.user;
            callback(err, post);
        })
    }
})