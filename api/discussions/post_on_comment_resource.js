
var resources = require('jest'),
    og_action = require('../../og/og.js').doAction,
    models = require('../../models'),
    common = require('../common.js'),
    async = require('async'),
    _ = require('underscore');

var PostOnCommentResource = module.exports = common.GamificationMongooseResource.extend({
    init:function () {

        this._super(models.PostOnComment, null, 0);
        this.allowed_methods = ['get', 'post', 'delete'];
        this.authorization = new common.TokenAuthorization();
        this.authentication = new common.SessionAuthentication();
        this.filtering = {post_id: null};
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
            post_id: null,
            is_my_comment: null
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
                    post.creator_id = post.creator_id.id;

                    //set is_my_comment flag
                    post.is_my_comment = (req.user && req.user.id + "" === (post.creator_id && post.creator_id + ""));
                });
            }

            callback(err, results);
        });
    },

    create_obj: function(req, fields, callback) {
        var self = this;
        var user = req.session.user;

        fields.creator_id = req.session.user.id;
        fields.first_name = user.first_name;
        fields.last_name = user.last_name;

        self._super(req, fields, function(err, post_on_comment){
            post_on_comment.avatar = req.user.avatar_url();
            post_on_comment.username = req.user + "";

            callback(err, post_on_comment);
        });
    },

    delete_obj: function(req,object,callback){
        if (object.creator_id && (req.user.id === object.creator_id.id)){
            object.remove(function(err){
                callback(err);
            })
        }else{
            callback({err: 401, message :"user can't delete posts of others"});
        }
    }
});
