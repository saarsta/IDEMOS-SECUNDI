/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 13/05/12
 * Time: 13:19
 * To change this template use File | Settings | File Templates.
 */

models = require('../models'),
async = require('async'),
_ = require('underscore');


exports.create_user_notification = function (notification_type, entity_id, user_id, notificatior_id, sub_entity, callback){

    if(notificatior_id){

        async.waterfall([

            function(cbk){
                notification_type = notification_type + "";
                models.Notification.findOne({type: notification_type, user_id: user_id}, cbk);
            },

            function(noti, cbk){
                if(noti){
                    var date = Date.now();
//                    it doesnt work !!!
//                    models.Notification.update({id: noti._id}, {$addToSet: {notificators: notificatior_id}, $set:{update_date: Date.now()}}, function(err, num){
//                        cbk(err, num);
//                    });

                   if(_.any(noti.notificators,  function(notificator){notificator.notificator_id == notificatior_id})) {
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
    }

    notification.user_id = user_id;
    notification.notificators = notificator;
    notification.type = notification_type;
    notification.entity_id = entity_id;
    notification.seen = false;
    notification.update_date = new Date();

    notification.save(function(err, obj){
        callback(err, obj);
    });
}


exports.update_user_notification = function (notification_type, obj_id,user, callback){



}