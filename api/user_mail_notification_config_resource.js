var jest = require('jest'),
    models = require('../models'),
    common = require('./common'),
    _ = require('underscore');

var UserMailNotificationConfig = module.exports = jest.MongooseResource.extend({
    init:function () {
        this._super(models.User, null);
        this.fields = _.extend({mail_notification_configuration:null, discussions:null}, common.user_public_fields);
        this.update_fields = {discussions:null, mail_notification_configuration:null};
        this.allowed_methods = ['get', 'put'];
    },

    update_obj:function (req, object, callback) {
        var mail_settings = req.body;

        // i'm implementing it because of a terrible bug i can't understand in mongoose, that's why i'm using mongo

        // update user
        models.User.update({_id:object.id}, {$set:mail_settings}, function (err) {
                callback(err, {});
        });
    }
})
