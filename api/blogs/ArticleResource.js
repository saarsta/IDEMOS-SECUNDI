/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 29/03/12
 * Time: 15:22
 * To change this template use File | Settings | File Templates.
 */

var models = require('../../models'),
    async = require('async'),
    common = require('../common.js'),
    _ = require('underscore'),
    RSS = require('../../lib/ext_rss');

var ArticleResource = common.GamificationMongooseResource.extend({
    init:function () {
        this._super(models.Article, 0, null);
        this.authentication = new common.SessionAuthentication();
        this.allowed_methods = ['get'/*, 'post'*/];
        this.filtering = {popularity_counter: null, tags: null, user_id: null, text: null, title: null};
//        this.update_fields = ["comments", "popolarity_counter", "title", "text", "tags"];
        this.fields = {
            _id: null,
            tooltip_or_title:null,
            title:null,
            text: null,
            time: null,
            tags:null,
            user_id:{
                avatar:null,
                first_name:null,
                last_name:null,
                avatar_url:null,
                id:null,
                score:null
            }

        }
    },

    run_query: function(req,query,callback)
    {
        query.populate('user_id');
        this._super(req,query,callback);
    },

    deserialize: function(req,res,object,status) {

        // Sends rss feed
        if(req.query.rss && req.query.user_id && (status == 200 || !status)){
                var feed = new RSS({
                        title: 'עורו',
                        description: 'בלוגים',
                        feed_url: 'http://www.uru.org.il/blogs/' + object.objects[0].user_id.id,
                        site_url: 'http://www.uru.org.il',
//                        image_url: 'http://example.com/icon.png',
                        author:  object.objects[0].user_id.first_name + " " + object.objects[0].user_id.last_name
                });

                _.each(object.objects,function(article) {
                    var rss_article = {};
                    rss_article.title = article.title;
                    rss_article.description = article.text;
                    rss_article.url = 'http://www.uru.org.il/blogs/article/' + article._id;
                    feed.item(rss_article);
                });

                var xml = feed.xml();

                res.header('Content-Type','text/xml');
                res.send(xml);

        }else{
            this._super(req, res, object, status);
        }

    },


//    dispatch: function(){
//        this.token_price = common.getGamificationTokenPrice('create_article') > -1 ? common.getGamificationTokenPrice('create_article') : 0;
//        this._super.apply(this,arguments);
//    },

//    get_objects: function(req, filters, sorts, limit, offset, callback){
//        this._super(req, filters, sorts, limit, offset, function(err, results){
//
//            var iterator = function(article, itr_cbk){
//                models.User.findById(article.user_id, ["avatar", "facebook_id"], function(err, user_obj){
//                    if(err)
//                        itr_cbk(err);
//                    else
//                    {
//                        if(user_obj)
//                            article.avatar = user_obj.avatar_url();
//                        itr_cbk(err, user_obj);
//                    }
//                })
//            }
//
//            async.forEach(results.objects,iterator, function(err, objects){
//                callback(err, results)
//            });
//        });
//    },

    create_obj:function (req, fields, callback) {
        var user_id = req.session.user_id;
        var self = this;
        var article_object = new self.model();
        var user = req.user;
//        var total_tokens = user.tokens + user.num_of_extra_tokens;

        if(user.tokens < /*common.getGamificationTokenPrice('create_blog')*/12){
            callback({message: "user must have a least 12 tokens to open create a blog", code:401}, null);
        }
        else
        {
            fields.user_id = user_id;
            fields.first_name = user.first_name;
            fields.last_name = user.last_name;
            fields.avatar=user.avatar;
            self._super(req,fields,callback);
        }
    }
});

