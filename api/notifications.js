/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 13/05/12
 * Time: 13:19
 * To change this template use File | Settings | File Templates.
 */
var SEND_MAIL_NOTIFICATION = true;

var models = require('../models'),
    async = require('async'),
    notificationResource = require('./NotificationResource'),
    templates = require('../lib/templates'),
    mail = require('../lib/mail'),
    _ = require('underscore');


exports.create_user_notification = function (notification_type, entity_id, user_id, notificatior_id, sub_entity, url, no_mail,callback) {


    if(typeof no_mail === 'function' && typeof callback !== 'function'){
        callback = no_mail;
        no_mail = null;
    }

    var single_notification_arr = [
        "been_quoted",
        "new_discussion",
        "approved_info_item_i_created",
        "approved_change_suggestion_you_created",
        "approved_change_suggestion_on_discussion_you_are_part_of",
        "proxy_created_new_discussion",
        "proxy_created_change_suggestion",
        "action_suggested_in_cycle_you_are_part_of",
        "update_created_in_cycle_you_are_part_of",
        "action_added_in_cycle_you_are_part_of",
        "action_you_created_was_approved",
        "action_you_are_participating_in_was_approved",
        "user_brings_resource_to_action_you_created"
    ];

    var multi_notification_arr = [
        'comment_on_discussion_you_are_part_of',
        "comment_on_discussion_you_created",
        "post_added_to_action_you_joined",
        "post_added_to_action_you_created"
    ];

    if (notificatior_id && _.indexOf(single_notification_arr, notification_type) == -1) {

        async.waterfall([

            function (cbk) {
                notification_type = notification_type + "";
                if (_.contains(multi_notification_arr, notification_type) && sub_entity) {
                    models.Notification.findOne({type:notification_type, 'notificators.sub_entity_id':sub_entity, user_id:user_id}, function (err, obj) {
                        cbk(err, obj);
                    });
                }
                else if (entity_id)
                    models.Notification.findOne({type:notification_type, entity_id:entity_id, user_id:user_id}, function (err, obj) {
                        cbk(err, obj);
                    });
                else
                    models.Notification.findOne({type:notification_type, user_id:user_id}, function (err, obj) {
                        cbk(err, obj);
                    });
            },

            function (noti, cbk) {
                if (noti) {
                    noti.seen = false;

                    var date = Date.now();
                    //var last_update_date = noti.update_date;


                    //TODO change it later to something prettier
                    if ((_.contains(multi_notification_arr, notification_type)) &&
                        _.any(noti.notificators, function (notificator) {
                            return notificator.notificator_id + "" == notificatior_id + ""
                        })) {
                        var new_notificator = {
                            notificator_id:notificatior_id,
                            sub_entity_id:sub_entity
                        }
                        noti.notificators.push(new_notificator);
                        noti.update_date = date;
                        noti.save();
                        cbk(null, 0);
                    } else if (_.any(noti.notificators, function (notificator) {
                        return notificator.notificator_id + "" == notificatior_id + ""
                    })) {
                        noti.update_date = date;
                        noti.save();
                        cbk(null, 0);
                    } else {
                        var new_notificator = {
                            notificator_id:notificatior_id,
                            sub_entity_id:sub_entity
                        }
                        noti.notificators.push(new_notificator);
                        noti.update_date = date;
                        noti.save(function (err, obj) {
                            if (err)
                                console.error(err);
                            cbk(null, obj || noti);
                        });
                    }
                    sendNotificationToUser(noti);
                } else {
                    create_new_notification(notification_type, entity_id, user_id, notificatior_id, sub_entity, url, function (err, obj) {
                        cbk(err, obj);
                    });
                }
            }
        ], function (err, obj) {
            callback(err, obj);
        })
    }else {
        create_new_notification(notification_type, entity_id, user_id, notificatior_id, sub_entity, url, no_mail,function (err, obj) {
            callback(err, obj);
        });
    }
};

