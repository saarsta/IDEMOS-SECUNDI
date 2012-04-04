/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 20/03/12
 * Time: 19:36
 * To change this template use File | Settings | File Templates.
 */

var util = require('util'),
    models = require('./models'),
    common = require('./model/common'),
    async = require('async');

    g_all_users = null;
var Cron = exports.Cron = {

    findWhoInvitedNumberOfUsersThatGotExtraTokens:function (extra_tokens, number, callback) {
        var event = "invited " + number + " pepole that got " + extra_tokens + " tokens";
        var event_bonus = 2;
        var bucket = {};
        var invited_users = {};

        async.waterfall([
            function (cbk) {
                models.User.find({num_of_extra_tokens:extra_tokens, has_been_invited:true}, cbk);
            },

            function (users, cbk) {
                for (var i = 0; i < users.length; i++) {
                    var inviter_string = users[i].invited_by.toString();
                    users[i].tokens_achivements_to_user_who_invited_me = users[i].tokens_achivements_to_user_who_invited_me || {};
                    if (!users[i].tokens_achivements_to_user_who_invited_me[event]) {
                        if (!bucket[inviter_string]) {
                            bucket[inviter_string] = 1;
                            invited_users[inviter_string] = [];
                            invited_users[inviter_string].push(users[i]._id);

                        } else {
                            bucket[inviter_string] += 1;
                            invited_users[inviter_string].push(users[i]._id);
                        }
                    }
                }

                for (var i = 0; i < users.length; i++) {
                    var inviter_id_string = users[i].invited_by.toString();
                    if (bucket[inviter_string] >= number && bucket[inviter_string] != -1) {
                        //once one user gave his inviter the extra tokens and all invited users has set
                        // tokens_achivements_to_invited_user  bucket[inviter_string] sets to (-1)
                        bucket[inviter_string] = -1;
                        async.parallel([
                            function (cbk2) {
                                addTokensToUserByEventAndSetGamificationBonus(inviter_id_string, event, event_bonus, cbk2);
                            },

                            function (cbk2) {
                                //update achivement only for the relevant users
                                var sliced_invited_users = invited_users[inviter_string].slice(0, number);
                                setTokenAchivementsToInviter(sliced_invited_users, event, cbk2);
                            }
                        ], cbk);
                    }
                }
            }
        ], callback);
    },

    findWhoInvitedMoreThenNumberOfRegisteredUsers:function (number, callback) {
        var event = "invited more then " + number + " registered users";
        var event_bonus = 3;
        var bucket = {};
        var invited_users = {};
        async.waterfall([
            function (cbk) {
                models.User.find({has_been_invited:true}, cbk);
            },

            function (users, cbk) {
                g_all_users = users;
                for (var i = 0; i < users.length; i++) {
                    var inviter_id_string = users[i].invited_by/*.toString()*/;
                    users[i].tokens_achivements_to_user_who_invited_me = users[i].tokens_achivements_to_user_who_invited_me || {};
                    if (!users[i].tokens_achivements_to_user_who_invited_me[event]) {
                        if (!bucket[inviter_id_string]) {
                            bucket[inviter_id_string] = 1;
                            invited_users[inviter_id_string] = [];
                            invited_users[inviter_id_string].push(users[i]._id);
                        } else {
                            bucket[inviter_id_string] += 1;
                            invited_users[inviter_id_string].push(users[i]._id);
                        }
                    }
                }

                for (var i = 0; i < users.length; i++) {
                    var inviter_string = users[i].invited_by/*.toString()*/;
                    if (bucket[inviter_string] >= number && bucket[inviter_string] != -1) {
                        //once one user gave his inviter the extra tokens and all invited users has set
                        // tokens_achivements_to_invited_user  bucket[inviter_string] sets to (-1)
                        bucket[inviter_string] = -1;
                        async.parallel([
                            function (cbk2) {
                                addTokensToUserByEventAndSetGamificationBonus(inviter_id_string, event, event_bonus, function (err, result) {
                                    cbk2(err, result);
                                });
                            },

                            function (cbk2) {
                                setTokenAchivementsToInviter(invited_users[inviter_id_string], event, function (err, result) {
                                    cbk2(err, result);
                                });
                            }
                        ], cbk);
                    }
                }
            }
        ], callback);
    },

    findWhoGotGtrNumberOfTokensForAPostOrSuggestion:function (number, callback) {
        var event_bonus = 3;
        async.waterfall([

            function (cbk) {
                models.Post.find().where("gamification.high_number_of_tokens_bonus", false)
                    .where("tokens").gt(number)
                    .run(cbk);
            },

            function (posts, cbk) {
                for (var i = 0; i < posts.length; i++) {

                    models.User.findById(posts[i].creator_id, function (err, user) {
                        if (err) {
                            cbk(err, null);
                        } else {
                            async.waterfall([
                                //set user gamification
                                function (cbk2) {
                                    addTokensToUserByEventAndSetGamificationBonus(posts[i].creator_id, "high_number_of_tokens_for_post", event_bonus, function (err, result) {
                                        cbk2(err, result);
                                    });
                                },
                                //update post gamification, set  high_number_of_tokens_bonus to true
                                function (result, cbk2) {
                                    models.update({_id:posts[i]._id}, {"gamification.high_number_of_tokens_bonus":true}, cbk2);
                                }
                            ], cbk)

                        }
                    });
                }
            }
        ], callback);
    },

    findWhoGotNumberOfTokensForAllPosts:function (number, callback) {
        var event = "tokens_for_all_posts " + number;
        var path = "gamification.bonus." + event;
        var event_bonus = 3;
        var creator_user_id;
        async.waterfall([
            function (cbk) {
                models.User.find({path:{$ne:true}}, cbk);
            },

            function (users, cbk) {
                for (var i = 0; i < users.length; i++) {

                    /* models.PostOrSuggestion.group(
                     {key: {creator_id: users[i]._id},
                     initial: {sum: 0},
                     reduce: function(obj,prev) { prev.sum += obj.tokens}
                     }, function(err, result){
                     cbk(err, result);
                     });*/
                    creator_user_id = users[i]._id;
                    models.Post.find({creator_id:creator_user_id /*,"gamification.number_of_tokens_for_all_posts": {$ne:true}*/}, function (err, posts) {
                        if (err) {
                            cbk(err, null);
                        } else {
                            var sum = 0;
                            for (var i = 0; i < posts.length; i++) {
                                sum += posts[i].tokens;
                            }
                            if (sum >= number) {
                                addTokensToUserByEventAndSetGamificationBonus(creator_user_id, event, event_bonus, function (err, result) {
                                    cbk(err, result);
                                    /*if (err) {
                                     cbk(err, null);
                                     } else {
                                     //update post gamification, set  number_of_tokens_for_all_posts to true
                                     models.Post.update({creator_id: creator_user_id, "gamification.number_of_tokens_for_all_posts": {$ne:true}}, {"gamification.number_of_tokens_for_all_posts":true}, {multi:true}, function (err, result) {
                                     cbk(err, result);
                                     });
                                     }*/
                                })
                            }
                        }
                    });
                }
            }
        ], callback)
    },

    //TODO this can be replaced with the code in AdminNotify
    findWhoInsertedNumberOfApprovedSuggestions:function (number, callback) {

        var event = "num_of_approved_suggestoins " + number;
        var path = "gamification.bonus." + event;
        var event_bonus = 3;
        var found_users = [];

        var iterator = function(user, iteration_cbk){
            async.waterfall([
                function(cbk){
                    models.Suggestion.find({creator_id:user._id, is_approved:true, "gamification.num_of_approved_suggestoins":{$ne:true}}, cbk);
                },

                function(suggestion, cbk){
                    if (suggestions.length >= number) {
                        addTokensToUserByEventAndSetGamificationBonus(user._id, event, event_bonus, cbk);
                    }else{
                        cbk(null, 0);
                    }
                }
            ], iteration_cbk);
        }

        async.waterfall([

            function (cbk) {
                models.User.find({path:{$ne:true}}, cbk);
            },

            function (users, cbk) {
                async.forEach(users, iterator, cbk);
            }

        ], callback);
    },

    //TODO this can be replaced with the code in AdminNotify
    findWhosDiscussionTurnedToCycle: function(callback){
        var event = "discussion_turned_to_cycle";
        var path =  "gamification.bonus." + event;
        var dicussion_gamification_path = "gamification.has_rewarded_creator_of_turning_to_cycle";
        var event_bonus = 3;


        var iterator = function (discussion, iteration_cbk){
            async.waterfall([
                function(cbk){
                    addTokensToUserByEventAndSetGamificationBonus(discussions.creator_id, event, event_bonus, cbk);
                },

                function(result, cbk){
                    models.Discussion.update({id:discussions[i]._id}, {$set: {dicussion_gamification_path:true}},cbk);
                }
            ], iteration_cbk);
        }

        async.waterfall([

            function(cbk){
                models.Discussion.find({is_cycle: true, dicussion_gamification_path: false}, cbk);
            },

            function(discussions, cbk){
                async.forEach(discussions, iterator, cbk);
            }
        ], callback);
    },

    //יצירה של פעולה שמתקבלת כחלק ממעגל תנופה
    //TODO this can be replaced with the code in AdminNotify
    findWhoCreatedApprovedAction : function(callback){
        var event = "action_approval";
        var gamification_action_path = "gamification.approved_to_cycle";
        var event_bonus = 2;

        var iterator = function(action, iteration_cbk){
            async.waterfall([

                function(cbk1){
                    addTokensToUserByEventAndSetGamificationBonus(action.creator_id, event, event_bonus, cbk1);
                },

                function(result, cbk1){
                    models.Action.update({_id: action._id}, {$set: {"gamification.approved_to_cycle": true}}, cbk1);
                }
           ], iteration_cbk)
        }

        async.waterfall([
            function(cbk){
                models.Action.find({is_approved: true, gamification_action_path:{$ne: true}}, cbk);
            },

            function(actions, cbk){
                async.forEach(actions, iterator, cbk);
            }
        ], callback);
    },

//    תיוג של X פריטי מידע (שאושרו)
    //TODO this might be called right after the approvment of a tag?
    findWhoHasNumberOfTagSuggThatApproved: function(number, callback){
//        var event = number + "_approved_tag_sugg";
        var event_bonus = 2;
        var set_gamification_bonus = {};

//        set_gamification_bonus['gamification.bonus.' + event] = true;

       //TODO move it somehow to addTokensToUserByEventAndSetGamificationBonus
       //TODO how to put string + number instead of "gamification.bonus.approved_tag_sugg" (it doesnt work when i insert it to var)

       models.User.update({"gamification.tag_suggestion_approved": {$gt: number - 1}, "gamification.bonus.approved_tag_sugg": {$ne: true}}, {$set: {"gamification.bonus.approved_tag_sugg" : true},
       $inc: {num_of_extra_tokens: event_bonus}}, callback);
    },

//    יצירה של דיון שמדורג גבוה ע"י מינימום של X אנשים
    findHighGradedDiscussions: function(callback){

        var num_of_top_graded = 10;
        var num_of_max_graders = 10;
        var event = "high_graded_discussions_of_min_graders";
        var event_bonus = 2;
        var iterator = function(discussion, itr_cbk){
            async.waterfall([
                function(cbk){
                    models.Discussion.update({_id: discussion._id}, {$set: {"gamification.has_rewarded_creator_for_high_grading" : true}}, cbk)
                },

                function(result, cbk){
                    addTokensToUserByEventAndSetGamificationBonus(discussion.creator_id, event, event_bonus, cbk);
                }
            ], itr_cbk);
        };

        async.waterfall([
            function(cbk){
                models.Discussion.find({evaluate_counter: {$gt: num_of_max_graders}, "gamification.has_rewarded_creator_for_high_grading_of_min_graders" : false}).sort({grade_sum: -1}).limit(num_of_top_graded).run(cbk);
            },

            function(discussions, cbk){
                async.forEach(discussions, iterator, cbk);
            }
        ], callback);
    },

//    Submission של פריט מידע שמדורג גבוה
    findHighLikedInfoItem: function(callback){
        var num_of_top_liked = 10;
        var event = "high_liked_submited_info_item";
        var event_bonus = 2;

        var iterator = function(info_item, itr_cbk){
            async.waterfall([
                function(cbk){
                    models.InformationItem.update({_id: info_item._id}, {$set: {"gamification.rewarded_creator_for_high_liked" : true, status: "approved"}}, cbk);
                },

                function(result, cbk){
//                    addTokensToUserByEventAndIncGamificationBonus(info_item.created_by.creator_id, event, event_bonus, cbk);
                    addTokensToUserByEventAndSetGamificationBonus(info_item.created_by.creator_id, event, event_bonus, cbk);
                }
            ], callback);
        };

        async.waterfall([
            function(cbk){
                models.InformationItem.find({"gamification.rewarded_creator_for_high_liked": false})
                                               //TODO why the fuck this query doesnt work????????
//                                            .find({"created_by.did_user_created_this_item": true})

                                             .sort('like_counter', -1)
                                             .limit(num_of_top_liked)
                                               .run(cbk);
            },

            function(info_items, cbk){

                async.forEach(info_items, iterator, cbk);
            }
        ], callback);
    }
};

