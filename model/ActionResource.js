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
    common = require('./common'),
    _ = require('underscore');

var ActionResource = module.exports = common.GamificationMongooseResource.extend(
    {
        init:function () {
            this._super(models.Action, null, common.getGamificationTokenPrice('vote'));
            this.allowed_methods = ['get', 'post', 'put'];
            this.filtering = {cycle_id:null, is_approved:null, grade:null, num_of_going: null,
                'users.user_id': {
                    exact:true,
                    in:true
                }
            };
            this.authentication = new common.SessionAuthentication();
            this.fields = {
                _id: null,
                title: null,
                text_field: null,
                text_field_preview: null,
                image_field: null,
                image_field_preview: null,
                description: null,
                creator_id: null,
                creator_id: null,
                action_resources: null,
                tags: null,
                creation_date: null,
                execution_date: null,
                required_participants: null,
                grade: null,
                evaluate_counter: null,
                is_follower: null,
                updated_user_tokens: null,
                join_id: null
            }
            this.default_query = function(query){
                return query.sort('execution_date','descending');
            }
        },

        get_objects: function (req, filters, sorts, limit, offset, callback) {
            var user_id = req.query.user_id || req.user._id;
            if(req.query.get == "myUru"){
                filters['users.user_id'] = user_id;
            }

            this._super(req, filters, sorts, limit, offset, function(err, response){
                var user_id;

                _.each(response.objects, function(object){
                    object.is_follower = false;
                    if(req.user){
                        user_id = req.user._id;
                        if(_.any(object.going_users, function(user){ user.user_id = user_id;})){
                            object.is_follower = true;
                            models.Join.findOne({action_id: object._id, user_id: user_id}, function(err, join){
                                if(!err)
                                    object.join_id = join._id;
                            })
                        }
                    }
                });
                callback(err, response);
            });
        },

        create_obj:function (req, fields, callback) {
            var user_id = req.session.user_id;
            var self = this;
            var action_object = new self.model();
            var user = req.user;

            var min_tokens = /*common.getGamificationTokenPrice('create_action')*/ 10;
//            var total_tokens = user.tokens + user.num_of_extra_tokens;

//            if(total_tokens <  min_tokens && total_tokens < min_tokens - (Math.min(Math.floor(user.gamification.tag_suggestion_approved/2), 2))){
//                callback({message: "user must have a least 10 tokens to open create discussion", code:401}, null);
//            }
//            else
//            {
                fields.creator_id = user_id;
                fields.first_name = user.first_name;
                fields.last_name = user.last_name;
                fields.users = user_id;
                for (var field in fields) {
                    action_object.set(field, fields[field]);
                }
                self.authorization.edit_object(req, action_object, function (err, action_obj) {
                    if (err) callback(err);
                    else {
                        var cycle_id = action_obj._doc.cycle_id;
                        action_obj.save(function (err, action) {
                            if (!err) {
                                async.parallel([
                                    function(cbk){
                                        req.gamification_type = "action";
                                        //user.tokens -= ACTION_PRICE;
                                        // add discussion_id and action_id to the lists in user
                                        models.User.update({_id:user_id}, {$addToSet:{/*cycles: cycle_id, */actions: action._doc._id}}, cbk)
                                    },

                                    function(cbk){
                                        models.Cycle.findById(cycle_id, cbk);
                                    }

                                ], function(err, arg){
                                    var cycle_obj = arg[1];

                                    if (cycle_obj.upcoming_action){
                                        async.waterfall([
                                            function(cbk){
                                                models.Action.findById(cycle_obj.upcoming_action, cbk);
                                            },

                                            function(action2, cbk){
                                                if(action2.execution_date > action.execution_date){
                                                    cycle_obj.upcoming_action = action._id;
                                                    cycle_obj.save(cbk);
                                                }
                                            }
                                        ], callback(err, action))
                                    }else{
                                        cycle_obj.upcoming_action = action._id;
                                        cycle_obj.save(callback(err, action));
                                    }
                                })

                            } else {
                                callback(self.elaborate_mongoose_errors(err), null);
                            }
                        });
                    }
                });
//            }
        }

        //i have added Join Resource instead
        /* //this happens when user clicks the Join button, the user get the action id, and action
         update_obj:function (req, object, callback) {
         var self = this;
         var user_id = req.session.user_id;
         var action_id = req._id;


         async.waterfall([

         function(cbk){
         models.Action.findById(action_id, cbk);
         },

         function(action_obj, cbk){
         if (common.isArgIsInList(user_id, action_obj.going_users) == false){

         async.parallel([

         function(cbk2){
         models.Action.update({_id:action_id},{$addToSet: {going_users: user_id, users: user_id},$inc:{num_of_going: 1}}, cbk2);
         },

         function(cbk2){
         models.User.update({_id:user_id},{$addToSet: {actions: action_id}}, cbk2);
         }

         ], cbk);
         }else{
         cbk({message:"user has already joined this action",code:401}, null);
         }
         }
         ], function(err, result){
         req.gamification_type = "join_action";
         callback(self.elaborate_mongoose_errors(err), object);
         });
         }*/
    });


