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

        this._super(req, filters, sorts, limit, offset, function(err, results){

            var new_results = {};
            new_results.meta = results.meta;
            new_results.objects = [];

            _.each(results.objects, function(obj){if (obj.user_id + "" == req.user._id + "") new_results.objects.push(obj)});;
            new_results.meta.total_count = new_results.objects.length;

            callback(err, new_results);
        })
    }
});