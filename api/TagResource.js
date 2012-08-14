/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 01/04/12
 * Time: 13:58
 * To change this template use File | Settings | File Templates.
 */
jest = require('jest'),
    util = require('util'),
    models = require('../models'),
    common = require('./common'),
    async = require('async');

var TagResource = module.exports = jest.MongooseResource.extend({
    init:function(){
        this._super(models.Tag);
        this.allowed_methods = ['get'];
        this.filtering = {
            tag: {
                exact:null,
                in:null,
                regex:null,
                contains:null,
                startswith:null,
                endswith:null
            },
            popularity: {
                gte:null,
                gt:null,
                lte:null,
                lt:null
            }
        };

        this.default_query = function (query) {
            return query.sort({'popularity': 'descending',tag:1});
        };
    }
});