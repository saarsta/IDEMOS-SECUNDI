var async = require('async');
var models = require('../models');
var notifications = require('../api/notifications');
var formage_admin = require('formage-admin'),
    Forms = formage_admin.forms,
    AdminForm = formage_admin.AdminForm;

module.exports = AdminForm.extend({
    init: function (request, options, model) {
        this._super(request, options, model);


        this.timeline_data = {};
    },

    prepareTimeline: function (callback) {
        // GET THE DATA FROM THE DB
        this.timeline_data['check_me'] = true;
        // set the field value
        this.data.check_me = true;
        callback();

//        // GET THE DATA FROM THE DB
//        var my_cycle_id = this.instance.id;
//        var cycle = this;
//        cycle.data.actions = {};
//        cycle.timeline_data.actions = {};
//        models.Action.find({"cycle_id.cycle": my_cycle_id, is_approved: true})
//            .select({'_id': 1, 'title': 1, 'cycle_id': 1})
//            .exec(function(err, actions){
//                if(!err){
//                    actions = JSON.parse(JSON.stringify(actions));
//                    async.forEach(actions, function(action){
//                        var is_displayed = false;
//                        async.forEach(action.cycle_id, function(index, cycle_id){
//                            if(cycle_id.cycle == my_cycle_id){
//                                is_displayed = cycle_id.is_displayed;
//                            }
//                        })
//                        cycle.timeline_data.actions['action' + action._id] = {id: null, title: null, is_displayed: null};
//                        cycle.timeline_data.actions['action' + action._id].id = action._id;
//                        cycle.timeline_data.actions['action' + action._id].title = action.title;
//                        cycle.timeline_data.actions['action' + action._id].is_displayed = is_displayed;
//
//                        // set the field value
//                        cycle.data.actions['action' + action._id] = cycle.timeline_data.actions['action' + action._id];
//                    })
//                }
//                callback();
//            })
    },

    render_ready: function (callback) {
        var self = this;
        var base = self._super;
        self.prepareTimeline(function (err) {
            if (err)
                callback(err);
            else
                base.call(self, callback);
        });
    },

    save: function (callback) {
        var self = this;
        var base = self._super;
        self.prepareTimeline(function (err) {
            if (err)
                callback(err);
            else
                base.call(self, callback);
        });
    },

    get_fields: function () {
        this._super();
        if (this.fields['discussions'])
            this.fields['discussions'].validators.push(function (arr) {
                return arr.length ? true : 'You must select at least one discussion';
            });
        if (this.fields['subject'])
            this.fields['subject'].validators.push(function (arr) {
                return arr.length ? true : 'You must select at least one subject';
            });

        // create a checkbox field
        this.fields['check_me'] = new Forms.fields.BooleanField();

        // add the checkbox field to the upper level
        this.fieldsets[0].fields.push('check_me');
    },

    actual_save: function (callback) {
        var self = this;
        var base = this._super;


        var cycle = this.instance;

        var creator_id;
        var score = 0;

        var iterator = function (discussion_id, itr_cbk) {
            console.log('inside iterator');

            //noinspection JSUnresolvedFunction
            async.waterfall([
                function (cbk) {
                    models.Discussion.findById(discussion_id.id, function (err, disc) {
                        cbk(err, disc);
                    });
                },

                function (disc, cbk) {

                    if (disc) {
                        creator_id = disc.creator_id;
                        //noinspection JSUnresolvedFunction
                        async.parallel([
                            function (cbk2) {
                                models.Discussion.update({_id: discussion_id}, {$set: {
                                        "is_cycle.flag": true,
                                        "is_cycle.date": Date.now()}},
                                    cbk2);
                            },

                            function (cbk2) {
                                models.User.update({_id: creator_id}, {
                                        $inc: {"gamification.approved_discussion_to_cycle": 1,
                                            "score": score}},
                                    cbk2);
                            }

                            //cycle shopping cart is all the discussions items
                            , function (cbk2) {
                                models.InformationItem.find({discussions: discussion_id}, function (err, information_items) {
                                    async.forEach(information_items, function (info_item, itr_cbk) {
                                        if (!_.any(info_item.cycles, function (info_cycle) {return info_cycle._id + "" == cycle._id + ""})) {
                                            models.InformationItem.update({_id: info_item._id}, {$addToset: {cycles: cycle._id}}, function (err, num) {
                                                itr_cbk(err, num);
                                            })
                                        } else {
                                            itr_cbk();
                                        }
                                    }, cbk2);
                                })
                            },

                            //set users that connected somehow to the discussion to be cycle followers
                            function (cbk2) {
                                console.log('cbk2 1');
                                async.forEach(disc.users, function (user_that_connected_to_cycle, itr_cbk) {
                                    models.User.findById(user_that_connected_to_cycle, function (err, user) {
                                        console.log('cbk2 2');
                                        if (!_.any(user.cycles, function (user_cycle) { return user_cycle.cycle_id + "" == cycle._id })) {
                                            var new_cycle_follower = {
                                                cycle_id: cycle._id,
                                                join_date: Date.now()
                                            };

                                            user.cycles.push(new_cycle_follower);
                                            user.save(function (err, obj) {
                                                console.log('saving user to cycle');
                                                console.log(obj.first_name);
                                                itr_cbk(err, obj);
                                            });
                                        } else {
                                            console.log('cbk2 3');
                                            itr_cbk();
                                        }
                                    })
                                }, cbk2);
                            }
                        ], cbk);
                    } else {
                        itr_cbk();
                    }
                }
            ], itr_cbk)
        };



        // SAVE TIMELINE STUFF TO DB
        if (cycle.isNew) {
            console.log('length of discussions is.....');
            console.log(cycle.discussions.length);

            self.clean_values.forEach(function (field_name) { self.instance.set(field_name, self.clean_values[field_name]); });
            self.clean_values = {};

            async.forEach(cycle.discussions, iterator, function (err) {
                if (err) throw err;
                base.call(self, callback);
            });
        } else {
            var is_cycle_hidden_when_save = this.data.is_hidden ? true : false;
            //check if is_hidden flag was changed to true
            if (is_cycle_hidden_when_save && !cycle.is_hidden) {
                // if cycle is now hidden
                models.Action.find({"cycle_id.cycle": cycle._id}, function (err, actions) {
                    if (err) throw err;
                    if (_.any(actions, function (action) { return action.is_hidden != is_cycle_hidden_when_save })) {
                        console.error("trying to save cycle as hidden when one of the action is not hidden");
                        callback("trying to save cycle as hidden when one of the action is not hidden");
                    } else {
                        base.call(self, callback);
                    }
                })
            } else {
                this._super(callback);
            }
        }
    }
});
