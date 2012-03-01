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
    common = require('./common');

//Authorization
var Authoriztion = function() {};
util.inherits(Authoriztion,resources.Authorization);

Authoriztion.prototype.edit_object = function(req,object,callback){
    /* check if user already grade this discussion */
};

var GradeResource = module.exports = function(){

    GradeResource.super_.call(this,models.Grade);
    this.allowed_methods = ['get','post'];
//    this.authorization = new Authoriztion();
    this.authentication = new common.SessionAuthentication();
    this.filtering = {discussion_id: null};
}

util.inherits(GradeResource, resources.MongooseResource);

GradeResource.prototype.create_obj = function(req,fields,callback)
{
    var user_id = req.session.user_id;
    var self = this;
    var object = new self.model();

    object.user_id = user_id;
    for( var field in fields)
    {
        object.set(field,fields[field]);
    }
    self.authorization.edit_object(req,object,function(err,object)
    {
        if(err) callback(err);
        else
        {
            object.save(function(err,grade_object)
            {
                if (err){
                    callback(err, null);
                }
                else{
                    models.Discussion.findOne({"_id": grade_object.discussion_id}, function(err,discussion_object){
                        if (err){
                            callback(err, null);
                        }
                        else{
//                      //calculating the current discussion grade
                            discussion_object.grade_sum += parseInt(grade_object.evaluation_grade);
                            discussion_object.evaluate_counter++;
                            discussion_object.grade = discussion_object.grade_sum / discussion_object.evaluate_counter;

                            discussion_object.save(function(err){
                                if (err){
                                    callback(err, null)
                                }
                                else{
                                    callback(self.elaborate_mongoose_errors(err),grade_object);
                                }
                            })
                        }
                    });
                }
            });
        }
    });





}

