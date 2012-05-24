/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 16/02/12
 * Time: 11:00
 * To change this template use File | Settings | File Templates.
 */

var resources = require('jest'),
    models = require('../models'),
    common = require('./common');

var SubjectResource = module.exports = resources.MongooseResource.extend({
    init:function(){
        this._super(models.Subject);
        this.allowed_methods = ['get'];
        this.filtering = {tags:null};
        this.max_limit = 7;
    }
});