
var resources = require('jest'),
    util = require('util'),
    models = require('../../models'),
    common = require('../common.js');


var ActionResourceResource = module.exports = function(){

    ActionResourceResource.super_.call(this, models.ActionResource);
    this.allowed_methods = ['get', 'post'];
    this.filtering = {category: null};
    this.authentication = new common.SessionAuthentication();
        //    this.autorization = new authoriztion();
}

util.inherits(ActionResourceResource, resources.MongooseResource);

