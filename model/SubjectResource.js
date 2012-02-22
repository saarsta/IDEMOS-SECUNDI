/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 16/02/12
 * Time: 11:00
 * To change this template use File | Settings | File Templates.
 */

var resources = require('jest'),
    util = require('util'),
    models = require('../models'),
    common = require('./common');



var MemoryCache  = function() {
    this.mem = {};
};
util.inherits(MemoryCache,resources.Cache);

MemoryCache.prototype.get = function(key,callback)
{
    callback(null,this.mem[key]);
};

MemoryCache.prototype.set = function(key,value,callback)
{
    this.mem[key] = value;
    callback();
};

var subject_cache = new MemoryCache();

function clear_cache()
{
    subject_cache.mem = {};
}

var SubjectResource = module.exports = function()
{
    SubjectResource.super_.call(this,models.Subject);
    this.allowed_methods = ['get','post'];
//    this.authentication = new common.SessionAuthentication();
    this.filtering = {tags:null};
    this.cache = subject_cache;
    //this.validation = new resources.Validation();
};
util.inherits(SubjectResource,resources.MongooseResource);

