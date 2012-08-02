
var common = require('./common')
models = require('../models'),
    async = require('async');

var ElectionsResource = module.exports = common.GamificationMongooseResource.extend(
    {
        init:function () {
            this._super(models.Elections, null, null);
            this.allowed_methods = ['get'];
            this.authentication = new common.SessionAuthentication();
        }
    }
)
