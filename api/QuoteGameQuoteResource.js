
var common = require('./common')
models = require('../models'),
    async = require('async');

var QuoteGameQuoteResource = module.exports = jest.MongooseResource.extend(
    {
        init:function () {
            this._super(models.QuoteGameQuote, null, null);
            this.allowed_methods = ['get'];
            //this.authentication = new common.SessionAuthentication();
            //this.filtering = {cycle: null};
            this.default_query = function (query) {
                return query.where('is_visible', true).sort({rank: 'descending'});
            };
        }
    });
