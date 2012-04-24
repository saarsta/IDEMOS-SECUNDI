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

        fields.user_id = user_id;
        fields.first_name = user.first_name;
        fields.last_name = user.last_name;

        self._super(req,fields,callback);
    }
});

var ArticleCommentResource = common.GamificationMongooseResource.extend({
    init:function () {
        this._super(models.Article, null, null);
        this.authentication = new common.SessionAuthentication();
        this.allowed_methods = ['put'];
        this.update_fields = [];
    },

    update_obj:function (req, object, callback) {
        var user_id = req.session.user_id;
        var self = this;
        var user = req.user;
        var update_type = req.body.type;
        var i_index;
        var j_index = null;
        var exist = false;


        async.waterfall([

            function (cbk) {
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
                            cbk(err, result);
                        });
                        break;

                    case "add_vote":
                        var comment_vote = {};
                        comment_vote.user_id = user_id;
//                        var comment = _.find(object.comments,function(elm)
//                        {
//                            return elm.time == req.body.comment_time
//                        });
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
                            cbk({message:"comment isnt exist", code:404}, null);
                        } else {
                            models.Article.findById(object._id, function(err, result){
                                if (!err){
                                    if(j_index){
                                        result.comments[i_index][j_index].votes.push(comment_vote);
                                    }
                                    result.comments[i_index].votes.push(comment_vote);
                                    result.save(function(err, result){
                                        cbk(err, result);
                                    });
                                }
                            })
                        }

                    case "add_reply":

                        var comment_time = req.body.comment_time;
                        var reply = {};
                        reply.date = new Date().getTime();
                        reply.author = user_id;
                        reply.first_name = user.first_name;
                        reply.last_name = user.last_name;
                        reply.text = req.body.text;

                        for (var i = 0; i < object.comments.length; i++) {
                            var comment_time = new Date.valueOf(comment_time);
                            if(checkComment(object.comments[i],comment_time,reply) || checkRoot(object.comments[i], comment_time, reply)){
                                exist = true;
                                i_index = i;
                                break;
                            }
                        }

                        if (!exist) {
                            cbk({message:"comment isnt exist", code:404}, null);
                        } else {
                            /*models.Article.findById(object._id, function(err, result){
                                if (!err){
                                    if (j_index){
                                        if (result.comments[i_index][j_index].replies){
                                            result.comments[i_index][j_index].replies.push(reply);
                                        }else{
                                            result.comments[i_index][j_index].replies = reply;
                                        }
                                    }else{
                                        if (result.comments[i_index].reply){
                                            result.comments[i_index].reply.push(reply);
                                        }else{
                                            result.comments[i_index].reply = reply;
                                        }
                                    }*/
                                    result.save(function(err, result){
                                        cbk(err, result);
                                    });
//                                }
//                            })
                        }

                    case "add_tag":

                        var tag_name = req.body.tag_name;
                        models.Article.update({_id:object._id}, {$addToSet:{tags:tag_name}}, function (err, result) {
                            cbk(err, result);
                        });

                        break;
                    default:
                        cbk({message:"no such method", code:404}, null);
                }
            }
        ], function(err, result){
            callback(err, result);
        });
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