var ArticleCommentResource = common.GamificationMongooseResource.extend({
    init:function () {
        this._super(models.Article, null, null);
        this.authentication = new common.SessionAuthentication();
        this.allowed_methods = ['put'];
        this.update_fields = [];
        this.usage = this.usage || {};
        this.usage.add_comment = {
            url:'/<article_id>',
            method:'put',
            body:
            {
                type:"add_comment",
                text:"<your comment>"
            }
        };
        this.usage.add_vote = {
            url :'/<article_id>',
            method:'put',
            body:{
                type:"add_vote",
                comment_time:"<comment_time>",
                method:"vote_for"
            }
        };

        this.usage.add_reply = {
            url:'/<article_id>',
            method:'put',
            body:{
                type:"add_reply",
                comment_time:"<comment_time>",
                text:"<your text reply>"
            }
        };
    },

    update_obj:function (req, object, callback) {
        var user_id = req.session.user_id;
        var self = this;
        var user = req.user;
        var update_type = req.body.type;
        var i_index;
        var j_index = null;
        var exist = false;

        switch (update_type) {
            case "add_comment":
                var comment = {};
                comment.time = new Date().getTime();
                comment.author = user_id;
                comment.first_name = user.first_name;
                comment.last_name = user.last_name;
                comment.text = req.body.text;
                comment.votes = [];
                models.Article.update({_id:object._id}, {$addToSet:{comments:comment}}, function (err, result) {
                    callback(err, result);
                });
                break;

            case "add_vote":
                var comment_vote = {};
                comment_vote.user_id = user_id;
                for (var i = 0; i < object.comments.length; i++) {
                    if (object.comments[i].time - new Date(req.body.comment_time)) {
                        i_index = i;
                        break;
                    }
                    for (var j = 0; j < object.comments.length; i++) {
                        if (object.comments[i].time - new Date(req.body.comment_time)) {
                            exist = true;
                            i_index = i;
                            j_index = j;
                            break;
                        }
                    }
                }

                if (!exist) {
                    callback({message:"comment isnt exist", code:404}, null);
                } else {
                    var target_comment = null;
                    if(j_index)
                        target_comment = object.comments[i_index][j_index]
                    else
                        target_comment = object.comments[i_index];
                    if(!_.find(target_comment.votes,function(vote)
                    {
                        return vote.user_id + '' === comment_vote.user_id;
                    }))
                    {
                        target_comment.votes.push(comment_vote);
                        object.save(function(err, result){
                            callback(err, result);
                        });
                    }
                    else
                        callback({message:'user already voted', code:400});
                }
                break;

            case "add_reply":

                var comment_time = Date.parse(req.body.comment_time);
                var reply = {};
                reply.date = new Date().getTime();
                reply.author = user_id;
                reply.first_name = user.first_name;
                reply.last_name = user.last_name;
                reply.text = req.body.text;

                for (var i = 0; i < object.comments.length; i++) {
                    if(checkComment(object.comments[i],comment_time,reply) || checkRoot(object.comments[i], comment_time, reply)){
                        exist = true;
                        i_index = i;
                        break;
                    }
                }

                if (!exist) {
                    callback({message:"comment isnt exist", code:404}, null);
                } else {
                    object.save(function(err, result){
                        callback(err, result);
                    });
                }
                break;
            case "add_tag":

                var tag_name = req.body.tag_name;
                models.Article.update({_id:object._id}, {$addToSet:{tags:tag_name}}, function (err, result) {
                    callback(err, result);
                });

                break;
            default:
                callback({message:"no such method", code:404}, null);
                break;
        }
    }
});

module.exports.ArticleResource = ArticleResource;
module.exports.ArticleCommentResource = ArticleCommentResource;

function checkComment(comment,comment_time,reply)
{
    if(comment.time - new Date(comment_time) == 0)
    {
        comment.replies.push(reply);
        return true;
    }
    return false;
}

function checkRoot(root, comment_time, reply){
    if(!root.replies) return false;

    for(var i=0; i < root.replies.length; i++){
        if(root.replies[i].time == comment_time){
            if(root.replies[i].replies){
                root.replies[i].replies.push(reply);
            }else{
                root.replies[i].replies = [reply];
            }
            return true;
        }
        checkRoot(root.replies[i], comment_time, reply);
    }
}