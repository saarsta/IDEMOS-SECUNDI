/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 24/04/12
 * Time: 14:29
 * To change this template use File | Settings | File Templates.
 */
var action = require('./ActionResource.js'),
    models = require('../../models'),
    _= require('underscore');


var ActionPopulatedResource = module.exports = action.extend(
    {
        init:function () {
            this._super();
            this.allowed_methods = ['get'];
            this.default_query = function(query){
                return query.populate("cycle_id").populate("going_users.user_id");
            }
        },

        get_object: function (req, id, callback) {
            this._super(req, id, function(err,object)
            {
                _.sortBy(object.users,function(user)
                {
                    return user.num_of_extra_tokens;
                })
                callback(err,object);
            });
        }
    }
);
