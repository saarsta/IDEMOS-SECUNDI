/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 05/03/12
 * Time: 18:12
 * To change this template use File | Settings | File Templates.
 */

var resources = require('jest'),
    util = require('util'),
    models = require('../models'),
    common = require('./common'),
    async = require('async'),
    notifications = require('./notifications');

var EDIT_TEXT_LEGIT_TIME = 60 * 1000 * 15;


var SuggestionResource = module.exports = common.GamificationMongooseResource.extend({
    init:function () {
        this._super(models.Suggestion, 'suggestion', common.getGamificationTokenPrice('suggestion_on_discussion') > -1 ? common.getGamificationTokenPrice('suggestion') : 0);
        this.allowed_methods = ['get', 'post', 'put'];
//        this.authorization = new Authoriztion();
        this.authentication = new common.SessionAuthentication();
        this.filtering = {discussion_id:null, is_approved:null};
        this.default_query = function (query) {
            return query.sort({'creation_date':'descending'}).populate('creator_id');
        };

        this.fields = {
            creator_id:common.user_public_fields,
            mandates_curr_user_gave_creator:null,
            parts:null,
            popularity:null,
            tokens:null,
            creation_date:null,
            agrees:null,
            not_agrees:null,
            evaluate_counter:null,
            manual_counter:null,
            grade:null,
            id:null,
            explanation:null,
            updated_user_tokens:null,
            grade_obj:{
                _id:null,
                evaluation_grade:null,
                does_support_the_suggestion:null
            },
            wanted_amount_of_tokens:null,
            curr_amount_of_tokens:null,
            is_editable: null,
            context_before: null,
            context_after: null
        };
    },

    get_objects: function (req, filters, sorts, limit, offset, callback) {
        var self = this;
        var discussion_id = req.query.discussion_id;
        var discussion_threshold;

        var user_id = req.user && req.user._id + "";

        var iterator = function (suggestion, itr_cbk) {
            // set is_editable flag if user is the creator and its 15 min after publish
            if (user_id === suggestion.creator_id.id && new Date() - suggestion.creation_date <= EDIT_TEXT_LEGIT_TIME){
                suggestion.is_editable = true
            }

            //get discussion text before and after the suggestions
            suggestion.context_before = discussion_text.substring(Math.max(suggestion.parts[0].start - 400, 0), suggestion.parts[0].start, suggestion.parts[0].start);
            suggestion.context_after = discussion_text.substring(suggestion.parts[0].end, Math.min(discussion_text.length, suggestion.parts[0].end + 400));

            //set counter og graders manually
            suggestion.manual_counter = Math.round(suggestion.agrees) + Math.round(suggestion.not_agrees);

            var curr_grade_obj = {};
//            suggestion.grade_obj = curr_grade_obj;

            suggestion.curr_amount_of_tokens = suggestion.agrees - suggestion.not_agrees;

            //wanted amount of tokens is either what admin has entered to the specific suggestion, or the discussion threshold...
            if (suggestion.admin_threshold_for_accepting_the_suggestion > 0)
                suggestion.wanted_amount_of_tokens = suggestion.admin_threshold_for_accepting_the_suggestion;
            else
                suggestion.wanted_amount_of_tokens = Number(suggestion.threshold_for_accepting_the_suggestion) || calculate_sugg_threshold(suggestion.getCharCount(), discussion_threshold);
            if (req.user) {
                models.GradeSuggestion.findOne({user_id:req.user._id, suggestion_id:suggestion._id}, {"_id":1, "evaluation_grade":1, "does_support_the_suggestion":1}, function (err, grade_sugg_obj) {
                    if (!err && grade_sugg_obj) {
                        curr_grade_obj = {
                            _id:grade_sugg_obj._id,
                            evaluation_grade:grade_sugg_obj.evaluation_grade,
                            does_support_the_suggestion:grade_sugg_obj.does_support_the_suggestion
                        }
                        suggestion.grade_obj = curr_grade_obj;
                        itr_cbk(err, suggestion);
                    } else {
                        //check if user is the creator - if so return in grade object the
                        if (!err) {
                            models.Discussion.findById(discussion_id, function (err, discussion) {
                                if (!err)
                                    if (req.user._id + "" == discussion.creator_id + "") {
//                                        suggestion.grade_obj = {};
//                                        suggestion.grade_obj["evaluation_grade"] = discussion.grade;
                                    }
                                itr_cbk(err, suggestion);
                            })
                        } else {
                            itr_cbk(err, suggestion);
                        }
                    }
                });
            }
            else {
                itr_cbk(null, suggestion);
            }
        }

        self._super(req, filters, sorts, limit, offset, function (err, results) {

            if (err)
                callback(err, null);
            else
            //arrange objects only if the request is from discussion page
            if (!discussion_id)
                callback(err, results);
            else {
                //for each object add grade_obj that reflects the user's grade for the suggestion,
                //if the user is the disvcussion creator - grade_obj contains the discussion evaluate grade
                //if the user is ofline grade_obj is {}

                async.waterfall([
                    function (cbk) {
                        models.Discussion.findById(discussion_id, cbk);
                    },

                    function (discussion_obj, cbk) {
                        discussion_threshold = discussion_obj.threshold_for_accepting_change_suggestions;
                        discussion_text = discussion_obj.text_field;

                        if (discussion_obj.admin_threshold_for_accepting_change_suggestions > 0){
                            discussion_threshold = discussion_obj.admin_threshold_for_accepting_change_suggestions;
                        }

                        async.forEach(results.objects, iterator, function (err, objs) {
                            cbk(err, results);
                        });
                    }
                ], function (err, results) {
                    callback(err, results);
                })
            }
        });
    },

    create_obj:function (req, fields, callback) {
        var user_id = req.user.id;
        var self = this;
        var suggestion_object = new self.model();
        var isNewFollower = false;
        var user = req.user;
        var discussion_id;
        var discussion_creator_id;
        var num_of_words;
        var disc_obj;

        var iterator = function (unique_user, itr_cbk) {
            user_id = user_id || user_id.id;

            if (unique_user  == user_id || !unique_user){
                console.log("user should not get mail if he is the notificator");
                itr_cbk(null, 0);
            } else {
                if (discussion_creator_id == unique_user) {
                    notifications.create_user_notification("change_suggestion_on_discussion_you_created", suggestion_object._id, unique_user, user_id, discussion_id, '/discussions/' + discussion_id, function (err, results) {
                        itr_cbk(err, results);
                    });
                } else {
                    notifications.create_user_notification("change_suggestion_on_discussion_you_are_part_of", suggestion_object._id, unique_user, user_id, discussion_id, '/discussions/' + discussion_id, function (err, results) {
                        itr_cbk(err, results);
                    });
                }
            }
        }

        fields.creator_id = user_id;
        fields.first_name = user.first_name;
        fields.last_name = user.last_name;


        for (var field in fields) {
            suggestion_object.set(field, fields[field]);
        }

        //calculate threshold for the suggestion.. for this i need to get discussion threshold first
        async.waterfall([
            //first, check if there is a suggestion with the same indexes
            function (cbk) {
                models.Suggestion.find({discussion_id:fields.discussion_id, is_approved:false}, cbk);
            },

            function (suggestions, cbk) {
                var err;
                var sug;
                var discussion_thresh;

                _.each(suggestions, function (suggestion) {
                    if ((suggestion.parts[0].start >= fields.parts[0].start && suggestion.parts[0].start <= fields.parts[0].end)
                        || (suggestion.parts[0].end >= fields.parts[0].start && suggestion.parts[0].end <= fields.parts[0].end)) {
                        err = true;
                        sug = suggestion._id;
                    }
                })
                if (err)
                    cbk({message:"a suggestion with this indexes already exist"});
                else
                    models.Discussion.findById(fields.discussion_id, cbk);
            },

            function (discussion_obj, cbk) {
                disc_obj = discussion_obj;

                var word_count = suggestion_object.getCharCount();
                suggestion_object.threshold_for_accepting_the_suggestion = calculate_sugg_threshold(word_count,
                    Number(discussion_obj.admin_threshold_for_accepting_change_suggestions) || Number(discussion_obj.threshold_for_accepting_change_suggestions));
                self.authorization.edit_object(req, suggestion_object, cbk);
            },

            function (suggestion_obj, cbk) {
                suggestion_object.save(function (err, data) {
                    if (data) {
                        discussion_id = data.discussion_id;
                        data.creator_id.id = user.id;
                        data.creator_id.first_name = user.first_name;
                        data.creator_id.last_name = user.last_name;
                        data.creator_id.avatar_url = user.avatar_url();
                        data.creator_id.score = user.score;
                        data.creator_id.num_of_given_mandates = user.num_of_given_mandates;
                        data.creator_id.num_of_proxies_i_represent = user.num_of_proxies_i_represent;
                        suggestion_obj.wanted_amount_of_tokens = suggestion_obj.threshold_for_accepting_the_suggestion;
                    }
                    cbk(err, data);
                });
            },

            function (suggestion_obj, cbk) {
                async.parallel([

                    //add user that connected somehow to discussion
                    function(cbk2){
                        models.Discussion.update({_id: disc_obj._id, "users.user_id": {$ne: user_id}},
                            {$addToSet: {users: {user_id: user_id, join_date: Date.now(), $set:{last_updated: Date.now()}}}}, function(err, num){
                                cbk2(err);
                            });
                    },

                    //add user that connected somehow to discussion
                    function(cbk2)
                    {
                        models.User.update({_id: user_id, "discussions.discussion_id": {$ne: disc_obj._id}},
                            {$addToSet: {discussions: {discussion_id:  disc_obj._id, join_date: Date.now()}}}, function(err, num){
                                cbk2(err);
                            });
                    },

                    //add notification for the dicussion's participants or creator
                    function (cbk2) {
                        var unique_users = [];

                        discussion_creator_id = disc_obj.creator_id;

                        // be sure that there are no duplicated users in discussion.users
                        _.each(disc_obj.users, function(user){ unique_users.push(user.user_id + "")});
                        unique_users = _.uniq(unique_users);

                        async.forEach(unique_users, iterator, function(err){
                            cbk2(err);
                        });
                    },

                    //set notifications for users that i represent (proxy)
                    function (cbk2) {
                        models.User.find({"proxy.user_id":user_id}, function (err, slaves_users) {
                            async.forEach(slaves_users, function (slave, itr_cbk) {
                                notifications.create_user_notification("proxy_created_change_suggestion", suggestion_obj._id, slave._id, user_id, discussion_id, '/discussions/' + discussion_id, function (err, result) {
                                    itr_cbk(err);
                                })
                            }, function (err) {
                                cbk2(err);
                            })
                        })

                    },

                    // update actions done by user
                    function(cbk2){
                        models.User.update({_id:user.id},{$set: {"actions_done_by_user.suggestion_on_object": true}}, function(err){
                            cbk2(err);
                        });
                    }

                ], function (err) {
                    cbk(err, suggestion_obj);
                });
            }
        ], function (err, result) {
            if (err) {
                console.error(err);
                console.trace();
            }
            callback(err, result);
        });
    },

    update_obj:function (req, object, callback) {
        var update_legit_time = 60 * 1000 * 15;
        //first check if its in 15 min range after publish
        if(new Date() - object.creation_date > update_legit_time){
            callback({message: 'to late to update suggestion', code: 404})
        }else{
            // update text of first cell in arr (its always the only cell)
            models.Suggestion.update({_id: object.id}, {$set:{"parts.0.text": req.body.text}}, function(err, num){
                if (num == 0){
                    callback('could not find the suggestion');
                }else {
                    callback(err, {});
                }
            });
        }
    }
});

