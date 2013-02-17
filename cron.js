
var util = require('util'),
    models = require('./models'),
    common = require('./api/common'),
    async = require('async');
    og_get = require('./og/data.js').get,

    g_all_users = null;

exports.run_main_thread = function(app)
{
    setInterval(function(){
        ten_seconds_cron.fb_pages_likes(null,function(err, result){
           // console.log(err || result);
        })
    }, 10*1000);
}

exports.run = function(app)
{



    setInterval(function(){
        once_an_hour_cron.fillUsersTokens(function(err, result){
            console.log(err || result);
        })
    }, 60*60*1000);

    setInterval(function(){
        once_an_hour_cron.findWhoGotGtrNumberOfTokensForAPostOrSuggestion(common.getGamificationTokenPrice('X_tokens_for_post'),function(err, result){
            console.log(err || result);
        })
    }, 60*60*1000);

    setInterval(function(){
        console.log("cron updateBlogTagAutoComplete runs");
        daily_cron.updateBlogTagAutoComplete(function(err, result){
            console.log(err || result);
        })
    }, 60 * 1000 * 24 * 60);

    setInterval(function(){
        console.log("cron takeProxyMandatesBack runs");
        daily_cron.takeProxyMandatesBack(function(err, result){
        console.log(err || result);
        })
    },60 * 1000 * 24 * 60);

    setInterval(function(){
        daily_cron.findWhoGotNumberOfTokensForAllPosts(common.getGamificationTokenPrice('X_tokens_for_all_my_posts'), function(err, result){
        console.log(err || result);
        })
    },60 * 1000 * 24 * 60);

    setInterval(function(){
        daily_cron.findWhoInsertedNumberOfApprovedSuggestions(common.getGamificationTokenPrice('X_suggestions_for_a_discussion'), function(err, result){
        console.log(err || result);
        })
    },60 * 1000 * 24 * 60);

    setInterval(function(){
        daily_cron.findWhoGotNumberOfMandates(common.getGamificationTokenPrice('X_mandates_for_user'), function(err, result){
        console.log(err || result);
        })
    },60 * 1000 * 24 * 60);
};

