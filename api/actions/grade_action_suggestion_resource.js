var resources = require('jest'),
    util = require('util'),
    models = require('../../models'),
    async = require('async'),
    common = require('./../common'),
    _ = require('underscore'),
    Suggestion = require('./ActionSuggestionResource');
    GradeSuggestionResource = require('./../GradeSuggestionResource');
    notifications = require('./../notifications');

//Authorization
var Authoriztion = function () {
};
util.inherits(Authoriztion, resources.Authorization);

Authoriztion.prototype.edit_object = function (req, object, callback) {

    if (req.method == 'POST') {
        models.GradeActionSuggestion.findOne({suggestion_id:object.suggestion_id + "", user_id:req.user._id}, function (err, obj) {
            if (err) {
                callback(err, null);
            } else {
                if (obj) {
                    callback({message:"user already grade this action", code:401}, null);
                } else {
                    object.user_id = req.user._id;
                    callback(null, object);
                }
            }
        })
    } else {
        if (req.method == 'PUT') {
            if (!(object.user_id + "" == req.user._id + ""))
                callback({message:"its not your garde!", code:401}, null);
            else
                callback(null, object);
        } else {
            callback(null, object);
        }
    }
};

var GradeActionSuggestionResource = module.exports = common.GamificationMongooseResource.extend({
    init:function () {
        this._super(models.GradeActionSuggestion, 'grade_suggestion', null);
//        GradeResource.super_.call(this,models.Grade);
        this.allowed_methods = ['get', 'put', 'post'];
        this.authorization = new Authoriztion();
        this.authentication = new common.SessionAuthentication();
        this.filtering = {action_id:{
            exact:null,
            in:null
        },
            suggestion_id:null
        };
//        this.fields = {
//            _id:null,
//
//            //just for debuging!!!
//            user_id:null,
//            suggestion_id:null,
//            evaluation_grade:null,
//            creation_date:null,
//            does_support_the_suggestion:null,
//            new_grade:null,
//            evaluate_counter:null,
//            agrees:null,
//            not_agrees:null,
//            grade_id:null,
//            curr_amount_of_tokens:null
//        }
    },

    create_obj:function (req, fields, callback) {
        var self = this;
        var base = this._super;
        var new_grade = null;
        var counter = 0;
        var g_suggestion_obj;
        var is_agree;
        var action_evaluation_grade;
        var agrees;
        var not_agrees;
        //this is agrees - not_agrees, for now...
        var curr_tokens_amout;
        var action_id = fields.action_id;
        var real_threshold;
        var grade_id;
        var proxy_power = req.user.num_of_given_mandates ? 1 + req.user.num_of_given_mandates * 1 / 9 : 1;
        var action_obj;

        async.waterfall([


            //find action
            function(cbk){
                models.Action.findById(action_id, cbk);
            },

            //user can grade suggestion only if he grade the action
            function (action, cbk) {
                action_obj = action;
                models.GradeAction.findOne({user_id:req.user._id, action_id:fields.action_id}, cbk);
            },

            function (grade_action, cbk) {
                //check if user has graded the action first
                //if not - check if the creator of the action is the user that is trying to grade
                // (if so - instead of the user action_grade we take the evaluated action.grade)
                if (!grade_action) {

                        //if the creator of the discussion grade the suggestion without grdein the discussion - its ok
                        // otherwise unauthorise
                        if (req.user._id + "" != action_obj.creator_id + "")
                            cbk({code:401, message:"must grade action first"}, null);
                        else {
                            action_evaluation_grade = action_obj.grade;
                            is_agree = fields.evaluation_grade >= action_evaluation_grade;

                            //check if suggestion is approved (al haderech)

                            //i think there is no need for that, threshold is in suggestion
//                                real_threshold = Number(obj.admin_threshold_for_accepting_change_suggestions) || obj.threshold_for_accepting_change_suggestions;

                            fields.does_support_the_suggestion = is_agree;
                            fields.proxy_power = proxy_power;
                            base.call(self, req, fields, cbk);
                        }
                }
                else {
                    action_evaluation_grade = grade_action.evaluation_grade;
                    is_agree = fields.evaluation_grade >= action_evaluation_grade;
                    fields.does_support_the_suggestion = is_agree;
                    fields.proxy_power = proxy_power;
                    base.call(self, req, fields, cbk);
                }
            },

            function (grade_suggestion_obj, cbk) {
                grade_id = grade_suggestion_obj._id;

                //update grade suggstoin "does_support_the_suggestion"
                //find suggestion

                models.ActionSuggestion.findById(grade_suggestion_obj.suggestion_id, function (err, sugg) {
                    cbk(err, sugg)
                });
            },

            function (suggestion_obj, cbk) {
                agrees = suggestion_obj.agrees + (Number(is_agree) * proxy_power);
                not_agrees = suggestion_obj.not_agrees + (Number(!is_agree) * proxy_power);

                curr_tokens_amout = Math.round(agrees) - Math.round(not_agrees);

                async.parallel([
                    function (cbk1) {
                        calculateActionSuggestionGrade(suggestion_obj._id, suggestion_obj.action_id, is_agree, null, null, proxy_power, null, function (err, _new_grade, _evaluate_counter) {
                            if (!err) {
                                new_grade = _new_grade;
                                counter = _evaluate_counter;
                            }
                            cbk1(err)
                        });
                    },

                    function (cbk1) {
                        //if there is an admin threshokd specified for the suggestion - it wins

                        real_threshold = Number(suggestion_obj.admin_threshold_for_accepting_the_suggestion) || suggestion_obj.threshold_for_accepting_the_suggestion;

                        if (curr_tokens_amout >= real_threshold) {
                            Suggestion.approveSuggestion(suggestion_obj._id, function (err, obj1) {
                                cbk1(err, obj1);
                            })
                        } else {
                            cbk1();
                        }
                    },
                    //set notification for suggestion creator ("user agree/disagree your suggestion")
                    function (cbk1) {
                        var method;
                        if (is_agree)
                            method = "add";
                        else
                            method = "remove";
                        //TODO - set notifications
//                        notifications.create_user_vote_or_grade_notification("user_gave_my_suggestion_tokens",
//                            suggestion_obj._id, suggestion_obj.creator_id, req.user._id, action_id, method, false, true,function (err, result) {
//                                cbk1(err, result);
//                            })
                        cbk1();
                    },

                    //set notifications for all users of proxy
                    function(cbk1){
                        //TODO - set notifications

//                        models.User.find({"proxy.user_id": req.user._id}, function(err, slaves_users){
//                            async.forEach(slaves_users, function(slave, itr_cbk){
//                                notifications.create_user_proxy_vote_or_grade_notification("proxy_graded_change_suggestion", suggestion_obj._id, slave._id, req.user._id, action_id, is_agree, null, function(err){
//                                    itr_cbk(err);
//                                })
//                            }, function(err){
//                                cbk1(err);
//                            })
//                        })
                        cbk1();
                    },

                    //add user to be part of the action
                    function(cbk1){
                        if (! _.any(action_obj.users, function(user){ return user.user_id + "" == req.user.id})){
                            var new_user = {user_id: req.user._id, join_date: Date.now()};
                            models.Action.update({_id: action_obj._id}, {$addToSet:{users: new_user}}, function(err, num){cbk1(err, num)});
                        }else{
                            cbk1(null, null);
                        }
                    }
                ], function (err, args) {
                    cbk(err, args);
                })
            }

        ], function (err, obj) {
            if (!err) {
                req.gamification_type = "grade_action_suggestion";
                req.token_price = common.getGamificationTokenPrice('grade_action_suggestion') > -1 ? common.getGamificationTokenPrice('grade_action_suggestion') : 0;
            }
            callback(err, {
                grade_id:grade_id,
                new_grade:new_grade,
                evaluate_counter:counter,
                agrees: agrees,
                not_agrees:not_agrees,
                curr_amount_of_tokens:curr_tokens_amout
            });
        })
    },

    update_obj:function (req, object, callback) {
        var self = this;
        var base = this._super;
        var action_id = req.body.action_id;
        var is_agree;
        var action_evaluation_grade;
        var did_user_change_his_agree;
        var new_grade, evaluate_counter;
        var grade_id = object._id;
        var agrees;
        var not_agrees;
        var curr_tokens_amout;
        var real_threshold;
        var g_sugg_obj;
        var proxy_power = req.user.num_of_given_mandates ? 1 + req.user.num_of_given_mandates * 1 / 9 : 1;
        var previous_proxy_power = object.proxy_power || proxy_power;

        async.waterfall([

            //find the limit of between agree and not agree
            function (cbk) {
                models.Action.findById(action_id, cbk);
            },

            function (action_obj, cbk) {
                real_threshold = Number(action_obj.admin_threshold_for_accepting_change_suggestions) || action_obj.threshold_for_accepting_change_suggestions;

                if (action_obj.creator_id + "" == req.user._id + "") {
                    action_evaluation_grade = action_obj.grade;
                    is_agree = object.evaluation_grade >= action_evaluation_grade;
                    models.ActionSuggestion.findById(object.suggestion_id, cbk);
                }
                else
                    models.GradeAction.findOne({action_id:action_id, user_id:req.user._id || object.user_id}, function (err, grade_action) {
                        if (!err && grade_action) {
                            action_evaluation_grade = grade_action.evaluation_grade;
                            is_agree = object.evaluation_grade >= action_evaluation_grade;
                            models.ActionSuggestion.findById(object.suggestion_id, cbk);
                        }else{
                            cbk({message: "please grade the action", code: 401});
                        }
                    });
            },

            function (sugg_obj, cbk) {
                var method;
                g_sugg_obj = sugg_obj;



                agrees = sugg_obj.agrees;
                not_agrees = sugg_obj.not_agrees;

                curr_tokens_amout = Math.round(agrees) - Math.round(not_agrees);

                did_user_change_his_agree = object.does_support_the_suggestion != is_agree;
                object.does_support_the_suggestion = is_agree;
                if (did_user_change_his_agree) {
                    if (is_agree)
                        method = "add";
                    else
                        method = "remove"
                }
                async.parallel([

                    function (cbk1) {
                        //TODO - set notifications
//                        if(did_user_change_his_agree){
//                            if(sugg_obj.creator_id){
//                                notifications.create_user_vote_or_grade_notification("user_gave_my_suggestion_tokens",
//                                    sugg_obj._id, sugg_obj.creator_id, req.user._id, action_id, method, did_user_change_his_agree, true,function (err, result) {
//                                        cbk1(err, result);
//                                    })
//                            }else{
//                                console.log('this suggestion - id number ' +  sugg_obj.creator_id + 'doesnt have creator id!!!')
//                                cbk1(null, 0);
//                            }
//
//                        }else{
//                            cbk1(null, 0);
//                        }
                        cbk1();
                    },

                    function (cbk1) {
                        object.proxy_power = proxy_power;

                        if(object.agrees < 0){
                            object.agrees = 0;
                            console.log("error - suggestion agrees < 0");
                        }

                        if(object.not_agrees < 0){
                            object.not_agrees = 0;
                            console.log("error - suggestion agrees < 0");
                        }

                        base.call(self, req, object, cbk1);
                    },

                    //set notifications for all users of proxy
                    function(cbk1){
                        //TODO - set notifications

//                        if (did_user_change_his_agree) {
//                            models.User.find({"proxy.user_id": req.user._id}, function(err, slaves_users){
//                                async.forEach(slaves_users, function(slave, itr_cbk){
//                                    notifications.create_user_proxy_vote_or_grade_notification("proxy_graded_change_suggestion",  sugg_obj._id, slave._id, req.user._id, action_id, is_agree, null, function(err){
//                                        itr_cbk(err);
//                                    })
//                                }, function(err){
//                                    cbk1(err);
//                                })
//                            })
//                        }else{
//                            cbk1(null, null);
//                        }
                        cbk1();
                    }
                ], function (err, args) {
                    cbk(err, args[1]);
                })
            },

            function (grade_sugg_object, cbk) {
//                g_grade = grade_sugg_object;

                calculateActionSuggestionGrade(object.suggestion_id, action_id, is_agree, did_user_change_his_agree, null, proxy_power, previous_proxy_power, function (err, _new_grade, _evaluate_counter) {
                    if (!err) {
                        new_grade = _new_grade;
                        evaluate_counter = _evaluate_counter;

                        if (did_user_change_his_agree) {
                            if (is_agree) {
                                agrees = g_sugg_obj.agrees + (1 * proxy_power);
                                not_agrees = g_sugg_obj.not_agrees - (1 * previous_proxy_power);
                                curr_tokens_amout = Math.round(agrees) - Math.round(not_agrees);

                            }
                            else {
                                agrees = g_sugg_obj.agrees - (1 * previous_proxy_power);
                                not_agrees = g_sugg_obj.not_agrees + (1 * proxy_power);
                                curr_tokens_amout = Math.round(agrees) - Math.round(not_agrees);
                            }

                            //if there is an admin threshokd specified for the suggestion - it wins

                            real_threshold = Number(g_sugg_obj.admin_threshold_for_accepting_the_suggestion) || g_sugg_obj.threshold_for_accepting_the_suggestion;

                            if (curr_tokens_amout >= real_threshold) {
                                Suggestion.approveSuggestion(g_sugg_obj._id, function (err, obj1) {
                                    cbk(err, obj1);
                                })
                            } else {
                                cbk();
                            }
                        }
                        else {
                            cbk(null, 0);
                        }
                    } else
                        cbk(err, 0);
                });
            }
        ], function (err) {


            callback(err, {

                    grade_id:grade_id,
                    new_grade:new_grade,
                    evaluate_counter:evaluate_counter,
                    agrees:agrees,
                    not_agrees:not_agrees,
                    curr_amount_of_tokens:curr_tokens_amout
                }
            )
        })
    }
})

