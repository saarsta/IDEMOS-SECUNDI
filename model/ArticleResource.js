/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 29/03/12
 * Time: 15:22
 * To change this template use File | Settings | File Templates.
 */

var models = require('../models'),
    async = require('async'),
    common = require('./common'),
    _ = require('underscore');

var ArticleResource = common.GamificationMongooseResource.extend({
    init:function () {
        this._super(models.Article, null, null);
        this.authentication = new common.SessionAuthentication();
        this.allowed_methods = ['get', 'post'];
        this.update_fields = ["comments", "popolarity_counter", "title", "text", "tags"];
    },

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