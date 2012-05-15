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
    _ = require('underscore');

//Authorization
var Authoriztion = function() {};
util.inherits(Authoriztion,resources.Authorization);

Authoriztion.prototype.edit_object = function(req,object,callback){

    if(req.method == 'POST'){
        models.GradeSuggestion.count({"suggestion_id": object.suggestion_id + "", "user_id":req.user._id}, function(err, count){
            if (err){
                callback(err, null);
            }else{
                if (count > 0){
                    callback({message:"user already grade this discussion",code:401}, null);
                }else{
                    object.user_id = req.user._id;
                    callback(null, object);
                }
            }
        })
    }else{
        callback(null, object);
    }


};

var GradeResource = module.exports = common.GamificationMongooseResource.extend({
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
            new_grade: null,
            evaluate_counter: null,
            already_graded: null
        }
    },

    create_obj:function(req,fields,callback)
    {
        var self = this;
        var new_grade = null;
        var counter = 0;

        self._super(req, fields, function(err, grade_object)
        {
            if(!err){
                async.waterfall([

                    function(cbk){
                        models.Suggestion.findById(grade_object.suggestion_id, cbk);
                    },

                    function(suggestion_obj, cbk){
                        async.parallel([
                            function(cbk)
                            {
                                var add_grade = Number(grade_object.evaluation_grade);
                                var grade = suggestion_obj.grade_sum;
                                grade += add_grade;
                                counter = suggestion_obj.evaluate_counter + 1;
                                new_grade = grade / counter;

                                models.Suggestion.update({_id:grade_object.suggestion_id},
                                    {
                                        $inc:{ grade_sum: add_grade, evaluate_counter: 1},
                                        $set:{grade: new_grade}
                                    },cbk);
                            }
                        ],cbk);
                    }

                ], function(err, obj){
                    req.gamification_type = "grade_suggestion";
                    req.token_price = common.getGamificationTokenPrice('grade_suggestion') || 0;

                    callback(err, {new_grade:new_grade, evaluate_counter: counter, already_graded: true});
                })
            }else{
                callback(err, null);
            }
        });
    },

    update_obj: function(req, object, callback){

    }
})

