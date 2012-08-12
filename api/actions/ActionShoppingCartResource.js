
var resources = require('jest'),
    util = require('util'),
    models = require('../../models'),
    common = require('../common.js');


var Authorization = resources.Authorization.extend({
    limit_object_list:function (req, query, callback) {
        var id = req.query.action_id;
        query.where('actions', id);
        callback(null, query);
    }
});

var ActionShoppingCartResource = module.exports = common.GamificationMongooseResource.extend({

    init:function () {
        this._super(models.InformationItem, null, 0);
        this.allowed_methods = ['get'];
        this.authentication = new common.SessionAuthentication();
        this.authorization = new Authorization();
        this.default_query = function(query)
        {
            return query.where('is_visible',true).sort({creation_date:'descending'});
        };
    }
});