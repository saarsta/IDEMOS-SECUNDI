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

    },

    get_objects: function (req, filters, sorts, limit, offset, callback) {

        var user_id = req.query.user_id;
        if(!user_id && req.user)
            user_id = req.user._id;

        if(user_id)
            filters['user_id'] = user_id;

        this._super(req, filters, sorts, limit, offset, callback);
    }
});