var daily_cron =  exports.daily_cron = {
    //    בזבוז של כל הטוקנים במשך X ימים
    //this should happen before the tokens fill again
    findWhoSpentAllTokensInNumberOfDaysInARow: function(num_of_days, callback){
        var event = "spent_all_tokens_for_" + num_of_days + "_days";
        var event_bonus = 2;
        var iterator = function(user, itr_cbk){
            user.number_of_days_of_spending_all_tokens += 1;
            async.parallel([

                function(cbk){
                    models.User.update({_id: user._id}, {$inc: {number_of_days_of_spending_all_tokens: 1}}, cbk);
                },

                function(cbk){
                    var bonus_path = {};
                    user.gamification =  user.gamification || {};
                    user.gamification.bonus = user.gamification.bonus || {};

                    bonus_path = user.gamification.bonus[event] || {};

                    if(user.number_of_days_of_spending_all_tokens >= num_of_days && bonus_path != true){
                        addTokensToUserByEventAndSetGamificationBonus(user._id, event, event_bonus, cbk);
                    }else{
                        cbk(null, 0);
                    }
                }
            ],itr_cbk);
        }

        async.waterfall([
            function(cbk){
               models.User.update(
                   {tokens: {$ne: 0}}, {$set: {number_of_days_of_spending_all_tokens : 0}}, cbk);
            },

            function(result, cbk){
                models.User.find({tokens: 0}, function(err, result){
                    cbk(err, result);
                });
            },

            function(users, cbk){
                async.forEach(users, iterator, cbk);
            }
        ], callback);
    },

    fillUsersTokens : function(callback){

        //TODO vas is thus ??!?!?!?!?!?!?!?!?!?!?!?!?!? why doesnt it work?????!?!?!?!?!?
       /* models.User.update({}, {$set: {tokens: 9}}, function(err, result){
            models.User.update({}, {$inc: {tokens: 'num_of_extra_tokens'}}, callback)
        });*/


       var iterator = function(user, itr_cbk){
           var tokens_number = user.num_of_extra_tokens + 9;
           models.User.update({_id: user._id}, {$set:{tokens: tokens_number}}, itr_cbk);
       }

       async.waterfall([
        function(cbk){
            models.User.find({}, cbk)
        },

        function(users, cbk){
            async.forEach(users, iterator, cbk);
        }
       ], callback);
    },

    updateTagAutoComplete: function(callback){

        var iterator = function(tag, itr_cbk){
            models.Tag.update({"tag": tag}, {"tag": tag, $inc: {popularity: 1}}, {upsert: true}, itr_cbk);
        }

        async.parallel([
            function(cbk){
                models.InformationItem.find({}, ['tags'], cbk);
            },

            function(cbk){
                models.Subject.find({}, ['tags'], cbk);
            },

            function(cbk){
                models.Discussion.find({}, ['tags'], cbk);
            },

            function(cbk){
                models.Article.find({}, ['tags'], cbk);
            }
        ], function(err, args){

            var tags = [];
            for (var i=0; i<args.length; i++){
                for(var j=0; j<args[i].length; j++)
                    tags.push.apply(tags, args[i][j].tags);
            }

            models.Tag.remove({}, function(err, result){
                if(err){
                    callback(err, null);
                }else{
                    async.forEach(tags, iterator, callback);
                }
            })

        })
    }
}

