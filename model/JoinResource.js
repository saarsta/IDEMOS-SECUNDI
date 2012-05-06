/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 28/03/12
 * Time: 11:59
 * To change this template use File | Settings | File Templates.
 */

var jest = require('jest'),
    util = require('util'),
    models = require('../models'),
    common = require('./common'),
    async = require('async'),
    JOIN_PRICE = 0;

var JoinResource = module.exports = common.GamificationMongooseResource.extend({
    init:function(){
        this._super(models.Join,'join_action', JOIN_PRICE);
        this.allowed_methods = ['get','post'];
        this.authentication = new common.SessionAuthentication();
        this.filtering = {discussion_id: null};
    },

    create_obj: function(req,fields,callback){
        var self = this;
        var action_id = req.body.action_id;
        var user_id = req.user._id;
        var g_action_obj;
        async.waterfall([

            function(cbk){
                models.Join.find({user_id: user_id, action_id: action_id}, cbk);
            },

            function(arr, cbk){
                if (arr.length){
                    cbk({message: "Error: user has already joined this action", code: 401}, null);

                }else{
                    models.Action.findById(action_id, cbk);
                }
            },

            function(action, cbk){
                g_action_obj = action;
                var join_object = new self.model();
                fields.user_id = user_id;
                fields.action_creator_id = action.creator_id;

                for(var field in fields)
                {
                    join_object.set(field,fields[field]);
                }

                self.authorization.edit_object(req, join_object, cbk);
            },

            function(join_obj, cbk){
                join_obj.save(function(err, result){
                    cbk(err, result);
                });
            },

            function(obj, cbk){
                models.Action.update({_id:action_id},{$addToSet: {going_users: user_id, users: user_id},$inc:{num_of_going: 1}}, function(err, result){
                    cbk(err, obj);
                });
            }
        ],function(err, obj){
            if(!err){
                g_action_obj.num_of_going++;
            }
            callback(err, g_action_obj);
        });
    }
});
