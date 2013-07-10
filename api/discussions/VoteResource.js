/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 01/03/12
 * Time: 11:31
 * To change this template use File | Settings | File Templates.
 */

var resources = require('jest'),
    util = require('util'),
    models = require('../../models'),
    async = require('async'),
    _ = require('underscore'),
    common = require('../common.js');
    notifications = require('../notifications.js');

//  jstat = require('./jstat');

var VoteResource = module.exports = common.GamificationMongooseResource.extend({
    init:function () {
        this._super(models.Vote, 'vote_on_post', common.getGamificationTokenPrice('vote_on_post'));
        this.allowed_methods = ['post'];
        //    this.authorization = new Authoriztion();
        this.authentication = new common.SessionAuthentication();
        this.filtering = {discussion_id:null},
            this.fields = {
                votes_for:null,
                votes_against:null,
                popularity:null,
                voter_balance:null,
                updated_user_tokens:null
            };
    },

    dispatch: function(){
        this.token_price = common.getGamificationTokenPrice('vote_on_post') > -1 ? common.getGamificationTokenPrice('vote_on_post') : 0;
        this._super.apply(this,arguments);
    },
    //returns post_
    create_obj:function (req, fields, callback) {
        var self = this;
        var discussion_id;
        //check if user has enought tokens, if so reduce it from user tokens and adds/redueces it form post tokens
        if (req.user) {
            var user_object = req.user;
            var post_id = req.body.post_id;
            models.Vote.findOne({user_id:user_object._id + "", post_id:post_id}, function (err, vote_object) {

                if (err)
                    callback(err, null);
                else {
                    if (!vote_object)
                        vote_object = new self.model();

                    var proxy_power = user_object.num_of_given_mandates ? 1 + user_object.num_of_given_mandates * 1/9 : 1;

                    var total_tokens = /*req.user.tokens +*/ req.user.num_of_extra_tokens;
                    var method = req.body.method;
                    var ballance = vote_object ? vote_object.ballance || 0 : 0;
                    var ballance_delta = method == 'add' ? 1 : -1;
                    var new_ballance = ballance + ballance_delta;
                    var limit = /*total_tokens > 15 ? 5 : ( total_tokens > 12 ? 4 : 3)*/ 1;
                    //Math.abs(new_ballance)
                    if (Math.abs(new_ballance) > limit) {
                        //if(votes.length > 2 && !(votes.length == 3 && total_tokens > 12) || (votes.length == 4 && total_tokens > 15)){
                        callback({message:'user already voted for this post', code:401}, null);
                    } else {
                        models.Post.findOne({_id:post_id}, function (err, post_object) {
                            if (err || !post_object) {
                                callback(err || {message:'couldn\'t find post by id ' + post_id, code:400}, null);
                            }
                            else {
                                if (post_object.creator_id + "" == req.user._id + "") {
                                    callback({message:'soory, can\'t vote to your own post', code:401}, null);
                                } else {
                                    discussion_id = post_object.discussion_id;
                                    var isNewFollower = false;

                                    // update the post object votes count & popularity

                                    if (ballance < 0 && method == 'add') {
                                        post_object.votes_against -= 1 * proxy_power;
                                        post_object.total_votes -= 1 * proxy_power;

                                    } else {
                                        if (ballance > 0 && method == 'remove') {
                                            post_object.votes_for -= 1 * proxy_power;
                                            post_object.total_votes -= 1 * proxy_power;

                                        } else {
                                            if (method == 'add') {
                                                post_object.votes_for += 1 * proxy_power;
                                                post_object.total_votes += 1 * proxy_power;
                                            }
                                            else {
                                                post_object.votes_against += 1 * proxy_power;
                                                post_object.total_votes += 1 * proxy_power;
                                            }
                                        }
                                    }
                                    post_object.popularity = calculate_popularity(post_object.votes_for, post_object.votes_for + post_object.votes_against);
                                    post_object.voter_balance = new_ballance      ;
                                    vote_object.user_id = user_object._id;
                                    vote_object.post_id = post_id;
                                    vote_object.ballance = new_ballance;

                                    async.parallel([
                                        function (cbk) {
                                            post_object.save(cbk);
                                        },
                                        function (cbk) {
                                            vote_object.save(function (err, object) {


                                                //Todo - i remove it for now because of the duplicate key error
                                                //set notification for post creator
                                                if(!err){
                                                    if(new_ballance > 0 || (new_ballance == 0 && method == 'remove')){
                                                        notifications.create_user_vote_or_grade_notification("user_gave_my_post_tokens",
                                                            post_object._id, post_object.creator_id, vote_object.user_id, discussion_id, method, false, false, '/discussions/' +  discussion_id, function(err, result){
                                                                cbk(err, post_object);
                                                            })
                                                    }else{
                                                        notifications.create_user_vote_or_grade_notification("user_gave_my_post_bad_tokens",
                                                            post_object._id, post_object.creator_id, vote_object.user_id, discussion_id, method, false, false, '/discussions/' +  discussion_id, function(err, result){
                                                                cbk(err, post_object);
                                                            })
                                                    }

                                                }else{
                                                    cbk(err, post_object);
                                                }

//                                                cbk(err, post_object);
                                            });
                                        },
                                        // update actions done by user
                                        function(cbk){
                                            models.User.update({_id:user_object._id}, {$set: {"actions_done_by_user.vote_on_object": true}}, function(err){
                                                cbk(err);
                                            });
                                        },

                                        //set notifications for all my slaves
                                        function(cbk){
                                            //Todo - i remove it for now because of the duplicate key error

                                            models.User.find({"proxy.user_id": req.user._id}, function(err, slaves_users){
                                                async.forEach(slaves_users, function(slave, itr_cbk){
                                                    notifications.create_user_proxy_vote_or_grade_notification(
                                                        "proxy_vote_to_post", post_object._id, slave._id, req.user._id,
                                                        discussion_id,  null, vote_object.ballance,
                                                        function(err, results){
                                                            itr_cbk(err);
                                                        })
                                                }, function(err){
                                                    cbk(err);
                                                })
                                            })
//                                            cbk();
                                        }
                                        ],
                                        function (err, args) {
                                            if(err)
                                                console.error(err);
                                            callback(err, args[1])
                                        });
                                }
                            }
                        });
                    }
                }
            });
        }
        else {
            callback("Error: User Is Not Autthenticated", null);
        }
    }
});


function calculate_popularity(pos, n) {

//    var confidence = 1.96;
    if (n == 0)
        return 0;


    //var norm = new jstat.NormalDistribution(0,1) // normal distribution
    var z = 1.96;//norm.getQuantile(1-(1-confidence)/2);
//    var z = Statistics2.pnormaldist(1-(1-confidence)/2);
    var phat = 1.0 * pos / n;
    return (phat + z * z / (2 * n) - z * Math.sqrt((phat * (1 - phat) + z * z / (4 * n)) / n)) / (1 + z * z / n)
}
