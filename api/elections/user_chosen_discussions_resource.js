var jest = require('jest')
    ,models = require('../../models')
    ,common = require('./../common')
    ,async = require('async')
    ,getUserChosenDiscussions = require('../../deliver/routes/elections/fbimage').getUserChosenDiscussions
    ,_ = require('underscore');

var UserChosenDiscussionsResource = module.exports =  jest.Resource.extend({

    init:function () {
        this._super();
        this.allowed_methods = ['get'];
        this.update_fields = {
            user_id:null
        };
    },

    get_object:getUserChosenDiscussions
});
