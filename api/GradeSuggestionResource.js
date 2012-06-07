
var resources = require('jest'),
    util = require('util'),
    models = require('../models'),
    async = require('async'),
    common = require('./common'),
    _ = require('underscore'),
    Suggestion = require('./suggestionResource');

//Authorization
var Authoriztion = function() {};
util.inherits(Authoriztion,resources.Authorization);

Authoriztion.prototype.edit_object = function(req,object,callback){

    if(req.method == 'POST'){
        models.GradeSuggestion.findOne({suggestion_id: object.suggestion_id + "", user_id:req.user._id}, function(err, obj){
            if (err){
                callback(err, null);
            }else{
                if (obj){
                    callback({message:"user already grade this discussion",code:401}, null);
                }else{
                    object.user_id = req.user._id;
                    callback(null, object);
                }
            }
        })
    }else{
        if(req.method == 'PUT'){
            if(!(object.user_id + "" == req.user._id + ""))
                callback({message:"its not your garde!",code:401}, null);
            else
                callback(null, object);
        }else{
            callback(null, object);
        }
    }
};

var GradeSuggestionResource = module.exports = common.GamificationMongooseResource.extend({
    init:function(){
        this._super(models.GradeSuggestion,'grade_suggestion', null);
//        GradeResource.super_.call(this,models.Grade);
        this.allowed_methods = ['get','put','post'];
        this.authorization = new Authoriztion();
        this.authentication = new common.SessionAuthentication();
        this.filtering = {discussion_id: {
            exact:null,
            in:null
        }};
        this.fields = {
            _id: null,

            //just for debuging!!!
            user_id: null,
            suggestion_id: null,
            evaluation_grade: null,
            creation_date: null,
            does_support_the_suggestion: null,
            /////////////////////////////////

            new_grade: null,
            evaluate_counter: null,
//            already_graded: null,
            agrees: null,
            not_agrees: null,
            grade_id: null,

//            wanted_amount_of_tokens: null,
            curr_amount_of_tokens: null
        }
    },

    create_obj:function(req,fields,callback)
    {
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

        async.waterfall([

            //user can grade suggestion only if he grade the discussion
            function(cbk){
                models.Grade.findOne({user_id: req.user._id, discussion_id: fields.discussion_id}, cbk);
            },

            function(grade_discussion, cbk){
                //check if user has graded the discussion first
                //if not - check if the creator of the discussion is the user that is trying to grade
                // (if so - instead of the user discussion_grade we take the evaluated discussion.grade)
                if(!grade_discussion){
                    models.Discussion.findById(discussion_id, function(err, obj){
                        if(err || !obj)
                            cbk(err || {code: 404, message: "the is no such discussion"}, null);
                        else{
                            //if the creator of the discussion grade the suggestion without grdein the discussion - its ok
                            // otherwise unauthorise
                            if(req.user._id + "" != obj.creator_id + "")
                                cbk({code: 401, message: "must grade discussion first"}, null);
                            else{
                                discussion_evaluation_grade = obj.grade;
                                is_agree = fields.evaluation_grade >= discussion_evaluation_grade;

                                //check if suggestion is approved (al haderech)
                                real_threshold = obj.admin_threshold_for_accepting_change_suggestions || obj.threshold_for_accepting_change_suggestions;

                                base.call(self, req, fields, cbk);
                            }
                        }
                    })
                }
                else{
                    discussion_evaluation_grade = grade_discussion.evaluation_grade;
                    is_agree = fields.evaluation_grade >= discussion_evaluation_grade;
                    fields.does_support_the_suggestion = is_agree;

                    base.call(self, req, fields, cbk);
                }
            },

            function(grade_suggestion_obj, cbk){
//                is_agree = grade_suggestion_obj.evaluation_grade >= discussion_evaluation_grade;
                grade_id = grade_suggestion_obj._id;

                //update grade suggstoin "does_support_the_suggestion"
                //find suggestion

                models.Suggestion.findById(grade_suggestion_obj.suggestion_id, function(err, sugg){
                    cbk(err, sugg)
                });
            },

            function(suggestion_obj, cbk){
                agrees = suggestion_obj.agrees + Number(is_agree);
                not_agrees = suggestion_obj.not_agrees + Number(!is_agree);

                curr_tokens_amout = agrees - not_agrees;

                async.parallel([
                    function(cbk1){
                        calculateSuggestionGrade(suggestion_obj._id, suggestion_obj.discussion_id, is_agree, null, function(err, _new_grade, _evaluate_counter){
                            if(!err){
                                new_grade = _new_grade;
                                counter = _evaluate_counter;
                            }
                            cbk1(err)
                        });
                    },

                    function(cbk1){
                        //if there is an admin threshokd specified for the suggestion - it wins
                        if(suggestion_obj.admin_threshold_for_accepting_the_suggestion > 0)
                            real_threshold = suggestion_obj.admin_threshold_for_accepting_the_suggestion;


                        //TODO there is a problem with "approveSuggestion"
                        if(curr_tokens_amout >= /*real_threshold*/ 100){
                            Suggestion.approveSuggestion(suggestion_obj._id, function(err, obj1){
                                cbk1(err, obj1);
                            })
                        }else{
                            cbk1();
                        }
                    }
                ], function(err, args){
                    cbk(err, args);
                })
            }

            ], function(err, obj){
                if(!err){
                    req.gamification_type = "grade_suggestion";
                    req.token_price = common.getGamificationTokenPrice('grade_suggestion') || 0;
                }
                callback(err, {
                    grade_id: grade_id,
                    new_grade:new_grade,
                    evaluate_counter: counter,
//                    already_graded: true,
                    agrees: agrees,
                    not_agrees: not_agrees,
//                    wanted_amount_of_tokens: real_threshold,
                    curr_amount_of_tokens: curr_tokens_amout
                });
            })
    },

    update_obj: function(req, object, callback){
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

        async.waterfall([

            //find the limit of between agree and not agree
            function(cbk){
                models.Discussion.findById(discussion_id, cbk);
            },

            function(discussion_obj, cbk){
                real_threshold = discussion_obj.admin_threshold_for_accepting_change_suggestions || discussion_obj.threshold_for_accepting_change_suggestions;

                if(discussion_obj.creator_id + "" == req.user._id + ""){
                    discussion_evaluation_grade = discussion_obj.grade;
                    is_agree =  object.evaluation_grade >=  discussion_evaluation_grade;
                    models.Suggestion.findById(object.suggestion_id, cbk);
                }
                else
                    models.Grade.findOne({discussion_id: discussion_id, user_id: req.user._id}, function(err, grade_discussion){
                        if(!err){
                            discussion_evaluation_grade = grade_discussion.evaluation_grade;
                            is_agree =  object.evaluation_grade >=  discussion_evaluation_grade;
                        }
                        models.Suggestion.findById(object.suggestion_id, cbk);
                    });
            },

            function(sugg_obj, cbk){
                g_sugg_obj = sugg_obj;
                agrees = sugg_obj.agrees;
                not_agrees = sugg_obj.not_agrees;

                did_user_change_his_agree = object.does_support_the_suggestion != is_agree;
                object.does_support_the_suggestion = is_agree;
                base.call(self, req, object, cbk);
            },

            function(grade_sugg_object, cbk){
//                g_grade = grade_sugg_object;

                calculateSuggestionGrade(object.suggestion_id, discussion_id, is_agree, did_user_change_his_agree, function(err, _new_grade, _evaluate_counter){
                    if(!err){
                        new_grade = _new_grade;
                        evaluate_counter = _evaluate_counter;
                        if(did_user_change_his_agree){
                            if(is_agree){
                                agrees = g_sugg_obj.agrees + 1;
                                not_agrees = g_sugg_obj.not_agrees - 1;
                            }
                            else{
                                agrees = g_sugg_obj.agrees - 1;
                                not_agrees = g_sugg_obj.not_agrees + 1;
                                curr_tokens_amout = agrees - not_agrees;
                            }

                            //if there is an admin threshokd specified for the suggestion - it wins
                            if(g_sugg_obj.admin_threshold_for_accepting_the_suggestion > 0)
                                real_threshold = g_sugg_obj.admin_threshold_for_accepting_the_suggestion;


                            //TODO there is a problem with "approveSuggestion"
                            if(curr_tokens_amout >= /*real_threshold*/ 100){
                                Suggestion.approveSuggestion(g_sugg_obj._id, function(err, obj1){
                                    cbk(err, obj1);
                                })
                            }else{
                                cbk();
                            }
                        }
                        else{
                            cbk(null, 0);
                        }
                    }else
                        cbk(err, 0);
                });
            }
        ], function(err){
            callback(err, {
//                new_grade: new_grade,
//                evaluate_counter: evaluate_counter,
//                grade_id: g_grade._id || 0}

                grade_id: grade_id,
                new_grade:new_grade,
                evaluate_counter: evaluate_counter,
                agrees: agrees,
                not_agrees: not_agrees,
//                wanted_amount_of_tokens: real_threshold,
                curr_amount_of_tokens: curr_tokens_amout
                }
            )
        })
    }
})


