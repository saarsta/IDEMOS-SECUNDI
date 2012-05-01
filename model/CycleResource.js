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
    _ = require('underscore'),
    FOLLOW_CYCLE_PRICE = 1;

var CycleResource = module.exports = common.GamificationMongooseResource.extend({
    init: function(){
        this._super(models.Cycle, null, FOLLOW_CYCLE_PRICE);
        this.authentication = new common.SessionAuthentication();
        this.allowed_methods = ['get', 'put'];
        this.filtering = {tags: null};
        this.default_query = function(query){
            return query.populate("discussions");
        }

        this.fields = {
            document:null,
            title:null,
            users: {
                user_id:{
                    email:null,
                    first_name:null,
                    avatar_url:null
                },
                join_date:null
            },
            creation_date: null,
            text_field: null,
            text_field_preview: null,
            image_field: null,
            image_field_preview: null,
            tags:null,
            discussions: {
                _id: null,
                title: null,
                text_field: null,
                text_field_preview: null,
                image_field: null,
                image_field_preview: null,
                subject_id: null,
                creation_date: null,
                creator_id: null,
                first_name: null,
                last_name: null,
                vision_text_preview: null,
                vision_text: null,
                grade: null
            },
            is_hot_object: null,
            followers_count: null,
            num_of_comments: null,
            upcoming_action: null,
            num_upcoming_actions: null,
            is_follower: null
        }
    },

   /* run_query: function(req,query,callback)
    {
        if(req.params.cycle)
            query.populate('users.user_id');
        this._super(req,query,callback);
    },*/

    get_object:function (req, id, callback) {

        this._super(req, id, function(err, object){
            if(object){
                models.User.find({"cycles.cycle_id": id}, ["email", "first_name", "avatar", "facebook_id", "cycles"], function(err, objs){
                    var users = [];
                    if(!err){
                        object.users = _.map(objs, function(user){
                            var curr_cycle =  _.find(user.cycles, function(cycle){
                                    return cycle.cycle_id == id;
                            });
                            return {
                                user_id:user,
                                join_date: curr_cycle.join_date
                            };
                        });
                    }
                    else
                        object.users = [];
                    if(req.user){
                        object.is_follower = common.isArgIsInList(id, req.user.cycles);
                    }else{
                        object.is_follower = false;
                    }
                });

            }
            callback(err, object);
        })
    },

    get_objects: function (req, filters, sorts, limit, offset, callback) {

        if(req.query.get == "myUru"){
            filters.users = req.user._id;
        }

        this._super(req, filters, sorts, limit, offset, callback);
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

