
var resources = require('jest'),
    util = require('util'),
    models = require('../../models'),
    common = require('../common.js'),
    async = require('async');


var ActionResourceResource = module.exports = common.GamificationMongooseResource.extend({
    init: function(){
        this._super(models.ActionResource, null, 0);
        this.allowed_methods = ['get', 'post'];
        this.filtering = {category: null};
        this.authentication = new common.SessionAuthentication();
    },

    create_obj: function(req, fields, callback){
        var object = new this.model();

        fields.is_approved = false;
        for (var field in fields) {
            object.set(field, fields[field]);
        }

        this._super(req, fields, callback);
    }
});