var calculateActionSuggestionGrade = GradeActionSuggestionResource.calculateActionSuggestionGrade =
    function (suggestion_id, action_id, is_agree_to_suggestion, did_change_agreement_with_suggestion, action_thresh, proxy_power, previous_proxy_power, callback) {

        // suggestios_grade_counter + discussion_grade_counter = all graders
        var suggestios_grade_counter;
        var action_grade_counter;

        var suggestios_grade_sum = 0;
        var action_grade_sum = 0;

        var total_counter;
        var total_sum;
        var new_grade;

        async.waterfall([

            //get all grades for the suggestion,
            function (cbk) {
                models.GradeActionSuggestion.find({suggestion_id:suggestion_id}, {"user_id":1, "evaluation_grade":1, "proxy_power":1}, function (err, sug_grades) {
                    cbk(err, sug_grades);
                });
            },

            function (sugg_grades, cbk) {
                var users = [];
                suggestios_grade_counter = sugg_grades.length;

                if (suggestios_grade_counter) {
                    //calcaulte grades sum with the proxy power
                    suggestios_grade_sum = _.reduce(sugg_grades, function (memo, grade) {
                        return memo + Number(grade.evaluation_grade) * (grade.proxy_power || 1)
                    }, 0);
                    //calcaulte counter sum with the proxy power
                    suggestios_grade_counter = _.reduce(sugg_grades, function (memo, grade) {
                        return memo + (grade.proxy_power || 1);
                    }, 0);
                }
                _.each(sugg_grades, function (grade) {
                    users.push(grade.user_id)
                });

                //get all action grades that their creators didnot grade the suggestion
                models.GradeAction.find({ action_id:action_id, user_id:{ $nin:users }}, function (err, grades) {
                    cbk(err, grades);
                });
            },

            function (actoin_grades, cbk) {
                action_grade_counter = actoin_grades.length;

                if (action_grade_counter) {
                    //calcaulte grades sum with the proxy power
                    action_grade_sum = _.reduce(actoin_grades, function (memo, grade) {
                        return memo + Number(grade.evaluation_grade) * (grade.proxy_power || 1)
                    }, 0);
                    //calcaulte counter sum with the proxy power
                    action_grade_counter = _.reduce(actoin_grades, function (memo, grade) {
                        return memo + (grade.proxy_power || 1)
                    }, 0);
                }
                total_counter = suggestios_grade_counter + action_grade_counter;

                total_sum = suggestios_grade_sum + action_grade_sum;

                new_grade = total_sum / total_counter;

                if (is_agree_to_suggestion != null && did_change_agreement_with_suggestion == null) {
                    if (is_agree_to_suggestion) {
                        models.ActionSuggestion.update({_id:suggestion_id}, {$set:{grade:new_grade, evaluate_counter:suggestios_grade_counter}, $inc:{agrees:proxy_power}}, function (err, args) {
                            cbk(err, args);
                        });
                    } else {
                        models.ActionSuggestion.update({_id:suggestion_id}, {$set:{grade:new_grade, evaluate_counter:suggestios_grade_counter}, $inc:{not_agrees:proxy_power}}, function (err, args) {
                            cbk(err, args);
                        });
                    }
                } else {
                    if (did_change_agreement_with_suggestion && is_agree_to_suggestion)
                        models.ActionSuggestion.update({_id:suggestion_id}, {$set:{grade:new_grade, evaluate_counter:suggestios_grade_counter}, $inc:{not_agrees:(previous_proxy_power * -1), agrees:proxy_power}}, function (err, args) {
                            cbk(err, args);
                        });
                    else
                    if (did_change_agreement_with_suggestion && !is_agree_to_suggestion)
                        models.ActionSuggestion.update({_id:suggestion_id}, {$set:{grade:new_grade, evaluate_counter:suggestios_grade_counter}, $inc:{not_agrees:proxy_power, agrees:(previous_proxy_power * -1)}}, function (err, args) {
                            cbk(err, args);
                        });
                    else
                        models.ActionSuggestion.update({_id:suggestion_id}, {$set:{grade:new_grade, evaluate_counter:suggestios_grade_counter}}, function (err, args) {
                            cbk(err, args);
                        });
                }
            }
        ], function (err, disc_grades) {

            if(err)
                callback(err);
            else {
                async.waterfall([

                    function (cbk) {
                        if (action_thresh) {
                            //set suggestion threshold
                            async.waterfall([
                                function (cbk1) {
                                    models.ActionSuggestion.findById(suggestion_id, cbk1);
                                },

                                function (sugg_obj, cbk1) {
                                    var num_of_words_to_calc_sugg_threshold;
                                    num_of_words_to_calc_sugg_threshold = sugg_obj.getCharCount();
                                    var sugg_thresh = GradeSuggestionResource.calculate_sugg_threshold(num_of_words_to_calc_sugg_threshold, action_thresh);

                                    models.ActionSuggestion.update({_id:suggestion_id}, {$set:{threshold_for_accepting_the_suggestion:sugg_thresh}}, cbk1);
                                }
                            ], function (err, obj) {
                                cbk(err, obj);
                            })
                        } else {
                            cbk(null, null);
                        }
                    }
                ], function (err, obj) {
                    callback(err, new_grade, suggestios_grade_counter);
                })
            }
        })
    };
