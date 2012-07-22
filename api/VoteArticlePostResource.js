var resources = require('jest'),
    util = require('util'),
    models = require('../models'),
    async = require('async'),
    _ = require('underscore'),
    common = require('./common');
    notifications = require('./notifications');


var VoteArticlePostResource = module.exports = common.GamificationMongooseResource.extend({
    init:function () {
        this._super(models.VoteArticle, 'vote_on_article_post', common.getGamificationTokenPrice('vote_on_article_post'));
        this.allowed_methods = ['post'];
        this.authentication = new common.SessionAuthentication();
        this.filtering = {discussion_id:null},
            this.fields = {
                votes_for:null,
                votes_against:null,
                popularity:null,
                updated_user_tokens:null
            };
    }
})