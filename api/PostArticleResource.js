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
//    this.validation = new resources.Validation();=
    },

    run_query: function(req,query,callback)
    {
        query.populate('creator_id');
        this._super(req,query,callback);
    }
})