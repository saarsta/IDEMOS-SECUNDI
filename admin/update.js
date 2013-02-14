var models = require('../models');
var async = require('async');
_ = require('underscore');
var notifications = require('../api/notifications'),
    AdminForm = require('formage-admin').AdminForm;

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
                    // verify that there are no duplicated followers
                    notified_user_ids = _.chain(followers)
                        .map(function(follower){return follower.id})
                        .compact()
                        .uniq()
                        .value();

                    async.forEach(notified_user_ids, function(notified_user, itr_cbk){

                        // TODO add if get_alert_of_updates == true

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
