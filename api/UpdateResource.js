/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 24/04/12
 * Time: 18:04
 * To change this template use File | Settings | File Templates.
 */

var common = require('./common'),
    models = require('../models'),
    jest = require('jest');

var UpdateResource = module.exports = jest.MongooseResource.extend(
    {
        init:function () {
            this._super(models.Update, null, null);
            this.allowed_methods = ['get'];
            this.authentication = new common.SessionAuthentication();
            this.filtering = {cycles: null};
            this.default_query = function (query) {
                return query.where('is_visible', true).sort('creation_date', 'descending');
            };
        }
    }
)
