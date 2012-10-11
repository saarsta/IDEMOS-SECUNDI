
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
        var object = new this.model(),
            self = this,
            base = self._super,

            user_id = req.body.user_id,
            action_id = req.body.action_id,
            name = req.body.name,
            category = req.body.category,
            amount = req.body.amount || 1,
            amountBringing = req.body.amountBringing || 0;


        if (!action_id && !category) {
            return callback('An action or category must be specified.');
        } else if (!name) {
            return callback('A name must be specified.');
        }

        async.waterfall([

            //find action
            function(callback) {
                if (action_id) {
                    models.Action.findById(action_id, callback);
                } else {
                    callback(null, null);
                }
            },

            //create new action_resource
            function (action, callback) {
                if (action_id && !action) {
                    return callback('no such action');
                }

                fields.name = name;
                fields.is_approved = false;
                fields.category = action ? action.category : category;

                base.call(self, req, fields, function (err, resource) {
                    callback(err, action, resource);
                });
            },


            /*  1. push new action_resource to action_resources[]
                2. if user brings the resource that was just created, update what_users_bring and push it to action what_users_bring[]
             */

            function (action, resource, callback) {
                if (!action) {
                    return callback(null, resource);
                }

                action.action_resources.push({
                    resource: resource.id,
                    amount: amount,
                    left_to_bring: amount
                });

                if(amountBringing >= 0 && amount - amountBringing >= 0)
                {
                    action.what_users_bring.push({
                        user_id: user_id,
                        amount: amountBringing,
                        resource: resource.id
                    });

                    var curr_resource = _.find(action.action_resources, function(action_resource){
                        return action_resource.resource + "" == resource.id + "";
                    })
                    curr_resource.left_to_bring -= Number(amountBringing);
                }

                action.save(function (err) {
                    callback(err, resource);
                });
            }
        ], callback);
    }
});
