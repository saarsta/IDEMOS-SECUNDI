
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

    create_obj: function(req, fields, callback){

        var self = this;
        var object = new self.model();
        var action_id = req.body.action_id;
        var amount = req.body.amount;
        var g_action_resource;
        var g_action;

        async.waterfall([

            function(cbk){
                models.Action.findById(action_id, cbk);
            },

            function(action, cbk){
                g_action = action;

                fields.is_approved = false;
                //all action resources of action have the same category..
                fields.category = action.action_resources[0].category;

                for (var field in fields) {
                    object.set(field, fields[field]);
                }

                self._super(req, fields, cbk);
            },

            function(cbk, action_resource){

                var new_action_resource = {
                    resource : action_resource._id,
                    amount: amount,
                    left_to_bring: amount
                }

                g_action.action_resources.push(new_action_resource);
                g_action.save(function(err, action){ cbk(err, action) })
            }
        ], function(err, hi){
            callback(err, g_action_resource);
        })
    }
})


