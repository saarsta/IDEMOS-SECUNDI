

var jest = require('jest')
    ,models = require('../../models')
    ,common = require('../common')
    ,async = require('async')
    ,_ = require('underscore');

var CycleTimelineResource = module.exports = jest.Resource.extend({
    init:function(){
        this._super();
        this.allowed_methods = {
            get: {
                list:null
            }
        };
        this.authentication = new common.SessionAuthentication();
        this.filtering = {};
        this.sorting = {};
    },

    get_objects:function(req,filters,sorts,limit,offset,callback)
    {
        var arr = [];
        var cycle_id = req.query.cycle_id;
        async.parallel([
            function(cbk){
                    models.Cycle.findById(cycle_id, function(err, cycle){
                    if(!err){
                        var objs = [];
                        if(cycle){
                            _.each(cycle.admin_updates, function(admin_update){
                                if(admin_update){
                                    var obj = {
                                        type: "admin_update",
                                        text: admin_update.info,
                                        date: admin_update.date,
                                        is_displayed: admin_update.is_displayed
                                    }
                                    objs.push(obj);
                                }
                            })

                            if(cycle.due_date){
                                var obj = {
                                    type: "due_date",
                                    date: cycle.due_date
                                }
                                objs.push(obj);
                            }

                            var obj = {
                                type: "cycle_creation",
                                date: cycle.creation_date.date,
                                is_displayed: cycle.creation_date.is_displayed
                            }

                            objs.push(obj);

                            //set date to today after midnight
                            var date = new Date();
                            date.setHours(0,0,1,0);
                            //set date to one sec after midnight
                            var new_date = new Date(date.getTime() + 3 * 1000 *60 * 60);

                            var obj = {
                                type: "today",
                                date: new_date
                            }

                            objs.push(obj);

                            var discussion = _.find(cycle.discussions, function(discussion){ return discussion.is_main == true});
                            if(discussion){
                                models.Discussion.findById(discussion.discussion)
                                    .select({'_id': 1, 'title': 1, 'text_field_preivew': 1, 'image_field_preview': 1, 'creation_date': 1, 'is_displayed': 1})
                                    .exec(function(err, discussion_obj){
                                        if(!err && discussion_obj){
                                            discussion_obj = JSON.parse(JSON.stringify(discussion_obj));
                                            discussion_obj.type = "discussion";
                                            discussion_obj.date = discussion_obj.creation_date;
                                            objs.push(discussion_obj);
                                        }

                                        cbk(err, objs);
                                    });
                            }else
                                cbk(null, objs);

                        }
                    }else
                        cbk(err, objs);
                });
            },

            function(cbk){
                models.Update.find({cycle: cycle_id})
                    .select({'_id': 1, 'title': 1, 'text_field_preview': 1, 'text_field': 1, 'image_field': 1, 'creation_date': 1, 'is_displayed': 1})
                    .exec(function(err, updates){

                        updates = JSON.parse(JSON.stringify(updates));

                        if(!err){
                            _.each(updates, function(update){
                                update.type = "cycle_update";
                                update.date = update.creation_date;
                            })
                        }

                    cbk(err, updates);
                });
            },

            function(cbk){
                models.Action.find({"cycle_id.cycle": cycle_id, is_approved: true})
                    .select({'_id': 1, 'title': 1, 'text_field_preview': 1, 'image_field_preview': 1, 'going_users': 1, 'num_of_going': 1, 'location': 1, 'execution_date': 1, 'category':1, 'cycle_id': 1})
                    .populate('category')
                    .exec(function(err, actions){
                    if(!err){
                        actions = JSON.parse(JSON.stringify(actions));
                        _.each(actions, function(action){
                            action.type = "action";
                            action.date = action.execution_date.date;
                            action.duration = action.execution_date.duration;
                            _.each(action.cycle_id, function(cycle){
                                if(cycle.cycle == cycle_id)
                                {
                                    action.cycle = cycle.cycle;
                                    action.is_displayed = cycle.is_displayed;
                                }
                            })
                            if(action.category && action.category.name != "אחר")
                            {
                                    action.category = action.category.name;
                            }
                            else
                            {
                                action.category = "פעולה";
                            }
                            if(action.num_of_going < 0)
                            {
                                action.num_of_going = action.going_users ? action.going_users.length : 0;
                            }
                            //put "is_going" true/false on each action
                            action.is_going = req.user ? _.any(action.going_users, function(going_user){return going_user.user_id + "" == req.user._id + ""}) : false;
                        })
                    }
                    cbk(err, actions);
                });
            }

        ], function(err, args){

            arr = _.union.apply(_,args);
            _.each(arr, function(item){ item.date = new Date(item.date)})
            arr = _.sortBy(arr, function(item){ return Math.min(item.date);  });


            callback(null,{meta:{total_count: arr.length}, objects: arr});
        });
    }
});
