
var common = require('./../common')
    models = require('../../models'),
    async = require('async');

var OpinionShaperResource = module.exports = common.GamificationMongooseResource.extend(
    {
        init:function () {
            this._super(models.OpinionShaper, null, null);
            this.allowed_methods = ['get'];
            this.authentication = new common.SessionAuthentication();
            this.fields = common.user_public_fields;
        }
    }
)
