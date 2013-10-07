'use strict';
if (!module.parent) console.error('Please don\'t call me directly.I am just the main app\'s minion.') || process.process.exit(1);

var util = require('util'),
    models = require('./models'),
    common = require('./api/common'),
    async = require('async'),
    _ = require('underscore')
//   ,$
//    ,zombie
    ,og_get = require('./og/data.js').get;
//
//try{
//    $ = require('jquery');
//} catch(e){
//    console.error('cant load jquery');
//}
//try{
//    zombie = require('zombie');
//} catch(e) {
//    console.error('cant load zombie');
//}


function addTokensToUserByEventAndSetGamificationBonus(user_id, event, event_bonus, bonus_type, callback) {
    var set_gamification_bonus = {};
    set_gamification_bonus['gamification.bonus.' + event] = true;
    //find user and update his new tokens/cup and gamifications
    async.waterfall([
        function (cbk) {
            models.User.findById(user_id, cbk);
        },

        function (user, cbk) {
            user.gamification['bonus.' + event] = true;
            if (bonus_type === 'extra_cup') {
                // max cup is 6
                user.num_of_extra_tokens = Math.min(user.num_of_extra_tokens + event_bonus, 6);
            } else {
                user.tokens = Math.min(user.tokens + event_bonus, user.tokens + user.num_of_extra_tokens);
            }

            user.save(function (err, saved_user) {
                cbk(err, saved_user);
            })
        }
    ], function (err, user) {
        callback(err, user);
    })
}



var ten_seconds_cron = exports.ten_seconds_cron = {
    fb_pages_likes: function (cycle_id, callback) {
        var find_criteria = {'fb_page.url': {$exists: true}};
        if (cycle_id) {
            find_criteria['_id'] = cycle_id;
        }
        models.Cycle.find(find_criteria, function (err, cycles) {
            async.forEach(cycles, function (cycle) {
                var page = cycle.fb_page;
                if(page && page.url){
                    og_get('http://graph.facebook.com/' + page.url, function (error, og_data) {

                        if (og_data.likes !== page.like_count) {
                           //
                           //
                            if(!og_data.likes){
                                console.log("og_data error:");
                                console.log(og_data);
                                console.error(og_data.error);
                            } else{
                                var now = Date.now();
                                models.Cycle.update({_id: cycle._id}, {
                                    $set: { "fb_page.like_count": og_data.likes, "fb_page.last_update": now , "fb_page.like_count_prev": page.like_count }
                                }, function (err) {
                                    console.log("page "+page.url +" "+ og_data.likes +" likes - UPDATED") ;
                                    callback(err, og_data.likes,page.like_count, now);
                                });
                            }
                        } else {
                            console.log("page "+page.url +" "+ og_data.likes +" likes - no change") ;
                            callback(error, page.like_count,page.like_count_prev,  page.last_update);
                        }
                    });
                }
            });
        });
    }
};



