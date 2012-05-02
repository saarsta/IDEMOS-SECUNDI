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
        models.Grade.find({"discussion_id": object.discussion_id}, function(err, objects){
        if (err){
            callback(err, null);
        }else{
            for (var i = 0; i < objects.length; i++){
                if(req.session.user_id == objects[i].user_id){
                    flag = true;
                    break;
                }
            }
            if (flag){
                callback({message:"user already grade this discussion",code:401}, null);
            }else{
                callback(null, object);
            }
        }
    })
};

var GradeResource = module.exports = common.GamificationMongooseResource.extend({
    init:function(){
        this._super(models.Grade,'grade');
//        GradeResource.super_.call(this,models.Grade);
        this.allowed_methods = ['get','post'];
        this.authorization = new Authoriztion();
        this.authentication = new common.SessionAuthentication();
        this.filtering = {discussion_id: null};
    },

    create_obj:function(req,fields,callback)
    {
        var user_id = req.session.user_id;
        var self = this;
        var object = new self.model();
        var g_grade;

        object.user_id = user_id;
        for( var field in fields)
        {
            object.set(field,fields[field]);
        }
        self.authorization.edit_object(req, object, function(err, object)
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
                        var user = req.user;
                        g_grade = grade_object;
                        async.waterfall([
                            /*function(cbk){
                                models.Discussion.update({_id: grade_object.discussion_id}, {$addToSet: {users: {user_id: user._id, join_date:Date.now()}}}, cbk);
                            },
*/
                            function(cbk){
                                models.Discussion.findById(grade_object.discussion_id, cbk);
                            },

                            function(discussion_obj, cbk){
                                /*_.find(discussion_obj.users, function(user){
                                    user.user_id
                                })*/
                                discussion_obj.users.push({user_id: user._id, join_date:Date.now()})
                                discussion_obj.grade_sum += grade_object._doc.grade;
                                discussion_obj.grade = discussion_obj.grade_sum / discussion_obj.evaluate_counter;
                                discussion_obj.evaluate_counter += 1;
                                discussion_obj.save(cbk);
                            }
                        ], function(err, obj){
                            callback(err, g_grade);
                        })
                    }
                });
            }
        })
    }
});

//util.inherits(GradeResource, resources.MongooseResource);


//returns the edited discussion object in the callback
//GradeResource.prototype.create_obj =

