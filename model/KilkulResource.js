
var common = require('./common')
    models = require('../models');

var KilkulResource = module.exports = common.GamificationMongooseResource.extend(
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
