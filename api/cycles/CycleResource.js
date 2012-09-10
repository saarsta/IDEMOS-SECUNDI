/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 13/03/12
 * Time: 16:22
 * To change this template use File | Settings | File Templates.
 */


var jest = require('jest'),
    util = require('util'),
    models = require('../../models'),
    common = require('../common.js'),
    async = require('async'),
    _ = require('underscore');

var CycleResource = module.exports = common.GamificationMongooseResource.extend({
    init: function(){
        this._super(models.Cycle, null, 0);
        this.authentication = new common.SessionAuthentication();
        this.allowed_methods = ['get', 'put'];
        this.filtering = {
            tags: {
                exact:true,
                in:true,
                regex:true
            },
            'users.user_id': {
                exact:true,
                in:true
            }
        };

        this.default_query = function(query){
            return query.populate("discussions.discussion");
        };
        this.fields = {
            _id:null,
            document:null,
            title:null,
            tooltip_or_title:null,
//            users: /*{
//                user_id:{
//                    email:null,
//                    first_name:null,
//                    avatar_url:null
//                },
//                join_date:null*/
//            },
            followers_users: null,
           /* users: {
                user_id: null,
                join_date: null
            },*/
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
                grade: null
            },
            is_hot_object: null,
            followers_count: null,
            num_of_comments: null,
            upcoming_action:{
                _id: null,
                title: null,
                execution_date: null,
                num_of_going: null
            },
            num_upcoming_actions: null,
            participants_count: null,
            is_follower: null
        }
    },

    run_query: function(req,query,callback)
    {
        if(req.params.cycle){
            query.populate('users.user_id');
        }else{
            if (!(req.query.get == "myUru"))
                query.populate('upcoming_action');
        }


        this._super(req,query,callback);
    },

    get_object: function (req, id, callback) {
        this._super(req, id, function(err, object){
            if(object){
                object.is_follower = false;
                object.discussion = object.discussions[0]; //for now we have only one discussion for cycle
                models.User.find({"cycles.cycle_id": id}, {"_id":1, "username":1, "email":1, "first_name":1, "avatar":1, "facebook_id":1, "cycles":1}, function(err, objs){
                    var followers_users = [];
                    if(!err){
                        object.followers_users = _.map(objs, function(user){
                            user.avatar = user.avatar_url();
                            var curr_cycle =  _.find(user.cycles, function(cycle){
                                    return cycle.cycle_id == id;
                            });
                            return {
                                user_id: {username: user.username, first_name: user.first_name, avatar: user.avatar, _id: user._id},
                                join_date: curr_cycle.join_date
                            };
                        });
                    }
                    else
                        object.followers_users = [];
                    if(req.user)
                        object.is_follower = _.any(req.user.cycles, function(cycle){cycle._id + "" == id + ""});
                    callback(err, object);
                });

            }else{
                callback(err, object);
            }
        })
    },

    get_objects: function (req, filters, sorts, limit, offset, callback) {
        if(req.query.get == "myUru"){
            var user_id = req.query.user_id || req.user._id;
            filters['users.user_id'] = user_id;
        }


        this._super(req, filters, sorts, limit, offset, function(err, results){
            var user_cycles;

            if(req.user)
                user_cycles = req.user.cycles;

            _.each(results.objects, function(cycle){
                cycle.participants_count = cycle.users.length;
                cycle.is_follower = false;
                if(user_cycles){
                    if(_.find(user_cycles, function(user_cycle){ return user_cycle.cycle_id + "" == cycle._id + ""; })){
                        cycle.is_follower = true;
                    }
                }
            })

            callback(err, results);
        });
    },


    //happens when user want to become a cycle follower or to leave it
    update_obj: function(req, object, callback){
        var user = req.user;
        var cycle_id = object._id;
        object.is_follower = false;




        var wants_to_leave = _.any(user.cycles, function(cycle){ return cycle.cycle_id + "" == cycle_id + ""});

        if(!wants_to_leave){
            if (!(_.any(user.cycles, function(cycle){ return cycle.cycle_id == cycle_id + ""}))){
                async.parallel([
                    function(cbk2){
                        models.User.update({_id: req.user._id}, {$addToSet: {cycles: {cycle_id:cycle_id, join_date:Date.now()}}}, cbk2);
                    },

                    function(cbk2){
                        //connected somehow pepole
                        var is_new_connected = _.any(object.users, function(user_){ return req.user._id + "" == user_.user_id + ""});

                        if(!is_new_connected){
                            var user = {user_id: req.user._id, join_date: Date.now()}
                            models.Cycle.update({_id: cycle_id}, {$inc: {followers_count: 1},  $addToSet: {users: user}}, cbk2);
                        }else
                            models.Cycle.update({_id: cycle_id}, {$inc: {followers_count: 1}}, cbk2);
                    }
                ], function(err, obj){
                    object.followers_count++;
                    object.is_follower = true;
                    object.participants_count = object.users.length + 1;
                    callback(err, object);
                });
            }else{
                callback({message:"user is already a follower", code:401}, null);
            }
        }else{
            if(wants_to_leave){

                var flag = false;
                for (var i = 0; i < user.cycles.length; i++){
                    if (cycle_id + ""  == user.cycles[i].cycle_id + ""){
                        //remove cycle
                        user.cycles.splice(i);
                        flag = true;
                        break;
                    }
                }

                if(flag){

                    async.waterfall([
                        function(cbk){
                            user.save(function(err, user_obj){
                                cbk(err, cbk);
                            })
                        },

                        function(obj, cbk){
                            models.Cycle.update({_id: cycle_id}, {$inc: {followers_count: -1}}, function(err, num){
                                cbk(err, num);
                            });
                        }
                    ], function(err, obj){
                        object.followers_count--;
                        object.is_follower = false;
                        object.participants_count = object.users.length;

                        callback(err, object);
                    })
                }else{
                    callback({message:"user is not a follower", code:401}, null);
                }
            }else{
                callback({message:"no such request", code:400}, null);
            }
        }
    }
});


var isArgIsInList1 = function(cycle_id, cycle_list_schema, method){
    var flag = false;
    for (var i = 0; i < cycle_list_schema.length; i++){
        cycle_id = cycle_id + "" || cycle_id;
        if (cycle_id  == cycle_list_schema[i].cycle_id + ""){
            if(method == "remove")
            {
                //remove cycle
                cycle_list_schema.splice(i);

            }
            flag = true;
            break;
        }
    }
    return flag;
};

var isArgIsInList2 = function(cycle_id, cycle_list_schema){
    var flag = false;
    for (var i = 0; i < cycle_list_schema.length; i++){
        cycle_id = cycle_id.id || cycle_id;
        if (cycle_id  == cycle_list_schema[i].cycle_id){
            flag = true;
            break;
        }
    }
    return flag;
};