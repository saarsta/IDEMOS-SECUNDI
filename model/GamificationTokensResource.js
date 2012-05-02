/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 02/05/12
 * Time: 13:51
 * To change this template use File | Settings | File Templates.
 */


var common = require('./common'),
    models = require('../models'),
    jest = require('jest');

var GamificationTokensResource = module.exports = jest.MongooseResource.extend(
    {
        init:function () {
            this._super(models.GamificationTokens, null, null);
            this.allowed_methods = ['get'];
//            this.authentication = new common.SessionAuthentication();
        }
    }
)