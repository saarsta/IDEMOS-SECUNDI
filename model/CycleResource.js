/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 13/03/12
 * Time: 16:22
 * To change this template use File | Settings | File Templates.
 */


var jest = require('jest'),
    util = require('util'),
    models = require('../models'),
    common = require('./common'),
    async = require('async'),
    FOLLOW_CYCLE_PRICE = 1;

var CycleResource = module.exports = common.GamificationMongooseResource.extend({
    init: function(){
        this._super(models.Cycle, null, FOLLOW_CYCLE_PRICE);
        this.authentication = new common.SessionAuthentication();
        this.allowed_methods = ['get', 'put'];
        this.filtering = {tags: null};
        this.default_query = function(query){
            return query.populate("discussion_id");
        }

    },

    //happens when user want to become a cycle follower
    update_obj: function(req, object, callback){
        var user = req.user;
        var cycle_id = req._id;
        var g_cycle_obj = null;

        async.waterfall([
            function(cbk){
                models.Cycle.findById(cycle_id, cbk);
            },

            function(cycle_obj, cbk){
                g_cycle_obj = cycle_obj;
                if (common.isArgIsInList(cycle_id, user.cycles) == false){
                    async.parallel([
                        function(cbk2){
                            models.User.update({_id: user._id}, {$addToSet: {cycles: cycle_id}}, cbk2);
                        },

                        function(cbk2){
                            models.Cycle.update({_id: cycle_id}, {$inc: {followers_count: 1},  $addToSet: {users: user._id}}, cbk2);
                        }
                    ], cbk);
                }else{
                    cbk({message:"user is already a follower",code:401}, null);
                }
            }
        ],function(err, result){
            callback(err, g_cycle_obj);
        });
    }
});

