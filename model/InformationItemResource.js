/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 15/02/12
 * Time: 17:15
 * To change this template use File | Settings | File Templates.
 */

var resources = require('jest'),
    util = require('util'),
    models = require('../models'),
    common = require('./common');

var InformationItemResource = module.exports = function()
{
    InformationItemResource.super_.call(this,models.InformationItem);
    this.allowed_methods = ['get','post'];
    this.authentication = new common.SessionAuthentication();
    this.filtering = {tags:null, subject_id:null, title:null, text_field:null, users:null, is_hot:null};
    this.default_query = function(query)
    {
        return query.where('is_visible',true).sort('creation_date','descending');
    };
    //this.validation = new resources.Validation();
};
util.inherits(InformationItemResource,resources.MongooseResource);
