/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 24/04/12
 * Time: 14:52
 * To change this template use File | Settings | File Templates.
 */

var common = require('./common'),
    models = require('../models');

var SuccessStoryResource = module.exports = common.GamificationMongooseResource.extend(
    {
        init:function () {
            this._super(models.SuccessStory, null, null);
            this.allowed_methods = ['get'];
            this.authentication = new common.SessionAuthentication();
//            this.filtering = {};
            this.default_query = function (query) {
                return query.where('is_visible', true).sort('creation_date', 'descending');
            };
        }
    }
)