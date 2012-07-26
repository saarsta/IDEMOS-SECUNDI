var resources = require('jest'),
    util = require('util'),
    models = require('../models'),
    async = require('async'),
    common = require('./common'),
    _ = require('underscore'),
    Suggestion = require('./suggestionResource');
notifications = require('./notifications');

//Authorization
var Authoriztion = function () {
};
util.inherits(Authoriztion, resources.Authorization);

Authoriztion.prototype.edit_object = function (req, object, callback) {

    if (req.method == 'POST') {
        models.GradeSuggestion.findOne({suggestion_id:object.suggestion_id + "", user_id:req.user._id}, function (err, obj) {
            if (err) {
                callback(err, null);
            } else {
                if (obj) {
                    callback({message:"user already grade this discussion", code:401}, null);
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

var GradeSuggestionResource = module.exports = common.GamificationMongooseResource.extend({
    init:function () {
        this._super(models.GradeSuggestion, 'grade_suggestion', null);
//        GradeResource.super_.call(this,models.Grade);
        this.allowed_methods = ['get', 'put', 'post'];
        this.authorization = new Authoriztion();
        this.authentication = new common.SessionAuthentication();
        this.filtering = {discussion_id:{
            exact:null,
            in:null
        },
            suggestion_id:null
        };
        this.fields = {
            _id:null,

            //just for debuging!!!
            user_id:null,
            suggestion_id:null,
            evaluation_grade:null,
            creation_date:null,
            does_support_the_suggestion:null,
            /////////////////////////////////

            new_grade:null,
            evaluate_counter:null,
//            already_graded: null,
            agrees:null,
            not_agrees:null,
            grade_id:null,

//            wanted_amount_of_tokens: null,
            curr_amount_of_tokens:null
        }
    },

    create_obj:function (req, fields, callback) {
        var self = this;
        var base = this._super;
        var new_grade = null;
        var counter = 0;
        var g_suggestion_obj;
        var is_agree;
        var discussion_evaluation_grade;
        var agrees;
        var not_agrees;
        //this is agrees - not_agrees, for now...
        var curr_tokens_amout;
        var discussion_id = fields.discussion_id;
        var real_threshold;
        var grade_id;
        var proxy_power = req.user.num_of_given_mandates ? 1 + req.user.num_of_given_mandates * 1 / 9 : 1;

        async.waterfall([

            //user can grade suggestion only if he grade the discussion
            function (cbk) {
                models.Grade.findOne({user_id:req.user._id, discussion_id:fields.discussion_id}, cbk);
            },

            function (grade_discussion, cbk) {
                //check if user has graded the discussion first
                //if not - check if the creator of the discussion is the user that is trying to grade
                // (if so - instead of the user discussion_grade we take the evaluated discussion.grade)
                if (!grade_discussion) {
                    models.Discussion.findById(discussion_id, function (err, obj) {
                        if (err || !obj)
                            cbk(err || {code:404, message:"the is no such discussion"}, null);
                        else {
                            //if the creator of the discussion grade the suggestion without grdein the discussion - its ok
                            // otherwise unauthorise
                            if (req.user._id + "" != obj.creator_id + "")
                                cbk({code:401, message:"must grade discussion first"}, null);
                            else {
                                discussion_evaluation_grade = obj.grade;
                                is_agree = fields.evaluation_grade >= discussion_evaluation_grade;

                                //check if suggestion is approved (al haderech)

                                //i think there is no need for that, threshold is in suggestion
//                                real_threshold = Number(obj.admin_threshold_for_accepting_change_suggestions) || obj.threshold_for_accepting_change_suggestions;

                                fields.does_support_the_suggestion = is_agree;
                                fields.proxy_power = proxy_power;
                                base.call(self, req, fields, cbk);
                            }
                        }
                    })
                }
                else {
                    discussion_evaluation_grade = grade_discussion.evaluation_grade;
                    is_agree = fields.evaluation_grade >= discussion_evaluation_grade;
                    fields.does_support_the_suggestion = is_agree;
                    fields.proxy_power = proxy_power;
                    base.call(self, req, fields, cbk);
                }
            },

            function (grade_suggestion_obj, cbk) {
//                is_agree = grade_suggestion_obj.evaluation_grade >= discussion_evaluation_grade;
                grade_id = grade_suggestion_obj._id;

                //update grade suggstoin "does_support_the_suggestion"
                //find suggestion

                models.Suggestion.findById(grade_suggestion_obj.suggestion_id, function (err, sugg) {
                    cbk(err, sugg)
                });
            },

            function (suggestion_obj, cbk) {
                agrees = suggestion_obj.agrees + (Number(is_agree) * proxy_power);
                not_agrees = suggestion_obj.not_agrees + (Number(!is_agree) * proxy_power);

                curr_tokens_amout = Math.round(agrees) - Math.round(not_agrees);

                async.parallel([
                    function (cbk1) {
                        calculateSuggestionGrade(suggestion_obj._id, suggestion_obj.discussion_id, is_agree, null, null, proxy_power, null, function (err, _new_grade, _evaluate_counter) {
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
                        notifications.create_user_vote_or_grade_notification("user_gave_my_suggestion_tokens",
                            suggestion_obj._id, suggestion_obj.creator_id, req.user._id, discussion_id, method, false, true, function (err, result) {
                                cbk1(err, result);
                            })
                    },

                    //set notifications for all users of proxy
                    function(cbk1){
                        models.User.find({"proxy.user_id": req.user._id}, function(err, slaves_users){
                            async.forEach(slaves_users, function(slave, itr_cbk){
                                notifications.create_user_proxy_vote_or_grade_notification("proxy_graded_change_suggestion", discussion_id, slave._id, req.user._id, suggestion_obj._id, is_agree,function(err){
                                    itr_cbk(err);
                                })
                            }, function(err){
                                cbk1(err);
                            })
                        })
                    }
                ], function (err, args) {
                    cbk(err, args);
                })
            }

        ], function (err, obj) {
            if (!err) {
                req.gamification_type = "grade_suggestion";
                req.token_price = common.getGamificationTokenPrice('grade_suggestion') > -1 ? common.getGamificationTokenPrice('grade_suggestion') : 0;
            }
            callback(err, {
                grade_id:grade_id,
                new_grade:new_grade,
                evaluate_counter:counter,
//                    already_graded: true,
                agrees: agrees,
                not_agrees:not_agrees,
//                    wanted_amount_of_tokens: real_threshold,
                curr_amount_of_tokens:curr_tokens_amout
            });
        })
    },

    update_obj:function (req, object, callback) {
        console.log('in update grade suggestion');
        var self = this;
        var base = this._super;
        var g_grade;
        var discussion_id = req.body.discussion_id;
        var is_agree;
        var discussion_evaluation_grade;
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
                models.Discussion.findById(discussion_id, cbk);
            },

            function (discussion_obj, cbk) {
                real_threshold = Number(discussion_obj.admin_threshold_for_accepting_change_suggestions) || discussion_obj.threshold_for_accepting_change_suggestions;

                if (discussion_obj.creator_id + "" == req.user._id + "") {
                    discussion_evaluation_grade = discussion_obj.grade;
                    is_agree = object.evaluation_grade >= discussion_evaluation_grade;
                    models.Suggestion.findById(object.suggestion_id, cbk);
                }
                else
                    models.Grade.findOne({discussion_id:discussion_id, user_id:req.user._id || object.user_id}, function (err, grade_discussion) {
                        if (!err && grade_discussion) {
                            discussion_evaluation_grade = grade_discussion.evaluation_grade;
                            is_agree = object.evaluation_grade >= discussion_evaluation_grade;
                            models.Suggestion.findById(object.suggestion_id, cbk);
                        }else{
                            cbk({message: "please grade the discussion", code: 401});
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
                        if(did_user_change_his_agree){
                            if(sugg_obj.creator_id){
                                notifications.create_user_vote_or_grade_notification("user_gave_my_suggestion_tokens",
                                    sugg_obj._id, sugg_obj.creator_id, req.user._id, discussion_id, method, did_user_change_his_agree, true,function (err, result) {
                                        cbk1(err, result);
                                    })
                            }else{
                                console.log('this suggestion - id number ' +  sugg_obj.creator_id + 'doesnt have creator id!!!')
                                cbk1(null, 0);
                            }

                        }else{
                            cbk1(null, 0);
                        }
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
                        if (did_user_change_his_agree) {
                            models.User.find({"proxy.user_id": req.user._id}, function(err, slaves_users){
                                async.forEach(slaves_users, function(slave, itr_cbk){
                                    notifications.create_user_proxy_vote_or_grade_notification("proxy_graded_change_suggestion", discussion_id, slave._id, req.user._id, sugg_obj._id, is_agree,function(err){
                                        itr_cbk(err);
                                    })
                                }, function(err){
                                    cbk1(err);
                                })
                            })
                        }else{
                            cbk1(null, null);
                        }
                    }
                ], function (err, args) {
                    cbk(err, args[1]);
                })
            },

            function (grade_sugg_object, cbk) {
//                g_grade = grade_sugg_object;

                calculateSuggestionGrade(object.suggestion_id, discussion_id, is_agree, did_user_change_his_agree, null, proxy_power, previous_proxy_power, function (err, _new_grade, _evaluate_counter) {
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
//                wanted_amount_of_tokens: real_threshold,
                        curr_amount_of_tokens:curr_tokens_amout
                    }
                )
            
        })
    }
})

var calculateSuggestionGrade = GradeSuggestionResource.calculateSuggestionGrade =
    function (suggestion_id, discussion_id, is_agree_to_suggestion, did_change_agreement_with_suggestion, discussion_thresh, proxy_power, previous_proxy_power, callback) {

        // suggestios_grade_counter + discussion_grade_counter = all graders
        var suggestios_grade_counter;
        var discussion_grade_counter;

        var suggestios_grade_sum = 0;
        var discussion_grade_sum = 0;

        var total_counter;
        var total_sum;
        var new_grade;
        var change_length;
        var g_approved_sugg;
        async.waterfall([

            //get all grades for the suggestion,
            function (cbk) {
                models.GradeSuggestion.find({suggestion_id:suggestion_id}, ["user_id", "evaluation_grade", "proxy_power"], function (err, sug_grades) {
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

                //get all dicsussion grades that their creators didnot grade the suggestion
                models.Grade.find({ discussion_id:discussion_id, user_id:{ $nin:users }}, function (err, grades) {
                    cbk(err, grades);
                });
            },

            function (disc_grades, cbk) {
                discussion_grade_counter = disc_grades.length;

                if (discussion_grade_counter) {
                    //calcaulte grades sum with the proxy power
                    discussion_grade_sum = _.reduce(disc_grades, function (memo, grade) {
                        return memo + Number(grade.evaluation_grade) * (grade.proxy_power || 1)
                    }, 0);
                    //calcaulte counter sum with the proxy power
                    discussion_grade_counter = _.reduce(disc_grades, function (memo, grade) {
                        return memo + (grade.proxy_power || 1)
                    }, 0);
                }
                total_counter = suggestios_grade_counter + discussion_grade_counter;

                total_sum = suggestios_grade_sum + discussion_grade_sum;

                new_grade = total_sum / total_counter;

                if (is_agree_to_suggestion != null && did_change_agreement_with_suggestion == null) {
                    if (is_agree_to_suggestion) {
                        models.Suggestion.update({_id:suggestion_id}, {$set:{grade:new_grade, evaluate_counter:suggestios_grade_counter}, $inc:{agrees:proxy_power}}, function (err, args) {
                            cbk(err, args);
                        });
                    } else {
                        models.Suggestion.update({_id:suggestion_id}, {$set:{grade:new_grade, evaluate_counter:suggestios_grade_counter}, $inc:{not_agrees:proxy_power}}, function (err, args) {
                            cbk(err, args);
                        });
                    }
                } else {
                    if (did_change_agreement_with_suggestion && is_agree_to_suggestion)
                        models.Suggestion.update({_id:suggestion_id}, {$set:{grade:new_grade, evaluate_counter:suggestios_grade_counter}, $inc:{not_agrees:(previous_proxy_power * -1), agrees:proxy_power}}, function (err, args) {
                            cbk(err, args);
                        });
                    else
                    if (did_change_agreement_with_suggestion && !is_agree_to_suggestion)
                        models.Suggestion.update({_id:suggestion_id}, {$set:{grade:new_grade, evaluate_counter:suggestios_grade_counter}, $inc:{not_agrees:proxy_power, agrees:(previous_proxy_power * -1)}}, function (err, args) {
                            cbk(err, args);
                        });
                    else
                        models.Suggestion.update({_id:suggestion_id}, {$set:{grade:new_grade, evaluate_counter:suggestios_grade_counter}}, function (err, args) {
                            cbk(err, args);
                        });
                }
            }
        ], function (err, disc_grades) {

            if(err)
                callback(err);
            else {
                async.waterfall([
                    //set all other suggestion index offset

                    function (cbk) {
                        models.Suggestion.findById(suggestion_id, cbk);
                    },

                    function (approved_sugg, cbk) {
                        g_approved_sugg = approved_sugg;
                        change_length = approved_sugg.parts[0].end - approved_sugg.parts[0].start - 1;


                        //this is because a bug i have
                        if(!approved_sugg.parts[0].text){
                            approved_sugg.parts[0].text = "";
                            approved_sugg.save(function(err, approved_sugg_){
                                if (approved_sugg_.parts[0].text.length != change_length) {
                                    models.Suggestion.find({discussion_id:discussion_id, is_approved:false}, cbk);
                                }
                                else {
                                    cbk("no need for offseting", null);
                                }
                            })
                        }else{
                            if (approved_sugg.parts[0].text.length != change_length) {
                                models.Suggestion.find({discussion_id:discussion_id, is_approved:false}, cbk);
                            }
                            else {
                                cbk("no need for offseting", null);
                            }

                        }
                     },

                    function (suggestions, cbk) {
                        async.forEach(suggestions, function (sugg, itr_cbk) {
                            if (sugg._id != suggestion_id && sugg.parts[0].start < g_approved_sugg.parts[0].end - 1){
                                if(sugg.threshold_for_accepting_the_suggestion > 500)
                                    sugg.threshold_for_accepting_the_suggestion = 500;

                                sugg.parts[0].start = g_approved_sugg.parts[0].text.length > change_length ? sugg.parts[0].start + change_length : sugg.parts[0].start - change_length;
                                sugg.save(function(err, sugg){
                                    itr_cbk(err, sugg);
                                });
                            }
                            else {
                                itr_cbk();
                            }
                        }, function(err, obj){
                            cbk(err, obj);
                        });
                    },

                    function (obj, cbk) {
                        if (discussion_thresh) {
                            //set suggestion threshold
                            async.waterfall([
                                function (cbk1) {
                                    models.Suggestion.findById(suggestion_id, cbk1);
                                },

                                function (sugg_obj, cbk1) {
                                    var num_of_words_to_calc_sugg_threshold;
                                    num_of_words_to_calc_sugg_threshold = sugg_obj.getCharCount();
                                    var sugg_thresh = calculate_sugg_threshold(num_of_words_to_calc_sugg_threshold, discussion_thresh);

                                    models.Suggestion.update({_id:suggestion_id}, {$set:{threshold_for_accepting_the_suggestion:sugg_thresh}}, cbk1);
                                }
                            ], function (err, obj) {
                                cbk(err, obj);
                            })
                        } else {
                            cbk(null, null);
                        }
                    }
                ], function (err, obj) {
                    if (err == "no need for offseting")
                        err = null;
                    callback(err, new_grade, suggestios_grade_counter);
                })
            }
        })
    };

var calculate_sugg_threshold = function (factor, discussion_threshold) {
    var log_base_75_of_x =
        Math.log(factor) / Math.log(75);
    var result = Math.pow(log_base_75_of_x, common.getThresholdCalcVariables("SCALE_PARAM")) * discussion_threshold;

    return Math.round(result);
}
