/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 01/03/12
 * Time: 13:54
 * To change this template use File | Settings | File Templates.
 */


var resources = require('jest'),
    util = require('util'),
    models = require('../models'),
    async = require('async'),
    common = require('./common'),
    GradeSuggestion = require('./GradeSuggestionResource'),
    _ = require('underscore');

//Authorization
var Authoriztion = function() {};
util.inherits(Authoriztion,resources.Authorization);

Authoriztion.prototype.edit_object = function(req,object,callback){
    //check if user already grade this discussion

//    if(req.method == 'POST'){
//        models.Grade.count({"discussion_id": object.discussion_id + "", "creator_id": req.user._id}, function(err, count){
//            if (err){
//                callback(err, null);
//            }else{
//                if (count > 0){
//                    callback({message:"user already grade this discussion",code:401}, null);
//                }else{
//                    object.user_id = req.user._id;
//                    callback(null, object);
//                }
//            }
//        })
//    }else{
        if(req.method == 'PUT'){
           if(!(object.user_id + "" == req.user._id + ""))
               callback({message:"its not your garde!",code:401}, null);
            else
                callback(null, object);
        }else{
            callback(null, object);
        }
//    }
};

var GradeResource = module.exports = common.GamificationMongooseResource.extend({
    init:function(){
        this._super(models.Grade,'grade', null);
//        GradeResource.super_.call(this,models.Grade);
        this.allowed_methods = ["get", "put", "post"];
        this.authorization = new Authoriztion();
        this.authentication = new common.SessionAuthentication();
        this.filtering = {discussion_id: {
            exact:null,
            in:null
        }};
        this.fields = {
            _id: null,
            new_grade: null,
            evaluate_counter: null,
            grade_id: null,
            suggestions: {
                _id: null,
                grade: null,
                evaluators_counter: null
            },
            updated_user_tokens: null
        }
    },

    create_obj:function(req,fields,callback)
    {
        var g_discussion;
        var self = this;
        var new_grade = null;
        var counter = 0;
        var threshold;
        var admin_threshold;

        fields.user_id = req.user._id;


        self._super(req, fields, function(err, grade_object)
        {
            if(!err){
                async.waterfall([

                    function(cbk){
                        models.Discussion.findById(grade_object.discussion_id, cbk);
                    },

                    function(discussion_obj, cbk){
                        //cant grade your own discussion
                        if(discussion_obj.creator_id + "" == req.user._id + ""){
                            cbk({message:"user already grade this discussion",code:401}, null);
                        }else{
                            admin_threshold = discussion_obj.admin_threshold_for_accepting_change_suggestions;
                            calculateDiscussionGrade(grade_object.discussion_id, function(err, _new_grade, evaluate_counter, _threshold){
                                new_grade = _new_grade;
                                counter = evaluate_counter;
                                threshold = _threshold
                                cbk(err, threshold);
                            });
                        }
                    },

                    //calculate all change suggestion all over again and check if they approved
                    function(threshold, cbk){
                        models.Suggestion.find({discussion_id: grade_object.discussion_id}, ["_id"], function(err, results)
                        {
                            cbk(err, results);
                        });
                    },

                    function(suggestions, cbk){
                        var real_threshold = admin_threshold || threshold;
                        async.forEach(suggestions, function(suggestion, itr_cbk){
                            GradeSuggestion.calculateSuggestionGrade(suggestion._id, grade_object.discussion_id, null, function(err, obj){
                                //check if suggestion is over the threshold
                                if(suggestion.agrees && suggestion.agrees.length > real_threshold){

                                    //approveSuggestion.exec()

                                }
                                itr_cbk(err, obj);
                            });}
                        , function(err, args){
                            cbk(err, args);
                        });
                    }

                ], function(err, args){
                    req.gamification_type = "grade_discussion";
                    req.token_price = common.getGamificationTokenPrice('grade_discussion') || 0;

                        callback(err, {new_grade: new_grade, evaluate_counter: counter, grade_id: grade_object._id || 0});
                })
            }else{
                callback(err, null);
            }
        });
    },

    update_obj: function(req, object, callback){

        var g_grade;
        var self = this;
        var suggestions = [];

        var iterator = function(suggestion, itr_cbk){
            GradeSuggestion.calculateSuggestionGrade(suggestion._id, object.discussion_id, null, function(err, sugg_new_grade, sugg_total_counter){
                if(!err){
                    suggestions.push({
                        _id: suggestion._id,
                        grade: sugg_new_grade,
                        evaluators_counter: sugg_total_counter
                    })
                }
                itr_cbk(err, 0);
            });
        }

        self._super(req, object, function(err, grade_object){

            if(err){
                callback(err, null);
            }else{
                var new_grade, evaluate_counter;
                async.waterfall([

                    function(cbk){
                        g_grade = grade_object;
                        calculateDiscussionGrade(object.discussion_id, function(err, _new_grade, _evaluate_counter){
                            new_grade = _new_grade;
                            evaluate_counter = _evaluate_counter;
                            cbk(err, 0);
                        });
                    },

                    //maybe do something with suggestion grade
                    //calculate all change suggestion all over again
                    function(obj,cbk){
                        models.Suggestion.find({discussion_id: grade_object.discussion_id}, ["_id"], function(err, results)
                        {
                            cbk(err, results);
                        });
                    },

                    function(suggestions, cbk){
                        async.forEach(suggestions, iterator, cbk);
                    }

                ], function(err){
                    callback(err, {new_grade: new_grade, evaluate_counter: evaluate_counter, suggestions: suggestions,grade_id: g_grade._id || 0})
                })
            }
        });
    }
});

function calculateDiscussionGrade(discussion_id, callback){

    var count;
    var grade_sum;
    var new_grade;
    var threshold;
    async.waterfall([
        function(cbk){
            models.Grade.find({discussion_id: discussion_id}, ["evaluation_grade"], cbk);
        },

        function(grades, cbk){
            count = grades.length;
            if(count){
                grade_sum = _.reduce(grades, function(memo, grade){return memo + Number(grade.evaluation_grade); }, 0);
                new_grade = grade_sum / count;

                //calculate threshhold here

                threshold = 2; //here goes the code


                models.Discussion.update({_id: discussion_id}, {$set: {grade: new_grade, evaluate_counter: count, threshold_for_accepting_change_suggestions: threshold}}, cbk);
            }else{
                cbk({message: "you have to grade before changing the grade" , code: 401});
            }
        }
    ],function(err, args){
        callback(err, new_grade, count, threshold);
    })
}