exports.create_user_proxy_vote_or_grade_notification = function (notification_type, entity_id, user_id, notificatior_id, sub_entity, is_agree, grade_or_balance, callback) {

    async.waterfall([

        function (cbk) {
            notification_type = notification_type + "";
            models.Notification.findOne({type:notification_type, "entity_id":entity_id, user_id:user_id}, cbk);
        },

        function (noti, cbk) {
            if (noti) {

                if (notification_type == "proxy_graded_change_suggestion")
                    noti.notificators[0].ballance = is_agree ? 1 : -1;
                else
                    noti.notificators[0].ballance = grade_or_balance;

                //var last_update_date = noti.update_date;
                noti.update_date = Date.now();
                noti.seen = false;

                if (notification_type == "proxy_vote_to_post" && noti.notificators[0].ballance == 0) {
                    noti.remove(function (err, obj) {
                        cbk(err, obj);
                    })
                } else {
                    noti.save(function (err, obj) {
                        cbk(err, obj);
                        sendNotificationToUser(noti);
                    });
                }

            }
            else {
                var notification = new models.Notification();
                var balance;
                if (notification_type == "proxy_graded_change_suggestion")
                    balance = is_agree ? 1 : -1;
                else
                    balance = grade_or_balance;

                var notificator = {
                    notificator_id:notificatior_id,
                    sub_entity_id:sub_entity,
                    ballance:balance
                }

                notification.user_id = user_id;
                notification.notificators = notificator;
                notification.type = notification_type;
                notification.entity_id = entity_id;
                notification.seen = false;
                notification.update_date = new Date();

                notification.save(function (err, obj) {
                    if (err){
                        console.error(err);
                        console.log(notification.entity_id, "entity_id");
                        console.log(notification.notificators[0].sub_entity_id, "sub_entity_id");
                    }
                    cbk(null, obj || notification);
                    if (!err && obj)
                        sendNotificationToUser(obj);
                });
            }
        }
    ], function (err, obj) {
        callback(err, obj);
    })
};

var create_new_notification = function (notification_type, entity_id, user_id, notificatior_id, sub_entity_id, url, no_mail, callback) {

    if(typeof no_mail === 'function' && typeof callback !== 'function'){
        callback = no_mail;
        no_mail = null;
    }

    var notification = new models.Notification();
    var notificator = {
        notificator_id:notificatior_id,
        sub_entity_id:sub_entity_id
    };

    notification.user_id = user_id;
    notification.notificators = notificator;
    notification.type = notification_type;
    notification.entity_id = entity_id;
    notification.url = url;
    notification.seen = false;
    notification.update_date = new Date();
    notification.visited = true;

    notification.save(function (err, obj) {
        if (err)
            console.error(err);
        callback(null, obj || notification);
        if (!err && obj && !no_mail)
            sendNotificationToUser(obj);
    });
};

/***
 * Send notification to user through mail or other external API
 * Checks if user should receive notification according to settings
 * @param notification
 * Notification object
 * @param last_update_date
 * notification last update date, or null if the notification is new
 * @param callback
 * function(err)
 */
