/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 15/03/12
 * Time: 15:58
 * To change this template use File | Settings | File Templates.
 */


var resources = require('jest'),
    util = require('util'),
    models = require('../models'),
    common = require('./common');



var CategoryResource = module.exports = resources.MongooseResource.extend(
{
    init: function(){
        this._super(models.Category);
        this.allowed_methods = ['get', 'post'];
        this.authentication = new common.SessionAuthentication();
        this.update_fields = {name: null};
//        this.authorization = new common.TokenAuthorization();
    }
});