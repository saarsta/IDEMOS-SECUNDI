/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 06/03/12
 * Time: 17:23
 * To change this template use File | Settings | File Templates.
 */


var resources = require('jest'),
    util = require('util'),
    models = require('../models'),
    common = require('./common');


var ActionResource = module.exports = function(){

    ActionResource.super_.call(this, models.Action);
    this.allowed_methods = ['get', 'post', 'put'];
    this.filtering = {category: null};
    this.authentication = common.SessionAuthentication();
}

