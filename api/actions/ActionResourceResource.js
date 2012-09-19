
var resources = require('jest'),
    util = require('util'),
    models = require('../../models'),
    common = require('../common.js'),
    async = require('async');


var ActionResourceResource = module.exports = common.GamificationMongooseResource.extend({
    init: function(){
        this._super(models.ActionResource, null, 0);
        this.allowed_methods = ['get', 'post'];
        this.filtering = {category: null};
        this.authentication = new common.SessionAuthentication();
    },

    // 1. find action
    // 2. creates new action_resource with flag is_approved = false, so this resource wont be seen in the resource container untill admin set it to true
    // 3. add action resource to action

    create_obj: function(req, fields, callback){
        var object = new this.model();
        var self = this;
        var base = self._super;
        var action_id = req.body.action_id;
        var g_action;
        var g_action_resource;


        async.waterfall([
            function(cbk){
                models.Action.findById(action_id, cbk);
            },

            function(action, cbk){
                if(!action){
                    cbk('no such action');
                }else if (!req.body.action_resource){
                    cbk('no action_resource');
                }else{
                    g_action = action;

                    fields.is_approved = false;
                    for (var field in fields) {
                        object.set(field, fields[field]);
                    }

                    base.call(self, req, fields, cbk);
                }
            },

            function(action_resource, cbk){
                var g_action_resource = action_resource;

                var new_action_resource = {
                    resource: action_resource._id,
                    amount: req.body.amount,
                    left_to_bring: req.body.amount
                }

                g_action.action_resources.push(new_action_resource);

                g_action.save(function(err, obj){
                    cbk(err, obj);
                })
            }
        ], function(err, obj){
            callback(err, g_action_resource);
        })
    }
});
