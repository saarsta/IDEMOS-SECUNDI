
var common = require('./common')
models = require('../models'),
    async = require('async');

var FaceResource = module.exports = jest.Resource.extend(
    {
        init:function () {
            this._super(models.ElectionsText, null, null);
            this.allowed_methods = ['get'];
        }
    }
)
