/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 03/04/12
 * Time: 11:41
 * To change this template use File | Settings | File Templates.
 */

var jest = require('jest'),
    util = require('util'),
    models = require('../models'),
    async = require('async'),
    common = require('./common'),
    _ = require('underscore');


/*
var ResourceObligation = module.exports = new common.GamificationMongooseResource.extend({

    init: function() {
        this._super(models.ResourceObligation, null, null);
        this.authentication = new common.SessionAuthentication();
        this.allowed_methods = ['get', 'post', 'put'];
//        this.update_fields = ["user_id", "action_id", "action_resources"];
    },

    create_obj: function(req, fields, callback){

        var self = this;
        var user = req.user;
        var user_id = user._id;

        fields.user_id = user_id;
        fields.first_name = user.first_name;
        fields.last_name = user.last_name;

        self._super(req,fields,callback);
    },

    update_obj: function(req, object, callback){
        var self = this;
        var user = req.user;
        var user_id = user._id;
        var action_resources = [];
        var exist = false;
        var obligation_obj = object;
        action_resources = req.action_resources;
        var obligation_action_resource;
        var need_to_save = false;

        async.forEach(action_resources, iterator, function(err, result){
            if(need_to_save){
                object.save(function(err, result){
                    callback(err, result);
                })
            }else{
                callback(err, result);
            }
        })

        var iterator = function(action_resource, itr_cbk){
//            var even = _.find([1, 2, 3, 4, 5, 6], function(num){ return num % 2 == 0; })
            var curr_obligation_action_resource =  _.find(object.action_resources, function(object){
                return object.name == action_resource.name;
            });

            if(curr_obligation_action_resource) {
                need_to_save = true;
                //update action "left_to_bring"
                async.waterfall([
                    function(cbk){
                        models.Action.findById(obligation_obj.action_id, cbk);
                    },

                    //find the action_resource in action and reduce from "left_to_bring"
                    function(action, cbk){
                        async.forEach(action.action_resources, itr, cbk);
                    },

                    //increase amount of resource in obligation
                    function(result, cbk){
                        object.amount += curr_obligation_action_resource.amount;
                    }
                ], itr_cbk);
            }else{
                //if resource is not already in obligation so just add it to set
                models.ResourceObligation.update({user_id: user_id, action_id: obligation_obj.action_id}, {$addToSet: {"action_resources": action_resource}})
            }
        }

        var itr = function(action_action_resource, itr_cbk){
            if(action_action_resource.name == obligation_action_resource.name){
                if(action_action_resource.left_to_bring >= obligation_action_resource.amount){
                    action_action_resource.left_to_bring -= obligation_action_resource.amount;
                    itr_cbk(null, 1);
                }else{
                    itr_cbk({message: "obligation resource amount is to big"}, null);
                }
            }else{
                itr_cbk
            }
        }
    }
})*/
