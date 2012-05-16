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
    //check if user already grade this discussion

    if(req.method == 'POST'){
        models.Grade.count({"discussion_id": object.discussion_id + "", "user_id":req.user._id}, function(err, count){
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
            grade_id: null
        }
    },

    create_obj:function(req,fields,callback)
    {
        var g_discussion;
        var self = this;
        var new_grade = null;
        var counter = 0;

        self._super(req, fields, function(err, grade_object)
        {
            if(!err){
                async.waterfall([

                    function(cbk){
                        models.Discussion.findById(grade_object.discussion_id, cbk);
                    },

                    function(discussion_obj, cbk){
                        calculate_discussion_grade(grade_object.discussion_id, function(err, new_grade, evaluate_counter){
                            cbk(err, new_grade, evaluate_counter);
                        });
                    }


                    //calculate all change suggestion all over again



                ], function(err, new_grade, evaluate_counter){
                    req.gamification_type = "grade_discussion";
                    req.token_price = common.getGamificationTokenPrice('grade_discussion') || 0;

                    callback(err, {new_grade:new_grade, evaluate_counter: evaluate_counter, grade_id: grade_object._id || 0});
                })
            }else{
                callback(err, null);
            }
        });
    },

    update_obj: function(req, object, callback){

        var g_grade;
        var self = this;

        self._super(req, object, function(err, grade_object){

            if(err){
                callback(err, null);
            }else{
                async.waterfall([

                    function(cbk){
                        g_grade = grade_object;
                        calculate_discussion_grade(object.discussion_id, function(err, new_grade, evaluate_counter){
                            cbk(err, new_grade, evaluate_counter);
                        });
                    }

                    //maybe do something with suggestion grade

                ], function(err, new_grade, evaluate_counter){
                    callback(err, {new_grade: new_grade, evaluate_counter: evaluate_counter, grade_id: g_grade._id || 0})
                })
            }
        });
    }
});

function calculate_discussion_grade(discussion_id, callback){

    var count;
    var grade_sum;
    var new_grade;

    var iterator = function(memo, grade){
        return memo + Number(grade.evaluation_grade);
    }
    async.waterfall([
        function(cbk){
            models.Grade.find({discussion_id: discussion_id}, ["evaluation_grade"], cbk);
        },

        function(grades, cbk){
            count = grades.length;
            if(count){
                grade_sum = _.reduce(grades, iterator/*function(memo, grade){return memo + Number(grade.evaluation_grade); }*/, 0);
                new_grade = grade_sum / count;

                models.Discussion.update({_id: discussion_id}, {$set: {grade: new_grade, evaluate_counter: count}}, cbk);
            }else{
                cbk({message: "you have to grade before changing the grade" , code: 401});
            }
        },

        function(num, cbk){

            //do somthimg with suggestions

            cbk(null, 0);

        }
    ],function(err, args){
        callback(err, new_grade, count);
    })


}