var calculateSuggestionGrade = GradeSuggestionResource.calculateSuggestionGrade =
    function (suggestion_id, discussion_id,is_agree_to_suggestion, did_change_agreement_with_suggestion, callback){

    // suggestios_grade_counter + discussion_grade_counter = all graders
    var suggestios_grade_counter;
    var discussion_grade_counter;

    var suggestios_grade_sum = 0;
    var discussion_grade_sum = 0;

    var total_counter;
    var total_sum;
    var new_grade;

    async.waterfall([

        //get all grades for the suggestion,
        function(cbk){
            models.GradeSuggestion.find({suggestion_id: suggestion_id}, ["user_id", "evaluation_grade"], function(err, sug_grades){
                cbk(err, sug_grades);
            });
        },

        function(sugg_grades, cbk){
            var users = [];
            suggestios_grade_counter = sugg_grades.length;

            if(suggestios_grade_counter)
                suggestios_grade_sum = _.reduce(sugg_grades, function(memo, grade){return memo + Number(grade.evaluation_grade); }, 0);

            _.each(sugg_grades, function(grade){users.push(grade.user_id)});

            //get all dicsussion grades that their creators didnot grade the suggestion
            models.Grade.find({ discussion_id: discussion_id, user_id: { $nin: users }}, function(err, grades){
                cbk(err, grades);
            });
        },

        function(disc_grades, cbk){
            discussion_grade_counter = disc_grades.length;

            if(discussion_grade_counter)
                discussion_grade_sum = _.reduce(disc_grades, function(memo, grade){return memo + Number(grade.evaluation_grade); }, 0);

            total_counter = suggestios_grade_counter + discussion_grade_counter;
            total_sum = suggestios_grade_sum + discussion_grade_sum;

            new_grade = total_sum/total_counter;
            if(is_agree_to_suggestion != null && did_change_agreement_with_suggestion == null){
                if(is_agree_to_suggestion){
                    models.Suggestion.update({_id: suggestion_id}, {$set: {grade: new_grade, evaluate_counter: suggestios_grade_counter}, $inc: {agrees: 1}}, function(err, args){
                        cbk(err, args);
                    });
                }else{
                    models.Suggestion.update({_id: suggestion_id}, {$set: {grade: new_grade, evaluate_counter: suggestios_grade_counter}, $inc: {not_agrees: 1}}, function(err, args){
                        cbk(err, args);
                    });
                }
            }else{

                if(did_change_agreement_with_suggestion && is_agree_to_suggestion)
                    models.Suggestion.update({_id: suggestion_id}, {$set: {grade: new_grade, evaluate_counter: suggestios_grade_counter},  $inc: {not_agrees: -1, agrees: 1}}, function(err, args){
                        cbk(err, args);
                    });
                else
                    if(did_change_agreement_with_suggestion && !is_agree_to_suggestion)
                        models.Suggestion.update({_id: suggestion_id}, {$set: {grade: new_grade, evaluate_counter: suggestios_grade_counter},  $inc: {not_agrees: 1, agrees: -1}}, function(err, args){
                            cbk(err, args);
                        });
                    else
                        models.Suggestion.update({_id: suggestion_id}, {$set: {grade: new_grade, evaluate_counter: suggestios_grade_counter}}, function(err, args){
                            cbk(err, args);
                        });
            }
        }
    ], function(err, disc_grades){
        callback(err, new_grade, total_counter);
    })
};