var once_an_hour_cron = exports.once_an_hour_cron = {

    scrapeFBPagesLikes: function (main_callback) {
        return;
        console.log('---scrapeFBPagesLikes start')
        var fb_user ='daniella.geula@gmail.com';
        var fb_pass = 'dz5274046';
        var browser=null;
        if(GLOBAL.zombie) {
            browser = GLOBAL.zombie
        } else{
            browser = GLOBAL.zombie = new zombie()  ;
        }
        console.log('---scrapeFBPagesLikes browser')
        models.Cycle.find({"fb_page.fb_id": {$exists: true} }).exec(function(err, cycles){
            if(err){
                console.log('---find error ' +err ) ;
                main_callback(err);
            }else{
                console.log('---find cycles ' +cycles.length )
                var func_arr =null;
                func_arr =_.map(cycles,function(cycle){
                    return  function(callback) {
                        getUsersLoop(5,browser,cycle.fb_page.fb_id,function(err,users){
                            if(!err){
                                console.log(users);
                                models.Cycle.update({"fb_page.fb_id": cycle.fb_page.fb_id},{$addToSet:{"fb_page.users" :{ $each : users}}}, function(err,count)
                                {
                                    callback(err, {'users':users});
                                });
                            }else{
                                callback(err);
                            }

                        });
                    }
                });
                async.series( func_arr ,main_callback);
            }

        });


        function getUsersLoop(repeat,browser,page_id, callback){
            console.log('---getUsersLoop - '+repeat + ' - ' +page_id)
            if(repeat==0){
                return;
            } else{
                getUsers(browser,page_id,function(err,users){
                    console.log('---getUsers - '+err +' - '+ users)
                    if(err=="no_login"){
                        doFBLogin(browser,function(err){
                            if(err){
                                callback("login failed");
                            }else{
                                getUsersLoop(repeat-1,browser,page_id,callback)
                            }
                        })
                    }else  if(err){
                        getUsersLoop(repeat-1,browser,page_id,callback);
                    } else{
                        callback(null,users) ;
                    }
                })

            }
        }

        function doFBLogin (browser, callback){
            console.log("doLogin");
            browser.visit("https://www.facebook.com/", function () {
                //console.log(browser.location.pathname);
                var page = $(browser.html());
                if(page.find("#u_0_4").length ==1 ){
                    console.log("login to facebook");
                    //console.log(browser.location.pathname);
                    browser.
                        fill("email",fb_user).
                        fill("pass", fb_pass).
                        pressButton("#u_0_4", function() {
                            //console.log(browser.location.pathname + " : " + browser.success);
                            callback(null);
                        })
                }
                else if(page.find("#u_0_1").length ==1){
                    console.log("recognized login to facebook");
                    //console.log(browser.location.pathname);
                    browser.
                        fill("pass", fb_pass).
                        pressButton("#u_0_1", function() {
                            //console.log(browser.location.pathname + " : " + browser.success);
                            callback(null);
                        })
                }
                else{
                    console.log("facebook page not loaded");
                    callback("login failed");
                }

            });
        }


        function getUsers(browser,page_id, callback){
            console.log("Get Users " + page_id);
            browser.visit("https://www.facebook.com/browse/?type=page_fans&page_id="+page_id, function () {
                if(browser.success) {
                    var p = $(browser.html());
                    var users =p.find('li.fbProfileBrowserListItem a');
                    var users_arr=[];
                    $.each(users,function(key,obj){
                        var tmp_obj=   eval($(obj).data("gt"));
                        if(tmp_obj) {
                            var user= $(obj);
                            var user_obj=  {}
                            user_obj['fb_id']= tmp_obj.engagement.eng_tid;
                            user_obj['name']= user.text();

                            //users_arr.push(user_obj) ;
                            users_arr.push(tmp_obj.engagement.eng_tid) ;
                        }
                    });

                    if(users_arr.length==0) {
                        console.log("error  - no users found")  ;
                        if(p.find("#email").length ==1 ){
                            console.log("error  - not logeed in")  ;
                            callback("no_login")
                        }else{
                            console.log("error  -  unknown")  ;
                            callback("unknown")
                        }
                        //res.send(browser.html());
                    }   else{
                        //res.json(users_arr);
                        callback(null,users_arr)
                    }
                } else  {
                    callback(browser.errors)
                }
            });
        }

    },

    fillUsersTokens: function (callback) {

        var iterator = function (user, itr_cbk) {
            var cup = 9 + user.num_of_extra_tokens;
            if (user.tokens < cup) {
                var inc_tokens = Math.min(24 / cup, cup - user.tokens);
                models.User.update({_id: user._id}, {$inc: {tokens: inc_tokens}}, itr_cbk);
            } else {
                itr_cbk();
            }
        };

        //noinspection JSUnresolvedFunction
        async.waterfall([
            function (cbk) {
                models.User.find({}, cbk)
            },

            function (users, cbk) {
                async.forEach(users, iterator, cbk);
            }
        ], callback);
    },

    //    X_tokens_for_post
    findWhoGotGtrNumberOfTokensForAPostOrSuggestion: function (number, callback) {
        var event = number + "_tokens_for_a_post_or_suggestion";
        var event_bonus = 1;
        //this type means that user will get tokens fill up
        var bonus_type = "extra_cup";

        var iterator = function (post_or_suggestion, itr_cbk) {
            //noinspection JSUnresolvedFunction
            async.parallel([
                function (cbk) {
                    addTokensToUserByEventAndSetGamificationBonus(post_or_suggestion.creator_id, event, event_bonus, bonus_type, function (err, result) {
                        cbk(err, result);
                    });
                },

                function (cbk) {
                    models.PostOrSuggestion.update({_id: post_or_suggestion._id}, {$set: {"gamification.high_number_of_tokens_bonus": true}}, cbk);
                }
            ], function (err, args) {
                itr_cbk(err, args);
            })
        };

        //noinspection JSUnresolvedFunction
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
    }
};