var sendNotificationToUser = function (notification) {
    /**
     * Waterfall:
     * 1) Check if user has visited the notification page since the last mail
     * 2) Get user email
     * 3)
     *  3.1) check for user notification configuration
     *  3.2) notification populate references by notification typeChecks if user should be notified, populate references by notification type
     * 4) create text message
     * 5) send message
     */

    var email;
    var  uru_group = [
        /*'saarsta@gmail.com',*/
        'konfortydor@gmail.com',
        'aharon@uru.org.il',
        'poaharon@gmail.com',
        'aharon.porath@gmail.com',
        'liorur@gmail.com',
        'maya@uru.org.il',
        'urip@uru.org.il',
        'tahel@uru.org.il',
        'yoni@uru.org.il',
        'noa@uru.org.il',
        'uri@uru.org.il',
        'noa@uru.org.il',
        'yoni@uru.org.il',
        'tahel@uru.org.il',
        'maya@uru.org.il',
        'Adi@uru.org.il',
        'aya@uru.org.il',
        'shay@uru.org.il',
        'liat@uru.org.il'
    ];

    if (SEND_MAIL_NOTIFICATION)
        async.waterfall([
            //1) had user visited the notification page since the last mail
            function (cbk) {

                // if any of the notifications of this entity and user id is false, user wont get the notification, when he enters the
                // entity id page all notifications will be visited = true
                models.Notification.findOne({user_id: notification.user_id + "", url: notification.url, visited: false}, function(err, noti) {
                    if(err || noti){
                        console.log('user should not receive notification because he or she have not visited since');
                        cbk('break');
                        return;
                    }else{
                        cbk();
                    }
                });
            },
            // 2) Get user email
            function (cbk) {
                models.User.findById(notification.user_id._doc ? notification.user_id.id : notification.user_id, cbk);
            },
            // 3.1) check for user notification configuration
            // 3.2) notification populate references by notification type
            function (user, cbk) {
                if (!user) {
                    cbk("user not found");
                    return;
                }else{
                    models.User.find({"discussions.discussion_id" : "51163023533d920200000025"}, function(err, users){
                        cbk(err, user, users);
                    });
                }
            },

            function(user, users, cbk){
                //TODO just for debugging
                email = user.email;

                if(!_.any(uru_group, function(mail) { return email === mail }) && !_.any(users, function(user) { return email === user.email })) {
                    cbk('we send mail only to uru_group for now');
                    return
                }
                // 3.1) check for user notification configuration
                if  (!isNotiInUserMailConfig(user, notification)){
                    console.log('user should not receive notification because his/her notification mail configuration');
                    cbk("break");
                    return;
                }else{
                    // 3.2) notification populate references by notification type
                    email = user.email;
                    notificationResource.populateNotifications({objects:[notification]}, user.id, function(err, result){
                        cbk(err, result);
                    });
                }
            },
            // 4) create text message
            function (results, cbk) {
                var notification = results.objects[0];
                notification.entity_name = notification.name || '';
                notification.description_of_notificators = notification.description_of_notificators || '';
                notification.message_of_notificators = notification.message_of_notificators || '';
                templates.renderTemplate('notifications/' + notification.type, notification, function(err, result){
                    cbk(err, result);
                });
            },
            // 5) send message
            function (message, cbk) {
                mail.sendMailFromTemplate(email, message, cbk);
            }
        ],
            // Final
            function (err) {
                if (err) {
                    if (err != 'break') {
                        /*console.error('failed sending notification to user');
                        console.error(err);
                        console.trace();*/
                    }
                }
                else {
                    console.log('email ' + notification.type + ' sent to ' + email);
                    notification.visited = false;
                    notification.mail_was_sent = true;

                    notification.save(function (err) {
                        if (err) {
                            console.error('saving notification flag failed');
                        }
                    });
                }
            });
};

