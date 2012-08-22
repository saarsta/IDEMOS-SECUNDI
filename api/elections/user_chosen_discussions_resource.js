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

    get_objects:function(req, filters, sorts, limit, offset, callback){
        var data = {}
            data.user_id = req.query.user_id;
        if(data.user_id)
            getUserChosenDiscussions(req, data, callback);
        else
            callback
    }
});
