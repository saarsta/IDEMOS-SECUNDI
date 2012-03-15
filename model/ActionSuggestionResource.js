/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 12/03/12
 * Time: 18:38
 * To change this template use File | Settings | File Templates.
 */


var common = require('./common'),
    util  = require('util'),
    jest = require('jest'),
    models = require('../models'),
    async = require('async');

ActionSuggestionResource = module.exports = common.GamificationMongooseResource.extend({

    init: function(){
        this._super(models.ActionSuggestion, 'action_suggestion');
        this.allowed_methods = ['get', 'post'];
    },

    create_obj:  function(req, fields, callback){
        var user_id = req.session.user_id;
        var g_user = null;
        var self = this;
        var action_suggestion = new this.model();

        async.waterfall([
            function(cbk){
                models.User.findById({id: user_id}, cbk);
            },

            function(user, cbk){
                g_user = user;
                fields.creator_id = user_id;
                fields.first_name = user.first_name;
                fields.last_name = user.last_name;

                for (var field in fields){
                    action_suggestion.set(field, fields[field]);
                }

                self.Authorization.edit_object(req, action_suggestion, cbk);
            },

            function (action,cbk) {

                async.parallel([
                    function(cbk2)
                    {
                        // insert circle to user.circles

                    },

                    function(cbk2)
                    {
                        // increase circles.followers

                    },

                    function(cbk2)
                    {
                        action.save(function(err, action_sugg){
                            cbk(err, action_sugg);
                        });
                    }
                ], cbk);
            },

            function(args, cbk){
                g_user.save(function(err, user){
                    cbk(err, user);
                });
            }
        ], function(err, callback){
            callback(self.elaborate_mongoose_errors(err), action_suggestion);
        });
    }
});
