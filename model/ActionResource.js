/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 06/03/12
 * Time: 17:23
 * To change this template use File | Settings | File Templates.
 */


var resources = require('jest'),
    util = require('util'),
    models = require('../models'),
    async = require('async'),
    common = require('./common');

    ACTION_PRICE = 2;

var ActionResource = module.exports = common.GamificationMongooseResource.extend(
{
    init: function(){
        this._super(models.Action, null);
        this.allowed_methods = ['get', 'post', 'put'];
        this.filtering = {category: null, cycle_id: null, is_approved:null, tokens:null};
        this.authentication = new common.SessionAuthentication();
        this.authorization = new common.TokenAuthorization();
    },

    create_obj: function(req,fields,callback){
        var user_id = req.session.user_id;
        var self = this;
        var action_object = new self.model();

        models.User.findById(user_id,function(err,user){
            if(err)
            {
                callback(err, null);
            }
            else
            {
                fields.creator_id = user_id;
                fields.first_name = user.first_name;
                fields.last_name = user.last_name;
                fields.users = user_id;
                for(var field in fields)
                {
                    action_object.set(field,fields[field]);
                }
                self.authorization.edit_object(req, action_object, function(err, action_obj)
                {
                    if(err) callback(err);
                    else
                    {
                        var cycle_id = action_obj._doc.cycle_id;
                        action_obj.save(function(err,action)
                        {
                            if (!err){
                                req.gamification_type = "action";
                                user.tokens -= ACTION_PRICE;
                                // add discussion_id and action_id to the lists in user
                                models.User.update({_id:user_id},{$addToSet: {cycles: cycle_id, actions: action._doc._id}},function(err, object)
                                {
                                    if (err){
                                        callback(self.elaborate_mongoose_errors(err), null);
                                    }
                                });
                                user.save(function(err, object){
                                    callback(self.elaborate_mongoose_errors(err), action);
                                });
                            }else{
                                callback(self.elaborate_mongoose_errors(err), null);
                            }
                        });
                    }
                });
            }
        });
    },

    //this happens when user clicks the Join button, the user get the action id, and action
    update_obj:function (req, object, callback) {
        var self = this;
        var user_id = req.session.user_id;
        var action_id = req._id;
        var inc_num_of_going_to_action = {};
        inc_num_of_going_to_action['num_of_going'] = 1;

        async.waterfall([

            function(cbk){
                models.User.findById(user_id, cbk);
            },

            function(user_obj, cbk){
                models.Action.findById(action_id, cbk);
            },

            function(action_obj, cbk){
                if (common.isArgIsInList(user_id, action_obj.going_users) == false){

                        async.parallel([

                            function(cbk2){
                                models.Action.update({_id:action_id},{$addToSet: {going_users: action_id}}, cbk2);
                            },

                            function(cbk2){
                                models.Action.update({_id: action_id}, {$inc: inc_num_of_going_to_action}, function(err, data){
                                    var a = 8;
                                })
                            },

                            function(cbk2){
                                models.User.update({_id:user_id},{$addToSet: {actions: action_id}}, cbk2);
                            }

                        ], cbk);
                }
            }
        ], function(err, result){
            req.gamification_type = "join_action";
            callback(self.elaborate_mongoose_errors(err), object);
        });
    }
});


