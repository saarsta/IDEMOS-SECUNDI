/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 23/02/12
 * Time: 12:03
 * To change this template use File | Settings | File Templates.
 */

var resources = require('jest'),
    util = require('util'),
    models = require('../models'),
    common = require('./common');


var PostResource = module.exports = function(){

    PostResource.super_.call(this,models.Post);
    this.allowed_methods = ['get','post','put','delete'];
    this.authentication = new common.SessionAuthentication();
    this.filtering = {discussion_id: null};
    this.default_query = function(query)
    {
        return query.sort('creation_date','descending');
    };
//    this.validation = new resources.Validation();=
}

util.inherits(PostResource, resources.MongooseResource);

