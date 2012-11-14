var j_forms = require('j-forms');
var models = require('../models');
var async = require('async');
_ = require('underscore');
var notifications = require('../api/notifications'),
    AdminForm = require('admin-with-forms').AdminForm;

module.exports = AdminForm.extend({
    actual_save : function(callback)
    {
        var self = this;
        var update = this.instance;
        var base = self._super;
        var cycle_id = this.data.cycle;
        var notified_user_ids = [];

        if(update.isNew){
            models.User.find({"cycles.cycle_id": cycle_id}, {'id': 1}, function(err, followers){
                if(!err){
                    notified_user_ids = _.map(followers, function(follower){return follower.id});
                    async.forEach(notified_user_ids, function(notified_user, itr_cbk){
                        notifications.create_user_notification("update_created_in_cycle_you_are_part_of", update._id,
                            notified_user, null, cycle_id, '/updates/' + update._id, function(err, result){
                                itr_cbk(err);
                            })
                    });
                }
            });
        }

        base.call(self,function(err,object) {
            console.log(err);
            console.log(self.errors);
            console.log(object);
            callback(err,object);
        });
    }
});
