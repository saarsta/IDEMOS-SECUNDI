var resources = require('jest'),
    util = require('util'),
    models = require('../models'),
    common = require('./common');

var NotificationCategoryResource = module.exports = resources.MongooseResource.extend(
{
    init: function(){
        this._super(models.Notification);
        this.allowed_methods = ['get', 'put'];
        this.authentication = new common.SessionAuthentication();
        this.update_fields = {name: null};
    }
});