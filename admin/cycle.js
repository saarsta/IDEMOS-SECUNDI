
var j_forms = require('j-forms');
var async = require('async');
var models = require('../models');
var notifications = require('../api/notifications')
    ,AdminForm = require('admin-with-forms').AdminForm;

module.exports = AdminForm.extend({
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
            async.waterfall([
                function(cbk){
                    models.Discussion.findById(discussion_id, cbk);
                },

                function(disc, cbk){
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
                        
                        //cycle shopping cart is the all the discussions items
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
                        }
                    ], cbk);
                }
            ], itr_cbk)
        }

        if(cycle.isNew){
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