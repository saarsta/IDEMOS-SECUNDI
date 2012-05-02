/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 01/03/12
 * Time: 11:31
 * To change this template use File | Settings | File Templates.
 */

var resources = require('jest'),
    util = require('util'),
    models = require('../models'),
    async = require('async'),
    common = require('./common');
//,
//    jstat = require('./jstat');


var VoteResource = module.exports = common.GamificationMongooseResource.extend({
    init:function(){
        this._super(models.Vote,'vote', common.getGamificationTokenPrice('vote'));
        this.allowed_methods = ['post'];
    //    this.authorization = new Authoriztion();
        this.authentication = new common.SessionAuthentication();
        this.filtering = {discussion_id: null};
    },

    //returns post_
    create_obj: function(req,fields,callback)
    {
        var self = this;
        //check if user has enought tokens, if so reduce it from user tokens and adds/redueces it form post tokens
        if(req.user){
            var user_object = req.user;
            var vote_object = new self.model();
            self.authorization.edit_object(req, vote_object, function(err,vote_object)
            {
                if(!err)
                {
                    var post_id = req.body.post_id;
                    models.Vote.count({user_id:user_object._id, post_id:post_id},function(err,count)
                    {
                        if(err || count>2)
                            callback(err || 'user already voted for this post');
                        else
                        {
                            var method = req.body.method;
                            models.Post.findOne({_id :post_id},function(err,post_object){
                                if (err || !post_object){
                                    callback(err || {message:'couldn\'t find post by id ' + post_id,code:400}, null);
                                }
                                else{
                                    var discussion_id = post_object.discussion_id;
                                    var isNewFollower = false;
                                    if (method == 'add'){
                                        post_object.votes_for += 1;

                                        //                                    post_object.tokens += parseInt(req.body.tokens);
                                    }
                                    else{
                                        post_object.votes_against += 1;

                                        //                                    post_object.tokens -= parseInt(req.body.tokens);
                                    }

                                    post_object.popularity = calculate_popularity(post_object.votes_for, post_object.votes_for + post_object.votes_against);
                                    fields.user_id = user_object._id;
                                    fields.post_id = post_id;

                                    async.parallel([
                                        function(cbk)
                                        {
                                            post_object.total_votes += 1;
                                            post_object.save(cbk);
                                        },
                                        function(cbk)
                                        {
                                            //check if is user is a new follower, if so insert discussion to user and increade followers in discussion
                                            if (common.isArgIsInList(discussion_id, user_object.discussions) == false){
                                                user_object.discussions.push(discussion_id);
                                                isNewFollower = true;
                                                user_object.save(cbk);
                                            }
                                            else
                                                cbk();
                                        },
                                        function(cbk)
                                        {
                                            if (isNewFollower){
                                                models.Discussion.update({_id :discussion_id},{$inc:{followers_count:1}},function(err,count){
                                                    if (err || !count){
                                                        cbk(err);
                                                    }else{
                                                        cbk();
                                                    }
                                                });
                                            }
                                            else
                                                cbk();
                                        },
                                        function(cbk)
                                        {
                                            for( var field in fields)
                                            {
                                                vote_object.set(field,fields[field]);
                                            }
                                            vote_object.save(function(err,object)
                                            {
                                                cbk(self.elaborate_mongoose_errors(err),post_object);
                                            });
                                        }],
                                        callback);
                                }
                        });
                    }
                });
            }
                else{
                callback({message: "Error: there is not enought tokens", code: 401}, null);
            }
        });
        }
        else{
            callback("Error: User Is Not Autthenticated", null);
        }
    }
});


function calculate_popularity(pos, n){

//    var confidence = 1.96;
    if (n == 0)
        return 0;


    //var norm = new jstat.NormalDistribution(0,1) // normal distribution
    var z = 1.96;//norm.getQuantile(1-(1-confidence)/2);
//    var z = Statistics2.pnormaldist(1-(1-confidence)/2);
    var phat = 1.0*pos/n;
        return (phat + z*z/(2*n) - z * Math.sqrt((phat*(1-phat)+z*z/(4*n))/n))/(1+z*z/n)
}
