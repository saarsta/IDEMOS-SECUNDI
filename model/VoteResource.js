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
    common = require('./common');


var VoteResource = module.exports = common.GamificationMongooseResource.extend({
    init:function(){
        this._super(models.Vote,'vote');
        this.allowed_methods = ['get','post'];
    //    this.authorization = new Authoriztion();
        this.authentication = new common.SessionAuthentication();
        this.filtering = {discussion_id: null};
    },

    //returns post_
    create_obj: function(req,fields,callback)
    {
        var self = this;
        //check if user has enought tokens, if so reduce it from user tokens and adds/redueces it form post tokens
        if(req.session.user_id){
            var user_id = req.session.user_id;
            models.User.findOne({_id :user_id},function(err,user_object)
            {
                if(err)
                {
                    callback(err, null);
                }
                else
                {
                    if (user_object.tokens){
                        var post_id = req.body.post_id;
                        var method = req.body.method;
                        models.Post.findOne({_id :post_id},function(err,post_object){
                            if (err){
                                callback(err, null);
                            }
                            else{
                                var discussion_id = post_object.discussion_id;
                                var isNewFollower = false;
                                user_object.tokens -= 1;
                                if (method == 'add'){
                                    post_object.votes_for += 1;

//                                    post_object.tokens += parseInt(req.body.tokens);
                                }
                                else{
                                    post_object.votes_against += 1;

//                                    post_object.tokens -= parseInt(req.body.tokens);
                                }

                                post_object.popularity = calculate_popularity(post_object.votes_for, post_object.votes_for + post_object.votes_against);
                                var vote_object = new self.model();
                                fields.user_id = user_id;
                                fields.post_id = post_id;


                                post_object.total_votes += 1;
                                post_object.save();

                                //check if is user is a new follower, if so insert discussion to user and increade followers in discussion
                                if (common.isArgIsInList(discussion_id, user_object.discussions) == false){
                                    user_object.discussions.push(discussion_id);
                                    isNewFollower = true;
                                }
                                user_object.save();

                                if (isNewFollower){
                                    models.Discussion.findOne({_id :discussion_id},function(err, discussion_object){
                                        if (err){

                                        }else{
                                            discussion_object.followers_count++;
                                            discussion_object.save();
                                        }
                                    });
                                }
                                for( var field in fields)
                                {
                                    vote_object.set(field,fields[field]);
                                }
                                self.authorization.edit_object(req, vote_object, function(err,object)
                                {
                                    if(err) callback(err);
                                    else
                                    {
                                        object.save(function(err,object)
                                        {
                                            if (err){
                                                callback(err, null);
                                            }
                                            callback(self.elaborate_mongoose_errors(err),post_object);
                                        });
                                    }
                                });
                            }
                        });
                    }else{
                        callback({message: "Error: there is not enought tokens", code: 401}, null);
                    }
                }
            });
        }
        else{
            callback("Error: User Is Not Autthenticated", null);
        }
    }
});


function calculate_popularity(pos, n){

    var confidence = 1.96;
    if (n == 0)
        return 0;


    var norm = new NormalDistribution(0,1) // normal distribution
    var z = norm.getQuantile(1-(1-confidence)/2);
//    var z = Statistics2.pnormaldist(1-(1-confidence)/2);
    var phat = 1.0*pos/n;
        return (phat + z*z/(2*n) - z * Math.sqrt((phat*(1-phat)+z*z/(4*n))/n))/(1+z*z/n)
}
