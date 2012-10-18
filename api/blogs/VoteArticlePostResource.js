var resources = require('jest'),
    util = require('util'),
    models = require('../../models'),
    async = require('async'),
    _ = require('underscore'),
    common = require('../common.js');
    notifications = require('../notifications.js');

var VoteArticlePostResource = module.exports = common.GamificationMongooseResource.extend({
    init:function () {
        this._super(models.VoteArticlePost, 'vote_on_article_post', common.getGamificationTokenPrice('vote_on_article_post'));
        this.allowed_methods = ['post'];
        this.authentication = new common.SessionAuthentication();
        this.filtering = {discussion_id:null},
        this.update_fields = {
            post_article_id: null
        },
        this.fields = {
            votes_for:null,
            votes_against:null,
            total_votes: null,
            popularity:null,
            updated_user_tokens:null,
            balance: null
        };
    },

    create_obj: function(req, fields, callback){
        var user_id = req.user._id;
        var self = this;
        var base = self._super;
        var balance;
        var balance_delta;
        var new_balance;
        var limit = 1;
        var g_post;
        /*
        *  0. find PostArticle
        *  1. check if user has already voted for this post
        *  2.1 check if vote balance in in limit bounds
        *  2.2 if this is a new vote, we create it
        *
        *  final - return updated postArticle
        * */

         async.waterfall([

             //0 can't vote my own post
             function(cbk){
                 models.PostArticle.findById(fields.post_article_id, cbk);
             },


            // 1. check if vote is user has already voted for this post
            function(post, cbk){
                if(!post)
                    callback({message: "wrong post id", code:404});
                else if(post.creator_id + "" == req.user._id)
                    callback({message: "soory, can\'t vote to your own post", code:401});
                else{
                    g_post = post;
                    models.VoteArticlePost.findOne({user_id: user_id, post_article_id: fields.post_article_id},cbk);
                }
            },

            // 2.1 check if vote balance in in limit bounds
            // 2.2 if this is a new vote, we create it
            function(vote, cbk){

                    balance = vote ? vote.balance || 0 : 0;
                    balance_delta = req.body.method == 'add' ? 1 : -1;
                    new_balance = balance + balance_delta;

                    if (Math.abs(new_balance) > limit) {
                        cbk({message:'user already voted for this post', code:401}, null);
                    }else if(!vote){
                        fields.user_id = user_id;
                        fields.balance = balance_delta;
                        base.call(self, req, fields, function(err, vote){
                            cbk(err, vote);
                        });
                    }else{
                        vote.balance = new_balance;
                        vote.save(function(err, vote){
                            cbk(err, vote);
                        });
                    }

            },

            // 4. update PostArticle with its new votes
            function(obj, cbk){

                var method = req.body.method;
                if (balance < 0 && method == 'add') {
                    g_post.votes_against -= 1;
                    g_post.total_votes -= 1;
                } else {
                    if (balance > 0 && method == 'remove') {
                        g_post.votes_for -= 1;
                        g_post.total_votes -= 1;

                    } else {
                        if (method == 'add') {
                            g_post.votes_for += 1;
                            g_post.total_votes += 1;
                        }
                        else {
                            g_post.votes_against += 1;
                            g_post.total_votes += 1;
                        }
                    }
                }
                g_post.save(function(err, updated_post){cbk(err, updated_post)});
            }
        //final - return updated postArticle
        ], function(err, updated_post){
             if(updated_post){
                 updated_post.balance = new_balance;

                 // update actions done by user
                 var actions_done_by_user = {
                     create_object:false,
                     post_on_object:false,
                     suggestion_on_object:false,
                     grade_object:false,
                     vote_on_object:true,
                     join_to_object:false
                 }
                 models.User.update({_id:req.session.user._id}, {$addToSet:{actions_done_by_user : actions_done_by_user}});
                 models.User.update({_id:req.session.user._id}, {"actions_done_by_user.vote_on_object" : true},function(err) {
                     callback(err, updated_post);
                 });
             }

        })
    }
})