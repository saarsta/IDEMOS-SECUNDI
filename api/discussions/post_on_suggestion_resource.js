
var resources = require('jest'),
    og_action = require('../../og/og.js').doAction,
    models = require('../../models'),
    common = require('../common.js'),
    async = require('async'),
    _ = require('underscore');

var PostOnSuggestionResource = module.exports = common.GamificationMongooseResource.extend({
    init:function () {

        this._super(models.PostSuggestion, null, 0);
        this.allowed_methods = ['get', 'post'];
        this.authorization = new common.TokenAuthorization();
        this.authentication = new common.SessionAuthentication();
        this.filtering = {suggestion_id: null};
        this.default_query = function (query) {
            return query.sort({creation_date:'ascending'});
        };
        this.fields = {
            creator_id : null,
            username: null,
            avatar: null,
            text:null,
            creation_date: null,
            _id:null,
            discussion_id:null,
            suggestion_id: null
        };
        this.default_limit = 50;
    },

    run_query: function(req,query,callback)
    {
        query.populate('creator_id');
        this._super(req,query,callback);
    },

    get_objects: function (req, filters, sorts, limit, offset, callback) {
        // get user's avatar for each post
        this._super(req, filters, sorts, limit, offset, function(err, results){
            if(!err) {
                _.each(results.objects, function(post){
                    post.avatar = post.creator_id.avatar_url();
                    post.username = post.creator_id.toString();
                });
            }

            callback(err, results);
        });
    },

    create_obj: function(req, fields, callback) {
        var user_id = req.session.user_id;
        var user = req.session.user;

        fields.creator_id = user_id;
        fields.first_name = user.first_name;
        fields.last_name = user.last_name;
        fields.avatar = user.avatar;

        async.waterfall([

            // call constructor and create post_suggestion object
            function(cbk){
                this._super(req, fields, function(err, post_suggestion){
                    callback(err, post_suggestion);
                });
            }
        ])
    }
});
