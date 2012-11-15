var resources = require('jest'),
    models = require('../../models'),
    async = require('async'),
    common = require('../common.js'),
    notifications = require('../notifications.js'),
    _ = require('underscore');

var BringResourceResource = module.exports = common.GamificationMongooseResource.extend({
    init: function () {
        this._super(models.Action, null, 0);
        this.allowed_methods = ['put'];
        this.authentication = new common.SessionAuthentication();
    },

    //update gets action_id, user_id and array of resources ids with amount to add or reduce

    update_obj: function (req, object, callback) {

        models.Action.findById(object._id, function(err, action){
            var action_resources = req.body.action_resources || [];
            var user = req.user;

            async.forEach(action_resources, function(action_resource_that_user_bring, itr_cbk){
                //find the resource in action --> action_resources
                var curr_resource = _.find(action.action_resources, function(action_resource){
                    return action_resource.resource + "" == action_resource_that_user_bring.id + "";
                })

                if(!curr_resource){
                    itr_cbk('no such resource!');
                    return;
                }
                curr_resource.left_to_bring = Number(curr_resource.left_to_bring);
                if(curr_resource.left_to_bring - action_resource_that_user_bring.amount > curr_resource.amount ||
                    curr_resource.left_to_bring - action_resource_that_user_bring.amount < 0
                    ){
                    itr_cbk('error with amount!');
                    return;
                }

                //set action-->action_resource
                curr_resource.left_to_bring -= Number(action_resource_that_user_bring.amount);

                //set action-->what_users_bring;

                //first check if user already brings this resource
                var curr_what_users_bring = _.find(action.what_users_bring, function(user_bring){
                    return (curr_resource.resource + "" == user_bring.resource + "") && (user._id + "" == user_bring.user_id + "")
                })

                if(curr_what_users_bring){
                    curr_what_users_bring.amount += Number(action_resource_that_user_bring.amount);
                    if(curr_what_users_bring.amount < 0)
                        itr_cbk('error with amount in uesr 1!');
                    else
                        itr_cbk();
                }else{
                    var new_what_users_bring = {
                        user_id: req.user._id,
                        amount: action_resource_that_user_bring.amount,
                        resource: action_resource_that_user_bring.id
                    }

                    if(action_resource_that_user_bring.amount < 0){
                        itr_cbk('error with amount in uesr 2!');
                    }else{
                        action.what_users_bring.push(new_what_users_bring);
                        var creator_id = action.creator_id;
                        if(action_resource_that_user_bring.amount > 0){
                            if(creator_id != new_what_users_bring.user_id)
                            {
                                notifications.create_user_notification("user_brings_resource_to_action_you_created", action._id,
                                    creator_id, new_what_users_bring.user_id, new_what_users_bring.resource, '/actions/' + action._id, function(err){
                                        itr_cbk(err);
                                    });
                            } else {
                                itr_cbk();
                            }
                        } else {
                            itr_cbk();
                        }

                    }
                }
            }, function(err, arg){
                if(!err){
                    action.save(function(err, result){
                        callback(err, result);
                    })
                }else{
                    callback(err);
                }
            })
        })

    }
})