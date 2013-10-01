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
    notifications = require('./notifications'),
    mail = require('../lib/mail'),
    templates = require('../lib/templates');

var EDIT_TEXT_LEGIT_TIME = 60 * 1000 * 15;


var SuggestionResource = module.exports = common.GamificationMongooseResource.extend({
    init:function () {
        this._super(models.Suggestion, 'suggestion', common.getGamificationTokenPrice('suggestion_on_discussion') > -1 ? common.getGamificationTokenPrice('suggestion') : 0);
        this.allowed_methods = ['get', 'post', 'put', 'delete'];
        this.authentication = new common.SessionAuthentication();
        this.filtering = {discussion_id:null, is_approved:null};
        this.default_query = function (query) {
            return query.sort({'creation_date':'descending'}).populate('creator_id').where('under_moderation').ne('true');
        };

        this.fields = {
            _id: null,
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
            discussion_id:null,
            grade_obj:{
                _id:null,
                evaluation_grade:null,
                does_support_the_suggestion:null
            },
            wanted_amount_of_tokens:null,
            curr_amount_of_tokens:null,
            is_editable: null,
            is_my_suggestion: null,
            is_approved: null,
            replaced_text: null,
            approve_date: null,
            context_before: null,
            context_after: null,

            cancel: null,
            text_field: null,
            discussion_vision_text_history: null
        };
    },

    get_objects: function (req, filters, sorts, limit, offset, callback) {
        var self = this;
        var discussion_id = req.query.discussion_id;
        var discussion_threshold;
        var discussion_participants_count = 0;
        var user_id = req.user && req.user._id + "";

        var iterator = function (suggestion, itr_cbk) {
            //set is_my_suggestion flag
            suggestion.is_my_suggestion = suggestion.creator_id && (user_id === suggestion.creator_id.id);

            // set is_editable flag if user is the creator and its 15 min after publish
            if (user_id === suggestion.creator_id && suggestion.creator_id.id && new Date() - suggestion.creation_date <= EDIT_TEXT_LEGIT_TIME){
                suggestion.is_editable = true;
            }

            //set counter og graders manually
            suggestion.manual_counter = Math.round(suggestion.agrees) + Math.round(suggestion.not_agrees);

            var curr_grade_obj = {};
//            suggestion.grade_obj = curr_grade_obj;

            suggestion.curr_amount_of_tokens = suggestion.agrees - suggestion.not_agrees;

            //wanted amount of tokens is either what admin has entered to the specific suggestion, or the discussion threshold...
            if (suggestion.admin_threshold_for_accepting_the_suggestion > 0)
                suggestion.wanted_amount_of_tokens = suggestion.admin_threshold_for_accepting_the_suggestion;
            else{
                if (Number(suggestion.threshold_for_accepting_the_suggestion) === Infinity) suggestion.threshold_for_accepting_the_suggestion = null;
                suggestion.wanted_amount_of_tokens = Number(suggestion.threshold_for_accepting_the_suggestion) || calculate_sugg_threshold(suggestion.getCharCount(), discussion_threshold);
            }

            if (Number(suggestion.wanted_amount_of_tokens) > discussion_participants_count)
                suggestion.wanted_amount_of_tokens = discussion_participants_count - 1;

            if (req.user) {
                models.GradeSuggestion.findOne({user_id:req.user._id, suggestion_id:suggestion._id + ""}, {"_id":1, "evaluation_grade":1, "does_support_the_suggestion":1}, function (err, grade_sugg_obj) {
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
            else          {

                //arrange objects only if the request is from discussion page
                if (!discussion_id)  {
                    results.objects=results.objects.sort(likelihood) ;
                    callback(err, results);
                }
                else {
                    //for each object add grade_obj that reflects the user's grade for the suggestion,
                    //if the user is the disvcussion creator - grade_obj contains the discussion evaluate grade
                    //if the user is ofline grade_obj is {}

                    async.waterfall([
                        function (cbk) {
                            models.Discussion.findById(discussion_id, cbk);
                        },

                        function (discussion_obj, cbk) {
                            discussion_participants_count = discussion_obj.users ? discussion_obj.users.length : 0;
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
                        results.objects=results.objects.sort(likelihood) ;
                        callback(err, results);
                    })
                }
            }

        });
    },

    create_obj:function (req, fields, callback) {
        var user_id = req.user.id;
        var self = this;
        var suggestion_object = new self.model();
        var isNewFollower = false;
        var user = req.user;
        var discussion_id = fields.discussion_id;
        var discussion_creator_id;
        var num_of_words;
        var disc_obj;

        var iterator = function (unique_user, itr_cbk) {
            user_id = user_id || user_id.id;

            if (unique_user  == user_id || !unique_user || unique_user === "undefined"){
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
                if (err){
                    var to = 'aharon@uru.org.il';
                    var subject = "הועלתה הצעה לשינוי לטקסט שכבר סומן בדיון";
                    /*var body = "<a href='" + req.app.settings.root_path  +  "'/discussions/" + discussion_id + "#post_" + sug + "'>"
                        + "existing suggestion with same indexes"
                        + "</a>"
                        + "<br>"
                        + "<a href='" + req.app.settings.root_path  +  "'/discussions/" + discussion_id + "#post_" + suggestion_object.id + "'>"
                        + "new suggestion"
                        + "</a>";*/

                    var body = "<a href='uru.org.il/discussions/" + discussion_id + "#post_" + sug + "'>"
                        + "existing suggestion with same indexes"
                        + "</a>"
                        + "<br>"
                        + "<a href='uru.org.il/discussions/" + discussion_id + "#post_" + suggestion_object.id + "'>"
                        + "new suggestion"
                        + "</a>";

                    mail.sendMail(to, body, subject, function(err){
                        if(err) {console.error(err)};
                    })

                    console.error("a suggestion with this indexes already exist");
                }

                models.Discussion.findById(fields.discussion_id, cbk);
            },

            function (discussion_obj, cbk) {

                disc_obj = discussion_obj;

                // check if vision was changed while user suggested new text
                if (Number(req.body.vision_history_count) < ((disc_obj.vision_text_history && disc_obj.vision_text_history.length) || 0)){
                    cbk({message: "discussion's vision was updated", code: "401"});
                    return;
                }
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

                        if (Number(suggestion_obj.wanted_amount_of_tokens) > ((disc_obj.users && disc_obj.users.length) || 0))
                            suggestion_obj.wanted_amount_of_tokens = ((disc_obj.users && disc_obj.users.length - 1) || 0);
                    }
                    cbk(err, data);
                });
            },

            function(suggestion_obj, cbk){
                // find all users that has this discussion in their discussion list (for notifications)
                models.User.find({'discussions.discussion_id': discussion_id}, function(err, users){
                    cbk(err, suggestion_obj, users);
                });
            },

            function (suggestion_obj, users, cbk) {
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
                        // first return the cbk
                        cbk2();

                        var unique_users = [];
                        discussion_creator_id = disc_obj.creator_id;

                        // be sure that there are no duplicated users in discussion.users
                        _.each(disc_obj.users, function(user){ unique_users.push(user.id || user.user_id + "")});
                        _.each(users, function(user){ unique_users.push(user.id)});
                        unique_users = _.uniq(unique_users);

                        async.forEach(unique_users, iterator, function(err){
                            if(err){
                                console.error(err);
                                err.trace();
                            }
                        });
                    },

                    //set notifications for users that i represent (proxy)
                    function (cbk2) {
                        // first return the cbk
                        cbk2();

                        models.User.find({"proxy.user_id":user_id}, function (err, slaves_users) {
                            async.forEach(slaves_users, function (slave, itr_cbk) {
                                notifications.create_user_notification("proxy_created_change_suggestion", suggestion_obj._id, slave._id, user_id, discussion_id, '/discussions/' + discussion_id, function (err, result) {
                                    itr_cbk(err);
                                })
                            }, function (err) {
                                if(err){
                                    console.error(err);
                                    err.trace();
                                }
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
                if(err.message === "discussion's vision was updated"){
                    err = null;
                    result = {cancel: true, text_field: disc_obj.text_field, discussion_vision_text_history: disc_obj.vision_text_history};
                }else{
                    console.error(err);
                    console.trace();
                }
            }else{
                //set is_my_suggestion flag
                result.is_my_suggestion = true;
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
    },

    delete_obj: function(req,object,callback){
        if (object.creator_id && (req.user.id === object.creator_id.id)){

            async.waterfall([
                //  delete suggestion's posts
                function(cbk){
                    models.PostSuggestion.remove({suggestion_id: object.id},function(err){
                        cbk(err);
                    })
                },

                // delete suggestion
                function(cbk){
                    object.remove(function(err){
                        callback(err);
                    })
                }
            ], function(err){
                callback(err);
            })

        }else{
            callback({err: 401, message :"user can't delete others posts"});
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
                cbk({message:"this suggestion is already published", code:401}, null);
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
                    models.DiscussionHistory.find({discussion_id: discussion_object._id})
                        .sort({'date':'descending'})
                        .limit(1)
                        .exec(function (err, histories) {
                            if (histories.length) {
                                histories[0].replaced_part = suggestion_object.parts[0];
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

                    suggestion_object.context_before =  vision.substring(0, suggestion_object.parts[0].start);
                    suggestion_object.context_after = vision.substring(suggestion_object.parts[0].end, vision.length);

                    //this is to fix null text in vision when the suggestion is to delete text - (261 Bug הצעה ריקה לשינוי עולה בתור null)
                    if (parts[0].text == null)
                        parts[0].text = "";
                    vision = vision.replace(/\r/g, '');


                    var str = vision.substring(0, Number(parts[0].start)) + parts[0].text + vision.substring(Number(parts[0].end));
                    var replaced_text = vision.substring(Number(parts[0].start), Number(parts[0].end));
                    var new_text = parts[0].text;

                    if (!discussion_object.vision_text_history) discussion_object.vision_text_history = [];
                    if (!discussion_object.replaced_text_history) discussion_object.replaced_text_history = [];
                    discussion_object.vision_text_history.push(discussion_object.text_field);
                    discussion_object.replaced_text_history.push({old_text: replaced_text, new_text: new_text});
                    discussion_object.text_field = str;

                    //suggestion grade is the new discussion grade
                    discussion_object.grade = suggestion_grade;
//                    models.Discussion.update({_id:discussion_object._id},
//                        {
//                            $set:{text_field: str, grade: suggestion_grade},
//                            $addToSet: {vision_text_history: discussion_object.vision_text}
//                        },
//
//                        function(err, counter){
//                            cbk1(err, discussion_object);
//                        });

                    discussion_object.save(function(err, disc){
                        cbk1(err, disc);
                    });
                },

                function(cbk1){
                    cbk1();
                }
            ], function (err, args) {
                cbk(err, args[1]);
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

                    discussion_history.save(function(err, history_obj){
                        if(err){
                            cbk1(err);
                        }else{
                            suggestion_object.is_approved = true;
                            suggestion_object.approve_date = Date.now();
                            suggestion_object.replaced_text = disc_obj.replaced_text_history[disc_obj.replaced_text_history.length -1].old_text;
                            suggestion_object.history_version_id = history_obj.id;
                            suggestion_object.save(cbk1);
                        }
                    });
                },

                function (cbk1) {
                    models.Suggestion.find({discussion_id:disc_obj, is_approved:false, _id: {$ne: id}}, cbk1);
                }

            ], function (err, args) {

                //update indexes of all other suggestions
                // find ovelaps in indexes and send mail
                var suggestions = args[1];
                var index_balance = suggestion_object.parts[0].text.length - (suggestion_object.parts[0].end - suggestion_object.parts[0].start);

                console.log("index_balance");
                console.log(index_balance);
                    async.forEach(suggestions, function (suggestion, itr_cbk) {
                        var save_suggestion = false;
                        console.log("suugstion_id:");
                        console.log(suggestion._id);
                        if (index_balance != 0) {
                            // update indexes
                            if (suggestion.parts[0].start > suggestion_object.parts[0].end) {
                                console.log("start");

                                suggestion.parts[0].start += index_balance;
                                suggestion.parts[0].end += index_balance;
                                console.log(suggestion.parts[0].start);
                                console.log("end");
                                console.log(suggestion.parts[0].end);
                                save_suggestion = true;
                            }
                        }

                        // check for overlaps
                        var range_1 = {};
                        var range_2 = {};
                        range_1.start = suggestion_object.parts[0].start;
                        range_1.end = suggestion_object.parts[0].end;
                        range_2.start = suggestion.parts[0].start;
                        range_2.end = suggestion.parts[0].end;
                        if (isOverlap(range_1, range_2)){
                            suggestion.is_hidden = true;
                            suggestion.under_moderation = true;
                            save_suggestion = true;
                            sendUserOverlapMail(disc_obj, suggestion, suggestion_object);
                        }

                        if (save_suggestion) {
                            suggestion.save(function (err, result) {
                                itr_cbk(err, result)
                            })
                        }else{
                            itr_cbk();
                        }
                    }, cbk(err, args[1][0]));
//                else
//                    cbk(err, args[1][0]);
            })
        },

        function (sug_obj, cbk) {

            // dont understan why is this
//            suggestion_creator = sug_obj.creator_id;
            //changed to :
            suggestion_creator = suggestion_object.creator_id;
            async.parallel([
                //set gamification
                function (par_cbk) {
                    models.User.update({_id:suggestion_creator}, {$inc:{"gamification.approved_suggestion":1}}, function (err, obj) {
                        par_cbk(err, obj);
                    });
                },

                //set notifications for creator
                function (par_cbk) {
                    notifications.create_user_notification("approved_change_suggestion_you_created",
                        id, suggestion_creator, null, discussion_id, '/discussions/' + discussion_id, function (err, obj) {
                            par_cbk(err, obj);
                        });
                },
                //for each suggestion grade - copy it to discussion grade
                function (par_cbk) {

                    async.waterfall([
                        function (wtr_cbk) {
                            models.GradeSuggestion.find({suggestion_id: id}, wtr_cbk);
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

                            async.forEach(unique_users, noti_itr, function(err){
                                if(err) console.error(err);
                            });
                        }
                    })
                }
            ], function (err, args) {
                cbk(err, 8);
            })
        }
    ], function (err, arg) {
        callback(err, arg, suggestion_object);
    });
}


var calculate_sugg_threshold = function (factor, discussion_threshold) {
    var log_base_75_of_x =
        Math.log(factor) / Math.log(75);
    var result = Math.pow(log_base_75_of_x, common.getThresholdCalcVariables("SCALE_PARAM")) * discussion_threshold;

    return Math.round(result);

}

function likelihood(a,b) {

    var a_lh = (a.wanted_amount_of_tokens || a.threshold_for_accepting_the_suggestion)- a.agrees + a.not_agrees;
    var b_lh = (b.wanted_amount_of_tokens || b.threshold_for_accepting_the_suggestion)- b.agrees + b.not_agrees;

    return a_lh-b_lh;
}

function isOverlap(range_1, range_2){
      var is_overlaping =
        ((range_1.start >= range_2.start && range_1.start <= range_2.end)
        || (range_1.end >= range_2.start && range_1.end <= range_2.end)
        || (range_2.start >= range_1.start && range_2.start <= range_1.end)
        || (range_2.end >= range_1.start && range_2.end <= range_1.end));

    return is_overlaping
}

function sendUserOverlapMail(discussion, suggestion, approved_suggestion){
    var s = suggestion;
    s.discussion_name = discussion.title;
    // the original text that was suggested to rplace
    s.original_text = discussion.vision_text_history[discussion.vision_text_history.length - 1].substring(s.parts[0].start, s.parts[0].end);
    // text that was approved now
    s.accepted_text = approved_suggestion.parts[0].text;
    // what user suggested
    s.user_suggestion = s.parts[0].text;
    s.main_link = "/discussions/" + discussion.id;
   async.waterfall([
        function(cbk){
            templates.renderTemplate("suggestion_overlap", s, function(err, result){
                cbk(err, result);
            });
        },

       function (message, cbk){
           models.User.findById(suggestion.creator_id, function(err, user){
               cbk(err, user, message);
           });
       },

       function(user, message, cbk){
           mail.sendMailFromTemplate(/*user.email*/"movilim@uru.org.il", message, cbk);
       }
   ], function(err){
       if (err) console.error(err);
   })
}
