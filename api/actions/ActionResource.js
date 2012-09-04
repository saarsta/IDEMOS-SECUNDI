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
            this.default_query = function (query) {
                return query.sort({"execution_date.date":'descending'});
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
            var base = self._super;
            var action_object = new self.model();
            var user = req.user;
            var g_action;

            var min_tokens = common.getGamificationTokenPrice('create_action') > -1 ? common.getGamificationTokenPrice('create_action') : 10;
//            var total_tokens = user.tokens + user.num_of_extra_tokens;

//            if(total_tokens <  min_tokens && total_tokens < min_tokens - (Math.min(Math.floor(user.gamification.tag_suggestion_approved/2), 2))){
//                callback({message: "user must have a least 10 tokens to open create discussion", code:401}, null);
//            }
//            else
//            {

            async.waterfall([
                function(cbk){
                    fields.creator_id = user_id;
                    fields.first_name = user.first_name;
                    fields.last_name = user.last_name;
                    fields.users = {user_id: user_id, join_date: Date.now()};
                    for (var field in fields) {
                        action_object.set(field, fields[field]);
                    }

                    base.call(self, req, fields, cbk);
                },

                function(action_obj, cbk){
                    g_action = action_obj;
                    var cycle_id = action_obj.cycle_id;

                    async.parallel([
                        function (cbk1) {
                            req.gamification_type = "action";

                            // add discussion_id and action_id to the lists in user
                            var new_action = {
                                action_id: action_obj._id,
                                join_date: Date.now()
                            }
                            models.User.update({_id:user_id}, {$addToSet:{actions: new_action}}, cbk1)
                        },

                        function (cbk1) {
                            models.Cycle.findById(cycle_id, cbk1);
                        }
                    ], function(err, args){
                        cbk(err, args[1]);
                    })
                },

                function(cycle, cbk){
                    if (cycle.upcoming_action) {
                        async.waterfall([
                            function (cbk1) {
                                models.Action.findById(cycle.upcoming_action, cbk1);
                            },

                            function (upcoming_action, cbk1) {

                                if (upcoming_action.execution_date.date > g_action.execution_date.date) {
                                    cycle.upcoming_action = g_action._id;
                                    cycle.save(cbk1);
                                }else{
                                    cbk1(null, null);
                                }
                            }
                        ], function(err, action){
                            cbk(err, action)})
                    } else {
                        cycle.upcoming_action = g_action._id;
                        cycle.save(function(err, cycle){
                            cbk(err, g_action)
                        });
                    }
                }
            ], function(err, action){
                callback(err, action);
            })
        }
    });


