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


exports.create_user_notification = function(notification_type, entity_id, user_id, notificatior_id, sub_entity, url, callback){

    var single_notification_arr = [
        "been_quoted",
        "approved_info_item_i_created",
        "approved_change_suggestion_you_created",
        "approved_change_suggestion_you_graded",
        "proxy_created_new_discussion",
        "proxy_created_change_suggestion"
    ];

    if(notificatior_id && _.indexOf(single_notification_arr, notification_type) == -1){

        async.waterfall([

            function(cbk){
                notification_type = notification_type + "";
                if(entity_id)
                    models.Notification.findOne({type: notification_type, entity_id: entity_id, user_id: user_id}, function(err , obj){
                        cbk(err, obj);
                    });
                else
                    models.Notification.findOne({type: notification_type, user_id: user_id}, function(err , obj){
                        cbk(err, obj);
                    });
            },

            function(noti, cbk){
                if(noti){
                    noti.seen = false;

                    var date = Date.now();
                    var last_update_date = noti.update_date;


                    //TODO change it later to something prettier
                    if((notification_type == 'comment_on_discussion_you_are_part_of' || notification_type == "comment_on_discussion_you_created") &&
                        _.any(noti.notificators,  function(notificator){return notificator.notificator_id + "" == notificatior_id + ""})) {
                        var new_notificator = {
                            notificator_id: notificatior_id,
                            sub_entity_id: sub_entity
                        }
                        noti.notificators.push(new_notificator);
                        noti.update_date = date;
                        noti.save();
                        cbk(null, 0);
                    }else if(_.any(noti.notificators,  function(notificator){return notificator.notificator_id + "" == notificatior_id + ""})) {
                       noti.update_date = date;
                       noti.save();
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
                       });
                   }
                   sendNotificationToUser(noti, last_update_date);
                }else{
                    create_new_notification(notification_type, entity_id, user_id, notificatior_id, sub_entity, url, function(err, obj){
                        cbk(err, obj);
                    });
                }
            }
        ], function(err, obj){
            callback(err, obj);
        })
    }else{
        create_new_notification(notification_type, entity_id, user_id, notificatior_id, sub_entity, url, function(err, obj){
            callback(err, obj);
        });
    }
};

