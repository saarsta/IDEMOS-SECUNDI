
var common = require('.././common')
    models = require('../../models'),
    async = require('async'),
    jest = require('jest');

var DiscussionHistoryResource = module.exports =  jest.MongooseResource.extend({
    init:function () {
        this._super(models.DiscussionHistory, null, null);
        this.allowed_methods = ['get'];
        this.filtering = {discussion_id: null};
        this.authentication = new common.SessionAuthentication();
        this.default_query = function (query) {
            return query.where.sort({date: 'descending'});
        };
        this.fields = {
            discussion_id: null,
            date: null,
            text_field: null,
            grade: null
        }
    }

})
