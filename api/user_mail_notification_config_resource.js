var jest = require('jest'),
    models = require('../models'),
    common = require('./common'),
    _ = require('underscore');

var UserMailNotificationConfig = module.exports = jest.MongooseResource.extend({
    init:function () {
        this._super(models.User, null);
        this.fields = _.extend({mail_notification_configuration:null, discussions:null}, common.user_public_fields);
        //this.update_fields = {discussions:null, mail_notification_configuration:null};
        this.allowed_methods = ['get', 'put'];
    },

    update_obj:function (req, object, callback) {
        var mail_settings = req.body;

        // i'm implementing it because of a terrible bug i can't understand in mongoose
        models.User.findById(object.id, function(err, user){

            if(req.body.discussions){

                // try to fix it later
                /*var json_user = JSON.parse(JSON.stringify(user));
                var mail_settings = JSON.parse(JSON.stringify(req.body));
                var bka = _.extend(json_user, mail_settings);*/

                var exist_discussion = _.find(user.discussions, function(discussion){ return (discussion.discussion_id + "" == mail_settings.discussions[0].discussion_id + "")});
                if (exist_discussion){
                    if(typeof mail_settings.discussions[0].get_alert_of_comments != "undefined")
                        exist_discussion._doc.get_alert_of_comments = mail_settings.discussions[0].get_alert_of_comments === 'true';
                    if(typeof mail_settings.discussions[0].get_alert_of_suggestions != "undefined")
                        exist_discussion._doc.get_alert_of_suggestions = mail_settings.discussions[0].get_alert_of_suggestions === 'true';
                    if(typeof mail_settings.discussions[0].get_alert_of_approved_suggestions != "undefined")
                        exist_discussion._doc.get_alert_of_approved_suggestions = mail_settings.discussions[0].get_alert_of_approved_suggestions === 'true';
                } else{
                    user.discussions.push(mail_settings.discussions[0]);
                }

                // update user
                models.User.update({_id:object.id}, {$set: {discussions: user.discussions}}, function (err) {
                    callback(err, {});
                });
            }else{
                // update user
                models.User.update({_id:object.id}, {$set: mail_settings}, function (err) {
                    callback(err, {});
                });
            }
        })


    }
})
