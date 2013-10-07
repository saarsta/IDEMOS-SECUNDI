var jest = require('jest'),
    models = require('../models'),
    common = require('./common'),
    _ = require('underscore');

var UserMailNotificationConfig = module.exports = jest.MongooseResource.extend({
    init: function () {
        this._super(models.User, null);
        this.fields = _.extend({
            mail_notification_configuration: null,
            discussions: null
        }, common.user_public_fields);
        //this.update_fields = {discussions:null, mail_notification_configuration:null};
        this.allowed_methods = ['get', 'put'];
    },

    update_obj: function (req, object, callback) {
        var mail_settings = req.body;

        // i'm implementing it because of a terrible bug i can't understand in mongoose
        models.User.findById(object.id, function (err, user) {

            if  (mail_settings.activate){
                if(user.no_mail_notifications){
                    console.log("activating mail notifications for "+user.first_name+" "+user.last_name );
                    models.User.update({
                        _id: object.id
                    }, {
                        $set: {
                            no_mail_notifications : false,
                            "mail_notification_configuration.get_mails"  : true,
                            "mail_notification_configuration.get_alert_of_comments_for_all_discussions" :true ,
                            "mail_notification_configuration.get_alert_of_suggestions_for_all_discussions" : true  ,
                            "mail_notification_configuration.get_alert_of_approved_suggestions_for_all_discussions" :true ,
                            "mail_notification_configuration.get_cycles_new_updates":false,
                            "mail_notification_configuration.get_cycles_system_information":false,
                            "mail_notification_configuration.get_alert_of_new_action_for_all_cycles" :false,
                            "mail_notification_configuration.get_alert_of_approved_action_for_all_cycles":false,
                            "mail_notification_configuration.get_alert_of_new_posts_in_actions":false,
                            "mail_notification_configuration.get_weekly_mails":false
                        }
                    }, function (err) {
                        callback(err, {});
                    });
                }
            }
            else if (req.body.discussions) {

                // try to fix it later
                /*var json_user = JSON.parse(JSON.stringify(user));
                 var mail_settings = JSON.parse(JSON.stringify(req.body));
                 var bka = _.extend(json_user, mail_settings);*/

                var exist_discussion = _.find(user.discussions, function (discussion) {
                    return (discussion.discussion_id + "" == mail_settings.discussions[0].discussion_id + "")
                });
                if (exist_discussion) {
                    if (typeof mail_settings.discussions[0].get_alert_of_comments != "undefined")
                        exist_discussion._doc.get_alert_of_comments = mail_settings.discussions[0].get_alert_of_comments === 'true';
                    if (typeof mail_settings.discussions[0].get_alert_of_suggestions != "undefined")
                        exist_discussion._doc.get_alert_of_suggestions = mail_settings.discussions[0].get_alert_of_suggestions === 'true';
                    if (typeof mail_settings.discussions[0].get_alert_of_approved_suggestions != "undefined")
                        exist_discussion._doc.get_alert_of_approved_suggestions = mail_settings.discussions[0].get_alert_of_approved_suggestions === 'true';
                } else {
                    user.discussions.push(mail_settings.discussions[0]);
                }

                // update user
                models.User.update({
                    _id: object.id
                }, {
                    $set: {
                        discussions: user.discussions
                    }
                }, function (err) {
                    callback(err, {});
                });
            } else {

                /*if (req.body.all_discussions){
                 if(typeof mail_settings.all_discussions.get_alert_of_comments != "undefined") {
                 _.each(user.discussions, function(discussion) {
                 exist_discussion._doc.get_alert_of_comments = mail_settings.discussions[0].get_alert_of_comments === 'true';
                 })
                 }
                 if(typeof mail_settings.all_discussions.get_alert_of_suggestions != "undefined") {
                 _.each(user.discussions, function(discussion) {
                 exist_discussion._doc.get_alert_of_suggestions = mail_settings.discussions[0].get_alert_of_suggestions === 'true';
                 })
                 }
                 if(typeof mail_settings.all_discussions.get_alert_of_approved_suggestions != "undefined") {
                 _.each(user.discussions, function(discussion) {
                 exist_discussion._doc.get_alert_of_approved_suggestions = mail_settings.discussions[0].get_alert_of_approved_suggestions === 'true';
                 })
                 }

                 // update user
                 models.User.update({_id:object.id}, {$set: {discussions: user.discussions}}, function (err) {
                 callback(err, {});
                 });
                 }*/
                if (mail_settings.mail_notification_configuration && mail_settings.mail_notification_configuration.new_discussion) {
                    var exist_new_discussion = _.find(user.mail_notification_configuration.new_discussion, function (new_discussion) {
                        return (new_discussion.subject_id + "" == mail_settings.mail_notification_configuration.new_discussion[0].subject_id + "")
                    });

                    if (exist_new_discussion) {
                        if (typeof mail_settings.mail_notification_configuration.new_discussion[0].get_alert != "undefined")
                            exist_new_discussion._doc.get_alert = mail_settings.mail_notification_configuration.new_discussion[0].get_alert === 'true';
                    } else {
                        user.mail_notification_cocnfiguration.new_discussion.push(mail_settings.mail_notification_configuration.new_discussion[0]);
                    }

                    // update user
                    models.User.update({
                        _id: object.id
                    }, {
                        $set: {
                            "mail_notification_configuration.new_discussion": user.mail_notification_configuration.new_discussion
                        }
                    }, function (err) {
                        callback(err, {});
                    });
                } else if (req.body.cycles) {

                    var exist_cycle = _.find(user.cycles, function (cycle) {
                        return (cycle.cycle_id + "" == mail_settings.cycles[0].cycle_id + "")
                    });
                    if (exist_cycle) {
                        if (typeof mail_settings.cycles[0].get_alert_of_updates != "undefined")
                            exist_cycle._doc.get_alert_of_updates = mail_settings.cycles[0].get_alert_of_updates === 'true';
                        if (typeof mail_settings.cycles[0].get_alert_of_new_action != "undefined")
                            exist_cycle._doc.get_alert_of_new_action = mail_settings.cycles[0].get_alert_of_new_action === 'true';
                        if (typeof mail_settings.cycles[0].get_alert_of_approved_action != "undefined")
                            exist_cycle._doc.get_alert_of_approved_action = mail_settings.cycles[0].get_alert_of_approved_action === 'true';
                        if (typeof mail_settings.cycles[0].get_reminder_of_action != "undefined")
                            exist_cycle._doc.get_reminder_of_action = mail_settings.cycles[0].get_reminder_of_action === 'true';
                    } else {
                        user.cycles.push(mail_settings.cycles[0]);
                    }

                    // update user cycles
                    models.User.update({
                        _id: object.id
                    }, {
                        $set: {
                            cycles: user.cycles
                        }
                    }, function (err) {
                        callback(err, {});
                    });
                } else {
                    var path = {};

                    if (mail_settings.mail_notification_configuration) {
                        if (typeof mail_settings.mail_notification_configuration.get_mails != "undefined")
                            path = {
                                "mail_notification_configuration.get_mails": mail_settings.mail_notification_configuration.get_mails === 'true'
                            }
                        if (typeof mail_settings.mail_notification_configuration.get_uru_updates != "undefined")
                            path = {
                                "mail_notification_configuration.get_uru_updates": mail_settings.mail_notification_configuration.get_uru_updates === 'true'
                            }
                        if (typeof mail_settings.mail_notification_configuration.get_weekly_mails != "undefined")
                            path = {
                                "mail_notification_configuration.get_weekly_mails": mail_settings.mail_notification_configuration.get_weekly_mails === 'true'
                            }
                        if (typeof mail_settings.mail_notification_configuration.get_cycles_new_updates != "undefined")
                            path = {
                                "mail_notification_configuration.get_cycles_new_updates": mail_settings.mail_notification_configuration.get_cycles_new_updates === 'true'
                            }
                        if (typeof mail_settings.mail_notification_configuration.get_cycles_system_information != "undefined")
                            path = {
                                "mail_notification_configuration.get_cycles_system_information": mail_settings.mail_notification_configuration.get_cycles_system_information === 'true'
                            }
                        if (typeof mail_settings.mail_notification_configuration.get_alert_of_new_posts_in_actions != "undefined")
                            path = {
                                "mail_notification_configuration.get_alert_of_new_posts_in_actions": mail_settings.mail_notification_configuration.get_alert_of_new_posts_in_actions === 'true'
                            }


                        if (typeof mail_settings.mail_notification_configuration.get_alert_of_comments_for_all_discussions != "undefined") {
                            _.each(user.discussions, function (discussion) {
                                discussion._doc.get_alert_of_comments = mail_settings.mail_notification_configuration.get_alert_of_comments_for_all_discussions === 'true';
                            });
                            path = {
                                "mail_notification_configuration.get_alert_of_comments_for_all_discussions": mail_settings.mail_notification_configuration.get_alert_of_comments_for_all_discussions === 'true',
                                discussions: user.discussions
                            }
                        }
                        if (typeof mail_settings.mail_notification_configuration.get_alert_of_suggestions_for_all_discussions != "undefined") {
                            _.each(user.discussions, function (discussion) {
                                discussion._doc.get_alert_of_suggestions = mail_settings.mail_notification_configuration.get_alert_of_suggestions_for_all_discussions === 'true';
                            });
                            path = {
                                "mail_notification_configuration.get_alert_of_suggestions_for_all_discussions": mail_settings.mail_notification_configuration.get_alert_of_suggestions_for_all_discussions === 'true',
                                discussions: user.discussions
                            }
                        }
                        if (typeof mail_settings.mail_notification_configuration.get_alert_of_approved_suggestions_for_all_discussions != "undefined") {
                            _.each(user.discussions, function (discussion) {
                                discussion._doc.get_alert_of_approved_suggestions = mail_settings.mail_notification_configuration.get_alert_of_approved_suggestions_for_all_discussions === 'true';
                            });
                            path = {
                                "mail_notification_configuration.get_alert_of_approved_suggestions_for_all_discussions": mail_settings.mail_notification_configuration.get_alert_of_approved_suggestions_for_all_discussions === 'true',
                                discussions: user.discussions
                            }
                        }

                        if (typeof mail_settings.mail_notification_configuration.get_alert_of_new_action_for_all_cycles != "undefined") {
                            _.each(user.cycles, function (cycle) {
                                cycle._doc.get_alert_of_new_action = mail_settings.mail_notification_configuration.get_alert_of_new_action_for_all_cycles === 'true';
                            });
                            path = {
                                "mail_notification_configuration.get_alert_of_new_action_for_all_cycles": mail_settings.mail_notification_configuration.get_alert_of_new_action_for_all_cycles === 'true',
                                cycles: user.cycles
                            }
                        }
                        if (typeof mail_settings.mail_notification_configuration.get_alert_of_approved_action_for_all_cycles != "undefined") {
                            _.each(user.cycles, function (cycle) {
                                cycle._doc.get_alert_of_approved_action = mail_settings.mail_notification_configuration.get_alert_of_approved_action_for_all_cycles === 'true';
                            });
                            path = {
                                "mail_notification_configuration.get_alert_of_approved_action_for_all_cycles": mail_settings.mail_notification_configuration.get_alert_of_approved_action_for_all_cycles === 'true',
                                cycles: user.cycles
                            }
                        }
                    }
                    // update user
                    models.User.update({
                        _id: object.id
                    }, {
                        $set: path
                    }, function (err) {
                        callback(err, {
                            discussions: user.discussions
                        });
                    });
                }
            }
        })
    }
})