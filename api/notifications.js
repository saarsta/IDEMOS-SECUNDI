/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 13/05/12
 * Time: 13:19
 * To change this template use File | Settings | File Templates.
 */

var models = require('../models'),
    async = require('async'),
    notificationResource = require('./NotificationResource'),
    templates = require('../lib/templates'),
    mail = require('../lib/mail'),
    _ = require('underscore');



exports.create_user_notification = function(notification_type, entity_id, user_id, notificatior_id, sub_entity, callback){

    var single_notification_arr = ["been_quoted", "approved_info_item_i_created", "approved_change_suggestion_you_created", "approved_change_suggestion_you_graded"];

    if(notificatior_id && _.indexOf(single_notification_arr, notification_type) == -1){

        async.waterfall([

            function(cbk){
                notification_type = notification_type + "";
                if(entity_id)
                    models.Notification.findOne({type: notification_type, entity_id: entity_id, user_id: user_id, seen: false}, cbk);
                else
                    models.Notification.findOne({type: notification_type, user_id: user_id, seen: false}, cbk);

            },

            function(noti, cbk){
                if(noti){
                    var date = Date.now();
//                    it doesnt work !!!
//                    models.Notification.update({id: noti._id}, {$addToSet: {notificators: notificatior_id}, $set:{update_date: Date.now()}}, function(err, num){
//                        cbk(err, num);
//                    });

                   if(_.any(noti.notificators,  function(notificator){return notificator.notificator_id + "" == notificatior_id + ""})) {
                     cbk(null, 0);
                   }else{
                       var new_notificator = {
                           notificator_id: notificatior_id,
                           sub_entity_id: sub_entity
                       }
                       noti.notificators.push(new_notificator);
                       noti.update_date = date;
                       noti.save(function(err, obj){
                           cbk(err, obj);
                       })
                   }
                }else{
                    create_new_notification(notification_type, entity_id, user_id, notificatior_id, sub_entity, function(err, obj){
                        cbk(err, obj);
                    });
                }
            }
        ], function(err, obj){
            callback(err, obj);
        })
    }else{
        create_new_notification(notification_type, entity_id, user_id, notificatior_id, sub_entity, function(err, obj){
            callback(err, obj);
        });
    }
}

var create_new_notification = function(notification_type, entity_id, user_id, notificatior_id, sub_entity_id, callback){

    var notification = new models.Notification();
    var notificator = {
        notificator_id: notificatior_id,
        sub_entity_id: sub_entity_id
    };

    notification.user_id = user_id;
    notification.notificators = notificator;
    notification.type = notification_type;
    notification.entity_id = entity_id;
    notification.seen = false;
    notification.update_date = new Date();

    notification.save(function(err, obj){
        callback(err, obj);
        if(!err && obj)
            sendNotificationToUser(obj);
    });
};

/***
 * Send notification to user through mail or other external API
 * @param notification
 * Notification object
 * @param callback
 * function(err)
 */
var sendNotificationToUser = function(notification,callback) {
    /**
     * Waterfall:
     * 1) Get user email
     * 2) populate references by notification type
     * 3) create text message
     * 4) send message
     */
    var email;
    async.waterfall([
        // 1) Get user email
        function(cbk) {
            models.User.findById(notification.user_id,['email'],cbk);
        },
        // 2) populate references by notification type
        function(user, cbk) {
            email = user.email;
            notificationResource.populateNotifications({objects:[notification]},cbk);
        },
        // 3) create text message
        function(results,cbk) {
            var notification = results.objects[0];
            notification.entity_name = notification.name || '';
            templates.renderTemplate('notifications/' + notification.type,notification,cbk);
        },
        // 4) send message
        function(message,cbk) {
            mail.sendMailFromTemplate(email,message,cbk);
        }
    ],function(err) {
        if(err) {
            console.error('failed sending notification to user');
            console.error(err);
            console.trace();
        }
        else
            console.log('email ' + notification.type + ' sent to ' + email);
    });
};

exports.create_user_vote_or_grade_notification = function(notification_type, entity_id, user_id, notificatior_id,
                                                        sub_entity, vote_for_or_against, did_change_the_sugg_agreement, is_on_suggestion, callback){
    async.waterfall([

        function(cbk){
            notification_type = notification_type + "";
            models.Notification.findOne({type: notification_type, entity_id: entity_id,user_id: user_id, seen: false}, cbk);
        },

        function(noti, cbk){
            if(noti){

                //this tow lines tries to prevant a bug that i dont understand
                if(!noti.user_id){
                    console.log("user id wasnt in noti in create_user_vote_or_grade_notification!")
                    noti.user_id = user_id;
                }
                var date = Date.now();

                var notificator = _.find(noti.notificators, function(notificator){return notificator.notificator_id + "" == notificatior_id + ""});
                if(notificator){
                    if(did_change_the_sugg_agreement){
                        notificator.ballance += vote_for_or_against == "add" ? 2 : -2;
                        if(is_on_suggestion){
                            notificator.votes_for +=  vote_for_or_against == "add" ? 1 : -1;
                            notificator.votes_against += vote_for_or_against == "add" ? -1 : 1;
                        }
                    }
                    else{
                        notificator.ballance += vote_for_or_against == "add" ? 1 : -1;
                        if(is_on_suggestion){
                            notificator.votes_for += vote_for_or_against == "add" ? 1 : 0;
                            notificator.votes_against += vote_for_or_against == "add" ? 0 : 1;

                        }
                    }
                }else{
                    var new_notificator = {
                        notificator_id: notificatior_id,
                        sub_entity_id: sub_entity,
                        ballance: vote_for_or_against == "add" ? 1 : -1,
                        votes_for : vote_for_or_against == "add" && is_on_suggestion ? 1 : 0,
                        votes_against : vote_for_or_against == "add" && is_on_suggestion ? 0 : 1
                    }
                    noti.entity_id = entity_id,

                    noti.notificators.push(new_notificator);
                }
                noti.update_date = date;
                noti.save(function(err, obj){
                        cbk(err, obj);
                })
            }else{
                var notification = new models.Notification();
                var notificator = {
                    notificator_id: notificatior_id,
                    sub_entity_id: sub_entity,
                    ballance: vote_for_or_against == "add" ? 1 : -1,
                    votes_for : vote_for_or_against == "add" && is_on_suggestion ? 1 : 0,
                    votes_against : vote_for_or_against == "add" && is_on_suggestion ? 0 : 1
                }

                if (!user_id)
                    console.log("user id wasnt in noti in create_user_vote_or_grade_notification!")

                notification.user_id = user_id;
                notification.notificators = notificator;
                notification.type = notification_type;
                notification.entity_id = entity_id;
                notification.seen = false;
                notification.update_date = new Date();

                notification.save(function(err, obj){
                    cbk(err, obj);
                    if(!err && obj)
                        sendNotificationToUser(obj);
                });
            }
        }
    ], function(err, obj){
        callback(err, obj);
    })
}

exports.update_user_notification = function (notification_type, obj_id,user, callback){



}

function isSubEntityExist(notification, sub_entity){
        return _.any(notification.notificators, function(noti){ return noti.sub_entity_id + "" == sub_entity + ""});
}


if(/notifications\.js/.test(process.argv[1])) {
    var app = require('../app');

    setTimeout(function() {
        create_new_notification('comment_on_discussion_you_are_part_of',
            '4fc5e851ed6e970100000311','4f7c53e9afe34d0100000006','4f45145968766b0100000002','4ffecd7c5600ec0100001757',function(err) {
                console.log(err);
            });
    },1000);
}