exports.create_user_vote_or_grade_notification = function (notification_type, entity_id, user_id, notificatior_id, sub_entity, vote_for_or_against, did_change_the_sugg_agreement, is_on_suggestion, url, callback) {
    async.waterfall([

        function (cbk) {
            notification_type = notification_type + "";
            models.Notification.findOne({type:notification_type, entity_id:entity_id, user_id:user_id}, function (err, result) {
                cbk(err, result)
            });
        },

        function (noti, cbk) {
            if (noti) {

                noti.seen = false;
                //this tow lines tries to prevant a bug that i dont understand
                if (!noti.user_id) {
                    console.log("user id wasnt in noti in create_user_vote_or_grade_notification!");
                    noti.user_id = user_id;
                }
                var date = Date.now();

                var notificator = _.find(noti.notificators, function (notificator) {
                    return notificator.notificator_id + "" == notificatior_id + ""
                });
                if (notificator) {
                    if (did_change_the_sugg_agreement) {
                        notificator.ballance += vote_for_or_against == "add" ? 2 : -2;
                        if (is_on_suggestion) {
                            notificator.votes_for += vote_for_or_against == "add" ? 1 : -1;
                            notificator.votes_against += vote_for_or_against == "add" ? -1 : 1;
                        }
                    }
                    else {
                        notificator.ballance += vote_for_or_against == "add" ? 1 : -1;

                        if (is_on_suggestion) {
                            notificator.votes_for += vote_for_or_against == "add" ? 1 : 0;
                            notificator.votes_against += vote_for_or_against == "add" ? 0 : 1;
                        }
                    }
                } else {
                    var new_notificator = {
                        notificator_id:notificatior_id,
                        sub_entity_id:sub_entity,
                        ballance:vote_for_or_against == "add" ? 1 : -1,
                        votes_for:vote_for_or_against == "add" && is_on_suggestion ? 1 : 0,
                        votes_against:vote_for_or_against == "add" && is_on_suggestion ? 0 : 1
                    }
                    noti.entity_id = entity_id;

                    noti.notificators.push(new_notificator);
                }

                //when user votes to post and get to balance 0, i delete this notification
                if ((notification_type == "user_gave_my_post_tokens" || notification_type == "user_gave_my_post_bad_tokens")
                    && (notificator ? notificator.ballance == 0 : false)) {
                    noti.remove(function (err, result) {
                        cbk(err, result);
                    })
                } else {
                    //var last_update_date = noti.update_date;
                    noti.update_date = date;
                    noti.save(function (err, obj) {
                        cbk(err, obj);
                        if (!err && obj)
                            sendNotificationToUser(obj);
                    })
                }
            } else {
                var notification = new models.Notification();
                var notificator = {
                    notificator_id:notificatior_id,
                    sub_entity_id:sub_entity,
                    ballance:vote_for_or_against == "add" ? 1 : -1,
                    votes_for:vote_for_or_against == "add" && is_on_suggestion ? 1 : 0,
                    votes_against:vote_for_or_against == "add" && is_on_suggestion ? 0 : 1
                }

                if (!user_id)
                    console.log("user id wasnt in noti in create_user_vote_or_grade_notification!")

                notification.user_id = user_id;
                notification.notificators = notificator;
                notification.type = notification_type;
                notification.entity_id = entity_id;
                notification.url = url;
                notification.seen = false;
                notification.update_date = new Date();

                notification.save(function (err, obj) {
                    if (err)
                        console.error(err);
                    cbk(null, obj || noti);
                    if (!err && obj)
                        sendNotificationToUser(obj);
                });
            }
        }
    ], function (err, obj) {
        callback(err, obj);
    })
}

exports.update_user_notification = function (notification_type, obj_id, user, callback) {


}

exports.updateVisited = function (user, url) {
    models.Notification.update({user_id:user._id, url:url}, {$set:{visited:true}}, {multi:true}, function (err) {
        if (err) {
            console.error('failed setting notification visited to true', err);
        }
    })
};

