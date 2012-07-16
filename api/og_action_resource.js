
var jest = require('jest')
    ,common = require('./common')
    ,models = require('../models')
    ,og_action = require('../og/og').doAction
    ,_ = require('underscore');


var OGActionResource = module.exports = jest.Resource.extend({
    init:function() {
        this._super();

        this.allowed_methods = ['post'];

        this.fields = {

        };

        this.update_fields = {
            action:null,
            object_url : null,
            object_name: null
        };

    },

    create_obj : function(req,fields,callback) {
        fields.fid = req.user.facebook_id;

        og_action(fields,callback);
    }
});

