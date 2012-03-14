/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 13/03/12
 * Time: 16:22
 * To change this template use File | Settings | File Templates.
 */


var jest = require('jest'),
    util = require('util'),
    models = require('../models'),
    common = require('./common'),
    async = require('async'),
    CYCLE_PRICE = 1;

var CycleResource = module.exports = jest.MongooseResource.extend({
    init: function(){
        this._super(models.Cycle, 'cycle');
        this.allowed_methods = ['get', 'post'];
//        this.authorization =
    }
});
