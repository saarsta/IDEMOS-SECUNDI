/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 28/03/12
 * Time: 11:59
 * To change this template use File | Settings | File Templates.
 */

var jest = require('jest'),
    util = require('util'),
    models = require('../../models'),
    common = require('../common.js'),
    async = require('async'),
    _ = require('underscore'),
    JOIN_PRICE = 0;

var JoinResource = module.exports = common.GamificationMongooseResource.extend({
    init:function(){


        this._super(models.Join,'join_action', /*common.getGamificationTokenPrice('join_action')*/ 0);
        this.allowed_methods = ['get','post'];
        this.authentication = new common.SessionAuthentication();
        this.filtering = {discussion_id: null, action_id: null};
        this.fields = {
            map_join_to_user: {
                _id : null,
                first_name : null,
                last_name : null,
                avatar: null,
                score : null,
                num_of_proxies_i_represent : null
            },
            num_of_going: null,
            is_going: null
        };
    },

    run_query: function(req,query,callback)
    {
        query.populate('user_id', {'_id':1, 'first_name':1, 'last_name':1, 'facebook_id':1, 'avatar': 1,'avatar_url':1, 'score':1, 'num_of_proxies_i_represent':1});
        this._super(req,query,callback);
    },

    //in the callback i want to put only the users
    get_objects: function (req, filters, sorts, limit, offset, callback) {

          this._super(req, filters, sorts, limit, offset, function(err, result){
              if(result.objects.length){
                  result.objects = _.map(result.objects, function(map_join_to_user){
                      return {
                          map_join_to_user: {
                              _id : map_join_to_user.user_id._id,
                              first_name : map_join_to_user.user_id.first_name,
                              last_name : map_join_to_user.user_id.last_name,
                              avatar : map_join_to_user.user_id.avatar_url(),
                              score : map_join_to_user.user_id.score,
                              num_of_proxies_i_represent : map_join_to_user.user_id.num_of_proxies_i_represent
                          }
                      }
                   });
                  callback(err, result);
              }else{
                  callback(err, result);
              }
        });
    },

    create_obj: function(req,fields,callback){
        var self = this;
        var action_id = req.body.action_id;
        var user_id = req.user._id;
        var g_action_obj;
        var join_id;

        async.waterfall([

            function(cbk){
                models.Join.findOne({user_id: user_id, action_id: action_id}, function(err, args){
                    cbk(err, args);
                });
            },

            function(join_obj, cbk){
                if(join_obj){
                    async.parallel([
                        //reduce action.num_of_going
                        function(cbk1){
                            models.Action.update({_id: action_id}, {$inc: {num_of_going: -1}}, cbk1);
                        },

                        function(cbk1){
                            join_obj.remove(function(err, obj){
                                cbk1(err, obj);
                            })
                        }
                    ], function(err, args){
                        if(err)
                            callback(err);
                        else{
                            req.gamification_type = "leave_action";
                            callback(err, {is_going: false});
                        }
                    })
                }else{
                    models.Action.findById(action_id, cbk);
                }
            },

            function(action, cbk){
                if(!action){
                   cbk("no such action_id");
                }else{
                    g_action_obj = action;
                    var join_object = new self.model();
                    fields.user_id = user_id;
                    fields.action_creator_id = action.creator_id;

                    for(var field in fields)
                    {
                        join_object.set(field,fields[field]);
                    }

                    self.authorization.edit_object(req, join_object, cbk);
                }
            },

            function(join_obj, cbk){
                join_obj.save(function(err, result){
                    join_id = join_obj._id;
                    cbk(err, result);
                });
            },

            function(obj, cbk){
                models.Action.update({_id: action_id},/*{$addToSet: {going_users: user_id, users: user_id},*/{$inc:{num_of_going: 1}}, function(err, result){
                    cbk(err, obj);
                });
            }
        ],function(err, obj){
            if(!err){
                g_action_obj.num_of_going++;
                g_action_obj = JSON.parse(JSON.stringify(g_action_obj));
                g_action_obj.map_join_to_user = req.user;
                g_action_obj.map_join_to_user.avatar = req.user.avatar_url(),
                g_action_obj.is_going = true;
                req.gamification_type = "join_action";
            }
            callback(err, g_action_obj);
        });
    }
});
