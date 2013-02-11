var jest = require('jest'),
    models = require('../models'),
    common = require('./common'),
    _ = require('underscore');

var UserMailNotificationConfig = module.exports = jest.MongooseResource.extend({
    init: function(){
        this._super(models.User, null);
        this.fields = _.extend({mail_notification_configuration: null},common.user_public_fields);
        this.update_fields = {mail_notification_configuration:null};
        this.allowed_methods = ['get', 'put'];
    },

    update_obj:function(req,object,callback){
        var mail_notification_configuration = req.body;
        // i'm implementing it because of a terrible bug i can't understand in mongoose, that's why i'm using mongo
        models.User.update({_id:object._id},{$set: mail_notification_configuration},function(err){
            callback(err,{});
        });
    }
})