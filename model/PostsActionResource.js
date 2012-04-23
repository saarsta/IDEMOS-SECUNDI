/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 23/02/12
 * Time: 12:03
 * To change this template use File | Settings | File Templates.
 */

var resources = require('jest'),
    util = require('util'),
    models = require('../models'),
    common = require('./common'),
    async = require('async'),
    POST_PRICE = 1;

var PostActionResource = module.exports = common.GamificationMongooseResource.extend({
    init:function () {

        this._super(models.PostAction, 'post_action');
        this.allowed_methods = ['get', 'post'];
        this.authorization = new common.TokenAuthorization();
        this.authentication = new common.SessionAuthentication();
        this.filtering = {action_id:null};
        this.default_query = function (query) {
            return query.sort('creation_date', 'descending');
        };
//    this.validation = new resources.Validation();=
    },

    create_obj:function (req, fields, callback) {

        var user_id = req.session.user_id;
        var self = this;
        var post_object = new self.model();
        var user = req.user;

        async.waterfall([

            function(cbk){
                fields.creator_id = user_id;
                fields.first_name = user.first_name;
                fields.last_name = user.last_name;

                for (var field in fields) {
                    post_object.set(field, fields[field]);
                }
                self.authorization.edit_object(req, post_object, cbk);
                g_user = user;
            },

            function(post_object, cbk){

                var action_id = post_object.action_id;
                post_object.save(function(err,result,num)
                {
                    cbk(err,result);
                });
            },
            function (object,cbk) {
                var action_id = object.action_id;
                //if post created successfuly, add user to action
                // + add action to user
                //  + take tokens from the user
                async.parallel([
                    function(cbk2)
                    {
                        models.Action.update({_id:object.action_id}, {$addToSet: {users: user_id}}, cbk2);

                    },
                    function(cbk2)
                    {
                        // add action_id to the list of actions in user
                        user.tokens -= POST_PRICE;
                        if (common.isArgIsInList(object.action_id, user.actions) == false) {
                            user.actions.push(object.action_id);
                        }
                        user.save(function(err,result)
                        {
                            cbk2(err,result);
                        });
                    }
                ],
                    cbk);

            }
        ],function(err,result)
        {
            callback(self.elaborate_mongoose_errors(err), post_object);
        });
    }
});


