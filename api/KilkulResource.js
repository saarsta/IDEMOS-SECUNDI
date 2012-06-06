
var common = require('./common')
    models = require('../models'),
    async = require('async');

var KilkulResource = module.exports = common.GamificationMongooseResource.extend(
    {
        init:function () {
            this._super(models.Kilkul, null, null);
            this.allowed_methods = ['get', 'post'];
            this.authentication = new common.SessionAuthentication();
//            this.filtering = {};
            this.default_query = function (query) {
                return query.where('is_visible', true).sort('creation_date', 'descending');
            };
        },

        create_obj: function(req, fields, callback){
            var self = this;
            var user = req.user;
            var kilkul_object = new self.model();

            fields.user = user._id;
            fields.user_name = user.username;
            fields.title = "uru - did you forget to put a place for me?"
            self._super(req, fields, callback);
        }
    }


)