module.exports.approveSuggestion = function (id, callback) {
    //if suggestion approved we change the discussion vision
    // + save the ealier version of vison as parts in vison_changes

    //+ suggestion grade becomes the discussion grade
    var suggestion_object;
    var suggestion_creator;
    var discussion_id;
    var suggestion_grade;

    //update discussion grade
    var iterator = function (sugg_grade, itr_cbk) {

        async.parallel([

            //update discussion grade with the suggestion grade
            function (cbk1) {
                models.Grade.update({user_id:sugg_grade.user_id, discussion_id:discussion_id},
                    {$set:{evaluation_grade:sugg_grade.evaluation_grade}},
                    function (err, num) {
                        cbk1(err, num);
                    });
            }

        ], function (err, args) {
            itr_cbk(err, args);
        })
    };

    var noti_itr = function(user_id, itr_cbk){
        if (suggestion_creator != user_id + "") {
            notifications.create_user_notification("approved_change_suggestion_on_discussion_you_are_part_of",
                suggestion_object._id, user_id + "", null, discussion_id, '/discussions/' + discussion_id, itr_cbk);
        } else {
            itr_cbk(null, 0);
        }
    };

    async.waterfall([
        function (cbk) {
            models.Suggestion.findById(id, cbk);
        },

        function (_suggestion_object, cbk) {
            suggestion_object = _suggestion_object;
            suggestion_grade = suggestion_object.grade;
            if (suggestion_object.is_approved) {
                callback({message:"this suggestion is already published", code:401}, null);
            } else {
                discussion_id = suggestion_object.discussion_id;
                var vision_changes_array = [];
                models.Discussion.findOne({_id:discussion_id}, cbk);
            }
        },

        function (discussion_object, cbk) {

            async.parallel([

                //set latest discussionHistory with discussion grade
                function (cbk1) {
                    models.DiscussionHistory.find({dicussion_id:discussion_object._id})
                        .sort({'date':'descending'})
                        .limit(1)
                        .exec(function (err, histories) {
                            if (histories.length) {
                                histories[0].grade = discussion_object.grade;
                                histories[0].save(cbk1);
                            }
                            else
                                cbk1();
                        })
                },

                function (cbk1) {
                    var vision = discussion_object.text_field;
                    var new_string = "";
                    var curr_position = 0;
                    var parts = suggestion_object.parts;

                    //this is to fix null text in vision when the suggestion is to delete text - (261 Bug הצעה ריקה לשינוי עולה בתור null)
                    if (parts[0].text == null)
                        parts[0].text = "";
                    vision = vision.replace(/\r/g, '');


                    var str = vision.substr(0, Number(parts[0].start)) + parts[0].text + vision.substr(Number(parts[0].end));

                    discussion_object.vision_text_history.push(discussion_object.text_field);
                    discussion_object.text_field = str;

                    //suggestion grade is the new discussion grade
//                    models.Discussion.update({_id:discussion_object._id},
//                        {
//                            $set:{text_field: str, grade: suggestion_grade},
//                            $addToSet: {vision_text_history: discussion_object.vision_text}
//                        },
//
//                        function(err, counter){
//                            cbk1(err, discussion_object);
//                        });
                    discussion_object.save(cbk1);
                }

            ], function (err, args) {
                cbk(err, args[1][0]);
            })
        },

        function (disc_obj, cbk) {
            async.parallel([
                // after discussion was changed, create new DiscussionHistory
                function (cbk1) {
                    var discussion_history = new models.DiscussionHistory();

                    discussion_history.discussion_id = disc_obj._id;
                    discussion_history.date = Date.now();
                    discussion_history.text_field = disc_obj.text_field;

                    discussion_history.save(cbk1);
                },

                function (cbk1) {
                    suggestion_object.is_approved = true;
                    suggestion_object.save(cbk1);
                },

                function (cbk1) {
                    models.Suggestion.find({discussion_id:disc_obj, is_approved:false}, cbk1);
                }


            ], function (err, args) {

                //update indexes of all other suggestions
                var suggestions = args[2];
                var index_balance = suggestion_object.parts[0].text.length - (suggestion_object.parts[0].end - suggestion_object.parts[0].start);

                console.log("index_balance");
                console.log(index_balance);
                if (index_balance != 0) {
                    async.forEach(suggestions, function (suggestion, itr_cbk) {
                        console.log("suugstion_id:");
                        console.log(suggestion._id);
                        if (suggestion.parts[0].start > suggestion_object.parts[0].end) {
                            console.log("start");

                            suggestion.parts[0].start += index_balance;
                            suggestion.parts[0].end += index_balance;
                            console.log(suggestion.parts[0].start);
                            console.log("end");
                            console.log(suggestion.parts[0].end);
                            suggestion.save(function (err, result) {
                                itr_cbk(err, result)
                            })
                        } else
                            itr_cbk();
                    }, cbk(err, args[1][0]));
                }
                else
                    cbk(err, args[1][0]);
            })
        },

        function (sug_obj, cbk) {
            suggestion_creator = sug_obj.creator_id;
            async.parallel([
                //set gamification
                function (par_cbk) {
                    models.User.update({_id:sug_obj.creator_id}, {$inc:{"gamification.approved_suggestion":1}}, function (err, obj) {
                        par_cbk(err, obj);
                    });
                },

                //set notifications for creator
                function (par_cbk) {
                    notifications.create_user_notification("approved_change_suggestion_you_created",
                        sug_obj._id, sug_obj.creator_id, null, discussion_id, '/discussions/' + discussion_id, function (err, obj) {
                            par_cbk(err, obj);
                        });
                },

                //for each suggestion grade - copy it to discussion grade
                function (par_cbk) {

                    async.waterfall([
                        function (wtr_cbk) {
                            models.GradeSuggestion.find({suggestion_id:sug_obj._id}, wtr_cbk);
                        },

                        function (sugg_grades, wtr_cbk) {
                            async.forEach(sugg_grades, iterator, function (err, result) {
                                wtr_cbk(err || null, result || 0);
                            });
                        }
                    ], function (err, args) {
                        par_cbk(err, args);
                    });
                },

                // set notifications for discussion's participants
                function (cbk2) {

                    // first - response with cbk
                    cbk2();

                    // now set notifications
                    models.Discussion.findById(discussion_id, function (err, disc_obj) {
                        if (err){
                            console.error(err);
                        } else {
                            var unique_users = [];

                            // be sure that there are no duplicated users in discussion.users
                            _.each(disc_obj.users, function(user){ unique_users.push(user.user_id + "")});
                            unique_users = _.uniq(unique_users);

                            async.forEach(unique_users, noti_itr, cbk2);
                        }
                    })
                }
            ], function (err, args) {
                cbk(err, 8);
            })
        }
    ], function (err, arg) {
        callback(err, arg);
    });
}


var calculate_sugg_threshold = function (factor, discussion_threshold) {
    var log_base_75_of_x =
        Math.log(factor) / Math.log(75);
    var result = Math.pow(log_base_75_of_x, common.getThresholdCalcVariables("SCALE_PARAM")) * discussion_threshold;

    return Math.round(result);

}
