/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 13/05/12
 * Time: 13:19
 * To change this template use File | Settings | File Templates.
 */

models = require('../models');


exports.create_user_notification = function (notification_type, entity_id,user_id, callback){

    var notification = new models.Notification();

    notification.user_id = user_id;
    notification.type = notification_type;
    notification.entity_id = entity_id;
    notification.seen = false;
    notification.update_date = new Date();
}

exports.update_user_notification = function (notification_type, obj_id,user, callback){



}