var daily_cron = exports.daily_cron = {
    //taking back mandates from proxy
    takeProxyMandatesBack: function (callback) {
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

        //noinspection JSUnresolvedFunction
        async.waterfall([
            function (cbk) {
                console.log("2");

                //TODO this doesnt return anything
//                models.User.find().where("proxy.number_of_tokens_to_get_back").gt(0).run(function(err, results){
                models.User.find({}, function (err, results) {
                    console.log("2.1");
                    cbk(err, results);
                });
            },

            function (users, cbk) {

                console.log("3");
                async.forEach(users, function (user, itr_cbk) {
                    _.each(user.proxy, function (proxy) {
                        if (proxy.number_of_tokens_to_get_back > 0) {

                            //create a list of proxies and sum the number of tokens to take from them
                            var exist_proxy = _.find(proxies_ids_and_number_of_tokens_to_get_back, function (proxy) {return proxy.proxy_id + "" === proxy.user_id + ""});

                            if (exist_proxy) {
                                if (proxy.number_of_tokens_to_get_back === proxy.number_of_tokens) {
                                    exist_proxy.number_of_people_i_dont_represent_no_more += 1;
                                }
                                exist_proxy.num_of_extra_tokens += proxy.number_of_tokens_to_get_back;
                            }
                            else {
                                proxies_ids_and_number_of_tokens_to_get_back.push({
                                    proxy_id: proxy.user_id,
                                    num_of_extra_tokens: proxy.number_of_tokens_to_get_back,
                                    number_of_people_i_dont_represent_no_more: (proxy.number_of_tokens_to_get_back === proxy.number_of_tokens) ? 1 : 0})
                            }

//                                //reduce tokens from my tokens
//                                user.num_of_mandates_i_gave -= proxy.number_of_tokens_to_get_back;

                            //set notifications for proxy
                            proxy_notifications.push({
                                proxy_id: proxy.user_id,
                                notificator_id: user._id,
                                number_of_taken_tokens: proxy.number_of_tokens_to_get_back
                            });

                            //set notifications for user
                            user_notifications.push({
                                user_id: user._id,
                                proxy_id: proxy.user_id,
                                number_of_tokens_i_got_back: proxy.number_of_tokens_to_get_back
                            });

                            //reset number_of_tokens_to_get_back
                            proxy.number_of_tokens -= proxy.number_of_tokens_to_get_back;
                            proxy.number_of_tokens_to_get_back = 0;
                        }
                    });

                    if (user.proxy && user.proxy.length > 0) {
                        user.save(function (err, user_obj) {
                            if (err) {
                                console.error(err);
                                console.log(user);
                            }

                            itr_cbk(err, user_obj);
                        })
                    } else {
                        itr_cbk();
                    }



                }, function (err, results) {
                    cbk(err, results);
                });
            },

            function (obj, cbk) {
                console.log("4");
                if (obj !== 0) {
                    //update proxies with their new amount off mandates
                    async.forEach(proxies_ids_and_number_of_tokens_to_get_back, function (proxy, itr_cbk) {

                        models.User.update({_id: proxy.proxy_id},
                            {$inc: {
                                num_of_given_mandates: proxy.num_of_extra_tokens * -1,
                                num_of_proxies_i_represent: proxy.number_of_people_i_dont_represent_no_more * -1}
                            }, function (err, num) {
                                itr_cbk(err, num);
                            })
                    }, function (err, result) {
                        cbk(err, result)
                    });
                } else {
                    cbk(null, 0);
                }
            }
        ], function (err, obj) {
            console.log("5");
            callback(err, obj);
        })
    },

    //X_suggestions_for_a_discussion
    findWhoInsertedNumberOfApprovedSuggestions: function (number, callback) {
        var event = number + "_num_of_approved_suggestions";
        var event_bonus = 3;
        var bonus_type = "extra_cup";

        var iterator = function (user, iteration_cbk) {
            //noinspection JSUnresolvedVariable
            if (user.gamifiacation.approved_suggestion && user.gamifiacation.approved_suggestion > number) {
                addTokensToUserByEventAndSetGamificationBonus(user._id, event, event_bonus, bonus_type, iteration_cbk);
            } else {
                iteration_cbk(null, 0);
            }
        };

        async.waterfall([
            function (cbk) {
                models.User.find({path: {$ne: true}}, cbk);
            },
            function (users, cbk) {
                async.forEach(users, iterator, cbk);
            }
        ], callback);
    },


    //    X_tokens_for_all_my_posts
    findWhoGotNumberOfTokensForAllPosts: function (number, callback) {
        var event = number + "_tokens_for_all_posts";
        var event_bonus = 1;
        var bonus_type = "extra_cup";

        var iterator = function (group_post, itr_cbk) {
            if (group_post.sum > number) {
                addTokensToUserByEventAndSetGamificationBonus(group_post.creator_id, event, event_bonus, bonus_type, itr_cbk);
            } else {
                itr_cbk(null, 0);
            }
        };

        //noinspection JSUnresolvedFunction
        async.waterfall([
            function (cbk) {
                models.User.find({path: {$ne: true}}, '_id').limit(10000).exec(cbk);//TODO is path works?
            },

            function (users, cbk) {
                var user_ids = _.map(users, function (user) { return user._id});
                models.PostOrSuggestion.collection.group(
                    {
                        key: {creator_id: true},
                        cond: {creator_id: {$in: user_ids}},
                        initial: {sum: 0},
                        reduce: function (obj, prev) { prev.sum += obj.votes_for}
                    }, function (err, result) {
                        cbk(err, result);
                    });
            },

            function (gruop_posts, cbk) {
                async.forEach(gruop_posts, iterator, cbk);
            }
        ], function (err, obj) {
            callback(err, obj);
        })
    },


    //X_mandates_for_user
    findWhoGotNumberOfMandates: function (number, callback) {
        var event = number + "_num_of_mandates";
        var event_bonus = 0;
        var bonus_type = "extra_cup";

        //noinspection JSUnresolvedFunction
        async.waterfall([
            function (cbk) {
                models.User.find({num_of_given_mandates: {$gt: number}, path: {$ne: true}}, function (err, users) {
                    cbk(err, users);
                });
            },

            function (users, cbk) {
                async.forEach(users, function (user, itr_cbk) {
                    addTokensToUserByEventAndSetGamificationBonus(user._id, event, event_bonus, bonus_type, itr_cbk);
                }, cbk);
            }
        ], function (err) {
            if (err) {
                console.error(err);
            }
            callback(err);
        })
    }
};