exports.create_user_proxy_vote_or_grade_notification = function(notification_type, entity_id, user_id, notificatior_id, sub_entity, is_agree, grade_or_balance, callback){

    async.waterfall([

        function(cbk){
            notification_type = notification_type + "";
            models.Notification.findOne({type: notification_type, "entity_id": entity_id, user_id: user_id}, cbk);
        },

        function(noti, cbk){
            if(noti){

                if(notification_type == "proxy_graded_change_suggestion")
                    noti.notificators[0].ballance = is_agree ? 1 : -1;
                else
                    noti.notificators[0].ballance = grade_or_balance;

                var last_update_date = noti.update_date;
                noti.update_date = Date.now();
                noti.seen = false;

                if(notification_type == "proxy_vote_to_post" && noti.notificators[0].ballance == 0){
                    noti.remove(function(err, obj){
                        cbk(err, obj);
                    })
                }else{
                    noti.save(function(err, obj){
                        cbk(err, obj);
                        sendNotificationToUser(noti, last_update_date);
                    });
                }

            }
            else{
                var notification = new models.Notification();
                var balance;
                if(notification_type == "proxy_graded_change_suggestion")
                    balance = is_agree ? 1 : -1;
                else
                    balance = grade_or_balance;

                var notificator = {
                    notificator_id: notificatior_id,
                    sub_entity_id: sub_entity,
                    ballance: balance
                }

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
};

var create_new_notification = function(notification_type, entity_id, user_id, notificatior_id, sub_entity_id, url, callback){

    var notification = new models.Notification();
    var notificator = {
        notificator_id: notificatior_id,
        sub_entity_id: sub_entity_id
    };

    notification.user_id = user_id;
    notification.notificators = notificator;
    notification.type = notification_type;
    notification.entity_id = entity_id;
    notification.url = url;
    notification.seen = false;
    notification.update_date = new Date();

    notification.save(function(err, obj){
//        callback(null, 0);
        callback(err, obj);
        if(!err && obj)
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
var sendNotificationToUser = function(notification, last_update_date) {
    /**
     * Waterfall:
     * 1) Get user email
     * 2) Checks if user should be notified, populate references by notification type
     * 3) create text message
     * 4) send message
     */
    var email;
    async.waterfall([
        // TODO finish this
        function(cbk){
            if(!notification.visited) {
                console.log('user should not receive notification because he or she have not visited since');
                cbk('break');
                return;
            }
            cbk();
        },
        // 1) Get user email
        function(cbk) {
            models.User.findById(notification.user_id._doc ? notification.user_id.id : notification.user_id,cbk);
        },
        // 2) populate references by notification type
        function(user, cbk) {
            if(!user){
                cbk("user not found");
		        return;
            }
//            // if the user hasn't visited since the last notification was sent, dont send another one, cut's the waterfall
//            if(last_update_date && user.last_visit < last_update_date) {
//                console.log('user should not receive notification because he or she have not visited since');
//                cbk('break');
//                return;
//            }
            // TODO check in account settings if sending mails is allowed
            email = user.email;
            notificationResource.populateNotifications({objects:[notification]},cbk);
        },
        // 3) create text message
        function(results,cbk) {
            var notification = results.objects[0];
            notification.entity_name = notification.name || '';
            notification.description_of_notificators = notification.description_of_notificators || '';
            notification.message_of_notificators = notification.message_of_notificators || '';
            templates.renderTemplate('notifications/' + notification.type, notification, cbk);
        },
        // 4) send message
        function(message,cbk) {
            mail.sendMailFromTemplate(email,message,cbk);
        }
    ],
        // Final)
        function(err) {
            if(err) {
                if(err != 'break') {
                    console.error('failed sending notification to user');
                    console.error(err);
                    console.trace();
                }
            }
            else {
                console.log('email ' + notification.type + ' sent to ' + email);
                // TODO finish this
                notification.visited = false;
                notification.save(function(err){
                    if(err) {
                        console.error('saving notification flag failed');
                    }
                });

            }
        });
};

exports.create_user_vote_or_grade_notification = function(notification_type, entity_id, user_id, notificatior_id,
                                                        sub_entity, vote_for_or_against, did_change_the_sugg_agreement, is_on_suggestion, url, callback){
    async.waterfall([

        function(cbk){
            notification_type = notification_type + "";
            models.Notification.findOne({type: notification_type, entity_id: entity_id,user_id: user_id}, function(err, result){
                cbk(err, result)
            });
        },

        function(noti, cbk){
            if(noti){

                noti.seen = false;
                //this tow lines tries to prevant a bug that i dont understand
                if(!noti.user_id){
                    console.log("user id wasnt in noti in create_user_vote_or_grade_notification!");
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
                    noti.entity_id = entity_id;

                    noti.notificators.push(new_notificator);
                }

                //when user votes to post and get to balance 0, i delete this notification
                if((notification_type == "user_gave_my_post_tokens" || notification_type == "user_gave_my_post_bad_tokens")
                    && (notificator ? notificator.ballance == 0 : false)){
                    noti.remove(function(err, result){
                        cbk(err, result);
                    })
                }else{
                    var last_update_date = noti.update_date;
                    noti.update_date = date;
                    noti.save(function(err, obj){
                        cbk(err, obj);
                        if(!err && obj)
                            sendNotificationToUser(obj, last_update_date);
                    })
                }
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
                notification.url = url;
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

exports.update_user_notification = function (notification_type, obj_id, user, callback){


}

exports.updateVisited = function(user,url) {
    models.Notification.update({user_id:user._id, url:url},{$set:{visited:true}},{multi:true},function(err) {
        if(err) {
            console.error('failed setting notification visited to true', err);
        }
    })
};

function isSubEntityExist(notification, sub_entity){
        return _.any(notification.notificators, function(noti){ return noti.sub_entity_id + "" == sub_entity + ""});
}

/*
if(/notifications\.js/.test(process.argv[1])) {
    var app = require('../app');

    console.log('testing');
    //function(notification_type, entity_id, user_id, notificatior_id, sub_entity_id, callback){

    setTimeout(function() {
        create_new_notification('comment_on_discussion_you_are_part_of',
           // '4fc5e851ed6e970100000311','4f7c53e9afe34d0100000006','4f45145968766b0100000002','4ffecd7c5600ec0100001757',function(err) {
            '4fe6db00f9e35fd00800146b','4ff1b29aabf64e440f00013a','4f45145968766b0100000002','4ffecd7c5600ec0100001757',function(err) {

                console.log(err);
            });

//        models.Notification.find({})
//            .sort({'update_date':-1})
//            .populate('user_id')
//            .limit(1)
//            .exec(function(err,nots) {
//                if(!nots[0].user_id.last_visit) {
//                    nots[0].user_id.last_visit = Date.now();
//                    nots[0].user_id.save();
//                }
//
//                var first_update_date = new Date(Number(nots[0].user_id.last_visit || Date.now()) - 60000);
//                var second_update_date = new Date(Number(first_update_date) + 1600000);
//
//                sendNotificationToUser(nots[0],first_update_date);
//
//                sendNotificationToUser(nots[0],second_update_date);
//            });

    },1000);
}*/


//approved_info_item_i_created
if(/notifications\.js/.test(process.argv[1])) {
    var app = require('../app');

    console.log('testing');
    //function(notification_type, entity_id, user_id, notificatior_id, sub_entity_id, callback){
    //4f90064e360b9b01000000ac --info item
    //4fcdf7180a381201000005b3 --disc

    //a_dicussion_created_with_info_item_that_you_created
  //  sub //4fce400ccdd0570100000216

    //501fcef1e6ae520017000662 --הצעה לשינוי שהתקבלה
    setTimeout(function() {

        create_new_notification('comment_on_discussion_you_created',
            '4fcdf7180a381201000005b3','4ff1b29aabf64e440f00013a','4f45145968766b0100000002','501fcef1e6ae520017000662',function(err) {


                console.log(err);
            });

//        models.Notification.find({})
//            .sort({'update_date':-1})
//            .populate('user_id')
//            .limit(1)
//            .exec(function(err,nots) {
//                if(!nots[0].user_id.last_visit) {
//                    nots[0].user_id.last_visit = Date.now();
//                    nots[0].user_id.save();
//                }
//
//                var first_update_date = new Date(Number(nots[0].user_id.last_visit || Date.now()) - 60000);
//                var second_update_date = new Date(Number(first_update_date) + 1600000);
//
//                sendNotificationToUser(nots[0],first_update_date);
//
//                sendNotificationToUser(nots[0],second_update_date);
//            });

    },1000);
}