exports.Cron_func = {

    findWhoInvitedNumberOfUsersThatGotExtraTokens:function(extra_tokens, number, callback) {
        var event = "invited " + number + " pepole that got " + extra_tokens + " tokens";
        var path = "gamification.bonus." + event + "";
        var event_bonus = 1;
        var bucket = {};
        var invited_users = {};
        var bonus_type = "extra_cup";


        var iterator = function(user, itr_cbk){
            if(user.count >= number){
                addTokensToUserByEventAndSetGamificationBonus(user._id, event, event_bonus, bonus_type, itr_cbk);
            }
        }

        async.waterfall([
            function(cbk){
                models.User.find({path : true}, cbk);
            },

            function(users, cbk){
                var user_ids = _.map(users, function(user) { return user._id});
                models.User.collection.group(
                {
                    key: {invited_by: true},
                    cond: {num_of_extra_tokens: {$gt: extra_tokens - 1}, invited_by: {$nin: user_ids}, has_been_invited: true},
                    initial: {count: 0},
                    reduce: function(obj,prev) {prev.count += 1}
                }, function(err, result){
                    cbk(err, result);
                });
            },

            function(group_users, cbk){
                async.forEach(group_users, iterator, cbk);
            }
        ], function(err, result){
            callback(err,result);
        })
    },

    findWhoInvitedMoreThenNumberOfRegisteredUsers:function (number, callback) {
        var event = "invited more then " + number + " registered users";
        var event_bonus = 3;
        var bucket = {};
        var invited_users = {};
        var bonus_type = "extra_cup";


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
                                addTokensToUserByEventAndSetGamificationBonus(inviter_id_string, event, event_bonus, bonus_type, function (err, result) {
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

    //X_suggestions_for_a_discussion
    findWhoInsertedNumberOfApprovedSuggestions:function (number, callback) {

        var event = number + "_num_of_approved_suggestions";
        var path = "gamification.bonus." + event;
        var event_bonus = 3;
        var found_users = [];
        var bonus_type = "extra_cup";

        var iterator = function(user, iteration_cbk){
            if(user.gamifiacation.approved_suggestion && user.gamifiacation.approved_suggestion > number){
                addTokensToUserByEventAndSetGamificationBonus(user._id, event, event_bonus, bonus_type, iteration_cbk);
            }else{
                iteration_cbk(null, 0);
            }
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

    //X_mandates_for_user
    findWhoGotNumberOfMandates: function(number, callback){
        var event = number + "_num_of_mandates";
        var path = "gamification.bonus." + event;
        var event_bonus = 0;
        var bonus_type = "extra_cup";

        async.waterfall([
            function(cbk){
                models.User.find({num_of_given_mandates: {$gt: number}, path: {$ne: true}}, function(err, users){
                    cbk(err, users);
                });
            },

            function(users, cbk){
                async.forEach(users, function(user, itr_cbk){
                    addTokensToUserByEventAndSetGamificationBonus(user._id, event, event_bonus, bonus_type, itr_cbk);
                }, cbk);
            }
        ], function(err, obj){
            if(err)
                console.error(err);
            callback(err);
        })
    },

    //TODO this can be replaced with the code in AdminNotify
    findWhosDiscussionTurnedToCycle: function(callback){
        var event = "discussion_turned_to_cycle";
        var path =  "gamification.bonus." + event;
        var dicussion_gamification_path = "gamification.has_rewarded_creator_of_turning_to_cycle";
        var event_bonus = 1;
        var bonus_type = "extra_cup";


        var iterator = function (discussion, iteration_cbk){
            async.waterfall([
                function(cbk){
                    addTokensToUserByEventAndSetGamificationBonus(discussion.creator_id, event, event_bonus, bonus_type, cbk);
                },

                function(result, cbk){
                    models.Discussion.update({id:discussion._id}, {$set: {dicussion_gamification_path:true}},cbk);
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
    //TODO
    findWhoCreatedApprovedAction : function(callback){
        var event = "action_approval";
        var gamification_action_path = "gamification.approved_to_cycle";
        var event_bonus = 1;
        var bonus_type = "extra_cup";

        var iterator = function(action, iteration_cbk){
            async.waterfall([

                function(cbk1){
                    addTokensToUserByEventAndSetGamificationBonus(action.creator_id, event, event_bonus, bonus_type, cbk1);
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
    //TODO
    findWhoHasNumberOfTagSuggThatApproved: function(number, callback){
//        var event = number + "_approved_tag_sugg";
        var event_bonus = 1;
        var set_gamification_bonus = {};

//        set_gamification_bonus['gamification.bonus.' + event] = true;

       //TODO move it somehow to addTokensToUserByEventAndSetGamificationBonus
       //TODO how to put string + number instead of "gamification.bonus.approved_tag_sugg" (it doesnt work when i insert it to var)

        var event = number + "_approved_tag_sugg";
        var path = "gamification.approved_to_cycle";
        var event_bonus = 1;


        models.User.update({"gamification.tag_suggestion_approved": {$gt: number - 1}, path: {$ne: true}},
            {$set: {path : true},
             $inc: {num_of_extra_tokens: event_bonus}},
            callback);
    },

//    יצירה של דיון שמדורג גבוה ע"י מינימום של X אנשים
    findHighGradedDiscussions: function(callback){

        var num_of_top_graded = 10;
        var num_of_max_graders = 10;
        var event = "high_graded_discussions_of_min_graders";
        var event_bonus = 1;
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
                models.Discussion.find({evaluate_counter: {$gt: num_of_max_graders}, "gamification.has_rewarded_creator_for_high_grading_of_min_graders" : false}).sort({grade_sum: -1}).limit(num_of_top_graded)
                    .exec(cbk);
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
        var event_bonus = 1;
        var bonus_type = "extra_cup";

        var iterator = function(info_item, itr_cbk){
            async.waterfall([
                function(cbk){
                    models.InformationItem.update({_id: info_item._id}, {$set: {"gamification.rewarded_creator_for_high_liked" : true, status: "approved"}}, cbk);
                },

                function(result, cbk){
//                    addTokensToUserByEventAndIncGamificationBonus(info_item.created_by.creator_id, event, event_bonus, cbk);
                    addTokensToUserByEventAndSetGamificationBonus(info_item.created_by.creator_id, event, event_bonus, bonus_type, cbk);
                }
            ], callback);
        };

        async.waterfall([
            function(cbk){
                models.InformationItem.find({"gamification.rewarded_creator_for_high_liked": false})
                                               //TODO why the fuck this query doesnt work????????
//                                            .find({"created_by.did_user_created_this_item": true})

                                             .sort({'like_counter': -1})
                                             .limit(num_of_top_liked)
                                               .exec(cbk);
            },

            function(info_items, cbk){

                async.forEach(info_items, iterator, cbk);
            }
        ], callback);
    }
};
var ten_seconds_cron =   exports.ten_seconds_cron = {
    fb_pages_likes : function(cycle_id, callback){
        var find_obj={'fb_page.url': { $exists: true}};
        if (cycle_id) {
            find_obj= {_id: cycle_id , 'fb_page.url' : { $exists: true}};
        }
        models.Cycle.find(find_obj ,function(err,cycles){
            async.forEach(cycles,  function (cycle){
                 var page=    cycle.fb_page;
                 //console.log(page);
                 og_get('http://graph.facebook.com/'+page.url,function(error, og_data){
                    if(og_data.likes !=page.like_count){
                        var now =Date.now();
                        models.Cycle.update({_id: cycle._id}, {
                            $set:       { "fb_page.like_count": og_data.likes,"fb_page.last_update":now}
                        }, function(err,count)  {
                            callback(err,page.like_count,now);
                            //console.log(err);
                        });
                    }
                     else {
                        callback(error,page.like_count,page.last_update);
                    }

                });
            });
        });

    }
}
var once_an_hour_cron =   exports.once_an_hour_cron = {
    fillUsersTokens : function(callback){

        var iterator = function(user, itr_cbk){
            var cup = 9 + user.num_of_extra_tokens;
            if(user.tokens < cup){
                var inc_tokens = Math.min(24/cup, cup - user.tokens);
                models.User.update({_id: user._id}, {$inc:{tokens: inc_tokens}}, itr_cbk);
            }else{
                itr_cbk
            }
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

  //    X_tokens_for_post
  findWhoGotGtrNumberOfTokensForAPostOrSuggestion:function (number, callback) {
    var event = number + "_tokens_for_a_post_or_suggestion";
    var event_bonus = 1;
    var creator_user_id;
    //this type means that user will get tokens fill up
    var bonus_type = "extra_cup";

    var iterator = function(post_or_suggestion, itr_cbk){

      async.parallel([
        function(cbk){
          addTokensToUserByEventAndSetGamificationBonus(post_or_suggestion.creator_id, event, event_bonus, bonus_type, function(err, result){
            cbk(err, result);
          });
        },

        function(cbk){
          models.PostOrSuggestion.update({_id:post_or_suggestion._id}, {$set: {"gamification.high_number_of_tokens_bonus":true}}, cbk);
        }
      ], function(err, args){
        itr_cbk(err, args);
      })

    }
    async.waterfall([

      function (cbk) {
        models.PostOrSuggestion.find().where("gamification.high_number_of_tokens_bonus", false)
          .where("votes_for").gt(number)
          .exec(cbk);
      },

      function (posts, cbk) {
        async.forEach(posts, iterator, cbk);
      }
    ], callback);
  },
}
var daily_cron =  exports.daily_cron = {

    //taking back mandates from proxy
    takeProxyMandatesBack: function(callback){
        console.log("1");
        var proxies_ids_and_number_of_tokens_to_get_back = [
            {
                proxy_id: null,
                num_of_extra_tokens: null,
                number_of_people_i_dont_represent_no_more: null
            }
        ];

        var proxy_notifications = [
            {
                proxy_id: null,
                notificator_id: null,
                number_of_taken_tokens: null
            }
        ];

        var user_notifications = [
            {
                user_id: null,
                proxy_id: null,
                number_of_tokens_i_got_back: null
            }
        ];

        async.waterfall([
            function(cbk){
                console.log("2");

                //TODO this doesnt return anything
//                models.User.find().where("proxy.number_of_tokens_to_get_back").gt(0).run(function(err, results){
                models.User.find({}, function(err, results){
                    console.log("2.1");
                    cbk(err, results);
                });
            },

            function(users, cbk){

                console.log("3");
                    async.forEach(users, function(user, itr_cbk){
                        _.each(user.proxy, function(proxy){
                            if(proxy.number_of_tokens_to_get_back > 0){

                                //create a list of proxies and sum the number of tokens to take from them
                                var exist_proxy = _.find(proxies_ids_and_number_of_tokens_to_get_back, function(proxy){return proxy.proxy_id + "" == proxy.user_id + ""});

                                if(exist_proxy){
                                    if(proxy.number_of_tokens_to_get_back == proxy.number_of_tokens)
                                        exist_proxy.number_of_people_i_dont_represent_no_more += 1;
                                    exist_proxy.num_of_extra_tokens += proxy.number_of_tokens_to_get_back;
                                }
                                else{
                                    proxies_ids_and_number_of_tokens_to_get_back.push({
                                        proxy_id: proxy.user_id,
                                        num_of_extra_tokens: proxy.number_of_tokens_to_get_back,
                                        number_of_people_i_dont_represent_no_more: (proxy.number_of_tokens_to_get_back == proxy.number_of_tokens) ? 1 : 0})
                                }

//                                //reduce tokens from my tokens
//                                user.num_of_mandates_i_gave -= proxy.number_of_tokens_to_get_back;

                                //set notifications for proxy
                                proxy_notifications.push({
                                    proxy_id: proxy.user_id,
                                    notificator_id: user._id,
                                    number_of_taken_tokens: proxy.number_of_tokens_to_get_back
                                })

                                //set notifications for user
                                user_notifications.push({
                                    user_id: user._id,
                                    proxy_id: proxy.user_id,
                                    number_of_tokens_i_got_back: proxy.number_of_tokens_to_get_back
                                })

                                //reset number_of_tokens_to_get_back
                                proxy.number_of_tokens -=  proxy.number_of_tokens_to_get_back;
                                proxy.number_of_tokens_to_get_back = 0;
                            }
                        })

                        if(user.proxy && user.proxy.length > 0){
                            user.save(function(err, user_obj){
                                if(err){
                                    console.error(err);
                                    console.log(user);
                                }

                                itr_cbk(err, user_obj);
                            })
                        }else
                            itr_cbk();



                    }, function(err, results){
                        cbk(err, results);
                    });
            },

            function(obj, cbk){
                console.log("4");
                if(obj != 0){
                    //update proxies with their new amount off mandates
                    async.forEach(proxies_ids_and_number_of_tokens_to_get_back, function(proxy, itr_cbk){

                        models.User.update({_id: proxy.proxy_id},
                            {$inc: {
                                num_of_given_mandates:  proxy.num_of_extra_tokens * -1,
                                num_of_proxies_i_represent: proxy.number_of_people_i_dont_represent_no_more * -1}
                            }, function(err, num){
                            itr_cbk(err, num);
                        })
                    }, function(err, result){
                        cbk(err, result)
                    });
                }else{
                    cbk(null, 0);
                }
            }
        ], function(err, obj){
            console.log("5");
            callback(err, obj);
        })
    },

    //    בזבוז של כל הטוקנים במשך X ימים
    //this should happen before the tokens fill again
    findWhoSpentAllTokensInNumberOfDaysInARow: function(num_of_days, callback){
        var event = "spent_all_tokens_for_" + num_of_days + "_days";
        var event_bonus = 1;
        var bonus_type = "extra_cup";

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

    updateTagAutoComplete: function(callback){
        var iterator = function(tag, itr_cbk){
            models.Tag.update({"tag": tag}, {"tag": tag, $inc: {popularity: 1}}, {upsert: true}, itr_cbk);
        }

        async.parallel([
            function(cbk){
                models.InformationItem.find({}, {'tags':1}, cbk);
            },

            function(cbk){
                models.Subject.find({}, {'tags':1}, cbk);
            },

            function(cbk){
                models.Discussion.find({}, {'tags':1}, cbk);
            },

            function(cbk){
                models.Article.find({}, {'tags':1}, cbk);
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
                    async.forEach(tags, iterator, callback(err, "finish set tag popularity.."));
                }
            })
        })
    },

    updateBlogTagAutoComplete: function(callback){

        async.waterfall([

            function(cbk){
                models.BlogTag.remove({}, function (err, results){ cbk(err, results)});
            },

            function(results, cbk){
                models.Article.collection.group(

                    {user_id: true},
                    {},
                    {},
                        function(doc, out) {
                            var tags = doc.tags;
                            for(var i=0; i<tags.length; i++) {
                                out[tags[i]] = (out[tags[i]] || 0) + 1;
                            }
                        }.toString()
                    ,
                    function(err, results){

                        cbk(err, results);
                    });
            },

            function(results, cbk){
                async.forEach(results, function(blog_tags, itr_cbk){
                    var user_id = blog_tags.user_id;
                    delete blog_tags['user_id'];

                    var funcs = _.map(blog_tags,function(popularity, tag) {
                        return function(cbk) {
                            var blog_tag = new models.BlogTag();
                            blog_tag.tag = tag;
                            blog_tag.popularity = popularity;
                            blog_tag.user_id = user_id;
                            blog_tag.save(cbk);
                        }
                    });
                    async.parallel(funcs,itr_cbk);

                }, cbk);
            }

        ], function(err, arg){
            if(err)
                console.error(err);
            else
                console.log("Cron - BlogTags completed successfuly");
       })
    },

  //    X_tokens_for_all_my_posts
  findWhoGotNumberOfTokensForAllPosts:function (number, callback) {
    var event = number + "_tokens_for_all_posts";
    var path = "gamification.bonus." + event;
    var event_bonus = 1;
    var creator_user_id;
    var bonus_type = "extra_cup";

    var iterator = function(group_post, itr_cbk){
      if(group_post.sum > number){
        addTokensToUserByEventAndSetGamificationBonus(group_post.creator_id, event, event_bonus, bonus_type, itr_cbk);
      }else{
        itr_cbk(null, 0);
      }
    }

    async.waterfall([
      function (cbk) {
        models.User.find({path:{$ne:true}},'_id').limit(10000).exec(cbk);//TODO is path works?
      },

      function (users, cbk) {
        var user_ids = _.map(users,function(user) { return user._id});
        models.PostOrSuggestion.collection.group(
          {
            key: {creator_id: true},
            cond: {creator_id: {$in: user_ids}},
            initial: {sum: 0},
            reduce: function(obj,prev) { prev.sum += obj.votes_for}
          }, function(err, result){
            cbk(err, result);
          });
      },

      function(gruop_posts, cbk){
        async.forEach(gruop_posts, iterator, cbk);
      }
    ], function(err, obj){
      callback(err, obj);
    })
  },
}

/*function addTokensToUserByEventAndIncGamificationBonus(user_id, event, event_bonus, callback) {

    var inc_gamification_bonus = {};

    inc_gamification_bonus['gamification.bonus.' + event] = 1;
    inc_gamification_bonus['num_of_extra_tokens'] = event_bonus;
    models.User.update({_id:user_id}, {$inc: inc_gamification_bonus}, function (err, result) {
        callback(err, result);
    });
}*/

function addTokensToUserByEventAndSetGamificationBonus(user_id, event, event_bonus, bonus_type, callback) {

    var set_gamification_bonus = {};

    var conditions = (bonus_type == 'extra_cup') ? {num_of_extra_tokens:event_bonus} : {tokens: event_bonus};

    set_gamification_bonus['gamification.bonus.' + event] = true;

    //find user and update his new tokens/cup and gamifications

    async.waterfall([

      //        function(user, cbk){
//          models.User.update({_id:user_id}, {/*$inc:conditions, */$set: set_gamification_bonus}, function (err, result) {
//            cbk(err, user);
//          });
//        },
        function(cbk){
            models.User.findById(user_id, cbk);
        },

        function(user, cbk){
            user.gamification['bonus.' + event] = true;
            if(bonus_type == 'extra_cup') {
                // max cup is 6
                user.num_of_extra_tokens = Math.min(user.num_of_extra_tokens + event_bonus, 6);
            }else{
                user.tokens = Math.min(user.tokens + event_bonus, user.tokens + user.num_of_extra_tokens);
            }

            user.save(function(err, saved_user){
                cbk(err, saved_user);
            })
        }
    ], function(err, user){
        callback(err, user);
    })
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


