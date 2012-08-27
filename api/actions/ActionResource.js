/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 06/03/12
 * Time: 17:23
 * To change this template use File | Settings | File Templates.
 */


var resources = require('jest'),
    models = require('../../models'),
    async = require('async'),
    common = require('../common.js'),
    _ = require('underscore');

var ActionResource = module.exports = common.GamificationMongooseResource.extend(
    {
        init:function () {
            this._super(models.Action, null, common.getGamificationTokenPrice('vote'));
            this.allowed_methods = ['get', 'post', 'put'];
            this.filtering = {cycle_id:null, is_approved:null, grade:null, num_of_going:null,
                'users.user_id':{
                    exact:true,
                    in:true
                }
            };
            this.authentication = new common.SessionAuthentication();
            this.fields = {
                _id:null,
                title:null,
                tooltip_or_title:null,
                text_field:null,
                text_field_preview:null,
                image_field:null,
                image_field_preview:null,
                description:null,
                creator_id:null,
                action_resources:null,
                tags:null,
                creation_date:null,
                execution_date:null,
                required_participants:null,
                grade:null,
                evaluate_counter:null,
//                is_follower: null,
                is_going:null,
                updated_user_tokens:null,
                join_id:null,
                num_of_going:null
            }
            this.default_query = function (query) {
                return query.sort({execution_date:'descending'});
            }
        },

        get_objects:function (req, filters, sorts, limit, offset, callback) {
            if (req.query.get == "myUru") {
                var user_id = req.query.user_id || req.user._id;
                filters['users.user_id'] = user_id;
            }

            this._super(req, filters, sorts, limit, offset, function (err, response) {


                // TODO i need to fix it for my uru
//                _.each(response.objects, function(object){
//                    object.is_going = false;
//                    if(req.user){
//                        var user_id = req.user._id;
//                        if(_.any(object.going_users, function(user){ user.user_id = user_id;})){
//                            object.is_going = true;
//                            models.Join.findOne({action_id: object._id, user_id: user_id}, function(err, join){
//                                if(!err)
//                                    object.join_id = join._id;
//                            })
//                        }
//                    }
//                });


                callback(err, response);
            });
        },

        create_obj:function (req, fields, callback) {
            var user_id = req.session.user_id;
            var self = this;
            var base = self.super();
            var action_object = new self.model();
            var user = req.user;

            var min_tokens = common.getGamificationTokenPrice('create_action') > -1 ? common.getGamificationTokenPrice('create_action') : 10;
//            var total_tokens = user.tokens + user.num_of_extra_tokens;

//            if(total_tokens <  min_tokens && total_tokens < min_tokens - (Math.min(Math.floor(user.gamification.tag_suggestion_approved/2), 2))){
//                callback({message: "user must have a least 10 tokens to open create discussion", code:401}, null);
//            }
//            else
//            {

//            async.waterfall([
//                function(cbk){
//                    fields.creator_id = user_id;
//                    fields.first_name = user.first_name;
//                    fields.last_name = user.last_name;
//                    fields.users = user_id;
//                    for (var field in fields) {
//                        action_object.set(field, fields[field]);
//                    }
//
//                    base.call(self, req, fields, cbk);
//                },
//
//                function(action_obj, cbk){
//                    var cycle_id = action_obj.cycle_id;
//
//                    async.parallel([
//                        function (cbk1) {
//                            req.gamification_type = "action";
//
//                            // add discussion_id and action_id to the lists in user
//                            var new_action = {
//                                action_id: action_obj._id,
//                                join_date: Date.now()
//                            }
//                            models.User.update({_id:user_id}, {$addToSet:{actions: new_action}}, cbk1)
//                        },
//
//                        function (cbk1) {
//                            models.Cycle.findById(cycle_id, cbk1);
//                        }
//                    ], cbk(err, args[1]);
//                },
//
//                function()
//            ])
//
//
//                        if (!err) {
//
//                            ], function (err, arg) {
//                                var cycle_obj = arg[1];
//
//                                 else {
//                                    cycle_obj.upcoming_action = action._id;
//                                    cycle_obj.save(callback(err, action));
//                                }
//                            })
//
//                        } else {
//                            callback(err, null);
//                        }
//                    });
//                }
//            });
        }
    });


