


var jest = require('jest')
    ,common = require('./common')
    ,fs = require('fs')
    ,util = require('util')
    ,path = require('path')
    ,models = require('../models');

var ResetNotificationResource = module.exports = jest.Resource.extend({
    init:function() {
            this._super();
            this.allowed_methods = ['post'];
            this.authentication = new common.SessionAuthentication();
            this.authorization = new jest.Authorization();
            this.update_fields = {
        };
    },

    create_obj: function(req,fields,callback) {
        var self = this;
        var user_id = req.user.id;

        models.Notification.update({user_id: user_id, seen: false}, {$set:{seen: true}}, {multi: true}, function(err, result){
            if(err){
                console.error(err);
            }
            callback(err);
        })
    }
});
