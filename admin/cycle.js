
var j_forms = require('j-forms');
var async = require('async');
var models = require('../models');
var notifications = require('../api/notifications')
    ,AdminForm = require('admin-with-forms').AdminForm;

module.exports = AdminForm.extend({
    init:function(request,options,model) {
        this._super(request,options,model);


        this.static['js'].push('/node-forms/js/autocomplete.js');
    },
    get_fields: function() {
        this._super();
        if(this.fields['discussions'])
            this.fields['discussions'].validators.push(function(arr) {
                return arr.length ? true : 'You must select at least one discussion';
            });
        if(this.fields['subject'])
            this.fields['subject'].validators.push(function(arr) {
                return arr.length ? true : 'You must select at least one subject';
            });
    },

    actual_save : function(callback)
    {
        var self = this;
        var base = this._super;


        var cycle = this.instance;

        var creator_id;
        var score = 0;
        var notification_type = 'aprroved_discussion_i_created';

        var iterator = function(discussion_id, itr_cbk){
            console.log('inside iterator');

            async.waterfall([
                function(cbk){
                    models.Discussion.findById(discussion_id.id, function(err, disc){
                        cbk(err, disc);
                    });
                },

                function(disc, cbk){

                    if(disc){
                        creator_id = disc.creator_id;
                        async.parallel([
                            function(cbk2){
                                models.Discussion.update({_id: discussion_id}, {$set: {
                                        "is_cycle.flag": true,
                                        "is_cycle.date": Date.now()}},
                                    cbk2);
                            },

                            function(cbk2){
                                models.User.update({_id: creator_id}, {
                                        $inc: {"gamification.approved_discussion_to_cycle": 1,
                                            "score": score}},
                                    cbk2);
                            }/*,
                             //TODO
                             function(cbk2){
                             notifications.create_user_notification(notification_type, cycle._id, creator_id, cbk);
                             }*/

                            //cycle shopping cart is all the discussions items
                            ,function(cbk2){
                                models.InformationItem.find({discussions: discussion_id}, function(err, information_items){
                                    async.forEach(information_items, function(info_item, itr_cbk){
                                        if(!_.any(info_item.cycles, function(info_cycle){return info_cycle._id + "" == cycle._id + ""})){
                                            models.InformationItem.update({_id: info_item._id}, {$addToset: {cycles: cycle._id}}, function(err, num){
                                                itr_cbk(err, num);
                                            })
                                        }else{
                                            itr_cbk();
                                        }
                                    }, cbk2);
                                })
                            },

                            //set users that connected somehow to the discussion to be cycle followers
                            function(cbk2){
                                console.log('cbk2 1');
                                async.forEach(disc.users, function(user_that_connected_to_cycle, itr_cbk){
                                    models.User.findById(user_that_connected_to_cycle, function(err, user){
                                        console.log('cbk2 2');
                                        if(!_.any(user.cycles, function(user_cycle){ return user_cycle.cycle_id + "" == cycle._id })){
                                            var new_cycle_follower = {
                                                cycle_id: cycle._id,
                                                join_date: Date.now()
                                            }

                                            user.cycles.push(new_cycle_follower);
                                            user.save(function(err, obj){
                                                console.log('saving user to cycle');
                                                console.log(obj.first_name);
                                                itr_cbk(err, obj);
                                            });
                                        }else{
                                            console.log('cbk2 3');
                                            itr_cbk();
                                        }
                                    })
                                }, cbk2);
                            }
                        ], cbk);
                    }else{
                        itr_cbk();
                    }
                }
            ], itr_cbk)
        }

        if((!this.data.is_hidden && cycle.is_hidden) && (this.data.is_hidden && !cycle.is_hidden)){
            //if condition true is_hidden was changed and "cycle.is_hidden" is what was before the change
            var err_string = "";
            models.Action.find({cycle_id: cycle._id}, function(err, actions){
                _.each(actions, function(action){ if(action.is_hidden == cycle.is_hidden){
                    err_string += action.title;
                    err_string += action.is_hidden ? " is hidden" : " is not hidden";
                }})
            })
        }

        if(err_string){
            alert(err_string);
            callback("is hidden err");
        }else
            if(cycle.isNew){
                console.log('length of discussions is.....');
                console.log(cycle.discussions.length);

                for(var field_name in self.clean_values)
                    self.instance.set(field_name,self.clean_values[field_name]);

                self.clean_values = {};


                async.forEach(cycle.discussions, iterator, function(err, result){
                    if(err)
                        callback(err);
                    else
                        base.call(self,callback);
                });
            }else{
                this._super(callback);
            }
    }
});