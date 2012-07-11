
var jest = require('jest')
    ,models = require('../models')
    ,common = require('./common')
    ,async = require('async')
    ,_ = require('underscore');

var FbConnect = module.exports =  jest.Resource.extend({

        init:function () {
            this._super();
            this.allowed_methods = ['get', 'post'];
            this.authentication = new common.SessionAuthentication();
        }


    }
)