function isNotiInUserMailConfig(user, noti){

    if (!user._doc.mail_notification_configuration.get_mails) return false;

    // discussions notification
    if (noti.type === "comment_on_discussion_you_are_part_of" || noti.type === "comment_on_discussion_you_created"){
        // check if should get mail and when
        var discussion = _.find(user.discussions, function(discussion){ return discussion.discussion_id + "" == noti.notificators[0].sub_entity_id });

        if (!discussion || discussion.get_alert_of_comments !== true) return false;

        if (discussion.time_of_alert === 'now') {
            return true;
        }else{
            updateNotificationToSendMail(noti);
            return false;
        }
    }

    if (noti.type === "change_suggestion_on_discussion_you_are_part_of" || noti.type === "change_suggestion_on_discussion_you_created"){
        // check if should get mail and when
        var discussion = _.find(user.discussions, function(discussion){ return discussion.discussion_id + "" == noti.notificators[0].sub_entity_id });

        if (!discussion) return false;

        // this way i guarantee that by default this is true
        if (discussion.get_alert_of_suggestions === false) return false;

        if (discussion.time_of_alert === 'now') {
            return true;
        }else{
            updateNotificationToSendMail(noti);
            return false;
        }
    }

    if (noti.type === "approved_change_suggestion_on_discussion_you_are_part_of"){
        // check if should get mail and when
        var discussion = _.find(user.discussions, function(discussion){ return discussion.discussion_id + "" == noti.notificators[0].sub_entity_id });

        if (!discussion) return false;

        console.log('*******');
        console.log(discussion.discussion_id);
        console.log('*******');

        console.log('*******');
        console.log(user.first_name);
        console.log('*******');

        console.log('*******');
        console.log(discussion);
        console.log('*******');

        console.log('*******');
        console.log(discussion.get_alert_of_approved_suggestions);
        console.log('*******');

        console.log('**********');
        console.log(discussion.get_alert_of_approved_suggestions === false);
        console.log('**********');

        if (discussion.get_alert_of_approved_suggestions === false) return false;

        if (discussion.time_of_alert === 'now') {
            return true;
        }else{
            updateNotificationToSendMail(noti);
            return false;
        }
    }

    // in this case we created a site notification only if user set it in the config
    if (noti.type === "new_discussion") return true;

    if (noti.type === "approved_change_suggestion_you_created") return true;


    // cycles notification

    if (noti.type === "action_suggested_in_cycle_you_are_part_of") {
        // check if should get mail and when
        var cycle = _.find(user.cycles, function(cycle){ return cycle.cycle_id + "" == noti.notificators[0].sub_entity_id });

        if (!cycle) return false;

        if (cycle.get_alert_of_new_action !== false) return false;

        if (cycle.time_of_alert === 'now') {
            return true;
        }else{
            updateNotificationToSendMail(noti);
            return false;
        }
    }

    if (noti.type === "action_added_in_cycle_you_are_part_of") {
        // check if should get mail and when
        var cycle = _.find(user.cycles, function(cycle){ return cycle.cycle_id + "" == noti.notificators[0].sub_entity_id });

        if (!cycle) return false;

        if (cycle.get_alert_of_approved_action !== false) return false;

        if (cycle.time_of_alert === 'now') {
            return true;
        }else{
            updateNotificationToSendMail(noti);
            return false;
        }
    }

    if (noti.type === "action_you_created_was_approved") return true;

    // actions

    if(noti.type === "get_alert_of_new_posts_in_actions") return user.mail_notification_configuration.get_alert_of_new_posts_in_actions;
    return false;
}

function updateNotificationToSendMail(noti){
    models.Notification.update({_id: noti._id}, {$set: {mail_was_sent: false}}, function(err, num){
        if(err){
            console.error("could not set notification mail_was_sent flag to false");
            console.error(err);
        }
    })
}

//approved_info_item_i_created
if (/notifications\.js/.test(process.argv[1])) {
    var app = require('../app');

    console.log('testing');
    //function(notification_type, entity_id, user_id, notificatior_id, sub_entity_id, callback){
    //4f90064e360b9b01000000ac --info item
    //4fcdf7180a381201000005b3 --disc

    //a_dicussion_created_with_info_item_that_you_created
    //  sub //4fce400ccdd0570100000216

    //501fcef1e6ae520017000662 --הצעה לשינוי שהתקבלה
    setTimeout(function () {
        create_new_notification('comment_on_discussion_you_created',
            '4fcdf7180a381201000005b3', '4ff1b29aabf64e440f00013a', '4f45145968766b0100000002', '501fcef1e6ae520017000662', function (err) {
                console.log(err);
            });

    }, 1000);
}