exports.run_main_thread = function () {

};



exports.run = function () {

    setInterval(function () {
        console.log('@@@@@@@@@@@ cron fb_pages_likes @@@@@@@@@@@');
        ten_seconds_cron.fb_pages_likes(null, function (err, result) {
            // console.log(err || result);
        })
    }, 10 * 1000);

    setInterval(function () {
        console.log('@@@@@@@@@@@ cron scrapeFBPagesLikes @@@@@@@@@@@');
        once_an_hour_cron.scrapeFBPagesLikes(function (err, result) {
            if(err)
                console.log(err);
        })
    }, 12 * 60 * 60   * 1000);

    setTimeout(function () {
        console.log('@@@@@@@@@@@ cron scrapeFBPagesLikes @@@@@@@@@@@');
        once_an_hour_cron.scrapeFBPagesLikes(function (err, result) {
            if(err)
                console.log(err);
        })
    }, 20   * 1000);


    setInterval(function () {
        console.log('@@@@@@@@@@@ cron fillUsersTokens @@@@@@@@@@@');
        once_an_hour_cron.fillUsersTokens(function (err, result) {
            console.log(err || result);
        })
    }, 60 * 60 * 1000);

    setInterval(function () {
        console.log('@@@@@@@@@@@ cron findWhoGotGtrNumberOfTokensForAPostOrSuggestion @@@@@@@@@@@');
        once_an_hour_cron.findWhoGotGtrNumberOfTokensForAPostOrSuggestion(common.getGamificationTokenPrice('X_tokens_for_post'), function (err, result) {
            console.log(err || result);
        })
    }, 60 * 60 * 1000);

    setInterval(function () {
        console.log('@@@@@@@@@@@ cron updateBlogTagAutoComplete @@@@@@@@@@@');
        daily_cron.updateBlogTagAutoComplete(function (err, result) {
            console.log(err || result);
        })
    }, 60 * 1000 * 24 * 60);

    setInterval(function () {
        console.log('@@@@@@@@@@@ cron takeProxyMandatesBack @@@@@@@@@@@');
        daily_cron.takeProxyMandatesBack(function (err, result) {
            console.log(err || result);
        })
    }, 60 * 1000 * 24 * 60);

    setInterval(function () {
        console.log('@@@@@@@@@@@ cron findWhoGotNumberOfTokensForAllPosts @@@@@@@@@@@');
        daily_cron.findWhoGotNumberOfTokensForAllPosts(common.getGamificationTokenPrice('X_tokens_for_all_my_posts'), function (err, result) {
            console.log(err || result);
        })
    }, 60 * 1000 * 24 * 60);

    setInterval(function () {
        console.log('@@@@@@@@@@@ cron findWhoInsertedNumberOfApprovedSuggestions @@@@@@@@@@@');
        daily_cron.findWhoInsertedNumberOfApprovedSuggestions(common.getGamificationTokenPrice('X_suggestions_for_a_discussion'), function (err, result) {
            console.log(err || result);
        })
    }, 60 * 1000 * 24 * 60);

    setInterval(function () {
        console.log('@@@@@@@@@@@ cron findWhoGotNumberOfMandates @@@@@@@@@@@');
        daily_cron.findWhoGotNumberOfMandates(common.getGamificationTokenPrice('X_mandates_for_user'), function (err, result) {
            console.log(err || result);
        })
    }, 60 * 1000 * 24 * 60);
};