/*function addTokensToUserByEventAndIncGamificationBonus(user_id, event, event_bonus, callback) {

    var inc_gamification_bonus = {};

    inc_gamification_bonus['gamification.bonus.' + event] = 1;
    inc_gamification_bonus['num_of_extra_tokens'] = event_bonus;
    models.User.update({_id:user_id}, {$inc: inc_gamification_bonus}, function (err, result) {
        callback(err, result);
    });
}*/

function addTokensToUserByEventAndSetGamificationBonus(user_id, event, event_bonus, callback) {

    var set_gamification_bonus = {};

    set_gamification_bonus['gamification.bonus.' + event] = true;
    models.User.update({_id:user_id}, {$inc:{num_of_extra_tokens:event_bonus}, $set:set_gamification_bonus}, function (err, result) {
        callback(err, result);
    });
}

function setTokenAchivementsToInviter(invited_users_arr, event, callback) {

    var inc_inviter_achivments = {};
    inc_inviter_achivments['tokens_achivements_to_user_who_invited_me.' + event] = 1;
    var field = "tokens_achivements_to_user_who_invited_me." + event;
    for (var i = 0; i < invited_users_arr.length; i++) {
        models.User.update({_id:invited_users_arr[i]}, {$inc:inc_inviter_achivments}, function (err, result) {
            callback(err, result);
        });
    }
}


