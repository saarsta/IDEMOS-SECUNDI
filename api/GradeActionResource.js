///**
// * Created by JetBrains WebStorm.
// * User: saar
// * Date: 01/03/12
// * Time: 13:54
// * To change this template use File | Settings | File Templates.
// */
//
//
//var resources = require('jest'),
//    util = require('util'),
//    models = require('../models'),
//    common = require('./common');
//
////Authorization
//var Authoriztion = function() {};
//util.inherits(Authoriztion,resources.Authorization);
//
//Authoriztion.prototype.edit_object = function(req,object,callback){
//    //check if user already grade this action
//    var flag = false;
//    models.GradeAction.find({"action_id": object.action_id}, function(err, objects){
//        if (err){
//            callback(err, null);
//        }else{
//            for (var i = 0; i < objects.length; i++){
//                if(req.session.user_id == objects[i].user_id){
//                    flag = true;
//                    break;
//                }
//            }
//            if (flag){
//                callback({message:"user already grade this action",code:401}, null);
//            }else{
//                callback(null, object);
//            }
//        }
//    })
//};
//
//var GradeActionResource = module.exports = common.GamificationMongooseResource.extend({
//    init:function(){
//        this._super(models.GradeAction,'grade_action');
////        GradeResource.super_.call(this,models.Grade);
//        this.allowed_methods = ['get','post'];
//        this.authorization = new Authoriztion();
//        this.authentication = new common.SessionAuthentication();
//        this.filtering = {action_id: null};
//    },
//
//    create_obj:function(req,fields,callback)
//    {
//        var user_id = req.session.user_id;
//        var self = this;
//        var object = new self.model();
//
//        object.user_id = user_id;
//        for( var field in fields)
//        {
//            object.set(field,fields[field]);
//        }
//        self.authorization.edit_object(req,object,function(err,object)
//        {
//            if(err) callback(err);
//            else
//            {
//                object.save(function(err, grade_object)
//                {
//                    if (err){
//                        callback(err, null);
//                    }
//                    else{
//                        var isNewFollower = false;
//                        models.User.findOne({_id: grade_object.user_id}, function(err,user_object){
//                            if(err){
//
//                            }else{
//                                if (common.isArgIsInList(grade_object.action_id, user_object.actions)  == false){
//                                    isNewFollower = true;
//                                    user_object.actions.push(grade_object.action_id);
//                                }
//
//                                models.Action.findOne({_id: grade_object.action_id}, function(err,action_object){
//                                    if (err){
//                                        callback(err, null);
//                                    }
//                                    else{
////                                      // calculating the current action grade
//                                        // + insert user to action
//                                        // + increase followers if necessary
//
//                                        action_object.grade_sum += parseInt(grade_object.evaluation_grade);
//                                        action_object.evaluate_counter++;
//                                        action_object.grade = action_object.grade_sum / action_object.evaluate_counter;
//                                        if (isNewFollower){
//                                            action_object.followers_count++;
//                                        }
//                                        action_object.save(function(err){
//                                            if (err){
//                                                callback(err, null)
//                                            }
//                                            else{
//                                                callback(self.elaborate_mongoose_errors(err), action_object);
//                                            }
//                                        })
//                                    }
//                                });
//                            }
//                        });
//                    }
//                });
//            }
//        });
//    }
//});
//
//
//
