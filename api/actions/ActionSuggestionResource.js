
var common = require('../common.js'),
    util  = require('util'),
    jest = require('jest'),
    models = require('../../models'),
    async = require('async'),
    GradeSuggestionResource = require('./../GradeSuggestionResource'),
    notifications = require('./../notifications');

ActionSuggestionResource = module.exports = common.GamificationMongooseResource.extend({

    init:function () {
        this._super(models.ActionSuggestion, 'action_suggestion', 0);
        this.allowed_methods = ['get', 'post'];
        this.authentication = new common.SessionAuthentication();
        this.filtering = {action_id:null, is_approved:null};
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
            curr_amount_of_tokens:null
        };
    },

    get_objects:function (req, filters, sorts, limit, offset, callback) {

        var self = this;
        var action_id = req.query.action_id;
        var action_threshold;

        var iterator = function (suggestion, itr_cbk) {

            //set counter og graders manually
            suggestion.manual_counter = Math.round(suggestion.agrees) + Math.round(suggestion.not_agrees);

            var curr_grade_obj = {};

            suggestion.curr_amount_of_tokens = suggestion.agrees - suggestion.not_agrees;

            //wanted amount of tokens is either what admin has entered to the specific suggestion, or the discussion threshold...
            if (suggestion.admin_threshold_for_accepting_the_suggestion > 0)
                suggestion.wanted_amount_of_tokens = suggestion.admin_threshold_for_accepting_the_suggestion;
            else
                suggestion.wanted_amount_of_tokens = Number(suggestion.threshold_for_accepting_the_suggestion) || GradeSuggestionResource.calculate_sugg_threshold(suggestion.getCharCount(), action_threshold);
            if (req.user) {
                models.GradeActionSuggestion.findOne({user_id:req.user._id, suggestion_id:suggestion._id}, {"_id":1, "evaluation_grade":1, "does_support_the_suggestion":1}, function (err, grade_sugg_obj) {
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
//                        if (!err) {
//                            models.Action.findById(action_id, function (err, action) {
//                                if (!err)
//                                    if (req.user._id + "" == action.creator_id + "") {
////                                        suggestion.grade_obj = {};
////                                        suggestion.grade_obj["evaluation_grade"] = discussion.grade;
//                                    }
//                                itr_cbk(err, suggestion);
//                            })
//                        } else {
                            itr_cbk(err, suggestion);
//                        }
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
            if (!action_id)
                callback(err, results);
            else
            //for each object add grade_obj that reflects the user's grade for the suggestion,
            //if the user is the disvcussion creator - grade_obj contains the discussion evaluate grade
            //if the user is ofline grade_obj is {}

                async.waterfall([
                    function (cbk) {
                        models.Action.findById(action_id, cbk);
                    },

                    function (action_obj, cbk) {
                        action_threshold = action_obj.threshold_for_accepting_change_suggestions;
                        if (action_obj.admin_threshold_for_accepting_change_suggestions > 0)
                            action_threshold = action_obj.admin_threshold_for_accepting_change_suggestions;

                        async.forEach(results.objects, iterator, function (err, objs) {
                            cbk(err, results);
                        });
                    }
                ], function (err, results) {
                    callback(err, results);
                })
        });
    },

    create_obj:  function(req, fields, callback){
        var self = this;
        var user = req.user;
        var user_id = user.id;
        var suggestion_object = new self.model();
        var action_creator_id;

        fields.creator_id = user_id;
        fields.first_name = user.first_name;
        fields.last_name = user.last_name;


        var iterator = function (user_schema, itr_cbk) {
            if (user_schema.user_id == user_id.id || !user_schema.user_id)
                itr_cbk(null, 0);
            else {
                var action_id = suggestion_object.action_id;
                models.Action.findById(action_id, {'_id': 1, 'going_users': 1, 'cycle_id': 1}, function(err, action){
                    var notified_users = _.map(action.going_users, function(user){return user.user_id + ''});
                    async.forEach(notified_users, function(notified_user, itr_cbk){
                        if(notified_user != user_id){
                            notifications.create_user_notification("response_added_to_action_you_joined", action_id,
                                notified_user, null , action.cycle_id[0].cycle, '/actions/' + action_id, function(err){
                                    itr_cbk(err);
                                });
                        } else {
                            itr_cbk();
                        }
                    })
                }, itr_cbk(null, 0));
            }
        }

        for (var field in fields) {
            suggestion_object.set(field, fields[field]);
        }

        async.waterfall([
            //first, check if there is a suggestion with the same indexes
            function (cbk) {
                models.ActionSuggestion.find({action_id:fields.action_id, is_approved:false}, cbk);
            },

            function (suggestions, cbk) {
                var err;
                var sug;
                var action_thresh;

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
                    models.Action.findById(fields.action_id, cbk);
            },

            function (action_obj, cbk) {

                var word_count = suggestion_object.getCharCount();
                suggestion_object.threshold_for_accepting_the_suggestion = GradeSuggestionResource.calculate_sugg_threshold(word_count,
                    Number(action_obj.admin_threshold_for_accepting_change_suggestions) || Number(action_obj.threshold_for_accepting_change_suggestions));
                self.authorization.edit_object(req, suggestion_object, cbk);
            },

            function (suggestion_obj, cbk) {
                suggestion_object.save(function (err, data) {
//                    if (data) {
//                        action_id = data.action_id;
//                        data.creator_id.id = user.id;
//                        data.creator_id.first_name = user.first_name;
//                        data.creator_id.last_name = user.last_name;
//                        data.creator_id.avatar_url = user.avatar_url();
//                        data.creator_id.score = user.score;
//                        data.creator_id.num_of_given_mandates = user.num_of_given_mandates;
//                        data.creator_id.num_of_proxies_i_represent = user.num_of_proxies_i_represent;
//                        suggestion_obj.wanted_amount_of_tokens = suggestion_obj.threshold_for_accepting_the_suggestion;
//                    }
                    cbk(err, data);
                });
            },

            function (suggestion_obj, cbk) {
                async.parallel([
                    //add notification for the dicussion's participants or creator
                    //add user to praticipants

                    function (cbk2) {
                        models.Action.findById(suggestion_object.action_id, /*["users", "creator_id"],*/ function (err, action_obj) {
                            if (err)
                                cbk2(err, null);
                            else {
                                if (!_.any(action_obj.users, function (user) {
                                    return user.user_id + "" == req.user.id
                                })) {
                                    var new_user = {user_id:req.user._id, join_date:Date.now()};
                                    models.Action.update({_id:action_obj._id}, {$addToSet:{users:new_user}}, function (err, num) {
                                        action_creator_id = action_obj.creator_id;
                                        async.forEach(action_obj.users, iterator, cbk2);
                                    });
                                } else {
                                    action_creator_id = action_obj.creator_id;
                                    async.forEach(action_obj.users, iterator, cbk2);
                                }
                            }
                        })
                    },

                    // update actions done by user
                    function(cbk1){
                        models.User.update({_id:user._id},{$set: {"actions_done_by_user.suggestion_on_object": true}}, function(err){
                            cbk1(err);
                        });
                    },

                    //set notifications for users that i represent (proxy)
                    function (cbk2) {
                        //TODO - set notifications
//                        models.User.find({"proxy.user_id":user_id}, function (err, slaves_users) {
//                            async.forEach(slaves_users, function (slave, itr_cbk) {
//                                notifications.create_user_notification("proxy_created_change_suggestion", suggestion_obj._id, slave._id, user_id, discussion_id, function (err, result) {
//                                    itr_cbk(err);
//                                })
//                            }, function (err) {
//                                cbk2(err);
//                            })
//                        })
                        cbk2();
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
    }
});

//TODO - approve actionSuggestion
module.exports.approveSuggestion = function (id, callback) {
    callback("not implemnted yet!");
};

