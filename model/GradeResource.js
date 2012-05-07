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
    var flag = false;
        models.Grade.findOne({"discussion_id": object.discussion_id, "user_id":req.user._id}, function(err, grade){
        if (err){
            callback(err, null);
        }else{
            if (grade){
                callback({message:"user already grade this discussion",code:401}, null);
            }else{
                object.user_id = req.user._id;
                callback(null, object);
            }
        }
    })
};

var GradeResource = module.exports = common.GamificationMongooseResource.extend({
    init:function(){
        this._super(models.Grade,'grade', common.getGamificationTokenPrice('grade'));
//        GradeResource.super_.call(this,models.Grade);
        this.allowed_methods = ['get','post'];
        this.authorization = new Authoriztion();
        this.authentication = new common.SessionAuthentication();
        this.filtering = {discussion_id: {
            exact:null,
            in:null
        }};
    },

    create_obj:function(req,fields,callback)
    {

        var self = this;
        var new_grade = null;
        self._super(req,fields,function(err,grade_object)
        {
            async.waterfall([

                function(cbk){
                    models.Discussion.findById(grade_object.discussion_id, cbk);
                },

                function(discussion_obj, cbk){
                    //                             discussion_obj.users.push({user_id: user._id, join_date:Date.now()})
                    async.parallel([
                        function(cbk)
                        {
                            var add_grade = Number(grade_object.evaluation_grade);
                            var grade = discussion_obj.grade_sum;
                            grade += add_grade;
                            var counter = discussion_obj.evaluate_counter + 1;
                            new_grade = grade / counter;

                            models.Discussion.update({_id:grade_object.discussion_id},
                                {
                                    $inc:{ grade_sum: add_grade, evaluate_counter: 1},
                                    $set:{grade:grade}
                                },cbk);
                        }
//                        ,function(cbk)
//                        {
//                            if(!_.any(discussion_obj.users, function(user){
//                                return user.user_id ==  req.user._id;
//                            }))
//                            {
//                                discussion_obj.users.push({user_id:req.user._id,join_date:Date.now()});
//                                discussion_obj.save(cbk);
//                            }
//                            else
//                                cbk();
//                        }
                    ],cbk);
                }
            ], function(err, obj){
                callback(err, {new_grade:new_grade});
            })

        });
//        var user_id = req.session.user_id;
//        var self = this;
//        var object = new self.model();
//        var g_grade;
//
//        object.user_id = user_id;
//        for( var field in fields)
//        {
//            object.set(field,fields[field]);
//        }
//        self.authorization.edit_object(req, object, function(err, object)
//        {
//            if(err) callback(err);
//            else
//            {
//                object.save(function(err,grade_object)
//                {
//                    if (err){
//                        callback(err, null);
//                    }
//                    else{
//                        var user = req.user;
//                    }
//                });
//            }
//        })
    }
});

//util.inherits(GradeResource, resources.MongooseResource);


//returns the edited discussion object in the callback
//GradeResource.prototype.create_obj =

